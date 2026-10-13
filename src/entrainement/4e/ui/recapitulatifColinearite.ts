import type { EtatSessionColinearite } from "../moteur/typesColinearite";
import type { EntreeRecapitulatif } from "./recapitulatif";
import { formatComposantesLinMatriceLatex, formatComposantesMatriceLatex, formatEquationReduiteLatex } from "./formatColinearite";

/**
 * Récapitulatif "Ce qu'on sait déjà" — contrairement à "Orthogonalité" (générateur 25), ce
 * générateur ne trace pas un `scoresAccumules` par phase : les champs `scoreConstructionExercice`/
 * `constructionRevele` (variantes "points"/"pointsParametre") et `scoreReductionExercice`/
 * `reductionRevele` (variantes "parametre"/"pointsParametre") sont PARTAGÉS entre variantes
 * (`typesColinearite.ts`) et `!== null` ⟺ l'écran correspondant a déjà eu lieu POUR CET exercice —
 * même principe que `recapitulatif.ts` (générateurs 1/2/3), aucun nouvel état nécessaire.
 *
 * "test"/"resolution"/"resolutionAvecX" sont TOUJOURS la dernière phase de leur variante
 * (`sessionColinearite.ts`) — jamais affichées dans leur propre récapitulatif, donc aucune entrée
 * n'est nécessaire pour elles ici.
 *
 * Valeurs réutilisées TELLES QUELLES depuis le bloc "réponse attendue" de `AppColinearite.tsx`
 * (`revelationConstruction`/`construireReponseAttendue`) — jamais une nouvelle logique de
 * formatage : les anciens `EtatActuelPanel` de `EtapeTestColinearite.tsx`/
 * `EtapeReductionAvecXColinearite.tsx` affichaient en réalité les vecteurs de
 * `constructionVecteurs`/`constructionAvecX` (utiles pour calculer LEUR PROPRE écran), pas la
 * réponse propre de l'écran qui les portait.
 */
export function calculerRecapitulatifColinearite(etat: EtatSessionColinearite): EntreeRecapitulatif[] {
  const exercice = etat.exerciceCourant;
  const entrees: EntreeRecapitulatif[] = [];

  if (etat.scoreConstructionExercice !== null) {
    if (exercice.variante === "points") {
      entrees.push({
        libelle: "Vecteurs construits",
        estLatex: true,
        valeur: `\\begin{gathered} \\vec{${exercice.labelA}${exercice.labelB}} = ${formatComposantesMatriceLatex(exercice.vecteurAB)} \\\\ \\vec{${exercice.labelA}${exercice.labelC}} = ${formatComposantesMatriceLatex(exercice.vecteurAC)} \\end{gathered}`,
        revele: etat.constructionRevele,
      });
    } else if (exercice.variante === "pointsParametre") {
      entrees.push({
        libelle: "Vecteurs construits",
        estLatex: true,
        valeur: `\\begin{gathered} \\vec{${exercice.labelA}${exercice.labelB}} = ${formatComposantesLinMatriceLatex(exercice.vecteurAB)} \\\\ \\vec{${exercice.labelA}${exercice.labelC}} = ${formatComposantesLinMatriceLatex(exercice.vecteurAC)} \\end{gathered}`,
        revele: etat.constructionRevele,
      });
    }
  }

  if (etat.scoreReductionExercice !== null && (exercice.variante === "parametre" || exercice.variante === "pointsParametre")) {
    entrees.push({
      libelle: "Équation réduite",
      estLatex: true,
      valeur: formatEquationReduiteLatex(exercice),
      revele: etat.reductionRevele,
    });
  }

  return entrees;
}
