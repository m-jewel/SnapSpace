import React, { useEffect, useState } from 'react';
import { WiDaySunny, WiCloudy, WiRain, WiSnow, WiThunderstorm, WiFog } from 'react-icons/wi';

function Home({ onContinue, lastPreset, hasPresets, onCreateNew }) {
  const [greeting, setGreeting] = useState('');
  const [weather, setWeather] = useState({ temp: '-', description: '-', icon: null });
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const hours = new Date().getHours();
    if (hours < 12) {
      setGreeting('Good morning');
    } else if (hours < 18) {
      setGreeting('Good afternoon');
    } else {
      setGreeting('Good evening');
    }

    // Get user's geolocation and fetch weather
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        fetchWeather(latitude, longitude);
      },
      (error) => {
        console.error('Geolocation error:', error);
        // Default to Zagreb, Croatia if geolocation fails
        fetchWeather(45.8150, 15.9819);
      }
    );
  }, [retryCount]);

  const fetchWeather = (latitude, longitude) => {
    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`)
      .then(res => res.json())
      .then(data => {
        const weatherCode = data.current_weather.weathercode;
        setWeather({
          temp: data.current_weather.temperature,
          description: getWeatherDescription(weatherCode),
          icon: getWeatherIcon(weatherCode)
        });
      })
      .catch(error => {
        console.error('Error fetching weather data:', error);
        // Retry after 3 seconds
        setTimeout(() => setRetryCount(retryCount + 1), 3000);
      });
  };

  const getWeatherDescription = (code) => {
    switch (code) {
      case 0:
        return 'Clear Sky';
      case 1:
      case 2:
      case 3:
        return 'Partly Cloudy';
      case 45:
      case 48:
        return 'Fog';
      case 51:
      case 53:
      case 55:
        return 'Drizzle';
      case 61:
      case 63:
      case 65:
        return 'Rain';
      case 71:
      case 73:
      case 75:
        return 'Snow';
      case 80:
      case 81:
      case 82:
        return 'Showers';
      case 95:
        return 'Thunderstorm';
      default:
        return 'Unknown';
    }
  };

  const getWeatherIcon = (code) => {
    switch (code) {
      case 0:
        return <WiDaySunny size={30} color="#f9d71c" />;
      case 1:
      case 2:
      case 3:
        return <WiCloudy size={30} color="#90a4ae" />;
      case 45:
      case 48:
        return <WiFog size={30} color="#78909c" />;
      case 51:
      case 53:
      case 55:
      case 61:
      case 63:
      case 65:
        return <WiRain size={30} color="#4fc3f7" />;
      case 71:
      case 73:
      case 75:
        return <WiSnow size={30} color="#e0f7fa" />;
      case 80:
      case 81:
      case 82:
      case 95:
        return <WiThunderstorm size={30} color="#ffab00" />;
      default:
        return <WiCloudy size={30} color="#90a4ae" />;
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.weatherContainer}>
        {weather.icon}
        <span style={styles.weatherTemp}>{weather.temp}°</span>
      </div>
      <h1 style={styles.title}>{greeting}, I’m SnapSpace!</h1>
      <p style={styles.subtitle}>I can help you instantly set up your workspace!</p>

      {!hasPresets && (
        <>
          <p>No presets found yet.</p>
          <button style={styles.button} onClick={onCreateNew}>Get Started</button>
        </>
      )}

      {hasPresets && (
        <>
          {lastPreset && (
            <button style={styles.button} onClick={() => onContinue('resume')}>
              Resume Last Used Preset: {lastPreset}
            </button>
          )}
          <button style={styles.button} onClick={() => onContinue('presets')}>Go to Presets</button>
          <button style={styles.button} onClick={() => onCreateNew('home')}>Create New Preset</button>
        </>
      )}
    </div>
  );
}

const styles = {
  container: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '10px',
    background: '#f4f4f9',
    minHeight: '100vh',
    boxSizing: 'border-box',
    overflow: 'hidden'
  },
  weatherContainer: {
    position: 'absolute',
    top: '10px',
    right: '10px',
    display: 'flex',
    alignItems: 'center',
    background: '#fff',
    padding: '3px 8px',
    borderRadius: '8px',
    boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
  },
  weatherTemp: {
    fontSize: '0.8rem',
    marginLeft: '5px',
    color: '#222'
  },
  title: {
    fontSize: '2rem',
    marginBottom: '0px',
    color: '#333'
  },
  subtitle: {
    fontSize: '1rem',
    marginBottom: '8px',
    textAlign: 'center',
    color: '#666'
  },
  button: {
    padding: '8px 15px',
    margin: '5px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    background: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0, 123, 255, 0.2)',
    transition: 'transform 0.2s',
  }
};

export default Home;
