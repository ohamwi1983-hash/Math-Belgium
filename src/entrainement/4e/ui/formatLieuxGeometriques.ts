/**
 * Couche présentation — "Lieux géométriques : intersection", REFONTE COMPLÈTE
 * (`promptgen54refontecomplete.md`) sur 3 écrans (identification / équations / résolution).
 * Réutilise `formatPointLatex`/`formatSommeTermesGeneree`/`formatEquationExpliciteYLatex`/
 * `libelleBoutonAide`/`FragmentConsigne` (`ui/formatEquationDroite.ts`, module frère déjà partagé
 * par le groupe "droites") — jamais dupliqués, même `texte`/`latex` locaux que le reste du chapitre
 * 6 (convention établie, ex. `formatEquationCercleDeveloppee.ts`).
 *
 * ## ⚠️ Convention d'énoncé propre à ce générateur — divergence ASSUMÉE, ne jamais "corriger"
 *
 * Contrairement à la convention standard du chapitre 6, AUCUNE équation cartésienne de droite
 * n'est jamais affichée en toutes lettres dans l'énoncé, et les mots "centre"/"foyer" ne sont
 * jamais utilisés pour désigner les points caractéristiques du cercle/de la parabole — l'objet même
 * de l'écran 1 est que l'élève déduise LUI-MÊME le type de chaque lieu à partir de sa définition
 * verbale, jamais une donnée déjà nommée. Une fois le type validé (écran 1 confirmé), les écrans 2
 * et 3 peuvent en revanche employer le vocabulaire technique usuel (pente, ordonnée à l'origine,
 * centre, rayon, foyer, paramètre p) dans leurs blocs "état actuel" — l'énoncé verbal d'origine,
 * lui, reste affiché tel quel sur les 3 écrans (cohérence énoncé/état actuel, convention
 * transversale du projet).
 */
import type { Lieu, LieuCercle, LieuDroite, LieuParabole, NombrePointsIntersection, PaireLieux, TypeLieu } from "../core/lieuxGeometriques.types";
import type { ExerciceLieuxGeometriques } from "../core/lieuxGeometriques.types";
import { axeRadicalDeuxCercles } from "../generateurs/lieuxGeometriques/geometrieConique";
import { formatEquationExpliciteYLatex, formatPointLatex, formatSommeTermesGeneree, libelleBoutonAide } from "./formatEquationDroite";
import type { FragmentConsigne } from "./formatEquationDroite";
import { formatFractionIrreductible } from "./formatFraction";

export type { FragmentConsigne };
export { formatPointLatex, libelleBoutonAide };

function texte(valeur: string): FragmentConsigne {
  return { type: "texte", valeur };
}
function latex(valeur: string): FragmentConsigne {
  return { type: "latex", valeur };
}

export const LIBELLE_TYPE_LIEU: Record<TypeLieu, string> = {
  droite: "Droite",
  cercle: "Cercle",
  parabole: "Parabole",
};

export const LIBELLE_PAIRE: Record<PaireLieux, string> = {
  cercleDroite: "Cercle-droite",
  cercleCercle: "Cercle-cercle",
  droiteParabole: "Droite-parabole",
};

/** Sous-titre affiché AU-DESSUS des champs numériques une fois le type sélectionné à l'écran
 * "identification" (`promptgen53gen54corrections.md`, B.2).
 *
 * Le champ `droite` seul annonce une tolérance : `m`/`p` sont vérifiés par `statutNumerique`
 * (`verificationDroite.ts`, `TOLERANCE=0.01`) et `m` peut être une vraie fraction non entière —
 * jamais annoncé jusqu'ici (audit de traçabilité de précision). `cercle`/`parabole` restent sans
 * note : leurs champs sont toujours des entiers exacts par construction. */
export const SOUS_TITRE_CHAMPS_IDENTIFICATION: Record<TypeLieu, string> = {
  droite: "Pente et ordonnée à l'origine (arrondi au centième accepté si besoin) :",
  cercle: "Centre et rayon :",
  parabole: "Foyer et paramètre p :",
};

