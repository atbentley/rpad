import numpy
from . import formatter, _jinja_env


_html = """<table class='data'>
    <tr>
    {% for num in result %}
        <td>{{num}}</td>
    {% endfor %}
    </tr>
</table>"""
_template = _jinja_env.from_string(_html)


@formatter('numeric', 'integer')
def format_numeric(result):
    if isinstance(result, numpy.ndarray):
        return _template.render(result=result)
    else:
        return result
