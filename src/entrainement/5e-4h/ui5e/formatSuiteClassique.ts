/**
 * Couche présentation (5e) — énoncés, consignes, libellés, options de QCM, aides et réponses
 * attendues pour 5gen17 ("Problèmes classiques sur les suites"). 7 scénarios disjoints, 26 phases.
 *
 * Trois formats de texte, chacun à sa place :
 * - TEXTE BRUT (Unicode : u₁, ×, −, ², virgule décimale) : `consigneGenerale`, `consignePhase`,
 *   `LIBELLE_PHASE_SUITE_CLASSIQUE` — repris tels quels par la feuille d'évaluation
 *   (`generateurs5e/suitesClassiques/exportEvaluation.ts`, `texte(...)`) ;
 * - MINI-SYNTAXE « texte avec $formule$ » : libellés d'options de QCM et aides de niveau 1 — rendus
 *   par `components5e/TexteMathsClassique.tsx` (prose en texte normal qui passe à la ligne,
 *   formules en KaTeX inline). Avant (audit 5e ch. 3, point 7), la prose était rendue EN MODE MATHS :
 *   lettres collées (« Ellerestetoujourségaleà2 »), aides tronquées sur téléphone ;
 * - LaTeX PUR (formules courtes) : bloc de données, libellés des champs, aides de niveau 2 (forme
 *   SUBSTITUÉE, jamais résolue — point 28), réponses attendues (récapitulatif, fiches, corrigé).
 *
 * Toutes les valeurs affichées viennent de l'objet `exercice` (dérivées par les constructeurs de
 * `generateurs5e/suitesClassiques/`), jamais recalculées autrement.
 */
import type {
  ExerciceCarresEmboites,
  ExerciceEchiquier,
  ExerciceFibonacci,
  ExercicePapyrusRhind,
  ExerciceSuiteClassique,
  ExerciceSuitesCombinees,
  ExerciceTrianglesZigzag,
  ExerciceVitesse,
} from "../core5e/suitesClassiques.types";
import type { PhaseSuiteClassique } from "../moteur5e/typesSuiteClassique";
import { formatValeurLatex } from "./formatDomaineDefinition";

export interface OptionQCM {
  id: string;
  /** Mini-syntaxe « texte avec $formule$ » (voir l'en-tête du fichier). */
  label: string;
}

// ============================================================================
// Nombres
// ============================================================================

function arrondir(valeur: number, decimales: number): number {
  const p = 10 ** decimales;
  return Math.round(valeur * p) / p;
}

/** Décimal en LaTeX : virgule décimale (`{,}`), zéros finaux retirés. */
export function decimalLatex(valeur: number, decimales = 2): string {
  const v = arrondir(valeur, decimales);
  return (Object.is(v, -0) ? 0 : v).toString().replace(".", "{,}");
}

/** Décimal en texte brut : virgule décimale et vrai signe moins. */
export function decimalTexte(valeur: number, decimales = 2): string {
  return decimalLatex(valeur, decimales).replace("{,}", ",").replace("-", "−");
}

/** Entier relatif en texte brut (signe moins typographique). */
function entierTexte(valeur: number): string {
  return String(valeur).replace("-", "−");
}

/** Entier relatif en LaTeX, entre parenthèses s'il est négatif (substitution dans une formule). */
function facteurLatex(valeur: string | number): string {
  const s = String(valeur);
  return s.startsWith("-") ? `(${s})` : s;
}

/** Grand entier (`bigint`) en LaTeX, chiffres groupés par 3. */
function grandEntierLatex(n: bigint): string {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "\\,");
}

/** Écriture scientifique a × 10ⁿ (3 chiffres significatifs). */
function scientifiqueLatex(valeur: number): string {
  const exposant = Math.floor(Math.log10(Math.abs(valeur)));
  const mantisse = valeur / 10 ** exposant;
  return `${decimalLatex(mantisse, 2)}\\times10^{${exposant}}`;
}

/** Nombre rationnel « propre » (fraction à petit dénominateur) en LaTeX, avec sa valeur approchée
 * quand ce n'est pas un entier. */
function exactEtApproche(valeur: number): string {
  if (Number.isInteger(arrondir(valeur, 9))) return String(Math.round(valeur));
  const exact = formatValeurLatex(valeur);
  const approche = decimalLatex(valeur, 2);
  return exact.includes("dfrac") ? `${exact}\\approx${approche}` : approche;
}

/** coef·√3 en LaTeX (coef rationnel), suivi de sa valeur approchée. */
function racine3EtApproche(valeur: number): string {
  const coef = valeur / Math.sqrt(3);
  const coefLatex = formatValeurLatex(coef);
  const exact = coefLatex === "1" ? "\\sqrt3" : `${coefLatex}\\sqrt3`;
  return `${exact}\\approx${decimalLatex(valeur, 2)}`;
}

/** Chiffres en indice Unicode (texte brut : « u₁₁ »). */
function indice(n: number): string {
  return String(n)
    .split("")
    .map((c) => "₀₁₂₃₄₅₆₇₈₉"[Number(c)])
    .join("");
}

function ordinal(n: number): string {
  return n === 1 ? "1re" : `${n}ᵉ`;
}

// ============================================================================
// Accès typés
// ============================================================================

