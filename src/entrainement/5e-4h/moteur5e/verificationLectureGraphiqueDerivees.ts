/**
 * Couche B (5e) — vérification pour 5gen30 ("Lecture graphique — dérivées et applications").
 * N'importe jamais rien de `src/generateurs5e/`.
 *
 * Réplique LOCALEMENT (jamais importée) la construction de courbe de
 * `generateurs5e/lectureGraphiqueDerivees/courbeNumerique.ts` — même raison que
 * `moteur5e/verificationEtudeLocale.ts` réplique les évaluateurs de `generateurs5e/etudeLocale/`.
 * N'a besoin ICI que d'évaluer le SIGNE de f'/f'' en quelques points représentatifs (jamais de
 * balayer pour trouver de nouveaux zéros — les positions sont déjà connues, stockées comme vérité
 * terrain dans `exercice.extrema`/`exercice.inflexions`).
 *
 * Réutilise DIRECTEMENT (Couche B ↔ Couche B, légitime) :
 * - `listeAsymptotes`/`diagnostiquerCibleAsymptote` (5gen22) pour l'écran "asymptotes", appliqués
 *   au sous-objet `exercice.asymptotique`.
 * - `TableauEtudeLocaleAttendu`/`ReponseTableauEtudeLocale`/`tableauEstComplet`/
 *   `verifierTableauEtudeLocale` (5gen29) — génériques, AUCUNE référence à `ExerciceEtudeLocale`,
 *   réutilisables tel quel pour le tableau étendu de CE générateur.
 */
import type { ComportementVA, ExerciceLectureGraphiqueLimites, SigneInfini } from "../core5e/lectureGraphiqueLimites.types";
import type { BumpExtremumDerivees, BumpInflexionDerivees, ExerciceLectureGraphiqueDerivees, ExtremumLectureGraphiqueDerivees, InflexionLectureGraphiqueDerivees } from "../core5e/lectureGraphiqueDerivees.types";
import type { ColonneTableauEtudeLocale, ValeurLigne2Tableau, ValeurSigneTableau } from "../core5e/etudeLocale.types";
import { evaluerExpressionGenerale } from "../moteur/expressionGenerale";
import type { StatutVerification } from "../moteur/statutVerification";
import { listeAsymptotes } from "./typesLectureGraphiqueLimites";
import { diagnostiquerCibleAsymptote } from "./verificationLectureGraphiqueLimites";
import type { ReponseTableauEtudeLocale, TableauEtudeLocaleAttendu } from "./verificationEtudeLocale";
import { tableauEstComplet, verifierTableauEtudeLocale } from "./verificationEtudeLocale";

export { listeAsymptotes, diagnostiquerCibleAsymptote, tableauEstComplet, verifierTableauEtudeLocale };
export type { ReponseTableauEtudeLocale, TableauEtudeLocaleAttendu };

// ============================================================================
// Réplique locale de `generateurs5e/lectureGraphiqueDerivees/courbeNumerique.ts` — jamais importée
// (règle non négociable moteur5e ↔ generateurs5e). Voir le fichier source pour la justification de
// chaque constante/formule.
// ============================================================================

const K_VA = 3;
const K_AUCUNE = 0.15;
const PENTE_POINT_ISOLE = 0.15;
const ALPHA_BLEND_DERIVEES = 2;
const BUFFER_VA_DERIVEES = 0.35;

type Gabarit = (x: number) => number;

function gabaritDivergenceDepuisDroite(a: number, signe: SigneInfini): Gabarit {
  return (x) => (signe * K_VA) / (x - a);
}
function gabaritDivergenceDepuisGauche(a: number, signe: SigneInfini): Gabarit {
  return (x) => (signe * K_VA) / (a - x);
}
function gabaritPointIsole(a: number, valeur: number): Gabarit {
  return (x) => valeur + PENTE_POINT_ISOLE * (x - a);
}
function gabaritHorizontale(limite: number): Gabarit {
  return () => limite;
}
function gabaritOblique(pente: number, ordonnee: number): Gabarit {
  return (x) => pente * x + ordonnee;
}
function gabaritAucune(signe: SigneInfini, xRef: number): Gabarit {
  return (x) => signe * K_AUCUNE * (x - xRef) * (x - xRef);
}
function gabaritCoteDroitVA(va: ComportementVA): Gabarit {
  return va.pointIsoleDroit !== undefined ? gabaritPointIsole(va.position, va.pointIsoleDroit) : gabaritDivergenceDepuisDroite(va.position, va.signeDroit);
}
function gabaritCoteGaucheVA(va: ComportementVA): Gabarit {
  return va.pointIsoleGauche !== undefined ? gabaritPointIsole(va.position, va.pointIsoleGauche) : gabaritDivergenceDepuisGauche(va.position, va.signeGauche);
}

