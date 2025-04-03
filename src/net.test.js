import {describe, expect, test} from 'vitest';
import {findFreePort} from './net';

describe('net', () => {
  test('findFreePort()', async () => {
    const port = await findFreePort();
    expect(port).toBeGreaterThan(0);
  });
});
