import type { ExerciceComposeeGraphique, QuestionComposeeGraphique } from "../../core5e/composeeGraphique.types";
import type {
  AdaptateurFeuilleExercices,
  BaremeExercice,
  BlocCorrection,
  CritereBareme,
  CriteresDifficulte,
  EnoncePapier,
  FragmentConsigne,
  SectionExercice,
} from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import type { CouleursGrapheComposee } from "../../ui5e/composeeGraphiqueGraph";
import { svgGrapheComposee } from "../../ui5e/composeeGraphiqueGraph";
import { nomInterne } from "../../ui5e/formatComposeeGraphique";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { correctionDetailleeComposeeGraphique, fragmentsResultat } from "./corrigeDetaille";
import { profilComposeeGraphique } from "../profilsEvaluationFonctions3-4";
import { CATALOGUE_RESTREINTE, construireAvecRestreinte, genererExerciceComposeeGraphique } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceComposeeGraphique>` pour 5gen4 (composée de
 * fonctions — lecture graphique) — feuille d'exercices et évaluation (méthode :
 * `.claude/rules/feuilles-evaluations.md`).
 *
 * Énoncé papier = les graphes de f et g (DONNÉES, dans l'énoncé) et la consigne globale « Calcule,
 * si elles existent, les valeurs suivantes : … » avec la liste des composées demandées — plus de
 * sous-questions a)–d) ni de réécriture de la composée à la place de l'élève. Chaque valeur demandée
 * devient une étape du corrigé : lecture de l'intérieure, puis de l'extérieure, ou constat que
 * l'image intermédiaire sort du domaine de l'extérieure (« f(g(7)) n'existe pas », sans « = »).
 *
 * Graphes : `svgGrapheComposee` (le MÊME tracé que l'écran : grille unitaire fixe, segments droits
 * entre nœuds entiers, extrémités pleines, graduations avec « − »), couleurs en dur pour le papier
 * (aucune variable CSS du site dans le document téléchargé). Valeurs : `resultatLatex` (via le corrigé),
 * `nombreTypo`, champs de la question (`bAttendu`, `resultatAttendu`) — rien n'est relu ici.
 *
 * Variante forcée = courbe restreinte (`CATALOGUE_RESTREINTE`), la même que le `?code=` de l'appli
 * (App5gen4.tsx), qui rouvre l'instance imprimée.
 */

const COULEURS_PAPIER_F: CouleursGrapheComposee = { courbe: "#1f5f9e", grille: "#c9d4db", axe: "#33414c", aide: "#5b4ea3", fond: "#ffffff" };
const COULEURS_PAPIER_G: CouleursGrapheComposee = { ...COULEURS_PAPIER_F, courbe: "#b65c1f" };

function blocGraphe(svg: string, nom: "f" | "g", couleur: string): string {
  return (
    `<div style="flex:1 1 0;min-width:0;max-width:82mm;">` +
    `<div style="text-align:center;font-style:italic;font-weight:600;color:${couleur};margin-bottom:2px;">Graphe de ${nom}</div>` +
    `${svg}</div>`
  );
}

function graphesPapier(exercice: ExerciceComposeeGraphique): string {
  const svgF = svgGrapheComposee(exercice.f, { couleurs: COULEURS_PAPIER_F, titre: "Graphe de f" });
  const svgG = svgGrapheComposee(exercice.g, { couleurs: COULEURS_PAPIER_G, titre: "Graphe de g" });
  return `<div style="display:flex;gap:6mm;justify-content:center;align-items:flex-start;">${blocGraphe(svgF, "f", COULEURS_PAPIER_F.courbe)}${blocGraphe(svgG, "g", COULEURS_PAPIER_G.courbe)}</div>`;
}

function nomExterne(q: QuestionComposeeGraphique): "f" | "g" {
  return nomInterne(q.composition) === "f" ? "g" : "f";
}

/** « (f∘g)(−7) » en LaTeX. */
function composeeLatex(q: QuestionComposeeGraphique): string {
  return `(${nomExterne(q)}\\circ ${nomInterne(q.composition)})(${q.a})`;
}

const LETTRES = "abcdefgh";

function construireEnonceComposeeGraphique(exercice: ExerciceComposeeGraphique): SectionExercice {
  return {
    enteteFragments: [texte("Voici les graphes des fonctions f et g.")],
    enteteHtml: graphesPapier(exercice),
    questions: exercice.questions.map((q) => ({ consigne: [texte("Calcule "), latex(composeeLatex(q)), texte(", si cette image existe.")] })),
  };
}

function listeComposees(exercice: ExerciceComposeeGraphique): FragmentConsigne[] {
  return exercice.questions.flatMap((q, i) => [...(i > 0 ? [texte(i === exercice.questions.length - 1 ? " et " : ", ")] : []), latex(composeeLatex(q))]);
}

function enoncePapierComposeeGraphique(exercice: ExerciceComposeeGraphique): EnoncePapier {
  return {
    section: {
      enteteFragments: [texte("Voici les graphes des fonctions f et g. Calcule, si elles existent, les valeurs suivantes : "), ...listeComposees(exercice), texte(".")],
      enteteHtml: graphesPapier(exercice),
      questions: [],
    },
  };
}

/** Réponses en KaTeX (« f(g(−7)) = 3 », « f(g(5)) n'existe pas »), mêmes écritures que l'écran. */
function reponseBreveComposeeGraphique(exercice: ExerciceComposeeGraphique): FragmentConsigne[] {
  return exercice.questions.flatMap((q, i) => [...(i > 0 ? [texte(" ; ")] : []), ...fragmentsResultat(q)]);
}

/** Critères du niveau (grille commune) : chaque écran est une LECTURE (lire g(a) puis f(g(a)) sur les
 * graphes, ou constater que g(a) sort du domaine) — aucune étape de calcul ; méthode 0 ; piège 1
 * (une image intermédiaire hors du domaine de l'extérieure est toujours dans les données) ;
 * nombres 0. */
function criteresDifficulteComposeeGraphique(exercice: ExerciceComposeeGraphique): CriteresDifficulte {
  const corrige = correctionDetailleeComposeeGraphique(exercice);
  const lettres = [...new Set(corrige.map((e) => e.sousQuestion).filter((l): l is string => !!l))];
  return { ...etapesDuCorrige(corrige, lettres), methode: 0, piege: exercice.questions.some((q) => !q.resultatExiste) ? 1 : 0, nombres: 0 };
}

function baremeComposeeGraphique(exercice: ExerciceComposeeGraphique): BaremeExercice {
  const n = exercice.questions.length;
  const poids = Math.round((4 / n) * 10) / 10;
  const criteres: CritereBareme[] = exercice.questions.map((q, i) => ({
    sousQuestion: LETTRES[i],
    critere: q.resultatExiste
      ? [...fragmentsResultat(q), texte(` : lecture de ${nomInterne(q.composition)} puis de ${nomExterne(q)}`)]
      : [...fragmentsResultat(q), texte(` : image intermédiaire hors du domaine de ${nomExterne(q)}, justifiée`)],
    points: poids,
  }));
  return {
    reponseFinale: reponseBreveComposeeGraphique(exercice),
    criteres,
    erreursFrequentes: [
      { description: [texte("Lecture dans le mauvais ordre (extérieure avant intérieure)")], cout: "0 pt sur la valeur concernée" },
      { description: [texte("Valeur inventée en prolongeant la courbe hors de son domaine, au lieu de « n'existe pas »")], cout: "0 pt sur la valeur concernée" },
    ],
    reponsesAcceptees: [[texte("« n'existe pas » justifié par la sortie du domaine ; une lecture intermédiaire juste avec une conclusion fausse rapporte la moitié des points de la valeur.")]],
  };
}

/** Ancien corrigé (repli, documents Word) : les lignes du corrigé détaillé, sans le piège. */
function construireCorrectionComposeeGraphique(exercice: ExerciceComposeeGraphique): BlocCorrection[] {
  return correctionDetailleeComposeeGraphique(exercice)
    .filter((l) => l.type !== "piege")
    .map((l) => ({ type: "paragraphe", fragments: l.fragments }));
}

export const adaptateurEvaluationComposeeGraphique: AdaptateurFeuilleExercices<ExerciceComposeeGraphique> = {
  titreDocument: "Composée de fonctions — lecture graphique — Évaluation",
  nomFichierBase: "composee-graphique",
  genererInstance: genererExerciceComposeeGraphique,
  catalogueVariantes: CATALOGUE_RESTREINTE,
  genererInstanceAvecVariante: (id) => construireAvecRestreinte(id as "f" | "g"),
  construireEnonce: construireEnonceComposeeGraphique,
  construireCorrection: construireCorrectionComposeeGraphique,
  criteresDifficulte: criteresDifficulteComposeeGraphique,
  reponseBreve: reponseBreveComposeeGraphique,
  correctionDetaillee: correctionDetailleeComposeeGraphique,
  bareme: baremeComposeeGraphique,
  enoncePapier: enoncePapierComposeeGraphique,
  profilInstance: profilComposeeGraphique,
  regroupable: false,
};
