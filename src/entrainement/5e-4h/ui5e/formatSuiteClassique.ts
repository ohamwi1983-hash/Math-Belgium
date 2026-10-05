/**
 * Couche présentation (5e) — consignes/labels/aides pour 5gen17 ("Problèmes classiques sur les
 * suites"). 7 scénarios disjoints, 26 phases au total.
 */
import type {
  ExerciceCarresEmboites,
  ExerciceFibonacci,
  ExercicePapyrusRhind,
  ExerciceSuiteClassique,
  ExerciceSuitesCombinees,
  ExerciceTrianglesZigzag,
  ExerciceVitesse,
} from "../core5e/suitesClassiques.types";
import type { PhaseSuiteClassique } from "../moteur5e/typesSuiteClassique";
import { ordreComplet } from "../moteur5e/typesSuiteClassique";
import { formatValeurLatex } from "./formatDomaineDefinition";

export interface OptionQCM {
  id: string;
  label: string;
}

export function consigneGenerale(exercice: ExerciceSuiteClassique): string {
  switch (exercice.scenario) {
    case "echiquier":
      return "La légende de l'échiquier : un grain de blé sur la 1ère case, puis on double à chaque case suivante (64 cases).";
    case "papyrusRhind":
      return "100 pains à répartir entre 5 personnes, en progression arithmétique, selon la règle du papyrus de Rhind.";
    case "suitesCombinees":
      return "Trois nombres y, x, z tels que x est la moyenne géométrique de y et z, et 6, y, z est une suite arithmétique.";
    case "vitesse":
      return "Un mobile parcourt, chaque seconde, une distance en progression arithmétique.";
    case "fibonacci":
      return "La suite de Fibonacci : chaque terme est la somme des deux précédents.";
    case "trianglesZigzag":
      return "Une suite de triangles emboîtés par le théorème de Thalès, de hauteur divisée par 2 à chaque étape.";
    case "carresEmboites":
      return "Des carrés emboîtés à l'infini.";
  }
}

export function formatTermesDonneesLatex(exercice: ExerciceSuiteClassique, phase: PhaseSuiteClassique): string[] {
  switch (exercice.scenario) {
    case "echiquier":
      return [`u_1=${exercice.u1}`, `q=${exercice.q}`, "1 \\text{ grain} = 0{,}05 \\text{ g}"];
    case "papyrusRhind":
      return ["\\text{5 parts, somme}=100", "u_n=a+(n-1)\\Delta"];
    case "suitesCombinees":
      return ["x\\cdot y\\cdot z=216", "x^2=yz", "6,\\,y,\\,z \\text{ arithmétique}"];
    case "vitesse":
      return [`u_1=${exercice.u1}\\text{ m}`, `r=${exercice.r}\\text{ m}`];
    case "fibonacci":
      return ["u_1=u_2=1", "u_n=u_{n-2}+u_{n-1}"];
    case "trianglesZigzag":
      return phase === "airesZigzagAC" ? ["\\text{aire entre le zigzag et }[AC]"] : [`h_1=\\dfrac{\\sqrt3}{2}`, "\\text{raison}=\\dfrac12"];
    case "carresEmboites":
      return phase === "airesB" || phase === "sommeInfinieB"
        ? [`\\text{côté}=${exercice.coteB}`, "\\text{raison}=\\dfrac12"]
        : ["u_1=\\dfrac14", "\\text{raison}=\\dfrac14"];
  }
}

export const LIBELLE_PHASE_SUITE_CLASSIQUE: Record<PhaseSuiteClassique, string> = {
  u64: "La 64ᵉ case",
  sommeTotaleEchiquier: "Le nombre total de grains",
  poidsComparaison: "Poids total et comparaison",
  poserSysteme: "Poser le système",
  resoudreSysteme: "Résoudre le système",
  suiteFinalePapyrus: "La suite finale",
  poserEquationCombinees: "Poser l'équation",
  resoudreRCombinees: "Résoudre pour r",
  suitesFinalesCombinees: "Les suites finales",
  distance11: "Distance à la 11ᵉ seconde",
  sommeTotale11: "Distance totale sur 11 s",
  troisMethodes: "Trois méthodes d'estimation",
  dixTermes: "Les 10 premiers termes",
  formuleRecurrence: "La formule de récurrence",
  calculV5: "Calculer v₅",
  resoudrePhi: "Résoudre x²=x+1",
  proprieteInverse: "Une propriété remarquable",
  hauteursZigzag: "Les hauteurs successives",
  airesZigzag: "Les aires successives",
  longueurZigzag: "La longueur du chemin en zigzag",
  airesZigzagAC: "Les aires entre le zigzag et [AC]",
  sommePartielleA: "Somme des 5 premiers termes",
  limitePuissanceA: "La limite de (1/4)ⁿ",
  sommeInfinieA: "La somme infinie",
  airesB: "Les aires successives",
  sommeInfinieB: "La somme infinie",
};

