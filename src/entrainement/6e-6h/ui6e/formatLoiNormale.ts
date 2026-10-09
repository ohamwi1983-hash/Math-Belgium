import type { CoteDemandeE, ExerciceLoiNormale, ExerciceLoiNormaleA, ExerciceLoiNormaleB, ExerciceLoiNormaleC, ExerciceLoiNormaleD, ExerciceLoiNormaleE, SousTypeLoiNormaleC } from "../core6e/loiNormale.types";
import { probabiliteFinaleA, symetrieNecessaire, valeurATableA } from "../generateurs6e/loiNormale/familleA";
import { effectifEstimeB, probabiliteFinaleB, standardiserB } from "../generateurs6e/loiNormale/familleB";
import { valeurCibleTableC, valeurTC } from "../generateurs6e/loiNormale/familleC";
import { destandardiserD, valeurCibleTableD, valeurZD } from "../generateurs6e/loiNormale/familleD";
import { bornesE, effectifEstimeE, muDepuisBornes, POURCENTAGE_PAR_K, probabiliteFinaleE, sigmaDepuisBornes } from "../generateurs6e/loiNormale/familleE";
import { Phi } from "../generateurs6e/loiNormale/tableNormale";
import type { CalculerReferenceLoiNormale, PhaseLoiNormale, ResultatExerciceLoiNormale } from "../moteur6e/typesLoiNormale";
import { phasesPourExercice } from "../moteur6e/typesLoiNormale";

/**
 * Couche ui (6e) — textes de consigne/aide + formatage LaTeX pour `6gen51`. Dispatch sur
 * `exercice.famille` PUIS `phase`, mirroir `formatFormeTrigonometrique.ts` (6gen37), jamais importé
 * par un autre générateur (chaque générateur reste indépendant — CLAUDE.md).
 *
 * **`calculerReferenceLoiNormale`** — LA fonction qui relie Couche A (`Phi`/`PhiInverse`, ce
 * fichier a le droit d'importer `generateurs6e/loiNormale/`) et Couche B (`moteur6e/
 * verificationLoiNormale.ts`, qui ne le peut jamais) : injectée dans `sessionLoiNormale.ts` comme
 * `calculerReference` (voir en-tête `moteur6e/typesLoiNormale.ts`), et réutilisée ICI pour les
 * mêmes calculs côté "état actuel"/récapitulatif — UNE SEULE implémentation, jamais dupliquée entre
 * la vérification et l'affichage.
 *
 * **Vigilance signe orphelin / groupe LaTeX vide** (bug déjà rencontré et corrigé sur plusieurs
 * générateurs 6e, documenté CLAUDE.md) — `formatDecimal` ci-dessous est la SEULE fonction qui
 * convertit un nombre en LaTeX décimal français dans ce module, elle inclut TOUJOURS le signe dans
 * le même appel `toFixed` (jamais un signe assemblé séparément). Couverture de régression :
 * `formatLoiNormale.test.ts`, scan de nombreux tirages des 5 familles à la recherche de `++`/`+-`/
 * `--`/groupe vide.
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
// Formatage décimal français — voir en-tête de fichier.
// ============================================================================

/** Décimal FRANÇAIS (virgule, `{,}` LaTeX), signe TOUJOURS inclus dans le même appel `toFixed`
 * (jamais de signe orphelin — voir en-tête de fichier). */
export function formatDecimal(v: number, decimales: number): string {
  return v.toFixed(decimales).replace(".", "{,}");
}

// ============================================================================
// Champs "choix" partagés.
// ============================================================================

// Libellés COURTS (jamais de formule entière en suffixe, ex. "(1−Φ(t))") — voir en-tête de
// fichier "signe orphelin / groupe LaTeX vide" pour la convention de fragments COURTS ; même
// raison ici pour du texte de BOUTON pur (jamais du LaTeX) : `.field-inline` place le label du
// champ ET le groupe de boutons sur la MÊME ligne flex (jamais empilés) — un libellé de bouton
// trop long (formule complète en annexe) pousse la largeur combinée au-delà de 375px, débordement
// horizontal trouvé en vérification Playwright (voir `docs/historique-6e.md`). Le détail exact de
// chaque transformation reste disponible via `aideNiveau1`/`aideNiveau2` (jamais perdu, seulement
// déplacé hors du bouton lui-même).
const OPTIONS_SYMETRIE: OptionChoix[] = [
  { valeur: "directe", label: "Lecture directe" },
  { valeur: "symetrie", label: "Symétrie nécessaire" },
];

const OPTIONS_TRANSFORMATION: OptionChoix[] = [
  { valeur: "cumulee", label: "Directe" },
  { valeur: "symetrique", label: "Symétrique" },
  { valeur: "encadree", label: "Encadrée" },
];

