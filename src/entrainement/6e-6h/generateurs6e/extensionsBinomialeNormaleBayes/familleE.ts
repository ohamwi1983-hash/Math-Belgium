import type { ContexteExtE, ExerciceExtE } from "../../core6e/extensionsBinomialeNormaleBayes.types";
import { tirerEntier, tirerParmi } from "./aleatoire";

/**
 * Couche A (6e) — génération famille E ("Loi uniforme continue") pour `6gen52`. NOUVEAUTÉ : aucun
 * générateur précédent du chantier 6e ne couvrait la loi uniforme continue — pas de réutilisation
 * possible ici, famille écrite entièrement pour `6gen52`.
 *
 * X~Uniforme([a,b]), densité constante `1/(b-a)`. `a≤c<d≤b` tirés entiers — `P(c≤X≤d)=(d-c)/(b-a)`
 * (rapport des longueurs, indépendant de la position dans [a,b]). `[a,b]` toujours `[0,b]` (spec :
 * "souvent [0;1] ou [0;60]") — bornes ENTIÈRES uniquement ici (jamais `[0;1]` avec `c`/`d` décimaux) :
 * simplification délibérée, documentée dans `docs/historique-6e.md`, qui garde `c`/`d` entiers et
 * évite d'introduire un format de saisie décimal supplémentaire pour cette seule famille.
 */

const CONTEXTES_E: readonly ContexteExtE[] = [
  { id: "attenteBus", texte: "Le temps d'attente à un arrêt de bus est uniformément réparti.", variable: "le temps d'attente", unite: "min" },
  { id: "cycleMachine", texte: "La durée d'un cycle de production d'une machine est uniformément répartie.", variable: "la durée du cycle", unite: "min" },
  { id: "positionAiguille", texte: "La position d'arrêt d'une aiguille sur un cadran gradué est uniformément répartie.", variable: "la position d'arrêt", unite: "cm" },
];

const CANDIDATS_B: readonly number[] = [10, 20, 30, 40, 50, 60, 80, 100];

/** Construction déterministe (`b`/`c`/`d` fixés, `a=0` toujours) — utilisée par
 * `CATALOGUE_VARIANTES`/`construireAvecVarianteId`. */
export function construireAvecValeurs(b: number, c: number, d: number, contexte?: ContexteExtE): ExerciceExtE {
  return { famille: "E", contexte: contexte ?? tirerParmi(CONTEXTES_E), a: 0, b, c, d };
}

export function construireFamilleE(): ExerciceExtE {
  const b = tirerParmi(CANDIDATS_B);
  const c = tirerEntier(0, b - 2);
  const d = tirerEntier(c + 1, b);
  return construireAvecValeurs(b, c, d);
}
