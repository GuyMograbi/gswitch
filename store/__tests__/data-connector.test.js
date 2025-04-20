
const { initialize, getConnection, getAllRepositories, DataConnection } = require('../data-connector');
const { expect } = require('chai');
const fs = require('fs');
const path = require('path');

describe('DataConnection', () => {
  let originalConfigDir;
  let originalConfigFile;
  let testConfigPath;

  beforeEach(() => {
    originalConfigDir = DataConnection.configDir;
    originalConfigFile = DataConnection.configFile;

    // Set test config directory and file
    DataConnection.configDir = 'test-config';
    DataConnection.configFile = path.join(DataConnection.configDir, 'test-data.json');
    testConfigPath = DataConnection.configFile;

    // Clean up any existing test data
    if (fs.existsSync(DataConnection.configDir)) {
      if (fs.existsSync(testConfigPath)) {
        fs.unlinkSync(testConfigPath);
      }
    } else {
      fs.mkdirSync(DataConnection.configDir, { recursive: true });
    }
  });

  afterEach(() => {
    // Restore original config paths
    DataConnection.configDir = originalConfigDir;
    DataConnection.configFile = originalConfigFile;

    // Clean up test data
    if (fs.existsSync(testConfigPath)) {
      fs.unlinkSync(testConfigPath);
    }

    // Remove test directory if it's empty
    if (fs.existsSync(DataConnection.configDir) &&
        fs.readdirSync(DataConnection.configDir).length === 0) {
      fs.rmdirSync(DataConnection.configDir);
    }
  });

  describe('initialize', () => {
    it('should initialize the connection', () => {
      initialize('test-repo');
      expect(getConnection().repoName).to.equal('test-repo');
    });
  });

  describe('getAllRepositories', () => {
    it('should return all repositories', () => {
      initialize('test-repo');
      getConnection().insert('test-property', { test: 'data' });
      expect(getAllRepositories()).to.deep.equal(['test-repo']);
    });
  });

  describe('write', () => {
    // write to 2 different repoName, and check both are there
    it('should write to the correct repository', () => {
      initialize('test-repo');
      getConnection().insert('test-property', { test: 'data' });
      initialize('test-repo2');
      getConnection().insert('test-property', { test: 'data2' });

      const repos = getAllRepositories();
      expect(repos).to.include('test-repo');
      expect(repos).to.include('test-repo2');
      expect(repos.length).to.equal(2);
    });
  });

  describe('test isolation', () => {
    it('should start with a clean state', () => {
      // This test should run with a clean state
      const repos = getAllRepositories();
      expect(repos).to.deep.equal([]);
    });

    it('should have data only from this test', () => {
      initialize('isolation-test-repo');
      getConnection().insert('test-property', { test: 'isolation-data' });

      const repos = getAllRepositories();
      expect(repos).to.deep.equal(['isolation-test-repo']);
    });
  });
});
