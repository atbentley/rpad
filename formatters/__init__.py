import os

from jinja2 import Environment


_jinja_env = Environment()
_formatters = {}


class formatter:
    """A decorator to be used to register a function as a formatter."""
    def __init__(self, *aliases):
        self.aliases = aliases

    def __call__(self, func):
        for alias in self.aliases:
            _formatters[alias] = func
        return func


def format(result, type_):
    formatter = _formatters.get(type_)
    if formatter:
        return formatter(result)
    else:
        return str(result)


# Import all modules in this directory so that they can
# register them selves as formatters.
files = filter(lambda f: f.endswith('.py') and f != '__init__.py',
               os.listdir('formatters'))
for f in files:
    __import__(f[:-3], locals(), globals())
del files, f, Environment


__all__ = [format]
