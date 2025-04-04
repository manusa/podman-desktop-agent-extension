import {ThreadPrimitive} from '@assistant-ui/react';

export const ThreadWelcome = ({message = 'How can I help you today?'}) => {
  return (
    <ThreadPrimitive.Empty>
      <div>{message}</div>
    </ThreadPrimitive.Empty>
  );
};
