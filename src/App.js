import React, { useEffect, useState } from 'react';

const presetIcons = {
  'Study Mode': '📚',
  'Gaming Mode': '🎮',
  'Work Mode': '💼'
};

function App() {
  const [presets, setPresets] = useState([]);

  useEffect(() => {
    window.electronAPI.getPresets().then(data => {
      setPresets(data);
    });
  }, []);

  const handleLaunch = (name) => {
    window.electronAPI.launchPreset(name).then(response => {
      if (response.success) {
        alert(`${name} launched successfully!`);
      } else {
        alert(`Failed to launch ${name}: ${response.message}`);
      }
    });
  };

  return (
    <div className="preset-container">
      {presets.map((preset) => (
        <div key={preset.name} className="preset" onClick={() => handleLaunch(preset.name)}>
          <div className="preset-icon">{presetIcons[preset.name] || '⚙️'}</div>
          <div className="preset-name">{preset.name}</div>
          <div className="preset-description">{preset.description}</div>
        </div>
      ))}
    </div>
  );
}

export default App;
