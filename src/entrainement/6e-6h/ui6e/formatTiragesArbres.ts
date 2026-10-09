import type { ExerciceFamilleA, ExerciceFamilleB, ExerciceFamilleC, ExerciceTiragesArbres, FractionExacte } from "../core6e/tiragesArbres.types";
import type { PhaseTiragesArbres, ResultatExerciceTiragesArbres } from "../moteur6e/typesTiragesArbres";
import { phasesPourExercice } from "../moteur6e/typesTiragesArbres";

/**
 * Couche ui (6e) — textes de consigne/aide + formatage LaTeX pour `6gen31`. Dispatch sur
 * `exercice.famille` PUIS `phase` (et le champ pertinent de l'exercice où besoin), même principe que
 * `formatProbabilitesEnsembles.ts` (6gen30). Le placeholder standard "(forme exacte ou décimale
 * arrondie au centième)" annonce la tolérance RÉELLEMENT vérifiée côté
 * `moteur6e/verificationProbabilites.ts`/`verificationTiragesArbres.ts` (0,01) — jamais une valeur
 * inventée ici.
 *
 * **Toutes les quantités affichées se recalculent ici en fractions EXACTES** (jamais un flottant
 * arrondi comparé) — même principe de duplication indépendante entre couches que
 * `moteur6e/verificationTiragesArbres.ts` (chaque couche recalcule, jamais d'import croisé).
 *
 * **Piège du nom de variable `a` (jamais `p0`)** — voir l'en-tête de
 * `moteur6e/verificationTiragesArbres.ts`, `diagnostiquerCEcran1` : le tokeniseur d'
 * `expressionExponentielle.ts` lit "p0" comme l'identifiant "p" suivi du nombre "0" (jamais un seul
 * identifiant), donc TOUT texte destiné à être retapé par l'élève dans un champ libre (placeholder,
 * aide, énoncé) utilise `a` pour désigner P(face spéciale), jamais `p0`.
 */

export interface ChampDef {
  label: string;
  placeholder: string;
}

export interface AideAvecLatex {
  texte: string;
  latex: string | null;
}

const ANNONCE_TOLERANCE = "(forme exacte ou décimale arrondie au centième)";

function pgcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b !== 0) [a, b] = [b, a % b];
  return a || 1;
}

/** Fraction irréductible LaTeX pour un rationnel EXACT num/den — jamais de décimal (CLAUDE.md). */
export function formatFractionLatex(num: number, den: number): string {
  if (num === 0) return "0";
  const signe = num < 0 !== den < 0 ? "-" : "";
  let n = Math.abs(num);
  let d = Math.abs(den);
  const g = pgcd(n, d);
  n /= g;
  d /= g;
  return d === 1 ? `${signe}${n}` : `${signe}\\dfrac{${n}}{${d}}`;
}

function formatFraction(f: FractionExacte): string {
  return formatFractionLatex(f.num, f.den);
}

/** Décimal court (2 décimales, virgule française) — affichage SEULEMENT (jamais la valeur de
 * comparaison utilisée côté vérification, qui reste toujours exacte). */
function formatDecimalCourt(v: number): string {
  return String(Math.round(v * 100) / 100).replace(".", "{,}");
}

// ============================================================================
// Famille A — Tirages avec/sans remise.
// ============================================================================

function factorielleA(n: number): number {
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
}
function coefficientBinomialA(n: number, k: number): number {
  if (k < 0 || k > n) return 0;
  return factorielleA(n) / (factorielleA(k) * factorielleA(n - k));
}

/** P(k tirages de la couleur `nCouleur`) — fraction EXACTE (num/den entiers). */
function fractionMemeCouleur(nCouleur: number, nAutre: number, k: number, avecRemise: boolean): FractionExacte {
  const n = nCouleur + nAutre;
  if (avecRemise) return { num: Math.pow(nCouleur, k), den: Math.pow(n, k) };
  let num = 1;
  let den = 1;
  for (let i = 0; i < k; i++) {
    num *= nCouleur - i;
    den *= n - i;
  }
  return { num, den };
}

function fractionSomme(a: FractionExacte, b: FractionExacte): FractionExacte {
  return { num: a.num * b.den + b.num * a.den, den: a.den * b.den };
}

