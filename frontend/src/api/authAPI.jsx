import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5196/",
});

export const userLogin = (credentials) => API.post("/Auth/Login", credentials);
export const userRegistration = (data) => API.post("/Auth/Register", data);
