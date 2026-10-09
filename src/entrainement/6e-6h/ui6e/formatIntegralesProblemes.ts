import type { TermeA } from "../core6e/calculPrimitives.types";
import type { ExerciceFamilleA_Problemes, ExerciceFamilleB_Problemes, ExerciceFamilleC_Problemes, ExerciceFamilleD_Problemes, ExerciceFamilleE_Problemes, ExerciceFamilleF_Problemes, ExerciceFamilleG_Problemes, ExerciceIntegralesProblemes } from "../core6e/integralesProblemes.types";
import type { PhaseIntegralesProblemes, ResultatExerciceIntegralesProblemes } from "../moteur6e/typesIntegralesProblemes";
import { phasesPourExercice } from "../moteur6e/typesIntegralesProblemes";

/**
 * Couche ui (6e) — textes de consigne/aide + formatage LaTeX pour `6gen29`. Dispatch sur
 * `exercice.famille` (PUIS `sousType` pour G) PUIS `phase`, mirroir `formatVolumesRevolution.ts`
 * (6gen27).
 *
 * **Vigilance signe orphelin** (bug déjà rencontré sur 6gen23, généralisé 6gen26/27) : chaque
 * fonction qui assemble un terme signé complet garde TOUJOURS signe+magnitude ENSEMBLE — jamais un
 * helper "signe seul" réutilisé nu ailleurs. Testé par une régression dédiée dans
 * `formatIntegralesProblemes.test.ts` (centaines de tirages, toutes familles/sous-types).
 */

export type TypeChamp = "texte" | "choix";

export interface OptionChoix {
  valeur: string;
  label: string;
}

export interface ChampDef {
  type: TypeChamp;
  label: string;
  placeholder?: string;
  options?: OptionChoix[];
}

export interface AideAvecLatex {
  texte: string;
  latex: string | null;
}

const AUCUNE_AIDE: AideAvecLatex = { texte: "", latex: null };

// ============================================================================
// Petits formateurs numériques/LaTeX partagés.
// ============================================================================

function pgcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b !== 0) [a, b] = [b, a % b];
  return a || 1;
}

/** Fraction EXACTE irréductible en LaTeX (jamais de décimal, convention CLAUDE.md) — utilisée pour
 * b (famille D) et k (famille F), tous deux stockés en fraction num/den exacte sur le core. */
function fractionLatex(num: number, den: number): string {
  let n = num;
  let d = den;
  if (d < 0) {
    n = -n;
    d = -d;
  }
  const g = pgcd(n, d);
  n /= g;
  d /= g;
  return d === 1 ? `${n}` : `\\dfrac{${n}}{${d}}`;
}

/** Demi-entier EXACT (toutes les sommes de la famille A sont k ou k+0,5, k entier) — jamais de
 * décimal arrondi pour cette valeur EXACTE (contrairement aux volumes/surplus, intrinsèquement
 * irrationnels, formatés via `approxLatex`). */
function demiEntierLatex(x: number): string {
  const double = Math.round(x * 2);
  if (Math.abs(double / 2 - x) > 1e-9) return approxLatex(x); // filet de sécurité, jamais atteint en pratique.
  return double % 2 === 0 ? `${double / 2}` : `\\dfrac{${double}}{2}`;
}

/** Valeur intrinsèquement irrationnelle/transcendante (π, résolution numérique...) — toujours
 * préfixée `\approx`, même convention que `nombreLatex` de `formatVolumesRevolution.ts`. */
function approxLatex(x: number): string {
  return `\\approx ${Math.round(x * 1000) / 1000}`;
}

/** Terme affine signé COMPLET a·t+b — jamais un "+0"/"-0" orphelin (b peut être nul). */
function afficheAffine(coefVar: number, cst: number, variable: string): string {
  const partVar = coefVar === 1 ? variable : coefVar === -1 ? `-${variable}` : `${coefVar}${variable}`;
  if (cst === 0) return partVar;
  return cst > 0 ? `${partVar}+${cst}` : `${partVar}-${Math.abs(cst)}`;
}

/** Somme de termes `num/den·corps`, EXACTE, avec coefficient/terme nul OMIS (jamais "+0t" ni "1t²"
 * — convention CLAUDE.md "jamais de signe/coefficient non simplifié à l'écran") — utilisée pour
 * v(t)/x(t) (famille B), dont certains coefficients (k/2, p, v0...) tombent régulièrement à 0 ou 1
 * pour de petits tirages. `corps=""` pour le terme constant. Jamais de fraction décimale (chaque
 * terme reste `num/den` EXACT, réduit par `fractionLatex`). */
function sommeAffineExacteLatex(termes: { num: number; den: number; corps: string }[]): string {
  const nonNuls = termes.filter((t) => t.num !== 0);
  if (nonNuls.length === 0) return "0";
  return nonNuls
    .map((t, i) => {
      const negatif = t.num < 0;
      const magnitude = fractionLatex(Math.abs(t.num), t.den);
      const s = negatif ? (i === 0 ? "-" : " - ") : i === 0 ? "" : " + ";
      const mag = magnitude === "1" && t.corps !== "" ? "" : magnitude;
      return `${s}${mag}${t.corps}`;
    })
    .join("");
}

/** Terme signé COMPLET (signe+magnitude) pour un `TermeA` LIMITÉ aux 4 formes produites par
 * `ExerciceVolumeA.termes` de 6gen27 (puissance/constante/expX/cosX — jamais invX/baseX/arctan/
 * arcsin, cf. `core6e/volumesRevolution.types.ts`) — jamais un signe seul. */
