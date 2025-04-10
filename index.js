#!/usr/bin/env node

const { program } = require("commander");
const inquirer = require("inquirer");
const simpleGit = require("simple-git");
const fs = require("fs");
const path = require("path");
const os = require("os");

const git = simpleGit();

// Configuration file path
const configDir = path.join(os.homedir(), ".gswitch");
const configFile = path.join(configDir, "config.json");

// Ensure config directory exists
if (!fs.existsSync(configDir)) {
  fs.mkdirSync(configDir, { recursive: true });
}

// Load or initialize config
let config = { previousBranches: {} };
if (fs.existsSync(configFile)) {
  try {
    config = JSON.parse(fs.readFileSync(configFile, "utf8"));
  } catch (error) {
    console.error("Error reading config file:", error.message);
  }
}

// Save config function
function saveConfig() {
  try {
    fs.writeFileSync(configFile, JSON.stringify(config, null, 2), "utf8");
  } catch (error) {
    console.error("Error saving config file:", error.message);
  }
}

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
function showHelp() {
  console.log(helpText);
}

// Function to handle the list command
async function handleListCommand() {
  try {
    // Check if we're in a git repository
    const isRepo = await git.checkIsRepo();
    if (!isRepo) {
      console.error(
        "Not a git repository. Please run this command in a git repository."
      );
      process.exit(1);
    }

    // Check if we're in a git repository

    // Get stash list
    const stashList = await git.stashList();

    // Find stashes that were created by gswitch
    const gSwitchStashes = stashList.all.filter((stash) =>
      stash.message.includes("gswitch: stashed changes")
    );

    if (gSwitchStashes.length === 0) {
      console.log("No stashed changes found for this repository.");
      return;
    }

    console.log("\nStashed changes:");
    console.log("----------------");

    // For each stash, show details
    for (const stash of gSwitchStashes) {
      console.log(`\nStash: ${stash.hash}`);
      console.log(`Message: ${stash.message}`);

      // Get the files in this stash
      try {
        const stashShow = await git.stashShow([stash.hash]);
        const files = stashShow
          .split("\n")
          .filter((line) => line.trim() !== "");

        console.log("Files:");
        files.forEach((file) => {
          console.log(`  - ${file}`);
        });
      } catch (error) {
        console.log("  Unable to show files in this stash.");
      }
    }
  } catch (error) {
    console.error("An error occurred:", error.message);
    process.exit(1);
  }
}

// Function to handle the restore command
async function handleRestoreCommand() {
  try {
    // Check if we're in a git repository
    const isRepo = await git.checkIsRepo();
    if (!isRepo) {
      console.error(
        "Not a git repository. Please run this command in a git repository."
      );
      process.exit(1);
    }

    // Check if we're in a git repository

    // Look for stashes related to this branch
    const stashList = await git.stashList();

    // Find stashes that were created by gswitch for this branch
    const gSwitchStashes = stashList.all.filter((stash) =>
      stash.message.includes("gswitch: stashed changes")
    );

    if (gSwitchStashes.length === 0) {
      console.log("No stashed changes found for the current branch.");
      return;
    }

    // Apply the most recent stash
    try {
      await git.stash(["apply", gSwitchStashes[0].hash]);
      console.log("Restored stashed changes to the current branch.");
    } catch (stashError) {
      console.error("Failed to apply stashed changes:", stashError.message);
    }
  } catch (error) {
    console.error("An error occurred:", error.message);
    process.exit(1);
  }
}

