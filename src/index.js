// @ts-check
const {
  TOKEN_TO_RE, CHAR_TO_RE, GROUP_CH_TO_TOKEN,
  GROUP_STATE_TO_TOKEN, CH, POSIX_CLS,
  STATE, TOKEN
} = require('./const');

/** 
 * Make a regular expression
 * @param {string} input  
 */
function makeRe(input) {
  /** @type {number[]} */ const tokens = [];
  /** @type {number[]} */ const parts = [];
  /** @type {number[]} */ const states = [];

  /** 
   * @param {number} tk
   * @param {number} state
   */
  const onToken = (ch, tk, state = 0) => {
    if (tk) {
      tokens.push(tk);
      parts.push(...(TOKEN_TO_RE[tk] || CHAR_TO_RE[ch] || [ch]));
    } else if (ch in CHAR_TO_RE) {
      parts.push(...CHAR_TO_RE[ch]);
    } else {
      parts.push(ch);
    }
    if (state > 0) {
      states.unshift(state);
    } else if (state < 0 && -state !== states.shift()) {
      throw new Error(`Invalid state, unexpected: ${String.fromCharCode(ch)}`);
    }
  };

  for (let i = 0; i < input.length; i += 1) {
    const ch = input.charCodeAt(i);
    const nextCh = input.charCodeAt(i + 1);
    const state = states[0];
    const prev = tokens[tokens.length - 1];

    switch (state) {
      case STATE.ESCAPED: onToken(ch, 0, -STATE.ESCAPED); continue;
      case STATE.RANGE: break;
      default:
        if (nextCh === CH.LEFT_PARENS && GROUP_CH_TO_TOKEN[ch]) {
          onToken(ch, ...GROUP_CH_TO_TOKEN[ch]);
          i += 1;
          continue;
        }
    }

    switch (ch) {
      case CH.BACKSLASH: states.push(STATE.ESCAPED); break;
      case CH.QUESTION: onToken(ch, state !== STATE.RANGE ? TOKEN.WILDCARD_ONE : 0); break;
      case CH.EXCLAMATION: onToken(ch, state === STATE.RANGE && prev === TOKEN.RANGE_START ? TOKEN.RANGE_NEGATE : 0); break;
      case CH.LEFT_CURLY: onToken(ch, TOKEN.CHOICE_START, STATE.CHOICE); break;
      case CH.RIGHT_CURLY: onToken(ch, TOKEN.CHOICE_END, -STATE.CHOICE); break;
      case CH.LEFT_SQUARE: {
        onToken(ch, TOKEN.RANGE_START, STATE.RANGE);
        if (nextCh === CH.LEFT_SQUARE) { // Character class handling
          let start = i = i + 2;
          while (input.charCodeAt(i) !== CH.RIGHT_SQUARE) { i += 1; }
          const key = input.substring(start, i);
          if (!(key in POSIX_CLS)) {
            throw new Error(`Unexpected character class: ${key}`)
          }
          onToken(0, POSIX_CLS[key]);
          onToken(input.charCodeAt(i), TOKEN.RANGE_END, -STATE.RANGE);
          if (input.charCodeAt(i += 1) !== CH.RIGHT_SQUARE) {
            throw new Error(`Unexpected character: ${input.charAt(i)}, expected ']'`);
          }
        }
        break;
      }
      case CH.RIGHT_SQUARE: onToken(ch, TOKEN.RANGE_END, -STATE.RANGE); break;
      case CH.HYPHEN: onToken(ch, state === STATE.RANGE ? TOKEN.RANGE_SEP : 0); break;
      case CH.COMMA: onToken(ch, state === STATE.CHOICE ? TOKEN.CHOICE_SEP : 0); break;
      case CH.ASTERISK:
        onToken(ch, nextCh === CH.ASTERISK ? TOKEN.WILDCARD_NESTED : TOKEN.WILDCARD_ANY);
        i += (nextCh === CH.ASTERISK ? 1 : 0);
        break;
      case CH.RIGHT_PARENS: {
        if (!(state in GROUP_STATE_TO_TOKEN)) {
          throw new Error(`'Unexpected character: ${input.charAt(i)}`);
        }
        onToken(ch, GROUP_STATE_TO_TOKEN[state], -state);
        break;
      }
      default: onToken(ch, 0);
    }
  }
  return new RegExp(String.fromCharCode(CH.CARET, ...parts, CH.DOLLAR));
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