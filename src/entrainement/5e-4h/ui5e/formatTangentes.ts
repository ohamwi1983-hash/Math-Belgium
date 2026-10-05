/**
 * Couche présentation (5e) — consignes/labels/aides/LaTeX pour 5gen28 ("Tangentes"). Dépend
 * librement des couches inférieures (jamais l'inverse) : réutilise `valeurFPointDonne`/
 * `deriveeFPointDonne`/`valeurFHorizontale`/`deriveeFHorizontale`/`valeurFDoubleTangence`/
 * `deriveeFDoubleTangence` (`generateurs5e/tangentes/index.ts`) — même patron que
 * `formatDefinitionDerivee.ts` réutilisant `valeurExacte`/`deriveeExacte` depuis la Couche A.
 *
 * Toute valeur numérique connue de l'exercice (a, p, q une fois confirmé) est TOUJOURS substituée
 * dans les consignes/labels — jamais la forme générique "f(a)"/"tangente(x)"
 * (`prompt5gen28variantesabc.md`). Aucune ligne "Objectif : ..." (redondante avec les
 * consignes/questions ci-dessous, supprimée partout).
 */
import type { ExerciceTangente, ExerciceTangenteDoubleTangence, ExerciceTangenteHorizontale, ExerciceTangentePointDonne } from "../core5e/tangentes.types";
import { deriveeFDoubleTangence, deriveeFPointDonne, valeurFDoubleTangence, valeurFHorizontale, valeurFPointDonne } from "../generateurs5e/tangentes/index";
import { reduireFraction } from "../generateurs5e/limites/fraction";
import type { EcranTangente } from "../moteur5e/typesTangentes";
import { ordreEcransTangente } from "../moteur5e/typesTangentes";

// ============================================================================
// Fragments LaTeX de bas niveau.
// ============================================================================

/** Polynôme à partir de coefficients ASCENDANTS [constante, coeff1, coeff2...]. */
function formatPolynomeVarLatex(coeffs: number[], symbole: string): string {
  let out = "";
  let premier = true;
  for (let d = coeffs.length - 1; d >= 0; d--) {
    const coeff = coeffs[d];
    if (coeff === 0) continue;
    const abs = Math.abs(coeff);
    const signe = coeff < 0 ? "-" : premier ? "" : "+";
    const variable = d === 0 ? "" : d === 1 ? symbole : `${symbole}^{${d}}`;
    const coeffAffiche = abs === 1 && d !== 0 ? "" : `${abs}`;
    out += `${signe}${coeffAffiche}${variable}`;
    premier = false;
  }
  return out === "" ? "0" : out;
}

function formatValeurRadicaleLatex(coeff: number, radicande: number): string {
  const racine = `\\sqrt{${radicande}}`;
  if (coeff === 1) return racine;
  if (coeff === -1) return `-${racine}`;
  return `${coeff}${racine}`;
}

/** Fraction numerateur/(denomCoeff·√radicandeLatex), RÉDUITE par PGCD (`reduireFraction`, Couche A
 * déjà établie) avant affichage — jamais "-4/(2√...)" quand "-2/√..." est la forme réduite (audit
 * transversal, `promptauditfractionsnonreduites.md`). `radicandeLatex` accepte un nombre concret
 * (f'(a) confirmé) ou un fragment symbolique en x (f'(x) donné) — même formule dans les 2 cas. */
function formatFractionSurRacineLatex(numerateur: number, denomCoeff: number, radicandeLatex: string | number): string {
  if (numerateur === 0) return "0";
  const { num, den } = reduireFraction(numerateur, denomCoeff);
  const signe = num < 0 ? "-" : "";
  const numAbs = Math.abs(num);
  const racine = `\\sqrt{${radicandeLatex}}`;
  return den === 1 ? `${signe}\\dfrac{${numAbs}}{${racine}}` : `${signe}\\dfrac{${numAbs}}{${den}${racine}}`;
}

