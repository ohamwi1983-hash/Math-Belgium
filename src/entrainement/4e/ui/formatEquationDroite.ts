/**
 * Couche présentation — "Équation d'une droite" (`src/generateurs/equationDroite/`,
 * `src/moteur/sessionEquationDroite.ts`). Rendu LaTeX de l'énoncé, consignes/textes d'aide par
 * écran — dérivés uniquement des champs déjà présents sur le contrat, jamais recalculés
 * différemment côté vérification (`moteur/verificationEquationDroite.ts`).
 *
 * Convention "prose + aide texte seul / Katex substitué non résolu" déjà établie ailleurs dans le
 * projet (ex. "Colinéarité") : l'aide de niveau 1 reste en texte simple (méthode générique, jamais
 * de valeur réelle) ; l'aide de niveau 2, quand elle en a une, substitue les vraies valeurs de
 * l'exercice mais ne calcule jamais le résultat final à la place de l'élève.
 */
import type { FormeSortieDroite } from "../core/droite.types";
import type { ExerciceEquationDroite } from "../core/equationDroite.types";
import type { Composantes, Point } from "../core/vecteur.types";
import { formatSommeTermes } from "./formatEquation";
import { formatFractionIrreductible } from "./formatFraction";

// ============================================================================
// Valeurs GÉNÉRÉES par la plateforme (jamais la saisie de l'élève) — toujours en fraction
// irréductible si non entières, jamais en notation décimale (correction transversale chapitre 6,
// partie C.2, `promptgen43gen44etcorrectionschapitre6.md`). Réutilise `formatFractionIrreductible`
// (`ui/formatFraction.ts`, déjà utilisée ailleurs sur la plateforme — "Analyse d'une fonction",
// "Caractéristiques algébriques"), jamais un algorithme PGCD dupliqué. N'affecte QUE l'affichage :
// aucun changement des calculs sous-jacents (`geometrieDroite.ts`), dont les divisions restent des
// `number` flottants — `formatFractionIrreductible` les retrouve exactement (recherche de
// dénominateur borné + tolérance), aucun risque d'arrondi silencieux côté affichage.
// ============================================================================

/** Magnitude (toujours ≥0) en fraction irréductible si non entière, jamais en décimal. */
function formatMagnitudeGenereeLatex(abs: number): string {
  const texteFraction = formatFractionIrreductible(abs);
  const [numerateur, denominateur] = texteFraction.split("/");
  return denominateur === undefined ? numerateur : `\\frac{${numerateur}}{${denominateur}}`;
}

/** Valeur signée autonome (ex. une coordonnée de point/vecteur affichée seule) — jamais un double
 * signe, jamais de décimal. */
function formatValeurGenereeLatex(valeur: number): string {
  return valeur < 0 ? `-${formatMagnitudeGenereeLatex(-valeur)}` : formatMagnitudeGenereeLatex(valeur);
}

/** Même principe que `formatSommeTermes` (`ui/formatEquation.ts`, partagée par les exercices 1-6,
 * où tous les coefficients restent entiers par construction) mais fraction-aware — module frère
 * volontairement DISTINCT plutôt qu'une modification de `formatSommeTermes` elle-même : seul le
 * chapitre 6 a besoin de cette variante (pente/ordonnée à l'origine d'une droite explicite,
 * potentiellement non entières), jamais les exercices 1-6. Coefficient nul omis, coefficient ±1
 * jamais affiché littéralement, jamais de double signe — mêmes 3 règles que `formatSommeTermes`. */
export function formatSommeTermesGeneree(termes: { valeur: number; suffixe: string }[]): string {
  const nonNuls = termes.filter((t) => t.valeur !== 0);
  if (nonNuls.length === 0) return "0";
  return nonNuls
    .map((terme, index) => {
      const abs = Math.abs(terme.valeur);
      const corps = terme.suffixe !== "" && abs === 1 ? terme.suffixe : `${formatMagnitudeGenereeLatex(abs)}${terme.suffixe}`;
      if (index === 0) return terme.valeur < 0 ? `-${corps}` : corps;
      return `${terme.valeur < 0 ? "-" : "+"} ${corps}`;
    })
    .join(" ");
}

