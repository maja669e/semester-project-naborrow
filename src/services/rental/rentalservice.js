// Central API service til lån — alle kald til backend går gennem denne fil
const BASE_URL = "http://localhost:8080";

// Hent alle lån hvor brugeren er låneren (renter-perspektiv)
export const getRentalsByUser = async (userId) => {
  const res = await fetch(`${BASE_URL}/api/rentals/user/${userId}`);

  if (!res.ok) throw new Error("Fejl ved hentning af lån");

  return res.json();
};

// Hent alle lån på genstande ejet af brugeren (udlåner-perspektiv)
export const getRentalsByOwner = async (userId) => {
  const res = await fetch(`${BASE_URL}/api/rentals/owner/${userId}`);

  if (!res.ok) throw new Error("Fejl ved hentning af udlånte genstande");

  return res.json();
};

// Sætter et enkelt lån til "completed" — bruges til manuel afslutning under test
export const completeRental = async (rentalId) => {
  const res = await fetch(`${BASE_URL}/api/rentals/${rentalId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ Status: "completed" }),
  });

  if (!res.ok) throw new Error("Fejl ved afslutning af lån");

  return res.json();
};

export const getAllRentals = async () => {
  const res = await fetch(`${BASE_URL}/api/rentals`);

  if (!res.ok) throw new Error("Fejl ved hentning af lån");

  return res.json();
};