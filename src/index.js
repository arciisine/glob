// @ts-check
const { RE, CH, CH_RE, STATE, TOKEN } = require('./const');

/** 
 * Make a regular expression
 * @param {string} input  
 */
function makeRe(input) {
  /** @type {number[]} */ const tokens = [];
  /** @type {number[]} */ const re = [];
  /** @type {number[]} */ const states = [];

  /** 
   * @param {number} ch
   * @param {number} state
   */
  const checkState = (ch, state) => {
    if (state !== states.shift()) {
      throw new Error(`Invalid state, unexpected: ${String.fromCharCode(ch)}`);
    }
  };

  /** 
   * @param {number} tk
   * @param {number[]} [reChars]
   */
  const onToken = (tk, reChars = undefined) => {
    tokens.push(tk);
    if (!reChars) re.push(...RE[tk]);
    else re.push(...reChars);
  };

  for (let i = 0; i < input.length; i += 1) {
    const ch = input.charCodeAt(i);
    const nextCh = input.charCodeAt(i + 1);
    const state = states[0];
    const prev = tokens[tokens.length - 1];

    // State check
    switch (state) {
      case STATE.ESCAPED: {
        checkState(ch, -STATE.ESCAPED);
        switch (ch) {
          case CH.LEFT_CURLY: re.push(...CH_RE[CH.LEFT_CURLY]); continue;
          case CH.RIGHT_CURLY: re.push(...CH_RE[CH.RIGHT_CURLY]); continue;
          case CH.LEFT_SQUARE: re.push(...CH_RE[CH.LEFT_SQUARE]); continue;
          case CH.RIGHT_SQUARE: re.push(...CH_RE[CH.RIGHT_SQUARE]); continue;
          case CH.LEFT_PARENS: re.push(...CH_RE[CH.LEFT_PARENS]); continue;
          case CH.RIGHT_PARENS: re.push(...CH_RE[CH.RIGHT_PARENS]); continue;
          case CH.BACKSLASH: re.push(...CH_RE[CH.BACKSLASH]); continue;
          case CH.ASTERISK: re.push(...CH_RE[CH.ASTERISK]); continue;

          case CH.PERIOD: re.push(...CH_RE[CH.PERIOD]); continue;
          case CH.QUESTION: re.push(...CH_RE[CH.QUESTION]); continue;
          case CH.CARET: re.push(...CH_RE[CH.CARET]); continue;
          case CH.PLUS: re.push(...CH_RE[CH.PLUS]); continue;
          case CH.DOLLAR: re.push(...CH_RE[CH.DOLLAR]); continue;
          default: re.push(ch);
        }
      }
      case STATE.RANGE: {
        switch (ch) {
          case CH.HYPHEN: onToken(TOKEN.RANGE_SEP); continue;
          case CH.EXCLAMATION:
          case CH.CARET:
            if (prev === TOKEN.RANGE_START) {
              onToken(TOKEN.RANGE_NEGATE);
              continue;
            }
            break;
          case CH.LEFT_SQUARE: { // Character class handling
            let start = i += 1;
            while (input.charCodeAt(i) !== CH.RIGHT_SQUARE) { i += 1; }
            const key = input.substring(start + 1, i - 1);
            switch (key) {
              case 'alpha': onToken(TOKEN.POSIX_ALPHA); continue;
              case 'alnum': onToken(TOKEN.POSIX_ALNUM); continue;
              case 'alpha': onToken(TOKEN.POSIX_ALPHA); continue;
              case 'ascii': onToken(TOKEN.POSIX_ASCII); continue;
              case 'blank': onToken(TOKEN.POSIX_BLANK); continue;
              case 'cntrl': onToken(TOKEN.POSIX_CNTRL); continue;
              case 'digit': onToken(TOKEN.POSIX_DIGIT); continue;
              case 'graph': onToken(TOKEN.POSIX_GRAPH); continue;
              case 'lower': onToken(TOKEN.POSIX_LOWER); continue;
              case 'print': onToken(TOKEN.POSIX_PRINT); continue;
              case 'punct': onToken(TOKEN.POSIX_PUNCT); continue;
              case 'space': onToken(TOKEN.POSIX_SPACE); continue;
              case 'upper': onToken(TOKEN.POSIX_UPPER); continue;
              case 'word': onToken(TOKEN.POSIX_WORD); continue;
              case 'xdigit': onToken(TOKEN.POSIX_XDIGIT); continue;
            }
            throw new Error(`Unexpected character class: ${key}`);
          }
          case CH.PERIOD: case CH.QUESTION:
          case CH.LEFT_CURLY: case CH.RIGHT_CURLY:
          case CH.LEFT_PARENS: case CH.RIGHT_PARENS:
          case CH.PLUS: case CH.ASTERISK:
          case CH.BACKSLASH:
            re.push(ch); // Inside of range, don't escape
            continue;
        }
        break;
      }
      case STATE.CHOICE:
        switch (ch) { case CH.COMMA: onToken(TOKEN.CHOICE_SEP); continue; }
        break;
      case STATE.GROUP_RE:
        switch (ch) { case CH.BAR: onToken(TOKEN.CHOICE_SEP); continue; }
        break;
    }

    // Check for special grouping symbols that may need to look back or forward

    if (nextCh === CH.LEFT_PARENS) {
      i += 1;
      switch (ch) {
        case CH.PLUS: onToken(TOKEN.GROUP_MANY_START); checkState(ch, STATE.GROUP_MANY); continue;
        case CH.ASTERISK: onToken(TOKEN.GROUP_ANY_START); checkState(ch, STATE.GROUP_ANY); continue;
        case CH.AT: onToken(TOKEN.GROUP_ONE_START); checkState(ch, STATE.GROUP_ONE); continue;
        case CH.QUESTION: onToken(TOKEN.GROUP_OPT_START); checkState(ch, STATE.GROUP_OPT); continue;
        case CH.EXCLAMATION: onToken(TOKEN.GROUP_NOT_START); checkState(ch, STATE.GROUP_NOT); continue;
        default: i -= 1;
      }
    } else if (prev === TOKEN.GROUP_RE_END || prev === TOKEN.RANGE_END) {
      switch (ch) { // Match RE groupings
        case CH.PLUS: re.push(ch); continue;
      }
    }

    // Regular handling
    switch (ch) {
      case CH.BACKSLASH: states.unshift(STATE.ESCAPED); continue;
      case CH.LEFT_CURLY: onToken(TOKEN.CHOICE_START); states.unshift(STATE.CHOICE); continue;
      case CH.RIGHT_CURLY: onToken(TOKEN.CHOICE_END); checkState(ch, STATE.CHOICE); continue;
      case CH.LEFT_SQUARE: onToken(TOKEN.RANGE_START); states.unshift(STATE.RANGE); continue;
      case CH.RIGHT_SQUARE: onToken(TOKEN.RANGE_END); checkState(ch, STATE.RANGE); continue;
      case CH.LEFT_PARENS: onToken(TOKEN.GROUP_RE_START); states.unshift(STATE.GROUP_RE); continue;
      case CH.RIGHT_PARENS:
        switch (states.shift()) { // Pop
          case STATE.GROUP_MANY: onToken(TOKEN.GROUP_MANY_END); continue;
          case STATE.GROUP_NOT: onToken(TOKEN.GROUP_NOT_END); continue;
          case STATE.GROUP_OPT: onToken(TOKEN.GROUP_OPT_END); continue;
          case STATE.GROUP_ANY: onToken(TOKEN.GROUP_ANY_END); continue;
          case STATE.GROUP_ONE: onToken(TOKEN.GROUP_ONE_END); continue;
          case STATE.GROUP_RE: onToken(TOKEN.GROUP_RE_END); continue;
          default: throw new Error(`Unexecpted parens: )`);
        }
      case CH.QUESTION: onToken(TOKEN.WILDCARD_ONE); continue;
      case CH.ASTERISK:
        if (nextCh === CH.ASTERISK && (
          input.charCodeAt(i + 2) === CH.SLASH || (i + 2 === input.length))
        ) {
          onToken(TOKEN.WILDCARD_NESTED);
          i += 2;
        } else {
          onToken(TOKEN.WILDCARD_ANY);
        }
        continue;
      // Special chars
      case CH.PERIOD: re.push(...CH_RE[CH.PERIOD]); continue;
      case CH.CARET: re.push(...CH_RE[CH.CARET]); continue;
      case CH.PLUS: re.push(...CH_RE[CH.PLUS]); continue;
      case CH.DOLLAR: re.push(...CH_RE[CH.DOLLAR]); continue;
    }
    re.push(ch);
  }
  return new RegExp(String.fromCharCode(CH.CARET, ...re, CH.DOLLAR));
}

/**
 * Is a pattern a match for the text
 * @param {string} patt Glob pattern
 * @param {string} text Text to check against
 */
function isMatch(text, patt) {
  return makeRe(patt).test(text);
}

module.exports = { makeRe, isMatch };