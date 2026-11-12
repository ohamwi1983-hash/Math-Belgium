import type { ExerciceFormuleMoivre } from "../core6e/formuleMoivre.types";
import type { StatutVerification } from "../moteur/statutVerification";
import { diagnostiquerEquivalenceFonction, evaluerExpressionExponentielle } from "./equivalenceExponentielle";

/**
 * Couche B (6e) — vérification propre à `6gen38` ("Formule de Moivre : développer cos(nx) et
 * sin(nx)"). N'importe JAMAIS rien de `src/generateurs6e/` (règle non négociable, CLAUDE.md) — lit
 * UNIQUEMENT les champs déjà précalculés de `ExerciceFormuleMoivre.termes` (voir en-tête
 * `core6e/formuleMoivre.types.ts` : `puissanceDeI` n'est appelée qu'UNE FOIS, côté Couche A, à la
 * génération — jamais ici).
 *
 * ============================================================================
 * **Décision de conception — écran 1 : "i" traité comme une SECONDE VARIABLE LIBRE réelle,
 * jamais comme un symbole imaginaire ni comme un token textuel opaque**
 * ============================================================================
 * L'écran 1 demande le développement de (cos x + i sin x)^n par le binôme de Newton SANS simplifier
 * les puissances de i (ça, c'est le travail de l'écran 2). Le vérificateur numérique de ce chantier
 * (`equivalenceExponentielle.ts`) est réel-only : il ne connaît PAS le nombre imaginaire i, donc
 * comparer "1+2i" à une cible ne peut pas passer par lui tel quel (c'est `verificationComplexes.ts`,
 * pour des CIBLES NUMÉRIQUES a+bi, qui fait ça — mais ici "i" doit rester SYMBOLIQUE, jamais résolu
 * à une valeur ±1/±i précise, exactement ce que ce chapitre veut vérifier que l'élève NE fait PAS
 * encore à cet écran).
 *
 * Solution retenue : `evaluerExpressionExponentielle(texte, variables)` accepte déjà n'importe quel
 * identifiant comme variable liée (`Record<string,number>`) — rien dans son analyseur ne donne à
 * "i" un sens spécial (ni fonction connue, ni constante comme "pi"/"e"). Il suffit donc de lier "i"
 * à une valeur RÉELLE ARBITRAIRE échantillonnée (comme "x"), au lieu de le résoudre en avance — le
 * texte soumis reste alors comparé comme un POLYNÔME EN DEUX VARIABLES RÉELLES LIBRES (x, i) à une
 * fonction de référence `(x,i) => Σ C(n,k)·cos(x)^(n-k)·(i·sin(x))^k` construite EXACTEMENT de la
 * même forme. Test d'identité polynomiale par échantillonnage aléatoire (déjà la technique standard
 * de toute la plateforme, voir en-tête `equivalenceExponentielle.ts` — ici juste étendue à 2
 * variables au lieu d'une) :
 * - Une réponse CORRECTE (n'importe quel réarrangement/factorisation algébriquement identique du
 *   développement, i encore présent partout où le binôme le laisse) coïncide avec la référence pour
 *   TOUTE valeur réelle de (x,i), donc pour tous les points échantillonnés — acceptée.
 * - Le piège central de la spec (simplifier prématurément i^k, ex. écrire `-1*sin(x)^2` au lieu de
 *   `(i*sin(x))^2` pour le terme k=2) change RÉELLEMENT la fonction de (x,i) : `i²` dépend de i,
 *   `-1` n'en dépend pas — les 2 expressions ne coïncident qu'aux points où i²=-1 (aucun réel), donc
 *   divergent presque partout dans l'échantillon → rejeté "not_equivalent", exactement le
 *   comportement voulu, SANS aucun parsing structurel dédié ni liste de formes textuelles interdites.
 * Ce même principe (i comme variable réelle libre supplémentaire) est réutilisé à l'écran 2 pour le
 * champ "termes imaginaires" (i reste en facteur, pas encore retiré). L'écran 3, lui, n'a plus de i
 * du tout (cos(nx)/sin(nx) sont des fonctions réelles pures de x) — vérifié avec le vérificateur
 * standard à 1 variable, sans rien de spécial.
 *
 * `POINTS_X`/`POINTS_I` : décimaux "non ronds" (mêmes conventions que `verificationLimitesLogarithmiques.ts`
 * `POINTS_GENERIQUES` etc.) — évitent 0/±1 pour "i" (dégénéreraient certaines distinctions de signe :
 * i=1 rend i^k=1 pour tout k, i=0 annule tout terme k≥1) et les multiples de π/2 pour "x" (annuleraient
 * cos(x) ou sin(x), réduisant le pouvoir discriminant sur les exposants).
 */