// Only parse arguments when run directly (not when required in tests)
if (require.main === module) {
  program
    .version("1.0.0")
    .description("A CLI tool to help with context switching in Git")
    .option("-h, --help", "display help information")
    .action((cmd) => {
      if (cmd.help) {
        showHelp();
      }
    });

  // Add help command
  program
    .command("help")
    .description("Display help information")
    .action(() => {
      showHelp();
    });

  // Add restore command
  program
    .command("restore")
    .description("Restore stashed changes to the current branch")
    .action(() => {
      handleRestoreCommand();
    });

  // Add list command
  program
    .command("list")
    .description("List all stashed changes created by gswitch")
    .action(() => {
      handleListCommand();
    });

  program.parse(process.argv);

  // If no arguments provided or only the program name, run the main function
  if (process.argv.length <= 2) {
    main();
  }
}

async function main() {
  try {
    // Check if we're in a git repository
    const isRepo = await git.checkIsRepo();
    if (!isRepo) {
      console.error(
        "Not a git repository. Please run this command in a git repository."
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
      console.log("No modified files found. Nothing to do.");
      await promptBranchAction();
      return;
    }

    // Prompt user to select which files to stash
    const { filesToStash } = await inquirer.prompt([
      {
        type: "checkbox",
        name: "filesToStash",
        message: "Select files to stash:",
        choices: modifiedFiles,
      },
    ]);

    // Stash the selected files
    if (filesToStash.length > 0) {
      // First, add the files we want to stash to staging
      await git.add(filesToStash);

      // Stash the selected files
      await git.stash(["save", "gswitch: stashed changes"]);
      console.log("Stashed changes for the selected files.");

      // Reset any other files that might have been staged but not selected for stashing
      const filesToKeep = modifiedFiles.filter(
        (file) => !filesToStash.includes(file)
      );
      if (filesToKeep.length > 0) {
        await git.add(filesToKeep);
        await git.reset(["HEAD"]);
      }
    }

    // Now handle branch switching
    await promptBranchAction();
  } catch (error) {
    console.error("An error occurred:", error.message);
    process.exit(1);
  }
}

async function promptBranchAction() {
  // Get current branch
  const status = await git.status();
  const currentBranch = status.current;
  const repoPath = await git.revparse(["--show-toplevel"]);
  const repoName = path.basename(repoPath);

  // Build choices array
  const choices = [
    { name: "Create a new branch", value: "new" },
    { name: "Switch to an existing branch", value: "existing" },
  ];

  const { action } = await inquirer.prompt([
    {
      type: "list",
      name: "action",
      message: "What would you like to do?",
      choices,
    },
  ]);

  if (action === "new") {
    // Save current branch before switching
    config.previousBranches = config.previousBranches || {};
    config.previousBranches[repoName] = currentBranch;
    saveConfig();
    await createNewBranch();
  } else if (action === "existing") {
    // Save current branch before switching
    config.previousBranches = config.previousBranches || {};
    config.previousBranches[repoName] = currentBranch;
    saveConfig();
    await switchToExistingBranch();
  }
}

async function createNewBranch() {
  const { branchName } = await inquirer.prompt([
    {
      type: "input",
      name: "branchName",
      message: "Enter a name for the new branch:",
      validate: (input) =>
        input.trim() !== "" ? true : "Branch name cannot be empty",
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
    console.log("No other branches available to switch to.");
    return;
  }

  const { selectedBranch } = await inquirer.prompt([
    {
      type: "list",
      name: "selectedBranch",
      message: "Select a branch to switch to:",
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

async function restorePreviousBranch(repoName) {
  if (!config.previousBranches || !config.previousBranches[repoName]) {
    console.error("No previous branch found for this repository.");
    return;
  }

  const previousBranch = config.previousBranches[repoName];

  try {
    await git.checkout(previousBranch);
    console.log(`Restored previous branch: ${previousBranch}`);

    // Clear the previous branch after restoring
    delete config.previousBranches[repoName];
    saveConfig();
  } catch (error) {
    console.error(`Failed to restore branch: ${error.message}`);
  }
}

// Export functions for testing
module.exports = {
  main,
  promptBranchAction,
  createNewBranch,
  switchToExistingBranch,
  restorePreviousBranch,
  handleListCommand,
  showHelp,
};