// ============================================================================
// calculerReferenceLoiNormale — pont Couche A ↔ Couche B (voir en-tête de fichier).
// ============================================================================

export const calculerReferenceLoiNormale: CalculerReferenceLoiNormale = (exercice, phase) => {
  if (exercice.famille === "A") {
    if (phase === "aEcran2") return { probabiliteFinale: probabiliteFinaleA(exercice) };
    return {};
  }
  if (exercice.famille === "B") {
    if (phase === "bEcran2") return { probabiliteFinale: probabiliteFinaleB(exercice) };
    if (phase === "bEcran3") return { effectifReference: effectifEstimeB(probabiliteFinaleB(exercice), exercice.population as number) };
    return {};
  }
  if (exercice.famille === "C") {
    if (phase === "cEcran1") return { cibleTable: valeurCibleTableC(exercice) };
    if (phase === "cEcran2") return { tReference: valeurTC(exercice) };
    return {};
  }
  if (exercice.famille === "D") {
    if (phase === "dEcran1") return { cibleTable: valeurCibleTableD(exercice) };
    if (phase === "dEcran2") return { zReference: valeurZD(exercice) };
    if (phase === "dEcran3") return { aReference: destandardiserD(exercice, valeurZD(exercice)) };
    return {};
  }
  // Famille E.
  if (phase === "eEcran2") return { probabiliteFinale: probabiliteFinaleE(exercice) };
  if (phase === "eEcran3") return { effectifReference: effectifEstimeE(probabiliteFinaleE(exercice), exercice.population as number) };
  return {};
};

// ============================================================================
// Famille A — Centrée réduite, sens direct.
// ============================================================================

function equationCibleA(e: ExerciceLoiNormaleA): string {
  if (e.sousType === "intervalle") return `P(${formatDecimal(e.z1, 2)}\\le Z\\le ${formatDecimal(e.z2, 2)})=\\,?`;
  return e.sousType === "inferieur" ? `P(Z\\le ${formatDecimal(e.z, 2)})=\\,?` : `P(Z\\ge ${formatDecimal(e.z, 2)})=\\,?`;
}

export function consigneGeneraleA(): string {
  return "Z suit la loi normale centrée réduite N(0,1). Calcule la probabilité demandée à l'aide de la table Φ (fonction de répartition, Φ(t)=P(Z≤t)).";
}
export function blocDonneesA(e: ExerciceLoiNormaleA): string[] {
  return ["Z\\sim\\mathcal{N}(0,1)", equationCibleA(e)];
}
export function consigneEcranA(phase: PhaseLoiNormale): string {
  if (phase === "aEcran1") return "La table Φ ne donne QUE des lectures directes pour une entrée positive. Identifie la transformation nécessaire (directe si la valeur est déjà positive, symétrie sinon) et la valeur positive t à chercher.";
  return "Calcule la probabilité finale demandée, à partir de la ou des lecture(s) CONFIRMÉE(s) de l'étape précédente.";
}
export function etatActuelA(e: ExerciceLoiNormaleA, phase: PhaseLoiNormale): string[] | null {
  if (phase !== "aEcran2") return null;
  if (e.sousType === "intervalle") {
    return [`t_1=${formatDecimal(valeurATableA(e.z1), 2)}\\text{, }t_2=${formatDecimal(valeurATableA(e.z2), 2)}\\text{ (confirmés)}`];
  }
  return [`t=${formatDecimal(valeurATableA(e.z), 2)}\\text{ (confirmé)}`];
}
export function champsA(e: ExerciceLoiNormaleA, phase: PhaseLoiNormale): ChampDef[] {
  if (phase === "aEcran2") return [{ type: "texte", label: "Probabilité =", placeholder: "ex : 0.8413" }];
  if (e.sousType === "intervalle") {
    return [
      { type: "choix", label: "z₁ :", options: OPTIONS_SYMETRIE },
      { type: "texte", label: "t₁ =", placeholder: "ex : 1.23" },
      { type: "choix", label: "z₂ :", options: OPTIONS_SYMETRIE },
      { type: "texte", label: "t₂ =", placeholder: "ex : 0.56" },
    ];
  }
  return [
    { type: "choix", label: "Transformation :", options: OPTIONS_SYMETRIE },
    { type: "texte", label: "t =", placeholder: "ex : 1.23" },
  ];
}
export function niveauAideMaxA(phase: PhaseLoiNormale): number {
  return phase === "aEcran1" ? 2 : 0;
}
export function aideNiveau1A(phase: PhaseLoiNormale): AideAvecLatex {
  if (phase !== "aEcran1") return AUCUNE_AIDE;
  return { texte: "Rappels : Φ(−t)=1−Φ(t) (symétrie) et P(Z≥t)=1−Φ(t). La table ne donne directement que Φ(t) pour t≥0.", latex: null };
}
export function aideNiveau2A(e: ExerciceLoiNormaleA, phase: PhaseLoiNormale): AideAvecLatex {
  if (phase !== "aEcran1") return AUCUNE_AIDE;
  const z = e.sousType === "intervalle" ? e.z1 : e.z;
  const transfo = symetrieNecessaire(z) ? "symétrie nécessaire (valeur de départ négative)" : "lecture directe (valeur de départ déjà positive)";
  return { texte: `Transformation identifiée (valeur finale non isolée) : ${transfo}.`, latex: null };
}

