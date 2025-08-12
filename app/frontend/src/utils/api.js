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
