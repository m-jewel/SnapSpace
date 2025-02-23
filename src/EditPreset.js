import React, { useState, useEffect, useCallback } from "react";

function EditPreset({ preset, onSave, onCancel }) {
  // --- STATE ---
  const [oldName] = useState(preset?.name || "");
  const [newName, setNewName] = useState(preset?.name || "");
  const [description, setDescription] = useState(preset?.description || "");
  const [icon, setIcon] = useState(preset?.icon || "");
  const [items, setItems] = useState(preset?.items || []);
  const [errors, setErrors] = useState({});

  // --- EFFECTS ---
  useEffect(() => {
    window.electronAPI.receive("update-preset", (data) => {
      console.log("Presets updated:", data);
    });

    if (!preset) {
      alert("No preset to edit.");
      onCancel();
    }
  }, [preset, onCancel]);

  // --- HELPERS ---
  // URL Validation
  const isValidUrl = (value) => {
    try {
      new URL(value);
      return true;
    } catch (err) {
      return false;
    }
  };

  const handleInputChange = (setter) => (e) => setter(e.target.value);

  const handleItemChange = (index, field, value) => {
    setItems((prevItems) => {
      const updatedItems = [...prevItems];
      updatedItems[index][field] = value;
      return updatedItems;
    });
  };

  const addItem = () =>
    setItems((prev) => [...prev, { type: "url", target: "" }]);

  const removeItem = (index) => {
    setItems((prevItems) => {
      const updatedItems = [...prevItems];
      updatedItems.splice(index, 1);
      return updatedItems;
    });
  };

  const handleBrowseExe = (index) => {
    window.electronAPI.browseForExe().then((filePath) => {
      if (filePath) {
        handleItemChange(index, "target", filePath);
      }
    });
  };

  // --- VALIDATION ---
  const validateForm = useCallback(() => {
    const errors = {};
    if (!newName.trim()) errors.newName = "Preset name is required.";

    const hasEmptyItem = items.some((item) => !item.target.trim());
    const hasAtLeastOneNonEmpty = items.some((item) => item.target.trim());

    if (hasEmptyItem) errors.items = "Please fill or remove empty items.";
    if (!hasAtLeastOneNonEmpty) errors.items = "At least one item is required.";

    const hasInvalidUrl = items.some(
      (item) => item.type === "url" && !isValidUrl(item.target.trim())
    );
    if (hasInvalidUrl) errors.items = "One or more URLs are invalid.";

    setErrors(errors);
    return Object.keys(errors).length === 0;
  }, [newName, items]);

  // --- FLOW CONTROLS ---
  const handleSave = () => {
    if (!validateForm()) return;

    const updatedPreset = {
      oldName,
      newName: newName.trim(),
      description: description.trim(),
      icon: icon.trim(),
      items,
    };

    window.electronAPI.updatePreset(updatedPreset).then((res) => {
      if (!res.success) {
        alert(`Failed to update preset: ${res.message}`);
      } else {
        alert("Preset updated successfully!");
        onSave();
      }
    });
  };

  // --- RENDER ITEMS ---
  const renderItems = () =>
    items.map((item, index) => (
      <div key={index} style={styles.itemRow}>
        <select
          style={styles.select}
          value={item.type}
          onChange={(e) => handleItemChange(index, "type", e.target.value)}
        >
          <option value="url">URL</option>
          <option value="app">App</option>
        </select>

        <input
          style={styles.inputItem}
          type="text"
          placeholder={item.type === "url" ? "https://example.com" : "App path"}
          value={item.target}
          onChange={(e) => handleItemChange(index, "target", e.target.value)}
        />

        {item.type === "app" && (
          <button
            style={styles.browseBtn}
            onClick={() => handleBrowseExe(index)}
          >
            Browse
          </button>
        )}

        <button style={styles.removeBtn} onClick={() => removeItem(index)}>
          ✕
        </button>
      </div>
    ));

  // --- RENDER ---
  return (
    <div style={styles.container}>
      <h2 style={styles.header}>Edit Preset</h2>

      <div style={styles.fieldGroup}>
        <label style={styles.label}>
          Preset Name <span style={styles.required}>(required)</span>
        </label>
        <input
          style={styles.input}
          type="text"
          placeholder="e.g., Study Mode"
          value={newName}
          onChange={handleInputChange(setNewName)}
        />
        {errors.newName && <p style={styles.errorText}>{errors.newName}</p>}
      </div>

      <div style={styles.fieldGroup}>
        <label style={styles.label}>Description (optional)</label>
        <input
          style={styles.input}
          type="text"
          placeholder="e.g., Opens Canvas, Notion..."
          value={description}
          onChange={handleInputChange(setDescription)}
        />
      </div>

      <div style={styles.fieldGroup}>
        <label style={styles.label}>Icon (optional)</label>
        <input
          style={styles.input}
          type="text"
          placeholder="e.g., 📚 or https://example.com/icon.png"
          value={icon}
          onChange={handleInputChange(setIcon)}
        />
      </div>

      <h3 style={styles.subheader}>Items to Launch</h3>
      {renderItems()}

      <button style={styles.addBtn} onClick={addItem}>
        + Add Another Item
      </button>

      {errors.items && <p style={styles.errorText}>{errors.items}</p>}

      <div style={styles.buttonRow}>
        <button style={styles.primaryBtn} onClick={handleSave}>
          Save Changes
        </button>
        <button style={styles.secondaryBtn} onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}

// --- STYLES ---
const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    padding: "20px",
    background: "#fff",
    borderRadius: "20px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    maxWidth: "400px",
    margin: "0 auto",
  },
  header: {
    fontSize: "1.8rem",
    marginBottom: "20px",
    color: "#333",
  },
  fieldGroup: {
    width: "100%",
    marginBottom: "15px",
  },
  input: {
    width: "100%",
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    boxSizing: "border-box",
  },
  itemRow: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    marginBottom: "10px",
  },
  select: {
    padding: "6px 10px",
    width: "80px",
    borderRadius: "6px",
    border: "1px solid #ccc",
  },
  inputItem: {
    flex: 1,
    padding: "8px",
    borderRadius: "6px",
    border: "1px solid #ccc",
  },
  buttonRow: {
    display: "flex",
    justifyContent: "center",
    gap: "10px",
    flexWrap: "wrap",
    marginTop: "15px",
  },
  primaryBtn: {
    padding: "6px 12px",
    margin: "5px",
    cursor: "pointer",
    fontSize: "0.9rem",
    background: "#4a4a4a",
    color: "white",
    border: "none",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
    transition: "transform 0.2s, background 0.2s",
  },
  secondaryBtn: {
    padding: "6px 12px",
    margin: "5px",
    cursor: "pointer",
    fontSize: "0.9rem",
    background: "#f4f4f9",
    color: "#333",
    border: "1px solid #ccc",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
    transition: "transform 0.2s, background 0.2s",
  },
  addBtn: {
    padding: "6px 12px",
    margin: "10px 0",
    cursor: "pointer",
    fontSize: "0.85rem",
    background: "#e0e0e0",
    color: "#333",
    border: "1px solid #ccc",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
    transition: "transform 0.2s, background 0.2s",
  },
};

export default EditPreset;
