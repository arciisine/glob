// @ts-check
/** @param {string} x  */ const nums = (x) => x.split('').map(x => x.charCodeAt(0));

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
const TOKEN = {
  WILDCARD_ANY: 1, WILDCARD_ONE: 2, WILDCARD_NESTED: 3,
  CHOICE_START: 4, CHOICE_SEP: 5, CHOICE_END: 6,
  RANGE_START: 7, RANGE_NEGATE: 8, RANGE_SEP: 9, RANGE_END: 10,

  GROUP_ONE_START: 11, GROUP_ONE_END: 12, GROUP_ANY_START: 13, GROUP_ANY_END: 14,
  GROUP_MANY_START: 15, GROUP_MANY_END: 16, GROUP_OPT_START: 17, GROUP_OPT_END: 18,
  GROUP_NOT_START: 19, GROUP_NOT_END: 20, GROUP_RE_START: 21, GROUP_RE_END: 22,

  POSIX_ALNUM: 23, POSIX_ALPHA: 24, POSIX_ASCII: 25, POSIX_BLANK: 26,
  POSIX_CNTRL: 27, POSIX_DIGIT: 28, POSIX_GRAPH: 29, POSIX_LOWER: 30,
  POSIX_PRINT: 31, POSIX_PUNCT: 32, POSIX_SPACE: 33, POSIX_UPPER: 34,
  POSIX_WORD: 35, POSIX_XDIGIT: 36
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
  [TOKEN.WILDCARD_NESTED]: nums('([^/]+\\/)*[^/]*'),
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

  [TOKEN.POSIX_ALNUM]: nums('a-zA-Z0-9'), [TOKEN.POSIX_ALPHA]: nums('a-zA-Z'),
  [TOKEN.POSIX_ASCII]: nums('\\x00-\\x7f'), [TOKEN.POSIX_BLANK]: nums(' \\t'),
  [TOKEN.POSIX_CNTRL]: nums('\\x00-\\x1f\\x7f'), [TOKEN.POSIX_DIGIT]: nums('0-9'),
  [TOKEN.POSIX_GRAPH]: nums('\\x21-\\x7e'), [TOKEN.POSIX_LOWER]: nums('a-z'),
  [TOKEN.POSIX_PRINT]: nums('\\x20-\\x7e'), [TOKEN.POSIX_PUNCT]: nums('\\-!"#$%&\'()\\*+,./:;<=>?@\\^_{|}~'),
  [TOKEN.POSIX_SPACE]: nums(' \\t\\r\\n\\v\\f'), [TOKEN.POSIX_UPPER]: nums('A-Z'),
  [TOKEN.POSIX_WORD]: nums('A-Za-z0-9_'), [TOKEN.POSIX_XDIGIT]: nums('A-Fa-f0-9'),
}

const CH_RE = {
  [CH.LEFT_CURLY]: nums('\\{'), [CH.RIGHT_CURLY]: nums('\\}'),
  [CH.LEFT_SQUARE]: nums('\\['), [CH.RIGHT_SQUARE]: nums('\\]'),
  [CH.LEFT_PARENS]: nums('\\('), [CH.RIGHT_PARENS]: nums('\\)'),
  [CH.BACKSLASH]: nums('\\\\'), [CH.ASTERISK]: nums('\\*'),

  [CH.PERIOD]: nums('\\.'), [CH.QUESTION]: nums('\\?'),
  [CH.CARET]: nums('\\^'), [CH.PLUS]: nums('\\+'),
  [CH.DOLLAR]: nums('\\$'),
};

module.exports = { CH, TOKEN, STATE, CH_RE, RE };