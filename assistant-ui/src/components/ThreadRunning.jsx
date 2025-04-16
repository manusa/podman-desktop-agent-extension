import {ThreadPrimitive} from '@assistant-ui/react';

export const ThreadRunning = () => {
  return (
    <ThreadPrimitive.If running={true}>
      <div>
        <div className='flex items-start mr-auto gap-2'>
          <div className='flex items-center gap-1 rounded-2xl bg-muted px-4 py-2 h-8'>
            <div className='w-1.5 h-1.5 rounded-full bg-foreground/50 animate-[pulse_1.5s_ease-in-out_infinite]'></div>
            <div className='w-1.5 h-1.5 rounded-full bg-foreground/50 animate-[pulse_1.5s_ease-in-out_0.5s_infinite]'></div>
            <div className='w-1.5 h-1.5 rounded-full bg-foreground/50 animate-[pulse_1.5s_ease-in-out_1s_infinite]'></div>
          </div>
        </div>
      </div>
    </ThreadPrimitive.If>
  );
};