export function consignePhase(exercice: ExerciceSuiteClassique, phase: PhaseSuiteClassique): string {
  switch (phase) {
    case "u64":
      return "Combien de grains de blé y a-t-il sur la 64ᵉ case ?";
    case "sommeTotaleEchiquier":
      return "Combien de grains de blé y a-t-il au total sur les 64 cases ?";
    case "poidsComparaison":
      return "Quel est le poids total (en tonnes), et combien de fois dépasse-t-il la production mondiale annuelle de blé ?";
    case "poserSysteme":
      return "Quel système d'équations traduit cette situation (a=plus petite part, Δ=raison) ?";
    case "resoudreSysteme":
      return "Résous ce système pour trouver a et Δ (arrondis au centième près).";
    case "suiteFinalePapyrus":
      return "Donne les 5 parts, dans l'ordre (arrondis au centième près).";
    case "poserEquationCombinees":
      return "Quelle équation permet de trouver x directement ?";
    case "resoudreRCombinees":
      return "Résous cette équation pour trouver r (rejette la solution dégénérée).";
    case "suitesFinalesCombinees":
      return "Donne les 2 suites finales (arithmétique 6,y,z puis géométrique y,x,z).";
    case "distance11":
      return "Quelle distance est parcourue durant la 11ᵉ seconde ?";
    case "sommeTotale11":
      return "Quelle distance totale est parcourue en 11 secondes ?";
    case "troisMethodes":
      return "Calcule les 3 estimations de la vitesse finale (en km/h), dans l'ordre du plus naïf au plus rigoureux.";
    case "dixTermes":
      return "Donne les 10 premiers termes de la suite.";
    case "formuleRecurrence":
      return "Quelle est la formule de récurrence de cette suite ?";
    case "calculV5":
      return "Calcule v₅=u₆/u₅.";
    case "resoudrePhi":
      return "Résous x²=x+1 (racine positive) pour trouver φ.";
    case "proprieteInverse":
      return "Que vaut 1/φ ?";
    case "hauteursZigzag":
      return "Donne les 4 premières hauteurs (arrondis au centième près).";
    case "airesZigzag":
      return "Donne les 4 premières aires.";
    case "longueurZigzag": {
      const e = exercice as { longueurZigzag: number };
      return `Que devient la longueur du chemin en zigzag lorsque le nombre d'étapes augmente indéfiniment ? (elle vaut toujours ${e.longueurZigzag})`;
    }
    case "airesZigzagAC":
      return "Donne les 3 premières aires entre le zigzag et [AC] (arrondis au centième près).";
    case "sommePartielleA":
      return "Calcule S₅, la somme des 5 premiers termes.";
    case "limitePuissanceA":
      return "Vers quelle valeur (1/4)ⁿ tend-il quand n tend vers l'infini ?";
    case "sommeInfinieA":
      return "Calcule la somme infinie (la fraction colorée totale) (arrondis au centième près).";
    case "airesB":
      return "Donne les 3 premières aires des carrés emboîtés.";
    case "sommeInfinieB":
      return "Calcule la somme infinie des aires.";
  }
}

export function labelPhase(_exercice: ExerciceSuiteClassique, phase: PhaseSuiteClassique): string {
  switch (phase) {
    case "u64":
      return "u_{64}=";
    case "sommeTotaleEchiquier":
      return "S_{64}=";
    case "resoudreRCombinees":
      return "r=";
    case "distance11":
      return "u_{11}=";
    case "sommeTotale11":
      return "S_{11}=";
    case "calculV5":
      return "v_5=";
    case "resoudrePhi":
      return "\\varphi=";
    case "sommePartielleA":
      return "S_5=";
    case "sommeInfinieA":
    case "sommeInfinieB":
      return "S_\\infty=";
    default:
      return "=";
  }
}

