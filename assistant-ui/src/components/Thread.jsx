import {
  ActionBarPrimitive,
  BranchPickerPrimitive,
  ComposerPrimitive,
  MessagePrimitive,
  ThreadPrimitive
} from '@assistant-ui/react';
import {
  ArrowDownIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CopyIcon,
  PencilIcon,
  RefreshCwIcon,
  SendHorizontalIcon
} from 'lucide-react';
import {
  Button,
  cn,
  MarkdownText,
  ThreadRunning,
  ToolFallback,
  TooltipIconButton
} from './';

const CircleStopIcon = () => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      viewBox='0 0 16 16'
      fill='currentColor'
      width='16'
      height='16'
    >
      <rect width='10' height='10' x='3' y='3' rx='2' />
    </svg>
  );
};

const BranchPicker = ({className, ...rest}) => {
  return (
    <BranchPickerPrimitive.Root
      hideWhenSingleBranch
      className={cn(
        'text-muted-foreground inline-flex items-center text-xs',
        className
      )}
      {...rest}
    >
      <BranchPickerPrimitive.Previous asChild>
        <TooltipIconButton tooltip='Previous'>
          <ChevronLeftIcon />
        </TooltipIconButton>
      </BranchPickerPrimitive.Previous>
      <span className='font-medium'>
        <BranchPickerPrimitive.Number /> / <BranchPickerPrimitive.Count />
      </span>
      <BranchPickerPrimitive.Next asChild>
        <TooltipIconButton tooltip='Next'>
          <ChevronRightIcon />
        </TooltipIconButton>
      </BranchPickerPrimitive.Next>
    </BranchPickerPrimitive.Root>
  );
};

const AssistantActionBar = () => {
  return (
    <ActionBarPrimitive.Root
      hideWhenRunning
      autohide='not-last'
      autohideFloat='single-branch'
      className='text-muted-foreground flex gap-1 col-start-3 row-start-2 -ml-1 data-[floating]:bg-background data-[floating]:absolute data-[floating]:rounded-md data-[floating]:border data-[floating]:p-1 data-[floating]:shadow-sm'
    >
      <ActionBarPrimitive.Copy asChild>
        <TooltipIconButton tooltip='Copy'>
          <MessagePrimitive.If copied>
            <CheckIcon />
          </MessagePrimitive.If>
          <MessagePrimitive.If copied={false}>
            <CopyIcon />
          </MessagePrimitive.If>
        </TooltipIconButton>
      </ActionBarPrimitive.Copy>
      <ActionBarPrimitive.Reload asChild>
        <TooltipIconButton tooltip='Refresh'>
          <RefreshCwIcon />
        </TooltipIconButton>
      </ActionBarPrimitive.Reload>
    </ActionBarPrimitive.Root>
  );
};

const AssistantMessage = () => {
  return (
    <MessagePrimitive.Root className='grid grid-cols-[auto_auto_1fr] grid-rows-[auto_1fr] relative w-full max-w-[var(--thread-max-width)] py-4'>
      <div className='text-foreground max-w-[calc(var(--thread-max-width)*0.8)] break-words leading-7 col-span-2 col-start-2 row-start-1 my-1.5'>
        <MessagePrimitive.Content
          components={{
            Text: MarkdownText,
            tools: {Fallback: ToolFallback}
          }}
        />
      </div>

      <AssistantActionBar />

      <BranchPicker className='col-start-2 row-start-2 -ml-2 mr-2' />
    </MessagePrimitive.Root>
  );
};

const EditComposer = () => {
  return (
    <ComposerPrimitive.Root className='bg-muted my-4 flex w-full max-w-[var(--thread-max-width)] flex-col gap-2 rounded-xl'>
      <ComposerPrimitive.Input className='text-foreground flex h-8 w-full resize-none bg-transparent p-4 pb-0 outline-none' />

      <div className='mx-3 mb-3 flex items-center justify-center gap-2 self-end'>
        <ComposerPrimitive.Cancel asChild>
          <Button variant='ghost'>Cancel</Button>
        </ComposerPrimitive.Cancel>
        <ComposerPrimitive.Send asChild>
          <Button>Send</Button>
        </ComposerPrimitive.Send>
      </div>
    </ComposerPrimitive.Root>
  );
};

const UserActionBar = () => {
  return (
    <ActionBarPrimitive.Root
      hideWhenRunning
      autohide='not-last'
      className='flex flex-col items-end col-start-1 row-start-2 mr-3 mt-2.5'
    >
      <ActionBarPrimitive.Edit asChild>
        <TooltipIconButton tooltip='Edit'>
          <PencilIcon />
        </TooltipIconButton>
      </ActionBarPrimitive.Edit>
    </ActionBarPrimitive.Root>
  );
};

