import json
import os
import urllib
from HTMLParser import HTMLParser

from flask import Flask, request, render_template

import result_handlers
from r import R

CONFIG = 'rpad.json'
R_PATH = "D:/crap/R/R-3.1.0/bin/i386/"
WORKSPACE = "D:\\r_pad_workspace"

html_parser = HTMLParser()


class RPad(Flask):
    def __init__(self):
        Flask.__init__(self, 'r_pad')

        self.pads = []
        self.r_procs = {}
        self.workspace = WORKSPACE
        '''
        if not os.path.isfile(os.path.join(self.workspace, CONFIG)):
            # First time setup for this workspace
            if not os.path.exists(self.workspace):
                os.mkdir(self.workspace)
            with open(os.path.join(self.workspace, CONFIG), 'w') as f:
                data = {'pads': []}
                json.dump(data, f)
        else:
            # Load existing config file
            with open(os.path.join(self.workspace, CONFIG), 'r') as f:
                data = json.load(f)
                for pad in data['pads']:
                    self.pads.append(pad)
                    self.r_proces[pad] = None
        '''

        self.r_procs[0] = R(R_PATH, os.path.join(self.workspace, 'pad01'))

        self.add_url_rule('/', 'index', self.handle_index)
        self.add_url_rule('/about', 'about', self.handle_about)
        self.add_url_rule('/pad/<pad>', 'pad', self.handle_pad)
        self.add_url_rule('/r', 'r', self.handle_r_eval)

    def new_pad(self, pad):
        pass

    def handle_index(self):
        return render_template('index.html')

    def handle_about(self):
        return render_template('about.html')

    def handle_pad(self, pad):
        return pad

    def handle_r_eval(self):
        exprs = html_parser.unescape(urllib.unquote(
            request.args.get('expr')).decode('utf8'))
        exprs = exprs.split("\n")
        results = []
        for expr in exprs:
            result = self.r_procs[0].write(expr)
            if result != '':
                result_type = self.r_procs[0].write('class(.Last.value)')
                result_type = result_type[result_type.index(']')+2:]
                result_type = result_type.replace("\n", '').replace("\r", '').replace("\"", '')
                results.append(result_handlers.get(result_type)(result))
        return json.dumps(results)


if __name__ == '__main__':
    rpad = RPad()
    rpad.run(debug=True, use_reloader=False)
