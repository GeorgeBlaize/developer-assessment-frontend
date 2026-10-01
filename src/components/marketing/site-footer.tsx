import Link from "next/link";
import { Logo } from "@/components/shared/logo";
import { APP_NAME } from "@/lib/config";

const COLUMNS = [
  {
    title: "Product",
    links: [
      { href: "/features", label: "Features" },
      { href: "/pricing", label: "Pricing" },
      { href: "/register", label: "Create an account" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About" },
      { href: "/contact", label: "Contact" },
      { href: "/pricing#faq", label: "FAQ" },
    ],
  },
  {
    title: "Get started",
    links: [
      { href: "/login", label: "Log in" },
      { href: "/register?role=COMPANY", label: "Hire developers" },
      { href: "/register?role=CANDIDATE", label: "Take assessments" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div className="space-y-3">
          <Logo />
          <p className="max-w-xs text-sm text-muted-foreground">
            Skills-first technical hiring. Build assessments, invite candidates and make decisions on evidence, not
            résumés.
          </p>
        </div>
        {COLUMNS.map((col) => (
          <div key={col.title} className="space-y-3">
            <h2 className="text-sm font-semibold">{col.title}</h2>
            <ul className="space-y-2">
              {col.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t">
        <p className="mx-auto max-w-6xl px-4 py-5 text-xs text-muted-foreground sm:px-6">
          © {new Date().getFullYear()} {APP_NAME}. Payments processed securely by SSLCommerz.
        </p>
      </div>
    </footer>
  );
}
