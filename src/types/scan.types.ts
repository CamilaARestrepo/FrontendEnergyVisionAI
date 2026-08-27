import type { DetectedObject } from './object.types';

export interface ScanEnergyResponse {
  energy_score?: number;
  kwh_per_unit?: number;
  kwh_per_kg?: number;
  valorization_methods?: string[];
  waste_hierarchy_level?: string;
  ler_code?: string;
  is_hazardous?: boolean;
}

export interface ScanResponse {
  scan_id: number;
  object: DetectedObject;   // Schema canónico — mismo que GET /objects/{id}
  energy?: ScanEnergyResponse;
  ai_provider?: string;
  ai_model?: string;
  processing_time_ms: number;
}