// ============================================================================
// Fraction irréductible pour toute valeur GÉNÉRÉE non entière — mêmes wrappers locaux dupliqués
// qu'ailleurs sur la plateforme (`formatEquationDroite.ts`, `formatEquationCercleDeveloppee.ts`,
// trop petits pour l'extraction, convention déjà établie).
// ============================================================================

function formatMagnitudeFractionLatex(abs: number): string {
  const texteFraction = formatFractionIrreductible(abs);
  const [numerateur, denominateur] = texteFraction.split("/");
  return denominateur === undefined ? numerateur! : `\\frac{${numerateur}}{${denominateur}}`;
}

function formatValeurFractionLatex(valeur: number): string {
  return valeur < 0 ? `-${formatMagnitudeFractionLatex(-valeur)}` : formatMagnitudeFractionLatex(valeur);
}

/** `(variable-valeur)^2` — signe simplifié, jamais de double signe. Réutilisé pour le cercle (x_o,
 * y_o), la parabole (x_F, y_F, directrice) — même patron que `formatBinome` ailleurs sur la
 * plateforme (`formatEquationCercleDeveloppee.ts`), dupliqué localement (trop petit pour extraire). */
function formatBinomeCarreLatex(variable: "x" | "y", valeur: number): string {
  if (valeur === 0) return `${variable}^2`;
  const signe = valeur > 0 ? "-" : "+";
  return `(${variable}${signe}${formatMagnitudeFractionLatex(Math.abs(valeur))})^2`;
}

// ============================================================================
// Définition VERBALE de chaque lieu — jamais d'équation de droite, jamais "centre"/"foyer".
// ============================================================================

/** Fraction-aware : accepte n'importe quel `m` rationnel (jamais seulement les petits entiers),
 * jamais le mot "pente" ni la lettre `m`. */
function segmentsDefinitionDroite(droite: LieuDroite): FragmentConsigne[] {
  const segments: FragmentConsigne[] = [texte("les points dont l'ordonnée est égale à "), latex(formatValeurFractionLatex(droite.m)), texte(" fois leur abscisse")];
  if (droite.p > 0) segments.push(texte(", augmentée de "), latex(formatMagnitudeFractionLatex(droite.p)));
  else if (droite.p < 0) segments.push(texte(", diminuée de "), latex(formatMagnitudeFractionLatex(-droite.p)));
  return segments;
}

function segmentsDefinitionCercle(cercle: LieuCercle): FragmentConsigne[] {
  return [texte("les points situés à une distance de "), latex(`${cercle.rayon}`), texte(" unités du point "), latex(formatPointLatex(cercle.centre))];
}

function directriceLatex(parabole: LieuParabole): string {
  const valeur = formatValeurFractionLatex(parabole.directrice);
  return parabole.orientation === "vertical" ? `y = ${valeur}` : `x = ${valeur}`;
}

function segmentsDefinitionParabole(parabole: LieuParabole): FragmentConsigne[] {
  return [texte("les points équidistants du point "), latex(formatPointLatex(parabole.foyer)), texte(" et de la droite d'équation "), latex(directriceLatex(parabole))];
}

function segmentsDefinitionLieu(lieu: Lieu): FragmentConsigne[] {
  switch (lieu.type) {
    case "droite":
      return segmentsDefinitionDroite(lieu);
    case "cercle":
      return segmentsDefinitionCercle(lieu);
    case "parabole":
      return segmentsDefinitionParabole(lieu);
  }
}

/** Énoncé — toujours visible, identique sur les 3 écrans (cohérence énoncé/état actuel). Aucune
 * numérotation de rang ("premier"/"second") — les 2 lieux sont introduits sur un pied d'égalité,
 * cohérent avec la vérification par ENSEMBLE de l'écran "identification" (B.4, ci-dessous), qui
 * n'impose elle non plus aucune correspondance position-par-position entre bloc de saisie et lieu
 * de l'énoncé (`promptgen53gen54corrections.md`, B.1). */
