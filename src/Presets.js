import React from 'react';

const presetIcons = {
  'Study Mode': '📚',
  'Gaming Mode': '🎮',
  'Work Mode': '💼'
};

function Presets({ 
  presets, 
  onBackHome, 
  onLaunch, 
  onRemove,
  onEdit,
  onCreateNew
}) {
  return (
    <div style={styles.container}>
      <div style={styles.cardRow}>
        {presets.map((preset) => (
          <div key={preset.name} style={styles.presetCard}>
            <div style={styles.icon}>
              {presetIcons[preset.name] || '⚙️'}
            </div>
            <div style={styles.name}>{preset.name}</div>
            <div style={styles.desc}>{preset.description}</div>
            <div style={styles.actions}>
              <button onClick={() => onLaunch(preset.name)}>Launch</button>
              <button onClick={() => onEdit(preset)}>Edit</button>
              <button onClick={() => onRemove(preset.name)}>Remove</button>
            </div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: '30px' }}>
        <button style={styles.button} onClick={onBackHome}>
          Back to Home
        </button>
        <button style={styles.button} onClick={onCreateNew}>
          Create New Preset
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
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
    width: '220px',
    textAlign: 'center',
    padding: '20px',
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
  actions: {
    marginTop: '10px'
  },
  button: {
    padding: '10px 20px',
    margin: '0 10px',
    cursor: 'pointer',
    fontSize: '1rem'
  }
};

export default Presets;
