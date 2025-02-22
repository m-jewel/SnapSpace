import React, { useEffect, useState } from 'react';
import Home from './Home';
import Presets from './Presets';
import CreatePreset from './CreatePreset';
import EditPreset from './EditPreset';

function App() {
  const [presets, setPresets] = useState([]);
  const [view, setView] = useState('home'); 
  // possible views: 'home', 'presets', 'create', 'edit'
  
  const [lastUsedPreset, setLastUsedPreset] = useState(null);

  // For editing
  const [presetToEdit, setPresetToEdit] = useState(null);

  useEffect(() => {
    window.electronAPI.getPresets().then(data => {
      setPresets(data);
    });

    const storedPreset = localStorage.getItem('lastUsedPreset');
    if (storedPreset) {
      setLastUsedPreset(storedPreset);
    }
  }, []);

  // Launch a preset
  const handleLaunch = (name) => {
    localStorage.setItem('lastUsedPreset', name);
    setLastUsedPreset(name);

    window.electronAPI.launchPreset(name).then(response => {
      if (!response.success) {
        alert(`Failed to launch ${name}: ${response.message}`);
      }
    });
  };

  // Called by Home to either resume or go to presets
  const handleContinue = (action) => {
    if (action === 'resume' && lastUsedPreset) {
      handleLaunch(lastUsedPreset);
    } else {
      setView('presets');
    }
  };

  // Refresh presets from main
  const refreshPresets = () => {
    window.electronAPI.getPresets().then(data => {
      setPresets(data);
    });
  };

  // On create preset done
  const handleCreateDone = (options) => {
    // e.g., { newPresetName, action: 'confirm' or 'launch' }
    refreshPresets();
    if (options.action === 'launch' && options.newPresetName) {
      handleLaunch(options.newPresetName);
    }
    setView('home');
  };

  // On edit preset done
  const handleEditDone = () => {
    refreshPresets();
    setView('home');
  };

  // On remove preset
  const handleRemovePreset = (name) => {
    if (window.confirm(`Are you sure you want to remove "${name}"?`)) {
      window.electronAPI.removePreset(name).then(response => {
        if (!response.success) {
          alert(`Failed to remove preset: ${response.message}`);
        } else {
          refreshPresets();
        }
      });
    }
  };

  // If editing
  if (view === 'edit') {
    return (
      <EditPreset 
        preset={presetToEdit} 
        onSave={handleEditDone} 
        onCancel={() => setView('home')}
      />
    );
  }

  // If creating
  if (view === 'create') {
    return (
      <CreatePreset
        onDone={handleCreateDone}
        onCancel={() => setView('home')}
      />
    );
  }

  // If home
  if (view === 'home') {
    return (
      <Home
        onContinue={handleContinue}
        lastPreset={lastUsedPreset}
        hasPresets={presets.length > 0}
        onCreateNew={() => setView('create')}
      />
    );
  }

  // Otherwise, show Presets list
  return (
    <Presets
      presets={presets}
      onBackHome={() => setView('home')}
      onLaunch={handleLaunch}
      onRemove={handleRemovePreset}
      onEdit={(preset) => {
        setPresetToEdit(preset);
        setView('edit');
      }}
      onCreateNew={() => setView('create')}
    />
  );
}

export default App;
