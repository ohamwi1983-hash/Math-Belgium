import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CriteresDifficulte, EnoncePapier, FragmentConsigne, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import type { ExerciceDroiteCercle } from "../../core/droiteCercle.types";
import { consigneGlobale, ecrans, enonceFragments, reponseBreveFragments } from "../../ui/formatDroiteCercle";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceDroiteCercle } from "./index";
import { correctionDetailleeDroiteCercle } from "./corrigeDetaille";
import { LIBELLE_CAS_DROITE_CERCLE, profilDroiteCercle } from "./profil";

/**
 * Adaptateur feuilles d'exercices / évaluations de gen92 « Tangente et position relative d'une droite
 * et d'un cercle ». Énoncé papier = les données + la consigne globale (les écrans sont des étapes
 * d'apprentissage : ils vont dans le corrigé, « Étape n — consigne »). Textes, réponses et corrigé
 * viennent des MÊMES fonctions que l'appli (`ui/formatDroiteCercle.ts`, `corrigeDetaille.ts`).
 */

type E = ExerciceDroiteCercle;

const LETTRES = "abcdefgh";

function construireEnonce(e: E): SectionExercice {
  return { enteteFragments: enonceFragments(e), questions: ecrans(e).map((ec) => ({ consigne: ec.consigne })) };
}

function enoncePapier(e: E): EnoncePapier {
  const n = ecrans(e).length;
  return {
    section: { enteteFragments: enonceFragments(e), questions: [{ consigne: [texte(consigneGlobale(e))] }] },
    etapesParQuestion: [LETTRES.slice(0, n).split("")],
  };
}

function reponseBreve(e: E): FragmentConsigne[] {
  return reponseBreveFragments(e);
}

function construireCorrection(e: E): BlocCorrection[] {
  return [{ type: "paragraphe", fragments: reponseBreve(e) }];
}

function bareme(e: E): BaremeExercice {
  if (e.variante === "tangente-point") {
    return {
      reponseFinale: reponseBreve(e),
      criteres: [
        { sousQuestion: "a", critere: [texte("Centre lu avec les bons signes et composantes de "), latex("\\vec{CP}"), texte(" justes")], points: 1 },
        { sousQuestion: "b", critere: [latex("\\vec{CP}"), texte(" reconnu comme vecteur normal (tangente perpendiculaire au rayon)")], points: 1 },
        { sousQuestion: "c", critere: [texte("Équation de la tangente par P, développée et réduite")], points: 2 },
      ],
      erreursFrequentes: [
        { description: [latex("\\vec{CP}"), texte(" pris comme vecteur directeur (droite (CP) au lieu de la tangente)")], cout: "0 pt sur b) et c)" },
        { description: [texte("Droite écrite par le centre C au lieu du point P")], cout: "moitié des points sur c)" },
        { description: [texte("Centre lu avec le mauvais signe")], cout: "−1" },
      ],
      reponsesAcceptees: [[texte("Toute équation équivalente (multipliée par une constante non nulle, forme explicite si elle existe)")]],
    };
  }
  if (e.variante === "position-relative") {
    return {
      reponseFinale: reponseBreve(e),
      criteres: [
        { sousQuestion: "a", critere: [texte("Centre et rayon par complétion des carrés")], points: 1 },
        { sousQuestion: "b", critere: [texte("Perpendiculaire à d par C et pied H (intersection)")], points: 1.5 },
        { sousQuestion: "c", critere: [texte("Distance CH en valeur exacte")], points: 0.5 },
        { sousQuestion: "d", critere: [texte("Comparaison de CH et r (ou de leurs carrés) et conclusion justifiée")], points: 1 },
      ],
      erreursFrequentes: [
        { description: [latex("CH^2"), texte(" comparé à r (et non à "), latex("r^2"), texte(")")], cout: "0 pt sur d)" },
        { description: [texte("Perpendiculaire construite avec un vecteur directeur de d")], cout: "0 pt sur b)" },
        { description: [texte("Rayon confondu avec "), latex("r^2")], cout: "−0,5" },
        { description: [texte("Résolution par substitution du système (méthode non demandée) sans comparaison distance / rayon")], cout: "moitié des points" },
      ],
      reponsesAcceptees: [[texte("Pied H obtenu par une autre écriture de la perpendiculaire (cartésienne), s'il est juste")]],
    };
  }
  return {
    reponseFinale: reponseBreve(e),
    criteres: [
      { sousQuestion: "a", critere: [texte("Perpendiculaire à d par C et pied H (intersection)")], points: 1.5 },
      { sousQuestion: "b", critere: [texte("Rayon r = CH en valeur exacte")], points: 1 },
      { sousQuestion: "c", critere: [texte("Équation du cercle avec "), latex("r^2"), texte(" au second membre et les bons signes")], points: 1.5 },
    ],
    erreursFrequentes: [
      { description: [texte("r écrit au second membre au lieu de "), latex("r^2")], cout: "−1" },
      { description: [texte("Rayon pris comme distance de C à un point quelconque de d")], cout: "0 pt sur a) et b)" },
      { description: [texte("Signes du centre inversés dans l'équation")], cout: "−0,5" },
    ],
    reponsesAcceptees: [[texte("Équation développée équivalente")]],
  };
}

/** Niveau (grille commune) : méthode imposée par la consigne (0) ; aucun piège dans les données.
 * « position-relative » : le verdict ne change ni le nombre d'écrans ni la longueur du corrigé (la
 * comparaison s'écrit toujours en trois lignes) — niveau et durée constants dans la variante. */
function criteresDifficulte(e: E): CriteresDifficulte {
  return { ...etapesDuCorrige(correctionDetailleeDroiteCercle(e)), methode: 0, piege: 0, nombres: 0 };
}

export const adaptateurEvaluationDroiteCercle: AdaptateurFeuilleExercices<E> = {
  profilInstance: profilDroiteCercle,
  libelleCasParticulier: LIBELLE_CAS_DROITE_CERCLE,
  titreDocument: "Tangente et position relative d'une droite et d'un cercle — Évaluation",
  nomFichierBase: "droite-cercle",
  genererInstance: genererExerciceDroiteCercle,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: construireAvecVariante,
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: correctionDetailleeDroiteCercle,
  bareme,
  enoncePapier,
};
