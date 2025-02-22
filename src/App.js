import React, { useEffect, useState } from 'react';
import Home from './Home';

const presetIcons = {
  'Study Mode': '📚',
  'Gaming Mode': '🎮',
  'Work Mode': '💼'
};

function App() {
  const [presets, setPresets] = useState([]);
  const [view, setView] = useState('home'); 
  // 'home' = show the home screen
  // 'presets' = show the preset list

  const [lastUsedPreset, setLastUsedPreset] = useState(null);

  useEffect(() => {
    // Load presets from Electron
    window.electronAPI.getPresets().then(data => {
      setPresets(data);
    });

    // Check localStorage for last used preset
    const storedPreset = localStorage.getItem('lastUsedPreset');
    if (storedPreset) {
      setLastUsedPreset(storedPreset);
    }
  }, []);

  const handleLaunch = (name) => {
    // Save this as last used preset
    localStorage.setItem('lastUsedPreset', name);
    setLastUsedPreset(name);

    // Ask main process to launch the preset
    window.electronAPI.launchPreset(name).then(response => {
      if (!response.success) {
        alert(`Failed to launch ${name}: ${response.message}`);
      }
    });
  };

  // Called when user clicks "Resume Last Used Preset" or "Go to Presets"
  const handleContinue = (action) => {
    if (action === 'resume' && lastUsedPreset) {
      handleLaunch(lastUsedPreset);
    } else {
      setView('presets');
    }
  };

  if (view === 'home') {
    // Show the home screen
    return <Home onContinue={handleContinue} lastPreset={lastUsedPreset} />;
  }

  // Otherwise, show the Preset list screen
  return (
    <div style={styles.presetContainer}>
      <h1>SnapSpace</h1>
      <div style={styles.cardRow}>
        {presets.map((preset) => (
          <div 
            key={preset.name} 
            style={styles.presetCard} 
            onClick={() => handleLaunch(preset.name)}
          >
            <div style={styles.icon}>
              {presetIcons[preset.name] || '⚙️'}
            </div>
            <div style={styles.name}>{preset.name}</div>
            <div style={styles.desc}>{preset.description}</div>
          </div>
        ))}
      </div>
      <button style={styles.backButton} onClick={() => setView('home')}>
        Back to Home
      </button>
    </div>
  );
}

const styles = {
  presetContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '20px'
  },
  cardRow: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: '20px',
    marginTop: '20px'
  },
  presetCard: {
    backgroundColor: '#fff',
    border: '1px solid #ccc',
    borderRadius: '8px',
    width: '180px',
    textAlign: 'center',
    padding: '20px',
    cursor: 'pointer',
    transition: 'box-shadow 0.3s ease'
  },
  icon: {
    fontSize: '40px',
    marginBottom: '10px'
  },
  name: {
    fontWeight: 'bold',
    marginBottom: '5px'
  },
  desc: {
    fontSize: '14px',
    color: '#666'
  },
  backButton: {
    marginTop: '30px',
    padding: '10px 20px',
    cursor: 'pointer',
    fontSize: '1rem'
  }
};

export default App;
