import axios from "axios";
import Cookies from "js-cookie";

const API = import.meta.env.VITE_API_dev;

export const login = async (email, password) => {
  const res = await axios.post(`${API}/auth/login`, { email, password });
  // Guarda el token en una cookie
  const token = res.data.token;
  const User = res.data.User;
  console.log("Token:", res);
  Cookies.set("token", token, { expires: 1 }); // 1 día
  localStorage.setItem("user", JSON.stringify(User));

  return res;
};

export const checkAuth = async () => {
  const res = await axios.get(`${API}/checktoken`);
  return res.data;
};

export const logout = async () => {
  Cookies.remove("token");
  localStorage.removeItem("user");
  return true;
};

export const useAuthUser = () => {
  const userRaw = localStorage.getItem("user");
  return userRaw ? JSON.parse(userRaw) : null;
};
