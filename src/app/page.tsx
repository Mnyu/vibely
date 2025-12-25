'use client';

import { toast } from 'sonner';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useState } from 'react';

import { useTRPC } from '@/trpc/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';

const Page = () => {
  const router = useRouter();
  const [value, setValue] = useState('');
  const trpc = useTRPC();
  const createProject = useMutation(
    trpc.projects.create.mutationOptions({
      onSuccess: (data) => {
        // toast.success('Project created');
        router.push(`/projects/${data.id}`);
      },
      onError: (error) => {
        toast.error(error.message);
      },
    }),
  );

  return (
    <div className='h-screen w-screen flex items-center justify-center'>
      <div className='max-w-7xl mx-auto flex flex-col items-center justify-center gap-y-4'>
        <Input value={value} onChange={(e) => setValue(e.target.value)} />
        <Button disabled={createProject.isPending} onClick={() => createProject.mutate({ value: value })}>
          Submit
        </Button>
      </div>
    </div>
  );
};
export default Page;
