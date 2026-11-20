/**
 * Couche présentation (5e) — consignes/labels/textes d'aide des écrans de 5gen5
 * ("Problèmes-contexte", 3 scénarios A/B/C). Peut importer `src/generateurs5e/` (règle
 * d'architecture : seule `src/moteur5e/` ne le peut jamais).
 *
 * Convention (audit 5e ch. 1) : les consignes et aides propres à l'ÉCRAN sont écrites en RichText
 * (`$…$` = KaTeX en ligne, rendu par `TexteRiche5e`) — jamais de notation clavier (« V/(πr²) »,
 * « b-ax »), virgule décimale partout. EXCEPTION : les textes repris par la feuille papier
 * (`generateurs5e/problemesContexte/exportEvaluation.ts`, qui les insère en texte brut :
 * `consigneContexteBIntro`, `consigneContexteBReleve`, `consigneSystemeB`, `CONSIGNE_RESOLUTION_B`,
 * `CONSIGNE_FORMULE_B`, `consigneEvaluationB`) restent SANS `$` tant que l'adaptateur papier n'a pas
 * été refondu.
 */
import type { ExerciceScenarioA, ExerciceScenarioAConteneur, ExerciceScenarioB, ExerciceScenarioC, FormeCoutVariableC, ModeleCoutUnitaire } from "../core5e/problemesContexte.types";
import { hauteurCylindre } from "../generateurs5e/problemesContexte/scenarioA";
import { coutTotalTheorique } from "../generateurs5e/problemesContexte/scenarioB";

function arrondi(valeur: number, decimales = 2): number {
  const facteur = 10 ** decimales;
  return Math.round(valeur * facteur) / facteur;
}

/** Partie entière groupée par milliers (audit 5e ch. 1, G5 : « 1500 », « 12762 » sans espace). */
function grouperMilliers(entier: string, separateur: string): string {
  return entier.length < 4 ? entier : entier.replace(/\B(?=(\d{3})+(?!\d))/g, separateur);
}

/** Nombre arrondi, virgule décimale, signe « − », milliers séparés par une espace fine insécable
 * (texte brut). */
export function nombreFr(valeur: number, decimales = 2): string {
  const a = arrondi(valeur, decimales);
  const [entier, dec] = String(Math.abs(a)).split(".");
  return (a < 0 ? "−" : "") + grouperMilliers(entier, " ") + (dec ? `,${dec}` : "");
}

/** Nombre arrondi pour KaTeX : virgule décimale `{,}`, milliers séparés par `\,`. */
export function nombreLatex(valeur: number, decimales = 2): string {
  const a = arrondi(valeur, decimales);
  const [entier, dec] = String(Math.abs(a)).split(".");
  return (a < 0 ? "-" : "") + grouperMilliers(entier, "\\,") + (dec ? `{,}${dec}` : "");
}

/** « 432\pi » — contenance A1 écrite en kπ cm³. */
export function volumeKPiLatex(exercice: ExerciceScenarioAConteneur): string {
  return `${nombreLatex(exercice.volumeKPi, 0)}\\pi`;
}

// ============================================================================
// Scénario A — Bidons cylindriques
// ============================================================================

/** Même objet et mêmes lettres à l'écran et sur papier (audit 5e ch. 1, G6) : rayon r, puis x = r. */
export function consigneVolumeA(exercice: ExerciceScenarioAConteneur): string {
  return `On fabrique ${exercice.contexte.nomObjetIndefini} en forme de cylindre, de rayon $r$ et de hauteur $h$ (en cm), dont la contenance est fixée à $V = ${volumeKPiLatex(exercice)}$ cm³, soit environ ${nombreFr(exercice.volumeCm3 / 1000, 2)} L ($V = \\pi r^2 h$).`;
}

export const CONSIGNE_TABLEAU_A = "Pour chaque rayon donné, calcule la hauteur $h$, l'aire des 2 bases et l'aire latérale du cylindre (arrondis à l'unité).";
export const TEXTE_AIDE_TABLEAU_A_1 = "Isole d'abord $h$ dans $V = \\pi r^2 h$ : $h = \\dfrac{V}{\\pi r^2}$.";
export const TEXTE_AIDE_TABLEAU_A_2 = "Aire des 2 bases : $2\\pi r^2$. Aire latérale : $2\\pi r \\cdot h$ (périmètre du cercle × hauteur).";

