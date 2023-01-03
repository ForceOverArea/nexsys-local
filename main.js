import init, { solve_js } from "./js/nexsys_js.js";

const clog = console.log;
const Wasm = {
    solve_js: undefined
};

const theme_selector =  document.querySelector(`#theme-selector`);
const nxs_code_ =       document.querySelector(`#editor-window`);
const nxs_soln_ =       document.querySelector(`#soln-window`);
const tolerance =       document.querySelector(`#tolerance`);
const tolerance_tile =  document.querySelector(`#tolerance-tile`);
const max_iters =       document.querySelector(`#max-iters`);
const max_iters_tile =  document.querySelector(`#max-iters-tile`);
const allow_ncv =       document.querySelector(`#allow-ncv`);
const allow_ncv_tile =  document.querySelector(`#allow-ncv-tile`);
const solve_btn =       document.querySelector(`#solve-btn`);
const theme_btn =       document.querySelector(`#theme-btn`);
const cli =             document.querySelector(`#cli`);
const cmd =             document.querySelector(`#cmd`);
const cmd_history =     document.querySelector(`#cmd-history`);

init().then(() => {
    Wasm.solve_js = solve_js;
    nxs_code_.innerHTML = 
    `<div>a = 4</div>
    <div>b = a + 5</div>
    <br>
    <div>i + j = b</div>
    <div>i - j = a</div>`;
});

// Default solver parameters
tolerance.value = `1E-5`;
max_iters.value = `300`;
allow_ncv.checked = false;

var current_theme_light = false;

/**
 * Cleans code to .nxs plain text format
 * @param {string} code the dirty/html code to be cleaned
 * @return {string} the cleaned code or null
 */
const clean_code = (code) => {
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
 * @returns {[object, object] | string}
 */
const solve_nexsys_code = () => {

    let raw = Wasm.solve_js(
        clean_code(nxs_code_.innerHTML),
        Number(tolerance.value),
        Number(max_iters.value),
        Boolean(allow_ncv.value)
    )
    .replace(`<solution>`, ``)
    .replace(`</log>`, ``);

    const ans = raw.split(`</solution><log>`);

    if (ans.length === 2) {

        const soln = JSON.parse(ans[0]);
        const log = JSON.parse(ans[1]);

        return [soln, log];
    
    } else {
    
        return ans[0];
    
    }
}

const format_nexsys_soln = (include_log) => {
    let ans = solve_nexsys_code();
    let soln = `<br><br>&nbsp;SOLUTION:<br>`; 
    let log = `<br><br>&nbsp;LOG:<br>`;

    if (typeof ans === `object`) {

        for (let key in ans[0]) {
            let num = Number(ans[0][key].value).toPrecision(7);
            soln += `&nbsp;${key} = ${num}<br>`;
        }
        cmd_history.innerHTML += soln;
        
        // only add the log if it's asked for
        if (include_log) {
            for (let step in ans[1]) {
                log += `&nbsp;${ans[1][step]}<br>`;
            }
            cmd_history.innerHTML += log;
        }

    } else {
        alert(`Solution failed with error: ${ans}`);
    }
}

const change_theme = () => {
    if (current_theme_light) {
        theme_selector.href = `./css/dark.css`;
    } else {
        theme_selector.href = `./css/light.css`;
    }
    current_theme_light = !current_theme_light;
}

theme_btn.onclick = change_theme;
solve_btn.onclick = format_nexsys_soln;

tolerance_tile.onclick = () => {
    tolerance.focus();
}

max_iters_tile.onclick = () => {
    max_iters.focus();
}

allow_ncv_tile.onclick = () => {
    allow_ncv.checked = !allow_ncv.checked;
}

cli.onclick = nxs_soln_.onclick = () => {
    cmd.focus();
}

const update_cli = () => {
    cmd_history.innerHTML += `<br>&nbsp;[nexsys-cli]~>&nbsp;${cmd.value}`;
    cmd.value = ``;
}

cmd.onkeydown = (event) => {
    if (event.key != `Enter`) { return null; } // guard clause against other events
    
    const command = cmd.value.toLowerCase(); 
    update_cli();

    if (command === `clear`) {
        
        cmd_history.innerHTML = ``;

    } else if (command === `solve`) {
        
        format_nexsys_soln();

    } else if (command === `steps`) {

        format_nexsys_soln(true);

    } else if (command === `theme`) {

        change_theme();
    
    } else if (command === `help`) {

        cmd_history.innerHTML += 
        `<br>&nbsp;Welcome to Nexsys!
        <br>&nbsp;Some basic commands to get you started: 
        <br>
        <br>&nbsp;COMMAND  DESCRIPTION
        <br>&nbsp;'help'&nbsp;   displays this message
        <br>&nbsp;'clear'  clears terminal output
        <br>&nbsp;'solve'  solves the system of equations in the editor
        <br>&nbsp;'steps'  solves the system and shows work
        <br>&nbsp;'theme'  changes the theme between light and dark
        <br>`;

    } else if (command === ``) {
    } else {
    
        cmd_history.innerHTML += `<br>&nbsp;found unknown command '${command}'. <br>&nbsp;Type 'help' for a list of commands.`;
    
    }
}