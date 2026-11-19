import type {
  AdaptateurFeuilleExercices,
  BaremeExercice,
  BlocCorrection,
  CritereBareme,
  EnoncePapier,
  ErreurFrequente,
  FragmentConsigne,
  SectionExercice,
} from "../../../export/genererFeuilleExercices";
import type { CriteresDifficulte } from "../../../export/genererFeuilleExercices";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { latex, texte } from "../../../export/fragmentsDocx";
import { fragmentsVersHtml } from "../../../export/genererFeuilleExercicesHtml";
import type {
  ConditionPortrait,
  ExerciceDeduction,
  ExercicePortraitRobot,
} from "../../core/portraitRobotFonction.types";
import {
  LETTRES_COURBES,
  avecMajuscule,
  conditionFragments,
  consigneGenerale,
  consignesEcrans,
  donneesDeductionFragments,
  expressionLatex,
  gaucheDroiteImages,
  gaucheDroiteValeur,
  imageLatex,
  indicesCourbesEcartees,
  nombreLatex,
} from "../../ui/formatPortraitRobot";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExercicePortraitRobot, valeurOpposee } from ".";
import { correctionDetailleePortraitRobot } from "./corrigeDetaille";
import { LIBELLE_CAS_PORTRAIT_ROBOT, profilPortraitRobot } from "./profil";

/**
 * Adaptateur de feuilles d'exercices / évaluations de gen71 (« Le portrait-robot d'une fonction »,
 * 4e, chapitre 3, processus 3 TRANSFÉRER). Contrat complet de `.claude/rules/feuilles-evaluations.md` :
 * - énoncé papier = les données + les VRAIES questions (A : trouver une expression et justifier ;
 *   B : la valeur et les deux comparaisons, « justifie » ; C : les 4 courbes en figure, « laquelle ?
 *   justifie en écartant les autres ») — les écrans de guidage passent au corrigé (« Étape n ») ;
 * - aucune place de réponse, version aménagée = même énoncé ;
 * - tous les textes viennent de `ui/formatPortraitRobot.ts`, la source de l'écran.
 */

// ---------------------------------------------------------------------------------------------
// Figures
// ---------------------------------------------------------------------------------------------

import { figureExpression, grilleCourbes } from "./figures";

function listeHtml(items: FragmentConsigne[][]): string {
  return `<ul class="paragraphe">${items.map((f) => `<li>${fragmentsVersHtml([...f, texte(".")])}</li>`).join("")}</ul>`;
}

function conditionsAvecMajuscule(conditions: ConditionPortrait[]): FragmentConsigne[][] {
  return conditions.map((c) => avecMajuscule(conditionFragments(c)));
}

// ---------------------------------------------------------------------------------------------
// Énoncés
// ---------------------------------------------------------------------------------------------

function donneesHtml(e: ExercicePortraitRobot): string {
  if (e.famille === "deduction") return listeHtml(donneesDeductionFragments(e).map(avecMajuscule));
  if (e.famille === "expression") return listeHtml(conditionsAvecMajuscule(e.conditions));
  return listeHtml(conditionsAvecMajuscule(e.conditions)) + grilleCourbes(e);
}

/** Énoncé STRUCTURÉ (une sous-question par écran) : sert aux titres « Étape n — … » du corrigé. */
function construireEnonce(e: ExercicePortraitRobot): SectionExercice {
  return {
    enteteFragments: [texte(consigneGenerale(e.famille))],
    enteteHtml: donneesHtml(e),
    questions: consignesEcrans(e).map((consigne) => ({ consigne })),
  };
}

