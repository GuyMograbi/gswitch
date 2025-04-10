// Define help text
const helpText = `
GSwitch - Git Context Switching Tool

Usage:
  gswitch [command]

Commands:
  help      Show this help message
  version   Show version information
  restore   Restore stashed changes to the current branch
  list      List all stashed changes created by gswitch

Without any command, gswitch will:
  1. Show you modified files and let you select which ones to stash
  2. Let you create a new branch or switch to an existing branch

Restore Functionality:
  When you switch branches using gswitch and stash some files, you can restore those
  stashed changes later by running the 'restore' command:
    gswitch restore

  This will apply any stashed changes that were created by gswitch for the current branch.

Examples:
  gswitch           Run the interactive context switching tool
  gswitch help      Display this help message
  gswitch version   Display version information
  gswitch restore   Restore stashed changes to the current branch
  gswitch list      List all stashed changes created by gswitch

Workflow Example:
  1. Start on branch 'feature-a'
  2. Run gswitch, stash some files, and switch to branch 'feature-b'
  3. Work on branch 'feature-b'
  4. When you want to restore your stashed changes, run 'gswitch restore'
`;

// Function to display help
function handleHelpCommand() {
  console.log(helpText);
}

module.exports = {
  handleHelpCommand,
};
