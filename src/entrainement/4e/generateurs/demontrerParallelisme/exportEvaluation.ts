import type {
  AdaptateurFeuilleExercices,
  BaremeExercice,
  BlocCorrection,
  CritereBareme,
  EnoncePapier,
  ErreurFrequente,
  EtapeCorrection,
  FragmentConsigne,
  SectionExercice,
} from "../../../export/genererFeuilleExercices";
import { texte } from "../../../export/fragmentsDocx";
import type { ExerciceDemontrerParallelisme, ExerciceDeuxPlansParalleles, ExerciceDroitePlanParallele } from "../../core/demontrerParallelisme.types";
import { figurePositionsPlansSvg } from "../../ui/figurePositionsPlans";
import {
  conclusionCritere,
  conclusionJustification,
  consigneGlobale,
  elementsFigure,
  enonce,
  legendeFigure,
  libelle,
  libelleCandidat,
  nomP,
  phraseSecantes,
  raisonDansPlan,
} from "../../ui/formatDemontrerParallelisme";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceDemontrerParallelisme, texteRaison } from "./index";
import { profilDemontrerParallelisme } from "./profil";

/**
 * Adaptateur feuilles d'exercices / évaluations de gen103 (« Démontrer un parallélisme »).
 *
 * Énoncé papier = le texte (solide, milieux nommés, droite et plan(s)), la figure (plans dessinés par
 * le triangle de leurs trois points, droite de l'énoncé en rouge) et la consigne « Démontre que … »,
 * qui dit QUOI démontrer, jamais la méthode (décision de l'utilisateur). Les écrans d'apprentissage
 * (critère, droite(s) témoin(s), justification(s)) deviennent les étapes a, b, c (d) du corrigé ; la
 * figure complétée (droites témoins, sections des plans) va dans le corrigé (`figureHtml`).
 *
 * Toutes les valeurs viennent des mêmes fonctions que l'écran (`ui/formatDemontrerParallelisme.ts`,
 * `ui/figurePositionsPlans.ts`, `texteRaison`). Séries équilibrées : `profil.ts`.
 */

