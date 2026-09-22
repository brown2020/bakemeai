import type { Metadata } from "next";

import { SavedPageClient } from "./SavedPageClient";

export const metadata: Metadata = {
  title: "Saved recipes",
  description: "Your personal Bake.me recipe library",
};

export default function Page() {
  return <SavedPageClient />;
}
