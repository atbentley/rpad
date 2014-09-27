from flask.ext.sqlalchemy import SQLAlchemy

db = SQLAlchemy()


class Pad(db.Model):
    """A digital pad, or document that contains text, images and R code

    :param str name: The name of the pad
    """
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(80))

    def __init__(self, name):
        self.name = name
