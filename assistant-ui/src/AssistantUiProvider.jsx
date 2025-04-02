import {AssistantRuntimeProvider} from '@assistant-ui/react';
import {useChatRuntime} from '@assistant-ui/react-ai-sdk';

export const AssistantUiProvider = ({children}) => {
  const runtime = useChatRuntime({
    api: window.baseUrl + '/api/v1/messages',
    onError: err => {
      console.error('AssistantUiProvider error:', err);
    }
  });
  return (
    <AssistantRuntimeProvider runtime={runtime}>
      {children}
    </AssistantRuntimeProvider>
  );
};
