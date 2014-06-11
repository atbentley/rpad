import re


def get(type_):
    return globals().get(type_, default)

re_row = re.compile('\s*\[(\d+)\]')
def array_like(output):
    lines = output.split("\n")
    output = []
    for line in lines:
        if line == '':
            continue
        line = re_row.sub('', line)
        output.extend(line.split())
    if len(output) == 1:
        return output[0]
    else:
        html = "<table class='data'><tr>"
        for date in output:
            html += "<td>%s</td>" % date
        html += "</tr></table>"
        return html
numeric = array_like
integer = array_like
character = array_like
logical = array_like

re_matrix_header = re.compile('(\s*\[,\d+\]\s*)+')
re_matrix_row = re.compile('\s*\[(\d+),\]')
def matrix(output):
    lines = output.split("\n")
    output = []
    for line in lines:
        if re_matrix_header.match(line) or line == '':
            # matrix header
            continue
        row = int(re_matrix_row.match(line).group(1))-1
        if row >= len(output):
            output.append([])
        output[row].extend(re_matrix_row.sub('', line).split())

    html = "<table class='data'>"
    for row in output:
        html += "<tr>"
        for data in row:
            html += "<td>%s</td>" % data
        html += "</tr>"
    html += "</table>"
    return html


def default(output):
    return output