export function segmentsEnonce(exercice: ExerciceLieuxGeometriques): FragmentConsigne[] {
  return [
    texte("Quel est le lieu des points qui sont à la fois "),
    ...segmentsDefinitionLieu(exercice.lieu1),
    texte(" et "),
    ...segmentsDefinitionLieu(exercice.lieu2),
    texte(" ?"),
  ];
}

// ============================================================================
// Description TECHNIQUE d'un lieu (une fois son type validé) — réutilisée à la fois par l'aide
// niveau 2 de l'écran "identification" (exemple partiel sur UN SEUL des 2 lieux) et par le bloc
// "état actuel" de l'écran "équations" (les 2 lieux). Formats donnés par
// `promptgen54refontecomplete.md`.
// ============================================================================

export function segmentsDescriptionLieu(lieu: Lieu): FragmentConsigne[] {
  switch (lieu.type) {
    case "droite":
      return [texte("Droite de pente "), latex(`m=${formatValeurFractionLatex(lieu.m)}`), texte(" et d'ordonnée à l'origine "), latex(`p=${formatValeurFractionLatex(lieu.p)}`)];
    case "cercle":
      return [texte("Cercle de centre "), latex(formatPointLatex(lieu.centre)), texte(" et de rayon "), latex(`R=${lieu.rayon}`)];
    case "parabole":
      return [
        texte(`Parabole ${lieu.orientation === "vertical" ? "verticale" : "horizontale"} de foyer `),
        latex(formatPointLatex(lieu.foyer)),
        texte(" et de paramètre "),
        latex(`p=${formatValeurFractionLatex(lieu.p)}`),
      ];
  }
}

// ============================================================================
// Écran 1 — Identification (choix catégoriel + champs numériques adaptés).
// ============================================================================

export const CONSIGNE_GENERALE_IDENTIFICATION = "Identifie le type de chacun des 2 lieux géométriques, puis complète leurs caractéristiques.";

export function segmentsAideIdentificationNiveau1(): FragmentConsigne[] {
  return [
    texte(
      "Une droite relie l'abscisse et l'ordonnée par un facteur constant (éventuellement décalé d'une constante). Un cercle est l'ensemble des points situés à une distance CONSTANTE d'un point fixe. Une parabole est l'ensemble des points ÉQUIDISTANTS d'un point fixe et d'une droite fixe. Pour le paramètre ",
    ),
    latex("p"),
    texte(" d'une parabole : "),
    latex("p = x_F - x_{\\text{directrice}}"),
    texte(" (ou l'équivalent en "),
    latex("y"),
    texte(" si la directrice est horizontale)."),
  ];
}

/** Exemple partiel — révèle la description technique d'UN SEUL des 2 lieux (le premier), jamais du
 * second, pour laisser quelque chose à trouver à l'élève. */
export function segmentsAideIdentificationNiveau2(exercice: ExerciceLieuxGeometriques): FragmentConsigne[] {
  return [texte("Par exemple, pour le premier lieu : "), ...segmentsDescriptionLieu(exercice.lieu1)];
}

// ============================================================================
// Écran 2 — Équations (texte libre, réutilise les moteurs existants).
// ============================================================================

export const CONSIGNE_GENERALE_EQUATIONS = "Écris l'équation de chacun des 2 lieux géométriques.";

const LIBELLE_TYPE_LIEU_PARTITIF: Record<TypeLieu, string> = {
  droite: "de la droite",
  cercle: "du cercle",
  parabole: "de la parabole",
};

/** Label du champ de texte libre d'un bloc de l'écran "équations" — repris du TYPE réel du lieu,
 * jamais "premier"/"second" (`promptgen53gen54corrections.md`, B.5 : l'écran est désormais
 * restructuré en 2 blocs DISTINCTS, chacun avec ses propres caractéristiques suivies immédiatement
 * de son propre champ, plutôt qu'un unique bloc "état actuel" combiné). */
export function libelleChampEquation(lieu: Lieu): string {
  return `Équation ${LIBELLE_TYPE_LIEU_PARTITIF[lieu.type]} :`;
}

