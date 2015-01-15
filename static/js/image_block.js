/*
 * An Image Block is used for inserting images into
 * the pad.
 */
PAD.ImageBlock = function(insert_index, image_src) {
    this.image_src = image_src
    PAD.Block.call(this, insert_index);
    this.selected = false;  // selection => priming for deletion
}
PAD.ImageBlock.prototype = Object.create(PAD.Block.prototype);
PAD.ImageBlock.prototype.constructor = PAD.ImageBlock;
PAD.ImageBlock.block_name = "Image";
PAD.ImageBlock.document_block = false;
PAD.block_types['image'] = PAD.ImageBlock;

/**
 * Create a new image block from JSON.
 *
* Image blocks have the following JSON schema:
 * {
 *   'id': block_id,
 *   'type': 'image',
 *   'content': {'src': image_src},
 *   'position': block_index
 * }
 */
PAD.ImageBlock.from_json = function(json) {
    json['content'] = JSON.parse(json['content']);
    var id = json['id'];
    var position = json['position'];
    var src = json['content']['src'];

    var image_block = new PAD.ImageBlock(position, src);
    image_block.id = id;
    return image_block;
}

/**
 * Construct and return the image block's DOM.
 *
 * Image block's have the following DOM:
 * <div class='block image'>
 *   <img src=image_src></img>
 * </div>
 */
PAD.ImageBlock.prototype.create_dom = function() {
    this.dom = document.createElement('div');
    this.dom.setAttribute('class', 'block image');
    this.dom.onclick = this.select.bind(this);

    var img = document.createElement('img');
    img.setAttribute('src', '/static/imagestore/' + this.image_src);

    this.dom.appendChild(img);
    // TODO
}

/**
 * Create and return a JSON representation of the image block.
 *
 * Image blocks have the following JSON schema:
 * {
 *   'id': block_id,
 *   'type': 'image',
 *   'content': {'src': image_src},
 *   'position': block_index
 * }
 */
PAD.ImageBlock.prototype.serialize = function () {
    var data = {
        'id': this.id,
        'type': 'image',
        'content': JSON.stringify({'src': this.image_src}),
        'position': this.getIndex()
    };
    return data;
}


PAD.ImageBlock.prototype.select = function() {
    this.selected = true;
    this.dom.style.outline = '1px solid black'
    this.focus();
}


PAD.ImageBlock.prototype.focus = function() {
    if (PAD.current_block == this) {
        // Call came in from on_focus event while block was already
        // focused.
        return;
    }

    PAD.Block.prototype.focus.bind(this)(); // super
}


PAD.ImageBlock.prototype.blur = function() {
    if (PAD.current_block === this) {
        this.selected = false;
        this.dom.style.outline = '';
    }
}


PAD.ImageBlock.prototype.on_key_down = function(e) {
    switch(e.which) {
    case PAD.BACKSPACE_KEY:
        if (this.selected) {
            // Delete this block
            var index = this.getIndex();
            PAD.blocks[index+1].focus();  // Make below block active
            this.remove();
            // Need to check if deleting this block caused two text blocks to
            // be one after the other, and merge them if so.
            if (PAD.blocks[index-1] instanceof PAD.TextBlock &&
                    PAD.blocks[index] instanceof PAD.TextBlock) {
                // Add second text block's text to first one
                PAD.blocks[index-1].dom.innerText += "\n" + 
                        PAD.blocks[index].dom.innerText;
                // Remove second text block
                PAD.blocks[index].remove();
            }
            e.preventDefault();
        }
        break;

    case PAD.UP_KEY:
        if (this.getIndex() != 0) {
            PAD.blocks[this.getIndex()-1].focus();
        }
        e.preventDefault();
        break;

    case PAD.DOWN_KEY:
        PAD.blocks[this.getIndex()+1].focus();
        e.preventDefault();
        break;

    default:
        return false;
    }
    return true;
}
