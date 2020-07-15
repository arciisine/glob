// @ts-check
/** @param {string} x  */ const nums = (x) => x.split('').map(x => x.charCodeAt(0));
/** @param {string} x  */ const esc = x => nums(`\\${x}`);

const CH = {
  ASTERISK: 0x2a, BACKSLASH: 0x5c, QUESTION: 0x3f, LEFT_CURLY: 0x7b, RIGHT_CURLY: 0x7d, LEFT_SQUARE: 0x5b,
  RIGHT_SQUARE: 0x5d, HYPHEN: 0x2d, EXCLAMATION: 0x21, COMMA: 0x2c, PERIOD: 0x2e, LEFT_PARENS: 0x28,
  RIGHT_PARENS: 0x29, PLUS: 0x2b, AT: 0x40, CARET: 0x5e, DOLLAR: 0x24, BAR: 0x7c, SLASH: 0x2f
};

let i = 1;
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

const STATE = {
  ESCAPED: 1, RANGE: 2, CHOICE: 3, GROUP_ONE: 4, GROUP_ANY: 5, GROUP_MANY: 6, GROUP_OPT: 7, GROUP_NOT: 8, GROUP_RE: 9
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
  [STATE.GROUP_RE]: TOKEN.GROUP_RE_END,
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
  [TOKEN.POSIX_WORD]: nums('A-Za-z0-9_'), [TOKEN.POSIX_XDIGIT]: nums('A-Fa-f0-9')
};

const CHAR_TO_RE = {
  [CH.PERIOD]: esc('.'), [CH.QUESTION]: esc('?'),
  [CH.LEFT_CURLY]: esc('{'), [CH.RIGHT_CURLY]: esc('}'),
  [CH.LEFT_SQUARE]: esc('['), [CH.RIGHT_SQUARE]: esc(']'),
  [CH.LEFT_PARENS]: esc('('), [CH.RIGHT_PARENS]: esc(')'),
  [CH.PLUS]: esc('+'), [CH.ASTERISK]: esc('*'),
  [CH.BACKSLASH]: esc('\\'), [CH.CARET]: esc('^'),
  [CH.DOLLAR]: esc('$'),
}

module.exports = {
  CH, TOKEN, STATE, GROUP_CH_TO_TOKEN, GROUP_STATE_TO_TOKEN,
  POSIX_CLS, TOKEN_TO_RE, CHAR_TO_RE
};