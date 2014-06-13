function Block(insert_index) {
    insert_index = (typeof insert_index === 'undefined') ? blocks.length : insert_index;
    this.create_dom();
    this.attach_dom(insert_index);
    blocks.splice(insert_index, 0, this);
}


Block.prototype.remove = function() {
    page.removeChild(this.dom);
    blocks.splice(this.getIndex(), 1);
}


Block.prototype.attach_dom = function(insert_index) {
    if (insert_index == blocks.length) {
        // Append to end of page
        page.appendChild(this.dom);
    } else {
        // Insert at insert_index
        page.insertBefore(this.dom, blocks[insert_index].dom);
    }
}


Block.prototype.ready_delete = function() {
    current_bl
    blocks[this.getIndex()].dom.style.outline = '3px dashed #d88';
}


Block.prototype.getIndex = function() {
    return blocks.indexOf(this);
}

/* Overwrite this */
Block.prototype.create_dom = function() {
    this.dom = document.createElement('div');
    this.dom.setAttribute('class', 'block');
}


/* Extend this */
Block.prototype.focus = function() {
    current_block = this;
}


/* Extend this */
Block.prototype.blur = function() {
    
}


/* Overwrite this */
Block.prototype.handle_input = function(e) {

}