/** Un point garde la notation en ligne `(x ; y)` — jamais confondue avec un vecteur (voir
 * `formatVecteurLatex` ci-dessous, notation matricielle colonne, correction transversale
 * chapitre 6, point 5). */
export function formatPointLatex(p: Point): string {
  return `(${formatValeurGenereeLatex(p.x)} ; ${formatValeurGenereeLatex(p.y)})`;
}

/** Composantes d'un vecteur — notation matricielle COLONNE (2×1), jamais la notation en ligne
 * d'un point (correction transversale chapitre 6, point 5 : un vecteur et un point ne doivent
 * jamais partager la même notation à l'écran, même si les deux sont un couple de deux nombres). */
export function formatVecteurLatex(v: Composantes): string {
  return `\\begin{pmatrix} ${formatValeurGenereeLatex(v.x)} \\\\ ${formatValeurGenereeLatex(v.y)} \\end{pmatrix}`;
}

/** Domaine du paramètre d'une représentation paramétrique — toujours précisé explicitement à
 * chaque affichage (correction transversale chapitre 6, point 4), jamais sous-entendu. `lettre`
 * par défaut `"t"`, à adapter si l'instance utilise un autre nom de paramètre (ex. `"s"` pour la
 * seconde droite de "Intersection entre deux droites"). */
export function formatDomaineParametreLatex(lettre = "t"): string {
  return `${lettre} \\in \\mathbb{R}`;
}

/** `ax+by+c=0` — signes/coefficients TOUJOURS simplifiés (coefficient nul omis, ±1 jamais affiché
 * littéralement, jamais deux signes côte à côte comme `+(-4)`) — réutilise `formatSommeTermes`
 * (`ui/formatEquation.ts`, module frère déjà partagé par les exercices 1-6), générique sur le
 * suffixe de chaque terme, jamais un formatage ad hoc dupliqué (correction transversale chapitre
 * 6, point 1). Point d'entrée PARTAGÉ par tous les générateurs "droites" pour toute forme
 * implicite affichée (énoncé, état actuel, révélation, aide).
 */
export function formatEquationImpliciteLatex(a: number, b: number, c: number): string {
  return `${formatSommeTermes([
    { valeur: a, suffixe: "x" },
    { valeur: b, suffixe: "y" },
    { valeur: c, suffixe: "" },
  ])} = 0`;
}

/** `y=mx+p` — même simplification systématique que `formatEquationImpliciteLatex`, et fraction
 * irréductible si `m`/`p` ne sont pas entiers (correction transversale chapitre 6, partie C.2 —
 * seule forme du groupe "droites" où un coefficient généré peut ne pas être entier, `m=v.y/v.x`). */
export function formatEquationExpliciteYLatex(m: number, p: number): string {
  return `y = ${formatSommeTermesGeneree([
    { valeur: m, suffixe: "x" },
    { valeur: p, suffixe: "" },
  ])}`;
}

/** `x=ny+q` — même simplification systématique que `formatEquationImpliciteLatex`, et fraction
 * irréductible si `n`/`q` ne sont pas entiers (correction transversale chapitre 6, partie C.2). */
export function formatEquationExpliciteXLatex(n: number, q: number): string {
  return `x = ${formatSommeTermesGeneree([
    { valeur: n, suffixe: "y" },
    { valeur: q, suffixe: "" },
  ])}`;
}

/** Représentation paramétrique complète ("x = x0 + a·t", "y = y0 + b·t") — signes/coefficients/
 * fractions TOUJOURS simplifiés (correction transversale chapitre 6, parties C.1 et C.2), jamais
 * les constructions ad hoc `x = ${x0} + (${a})\,t` répliquées sans simplification dans chaque
 * fichier `format*Droite.ts`. Point d'entrée PARTAGÉ par tous les générateurs "droites" pour toute
 * représentation paramétrique affichée (énoncé, état actuel, révélation, aide). `lettreParam` par
 * défaut `"t"`, adaptable (ex. `"s"` pour la seconde droite d'"Intersection entre deux droites"). */
