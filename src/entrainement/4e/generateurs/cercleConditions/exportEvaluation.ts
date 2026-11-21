import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CriteresDifficulte, EnoncePapier, FragmentConsigne, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import type { ExerciceCercleConditions } from "../../core/cercleConditions.types";
import { consigneGlobale, ecrans, enonceFragments, reponseBreveFragments } from "../../ui/formatCercleConditions";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceCercleConditions } from "./index";
import { correctionDetailleeCercleConditions } from "./corrigeDetaille";
import { profilCercleConditions } from "./profil";

/**
 * Adaptateur feuilles d'exercices / évaluations de gen93 « Déterminer un cercle par des conditions ».
 * Énoncé papier = les données + la consigne globale (les écrans — médiatrices, centre, rayon — sont des
 * étapes d'apprentissage : ils vont dans le corrigé). Mêmes fonctions que l'appli.
 */

type E = ExerciceCercleConditions;

const LETTRES = "abcdefgh";

function construireEnonce(e: E): SectionExercice {
  return { enteteFragments: enonceFragments(e), questions: ecrans(e).map((ec) => ({ consigne: ec.consigne })) };
}

function enoncePapier(e: E): EnoncePapier {
  return {
    section: { enteteFragments: enonceFragments(e), questions: [{ consigne: [texte(consigneGlobale(e))] }] },
    etapesParQuestion: [LETTRES.slice(0, ecrans(e).length).split("")],
  };
}

function reponseBreve(e: E): FragmentConsigne[] {
  return reponseBreveFragments(e);
}

function construireCorrection(e: E): BlocCorrection[] {
  return [{ type: "paragraphe", fragments: reponseBreve(e) }];
}

const ERREUR_RAYON_CARRE = { description: [texte("r écrit au second membre au lieu de "), latex("r^2"), texte(", ou signes du centre inversés")], cout: "−1" };

function bareme(e: E): BaremeExercice {
  const accepte = [[texte("Équation développée équivalente ; médiatrice écrite sous une autre forme équivalente")]];
  if (e.variante === "diametre") {
    return {
      reponseFinale: reponseBreve(e),
      criteres: [
        { sousQuestion: "a", critere: [texte("Centre = milieu de [AB]")], points: 1 },
        { sousQuestion: "b", critere: [texte("Rayon = AB/2 = ΩA en valeur exacte")], points: 1.5 },
        { sousQuestion: "c", critere: [texte("Équation du cercle")], points: 1.5 },
      ],
      erreursFrequentes: [{ description: [texte("Rayon pris égal à AB (le diamètre)")], cout: "0 pt sur b)" }, ERREUR_RAYON_CARRE],
      reponsesAcceptees: accepte,
    };
  }
  if (e.variante === "trois-points") {
    return {
      reponseFinale: reponseBreve(e),
      criteres: [
        { sousQuestion: "a", critere: [texte("Médiatrice de [AB] : milieu et vecteur normal")], points: 1 },
        { sousQuestion: "b", critere: [texte("Médiatrice de [BC]")], points: 1 },
        { sousQuestion: "c", critere: [texte("Centre = intersection des médiatrices (système résolu)")], points: 1 },
        { sousQuestion: "d", critere: [texte("Rayon exact")], points: 0.5 },
        { sousQuestion: "e", critere: [texte("Équation du cercle")], points: 0.5 },
      ],
      erreursFrequentes: [
        { description: [texte("Médiatrice construite avec le vecteur du segment comme vecteur directeur")], cout: "0 pt sur a) et b)" },
        { description: [texte("Médiatrice qui ne passe pas par le milieu (par une extrémité)")], cout: "moitié des points sur a) et b)" },
        ERREUR_RAYON_CARRE,
      ],
      reponsesAcceptees: [...accepte, [texte("Médiatrices de deux autres côtés, si elles sont justes")]],
    };
  }
  return {
    reponseFinale: reponseBreve(e),
    criteres: [
      { sousQuestion: "a", critere: [texte("Médiatrice de [AB] : milieu et vecteur normal")], points: 1.5 },
      { sousQuestion: "b", critere: [texte("Centre = intersection de d et de la médiatrice")], points: 1 },
      { sousQuestion: "c", critere: [texte("Rayon exact")], points: 0.5 },
      { sousQuestion: "d", critere: [texte("Équation du cercle")], points: 1 },
    ],
    erreursFrequentes: [
      { description: [texte("Médiatrice construite avec le vecteur du segment comme vecteur directeur")], cout: "0 pt sur a)" },
      { description: [texte("Centre pris au milieu de [AB] (il n'est pas sur d)")], cout: "0 pt sur b)" },
      ERREUR_RAYON_CARRE,
    ],
    reponsesAcceptees: accepte,
  };
}

/** Niveau : diamètre → méthode imposée (0) ; trois points et centre sur une droite → l'élève choisit la
 * méthode du cours (médiatrices : 1). Aucun piège dans les données. */
function criteresDifficulte(e: E): CriteresDifficulte {
  return { ...etapesDuCorrige(correctionDetailleeCercleConditions(e)), methode: e.variante === "diametre" ? 0 : 1, piege: 0, nombres: 0 };
}

export const adaptateurEvaluationCercleConditions: AdaptateurFeuilleExercices<E> = {
  profilInstance: profilCercleConditions,
  titreDocument: "Déterminer un cercle par des conditions — Évaluation",
  nomFichierBase: "cercle-conditions",
  genererInstance: genererExerciceCercleConditions,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: construireAvecVariante,
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: correctionDetailleeCercleConditions,
  bareme,
  enoncePapier,
};
