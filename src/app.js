import {Terminal} from '@xterm/xterm';
import '@xterm/xterm/css/xterm.css';
import {FitAddon} from '@xterm/addon-fit/src/FitAddon.js';

const term = new Terminal();
const fitAddon = new FitAddon();
term.loadAddon(fitAddon);
// eslint-disable-next-line no-undef
const terminalContainer = document.getElementById('terminal')
term.open(terminalContainer);
fitAddon.fit();
term.write('Greetings \x1B[1;3;31mProfessor Falken\x1B[0m $ ');
term.focus();
term.resizeEventListener = () => {
  fitAddon.fit();
};
// eslint-disable-next-line no-undef
window.addEventListener('resize', () => {
  setTimeout(term.resizeEventListener, 10);
});
