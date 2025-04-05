import { useState } from 'react';
import './index.css';

export default function App() {
  const [city, setCity] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const getWeather = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/weather?city=${city}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error fetching weather');
      setResult(data);
    } catch (err) {
      setResult(null);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getWeatherByLocation = async () => {
    if (!navigator.geolocation) return setError("Geolocation not supported");
    setLoading(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords;
      try {
        const geoRes = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
        const geoData = await geoRes.json();
        const cityName = geoData.city || geoData.locality || geoData.principalSubdivision || geoData.countryName;
        const res = await fetch(`http://localhost:5000/weather?city=${cityName}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Error fetching weather');
        setResult(data);
      } catch (err) {
        setResult(null);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    });
  };

  const getEmoji = (temp) => {
    if (temp > 18) return "👕";
    if (temp > 12) return "🧥";
    if (temp > 5) return "🧣";
    return "🧊";
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-sky-200 via-indigo-100 to-indigo-200 text-gray-800 font-sans p-4 transition-all duration-700">
      <div className="bg-white shadow-2xl rounded-3xl p-10 max-w-md w-full text-center space-y-6">
        <h1 className="text-4xl font-extrabold">☁️ What Should I Wear?</h1>
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Enter your city"
          className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
        <button onClick={getWeather} className="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-2 px-6 rounded-xl transition">
          Tell Me!
        </button>
        <button onClick={getWeatherByLocation} className="bg-teal-500 hover:bg-teal-600 text-white font-semibold py-2 px-6 rounded-xl transition">
          Use My Location
        </button>
        {loading && <div className="text-indigo-600 animate-pulse">Checking the skies...</div>}
        {error && <div className="text-red-500">{error}</div>}
        {result && (
          <div className="space-y-6 mt-6">
            <div className="text-6xl">{getEmoji(result.temperature)}</div>
            <div className="text-xl font-bold">{result.advice}</div>
            <div className="text-sm text-gray-600">Details:</div>
            <div className="space-y-1 text-sm">
              <p>🌍 <span className="font-medium">{result.city}</span></p>
              <p>🌡 <span className="font-medium">{result.temperature}°C</span></p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
