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
import { correctionDetailleeTraverserRiviere } from "./corrigeDetaille";
import type { ExerciceTraverserRiviere } from "../../core/traverserRiviere.types";
import { estExacte, valeurAffichee } from "../../moteur/modeleTraverserRiviere";
import {
  colonne,
  consignesEcrans,
  enonceFragments,
  etapesParQuestionPapier,
  n,
  questionsPapier,
  resultatFragments,
  VP,
} from "../../ui/formatTraverserRiviere";
import { construireFigureTraverserRiviere } from "../../ui/figureTraverserRiviere";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceTraverserRiviere } from "./index";
import { profilTraverserRiviere } from "./profil";

function figureEnonce(e: ExerciceTraverserRiviere): string {
  return construireFigureTraverserRiviere(e, { theme: "papier" });
}

function enonceAvecConsigne(e: ExerciceTraverserRiviere): FragmentConsigne[] {
  return [...enonceFragments(e), texte(" Travaille avec les composantes des vitesses dans ce repère.")];
}

/** Énoncé STRUCTURÉ (une sous-question par écran) : sert aux titres « Étape n — … » du corrigé. */
function construireEnonce(e: ExerciceTraverserRiviere): SectionExercice {
  return {
    enteteFragments: enonceAvecConsigne(e),
    enteteHtml: figureEnonce(e),
    questions: consignesEcrans(e, "papier").map((consigne) => ({ consigne })),
  };
}

function enoncePapier(e: ExerciceTraverserRiviere): EnoncePapier {
  return {
    section: {
      enteteFragments: enonceAvecConsigne(e),
      enteteHtml: figureEnonce(e),
      questions: questionsPapier(e).map((consigne) => ({ consigne })),
    },
    etapesParQuestion: etapesParQuestionPapier(e),
  };
}

function reponseBreve(e: ExerciceTraverserRiviere): FragmentConsigne[] {
  if (e.variante === "enFace") {
    return [latex(`${VP}${colonne(n(-e.courant), estExacte(e, "pythagore") ? n(valeurAffichee(e, "pythagore")) : `\\approx ${n(valeurAffichee(e, "pythagore"))}`)}`), texte(" ; "), ...resultatFragments(e, "dureeEnFace")];
  }
  return [...resultatFragments(e, "duree"), texte(" ; "), ...resultatFragments(e, "accostage"), texte(" ; "), ...resultatFragments(e, e.quatrieme)];
}

function correctionDetaillee(e: ExerciceTraverserRiviere): EtapeCorrection[] {
  return correctionDetailleeTraverserRiviere(e);
}

function criteresDifficulte(e: ExerciceTraverserRiviere): CriteresDifficulte {
  // Méthode 1 (modèle des vitesses en composantes, repère donné ; enFace : condition « x = 0 » à poser) ; piège : le courant qui ne change pas la durée (accostage) / composante y par Pythagore et non par soustraction (enFace) — dans la situation même : 1 pour les deux. Nombres : détectés (valeur arrondie).
  return { ...etapesDuCorrige(correctionDetailleeTraverserRiviere(e)), methode: 1, piege: 1 };
}

function construireCorrection(e: ExerciceTraverserRiviere): BlocCorrection[] {
  return correctionDetaillee(e)
    .filter((etape) => etape.type === "resultat")
    .map((etape) => ({ type: "paragraphe", fragments: [texte(`${etape.sousQuestion}) `), ...etape.fragments] }));
}

function bareme(e: ExerciceTraverserRiviere): BaremeExercice {
  if (e.variante === "enFace") {
    return {
      reponseFinale: reponseBreve(e),
      criteres: [
        { sousQuestion: "a", critere: [texte("Composante x de la vitesse propre : opposée au courant (signe compris)")], points: 1 },
        { sousQuestion: "b", critere: [texte("Composante y par Pythagore, avec l'unité")], points: 1.5 },
        { sousQuestion: "c", critere: [texte("Durée : largeur divisée par la composante y")], points: 1.5 },
      ],
      erreursFrequentes: [
        { description: [texte("Composante x égale au courant (signe oublié : la vitesse propre irait vers l'aval)")], cout: "0 pt sur l'étape a" },
        { description: [texte("Composante y obtenue par une différence des normes")], cout: "0 pt sur l'étape b" },
        { description: [texte("Durée calculée avec la norme de la vitesse propre")], cout: "0 pt sur l'étape c" },
        { description: [texte("Unité absente ou fausse")], cout: "−0,5 pt" },
      ],
      reponsesAcceptees: [[texte("Valeur exacte avec une racine carrée")], [texte("Écart d'environ 1 % dû aux arrondis intermédiaires")], [texte("Résultat juste à partir d'une valeur intermédiaire fausse : points de méthode accordés (pas de double sanction)")]],
    };
  }
  return {
    reponseFinale: reponseBreve(e),
    criteres: [
      { sousQuestion: "a", critere: [texte("Vitesse réelle en composantes (courant sur la composante x)")], points: 0.5 },
      { sousQuestion: "b", critere: [texte("Durée : largeur divisée par la composante y")], points: 1 },
      { sousQuestion: "c", critere: [texte("Point d'accostage : composante x multipliée par la durée")], points: 1.5 },
      { sousQuestion: "d", critere: [texte(e.quatrieme === "vitesse" ? "Vitesse réelle : norme par Pythagore, avec l'unité" : "Distance parcourue : Pythagore (ou vitesse réelle multipliée par la durée), avec l'unité")], points: 1 },
    ],
    erreursFrequentes: [
      { description: [texte("Durée calculée avec la vitesse réelle (le courant ne change pas la durée)")], cout: "0 pt sur l'étape b" },
      ...(e.perpendiculaire ? [] : [{ description: [texte("Point d'accostage calculé avec le seul courant, sans la composante x de la vitesse propre")], cout: "moitié des points de l'étape c" }]),
      { description: [texte(e.quatrieme === "vitesse" ? "Norme obtenue en additionnant les composantes" : "Distance obtenue en additionnant la largeur et la dérive")], cout: "0 pt sur l'étape d" },
      { description: [texte("Unité absente ou fausse")], cout: "−0,5 pt" },
    ],
    reponsesAcceptees: [[texte("Valeur exacte avec une racine carrée")], [texte("Résultat juste à partir d'une valeur intermédiaire fausse : points de méthode accordés (pas de double sanction)")]],
  };
}

export const adaptateurEvaluationTraverserRiviere: AdaptateurFeuilleExercices<ExerciceTraverserRiviere> = {
  profilInstance: profilTraverserRiviere,
  titreDocument: "Traverser une rivière : vitesses en composantes — Évaluation",
  nomFichierBase: "traverser-riviere-composantes",
  genererInstance: genererExerciceTraverserRiviere,
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
