const BASE_URL = "http://localhost:3000/api/auth";

export async function signUpUser(userData) {
  try {
    const response = await fetch(`${BASE_URL}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    return {
      ok: response.ok,
      data,
    };
  } catch (error) {
    console.error("Register API Error:", error);

    return {
      ok: false,
      data: {
        error: "Cannot connect to server.",
      },
    };
  }
}

export async function signInUser(userData) {
  try {
    const response = await fetch(`${BASE_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    return {
      ok: response.ok,
      data,
    };
  } catch (error) {
    console.error("Login API Error:", error);

    return {
      ok: false,
      data: {
        error: "Cannot connect to server.",
      },
    };
  }
}