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
   * @param {number|number[]} tk
   * @param {number} state
   */
  const onToken = (ch, tk, state = 0) => {
    if (tk && !Array.isArray(tk)) {
      tokens.push(tk);
    }

    parts.push(...(Array.isArray(tk) ? tk :
      tk ? TOKEN_TO_RE[tk] :
        (CHAR_TO_RE[ch] || [ch]))
    );

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

    // State check
    switch (state) {
      case STATE.ESCAPED: onToken(ch, 0, -STATE.ESCAPED); continue;
      case STATE.RANGE: {
        switch (ch) {
          case CH.HYPHEN: onToken(ch, TOKEN.RANGE_SEP); continue;
          case CH.EXCLAMATION:
          case CH.CARET:
            if (prev === TOKEN.RANGE_START) {
              onToken(ch, TOKEN.RANGE_NEGATE);
              continue;
            }
            break;
          case CH.LEFT_SQUARE: { // Character class handling
            let start = i += 1;
            while (input.charCodeAt(i) !== CH.RIGHT_SQUARE) { i += 1; }
            const key = input.substring(start, i);
            if (!(key in POSIX_CLS)) {
              throw new Error(`Unexpected character class: ${key}`)
            }
            onToken(0, POSIX_CLS[key]);
            continue;
          }
          case CH.PERIOD: case CH.QUESTION:
          case CH.LEFT_CURLY: case CH.RIGHT_CURLY:
          case CH.LEFT_PARENS: case CH.RIGHT_PARENS:
          case CH.PLUS: case CH.ASTERISK:
          case CH.BACKSLASH:
            onToken(ch, [ch]);
            continue;
        }
        break;
      }
      case STATE.CHOICE:
        switch (ch) {
          case CH.COMMA: onToken(ch, TOKEN.CHOICE_SEP); continue;
        }
        break;
      case STATE.GROUP_RE:
        switch (ch) {
          case CH.BAR: onToken(ch, TOKEN.CHOICE_SEP); continue;
        }
        break;
    }

    // Check for special grouping symbols that may need to look back or forward
    if (ch in GROUP_CH_TO_TOKEN) {
      if (nextCh === CH.LEFT_PARENS) {
        // Starting a glob group
        onToken(ch, ...GROUP_CH_TO_TOKEN[ch]);
        i += 1;
        continue;
      } else if (prev === TOKEN.GROUP_RE_END || prev === TOKEN.RANGE_END) {
        switch (ch) { // Match RE groupings
          case CH.PLUS:
            onToken(ch, [ch]);
            continue;
        }
      }
    }

    // Regular handling
    switch (ch) {
      case CH.BACKSLASH: states.unshift(STATE.ESCAPED); continue;
      case CH.LEFT_CURLY: onToken(ch, TOKEN.CHOICE_START, STATE.CHOICE); continue;
      case CH.RIGHT_CURLY: onToken(ch, TOKEN.CHOICE_END, -STATE.CHOICE); continue;
      case CH.LEFT_SQUARE: onToken(ch, TOKEN.RANGE_START, STATE.RANGE); continue;
      case CH.RIGHT_SQUARE: onToken(ch, TOKEN.RANGE_END, -STATE.RANGE); continue;
      case CH.LEFT_PARENS: onToken(ch, TOKEN.GROUP_RE_START, STATE.GROUP_RE); continue;
      case CH.RIGHT_PARENS:
        if (!(state in GROUP_STATE_TO_TOKEN)) {
          throw new Error(`Unexecpted parens: )`)
        }
        onToken(ch, GROUP_STATE_TO_TOKEN[state], -state);
        continue;
      case CH.QUESTION: onToken(ch, TOKEN.WILDCARD_ONE); continue;
      case CH.ASTERISK:
        if (nextCh === CH.ASTERISK && (
          input.charCodeAt(i + 2) === CH.SLASH || (i + 2 === input.length))
        ) {
          onToken(ch, TOKEN.WILDCARD_NESTED);
          i += 2;
        } else {
          onToken(ch, TOKEN.WILDCARD_ANY);
        }
        continue;
    }
    onToken(ch, 0);
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