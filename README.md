# @arcsine/glob

A light-weight, simple globbing library that shares an API with picomatch.  

The code, when compressed is about 1.1kb. Additionally, the source is small and is fairly straightforward to read through.

Primary differences are limited support for vague regex patterns that picomatch supports, as well as limited 
support for group negation.  Consequently, there are also many edge cases that this library does not take into
consideration (as of yet), and should be used for fairly standard globbing usages.

Primary features:
* `*` matches any characters except for `/`
* `?` matches zero or one characters
* `.` matches one character
* `**` matches zero or more folder depths
* `{a,b}` matches `a` or `b`
* `@(a|b)` matches `a` or `b`, one time
* `+(a|b)` matches `a` or `b`, one or more times
* `?(a|b)` matches `a` or `b`, zero or one times
* `*(a|b)` matches `a` or `b`, zero or more times
* `[ab]` matches `a` or `b`, once
* `[a-z]` matches `a` through `z`, once
* `[!ab]` or `[^ab]` matches anything other than `a` or `b`, once

In addition to simple character class, support, there is also support for POSIX character classes:
* `[[:alnum:]]` alpha-numeric values
* `[[:alpha:]]` alpha values
* `[[:ascii:]]` ascii values
* `[[:blank:]]` simple whitespace
* `[[:cntrl:]]` control characters
* `[[:digit:]]` numbers
* `[[:lower:]]` lower case letters
* `[[:print:]]` printable characters
* `[[:punct:]]` punctuation
* `[[:space:]]` whitespace characters
* `[[:upper:]]` upper case characters
* `[[:word:]]` alpha-numeric as well as _
* `[[:xdigit:]]` hexidecimal characters

## Usage

```javascript
const {isMatch} = require('@arcsine/glob');
isMatch('folder/level/two/ab', '**/+([ab])') === true
```