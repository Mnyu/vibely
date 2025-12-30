import { z } from 'zod';
import { generateSlug } from 'random-word-slugs';

import { prisma } from '@/lib/prisma';
import { inngest } from '@/inngest/client';
import { protectedProcedure, createTRPCRouter } from '@/trpc/init';
import { TRPCError } from '@trpc/server';

export const projectsRouter = createTRPCRouter({
  getOne: protectedProcedure
    .input(
      z.object({
        id: z.string().min(1, { message: 'Id is required' }),
      }),
    )
    .query(async ({ input, ctx }) => {
      const project = await prisma.project.findUnique({
        where: {
          id: input.id,
          userId: ctx.auth.userId,
        },
        // include: {
        //   fragment: true,
        // },
      });
      if (!project) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Project not found' });
      }
      return project;
    }),
  getMany: protectedProcedure.query(async ({ ctx }) => {
    const projects = await prisma.project.findMany({
      where: {
        userId: ctx.auth.userId,
      },
      orderBy: {
        updatedAt: 'desc',
      },
      // include: {
      //   fragment: true,
      // },
    });
    return projects;
  }),
  create: protectedProcedure
    .input(
      z.object({
        value: z.string().min(1, { message: 'Value is required' }).max(1000, { message: 'Value is too long' }),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const createdProj = await prisma.project.create({
        data: {
          name: generateSlug(2, {
            format: 'kebab',
            partsOfSpeech: ['adjective', 'noun'],
          }),
          userId: ctx.auth.userId,
          messages: {
            create: {
              content: input.value,
              role: 'USER',
              type: 'RESULT',
            },
          },
        },
      });
      await inngest.send({
        name: 'aicoder/run',
        data: {
          value: input.value,
          projectId: createdProj.id,
        },
      });
      return createdProj;
    }),
});
