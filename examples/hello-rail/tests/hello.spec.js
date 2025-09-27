const { test, expect } = require('@playwright/test');
const { hello } = require('@prism-tv/core');

test('core greeting surfaces via UI layer contract', () => {
  expect(hello()).toContain('Prism core is alive');
});