function termeVolumeSimpleLatex(t: TermeA, premier: boolean): string {
  const abs = Math.abs(t.coef);
  const s = t.coef < 0 ? (premier ? "-" : " - ") : premier ? "" : " + ";
  switch (t.type) {
    case "constante":
      return `${s}${abs}`;
    case "puissance": {
      const corps = t.n === 1 ? "x" : `x^{${t.n}}`;
      return `${s}${abs === 1 ? "" : abs}${corps}`;
    }
    case "expX":
      return `${s}${abs === 1 ? "" : abs}e^{x}`;
    case "cosX":
      return `${s}${abs === 1 ? "" : abs}\\cos(x)`;
    default:
      return `${s}${abs}`;
  }
}

function sommeVolumeSimpleLatex(termes: TermeA[]): string {
  if (termes.length === 0) return "0";
  return termes.map((t, i) => termeVolumeSimpleLatex(t, i === 0)).join("");
}

// ============================================================================
// Famille A — Méthode des trapèzes.
// ============================================================================

function libelleContexteA(exercice: ExerciceFamilleA_Problemes): { intro: string; grandeur: string; unite: string } {
  if (exercice.contexte === "terrain") {
    return { intro: "Un terrain irrégulier est sondé par des mesures de hauteur (en mètres), à intervalles réguliers de Δx=1 m.", grandeur: "l'aire de la coupe transversale", unite: "m²" };
  }
  return { intro: "Un mur présente un profil irrégulier, sondé par des mesures de hauteur (en mètres) à intervalles réguliers de Δx=1 m.", grandeur: "le volume total de matière (après avoir multiplié l'aire de la coupe par la profondeur donnée)", unite: "m³" };
}

export function consigneGeneraleA(exercice: ExerciceFamilleA_Problemes): string {
  const { intro, grandeur } = libelleContexteA(exercice);
  return `${intro} Aucune expression f(x) n'est disponible : on approxime ${grandeur} par la méthode des trapèzes, Aire ≈ Δx·[(y_0+y_n)/2 + y_1+y_2+...+y_(n-1)].`;
}
export function blocDonneesA(exercice: ExerciceFamilleA_Problemes): string[] {
  const yTexte = exercice.y.map((v, i) => `y_{${i}}=${v}`).join("\\text{, }");
  const lignes = [`\\Delta x=${exercice.deltaX}`, yTexte];
  if (exercice.dimensionSupplementaire !== null) lignes.push(`\\text{profondeur}=${exercice.dimensionSupplementaire}\\text{ m}`);
  return lignes;
}
export function consigneEcranA(exercice: ExerciceFamilleA_Problemes, phase: PhaseIntegralesProblemes): string {
  if (phase === "aEcran1") return "Pose la somme entre crochets de la formule des trapèzes (ne calcule pas encore le résultat final).";
  const { grandeur } = libelleContexteA(exercice);
  return `Calcule ${grandeur}, à partir de la somme confirmée ci-dessus.`;
}
export function etatActuelA(exercice: ExerciceFamilleA_Problemes, phase: PhaseIntegralesProblemes): string[] | null {
  if (phase === "aEcran2") return [`\\text{Somme confirmée}=${demiEntierLatex(exercice.sommeAttendue)}`];
  return null;
}
export function champsA(exercice: ExerciceFamilleA_Problemes, phase: PhaseIntegralesProblemes): ChampDef[] {
  if (phase === "aEcran1") return [{ type: "texte", label: "Somme (entre crochets) =", placeholder: "ex : (10+10)/2+8+12+9" }];
  const { unite } = libelleContexteA(exercice);
  return [{ type: "texte", label: `Valeur finale (${unite}) =`, placeholder: "ex : 39" }];
}
export function niveauAideMaxA(phase: PhaseIntegralesProblemes): number {
  return phase === "aEcran1" ? 2 : 0;
}
export function aideNiveau1A(phase: PhaseIntegralesProblemes): AideAvecLatex {
  if (phase === "aEcran1") return { texte: "La méthode des trapèzes fait la MOYENNE de deux hauteurs consécutives pour approximer l'aire de chaque bande, puis additionne toutes les bandes.", latex: null };
  return AUCUNE_AIDE;
}
export function aideNiveau2A(exercice: ExerciceFamilleA_Problemes, phase: PhaseIntegralesProblemes): AideAvecLatex {
  if (phase !== "aEcran1") return AUCUNE_AIDE;
  const n = exercice.y.length - 1;
  return { texte: "Formule rappelée, les 2 termes extrêmes déjà identifiés — la somme des termes intermédiaires n'est pas encore faite :", latex: `\\dfrac{${exercice.y[0]}+${exercice.y[n]}}{2} + y_1+y_2+\\cdots+y_{${n - 1}}` };
}

// ============================================================================
// Famille B — Cinématique.
// ============================================================================