export const CONSIGNE_GENERALISATION_A =
  "Généralise en fonction de $x = r$ (le rayon) : écris $h(x)$, $f(x)$ (l'aire latérale) et $g(x)$ (l'aire des bases) — garde $V$ comme paramètre, ne le remplace pas par sa valeur numérique.";
export const TEXTE_AIDE_GENERALISATION_A_1 = "Reprends exactement les formules de l'écran précédent, mais avec x à la place d'un rayon donné.";
/** Aide niveau 2 — 3 rappels h/f/g qui donnent la RELATION à utiliser sans la calculer jusqu'au bout
 * (l'élève doit encore isoler h(x), puis substituer et simplifier). Texte et formules séparés
 * (audit 5e ch. 1 : la prose était écrite en mode math, `\text{…}`). */
export function texteAideGeneralisationA2H(): string {
  return "$V = \\pi x^2 \\cdot h(x)$ : isole $h(x)$.";
}
export function texteAideGeneralisationA2F(): string {
  return "$f(x) = 2\\pi x \\cdot h(x)$ (périmètre × hauteur) : substitue $h(x)$, puis simplifie.";
}
export function texteAideGeneralisationA2G(): string {
  return "$g(x) = 2 \\times \\pi x^2$ (deux fois l'aire d'un disque de rayon $x$).";
}

export const CONSIGNE_EGALITE_AIRES_A = "Pour quelle valeur de $x$ l'aire latérale est-elle égale à l'aire des bases ($f(x) = g(x)$) ? (arrondis à l'unité)";
export const TEXTE_AIDE_EGALITE_AIRES_A_1 = "Pose $f(x) = g(x)$ et simplifie : tu obtiens une équation du type $x^3 = c$, où $c$ est une constante.";
export function latexAideEgaliteAiresA2(exercice: ExerciceScenarioAConteneur): string {
  return `x^3 = \\dfrac{V}{\\pi} = \\dfrac{${volumeKPiLatex(exercice)}}{\\pi} = ${nombreLatex(exercice.volumeKPi, 0)}`;
}

export const CONSIGNE_GRAPHIQUE_A = "Sur le graphique ci-dessous, lis le rayon $x$ qui minimise $(f+g)(x)$, la quantité totale de matériau utilisé (il tombe sur une ligne de la grille).";
export const TEXTE_AIDE_GRAPHIQUE_A_1 = "Cherche le point le plus bas de la courbe verte $(f+g)(x)$ : c'est là que la quantité de matériau est minimale.";

/** Consigne — un calcul de h au rayon optimal ; le raisonnement algébrique est fourni par
 * `texteCorrectionJustificationA` après soumission, jamais rédigé par l'élève. */
export function consigneJustificationA(): string {
  return "Calcule la hauteur $h$ au rayon optimal que tu as lu sur le graphique (arrondis à l'unité).";
}
export const TEXTE_AIDE_JUSTIFICATION_A_1 = "Réutilise la formule $h(x) = \\dfrac{V}{\\pi x^2}$ avec le $x$ que tu as lu sur le graphique précédent.";
export function texteCorrectionJustificationA(exercice: ExerciceScenarioAConteneur, _xOptimalRetenu: number): string {
  // V = 2πn³ : le rayon optimal vaut EXACTEMENT n, h(n) = 2n (audit 5e ch. 1, G2).
  const n = exercice.rayonOptimal;
  return (
    `Correction de référence : au rayon optimal $x = ${n}$ cm, la hauteur vaut $h = \\dfrac{${volumeKPiLatex(exercice)}}{\\pi\\cdot ${n}^2} = ${2 * n}$ cm et le diamètre vaut $2x = ${2 * n}$ cm — les deux coïncident. ` +
    "Algébriquement : au minimum de $f+g$, $x^3 = \\dfrac{V}{2\\pi}$, donc $V = 2\\pi x^3$ ; en substituant dans $h(x) = \\dfrac{V}{\\pi x^2}$, on obtient " +
    "$h(x) = \\dfrac{2\\pi x^3}{\\pi x^2} = 2x$ : exactement le diamètre, quelle que soit la contenance $V$."
  );
}

// ============================================================================
// Scénario A, combo réduit `stockCommande` — généralisation (à partir de 2 relevés chiffrés) →
// intersection → extremum.
// ============================================================================

