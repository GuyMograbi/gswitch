const { handleRestoreCommand } = require('./restore');
const { handleListCommand } = require('./list');
const { handleSwitchCommand } = require('./switch');
const { handleHelpCommand } = require('./help');
const { handleFetchCommand } = require('./fetch');
const { handleGoCommand } = require('./go');

module.exports = {
  handleRestoreCommand,
  handleListCommand,
  handleSwitchCommand,
  handleHelpCommand,
  handleFetchCommand,
  handleGoCommand,
};
