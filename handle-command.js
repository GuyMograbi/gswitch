const { program } = require('commander');
const {
  handleRestoreCommand,
  handleListCommand,
  handleSwitchCommand,
  handleHelpCommand,
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

  // Add restore command
  program
    .command('restore')
    .description('Restore stashed changes to the current branch')
    .action(() => {
      handleRestoreCommand();
    });

  // Add list command
  program
    .command('list')
    .description('List all stashed changes created by gswitch')
    .action(() => {
      handleListCommand();
    });

  program.parse(process.argv);

  // If no arguments provided or only the program name, run the main function
  if (process.argv.length <= 2) {
    handleSwitchCommand();
  }
}

async function handleCommand(baseCommand) {
  await initializeConnection();
  if (baseCommand === 'qs') {
    handleQuickSwitch();
  } else if (baseCommand === 'ds') {
    handleRestoreCommand();
  }
}

module.exports = {
  handleCommand,
};
