import { z } from 'zod';
import { generateSlug } from 'random-word-slugs';

import { prisma } from '@/lib/prisma';
import { inngest } from '@/inngest/client';
import { baseProcedure, createTRPCRouter } from '@/trpc/init';
import { TRPCError } from '@trpc/server';

export const projectsRouter = createTRPCRouter({
  getOne: baseProcedure
    .input(
      z.object({
        id: z.string().min(1, { message: 'Id is required' }),
      }),
    )
    .query(async ({ input }) => {
      const project = await prisma.project.findUnique({
        where: {
          id: input.id,
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
  getMany: baseProcedure.query(async () => {
    const projects = await prisma.project.findMany({
      orderBy: {
        updatedAt: 'desc',
      },
      // include: {
      //   fragment: true,
      // },
    });
    return projects;
  }),
  create: baseProcedure
    .input(
      z.object({
        value: z.string().min(1, { message: 'Value is required' }).max(1000, { message: 'Value is too long' }),
      }),
    )
    .mutation(async ({ input }) => {
      const createdProj = await prisma.project.create({
        data: {
          name: generateSlug(2, {
            format: 'kebab',
            partsOfSpeech: ['adjective', 'noun'],
          }),
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
