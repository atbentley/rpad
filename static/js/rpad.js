var PAD = {};

// Key code constants
PAD.LEFT_KEY = 37;
PAD.UP_KEY = 38;
PAD.RIGHT_KEY = 39;
PAD.DOWN_KEY = 40;
PAD.RETURN_KEY = 13;
PAD.BACKSPACE_KEY = 8;
PAD.ESC_KEY = 27;

// State constants
PAD.STATE_EDIT = 0;
PAD.STATE_DELETE = 1;

// State variables
PAD.blocks = [];  // An ordered list of blocks currently inserted in the page
PAD.current_block;  // The currently focused block
PAD.state = PAD.STATE_EDIT;  // The state the pad is currently in

// Pad properties
PAD.id = parseInt(document.URL.split('/').pop());
PAD.name = 'untitled';
PAD.block_types = [];

// Additional JS files to load
var require = [
    '/static/js/async.js',
    '/static/js/block.js',
    '/static/js/code_block.js',
    '/static/js/cursor_block.js',
    '/static/js/text_block.js'];
var loaded = -1;  // Count of additional JS files loaded


function on_key_down(e) {
    switch (PAD.state) {
    case PAD.STATE_EDIT:
        PAD.current_block.on_key_down(e);
        break;

    case PAD.STATE_DELETE:
        switch (e.which) {
        case PAD.BACKSPACE_KEY:
            var index = PAD.current_block.getIndex();
            PAD.current_block.remove();
            PAD.blocks[index].remove();
            PAD.blocks[index-1].focus();
            PAD.state = PAD.STATE_EDIT;
            e.preventDefault();
            break;
        }
        break;
    }
}

/**
 * Load all the required JS files.
 */
function load_scripts() {
    loaded += 1;
    if (loaded == require.length) {
        // Finished loading, begin execution
        page = document.getElementById('page');
        document.body.onkeydown = on_key_down;
        async('GET', '/api/pad/' + PAD.id, update_pad);
        //var code_block = new PAD.TextBlock();
        //code_block.focus();
    } else {
        // Continue loading additional JS files
        var script = document.createElement('script');
        script.src = require[loaded];
        script.onload = load_scripts;
        document.getElementsByTagName('head')[0].appendChild(script);
    }
}


function button_clicked(button) {
    switch (button.id) {
    case 'btn_save':
        var json = generate_pad_json();
        async('PUT', '/api/pad/' + PAD.id, function(){}, json);
        break;
    case 'btn_code':
        var code_block = new PAD.CodeBlock(PAD.current_block.getIndex()+1);
        var text_block = new PAD.TextBlock(code_block.getIndex()+1);
        code_block.focus();
        break;
    }
}


function update_pad(json) {
    json = JSON.parse(json);
    for (var i=0; i<json['blocks'].length; i++) {
        var block = json['blocks'][i];
        PAD.block_types[block.type].from_json(block);
    }
    PAD.blocks[0].focus()
}


function generate_pad_json() {
    var data = {'name': PAD.name, 'id': PAD.id, 'blocks': []};
    var serial;
    for (var i=0; i<PAD.blocks.length; i++) {
        serial = PAD.blocks[i].serialize();
        if (serial != false) {
            data['blocks'].push(serial);
            serial = false;
        }
    }
    return JSON.stringify(data);
}


window.onload = load_scripts;