const inquirer = require('inquirer');
const simpleGit = require('simple-git');
const { handleSwitchCommand } = require('./switch');

async function handleGoCommand() {
  const command = ['reflog', 'show', `--pretty=format:'%gs ~ %gd'`, '--date=relative'];
  // | grep 'checkout:' | grep -oE '[^ ]+ ~ .*' | awk -F~ '!seen[$1]++' | head -n 20 | awk -F' ~ HEAD@{\' \'{printf(\"  \\033[33m%s: \\033[37m %s\\033[0m\\n\", substr($2, 1, length($2)-1), $1)}'`; // eslint-disable-line max-len

  const regex = /^'checkout: moving from .* to (.*) ~ HEAD@{(.*)}'$/;
  const result = await simpleGit().raw(command);
  console.log(result);
  const lines = result.split('\n');
  const choicesMap = lines.filter((line) => line.includes('checkout:'))
    .map((line) => {
      console.log(line);
      const [, branch, time] = line.match(regex);
      return { branch, time };
    }).reduce((acc, { branch, time }) => {
      if (!acc[branch]) {
        acc[branch] = `${time} - ${branch}`;
      }
      return acc;
    }, {});
  const choices = Object.entries(choicesMap).map(([branch, time]) => ({
    name: time,
    value: branch,
  }));

  const { selectedBranch } = await inquirer.prompt([
    {
      type: 'list',
      name: 'selectedBranch',
      message: 'Select a branch to switch to (type to search):',
      choices,
      pageSize: 10,
    },
  ]);
  try {
    await simpleGit().checkout(selectedBranch);
  } catch (error) {
    console.error(`Failed to switch branch: ${error.message}. Lets select files to stash.`);
    await handleSwitchCommand(selectedBranch);
  }
  console.log(`Switched to branch: ${selectedBranch}`);
}

module.exports = {
  handleGoCommand,
};
