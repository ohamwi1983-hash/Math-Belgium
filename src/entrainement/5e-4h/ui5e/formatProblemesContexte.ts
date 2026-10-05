/**
 * Couche présentation (5e) — consignes/labels/textes d'aide pour les 14 écrans de 5gen5
 * ("Problèmes-contexte", 3 scénarios A/B/C). Peut importer `src/generateurs5e/` (règle
 * d'architecture : seule `src/moteur5e/` ne le peut jamais).
 */
import type { ExerciceScenarioA, ExerciceScenarioAConteneur, ExerciceScenarioB, ExerciceScenarioC, FormeCoutVariableC, ModeleCoutUnitaire } from "../core5e/problemesContexte.types";
import { hauteurCylindre } from "../generateurs5e/problemesContexte/scenarioA";
import { coeffA, coeffB, coutTotalTheorique } from "../generateurs5e/problemesContexte/scenarioB";
import { benefice, coutProportionnel, coutTotal, coutVariable } from "../generateurs5e/problemesContexte/scenarioC";

function arrondi(valeur: number, decimales = 2): number {
  const facteur = 10 ** decimales;
  return Math.round(valeur * facteur) / facteur;
}

// ============================================================================
// Scénario A — Bidons cylindriques
// ============================================================================

export function consigneVolumeA(exercice: ExerciceScenarioAConteneur): string {
  return `Un bidon cylindrique de rayon r et de hauteur h a une contenance fixée à V = ${exercice.volumeCm3} cm³ (V = πr²h).`;
}

export const CONSIGNE_TABLEAU_A = "Pour chaque rayon donné, calcule la hauteur h, l'aire des 2 bases et l'aire latérale du bidon (arrondis à l'unité).";
export const TEXTE_AIDE_TABLEAU_A_1 = "Isole d'abord h à partir de V=πr²h : h = V/(πr²) — jamais l'inverse.";
export const TEXTE_AIDE_TABLEAU_A_2 = "Aire des 2 bases = 2πr². Aire latérale = 2πr·h (périmètre du cercle × hauteur).";

export const CONSIGNE_GENERALISATION_A = "Généralise en fonction de x=r (le rayon) : écris h(x), f(x)=aire latérale et g(x)=aire des bases — garde V comme paramètre, ne le remplace pas par sa valeur numérique.";
export const TEXTE_AIDE_GENERALISATION_A_1 = "Reprends exactement les formules de l'écran précédent, mais avec x à la place d'un rayon donné.";
/** Aide niveau 2 (D.1, `promptcorrectionsround2.md`) — RÉÉCRITE en 3 blocs distincts h/f/g, chacun
 * rappelant la RELATION/formule à utiliser SANS la calculer jusqu'au bout (contrairement à
 * l'ancienne version, qui donnait directement h(x)=V/(πx²) et f(x)=2V/x — soit très exactement la
 * réponse attendue de l'écran, un niveau 2 qui révélait la solution plutôt que de guider).
 * L'élève doit encore isoler h(x) à partir de la relation de définition, puis substituer h(x) dans
 * l'aire latérale et simplifier — seul g(x) est déjà une formule directe (aucune substitution
 * n'intervient dans son calcul, rien à cacher de plus). */
export function latexAideGeneralisationA2H(): string {
  return "V=\\pi x^2\\cdot h(x) \\quad \\text{(isole h(x))}";
}
export function latexAideGeneralisationA2F(): string {
  return "f(x)=2\\pi x\\cdot h(x) \\quad \\text{(périmètre × hauteur, substitue h(x) puis simplifie)}";
}
export function latexAideGeneralisationA2G(): string {
  return "g(x)=2\\times\\pi x^2 \\quad \\text{(2 fois l'aire d'un cercle de rayon x)}";
}

export const CONSIGNE_EGALITE_AIRES_A = "Pour quelle valeur de x l'aire latérale est-elle égale à l'aire des bases (f(x)=g(x)) ? (arrondis à l'unité)";
export const TEXTE_AIDE_EGALITE_AIRES_A_1 = "Pose f(x)=g(x), simplifie, tu obtiens une équation du type x³=constante.";
export function latexAideEgaliteAiresA2(exercice: ExerciceScenarioAConteneur): string {
  return `x^3 = \\dfrac{V}{\\pi} = \\dfrac{${exercice.volumeCm3}}{\\pi} \\approx ${arrondi(exercice.volumeCm3 / Math.PI, 1)}`;
}

