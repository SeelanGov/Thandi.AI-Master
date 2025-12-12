#!/usr/bin/env python3

import os
import sys
import time
from pathlib import Path
from collections import defaultdict, Counter

class FileCounter:
    def __init__(self):
        self.total_files = 0
        self.total_folders = 0
        self.total_size = 0
        self.extensions = Counter()
        self.errors = []
        
    def count_files(self, folder_path, show_progress=True):
        """Count files recursively using os.walk for memory efficiency"""
        print(f"Scanning folder: {folder_path}")
        print("Press Ctrl+C to stop\n")
        
        start_time = time.time()
        
        try:
            for root, dirs, files in os.walk(folder_path, followlinks=False):
                # Count folders
                self.total_folders += len(dirs)
                
                # Process files
                for file_name in files:
                    self.total_files += 1
                    file_path = os.path.join(root, file_name)
                    
                    try:
                        # Get file size
                        file_size = os.path.getsize(file_path)
                        self.total_size += file_size
                        
                        # Track extensions
                        ext = Path(file_name).suffix.lower() or 'no_extension'
                        self.extensions[ext] += 1
                        
                    except (OSError, PermissionError) as e:
                        self.errors.append(f"Cannot access {file_path}: {str(e)}")
                    
                    # Show progress
                    if show_progress and self.total_files % 1000 == 0:
                        elapsed = time.time() - start_time
                        rate = self.total_files / elapsed if elapsed > 0 else 0
                        print(f"\rScanned {self.total_files:,} files, {self.total_folders:,} folders "
                              f"({rate:.0f} files/sec)", end='', flush=True)
                
        except KeyboardInterrupt:
            print("\n\nScan interrupted by user")
            return None
        except Exception as e:
            print(f"\nError during scan: {e}")
            return None
            
        return self.get_results()
    
    def get_results(self):
        return {
            'total_files': self.total_files,
            'total_folders': self.total_folders,
            'total_size': self.total_size,
            'total_size_gb': self.total_size / (1024**3),
            'extensions': self.extensions,
            'errors': self.errors
        }
    
    def print_results(self, results):
        print('\n' + '='*50)
        print('SCAN RESULTS')
        print('='*50)
        print(f"Total files: {results['total_files']:,}")
        print(f"Total folders: {results['total_folders']:,}")
        print(f"Total size: {results['total_size']/(1024**2):.2f} MB ({results['total_size_gb']:.2f} GB)")
        
        if results['extensions']:
            print('\nTop 10 file extensions:')
            print('-'*30)
            
            for ext, count in results['extensions'].most_common(10):
                percentage = (count / results['total_files']) * 100
                print(f"{ext:<15} {count:>8,} ({percentage:.1f}%)")
        
        if results['errors']:
            print(f"\nErrors encountered: {len(results['errors'])}")
            if len(results['errors']) <= 5:
                for error in results['errors']:
                    print(f"  - {error}")
            else:
                for error in results['errors'][:3]:
                    print(f"  - {error}")
                print(f"  ... and {len(results['errors']) - 3} more errors")

def main():
    if len(sys.argv) < 2:
        print("Usage: python count_files.py <folder-path> [--no-progress]")
        print("Example: python count_files.py ./my-large-folder")
        sys.exit(1)
    
    folder_path = sys.argv[1]
    show_progress = '--no-progress' not in sys.argv
    
    # Check if folder exists
    if not os.path.isdir(folder_path):
        print(f"Error: {folder_path} is not a valid directory")
        sys.exit(1)
    
    counter = FileCounter()
    start_time = time.time()
    
    results = counter.count_files(folder_path, show_progress)
    
    if results:
        end_time = time.time()
        duration = end_time - start_time
        
        counter.print_results(results)
        print(f"\nScan completed in {duration:.2f} seconds")

if __name__ == "__main__":
    main()