/** Gabarit générique NON substitué — une formule par type de lieu, jamais les valeurs réelles.
 * Parabole : formule PAR DÉFINITION (foyer/directrice), jamais la forme sommet — le sommet n'a
 * jamais été calculé par l'élève à l'écran 1 (seuls foyer et p le sont). */
export function latexGabaritGenerique(type: TypeLieu, orientation?: "vertical" | "horizontal"): string {
  if (type === "droite") return "y = mx + p";
  if (type === "cercle") return "(x-x_o)^2+(y-y_o)^2=R^2";
  return orientation === "horizontal" ? "(x-x_F)^2+(y-y_F)^2=(x-x_{\\text{directrice}})^2" : "(x-x_F)^2+(y-y_F)^2=(y-y_{\\text{directrice}})^2";
}

/** Gabarit substitué (valeurs RÉELLES de l'exercice, jamais résolu davantage) — même définition
 * foyer/directrice pour la parabole que le gabarit générique ci-dessus. */
export function formatEquationLieuLatex(lieu: Lieu): string {
  switch (lieu.type) {
    case "droite":
      return formatEquationExpliciteYLatex(lieu.m, lieu.p);
    case "cercle":
      return `${formatBinomeCarreLatex("x", lieu.centre.x)}+${formatBinomeCarreLatex("y", lieu.centre.y)}=${lieu.rayon * lieu.rayon}`;
    case "parabole": {
      const variableDirectrice = lieu.orientation === "vertical" ? "y" : "x";
      return `${formatBinomeCarreLatex("x", lieu.foyer.x)}+${formatBinomeCarreLatex("y", lieu.foyer.y)}=${formatBinomeCarreLatex(variableDirectrice, lieu.directrice)}`;
    }
  }
}

// ============================================================================
// Écran 3 — Résolution (catégorie "Aucun"/"Au moins un" + points add-as-needed).
// ============================================================================

export const CONSIGNE_GENERALE_RESOLUTION = "Résous ce système, combien y a-t-il de points d'intersection ?";

export const LIBELLE_AUCUN = "Aucun";
export const LIBELLE_AU_MOINS_UN = "Au moins un";

/** Bloc "état actuel" — système à accolade des 2 équations RÉELLES (jamais celles saisies par
 * l'élève, mêmes valeurs déjà validées à l'écran précédent). */
export function formatEtatActuelSystemeLatex(exercice: ExerciceLieuxGeometriques): string {
  return `\\begin{cases} ${formatEquationLieuLatex(exercice.lieu1)} \\\\ ${formatEquationLieuLatex(exercice.lieu2)} \\end{cases}`;
}

/** Méthode DIFFÉRENCIÉE selon la grande variante — piège explicite pour cercle-cercle (substituer
 * directement dans l'une des 2 équations de cercle au lieu de passer par l'axe radical). */
export function segmentsAideResolutionNiveau1(exercice: ExerciceLieuxGeometriques): FragmentConsigne[] {
  switch (exercice.paire) {
    case "cercleDroite":
      return [texte("Substitue l'équation de la droite dans celle du cercle pour obtenir une équation du second degré, puis résous-la.")];
    case "droiteParabole":
      return [texte("Substitue l'équation de la droite dans celle de la parabole pour obtenir une équation du second degré, puis résous-la.")];
    case "cercleCercle":
      return [
        texte("Soustrais les deux équations de cercle pour obtenir l'équation de l'"),
        latex("\\text{axe radical}"),
        texte(
          " (une droite) — attention, substituer directement l'une des deux équations de cercle dans l'autre ne fonctionne pas ici. Substitue ensuite CET axe radical dans l'une des deux équations de cercle, puis résous.",
        ),
      ];
  }
}