type ExerciceScenarioAReduit = Exclude<ExerciceScenarioA, { combo: "kInverseXAxCarre" }>;

/** Intro du contexte (f(x), g(x), x mis en KaTeX) + nature des deux fonctions (audit 5e ch. 1 :
 * l'écran demandait f et g sans aucun nombre ni forme). */
export function consigneContexteAReduit(exercice: ExerciceScenarioAReduit): string {
  const intro = exercice.contexte.intro.replace(/\b([fg])\(x\)/g, "$$$1(x)$$").replace(/ x /g, " $x$ ");
  return `${intro} Le ${exercice.contexte.labelF} $f(x)$ est une fonction affine de $x$ ; le ${exercice.contexte.labelG} $g(x)$ est inversement proportionnel à $x$. Les coûts sont en euros ; deux relevés sont donnés ci-dessous.`;
}

/** Formule concrète de f(x)/g(x) — réponse attendue de l'écran "generalisationSimple". */
export function formatTermesFormulesGeneralisationSimpleA(exercice: ExerciceScenarioAReduit): string[] {
  const a = exercice.a === 1 ? "" : `${exercice.a}`;
  return [`f(x)=${a}x+${exercice.b}`, `g(x)=\\dfrac{${exercice.k}}{x}`];
}

export function consigneGeneralisationSimpleA(exercice: ExerciceScenarioAReduit): string {
  return `À l'aide des relevés, écris les expressions de $f(x)$ (${exercice.contexte.labelF}) et de $g(x)$ (${exercice.contexte.labelG}) en fonction de $x$.`;
}

export function texteAideGeneralisationSimpleA1(_exercice: ExerciceScenarioAReduit): string {
  return "$f(x)$ est de la forme $ax+b$ : $a$ est la variation de $f$ divisée par celle de $x$ entre les deux relevés, puis un relevé donne $b$. $g(x)$ est de la forme $\\dfrac{k}{x}$ : un seul relevé donne $k = x \\cdot g(x)$.";
}

export function consigneIntersectionSimpleA(): string {
  return "Résous $f(x) = g(x)$ pour trouver $x$.";
}
export const TEXTE_AIDE_INTERSECTION_SIMPLE_A_1 = "Pose $f(x) = g(x)$, remplace $f$ et $g$ par les formules de l'écran précédent, multiplie les deux membres par $x$, puis résous l'équation du second degré obtenue (garde la solution positive).";

export function formatTermeIntersectionSimpleA(exercice: ExerciceScenarioAReduit): string {
  return `x=${exercice.xIntersection}`;
}

export function consigneExtremumSimpleA(_exercice: ExerciceScenarioAReduit): string {
  return "Sur le graphique ci-dessous, lis la taille de lot $x$ qui minimise le coût total $(f+g)(x)$ (elle tombe sur une ligne de la grille).";
}
export function texteAideExtremumSimpleA1(_exercice: ExerciceScenarioAReduit): string {
  return "Cherche le point le plus bas de la courbe verte $(f+g)(x)$.";
}

export function formatTermeExtremumSimpleA(exercice: ExerciceScenarioAReduit): string {
  return `x=${arrondi(exercice.xExtremum, 0)}`;
}

// ============================================================================
// Scénario B — Coût unitaire de production (5 modèles B1-B5)
// ============================================================================

/** Forme symbolique de F(x)=a·coeffA(x)+b·coeffB(x) (coût TOTAL), par modèle — cohérente avec
 * `generateurs5e/problemesContexte/scenarioB.ts::coeffA/coeffB`. */
function formuleFSymbolique(modele: ModeleCoutUnitaire): string {
  switch (modele) {
    case "B1":
      return "ax+b";
    case "B2":
      return "ax+bx^2";
    case "B3":
      return "ax+\\dfrac{b}{x}";
    case "B4":
      return "a+\\dfrac{b}{x}";
    case "B5":
      return "ax^2+b";
  }
}

function formuleCuSymbolique(modele: ModeleCoutUnitaire): string {
  switch (modele) {
    case "B1":
      return "a+\\dfrac{b}{x}";
    case "B2":
      return "a+bx";
    case "B3":
      return "a+\\dfrac{b}{x^2}";
    case "B4":
      return "\\dfrac{a}{x}+\\dfrac{b}{x^2}";
    case "B5":
      return "ax+\\dfrac{b}{x}";
  }
}

