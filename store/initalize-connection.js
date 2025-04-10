const path = require('path');
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
  const repoName = path.basename(repoPath);
  initialize(repoName);
}

module.exports = {
  initializeConnection,
};
