import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, EnoncePapier, EtapeCorrection, FragmentConsigne, SectionExercice } from "../../../export/genererFeuilleExercices";
import { texte } from "../../../export/fragmentsDocx";
import type { ExerciceDeuxDroites, ExerciceDeuxDroitesPlan, ExercicePlanDetermine } from "../../core/deuxDroitesPlan.types";
import { figureDeuxDroitesPlanSvg } from "../../ui/figureDeuxDroitesPlan";
import {
  LIBELLES_POSITION,
  consigneGenerale,
  droiteContenue,
  droitePercante,
  droiteTexte,
  droitesDuPlan,
  ecrans,
  lieuTexte,
  listeEt,
  phrasePosition,
  piegePlan,
  piegePositions,
  planTexte,
  reponseJustification,
  reponseNomPlan,
  reponsePlanCommun,
  reponseVerdictPlan,
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

function lecturePlanCommun(e: ExerciceDeuxDroites): string {
  const quatre = [...e.d1, ...e.d2];
  if (e.planCommun) return `Le plan ${planTexte(e.planCommun)} contient les quatre points ${listeEt(quatre)} : il contient donc les deux droites.`;
  const j = e.justification;
  if (j.type !== "gauches") return "";
  const percante = droitePercante(e);
  const autre = percante.find((n) => n !== j.point)!;
  return `Un plan qui contiendrait les deux droites contiendrait ${droiteTexte(droiteContenue(e))} et le point ${j.point} : ce serait le plan ${planTexte(j.plan)}. Or ${autre} n'est pas dans ce plan. Aucun plan ne contient donc les deux droites.`;
}

function conclusionPosition(e: ExerciceDeuxDroites): string {
  if (e.position === "gauches") return `Aucun plan ne les contient toutes les deux. ${phrasePosition(e)}`;
  if (e.position === "paralleles") return `Dans le plan ${planTexte(e.planCommun!)}, elles ont la même direction et aucun point commun. ${phrasePosition(e)}`;
  return `Dans le plan ${planTexte(e.planCommun!)}, elles n'ont pas la même direction : elles se coupent. ${phrasePosition(e)}`;
}

function correctionPositions(e: ExerciceDeuxDroites): EtapeCorrection[] {
  return [
    { label: "Méthode", sousQuestion: "a", fragments: [texte("Deux droites sont dans un même plan si un plan contient leurs quatre points : un plan contient une droite dès qu'il contient deux de ses points.")] },
    { label: "Lecture", sousQuestion: "a", fragments: [texte(lecturePlanCommun(e))] },
    { label: "Conclusion", sousQuestion: "a", fragments: [texte(reponsePlanCommun(e))] },
    { label: "Conclusion", sousQuestion: "b", fragments: [texte(conclusionPosition(e))] },
    { label: "Justification", sousQuestion: "c", fragments: [texte(reponseJustification(e))], figureHtml: figureDeuxDroitesPlanSvg(e, { corrige: true, largeurMax: 360 }) },
    { label: "Piège", sousQuestion: e.position === "gauches" ? "b" : "c", fragments: [texte(piegePositions(e))] },
  ];
}

function methodePlan(e: ExercicePlanDetermine): string {
  if (e.type === "troisPoints") return "Trois points déterminent un seul plan s'ils ne sont pas alignés. Trois points alignés en déterminent une infinité (tous les plans qui contiennent leur droite).";
  if (e.type === "droitePoint") return "Une droite et un point déterminent un seul plan si le point n'est pas sur la droite ; sinon, une infinité de plans les contiennent.";
  return "Deux droites sécantes ou parallèles déterminent un seul plan ; deux droites gauches n'en déterminent aucun.";
}

function correctionPlan(e: ExercicePlanDetermine): EtapeCorrection[] {
  const droites = droitesDuPlan(e);
  const etapes: EtapeCorrection[] = [
    { label: "Méthode", sousQuestion: "a", fragments: [texte(methodePlan(e))] },
    ...(droites ? [{ label: "Preuve", sousQuestion: "a", fragments: [texte(reponseJustification(droites))] }] : []),
    { label: "Conclusion", sousQuestion: "a", fragments: [texte(reponseVerdictPlan(e))] },
  ];
  if (e.determine) {
    etapes.push({
      label: "Nom du plan",
      sousQuestion: "b",
      fragments: [texte(`${reponseNomPlan(e)} Les lettres peuvent être écrites dans n'importe quel ordre.`)],
      figureHtml: figureDeuxDroitesPlanSvg(e, { corrige: true, largeurMax: 360 }),
    });
  } else {
    etapes.push({ label: "Raison", sousQuestion: "b", fragments: [texte(texteRaison(e, "vraie"))] });
  }
  etapes.push({ label: "Piège", sousQuestion: e.determine ? "a" : "b", fragments: [texte(piegePlan(e))] });
  return etapes;
}

function correctionDetaillee(e: ExerciceDeuxDroitesPlan): EtapeCorrection[] {
  return e.variante === "positions" ? correctionPositions(e) : correctionPlan(e);
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
  difficulte: (e) => (e.variante === "positions" || e.type === "deuxDroites" ? 2 : 1),
  reponseBreve,
  correctionDetaillee,
  bareme,
  enoncePapier,
  dureeMinutes: 5,
};
