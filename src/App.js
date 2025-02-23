import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Home from "./Home";
import Presets from "./Presets";
import CreatePreset from "./CreatePreset";
import EditPreset from "./EditPreset";

function App() {
  // --- STATE MANAGEMENT ---
  const [presets, setPresets] = useState([]);
  const [view, setView] = useState("home"); // possible views: 'home', 'presets', 'create', 'edit'
  const [lastUsedPreset, setLastUsedPreset] = useState(null);
  const [createReturnView, setCreateReturnView] = useState("home"); // Track where to return after creating
  const [presetToEdit, setPresetToEdit] = useState(null); // For editing

  // --- LOAD INITIAL DATA ---
  useEffect(() => {
    window.electronAPI.receive("update-preset", (data) => setPresets(data));
    window.electronAPI.getPresets().then((data) => setPresets(data));

    const storedPreset = localStorage.getItem("lastUsedPreset");
    if (storedPreset) setLastUsedPreset(storedPreset);
  }, []);

  // --- HANDLERS ---
  // --- Launch Preset ---
  const handleLaunch = (name) => {
    const updatedPresets = presets.map((preset) =>
      preset.name === name ? { ...preset, lastUsedTime: Date.now() } : preset
    );
    setPresets([...updatedPresets]);
    localStorage.setItem("lastUsedPreset", name);
    setLastUsedPreset(name);

    window.electronAPI.updatePreset({ presets: updatedPresets });
    window.electronAPI.launchPreset(name).then((response) => {
      if (!response.success) {
        toast.error(`Failed to launch ${name}: ${response.message}`);
      }
    });
  };

  // --- Home Navigation ---
  const handleContinue = (action) => {
    if (action === "resume" && lastUsedPreset) {
      handleLaunch(lastUsedPreset);
    } else {
      setView("presets");
    }
  };

  // --- Create Preset Flow ---
  const handleCreatePresetClick = (returnView) => {
    setCreateReturnView(returnView);
    setView("create");
  };

  const handleCreateDone = (options) => {
    refreshPresets();
    if (options.action === "launch" && options.newPresetName) {
      handleLaunch(options.newPresetName);
    }
    setView(createReturnView);
  };

  const handleCreateCancel = () => {
    setView(createReturnView);
  };

  // --- Edit Preset Flow ---
  const handleEditPreset = (preset) => {
    setPresetToEdit(preset);
    setView("edit");
  };

  const handleEditDone = () => {
    refreshPresets();
    setView("presets");
  };

  // --- Remove Preset ---
  const handleRemovePreset = (name) => {
    window.electronAPI
      .removePreset(name)
      .then((response) => {
        if (!response.success) {
          toast.error(`Failed to remove preset: ${response.message}`);
        } else {
          refreshPresets();
          toast.success(`Preset "${name}" removed successfully!`);
        }
      })
      .catch((error) => {
        toast.error(`Error: ${error.message}`);
      });
  };

  // --- Helper: Refresh Presets ---
  const refreshPresets = () => {
    window.electronAPI.getPresets().then((data) => setPresets(data));
  };

  // --- RENDER VIEWS ---
  switch (view) {
    case "edit":
      return (
        <EditPreset
          preset={presetToEdit}
          onSave={handleEditDone}
          onCancel={() => setView("presets")}
          existingPresets={presets}
        />
      );

    case "create":
      return (
        <CreatePreset
          onDone={handleCreateDone}
          onCancel={handleCreateCancel}
          existingPresets={presets}
        />
      );

    case "presets":
      return (
        <Presets
          presets={presets}
          onBackHome={() => setView("home")}
          onLaunch={handleLaunch}
          onRemove={handleRemovePreset}
          onEdit={handleEditPreset}
          onCreateNew={() => handleCreatePresetClick("presets")}
        />
      );

    case "home":
    default:
      return (
        <Home
          onContinue={handleContinue}
          lastPreset={lastUsedPreset}
          hasPresets={presets.length > 0}
          onCreateNew={() => handleCreatePresetClick("home")}
        />
      );
  }
}

export default App;
