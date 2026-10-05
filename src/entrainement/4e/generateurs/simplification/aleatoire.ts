import { randomInt } from "../secondDegre/aleatoire";

/**
 * Racine commune p — non nulle. Voir le plan : un p nul rend certaines techniques P2
 * structurellement indiscernables de mise_en_evidence (c = a·r1·r2 = 0 dès qu'une racine est
 * nulle), ce qui casse le tirage uniforme des 4 techniques.
 */
export function tirerRacineCommune(): number {
  let p = 0;
  while (p === 0) p = randomInt(-6, 6);
  return p;
}
