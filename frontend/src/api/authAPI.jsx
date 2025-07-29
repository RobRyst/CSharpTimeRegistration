import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5196/",
});

export const userLogin = (credentials) => API.post("/Auth/login", credentials);
export const userRegistration = (data) => API.post("/Auth/register", data);
