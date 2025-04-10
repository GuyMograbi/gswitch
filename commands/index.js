const { handleRestoreCommand } = require('./restore');
const { handleListCommand } = require('./list');
const { handleSwitchCommand } = require('./switch');
const { handleHelpCommand } = require('./help');

module.exports = {
  handleRestoreCommand,
  handleListCommand,
  handleSwitchCommand,
  handleHelpCommand,
};
