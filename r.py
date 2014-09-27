import os
import subprocess
import socket
import time


class R:
    def __init__(self):
        # Spawn R running Rserve in a subprocess.
        # We use Rserve.dbg so that R doesn't get put into
        # daemon mode, this allows us to kill the process
        # using terminate().
        # We also send the process's stdout to DEVNULL
        # since we are not interested in it.
        cmd = ['R' ,'CMD', 'Rserve.dbg']
        self.devnull = open(os.devnull, 'w')
        self._proc = subprocess.Popen(cmd, stdout=self.devnull)

        # wait for Rserve to start accepting connections
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        while sock.connect_ex(('127.0.0.1', 6311)) != 0:  # TODO - make this time out
            time.sleep(0.01)

    def __del__(self):
        self.terminate()

    def poll(self):
        return self._proc.poll()

    def terminate(self):
        if self.poll() is None:
            self._proc.terminate()
            # Make sure to close DEVNULL as its no longer needed.
            self.devnull.close()