// ============================================================================
// Famille B — Générale N(μ,σ), sens direct + estimation d'effectif.
// ============================================================================

function donneesPopulationB(population: number | undefined): string[] {
  return population === undefined ? [] : [`N=${population}\\text{ (population totale)}`];
}

function equationCibleB(e: ExerciceLoiNormaleB): string {
  if (e.sousType === "intervalle") return `P(${formatDecimal(e.x1, 2)}\\le X\\le ${formatDecimal(e.x2, 2)})=\\,?`;
  return e.sousType === "inferieur" ? `P(X\\le ${formatDecimal(e.x, 2)})=\\,?` : `P(X\\ge ${formatDecimal(e.x, 2)})=\\,?`;
}

export function consigneGeneraleB(): string {
  return "X suit la loi normale N(μ,σ). Standardise puis calcule la probabilité demandée à l'aide de la table Φ.";
}
export function blocDonneesB(e: ExerciceLoiNormaleB): string[] {
  return [`X\\sim\\mathcal{N}(${formatDecimal(e.mu, 2)}\\text{ ; }${formatDecimal(e.sigma, 2)})`, equationCibleB(e), ...donneesPopulationB(e.population)];
}
export function consigneEcranB(phase: PhaseLoiNormale): string {
  if (phase === "bEcran1") return "Standardise chaque borne : z=(x−μ)/σ.";
  if (phase === "bEcran2") return "Calcule la probabilité demandée à partir du/des z CONFIRMÉ(s) (même logique que pour Z centrée réduite).";
  return "Multiplie la probabilité CONFIRMÉE par la taille de la population, puis arrondis à l'entier le plus proche.";
}
/** Ligne(s) confirmée(s) à l'écran 1 (standardisation) — réutilisée(s) par tout écran ultérieur
 * (correctif transversal accumulation, voir CLAUDE.md/`docs/historique-6e.md`). */
function lignesEcran1B(e: ExerciceLoiNormaleB): string[] {
  if (e.sousType === "intervalle") {
    return [`z_1=${formatDecimal(standardiserB(e.x1, e.mu, e.sigma), 2)}\\text{, }z_2=${formatDecimal(standardiserB(e.x2, e.mu, e.sigma), 2)}\\text{ (confirmés, étape 1)}`];
  }
  return [`z=${formatDecimal(standardiserB(e.x, e.mu, e.sigma), 2)}\\text{ (confirmé, étape 1)}`];
}

/** ACCUMULE les écrans déjà confirmés (correctif transversal — voir CLAUDE.md/`docs/historique-
 * 6e.md`, même bug que sur `6gen1`/`6gen58`) : `bEcran3` ne montrait QUE la probabilité de `bEcran2`,
 * jamais le(s) z de `bEcran1`. Plus ancien en premier. */
export function etatActuelB(e: ExerciceLoiNormaleB, phase: PhaseLoiNormale): string[] | null {
  if (phase === "bEcran2") return lignesEcran1B(e);
  if (phase === "bEcran3") return [...lignesEcran1B(e), `P=${formatDecimal(probabiliteFinaleB(e), 4)}\\text{ (confirmée, étape 2)}`];
  return null;
}
export function champsB(e: ExerciceLoiNormaleB, phase: PhaseLoiNormale): ChampDef[] {
  if (phase === "bEcran1") {
    if (e.sousType === "intervalle") return [{ type: "texte", label: "z₁ =", placeholder: "ex : -1.2" }, { type: "texte", label: "z₂ =", placeholder: "ex : 1.2" }];
    return [{ type: "texte", label: "z =", placeholder: "ex : 1.23" }];
  }
  if (phase === "bEcran2") return [{ type: "texte", label: "Probabilité =", placeholder: "ex : 0.8413" }];
  return [{ type: "texte", label: "Effectif estimé =", placeholder: "ex : 683" }];
}
export function niveauAideMaxB(phase: PhaseLoiNormale): number {
  return phase === "bEcran1" ? 2 : 0;
}
export function aideNiveau1B(phase: PhaseLoiNormale): AideAvecLatex {
  if (phase !== "bEcran1") return AUCUNE_AIDE;
  return { texte: "Rappel de la formule de standardisation :", latex: "z=\\frac{x-\\mu}{\\sigma}" };
}
export function aideNiveau2B(e: ExerciceLoiNormaleB, phase: PhaseLoiNormale): AideAvecLatex {
  if (phase !== "bEcran1") return AUCUNE_AIDE;
  return { texte: "μ et σ substitués (division non faite) :", latex: `z=\\frac{x-\\left(${formatDecimal(e.mu, 2)}\\right)}{${formatDecimal(e.sigma, 2)}}` };
}

