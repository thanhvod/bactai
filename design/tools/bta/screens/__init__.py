"""Screen modules. Each module calls core.register(...) at import time.

Set BTA_ONLY=mod1,mod2 to import only some modules (faster iteration; use with --allow-missing).
"""
import importlib
import os
import pkgutil


def load_all():
    only = [m for m in os.environ.get("BTA_ONLY", "").split(",") if m]
    for m in sorted(pkgutil.iter_modules(__path__), key=lambda m: m.name):
        if only and m.name not in only:
            continue
        importlib.import_module(f"{__name__}.{m.name}")
