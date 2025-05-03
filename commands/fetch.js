// This command will fetch stashed changes from one clone to another.
const inquirer = require('inquirer');
const simpleGit = require('simple-git');
const fs = require('fs');
const { SwitchContext } = require('../store');
const gitAdapter = require('../git-adapter');

function toSelectOptions(allContexts) {
  const options = [];
  for (const repo of Object.keys(allContexts)) {
    allContexts[repo]?.switch_context?.forEach((context) => {
      // Format date for better readability
      let formattedTime = 'Unknown';
      try {
        const date = new Date(context.timestamp);
        formattedTime = date.toLocaleString();
      } catch (e) {
        formattedTime = context.timestamp;
      }

      // Format files list (show up to 5 files)
      let filesText = 'No files';
      if (context.files && context.files.length > 0) {
        const filesToShow = context.files.slice(0, 5);
        const remainingCount = context.files.length - filesToShow.length;

        filesText = filesToShow.map((file) => `    - ${file}`).join('\n');

        if (remainingCount > 0) {
          filesText += `\n    ... and ${remainingCount} more file${remainingCount > 1 ? 's' : ''}`;
        }
      }

      options.push({
        name: `${repo}\n  Branch: ${context.branch}\n  Created: ${formattedTime}\n  Files:\n${filesText}`,
        value: { repo, context },
      });
    });
  }
  return options;
}

async function createPatchFile(repoDirectory, context) {
  const remoteGit = simpleGit(repoDirectory);
  // Create a patch file from the stash
  const stashList = await remoteGit.stashList();
  const matchingStash = stashList.all.find((stash) =>
    stash.message.includes(`gswitch-${context.contextId}`));
  if (!matchingStash) {
    console.log('Could not find the stash. It may have been manually removed.');
    return;
  }
  const patchContent = await remoteGit.raw(['stash', 'show', '-p', matchingStash.hash]);
  const pathFile = `./${context.contextId}.patch`;
  fs.writeFileSync(pathFile, patchContent);
  return pathFile;
}

async function handleFetchCommand() {
  // show contexts from all repos
  const allContexts = SwitchContext.getAllContexts();
  // get this repo
  const thisRepo = await gitAdapter.getRepoName();
  console.log(thisRepo);
  console.log(JSON.stringify(allContexts));

  const options = toSelectOptions(allContexts);

  if (options.length === 0) {
    console.log('No contexts found in other repositories.');
    return;
  }

  // allow user to select one
  const { selectedContext } = await inquirer.prompt([
    {
      type: 'list',
      name: 'selectedContext',
      message: 'Select a context to fetch:',
      choices: options,
      pageSize: 10,
    },
  ]);

  console.log(`Selected context: ${selectedContext.contextId} from branch ${selectedContext.branch}`);

  // Create a patch file
  const patchFile = await createPatchFile(selectedContext.repo, selectedContext.context);

  // apply the patch file
  const git = simpleGit(thisRepo);
  await git.applyPatch(patchFile);
  console.log('Applied patch file');
  fs.unlinkSync(patchFile);
}

module.exports = {
  handleFetchCommand,
};