/** Prose SEULE (aucun LaTeX — reprise par la feuille papier) — la formule cu(x) est un fragment
 * KaTeX séparé, `latexFormuleCuB`. */
/** Audit 5e ch. 1 (G4) : x compte des CENTAINES d'unités ; le coût unitaire est en euros par unité,
 * le coût total f(x) = cu(x) × x en centaines d'euros. */
export function consigneContexteBIntro(exercice: ExerciceScenarioB): string {
  return `Pour ${exercice.contexte.sujet}, x désigne la production, en centaines de ${exercice.contexte.unite}. Le coût unitaire (en euros par unité) suit la loi cu(x) donnée ci-dessous ; le coût total, en centaines d'euros, vaut cu(x) × x.`;
}

/** « 300 stylos (x = 3) » — quantité réelle, puis la valeur de x. */
export function quantiteB(exercice: ExerciceScenarioB, x: number): string {
  return `${nombreFr(100 * x, 0)} ${exercice.contexte.unite} (x = ${x})`;
}

/** Fragment PUR LaTeX — "cu(x)=..." du modèle. */
export function latexFormuleCuB(modele: ModeleCoutUnitaire): string {
  return `\\text{cu}(x)=${formuleCuSymbolique(modele)}`;
}

/** Prose SEULE (reprise par la feuille papier) — relevé de mesures, coûts EXACTS en virgule. */
export function consigneContexteBReleve(exercice: ExerciceScenarioB): string {
  const { contexte, point1, point2 } = exercice;
  void contexte;
  return `Un relevé donne : pour ${quantiteB(exercice, point1.x)}, le coût unitaire est de ${nombreFr(point1.coutUnitaire)} € ; pour ${quantiteB(exercice, point2.x)}, il est de ${nombreFr(point2.coutUnitaire)} €.`;
}

/** Fragment PUR LaTeX — coût TOTAL cu(x)·x. */
export function latexCoutTotalB(modele: ModeleCoutUnitaire): string {
  return `\\text{cu}(x)\\times x=${formuleFSymbolique(modele)}`;
}

/** Reprise par la feuille papier (texte brut). À l'écran, la formule du coût total est affichée
 * JUSTE APRÈS cette consigne (audit 5e ch. 1 : « ci-dessous » désignait une formule placée
 * au-dessus). */
export function consigneSystemeB(): string {
  return "Construis les 2 équations reliant a et b à partir des 2 relevés, sachant que le coût total (en centaines d'euros) vaut cu(x) × x :";
}
export function texteAideSystemeB1(): string {
  return "Multiplie d'abord le coût unitaire par $x$ : c'est le coût total $\\text{cu}(x) \\times x$, et non le coût unitaire, qui vaut :";
}

/** Terme « coefficient × inconnue » EXACT (audit 5e ch. 1 : « b × 0.333 » pour b/3) — le coefficient
 * de a ou b vaut 1, x, x² ou 1/x selon le modèle. */
function termeInconnueLatex(modele: ModeleCoutUnitaire, x: number, inconnue: "a" | "b"): string {
  const forme = inconnue === "a" ? ({ B1: "x", B2: "x", B3: "x", B4: "1", B5: "x2" } as const)[modele] : ({ B1: "1", B2: "x2", B3: "inv", B4: "inv", B5: "1" } as const)[modele];
  if (forme === "1") return inconnue;
  if (forme === "inv") return x === 1 ? inconnue : `\\dfrac{${inconnue}}{${x}}`;
  const coeff = forme === "x" ? x : x * x;
  return coeff === 1 ? inconnue : `${coeff}${inconnue}`;
}

export const CONSIGNE_RESOLUTION_B = "Résous ce système pour trouver a et b.";
export const TEXTE_AIDE_RESOLUTION_B_1 = "Combine les 2 équations pour éliminer une inconnue (multiplie-les si besoin pour aligner les coefficients), puis substitue pour trouver l'autre.";

export const CONSIGNE_FORMULE_B = "Écris la fonction f(x) donnant le coût total de production (en centaines d'euros), avec les valeurs de a et b que tu viens de trouver.";
export function texteAideFormuleB1(): string {
  return "Remplace $a$ et $b$ par tes valeurs de l'écran précédent dans la formule ci-dessous.";
}
/** Fragment PUR LaTeX — "f(x)=..." du modèle. */
export function latexFormuleFB(modele: ModeleCoutUnitaire): string {
  return `f(x)=${formuleFSymbolique(modele)}`;
}

