PAD.TextBlock = function(insert_index) {
    Block.call(this, insert_index);
}
PAD.TextBlock.prototype = Object.create(PAD.Block.prototype);
PAD.TextBlock.prototype.constructor = PAD.TextBlock;
PAD.TextBlock.document_block = false;
PAD.block_types.push(PAD.TextBlock);


PAD.TextBlock.prototype.create_dom = function() {
    this.dom = document.createElement('div');
    this.dom.setAttribute('class', 'block text');
    this.dom.setAttribute('contenteditable', true);
    this.dom.spellcheck = false;
}


PAD.TextBlock.prototype.focus = function() {
    PAD.Block.prototype.focus.bind(this)();
    this.dom.focus();
}


PAD.TextBlock.prototype.blur = function() {
    this.dom.blur();
}


PAD.TextBlock.prototype.on_key_down = function(e) {
    switch (e.which) {
    case PAD.RETURN_KEY:
        e.preventDefault();
        break;

    case PAD.UP_KEY:
        e.preventDefault();
        break;

    case PAD.DOWN_KEY:
        e.preventDefault();
        break;
    }
}
