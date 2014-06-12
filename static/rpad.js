V_CURSOR_LINE = 0;
V_CURSOR_SPACE = 1;
V_CURSOR_BLOCK = 3;
var v_cursors = [];
var line_blocks = [];
var next_in = 0;
var next_out = 0;
var current_line = 0;
var current_v_cursor = 0;
var v_cursor_state = V_CURSOR_LINE;

UP_KEY = 38;
DOWN_KEY = 40;
RETURN_KEY = 13;
BACKSPACE_KEY = 8;

r_eval = function(elem) {
    var req = new XMLHttpRequest();
    req.onreadystatechange = function() {
        if (req.readyState == 4) {
            if (req.status == 200 || window.location.href.indexOf('http') == -1) {
                var outs = req.responseText;
                outs = JSON.parse(outs);
                var line_block = elem.parentNode.parentNode;
                var line = line_blocks.indexOf(line_block);
                delete_out_lines(line);
                for (var i=0; i < outs.length; i++) {
                    var out = outs[i];
                    var out_line = new_out_line();
                    out_line.children[1].innerHTML = out;
                    line_block.appendChild(out_line);
                }

                if (line < line_blocks.length - 1) {
                    // Modified line in middle of doc
                    // Make v cursor below edited line focused
                    blur_line(current_line);
                    focus_v_cursor(current_line+1);
                } else {
                    // Modified line at bottom of doc
                    // Create new block at end of doc
                    var page = document.getElementById('page');
                    line_block = new_line_block(line_blocks.length);
                    v_cursor = new_v_cusor(v_cursors.length);
                    page.appendChild(line_block);
                    page.appendChild(v_cursor);
                    focus_line(current_line+1);
                }
            }
        }
    }
    req.open('GET', '/r?expr=' + encodeURIComponent(elem.innerText));
    req.send(null)
}

new_line_block = function(index) {
    var line_block = document.createElement('div');
    line_block.setAttribute('class', 'line-block');
    line_blocks.splice(index, 0, line_block);

    var in_line = document.createElement('div');
    in_line.setAttribute('class', 'line');

    var in_marker = document.createElement('div');
    in_marker.setAttribute('class', 'line-marker');
    in_marker.innerHTML = 'In ' + next_in;
    next_in += 1;

    var in_div = document.createElement('div');
    in_div.setAttribute('class', 'in');
    in_div.setAttribute('contenteditable', true);
    in_div.spellcheck = false;
    bind_in(in_div);

    in_line.appendChild(in_marker);
    in_line.appendChild(in_div);
    line_block.appendChild(in_line);

    return line_block;
}

new_out_line = function() {
    var out_line = document.createElement('div');
    out_line.setAttribute('class', 'line');

    var out_marker = document.createElement('div');
    out_marker.setAttribute('class', 'line-marker');
    out_marker.innerHTML = 'Out ' + next_out;
    next_out += 1;
    
    var out_div = document.createElement('div');
    out_div.setAttribute('class', 'out');

    out_line.appendChild(out_marker);
    out_line.appendChild(out_div);

    return out_line;
}

delete_out_lines = function(index) {
    var line_block = line_blocks[index];
    while (line_block.children.length != 1) {
        line_block.removeChild(line_block.children[1]);
    }
}

new_v_cusor = function(index) {
    v_cursor = document.createElement('div');
    v_cursor.setAttribute('class', 'v-cursor');
    v_cursor.style.visibility = 'hidden';
    v_cursors.splice(index, 0, v_cursor);
    return v_cursor;
}

focus_v_cursor = function(index) {
    v_cursor_state = V_CURSOR_SPACE;
    current_v_cursor = index;
    v_cursors[current_v_cursor].style.visibility = 'visible';
}

blur_v_cursor = function(index) {
    v_cursors[index].style.visibility = 'hidden';
}

focus_line = function(index) {
    v_cursor_state = V_CURSOR_LINE;
    current_line = index;
    line_blocks[current_line].children[0].children[1].focus();
}

blur_line = function(index) {
    line_blocks[current_line].children[0].children[1].blur();
}

focus_block = function(index) {
    v_cursor_state = V_CURSOR_BLOCK;
    current_line = index;
    line_blocks[index].style.outline = '3px dashed #d88';
    //line_blocks[index].style.background = '#fee';
}

blur_block = function(index) {
    line_blocks[index].style.outline = '';
    //line_blocks[index].style.background = '';
}

