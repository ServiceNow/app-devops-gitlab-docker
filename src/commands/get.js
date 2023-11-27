'use strict';

module.exports = class Get {
  constructor(program) {
    const getCommand = program.command('get');

    getCommand .command('change')
      .action(() => {
        console.log('get change');
      });

      getCommand.command('package')
      .action(() => {
        console.log('get package');
      });

  }
}
