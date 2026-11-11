import type { ExerciceVolumeA, ExerciceVolumeB, ExerciceVolumeC, ExerciceVolumeD, ExerciceVolumesRevolution, TermeDeveloppe } from "../core6e/volumesRevolution.types";
import type { PhaseVolumesRevolution } from "../moteur6e/typesVolumesRevolution";
import { carreTermes } from "../generateurs6e/volumesRevolution/polynome";
import { CONSIGNE_PRECISION, decimalLatex, fractionDepuisValeur, fractionLatex, multiplePiLatex } from "./nombresExactsIntegrales";

/**
 * Couche ui (6e) — textes de consigne/aide + formatage LaTeX pour `6gen27`. Dispatch sur
 * `exercice.famille` PUIS `phase`, mirroir `formatCalculAires.ts` (6gen26).
 *
 * **Vigilance signe orphelin (bug déjà rencontré et corrigé sur 6gen23, fix généralisé par
 * 6gen26)** : DEUX SEULES fonctions assemblent un terme signé complet — `termeVolumeLatex`
 * (développement) et `primitiveTermeVolumeLatex` (primitive) — TOUJOURS signe+magnitude ENSEMBLE,
 * jamais un helper "signe seul" utilisé nu ailleurs dans ce fichier. Testé par une régression
 * dédiée dès le premier jet (`formatVolumesRevolution.test.ts`, "aucun signe/groupe vide dans le
 * LaTeX généré", des centaines de tirages aléatoires sur les 4 familles).
 *
 * Couche ui ↔ Couche A libre (CLAUDE.md) : `carreTermes` (`generateurs6e/volumesRevolution/
 * polynome.ts`) est réutilisée pour l'aide niveau 2 de la famille C (afficher sup(x)²/inf(x)²
 * séparément), jamais réimplémentée.
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

/** Magnitude (toujours POSITIVE) d'une fraction irréductible num/den — jamais le signe, voir
 * `termeVolumeLatex`/`primitiveTermeVolumeLatex` pour l'assemblage sign+magnitude complet. */
function magnitudeFractionLatex(num: number, den: number): string {
  // Un coefficient non entier (famille A trigonométrique : c²/2 = 9/2) est d'abord écrit en
  // fraction exacte, sinon le PGCD sur des décimaux donnait « 4.5 » (audit point 19).
  const fNum = fractionDepuisValeur(num) ?? { num, den: 1 };
  let n = Math.abs(fNum.num);
  let d = Math.abs(den * fNum.den);
  if (n === 0) return "0";
  const g = pgcd(n, d);
  n /= g;
  d /= g;
  return d === 1 ? `${n}` : `\\dfrac{${n}}{${d}}`;
}

/** Arrondi à 3 décimales pour affichage (récapitulatif/aide) — jamais utilisé pour la vérification
 * (qui reste exacte, tolérance `moteur6e/`). */
/** Volume : « = multiple exact de π ≈ décimal » quand V/π est rationnel (familles A polynomiale,
 * B, C, D), sinon la forme close fournie (`exactLatex`, familles A exponentielle et
 * trigonométrique) — audit chapitre 4 de 6e, point 16. Virgule décimale, « ≈ » seulement devant un
 * arrondi. */
function nombreLatex(x: number, exactLatex?: string | null): string {
  const exact = exactLatex ?? multiplePiLatex(x);
  return exact ? `=${exact}\\approx ${decimalLatex(x)}` : `\\approx ${decimalLatex(x)}`;
}

/** Coefficient entier ou fractionnaire écrit en LaTeX (9/2 → \dfrac{9}{2}). */
function coefLatex(c: number): string {
  const f = fractionDepuisValeur(c);
  return f ? fractionLatex(f.num, f.den) : decimalLatex(c);
}

/** Terme signé COMPLET (signe + magnitude) du DÉVELOPPEMENT — jamais le signe seul (voir en-tête
 * de fichier). Couvre les 4 formes `TermeA` réellement produites par ce générateur
 * (puissance/constante/expX/cosX) + les 2 formes additionnelles `expRate2`/`cosRate2`. */