function asEchiquier(e: ExerciceSuiteClassique): ExerciceEchiquier {
  if (e.scenario !== "echiquier") throw new Error("asEchiquier : scénario attendu 'echiquier'");
  return e;
}
function asPapyrus(e: ExerciceSuiteClassique): ExercicePapyrusRhind {
  if (e.scenario !== "papyrusRhind") throw new Error("asPapyrus : scénario attendu 'papyrusRhind'");
  return e;
}
function asCombinees(e: ExerciceSuiteClassique): ExerciceSuitesCombinees {
  if (e.scenario !== "suitesCombinees") throw new Error("asCombinees : scénario attendu 'suitesCombinees'");
  return e;
}
function asVitesse(e: ExerciceSuiteClassique): ExerciceVitesse {
  if (e.scenario !== "vitesse") throw new Error("asVitesse : scénario attendu 'vitesse'");
  return e;
}
function asFibonacci(e: ExerciceSuiteClassique): ExerciceFibonacci {
  if (e.scenario !== "fibonacci") throw new Error("asFibonacci : scénario attendu 'fibonacci'");
  return e;
}
function asZigzag(e: ExerciceSuiteClassique): ExerciceTrianglesZigzag {
  if (e.scenario !== "trianglesZigzag") throw new Error("asZigzag : scénario attendu 'trianglesZigzag'");
  return e;
}
function asCarres(e: ExerciceSuiteClassique): ExerciceCarresEmboites {
  if (e.scenario !== "carresEmboites") throw new Error("asCarres : scénario attendu 'carresEmboites'");
  return e;
}

// ============================================================================
// Énoncé (texte brut, autosuffisant — audit 5e ch. 3, point 25)
// ============================================================================

export function consigneGenerale(exercice: ExerciceSuiteClassique): string {
  switch (exercice.scenario) {
    case "echiquier":
      return (
        "La légende de l'échiquier : on pose 1 grain de blé sur la 1re case, puis on double le nombre de grains à chaque case suivante, jusqu'à la 64ᵉ. " +
        `Un grain de blé pèse ${decimalTexte(exercice.poidsGrainGrammes)} g, et la production mondiale annuelle de blé est d'environ 800 millions de tonnes. ` +
        "On note uₙ le nombre de grains sur la n-ième case."
      );
    case "papyrusRhind": {
      const regle =
        exercice.facteur === 7
          ? "la somme des 3 plus grandes parts soit égale à 7 fois la somme des 2 plus petites (règle du papyrus : le septième des trois plus grandes parts vaut les deux plus petites)"
          : `la somme des 3 plus grandes parts soit égale à ${exercice.facteur} fois la somme des 2 plus petites`;
      return (
        `Problème du papyrus de Rhind (Égypte, vers 1650 av. J.-C.) : partager ${exercice.sommeTotale} pains entre 5 personnes de sorte que les parts forment une suite arithmétique ` +
        `(a, a + Δ, a + 2Δ, a + 3Δ, a + 4Δ, de la plus petite à la plus grande) et que ${regle}.`
      );
    }
    case "suitesCombinees":
      return (
        `Trois nombres y, x, z sont tels que : y, x, z est une suite géométrique (x est la moyenne géométrique de y et z, donc x² = yz) ; ` +
        `${entierTexte(exercice.premierTerme)}, y, z est une suite arithmétique ; et le produit x · y · z vaut ${entierTexte(exercice.produitXYZ)}.`
      );
    case "vitesse":
      return (
        `À toute allure : une voiture démarre. Pendant la 1re seconde, elle parcourt ${decimalTexte(exercice.u1)} m ; pendant chaque seconde suivante, elle parcourt ` +
        `${decimalTexte(exercice.r)} m de plus que pendant la précédente. On note uₙ la distance parcourue pendant la n-ième seconde.`
      );
    case "fibonacci": {
      const [t1, t2] = exercice.dixPremiersTermes;
      return exercice.historique
        ? "La suite de Fibonacci : u₁ = u₂ = 1, puis chaque terme est la somme des deux précédents. On s'intéresse au rapport vₖ = uₖ₊₁ / uₖ de deux termes consécutifs."
        : `Une suite de type Fibonacci : u₁ = ${t1}, u₂ = ${t2}, puis, comme pour la suite de Fibonacci, chaque terme est la somme des deux précédents. On s'intéresse au rapport vₖ = uₖ₊₁ / uₖ de deux termes consécutifs.`;
    }
    case "trianglesZigzag":
      return (
        `ABC est un triangle équilatéral de côté ${exercice.cote} cm. Depuis B, on trace la perpendiculaire à [CA] : elle coupe [CA] en H₁. ` +
        "Depuis H₁, on trace la perpendiculaire à [CB] : elle coupe [CB] en H₂. Depuis H₂, la perpendiculaire à [CA] donne H₃, et ainsi de suite. " +
        "Le chemin B → H₁ → H₂ → H₃ → … est un zigzag qui se rapproche de C. On note ℓₖ la longueur du k-ième segment (ℓ₁ = BH₁) et Tₖ le triangle rectangle C Hₖ₋₁ Hₖ (avec H₀ = B)."
      );
    case "carresEmboites":
      return (
        `Partie a — Un carré d'aire 1 est partagé en ${exercice.partsA} petits carrés égaux ; on en colorie ${exercice.coloreesA}. ` +
        `Dans un petit carré non colorié, on recommence : on le partage en ${exercice.partsA} et on en colorie ${exercice.coloreesA}, et ainsi de suite à l'infini. ` +
        `Partie b — En joignant les milieux des côtés d'un carré de côté ${exercice.coteB} cm, on obtient un nouveau carré ; on recommence dans ce nouveau carré, et ainsi de suite.`
      );
  }
}

