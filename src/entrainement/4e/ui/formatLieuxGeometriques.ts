/**
 * Couche présentation — "Lieux géométriques : intersection", REFONTE COMPLÈTE
 * (`promptgen54refontecomplete.md`) sur 3 écrans (identification / équations / résolution).
 * Réutilise `formatPointLatex`/`formatEquationExpliciteYLatex`/`FragmentConsigne`
 * (`ui/formatEquationDroite.ts`, module frère déjà partagé par le groupe "droites") — jamais
 * dupliqués, même `texte`/`latex` locaux que le reste du chapitre (convention établie, ex.
 * `formatEquationCercleDeveloppee.ts`).
 *
 * ## ⚠️ Convention d'énoncé propre à ce générateur — divergence ASSUMÉE, ne jamais "corriger"
 *
 * Contrairement à la convention standard du chapitre, AUCUNE équation cartésienne de droite
 * n'est jamais affichée en toutes lettres dans l'énoncé, et les mots "centre"/"foyer" ne sont
 * jamais utilisés pour désigner les points caractéristiques du cercle/de la parabole — l'objet même
 * de l'écran 1 est que l'élève déduise LUI-MÊME le type de chaque lieu à partir de sa définition
 * verbale, jamais une donnée déjà nommée. Une fois le type validé (écran 1 confirmé), les écrans 2
 * et 3 peuvent en revanche employer le vocabulaire technique usuel (pente, ordonnée à l'origine,
 * centre, rayon, foyer, paramètre p) dans le récapitulatif "Ce qu'on sait déjà" — l'énoncé verbal
 * d'origine, lui, reste affiché tel quel sur les 3 écrans.
 *
 * Les 2 lieux d'un exercice sont toujours de TYPES DIFFÉRENTS (paire cercle-cercle retirée, voir
 * `core/lieuxGeometriques.types.ts`) : chaque lieu est donc nommé par son type (« la droite », « le
 * cercle »), jamais par un rang « premier »/« second ».
 */
import type { Lieu, LieuCercle, LieuDroite, LieuParabole, NombrePointsIntersection, PaireLieux, TypeLieu } from "../core/lieuxGeometriques.types";
import type { ExerciceLieuxGeometriques } from "../core/lieuxGeometriques.types";
import { formatEquationExpliciteYLatex, formatPointLatex } from "./formatEquationDroite";
import type { FragmentConsigne } from "./formatEquationDroite";
import { formatFractionIrreductible } from "./formatFraction";

export type { FragmentConsigne };
export { formatPointLatex };

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
  droiteParabole: "Droite-parabole",
};

/** Sous-titre affiché AU-DESSUS des champs numériques une fois le type sélectionné à l'écran
 * "identification" (`promptgen53gen54corrections.md`, B.2). Le champ `droite` seul annonce les
 * formes acceptées : `m`/`p` peuvent être de vraies fractions (ex. 3/4), tapables telles quelles
 * (audit chapitre 7, point 60), ou un arrondi au centième (`statutNumerique`, `TOLERANCE=0.01`).
 * `cercle`/`parabole` restent sans note : leurs champs sont toujours des entiers exacts. */
export const SOUS_TITRE_CHAMPS_IDENTIFICATION: Record<TypeLieu, string> = {
  droite: "Pente et ordonnée à l'origine (fraction comme 3/4 ou arrondi au centième) :",
  cercle: "Centre et rayon :",
  parabole: "Foyer et paramètre p :",
};

// ============================================================================
// Placeholders — toujours HORS de l'espace des tirages (audit chapitre 7, point 10 : un exemple
// qui vaut la réponse la donne). Bornes de génération : `generateurs/lieuxGeometriques/index.ts`
// (|m| ≤ 4, |p| ≤ 12, centre et foyer dans [−3 ; 3], R de 2 à 5, p de la parabole ±2 ou ±4, points
// d'intersection dans [−10 ; 10]).
// ============================================================================

