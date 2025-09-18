"""
Installation script for evaluation test dependencies
"""

import subprocess
import sys

def install_requirements():
    """Install required packages for evaluation tests"""
    
    requirements = [
        "requests",      # For API testing
        "aiohttp",       # For async performance testing
        "psutil",        # For system resource monitoring
        "statistics",    # Usually built-in, but ensure availability
    ]
    
    print("Installing evaluation test dependencies...")
    
    for package in requirements:
        try:
            print(f"Installing {package}...")
            subprocess.check_call([sys.executable, "-m", "pip", "install", package])
            print(f"✓ {package} installed successfully")
        except subprocess.CalledProcessError as e:
            print(f"✗ Failed to install {package}: {e}")
            return False
    
    print("\n✓ All evaluation test dependencies installed successfully!")
    print("\nYou can now run the evaluation suite:")
    print("  python run_evaluation_suite.py")
    
    return True

if __name__ == "__main__":
    install_requirements()