export function formatRepresentationParametriqueLatex(x0: number, a: number, y0: number, b: number, lettreParam = "t"): string {
  const ligneX = `x = ${formatSommeTermesGeneree([
    { valeur: x0, suffixe: "" },
    { valeur: a, suffixe: lettreParam },
  ])}`;
  const ligneY = `y = ${formatSommeTermesGeneree([
    { valeur: y0, suffixe: "" },
    { valeur: b, suffixe: lettreParam },
  ])}`;
  return `\\begin{cases} ${ligneX} \\\\ ${ligneY} \\end{cases} \\quad ${formatDomaineParametreLatex(lettreParam)}`;
}

/** Rappel des données de départ (bloc énoncé), dispatché par type de donnée — toujours affiché,
 * inchangé sur les 3 écrans. */
export function formatEnonceLatex(exercice: ExerciceEquationDroite): string {
  const d = exercice.donnees;
  switch (d.type) {
    case "deux_points":
      return `A${formatPointLatex(d.pointA)} \\quad B${formatPointLatex(d.pointB)}`;
    case "point_vecteur":
      return `A${formatPointLatex(d.point)} \\quad \\vec{u}${formatVecteurLatex(d.vecteur)}`;
    case "angle_ox":
      return `A${formatPointLatex(d.point)} \\quad \\alpha = ${d.angleDeg}^\\circ \\text{ (avec } Ox\\text{)}`;
    case "angle_oy":
      return `A${formatPointLatex(d.point)} \\quad \\alpha = ${d.angleDeg}^\\circ \\text{ (avec } Oy\\text{)}`;
    case "pente":
      return `A${formatPointLatex(d.point)} \\quad m = ${d.pente}`;
  }
}

/** Point + vecteur directeur CONFIRMÉS à l'écran 1 — toujours la vraie valeur de l'exercice, jamais
 * la saisie de l'élève (même principe que le reste du projet), rappelée sur les écrans 2/3. */
export function formatEtatActuelPointVecteurLatex(exercice: ExerciceEquationDroite): string {
  return `${formatPointLatex(exercice.point)} \\quad \\vec{u}${formatVecteurLatex(exercice.vecteur)}`;
}

export const LIBELLE_FORME: Record<FormeSortieDroite, string> = {
  parametrique: "paramétrique",
  implicite: "implicite (cartésienne)",
  explicite_y: "explicite, y en fonction de x",
  explicite_x: "explicite, x en fonction de y",
};

/** Gabarit générique (jamais substitué) de chaque forme de sortie — aide niveau 1 de l'écran
 * "coefficients". Paramétrique : notation $A$/$\vec u$ déjà établie à l'écran 1 (`x_A`/`y_A`,
 * `x_{\vec u}`/`y_{\vec u}`), plus jamais l'ancienne notation générique $x_0$/$y_0$/$a$/$b$ sans
 * lien visible avec le reste de l'exercice (`promptgen42modificationsv2.md`, B.4). */
export const LATEX_GABARIT_FORME: Record<FormeSortieDroite, string> = {
  parametrique: "\\begin{cases} x = x_A + x_{\\vec{u}}\\,t \\\\ y = y_A + y_{\\vec{u}}\\,t \\end{cases} \\quad t \\in \\mathbb{R}",
  implicite: "ax + by + c = 0",
  explicite_y: "y = mx + p",
  explicite_x: "x = ny + q",
};

// ============================================================================
// Consigne générale — rappelle l'objectif complet de l'exercice (forme de sortie cible + donnée
// d'entrée), affichée sur les 3 écrans (`promptgen42modifications.md`, point 1). Découpée en
// fragments texte/LaTeX plutôt qu'une seule chaîne LaTeX ou une seule chaîne de prose : les
// symboles ($A$, $B$, $\vec{u}$...) doivent rester rendus en KaTeX (jamais en texte brut, qui ne
// distinguerait plus un point d'un vecteur ni ne rendrait $\alpha$ correctement), mais la phrase
// entière ne peut pas non plus être un unique bloc KaTeX (`white-space: nowrap`, débordement
// mobile garanti pour une phrase de cette longueur) — même principe que `ConsignePointVectoriel`
// (`ui/formatPointVectoriel.ts`), généralisé à plusieurs fragments LaTeX au lieu d'un seul.
// ============================================================================

