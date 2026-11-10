import type { ExerciceEquationDroite } from "../../core/equationDroite.types";
import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, EnoncePapier, EtapeCorrection, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import {
  consigneCoefficients,
  consigneExtraction,
  formatAideCoefficientsNiveau2Latex,
  formatAideExtractionNiveau2Latex,
  formatAideNiveau2PossibiliteCoefficientsLatex,
  formatEnonceLatex,
  formatEquationExpliciteXLatex,
  formatEquationExpliciteYLatex,
  formatEquationImpliciteLatex,
  formatEtatActuelPointVecteurLatex,
  formatPointLatex,
  formatVecteurLatex,
  segmentsAideExtractionNiveau1,
  segmentsConsignePossibiliteCoefficients,
} from "../../ui/formatEquationDroite";
import type { FragmentConsigne } from "../../ui/formatEquationDroite";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceEquationDroite } from "./index";
import { LIBELLE_CAS_PARALLELE_AXE, profilEquationDroite } from "../profilsEvaluation4eCh7Droites";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceEquationDroite>` pour gen42 (Équation d'une
 * droite, `AppEquationDroite.tsx`/`moteur/sessionEquationDroite.ts`) — voir
 * `generateurs/analyseFonction/exportWord.ts` pour le mécanisme générique de référence.
 *
 * Écran → question papier : l'écran interactif enchaîne TOUJOURS "extraction" (point + vecteur
 * directeur) en premier, puis diverge selon `formeCible` sur exactement 1 écran supplémentaire
 * (`moteur/typesEquationDroite.ts::PhaseEquationDroite` — 2 chemins disjoints) :
 * - "implicite"/"parametrique" : `extraction → coefficients` (toute droite admet ces deux formes,
 *   aucun écran "est-ce possible ?" côté écran non plus) → question b) demande directement
 *   l'équation cartésienne ou les équations paramétriques.
 * - "explicite_y"/"explicite_x" : `extraction → possibiliteCoefficients` (écran fusionné,
 *   `promptgen42modificationsv2.md` partie A) → question b) reprend exactement cette même
 *   consigne fusionnée (`segmentsConsignePossibiliteCoefficients`) : "Cette droite peut-elle
 *   s'écrire sous forme y=mx+p (ou x=ny+q) ?", suivie en correction du choix possible/impossible
 *   ET de l'équation qui en découle (forme testée si possible, forme implicite de secours sinon) —
 *   ce sont les SEULES formes où la question a un enjeu réel (`possible` peut être faux, droite
 *   verticale/horizontale, tirée avec une fréquence délibérée par `PROBABILITE_PIEGE` dans
 *   `index.ts`).
 *
 * Donc toujours exactement 2 questions par instance (a) extraction, b) forme cible), comme à
 * l'écran.
 *
 * Correction RESYNTHÉTISÉE depuis les valeurs déjà connues et correctes de l'instance tirée
 * (`referenceImplicite`/`refExpliciteY`/`refExpliciteX`/`point`/`vecteur`), jamais recalculée
 * indépendamment — réutilise directement les formateurs déjà utilisés côté écran interactif
 * (`ui/formatEquationDroite.ts`, aides niveau 1/2 de chaque écran) plutôt que d'en reconstruire de
 * nouveaux : `segmentsAideExtractionNiveau1`/`formatAideExtractionNiveau2Latex` (méthode générique
 * puis substitution, écran "extraction"), `formatAideCoefficientsNiveau2Latex` (substitution,
 * écran "coefficients" — pour "parametrique" cette fonction délègue déjà à
 * `formatRepresentationParametriqueLatex`, qui EST le résultat final, la substitution ne
 * nécessitant aucun calcul supplémentaire pour cette forme), `formatAideNiveau2PossibiliteCoefficients
 * Latex` (substitution adaptée au choix possible/impossible, écran fusionné). Le résultat final
 * simplifié (jamais juste la substitution non résolue) est ensuite affiché via les formateurs de
 * forme finale `formatEquationImpliciteLatex`/`formatEquationExpliciteYLatex`/
 * `formatEquationExpliciteXLatex` (fraction irréductible si non entier, jamais de décimal — même
 * garantie que côté écran).
 *
 * **Aucune zone de réponse** : l'élève répond sur une feuille à part. Les 2 questions de
 * `construireEnonce` sont les ÉTAPES du corrigé ; l'énoncé imprimé vient de `enoncePapier`
 * (refonte `.claude/rules/feuilles-evaluations.md`, voir la section « Papier » plus bas).
 *
 * `regroupable` : NON — 2 questions par instance (jamais 1 seule), et la consigne de la question a)
 * dépend du type de donnée d'entrée (`consigneExtraction`, 5 textes différents selon
 * `donnees.type`) tandis que celle de la question b) dépend de `formeCible` (4 textes différents) —
 * jamais une consigne GÉNÉRIQUE constante comme l'exige `AdaptateurFeuilleExercices.regroupable`
 * (voir sa doc, `export/genererFeuilleExercices.ts`, et le précédent `anglesAssocies/exportEvaluation.ts`
 * pour la même distinction "plusieurs variantes ≠ regroupable si le texte varie avec l'instance").
 */

function construireEnonceEquationDroite(instance: ExerciceEquationDroite): SectionExercice {
  const questionCoefficients: FragmentConsigne[] =
    instance.formeCible === "explicite_y" || instance.formeCible === "explicite_x"
      ? segmentsConsignePossibiliteCoefficients(instance)
      : [texte(consigneCoefficients(instance))];

  return {
    enteteFragments: [texte("On donne : "), latex(formatEnonceLatex(instance))],
    questions: [
      { consigne: [texte(consigneExtraction(instance))] },
      { consigne: questionCoefficients },
    ],
  };
}

/** Question a) — extraction : méthode générique puis substitution, puis le point/vecteur
 * confirmés (même enchaînement que l'aide niveau 1 → niveau 2 de l'écran interactif). */
function fragmentsCorrectionExtraction(instance: ExerciceEquationDroite): FragmentConsigne[] {
  return [
    texte("a) "),
    ...segmentsAideExtractionNiveau1(instance),
    texte(" "),
    latex(formatAideExtractionNiveau2Latex(instance)),
    texte(", donc "),
    latex(formatEtatActuelPointVecteurLatex(instance)),
    texte("."),
  ];
}

/** Justification possible/impossible de la question b) — uniquement pour "explicite_y"/
 * "explicite_x", seules formes où `possible` peut être faux (droite verticale/horizontale). */
function fragmentsJustificationPossibilite(instance: ExerciceEquationDroite): FragmentConsigne[] {
  const forme = instance.formeCible as "explicite_y" | "explicite_x";
  if (forme === "explicite_y") {
    return instance.possible
      ? [texte("Le vecteur directeur n'est pas vertical ("), latex("x_{\\vec{u}} \\neq 0"), texte("), cette forme est donc possible.")]
      : [texte("Le vecteur directeur est vertical ("), latex("x_{\\vec{u}} = 0"), texte("), cette droite est verticale : impossible sous cette forme.")];
  }
  return instance.possible
    ? [texte("Le vecteur directeur n'est pas horizontal ("), latex("y_{\\vec{u}} \\neq 0"), texte("), cette forme est donc possible.")]
    : [texte("Le vecteur directeur est horizontal ("), latex("y_{\\vec{u}} = 0"), texte("), cette droite est horizontale : impossible sous cette forme.")];
}

/** Équation finale simplifiée de la question b), quelle que soit `formeCible` — pour
 * "explicite_y"/"explicite_x" avec `possible === false`, c'est la forme implicite de secours
 * (même principe que `latexGabaritPossibiliteCoefficients`/`formatAideNiveau2PossibiliteCoefficients
 * Latex` côté écran : la forme testée si possible, l'implicite sinon). */
function equationFinaleLatex(instance: ExerciceEquationDroite): string {
  switch (instance.formeCible) {
    case "parametrique":
      return formatAideCoefficientsNiveau2Latex(instance);
    case "implicite":
      return formatEquationImpliciteLatex(instance.referenceImplicite.a, instance.referenceImplicite.b, instance.referenceImplicite.c);
    case "explicite_y":
      return instance.refExpliciteY !== null
        ? formatEquationExpliciteYLatex(instance.refExpliciteY.m, instance.refExpliciteY.p)
        : formatEquationImpliciteLatex(instance.referenceImplicite.a, instance.referenceImplicite.b, instance.referenceImplicite.c);
    case "explicite_x":
      return instance.refExpliciteX !== null
        ? formatEquationExpliciteXLatex(instance.refExpliciteX.n, instance.refExpliciteX.q)
        : formatEquationImpliciteLatex(instance.referenceImplicite.a, instance.referenceImplicite.b, instance.referenceImplicite.c);
  }
}

/** Question b) — forme cible : "parametrique" s'obtient par simple substitution (le gabarit
 * substitué EST déjà le résultat final, aucun calcul de simplification supplémentaire — un seul
 * bloc LaTeX, jamais répété) ; "implicite" affiche la formule substituée puis le résultat simplifié
 * (2 blocs distincts, la substitution `a=…, b=…, c=…` n'étant pas encore l'équation lisible) ;
 * "explicite_y"/"explicite_x" justifient d'abord possible/impossible (seules formes où ça peut être
 * faux) avant la formule substituée puis le résultat qui en découle. */
function fragmentsCorrectionCoefficients(instance: ExerciceEquationDroite): FragmentConsigne[] {
  if (instance.formeCible === "parametrique") {
    return [texte("b) En substituant le point et le vecteur directeur dans le gabarit paramétrique : "), latex(equationFinaleLatex(instance)), texte(".")];
  }

  const fragments: FragmentConsigne[] = [texte("b) ")];
  if (instance.formeCible === "explicite_y" || instance.formeCible === "explicite_x") {
    const choix: "possible" | "impossible" = instance.possible ? "possible" : "impossible";
    fragments.push(...fragmentsJustificationPossibilite(instance), texte(" Formule : "), latex(formatAideNiveau2PossibiliteCoefficientsLatex(instance, choix)));
  } else {
    fragments.push(texte("Formule : "), latex(formatAideCoefficientsNiveau2Latex(instance)));
  }
  fragments.push(texte(", donc "), latex(equationFinaleLatex(instance)), texte("."));
  return fragments;
}

function construireCorrectionEquationDroite(instance: ExerciceEquationDroite): BlocCorrection[] {
  return [
    { type: "paragraphe", fragments: fragmentsCorrectionExtraction(instance) },
    { type: "paragraphe", fragments: fragmentsCorrectionCoefficients(instance) },
  ];
}

// --- Papier (refonte `.claude/rules/feuilles-evaluations.md`) ---
// Les 2 écrans (point + vecteur directeur, puis forme demandée) sont les étapes d'APPRENTISSAGE :
// sur papier, l'énoncé donne la droite (ses données) et UNE consigne — l'équation sous la forme
// demandée. L'extraction devient l'étape « a » du corrigé, la forme demandée l'étape « b ». Le
// verdict « forme explicite impossible » (droite verticale pour y = mx + p, horizontale pour
// x = ny + q) reste à trancher par l'élève : la consigne prévoit toujours les deux issues.

/** Phrase de données, sans aucune méthode : la droite d passe par… */
function donneesTexte(instance: ExerciceEquationDroite): FragmentConsigne[] {
  const d = instance.donnees;
  switch (d.type) {
    case "deux_points":
      return [texte("La droite d passe par les points "), latex(`A${formatPointLatex(d.pointA)}`), texte(" et "), latex(`B${formatPointLatex(d.pointB)}`), texte(".")];
    case "point_vecteur":
      return [texte("La droite d passe par le point "), latex(`A${formatPointLatex(d.point)}`), texte(" et admet pour vecteur directeur "), latex(`\\vec{u}${formatVecteurLatex(d.vecteur)}`), texte(".")];
    case "angle_ox":
      return [texte("La droite d passe par le point "), latex(`A${formatPointLatex(d.point)}`), texte(` et forme un angle de ${d.angleDeg}° avec l'axe Ox.`)];
    case "angle_oy":
      return [texte("La droite d passe par le point "), latex(`A${formatPointLatex(d.point)}`), texte(` et forme un angle de ${d.angleDeg}° avec l'axe Oy.`)];
    case "pente":
      return [texte("La droite d passe par le point "), latex(`A${formatPointLatex(d.point)}`), texte(" et a pour pente "), latex(`m = ${d.pente}`), texte(".")];
  }
}