// ============================================================================
// Substitution RÉELLEMENT effectuée pour l'aide niveau 2 de l'écran "résolution"
// (`promptgen53gen54corrections.md`, B.6) — l'ancien affichage réutilisait `exercice.quadratique`
// (précalculé à la génération via une paramétrisation point+direction en `t`, héritée de l'ancien
// contenu du 53e exercice, voir `generateurs/lieuxGeometriques/geometrieConique.ts`) en l'étiquetant
// "t", alors que la méthode DÉCRITE à l'élève (aide niveau 1, ci-dessus : "substitue l'équation de
// la droite dans celle du cercle/de la parabole") ne fait jamais intervenir de paramètre `t` — les
// équations montrées à l'écran 2 sont toutes cartésiennes (x,y), jamais paramétriques. Ces
// primitives recalculent donc, PUREMENT POUR L'AFFICHAGE (jamais consommées par
// `diagnostiquerResolution`/`exercice.quadratique`, qui restent tous deux inchangés — aucune
// modification de la génération ni de la vérification), les VRAIS coefficients A/B/C dans la
// variable RÉELLEMENT éliminée par cette méthode de substitution cartésienne.
//
// Calcul par ÉCHANTILLONNAGE EXACT plutôt que dérivation algébrique manuelle (source d'erreur) :
// substituer une expression AFFINE (la droite, ou l'axe radical, toujours de degré 1) dans une
// cible quadratique produit TOUJOURS un polynôme de degré ≤2 dans le paramètre restant — 3 points
// d'échantillonnage (différences finies à v=0,1,2) suffisent donc à reconstruire A/B/C exactement,
// même principe de fiabilité que `diagnostiquerEquivalenceQuadratiqueXY` (échantillonnage plutôt que
// développement symbolique à la main).
// ============================================================================

function cibleCercleLieu(cercle: LieuCercle): (x: number, y: number) => number {
  return (x, y) => (x - cercle.centre.x) ** 2 + (y - cercle.centre.y) ** 2 - cercle.rayon * cercle.rayon;
}

function cibleParaboleLieu(parabole: LieuParabole): (x: number, y: number) => number {
  const sommet =
    parabole.orientation === "vertical"
      ? { x: parabole.foyer.x, y: parabole.foyer.y - parabole.p / 2 }
      : { x: parabole.foyer.x - parabole.p / 2, y: parabole.foyer.y };
  return (x, y) => (parabole.orientation === "vertical" ? (x - sommet.x) ** 2 - 2 * parabole.p * (y - sommet.y) : (y - sommet.y) ** 2 - 2 * parabole.p * (x - sommet.x));
}

export interface SubstitutionQuadratique {
  variable: "x" | "y";
  A: number;
  B: number;
  C: number;
}

/** Reconstruit `A·v²+B·v+C` par différences finies (`v` = 0,1,2), exact pour tout polynôme de degré
 * ≤2 — voir l'en-tête de section ci-dessus. */
function coefficientsParEchantillonnage(cible: (x: number, y: number) => number, x: (v: number) => number, y: (v: number) => number): { A: number; B: number; C: number } {
  const f = (v: number) => cible(x(v), y(v));
  const f0 = f(0);
  const f1 = f(1);
  const f2 = f(2);
  const A = (f2 - 2 * f1 + f0) / 2;
  const B = f1 - f0 - A;
  const C = f0;
  return { A, B, C };
}

function trouverLieu<T extends Lieu["type"]>(exercice: ExerciceLieuxGeometriques, type: T): Extract<Lieu, { type: T }> {
  const lieu = exercice.lieu1.type === type ? exercice.lieu1 : exercice.lieu2;
  return lieu as Extract<Lieu, { type: T }>;
}

/** Cercle-droite : la droite est TOUJOURS résolue en `y=mx+p` (`LieuDroite`, jamais une forme
 * `x=...`), donc la substituer dans l'équation du cercle élimine TOUJOURS `y` — variable "x". */
function substitutionCercleDroite(exercice: ExerciceLieuxGeometriques): SubstitutionQuadratique {
  const droite = trouverLieu(exercice, "droite");
  const cercle = trouverLieu(exercice, "cercle");
  const { A, B, C } = coefficientsParEchantillonnage(
    cibleCercleLieu(cercle),
    (v) => v,
    (v) => droite.m * v + droite.p,
  );
  return { variable: "x", A, B, C };
}