function termeVolumeLatex(t: TermeDeveloppe, premier: boolean): string {
  const absNombre = Math.abs(t.coef);
  // `abs` est une CHAÎNE (coefficient exact : 9/2 et non 4.5) ; le test « coefficient 1 » se fait
  // sur le nombre.
  const abs = coefLatex(absNombre);
  const s = t.coef < 0 ? (premier ? "-" : " - ") : premier ? "" : " + ";
  switch (t.type) {
    case "constante":
      return `${s}${abs}`;
    case "puissance": {
      const corps = t.n === 1 ? "x" : `x^{${t.n}}`;
      return `${s}${absNombre === 1 ? "" : abs}${corps}`;
    }
    case "expX":
      return `${s}${absNombre === 1 ? "" : abs}e^{x}`;
    case "expRate2":
      return `${s}${absNombre === 1 ? "" : abs}e^{2x}`;
    case "cosX":
      return `${s}${absNombre === 1 ? "" : abs}\\cos(x)`;
    case "cosRate2":
      return `${s}${absNombre === 1 ? "" : abs}\\cos(2x)`;
    default:
      // Formes `TermeA` jamais produites par CE générateur (invX/baseX/arctanTerme/arcsinTerme) —
      // gardé uniquement pour l'exhaustivité du switch TypeScript (`TermeDeveloppe` ⊇ `TermeA`).
      return `${s}${abs}`;
  }
}

/** Somme de `TermeDeveloppe` en LaTeX — `"0"` si vide (jamais une chaîne vide, qui produirait un
 * groupe KaTeX vide). */
function sommeVolumeLatex(termes: TermeDeveloppe[]): string {
  if (termes.length === 0) return "0";
  return termes.map((t, i) => termeVolumeLatex(t, i === 0)).join("");
}

/** Développement PARTIEL — tous les termes sauf le dernier, suivi de "…" (aide niveau 2, familles
 * A/B) : jamais le développement complet (ce serait donner la réponse), jamais un terme unique
 * incompréhensible pour un développement à 1 seul terme (auquel cas la somme entière est montrée,
 * rien à cacher). */
function developpementPartielLatex(developpe: TermeDeveloppe[]): string {
  if (developpe.length <= 1) return sommeVolumeLatex(developpe);
  return `${sommeVolumeLatex(developpe.slice(0, -1))} + \\ldots`;
}

/** Terme signé COMPLET (signe + magnitude) de la PRIMITIVE d'un `TermeDeveloppe` — jamais le signe
 * seul. La primitive de chaque forme est une fraction éventuellement non entière
 * (`magnitudeFractionLatex`), jamais stockée en décimal (CLAUDE.md). */
function primitiveTermeVolumeLatex(t: TermeDeveloppe, premier: boolean): string {
  let num: number;
  let den: number;
  let corps: string;
  switch (t.type) {
    case "constante":
      num = t.coef;
      den = 1;
      corps = "x";
      break;
    case "puissance": {
      const n = t.n as number;
      num = t.coef;
      den = n + 1;
      corps = n + 1 === 1 ? "x" : `x^{${n + 1}}`;
      break;
    }
    case "expX":
      num = t.coef;
      den = 1;
      corps = "e^{x}";
      break;
    case "expRate2":
      num = t.coef;
      den = 2;
      corps = "e^{2x}";
      break;
    case "cosX":
      num = t.coef;
      den = 1;
      corps = "\\sin(x)";
      break;
    case "cosRate2":
      num = t.coef;
      den = 2;
      corps = "\\sin(2x)";
      break;
    default:
      num = t.coef;
      den = 1;
      corps = "";
  }
  const negatif = num < 0 !== den < 0;
  const s = negatif ? (premier ? "-" : " - ") : premier ? "" : " + ";
  const magnitude = magnitudeFractionLatex(num, den);
  return magnitude === "1" ? `${s}${corps}` : `${s}${magnitude}${corps}`;
}

/** Primitive complète (constante nulle) d'une somme de `TermeDeveloppe`, en LaTeX. */
function sommePrimitiveVolumeLatex(termes: TermeDeveloppe[]): string {
  if (termes.length === 0) return "0";
  return termes.map((t, i) => primitiveTermeVolumeLatex(t, i === 0)).join("");
}

const OPTIONS_ORDRE: OptionChoix[] = [
  { valeur: "fSurG", label: "f(x) ≥ g(x)" },
  { valeur: "gSurF", label: "g(x) ≥ f(x)" },
];

