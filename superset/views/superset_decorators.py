import functools
from flask import (
    redirect, session
)

def check_target_url(f):
    def wraps(self, *args, **kwargs):
        if 'target_url' in session:
            if session['target_url'] != '':
                url = session['target_url']
                session.pop('target_url')
                return redirect(url)
        return f(self, *args, **kwargs)

    return functools.update_wrapper(wraps, f)