export function consigneGeneraleB(): string {
  return "Un mobile a pour accélération a(t)=k·t+p. On connaît sa vitesse initiale v(0) et sa position initiale x(0). Détermine v(t) puis x(t), en utilisant CHAQUE condition initiale SÉPARÉMENT (2 constantes distinctes à déterminer).";
}
export function blocDonneesB(exercice: ExerciceFamilleB_Problemes): string[] {
  const lignes = [`a(t)=${afficheAffine(exercice.k, exercice.p, "t")}`, `v(0)=${exercice.v0}`, `x(0)=${exercice.x0}`];
  if (exercice.sousType === "evaluer") lignes.push(`t_1=${exercice.t1}`);
  else lignes.push(`\\text{distance cible}=${Math.round((exercice.cible as number) * 1000) / 1000}`);
  return lignes;
}
export function consigneEcranB(exercice: ExerciceFamilleB_Problemes, phase: PhaseIntegralesProblemes): string {
  if (phase === "bEcran1") return "Intègre a(t) pour obtenir v(t), puis utilise v(0) pour déterminer la constante.";
  if (phase === "bEcran2") return "Intègre v(t) confirmé ci-dessus pour obtenir x(t), puis utilise x(0) pour déterminer SA PROPRE constante (distincte de celle de v(t)).";
  return exercice.sousType === "evaluer" ? "Évalue x(t) au temps t1 donné, à partir de x(t) confirmé ci-dessus." : "Résous x(t)=distance cible (donnée ci-dessus) pour t, à partir de x(t) confirmé ci-dessus.";
}
function vLatexB(exercice: ExerciceFamilleB_Problemes): string {
  return sommeAffineExacteLatex([
    { num: exercice.k, den: 2, corps: "t^2" },
    { num: exercice.p, den: 1, corps: "t" },
    { num: exercice.v0, den: 1, corps: "" },
  ]);
}
function xLatexB(exercice: ExerciceFamilleB_Problemes): string {
  return sommeAffineExacteLatex([
    { num: exercice.k, den: 6, corps: "t^3" },
    { num: exercice.p, den: 2, corps: "t^2" },
    { num: exercice.v0, den: 1, corps: "t" },
    { num: exercice.x0, den: 1, corps: "" },
  ]);
}
export function etatActuelB(exercice: ExerciceFamilleB_Problemes, phase: PhaseIntegralesProblemes): string[] | null {
  if (phase === "bEcran2") return [`v(t)\\text{ confirmé}=${vLatexB(exercice)}`];
  if (phase === "bEcran3") return [`v(t)\\text{ confirmé}=${vLatexB(exercice)}`, `x(t)\\text{ confirmé}=${xLatexB(exercice)}`];
  return null;
}
export function champsB(exercice: ExerciceFamilleB_Problemes, phase: PhaseIntegralesProblemes): ChampDef[] {
  if (phase === "bEcran1") return [{ type: "texte", label: "v(t) =", placeholder: "ex : t^2/2+3" }];
  if (phase === "bEcran2") return [{ type: "texte", label: "x(t) =", placeholder: "ex : t^3/6+3t" }];
  return exercice.sousType === "evaluer" ? [{ type: "texte", label: `x(${exercice.t1}) =`, placeholder: "ex : 12" }] : [{ type: "texte", label: "t (solution) =", placeholder: "ex : 3" }];
}
export function niveauAideMaxB(): number {
  return 0;
}
export function aideNiveau1B(): AideAvecLatex {
  return AUCUNE_AIDE;
}
export function aideNiveau2B(): AideAvecLatex {
  return AUCUNE_AIDE;
}

// ============================================================================
// Famille C — Travail, loi de Hooke.
// ============================================================================

const OPTIONS_COMPARAISON: OptionChoix[] = [
  { valeur: "identique", label: "Oui, les deux travaux sont égaux" },
  { valeur: "different", label: "Non, les travaux sont différents (F(x)=kx n'est pas constante)" },
];

export function consigneGeneraleC(): string {
  return "La force nécessaire pour étirer un ressort suit la loi de Hooke : F(x)=k·x. Une paire (allongement, force) connue permet de trouver k. Le travail pour étirer le ressort de a à b vaut W=∫[a;b] k·x dx.";
}
export function blocDonneesC(exercice: ExerciceFamilleC_Problemes): string[] {
  const lignes = [`F_0=${exercice.F0}\\text{ N pour }x_0=${exercice.x0}\\text{ m}`, `a=${exercice.a}\\text{, }b=${exercice.b}`];
  if (exercice.a2 !== null) lignes.push(`a_2=${exercice.a2}\\text{, }b_2=${exercice.b2}`);
  return lignes;
}
export function consigneEcranC(phase: PhaseIntegralesProblemes): string {
  if (phase === "cEcran1") return "Détermine k à partir de la paire connue (F_0=k·x_0).";
  if (phase === "cEcran2") return "Calcule le travail W=∫[a;b] k·x dx, à partir du k confirmé ci-dessus.";
  if (phase === "cEcran3") return "Calcule le second travail W_2=∫[a_2;b_2] k·x dx (même longueur d'intervalle que [a;b], position différente).";
  return "Les deux travaux (même longueur d'intervalle) sont-ils égaux ?";
}
export function etatActuelC(exercice: ExerciceFamilleC_Problemes, phase: PhaseIntegralesProblemes): string[] | null {
  const lignes: string[] = [];
  if (phase === "cEcran2" || phase === "cEcran3" || phase === "cEcran4") lignes.push(`k\\text{ confirmé}=${exercice.k}`);
  if (phase === "cEcran3" || phase === "cEcran4") {
    const w1 = (exercice.k * (exercice.b * exercice.b - exercice.a * exercice.a)) / 2;
    lignes.push(`W\\text{ confirmé}=${w1}`);
  }
  if (phase === "cEcran4") {
    const w2 = (exercice.k * ((exercice.b2 as number) * (exercice.b2 as number) - (exercice.a2 as number) * (exercice.a2 as number))) / 2;
    lignes.push(`W_2\\text{ confirmé}=${w2}`);
  }
  return lignes.length > 0 ? lignes : null;
}
export function champsC(phase: PhaseIntegralesProblemes): ChampDef[] {
  if (phase === "cEcran1") return [{ type: "texte", label: "k =", placeholder: "ex : 2" }];
  if (phase === "cEcran2") return [{ type: "texte", label: "W (J) =", placeholder: "ex : 8" }];
  if (phase === "cEcran3") return [{ type: "texte", label: "W_2 (J) =", placeholder: "ex : 24" }];
  return [{ type: "choix", label: "Comparaison", options: OPTIONS_COMPARAISON }];
}
export function niveauAideMaxC(): number {
  return 0;
}
export function aideNiveau1C(): AideAvecLatex {
  return AUCUNE_AIDE;
}
export function aideNiveau2C(): AideAvecLatex {
  return AUCUNE_AIDE;
}

