import type { ExerciceEtudeLogE } from "../../../core6e/etudeFonctionLogarithme.types";
import { ensembleReel } from "../../ensembleReel";
import { tirerParmi } from "../aleatoire";

const A_VALEURS = [-2, -1, 1, 2] as const;
const TRIG_VALEURS = ["sin", "cos"] as const;

/**
 * Famille E — `f(x) = e^(ax)·trig(x)`, a≠0, trig∈{sin,cos}. Nature différente des familles A-D :
 * oscillation amortie/amplifiée, sans tableau de variation possible (f' s'annule une infinité de
 * fois) et sans limite du tout dans une direction — traitement volontairement allégé (2 écrans,
 * qualitatif seulement, jamais de QCM graphique).
 *
 * **Comportement à chaque infini** : `|f(x)| ≤ |e^(ax)|` toujours (l'enveloppe encadre
 * l'oscillation, |trig(x)|≤1). Dans la direction où l'enveloppe |e^(ax)|→0, f est COINCÉE entre
 * deux quantités qui tendent vers 0 — par encadrement, f→0. Dans la direction où l'enveloppe
 * explose, l'oscillation continue indéfiniment (trig(x) ne cesse jamais d'osciller entre -1 et 1)
 * pendant que l'amplitude grandit sans borne — AUCUNE limite n'existe (ni finie, ni infinie).
 *
 * a<0 : e^(ax)→0 quand x→+∞ (enveloppe amortie côté +∞) et e^(ax)→+∞ quand x→-∞ (amplifiée côté
 * -∞) — donc limite=0 en +∞, n'existe pas en -∞. a>0 : l'inverse.
 */
export function construireE(): ExerciceEtudeLogE {
  const a = tirerParmi(A_VALEURS);
  const trig = tirerParmi(TRIG_VALEURS);

  const comportement = a < 0 ? { moinsInfini: "nexiste_pas" as const, plusInfini: "zero" as const } : { moinsInfini: "zero" as const, plusInfini: "nexiste_pas" as const };

  return {
    famille: "E",
    a,
    trig,
    domaine: ensembleReel(),
    comportement,
  };
}

export { A_VALEURS as E_A_VALEURS, TRIG_VALEURS as E_TRIG_VALEURS };
