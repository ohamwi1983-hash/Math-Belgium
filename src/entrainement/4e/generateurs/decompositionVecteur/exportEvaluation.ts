import type {
  AdaptateurFeuilleExercices,
  BaremeExercice,
  BlocCorrection,
  CriteresDifficulte,
  EnoncePapier,
  ErreurFrequente,
  EtapeCorrection,
  FragmentConsigne,
  SectionExercice,
} from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { correctionDetailleeDecompositionVecteur } from "./corrigeDetaille";
import type { ExerciceDecompositionVecteur } from "../../core/decompositionVecteur.types";
import {
  U,
  V,
  W,
  combinaisonLatex,
  consignesEcrans,
  enonceFragments,
  nombreLatex,
  questionPapier,
  termeSansSigneSigne,
} from "../../ui/formatDecompositionVecteur";
import { construireFigureDecomposition } from "../../ui/figureDecompositionVecteur";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceDecompositionVecteur } from "./index";
import { LIBELLE_CAS_DECOMPOSITION_VECTEUR, profilDecompositionVecteur } from "./profil";

/**
 * Adaptateur feuilles d'exercices / évaluations de gen82. Énoncé papier = données (+ figure pour la
 * famille graphique) + la consigne globale (« Écris u sous la forme av + bw… », « Détermine a et
 * b… », « La décomposition est-elle possible ? Si oui… ») ; les écrans d'apprentissage deviennent les
 * étapes a, b, c du corrigé, la première avec la figure de la construction (`figureHtml`).
 * Séries équilibrées : `profil.ts`.
 */

function figureEnonce(e: ExerciceDecompositionVecteur): string | undefined {
  return e.type === "graphique" ? construireFigureDecomposition(e, { theme: "papier" }) : undefined;
}

/** Énoncé STRUCTURÉ (une sous-question par écran) : sert aux titres « Étape n — … » du corrigé. */
function construireEnonce(e: ExerciceDecompositionVecteur): SectionExercice {
  return {
    enteteFragments: enonceFragments(e),
    enteteHtml: figureEnonce(e),
    questions: consignesEcrans(e).map((consigne) => ({ consigne })),
  };
}

function enoncePapier(e: ExerciceDecompositionVecteur): EnoncePapier {
  return {
    section: { enteteFragments: enonceFragments(e), enteteHtml: figureEnonce(e), questions: [{ consigne: questionPapier(e) }] },
    etapesParQuestion: [e.type === "composantes" && e.famille === "possible" ? ["a", "b"] : ["a", "b", "c"]],
  };
}

function reponseBreve(e: ExerciceDecompositionVecteur): FragmentConsigne[] {
  if (e.type === "graphique") return [latex(`${U} = ${combinaisonLatex(e.a, e.b)}`)];
  if (!e.possible) return [texte("Impossible : "), latex(`${W} = ${termeSansSigneSigne(e.k!, V)}`), texte(" (colinéaires).")];
  return [latex(`a = ${nombreLatex(e.a!)}`), texte(" et "), latex(`b = ${nombreLatex(e.b!)}`), texte(" : "), latex(`${U} = ${combinaisonLatex(e.a!, e.b!)}`)];
}

// ---------------------------------------------------------------------------------------------
// Corrigé détaillé (`corrigeDetaille.ts`, partagé avec l'appli) et niveau
// ---------------------------------------------------------------------------------------------

function correctionDetaillee(e: ExerciceDecompositionVecteur): EtapeCorrection[] {
  return correctionDetailleeDecompositionVecteur(e);
}

function criteresDifficulte(e: ExerciceDecompositionVecteur): CriteresDifficulte {
  if (e.type === "graphique") return { ...etapesDuCorrige(correctionDetailleeDecompositionVecteur(e), ["a"]), methode: 0, piege: e.a <= 0 || e.b <= 0 ? 1 : 0, nombres: 0 };
  // « Possible ? » : niveau et durée CONSTANTS (le verdict ne doit pas se lire) ; b = système + résolution, ou k + critère de u.
  if (e.famille === "possible") return { etapesTransformation: 3, etapesLecture: 0, sansCharge: true, methode: 1, piege: 0, nombres: 0 };
  return { ...etapesDuCorrige(correctionDetailleeDecompositionVecteur(e)), methode: 0, piege: 0, nombres: 0 };
}

