import {useThreadRuntime} from '@assistant-ui/react';
import {Thread} from '@assistant-ui/react-ui';
import {AssistantUiProvider} from './AssistantUiProvider';
import {ToolFallback} from './ToolFallback';

const disabledAvatar = {fallback: null};

const Main = () => {
  const runtime = useThreadRuntime();
  // runtime.subscribe(e => console.log(runtime.getState()));
  return (
    <main className='assistant-ui'>
      <Thread
        assistantAvatar={disabledAvatar}
        assistantMessage={{components: {ToolFallback: ToolFallback}}}
      />
    </main>
  );
};

export const App = () => {
  return (
    <AssistantUiProvider>
      <Main />
    </AssistantUiProvider>
  );
};
