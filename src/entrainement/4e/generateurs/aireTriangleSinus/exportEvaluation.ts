import type {
  AdaptateurFeuilleExercices,
  BaremeExercice,
  BlocCorrection,
  EnoncePapier,
  ErreurFrequente,
  CriteresDifficulte,
  FragmentConsigne,
  SectionExercice,
} from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import type { ExerciceAireTriangleSinus } from "../../core/aireTriangleSinus.types";
import { anglesAttendus, calculExact, etapes } from "../../moteur/modeleAireTriangleSinus";
import {
  consigneEtape,
  consignePapier,
  donneesFragments,
  noms,
  reponseAnglesLatex,
  reponseNumeriqueLatex,
} from "../../ui/formatAireTriangleSinus";
import { figureSvgPapier } from "../../ui/figureAireTriangleSinus";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceAireTriangleSinus } from "./index";
import { LIBELLE_CAS_AIRE_TRIANGLE, profilAireTriangleSinus } from "./profil";
import { correctionDetailleeAireTriangleSinus } from "./corrigeDetaille";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";

/**
 * Adaptateur feuilles d'exercices / évaluations de gen75. Énoncé papier = données + figure à
 * l'échelle (inconnue « ? ») + consigne globale (objectif et précision demandée) ; les écrans du
 * générateur (formule, calculs intermédiaires, nombre d'amplitudes…) deviennent les étapes a, b, c
 * du corrigé. Famille `angle` : pas de figure sur papier (une figure montrerait l'une des deux
 * configurations et ferait oublier l'autre — c'est précisément le piège évalué). Séries
 * équilibrées : `profil.ts`. Toutes les valeurs viennent des fonctions de l'écran
 * (`ui/formatAireTriangleSinus.ts`, `moteur/modeleAireTriangleSinus.ts`).
 */

type E = ExerciceAireTriangleSinus;
const LETTRES = ["a", "b", "c", "d"];

function lettres(e: E): string[] {
  return etapes(e).map((_, i) => LETTRES[i]!);
}

function figure(e: E): string | undefined {
  return e.famille === "angle" ? undefined : figureSvgPapier(e);
}

/** Énoncé STRUCTURÉ (une sous-question par écran) : sert aux titres « Étape n — … » du corrigé. */
function construireEnonce(e: E): SectionExercice {
  return {
    enteteFragments: donneesFragments(e),
    enteteHtml: figure(e),
    questions: etapes(e).map((etape) => ({ consigne: consigneEtape(e, etape) })),
  };
}

function enoncePapier(e: E): EnoncePapier {
  return {
    section: { enteteFragments: donneesFragments(e), enteteHtml: figure(e), questions: [{ consigne: consignePapier(e) }] },
    etapesParQuestion: [lettres(e)],
  };
}

function reponseBreve(e: E): FragmentConsigne[] {
  switch (e.famille) {
    case "aire":
      return [latex(reponseNumeriqueLatex(e, "calculAire"))];
    case "cote":
      return [latex(reponseNumeriqueLatex(e, "calculCote"))];
    case "angle":
      return [latex(reponseAnglesLatex(e))];
    case "quadrilatere":
      return [latex(reponseNumeriqueLatex(e, "aireTotale"))];
    case "heron":
      return [latex(reponseNumeriqueLatex(e, "aireHeron"))];
  }
}

function construireCorrection(e: E): BlocCorrection[] {
  return [{ type: "paragraphe", fragments: reponseBreve(e) }];
}

