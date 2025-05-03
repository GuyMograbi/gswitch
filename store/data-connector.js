const path = require('path');
const os = require('os');
const fs = require('fs');
const lodash = require('lodash');

class DataConnection {
  constructor(repoName) {
    this.repoName = repoName;
  }

  static get configDir() {
    return this._configDir || path.join(os.homedir(), '.gswitch');
  }

  static set configDir(value) {
    this._configDir = value;
  }

  static get configFile() {
    return this._configFile || path.join(this.configDir, 'data.json');
  }

  static set configFile(value) {
    this._configFile = value;
  }

  static readRaw() {
    if (!fs.existsSync(this.configFile)) {
      return null;
    }
    return JSON.parse(fs.readFileSync(this.configFile, 'utf8'));
  }

  read(propertyKey) {
    const config = DataConnection.readRaw();
    if (config && config[this.repoName] && config[this.repoName][propertyKey]) {
      return config[this.repoName][propertyKey];
    }
    // Initialize stashes object if it doesn't exist
    return null;
  }

  write(propertyKey, data) {
    // Read the entire config file first
    const config = DataConnection.readRaw() || {};

    // Initialize the repository object if it doesn't exist
    if (!config[this.repoName]) {
      config[this.repoName] = {};
    }

    // Update only the specific property for this repository
    config[this.repoName][propertyKey] = data;

    // Ensure config directory exists
    if (!fs.existsSync(DataConnection.configDir)) {
      fs.mkdirSync(DataConnection.configDir, { recursive: true });
    }

    // Write the entire updated config back to the file
    fs.writeFileSync(DataConnection.configFile, JSON.stringify(config, null, 2), 'utf8');
  }

  insert(propertyKey, data) {
    const existingData = this.read(propertyKey) ?? [];
    existingData.push(data);
    this.write(propertyKey, existingData);
  }
}

let instance;
function initialize(repoName) {
  instance = new DataConnection(repoName);
}

function getConnection() {
  return instance;
}

function getAllRepositories() {
  const config = DataConnection.readRaw();
  if (!config) {
    return [];
  }
  return Object.keys(config);
}

function getAllContexts() {
  const config = DataConnection.readRaw();
  if (!config) {
    return [];
  }
  // clone
  return lodash.cloneDeep(config);
}

module.exports = {
  initialize,
  getConnection,
  getAllRepositories,
  getAllContexts,
  DataConnection,
};
