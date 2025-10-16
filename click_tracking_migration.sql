-- Click tracking table migration
-- Run this in your Supabase SQL editor

CREATE TABLE IF NOT EXISTS provider_clicks (
    id SERIAL PRIMARY KEY,
    provider_id INTEGER NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    search_state VARCHAR(2) NOT NULL,
    search_insurance VARCHAR(255) NOT NULL,
    click_type VARCHAR(20) NOT NULL DEFAULT 'manual', -- 'manual', 'auto_redirect'
    clicked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    session_id VARCHAR(255), -- Optional: for tracking unique search sessions
    user_agent TEXT, -- Optional: for device/browser analytics
    referrer TEXT, -- Optional: for tracking how users found the site
    
    -- Foreign key constraints
    CONSTRAINT fk_provider_id 
        FOREIGN KEY (provider_id) 
        REFERENCES providers(id) 
        ON DELETE CASCADE,
        
    -- Indexes for analytics queries
    INDEX idx_provider_clicks_provider_id (provider_id),
    INDEX idx_provider_clicks_clicked_at (clicked_at),
    INDEX idx_provider_clicks_state (search_state),
    INDEX idx_provider_clicks_insurance (search_insurance),
    INDEX idx_provider_clicks_type (click_type),
    INDEX idx_provider_clicks_email_date (user_email, clicked_at)
);

-- RPC function for click analytics
-- Fixed: Uses ARRAY constructor with subquery instead of invalid ARRAY_AGG with LIMIT syntax
CREATE OR REPLACE FUNCTION get_click_analytics(
    start_date DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
    end_date DATE DEFAULT CURRENT_DATE,
    provider_id_filter INTEGER DEFAULT NULL,
    state_filter VARCHAR(2) DEFAULT NULL
)
RETURNS TABLE (
    provider_id INTEGER,
    provider_name VARCHAR,
    total_clicks BIGINT,
    manual_clicks BIGINT,
    auto_redirects BIGINT,
    unique_users BIGINT,
    avg_clicks_per_user NUMERIC,
    top_states TEXT[],
    top_insurances TEXT[]
)
LANGUAGE sql
AS $$
    SELECT
        p.id as provider_id,
        p.name as provider_name,
        COUNT(pc.id) as total_clicks,
        COUNT(CASE WHEN pc.click_type = 'manual' THEN 1 END) as manual_clicks,
        COUNT(CASE WHEN pc.click_type = 'auto_redirect' THEN 1 END) as auto_redirects,
        COUNT(DISTINCT pc.user_email) as unique_users,
        ROUND(COUNT(pc.id)::NUMERIC / NULLIF(COUNT(DISTINCT pc.user_email), 0), 2) as avg_clicks_per_user,
        -- Use ARRAY constructor with subquery for top states (proper syntax)
        ARRAY(
            SELECT pc2.search_state
            FROM provider_clicks pc2
            WHERE pc2.provider_id = p.id
                AND pc2.clicked_at >= start_date
                AND pc2.clicked_at <= end_date + INTERVAL '1 day'
                AND (state_filter IS NULL OR pc2.search_state = state_filter)
            GROUP BY pc2.search_state
            ORDER BY COUNT(*) DESC
            LIMIT 5
        ) as top_states,
        -- Use ARRAY constructor with subquery for top insurances (proper syntax)
        ARRAY(
            SELECT pc3.search_insurance
            FROM provider_clicks pc3
            WHERE pc3.provider_id = p.id
                AND pc3.clicked_at >= start_date
                AND pc3.clicked_at <= end_date + INTERVAL '1 day'
                AND (state_filter IS NULL OR pc3.search_state = state_filter)
            GROUP BY pc3.search_insurance
            ORDER BY COUNT(*) DESC
            LIMIT 5
        ) as top_insurances
    FROM providers p
    LEFT JOIN provider_clicks pc ON p.id = pc.provider_id
        AND pc.clicked_at >= start_date
        AND pc.clicked_at <= end_date + INTERVAL '1 day'
        AND (provider_id_filter IS NULL OR pc.provider_id = provider_id_filter)
        AND (state_filter IS NULL OR pc.search_state = state_filter)
    WHERE provider_id_filter IS NULL OR p.id = provider_id_filter
    GROUP BY p.id, p.name
    HAVING COUNT(pc.id) > 0 OR provider_id_filter IS NOT NULL
    ORDER BY total_clicks DESC;
$$;

-- Grant permissions
GRANT SELECT, INSERT ON provider_clicks TO authenticated;
GRANT EXECUTE ON FUNCTION get_click_analytics TO authenticated;

-- Add environment variable for the table name (add to your .env file)
-- PROVIDER_CLICKS_TABLE=provider_clicks