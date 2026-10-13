import type { Morceau } from "../core/inequation.types";
import type { EtatSessionCaracteristiquesAlgebriques } from "../moteur/typesCaracteristiquesAlgebriques";
import { ceAttendues, domaineAttendu, necessiteValidite, racinesAValiderRacineCarree } from "../moteur/verificationCaracteristiquesAlgebriques";
import { formatDomaineLatex } from "./apercuDomaine";
import type { EntreeRecapitulatif } from "./recapitulatif";
import {
  formatCEAttenduesLatex,
  formatConditionLatex,
  formatEquationDebarrasseeLatex,
  formatEquationDeveloppeeLatex,
  formatEquationIsoleeLatex,
  formatEquationsSepareesLatex,
  formatFractionLatex,
  formatOrdonneeExacteLatex,
  formatTermesZerosAttendusLatex,
} from "./formatCaracteristiquesAlgebriques";
import { formatFractionIrreductible } from "./formatFraction";
import type { EtatMorceauFraction } from "./morceauFraction";

/** Repris tel quel de `AppCaracteristiquesAlgebriques.tsx` (non exportés là-bas) — petites
 * fonctions pures dupliquées plutôt qu'importées, même principe de duplication assumée qu'ailleurs
 * sur le projet. */
function morceauVersEtatFraction(m: Morceau): EtatMorceauFraction {
  return {
    crochetGauche: m.crochetGauche,
    borneGaucheMode: m.borneGauche === "-inf" ? "-inf" : "nombre",
    borneGaucheValeur: typeof m.borneGauche === "number" ? formatFractionIrreductible(m.borneGauche) : "",
    crochetDroit: m.crochetDroit,
    borneDroiteMode: m.borneDroite === "+inf" ? "+inf" : "nombre",
    borneDroiteValeur: typeof m.borneDroite === "number" ? formatFractionIrreductible(m.borneDroite) : "",
  };
}

function formatDomaineAttenduLatex(exercice: EtatSessionCaracteristiquesAlgebriques["exerciceCourant"]): string {
  const domaine = domaineAttendu(exercice);
  const points = domaine.points.map((p) => formatFractionIrreductible(p));
  const intervalles = domaine.intervalles.map(morceauVersEtatFraction);
  return formatDomaineLatex(domaine.forme, points, intervalles) ?? "";
}

/**
 * Récapitulatif "Ce qu'on sait déjà" — s'appuie uniquement sur les champs déjà trackés par le
 * moteur (`etat.scoreXxxExercice !== null` ⟺ cette étape a eu lieu et est close), même principe
 * que `recapitulatif.ts` (exercice 1) : aucun nouvel état n'est nécessaire, chaque famille/niveau
 * laissant naturellement à `null` les champs des étapes qu'elle ne traverse pas (voir la doc de
 * `ResultatExerciceCaracteristiquesAlgebriques`, `moteur/typesCaracteristiquesAlgebriques.ts`) —
 * les entrées pertinentes apparaissent donc automatiquement ici, sans brancher sur `niveau`/
 * `famille` pour la plupart des lignes (seules `racineBranche1`/`racineBranche2`/`conditionValidite`
 * exigent un garde de type, ces champs n'existant que sur certains sous-types d'exercice).
 *
 * Réutilise TELLES QUELLES les fonctions de formatage déjà écrites pour l'ancien bloc "état actuel"
 * (`ui/etatActuelCaracteristiquesAlgebriques.ts`, retiré avec les `EtatActuelPanel` qui
 * l'affichaient) et pour le panneau de révélation (`reponseAttenduePhase`,
 * `AppCaracteristiquesAlgebriques.tsx`) — jamais une nouvelle logique de formatage.
 *
 * Contrairement à l'ancien bloc "état actuel" (une seule valeur consolidée par écran, qui REMPLACE
 * ou ACCUMULE selon l'étape — `separation`/`debarrasser`/`regroupe`/`resolutionBranches`), chaque
 * phase close obtient ici sa propre ligne, dans l'ordre où elle a eu lieu : `separation` et
 * `debarrasser` restent mutuellement exclusifs (jamais les deux lignes à la fois, jamais aucune),
 * de même que l'absence de `validite`/`regroupe`/`resolutionBranches` pour les familles qui ne les
 * traversent pas. "validationSolution" n'a volontairement PAS de ligne dédiée : son contenu (une
 * simple réponse Oui/Non) est déjà entièrement couvert par la ligne "Racines des branches"
 * (`resolutionBranches`) ou "Zéros candidats" (`racine_carree`) qui la précède toujours — même
 * choix que l'ancien bloc "état actuel", qui ne l'a jamais affichée non plus. "zeros" n'a de ligne
 * dédiée ("Zéros candidats") que pour `racine_carree` (niveau 2) : seule famille où cette phase
 * n'est pas terminale (elle précède "validationSolution" et stocke son score dans
 * `scoreZerosExercice`, voir la doc de ce champ) — jamais pour les 5 autres familles, où "zeros"
 * clôture directement l'exercice et n'a donc jamais à être rappelé à un écran suivant.
 */
