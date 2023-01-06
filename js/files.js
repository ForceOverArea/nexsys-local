/**
 * @param {Element} fsElement the file `input` element
 * @param {Element} targetElement the element who should have their contents written to
 * @param {function} callback code to execute once the file has been loaded 
 */
export const load_file = (fsElement, targetElement, callback) => {
    
    const reader = new FileReader();
    const [file] = fsElement.files; 

    reader.onload = () => {
        targetElement.innerText = reader.result.replace(/\n\n/g, `\n`);
        callback();
    }

    if (file) { 
        reader.readAsText(file);
    }

    return null;
}

/**
 * @param {string} filename 
 * @param {string} text 
 */
export const download = (filename, text) => {
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);
  
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    return null;
}