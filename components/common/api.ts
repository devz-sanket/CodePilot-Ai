import axios from "axios";

const API = axios.create({ baseURL: "http://localhost:5000" });

export const signup = (data: { name: string; email: string; password: string }) =>
  API.post("/signup", data);

export const login = (data: { email: string; password: string }) =>
  API.post("/login", data);
