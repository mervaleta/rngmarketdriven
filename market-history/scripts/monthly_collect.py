#!/usr/bin/env python3
"""Absolute-path scheduler entrypoint for the isolated monthly collector."""
import runpy
from pathlib import Path

runpy.run_path(str(Path(__file__).resolve().parents[1] / 'src' / 'collector.py'), run_name='__main__')
