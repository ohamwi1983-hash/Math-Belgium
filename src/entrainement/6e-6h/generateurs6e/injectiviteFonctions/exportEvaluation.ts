import type { ExerciceInjectiviteFonctions } from "../../core6e/injectiviteFonctions.types";
import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CritereBareme, CriteresDifficulte, EnoncePapier, FragmentConsigne, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/corrigeTableau";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { formatEnsembleReelLatex } from "../../ui6e/formatEnsembleReel";
import {
  CONSIGNE_ECRAN_DOMAINE,
  CONSIGNE_ECRAN_IMAGE,
  CONSIGNE_ECRAN_INJECTIVE,
  CONSIGNE_ECRAN_RECIPROQUE,
  CONSIGNE_SOUS_QUESTION_INTERVALLE,
  formatFLatexAffichage,
  formatReciproqueLatex,
} from "../../ui6e/formatInjectiviteFonctions";
import { CATALOGUE_FAMILLES, construireAvecFamilleId, genererExerciceInjectiviteFonctions } from "./index";
import { correctionDetailleeInjectiviteFonctions as correction, lettresLectureInjectivite } from "./corrigeDetaille";
import { GROUPES_VERDICT_INJECTIVITE, profilInjectiviteFonctions } from "../profilsEvaluationCyclometriques";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceInjectiviteFonctions>` pour `6gen1` (fonctions
 * injectives, surjectives, bijectives ; réciproque) — feuille d'exercices et évaluation.
 *
 * `construireEnonce` : une question par ÉCRAN (domaine, injectivité, réciproque, image, bijection)
 * — ce sont les titres « Étape n — … » du corrigé détaillé. Papier (`enoncePapier`) : la fonction
 * et la consigne globale seulement. Corrigé détaillé partagé avec l'appli (`corrigeDetaille.ts`) ;
 * quand f n'est pas injective, la réciproque est écrite sur la moitié de droite (l'autre moitié est
 * signalée, elle est aussi acceptée).
 */

type E = ExerciceInjectiviteFonctions;

function entete(e: E): FragmentConsigne[] {
  return [texte("On considère la fonction "), latex(formatFLatexAffichage(e)), texte(".")];
}

function construireEnonce(e: E): SectionExercice {
  return {
    enteteFragments: entete(e),
    questions: [
      { consigne: CONSIGNE_ECRAN_DOMAINE },
      { consigne: e.injective ? CONSIGNE_ECRAN_INJECTIVE : [...CONSIGNE_ECRAN_INJECTIVE, texte(" "), ...CONSIGNE_SOUS_QUESTION_INTERVALLE] },
      { consigne: CONSIGNE_ECRAN_RECIPROQUE },
      { consigne: CONSIGNE_ECRAN_IMAGE },
      { consigne: [texte("Conclus : f est une bijection de quel ensemble sur quel ensemble ?")] },
    ],
  };
}

const CONSIGNE_PAPIER: FragmentConsigne[] = [
  texte(
    " Détermine son domaine. Est-elle injective ? Si ce n'est pas le cas, donne un plus grand intervalle sur lequel elle l'est. Détermine ensuite l'expression de sa réciproque sur cet intervalle, puis son image, et conclus : f est une bijection de quel ensemble sur quel ensemble ?",
  ),
];

function enoncePapier(e: E): EnoncePapier {
  return { section: { enteteFragments: [...entete(e), ...CONSIGNE_PAPIER], questions: [] } };
}

function reponseBreve(e: E): FragmentConsigne[] {
  const X = formatEnsembleReelLatex(e.intervalleDroite, 24);
  return [
    latex(`\\text{dom}(f)=${formatEnsembleReelLatex(e.domaine, 24)}`),
    texte(e.injective ? " ; f injective ; " : " ; f non injective, injective sur "),
    ...(e.injective ? [] : [latex(X), texte(" (ou "), latex(formatEnsembleReelLatex(e.intervalleGauche, 24)), texte(") ; ")]),
    latex(`f^{-1}(x)=${formatReciproqueLatex(e, "droite")}`),
    texte(" ; "),
    latex(`\\text{Im}(f)=${formatEnsembleReelLatex(e.image, 24)}`),
    texte(" ; f est une bijection de "),
    latex(X),
    texte(" sur "),
    latex(formatEnsembleReelLatex(e.image, 24)),
    texte("."),
  ];
}

function construireCorrection(e: E): BlocCorrection[] {
  return [{ type: "paragraphe", fragments: reponseBreve(e) }];
}

function bareme(e: E): BaremeExercice {
  const criteres: CritereBareme[] = [
    { sousQuestion: "a", critere: [texte("Domaine : "), latex(`\\text{dom}(f)=${formatEnsembleReelLatex(e.domaine, 24)}`)], points: 0.5 },
    {
      sousQuestion: "b",
      critere: e.injective ? [texte("Injectivité démontrée (f(x₁) = f(x₂) entraîne x₁ = x₂)")] : [texte("Contre-exemple (deux antécédents de même image) et plus grand intervalle d'injectivité")],
      points: 1,
    },
    { sousQuestion: "c", critere: [texte("Réciproque isolée ligne à ligne : "), latex(`f^{-1}(x)=${formatReciproqueLatex(e, "droite")}`)], points: 1.5 },
    { sousQuestion: "d", critere: [texte("Image : "), latex(`\\text{Im}(f)=${formatEnsembleReelLatex(e.image, 24)}`)], points: 0.5 },
    { sousQuestion: "e", critere: [texte("Bijection de l'intervalle d'injectivité sur l'image")], points: 0.5 },
  ];
  const erreursFrequentes: BaremeExercice["erreursFrequentes"] = [
    e.injective
      ? { description: [texte("Injectivité affirmée sans justification")], cout: "moitié des points sur b)" }
      : { description: [texte("Signe de la racine sans lien avec l'intervalle retenu")], cout: "−1" },
    { description: [texte("Ensemble d'arrivée ℝ au lieu de l'image")], cout: "0 pt sur e)" },
  ];
  return {
    reponseFinale: reponseBreve(e),
    criteres,
    erreursFrequentes,
    reponsesAcceptees: e.injective ? [[texte("Toute écriture équivalente de la réciproque")]] : [[texte("L'autre moitié, "), latex(formatEnsembleReelLatex(e.intervalleGauche, 24)), texte(", avec la réciproque "), latex(`f^{-1}(x)=${formatReciproqueLatex(e, "gauche")}`)]],
  };
}

/**
 * Niveau 1–7 — méthode 1 (choisir comment prouver l'injectivité, isoler y), piège dans les données :
 * fonction non injective (restriction et signe de la racine), coefficient négatif devant x dans une
 * inéquation de domaine (sens qui change). Lectures : domaine ℝ (a), image ℝ (d), bijection (e).
 */
function criteresDifficulte(e: E): CriteresDifficulte {
  const p = e.parametres;
  // Verdict « injective ? » (lot E de l'audit) : a) et c) le tirent, e) et f) forment avec eux le
  // groupe `groupe_injectivite`. Niveau et durée CONSTANTS pour ces quatre familles (niveau 4,
  // 11 min : quatre écrans qui transforment, la bijection lue, piège constant — l'injectivité est la
  // question), sinon un « niv. 2 » trahissait une fonction injective et un « niv. 4 » l'inverse.
  if (p.famille === "puissanceAffine" || p.famille === "puissanceMonome" || p.famille === "homographique" || p.famille === "quadratique") {
    return { etapesTransformation: 4, etapesLecture: 1, lettresSansCharge: ["e"], sansCharge: true, methode: 1, piege: 1, nombres: 0 };
  }
  const inequationNegative = (p.famille === "racinePlusConstante" || (p.famille === "racineNieme" && p.n % 2 === 0)) && p.a < 0;
  return { ...etapesDuCorrige(correction(e), lettresLectureInjectivite(e)), methode: 1, piege: !e.injective || inequationNegative ? 1 : 0, nombres: 0 };
}

export const adaptateurEvaluationInjectiviteFonctions: AdaptateurFeuilleExercices<E> = {
  profilInstance: profilInjectiviteFonctions,
  groupesVerdict: GROUPES_VERDICT_INJECTIVITE,
  titreDocument: "Fonctions injectives, surjectives, bijectives — Évaluation",
  nomFichierBase: "injectivite-fonctions",
  genererInstance: genererExerciceInjectiviteFonctions,
  catalogueVariantes: CATALOGUE_FAMILLES,
  genererInstanceAvecVariante: (id) => construireAvecFamilleId(id as Parameters<typeof construireAvecFamilleId>[0]),
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: (e) => correction(e),
  bareme,
  enoncePapier,
};