// ============================================================================
// Réécriture locale de la saisie (audit 6e ch. 5, point 33) : `cos^3(x)`, `cos³(x)`, `cos^3 x`,
// `cos³x` sont des notations usuelles que l'évaluateur partagé ne lit pas (« cos » suivi d'un
// exposant) — réécrites ICI en `(cos(x))^3` avant évaluation, sans toucher à l'évaluateur commun.
// ============================================================================

const CHIFFRES_EXPOSANT: Record<string, string> = { "⁰": "0", "¹": "1", "²": "2", "³": "3", "⁴": "4", "⁵": "5", "⁶": "6", "⁷": "7", "⁸": "8", "⁹": "9" };

/** Indice de la parenthèse fermante associée à `texte[debut] === "("`, ou -1. */
function parentheseFermante(texte: string, debut: number): number {
  let profondeur = 0;
  for (let j = debut; j < texte.length; j++) {
    if (texte[j] === "(") profondeur++;
    else if (texte[j] === ")") {
      profondeur--;
      if (profondeur === 0) return j;
    }
  }
  return -1;
}

export function normaliserSaisieMoivre(texte: string): string {
  // « 3icos(x) », « isin(x) » : i collé à cos/sin se lit i·cos, i·sin (sinon identifiant inconnu).
  const t = texte.replace(/i(?=cos|sin)/g, "i*").replace(/(cos|sin)\s*([⁰¹²³⁴⁵⁶⁷⁸⁹]+)/g, (_m, f: string, e: string) => `${f}^${[...e].map((c) => CHIFFRES_EXPOSANT[c]).join("")}`);
  const motif = /(cos|sin)\s*\^\s*(\d+)\s*/g;
  let sortie = "";
  let reprise = 0;
  let m: RegExpExecArray | null;
  while ((m = motif.exec(t)) !== null) {
    const fin = motif.lastIndex;
    sortie += t.slice(reprise, m.index);
    if (t[fin] === "(") {
      const ferme = parentheseFermante(t, fin);
      if (ferme === -1) {
        sortie += m[0];
        reprise = fin;
      } else {
        sortie += `(${m[1]}${t.slice(fin, ferme + 1)})^${m[2]}`;
        reprise = ferme + 1;
      }
    } else if (/[a-z]/.test(t[fin] ?? "")) {
      sortie += `(${m[1]}(${t[fin]}))^${m[2]}`;
      reprise = fin + 1;
    } else {
      sortie += m[0];
      reprise = fin;
    }
    motif.lastIndex = reprise;
  }
  return sortie + t.slice(reprise);
}

// ============================================================================
// Recopies refusées SANS tentative (audit 6e ch. 5, point 5/E) : l'évaluation numérique acceptait
// `(cos(x)+i*sin(x))^n` à l'écran 1 et `cos(nx)`/`sin(nx)` aux écrans 2 et 3, puisque ce sont des
// expressions ÉGALES à la cible — il faut donc les reconnaître par leur forme.
// ============================================================================

/** Vrai si un cos/sin porte sur autre chose que x (cos(3x), sin(n*x), cos 4x…). */
function contientTrigNonX(texte: string): boolean {
  const motif = /(cos|sin)\s*/g;
  while (motif.exec(texte) !== null) {
    const j = motif.lastIndex;
    const c = texte[j];
    if (c === "(") {
      const ferme = parentheseFermante(texte, j);
      if (ferme === -1) continue;
      if (texte.slice(j + 1, ferme).replace(/\s+/g, "") !== "x") return true;
    } else if (c !== undefined && !/^x(?![a-z0-9])/.test(texte.slice(j))) {
      return true;
    }
  }
  return false;
}

/** Vrai si un exposant porte sur une parenthèse contenant à la fois i et une somme : la recopie de
 * (cos x + i sin x)ⁿ. `(i·sin(x))^k`, forme attendue à l'écran 1, n'est PAS visée (pas de somme). */
