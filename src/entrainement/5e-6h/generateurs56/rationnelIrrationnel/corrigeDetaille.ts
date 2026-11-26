import type { EtapeCorrection } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise } from "../../../export/corrigeTableau";
import { PHASES_RATIONNEL } from "./core/types";
import type { ExerciceRationnel, FamilleNombre } from "./core/types";
import { nombreDe, reponse } from "./ui/format";

/**
 * Corrigé détaillé « comme au tableau » de `56gen14`, une lettre par écran (un nombre) : ce qu'on
 * utilise (renvoi au cours), la simplification ligne à ligne, le résultat (nombre simplifié et plus
 * petit ensemble, avec sa raison), le piège du nombre. Source unique de l'écran et du papier.
 */

const t = texte;
const f = latex;
const LETTRES = "abcd";

const UTILISE: Record<FamilleNombre, ReturnType<typeof t>[]> = {
  racines: [t("Pour un naturel n, √n est un naturel si n est un carré parfait, sinon un irrationnel (de même ∛n et les cubes) ; on simplifie d'abord la racine (cours, étape 1). ℕ ⊂ ℤ ⊂ ℚ ⊂ ℝ.")],
  ecritures: [t("Un rationnel a une écriture décimale limitée ou périodique, un irrationnel une écriture illimitée non périodique (cours, étape 2) ; une fraction peut être un entier. ℕ ⊂ ℤ ⊂ ℚ ⊂ ℝ.")],
  expressions: [t("On développe ou on simplifie ; a + b√r (a, b rationnels, b ≠ 0, r pas un carré parfait) est irrationnel (cours, étape 1). ℕ ⊂ ℤ ⊂ ℚ ⊂ ℝ.")],
  constantes: [t("Valeurs exactes des angles remarquables, Φ² = Φ + 1 ; π et Φ sont irrationnels (cours, étape 1). ℕ ⊂ ℤ ⊂ ℚ ⊂ ℝ.")],
};

export function correctionDetailleeRationnel(e: ExerciceRationnel): EtapeCorrection[] {
  const r: EtapeCorrection[] = [];
  PHASES_RATIONNEL.forEach((p, i) => {
    const sq = LETTRES[i];
    const n = nombreDe(e, p);
    r.push(utilise(sq, UTILISE[n.famille]));
    r.push(calcul(sq, n.lignes.map((l) => ligne(l.latex, l.justification))));
    r.push(resultat(sq, [...reponse(e, p), t(" : "), ...n.raison.map((x) => (x.type === "latex" ? f(x.valeur) : t(x.valeur)))]));
    r.push(piege(sq, n.piege.map((x) => (x.type === "latex" ? f(x.valeur) : t(x.valeur)))));
  });
  return r;
}
