-- Create states table
CREATE TABLE states (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    abbreviation CHAR(2) NOT NULL UNIQUE
);

-- Create insurance_providers table
CREATE TABLE insurance_providers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

-- Create dme_companies table
CREATE TABLE if not exists dme_companies (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    dedicated_link TEXT
);

-- Create dme_coverage table
CREATE TABLE if not exists dme_coverage (
    id SERIAL PRIMARY KEY,
    dme_id INTEGER REFERENCES dme_companies(id) ON DELETE CASCADE,
    insurance TEXT NOT NULL,
    state TEXT NOT NULL, -- Use 'All' as wildcard
    medicaid BOOLEAN DEFAULT FALSE,
    resupply_available BOOLEAN DEFAULT FALSE,
    accessories_available BOOLEAN DEFAULT FALSE,
    lactation_services_available BOOLEAN DEFAULT FALSE
);

-- Create user_emails table
CREATE TABLE user_emails (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for dme_providers table
CREATE TRIGGER update_dme_providers_updated_at
    BEFORE UPDATE ON dme_providers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for states
INSERT INTO states (name, abbreviation) VALUES
    ('Alabama', 'AL'),
    ('Alaska', 'AK'),
    ('Arizona', 'AZ'),
    ('Arkansas', 'AR'),
    ('California', 'CA'),
    ('Colorado', 'CO'),
    ('Connecticut', 'CT'),
    ('Delaware', 'DE'),
    ('Florida', 'FL'),
    ('Georgia', 'GA'),
    ('Hawaii', 'HI'),
    ('Idaho', 'ID'),
    ('Illinois', 'IL'),
    ('Indiana', 'IN'),
    ('Iowa', 'IA'),
    ('Kansas', 'KS'),
    ('Kentucky', 'KY'),
    ('Louisiana', 'LA'),
    ('Maine', 'ME'),
    ('Maryland', 'MD'),
    ('Massachusetts', 'MA'),
    ('Michigan', 'MI'),
    ('Minnesota', 'MN'),
    ('Mississippi', 'MS'),
    ('Missouri', 'MO'),
    ('Montana', 'MT'),
    ('Nebraska', 'NE'),
    ('Nevada', 'NV'),
    ('New Hampshire', 'NH'),
    ('New Jersey', 'NJ'),
    ('New Mexico', 'NM'),
    ('New York', 'NY'),
    ('North Carolina', 'NC'),
    ('North Dakota', 'ND'),
    ('Ohio', 'OH'),
    ('Oklahoma', 'OK'),
    ('Oregon', 'OR'),
    ('Pennsylvania', 'PA'),
    ('Rhode Island', 'RI'),
    ('South Carolina', 'SC'),
    ('South Dakota', 'SD'),
    ('Tennessee', 'TN'),
    ('Texas', 'TX'),
    ('Utah', 'UT'),
    ('Vermont', 'VT'),
    ('Virginia', 'VA'),
    ('Washington', 'WA'),
    ('West Virginia', 'WV'),
    ('Wisconsin', 'WI'),
    ('Wyoming', 'WY');

-- Insert sample data for insurance providers
INSERT INTO insurance_providers (name) VALUES
    ('Medicare'),
    ('Medicaid'),
    ('Blue Cross Blue Shield'),
    ('Aetna'),
    ('UnitedHealthcare'),
    ('Cigna'),
    ('Humana'),
    ('Kaiser Permanente'),
    ('Anthem'),
    ('Centene');

-- Insert sample data for DME providers
INSERT INTO dme_providers (
    company_name, state, insurance_providers, phone_number, email, weblink,
    multiple_pump_models, upgrade_pumps_available, resupply_available,
    accessories_available, lactation_services_available
) VALUES
('HealthyMoms Supplies', 'NY', ARRAY['Aetna', 'Blue Cross', 'Cigna'], '212-555-1234', 'contact@healthymomsupplies.com', 'https://www.healthymomsupplies.com', TRUE, TRUE, TRUE, TRUE, TRUE),
('MomCare Medical', 'CA', ARRAY['UnitedHealthcare', 'Aetna'], '310-555-9876', 'support@momcaremed.com', 'https://www.momcaremed.com', TRUE, FALSE, TRUE, TRUE, FALSE),
('LactaLife Solutions', 'TX', ARRAY['Cigna', 'Humana'], '512-555-2233', 'info@lactalife.com', 'https://www.lactalife.com', FALSE, FALSE, TRUE, TRUE, TRUE),
('PediHealth Direct', 'FL', ARRAY['Blue Cross', 'Molina Healthcare'], '305-555-4567', 'services@pedihealthdirect.com', 'https://www.pedihealthdirect.com', TRUE, TRUE, TRUE, FALSE, FALSE),
('BabyBloom Medical', 'IL', ARRAY['Aetna', 'UnitedHealthcare', 'Anthem'], '773-555-0101', 'hello@babybloommed.com', 'https://www.babybloommed.com', TRUE, TRUE, TRUE, TRUE, TRUE),
('PumpExpress DME', 'PA', ARRAY['Cigna', 'Blue Cross'], '215-555-3322', 'orders@pumpexpressdme.com', 'https://www.pumpexpressdme.com', TRUE, TRUE, FALSE, TRUE, TRUE),
('NurtureNest Providers', 'GA', ARRAY['Humana', 'Kaiser Permanente'], '404-555-8877', 'care@nurturenest.com', 'https://www.nurturenest.com', FALSE, FALSE, FALSE, TRUE, FALSE),
('CareBridge Medical', 'OH', ARRAY['Anthem', 'Molina Healthcare', 'Aetna'], '614-555-7788', 'connect@carebridgemed.com', 'https://www.carebridgemed.com', TRUE, TRUE, TRUE, TRUE, TRUE),
('MamaEase Supplies', 'NC', ARRAY['Cigna', 'UnitedHealthcare'], '919-555-3344', 'info@mamaease.com', 'https://www.mamaease.com', TRUE, FALSE, TRUE, FALSE, TRUE),
('Infinity DME Group', 'MI', ARRAY['Blue Cross', 'Humana'], '313-555-4455', 'support@infinitydmegroup.com', 'https://www.infinitydmegroup.com', TRUE, TRUE, FALSE, FALSE, TRUE);