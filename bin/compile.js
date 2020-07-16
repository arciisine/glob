const fs = require('fs');
const path = require('path');
const { CH, TOKEN, STATE, RE } = require('../src/const');
const content = fs.readFileSync(path.resolve(__dirname, '../src/index.js'), 'utf8')
  .replace(/onToken\(TOKEN[.]([^),]+)\)/g, (v, t) => `addToken(${TOKEN[t]}); addRegex(...RE[TOKEN.${t}])`)
  .replace(/addState\(STATE[.]([^),]+)\)/g, (v, t) => `addState(${STATE[t]})`)
  .replace(/[.][.][.]RE\[TOKEN.(\S+)\]/g, (v, k) => JSON.stringify(RE[TOKEN[k]]).replace(/[\[\]]/g, ''))
  .replace(/\bCH[.]([A-Z_]+)/g, (v, k) => `${CH[k]}`)
  .replace(/\bSTATE[.]([A-Z_]+)/g, (v, k) => `${STATE[k]}`)
  .replace(/\bTOKEN[.]([A-Z_]+)/g, (v, k) => `${TOKEN[k]}`)
  .replace(/^.*\/\/ @dev/gm, '')
  .replace(/@dev-start.*?@dev-end/gs, '')
  .replace(/[/]{2}.*?\n/gs, '\n')
  .replace(/\/[*][*][^*]+?[*]\//gs, '')
  .replace(/[ ][ ]+/g, ' ')
  .replace(/\n\n+/g, '\n')
  .replace(/addRegex/g, '_r')
  .replace(/addToken/g, '_t')
  .replace(/addState/g, `_s`)
  .replace(/checkState/g, '_ch');

console.log(content);
