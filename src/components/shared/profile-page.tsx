import { PageHeader } from "@/components/shared/page-header";
import { ChangePasswordForm } from "./change-password-form";
import { ProfileForm } from "./profile-form";

/** Profile & security page shared by every role; fields adapt to the signed-in role. */
export function ProfilePage({ title = "Profile & security" }: { title?: string }) {
  return (
    <div className="space-y-6">
      <PageHeader title={title} description="Manage your details and keep your account secure." />
      <ProfileForm />
      <ChangePasswordForm />
    </div>
  );
}
