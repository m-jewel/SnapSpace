import React from 'react';

function isUrl(str) {
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
}

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
      <h2 style={styles.header}>Your Presets</h2>
      {presets.length === 0 && (
        <p style={styles.noPresets}>No presets found. Create one below.</p>
      )}
      <div style={styles.cardRow}>
        {presets.map((preset) => (
          <div key={preset.name} style={styles.presetCard}>
            <div style={styles.icon}>
              {renderIcon(preset.icon)}
            </div>
            <div style={styles.name}>{preset.name}</div>
            {preset.description && (
              <div style={styles.desc}>{preset.description}</div>
            )}
            <div style={styles.actions}>
              <button style={styles.actionBtn} onClick={() => onLaunch(preset.name)}>
                Launch
              </button>
              <button style={styles.actionBtn} onClick={() => onEdit(preset)}>
                Edit
              </button>
              <button style={styles.actionBtn} onClick={() => onRemove(preset.name)}>
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
      <div style={styles.footer}>
        <button style={styles.navBtn} onClick={onBackHome}>
          Back to Home
        </button>
        <button style={styles.navBtn} onClick={onCreateNew}>
          Create New Preset
        </button>
      </div>
    </div>
  );
}

// Helper function to render the icon
function renderIcon(icon) {
  if (!icon) {
    return '⚙️'; // fallback icon
  }
  // If it's a URL, show an image
  if (isUrl(icon)) {
    return <img src={icon} alt="icon" style={styles.iconImage} />;
  }
  // Otherwise, treat it as text (could be an emoji)
  return icon;
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '20px'
  },
  header: {
    fontSize: '1.5rem',
    marginBottom: '10px'
  },
  noPresets: {
    marginTop: '10px',
    fontSize: '1rem',
    color: '#555'
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
    marginBottom: '10px',
    minHeight: '40px'
  },
  iconImage: {
    width: '40px',
    height: '40px',
    objectFit: 'cover'
  },
  name: {
    fontWeight: 'bold',
    marginBottom: '5px',
    fontSize: '1.1rem'
  },
  desc: {
    fontSize: '0.9rem',
    color: '#666',
    marginBottom: '10px'
  },
  actions: {
    display: 'flex',
    justifyContent: 'center',
    gap: '6px',
    marginTop: '10px'
  },
  actionBtn: {
    backgroundColor: '#2ecc71',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    padding: '6px 10px',
    cursor: 'pointer',
    fontSize: '0.9rem'
  },
  footer: {
    marginTop: '30px'
  },
  navBtn: {
    padding: '10px 20px',
    margin: '0 10px',
    cursor: 'pointer',
    fontSize: '1rem',
    backgroundColor: '#3498db',
    color: '#fff',
    border: 'none',
    borderRadius: '4px'
  }
};

export default Presets;
