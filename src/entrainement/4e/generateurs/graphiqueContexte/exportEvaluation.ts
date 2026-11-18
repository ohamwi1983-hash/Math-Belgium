import type { ExerciceGraphiqueContexte, IdContexteGraphique, QuestionGraphique } from "../../core/graphiqueContexte.types";
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
import { texte } from "../../../export/fragmentsDocx";
import { CONSIGNE_TYPE, LIBELLE_TYPE, questionTexte } from "../../ui/formatGraphiqueContexte";
import { construireSvgGraphiqueContexte } from "../../ui/svgGraphiqueContexte";
import { profilGraphiqueContexte } from "../profilsEvaluationGraphiqueContexte";
import { TEXTES_CONTEXTES } from "./contextes";
import { aDesPaliers, correctionDetailleeGraphiqueContexte, reponseFragments } from "./corrigeDetaille";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceGraphiqueContexte } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceGraphiqueContexte>` pour gen70 (Lire un graphique
 * en contexte, 4e ch. 3, processus TRANSFÉRER).
 *
 * Écran → papier :
 * - l'écran déroule 2 étapes par question (« quelle caractéristique ? », puis la lecture) : ce sont
 *   les étapes a, b (question 1), c, d (question 2)… de `construireEnonce` ;
 * - l'énoncé PAPIER (`enoncePapier`) garde les 4 VRAIES questions a) b) c) d), en langage courant,
 *   sous la situation et le graphique (même figure qu'à l'écran, couleurs fixes) — l'identification
 *   de la caractéristique n'y figure pas : elle passe dans le corrigé (« Méthode ») ;
 * - corrigé détaillé : par question, Méthode (caractéristique et pourquoi), Lecture avec la figure
 *   annotée (pointillés de lecture, intervalles surlignés, crochets pleins/vides), Conclusion avec
 *   l'unité, Piège ciblé.
 * Textes et valeurs : mêmes fonctions que l'écran (`ui/formatGraphiqueContexte.ts`, `contextes.ts`,
 * réponses calculées par le générateur), jamais recalculés ici.
 */

const LETTRES = "abcdefghijklmnopqrstuvwxyz";

const CONSIGNE_GLOBALE = "Réponds aux questions en lisant le graphique. Donne chaque réponse avec son unité ; une période se note par un intervalle.";

function svgPapier(e: ExerciceGraphiqueContexte, annotation: QuestionGraphique | null = null): string {
  return construireSvgGraphiqueContexte(e, { theme: "papier", annotation });
}

function construireEnonceGraphiqueContexte(e: ExerciceGraphiqueContexte): SectionExercice {
  return {
    enteteFragments: [texte(`${TEXTES_CONTEXTES[e.contexte].situation} ${CONSIGNE_GLOBALE}`)],
    enteteHtml: svgPapier(e),
    questions: e.questions.flatMap((q) => [
      { consigne: [texte(`${CONSIGNE_TYPE} (« ${questionTexte(e, q)} »)`)] },
      { consigne: [texte(questionTexte(e, q))] },
    ]),
  };
}

function construireCorrectionGraphiqueContexte(e: ExerciceGraphiqueContexte): BlocCorrection[] {
  return e.questions.flatMap((q, i) => [
    { type: "paragraphe" as const, fragments: [texte(`${LETTRES[2 * i]}) ${LIBELLE_TYPE[q.type]}.`)] },
    { type: "paragraphe" as const, fragments: [texte(`${LETTRES[2 * i + 1]}) `), ...reponseFragments(e, q), texte(".")] },
  ]);
}

function reponseBreveGraphiqueContexte(e: ExerciceGraphiqueContexte): FragmentConsigne[] {
  return e.questions.flatMap((q, i) => [texte(`${i === 0 ? "" : " ; "}${LETTRES[i]}) `), ...reponseFragments(e, q)]);
}

function enoncePapierGraphiqueContexte(e: ExerciceGraphiqueContexte): EnoncePapier {
  return {
    section: {
      enteteFragments: [texte(`${TEXTES_CONTEXTES[e.contexte].situation} ${CONSIGNE_GLOBALE}`)],
      enteteHtml: svgPapier(e),
      questions: e.questions.map((q) => ({ consigne: [texte(questionTexte(e, q))] })),
    },
    etapesParQuestion: e.questions.map((_, i) => [LETTRES[2 * i]!, LETTRES[2 * i + 1]!]),
    reponseBreve: reponseBreveGraphiqueContexte(e),
  };
}

function criteresQuestion(e: ExerciceGraphiqueContexte, q: QuestionGraphique, lettre: string): CritereBareme[] {
  const t = TEXTES_CONTEXTES[e.contexte];
  switch (q.type) {
    case "image":
      return [{ sousQuestion: lettre, critere: [texte(`Valeur lue sur l'axe vertical, avec son unité (${t.uniteY})`)], points: 1 }];
    case "antecedent":
      return q.solutions.length > 1
        ? [
            { sousQuestion: lettre, critere: [texte("Lecture sur l'axe horizontal, avec l'unité")], points: 0.5 },
            { sousQuestion: lettre, critere: [texte(`Les ${q.solutions.length} antécédents, et seulement eux`)], points: 0.5 },
          ]
        : [{ sousQuestion: lettre, critere: [texte("Antécédent lu sur l'axe horizontal, avec l'unité")], points: 1 }];
    case "inequation":
      return [
        { sousQuestion: lettre, critere: [texte("Bornes des intervalles (abscisses où la courbe atteint le niveau, extrémités de la période)")], points: 0.5 },
        { sousQuestion: lettre, critere: [texte("Crochets (niveau inclus ou exclu selon la question)")], points: 0.5 },
      ];
    case "extremum":
      return [
        { sousQuestion: lettre, critere: [texte(`Valeur de l'extremum, avec l'unité (${t.uniteY})`)], points: 0.5 },
        { sousQuestion: lettre, critere: [texte(`Moment où il est atteint (${t.uniteX})`)], points: 0.5 },
      ];
    case "variation":
      return [
        { sousQuestion: lettre, critere: [texte(`Bornes lues sur l'axe horizontal${aDesPaliers(e) ? ", paliers exclus" : ""}`)], points: 0.5 },
        { sousQuestion: lettre, critere: [texte(`Tous les intervalles (${q.intervalles.length}), et seulement eux`)], points: 0.5 },
      ];
    case "tendance":
      return [{ sousQuestion: lettre, critere: [texte(`Valeur limite (asymptote horizontale), avec son unité (${t.uniteY})`)], points: 1 }];
  }
}

