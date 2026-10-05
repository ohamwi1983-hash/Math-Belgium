/**
 * Couche présentation (5e) — consignes/labels/aides pour 5gen20 ("Limites, reconnaissance et
 * calcul"). 4 familles — "limiteReelle" (1 seul écran), les 3 autres à 3-4 phases chacune (dont
 * "reconnaissance", écran 0, IDENTIQUE pour les 4 et toujours en tête).
 *
 * `consigneGenerale` reste VOLONTAIREMENT neutre (jamais un mot indiquant la technique/famille) —
 * elle est affichée y compris sur l'écran "reconnaissance" lui-même, où révéler la famille la
 * rendrait triviale. Les libellés spécifiques à la technique n'apparaissent qu'à partir de
 * `consignePhase`, jamais atteinte avant que l'élève ait déjà répondu à la reconnaissance.
 *
 * Notation de limite (transversal 1) : partout où une expression de limite apparaît en LaTeX
 * (bloc de données, état actuel, récapitulatif), format standard `\lim_{x\to cible} \dfrac{N}{D}`
 * ("lim" empilé, cible en indice, fraction `\dfrac`) — même famille de notation que
 * `ui6e/formatLimitesExponentielles.ts`. "Empilé" exige le mode DISPLAY LaTeX côté rendu
 * (`<Katex block />`, jamais l'inline par défaut qui rendrait la cible collée en indice à droite de
 * "lim") — voir `limNecessiteModeDisplay`, à utiliser partout où la valeur affichée peut contenir un
 * `\lim_{...}` avec cible. Bloc de données FUSIONNÉ (transversal 2) : jamais
 * "f(x)=..." puis la cible séparément, toujours une seule expression `\lim_{x\to cible}[...]`.
 *
 * Ordre des termes des polynômes (transversal 3) : `formatPolynomeLatex` prend un `seed` numérique
 * dérivé PUREMENT des champs déjà stockés sur l'exercice (`seedExercice`, aucun nouveau champ) —
 * déterministe donc CONSTANT pour un même exercice à travers tous ses écrans, mais varie d'un
 * tirage à l'autre. Ne s'applique qu'aux polynômes affichés en somme de monômes (numérateur/
 * dénominateur non factorisés) — un produit de facteurs `(x-a)(x-p)` n'est pas concerné (ce n'est
 * pas "l'ordre des termes d'un polynôme" au sens du prompt, juste 2 facteurs canoniques).
 */
import type { ExerciceLimite, ExerciceLimiteFormeIndeterminee, ExerciceLimiteInfini, ExerciceLimiteInfiniePoint, ExerciceLimiteReelle, FractionExacte } from "../core5e/limites.types";
import type { PhaseLimite } from "../moteur5e/typesLimites";

function commeFormeIndeterminee(exercice: ExerciceLimite): ExerciceLimiteFormeIndeterminee {
  if (exercice.famille !== "formeIndeterminee") throw new Error("commeFormeIndeterminee : famille hors 'formeIndeterminee'");
  return exercice;
}
function commeInfiniePoint(exercice: ExerciceLimite): ExerciceLimiteInfiniePoint {
  if (exercice.famille !== "limiteInfiniePoint") throw new Error("commeInfiniePoint : famille hors 'limiteInfiniePoint'");
  return exercice;
}
function commeInfini(exercice: ExerciceLimite): ExerciceLimiteInfini {
  if (exercice.famille !== "limiteInfini") throw new Error("commeInfini : famille hors 'limiteInfini'");
  return exercice;
}
function commeLimiteReelle(exercice: ExerciceLimite): ExerciceLimiteReelle {
  if (exercice.famille !== "limiteReelle") throw new Error("commeLimiteReelle : famille hors 'limiteReelle'");
  return exercice;
}

// ============================================================================
// Seed déterministe (transversal 3) — dérivé des champs déjà stockés, jamais un nouveau champ.
// ============================================================================

