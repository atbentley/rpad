LEFT_KEY = 37;
UP_KEY = 38;
RIGHT_KEY = 39;
DOWN_KEY = 40;
RETURN_KEY = 13;
BACKSPACE_KEY = 8;
ESC_KEY = 27;

STATE_EDIT = 0;
STATE_DELETE = 1;

var blocks = [];
var current_block;
var state = STATE_EDIT;

var require = [
    '/static/js/async.js',
    '/static/js/block.js',
    '/static/js/code_block.js',
    '/static/js/cursor_block.js'];
var loaded = -1;


function on_key_down(e) {
    switch (state) {
    case STATE_EDIT:
        current_block.on_key_down(e);
        break;

    case STATE_DELETE:
        switch (e.which) {
        case BACKSPACE_KEY:
            var index = current_block.getIndex();
            current_block.remove();
            blocks[index].remove();
            if (index == blocks.length) {
                blocks[index-1].focus();
            } else {
                blocks[index].focus();
            }
            state = STATE_EDIT;
            e.preventDefault();
            break;
        }
        break;
    }
}


function load_scripts() {
    loaded += 1;
    if (loaded == require.length) {
        page = document.getElementById('page');
        document.body.onkeydown = on_key_down;
        new CursorBlock();
        var code_block = new CodeBlock();
        new CursorBlock();
        code_block.focus();
    } else {
        var script = document.createElement('script');
        script.src = require[loaded];
        script.onload = load_scripts;
        document.getElementsByTagName('head')[0].appendChild(script);
    }
}

window.onload = load_scripts;