function construireCorrection(e: ExerciceDecompositionVecteur): BlocCorrection[] {
  return correctionDetaillee(e)
    .filter((etape) => etape.type === "resultat")
    .map((etape) => ({ type: "paragraphe", fragments: [texte(`${etape.sousQuestion}) `), ...etape.fragments] }));
}

function bareme(e: ExerciceDecompositionVecteur): BaremeExercice {
  const erreurSigne: ErreurFrequente = { description: [texte("Coefficient négatif écrit positif (vecteur « à contresens »)")], cout: "0,5 pt par coefficient" };
  const erreurEchange: ErreurFrequente = { description: [texte("Coefficients de v et de w échangés")], cout: "moitié des points des coefficients" };
  if (e.type === "graphique") {
    return {
      reponseFinale: reponseBreve(e),
      criteres: [
        { sousQuestion: "a", critere: [texte("Construction : parallèle à v par l'origine de u, parallèle à w par son extrémité, point M")], points: 1.5 },
        { sousQuestion: "b", critere: [texte("Coefficient a, signe compris")], points: 1 },
        { sousQuestion: "c", critere: [texte("Coefficient b, signe compris, et écriture de u = av + bw")], points: 1.5 },
      ],
      erreursFrequentes: [
        erreurSigne,
        erreurEchange,
        { description: [texte("Perpendiculaires tracées au lieu des parallèles")], cout: "0 pt sur la construction" },
      ],
      reponsesAcceptees: [[texte("Coefficients écrits en fraction ou en décimal (0,5 pour la moitié)")]],
    };
  }
  if (e.famille === "composantes") {
    return {
      reponseFinale: reponseBreve(e),
      criteres: [
        { sousQuestion: "a", critere: [texte("Système : une équation par composante")], points: 1 },
        { sousQuestion: "b", critere: [texte("Résolution : a et b exacts, étapes montrées")], points: 2 },
        { sousQuestion: "c", critere: [texte("Vérification : av + bw redonne u")], points: 1 },
      ],
      erreursFrequentes: [
        { description: [texte("Système « transposé » (composantes de v dans la même équation)")], cout: "0 pt sur le système, la résolution reste notée" },
        erreurEchange,
        erreurSigne,
      ],
      reponsesAcceptees: [[texte("Toute méthode de résolution correcte (substitution, combinaison)")], [texte("Coefficients écrits en fraction ou en décimal")]],
    };
  }
  return {
    reponseFinale: reponseBreve(e),
    criteres: [
      { sousQuestion: "a", critere: [texte("Verdict justifié (v et w colinéaires ou non)")], points: 1.5 },
      { sousQuestion: "b", critere: [texte(e.possible ? "a et b exacts, système et résolution montrés" : "k tel que w = kv, et conclusion : u n'est pas colinéaire à v")], points: 2.5 },
    ],
    erreursFrequentes: [
      { description: [texte("Verdict sans justification")], cout: "0,5 pt sur le verdict" },
      { description: [texte("Système résolu sans vérifier la colinéarité")], cout: "1 pt sur le verdict" },
      erreurSigne,
    ],
    reponsesAcceptees: [[texte("Justification par le critère de colinéarité (produits en croix) ou par la proportionnalité des composantes")]],
  };
}

export const adaptateurEvaluationDecompositionVecteur: AdaptateurFeuilleExercices<ExerciceDecompositionVecteur> = {
  profilInstance: profilDecompositionVecteur,
  libelleCasParticulier: LIBELLE_CAS_DECOMPOSITION_VECTEUR,
  titreDocument: "Décomposer un vecteur selon deux directions — Évaluation",
  nomFichierBase: "decomposer-vecteur",
  genererInstance: genererExerciceDecompositionVecteur,
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
