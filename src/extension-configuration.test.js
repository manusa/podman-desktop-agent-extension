import {beforeEach, describe, expect, test, vi} from 'vitest';
import extensionApi from '@podman-desktop/api';
import os from 'node:os';
import {newConfiguration} from './extension-configuration';

vi.mock('node:os');

describe('extension-configuration', () => {
  describe('newConfiguration()', () => {
    let configuration;
    describe('on windows', () => {
      beforeEach(() => {
        vi.mocked(os.platform).mockReturnValue('win32');
        configuration = newConfiguration();
      });
      test('Sets isWindows to true', () => {
        expect(configuration.isWindows).toBe(true);
      });
      test('Sets podmanCli to "podman.exe"', () => {
        expect(configuration.podmanCli).toBe('podman.exe');
      });
    });
    describe('on linux', () => {
      beforeEach(() => {
        vi.mocked(os.platform).mockReturnValue('linux');
        configuration = newConfiguration();
      });
      test('Sets isWindows to false', () => {
        expect(configuration.isWindows).toBe(false);
      });
      test('Sets podmanCli to "podman"', () => {
        expect(configuration.podmanCli).toBe('podman');
      });
    });
    describe('adds common fields', () => {
      beforeEach(() => {
        vi.mocked(os.platform).mockReturnValue('linux');
        configuration = newConfiguration();
      });
      test('Sets mcpHost to "host.containers.internal"', () => {
        expect(configuration.mcpHost).toBe('host.containers.internal');
      });
    });
  });
  describe('load()', () => {
    let configuration;
    beforeEach(() => {
      configuration = newConfiguration();
    });
    describe('with no providers', () => {
      beforeEach(async () => {
        vi.mocked(
          extensionApi.provider.getContainerConnections
        ).mockReturnValue([]);
        await configuration.load();
      });
      test('Sets containerConnection to undefined', () => {
        expect(configuration.containerConnection).toBeUndefined();
      });
    });
    describe('with multiple providers and podman', () => {
      beforeEach(async () => {
        vi.mocked(
          extensionApi.provider.getContainerConnections
        ).mockReturnValue([
          {providerId: 'docker', connection: {type: 'docker'}},
          {providerId: 'podman-1', connection: {type: 'podman'}},
          {providerId: 'podman-2', connection: {type: 'podman'}}
        ]);
        await configuration.load();
      });
      test('Sets containerConnection to the first podman connection', () => {
        expect(configuration.containerConnection.providerId).toBe('podman-1');
      });
    });
    describe('with no podman provider', () => {
      beforeEach(async () => {
        vi.mocked(
          extensionApi.provider.getContainerConnections
        ).mockReturnValue([
          {providerId: 'docker-1', connection: {type: 'docker'}},
          {providerId: 'docker-2', connection: {type: 'docker'}}
        ]);
        await configuration.load();
      });
      test('Sets containerConnection to the first connection', () => {
        expect(configuration.containerConnection.providerId).toBe('docker-1');
      });
    });
    describe('mcpPort', () => {
      test('Sets mcpPort to a free random port', async () => {
        await configuration.load();
        expect(configuration.mcpPort).toBeGreaterThan(0);
      });
      test('Does not change mcpPort once is set', async () => {
        configuration.mcpPort = 313373;
        await configuration.load();
        expect(configuration.mcpPort).toBe(313373);
      });
    });
  });
});