interface PieceCourbeDerivees {
  loVA: number | null;
  hiVA: number | null;
  gabaritGauche: Gabarit;
  gabaritDroit: Gabarit;
}

function construirePiecesDerivees(exercice: ExerciceLectureGraphiqueLimites): PieceCourbeDerivees[] {
  const { vas, infini } = exercice;
  const n = vas.length;
  const xRefGauche = n > 0 ? vas[0].position : 0;
  const xRefDroit = n > 0 ? vas[n - 1].position : 0;
  const gabaritInfiniGauche: Gabarit =
    infini.type === "horizontale" ? gabaritHorizontale(infini.limiteMoinsInfini) : infini.type === "oblique" ? gabaritOblique(infini.pente, infini.ordonnee) : gabaritAucune(infini.signeMoinsInfini, xRefGauche);
  const gabaritInfiniDroit: Gabarit =
    infini.type === "horizontale" ? gabaritHorizontale(infini.limitePlusInfini) : infini.type === "oblique" ? gabaritOblique(infini.pente, infini.ordonnee) : gabaritAucune(infini.signePlusInfini, xRefDroit);
  const pieces: PieceCourbeDerivees[] = [];
  for (let i = 0; i <= n; i++) {
    pieces.push({
      loVA: i === 0 ? null : vas[i - 1].position,
      hiVA: i === n ? null : vas[i].position,
      gabaritGauche: i === 0 ? gabaritInfiniGauche : gabaritCoteDroitVA(vas[i - 1]),
      gabaritDroit: i === n ? gabaritInfiniDroit : gabaritCoteGaucheVA(vas[i]),
    });
  }
  return pieces;
}

function evaluerPieceMelangeeDerivees(piece: PieceCourbeDerivees, loRendu: number, hiRendu: number, x: number): number {
  const largeur = Math.max(hiRendu - loRendu, 1e-6);
  const t = (x - loRendu) / largeur;
  const poidsGauche = 1 / (1 + Math.exp(ALPHA_BLEND_DERIVEES * (t - 0.5)));
  return poidsGauche * piece.gabaritGauche(x) + (1 - poidsGauche) * piece.gabaritDroit(x);
}

const MARGE_X = 4;
const DEMI_LARGEUR_X_MIN = 5;

function calculerBornesXDerivees(asymptotique: ExerciceLectureGraphiqueLimites): [number, number] {
  const positions = asymptotique.vas.map((va) => va.position);
  const xEtendueMin = Math.min(0, ...positions) - MARGE_X;
  const xEtendueMax = Math.max(0, ...positions) + MARGE_X;
  const demiLargeur = Math.max(DEMI_LARGEUR_X_MIN, (xEtendueMax - xEtendueMin) / 2);
  const centreX = (xEtendueMin + xEtendueMax) / 2;
  return [centreX - demiLargeur, centreX + demiLargeur];
}

interface PieceDomaineDerivees {
  lo: number;
  hi: number;
  piece: PieceCourbeDerivees;
}

function construireDomainesPieces(asymptotique: ExerciceLectureGraphiqueLimites, xMin: number, xMax: number): PieceDomaineDerivees[] {
  return construirePiecesDerivees(asymptotique).map((piece) => ({
    lo: piece.loVA === null ? xMin : piece.loVA + BUFFER_VA_DERIVEES,
    hi: piece.hiVA === null ? xMax : piece.hiVA - BUFFER_VA_DERIVEES,
    piece,
  }));
}

function evaluerBaseTrendSurDomaines(domaines: PieceDomaineDerivees[], x: number): number {
  for (const d of domaines) {
    if (x >= d.lo && x <= d.hi) return evaluerPieceMelangeeDerivees(d.piece, d.lo, d.hi, x);
  }
  let meilleur = domaines[0];
  let meilleureDistance = Infinity;
  for (const d of domaines) {
    const dist = x < d.lo ? d.lo - x : x > d.hi ? x - d.hi : 0;
    if (dist < meilleureDistance) {
      meilleureDistance = dist;
      meilleur = d;
    }
  }
  return evaluerPieceMelangeeDerivees(meilleur.piece, meilleur.lo, meilleur.hi, x);
}

