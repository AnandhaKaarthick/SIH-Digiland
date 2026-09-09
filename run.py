import subprocess
import sys
import time
import webbrowser
import os

def start_services():
    print("=" * 60)
    print("        DigiLand Platform - 1-Click Python Launcher")
    print("=" * 60)
    print()

    root_dir = os.path.dirname(os.path.abspath(__file__))

    print("[1/2] Launching FastAPI Backend Server (http://localhost:8000)...")
    backend_process = subprocess.Popen(
        [sys.executable, "-m", "uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"],
        cwd=root_dir
    )

    print("[2/2] Launching React / Vite Frontend Server (http://localhost:5173)...")
    npm_cmd = "npm.cmd" if os.name == "nt" else "npm"
    frontend_process = subprocess.Popen(
        [npm_cmd, "run", "dev"],
        cwd=root_dir
    )

    print()
    print("[+] Servers starting up. Waiting 3 seconds before opening browser...")
    time.sleep(3)

    web_url = "http://localhost:5173"
    print(f"[+] Opening DigiLand Web Application at {web_url} ...")
    try:
        webbrowser.open(web_url)
    except Exception as e:
        print(f"[*] Note: Open {web_url} manually in your browser.")

    print()
    print("=" * 60)
    print("   [+] DigiLand Platform Services are Running!")
    print("   - Web Application: http://localhost:5173")
    print("   - API Documentation: http://localhost:8000/docs")
    print("   - Press Ctrl+C at any time to shut down both servers.")
    print("=" * 60)
    print()

    try:
        backend_process.wait()
        frontend_process.wait()
    except KeyboardInterrupt:
        print("\n\n[!] Shutting down DigiLand servers...")
        try:
            backend_process.terminate()
            frontend_process.terminate()
        except Exception:
            pass
        print("[+] All services stopped successfully.")

if __name__ == "__main__":
    start_services()
