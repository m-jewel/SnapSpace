import React, { useState } from 'react';

function CreatePreset({ onDone, onCancel }) {
  // Step 1: gather input
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState(''); // <-- NEW: icon field
  const [items, setItems] = useState([{ type: 'url', target: '' }]);
  const [step, setStep] = useState(1); // 1 = form, 2 = summary

  // --- Helper: Validate a URL
  function isValidUrl(value) {
    try {
      new URL(value);
      return true;
    } catch (err) {
      return false;
    }
  }

  // Add an item row
  const addItem = () => {
    setItems([...items, { type: 'url', target: '' }]);
  };

  // Update an item
  const updateItem = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    setItems(updated);
  };

  // Remove an item
  const removeItem = (index) => {
    const updated = [...items];
    updated.splice(index, 1);
    setItems(updated);
  };

  // For "Browse" button when item.type === 'app'
  const handleBrowseExe = (index) => {
    window.electronAPI.browseForExe().then((filePath) => {
      if (filePath) {
        updateItem(index, 'target', filePath);
      }
    });
  };

  // Step 1: Validate before moving to summary
  const handleNext = () => {
    // Check required name
    if (!name.trim()) {
      alert("Please provide a preset name.");
      return;
    }

    // Check if any item is partially filled
    const hasEmptyItem = items.some(item => !item.target.trim());
    // Also check if user ended up with no valid items
    const hasAtLeastOneNonEmpty = items.some(item => item.target.trim());

    if (hasEmptyItem) {
      alert("One or more items are empty. Please fill them or remove them.");
      return;
    }
    if (!hasAtLeastOneNonEmpty) {
      alert("Please add at least one valid item (URL or App).");
      return;
    }

    // Check for invalid URLs
    const hasInvalidUrl = items.some(item => {
      if (item.type === 'url') {
        return !isValidUrl(item.target.trim());
      }
      return false;
    });
    if (hasInvalidUrl) {
      alert("One or more URLs are invalid. Please check them.");
      return;
    }

    setStep(2);
  };

  // Step 2: show summary (only non-empty items)
  const handleConfirm = (action) => {
    const filteredItems = items.filter(item => item.target.trim());

    const newPreset = {
      name: name.trim(),
      description: description.trim(),
      icon: icon.trim(),           // <-- NEW: store the icon
      items: filteredItems
    };

    window.electronAPI.createPreset(newPreset).then((res) => {
      if (!res.success) {
        alert(`Failed to create preset: ${res.message}`);
      } else {
        alert('Preset created successfully!');
        onDone({ newPresetName: newPreset.name, action });
      }
    });
  };

  // --- RENDER ---

  // STEP 1: FORM
  if (step === 1) {
    return (
      <div style={styles.container}>
        <h2 style={styles.header}>Create a New Preset</h2>

        {/* Preset Name */}
        <div style={styles.fieldGroup}>
          <label style={styles.label}>
            Preset Name <span style={styles.required}>(required)</span>
          </label>
          <input
            style={styles.input}
            type="text"
            placeholder="e.g., Study Mode"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        {/* Description */}
        <div style={styles.fieldGroup}>
          <label style={styles.label}>
            Description <span style={styles.optional}>(optional)</span>
          </label>
          <input
            style={styles.input}
            type="text"
            placeholder="e.g., Opens Canvas, Notion..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* Icon Field */}
        <div style={styles.fieldGroup}>
          <label style={styles.label}>
            Icon <span style={styles.optional}>(optional)</span>
          </label>
          <input
            style={styles.input}
            type="text"
            placeholder="e.g., 📚 or https://example.com/icon.png"
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
          />
          <p style={styles.hint}>
          </p>
        </div>

        <h3 style={styles.subheader}>Items to Launch</h3>
        {items.map((item, index) => (
          <div key={index} style={styles.itemRow}>
            <select
              style={styles.select}
              onMouseEnter={(e) => e.target.style.border = styles.selectHover.border}
              onMouseLeave={(e) => e.target.style.border = styles.select.border}
              value={item.type}
              onChange={(e) => updateItem(index, 'type', e.target.value)}
            >
              <option value="url">URL</option>
              <option value="app">App</option>
            </select>
            <input
              style={styles.inputItem}
              type="text"
              placeholder={item.type === 'url' ? 'https://example.com' : 'AppName or path'}
              value={item.target}
              onChange={(e) => updateItem(index, 'target', e.target.value)}
            />
            {/* Only show "Browse" if it's an app */}
            {item.type === 'app' && (
              <button style={styles.browseBtn} onMouseEnter={(e) => {
                e.taget.style.background = styles.browseBtnHover.background;
                e.target.style.transform = styles.browseBtnHover.transform;
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = styles.browseBtn.background;
                  e.target.style.transform = 'scale(1)';
                  }}
                  onClick={() => handleBrowseExe(index)}>
                Browse
              </button>
            )}
            <button style={styles.removeBtn} onClick={() => removeItem(index)}>
              ✕
            </button>
          </div>
        ))}

        <button style={styles.addBtn} onClick={addItem}>
          + Add Another Item
        </button>

        <div style={styles.buttonRow}>
          <button style={styles.primaryBtn} onClick={handleNext}>
            Next
          </button>
          <button style={styles.secondaryBtn} onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    );
  }

  // STEP 2: SUMMARY
  const displayItems = items.filter(item => item.target.trim());

  return (
    <div style={styles.container}>
      <h2 style={styles.header}>Review Your Preset</h2>
      <div style={styles.summaryBox}>
        <p style={styles.summaryText}>
          <strong>Name:</strong> {name}
        </p>
        {description.trim() && (
          <p style={styles.summaryText}>
            <strong>Description:</strong> {description}
          </p>
        )}
        {icon.trim() && (
          <p style={styles.summaryText}>
            <strong>Icon:</strong> {icon}
          </p>
        )}

        {displayItems.length > 0 && (
          <>
            <h3 style={styles.subheader}>Items:</h3>
            <ul style={styles.itemList}>
              {displayItems.map((item, i) => (
                <li key={i} style={styles.listItem}>
                  <strong>{item.type.toUpperCase()}</strong> - {item.target}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      <p style={styles.question}>Would you like to confirm and save this preset?</p>

      <div style={styles.buttonRow}>
        <button style={styles.primaryBtn} onClick={() => handleConfirm('confirm')}>
          Confirm
        </button>
        <button style={styles.primaryBtn} onClick={() => handleConfirm('launch')}>
          Confirm &amp; Launch
        </button>
        <button style={styles.secondaryBtn} onClick={() => setStep(1)}>
          Back
        </button>
      </div>
    </div>
  );
}

// --- STYLES ---
const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '20px',
    background: '#fff',
    borderRadius: '20px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    maxWidth: '400px', 
    width: '90%',     
    margin: '0 auto',
  },
  header: {
    fontSize: '1.8rem',
    marginBottom: '20px',
    color: '#333',
    textAlign: 'center',
  },
  fieldGroup: {
    width: '100%',
    marginBottom: '15px',
    display: 'flex',
    flexDirection: 'column',
  },
  label: {
    marginBottom: '5px',
    fontWeight: 'bold',
    fontSize: '0.9rem',
  },
  input: {
    width: '100%',
    padding: '10px',
    borderRadius: '8px',
    border: '1px solid #ccc',
    boxSizing: 'border-box',
    transition: 'border 0.2s',
  },
  inputFocus: {
    border: '1px solid #007bff',
    outline: 'none',
  },
  select: {
    padding: '6px 10px',
    fontSize: '0.85rem',
    color: '#333',
    background: '#f4f4f9',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    transition: 'border 0.2s',
    appearance: 'none',
    cursor: 'pointer',
    width: '30%',
    boxSizing: 'border-box'
  },
  inputItem: {
    flex: 1,
    padding: '10px',
    fontSize: '0.9rem',
    borderRadius: '8px',
    border: '1px solid #ccc',
    boxSizing: 'border-box'
  },
  itemRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '10px'
  },
  browseBtn: {
    padding: '6px 12px',
    fontSize: '0.85rem',
    background: '#e0e0e0',
    border: '1px solid #ccc',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    cursor: 'pointer',
    transition: 'transform 0.2s, background 0.2s',
    marginLeft: '6px'
  },
  browseBtnHover: {
    background: '#d5d5d5',
    transform: 'scale(1.02)',
  },
  removeBtn: {
    padding: '6px 8px',
    fontSize: '0.85rem',
    background: '#f4f4f9',
    color: '#333',
    border: '1px solid #ccc',
    borderRadius: '8px',
    cursor: 'pointer',
    marginLeft: '8px'
  },
  addBtn: {
    padding: '6px 12px',
    margin: '10px 0',
    cursor: 'pointer',
    fontSize: '0.85rem',
    background: '#e0e0e0',
    color: '#333',
    border: '1px solid #ccc',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    transition: 'transform 0.2s, background 0.2s',
  },
  buttonRow: {
    display: 'flex',
    justifyContent: 'center',
    gap: '10px',
    flexWrap: 'wrap',
    marginTop: '15px'
  },
  primaryBtn: {
    padding: '6px 12px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    background: '#4a4a4a',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
    transition: 'transform 0.2s, background 0.2s',
  },
  secondaryBtn: {
    padding: '6px 12px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    background: '#f4f4f9',
    color: '#333',
    border: '1px solid #ccc',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    transition: 'transform 0.2s, background 0.2s',
  },
  summaryBox: {
    backgroundColor: '#fff',
    border: '1px solid #ccc',
    borderRadius: '12px',
    padding: '15px',
    marginBottom: '10px',
    width: '100%',
    maxWidth: '350px',
    overflowY: 'auto',
    maxHeight: '300px',
    boxSizing: 'border-box'
},
summaryText: {
    margin: '6px 0',
    wordWrap: 'break-word',
    overflowWrap: 'break-word'
},
itemList: {
    listStyleType: 'none',
    padding: '0',
    marginLeft: '0'
},
listItem: {
    backgroundColor: '#ecf0f1',
    marginBottom: '5px',
    padding: '5px 8px',
    borderRadius: '4px',
    wordWrap: 'break-word',
    overflowWrap: 'break-word'
},
question: {
    margin: '10px 0',
    textAlign: 'center'
}

};

export default CreatePreset;
