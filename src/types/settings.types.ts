export interface ProviderSettings {
  name: string;
  display_name: string;
  is_configured: boolean;
  has_api_key: boolean;
  available_models: string[];
}

export interface SettingsResponse {
  active_provider: string | null;
  active_model: string | null;
  providers: ProviderSettings[];
}

export interface SettingsUpdate {
  provider_name: string;
  model_name: string;
  api_key?: string;
  base_url?: string;
  extra_config?: string; // JSON String
}

export interface SettingsTestResponse {
  success: boolean;
  latency_ms?: number;
  model_response?: string;
  error?: string;
}