// ============================================================================
// Famille D — Coût marginal, total et moyen.
// ============================================================================

export function consigneGeneraleD(): string {
  return "Le coût marginal de production est f(q)=a−b·q (affine décroissant). Le coût fixe C(0) est donné. Détermine le coût total C(q), puis étudie son évolution entre q_1 et q_2, et son coût moyen.";
}
export function blocDonneesD(exercice: ExerciceFamilleD_Problemes): string[] {
  return [`f(q)=${exercice.a}-${fractionLatex(exercice.bNum, exercice.bDen)}q`, `C(0)=${exercice.F0}`, `q_1=${exercice.q1}\\text{, }q_2=${exercice.q2}`];
}
export function consigneEcranD(phase: PhaseIntegralesProblemes): string {
  if (phase === "dEcran1") return "Intègre f(q) pour obtenir C(q), en utilisant C(0) pour déterminer la constante.";
  if (phase === "dEcran2") return "Évalue C(q_1), à partir de C(q) confirmé ci-dessus.";
  if (phase === "dEcran3") return "Calcule l'augmentation de coût entre q_1 et q_2 (C(q_2)−C(q_1), OU l'intégrale définie de f entre q_1 et q_2 — les deux méthodes donnent le même résultat).";
  return "Donne l'expression du coût moyen, C_{moy}(q)=C(q)/q.";
}
function cLatexD(exercice: ExerciceFamilleD_Problemes): string {
  return `${exercice.a}q-${fractionLatex(exercice.bNum, 2 * exercice.bDen)}q^2+${exercice.F0}`;
}
export function etatActuelD(exercice: ExerciceFamilleD_Problemes, phase: PhaseIntegralesProblemes): string[] | null {
  const lignes: string[] = [];
  if (phase === "dEcran2" || phase === "dEcran3" || phase === "dEcran4") lignes.push(`C(q)\\text{ confirmé}=${cLatexD(exercice)}`);
  const c1 = exercice.CReference(exercice.q1);
  if (phase === "dEcran3" || phase === "dEcran4") lignes.push(`C(q_1)=${Math.round(c1 * 1000) / 1000}`);
  if (phase === "dEcran4") {
    const augmentation = exercice.CReference(exercice.q2) - c1;
    lignes.push(`\\text{Augmentation confirmée}=${Math.round(augmentation * 1000) / 1000}`);
  }
  return lignes.length > 0 ? lignes : null;
}
export function champsD(phase: PhaseIntegralesProblemes): ChampDef[] {
  if (phase === "dEcran1") return [{ type: "texte", label: "C(q) =", placeholder: "ex : 15q-q^2/20+100" }];
  if (phase === "dEcran2") return [{ type: "texte", label: "C(q_1) =", placeholder: "ex : 240" }];
  if (phase === "dEcran3") return [{ type: "texte", label: "Augmentation =", placeholder: "ex : 100" }];
  return [{ type: "texte", label: "C_{moy}(q) =", placeholder: "ex : (15q-q^2/20+100)/q" }];
}
export function niveauAideMaxD(phase: PhaseIntegralesProblemes): number {
  return phase === "dEcran3" ? 2 : 0;
}
export function aideNiveau1D(phase: PhaseIntegralesProblemes): AideAvecLatex {
  if (phase === "dEcran3") return { texte: "L'augmentation de coût entre 2 quantités se calcule soit via C(q_2)−C(q_1), soit directement via l'intégrale définie du coût marginal entre q_1 et q_2 — les deux méthodes sont équivalentes.", latex: null };
  return AUCUNE_AIDE;
}
export function aideNiveau2D(phase: PhaseIntegralesProblemes): AideAvecLatex {
  if (phase === "dEcran3") return { texte: "Les 2 méthodes, côte à côte (calcul non fait) :", latex: "C(q_2)-C(q_1) \\quad\\text{ou}\\quad \\int_{q_1}^{q_2} f(q)\\,dq" };
  return AUCUNE_AIDE;
}

// ============================================================================
// Famille E — Valeur moyenne en contexte (réutilise 6gen25 famille C).
// ============================================================================

function fLatexE(exercice: ExerciceFamilleE_Problemes): string {
  const primitive = exercice.exerciceMoyenne.primitive;
  const termes: TermeA[] = primitive.famille === "A" && primitive.sousType === "direct" ? primitive.termes : [];
  if (termes.length === 0) return "0";
  return termes
    .map((t, i) => {
      const abs = Math.abs(t.coef);
      const s = t.coef < 0 ? (i === 0 ? "-" : " - ") : i === 0 ? "" : " + ";
      if (t.type === "constante") return `${s}${abs}`;
      return `${s}${abs === 1 ? "" : abs}t`;
    })
    .join("");
}

function libelleContexteE(contexte: ExerciceFamilleE_Problemes["contexte"]): { intro: string; grandeur: string } {
  if (contexte === "stock") return { intro: "Le stock d'un entrepôt varie selon un taux f(t) (unités/jour).", grandeur: "le stock" };
  return { intro: "Le cours d'une action varie selon un taux f(t) (€/jour).", grandeur: "le cours" };
}

