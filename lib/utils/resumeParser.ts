export interface ParsedResume {
  name: string;
  contact: {
    phone?: string;
    email?: string;
    linkedin?: string;
    github?: string;
    portfolio?: string;
  };
  summary?: string;
  education: {
    institution: string;
    degree: string;
    score?: string;
    duration?: string;
  }[];
  experience: {
    company: string;
    role: string;
    duration?: string;
    location?: string;
    bullets: string[];
  }[];
  skills: {
    category: string;
    items: string;
  }[];
  projects: {
    name: string;
    tech?: string;
    bullets: string[];
  }[];
  achievements: string[];
  certifications: string[];
}

type SectionKey = keyof Omit<ParsedResume, "name" | "contact">;

const SECTION_PATTERNS: Array<{ key: SectionKey; pattern: RegExp }> = [
  {
    key: "summary",
    pattern:
      /^(professional\s+)?summary$|^about(\s+me)?$|^profile$|^career\s+objective$|^objective$/i,
  },
  {
    key: "experience",
    pattern:
      /^(work\s+|professional\s+|relevant\s+)?experience$|^(work\s+)?history$|^employment(\s+history)?$|^career(\s+history)?$/i,
  },
  {
    key: "education",
    pattern:
      /^education(al\s+background)?$|^academic(\s+(background|qualifications?))?$|^qualifications?$/i,
  },
  {
    key: "skills",
    pattern:
      /^(technical\s+|key\s+|core\s+|professional\s+)?skills?$|^core\s+competencies$|^competencies$|^expertise$/i,
  },
  {
    key: "projects",
    pattern: /^(key\s+|personal\s+|notable\s+|selected\s+)?projects?$/i,
  },
  {
    key: "achievements",
    pattern:
      /^(key\s+|notable\s+)?achievements?$|^awards?(\s+&\s+achievements?)?$|^honors?(\s+&\s+awards?)?$/i,
  },
  { key: "certifications", pattern: /^certifications?$|^licenses?\s+&\s+certifications?$/i },
];

function detectSection(line: string): SectionKey | null {
  // Strip trailing colon, dashes, or underscores that AIs sometimes add to headings
  const t = line.trim().replace(/[:\-_]+$/, "").trim();
  // Section headings are typically short (≤6 words) and match known patterns
  if (!t || t.split(/\s+/).length > 6) return null;
  for (const { key, pattern } of SECTION_PATTERNS) {
    if (pattern.test(t)) return key;
  }
  return null;
}

function isBullet(line: string): boolean {
  return /^[•\-*]\s/.test(line.trim());
}

function cleanBullet(line: string): string {
  return line.trim().replace(/^[•\-*]\s+/, "");
}

function extractContact(block: string): ParsedResume["contact"] {
  const c: ParsedResume["contact"] = {};

  const phoneMatch = block.match(/(\+?\d[\d\s\-().]{7,14}\d)/);
  if (phoneMatch) c.phone = phoneMatch[1].trim();

  const emailMatch = block.match(
    /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/
  );
  if (emailMatch) c.email = emailMatch[0];

  const liMatch = block.match(/linkedin\.com\/in\/[\w\-]+/i);
  if (liMatch) c.linkedin = liMatch[0];

  const ghMatch = block.match(/github\.com\/[\w\-]+/i);
  if (ghMatch) c.github = ghMatch[0];

  // Portfolio: any URL that is not LinkedIn or GitHub
  const urlMatch = block.match(
    /https?:\/\/(?!(?:www\.)?(?:linkedin|github)\.com)[^\s|,]+/i
  );
  if (urlMatch) c.portfolio = urlMatch[0];

  return c;
}

function parseExperienceEntry(
  headerLine: string
): Omit<ParsedResume["experience"][0], "bullets"> {
  // Common formats:
  //   Company | Role | Duration | Location
  //   Company | Role | Duration
  const parts = headerLine.split(/\s*[|·]\s*/);
  if (parts.length >= 2) {
    const company = parts[0].trim();
    const role = parts[1].trim();
    const duration = parts[2]?.trim();
    const location = parts[3]?.trim();
    return { company, role, duration, location };
  }

  // Fallback: try to strip a trailing date range from the line
  const datePattern =
    /((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|January|February|March|April|June|July|August|September|October|November|December)\s+\d{4}\s*[–\-–]\s*(?:Present|\d{4}|\w+\s+\d{4}))/i;
  const dateMatch = headerLine.match(datePattern);
  if (dateMatch) {
    const duration = dateMatch[1].trim();
    const company = headerLine.replace(dateMatch[0], "").trim();
    return { company, role: "", duration };
  }

  return { company: headerLine.trim(), role: "" };
}

