import os
import subprocess
import socket
import time

import pyRserve

from r_chunker import RChunker


class R:
    """Create and manage an R process in Rserve mode, as
    well as handle any pyRserve connections to it.
    """
    def __init__(self):
        # Spawn R running Rserve in a subprocess.
        # We use Rserve.dbg so that R doesn't get put into
        # daemon mode, this allows us to kill the process
        # using terminate().
        # Since we are using debug mode (quite verbose we
        # must also redirect stdout to devnull.
        cmd = ['R', 'CMD', 'Rserve.dbg']
        self.devnull = open(os.devnull, 'w')
        self._proc = subprocess.Popen(cmd, stdout=self.devnull)

        # wait for Rserve to start accepting connections
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        while sock.connect_ex(('127.0.0.1', 6311)) != 0:
            # TODO - make this time out
            time.sleep(0.01)

        # A dictionary to manage the pyRserve connections
        self.connections = {}

    def __del__(self):
        self.terminate()

    def poll(self):
        """Check if the R process is still running."""
        return self._proc.poll()

    def terminate(self):
        """Kill the R process."""
        if self.poll() is None:
            self._proc.terminate()
            # Make sure to close devnull as its no longer needed.
            self.devnull.close()

    def eval(self, expr, conn=0):
        if conn not in self.connections:
            # Create connection if it doesn't exist
            self.connections[conn] = pyRserve.connect()
        elif self.connections[conn].isClosed:
            # Re-open the connection if it is closed
            self.connections[conn].connect()

        results = []
        for chunk in RChunker(expr).chunk():
            result = self.connections[conn].eval(chunk)
            results.append(result)
            # Set the .Last.value variable since pyRserve or Rserve
            # doesn't do this for some reason.
            self.connections[conn].r.__setattr__('.Last.value', result)
        return results
