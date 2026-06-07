const BASE_URL = "http://localhost:8080";
export const getRentalsByUser = async (userId) => {
  const res = await fetch(
    `${BASE_URL}/api/rentals/user/${userId}`
  );

  if (!res.ok) {
    throw new Error("Fejl ved hentning af lån");
  }

  return res.json();
};

export const getAllRentals = async () => {
  const res = await fetch(`${BASE_URL}/api/rentals`);

  if (!res.ok) {
    throw new Error("Fejl ved hentning af lån");
  }

  return res.json();
};