const path = require('path');
const os = require('os');
const fs = require('fs');

const configDir = path.join(os.homedir(), '.gswitch');
const configFile = path.join(configDir, 'data.json');

class DataConnection {
  constructor(repoName) {
    this.repoName = repoName;
  }

  static readRaw() {
    if (!fs.existsSync(configFile)) {
      return null;
    }
    return JSON.parse(fs.readFileSync(configFile, 'utf8'));
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
    const config = this.read() ?? {};
    if (!config[this.repoName]) {
      config[this.repoName] = {};
    }
    config[this.repoName][propertyKey] = data;
    // Ensure config directory exists
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }
    fs.writeFileSync(configFile, JSON.stringify(config, null, 2), 'utf8');
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

module.exports = {
  initialize,
  getConnection,
  getAllRepositories,
  DataConnection,
};
