import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Client } from "@/lib/kyc/types";
import { ClientForm } from "@/components/ClientForm";
import { updateClientAction } from "@/app/clients/actions";

export default async function EditClientPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const supabase = await createClient();
  const { data: client } = await supabase
    .from("clients")
    .select("*")
    .eq("id", id)
    .maybeSingle<Client>();

  if (!client) notFound();

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight mb-6">Edit {client.full_name}</h1>
      <ClientForm action={updateClientAction} defaultValues={client} error={error} submitLabel="Save Changes" />
    </div>
  );
}
