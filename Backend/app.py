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
        # Fetch transcript in the specified language
        transcript = YouTubeTranscriptApi.get_transcript(video_id, languages=[language])
        
        # Find matches
        matches = []
        for entry in transcript:
            if query.lower() in entry['text'].lower():
                matches.append({
                    'text': entry['text'],
                    'start': entry['start'],
                    'duration': entry['duration']
                })
        
        return jsonify(matches)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 400

if __name__ == '__main__':
    app.run(debug=True)