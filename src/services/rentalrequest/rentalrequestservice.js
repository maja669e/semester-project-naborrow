// Central API service - alle kald til backend går gennem denne fil ved brug af fetch
const BASE_URL = "http://localhost:8080";



// Opret låneanmodning
export const createRentalRequest = async (rentalData) => {

    const response = await fetch(
        `${BASE_URL}/api/rentalRequests`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(rentalData)
        }
    );

    if (!response.ok) {
        throw new Error(
            "Fejl ved oprettelse af låneanmodning"
        );
    }

    return response.json();
};

// Hent alle låneanmodninger
export const getAllRentalRequests = async () => {

    const response = await fetch(
        `${BASE_URL}/api/rentalRequests`
    );

    if (!response.ok) {
        throw new Error(
            "Fejl ved hentning af låneanmodninger"
        );
    }

    return response.json();
};