function fractionExactementM(ex: ExerciceFamilleA): FractionExacte {
  const n = ex.n1 + ex.n2;
  if (ex.avecRemise) {
    return { num: coefficientBinomialA(ex.k, ex.m) * Math.pow(ex.n1, ex.m) * Math.pow(ex.n2, ex.k - ex.m), den: Math.pow(n, ex.k) };
  }
  return { num: coefficientBinomialA(ex.n1, ex.m) * coefficientBinomialA(ex.n2, ex.k - ex.m), den: coefficientBinomialA(n, ex.k) };
}

function modeTirageTexte(avecRemise: boolean): string {
  return avecRemise ? "avec remise" : "sans remise";
}

function consigneGeneraleA(ex: ExerciceFamilleA): string {
  return `Une urne contient ${ex.n1} boules ${ex.labelCouleur1} et ${ex.n2} boules ${ex.labelCouleur2}. On tire successivement ${ex.k} boules au hasard, ${modeTirageTexte(ex.avecRemise)}.`;
}

function blocDonneesA(ex: ExerciceFamilleA): string[] {
  return [`n_1=${ex.n1}\\ (${ex.labelCouleur1})`, `n_2=${ex.n2}\\ (${ex.labelCouleur2})`, `k=${ex.k}`];
}

function consigneEcranA(ex: ExerciceFamilleA, phase: PhaseTiragesArbres): string {
  if (phase === "aEcran1") return `Calcule la probabilité d'obtenir ${ex.k} fois la même couleur, pour CHAQUE couleur séparément.`;
  if (phase === "aEcran2") return `Calcule P("les ${ex.k} boules tirées sont de la même couleur"), à partir des 2 valeurs CORRECTES de l'étape précédente.`;
  return `Calcule P("exactement ${ex.m} boule(s) ${ex.labelCouleur1}"), sachant que le tirage est ${modeTirageTexte(ex.avecRemise)}.`;
}

function etatActuelA(ex: ExerciceFamilleA, phase: PhaseTiragesArbres): string[] | null {
  if (phase === "aEcran1") return null;
  const p1 = fractionMemeCouleur(ex.n1, ex.n2, ex.k, ex.avecRemise);
  const p2 = fractionMemeCouleur(ex.n2, ex.n1, ex.k, ex.avecRemise);
  const base = [`P(${ex.k}\\ ${ex.labelCouleur1})=${formatFraction(p1)}`, `P(${ex.k}\\ ${ex.labelCouleur2})=${formatFraction(p2)}`];
  if (phase === "aEcran2") return base;
  return [...base, `P(\\text{même couleur})=${formatFraction(fractionSomme(p1, p2))}`];
}

function champsA(ex: ExerciceFamilleA, phase: PhaseTiragesArbres): ChampDef[] {
  if (phase === "aEcran1") {
    return [
      { label: `P(${ex.k} ${ex.labelCouleur1}) =`, placeholder: `ex : 0,25 ${ANNONCE_TOLERANCE}` },
      { label: `P(${ex.k} ${ex.labelCouleur2}) =`, placeholder: `ex : 0,25 ${ANNONCE_TOLERANCE}` },
    ];
  }
  if (phase === "aEcran2") return [{ label: "P(même couleur) =", placeholder: `ex : 0,5 ${ANNONCE_TOLERANCE}` }];
  return [{ label: `P(exactement ${ex.m} ${ex.labelCouleur1}) =`, placeholder: `ex : 0,4 ${ANNONCE_TOLERANCE}` }];
}

function aideNiveau1A(_ex: ExerciceFamilleA, phase: PhaseTiragesArbres): AideAvecLatex {
  if (phase === "aEcran1") return { texte: "Avec remise, chaque tirage est indépendant : puissance simple. Sans remise, chaque tirage réduit l'effectif restant : produit de fractions décroissantes.", latex: null };
  if (phase === "aEcran2") return { texte: "Additionne les 2 valeurs CORRECTES de l'étape précédente — les 2 couleurs sont incompatibles.", latex: null };
  return { texte: "Avec remise, les tirages sont indépendants (loi binomiale). Sans remise, il faut compter les combinaisons directement (loi hypergéométrique) — la bonne formule dépend du mode de tirage précisé dans l'énoncé.", latex: null };
}