export function consigneGeneraleE(exercice: ExerciceFamilleE_Problemes): string {
  const { intro } = libelleContexteE(exercice.contexte);
  return `${intro} Calcule la variation totale sur [a;b], puis la valeur moyenne de f sur cette période, et interprète le résultat.`;
}
export function blocDonneesE(exercice: ExerciceFamilleE_Problemes): string[] {
  const { a, b } = exercice.exerciceMoyenne;
  return [`f(t)=${fLatexE(exercice)}`, `[a\\text{ ; }b]=[${a}\\text{ ; }${b}]`];
}
export function consigneEcranE(phase: PhaseIntegralesProblemes): string {
  if (phase === "eEcran1") return "Calcule ∫[a;b] f(t) dt.";
  if (phase === "eEcran2") return "Calcule la valeur moyenne de f sur [a;b], à partir de l'intégrale confirmée ci-dessus.";
  return "Interprète ce résultat dans le contexte donné.";
}
export function etatActuelE(exercice: ExerciceFamilleE_Problemes, phase: PhaseIntegralesProblemes): string[] | null {
  const F = exercice.exerciceMoyenne.primitive.primitiveReference;
  const { a, b } = exercice.exerciceMoyenne;
  const integrale = F(b) - F(a);
  const lignes: string[] = [];
  if (phase === "eEcran2" || phase === "eEcran3") lignes.push(`\\text{Intégrale confirmée}=${Math.round(integrale * 1000) / 1000}`);
  if (phase === "eEcran3") lignes.push(`\\text{Valeur moyenne confirmée}=${Math.round((integrale / (b - a)) * 1000) / 1000}`);
  return lignes.length > 0 ? lignes : null;
}
export function champsE(exercice: ExerciceFamilleE_Problemes, phase: PhaseIntegralesProblemes): ChampDef[] {
  if (phase === "eEcran1") return [{ type: "texte", label: "Intégrale =", placeholder: "ex : 16" }];
  if (phase === "eEcran2") return [{ type: "texte", label: "Valeur moyenne =", placeholder: "ex : 4" }];
  return [{ type: "choix", label: "Interprétation correcte", options: exercice.optionsInterpretation }];
}
export function niveauAideMaxE(): number {
  return 0;
}
export function aideNiveau1E(): AideAvecLatex {
  return AUCUNE_AIDE;
}
export function aideNiveau2E(): AideAvecLatex {
  return AUCUNE_AIDE;
}

// ============================================================================
// Famille F — Surplus consommateur.
// ============================================================================

export function consigneGeneraleF(): string {
  return "La fonction de demande est f(x)=A·e^(−k·x) (décroissante), l'offre g(x)=m·x+p (affine croissante, donnée explicitement). Résous f(x)=g(x) pour trouver le point d'équilibre (Q,P), puis calcule le surplus consommateur = ∫[0;Q] (f(x)−P) dx.";
}
export function blocDonneesF(exercice: ExerciceFamilleF_Problemes): string[] {
  return [`f(x)=${exercice.A}e^{-${fractionLatex(exercice.kNum, exercice.kDen)}x}`, `g(x)=${afficheAffine(exercice.m, exercice.p, "x")}`];
}
export function consigneEcranF(phase: PhaseIntegralesProblemes): string {
  if (phase === "fEcran1") return "Résous f(x)=g(x) pour trouver le point d'équilibre (Q,P) — numériquement (calculatrice graphique).";
  return "Calcule le surplus consommateur = ∫[0;Q] (f(x)−P) dx, à partir de Q,P confirmés ci-dessus.";
}
export function etatActuelF(exercice: ExerciceFamilleF_Problemes, phase: PhaseIntegralesProblemes): string[] | null {
  if (phase === "fEcran2") return [`Q${approxLatex(exercice.Q)}\\text{, }P${approxLatex(exercice.P)}`];
  return null;
}
export function champsF(phase: PhaseIntegralesProblemes): ChampDef[] {
  if (phase === "fEcran1") return [{ type: "texte", label: "Q =", placeholder: "ex : 3.2" }, { type: "texte", label: "P =", placeholder: "ex : 11.6" }];
  return [{ type: "texte", label: "Surplus consommateur =", placeholder: "ex : 15.4" }];
}
export function niveauAideMaxF(phase: PhaseIntegralesProblemes): number {
  return phase === "fEcran2" ? 2 : 0;
}
export function aideNiveau1F(phase: PhaseIntegralesProblemes): AideAvecLatex {
  if (phase === "fEcran2") return { texte: "Le surplus consommateur est l'aire entre la courbe de demande et la droite horizontale du prix d'équilibre, de 0 à la quantité d'équilibre.", latex: null };
  return AUCUNE_AIDE;
}
export function aideNiveau2F(exercice: ExerciceFamilleF_Problemes, phase: PhaseIntegralesProblemes): AideAvecLatex {
  if (phase !== "fEcran2") return AUCUNE_AIDE;
  return { texte: "Intégrale posée (calcul non fait) :", latex: `\\int_0^{Q} (f(x)-P)\\,dx \\quad\\text{avec }Q${approxLatex(exercice.Q)}\\text{, }P${approxLatex(exercice.P)}` };
}

// ============================================================================
// Famille G — Volume de révolution appliqué (3 sous-types).
// ============================================================================

export function consigneGeneraleG(exercice: ExerciceFamilleG_Problemes): string {
  if (exercice.sousType === "soustraction") return "On connaît le volume total d'un solide de révolution (rotation de f autour de l'axe des abscisses). Un volume intérieur creux (cylindrique) en est retiré. Calcule le volume de matière restant.";
  if (exercice.sousType === "archimede") return "Un verre en forme de paraboloïde (rotation de f(x)=k√x sur [0;L]) contient de l'eau. Une bille de rayon r y est introduite, TOTALEMENT immergée. Détermine le volume du verre, le volume d'eau déplacé, puis la fraction du volume initial expulsée.";
  return "Une sphère de rayon r contient de l'eau jusqu'à une hauteur h (0≤h≤2r). En utilisant l'équation du cercle décalé x²+(y−r)²=r², détermine le volume d'eau V(h)=π∫[0;h](r²−(y−r)²)dy.";
}