export function consigneEvaluationB(exercice: ExerciceScenarioB): string {
  return `Calcule le coût total de production, en centaines d'euros, pour x = ${exercice.xEval1} puis pour x = ${exercice.xEval2} (arrondis à l'unité).`;
}
export const TEXTE_AIDE_EVALUATION_B_1 = "Remplace $x$ par la valeur demandée dans ta formule $f(x)$ de l'écran précédent.";

// ============================================================================
// Scénario C — Coûts d'une entreprise (tableau de valeurs + graphe)
// ============================================================================

/** Vocabulaire aligné sur le quiz 5gen39 (« coût total = coût fixe + coût variable ») : le coût
 * proportionnel CP(x) est présenté comme une PARTIE du coût variable. */
export function consigneContexteC(exercice: ExerciceScenarioC): string {
  // Audit 5e ch. 1 (G6) : « un coût variable formé de deux parties : CV(x) et CP(x) » donnait le nom
  // « coût variable » à une seule des deux parties.
  return (
    `Une entreprise a un coût fixe $\\text{CF} = ${nombreLatex(exercice.cf)}$ et des coûts qui dépendent de la quantité produite $x$ : une partie non proportionnelle $\\text{CV}(x)$ et une partie proportionnelle $\\text{CP}(x)$. ` +
    "Le coût total vaut donc $\\text{CT}(x) = \\text{CF} + \\text{CV}(x) + \\text{CP}(x)$ ; le chiffre d'affaires est $\\text{CA}(x)$. Toutes les valeurs sont en milliers d'euros."
  );
}

export function consigneLectureC(exercice: ExerciceScenarioC): string {
  return `À l'aide du tableau, calcule le coût total $\\text{CT}(${exercice.xLecture})$ (en milliers d'euros).`;
}
export function texteAideLectureC1(exercice: ExerciceScenarioC): string {
  return `$\\text{CT}(x) = \\text{CF} + \\text{CV}(x) + \\text{CP}(x)$ : additionne le coût fixe et les deux coûts de la ligne $x = ${exercice.xLecture}$ du tableau.`;
}

export function consigneCoutMoyenC(exercice: ExerciceScenarioC): string {
  return `Calcule le coût moyen par unité $\\text{CM} = \\dfrac{\\text{CT}(${exercice.xLecture})}{${exercice.xLecture}}$, exprimé en euros (le tableau est en milliers d'euros).`;
}
export const TEXTE_AIDE_COUT_MOYEN_C_1 = "$\\text{CT}$ est en milliers d'euros : multiplie-le par $1\\,000$ pour l'exprimer en euros, puis divise par $x$.";

export const CONSIGNE_RECONNAISSANCE_C =
  "D'après l'allure des courbes de $\\text{CV}$ et de $\\text{CP}$, et la ligne $x = 1$ du tableau, donne les expressions de $\\text{CV}(x)$ et de $\\text{CP}(x)$.";
function descriptionAllureCV(formeCV: FormeCoutVariableC): string {
  switch (formeCV) {
    case "racineCarree":
      return "l'allure d'une racine carrée (croissance qui ralentit) : $\\text{CV}(x) = k\\sqrt{x}$";
    case "racineCubique":
      return "l'allure d'une racine cubique (croissance encore plus lente) : $\\text{CV}(x) = k\\sqrt[3]{x}$";
    case "carre":
      return "l'allure d'une parabole (croissance de plus en plus rapide) : $\\text{CV}(x) = kx^2$";
    case "cube":
      return "l'allure d'une cubique (croissance très rapide) : $\\text{CV}(x) = kx^3$";
  }
}
export function texteAideReconnaissanceC1(exercice: ExerciceScenarioC): string {
  return `$\\text{CV}$ a ${descriptionAllureCV(exercice.formeCV)}. $\\text{CP}$ est une droite passant par l'origine : $\\text{CP}(x) = mx$. La ligne $x = 1$ du tableau donne $k$ et $m$.`;
}

export function consigneBeneficeC(exercice: ExerciceScenarioC): string {
  return `À l'aide du tableau, calcule le bénéfice réalisé pour $x = ${exercice.xBenefice}$ (bénéfice $= \\text{CA} - \\text{CT}$), en milliers d'euros.`;
}
export const TEXTE_AIDE_BENEFICE_C_1 =
  "Bénéfice $= \\text{CA}(x) - \\text{CT}(x)$, avec $\\text{CT}(x) = \\text{CF} + \\text{CV}(x) + \\text{CP}(x)$. Un résultat négatif signale une perte : vérifie le signe.";