function formatDeriveeRadicaleLatex(coeff: number, m: number, radicande: number): string {
  return formatFractionSurRacineLatex(coeff * m, 2, radicande);
}

/** "x-q" ou "x+|q|" — jamais un double signe moins juxtaposé quand `q` est négatif (audit
 * transversal, `promptauditdoublesigne.md`) — même patron que `formatFacteurXMoinsQ`
 * (`ui5e/formatDefinitionDerivee.ts`). */
function formatFacteurXMoinsQ(q: number): string {
  if (q === 0) return "x";
  return q > 0 ? `x-${q}` : `x+${Math.abs(q)}`;
}

/** Retire le préfixe "y=" d'une équation de tangente confirmée — pour la recomposer sous une autre
 * forme ("f(x)=...", "t_{x=a}\equiv..."), jamais en la reformattant depuis zéro. */
function rhsDeTangente(tangenteLatex: string): string {
  return tangenteLatex.replace(/^y=/, "");
}

// ============================================================================
// f(x) — bloc de données, par variante.
// ============================================================================

export function formatFDeXLatex(exercice: ExerciceTangente): string {
  switch (exercice.variante) {
    case "pointDonne":
      return exercice.sousFamille === "polynomiale"
        ? `f(x)=${formatPolynomeVarLatex(exercice.coeffs, "x")}`
        : `f(x)=${formatValeurRadicaleAvecArgumentLatex(exercice.coeff, exercice.m, exercice.p)}`;
    case "horizontale":
      return `f(x)=${formatPolynomeVarLatex([exercice.d, exercice.c, exercice.b, exercice.a], "x")}`;
    case "doubleTangence":
      return `f(x)=${formatPolynomeVarLatex(exercice.coeffs, "x")}`;
  }
}

function formatArgumentRadicalLatex(m: number, p: number): string {
  const mLatex = m === 1 ? "x" : m === -1 ? "-x" : `${m}x`;
  if (p === 0) return mLatex;
  return p > 0 ? `${mLatex}+${p}` : `${mLatex}-${Math.abs(p)}`;
}

function formatValeurRadicaleAvecArgumentLatex(coeff: number, m: number, p: number): string {
  const racine = `\\sqrt{${formatArgumentRadicalLatex(m, p)}}`;
  if (coeff === 1) return racine;
  if (coeff === -1) return `-${racine}`;
  return `${coeff}${racine}`;
}

/** f'(x) — GIVEN sur l'écran, uniquement pour les variantes A et B (jamais C, voir CLAUDE.md/la
 * tâche : le quartique de la variante C doit être dérivé PAR l'élève lui-même). */
export function formatFPrimeDeXLatex(exercice: ExerciceTangentePointDonne | ExerciceTangenteHorizontale): string {
  if (exercice.variante === "pointDonne") {
    if (exercice.sousFamille === "polynomiale") {
      const derivee: number[] = [];
      for (let i = 1; i < exercice.coeffs.length; i++) derivee.push(i * exercice.coeffs[i]);
      return `f'(x)=${formatPolynomeVarLatex(derivee, "x")}`;
    }
    const argumentLatex = formatArgumentRadicalLatex(exercice.m, exercice.p);
    return `f'(x)=${formatFractionSurRacineLatex(exercice.coeff * exercice.m, 2, argumentLatex)}`;
  }
  return `f'(x)=${formatPolynomeVarLatex([exercice.c, 2 * exercice.b, 3 * exercice.a], "x")}`;
}

// ============================================================================
// Bloc de données — consigne générale + en-tête, par variante. Les valeurs a/p connues DÈS LE
// DÉBUT ne sont plus reprises en ligne séparée (redondant avec la consigne générale, qui les
// substitue déjà) — `prompt5gen28variantesabc.md`.
// ============================================================================

