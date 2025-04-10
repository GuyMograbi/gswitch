const path = require('path');
const { v4: uuidv4 } = require('uuid');

const inquirer = require('inquirer');
const simpleGit = require('simple-git');
const gitAdapter = require('../git-adapter');

const { SwitchContext } = require('../store');

const git = simpleGit();

const Actions = Object.freeze({
  NEW: 'new',
  EXISTING: 'existing',
});

async function promptBranchAction() {
  // Get current branch

  // Build choices array
  const choices = [
    { name: 'Create a new branch', value: Actions.NEW },
    { name: 'Switch to an existing branch', value: Actions.EXISTING },
  ];

  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'What would you like to do?',
      choices,
    },
  ]);

  if (action === Actions.NEW) {
    await createNewBranch();
  } else if (action === Actions.EXISTING) {
    await switchToExistingBranch();
  }
}

async function createNewBranch() {
  const { branchName } = await inquirer.prompt([
    {
      type: 'input',
      name: 'branchName',
      message: 'Enter a name for the new branch:',
      validate: (input) =>
        input.trim() !== '' ? true : 'Branch name cannot be empty',
    },
  ]);

  try {
    await git.checkoutLocalBranch(branchName);
    console.log(`Created and switched to new branch: ${branchName}`);
  } catch (error) {
    console.error(`Failed to create branch: ${error.message}`);
  }
}

async function switchToExistingBranch() {
  // Get all branches
  const branchSummary = await git.branch();
  const branches = Object.keys(branchSummary.branches)
    .filter((name) => !branchSummary.branches[name].current)
    .map((name) => ({
      name,
      value: name,
    }));

  if (branches.length === 0) {
    console.log('No other branches available to switch to.');
    return;
  }

  const { selectedBranch } = await inquirer.prompt([
    {
      type: 'list',
      name: 'selectedBranch',
      message: 'Select a branch to switch to:',
      choices: branches,
    },
  ]);

  try {
    await git.checkout(selectedBranch);
    console.log(`Switched to branch: ${selectedBranch}`);
  } catch (error) {
    console.error(`Failed to switch branch: ${error.message}`);
  }
}

async function handleSwitchCommand() {
  try {
    // Check if we're in a git repository
    const isRepo = await git.checkIsRepo();
    if (!isRepo) {
      console.error(
        'Not a git repository. Please run this command in a git repository.',
      );
      process.exit(1);
    }

    // Get current status to find modified files
    const status = await git.status();
    const modifiedFiles = [
      ...status.modified,
      ...status.not_added,
      ...status.created,
      ...status.deleted,
    ];

    if (modifiedFiles.length === 0) {
      console.log('No modified files found. Nothing to do.');
      await promptBranchAction();
      return;
    }

    // Prompt user to select which files to stash
    const { filesToStash } = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'filesToStash',
        message: 'Select files to stash:',
        choices: modifiedFiles,
      },
    ]);

    // Stash the selected files
    if (filesToStash.length > 0) {
      // First, add the files we want to stash to staging
      await git.add(filesToStash);

      // Generate a UUID for this context switch
      const contextId = uuidv4();

      // Get current timestamp
      const timestamp = new Date().toISOString();

      // Get current branch
      const currentBranch = status.current;

      // Get last commit hash
      const lastCommitHash = await gitAdapter.getLastCommitHash();

      const lastCommitMessage = await gitAdapter.getLastCommitCommentOneLine();

      // Stash the selected files with the UUID as reference
      await git.stash(['push', filesToStash, '-m', `gswitch-${contextId}`]);
      console.log('Stashed changes for the selected files.');

      SwitchContext.create({
        timestamp,
        contextId,
        branch: currentBranch,
        lastCommitHash,
        lastCommitMessage,
        files: filesToStash,
      });
    }

    // Now handle branch switching
    await handleSwitchCommand();
  } catch (error) {
    console.error('An error occurred:', error.message);
    process.exit(1);
  }
}

module.exports = {
  handleSwitchCommand,
};
