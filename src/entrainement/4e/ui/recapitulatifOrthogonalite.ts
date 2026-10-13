import type { EtatSessionOrthogonalite, PhaseOrthogonalite } from "../moteur/typesOrthogonalite";
import { SEQUENCES } from "../moteur/typesOrthogonalite";
import type { ExerciceOrthogonalite } from "../core/orthogonalite.types";
import type { EntreeRecapitulatif } from "./recapitulatif";
import { formatComposantesLinMatriceLatex, formatComposantesMatriceLatex, formatEquationReduiteParametreLatex, formatReductionLatex } from "./formatOrthogonalite";

/**
 * Valeur d'une entrée du récapitulatif pour une phase donnée — réutilise TELLES QUELLES les
 * valeurs déjà affichées ailleurs pour CETTE phase (son propre bloc "réponse attendue" de
 * `AppOrthogonalite.tsx`, jamais une nouvelle logique de formatage) : seules les phases qui
 * PRÉCÈDENT au moins un écran suivant au sein de leur variante (voir `SEQUENCES`) ont besoin d'une
 * entrée ici — la dernière phase de chaque variante n'est jamais affichée dans son propre
 * récapitulatif.
 *
 * `testSommetA/B/C` et `reductionSommetA/B/C` affichaient chacune, dans leur ANCIEN
 * `EtatActuelPanel` (désormais retiré), un sous-ensemble filtré des vecteurs de
 * `constructionTriangle`/`constructionAvecX` (utile pour calculer LEUR PROPRE test/réduction, pas
 * un récapitulatif de ces écrans-là) — jamais la réponse propre de `testSommetA/B/C` ou
 * `reductionSommetA/B/C` elles-mêmes. L'entrée récap de CES phases reprend donc plutôt leur propre
 * valeur confirmée (le critère calculé / l'équation réduite), telle qu'affichée par le bloc
 * "réponse attendue" de `AppOrthogonalite.tsx` pour cette même phase — jamais les vecteurs d'un
 * autre sommet.
 */
function valeurPourPhase(exercice: ExerciceOrthogonalite, phase: PhaseOrthogonalite): Pick<EntreeRecapitulatif, "libelle" | "valeur" | "estLatex"> {
  switch (phase) {
    case "reductionParametre": {
      if (exercice.variante !== "parametre") throw new Error("recapitulatifOrthogonalite : exercice inattendu (reductionParametre)");
      return { libelle: "Équation réduite", estLatex: true, valeur: formatEquationReduiteParametreLatex(exercice) };
    }
    case "constructionTriangle": {
      if (exercice.variante !== "triangle") throw new Error("recapitulatifOrthogonalite : exercice inattendu (constructionTriangle)");
      return {
        libelle: "Vecteurs construits",
        estLatex: true,
        valeur: `\\begin{gathered} \\vec{${exercice.labelA}${exercice.labelB}} = ${formatComposantesMatriceLatex(exercice.vecteurAB)} \\\\ \\vec{${exercice.labelA}${exercice.labelC}} = ${formatComposantesMatriceLatex(exercice.vecteurAC)} \\\\ \\vec{${exercice.labelB}${exercice.labelC}} = ${formatComposantesMatriceLatex(exercice.vecteurBC)} \\end{gathered}`,
      };
    }
    case "testSommetA": {
      if (exercice.variante !== "triangle") throw new Error("recapitulatifOrthogonalite : exercice inattendu (testSommetA)");
      return { libelle: "Critère au sommet A", estLatex: false, valeur: String(exercice.critereA) };
    }
    case "testSommetB": {
      if (exercice.variante !== "triangle") throw new Error("recapitulatifOrthogonalite : exercice inattendu (testSommetB)");
      return { libelle: "Critère au sommet B", estLatex: false, valeur: String(exercice.critereB) };
    }
    case "testSommetC": {
      if (exercice.variante !== "triangle") throw new Error("recapitulatifOrthogonalite : exercice inattendu (testSommetC)");
      return { libelle: "Critère au sommet C", estLatex: false, valeur: String(exercice.critereC) };
    }
    case "constructionAvecX": {
      if (exercice.variante !== "triangleParametre") throw new Error("recapitulatifOrthogonalite : exercice inattendu (constructionAvecX)");
      return {
        libelle: "Vecteurs construits",
        estLatex: true,
        valeur: `\\begin{gathered} \\vec{${exercice.labelA}${exercice.labelB}} = ${formatComposantesLinMatriceLatex(exercice.vecteurAB)} \\\\ \\vec{${exercice.labelA}${exercice.labelC}} = ${formatComposantesLinMatriceLatex(exercice.vecteurAC)} \\\\ \\vec{${exercice.labelB}${exercice.labelC}} = ${formatComposantesLinMatriceLatex(exercice.vecteurBC)} \\end{gathered}`,
      };
    }
    case "reductionSommetA": {
      if (exercice.variante !== "triangleParametre") throw new Error("recapitulatifOrthogonalite : exercice inattendu (reductionSommetA)");
      return { libelle: "Réduction — sommet A", estLatex: true, valeur: formatReductionLatex(exercice.reductionA) };
    }
    case "reductionSommetB": {
      if (exercice.variante !== "triangleParametre") throw new Error("recapitulatifOrthogonalite : exercice inattendu (reductionSommetB)");
      return { libelle: "Réduction — sommet B", estLatex: true, valeur: formatReductionLatex(exercice.reductionB) };
    }
    case "reductionSommetC": {
      if (exercice.variante !== "triangleParametre") throw new Error("recapitulatifOrthogonalite : exercice inattendu (reductionSommetC)");
      return { libelle: "Réduction — sommet C", estLatex: true, valeur: formatReductionLatex(exercice.reductionC) };
    }
    // test/resolutionParametre/conclusionTriangle/identificationResolution sont toujours la
    // DERNIÈRE phase de leur variante (voir SEQUENCES) — jamais appelées ici.
    default:
      throw new Error(`recapitulatifOrthogonalite : phase sans entrée récap (${phase})`);
  }
}

/**
 * Récapitulatif "Ce qu'on sait déjà" — chaque variante traverse une séquence FIXE et DISJOINTE des
 * autres (voir `SEQUENCES`, `moteur/typesOrthogonalite.ts`) : les entrées accumulées sont donc
 * toujours les phases déjà closes de CETTE séquence, jamais une autre variante.
 */
export function calculerRecapitulatifOrthogonalite(etat: EtatSessionOrthogonalite): EntreeRecapitulatif[] {
  const exercice = etat.exerciceCourant;
  const sequence = SEQUENCES[exercice.variante];
  const precedentes = sequence.slice(0, sequence.indexOf(etat.phase));

  return precedentes.map((phase) => {
    const score = etat.scoresAccumules[phase]!;
    return { ...valeurPourPhase(exercice, phase), revele: score.revele };
  });
}
