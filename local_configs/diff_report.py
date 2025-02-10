import os
import sys
from pathlib import Path
from datetime import datetime
import hashlib
import json

def get_file_list_with_hash(directory):
    file_dict = {}
    for path in Path(directory).rglob('*'):
        if path.is_file():
            relative_path = str(path.relative_to(directory))
            file_dict[relative_path] = hash_file(path)
    return file_dict

def hash_file(filepath):
    hasher = hashlib.md5()
    with open(filepath, 'rb') as f:
        buf = f.read(65536)  # Read in 64k chunks
        while len(buf) > 0:
            hasher.update(buf)
            buf = f.read(65536)
    return hasher.hexdigest()

def generate_diff_report(dir_a, dir_b, report_file):
    files_a = get_file_list_with_hash(dir_a)
    files_b = get_file_list_with_hash(dir_b)

    new_files = list(set(files_b.keys()) - set(files_a.keys()))
    deleted_files = list(set(files_a.keys()) - set(files_b.keys()))
    changed_files = list({file for file in set(files_a.keys()) & set(files_b.keys())
                     if files_a[file] != files_b[file]})

    report_data = {
        "timestamp": datetime.now().isoformat(),
        "dir_a": dir_a,
        "dir_b": dir_b,
        "new_files": new_files,
        "deleted_files": deleted_files,
        "changed_files": changed_files
    }

    with open(report_file, 'w') as report:
        json.dump(report_data, report, indent=2)

if __name__ == "__main__":
    if len(sys.argv) != 4:
        print("Usage: python diff_report.py <dir_a> <dir_b> <report_file>")
        sys.exit(1)

    dir_a, dir_b, report_file = sys.argv[1:]
    
    if not os.path.isdir(dir_a) or not os.path.isdir(dir_b):
        print("Error: Both arguments must be valid directories.")
        sys.exit(1)

    generate_diff_report(dir_a, dir_b, report_file)
    print(f"Diff report generated: {report_file}")