export const CONSIGNE_SEUIL_C = "Lis sur le graphique à partir de quelle quantité $x$ l'entreprise devient rentable ($\\text{CA}(x) = \\text{CT}(x)$) — elle tombe sur une ligne de la grille.";
export const TEXTE_AIDE_SEUIL_C_1 = "Le seuil de rentabilité est l'abscisse du point où la courbe de $\\text{CA}$ (rose) croise celle de $\\text{CT}$ (verte).";

// ============================================================================
// Réponses ATTENDUES par écran — réutilisées telles quelles par le récapitulatif
// (`ui5e/recapitulatifProblemesContexte.ts`). Un fragment KaTeX par item, jamais de prose en mode
// math.
// ============================================================================

// --- Scénario A ---

export function formatTermesTableauA(exercice: ExerciceScenarioAConteneur): string[] {
  return exercice.lignesTableau.map(
    (l) => `r=${l.r}\\,:\\ h\\approx${arrondi(l.hAttendu, 0)}\\,;\\ A_{\\text{bases}}\\approx${arrondi(l.aireBasesAttendue, 0)}\\,;\\ A_{\\text{lat}}\\approx${arrondi(l.aireLateraleAttendue, 0)}`,
  );
}

export function formatTermesFormulesGeneralisationA(): string[] {
  return ["h(x)=\\dfrac{V}{\\pi x^2}", "f(x)=\\dfrac{2V}{x}", "g(x)=2\\pi x^2"];
}

export function formatTermeXEgaliteAiresA(exercice: ExerciceScenarioAConteneur): string {
  return `x\\approx${arrondi(exercice.xEgaliteAires, 0)}`;
}

export function formatTermeXOptimalA(exercice: ExerciceScenarioAConteneur): string {
  return `x=${arrondi(exercice.xOptimal, 0)}`;
}

/** Réponse attendue de l'écran "justification" — dérivée du rayon RETENU par continuité (« = » si
 * la hauteur est entière, ce qui est le cas au rayon optimal). */
export function formatTermeHJustificationA(exercice: ExerciceScenarioAConteneur, xOptimalRetenu: number): string {
  const h = hauteurCylindre(exercice.volumeCm3, xOptimalRetenu);
  return `h${Math.abs(h - Math.round(h)) < 1e-9 ? "=" : "\\approx"}${arrondi(h, 0)}`;
}

// --- Scénario B ---

/** Réponse attendue de l'écran "systeme" — les 2 équations `cu·x = F(x)`, coefficients EXACTS. */
export function formatTermesSystemeBLatex(exercice: ExerciceScenarioB): string[] {
  const { modele, point1: p1, point2: p2 } = exercice;
  const equation = (p: { x: number; coutUnitaire: number }) =>
    `${nombreLatex(p.coutUnitaire)}\\times ${p.x} = ${termeInconnueLatex(modele, p.x, "a")}+${termeInconnueLatex(modele, p.x, "b")}`;
  return [equation(p1), equation(p2)];
}

/** a, b (attendus ou RETENUS par continuité). */
export function formatTermeABLatex(a: number, b: number): string {
  const terme = (v: number) => (Number.isInteger(v) ? `=${v}` : `\\approx${nombreLatex(v)}`);
  return `a${terme(a)}\\,;\\,b${terme(b)}`;
}

/** Réponse attendue de l'écran "formule" — générique sur a/b (retenus ou attendus). */
export function formatTermeFormuleBLatex(a: number, b: number, modele: ModeleCoutUnitaire): string {
  // Coefficient 1 devant x omis (« x^2 + 22 », jamais « 1x^2 ») — corrigé détaillé, 5e ch. 1.
  const aA = nombreLatex(a);
  const aX = a === 1 ? "" : aA;
  const bX = b === 1 ? "" : nombreLatex(b);
  const bA = nombreLatex(b);
  switch (modele) {
    case "B1":
      return `f(x)=${aX}x+${bA}`;
    case "B2":
      return `f(x)=${aX}x+${bX}x^2`;
    case "B3":
      return `f(x)=${aX}x+\\dfrac{${bA}}{x}`;
    case "B4":
      return `f(x)=${aA}+\\dfrac{${bA}}{x}`;
    case "B5":
      return `f(x)=${aX}x^2+${bA}`;
  }
}

