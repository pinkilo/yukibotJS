// Credit https://sonspring.com/journal/husky-v5-and-npm-prepare/

// =======
// Import.
// =======

const { execSync } = require('child_process');
const { existsSync } = require('fs');

// ===========
// File paths.
// ===========

const FILE_COMMIT = './.husky/pre-commit';
const FILE_HUSKY = './.husky/_/husky.sh';


// ==============
// Husky install.
// ==============
const CLI_HUSKY = 'npx husky install';

if (!existsSync(FILE_HUSKY)) {
  global.console.log(CLI_HUSKY);
  execSync(CLI_HUSKY);
}

// ====================
// Add pre-commit hook.
// ====================

const PRECOMMITS = [
  'npx husky add .husky/pre-commit "yarn prettier/check"',
  'npx husky add .husky/commit-msg  "npx --no -- commitlint --edit ${1}"'
]

if (!existsSync(FILE_COMMIT)) {
  for (let precommit of PRECOMMITS) {
    global.console.log(precommit);
    execSync(precommit);
  }
}