export const CONSIGNE_GRAPHIQUE_A = "Sur le graphique ci-dessous, estime le rayon x qui minimise (f+g)(x), la quantité totale de matériau utilisé (arrondis à l'unité).";
export const TEXTE_AIDE_GRAPHIQUE_A_1 = "Cherche le point le plus bas de la courbe verte (f+g)(x) — c'est là que la quantité de matériau est minimale.";

/** Consigne (D.1) — ne demande plus qu'un calcul de h, la justification écrite libre a été retirée
 * entièrement (voir `EtapeJustificationA.tsx`) : le raisonnement algébrique est désormais fourni
 * directement par `texteCorrectionJustificationA` après soumission, jamais rédigé par l'élève. */
export function consigneJustificationA(): string {
  return "Calcule la hauteur h au rayon optimal que tu as lu au graphique (arrondis à l'unité).";
}
export const TEXTE_AIDE_JUSTIFICATION_A_1 = "Réutilise la formule h(x)=V/(πx²) avec le x que tu as lu au graphique précédent.";
export function texteCorrectionJustificationA(exercice: ExerciceScenarioAConteneur, xOptimalRetenu: number): string {
  const diametre = arrondi(2 * xOptimalRetenu, 0);
  const h = arrondi(exercice.volumeCm3 / (Math.PI * xOptimalRetenu * xOptimalRetenu), 0);
  return `Correction de référence : au rayon optimal x≈${arrondi(xOptimalRetenu, 0)} cm, la hauteur vaut h≈${h} cm et le diamètre vaut 2x≈${diametre} cm — les deux coïncident. On peut le montrer algébriquement : au minimum de (f+g), x³=V/(2π), donc V=2πx³ ; en substituant dans h(x)=V/(πx²), on obtient h(x)=2πx³/(πx²)=2x, exactement le diamètre — et ce quel que soit V.`;
}

// ============================================================================
// Scénario A, combos réduits (2-5) — généralisation → intersection → extremum. Formules f/g
// GÉNÉRIQUES sur les 4 combos via `exercice.combo` (jamais 4 blocs de texte dupliqués).
// ============================================================================

type ExerciceScenarioAReduit = Exclude<ExerciceScenarioA, { combo: "kInverseXAxCarre" }>;

export function consigneContexteAReduit(exercice: ExerciceScenarioAReduit): string {
  return exercice.contexte.intro;
}

/** Coefficient CONSTANT (jamais simplifié — un "1" isolé reste "1", ex. le terme additif d'un
 * polynôme, ou le numérateur d'une fraction k/x). */
function coeffLatex(valeur: number): string {
  const a = arrondi(valeur, 2);
  return a < 0 ? `(${a})` : `${a}`;
}

/** Coefficient MULTIPLICATEUR d'une variable (x, x², √x) — 1/-1 omis (convention transversale,
 * CLAUDE.md : "jamais de coefficient non simplifié à l'écran"), ex. "x" et non "1x". Réservé aux
 * cas où le signe est déjà porté par le contexte (ex. gabarit "b-ax", a toujours positif) — sinon
 * préférer `termeMultLatex`, qui porte SON PROPRE signe (évite un "+-x"/"+(-3)x" en cas de
 * coefficient négatif juxtaposé à un "+" littéral de gabarit). */
function coeffMultLatex(valeur: number): string {
  const a = arrondi(valeur, 2);
  if (a === 1) return "";
  if (a === -1) return "-";
  return a < 0 ? `(${a})` : `${a}`;
}

/** Terme "signe + coefficient + variable" — le signe fait partie du terme, jamais d'un "+" de
 * gabarit séparé (voir `coeffMultLatex`). `variable=""` pour un terme constant. */
function termeMultLatex(valeur: number, variable: string): string {
  const a = arrondi(valeur, 2);
  const abs = Math.abs(a);
  const coeffTxt = abs === 1 && variable !== "" ? "" : `${abs}`;
  return a < 0 ? `-${coeffTxt}${variable}` : `+${coeffTxt}${variable}`;
}

