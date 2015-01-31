from pyRserve import TaggedList

from . import formatter, _jinja_env


_html = """<table class='data'>
    <tr>
    {% for header in headers %}
        <th>{{header}}</th>
    {% endfor %}
    </tr>
{% for item in data[0] %}
    {% set outer_loop = loop %}
    <tr>
    {% for column in data %}
        <td>{{column[outer_loop.index-1]}}</td>
    {% endfor %}
    </tr>
{% endfor %}
</table>"""
_template = _jinja_env.from_string(_html)


@formatter('data.frame', 'list')
def format_dataframe(result):
    if isinstance(result, TaggedList):
        return _template.render(data=result, headers=result.keys)
