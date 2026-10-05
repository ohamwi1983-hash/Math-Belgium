/**
 * Couche présentation (5e) — consignes/labels/aides/LaTeX pour 5gen26 ("Calculer f'(a) par la
 * définition"). Dépend librement des couches inférieures (jamais l'inverse) : réutilise
 * `valeurExacte`/`deriveeExacte` (`generateurs5e/definitionDerivee/index.ts`) pour l'affichage des
 * valeurs exactes (f(a), f'(a)) — même patron que `formatEtudeComplete.ts` réutilisant
 * `formatPolynomeLatex` depuis `generateurs5e/`.
 *
 * UNE SEULE valeur de `a` par exercice (voir `prompt5gen26unevaleurareecriture.md`) — la valeur est
 * TOUJOURS substituée dans les consignes/labels, jamais affichée sous forme générique "f(a)".
 */
import type { ExerciceDefinitionDerivee } from "../core5e/definitionDerivee.types";
import type { FractionExacte } from "../core5e/limites.types";
import { deriveeExacte, valeurExacte } from "../generateurs5e/definitionDerivee/index";
import { pgcd } from "../generateurs5e/limites/fraction";
import { ORDRE_COMPLET } from "../moteur5e/typesDefinitionDerivee";
import type { EcranDefinitionDerivee } from "../moteur5e/typesDefinitionDerivee";

// ============================================================================
// Fragments LaTeX de bas niveau.
// ============================================================================

function formatFractionLatex(f: FractionExacte): string {
  if (f.den === 1) return `${f.num}`;
  const signe = f.num < 0 ? "-" : "";
  return `${signe}\\dfrac{${Math.abs(f.num)}}{${f.den}}`;
}

/** "n" ou "(n)" — parenthésage systématique d'un nombre négatif utilisé comme facteur, pour
 * éviter toute ambiguïté visuelle avec l'opérateur qui précède. */
function formatFacteurSigne(n: number): string {
  return n < 0 ? `(${n})` : `${n}`;
}

/** "h", "h+c" ou "h-|c|" — h plus une constante entière. */
function formatHPlusConstante(c: number): string {
  if (c === 0) return "h";
  return c > 0 ? `h+${c}` : `h-${Math.abs(c)}`;
}

/** Polynôme à partir de coefficients ascendants [constante, coeff1, coeff2...] — même patron que
 * `formatPolynomeLatex` (`ui5e/formatAsymptoteOblique.ts`/`formatLimites.ts`), variable
 * paramétrable ("x" pour f(x), "h" pour un développement en h). */
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

function formatPolynomeHLatex(coeffs: number[]): string {
  return formatPolynomeVarLatex(coeffs, "h");
}

/** ±(coeff·facteurLatex)/denLatex — signe porté devant la fraction, jamais au numérateur. Le
 * coefficient "1" implicite n'est omis QUE s'il reste un `facteurLatex` pour porter le numérateur à
 * l'affichage — sinon (facteurLatex vide) le "1"/"-1" DOIT rester affiché, jamais un numérateur
 * vide "\dfrac{}{...}" (bug jumeau découvert lors de l'audit fractions non réduites,
 * `promptauditfractionsnonreduites.md`). */
function formatFractionAvecFacteurLatex(coeff: number, facteurLatex: string, denLatex: string): string {
  const signe = coeff < 0 ? "-" : "";
  const abs = Math.abs(coeff);
  const coeffAffiche = abs === 1 && facteurLatex !== "" ? "" : `${abs}`;
  return `${signe}\\dfrac{${coeffAffiche}${facteurLatex}}{${denLatex}}`;
}

/** Réduit |numerateur|/|denomCoeff| par leur PGCD — CHAQUE signe reste indépendant (un facteur
 * symbolique du dénominateur, ex. "(h+a)", n'est jamais affecté par cette réduction, seul le
 * COEFFICIENT numérique qui l'accompagne l'est) — audit transversal,
 * `promptauditfractionsnonreduites.md` (même bug que `formatTangentes.ts::formatFractionSurRacineLatex`,
 * adapté ici à un facteur linéaire plutôt qu'une racine). */
function reduireCoeffs(numerateur: number, denomCoeff: number): { num: number; denomCoeff: number } {
  const g = pgcd(numerateur, denomCoeff);
  return { num: numerateur / g, denomCoeff: denomCoeff / g };
}

/** "(lineaireLatex)" seul si le coefficient vaut 1 (implicite), "-(} " si -1, sinon
 * "coeff(lineaireLatex)" — jamais un "1(...)" littéral après réduction. */
