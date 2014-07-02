function TextBlock(insert_index) {
    Block.call(this, insert_index);
}
TextBlock.prototype = Object.create(Block.prototype);
TextBlock.prototype.constructor = TextBlock;


TextBlock.prototype.create_dom = function() {
    this.dom = document.createElement('div');
    this.dom.setAttribute('class', 'block text');
    this.dom.setAttribute('contenteditable', true);
    this.dom.spellcheck = false;
}


TextBlock.prototype.focus = function() {
    Block.prototype.focus.bind(this)();
    this.dom.focus();
}


TextBlock.prototype.blur = function() {
    this.dom.blur();
}


TextBlock.prototype.on_key_down = function(e) {
    switch (e.which) {
    case RETURN_KEY:
        e.preventDefault();
        break;

    case UP_KEY:
        e.preventDefault();
        break;

    case DOWN_KEY:
        e.preventDefault();
        break;
    }
}
