import { Template, defaultBuildLogger } from 'e2b'
import { template } from './template'

async function main() {
  await Template.build(template, {
    alias: 'vibely-nextjs-dev',
    onBuildLogs: defaultBuildLogger(),
  });
}

main().catch(console.error);