const { expect } = require('chai');
const sinon = require('sinon');
const proxyquire = require('proxyquire');
const inquirer = require('inquirer');

describe('gswitch CLI', () => {
  let simpleGitStub;
  let inquirerStub;
  let consoleLogSpy;
  let consoleErrorSpy;
  let processExitStub;
  let gswitch;

  beforeEach(() => {
    // Set up stubs
    simpleGitStub = {
      checkIsRepo: sinon.stub(),
      status: sinon.stub(),
      add: sinon.stub().resolves(),
      reset: sinon.stub().resolves(),
      stash: sinon.stub().resolves(),
      checkoutLocalBranch: sinon.stub().resolves(),
      checkout: sinon.stub().resolves(),
      branch: sinon.stub(),
    };

    // Stub the simple-git module
    const simpleGitFactory = sinon.stub().returns(simpleGitStub);

    // Stub inquirer prompts
    inquirerStub = sinon.stub(inquirer, 'prompt');

    // Spy on console.log and console.error
    consoleLogSpy = sinon.spy(console, 'log');
    consoleErrorSpy = sinon.spy(console, 'error');

    // Stub process.exit
    processExitStub = sinon.stub(process, 'exit');

    // Load the module with our stubs
    gswitch = proxyquire('../index.js', {
      'simple-git': simpleGitFactory,
    });
  });

  afterEach(() => {
    // Restore all stubs and spies
    sinon.restore();
  });

  it('should exit if not in a git repository', async () => {
    // Setup
    simpleGitStub.checkIsRepo.resolves(false);

    // Execute
    await gswitch.main();

    // Verify
    expect(consoleErrorSpy.calledWith('Not a git repository. Please run this command in a git repository.')).to.be.true;
    expect(processExitStub.calledWith(1)).to.be.true;
  });

  it('should handle no modified files', async () => {
    // Setup
    simpleGitStub.checkIsRepo.resolves(true);
    simpleGitStub.status.resolves({
      modified: [],
      not_added: [],
      created: [],
      deleted: [],
    });

    inquirerStub.onFirstCall().resolves({ action: 'new' });
    inquirerStub.onSecondCall().resolves({ branchName: 'test-branch' });

    // Execute
    await gswitch.main();

    // Verify
    expect(consoleLogSpy.calledWith('No modified files found. Nothing to do.')).to.be.true;
    expect(simpleGitStub.checkoutLocalBranch.calledWith('test-branch')).to.be.true;
  });

  it('should stash unselected files and create a new branch', async () => {
    // Setup
    simpleGitStub.checkIsRepo.resolves(true);
    simpleGitStub.status.resolves({
      modified: ['file1.js', 'file2.js'],
      not_added: ['file3.js'],
      created: [],
      deleted: [],
    });

    inquirerStub.onFirstCall().resolves({ filesToKeep: ['file1.js'] });
    inquirerStub.onSecondCall().resolves({ action: 'new' });
    inquirerStub.onThirdCall().resolves({ branchName: 'feature-branch' });

    // Execute
    await gswitch.main();

    // Verify
    expect(simpleGitStub.add.calledWith(['file1.js', 'file2.js', 'file3.js'])).to.be.true;
    expect(simpleGitStub.reset.calledWith(['HEAD', 'file1.js'])).to.be.true;
    expect(simpleGitStub.stash.calledWith(['save', 'gswitch: stashed changes'])).to.be.true;
    expect(simpleGitStub.checkoutLocalBranch.calledWith('feature-branch')).to.be.true;
  });

  it('should switch to an existing branch', async () => {
    // Setup
    simpleGitStub.checkIsRepo.resolves(true);
    simpleGitStub.status.resolves({
      modified: [],
      not_added: [],
      created: [],
      deleted: [],
    });

    simpleGitStub.branch.resolves({
      branches: {
        main: { current: true },
        develop: { current: false },
        'feature/test': { current: false },
      },
    });

    inquirerStub.onFirstCall().resolves({ action: 'existing' });
    inquirerStub.onSecondCall().resolves({ selectedBranch: 'develop' });

    // Execute
    await gswitch.main();

    // Verify
    expect(simpleGitStub.checkout.calledWith('develop')).to.be.true;
    expect(consoleLogSpy.calledWith('Switched to branch: develop')).to.be.true;
  });
});
