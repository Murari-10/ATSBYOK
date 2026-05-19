"use client";

import { ParsedResume, isEmptyParse } from "@/lib/utils/resumeParser";
import { Plan } from "@/types";
import { isFreePlan } from "@/lib/utils/plan";

interface ResumePreviewProps {
  parsed: ParsedResume;
  raw: string;
  plan: Plan;
  onUpgrade: () => void;
  compact?: boolean;
}

function SectionHeading({ title }: { title: string }) {
  return (
    <h2 className="text-[11px] font-bold text-primary uppercase tracking-[1.5px] border-b-2 border-primary pb-1 mb-3 mt-5 first:mt-0">
      {title}
    </h2>
  );
}

interface LockedSectionProps {
  locked: boolean;
  message: string;
  onUpgrade: () => void;
  children: React.ReactNode;
}

function LockedSection({ locked, message, onUpgrade, children }: LockedSectionProps) {
  if (!locked) return <>{children}</>;
  return (
    <div className="relative overflow-hidden rounded-lg mt-1">
      <div className="blur-sm select-none pointer-events-none">{children}</div>
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50/85 backdrop-blur-sm rounded-lg">
        <span className="text-2xl mb-1.5">🔒</span>
        <p className="text-sm font-semibold text-gray-800 mb-0.5">Unlock full resume</p>
        <p className="text-xs text-gray-500 mb-3">{message}</p>
        <button
          onClick={onUpgrade}
          className="bg-primary text-white text-xs font-semibold px-4 py-1.5 rounded-lg hover:bg-primary-600 transition-colors"
        >
          Upgrade
        </button>
      </div>
    </div>
  );
}

function ContactItem({ value }: { value: string }) {
  return (
    <span className="text-[12px] text-gray-500">{value}</span>
  );
}

