from . import formatter, _jinja_env


_html = """<div class='r-error'>{{result}}</div>"""
_template = _jinja_env.from_string(_html)


@formatter('__error__')
def format_error(result):
    return _template.render(result=result)