function aideNiveau2A(ex: ExerciceFamilleA, phase: PhaseTiragesArbres): AideAvecLatex {
  const n = ex.n1 + ex.n2;
  if (phase === "aEcran1") {
    const gauche = ex.avecRemise ? `\\left(\\dfrac{${ex.n1}}{${n}}\\right)^{${ex.k}}\\quad\\left(\\dfrac{${ex.n2}}{${n}}\\right)^{${ex.k}}` : `\\dfrac{${ex.n1}}{${n}}\\times\\cdots\\quad\\dfrac{${ex.n2}}{${n}}\\times\\cdots`;
    return { texte: "Formule appropriée (résolution non faite) :", latex: gauche };
  }
  if (phase === "aEcran2") {
    const p1 = fractionMemeCouleur(ex.n1, ex.n2, ex.k, ex.avecRemise);
    const p2 = fractionMemeCouleur(ex.n2, ex.n1, ex.k, ex.avecRemise);
    return { texte: "Les 2 valeurs à additionner (somme non faite) :", latex: `${formatFraction(p1)}+${formatFraction(p2)}` };
  }
  const latex = ex.avecRemise ? `C(${ex.k},${ex.m})\\cdot p^{${ex.m}}\\cdot(1-p)^{${ex.k - ex.m}}` : `\\dfrac{C(${ex.n1},${ex.m})\\cdot C(${ex.n2},${ex.k - ex.m})}{C(${n},${ex.k})}`;
  return { texte: `Formule appropriée pour un tirage ${modeTirageTexte(ex.avecRemise)} (non substituée) :`, latex };
}

// ============================================================================
// Famille B — Permutations et dérangements.
// ============================================================================

function factorielleB(n: number): number {
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
}
function coefficientBinomialB(n: number, k: number): number {
  if (k < 0 || k > n) return 0;
  return factorielleB(n) / (factorielleB(k) * factorielleB(n - k));
}
const DERANGEMENTS_B: readonly number[] = [1, 0, 1, 2, 9, 44];
const RAPPEL_DERANGEMENTS = "D(0)=1,\\ D(1)=0,\\ D(2)=1,\\ D(3)=2,\\ D(4)=9,\\ D(5)=44";

function consigneGeneraleB(ex: ExerciceFamilleB): string {
  if (ex.contexte === "lettres") {
    return `${ex.n} lettres numérotées de 1 à ${ex.n} sont placées aléatoirement dans ${ex.n} enveloppes numérotées de 1 à ${ex.n} (une lettre par enveloppe). Une lettre est "bien placée" si son numéro correspond à celui de l'enveloppe.`;
  }
  return `Une playlist de ${ex.n} chansons numérotées de 1 à ${ex.n} est lue dans un ordre entièrement aléatoire. Une chanson est "bien placée" si sa position de lecture correspond à son numéro d'origine.`;
}

function blocDonneesB(ex: ExerciceFamilleB): string[] {
  return [`n=${ex.n}`];
}

function consigneEcranB(ex: ExerciceFamilleB, phase: PhaseTiragesArbres): string {
  if (phase === "bEcran1") {
    return ex.demandeEcran1 === "une" ? `Calcule la probabilité que l'élément n°${ex.positionsEcran1[0]} soit bien placé.` : `Calcule la probabilité que les éléments n°${ex.positionsEcran1[0]} ET n°${ex.positionsEcran1[1]} soient bien placés SIMULTANÉMENT.`;
  }
  if (phase === "bEcran2") return "Calcule la probabilité que TOUS les éléments soient bien placés (arrangement entièrement correct).";
  if (phase === "bEcran3") return `Calcule la probabilité qu'EXACTEMENT ${ex.k} élément(s) soi(en)t bien placé(s) — ni plus, ni moins.`;
  return "Calcule la probabilité qu'AUCUN élément ne soit bien placé.";
}

