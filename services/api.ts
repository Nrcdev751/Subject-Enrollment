import { CapturedImage, UserSummary } from '../types';

// ============================================================================
// ⚠️ IMPORTANT: CHANGE THIS IP ADDRESS IF TESTING ON MOBILE ⚠️
// Use your computer's local IP (e.g., 'http://192.168.1.15:8000')
// 'localhost' only works if the browser is on the same machine as the server.
// ============================================================================
const SERVER_IP = 'localhost'; 
const API_URL = `http://${SERVER_IP}:8000`;
const WS_URL = `ws://${SERVER_IP}:8000/ws/updates`;

export const api = {
  // Check if server is running
  async healthCheck() {
    try {
        const res = await fetch(`${API_URL}/`);
        return res.ok;
    } catch (e) {
        return false;
    }
  },

  async enrollUser(name: string, images: CapturedImage[]) {
    try {
      const imagePayload = images.map(img => img.original);
      const response = await fetch(`${API_URL}/enroll`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, images: imagePayload }),
      });
      if (!response.ok) throw new Error("Server error");
      return response.json();
    } catch (e) {
      console.error("Enrollment Error. Ensure 'backend/main.py' is running.", e);
      throw e;
    }
  },

  async trainModel() {
    try {
      const response = await fetch(`${API_URL}/train`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error("Training request rejected");
      return response.json();
    } catch (e) {
      console.error("Training Error. Ensure 'backend/main.py' is running.", e);
      throw e;
    }
  },

  async recognize(imageBase64: string) {
    try {
      const response = await fetch(`${API_URL}/recognize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imageBase64 }),
      });
      if (!response.ok) throw new Error("Recog fail");
      return response.json();
    } catch (e) {
      // Return a safe fallback so the UI doesn't crash, but indicates error
      return { name: "CONNECTION LOST", match: false, confidence: 0 };
    }
  },
  
  async getAllUsers(): Promise<UserSummary[]> {
    try {
      const response = await fetch(`${API_URL}/users`);
      if (!response.ok) return [];
      return response.json();
    } catch (e) {
      console.error("Fetch Users Error. Backend likely offline.", e);
      return [];
    }
  },
  
  connectWebSocket(onMessage: (data: any) => void) {
    if (typeof WebSocket === 'undefined') return { close: () => {} };

    try {
        const ws = new WebSocket(WS_URL);
        ws.onopen = () => console.log("Connected to Neural Core Stream");
        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                onMessage(data);
            } catch (e) {
                console.error("WS Parse Error", e);
            }
        };
        ws.onerror = (e) => console.error("WebSocket Error - Is backend running?", e);
        return ws;
    } catch (e) {
        console.error("WebSocket Connection Failed", e);
        return { close: () => {} };
    }
  }
};