// ============================================================================
// Famille A — Volume par rotation d'une courbe seule, bornes données.
// ============================================================================

function fLatexA(exercice: ExerciceVolumeA): string {
  return sommeVolumeLatex(exercice.termes);
}

function puissanceELatex(n: number): string {
  if (n === 0) return "1";
  if (n === 1) return "e";
  return `e^{${n}}`;
}

/** Forme close EXACTE du volume, familles A exponentielle et trigonométrique (V/π n'y est pas
 * rationnel) ; `null` pour la famille polynomiale (multiple rationnel de π, écrit par
 * `multiplePiLatex`). Trigonométrique : a, b ∈ {−1 ; 0 ; 1} et [f(x)]² = c/2 + (c/2)cos(2x), donc
 * V = π·(b − a)·(c/4)·(2 + sin 2). */
export function volumeExactALatex(exercice: ExerciceVolumeA): string | null {
  const { a, b } = exercice;
  if (exercice.type === "trigonometrique") {
    const c = exercice.termes[0].coef ** 2;
    const f = fractionDepuisValeur(((b - a) * c) / 4) ?? { num: (b - a) * c, den: 4 };
    const coef = f.num === 1 ? "" : `${f.num}`;
    const facteur = f.den === 1 ? `${coef}\\pi` : `\\dfrac{${coef}\\pi}{${f.den}}`;
    return `${facteur}\\left(2+\\sin(2)\\right)`;
  }
  if (exercice.type === "exponentielle") {
    const morceaux: string[] = [];
    for (const t of exercice.developpe) {
      if (t.type === "expRate2") morceaux.push(`${coefLatex(t.coef / 2)}\\left(${puissanceELatex(2 * b)}-${puissanceELatex(2 * a)}\\right)`);
      else if (t.type === "expX") morceaux.push(`${coefLatex(t.coef)}\\left(${puissanceELatex(b)}-${puissanceELatex(a)}\\right)`);
      else if (t.type === "constante") morceaux.push(`${coefLatex(t.coef * (b - a))}`);
    }
    const somme = morceaux.map((m, i) => (i === 0 || m.startsWith("-") ? m : `+${m}`)).join("");
    return `\\pi\\left(${somme}\\right)`;
  }
  return null;
}

export function consigneGeneraleA(): FragmentConsigne[] {
  return [
    texte("On fait tourner autour de l'axe des abscisses la région comprise entre la courbe de f et l'axe des abscisses, sur l'intervalle "),
    latex("[a;b]"),
    texte(" donné. Le volume du solide obtenu vaut "),
    latex("V=\\pi\\displaystyle\\int_a^b [f(x)]^2\\,dx"),
    texte("."),
  ];
}
export function blocDonneesA(exercice: ExerciceVolumeA): string[] {
  return [`f(x)=${fLatexA(exercice)}`, `a=${exercice.a}\\text{, }b=${exercice.b}`];
}
export function consigneEcranA(phase: PhaseVolumesRevolution): FragmentConsigne[] {
  if (phase === "aEcran1")
    return [texte("Développe et simplifie "), latex("[f(x)]^2"), texte(" (utilise l'identité "), latex("\\cos^2(x)=\\dfrac{1+\\cos(2x)}{2}"), texte(" si f est trigonométrique).")];
  if (phase === "aEcran2") return [texte("Calcule une primitive de l'expression développée de "), latex("[f(x)]^2"), texte(", confirmée à l'étape précédente.")];
  return [texte(`Évalue cette primitive entre a et b, puis multiplie par π, pour obtenir le volume V. ${CONSIGNE_PRECISION}`)];
}
export function etatActuelA(exercice: ExerciceVolumeA, phase: PhaseVolumesRevolution): string[] | null {
  if (phase === "aEcran2") return [`[f(x)]^2=${sommeVolumeLatex(exercice.developpe)}`];
  if (phase === "aEcran3") return [`[f(x)]^2=${sommeVolumeLatex(exercice.developpe)}`, `\\text{Primitive}=${sommePrimitiveVolumeLatex(exercice.developpe)}`];
  return null;
}
export function champsA(phase: PhaseVolumesRevolution): ChampDef[] {
  if (phase === "aEcran1") return [{ type: "texte", label: "[f(x)]² développé et simplifié =", placeholder: "ex : 25x^2 - 7x + 11" }];
  if (phase === "aEcran2") return [{ type: "texte", label: "Primitive de [f(x)]² =", placeholder: "ex : 5x^3 + 11x" }];
  return [{ type: "texte", label: "V =", placeholder: "ex : 9pi/7" }];
}
export function niveauAideMaxA(phase: PhaseVolumesRevolution): number {
  return phase === "aEcran1" ? 2 : 0;
}
export function aideNiveau1A(phase: PhaseVolumesRevolution): AideAvecLatex {
  if (phase === "aEcran1")
    return {
      texte: "Développe le carré avant de chercher une primitive. Le signe de f n'intervient pas : le carré est toujours positif, et une partie de la région située sous l'axe engendre le même solide que sa symétrique au-dessus.",
      latex: "[f(x)]^2\\geq 0",
    };
  return AUCUNE_AIDE;
}
export function aideNiveau2A(exercice: ExerciceVolumeA, phase: PhaseVolumesRevolution): AideAvecLatex {
  if (phase === "aEcran1") return { texte: "Développement partiellement effectué :", latex: developpementPartielLatex(exercice.developpe) };
  return AUCUNE_AIDE;
}