export function blocDonneesG(exercice: ExerciceFamilleG_Problemes): string[] {
  if (exercice.sousType === "soustraction") {
    const vt = exercice.volumeTotal;
    return [`f(x)=${sommeVolumeSimpleLatex(vt.termes)}`, `[a\\text{ ; }b]=[${vt.a}\\text{ ; }${vt.b}]`, `V_{intérieur}${approxLatex(exercice.volumeInterieur)}`];
  }
  if (exercice.sousType === "archimede") {
    const p = exercice.paraboloide;
    return [`f(x)=${fractionLatex(p.kNum, p.kDen)}\\sqrt{x}`, `[0\\text{ ; }L]=[0\\text{ ; }${p.L}]`, `r=${exercice.r}`];
  }
  return [`r=${exercice.r}`, `h=${exercice.hDemande}`];
}

export function consigneEcranG(exercice: ExerciceFamilleG_Problemes, phase: PhaseIntegralesProblemes): string {
  if (exercice.sousType === "soustraction") {
    return phase === "gSoustractionEcran1" ? "Calcule le volume total obtenu par rotation de f sur [a;b] autour de l'axe des abscisses (V=π∫[a;b] f(x)² dx)." : "Soustrais le volume intérieur creux donné pour obtenir le volume de matière.";
  }
  if (exercice.sousType === "archimede") {
    if (phase === "gArchimedeEcran1") return "Calcule le volume du paraboloïde (le contenant).";
    if (phase === "gArchimedeEcran2") return "Calcule le volume d'eau déplacé par la bille totalement immergée.";
    return "Calcule la fraction du volume initial qui a été expulsée (volume déplacé / volume du paraboloïde).";
  }
  if (phase === "gCalotteEcran1") return "Pose l'intégrande r²−(y−r)² (remplace r par sa valeur numérique).";
  if (phase === "gCalotteEcran2") return "Développe puis calcule la primitive de cet intégrande (en y, constante nulle).";
  return "Évalue V(h) pour la hauteur d'eau donnée.";
}

export function etatActuelG(exercice: ExerciceFamilleG_Problemes, phase: PhaseIntegralesProblemes): string[] | null {
  if (exercice.sousType === "soustraction") {
    if (phase === "gSoustractionEcran2") return [`V_{total}\\text{ confirmé}${approxLatex(exercice.volumeTotalAttendu)}`];
    return null;
  }
  if (exercice.sousType === "archimede") {
    const vp = exercice.paraboloide.volumeParaboloide;
    const deplace = (4 / 3) * Math.PI * exercice.r * exercice.r * exercice.r;
    if (phase === "gArchimedeEcran2") return [`V_{parabo}\\text{ confirmé}${approxLatex(vp)}`];
    if (phase === "gArchimedeEcran3") return [`V_{parabo}\\text{ confirmé}${approxLatex(vp)}`, `V_{déplacé}\\text{ confirmé}${approxLatex(deplace)}`];
    return null;
  }
  const r = exercice.r;
  const lignes: string[] = [];
  if (phase === "gCalotteEcran2" || phase === "gCalotteEcran3") lignes.push(`\\text{Intégrande posé}=r^2-(y-r)^2\\text{, avec }r=${r}`);
  if (phase === "gCalotteEcran3") lignes.push(`\\text{Primitive confirmée}=${r}y^2-\\dfrac{y^3}{3}`);
  return lignes.length > 0 ? lignes : null;
}

export function champsG(exercice: ExerciceFamilleG_Problemes, phase: PhaseIntegralesProblemes): ChampDef[] {
  if (exercice.sousType === "soustraction") {
    return phase === "gSoustractionEcran1" ? [{ type: "texte", label: "V total =", placeholder: "ex : 25.1" }] : [{ type: "texte", label: "V matière =", placeholder: "ex : 18.4" }];
  }
  if (exercice.sousType === "archimede") {
    if (phase === "gArchimedeEcran1") return [{ type: "texte", label: "V paraboloïde =", placeholder: "ex : 25.1" }];
    if (phase === "gArchimedeEcran2") return [{ type: "texte", label: "V déplacé =", placeholder: "ex : 4.19" }];
    return [{ type: "texte", label: "Fraction expulsée =", placeholder: "ex : 0.17" }];
  }
  if (phase === "gCalotteEcran1") return [{ type: "texte", label: "Intégrande (en y) =", placeholder: "ex : 9-(y-3)^2" }];
  if (phase === "gCalotteEcran2") return [{ type: "texte", label: "Primitive (en y) =", placeholder: "ex : 3y^2-y^3/3" }];
  return [{ type: "texte", label: "V(h) =", placeholder: "ex : 18.8" }];
}

