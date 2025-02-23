import React, { useEffect, useState } from "react";
import Home from "./Home";
import Presets from "./Presets";
import CreatePreset from "./CreatePreset";
import EditPreset from "./EditPreset";
import React, { useEffect, useState } from "react";
import Home from "./Home";
import Presets from "./Presets";
import CreatePreset from "./CreatePreset";
import EditPreset from "./EditPreset";

function App() {
  const [presets, setPresets] = useState([]);
  const [view, setView] = useState("home");
  // possible views: 'home', 'presets', 'create', 'edit'


  const [lastUsedPreset, setLastUsedPreset] = useState(null);

  // We'll store where we came from before going to 'create'
  const [createReturnView, setCreateReturnView] = useState("home");
  const [createReturnView, setCreateReturnView] = useState("home");

  // For editing
  const [presetToEdit, setPresetToEdit] = useState(null);

  useEffect(() => {
    // Listen for updates from main process
    window.electronAPI.receive("update-preset", (data) => {
      console.log("Presets updated:", data);
      setPresets(data);
    });
    window.electronAPI.getPresets().then((data) => setPresets(data));
    const storedPreset = localStorage.getItem("lastUsedPreset");
    if (storedPreset) {
      setLastUsedPreset(storedPreset);
    }
  }, []);

  // --- LAUNCH PRESET ---
  const handleLaunch = (name) => {
    localStorage.setItem("lastUsedPreset", name);
    setLastUsedPreset(name);
    window.electronAPI.launchPreset(name).then((response) => {
      if (!response.success) {
        alert(`Failed to update presets: ${response.message}`);
      }
    });

    // Launch the preset after updating
    window.electronAPI
      .launchPreset(name)
      .then((response) => {
        if (!response.success) {
          alert(`Failed to launch ${name}: ${response.message}`);
        }
      })
      .catch((err) => console.error("Launch Error:", err));
  };

  // --- HOME FLOW ---
  const handleContinue = (action) => {
    if (action === "resume" && lastUsedPreset) {
    if (action === "resume" && lastUsedPreset) {
      handleLaunch(lastUsedPreset);
    } else {
      setView("presets");
      setView("presets");
    }
  };

  // --- PRESETS FLOW ---
  const handleRemovePreset = (name) => {
    if (window.confirm(`Remove preset "${name}"?`)) {
      window.electronAPI.removePreset(name).then((response) => {
      window.electronAPI.removePreset(name).then((response) => {
        if (!response.success) {
          alert(`Failed to remove preset: ${response.message}`);
        } else {
          refreshPresets();
        }
      });
    }
  };

  // --- CREATE PRESET FLOW ---
  // We track where the user came from (home or presets) so we know where to return after creation/cancel
  const handleCreatePresetClick = (returnView) => {
    setCreateReturnView(returnView);
    setView("create");
    setCreateReturnView(returnView);
    setView("create");
  };

  // Called when user finishes creating a preset
  const handleCreateDone = (options) => {
    refreshPresets();
    if (options.action === "launch" && options.newPresetName) {
    if (options.action === "launch" && options.newPresetName) {
      handleLaunch(options.newPresetName);
    }
    // Instead of going to 'home', we go back to the stored createReturnView
    setView(createReturnView);
  };

  // Called if user cancels creation
  const handleCreateCancel = () => {
    setView(createReturnView);
  };

  // --- EDIT PRESET FLOW ---
  const handleEditDone = () => {
    refreshPresets();
    // After editing, let's go back to the Presets list or wherever you want
    setView("presets");
    setView("presets");
  };

  // --- HELPER: REFRESH PRESETS ---
  const refreshPresets = () => {
    window.electronAPI.getPresets().then((data) => setPresets(data));
  };

  // --- RENDER VIEWS ---
  if (view === "edit") {
  if (view === "edit") {
    return (
      <EditPreset
        preset={presetToEdit}
        onSave={handleEditDone}
        onCancel={() => setView("presets")}
        onCancel={() => setView("presets")}
      />
    );
  }

  if (view === "create") {
  if (view === "create") {
    return (
      <CreatePreset
        key={view + Math.random()}
        onDone={handleCreateDone}
        onCancel={handleCreateCancel}
      />
    );
  }

  if (view === "presets") {
  if (view === "presets") {
    return (
      <Presets
        presets={presets}
        onBackHome={() => setView("home")}
        onBackHome={() => setView("home")}
        onLaunch={handleLaunch}
        onRemove={handleRemovePreset}
        onEdit={(p) => {
          setPresetToEdit(p);
          setView("edit");
          setView("edit");
        }}
        onCreateNew={() => handleCreatePresetClick("presets")}
        onCreateNew={() => handleCreatePresetClick("presets")}
      />
    );
  }

  // Default: home
  return (
    <Home
      onContinue={handleContinue}
      lastPreset={lastUsedPreset}
      hasPresets={presets.length > 0}
      // If user clicks "Create New Preset" from Home, we return to home after
      onCreateNew={() => handleCreatePresetClick("home")}
      onCreateNew={() => handleCreatePresetClick("home")}
    />
  );
}

export default App;