export const PLACEHOLDER_PENTE = "ex : 9/2";
export const PLACEHOLDER_ORDONNEE_ORIGINE = "ex : 27/2";
export const PLACEHOLDER_COORDONNEE_CENTRE_FOYER = "ex : 7";
export const PLACEHOLDER_RAYON = "ex : 8";
export const PLACEHOLDER_PARAMETRE_PARABOLE = "ex : 6";
export const PLACEHOLDER_COORDONNEE_INTERSECTION = "ex : 15";

/** Exemple d'équation adapté au TYPE du lieu (audit chapitre 7, point 60 : l'ancien exemple était
 * toujours celui d'un cercle, même pour la droite et la parabole). */
export function placeholderEquation(lieu: Lieu): string {
  switch (lieu.type) {
    case "droite":
      return "ex : y=5x+13";
    case "cercle":
      return "ex : (x-6)^2+(y+7)^2=81";
    case "parabole":
      return lieu.orientation === "vertical" ? "ex : (x-6)^2+(y+5)^2=(y-9)^2" : "ex : (x-6)^2+(y+5)^2=(x-9)^2";
  }
}

// ============================================================================
// Fraction irréductible EXACTE pour toute valeur générée non entière — dénominateur jusqu'à 10 000
// (audit chapitre 7, point 56 : le plafond par défaut de `formatFractionIrreductible`, 100, laissait
// passer des flottants bruts comme `1.173611111111116` pour 169/144).
// ============================================================================

const DENOMINATEUR_MAX_EXACT = 10000;

function fractionTexte(abs: number): string {
  return formatFractionIrreductible(Math.round(abs * 1e9) / 1e9, DENOMINATEUR_MAX_EXACT);
}

function formatMagnitudeFractionLatex(abs: number): string {
  const [numerateur, denominateur] = fractionTexte(abs).split("/");
  return denominateur === undefined ? numerateur! : `\\frac{${numerateur}}{${denominateur}}`;
}

function formatValeurFractionLatex(valeur: number): string {
  return valeur < 0 ? `-${formatMagnitudeFractionLatex(-valeur)}` : formatMagnitudeFractionLatex(valeur);
}

/** `(variable-valeur)^2` — signe simplifié, jamais de double signe. */
function formatBinomeCarreLatex(variable: "x" | "y", valeur: number): string {
  if (valeur === 0) return `${variable}^2`;
  const signe = valeur > 0 ? "-" : "+";
  return `(${variable}${signe}${formatMagnitudeFractionLatex(Math.abs(valeur))})^2`;
}

/** Somme de termes `valeur·suffixe` — coefficient 1 omis, signes simplifiés, fractions exactes. */
function formatSommeTermesLatex(termes: { valeur: number; suffixe: string }[]): string {
  const nonNuls = termes.filter((t) => Math.abs(t.valeur) > 1e-12);
  if (nonNuls.length === 0) return "0";
  return nonNuls
    .map((terme, index) => {
      const abs = Math.abs(terme.valeur);
      const corps = terme.suffixe !== "" && Math.abs(abs - 1) < 1e-12 ? terme.suffixe : `${formatMagnitudeFractionLatex(abs)}${terme.suffixe}`;
      if (index === 0) return terme.valeur < 0 ? `-${corps}` : corps;
      return `${terme.valeur < 0 ? "-" : "+"} ${corps}`;
    })
    .join(" ");
}

// ============================================================================
// Définition VERBALE de chaque lieu — jamais d'équation de droite, jamais "centre"/"foyer".
// ============================================================================

/** Fraction-aware : accepte n'importe quel `m` rationnel, jamais le mot "pente" ni la lettre `m`.
 * `m = 1` et `m = −1` ont leur propre tournure (« égale à leur abscisse », « égale à l'opposé de
 * leur abscisse ») — jamais « −1 fois leur abscisse » (audit chapitre 7, point 7). */
