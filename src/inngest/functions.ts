import Sandbox from 'e2b';
import { inngest } from './client';
import { createAgent, gemini } from '@inngest/agent-kit';
import { getSandbox } from './utils';

export const helloWorld = inngest.createFunction(
  { id: 'hello-world' },
  { event: 'test/hello.world' },
  async ({ event, step }) => {
    // await step.sleep('wait-a-moment', '5s');
    const sandboxId = await step.run('get-sandbox-id', async () => {
      const sandbox = await Sandbox.create(process.env.E2B_SANDBOX_ID_NEXTJS!);
      return sandbox.sandboxId;
    });

    const codeAgent = createAgent({
      name: 'code-agent',
      system:
        'You are an expert next.js developer. You write readable, maintainable code. You write simple Next.js & React snippets',
      model: gemini({ model: 'gemini-2.5-flash' }),
    });
    const { output } = await codeAgent.run(`Write the code snippet for : ${event.data.value}`);

    const sandboxUrl = await step.run('get-sandbox-url', async () => {
      const sandbox = await getSandbox(sandboxId);
      const host = sandbox.getHost(3000);
      return `https://${host}`;
    });

    return { output, sandboxUrl };
  },
);
