# Test Environment Setup

This document describes the test environment for click tracking analytics.

## Test Database Tables

The following test tables have been created as duplicates of the production tables:

### 1. `test_provider_clicks`
- **Purpose**: Test version of `provider_clicks` table
- **Foreign Key**: References `test_providers(id)` with CASCADE delete
- **Indexes**: Same as production for performance testing
- **Schema**: Identical to `provider_clicks`

### 2. `test_providers`
- **Purpose**: Test providers data
- **Status**: Already existed in database
- **Note**: Use this for creating test provider records

### 3. `test_insurances`
- **Purpose**: Test insurance providers
- **Status**: Already existed in database

### 4. `test_provider_coverage`
- **Purpose**: Test provider coverage data
- **Status**: Already existed in database

## Test RPC Functions

### `test_get_click_analytics()`
- **Purpose**: Analytics function for test click data
- **Parameters**:
  - `start_date` (DATE, default: 30 days ago)
  - `end_date` (DATE, default: today)
  - `provider_id_filter` (INTEGER, optional)
  - `state_filter` (VARCHAR(2), optional)
- **Returns**: Same structure as `get_click_analytics()`

## Environment Variables

To use the test environment, add these environment variables to your `.env` file:

### Backend Environment Variables

```bash
# Test Tables (add these to backend/.env)
TEST_PROVIDER_CLICKS_TABLE=test_provider_clicks
TEST_PROVIDERS_TABLE=test_providers
TEST_INSURANCES_TABLE=test_insurances
TEST_PROVIDER_COVERAGE_TABLE=test_provider_coverage

# Test RPC Functions
TEST_GET_CLICK_ANALYTICS=test_get_click_analytics
TEST_SEARCH_PROVIDERS=test_search_providers  # You may need to create this

# Environment Toggle (set to 'test' to use test tables)
APP_ENVIRONMENT=production  # or 'test'
```

### Frontend Environment Variables

```bash
# Add to .env.local for frontend testing
NEXT_PUBLIC_USE_TEST_ENVIRONMENT=false  # Set to 'true' for testing
```

## Usage

### Option 1: Environment Variable Toggle (Recommended)

Modify your backend code to check the `APP_ENVIRONMENT` variable:

```python
# In backend/app/api/routes.py
import os

# Determine which tables to use based on environment
ENVIRONMENT = os.getenv("APP_ENVIRONMENT", "production")

if ENVIRONMENT == "test":
    PROVIDER_CLICKS_TABLE = os.getenv("TEST_PROVIDER_CLICKS_TABLE")
    PROVIDERS_TABLE = os.getenv("TEST_PROVIDERS_TABLE")
    GET_CLICK_ANALYTICS_FUNC = os.getenv("TEST_GET_CLICK_ANALYTICS")
else:
    PROVIDER_CLICKS_TABLE = os.getenv("PROVIDER_CLICKS_TABLE")
    PROVIDERS_TABLE = os.getenv("PROVIDERS_TABLE")
    GET_CLICK_ANALYTICS_FUNC = "get_click_analytics"
```

### Option 2: Separate Test Endpoints

Create dedicated test endpoints:

```python
@router.post("/test/track-click", response_model=ClickTrackingResponse)
async def test_track_provider_click(request: ClickTrackingRequest):
    # Use TEST_PROVIDER_CLICKS_TABLE
    ...

@router.post("/test/analytics/clicks", response_model=List[ClickAnalytics])
async def test_get_click_analytics(request: ClickAnalyticsRequest):
    # Use test_get_click_analytics RPC
    ...
```

## Testing the Duplicate Click Fix

To test the duplicate click tracking fix in the test environment:

1. **Set environment to test mode**:
   ```bash
   # backend/.env
   APP_ENVIRONMENT=test
   ```

2. **Add test data**:
   ```sql
   -- Add a test provider to test_providers
   INSERT INTO test_providers (name, phone, email, dedicated_link)
   VALUES ('Test Breastpumps.com', '555-0100', 'test@example.com', 'https://test.example.com');
   ```

3. **Test the flow**:
   - Perform a search that triggers auto-redirect
   - Verify only ONE click is tracked (auto_redirect)
   - Manual clicks on the same provider should be prevented
   - Check `test_provider_clicks` table for results

4. **Verify analytics**:
   ```sql
   -- Check test analytics
   SELECT * FROM test_get_click_analytics();
   ```

## Cleanup

To remove test data without affecting production:

```sql
-- Clear all test clicks
TRUNCATE test_provider_clicks CASCADE;

-- Or delete specific test session
DELETE FROM test_provider_clicks WHERE session_id = 'your_test_session_id';
```

## Migration to Production

Once testing is complete and you're satisfied with the results:

1. Set `APP_ENVIRONMENT=production` in backend `.env`
2. Restart the backend server
3. The same code will now use production tables
4. Monitor production analytics for accuracy

## Notes

- Test tables share the same database as production
- Be careful not to mix test and production data
- Always verify which environment you're using before testing
- Consider adding a visual indicator in the UI when using test mode
