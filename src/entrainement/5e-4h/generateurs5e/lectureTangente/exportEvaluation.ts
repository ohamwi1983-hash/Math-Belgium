import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CriteresDifficulte, EnoncePapier, FragmentConsigne, ProfilInstance, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/corrigeTableau";
import type { ExerciceLectureTangente } from "../../core5e/lectureTangente";
import { aDe, echellesDifferentes, fpaQ } from "../../core5e/lectureTangente";
import { qL } from "../../ui5e/nombresTrigo";
import { consigne, consigneGenerale, equationL, figureEnonce, phases, reponse } from "../../ui5e/formatLectureTangente";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceLectureTangente } from "./index";
import { correctionDetailleeLectureTangente } from "./corrigeDetaille";

/**
 * Adaptateur papier de `5gen73` « Lire f(a) et f′(a) sur un graphique » (Connaître). Énoncé papier
 * = consigne + figure (la courbe, la tangente t, A, P, Q, R ; aucune coordonnée écrite), puis de
 * VRAIES questions : a) f(a) [a] ; b) f′(a) et une équation de t [b, c] ; c) comparaison des
 * nombres dérivés [d] — variante inverse : a) f(a) et f′(a) [a, b] ; b) le graphique [c]. Pas de
 * regroupement a), b), c) (figure propre à l'instance ET vraies questions).
 */

type E = ExerciceLectureTangente;
const t = texte;
const f = latex;
const fr = (x: unknown) => x as FragmentConsigne[];

function construireEnonce(e: E): SectionExercice {
  return { enteteFragments: fr(consigneGenerale(e)), enteteHtml: figureEnonce(e), questions: phases(e).map((p) => ({ consigne: fr(consigne(e, p)) })) };
}

function reponseBreve(e: E): FragmentConsigne[] {
  if (e.variante === "inverse") return [t("a) "), ...fr(reponse(e, "valeur")), t(" ; "), ...fr(reponse(e, "pente")), t(" ; b) "), ...fr(reponse(e, "graphique"))];
  return [t("a) "), ...fr(reponse(e, "valeur")), t(" ; b) "), ...fr(reponse(e, "pente")), t(" ; "), f(equationL(e)), t(" ; c) "), ...fr(reponse(e, "comparer"))];
}

function enoncePapier(e: E): EnoncePapier {
  const a = aDe(e);
  if (e.variante === "inverse") {
    return {
      section: {
        enteteFragments: fr(consigneGenerale(e)),
        enteteHtml: figureEnonce(e),
        questions: [{ consigne: [t("Calcule "), f(`f(${a})`), t(" et donne "), f(`f'(${a})`), t(".")] }, { consigne: [t("Lequel des quatre graphiques peut représenter f ? Justifie.")] }],
      },
      etapesParQuestion: [["a", "b"], ["c"]],
      reponseBreve: reponseBreve(e),
    };
  }
  return {
    section: {
      enteteFragments: fr(consigneGenerale(e)),
      enteteHtml: figureEnonce(e),
      questions: [
        { consigne: [t("Lis "), f(`f(${a})`), t(" sur le graphique.")] },
        { consigne: [t("Détermine "), f(`f'(${a})`), t(", puis une équation de la tangente t.")] },
        { consigne: [t("En lequel des points P, Q et R le nombre dérivé de f est-il négatif ? En lequel est-il le plus grand ? Justifie.")] },
      ],
    },
    etapesParQuestion: [["a"], ["b", "c"], ["d"]],
    reponseBreve: reponseBreve(e),
  };
}

function construireCorrection(e: E): BlocCorrection[] {
  return [{ type: "paragraphe", fragments: reponseBreve(e) }];
}

/** Direct : lectures a et d, transformations b (pente) et c (équation) → niveau 1 ; échelles
 * différentes : piège dans les données (carreaux ≠ unités) → niveau 2 ; inverse : f(a) calculé et
 * graphique choisi (deux transformations, f′(a) = lecture), méthode 1 (vérifier point ET pente) →
 * niveau 2. Nombres exacts. */
function criteresDifficulte(e: E): CriteresDifficulte {
  if (e.variante === "inverse") return { etapesTransformation: 2, etapesLecture: 1, methode: 1, piege: 0, nombres: 0, sansCharge: true };
  return { etapesTransformation: 2, etapesLecture: 2, methode: 0, piege: echellesDifferentes(e) ? 1 : 0, nombres: 0, sansCharge: true };
}

function bareme(e: E): BaremeExercice {
  const a = aDe(e);
  if (e.variante === "inverse") {
    return {
      reponseFinale: reponseBreve(e),
      criteres: [
        { sousQuestion: "a", critere: [t("f(a) par l'équation de t : "), ...fr(reponse(e, "valeur"))], points: 1 },
        { sousQuestion: "b", critere: [t("f′(a) = pente de t : "), ...fr(reponse(e, "pente"))], points: 1 },
        { sousQuestion: "c", critere: [t("Graphique choisi : "), ...fr(reponse(e, "graphique"))], points: 1 },
        { sousQuestion: "c", critere: [t("Justification : point de tangence ET pente vérifiés")], points: 1 },
      ],
      erreursFrequentes: [
        { description: [t("f(a) et f′(a) confondus (ordonnée prise pour la pente)")], cout: "0 pt sur les étapes 1 et 2" },
        { description: [t("Droite reconnue sans vérifier où elle touche la courbe")], cout: "0 pt sur l'étape 3" },
      ],
      reponsesAcceptees: [[t("f′(a) en fraction ou en décimal")]],
    };
  }
  return {
    reponseFinale: reponseBreve(e),
    criteres: [
      { sousQuestion: "a", critere: [t("f(a) lu : "), ...fr(reponse(e, "valeur"))], points: 1 },
      { sousQuestion: "b", critere: [t("f′(a) par Δy / Δx sur t : "), f(`f'(${a})=${qL(fpaQ(e))}`)], points: 1 },
      { sousQuestion: "c", critere: [t("Équation de t : "), f(equationL(e))], points: 1 },
      { sousQuestion: "d", critere: [t("Comparaison justifiée par les pentes : "), ...fr(reponse(e, "comparer"))], points: 1 },
    ],
    erreursFrequentes: [
      { description: [t("f′(a) lu comme l'ordonnée de A")], cout: "0 pt sur l'étape 2" },
      ...(echellesDifferentes(e) ? [{ description: [t("Pente comptée en carreaux sans tenir compte de l'échelle")], cout: "moitié des points de l'étape 2" }] : []),
      { description: [t("Équation y = f′(a)x + f(a) (sans le « − a »)")], cout: "moitié des points de l'étape 3" },
      { description: [t("Hauteurs des points comparées au lieu des pentes")], cout: "0 pt sur l'étape 4" },
    ],
    reponsesAcceptees: [[t("f′(a) en fraction ou en décimal ; toute équation équivalente de t ; ordre complet des trois nombres dérivés")]],
  };
}

/** `forme` = variante (aucun verdict tiré dans une variante) ; tout est exact (pas de `calcul`),
 * aucun cas particulier. */
export function profilLectureTangente(e: E): ProfilInstance {
  return { casParticulier: null, forme: e.variante };
}

export const adaptateurEvaluationLectureTangente: AdaptateurFeuilleExercices<E> = {
  titreDocument: "Lire f(a) et f′(a) sur un graphique — Évaluation",
  nomFichierBase: "lire-nombre-derive-graphique",
  genererInstance: genererExerciceLectureTangente,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: construireAvecVarianteId,
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: correctionDetailleeLectureTangente,
  bareme,
  enoncePapier,
  profilInstance: profilLectureTangente,
};
