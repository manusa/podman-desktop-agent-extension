import {afterEach, beforeEach, describe, expect, test, vi} from 'vitest';
import {findFreePort, startWebSocketServer} from './net';

describe('net', () => {
  test('findFreePort()', async () => {
    const port = await findFreePort();
    expect(port).toBeGreaterThan(0);
  });
  describe('startWebSocketServer()', () => {
    let configuration;
    beforeEach(() => {
      configuration = {
        load: vi.fn()
      };
    });
    test('listens on a random port', async () => {
      const server = await startWebSocketServer(configuration);
      expect(server.address().port).toBeGreaterThan(0);
      server.close();
    });
    describe('on connection', () => {
      let server;
      let ws;
      let messages;
      beforeEach(async () => {
        server = await startWebSocketServer(configuration);
        ws = new WebSocket(`ws://localhost:${server.address().port}`);
        messages = [];
        ws.onmessage = e => messages.push(e.data);
        await new Promise(resolve => (ws.onopen = resolve));
      });
      afterEach(() => {
        ws.close();
        server.close();
      });
      test('logs user connected', async () => {
        expect(console.logs).toContain('user connected');
      });
      test('sends a greeting message', async () => {
        await vi.waitUntil(() => messages.length > 1);
        expect(messages).toContain(
          'Greetings \x1B[1;3;31mProfessor Falken\x1B[0m\n\x1B[1G'
        );
      });
    });
    describe('close()', () => {
      let server;
      beforeEach(async () => {
        server = await startWebSocketServer(configuration);
        server.close();
      });
      test('logs closing WebSocket server', () => {
        expect(console.logs).toContain('Closing WebSocket server');
      });
      test('closes the server', () => {
        expect(server.listening).toBe(false);
      });
    });
  });
});
