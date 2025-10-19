import express from "express";
import jwt from "jsonwebtoken";
import { generateKeyPairSync, createPublicKey } from "crypto";

const app = express();
app.use(express.json());

// Generate RSA key pair (in production, use persistent keys)
const { privateKey, publicKey } = generateKeyPairSync("rsa", {
  modulusLength: 2048,
  publicKeyEncoding: { type: "spki", format: "pem" },
  privateKeyEncoding: { type: "pkcs8", format: "pem" },
});

// Convert public key to JWK format
function pemToJwk(pem: string) {
  const key = createPublicKey(pem);
  return key.export({ format: "jwk" });
}

// JWKS endpoint - MediaMTX fetches this
app.get("/jwks-path", (req, res) => {
  const jwk = pemToJwk(publicKey);
  res.json({
    keys: [
      {
        ...jwk,
        kid: "key-1",
        use: "sig",
        alg: "RS256",
      },
    ],
  });
});

// Token issuing endpoint - your web app calls this
app.post("/api/token", (req, res) => {
  const { username, password } = req.body;

  // Validate user credentials (implement your logic here)
  if (username === "demo" && password === "demo") {
    const token = jwt.sign(
      {
        sub: username,
        exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour
        mediamtx_permissions: [
          { action: "read", path: "camera_one" },
          { action: "read", path: "camera_two" },

          { action: "publish", path: "camera_one" },
          { action: "publish", path: "camera_two" },

          { action: "read", path: "camera1" },
          { action: "read", path: "webcam" },
        
          { action: "publish", path: "camera1" },
          { action: "publish", path: "webcam" },
        ],
      },
      privateKey,
      {
        algorithm: "RS256",
        keyid: "key-1",
      }
    );

    res.json({ token });
  } else {
    res.status(401).json({ error: "Invalid credentials" });
  }
});

app.listen(3000, () => {
  console.log("Auth server running on http://localhost:3000");
});
