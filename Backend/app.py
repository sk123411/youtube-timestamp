from flask import Flask, request, jsonify
from youtube_transcript_api import YouTubeTranscriptApi
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS

@app.route('/analyze', methods=['POST'])
def analyze():
    data = request.json
    video_url = data['video_url']
    query = data['query']
    language = data.get('language', 'en')  # Default to English if not specified

    # Extract video ID from the URL
    video_id = video_url.split('v=')[1].split('&')[0]

    try:
        # Create API instance and fetch transcript using the new syntax
        ytt_api = YouTubeTranscriptApi()
        fetched_transcript = ytt_api.fetch(video_id, languages=[language])
        
        # Extract snippets from the FetchedTranscript object
        matches = []
        for snippet in fetched_transcript.snippets:
            if query.lower() in snippet.text.lower():
                matches.append({
                    'text': snippet.text,
                    'start': snippet.start,
                    'duration': snippet.duration
                })
        
        if not matches:  # Check if matches is empty
            return jsonify({'error': 'No matches found'}), 404        
        
        return jsonify(matches)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 400

if __name__ == '__main__':
    app.run(debug=True)
