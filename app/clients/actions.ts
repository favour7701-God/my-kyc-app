"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient as createSupabaseClient } from "@/lib/supabase/server";
import { logActivity, recalcAndTouchClient } from "@/lib/kyc/activity";

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
  const payload = clientPayloadFromForm(formData);

  if (!payload.full_name) {
    redirect(`/clients/new?error=${encodeURIComponent("Full name is required")}`);
  }

  const supabase = await createSupabaseClient();
  const { data, error } = await supabase
    .from("clients")
    .insert(payload)
    .select("id")
    .single();

  if (error || !data) {
    redirect(`/clients/new?error=${encodeURIComponent(error?.message ?? "Failed to create client")}`);
  }

  await logActivity(supabase, {
    clientId: data.id,
    action: `created client ${payload.full_name}`,
    objectType: "client",
    objectId: data.id,
  });
  await recalcAndTouchClient(supabase, data.id);

  revalidatePath("/clients");
  revalidatePath("/");
  redirect(`/clients/${data.id}`);
}

export async function updateClientAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const payload = clientPayloadFromForm(formData);

  if (!id) {
    redirect(`/clients?error=${encodeURIComponent("Missing client id")}`);
  }
  if (!payload.full_name) {
    redirect(`/clients/${id}/edit?error=${encodeURIComponent("Full name is required")}`);
  }

  const supabase = await createSupabaseClient();
  const { error } = await supabase.from("clients").update(payload).eq("id", id);

  if (error) {
    redirect(`/clients/${id}/edit?error=${encodeURIComponent(error.message)}`);
  }

  await logActivity(supabase, {
    clientId: id,
    action: `updated client details for ${payload.full_name}`,
    objectType: "client",
    objectId: id,
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
  const documentType = String(formData.get("document_type") ?? "").trim();
  const status = String(formData.get("status") ?? "pending");
  const expiryDate = emptyToNull(formData.get("expiry_date"));

  if (!clientId) redirect(`/clients?error=${encodeURIComponent("Missing client id")}`);
  if (!documentType) {
    redirect(`/clients/${clientId}?error=${encodeURIComponent("Document type is required")}`);
  }

  const supabase = await createSupabaseClient();
  const { error } = await supabase.from("kyc_documents").insert({
    client_id: clientId,
    document_type: documentType,
    status,
    expiry_date: expiryDate,
  });

  if (error) {
    redirect(`/clients/${clientId}?error=${encodeURIComponent(error.message)}`);
  }

  await logActivity(supabase, {
    clientId,
    action: `added document ${documentType} (${status})`,
    objectType: "kyc_document",
  });
  await afterClientChange(supabase, clientId);
  redirect(`/clients/${clientId}`);
}

export async function updateDocumentStatusAction(formData: FormData) {
  const clientId = String(formData.get("client_id") ?? "");
  const documentId = String(formData.get("document_id") ?? "");
  const status = String(formData.get("status") ?? "pending");
  const rejectionReason = emptyToNull(formData.get("rejection_reason"));

  if (!clientId || !documentId) {
    redirect(`/clients?error=${encodeURIComponent("Missing document reference")}`);
  }

  const supabase = await createSupabaseClient();
  const { data: doc, error } = await supabase
    .from("kyc_documents")
    .update({
      status,
      rejection_reason: status === "rejected" ? rejectionReason : null,
      verified_at: status === "verified" ? new Date().toISOString() : null,
    })
    .eq("id", documentId)
    .select("document_type")
    .single();

  if (error) {
    redirect(`/clients/${clientId}?error=${encodeURIComponent(error.message)}`);
  }

  await logActivity(supabase, {
    clientId,
    action: `marked document ${doc?.document_type ?? ""} as ${status}`,
    objectType: "kyc_document",
    objectId: documentId,
  });
  await afterClientChange(supabase, clientId);
  redirect(`/clients/${clientId}`);
}

export async function addCheckAction(formData: FormData) {
  const clientId = String(formData.get("client_id") ?? "");
  const checkType = String(formData.get("check_type") ?? "").trim();
  const status = String(formData.get("status") ?? "pending");
  const notes = emptyToNull(formData.get("notes"));

  if (!clientId) redirect(`/clients?error=${encodeURIComponent("Missing client id")}`);
  if (!checkType) {
    redirect(`/clients/${clientId}?error=${encodeURIComponent("Check type is required")}`);
  }

  const supabase = await createSupabaseClient();
  const { error } = await supabase.from("kyc_checks").insert({
    client_id: clientId,
    check_type: checkType,
    status,
    notes,
    checked_at: status === "pending" ? null : new Date().toISOString(),
  });

  if (error) {
    redirect(`/clients/${clientId}?error=${encodeURIComponent(error.message)}`);
  }

  await logActivity(supabase, {
    clientId,
    action: `added check ${checkType} (${status})`,
    objectType: "kyc_check",
  });
  await afterClientChange(supabase, clientId);
  redirect(`/clients/${clientId}`);
}

export async function updateCheckResultAction(formData: FormData) {
  const clientId = String(formData.get("client_id") ?? "");
  const checkId = String(formData.get("check_id") ?? "");
  const status = String(formData.get("status") ?? "pending");
  const notes = emptyToNull(formData.get("notes"));

  if (!clientId || !checkId) {
    redirect(`/clients?error=${encodeURIComponent("Missing check reference")}`);
  }

  const supabase = await createSupabaseClient();
  const { data: check, error } = await supabase
    .from("kyc_checks")
    .update({
      status,
      notes,
      checked_at: status === "pending" ? null : new Date().toISOString(),
    })
    .eq("id", checkId)
    .select("check_type")
    .single();

  if (error) {
    redirect(`/clients/${clientId}?error=${encodeURIComponent(error.message)}`);
  }

  await logActivity(supabase, {
    clientId,
    action: `marked check ${check?.check_type ?? ""} as ${status}`,
    objectType: "kyc_check",
    objectId: checkId,
  });
  await afterClientChange(supabase, clientId);
  redirect(`/clients/${clientId}`);
}