function formatFacteurCoeffLineaire(coeff: number, lineaireLatex: string): string {
  const facteur = `(${lineaireLatex})`;
  if (coeff === 1) return facteur;
  if (coeff === -1) return `-${facteur}`;
  return `${formatFacteurSigne(coeff)}${facteur}`;
}

/** "(n)" sauf si n=1 (facteur neutre, omis entièrement) — jamais "(1)" littéral après réduction. */
function formatFacteurEntierOptionnel(n: number): string {
  return n === 1 ? "" : `(${n})`;
}

function formatFacteurXMoinsQ(q: number): string {
  if (q === 0) return "x";
  return q > 0 ? `x-${q}` : `x+${Math.abs(q)}`;
}

// ============================================================================
// f(x) — bloc de données. UNIQUEMENT f(x) — la valeur de `a` est annoncée dans la consigne
// générale, jamais répétée en ligne séparée (redondant).
// ============================================================================

export function formatFDeXLatex(exercice: ExerciceDefinitionDerivee): string {
  switch (exercice.famille) {
    case "affine":
      return `f(x)=${formatPolynomeVarLatex([exercice.p, exercice.m], "x")}`;
    case "quadratique":
      return `f(x)=${formatPolynomeVarLatex([exercice.p, 0, exercice.m], "x")}`;
    case "rationnelleSimple":
      return exercice.expo === 1 ? `f(x)=\\dfrac{${exercice.k}}{x}` : `f(x)=\\dfrac{${exercice.k}}{x^2}`;
    case "rationnelleLineaire":
      return `f(x)=\\dfrac{${formatPolynomeVarLatex([exercice.p, exercice.m], "x")}}{${formatFacteurXMoinsQ(exercice.q)}}`;
  }
}

export function formatTermesDonneesLatex(exercice: ExerciceDefinitionDerivee): string[] {
  return [formatFDeXLatex(exercice)];
}

export function consigneGenerale(exercice: ExerciceDefinitionDerivee): string {
  return `Calcule le nombre dérivé f'(${exercice.a}) à partir de sa définition en termes de limite.`;
}

// ============================================================================
// Question spécifique par écran — texte + (pour "quotient"/"limite") un fragment LaTeX central à
// rendre via `<Katex>` côté composant (`EtapeDevelopperDerivee.tsx`/`EtapeChampLibreDerivee.tsx`),
// jamais en texte plat avec crochets pour une fraction/limite. La valeur de `a` de CET exercice est
// systématiquement substituée, y compris dans l'expression du quotient simplifié affichée en
// écran 3 (réutilise `formatQuotientConfirmeLatex`, définie plus bas, seule source de vérité pour
// cette forme).
// ============================================================================

export interface QuestionSpecifique {
  texteAvant: string;
  /** Fragment LaTeX central, rendu séparément via `<Katex>` — absent pour "developper" (aucune
   * fraction/limite à empiler dans ce cas, texte simple suffisant). */
  latex?: string;
  texteApres?: string;
}

export function questionSpecifiqueEcran(exercice: ExerciceDefinitionDerivee, ecran: EcranDefinitionDerivee): QuestionSpecifique {
  const a = exercice.a;
  switch (ecran) {
    case "developper":
      return { texteAvant: `Calcule f(${a}), puis développe f(${a}+h) exprimé en fonction de h.` };
    case "quotient":
      return {
        texteAvant: "Donne le taux d'accroissement",
        latex: `\\dfrac{f(${a}+h)-f(${a})}{h}`,
        texteApres: "en le simplifiant au maximum.",
      };
    case "limite":
      return {
        texteAvant: "Calcul",
        latex: `f'(${a})=\\displaystyle\\lim_{h \\to 0}(${formatQuotientConfirmeLatex(exercice, a)})`,
      };
  }
}

// ============================================================================
// Libellés d'écran (récapitulatif) + labels de champs — valeur de `a` substituée partout.
// ============================================================================

export const LIBELLE_ECRAN: Record<EcranDefinitionDerivee, string> = {
  developper: "f(a) et f(a+h)",
  quotient: "Quotient simplifié",
  limite: "f'(a)",
};

export function labelFA(a: number): string {
  return `f(${a})=`;
}

export function labelFAH(a: number): string {
  return `f(${a}+h)=`;
}

export function labelQuotient(a: number): string {
  return `\\dfrac{f(${a}+h)-f(${a})}{h}=`;
}

export function labelLimite(a: number): string {
  return `f'(${a})=`;
}

// ============================================================================
// Aides — niveau 1 (technique/piège spécifique à la famille), niveau 2 (exemple substitué proche,
// jamais la réponse) — pièges documentés par famille (spec) : familles 1-2, erreurs de signe en
// développant (a+h)²/en distribuant un coefficient négatif ; familles 3-4, oubli du même
// dénominateur avant de pouvoir factoriser le h.
// ============================================================================

