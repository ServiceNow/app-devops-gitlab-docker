'use strict';
const Base = require('./base');
const ChangeRequest  = require('./entity/changeRequest');

module.exports = class Get extends Base{
  constructor(program) {
    super();
    const getCommand = program.command('get');
    new ChangeRequest().get(getCommand);
  }
}