/** Formule concrète (nombres réels substitués) de f(x)/g(x), par combo — réponse attendue de
 * l'écran "generalisationSimple", réutilisée telle quelle par le récapitulatif final. */
export function formatTermesFormulesGeneralisationSimpleA(exercice: ExerciceScenarioAReduit): string[] {
  switch (exercice.combo) {
    case "stockCommande":
      return [`f(x)=${coeffMultLatex(exercice.a)}x+${coeffLatex(exercice.b)}`, `g(x)=\\dfrac{${coeffLatex(exercice.k)}}{x}`];
    case "racineAffine":
      return [`f(x)=${coeffMultLatex(exercice.k)}\\sqrt{x}`, `g(x)=${coeffLatex(exercice.b)}-${coeffMultLatex(exercice.a)}x`];
    case "intensiteCable":
      return [`f(x)=\\dfrac{${coeffLatex(exercice.k)}}{x^2}`, `g(x)=${coeffMultLatex(exercice.a)}x`];
    case "deuxParaboles":
      return [
        `f(x)=${coeffMultLatex(exercice.a1)}x^2${termeMultLatex(exercice.b1, "x")}${termeMultLatex(exercice.c1, "")}`,
        `g(x)=${coeffMultLatex(exercice.a2)}x^2${termeMultLatex(exercice.b2, "x")}${termeMultLatex(exercice.c2, "")}`,
      ];
  }
}

export function consigneGeneralisationSimpleA(exercice: ExerciceScenarioAReduit): string {
  return `Écris les expressions de f(x) (${exercice.contexte.labelF}) et g(x) (${exercice.contexte.labelG}) en fonction de x.`;
}

function texteAideFormeA(exercice: ExerciceScenarioAReduit): string {
  switch (exercice.combo) {
    case "stockCommande":
      return "f(x) est de la forme ax+b (affine, croissante). g(x) est de la forme k/x (décroissante).";
    case "racineAffine":
      return "f(x) est de la forme k√x (croissante). g(x) est de la forme b-ax (affine, décroissante).";
    case "intensiteCable":
      return "f(x) est de la forme k/x² (décroissante). g(x) est de la forme ax (affine, croissante).";
    case "deuxParaboles":
      return "f(x) et g(x) sont toutes deux de la forme ax²+bx+c (une parabole).";
  }
}
export function texteAideGeneralisationSimpleA1(exercice: ExerciceScenarioAReduit): string {
  return texteAideFormeA(exercice);
}

export function consigneIntersectionSimpleA(): string {
  return "Résous f(x)=g(x) pour trouver x (arrondis à l'unité).";
}
export const TEXTE_AIDE_INTERSECTION_SIMPLE_A_1 = "Pose f(x)=g(x), remplace f et g par les formules de l'écran précédent, puis isole x.";

export function formatTermeIntersectionSimpleA(exercice: ExerciceScenarioAReduit): string {
  return `x\\approx${arrondi(exercice.xIntersection, 0)} \\ \\text{(intersection)}`;
}

/** true = (f+g) admet un MAXIMUM (combo `racineAffine`, seul cas concave) ; false = un MINIMUM
 * (3 autres combos, tous convexes). */
function estUnMaximum(exercice: ExerciceScenarioAReduit): boolean {
  return exercice.combo === "racineAffine";
}

export function consigneExtremumSimpleA(exercice: ExerciceScenarioAReduit): string {
  const mot = estUnMaximum(exercice) ? "maximise" : "minimise";
  return `Sur le graphique ci-dessous, estime le x qui ${mot} (f+g)(x) (arrondis à l'unité).`;
}
export function texteAideExtremumSimpleA1(exercice: ExerciceScenarioAReduit): string {
  const mot = estUnMaximum(exercice) ? "le plus haut" : "le plus bas";
  return `Cherche le point ${mot} de la courbe verte (f+g)(x).`;
}

export function formatTermeExtremumSimpleA(exercice: ExerciceScenarioAReduit): string {
  return `x\\approx${arrondi(exercice.xExtremum, 0)} \\ \\text{(extremum)}`;
}

export type PhaseEtatActuelAReduit = "intersectionSimple" | "extremumSimple";

