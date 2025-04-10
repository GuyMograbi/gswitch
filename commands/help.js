// Define help text
const helpText = `
QS - Git Quick Switch

Usage:
  qs [command]

Commands:
  help      Show this help message
  version   Show version information
  restore   Restore stashed changes to the current branch
  list      List all stashed changes created by qs

Without any command, qs will:
  1. Show you modified files and let you select which ones to stash
  2. Let you create a new branch or switch to an existing branch

Restore Functionality:
  When you switch branches using qs and stash some files, you can restore those
  stashed changes later by running the 'restore' command:
    qs restore
    or
    ds  # Using the shortcut

  This will apply any stashed changes that were created by qs for the current branch.

Examples:
  qs           Run the interactive context switching tool
  qs help      Display this help message
  qs version   Display version information
  qs restore   Restore stashed changes to the current branch
               (shortcut: ds)
  qs list      List all stashed changes created by qs

Workflow Example:
  1. Start on branch 'feature-a'
  2. Run qs, stash some files, and switch to branch 'feature-b'
  3. Work on branch 'feature-b'
  4. When you want to restore your stashed changes, run 'qs restore'
`;

// Function to display help
function handleHelpCommand() {
  console.log(helpText);
}

module.exports = {
  handleHelpCommand,
};
