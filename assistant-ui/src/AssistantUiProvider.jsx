import {AssistantRuntimeProvider} from '@assistant-ui/react';
import {useAISDKRuntime} from '@assistant-ui/react-ai-sdk';
import {useChat} from '@ai-sdk/react';
import {DefaultChatTransport} from 'ai';

export const AssistantUiProvider = ({children}) => {
  const chat = useChat({
    transport: new DefaultChatTransport({
      api: window.baseUrl + '/api/v1/messages'
    }),
    onError: err => {
      console.error('AssistantUiProvider error:', err);
    }
  });
  const runtime = useAISDKRuntime(chat);
  return (
    <AssistantRuntimeProvider runtime={runtime}>
      {children}
    </AssistantRuntimeProvider>
  );
};
