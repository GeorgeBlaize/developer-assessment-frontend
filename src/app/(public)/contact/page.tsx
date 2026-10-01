import type { Metadata } from "next";
import { Clock, Mail, MessageSquare } from "lucide-react";
import { ContactForm } from "@/components/marketing/contact-form";
import { CONTACT_EMAIL } from "@/components/marketing/contact-email";

export const metadata: Metadata = {
  title: "Contact",
  description: "Questions about plans, demos or your account? Get in touch with the CodeAssess team.",
  openGraph: { title: "Contact CodeAssess", url: "/contact" },
};

export default function ContactPage() {
  return (
    <div className="mx-auto grid max-w-6xl gap-12 px-4 py-16 sm:px-6 md:py-24 lg:grid-cols-[1fr_1.2fr]">
      <div className="space-y-6">
        <p className="text-sm font-semibold tracking-wider text-primary uppercase">Contact</p>
        <h1 className="text-4xl font-semibold tracking-tight text-balance">Talk to us</h1>
        <p className="text-lg text-muted-foreground">
          Planning a hiring round, need a larger plan, or stuck on something? Send us a note.
        </p>
        <ul className="space-y-4 text-sm">
          <li className="flex gap-3">
            <Mail className="mt-0.5 size-5 text-primary" aria-hidden />
            <div>
              <p className="font-medium">Email</p>
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-muted-foreground hover:text-foreground">
                {CONTACT_EMAIL}
              </a>
            </div>
          </li>
          <li className="flex gap-3">
            <Clock className="mt-0.5 size-5 text-primary" aria-hidden />
            <div>
              <p className="font-medium">Response time</p>
              <p className="text-muted-foreground">Within one business day (Sun–Thu, Dhaka time)</p>
            </div>
          </li>
          <li className="flex gap-3">
            <MessageSquare className="mt-0.5 size-5 text-primary" aria-hidden />
            <div>
              <p className="font-medium">Candidates</p>
              <p className="text-muted-foreground">Questions about a specific assessment? Contact the company that invited you.</p>
            </div>
          </li>
        </ul>
      </div>
      <ContactForm />
    </div>
  );
}
