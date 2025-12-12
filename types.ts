export interface Translation {
  hindi: string;
  urdu: string;
  tamil: string;
}

export interface SpokenSummary {
  english: string;
  hindi: string;
  urdu: string;
  tamil: string;
}

export interface Medicine {
  name: string;
  decoded_name: string;
  purpose: string;
  dosage_raw: string;
  dosage_explained: string;
  warnings: string;
  side_effects: string;
  translation: Translation;
  spoken_summary: SpokenSummary;
}

export interface PrescriptionResponse {
  medicines: Medicine[];
  notes_from_doctor: string;
  general_safety_observations: string;
  uncertain_items: string[];
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  data: PrescriptionResponse;
}