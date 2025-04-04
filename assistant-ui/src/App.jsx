import {AssistantUiProvider} from './AssistantUiProvider';
import {Thread} from './components';

export const App = () => {
  return (
    <AssistantUiProvider>
      <main className='aui'>
        <Thread />
      </main>
    </AssistantUiProvider>
  );
};