/** Bloc de données (LaTeX, un fragment par donnée). */
export function formatTermesDonneesLatex(exercice: ExerciceSuiteClassique, phase: PhaseSuiteClassique): string[] {
  switch (exercice.scenario) {
    case "echiquier":
      return [`u_1=${exercice.u1}`, `q=${exercice.q}`, `1\\text{ grain}=${decimalLatex(exercice.poidsGrainGrammes)}\\text{ g}`, "\\text{production}\\approx8\\times10^8\\text{ t}"];
    case "papyrusRhind":
      return [`\\text{5 parts, somme}=${exercice.sommeTotale}`, "u_n=a+(n-1)\\Delta", `u_3+u_4+u_5=${exercice.facteur}\\,(u_1+u_2)`];
    case "suitesCombinees":
      return [`x\\cdot y\\cdot z=${exercice.produitXYZ}`, "x^2=yz", `${exercice.premierTerme},\\ y,\\ z\\ \\text{arithmétique}`];
    case "vitesse":
      return [`u_1=${decimalLatex(exercice.u1)}\\text{ m}`, `r=${decimalLatex(exercice.r)}\\text{ m}`];
    case "fibonacci":
      return [`u_1=${exercice.dixPremiersTermes[0]}`, `u_2=${exercice.dixPremiersTermes[1]}`, "u_n=u_{n-2}+u_{n-1}"];
    case "trianglesZigzag":
      return [`AB=BC=CA=${exercice.cote}\\text{ cm}`, "\\widehat{C}=60^\\circ"];
    case "carresEmboites":
      return phase === "airesB" || phase === "sommeInfinieB"
        ? [`\\text{côté}=${exercice.coteB}\\text{ cm}`]
        : [`\\text{${exercice.partsA} parts, ${exercice.coloreesA} coloriée${exercice.coloreesA > 1 ? "s" : ""}}`];
  }
}

// ============================================================================
// Écrans
// ============================================================================

/** Libellés courts des écrans (récapitulatif, fiches des puces) — génériques, valables pour tous
 * les tirages. */
export const LIBELLE_PHASE_SUITE_CLASSIQUE: Record<PhaseSuiteClassique, string> = {
  u64: "Les grains de la case demandée",
  sommeTotaleEchiquier: "Le nombre total de grains",
  poidsComparaison: "Poids total et comparaison",
  poserSysteme: "Poser le système",
  resoudreSysteme: "Résoudre le système",
  suiteFinalePapyrus: "Les 5 parts",
  poserEquationCombinees: "Poser l'équation",
  resoudreRCombinees: "La raison r",
  suitesFinalesCombinees: "Les suites finales",
  distance11: "Distance pendant la dernière seconde",
  sommeTotale11: "Distance totale",
  troisMethodes: "Vitesses moyennes",
  dixTermes: "Les 10 premiers termes",
  formuleRecurrence: "La formule de récurrence",
  calculV5: "Un rapport de termes consécutifs",
  resoudrePhi: "Le nombre d'or φ",
  proprieteInverse: "Une propriété de φ",
  hauteursZigzag: "Les segments du zigzag",
  longueurZigzag: "La longueur totale du zigzag",
  airesZigzag: "Les aires des triangles emboîtés",
  airesZigzagAC: "Les petits triangles du zigzag",
  sommePartielleA: "Fraction coloriée après 5 étapes",
  limitePuissanceA: "La limite de (1/p)ⁿ",
  sommeInfinieA: "La fraction coloriée totale",
  airesB: "Les aires des carrés emboîtés",
  sommeInfinieB: "La somme infinie des aires",
};

