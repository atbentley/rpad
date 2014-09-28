from flask.ext.sqlalchemy import SQLAlchemy

db = SQLAlchemy()


class Pad(db.Model):
    """A digital pad, or document that contains text, images and R code

    :param str name: The name of the pad
    """
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(80))
    blocks = db.relationship('Block', backref='pad', lazy='dynamic')

    def __init__(self, name):
        self.name = name

class Block(db.Model):
    TEXT = 0
    CODE = 1
    IMAGE = 2

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    type = db.Column(db.Integer)
    position = db.Column(db.Integer)
    content = db.Column(db.Text)
    pad_id = db.Column(db.Integer, db.ForeignKey('pad.id'))
