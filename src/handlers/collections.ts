import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { deleteCollection, getCollections, postCollection, type postCollectionParams } from "../db/queries/collections.ts";
import z from "zod";

const postCollectionsRequestJSON = z.object({
  title: z.string(),
  description: z.string()
})

const deleteCollectionRequestJSON = z.object({
  id: z.number()
})

export const collectionsRoutes: FastifyPluginAsyncZod = async (app) => {
  app.get('/api/users/me/collections',
    async (request, reply) => {
      const collections = await getCollections(parseInt(request.user?.id!))
      if (!collections) {
        reply.notFound('No collection with such user id')
      }
      let collectionsJSON = []
      for (const c of collections) {
        collectionsJSON.push({ id: c.id, title: c.title })
      } 
      return collectionsJSON
    }
  )
  app.post('/api/users/me/collections', { schema: { body: postCollectionsRequestJSON } },
    async (request, reply) => {
      const params: postCollectionParams = {
        title: request.body.title,
        description: request.body.description,
      }
      const collection = await postCollection(parseInt(request.user?.id!), params)

      reply.code(201).send(collection)
    }
  )
  app.delete('/api/users/me/collections', { schema: { body:  deleteCollectionRequestJSON } },
    async (request, reply) => {
      const collection = await deleteCollection(request.body.id, parseInt(request.user?.id!))
      
      reply.code(200).send(collection)
    }
  )
}
