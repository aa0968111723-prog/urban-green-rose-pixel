import type { Tracking } from "../types.ts";
import { sanitizeTrackingValue } from "./validation.ts";

export function emptyTracking(): Tracking {
  return { source: "", utmSource: "", utmMedium: "", utmCampaign: "" };
}

export function parseTracking(search: string): Tracking {
  const params = new URLSearchParams(search.startsWith("?") ? search : `?${search}`);
  return {
    source: sanitizeTrackingValue(params.get("source") ?? ""),
    utmSource: sanitizeTrackingValue(params.get("utm_source") ?? ""),
    utmMedium: sanitizeTrackingValue(params.get("utm_medium") ?? ""),
    utmCampaign: sanitizeTrackingValue(params.get("utm_campaign") ?? ""),
  };
}

export function readTrackingFromWindow(): Tracking {
  if (typeof window === "undefined") return emptyTracking();
  return parseTracking(window.location.search);
}
