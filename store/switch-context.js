const { getConnection, getAllRepositories, getAllContexts } = require('./data-connector');

const propertyKey = 'switch_context';

class SwitchContext {
  static getAllRepositories() {
    return getAllRepositories();
  }

  static getAllContexts() {
    return getAllContexts();
  }

  static getAll() {
    const data = getConnection().read(propertyKey);
    return data ?? [];
  }

  static create(item) {
    getConnection().insert(propertyKey, item);
  }

  static deleteOne(filter) {
    const all = this.getAll();
    const filtered = all.find(filter);
    if (filtered === undefined) {
      console.log('No items found to delete');
      return;
    }
    const keep = all.filter((item) => item !== filtered);
    getConnection().write(propertyKey, keep);
  }

  static findForBranch(branchName) {
    const all = this.getAll();
    return all.filter((context) => context.branch === branchName);
  }
}

module.exports = {
  SwitchContext,
};
