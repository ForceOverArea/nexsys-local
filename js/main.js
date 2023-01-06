import { download, load_file } from "./files.js";
import init, { solve_js } from "./nexsys_js.js";
import { highlight } from "./syntax.js";

const Wasm = {
    solve_js: undefined
};

const UI = {
    theme_selector:     document.querySelector(`#theme-selector`),
    nxs_editor:         document.querySelector(`#editor-window`),
    nxs_format:         document.querySelector(`#editor-overlay`),
    nxs_soln:           document.querySelector(`#soln-window`),
    tolerance:          document.querySelector(`#tolerance`),
    tolerance_tile:     document.querySelector(`#tolerance-tile`),
    max_iters:          document.querySelector(`#max-iters`),
    max_iters_tile:     document.querySelector(`#max-iters-tile`),
    allow_ncv:          document.querySelector(`#allow-ncv`),
    allow_ncv_tile:     document.querySelector(`#allow-ncv-tile`),
    solve_btn:          document.querySelector(`#solve-btn`),
    theme_btn:          document.querySelector(`#theme-btn`),
    cli:                document.querySelector(`#cli`),
    cmd:                document.querySelector(`#cmd`),
    cmd_history:        document.querySelector(`#cmd-history`),
    fs_button:          document.querySelector(`#file-select`),
    dl_button:          document.querySelector(`#save-btn`)
}

init().then(() => {
    Wasm.solve_js = solve_js;
    UI.nxs_format.innerHTML = UI.nxs_editor.innerHTML = ``;
});

/** 
 * @param {string} state 
 */
const set_theme = state => localStorage.setItem(`theme`, JSON.stringify(state));
const get_theme = () => JSON.parse(localStorage.getItem(`theme`));

var current_theme_light = get_theme();
if (current_theme_light === null) { 
    current_theme_light = false; 
    set_theme(current_theme_light);
}

// Default solver parameters
UI.tolerance.value = `1E-5`;
UI.max_iters.value = `300`;
UI.allow_ncv.checked = false;
UI.theme_selector.href = [`./css/dark.css`, `./css/light.css`][Number(current_theme_light)];

const cmd_hist = [];
var cmd_count = 0;

const change_theme = () => {
    UI.theme_selector.href = [`./css/light.css`,`./css/dark.css`][Number(current_theme_light)];
    current_theme_light = !current_theme_light;
    set_theme(current_theme_light);
}

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
        clean_code(UI.nxs_editor.innerText),
        Number(UI.tolerance.value),
        Number(UI.max_iters.value),
        Boolean(UI.allow_ncv.value)
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

const format_nexsys_soln = (include_log=false) => {
    let ans = solve_nexsys_code();
    let soln = `<br>&nbsp;SOLUTION:`; 
    let log = `<br>&nbsp;LOG:`;

    if (typeof ans === `object`) {

        for (let key in ans[0]) {
            let num = Number(ans[0][key].value).toPrecision(7);
            soln += `<br>&nbsp;${key} = ${num}`;
        }
        UI.cmd_history.innerHTML += soln;
        
        // only add the log if it's asked for
        if (include_log) {
            for (let step in ans[1]) {
                log += `<br>&nbsp;${ans[1][step]}`;
            }
            UI.cmd_history.innerHTML += log;
        }

    } else {
        alert(`Solution failed with error: ${ans}`);
    }
}

const save_nexsys_code = () => {
    let [file] = UI.fs_button.files;

    if (file) {
        download(file.name, UI.nxs_editor.innerText);
    } else {
        download(`system_of_equations.nxs`, UI.nxs_editor.innerText);
    }
}

UI.theme_btn.onclick = change_theme;
UI.solve_btn.onclick = format_nexsys_soln;

UI.tolerance_tile.onclick = () => {
    UI.tolerance.focus();
}

UI.max_iters_tile.onclick = () => {
    UI.max_iters.focus();
}

UI.allow_ncv_tile.onclick = () => {
    UI.allow_ncv.checked = !UI.allow_ncv.checked;
}

UI.cli.onclick = UI.nxs_soln.onclick = () => {
    UI.cmd.focus();
}

const update_cli = () => {
    UI.cmd_history.innerHTML += `<br>&nbsp;[nexsys-cli]~>&nbsp;${UI.cmd.value}`;
    UI.cmd.value = ``;
}

UI.cmd.onkeydown = (event) => {
    if (event.key != `Enter`) {

        let hist = [``, ...cmd_hist];

        if (event.key === `ArrowUp`) {
            
            cmd_count++;
            if (hist[cmd_count] === undefined) { cmd_count--; } 
            cmd.value = hist[cmd_count];

        } else if (event.key === `ArrowDown`) {
            cmd_count--;
            if (hist[cmd_count] === undefined) {
                cmd_count++;
                cmd.value = ``;
            } else {
                cmd.value = hist[cmd_count];
            }
        }
        return null;
    }
    
    /** 
     * @type {string} 
     */
    const command = UI.cmd.value.toLowerCase(); 
    cmd_hist.unshift(command);     // alter history in RAM
    update_cli();               // update the cli

    if (command === `clear`) {
        
        UI.cmd_history.innerHTML = ``;

    } else if (command === `solve`) {
        
        format_nexsys_soln();

    } else if (command === `steps`) {

        format_nexsys_soln(true);

    } else if (command === `theme`) {

        change_theme();
    
    } else if (command === `save`) {
        
        save_nexsys_code();
    
    } else if (command === `open`) {
        
        UI.fs_button.click();

    } else if (command === `help`) {

        UI.cmd_history.innerHTML += 
        `<br>&nbsp;Welcome to Nexsys!
        <br>&nbsp;Some basic commands to get you started: 
        <br>
        <br>&nbsp;COMMAND  DESCRIPTION
        <br>&nbsp;'help'&nbsp;   displays this message
        <br>&nbsp;'clear'  clears terminal output
        <br>&nbsp;'solve'  solves the system of equations in the editor
        <br>&nbsp;'steps'  solves the system and shows work
        <br>&nbsp;'theme'  changes the theme between light and dark
        <br>&nbsp;'save'&nbsp;  downloads the current code as a text file
        <br>&nbsp;'open'&nbsp;  allows you to open a file in the editor
        <br>&nbsp;'reset-to-demo' changes the code in the editor to a demo`;
    
    } else if (command === `reset-to-demo`) {
        const demo_text = 
`keep c on [-10, 0]
guess -3 for c
a = 4
b = a + 5
i + j = b
i - j = a
c^2 = (i + j)`;
        UI.nxs_editor.innerText = demo_text;
        UI.nxs_format.innerHTML = highlight(UI.nxs_editor.innerText, true);

    } else if (command === ``) {
    } else {
        cmd_hist.shift();
        UI.cmd_history.innerHTML += `<br>&nbsp;found unknown command '${command}'. <br>&nbsp;Type 'help' for a list of commands.`;
    }
}

UI.nxs_editor.onkeyup = UI.nxs_editor.onkeydown = () => {
    UI.nxs_format.innerHTML = highlight(UI.nxs_editor.innerText);
}

UI.fs_button.onchange = () => {
    load_file(UI.fs_button, UI.nxs_editor, () => {
        UI.nxs_format.innerHTML = highlight(UI.nxs_editor.innerText);
    });
}

UI.dl_button.onclick = () => {
    save_nexsys_code();
}