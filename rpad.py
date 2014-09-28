import json
import urllib
from HTMLParser import HTMLParser

import pyRserve
from flask import Flask, request, render_template, redirect, abort
from flask.ext.restless import APIManager

from models import db, Pad, Block
from r import R

html_parser = HTMLParser()


class rpad(Flask):
    def __init__(self, db):
        Flask.__init__(self, 'rpad')

        self.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:////tmp/test.db'
        self.db = db
        self.api_manager = APIManager(self, flask_sqlalchemy_db=self.db)
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
        self.add_url_rule('/pad/<int:pad_id>', 'pad', self.handle_pad)
        self.add_url_rule('/r', 'r', self.handle_r_eval)

        # API routing
        self.api_manager.create_api(Pad, include_columns=['id', 'name'], 
                                    collection_name='pads', methods=['GET_MANY'])
        self.api_manager.create_api(Pad, methods=['GET', 'POST, DELETE', 'PUT'])
        self.api_manager.create_api(Block, methods=['GET, POST', 'PUT', 'DELETE'])

    def handle_index(self):
        return self.handle_about()

    def handle_about(self):
        pads = Pad.query.all()
        return render_template('about.html', pads=pads)

    def handle_new_pad(self):
        pad = Pad(name='Untitled Pad')
        block = Block(type='text', position=0, content='')
        pad.blocks.append(block)
        db.session.add(pad)
        db.session.add(block)
        db.session.commit()
        return redirect('pad/%i' % (pad.id))

    def handle_pad(self, pad_id):
        pad = Pad.query.get(pad_id)
        if pad is None:
            abort(404)
        pads = Pad.query.all()

        # Check to see if this pad has a pyRserve connection
        if pad_id in self.r_conn:
            if self.r_conn[pad_id].isClosed:
                # Re-open connection if it was closed
                self.r_conn[pad_id].connect()
        else:
            self.r_conn[pad_id] = pyRserve.connect()

        return render_template('pad.html', current_pad=pad, pads=pads)

    def handle_r_eval(self):
        exprs = request.args.get('expr')
        exprs = html_parser.unescape(urllib.unquote(exprs))
        pad = int(request.args.get('pad'))
        exprs = exprs.decode('utf-8', 'ignore')
        result = self.r_conn[pad].eval(exprs)
        return json.dumps([str(result)])


app = rpad(db)
db.init_app(app)


if __name__ == '__main__':
    app.run(debug=True, use_reloader=False)
