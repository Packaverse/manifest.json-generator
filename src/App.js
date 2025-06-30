import React, { useState } from 'react';
import './App.css';

function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function App() {
  const [packName, setPackName] = useState('');
  const [description, setDescription] = useState('');
  const [version, setVersion] = useState('1.0.0');
  const [subpacks, setSubpacks] = useState([]);
  const [manifestJson, setManifestJson] = useState('');
  const [downloadUrl, setDownloadUrl] = useState('');

  const addSubpack = () => {
    setSubpacks([...subpacks, { name: '', folder: '' }]);
  };

  const removeSubpack = index => {
    const newSubpacks = [...subpacks];
    newSubpacks.splice(index, 1);
    setSubpacks(newSubpacks);
  };

  const updateSubpack = (index, key, value) => {
    const newSubpacks = [...subpacks];
    newSubpacks[index][key] = value;
    setSubpacks(newSubpacks);
  };

  const generateManifest = () => {
    const [major, minor, patch] = version.split('.').map(n => parseInt(n) || 0);
    const validSubpacks = subpacks.filter(sp => sp.name && sp.folder).map(sp => ({
      folder_name: sp.folder,
      name: sp.name,
      memory_tier: 1
    }));

    const manifest = {
      format_version: 2,
      header: {
        name: packName || 'Unnamed Pack',
        description: description || 'No description.',
        uuid: uuidv4(),
        version: [major, minor, patch],
        min_engine_version: [1, 16, 0]
      },
      modules: [
        {
          type: 'resources',
          uuid: uuidv4(),
          version: [major, minor, patch]
        }
      ]
    };

    if (validSubpacks.length > 0) {
      manifest.subpacks = validSubpacks;
    }

    const json = JSON.stringify(manifest, null, 2);
    setManifestJson(json);

    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    setDownloadUrl(url);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(manifestJson);
    alert('Copied manifest to clipboard!');
  };

  return (
    <div className="App">
      <h1>Manifest Generator</h1>
      <label>Pack Name:</label>
      <input value={packName} onChange={e => setPackName(e.target.value)} placeholder="My Custom Pack" />

      <label>Description:</label>
      <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="A short description of your pack."></textarea>

      <label>Version (e.g. 1.0.0):</label>
      <input value={version} onChange={e => setVersion(e.target.value)} />

      <label>Subpacks:</label>
      {subpacks.map((sp, i) => (
        <div key={i} className="subpack">
          <div className="delete-btn" onClick={() => removeSubpack(i)}>×</div>
          <label>Subpack Name:</label>
          <input value={sp.name} onChange={e => updateSubpack(i, 'name', e.target.value)} placeholder="High Res, Low Res, etc." />
          <label>Folder Path:</label>
          <input value={sp.folder} onChange={e => updateSubpack(i, 'folder', e.target.value)} placeholder="subpacks/high_res" />
        </div>
      ))}
      <button className="btn-secondary" onClick={addSubpack}>+ Add Subpack</button>

      <button className="btn-primary" onClick={generateManifest}>Generate manifest.json</button>

      {downloadUrl && <div id="downloadLink">
        <a href={downloadUrl} download="manifest.json">⬇️ Download manifest.json</a>
      </div>}

      <div className="preview">
        <h3>Preview:</h3>
        <pre>{manifestJson || '// Generated JSON will appear here'}</pre>
        {manifestJson && <button className="btn-secondary" onClick={copyToClipboard}>📋 Copy to Clipboard</button>}
      </div>
    </div>
  );
}

export default App;