const UserMessage = () => {
  return (
    // <MessagePrimitive.Root className='grid auto-rows-auto grid-cols-[minmax(72px,1fr)_auto] gap-y-2 [&:where(>*)]:col-start-2 w-full max-w-[var(--thread-max-width)] py-4'>
    <MessagePrimitive.Root className='grid auto-rows-auto grid-cols-[minmax(72px,1fr)_auto] gap-y-2 w-full max-w-[var(--thread-max-width)] py-4'>
      <UserActionBar />

      <div className='bg-muted text-foreground max-w-[calc(var(--thread-max-width)*0.8)] break-words rounded-3xl px-5 py-2.5 col-start-2 row-start-2'>
        <MessagePrimitive.Content />
      </div>

      <BranchPicker className='col-span-full col-start-1 row-start-3 -mr-1 justify-end' />
    </MessagePrimitive.Root>
  );
};

const ComposerAction = () => {
  return (
    <>
      <ThreadPrimitive.If running={false}>
        <ComposerPrimitive.Send asChild>
          <TooltipIconButton
            tooltip='Send'
            variant='default'
            className='my-2.5 size-8 p-2 transition-opacity ease-in'
          >
            <SendHorizontalIcon />
          </TooltipIconButton>
        </ComposerPrimitive.Send>
      </ThreadPrimitive.If>
      <ThreadPrimitive.If running>
        <ComposerPrimitive.Cancel asChild>
          <TooltipIconButton
            tooltip='Cancel'
            variant='default'
            className='my-2.5 size-8 p-2 transition-opacity ease-in'
          >
            <CircleStopIcon />
          </TooltipIconButton>
        </ComposerPrimitive.Cancel>
      </ThreadPrimitive.If>
    </>
  );
};

const Composer = () => {
  return (
    <ComposerPrimitive.Root className='focus-within:border-ring/20 flex w-full flex-wrap items-end rounded-lg border bg-inherit px-2.5 shadow-sm transition-colors ease-in'>
      <ComposerPrimitive.Input
        rows={1}
        autoFocus
        placeholder='Write a message...'
        className='placeholder:text-muted-foreground max-h-40 flex-grow resize-none border-none bg-transparent px-2 py-4 text-sm outline-none focus:ring-0 disabled:cursor-not-allowed'
      />
      <ComposerAction />
    </ComposerPrimitive.Root>
  );
};

const ThreadWelcomeSuggestions = () => {
  return (
    <div className='mt-3 flex w-full items-stretch justify-center gap-4'>
      <ThreadPrimitive.Suggestion
        className='hover:bg-muted/80 flex max-w-sm grow basis-0 flex-col items-center justify-center rounded-lg border p-3 transition-colors ease-in'
        prompt='List all my Podman containers, format as Markdown table'
        method='replace'
        autoSend
      >
        <span className='line-clamp-2 text-ellipsis text-sm font-semibold'>
          List all my Podman containers
        </span>
      </ThreadPrimitive.Suggestion>
      <ThreadPrimitive.Suggestion
        className='hover:bg-muted/80 flex max-w-sm grow basis-0 flex-col items-center justify-center rounded-lg border p-3 transition-colors ease-in'
        prompt='List all my Podman images, format as Markdown table'
        method='replace'
        autoSend
      >
        <span className='line-clamp-2 text-ellipsis text-sm font-semibold'>
          List all my Podman images
        </span>
      </ThreadPrimitive.Suggestion>
    </div>
  );
};

const ThreadWelcome = () => {
  return (
    <ThreadPrimitive.Empty>
      <div className='flex w-full max-w-[var(--thread-max-width)] flex-grow flex-col'>
        <div className='flex w-full flex-grow flex-col items-center justify-center'>
          <p className='mt-4 font-medium'>How can I help you today?</p>
        </div>
        <ThreadWelcomeSuggestions />
      </div>
    </ThreadPrimitive.Empty>
  );
};

const ThreadScrollToBottom = () => {
  return (
    <ThreadPrimitive.ScrollToBottom asChild>
      <TooltipIconButton
        tooltip='Scroll to bottom'
        variant='outline'
        className='absolute -top-8 rounded-full disabled:invisible'
      >
        <ArrowDownIcon />
      </TooltipIconButton>
    </ThreadPrimitive.ScrollToBottom>
  );
};

export const Thread = () => {
  return (
    <ThreadPrimitive.Root
      className='bg-background box-border h-full flex flex-col overflow-hidden'
      style={{
        '--thread-max-width': '42rem'
      }}
    >
      <ThreadPrimitive.Viewport className='flex h-full flex-col items-center overflow-y-auto scroll-smooth bg-inherit px-4 pt-8'>
        <ThreadWelcome />

        <ThreadPrimitive.Messages
          components={{
            UserMessage: UserMessage,
            EditComposer: EditComposer,
            AssistantMessage: AssistantMessage
          }}
        />

        <ThreadRunning />

        <ThreadPrimitive.If empty={false}>
          <div className='min-h-8 flex-grow' />
        </ThreadPrimitive.If>

        <div className='sticky bottom-0 mt-3 flex w-full max-w-[var(--thread-max-width)] flex-col items-center justify-end rounded-t-lg bg-inherit pb-4'>
          <ThreadScrollToBottom />
          <Composer />
        </div>
      </ThreadPrimitive.Viewport>
    </ThreadPrimitive.Root>
  );
};
