import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/v1';

export const apiClient = {
  // 1. Fetch Dashboard Metrics
  async getDashboardMetrics() {
    try {
      const res = await axios.get(`${API_BASE_URL}/dashboard/metrics`);
      return res.data;
    } catch (err) {
      console.warn('Backend API unavailable, using fallback:', err);
      return null;
    }
  },

  // 2. Process Upstream CV/OCR JSON Payload
  async processDocumentPayload(payload) {
    try {
      const res = await axios.post(`${API_BASE_URL}/documents/process-document`, payload);
      return res.data;
    } catch (err) {
      console.warn('Backend process-document call error:', err);
      return null;
    }
  },

  // 3. Commit Human Review & Officer Signature
  async commitReview(recordId, correctedFields, officerName, officerRole, action = 'APPROVE') {
    try {
      const res = await axios.post(`${API_BASE_URL}/records/review/commit`, {
        record_id: recordId,
        corrected_fields: correctedFields,
        officer_name: officerName,
        officer_role: officerRole,
        action: action
      });
      return res.data;
    } catch (err) {
      console.warn('Backend review commit call error:', err);
      return null;
    }
  },

  // 4. Verify Cryptographic SHA-256 Hash Chain Integrity
  async verifyChainIntegrity(recordId) {
    try {
      const res = await axios.get(`${API_BASE_URL}/records/${recordId}/verify-chain`);
      return res.data;
    } catch (err) {
      console.warn('Backend verify-chain call error:', err);
      return null;
    }
  },

  // 5. Fetch Cadastral Parcels GeoJSON
  async getCadastralParcels() {
    try {
      const res = await axios.get(`${API_BASE_URL}/gis/parcels`);
      return res.data;
    } catch (err) {
      console.warn('Backend GIS parcels call error:', err);
      return null;
    }
  }
};