export function formatTermesDonneesLatex(exercice: ExerciceTangente): string[] {
  switch (exercice.variante) {
    case "pointDonne":
      return [formatFDeXLatex(exercice), formatFPrimeDeXLatex(exercice)];
    case "horizontale":
      return [formatFDeXLatex(exercice), formatFPrimeDeXLatex(exercice)];
    case "doubleTangence":
      return [formatFDeXLatex(exercice)];
  }
}

export function consigneGenerale(exercice: ExerciceTangente): string {
  switch (exercice.variante) {
    case "pointDonne":
      return `Détermine l'équation de la tangente à la courbe de f au point d'abscisse x=${exercice.a}`;
    case "horizontale":
      return "Détermine le(s) point(s) où la tangente à la courbe de f est HORIZONTALE, puis donne les coordonnées du/des point(s) de tangence.";
    case "doubleTangence":
      return `La tangente t en x=${exercice.p} touche une SECONDE fois la courbe de f, en un point d'abscisse q à déterminer. Vérifie que ce deuxième point est une tangence, pas une simple intersection.`;
  }
}

// ============================================================================
// Libellés d'écran (récapitulatif).
// ============================================================================

export const LIBELLE_ECRAN: Record<EcranTangente, string> = {
  substituer: "f(a) et f'(a)",
  tangente: "Équation de la tangente",
  resoudre: "Résoudre f'(x)=0",
  coordonnees: "Point(s) de tangence",
  tangenteEnP: "f'(p) et tangente en p",
  trouverQ: "Le second point q",
  verifierPente: "Vérifier la pente en q",
};

// ============================================================================
// Question spécifique par écran — texte + (pour "tangente"/"trouverQ") un fragment LaTeX central à
// rendre via `<Katex>` côté composant, jamais en texte plat pour un symbole mathématique empilé.
// Toute valeur connue de CET exercice est substituée, y compris l'équation de tangente RÉELLEMENT
// trouvée pour cet exercice (réutilise `formatTangenteConfirmeeDoubleTangenceLatex`, plus bas,
// seule source de vérité pour cette forme).
// ============================================================================

export interface QuestionSpecifique {
  texteAvant: string;
  /** Fragment LaTeX central, rendu séparément via `<Katex>` — absent quand aucun symbole empilé
   * n'est nécessaire. */
  latex?: string;
  texteApres?: string;
}

export function questionSpecifiqueEcran(exercice: ExerciceTangente, ecran: EcranTangente): QuestionSpecifique {
  switch (ecran) {
    case "substituer": {
      const a = (exercice as ExerciceTangentePointDonne).a;
      return { texteAvant: `Calcule f(${a}), puis f'(${a}) où f(x) et f'(x) sont données ci-dessus.` };
    }
    case "tangente": {
      const a = (exercice as ExerciceTangentePointDonne).a;
      return { texteAvant: "Donne l'équation de la tangente", latex: `t_{x=${a}}`, texteApres: "sous la forme y=mx+p" };
    }
    case "resoudre":
      return { texteAvant: "Résous f'(x)=0 et donne la/les solutions." };
    case "coordonnees":
      return { texteAvant: "Pour chaque abscisse x trouvée, calcule l'ordonnée correspondante y=f(x) et donne le POINT COMPLET sous la forme (x;y)." };
    case "tangenteEnP": {
      const p = (exercice as ExerciceTangenteDoubleTangence).p;
      return { texteAvant: `Calcule f'(${p}), puis écris l'équation de la tangente au point d'abscisse x=${p}.` };
    }
    case "trouverQ": {
      const ex = exercice as ExerciceTangenteDoubleTangence;
      const rhs = rhsDeTangente(formatTangenteConfirmeeDoubleTangenceLatex(ex));
      return {
        texteAvant: "L'équation",
        latex: `f(x)=${rhs}`,
        texteApres: `admet deux solutions dont une en x=${ex.p} et une autre en x=q, trouve q.`,
      };
    }
    case "verifierPente": {
      const ex = exercice as ExerciceTangenteDoubleTangence;
      return { texteAvant: `Calcule f'(${ex.q}) pour confirmer une VRAIE double tangence (pas une simple intersection), cette pente doit être identique à f'(${ex.p}).` };
    }
  }
}