function consigneGlobale(instance: ExerciceEquationDroite): FragmentConsigne[] {
  switch (instance.formeCible) {
    case "parametrique":
      return [texte("Détermine des équations paramétriques de d.")];
    case "implicite":
      return [texte("Détermine une équation cartésienne de d (forme ax + by + c = 0).")];
    case "explicite_y":
      return [texte("Si c'est possible, écris l'équation de d sous la forme "), latex("y=mx+p"), texte(" ; sinon, justifie pourquoi et donne une équation cartésienne de d.")];
    case "explicite_x":
      return [texte("Si c'est possible, écris l'équation de d sous la forme "), latex("x=ny+q"), texte(" ; sinon, justifie pourquoi et donne une équation cartésienne de d.")];
  }
}

function enoncePapier(instance: ExerciceEquationDroite): EnoncePapier {
  return { section: { enteteFragments: [...donneesTexte(instance), texte(" "), ...consigneGlobale(instance)], questions: [] } };
}

function estExplicite(instance: ExerciceEquationDroite): boolean {
  return instance.formeCible === "explicite_y" || instance.formeCible === "explicite_x";
}

function pieges(instance: ExerciceEquationDroite): EtapeCorrection {
  if (estExplicite(instance) && !instance.possible) {
    return instance.formeCible === "explicite_y"
      ? { label: "Piège", sousQuestion: "b", fragments: [texte("Une droite verticale n'a pas de pente : on ne peut pas l'écrire sous la forme "), latex("y=mx+p"), texte(". Son équation est du type "), latex("x=k"), texte(".")] }
      : { label: "Piège", sousQuestion: "b", fragments: [texte("Une droite horizontale ne peut pas s'écrire sous la forme "), latex("x=ny+q"), texte(" (y n'y varie pas). Son équation est du type "), latex("y=k"), texte(".")] };
  }
  if (instance.donnees.type === "angle_oy") {
    return { label: "Piège", sousQuestion: "a", fragments: [texte("L'angle est donné avec l'axe Oy, pas avec Ox : le vecteur directeur est "), latex("\\begin{pmatrix} \\tan\\alpha \\\\ 1 \\end{pmatrix}"), texte(", et non "), latex("\\begin{pmatrix} 1 \\\\ \\tan\\alpha \\end{pmatrix}"), texte(".")] };
  }
  if (instance.formeCible === "implicite") {
    return { label: "Piège", sousQuestion: "b", fragments: [texte("Les coefficients a et b ne sont pas les composantes du vecteur directeur : "), latex("a = y_{\\vec{u}}"), texte(" et "), latex("b = -x_{\\vec{u}}"), texte(".")] };
  }
  if (instance.formeCible === "parametrique") {
    return { label: "Piège", sousQuestion: "b", fragments: [texte("Chaque équation paramétrique associe une coordonnée du point à la MÊME composante du vecteur directeur : "), latex("x = x_A + x_{\\vec{u}}\\,t"), texte(", jamais "), latex("x = x_A + y_{\\vec{u}}\\,t"), texte(".")] };
  }
  return instance.formeCible === "explicite_y"
    ? { label: "Piège", sousQuestion: "b", fragments: [texte("La pente est le quotient "), latex("m = \\dfrac{y_{\\vec{u}}}{x_{\\vec{u}}}"), texte(", pas son inverse.")] }
    : { label: "Piège", sousQuestion: "b", fragments: [texte("Pour la forme "), latex("x=ny+q"), texte(", le coefficient est "), latex("n = \\dfrac{x_{\\vec{u}}}{y_{\\vec{u}}}"), texte(" (l'inverse de la pente).")] };
}