function enoncePapier(e: ExercicePortraitRobot): EnoncePapier {
  if (e.famille === "expression") {
    return {
      section: {
        enteteFragments: [texte(consigneGenerale(e.famille))],
        enteteHtml: donneesHtml(e),
        questions: [{ consigne: [texte("Trouve une expression de f et justifie ta démarche.")] }],
      },
      etapesParQuestion: [["a", "b", "c", "d"]],
    };
  }
  if (e.famille === "deduction") {
    const [g1, d1] = gaucheDroiteImages(e.comparaisonImages);
    const [g2, d2] = gaucheDroiteValeur(e, e.comparaisonValeur);
    return {
      section: {
        enteteFragments: [texte(consigneGenerale(e.famille))],
        enteteHtml: donneesHtml(e),
        questions: [
          { consigne: [texte("Que vaut "), latex(imageLatex(-e.p)), texte(" ? Justifie.")] },
          { consigne: [texte("Peut-on comparer "), latex(g1), texte(" et "), latex(d1), texte(" ? Si oui, compare-les. Justifie.")] },
          { consigne: [texte("Peut-on comparer "), latex(g2), texte(" et "), latex(d2), texte(" ? Si oui, compare-les. Justifie.")] },
        ],
      },
      etapesParQuestion: [["a"], ["b", "c"], ["d"]],
      reponseBreve: reponseBreve(e),
    };
  }
  return {
    section: {
      enteteFragments: [texte("Une seule des quatre courbes ci-dessous respecte toutes les conditions suivantes.")],
      enteteHtml: donneesHtml(e),
      questions: [{ consigne: [texte("Laquelle ? Justifie en indiquant, pour chacune des trois autres courbes, la condition qu'elle ne respecte pas.")] }],
    },
    etapesParQuestion: [["a", "b", "c", "d"]],
  };
}

// ---------------------------------------------------------------------------------------------
// Réponse brève, corrigé court
// ---------------------------------------------------------------------------------------------

function reponseBreve(e: ExercicePortraitRobot): FragmentConsigne[] {
  if (e.famille === "expression") return [latex(`f(x) = ${expressionLatex(e.cible)}`)];
  if (e.famille === "deduction") {
    const [g1, d1] = gaucheDroiteImages(e.comparaisonImages);
    const [g2, d2] = gaucheDroiteValeur(e, e.comparaisonValeur);
    return [
      texte("a) "),
      latex(`${imageLatex(-e.p)} = ${nombreLatex(valeurOpposee(e))}`),
      texte(" ; b) "),
      ...verdictCourt(e.comparaisonImages.verdict, g1, d1),
      texte(" ; c) "),
      ...verdictCourt(e.comparaisonValeur.verdict, g2, d2),
    ];
  }
  return [texte(`Courbe ${LETTRES_COURBES[e.indexCorrect]}`)];
}

function verdictCourt(verdict: ExerciceDeduction["comparaisonImages"]["verdict"], g: string, d: string): FragmentConsigne[] {
  return verdict === "indetermine" ? [texte("on ne peut pas savoir")] : [latex(`${g} ${verdict === "inferieur" ? "<" : ">"} ${d}`)];
}

function construireCorrection(e: ExercicePortraitRobot): BlocCorrection[] {
  const blocs: BlocCorrection[] = correctionDetailleePortraitRobot(e)
    .filter((etape) => etape.type === "resultat")
    .map((etape) => ({ type: "paragraphe", fragments: [texte(`${etape.sousQuestion}) `), ...etape.fragments] }));
  if (e.famille === "courbe") blocs.unshift({ type: "html", html: grilleCourbes(e, true) });
  if (e.famille === "expression") blocs.push({ type: "html", html: figureExpression(e) });
  return blocs;
}

// ---------------------------------------------------------------------------------------------
// Corrigé détaillé
// ---------------------------------------------------------------------------------------------

// ---------------------------------------------------------------------------------------------
// Barème (poids, somme 4, aucun critère < 0,5)
// ---------------------------------------------------------------------------------------------

