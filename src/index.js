// @ts-check  // @dev
const { RE, CH, STATE, TOKEN } = require('./const'); // @dev

/** 
 * Make a regular expression
 * @param {string} input  
 */
function makeRe(input) {
  /** @type {Array<number>} */ const tokens = [];
  /** @type {Array<number>} */ const re = [];
  /** @type {Array<number>} */ const states = [];
  const addState = states.unshift.bind(states);
  const addRegex = re.push.bind(re);
  const addToken = tokens.push.bind(tokens);

  /** 
   * @param {number} ch
   * @param {number|undefined} state
   */
  const checkState = (ch, state) => {
    if (state ? state !== states.shift() : states.length) {
      throw new Error(`Invalid state, unexpected: ${ch ? String.fromCharCode(ch) : 'unclosed state'}`);
    }
  };

  /** @dev-start */
  /** 
   * @param {number} tk
   */
  const onToken = (tk) => {
    addToken(tk);
    addRegex(...RE[tk]);
  };
  /** @dev-end */

  for (let i = 0; i < input.length; i += 1) {
    const ch = input.charCodeAt(i);
    const nextCh = input.charCodeAt(i + 1);
    const state = states[0];
    const prev = tokens[tokens.length - 1];

    // State check
    switch (state) {
      case STATE.ESCAPED: {
        checkState(ch, STATE.ESCAPED);
        switch (ch) {
          case CH.LEFT_CURLY: case CH.RIGHT_CURLY:
          case CH.LEFT_SQUARE: case CH.RIGHT_SQUARE:
          case CH.LEFT_PARENS: case CH.RIGHT_PARENS:
          case CH.BACKSLASH: case CH.ASTERISK:
          case CH.PERIOD: case CH.QUESTION:
          case CH.CARET: case CH.PLUS:
          case CH.DOLLAR:
            addRegex(CH.BACKSLASH, ch); break;
          default: addRegex(ch);
        }
        continue;
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
              case 'alnum': onToken(TOKEN.POSIX_ALNUM); break;
              case 'alpha': onToken(TOKEN.POSIX_ALPHA); break;
              case 'ascii': onToken(TOKEN.POSIX_ASCII); break;
              case 'blank': onToken(TOKEN.POSIX_BLANK); break;
              case 'cntrl': onToken(TOKEN.POSIX_CNTRL); break;
              case 'digit': onToken(TOKEN.POSIX_DIGIT); break;
              case 'graph': onToken(TOKEN.POSIX_GRAPH); break;
              case 'lower': onToken(TOKEN.POSIX_LOWER); break;
              case 'print': onToken(TOKEN.POSIX_PRINT); break;
              case 'punct': onToken(TOKEN.POSIX_PUNCT); break;
              case 'space': onToken(TOKEN.POSIX_SPACE); break;
              case 'upper': onToken(TOKEN.POSIX_UPPER); break;
              case 'word': onToken(TOKEN.POSIX_WORD); break;
              case 'xdigit': onToken(TOKEN.POSIX_XDIGIT); break;
              default: throw new Error(`Unexpected character class: ${key}`);
            }
            continue;
          }
          case CH.PERIOD: case CH.QUESTION:
          case CH.LEFT_CURLY: case CH.RIGHT_CURLY:
          case CH.LEFT_PARENS: case CH.RIGHT_PARENS:
          case CH.PLUS: case CH.ASTERISK:
          case CH.BACKSLASH:
            addRegex(ch); // Inside of range, don't escape
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
        case CH.PLUS: onToken(TOKEN.GROUP_MANY_START); addState(STATE.GROUP_MANY); continue;
        case CH.ASTERISK: onToken(TOKEN.GROUP_ANY_START); addState(STATE.GROUP_ANY); continue;
        case CH.AT: onToken(TOKEN.GROUP_ONE_START); addState(STATE.GROUP_ONE); continue;
        case CH.QUESTION: onToken(TOKEN.GROUP_OPT_START); addState(STATE.GROUP_OPT); continue;
        case CH.EXCLAMATION: onToken(TOKEN.GROUP_NOT_START); addState(STATE.GROUP_NOT); continue;
        default: i -= 1;
      }
    } else if (prev === TOKEN.GROUP_RE_END || prev === TOKEN.RANGE_END) {
      switch (ch) { // Match RE groupings
        case CH.PLUS: addRegex(ch); continue;
      }
    }

    // Regular handling
    switch (ch) {
      case CH.BACKSLASH: addState(STATE.ESCAPED); continue;
      case CH.LEFT_CURLY: onToken(TOKEN.CHOICE_START); addState(STATE.CHOICE); continue;
      case CH.RIGHT_CURLY: onToken(TOKEN.CHOICE_END); checkState(ch, STATE.CHOICE); continue;
      case CH.LEFT_SQUARE: onToken(TOKEN.RANGE_START); addState(STATE.RANGE); continue;
      case CH.RIGHT_SQUARE: onToken(TOKEN.RANGE_END); checkState(ch, STATE.RANGE); continue;
      case CH.LEFT_PARENS: onToken(TOKEN.GROUP_RE_START); addState(STATE.GROUP_RE); continue;
      case CH.RIGHT_PARENS:
        switch (states.shift()) { // Pop
          case STATE.GROUP_MANY: onToken(TOKEN.GROUP_MANY_END); break;
          case STATE.GROUP_ANY: onToken(TOKEN.GROUP_ANY_END); break;
          case STATE.GROUP_ONE: onToken(TOKEN.GROUP_ONE_END); break;
          case STATE.GROUP_OPT: onToken(TOKEN.GROUP_OPT_END); break;
          case STATE.GROUP_NOT: onToken(TOKEN.GROUP_NOT_END); break;
          case STATE.GROUP_RE: onToken(TOKEN.GROUP_RE_END); break;
          default: throw new Error(`Invalid state, unexpected: )`);
        }
        continue;
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
      case CH.PERIOD:
      case CH.CARET:
      case CH.PLUS:
      case CH.DOLLAR:
        addRegex(CH.BACKSLASH, ch);
        continue;
      default: addRegex(ch);
    }
  }
  addRegex(CH.DOLLAR);
  checkState(0, undefined);
  re.unshift(CH.CARET);
  return new RegExp(String.fromCharCode.apply(String, re), 'u');
}

/**
 * Is a pattern a match for the text
 * @param {string} patt Glob pattern
 * @param {string} text Text to check against
 */
function isMatch(text, patt) {
  return makeRe(patt).test(text);
}

module.exports = { 'makeRe': makeRe, 'isMatch': isMatch };