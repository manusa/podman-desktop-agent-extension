import {createRoot} from 'react-dom/client';
import {App} from './App.jsx';
import '@assistant-ui/react-ui/styles/index.css';
import '@assistant-ui/react-ui/styles/modal.css';
import './styles.css';

const root = createRoot(document.getElementById('root'));
root.render(<App />);
