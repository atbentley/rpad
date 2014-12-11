OPERATORS = [
    [3, ['%/%']],
    [2, ['**', '%%', '<=', '=>', '==', '!=', '<-']],
    [1, ['+', '-', '*', '/', '^', '<', '>', '!', '|', '&']],
]

class RChunker:
    """Take some R code and split it into chunks that can be independently
    executed.

        >>> code = '''foo <- 1:10
        ... bar <- function(baz) {
        ...     baz * 2
        ... }'''
        >>> parser = RParser(code)
        >>> chunks = parser.parse()
        >>> print(chunks)
        ['foo <- 1:10\n', 'bar <- function(baz) {\n    baz * 2\n}']

    If the parser reaches the end and a chunk is incomplete (i.e. open
    parentheses, brace, bracket or a trailing operator) than None will be the
    last chunk in the chunk list.

        >>> code = '''foo <- 1
        ... function(bar) {
        ...     foo * bar'''
        >>> parser = RParser(code)
        >>> chunks = parser.parse()
        >>> print(chunks)
        ['foo <- 1\n', None]

    """
    def __init__(self, r_code):
        self.r_code = r_code
        self.pointer = 0

    def next_char(self, n=1):
        """Return the next n characters and move the pointer forward."""
        if n == 0:
            return ''
        else:
            char = self.r_code[self.pointer:self.pointer+n]
            self.pointer += n
            return char

    def peek_char(self, n=1):
        """Return the next n characters without moving the pointer forward."""
        if n == 0:
            return ''
        else:
            return self.r_code[self.pointer:self.pointer+n]

    def has_next(self, n=1):
        """Check to see if there are n remaing characters in the R code."""
        return self.pointer + (n - 1) < len(self.r_code)

    def chunk(self):
        """Split up code into chunks that can be independently executed."""
        self.pointer = 0
        parentheses_count = 0
        brace_count = 0
        bracket_count = 0
        in_quote = False
        operator = False
        chunks = []
        chunk = ''
        char = ''
        while self.has_next():
            char = self.next_char()
            chunk += char
            if in_quote:
                if char == "\\":
                    self.escaped = not self.escaped
                    operator = False
                if char == in_quote:
                    in_quote = False
                    operator = False
            else:
                if (char == "\n" and parentheses_count == 0
                        and brace_count == 0 and bracket_count == 0
                        and not in_quote and not operator):
                    chunks.append(chunk)
                    chunk = ''
                elif (char == "'" or char == "\""):
                    in_qoute = char
                    operator = False
                elif char == "(":
                    parentheses_count += 1
                    operator = False
                elif char == ")":
                    parentheses_count -= 1
                    operator = False
                elif char == "{":
                    brace_count += 1
                    operator = False
                elif char == "}":
                    brace_count -= 1
                    operator = False
                elif char == "[":
                    bracket_count += 1
                    operator = False
                elif char == "]":
                    bracket_count -= 1
                    operator = False
                else:
                    # Check for operators
                    for n, ops in OPERATORS:
                        n -= 1
                        if self.has_next(n) and char + self.peek_char(n) in ops:
                            operator = True
                            chunk += self.next_char(n)
                            break
                    else:
                        operator = False

        if (parentheses_count == 0 and brace_count == 0
                and bracket_count == 0 and not in_quote
                and not operator):
            chunks.append(chunk)
        else:
            # chunk had some open parenthesis, quotation marks or had a trailing
            # operator, i.e. it was incomplete
            chunks.append(None)

        return chunks
