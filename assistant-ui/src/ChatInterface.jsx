import {Toaster, toast} from 'sonner';
import {Thread} from './components/';
import {AssistantUiProvider} from './AssistantUiProvider';

export const ChatInterface = () => {
  return (
    <>
      <AssistantUiProvider>
        <Thread />
      </AssistantUiProvider>
      <Toaster />
    </>
  );
};
