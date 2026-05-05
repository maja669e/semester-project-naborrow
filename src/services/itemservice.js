// Central API service - alle kald til backend går gennem denne fil ved brug af fetch
const BASE_URL = "http://localhost:8080";

// Hent alle aktive items
export const getAllItems = async () => {
    const response = await fetch(`${BASE_URL}/api/items`);
    if (!response.ok) throw new Error("Fejl ved hentning af genstande");
        return response.json();
    }

// Hent én genstand med billeder og tilbehør
export const getItemById = async (id) => {
    const response = await fetch(`${BASE_URL}/api/items/${id}`);
    if (!response.ok) throw new Error("Fejl ved hentning af genstand");
    return response.json();
};

// Opret ny genstand
export const createItem = async (itemData) => {
    const response = await fetch(`${BASE_URL}/api/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(itemData)
    });
    if (!response.ok) throw new Error("Fejl ved oprettelse af genstand");
    return response.json();
};

// Opdater genstand
export const updateItem = async (id, itemData) => {
    const response = await fetch(`${BASE_URL}/api/items/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(itemData)
    });
    if (!response.ok) throw new Error("Fejl ved opdatering af genstand");
    return response.json();
};

// Slet genstand
export const deleteItem = async (id) => {
    const response = await fetch(`${BASE_URL}/api/items/${id}`, {
        method: "DELETE"
    });
    if (!response.ok) throw new Error("Fejl ved sletning af genstand");
    return response.json();
};

// Skift IsActive (aktiv/inaktiv toggle)
export const toggleItemActive = async (id, isActive) => {
    const response = await fetch(`${BASE_URL}/api/items/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ IsActive: isActive })
    });
    if (!response.ok) throw new Error("Fejl ved opdatering af status");
    return response.json();
};

// ── CATEGORIES ─────────────────────────────────────────

// Hent alle kategorier
export const getAllCategories = async () => {
    const response = await fetch(`${BASE_URL}/api/categories`);
    if (!response.ok) throw new Error("Fejl ved hentning af kategorier");
    return response.json();
};

// ── ACCESSORIES ────────────────────────────────────────

// Opret tilbehør
export const createAccessory = async (data) => {
    const response = await fetch(`${BASE_URL}/api/accessories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error("Fejl ved oprettelse af tilbehør");
    return response.json();
};