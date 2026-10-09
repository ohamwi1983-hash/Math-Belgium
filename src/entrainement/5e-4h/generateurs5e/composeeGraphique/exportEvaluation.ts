import type { CourbeGraphique, ExerciceComposeeGraphique, QuestionComposeeGraphique } from "../../core5e/composeeGraphique.types";
import type { AdaptateurFeuilleExercices, BlocCorrection, QuestionExercice, SectionExercice } from "../../../export/genererFeuilleExercices";
import { texte } from "../../../export/fragmentsDocx";
import { construireSvgFonction } from "../../../export/svgGraph";
import { CONSIGNE_GENERALE_COMPOSEE_GRAPHIQUE, consigneQuestion, labelChampResultat, nomInterne } from "../../ui5e/formatComposeeGraphique";
import { X_MAX_CADRE, X_MIN_CADRE, Y_MAX_CADRE, Y_MIN_CADRE, domaineCourbe } from "./courbes";
import { construireAvecRestreinte, genererExerciceComposeeGraphique } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceComposeeGraphique>` pour 5gen4 (Composée de
 * fonctions — lecture graphique) — feuille d'évaluation. L'écran interactif affiche f et g comme 2
 * graphes SÉPARÉS côte à côte (jamais superposés sur un même repère — voir `CourbeGraph.tsx`,
 * une instance par courbe), reproduit ici tel quel : 2 `<svg>` statiques (`construireSvgFonction`,
 * déjà utilisé par gen8/4e) plutôt qu'un seul repère à 2 couleurs. Chaque courbe est une ligne
 * brisée à nœuds de grille entiers (jamais une famille algébrique lisse, voir
 * `core5e/composeeGraphique.types.ts`) — interpolée linéairement entre nœuds consécutifs pour le
 * tracé, une fonction JS pure locale (`evaluerCourbeLineaire`), jamais la spline Catmull-Rom de
 * l'écran interactif (rendu seulement côté écran, non nécessaire pour une lecture papier).
 */

function evaluerCourbeLineaire(courbe: CourbeGraphique): (x: number) => number | null {
  const [xMin, xMax] = domaineCourbe(courbe);
  return (x: number) => {
    if (x < xMin || x > xMax) return null;
    const i = Math.floor(x - xMin);
    const p0 = courbe.points[i];
    const p1 = courbe.points[Math.min(i + 1, courbe.points.length - 1)];
    if (!p0 || !p1) return null;
    const t = x - p0.x;
    return p0.y + (p1.y - p0.y) * t;
  };
}

function construireGrapheCourbe(courbe: CourbeGraphique, lettre: string): string {
  const largeur = 220;
  return construireSvgFonction(evaluerCourbeLineaire(courbe), { xMin: X_MIN_CADRE, xMax: X_MAX_CADRE, yMin: Y_MIN_CADRE, yMax: Y_MAX_CADRE }, { largeur, hauteur: largeur, classe: "graphe-composee", lettre });
}

function construireGraphesComposeeGraphique(exercice: ExerciceComposeeGraphique): string {
  return `<div style="display:flex;gap:16px;">${construireGrapheCourbe(exercice.f, "f")}${construireGrapheCourbe(exercice.g, "g")}</div>`;
}

function construireEnonceComposeeGraphique(exercice: ExerciceComposeeGraphique): SectionExercice {
  const questions: QuestionExercice[] = exercice.questions.map((q) => ({
    consigne: [texte(consigneQuestion(q) + " (justifie si le résultat n'existe pas.)")],
    reponse: { type: "lignes", nombre: 2 },
  }));
  return {
    enteteFragments: [texte(CONSIGNE_GENERALE_COMPOSEE_GRAPHIQUE)],
    enteteHtml: construireGraphesComposeeGraphique(exercice),
    questions,
  };
}

function construireCorrectionQuestion(q: QuestionComposeeGraphique): BlocCorrection {
  const interne = nomInterne(q.composition);
  const externe = interne === "f" ? "g" : "f";
  if (q.resultatExiste) {
    return {
      type: "paragraphe",
      fragments: [texte(`${interne}(${q.a}) = ${q.bAttendu} (lu sur le graphe de ${interne}), puis ${externe}(${q.bAttendu}) = ${q.resultatAttendu} (lu sur le graphe de ${externe}) — donc ${labelChampResultat(q)} ${q.resultatAttendu}.`)],
    };
  }
  return {
    type: "paragraphe",
    fragments: [texte(`${interne}(${q.a}) = ${q.bAttendu} (lu sur le graphe de ${interne}), mais ${q.bAttendu} n'appartient pas au domaine de ${externe} (absent de son graphe) — donc ${labelChampResultat(q)} n'existe pas.`)],
  };
}

function construireCorrectionComposeeGraphique(exercice: ExerciceComposeeGraphique): BlocCorrection[] {
  return exercice.questions.map(construireCorrectionQuestion);
}

export const adaptateurEvaluationComposeeGraphique: AdaptateurFeuilleExercices<ExerciceComposeeGraphique> = {
  titreDocument: "Composée de fonctions — lecture graphique — Évaluation",
  nomFichierBase: "composee-graphique",
  genererInstance: genererExerciceComposeeGraphique,
  catalogueVariantes: [
    { id: "f", label: "f restreinte" },
    { id: "g", label: "g restreinte" },
  ],
  genererInstanceAvecVariante: (id) => construireAvecRestreinte(id as "f" | "g"),
  construireEnonce: construireEnonceComposeeGraphique,
  construireCorrection: construireCorrectionComposeeGraphique,
};
