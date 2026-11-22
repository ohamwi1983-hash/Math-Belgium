import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CriteresDifficulte, EnoncePapier, FragmentConsigne, SectionExercice } from "../../../export/genererFeuilleExercices";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { correctionDetailleeDeuxDroitesPlan } from "./corrigeDetaille";
import { texte } from "../../../export/fragmentsDocx";
import type { ExerciceDeuxDroites, ExerciceDeuxDroitesPlan } from "../../core/deuxDroitesPlan.types";
import { figureDeuxDroitesPlanSvg } from "../../ui/figureDeuxDroitesPlan";
import {
  LIBELLES_POSITION,
  consigneGenerale,
  droiteContenue,
  droitePercante,
  droiteTexte,
  ecrans,
  lieuTexte,
  listeEt,
  planTexte,
  texteRaison,
} from "../../ui/formatDeuxDroitesPlan";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceDeuxDroitesPlan } from "./index";
import { profilDeuxDroitesPlan } from "./profil";

/**
 * Adaptateur feuilles d'exercices / évaluations de gen100 (« Positions de deux droites et plan
 * déterminé »).
 *
 * Énoncé papier = la consigne générale (solide, points définis, données), la figure (solide et
 * données, JAMAIS de plan coloré ni de point commun) et UNE question globale : les écrans a, b, c
 * (plan commun, position, justification) ou a, b (oui/non, nom du plan ou raison) sont des étapes
 * d'apprentissage et passent dans le corrigé. Le corrigé montre la figure complétée (section du
 * plan commun / déterminé, point commun de deux sécantes — même hors du solide —, plan (Q) et point
 * de percée d'une preuve « gauches »).
 *
 * Toutes les phrases viennent des mêmes fonctions que l'écran (`ui/formatDeuxDroitesPlan.ts`).
 * Séries équilibrées : `profil.ts` (forme = variante + type de données ; le verdict reste tiré au
 * hasard dans chaque série).
 */

function figure(e: ExerciceDeuxDroitesPlan): string {
  return figureDeuxDroitesPlanSvg(e);
}

/** Énoncé STRUCTURÉ (une sous-question par écran) : sert aux titres « Étape n — … » du corrigé. */
function construireEnonce(e: ExerciceDeuxDroitesPlan): SectionExercice {
  return {
    enteteFragments: [texte(consigneGenerale(e))],
    enteteHtml: figure(e),
    questions: ecrans(e).map((ec) => ({ consigne: ec.consigne })),
  };
}

function questionPapier(e: ExerciceDeuxDroitesPlan): string {
  if (e.variante === "positions") {
    return `Les droites ${droiteTexte(e.d1)} et ${droiteTexte(e.d2)} sont-elles sécantes, parallèles ou gauches ? Si elles sont contenues dans un même plan, nomme ce plan. Justifie ta réponse (point commun, droite parallèle aux deux, ou point où l'une perce un plan qui contient l'autre).`;
  }
  return "Ces données déterminent-elles un plan, et un seul ? Si oui, nomme ce plan par trois de ses points ; sinon, explique pourquoi (aucun plan, ou une infinité de plans ?).";
}

function enoncePapier(e: ExerciceDeuxDroitesPlan): EnoncePapier {
  return {
    section: {
      enteteFragments: [texte(consigneGenerale(e))],
      enteteHtml: figure(e),
      questions: [{ consigne: [texte(questionPapier(e))] }],
    },
    etapesParQuestion: [e.variante === "positions" ? ["a", "b", "c"] : ["a", "b"]],
  };
}

// ---------------------------------------------------------------------------------------------
// Réponse brève
// ---------------------------------------------------------------------------------------------

function detailPositions(e: ExerciceDeuxDroites): string {
  const j = e.justification;
  if (j.type === "secantes") return `dans le plan ${planTexte(e.planCommun!)}, elles se coupent ${lieuTexte(j.lieu).replace(/ : il faut prolonger les deux droites$/, "").replace(/, qui n'est pas nommé$/, "")}`;
  if (j.type === "paralleles") return `dans le plan ${planTexte(e.planCommun!)}, toutes deux parallèles à ${droiteTexte(j.options[j.bonne]!)}`;
  return `aucun plan commun : ${droiteTexte(droitePercante(e))} perce le plan ${planTexte(j.plan)}, qui contient ${droiteTexte(droiteContenue(e))}, en ${j.point}`;
}