export default function ResumePreview({ parsed, raw, plan, onUpgrade, compact = false }: ResumePreviewProps) {
  const isFree = isFreePlan(plan);
  const lockMsg = "Upgrade to Starter or above";

  const outerClass = compact
    ? "bg-white px-6 py-6 max-h-[720px] overflow-y-auto"
    : "bg-white max-w-[794px] min-h-[1123px] mx-auto rounded-sm shadow-[0_4px_24px_rgba(0,0,0,0.10)] px-[56px] py-[48px] font-sans";

  // If parsing produced no structured sections, show raw text directly
  if (isEmptyParse(parsed)) {
    return (
      <div className={outerClass}>
        {parsed.name && (
          <div className="mb-3">
            <h1 className={`${compact ? "text-[18px]" : "text-[26px]"} font-bold text-gray-900 tracking-[-0.5px] leading-tight`}>
              {parsed.name}
            </h1>
            <div className="border-t border-gray-200 mt-3" />
          </div>
        )}
        <pre className="text-[12px] text-gray-700 font-mono whitespace-pre-wrap leading-relaxed">
          {raw}
        </pre>
      </div>
    );
  }

  const contactParts = [
    parsed.contact.phone,
    parsed.contact.email,
    parsed.contact.linkedin,
    parsed.contact.github,
    parsed.contact.portfolio,
  ].filter(Boolean) as string[];

  return (
    <div className={outerClass}>

      {/* Header — always visible */}
      {parsed.name && (
        <div>
          <h1 className={`${compact ? "text-[18px]" : "text-[26px]"} font-bold text-gray-900 tracking-[-0.5px] leading-tight`}>
            {parsed.name}
          </h1>
          {contactParts.length > 0 && (
            <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 mt-1.5">
              {contactParts.flatMap((item, i) => [
                ...(i > 0
                  ? [<span key={`sep-${i}`} className="text-gray-300 select-none text-[11px]">·</span>]
                  : []),
                <span key={item} className={`${compact ? "text-[10px]" : "text-[12px]"} text-gray-500`}>{item}</span>,
              ])}
            </div>
          )}
          <div className="border-t border-gray-200 mt-3" />
        </div>
      )}

      {/* Summary — always visible */}
      {parsed.summary && (
        <div>
          <SectionHeading title="Summary" />
          <p className="text-[13px] text-gray-700 leading-[1.6]">{parsed.summary}</p>
        </div>
      )}

      {/* Experience */}
      {parsed.experience.length > 0 && (
        <div>
          <SectionHeading title="Experience" />
          {parsed.experience.slice(0, 1).map((exp, i) => (
            <ExperienceEntry key={i} exp={exp} />
          ))}
          {parsed.experience.length > 1 && (
            <LockedSection locked={isFree} message={lockMsg} onUpgrade={onUpgrade}>
              {parsed.experience.slice(1).map((exp, i) => (
                <ExperienceEntry key={i} exp={exp} />
              ))}
            </LockedSection>
          )}
        </div>
      )}

      {/* Education — always visible */}
      {parsed.education.length > 0 && (
        <div>
          <SectionHeading title="Education" />
          {parsed.education.map((edu, i) => (
            <div key={i} className="mb-3 last:mb-0">
              <div className="flex justify-between items-baseline">
                <span className="text-[13px] font-semibold text-gray-900">{edu.institution}</span>
                {edu.duration && (
                  <span className="text-[12px] text-gray-500 shrink-0 ml-2">{edu.duration}</span>
                )}
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-[12px] text-gray-500">{edu.degree}</span>
                {edu.score && (
                  <span className="text-[12px] text-gray-500 shrink-0 ml-2">{edu.score}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Skills */}
      {parsed.skills.length > 0 && (
        <div>
          <SectionHeading title="Skills" />
          {parsed.skills.slice(0, 1).map((s, i) => (
            <SkillRow key={i} category={s.category} items={s.items} />
          ))}
          {parsed.skills.length > 1 && (
            <LockedSection locked={isFree} message={lockMsg} onUpgrade={onUpgrade}>
              {parsed.skills.slice(1).map((s, i) => (
                <SkillRow key={i} category={s.category} items={s.items} />
              ))}
            </LockedSection>
          )}
        </div>
      )}

      {/* Projects */}
      {parsed.projects.length > 0 && (
        <div>
          <SectionHeading title="Projects" />
          {parsed.projects.slice(0, 1).map((proj, i) => (
            <ProjectEntry key={i} proj={proj} />
          ))}
          {parsed.projects.length > 1 && (
            <LockedSection locked={isFree} message={lockMsg} onUpgrade={onUpgrade}>
              {parsed.projects.slice(1).map((proj, i) => (
                <ProjectEntry key={i} proj={proj} />
              ))}
            </LockedSection>
          )}
        </div>
      )}

      {/* Achievements */}
      {parsed.achievements.length > 0 && (
        <div>
          <SectionHeading title="Achievements" />
          <LockedSection locked={isFree} message={lockMsg} onUpgrade={onUpgrade}>
            <ul className="space-y-1">
              {parsed.achievements.map((a, i) => (
                <li key={i} className="flex gap-2 text-[12px] text-gray-700">
                  <span className="text-primary shrink-0">•</span>
                  {a}
                </li>
              ))}
            </ul>
          </LockedSection>
        </div>
      )}

      {/* Certifications */}
      {parsed.certifications.length > 0 && (
        <div>
          <SectionHeading title="Certifications" />
          <LockedSection locked={isFree} message={lockMsg} onUpgrade={onUpgrade}>
            <ul className="space-y-1">
              {parsed.certifications.map((c, i) => (
                <li key={i} className="flex gap-2 text-[12px] text-gray-700">
                  <span className="text-primary shrink-0">•</span>
                  {c}
                </li>
              ))}
            </ul>
          </LockedSection>
        </div>
      )}
    </div>
  );
}

function ExperienceEntry({
  exp,
}: {
  exp: {
    company: string;
    role: string;
    duration?: string;
    location?: string;
    bullets: string[];
  };
}) {
  return (
    <div className="mb-4 last:mb-0">
      <div className="flex justify-between items-baseline">
        <span className="text-[13px] font-semibold text-gray-900">{exp.company}</span>
        {exp.duration && (
          <span className="text-[12px] text-gray-500 shrink-0 ml-2">{exp.duration}</span>
        )}
      </div>
      {(exp.role || exp.location) && (
        <p className="text-[12px] text-gray-500">
          {exp.role}
          {exp.role && exp.location ? " · " : ""}
          {exp.location}
        </p>
      )}
      {exp.bullets.length > 0 && (
        <ul className="mt-1.5 space-y-1 pl-3">
          {exp.bullets.map((b, i) => (
            <li key={i} className="flex gap-2 text-[12px] text-gray-700 leading-[1.5]">
              <span className="text-primary shrink-0 mt-px">•</span>
              {b}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function SkillRow({ category, items }: { category: string; items: string }) {
  return (
    <div className="flex gap-1.5 text-[12px] mb-1.5 last:mb-0">
      <span className="font-semibold text-gray-900 shrink-0">{category}:</span>
      <span className="text-gray-700">{items}</span>
    </div>
  );
}

function ProjectEntry({
  proj,
}: {
  proj: { name: string; tech?: string; bullets: string[] };
}) {
  return (
    <div className="mb-4 last:mb-0">
      <div className="flex items-baseline gap-2">
        <span className="text-[13px] font-semibold text-gray-900">{proj.name}</span>
        {proj.tech && (
          <span className="text-[11px] text-primary">{proj.tech}</span>
        )}
      </div>
      {proj.bullets.length > 0 && (
        <ul className="mt-1.5 space-y-1 pl-3">
          {proj.bullets.map((b, i) => (
            <li key={i} className="flex gap-2 text-[12px] text-gray-700 leading-[1.5]">
              <span className="text-primary shrink-0 mt-px">•</span>
              {b}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
