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

export interface CategoryStat {
  category: string;
  count: number;
}

export interface RecentScan {
  id: number;
  object_name: string;
  object_category: string;
  image_path: string;
  created_at: string;
  energy_score?: number | null;
  is_hazardous: boolean;
}

export interface ObjectStats {
  total_scans: number;
  avg_energy_score?: number | null;
  avg_confidence?: number | null;
  hazardous_count: number;
  categories_count: number;
  total_kwh?: number | null;
  top_categories: CategoryStat[];
  recent: RecentScan[];
}
