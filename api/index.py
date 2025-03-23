import sys
import os
from flask import Flask, request, jsonify
from flask_cors import CORS

# Add the flask_chatbot directory to the path
sys.path.insert(1, os.path.join(os.path.dirname(__file__), '../flask_chatbot'))

# Import app from flask_chatbot/app.py
from app import thirukkural_history, bhagavad_gita_history, genai_client, thirukkural_prompt, bhagavad_gita_prompt

app = Flask(__name__)
CORS(app)

@app.route('/api/thirukkural', methods=['POST'])
def get_thirukkural():
    data = request.json
    query = data.get('query', '')
    
    # Get chat history as a string
    history_messages = thirukkural_history.messages
    chat_history = "\n".join([f"{msg.type}: {msg.content}" for msg in history_messages])
    
    # Create the chain
    chain = thirukkural_prompt | genai_client
    
    try:
        # Execute the chain
        result = chain.invoke({"query": query, "chat_history": chat_history})
        
        # Add the exchange to history
        thirukkural_history.add_user_message(query)
        thirukkural_history.add_ai_message(str(result))
        
        # Return the response
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/bhagavad-gita', methods=['POST'])
def get_bhagavad_gita():
    data = request.json
    query = data.get('query', '')
    
    # Get chat history as a string
    history_messages = bhagavad_gita_history.messages
    chat_history = "\n".join([f"{msg.type}: {msg.content}" for msg in history_messages])
    
    # Create the chain
    chain = bhagavad_gita_prompt | genai_client
    
    try:
        # Execute the chain
        result = chain.invoke({"query": query, "chat_history": chat_history})
        
        # Add the exchange to history
        bhagavad_gita_history.add_user_message(query)
        bhagavad_gita_history.add_ai_message(str(result))
        
        # Return the response
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/reset', methods=['POST'])
def reset_chat_history():
    data = request.json
    chat_type = data.get('chatType', '')
    
    if chat_type == 'thirukkural':
        thirukkural_history.clear()
        return jsonify({"status": "Thirukkural chat history cleared"})
    elif chat_type == 'bhagavad-gita':
        bhagavad_gita_history.clear()
        return jsonify({"status": "Bhagavad Gita chat history cleared"})
    else:
        return jsonify({"error": "Invalid chat type"}), 400

# For Vercel
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def catch_all(path):
    return jsonify({"status": "API is running"})

if __name__ == '__main__':
    app.run(debug=True)