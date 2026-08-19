import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import z from "zod";
import { db } from "../db/index.ts";
import { collections } from "../db/schema.ts";
import { eq } from "drizzle-orm";

const createCollectionSchema = z.object({
  title: z.string().min(1),
  description: z.string(),
});

const updateCollectinoScheme = z.object({
  title: z.string().min(1),
  description: z.string(),
});

const collectionParamsSchema = z.object({
  id: z.coerce.number(),
});

export const collectionsRoutes: FastifyPluginAsyncZod = async (app) => {
  app.get("/api/users/me/collections", async () => {
    const result = await db.select().from(collections);
    return result;
  });
  app.post(
    "/api/users/me/collections",
    { schema: { body: createCollectionSchema } },
    async (request, reply) => {
      const body = request.body;

      const result = await db
        .insert(collections)
        .values({
          ownerId: request.user.id,
          title: body.title,
          description: body.description,
        })
        .returning();

      return reply.code(201).send(result[0]);
    },
  );
  app.get(
    "/api/users/me/collections/:id",
    { schema: { params: collectionParamsSchema } },
    async (req, reply) => {
      const { id } = req.params;
      const result = await db
        .select()
        .from(collections)
        .where(eq(collections.id, id));

      if (result.length === 0) {
        return reply.code(404).send({
          message: "Collection not found",
        });
      }

      return result[0];
    },
  );
  app.delete(
    "/api/users/me/collections/:id",
    { schema: { params: collectionParamsSchema } },
    async (request, reply) => {
      const { id } = request.params;

      await db.delete(collections).where(eq(collections.id, id));
      return reply.code(204).send();
    },
  );
  app.patch(
    "/api/users/me/collections/:id",
    {
      schema: { params: collectionParamsSchema, body: updateCollectinoScheme },
    },
    async (req, reply) => {
      const { id } = req.params;
      const { title, description } = req.body;

      const res = await db
        .update(collections)
        .set({ title: title, description: description })
        .where(eq(collections.id, id));

      if (res.length === 0) {
        return reply.code(404).send({ message: "No collection found" });
      }
      return res[0];
    },
  );
};