function correctionDetaillee(instance: ExerciceEquationDroite): EtapeCorrection[] {
  const lignes: EtapeCorrection[] = [
    { label: "Méthode", sousQuestion: "a", fragments: segmentsAideExtractionNiveau1(instance) },
  ];
  if (instance.donnees.type !== "point_vecteur") lignes.push({ label: "Calcul", sousQuestion: "a", fragments: [latex(formatAideExtractionNiveau2Latex(instance))] });
  lignes.push({ label: "Conclusion", sousQuestion: "a", fragments: [latex(`A${formatEtatActuelPointVecteurLatex(instance)}`)] });
  if (estExplicite(instance)) {
    const choix: "possible" | "impossible" = instance.possible ? "possible" : "impossible";
    lignes.push(
      { label: "Condition", sousQuestion: "b", fragments: fragmentsJustificationPossibilite(instance) },
      { label: "Calcul", sousQuestion: "b", fragments: [latex(formatAideNiveau2PossibiliteCoefficientsLatex(instance, choix))] },
    );
  } else if (instance.formeCible === "implicite") {
    lignes.push({ label: "Calcul", sousQuestion: "b", fragments: [latex(formatAideCoefficientsNiveau2Latex(instance))] });
  } else {
    lignes.push({ label: "Méthode", sousQuestion: "b", fragments: [texte("On remplace le point et le vecteur directeur dans "), latex(LATEX_GABARIT_PARAMETRIQUE)] });
  }
  lignes.push({ label: "Conclusion", sousQuestion: "b", fragments: [latex(equationFinaleLatex(instance))] }, pieges(instance));
  return lignes;
}