/** Bloc "état actuel" des combos réduits — accumule formules f/g confirmées → x d'intersection
 * confirmé. Jamais appelée pour l'écran "generalisationSimple" (premier du flux, rien à
 * récapituler avant lui). */
export function formatTermesEtatActuelAReduit(exercice: ExerciceScenarioAReduit, phase: PhaseEtatActuelAReduit): string[] {
  const termes = [...formatTermesFormulesGeneralisationSimpleA(exercice)];
  if (phase === "intersectionSimple") return termes;
  termes.push(formatTermeIntersectionSimpleA(exercice));
  return termes;
}

// ============================================================================
// Scénario B — Coût unitaire de production (5 modèles B1-B5)
// ============================================================================

/** Forme symbolique de F(x)=a·coeffA(x)+b·coeffB(x) (coût TOTAL), par modèle — cohérente avec
 * `generateurs5e/problemesContexte/scenarioB.ts::coeffA/coeffB`. Note : B2 s'écrit ici `ax+bx²`
 * plutôt que la forme `ax²+bx` de la demande d'origine — même polynôme, juste un choix de
 * ré-étiquetage cosmétique de "a"/"b" pour rester mécaniquement dérivé de cu(x)=a+bx·x, sans
 * incidence sur la vérification (échantillonnage numérique, jamais une comparaison de chaîne). */
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

/** Prose SEULE (aucun LaTeX) — le rappel de la formule cu(x) est un fragment KaTeX séparé,
 * `latexFormuleCuB`, à rendre via `<Katex>` (jamais interpolé dans cette phrase — voir
 * `BlocContexteB.tsx`, qui compose les deux). */
export function consigneContexteBIntro(exercice: ExerciceScenarioB): string {
  return `Pour ${exercice.contexte.sujet}, le coût unitaire (par unité produite) suit la loi cu(x) donnée ci-dessous.`;
}

/** Fragment PUR LaTeX (jamais de mot de prose française à l'intérieur) — "cu(x)=..." du modèle. */
export function latexFormuleCuB(modele: ModeleCoutUnitaire): string {
  return `\\text{cu}(x)=${formuleCuSymbolique(modele)}`;
}

/** Prose SEULE — 2e moitié de l'ancien `consigneContexteB` (relevé de mesures, aucune formule). */
export function consigneContexteBReleve(exercice: ExerciceScenarioB): string {
  const { contexte, point1, point2 } = exercice;
  return `Un relevé donne : pour x=${point1.x} ${contexte.unite}, le coût unitaire est ${point1.coutUnitaire} € ; pour x=${point2.x} ${contexte.unite}, il est de ${point2.coutUnitaire} €.`;
}

/** Fragment PUR LaTeX — coût TOTAL cu(x)·x, partagé par `consigneSystemeB` (consigne principale de
 * l'écran "systeme") et `texteAideSystemeB1` (aide niveau 1) : même rappel affiché aux 2 endroits,
 * jamais réécrit en dur dans chaque texte de prose. */
export function latexCoutTotalB(modele: ModeleCoutUnitaire): string {
  return `\\text{cu}(x)\\times x=${formuleFSymbolique(modele)}`;
}

export function consigneSystemeB(): string {
  return "Construis les 2 équations reliant a et b à partir des 2 points donnés. Rappel : le coût TOTAL vaut cu(x)·x, donné par la formule ci-dessous.";
}
export function texteAideSystemeB1(): string {
  return "N'oublie pas de multiplier le coût unitaire par x avant de poser l'équation — c'est le coût TOTAL, pas le coût unitaire, qui vaut la formule ci-dessous.";
}
function coeffTermeLatex(coeff: number, variable: "a" | "b"): string {
  return coeff === 1 ? variable : `${variable}\\times ${arrondi(coeff, 3)}`;
}
export function latexAideSystemeB2(exercice: ExerciceScenarioB): string {
  const { modele, point1: p1, point2: p2 } = exercice;
  const equation = (p: { x: number; coutUnitaire: number }) => `${p.coutUnitaire}\\times ${p.x} = ${coeffTermeLatex(coeffA(modele, p.x), "a")}+${coeffTermeLatex(coeffB(modele, p.x), "b")}`;
  return `${equation(p1)} \\quad ${equation(p2)}`;
}

