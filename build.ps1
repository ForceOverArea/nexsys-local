wasm-pack build --target web --release
Move-Item ./pkg/nexsys_js.js ./root/js/nexsys_js.js -Force
Move-Item ./pkg/nexsys_js_bg.wasm ./root/js/nexsys_js_bg.wasm -Force
Remove-Item ./pkg -Recurse