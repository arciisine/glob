// @ts-check
/** @param {string} x  */ const nums = (x) => x.split('').map(x => x.charCodeAt(0));
/** @param {string} x  */ const esc = x => nums(`\\${x}`);

const CH = {
  ASTERISK: 0x2a, BACKSLASH: 0x5c, QUESTION: 0x3f, LEFT_CURLY: 0x7b, RIGHT_CURLY: 0x7d, LEFT_SQUARE: 0x5b,
  RIGHT_SQUARE: 0x5d, HYPHEN: 0x2d, EXCLAMATION: 0x21, COMMA: 0x2c, PERIOD: 0x2e, LEFT_PARENS: 0x28,
  RIGHT_PARENS: 0x29, PLUS: 0x2b, AT: 0x40, CARET: 0x5e, DOLLAR: 0x24, BAR: 0x7c, SLASH: 0x2f
};

const TOKEN = {
  WILDCARD_ANY: 1, WILDCARD_ONE: 2, WILDCARD_NESTED: 3,
  CHOICE_START: 4, CHOICE_SEP: 5, CHOICE_END: 6,
  RANGE_START: 7, RANGE_NEGATE: 10, RANGE_SEP: 8, RANGE_END: 9,
  GROUP_ONE_START: 11, GROUP_ONE_END: 12, GROUP_ANY_START: 13, GROUP_ANY_END: 14,
  GROUP_MANY_START: 15, GROUP_MANY_END: 16, GROUP_OPT_START: 17, GROUP_OPT_END: 18,
  GROUP_NOT_START: 19, GROUP_NOT_END: 20,
  POSIX_ALNUM: 21, POSIX_ALPHA: 22, POSIX_ASCII: 23, POSIX_BLANK: 24,
  POSIX_CNTRL: 25, POSIX_DIGIT: 26, POSIX_GRAPH: 27, POSIX_LOWER: 28,
  POSIX_PRINT: 29, POSIX_PUNCT: 30, POSIX_SPACE: 31, POSIX_UPPER: 32,
  POSIX_WORD: 33, POSIX_XDIGIT: 34
};

const STATE = {
  ESCAPED: 1, RANGE: 2, CHOICE: 3, GROUP_ONE: 4, GROUP_ANY: 5, GROUP_MANY: 6, GROUP_OPT: 7, GROUP_NOT: 8
};

/** @type {Record<number, [number,number]>}*/
const GROUP_CH_TO_TOKEN = {
  [CH.PLUS]: [TOKEN.GROUP_MANY_START, STATE.GROUP_MANY],
  [CH.EXCLAMATION]: [TOKEN.GROUP_NOT_START, STATE.GROUP_NOT],
  [CH.QUESTION]: [TOKEN.GROUP_OPT_START, STATE.GROUP_OPT],
  [CH.ASTERISK]: [TOKEN.GROUP_ANY_START, STATE.GROUP_ANY],
  [CH.AT]: [TOKEN.GROUP_ONE_START, STATE.GROUP_ONE]
};

const GROUP_STATE_TO_TOKEN = {
  [STATE.GROUP_MANY]: TOKEN.GROUP_MANY_END,
  [STATE.GROUP_NOT]: TOKEN.GROUP_NOT_END,
  [STATE.GROUP_OPT]: TOKEN.GROUP_OPT_END,
  [STATE.GROUP_ANY]: TOKEN.GROUP_ANY_END,
  [STATE.GROUP_ONE]: TOKEN.GROUP_ONE_END,
};

const POSIX_CLS = {
  ':alnum:': TOKEN.POSIX_ALNUM, ':alpha:': TOKEN.POSIX_ALPHA,
  ':ascii:': TOKEN.POSIX_ASCII, ':blank:': TOKEN.POSIX_BLANK,
  ':cntrl:': TOKEN.POSIX_CNTRL, ':digit:': TOKEN.POSIX_DIGIT,
  ':graph:': TOKEN.POSIX_GRAPH, ':lower:': TOKEN.POSIX_LOWER,
  ':print:': TOKEN.POSIX_PRINT, ':punct:': TOKEN.POSIX_PUNCT,
  ':space:': TOKEN.POSIX_SPACE, ':upper:': TOKEN.POSIX_UPPER,
  ':word:': TOKEN.POSIX_WORD, ':xdigit:': TOKEN.POSIX_XDIGIT
}

const TOKEN_TO_RE = {
  [TOKEN.WILDCARD_NESTED]: nums('([^/]+\\/)*[^/]*'),
  [TOKEN.WILDCARD_ONE]: nums('[^/]'), [TOKEN.WILDCARD_ANY]: nums('[^/]*'),

  [TOKEN.CHOICE_START]: nums('('), [TOKEN.CHOICE_SEP]: nums('|'), [TOKEN.CHOICE_END]: nums(')'),

  [TOKEN.RANGE_START]: nums('['), [TOKEN.RANGE_SEP]: nums('-'),
  [TOKEN.RANGE_END]: nums(']'), [TOKEN.RANGE_NEGATE]: nums('^'),

  [TOKEN.GROUP_ONE_START]: nums('('), [TOKEN.GROUP_ONE_END]: nums(')'),
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
  [TOKEN.POSIX_WORD]: nums('A-Za-z0-9_'), [TOKEN.POSIX_XDIGIT]: nums('A-Fa-f0-9')
};

const CHAR_TO_RE = {
  [CH.PERIOD]: esc('.'), [CH.QUESTION]: esc('?'),
  [CH.LEFT_CURLY]: esc('{'), [CH.RIGHT_CURLY]: esc('}'),
  [CH.LEFT_SQUARE]: esc('['), [CH.RIGHT_SQUARE]: esc(']'),
  [CH.LEFT_PARENS]: esc('('), [CH.RIGHT_PARENS]: esc(')'),
  [CH.PLUS]: esc('+'), [CH.ASTERISK]: esc('*'),
  [CH.BACKSLASH]: esc('\\')
}

module.exports = {
  CH, TOKEN, STATE, GROUP_CH_TO_TOKEN, GROUP_STATE_TO_TOKEN, POSIX_CLS, TOKEN_TO_RE, CHAR_TO_RE
};