import type { Dimension } from "../types.ts";

/** Local SVG constants (not user input) for result badges. */
export const BADGE_SVG: Record<Dimension, string> = {
  vision: `<svg viewBox="0 0 108 108" role="img" aria-label="格局型領航者徽章"><circle cx="54" cy="54" r="50" fill="#E8F4FF"/><circle cx="54" cy="54" r="38" fill="#5BA4E6"/><circle cx="54" cy="54" r="8" fill="#FFFDF7"/><path d="M54 22 L58 54 L54 86 L50 54 Z" fill="#FFFDF7" opacity=".9"/><path d="M22 54 L54 50 L86 54 L54 58 Z" fill="#DDF3FF" opacity=".85"/><circle cx="54" cy="22" r="4" fill="#FFD76A"/></svg>`,
  empathy: `<svg viewBox="0 0 108 108" role="img" aria-label="凝聚型夥伴徽章"><circle cx="54" cy="54" r="50" fill="#E7F8E3"/><circle cx="54" cy="54" r="38" fill="#7BC96F"/><circle cx="40" cy="50" r="10" fill="#FFFDF7"/><circle cx="68" cy="50" r="10" fill="#FFFDF7"/><path d="M32 64 Q54 84 76 64" fill="none" stroke="#FFFDF7" stroke-width="5" stroke-linecap="round"/></svg>`,
  decision: `<svg viewBox="0 0 108 108" role="img" aria-label="行動型領導者徽章"><circle cx="54" cy="54" r="50" fill="#FFE8D2"/><circle cx="54" cy="54" r="38" fill="#FFA95A"/><path d="M40 56 L50 66 L70 42" fill="none" stroke="#FFFDF7" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  crisis: `<svg viewBox="0 0 108 108" role="img" aria-label="破局型挑戰者徽章"><circle cx="54" cy="54" r="50" fill="#FFF6D8"/><circle cx="54" cy="54" r="38" fill="#E8B84A"/><path d="M58 28 L42 56 H56 L50 80 L70 50 H54 Z" fill="#FFFDF7"/></svg>`,
};
