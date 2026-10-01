import type { Metadata } from "next";
import { ProfilePage } from "@/components/shared/profile-page";

export const metadata: Metadata = { title: "Company profile" };

export default function CompanyProfilePage() {
  return <ProfilePage title="Company profile" />;
}
