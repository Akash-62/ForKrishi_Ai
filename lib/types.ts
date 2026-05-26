export type CurrentScreen = 'home' | 'language' | 'crop' | 'problem' | 'result' | 'updates' | 'saved' | 'kvk';

export type SeverityType = 'Low' | 'Medium' | 'Serious';

export interface AdvisoryResult {
  id: string;
  date: string;
  crop: string;
  language: string;
  problem: string;
  severity: SeverityType;
  problemSummary: string;
  doNow: string[];
  avoid: string[];
  contactOfficerIf: string;
  whatsappMessage: string;
  image?: string;
}
