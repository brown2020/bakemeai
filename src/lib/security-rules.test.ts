import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { GENERATION_QUOTA } from "@/lib/utils/generation-quota";

const root = resolve(fileURLToPath(new URL("../..", import.meta.url)));
const firestoreRules = readFileSync(resolve(root, "firestore.rules"), "utf8");
const storageRules = readFileSync(resolve(root, "storage.rules"), "utf8");
const indexes = JSON.parse(
  readFileSync(resolve(root, "firestore.indexes.json"), "utf8")
) as {
  indexes: Array<{
    collectionGroup: string;
    fields: Array<{ fieldPath: string; order: string }>;
  }>;
};

describe("firestore and storage rules", () => {
  it("keeps the generation quota numbers aligned with the client writer", () => {
    expect(firestoreRules).toContain("match /generationRateLimits/{userId}");
    expect(firestoreRules).toContain("allow delete: if false");
    expect(firestoreRules).toContain(
      `resource.data.count < ${GENERATION_QUOTA.maxRequests}`
    );
    expect(firestoreRules).toContain(String(GENERATION_QUOTA.windowMs));
    expect(firestoreRules).toContain(String(GENERATION_QUOTA.clockSkewMs));
  });

  it("requires timestamps and per-item string bounds on writes", () => {
    expect(firestoreRules).toContain("d.createdAt is timestamp");
    expect(firestoreRules).toContain("d.updatedAt is timestamp");
    expect(firestoreRules).toContain("itemOk(d.ingredients, 99, 1000)");
    expect(firestoreRules).toContain("itemOk(d.instructions, 99, 5000)");
    expect(firestoreRules).toContain("itemOk(d.tips, 49, 2000)");
    expect(firestoreRules).toContain("itemOk(d.allergies, 49, 200)");
  });

  it("indexes saved recipes by owner and newest first", () => {
    expect(indexes.indexes).toEqual([
      {
        collectionGroup: "recipes",
        queryScope: "COLLECTION",
        fields: [
          { fieldPath: "userId", order: "ASCENDING" },
          { fieldPath: "createdAt", order: "DESCENDING" },
        ],
      },
    ]);
  });

  it("limits storage uploads to small images and still allows owner deletes", () => {
    expect(storageRules).toContain("allow read: if isOwner(userId);");
    expect(storageRules).toContain("allow delete: if isOwner(userId);");
    expect(storageRules).toContain(
      "allow create, update: if isOwner(userId) && isAllowedImage();"
    );
    expect(storageRules).toContain("5 * 1024 * 1024");
    expect(storageRules).toContain("image/(jpeg|png|gif|webp)");
  });
});
