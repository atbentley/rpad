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
        if (document.activeElement == document.body) {
            // Always capture and prevent backspace to avoid the
            // browser stepping back in it's history.
            e.preventDefault();
        }
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
 * Splits a text block at the caret. Used when inserting
 * a new block into the middle of a text block
 */
function split_text_block(text_block) {
    // getIndex() + 2 because a newly inserted block exists at
    // getIndex() + 1
    var new_text_block = new PAD.TextBlock(text_block.getIndex()+2);
    var caret = text_block.caret;  // position of caret
    var old_text = text_block.dom.innerText;
    var text_1 = old_text.slice(0, caret);
    var text_2 = old_text.slice(caret, old_text.length);

    if (text_1.length == 0) {
        text_block.remove();
    } else {
        text_block.dom.innerText = text_1;
    }
    new_text_block.dom.innerText = text_2;
    if (new_text_block.dom.innerText[0] == "\n") {
        // Remove spare line break
        new_text_block.dom.innerText = text_2.substr(1, text_2.length);
    }
}


/**
 * Create and insert a new block into the pad.
 * Pass additional arguments to the block's constructor by simply
 * passing them in after block type, that is:
 *   new_block(Pad.ImageBlock, 4, 'sunset.png')
 * is similar to:
 *   new PAD.ImageBlock(4, 'sunset.png')
 * However this function also takes care of splitting text blocks.
 */
function new_block(block_type) {
    // Extract args
    args = [];
    for (var i=1; i < arguments.length; i++) {
        args.push(arguments[i]);
    }

    // Create a helper function to use apply with a constructor.
    // Simply calling 'new block_type.apply(null, args)' will throw
    // an error.
    function Block() {
        return block_type.apply(this, args);
    }
    Block.prototype = block_type.prototype;
    var block = new Block();

    // If inserting the new block into the middle of a text block,
    // split that text block.
    if (PAD.current_block instanceof PAD.TextBlock) {
        split_text_block(PAD.current_block)
    }

    block.focus();
    return block;
}


/**
 * Handle all the button click events for the buttons in the toolbar.
 */
function button_clicked(button) {
    switch (button.id) {
    case 'btn_save':
        var json = generate_pad_json();
        async('PUT', '/api/pad/' + PAD.id, function(){}, json);
        break;
    case 'btn_code':
        new_block(PAD.CodeBlock, PAD.current_block.getIndex() + 1)
        break;
    case 'btn_image':
        // Create a 'virtual' form to initiate a file selector window
        // for uploading a new image.
        var form_data = new FormData();
        var file_selector = document.createElement('input');
        file_selector.setAttribute('type', 'file');
        file_selector.addEventListener('change', function() {
            file = file_selector.files[0];
            form_data.append('file', file, file.name);
            headers = {'ContentType': 'multipart/form-data'}
            async('POST', '/upload_image', function() {
                var image_block = new_block(PAD.ImageBlock,
                    PAD.current_block.getIndex()+1, file.name);
            }, form_data, headers);
        });
        file_selector.click();
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
    'text_block',
    'image_block'],
    function() {
        // Finished loading, begin execution
        page = document.getElementById('page');
        document.body.onkeydown = on_key_down;
        async('GET', '/api/pad/' + PAD.id, update_pad);
    });