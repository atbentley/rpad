import os
import subprocess


class R:
    NORMAL = 0
    MORE = 1
    ERROR = 2
    def __init__(self, r_home='', cwd=None):
        # -q to hide start up message
        # --ess to force the program into interactive mode
        cmd = [os.path.join(r_home, 'R'), "-q", "--ess"]
        self._proc = subprocess.Popen(
            cmd,
            cwd=cwd,
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE)

        # Remove prompt (> )
        self._proc.stdout.read(2)

    def __del__(self):
        self.terminate()

    def poll(self):
        return self._proc.poll()

    def terminate(self):
        if self.poll() is None:
            self._proc.stdin.write("q(save=\"no\")\n")
            self._proc.terminate()

    def write(self, expr):
        if not expr.endswith("\n"):
            expr += "\n"

        self._proc.stdin.write(expr)

        # Get result
        out = ''
        code = R.NORMAL
        while True:
            data = self._proc.stdout.read(2)
            if data == '> ':
                # Reached end of output
                break
            elif data == '+ ':
                # More input required
                pass
            out += data + self._proc.stdout.readline()
        return out
