/**
 * The base class for all blocks. This class shouldn't directly be
 * added to the page but rather other blocks should inherit this
 * class and then be added to the page.
 */
PAD.Block = function(insert_index) {
    insert_index = (typeof insert_index === 'undefined') ? PAD.blocks.length : insert_index;
    this.create_dom();
    this.attach_dom(insert_index);
    this.id = null;
    PAD.blocks.splice(insert_index, 0, this);
}
PAD.Block.block_name = "Block";
PAD.Block.document_block = false;
//PAD.block_types.push(PAD.Block);

/**
 * Construct a block from the supplied JSON.
 *
 * This method should be overwritten.
 */
PAD.Block.prototype.from_json = function(json) {
    return new PAD.Block();
}


/**
 * Remove the block's root DOM element and remove the block from
 * the block list.
 */
PAD.Block.prototype.remove = function() {
    page.removeChild(this.dom);
    PAD.blocks.splice(this.getIndex(), 1);
}

/**
 * Attach the root DOM element of the block to the page in the
 * position specified by 'insert_index'.
 */
PAD.Block.prototype.attach_dom = function(insert_index) {
    if (insert_index == PAD.blocks.length) {
        // Append to end of page
        page.appendChild(this.dom);
    } else {
        // Insert at insert_index
        page.insertBefore(this.dom, PAD.blocks[insert_index].dom);
    }
}


/**
 * Return a JSON representation of the block.
 * If the block is not to be serialized (e.g. the cursor block)
 * this function should return false.
 *
 * This method should be overwritten.
 */
 PAD.Block.prototype.serialize = function() {
    return false;
 }

/**
 * Return the block's position in the page.
 */
PAD.Block.prototype.getIndex = function() {
    return PAD.blocks.indexOf(this);
}

/**
 * Create the DOM structure for the block. The root DOM element
 * should be of class 'block'.
 *
 * This method should be overwritten.
 */
PAD.Block.prototype.create_dom = function() {
    this.dom = document.createElement('div');
    this.dom.setAttribute('class', 'block');
}

/**
 * Set focus to the current block.
 *
 * This method should be extended.
 */
PAD.Block.prototype.focus = function() {
    if (typeof PAD.current_block != 'undefined') {
        PAD.current_block.blur();
    }
    PAD.current_block = this;
}

/**
 * Remove focus from the current block.
 *
 * This method should be overwritten.
 */
PAD.Block.prototype.blur = function() {
    
}

/**
 * This method is called for each keydown event when the
 * block is active.
 *
 * This method should be overwritten.
 */
PAD.Block.prototype.handle_input = function(e) {

}
