import os
import subprocess

# List of spider names
spiders = ['plutus', 'haskell', 'docs', 'lucid', 'mesh', 'aiken']

# Directory where scrapy.cfg is located
project_dir = os.path.dirname(os.path.abspath(__file__))

# Path to the virtual environment's Python interpreter
venv_python = '/app/venv/bin/python'

for spider in spiders:
    print(f"Running spider: {spider}")
    subprocess.run([venv_python, '-m', 'scrapy', 'crawl', spider], cwd=project_dir)
    print(f"Finished running spider: {spider}\n")

print("All spiders have completed.")
