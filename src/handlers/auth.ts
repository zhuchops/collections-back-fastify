import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import z from "zod";
import { hashPassword, verifyPassword } from "../helpers.js";
import { createUser, getUser, getUserByEmail, type CreateUserParams } from "../db/queries/users.ts";
import type { FastifyReply } from "fastify";
import jwt from 'jsonwebtoken';

const RegisterUserJSON = z.object({
  email: z.string(),
  username: z.string(),
  password: z.string()
})

const LoginUserJSON = z.object({
  email: z.string(),
  password: z.string()
})

export const authRoutes: FastifyPluginAsyncZod = async (app) => {
  app.post('/api/auth/register', { schema: { body: RegisterUserJSON, } },
    async(request, reply) => {
      const body = request.body;
      const passwordHash = await hashPassword(body.password);
      if (!passwordHash) {
        reply.internalServerError('Cannot hash password');
        return;
      }
      const params: CreateUserParams = { email: body.email, username: body.username, passwordHash: passwordHash }
      const user = await createUser(params);
      if (!user) {
          reply.conflict("User with such username or email already exists")
          return;
      }
      setAuthCookie(reply, user.id);
      return { id: user.id, email: user.email, username: user.username }
    }
  ),
  app.post('/api/auth/login', { schema: { body: LoginUserJSON } },
    async (request, reply) => {
      const user = await getUserByEmail(request.body.email);
      if (!user) {
        reply.unauthorized('Bad credentials');
        return;
      }
      if (!(await verifyPassword(request.body.password, user.passwordHash))) {
        reply.unauthorized('Bad credentials')
        return;
      }
      setAuthCookie(reply, user.id);
      return { email: user.email, username: user.username };
    }
  ),
  app.post('/api/auth/logout',
    async (request, reply) => {
      reply.setCookie('jwt', '', {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        maxAge: -1
      })
    }
  )
}

async function setAuthCookie(reply: FastifyReply, userId: number) {
  const tokenString = jwt.sign({ user_id: userId }, process.env.JWT_SECRET!, { expiresIn: '7d' });
  reply.setCookie('jwt', tokenString, {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7
  })
}