function bumpExtremumValeur(bump: BumpExtremumDerivees, x: number): number {
  const u = (x - bump.positionNominale) / bump.largeur;
  return bump.amplitude * Math.exp(-u * u);
}
function bumpInflexionValeur(bump: BumpInflexionDerivees, x: number): number {
  return bump.amplitude * Math.tanh((x - bump.positionNominale) / bump.largeur);
}

function construireEvaluateurCourbeDerivees(exercice: ExerciceLectureGraphiqueDerivees, xMin: number, xMax: number): (x: number) => number {
  const domaines = construireDomainesPieces(exercice.asymptotique, xMin, xMax);
  return (x: number) => {
    let v = evaluerBaseTrendSurDomaines(domaines, x);
    for (const b of exercice.bumpsExtremum) v += bumpExtremumValeur(b, x);
    for (const b of exercice.bumpsInflexion) v += bumpInflexionValeur(b, x);
    return v;
  };
}

const H_DERIVEE = 1e-2;
function deriveeNumerique(f: (x: number) => number, x: number): number {
  return (f(x + H_DERIVEE) - f(x - H_DERIVEE)) / (2 * H_DERIVEE);
}
function deriveeSecondeNumerique(f: (x: number) => number, x: number): number {
  return (f(x + H_DERIVEE) - 2 * f(x) + f(x - H_DERIVEE)) / (H_DERIVEE * H_DERIVEE);
}

// ============================================================================
// Tableau de signes étendu (écrans "tableauFPrime"/"tableauFSeconde") — même algorithme que
// `construireTableauAttendu` (5gen29), adapté à des positions déjà connues (nombres bruts, jamais
// une `RacineEtudeLocale` exacte/irrationnelle — ici les positions viennent d'une LECTURE
// graphique approximative, pas d'une résolution algébrique).
// ============================================================================

function representantsZones(valeursTriees: number[]): number[] {
  if (valeursTriees.length === 0) return [0];
  const reps: number[] = [valeursTriees[0] - 1];
  for (let i = 0; i < valeursTriees.length - 1; i++) reps.push((valeursTriees[i] + valeursTriees[i + 1]) / 2);
  reps.push(valeursTriees[valeursTriees.length - 1] + 1);
  return reps;
}