function echapper(t: string): string {
  return t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function enteteHtml(e: ExerciceDemontrerParallelisme): string {
  return `<p class="paragraphe">${echapper(enonce(e))}</p>${figurePositionsPlansSvg(e, { mode: "papier", ...elementsFigure(e, null, false) })}`;
}

function temoinsAttendus(e: ExerciceDemontrerParallelisme): number | [number, number] {
  return e.variante === "droite-plan" ? e.temoin : e.paireAttendue;
}

/** Consignes des étapes (titres « Étape n — … » du corrigé), rédigées pour le papier. */
function consignesEtapes(e: ExerciceDemontrerParallelisme): string[] {
  if (e.variante === "droite-plan") {
    return [
      `Énonce le critère du cours qui permet de démontrer qu'une droite est parallèle à un plan.`,
      `Trouve une droite du plan ${nomP(e)} parallèle à ${libelle(e.droite)}.`,
      `Justifie ce parallélisme.`,
    ];
  }
  return [
    `Énonce le critère du cours qui permet de démontrer que deux plans sont parallèles.`,
    `Trouve deux droites sécantes du plan ${nomP(e, 0)} parallèles à deux droites du plan ${nomP(e, 1)}.`,
    `Justifie le premier parallélisme.`,
    `Justifie le second parallélisme.`,
  ];
}

function construireEnonce(e: ExerciceDemontrerParallelisme): SectionExercice {
  return {
    enteteFragments: [texte(enonce(e))],
    enteteHtml: enteteHtml(e),
    questions: consignesEtapes(e).map((c) => ({ consigne: [texte(c)] })),
  };
}

function enoncePapier(e: ExerciceDemontrerParallelisme): EnoncePapier {
  return {
    section: { enteteFragments: [], enteteHtml: enteteHtml(e), questions: [{ consigne: [texte(consigneGlobale(e))] }] },
    etapesParQuestion: [e.variante === "droite-plan" ? ["a", "b", "c"] : ["a", "b", "c", "d"]],
  };
}

function reponseBreve(e: ExerciceDemontrerParallelisme): FragmentConsigne[] {
  if (e.variante === "droite-plan") {
    return [texte(`${libelle(e.droite)} ∥ ${libelle(e.raison.droite2)}, une droite du plan ${nomP(e)} : ${texteRaison(e.raison)}`)];
  }
  const [a, b] = e.paireAttendue;
  return [
    texte(
      `${libelleCandidat(e.candidats[a]!)} et ${libelleCandidat(e.candidats[b]!)} ; ${phraseSecantes(e, a, b)}. ${texteRaison(e.candidats[a]!.raison!)} ${texteRaison(e.candidats[b]!.raison!)}`,
    ),
  ];
}

function figureFinale(e: ExerciceDemontrerParallelisme): string {
  return figurePositionsPlansSvg(e, { mode: "papier", ...elementsFigure(e, temoinsAttendus(e), true) });
}

function correctionDroitePlan(e: ExerciceDroitePlanParallele): EtapeCorrection[] {
  const W = e.raison.droite2;
  const hors = e.candidats.find((_, i) => e.defautsCandidats[i]?.includes("bien parallèle"));
  return [
    { label: "Méthode", sousQuestion: "a", fragments: [texte(conclusionCritere(e))] },
    { label: "Droite témoin", sousQuestion: "b", fragments: [texte(`${libelle(W)} est une droite du plan ${nomP(e)} : ${raisonDansPlan(e, W, 0)}.`)] },
    { label: "Justification", sousQuestion: "c", fragments: [texte(texteRaison(e.raison))] },
    {
      label: "Conclusion",
      sousQuestion: "c",
      fragments: [texte(`${conclusionJustification(e, 1)} ${legendeFigure(e, e.temoin, true)}`)],
      figureHtml: figureFinale(e),
    },
    {
      label: "Piège",
      sousQuestion: "b",
      fragments: [
        texte(
          hors
            ? `${libelle(hors)} est aussi parallèle à ${libelle(e.droite)}, mais elle n'est pas dans le plan ${nomP(e)} : elle ne prouve rien. La droite témoin doit être une droite DU plan.`
            : `La droite témoin doit être une droite DU plan et être parallèle à ${libelle(e.droite)} : une droite du plan qui la croise seulement sur le dessin ne convient pas.`,
        ),
      ],
    },
  ];
}

function correctionDeuxPlans(e: ExerciceDeuxPlansParalleles): EtapeCorrection[] {
  const [a, b] = e.paireAttendue;
  const ca = e.candidats[a]!;
  const cb = e.candidats[b]!;
  const dansQ = `${libelle(ca.droite)} et ${libelle(cb.droite)} sont des droites du plan ${nomP(e, 1)}`;
  return [
    { label: "Méthode", sousQuestion: "a", fragments: [texte(conclusionCritere(e))] },
    {
      label: "Droites témoins",
      sousQuestion: "b",
      fragments: [texte(`${libelleCandidat(ca)} et ${libelleCandidat(cb)} ; ${phraseSecantes(e, a, b)}, et ${dansQ}.`)],
    },
    { label: "Justification", sousQuestion: "c", fragments: [texte(texteRaison(ca.raison!))] },
    { label: "Justification", sousQuestion: "d", fragments: [texte(texteRaison(cb.raison!))] },
    {
      label: "Conclusion",
      sousQuestion: "d",
      fragments: [texte(`${conclusionJustification(e, 2)} ${legendeFigure(e, e.paireAttendue, true)}`)],
      figureHtml: figureFinale(e),
    },
    {
      label: "Piège",
      sousQuestion: "b",
      fragments: [texte(`Une seule droite, ou deux droites parallèles entre elles, ne suffisent pas : il faut deux droites SÉCANTES du plan ${nomP(e, 0)}, chacune parallèle à une droite du plan ${nomP(e, 1)}.`)],
    },
  ];
}

function correctionDetaillee(e: ExerciceDemontrerParallelisme): EtapeCorrection[] {
  return e.variante === "droite-plan" ? correctionDroitePlan(e) : correctionDeuxPlans(e);
}

function construireCorrection(e: ExerciceDemontrerParallelisme): BlocCorrection[] {
  return [{ type: "paragraphe", fragments: reponseBreve(e) }];
}

function bareme(e: ExerciceDemontrerParallelisme): BaremeExercice {
  const c = (sousQuestion: string, critere: string, points: number): CritereBareme => ({ sousQuestion, critere: [texte(critere)], points });
  const err = (description: string, cout: string): ErreurFrequente => ({ description: [texte(description)], cout });
  if (e.variante === "droite-plan") {
    return {
      reponseFinale: reponseBreve(e),
      criteres: [
        c("a", "Critère du cours cité (parallèle à une droite du plan)", 1),
        c("b", "Droite du plan, parallèle à la droite donnée, avec son appartenance au plan justifiée", 1.5),
        c("c", "Parallélisme des deux droites justifié par une propriété d'une figure plane (rectangle, parallélogramme, droite des milieux)", 1.5),
      ],
      erreursFrequentes: [
        err("Droite parallèle à la droite donnée, mais qui n'est pas dans le plan", "0 pt sur b)"),
        err("Parallélisme affirmé « au jugé » ou par « aucun point commun »", "0 pt sur c)"),
      ],
      reponsesAcceptees: [[texte("Toute autre droite du plan parallèle à la droite donnée, avec une justification exacte.")]],
    };
  }
  return {
    reponseFinale: reponseBreve(e),
    criteres: [
      c("a", "Critère du cours cité (deux droites sécantes du premier plan parallèles à deux droites du second)", 1),
      c("b", "Deux droites sécantes du premier plan, chacune associée à une droite parallèle du second", 1),
      c("c", "Premier parallélisme justifié", 1),
      c("d", "Second parallélisme justifié", 1),
    ],
    erreursFrequentes: [
      err("Deux droites parallèles entre elles (une seule direction) utilisées pour le critère", "0 pt sur b)"),
      err("Une droite témoin qui n'est pas dans le plan annoncé", "0 pt sur b)"),
      err("Parallélisme affirmé « au jugé » ou parce que les droites sont dans deux faces parallèles", "0 pt sur la justification concernée"),
    ],
    reponsesAcceptees: [[texte("Toute autre paire de droites sécantes du premier plan parallèles à des droites du second, avec des justifications exactes.")]],
  };
}

function difficulte(e: ExerciceDemontrerParallelisme): 1 | 2 | 3 {
  return e.variante === "droite-plan" ? 2 : 3;
}

export const adaptateurEvaluationDemontrerParallelisme: AdaptateurFeuilleExercices<ExerciceDemontrerParallelisme> = {
  profilInstance: profilDemontrerParallelisme,
  titreDocument: "Démontrer un parallélisme — Évaluation",
  nomFichierBase: "demontrer-parallelisme",
  genererInstance: genererExerciceDemontrerParallelisme,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: construireAvecVariante,
  construireEnonce,
  construireCorrection,
  difficulte,
  reponseBreve,
  correctionDetaillee,
  bareme,
  enoncePapier,
  dureeMinutes: 7,
};