// ============================================================================
// Famille B — Volume par rotation, bornes à trouver.
// ============================================================================

export function consigneGeneraleB(): FragmentConsigne[] {
  return [
    texte("On fait tourner autour de l'axe des abscisses la région comprise entre la courbe de f et l'axe des abscisses, entre les deux racines de f. Le volume du solide obtenu vaut "),
    latex("V=\\pi\\displaystyle\\int_{r_1}^{r_2} [f(x)]^2\\,dx"),
    texte(", où "),
    latex("r_1<r_2"),
    texte(" sont les racines de f."),
  ];
}
export function blocDonneesB(exercice: ExerciceVolumeB): string[] {
  return [`f(x)=${sommeVolumeLatex(exercice.termes)}`];
}
export function consigneEcranB(phase: PhaseVolumesRevolution): FragmentConsigne[] {
  if (phase === "bEcran1") return [texte("Trouve les racines de f : ce sont les bornes de l'intégrale.")];
  if (phase === "bEcran2") return [texte("Développe et simplifie "), latex("[f(x)]^2"), texte(".")];
  if (phase === "bEcran3") return [texte("Calcule une primitive de l'expression développée de "), latex("[f(x)]^2"), texte(", confirmée à l'étape précédente.")];
  return [texte(`Évalue cette primitive entre les racines, puis multiplie par π, pour obtenir le volume V. ${CONSIGNE_PRECISION}`)];
}
export function etatActuelB(exercice: ExerciceVolumeB, phase: PhaseVolumesRevolution): string[] | null {
  const racines = `r_1=${exercice.r1}\\text{, }r_2=${exercice.r2}`;
  if (phase === "bEcran2") return [racines];
  if (phase === "bEcran3") return [racines, `[f(x)]^2=${sommeVolumeLatex(exercice.developpe)}`];
  if (phase === "bEcran4") return [racines, `[f(x)]^2=${sommeVolumeLatex(exercice.developpe)}`, `\\text{Primitive}=${sommePrimitiveVolumeLatex(exercice.developpe)}`];
  return null;
}
export function champsB(phase: PhaseVolumesRevolution): ChampDef[] {
  if (phase === "bEcran2") return [{ type: "texte", label: "[f(x)]² développé et simplifié =", placeholder: "ex : 25x^2 - 7x + 11" }];
  if (phase === "bEcran3") return [{ type: "texte", label: "Primitive de [f(x)]² =", placeholder: "ex : 5x^3 + 11x" }];
  if (phase === "bEcran4") return [{ type: "texte", label: "V =", placeholder: "ex : 9pi/7" }];
  return []; // bEcran1 : géré par le composant add-as-needed dédié, jamais par champsEcran.
}
export function niveauAideMaxB(phase: PhaseVolumesRevolution): number {
  return phase === "bEcran2" ? 2 : 0;
}
export function aideNiveau1B(phase: PhaseVolumesRevolution): AideAvecLatex {
  if (phase === "bEcran2") return aideNiveau1A("aEcran1");
  return AUCUNE_AIDE;
}
export function aideNiveau2B(exercice: ExerciceVolumeB, phase: PhaseVolumesRevolution): AideAvecLatex {
  if (phase === "bEcran2") return { texte: "Développement partiellement effectué :", latex: developpementPartielLatex(exercice.developpe) };
  return AUCUNE_AIDE;
}

