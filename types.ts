// Fix: Removed self-referential import of `AnalysisResult` that was causing a conflict.
export interface FabricationFinding {
  lineContent: string;
  reason: string;
  severity: 'Low' | 'Medium' | 'High';
}

export interface RequiredSkillAnalysis {
  skill: string;
  resumeCount: number;
  recentProjectsCount: number;
  isPresent: boolean;
}

export interface AnalysisResult {
  compatibilityScore: number;
  keyStrengths: string[];
  areasForImprovement: string[];
  keywordOverlap: string[];
  requiredSkillsAnalysis: RequiredSkillAnalysis[];
  fabricationAnalysis: FabricationFinding[];
}

export type Plan = 'free' | 'standard' | 'pro';

export interface User {
  email: string;
  password: string; // In a real app, this would be a hash
  fullName: string;
  phone: string;
  plan: Plan;
  usageCount: number;
}

export interface AdminSettings {
    indianBankDetails: string;
    indianUpiId: string;
    usBankDetails: string;
}

export interface ActivityLog {
    id: string;
    timestamp: string;
    userId: string; // email or guestId
    event: 'login' | 'register' | 'analysis_run' | 'generator_run';
    ip: string;
    country: string;
    city: string;
    browser: string;
    os: string;
    macAddress: string; // This will be simulated
}