export function labelsListe(phase: PhaseSuiteClassique): { labels: string[]; enLatex: boolean } {
  switch (phase) {
    case "poidsComparaison":
      return { labels: ["Poids total (tonnes) =", "Facteur de comparaison ="], enLatex: false };
    case "resoudreSysteme":
      return { labels: ["a=", "\\Delta="], enLatex: true };
    case "suiteFinalePapyrus":
      return { labels: ["u_1=", "u_2=", "u_3=", "u_4=", "u_5="], enLatex: true };
    case "troisMethodes":
      return { labels: ["Méthode 1 (km/h) =", "Méthode 2 (km/h) =", "Méthode 3 (km/h) ="], enLatex: false };
    case "dixTermes":
      return { labels: Array.from({ length: 10 }, (_, i) => `u_{${i + 1}}=`), enLatex: true };
    case "hauteursZigzag":
      return { labels: ["h_1=", "h_2=", "h_3=", "h_4="], enLatex: true };
    case "airesZigzag":
      return { labels: ["A_1=", "A_2=", "A_3=", "A_4="], enLatex: true };
    case "airesZigzagAC":
      return { labels: ["A'_1=", "A'_2=", "A'_3="], enLatex: true };
    case "airesB":
      return { labels: ["a_1=", "a_2=", "a_3="], enLatex: true };
    default:
      return { labels: [], enLatex: false };
  }
}

export function optionsQCM(_exercice: ExerciceSuiteClassique, phase: PhaseSuiteClassique): OptionQCM[] {
  switch (phase) {
    case "poserSysteme":
      return [
        { id: "correct", label: "5a+10Δ=100 et 7(2a+Δ)=3a+9Δ" },
        { id: "sommeSeule", label: "5a+10Δ=100 seule" },
        { id: "sansContrainte", label: "a+Δ=100" },
        { id: "produitInverse", label: "5aΔ=100 et 2a+Δ=3a+9Δ" },
      ];
    case "poserEquationCombinees":
      return [
        { id: "correct", label: "x³=216" },
        { id: "yzSeul", label: "yz=216" },
        { id: "sommeXYZ", label: "x+y+z=216" },
        { id: "carreSeul", label: "x²=216" },
      ];
    case "formuleRecurrence":
      return [
        { id: "correct", label: "u_n = u_{n-2} + u_{n-1}" },
        { id: "sommeTousLesTermes", label: "u_n = somme de tous les termes précédents" },
        { id: "differenceConstante", label: "u_n = u_{n-1} + constante" },
        { id: "produitConstant", label: "u_n = u_{n-1} × 2" },
      ];
    case "proprieteInverse":
      return [
        { id: "phiMoinsUn", label: "φ - 1" },
        { id: "phiPlusUn", label: "φ + 1" },
        { id: "unMoinsPhi", label: "1 - φ" },
        { id: "phiCarre", label: "φ²" },
      ];
    case "longueurZigzag":
      return [
        { id: "resteEgaleADeux", label: "Elle reste toujours égale à 2, elle ne tend jamais vers 0" },
        { id: "tendVersZero", label: "Elle tend vers 0, comme les hauteurs" },
        { id: "tendVersInfini", label: "Elle tend vers l'infini" },
        { id: "tendVersRacine3", label: "Elle tend vers √3" },
      ];
    case "limitePuissanceA":
      return [
        { id: "zero", label: "0" },
        { id: "unQuart", label: "1/4" },
        { id: "un", label: "1" },
        { id: "infini", label: "+∞" },
      ];
    default:
      return [];
  }
}

/**
 * LaTeX PUR sur TOUTE phase (même refonte que `formatSuiteGeometrique.ts`, 5gen15 : auparavant du
 * texte brut ASCII, ex. "u_n = u_1 × q^(n-1) grains.", rendu en `<p>` plutôt que `<Katex>` sur les 4
 * composants d'écran de ce générateur). Toute portion de prose française est enveloppée dans
 * `\text{...}` (jamais laissée nue en mode maths, où KaTeX italiciserait/coupe-collerait les lettres
 * sans espacement lisible).
 */
