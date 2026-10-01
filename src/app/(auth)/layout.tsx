import Image from "next/image";
import { Quote } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { ThemeToggle } from "@/components/shared/theme-toggle";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[1fr_1.1fr]">
      <aside className="relative hidden overflow-hidden bg-zinc-950 lg:block">
        <Image
          src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=1400&q=80"
          alt=""
          fill
          priority
          sizes="45vw"
          className="object-cover opacity-45"
        />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-primary/30" />
        <div className="relative flex h-full flex-col justify-between p-10 text-white">
          <Logo className="text-white" />
          <figure className="max-w-md space-y-4">
            <Quote className="size-8 text-primary" aria-hidden />
            <blockquote className="text-2xl leading-snug font-medium text-balance">
              Every candidate gets the same questions, the same clock and the same rubric. That&apos;s what makes the
              shortlist defensible.
            </blockquote>
            <figcaption className="text-sm text-white/70">The principle behind CodeAssess</figcaption>
          </figure>
        </div>
      </aside>

      <div className="flex flex-col">
        <header className="flex items-center justify-between px-4 py-4 sm:px-8">
          <Logo className="lg:invisible" />
          <ThemeToggle />
        </header>
        <main id="main" className="flex flex-1 items-start justify-center px-4 pt-4 pb-12 sm:px-8 lg:items-center">
          <div className="w-full max-w-md">{children}</div>
        </main>
      </div>
    </div>
  );
}
