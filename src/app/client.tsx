'use client';

import { useTRPC } from '@/trpc/client';
import { useSuspenseQuery } from '@tanstack/react-query';

const Client = () => {
  const trpc = useTRPC();
  // const { data } = useSuspenseQuery(trpc.customHello.queryOptions({ text: 'MY-WORLD!' }));
  const { data } = { data: {} };

  return <div>{JSON.stringify(data)}</div>;
};
export default Client;
