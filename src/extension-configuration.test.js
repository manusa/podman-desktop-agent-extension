import {beforeEach, describe, expect, test, vi} from 'vitest';
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
      test('Creates a new configuration object', () => {
        expect(configuration).toBeDefined();
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
      test('Creates a new configuration object', () => {
        expect(configuration).toBeDefined();
      });
      test('Sets isWindows to false', () => {
        expect(configuration.isWindows).toBe(false);
      });
      test('Sets podmanCli to "podman"', () => {
        expect(configuration.podmanCli).toBe('podman');
      });
    });
  });
});
