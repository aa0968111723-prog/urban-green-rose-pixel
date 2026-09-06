import { randomBytes } from "node:crypto";
import { taipeiDateStamp } from "../../features/leader-quiz/lib/time.ts";

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function createSubmissionId(date = new Date()): string {
  const bytes = randomBytes(5);
  let suffix = "";
  for (const byte of bytes) suffix += ALPHABET[byte % ALPHABET.length];
  return `LQ-${taipeiDateStamp(date)}-${suffix}`;
}

export function createDrawId(date = new Date()): string {
  const bytes = randomBytes(4);
  let suffix = "";
  for (const byte of bytes) suffix += ALPHABET[byte % ALPHABET.length];
  return `DR-${taipeiDateStamp(date)}-${suffix}`;
}

export function maskPhone(phone: string): string {
  if (!/^09\d{8}$/.test(phone)) return "09******";
  return `${phone.slice(0, 4)}****${phone.slice(8)}`;
}