function construireTableauDerivees(
  positionsMarqueurs: number[],
  classification: ValeurLigne2Tableau[],
  exclusions: number[],
  evaluer: (x: number) => number,
  symboles: { positif: ValeurLigne2Tableau; negatif: ValeurLigne2Tableau },
): TableauEtudeLocaleAttendu {
  const marqueurs: { valeur: number; colonne: ColonneTableauEtudeLocale }[] = [
    ...positionsMarqueurs.map((v, i) => ({ valeur: v, colonne: { type: "racine" as const, index: i } })),
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

function classificationExtrema(extrema: ExtremumLectureGraphiqueDerivees[]): ValeurLigne2Tableau[] {
  return extrema.map((e) => e.classification);
}
function classificationInflexions(inflexions: InflexionLectureGraphiqueDerivees[]): ValeurLigne2Tableau[] {
  return inflexions.map((p) => p.classification);
}

export function tableauFPrimeAttendu(exercice: ExerciceLectureGraphiqueDerivees): TableauEtudeLocaleAttendu {
  const [xMin, xMax] = calculerBornesXDerivees(exercice.asymptotique);
  const f = construireEvaluateurCourbeDerivees(exercice, xMin, xMax);
  const exclusions = exercice.asymptotique.vas.map((va) => va.position);
  return construireTableauDerivees(
    exercice.extrema.map((e) => e.position),
    classificationExtrema(exercice.extrema),
    exclusions,
    (x) => deriveeNumerique(f, x),
    { positif: "↗", negatif: "↘" },
  );
}

export function tableauFSecondeAttendu(exercice: ExerciceLectureGraphiqueDerivees): TableauEtudeLocaleAttendu {
  const [xMin, xMax] = calculerBornesXDerivees(exercice.asymptotique);
  const f = construireEvaluateurCourbeDerivees(exercice, xMin, xMax);
  const exclusions = exercice.asymptotique.vas.map((va) => va.position);
  return construireTableauDerivees(
    exercice.inflexions.map((p) => p.position),
    classificationInflexions(exercice.inflexions),
    exclusions,
    (x) => deriveeSecondeNumerique(f, x),
    { positif: "∪", negatif: "∩" },
  );
}

// ============================================================================
// Écrans "extremums"/"inflexions" — champs numériques à TOLÉRANCE LARGE, explicitement distincte
// de la tolérance stricte utilisée ailleurs sur la plateforme pour une valeur CALCULÉE (voir
// CLAUDE.md, "Annonce de précision = tolérance réellement vérifiée") : ici l'élève LIT une
// coordonnée approximative sur un graphique, jamais ne la calcule.
// ============================================================================

/** Ordonnée d'un extremum — lecture graphique, tolérance calée sur le pas de grille Mafs typique
 * (±0,35, cf. `TOLERANCE_VALEUR_EXTREMUM`). */
export const TOLERANCE_VALEUR_EXTREMUM = 0.35;
/** Abscisse d'un point d'inflexion — encore plus tolérant qu'un extremum : une estimation visuelle
 * de point d'inflexion est intrinsèquement plus imprécise (le changement de concavité est bien
 * moins net à l'œil qu'un sommet/creux), cf. `TOLERANCE_POSITION_INFLEXION`. */
export const TOLERANCE_POSITION_INFLEXION = 0.65;

function diagnostiquerValeurTolerance(texte: string, cible: number, tolerance: number): StatutVerification {
  try {
    const valeur = evaluerExpressionGenerale(texte, 0);
    if (!Number.isFinite(valeur)) return "parse_error";
    return Math.abs(valeur - cible) <= tolerance ? "correct" : "not_equivalent";
  } catch {
    return "parse_error";
  }
}

export function diagnostiquerValeurExtremum(texte: string, cible: number): StatutVerification {
  return diagnostiquerValeurTolerance(texte, cible, TOLERANCE_VALEUR_EXTREMUM);
}
export function diagnostiquerPositionInflexion(texte: string, cible: number): StatutVerification {
  return diagnostiquerValeurTolerance(texte, cible, TOLERANCE_POSITION_INFLEXION);
}

/** Vérification COMBINÉE — ENSEMBLE exact (ordre indifférent), même patron que
 * `verifierEnsembleNumerique` (5gen29), générique jusqu'à un petit nombre de cibles — la vérité
 * terrain (`exercice.extrema`/`exercice.inflexions`) ne dépasse JAMAIS `CAP_EXTREMA`/`CAP_INFLEXIONS`
 * (5 chacun, voir `generateurs5e/lectureGraphiqueDerivees/index.ts::construireExerciceBorne`), même
 * si le nombre CIBLÉ à la génération reste, lui, dans {0-3 extrema, 0-2 PI}. */
export function verifierEnsembleValeurs(reponses: string[], cibles: number[], diagnostiquer: (texte: string, cible: number) => StatutVerification): boolean {
  if (reponses.length !== cibles.length) return false;
  const restantes = [...cibles];
  for (const rep of reponses) {
    const idx = restantes.findIndex((v) => diagnostiquer(rep, v) === "correct");
    if (idx === -1) return false;
    restantes.splice(idx, 1);
  }
  return restantes.length === 0;
}

/** Diagnostic PAR CHAMP — correct si la valeur saisie correspond à N'IMPORTE LAQUELLE des cibles
 * (surlignage rouge individuel). */
export function diagnostiquerChampParmiCiblesExtremum(texte: string, cibles: number[]): StatutVerification {
  if (cibles.length === 0) return "parse_error";
  const base = diagnostiquerValeurExtremum(texte, cibles[0]);
  if (base === "parse_error") return "parse_error";
  if (base === "correct") return "correct";
  return cibles.some((c) => diagnostiquerValeurExtremum(texte, c) === "correct") ? "correct" : "not_equivalent";
}
export function diagnostiquerChampParmiCiblesInflexion(texte: string, cibles: number[]): StatutVerification {
  if (cibles.length === 0) return "parse_error";
  const base = diagnostiquerPositionInflexion(texte, cibles[0]);
  if (base === "parse_error") return "parse_error";
  if (base === "correct") return "correct";
  return cibles.some((c) => diagnostiquerPositionInflexion(texte, c) === "correct") ? "correct" : "not_equivalent";
}
