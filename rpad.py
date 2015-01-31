import json
import os
import urllib
from HTMLParser import HTMLParser

from flask import Flask, request, render_template, redirect, abort
from flask.ext.restless import APIManager

from models import db, Pad, Block, Image
from r import R
from formatters import format

html_parser = HTMLParser()


class rpad(Flask):
    IMAGE_STORE = 'static/imagestore'

    def __init__(self, db):
        Flask.__init__(self, 'rpad')

        self.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:////tmp/test.db'
        self.db = db
        self.api_manager = APIManager(self, flask_sqlalchemy_db=self.db)
        # Create R subprocess.
        # A single R instance will serve all pads using Rserve.
        self.r = R()

        # Routing and URL rules:
        self.add_url_rule('/', 'index', self.handle_index)
        self.add_url_rule('/about', 'about', self.handle_about)
        self.add_url_rule('/new_pad', 'new_pad', self.handle_new_pad)
        self.add_url_rule('/pad/<int:pad_id>', 'pad', self.handle_pad)
        self.add_url_rule('/r', 'r', self.handle_r_eval)
        self.add_url_rule('/upload_image', 'upload_image',
                          self.handle_upload_image, methods=['POST'])

        # API routing
        self.api_manager.create_api(Pad, include_columns=['id', 'name'],
                                    collection_name='pads', methods=['GET'])
        self.api_manager.create_api(Pad,
                                    methods=['GET', 'POST', 'DELETE', 'PUT'])
        self.api_manager.create_api(Block,
                                    methods=['GET, POST', 'DELETE', 'PUT'])

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

        return render_template('pad.html', current_pad=pad, pads=pads)

    def handle_r_eval(self):
        if 'expr' not in request.args:
            abort(400)

        expr = html_parser.unescape(urllib.unquote(
            request.args['expr'])).decode('utf-8', 'ignore')
        pad = int(request.args.get('pad'))
        results = self.r.eval(expr, pad)  # (result, type) pairs
        outputs = []
        for (result, type_) in results:
            print type_, result
            outputs.append(format(result, type_))
        return json.dumps(outputs)

    def handle_upload_image(self):
        file = request.files['file']
        pad_id = request.args.get('pad_id')
        if file:
            file.save(os.path.join(self.IMAGE_STORE, file.filename))
            image = Image(filename=file.filename, pad_id=pad_id)
            db.session.add(image)
            db.session.commit()
            return '1'
        else:
            return '0'


if __name__ == '__main__':
    app = rpad(db)
    db.init_app(app)
    db.create_all(app=app)
    app.run(debug=True, use_reloader=False)
