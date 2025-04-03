import {beforeEach, describe, expect, test, vi} from 'vitest';
import extensionApi from '@podman-desktop/api';
import os from 'node:os';
import {newConfiguration} from './configuration';

vi.mock('node:os');

describe('configuration', () => {
  describe('newConfiguration()', () => {
    let configuration;
    describe('on windows', () => {
      beforeEach(async () => {
        vi.mocked(os.platform).mockReturnValue('win32');
        configuration = await newConfiguration();
      });
      test('Sets isWindows to true', () => {
        expect(configuration.isWindows).toBe(true);
      });
      test('Sets podmanCli to "podman.exe"', () => {
        expect(configuration.podmanCli).toBe('podman.exe');
      });
    });
    describe('on linux', () => {
      beforeEach(async () => {
        vi.mocked(os.platform).mockReturnValue('linux');
        configuration = await newConfiguration();
      });
      test('Sets isWindows to false', () => {
        expect(configuration.isWindows).toBe(false);
      });
      test('Sets podmanCli to "podman"', () => {
        expect(configuration.podmanCli).toBe('podman');
      });
    });
    describe('sets common fields', () => {
      beforeEach(async () => {
        configuration = await newConfiguration();
      });
      test('Sets aiSdkPort to a free random port', async () => {
        expect(configuration.aiSdkPort).toBeGreaterThan(0);
      });
      test('Sets mcpHost to "host.containers.internal"', () => {
        expect(configuration.mcpHost).toBe('host.containers.internal');
      });
    });
  });
  test.each([
    {
      section: 'agent.ai',
      key: 'provider',
      value: 'google',
      config: 'provider'
    },
    {
      section: 'agent.ai.google',
      key: 'model',
      value: 'gemini-1337',
      config: 'googleModel'
    },
    {
      section: 'agent.ai.google',
      key: 'apiKey',
      value: '313373',
      config: 'googleApiKey'
    },
    {
      section: 'agent.ai.openAi',
      key: 'baseUrl',
      value: 'https://example.com/v1',
      config: 'openAiBaseUrl'
    },
    {
      section: 'agent.ai.openAi',
      key: 'model',
      value: 'granite-8b-code-instruct-128k',
      config: 'openAiModel'
    },
    {
      section: 'agent.ai.openAi',
      key: 'apiKey',
      value: 'parasol-nuri-api-key',
      config: 'openAiApiKey'
    }
  ])(
    'configuration[$config]() loaded from configuration',
    async ({section, key, value, config}) => {
      const configuration = await newConfiguration();
      extensionApi.configuration.mockedSections[section] = {[key]: value};
      expect(await configuration[config]()).toBe(value);
    }
  );
  describe('configuration.mcpPort()', () => {
    test('free random port if not configured', async () => {
      const configuration = await newConfiguration();
      expect(await configuration.mcpPort()).toBeGreaterThan(0);
    });
    test('multiple calls return the same port (free random)', async () => {
      const configuration = await newConfiguration();
      const port1 = await configuration.mcpPort();
      const port2 = await configuration.mcpPort();
      expect(port1).toBe(port2);
    });
    test('Prefers configured mcpPort', async () => {
      extensionApi.configuration.mockedSections['agent.mcp'] = {
        ['port']: 313373
      };
      const configuration = await newConfiguration();
      expect(await configuration.mcpPort()).toBe(313373);
    });
  });
});
