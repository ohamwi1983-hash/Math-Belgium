import type { TermeA } from "../core6e/calculPrimitives.types";
import type { ExerciceFamilleA_Problemes, ExerciceFamilleB_Problemes, ExerciceFamilleC_Problemes, ExerciceFamilleD_Problemes, ExerciceFamilleE_Problemes, ExerciceFamilleF_Problemes, ExerciceFamilleG_Problemes, ExerciceIntegralesProblemes } from "../core6e/integralesProblemes.types";
import type { PhaseIntegralesProblemes } from "../moteur6e/typesIntegralesProblemes";

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

/** Texte brut mêlé à du LaTeX inline court — même contrat que `ui/formatEquationDroite.ts`/
 * `ui6e/formatProprietesLogarithme.ts` (dupliqué ici à dessein, convention CLAUDE.md : un type aussi
 * petit ne justifie pas un module partagé) ; rendu via `components/RenduFragments.tsx`. */
export type FragmentConsigne = { type: "texte"; valeur: string } | { type: "latex"; valeur: string };

function texte(valeur: string): FragmentConsigne {
  return { type: "texte", valeur };
}
function latex(valeur: string): FragmentConsigne {
  return { type: "latex", valeur };
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
export function fractionLatex(num: number, den: number): string {
  let n = num;
  let d = den;
  if (d < 0) {
    n = -n;
    d = -d;
  }
  const g = pgcd(n, d);
  n /= g;
  d /= g;
  if (d === 1) return `${n}`;
  return n < 0 ? `-\\dfrac{${-n}}{${d}}` : `\\dfrac{${n}}{${d}}`;
}

/** Retrouve la fraction exacte d'un rationnel à petit dénominateur (≤ 1 000) — `null` sinon. */
function versFraction(x: number): { num: number; den: number } | null {
  for (let den = 1; den <= 1000; den++) {
    const num = Math.round(x * den);
    if (Math.abs(num - x * den) < 1e-7) return { num, den };
  }
  return null;
}

/** Nombre décimal en LaTeX, virgule décimale (`{,}`), au plus `decimales` chiffres après la
 * virgule, zéros finaux retirés. */
export function decimalLatex(x: number, decimales = 3): string {
  const facteur = 10 ** decimales;
  const arrondi = Math.round(x * facteur) / facteur;
  const texteNombre = (Object.is(arrondi, -0) ? 0 : arrondi).toFixed(decimales).replace(/\.?0+$/, "");
  return texteNombre.replace(".", "{,}");
}

function estDecimalExact(x: number, decimales = 3): boolean {
  const facteur = 10 ** decimales;
  return Math.abs(Math.round(x * facteur) / facteur - x) < 1e-9;
}

/** Valeur intrinsèquement irrationnelle/transcendante (résolution numérique, e, sin…) — toujours
 * préfixée `\approx`, virgule décimale. */
function approxLatex(x: number): string {
  return `\\approx ${decimalLatex(x)}`;
}

/** Rationnel affiché EXACTEMENT : décimal exact (≤ 3 chiffres) si possible, sinon fraction suivie
 * de sa valeur approchée (« \dfrac{56}{3} \approx 18{,}667 »). */
export function rationnelLatex(x: number): string {
  if (estDecimalExact(x)) return decimalLatex(x);
  const f = versFraction(x);
  if (f === null) return `${approxLatex(x)}`;
  return `${fractionLatex(f.num, f.den)}\\approx ${decimalLatex(x)}`;
}

/** Multiple rationnel de π, EXACT puis approché : « \dfrac{9}{2}\pi \approx 14{,}137 ». */
export function multiplePiLatex(coef: number): string {
  const f = versFraction(coef);
  const valeur = decimalLatex(coef * Math.PI);
  if (f === null) return `\\approx ${valeur}`;
  const g = pgcd(f.num, f.den);
  const n = f.num / g;
  const d = f.den / g;
  const signe = n < 0 ? "-" : "";
  const absN = Math.abs(n);
  const exact = d === 1 ? `${signe}${absN === 1 ? "" : absN}\\pi` : `${signe}\\dfrac{${absN === 1 ? "" : absN}\\pi}{${d}}`;
  return `${exact}\\approx ${valeur}`;
}

/** Terme affine signé COMPLET a·t+b — jamais un "+0"/"-0" orphelin (b peut être nul). */
export function afficheAffine(coefVar: number, cst: number, variable: string): string {
  const partVar = coefVar === 1 ? variable : coefVar === -1 ? `-${variable}` : `${coefVar}${variable}`;
  if (cst === 0) return partVar;
  return cst > 0 ? `${partVar}+${cst}` : `${partVar}-${Math.abs(cst)}`;
}

/** Somme de termes `num/den·corps`, EXACTE, avec coefficient/terme nul OMIS (jamais "+0t" ni "1t²"
 * — convention CLAUDE.md "jamais de signe/coefficient non simplifié à l'écran") — utilisée pour
 * v(t)/x(t) (famille B), dont certains coefficients (k/2, p, v0...) tombent régulièrement à 0 ou 1
 * pour de petits tirages. `corps=""` pour le terme constant. Jamais de fraction décimale (chaque
 * terme reste `num/den` EXACT, réduit par `fractionLatex`). */
export function sommeAffineExacteLatex(termes: { num: number; den: number; corps: string }[]): string {
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

export function sommeVolumeSimpleLatex(termes: TermeA[]): string {
  if (termes.length === 0) return "0";
  return termes.map((t, i) => termeVolumeSimpleLatex(t, i === 0)).join("");
}

/** Phrase de précision ajoutée aux consignes dont un résultat peut ne pas tomber juste. */
const PRECISION_CENTIEME = " Donne chaque résultat sous forme exacte, ou arrondi au centième.";

// ============================================================================
// Famille A — Méthode des trapèzes.
// ============================================================================

function libelleContexteA(exercice: ExerciceFamilleA_Problemes): { intro: string; grandeur: string; unite: string } {
  if (exercice.contexte === "terrain") {
    return { intro: "Un terrain irrégulier est sondé par des mesures de hauteur (en mètres), à intervalles réguliers de 1 m.", grandeur: "l'aire de la coupe transversale", unite: "m²" };
  }
  return {
    intro: "Un mur présente un profil irrégulier, sondé par des mesures de hauteur (en mètres) à intervalles réguliers de 1 m.",
    grandeur: "le volume de matière du mur (l'aire de la coupe multipliée par la profondeur)",
    unite: "m³",
  };
}

export function consigneGeneraleA(exercice: ExerciceFamilleA_Problemes): FragmentConsigne[] {
  const { intro, grandeur } = libelleContexteA(exercice);
  return [
    texte(`${intro} Aucune expression `),
    latex("f(x)"),
    texte(` n'est disponible : approche ${grandeur} par la méthode des trapèzes, `),
    latex("\\text{Aire}\\approx\\Delta x\\cdot\\left[\\dfrac{y_0+y_n}{2}+y_1+y_2+\\cdots+y_{n-1}\\right]"),
    texte("."),
  ];
}
export function blocDonneesA(exercice: ExerciceFamilleA_Problemes): string[] {
  const yTexte = exercice.y.map((v, i) => `y_{${i}}=${v}`).join("\\quad ");
  const lignes = [`\\Delta x=${exercice.deltaX}`, yTexte];
  if (exercice.dimensionSupplementaire !== null) lignes.push(`p=${exercice.dimensionSupplementaire}\\ \\text{m}`);
  return lignes;
}
export function consigneEcranA(exercice: ExerciceFamilleA_Problemes, phase: PhaseIntegralesProblemes): FragmentConsigne[] {
  if (phase === "aEcran1") return [texte("Calcule la somme entre crochets de la formule des trapèzes ; on la note S.")];
  const { grandeur } = libelleContexteA(exercice);
  const suite = exercice.dimensionSupplementaire !== null ? [texte(" (la profondeur du mur est notée "), latex("p"), texte(").")] : [texte(".")];
  return [texte(`Calcule ${grandeur}, à partir de la somme `), latex("S"), texte(" obtenue à l'étape 1"), ...suite];
}
export function etatActuelA(exercice: ExerciceFamilleA_Problemes, phase: PhaseIntegralesProblemes): string[] | null {
  if (phase === "aEcran2") return [`S=${rationnelLatex(exercice.sommeAttendue)}`];
  return null;
}
export function champsA(exercice: ExerciceFamilleA_Problemes, phase: PhaseIntegralesProblemes): ChampDef[] {
  if (phase === "aEcran1") return [{ type: "texte", label: "S =", placeholder: "ex : (6+7)/2+5+4" }];
  const { unite } = libelleContexteA(exercice);
  return [{ type: "texte", label: `Résultat (${unite}) =`, placeholder: "ex : 21,5" }];
}
export function niveauAideMaxA(phase: PhaseIntegralesProblemes): number {
  return phase === "aEcran1" ? 2 : 0;
}
export function aideNiveau1A(phase: PhaseIntegralesProblemes): AideAvecLatex {
  if (phase === "aEcran1") return { texte: "Chaque bande est approchée par un trapèze : la moyenne de deux hauteurs consécutives, multipliée par la largeur. En additionnant les bandes, les hauteurs extrêmes comptent une demi-fois, toutes les autres une fois.", latex: null };
  return AUCUNE_AIDE;
}
export function aideNiveau2A(exercice: ExerciceFamilleA_Problemes, phase: PhaseIntegralesProblemes): AideAvecLatex {
  if (phase !== "aEcran1") return AUCUNE_AIDE;
  const n = exercice.y.length - 1;
  return { texte: "Les deux hauteurs extrêmes sont déjà placées ; il reste à ajouter les hauteurs intermédiaires :", latex: `S=\\dfrac{${exercice.y[0]}+${exercice.y[n]}}{2} + y_1+y_2+\\cdots+y_{${n - 1}}` };
}

// ============================================================================
// Famille B — Cinématique.
// ============================================================================

export function consigneGeneraleB(exercice: ExerciceFamilleB_Problemes): FragmentConsigne[] {
  const debut: FragmentConsigne[] = [
    texte("Un mobile se déplace en ligne droite. Son accélération (en m/s², t en secondes) vaut "),
    latex(`a(t)=${afficheAffine(exercice.k, exercice.p, "t")}`),
    texte(" ; sa vitesse initiale vaut "),
    latex(`v(0)=${exercice.v0}`),
    texte(" m/s et sa position initiale "),
    latex(`x(0)=${exercice.x0}`),
    texte(" m. Détermine sa vitesse "),
    latex("v(t)"),
    texte(" puis sa position "),
    latex("x(t)"),
    texte(" (chaque condition initiale fixe sa propre constante), puis "),
  ];
  if (exercice.sousType === "evaluer") return [...debut, texte("sa position à l'instant "), latex(`t=${exercice.t1}`), texte(" s."), texte(PRECISION_CENTIEME)];
  return [...debut, texte("l'instant où il atteint la position "), latex(`x=${rationnelExactLatex(exercice.cible as number)}`), texte(" m.")];
}
/** Rationnel EXACT seul (fraction), sans valeur approchée — pour une DONNÉE d'énoncé. */
export function rationnelExactLatex(x: number): string {
  const f = versFraction(x);
  return f === null ? decimalLatex(x) : fractionLatex(f.num, f.den);
}
export function blocDonneesB(exercice: ExerciceFamilleB_Problemes): string[] {
  const lignes = [`a(t)=${afficheAffine(exercice.k, exercice.p, "t")}`, `v(0)=${exercice.v0}`, `x(0)=${exercice.x0}`];
  if (exercice.sousType === "evaluer") lignes.push(`t_1=${exercice.t1}`);
  else lignes.push(`x(t)=${rationnelExactLatex(exercice.cible as number)}`);
  return lignes;
}
export function consigneEcranB(exercice: ExerciceFamilleB_Problemes, phase: PhaseIntegralesProblemes): FragmentConsigne[] {
  if (phase === "bEcran1") return [texte("Intègre "), latex("a(t)"), texte(" pour obtenir "), latex("v(t)"), texte(", puis utilise "), latex("v(0)"), texte(" pour déterminer la constante.")];
  if (phase === "bEcran2")
    return [
      texte("Intègre "),
      latex("v(t)"),
      texte(" (obtenue à l'étape 1) pour obtenir "),
      latex("x(t)"),
      texte(", puis utilise "),
      latex("x(0)"),
      texte(" pour déterminer sa propre constante, distincte de celle de "),
      latex("v(t)"),
      texte("."),
    ];
  if (exercice.sousType === "evaluer") return [texte("Calcule la position "), latex(`x(${exercice.t1})`), texte(", à partir de "), latex("x(t)"), texte(" obtenue à l'étape 2.")];
  return [texte("Résous "), latex(`x(t)=${rationnelExactLatex(exercice.cible as number)}`), texte(" pour "), latex("t\\geq 0"), texte(", à partir de "), latex("x(t)"), texte(" obtenue à l'étape 2.")];
}
export function vLatexB(exercice: ExerciceFamilleB_Problemes): string {
  return sommeAffineExacteLatex([
    { num: exercice.k, den: 2, corps: "t^2" },
    { num: exercice.p, den: 1, corps: "t" },
    { num: exercice.v0, den: 1, corps: "" },
  ]);
}
export function xLatexB(exercice: ExerciceFamilleB_Problemes): string {
  return sommeAffineExacteLatex([
    { num: exercice.k, den: 6, corps: "t^3" },
    { num: exercice.p, den: 2, corps: "t^2" },
    { num: exercice.v0, den: 1, corps: "t" },
    { num: exercice.x0, den: 1, corps: "" },
  ]);
}
export function etatActuelB(exercice: ExerciceFamilleB_Problemes, phase: PhaseIntegralesProblemes): string[] | null {
  if (phase === "bEcran2") return [`v(t)=${vLatexB(exercice)}`];
  if (phase === "bEcran3") return [`v(t)=${vLatexB(exercice)}`, `x(t)=${xLatexB(exercice)}`];
  return null;
}
export function champsB(exercice: ExerciceFamilleB_Problemes, phase: PhaseIntegralesProblemes): ChampDef[] {
  if (phase === "bEcran1") return [{ type: "texte", label: "v(t) =", placeholder: "ex : 4t^2+t" }];
  if (phase === "bEcran2") return [{ type: "texte", label: "x(t) =", placeholder: "ex : 2t^3+t^2" }];
  return exercice.sousType === "evaluer" ? [{ type: "texte", label: `x(${exercice.t1}) =`, placeholder: "ex : 150" }] : [{ type: "texte", label: "t =", placeholder: "ex : 1,5" }];
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
  { valeur: "W", label: "W est le plus grand" },
  { valeur: "W2", label: "W₂ est le plus grand" },
  { valeur: "egaux", label: "W et W₂ sont égaux" },
];

export function travailC(k: number, a: number, b: number): number {
  return (k * (b * b - a * a)) / 2;
}
/** Bonne option de l'écran de comparaison (les deux travaux ne sont jamais égaux). */
export function comparaisonCorrecteC(exercice: ExerciceFamilleC_Problemes): string {
  const w1 = travailC(exercice.k, exercice.a, exercice.b);
  const w2 = travailC(exercice.k, exercice.a2 as number, exercice.b2 as number);
  return w2 > w1 ? "W2" : "W";
}

export function consigneGeneraleC(exercice: ExerciceFamilleC_Problemes): FragmentConsigne[] {
  const base: FragmentConsigne[] = [
    texte("La force nécessaire pour étirer un ressort suit la loi de Hooke : "),
    latex("F(x)=k\\cdot x"),
    texte(" (F en newtons, allongement x en mètres). On sait que "),
    latex(`F(${exercice.x0})=${exercice.F0}`),
    texte(". Le travail (en joules) pour étirer le ressort d'un allongement a à un allongement b vaut "),
    latex("W=\\displaystyle\\int_a^b k\\cdot x\\,dx"),
    texte(". Détermine k, puis le travail "),
    latex("W"),
    texte(" pour passer de "),
    latex(`x=${exercice.a}`),
    texte(" à "),
    latex(`x=${exercice.b}`),
  ];
  if (exercice.a2 === null) return [...base, texte(".")];
  return [
    ...base,
    texte(", puis le travail "),
    latex("W_2"),
    texte(" pour passer de "),
    latex(`x=${exercice.a2}`),
    texte(" à "),
    latex(`x=${exercice.b2}`),
    texte(" (même longueur), et compare les deux travaux."),
  ];
}
export function blocDonneesC(exercice: ExerciceFamilleC_Problemes): string[] {
  const lignes = [`F(${exercice.x0})=${exercice.F0}`, `[a\\,;\\,b]=[${exercice.a}\\,;\\,${exercice.b}]`];
  if (exercice.a2 !== null) lignes.push(`[a_2\\,;\\,b_2]=[${exercice.a2}\\,;\\,${exercice.b2}]`);
  return lignes;
}
export function consigneEcranC(phase: PhaseIntegralesProblemes): FragmentConsigne[] {
  if (phase === "cEcran1") return [texte("Détermine k à partir de la force connue ("), latex("F(x_0)=k\\cdot x_0"), texte(").")];
  if (phase === "cEcran2") return [texte("Calcule le travail "), latex("W=\\displaystyle\\int_a^b k\\cdot x\\,dx"), texte(", avec le k obtenu à l'étape 1.")];
  if (phase === "cEcran3")
    return [
      texte("Calcule le second travail "),
      latex("W_2=\\displaystyle\\int_{a_2}^{b_2} k\\cdot x\\,dx"),
      texte(" (même longueur d'intervalle que "),
      latex("[a\\,;\\,b]"),
      texte(", position différente)."),
    ];
  return [texte("Les deux intervalles ont la même longueur. Compare les deux travaux.")];
}
export function etatActuelC(exercice: ExerciceFamilleC_Problemes, phase: PhaseIntegralesProblemes): string[] | null {
  const lignes: string[] = [];
  if (phase === "cEcran2" || phase === "cEcran3" || phase === "cEcran4") lignes.push(`k=${exercice.k}`);
  if (phase === "cEcran3" || phase === "cEcran4") lignes.push(`W=${rationnelLatex(travailC(exercice.k, exercice.a, exercice.b))}`);
  if (phase === "cEcran4") lignes.push(`W_2=${rationnelLatex(travailC(exercice.k, exercice.a2 as number, exercice.b2 as number))}`);
  return lignes.length > 0 ? lignes : null;
}
export function champsC(phase: PhaseIntegralesProblemes): ChampDef[] {
  if (phase === "cEcran1") return [{ type: "texte", label: "k =", placeholder: "ex : 1,5" }];
  if (phase === "cEcran2") return [{ type: "texte", label: "W (en J) =", placeholder: "ex : 2,7" }];
  if (phase === "cEcran3") return [{ type: "texte", label: "W₂ (en J) =", placeholder: "ex : 3,7" }];
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

export function cLatexD(exercice: ExerciceFamilleD_Problemes): string {
  return `${exercice.a}q-${fractionLatex(exercice.bNum, 2 * exercice.bDen)}q^2+${exercice.F0}`;
}
export function consigneGeneraleD(exercice: ExerciceFamilleD_Problemes): FragmentConsigne[] {
  return [
    texte("Le coût marginal de production (en euros par unité) vaut "),
    latex(`f(q)=${exercice.a}-${fractionLatex(exercice.bNum, exercice.bDen)}q`),
    texte(", et le coût fixe vaut "),
    latex(`C(0)=${exercice.F0}`),
    texte(" €. Détermine le coût total "),
    latex("C(q)"),
    texte(", puis "),
    latex(`C(${exercice.q1})`),
    texte(", l'augmentation du coût total quand la production passe de "),
    latex(`${exercice.q1}`),
    texte(" à "),
    latex(`${exercice.q2}`),
    texte(" unités, et l'expression du coût moyen "),
    latex("C_{\\text{moy}}(q)=\\dfrac{C(q)}{q}"),
    texte("."),
    texte(PRECISION_CENTIEME),
  ];
}
export function blocDonneesD(exercice: ExerciceFamilleD_Problemes): string[] {
  return [`f(q)=${exercice.a}-${fractionLatex(exercice.bNum, exercice.bDen)}q`, `C(0)=${exercice.F0}`, `q_1=${exercice.q1}\\quad q_2=${exercice.q2}`];
}
export function consigneEcranD(phase: PhaseIntegralesProblemes): FragmentConsigne[] {
  if (phase === "dEcran1") return [texte("Intègre "), latex("f(q)"), texte(" pour obtenir "), latex("C(q)"), texte(", en utilisant "), latex("C(0)"), texte(" pour déterminer la constante.")];
  if (phase === "dEcran2") return [texte("Calcule "), latex("C(q_1)"), texte(", avec "), latex("C(q)"), texte(" obtenu à l'étape 1.")];
  if (phase === "dEcran3")
    return [
      texte("Calcule l'augmentation du coût total entre "),
      latex("q_1"),
      texte(" et "),
      latex("q_2"),
      texte(" — par la différence des coûts totaux, ou par l'intégrale du coût marginal : les deux méthodes donnent le même résultat."),
    ];
  return [texte("Donne l'expression du coût moyen "), latex("C_{\\text{moy}}(q)=\\dfrac{C(q)}{q}"), texte(".")];
}
export function etatActuelD(exercice: ExerciceFamilleD_Problemes, phase: PhaseIntegralesProblemes): string[] | null {
  const lignes: string[] = [];
  if (phase === "dEcran2" || phase === "dEcran3" || phase === "dEcran4") lignes.push(`C(q)=${cLatexD(exercice)}`);
  const c1 = exercice.CReference(exercice.q1);
  if (phase === "dEcran3" || phase === "dEcran4") lignes.push(`C(${exercice.q1})=${rationnelLatex(c1)}`);
  if (phase === "dEcran4") lignes.push(`C(${exercice.q2})-C(${exercice.q1})=${rationnelLatex(exercice.CReference(exercice.q2) - c1)}`);
  return lignes.length > 0 ? lignes : null;
}
export function champsD(phase: PhaseIntegralesProblemes): ChampDef[] {
  if (phase === "dEcran1") return [{ type: "texte", label: "C(q) =", placeholder: "ex : 25q-q^2/30+40" }];
  if (phase === "dEcran2") return [{ type: "texte", label: "C(q₁) =", placeholder: "ex : 1200" }];
  if (phase === "dEcran3") return [{ type: "texte", label: "Augmentation =", placeholder: "ex : 1500" }];
  return [{ type: "texte", label: "Coût moyen =", placeholder: "ex : (25q-q^2/30+40)/q" }];
}
export function niveauAideMaxD(phase: PhaseIntegralesProblemes): number {
  return phase === "dEcran3" ? 2 : 0;
}
export function aideNiveau1D(phase: PhaseIntegralesProblemes): AideAvecLatex {
  if (phase === "dEcran3") return { texte: "L'augmentation du coût total se calcule par la différence des coûts totaux, ou directement par l'intégrale du coût marginal ; les deux sont égales :", latex: "C(q_2)-C(q_1)=\\displaystyle\\int_{q_1}^{q_2} f(q)\\,dq" };
  return AUCUNE_AIDE;
}
export function aideNiveau2D(exercice: ExerciceFamilleD_Problemes, phase: PhaseIntegralesProblemes): AideAvecLatex {
  if (phase === "dEcran3") return { texte: "Les deux calculs, posés avec les valeurs de l'énoncé (non effectués) :", latex: `C(${exercice.q2})-C(${exercice.q1}) \\quad\\text{ou}\\quad \\int_{${exercice.q1}}^{${exercice.q2}} f(q)\\,dq` };
  return AUCUNE_AIDE;
}

// ============================================================================
// Famille E — Valeur moyenne en contexte (réutilise 6gen25 famille C).
// ============================================================================

export function fLatexE(exercice: ExerciceFamilleE_Problemes): string {
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

function libelleContexteE(contexte: ExerciceFamilleE_Problemes["contexte"]): { intro: string; grandeur: string; unite: string } {
  if (contexte === "stock") return { intro: "Le stock d'un entrepôt varie au rythme f(t) (en unités par jour, t en jours) : f(t) est le taux de variation du stock.", grandeur: "du stock", unite: "unités" };
  return { intro: "Le cours d'une action varie au rythme f(t) (en euros par jour, t en jours) : f(t) est le taux de variation du cours.", grandeur: "du cours", unite: "€" };
}

export function consigneGeneraleE(exercice: ExerciceFamilleE_Problemes): FragmentConsigne[] {
  const { intro, grandeur } = libelleContexteE(exercice.contexte);
  const { a, b } = exercice.exerciceMoyenne;
  return [
    texte(`${intro} On donne `),
    latex(`f(t)=${fLatexE(exercice)}`),
    texte(". Calcule la variation totale "),
    texte(grandeur),
    texte(" entre "),
    latex(`t=${a}`),
    texte(" et "),
    latex(`t=${b}`),
    texte(", puis la valeur moyenne de f sur cette période, et interprète cette valeur moyenne."),
  ];
}
export function blocDonneesE(exercice: ExerciceFamilleE_Problemes): string[] {
  const { a, b } = exercice.exerciceMoyenne;
  return [`f(t)=${fLatexE(exercice)}`, `[a\\,;\\,b]=[${a}\\,;\\,${b}]`];
}
export function consigneEcranE(phase: PhaseIntegralesProblemes): FragmentConsigne[] {
  if (phase === "eEcran1") return [texte("Calcule la variation totale "), latex("\\displaystyle\\int_a^b f(t)\\,dt"), texte(".")];
  if (phase === "eEcran2") return [texte("Calcule la valeur moyenne de f sur "), latex("[a\\,;\\,b]"), texte(", à partir de l'intégrale obtenue à l'étape 1.")];
  return [texte("Que représente cette valeur moyenne dans le contexte ?")];
}
export function etatActuelE(exercice: ExerciceFamilleE_Problemes, phase: PhaseIntegralesProblemes): string[] | null {
  const F = exercice.exerciceMoyenne.primitive.primitiveReference;
  const { a, b } = exercice.exerciceMoyenne;
  const integrale = F(b) - F(a);
  const lignes: string[] = [];
  if (phase === "eEcran2" || phase === "eEcran3") lignes.push(`\\displaystyle\\int_{${a}}^{${b}} f(t)\\,dt=${rationnelLatex(integrale)}`);
  if (phase === "eEcran3") lignes.push(`\\dfrac{1}{${b}-${a}}\\displaystyle\\int_{${a}}^{${b}} f(t)\\,dt=${rationnelLatex(integrale / (b - a))}`);
  return lignes.length > 0 ? lignes : null;
}
export function champsE(exercice: ExerciceFamilleE_Problemes, phase: PhaseIntegralesProblemes): ChampDef[] {
  if (phase === "eEcran1") return [{ type: "texte", label: "Variation totale =", placeholder: "ex : 2,5" }];
  if (phase === "eEcran2") return [{ type: "texte", label: "Valeur moyenne =", placeholder: "ex : 1,5" }];
  return [{ type: "choix", label: "Interprétation", options: exercice.optionsInterpretation }];
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

/** e^{-kx} écrit sans fraction en exposant : e^{-x/5}, e^{-3x/10}. */
export function demandeLatexF(exercice: ExerciceFamilleF_Problemes): string {
  const g = pgcd(exercice.kNum, exercice.kDen);
  const n = exercice.kNum / g;
  const d = exercice.kDen / g;
  const exposant = d === 1 ? `-${n === 1 ? "" : n}x` : `-${n === 1 ? "" : n}x/${d}`;
  return `${exercice.A}e^{${exposant}}`;
}

export function consigneGeneraleF(exercice: ExerciceFamilleF_Problemes): FragmentConsigne[] {
  return [
    texte("Sur un marché, la demande vaut "),
    latex(`f(x)=${demandeLatexF(exercice)}`),
    texte(" et l'offre "),
    latex(`g(x)=${afficheAffine(exercice.m, exercice.p, "x")}`),
    texte(" (x : quantité, prix en euros). Détermine le point d'équilibre "),
    latex("(Q\\,;\\,P)"),
    texte(", solution de "),
    latex("f(x)=g(x)"),
    texte(", avec Q et P arrondis au centième, puis le surplus du consommateur "),
    latex("S=\\displaystyle\\int_0^Q \\big(f(x)-P\\big)\\,dx"),
    texte(", arrondi au dixième."),
  ];
}
export function blocDonneesF(exercice: ExerciceFamilleF_Problemes): string[] {
  return [`f(x)=${demandeLatexF(exercice)}`, `g(x)=${afficheAffine(exercice.m, exercice.p, "x")}`];
}
export function consigneEcranF(phase: PhaseIntegralesProblemes): FragmentConsigne[] {
  if (phase === "fEcran1") return [texte("Résous "), latex("f(x)=g(x)"), texte(" numériquement (calculatrice graphique) pour trouver le point d'équilibre "), latex("(Q\\,;\\,P)"), texte(", au centième près.")];
  return [texte("Calcule le surplus du consommateur "), latex("S=\\displaystyle\\int_0^Q \\big(f(x)-P\\big)\\,dx"), texte(", avec Q et P obtenus à l'étape 1 ; arrondis S au dixième.")];
}
export function etatActuelF(exercice: ExerciceFamilleF_Problemes, phase: PhaseIntegralesProblemes): string[] | null {
  if (phase === "fEcran2") return [`Q${approxLatex(exercice.Q)}\\qquad P${approxLatex(exercice.P)}`];
  return null;
}
export function champsF(phase: PhaseIntegralesProblemes): ChampDef[] {
  if (phase === "fEcran1") return [{ type: "texte", label: "Q =", placeholder: "ex : 0,5" }, { type: "texte", label: "P =", placeholder: "ex : 1,5" }];
  return [{ type: "texte", label: "S =", placeholder: "ex : 0,3" }];
}
export function niveauAideMaxF(phase: PhaseIntegralesProblemes): number {
  return phase === "fEcran2" ? 2 : 0;
}
export function aideNiveau1F(phase: PhaseIntegralesProblemes): AideAvecLatex {
  if (phase === "fEcran2") return { texte: "Le surplus du consommateur est l'aire comprise entre la courbe de demande et la droite horizontale du prix d'équilibre, de 0 à la quantité d'équilibre.", latex: null };
  return AUCUNE_AIDE;
}
export function aideNiveau2F(exercice: ExerciceFamilleF_Problemes, phase: PhaseIntegralesProblemes): AideAvecLatex {
  if (phase !== "fEcran2") return AUCUNE_AIDE;
  return { texte: "Intégrale posée avec les valeurs de l'étape 1 (calcul non fait) :", latex: `S\\approx\\int_0^{${decimalLatex(exercice.Q, 2)}} \\big(${demandeLatexF(exercice)}-${decimalLatex(exercice.P, 2)}\\big)\\,dx` };
}

// ============================================================================
// Famille G — Volume de révolution appliqué (3 sous-types).
// ============================================================================

/** Volume de la pièce G_soustraction : multiple EXACT de π quand f est polynomiale (π·rationnel),
 * sinon valeur approchée (eˣ, cos x : forme close transcendante). */
export function volumeSoustractionLatex(exercice: Extract<ExerciceFamilleG_Problemes, { sousType: "soustraction" }>, volume: number): string {
  if (exercice.volumeTotal.type === "polynomiale" && versFraction(volume / Math.PI) !== null) return `=${multiplePiLatex(volume / Math.PI)}`;
  return approxLatex(volume);
}

/** Coefficient k de k·√x (G_archimède) : rien quand k = 1 (jamais « 1\\sqrt{x} »). */
export function coefRacineLatex(num: number, den: number): string {
  const c = fractionLatex(num, den);
  return c === "1" ? "" : c;
}

function rayonTrouLatex(exercice: Extract<ExerciceFamilleG_Problemes, { sousType: "soustraction" }>): string {
  return fractionLatex(exercice.rayonTrouNum, exercice.rayonTrouDen);
}

export function consigneGeneraleG(exercice: ExerciceFamilleG_Problemes): FragmentConsigne[] {
  if (exercice.sousType === "soustraction") {
    const vt = exercice.volumeTotal;
    return [
      texte("Une pièce est obtenue en faisant tourner, autour de l'axe des abscisses, la région comprise entre la courbe de "),
      latex(`f(x)=${sommeVolumeSimpleLatex(vt.termes)}`),
      texte(" et l'axe, pour "),
      latex(`x\\in[${vt.a}\\,;\\,${vt.b}]`),
      texte(". On la perce ensuite, selon l'axe et sur toute sa longueur, d'un trou cylindrique de rayon "),
      latex(`\\rho=${rayonTrouLatex(exercice)}`),
      texte(". Calcule le volume de la pièce pleine, puis le volume de matière restant."),
      texte(PRECISION_CENTIEME),
    ];
  }
  if (exercice.sousType === "archimede") {
    const p = exercice.paraboloide;
    return [
      texte("Un verre a la forme du solide engendré par la rotation, autour de l'axe des abscisses, de la région sous la courbe de "),
      latex(`f(x)=${coefRacineLatex(p.kNum, p.kDen)}\\sqrt{x}`),
      texte(" pour "),
      latex(`x\\in[0\\,;\\,${p.L}]`),
      texte(". Il est rempli d'eau à ras bord. On y plonge une bille de rayon "),
      latex(`r=${decimalLatex(exercice.r)}`),
      texte(", entièrement immergée. Détermine le volume du verre, le volume d'eau qui déborde, puis la fraction du volume d'eau initial qui a débordé."),
      texte(PRECISION_CENTIEME),
    ];
  }
  return [
    texte("Une sphère de rayon "),
    latex(`r=${exercice.r}`),
    texte(" contient de l'eau jusqu'à la hauteur "),
    latex(`h=${exercice.hDemande}`),
    texte(". La sphère est engendrée par la rotation du cercle "),
    latex("x^2+(y-r)^2=r^2"),
    texte(" autour de l'axe vertical ; le volume d'eau vaut "),
    latex("V(h)=\\pi\\displaystyle\\int_0^h\\left(r^2-(y-r)^2\\right)dy"),
    texte(". Calcule ce volume."),
    texte(PRECISION_CENTIEME),
  ];
}

export function blocDonneesG(exercice: ExerciceFamilleG_Problemes): string[] {
  if (exercice.sousType === "soustraction") {
    const vt = exercice.volumeTotal;
    return [`f(x)=${sommeVolumeSimpleLatex(vt.termes)}`, `[a\\,;\\,b]=[${vt.a}\\,;\\,${vt.b}]`, `\\rho=${rayonTrouLatex(exercice)}`];
  }
  if (exercice.sousType === "archimede") {
    const p = exercice.paraboloide;
    return [`f(x)=${coefRacineLatex(p.kNum, p.kDen)}\\sqrt{x}`, `[0\\,;\\,L]=[0\\,;\\,${p.L}]`, `r=${decimalLatex(exercice.r)}`];
  }
  return [`r=${exercice.r}`, `h=${exercice.hDemande}`];
}

export function consigneEcranG(exercice: ExerciceFamilleG_Problemes, phase: PhaseIntegralesProblemes): FragmentConsigne[] {
  if (exercice.sousType === "soustraction") {
    if (phase === "gSoustractionEcran1")
      return [
        texte("Calcule le volume de la pièce pleine, engendrée par la rotation de la région sous f sur "),
        latex("[a\\,;\\,b]"),
        texte(" : "),
        latex("V=\\pi\\displaystyle\\int_a^b [f(x)]^2\\,dx"),
        texte("."),
      ];
    return [texte("Retire le volume du trou cylindrique (rayon "), latex("\\rho"), texte(", longueur "), latex("b-a"), texte(") pour obtenir le volume de matière.")];
  }
  if (exercice.sousType === "archimede") {
    if (phase === "gArchimedeEcran1") return [texte("Calcule le volume du verre.")];
    if (phase === "gArchimedeEcran2") return [texte("Calcule le volume d'eau qui déborde quand la bille est entièrement immergée.")];
    return [texte("Calcule la fraction du volume d'eau initial qui a débordé (volume débordé divisé par le volume du verre).")];
  }
  if (phase === "gCalotteEcran1") return [texte("Écris l'intégrande "), latex("r^2-(y-r)^2"), texte(" en remplaçant r par sa valeur.")];
  if (phase === "gCalotteEcran2") return [texte("Développe cet intégrande, puis donne une primitive (en y, de constante nulle).")];
  return [texte("Calcule "), latex("V(h)"), texte(" pour la hauteur d'eau donnée.")];
}

export function etatActuelG(exercice: ExerciceFamilleG_Problemes, phase: PhaseIntegralesProblemes): string[] | null {
  if (exercice.sousType === "soustraction") {
    if (phase === "gSoustractionEcran2") return [`V_{\\text{pièce}}${volumeSoustractionLatex(exercice, exercice.volumeTotalAttendu)}`];
    return null;
  }
  if (exercice.sousType === "archimede") {
    const coefVerre = exercice.paraboloide.volumeParaboloide / Math.PI;
    const coefBille = (4 / 3) * exercice.r ** 3;
    if (phase === "gArchimedeEcran2") return [`V_{\\text{verre}}=${multiplePiLatex(coefVerre)}`];
    if (phase === "gArchimedeEcran3") return [`V_{\\text{verre}}=${multiplePiLatex(coefVerre)}`, `V_{\\text{bille}}=${multiplePiLatex(coefBille)}`];
    return null;
  }
  const r = exercice.r;
  const lignes: string[] = [];
  if (phase === "gCalotteEcran2" || phase === "gCalotteEcran3") lignes.push(`${r}^2-(y-${r})^2`);
  if (phase === "gCalotteEcran3") lignes.push(`F(y)=${r}y^2-\\dfrac{y^3}{3}`);
  return lignes.length > 0 ? lignes : null;
}

export function champsG(exercice: ExerciceFamilleG_Problemes, phase: PhaseIntegralesProblemes): ChampDef[] {
  if (exercice.sousType === "soustraction") {
    return phase === "gSoustractionEcran1" ? [{ type: "texte", label: "Volume de la pièce pleine =", placeholder: "ex : 0,4" }] : [{ type: "texte", label: "Volume de matière =", placeholder: "ex : 0,3" }];
  }
  if (exercice.sousType === "archimede") {
    if (phase === "gArchimedeEcran1") return [{ type: "texte", label: "Volume du verre =", placeholder: "ex : 3pi" }];
    if (phase === "gArchimedeEcran2") return [{ type: "texte", label: "Volume débordé =", placeholder: "ex : 5pi/2" }];
    return [{ type: "texte", label: "Fraction débordée =", placeholder: "ex : 0,95" }];
  }
  if (phase === "gCalotteEcran1") return [{ type: "texte", label: "Intégrande (en y) =", placeholder: "ex : 36-(y-6)^2" }];
  if (phase === "gCalotteEcran2") return [{ type: "texte", label: "Primitive (en y) =", placeholder: "ex : 6y^2-y^3/3" }];
  return [{ type: "texte", label: "V(h) =", placeholder: "ex : 2pi" }];
}

export function niveauAideMaxG(exercice: ExerciceFamilleG_Problemes, phase: PhaseIntegralesProblemes): number {
  return exercice.sousType === "archimede" && phase === "gArchimedeEcran2" ? 2 : 0;
}
export function aideNiveau1G(exercice: ExerciceFamilleG_Problemes, phase: PhaseIntegralesProblemes): AideAvecLatex {
  if (exercice.sousType === "archimede" && phase === "gArchimedeEcran2") {
    return { texte: "Un objet entièrement immergé déplace un volume d'eau égal à son propre volume : aucune intégrale n'est nécessaire ici.", latex: null };
  }
  return AUCUNE_AIDE;
}
export function aideNiveau2G(exercice: ExerciceFamilleG_Problemes, phase: PhaseIntegralesProblemes): AideAvecLatex {
  if (exercice.sousType === "archimede" && phase === "gArchimedeEcran2") {
    return { texte: "Volume d'une boule de rayon r (application non faite) :", latex: "V=\\dfrac{4}{3}\\pi r^3" };
  }
  return AUCUNE_AIDE;
}

// ============================================================================
// Dispatch commun.
// ============================================================================

export function consigneGenerale(exercice: ExerciceIntegralesProblemes): FragmentConsigne[] {
  switch (exercice.famille) {
    case "A":
      return consigneGeneraleA(exercice);
    case "B":
      return consigneGeneraleB(exercice);
    case "C":
      return consigneGeneraleC(exercice);
    case "D":
      return consigneGeneraleD(exercice);
    case "E":
      return consigneGeneraleE(exercice);
    case "F":
      return consigneGeneraleF(exercice);
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

export function consigneEcran(exercice: ExerciceIntegralesProblemes, phase: PhaseIntegralesProblemes): FragmentConsigne[] {
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
      return aideNiveau2D(exercice, phase);
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
  cEcran3: "Étape 3 (travail W₂)",
  cEcran4: "Étape 4 (comparaison)",
  dEcran1: "Étape 1 (C(q))",
  dEcran2: "Étape 2 (C(q₁))",
  dEcran3: "Étape 3 (augmentation)",
  dEcran4: "Étape 4 (coût moyen)",
  eEcran1: "Étape 1 (intégrale)",
  eEcran2: "Étape 2 (valeur moyenne)",
  eEcran3: "Étape 3 (interprétation)",
  fEcran1: "Étape 1 (équilibre (Q ; P))",
  fEcran2: "Étape 2 (surplus)",
  gSoustractionEcran1: "Étape 1 (volume de la pièce pleine)",
  gSoustractionEcran2: "Étape 2 (volume de matière)",
  gArchimedeEcran1: "Étape 1 (volume du verre)",
  gArchimedeEcran2: "Étape 2 (volume débordé)",
  gArchimedeEcran3: "Étape 3 (fraction débordée)",
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
 * recalculée depuis la saisie élève (même source de vérité que la vérification). Valeurs EXACTES
 * (fraction, multiple de π) suivies de leur valeur approchée, virgule décimale. */
export function formatReponseAttenduePhaseLatex(exercice: ExerciceIntegralesProblemes, phase: PhaseIntegralesProblemes): string[] {
  if (exercice.famille === "A") {
    return phase === "aEcran1" ? [`S=${rationnelLatex(exercice.sommeAttendue)}`] : [rationnelLatex(exercice.valeurFinaleAttendue)];
  }
  if (exercice.famille === "B") {
    if (phase === "bEcran1") return [`v(t)=${vLatexB(exercice)}`];
    if (phase === "bEcran2") return [`x(t)=${xLatexB(exercice)}`];
    if (exercice.sousType === "evaluer") return [`x(${exercice.t1})=${rationnelLatex(exercice.xReference(exercice.t1 as number))}`];
    return [`t=${exercice.tSolution}`];
  }
  if (exercice.famille === "C") {
    if (phase === "cEcran1") return [`k=${exercice.k}`];
    if (phase === "cEcran2") return [`W=${rationnelLatex(travailC(exercice.k, exercice.a, exercice.b))}`];
    if (phase === "cEcran3") return [`W_2=${rationnelLatex(travailC(exercice.k, exercice.a2 as number, exercice.b2 as number))}`];
    return [comparaisonCorrecteC(exercice) === "W2" ? "W_2>W" : "W>W_2"];
  }
  if (exercice.famille === "D") {
    if (phase === "dEcran1") return [`C(q)=${cLatexD(exercice)}`];
    if (phase === "dEcran2") return [`C(${exercice.q1})=${rationnelLatex(exercice.CReference(exercice.q1))}`];
    if (phase === "dEcran3") return [`C(${exercice.q2})-C(${exercice.q1})=${rationnelLatex(exercice.CReference(exercice.q2) - exercice.CReference(exercice.q1))}`];
    return [`C_{\\text{moy}}(q)=\\dfrac{${cLatexD(exercice)}}{q}`];
  }
  if (exercice.famille === "E") {
    const F = exercice.exerciceMoyenne.primitive.primitiveReference;
    const { a, b } = exercice.exerciceMoyenne;
    const integrale = F(b) - F(a);
    if (phase === "eEcran1") return [`\\displaystyle\\int_{${a}}^{${b}} f(t)\\,dt=${rationnelLatex(integrale)}`];
    if (phase === "eEcran2") return [rationnelLatex(integrale / (b - a))];
    // Réponse courte (rendue par KaTeX) : la phrase complète est le libellé de l'option choisie.
    return [exercice.contexte === "stock" ? "\\text{taux de variation moyen du stock}" : "\\text{taux de variation moyen du cours}"];
  }
  if (exercice.famille === "F") {
    if (phase === "fEcran1") return [`Q${approxLatex(exercice.Q)}`, `P${approxLatex(exercice.P)}`];
    return [`S${approxLatex(exercice.surplusAttendu)}`];
  }
  // Famille G.
  if (exercice.sousType === "soustraction") {
    if (phase === "gSoustractionEcran1") return [`V${volumeSoustractionLatex(exercice, exercice.volumeTotalAttendu)}`];
    const rho = exercice.rayonTrouNum / exercice.rayonTrouDen;
    return [`V_{\\text{trou}}=${multiplePiLatex(rho * rho * exercice.longueurTrou)}`, `V_{\\text{matière}}${volumeSoustractionLatex(exercice, exercice.volumeTotalAttendu - exercice.volumeInterieur)}`];
  }
  if (exercice.sousType === "archimede") {
    const coefVerre = exercice.paraboloide.volumeParaboloide / Math.PI;
    const coefBille = (4 / 3) * exercice.r ** 3;
    if (phase === "gArchimedeEcran1") return [multiplePiLatex(coefVerre)];
    if (phase === "gArchimedeEcran2") return [multiplePiLatex(coefBille)];
    return [rationnelLatex(coefBille / coefVerre)];
  }
  const r = exercice.r;
  if (phase === "gCalotteEcran1") return [`${r}^2-(y-${r})^2`];
  if (phase === "gCalotteEcran2") return [`${r}y^2-\\dfrac{y^3}{3}`];
  const h = exercice.hDemande;
  return [`V(${h})=${multiplePiLatex(r * h * h - (h * h * h) / 3)}`];
}
