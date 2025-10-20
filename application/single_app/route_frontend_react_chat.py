# route_frontend_react_chat.py

from config import *
from functions_authentication import *
import os
import re

def register_route_frontend_react_chat(app):
    @app.route('/chat')
    @login_required
    @user_required
    def react_chat():
        """Serve the React chat interface"""
        user_id = get_current_user_id()
        if not user_id:
            return redirect(url_for('login'))
        
        # Read the built index.html
        index_path = os.path.join(app.static_folder, 'react_chat', 'index.html')
        
        if not os.path.exists(index_path):
            return """
            <h1>React Chat Not Built</h1>
            <p>Please build the React app first:</p>
            <pre>cd simplechat/application/react_chat
npm install
npm run build</pre>
            """, 500
        
        with open(index_path, 'r', encoding='utf-8') as f:
            html = f.read()
        
        # Replace absolute paths with Flask static paths
        # Simply change /assets/ to /static/react_chat/assets/
        html = html.replace('href="/assets/', 'href="/static/react_chat/assets/')
        html = html.replace('src="/assets/', 'src="/static/react_chat/assets/')
        html = html.replace('href="/vite.svg"', 'href="/static/react_chat/vite.svg"')
        
        return html

