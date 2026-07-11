"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient as createSupabaseClient } from "@/lib/supabase/server";
import { logActivity, recalcAndTouchClient } from "@/lib/kyc/activity";
import { logAuditEntry } from "@/lib/kyc/audit";
import { requireUser, actorNameFor } from "@/lib/auth/session";

function emptyToNull(value: FormDataEntryValue | null): string | null {
  const str = String(value ?? "").trim();
  return str === "" ? null : str;
}

function clientPayloadFromForm(formData: FormData) {
  return {
    full_name: String(formData.get("full_name") ?? "").trim(),
    date_of_birth: emptyToNull(formData.get("date_of_birth")),
    nationality: emptyToNull(formData.get("nationality")),
    email: emptyToNull(formData.get("email")),
    phone: emptyToNull(formData.get("phone")),
    address_line1: emptyToNull(formData.get("address_line1")),
    address_city: emptyToNull(formData.get("address_city")),
    address_country: emptyToNull(formData.get("address_country")),
    entity_type: String(formData.get("entity_type") ?? "individual"),
    kyc_stage: String(formData.get("kyc_stage") ?? "not_started"),
    notes: emptyToNull(formData.get("notes")),
  };
}

export async function createClientAction(formData: FormData) {
  const supabase = await createSupabaseClient();
  const user = await requireUser(supabase, "/clients/new");

  const payload = clientPayloadFromForm(formData);

  if (!payload.full_name) {
    redirect(`/clients/new?error=${encodeURIComponent("Full name is required")}`);
  }

  const { data, error } = await supabase
    .from("clients")
    .insert({ ...payload, user_id: user.id })
    .select("*")
    .single();

  if (error || !data) {
    redirect(`/clients/new?error=${encodeURIComponent(error?.message ?? "Failed to create client")}`);
  }

  const actorName = actorNameFor(user);
  await logActivity(supabase, {
    clientId: data.id,
    actorName,
    action: `created client ${payload.full_name}`,
    objectType: "client",
    objectId: data.id,
  });
  await logAuditEntry(supabase, {
    actorName,
    action: "create_client",
    tableName: "clients",
    objectId: data.id,
    afterValue: data,
  });
  await recalcAndTouchClient(supabase, data.id);

  revalidatePath("/clients");
  revalidatePath("/");
  redirect(`/clients/${data.id}`);
}

export async function updateClientAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const supabase = await createSupabaseClient();
  const user = await requireUser(supabase, id ? `/clients/${id}/edit` : "/clients");

  const payload = clientPayloadFromForm(formData);

  if (!id) {
    redirect(`/clients?error=${encodeURIComponent("Missing client id")}`);
  }
  if (!payload.full_name) {
    redirect(`/clients/${id}/edit?error=${encodeURIComponent("Full name is required")}`);
  }

  const { data: before } = await supabase.from("clients").select("*").eq("id", id).single();
  const { data: after, error } = await supabase.from("clients").update(payload).eq("id", id).select("*").single();

  if (error) {
    redirect(`/clients/${id}/edit?error=${encodeURIComponent(error.message)}`);
  }

  const actorName = actorNameFor(user);
  await logActivity(supabase, {
    clientId: id,
    actorName,
    action: `updated client details for ${payload.full_name}`,
    objectType: "client",
    objectId: id,
  });
  await logAuditEntry(supabase, {
    actorName,
    action: "update_client",
    tableName: "clients",
    objectId: id,
    beforeValue: before,
    afterValue: after,
  });
  await recalcAndTouchClient(supabase, id);

  revalidatePath("/clients");
  revalidatePath(`/clients/${id}`);
  revalidatePath("/");
  redirect(`/clients/${id}`);
}

async function afterClientChange(supabase: Awaited<ReturnType<typeof createSupabaseClient>>, clientId: string) {
  await recalcAndTouchClient(supabase, clientId);
  revalidatePath("/clients");
  revalidatePath(`/clients/${clientId}`);
  revalidatePath("/");
}

