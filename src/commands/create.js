'use strict';

const Base = require('./base');

const ChangeRequest  = require('./entity/changeRequest');
const Package = require('./entity/package');
const Artifact = require('./entity/artifact');
const SonarRegistration = require('./entity/sonarRegistration');
const SecurtyScanRegistration = require('./entity/securityScan');

module.exports = class Create extends Base{
  
  constructor(program) {

    super();

    const createCommand = program.command('create');

    new ChangeRequest().create(createCommand);
    new Package().create(createCommand);
    new Artifact().create(createCommand);
    new SonarRegistration().create(createCommand);
    new SecurtyScanRegistration().create(createCommand);
  }
  
}
