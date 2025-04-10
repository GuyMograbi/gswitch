const { SwitchContext } = require('../store');

// Function to handle the list command
async function handleListCommand() {
  console.log('\nSaved contexts:');
  console.log('----------------');

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

module.exports = {
  handleListCommand,
};