// ============================================================================
// Famille C — Centrée réduite, sens inverse.
// ============================================================================

function equationCibleDepartC(sousType: SousTypeLoiNormaleC, p: number, k?: number): string {
  if (sousType === "cumulee") return `P(Z\\le t)=${formatDecimal(p, 4)}`;
  if (sousType === "symetrique") return `P(0\\le Z\\le t)=${formatDecimal(p, 4)}`;
  return `P(t\\le Z\\le ${formatDecimal(k as number, 2)})=${formatDecimal(p, 4)}`;
}

export function consigneGeneraleC(): string {
  return "Z suit la loi normale centrée réduite N(0,1). Détermine t à partir de la probabilité donnée, en utilisant la table Φ À L'ENVERS.";
}
export function blocDonneesC(e: ExerciceLoiNormaleC): string[] {
  const donnees = ["Z\\sim\\mathcal{N}(0,1)", equationCibleDepartC(e.sousType, e.p, e.sousType === "encadree" ? e.k : undefined)];
  if (e.sousType === "encadree") donnees.push(`\\Phi(${formatDecimal(e.k, 2)})\\approx ${formatDecimal(Phi(e.k), 4)}\\text{ (donnée)}`);
  return donnees;
}
export function consigneEcranC(phase: PhaseLoiNormale): string {
  if (phase === "cEcran1") return "La table Φ ne donne DIRECTEMENT que Φ(t)=P(Z≤t). Identifie la transformation nécessaire pour adapter la probabilité donnée à cette forme, et calcule la valeur cible.";
  return "Lis la table À L'ENVERS : trouve t tel que Φ(t) égale la valeur cible CONFIRMÉE à l'étape précédente.";
}
export function etatActuelC(e: ExerciceLoiNormaleC, phase: PhaseLoiNormale): string[] | null {
  if (phase !== "cEcran2") return null;
  return [`\\Phi(t)=${formatDecimal(valeurCibleTableC(e), 4)}\\text{ (confirmé)}`];
}
export function champsC(phase: PhaseLoiNormale): ChampDef[] {
  if (phase === "cEcran1") return [{ type: "choix", label: "Transformation :", options: OPTIONS_TRANSFORMATION }, { type: "texte", label: "Φ(t) =", placeholder: "ex : 0.9750" }];
  return [{ type: "texte", label: "t =", placeholder: "ex : 1.96" }];
}
export function niveauAideMaxC(phase: PhaseLoiNormale): number {
  return phase === "cEcran1" ? 2 : 0;
}
export function aideNiveau1C(phase: PhaseLoiNormale): AideAvecLatex {
  if (phase !== "cEcran1") return AUCUNE_AIDE;
  return { texte: "La table ne donne QUE Φ(t)=P(Z≤t) directement — toute autre probabilité doit être reformulée sous cette forme avant lecture.", latex: null };
}
export function aideNiveau2C(e: ExerciceLoiNormaleC, phase: PhaseLoiNormale): AideAvecLatex {
  if (phase !== "cEcran1") return AUCUNE_AIDE;
  if (e.sousType === "cumulee") return { texte: "Relation de conversion (déjà sous la bonne forme) :", latex: `\\Phi(t)=p=${formatDecimal(e.p, 4)}` };
  if (e.sousType === "symetrique") return { texte: "Relation de conversion appliquée en partie (valeur finale non isolée) :", latex: "\\Phi(t)=p+0{,}5" };
  return { texte: "Relation de conversion appliquée en partie (valeur finale non isolée) :", latex: `\\Phi(t)=\\Phi(${formatDecimal(e.k, 2)})-p` };
}

// ============================================================================
// Famille D — Générale, sens inverse.
// ============================================================================

