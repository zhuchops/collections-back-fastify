import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { getUser, updateUser, type UpdateUserParams } from "../db/queries/users.ts";
import z from "zod";

export const getUserResponseJSON = z.object({
  email: z.string(),
  username: z.string()
})

export const patchUserRequestJSON = z.object({
  email: z.string(),
  username: z.string()
})

export const userRoutes: FastifyPluginAsyncZod = async (app) => {
  app.get('/api/users/me', { schema: { response: { 200: getUserResponseJSON } } },
    async (request, reply) => {
      const user = await getUser(parseInt(request.user?.id!));
      if (!user) {
        reply.notFound('User not found');
        return;
      }
      return {
        email: user.email,
        username: user.username
      };
    }
  );
  app.patch('/api/users/me', { schema: { body: patchUserRequestJSON } },
    async (request, reply) => {
      const params: UpdateUserParams = { email: request.body.email, username: request.body.username };
      const id = request.user?.id!;
      await updateUser(parseInt(id), params)
    }
  );
}
