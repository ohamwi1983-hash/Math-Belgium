import type { ExerciceInequationLogarithmique } from "../../core6e/inequationsLogarithmiques.types";
import type { AdaptateurFeuilleExercices, BlocCorrection, SectionExercice, ZoneReponse } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { phaseApres, phaseInitiale, type PhaseInequationLogarithmique } from "../../moteur6e/typesInequationsLogarithmiques";
import { CONSIGNE_GENERALE, LIBELLE_PHASE_LOG, consigneEcran, contenuRecapPhase, formatEnonceLatex } from "../../ui6e/formatInequationsLogarithmiques";
import { CATALOGUE_FAMILLES, construireAvecFamilleId, genererExerciceInequationLogarithmique, type IdVarianteInequationLogarithmique } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceInequationLogarithmique>` pour `6gen15` (Résoudre
 * une inéquation logarithmique) — feuille d'évaluation, voir
 * `generateurs/analyseFonction/exportWord.ts` pour le mécanisme générique de référence.
 *
 * 6 familles STRUCTURELLEMENT DISJOINTES, 1 à 4 écrans guidés côté interactif
 * (`typesInequationsLogarithmiques.ts::phaseInitiale`/`phaseApres`) — jamais un nombre fixe de
 * questions : `phasesDeLaFamille` rejoue exactement le même parcours que la session interactive
 * pour l'instance tirée, et chaque écran réellement traversé devient UNE question a)/b)/c)…
 * `consigneEcran` (côté consigne) et `contenuRecapPhase` (côté corrigé) sont les mêmes fonctions
 * déjà utilisées par `App6gen15.tsx`/`ResultatPanelInequationLogarithmique` — jamais recalculées
 * indépendamment ici.
 */

function phasesDeLaFamille(exercice: ExerciceInequationLogarithmique): PhaseInequationLogarithmique[] {
  const phases: PhaseInequationLogarithmique[] = [];
  let phase: PhaseInequationLogarithmique | "termine" = phaseInitiale(exercice);
  while (phase !== "termine") {
    phases.push(phase);
    phase = phaseApres(phase);
  }
  return phases;
}

/** Taille de la zone de réponse — écrans "CE"/réécriture/simplification : courts (poser une ou deux
 * conditions) ; écrans "résoudre"/"comparer"/"convertir" : plus longs (tableau de signes puis
 * intersection rédigés en ligne). Même ordre de grandeur que les autres adaptateurs 6e du chantier
 * (2-3 lignes). */
function reponsePourPhase(phase: PhaseInequationLogarithmique): ZoneReponse {
  switch (phase) {
    case "aCE":
    case "bCE":
    case "cCE":
    case "dCE":
    case "fCE":
    case "eReconnaitre":
    case "cCombiner":
    case "dReecrire":
    case "fSimplifier":
      return { type: "lignes", nombre: 2 };
    case "aResoudre":
    case "bResoudre":
    case "cComparer":
    case "dResoudreY":
    case "dConvertirX":
    case "fConclure":
      return { type: "lignes", nombre: 3 };
  }
}

function construireEnonceInequationsLogarithmiques(exercice: ExerciceInequationLogarithmique): SectionExercice {
  const phases = phasesDeLaFamille(exercice);
  return {
    enteteFragments: [texte(`${CONSIGNE_GENERALE} `), latex(formatEnonceLatex(exercice))],
    questions: phases.map((phase) => ({
      consigne: [texte(consigneEcran(phase, exercice))],
      reponse: reponsePourPhase(phase),
    })),
  };
}

const LETTRES = "abcdefghijklmnopqrstuvwxyz";

function construireCorrectionInequationsLogarithmiques(exercice: ExerciceInequationLogarithmique): BlocCorrection[] {
  const phases = phasesDeLaFamille(exercice);
  return phases.map((phase, i) => {
    const lettre = LETTRES[i] ?? String(i + 1);
    const { texte: texteRecap, latex: latexRecap } = contenuRecapPhase(exercice, phase);
    return {
      type: "paragraphe",
      fragments: [texte(`${lettre}) ${LIBELLE_PHASE_LOG[phase]} : `), ...(latexRecap !== null ? [latex(latexRecap)] : [texte(texteRecap ?? "")]), texte(".")],
    };
  });
}

export const adaptateurEvaluationInequationsLogarithmiques: AdaptateurFeuilleExercices<ExerciceInequationLogarithmique> = {
  titreDocument: "Résoudre une inéquation logarithmique — Évaluation",
  nomFichierBase: "inequations-logarithmiques",
  genererInstance: genererExerciceInequationLogarithmique,
  catalogueVariantes: CATALOGUE_FAMILLES,
  genererInstanceAvecVariante: (id) => construireAvecFamilleId(id as IdVarianteInequationLogarithmique),
  construireEnonce: construireEnonceInequationsLogarithmiques,
  construireCorrection: construireCorrectionInequationsLogarithmiques,
  // Plusieurs questions par instance (1 à 4 selon la famille) ET consigne dépendante de l'instance
  // pour plusieurs familles (B/C mentionnent le sous-type, F mentionne le carré parfait) — aucune
  // des deux conditions de `regroupable` n'est réunie, voir sa doc dans `genererFeuilleExercices.ts`.
};
