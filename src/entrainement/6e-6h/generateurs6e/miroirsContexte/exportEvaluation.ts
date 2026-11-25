import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CriteresDifficulte, EnoncePapier, FragmentConsigne, ProfilInstance, SectionExercice } from "../../../export/genererFeuilleExercices";
import { texte } from "../../../export/corrigeTableau";
import type { ExerciceMC } from "../../core6e/miroirsContexte";
import { distance, grandeur, nature, phases, pointT } from "../../core6e/miroirsContexte";
import { coordL, nL } from "../../ui6e/outilsConiquesLotH2";
import { consigne, equationL, NATURES, questionDistance, questionGrandeur, reflechiL, situation, tangenteL } from "../../ui6e/formatMiroirsContexte";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceMC } from "./index";
import { correctionDetailleeMC } from "./corrigeDetaille";

/**
 * Adaptateur papier de `6gen140` « Miroirs en contexte ». Situations : énoncé = la situation (sans le nom
 * de la conique) et TROIS vraies questions (a) la conique et son équation, b) la grandeur du contexte,
 * c) la distance donnée par la définition), étapes a–b, c, d du corrigé. Réflecteur (`ftfp`) : énoncé +
 * consigne globale, quatre étapes au corrigé. Figure (schéma complet) au corrigé seulement. Niveau et durée
 * constants par situation : quatre étapes (la conique est un raisonnement), méthode 2 (l'élève construit
 * le modèle à partir du contexte ; `ftfp` : 1, la parabole est donnée), piège 1 (rayon et diamètre, p et
 * distance focale, a et c ; T de l'autre côté du sommet). `forme` = situation ; aucun cas particulier ;
 * aucun `calcul` (modéliser : règle du 24/11). Regroupement écarté : situation propre à l'instance.
 */

type E = ExerciceMC;
const t = texte;
const fr = (x: unknown) => x as FragmentConsigne[];
const L = (valeur: string): FragmentConsigne => ({ type: "latex", valeur });
const cm = (v: number) => `${nL(v)}\\text{ cm}`;

function construireEnonce(e: E): SectionExercice {
  return { enteteFragments: fr(situation(e)), questions: phases(e).map((p) => ({ consigne: fr(consigne(e, p)) })) };
}

function reponseBreve(e: E): FragmentConsigne[] {
  if (e.variante === "ftfp") return [t("Tangente "), L(tangenteL(e)), t(" ; "), L(`T${coordL(pointT(e))}`), t(" ; "), L(`FT=FP=${cm(grandeur(e))}`), t(" ; rayon réfléchi "), L(reflechiL(e))];
  return [t(`a) ${NATURES[nature(e)].toLowerCase()} d'équation `), L(equationL(e)), t(" · b) "), L(cm(grandeur(e))), t(" · c) "), L(cm(distance(e)))];
}

function enoncePapier(e: E): EnoncePapier {
  if (e.variante === "ftfp") return { section: { enteteFragments: fr(situation(e)), questions: [{ consigne: [t("Détermine une équation de la tangente à "), L("\\Gamma"), t(" en "), L("P"), t(" et les coordonnées de "), L("T"), t(", compare les distances "), L("FT"), t(" et "), L("FP"), t(", puis déduis-en une équation du rayon réfléchi en "), L("P"), t(". Justifie.")] }] }, etapesParQuestion: [["a", "b", "c", "d"]], reponseBreve: reponseBreve(e) };
  return {
    section: {
      enteteFragments: fr(situation(e)),
      questions: [{ consigne: [t("Quelle conique doit être la section pour que la situation fonctionne ? Justifie, puis écris son équation dans le repère donné.")] }, { consigne: fr(questionGrandeur(e)) }, { consigne: fr(questionDistance(e)) }],
    },
    etapesParQuestion: [["a", "b"], ["c"], ["d"]],
    reponseBreve: reponseBreve(e),
  };
}

function construireCorrection(e: E): BlocCorrection[] {
  return [{ type: "paragraphe", fragments: reponseBreve(e) }];
}

function criteresDifficulte(e: E): CriteresDifficulte {
  return { etapesTransformation: 4, etapesLecture: 0, methode: e.variante === "ftfp" ? 1 : 2, piege: 1, nombres: 0, sansCharge: true };
}

function bareme(e: E): BaremeExercice {
  if (e.variante === "ftfp")
    return {
      reponseFinale: reponseBreve(e),
      criteres: [
        { sousQuestion: "a", critere: [t("Tangente par la forme dédoublée : "), L(tangenteL(e))], points: 1 },
        { sousQuestion: "b", critere: [L(`T${coordL(pointT(e))}`)], points: 0.5 },
        { sousQuestion: "c", critere: [L(`FT=FP=${cm(grandeur(e))}`), t(", triangle isocèle en F")], points: 1 },
        { sousQuestion: "d", critere: [t("Angles égaux justifiés, rayon réfléchi "), L(reflechiL(e))], points: 1.5 },
      ],
      erreursFrequentes: [
        { description: [t("Coefficient "), L("2p"), t(" dans la forme dédoublée")], cout: "0 pt sur la tangente" },
        { description: [t("Rayon réfléchi affirmé « par le foyer » sans l'argument du triangle isocèle")], cout: "moitié des points de l'étape 4" },
      ],
      reponsesAcceptees: [[t("Toute équation équivalente ; FP calculée par la formule de la distance ou par la directrice")]],
    };
  return {
    reponseFinale: reponseBreve(e),
    criteres: [
      { sousQuestion: "a", critere: [t("Conique justifiée par la propriété optique : "), t(NATURES[nature(e)].toLowerCase())], points: 1 },
      { sousQuestion: "b", critere: [t("Équation : "), L(equationL(e))], points: 1 },
      { sousQuestion: "c", critere: [L(cm(grandeur(e)))], points: 1 },
      { sousQuestion: "d", critere: [L(cm(distance(e))), t(" par la définition de la conique")], points: 1 },
    ],
    erreursFrequentes: [
      { description: [t("Conique choisie sans justification par la propriété optique")], cout: "moitié des points de la conique" },
      { description: [t("Diamètre pris pour le rayon, ou "), L("p"), t(" pour la distance du sommet au foyer, ou "), L("a"), t(" et "), L("c"), t(" confondus")], cout: "0 pt sur l'étape concernée, la suite est jugée sur sa cohérence" },
    ],
    reponsesAcceptees: [[t("Toute équation équivalente ; longueurs exactes (fraction, racine) avec ou sans unité")]],
  };
}

export function profilMC(e: E): ProfilInstance {
  return { casParticulier: null, forme: e.variante };
}

export const adaptateurEvaluationMC: AdaptateurFeuilleExercices<E> = {
  titreDocument: "Miroirs en contexte — Évaluation",
  nomFichierBase: "miroirs-coniques-contexte",
  genererInstance: genererExerciceMC,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: construireAvecVariante,
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: correctionDetailleeMC,
  bareme,
  enoncePapier,
  profilInstance: profilMC,
};
