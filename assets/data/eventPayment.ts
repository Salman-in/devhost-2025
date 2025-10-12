export interface EventDetail {
  min: number;
  max: number;
  amount: number; // per head
}

export const eventDetails: Record<number, EventDetail> = {
  // 1: { min: 4, max: 4, amount: 500 },
  // 2: { min: 1, max: 2, amount: 200 },
  // 3: { min: 2, max: 4, amount: 200 },
  // 4: { min: 1, max: 2, amount: 200 },
  // 5: { min: 1, max: 2, amount: 200 },
  1: { min: 4, max: 4, amount: 450 },
  2: { min: 1, max: 2, amount: 150 },
  3: { min: 2, max: 4, amount: 150 },
  4: { min: 1, max: 2, amount: 150 },
  5: { min: 1, max: 2, amount: 150 },
};
