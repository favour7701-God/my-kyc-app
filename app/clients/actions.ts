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