/** Consigne de chaque écran (texte brut). Chaque consigne annonce la précision attendue. */
export function consignePhase(exercice: ExerciceSuiteClassique, phase: PhaseSuiteClassique): string {
  switch (phase) {
    case "u64": {
      const k = asEchiquier(exercice).caseDemandee;
      return `Combien de grains de blé y a-t-il sur la ${ordinal(k)} case ? (Une puissance comme 2^10 est acceptée.)`;
    }
    case "sommeTotaleEchiquier":
      return "Combien de grains de blé y a-t-il au total sur les 64 cases ?";
    case "poidsComparaison":
      return "Quel est le poids total de ces grains, en tonnes ? Combien de fois environ dépasse-t-il la production mondiale annuelle de blé ? (À 2 % près.)";
    case "poserSysteme":
      return "Quel système d'équations traduit cette situation (a : la plus petite part, Δ : la raison) ?";
    case "resoudreSysteme":
      return "Résous ce système : donne a et Δ (valeurs exactes ou arrondies au centième).";
    case "suiteFinalePapyrus":
      return "Donne les 5 parts, de la plus petite à la plus grande (valeurs exactes ou arrondies au centième).";
    case "poserEquationCombinees":
      return "Quelle équation permet de trouver x directement ?";
    case "resoudreRCombinees": {
      const m = entierTexte(asCombinees(exercice).premierTerme);
      return `Avec la valeur de x trouvée, écris y = ${m} + r et z = ${m} + 2r, puis utilise x² = yz pour trouver la raison r de la suite arithmétique (rejette r = 0, qui donnerait une suite constante).`;
    }
    case "suitesFinalesCombinees": {
      const m = entierTexte(asCombinees(exercice).premierTerme);
      return `Donne les deux suites : la suite arithmétique ${m}, y, z, puis la suite géométrique y, x, z.`;
    }
    case "distance11":
      return `Quelle distance la voiture parcourt-elle pendant la ${ordinal(asVitesse(exercice).n)} seconde ?`;
    case "sommeTotale11":
      return `Quelle distance totale parcourt-elle pendant les ${asVitesse(exercice).n} premières secondes ?`;
    case "troisMethodes": {
      const n = asVitesse(exercice).n;
      return `Calcule, en km/h et arrondies à l'unité, sa vitesse moyenne sur les ${n} premières secondes, puis sa vitesse moyenne pendant la ${ordinal(n)} seconde (1 m/s = 3,6 km/h).`;
    }
    case "dixTermes":
      return "Donne les 10 premiers termes de la suite.";
    case "formuleRecurrence":
      return "Quelle formule de récurrence définit cette suite (pour n ≥ 3) ?";
    case "calculV5": {
      const k = asFibonacci(exercice).rangRapport;
      return `Calcule v${indice(k)} = u${indice(k + 1)} / u${indice(k)} (valeur exacte ou arrondie au centième).`;
    }
    case "resoudrePhi":
      return "Quand k augmente, vₖ se rapproche d'un nombre φ (le nombre d'or), solution positive de l'équation x² = x + 1. Résous cette équation et donne φ arrondi au centième.";
    case "proprieteInverse":
      return "Que vaut 1/φ ?";
    case "hauteursZigzag":
      return "Donne les longueurs ℓ₁, ℓ₂, ℓ₃, ℓ₄ des quatre premiers segments du zigzag, en cm (valeurs exactes ou arrondies au centième).";
    case "longueurZigzag":
      return "Le zigzag a une infinité de segments. Vers quelle longueur totale tend-il quand le nombre de segments augmente indéfiniment ? (Valeur exacte ou arrondie au centième.)";
    case "airesZigzag":
      return "Les triangles T₁, T₂, T₃ sont emboîtés (chacun contient le suivant). Donne leurs aires A₁, A₂, A₃, en cm² (valeurs exactes ou arrondies au centième).";
    case "airesZigzagAC":
      return "Le zigzag découpe T₁ en petits triangles U₁ = BH₁H₂, U₂ = H₁H₂H₃, U₃ = H₂H₃H₄… (Uₖ est le triangle Tₖ privé de Tₖ₊₁). Calcule la somme infinie de leurs aires, en cm² (valeur exacte ou arrondie au centième).";
    case "sommePartielleA":
      return "On note uₖ la fraction du grand carré coloriée à l'étape k. Calcule S₅, la fraction coloriée après 5 étapes (valeur exacte ou arrondie au millième).";
    case "limitePuissanceA":
      return `Vers quelle valeur (1/${asCarres(exercice).partsA})ⁿ tend-il quand n tend vers l'infini ?`;
    case "sommeInfinieA":
      return "Quelle fraction du grand carré est coloriée quand on répète la construction à l'infini ? (Valeur exacte ou arrondie au millième.)";
    case "airesB":
      return "Partie b — Donne les aires des trois premiers carrés, en cm².";
    case "sommeInfinieB":
      return "Calcule la somme infinie des aires de tous les carrés, en cm².";
  }
}

/** Libellé LaTeX du champ unique d'un écran « champ simple ». */
export function labelPhase(exercice: ExerciceSuiteClassique, phase: PhaseSuiteClassique): string {
  switch (phase) {
    case "u64":
      return `u_{${asEchiquier(exercice).caseDemandee}}=`;
    case "sommeTotaleEchiquier":
      return "S_{64}=";
    case "resoudreRCombinees":
      return "r=";
    case "distance11":
      return `u_{${asVitesse(exercice).n}}=`;
    case "sommeTotale11":
      return `S_{${asVitesse(exercice).n}}=`;
    case "calculV5":
      return `v_{${asFibonacci(exercice).rangRapport}}=`;
    case "resoudrePhi":
      return "\\varphi=";
    case "longueurZigzag":
      return "L_\\infty=";
    case "airesZigzagAC":
      return "S_\\infty=";
    case "sommePartielleA":
      return "S_5=";
    case "sommeInfinieA":
    case "sommeInfinieB":
      return "S_\\infty=";
    default:
      return "=";
  }
}

/** Libellés des écrans « liste de champs » (`enLatex` : rendus en KaTeX, sinon texte brut). */
export function labelsListe(phase: PhaseSuiteClassique, exercice?: ExerciceSuiteClassique): { labels: string[]; enLatex: boolean } {
  switch (phase) {
    case "poidsComparaison":
      return { labels: ["Poids (t) =", "Nombre de fois ≈"], enLatex: false };
    case "resoudreSysteme":
      return { labels: ["a=", "\\Delta="], enLatex: true };
    case "suiteFinalePapyrus":
      return { labels: ["u_1=", "u_2=", "u_3=", "u_4=", "u_5="], enLatex: true };
    case "troisMethodes": {
      const n = exercice && exercice.scenario === "vitesse" ? exercice.n : 0;
      return { labels: [`Sur ${n} s (km/h) =`, `${ordinal(n)} seconde (km/h) =`], enLatex: false };
    }
    case "dixTermes":
      return { labels: Array.from({ length: 10 }, (_, i) => `u_{${i + 1}}=`), enLatex: true };
    case "hauteursZigzag":
      return { labels: ["\\ell_1=", "\\ell_2=", "\\ell_3=", "\\ell_4="], enLatex: true };
    case "airesZigzag":
      return { labels: ["A_1=", "A_2=", "A_3="], enLatex: true };
    case "airesB":
      return { labels: ["a_1=", "a_2=", "a_3="], enLatex: true };
    default:
      return { labels: [], enLatex: false };
  }
}

// ============================================================================
// QCM — ordre des options mélangé de façon STABLE pour une instance (une position fixe de la bonne
// réponse se retiendrait ; un mélange à chaque rendu ferait sauter les boutons).
// ============================================================================