function equationCibleDepartD(e: ExerciceLoiNormaleD): string {
  if (e.sousType === "cumulee") return `P(X\\le a)=${formatDecimal(e.p, 4)}`;
  if (e.sousType === "symetrique") return `P(\\mu\\le X\\le a)=${formatDecimal(e.p, 4)}`;
  return `P(a\\le X\\le ${formatDecimal(e.b, 2)})=${formatDecimal(e.p, 4)}`;
}

export function consigneGeneraleD(): string {
  return "X suit la loi normale N(μ,σ). Détermine a à partir de la probabilité donnée : reformule pour la table, lis à l'envers, puis dé-standardise.";
}
export function blocDonneesD(e: ExerciceLoiNormaleD): string[] {
  const donnees = [`X\\sim\\mathcal{N}(${formatDecimal(e.mu, 2)}\\text{ ; }${formatDecimal(e.sigma, 2)})`, equationCibleDepartD(e)];
  if (e.sousType === "encadree") {
    const zB = standardiserB(e.b, e.mu, e.sigma);
    // Parenthèses OBLIGATOIRES autour de μ : μ peut être négatif, une simple concaténation
    // "b-μ" produirait alors un double signe orphelin "b--μ" (bug de régression déjà rencontré
    // ailleurs sur la plateforme — voir en-tête de fichier, "signe orphelin").
    donnees.push(`\\Phi\\!\\left(\\frac{${formatDecimal(e.b, 2)}-\\left(${formatDecimal(e.mu, 2)}\\right)}{${formatDecimal(e.sigma, 2)}}\\right)\\approx ${formatDecimal(Phi(zB), 4)}\\text{ (donnée)}`);
  }
  return donnees;
}
export function consigneEcranD(phase: PhaseLoiNormale): string {
  if (phase === "dEcran1") return "Comme pour Z centrée réduite : identifie la transformation nécessaire pour adapter la probabilité donnée à une lecture directe de la table, et calcule la valeur cible.";
  if (phase === "dEcran2") return "Lis la table À L'ENVERS : trouve z tel que Φ(z) égale la valeur cible CONFIRMÉE.";
  return "Dé-standardise à partir du z CONFIRMÉ : a=μ+z·σ.";
}
/** ACCUMULE les écrans déjà confirmés (correctif transversal, voir CLAUDE.md/`docs/historique-
 * 6e.md`) : `dEcran3` omettait Φ(z) confirmé à `dEcran1`, ne montrant que z de `dEcran2`. Plus
 * ancien en premier. */
export function etatActuelD(e: ExerciceLoiNormaleD, phase: PhaseLoiNormale): string[] | null {
  if (phase === "dEcran2") return [`\\Phi(z)=${formatDecimal(valeurCibleTableD(e), 4)}\\text{ (confirmé, étape 1)}`];
  if (phase === "dEcran3") return [`\\Phi(z)=${formatDecimal(valeurCibleTableD(e), 4)}\\text{ (confirmé, étape 1)}`, `z=${formatDecimal(valeurZD(e), 2)}\\text{ (confirmé, étape 2)}`];
  return null;
}
export function champsD(phase: PhaseLoiNormale): ChampDef[] {
  if (phase === "dEcran1") return [{ type: "choix", label: "Transformation :", options: OPTIONS_TRANSFORMATION }, { type: "texte", label: "Φ(z) =", placeholder: "ex : 0.9750" }];
  if (phase === "dEcran2") return [{ type: "texte", label: "z =", placeholder: "ex : 1.96" }];
  return [{ type: "texte", label: "a =", placeholder: "ex : 129.4" }];
}
export function niveauAideMaxD(phase: PhaseLoiNormale): number {
  if (phase === "dEcran1") return 2;
  if (phase === "dEcran3") return 2;
  return 0;
}
export function aideNiveau1D(phase: PhaseLoiNormale): AideAvecLatex {
  if (phase === "dEcran1") return { texte: "La table ne donne QUE Φ(z)=P(Z≤z) directement — toute autre probabilité doit être reformulée sous cette forme avant lecture.", latex: null };
  if (phase === "dEcran3") return { texte: "Rappel de la formule inverse (à partir de z=(a−μ)/σ) :", latex: "a=\\mu+z\\cdot\\sigma" };
  return AUCUNE_AIDE;
}
export function aideNiveau2D(e: ExerciceLoiNormaleD, phase: PhaseLoiNormale): AideAvecLatex {
  if (phase === "dEcran1") {
    if (e.sousType === "cumulee") return { texte: "Relation de conversion (déjà sous la bonne forme) :", latex: `\\Phi(z)=p=${formatDecimal(e.p, 4)}` };
    if (e.sousType === "symetrique") return { texte: "Relation de conversion appliquée en partie (valeur finale non isolée) :", latex: "\\Phi(z)=p+0{,}5" };
    return { texte: "Relation de conversion appliquée en partie (valeur finale non isolée) :", latex: `\\Phi(z)=\\Phi(z_b)-p` };
  }
  if (phase === "dEcran3") return { texte: "μ, σ et z substitués (calcul final non fait) :", latex: `a=${formatDecimal(e.mu, 2)}+(${formatDecimal(valeurZD(e), 2)})\\times ${formatDecimal(e.sigma, 2)}` };
  return AUCUNE_AIDE;
}

