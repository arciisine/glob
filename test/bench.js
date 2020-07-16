const { makeRe } = require('..');
const { isMatch } = require('..');
let s = 0;
for (let i = 0; i < 1000000; i++) {
  const inp = 'aa/b' + 'c'.repeat(Math.trunc(Math.log10(i + 1)) + 1);
  const start = process.hrtime();
  isMatch('**/*', inp);
  const end = process.hrtime(start);
  // console.log('match', end[1]);
  s += end[1];
}
console.log(s / 1000000);