export const CONSIGNE_RESOLUTION_B = "Résous ce système pour trouver a et b (arrondis à l'entier).";
export const TEXTE_AIDE_RESOLUTION_B_1 = "Combine les 2 équations pour éliminer une inconnue (multiplie-les si besoin pour aligner les coefficients), puis substitue pour trouver l'autre.";

export const CONSIGNE_FORMULE_B = "Écris la fonction f(x) donnant le coût total de production, avec les valeurs de a et b (arrondies) que tu viens de trouver.";
export function texteAideFormuleB1(): string {
  return "Remplace a et b par TES valeurs de l'écran précédent dans la formule ci-dessous.";
}
/** Fragment PUR LaTeX — "f(x)=..." du modèle, à côté de `texteAideFormuleB1` (aide niveau 1 de
 * l'écran "formule"). */
export function latexFormuleFB(modele: ModeleCoutUnitaire): string {
  return `f(x)=${formuleFSymbolique(modele)}`;
}

export function consigneEvaluationB(exercice: ExerciceScenarioB): string {
  return `Calcule le coût total de production pour x=${exercice.xEval1} puis pour x=${exercice.xEval2} (arrondis à l'entier).`;
}
export const TEXTE_AIDE_EVALUATION_B_1 = "Remplace x par la valeur demandée dans ta formule f(x) de l'écran précédent.";

// ============================================================================
// Scénario C — Coûts d'une entreprise
// ============================================================================

export function consigneContexteC(): string {
  return "Une entreprise a un coût fixe CF, un coût variable CV(x) et un coût proportionnel CP(x) (x = quantité produite). Le coût total est CT(x)=CF+CV(x)+CP(x). Toutes les valeurs du graphique sont en MILLIERS d'euros.";
}

export function consigneLectureC(exercice: ExerciceScenarioC): string {
  return `Sur le graphique, lis CF, CV(${exercice.xLecture}) et CP(${exercice.xLecture}), puis calcule CT(${exercice.xLecture}) = CF+CV(${exercice.xLecture})+CP(${exercice.xLecture}).`;
}
export const TEXTE_AIDE_LECTURE_C_1 = "CF est la courbe constante (grise) — sa valeur ne dépend pas de x. Attention à ne pas confondre les courbes CV et CP, d'allure proche.";

export function consigneCoutMoyenC(exercice: ExerciceScenarioC): string {
  return `Calcule le coût moyen CM = CT(${exercice.xLecture})/${exercice.xLecture}, exprimé en EUROS (les données du graphique sont en milliers d'euros).`;
}
export const TEXTE_AIDE_COUT_MOYEN_C_1 = "CT est en milliers d'euros — multiplie par 1000 pour l'exprimer en euros AVANT de diviser par x.";

export const CONSIGNE_RECONNAISSANCE_C = "D'après l'allure de leur courbe, donne les expressions algébriques de CV(x) et de CP(x) (en fonction de x).";
function descriptionAllureCV(formeCV: FormeCoutVariableC): string {
  switch (formeCV) {
    case "racineCarree":
      return "l'allure d'une racine carrée (croissance qui ralentit) : CV(x)=k√x";
    case "racineCubique":
      return "l'allure d'une racine cubique (croissance encore plus lente) : CV(x)=k∛x";
    case "carre":
      return "l'allure d'une parabole (croissance de plus en plus rapide) : CV(x)=kx²";
    case "cube":
      return "l'allure d'une cubique (croissance très rapide) : CV(x)=kx³";
  }
}
export function texteAideReconnaissanceC1(exercice: ExerciceScenarioC): string {
  return `CV a ${descriptionAllureCV(exercice.formeCV)}. CP est une droite passant par l'origine : CP(x)=mx.`;
}

export function consigneBeneficeC(exercice: ExerciceScenarioC): string {
  return `Calcule le bénéfice réalisé pour une production de x=${exercice.xBenefice} unités (bénéfice = chiffre d'affaires CA − coût total CT), arrondi à l'unité.`;
}
export const TEXTE_AIDE_BENEFICE_C_1 = "Bénéfice = CA(x) − CT(x). Un résultat négatif signale une PERTE, pas un bénéfice — vérifie le signe.";

