import json
import os
import urllib
from HTMLParser import HTMLParser

from flask import Flask, request, render_template, redirect

import result_handlers
from r import R

CONFIG_FILE = os.path.join(os.path.expanduser('~'), '.rpad')
WORKSPACE_FILE = '.rpadworkspace'

html_parser = HTMLParser()


class RPad(Flask):
    def __init__(self):
        Flask.__init__(self, 'r_pad')

        self.rpad_config = {'r_path': '', 'workspace': ''}  # Default config
        self.workspace = {'pads': []}  # Default workspace
        self.load_config()
        self.load_workspace()
        self.r_procs = {}
        #self.r_procs[0] = R(R_PATH, os.path.join(self.workspace, 'pad01'))

        self.add_url_rule('/', 'index', self.handle_index)
        self.add_url_rule('/about', 'about', self.handle_about)
        self.add_url_rule('/settings', 'settings', self.handle_settings,
                          methods=['GET', 'POST'])
        self.add_url_rule('/new_pad', 'new_pad', self.handle_new_pad)
        self.add_url_rule('/pad/<pad>', 'pad', self.handle_pad)
        self.add_url_rule('/r', 'r', self.handle_r_eval)

    def load_config(self):
        if not os.path.isfile(CONFIG_FILE):
            # First time setup
            with open(CONFIG_FILE, 'w') as f:
                json.dump(self.rpad_config, f)
        else:
            # Load existing config file
            with open(CONFIG_FILE, 'r') as f:
                data = json.load(f)
                # Check config file is correct
                if (isinstance(data, dict) and
                        'r_path' in data.keys() and
                        'workspace' in data.keys()):
                    self.rpad_config = data
                else:
                    raise Exception("Bad config file: %s" % CONFIG_FILE)

    def save_config(self):
        with open(CONFIG_FILE, 'w') as f:
            f.write(json.dumps(self.rpad_config))

    def load_workspace(self):
        if not os.path.isdir(WORKSPACE_FILE):
            # Workspace directory does not exist
            return False

        path = os.path.join(self.rpad_config['workspace'], WORKSPACE_FILE)
        if not os.path.isfile(path):
            # First time
            with open(path, 'w') as f:
                json.dump(self.workspace, f)
            return True
        else:
            with open(path, 'r') as f:
                data = None
                try:
                    data = json.load(f)
                    if (isinstance(data, dict) and
                            'pads' in data.keys()):
                        # JSON correctly structured
                        self.workspace = data
                        return True
                    else:
                        # JSON not correctly structured
                        pass

                except ValueError:
                    # JSON corrupted
                    pass
        return False

    def close_workspace(self):
        pass

    def save_workspace(self):
        pass

    def new_r_proc(self, pad):
        cwd = os.path.join(self.rpad_config['workspace'],
                           self.workspace['pads'][pad]['name'])
        cwd = None
        self.r_procs[pad] = R(self.rpad_config['r_path'], cwd)

    def get_pad_names(self):
        names = [pad['name'] for pad in self.workspace['pads']]
        return names

    def get_notices(self):
        notices = {}
        notices['r_path'] = (
            self.rpad_config['r_path'] == '' or not
            os.path.isdir(self.rpad_config['r_path']))
        notices['workspace'] = (
            self.rpad_config['workspace'] == '' or not
            os.path.isdir(self.rpad_config['workspace']))
        return notices

    def handle_index(self):
        return self.handle_about()

    def handle_about(self):
        notices = self.get_notices()
        return render_template('about.html',
                               notices=notices,
                               pads=self.workspace['pads'])

    def handle_settings(self):
        if request.method == 'GET':
            return render_template('settings.html',
                                   pads=self.workspace['pads'],
                                   r_path=self.rpad_config['r_path'],
                                   workspace=self.rpad_config['workspace'])
        elif request.method == 'POST':
            self.rpad_config['r_path'] = request.args.get('r_path')
            self.rpad_config['workspace'] = request.args.get('workspace')
            self.save_config()
            return '1'

    def handle_new_pad(self):
        # Get default pad name
        name = None
        names = self.get_pad_names()
        base = 'untitled'
        if base not in names:
            name = base
        else:
            extra = 1
            while base + str(extra) in names:
                extra += 1
            name = base + str(extra)

        # Create pad
        pad = {
            'name': name,
            'date': None,
            'content': ''
        }
        self.workspace['pads'].append(pad)

        return redirect('pad/' + str(len(self.workspace['pads'])-1))

    def handle_pad(self, pad):
        try:
            pad = int(pad)
        except ValueError:
            # pad is not an integer
            pass

        # Check if there is a process running for this pad
        if pad not in self.r_procs.keys():
            self.new_r_proc(pad)

        return render_template('pad.html', pad_id=pad, pads=self.workspace['pads'])

    def handle_r_eval(self):
        exprs = request.args.get('expr')
        exprs = html_parser.unescape(urllib.unquote(exprs))
        pad = int(request.args.get('pad'))
        for c in exprs:
            print(c, ord(c))
        exprs = exprs.decode('utf-8', 'ignore')
        exprs = exprs.split("\n")
        results = []
        for expr in exprs:
            if expr == '':
                continue
            code, result = self.r_procs[pad].write(expr)
            if code == R.NORMAL and result != '':
                #self.r_procs[0].write('.last.value <- .Last.value')
                _, result_type = self.r_procs[0].write('class(.Last.value)')
                #self.r_procs[0].write('.Last.value <- .last.value')
                result_type = result_type[result_type.index(']')+2:]
                result_type = result_type.replace("\n", '').replace("\r", '').replace("\"", '')
                results.append(result_handlers.get(result_type)(result))
            elif code == R.MORE:
                pass

        return json.dumps(results)


if __name__ == '__main__':
    rpad = RPad()
    rpad.run(debug=True, use_reloader=False)
