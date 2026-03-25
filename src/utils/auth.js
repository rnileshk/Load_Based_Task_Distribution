export function getUserRole() {
  const token = localStorage.getItem("token");

  if (!token) return null;

  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");

    const payload = JSON.parse(window.atob(base64));

    console.log("DECODED TOKEN:", payload); // debug

    return payload.role;
  } catch (error) {
    console.log("TOKEN DECODE ERROR:", error);
    return null;
  }
}