function segmentsDefinitionDroite(droite: LieuDroite): FragmentConsigne[] {
  const segments: FragmentConsigne[] =
    droite.m === 1
      ? [texte("les points dont l'ordonnée est égale à leur abscisse")]
      : droite.m === -1
        ? [texte("les points dont l'ordonnée est égale à l'opposé de leur abscisse")]
        : [texte("les points dont l'ordonnée est égale à "), latex(formatValeurFractionLatex(droite.m)), texte(" fois leur abscisse")];
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

/** Énoncé — toujours visible, identique sur les 3 écrans. Aucune numérotation de rang
 * ("premier"/"second") — les 2 lieux sont introduits sur un pied d'égalité, cohérent avec la
 * vérification par ENSEMBLE de l'écran "identification". */
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
// Description TECHNIQUE d'un lieu (une fois son type validé) — aide niveau 2 de l'écran
// "identification" (UN SEUL des 2 lieux), réponse attendue et correction exportée.
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

/** Caractéristiques d'un lieu en une seule chaîne LaTeX (`\displaystyle` : fractions lisibles) —
 * récapitulatif "Ce qu'on sait déjà" (`recapitulatifLieuxGeometriques.ts`). */
export function formatCaracteristiquesLieuLatex(lieu: Lieu): string {
  switch (lieu.type) {
    case "droite":
      return `\\displaystyle m = ${formatValeurFractionLatex(lieu.m)},\\; p = ${formatValeurFractionLatex(lieu.p)}`;
    case "cercle":
      return `\\displaystyle \\text{centre } ${formatPointLatex(lieu.centre)},\\; R = ${lieu.rayon}`;
    case "parabole":
      return `\\displaystyle \\text{foyer } ${formatPointLatex(lieu.foyer)},\\; p = ${formatValeurFractionLatex(lieu.p)}\\; (\\text{${lieu.orientation === "vertical" ? "axe vertical" : "axe horizontal"}})`;
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

/** Exemple partiel — révèle la description technique d'UN SEUL des 2 lieux (le premier cité dans
 * l'énoncé), jamais du second, pour laisser quelque chose à trouver à l'élève. */
export function segmentsAideIdentificationNiveau2(exercice: ExerciceLieuxGeometriques): FragmentConsigne[] {
  return [texte("Par exemple, pour le premier lieu cité dans l'énoncé : "), ...segmentsDescriptionLieu(exercice.lieu1)];
}

/** Réponse d'identification SAISIE par l'élève, mise en forme pour la fiche de consultation. */
export function formatReponseIdentificationLatex(
  reponse: { type: "droite"; m: number; p: number } | { type: "cercle"; x0: number; y0: number; rayon: number } | { type: "parabole"; xF: number; yF: number; p: number },
): string {
  switch (reponse.type) {
    case "droite":
      return `\\text{Droite : } m = ${formatValeurSaisieLatex(reponse.m)},\\; p = ${formatValeurSaisieLatex(reponse.p)}`;
    case "cercle":
      return `\\text{Cercle : centre } (${formatValeurSaisieLatex(reponse.x0)} ; ${formatValeurSaisieLatex(reponse.y0)}),\\; R = ${formatValeurSaisieLatex(reponse.rayon)}`;
    case "parabole":
      return `\\text{Parabole : foyer } (${formatValeurSaisieLatex(reponse.xF)} ; ${formatValeurSaisieLatex(reponse.yF)}),\\; p = ${formatValeurSaisieLatex(reponse.p)}`;
  }
}

/** Valeur saisie — décimal à virgule tant qu'il est court (« 0,75 »), fraction exacte pour une
 * fraction tapée dont le développement décimal ne se termine pas (« 1/3 », jamais « 0,333… »). */
function formatValeurSaisieLatex(valeur: number): string {
  if (!Number.isFinite(valeur)) return "?";
  const decimal = String(valeur);
  if (decimal.length <= 8) return decimal.replace(".", "{,}");
  return formatValeurFractionLatex(valeur);
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

/** Label du champ de texte libre d'un bloc de l'écran "équations" — repris du TYPE réel du lieu
 * (les 2 lieux sont toujours de types différents), jamais "premier"/"second". */
export function libelleChampEquation(lieu: Lieu): string {
  return `Équation ${LIBELLE_TYPE_LIEU_PARTITIF[lieu.type]} :`;
}

/** Gabarit générique NON substitué — une formule par type de lieu, jamais les valeurs réelles.
 * Parabole : formule PAR DÉFINITION (foyer/directrice), jamais la forme sommet — le sommet n'a
 * jamais été calculé par l'élève à l'écran 1 (seuls foyer et p le sont). */
export function latexGabaritGenerique(type: TypeLieu, orientation?: "vertical" | "horizontal"): string {
  if (type === "droite") return "y = mx + p";
  if (type === "cercle") return "(x-x_0)^2+(y-y_0)^2=R^2";
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

/** Le lieu de type `type` de l'exercice — chaque type apparaît au plus une fois. */
function trouverLieu<T extends Lieu["type"]>(exercice: ExerciceLieuxGeometriques, type: T): Extract<Lieu, { type: T }> {
  const lieu = exercice.lieu1.type === type ? exercice.lieu1 : exercice.lieu2;
  return lieu as Extract<Lieu, { type: T }>;
}

/** L'autre lieu que la droite (cercle ou parabole). */
function lieuCourbe(exercice: ExerciceLieuxGeometriques): LieuCercle | LieuParabole {
  return (exercice.lieu1.type === "droite" ? exercice.lieu2 : exercice.lieu1) as LieuCercle | LieuParabole;
}

/** Réponse attendue de l'écran "équations" — une ligne par lieu, nommée par son type. */
export function formatEquationsAttenduesLatex(exercice: ExerciceLieuxGeometriques): string {
  const courbe = lieuCourbe(exercice);
  const droite = trouverLieu(exercice, "droite");
  return `\\begin{aligned} &\\text{${LIBELLE_TYPE_LIEU[courbe.type]} : } ${formatEquationLieuLatex(courbe)} \\\\ &\\text{Droite : } ${formatEquationLieuLatex(droite)} \\end{aligned}`;
}

// ============================================================================
// Écran 3 — Résolution (catégorie "Aucun"/"Au moins un" + points add-as-needed).
// ============================================================================

export const CONSIGNE_GENERALE_RESOLUTION = "Résous ce système, combien y a-t-il de points d'intersection ?";

export const LIBELLE_AUCUN = "Aucun";
export const LIBELLE_AU_MOINS_UN = "Au moins un";

/** Système à accolade des 2 équations RÉELLES (jamais celles saisies par l'élève, mêmes valeurs
 * déjà validées à l'écran précédent) — courbe d'abord, droite ensuite. */
export function formatEtatActuelSystemeLatex(exercice: ExerciceLieuxGeometriques): string {
  return `\\displaystyle \\begin{cases} ${formatEquationLieuLatex(lieuCourbe(exercice))} \\\\ ${formatEquationLieuLatex(trouverLieu(exercice, "droite"))} \\end{cases}`;
}

/** Méthode selon la grande variante — toujours la substitution de la droite, méthode du cours
 * (« résous le système par substitution »). */
export function segmentsAideResolutionNiveau1(exercice: ExerciceLieuxGeometriques): FragmentConsigne[] {
  switch (exercice.paire) {
    case "cercleDroite":
      return [texte("Substitue l'équation de la droite dans celle du cercle pour obtenir une équation du second degré, puis résous-la.")];
    case "droiteParabole":
      return [texte("Substitue l'équation de la droite dans celle de la parabole pour obtenir une équation du second degré, puis résous-la.")];
  }
}

// ============================================================================
// Substitution RÉELLEMENT effectuée pour l'aide niveau 2 de l'écran "résolution"
// (`promptgen53gen54corrections.md`, B.6) — recalcule, PUREMENT POUR L'AFFICHAGE (jamais consommé
// par `diagnostiquerResolution`/`exercice.quadratique`), les VRAIS coefficients A/B/C dans la
// variable RÉELLEMENT éliminée par la substitution cartésienne décrite à l'aide niveau 1.
//
// Calcul par ÉCHANTILLONNAGE EXACT plutôt que dérivation algébrique manuelle : substituer une
// expression AFFINE (la droite) dans une cible quadratique produit TOUJOURS un polynôme de degré ≤2
// dans le paramètre restant — 3 points d'échantillonnage (différences finies à v=0,1,2) suffisent.
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

/** Cercle-droite : la droite est TOUJOURS résolue en `y=mx+p`, donc la substituer dans l'équation
 * du cercle élimine TOUJOURS `y` — variable "x". */
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

/** Droite-parabole : la substitution NATURELLE dépend de l'orientation de la parabole — verticale :
 * on élimine y via la droite, variable "x" ; horizontale : on élimine x via la droite (résolue en
 * x=(y-p)/m), variable "y". */
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

export function substitutionResolution(exercice: ExerciceLieuxGeometriques): SubstitutionQuadratique {
  switch (exercice.paire) {
    case "cercleDroite":
      return substitutionCercleDroite(exercice);
    case "droiteParabole":
      return substitutionDroiteParabole(exercice);
  }
}

function pgcd(a: number, b: number): number {
  return b === 0 ? a : pgcd(b, a % b);
}

/** Numérateur/dénominateur exacts d'un coefficient (valeur rationnelle, dénominateur ≤ 10 000). */
function numerateurDenominateur(valeur: number): { numerateur: number; denominateur: number } {
  const [numerateur, denominateur] = fractionTexte(Math.abs(valeur)).split("/");
  const signe = valeur < 0 ? -1 : 1;
  return { numerateur: signe * Number(numerateur), denominateur: denominateur === undefined ? 1 : Number(denominateur) };
}

/** Coefficients ENTIERS premiers entre eux, de même signe que `A` positif — l'équation multipliée
 * par le dénominateur commun (ex. `25x² − 30x + 9 = 0` plutôt que `25/16·x² − …`). */
function coefficientsEntiers({ A, B, C }: { A: number; B: number; C: number }): { a: number; b: number; c: number; multiplicateur: number } {
  const fractions = [A, B, C].map(numerateurDenominateur);
  const ppcm = fractions.reduce((acc, f) => (acc * f.denominateur) / pgcd(acc, f.denominateur), 1);
  const entiers = fractions.map((f) => (f.numerateur * ppcm) / f.denominateur);
  const diviseur = entiers.reduce((acc, n) => pgcd(acc, Math.abs(n)), 0) || 1;
  const signe = entiers[0]! < 0 ? -1 : 1;
  const [a, b, c] = entiers.map((n) => (signe * n) / diviseur) as [number, number, number];
  return { a, b, c, multiplicateur: (signe * ppcm) / diviseur };
}

function formatQuadratiqueLatex(variable: "x" | "y", A: number, B: number, C: number): string {
  return `${formatSommeTermesLatex([
    { valeur: A, suffixe: `${variable}^2` },
    { valeur: B, suffixe: variable },
    { valeur: C, suffixe: "" },
  ])} = 0`;
}

/** L'équation du second degré RÉELLEMENT obtenue par la méthode décrite — fractions EXACTES (jamais
 * de flottant brut, audit chapitre 7, point 56), suivie de sa forme à coefficients entiers quand
 * elle diffère (multiplication par le dénominateur commun). Jamais résolue. */
export function formatQuadratiqueSubstitutionLatex(exercice: ExerciceLieuxGeometriques): string {
  const { variable, A, B, C } = substitutionResolution(exercice);
  const exacte = formatQuadratiqueLatex(variable, A, B, C);
  const entiers = coefficientsEntiers({ A, B, C });
  if (entiers.multiplicateur === 1) return `\\displaystyle ${exacte}`;
  return `\\displaystyle ${exacte} \\iff ${formatQuadratiqueLatex(variable, entiers.a, entiers.b, entiers.c)}`;
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
