import type { ReactNode } from "react";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";

interface FormFieldProps {
  label: string;
  htmlFor: string;
  error?: string;
  description?: ReactNode;
  required?: boolean;
  children: ReactNode;
  className?: string;
}

/**
 * Label + control + description + error, wired for accessibility. Controls should set
 * `aria-invalid` and `aria-describedby={`${id}-error`}` (see `fieldA11y`).
 */
export function FormField({ label, htmlFor, error, description, required, children, className }: FormFieldProps) {
  return (
    <Field data-invalid={error ? true : undefined} className={className}>
      <FieldLabel htmlFor={htmlFor}>
        {label}
        {required ? (
          <span aria-hidden className="text-destructive">
            *
          </span>
        ) : null}
      </FieldLabel>
      {children}
      {description && !error ? <FieldDescription id={`${htmlFor}-description`}>{description}</FieldDescription> : null}
      {error ? <FieldError id={`${htmlFor}-error`}>{error}</FieldError> : null}
    </Field>
  );
}

/** Accessibility props for a control rendered inside <FormField>. */
export function fieldA11y(id: string, error?: string) {
  return {
    id,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": error ? `${id}-error` : `${id}-description`,
  } as const;
}
