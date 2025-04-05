from flask import Flask, request, jsonify
import requests
from flask_cors import CORS
import time

app = Flask(__name__)
CORS(app)

API_KEY = 'your_openweathermap_api_key_here'
CACHE = {}
CACHE_EXPIRY = 3600  # 1 hour

def get_weather_data(city):
    key = city.lower()
    now = time.time()

    if key in CACHE and (now - CACHE[key]['timestamp'] < CACHE_EXPIRY):
        return CACHE[key]['data'], None

    url = f"http://api.openweathermap.org/data/2.5/weather?q={city}&appid={API_KEY}&units=metric"
    response = requests.get(url)
    if response.status_code != 200:
        return None, 'Weather API failed'

    data = response.json()
    temp = data['main']['temp']
    city_name = data['name']

    if temp > 18:
        advice = "T-shirt weather. Relax."
    elif 12 <= temp <= 18:
        advice = "Hoodie time."
    elif 5 <= temp < 12:
        advice = "Coat required."
    else:
        advice = "Big coat. Bring your emotional support layers."

    payload = {'temperature': temp, 'advice': advice, 'city': city_name}
    CACHE[key] = {'data': payload, 'timestamp': now}
    return payload, None

@app.route('/weather', methods=['GET'])
def weather():
    city = request.args.get('city')
    if not city:
        return jsonify({'error': 'City is required'}), 400

    data, err = get_weather_data(city)
    if err:
        return jsonify({'error': err}), 500
    return jsonify(data)

if __name__ == '__main__':
    app.run(debug=True)
