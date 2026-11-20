import type { ExerciceDomaineDeriveeExponentielle } from "../../core6e/domaineDeriveeExponentielles.types";
import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CritereBareme, CriteresDifficulte, EnoncePapier, FragmentConsigne, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/corrigeTableau";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { formatEnsembleReelLatex } from "../../ui6e/formatEnsembleReel";
import { CONSIGNE_GENERALE, consigneEcran, formatFonctionLatex } from "../../ui6e/formatDomaineDeriveeExponentielles";
import { CATALOGUE_FAMILLES, construireAvecFamilleId, genererExerciceDomaineDeriveeExponentielle } from "./index";
import { correctionDetailleeDomaineDeriveeExponentielles as correction, deriveeFinaleLatex, sequenceDomaineDeriveeExponentielles } from "./corrigeDetaille";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceDomaineDeriveeExponentielle>` pour `6gen7`
 * (Domaine et dérivée de fonctions exponentielles) — feuille d'exercices et évaluation.
 *
 * `construireEnonce` : une question par ÉCRAN (consignes de l'écran) — titres « Étape n — … » du
 * corrigé. Papier (`enoncePapier`) : la fonction et la consigne globale seulement (« Détermine le
 * domaine puis calcule la dérivée »). Corrigé détaillé « comme au tableau » partagé avec l'appli
 * (`corrigeDetaille.ts`) ; la dérivée attendue est sa forme finale (`deriveeFinaleLatex`).
 */

function construireEnonceDomaineDeriveeExponentielles(exercice: ExerciceDomaineDeriveeExponentielle): SectionExercice {
  return {
    enteteFragments: [texte(`${CONSIGNE_GENERALE} `), latex(formatFonctionLatex(exercice))],
    questions: sequenceDomaineDeriveeExponentielles(exercice).map((phase) => ({ consigne: consigneEcran(phase, exercice) })),
  };
}

function reponseBreve(exercice: ExerciceDomaineDeriveeExponentielle): FragmentConsigne[] {
  return [latex(`\\mathrm{dom}\\,f=${formatEnsembleReelLatex(exercice.domaine)}`), texte(" ; "), latex(`f'(x)=${deriveeFinaleLatex(exercice)}`)];
}

function construireCorrectionDomaineDeriveeExponentielles(exercice: ExerciceDomaineDeriveeExponentielle): BlocCorrection[] {
  return [{ type: "paragraphe", fragments: reponseBreve(exercice) }];
}

function enoncePapier(exercice: ExerciceDomaineDeriveeExponentielle): EnoncePapier {
  return { section: { enteteFragments: [texte(`${CONSIGNE_GENERALE} `), latex(formatFonctionLatex(exercice))], questions: [] } };
}


/** Grille de correction (somme 4 points), critères rattachés aux étapes (écrans). */
function bareme(e: ExerciceDomaineDeriveeExponentielle): BaremeExercice {
  const dom = [texte("Domaine : "), latex(`\\mathrm{dom}\\,f=${formatEnsembleReelLatex(e.domaine)}`)];
  const fp = [texte("Dérivée : "), latex(`f'(x)=${deriveeFinaleLatex(e)}`)];
  let criteres: CritereBareme[];
  if (e.famille === "C" || e.famille === "D") {
    criteres = [
      { sousQuestion: "a", critere: dom, points: 1 },
      { sousQuestion: "b", critere: [texte(e.famille === "C" ? "Dérivées des deux facteurs u′ et v′" : "Dérivées N′ et D′")], points: 1 },
      { sousQuestion: "c", critere: [texte(e.famille === "C" ? "Règle du produit u′v + uv′ appliquée" : "Règle du quotient (N′D − ND′)/D² appliquée")], points: 1 },
      { sousQuestion: "c", critere: fp, points: 1 },
    ];
  } else if (e.famille === "E") {
    criteres = [
      { sousQuestion: "a", critere: dom, points: 1 },
      { sousQuestion: "b", critere: [texte("Forme simplifiée avant de dériver")], points: 1 },
      { sousQuestion: "c", critere: fp, points: 2 },
    ];
  } else {
    criteres = [
      { sousQuestion: "a", critere: dom, points: 1 },
      { sousQuestion: "b", critere: [texte("Règle de la chaîne : dérivée de l'exposant (ou de la fonction intérieure)")], points: 1.5 },
      { sousQuestion: "b", critere: fp, points: 1.5 },
    ];
  }
  const erreursFrequentes: BaremeExercice["erreursFrequentes"] = [
    { description: [texte("Facteur "), latex("\\ln(a)"), texte(" oublié (base différente de e)")], cout: "−1" },
    { description: [texte("Dérivée de l'exposant oubliée (règle de la chaîne)")], cout: "−1" },
    ...(e.domaine.forme === "reel" ? [] : [{ description: [texte("Domaine ℝ donné par réflexe, sans la condition de la racine, du dénominateur ou de arccos")], cout: "0 pt sur l'étape 1" }]),
  ];
  return { reponseFinale: reponseBreve(e), criteres, erreursFrequentes, reponsesAcceptees: [[texte("Toute forme équivalente de f′(x), non développée ou factorisée autrement")]] };
}

/**
 * Niveau 1–7 — méthode et piège jugés sur l'énoncé papier : méthode 0 (règle imposée par la forme de
 * f), 1 pour E (simplifier avant de dériver : choix de l'élève). Piège dans les données : racine
 * cachée dans l'exposant (C, sous-type e) et condition automatique de arccos (F). Écran de pure
 * lecture : le domaine quand il vaut ℝ (aucune condition à résoudre). Nombres : un facteur ln(a),
 * a ≠ e, dans la dérivée.
 */
function criteresDifficulte(e: ExerciceDomaineDeriveeExponentielle): CriteresDifficulte {
  const lecture = e.domaine.forme === "reel" ? ["a"] : [];
  const methode: 0 | 1 = e.famille === "E" ? 1 : 0;
  const piege: 0 | 1 = (e.famille === "C" && e.sousType === "e") || (e.famille === "F" && e.trig === "arccos") ? 1 : 0;
  const nombres: 0 | 1 = /\\ln/.test(deriveeFinaleLatex(e)) ? 1 : 0;
  return { ...etapesDuCorrige(correction(e), lecture), methode, piege, nombres };
}

export const adaptateurEvaluationDomaineDeriveeExponentielles: AdaptateurFeuilleExercices<ExerciceDomaineDeriveeExponentielle> = {
  titreDocument: "Domaine et dérivée (fonctions exponentielles) — Évaluation",
  nomFichierBase: "domaine-derivee-exponentielles",
  genererInstance: genererExerciceDomaineDeriveeExponentielle,
  catalogueVariantes: CATALOGUE_FAMILLES,
  genererInstanceAvecVariante: (id) => construireAvecFamilleId(id as Parameters<typeof construireAvecFamilleId>[0]),
  construireEnonce: construireEnonceDomaineDeriveeExponentielles,
  construireCorrection: construireCorrectionDomaineDeriveeExponentielles,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: correction,
  bareme,
  enoncePapier,
};
