import {useThreadRuntime} from '@assistant-ui/react';
import {Thread} from '@assistant-ui/react-ui';
import {AssistantUiProvider} from './AssistantUiProvider.jsx';

const disabledAvatar = {fallback: null};

const ToolFallback = ({toolName, argsText, result}) => {
  // const [isCollapsed, setIsCollapsed] = useState(true);
  return (
    <div className='tool-fallback'>
      <div>
        <p>
          Used tool: <strong>{toolName}</strong>
        </p>
      </div>
      <div>
        <pre>{argsText}</pre>
      </div>
      {result && (
        <div>
          <p>Result:</p>
          <pre>
            {typeof result === 'string'
              ? result
              : JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

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