// ============================================================================
// Famille E — Règle empirique 68-95-99,7.
// ============================================================================

/** Texte PUR (jamais du LaTeX — cette phrase narrative appartient à la consigne d'écran, pas au
 * bloc données KaTeX, voir en-tête de fichier "raw French text inside KaTeX math mode"). */
function libelleQuestionE(unCote: boolean, coteDemande: CoteDemandeE | undefined, basse: number, haute: number): string {
  const basseTexte = formatDecimal(basse, 2).replace("{,}", ",");
  const hauteTexte = formatDecimal(haute, 2).replace("{,}", ",");
  if (!unCote) return `Quelle est la probabilité qu'une valeur soit en dehors de l'intervalle [${basseTexte} ; ${hauteTexte}] (les 2 côtés) ?`;
  if (coteDemande === "superieur") return `Quelle est la probabilité qu'une valeur soit supérieure à ${hauteTexte} (un seul côté) ?`;
  return `Quelle est la probabilité qu'une valeur soit inférieure à ${basseTexte} (un seul côté) ?`;
}

function donneesPopulationE(population: number | undefined): string[] {
  return population === undefined ? [] : [`N=${population}\\text{ (population totale)}`];
}

/** Phrase dynamique (dépend de `e.k`) — TEXTE PUR, jamais du LaTeX (voir en-tête de fichier) : une
 * phrase française complète comme fragment KaTeX unique déborderait horizontalement dès que
 * l'écran est étroit (`white-space:nowrap` interne à KaTeX, aucun retour à la ligne possible —
 * bug trouvé et corrigé en vérification Playwright, voir `docs/historique-6e.md` : le texte
 * apparaissait tronqué des deux côtés, `.equation-box` scrollant vers son centre par défaut).
 * `blocDonneesE` ci-dessous reste à des fragments COURTS uniquement (pourcentage, intervalle),
 * jamais une phrase entière dans un seul bloc KaTeX. */
export function consigneGeneraleE(e: ExerciceLoiNormaleE): string {
  const pourcentageTexte = formatDecimal(POURCENTAGE_PAR_K[e.k] * 100, 1).replace("{,}", ",");
  return `La règle empirique (68-95-99,7) donne le pourcentage de valeurs situées dans un intervalle centré sur μ — environ ${pourcentageTexte}% dans l'intervalle affiché ci-dessous. Retrouve μ et σ, puis calcule la probabilité demandée.`;
}
export function blocDonneesE(e: ExerciceLoiNormaleE): string[] {
  const { basse, haute } = bornesE(e.mu, e.sigma, e.k);
  const basseL = formatDecimal(basse, 2);
  const hauteL = formatDecimal(haute, 2);
  const pourcentageL = formatDecimal(POURCENTAGE_PAR_K[e.k] * 100, 1);
  // 2 fragments COURTS distincts (jamais une phrase complète en un seul bloc — voir en-tête
  // `consigneGeneraleE`) : le pourcentage, puis l'intervalle.
  return [`${pourcentageL}\\%`, `[${basseL}\\text{ ; }${hauteL}]`, ...donneesPopulationE(e.population)];
}
export function consigneEcranE(e: ExerciceLoiNormaleE, phase: PhaseLoiNormale): string {
  if (phase === "eEcran1") return "Identifie μ (milieu de l'intervalle) et σ (demi-largeur divisée par le nombre d'écarts-types correspondant au pourcentage donné).";
  if (phase === "eEcran2") {
    const { basse, haute } = bornesE(e.mu, e.sigma, e.k);
    return `Calcule la probabilité COMPLÉMENTAIRE (hors intervalle), en tenant compte du nombre de côtés concernés par la question. ${libelleQuestionE(e.unCote, e.coteDemande, basse, haute)}`;
  }
  return "Multiplie la probabilité CONFIRMÉE par la taille de la population, puis arrondis à l'entier le plus proche.";
}
/** ACCUMULE les écrans déjà confirmés (correctif transversal, voir CLAUDE.md/`docs/historique-
 * 6e.md`) : `eEcran3` omettait μ/σ confirmés à `eEcran1`, ne montrant que la probabilité de
 * `eEcran2`. Plus ancien en premier. */
