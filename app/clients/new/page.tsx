import { ClientForm } from "@/components/ClientForm";
import { createClientAction } from "@/app/clients/actions";

export default async function NewClientPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight mb-6">Add Client</h1>
      <ClientForm action={createClientAction} error={error} submitLabel="Create Client" />
    </div>
  );
}
