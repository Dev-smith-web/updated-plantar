import { randomBytes } from "crypto";

/** Generate a URL-safe random ID (16 bytes = 22 chars base64url) */
export function createId(): string {
  return randomBytes(16).toString("base64url");
}
