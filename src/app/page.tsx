// import { Suspense } from 'react';
// import { getQueryClient, trpc } from '@/trpc/server';
// import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
// import Client from './client';

// const Page = async () => {
//   const queryClient = getQueryClient();
//   void queryClient.prefetchQuery(trpc.customHello.queryOptions({ text: 'MY-WORLD!' }));

//   return (
//     <HydrationBoundary state={dehydrate(queryClient)}>
//       <Suspense fallback={<p>Loading...</p>}>
//         <Client />
//       </Suspense>
//     </HydrationBoundary>
//   );
// };
// export default Page;

'use client';

import { toast } from 'sonner';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';

import { useTRPC } from '@/trpc/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const Page = () => {
  const [value, setValue] = useState('');
  const trpc = useTRPC();
  const invoke = useMutation(
    trpc.invoke.mutationOptions({
      onSuccess: () => {
        toast.success('Background job started');
      },
    }),
  );

  return (
    <div className='p-2 max-w-7xl'>
      <Input value={value} onChange={(e) => setValue(e.target.value)} />
      <Button disabled={invoke.isPending} onClick={() => invoke.mutate({ value: value })}>
        Invoke Background Job
      </Button>
    </div>
  );
};
export default Page;
