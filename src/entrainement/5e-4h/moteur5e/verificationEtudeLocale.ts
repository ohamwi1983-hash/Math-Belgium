/**
 * Couche B (5e) — vérification pour 5gen29 ("Étude locale (extremums et points critiques)").
 * N'importe jamais rien de `src/generateurs5e/`.
 *
 * Réplique localement (jamais importés) `valeurFEtudeLocale`/`deriveeFEtudeLocale`/
 * `deriveeSecondeEtudeLocale`/`valeurNumeriqueRacineEtudeLocale`
 * (`generateurs5e/etudeLocale/index.ts`) — même patron que `verificationTangentes.ts` répliquant
 * les évaluateurs de 5gen28.
 *
 * Réutilise DIRECTEMENT `diagnostiquerNombre` (5gen21/5gen28, Couche B↔B) pour tout champ numérique
 * — tolérance 0.01 UNIQUE (via `evaluerExpressionGenerale`, qui accepte déjà `sqrt(...)`), la même
 * qu'une racine soit exacte ou irrationnelle : voir CLAUDE.md, "Annonce de précision = tolérance
 * réellement vérifiée" — un champ à réponse EXACTE n'annonce simplement pas de texte de précision
 * côté UI, mais la tolérance de comparaison sous-jacente reste la même fonction partagée partout.
 *
 * Réutilise DIRECTEMENT `verifierEnsembleReelGuide` (`verificationDomaineDefinition.ts`, Couche
 * B↔B) pour l'écran "domaine" (ℝ privé de {e-m;e+m}).
 */
import type {
  ClassificationExtremum,
  ClassificationInflexion,
  ColonneTableauEtudeLocale,
  ExerciceEtudeLocale,
  RacineEtudeLocale,
  ValeurLigne2Tableau,
  ValeurSigneTableau,
} from "../core5e/etudeLocale.types";
import type { EnsembleReelGuide } from "../core5e/domaineDefinition.types";
import type { StatutVerification } from "../moteur/statutVerification";
import { diagnostiquerNombre } from "./verificationAsymptoteOblique";
import { verifierEnsembleReelGuide } from "./verificationDomaineDefinition";

export { diagnostiquerNombre, verifierEnsembleReelGuide };

// ============================================================================
// Réplique locale de la Couche A — jamais importée.
// ============================================================================

export function valeurNumeriqueRacineEtudeLocale(r: RacineEtudeLocale): number {
  return r.exact ? r.valeur.num / r.valeur.den : r.centre + r.signe * Math.sqrt(r.radicande);
}

export function valeurFEtudeLocale(exercice: ExerciceEtudeLocale, x: number): number {
  if (exercice.type === "polynomiale") return exercice.a * x ** 3 + exercice.b * x ** 2 + exercice.c * x + exercice.d;
  const D = (x - exercice.e) ** 2 + exercice.k;
  return exercice.c / D;
}

export function deriveeFEtudeLocale(exercice: ExerciceEtudeLocale, x: number): number {
  if (exercice.type === "polynomiale") return 3 * exercice.a * x ** 2 + 2 * exercice.b * x + exercice.c;
  const D = (x - exercice.e) ** 2 + exercice.k;
  return (-2 * exercice.c * (x - exercice.e)) / (D * D);
}

export function deriveeSecondeEtudeLocale(exercice: ExerciceEtudeLocale, x: number): number {
  if (exercice.type === "polynomiale") return 6 * exercice.a * x + 2 * exercice.b;
  const D = (x - exercice.e) ** 2 + exercice.k;
  return (2 * exercice.c * (3 * (x - exercice.e) ** 2 - exercice.k)) / (D * D * D);
}

// ============================================================================
// Écran "domaine" (rationnelleAvecCE uniquement) — attendu = "ℝ privé de {e-m;e+m}".
// ============================================================================

export function domaineAttendu(exercice: ExerciceEtudeLocale): EnsembleReelGuide {
  return { forme: "prive_points", points: [...exercice.exclusionsCE].sort((a, b) => a - b), morceaux: [] };
}

// ============================================================================
// Écrans "resoudreFPrime"/"resoudreFSeconde" — ensemble de racines, ordre indifférent (≤2 valeurs
// dans ce générateur, jamais plus — même patron que 5gen28 `verifierRacinesHorizontale`).
// ============================================================================

function valeursNumeriques(racines: RacineEtudeLocale[]): number[] {
  return racines.map(valeurNumeriqueRacineEtudeLocale);
}

/** Diagnostic PAR CHAMP (surlignage rouge individuel) — correct si la valeur saisie correspond à
 * L'UNE des cibles attendues, peu importe la position du champ. */
