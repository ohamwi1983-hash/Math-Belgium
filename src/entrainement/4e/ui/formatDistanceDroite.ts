/**
 * Couche présentation — "Distance point-droite et droite-droite (méthode de synthèse, sans
 * formule)" (`src/generateurs/distanceDroite/`, `src/moteur/sessionDistanceDroite.ts`).
 * ⚠️ Exercice de SYNTHÈSE, couplage fort assumé (même famille de risque que gen35) : les fonctions
 * ci-dessous documentent explicitement, à chaque écran, quel générateur/module source elles
 * reprennent — "Relations entre droites" (`formatRelationsDroites.ts`/`formatEquationDroite.ts`)
 * pour l'écran 1, "Norme d'un vecteur et distance entre 2 points" (structure générale de la
 * formule uniquement, jamais son formatage décimal — voir C.2 ci-dessous) pour l'écran 3. Rien de
 * tout cela n'est recalculé différemment côté vérification (`moteur/verificationDistanceDroite.ts`).
 *
 * Restructuration `promptgen47modifications.md` — 4 blocs empilés sur chaque écran (point 6) :
 * consigne générale (`segmentsConsigneGeneraleDistanceDroite`) → bloc de données FIXE, inchangé sur
 * les 4 écrans (`formatEnonceLatex`, point 2) → graphe Mafs illustratif (`DistanceDroiteGraph`,
 * point 3) → bloc "état actuel" qui accumule les résultats déjà validés
 * (`calculerEtatActuelDistanceDroite`, point 6, `null` tant que rien n'est encore confirmé — même
 * principe que `EtatActuelPanel` ailleurs sur la plateforme). Le système `{b;d}` à résoudre pour
 * trouver Q (Écran "intersectionQ") ET la paire `d_1`/`d_2` du bloc de données sont désormais
 * rendus en système à accolade (`\begin{cases}`), jamais juxtaposés via `\quad` (point 12) — les
 * anciennes fonctions `formatEnonceEquationBLatex`/`formatEnonceIntersectionQLatex`/
 * `formatEnonceDistancePQLatex` (qui dupliquaient ce contenu comme "équation-box" par écran) ont
 * disparu, leur contenu étant désormais entièrement porté par le bloc de données (constant) et le
 * bloc état actuel (accumulatif).
 *
 * Fractions irréductibles (correction transversale chapitre 6, partie C.2) : toute valeur GÉNÉRÉE
 * non entière (pente de `b`, composantes de `\vec{PQ}` substituées) passe par
 * `formatValeurFractionLatex`/`formatMagnitudeFractionLatex` (dupliqués localement, même patron que
 * `formatEquationDroite.ts` — trop petits pour l'extraction), jamais par un formatage décimal
 * (`toFixed`). Audit complet de gen47 pour ce point (`promptgen47modifications.md`, point 11) : le
 * seul écart trouvé était `ResultatPanelDistanceDroite.tsx`, qui interpolait `qAttendu.x`/`.y`
 * directement en texte brut (aucun formatage du tout, pas seulement décimal) — corrigé pour
 * réutiliser `formatPointLatex`.
 *
 * `formatPointLatex`/`libelleBoutonAide` réutilisées directement depuis `formatEquationDroite.ts` —
 * jamais dupliquées (même style que `formatRelationsDroites.ts`/`formatLectureGraphiqueDroite.ts`/
 * `formatConstructionDroite.ts`).
 */
import type { ExerciceDistanceDroite, ExerciceDistanceParalleles, VarianteDistanceDroite } from "../core/distanceDroite.types";
import type { DroiteImplicite } from "../core/droite.types";
import type { Point } from "../core/vecteur.types";
import { formatEquationImpliciteLatex, formatPointLatex, libelleBoutonAide } from "./formatEquationDroite";
import { formatFractionIrreductible } from "./formatFraction";
import type { FragmentConsigne } from "./formatRelationsDroites";
import { PLACEHOLDER_COMPOSANTE, PLACEHOLDER_COORDONNEE, PLACEHOLDER_EQUATION } from "./formatRelationsDroites";

export { formatPointLatex, libelleBoutonAide, PLACEHOLDER_COMPOSANTE, PLACEHOLDER_COORDONNEE, PLACEHOLDER_EQUATION };
export type { FragmentConsigne };

function texte(valeur: string): FragmentConsigne {
  return { type: "texte", valeur };
}
function latex(valeur: string): FragmentConsigne {
  return { type: "latex", valeur };
}

// ============================================================================
// Fraction irréductible pour toute valeur GÉNÉRÉE non entière — mêmes wrappers locaux que
// `formatEquationDroite.ts`/`formatEquationCercleDeveloppee.ts` (correction transversale chapitre
// 6, point C.2), dupliqués plutôt que partagés (trop petits pour l'extraction, déjà la convention
// établie ailleurs dans ce chapitre).
// ============================================================================

