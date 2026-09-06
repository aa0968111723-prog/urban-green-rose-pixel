/**
 * Club-wide links used by recruit CTAs.
 * Leave a URL empty to render the button as disabled (no fake placeholders).
 */
export type ClubLink = {
  label: string;
  href: string;
};

export const clubConfig = {
  clubName: "淡江大學領袖社",
  campus: "淡江大學",
  socialLinks: {
    instagram: "" as string,
    about: "" as string,
    events: "" as string,
    experienceSignup: "" as string,
  },
} as const;

export function clubCtaLinks(): ClubLink[] {
  return [
    { label: "認識領袖社", href: clubConfig.socialLinks.about },
    { label: "查看近期活動", href: clubConfig.socialLinks.events },
    { label: "追蹤 IG", href: clubConfig.socialLinks.instagram },
    { label: "報名體驗活動", href: clubConfig.socialLinks.experienceSignup },
  ];
}
