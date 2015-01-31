import numpy
from . import _jinja_env


_html = """<table class='data'>
    <tr>
    {% for char in result %}
        <td>{{char}}</td>
    {% endfor %}
    </tr>
</table>"""
_template = _jinja_env.from_string(_html)


def format(result):
    if isinstance(result, numpy.ndarray):
        return _template.render(result=result)
    else:
        return result
