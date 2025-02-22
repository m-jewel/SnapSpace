import React, { useEffect, useState } from 'react';

function Home({ onContinue, lastPreset }) {
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hours = new Date().getHours();
    if (hours < 12) {
      setGreeting("Good morning");
    } else if (hours < 18) {
      setGreeting("Good afternoon");
    } else {
      setGreeting("Good evening");
    }
  }, []);

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>{greeting}, I’m SnapSpace!</h1>
      <p style={styles.subtitle}>
        I can help you instantly set up your workspace! 
      </p>
      {lastPreset ? (
        <button style={styles.button} onClick={() => onContinue('resume')}>
          Resume Last Used Preset: {lastPreset}
        </button>
      ) : (
        <p>No presets found yet. Click below to create or select a preset.</p>
      )}
      <button style={styles.button} onClick={() => onContinue('presets')}>
        Go to Presets
      </button>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px'
  },
  title: {
    fontSize: '2rem',
    marginBottom: '10px'
  },
  subtitle: {
    fontSize: '1rem',
    marginBottom: '20px',
    textAlign: 'center',
    maxWidth: '400px'
  },
  button: {
    padding: '10px 20px',
    margin: '10px',
    cursor: 'pointer',
    fontSize: '1rem'
  }
};

export default Home;