export function diagnostiquerChampParmiCibles(texte: string, cibles: number[]): StatutVerification {
  if (cibles.length === 0) return "parse_error";
  const base = diagnostiquerNombre(texte, cibles[0]);
  if (base === "parse_error") return "parse_error";
  if (base === "correct") return "correct";
  return cibles.some((c) => diagnostiquerNombre(texte, c) === "correct") ? "correct" : "not_equivalent";
}

/** Vérification COMBINÉE (notation/moteur) — ENSEMBLE exact, ordre indifférent. Générique jusqu'à
 * 2 cibles (jamais plus dans ce générateur — fallback glouton au-delà, non utilisé en pratique). */
export function verifierEnsembleNumerique(reponses: string[], cibles: number[]): boolean {
  if (reponses.length !== cibles.length) return false;
  if (cibles.length === 0) return true;
  if (cibles.length === 1) return diagnostiquerNombre(reponses[0], cibles[0]) === "correct";
  if (cibles.length === 2) {
    const direct = diagnostiquerNombre(reponses[0], cibles[0]) === "correct" && diagnostiquerNombre(reponses[1], cibles[1]) === "correct";
    if (direct) return true;
    return diagnostiquerNombre(reponses[0], cibles[1]) === "correct" && diagnostiquerNombre(reponses[1], cibles[0]) === "correct";
  }
  const restantes = [...cibles];
  for (const rep of reponses) {
    const idx = restantes.findIndex((v) => diagnostiquerNombre(rep, v) === "correct");
    if (idx === -1) return false;
    restantes.splice(idx, 1);
  }
  return restantes.length === 0;
}

export function racinesFPrimeNumeriques(exercice: ExerciceEtudeLocale): number[] {
  return valeursNumeriques(exercice.racinesFPrime);
}

export function racinesFSecondeNumeriques(exercice: ExerciceEtudeLocale): number[] {
  return valeursNumeriques(exercice.racinesFSeconde);
}

// ============================================================================
// Écrans "extremums"/"inflexions" — valeur de f AUX points classés vrai extremum / vrai PI
// (jamais aux points "ni_lun_ni_lautre"/"pas_de_pi").
// ============================================================================

function xDesPointsClasses<TClassification>(racines: RacineEtudeLocale[], classification: TClassification[], estRetenu: (c: TClassification) => boolean): number[] {
  const out: number[] = [];
  racines.forEach((r, i) => {
    if (estRetenu(classification[i])) out.push(valeurNumeriqueRacineEtudeLocale(r));
  });
  return out;
}

export function xDesExtremums(exercice: ExerciceEtudeLocale): number[] {
  return xDesPointsClasses(exercice.racinesFPrime, exercice.classificationFPrime, (c: ClassificationExtremum) => c !== "ni_lun_ni_lautre");
}

export function xDesInflexions(exercice: ExerciceEtudeLocale): number[] {
  return xDesPointsClasses(exercice.racinesFSeconde, exercice.classificationFSeconde, (c: ClassificationInflexion) => c === "pi");
}

export function valeursFAuxExtremums(exercice: ExerciceEtudeLocale): number[] {
  return xDesExtremums(exercice).map((x) => valeurFEtudeLocale(exercice, x));
}

export function valeursFAuxInflexions(exercice: ExerciceEtudeLocale): number[] {
  return xDesInflexions(exercice).map((x) => valeurFEtudeLocale(exercice, x));
}

// ============================================================================
// Tableau de signes étendu (écrans "tableauFPrime"/"tableauFSeconde") — construction de l'attendu
// (colonnes triées + signe + ligne 2) puis vérification COMBINÉE (une seule tentative pour tout le
// tableau, comme toute grille de la plateforme).
// ============================================================================

export interface TableauEtudeLocaleAttendu {
  colonnes: ColonneTableauEtudeLocale[];
  signes: ValeurSigneTableau[];
  /** `null` uniquement sur une colonne d'exclusion CE (jamais de variation/concavité classée là). */
  ligne2: (ValeurLigne2Tableau | null)[];
}

/** `nbMarkers+1` points représentatifs — un par zone, milieu de 2 marqueurs consécutifs (ou
 * marqueur±1 pour les 2 zones extrêmes). Sûr par construction : les marqueurs de ce générateur
 * (racines + exclusions CE éventuelles) sont TOUJOURS strictement distincts (voir
 * `generateurs5e/etudeLocale/index.test.ts`), donc un milieu ne coïncide jamais avec un marqueur. */