// ============================================================================
// Famille C — Volume entre une courbe et une droite.
// ============================================================================

/** `termesSup`/`termesInf` (choisis selon `ordre`) — utilisés par l'aide niveau 2 (sup(x)²/inf(x)²
 * affichés séparément) ET disponibles pour tout futur besoin d'affichage distinct de f/g. */
function termesSupInf(exercice: ExerciceVolumeC): { sup: ExerciceVolumeC["termesF"]; inf: ExerciceVolumeC["termesF"] } {
  return exercice.ordre === "fSurG" ? { sup: exercice.termesF, inf: exercice.termesG } : { sup: exercice.termesG, inf: exercice.termesF };
}

/** Noms des fonctions du dessus et du dessous, une fois l'ordre confirmé (audit point 19 : plus de
 * « sup(x) »/« inf(x) », noms d'opérateurs). */
function nomsDessusDessous(exercice: ExerciceVolumeC): { dessus: string; dessous: string } {
  return exercice.ordre === "fSurG" ? { dessus: "f", dessous: "g" } : { dessus: "g", dessous: "f" };
}

function differenceCarresLatex(exercice: ExerciceVolumeC): string {
  const { dessus, dessous } = nomsDessusDessous(exercice);
  return `[${dessus}(x)]^2-[${dessous}(x)]^2`;
}

export function consigneGeneraleC(): FragmentConsigne[] {
  return [
    texte("On fait tourner autour de l'axe des abscisses la région comprise entre la courbe de f et la droite g, entre leurs points d'intersection. Si "),
    latex("f(x)\\geq g(x)\\geq 0"),
    texte(" sur "),
    latex("[a;b]"),
    texte(", le volume du solide obtenu vaut "),
    latex("V=\\pi\\displaystyle\\int_a^b \\left([f(x)]^2-[g(x)]^2\\right)dx"),
    texte(" ; si c'est g qui est au-dessus, on échange f et g."),
  ];
}
export function blocDonneesC(exercice: ExerciceVolumeC): string[] {
  return [`f(x)=${sommeVolumeLatex(exercice.termesF)}`, `g(x)=${sommeVolumeLatex(exercice.termesG)}`];
}
export function consigneEcranC(phase: PhaseVolumesRevolution): FragmentConsigne[] {
  if (phase === "cEcran1") return [texte("Trouve les abscisses des points d'intersection des courbes de f et g : ce sont les bornes de l'intégrale.")];
  if (phase === "cEcran2") return [texte("Détermine laquelle des deux courbes est au-dessus de l'autre sur l'intervalle.")];
  if (phase === "cEcran3") return [texte("Développe et simplifie la différence des carrés, à partir de l'ordre confirmé à l'étape précédente.")];
  return [texte(`Calcule une primitive, évalue-la entre les bornes et multiplie par π, à partir de la forme développée confirmée. ${CONSIGNE_PRECISION}`)];
}
export function etatActuelC(exercice: ExerciceVolumeC, phase: PhaseVolumesRevolution): string[] | null {
  const bornes = `r_1=${exercice.r1}\\text{, }r_2=${exercice.r2}`;
  if (phase === "cEcran2") return [bornes];
  if (phase === "cEcran3") {
    const ordreLatex = exercice.ordre === "fSurG" ? "f(x)\\geq g(x)" : "g(x)\\geq f(x)";
    return [bornes, `\\text{Ordre confirmé : }${ordreLatex}`];
  }
  if (phase === "cEcran4") {
    const ordreLatex = exercice.ordre === "fSurG" ? "f(x)\\geq g(x)" : "g(x)\\geq f(x)";
    return [bornes, `\\text{Ordre confirmé : }${ordreLatex}`, `${differenceCarresLatex(exercice)}=${sommeVolumeLatex(exercice.developpe)}`];
  }
  return null;
}
export function champsC(exercice: ExerciceVolumeC, phase: PhaseVolumesRevolution): ChampDef[] {
  if (phase === "cEcran2") return [{ type: "choix", label: "Quelle courbe est au-dessus sur l'intervalle ?", options: OPTIONS_ORDRE }];
  if (phase === "cEcran3") {
    const { dessus, dessous } = nomsDessusDessous(exercice);
    return [{ type: "texte", label: `[${dessus}(x)]² − [${dessous}(x)]² développé =`, placeholder: "ex : 25x^2 - 7x + 11" }];
  }
  if (phase === "cEcran4") return [{ type: "texte", label: "V =", placeholder: "ex : 9pi/7" }];
  return []; // cEcran1 : composant add-as-needed dédié.
}
export function niveauAideMaxC(phase: PhaseVolumesRevolution): number {
  return phase === "cEcran3" ? 2 : 0;
}
export function aideNiveau1C(phase: PhaseVolumesRevolution): AideAvecLatex {
  if (phase === "cEcran3") return { texte: "Le volume entre deux courbes utilise la différence des carrés, jamais le carré de la différence — ce ne sont pas les mêmes expressions :", latex: "[f(x)]^2-[g(x)]^2 \\;\\neq\\; \\left(f(x)-g(x)\\right)^2" };
  return AUCUNE_AIDE;
}
export function aideNiveau2C(exercice: ExerciceVolumeC, phase: PhaseVolumesRevolution): AideAvecLatex {
  if (phase !== "cEcran3") return AUCUNE_AIDE;
  const { sup, inf } = termesSupInf(exercice);
  const { dessus, dessous } = nomsDessusDessous(exercice);
  const supCarre = sommeVolumeLatex(carreTermes(sup));
  const infCarre = sommeVolumeLatex(carreTermes(inf));
  return { texte: "Les deux carrés, séparément — la différence n'est pas encore faite :", latex: `[${dessus}(x)]^2=${supCarre}\\text{, }[${dessous}(x)]^2=${infCarre}` };
}