function contientPuissanceDeSommeAvecI(texte: string): boolean {
  for (let j = 0; j < texte.length; j++) {
    if (texte[j] !== "(") continue;
    const ferme = parentheseFermante(texte, j);
    if (ferme === -1) continue;
    if (!/^\s*\^/.test(texte.slice(ferme + 1))) continue;
    const contenu = texte.slice(j + 1, ferme);
    if (!/(^|[^a-z])i([^a-z]|$)/.test(contenu)) continue;
    let profondeur = 0;
    for (let q = 0; q < contenu.length; q++) {
      const c = contenu[q];
      if (c === "(") profondeur++;
      else if (c === ")") profondeur--;
      else if (profondeur === 0 && q > 0 && /[+\-−]/.test(c)) return true;
    }
  }
  return false;
}

/** Ce qui reste d'une saisie une fois retirés les cos(x)/sin(x) : doit être purement numérique
 * (coefficients, opérations, exposants) pour un polynôme en cos(x) et sin(x). */
function resteNonPolynomial(texte: string): boolean {
  const reste = texte.replace(/(cos|sin)\s*\(\s*x\s*\)/g, "").replace(/(cos|sin)\s+x(?![a-z0-9])/g, "");
  return /[a-zA-Zπ√]/.test(reste) || /\//.test(reste);
}

const POINTS_X = [-1.9, -0.6, 0.9, 2.3];
const POINTS_I = [1.7, -2.3, 0.6];
const TOLERANCE = 0.01;

/** Généralisation à 2 variables libres (x,i) de `diagnostiquerEquivalenceFonction` — voir en-tête de
 * fichier. Même convention "parse_error" prioritaire / "référence non finie sautée" que l'original à
 * 1 variable. */
function diagnostiquerEquivalenceFonctionXI(texte: string, reference: (x: number, i: number) => number, pointsX: number[], pointsI: number[]): StatutVerification {
  let comparables = 0;
  for (const x of pointsX) {
    for (const i of pointsI) {
      const attendu = reference(x, i);
      if (!Number.isFinite(attendu)) continue;
      let soumis: number;
      try {
        soumis = evaluerExpressionExponentielle(texte, { x, i });
      } catch {
        return "parse_error";
      }
      if (!Number.isFinite(soumis)) return "not_equivalent";
      comparables++;
      if (Math.abs(soumis - attendu) > TOLERANCE) return "not_equivalent";
    }
  }
  const minimumRequis = Math.min(3, pointsX.length * pointsI.length);
  if (comparables < minimumRequis) return "parse_error";
  return "correct";
}

// ============================================================================
// Écran 1 — développement complet, i encore symbolique (non simplifié).
// ============================================================================

export function diagnostiquerEcran1(exercice: ExerciceFormuleMoivre, valeursBrutes: string[]): StatutVerification {
  const valeurs = valeursBrutes.map(normaliserSaisieMoivre);
  const reference = (x: number, i: number) => exercice.termes.reduce((acc, t) => acc + t.coefBinomial * Math.cos(x) ** t.puissanceCos * (i * Math.sin(x)) ** t.k, 0);
  return diagnostiquerEquivalenceFonctionXI(valeurs[0], reference, POINTS_X, POINTS_I);
}
export function verifierEcran1(exercice: ExerciceFormuleMoivre, valeurs: string[]): boolean {
  return diagnostiquerEcran1(exercice, valeurs) === "correct";
}

// ============================================================================
// Écran 2 — séparation réel (k pair, i déjà résolu, ±1) / imaginaire (k impair, i encore en
// facteur) — 2 champs, "parse_error" prioritaire (même convention que familles C/E de 6gen34).
// ============================================================================

export function diagnostiquerEcran2(exercice: ExerciceFormuleMoivre, valeursBrutes: string[]): StatutVerification {
  const valeurs = valeursBrutes.map(normaliserSaisieMoivre);
  const termesReels = exercice.termes.filter((t) => t.k % 2 === 0);
  const termesImaginaires = exercice.termes.filter((t) => t.k % 2 === 1);

  const referenceReelle = (x: number) => termesReels.reduce((acc, t) => acc + t.reI * t.coefBinomial * Math.cos(x) ** t.puissanceCos * Math.sin(x) ** t.k, 0);
  const referenceImaginaire = (x: number, i: number) => termesImaginaires.reduce((acc, t) => acc + t.imI * i * t.coefBinomial * Math.cos(x) ** t.puissanceCos * Math.sin(x) ** t.k, 0);

  const statutReel = diagnostiquerEquivalenceFonction(valeurs[0], referenceReelle, POINTS_X, TOLERANCE);
  const statutImaginaire = diagnostiquerEquivalenceFonctionXI(valeurs[1], referenceImaginaire, POINTS_X, POINTS_I);
  if (statutReel === "parse_error" || statutImaginaire === "parse_error") return "parse_error";
  if (statutReel === "not_equivalent" || statutImaginaire === "not_equivalent") return "not_equivalent";
  return "correct";
}
export function verifierEcran2(exercice: ExerciceFormuleMoivre, valeurs: string[]): boolean {
  return diagnostiquerEcran2(exercice, valeurs) === "correct";
}