export function texteAideNiveau1(_exercice: ExerciceSuiteClassique, phase: PhaseSuiteClassique): string {
  switch (phase) {
    case "u64":
      return "\\text{La case } n \\text{ contient } u_n = u_1 \\times q^{n-1} \\text{ grains.}";
    case "sommeTotaleEchiquier":
      return "\\text{La somme des } n \\text{ premiers termes d'une suite géométrique est } S_n = u_1 \\times \\dfrac{1-q^n}{1-q}.";
    case "poidsComparaison":
      return "1 \\text{ grain pèse } 0{,}05\\text{ g, donc } 20 \\text{ grains pèsent } 1\\text{ g. Divise le nombre total de grains par } 20\\,000\\,000 \\text{ pour obtenir directement des tonnes.}";
    case "poserSysteme":
      return "\\text{La somme des 5 parts vaut } 100 \\text{. Une autre relation lie la somme des 2 plus grandes parts et celle des 3 plus petites.}";
    case "resoudreSysteme":
      return "\\text{Isole } \\Delta \\text{ dans la seconde équation, puis substitue dans la première.}";
    case "suiteFinalePapyrus":
      return "\\text{Chaque terme s'obtient en ajoutant } \\Delta \\text{ au précédent, en partant de } a.";
    case "poserEquationCombinees":
      return "\\text{Combine } x\\cdot y\\cdot z=216 \\text{ et } x^2=yz \\text{ pour éliminer } y \\text{ et } z.";
    case "resoudreRCombinees":
      return "\\text{Développe } (6+r)(6+2r)=x^2 \\text{ et résous l'équation du second degré obtenue — 2 solutions, rejette la dégénérée (}r=0\\text{).}";
    case "suitesFinalesCombinees":
      return "\\text{Utilise } x \\text{ et } r \\text{ déjà trouvés pour reconstituer les 2 suites.}";
    case "distance11":
      return "u_n = u_1 + (n-1)r.";
    case "sommeTotale11":
      return "S_n = \\dfrac{n}{2}(2u_1+(n-1)r).";
    case "troisMethodes":
      return "\\text{Méthode 1 : la dernière distance } \\times 3{,}6 \\text{. Méthode 2 : } r\\times t\\times 3{,}6 \\text{. Méthode 3 : dérive } e(t)=\\dfrac{r}{2}t^2+\\left(u_1-\\dfrac{r}{2}\\right)t \\text{ puis calcule } v(11)\\times 3{,}6.";
    case "dixTermes":
      return "u_1=u_2=1\\text{, puis chaque terme est la somme des deux précédents.}";
    case "formuleRecurrence":
      return "\\text{Observe comment chaque terme se construit à partir des deux précédents.}";
    case "calculV5":
      return "v_5\\text{ est le rapport du 6e terme sur le 5e terme.}";
    case "resoudrePhi":
      return "x^2-x-1=0 \\text{ — utilise la formule quadratique, garde la racine positive.}";
    case "proprieteInverse":
      return "\\varphi \\text{ vérifie } \\varphi^2=\\varphi+1 \\text{ — divise les deux membres par } \\varphi.";
    case "hauteursZigzag":
      return "\\text{Chaque hauteur est la moitié de la précédente.}";
    case "airesZigzag":
      return "\\text{L'aire est proportionnelle au CARRÉ de la hauteur — la raison est donc } \\left(\\dfrac12\\right)^2=\\dfrac14.";
    case "longueurZigzag":
      return "\\text{Chaque segment du zigzag est une hauteur — la LONGUEUR TOTALE parcourue ne diminue pas comme les hauteurs individuelles.}";
    case "airesZigzagAC":
      return "\\text{Ces aires suivent la même raison que les hauteurs, } \\dfrac12.";
    case "sommePartielleA":
      return "S_5 = u_1\\times\\dfrac{1-q^5}{1-q}\\text{, avec } u_1=\\dfrac{1}{4} \\text{ et } q=\\dfrac{1}{4}.";
    case "limitePuissanceA":
      return "\\text{Quand } n \\text{ augmente, une puissance d'un nombre entre -1 et 1 se rapproche de plus en plus de } 0.";
    case "sommeInfinieA":
      return "S_\\infty = \\dfrac{u_1}{1-q}.";
    case "airesB":
      return "\\text{Chaque aire est la moitié de la précédente (raison } \\dfrac12\\text{).}";
    case "sommeInfinieB":
      return "S_\\infty = \\dfrac{u_1}{1-q}\\text{, avec } u_1=\\text{côté}^2.";
  }
}

