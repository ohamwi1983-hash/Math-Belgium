export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function randomNonZeroInt(min: number, max: number): number {
  let n = 0;
  while (n === 0) n = randomInt(min, max);
  return n;
}
