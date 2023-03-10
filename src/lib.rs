use wasm_bindgen::prelude::*;
use nexsys::{solve, cleanup};

macro_rules! struct2json {
    ( $i:expr, $( $ch:tt ),* ) => {{
        let mut out = $i;
        $(out = out.replace($ch, format!("\"{}\"", $ch).as_str());)*
        out
    }};
}

#[wasm_bindgen]
pub fn solve_js(system: &str, tolerance: f64, max_iterations: usize, allow_nonconvergence: bool) -> String {
    
    let (soln, log) = match solve(system, Some(tolerance), Some(max_iterations), allow_nonconvergence) {
        Ok(o) => o,
        Err(e) => return format!("{}", e) // return early with the error statement
    };

    // Lord forgive me...

    let no_enums = cleanup!(format!("<solution>{:?}</solution><log>{:?}</log>", soln, log),"Some(", ")");
    
    struct2json!(no_enums, "value", "domain")
    .replace("- (", "=")
    .replace("None", "null")
    .replace("Variable", "")
}