export function texteAideNiveau1(exercice: ExerciceDefinitionDerivee, ecran: EcranDefinitionDerivee): string {
  if (ecran === "developper") {
    switch (exercice.famille) {
      case "affine":
        return "f(a+h)=m(a+h)+p=ma+mh+p — développe simplement, aucun terme au carré ici.";
      case "quadratique":
        return "f(a+h)=m(a+h)²+p — développe (a+h)²=a²+2ah+h² AVANT de multiplier par m et de distribuer. Piège : oublier le terme croisé 2ah, ou une erreur de signe si m est négatif.";
      case "rationnelleSimple":
        return exercice.expo === 1
          ? "f(a+h)=k/(a+h) — ne développe rien, garde le dénominateur (a+h) tel quel pour l'instant."
          : "f(a+h)=k/(a+h)² — ne développe rien, garde le dénominateur (a+h)² tel quel pour l'instant.";
      case "rationnelleLineaire":
        return "f(a+h)=(m(a+h)+p)/((a+h)-q) — développe seulement le numérateur, garde (a+h-q) au dénominateur.";
    }
  }
  if (ecran === "quotient") {
    switch (exercice.famille) {
      case "affine":
        return "[f(a+h)-f(a)]/h=mh/h=m — le h se simplifie directement, sans reste.";
      case "quadratique":
        return "Factorise h au numérateur de f(a+h)-f(a) AVANT de diviser par h — il doit rester 2ma+mh une fois le h du dénominateur simplifié.";
      case "rationnelleSimple":
        return "Mets f(a+h)-f(a) au MÊME DÉNOMINATEUR avant de diviser par h — sinon impossible de factoriser le h au numérateur pour le simplifier.";
      case "rationnelleLineaire":
        return "Mets f(a+h)-f(a) au MÊME DÉNOMINATEUR (a+h-q)(a-q) avant de diviser par h — le numérateur se réduit alors à un multiple de h, qui s'annule avec le h du dénominateur du quotient.";
    }
  }
  return "Dans le quotient simplifié, il n'y a plus de h au dénominateur — remplace directement h par 0 pour obtenir f'(a).";
}

export function texteAideNiveau2(exercice: ExerciceDefinitionDerivee, ecran: EcranDefinitionDerivee): string {
  if (ecran === "developper") {
    switch (exercice.famille) {
      case "affine":
        return "Exemple : pour f(x)=2x+3, f(a+h)=2(a+h)+3=2a+2h+3.";
      case "quadratique":
        return "Exemple : pour f(x)=x²+1 et a=5, f(5+h)=(5+h)²+1=25+10h+h²+1=h²+10h+26.";
      case "rationnelleSimple":
        return exercice.expo === 1 ? "Exemple : pour f(x)=4/x et a=2, f(2+h)=4/(2+h)." : "Exemple : pour f(x)=4/x² et a=2, f(2+h)=4/(2+h)².";
      case "rationnelleLineaire":
        return "Exemple : pour f(x)=(x+1)/(x-2) et a=3, f(3+h)=((3+h)+1)/((3+h)-2)=(h+4)/(h+1).";
    }
  }
  if (ecran === "quotient") {
    switch (exercice.famille) {
      case "affine":
        return "Exemple : f(x)=2x+3, f(a+h)-f(a)=(2a+2h+3)-(2a+3)=2h, donc le quotient vaut 2h/h=2.";
      case "quadratique":
        return "Exemple : a=5, f(5+h)-f(5)=(h²+10h+26)-26=h²+10h=h(h+10), donc le quotient vaut h(h+10)/h=h+10.";
      case "rationnelleSimple":
        return "Exemple : f(x)=4/x, a=2 : [4/(2+h)-4/2]/h = [(8-4(2+h))/(2(2+h))]/h = [-4h/(2(2+h))]/h = -4/(2(2+h)).";
      case "rationnelleLineaire":
        return "Exemple : le numérateur mis au même dénominateur se réduit toujours à une constante × h — c'est CE h-là qui se simplifie avec le h du dénominateur du quotient.";
    }
  }
  return "Exemple : si le quotient simplifié vaut 2a+h, alors en faisant h→0 on obtient directement f'(a)=2a.";
}

// ============================================================================
// Développement/quotient CONFIRMÉS — formes canoniques (état actuel + récapitulatif + question
// spécifique écran 3). Toute forme algébriquement équivalente est acceptée par la vérification ;
// ces fonctions n'affichent qu'UNE forme correcte de référence.
// ============================================================================

