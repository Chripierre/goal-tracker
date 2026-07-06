"""
Serves the Goal Tracker locally on http://localhost:3400
Run: python serve.py
"""
import http.server
import socketserver
import webbrowser
import os

PORT = 3400
os.chdir(os.path.dirname(os.path.abspath(__file__)))

class Handler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, format, *args):
        pass  # suppress request logs

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print("Goal Tracker running at http://localhost:" + str(PORT))
    print("Press Ctrl+C to stop.")
    webbrowser.open("http://localhost:" + str(PORT))
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nStopped.")