export function texteAideNiveau2(exercice: ExerciceSuiteClassique, phase: PhaseSuiteClassique): string {
  if (phase === "resoudreSysteme" && exercice.scenario === "papyrusRhind") {
    return `\\Delta=\\dfrac{110}{12}`;
  }
  if (phase === "resoudreRCombinees" && exercice.scenario === "suitesCombinees") {
    return "2r^2+18r=0";
  }
  if (phase === "troisMethodes" && exercice.scenario === "vitesse") {
    // `exercice.u1 - exercice.r / 2` accumule un résidu flottant (ex. 0.44999999999999996 au lieu de
    // 0.45) — réutilise `formatValeurLatex` (déjà importé, déjà utilisé ailleurs dans ce fichier pour
    // ce genre de valeur) plutôt qu'une interpolation `${...}` directe.
    return `e(t)=${formatValeurLatex(exercice.r / 2)}t^2+${formatValeurLatex(exercice.u1 - exercice.r / 2)}t`;
  }
  if (phase === "resoudrePhi") {
    return "\\varphi=\\dfrac{1+\\sqrt5}{2}";
  }
  return "";
}

// ============================================================================
// Réponse attendue par écran — utilisée à la fois pour le "bloc état actuel" (rappel des écrans
// déjà confirmés dans la séquence RÉELLE d'un même scénario) et pour l'écran récapitulatif final
// (`ResultatPanelSuiteClassique.tsx`), même patron que `formatSuiteArithmetique.ts` (5gen14,
// `formatTermesEtatActuelLatex`/`formatReponseAttenduePhaseLatex`). Dérivée PUREMENT de `exercice`
// (jamais de la saisie de l'élève), même convention "état actuel" que le reste du projet
// (`formatTermesEtatActuelCELatex` ci-dessus, 5gen1). Réutilise `formatValeurLatex`
// (`ui5e/formatDomaineDefinition.ts`, 5gen1/5gen3 — fraction irréductible en LaTeX pour toute valeur
// non entière, jamais un décimal brut) plutôt qu'une conversion `${valeur}` directe — importante ici
// puisque plusieurs cibles ne sont pas entières (a/Δ du papyrus de Rhind, v₅/φ de Fibonacci...).
// ============================================================================

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

interface FractionEntiere {
  num: number;
  den: number;
}

function pgcd(a: number, b: number): number {
  return b === 0 ? a : pgcd(b, a % b);
}

function reduireFraction(f: FractionEntiere): FractionEntiere {
  const diviseur = pgcd(Math.abs(f.num), Math.abs(f.den)) || 1;
  return { num: f.num / diviseur, den: f.den / diviseur };
}

/** Convertit un flottant EXACTEMENT représentable en binaire (ex. 0,25 = 1/4, cas de `u1A`/`qA` de
 * "carresEmboites") en fraction entière irréductible — n'a pas vocation à approcher un flottant
 * quelconque, seulement à reformuler un flottant DÉJÀ exact en fraction. */
function depuisDecimalExact(valeur: number): FractionEntiere {
  let num = valeur;
  let den = 1;
  while (!Number.isInteger(num) && den < 2 ** 30) {
    num *= 2;
    den *= 2;
  }
  return reduireFraction({ num: Math.round(num), den });
}

function multiplierFraction(a: FractionEntiere, b: FractionEntiere): FractionEntiere {
  return reduireFraction({ num: a.num * b.num, den: a.den * b.den });
}
function soustraireFraction(a: FractionEntiere, b: FractionEntiere): FractionEntiere {
  return reduireFraction({ num: a.num * b.den - b.num * a.den, den: a.den * b.den });
}
function diviserFraction(a: FractionEntiere, b: FractionEntiere): FractionEntiere {
  return reduireFraction({ num: a.num * b.den, den: a.den * b.num });
}
function puissanceFraction(a: FractionEntiere, n: number): FractionEntiere {
  return reduireFraction({ num: Math.pow(a.num, n), den: Math.pow(a.den, n) });
}

/** S₅ = u1A×(1-qA^5)/(1-qA), calculé en arithmétique fractionnaire entière EXACTE (petites fonctions
 * `xxxFraction` locales ci-dessus — u1A/qA de "carresEmboites" sont des puissances de 2, donc
 * représentables exactement en fraction binaire, `depuisDecimalExact` ci-dessus) plutôt qu'en
 * flottant : qA^5 a un dénominateur 1024 > `DENOMINATEUR_MAX` (100) de `formatValeurLatex`
 * (`ui5e/formatDomaineDefinition.ts`), qui retomberait sinon sur un arrondi décimal — violation de
 * la convention "fraction irréductible, jamais de décimal" (CLAUDE.md). Calculée algébriquement
 * depuis `u1A`/`qA` (pas une fraction 341/1024 codée en dur) pour rester robuste si ces constantes
 * changent un jour. */
