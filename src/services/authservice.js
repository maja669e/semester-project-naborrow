// Auth-service – håndterer API-kald til login-endpointet.
// Alle auth-relaterede kald til backend går gennem denne fil ved brug af fetch.
const BASE_URL = "http://localhost:8080";

export const login = async (email, password) => {
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || "Login mislykkedes.");
    }

    return response.json();
};
