import type { Metadata } from "next";
import { Logo } from "@/components/shared/logo";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function PaymentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-dvh flex-col items-center overflow-hidden px-4 py-10">
      <div aria-hidden className="bg-grid absolute inset-0 [mask-image:radial-gradient(ellipse_at_top,black_25%,transparent_70%)]" />
      <Logo href="/company" className="relative mb-10" />
      <main id="main" className="relative w-full max-w-lg">
        {children}
      </main>
    </div>
  );
}