export const CONSIGNE_SEUIL_C = "À partir de quelle quantité x l'entreprise devient-elle rentable (CA(x)=CT(x)) ? Réponds par lecture graphique ou par résolution algébrique (arrondis à l'unité).";
export const TEXTE_AIDE_SEUIL_C_1 = "Le seuil de rentabilité est l'abscisse du point où la courbe CA (rouge) croise la courbe CT (verte).";

// ============================================================================
// Bloc "état actuel" (accumule au fil des écrans, dérivé PUREMENT de l'exercice — jamais de la
// saisie brute de l'élève, même principe que 5gen1 —
// `ui5e/formatDomaineDefinition.ts::formatTermesEtatActuelCELatex`) + réponses ATTENDUES par écran,
// réutilisées telles quelles par le récapitulatif final (`ResultatPanelProblemeContexte.tsx`).
// Rendu "bloc fitter" partout (un fragment KaTeX par item), jamais un unique bloc `\quad`-joint non
// wrappable (KaTeX rend en `white-space: nowrap` interne à chaque fragment).
// ============================================================================

// --- Scénario A ---

/** Réponse attendue de l'écran "tableau" — un fragment par ligne (r, h, aires). Réutilisée à la
 * fois comme réponse attendue (récapitulatif) et comme bloc "état actuel" des écrans suivants. */
export function formatTermesTableauA(exercice: ExerciceScenarioAConteneur): string[] {
  return exercice.lignesTableau.map(
    (l) =>
      `r=${l.r}\\,:\\ h\\approx${arrondi(l.hAttendu, 0)}\\,;\\ \\text{aire bases}\\approx${arrondi(l.aireBasesAttendue, 0)}\\,;\\ \\text{aire lat.}\\approx${arrondi(l.aireLateraleAttendue, 0)}`,
  );
}

/** Réponse attendue de l'écran "generalisation" — h(x)/f(x)/g(x), V gardé comme paramètre
 * symbolique (jamais substitué par sa valeur numérique). */
export function formatTermesFormulesGeneralisationA(): string[] {
  return ["h(x)=\\dfrac{V}{\\pi x^2}", "f(x)=\\dfrac{2V}{x}", "g(x)=2\\pi x^2"];
}

/** Réponse attendue de l'écran "egaliteAires". */
export function formatTermeXEgaliteAiresA(exercice: ExerciceScenarioAConteneur): string {
  return `x\\approx${arrondi(exercice.xEgaliteAires, 0)} \\ \\text{(aires égales)}`;
}

/** Réponse attendue de l'écran "graphique" (lecture graphique, tolérance large — jamais un calcul
 * exact demandé à l'élève). */
export function formatTermeXOptimalA(exercice: ExerciceScenarioAConteneur): string {
  return `x\\approx${arrondi(exercice.xOptimal, 0)} \\ \\text{(rayon optimal)}`;
}

function formatTermeXOptimalRetenuA(xOptimalRetenu: number): string {
  return `x\\approx${arrondi(xOptimalRetenu, 0)} \\ \\text{(rayon optimal retenu)}`;
}

/** Réponse attendue de l'écran "justification" (le seul champ vérifié automatiquement, h — la
 * justification textuelle elle-même n'est jamais vérifiée, spec explicite) — dérivée du rayon
 * RETENU par continuité (voir `moteur5e/sessionProblemesContexte.ts`), jamais recalculée depuis
 * `exercice.xOptimal` directement. */
export function formatTermeHJustificationA(exercice: ExerciceScenarioAConteneur, xOptimalRetenu: number): string {
  return `h\\approx${arrondi(hauteurCylindre(exercice.volumeCm3, xOptimalRetenu), 0)}`;
}

export type PhaseEtatActuelA = "generalisation" | "egaliteAires" | "graphique" | "justification";

/** Bloc "état actuel" du scénario A — accumule au fil des écrans (tableau confirmé → formules
 * généralisées confirmées → x d'égalité des aires confirmé → rayon optimal retenu, jamais
 * `exercice.xOptimal` lui-même sur l'écran "graphique", qui en est justement la réponse). Jamais
 * appelée pour l'écran "tableau" (premier du scénario, rien à récapituler avant lui). */
