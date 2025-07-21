# Breastpumps.com Discovery Flow

## Overview
This feature implements a special flow when Breastpumps.com appears in DME search results. Instead of just displaying the provider in the results list, the system automatically integrates with an external WordPress API to create a seamless user experience that redirects to a pre-filled form on the Breastpumps.com website.

## Flow Diagram
```
User Search → DME Results → Breastpumps.com Detected? 
                                     ↓ Yes
                          WordPress API Call (Get Providers)
                                     ↓
                          Match Insurance Provider?
                                     ↓ Yes
                          Order API Call (Create Account)
                                     ↓
                          Redirect with Resume Token
```

## Implementation Details

### 1. Detection Logic
The flow is triggered when:
- User performs a DME search
- Results include a provider with `dme_name.toLowerCase() === 'breastpumps.com'`

### 2. WordPress API Integration
**Endpoint**: `https://annabellastg.comitdevelopers.com/wp-json/hbe/v1/providers-by-state/${stateAbbr}`
- **Method**: GET
- **Parameter**: State abbreviation from user's search
- **Response**: Array of providers with `provider_display_name` field
- **Matching**: Filters results where `provider_display_name` matches the user's selected insurance provider

### 3. Order Creation
**Endpoint**: `https://annabellastg.comitdevelopers.com/wp-json/hbe/v1/order`
- **Method**: POST
- **Headers**: 
  - `X-HBE-API-Key`: 'M2LsdHS6PtLiZ2OLxTPRdfT+cBXHj9I3lav0O+O3hw4='
  - `Content-Type`: 'application/json'
- **Payload**:
  ```json
  {
    "extId": "${unixTimestamp}-ANB",
    "firstName": "",
    "lastName": "",
    "momEmail": "user's email from search",
    "provider": "matched provider ID from WordPress API",
    "momAddressState": "full state name",
    "referralDetails": ""
  }
  ```
- **Response**: Contains `resume_token` for redirect

### 4. Redirect
**URL**: `https://annabellastg.comitdevelopers.com/?gf_token=${resume_token}`
- Redirects user to WordPress site with pre-filled form using the resume token

## User Experience

### Loading States
The feature includes a custom loading experience with status updates:

1. **Initial State**: "Processing your request..."
2. **WordPress API Call**: "Connecting to insurance provider..."
3. **Order Creation**: "Creating your account..."
4. **Before Redirect**: "Redirecting to Breastpumps.com..."

### UI Design
- **Background**: Clean white overlay (instead of semi-transparent black)
- **Spinner**: Orange spinning loader
- **Status Text**: Displayed below spinner with current process status
- **Duration**: Loading screen remains visible until redirect occurs

## Error Handling

The system gracefully handles failures at each step:

1. **WordPress API Failure**: Falls back to showing normal search results
2. **No Matching Provider**: Shows original search results
3. **Order API Failure**: Displays search results without redirect
4. **No Resume Token**: Shows results with console error

## Code Structure

### State Management
```javascript
const [isBreastpumpsFlow, setIsBreastpumpsFlow] = useState(false);
const [loadingStatus, setLoadingStatus] = useState<string>('Processing your request...');
```

### Key Functions
- **Detection**: Checks for Breastpumps.com in search results
- **API Calls**: Sequential calls to WordPress and Order endpoints
- **State Lookup**: Converts state abbreviation to full name
- **Redirect**: Uses `window.location.href` with delay for UX

### File Modified
- `/src/app/page.tsx`: Main implementation of the discovery flow

## Security Considerations
- API key is hardcoded (should be moved to environment variables in production)
- All external API calls include error handling
- User data is only sent to authorized endpoints

## Future Enhancements
1. Move API key to environment variables
2. Add retry logic for failed API calls
3. Implement timeout handling for slow responses
4. Add analytics tracking for flow completion rates
5. Consider caching WordPress API responses for performance