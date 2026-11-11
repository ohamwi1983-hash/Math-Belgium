import type { EtatSessionFormeCanoniqueTransformation } from "../moteur/typesFormeCanoniqueTransformations";
import { fonctionCanoniqueReelle } from "../moteur/verificationFormeCanoniqueTransformations";
import { formatFonctionCanoniqueLatex } from "./formatFormeCanoniqueTransformations";
import type { EntreeRecapitulatif } from "./recapitulatif";

/**
 * Récapitulatif « Ce qu'on sait déjà » de gen9 (Forme canonique et transformations — second degré),
 * même principe que `calculerRecapitulatifInequation` : une entrée par écran déjà clos
 * (`scoreXxxExercice !== null`), toujours la valeur CONFIRMÉE tirée de l'exercice (mêmes fonctions
 * que l'écran : `fonctionCanoniqueReelle` + `formatFonctionCanoniqueLatex`), jamais la saisie de
 * l'élève ; `revele` pilote seulement l'icône ✓/✗. "tv" (dernier écran) clôt l'exercice : jamais
 * d'entrée. Sert aussi de « réponse attendue » des puces cliquables (`AppFormeCanoniqueTransformations`).
 */
export function calculerRecapitulatifFormeCanoniqueTransformations(etat: EtatSessionFormeCanoniqueTransformation): EntreeRecapitulatif[] {
  const exercice = etat.exerciceCourant;
  const entrees: EntreeRecapitulatif[] = [];

  if (etat.scoreCanoniqueExercice !== null) {
    const valeurs = [
      `x_S = ${exercice.xS}`,
      `y_S = ${exercice.yS}`,
      formatFonctionCanoniqueLatex(fonctionCanoniqueReelle(exercice, exercice.yS)),
    ];
    entrees.push({ libelle: "Forme canonique", estLatex: true, valeur: valeurs.join("\\quad "), valeurs, revele: etat.canoniqueRevele });
  }

  if (etat.scoreThExercice !== null) {
    const valeurs = [`\\text{TH} = ${exercice.xS}`, formatFonctionCanoniqueLatex({ numA: 1, denA: 1, p: exercice.xS, q: 0 })];
    entrees.push({ libelle: "Translation horizontale", estLatex: true, valeur: valeurs.join("\\quad "), valeurs, revele: etat.thRevele });
  }

  if (etat.scoreEvCvSoxExercice !== null) {
    const valeurs = [
      `\\text{EV} = ${exercice.ev}`,
      `\\text{CV} = ${exercice.cv}`,
      `\\text{SOX : ${exercice.sox ? "oui" : "non"}}`,
      formatFonctionCanoniqueLatex(fonctionCanoniqueReelle(exercice, 0)),
    ];
    entrees.push({ libelle: "Étirement, compression, symétrie", estLatex: true, valeur: valeurs.join("\\quad "), valeurs, revele: etat.evCvSoxRevele });
  }

  return entrees;
}
