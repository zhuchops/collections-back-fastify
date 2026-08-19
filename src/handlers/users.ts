import z from "zod";
import { db } from "../db/index.ts";
import { users } from "../db/schema.ts";
import { eq } from "drizzle-orm";
import type { FastifyPluginAsync } from "fastify";

export const getUserResponseSchema = z.object({
  email: z.string(),
  username: z.string(),
});

export const patchUserRequestSchema = z.object({
  email: z.string(),
  username: z.string(),
});

export const userRoutes: FastifyPluginAsync = async (app) => {
  app.get("/api/users/me", async (request, reply) => {
    const result = await db
      .select({
        email: users.email,
        username: users.username,
      })
      .from(users)
      .where(eq(users.id, request.user.id));
    const user = result[0];
    if (!user) {
      return reply.code(404).send({ message: "User with such id not found" });
    }
    return reply.send(user);
  });
  app.patch(
    "/api/users/me",
    { schema: { body: patchUserRequestSchema } },
    async (request, reply) => {
      // const params: UpdateUserParams = {
      //   email: request.body.email,
      //   username: request.body.username,
      // };
      // const id = request.user?.id!;
      // await updateUser(parseInt(id), params);
    },
  );
};
