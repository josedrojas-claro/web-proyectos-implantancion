import axios from "axios";
import Cookies from "js-cookie";
import CryptoJS from "crypto-js";

const API = import.meta.env.VITE_API_dev;

export const login = async (email, password) => {
  const res = await axios.post(`${API}/auth/login`, { email, password });
  // Guarda el token en una cookie
  const token = res.data.token;
  Cookies.set("token", token, { expires: 1 }); // 1 día
  return res;
};

export const checkAuth = async () => {
  const res = await axios.get(`${API}/checktoken`);
  return res.data;
};

export const logout = async () => {
  Cookies.remove("token");
  return true;
};
