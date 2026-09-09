// Central REST API Service for DigiLand FastAPI Backend & Database
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

export async function processPipelineApi(payload) {
  try {
    const res = await fetch(`${API_BASE_URL}/ocr/process-full-pipeline`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn("Backend API offline or unreachable, using local fallback pipeline:", err);
    return null;
  }
}

export async function fetchAllRecordsApi(query = "") {
  try {
    const url = query ? `${API_BASE_URL}/records?q=${encodeURIComponent(query)}` : `${API_BASE_URL}/records`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn("Backend API offline, using seed records:", err);
    return null;
  }
}

export async function commitReviewApi(reviewPayload) {
  try {
    const res = await fetch(`${API_BASE_URL}/records/review/commit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reviewPayload)
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn("Backend review commit API offline, using local digital sign:", err);
    return null;
  }
}

export async function fetchAuditTrailApi() {
  try {
    const res = await fetch(`${API_BASE_URL}/records/audit-trail/all`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn("Backend audit trail API offline:", err);
    return null;
  }
}

export async function deleteRecordApi(recordId) {
  try {
    const res = await fetch(`${API_BASE_URL}/records/${recordId}`, {
      method: "DELETE"
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn("Backend delete record API offline:", err);
    return null;
  }
}

export async function purgeDuplicatesApi() {
  try {
    const res = await fetch(`${API_BASE_URL}/records/purge-duplicates`, {
      method: "POST"
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn("Backend purge duplicates API offline:", err);
    return null;
  }
}

export async function resetRegistryApi() {
  try {
    const res = await fetch(`${API_BASE_URL}/records/reset-registry`, {
      method: "POST"
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn("Backend reset registry API offline:", err);
    return null;
  }
}