function bareme(e: E): BaremeExercice {
  const radians: ErreurFrequente = { description: [texte("Calculatrice en radians")], cout: "−1" };
  const unite: ErreurFrequente = { description: [texte("Unité absente ou aire exprimée en unité de longueur")], cout: "−0,5" };
  const accepte: FragmentConsigne[][] = [[texte("Valeur exacte ou valeur approchée cohérente (arrondi final seulement)")]];
  switch (e.famille) {
    case "aire":
      return {
        reponseFinale: reponseBreve(e),
        criteres: [
          { sousQuestion: "a", critere: [texte("Formule avec deux côtés et l'angle compris")], points: 1.5 },
          { sousQuestion: "b", critere: [texte(calculExact(e) ? "Valeur exacte du sinus et calcul" : "Substitution et calcul (calculatrice en degrés)")], points: 1.5 },
          { sousQuestion: "b", critere: [texte("Résultat avec l'unité d'aire")], points: 1 },
        ],
        erreursFrequentes: [
          { description: [texte("Oubli du facteur ½")], cout: "−1" },
          { description: [texte("Angle non compris entre les deux côtés, ou cosinus au lieu du sinus")], cout: "0 pt sur l'étape 2" },
          radians,
          unite,
        ],
        reponsesAcceptees: accepte,
      };
    case "cote":
      return {
        reponseFinale: reponseBreve(e),
        criteres: [
          { sousQuestion: "a", critere: [texte(`Formule de l'aire et ${noms(e).seg2} isolé correctement`)], points: 1.5 },
          { sousQuestion: "b", critere: [texte("Substitution et calcul")], points: 1.5 },
          { sousQuestion: "b", critere: [texte("Résultat avec l'unité de longueur")], points: 1 },
        ],
        erreursFrequentes: [
          { description: [texte("Isolement faux (facteur 2 oublié ou sinus au numérateur)")], cout: "0 pt sur l'étape 1" },
          radians,
          { description: [texte("Unité absente")], cout: "−0,5" },
        ],
        reponsesAcceptees: accepte,
      };
    case "angle": {
      const deux = anglesAttendus(e).length === 2;
      return {
        reponseFinale: reponseBreve(e),
        criteres: [
          { sousQuestion: "a", critere: [texte("Sinus isolé et calculé")], points: 1.5 },
          { sousQuestion: "b", critere: [texte(deux ? "Deux amplitudes reconnues (angles supplémentaires)" : "Une seule amplitude reconnue (sinus égal à 1)")], points: 1 },
          { sousQuestion: "c", critere: [texte(deux ? "Les deux amplitudes justes" : "Amplitude juste")], points: 1.5 },
        ],
        erreursFrequentes: deux
          ? [
              { description: [texte("Seconde amplitude oubliée (seulement l'angle aigu)")], cout: "−1,5" },
              { description: [texte("Complémentaire (90° − angle) au lieu du supplémentaire")], cout: "−1" },
              { description: [texte("Facteur 2 oublié dans le sinus")], cout: "0 pt sur l'étape 1" },
              radians,
            ]
          : [{ description: [texte("Facteur 2 oublié dans le sinus")], cout: "0 pt sur l'étape 1" }],
        reponsesAcceptees: [[texte("Amplitudes arrondies au dixième de degré (ou au degré)")]],
      };
    }
    case "quadrilatere":
      return {
        reponseFinale: reponseBreve(e),
        criteres: [
          { sousQuestion: "a", critere: [texte("Aire du triangle ABC")], points: 1 },
          { sousQuestion: "b", critere: [texte(e.angleB === 90 ? "Diagonale AC par Pythagore" : "Diagonale AC par Al-Kashi")], points: 1.5 },
          { sousQuestion: "c", critere: [texte("Aire de ACD et somme des deux aires")], points: 1.5 },
        ],
        erreursFrequentes: [
          { description: [texte("Al-Kashi sans le terme en cosinus, ou avec le mauvais signe")], cout: "0 pt sur l'étape 2" },
          { description: [texte("Racine carrée oubliée (AC² utilisé comme AC)")], cout: "−1" },
          { description: [texte("Une seule des deux aires donnée comme aire de ABCD")], cout: "−1" },
          radians,
        ],
        reponsesAcceptees: [[texte("Résultat calculé avec AC arrondi au centième (écart d'arrondi accepté)")], [texte("Étape 3 juste à partir d'une valeur fausse de AC : points de méthode accordés")]],
      };
    case "heron":
      return {
        reponseFinale: reponseBreve(e),
        criteres: [
          { sousQuestion: "a", critere: [texte("Demi-périmètre")], points: 1 },
          { sousQuestion: "b", critere: [texte("Formule de Héron correctement appliquée")], points: 1.5 },
          { sousQuestion: "b", critere: [texte("Résultat avec l'unité d'aire")], points: 1.5 },
        ],
        erreursFrequentes: [
          { description: [texte("Périmètre utilisé au lieu du demi-périmètre")], cout: "0 pt sur l'étape 2" },
          { description: [texte("Racine carrée oubliée")], cout: "−1" },
          unite,
        ],
        reponsesAcceptees: [[texte("Aire obtenue autrement (un angle par Al-Kashi, puis la formule avec le sinus) : accepter")]],
      };
  }
}

/** Niveau : méthode 0 (formule de l'aire imposée par les données ; Héron imposé par la consigne),
 * 1 pour le quadrilatère (découpage par une diagonale, Pythagore ou Al-Kashi) ; piège seulement
 * dans les données — famille « angle » (un sinus, deux amplitudes ou une seule : le cas est la
 * question, toujours présent), angle B OBTUS du quadrilatère (cosinus négatif dans Al-Kashi) ;
 * nombres : 0 pour les valeurs exactes (angles remarquables, Héron entier), sinon calculatrice.
 * Aucun écran de lecture (les choix de formule sont des décisions). */
function criteresDifficulte(e: E): CriteresDifficulte {
  const piege = e.famille === "angle" || (e.famille === "quadrilatere" && e.angleB > 90) ? 1 : 0;
  return { ...etapesDuCorrige(correctionDetailleeAireTriangleSinus(e)), methode: e.famille === "quadrilatere" ? 1 : 0, piege, nombres: calculExact(e) ? 0 : 1 };
}

export const adaptateurEvaluationAireTriangleSinus: AdaptateurFeuilleExercices<ExerciceAireTriangleSinus> = {
  profilInstance: profilAireTriangleSinus,
  libelleCasParticulier: LIBELLE_CAS_AIRE_TRIANGLE,
  calculatriceIndispensable: ["quadrilatere"],
  titreDocument: "Aire d'un triangle quelconque — Évaluation",
  nomFichierBase: "aire-triangle-quelconque",
  genererInstance: genererExerciceAireTriangleSinus,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: construireAvecVariante,
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: correctionDetailleeAireTriangleSinus,
  bareme,
  enoncePapier,
};

