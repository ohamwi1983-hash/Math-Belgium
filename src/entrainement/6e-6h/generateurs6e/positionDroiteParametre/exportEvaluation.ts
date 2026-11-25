import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CriteresDifficulte, EnoncePapier, FragmentConsigne, ProfilInstance, SectionExercice } from "../../../export/genererFeuilleExercices";
import { texte } from "../../../export/corrigeTableau";
import type { ExercicePD } from "../../core6e/positionDroiteParametre";
import { PHASES_PD } from "../../core6e/positionDroiteParametre";
import { consigne, equationXL, LIBELLES_VERDICT, pointsFr, situation, valeursTangenceFr } from "../../ui6e/formatPositionDroiteParametre";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExercicePD } from "./index";
import { correctionDetailleePD } from "./corrigeDetaille";

/**
 * Adaptateur papier de `6gen139` « Position d'une droite et d'une conique selon un paramètre ». Énoncé
 * papier = la conique, la famille d_k et la valeur k₀ étudiée + consigne globale (valeurs de tangence,
 * position de d_{k₀}, points communs) ; les quatre écrans deviennent les étapes a–d du corrigé (figure :
 * conique, d_{k₀}, tangentes de la famille). La position (verdict) n'apparaît jamais dans l'énoncé.
 * Niveau et durée CONSTANTS dans les quatre verdicts : quatre étapes qui transforment, méthode 1, piège 1
 * (coefficient de x² nul, Δ = 0), `sansCharge`. `forme` = conique ; aucun cas particulier (le verdict n'en
 * est jamais un) ; aucun `calcul` (discuter selon un paramètre : règle du 24/11). Regroupement : la
 * conique, la famille et k₀ forment la ligne (entrée `6gen139` de `REGROUPEMENTS`).
 */

type E = ExercicePD;
const t = texte;
const fr = (x: unknown) => x as FragmentConsigne[];
const L = (valeur: string): FragmentConsigne => ({ type: "latex", valeur });

function construireEnonce(e: E): SectionExercice {
  return { enteteFragments: fr(situation(e)), questions: PHASES_PD.map((p) => ({ consigne: fr(consigne(e, p)) })) };
}

function reponseBreve(e: E): FragmentConsigne[] {
  return [t("Tangente pour "), ...fr(valeursTangenceFr(e)), t(" ; "), t(LIBELLES_VERDICT[e.verdict].replace(/^./, (c) => c.toLowerCase())), t(" ; points communs : "), ...fr(pointsFr(e))];
}

function enoncePapier(e: E): EnoncePapier {
  return { section: { enteteFragments: fr(situation(e)), questions: [{ consigne: [t("Détermine les valeurs de "), L("k"), t(" pour lesquelles la droite "), L("d_k"), t(" est tangente à "), L("\\Gamma"), t(", puis précise la position de la droite étudiée par rapport à "), L("\\Gamma"), t(" et ses points communs avec "), L("\\Gamma"), t(". Justifie.")] }] }, etapesParQuestion: [["a", "b", "c", "d"]], reponseBreve: reponseBreve(e) };
}

function construireCorrection(e: E): BlocCorrection[] {
  return [{ type: "paragraphe", fragments: reponseBreve(e) }];
}

function criteresDifficulte(_e: E): CriteresDifficulte {
  return { etapesTransformation: 4, etapesLecture: 0, methode: 1, piege: 1, nombres: 0, sansCharge: true };
}

function bareme(e: E): BaremeExercice {
  return {
    reponseFinale: reponseBreve(e),
    criteres: [
      { sousQuestion: "a", critere: [t("Substitution et équation en x : "), L(equationXL(e))], points: 1 },
      { sousQuestion: "b", critere: [t("Coefficient de "), L("x^2"), t(" examiné, "), L("\\Delta(k)=0"), t(" résolue : "), ...fr(valeursTangenceFr(e))], points: 1.5 },
      { sousQuestion: "c", critere: [t("Position justifiée : "), t(LIBELLES_VERDICT[e.verdict].replace(/^./, (c) => c.toLowerCase()))], points: 0.5 },
      { sousQuestion: "d", critere: [t("Points communs : "), ...fr(pointsFr(e))], points: 1 },
    ],
    erreursFrequentes: [
      { description: [t("Un seul point commun déclaré « tangent » alors que l'équation est du premier degré (droite parallèle à une asymptote ou à l'axe)")], cout: "0 pt sur la position" },
      { description: [L("\\Delta=0"), t(" lu comme « aucun point »")], cout: "0 pt sur la position et les points" },
      { description: [t("Une seule des deux valeurs de "), L("k"), t(" (ellipse, hyperbole)")], cout: "moitié des points de l'étape 2" },
    ],
    reponsesAcceptees: [[t("Toute équation en x proportionnelle ; Δ calculé sur une équation multipliée par un nombre non nul ; points dans un ordre libre")]],
  };
}

export function profilPD(e: E): ProfilInstance {
  return { casParticulier: null, forme: e.variante };
}

export const adaptateurEvaluationPD: AdaptateurFeuilleExercices<E> = {
  titreDocument: "Position d'une droite et d'une conique selon un paramètre — Évaluation",
  nomFichierBase: "position-droite-conique-parametre",
  genererInstance: genererExercicePD,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: construireAvecVariante,
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: correctionDetailleePD,
  bareme,
  enoncePapier,
  profilInstance: profilPD,
};

