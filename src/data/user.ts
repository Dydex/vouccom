export type VerificationStatus = "verified" | "pending" | "failed";

// TODO: read the signed-in user from the backend.
export const USER = {
  firstName: "Kola",
  fullName: "Kola Lawal",
  verified: true,
  phone: "08123458789",
  phoneVerified: true,
  email: "kolalawal@gmail.com",
  emailVerified: true,
  // Shown exactly as in the design, where the address is cut off.
  address: "Floor 3, 67B Apartment, Asa...",
  addressVerified: true,
  dateOfBirth: "January 1st 1990",
  dateOfBirthVerified: true,
  userId: "VCM0001110",
  // Identity checks.
  bvn: "verified" as VerificationStatus,
  nin: "pending" as VerificationStatus,
  governmentId: "failed" as VerificationStatus,
};
