from http.server import HTTPServer, BaseHTTPRequestHandler, SimpleHTTPRequestHandler
import re
import os
from sys import argv
import requests
import json

USE_MOCK = False
AUTH_TOKEN = None
QUERY = None


class RequestHandler(SimpleHTTPRequestHandler):

    def set_headers(self):
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()

    def do_GET(self):
        if self.path == '/' or self.path.startswith('/static/'):
            super().do_GET()
        elif self.path == '/query/':
            res = self.fetch_data()
            self.set_headers()
            self.wfile.write(json.dumps(res).encode())

    def fetch_data(self):
        response = requests.post(
            'https://api.github.com/graphql',
            json={
                'query': QUERY
            },
            headers={
                'Authorization': 'bearer {}'.format(AUTH_TOKEN)
            }
        )
        return response.json()


def run():
    httpd = HTTPServer(('127.0.0.1', 1337), RequestHandler)
    httpd.serve_forever()

if __name__ == "__main__":
    
    if len(argv) == 2:
        AUTH_TOKEN = str(argv[1])

        module_dir = os.path.dirname(__file__)
        with open(os.path.join(module_dir, 'query.graphql')) as q_file:
            QUERY = q_file.read()
        os.chdir(os.path.join(module_dir, 'build/'))

        run()
    else:
        print('server.py requires github auth_token')
        exit(1)