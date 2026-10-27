import type { EtatSessionOptimisation, PhaseOptimisation } from "../moteur/typesOptimisation";
import type { ExerciceOptimisation } from "../core/optimisation.types";
import type { EntreeRecapitulatif } from "./recapitulatif";
import { formatDomaineLatex, formatFonctionDeveloppeeLatex, formatOptimalAttenduLatex, formatSommetAttenduLatex, formatSystemeAccoladeLatex } from "./formatOptimisation";

/**
 * Séquence RÉELLE d'écrans pour l'exercice en cours (aucune constante `SEQUENCES` exportée par
 * `typesOptimisation.ts` — reconstruite depuis l'aiguillage `phase`/`exercice.variante` déjà en
 * place dans `AppOptimisation.tsx`/`AppEquationInequationSecondDegre.tsx`) : `fonctionDonnee` (3
 * écrans, fonction ET domaine déjà fournis) ; `modelisation` — `identification` (seulement si
 * `exercice.identificationXY` est défini, voir `moteur/sessionOptimisation.ts::phaseInitiale`) →
 * `contrainteEtGrandeur` → `systeme` → `domaine` → `sommet` → `decision` → `interpretation`.
 *
 * Exportée : réutilisée telle quelle par `AppOptimisation.tsx::calculerSegmentsProgression` (puces
 * de progression) — même séquence réelle, jamais une deuxième reconstitution divergente.
 */
export function sequencePourExercice(exercice: ExerciceOptimisation): PhaseOptimisation[] {
  if (exercice.variante === "fonctionDonnee") return ["sommet", "decision", "interpretation"];
  const sequence: PhaseOptimisation[] = [];
  if (exercice.identificationXY) sequence.push("identification");
  sequence.push("contrainteEtGrandeur", "systeme", "domaine", "sommet", "decision", "interpretation");
  return sequence;
}

/**
 * Valeur d'une entrée du récapitulatif pour une phase donnée — réutilise TELLES QUELLES les
 * fonctions déjà écrites pour l'ancien bloc "état actuel" (jamais une nouvelle logique de
 * formatage) : `formatSystemeAccoladeLatex`/`formatFonctionDeveloppeeLatex` étaient déjà le contenu
 * affiché respectivement par l'écran "systeme" (rappel inline de la relation posée à
 * "contrainteEtGrandeur") et par l'ancien panneau "état actuel" de l'écran "domaine" (fonction
 * obtenue à "systeme") ; `formatDomaineLatex` est l'appel exact qui composait la ligne "domaine" des
 * anciens panneaux cumulés (`formatDonneesConfirmeesLatex`/`...AvecSommetLatex`/`...FinalesLatex`,
 * `ui/formatOptimisation.ts`) ; `formatSommetAttenduLatex`/`formatOptimalAttenduLatex` sont les
 * fonctions déjà utilisées par `AppOptimisation.tsx` pour afficher la "réponse attendue" du sommet/
 * de l'optimum une fois révélés — même donnée confirmée, jamais la saisie de l'élève.
 *
 * `"identification"` n'a JAMAIS eu de forme affichable ailleurs (ni panneau "état actuel" sur l'écran
 * suivant, ni "réponse attendue" dans `AppOptimisation.tsx`/`AppEquationInequationSecondDegre.tsx`,
 * qui renvoient explicitement `undefined` pour cette phase) : retourne `null`, aucune entrée créée
 * pour cette phase plutôt que d'inventer un nouveau format. `"interpretation"` est TOUJOURS la
 * dernière phase de toute variante (voir `sequencePourExercice`) — jamais appelée ici.
 */
function valeurPourPhase(exercice: ExerciceOptimisation, phase: PhaseOptimisation): Pick<EntreeRecapitulatif, "libelle" | "valeur" | "estLatex"> | null {
  switch (phase) {
    case "identification":
      return null;
    case "contrainteEtGrandeur": {
      if (exercice.variante !== "modelisation") throw new Error("recapitulatifOptimisation : exercice inattendu (contrainteEtGrandeur)");
      return { libelle: "Relation posée", estLatex: true, valeur: formatSystemeAccoladeLatex(exercice) };
    }
    case "systeme": {
      if (exercice.variante !== "modelisation") throw new Error("recapitulatifOptimisation : exercice inattendu (systeme)");
      return { libelle: "Fonction", estLatex: true, valeur: formatFonctionDeveloppeeLatex(exercice.fonction, exercice.contexte.labelVariable) };
    }
    case "domaine": {
      if (exercice.variante !== "modelisation") throw new Error("recapitulatifOptimisation : exercice inattendu (domaine)");
      return { libelle: "Domaine", estLatex: true, valeur: formatDomaineLatex(exercice.domaine, exercice.contexte.labelVariable) };
    }
    case "sommet":
      return { libelle: "Sommet", estLatex: true, valeur: formatSommetAttenduLatex(exercice) };
    case "decision":
      return { libelle: "Optimum", estLatex: true, valeur: formatOptimalAttenduLatex(exercice) };
    default:
      throw new Error(`recapitulatifOptimisation : phase sans entrée récap (${phase})`);
  }
}

function releveePourPhase(etat: EtatSessionOptimisation, phase: PhaseOptimisation): boolean {
  switch (phase) {
    case "contrainteEtGrandeur":
      return etat.contrainteEtGrandeurRevele;
    case "systeme":
      return etat.systemeRevele;
    case "domaine":
      return etat.domaineRevele;
    case "sommet":
      return etat.sommetRevele;
    case "decision":
      return etat.decisionRevele;
    default:
      throw new Error(`recapitulatifOptimisation : phase sans révélation trackée (${phase})`);
  }
}

/**
 * Récapitulatif "Ce qu'on sait déjà" de `AppOptimisation.tsx` — chaque variante traverse une
 * séquence FIXE (voir `sequencePourExercice`) : les entrées accumulées sont toujours les phases
 * déjà closes de CETTE séquence.
 *
 * NE COUVRE QUE `AppOptimisation.tsx` : contrairement à l'hypothèse initiale, les écrans
 * "sommet"/"decision"/"interpretation" (`EtapeSommetOptimisation`/`EtapeDecisionOptimisation`/
 * `EtapeInterpretationOptimisation`) ne sont PAS réutilisés par `AppEquationInequationSecondDegre.tsx`
 * (vérifié par grep — seul `EtapeDomaineOptimisation` l'est réellement, voir
 * `recapitulatifEquationInequationSecondDegre.ts`) ; ce générateur a ses propres écrans terminaux
 * ("poserEquationInequation"/"resoudre"/"validation"/"interpretation", état
 * `EtatSessionEquationInequationSecondDegre` distinct, incompatible avec `EtatSessionOptimisation`
 * utilisé ici). Seules les phases "identification"/"contrainteEtGrandeur"/"systeme"/"domaine" sont
 * réellement communes aux 2 apps (écrans 1-4 réutilisés tels quels, voir CLAUDE.md) — le récap de
 * `AppEquationInequationSecondDegre.tsx` réutilise les mêmes fonctions de formatage pour ces
 * phases-là, mais reste un calcul séparé (état de session différent).
 */
export function calculerRecapitulatifOptimisation(etat: EtatSessionOptimisation): EntreeRecapitulatif[] {
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