// ============================================================================
// Labels de champs — valeur connue substituée (jamais la forme générique).
// ============================================================================

export function labelFAPointDonne(a: number): string {
  return `f(${a})=`;
}

export function labelFPrimeAPointDonne(a: number): string {
  return `f'(${a})=`;
}

/** "t_{x=valeur}\equiv" — remplace le label "y=" sur les champs d'équation de tangente (variante A
 * écran "tangente", variante C écran "tangenteEnP"). */
export function labelTangenteEquiv(valeur: number): string {
  return `t_{x=${valeur}}\\equiv`;
}

export function labelFPrimeP(p: number): string {
  return `f'(${p})=`;
}

// ============================================================================
// Aides — niveau 1 (technique/piège), niveau 2 (exemple proche, jamais la réponse).
// ============================================================================

export function texteAideNiveau1(ecran: EcranTangente): string {
  switch (ecran) {
    case "substituer":
      return "Remplace x PAR a dans f(x) pour obtenir f(a), puis x PAR a dans f'(x) (donnée) pour obtenir f'(a) — 2 substitutions indépendantes, pas de dérivation à faire ici.";
    case "tangente":
      return "y=f'(a)(x-a)+f(a) — distribue f'(a) sur (x-a) AVANT d'ajouter f(a), piège classique : une erreur de signe en distribuant si a ou f'(a) est négatif.";
    case "resoudre":
      return "f'(x)=0 est une équation du second degré (ou plus simple) — pense à chercher TOUTES les solutions, il peut y en avoir une SEULE (racine double) ou DEUX.";
    case "coordonnees":
      return "Piège fréquent : donner seulement l'abscisse trouvée à l'écran précédent. Un point de tangence a TOUJOURS 2 coordonnées — calcule aussi l'ordonnée y=f(x) pour chaque abscisse.";
    case "tangenteEnP":
      return "f(x) est déjà développé : dérive chaque terme séparément avec la règle de puissance (xⁿ)'=n·xⁿ⁻¹, additionne, puis substitue x=p pour obtenir f'(p).";
    case "trouverQ":
      return "f(x)-tangente(x) est un polynôme qui s'annule DEUX FOIS en x=p (racine double) — factorise-le pour repérer l'autre racine double, q.";
    case "verifierPente":
      return "Ne conclus pas trop vite : un point d'intersection n'est pas forcément un point de TANGENCE. Calcule f'(q) et compare-le à f'(p) — l'égalité des deux pentes est ce qui confirme la double tangence.";
  }
}

export function texteAideNiveau2(ecran: EcranTangente): string {
  switch (ecran) {
    case "substituer":
      return "Exemple : pour f(x)=x²+1 et a=2, f(2)=2²+1=5. Si f'(x)=2x (donnée), f'(2)=2·2=4.";
    case "tangente":
      return "Exemple : a=2, f(a)=5, f'(a)=4 → y=4(x-2)+5=4x-8+5=4x-3.";
    case "resoudre":
      return "Exemple : f'(x)=6x²-6=0 ⟹ x²=1 ⟹ x=-1 ou x=1 (deux solutions).";
    case "coordonnees":
      return "Exemple : pour x=1 avec f(x)=2x³-6x+1, f(1)=2-6+1=-3 → le point complet est (1;-3).";
    case "tangenteEnP":
      return "Exemple : f(x)=x⁴-4x³+4x²+x, f'(x)=4x³-12x²+8x+1, en p=0 : f'(0)=1, f(0)=0 → tangente y=1·(x-0)+0=x.";
    case "trouverQ":
      return "Exemple : f(x)-x=x⁴-4x³+4x²=x²(x-2)² — racine double en x=0 (connue, p) et racine double en x=2, donc q=2.";
    case "verifierPente":
      return "Exemple : f'(0)=1 (calculé à l'écran précédent) — si f'(2) vaut aussi 1, la double tangence est confirmée.";
  }
}

