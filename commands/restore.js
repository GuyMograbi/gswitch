const git = require('simple-git')();
const gitAdapter = require('../git-adapter');
const { SwitchContext } = require('../store');

// Function to handle the restore command
async function handleRestoreCommand() {
  // Check if we have stashes for this repository
  const currentBranch = await gitAdapter.getCurrentBranch();
  const branchContext = SwitchContext.findForBranch(currentBranch);
  if (branchContext.length === 0) {
    console.log('No stashed changes found for this branch.');
    return;
  }
  if (branchContext.length > 1) {
    console.log('Multiple stashed changes found for this branch.');
    return;
  }
  const [context] = branchContext;
  const { contextId } = context;

  // Look for stashes related to this branch
  const stashList = await git.stashList();

  // Find the stash with our UUID
  const matchingStash = stashList.all.find((stash) =>
    stash.message.includes(`gswitch-${contextId}`));

  if (!matchingStash) {
    console.log(
      'Could not find the stash. It may have been manually removed.',
    );
    return;
  }

  // Apply the stash

  await git.stash(['apply', matchingStash.hash]);
  console.log('Restored stashed changes to the current branch.');

  SwitchContext.deleteOne((item) => item.contextId === contextId);
}

module.exports = {
  handleRestoreCommand,
};
