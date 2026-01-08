"""
SellerCloudX Backend Server
This is a bridge server that starts the main Express+Vite application
"""
import os
import sys
import subprocess
import time

def main():
    # Change to main app directory
    os.chdir("/app")
    
    # Set environment variables
    os.environ.setdefault("NODE_ENV", "production")
    os.environ.setdefault("PORT", "8001")
    
    print("🚀 Starting SellerCloudX Server...")
    print(f"   Working directory: {os.getcwd()}")
    print(f"   NODE_ENV: {os.environ.get('NODE_ENV')}")
    print(f"   PORT: {os.environ.get('PORT')}")
    
    # Build the frontend first if not exists
    dist_path = "/app/dist/public"
    if not os.path.exists(dist_path):
        print("📦 Building frontend...")
        try:
            subprocess.run(["yarn", "build"], check=True, cwd="/app")
        except subprocess.CalledProcessError as e:
            print(f"⚠️ Build failed: {e}, trying to start dev server...")
    
    # Start the server
    print("🚀 Starting server...")
    try:
        # Use tsx for TypeScript execution
        subprocess.run(
            ["npx", "tsx", "server/index.ts"],
            cwd="/app",
            env=os.environ.copy()
        )
    except KeyboardInterrupt:
        print("\n👋 Server stopped")
    except Exception as e:
        print(f"❌ Server error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