function etatActuelB(ex: ExerciceFamilleB, phase: PhaseTiragesArbres): string[] | null {
  if (phase === "bEcran1") return null;
  // Fraction EXACTE d'abord (jamais un décimal seul, CLAUDE.md "fraction irréductible, jamais de
  // décimal") — cohérent avec `formatReponseAttenduePhaseLatex` (même famille B, même écran) qui
  // affiche déjà ces 3 valeurs comme fractions exactes, jamais arrondies.
  const numPositions = ex.demandeEcran1 === "une" ? 1 : factorielleB(ex.n - 2);
  const denPositions = ex.demandeEcran1 === "une" ? ex.n : factorielleB(ex.n);
  const pPositions = numPositions / denPositions;
  const base = [`P(\\text{position(s) fixée(s)})=${formatFractionLatex(numPositions, denPositions)}=${formatDecimalCourt(pPositions)}`];
  if (phase === "bEcran2") return base;
  const pToutCorrect = 1 / factorielleB(ex.n);
  const avecEcran2 = [...base, `P(\\text{tout correct})=\\dfrac{1}{${ex.n}!}=${formatDecimalCourt(pToutCorrect)}`];
  if (phase === "bEcran3") return avecEcran2;
  const numK = coefficientBinomialB(ex.n, ex.k) * DERANGEMENTS_B[ex.n - ex.k];
  const denK = factorielleB(ex.n);
  return [...avecEcran2, `P(\\text{exactement }${ex.k})=${formatFractionLatex(numK, denK)}=${formatDecimalCourt(numK / denK)}`];
}

function champsB(ex: ExerciceFamilleB, phase: PhaseTiragesArbres): ChampDef[] {
  if (phase === "bEcran1") return [{ label: "P(bien placé) =", placeholder: `ex : 0,25 ${ANNONCE_TOLERANCE}` }];
  if (phase === "bEcran2") return [{ label: "P(tout correct) =", placeholder: `ex : 0,04 ${ANNONCE_TOLERANCE}` }];
  if (phase === "bEcran3") return [{ label: `P(exactement ${ex.k}) =`, placeholder: `ex : 0,33 ${ANNONCE_TOLERANCE}` }];
  return [{ label: "P(aucun correct) =", placeholder: `ex : 0,38 ${ANNONCE_TOLERANCE}` }];
}

function aideNiveau1B(phase: PhaseTiragesArbres): AideAvecLatex {
  if (phase === "bEcran1") return { texte: "Une position fixée : (n-1)!/n!, ce qui se simplifie en 1/n. Deux positions fixées SIMULTANÉMENT : (n-2)!/n!.", latex: null };
  if (phase === "bEcran2") return { texte: "Un seul arrangement (l'identité) est totalement correct, parmi n! arrangements équiprobables.", latex: null };
  if (phase === "bEcran3") return { texte: "\"Exactement k correctes\" impose que les n-k positions RESTANTES forment un DÉRANGEMENT COMPLET (aucune correcte parmi elles) — pas simplement \"au moins une incorrecte\".", latex: null };
  return { texte: "Aucune position correcte = un DÉRANGEMENT COMPLET des n éléments, D(n).", latex: null };
}

function aideNiveau2B(ex: ExerciceFamilleB, phase: PhaseTiragesArbres): AideAvecLatex {
  if (phase === "bEcran1") {
    const latex = ex.demandeEcran1 === "une" ? `\\dfrac{(${ex.n}-1)!}{${ex.n}!}=\\dfrac{1}{${ex.n}}` : `\\dfrac{(${ex.n}-2)!}{${ex.n}!}`;
    return { texte: "Formule substituée :", latex };
  }
  if (phase === "bEcran2") return { texte: "Formule substituée :", latex: `\\dfrac{1}{${ex.n}!}` };
  if (phase === "bEcran3") return { texte: `Numérateur (division par ${ex.n}! non faite), rappel des dérangements :`, latex: `C(${ex.n},${ex.k})\\cdot D(${ex.n - ex.k})\\qquad ${RAPPEL_DERANGEMENTS}` };
  return { texte: "Rappel des dérangements (division par n! non faite) :", latex: `D(${ex.n})\\qquad ${RAPPEL_DERANGEMENTS}` };
}

// ============================================================================
// Famille C — Distributions non uniformes, dé truqué.
// ============================================================================

// Note : `consigneGenerale*` est rendu en PROSE PURE (<p className="prompt-text">, jamais passé à
// KaTeX — voir `EtapeChampsTiragesArbres.tsx`) : ne JAMAIS y insérer de commande LaTeX
// (`\dfrac{...}` etc, piège trouvé par vérification Playwright visuelle, voir consigne de la
// tâche) — toute valeur numérique EXACTE (fraction) vit exclusivement dans `blocDonnees` (rendu,
// lui, sous KaTeX). Un entier simple ("k=2", "r=2") reste un texte parfaitement lisible tel quel.
function consigneGeneraleC(ex: ExerciceFamilleC): string {
  if (ex.sousType === "special") {
    return `On lance un dé à 6 faces truqué. La face ${ex.faceSpeciale} a une probabilité fixée a (donnée ci-dessous). Les 5 autres faces sont équiprobables entre elles (probabilité p chacune, INCONNUE).`;
  }
  return `On lance un dé à 6 faces truqué. Les faces paires sont équiprobables entre elles (probabilité p chacune), les faces impaires équiprobables entre elles (probabilité q chacune), avec la relation p=${ex.r}·q (r=${ex.r} donné).`;
}