function baremeGraphiqueContexte(e: ExerciceGraphiqueContexte): BaremeExercice {
  const criteres = e.questions.flatMap((q, i) => criteresQuestion(e, q, LETTRES[2 * i + 1]!));
  const types = new Set(e.questions.map((q) => q.type));
  const erreurs: ErreurFrequente[] = [];
  if (types.has("image") || types.has("antecedent")) erreurs.push({ description: [texte("Confondre image et antécédent (réponse lue sur le mauvais axe)")], cout: "0 pt sur la question" });
  erreurs.push({ description: [texte("Réponse sans unité")], cout: "−0,5" });
  if (types.has("inequation")) erreurs.push({ description: [texte("Crochet fermé pour « plus de » / « moins de », ou ouvert pour « au moins » / « au plus »")], cout: "−0,5" });
  const ante = e.questions.find((q) => q.type === "antecedent");
  if (ante && ante.type === "antecedent" && ante.solutions.length > 1) erreurs.push({ description: [texte("Oublier un antécédent")], cout: "−0,5" });
  if (types.has("extremum")) erreurs.push({ description: [texte("Donner seulement la valeur de l'extremum, ou seulement le moment")], cout: "−0,5" });
  if (types.has("variation"))
    erreurs.push(
      aDesPaliers(e)
        ? { description: [texte("Inclure un palier dans un intervalle de croissance ou de décroissance")], cout: "−0,5" }
        : { description: [texte("Écrire des valeurs de la grandeur (axe vertical) comme bornes des intervalles")], cout: "0 pt sur la question" },
    );
  if (types.has("tendance")) erreurs.push({ description: [texte("Donner la dernière valeur lue au lieu de la valeur limite")], cout: "0 pt sur la question" });
  return {
    reponseFinale: reponseBreveGraphiqueContexte(e),
    criteres,
    erreursFrequentes: erreurs,
    reponsesAcceptees: [
      [texte("Réponses rédigées en phrase (ex. « il faisait 14 °C à 10 h »)")],
      [texte("Antécédents donnés dans n'importe quel ordre")],
      ...(types.has("variation") ? [[texte("Intervalles de croissance ou de décroissance écrits avec des crochets ouverts")]] : []),
    ],
  };
}

/** ★★ par défaut ; ★★★ dès deux difficultés de lecture : inéquation à plusieurs intervalles ou à
 * niveau exclu, 3 antécédents ou plus, paliers à écarter, asymptote à reconnaître. */
function difficulteGraphiqueContexte(e: ExerciceGraphiqueContexte): 1 | 2 | 3 {
  let pieges = 0;
  for (const q of e.questions) {
    if (q.type === "inequation" && (q.solution.length > 1 || q.comparateur === ">" || q.comparateur === "<")) pieges++;
    if (q.type === "antecedent" && q.solutions.length >= 3) pieges++;
    if (q.type === "variation" && aDesPaliers(e)) pieges++;
    if (q.type === "tendance") pieges++;
  }
  return pieges >= 2 ? 3 : 2;
}

export const adaptateurEvaluationGraphiqueContexte: AdaptateurFeuilleExercices<ExerciceGraphiqueContexte> = {
  titreDocument: "Lire un graphique en contexte — Évaluation",
  nomFichierBase: "graphique-contexte",
  genererInstance: genererExerciceGraphiqueContexte,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as IdContexteGraphique),
  construireEnonce: construireEnonceGraphiqueContexte,
  construireCorrection: construireCorrectionGraphiqueContexte,
  difficulte: difficulteGraphiqueContexte,
  reponseBreve: reponseBreveGraphiqueContexte,
  correctionDetaillee: correctionDetailleeGraphiqueContexte,
  bareme: baremeGraphiqueContexte,
  enoncePapier: enoncePapierGraphiqueContexte,
  dureeMinutes: 10,
  profilInstance: profilGraphiqueContexte,
};