export type FragmentConsigne = { type: "texte"; valeur: string } | { type: "latex"; valeur: string };

function texte(valeur: string): FragmentConsigne {
  return { type: "texte", valeur };
}
function latex(valeur: string): FragmentConsigne {
  return { type: "latex", valeur };
}

/** "l'équation cartésienne" (singulier, implicite/explicite) ou "les équations paramétriques"
 * (pluriel, la forme paramétrique s'écrivant toujours comme un système à 2 équations). */
function libelleFormeGenerale(forme: FormeSortieDroite): string {
  return forme === "parametrique" ? "les équations paramétriques" : "l'équation cartésienne";
}

/** Fragments du complément final ("...et le point B" / "...et de vecteur directeur u" / ...),
 * dérivés du type de donnée d'ENTRÉE de l'instance — jamais de la forme de sortie. */
function fragmentsComplementDonnee(donnees: ExerciceEquationDroite["donnees"]): FragmentConsigne[] {
  switch (donnees.type) {
    case "deux_points":
      return [texte("et le point "), latex("B")];
    case "point_vecteur":
      return [texte("et de vecteur directeur "), latex("\\vec{u}")];
    case "pente":
      return [texte("et de pente "), latex("m")];
    case "angle_ox":
      return [texte("et faisant un angle "), latex("\\alpha"), texte(" avec l'axe "), latex("Ox")];
    case "angle_oy":
      return [texte("et faisant un angle "), latex("\\alpha"), texte(" avec l'axe "), latex("Oy")];
  }
}

export function segmentsConsigneGeneraleEquationDroite(exercice: ExerciceEquationDroite): FragmentConsigne[] {
  return [
    texte(`Détermine ${libelleFormeGenerale(exercice.formeCible)} de la droite passant par le point `),
    latex("A"),
    texte(" "),
    ...fragmentsComplementDonnee(exercice.donnees),
    texte("."),
  ];
}

// ============================================================================
// Écran 1 — extraction (point + vecteur directeur).
// ============================================================================

export function consigneExtraction(exercice: ExerciceEquationDroite): string {
  switch (exercice.donnees.type) {
    case "deux_points":
      return "Extrais un point et un vecteur directeur de cette droite.";
    case "point_vecteur":
      return "Recopie le point et le vecteur directeur déjà donnés.";
    case "angle_ox":
      return "Détermine un point et un vecteur directeur de cette droite à partir de l'angle donné avec Ox.";
    case "angle_oy":
      return "Détermine un point et un vecteur directeur de cette droite à partir de l'angle donné avec Oy.";
    case "pente":
      return "Détermine un point et un vecteur directeur de cette droite à partir de sa pente.";
  }
}

/** Composantes de $\vec u$ en LaTeX réel ($x_{\vec u}$/$y_{\vec u}$, jamais "(xB−xA ; yB−yA)"/
 * "(1 ; tan α)" en texte brut) — `promptgen46etcorrectionstransversaleschapitre6.md`, points
 * B.1/B.3 : le vecteur directeur cherché est déjà nommé $\vec u$ ailleurs sur cet exercice
 * (`formatEtatActuelPointVecteurLatex`, `fragmentsComplementDonnee`), donc ses composantes doivent
 * suivre la même convention ici. */
