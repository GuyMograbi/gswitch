const { program } = require('commander');
const {
  handleRestoreCommand,
  handleListCommand,
  handleFetchCommand,
  handleSwitchCommand,
  handleHelpCommand,
  handleGoCommand,
} = require('./commands');
const { initializeConnection } = require('./store');

async function handleQuickSwitch() {
  program
    .version('1.0.0')
    .description('A CLI tool to help with context switching in Git')
    .option('-h, --help', 'display help information')
    .action((cmd) => {
      if (cmd.help) {
        handleHelpCommand();
      }
    });

  // Add help command
  program
    .command('help')
    .description('Display help information')
    .action(() => {
      handleHelpCommand();
    });

  program
    .command('go')
    .description('Go to a different branch')
    .action(() => {
      handleGoCommand();
    });

  // Add restore command
  program
    .command('restore')
    .description('Restore stashed changes to the current branch')
    .action(async () => {
      await initializeConnection();
      handleRestoreCommand();
    });

  // Add list command
  program
    .command('list')
    .description('List all stashed changes created by gswitch')
    .option('-a, --all', 'Show all details for each context')
    .action((options) => {
      handleListCommand(options.all);
    });

  // Add fetch command
  program
    .command('fetch')
    .description('Fetch stashed changes from another clone')
    .action(() => {
      handleFetchCommand();
    });

  program.parse(process.argv);

  // If no arguments provided or only the program name, run the main function
  if (process.argv.length <= 2) {
    await initializeConnection();
    handleSwitchCommand();
  }
}

async function handleCommand(baseCommand) {
  if (baseCommand === 'qs') {
    handleQuickSwitch();
  } else if (baseCommand === 'ds') {
    await initializeConnection();
    handleRestoreCommand();
  }
}

module.exports = {
  handleCommand,
};
