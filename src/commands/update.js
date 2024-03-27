'use strict';

const Base = require('./base');

const ChangeRequest  = require('./entity/changeRequest');

module.exports = class Update extends Base{
  
  constructor(program) {

    super();

    const createCommand = program.command('update');
    
    new ChangeRequest().update(createCommand);
  }
  
}