function sommePartielleAFraction(u1A: number, qA: number): FractionEntiere {
  const u1Frac = depuisDecimalExact(u1A);
  const qFrac = depuisDecimalExact(qA);
  const un: FractionEntiere = { num: 1, den: 1 };
  const unMoinsQPuissance5 = soustraireFraction(un, puissanceFraction(qFrac, 5));
  const unMoinsQ = soustraireFraction(un, qFrac);
  return diviserFraction(multiplierFraction(u1Frac, unMoinsQPuissance5), unMoinsQ);
}

function latexFraction(f: FractionEntiere): string {
  return f.den === 1 ? `${f.num}` : `\\dfrac{${f.num}}{${f.den}}`;
}

interface DonneesNumeriquesPhase {
  labels: string[];
  enLatex: boolean;
  valeurs: number[];
}

/** Cible(s) numérique(s) attendue(s) de chaque écran non-QCM/non-bespoke — reprend directement les
 * champs déjà comparés par `diagnostiquerXxx` (`moteur5e/verificationSuiteClassique.ts`, lu mais
 * jamais importé ici — chaque cible est déjà stockée sur `exercice`, jamais recalculée
 * différemment). `null` pour les 6 écrans QCM, pour "suitesFinalesCombinees" (traités séparément,
 * voir `texteReponseAttendueQCM`/`formatTermesSuitesFinalesLatex`), et pour "u64"/
 * "sommeTotaleEchiquier"/"poidsComparaison"/"sommePartielleA" (traités en AMONT, dans
 * `formatTermesReponseAttendueLatex` ci-dessous, AVANT tout appel à cette fonction — ces 4 cibles ne
 * peuvent pas transiter (en tout ou en partie) par un `number[]` générique + `formatValeurLatex` sans
 * perte : `u64`/`sommeTotale` sont des `bigint` hors de portée d'un `number` IEEE-754,
 * `poidsTotalTonnes` (1er champ de "poidsComparaison") est une quantité physique en tonnes qui
 * déclenche une fausse fraction pédagogique sous `formatValeurLatex`, et `sommePartielleA` a un
 * dénominateur exact (1024) au-delà du cap de recherche de fraction de `formatValeurLatex`). */
function donneesNumeriquesPhase(exercice: ExerciceSuiteClassique, phase: PhaseSuiteClassique): DonneesNumeriquesPhase | null {
  switch (phase) {
    case "resoudreSysteme": {
      const e = asPapyrus(exercice);
      const { labels, enLatex } = labelsListe(phase);
      return { labels, enLatex, valeurs: [e.a, e.delta] };
    }
    case "suiteFinalePapyrus": {
      const e = asPapyrus(exercice);
      const { labels, enLatex } = labelsListe(phase);
      return { labels, enLatex, valeurs: [...e.termes] };
    }
    case "resoudreRCombinees": {
      const e = asCombinees(exercice);
      return { labels: [labelPhase(exercice, phase)], enLatex: true, valeurs: [e.r] };
    }
    case "distance11": {
      const e = asVitesse(exercice);
      return { labels: [labelPhase(exercice, phase)], enLatex: true, valeurs: [e.distance11] };
    }
    case "sommeTotale11": {
      const e = asVitesse(exercice);
      return { labels: [labelPhase(exercice, phase)], enLatex: true, valeurs: [e.sommeTotale11] };
    }
    case "troisMethodes": {
      const e = asVitesse(exercice);
      const { labels, enLatex } = labelsListe(phase);
      return { labels, enLatex, valeurs: [e.vitesseMethode1KmH, e.vitesseMethode2KmH, e.vitesseMethode3KmH] };
    }
    case "dixTermes": {
      const e = asFibonacci(exercice);
      const { labels, enLatex } = labelsListe(phase);
      return { labels, enLatex, valeurs: [...e.dixPremiersTermes] };
    }
    case "calculV5": {
      const e = asFibonacci(exercice);
      return { labels: [labelPhase(exercice, phase)], enLatex: true, valeurs: [e.v5] };
    }
    case "resoudrePhi": {
      const e = asFibonacci(exercice);
      return { labels: [labelPhase(exercice, phase)], enLatex: true, valeurs: [e.phi] };
    }
    case "hauteursZigzag": {
      const e = asZigzag(exercice);
      const { labels, enLatex } = labelsListe(phase);
      return { labels, enLatex, valeurs: [...e.hauteurs] };
    }
    case "airesZigzag": {
      const e = asZigzag(exercice);
      const { labels, enLatex } = labelsListe(phase);
      return { labels, enLatex, valeurs: [...e.aires] };
    }
    case "airesZigzagAC": {
      const e = asZigzag(exercice);
      const { labels, enLatex } = labelsListe(phase);
      return { labels, enLatex, valeurs: [...e.airesEntreZigzagEtAC] };
    }
    case "sommeInfinieA": {
      const e = asCarres(exercice);
      return { labels: [labelPhase(exercice, phase)], enLatex: true, valeurs: [e.sommeInfinieA] };
    }
    case "airesB": {
      const e = asCarres(exercice);
      const { labels, enLatex } = labelsListe(phase);
      return { labels, enLatex, valeurs: [...e.airesB] };
    }
    case "sommeInfinieB": {
      const e = asCarres(exercice);
      return { labels: [labelPhase(exercice, phase)], enLatex: true, valeurs: [e.sommeInfinieB] };
    }
    default:
      return null;
  }
}

