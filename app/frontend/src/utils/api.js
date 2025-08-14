const BASE_URL = 'http://127.0.0.1:8001'; // backend
const token = () => localStorage.getItem('token'); // if you store one on login later

const j = r => { if (!r.ok) throw new Error('API error'); return r.json(); };
const headers = () => ({
  'Content-Type': 'application/json',
  ...(token() ? { Authorization: `Bearer ${token()}` } : {})
});

// AI: Litter validation queue
export async function getNextImageBatch({ reviewer='admin', limit=6 } = {}) {
  const q = new URLSearchParams({ reviewer, limit });
  const res = await fetch(`${BASE_URL}/ai/queue?${q.toString()}`);
  return j(res);
}
export async function submitImageReview(payload) {
  const res = await fetch(`${BASE_URL}/ai/review`, {
    method: 'POST', headers: headers(), body: JSON.stringify({ items: payload })
  });
  return j(res);
}

// AI: initiation thresholds
export async function getInitiationThresholds() {
  const res = await fetch(`${BASE_URL}/ai/initiation`);
  return j(res);
}
export async function updateInitiationThresholds(body) {
  const res = await fetch(`${BASE_URL}/ai/initiation`, {
    method: 'PUT', headers: headers(), body: JSON.stringify(body)
  });
  return j(res);
}

// AI: review history
export async function getImageReviewHistory({ limit=20 } = {}) {
  const q = new URLSearchParams({ limit });
  const res = await fetch(`${BASE_URL}/ai/review/history?${q.toString()}`);
  return j(res);
}
// AI: Image upload
export async function uploadImage(formData) {
  const res = await fetch(`${BASE_URL}/ai/upload`, {
    method: 'POST',
    body: formData // Don't set Content-Type header for FormData
  });
  return j(res);
}

export async function uploadBatchImages(files) {
  const formData = new FormData();
  files.forEach(file => {
    formData.append('files', file);
  });
  
  const res = await fetch(`${BASE_URL}/ai/upload-batch`, {
    method: 'POST',
    body: formData
  });
  return j(res);
}

// AI: Bounding boxes
export async function updateBoundingBoxes(imageId, boundingBoxes) {
  const res = await fetch(`${BASE_URL}/ai/bounding-boxes`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({
      image_id: imageId,
      bounding_boxes: boundingBoxes
    })
  });
  return j(res);
}

export async function getBoundingBoxes(imageId) {
  const res = await fetch(`${BASE_URL}/ai/image/${imageId}/bounding-boxes`);
  return j(res);
}

// AI: Model analysis
export async function analyzeImage(imageId) {
  const res = await fetch(`${BASE_URL}/ai/analyze/${imageId}`, {
    method: 'POST',
    headers: headers()
  });
  return j(res);
}

// AI: Training data export
export async function exportTrainingData(format = 'yolo') {
  const res = await fetch(`${BASE_URL}/ai/export/training-data?format=${format}`);
  return j(res);
}