/** Clé de l'instance (tous les nombres tirés) — sert de graine au mélange des options. */
function cleExercice(e: ExerciceSuiteClassique): string {
  switch (e.scenario) {
    case "echiquier":
      return `e${e.caseDemandee}-${e.poidsGrainGrammes}`;
    case "papyrusRhind":
      return `p${e.sommeTotale}-${e.facteur}`;
    case "suitesCombinees":
      return `c${e.x}`;
    case "vitesse":
      return `v${e.u1}-${e.r}-${e.n}`;
    case "fibonacci":
      return `f${e.dixPremiersTermes[0]}-${e.dixPremiersTermes[1]}-${e.rangRapport}`;
    case "trianglesZigzag":
      return `z${e.cote}`;
    case "carresEmboites":
      return `k${e.partsA}-${e.coloreesA}-${e.coteB}`;
  }
}

function hacher(texte: string): number {
  let h = 2166136261;
  for (let i = 0; i < texte.length; i++) {
    h ^= texte.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Mélange de Fisher-Yates piloté par un générateur mulberry32 (graine = hachage de l'instance). */
function melanger<T>(elements: T[], graine: number): T[] {
  const copie = [...elements];
  let a = graine >>> 0;
  const suivant = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  for (let i = copie.length - 1; i > 0; i--) {
    const j = Math.floor(suivant() * (i + 1));
    [copie[i], copie[j]] = [copie[j], copie[i]];
  }
  return copie;
}

function optionsNonMelangees(exercice: ExerciceSuiteClassique, phase: PhaseSuiteClassique): OptionQCM[] {
  switch (phase) {
    case "poserSysteme": {
      const { sommeTotale: s, facteur: k } = asPapyrus(exercice);
      return [
        { id: "correct", label: `$5a+10\\Delta=${s}$ et $${k}(2a+\\Delta)=3a+9\\Delta$` },
        { id: "relationInversee", label: `$5a+10\\Delta=${s}$ et $2a+\\Delta=${k}(3a+9\\Delta)$` },
        { id: "sommeMalEcrite", label: `$a+4\\Delta=${s}$ et $${k}(2a+\\Delta)=3a+9\\Delta$` },
        { id: "sommeSeule", label: `$5a+10\\Delta=${s}$ seule` },
      ];
    }
    case "poserEquationCombinees": {
      const p = asCombinees(exercice).produitXYZ;
      return [
        { id: "correct", label: `$x^3=${p}$` },
        { id: "yzSeul", label: `$yz=${p}$` },
        { id: "sommeXYZ", label: `$x+y+z=${p}$` },
        { id: "carreSeul", label: `$x^2=${p}$` },
      ];
    }
    case "formuleRecurrence":
      return [
        { id: "correct", label: "$u_n=u_{n-2}+u_{n-1}$" },
        { id: "sommeTousLesTermes", label: "$u_n=u_1+u_2+\\dots+u_{n-1}$" },
        { id: "differenceConstante", label: "$u_n=u_{n-1}+r$, avec $r$ constant" },
        { id: "produitConstant", label: "$u_n=2\\,u_{n-1}$" },
      ];
    case "proprieteInverse":
      return [
        { id: "phiMoinsUn", label: "$\\varphi-1$" },
        { id: "phiPlusUn", label: "$\\varphi+1$" },
        { id: "unMoinsPhi", label: "$1-\\varphi$" },
        { id: "phiCarre", label: "$\\varphi^2$" },
      ];
    case "limitePuissanceA":
      return [
        { id: "zero", label: "$0$" },
        { id: "unQuart", label: `$\\dfrac{1}{${asCarres(exercice).partsA}}$` },
        { id: "un", label: "$1$" },
        { id: "infini", label: "$+\\infty$" },
      ];
    default:
      return [];
  }
}

export function optionsQCM(exercice: ExerciceSuiteClassique, phase: PhaseSuiteClassique): OptionQCM[] {
  const options = optionsNonMelangees(exercice, phase);
  return melanger(options, hacher(`${cleExercice(exercice)}|${phase}`));
}

/** Mini-syntaxe « texte avec $formule$ » → LaTeX pur (prose dans `\text{…}`), pour les contextes
 * qui n'acceptent qu'une formule (récapitulatif, corrigé papier). */
export function miniSyntaxeVersLatex(texte: string): string {
  return texte
    .split("$")
    .map((morceau, i) => (i % 2 === 1 ? morceau : morceau === "" ? "" : `\\text{${morceau}}`))
    .join("");
}

const ID_CORRECT_QCM: Partial<Record<PhaseSuiteClassique, string>> = {
  poserSysteme: "correct",
  poserEquationCombinees: "correct",
  formuleRecurrence: "correct",
  proprieteInverse: "phiMoinsUn",
  limitePuissanceA: "zero",
};

/** Réponse attendue d'un écran QCM, en LaTeX court (récapitulatif, corrigé) — `null` hors QCM. */
export function texteReponseAttendueQCM(exercice: ExerciceSuiteClassique, phase: PhaseSuiteClassique): string | null {
  const idCorrect = ID_CORRECT_QCM[phase];
  if (idCorrect === undefined) return null;
  switch (phase) {
    case "poserSysteme": {
      const { sommeTotale: s, facteur: k } = asPapyrus(exercice);
      return `5a+10\\Delta=${s}\\ \\text{et}\\ ${k}(2a+\\Delta)=3a+9\\Delta`;
    }
    case "proprieteInverse":
      return "\\dfrac{1}{\\varphi}=\\varphi-1";
    case "limitePuissanceA":
      return `\\left(\\dfrac{1}{${asCarres(exercice).partsA}}\\right)^n\\to0`;
    default: {
      const label = optionsNonMelangees(exercice, phase).find((o) => o.id === idCorrect)?.label;
      return label === undefined ? null : miniSyntaxeVersLatex(label);
    }
  }
}

// ============================================================================
// Aides — niveau 1 : méthode (mini-syntaxe) ; niveau 2 : formule SUBSTITUÉE avec les valeurs de
// l'exercice, jamais résolue (il reste toujours le calcul à faire). `niveauAideMaxSuiteClassique`
// (`moteur5e/sessionSuiteClassique.ts`) ne propose le niveau 2 que là où il existe.
// ============================================================================

export function texteAideNiveau1(exercice: ExerciceSuiteClassique, phase: PhaseSuiteClassique): string {
  switch (phase) {
    case "u64":
      return "La case $n$ contient $u_n=u_1\\times q^{\\,n-1}$ grains.";
    case "sommeTotaleEchiquier":
      return "Somme des $n$ premiers termes d'une suite géométrique : $S_n=u_1\\times\\dfrac{1-q^n}{1-q}$.";
    case "poidsComparaison":
      return "Multiplie le nombre total de grains par le poids d'un grain (en grammes), puis convertis : $1\\text{ t}=10^6\\text{ g}$. Divise enfin ce poids par la production mondiale.";
    case "poserSysteme":
      return "Écris la somme des 5 parts en fonction de $a$ et $\\Delta$. Puis traduis la règle : les 2 plus petites parts sont $u_1$ et $u_2$, les 3 plus grandes $u_3$, $u_4$ et $u_5$.";
    case "resoudreSysteme":
      return "Développe la seconde équation et regroupe les termes : tu obtiens une relation simple entre $a$ et $\\Delta$. Isole $a$ dans la première équation et substitue.";
    case "suiteFinalePapyrus":
      return "Chaque part s'obtient en ajoutant $\\Delta$ à la précédente, en partant de $a$.";
    case "poserEquationCombinees":
      return "Dans le produit $x\\cdot y\\cdot z$, remplace $yz$ par $x^2$.";
    case "resoudreRCombinees":
      return "Remplace $y$ et $z$ dans $x^2=yz$, développe, puis résous l'équation du second degré en $r$ (mise en évidence de $r$).";
    case "suitesFinalesCombinees":
      return "Utilise $x$ et $r$ déjà trouvés : $y$ et $z$ s'obtiennent en ajoutant $r$ puis $2r$ au premier terme.";
    case "distance11":
      return "Terme d'une suite arithmétique : $u_n=u_1+(n-1)\\,r$.";
    case "sommeTotale11":
      return "Somme des $n$ premiers termes d'une suite arithmétique : $S_n=\\dfrac{n}{2}\\big(2u_1+(n-1)\\,r\\big)$.";
    case "troisMethodes":
      return "Une vitesse moyenne est une distance divisée par une durée : $\\dfrac{S_n}{n}$ m/s sur les $n$ premières secondes, $u_n$ m/s pendant la dernière seconde (qui dure 1 s). Multiplie par $3{,}6$ pour passer en km/h.";
    case "dixTermes": {
      const [t1, t2] = asFibonacci(exercice).dixPremiersTermes;
      return `Pars de $u_1=${t1}$ et $u_2=${t2}$, puis ajoute à chaque fois les deux derniers termes obtenus.`;
    }
    case "formuleRecurrence":
      return "Observe comment chaque terme se construit à partir des deux termes qui le précèdent.";
    case "calculV5": {
      const k = asFibonacci(exercice).rangRapport;
      return `Lis $u_{${k}}$ et $u_{${k + 1}}$ parmi les termes déjà trouvés, puis calcule $v_{${k}}=\\dfrac{u_{${k + 1}}}{u_{${k}}}$.`;
    }
    case "resoudrePhi":
      return "Écris $x^2-x-1=0$, calcule $\\Delta=b^2-4ac$, puis garde la racine positive.";
    case "proprieteInverse":
      return "$\\varphi$ vérifie $\\varphi^2=\\varphi+1$ : divise les deux membres par $\\varphi$.";
    case "hauteursZigzag":
      return "$\\ell_1=BH_1$ est une hauteur du triangle équilatéral : $\\ell_1=\\dfrac{c\\sqrt3}{2}$. Dans chaque triangle rectangle $T_k$, l'angle en $C$ vaut $60^\\circ$ et $CH_k=CH_{k-1}\\times\\cos60^\\circ=\\dfrac{CH_{k-1}}{2}$ : chaque segment mesure la moitié du précédent.";
    case "longueurZigzag":
      return "Les longueurs forment une suite géométrique de raison $q=\\dfrac12$. Comme $|q|<1$, la somme infinie existe : $S_\\infty=\\dfrac{u_1}{1-q}$.";
    case "airesZigzag":
      return "$T_1=CBH_1$ est rectangle en $H_1$ : $A_1=\\dfrac{CH_1\\times BH_1}{2}$. D'un triangle au suivant, les longueurs sont divisées par 2, donc les aires par $2^2=4$.";
    case "airesZigzagAC":
      return "L'aire de $U_k$ vaut $A_k-A_{k+1}$ : la première est $A_1-A_2$, et d'un petit triangle au suivant l'aire est encore divisée par 4.";
    case "sommePartielleA": {
      const { partsA: p, coloreesA: c } = asCarres(exercice);
      return `À la 1re étape, on colorie $u_1=\\dfrac{${c}}{${p}}$ du grand carré ; à chaque étape, on colorie $\\dfrac{1}{${p}}$ de ce qu'on a colorié à l'étape précédente : $q=\\dfrac{1}{${p}}$. Puis $S_5=u_1\\times\\dfrac{1-q^5}{1-q}$.`;
    }
    case "limitePuissanceA": {
      const p = asCarres(exercice).partsA;
      return `Calcule $\\left(\\dfrac{1}{${p}}\\right)^2$, $\\left(\\dfrac{1}{${p}}\\right)^3$ et $\\left(\\dfrac{1}{${p}}\\right)^{10}$ : que remarques-tu ?`;
    }
    case "sommeInfinieA":
      return "Les fractions coloriées forment une suite géométrique de raison $q$ avec $|q|<1$ : $S_\\infty=\\dfrac{u_1}{1-q}$.";
    case "airesB":
      return "Les 4 triangles des coins, repliés vers l'intérieur, recouvrent exactement le nouveau carré : son aire est la moitié de celle du carré précédent.";
    case "sommeInfinieB":
      return "Les aires forment une suite géométrique de premier terme $u_1=a^2$ et de raison $q=\\dfrac12$ : $S_\\infty=\\dfrac{u_1}{1-q}$.";
  }
}

export function texteAideNiveau2(exercice: ExerciceSuiteClassique, phase: PhaseSuiteClassique): string {
  switch (phase) {
    case "poidsComparaison": {
      const e = asEchiquier(exercice);
      return `\\text{poids}=\\dfrac{(2^{64}-1)\\times${decimalLatex(e.poidsGrainGrammes)}}{10^6}\\text{ t}`;
    }
    case "resoudreSysteme": {
      const { sommeTotale: s, facteur: k } = asPapyrus(exercice);
      return `${2 * k - 3}a=${9 - k}\\Delta\\quad\\text{et}\\quad a=${s / 5}-2\\Delta`;
    }
    case "resoudreRCombinees": {
      const e = asCombinees(exercice);
      const m = e.premierTerme;
      return `(${m}+r)(${m}+2r)=${facteurLatex(e.x)}^2`;
    }
    case "distance11": {
      const e = asVitesse(exercice);
      return `u_{${e.n}}=${decimalLatex(e.u1)}+(${e.n}-1)\\times${decimalLatex(e.r)}`;
    }
    case "sommeTotale11": {
      const e = asVitesse(exercice);
      return `S_{${e.n}}=\\dfrac{${e.n}}{2}\\big(2\\times${decimalLatex(e.u1)}+(${e.n}-1)\\times${decimalLatex(e.r)}\\big)`;
    }
    case "troisMethodes": {
      const e = asVitesse(exercice);
      return `\\dfrac{S_{${e.n}}}{${e.n}}\\times3{,}6\\quad\\text{et}\\quad u_{${e.n}}\\times3{,}6`;
    }
    case "resoudrePhi":
      return "x=\\dfrac{1\\pm\\sqrt{(-1)^2-4\\times1\\times(-1)}}{2}";
    case "hauteursZigzag":
      return `\\ell_1=\\dfrac{${asZigzag(exercice).cote}\\sqrt3}{2},\\quad q=\\dfrac12`;
    case "longueurZigzag":
      return `L_\\infty=\\dfrac{\\ell_1}{1-\\frac12}\\ \\text{avec}\\ \\ell_1=\\dfrac{${asZigzag(exercice).cote}\\sqrt3}{2}`;
    case "airesZigzag": {
      const c = asZigzag(exercice).cote;
      return `A_1=\\dfrac{1}{2}\\times\\dfrac{${c}}{2}\\times\\dfrac{${c}\\sqrt3}{2},\\quad q=\\dfrac14`;
    }
    case "airesZigzagAC":
      return "S_\\infty=\\dfrac{A_1-A_2}{1-\\frac14}";
    case "sommePartielleA": {
      const { partsA: p, coloreesA: c } = asCarres(exercice);
      return `S_5=\\dfrac{${c}}{${p}}\\times\\dfrac{1-\\left(\\frac{1}{${p}}\\right)^5}{1-\\frac{1}{${p}}}`;
    }
    case "sommeInfinieA": {
      const { partsA: p, coloreesA: c } = asCarres(exercice);
      return `S_\\infty=\\dfrac{\\frac{${c}}{${p}}}{1-\\frac{1}{${p}}}`;
    }
    case "sommeInfinieB": {
      const a = asCarres(exercice).coteB;
      return `S_\\infty=\\dfrac{${a}^2}{1-\\frac12}`;
    }
    default:
      return "";
  }
}

// ============================================================================
// Réponses attendues (récapitulatif « Ce qu'on sait déjà », fiches des puces, réponse révélée,
// corrigé papier) — un fragment LaTeX par valeur, valeur exacte puis approchée quand elle n'est
// pas entière.
// ============================================================================

/** LaTeX de la réponse correcte d'un écran à champ(s) — `null` pour les QCM (voir
 * `texteReponseAttendueQCM`) et pour `suitesFinalesCombinees` (voir `formatTermesSuitesFinalesLatex`). */
export function formatTermesReponseAttendueLatex(exercice: ExerciceSuiteClassique, phase: PhaseSuiteClassique): string[] | null {
  switch (phase) {
    case "u64": {
      const e = asEchiquier(exercice);
      return [`u_{${e.caseDemandee}}=2^{${e.caseDemandee - 1}}=${grandEntierLatex(e.uCase)}`];
    }
    case "sommeTotaleEchiquier":
      return [`S_{64}=2^{64}-1=${grandEntierLatex(asEchiquier(exercice).sommeTotale)}`];
    case "poidsComparaison": {
      const e = asEchiquier(exercice);
      return [`\\text{poids}\\approx${scientifiqueLatex(e.poidsTotalTonnes)}\\text{ t}`, `\\text{soit environ }${Math.round(e.facteurComparaison)}\\text{ fois la production}`];
    }
    case "resoudreSysteme": {
      const e = asPapyrus(exercice);
      return [`a=${exactEtApproche(e.a)}`, `\\Delta=${exactEtApproche(e.delta)}`];
    }
    case "suiteFinalePapyrus":
      return asPapyrus(exercice).termes.map((t, i) => `u_${i + 1}=${exactEtApproche(t)}`);
    case "resoudreRCombinees":
      return [`r=${asCombinees(exercice).r}`];
    case "distance11": {
      const e = asVitesse(exercice);
      return [`u_{${e.n}}=${decimalLatex(e.distanceN)}\\text{ m}`];
    }
    case "sommeTotale11": {
      const e = asVitesse(exercice);
      return [`S_{${e.n}}=${decimalLatex(e.sommeTotaleN)}\\text{ m}`];
    }
    case "troisMethodes": {
      const e = asVitesse(exercice);
      return [
        `\\dfrac{S_{${e.n}}}{${e.n}}\\times3{,}6\\approx${Math.round(e.vitesseMoyenneTotaleKmH)}\\text{ km/h}`,
        `u_{${e.n}}\\times3{,}6\\approx${Math.round(e.vitesseDerniereSecondeKmH)}\\text{ km/h}`,
      ];
    }
    case "dixTermes":
      return asFibonacci(exercice).dixPremiersTermes.map((t, i) => `u_{${i + 1}}=${t}`);
    case "calculV5": {
      const e = asFibonacci(exercice);
      const k = e.rangRapport;
      return [`v_{${k}}=\\dfrac{${e.dixPremiersTermes[k]}}{${e.dixPremiersTermes[k - 1]}}\\approx${decimalLatex(e.vk, 2)}`];
    }
    case "resoudrePhi":
      return ["\\varphi=\\dfrac{1+\\sqrt5}{2}\\approx1{,}62"];
    case "hauteursZigzag":
      return asZigzag(exercice).longueurs.map((l, i) => `\\ell_${i + 1}=${racine3EtApproche(l)}`);
    case "longueurZigzag":
      return [`L_\\infty=${racine3EtApproche(asZigzag(exercice).longueurLimite)}\\text{ cm}`];
    case "airesZigzag":
      return asZigzag(exercice).airesT.map((a, i) => `A_${i + 1}=${racine3EtApproche(a)}`);
    case "airesZigzagAC":
      return [`S_\\infty=${racine3EtApproche(asZigzag(exercice).sommeAiresU)}\\text{ cm}^2=A_1`];
    case "sommePartielleA": {
      const e = asCarres(exercice);
      const { num, den } = sommePartielleAFraction(e.coloreesA, e.partsA);
      return [`S_5=\\dfrac{${num}}{${den}}\\approx${decimalLatex(num / den, 3)}`];
    }
    case "sommeInfinieA": {
      const e = asCarres(exercice);
      return [`S_\\infty=${exactEtApproche(e.sommeInfinieA)}`];
    }
    case "airesB":
      return asCarres(exercice).airesB.map((a, i) => `a_${i + 1}=${decimalLatex(a)}\\text{ cm}^2`);
    case "sommeInfinieB":
      return [`S_\\infty=${decimalLatex(asCarres(exercice).sommeInfinieB)}\\text{ cm}^2`];
    default:
      return null;
  }
}

/** S₅ = (c/p)(1 − p⁻⁵)/(1 − 1/p) = c(p⁵ − 1)/(p⁵(p − 1)), en fraction irréductible EXACTE (le
 * dénominateur p⁵ dépasse la recherche de fraction de `formatValeurLatex`). */
function sommePartielleAFraction(c: number, p: number): { num: number; den: number } {
  const num = c * (p ** 5 - 1);
  const den = p ** 5 * (p - 1);
  const d = pgcd(num, den);
  return { num: num / d, den: den / d };
}

function pgcd(a: number, b: number): number {
  return b === 0 ? Math.abs(a) : pgcd(b, a % b);
}

/** Libellés de l'écran « suitesFinalesCombinees » (le premier terme de la suite arithmétique est
 * donné, champ pré-rempli). */
export function labelsSuitesFinalesCombinees(): { arithmetique: string[]; geometrique: string[] } {
  return { arithmetique: ["\\text{1er terme}=", "y=", "z="], geometrique: ["y=", "x=", "z="] };
}

/** Réponse correcte de "suitesFinalesCombinees" — 2 groupes de 3 fragments LaTeX. */
export function formatTermesSuitesFinalesLatex(exercice: ExerciceSuitesCombinees): { arithmetique: string[]; geometrique: string[] } {
  const labels = labelsSuitesFinalesCombinees();
  return {
    arithmetique: labels.arithmetique.map((label, i) => `${label}${exercice.arithmetique[i]}`),
    geometrique: labels.geometrique.map((label, i) => `${label}${exercice.geometrique[i]}`),
  };
}

/** Réponse correcte d'un écran, quel qu'il soit, en fragments LaTeX (fiches des puces). */
export function fragmentsReponseAttendue(exercice: ExerciceSuiteClassique, phase: PhaseSuiteClassique): string[] {
  if (phase === "suitesFinalesCombinees" && exercice.scenario === "suitesCombinees") {
    const { arithmetique, geometrique } = formatTermesSuitesFinalesLatex(exercice);
    return [...arithmetique, ...geometrique];
  }
  const termes = formatTermesReponseAttendueLatex(exercice, phase);
  if (termes !== null) return termes;
  const qcm = texteReponseAttendueQCM(exercice, phase);
  return qcm === null ? [] : [qcm];
}
