import {afterEach, beforeEach, describe, expect, test, vi} from 'vitest';
import {findFreePort} from './net.js';
import {newAiSdk} from './ai-sdk.js';

describe('ai-sdk', () => {
  let configuration;
  beforeEach(() => {
    configuration = {
      load: vi.fn()
    };
  });
  describe('start()', () => {
    let aiSdk;
    beforeEach(async () => {
      configuration.aiSdkPort = await findFreePort();
      aiSdk = newAiSdk({configuration});
      aiSdk.start();
    });
    afterEach(() => {
      aiSdk.close();
    });
    test('logs server starting', async () => {
      expect(console.logs).toContain('AI SDK: Starting...');
    });
    test('sets up express server', () => {
      expect(aiSdk._server).not.toBeNull();
    });
    test('listens on configured port', async () => {
      expect(aiSdk._server.address().port).toBe(configuration.aiSdkPort);
      expect(aiSdk._server.listening).toBe(true);
    });
  });
  describe('close()', () => {
    let aiSdk;
    beforeEach(async () => {
      configuration.aiSdkPort = await findFreePort();
      aiSdk = newAiSdk({configuration});
      aiSdk.start();
      await aiSdk.close();
    });
    test('logs server closing', async () => {
      expect(console.logs).toContain('AI SDK: Closing...');
    });
    test('closes the server', () => {
      expect(aiSdk._server.listening).toBe(false);
    });
  });
  describe('cors', () => {
    let aiSdk;
    let response;
    beforeEach(async () => {
      configuration.aiSdkPort = await findFreePort();
      aiSdk = newAiSdk({configuration});
      aiSdk.start();
      response = await fetch(
        `http://localhost:${configuration.aiSdkPort}/api/v1/messages`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({message: 'test'})
        }
      );
    });
    afterEach(() => {
      aiSdk.close();
    });
    test('Has Access-Control-Allow-Origin=*', async () => {
      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
    });
    test('Has Access-Control-Allow-Headers', async () => {
      expect(response.headers.get('Access-Control-Allow-Headers')).toBe(
        'Origin, X-Requested-With, Content-Type, Accept'
      );
    });
  });
});
