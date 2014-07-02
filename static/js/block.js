
/**
 *
 *
 *
 */
function Block(insert_index) {
    insert_index = (typeof insert_index === 'undefined') ? blocks.length : insert_index;
    this.create_dom();
    this.attach_dom(insert_index);
    blocks.splice(insert_index, 0, this);
}

/*
 * Remove the block's root DOM element and remove the block from
 * the block list.
 */
Block.prototype.remove = function() {
    page.removeChild(this.dom);
    blocks.splice(this.getIndex(), 1);
}

/*
 * Attach the root DOM element of the block to the page in the
 * position specified by 'insert_index'.
 */
Block.prototype.attach_dom = function(insert_index) {
    if (insert_index == blocks.length) {
        // Append to end of page
        page.appendChild(this.dom);
    } else {
        // Insert at insert_index
        page.insertBefore(this.dom, blocks[insert_index].dom);
    }
}

/**
 * Return the block's position in the page.
 */
Block.prototype.getIndex = function() {
    return blocks.indexOf(this);
}

/**
 * Create the DOM structure for the block. The root DOM element
 * should be of class 'block'.
 *
 * This methos should be overwritten.
 */
Block.prototype.create_dom = function() {
    this.dom = document.createElement('div');
    this.dom.setAttribute('class', 'block');
}

/**
 * Set focus to the current block.
 *
 * This method should be extended.
 */
Block.prototype.focus = function() {
    current_block = this;
}

/**
 * Remove focus from the current block.
 *
 * This method should be overwritten.
 */
Block.prototype.blur = function() {
    
}

/**
 * This method is called for each keydown event when the
 * block is active.
 *
 * This method should be overwritten.
 */
Block.prototype.handle_input = function(e) {

}
