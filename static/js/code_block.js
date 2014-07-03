PAD.CodeBlock = function(insert_index) {
    PAD.Block.call(this, insert_index);
}
PAD.CodeBlock.prototype = Object.create(PAD.Block.prototype);
PAD.CodeBlock.prototype.constructor = PAD.CodeBlock;
PAD.CodeBlock.document_block = false;
PAD.block_types.push(PAD.CodeBlock);


PAD.CodeBlock.prototype.create_dom = function() {
    this.dom = document.createElement('div');
    this.dom.setAttribute('class', 'block');

    this.in_line = document.createElement('div');
    this.in_line.setAttribute('class', 'in');
    this.in_line.setAttribute('contenteditable', true);
    this.in_line.spellcheck = false;
    this.in_line.onmousedown = this.on_in_line_click;

    this.dom.appendChild(this.in_line);
}


PAD.CodeBlock.prototype.delete_out_lines = function() {
    while (this.dom.children.length != 1) {
        this.dom.removeChild(this.dom.children[1]);
    }
}


PAD.CodeBlock.prototype.add_out_line = function(html) {    
    var out_line = document.createElement('div');
    out_line.setAttribute('class', 'out');
    out_line.innerHTML = html;

    this.dom.appendChild(out_line);
}


PAD.CodeBlock.prototype.focus = function() {
    PAD.Block.prototype.focus.bind(this)();
    this.in_line.focus();
}


PAD.CodeBlock.prototype.blur = function() {
    this.in_line.blur();
}


PAD.CodeBlock.prototype.on_code_evaluated = function(result) {
    this.delete_out_lines();
    result = JSON.parse(result);
    for (var i = 0; i < result.length; i++) {
        this.add_out_line(result[i]);
    }
    
    if (PAD.current_block == this) {
        this.blur();
        PAD.blocks[this.getIndex()+1].focus();
    }
}


PAD.CodeBlock.prototype.on_key_down = function(e) {
    switch(e.which) {
    case PAD.RETURN_KEY:
        if (e.shiftKey == true) {
            // Evalutate code
            var url = '/r?pad=' + PAD.id + '&expr=' + encodeURIComponent(this.in_line.innerText);
            async('GET', url, this.on_code_evaluated.bind(this));
            e.preventDefault();
        } else {
            // Insert newline
            var height = this.in_line.clientHeight;
            document.execCommand('insertHTML', false, '\n');
            if (height == this.in_line.clientHeight) {
                // Sometimes we need to insert two newlines
                document.execCommand('insertHTML', false, '\n');
            }
            e.preventDefault();
        }
        break;

    case PAD.UP_KEY:
        var sel = window.getSelection();
        if (sel.type == "Caret" && sel.baseOffset == 0) {
            // Make the v cursor above the current line active
            this.blur();
            PAD.blocks[this.getIndex()-1].focus();
            e.preventDefault();
        }
        break;

    case PAD.DOWN_KEY:
        var sel = window.getSelection();
        if (sel.type == "Caret" && (sel.baseOffset == this.in_line.innerText.length ||
                (sel.baseOffset == this.in_line.innerText.length-1 && 
                this.in_line.innerText[sel.baseOffset] == '\n'))) {
            // Make the v cursor below the current line active
            this.blur();
            PAD.blocks[this.getIndex()+1].focus();
            e.preventDefault();
            break;
        }
    }
}


PAD.CodeBlock.prototype.on_in_line_click = function(e) {
    this.focus();
}