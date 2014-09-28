rpad
====

A browser based document editor with built-in R code embedding and execution.

Usage
=====

1. Initialise database:
```python
>>> from rpad import app, db
>>> db.create_all(app=app)
```
2. Run the webserver `python rpad.py`
3. Point your browser to 127.0.0.1:5000

Requirements
============

1. Python 2.7
2. Flask
3. Flask-SQLAlchemy
4. Flask-restless
5. pyRserve
6. R
7. Rserve