export function calculerRecapitulatifCaracteristiquesAlgebriques(
  etat: EtatSessionCaracteristiquesAlgebriques,
): EntreeRecapitulatif[] {
  const exercice = etat.exerciceCourant;
  const entrees: EntreeRecapitulatif[] = [];

  if (etat.scoreOrdonneeExercice !== null) {
    const attendu = formatOrdonneeExacteLatex(exercice);
    entrees.push({ libelle: "f(0)", estLatex: attendu !== null, valeur: attendu ?? "n'existe pas", revele: etat.ordonneeRevele });
  }

  if (etat.scoreCEExercice !== null) {
    const attendu = formatCEAttenduesLatex(ceAttendues(exercice));
    entrees.push({
      libelle: "Conditions d'existence",
      estLatex: attendu !== null,
      valeur: attendu ?? "aucune",
      revele: etat.ceRevele,
    });
  }

  if (etat.scoreDomaineExercice !== null) {
    entrees.push({ libelle: "Domaine de définition", estLatex: true, valeur: formatDomaineAttenduLatex(exercice), revele: etat.domaineRevele });
  }

  if (etat.scoreIsolementExercice !== null) {
    entrees.push({ libelle: "Équation isolée", estLatex: true, valeur: formatEquationIsoleeLatex(exercice), revele: etat.isolementRevele });
  }

  if (exercice.niveau === "niveau1" && etat.scoreSeparationExercice !== null) {
    entrees.push({ libelle: "Équations séparées", estLatex: true, valeur: formatEquationsSepareesLatex(exercice), revele: etat.separationRevele });
  }

  if (exercice.niveau === "niveau1" && etat.scoreDebarrasserExercice !== null) {
    entrees.push({
      libelle: "Équation débarrassée",
      estLatex: true,
      valeur: formatEquationDebarrasseeLatex(exercice),
      revele: etat.debarrasserRevele,
    });
  }

  if (etat.scoreValiditeExercice !== null && necessiteValidite(exercice)) {
    entrees.push({ libelle: "Condition de validité", estLatex: true, valeur: formatConditionLatex(exercice.conditionValidite), revele: etat.validiteRevele });
  }

  if (etat.scoreRegroupeExercice !== null) {
    entrees.push({ libelle: "Équation regroupée", estLatex: true, valeur: formatEquationDeveloppeeLatex(exercice), revele: etat.regroupeRevele });
  }

  if (etat.scoreResolutionBranchesExercice !== null && exercice.niveau === "niveau2" && exercice.famille === "valeur_absolue") {
    entrees.push({
      libelle: "Racines des branches",
      estLatex: true,
      valeur: `${formatFractionLatex(exercice.racineBranche1)} \\text{ et } ${formatFractionLatex(exercice.racineBranche2)}`,
      revele: etat.resolutionBranchesRevele,
    });
  }

  if (etat.scoreZerosExercice !== null && exercice.niveau === "niveau2" && exercice.famille === "racine_carree") {
    const termes = formatTermesZerosAttendusLatex(racinesAValiderRacineCarree(exercice));
    entrees.push(
      termes === null
        ? { libelle: "Zéros candidats", estLatex: false, valeur: "aucun", revele: etat.zerosRevele }
        : { libelle: "Zéros candidats", estLatex: true, valeur: "", valeurs: termes, revele: etat.zerosRevele },
    );
  }

  return entrees;
}
