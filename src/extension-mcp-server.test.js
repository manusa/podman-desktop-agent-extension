import {beforeEach, describe, expect, test, vi} from 'vitest';
import {spawn, spawnSync} from 'node:child_process';
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
    test('adds --sse-port to args', () => {
      configuration = newConfiguration();
      configuration.mcpPort = 1337;
      startMcpServer({configuration, extensionContext});
      expect(spawn).toHaveBeenCalledWith(
        expect.any(String),
        ['--sse-port', 1337],
        expect.any(Object)
      );
    });
    test('logs when the server starts', () => {
      vi.mocked(os.platform).mockReturnValue('linux');
      vi.mocked(os.arch).mockReturnValue('x64');
      configuration = newConfiguration();
      configuration.mcpPort = 1337;
      startMcpServer({configuration, extensionContext});
      expect(console.logs).toContain(
        'Starting Podman MCP server at podman-mcp-server-linux-amd64 in port 1337'
      );
    });
    test('stores the port in a variable', () => {
      configuration = newConfiguration();
      configuration.mcpPort = 1337;
      const mcpServer = startMcpServer({configuration, extensionContext});
      expect(mcpServer.port).toBe(1337);
    });
  });
  describe('mcpServer.close()', () => {
    let mcpServer;
    let killed;
    beforeEach(() => {
      killed = false;
      vi.spyOn(process, 'kill').mockImplementation(() => {
        if (killed) {
          throw new Error('ENOENT');
        }
        killed = true;
      });
      mcpServer = startMcpServer({
        configuration: newConfiguration(),
        extensionContext: {}
      });
      mcpServer.close();
    });
    test('logs when the server stops', () => {
      expect(console.logs).toContain('Closing MCP server');
    });
    test('on *nix kills the process', () => {
      expect(process.kill).toHaveBeenCalledWith(mcpServer.pid);
    });
    test('on Windows kills the process', () => {
      vi.mocked(os.platform).mockReturnValue('win32');
      mcpServer = startMcpServer({
        configuration: newConfiguration(),
        extensionContext: {}
      });
      mcpServer.close();
      expect(spawnSync).toHaveBeenCalledWith(
        'taskkill.exe',
        [`/PID ${mcpServer.pid}`, '/T', '/F'],
        expect.any(Object)
      );
    });
  });
});