function bareme(e: ExercicePortraitRobot): BaremeExercice {
  if (e.famille === "expression") {
    const criteres: CritereBareme[] = [
      { sousQuestion: "a", critere: [texte("Fonction de référence identifiée et justifiée par les caractéristiques")], points: 1 },
      { sousQuestion: "b", critere: [texte("Translations TH et TV lues dans les caractéristiques")], points: 1 },
      { sousQuestion: "c", critere: [texte("Coefficient a calculé à l'aide d'un point, expression complète de f")], points: 1.5 },
      { sousQuestion: "d", critere: [texte("Expression vérifiée sur les caractéristiques données")], points: 0.5 },
    ];
    const erreurs: ErreurFrequente[] = [
      { description: [texte("Signe de TH inversé (ex. "), latex("x + h"), texte(" au lieu de "), latex("x - h"), texte(")")], cout: "0 pt sur b)" },
      { description: [texte("Facteur a oublié (expression sans étirement)")], cout: "0,5 pt sur c)" },
    ];
    if (e.groupe === "extremum" || e.groupe === "symetrie") erreurs.unshift({ description: [texte("Famille choisie sans comparer les deux points (carré / valeur absolue, cube / racine cubique)")], cout: "0 pt sur a) et c)" });
    return {
      reponseFinale: reponseBreve(e),
      criteres,
      erreursFrequentes: erreurs,
      reponsesAcceptees: [[texte("Toute expression équivalente (ex. facteur distribué, ou réécrit à l'intérieur de la racine)")]],
    };
  }
  if (e.famille === "deduction") {
    return {
      reponseFinale: reponseBreve(e),
      criteres: [
        { sousQuestion: "a", critere: [texte("Valeur déduite de la parité, justifiée")], points: 1 },
        { sousQuestion: "b", critere: [texte("Sens de variation sur le symétrique de l'intervalle")], points: 0.5 },
        { sousQuestion: "c", critere: [texte("Première comparaison (ou impossibilité) justifiée")], points: 1.25 },
        { sousQuestion: "d", critere: [texte("Seconde comparaison (ou impossibilité) justifiée")], points: 1.25 },
      ],
      erreursFrequentes: [
        { description: [texte(e.parite === "paire" ? "Garder le même sens de variation sur le symétrique (une fonction paire l'inverse)" : "Inverser le sens de variation (une fonction impaire le garde)")], cout: "0 pt sur b) et c)" },
        { description: [texte("Conclure une comparaison avec un nombre hors de "), latex(`[-${nombreLatex(e.m)} \\,;\\, ${nombreLatex(e.m)}]`)], cout: "0 pt sur la comparaison concernée" },
        { description: [texte("Verdict sans justification")], cout: "moitié des points de la comparaison" },
      ],
      reponsesAcceptees: [[texte("Justification appuyée sur un croquis symétrique cohérent avec les données")]],
    };
  }
  return {
    reponseFinale: reponseBreve(e),
    criteres: [
      { sousQuestion: "a", critere: [texte("Bonne courbe choisie")], points: 1 },
      ...indicesCourbesEcartees(e).map((i, n) => ({ sousQuestion: "bcd"[n]!, critere: [texte(`Courbe ${LETTRES_COURBES[i]} écartée par la condition qu'elle ne respecte pas`)], points: 1 })),
    ],
    erreursFrequentes: [
      { description: [texte("Courbe écartée sans citer de condition précise")], cout: "0 pt sur la courbe concernée" },
      { description: [texte("Condition citée que la courbe respecte en réalité")], cout: "0 pt sur la courbe concernée" },
    ],
    reponsesAcceptees: [],
  };
}

/** Critères du niveau de difficulté (grille commune, `export/niveauDifficulte.ts`) : méthode et
 * piège jugés par variante (analyse des cinq chapitres), étapes lues sur le corrigé détaillé. */
function criteresDifficulte(e: ExercicePortraitRobot): CriteresDifficulte {
  const piege = e.famille === "expression" && e.groupe === "racine" ? 0 : 1;
  // « courbe » : dire quelle condition une courbe écartée ne respecte pas = lecture sur la courbe.
  return { ...etapesDuCorrige(correctionDetailleePortraitRobot(e), e.famille === "courbe" ? ["b", "c", "d"] : []), methode: 1, piege };
}

export const adaptateurEvaluationPortraitRobotFonction: AdaptateurFeuilleExercices<ExercicePortraitRobot> = {
  profilInstance: profilPortraitRobot,
  libelleCasParticulier: LIBELLE_CAS_PORTRAIT_ROBOT,
  titreDocument: "Le portrait-robot d'une fonction — Évaluation",
  nomFichierBase: "portrait-robot-fonction",
  genererInstance: genererExercicePortraitRobot,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: construireAvecVariante,
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: correctionDetailleePortraitRobot,
  bareme,
  enoncePapier,
};
