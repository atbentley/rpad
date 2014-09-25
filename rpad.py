import json
import os
import socket
import subprocess
import urllib
import time
from HTMLParser import HTMLParser

import pyRserve
from flask import Flask, request, render_template, redirect

from r import R

html_parser = HTMLParser()


class rpad(Flask):
    def __init__(self):
        Flask.__init__(self, 'rpad')

        # Create R subprocess.
        # A single R instance will serve all pads using Rserve.
        self.r_proc = R()

        # Each pad will have their own pyRserve connection.
        # self.r_conn[pad_id] => pyRserve connection
        self.r_conn = {}

        # Routing and URL rules:
        self.add_url_rule('/', 'index', self.handle_index)
        self.add_url_rule('/about', 'about', self.handle_about)
        self.add_url_rule('/new_pad', 'new_pad', self.handle_new_pad)
        self.add_url_rule('/pad/<int:pad>', 'pad', self.handle_pad)
        self.add_url_rule('/r', 'r', self.handle_r_eval)

    def handle_index(self):
        return self.handle_about()

    def handle_about(self):
        return render_template('about.html')

    def handle_new_pad(self):
        return redirect('pad/0')

    def handle_pad(self, pad):
        # Check to see if this pad has a pyRserve connection
        if pad in self.r_conn:
            if self.r_conn[pad].isClosed():
                # Re-open connection if it was closed
                self.r_conn[pad].connect()
        else:
            self.r_conn[pad] = pyRserve.connect()
        return render_template('pad.html', pad_id=pad)

    def handle_r_eval(self):
        exprs = request.args.get('expr')
        exprs = html_parser.unescape(urllib.unquote(exprs))
        pad = int(request.args.get('pad'))
        exprs = exprs.decode('utf-8', 'ignore')
        result = self.r_conn[pad].eval(exprs)
        return json.dumps(str(result))


if __name__ == '__main__':
    app = rpad()
    app.run(debug=True, use_reloader=False)
