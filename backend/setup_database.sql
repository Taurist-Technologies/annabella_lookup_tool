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

-- Create dme_providers table
CREATE TABLE dme_providers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    state CHAR(2) NOT NULL REFERENCES states(abbreviation),
    insurance_providers TEXT[] NOT NULL,
    contact_info TEXT NOT NULL,
    location TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
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
INSERT INTO dme_providers (name, state, insurance_providers, contact_info, location) VALUES
    ('ABC Medical Supplies', 'CA', ARRAY['Medicare', 'Blue Cross Blue Shield'], '555-0123', '123 Main St, Los Angeles, CA'),
    ('XYZ Healthcare', 'NY', ARRAY['Medicaid', 'Aetna'], '555-0124', '456 Oak Ave, New York, NY'),
    ('Medical Equipment Plus', 'TX', ARRAY['UnitedHealthcare', 'Cigna'], '555-0125', '789 Pine Rd, Houston, TX'); 