import type { Frac } from "../core6e/intersectionsConiques.types";
import type { ExerciceProprietesOptiquesConiques } from "../core6e/proprietesOptiquesConiques.types";
import type { PhaseProprietesOptiquesConiques, ResultatExerciceProprietesOptiquesConiques } from "../moteur6e/typesProprietesOptiquesConiques";
import { TOUTES_LES_PHASES } from "../moteur6e/typesProprietesOptiquesConiques";

/**
 * Couche ui (6e) — textes de consigne/aide + formatage LaTeX pour `6gen63`. Dispatch sur `phase`
 * SEUL (une seule famille, jamais de dispatch par `exercice.famille` contrairement à `6gen61`/
 * `6gen62`) — dispatcher générique piloté par `champs: ChampDef[]`, jamais de JSX par écran
 * (CLAUDE.md).
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
  minuscule?: boolean;
}

/** `latex` : TABLEAU de fragments COURTS, jamais une seule chaîne longue — un bloc KaTeX (`\text{}`
 * ou non) qui combine plusieurs quantités côte à côte peut déborder du cadre à 375px sans jamais se
 * scinder tout seul (piège documenté CLAUDE.md, trouvé ici par inspection visuelle 375px sur
 * l'aide 2 de l'écran 3 : `x_{P_1}-x_F=...,x_{P_2}-x_F=...` en un seul fragment débordait) — chaque
 * élément du tableau est rendu par son propre appel `<Katex block>`, donc sur sa propre ligne. */
export interface AideAvecLatex {
  texte: string;
  latex: string[];
}

const AUCUNE_AIDE: AideAvecLatex = { texte: "", latex: [] };

function champTexte(label: string, placeholder: string, minuscule = false): ChampDef {
  return { type: "texte", label, placeholder, minuscule };
}

function champChoix(label: string, options: OptionChoix[]): ChampDef {
  return { type: "choix", label, options };
}

// ============================================================================
// Petits formateurs numériques/LaTeX partagés.
// ============================================================================

function afficherFrac(f: Frac): string {
  if (f.d === 1) return `${f.n}`;
  return f.n < 0 ? `-\\frac{${-f.n}}{${f.d}}` : `\\frac{${f.n}}{${f.d}}`;
}

/** Version texte PLATE (jamais de LaTeX) — pour un label de bouton `.btn.toggle-active` (écran 3),
 * jamais rendu par KaTeX. */
function texteFrac(f: Frac): string {
  return f.d === 1 ? `${f.n}` : `${f.n}/${f.d}`;
}

function afficherPointEntier(p: { x: number; y: number }): string {
  return `(${p.x};${p.y})`;
}

function afficherPointFrac(p: { x: Frac; y: Frac }): string {
  return `(${afficherFrac(p.x)};${afficherFrac(p.y)})`;
}

function texteFracPoint(p: { x: Frac; y: Frac }): string {
  return `(${texteFrac(p.x)} ; ${texteFrac(p.y)})`;
}

function afficherDroiteLatex(m: Frac, c: Frac): string {
  const termeM = m.n === 0 ? "" : `${afficherFrac(m)}x`;
  let termeC = "";
  if (c.n !== 0) {
    const abs = c.d === 1 ? `${Math.abs(c.n)}` : `\\frac{${Math.abs(c.n)}}{${c.d}}`;
    termeC = termeM === "" ? (c.n < 0 ? `-${abs}` : abs) : `${c.n < 0 ? "-" : "+"}${abs}`;
  }
  const corps = termeM + termeC;
  return `y=${corps === "" ? "0" : corps}`;
}

const LIBELLE_NATURE: Record<"ellipse" | "hyperbole", string> = { ellipse: "Ellipse", hyperbole: "Hyperbole" };

function equationCanoniqueLatex(e: ExerciceProprietesOptiquesConiques): string {
  const aCarre = e.a * e.a;
  const signe = e.natureConique === "ellipse" ? "+" : "-";
  return `\\frac{x^2}{${aCarre}}${signe}\\frac{y^2}{${e.bCarre}}=1`;
}

// ============================================================================
// Consigne générale + bloc données — redondants sur CHAQUE écran (convention transversale).
// ============================================================================

export function consigneGenerale(e: ExerciceProprietesOptiquesConiques): string {
  return `Une ${LIBELLE_NATURE[e.natureConique].toLowerCase()} possède 2 foyers. Un rayon lumineux émis depuis le foyer F (abscisse négative), vers les abscisses croissantes, se réfléchit sur la courbe. Retrouve son trajet en utilisant la PROPRIÉTÉ FOCALE des coniques — jamais un calcul de tangente.`;
}

