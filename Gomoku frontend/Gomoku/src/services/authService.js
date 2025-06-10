import axios from "axios";

const API_URL = "http://localhost:8080/api/auth";

export const loginUser = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}/sign-in`, { email, password }, {
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true,
    });
    const { token } = response.data;
      if (token) {
        localStorage.setItem("token", token);
        localStorage.setItem("userEmail", email);
        console.log("Token saved:", token);
        console.log("Email saved:", email);
        // Thêm log để kiểm tra giá trị trong localStorage sau khi lưu
        console.log("After saving - token in localStorage:", localStorage.getItem("token"));
        console.log("After saving - userEmail in localStorage:", localStorage.getItem("userEmail"));
      }
    return response.data;
  } catch (error) {
    console.error("Login error:", error.response?.data);
    throw error.response?.data || "Login failed!";
  }
};

export const registerUser = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/sign-up`, userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || "Registration failed!";
  }
};

export const logoutUser = () => {
  console.log("Logging out - removing token and userEmail from localStorage");
  localStorage.removeItem("token");
  localStorage.removeItem("userEmail");
};