import type { Metadata } from "next";

import { GeneratePageClient } from "./GeneratePageClient";

export const metadata: Metadata = {
  title: "Generate recipes with AI",
  description: "Create personalized recipes from ingredients or cravings",
};

export default function Page() {
  return <GeneratePageClient />;
}
