/* eslint-disable no-undef */
import {Terminal} from '@xterm/xterm';
import {AttachAddon} from '@xterm/addon-attach';
import {FitAddon} from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';

const terminalContainer = document.getElementById('terminal');
const term = new Terminal({
  cursorBlink: true
});
const fitAddon = new FitAddon();
term.loadAddon(fitAddon);
term.open(terminalContainer);
fitAddon.fit();

const ws = new WebSocket(window.wsAddress);
term.loadAddon(new AttachAddon(ws));

term.focus();

term.resizeEventListener = () => {
  fitAddon.fit.call(fitAddon);
  setTimeout(() => fitAddon.fit.call(fitAddon), 100);
};

window.addEventListener('resize', term.resizeEventListener);

window.addEventListener('beforeunload', () => {
  window.removeEventListener('resize', term.resizeEventListener);
  term.dispose();
  ws.close();
});
