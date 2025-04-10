const git = require('simple-git');

function getCurrentBranch() {
  return git.revparse(['--abbrev-ref', 'HEAD']);
}

function getRepoName() {
  return git.revparse(['--show-toplevel']);
}

module.exports = {
  getCurrentBranch,
  getRepoName,
};
