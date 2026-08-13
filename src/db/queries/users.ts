import { prisma } from "../db.ts";

export interface CreateUserParams {
  email: string,
  username: string,
  passwordHash: string
}

export const createUser = async (params: CreateUserParams) => {
  return await prisma.user.create({ data: { email: params.email, username: params.username, passwordHash: params.passwordHash } });
}

export const getUser = async (id: number) => {
  return await prisma.user.findUnique({ where: { id: id } });
};

export const getUserByEmail = async (email: string) => {
  return await prisma.user.findUnique({ where: { email: email } });
};

export const deleteUser = async (id: number) => {
  await prisma.user.delete({ where: { id: id } });
}

export interface UpdateUserParams {
  email: string,
  username: string
}

export const updateUser = async (id: number, data: UpdateUserParams) => {
  await prisma.user.update({ where: { id: id }, data: { email: data.email, username: data.username } });
}
