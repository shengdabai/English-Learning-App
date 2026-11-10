import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createMemoryRouter } from 'react-router-dom';
import { v3, v5, v6 } from 'uuid';

test('router preserves internal navigation and back/forward history', async () => {
  const router = createMemoryRouter([{ path: '*', element: null }]);
  try {
    for (const pathname of ['/reading', '/speaking', '/conversation', '/progress', '/settings', '/']) {
      await router.navigate(pathname);
      assert.equal(router.state.location.pathname, pathname);
      assert.equal(router.state.errors, null);
    }
    await router.navigate(-1);
    assert.equal(router.state.location.pathname, '/settings');
    await router.navigate(1);
    assert.equal(router.state.location.pathname, '/');
  } finally {
    router.dispose();
  }
});

test('router rejects backslash destinations that resolve to another origin', async () => {
  const router = createMemoryRouter([{ path: '*', element: null }]);
  try {
    for (const destination of ['/\\example.invalid', '\\\\example.invalid']) {
      await assert.rejects(router.navigate(destination), /External navigation is not allowed/);
      assert.equal(router.state.location.pathname, '/');
    }
  } finally {
    router.dispose();
  }
});

for (const generate of [v3, v5, v6]) {
  test(`${generate.name} rejects out-of-bounds buffers without modifying them`, () => {
    for (const [length, offset] of [[15, 0], [16, 1], [16, -1]]) {
      const buffer = new Uint8Array(length).fill(0xaa);
      const before = buffer.slice();
      assert.throws(() => {
        if (generate === v6) generate({}, buffer, offset);
        else generate('example', generate.DNS, buffer, offset);
      }, RangeError);
      assert.deepEqual(buffer, before);
    }
  });
}