/** Réponse attendue de l'écran "evaluation" — f(xEval1), f(xEval2), depuis a/b RETENUS. */
export function formatTermesEvaluationBLatex(exercice: ExerciceScenarioB, aRetenu: number, bRetenu: number): string[] {
  const f1 = coutTotalTheorique(exercice.modele, aRetenu, bRetenu, exercice.xEval1);
  const f2 = coutTotalTheorique(exercice.modele, aRetenu, bRetenu, exercice.xEval2);
  // « = » quand la valeur est entière (exacte), « ≈ » seulement pour un arrondi (corrigé détaillé, 5e ch. 1).
  const rel = (v: number) => (Math.abs(v - Math.round(v)) < 1e-9 ? "=" : "\\approx");
  return [`f(${exercice.xEval1})${rel(f1)}${nombreLatex(f1, 0)}`, `f(${exercice.xEval2})${rel(f2)}${nombreLatex(f2, 0)}`];
}

// --- Scénario C ---

function ligneTableau(exercice: ExerciceScenarioC, x: number) {
  const ligne = exercice.tableau.find((l) => l.x === x);
  if (!ligne) throw new Error(`formatProblemesContexte : x=${x} absent du tableau du scénario C`);
  return ligne;
}

function coutTotalTableau(exercice: ExerciceScenarioC, x: number): number {
  const l = ligneTableau(exercice, x);
  return arrondi(exercice.cf + l.cv + l.cp, 2);
}

function formuleCVLatex(formeCV: FormeCoutVariableC, k: number): string {
  const kL = k === 1 ? "" : nombreLatex(k);
  switch (formeCV) {
    case "racineCarree":
      return `${kL}\\sqrt{x}`;
    case "racineCubique":
      return `${kL}\\sqrt[3]{x}`;
    case "carre":
      return `${kL}x^2`;
    case "cube":
      return `${kL}x^3`;
  }
}

/** Réponse attendue de l'écran "lecture" — CT(xLecture) à partir du tableau. */
export function formatTermesLectureC(exercice: ExerciceScenarioC): string[] {
  const x = exercice.xLecture;
  const l = ligneTableau(exercice, x);
  return [`\\text{CT}(${x})=${nombreLatex(exercice.cf)}+${nombreLatex(l.cv)}+${nombreLatex(l.cp)}=${nombreLatex(coutTotalTableau(exercice, x))}`];
}

/** Réponse attendue de l'écran "coutMoyen" (CT en milliers d'euros, CM en euros). */
export function formatTermeCoutMoyenC(exercice: ExerciceScenarioC): string {
  const ct = coutTotalTableau(exercice, exercice.xLecture);
  const cm = (ct * 1000) / exercice.xLecture;
  const exact = Math.abs(cm * 100 - Math.round(cm * 100)) < 1e-6;
  return `\\text{CM}=\\dfrac{${nombreLatex(ct)}\\times 1\\,000}{${exercice.xLecture}}${exact ? "=" : "\\approx"}${nombreLatex(cm)}\\text{ €}`;
}

export function formatTermesReconnaissanceC(exercice: ExerciceScenarioC): string[] {
  return [`\\text{CV}(x)=${formuleCVLatex(exercice.formeCV, exercice.k)}`, `\\text{CP}(x)=${exercice.m === 1 ? "" : exercice.m}x`];
}

/** Réponse attendue de l'écran "benefice" — CA − CT à xBenefice, à partir du tableau. */
export function formatTermeBeneficeC(exercice: ExerciceScenarioC): string {
  const x = exercice.xBenefice;
  const ca = ligneTableau(exercice, x).ca;
  const ct = coutTotalTableau(exercice, x);
  return `\\text{CA}(${x})-\\text{CT}(${x})=${nombreLatex(ca)}-${nombreLatex(ct)}=${nombreLatex(ca - ct)}`;
}

/** Seuil construit ENTIER (audit 5e ch. 1, G12) : lu sur une ligne de la grille, « = ». */
export function formatTermeSeuilC(exercice: ExerciceScenarioC): string {
  return Number.isInteger(exercice.xSeuil) ? `x=${exercice.xSeuil}` : `x\\approx${nombreLatex(exercice.xSeuil, 1)}`;
}