function formatMagnitudeFractionLatex(abs: number): string {
  const texteFraction = formatFractionIrreductible(abs);
  const [numerateur, denominateur] = texteFraction.split("/");
  return denominateur === undefined ? numerateur! : `\\frac{${numerateur}}{${denominateur}}`;
}

function formatValeurFractionLatex(valeur: number): string {
  return valeur < 0 ? `-${formatMagnitudeFractionLatex(-valeur)}` : formatMagnitudeFractionLatex(valeur);
}

// ============================================================================
// Couleurs partagées par `DistanceDroiteGraph` — un rôle = une couleur, cohérent sur les 4 écrans.
// ============================================================================

export const COULEUR_D = "#1971c2";
export const COULEUR_B = "#f08c00";
export const COULEUR_P = "#495057";
export const COULEUR_Q = "#2f9e44";

export const LIBELLE_VARIANTE: Record<VarianteDistanceDroite, string> = {
  point: "Distance d'un point à une droite",
  // Symbole ∥ à la place du mot "parallèles" — conformité générale, `promptgen47modifications.md`.
  paralleles: "Distance entre deux droites ∥",
};

/** `d \equiv ax+by+c=0` — notation `\equiv` (jamais `:`) pour nommer une droite, signes/coefficients
 * toujours simplifiés (correction transversale chapitre 6, points 1 et 2). */
function formatDroiteLatex(label: string, d: DroiteImplicite): string {
  return `${label} \\equiv ${formatEquationImpliciteLatex(d.a, d.b, d.c)}`;
}

// ============================================================================
// Consigne générale — point 1, affichée identique sur les 4 écrans (choixPoint compris).
// ============================================================================

export function segmentsConsigneGeneraleDistanceDroite(exercice: ExerciceDistanceDroite): FragmentConsigne[] {
  if (exercice.variante === "paralleles") {
    return [texte("Calcule la distance entre les droites "), latex("d_1"), texte(" et "), latex("d_2"), texte(".")];
  }
  return [texte("Calcule la distance entre la droite "), latex("d"), texte(" et le point "), latex("P"), texte(".")];
}

// ============================================================================
// Bloc de données — point 2, FIXE et répété IDENTIQUE sur les 4 écrans (jamais recalculé selon la
// phase atteinte, contrairement au bloc "état actuel" ci-dessous). Variante "paralleles" : les deux
// droites en système à accolade (point 12) ; variante "point" : la droite et le point, sur deux
// lignes empilées (`\begin{gathered}`, jamais une accolade — un point n'est pas une équation d'un
// système, contrairement au cas `d_1`/`d_2`).
// ============================================================================

export function formatEnonceLatex(exercice: ExerciceDistanceDroite): string {
  if (exercice.variante === "point") {
    return `\\begin{gathered} ${formatDroiteLatex("d", exercice.d)} \\\\ P${formatPointLatex(exercice.point)} \\end{gathered}`;
  }
  return `\\begin{cases} ${formatDroiteLatex("d_1", exercice.d1)} \\\\ ${formatDroiteLatex("d_2", exercice.d2)} \\end{cases}`;
}

// ============================================================================
// Bloc "état actuel" — point 6, accumule au fil des écrans les résultats déjà VALIDÉS (jamais la
// saisie brute de l'élève, même principe que `ui/etatActuel.ts` et dérivés) : le point choisi
// (variante paralleles uniquement, dès l'écran "equationB"), le système `{b;d}` une fois `b`
// construit (dès l'écran "intersectionQ", système à accolade — point 12), puis `Q` une fois trouvé
// (dès l'écran "distancePQ"). `null` tant que rien n'est encore accumulable pour l'écran courant
// (ex. écran "equationB" pour la variante "point" : `d`/`P` déjà entièrement dans le bloc de
// données ci-dessus, rien de nouveau à accumuler) — `EtatActuelPanel` ne rend alors rien, comme
// partout ailleurs sur la plateforme.
// ============================================================================

interface ParamsEtatActuelDistanceDroite {
  variante: VarianteDistanceDroite;
  point: Point | null;
  droiteCible: DroiteImplicite | null;
  bAttendue: DroiteImplicite | null;
  qAttendu: Point | null;
}

export function calculerEtatActuelDistanceDroite(params: ParamsEtatActuelDistanceDroite): string | null {
  const lignes: string[] = [];
  if (params.variante === "paralleles" && params.point) {
    lignes.push(`P${formatPointLatex(params.point)}`);
  }
  if (params.bAttendue && params.droiteCible) {
    lignes.push(`\\begin{cases} ${formatDroiteLatex("b", params.bAttendue)} \\\\ ${formatDroiteLatex("d", params.droiteCible)} \\end{cases}`);
  }
  if (params.qAttendu) {
    lignes.push(`Q${formatPointLatex(params.qAttendu)}`);
  }
  if (lignes.length === 0) return null;
  if (lignes.length === 1) return lignes[0]!;
  return `\\begin{gathered} ${lignes.join(" \\\\ ")} \\end{gathered}`;
}

