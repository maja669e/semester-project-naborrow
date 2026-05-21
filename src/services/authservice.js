const BASE_URL = "http://localhost:8080";

export const login = async (username, password) => {
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || "Login mislykkedes.");
    }

    return response.json();
};
