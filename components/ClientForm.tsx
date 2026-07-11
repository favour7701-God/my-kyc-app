import type { Client } from "@/lib/kyc/types";

export function ClientForm({
  action,
  defaultValues,
  error,
  submitLabel,
}: {
  action: (formData: FormData) => void | Promise<void>;
  defaultValues?: Partial<Client>;
  error?: string;
  submitLabel: string;
}) {
  const v = defaultValues ?? {};
  return (
    <form action={action} className="space-y-6 max-w-2xl">
      {v.id && <input type="hidden" name="id" defaultValue={v.id} />}

      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 text-red-800 text-sm px-4 py-3">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <Field label="Full name *" name="full_name" defaultValue={v.full_name ?? ""} required />
        <Field label="Entity type" name="entity_type" defaultValue={v.entity_type ?? "individual"} as="select">
          <option value="individual">Individual</option>
          <option value="corporate">Corporate</option>
        </Field>

        <Field label="Date of birth" name="date_of_birth" type="date" defaultValue={v.date_of_birth ?? ""} />
        <Field label="Nationality" name="nationality" defaultValue={v.nationality ?? ""} />

        <Field label="Email" name="email" type="email" defaultValue={v.email ?? ""} />
        <Field label="Phone" name="phone" defaultValue={v.phone ?? ""} />

        <Field label="Address line 1" name="address_line1" defaultValue={v.address_line1 ?? ""} />
        <Field label="City" name="address_city" defaultValue={v.address_city ?? ""} />
        <Field label="Country" name="address_country" defaultValue={v.address_country ?? ""} />

        <Field label="KYC stage" name="kyc_stage" defaultValue={v.kyc_stage ?? "not_started"} as="select">
          <option value="not_started">Not started</option>
          <option value="pending_docs">Pending docs</option>
          <option value="in_review">In review</option>
          <option value="approved">Approved</option>
          <option value="flagged">Flagged</option>
        </Field>
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1">Notes</label>
        <textarea
          name="notes"
          defaultValue={v.notes ?? ""}
          rows={3}
          className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
        />
      </div>

      <button
        type="submit"
        className="rounded-md bg-neutral-900 text-white px-4 py-2 text-sm font-medium hover:bg-neutral-800"
      >
        {submitLabel}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  defaultValue,
  type = "text",
  required = false,
  as,
  children,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  type?: string;
  required?: boolean;
  as?: "select";
  children?: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-neutral-700 mb-1">{label}</label>
      {as === "select" ? (
        <select
          name={name}
          defaultValue={defaultValue}
          className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm bg-white"
        >
          {children}
        </select>
      ) : (
        <input
          type={type}
          name={name}
          defaultValue={defaultValue}
          required={required}
          className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
        />
      )}
    </div>
  );
}