export function formatTermesEtatActuelA(exercice: ExerciceScenarioAConteneur, phase: PhaseEtatActuelA, xOptimalRetenu: number | null): string[] {
  const termes = [...formatTermesTableauA(exercice)];
  if (phase === "generalisation") return termes;
  termes.push(...formatTermesFormulesGeneralisationA());
  if (phase === "egaliteAires") return termes;
  termes.push(formatTermeXEgaliteAiresA(exercice));
  if (phase === "graphique") return termes;
  if (xOptimalRetenu !== null) termes.push(formatTermeXOptimalRetenuA(xOptimalRetenu));
  return termes;
}

// --- Scénario B ---

/** Réponse attendue de l'écran "systeme" — les 2 équations `cu·x=F(x)` construites à partir des 2
 * points révélés, forme dépendante du modèle (généralisée via `coeffA`/`coeffB`). */
export function formatTermesSystemeBLatex(exercice: ExerciceScenarioB): string[] {
  const { modele, point1: p1, point2: p2 } = exercice;
  const equation = (p: { x: number; coutUnitaire: number }) => `${p.coutUnitaire}\\times ${p.x} = ${coeffTermeLatex(coeffA(modele, p.x), "a")}+${coeffTermeLatex(coeffB(modele, p.x), "b")}`;
  return [equation(p1), equation(p2)];
}

/** Réponse attendue de l'écran "resolution" (a, b arrondis) — fonction GÉNÉRIQUE sur a/b, réutilisée
 * à la fois pour la réponse ATTENDUE du récapitulatif (`exercice.aArrondiAttendu`/`bArrondiAttendu`)
 * et pour l'état actuel des écrans suivants (a/b RETENUS par continuité). */
export function formatTermeABLatex(a: number, b: number): string {
  return `a\\approx${arrondi(a, 0)}\\,;\\,b\\approx${arrondi(b, 0)}`;
}

/** Réponse attendue de l'écran "formule" — même principe, générique sur a/b (retenus ou attendus),
 * forme dépendante du modèle. */
export function formatTermeFormuleBLatex(a: number, b: number, modele: ModeleCoutUnitaire): string {
  const aA = arrondi(a, 0);
  const bA = arrondi(b, 0);
  switch (modele) {
    case "B1":
      return `f(x)=${aA}x+${bA}`;
    case "B2":
      return `f(x)=${aA}x+${bA}x^2`;
    case "B3":
      return `f(x)=${aA}x+\\dfrac{${bA}}{x}`;
    case "B4":
      return `f(x)=${aA}+\\dfrac{${bA}}{x}`;
    case "B5":
      return `f(x)=${aA}x^2+${bA}`;
  }
}

/** Réponse attendue de l'écran "evaluation" — f(xEval1), f(xEval2), depuis a/b RETENUS (continuité),
 * via `coutTotalTheorique` (généralisé aux 5 modèles). */
export function formatTermesEvaluationBLatex(exercice: ExerciceScenarioB, aRetenu: number, bRetenu: number): string[] {
  const f1 = coutTotalTheorique(exercice.modele, aRetenu, bRetenu, exercice.xEval1);
  const f2 = coutTotalTheorique(exercice.modele, aRetenu, bRetenu, exercice.xEval2);
  return [`f(${exercice.xEval1})\\approx${arrondi(f1, 0)}`, `f(${exercice.xEval2})\\approx${arrondi(f2, 0)}`];
}

export type PhaseEtatActuelB = "resolution" | "formule" | "evaluation";

/** Bloc "état actuel" du scénario B — accumule système déjà posé → a/b RETENUS → formule confirmée
 * (jamais depuis `exercice.aArrondiAttendu`/`bArrondiAttendu` directement, toujours les valeurs
 * RETENUES par continuité — voir `moteur5e/sessionProblemesContexte.ts`). */
export function formatTermesEtatActuelB(exercice: ExerciceScenarioB, phase: PhaseEtatActuelB, aRetenu: number | null, bRetenu: number | null): string[] {
  const termes = [...formatTermesSystemeBLatex(exercice)];
  if (phase === "resolution") return termes;
  if (aRetenu !== null && bRetenu !== null) termes.push(formatTermeABLatex(aRetenu, bRetenu));
  if (phase === "formule") return termes;
  if (aRetenu !== null && bRetenu !== null) termes.push(formatTermeFormuleBLatex(aRetenu, bRetenu, exercice.modele));
  return termes;
}

