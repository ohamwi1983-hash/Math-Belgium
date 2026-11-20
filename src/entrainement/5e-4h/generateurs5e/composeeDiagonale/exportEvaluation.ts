import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CriteresDifficulte, EnoncePapier, FragmentConsigne, ProfilInstance, SectionExercice } from "../../../export/genererFeuilleExercices";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { latex, texte } from "../../../export/corrigeTableau";
import type { ExerciceComposeeDiagonale } from "../../core5e/composeeDiagonale";
import { composeeL, consigne, consigneGenerale, nomO, phases, reponse } from "../../ui5e/formatComposeeDiagonale";
import { figurePapier } from "../../ui5e/figureComposeeDiagonale";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceComposeeDiagonale } from "./index";
import type { IdVarianteComposeeDiagonale } from "./index";
import { correctionDetailleeComposeeDiagonale } from "./corrigeDetaille";

/**
 * Adaptateur papier de `5gen63` « Composée sur un seul repère (droite y = x) ». Énoncé papier =
 * figure (Cf, Cg, y = x ; même échelle, carreaux d'une unité, aucune construction) + consigne
 * globale ; corrigé « comme au tableau » en trois étapes, figure de la construction sous l'étape c.
 */

type E = ExerciceComposeeDiagonale;
const t = texte;
const f = latex;
const figureEnonce = (e: E) => `<div style="max-width:7.5cm;margin:6px auto">${figurePapier(e).replace(/<svg ([^>]*?)width="([\d.]+)" height="([\d.]+)"/, '<svg $1width="100%" style="height:auto;display:block"')}</div>`;

function construireEnonce(e: E): SectionExercice {
  // Toujours trois étapes (le corrigé conclut en c) même quand la composée n'existe pas).
  const questions = phases(e).map((p) => ({ consigne: consigne(e, p) as FragmentConsigne[] }));
  if (!e.existe) questions.push({ consigne: [t("Conclus : donne "), f(composeeL(e)), t(", ou justifie qu'il n'existe pas.")] });
  return { enteteFragments: consigneGenerale(e), enteteHtml: figureEnonce(e), questions };
}

function reponseBreve(e: E): FragmentConsigne[] {
  return e.existe ? [f(`${composeeL(e)}=${e.w}`)] : [f(composeeL(e)), t(" n'existe pas")];
}

function enoncePapier(e: E): EnoncePapier {
  return {
    section: {
      enteteFragments: [t("Les graphes de f et de g ci-dessous sont complets (un point plein appartient au graphe, un rond vide n'y appartient pas). À l'aide de la droite "), f("y=x"), t(", détermine "), f(composeeL(e)), t(" s'il existe ; justifie ta réponse.")],
      enteteHtml: figureEnonce(e),
      questions: [],
    },
    reponseBreve: reponseBreve(e),
  };
}

function construireCorrection(e: E): BlocCorrection[] {
  return phases(e).map((p, i) => ({ type: "paragraphe", fragments: [t(`${"abc"[i]}) `), ...reponse(e, p)] }));
}

/** a et c sont des lectures (même dans le cas « n'existe pas », c est une conclusion de lecture).
 * Piège CONSTANT 1 : l'extrémité du graphe complet (domaine de l'extérieure) est toujours dans les
 * données ; le lier aux ronds vides le corrélait au verdict (63 % / 54 % en (f∘g), 2 000 tirages) —
 * niveau 2 et 6 min dans les deux issues. */
function criteresDifficulte(e: E): CriteresDifficulte {
  return { ...etapesDuCorrige(correctionDetailleeComposeeDiagonale(e), ["a", "c"]), methode: 0, piege: 1, nombres: 0 };
}

function bareme(e: E): BaremeExercice {
  const o = nomO(e);
  return {
    reponseFinale: reponseBreve(e),
    criteres: [
      { sousQuestion: "a", critere: [t("Première lecture : "), ...reponse(e, "premiere")], points: 1 },
      { sousQuestion: "b", critere: [t("Report par y = x et existence justifiée : "), ...reponse(e, "existence")], points: e.existe ? 1.5 : 3 },
      ...(e.existe ? [{ sousQuestion: "c", critere: [t("Seconde lecture : "), ...reponse(e, "valeur")], points: 1.5 }] : []),
    ],
    erreursFrequentes: [
      { description: [t("Ordre des lectures inversé")], cout: "0 pt sur la première lecture, suite notée sans double pénalité" },
      { description: [t("Valeur lue sur "), f(`C_${o}`), t(" prolongée au-delà de son extrémité")], cout: "0 pt sur l'existence" },
      { description: [t("Arrêt sur la diagonale (valeur intermédiaire donnée comme résultat)")], cout: "−1" },
    ],
    reponsesAcceptees: [[t("Report justifié sans la diagonale (relecture de la valeur sur l'axe horizontal), si les deux lectures sont expliquées")]],
  };
}

/** Aucun cas particulier : « existe / n'existe pas » est le verdict (50/50). `forme` = variante. */
export function profilComposeeDiagonale(e: E): ProfilInstance {
  return { casParticulier: null, calcul: "exacte", forme: e.variante };
}

export const adaptateurEvaluationComposeeDiagonale: AdaptateurFeuilleExercices<E> = {
  titreDocument: "Composée sur un seul repère — Évaluation",
  nomFichierBase: "composee-droite-y-egal-x",
  genererInstance: genererExerciceComposeeDiagonale,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as IdVarianteComposeeDiagonale),
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: correctionDetailleeComposeeDiagonale,
  bareme,
  enoncePapier,
  profilInstance: profilComposeeDiagonale,
};