function reponseBreve(e: ExerciceDeuxDroitesPlan): FragmentConsigne[] {
  if (e.variante === "positions") return [texte(`${LIBELLES_POSITION[e.position]} : ${detailPositions(e)}.`)];
  if (e.determine) return [texte(`Oui, un seul plan : ${planTexte(e.nomPlan!)} (ou tout autre nom formé de trois points non alignés parmi ${listeEt(e.pointsDuPlan)}).`)];
  return [texte(`Non. ${texteRaison(e, "vraie")}`)];
}

// ---------------------------------------------------------------------------------------------
// Corrigé détaillé
// ---------------------------------------------------------------------------------------------

/** Niveau CONSTANT dans un verdict (position des droites, plan déterminé ou non) : famille
 * « positions » — a) plan commun et c) justification raisonnés, b) position = conséquence directe de
 * a) (lecture) ; famille « plan » — deux écrans. Sans charge (le nombre de lignes dépend du verdict),
 * méthode 1 (choisir la propriété du cours), aucun piège dans les données, aucun nombre. */
function criteresDifficulte(e: ExerciceDeuxDroitesPlan): CriteresDifficulte {
  return { ...etapesDuCorrige(correctionDetailleeDeuxDroitesPlan(e), e.variante === "positions" ? ["b"] : []), sansCharge: true, methode: 1, piege: 0, nombres: 0 };
}

function construireCorrection(e: ExerciceDeuxDroitesPlan): BlocCorrection[] {
  return [{ type: "paragraphe", fragments: reponseBreve(e) }];
}

// ---------------------------------------------------------------------------------------------
// Barème
// ---------------------------------------------------------------------------------------------

function bareme(e: ExerciceDeuxDroitesPlan): BaremeExercice {
  if (e.variante === "positions") {
    return {
      reponseFinale: reponseBreve(e),
      criteres: [
        { sousQuestion: "a", critere: [texte(e.planCommun ? `Plan commun trouvé : ${planTexte(e.planCommun)} (ou un autre nom du même plan)` : "Aucun plan commun, avec un argument")], points: 1 },
        { sousQuestion: "b", critere: [texte(`Position : ${LIBELLES_POSITION[e.position].toLowerCase()}`)], points: 1 },
        { sousQuestion: "c", critere: [texte(`Justification : ${detailPositions(e)}`)], points: 2 },
      ],
      erreursFrequentes: [
        { description: [texte("Droites déclarées sécantes parce qu'elles se croisent sur le dessin")], cout: "0 pt sur la position et la justification" },
        { description: [texte("Droites de deux faces différentes déclarées gauches alors qu'elles sont parallèles (donc dans un même plan)")], cout: "0 pt sur la position" },
        { description: [texte("Position annoncée sans justification")], cout: "0 pt sur la justification" },
      ],
      reponsesAcceptees: [[texte("Tout autre nom du même plan (trois de ses points non alignés, dans n'importe quel ordre) ; toute justification équivalente qui s'appuie sur des éléments de la figure.")]],
    };
  }
  return {
    reponseFinale: reponseBreve(e),
    criteres: [
      { sousQuestion: "a", critere: [texte(e.determine ? "Les données déterminent un seul plan" : "Les données ne déterminent pas un plan unique")], points: 1.5 },
      { sousQuestion: "a", critere: [texte(`Propriété utilisée (${e.type === "troisPoints" ? "points alignés ou non" : e.type === "droitePoint" ? "point sur la droite ou non" : "droites sécantes, parallèles ou gauches"})`)], points: 1 },
      { sousQuestion: "b", critere: [texte(e.determine ? `Plan nommé par trois de ses points non alignés : ${planTexte(e.nomPlan!)} (ou équivalent)` : "Raison : une infinité de plans (données alignées) ou aucun plan (droites gauches), bien distingués")], points: 1.5 },
    ],
    erreursFrequentes: [
      { description: [texte("« Trois points alignés : aucun plan » (au lieu d'une infinité de plans)")], cout: "−1" },
      { description: [texte("Plan nommé par trois points alignés, ou par un point qui n'est pas dans le plan")], cout: "0 pt sur le nom" },
    ],
    reponsesAcceptees: [[texte("Tout nom formé de trois points non alignés du plan, dans n'importe quel ordre.")]],
  };
}

export const adaptateurEvaluationDeuxDroitesPlan: AdaptateurFeuilleExercices<ExerciceDeuxDroitesPlan> = {
  profilInstance: profilDeuxDroitesPlan,
  titreDocument: "Positions de deux droites et plan déterminé — Évaluation",
  nomFichierBase: "positions-deux-droites-plan-determine",
  genererInstance: genererExerciceDeuxDroitesPlan,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: construireAvecVariante,
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: correctionDetailleeDeuxDroitesPlan,
  bareme,
  enoncePapier,
};
