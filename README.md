# MediaMTX JWT Authentication Server

A simple Node.js/TypeScript authentication server that demonstrates JWT-based authentication for MediaMTX streaming server. This server issues JSON Web Tokens (JWTs) and exposes a JWKS (JSON Web Key Set) endpoint for MediaMTX to verify token signatures.

## What This Does

This authentication server provides two essential components for securing MediaMTX streams with JWT:

1. **JWKS Endpoint** (`/jwks-path`) - Exposes public keys that MediaMTX uses to verify JWT signatures
2. **Token Issuing Endpoint** (`/api/token`) - Issues JWTs with MediaMTX-specific permissions after validating user credentials

Instead of sharing master passwords, this approach allows you to issue time-limited tokens with granular permissions (which streams users can read or publish to).

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MediaMTX server (for the complete streaming setup)

## Installation

1. Clone or navigate to this repository:
```bash
cd /simple-jwks-endpoint
```

2. Install dependencies:
```bash
npm install
```

## Running the Server

Start the authentication server:
```bash
npm start
```

The server will start on `http://localhost:3000` and you should see:
```
Auth server running on http://localhost:3000
```

## API Endpoints

### 1. JWKS Endpoint (Public)

**GET** `/jwks-path`

Returns the public keys MediaMTX needs to verify JWT signatures.

**Example Request:**
```bash
curl http://localhost:3000/jwks-path
```

**Example Response:**
```json
{
  "keys": [
    {
      "kty": "RSA",
      "n": "0vx7agoebGcQSuuPiLJXZptN9nndrQmbXEps2aiAFbWhM78LhWx...",
      "e": "AQAB",
      "kid": "key-1",
      "use": "sig"
    }
  ]
}
```

### 2. Token Issuing Endpoint

**POST** `/api/token`

Issues a JWT after validating user credentials.

**Request Body:**
```json
{
  "username": "demo",
  "password": "demo"
}
```

**Example Request:**
```bash
curl -X POST http://localhost:3000/api/token \
  -H "Content-Type: application/json" \
  -d '{"username": "demo", "password": "demo"}'
```

**Example Response:**
```json
{
  "token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImtleS0xIn0..."
}
```

The issued JWT contains:
- `sub`: User identifier (username)
- `exp`: Token expiration (1 hour from issuance)
- `mediamtx_permissions`: Stream access permissions
  - `read`: Array of streams the user can view (e.g., `["camera_one", "camera_two"]`)
  - `publish`: Array of streams the user can publish to (empty by default)

## Integrating with MediaMTX

Update your `mediamtx.yml` configuration:

```yaml
# JWT Authentication Configuration
authMethod: jwt
authJWTJWKS: http://localhost:3000/jwks-path
authJWTClaimKey: mediamtx_permissions
```

**Configuration Breakdown:**
- `authMethod: jwt` - Enables JWT-based authentication
- `authJWTJWKS` - URL where MediaMTX fetches your public keys
- `authJWTClaimKey` - The JWT claim containing MediaMTX-specific permissions

   - MediaMTX receives the connection request with JWT
   - Fetches the public key from `/jwks-path`
   - Verifies the JWT signature cryptographically
   - Checks the `mediamtx_permissions` claim
   - Grants or denies access based on the permissions

## Customizing Permissions

Edit the permissions in `main.ts` to control stream access:

```typescript
mediamtx_permissions: {
  read: ['camera_one', 'camera_two', 'stream_xyz'],  // Streams user can view
  publish: ['user_stream']                            // Streams user can publish to
}
```

## Default Credentials

For demonstration purposes, the server uses hardcoded credentials:
- **Username:** `demo`
- **Password:** `demo`

**⚠️ Important:** In production, replace this with proper user authentication against your database.

## Security Notes

1. **Key Management:** This demo generates RSA keys on startup. In production:
   - Use persistent keys stored securely
   - Implement key rotation
   - Consider using a key management service

2. **User Authentication:** Replace the hardcoded demo credentials with:
   - Database-backed user authentication
   - Password hashing (bcrypt/argon2)

3. **HTTPS:** In production, serve both endpoints over HTTPS

4. **Token Expiration:** Tokens expire after 1 hour. Implement token refresh logic for better UX.

## Project Structure

```
.
├── main.ts           # Main server implementation
├── package.json      # Node.js dependencies and scripts
├── tsconfig.json     # TypeScript configuration
└── README.md         # This file
```

## Troubleshooting

**Issue:** "Invalid credentials" error
- **Solution:** Ensure you're using username `demo` and password `demo`

**Issue:** MediaMTX can't fetch JWKS
- **Solution:** Verify the auth server is running and the JWKS URL in `mediamtx.yml` is correct

**Issue:** Token expired error
- **Solution:** Request a new token (tokens expire after 1 hour)


## Further Reading
TODO: Append links here later when it's ready