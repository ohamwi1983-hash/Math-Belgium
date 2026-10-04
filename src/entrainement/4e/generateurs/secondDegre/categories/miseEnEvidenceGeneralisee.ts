import type { Exercice } from "../../../core/generateur.types";
import { randomNonZeroInt } from "../aleatoire";

/**
 * (x+p)² = m(x+p), qui se factorise toujours en (x+p)(x+p-m) = 0 — racines -p et m-p.
 * Développée : x² + (2p-m)x + (p²-mp) = 0.
 *
 * Contrairement aux 4 autres familles, invisible depuis les seuls a,b,c une fois développée
 * (rien ne distingue structurellement cette équation d'un cas général quelconque) : elle est
 * générée directement à partir de p,m, jamais déduite après coup des coefficients.
 *
 * p ≠ 0 : exclu pour rester lisible (sinon le facteur commun devient "x" seul, dégénérant vers
 * une forme d'affichage proche de mise_en_evidence sans en avoir la catégorie).
 * m ≠ 0 : sinon l'équation dégénère en (x+p)² = 0, une racine double sans second facteur distinct.
 *
 * Ne passe jamais par l'étape de reconnaissance ni par l'étape d'isolement (voir
 * necessiteReconnaissance dans src/moteur/session.ts) : l'élève voit l'énoncé sous l'une des deux
 * formes d'affichage ci-dessous et va directement au champ de factorisation.
 */
export function construireMiseEnEvidenceGeneralisee(): Exercice {
  const p = randomNonZeroInt(-6, 6);
  const m = randomNonZeroInt(-6, 6);

  const a = 1;
  const b = 2 * p - m;
  const c = p * p - m * p;

  const racineUn = -p;
  const racineDeux = m - p;

  const facteurUn = p >= 0 ? `x + ${p}` : `x - ${Math.abs(p)}`;
  const pMoinsM = p - m;
  const facteurDeux = pMoinsM >= 0 ? `x + ${pMoinsM}` : `x - ${Math.abs(pMoinsM)}`;

  const formeAffichage = Math.random() < 0.5 ? "carre_egale_expression" : "composee";

  return {
    categorie: "mise_en_evidence_generalisee",
    enonce: { a, b, c },
    solution: {
      formeFactorisee: `(${facteurUn})(${facteurDeux})`,
      racines: racineUn < racineDeux ? [racineUn, racineDeux] : [racineDeux, racineUn],
      racinesExactes: true,
    },
    formeAffichage,
    parametresAffichage: { p, m },
  };
}
