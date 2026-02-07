import "dotenv/config";
import express from "express";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./auth.js";


const app = express();
const port = 4000;

// CORS middleware to allow requests from frontend
app.use(cors({
  origin: [
    "http://localhost:3000",      // Next.js default port
    "http://localhost:3001",      // Alternative Next.js port
    "http://localhost:5173",      // Vite default port
    "http://localhost:8000",      // Backend port
    "http://127.0.0.1:3000",      // Alternative localhost format
    "http://127.0.0.1:3001",      // Alternative localhost format
    "http://127.0.0.1:5173",      // Alternative localhost format
    "http://127.0.0.1:8000",      // Alternative localhost format
    "http://127.0.0.1:4000",      // Self for local access
    "http://localhost:4000",      // Same origin for auth service
  ],
  credentials: true,  // Allow credentials to be sent with requests
  optionsSuccessStatus: 200 // Some legacy browsers (IE11, various SmartTVs) choke on 204
}));

// Middleware to handle JSON parsing after auth
app.use(express.json());

// Mount Better Auth handlers on /api/auth/* routes
app.all("/api/auth/*", toNodeHandler(auth));

// Health check endpoint
app.get("/", (req, res) => {
  res.json({ message: "Better Auth service is running", status: "ok", version: "1.0.0" });
});

// JWKS endpoint for public key verification (handled by Better Auth)
// The /token endpoint should be automatically available when JWT plugin is enabled

app.listen(port, () => {
  console.log(`Better Auth service listening on port ${port}`);
  console.log(`Base URL: http://localhost:${port}`);
  console.log(`Auth endpoints available at: http://localhost:${port}/api/auth`);
  console.log(`JWKS endpoint available at: http://localhost:${port}/api/auth/v1/jwks`);
});