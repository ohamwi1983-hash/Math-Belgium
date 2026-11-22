import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CriteresDifficulte, EnoncePapier, FragmentConsigne, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import type { ExerciceTraduireLieu } from "../../core/traduireLieu.types";
import { CONSIGNE_PAPIER, ecrans, enonceFragments, parametresParabole, reponseBreveFragments } from "../../ui/formatTraduireLieu";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceTraduireLieu } from "./index";
import { correctionDetailleeTraduireLieu } from "./corrigeDetaille";
import { LIBELLE_CAS_PARTICULIER, profilTraduireLieu } from "./profil";

/**
 * Adaptateur feuilles d'exercices / évaluations de gen131 « Traduire un lieu géométrique en équation ».
 * Énoncé papier = la phrase qui décrit le lieu + UNE consigne (« Reconnais ce lieu et détermine son
 * équation (ou ses équations). ») ; les écrans (traduction, développement, points, sommet, nature…)
 * sont des étapes d'apprentissage : ils vont dans le corrigé. Regroupement a), b) par le registre
 * (`regroupementsPapier.ts` : la description du lieu est la ligne).
 */

type E = ExerciceTraduireLieu;
const LETTRES = "abcdefgh";

function construireEnonce(e: E): SectionExercice {
  return { enteteFragments: enonceFragments(e), questions: ecrans(e).map((ec) => ({ consigne: ec.consigne })) };
}

function enoncePapier(e: E): EnoncePapier {
  return {
    section: { enteteFragments: enonceFragments(e), questions: [{ consigne: [texte(CONSIGNE_PAPIER)] }] },
    etapesParQuestion: [LETTRES.slice(0, ecrans(e).length).split("")],
  };
}

function reponseBreve(e: E): FragmentConsigne[] {
  return reponseBreveFragments(e);
}

function construireCorrection(e: E): BlocCorrection[] {
  return [{ type: "paragraphe", fragments: reponseBreve(e) }];
}

