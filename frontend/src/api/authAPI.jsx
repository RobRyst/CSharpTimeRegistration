/* eslint-disable react-refresh/only-export-components */
import axios from "axios";

const API = axios.create({ baseURL: "http://localhost:5196/" });

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const GetTimeRegistrationsForUser = () => API.get("/TimeRegistration");
export const getAllTimeRegistrations = () => API.get("/TimeRegistration/all");
export const GetAllProjects = () => API.get("/Project/all");
export const userLogin = (credentials) => API.post("/Auth/login", credentials);
export const userRegistration = (data) => API.post("/Auth/register", data);
export const deleteTimeRegistration = (id) =>
  API.delete(`/TimeRegistration/${id}`);
export const getProjectTotals = () => API.get("/Statistics/project-hours");
export const getUserTotalsForProject = (projectId) =>
  API.get(`/Statistics/project/${projectId}/user-hours`);
export const getSingleUserProjectHours = (projectId, userId) =>
  API.get(`/Statistics/project/${projectId}/user/${userId}/hours`);
export const createProject = (data) => API.post("/Project", data);
export const updateProject = (id, data) => API.put(`/Project/${id}`, data);
export const deleteProjectById = (id) => API.delete(`/Project/${id}`);
export const updateTimeStatus = (id, status) =>
  API.put(`/TimeRegistration/${id}/status`, { status });
export const GetAvailableProjects = () => API.get("/Project/available");
export const exportProjectsPdf = (status) =>
  API.get(
    `/TimeRegistration/overview.pdf${
      status ? `?status=${encodeURIComponent(status)}` : ""
    }`,
    {
      responseType: "blob",
    }
  );
export const exportUserHoursPdf = (projectId) =>
  API.get(`/Statistics/project/${projectId}/user-hours.pdf`, {
    responseType: "blob",
  });
export const updateTimeRegistration = (id, data) =>
  API.put(`/TimeRegistration/${id}`, data);
