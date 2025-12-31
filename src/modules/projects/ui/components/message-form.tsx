import { useState } from 'react';
import { toast } from 'sonner';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import TextareaAutosize from 'react-textarea-autosize';
import { ArrowUpIcon, Loader2Icon } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

import { cn } from '@/lib/utils';
import { Form, FormField } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { useTRPC } from '@/trpc/client';
import Usage from './usage';

interface Props {
  projectId: string;
}

const formSchema = z.object({
  value: z.string().min(1, { message: 'Value is required' }).max(1000, { message: 'Value is too long' }),
});

const MessageForm = ({ projectId }: Props) => {
  const router = useRouter();
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { data: usage } = useQuery(trpc.usage.status.queryOptions());

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      value: '',
    },
  });

  const createMessage = useMutation(
    trpc.messages.create.mutationOptions({
      onSuccess: (data) => {
        form.reset();
        queryClient.invalidateQueries(trpc.messages.getMany.queryOptions({ projectId: projectId }));
        queryClient.invalidateQueries(trpc.usage.status.queryOptions());
      },
      onError: (error) => {
        toast.error(error.message);
        if (error.data?.code === 'TOO_MANY_REQUESTS') {
          router.push('/pricing');
        }
      },
    }),
  );

  const [isFocused, setIsFocused] = useState(false);
  const showUsage = !!usage;
  const isPending = createMessage.isPending;
  const isButtonDisabled = isPending || !form.formState.isValid;

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    await createMessage.mutateAsync({
      value: data.value,
      projectId: projectId,
    });
  };

  return (
    <Form {...form}>
      {showUsage && <Usage credits={usage.remainingPoints} msBeforeNext={usage.msBeforeNext} />}
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn(
          'relative border p-4 pt-1 rounded-xl bg-sidebar dark:bg-sidebar transition-all',
          isFocused && 'shadow-xs',
          showUsage && 'rounded-t-none',
        )}
      >
        <FormField
          control={form.control}
          name='value'
          render={({ field }) => (
            <TextareaAutosize
              {...field}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              minRows={2}
              maxRows={8}
              className='pt-4 resize-none border-none w-full outline-none bg-transparent'
              placeholder='What would you like to build?'
              disabled={isPending}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                  e.preventDefault();
                  form.handleSubmit(onSubmit)(e);
                }
              }}
            />
          )}
        />
        <div className='flex gap-x-2 items-end justify-between pt-2'>
          <div className='text-[12px] text-muted-foreground font-mono'>
            <kbd className='ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[12px] font-medium text-muted-foreground'>
              <span>&#8984;</span>Enter
            </kbd>
            &nbsp;to sumbit
          </div>
          <Button
            className={cn('size-8 rounded-full', isButtonDisabled && 'bg-muted-foreground border')}
            disabled={isButtonDisabled}
          >
            {isPending ? <Loader2Icon className='size-4 animate-spin' /> : <ArrowUpIcon />}
          </Button>
        </div>
      </form>
    </Form>
  );
};
export default MessageForm;
