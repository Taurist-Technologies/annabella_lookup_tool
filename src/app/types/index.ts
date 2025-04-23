export interface DMEProvider {
  id: number;
  dme_name: string;
  state: string;
  insurance_providers: string[];
  phone: string;
  email: string;
  dedicated_link: string;
  resupply_available: boolean;
  accessories_available: boolean;
  lactation_services_available: boolean;
  created_at?: string;
  updated_at?: string;
} 