export interface DetectedObject {
  id: number;
  image_path: string;
  image_hash: string;
  object_name: string;
  object_category: string;
  object_material?: string;
  object_brand?: string;
  object_condition?: string;
  confidence_score: number;
  description?: string;
  reuse_suggestions?: string | string[]; // Can be stringified JSON
  ai_provider: string;
  ai_model: string;
  created_at: string;
  updated_at: string;
  
  energy_data?: EnergyData;
}

export interface EnergyData {
  id: number;
  object_id: number;
  energy_score?: number;
  kwh_per_unit?: number;
  kwh_per_kg?: number;
  valorization_methods?: string | string[]; // Can be stringified JSON
  waste_hierarchy_level?: string;
  ler_code?: string;
  is_hazardous?: boolean;
  processing_notes?: string;
}

export interface PaginatedObjectsResponse {
  items: DetectedObject[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
}
