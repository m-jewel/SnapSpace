import React, { useRef, useState } from 'react';

/** Checks if a string is a URL (for icon images) */
function isUrl(str) {
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
}

/** Renders a preset's icon (URL => <img>, else text/emoji => <span>) */
function renderIcon(icon) {
  if (!icon) return '⚙️'; // fallback
  if (isUrl(icon)) {
    return <img src={icon} alt="icon" style={styles.iconImage} />;
  }
  return icon; // could be an emoji or text
}

/** Single card for both "most recent" and the scroller list */
function PresetCard({ preset, onLaunch, onEdit, onRemove, style }) {
  const [hover, setHover] = useState(false);

  return (
    <div
      style={{ ...styles.presetCard, ...style }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div style={styles.icon}>{renderIcon(preset.icon)}</div>
      <div style={styles.name}>{preset.name}</div>
      {preset.description && (
        <div style={styles.desc}>{preset.description}</div>
      )}
      {/* Hover-based action icons */}
      <div
        style={{
          ...styles.actionIcons,
          opacity: hover ? 1 : 0
        }}
      >
        <span
          style={styles.actionIcon}
          title="Launch"
          onClick={() => onLaunch(preset.name)}
        >
          🚀
        </span>
        <span
          style={styles.actionIcon}
          title="Edit"
          onClick={() => onEdit(preset)}
        >
          ✏️
        </span>
        <span
          style={styles.actionIcon}
          title="Remove"
          onClick={() => onRemove(preset.name)}
        >
          🗑️
        </span>
      </div>
    </div>
  );
}

function Presets({ 
  presets, 
  onBackHome, 
  onLaunch, 
  onRemove,
  onEdit,
  onCreateNew
}) {
  // Sort presets by lastUsedTime (descending)
  const sortedPresets = [...presets].sort((a, b) => {
    const aTime = a.lastUsedTime || 0;
    const bTime = b.lastUsedTime || 0;
    return bTime - aTime;
  });

  // The first item is "most recent", the rest go in the horizontal scroller
  const mostRecent = sortedPresets[0] || null;
  const otherPresets = sortedPresets.slice(1);

  // Ref for the scroller container
  const scrollerRef = useRef(null);
  const [hoverScroller, setHoverScroller] = useState(false);

  // Scroll horizontally by a fixed amount
  const scrollLeft = () => {
    if (scrollerRef.current) {
      scrollerRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };
  const scrollRight = () => {
    if (scrollerRef.current) {
      scrollerRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };

  return (
    <div style={styles.container}>
      {/* Top-left toolbar with small icon buttons */}
      <div style={styles.toolbar}>
        <button
          style={styles.iconBtn}
          onClick={onBackHome}
          title="Back to Home"
        >
          🏠
        </button>
        <button
          style={styles.iconBtn}
          onClick={onCreateNew}
          title="Create New Preset"
        >
          ➕
        </button>
      </div>

      <h2 style={styles.header}>Your Presets</h2>

      {sortedPresets.length === 0 && (
        <p style={styles.noPresets}>
          No presets found. Click <strong>➕</strong> to create one.
        </p>
      )}

      {/* Most Recent Preset */}
      {mostRecent && (
        <div style={styles.recentSection}>
          <h3 style={styles.sectionTitle}>Most Recent Preset</h3>
          <PresetCard
            preset={mostRecent}
            onLaunch={onLaunch}
            onEdit={onEdit}
            onRemove={onRemove}
            style={styles.recentCard}
          />
        </div>
      )}

      {/* Horizontal scroller for other presets */}
      {otherPresets.length > 0 && (
        <div style={styles.scrollerSection}>
          <h3 style={styles.sectionTitle}>All Presets</h3>
          <div
            style={styles.scrollerWrapper}
            onMouseEnter={() => setHoverScroller(true)}
            onMouseLeave={() => setHoverScroller(false)}
          >
            {/* Left arrow button (shows on hover) */}
            {hoverScroller && (
              <button style={{ ...styles.arrowBtn, left: 0 }} onClick={scrollLeft}>
                ◀
              </button>
            )}

            <div style={styles.scroller} ref={scrollerRef}>
              {otherPresets.map((p) => (
                <PresetCard
                  key={p.name}
                  preset={p}
                  onLaunch={onLaunch}
                  onEdit={onEdit}
                  onRemove={onRemove}
                  style={styles.scrollerCard}
                />
              ))}
            </div>

            {/* Right arrow button (shows on hover) */}
            {hoverScroller && (
              <button style={{ ...styles.arrowBtn, right: 0 }} onClick={scrollRight}>
                ▶
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// --- STYLES ---

const styles = {
  container: {
    position: 'relative',
    width: '100%',
    height: '100%',
    boxSizing: 'border-box',
    overflow: 'hidden',
    padding: '40px 20px'
  },
  toolbar: {
    position: 'absolute',
    top: '10px',
    left: '10px',
    display: 'flex',
    gap: '10px'
  },
  iconBtn: {
    background: 'none',
    border: 'none',
    fontSize: '1.5rem',
    cursor: 'pointer'
  },
  header: {
    textAlign: 'center',
    fontSize: '1.5rem',
    marginBottom: '20px'
  },
  noPresets: {
    textAlign: 'center',
    fontSize: '1rem',
    color: '#555'
  },
  // MOST RECENT
  recentSection: {
    marginBottom: '30px'
  },
  sectionTitle: {
    fontSize: '1.2rem',
    marginBottom: '10px',
    marginLeft: '10px'
  },
  recentCard: {
    margin: '0 auto',
    maxWidth: '12em'
  },
  // SCROLLER
  scrollerSection: {
    marginTop: '20px'
  },
  scrollerWrapper: {
    position: 'relative',
    margin: '0 auto',
    width: '600px',
    overflow: 'hidden'
  },
  scroller: {
    display: 'flex',
    flexWrap: 'nowrap',
    gap: '1em',
    overflowX: 'auto',
    overflowY: 'hidden',
    WebkitOverflowScrolling: 'touch',
    scrollbarWidth: 'none',
    msOverflowStyle: 'none'
  },
  scrollerCard: {
    width: '8em'
  },
  arrowBtn: {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'rgba(0, 0, 0, 0.5)',
    color: '#fff',
    border: 'none',
    borderRadius: '50%',
    width: '2em',
    height: '2em',
    cursor: 'pointer',
    fontSize: '1.2rem',
    zIndex: 10
  },
  // PRESET CARD (shared)
  presetCard: {
    fontSize: '1em',
    position: 'relative',
    backgroundColor: '#fff',
    border: '1px solid #ccc',
    borderRadius: '0.5em',
    textAlign: 'center',
    padding: '1em',
    cursor: 'default',
    width: '8em'
  },
  icon: {
    fontSize: '1.6em',
    marginBottom: '0.5em',
    minHeight: '1.6em'
  },
  iconImage: {
    width: '1.6em',
    height: '1.6em',
    objectFit: 'cover'
  },
// Title
name: {
  fontWeight: 'bold',
  marginBottom: '0.3em',
  fontSize: '1.0em'
},
desc: {
  fontSize: '0.8em',
  color: '#666',
  marginBottom: '0.5em'
},
// The container for action icons
actionIcons: {
  position: 'absolute',
  bottom: '0.5em',
  right: '0.5em',
  display: 'flex',
  gap: '0.3em',
  opacity: 0,
  transition: 'opacity 0.2s ease'
},
// Individual action icons (🚀, ✏️, 🗑️)
actionIcon: {
  /** Make them smaller so they fit inside the card nicely */
  fontSize: '0.9em',
  lineHeight: '1',
  cursor: 'pointer'
}
};

export default Presets;