function parseEducationEntry(
  line: string
): ParsedResume["education"][0] {
  const parts = line.split(/\s*[|·,]\s*/);
  const institution = parts[0]?.trim() || line;
  const degree = parts[1]?.trim() || "";

  const rest = parts.slice(2).join(" ");
  const scoreMatch = rest.match(
    /(\d+\.?\d*\s*(?:\/\s*10|\/\s*\d+|CGPA|GPA|%)?)/i
  );
  const score = scoreMatch?.[1]?.trim();

  const durationMatch = rest.match(/(\d{4}\s*[–\-–]\s*(?:\d{4}|Present))/i);
  const duration = durationMatch?.[1]?.trim();

  return { institution, degree, score, duration };
}

function parseSkillsSection(lines: string[]): ParsedResume["skills"] {
  const skills: ParsedResume["skills"] = [];
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;
    const colonIdx = line.indexOf(":");
    if (colonIdx > 0 && colonIdx < 40) {
      skills.push({
        category: line.slice(0, colonIdx).trim(),
        items: line.slice(colonIdx + 1).trim(),
      });
    } else if (!isBullet(line)) {
      skills.push({ category: "Skills", items: line });
    }
  }
  return skills;
}

export function parseResume(text: string): ParsedResume {
  const result: ParsedResume = {
    name: "",
    contact: {},
    education: [],
    experience: [],
    skills: [],
    projects: [],
    achievements: [],
    certifications: [],
  };

  if (!text?.trim()) return result;

  const rawLines = text.split("\n");
  const lines = rawLines.map((l) => l.trim());

  // Name = first non-empty line
  const nameIdx = lines.findIndex((l) => l.length > 0);
  if (nameIdx === -1) return result;
  result.name = lines[nameIdx];

  // Contact block: look in the next 5 lines after the name
  const contactBlock = lines.slice(nameIdx + 1, nameIdx + 6).join(" ");
  result.contact = extractContact(contactBlock);

  // Split text into labelled section blocks
  const sections: { key: SectionKey; rawLines: string[] }[] = [];
  let current: { key: SectionKey; rawLines: string[] } | null = null;

  for (let i = nameIdx + 1; i < lines.length; i++) {
    const key = detectSection(lines[i]);
    if (key) {
      if (current) sections.push(current);
      current = { key, rawLines: [] };
    } else if (current) {
      current.rawLines.push(rawLines[i]);
    }
  }
  if (current) sections.push(current);

  // Parse each section
  for (const section of sections) {
    const nonEmpty = section.rawLines.filter((l) => l.trim().length > 0);

    switch (section.key) {
      case "summary":
        result.summary = nonEmpty.map((l) => l.trim()).join(" ").trim();
        break;

      case "experience": {
        let entry: Omit<ParsedResume["experience"][0], "bullets"> | null =
          null;
        let bullets: string[] = [];
        for (const rawLine of nonEmpty) {
          const line = rawLine.trim();
          if (isBullet(line)) {
            bullets.push(cleanBullet(line));
          } else {
            if (entry) result.experience.push({ ...entry, bullets });
            entry = parseExperienceEntry(line);
            bullets = [];
          }
        }
        if (entry) result.experience.push({ ...entry, bullets });
        break;
      }

      case "education": {
        for (const rawLine of nonEmpty) {
          const line = rawLine.trim();
          if (!isBullet(line)) {
            result.education.push(parseEducationEntry(line));
          }
        }
        break;
      }

      case "skills":
        result.skills = parseSkillsSection(nonEmpty);
        break;

      case "projects": {
        let entry: Omit<ParsedResume["projects"][0], "bullets"> | null = null;
        let bullets: string[] = [];
        for (const rawLine of nonEmpty) {
          const line = rawLine.trim();
          if (isBullet(line)) {
            bullets.push(cleanBullet(line));
          } else {
            if (entry) result.projects.push({ ...entry, bullets });
            const parts = line.split(/\s*[|·]\s*/);
            entry = { name: parts[0]?.trim() || line, tech: parts[1]?.trim() };
            bullets = [];
          }
        }
        if (entry) result.projects.push({ ...entry, bullets });
        break;
      }

      case "achievements":
        result.achievements = nonEmpty
          .map((l) => (isBullet(l.trim()) ? cleanBullet(l.trim()) : l.trim()))
          .filter(Boolean);
        break;

      case "certifications":
        result.certifications = nonEmpty
          .map((l) => (isBullet(l.trim()) ? cleanBullet(l.trim()) : l.trim()))
          .filter(Boolean);
        break;
    }
  }

  return result;
}

export function isEmptyParse(parsed: ParsedResume): boolean {
  return (
    parsed.experience.length === 0 &&
    parsed.skills.length === 0 &&
    parsed.education.length === 0 &&
    parsed.projects.length === 0 &&
    !parsed.summary
  );
}
