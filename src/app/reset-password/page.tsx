import type { Metadata } from "next";

import { ResetPasswordPageClient } from "./ResetPasswordPageClient";

export const metadata: Metadata = {
  title: "Reset password",
  description: "Reset your Bake.me account password",
};

export default function Page() {
  return <ResetPasswordPageClient />;
}
