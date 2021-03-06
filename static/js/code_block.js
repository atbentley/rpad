PAD.CodeBlock = function(insert_index) {
    PAD.Block.call(this, insert_index);
    this.selected = false;  // selection => priming for deletion
}
PAD.CodeBlock.prototype = Object.create(PAD.Block.prototype);
PAD.CodeBlock.prototype.constructor = PAD.CodeBlock;
PAD.CodeBlock.block_name = "Code";
PAD.CodeBlock.document_block = false;
PAD.block_types['code'] = PAD.CodeBlock;


PAD.CodeBlock.from_json = function(json) {
    json['content'] = JSON.parse(json['content']);
    var code_block = new PAD.CodeBlock(json['position']);
    code_block.id = json['id'];
    code_block.in_line.innerHTML = json['content']['input'];
    for (var i=0; i<json['content']['output'].length; i++) {
        code_block.add_out_line(json['content']['output'][i]);
    }
    return code_block;
}


PAD.CodeBlock.prototype.create_dom = function() {
    this.dom = document.createElement('div');
    this.dom.setAttribute('class', 'block code');
    this.in_line = document.createElement('div');
    this.in_line.setAttribute('class', 'in');
    this.in_line.setAttribute('contenteditable', true);
    this.in_line.spellcheck = false;

    // Clicking anywhere on the code block other than the input line
    // should select the code block.
    this.dom.onclick = this.select.bind(this);
    this.in_line.onclick = function(event) {event.cancelBubble=true;};

    this.in_line.onfocus = this.focus.bind(this);
    this.in_line.oninput = this.oninput.bind(this);
    this.dom.appendChild(this.in_line);
}


PAD.CodeBlock.prototype.serialize = function () {
    var data = {
        'id': this.id,
        'type': 'code',
        'content': {
            'input': this.in_line.innerHTML,
            'output': []},
        'position': this.getIndex()
    };
    for (var i = 0; i<this.dom.children.length-1; i++) {
        data['content']['output'].push(this.dom.children[i+1].innerHTML);
    }
    data['content'] = JSON.stringify(data['content']);
    return data;
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
    if (PAD.current_block == this) {
        // Call came in from on_focus event while block was already
        // focused.
        return;
    }

    // Grab index of previously focused block
    var prev_index = 0;
    if (typeof PAD.current_block !== 'undefined') {
        prev_index = PAD.current_block.getIndex();
    }

    PAD.Block.prototype.focus.bind(this)(); // Super
    if (!this.selected) {
        this.in_line.focus();
    }

    if (prev_index > this.getIndex()) {
        // If coming from a block below this one, place the caret at the end
        // of the input.
        var range = document.createRange();
        var sel = window.getSelection();
        range.setStart(this.in_line, 1);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
    }
}


PAD.CodeBlock.prototype.select = function() {
    this.selected = true;
    this.dom.style.outline = '1px solid black'
    this.focus();
}


PAD.CodeBlock.prototype.oninput = function() {
    this.dom.className = "block code dirty";
}


PAD.CodeBlock.prototype.blur = function() {
    if (PAD.current_block === this) {
        this.in_line.blur();
        this.selected = false;
        this.dom.style.outline = '';
    }
}


PAD.CodeBlock.prototype.on_code_evaluated = function(result) {
    this.dom.className = "block code";  // Remove dirty class
    this.delete_out_lines();
    result = JSON.parse(result);
    for (var i = 0; i < result.length; i++) {
        this.add_out_line(result[i]);
    }
    
    if (PAD.current_block == this) {
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
        var sel = window.getSelection();
        if (this.selected) {
            // Make the block above active
            PAD.blocks[this.getIndex()-1].focus();
            e.preventDefault();
        } else if (sel.type == "Caret" &&
                this.getIndex() != 0 &&
                sel.baseOffset == 0) {
            // Make the block above active
            PAD.blocks[this.getIndex()-1].focus();
            e.preventDefault();
        }
        break;

    case PAD.DOWN_KEY:
        var sel = window.getSelection();
        if (this.selected) {
            // Make the block below active
            PAD.blocks[this.getIndex()+1].focus();
            e.preventDefault();
        } else if (sel.type == "Caret" && 
                this.getIndex() != PAD.blocks.length-1 &&
                (sel.baseOffset == this.in_line.innerText.length ||
                (sel.baseOffset == this.in_line.innerText.length-1 && 
                this.in_line.innerText[sel.baseOffset] == '\n'))) {
            // Make the block below active
            PAD.blocks[this.getIndex()+1].focus();
            e.preventDefault();
        }
        break;
    }
}