// ============================================================================
// Écran 0 (variante "paralleles" uniquement) — choisir un point sur la droite désignée.
// ============================================================================

/** Désigne EXPLICITEMENT quelle droite sert de source (spec : jamais un libre choix entre les
 * deux, pour ne jamais avoir besoin d'une vérification conditionnelle sur la droite choisie). */
export function consigneChoixPoint(exercice: ExerciceDistanceParalleles): string {
  const label = exercice.droiteSource === "d1" ? "d₁" : "d₂";
  return `Choisis un point à coordonnées entières sur la droite ${label}.`;
}

/** Explique explicitement COMMENT garantir des coordonnées entières (jamais juste "comment trouver
 * un point") — point 4, `promptgen47modifications.md` : choisir la variable libre comme un
 * multiple du coefficient de l'autre variable pour que la substitution tombe toujours sur un
 * entier. */
export const TEXTE_AIDE_CHOIX_POINT_NIVEAU1 =
  "Pour garantir des coordonnées ENTIÈRES sur une droite ax+by+c=0 : choisis une valeur de x qui soit un multiple de b (le coefficient de y), pour que y=-(ax+c)/b tombe automatiquement sur un entier (ou la méthode symétrique : une valeur de y multiple de a, pour que x tombe sur un entier).";

// ============================================================================
// Écran 1 — équation cartésienne de b (perpendiculaire à la droite cible, passant par le point).
// Explication PAR LES PENTES (point 8, `promptgen47modifications.md`) — remplace l'ancienne
// explication vectorielle (vecteur `(-b;a)`, critère d'orthogonalité), jamais utilisée par ce
// générateur : `b ⊥ d ⟺ m_b=-1/m_d`. Cas particulier `d` verticale/horizontale : mentionné dans le
// texte d'aide par complétude pédagogique, mais jamais exercé en pratique — `tirerVecteurD`
// (`generateurs/distanceDroite/index.ts`) tire toujours un vecteur directeur aux deux composantes
// non nulles (triplets pythagoriciens 3-4-5/6-8-10/5-12-13, jamais de composante nulle), `d` n'est
// donc jamais verticale ni horizontale dans ce générateur — vérifié en lisant le générateur, pas
// besoin d'une contrainte supplémentaire.
// ============================================================================

export function segmentsConsigneEquationB(): FragmentConsigne[] {
  return [texte("Construis l'équation cartésienne de la droite "), latex("b \\perp d"), texte(" passant par "), latex("P"), texte(".")];
}

export const LABEL_CHAMP_EQUATION_B = "Équation cartésienne de b :";

/** Piège central du générateur (spec) : confondre b avec la droite ∥ à d, jamais la ⊥. */
export function segmentsAideEquationBNiveau1(): FragmentConsigne[] {
  return [
    texte("b doit vérifier "),
    latex("b \\perp d"),
    texte(", jamais "),
    latex("b \\parallel d"),
    texte(" — la pente de "),
    latex("b"),
    texte(" est l'opposé de l'inverse de la pente de "),
    latex("d"),
    texte(" : "),
    latex("m_b = -\\dfrac{1}{m_d}"),
    texte(" (si "),
    latex("d"),
    texte(" est verticale — pente non définie — alors "),
    latex("b"),
    texte(" est horizontale, pente "),
    latex("0"),
    texte(", et inversement). Attention à ne pas construire par erreur la droite "),
    latex("b \\parallel d"),
    texte(" passant par "),
    latex("P"),
    texte("."),
  ];
}

/** Substitue les vraies pentes de l'exercice (fraction irréductible si non entières — correction
 * transversale chapitre 6, C.2), jamais le résultat final (l'équation de `b` elle-même). Cas
 * verticale/horizontale géré pour robustesse générale bien que jamais atteint par ce générateur
 * (voir note ci-dessus). */
export function formatAideEquationBNiveau2Latex(droiteCible: DroiteImplicite): string {
  const { a, b } = droiteCible;
  if (b === 0) return `m_d \\text{ non définie (verticale)} \\quad m_b = 0`;
  if (a === 0) return `m_d = 0 \\quad m_b \\text{ non définie (verticale)}`;
  const mD = -a / b;
  const mB = b / a;
  return `m_d = ${formatValeurFractionLatex(mD)} \\quad m_b = -\\dfrac{1}{m_d} = ${formatValeurFractionLatex(mB)}`;
}