// ============================================================================
// Famille D — Comparaison à un cylindre englobant.
// ============================================================================

/** Coefficient de f(x)=k√x — omis quand k=1 (jamais "1√x"), même convention que tous les autres
 * coefficients de magnitude 1 de ce fichier (`termeVolumeLatex`/`primitiveTermeVolumeLatex`). */
function kLatexD(exercice: ExerciceVolumeD): string {
  const magnitude = magnitudeFractionLatex(exercice.kNum, exercice.kDen);
  return magnitude === "1" ? "" : magnitude;
}

export function consigneGeneraleD(): FragmentConsigne[] {
  return [
    texte("On fait tourner autour de l'axe des abscisses la région comprise entre la courbe de "),
    latex("f(x)=k\\sqrt{x}"),
    texte(" et l'axe des abscisses"),
    texte(" sur "),
    latex("[0;L]"),
    texte(" (un paraboloïde). On compare son volume à celui du cylindre englobant, de rayon "),
    latex("f(L)"),
    texte(" et de hauteur L."),
  ];
}
export function blocDonneesD(exercice: ExerciceVolumeD): string[] {
  return [`f(x)=${kLatexD(exercice)}\\sqrt{x}`, `\\text{Intervalle : }[0\\text{ ; }${exercice.L}]`];
}
export function consigneEcranD(phase: PhaseVolumesRevolution): FragmentConsigne[] {
  if (phase === "dEcran1") return [texte(`Calcule le volume du paraboloïde (méthode des disques). ${CONSIGNE_PRECISION}`)];
  if (phase === "dEcran2") return [texte("Calcule le volume du cylindre englobant, de rayon "), latex("f(L)"), texte(" et de hauteur L.")];
  return [texte("Calcule le rapport du volume du paraboloïde au volume du cylindre, à partir des volumes confirmés aux étapes précédentes.")];
}
export function etatActuelD(exercice: ExerciceVolumeD, phase: PhaseVolumesRevolution): string[] | null {
  if (phase === "dEcran2") return [`V_{\\text{paraboloïde}}${nombreLatex(exercice.volumeParaboloide)}`];
  if (phase === "dEcran3") return [`V_{\\text{paraboloïde}}${nombreLatex(exercice.volumeParaboloide)}`, `V_{\\text{cylindre}}${nombreLatex(exercice.volumeCylindre)}`];
  return null;
}
export function champsD(phase: PhaseVolumesRevolution): ChampDef[] {
  if (phase === "dEcran1") return [{ type: "texte", label: "V(paraboloïde) =", placeholder: "ex : 9pi/7" }];
  if (phase === "dEcran2") return [{ type: "texte", label: "V(cylindre) =", placeholder: "ex : 9pi/7" }];
  return [{ type: "texte", label: "V(paraboloïde) / V(cylindre) =", placeholder: "ex : 3/5" }];
}
export function niveauAideMaxD(phase: PhaseVolumesRevolution): number {
  if (phase === "dEcran1") return 1;
  return phase === "dEcran3" ? 2 : 0;
}
export function aideNiveau1D(phase: PhaseVolumesRevolution): AideAvecLatex {
  if (phase === "dEcran1") return { texte: "Méthode des disques, avec [f(x)]² = k²x :", latex: "V=\\pi\\displaystyle\\int_0^L k^2x\\,dx" };
  if (phase === "dEcran3") return { texte: "Divise le volume du paraboloïde par celui du cylindre : π, k et L se simplifient.", latex: null };
  return AUCUNE_AIDE;
}
export function aideNiveau2D(exercice: ExerciceVolumeD, phase: PhaseVolumesRevolution): AideAvecLatex {
  if (phase === "dEcran3") return { texte: "Les deux volumes trouvés aux étapes précédentes (la division n'est pas encore faite) :", latex: `V_{\\text{paraboloïde}}${nombreLatex(exercice.volumeParaboloide)}\\text{, }V_{\\text{cylindre}}${nombreLatex(exercice.volumeCylindre)}` };
  return AUCUNE_AIDE;
}

