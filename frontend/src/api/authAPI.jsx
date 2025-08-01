/* eslint-disable react-refresh/only-export-components */
import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5196/",
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const GetTimeRegistrationsForUser = () => API.get("/TimeRegistration");
// eslint-disable-next-line react-refresh/only-export-components
export const getAllTimeRegistrations = () => API.get("/TimeRegistration/all");
export const userLogin = (credentials) => API.post("/Auth/login", credentials);
export const userRegistration = (data) => API.post("/Auth/register", data);
export const deleteTimeRegistration = (id) =>
  API.delete(`/TimeRegistration/${id}`);
