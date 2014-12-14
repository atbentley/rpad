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

function button_clicked(button) {
    switch (button.id) {
    case 'btn_save':
        var json = generate_pad_json();
        async('PUT', '/api/pad/' + PAD.id, function(){}, json);
        break;
    case 'btn_code':
        var code_block = new PAD.CodeBlock(PAD.current_block.getIndex()+1);

        if (PAD.current_block instanceof PAD.TextBlock) {
            // Split the text block at the caret
            var caret = PAD.current_block.caret;  // position of caret
            var old_text = PAD.current_block.dom.innerText;
            var text_1 = old_text.slice(0, caret);
            var text_2 = old_text.slice(caret, old_text.length);

            if (text_1.length == 0) {
                // 
                PAD.current_block.remove();
            } else {
                PAD.current_block.dom.innerText = text_1;
            }
            var text_block = new PAD.TextBlock(code_block.getIndex()+1);
            text_block.dom.innerText = text_2;
            if (text_block.dom.innerText[0] == "\n") {
                // 
                text_block.dom.innerText = text_2.substr(1, text_2.length);
            }
        }
        code_block.focus();
        break;
    case 'trash':
        async('DELETE', '/api/pad/'+button.dataset['id'], function(){});
        break;
    }
}


function update_pad(json) {
    json = JSON.parse(json);
    PAD.id = json['id'];
    PAD.name = json['name'];
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

/**
 * Load all the required JS files.
 */
 requirejs([
    'async',
    'block',
    'code_block',
    'cursor_block',
    'text_block'],
    function() {
        // Finished loading, begin execution
        page = document.getElementById('page');
        document.body.onkeydown = on_key_down;
        async('GET', '/api/pad/' + PAD.id, update_pad);
    });