// ============================================================================
// Labels/placeholders des champs — nombre de champs déterminé DYNAMIQUEMENT côté composant
// (pattern add-as-needed, variante B) : 1 champ → "x" (jamais indexé), 2+ champs → "x_1","x_2"...
// ============================================================================

export function labelsChampsRacines(nb: number): string[] {
  if (nb <= 1) return ["x="];
  return Array.from({ length: nb }, (_, i) => `x_${i + 1}=`);
}

const EXEMPLES_RACINES = [-1, 1, -2, 2, -3, 3];

export function placeholdersChampsRacines(nb: number): string[] {
  if (nb <= 1) return ["ex : 2"];
  return Array.from({ length: nb }, (_, i) => `ex : ${EXEMPLES_RACINES[i] ?? i + 1}`);
}

/** "Point :" (1 seul point) ou "Point 1 :"/"Point 2 :"/... (plusieurs) — label texte SIMPLE
 * précédant les 2 champs x/y séparés d'une ligne (jamais de KaTeX, pas un fragment mathématique). */
export function labelPointCoordonnees(nb: number, index: number): string {
  return nb <= 1 ? "Point :" : `Point ${index + 1} :`;
}

// ============================================================================
// Valeurs CONFIRMÉES — formes canoniques (état actuel + récapitulatif). Toute forme
// algébriquement équivalente est acceptée par la vérification ; ces fonctions n'affichent qu'UNE
// forme correcte de référence.
// ============================================================================

function formatFAConfirmeeLatex(exercice: ExerciceTangentePointDonne): string {
  const a = exercice.a;
  const valeur = valeurFPointDonne(exercice, a);
  if (exercice.sousFamille === "polynomiale") return `f(${a})=${valeur}`;
  const radicande = exercice.m * a + exercice.p;
  return `f(${a})=${formatValeurRadicaleLatex(exercice.coeff, radicande)}`;
}

function formatFPrimeAConfirmeeLatex(exercice: ExerciceTangentePointDonne): string {
  const a = exercice.a;
  if (exercice.sousFamille === "polynomiale") return `f'(${a})=${deriveeFPointDonne(exercice, a)}`;
  const radicande = exercice.m * a + exercice.p;
  return `f'(${a})=${formatDeriveeRadicaleLatex(exercice.coeff, exercice.m, radicande)}`;
}

/** "+terme" ou "terme" (déjà signé "-...") — jamais un "+" juxtaposé à un terme commençant par
 * "-" (audit transversal, `promptauditdoublesigne.md`). */
function formatAdditionSigneeLatex(termeLatex: string): string {
  return termeLatex.startsWith("-") ? termeLatex : `+${termeLatex}`;
}

function formatTangenteConfirmeePointDonneLatex(exercice: ExerciceTangentePointDonne): string {
  const a = exercice.a;
  const fALatex = formatFAConfirmeeLatex(exercice).replace(`f(${a})=`, "");
  const fPrimeALatex = formatFPrimeAConfirmeeLatex(exercice).replace(`f'(${a})=`, "");
  return `y=${fPrimeALatex}(${formatFacteurXMoinsQ(a)})${formatAdditionSigneeLatex(fALatex)}`;
}

function formatRacinesConfirmeesLatex(exercice: ExerciceTangenteHorizontale): string {
  return exercice.racines.map((r) => `x=${r}`).join("\\text{ ou }");
}

function formatCoordonneesConfirmeesLatex(exercice: ExerciceTangenteHorizontale): string[] {
  return exercice.racines.map((r) => `(${r};${valeurFHorizontale(exercice, r)})`);
}