function blocDonneesC(ex: ExerciceFamilleC): string[] {
  if (ex.sousType === "special") return [`\\text{face spéciale} = ${ex.faceSpeciale}`, `a=${formatFraction(ex.p0)}`];
  return [`p=${ex.r}\\,q`];
}

function cible3Texte(ex: Extract<ExerciceFamilleC, { sousType: "parite" }>): string {
  if (ex.ecran3Cible === "pair") return "Calcule P(obtenir une face paire).";
  if (ex.ecran3Cible === "impair") return "Calcule P(obtenir une face impaire).";
  return `Calcule P(obtenir une face parmi {${(ex.sousEnsemble ?? []).join(", ")}}).`;
}

function consigneEcranC(ex: ExerciceFamilleC, phase: PhaseTiragesArbres): string {
  if (phase === "cEcran1") {
    if (ex.sousType === "special") return "Pose l'équation traduisant \"la somme de toutes les probabilités élémentaires vaut 1\", en utilisant a (déjà connu) et p (l'inconnue).";
    return "Pose les 2 équations du système : la relation p=r·q donnée par l'énoncé, PUIS la somme totale des probabilités = 1.";
  }
  if (phase === "cEcran2") return "Résous le système CORRECT de l'étape précédente pour obtenir la ou les probabilités inconnues.";
  if (ex.sousType === "special") return `Calcule P(face ${ex.faceSpeciale} OU face ${ex.autreFace}), à partir des valeurs CORRECTES de l'étape précédente.`;
  return cible3Texte(ex);
}

function equationsCorrectesC(ex: ExerciceFamilleC): string[] {
  return ex.sousType === "special" ? ["a+5p=1"] : [`p=${ex.r}q`, "3p+3q=1"];
}

function etatActuelC(ex: ExerciceFamilleC, phase: PhaseTiragesArbres): string[] | null {
  if (phase === "cEcran1") return null;
  const equations = equationsCorrectesC(ex);
  if (phase === "cEcran2") return equations;
  if (ex.sousType === "special") return [...equations, `p=${formatFraction(ex.p)}`];
  return [...equations, `p=${formatFraction(ex.p)}`, `q=${formatFraction(ex.q)}`];
}

function champsC(ex: ExerciceFamilleC, phase: PhaseTiragesArbres): ChampDef[] {
  if (phase === "cEcran1") {
    if (ex.sousType === "special") return [{ label: "Équation (somme totale) :", placeholder: "ex : a+5p=1" }];
    // Labels COURTS (jamais "Équation (contrainte p=r·q) :", trop long) : `EtapeChampsTiragesArbres`
    // rend 2 champs côte à côte en `.field-inline` (label + champ sur la même ligne, `flex:1` sur le
    // champ SEULEMENT à l'intérieur de son propre conteneur) — un libellé long comprime alors le
    // champ visible à quelques pixels dans le `.field-row` PARENT (piège trouvé par vérification
    // Playwright visuelle, capture d'écran réelle — voir consigne de la tâche).
    return [
      { label: "Contrainte (p=r·q) :", placeholder: "ex : p=2*q" },
      { label: "Somme totale :", placeholder: "ex : 3p+3q=1" },
    ];
  }
  if (phase === "cEcran2") {
    if (ex.sousType === "special") return [{ label: "p =", placeholder: `ex : 0,08 ${ANNONCE_TOLERANCE}` }];
    return [
      { label: "p =", placeholder: `ex : 0,22 ${ANNONCE_TOLERANCE}` },
      { label: "q =", placeholder: `ex : 0,11 ${ANNONCE_TOLERANCE}` },
    ];
  }
  return [{ label: "Probabilité =", placeholder: `ex : 0,5 ${ANNONCE_TOLERANCE}` }];
}