// ============================================================================
// Dispatch commun.
// ============================================================================

export function consigneGenerale(exercice: ExerciceVolumesRevolution): FragmentConsigne[] {
  switch (exercice.famille) {
    case "A":
      return consigneGeneraleA();
    case "B":
      return consigneGeneraleB();
    case "C":
      return consigneGeneraleC();
    case "D":
      return consigneGeneraleD();
  }
}

export function blocDonnees(exercice: ExerciceVolumesRevolution): string[] {
  switch (exercice.famille) {
    case "A":
      return blocDonneesA(exercice);
    case "B":
      return blocDonneesB(exercice);
    case "C":
      return blocDonneesC(exercice);
    case "D":
      return blocDonneesD(exercice);
  }
}

export function consigneEcran(exercice: ExerciceVolumesRevolution, phase: PhaseVolumesRevolution): FragmentConsigne[] {
  switch (exercice.famille) {
    case "A":
      return consigneEcranA(phase);
    case "B":
      return consigneEcranB(phase);
    case "C":
      return consigneEcranC(phase);
    case "D":
      return consigneEcranD(phase);
  }
}

export function etatActuel(exercice: ExerciceVolumesRevolution, phase: PhaseVolumesRevolution): string[] | null {
  switch (exercice.famille) {
    case "A":
      return etatActuelA(exercice, phase);
    case "B":
      return etatActuelB(exercice, phase);
    case "C":
      return etatActuelC(exercice, phase);
    case "D":
      return etatActuelD(exercice, phase);
  }
}

export function champsEcran(exercice: ExerciceVolumesRevolution, phase: PhaseVolumesRevolution): ChampDef[] {
  switch (exercice.famille) {
    case "A":
      return champsA(phase);
    case "B":
      return champsB(phase);
    case "C":
      return champsC(exercice, phase);
    case "D":
      return champsD(phase);
  }
}

export function niveauAideMaxEcran(exercice: ExerciceVolumesRevolution, phase: PhaseVolumesRevolution): number {
  switch (exercice.famille) {
    case "A":
      return niveauAideMaxA(phase);
    case "B":
      return niveauAideMaxB(phase);
    case "C":
      return niveauAideMaxC(phase);
    case "D":
      return niveauAideMaxD(phase);
  }
}

export function aideNiveau1(exercice: ExerciceVolumesRevolution, phase: PhaseVolumesRevolution): AideAvecLatex {
  switch (exercice.famille) {
    case "A":
      return aideNiveau1A(phase);
    case "B":
      return aideNiveau1B(phase);
    case "C":
      return aideNiveau1C(phase);
    case "D":
      return aideNiveau1D(phase);
  }
}