function bareme(e: E): BaremeExercice {
  const accepte = [[texte("Toute équation équivalente (multipliée par un nombre non nul, développée ou non)")]];
  switch (e.variante) {
    case "mediatrice":
      return {
        reponseFinale: reponseBreve(e),
        criteres: [
          { sousQuestion: "a", critere: [texte("Traduction "), latex("MA^2=MB^2"), texte(" avec les deux distances de Pythagore")], points: 1 },
          { sousQuestion: "b", critere: [texte("Développement et réduction : équation de la droite")], points: 2 },
          { sousQuestion: "c", critere: [texte("Nature reconnue : la médiatrice de [AB] (milieu, perpendiculaire)")], points: 1 },
        ],
        erreursFrequentes: [
          { description: [texte("Double produit oublié en développant un carré")], cout: "moitié des points sur b)" },
          { description: [texte("Signe du terme constant perdu en passant tout dans un membre")], cout: "−0,5" },
          { description: [texte("Distances écrites sans les carrés (oubli de Pythagore)")], cout: "0 pt sur a) et b)" },
        ],
        reponsesAcceptees: accepte,
      };
    case "distance-droite":
      return e.type === "oblique"
        ? {
            reponseFinale: reponseBreve(e),
            criteres: [
              { sousQuestion: "a", critere: [texte("Nature : deux droites parallèles à d, une de chaque côté")], points: 1 },
              { sousQuestion: "b", critere: [texte("Deux points à la distance r sur la perpendiculaire (vecteur normal ramené à la norme r)")], points: 1.5 },
              { sousQuestion: "c", critere: [texte("Les deux équations (même vecteur normal que d)")], points: 1.5 },
            ],
            erreursFrequentes: [
              { description: [texte("Une seule parallèle")], cout: "moitié des points sur c)" },
              { description: [texte("Terme constant décalé de r au lieu de r fois la norme du vecteur normal")], cout: "0 pt sur b) et c)" },
            ],
            reponsesAcceptees: accepte,
          }
        : {
            reponseFinale: reponseBreve(e),
            criteres: [
              { sousQuestion: "a", critere: [texte("Nature : deux droites parallèles à d, une de chaque côté")], points: 1.5 },
              { sousQuestion: "b", critere: [texte("Les deux équations (écart de coordonnées égal à r)")], points: 2.5 },
            ],
            erreursFrequentes: [
              { description: [texte("Une seule parallèle")], cout: "moitié des points sur b)" },
              { description: [texte("Droites à la distance r de l'axe au lieu de d")], cout: "0 pt sur b)" },
            ],
            reponsesAcceptees: accepte,
          };
    case "deux-paralleles":
      return {
        reponseFinale: reponseBreve(e),
        criteres: [
          { sousQuestion: "a", critere: [texte("Droites parallèles (critère de colinéarité des vecteurs normaux) ; le lieu est la parallèle médiane")], points: 1.5 },
          { sousQuestion: "b", critere: [texte(e.k !== 1 ? "d₂ ramenée aux mêmes coefficients, puis terme constant moyen" : "Terme constant moyen : équation de la parallèle médiane")], points: 2.5 },
        ],
        erreursFrequentes: [
          { description: [texte("Moyenne des termes constants sans avoir ramené d₂ aux mêmes coefficients")], cout: "0 pt sur b)" },
          { description: [texte("Somme des termes constants sans division par 2")], cout: "moitié des points sur b)" },
        ],
        reponsesAcceptees: accepte,
      };
    case "parabole":
      return {
        reponseFinale: reponseBreve(e),
        criteres: [
          { sousQuestion: "a", critere: [texte("Nature : parabole de foyer F et de directrice d")], points: 1 },
          { sousQuestion: "b", critere: [texte("Sommet (milieu de F et de son projeté sur d) et p signé")], points: 1.5 },
          { sousQuestion: "c", critere: [texte("Équation de la parabole")], points: 1.5 },
        ],
        erreursFrequentes: [
          { description: [texte("p sans son signe")], cout: "−0,5 sur b) et c)" },
          { description: [texte("p confondu avec la distance du sommet au foyer, ou coefficient p au lieu de 2p")], cout: "−1" },
          { description: [texte("Équation écrite avec le foyer au lieu du sommet")], cout: "0 pt sur c)" },
        ],
        reponsesAcceptees: [...accepte, [texte("La traduction directe "), latex("MF^2=\\text{dist}(M,d)^2"), texte(" développée, si elle est juste")]],
      };
    case "cercle":
      return {
        reponseFinale: reponseBreve(e),
        criteres: [
          { sousQuestion: "a", critere: [texte("Nature : le cercle de centre C et de rayon r")], points: 1.5 },
          { sousQuestion: "b", critere: [texte("Équation du cercle")], points: 2.5 },
        ],
        erreursFrequentes: [
          { description: [texte("r au second membre au lieu de "), latex("r^2"), texte(", ou signes du centre inversés")], cout: "−1" },
          { description: [texte("Disque au lieu du cercle")], cout: "0 pt sur a)" },
        ],
        reponsesAcceptees: accepte,
      };
  }
}

/** Niveau : une étape par écran (le choix de la nature est une décision). Méthode 1 quand l'élève
 * choisit la traduction (MA² = MB², point et vecteur normal, sommet et p) ; 0 pour le cercle, la
 * distance à une horizontale / verticale et la parallèle médiane. Piège dans les données : d₂ écrite
 * multipliée, p négatif. */
function criteresDifficulte(e: E): CriteresDifficulte {
  const methode: 0 | 1 = e.variante === "mediatrice" || e.variante === "parabole" || (e.variante === "distance-droite" && e.type === "oblique") ? 1 : 0;
  const piege: 0 | 1 = (e.variante === "deux-paralleles" && e.k !== 1) || (e.variante === "parabole" && parametresParabole(e).p < 0) ? 1 : 0;
  return { ...etapesDuCorrige(correctionDetailleeTraduireLieu(e)), methode, piege, nombres: 0 };
}

export const adaptateurEvaluationTraduireLieu: AdaptateurFeuilleExercices<E> = {
  profilInstance: profilTraduireLieu,
  libelleCasParticulier: LIBELLE_CAS_PARTICULIER,
  titreDocument: "Traduire un lieu géométrique en équation — Évaluation",
  nomFichierBase: "traduire-lieu-equation",
  genererInstance: genererExerciceTraduireLieu,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: construireAvecVariante,
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: correctionDetailleeTraduireLieu,
  bareme,
  enoncePapier,
};