export function niveauAideMaxG(exercice: ExerciceFamilleG_Problemes, phase: PhaseIntegralesProblemes): number {
  return exercice.sousType === "archimede" && phase === "gArchimedeEcran2" ? 2 : 0;
}
export function aideNiveau1G(exercice: ExerciceFamilleG_Problemes, phase: PhaseIntegralesProblemes): AideAvecLatex {
  if (exercice.sousType === "archimede" && phase === "gArchimedeEcran2") {
    return { texte: "Si un solide est TOTALEMENT immergé, le volume d'eau déplacé est EXACTEMENT égal au volume de ce solide — aucune intégrale supplémentaire n'est nécessaire ici.", latex: null };
  }
  return AUCUNE_AIDE;
}
export function aideNiveau2G(exercice: ExerciceFamilleG_Problemes, phase: PhaseIntegralesProblemes): AideAvecLatex {
  if (exercice.sousType === "archimede" && phase === "gArchimedeEcran2") {
    return { texte: "Formule du volume d'une sphère (application non faite) :", latex: "V=\\dfrac{4}{3}\\pi r^3" };
  }
  return AUCUNE_AIDE;
}

// ============================================================================
// Dispatch commun.
// ============================================================================

export function consigneGenerale(exercice: ExerciceIntegralesProblemes): string {
  switch (exercice.famille) {
    case "A":
      return consigneGeneraleA(exercice);
    case "B":
      return consigneGeneraleB();
    case "C":
      return consigneGeneraleC();
    case "D":
      return consigneGeneraleD();
    case "E":
      return consigneGeneraleE(exercice);
    case "F":
      return consigneGeneraleF();
    case "G":
      return consigneGeneraleG(exercice);
  }
}

export function blocDonnees(exercice: ExerciceIntegralesProblemes): string[] {
  switch (exercice.famille) {
    case "A":
      return blocDonneesA(exercice);
    case "B":
      return blocDonneesB(exercice);
    case "C":
      return blocDonneesC(exercice);
    case "D":
      return blocDonneesD(exercice);
    case "E":
      return blocDonneesE(exercice);
    case "F":
      return blocDonneesF(exercice);
    case "G":
      return blocDonneesG(exercice);
  }
}

export function consigneEcran(exercice: ExerciceIntegralesProblemes, phase: PhaseIntegralesProblemes): string {
  switch (exercice.famille) {
    case "A":
      return consigneEcranA(exercice, phase);
    case "B":
      return consigneEcranB(exercice, phase);
    case "C":
      return consigneEcranC(phase);
    case "D":
      return consigneEcranD(phase);
    case "E":
      return consigneEcranE(phase);
    case "F":
      return consigneEcranF(phase);
    case "G":
      return consigneEcranG(exercice, phase);
  }
}

export function etatActuel(exercice: ExerciceIntegralesProblemes, phase: PhaseIntegralesProblemes): string[] | null {
  switch (exercice.famille) {
    case "A":
      return etatActuelA(exercice, phase);
    case "B":
      return etatActuelB(exercice, phase);
    case "C":
      return etatActuelC(exercice, phase);
    case "D":
      return etatActuelD(exercice, phase);
    case "E":
      return etatActuelE(exercice, phase);
    case "F":
      return etatActuelF(exercice, phase);
    case "G":
      return etatActuelG(exercice, phase);
  }
}

export function champsEcran(exercice: ExerciceIntegralesProblemes, phase: PhaseIntegralesProblemes): ChampDef[] {
  switch (exercice.famille) {
    case "A":
      return champsA(exercice, phase);
    case "B":
      return champsB(exercice, phase);
    case "C":
      return champsC(phase);
    case "D":
      return champsD(phase);
    case "E":
      return champsE(exercice, phase);
    case "F":
      return champsF(phase);
    case "G":
      return champsG(exercice, phase);
  }
}

export function niveauAideMaxEcran(exercice: ExerciceIntegralesProblemes, phase: PhaseIntegralesProblemes): number {
  switch (exercice.famille) {
    case "A":
      return niveauAideMaxA(phase);
    case "B":
      return niveauAideMaxB();
    case "C":
      return niveauAideMaxC();
    case "D":
      return niveauAideMaxD(phase);
    case "E":
      return niveauAideMaxE();
    case "F":
      return niveauAideMaxF(phase);
    case "G":
      return niveauAideMaxG(exercice, phase);
  }
}

export function aideNiveau1(exercice: ExerciceIntegralesProblemes, phase: PhaseIntegralesProblemes): AideAvecLatex {
  switch (exercice.famille) {
    case "A":
      return aideNiveau1A(phase);
    case "B":
      return aideNiveau1B();
    case "C":
      return aideNiveau1C();
    case "D":
      return aideNiveau1D(phase);
    case "E":
      return aideNiveau1E();
    case "F":
      return aideNiveau1F(phase);
    case "G":
      return aideNiveau1G(exercice, phase);
  }
}

export function aideNiveau2(exercice: ExerciceIntegralesProblemes, phase: PhaseIntegralesProblemes): AideAvecLatex {
  switch (exercice.famille) {
    case "A":
      return aideNiveau2A(exercice, phase);
    case "B":
      return aideNiveau2B();
    case "C":
      return aideNiveau2C();
    case "D":
      return aideNiveau2D(phase);
    case "E":
      return aideNiveau2E();
    case "F":
      return aideNiveau2F(exercice, phase);
    case "G":
      return aideNiveau2G(exercice, phase);
  }
}

