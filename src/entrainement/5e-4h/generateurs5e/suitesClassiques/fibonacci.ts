import type { ExerciceFibonacci } from "../../core5e/suitesClassiques.types";

function dixPremiersTermesFibonacci(): number[] {
  const termes = [1, 1];
  while (termes.length < 10) {
    const n = termes.length;
    termes.push(termes[n - 2] + termes[n - 1]);
  }
  return termes;
}

/** Scénario 5 — la suite de Fibonacci. u1=u2=1, u_n=u_(n-2)+u_(n-1). phi (le nombre d'or) est la
 * racine POSITIVE de x²=x+1 ⟺ x²-x-1=0, dérivée par la formule quadratique générale. */
export function construireFibonacci(): ExerciceFibonacci {
  const dixPremiersTermes = dixPremiersTermesFibonacci();
  const v5 = dixPremiersTermes[5] / dixPremiersTermes[4]; // u6/u5
  const discriminant = 1 - 4 * 1 * -1; // b²-4ac pour x²-x-1=0
  const phi = (1 + Math.sqrt(discriminant)) / 2;
  return { scenario: "fibonacci", dixPremiersTermes, v5, phi };
}