export function etatActuelE(e: ExerciceLoiNormaleE, phase: PhaseLoiNormale): string[] | null {
  if (phase === "eEcran2") return [`\\mu=${formatDecimal(e.mu, 2)}\\text{, }\\sigma=${formatDecimal(e.sigma, 2)}\\text{ (confirmés, étape 1)}`];
  if (phase === "eEcran3") return [`\\mu=${formatDecimal(e.mu, 2)}\\text{, }\\sigma=${formatDecimal(e.sigma, 2)}\\text{ (confirmés, étape 1)}`, `P=${formatDecimal(probabiliteFinaleE(e), 4)}\\text{ (confirmée, étape 2)}`];
  return null;
}
export function champsE(phase: PhaseLoiNormale): ChampDef[] {
  if (phase === "eEcran1") return [{ type: "texte", label: "μ =", placeholder: "ex : 100" }, { type: "texte", label: "σ =", placeholder: "ex : 15" }];
  if (phase === "eEcran2") return [{ type: "texte", label: "Probabilité =", placeholder: "ex : 0.1587" }];
  return [{ type: "texte", label: "Effectif estimé =", placeholder: "ex : 159" }];
}
export function niveauAideMaxE(phase: PhaseLoiNormale): number {
  return phase === "eEcran1" ? 2 : 0;
}
export function aideNiveau1E(phase: PhaseLoiNormale): AideAvecLatex {
  if (phase !== "eEcran1") return AUCUNE_AIDE;
  return { texte: "Le pourcentage encadré correspond respectivement à μ±σ (68,3%), μ±2σ (95,4%) ou μ±3σ (99,7%).", latex: null };
}
export function aideNiveau2E(e: ExerciceLoiNormaleE, phase: PhaseLoiNormale): AideAvecLatex {
  if (phase !== "eEcran1") return AUCUNE_AIDE;
  return { texte: `Nombre d'écarts-types identifié depuis le pourcentage donné (μ et σ non encore isolés) : k=${e.k}.`, latex: null };
}

// ============================================================================
// Dispatch commun (mirroir 6gen37).
// ============================================================================

export function consigneGenerale(exercice: ExerciceLoiNormale): string {
  switch (exercice.famille) {
    case "A":
      return consigneGeneraleA();
    case "B":
      return consigneGeneraleB();
    case "C":
      return consigneGeneraleC();
    case "D":
      return consigneGeneraleD();
    case "E":
      return consigneGeneraleE(exercice);
  }
}

export function blocDonnees(exercice: ExerciceLoiNormale): string[] {
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
  }
}

export function consigneEcran(exercice: ExerciceLoiNormale, phase: PhaseLoiNormale): string {
  switch (exercice.famille) {
    case "A":
      return consigneEcranA(phase);
    case "B":
      return consigneEcranB(phase);
    case "C":
      return consigneEcranC(phase);
    case "D":
      return consigneEcranD(phase);
    case "E":
      return consigneEcranE(exercice, phase);
  }
}

export function etatActuel(exercice: ExerciceLoiNormale, phase: PhaseLoiNormale): string[] | null {
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
  }
}

export function champsEcran(exercice: ExerciceLoiNormale, phase: PhaseLoiNormale): ChampDef[] {
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
      return champsE(phase);
  }
}

export function niveauAideMaxEcran(exercice: ExerciceLoiNormale, phase: PhaseLoiNormale): number {
  switch (exercice.famille) {
    case "A":
      return niveauAideMaxA(phase);
    case "B":
      return niveauAideMaxB(phase);
    case "C":
      return niveauAideMaxC(phase);
    case "D":
      return niveauAideMaxD(phase);
    case "E":
      return niveauAideMaxE(phase);
  }
}

export function aideNiveau1(exercice: ExerciceLoiNormale, phase: PhaseLoiNormale): AideAvecLatex {
  switch (exercice.famille) {
    case "A":
      return aideNiveau1A(phase);
    case "B":
      return aideNiveau1B(phase);
    case "C":
      return aideNiveau1C(phase);
    case "D":
      return aideNiveau1D(phase);
    case "E":
      return aideNiveau1E(phase);
  }
}

export function aideNiveau2(exercice: ExerciceLoiNormale, phase: PhaseLoiNormale): AideAvecLatex {
  switch (exercice.famille) {
    case "A":
      return aideNiveau2A(exercice, phase);
    case "B":
      return aideNiveau2B(exercice, phase);
    case "C":
      return aideNiveau2C(exercice, phase);
    case "D":
      return aideNiveau2D(exercice, phase);
    case "E":
      return aideNiveau2E(exercice, phase);
  }
}

