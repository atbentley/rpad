PAD.TextBlock = function(insert_index) {
    PAD.Block.call(this, insert_index);
}
PAD.TextBlock.prototype = Object.create(PAD.Block.prototype);
PAD.TextBlock.prototype.constructor = PAD.TextBlock;
PAD.TextBlock.block_name = "Text";
PAD.TextBlock.document_block = false;
PAD.block_types['text'] = PAD.TextBlock;


PAD.TextBlock.from_json = function(json) {
    var text_block = new PAD.TextBlock(json['position']);
    text_block.id = json['id'];
    text_block.dom.innerHTML = json['content'];
    return text_block;
}


PAD.TextBlock.prototype.create_dom = function() {
    this.dom = document.createElement('div');
    this.dom.setAttribute('class', 'block text');
    this.dom.setAttribute('contenteditable', true);
    this.dom.onfocus = this.focus.bind(this);
}


PAD.TextBlock.prototype.serialize = function () {
    var data = {
        'id': this.id,
        'type': 'text',
        'content': this.dom.innerHTML,
        'position': this.getIndex()
    }
    return data;
}


PAD.TextBlock.prototype.focus = function() {
    if (PAD.current_block == this) {
        return;
    }
    var prev_index = 0;
    if (typeof PAD.current_block !== 'undefined') {
        prev_index = PAD.current_block.getIndex();
    }
    PAD.Block.prototype.focus.bind(this)();
    this.dom.focus();
    if (prev_index > this.getIndex()) {
        // Place caret at end of input
        this.dom.selectionStart = this.dom.innerText.length;
        this.dom.selectionEnd = this.dom.innerText.length;
    }
}


PAD.TextBlock.prototype.blur = function() {
    this.dom.blur();
}


PAD.TextBlock.prototype.on_key_down = function(e) {
    switch (e.which) {
    case PAD.RETURN_KEY:
        // Insert newline
        var height = this.dom.clientHeight;
        document.execCommand('insertHTML', false, '\n');
        if (height == this.dom.clientHeight) {
            // Sometimes we need to insert two newlines
            document.execCommand('insertHTML', false, '\n');
        }
        e.preventDefault();
        break;

    case PAD.UP_KEY:
        var sel = window.getSelection();
        if (sel.type == "Caret" && sel.baseOffset == 0) {
            // Make the above block active
            if (this.getIndex() != 0) {
                this.blur();
                PAD.blocks[this.getIndex()-1].focus();
            }
            e.preventDefault();
        }
        break;

    case PAD.DOWN_KEY:
        var sel = window.getSelection();
        if (sel.type == "Caret" && (sel.baseOffset == this.dom.innerText.length ||
                (sel.baseOffset == this.dom.innerText.length-1 && 
                this.dom.innerText[sel.baseOffset] == '\n'))) {
            // Make the v cursor below the current line active
            this.blur();
            PAD.blocks[this.getIndex()+1].focus();
            e.preventDefault();
            break;
        }
    }
}
