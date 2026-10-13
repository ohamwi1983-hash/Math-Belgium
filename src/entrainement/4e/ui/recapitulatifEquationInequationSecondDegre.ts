import type { EtatSessionEquationInequationSecondDegre, PhaseEquationInequationSecondDegre } from "../moteur/typesEquationInequationSecondDegre";
import type { ExerciceEquationInequationSecondDegre } from "../core/equationInequationSecondDegre.types";
import type { EntreeRecapitulatif } from "./recapitulatif";
import { formatDomaineLatex, formatFonctionDeveloppeeLatex, formatSystemeAccoladeLatex } from "./formatOptimisation";
import {
  formatEquationInequationLatex,
  formatResolutionAttendueTexte,
  formatSystemeConfirmeLatex,
  formatValidationAttendueTexte,
  texteAideEliminerSystemeNiveau2,
} from "./formatEquationInequationSecondDegre";

/**
 * Séquence RÉELLE d'écrans (aucune constante exportée par `typesEquationInequationSecondDegre.ts` —
 * reconstruite depuis l'en-tête de `core/equationInequationSecondDegre.types.ts` et l'aiguillage de
 * `AppEquationInequationSecondDegre.tsx`), fixée PAR FAMILLE (jamais tirée indépendamment) :
 * - `exercice.voieSysteme` (achatGroupe) : `poserSysteme → eliminerSysteme → systeme → domaine →
 *   resoudre → validation → interpretation` (identification/contrainteEtGrandeur/
 *   poserEquationInequation tous SAUTÉS).
 * - `!voieSysteme && exercice.base.variante === "fonctionDonnee"` (chuteObjet/distanceFreinage) :
 *   `poserEquationInequation → resoudre → validation → interpretation` (écrans 1-4 SAUTÉS, fonction
 *   et domaine déjà donnés).
 * - `!voieSysteme && exercice.base.variante === "modelisation"` (6 familles restantes) :
 *   `identification` (seulement si `exercice.base.identificationXY` défini) `→ contrainteEtGrandeur
 *   → systeme → domaine → poserEquationInequation → resoudre → validation → interpretation`.
 */
function sequencePourExercice(exercice: ExerciceEquationInequationSecondDegre): PhaseEquationInequationSecondDegre[] {
  if (exercice.voieSysteme) {
    return ["poserSysteme", "eliminerSysteme", "systeme", "domaine", "resoudre", "validation", "interpretation"];
  }
  if (exercice.base.variante === "fonctionDonnee") {
    return ["poserEquationInequation", "resoudre", "validation", "interpretation"];
  }
  const sequence: PhaseEquationInequationSecondDegre[] = [];
  if (exercice.base.identificationXY) sequence.push("identification");
  sequence.push("contrainteEtGrandeur", "systeme", "domaine", "poserEquationInequation", "resoudre", "validation", "interpretation");
  return sequence;
}

/**
 * Valeur d'une entrée du récapitulatif pour une phase donnée — réutilise TELLES QUELLES les
 * fonctions déjà écrites pour l'ancien bloc "état actuel"/la "réponse attendue" déjà affichée par
 * `AppEquationInequationSecondDegre.tsx` (jamais une nouvelle logique de formatage) :
 * `formatSystemeConfirmeLatex` était déjà le contenu de l'ancien panneau "état actuel" de l'écran
 * "eliminerSysteme" (système posé à "poserSysteme") ; `texteAideEliminerSystemeNiveau2` est la même
 * fonction que celle utilisée par `AppEquationInequationSecondDegre.tsx` pour afficher la "réponse
 * attendue" de l'écran "eliminerSysteme" une fois révélée (relation linéaire confirmée) ;
 * `formatSystemeAccoladeLatex`/`formatFonctionDeveloppeeLatex`/`formatDomaineLatex` (écrans 1-4,
 * réutilisés tels quels depuis "Problèmes d'optimisation" — `ui/formatOptimisation.ts`) sont les
 * MÊMES fonctions que `recapitulatifOptimisation.ts`, appliquées à `exercice.base` ; les 4 suivantes
 * (`formatEquationInequationLatex`/`formatResolutionAttendueTexte`/`formatValidationAttendueTexte`)
 * sont déjà les fonctions utilisées par le switch `reponseAttendue` de `AppEquationInequationSecondDegre.tsx`
 * pour ces mêmes phases.
 *
 * `"identification"` : comme pour `recapitulatifOptimisation.ts`, aucune forme affichable n'a jamais
 * existé pour cette phase (le switch `reponseAttendue` de `AppEquationInequationSecondDegre.tsx`
 * renvoie explicitement `undefined` pour `"identification"`) — retourne `null`, aucune entrée créée.
 * `"interpretation"` est TOUJOURS la dernière phase de toute séquence — jamais appelée ici.
 */