function hashSeed(...nums: number[]): number {
  let h = 2166136261;
  for (const n of nums) {
    h ^= Math.trunc(n) + 0x9e3779b9;
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function seedExercice(exercice: ExerciceLimite): number {
  switch (exercice.famille) {
    case "limiteReelle":
      return hashSeed(exercice.a, exercice.kN, exercice.bN, exercice.kD, exercice.bD);
    case "formeIndeterminee":
      return hashSeed(exercice.a, exercice.kN, exercice.p, exercice.kD, exercice.q);
    case "limiteInfiniePoint":
      return hashSeed(exercice.a, exercice.kN, exercice.bN, exercice.kD, exercice.q ?? exercice.a);
    case "limiteInfini":
      return hashSeed(exercice.degN, exercice.degD, ...exercice.coeffsN, ...exercice.coeffsD);
  }
}

/** PRNG déterministe (mulberry32) — utilisé UNIQUEMENT pour permuter l'ordre d'affichage des
 * termes, jamais pour une valeur mathématique. */
function ordreTermesVarie(coeffs: number[], seed: number): number[] {
  const degres: number[] = [];
  for (let d = coeffs.length - 1; d >= 0; d--) if (coeffs[d] !== 0) degres.push(d);
  let s = seed;
  const rand = () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  for (let i = degres.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [degres[i], degres[j]] = [degres[j], degres[i]];
  }
  return degres;
}

// ============================================================================
// Fragments LaTeX de bas niveau — polynômes/facteurs/fractions.
// ============================================================================

function formatMonomeLatex(coeff: number, degre: number, premier: boolean): string {
  if (coeff === 0) return "";
  const abs = Math.abs(coeff);
  const signe = coeff < 0 ? "-" : premier ? "" : "+";
  const variable = degre === 0 ? "" : degre === 1 ? "x" : `x^{${degre}}`;
  const coeffAffiche = abs === 1 && degre !== 0 ? "" : `${abs}`;
  return `${signe}${coeffAffiche}${variable}`;
}

/** `coeffs[i]` = coefficient de x^i — `seed` permute l'ORDRE d'affichage des termes (transversal 3),
 * jamais leur valeur ; sans seed (0 par défaut) l'ordre reste décroissant, pour les rares appels
 * internes où l'ordre n'a pas besoin de varier (aucun affiché à l'élève sans seed réel). */
function formatPolynomeLatex(coeffs: number[], seed: number): string {
  const ordre = ordreTermesVarie(coeffs, seed);
  let out = "";
  let premier = true;
  for (const d of ordre) {
    const frag = formatMonomeLatex(coeffs[d], d, premier);
    if (frag !== "") {
      out += frag;
      premier = false;
    }
  }
  return out === "" ? "0" : out;
}

/** Monôme "brut" (coefficient/degré isolés) — terme dominant/ratio simplifié (famille
 * "limiteInfini"), toujours un terme SEUL (pas de somme, donc pas concerné par transversal 3). */
function formatMonomeIsoleLatex(coeff: number, degre: number): string {
  if (degre === 0) return `${coeff}`;
  const variable = degre === 1 ? "x" : `x^{${degre}}`;
  if (coeff === 1) return variable;
  if (coeff === -1) return `-${variable}`;
  return `${coeff}${variable}`;
}

function formatFractionLatex(f: FractionExacte): string {
  if (f.den === 1) return `${f.num}`;
  const signe = f.num < 0 ? "-" : "";
  return `${signe}\\dfrac{${Math.abs(f.num)}}{${f.den}}`;
}

/** Ratio de coefficients × x^degré — degré 0 → un nombre pur, degré négatif → une puissance
 * négative de x (le terme simplifié tend vers 0, "numerateurPlusPetit"). */
function formatRatioMonomeLatex(f: FractionExacte, degre: number): string {
  if (degre === 0) return formatFractionLatex(f);
  const variable = degre === 1 ? "x" : `x^{${degre}}`;
  if (f.den === 1) return formatMonomeIsoleLatex(f.num, degre);
  const signe = f.num < 0 ? "-" : "";
  return `${signe}\\dfrac{${Math.abs(f.num)}}{${f.den}}${variable}`;
}

function formatFacteurLineaireLatex(racine: number): string {
  if (racine === 0) return "x";
  return racine > 0 ? `(x-${racine})` : `(x+${Math.abs(racine)})`;
}

function formatProduitFacteursLatex(coeff: number, racine1: number, racine2: number): string {
  const produit = `${formatFacteurLineaireLatex(racine1)}${formatFacteurLineaireLatex(racine2)}`;
  if (coeff === 1) return produit;
  if (coeff === -1) return `-${produit}`;
  return `${coeff}${produit}`;
}

function formatSigneInfiniLatex(s: 1 | -1): string {
  return s > 0 ? "+\\infty" : "-\\infty";
}

/** Vrai si `latex` contient un `\lim_{...}` avec une cible en indice — SEUL cas où le mode display
 * KaTeX (`<Katex block />`) est requis pour empiler réellement la cible sous "lim" (sinon KaTeX la
 * rend en indice inline, collée à droite du mot). Un `\lim=valeur` bilatéral déjà conclu, sans cible
 * affichée, n'a rien à empiler et reste en mode inline. */
export function limNecessiteModeDisplay(latex: string): boolean {
  return latex.includes("\\lim_{");
}

/** Notation "n'existe pas" — symbole E-à-l'envers-barré, `\nexists` en LaTeX standard. */
const NEXISTEPAS_LATEX = "\\nexists";

/** Cible bilatérale (indice normal de \lim) — "x\to a" ou "x\to \pm\infty". */
function formatCibleLatex(exercice: ExerciceLimite): string {
  if (exercice.famille === "limiteInfini") return exercice.direction === "plus" ? "x\\to +\\infty" : "x\\to -\\infty";
  const a = exercice.famille === "limiteInfiniePoint" ? exercice.a : exercice.famille === "formeIndeterminee" ? exercice.a : commeLimiteReelle(exercice).a;
  return `x\\to ${a}`;
}

/** Cible UNILATÉRALE — notation standard par EXPOSANT : "x\to a^{-}" (gauche) / "x\to a^{+}"
 * (droite). Annule un choix antérieur ("signe sous la flèche", `x\xrightarrow[<]{}a`) — définitivement
 * écarté (prompt de correction dédié). */
function formatCibleUnilateraleLatex(a: number, sens: "gauche" | "droite"): string {
  const exposant = sens === "gauche" ? "-" : "+";
  return `x\\to ${a}^{${exposant}}`;
}

// ============================================================================
// Corps de fraction (N/D) par famille — jamais le wrapper `\lim`, réutilisés à la fois pour le
// bloc de données (toujours non factorisé) et pour les états ultérieurs (parfois factorisé).
// ============================================================================

function formatFractionLimiteReelle(exo: ExerciceLimiteReelle, seed: number): string {
  const n = formatPolynomeLatex([exo.bN, exo.kN], seed);
  const d = formatPolynomeLatex([exo.bD, exo.kD], seed + 1);
  return `\\dfrac{${n}}{${d}}`;
}

function formatFractionBruteFormeIndeterminee(exo: ExerciceLimiteFormeIndeterminee, seed: number): string {
  const nCoeffs = [exo.kN * exo.a * exo.p, -exo.kN * (exo.a + exo.p), exo.kN];
  const dCoeffs = [exo.kD * exo.a * exo.q, -exo.kD * (exo.a + exo.q), exo.kD];
  return `\\dfrac{${formatPolynomeLatex(nCoeffs, seed)}}{${formatPolynomeLatex(dCoeffs, seed + 1)}}`;
}

function formatFractionFactoriseeFormeIndeterminee(exo: ExerciceLimiteFormeIndeterminee): string {
  return `\\dfrac{${formatProduitFacteursLatex(exo.kN, exo.a, exo.p)}}{${formatProduitFacteursLatex(exo.kD, exo.a, exo.q)}}`;
}

/** D(x) non factorisé, expansion entière exacte — racine double : D(x)=kD(x-a)² ; racine simple :
 * D(x)=kD(x-a)(x-q). */
function coeffsDenominateurInfiniePointBrut(exo: ExerciceLimiteInfiniePoint): number[] {
  const q = exo.sousCas === "racineDouble" ? exo.a : (exo.q as number);
  return [exo.kD * exo.a * q, -exo.kD * (exo.a + q), exo.kD];
}

function formatFractionBruteInfiniePoint(exo: ExerciceLimiteInfiniePoint, seed: number): string {
  const numerateur = formatPolynomeLatex([exo.bN, exo.kN], seed);
  const denominateur = formatPolynomeLatex(coeffsDenominateurInfiniePointBrut(exo), seed + 1);
  return `\\dfrac{${numerateur}}{${denominateur}}`;
}

function formatFractionFactoriseeInfiniePoint(exo: ExerciceLimiteInfiniePoint, seed: number): string {
  const numerateur = formatPolynomeLatex([exo.bN, exo.kN], seed);
  const denominateur = exo.sousCas === "racineDouble" ? `${formatFacteurLineaireLatex(exo.a)}^2` : formatProduitFacteursLatex(1, exo.a, exo.q as number);
  const denominateurAvecCoeff = exo.kD === 1 ? denominateur : exo.kD === -1 ? `-${denominateur}` : `${exo.kD}${denominateur}`;
  return `\\dfrac{${numerateur}}{${denominateurAvecCoeff}}`;
}

function formatFractionLimiteInfini(exo: ExerciceLimiteInfini, seed: number): string {
  return `\\dfrac{${formatPolynomeLatex(exo.coeffsN, seed)}}{${formatPolynomeLatex(exo.coeffsD, seed + 1)}}`;
}

// ============================================================================
// Bloc de données FUSIONNÉ (transversal 1 + 2) — TOUJOURS `\lim_{x\to cible}[...]`, non factorisé,
// identique sur tous les écrans d'un même exercice (y compris le dénominateur de "limiteInfiniePoint",
// jamais factorisé avant l'écran "factoriserDenominateur").
// ============================================================================

export function formatBlocDonneesLatex(exercice: ExerciceLimite): string {
  const seed = seedExercice(exercice);
  const cible = formatCibleLatex(exercice);
  switch (exercice.famille) {
    case "limiteReelle":
      return `\\lim_{${cible}} ${formatFractionLimiteReelle(exercice, seed)}`;
    case "formeIndeterminee":
      return `\\lim_{${cible}} ${formatFractionBruteFormeIndeterminee(exercice, seed)}`;
    case "limiteInfiniePoint":
      return `\\lim_{${cible}} ${formatFractionBruteInfiniePoint(exercice, seed)}`;
    case "limiteInfini":
      return `\\lim_{${cible}} ${formatFractionLimiteInfini(exercice, seed)}`;
  }
}

/** Le bloc de données + "=" — label d'un champ de réponse directement rattaché à l'expression
 * complète (Branche A, seul et unique écran). */
export function formatBlocDonneesEgalLatex(exercice: ExerciceLimite): string {
  return `${formatBlocDonneesLatex(exercice)}=`;
}

// ============================================================================
// Consigne générale + libellés d'écran 0.
// ============================================================================

export function consigneGenerale(): string {
  return "Détermine cette limite, étape par étape.";
}

export const LIBELLE_FAMILLE_LIMITE: Record<string, string> = {
  limiteReelle: "Nombre réel ℝ",
  limiteInfiniePoint: "L'infini ∞",
  limiteInfini: "∞/∞",
  formeIndeterminee: "0/0",
};

/** Les 2 sous-boutons révélés par "Forme indéterminée", dans l'ordre du prompt (∞/∞ puis 0/0). */
export const OPTIONS_RECONNAISSANCE_INDETERMINEE: { id: string; label: string }[] = [
  { id: "limiteInfini", label: LIBELLE_FAMILLE_LIMITE.limiteInfini },
  { id: "formeIndeterminee", label: LIBELLE_FAMILLE_LIMITE.formeIndeterminee },
];

// ============================================================================
// Libellés/consignes par phase.
// ============================================================================

export const LIBELLE_PHASE_LIMITE: Record<PhaseLimite, string> = {
  reconnaissance: "Reconnaissance",
  factoriserDenominateur: "Factoriser le dénominateur",
  limitesGaucheDroite: "Limites à gauche et à droite",
  conclureLimite: "Conclure la limite",
  factoriser: "Factoriser numérateur et dénominateur",
  simplifierEvaluer: "Simplifier et évaluer",
  termeDominant: "Terme dominant",
  simplifierLimiteRef: "Limite de référence",
  evaluerLimiteFinale: "Évaluer la limite finale",
};

export function labelPhase(phase: PhaseLimite): string {
  switch (phase) {
    case "simplifierEvaluer":
    case "evaluerLimiteFinale":
      return "\\lim =";
    default:
      // "simplifierLimiteRef" (Branche D, écran 2) N'A PLUS le label "≈" : la simplification du
      // rapport des 2 termes dominants est algébriquement EXACTE, jamais approximative.
      return "";
  }
}

export function consignePhase(_exercice: ExerciceLimite, phase: PhaseLimite): string {
  switch (phase) {
    case "reconnaissance":
      return "De quel type de limite s'agit-il ?";
    case "factoriserDenominateur":
      return "Factorise le dénominateur.";
    case "limitesGaucheDroite":
      return "Détermine la limite à gauche, puis la limite à droite.";
    case "conclureLimite":
      return "Détermine la limite.";
    case "factoriser":
      return "Factorise le numérateur et le dénominateur.";
    case "simplifierEvaluer":
      return "Simplifie le facteur commun, puis évalue la limite.";
    case "termeDominant":
      return "Identifie le terme dominant du numérateur et du dénominateur.";
    case "simplifierLimiteRef":
      return "Simplifie le rapport des 2 termes dominants.";
    case "evaluerLimiteFinale":
      return "Évalue la limite finale.";
  }
}

// ============================================================================
// Aides — niveau 1 (technique générale), niveau 2 (exemple substitué, jamais la réponse). Aucune
// des 2 n'est jamais révélatrice de la VRAIE famille sur "reconnaissance" (les 4 catégories sont
// toujours décrites ensemble, jamais une seule mise en avant).
// ============================================================================

export function texteAideNiveau1(_exercice: ExerciceLimite, phase: PhaseLimite): string {
  switch (phase) {
    case "reconnaissance":
      return "Remplace x par la cible : un résultat fini → nombre réel. Numérateur non nul, dénominateur nul → limite infinie en un point. Numérateur ET dénominateur nuls (x→a) → forme 0/0. x→±∞ : compare les degrés du numérateur et du dénominateur (forme ∞/∞).";
    case "factoriserDenominateur":
      return "Cherche la valeur a telle que D(a)=0 — c'est la racine à mettre en évidence (simple, ou double si le signe de D(x) est constant des deux côtés de a).";
    case "limitesGaucheDroite":
      return "Détermine le signe du numérateur en a, puis le signe du dénominateur factorisé de chaque côté de a — le signe de chaque limite unilatérale est le produit des deux.";
    case "conclureLimite":
      return "";
    case "factoriser":
      return "Cherche la valeur a telle que N(a)=0 ET D(a)=0 — c'est le facteur (x-a) commun à mettre en évidence des deux côtés.";
    case "simplifierEvaluer":
      return "Une fois le facteur commun simplifié, remplace x par a dans ce qui reste. Piège : si le résultat simplifié s'annule ENCORE en a, la limite n'est pas ce nombre — vérifie qu'il est bien défini en a.";
    case "termeDominant":
      return "Le terme dominant est celui du plus haut degré — c'est lui qui impose le comportement de la fonction quand x devient très grand.";
    case "simplifierLimiteRef":
      return "Les puissances de x des 2 termes dominants se simplifient entre elles (comme une fraction) — il reste le rapport des coefficients, multiplié par une éventuelle puissance de x restante.";
    case "evaluerLimiteFinale":
      return "Degrés égaux : la limite est le rapport des coefficients dominants. Numérateur de degré plus petit : la limite vaut 0. Numérateur de degré plus grand : la limite est infinie — attention, un degré résultant IMPAIR change de signe entre x→+∞ et x→−∞, un degré PAIR non.";
  }
}

export function texteAideNiveau2(_exercice: ExerciceLimite, phase: PhaseLimite): string {
  switch (phase) {
    case "reconnaissance":
      return "Exemple : lim(x→2) (3x+1)/(x-5) = -7/3, un nombre réel. lim(x→2) 1/(x-2)² est infinie en x=2. lim(x→2) (x²-4)/(x-2) est 0/0. lim(x→+∞) (2x+1)/(3x-5) compare 2 degrés égaux, ∞/∞.";
    case "factoriserDenominateur":
      return "Exemple : D(x)=x²-4x+4 a une racine double en x=2 (D(x)=(x-2)²) ; D(x)=x²-x-6 a 2 racines distinctes, x=3 et x=-2 (D(x)=(x-3)(x+2)).";
    case "limitesGaucheDroite":
      return "Exemple (différent de l'exercice) : pour lim(x→1) 5/((x-1)(x+3)), N(1)=5>0, constant. Juste avant x=1 : (x-1)<0 et (x+3)>0 donc D(x)<0, limite à gauche = -∞. Juste après x=1 : D(x)>0, limite à droite = +∞.";
    case "conclureLimite":
      return "";
    case "factoriser":
      return "Exemple : (x²-5x+6)/(x²-x-2) partage la racine x=2 : x²-5x+6=(x-2)(x-3) et x²-x-2=(x-2)(x+1).";
    case "simplifierEvaluer":
      return "Suite de l'exemple : après simplification, (x-3)/(x+1) en x=2 donne (2-3)/(2+1)=-1/3.";
    case "termeDominant":
      return "Exemple : dans 3x³-5x+1, le terme dominant est 3x³ ; dans -2x²+7, c'est -2x².";
    case "simplifierLimiteRef":
      return "Exemple : -4x²/x² se simplifie en -4 (même degré) ; 2x³/x² se simplifie en 2x (degré résultant 1).";
    case "evaluerLimiteFinale":
      return "Exemple : un degré résultant 1 (impair) change de signe entre x→+∞ et x→−∞ ; un degré résultant 2 (pair) donne le même signe des deux côtés.";
  }
}

// ============================================================================
// Bloc "état actuel" — dérivé UNIQUEMENT des valeurs déjà CONFIRMÉES (jamais la saisie brute de
// l'élève). "reconnaissance" n'y contribue JAMAIS. Chaque famille montre l'état le plus RÉCENT
// (jamais un empilement de tout l'historique — Branche B/D n'affichent que le dernier calcul
// pertinent, cf. prompt).
// ============================================================================

function formatLabelLimiteUnilateraleLatex(exo: ExerciceLimiteInfiniePoint, sens: "gauche" | "droite", seed: number): string {
  return `\\lim_{${formatCibleUnilateraleLatex(exo.a, sens)}} ${formatFractionFactoriseeInfiniePoint(exo, seed)}=`;
}

function formatLimiteUnilateraleConfirmeeLatex(exo: ExerciceLimiteInfiniePoint, sens: "gauche" | "droite", seed: number): string {
  const signe = sens === "gauche" ? exo.signeLimiteGauche : exo.signeLimiteDroite;
  return `${formatLabelLimiteUnilateraleLatex(exo, sens, seed)}${formatSigneInfiniLatex(signe)}`;
}

function etatActuelInfiniePoint(exo: ExerciceLimiteInfiniePoint, phase: PhaseLimite): string[] | null {
  const seed = seedExercice(exo);
  if (phase === "limitesGaucheDroite") return [`\\lim_{${formatCibleLatex(exo)}} ${formatFractionFactoriseeInfiniePoint(exo, seed)}`];
  if (phase === "conclureLimite") return [formatLimiteUnilateraleConfirmeeLatex(exo, "gauche", seed), formatLimiteUnilateraleConfirmeeLatex(exo, "droite", seed)];
  return null;
}

function etatActuelFormeIndeterminee(exo: ExerciceLimiteFormeIndeterminee, phase: PhaseLimite): string[] | null {
  if (phase === "simplifierEvaluer") return [`\\lim_{x\\to ${exo.a}} ${formatFractionFactoriseeFormeIndeterminee(exo)}`];
  return null;
}

function etatActuelLimiteInfini(exo: ExerciceLimiteInfini, phase: PhaseLimite): string[] | null {
  const cible = formatCibleLatex(exo);
  if (phase === "simplifierLimiteRef") return [`\\lim_{${cible}} \\dfrac{${formatMonomeIsoleLatex(exo.coeffsN[exo.degN], exo.degN)}}{${formatMonomeIsoleLatex(exo.coeffsD[exo.degD], exo.degD)}}`];
  if (phase === "evaluerLimiteFinale") return [`\\lim_{${cible}} ${formatRatioMonomeLatex(exo.ratioCoefficients, exo.degreResultat)}`];
  return null;
}

export function formatTermesEtatActuelLatex(exercice: ExerciceLimite, phase: PhaseLimite): string[] | null {
  switch (exercice.famille) {
    case "limiteReelle":
      return null; // 1 seul écran, rien avant.
    case "formeIndeterminee":
      return etatActuelFormeIndeterminee(exercice, phase);
    case "limiteInfiniePoint":
      return etatActuelInfiniePoint(exercice, phase);
    case "limiteInfini":
      return etatActuelLimiteInfini(exercice, phase);
  }
}

// ============================================================================
// Écran "limitesGaucheDroite" (Branche B) — labels des 2 questions gauche/droite, exposés à part
// (pas un "état actuel", ce sont les QUESTIONS elles-mêmes).
// ============================================================================

export function formatLabelLimiteGaucheLatex(exercice: ExerciceLimite): string {
  return formatLabelLimiteUnilateraleLatex(commeInfiniePoint(exercice), "gauche", seedExercice(exercice));
}

export function formatLabelLimiteDroiteLatex(exercice: ExerciceLimite): string {
  return formatLabelLimiteUnilateraleLatex(commeInfiniePoint(exercice), "droite", seedExercice(exercice));
}

// ============================================================================
// Récapitulatif final — réponse ATTENDUE pour chaque écran réellement traversé. "reconnaissance"
// renvoie `[]` pour toutes les familles SAUF "limiteReelle" (seul et dernier écran, doit exposer la
// valeur numérique attendue en plus du libellé de famille géré à part par l'appelant).
// ============================================================================

function formatFacteursConfirmesFormeIndetermineeLatex(exo: ExerciceLimiteFormeIndeterminee): string[] {
  return [`N(x)=${formatProduitFacteursLatex(exo.kN, exo.a, exo.p)}`, `D(x)=${formatProduitFacteursLatex(exo.kD, exo.a, exo.q)}`];
}

function formatDenominateurFactoriseConfirmeLatex(exo: ExerciceLimiteInfiniePoint): string {
  const denom = exo.sousCas === "racineDouble" ? `${formatFacteurLineaireLatex(exo.a)}^2` : formatProduitFacteursLatex(1, exo.a, exo.q as number);
  const avecCoeff = exo.kD === 1 ? denom : exo.kD === -1 ? `-${denom}` : `${exo.kD}${denom}`;
  return `D(x)=${avecCoeff}`;
}

function formatTermeDominantConfirmeLatex(exo: ExerciceLimiteInfini): string[] {
  return [`\\text{Num. : }${formatMonomeIsoleLatex(exo.coeffsN[exo.degN], exo.degN)}`, `\\text{Dén. : }${formatMonomeIsoleLatex(exo.coeffsD[exo.degD], exo.degD)}`];
}

export function formatReponseAttenduePhaseLatex(exercice: ExerciceLimite, phase: PhaseLimite): string[] {
  switch (phase) {
    case "reconnaissance":
      if (exercice.famille !== "limiteReelle") return [];
      return [`\\lim=${formatFractionLatex(exercice.limite)}`];
    case "factoriserDenominateur":
      return [formatDenominateurFactoriseConfirmeLatex(commeInfiniePoint(exercice))];
    case "limitesGaucheDroite": {
      const exo = commeInfiniePoint(exercice);
      const seed = seedExercice(exo);
      return [formatLimiteUnilateraleConfirmeeLatex(exo, "gauche", seed), formatLimiteUnilateraleConfirmeeLatex(exo, "droite", seed)];
    }
    case "conclureLimite": {
      const exo = commeInfiniePoint(exercice);
      if (exo.sousCas === "racineSimple") return [`\\lim=${NEXISTEPAS_LATEX}`];
      return [`\\lim=${formatSigneInfiniLatex(exo.signeLimiteGauche)}`];
    }
    case "factoriser":
      return formatFacteursConfirmesFormeIndetermineeLatex(commeFormeIndeterminee(exercice));
    case "simplifierEvaluer":
      return [`\\lim=${formatFractionLatex(commeFormeIndeterminee(exercice).limite)}`];
    case "termeDominant":
      return formatTermeDominantConfirmeLatex(commeInfini(exercice));
    case "simplifierLimiteRef": {
      const exo = commeInfini(exercice);
      return [formatRatioMonomeLatex(exo.ratioCoefficients, exo.degreResultat)];
    }
    case "evaluerLimiteFinale": {
      const exo = commeInfini(exercice);
      if (exo.natureLimite === "infinie") return [`\\lim=${formatSigneInfiniLatex(exo.signeLimiteInfinie as 1 | -1)}`];
      if (exo.natureLimite === "zero") return ["\\lim=0"];
      return [`\\lim=${formatFractionLatex(exo.ratioCoefficients)}`];
    }
  }
}
