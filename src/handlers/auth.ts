import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import z from "zod";
import { hashPassword, verifyPassword } from "../helpers.js";
import type { FastifyReply } from "fastify";
import jwt from "jsonwebtoken";
import { db } from "../db/index.ts";
import { sessions, users } from "../db/schema.ts";
import { eq } from "drizzle-orm";
import { randomBytes } from "node:crypto";

const registerSchema = z.object({
  email: z.string(),
  username: z.string(),
  password: z.string(),
});

const loginSchema = z.object({
  email: z.string(),
  password: z.string(),
});

export const authRoutes: FastifyPluginAsyncZod = async (app) => {
  (app.post(
    "/api/auth/register",
    { schema: { body: registerSchema } },
    async (request, reply) => {
      const { email, username, password } = request.body;
      const passwordHash = await hashPassword(password);
      if (!passwordHash) {
        return reply.code(500).send({ message: "Cannot hash password" });
      }

      const result = await db
        .insert(users)
        .values({
          email: email,
          username: username,
          passwordHash: passwordHash,
        })
        .returning({
          id: users.id,
          email: users.email,
          username: users.username,
        });

      const user = result[0];

      setAuthCookie(user.id, reply);

      return reply.code(201).send(user);
    },
  ),
    app.post(
      "/api/auth/login",
      { schema: { body: loginSchema } },
      async (request, reply) => {
        const { email, password } = request.body;
        const result = await db
          .select()
          .from(users)
          .where(eq(users.email, email));
        if (result.length === 0) {
          return reply.code(401).send({ message: "Invalid email or password" });
        }
        const user = result[0];
        if (!(await verifyPassword(password, user.passwordHash))) {
          return reply.code(401).send({ message: "Invalid email or password" });
        }

        setAuthCookie(user.id, reply);

        return {
          id: user.id,
          email: user.email,
          username: user.username,
        };
      },
    ),
    app.delete("/api/auth/logout", async (request, reply) => {
      const sessionId = request.cookies.session;

      if (sessionId) {
        await db.delete(sessions).where(eq(sessions.id, sessionId));
      }

      reply.clearCookie("session", {
        path: "/",
      });

      return reply.code(204).send();
    }));
};

export async function setAuthCookie(userId: number, reply: FastifyReply) {
  const sessionId = randomBytes(32).toString("hex");

  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);

  await db.insert(sessions).values({
    id: sessionId,
    userId: userId,
    expiresAt: expiresAt,
  });

  reply.setCookie("session", sessionId, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}
