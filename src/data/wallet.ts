// TODO: read the signed-in user's wallet balance and saved cards from the backend.
export const WALLET_BALANCE = 125000;

export type SavedCard = { id: string; brand: "VISA"; last4: string };

export const SAVED_CARDS: SavedCard[] = [
  { id: "card-8719", brand: "VISA", last4: "8719" },
];