export const LIBELLE_PHASE: Record<PhaseLoiNormale, string> = {
  aEcran1: "Étape 1 (lecture nécessaire)",
  aEcran2: "Étape 2 (probabilité finale)",
  bEcran1: "Étape 1 (standardisation)",
  bEcran2: "Étape 2 (probabilité)",
  bEcran3: "Étape 3 (effectif estimé)",
  cEcran1: "Étape 1 (reformulation)",
  cEcran2: "Étape 2 (lecture inversée)",
  dEcran1: "Étape 1 (reformulation)",
  dEcran2: "Étape 2 (lecture inversée)",
  dEcran3: "Étape 3 (dé-standardisation)",
  eEcran1: "Étape 1 (μ et σ)",
  eEcran2: "Étape 2 (probabilité)",
  eEcran3: "Étape 3 (effectif estimé)",
};

export const LIBELLE_FAMILLE: Record<ExerciceLoiNormale["famille"], string> = {
  A: "A — Centrée réduite, sens direct",
  B: "B — Générale N(μ,σ), sens direct",
  C: "C — Centrée réduite, sens inverse",
  D: "D — Générale, sens inverse",
  E: "E — Règle empirique 68-95-99,7",
};

/** Récapitulatif final : affiche toujours la réponse CORRECTE connue de l'exercice — jamais
 * recalculée depuis la saisie élève. */
export function formatReponseAttenduePhaseLatex(exercice: ExerciceLoiNormale, phase: PhaseLoiNormale): string[] {
  const ref = calculerReferenceLoiNormale(exercice, phase);
  switch (phase) {
    case "aEcran1": {
      // Écran spécifique à la famille A : le champ élève demande "t" (valeur positive à chercher
      // dans la table), JAMAIS "Φ(t)" (ça, c'est le champ des familles C/D, cas différent
      // ci-dessous) — `calculerReferenceLoiNormale` ne peuple pas `cibleTable` pour cette phase
      // (voir sa définition), donc le récapitulatif doit utiliser `valeurATableA` directement,
      // comme `etatActuelA` le fait déjà pour cette même famille/écran.
      const e = exercice as ExerciceLoiNormaleA;
      if (e.sousType === "intervalle") return [`t_1=${formatDecimal(valeurATableA(e.z1), 2)}\\text{, }t_2=${formatDecimal(valeurATableA(e.z2), 2)}`];
      return [`t=${formatDecimal(valeurATableA(e.z), 2)}`];
    }
    case "cEcran1":
    case "dEcran1":
      return [`\\Phi(t)=${formatDecimal(ref.cibleTable ?? 0, 4)}`];
    case "aEcran2":
    case "bEcran2":
    case "eEcran2":
      return [`P=${formatDecimal(ref.probabiliteFinale ?? 0, 4)}`];
    case "bEcran1": {
      const e = exercice as ExerciceLoiNormaleB;
      if (e.sousType === "intervalle") return [`z_1=${formatDecimal(standardiserB(e.x1, e.mu, e.sigma), 2)}\\text{, }z_2=${formatDecimal(standardiserB(e.x2, e.mu, e.sigma), 2)}`];
      return [`z=${formatDecimal(standardiserB(e.x, e.mu, e.sigma), 2)}`];
    }
    case "bEcran3":
    case "eEcran3":
      return [`\\text{Effectif}\\approx ${Math.round(ref.effectifReference ?? 0)}`];
    case "cEcran2":
      return [`t=${formatDecimal(ref.tReference ?? 0, 2)}`];
    case "dEcran2":
      return [`z=${formatDecimal(ref.zReference ?? 0, 2)}`];
    case "dEcran3":
      return [`a=${formatDecimal(ref.aReference ?? 0, 2)}`];
    case "eEcran1": {
      const e = exercice as ExerciceLoiNormaleE;
      const { basse, haute } = bornesE(e.mu, e.sigma, e.k);
      return [`\\mu=${formatDecimal(muDepuisBornes(basse, haute), 2)}\\text{, }\\sigma=${formatDecimal(sigmaDepuisBornes(basse, haute, e.k), 2)}`];
    }
  }
}

/** Total points du récapitulatif final — maximum VARIABLE (100 × nombre d'écrans réellement
 * traversés par CET exercice — 2 à 3 selon la famille/le contexte). */
export function calculerTotalPointsLoiNormale(resultat: ResultatExerciceLoiNormale): { total: number; maximum: number } {
  const phases = phasesPourExercice(resultat.exercice);
  const total = phases.reduce((acc, phase) => acc + (resultat.scores[phase] ?? 0), 0);
  return { total, maximum: phases.length * 100 };
}
