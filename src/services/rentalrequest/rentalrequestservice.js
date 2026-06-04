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


// Hent antal afventende anmodninger til dashboard-boksen på ejers oversigt
export const getPendingCountByOwner = async (userId) => {
  const res = await fetch(`${BASE_URL}/api/rentalRequests/owner/${userId}/pending-count`);

  if (!res.ok) throw new Error("Fejl ved hentning af pending count");

  return res.json();
};

// Hent alle afventende anmodninger for ejeren — bruges på anmodningssiden
export const getPendingRequestsByOwner = async (userId) => {
  const res = await fetch(`${BASE_URL}/api/rentalRequests/owner/${userId}/pending`);

  if (!res.ok) throw new Error("Fejl ved hentning af requests");

  return res.json();
};

// Godkend en låneanmodning
export const acceptRentalRequest = async (id) => {
  const res = await fetch(`${BASE_URL}/api/rentalRequests/${id}/accept`, {
    method: "PUT",
  });

  if (!res.ok) throw new Error("Fejl ved accept");

  return res.json();
};

// Afvis en låneanmodning
export const rejectRentalRequest = async (id) => {
  const res = await fetch(`${BASE_URL}/api/rentalRequests/${id}/reject`, {
    method: "PUT",
  });

  if (!res.ok) throw new Error("Fejl ved reject");

  return res.json();
};