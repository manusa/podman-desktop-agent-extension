import {beforeEach, vi} from 'vitest';

beforeEach(() => {
  console.logs = '';
  vi.spyOn(console, 'log').mockImplementation((...args) => {
    console.logs += args.join(' ') + '\n';
  });
});
