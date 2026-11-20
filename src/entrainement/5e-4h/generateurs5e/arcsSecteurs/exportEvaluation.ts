import type { ExerciceArcSecteur, ExerciceModeDeuxVersTrois, QuantiteArcSecteur } from "../../core5e/arcsSecteurs.types";
import type {
  AdaptateurFeuilleExercices,
  BaremeExercice,
  BlocCorrection,
  CritereBareme,
  EnoncePapier,
  ErreurFrequente,
  CriteresDifficulte,
  FragmentConsigne,
  SectionExercice,
} from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { quantitesManquantes } from "../../moteur5e/typesArcsSecteurs";
import {
  consigneConversion,
  consigneQuantite,
  formatValeurQuantiteLatex,
  labelQuantite,
  latexEnonceConversion,
} from "../../ui5e/formatArcsSecteurs";
import { CATALOGUE_VARIANTES_ARC_SECTEUR, genererArcSecteurAvecVariante, genererExerciceArcSecteur } from "./index";
import { correctionDetailleeArcSecteur, etapeAvecThetaRadians, formuleDeLEtape, reponseConversionLatex, valeurAvecApprocheLatex } from "./corrigeDetaille";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { profilArcSecteur } from "../profilsEvaluationTrigonometrie";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceArcSecteur>` pour 5gen6 (Arcs et secteurs) —
 * feuille d'exercices et évaluation. `ExerciceArcSecteur` a 2 modes structurellement disjoints (voir
 * `core5e/arcsSecteurs.types.ts`) : "deuxVersTrois" (2 des 5 grandeurs θ°/θ_rad/r/s/A données, les
 * 3 autres à retrouver) et "conversion" (conversion degrés↔radians pure).
 *
 * `construireEnonce` garde UNE question par écran du générateur (une grandeur manquante, dans
 * l'ordre des dépendances `quantitesManquantes`) : ce sont les étapes du corrigé. L'énoncé imprimé
 * (`enoncePapier`) ne garde que les données et la consigne globale (`.claude/rules/
 * feuilles-evaluations.md`). Valeurs, formules et libellés : ceux de l'écran interactif
 * (`ui5e/formatArcsSecteurs.ts`), jamais recalculés ici.
 */

/** Nom en toutes lettres de chaque grandeur (consigne globale du papier). */
const NOMS: Record<QuantiteArcSecteur, string> = {
  thetaDeg: "l'angle θ en degrés",
  thetaRad: "l'angle θ en radians",
  r: "le rayon r",
  l: "la longueur s de l'arc",
  A: "l'aire A du secteur",
};

function listeEnFrancais(elements: string[]): string {
  if (elements.length <= 1) return elements.join("");
  return `${elements.slice(0, -1).join(", ")} et ${elements[elements.length - 1]}`;
}

function donneesLatex(exercice: ExerciceModeDeuxVersTrois): string {
  const [c0, c1] = exercice.connues;
  return `${labelQuantite(c0)} ${formatValeurQuantiteLatex(c0, exercice)} \\quad ${labelQuantite(c1)} ${formatValeurQuantiteLatex(c1, exercice)}`;
}

function construireEnonceArcSecteur(exercice: ExerciceArcSecteur): SectionExercice {
  if (exercice.mode === "conversion") {
    return {
      enteteFragments: [latex(latexEnonceConversion(exercice))],
      questions: [{ consigne: [texte(consigneConversion(exercice))] }],
    };
  }
  return {
    enteteFragments: [texte("Pour un secteur circulaire, on donne "), latex(donneesLatex(exercice)), texte(".")],
    questions: quantitesManquantes(exercice).map((q) => ({ consigne: [texte(consigneQuantite(q))] })),
  };
}

function construireCorrectionArcSecteur(exercice: ExerciceArcSecteur): BlocCorrection[] {
  if (exercice.mode === "conversion") {
    return [{ type: "paragraphe", fragments: [latex(reponseConversionLatex(exercice))] }];
  }
  return quantitesManquantes(exercice).map((q) => ({ type: "paragraphe", fragments: [latex(valeurAvecApprocheLatex(q, exercice))] }));
}

// ============================================================================
// Feuilles enrichies (énoncé papier, difficulté, réponse brève, corrigé détaillé, barème).
// ============================================================================

function enoncePapierArcSecteur(exercice: ExerciceArcSecteur): EnoncePapier {
  if (exercice.mode === "conversion") {
    const cible = exercice.direction === "degVersRad" ? "en radians" : "en degrés";
    return {
      section: {
        enteteFragments: [
          texte(`Convertis ${cible} la mesure d'angle `),
          // Valeur de départ seule (sans le libellé « θ (degrés) = » de l'écran).
          latex(`\\theta = ${latexEnonceConversion(exercice).replace(/^.*?= /, "")}`),
          texte(exercice.direction === "degVersRad" ? "." : " (en radians)."),
          texte(exercice.type === "exacte" ? " Donne la valeur exacte." : " Arrondis au centième."),
        ],
        questions: [],
      },
    };
  }
  const manquantes = quantitesManquantes(exercice);
  return {
    section: {
      enteteFragments: [
        texte("Pour un secteur circulaire d'angle au centre θ et de rayon r, on donne "),
        latex(donneesLatex(exercice)),
        texte(`. Détermine ${listeEnFrancais(manquantes.map((q) => NOMS[q]))}. Donne les valeurs exactes, ou arrondies au centième.`),
      ],
      questions: [],
    },
  };
}

