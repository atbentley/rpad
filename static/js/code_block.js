var next_in = 0;
var next_out = 0;


function CodeBlock(insert_index) {
    Block.call(this, insert_index);
}
CodeBlock.prototype = Object.create(Block.prototype);
CodeBlock.prototype.constructor = CodeBlock;


CodeBlock.prototype.create_dom = function() {
    this.dom = document.createElement('div');
    this.dom.setAttribute('class', 'block');

    this.in_line = document.createElement('div');
    this.in_line.setAttribute('class', 'line');

    this.in_marker = document.createElement('div');
    this.in_marker.setAttribute('class', 'line-marker');
    this.in_marker.innerHTML = 'In ' + next_in;
    next_in += 1;

    this.in_div = document.createElement('div');
    this.in_div.setAttribute('class', 'in');
    this.in_div.setAttribute('contenteditable', true);
    this.in_div.spellcheck = false;
    this.in_div.onmousedown = this.on_in_div_click;

    this.in_line.appendChild(this.in_marker);
    this.in_line.appendChild(this.in_div);
    this.dom.appendChild(this.in_line);
}


CodeBlock.prototype.delete_out_lines = function() {
    while (this.dom.children.length != 1) {
        this.dom.removeChild(this.dom.children[1]);
    }
}


CodeBlock.prototype.add_out_line = function(html) {
    var out_line = document.createElement('div');
    out_line.setAttribute('class', 'line');

    var out_marker = document.createElement('div');
    out_marker.setAttribute('class', 'line-marker');
    out_marker.innerHTML = 'Out ' + next_out;
    next_out += 1;
    
    var out_div = document.createElement('div');
    out_div.setAttribute('class', 'out');
    out_div.innerHTML = html;

    out_line.appendChild(out_marker);
    out_line.appendChild(out_div);
    this.dom.appendChild(out_line);
}


CodeBlock.prototype.focus = function() {
    console.log(5);
    Block.prototype.focus.bind(this)();
    this.in_div.focus();
}


CodeBlock.prototype.blur = function() {
    this.in_div.blur();
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
            var url = '/r?expr=' + encodeURIComponent(this.in_div.innerText);
            async('GET', url, this.on_code_evaluated.bind(this));
            e.preventDefault();
        } else {
            // Insert newline
            var height = this.in_div.clientHeight;
            document.execCommand('insertHTML', false, '\n');
            if (height == this.in_div.clientHeight) {
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
        if (sel.type == "Caret" && (sel.baseOffset == this.in_div.innerText.length ||
                (sel.baseOffset == this.in_div.innerText.length-1 && 
                this.in_div.innerText[sel.baseOffset] == '\n'))) {
            // Make the v cursor below the current line active
            this.blur();
            blocks[this.getIndex()+1].focus();
            e.preventDefault();
            break;
        }
    }
}


CodeBlock.prototype.on_in_div_click = function(e) {

}