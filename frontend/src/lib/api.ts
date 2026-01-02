const BASE_URL = "http://localhost:8000/api";

export const todoApi = {
  // 1. Saare tasks mangwane ke liye
  async getTasks(token: string) {
    const res = await fetch(`${BASE_URL}/tasks`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.json();
  },

  // 2. Naya task add karne ke liye
  async createTask(token: string, title: string) {
    const res = await fetch(`${BASE_URL}/tasks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ title }),
    });
    return res.json();
  },

  // 3. Task complete/incomplete karne ke liye
  async toggleTask(token: string, taskId: number) {
    const res = await fetch(`${BASE_URL}/tasks/${taskId}/complete`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.json();
  }
};