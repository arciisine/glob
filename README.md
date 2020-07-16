# @arcsine/glob

A light-weight globbing library that shares an API with picomatch.  

Primary differences are limited support for vague regex patterns that picomatch supports, as well as limited 
support for group negation.  

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
* `[[:alnum:]]` all alpha-numeric values.
* `[[:alpha:]]` all alpha values.
* `[[:ascii:]]` all ascii values.
* `[[:blank:]]` simple whitespace
* `[[:cntrl:]]` control characters
* `[[:digit:]]` numbers
* `[[:lower:]]` lower case letters
* `[[:print:]]` printable characters
* `[[:punct:]]` punctuation
* `[[:space:]]` whitespace characcters