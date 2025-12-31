import { AgentResult, TextMessage } from '@inngest/agent-kit';
import Sandbox from 'e2b';
import { SANDBOX_TIMEOUT } from './types';

export const getSandbox = async (sandboxId: string) => {
  const sandbox = await Sandbox.connect(sandboxId);
  await sandbox.setTimeout(SANDBOX_TIMEOUT); // default is 5 minutes
  return sandbox;
};

export const lastAssistantTextMessageContent = (result: AgentResult) => {
  const lastAssistantTextMessageIndex = result.output.findLastIndex((message) => message.role === 'assistant');
  const message = result.output[lastAssistantTextMessageIndex] as TextMessage | undefined;
  return message?.content
    ? typeof message.content === 'string'
      ? message.content
      : message.content.map((c) => c.text).join('')
    : undefined;
};