function aideNiveau1C(_ex: ExerciceFamilleC, phase: PhaseTiragesArbres): AideAvecLatex {
  if (phase === "cEcran1") return { texte: "La somme de toutes les probabilités élémentaires vaut TOUJOURS 1 — en plus de la ou des contraintes données par l'énoncé.", latex: null };
  if (phase === "cEcran2") return { texte: "Substitue la contrainte dans l'équation de somme totale pour isoler chaque inconnue.", latex: null };
  return { texte: "Utilise les valeurs CORRECTES de p (et q) de l'étape précédente — jamais recalculées autrement.", latex: null };
}

function aideNiveau2C(ex: ExerciceFamilleC, phase: PhaseTiragesArbres): AideAvecLatex {
  if (phase === "cEcran1") {
    if (ex.sousType === "special") return { texte: "Équation de somme totale (a et p déjà nommés) :", latex: "a+5p=1" };
    return { texte: "Équation de somme totale affichée — la contrainte spécifique (p=r·q) reste à traduire :", latex: "3p+3q=1" };
  }
  if (phase === "cEcran2") {
    if (ex.sousType === "special") return { texte: "Formule (résolution non faite) :", latex: `p=\\dfrac{1-a}{5}` };
    return { texte: "Formules (résolution non faite) :", latex: `q=\\dfrac{1}{3(${ex.r}+1)}\\qquad p=${ex.r}\\,q` };
  }
  if (ex.sousType === "special") return { texte: "Les 2 valeurs à additionner (somme non faite) :", latex: `a=${formatFraction(ex.p0)}\\qquad p=${formatFraction(ex.p)}` };
  return { texte: "Valeurs connues (calcul final non fait) :", latex: `p=${formatFraction(ex.p)}\\qquad q=${formatFraction(ex.q)}` };
}

// ============================================================================
// Dispatch commun.
// ============================================================================

export function consigneGenerale(exercice: ExerciceTiragesArbres): string {
  if (exercice.famille === "A") return consigneGeneraleA(exercice);
  if (exercice.famille === "B") return consigneGeneraleB(exercice);
  return consigneGeneraleC(exercice);
}

export function blocDonnees(exercice: ExerciceTiragesArbres): string[] {
  if (exercice.famille === "A") return blocDonneesA(exercice);
  if (exercice.famille === "B") return blocDonneesB(exercice);
  return blocDonneesC(exercice);
}

export function consigneEcran(exercice: ExerciceTiragesArbres, phase: PhaseTiragesArbres): string {
  if (exercice.famille === "A") return consigneEcranA(exercice, phase);
  if (exercice.famille === "B") return consigneEcranB(exercice, phase);
  return consigneEcranC(exercice, phase);
}

export function etatActuel(exercice: ExerciceTiragesArbres, phase: PhaseTiragesArbres): string[] | null {
  if (exercice.famille === "A") return etatActuelA(exercice, phase);
  if (exercice.famille === "B") return etatActuelB(exercice, phase);
  return etatActuelC(exercice, phase);
}

export function champsEcran(exercice: ExerciceTiragesArbres, phase: PhaseTiragesArbres): ChampDef[] {
  if (exercice.famille === "A") return champsA(exercice, phase);
  if (exercice.famille === "B") return champsB(exercice, phase);
  return champsC(exercice, phase);
}

export function aideNiveau1(exercice: ExerciceTiragesArbres, phase: PhaseTiragesArbres): AideAvecLatex {
  if (exercice.famille === "A") return aideNiveau1A(exercice, phase);
  if (exercice.famille === "B") return aideNiveau1B(phase);
  return aideNiveau1C(exercice, phase);
}

export function aideNiveau2(exercice: ExerciceTiragesArbres, phase: PhaseTiragesArbres): AideAvecLatex {
  if (exercice.famille === "A") return aideNiveau2A(exercice, phase);
  if (exercice.famille === "B") return aideNiveau2B(exercice, phase);
  return aideNiveau2C(exercice, phase);
}

export const LIBELLE_PHASE: Record<PhaseTiragesArbres, string> = {
  aEcran1: "Étape 1 (probabilité par couleur)",
  aEcran2: "Étape 2 (toutes même couleur)",
  aEcran3: "Étape 3 (exactement m d'une couleur)",
  bEcran1: "Étape 1 (position(s) fixée(s))",
  bEcran2: "Étape 2 (arrangement entièrement correct)",
  bEcran3: "Étape 3 (exactement k correctes)",
  bEcran4: "Étape 4 (aucune correcte)",
  cEcran1: "Étape 1 (système d'équations)",
  cEcran2: "Étape 2 (résolution)",
  cEcran3: "Étape 3 (probabilité composée)",
};

