import {AssistantUiProvider} from './AssistantUiProvider';
import {Thread, ToolFallback} from './components';

export const App = () => {
  return (
    <AssistantUiProvider>
      <main className='assistant-ui'>
        <Thread
          assistantMessage={{
            components: {
              ToolFallback: ToolFallback
            }
          }}
        />
      </main>
    </AssistantUiProvider>
  );
};