function formatDeveloppementConfirmeLatex(exercice: ExerciceDefinitionDerivee, a: number): string {
  switch (exercice.famille) {
    case "affine":
      return formatPolynomeHLatex([exercice.m * a + exercice.p, exercice.m]);
    case "quadratique":
      return formatPolynomeHLatex([exercice.m * a * a + exercice.p, 2 * exercice.m * a, exercice.m]);
    case "rationnelleSimple":
      return exercice.expo === 1 ? `\\dfrac{${exercice.k}}{${formatHPlusConstante(a)}}` : `\\dfrac{${exercice.k}}{(${formatHPlusConstante(a)})^2}`;
    case "rationnelleLineaire":
      return `\\dfrac{${formatPolynomeHLatex([exercice.m * a + exercice.p, exercice.m])}}{${formatHPlusConstante(a - exercice.q)}}`;
  }
}

function formatQuotientConfirmeLatex(exercice: ExerciceDefinitionDerivee, a: number): string {
  switch (exercice.famille) {
    case "affine":
      return `${exercice.m}`;
    case "quadratique":
      return formatPolynomeHLatex([2 * exercice.m * a, exercice.m]);
    case "rationnelleSimple": {
      if (exercice.expo === 1) {
        const { num, denomCoeff } = reduireCoeffs(-exercice.k, a);
        return formatFractionAvecFacteurLatex(num, "", formatFacteurCoeffLineaire(denomCoeff, formatHPlusConstante(a)));
      }
      const { num, denomCoeff } = reduireCoeffs(-exercice.k, a * a);
      const numFacteur = `(${formatPolynomeHLatex([2 * a, 1])})`;
      const denLatex = denomCoeff === 1 ? `(${formatHPlusConstante(a)})^2` : `${denomCoeff}(${formatHPlusConstante(a)})^2`;
      return formatFractionAvecFacteurLatex(num, numFacteur, denLatex);
    }
    case "rationnelleLineaire": {
      const numConst = -(exercice.m * exercice.q + exercice.p);
      const denomCoeffRaw = a - exercice.q;
      const { num, denomCoeff } = reduireCoeffs(numConst, denomCoeffRaw);
      const denomLatex = `(${formatHPlusConstante(denomCoeffRaw)})${formatFacteurEntierOptionnel(denomCoeff)}`;
      return formatFractionAvecFacteurLatex(num, "", denomLatex);
    }
  }
}

function formatFAConfirmeLatex(exercice: ExerciceDefinitionDerivee, a: number): string {
  return `f(a)=${formatFractionLatex(valeurExacte(exercice, a))}`;
}

function formatDeveloppementEtatActuelLatex(exercice: ExerciceDefinitionDerivee, a: number): string {
  return `f(a+h)=${formatDeveloppementConfirmeLatex(exercice, a)}`;
}

function formatQuotientEtatActuelLatex(exercice: ExerciceDefinitionDerivee, a: number): string {
  return `\\dfrac{f(a+h)-f(a)}{h}=${formatQuotientConfirmeLatex(exercice, a)}`;
}

function formatLimiteConfirmeeLatex(exercice: ExerciceDefinitionDerivee, a: number): string {
  return `f'(a)=${formatFractionLatex(deriveeExacte(exercice, a))}`;
}

// ============================================================================
// Bloc "état actuel" — récapitule les valeurs CONFIRMÉES de l'exercice EN COURS.
// ============================================================================

export function formatTermesEtatActuelLatex(exercice: ExerciceDefinitionDerivee, ecran: EcranDefinitionDerivee): string[] | null {
  const indexEcran = ORDRE_COMPLET.indexOf(ecran);
  if (indexEcran === 0) return null;
  const a = exercice.a;
  const termes: string[] = [formatFAConfirmeLatex(exercice, a), formatDeveloppementEtatActuelLatex(exercice, a)];
  if (indexEcran >= 2) termes.push(formatQuotientEtatActuelLatex(exercice, a));
  return termes;
}

// ============================================================================
// Récapitulatif final — réponse ATTENDUE pour chaque écran (les 3 traversés).
// ============================================================================

export function formatReponseAttendueEcranLatex(exercice: ExerciceDefinitionDerivee, ecran: EcranDefinitionDerivee): string[] {
  const a = exercice.a;
  switch (ecran) {
    case "developper":
      return [formatFAConfirmeLatex(exercice, a), formatDeveloppementEtatActuelLatex(exercice, a)];
    case "quotient":
      return [formatQuotientEtatActuelLatex(exercice, a)];
    case "limite":
      return [formatLimiteConfirmeeLatex(exercice, a)];
  }
}