export async function addDocumentAction(formData: FormData) {
  const clientId = String(formData.get("client_id") ?? "");
  const supabase = await createSupabaseClient();
  const user = await requireUser(supabase, clientId ? `/clients/${clientId}` : "/clients");

  const documentType = String(formData.get("document_type") ?? "").trim();
  const status = String(formData.get("status") ?? "pending");
  const expiryDate = emptyToNull(formData.get("expiry_date"));

  if (!clientId) redirect(`/clients?error=${encodeURIComponent("Missing client id")}`);
  if (!documentType) {
    redirect(`/clients/${clientId}?error=${encodeURIComponent("Document type is required")}`);
  }

  const { data, error } = await supabase
    .from("kyc_documents")
    .insert({
      client_id: clientId,
      document_type: documentType,
      status,
      expiry_date: expiryDate,
      user_id: user.id,
    })
    .select("*")
    .single();

  if (error) {
    redirect(`/clients/${clientId}?error=${encodeURIComponent(error.message)}`);
  }

  const actorName = actorNameFor(user);
  await logActivity(supabase, {
    clientId,
    actorName,
    action: `added document ${documentType} (${status})`,
    objectType: "kyc_document",
    objectId: data?.id,
  });
  await logAuditEntry(supabase, {
    actorName,
    action: "create_document",
    tableName: "kyc_documents",
    objectId: data?.id,
    afterValue: data,
  });
  await afterClientChange(supabase, clientId);
  redirect(`/clients/${clientId}`);
}

export async function updateDocumentStatusAction(formData: FormData) {
  const clientId = String(formData.get("client_id") ?? "");
  const supabase = await createSupabaseClient();
  const user = await requireUser(supabase, clientId ? `/clients/${clientId}` : "/clients");

  const documentId = String(formData.get("document_id") ?? "");
  const status = String(formData.get("status") ?? "pending");
  const rejectionReason = emptyToNull(formData.get("rejection_reason"));

  if (!clientId || !documentId) {
    redirect(`/clients?error=${encodeURIComponent("Missing document reference")}`);
  }

  const { data: before } = await supabase.from("kyc_documents").select("*").eq("id", documentId).single();
  const { data: after, error } = await supabase
    .from("kyc_documents")
    .update({
      status,
      rejection_reason: status === "rejected" ? rejectionReason : null,
      verified_at: status === "verified" ? new Date().toISOString() : null,
    })
    .eq("id", documentId)
    .select("*")
    .single();

  if (error) {
    redirect(`/clients/${clientId}?error=${encodeURIComponent(error.message)}`);
  }

  const actorName = actorNameFor(user);
  await logActivity(supabase, {
    clientId,
    actorName,
    action: `marked document ${after?.document_type ?? ""} as ${status}`,
    objectType: "kyc_document",
    objectId: documentId,
  });
  await logAuditEntry(supabase, {
    actorName,
    action: "update_document_status",
    tableName: "kyc_documents",
    objectId: documentId,
    beforeValue: before,
    afterValue: after,
  });
  await afterClientChange(supabase, clientId);
  redirect(`/clients/${clientId}`);
}

export async function addCheckAction(formData: FormData) {
  const clientId = String(formData.get("client_id") ?? "");
  const supabase = await createSupabaseClient();
  const user = await requireUser(supabase, clientId ? `/clients/${clientId}` : "/clients");

  const checkType = String(formData.get("check_type") ?? "").trim();
  const status = String(formData.get("status") ?? "pending");
  const notes = emptyToNull(formData.get("notes"));

  if (!clientId) redirect(`/clients?error=${encodeURIComponent("Missing client id")}`);
  if (!checkType) {
    redirect(`/clients/${clientId}?error=${encodeURIComponent("Check type is required")}`);
  }

  const { data, error } = await supabase
    .from("kyc_checks")
    .insert({
      client_id: clientId,
      check_type: checkType,
      status,
      notes,
      checked_at: status === "pending" ? null : new Date().toISOString(),
      user_id: user.id,
    })
    .select("*")
    .single();

  if (error) {
    redirect(`/clients/${clientId}?error=${encodeURIComponent(error.message)}`);
  }

  const actorName = actorNameFor(user);
  await logActivity(supabase, {
    clientId,
    actorName,
    action: `added check ${checkType} (${status})`,
    objectType: "kyc_check",
    objectId: data?.id,
  });
  await logAuditEntry(supabase, {
    actorName,
    action: "create_check",
    tableName: "kyc_checks",
    objectId: data?.id,
    afterValue: data,
  });
  await afterClientChange(supabase, clientId);
  redirect(`/clients/${clientId}`);
}

