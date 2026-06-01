import { fetcher } from "../lib/fetcher";

const BASE_URL =`${import.meta.env.VITE_API_URL}/api/auth`;

export function signInUser(userData) {
  return fetcher(`${BASE_URL}/login`, {
    method: "POST",
    body: JSON.stringify(userData),
  });
}

export function signUpUser(userData) {
  return fetcher(`${BASE_URL}/register`, {
    method: "POST",
    body: JSON.stringify(userData),
  });
}