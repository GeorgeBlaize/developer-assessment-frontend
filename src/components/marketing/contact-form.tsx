"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FormField, fieldA11y } from "@/components/shared/form-field";
import { CONTACT_EMAIL } from "./contact-email";

const TOPICS = ["Sales & plans", "Billing", "Technical support", "Partnerships"] as const;

const contactSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name"),
  email: z.string().trim().email("Enter a valid email address"),
  topic: z.enum(TOPICS, { required_error: "Choose a topic" }),
  message: z.string().trim().min(20, "Tell us a little more (at least 20 characters)").max(2000, "Keep it under 2000 characters"),
});
type ContactInput = z.infer<typeof contactSchema>;

/**
 * Validated contact form. There is no messaging endpoint in the API, so on submit it opens the
 * visitor's email client with the message pre-filled rather than pretending to send it.
 */
export function ContactForm() {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ContactInput>({ resolver: zodResolver(contactSchema), mode: "onTouched" });

  const onSubmit = (values: ContactInput) => {
    const subject = encodeURIComponent(`[${values.topic}] Message from ${values.name}`);
    const body = encodeURIComponent(`${values.message}\n\n— ${values.name} <${values.email}>`);
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
    toast.success("Opening your email app with the message ready to send.");
    reset();
  };

  return (
    <Card className="gap-0 p-6 sm:p-8">
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField label="Name" htmlFor="contact-name" error={errors.name?.message} required>
            <Input {...fieldA11y("contact-name", errors.name?.message)} autoComplete="name" {...register("name")} />
          </FormField>
          <FormField label="Email" htmlFor="contact-email" error={errors.email?.message} required>
            <Input
              {...fieldA11y("contact-email", errors.email?.message)}
              type="email"
              autoComplete="email"
              {...register("email")}
            />
          </FormField>
        </div>
        <FormField label="Topic" htmlFor="contact-topic" error={errors.topic?.message} required>
          <Select
            value={watch("topic") ?? ""}
            onValueChange={(v) => setValue("topic", v as ContactInput["topic"], { shouldValidate: true })}
          >
            <SelectTrigger {...fieldA11y("contact-topic", errors.topic?.message)} className="w-full">
              <SelectValue placeholder="What's this about?" />
            </SelectTrigger>
            <SelectContent>
              {TOPICS.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
        <FormField label="Message" htmlFor="contact-message" error={errors.message?.message} required>
          <Textarea {...fieldA11y("contact-message", errors.message?.message)} rows={6} {...register("message")} />
        </FormField>
        <Button type="submit" size="lg" className="w-full sm:w-auto">
          <Send /> Send message
        </Button>
      </form>
    </Card>
  );
}