/** Droite-parabole : la substitution NATURELLE dépend de l'orientation de la parabole — verticale
 * (naturellement résolue en y) : on élimine y via la droite, variable "x" ; horizontale
 * (naturellement résolue en x) : on élimine x via la droite (résolue en x=(y-p)/m), variable "y". */
function substitutionDroiteParabole(exercice: ExerciceLieuxGeometriques): SubstitutionQuadratique {
  const droite = trouverLieu(exercice, "droite");
  const parabole = trouverLieu(exercice, "parabole");
  if (parabole.orientation === "vertical") {
    const { A, B, C } = coefficientsParEchantillonnage(
      cibleParaboleLieu(parabole),
      (v) => v,
      (v) => droite.m * v + droite.p,
    );
    return { variable: "x", A, B, C };
  }
  const { A, B, C } = coefficientsParEchantillonnage(
    cibleParaboleLieu(parabole),
    (v) => (v - droite.p) / droite.m,
    (v) => v,
  );
  return { variable: "y", A, B, C };
}

/** Cercle-cercle : substitue l'AXE RADICAL (soustraction des deux équations de cercle, réutilisée
 * telle quelle depuis `generateurs/lieuxGeometriques/geometrieConique.ts` — jamais redéveloppée)
 * dans l'un des deux cercles. L'axe radical est générique (`ax+by+c=0`) : `b≠0` (cas courant) élimine
 * `y`, variable "x" ; `b=0` (axe radical vertical, les 2 centres partagent la même ordonnée) élimine
 * directement `x` (constant), variable "y". */
function substitutionCercleCercle(exercice: ExerciceLieuxGeometriques): SubstitutionQuadratique {
  const cercle1 = exercice.lieu1 as LieuCercle;
  const cercle2 = exercice.lieu2 as LieuCercle;
  const axe = axeRadicalDeuxCercles(cercle1, cercle2);
  if (axe.b !== 0) {
    const { A, B, C } = coefficientsParEchantillonnage(
      cibleCercleLieu(cercle1),
      (v) => v,
      (v) => -(axe.a * v + axe.c) / axe.b,
    );
    return { variable: "x", A, B, C };
  }
  const { A, B, C } = coefficientsParEchantillonnage(
    cibleCercleLieu(cercle1),
    () => -axe.c / axe.a,
    (v) => v,
  );
  return { variable: "y", A, B, C };
}

/** Dispatch par grande variante — voir chaque fonction pour la justification de la variable choisie. */
export function substitutionResolution(exercice: ExerciceLieuxGeometriques): SubstitutionQuadratique {
  switch (exercice.paire) {
    case "cercleDroite":
      return substitutionCercleDroite(exercice);
    case "droiteParabole":
      return substitutionDroiteParabole(exercice);
    case "cercleCercle":
      return substitutionCercleCercle(exercice);
  }
}

/** L'équation du second degré RÉELLEMENT obtenue par la méthode décrite — jamais résolue, jamais la
 * lettre `t` (voir l'en-tête de section). */
export function formatQuadratiqueSubstitutionLatex(exercice: ExerciceLieuxGeometriques): string {
  const { variable, A, B, C } = substitutionResolution(exercice);
  return `${formatSommeTermesGeneree([
    { valeur: A, suffixe: `${variable}^2` },
    { valeur: B, suffixe: variable },
    { valeur: C, suffixe: "" },
  ])} = 0`;
}

// ============================================================================
// Révélation — panneau de résultat.
// ============================================================================

export function texteNombrePointsAttendu(nombrePoints: NombrePointsIntersection): string {
  return nombrePoints === 0 ? "Aucune intersection." : nombrePoints === 1 ? "1 point d'intersection (tangente)." : "2 points d'intersection.";
}

/** Chaîne LaTeX pure (à rendre via `<Katex>`) — jamais de mot en français mêlé au LaTeX
 * (`\text{et}`, pas simplement " et "). */
export function texteReponseResolutionAttendue(exercice: ExerciceLieuxGeometriques): string {
  return exercice.points.map((p) => formatPointLatex(p)).join(" \\text{ et } ");
}
