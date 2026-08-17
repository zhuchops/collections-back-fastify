import { prisma } from "../db.ts"

export const getCollections = async (userId: number) => {
    return prisma.collection.findMany({ where: { userId: userId } });
}

export const getCollection = async (id: number, userId: number) => {
  return prisma.collection.findUnique({ where: { id: id, userId: userId } });
}

export interface updateCollectionParams {
  title: string,
  description: string,
}

export const updateCollection = async (id: number, userId: number, params: updateCollectionParams) => {
  return prisma.collection.update({ where: { id: id, userId: userId }, data: { title: params.title } });
}

export interface postCollectionParams {
  title: string,
  description: string,
}

export const postCollection = async (userId: number, params: postCollectionParams) => {
  return prisma.collection.create({data: { userId: userId, title: params.title, description: params.description }})
}

export const deleteCollection = async (id: number, userId: number) => {
  return prisma.collection.delete({ where: { userId: userId, id: id }})
}