"""
Backend proxy server for SellerCloudX
This redirects to the main Express server running on port 5000
"""
import os
import subprocess
import sys

# Start the main server
if __name__ == "__main__":
    os.chdir("/app")
    subprocess.run(["yarn", "dev"])