// --- Scénario C ---

function formuleCVLatex(formeCV: FormeCoutVariableC, k: number): string {
  switch (formeCV) {
    case "racineCarree":
      return `${k}\\sqrt{x}`;
    case "racineCubique":
      return `${k}\\sqrt[3]{x}`;
    case "carre":
      return `${k}x^2`;
    case "cube":
      return `${k}x^3`;
  }
}
/** Réponse attendue de l'écran "lecture" — CF, CV(x), CP(x), CT(x) à x=xLecture. */
export function formatTermesLectureC(exercice: ExerciceScenarioC): string[] {
  const x = exercice.xLecture;
  const cv = coutVariable(exercice.formeCV, exercice.k, x);
  const cp = coutProportionnel(exercice.m, x);
  const ct = coutTotal(exercice.cf, exercice.formeCV, exercice.k, exercice.m, x);
  return [
    `\\text{CF}\\approx${arrondi(exercice.cf)}`,
    `\\text{CV}(${x})\\approx${arrondi(cv)}`,
    `\\text{CP}(${x})\\approx${arrondi(cp)}`,
    `\\text{CT}(${x})\\approx${arrondi(ct)}`,
  ];
}

/** Réponse attendue de l'écran "coutMoyen" — piège de conversion d'unité (CT en milliers d'euros,
 * CM en euros). */
export function formatTermeCoutMoyenC(exercice: ExerciceScenarioC): string {
  const ct = coutTotal(exercice.cf, exercice.formeCV, exercice.k, exercice.m, exercice.xLecture);
  const cm = (ct * 1000) / exercice.xLecture;
  return `\\text{CM}\\approx${arrondi(cm)}\\,€`;
}

/** Réponse attendue de l'écran "reconnaissance" — CV(x)/CP(x), forme dépendante de `exercice.formeCV`
 * (CP reste toujours linéaire par définition, voir core5e). */
export function formatTermesReconnaissanceC(exercice: ExerciceScenarioC): string[] {
  return [`\\text{CV}(x)=${formuleCVLatex(exercice.formeCV, exercice.k)}`, `\\text{CP}(x)=${exercice.m}x`];
}

/** Réponse attendue de l'écran "benefice" — bénéfice (ou perte, si négatif) à x=xBenefice. */
export function formatTermeBeneficeC(exercice: ExerciceScenarioC): string {
  const b = benefice(exercice.cf, exercice.formeCV, exercice.k, exercice.m, exercice.formeCA, exercice.p, exercice.xBenefice);
  return `\\text{Bénéfice}(${exercice.xBenefice})\\approx${arrondi(b, 0)}`;
}

/** Réponse attendue de l'écran "seuil" — lecture graphique ou résolution algébrique, tolérance
 * large (jamais un calcul exact demandé à l'élève). */
export function formatTermeSeuilC(exercice: ExerciceScenarioC): string {
  return `x\\approx${arrondi(exercice.xSeuil, 0)} \\ \\text{(seuil de rentabilité)}`;
}

export type PhaseEtatActuelC = "coutMoyen" | "reconnaissance" | "benefice" | "seuil";

/** Bloc "état actuel" du scénario C — accumule CF/CV/CP/CT lus → coût moyen confirmé →
 * reconnaissance CV(x)/CP(x) confirmée → bénéfice confirmé. Jamais appelée pour l'écran "lecture"
 * (premier du scénario, rien à récapituler avant lui). */
export function formatTermesEtatActuelC(exercice: ExerciceScenarioC, phase: PhaseEtatActuelC): string[] {
  const termes = [...formatTermesLectureC(exercice)];
  if (phase === "coutMoyen") return termes;
  termes.push(formatTermeCoutMoyenC(exercice));
  if (phase === "reconnaissance") return termes;
  termes.push(...formatTermesReconnaissanceC(exercice));
  if (phase === "benefice") return termes;
  termes.push(formatTermeBeneficeC(exercice));
  return termes;
}
