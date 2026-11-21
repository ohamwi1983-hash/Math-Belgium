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
import type { FragmentConsigne } from "../../export/genererFeuilleExercices";
import type { AideTrig } from "./aidesTrigonometrie";
import { egaleA, lireLimite } from "../moteur5e/saisieLimites";

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
  // Degré négatif (numérateur de plus petit degré) : x au DÉNOMINATEUR, −\dfrac{1}{3x} plutôt que
  // −\dfrac{1}{3}x^{-1}.
  if (degre < 0) {
    const puissance = degre === -1 ? "x" : `x^{${-degre}}`;
    const signeNegatif = f.num < 0 ? "-" : "";
    return `${signeNegatif}\\dfrac{${Math.abs(f.num)}}{${f.den === 1 ? "" : f.den}${puissance}}`;
  }
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
  // « L'infini ∞ » se confondait avec x → ∞ (audit 5c4a point 11) : c'est la forme k/0.
  limiteInfiniePoint: "Forme k/0 (limite infinie)",
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

export function labelPhase(phase: PhaseLimite, exercice?: ExerciceLimite): string {
  // Degrés égaux : le rapport simplifié des termes dominants EST la limite (plus d'écran
  // « evaluerLimiteFinale » dans ce cas, décision C).
  if (phase === "simplifierLimiteRef" && exercice?.famille === "limiteInfini" && exercice.sousCas === "degresEgaux") return "\\lim =";
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

export function consignePhase(exercice: ExerciceLimite, phase: PhaseLimite): string {
  if (phase === "simplifierLimiteRef" && exercice.famille === "limiteInfini" && exercice.sousCas === "degresEgaux") {
    return "Simplifie le rapport des 2 termes dominants : tu obtiens la limite.";
  }
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

// ============================================================================
// Lots B–D (règles communes) : aides à deux niveaux — niveau 1 = la propriété du cours, niveau 2 =
// la propriété posée pour CETTE limite (jamais la réponse) — et messages ciblés sur les erreurs du
// cours (côté d'approche, signe de 0⁺ / 0⁻, degré, rapport inversé…).
// ============================================================================

const tF = (valeur: string): FragmentConsigne => ({ type: "texte", valeur });
const lF = (valeur: string): FragmentConsigne => ({ type: "latex", valeur });

/** N(x) et D(x) tels qu'affichés dans l'énoncé (mêmes ordres de termes). */
export function numerateurDenominateurLatex(e: ExerciceLimite): { n: string; d: string } {
  const frac = formatBlocDonneesLatex(e);
  const i = frac.indexOf("\\dfrac{") + 6;
  const groupe = (j: number) => {
    let k = 0;
    for (let m = j; m < frac.length; m++) {
      if (frac[m] === "{") k++;
      else if (frac[m] === "}") {
        k--;
        if (k === 0) return { c: frac.slice(j + 1, m), fin: m + 1 };
      }
    }
    return { c: "", fin: frac.length };
  };
  const n = groupe(i);
  const d = groupe(n.fin);
  return { n: n.c, d: d.c };
}

const coefDevant = (k: number) => (k === 1 ? "" : k === -1 ? "-" : `${k}`);

function cibleA(e: ExerciceLimite): string {
  return e.famille === "limiteInfini" ? (e.direction === "plus" ? "+\\infty" : "-\\infty") : `${e.a}`;
}

export function aidesLimite(e: ExerciceLimite, phase: PhaseLimite): AideTrig[] {
  const { n, d } = numerateurDenominateurLatex(e);
  const a = cibleA(e);
  switch (phase) {
    case "reconnaissance":
      return [
        {
          texte: [
            tF("Remplace x par la valeur visée dans le numérateur et dans le dénominateur : un résultat fini donne un nombre réel ; "),
            lF("\\frac{k}{0}"),
            tF(" (k ≠ 0) donne une limite infinie ; "),
            lF("\\frac{0}{0}"),
            tF(" est une forme indéterminée. En "),
            lF("\\pm\\infty"),
            tF(", deux polynômes non constants donnent la forme "),
            lF("\\frac{\\infty}{\\infty}"),
            tF("."),
          ],
        },
        e.famille === "limiteInfini"
          ? { texte: [tF("Ici, x tend vers "), lF(a), tF(" : regarde vers quoi tendent le numérateur et le dénominateur :")], formules: [`\\lim_{x\\to ${a}}\\left(${n}\\right)\\qquad\\lim_{x\\to ${a}}\\left(${d}\\right)`] }
          : { texte: [tF("Ici, calcule séparément le numérateur et le dénominateur en "), lF(`x=${a}`), tF(" :")], formules: [`N(x)=${n}\\qquad D(x)=${d}`] },
      ];
    case "factoriser":
      return [
        { texte: [tF("Le numérateur et le dénominateur s'annulent tous les deux en "), lF("x=a"), tF(" : "), lF("(x-a)"), tF(" est un facteur de chacun. L'autre racine se trouve par Δ, ou par le produit des racines "), lF("x_1x_2=\\frac{c}{a}"), tF(".")] },
        { texte: [tF("Ici, "), lF(formatFacteurLineaireLatex(commeFormeIndeterminee(e).a)), tF(" est un facteur commun ; écris chacun sous la forme :")], formules: ["k\\,(x-x_1)(x-x_2)"] },
      ];
    case "simplifierEvaluer":
      return [
        { texte: [tF("Pour "), lF("x\\neq a"), tF(", on simplifie le facteur commun "), lF("(x-a)"), tF(", puis on remplace x par a dans la fraction qui reste.")] },
        { texte: [tF("Ici, après simplification, remplace x par "), lF(a), tF(" dans les facteurs qui restent (coefficients compris) :")], formules: e.famille === "formeIndeterminee" ? [`\\dfrac{${coefDevant(e.kN)}${formatFacteurLineaireLatex(e.p)}}{${coefDevant(e.kD)}${formatFacteurLineaireLatex(e.q)}}`] : [] },
      ];
    case "factoriserDenominateur":
      return [
        { texte: [tF("Le dénominateur s'annule en "), lF("x=a"), tF(" : "), lF("(x-a)"), tF(" en est un facteur. Trouve l'autre (Δ, ou somme et produit des racines) ; s'il vaut encore "), lF("(x-a)"), tF(", la racine est double.")] },
        { texte: [tF("Ici, mets d'abord le coefficient de "), lF("x^2"), tF(" en évidence, puis cherche l'autre racine :")], formules: [`D(x)=${d}`] },
      ];
    case "limitesGaucheDroite":
      return [
        { texte: [tF("Près de a, le numérateur garde son signe. Le facteur "), lF("(x-a)"), tF(" tend vers "), lF("0^-"), tF(" à gauche ("), lF("x<a"), tF(") et vers "), lF("0^+"), tF(" à droite ; un carré "), lF("(x-a)^2"), tF(" tend vers "), lF("0^+"), tF(" des deux côtés. Le signe de la limite est le produit des signes.")] },
        { texte: [tF("Ici, évalue le numérateur et les autres facteurs en "), lF(`x=${a}`), tF(", puis le signe de chaque facteur juste avant et juste après "), lF(a), tF(" :")], formules: [`N(${a})\\qquad x\\to ${a}^{-}\\qquad x\\to ${a}^{+}`] },
      ];
    case "conclureLimite":
      return [
        { texte: [tF("La limite en a existe seulement si la limite à gauche et la limite à droite sont égales.")] },
        { texte: [tF("Ici, compare les deux limites trouvées à l'écran précédent.")] },
      ];
    case "termeDominant":
      return [
        { texte: [tF("En "), lF("\\pm\\infty"), tF(", un polynôme se comporte comme son terme de plus haut degré (son « terme dominant »), où qu'il soit écrit.")] },
        { texte: [tF("Ici, les termes ne sont pas forcément rangés : cherche la plus grande puissance de x dans chacun :")], formules: [`N(x)=${n}\\qquad D(x)=${d}`] },
      ];
    case "simplifierLimiteRef":
      return [
        { texte: [tF("On simplifie le quotient des termes dominants : coefficients divisés, exposants soustraits ("), lF("\\frac{x^m}{x^n}=x^{m-n}"), tF(").")] },
        e.famille === "limiteInfini"
          ? { texte: [tF("Ici, simplifie :")], formules: [`\\dfrac{${formatMonomeIsoleLatex(e.coeffsN[e.degN], e.degN)}}{${formatMonomeIsoleLatex(e.coeffsD[e.degD], e.degD)}}`] }
          : { texte: [] },
      ];
    case "evaluerLimiteFinale":
      return [
        { texte: [tF("Limites de référence : "), lF("\\frac{k}{x^n}\\to 0"), tF(" ; "), lF("kx^n\\to\\pm\\infty"), tF(", avec le signe de k et, pour n impair, celui de x.")] },
        e.famille === "limiteInfini"
          ? { texte: [tF("Ici, x tend vers "), lF(a), tF(" dans l'expression simplifiée :")], formules: [`\\lim_{x\\to ${a}} ${formatRatioMonomeLatex(e.ratioCoefficients, e.degreResultat)}`] }
          : { texte: [] },
      ];
  }
}

/** Valeur lue (ou ±∞), null si illisible. */
function lu(brut: string): number | null {
  return lireLimite(brut);
}

const proche = (v: number, c: number) => Number.isFinite(v) && Math.abs(v - c) < 1e-9 * Math.max(1, Math.abs(c));

export function cibleLimite(e: ExerciceLimite, phase: PhaseLimite, valeurs: string[]): FragmentConsigne[] | null {
  switch (phase) {
    case "reconnaissance": {
      if (e.famille !== "limiteReelle") return null;
      const v = lu(valeurs[0] ?? "");
      if (v === null) return null;
      const nA = e.kN * e.a + e.bN;
      const dA = e.kD * e.a + e.bD;
      if (!Number.isFinite(v)) return [tF("Le dénominateur ne s'annule pas en "), lF(`x=${e.a}`), tF(" : la limite est un nombre réel.")];
      if (nA !== 0 && proche(v, dA / nA)) return [tF("Fraction inversée : c'est le numérateur divisé par le dénominateur.")];
      if (proche(v, -nA / dA)) return [tF("Erreur de signe : remplace x par "), lF(`${e.a}`), tF(" entre parenthèses dans chaque terme.")];
      return [tF("Calcule séparément le numérateur et le dénominateur en "), lF(`x=${e.a}`), tF(", puis leur quotient.")];
    }
    case "factoriser":
    case "factoriserDenominateur":
      return [tF("Vérifie chaque facteur : il doit s'annuler en une racine du polynôme, et le produit redéveloppé doit redonner le polynôme (coefficient dominant compris).")];
    case "simplifierEvaluer": {
      if (e.famille !== "formeIndeterminee") return null;
      const v = lu(valeurs[0] ?? "");
      if (v === null) return null;
      const L = e.limite.num / e.limite.den;
      if (!Number.isFinite(v)) return [tF("Après simplification du facteur commun, le dénominateur ne s'annule plus : la limite est un nombre réel.")];
      if (L !== 0 && proche(v, 1 / L)) return [tF("Fraction inversée : numérateur sur dénominateur.")];
      if (proche(v, e.kN / e.kD)) return [tF("Il reste à remplacer x dans les facteurs qui ne se sont pas simplifiés.")];
      if (proche(v, (e.a - e.p) / (e.a - e.q))) return [tF("N'oublie pas les coefficients devant les facteurs.")];
      if (proche(v, -L)) return [tF("Erreur de signe : remplace x par "), lF(`${e.a}`), tF(" entre parenthèses.")];
      return [tF("Simplifie le facteur commun, puis remplace x par "), lF(`${e.a}`), tF(" dans ce qui reste.")];
    }
    case "termeDominant": {
      if (e.famille !== "limiteInfini") return null;
      const msgs: FragmentConsigne[] = [];
      const autreTerme = (brut: string, coeffs: number[], deg: number) =>
        coeffs.some((c, i) => i !== deg && c !== 0 && egaleA(brut, (x) => c * x ** i));
      if (autreTerme(valeurs[0] ?? "", e.coeffsN, e.degN) || autreTerme(valeurs[1] ?? "", e.coeffsD, e.degD))
        return [tF("C'est un terme du polynôme, mais pas celui de plus haut degré : les termes ne sont pas rangés, cherche la plus grande puissance de x.")];
      if (egaleA(valeurs[0] ?? "", (x) => Math.abs(e.coeffsN[e.degN]) * x ** e.degN) && e.coeffsN[e.degN] < 0) msgs.push(tF("Le terme dominant garde son signe."));
      return msgs.length ? msgs : [tF("Le terme dominant est le terme de plus haut degré, avec son coefficient et son signe.")];
    }
    case "simplifierLimiteRef": {
      if (e.famille !== "limiteInfini") return null;
      const s = valeurs[0] ?? "";
      const r = e.ratioCoefficients.num / e.ratioCoefficients.den;
      if (egaleA(s, (x) => r * x ** (e.degN + e.degD))) return [tF("Dans un quotient, les exposants se soustraient : "), lF("\\frac{x^m}{x^n}=x^{m-n}"), tF(".")];
      if (r !== 0 && egaleA(s, (x) => (1 / r) * x ** e.degreResultat)) return [tF("Rapport inversé : coefficient du numérateur divisé par celui du dénominateur.")];
      if (egaleA(s, (x) => r * x ** -e.degreResultat) && e.degreResultat !== 0) return [tF("Exposant : numérateur moins dénominateur ("), lF(`${e.degN}-${e.degD}`), tF(").")];
      return [tF("Divise les coefficients et soustrais les exposants.")];
    }
    case "evaluerLimiteFinale": {
      if (e.famille !== "limiteInfini") return null;
      const v = lu(valeurs[0] ?? "");
      if (v === null) return null;
      if (e.natureLimite === "zero") {
        if (!Number.isFinite(v)) return [tF("Le numérateur est de plus petit degré : il reste "), lF("\\frac{k}{x^n}"), tF(", qui tend vers 0.")];
        return [tF("Le numérateur est de plus petit degré : "), lF("\\frac{k}{x^n}"), tF(" tend vers 0, quel que soit k.")];
      }
      if (!Number.isFinite(v)) return [tF("Degrés égaux : la limite est le rapport des coefficients dominants, un nombre réel.")];
      return [tF("Degrés égaux : la limite est le rapport des coefficients dominants.")];
    }
    default:
      return null;
  }
}

/** Message sous la réponse révélée d'un choix fermé (une seule tentative). */
export function cibleChoixLimite(e: ExerciceLimite, phase: PhaseLimite, choix: string[]): FragmentConsigne[] | null {
  if (phase === "reconnaissance") {
    if (choix[0] === e.famille) return null;
    if (e.famille === "limiteInfini") return [tF("En "), lF("\\pm\\infty"), tF(", deux polynômes non constants tendent vers l'infini : forme "), lF("\\frac{\\infty}{\\infty}"), tF(".")];
    const { n, d } = numerateurDenominateurLatex(e);
    if (e.famille === "formeIndeterminee") return [tF("En "), lF(`x=${e.a}`), tF(", le numérateur ET le dénominateur valent 0 : forme "), lF("\\frac{0}{0}"), tF(" ("), lF(`N(x)=${n}`), tF(").")];
    if (e.famille === "limiteInfiniePoint") return [tF("En "), lF(`x=${e.a}`), tF(", le dénominateur vaut 0 mais pas le numérateur : forme "), lF("\\frac{k}{0}"), tF(", limite infinie ("), lF(`D(x)=${d}`), tF(").")];
    return [tF("En "), lF(`x=${e.a}`), tF(", le dénominateur ne s'annule pas : on remplace directement.")];
  }
  if (phase === "limitesGaucheDroite" && e.famille === "limiteInfiniePoint") {
    const [g, dr] = choix.map(Number);
    if (g === e.signeLimiteDroite && dr === e.signeLimiteGauche && g !== dr) return [tF("Gauche et droite échangées : à gauche de a, "), lF("x-a<0"), tF(" (" ), lF("0^-"), tF(") ; à droite, "), lF("x-a>0"), tF(" ("), lF("0^+"), tF(").")];
    if (e.sousCas === "racineDouble") return [tF("Un carré "), lF("(x-a)^2"), tF(" est positif des deux côtés : il tend vers "), lF("0^+"), tF(", le signe vient du numérateur et du coefficient.")];
    return [tF("Le signe de chaque limite est le produit du signe du numérateur en a et de celui du dénominateur juste avant (ou après) a.")];
  }
  if (phase === "conclureLimite" && e.famille === "limiteInfiniePoint") {
    return e.sousCas === "racineSimple"
      ? [tF("Les deux limites latérales sont différentes : la limite en a n'existe pas.")]
      : [tF("Les deux limites latérales sont égales : la limite existe et vaut cet infini.")];
  }
  if (phase === "evaluerLimiteFinale" && e.famille === "limiteInfini") {
    return e.direction === "moins" && e.degreResultat % 2 === 1
      ? [tF("En "), lF("-\\infty"), tF(", une puissance IMPAIRE de x est négative : elle change le signe.")]
      : [tF("Le signe de la limite est celui du coefficient (et de "), lF("x^n"), tF(" en "), lF("-\\infty"), tF(" pour n impair).")];
  }
  return null;
}
