const simpleGit = require('simple-git');

const git = simpleGit();

async function getCurrentBranch() {
  return git.revparse(['--abbrev-ref', 'HEAD']);
}

async function getRepoName() {
  return git.revparse(['--show-toplevel']);
}

async function getLastCommitHash() {
  return git.revparse(['HEAD']);
}

async function getLastCommitCommentOneLine() {
  const result = await git.log(['-1']);
  return result.latest.message;
}

module.exports = {
  getCurrentBranch,
  getRepoName,
  getLastCommitHash,
  getLastCommitCommentOneLine,
};
