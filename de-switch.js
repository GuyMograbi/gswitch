#!/usr/bin/env node
const { handleCommand } = require('./handle-command');

async function main() {
  await handleCommand('ds');
}

main();
