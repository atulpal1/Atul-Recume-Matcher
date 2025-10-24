import { GoogleGenAI, Type } from "@google/genai";
import type { AnalysisResult } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const analysisSchema = {
  type: Type.OBJECT,
  properties: {
    compatibilityScore: {
      type: Type.NUMBER,
      description: "A percentage score from 0 to 100 indicating how well the resume matches the job description.",
    },
    keyStrengths: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "A list of 3-5 key skills or experiences from the resume that directly align with the job description.",
    },
    areasForImprovement: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "A list of 2-3 important skills from the job description that are missing or weak in the resume.",
    },
    keywordOverlap: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "A list of important keywords found in both the job description and the resume.",
    },
    requiredSkillsAnalysis: {
        type: Type.ARRAY,
        description: "An analysis of the top required skills provided by the user.",
        items: {
            type: Type.OBJECT,
            properties: {
                skill: { type: Type.STRING, description: "The required skill being analyzed." },
                isPresent: { type: Type.BOOLEAN, description: "Whether the skill is mentioned in the resume at all." },
                resumeCount: { type: Type.NUMBER, description: "How many times the skill is mentioned in the entire resume." },
                recentProjectsCount: { type: Type.NUMBER, description: "How many times the skill is mentioned in a recent projects section." },
            },
            required: ["skill", "isPresent", "resumeCount", "recentProjectsCount"],
        }
    },
    fabricationAnalysis: {
        type: Type.ARRAY,
        description: "A list of findings related to resume fabrication, AI-generated content, or plagiarism.",
        items: {
            type: Type.OBJECT,
            properties: {
                lineContent: { type: Type.STRING, description: "The specific line or text from the resume that is suspicious." },
                reason: { type: Type.STRING, description: "A detailed explanation of why this content is flagged." },
                severity: { type: Type.STRING, description: "The severity of the finding ('Low', 'Medium', or 'High')." },
            },
            required: ["lineContent", "reason", "severity"],
        }
    }
  },
  required: ["compatibilityScore", "keyStrengths", "areasForImprovement", "keywordOverlap", "requiredSkillsAnalysis", "fabricationAnalysis"],
};

export async function analyzeResumeMatch(jobDescription: string, resume: string, requiredSkills: string): Promise<AnalysisResult> {
  const prompt = `
    Analyze the following resume against the provided job description and a list of required skills. Act as an expert hiring manager and a fraud detection specialist. Provide a detailed analysis in JSON format.

    Job Description:
    ---
    ${jobDescription}
    ---

    Candidate Resume:
    ---
    ${resume}
    ---

    Top Required Skills:
    ---
    ${requiredSkills}
    ---

    Based on the comparison, generate the following:
    1.  A 'compatibilityScore' as a percentage (number from 0 to 100).
    2.  A list of 3-5 'keyStrengths' from the resume that match the job description.
    3.  A list of 2-3 'areasForImprovement' where the resume lacks required skills from the job description.
    4.  A list of 'keywordOverlap' containing important terms found in both documents.
    5.  A 'requiredSkillsAnalysis' array. For each of the "Top Required Skills" provided, create an object containing:
        a. 'skill': The name of the skill.
        b. 'isPresent': a boolean (true/false) indicating if the skill is found anywhere in the resume.
        c. 'resumeCount': A number representing the total count of the skill keyword in the entire resume.
        d. 'recentProjectsCount': A number for how many times the skill is mentioned in the context of recent projects. If no project section exists, this should be 0.
        e. If a skill is not present, set 'isPresent' to false and both counts to 0.
    6.  A 'fabricationAnalysis' array. Analyze the resume for any signs of fabrication, content copied from AI tools (like generic phrasing or buzzwords without context), or inconsistencies. For each suspicious line or section you find, create an object containing:
        a. 'lineContent': The suspicious text itself.
        b. 'reason': Why it's flagged (e.g., 'Overly generic AI-like language', 'Inconsistent with career progression', etc.).
        c. 'severity': A severity level of 'Low', 'Medium', or 'High'.
        If the resume seems authentic, return an empty array for 'fabricationAnalysis'.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
      },
    });

    const jsonString = response.text.trim();
    const result = JSON.parse(jsonString);
    return result as AnalysisResult;
  } catch (error) {
    console.error("Error analyzing resume match:", error);
    throw new Error("Failed to get analysis from Gemini API. Please check the console for details.");
  }
}

export async function generateResume(jobTitle: string, keySkills: string, jobDescription?: string): Promise<string> {
    const prompt = `
    Act as a professional resume writer and career coach. Your task is to generate a complete, professional resume based on the provided details.

    **Target Job Title:**
    ${jobTitle}

    **Key Skills and Experience:**
    ${keySkills}

    ${jobDescription ? `**Target Job Description (for tailoring):**\n${jobDescription}` : ''}

    ---

    **Instructions:**
    1.  **Structure:** Create a well-structured resume with the following sections:
        *   Contact Information (use placeholders like [Your Name], [Phone], [Email], [LinkedIn Profile URL]).
        *   Professional Summary (a compelling 3-4 line summary tailored to the job title and skills).
        *   Skills (categorize these into logical groups like 'Programming Languages', 'Frameworks & Libraries', 'Databases', 'Tools', etc.).
        *   Work Experience (create 2-3 fictional but realistic job entries. For each, write 3-5 impactful bullet points using the STAR method - Situation, Task, Action, Result. Quantify achievements where possible, e.g., "Increased performance by 15%").
        *   Education (use placeholders like [University Name], [Degree]).
    2.  **Content:**
        *   Elaborate on the provided "Key Skills and Experience" to create detailed, convincing bullet points.
        *   If a job description is provided, ensure the resume is highly tailored to its requirements, using relevant keywords and prioritizing skills mentioned in the JD.
        *   Use strong action verbs to start each bullet point.
    3.  **Formatting:**
        *   Return the result as a single block of plain text.
        *   Use standard markdown for formatting (e.g., asterisks for bullet points). Do not use HTML or JSON.
        *   Ensure the output is clean, readable, and ready to be copied and pasted into a document.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-pro",
            contents: prompt,
        });
        return response.text.trim();
    } catch (error) {
        console.error("Error generating resume:", error);
        throw new Error("Failed to generate resume from Gemini API. Please check the console for details.");
    }
}