export function segmentsAideExtractionNiveau1(exercice: ExerciceEquationDroite): FragmentConsigne[] {
  switch (exercice.donnees.type) {
    case "deux_points":
      return [
        texte("Un vecteur directeur relie deux points quelconques de la droite : ses composantes sont "),
        latex("x_{\\vec{u}} = x_B - x_A"),
        texte(" et "),
        latex("y_{\\vec{u}} = y_B - y_A"),
        texte(". N'importe lequel des deux points peut servir de point de référence."),
      ];
    case "point_vecteur":
      return [texte("Le point et le vecteur directeur sont déjà donnés directement dans l'énoncé.")];
    case "angle_ox":
      return [
        texte("Le vecteur directeur d'une droite faisant un angle "),
        latex("\\alpha"),
        texte(" avec "),
        latex("Ox"),
        texte(" a pour composantes "),
        latex("x_{\\vec{u}} = 1"),
        texte(" et "),
        latex("y_{\\vec{u}} = \\tan\\alpha"),
        texte(" — ou "),
        latex("x_{\\vec{u}} = 0"),
        texte(", "),
        latex("y_{\\vec{u}} = 1"),
        texte(" si "),
        latex("\\alpha = 90^\\circ"),
        texte("."),
      ];
    case "angle_oy":
      return [
        texte("Le vecteur directeur d'une droite faisant un angle "),
        latex("\\alpha"),
        texte(" avec "),
        latex("Oy"),
        texte(" a pour composantes "),
        latex("x_{\\vec{u}} = \\tan\\alpha"),
        texte(" et "),
        latex("y_{\\vec{u}} = 1"),
        texte(" — ou "),
        latex("x_{\\vec{u}} = 1"),
        texte(", "),
        latex("y_{\\vec{u}} = 0"),
        texte(" si "),
        latex("\\alpha = 90^\\circ"),
        texte("."),
      ];
    case "pente":
      return [
        texte("Le vecteur directeur d'une droite de pente "),
        latex("m"),
        texte(" a pour composantes "),
        latex("x_{\\vec{u}} = 1"),
        texte(" et "),
        latex("y_{\\vec{u}} = m"),
        texte("."),
      ];
  }
}

/** Aide niveau 2 — substitution des vraies valeurs de l'exercice, jamais le résultat combiné. */
export function formatAideExtractionNiveau2Latex(exercice: ExerciceEquationDroite): string {
  const d = exercice.donnees;
  switch (d.type) {
    case "deux_points":
      return `\\vec{u} = \\begin{pmatrix} ${d.pointB.x} - (${d.pointA.x}) \\\\ ${d.pointB.y} - (${d.pointA.y}) \\end{pmatrix}`;
    case "point_vecteur":
      return `A${formatPointLatex(d.point)} \\quad \\vec{u}${formatVecteurLatex(d.vecteur)}`;
    case "angle_ox":
      return `\\vec{u} = \\begin{pmatrix} 1 \\\\ \\tan(${d.angleDeg}^\\circ) \\end{pmatrix}`;
    case "angle_oy":
      return `\\vec{u} = \\begin{pmatrix} \\tan(${d.angleDeg}^\\circ) \\\\ 1 \\end{pmatrix}`;
    case "pente":
      return `\\vec{u} = \\begin{pmatrix} 1 \\\\ ${d.pente} \\end{pmatrix}`;
  }
}

// ============================================================================
// Écran 2 — possibilité de la forme cible.
// ============================================================================

export function consignePossibilite(exercice: ExerciceEquationDroite): string {
  return `Cette droite peut-elle s'écrire sous forme ${LIBELLE_FORME[exercice.formeCible]} ?`;
}

// ============================================================================
// Écran 3 — coefficients de la forme cible.
// ============================================================================

export function consigneCoefficients(exercice: ExerciceEquationDroite): string {
  switch (exercice.formeCible) {
    case "parametrique":
      // `promptgen42modificationsv2.md`, B.2 — remplace "Donne une représentation paramétrique de
      // cette droite.", même correction déjà appliquée à "Lecture graphique — équation d'une
      // droite" pour cohérence terminologique.
      return "Donne les équations paramétriques de cette droite.";
    case "implicite":
      return "Donne l'équation cartésienne (implicite) de cette droite.";
    case "explicite_y":
      return "Donne l'équation de cette droite sous la forme y = mx + p.";
    case "explicite_x":
      return "Donne l'équation de cette droite sous la forme x = ny + q.";
  }
}

