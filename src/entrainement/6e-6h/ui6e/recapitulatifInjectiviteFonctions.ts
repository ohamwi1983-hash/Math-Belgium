import type { ExerciceInjectiviteFonctions } from "../core6e/injectiviteFonctions.types";
import { ORDRE_PHASES_INJECTIVITE } from "../moteur6e/typesInjectiviteFonctions";
import type { EtatSessionInjectiviteFonctions, PhaseInjectiviteFonctions } from "../moteur6e/typesInjectiviteFonctions";
import type { EntreeRecapitulatif } from "./recapitulatif";
import { formatEnsembleReelLatex } from "./formatEnsembleReel";

/**
 * Récapitulatif "Ce qu'on sait déjà" pour `6gen1`. Réutilise `ORDRE_PHASES_INJECTIVITE` déjà
 * exporté par `typesInjectiviteFonctions.ts` (séquence FIXE à 5 écrans, jamais de saut
 * conditionnel) — jamais une séquence recalculée séparément. La dernière phase ("bijection") n'a
 * volontairement AUCUN champ "Partiel" côté moteur (voir `ResultatExerciceInjectiviteFonctions`) :
 * elle n'apparaît donc jamais dans ce récapitulatif, seulement dans la barre de progression.
 *
 * Valeur de chaque entrée : reprend EXACTEMENT le format déjà utilisé par `reponseAttenduePhase`
 * dans `App6gen1.tsx` (panneau de validation existant), traduit en fragments LaTeX (`\text{...}`
 * pour les mots, jamais de texte français libre hors d'un `\text{}` sauf pour "reciproque", dont la
 * réponse affichée est déjà un texte générique, jamais du LaTeX).
 */

const LIBELLE_PHASE: Record<Exclude<PhaseInjectiviteFonctions, "bijection">, string> = {
  domaine: "Domaine",
  injective: "Injectivité",
  reciproque: "Réciproque",
  image: "Image",
};

type FragmentsRecap = Pick<EntreeRecapitulatif, "valeur" | "estLatex" | "valeurs">;

function valeurDomaine(exercice: ExerciceInjectiviteFonctions): FragmentsRecap {
  const latex = formatEnsembleReelLatex(exercice.domaine);
  return { valeur: latex, estLatex: true, valeurs: [latex] };
}

function valeurInjective(exercice: ExerciceInjectiviteFonctions): FragmentsRecap {
  if (exercice.injective) {
    return { valeur: "Oui", estLatex: true, valeurs: ["\\text{Oui}"] };
  }
  const gauche = formatEnsembleReelLatex(exercice.intervalleGauche);
  const droite = formatEnsembleReelLatex(exercice.intervalleDroite);
  return {
    valeur: `Non — injective sur ${gauche} ou sur ${droite}`,
    estLatex: true,
    valeurs: ["\\text{Non, injective sur }", gauche, "\\text{ ou sur }", droite],
  };
}

/** Réponse attendue à l'écran "réciproque" — texte générique (méthode), PAS de LaTeX, identique à
 * `reponseAttenduePhase` (`App6gen1.tsx`) : indépendant de l'exercice tiré. */
function valeurReciproque(): FragmentsRecap {
  return {
    valeur: "f⁻¹(x) — voir la méthode (poser y=f(x), échanger x/y, isoler y) appliquée à l'intervalle retenu.",
    estLatex: false,
  };
}

function valeurImage(exercice: ExerciceInjectiviteFonctions): FragmentsRecap {
  const latex = formatEnsembleReelLatex(exercice.image);
  return { valeur: latex, estLatex: true, valeurs: [latex] };
}

function reveleDePhase(etat: EtatSessionInjectiviteFonctions, phase: Exclude<PhaseInjectiviteFonctions, "bijection">): boolean {
  switch (phase) {
    case "domaine":
      return etat.reveleDomainePartiel as boolean;
    case "injective":
      return etat.reveleInjectivePartiel as boolean;
    case "reciproque":
      return etat.reveleReciproquePartiel as boolean;
    case "image":
      return etat.reveleImagePartiel as boolean;
  }
}

export function calculerRecapitulatifInjectiviteFonctions(etat: EtatSessionInjectiviteFonctions): EntreeRecapitulatif[] {
  const exercice = etat.exerciceCourant;
  const indexCourant = ORDRE_PHASES_INJECTIVITE.indexOf(etat.phase);
  const precedentes = ORDRE_PHASES_INJECTIVITE.slice(0, indexCourant).filter((phase): phase is Exclude<PhaseInjectiviteFonctions, "bijection"> => phase !== "bijection");

  return precedentes.map((phase) => {
    const base = phase === "domaine" ? valeurDomaine(exercice) : phase === "injective" ? valeurInjective(exercice) : phase === "reciproque" ? valeurReciproque() : valeurImage(exercice);
    return { libelle: LIBELLE_PHASE[phase], revele: reveleDePhase(etat, phase), ...base };
  });
}

/** Une puce par écran de `ORDRE_PHASES_INJECTIVITE` (séquence fixe, toujours les 5 mêmes écrans). */
export function calculerSegmentsProgressionInjectiviteFonctions(etat: EtatSessionInjectiviteFonctions) {
  return ORDRE_PHASES_INJECTIVITE.map((phase) => {
    if (phase === etat.phase) return "courante" as const;
    if (phase === "bijection") return "a-venir" as const; // jamais de champ "Partiel" pour cette phase (voir en-tête)
    const score = phase === "domaine" ? etat.scoreDomainePartiel : phase === "injective" ? etat.scoreInjectivePartiel : phase === "reciproque" ? etat.scoreReciproquePartiel : etat.scoreImagePartiel;
    if (score === null) return "a-venir" as const;
    return reveleDePhase(etat, phase) ? ("revele" as const) : ("correcte" as const);
  });
}
