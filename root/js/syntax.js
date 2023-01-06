/**
 * Cleans code to .nxs plain text format
 * @param {string} code the dirty/html code to be cleaned
 * @return {string} the cleaned code or null
 */
export const clean_code = (code, scrub_tags=true) => {
    
    if (scrub_tags) {
        let tags = code.match(/<.*?>/gi);

        if (tags === null) { 
            return code;
        }

        // format line breaks properly
        for (const t of tags) {
            if (t === `</div>`) {
                code = code.replace(t, `\n`);
            } else {
                code = code.replace(t, ``);
            }
        }
    }

    // format unit conversion tokens properly
    while (code.indexOf(`&gt;`) != -1) {
        code = code.replace(`&gt;`, `>`);
    }
    while (code.indexOf(`&lt;`) != -1) {
        code = code.replace(`&lt;`, `<`);
    }

    return code;
}

/**
 * @param {string} text the text (**NOT** html) inside of the target tag
 */
export const highlight = (text) => {

    // match tokens
    (function () {
        let tokens = text.match(
            /\=|\<|\>|\+|\-|\*|\/|\[|\]|\{|\}/g
        );

        if (tokens != null) {
            for (let tk of tokens) {
                text = text.replace(
                    tk, `@@@`
                );
            }
            for (let tk of tokens) {
                text = text.replace(
                    `@@@`, `<div class="keyword token">${tk}</div>`
                );
            }
        }
    })();

    // match keywords
    (function () {
        let keywords = text.match(
            /\b(if|else|keep|on|guess|for)/ig
        );
    
        if (keywords != null) {
            for (let kw of keywords) {
                text = text.replace(
                    kw, `@@@`
                );
            }
            for (let kw of keywords) {
                text = text.replace(
                    `@@@`, `<div class="keyword">${kw}</div>`
                );
            }
        }
    })();
    
    // correct newline issues
    (function () {
    //     console.log(`Raw: ${text}`);
        text = text.replace(/\n\n/g,`<br>`);
    //     console.log(`Corrected: ${text}`);
    })();

    return text;
}