/** Formule implicite substituée (`a`/`b`/`c` en fonction du point/vecteur CONFIRMÉS) — extraite en
 * primitive séparée pour être réutilisée à la fois par `formatAideCoefficientsNiveau2Latex` (forme
 * cible "implicite") et par `formatAideNiveau2PossibiliteCoefficientsLatex` (écran fusionné,
 * branche "impossible", `promptgen42modificationsv2.md` partie A — la forme implicite de secours
 * y est demandée quelle que soit `exercice.formeCible` réelle, toujours explicite_y/explicite_x). */
function formatAideCoefficientsImpliciteLatex(point: Point, vecteur: Composantes): string {
  return `a = ${vecteur.y}, \\quad b = -(${vecteur.x}), \\quad c = -\\big(a\\cdot ${point.x} + b\\cdot ${point.y}\\big)`;
}

/** Aide niveau 2 — formule substituée avec le point/vecteur CONFIRMÉS, jamais calculée. */
export function formatAideCoefficientsNiveau2Latex(exercice: ExerciceEquationDroite): string {
  const { point, vecteur } = exercice;
  switch (exercice.formeCible) {
    case "parametrique":
      return formatRepresentationParametriqueLatex(point.x, vecteur.x, point.y, vecteur.y);
    case "implicite":
      return formatAideCoefficientsImpliciteLatex(point, vecteur);
    case "explicite_y":
      return `m = \\dfrac{${vecteur.y}}{${vecteur.x}}, \\quad p = ${point.y} - m\\cdot ${point.x}`;
    case "explicite_x":
      return `n = \\dfrac{${vecteur.x}}{${vecteur.y}}, \\quad q = ${point.x} - n\\cdot ${point.y}`;
  }
}

// ============================================================================
// Écran fusionné "possibilité + équation" — formes explicite_y/explicite_x uniquement
// (`promptgen42modificationsv2.md`, partie A). Remplace le couple d'écrans "possibilite" +
// "coefficients" séparés : une seule question ("Cette droite peut-elle s'écrire sous forme
// $x=ny+q$/$y=mx+p$ ?"), suivie d'un champ texte libre dont le contenu attendu dépend du choix de
// l'élève — forme testée si "possible", forme implicite de secours (toujours atteignable, quelle
// que soit l'orientation de la droite) si "impossible".
// ============================================================================

const LATEX_FORME_TESTEE: Record<"explicite_y" | "explicite_x", string> = {
  explicite_y: "y=mx+p",
  explicite_x: "x=ny+q",
};

export function segmentsConsignePossibiliteCoefficients(exercice: ExerciceEquationDroite): FragmentConsigne[] {
  const forme = exercice.formeCible as "explicite_y" | "explicite_x";
  return [texte("Cette droite peut-elle s'écrire sous forme "), latex(LATEX_FORME_TESTEE[forme]), texte(" ?")];
}

/** Aide niveau 1 — gabarit générique (jamais substitué), adapté au choix de l'élève : la forme
 * testée (`exercice.formeCible`) si "possible", la forme implicite si "impossible" — reprend le
 * contenu de l'ancien écran "coefficients" (`LATEX_GABARIT_FORME`), jamais un nouveau gabarit. */
export function latexGabaritPossibiliteCoefficients(exercice: ExerciceEquationDroite, choix: "possible" | "impossible"): string {
  return choix === "possible" ? LATEX_GABARIT_FORME[exercice.formeCible] : LATEX_GABARIT_FORME.implicite;
}

/** Aide niveau 2 — substituée, adaptée au choix de l'élève (même principe que niveau 1). */
export function formatAideNiveau2PossibiliteCoefficientsLatex(exercice: ExerciceEquationDroite, choix: "possible" | "impossible"): string {
  if (choix === "possible") return formatAideCoefficientsNiveau2Latex(exercice);
  return formatAideCoefficientsImpliciteLatex(exercice.point, exercice.vecteur);
}

export const PLACEHOLDER_COORDONNEE = "ex : 3";
export const PLACEHOLDER_COMPOSANTE = "ex : -2";