export function aideNiveau2(exercice: ExerciceVolumesRevolution, phase: PhaseVolumesRevolution): AideAvecLatex {
  switch (exercice.famille) {
    case "A":
      return aideNiveau2A(exercice, phase);
    case "B":
      return aideNiveau2B(exercice, phase);
    case "C":
      return aideNiveau2C(exercice, phase);
    case "D":
      return aideNiveau2D(exercice, phase);
  }
}

export const LIBELLE_PHASE: Record<PhaseVolumesRevolution, string> = {
  aEcran1: "Étape 1 (développer [f(x)]²)",
  aEcran2: "Étape 2 (primitive)",
  aEcran3: "Étape 3 (volume V)",
  bEcran1: "Étape 1 (racines)",
  bEcran2: "Étape 2 (développer [f(x)]²)",
  bEcran3: "Étape 3 (primitive)",
  bEcran4: "Étape 4 (volume V)",
  cEcran1: "Étape 1 (intersections)",
  cEcran2: "Étape 2 (ordre)",
  cEcran3: "Étape 3 (différence des carrés)",
  cEcran4: "Étape 4 (volume V)",
  dEcran1: "Étape 1 (volume paraboloïde)",
  dEcran2: "Étape 2 (volume cylindre)",
  dEcran3: "Étape 3 (rapport)",
};

export const LIBELLE_FAMILLE: Record<ExerciceVolumesRevolution["famille"], string> = {
  A: "A — Volume par rotation, bornes données",
  B: "B — Volume par rotation, bornes à trouver",
  C: "C — Volume entre une courbe et une droite",
  D: "D — Comparaison à un cylindre englobant",
};

function volumeEntreBornes(a: number, b: number, primitiveDeveloppeReference: (x: number) => number): number {
  return Math.PI * (primitiveDeveloppeReference(b) - primitiveDeveloppeReference(a));
}

/** Récapitulatif final : affiche toujours la réponse CORRECTE connue de l'exercice — jamais
 * recalculée depuis la saisie élève. */
export function formatReponseAttenduePhaseLatex(exercice: ExerciceVolumesRevolution, phase: PhaseVolumesRevolution): string[] {
  if (exercice.famille === "A") {
    if (phase === "aEcran1") return [sommeVolumeLatex(exercice.developpe)];
    if (phase === "aEcran2") return [`\\text{Primitive}=${sommePrimitiveVolumeLatex(exercice.developpe)}`];
    const v = volumeEntreBornes(exercice.a, exercice.b, exercice.primitiveDeveloppeReference);
    return [`V${nombreLatex(v, volumeExactALatex(exercice))}`];
  }
  if (exercice.famille === "B") {
    if (phase === "bEcran1") return [`r_1=${exercice.r1}\\text{, }r_2=${exercice.r2}`];
    if (phase === "bEcran2") return [sommeVolumeLatex(exercice.developpe)];
    if (phase === "bEcran3") return [`\\text{Primitive}=${sommePrimitiveVolumeLatex(exercice.developpe)}`];
    const v = volumeEntreBornes(exercice.r1, exercice.r2, exercice.primitiveDeveloppeReference);
    return [`V${nombreLatex(v)}`];
  }
  if (exercice.famille === "C") {
    if (phase === "cEcran1") return [`r_1=${exercice.r1}\\text{, }r_2=${exercice.r2}`];
    if (phase === "cEcran2") return [exercice.ordre === "fSurG" ? "f(x)\\geq g(x)" : "g(x)\\geq f(x)"];
    if (phase === "cEcran3") return [sommeVolumeLatex(exercice.developpe)];
    const v = volumeEntreBornes(exercice.r1, exercice.r2, exercice.primitiveDeveloppeReference);
    return [`V${nombreLatex(v)}`];
  }
  // Famille D.
  if (phase === "dEcran1") return [`V_{\\text{paraboloïde}}${nombreLatex(exercice.volumeParaboloide)}`];
  if (phase === "dEcran2") return [`V_{\\text{cylindre}}${nombreLatex(exercice.volumeCylindre)}`];
  return ["\\dfrac{V_{\\text{paraboloïde}}}{V_{\\text{cylindre}}}=\\dfrac{1}{2}"];
}

