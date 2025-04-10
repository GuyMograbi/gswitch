const { getConnection } = require('./data-connector');

const propertyKey = 'switch_context';

class SwitchContext {
  static getAll() {
    const data = getConnection().read(propertyKey);
    return data ?? [];
  }

  static create(item) {
    getConnection().insert(propertyKey, item);
  }

  static delete(filter) {
    const all = this.getAll();
    const filtered = all.filter(filter);
    getConnection().write(propertyKey, filtered);
  }

  static findForBranch(branchName) {
    const all = this.getAll();
    return all.filter((context) => context.branch === branchName);
  }
}

module.exports = {
  SwitchContext,
};
