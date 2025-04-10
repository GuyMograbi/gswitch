const git = require('simple-git');

function getCurrentBranch() {
  return git.revparse(['--abbrev-ref', 'HEAD']);
}

function getRepoName() {
  return git.revparse(['--show-toplevel']);
}

function getLastCommitHash() {
  return git.revparse(['HEAD']);
}

function getLastCommitCommentOneLine() {
  return git.log(['-1', '--pretty=%B']);
}

module.exports = {
  getCurrentBranch,
  getRepoName,
  getLastCommitHash,
  getLastCommitCommentOneLine,
};
