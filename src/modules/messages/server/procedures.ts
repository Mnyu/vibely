import { z } from 'zod';

import { TRPCError } from '@trpc/server';
import { prisma } from '@/lib/prisma';
import { inngest } from '@/inngest/client';
import { protectedProcedure, createTRPCRouter } from '@/trpc/init';

export const messagesRouter = createTRPCRouter({
  getMany: protectedProcedure
    .input(
      z.object({
        projectId: z.string().min(1, { message: 'Project Id is required' }),
      }),
    )
    .query(async ({ input, ctx }) => {
      const messages = await prisma.message.findMany({
        where: {
          projectId: input.projectId,
          project: {
            userId: ctx.auth.userId,
          },
        },
        orderBy: {
          updatedAt: 'asc',
        },
        include: {
          fragment: true,
        },
      });
      return messages;
    }),
  create: protectedProcedure
    .input(
      z.object({
        value: z.string().min(1, { message: 'Value is required' }).max(1000, { message: 'Value is too long' }),
        projectId: z.string().min(1, { message: 'Project Id is required' }),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const existingProject = await prisma.project.findUnique({
        where: {
          id: input.projectId,
          userId: ctx.auth.userId,
        },
      });
      if (!existingProject) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Project not found' });
      }
      const createdMsg = await prisma.message.create({
        data: {
          projectId: existingProject.id,
          content: input.value,
          role: 'USER',
          type: 'RESULT',
        },
      });
      await inngest.send({
        name: 'aicoder/run',
        data: {
          value: input.value,
          projectId: existingProject.id,
        },
      });
      return createdMsg;
    }),
});
