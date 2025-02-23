import React, { useState, useCallback } from "react";

function CreatePreset({ onDone, onCancel }) {
  // --- STATE ---
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("");
  const [items, setItems] = useState([{ type: "url", target: "" }]);
  const [step, setStep] = useState(1); // 1 = form, 2 = summary
  const [errors, setErrors] = useState({});

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

  // Input Change Handlers
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
    if (!name.trim()) errors.name = "Preset name is required.";

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
  }, [name, items]);

  // --- FLOW CONTROLS ---
  const handleNext = () => {
    if (validateForm()) setStep(2);
  };

  const handleConfirm = (action) => {
    const filteredItems = items.filter((item) => item.target.trim());
    const newPreset = {
      name: name.trim(),
      description: description.trim(),
      icon: icon.trim(),
      items: filteredItems,
    };

    window.electronAPI.createPreset(newPreset).then((res) => {
      if (!res.success) {
        alert(`Failed to create preset: ${res.message}`);
      } else {
        alert("Preset created successfully!");
        onDone({ newPresetName: newPreset.name, action });
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
            onChange={handleInputChange(setName)}
          />
          {errors.name && <p style={styles.errorText}>{errors.name}</p>}
        </div>

        {/* Description */}
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

        {/* Icon Field */}
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

  // --- STEP 2: SUMMARY ---
  return (
    <div style={styles.container}>
      <h2 style={styles.header}>Review Your Preset</h2>
      <div style={styles.summaryBox}>
        <p>
          <strong>Name:</strong> {name}
        </p>
        {description && (
          <p>
            <strong>Description:</strong> {description}
          </p>
        )}
        {icon && (
          <p>
            <strong>Icon:</strong> {icon}
          </p>
        )}

        <h3 style={styles.subheader}>Items:</h3>
        <ul style={styles.itemList}>
          {items.map((item, i) => (
            <li key={i}>
              <strong>{item.type.toUpperCase()}</strong> - {item.target}
            </li>
          ))}
        </ul>
      </div>

      <div style={styles.buttonRow}>
        <button
          style={styles.primaryBtn}
          onClick={() => handleConfirm("confirm")}
        >
          Confirm
        </button>
        <button
          style={styles.primaryBtn}
          onClick={() => handleConfirm("launch")}
        >
          Confirm & Launch
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
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    padding: "20px",
    background: "#fff",
    borderRadius: "20px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    maxWidth: "400px",
    width: "90%",
    margin: "0 auto",
  },
  header: {
    fontSize: "1.8rem",
    marginBottom: "20px",
    color: "#333",
    textAlign: "center",
  },
  fieldGroup: {
    width: "100%",
    marginBottom: "15px",
    display: "flex",
    flexDirection: "column",
  },
  label: {
    marginBottom: "5px",
    fontWeight: "bold",
    fontSize: "0.9rem",
  },
  input: {
    width: "100%",
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    boxSizing: "border-box",
    transition: "border 0.2s",
  },
  inputFocus: {
    border: "1px solid #007bff",
    outline: "none",
  },
  select: {
    padding: "6px 10px",
    fontSize: "0.85rem",
    color: "#333",
    background: "#f4f4f9",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
    transition: "border 0.2s",
    appearance: "none",
    cursor: "pointer",
    width: "30%",
    boxSizing: "border-box",
  },
  inputItem: {
    flex: 1,
    padding: "10px",
    fontSize: "0.9rem",
    borderRadius: "8px",
    border: "1px solid #ccc",
    boxSizing: "border-box",
  },
  itemRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "10px",
  },
  browseBtn: {
    padding: "6px 12px",
    fontSize: "0.85rem",
    background: "#e0e0e0",
    border: "1px solid #ccc",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
    cursor: "pointer",
    transition: "transform 0.2s, background 0.2s",
    marginLeft: "6px",
  },
  browseBtnHover: {
    background: "#d5d5d5",
    transform: "scale(1.02)",
  },
  removeBtn: {
    padding: "6px 8px",
    fontSize: "0.85rem",
    background: "#f4f4f9",
    color: "#333",
    border: "1px solid #ccc",
    borderRadius: "8px",
    cursor: "pointer",
    marginLeft: "8px",
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
  buttonRow: {
    display: "flex",
    justifyContent: "center",
    gap: "10px",
    flexWrap: "wrap",
    marginTop: "15px",
  },
  primaryBtn: {
    padding: "6px 12px",
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
    cursor: "pointer",
    fontSize: "0.9rem",
    background: "#f4f4f9",
    color: "#333",
    border: "1px solid #ccc",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
    transition: "transform 0.2s, background 0.2s",
  },
  summaryBox: {
    backgroundColor: "#fff",
    border: "1px solid #ccc",
    borderRadius: "12px",
    padding: "15px",
    marginBottom: "10px",
    width: "100%",
    maxWidth: "350px",
    overflowY: "auto",
    maxHeight: "300px",
    boxSizing: "border-box",
  },
  summaryText: {
    margin: "6px 0",
    wordWrap: "break-word",
    overflowWrap: "break-word",
  },
  itemList: {
    listStyleType: "none",
    padding: "0",
    marginLeft: "0",
  },
  listItem: {
    backgroundColor: "#ecf0f1",
    marginBottom: "5px",
    padding: "5px 8px",
    borderRadius: "4px",
    wordWrap: "break-word",
    overflowWrap: "break-word",
  },
  question: {
    margin: "10px 0",
    textAlign: "center",
  },
};

export default CreatePreset;
