import type { ExerciceEqLogC } from "../../../core6e/equationsExpLog.types";
import { tirerEntier, tirerParmi } from "../aleatoire";

const BASES_C = [2, 3, 5, Math.E] as const;

/** Tire un candidat `t` — mélange de 3 pools pour obtenir NATURELLEMENT (sans forcer de quota) une
 * variabilité 0/1/2 racines valides, certaines reconnaissables comme puissance de la base, d'autres
 * non : `[-6,0]` (toujours invalide, `t≤0`), `[1,10]` (souvent une puissance reconnaissable pour une
 * base entière petite), `[11,40]` (presque jamais une puissance reconnaissable). Les valeurs
 * restent TOUJOURS entières (y compris pour base=e) — voir `estPuissanceEntiereDe` : pour base=e,
 * seul t=1 (k=0) sera jamais reconnu comme puissance propre, reflet fidèle du fait que e^k (k≠0)
 * n'est jamais un entier. */
function tirerCandidatT(): number {
  const zone = tirerParmi(["invalide", "petit", "grand"] as const);
  if (zone === "invalide") return tirerEntier(-6, 0);
  if (zone === "petit") return tirerEntier(1, 10);
  return tirerEntier(11, 40);
}

/** Famille C — changement de variable `t=base^x`, équation canonique `A·t²+B·t+Cc=0` construite
 * DEPUIS 2 racines `t1`,`t2` cibles (tirées indépendamment, potentiellement égales — retirées si
 * confondues pour garder 2 racines réelles DISTINCTES, comme au chapitre 2) — "génération par
 * construction", jamais un tirage brut de A/B/Cc vérifié après coup. */
export function construireC(): ExerciceEqLogC {
  const base = tirerParmi(BASES_C);
  let t1 = tirerCandidatT();
  let t2 = tirerCandidatT();
  while (t2 === t1) t2 = tirerCandidatT();

  const A = tirerEntier(1, 3);
  const B = -A * (t1 + t2);
  const Cc = A * t1 * t2;

  const tValides = [t1, t2].filter((t) => t > 0).sort((a, b) => a - b);
  const xValides = tValides.map((t) => Math.log(t) / Math.log(base));

  return { famille: "C", base, A, B, Cc, tValides, xValides };
}
