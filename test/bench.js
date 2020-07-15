const { makeRe } = require('../src/index');
console.log(makeRe('foo/bar/**/*.+(js|jsx)'));
console.log(makeRe('foo/bar/**/*.+(js|jsx)').test('foo/bar/baz.jsx'));
