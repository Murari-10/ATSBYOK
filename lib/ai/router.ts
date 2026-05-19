import Anthropic from "@anthropic-ai/sdk";
import { OpenRouter } from "@openrouter/sdk";
import { Provider } from "@/types";

interface AICallOptions {
  provider: Provider | "anthropic";
  model: string;
  systemPrompt: string;
  userPrompt: string;
  apiKey?: string;
}

export async function callAI(options: AICallOptions): Promise<string> {
  const { provider, model, systemPrompt, userPrompt, apiKey } = options;

  if (provider === "anthropic") {
    const client = new Anthropic({
      apiKey: apiKey || process.env.ANTHROPIC_API_KEY,
    });
    const response = await client.messages.create({
      model,
      max_tokens: 4000,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    });
    return (response.content[0] as { type: string; text: string }).text;
  }

  if (provider === "openrouter") {
    const client = new OpenRouter({ apiKey });
    const stream = await client.chat.send({
      chatRequest: {
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        stream: true,
      },
    });
    let text = "";
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) text += content;
    }
    if (!text) throw new Error("OpenRouter: empty response");
    return text;
  }

  if (provider === "groq") {
    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          max_tokens: 4000,
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
        }),
      }
    );
    const data = await response.json();
    if (!response.ok) {
      const msg = data.error?.message || data.message || JSON.stringify(data.error ?? data);
      throw new Error(`Groq: ${msg}`);
    }
    return data.choices[0].message.content;
  }

  if (provider === "gemini") {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }],
            },
          ],
          generationConfig: { maxOutputTokens: 4000 },
        }),
      }
    );
    const data = await response.json();
    if (!response.ok) {
      const msg = data.error?.message || data.error?.status || JSON.stringify(data.error ?? data);
      throw new Error(`Gemini: ${msg}`);
    }
    return data.candidates[0].content.parts[0].text;
  }

  throw new Error(`Unknown provider: ${provider}`);
}

export const RESUME_SYSTEM_PROMPT = `You are an expert resume optimizer with deep knowledge of ATS systems used globally including Naukri, LinkedIn, Indeed, Greenhouse, Workday, Lever, and Jobvite. You write clean, modern, single-column resumes with professional summary sections (never objective statements). You tailor content length to the specified page count. Always respond with valid JSON only. No markdown. No text outside JSON.`;

export function buildResumeUserPrompt(
  resumeText: string,
  jobDescription: string,
  mode: string,
  pages: number,
  platform: string
): string {
  return `Analyze and rewrite this resume for the given job description.

Mode: ${mode}
Target pages: ${pages}
Target platform: ${platform}

RESUME:
${resumeText}

JOB DESCRIPTION:
${jobDescription}

Respond ONLY with valid JSON, no markdown, no extra text:
{
  "ats_score": <number 0-100>,
  "keyword_match_score": <number 0-100>,
  "format_score": <number 0-100>,
  "found_keywords": [<array of strings>],
  "missing_keywords": [<array of strings>],
  "format_issues": [<array of strings>],
  "suggestions": [
    {
      "title": "<short title>",
      "description": "<what to improve>",
      "before": "<current weak phrasing>",
      "after": "<improved phrasing>"
    }
  ],
  "platform_specific_tips": [<2-3 strings>],
  "optimized_resume": "<full rewritten resume as plain text, clean single-column format, tailored to ${pages} page(s), no photo, no objective statement. Use ONLY these exact section headings (no colons, no decoration): Summary, Experience, Education, Skills, Projects, Achievements, Certifications. Omit sections with no content.>"
}`;
}

export function buildColdEmailPrompt(
  resumeSummary: string,
  jobSummary: string
): string {
  return `Generate a cold email to the hiring manager based on this resume and job description.

RESUME SUMMARY: ${resumeSummary}
JOB DESCRIPTION: ${jobSummary}

Respond ONLY with valid JSON:
{
  "subject": "<compelling subject line>",
  "body": "<professional cold email, 150-200 words, personalized to role and company, highlight 2-3 key strengths, clear call to action>"
}`;
}

export function buildLinkedInPrompt(
  resumeSummary: string,
  jobSummary: string
): string {
  return `Generate LinkedIn referral messages based on this resume and job description.

RESUME SUMMARY: ${resumeSummary}
JOB DESCRIPTION: ${jobSummary}

Respond ONLY with valid JSON:
{
  "connection_request": "<max 300 characters, friendly, specific>",
  "followup_message": "<100-150 words, professional, mention specific role, explain fit, polite referral ask>"
}`;
}

export function buildCoverLetterPrompt(
  resumeText: string,
  jobDescription: string,
  mode: string
): string {
  return `Generate a professional cover letter.

RESUME: ${resumeText}
JOB DESCRIPTION: ${jobDescription}
MODE: ${mode}

Respond ONLY with valid JSON:
{
  "cover_letter": "<3-4 paragraphs, tailored to role, highlight top 3 achievements, strong opening and closing, modern professional tone, no clichés>"
}`;
}
