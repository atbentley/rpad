from . import formatter, _jinja_env


_html = """<table class='data'>
{% for y in range(data.shape[1]) %}
    <tr>
    {% for x in range(data.shape[0]) %}
        <td>{{data[x,y]}}</td>
    {% endfor %}
    </tr>
{% endfor %}
</table>"""
_template = _jinja_env.from_string(_html)


@formatter('matrix')
def format_matrix(result):
    return _template.render(data=result)
