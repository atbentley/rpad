function CodeBlock(insert_index) {
    Block.call(this, insert_index);
}
CodeBlock.prototype = Object.create(Block.prototype);
CodeBlock.prototype.constructor = CodeBlock;


CodeBlock.prototype.create_dom = function() {
    this.dom = document.createElement('div');
    this.dom.setAttribute('class', 'block');

    this.in_line = document.createElement('div');
    this.in_line.setAttribute('class', 'in');
    this.in_line.setAttribute('contenteditable', true);
    this.in_line.spellcheck = false;
    this.in_line.onmousedown = this.on_in_line_click;

    this.dom.appendChild(this.in_line);
}


CodeBlock.prototype.delete_out_lines = function() {
    while (this.dom.children.length != 1) {
        this.dom.removeChild(this.dom.children[1]);
    }
}


CodeBlock.prototype.add_out_line = function(html) {    
    var out_line = document.createElement('div');
    out_line.setAttribute('class', 'out');
    out_line.innerHTML = html;

    this.dom.appendChild(out_line);
}


CodeBlock.prototype.focus = function() {
    Block.prototype.focus.bind(this)();
    this.in_line.focus();
}


CodeBlock.prototype.blur = function() {
    this.in_line.blur();
}


CodeBlock.prototype.on_code_evaluated = function(result) {
    this.delete_out_lines();
    result = JSON.parse(result);
    for (var i = 0; i < result.length; i++) {
        this.add_out_line(result[i]);
    }
    
    if (current_block == this) {
        this.blur();
        blocks[this.getIndex()+1].focus();
    }
}


CodeBlock.prototype.on_key_down = function(e) {
    switch(e.which) {
    case RETURN_KEY:
        if (e.shiftKey == true) {
            // Evalutate code
            var url = '/r?pad=' + pad_id + '&expr=' + encodeURIComponent(this.in_line.innerText);
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

    case UP_KEY:
        var sel = window.getSelection();
        if (sel.type == "Caret" && sel.baseOffset == 0) {
            // Make the v cursor above the current line active
            this.blur();
            blocks[this.getIndex()-1].focus();
            e.preventDefault();
        }
        break;

    case DOWN_KEY:
        var sel = window.getSelection();
        if (sel.type == "Caret" && (sel.baseOffset == this.in_line.innerText.length ||
                (sel.baseOffset == this.in_line.innerText.length-1 && 
                this.in_line.innerText[sel.baseOffset] == '\n'))) {
            // Make the v cursor below the current line active
            this.blur();
            blocks[this.getIndex()+1].focus();
            e.preventDefault();
            break;
        }
    }
}


CodeBlock.prototype.on_in_line_click = function(e) {

}