export function blocDonnees(e: ExerciceProprietesOptiquesConiques): string[] {
  return [`\\text{${LIBELLE_NATURE[e.natureConique]} : }${equationCanoniqueLatex(e)}`, `\\tan\\alpha=${afficherFrac(e.droiteIncidente.m)}`];
}

// ============================================================================
// Par écran.
// ============================================================================

export function consigneEcran(_e: ExerciceProprietesOptiquesConiques, phase: PhaseProprietesOptiquesConiques): string {
  if (phase === "ecran1") return "Calcule la distance focale c, puis donne les coordonnées des 2 foyers F (abscisse négative) et F'.";
  if (phase === "ecran2") return "À partir de F CONFIRMÉ, pose l'équation du rayon incident (pente tan α donnée). Substitue-la dans l'équation de la conique et donne les 2 points d'intersection trouvés.";
  if (phase === "ecran3") return "Parmi les 2 points CONFIRMÉS, lequel correspond au trajet RÉEL du rayon (celui atteint en premier en s'éloignant de F vers les abscisses croissantes) ?";
  return "Donne l'équation du rayon réfléchi, en utilisant la propriété focale (jamais un calcul de tangente).";
}

/** ACCUMULE les écrans déjà confirmés (correctif transversal — voir CLAUDE.md/`docs/historique-
 * 6e.md`, même bug déjà corrigé sur `formatIdentificationConiques.ts`, 6gen58) : `ecran3`/`ecran4`
 * ne montraient QUE l'info de l'écran immédiatement précédent, jamais celles d'avant. Plus ancien en
 * premier. */
export function etatActuel(e: ExerciceProprietesOptiquesConiques, phase: PhaseProprietesOptiquesConiques): string[] | null {
  const lignes: string[] = [];
  if (phase === "ecran2" || phase === "ecran3" || phase === "ecran4") {
    lignes.push(`\\text{Foyer confirmé (étape 1) : }F${afficherPointEntier(e.foyerF)}`);
  }
  if (phase === "ecran3" || phase === "ecran4") {
    lignes.push(`\\text{Rayon confirmé (étape 2) : }${afficherDroiteLatex(e.droiteIncidente.m, e.droiteIncidente.c)}`);
  }
  // Les 2 points candidats (`P_1`,`P_2`) ne sont rappelés QU'À `ecran3` — celui-là même qui demande
  // de trancher entre eux (`ecran4` a déjà résolu ce choix, voir "Réflexion confirmée" ci-dessous ;
  // réafficher les 2 candidats à `ecran4` réintroduirait une ambiguïté déjà levée).
  if (phase === "ecran3") {
    lignes.push(`P_1${afficherPointFrac(e.pointsIntersection[0])}\\text{, }P_2${afficherPointFrac(e.pointsIntersection[1])}`);
  }
  if (phase === "ecran4") {
    const pointReflexion = e.pointsIntersection[e.indexReflexion];
    lignes.push(`\\text{Réflexion confirmée (étape 3) : }${afficherPointFrac(pointReflexion)}`, `\\text{Autre foyer : }F'${afficherPointEntier(e.foyerFPrime)}`);
  }
  return lignes.length > 0 ? lignes : null;
}

export function champsEcran(e: ExerciceProprietesOptiquesConiques, phase: PhaseProprietesOptiquesConiques): ChampDef[] {
  if (phase === "ecran1") return [champTexte("F (abscisse négative) =", "ex : (-3;0)"), champTexte("F' =", "ex : (3;0)")];
  if (phase === "ecran2") {
    return [champTexte("Équation du rayon incident =", "ex : y=1/2*x+3/2"), champTexte("Premier point d'intersection =", "ex : (1;2)"), champTexte("Second point d'intersection =", "ex : (-5;-1)")];
  }
  if (phase === "ecran3") {
    return [
      champChoix("Point de réflexion réel =", [
        { valeur: "point0", label: texteFracPoint(e.pointsIntersection[0]) },
        { valeur: "point1", label: texteFracPoint(e.pointsIntersection[1]) },
      ]),
    ];
  }
  return [champTexte("Équation du rayon réfléchi =", "ex : y=-x+3")];
}