export const LIBELLE_PHASE: Record<PhaseIntegralesProblemes, string> = {
  aEcran1: "Étape 1 (somme des trapèzes)",
  aEcran2: "Étape 2 (valeur finale)",
  bEcran1: "Étape 1 (v(t))",
  bEcran2: "Étape 2 (x(t))",
  bEcran3: "Étape 3 (résultat)",
  cEcran1: "Étape 1 (k)",
  cEcran2: "Étape 2 (travail W)",
  cEcran3: "Étape 3 (travail W2)",
  cEcran4: "Étape 4 (comparaison)",
  dEcran1: "Étape 1 (C(q))",
  dEcran2: "Étape 2 (C(q1))",
  dEcran3: "Étape 3 (augmentation)",
  dEcran4: "Étape 4 (coût moyen)",
  eEcran1: "Étape 1 (intégrale)",
  eEcran2: "Étape 2 (valeur moyenne)",
  eEcran3: "Étape 3 (interprétation)",
  fEcran1: "Étape 1 (équilibre Q,P)",
  fEcran2: "Étape 2 (surplus)",
  gSoustractionEcran1: "Étape 1 (volume total)",
  gSoustractionEcran2: "Étape 2 (volume de matière)",
  gArchimedeEcran1: "Étape 1 (volume paraboloïde)",
  gArchimedeEcran2: "Étape 2 (volume déplacé)",
  gArchimedeEcran3: "Étape 3 (fraction expulsée)",
  gCalotteEcran1: "Étape 1 (intégrande)",
  gCalotteEcran2: "Étape 2 (primitive)",
  gCalotteEcran3: "Étape 3 (V(h))",
};

export const LIBELLE_FAMILLE: Record<ExerciceIntegralesProblemes["famille"], string> = {
  A: "A — Méthode des trapèzes",
  B: "B — Cinématique (a→v→x)",
  C: "C — Travail, loi de Hooke",
  D: "D — Coût marginal/total/moyen",
  E: "E — Valeur moyenne en contexte",
  F: "F — Surplus consommateur",
  G: "G — Volume de révolution appliqué",
};

/** Récapitulatif final : affiche toujours la réponse CORRECTE connue de l'exercice — jamais
 * recalculée depuis la saisie élève (même source de vérité que la vérification). */
export function formatReponseAttenduePhaseLatex(exercice: ExerciceIntegralesProblemes, phase: PhaseIntegralesProblemes): string[] {
  if (exercice.famille === "A") {
    return phase === "aEcran1" ? [demiEntierLatex(exercice.sommeAttendue)] : [demiEntierLatex(exercice.valeurFinaleAttendue)];
  }
  if (exercice.famille === "B") {
    if (phase === "bEcran1") return [vLatexB(exercice)];
    if (phase === "bEcran2") return [xLatexB(exercice)];
    const finale = exercice.sousType === "evaluer" ? exercice.xReference(exercice.t1 as number) : (exercice.tSolution as number);
    return [`${Math.round(finale * 1000) / 1000}`];
  }
  if (exercice.famille === "C") {
    if (phase === "cEcran1") return [`${exercice.k}`];
    const w = (exercice.k * (exercice.b * exercice.b - exercice.a * exercice.a)) / 2;
    if (phase === "cEcran2") return [`${w}`];
    if (phase === "cEcran3") return [`${(exercice.k * ((exercice.b2 as number) * (exercice.b2 as number) - (exercice.a2 as number) * (exercice.a2 as number))) / 2}`];
    return ["\\text{Différents}"];
  }
  if (exercice.famille === "D") {
    if (phase === "dEcran1") return [cLatexD(exercice)];
    if (phase === "dEcran2") return [`${Math.round(exercice.CReference(exercice.q1) * 1000) / 1000}`];
    if (phase === "dEcran3") return [`${Math.round((exercice.CReference(exercice.q2) - exercice.CReference(exercice.q1)) * 1000) / 1000}`];
    return [`\\dfrac{C(q)}{q}`];
  }
  if (exercice.famille === "E") {
    const F = exercice.exerciceMoyenne.primitive.primitiveReference;
    const { a, b } = exercice.exerciceMoyenne;
    const integrale = F(b) - F(a);
    if (phase === "eEcran1") return [`${Math.round(integrale * 1000) / 1000}`];
    if (phase === "eEcran2") return [`${Math.round((integrale / (b - a)) * 1000) / 1000}`];
    const label = exercice.optionsInterpretation.find((o) => o.valeur === exercice.interpretationCorrecte)?.label ?? exercice.interpretationCorrecte;
    return [`\\text{${label}}`];
  }
  if (exercice.famille === "F") {
    if (phase === "fEcran1") return [`Q${approxLatex(exercice.Q)}`, `P${approxLatex(exercice.P)}`];
    return [approxLatex(exercice.surplusAttendu)];
  }
  // Famille G.
  if (exercice.sousType === "soustraction") {
    return phase === "gSoustractionEcran1" ? [approxLatex(exercice.volumeTotalAttendu)] : [approxLatex(exercice.volumeTotalAttendu - exercice.volumeInterieur)];
  }
  if (exercice.sousType === "archimede") {
    const deplace = (4 / 3) * Math.PI * exercice.r * exercice.r * exercice.r;
    if (phase === "gArchimedeEcran1") return [approxLatex(exercice.paraboloide.volumeParaboloide)];
    if (phase === "gArchimedeEcran2") return [approxLatex(deplace)];
    return [approxLatex(deplace / exercice.paraboloide.volumeParaboloide)];
  }
  const r = exercice.r;
  if (phase === "gCalotteEcran1") return [`${r}^2-(y-${r})^2`];
  if (phase === "gCalotteEcran2") return [`${r}y^2-\\dfrac{y^3}{3}`];
  const F = exercice.primitiveReference;
  return [approxLatex(Math.PI * (F(exercice.hDemande) - F(0)))];
}

/** Total points du récapitulatif final — maximum VARIABLE (100 × nombre d'écrans réellement
 * traversés par CET exercice). */
export function calculerTotalPointsIntegralesProblemes(resultat: ResultatExerciceIntegralesProblemes): { total: number; maximum: number } {
  const phases = phasesPourExercice(resultat.exercice);
  const total = phases.reduce((acc, phase) => acc + (resultat.scores[phase] ?? 0), 0);
  return { total, maximum: phases.length * 100 };
}
