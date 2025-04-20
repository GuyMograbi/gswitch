const simpleGit = require('simple-git');

const git = simpleGit();
const { initialize } = require('./data-connector');

async function initializeConnection() {
  const isRepo = await git.checkIsRepo();
  if (!isRepo) {
    console.error(
      'Not a git repository. Please run this command in a git repository.',
    );
    process.exit(1);
  }
  const repoPath = await git.revparse(['--show-toplevel']);
  if (!repoPath) {
    console.error(
      'Not a git repository. Please run this command in a git repository.',
    );
    process.exit(1);
  }
  console.log(`Initializing connection for [${repoPath}]`);
  initialize(repoPath);
}

module.exports = {
  initializeConnection,
};
