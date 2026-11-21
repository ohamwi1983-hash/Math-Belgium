import type {
  AdaptateurFeuilleExercices,
  BaremeExercice,
  BlocCorrection,
  CriteresDifficulte,
  EnoncePapier,
  EtapeCorrection,
  FragmentConsigne,
  SectionExercice,
} from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { correctionDetailleeEquilibreForces } from "./corrigeDetaille";
import type { ExerciceEquilibreForces } from "../../core/equilibreForces.types";
import { f3, intensiteArrondie, intensiteExacteDemandee, sommeIntensites } from "../../moteur/modeleEquilibreForces";
import {
  V3,
  angleLatex,
  colonne,
  dixieme,
  consignesEcrans,
  enonceFragments,
  intensiteAttendueLatex,
  questionsPapier,
} from "../../ui/formatEquilibreForces";
import { construireFigureForces } from "../../ui/figureEquilibreForces";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceEquilibreForces } from "./index";
import { LIBELLE_CAS_EQUILIBRE_FORCES, profilEquilibreForces } from "./profil";

/**
 * Adaptateur feuilles d'exercices / évaluations de gen90. Énoncé papier = situation + figure (« ? »
 * pour la force inconnue) + les VRAIES questions : a) les composantes de F₃, b) son intensité,
 * c) (variante « direction ») l'angle avec l'axe x. Les écrans d'apprentissage (condition
 * d'équilibre, résultante) deviennent les étapes a, b du corrigé ; l'étape c montre F₃ tracée et le
 * polygone des forces fermé (`figureHtml`). Séries équilibrées : `profil.ts`.
 */

function figureEnonce(e: ExerciceEquilibreForces): string {
  return construireFigureForces(e, { theme: "papier" });
}

/** Énoncé STRUCTURÉ (une sous-question par écran) : sert aux titres « Étape n — … » du corrigé. */
function construireEnonce(e: ExerciceEquilibreForces): SectionExercice {
  return {
    enteteFragments: enonceFragments(e),
    enteteHtml: figureEnonce(e),
    questions: consignesEcrans(e, "papier").map((consigne) => ({ consigne })),
  };
}

function enoncePapier(e: ExerciceEquilibreForces): EnoncePapier {
  return {
    section: {
      enteteFragments: enonceFragments(e),
      enteteHtml: figureEnonce(e),
      questions: questionsPapier(e).map((consigne) => ({ consigne })),
    },
    etapesParQuestion: e.direction ? [["a", "b", "c"], ["d"], ["e"]] : [["a", "b", "c"], ["d"]],
  };
}

function resultatF3(e: ExerciceEquilibreForces): FragmentConsigne {
  return latex(`${V3}${colonne(f3(e))}`);
}

function reponseBreve(e: ExerciceEquilibreForces): FragmentConsigne[] {
  const r: FragmentConsigne[] = [resultatF3(e), texte(" ; "), latex(intensiteAttendueLatex(e)), texte(" N")];
  if (e.direction) r.push(texte(" ; "), latex(angleLatex(e)));
  return r;
}

function correctionDetaillee(e: ExerciceEquilibreForces): EtapeCorrection[] {
  return correctionDetailleeEquilibreForces(e);
}

function criteresDifficulte(e: ExerciceEquilibreForces): CriteresDifficulte {
  // Méthode 1 : l’énoncé papier demande F₃ sans rappeler la condition d’équilibre. Piège : l’anneau (forces lues sur un quadrillage, à convertir en N). Nombres : détectés (intensité au dixième, angle).
  return { ...etapesDuCorrige(correctionDetailleeEquilibreForces(e)), methode: 1, piege: e.situation === "anneau" ? 1 : 0 };
}

function construireCorrection(e: ExerciceEquilibreForces): BlocCorrection[] {
  return correctionDetaillee(e)
    .filter((etape) => etape.type === "resultat")
    .map((etape) => ({ type: "paragraphe", fragments: [texte(`${etape.sousQuestion}) `), ...etape.fragments] }));
}

function bareme(e: ExerciceEquilibreForces): BaremeExercice {
  const somme = Math.round(sommeIntensites(e) * 10) / 10;
  const criteres = [
    { sousQuestion: "a", critere: [texte("Condition d'équilibre écrite, force cherchée exprimée comme l'opposée de la résultante")], points: 0.5 },
    { sousQuestion: "b", critere: [texte(e.situation === "anneau" ? "Composantes lues sur le quadrillage et converties en N, résultante calculée" : "Résultante des deux forces connues, composante par composante")], points: 1 },
    { sousQuestion: "c", critere: [texte("Composantes de la force cherchée (signes changés)")], points: 1 },
    { sousQuestion: "d", critere: [texte(intensiteExacteDemandee(e) ? "Intensité exacte, simplifiée, avec l'unité" : "Intensité au dixième de newton, avec l'unité")], points: e.direction ? 1 : 1.5 },
  ];
  if (e.direction) criteres.push({ sousQuestion: "e", critere: [texte("Angle avec l'axe x par la tangente")], points: 0.5 });
  return {
    reponseFinale: reponseBreve(e),
    criteres,
    erreursFrequentes: [
      { description: [texte("Force cherchée égale à la résultante (signe moins oublié)")], cout: "0 pt sur l'étape c (pas de double sanction ensuite)" },
      { description: [texte(`Intensités des deux forces connues additionnées au lieu des vecteurs (≈ ${dixieme(somme, "texte")} N au lieu de ≈ ${dixieme(intensiteArrondie(e), "texte")} N)`)], cout: "0 pt sur l'étape d" },
      { description: [texte("Unité absente")], cout: "−0,5 pt" },
      ...(e.direction ? [{ description: [texte("Angle avec l'axe y (complémentaire) au lieu de l'axe x")], cout: "0 pt sur l'étape e" }] : []),
    ],
    reponsesAcceptees: [[texte("Intensité exacte non simplifiée (racine du radicand complet) : moitié des points du critère")], [texte("Résultat juste à partir de composantes fausses : points de méthode accordés (pas de double sanction)")]],
  };
}

export const adaptateurEvaluationEquilibreForces: AdaptateurFeuilleExercices<ExerciceEquilibreForces> = {
  profilInstance: profilEquilibreForces,
  // L'angle de F₃ (arctangente) exige la calculatrice : le panneau avertit si elle est interdite.
  calculatriceIndispensable: CATALOGUE_VARIANTES.filter((v) => v.id.endsWith("-direction")).map((v) => v.id),
  libelleCasParticulier: LIBELLE_CAS_EQUILIBRE_FORCES,
  titreDocument: "Équilibre de forces en composantes — Évaluation",
  nomFichierBase: "equilibre-forces-composantes",
  genererInstance: genererExerciceEquilibreForces,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: construireAvecVariante,
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee,
  bareme,
  enoncePapier,
};
