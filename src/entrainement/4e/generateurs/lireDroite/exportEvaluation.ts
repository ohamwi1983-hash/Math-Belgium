import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CriteresDifficulte, EnoncePapier, FragmentConsigne, ProfilInstance, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import type { ExerciceLireDroite } from "../../core/lireDroite.types";
import { CONSIGNE_IMPOSSIBLE, CONSIGNE_LECTURE, consigneEcran, enonceFragments, figuresHtml, questionsPapier, reponseBreveFragments } from "../../ui/formatLireDroite";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceLireDroite } from "./index";
import { correctionDetailleeLireDroite } from "./corrigeDetaille";

/**
 * Adaptateur feuilles d'exercices / évaluations de gen132 « Lire une droite : associer droites et
 * équations » (Connaître). Énoncé papier = les quatre équations, les six droites (même quadrillage,
 * aucun point marqué) et TROIS VRAIES questions distinctes : a) associer les droites 1 à 4 (étapes
 * a–d du corrigé), b) lire m et p de d (étape e), c) l'écriture impossible pour g (étape f). Jamais
 * regroupé (vraies questions).
 */

type E = ExerciceLireDroite;

/**
 * Profil d'instance (tirage équilibré) : `forme` = la variante (pentes entières, fractionnaires, ou
 * droites parallèles aux axes). L'association (quelle droite va avec quelle équation) et la nature de
 * g (verticale ou horizontale) sont des verdicts, tirés au hasard dans chaque série. Aucun cas
 * particulier, pas de `calcul` (tout se lit sur le quadrillage).
 */
export function profilLireDroite(e: E): ProfilInstance {
  return { casParticulier: null, forme: e.variante };
}

function construireEnonce(e: E): SectionExercice {
  return {
    enteteFragments: enonceFragments(e),
    enteteHtml: figuresHtml(e),
    questions: [...[0, 1, 2, 3].map((n) => ({ consigne: consigneEcran(n) })), { consigne: CONSIGNE_LECTURE }, { consigne: CONSIGNE_IMPOSSIBLE }],
  };
}

function enoncePapier(e: E): EnoncePapier {
  return {
    section: { enteteFragments: enonceFragments(e), enteteHtml: figuresHtml(e), questions: questionsPapier().map((consigne) => ({ consigne })) },
    etapesParQuestion: [["a", "b", "c", "d"], ["e"], ["f"]],
  };
}

function reponseBreve(e: E): FragmentConsigne[] {
  return reponseBreveFragments(e);
}

function construireCorrection(e: E): BlocCorrection[] {
  return [{ type: "paragraphe", fragments: reponseBreve(e) }];
}

function bareme(e: E): BaremeExercice {
  return {
    reponseFinale: reponseBreve(e),
    criteres: [
      ...["a", "b", "c", "d"].map((sq, n) => ({ sousQuestion: sq, critere: [texte(`Droite ${n + 1} associée, avec une lecture qui le justifie (pente, ordonnée à l'origine ou direction)`)], points: 0.5 })),
      { sousQuestion: "e", critere: [texte("Pente et ordonnée à l'origine de d lues (escalier)")], points: 1 },
      { sousQuestion: "f", critere: e.impossible.type === "verticale" ? [texte("Écriture "), latex("y=mx+p"), texte(" impossible : g est verticale (pas de pente)")] : [texte("Écriture "), latex("x=ny+q"), texte(" impossible : g est horizontale")], points: 1 },
    ],
    erreursFrequentes: [
      { description: [texte("Pente lue à l'envers (avancée divisée par montée) ou sans son signe")], cout: "0 pt sur la droite concernée" },
      { description: [texte("Ordonnée à l'origine lue sur l'axe Ox")], cout: "0 pt sur la droite concernée" },
      { description: [texte("Horizontale et verticale confondues (y = k et x = k)")], cout: "0 pt sur la question concernée" },
      { description: [texte("Association juste sans justification")], cout: "moitié des points de la droite" },
    ],
    reponsesAcceptees: [[texte("Toute justification correcte par lecture : un point du quadrillage qui vérifie l'équation compte comme lecture")]],
  };
}

/** Niveau : six écrans de LECTURE (associer, lire m et p, reconnaître une écriture impossible — comme
 * gen128 et 5gen53) ; méthode imposée (0) ; piège dans les données : les leurres de la famille (pente
 * opposée, p opposé, composantes échangées, x = k / y = k), toujours présents → niveau et durée
 * constants. */
function criteresDifficulte(e: E): CriteresDifficulte {
  return { ...etapesDuCorrige(correctionDetailleeLireDroite(e), ["a", "b", "c", "d", "e", "f"]), methode: 0, piege: 1, nombres: 0 };
}

export const adaptateurEvaluationLireDroite: AdaptateurFeuilleExercices<E> = {
  profilInstance: profilLireDroite,
  titreDocument: "Lire une droite : associer droites et équations — Évaluation",
  nomFichierBase: "lire-droite-associer-equations",
  genererInstance: genererExerciceLireDroite,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: construireAvecVariante,
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: correctionDetailleeLireDroite,
  bareme,
  enoncePapier,
};
