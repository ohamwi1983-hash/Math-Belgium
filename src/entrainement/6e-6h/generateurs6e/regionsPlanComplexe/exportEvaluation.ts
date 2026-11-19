import type { ExerciceRegions } from "../../core6e/regionsPlanComplexe.types";
import type {
  AdaptateurFeuilleExercices,
  BaremeExercice,
  BlocCorrection,
  EnoncePapier,
  FragmentConsigne,
  SectionExercice,
} from "../../../export/genererFeuilleExercices";
import type { CriteresDifficulte } from "../../../export/genererFeuilleExercices";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { PHASES_REGIONS } from "../../moteur6e/typesRegionsPlanComplexe";
import type { PhaseRegions } from "../../moteur6e/typesRegionsPlanComplexe";
import { conditionsFragments, reponseFragments, t } from "../../ui6e/formatRegionsPlanComplexe";
import { correctionDetailleeRegions } from "./corrigeDetaille";
import { LIBELLE_CAS_REGIONS, profilRegions } from "./profilEvaluation";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceRegions } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceRegions>` de `6gen98` « Régions du plan
 * complexe » — méthode de `.claude/rules/feuilles-evaluations.md`.
 *
 * - `construireEnonce` : une question par écran (étapes a à d), titres « Étape n — … » du corrigé ;
 *   les choix fermés de l'écran deviennent des questions ouvertes (aucune liste d'options ni
 *   figure proposée sur papier).
 * - `enoncePapier` : l'ensemble E (la ou les conditions) et UNE consigne — décrire la frontière,
 *   dire si elle fait partie de E, représenter E. Aucune figure dans l'énoncé (la réponse EST un
 *   graphique) : la région coloriée va dans le corrigé (`figureHtml`, étape d).
 * - Corrigé : par étape, Méthode, Calcul, Piège ciblé, Conclusion (réponse de l'écran).
 * - Version aménagée : même énoncé (le pipeline ne change que la mise en page).
 */

const LETTRES: Record<PhaseRegions, string> = { nature: "a", elements: "b", bord: "c", region: "d" };

function consigneEtape(e: ExerciceRegions, phase: PhaseRegions): FragmentConsigne[] {
  const deux = e.conditions.length > 1;
  switch (phase) {
    case "nature":
      return [t(deux ? "Quelle est la nature de la frontière de chacune des deux conditions ?" : "Quelle est la nature de la frontière de E ?")];
    case "elements":
      return [t(deux ? "Donne les éléments de chaque frontière (centre et rayon, équation de la droite)." : "Donne les éléments de cette frontière (centre et rayon, équation, points, sommet et angles selon le cas).")];
    case "bord":
      return [t(deux ? "Chaque frontière fait-elle partie de E ? Justifie." : "La frontière fait-elle partie de E ? Justifie.")];
    case "region":
      return [t("Représente E dans un repère orthonormé du plan complexe (colorie ou hachure la région, frontière en trait plein si elle est incluse, en pointillés sinon).")];
  }
}

function enteteFragments(e: ExerciceRegions): FragmentConsigne[] {
  return [t("On considère l'ensemble E des points M du plan complexe dont l'affixe "), { type: "latex", valeur: "z" }, t(" vérifie "), ...conditionsFragments(e), t(".")];
}

function construireEnonce(e: ExerciceRegions): SectionExercice {
  return {
    enteteFragments: enteteFragments(e),
    questions: PHASES_REGIONS.map((phase) => ({ consigne: consigneEtape(e, phase) })),
  };
}

function construireCorrection(e: ExerciceRegions): BlocCorrection[] {
  return PHASES_REGIONS.map((phase) => ({ type: "paragraphe", fragments: [t(`${LETTRES[phase]}) `), ...reponseFragments(e, phase)] }));
}

function consignePapier(e: ExerciceRegions): FragmentConsigne[] {
  return [
    t(
      e.conditions.length > 1
        ? "Détermine la nature et les éléments de la frontière de chaque condition, précise si chacune fait partie de E, puis représente E dans un repère orthonormé du plan complexe (colorie ou hachure E ; frontière en trait plein si elle est incluse, en pointillés sinon)."
        : "Détermine la nature et les éléments de la frontière de E, précise si elle fait partie de E, puis représente E dans un repère orthonormé du plan complexe (colorie ou hachure E ; frontière en trait plein si elle est incluse, en pointillés sinon).",
    ),
  ];
}

function reponseBreve(e: ExerciceRegions): FragmentConsigne[] {
  return [t("E est "), ...reponseFragments(e, "region").map((f, i) => (i === 0 && f.type === "texte" ? t(f.valeur.charAt(0).toLowerCase() + f.valeur.slice(1)) : f)), t(".")];
}

function enoncePapier(e: ExerciceRegions): EnoncePapier {
  return {
    section: {
      enteteFragments: enteteFragments(e),
      questions: [{ consigne: consignePapier(e) }],
    },
    etapesParQuestion: [["a", "b", "c", "d"]],
    reponseBreve: reponseBreve(e),
  };
}

const correctionDetaillee = correctionDetailleeRegions;

/** Critères du niveau de difficulté (grille commune, `export/niveauDifficulte.ts`) : méthode et
 * piège jugés par variante (analyse des cinq chapitres), étapes lues sur le corrigé détaillé. */
function criteresDifficulte(e: ExerciceRegions): CriteresDifficulte {
  const methode = e.variante === "mediatrice" || e.variante === "intersection" ? 1 : 0;
  const piege = e.variante === "demi-plan" || e.variante === "intersection" ? 0 : 1;
  // Frontière incluse ou non (verdict lu sur l'inégalité) et représentation : écrans de lecture.
  return { ...etapesDuCorrige(correctionDetaillee(e), ["c", "d"]), methode, piege, anglesEnPi: true };
}

const POIDS: Record<PhaseRegions, number> = { nature: 0.5, elements: 1.5, bord: 0.5, region: 1.5 };

const CRITERE: Record<PhaseRegions, string> = {
  nature: "Nature de la frontière : ",
  elements: "Éléments de la frontière : ",
  bord: "Bord inclus ou exclu, justifié par le type d'inégalité : ",
  region: "Bonne région coloriée (1 pt) et frontière tracée au bon style (0,5 pt) : ",
};

function bareme(e: ExerciceRegions): BaremeExercice {
  const erreurs: BaremeExercice["erreursFrequentes"] = [
    { description: [t("Centre ou point lu avec le mauvais signe (oubli de "), { type: "latex", valeur: "|z+c|=|z-(-c)|" }, t(")")], cout: "−0,5" },
    { description: [t("Côté de la frontière inversé (intérieur/extérieur, à droite/à gauche, côté de A/côté de B, autre secteur)")], cout: "−1" },
    { description: [t("Frontière tracée en trait plein alors que l'inégalité est stricte, ou en pointillés alors qu'elle est large")], cout: "−0,5" },
  ];
  if (e.conditions.length > 1) erreurs.push({ description: [t("Réunion des deux régions au lieu de leur partie commune")], cout: "−1" });
  if (e.conditions.some((c) => c.type === "demiPlan")) erreurs.push({ description: [t("Droite verticale et droite horizontale échangées (Re et Im confondus)")], cout: "−0,5" });
  if (e.conditions.some((c) => c.type === "mediatrice")) erreurs.push({ description: [t("Droite (AB) tracée au lieu de la médiatrice de [AB]")], cout: "−1" });
  if (e.conditions.some((c) => c.type === "secteur")) erreurs.push({ description: [t("Sommet S compté dans E (l'argument de 0 n'existe pas)")], cout: "−0,5" });
  return {
    reponseFinale: reponseBreve(e),
    criteres: PHASES_REGIONS.map((phase) => ({ sousQuestion: LETTRES[phase], critere: [t(CRITERE[phase]), ...reponseFragments(e, phase)], points: POIDS[phase] })),
    erreursFrequentes: erreurs,
    reponsesAcceptees: [[t("Région hachurée ou coloriée ; justification du côté par un point test ou par la lecture géométrique de la condition (distance, abscisse, ordonnée, angle)")]],
  };
}

export const adaptateurEvaluationRegionsPlanComplexe: AdaptateurFeuilleExercices<ExerciceRegions> = {
  titreDocument: "Régions du plan complexe — Évaluation",
  nomFichierBase: "regions-plan-complexe",
  genererInstance: genererExerciceRegions,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id),
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee,
  bareme,
  enoncePapier,
  profilInstance: profilRegions,
  libelleCasParticulier: LIBELLE_CAS_REGIONS,
};
