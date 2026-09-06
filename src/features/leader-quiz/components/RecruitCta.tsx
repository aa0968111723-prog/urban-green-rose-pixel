import { clubCtaLinks } from "@/config/clubConfig";
import { leaderQuizConfig } from "../leaderQuizConfig";

export function RecruitCta() {
  const links = clubCtaLinks();
  return (
    <div className="recruit-card">
      <p className="section-label">想更認識領袖社</p>
      <h3 className="recruit-title">{leaderQuizConfig.recruitTitle}</h3>
      <div className="recruit-actions">
        {links.map((link) =>
          link.href ? (
            <a key={link.label} className="cta secondary recruit-link" href={link.href}>
              {link.label}
            </a>
          ) : (
            <button key={link.label} className="cta secondary" type="button" disabled title="連結即將公布">
              {link.label}
            </button>
          ),
        )}
      </div>
    </div>
  );
}