// ============================================================================
// Écran 3 — cos(nx) et sin(nx), formes finales (fonctions réelles pures de x, plus de i du tout).
// ============================================================================

export function diagnostiquerEcran3(exercice: ExerciceFormuleMoivre, valeursBrutes: string[]): StatutVerification {
  const valeurs = valeursBrutes.map(normaliserSaisieMoivre);
  if (exercice.cible === "cosSeul") return diagnostiquerEquivalenceFonction(valeurs[0], (x) => Math.cos(exercice.n * x), POINTS_X, TOLERANCE);
  if (exercice.cible === "sinSurSin") return diagnostiquerEquivalenceFonction(valeurs[0], (x) => Math.sin(exercice.n * x) / Math.sin(x), POINTS_X, TOLERANCE);
  const referenceCos = (x: number) => Math.cos(exercice.n * x);
  const referenceSin = (x: number) => Math.sin(exercice.n * x);
  const statutCos = diagnostiquerEquivalenceFonction(valeurs[0], referenceCos, POINTS_X, TOLERANCE);
  const statutSin = diagnostiquerEquivalenceFonction(valeurs[1], referenceSin, POINTS_X, TOLERANCE);
  if (statutCos === "parse_error" || statutSin === "parse_error") return "parse_error";
  if (statutCos === "not_equivalent" || statutSin === "not_equivalent") return "not_equivalent";
  return "correct";
}
export function verifierEcran3(exercice: ExerciceFormuleMoivre, valeurs: string[]): boolean {
  return diagnostiquerEcran3(exercice, valeurs) === "correct";
}

// ============================================================================
// Dispatcher générique (mirroir 6gen34/6gen28/6gen26).
// ============================================================================

export function diagnostiquerEcran(exercice: ExerciceFormuleMoivre, phase: "ecran1" | "ecran2" | "ecran3", valeurs: string[]): StatutVerification {
  switch (phase) {
    case "ecran1":
      return diagnostiquerEcran1(exercice, valeurs);
    case "ecran2":
      return diagnostiquerEcran2(exercice, valeurs);
    case "ecran3":
      return diagnostiquerEcran3(exercice, valeurs);
  }
}

export function verifierEcran(exercice: ExerciceFormuleMoivre, phase: "ecran1" | "ecran2" | "ecran3", valeurs: string[]): boolean {
  return diagnostiquerEcran(exercice, phase, valeurs) === "correct";
}

// ============================================================================
// Contrôle AVANT soumission — messages qui ne consomment AUCUNE tentative (audit 6e ch. 5, points
// 5/E et 10).
// ============================================================================

const SANS_TENTATIVE = " Ta saisie ne compte pas comme une tentative.";

export function controleAvantSoumission(exercice: ExerciceFormuleMoivre, phase: "ecran1" | "ecran2" | "ecran3", valeursBrutes: string[]): string | null {
  const valeurs = valeursBrutes.map(normaliserSaisieMoivre);
  if (valeurs.some(contientPuissanceDeSommeAvecI)) return "Développe la puissance avec le binôme de Newton au lieu de recopier (cos(x) + i sin(x))ⁿ." + SANS_TENTATIVE;
  if (valeurs.some(contientTrigNonX)) return `Exprime le résultat avec cos(x) et sin(x) uniquement : recopier cos(${exercice.n}x) ou sin(${exercice.n}x) ne répond pas à la question.` + SANS_TENTATIVE;
  if (diagnostiquerEcran(exercice, phase, valeursBrutes) === "parse_error") return "Expression non reconnue — vérifie l'écriture (par exemple 3cos^2(x)sin(x) ou (i sin(x))^2)." + SANS_TENTATIVE;
  if (phase === "ecran3") {
    if (exercice.cible !== "standard" && valeurs.some((v) => /sin/.test(v))) return "Exprime le résultat avec cos(x) seulement : remplace sin²(x) par 1 − cos²(x)." + SANS_TENTATIVE;
    if (valeurs.some(resteNonPolynomial)) return "Écris un polynôme en cos(x) et sin(x) : des nombres, des puissances de cos(x) et de sin(x), sans i ni autre fonction." + SANS_TENTATIVE;
  }
  return null;
}
