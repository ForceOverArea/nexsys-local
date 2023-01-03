import init, { solve_js } from "./js/nexsys_js.js";

const clog = console.log;
const Wasm = {
    solve_js: undefined
};

const theme_selector =  document.querySelector(`#theme-selector`);
const nxs_code_ =       document.querySelector(`#editor-window`);
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
const scrub_tags = (code) => {
    let tags = code.match(/<.*?>/gi);

    if (tags === null) { 
        return code;
    }

    for (const t of tags) {
        code = code.replace(t, ``);
    }
    return code;
}

/**
 * @returns {[object, object] | string}
 */
const solve_nexsys_code = () => {

    let raw = Wasm.solve_js(
        scrub_tags(nxs_code_.innerHTML),
        Number(tolerance.value),
        Number(max_iters.value),
        Boolean(allow_ncv.value)
    );

    clog(raw);

    if (
        raw.indexOf("{") != -1 && 
        raw.indexOf("}") != -1
        ) {

        let data = JSON.parse(raw);

        return [data.soln, data.log];
    
    } else {
    
        return raw;
    
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

solve_btn.onclick = solve_nexsys_code;

theme_btn.onclick = change_theme;

tolerance_tile.onclick = () => {
    tolerance.focus();
}

max_iters_tile.onclick = () => {
    max_iters.focus();
}

allow_ncv_tile.onclick = () => {
    allow_ncv.checked = !allow_ncv.checked;
}

cli.onclick = () => {
    cmd.focus();
}

const update_cli = () => {
    cmd_history.innerHTML += `<br>&nbsp;[nexsys-cli]~>&nbsp;${cmd.value}`;
    cmd.value = ``;
}

cmd.onkeydown = (event) => {
    if (event.key != `Enter`) { return null; }
    
    const command = cmd.value.toLowerCase(); 
    update_cli();

    if (command === `clear`) {
        
        cmd_history.innerHTML = ``;
        
        return null;

    } else if (command === `solve`) {

        clog(solve_nexsys_code());

        return null;

    } else if (command === `theme`) {

        change_theme();
    
    } else if (command === `help`) {

        cmd_history.innerHTML += 
        `<br>&nbsp;Welcome to Nexsys!
        <br>&nbsp;Some basic commands to get you started: 
        <br>&nbsp;
        <br>&nbsp;COMMAND  DESCRIPTION
        <br>&nbsp;'help'&nbsp;   displays this message
        <br>&nbsp;'clear'  clears terminal output
        <br>&nbsp;'solve'  solves the system of equations in the editor
        <br>&nbsp;'theme'  changes the theme between light and dark
        <br>&nbsp;`;

    } else {
    
        cmd_history.innerHTML += `<br>&nbsp;found unknown command '${command}'. <br>&nbsp;Type 'help' for a list of commands.`;
    
    }
}