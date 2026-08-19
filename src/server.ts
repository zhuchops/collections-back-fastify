import { loadEnvFile } from "node:process";
import cookie from "@fastify/cookie";
import cors from "@fastify/cors";
import Fastify from "fastify";
import { authRoutes } from "./handlers/auth.ts";
import {
  serializerCompiler,
  validatorCompiler,
} from "fastify-type-provider-zod";
import { authenticate } from "./middleware/authenticate.ts";
import { userRoutes } from "./handlers/users.ts";
import { collectionsRoutes } from "./handlers/collections.ts";

try {
  loadEnvFile();
} catch {
  // Ignore if .env doesn't exist
}

const app = Fastify({ logger: true });

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

// libraries
app.register(cookie);
app.register(cors, {
  origin: true,
  credentials: true,
});

// public routes
app.register(authRoutes);
app.get("/api/health", async () => {
  return {
    statusCode: "ok",
  };
});

// private routes
app.register(async (protectedRoutes) => {
  protectedRoutes.addHook("preHandler", authenticate);
  protectedRoutes.register(userRoutes);
  protectedRoutes.register(collectionsRoutes);
});

app.listen({ port: 8080, host: "0.0.0.0" });
