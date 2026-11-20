import type { ExerciceLimiteExponentielle } from "../../core6e/limitesExponentielles.types";
import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CritereBareme, CriteresDifficulte, EnoncePapier, FragmentConsigne, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/corrigeTableau";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { CONSIGNE_GENERALE, approcheLimiteLatex, consigneEcran, formatCibleTexte, formatLimiteEnonceLatex, formatLimiteExacteLatex, formatLimiteFinaleLatex } from "../../ui6e/formatLimitesExponentielles";
import { CATALOGUE_FAMILLES, construireAvecFamilleId, genererExerciceLimiteExponentielle } from "./index";
import { correctionDetailleeLimitesExponentielles as correction, sequenceLimitesExponentielles } from "./corrigeDetaille";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceLimiteExponentielle>` pour `6gen6` (Calcul de
 * limites, fonctions exponentielles) — feuille d'exercices et évaluation.
 *
 * `construireEnonce` : une question par ÉCRAN du générateur (consignes de l'écran, `consigneEcran`)
 * — ce sont les titres « Étape n — … » du corrigé. Sur papier (`enoncePapier`), l'énoncé est la
 * limite et la consigne globale seulement ; les étapes passent dans le corrigé détaillé « comme au
 * tableau » (`corrigeDetaille.ts`, partagé avec l'appli). Valeurs exactes de l'écran
 * (`formatLimiteFinaleLatex`), jamais un flottant brut.
 */

function construireEnonceLimitesExponentielles(exercice: ExerciceLimiteExponentielle): SectionExercice {
  return {
    enteteFragments: [texte(`${CONSIGNE_GENERALE} `), latex(formatLimiteEnonceLatex(exercice))],
    questions: sequenceLimitesExponentielles(exercice).map((phase) => ({ consigne: consigneEcran(phase, exercice) })),
  };
}

function reponseBreve(exercice: ExerciceLimiteExponentielle): FragmentConsigne[] {
  return [latex(`${formatLimiteEnonceLatex(exercice)}=${formatLimiteFinaleLatex(exercice)}`)];
}

function construireCorrectionLimitesExponentielles(exercice: ExerciceLimiteExponentielle): BlocCorrection[] {
  return [{ type: "paragraphe", fragments: [texte("Résultat : "), ...reponseBreve(exercice)] }];
}

/** Énoncé PAPIER : la limite et la consigne globale (« Calcule la limite suivante »), justifications
 * attendues ; les écrans du générateur sont les étapes du corrigé. */
function enoncePapier(exercice: ExerciceLimiteExponentielle): EnoncePapier {
  return {
    section: { enteteFragments: [texte(`${CONSIGNE_GENERALE} `), latex(formatLimiteEnonceLatex(exercice)), texte(" Justifie chaque étape.")], questions: [] },
  };
}


/** Grille de correction (somme 4 points), critères rattachés aux étapes (écrans). */
function bareme(e: ExerciceLimiteExponentielle): BaremeExercice {
  const finale = [latex(formatLimiteFinaleLatex(e))];
  const lim: FragmentConsigne[] = [texte("Limite : "), ...finale];
  let criteres: CritereBareme[];
  let erreursFrequentes: BaremeExercice["erreursFrequentes"];
  switch (e.famille) {
    case "A":
      criteres = [
        { sousQuestion: "a", critere: [texte("Limite de l'exposant : "), latex(formatCibleTexte(e.limiteExposant))], points: 1 },
        { sousQuestion: "b", critere: [texte("Règle de la base appliquée ("), latex("a>1"), texte(" ou "), latex("0<a<1"), texte(")")], points: 1 },
        { sousQuestion: "b", critere: lim, points: 2 },
      ];
      erreursFrequentes = [
        { description: [texte("Conclure "), latex("-\\infty"), texte(" au lieu de 0 (une exponentielle reste positive)")], cout: "0 pt sur l'étape 2" },
        { description: [texte("Sens non inversé pour une base comprise entre 0 et 1")], cout: "0 pt sur l'étape 2" },
      ];
      break;
    case "B":
      criteres = [
        { sousQuestion: "a", critere: [texte("Terme exponentiel : "), latex(formatCibleTexte(e.limiteExponentielle))], points: 1 },
        { sousQuestion: "b", critere: [texte("Terme polynomial : "), latex(formatCibleTexte(e.limitePolynomiale))], points: 1 },
        { sousQuestion: "c", critere: [texte(e.baseSuperieureA1 && e.limitePolynomiale.type === "moins_infini" ? "Forme +∞ − ∞ levée par les croissances comparées" : "Somme des limites justifiée")], points: 1 },
        { sousQuestion: "c", critere: lim, points: 1 },
      ];
      erreursFrequentes = [{ description: [texte("Conclure « forme indéterminée » ou suivre le terme polynomial alors que l'exponentielle l'emporte")], cout: "0 pt sur l'étape 3" }];
      break;
    case "C":
      criteres = e.quotient
        ? [
            { sousQuestion: "a", critere: [texte("Limites du numérateur et du dénominateur : "), latex("+\\infty"), texte(" et "), latex("+\\infty")], points: 1 },
            { sousQuestion: "b", critere: [texte("Forme "), latex("\\dfrac{\\infty}{\\infty}"), texte(" reconnue, croissances comparées")], points: 2 },
            { sousQuestion: "b", critere: lim, points: 1 },
          ]
        : [
            { sousQuestion: "a", critere: [texte("Limites des facteurs : "), latex("+\\infty"), texte(" et 0")], points: 1 },
            { sousQuestion: "b", critere: [texte("Produit écrit en quotient, croissances comparées")], points: 2 },
            { sousQuestion: "b", critere: lim, points: 1 },
          ];
      erreursFrequentes = e.quotient ? [{ description: [texte("Conclure 1 sans lever la forme "), latex("\\dfrac{\\infty}{\\infty}")], cout: "−1" }] : [{ description: [texte("Conclure 0 sans lever la forme "), latex("\\infty\\cdot 0")], cout: "−1" }];
      break;
    case "K":
      criteres = [
        { sousQuestion: "a", critere: [texte("Forme "), latex("\\dfrac{0}{0}"), texte(" vérifiée")], points: 0.5 },
        { sousQuestion: "b", critere: [texte("Dérivée du numérateur")], points: 0.5 },
        { sousQuestion: "c", critere: [texte("Dérivée du dénominateur")], points: 0.5 },
        { sousQuestion: "d", critere: [texte("Forme persistante reconnue, dérivée seconde du numérateur")], points: 0.75 },
        { sousQuestion: "e", critere: [texte("Dérivée seconde du dénominateur")], points: 0.75 },
        { sousQuestion: "f", critere: lim, points: 1 },
      ];
      erreursFrequentes = [{ description: [texte("Conclure après une seule application alors que la forme persiste")], cout: "0 pt sur les étapes 4 et 5" }];
      break;
    case "H":
    case "I":
    case "J":
      criteres = [
        { sousQuestion: "a", critere: [texte("Forme "), latex("\\dfrac{0}{0}"), texte(" vérifiée avant la règle de L'Hôpital")], points: 1 },
        { sousQuestion: "b", critere: [texte("Dérivée du numérateur (règle de la chaîne)")], points: 1 },
        { sousQuestion: "c", critere: [texte("Dérivée du dénominateur")], points: 1 },
        { sousQuestion: "d", critere: lim, points: 1 },
      ];
      erreursFrequentes = [{ description: [texte("Facteur "), latex("\\ln(a)"), texte(" oublié en dérivant "), latex("a^{u}")], cout: "−1" }];
      break;
    case "L":
      criteres = [
        { sousQuestion: "a", critere: [texte("Changement de variable et forme du pivot")], points: 2 },
        { sousQuestion: "b", critere: lim, points: 2 },
      ];
      erreursFrequentes = [{ description: [texte("Conclure "), latex("1^{\\infty}=1")], cout: "0 pt" }];
      break;
    case "N":
      criteres = [
        { sousQuestion: "a", critere: [texte("Une seule puissance : exposants multipliés")], points: 2 },
        { sousQuestion: "b", critere: lim, points: 2 },
      ];
      erreursFrequentes = [{ description: [texte("Conclure que la forme vaut 1")], cout: "0 pt" }];
      break;
  }
  const exacte = formatLimiteExacteLatex(e);
  const reponsesAcceptees: FragmentConsigne[][] = [];
  if (exacte !== null && "limiteFinale" in e && /\\ln|e\^/.test(exacte)) reponsesAcceptees.push([texte("Valeur approchée "), latex(approcheLimiteLatex(e.limiteFinale)), texte(" si la démarche est complète")]);
  return { reponseFinale: finale, criteres, erreursFrequentes, ...(reponsesAcceptees.length ? { reponsesAcceptees } : {}) };
}

/**
 * Niveau 1–7 (grille commune) — méthode et piège jugés sur l'énoncé papier (« Calcule la limite ») :
 * A directe (méthode 0, piège : base entre 0 et 1, ou x → 0⁻ sous une puissance impaire) ; B somme
 * (méthode 1, piège : forme +∞ − ∞ d'apparence « −∞ ») ; C produit ou quotient (méthode 1) ; H, I, J L'Hôpital
 * (méthode 1) ; K (piège : la forme persiste après une application) ; L 1^∞ et N ∞⁰/0⁰ (piège : la
 * forme n'est pas 1). Nombres : ln(a) ou e^{km} non remarquables (H, I, J, K, L). Aucun écran de
 * pure lecture.
 */
function criteresDifficulte(e: ExerciceLimiteExponentielle): CriteresDifficulte {
  let methode: 0 | 1 | 2 = 1;
  let piege: 0 | 1 = 0;
  let nombres: 0 | 1 = 0;
  switch (e.famille) {
    case "A":
      methode = 0;
      piege = e.sousCas === "puissance" ? (e.baseSuperieureA1 ? 0 : 1) : e.s % 2 === 1 && e.directionZero === "zero_moins" ? 1 : 0;
      break;
    case "B":
      piege = e.baseSuperieureA1 && e.limitePolynomiale.type === "moins_infini" ? 1 : 0;
      break;
    case "H":
    case "I":
    case "J":
      nombres = 1;
      break;
    case "K":
      piege = 1;
      nombres = 1;
      break;
    case "L":
      piege = 1;
      nombres = 1;
      break;
    case "N":
      piege = 1;
      break;
  }
  return { ...etapesDuCorrige(correction(e)), methode, piege, nombres };
}

export const adaptateurEvaluationLimitesExponentielles: AdaptateurFeuilleExercices<ExerciceLimiteExponentielle> = {
  titreDocument: "Calcul de limites (fonctions exponentielles) — Évaluation",
  nomFichierBase: "limites-exponentielles",
  genererInstance: genererExerciceLimiteExponentielle,
  catalogueVariantes: CATALOGUE_FAMILLES,
  genererInstanceAvecVariante: (id) => construireAvecFamilleId(id as Parameters<typeof construireAvecFamilleId>[0]),
  construireEnonce: construireEnonceLimitesExponentielles,
  construireCorrection: construireCorrectionLimitesExponentielles,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: correction,
  bareme,
  enoncePapier,
};
