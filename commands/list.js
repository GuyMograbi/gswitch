const { SwitchContext } = require('../store');
const { initialize } = require('../store/data-connector');

function listRepository() {
  const repoContexts = SwitchContext.getAll();

  if (repoContexts.length === 0) {
    console.log('No active contexts found for this repository.');
    return;
  }

  repoContexts.forEach(({
    contextId, timestamp, branch, files,
  }) => {
    // Format the timestamp to be more readable
    let formattedTime = 'Unknown';
    try {
      const date = new Date(timestamp);
      formattedTime = date.toLocaleString();
    } catch (e) {
      formattedTime = timestamp;
    }

    console.log(`\nContext ID: ${contextId.substring(0, 8)}...`);
    console.log(`Created: ${formattedTime}`);
    console.log(`Branch: ${branch}`);

    console.log('Files:');
    files.forEach((file) => {
      console.log(`  - ${file}`);
    });
  });
}

// Function to handle the list command
async function handleListCommand(all) {
  console.log('\nSaved contexts:');
  console.log('----------------');
  if (all) {
    const allRepositories = SwitchContext.getAllRepositories();
    allRepositories.forEach(async (repo) => {
      console.log(`\nRepository: ${repo}`);
      await initialize(repo);
      listRepository();
    });
  } else {

    listRepository();
  }
}

module.exports = {
  handleListCommand,
};