// ============================================================================
// Écran 2 — coordonnées de Q = b ∩ d. Repris de la primitive partagée du groupe "droites"
// (`intersectionDeuxDroitesImplicites`/`diagnostiquerIntersection`, `verificationDroite.ts`) —
// jamais d'écran de diagnostic (b et d toujours sécantes par construction). Le système `{b;d}`
// lui-même n'est plus affiché comme "équation-box" séparée : il est désormais porté par le bloc
// "état actuel" (`calculerEtatActuelDistanceDroite`, point 12).
// ============================================================================

export const CONSIGNE_INTERSECTION_Q =
  "Résous le système {b ; d} pour trouver les coordonnées de Q = b ∩ d (arrondi au centième accepté si besoin).";

export const TEXTE_AIDE_INTERSECTION_Q_NIVEAU1 =
  "Résous le système formé par les deux équations, par substitution ou par combinaison linéaire (élimine une inconnue).";

/** Système réduit à UNE seule inconnue (élimination de y par combinaison linéaire) — les vraies
 * valeurs de l'exercice, résolution finale laissée à l'élève (spec, aide 2). Coefficients toujours
 * entiers par construction (combinaison entière de coefficients entiers), aucune fraction possible
 * ici. */
export function formatAideIntersectionQNiveau2Latex(bAttendue: DroiteImplicite, droiteCible: DroiteImplicite): string {
  const coefX = bAttendue.a * droiteCible.b - droiteCible.a * bAttendue.b;
  const constante = bAttendue.c * droiteCible.b - droiteCible.c * bAttendue.b;
  return `(${coefX})\\,x + (${constante}) = 0`;
}

export const LABEL_X_Q = "x_Q=";
export const LABEL_Y_Q = "y_Q=";
/** Champ libre (fraction/décimal acceptés, `parserNombreOuFraction`) — placeholder qui l'indique
 * explicitement, contrairement à `PLACEHOLDER_COORDONNEE` (entier uniquement). */
export const PLACEHOLDER_COORDONNEE_FRACTION = "ex : 3 ou 7/2";

// ============================================================================
// Écran 3 — distance PQ. Notation P/Q cohérente (point 16) — jamais la formule générique A/B
// héritée de "Norme d'un vecteur et distance entre 2 points". Formatage fraction irréductible
// local (point 11) — jamais `formuleSubstitueeNormeLatex`/`formatNombre` de `formatNormeDistance.ts`,
// qui arrondit en décimal (`toFixed(2)`), pas en fraction.
// ============================================================================

/** Tolérance réellement vérifiée = `0.01` — la forme exacte (fraction, `sqrt(...)`) ET une valeur
 * décimale approchée (arrondie au centième) sont TOUTES DEUX acceptées, mais `PLACEHOLDER_DISTANCE_PQ`
 * ne montre que la forme exacte : annoncé explicitement ici (audit de traçabilité de précision). */
export const CONSIGNE_DISTANCE_PQ = "Calcule la distance PQ (forme exacte ou décimale arrondie au centième).";
export const LABEL_DISTANCE_PQ = "dist(PQ) =";
export const FORMULE_GENERALE_DISTANCE_PQ_LATEX = "\\|\\vec{PQ}\\| = \\sqrt{(x_Q-x_P)^2+(y_Q-y_P)^2}";
export const PLACEHOLDER_DISTANCE_PQ = "ex : 5 ou 13/2 ou sqrt(13)";

/** Parenthèse une valeur négative avant de l'élever au carré (`(-3)^2`, jamais `-3^2`) — jamais
 * nécessaire pour une valeur positive. */
function formatFacteurCarreFractionLatex(valeur: number): string {
  return valeur < 0 ? `(${formatValeurFractionLatex(valeur)})` : formatValeurFractionLatex(valeur);
}

/** Substitue les coordonnées RÉELLES de P et Q (fraction irréductible si non entières) — jamais
 * calculée (spec, aide 2). */
export function formatAideDistancePQNiveau2Latex(point: Point, qAttendu: Point): string {
  const dx = qAttendu.x - point.x;
  const dy = qAttendu.y - point.y;
  return `\\sqrt{${formatFacteurCarreFractionLatex(dx)}^2+${formatFacteurCarreFractionLatex(dy)}^2}`;
}

/** Valeur de révélation ("Distance attendue") — toujours entière par construction dans ce
 * générateur (voir `core/distanceDroite.types.ts`), mais formatée en fraction irréductible par
 * robustesse générale plutôt que via `formatScore` (sémantiquement réservé aux scores /100,
 * réutilisé par erreur ici avant ce correctif — point 11). */
export function formatDistanceAttendueLatex(distance: number): string {
  return formatValeurFractionLatex(distance);
}
