const { spawn } = require('child_process');
const request = require('request');
const test = require('tape');

// Start the app
const env = Object.assign({}, process.env, {});
const child = spawn('node', ['index.js'], { env });

test('works', (t) => {
  // TODO
});
