import type { ExerciceLieuxGeometriques, Lieu } from "../../core/lieuxGeometriques.types";
import type { Point } from "../../core/vecteur.types";
import type { AdaptateurFeuilleExercices, BlocCorrection, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import type { FragmentConsigne } from "../../ui/formatEquationDroite";
import {
  CONSIGNE_GENERALE_EQUATIONS,
  CONSIGNE_GENERALE_IDENTIFICATION,
  CONSIGNE_GENERALE_RESOLUTION,
  formatEquationLieuLatex,
  formatEtatActuelSystemeLatex,
  formatPointLatex,
  formatQuadratiqueSubstitutionLatex,
  libelleChampEquation,
  segmentsAideResolutionNiveau1,
  segmentsDescriptionLieu,
  segmentsEnonce,
  substitutionResolution,
  texteNombrePointsAttendu,
} from "../../ui/formatLieuxGeometriques";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceLieuxGeometriques } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceLieuxGeometriques>` pour gen54 (Intersection de
 * deux lieux géométriques — chapitre "Géométrie analytique plane" (4e), `AppLieuxGeometriques.tsx`)
 * — voir `generateurs/analyseFonction/exportWord.ts` pour le mécanisme générique de référence.
 *
 * **Écran → question, IDENTIQUE pour les 9 variantes** (`moteur/typesLieuxGeometriques.ts` :
 * `PhaseLieuxGeometriques = "identification" | "equations" | "resolution"`, 3 phases fixes,
 * toujours dans le même ordre, jamais de saut conditionnel — voir son commentaire de tête). Les 3
 * grandes variantes (`paire` : cercle-droite, cercle-cercle, droite-parabole) × les 3 sous-cas
 * (`nombrePoints` : 0, 1 tangence, 2) partagent donc EXACTEMENT la même structure papier, jamais de
 * dispatch par variante contrairement à `orthogonalite/exportEvaluation.ts` :
 * - **Écran "identification"** (`EtapeIdentificationLieuxGeometriques.tsx`,
 *   `CONSIGNE_GENERALE_IDENTIFICATION`) → **question a)** : reconnaître le type de chacun des 2
 *   lieux puis en extraire les caractéristiques — même consigne générale, réutilisée telle quelle.
 * - **Écran "equations"** (`EtapeEquationsLieuxGeometriques.tsx`, `CONSIGNE_GENERALE_EQUATIONS`) →
 *   **question b)** : écrire l'équation de chacun des 2 lieux.
 * - **Écran "resolution"** (`EtapeResolutionLieuxGeometriques.tsx`, `CONSIGNE_GENERALE_RESOLUTION`)
 *   → **question c)** : résoudre le système (élimination d'une variable), dénombrer puis donner
 *   le(s) point(s) d'intersection.
 *
 * **PAS `regroupable`** — la doc de `AdaptateurFeuilleExercices.regroupable`
 * (`export/genererFeuilleExercices.ts`) exige un générateur qui produit TOUJOURS une seule question
 * par instance. C'est déjà faux structurellement ici : chaque instance produit 3 questions a/b/c
 * (une par écran), jamais 1 seule — peu importe que les 3 consignes soient chacune GÉNÉRIQUES
 * (`CONSIGNE_GENERALE_*`, indépendantes des valeurs tirées) : `regroupable` suppose une consigne
 * UNIQUE par instance, pas 3.
 *
 * **Aucune zone de réponse vierge** (`reponse: { type: "lignes", nombre: 0 }` sur les 3 questions)
 * — même décision documentée que `orthogonalite`/`triangleQuelconque`/`quelAngle`/
 * `cercleTrigonometrique` (même projet) : l'élève répond sur une feuille à part, jamais sur la
 * copie imprimée.
 *
 * **Aucun graphique** — contrairement à ce qu'un générateur combinant droites/cercles/paraboles
 * pourrait laisser supposer, `AppLieuxGeometriques.tsx` et ses 4 composants d'écran
 * (`Etape*LieuxGeometriques.tsx`, `ResultatPanelLieuxGeometriques.tsx`) ne contiennent AUCUN SVG/
 * Mafs/canvas (vérifié par recherche exhaustive) : chaque lieu est décrit et manipulé purement
 * VERBALEMENT/ALGÉBRIQUEMENT (voir la convention d'énoncé documentée en tête de
 * `ui/formatLieuxGeometriques.ts` — jamais d'équation ni de croquis dans l'énoncé, l'élève déduit
 * le type de chaque lieu de sa définition littérale). `enteteHtml`/SVG n'a donc pas sa place ici ;
 * `enteteFragments` (texte + LaTeX inline) suffit, exactement le même contrat que l'écran.
 *
 * **Correction RESYNTHÉTISÉE** depuis les valeurs déjà connues et correctes de l'instance tirée
 * (`lieu1`/`lieu2`/`points`/`nombrePoints`), en réutilisant directement les formateurs déjà utilisés
 * côté écran interactif (`ui/formatLieuxGeometriques.ts` — `segmentsEnonce`/`segmentsDescriptionLieu`/
 * `libelleChampEquation`/`formatEquationLieuLatex`/`formatEtatActuelSystemeLatex`/
 * `segmentsAideResolutionNiveau1`/`formatQuadratiqueSubstitutionLatex`/`substitutionResolution`/
 * `texteNombrePointsAttendu`/`formatPointLatex`) plutôt que d'en resynthétiser de nouveaux. Seule
 * addition propre à ce fichier : la question c) va plus loin que l'écran (qui s'arrête à poser
 * l'équation du second degré, aide niveau 2 — voir `EtapeResolutionLieuxGeometriques.tsx`, jamais
 * résolue à l'écran) en énonçant aussi ses solutions, extraites directement de `instance.points`
 * (jamais recalculées via le discriminant : la variable réellement éliminée par la méthode décrite
 * — `x` ou `y`, donnée par `substitutionResolution(instance).variable` — est une fonction injective
 * des points d'intersection ici (droite/axe radical toujours résolubles en l'autre variable), donc
 * trier `instance.points` selon cette variable EST trier les racines de l'équation quadratique,
 * sans jamais raisoner indépendamment sur `instance.quadratique`/discriminant).
 */

function formatNombre(valeur: number): string {
  return Number.isInteger(valeur) ? String(valeur) : valeur.toFixed(2).replace(/\.?0+$/, "");
}

/** Points triés selon la composante `variable` — pour 1 ou 2 points, cette composante EST la (les)
 * racine(s) de l'équation quadratique de la question c) (voir le commentaire de tête). */
function trierPointsParVariable(points: Point[], variable: "x" | "y"): Point[] {
  return [...points].sort((p1, p2) => (variable === "x" ? p1.x - p2.x : p1.y - p2.y));
}

function construireEnonceLieuxGeometriques(instance: ExerciceLieuxGeometriques): SectionExercice {
  // Pas de bloc de données séparé ici (voir le commentaire de tête : aucun graphique, énoncé
  // purement verbal) — `segmentsEnonce` est une phrase avec de courts fragments LaTeX inline
  // (nombres/fractions), qu'`enteteFragments` casserait en blocs KaTeX "display" disjoints
  // (`assemblerEvaluationHtml.ts` le rend toujours en mode bloc). On la préfixe donc à la consigne
  // de la question a) à la place, où `question.consigne` est rendu en mode inline (même correction
  // que `distanceDroite`/`relationsDroites/exportEvaluation.ts`).
  return {
    questions: [
      { consigne: [...segmentsEnonce(instance), texte(" "), texte(CONSIGNE_GENERALE_IDENTIFICATION)], reponse: { type: "lignes", nombre: 0 } },
      { consigne: [texte(CONSIGNE_GENERALE_EQUATIONS)], reponse: { type: "lignes", nombre: 0 } },
      { consigne: [texte(CONSIGNE_GENERALE_RESOLUTION)], reponse: { type: "lignes", nombre: 0 } },
    ],
  };
}

/** a) Type + caractéristiques de chacun des 2 lieux, dans l'ordre `lieu1`/`lieu2` (même ordre que
 * l'énoncé — aucune numérotation de rang n'est imposée par le moteur, voir `segmentsEnonce`, mais
 * une correction papier a besoin d'un ordre fixe pour être lisible). */
function fragmentsCorrectionIdentification(lieu1: Lieu, lieu2: Lieu): FragmentConsigne[] {
  return [
    texte("a) Premier lieu — "),
    ...segmentsDescriptionLieu(lieu1),
    texte(". Second lieu — "),
    ...segmentsDescriptionLieu(lieu2),
    texte("."),
  ];
}

/** b) Équation cartésienne de chacun des 2 lieux — labels repris de `libelleChampEquation`, déjà
 * ceux affichés au-dessus du champ de texte libre de l'écran "equations". */
function fragmentsCorrectionEquations(lieu1: Lieu, lieu2: Lieu): FragmentConsigne[] {
  return [
    texte(`b) ${libelleChampEquation(lieu1)} `),
    latex(formatEquationLieuLatex(lieu1)),
    texte(`. ${libelleChampEquation(lieu2)} `),
    latex(formatEquationLieuLatex(lieu2)),
    texte("."),
  ];
}

/** c) Système → méthode (différenciée par `paire`, piège cercle-cercle inclus) → équation du second
 * degré réellement obtenue → ses solutions (extraites de `instance.points`, voir le commentaire de
 * tête) → conclusion (`texteNombrePointsAttendu`). */
function fragmentsCorrectionResolution(instance: ExerciceLieuxGeometriques): FragmentConsigne[] {
  const { variable } = substitutionResolution(instance);

  const fragments: FragmentConsigne[] = [
    texte("c) Système : "),
    latex(formatEtatActuelSystemeLatex(instance)),
    texte(". Méthode : "),
    ...segmentsAideResolutionNiveau1(instance),
    texte(" On obtient l'équation du second degré "),
    latex(formatQuadratiqueSubstitutionLatex(instance)),
    texte("."),
  ];

  if (instance.nombrePoints === 0) {
    fragments.push(texte(` Cette équation n'admet aucune solution réelle : ${texteNombrePointsAttendu(0)}`));
    return fragments;
  }

  const pointsTries = trierPointsParVariable(instance.points, variable);

  if (instance.nombrePoints === 1) {
    const point = pointsTries[0]!;
    const racine = variable === "x" ? point.x : point.y;
    fragments.push(
      texte(` Cette équation admet une solution double ${variable} = ${formatNombre(racine)}, donc les deux lieux sont tangents au point `),
      latex(formatPointLatex(point)),
      texte(` — ${texteNombrePointsAttendu(1)}`),
    );
    return fragments;
  }

  const [p1, p2] = pointsTries as [Point, Point];
  const r1 = variable === "x" ? p1.x : p1.y;
  const r2 = variable === "x" ? p2.x : p2.y;
  fragments.push(
    texte(` Cette équation admet deux solutions ${variable} = ${formatNombre(r1)} et ${variable} = ${formatNombre(r2)}, d'où les deux points d'intersection `),
    latex(formatPointLatex(p1)),
    texte(" et "),
    latex(formatPointLatex(p2)),
    texte(` — ${texteNombrePointsAttendu(2)}`),
  );
  return fragments;
}

function construireCorrectionLieuxGeometriques(instance: ExerciceLieuxGeometriques): BlocCorrection[] {
  return [
    { type: "paragraphe", fragments: fragmentsCorrectionIdentification(instance.lieu1, instance.lieu2) },
    { type: "paragraphe", fragments: fragmentsCorrectionEquations(instance.lieu1, instance.lieu2) },
    { type: "paragraphe", fragments: fragmentsCorrectionResolution(instance) },
  ];
}

export const adaptateurEvaluationLieuxGeometriques: AdaptateurFeuilleExercices<ExerciceLieuxGeometriques> = {
  titreDocument: "Intersection de deux lieux géométriques — Évaluation",
  nomFichierBase: "lieux-geometriques-intersection",
  genererInstance: genererExerciceLieuxGeometriques,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as Parameters<typeof construireAvecVarianteId>[0]),
  construireEnonce: construireEnonceLieuxGeometriques,
  construireCorrection: construireCorrectionLieuxGeometriques,
  // 3 questions substantielles par instance (identification, équations, résolution), une par écran
  // — voir le commentaire de tête pour la raison précise du rejet de `regroupable`.
};
