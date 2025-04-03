import {beforeEach, describe, expect, test, vi} from 'vitest';
import {spawn, spawnSync} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import {newMcpServer} from './mcp-server';
import {newConfiguration} from './configuration.js';

vi.mock('node:fs');
vi.mock('node:os');

describe('mcp-server', () => {
  let configuration;
  let extensionContext;
  beforeEach(() => {
    // Use standard shell in all platforms
    vi.mocked(fs.statSync).mockImplementation(() => {
      throw new Error('ENOENT');
    });
    extensionContext = {};
  });
  describe('newMcpServer()', () => {
    test('stores the port in a variable', async () => {
      configuration = await newConfiguration();
      const mcpServer = await newMcpServer({configuration, extensionContext});
      expect(mcpServer.port).toBe(await configuration.mcpPort());
    });
  });
  describe('mcpServer.start()', () => {
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
      async ({platform, arch, expectedBinary}) => {
        vi.mocked(os.platform).mockReturnValue(platform);
        vi.mocked(os.arch).mockReturnValue(arch);
        configuration = await newConfiguration();
        (await newMcpServer({configuration, extensionContext})).start();
        expect(spawn).toHaveBeenCalledWith(
          `dist/${expectedBinary}`,
          expect.any(Array),
          expect.any(Object)
        );
      }
    );
    test('adds --sse-port to args', async () => {
      configuration = await newConfiguration();
      const configuredMcpPort = await configuration.mcpPort();
      (await newMcpServer({configuration, extensionContext})).start();
      expect(spawn).toHaveBeenCalledWith(
        expect.any(String),
        ['--sse-port', configuredMcpPort],
        expect.any(Object)
      );
    });
    test('logs when the server starts', async () => {
      vi.mocked(os.platform).mockReturnValue('linux');
      vi.mocked(os.arch).mockReturnValue('x64');
      configuration = await newConfiguration();
      const configuredMcpPort = await configuration.mcpPort();
      (await newMcpServer({configuration, extensionContext})).start();
      expect(console.logs).toContain(
        `MCP Server: starting podman-mcp-server-linux-amd64 in port ${configuredMcpPort}`
      );
    });
  });
  describe('mcpServer.close()', () => {
    let mcpServer;
    let killed;
    beforeEach(async () => {
      killed = false;
      vi.spyOn(process, 'kill').mockImplementation(() => {
        if (killed) {
          throw new Error('ENOENT');
        }
        killed = true;
      });
      mcpServer = await newMcpServer({
        configuration: await newConfiguration(),
        extensionContext: {}
      });
      mcpServer.start();
      mcpServer.close();
    });
    test('logs when the server stops', () => {
      expect(console.logs).toContain('MCP Server: closing...');
    });
    test('logs when the server is already closed', () => {
      mcpServer.close();
      expect(console.logs).toContain('MCP Server: already closed');
    });
    test('on *nix kills the process', () => {
      expect(process.kill).toHaveBeenCalledWith(mcpServer.shell.pid);
    });
    test('on Windows kills the process', async () => {
      vi.mocked(os.platform).mockReturnValue('win32');
      mcpServer = await newMcpServer({
        configuration: await newConfiguration(),
        extensionContext: {}
      });
      mcpServer.start();
      mcpServer.close();
      expect(spawnSync).toHaveBeenCalledWith(
        'taskkill.exe',
        [`/PID ${mcpServer.shell.pid}`, '/T', '/F'],
        expect.any(Object)
      );
    });
  });
});
