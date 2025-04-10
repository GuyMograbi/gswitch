#!/usr/bin/env node

const { program } = require('commander');
const inquirer = require('inquirer');
const simpleGit = require('simple-git');

const git = simpleGit();

// Only parse arguments when run directly (not when required in tests)
if (require.main === module) {
  program
    .version('1.0.0')
    .description('A CLI tool to help with context switching in Git')
    .parse(process.argv);
}

async function main() {
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

    // Prompt user to select which files to keep
    const { filesToKeep } = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'filesToKeep',
        message: 'Select files to keep:',
        choices: modifiedFiles,
      },
    ]);

    // Stash files that are not selected to keep
    if (filesToKeep.length < modifiedFiles.length) {
      // First, add all files to staging
      await git.add(modifiedFiles);

      // Then reset the files we want to keep
      if (filesToKeep.length > 0) {
        await git.reset(['HEAD', ...filesToKeep]);
      }

      // Stash the rest
      await git.stash(['save', 'gswitch: stashed changes']);
      console.log('Stashed changes for files not selected to keep.');
    }

    // Now handle branch switching
    await promptBranchAction();
  } catch (error) {
    console.error('An error occurred:', error.message);
    process.exit(1);
  }
}

async function promptBranchAction() {
  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'What would you like to do?',
      choices: [
        { name: 'Create a new branch', value: 'new' },
        { name: 'Switch to an existing branch', value: 'existing' },
      ],
    },
  ]);

  if (action === 'new') {
    await createNewBranch();
  } else {
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

// Only run main when called directly (not when required in tests)
if (require.main === module) {
  main();
}

// Export functions for testing
module.exports = {
  main,
  promptBranchAction,
  createNewBranch,
  switchToExistingBranch,
};