const LATEX_GABARIT_PARAMETRIQUE = "\\begin{cases} x = x_A + x_{\\vec{u}}\\,t \\\\ y = y_A + y_{\\vec{u}}\\,t \\end{cases}";

function reponseBreve(instance: ExerciceEquationDroite): FragmentConsigne[] {
  if (estExplicite(instance) && !instance.possible) {
    const raison = instance.formeCible === "explicite_y" ? "droite verticale, forme y = mx + p impossible ; " : "droite horizontale, forme x = ny + q impossible ; ";
    return [texte(raison), latex(equationFinaleLatex(instance))];
  }
  return [latex(equationFinaleLatex(instance))];
}

function bareme(instance: ExerciceEquationDroite): BaremeExercice {
  const extraction = [
    { sousQuestion: "a", critere: [texte("Un point de d")], points: 0.5 },
    { sousQuestion: "a", critere: [texte("Un vecteur directeur : "), latex(`\\vec{u}${formatVecteurLatex(instance.vecteur)}`), texte(" (ou un multiple non nul)")], points: 1 },
  ];
  const criteresB = estExplicite(instance)
    ? [
        { sousQuestion: "b", critere: [texte(`Forme demandée ${instance.possible ? "possible (vecteur directeur non" : "impossible, justifiée (vecteur directeur"} ${instance.formeCible === "explicite_y" ? "vertical" : "horizontal"})`)], points: 0.5 },
        { sousQuestion: "b", critere: [texte("Coefficients calculés")], points: 1 },
        { sousQuestion: "b", critere: [texte("Équation finale simplifiée : "), latex(equationFinaleLatex(instance))], points: 1 },
      ]
    : [
        { sousQuestion: "b", critere: [texte("Point et vecteur remplacés dans la bonne forme")], points: 1 },
        { sousQuestion: "b", critere: [texte("Équation finale : "), latex(equationFinaleLatex(instance))], points: 1.5 },
      ];
  return {
    reponseFinale: reponseBreve(instance),
    criteres: [...extraction, ...criteresB],
    erreursFrequentes: [
      instance.donnees.type === "angle_oy"
        ? { description: [texte("Angle avec Oy traité comme un angle avec Ox")], cout: "0 pt sur a)" }
        : { description: [texte("Composantes du vecteur directeur inversées ou de signe faux")], cout: "−1" },
      estExplicite(instance)
        ? { description: [texte(instance.possible ? "Forme déclarée impossible alors que la droite n'est pas parallèle à l'axe concerné" : "Pente (ou coefficient n) inventée pour une droite parallèle à un axe")], cout: "0 pt sur b)" }
        : instance.formeCible === "parametrique"
          ? { description: [texte("Paramètre t oublié, ou « t ∈ ℝ » absent")], cout: "−0,5" }
          : { description: [texte("Équation juste mais non simplifiée (facteur commun non divisé)")], cout: "−0,5" },
    ],
    reponsesAcceptees: [[texte("Toute équation équivalente (multiple non nul ; autre point de d, autre vecteur directeur colinéaire pour les équations paramétriques)")]],
  };
}

/** ★ point et vecteur donnés, forme cartésienne ou paramétrique ; ★★★ angle avec Oy ou forme
 * impossible à reconnaître ; ★★ sinon. */
function difficulte(instance: ExerciceEquationDroite): 1 | 2 | 3 {
  if (instance.donnees.type === "point_vecteur" && !estExplicite(instance)) return 1;
  if (instance.donnees.type === "angle_oy" || (estExplicite(instance) && !instance.possible)) return 3;
  return 2;
}

export const adaptateurEvaluationEquationDroite: AdaptateurFeuilleExercices<ExerciceEquationDroite> = {
  titreDocument: "Équation d'une droite — Évaluation",
  nomFichierBase: "equation-droite",
  genererInstance: genererExerciceEquationDroite,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as Parameters<typeof construireAvecVarianteId>[0]),
  construireEnonce: construireEnonceEquationDroite,
  construireCorrection: construireCorrectionEquationDroite,
  difficulte,
  reponseBreve,
  correctionDetaillee,
  bareme,
  enoncePapier,
  dureeMinutes: 5,
  profilInstance: profilEquationDroite,
  libelleCasParticulier: LIBELLE_CAS_PARALLELE_AXE,
};
