// @ts-check
/** @param {string} x  */ const nums = x => [...x].map(c => c.charCodeAt(0));

/**
 * @constant
 */
const CH = {
  ASTERISK: 0x2a, BACKSLASH: 0x5c, QUESTION: 0x3f, LEFT_CURLY: 0x7b, RIGHT_CURLY: 0x7d, LEFT_SQUARE: 0x5b,
  RIGHT_SQUARE: 0x5d, HYPHEN: 0x2d, EXCLAMATION: 0x21, COMMA: 0x2c, PERIOD: 0x2e, LEFT_PARENS: 0x28,
  RIGHT_PARENS: 0x29, PLUS: 0x2b, AT: 0x40, CARET: 0x5e, DOLLAR: 0x24, BAR: 0x7c, SLASH: 0x2f
};

/**
 * @constant
 */
let i = 0;
const TOKEN = {
  WILDCARD_ANY: i++, WILDCARD_ONE: i++, WILDCARD_NESTED: i++,
  CHOICE_START: i++, CHOICE_SEP: i++, CHOICE_END: i++,
  RANGE_START: i++, RANGE_NEGATE: i++, RANGE_SEP: i++, RANGE_END: i++,

  GROUP_ONE_START: i++, GROUP_ONE_END: i++, GROUP_ANY_START: i++, GROUP_ANY_END: i++,
  GROUP_MANY_START: i++, GROUP_MANY_END: i++, GROUP_OPT_START: i++, GROUP_OPT_END: i++,
  GROUP_NOT_START: i++, GROUP_NOT_END: i++, GROUP_RE_START: i++, GROUP_RE_END: i++,

  POSIX_ALNUM: i++, POSIX_ALPHA: i++, POSIX_ASCII: i++, POSIX_BLANK: i++,
  POSIX_CNTRL: i++, POSIX_DIGIT: i++, POSIX_GRAPH: i++, POSIX_LOWER: i++,
  POSIX_PRINT: i++, POSIX_PUNCT: i++, POSIX_SPACE: i++, POSIX_UPPER: i++,
  POSIX_WORD: i++, POSIX_XDIGIT: i++
};

/**
 * @constant
 */
const STATE = {
  ESCAPED: 1, RANGE: 2, CHOICE: 3, GROUP_ONE: 4, GROUP_ANY: 5, GROUP_MANY: 6, GROUP_OPT: 7, GROUP_NOT: 8, GROUP_RE: 9
};

/**
 * @constant
 */
const RE = {
  [TOKEN.WILDCARD_NESTED]: nums('([^/]+[/])*'),
  [TOKEN.WILDCARD_ONE]: nums('[^/]'), [TOKEN.WILDCARD_ANY]: nums('[^/]*'),

  [TOKEN.CHOICE_START]: nums('('), [TOKEN.CHOICE_SEP]: nums('|'), [TOKEN.CHOICE_END]: nums(')'),

  [TOKEN.RANGE_START]: nums('['), [TOKEN.RANGE_SEP]: nums('-'),
  [TOKEN.RANGE_END]: nums(']'), [TOKEN.RANGE_NEGATE]: nums('^'),

  [TOKEN.GROUP_ONE_START]: nums('('), [TOKEN.GROUP_ONE_END]: nums(')'),
  [TOKEN.GROUP_RE_START]: nums('('), [TOKEN.GROUP_RE_END]: nums(')'),
  [TOKEN.GROUP_ANY_START]: nums('('), [TOKEN.GROUP_ANY_END]: nums(')*'),
  [TOKEN.GROUP_MANY_START]: nums('('), [TOKEN.GROUP_MANY_END]: nums(')+'),
  [TOKEN.GROUP_OPT_START]: nums('('), [TOKEN.GROUP_OPT_END]: nums(')?'),
  [TOKEN.GROUP_NOT_START]: nums('(?!'), [TOKEN.GROUP_NOT_END]: nums(')+.*'),

  [TOKEN.POSIX_ALNUM]: nums('\\p{L}\p{Nd}'), [TOKEN.POSIX_ALPHA]: nums('\\p{L}'),
  [TOKEN.POSIX_ASCII]: nums('\\x00-\\x7f'), [TOKEN.POSIX_BLANK]: nums('\p{Zs}\t'),
  [TOKEN.POSIX_CNTRL]: nums('\\p{Cc}'), [TOKEN.POSIX_DIGIT]: nums('\\p{Nd}'),
  [TOKEN.POSIX_GRAPH]: nums('^\\p{Z}\\p{C}'), [TOKEN.POSIX_LOWER]: nums('\\p{Ll}'),
  [TOKEN.POSIX_PRINT]: nums('\\P{C}'), [TOKEN.POSIX_PUNCT]: nums('\\p{P}\\p{S}'),
  [TOKEN.POSIX_SPACE]: nums('\\p{Z}\\t\\r\\n\\v\\f'), [TOKEN.POSIX_UPPER]: nums('\\p{Lu}'),
  [TOKEN.POSIX_WORD]: nums('\\\p{L}\p{Nd}_'), [TOKEN.POSIX_XDIGIT]: nums('A-Fa-f0-9'),
}

module.exports = { CH, TOKEN, STATE, RE };