export async function updateCheckResultAction(formData: FormData) {
  const clientId = String(formData.get("client_id") ?? "");
  const supabase = await createSupabaseClient();
  const user = await requireUser(supabase, clientId ? `/clients/${clientId}` : "/clients");

  const checkId = String(formData.get("check_id") ?? "");
  const status = String(formData.get("status") ?? "pending");
  const notes = emptyToNull(formData.get("notes"));

  if (!clientId || !checkId) {
    redirect(`/clients?error=${encodeURIComponent("Missing check reference")}`);
  }

  const { data: before } = await supabase.from("kyc_checks").select("*").eq("id", checkId).single();
  const { data: after, error } = await supabase
    .from("kyc_checks")
    .update({
      status,
      notes,
      checked_at: status === "pending" ? null : new Date().toISOString(),
    })
    .eq("id", checkId)
    .select("*")
    .single();

  if (error) {
    redirect(`/clients/${clientId}?error=${encodeURIComponent(error.message)}`);
  }

  const actorName = actorNameFor(user);
  await logActivity(supabase, {
    clientId,
    actorName,
    action: `marked check ${after?.check_type ?? ""} as ${status}`,
    objectType: "kyc_check",
    objectId: checkId,
  });
  await logAuditEntry(supabase, {
    actorName,
    action: "update_check_status",
    tableName: "kyc_checks",
    objectId: checkId,
    beforeValue: before,
    afterValue: after,
  });
  await afterClientChange(supabase, clientId);
  redirect(`/clients/${clientId}`);
}

export async function assignReviewerAction(formData: FormData) {
  const clientId = String(formData.get("client_id") ?? "");
  const supabase = await createSupabaseClient();
  const user = await requireUser(supabase, clientId ? `/clients/${clientId}` : "/clients");

  const reviewerId = emptyToNull(formData.get("assigned_reviewer_id"));

  if (!clientId) redirect(`/clients?error=${encodeURIComponent("Missing client id")}`);

  const { data: before } = await supabase.from("clients").select("*").eq("id", clientId).single();
  const { data: after, error } = await supabase
    .from("clients")
    .update({ assigned_reviewer_id: reviewerId })
    .eq("id", clientId)
    .select("*, team_members(full_name)")
    .single();

  if (error) {
    redirect(`/clients/${clientId}?error=${encodeURIComponent(error.message)}`);
  }

  const reviewerName = (after as unknown as { team_members: { full_name: string } | null })?.team_members?.full_name;
  const actorName = actorNameFor(user);

  await logActivity(supabase, {
    clientId,
    actorName,
    action: reviewerName ? `assigned reviewer ${reviewerName}` : "unassigned reviewer",
    objectType: "client",
    objectId: clientId,
  });
  await logAuditEntry(supabase, {
    actorName,
    action: "assign_reviewer",
    tableName: "clients",
    objectId: clientId,
    beforeValue: before,
    afterValue: after,
  });
  await afterClientChange(supabase, clientId);
  redirect(`/clients/${clientId}`);
}

export async function updateNotesAction(formData: FormData) {
  const clientId = String(formData.get("client_id") ?? "");
  const supabase = await createSupabaseClient();
  const user = await requireUser(supabase, clientId ? `/clients/${clientId}` : "/clients");

  const notes = emptyToNull(formData.get("notes"));

  if (!clientId) redirect(`/clients?error=${encodeURIComponent("Missing client id")}`);

  const { data: before } = await supabase.from("clients").select("*").eq("id", clientId).single();
  const { data: after, error } = await supabase
    .from("clients")
    .update({ notes })
    .eq("id", clientId)
    .select("*")
    .single();

  if (error) {
    redirect(`/clients/${clientId}?error=${encodeURIComponent(error.message)}`);
  }

  const actorName = actorNameFor(user);
  await logActivity(supabase, {
    clientId,
    actorName,
    action: "updated notes",
    objectType: "client",
    objectId: clientId,
  });
  await logAuditEntry(supabase, {
    actorName,
    action: "update_notes",
    tableName: "clients",
    objectId: clientId,
    beforeValue: before,
    afterValue: after,
  });
  await afterClientChange(supabase, clientId);
  redirect(`/clients/${clientId}`);
}
