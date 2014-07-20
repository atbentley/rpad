import re


def get(type_):
    return globals().get(type_.replace('.', '_'), default)

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


def data_frame(output):
    def get_columns(line):
        columns = []
        ws = True
        for i, c in enumerate(line):
            if c == ' ':
                ws = True
            elif ws is True:
                ws = False
                columns.append(i)
        print(columns)
        return columns

    lines = output.split("\n")
    columns = []
    for line in lines:
        if line == '':
            continue
        columns.append(get_columns(line))
    columns[0].insert(0, 0)
    return output
    output = []
    for line in lines:
        output.append(line.split("\t"))
    output[0].insert(0, '')
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
