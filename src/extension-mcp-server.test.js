import {beforeEach, describe, expect, test, vi} from 'vitest';
import {spawn} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import {startMcpServer} from './extension-mcp-server';
import {newConfiguration} from './extension-configuration.js';

vi.mock('node:fs');
vi.mock('node:os');

describe('extension-mcp-server', () => {
  beforeEach(() => {
    // Use standard shell in all platforms
    vi.mocked(fs.statSync).mockImplementation(() => {
      throw new Error('ENOENT');
    });
  });
  describe('startMcpServer()', () => {
    let configuration;
    let extensionContext;
    beforeEach(() => {
      extensionContext = {};
    });
    test.each([
      {
        platform: 'darwin',
        arch: 'x64',
        expectedBinary: 'podman-mcp-server-darwin-amd64'
      },
      {
        platform: 'darwin',
        arch: 'arm64',
        expectedBinary: 'podman-mcp-server-darwin-arm64'
      },
      {
        platform: 'linux',
        arch: 'x64',
        expectedBinary: 'podman-mcp-server-linux-amd64'
      },
      {
        platform: 'linux',
        arch: 'arm64',
        expectedBinary: 'podman-mcp-server-linux-arm64'
      },
      {
        platform: 'win32',
        arch: 'x64',
        expectedBinary: 'podman-mcp-server-windows-amd64.exe'
      },
      {
        platform: 'win32',
        arch: 'arm64',
        expectedBinary: 'podman-mcp-server-windows-arm64.exe'
      }
    ])(
      'on $platform uses $expectedBinary',
      ({platform, arch, expectedBinary}) => {
        vi.mocked(os.platform).mockReturnValue(platform);
        vi.mocked(os.arch).mockReturnValue(arch);
        configuration = newConfiguration();
        startMcpServer({configuration, extensionContext});
        expect(spawn).toHaveBeenCalledWith(
          `dist/${expectedBinary}`,
          expect.any(Array),
          expect.any(Object)
        );
      }
    );
  });
});
