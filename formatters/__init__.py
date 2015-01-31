import os


from jinja2 import Environment
_jinja_env = Environment()

_formatters = {}


def reload_formatters():
    global _formatters, __file__
    black_list = ['__init__.py']
    files = filter(lambda f: f.endswith('.py') and f not in black_list,
                   os.listdir('formatters'))
    for filename in files:
        module = filename.split('/')[-1][:-3]
        if module in _formatters:
            reload('formatters.{}'.format(module))
        else:
            _formatters[module] = __import__('formatters.{}'.format(module),
                                             globals(), locals(),
                                             ['format'], -1)


def format(result, type_):
    global _formatters
    module = _formatters.get(type_)
    if module:
        return module.format(result)
    else:
        return str(result)

__all__ = ['get']
