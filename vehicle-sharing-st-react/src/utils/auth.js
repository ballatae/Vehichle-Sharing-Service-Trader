import { jwtDecode } from "jwt-decode";

export const isTokenExpired = (token) => {
  const decodedToken = jwtDecode(token);
  const currentDate = new Date();
  // Convert exp time from seconds to milliseconds
  return decodedToken.exp * 1000 < currentDate.getTime();
};

export const getToken = () => {
  return localStorage.getItem("token");
};
