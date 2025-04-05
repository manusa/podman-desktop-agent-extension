import {Provider} from 'react-redux';
import {ChatInterface, store} from './';

export const App = () => {
  return (
    <Provider store={store}>
      <main className='aui'>
        <ChatInterface />
      </main>
    </Provider>
  );
};