export function niveauAideMaxEcran(_e: ExerciceProprietesOptiquesConiques, phase: PhaseProprietesOptiquesConiques): number {
  return phase === "ecran3" || phase === "ecran4" ? 2 : 0;
}

export function aideNiveau1(_e: ExerciceProprietesOptiquesConiques, phase: PhaseProprietesOptiquesConiques): AideAvecLatex {
  if (phase === "ecran3") {
    return { texte: "Rappel : le point retenu est celui situé DANS LE SENS DE PROPAGATION du rayon depuis F (abscisses croissantes) — pas nécessairement le point le plus proche de F numériquement.", latex: [] };
  }
  if (phase === "ecran4") {
    return { texte: "Rappel — propriété focale : le rayon réfléchi issu d'un foyer est TOUJOURS porté par la droite joignant le point de réflexion à l'AUTRE foyer. Aucun calcul de tangente n'est nécessaire.", latex: [] };
  }
  return AUCUNE_AIDE;
}

export function aideNiveau2(e: ExerciceProprietesOptiquesConiques, phase: PhaseProprietesOptiquesConiques): AideAvecLatex {
  if (phase === "ecran3") {
    const [p0, p1] = e.pointsIntersection;
    const ecart0 = ecartAvecFoyer(p0.x, e.foyerF.x);
    const ecart1 = ecartAvecFoyer(p1.x, e.foyerF.x);
    // 2 fragments COURTS distincts (jamais un seul fragment combiné) — un bloc unique
    // `x_{P_1}-x_F=...,x_{P_2}-x_F=...` déborde à 375px (aucun retour à la ligne automatique dans un
    // bloc KaTeX), trouvé par inspection visuelle 375px, voir en-tête `AideAvecLatex`.
    return { texte: "Écart d'abscisse par rapport à F pour chaque point (sélection non faite) :", latex: [`x_{P_1}-x_F=${ecart0}`, `x_{P_2}-x_F=${ecart1}`] };
  }
  if (phase === "ecran4") {
    const pointReflexion = e.pointsIntersection[e.indexReflexion];
    return { texte: "Les 2 points, équation non assemblée :", latex: [`${afficherPointFrac(pointReflexion)}\\text{, }F'${afficherPointEntier(e.foyerFPrime)}`] };
  }
  return AUCUNE_AIDE;
}

function ecartAvecFoyer(x: Frac, xFoyer: number): string {
  // xFoyer est toujours entier (-c) — soustraction en fractions pour un affichage exact.
  const diff: Frac = x.d === 1 ? { n: x.n - xFoyer, d: 1 } : { n: x.n - xFoyer * x.d, d: x.d };
  return afficherFrac(diff);
}

// ============================================================================
// Récapitulatif final.
// ============================================================================

export const LIBELLE_PHASE: Record<PhaseProprietesOptiquesConiques, string> = {
  ecran1: "Étape 1 (les 2 foyers)",
  ecran2: "Étape 2 (rayon incident et intersections)",
  ecran3: "Étape 3 (point de réflexion réel)",
  ecran4: "Étape 4 (rayon réfléchi)",
};

export function formatReponseAttenduePhaseLatex(e: ExerciceProprietesOptiquesConiques, phase: PhaseProprietesOptiquesConiques): string[] {
  if (phase === "ecran1") return [`F${afficherPointEntier(e.foyerF)}\\text{, }F'${afficherPointEntier(e.foyerFPrime)}`];
  if (phase === "ecran2") {
    return [afficherDroiteLatex(e.droiteIncidente.m, e.droiteIncidente.c), `${afficherPointFrac(e.pointsIntersection[0])}\\text{, }${afficherPointFrac(e.pointsIntersection[1])}`];
  }
  if (phase === "ecran3") return [afficherPointFrac(e.pointsIntersection[e.indexReflexion])];
  return [afficherDroiteLatex(e.droiteReflechie.m, e.droiteReflechie.c)];
}

/** Total points du récapitulatif final — TOUJOURS 4 écrans (jamais de longueur variable,
 * contrairement à `6gen61`/`6gen62`). */
export function calculerTotalPointsProprietesOptiquesConiques(resultat: ResultatExerciceProprietesOptiquesConiques): { total: number; maximum: number } {
  const total = TOUTES_LES_PHASES.reduce((acc, phase) => acc + (resultat.scores[phase] ?? 0), 0);
  return { total, maximum: TOUTES_LES_PHASES.length * 100 };
}
