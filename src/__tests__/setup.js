import {beforeEach, vi} from 'vitest';
import {spawn, spawnSync} from 'node:child_process';

vi.mock('node:child_process');

beforeEach(() => {
  // console mocks
  console.logs = '';
  console.errors = '';
  vi.spyOn(console, 'log').mockImplementation((...args) => {
    console.logs += args.join(' ') + '\n';
  });
  vi.spyOn(console, 'error').mockImplementation((...args) => {
    console.errors += args.join(' ') + '\n';
  });
  // default node:child_process mocks
  vi.mocked(spawn).mockImplementation(() => ({
    pid: 1337,
    exitCode: 0,
    on: vi.fn(),
    write: vi.fn()
  }));
  vi.mocked(spawnSync).mockImplementation(() => ({
    pid: 1337,
    output: [],
    stdout: '',
    stderr: '',
    status: 0,
    signal: null,
    error: null
  }));
});