function representantsZones(valeursTriees: number[]): number[] {
  if (valeursTriees.length === 0) return [0];
  const reps: number[] = [valeursTriees[0] - 1];
  for (let i = 0; i < valeursTriees.length - 1; i++) reps.push((valeursTriees[i] + valeursTriees[i + 1]) / 2);
  reps.push(valeursTriees[valeursTriees.length - 1] + 1);
  return reps;
}

/**
 * Générique dans sa logique (prend un évaluateur injectable + les exclusions en paramètre plutôt
 * qu'un `ExerciceEtudeLocale` complet) — EXPORTÉE pour être réutilisée telle quelle par 5gen31
 * ("Étudier une fonction", famille "rationnelleAO", hors du contrat `ExerciceEtudeLocale`) sans
 * dupliquer l'algorithme zone/racine/exclusion. Comportement de 5gen29 strictement inchangé
 * (`tableauFPrimeAttendu`/`tableauFSecondeAttendu` ci-dessous passent simplement
 * `exercice.exclusionsCE` au lieu de `exercice`).
 */
export function construireTableauAttendu<TClassification extends ValeurLigne2Tableau>(
  exclusions: number[],
  racines: RacineEtudeLocale[],
  classification: TClassification[],
  evaluer: (x: number) => number,
  symboles: { positif: ValeurLigne2Tableau; negatif: ValeurLigne2Tableau },
): TableauEtudeLocaleAttendu {
  const marqueurs: { valeur: number; colonne: ColonneTableauEtudeLocale }[] = [
    ...racines.map((r, i) => ({ valeur: valeurNumeriqueRacineEtudeLocale(r), colonne: { type: "racine" as const, index: i } })),
    ...exclusions.map((v, i) => ({ valeur: v, colonne: { type: "exclusion" as const, index: i } })),
  ];
  marqueurs.sort((a, b) => a.valeur - b.valeur);
  const valeursTriees = marqueurs.map((m) => m.valeur);
  const reps = representantsZones(valeursTriees);

  const colonnes: ColonneTableauEtudeLocale[] = [];
  const signes: ValeurSigneTableau[] = [];
  const ligne2: (ValeurLigne2Tableau | null)[] = [];

  function pousserZone(indexRep: number) {
    const signe: ValeurSigneTableau = evaluer(reps[indexRep]) > 0 ? "+" : "-";
    colonnes.push({ type: "zone", index: -1 });
    signes.push(signe);
    ligne2.push(signe === "+" ? symboles.positif : symboles.negatif);
  }

  marqueurs.forEach((m, i) => {
    pousserZone(i);
    colonnes.push(m.colonne);
    if (m.colonne.type === "racine") {
      signes.push("0");
      ligne2.push(classification[m.colonne.index]);
    } else {
      signes.push("∄");
      ligne2.push(null);
    }
  });
  pousserZone(reps.length - 1);

  return { colonnes, signes, ligne2 };
}

export function tableauFPrimeAttendu(exercice: ExerciceEtudeLocale): TableauEtudeLocaleAttendu {
  return construireTableauAttendu(exercice.exclusionsCE, exercice.racinesFPrime, exercice.classificationFPrime, (x) => deriveeFEtudeLocale(exercice, x), {
    positif: "↗",
    negatif: "↘",
  });
}

export function tableauFSecondeAttendu(exercice: ExerciceEtudeLocale): TableauEtudeLocaleAttendu {
  return construireTableauAttendu(exercice.exclusionsCE, exercice.racinesFSeconde, exercice.classificationFSeconde, (x) => deriveeSecondeEtudeLocale(exercice, x), {
    positif: "∪",
    negatif: "∩",
  });
}

export interface ReponseTableauEtudeLocale {
  signes: (ValeurSigneTableau | null)[];
  ligne2: (ValeurLigne2Tableau | null)[];
}

/** Une cellule de ligne 2 n'est REQUISE que là où l'attendu en prévoit une (jamais sur une colonne
 * d'exclusion CE). */
export function tableauEstComplet(reponse: ReponseTableauEtudeLocale, attendu: TableauEtudeLocaleAttendu): boolean {
  return (
    reponse.signes.length === attendu.signes.length &&
    reponse.signes.every((v) => v !== null) &&
    reponse.ligne2.length === attendu.ligne2.length &&
    reponse.ligne2.every((v, i) => attendu.ligne2[i] === null || v !== null)
  );
}

export function verifierTableauEtudeLocale(reponse: ReponseTableauEtudeLocale, attendu: TableauEtudeLocaleAttendu): boolean {
  return (
    reponse.signes.length === attendu.signes.length &&
    reponse.signes.every((v, i) => v === attendu.signes[i]) &&
    reponse.ligne2.length === attendu.ligne2.length &&
    reponse.ligne2.every((v, i) => v === attendu.ligne2[i])
  );
}