function valeurPourPhase(
  exercice: ExerciceEquationInequationSecondDegre,
  phase: PhaseEquationInequationSecondDegre,
): Pick<EntreeRecapitulatif, "libelle" | "valeur" | "estLatex"> | null {
  switch (phase) {
    case "poserSysteme":
      return { libelle: "Système posé", estLatex: true, valeur: formatSystemeConfirmeLatex(exercice) };
    case "eliminerSysteme":
      return { libelle: "Relation linéaire", estLatex: true, valeur: texteAideEliminerSystemeNiveau2(exercice) };
    case "identification":
      return null;
    case "contrainteEtGrandeur": {
      if (exercice.base.variante !== "modelisation") throw new Error("recapitulatifEquationInequationSecondDegre : exercice inattendu (contrainteEtGrandeur)");
      return { libelle: "Relation posée", estLatex: true, valeur: formatSystemeAccoladeLatex(exercice.base) };
    }
    case "systeme": {
      if (exercice.base.variante !== "modelisation") throw new Error("recapitulatifEquationInequationSecondDegre : exercice inattendu (systeme)");
      return { libelle: "Fonction", estLatex: true, valeur: formatFonctionDeveloppeeLatex(exercice.base.fonction, exercice.base.contexte.labelVariable) };
    }
    case "domaine": {
      if (exercice.base.variante !== "modelisation") throw new Error("recapitulatifEquationInequationSecondDegre : exercice inattendu (domaine)");
      return { libelle: "Domaine", estLatex: true, valeur: formatDomaineLatex(exercice.base.domaine, exercice.base.contexte.labelVariable) };
    }
    case "poserEquationInequation":
      return { libelle: exercice.variante === "equation" ? "Équation posée" : "Inéquation posée", estLatex: true, valeur: formatEquationInequationLatex(exercice) };
    case "resoudre":
      return { libelle: "Résolution", estLatex: false, valeur: formatResolutionAttendueTexte(exercice) };
    case "validation":
      return { libelle: "Validation", estLatex: false, valeur: formatValidationAttendueTexte(exercice) };
    default:
      throw new Error(`recapitulatifEquationInequationSecondDegre : phase sans entrée récap (${phase})`);
  }
}

function releveePourPhase(etat: EtatSessionEquationInequationSecondDegre, phase: PhaseEquationInequationSecondDegre): boolean {
  switch (phase) {
    case "poserSysteme":
      return etat.poserSystemeRevele;
    case "eliminerSysteme":
      return etat.eliminerSystemeRevele;
    case "contrainteEtGrandeur":
      return etat.contrainteEtGrandeurRevele;
    case "systeme":
      return etat.systemeRevele;
    case "domaine":
      return etat.domaineRevele;
    case "poserEquationInequation":
      return etat.poserEquationInequationRevele;
    case "resoudre":
      return etat.resoudreRevele;
    case "validation":
      return etat.validationRevele;
    default:
      throw new Error(`recapitulatifEquationInequationSecondDegre : phase sans révélation trackée (${phase})`);
  }
}

/**
 * Récapitulatif "Ce qu'on sait déjà" de `AppEquationInequationSecondDegre.tsx` — séquence FIXE par
 * famille (voir `sequencePourExercice`) : les entrées accumulées sont toujours les phases déjà
 * closes de CETTE séquence. N'existait pas avant ce chantier (vérifié : aucun
 * `RecapitulatifPanel`/récap partiel sur ce générateur).
 */
export function calculerRecapitulatifEquationInequationSecondDegre(etat: EtatSessionEquationInequationSecondDegre): EntreeRecapitulatif[] {
  const exercice = etat.exerciceCourant;
  const sequence = sequencePourExercice(exercice);
  const precedentes = sequence.slice(0, sequence.indexOf(etat.phase));

  const entrees: EntreeRecapitulatif[] = [];
  for (const phase of precedentes) {
    const valeur = valeurPourPhase(exercice, phase);
    if (!valeur) continue;
    entrees.push({ ...valeur, revele: releveePourPhase(etat, phase) });
  }
  return entrees;
}