key_bindings = function(e) {
    switch(v_cursor_state) {
        case V_CURSOR_LINE:
            switch (e.which) {
                case RETURN_KEY:
                    if (e.shiftKey == true) {
                        // Evaluate the code in the current in div
                        r_eval(line_blocks[current_line].children[0].children[1]);
                        e.preventDefault();
                    } else {
                        // Insert a newline
                        var line = line_blocks[current_line].children[0].children[1];
                        var height = line.clientHeight;
                        document.execCommand('insertHTML', false, '\n');
                        if (height == line.clientHeight) {
                            // Sometimes we need to insert two newlines
                            document.execCommand('insertHTML', false, '\n');
                        }
                        e.preventDefault();
                    }
                    break;

                case UP_KEY:
                    var sel = window.getSelection();
                    var line = line_blocks[current_line].children[0].children[1];
                    if (sel.type == "Caret" && sel.baseOffset == 0) {
                        // Make the v cursor above the current line active
                        blur_line(current_line);
                        focus_v_cursor(current_line);
                        e.preventDefault();
                    }
                    break;

                case DOWN_KEY:
                    var sel = window.getSelection();
                    var line = line_blocks[current_line].children[0].children[1];
                    if (sel.type == "Caret" && (sel.baseOffset == line.innerText.length ||
                            (sel.baseOffset == line.innerText.length-1 && 
                            line.innerText[sel.baseOffset] == '\n'))) {
                        // Make the v cursor below the current line active
                        blur_line(current_line);
                        focus_v_cursor(current_line+1);
                        e.preventDefault();
                        break;
                    }
            }

            break;

        case V_CURSOR_SPACE:
            switch (e.which) {
                case RETURN_KEY:
                    // Insert new block
                    blur_v_cursor(current_v_cursor);
                    var line_block = new_line_block(current_v_cursor);
                    var old_v_cursor = v_cursors[current_v_cursor];
                    old_v_cursor.parentNode.insertBefore(line_block, old_v_cursor);
                    var v_cursor = new_v_cusor(current_v_cursor);
                    old_v_cursor.parentNode.insertBefore(v_cursor, line_block);
                    focus_line(current_v_cursor);
                    e.preventDefault();
                    break;

                case BACKSPACE_KEY:
                    // Highlight the block above the current v cursor
                    if (current_v_cursor != 0) {
                        blur_v_cursor(current_v_cursor);
                        focus_block(current_v_cursor-1);
                    }
                    e.preventDefault();
                    break;

                case UP_KEY:
                    // Make the line above the current v cursor active
                    if (current_v_cursor != 0) {
                        blur_v_cursor(current_v_cursor);
                        focus_line(current_v_cursor-1);

                        // Position the caret at the end of the last line
                        var line = line_blocks[current_line].children[0].children[1];
                        var sel = document.getSelection();
                        var range = document.createRange();
                        range.setStart(line.firstChild, line.innerText.length);
                        range.setEnd(line.firstChild, line.innerText.length);
                        sel.removeAllRanges();
                        sel.addRange(range);
                    }
                    e.preventDefault();
                    break;  

                case DOWN_KEY:
                    // Make the line below the current v cusor active
                    if (current_v_cursor != v_cursors.length-1) {
                        blur_v_cursor(current_v_cursor);
                        focus_line(current_v_cursor);
                    }
                    e.preventDefault();
                    break;  
            }
            break;

        case V_CURSOR_BLOCK:
            switch (e.which) {
                case RETURN_KEY:
                    e.preventDefault();
                    break;

                case BACKSPACE_KEY:
                    // Delete block
                    var line = line_blocks[current_line];
                    var v_cursor = v_cursors[current_line];
                    v_cursors.splice(current_line, 1);
                    line_blocks.splice(current_line, 1);
                    line.parentNode.removeChild(line);
                    v_cursor.parentNode.removeChild(v_cursor);
                    
                    focus_v_cursor(current_line);
                    e.preventDefault();
                    break;

                case UP_KEY:
                    // Make the v cursor above the current block active
                    blur_block(current_line);
                    focus_v_cursor(current_line);
                    e.preventDefault();
                    break;  

                case DOWN_KEY:
                    // Make the v cursor below the current block active
                    blur_block(current_line);
                    focus_v_cursor(current_line+1);
                    e.preventDefault();
                    break;  
            }
            break;
    }
}

bind_in = function(elem) {
    elem.onfocus = function(e) {
        if (v_cursor_state == V_CURSOR_SPACE) {
            v_cursors[current_v_cursor].style.visibility = 'hidden';
        }
        current_line = line_blocks.indexOf(elem.parentNode.parentNode);
        v_cursor_state = V_CURSOR_LINE;
    }
}

window.onload = function() {
    document.body.onkeydown = key_bindings;
    var page = document.getElementById('page');
    page.appendChild(new_v_cusor(0));
    page.appendChild(new_line_block(0));
    page.appendChild(new_v_cusor(1));
}