import {
  ClipboardList,
  CreditCard,
  FilePlus2,
  GraduationCap,
  LayoutDashboard,
  Mail,
  ScrollText,
  Trophy,
  UserCircle,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import type { Role } from "@/types/api";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Match only the exact path (for section roots like /admin). */
  exact?: boolean;
}

export interface NavSection {
  title?: string;
  items: NavItem[];
}

/** Each role sees only its own navigation. Routes are additionally guarded by middleware. */
export const NAVIGATION: Record<Role, NavSection[]> = {
  ADMIN: [
    {
      items: [{ href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true }],
    },
    {
      title: "Manage",
      items: [
        { href: "/admin/users", label: "Users", icon: Users },
        { href: "/admin/plans", label: "Plans", icon: Wallet },
        { href: "/admin/audit-logs", label: "Audit logs", icon: ScrollText },
      ],
    },
    { title: "Account", items: [{ href: "/admin/profile", label: "Profile & security", icon: UserCircle }] },
  ],
  COMPANY: [
    {
      items: [{ href: "/company", label: "Overview", icon: LayoutDashboard, exact: true }],
    },
    {
      title: "Hiring",
      items: [
        { href: "/company/assessments", label: "Assessments", icon: ClipboardList },
        { href: "/company/assessments/new", label: "New assessment", icon: FilePlus2, exact: true },
      ],
    },
    {
      title: "Account",
      items: [
        { href: "/company/billing", label: "Billing & plans", icon: CreditCard },
        { href: "/company/profile", label: "Company profile", icon: UserCircle },
      ],
    },
  ],
  CANDIDATE: [
    {
      items: [{ href: "/candidate", label: "Overview", icon: LayoutDashboard, exact: true }],
    },
    {
      title: "Assessments",
      items: [
        { href: "/candidate/invitations", label: "Invitations", icon: Mail },
        { href: "/candidate/results", label: "My results", icon: Trophy },
      ],
    },
    { title: "Account", items: [{ href: "/candidate/profile", label: "Profile", icon: UserCircle }] },
  ],
};

export const ROLE_BADGE_ICON: Record<Role, LucideIcon> = {
  ADMIN: ScrollText,
  COMPANY: ClipboardList,
  CANDIDATE: GraduationCap,
};

export function isNavItemActive(pathname: string, item: NavItem) {
  if (item.exact) return pathname === item.href;
  if (pathname === item.href) return true;
  // "/company/assessments/new" shouldn't also light up "Assessments".
  return pathname.startsWith(`${item.href}/`) && !pathname.endsWith("/new");
}