/** LaTeX "bloc fitter" (un fragment par valeur) de la réponse correcte d'un écran — `null` pour les
 * 6 écrans QCM et pour "suitesFinalesCombinees" (voir `texteReponseAttendueQCM`/
 * `formatTermesSuitesFinalesLatex`).
 *
 * "u64"/"sommeTotaleEchiquier"/"poidsComparaison"/"sommePartielleA" sont interceptés ICI, AVANT
 * `donneesNumeriquesPhase` : ce sont les 4 cibles qui ne peuvent pas transiter (en tout ou en partie)
 * par le chemin générique `number[]` + `formatValeurLatex` sans perte — voir le commentaire de
 * `donneesNumeriquesPhase` ci-dessus pour le détail par cible. */
export function formatTermesReponseAttendueLatex(exercice: ExerciceSuiteClassique, phase: PhaseSuiteClassique): string[] | null {
  if (phase === "u64" && exercice.scenario === "echiquier") {
    // `exercice.u64` est un `bigint` (2⁶³, hors de portée d'un `number` IEEE-754) — `.toString()`
    // donne tous les chiffres exacts, jamais reconverti en `Number` pour l'affichage.
    return [`${labelPhase(exercice, phase)}${exercice.u64.toString()}`];
  }
  if (phase === "sommeTotaleEchiquier" && exercice.scenario === "echiquier") {
    return [`${labelPhase(exercice, phase)}${exercice.sommeTotale.toString()}`];
  }
  if (phase === "poidsComparaison" && exercice.scenario === "echiquier") {
    const { labels } = labelsListe(phase);
    // `poidsTotalTonnes` : quantité physique réelle en tonnes, pas une fraction pédagogique — arrondi
    // décimal direct (déjà arrondi à 2 décimales à la construction, `generateurs5e/suitesClassiques/
    // echiquier.ts`), JAMAIS via `formatValeurLatex`/sa recherche de fraction (qui produirait une
    // fraction fantôme absurde, ex. 61796592646927/67, pour cette valeur). `facteurComparaison` reste
    // sur le chemin `formatValeurLatex` habituel.
    return [`\\text{${labels[0]}}\\ ${exercice.poidsTotalTonnes.toFixed(2)}`, `\\text{${labels[1]}}\\ ${formatValeurLatex(exercice.facteurComparaison)}`];
  }
  if (phase === "sommePartielleA" && exercice.scenario === "carresEmboites") {
    const frac = sommePartielleAFraction(exercice.u1A, exercice.qA);
    return [`${labelPhase(exercice, phase)}${latexFraction(frac)}`];
  }
  const donnees = donneesNumeriquesPhase(exercice, phase);
  if (donnees === null) return null;
  return donnees.labels.map((label, i) => {
    const valeur = formatValeurLatex(donnees.valeurs[i]);
    return donnees.enLatex ? `${label}${valeur}` : `\\text{${label}}\\ ${valeur}`;
  });
}

