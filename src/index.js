#! /usr/bin/env node

const  Create  = require('./commands/create')
const  Get  = require('./commands/get')
const  Update  = require('./commands/update')
const commander = require('commander') 

const program = new commander.Command();
// Add nested commands using `.command()`.
new Create(program)
new Get(program)
new Update(program)


program.parse(process.argv);