function formatFPrimePConfirmeeLatex(exercice: ExerciceTangenteDoubleTangence): string {
  return `f'(${exercice.p})=${deriveeFDoubleTangence(exercice, exercice.p)}`;
}

function formatTangenteConfirmeeDoubleTangenceLatex(exercice: ExerciceTangenteDoubleTangence): string {
  const p = exercice.p;
  const fP = valeurFDoubleTangence(exercice, p);
  const fPrimeP = deriveeFDoubleTangence(exercice, p);
  return `y=${fPrimeP}(${formatFacteurXMoinsQ(p)})${formatAdditionSigneeLatex(`${fP}`)}`;
}

function formatQConfirmeLatex(exercice: ExerciceTangenteDoubleTangence): string {
  return `q=${exercice.q}`;
}

function formatFPrimeQConfirmeeLatex(exercice: ExerciceTangenteDoubleTangence): string {
  return `f'(${exercice.q})=${deriveeFDoubleTangence(exercice, exercice.q)}`;
}

// ============================================================================
// Bloc "état actuel" — rappelle les valeurs CONFIRMÉES des écrans déjà traversés pour CET exercice
// (jamais dérivé de la saisie brute de l'élève, absent tant que rien n'est confirmé).
// ============================================================================

export function formatTermesEtatActuelLatex(exercice: ExerciceTangente, phase: EcranTangente): string[] | null {
  const ordre = ordreEcransTangente(exercice);
  const index = ordre.indexOf(phase);
  if (index === 0) return null;

  if (exercice.variante === "pointDonne") {
    return [formatFAConfirmeeLatex(exercice), formatFPrimeAConfirmeeLatex(exercice)];
  }
  if (exercice.variante === "horizontale") {
    return [formatRacinesConfirmeesLatex(exercice)];
  }
  // doubleTangence : 3 écrans, accumulation progressive. "t_{x=p}\equiv..." cohérent avec le label
  // du champ d'équation sur l'écran "tangenteEnP" (jamais "\text{tangente : }...").
  const tangenteLatex = formatTangenteConfirmeeDoubleTangenceLatex(exercice);
  const termes = [formatFPrimePConfirmeeLatex(exercice), `t_{x=${exercice.p}}\\equiv${rhsDeTangente(tangenteLatex)}`];
  if (index >= 2) termes.push(formatQConfirmeLatex(exercice));
  return termes;
}

// ============================================================================
// Récapitulatif final — réponse ATTENDUE, par écran RÉELLEMENT traversé (voir
// `ordreEcransTangente`).
// ============================================================================

export function formatReponseAttenduePhaseLatex(exercice: ExerciceTangente, ecran: EcranTangente): string[] {
  switch (ecran) {
    case "substituer": {
      const ex = exercice as ExerciceTangentePointDonne;
      return [formatFAConfirmeeLatex(ex), formatFPrimeAConfirmeeLatex(ex)];
    }
    case "tangente":
      return [formatTangenteConfirmeePointDonneLatex(exercice as ExerciceTangentePointDonne)];
    case "resoudre":
      return [formatRacinesConfirmeesLatex(exercice as ExerciceTangenteHorizontale)];
    case "coordonnees":
      return formatCoordonneesConfirmeesLatex(exercice as ExerciceTangenteHorizontale);
    case "tangenteEnP": {
      const ex = exercice as ExerciceTangenteDoubleTangence;
      return [formatFPrimePConfirmeeLatex(ex), formatTangenteConfirmeeDoubleTangenceLatex(ex)];
    }
    case "trouverQ":
      return [formatQConfirmeLatex(exercice as ExerciceTangenteDoubleTangence)];
    case "verifierPente":
      return [formatFPrimeQConfirmeeLatex(exercice as ExerciceTangenteDoubleTangence)];
  }
}