const ID_CORRECT_QCM: Partial<Record<PhaseSuiteClassique, string>> = {
  poserSysteme: "correct",
  poserEquationCombinees: "correct",
  formuleRecurrence: "correct",
  proprieteInverse: "phiMoinsUn",
  longueurZigzag: "resteEgaleADeux",
  limitePuissanceA: "zero",
};

/** Libellé de la bonne option des 6 écrans QCM (reprend le libellé du bouton lui-même, rendu
 * identiquement via `<Katex>` à l'écran comme au récapitulatif, voir `EtapeQCMClassique.tsx`/
 * `ResultatPanelSuiteClassique.tsx`) — `null` pour tout autre écran. Les labels eux-mêmes restent un
 * mélange de fragments LaTeX (`u_{n-1}`) et de prose française NON enveloppée dans `\text{...}`
 * (seule "formuleRecurrence", audité, a été corrigée en Partie A — les autres labels QCM sont hors
 * scope de cet audit) : rendus tels quels par KaTeX (mode maths, prose non idéalement espacée), sans
 * erreur de rendu. */
export function texteReponseAttendueQCM(exercice: ExerciceSuiteClassique, phase: PhaseSuiteClassique): string | null {
  const idCorrect = ID_CORRECT_QCM[phase];
  if (idCorrect === undefined) return null;
  return optionsQCM(exercice, phase).find((o) => o.id === idCorrect)?.label ?? null;
}

/** Labels des 2 groupes de l'écran bespoke "suitesFinalesCombinees" — source de vérité UNIQUE,
 * réutilisée à la fois par `EtapeSuitesFinalesCombinees.tsx` (saisie) et par le récapitulatif/état
 * actuel (réponse correcte) — remplace les 2 constantes autrefois locales à ce composant. */
export const LABELS_SUITE_ARITHMETIQUE_COMBINEE = ["6=", "y=", "z="];
export const LABELS_SUITE_GEOMETRIQUE_COMBINEE = ["y=", "x=", "z="];

/** Réponse correcte de "suitesFinalesCombinees" — 2 groupes de 3 fragments LaTeX. */
export function formatTermesSuitesFinalesLatex(exercice: ExerciceSuitesCombinees): { arithmetique: string[]; geometrique: string[] } {
  return {
    arithmetique: LABELS_SUITE_ARITHMETIQUE_COMBINEE.map((label, i) => `${label}${formatValeurLatex(exercice.arithmetique[i])}`),
    geometrique: LABELS_SUITE_GEOMETRIQUE_COMBINEE.map((label, i) => `${label}${formatValeurLatex(exercice.geometrique[i])}`),
  };
}

// ============================================================================
// Bloc "état actuel" (généralisation du principe déjà établi par 5gen1/5gen14 à 5gen17) — rappelle,
// sur chaque écran APRÈS LE PREMIER d'un même scénario, la réponse correcte des écrans déjà
// traversés (`ordreComplet(exercice)`, jamais la saisie brute de l'élève). Un fragment LaTeX par
// valeur pour un écran à champ(s)/liste, ou le libellé PLAIN TEXT de la bonne option pour un écran
// QCM (même rendu que le bouton lui-même — utile ici, contrairement à `formatTermesEtatActuelLatex`
// de 5gen14 qui omet entièrement son unique écran QCM ("coherenceJugement") de l'état actuel :
// plusieurs QCM de CE générateur posent une équation/relation dont l'écran SUIVANT a réellement
// besoin, ex. "x³=216" avant de résoudre pour r). "suitesFinalesCombinees" n'apparaît jamais ici :
// c'est toujours la DERNIÈRE phase de son scénario (voir `ORDRE_PHASES`), jamais antérieure à une
// autre phase.
// ============================================================================

export type ElementEtatActuel = { type: "latex"; expression: string } | { type: "texte"; texte: string };

export function elementsEtatActuel(exercice: ExerciceSuiteClassique, phase: PhaseSuiteClassique): ElementEtatActuel[] {
  const phases = ordreComplet(exercice);
  const index = phases.indexOf(phase);
  const elements: ElementEtatActuel[] = [];
  for (const p of phases.slice(0, index)) {
    const termes = formatTermesReponseAttendueLatex(exercice, p);
    if (termes !== null) {
      elements.push(...termes.map((expression) => ({ type: "latex" as const, expression })));
      continue;
    }
    const texte = texteReponseAttendueQCM(exercice, p);
    if (texte !== null) elements.push({ type: "texte", texte });
  }
  return elements;
}
