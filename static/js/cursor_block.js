function CursorBlock(insert_index) {
    Block.call(this, insert_index);
}
CursorBlock.prototype = Object.create(Block.prototype);
CursorBlock.prototype.constructor = CursorBlock;


CursorBlock.prototype.create_dom = function() {
    this.dom = document.createElement('div');
    this.dom.setAttribute('class', 'block');
    this.dom.innerHTML = '<hr>';
    this.dom.style.visibility = 'hidden';
}


CursorBlock.prototype.focus = function() {
    Block.prototype.focus.bind(this)();
    this.dom.style.visibility = 'visible';
}


CursorBlock.prototype.blur = function() {
    this.dom.style.visibility = 'hidden';
}


CursorBlock.prototype.on_key_down = function(e) {
    switch (e.which) {
    case RETURN_KEY:
        // Insert a new block
        this.blur();
        console.log(this.getIndex());
        var block = new CodeBlock(this.getIndex());
        console.log(block.getIndex());
        var cursor = new CursorBlock(block.getIndex());
        console.log(cursor.getIndex());
        block.focus();
        e.preventDefault();
        break;

    case BACKSPACE_KEY:
        // Highlight the block above for deletion
        if (this.getIndex() != 0) {
            this.blur();
            state = STATE_DELETE;
            current_block = blocks[this.getIndex() - 1];
            current_block.dom.style.outline = '3px dashed #d88';
        }
        e.preventDefault();
        break;

    case UP_KEY:
        // Change focus to the block above
        if (this.getIndex() != 0) {
            this.blur();
            blocks[this.getIndex()-1].focus();
        }
        e.preventDefault();
        break;

    case DOWN_KEY:
        // Change focus to the block below
        if (this.getIndex() != blocks.length-1) {
            this.blur();
            blocks[this.getIndex()+1].focus();
        }
        e.preventDefault();
        break;
    }
}
