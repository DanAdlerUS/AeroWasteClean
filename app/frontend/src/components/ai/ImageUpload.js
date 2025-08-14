import { useState } from 'react';

const BASE_URL = 'http://127.0.0.1:8001';

export default function ImageUpload() {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadResults, setUploadResults] = useState([]);
  const [missionId, setMissionId] = useState('');
  const [droneId, setDroneId] = useState('');
  const [coordinates, setCoordinates] = useState({ longitude: '', latitude: '' });

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    setSelectedFiles(files);
    setUploadResults([]); // Clear previous results
  };

  const handleSingleUpload = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    if (missionId) formData.append('mission_id', missionId);
    if (droneId) formData.append('drone_id', droneId);
    if (coordinates.longitude) formData.append('longitude', parseFloat(coordinates.longitude));
    if (coordinates.latitude) formData.append('latitude', parseFloat(coordinates.latitude));

    try {
      const response = await fetch(`${BASE_URL}/ai/upload`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const result = await response.json();
      return { ...result, filename: file.name };
    } catch (error) {
      return { 
        success: false, 
        filename: file.name, 
        error: error.message 
      };
    }
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      alert('Please select at least one image file');
      return;
    }

    setUploading(true);
    setUploadResults([]);

    try {
      const results = [];
      
      // Upload files one by one to show progress
      for (const file of selectedFiles) {
        const result = await handleSingleUpload(file);
        results.push(result);
        setUploadResults([...results]); // Update results in real-time
      }

    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const clearFiles = () => {
    setSelectedFiles([]);
    setUploadResults([]);
    document.getElementById('fileInput').value = '';
  };

  return (
    <div className="card">
      <h2>Upload Images for Litter Detection</h2>
      <p>Upload images to add them to the validation queue</p>

      {/* File Selection */}
      <div style={{ marginBottom: '15px' }}>
        <input
          id="fileInput"
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          style={{ marginBottom: '10px' }}
        />
        <br />
        <small style={{ color: '#666' }}>
          Supported formats: JPG, PNG, BMP. You can select multiple files.
        </small>
      </div>

      {/* Optional Metadata */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '10px', 
        marginBottom: '15px',
        padding: '15px',
        backgroundColor: '#f9f9f9',
        borderRadius: '6px'
      }}>
        <div>
          <label>Mission ID (optional):</label>
          <input
            type="text"
            value={missionId}
            onChange={(e) => setMissionId(e.target.value)}
            placeholder="e.g., mission_001"
            style={{ width: '100%', padding: '5px', marginTop: '5px' }}
          />
        </div>
        <div>
          <label>Drone ID (optional):</label>
          <input
            type="text"
            value={droneId}
            onChange={(e) => setDroneId(e.target.value)}
            placeholder="e.g., drone_001"
            style={{ width: '100%', padding: '5px', marginTop: '5px' }}
          />
        </div>
        <div>
          <label>Longitude (optional):</label>
          <input
            type="number"
            step="any"
            value={coordinates.longitude}
            onChange={(e) => setCoordinates({...coordinates, longitude: e.target.value})}
            placeholder="e.g., -0.12345"
            style={{ width: '100%', padding: '5px', marginTop: '5px' }}
          />
        </div>
        <div>
          <label>Latitude (optional):</label>
          <input
            type="number"
            step="any"
            value={coordinates.latitude}
            onChange={(e) => setCoordinates({...coordinates, latitude: e.target.value})}
            placeholder="e.g., 51.56789"
            style={{ width: '100%', padding: '5px', marginTop: '5px' }}
          />
        </div>
      </div>

      {/* File List Preview */}
      {selectedFiles.length > 0 && (
        <div style={{ marginBottom: '15px' }}>
          <h4>Selected Files ({selectedFiles.length}):</h4>
          <div style={{ maxHeight: '150px', overflowY: 'auto', border: '1px solid #ddd', padding: '10px' }}>
            {selectedFiles.map((file, index) => (
              <div key={index} style={{ 
                padding: '5px', 
                borderBottom: '1px solid #eee',
                display: 'flex',
                justifyContent: 'space-between'
              }}>
                <span>{file.name}</span>
                <span style={{ color: '#666', fontSize: '0.9em' }}>
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div style={{ marginBottom: '15px' }}>
        <button 
          onClick={handleUpload} 
          disabled={uploading || selectedFiles.length === 0}
          style={{ 
            marginRight: '10px',
            padding: '10px 20px',
            backgroundColor: uploading ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: uploading ? 'not-allowed' : 'pointer'
          }}
        >
          {uploading ? 'Uploading...' : `Upload ${selectedFiles.length} File(s)`}
        </button>
        
        <button 
          onClick={clearFiles}
          disabled={uploading}
          style={{ 
            padding: '10px 20px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: uploading ? 'not-allowed' : 'pointer'
          }}
        >
          Clear Files
        </button>
      </div>

      {/* Upload Progress/Results */}
      {uploadResults.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <h4>Upload Results:</h4>
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {uploadResults.map((result, index) => (
              <div 
                key={index} 
                style={{ 
                  padding: '10px', 
                  margin: '5px 0',
                  borderRadius: '4px',
                  backgroundColor: result.success ? '#d4edda' : '#f8d7da',
                  border: `1px solid ${result.success ? '#c3e6cb' : '#f5c6cb'}`
                }}
              >
                <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                  {result.filename}
                </div>
                
                {result.success ? (
                  <div>
                    <div style={{ color: '#155724', marginBottom: '5px' }}>
                      ✅ Upload successful
                    </div>
                    <div style={{ fontSize: '0.9em', color: '#666' }}>
                      <strong>Image ID:</strong> {result.image_id}<br />
                      <strong>URL:</strong> <a href={result.image_url} target="_blank" rel="noopener noreferrer">View Image</a>
                    </div>
                  </div>
                ) : (
                  <div style={{ color: '#721c24' }}>
                    ❌ Upload failed: {result.error}
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {uploadResults.length > 0 && !uploading && (
            <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#e9ecef', borderRadius: '4px' }}>
              <strong>Summary:</strong> {uploadResults.filter(r => r.success).length} successful, {uploadResults.filter(r => !r.success).length} failed
            </div>
          )}
        </div>
      )}

      {/* Instructions */}
      <div style={{ 
        marginTop: '20px', 
        padding: '15px', 
        backgroundColor: '#e7f3ff', 
        borderRadius: '6px',
        borderLeft: '4px solid #007bff'
      }}>
        <h4 style={{ margin: '0 0 10px 0' }}>Instructions:</h4>
        <ol style={{ margin: 0, paddingLeft: '20px' }}>
          <li>Select one or more image files from your computer</li>
          <li>Optionally fill in mission ID, drone ID, and GPS coordinates</li>
          <li>Click "Upload" to add images to the litter detection queue</li>
          <li>Once uploaded, images will appear in the "Litter Image Validation" tab</li>
          <li>Use the validation tab to classify images and draw bounding boxes</li>
        </ol>
      </div>
    </div>
  );
}