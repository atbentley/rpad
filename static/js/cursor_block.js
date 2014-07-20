PAD.CursorBlock = function(insert_index) {
    PAD.Block.call(this, insert_index);
}
PAD.CursorBlock.prototype = Object.create(PAD.Block.prototype);
PAD.CursorBlock.prototype.constructor = PAD.CursorBlock;
PAD.CursorBlock.block_name = "Cursor";
PAD.CursorBlock.document_block = false;
//PAD.block_types.push(PAD.CursorBlock);


PAD.CursorBlock.prototype.create_dom = function() {
    this.dom = document.createElement('div');
    this.dom.setAttribute('class', 'block');
    this.dom.innerHTML = '<hr>';
    this.dom.style.visibility = 'hidden';
}


PAD.CursorBlock.prototype.focus = function() {
    PAD.Block.prototype.focus.bind(this)();
    this.dom.style.visibility = 'visible';
}


PAD.CursorBlock.prototype.blur = function() {
    this.dom.style.visibility = 'hidden';
}


PAD.CursorBlock.prototype.on_key_down = function(e) {
    switch (e.which) {
    case PAD.RETURN_KEY:
        // Insert a new block
        this.blur();
        var block = new PAD.ChoiceBlock(this.getIndex());
        var cursor = new PAD.CursorBlock(block.getIndex());
        block.focus();
        e.preventDefault();
        break;

    case PAD.BACKSPACE_KEY:
        // Highlight the block above for deletion
        if (this.getIndex() != 0) {
            this.blur();
            PAD.state = PAD.STATE_DELETE;
            PAD.current_block = PAD.blocks[this.getIndex() - 1];
            PAD.current_block.dom.style.outline = '3px dashed #d88';
        }
        e.preventDefault();
        break;

    case PAD.UP_KEY:
        // Change focus to the block above
        if (this.getIndex() != 0) {
            this.blur();
            PAD.blocks[this.getIndex()-1].focus();
        }
        e.preventDefault();
        break;

    case PAD.DOWN_KEY:
        // Change focus to the block below
        if (this.getIndex() != PAD.blocks.length-1) {
            this.blur();
            PAD.blocks[this.getIndex()+1].focus();
        }
        e.preventDefault();
        break;
    }
}