/** « θ (radians) ≈ 2,15 » pour une conversion décimale (jamais « = » devant une valeur arrondie). */
function reponseBreveArcSecteur(exercice: ExerciceArcSecteur): FragmentConsigne[] {
  if (exercice.mode === "conversion") return [latex(reponseConversionLatex(exercice))];
  return quantitesManquantes(exercice).flatMap((q, i) => [...(i > 0 ? [texte(" ; ")] : []), latex(`{${valeurAvecApprocheLatex(q, exercice)}}`)]);
}

const LETTRES = "abcdefghijklmnopqrstuvwxyz";

/** Critères du niveau (grille commune, `export/niveauDifficulte.ts`), jugés sur l'énoncé PAPIER :
 * - conversion : un écran, méthode imposée, aucun piège dans les données ; nombres = 1 pour une
 *   conversion décimale (calculatrice, profil), 0 pour une valeur exacte ;
 * - deux grandeurs → trois : trois écrans de calcul (aucun écran de lecture), méthode 1 (choisir
 *   l'ordre et la formule du cours qui s'applique), piège 0 (convertir θ en radians est la méthode,
 *   pas un piège des données), nombres 0 (valeurs exactes en π demandées ou acceptées). */
function criteresDifficulteArcSecteur(exercice: ExerciceArcSecteur): CriteresDifficulte {
  const etapes = etapesDuCorrige(correctionDetailleeArcSecteur(exercice));
  if (exercice.mode === "conversion") return { ...etapes, methode: 0, piege: 0, nombres: exercice.type === "decimale" ? 1 : 0 };
  return { ...etapes, methode: 1, piege: 0, nombres: 0 };
}

function baremeArcSecteur(exercice: ExerciceArcSecteur): BaremeExercice {
  if (exercice.mode === "conversion") {
    return {
      reponseFinale: reponseBreveArcSecteur(exercice),
      criteres: [
        { critere: [texte("Facteur de conversion correct ("), latex(exercice.direction === "degVersRad" ? "\\times\\dfrac{\\pi}{180}" : "\\times\\dfrac{180}{\\pi}"), texte(")")], points: 2 },
        { critere: [texte("Valeur exacte ou arrondie au centième")], points: 2 },
      ],
      erreursFrequentes: [{ description: [texte("Facteur inversé (π/180 et 180/π confondus)")], cout: "0 pt" }],
      reponsesAcceptees: [[texte("Valeur exacte (multiple de π) ou arrondie au centième")]],
    };
  }
  const manquantes = quantitesManquantes(exercice);
  const criteres: CritereBareme[] = manquantes.flatMap((q, i): CritereBareme[] => [
    { sousQuestion: LETTRES[i], critere: [texte("Formule adaptée : "), latex(formuleDeLEtape(exercice, q).latexGeneral)], points: 0.5 },
    { sousQuestion: LETTRES[i], critere: [latex(valeurAvecApprocheLatex(q, exercice))], points: i === 0 ? 1 : 0.75 },
  ]);
  // « θ en radians dans s = rθ et A = ½r²θ » n'est pas un critère à part (0,25 pt, arrondi à 0 au
  // demi-point) : c'est l'erreur fréquente « θ en degrés » ci-dessous, qui coûte la valeur de l'étape.
  const erreurs: ErreurFrequente[] = [];
  const etapePiege = etapeAvecThetaRadians(exercice);
  if (etapePiege !== null) erreurs.push({ description: [texte("θ en degrés dans "), latex("s = r\\theta"), texte(" ou "), latex("A = \\dfrac{1}{2}r^2\\theta")], cout: `0 pt sur la valeur en ${LETTRES[etapePiege]})` });
  const iA = manquantes.indexOf("A");
  if (iA >= 0) erreurs.push({ description: [texte("Facteur ½ oublié dans l'aire du secteur")], cout: `0 pt sur la valeur en ${LETTRES[iA]})` });
  const iR = manquantes.indexOf("r");
  if (iR >= 0 && formuleDeLEtape(exercice, "r").requiert.includes("A") && formuleDeLEtape(exercice, "r").requiert.includes("thetaRad")) {
    erreurs.push({ description: [texte("Racine carrée oubliée en isolant r dans "), latex("A = \\dfrac{1}{2}r^2\\theta")], cout: `0 pt sur la valeur en ${LETTRES[iR]})` });
  }
  if (manquantes.includes("thetaDeg") || manquantes.includes("thetaRad")) erreurs.push({ description: [texte("Conversion inversée (π/180 et 180/π confondus)")], cout: "−0,5" });
  return {
    reponseFinale: reponseBreveArcSecteur(exercice),
    criteres,
    erreursFrequentes: erreurs,
    reponsesAcceptees: [[texte("Valeurs exactes (multiples de π) ou arrondies au centième")], [texte("Un résultat obtenu à partir d'une valeur déjà arrondie, s'il ne s'écarte que de l'arrondi propagé")]],
  };
}

export const adaptateurEvaluationArcSecteur: AdaptateurFeuilleExercices<ExerciceArcSecteur> = {
  profilInstance: profilArcSecteur,
  titreDocument: "Arcs et secteurs — Évaluation",
  nomFichierBase: "arcs-secteurs",
  genererInstance: genererExerciceArcSecteur,
  catalogueVariantes: CATALOGUE_VARIANTES_ARC_SECTEUR,
  genererInstanceAvecVariante: genererArcSecteurAvecVariante,
  construireEnonce: construireEnonceArcSecteur,
  construireCorrection: construireCorrectionArcSecteur,
  criteresDifficulte: criteresDifficulteArcSecteur,
  reponseBreve: reponseBreveArcSecteur,
  correctionDetaillee: correctionDetailleeArcSecteur,
  bareme: baremeArcSecteur,
  enoncePapier: enoncePapierArcSecteur,
};