export const LIBELLE_FAMILLE: Record<ExerciceTiragesArbres["famille"], string> = {
  A: "A — Tirages avec/sans remise",
  B: "B — Permutations et dérangements",
  C: "C — Dé truqué, distributions non uniformes",
};

/** Récapitulatif final — réponse CORRECTE de chaque écran, jamais recalculée depuis la saisie
 * élève (CLAUDE.md). */
export function formatReponseAttenduePhaseLatex(exercice: ExerciceTiragesArbres, phase: PhaseTiragesArbres): string[] {
  if (exercice.famille === "A") {
    const p1 = fractionMemeCouleur(exercice.n1, exercice.n2, exercice.k, exercice.avecRemise);
    const p2 = fractionMemeCouleur(exercice.n2, exercice.n1, exercice.k, exercice.avecRemise);
    if (phase === "aEcran1") return [`P(${exercice.k}\\ ${exercice.labelCouleur1})=${formatFraction(p1)}`, `P(${exercice.k}\\ ${exercice.labelCouleur2})=${formatFraction(p2)}`];
    if (phase === "aEcran2") return [`P(\\text{même couleur})=${formatFraction(fractionSomme(p1, p2))}`];
    return [`P(\\text{exactement }${exercice.m})=${formatFraction(fractionExactementM(exercice))}`];
  }
  if (exercice.famille === "B") {
    if (phase === "bEcran1") {
      const p = exercice.demandeEcran1 === "une" ? { num: 1, den: exercice.n } : { num: factorielleB(exercice.n - 2), den: factorielleB(exercice.n) };
      return [`P(\\text{position(s) fixée(s)})=${formatFraction(p)}`];
    }
    if (phase === "bEcran2") return [`P(\\text{tout correct})=${formatFractionLatex(1, factorielleB(exercice.n))}`];
    if (phase === "bEcran3") return [`P(\\text{exactement }${exercice.k})=${formatFractionLatex(coefficientBinomialB(exercice.n, exercice.k) * DERANGEMENTS_B[exercice.n - exercice.k], factorielleB(exercice.n))}`];
    return [`P(\\text{aucune correcte})=${formatFractionLatex(DERANGEMENTS_B[exercice.n], factorielleB(exercice.n))}`];
  }
  const equations = equationsCorrectesC(exercice);
  if (phase === "cEcran1") return equations;
  if (phase === "cEcran2") return exercice.sousType === "special" ? [`p=${formatFraction(exercice.p)}`] : [`p=${formatFraction(exercice.p)}`, `q=${formatFraction(exercice.q)}`];
  if (exercice.sousType === "special") return [`P(\\text{face }${exercice.faceSpeciale}\\text{ ou }${exercice.autreFace})=${formatFractionLatex(exercice.p0.num * exercice.p.den + exercice.p.num * exercice.p0.den, exercice.p0.den * exercice.p.den)}`];
  if (exercice.ecran3Cible === "pair") return [`P(\\text{pair})=${formatFractionLatex(3 * exercice.p.num, exercice.p.den)}`];
  if (exercice.ecran3Cible === "impair") return [`P(\\text{impair})=${formatFractionLatex(3 * exercice.q.num, exercice.q.den)}`];
  const pVal = exercice.p.num / exercice.p.den;
  const qVal = exercice.q.num / exercice.q.den;
  const cible = (exercice.sousEnsemble ?? []).reduce((acc, f) => acc + (f % 2 === 0 ? pVal : qVal), 0);
  return [`P(\\text{sous-ensemble})=${formatDecimalCourt(cible)}`];
}

/** Total points du récapitulatif final — maximum VARIABLE (300 pour A/C, 400 pour B). */
export function calculerTotalPointsTiragesArbres(resultat: ResultatExerciceTiragesArbres): { total: number; maximum: number } {
  const phases = phasesPourExercice(resultat.exercice);
  const total = phases.reduce((acc, phase) => acc + (resultat.scores[phase] ?? 0), 0);
  return { total, maximum: phases.length * 100 };
}
