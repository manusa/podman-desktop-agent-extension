import {Provider} from 'react-redux';
import {AssistantUiProvider} from './AssistantUiProvider';
import {ChatInterface, store} from './';

export const App = () => {
  return (
    <Provider store={store}>
      <AssistantUiProvider>
        <main className='aui'>
          <ChatInterface />
        </main>
      </AssistantUiProvider>
    </Provider>
  );
};
