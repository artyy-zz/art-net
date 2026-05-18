"use client";

import { useActionState } from "react";
import { createQuoteRequestAction } from "@/actions/public";
import type { QuoteRequestActionState } from "@/actions/public";
import { SubmitButton } from "@/components/shared/submit-button";
import type { Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const inputClassName =
  "w-full rounded-[22px] border border-black/10 bg-white/92 px-4 py-3 text-sm text-[var(--color-foreground)] outline-none transition placeholder:text-[var(--color-muted)] focus:border-[var(--color-accent)] focus:ring-4 focus:ring-[rgba(0,107,150,0.12)]";

export function QuoteForm({ locale }: { locale: Locale }) {
  const [state, formAction] = useActionState<QuoteRequestActionState | undefined, FormData>(
    createQuoteRequestAction.bind(null, locale),
    undefined,
  );

  return (
    <form action={formAction} className="space-y-5">
      <label className="space-y-2 text-sm">
        <span className="font-medium text-[var(--color-foreground)]">
          {locale === "sq" ? "Detajet e kërkesës" : "Request details"}
        </span>
        <textarea
          name="details"
          required
          rows={7}
          defaultValue={state?.fields?.details ?? ""}
          className={cn(inputClassName, "resize-none")}
          placeholder={
            locale === "sq"
              ? "P.sh. rrjet për zyrë, kamera sigurie, kabllim, Wi-Fi, doorbell smart..."
              : "For example: office network, security cameras, cabling, Wi-Fi, smart doorbell..."
          }
        />
      </label>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2 text-sm">
          <span className="font-medium text-[var(--color-foreground)]">
            {locale === "sq" ? "Emri" : "Name"}
          </span>
          <input
            name="name"
            required
            defaultValue={state?.fields?.name ?? ""}
            className={inputClassName}
          />
        </label>
        <label className="space-y-2 text-sm">
          <span className="font-medium text-[var(--color-foreground)]">
            {locale === "sq" ? "Telefoni" : "Phone number"}
          </span>
          <input
            name="phone"
            defaultValue={state?.fields?.phone ?? ""}
            className={inputClassName}
          />
        </label>
      </div>
      <label className="space-y-2 text-sm">
        <span className="font-medium text-[var(--color-foreground)]">Email</span>
        <input
          type="email"
          name="email"
          defaultValue={state?.fields?.email ?? ""}
          className={inputClassName}
        />
      </label>
      <p className="text-xs leading-5 text-[var(--color-muted)]">
        {locale === "sq"
          ? "Shënoni të paktën telefonin ose email-in."
          : "Enter at least a phone number or an email."}
      </p>
      {state?.error ? (
        <p className="rounded-2xl bg-[rgba(180,35,42,0.09)] px-4 py-3 text-sm text-[var(--color-danger)]">
          {state.error}
        </p>
      ) : null}
      <SubmitButton>{locale === "sq" ? "Dërgo kërkesën" : "Send request"}</SubmitButton>
    </form>
  );
}
