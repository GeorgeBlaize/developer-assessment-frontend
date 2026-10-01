"use client";

import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { useSignIn } from "@/hooks/use-sign-in";
import { getErrorMessage } from "@/lib/api/errors";
import { GOOGLE_CLIENT_ID } from "@/lib/config";

interface GoogleSignInProps {
  /** Role for first-time Google users (existing accounts keep their role). */
  role?: "COMPANY" | "CANDIDATE";
  next?: string | null;
  text?: "signin_with" | "signup_with" | "continue_with";
}

/**
 * Google Identity Services button. The ID token is verified by the backend (POST /auth/google).
 * Loaded with next/dynamic so the Google SDK is only fetched on the auth pages.
 */
export default function GoogleSignIn({ role, next, text = "continue_with" }: GoogleSignInProps) {
  const { resolvedTheme } = useTheme();
  const signIn = useSignIn<{ idToken: string; role?: "COMPANY" | "CANDIDATE" }>("/api/auth/google", { next });

  if (!GOOGLE_CLIENT_ID) return null;

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div className="flex justify-center [&_iframe]:!w-full">
        <GoogleLogin
          text={text}
          width="400"
          shape="rectangular"
          theme={resolvedTheme === "dark" ? "filled_black" : "outline"}
          onSuccess={({ credential }) => {
            if (!credential) return toast.error("Google did not return a credential. Please try again.");
            signIn.mutate({ idToken: credential, role }, { onError: (e) => toast.error(getErrorMessage(e)) });
          }}
          onError={() => toast.error("Google sign-in was cancelled or failed.")}
        />
      </div>
    </GoogleOAuthProvider>
  );
}
