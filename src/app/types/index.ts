export interface DMEProvider {
  id: number;
  company_name: string;
  state: string;
  insurance_providers: string[];
  phone_number: string;
  email: string;
  weblink: string;
  multiple_pump_models: boolean;
  upgrade_pumps_available: boolean;
  resupply_available: boolean;
  accessories_available: boolean;
  lactation_services_available: boolean;
  created_at?: string;
  updated_at?: string;
} 