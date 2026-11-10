import type { ExerciceArcSecteur, ExerciceModeConversion, ExerciceModeDeuxVersTrois, QuantiteArcSecteur } from "../../core5e/arcsSecteurs.types";
import type {
  AdaptateurFeuilleExercices,
  BaremeExercice,
  BlocCorrection,
  CritereBareme,
  EnoncePapier,
  ErreurFrequente,
  EtapeCorrection,
  FragmentConsigne,
  SectionExercice,
} from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { quantitesManquantes } from "../../moteur5e/typesArcsSecteurs";
import {
  consigneConversion,
  consigneQuantite,
  formatValeurCibleConversionLatex,
  formatValeurQuantiteLatex,
  formulesDisponibles,
  LABELS_LATEX,
  labelQuantite,
  latexAideConversionNiveau2,
  latexEnonceConversion,
  quantitesConnuesJusqua,
} from "../../ui5e/formatArcsSecteurs";
import { CATALOGUE_VARIANTES_ARC_SECTEUR, genererArcSecteurAvecVariante, genererExerciceArcSecteur } from "./index";
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

/** Valeur numérique d'une grandeur (pour l'arrondi au centième de la réponse brève). */
function valeurNumerique(q: QuantiteArcSecteur, exercice: ExerciceModeDeuxVersTrois): number {
  return exercice.valeurs[q];
}

/** « ≈ 2,62 » — arrondi au centième, virgule décimale. Vide pour une valeur entière (θ°, r). */
function approcheLatex(x: number): string {
  if (Number.isInteger(x)) return "";
  return ` \\approx ${(Math.round(x * 100) / 100).toString().replace(".", "{,}")}`;
}

function valeurAvecApprocheLatex(q: QuantiteArcSecteur, exercice: ExerciceModeDeuxVersTrois): string {
  return `${LABELS_LATEX[q]} = ${formatValeurQuantiteLatex(q, exercice)}${approcheLatex(valeurNumerique(q, exercice))}`;
}

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
    return [{ type: "paragraphe", fragments: [latex(`${exercice.direction === "degVersRad" ? LABELS_LATEX.thetaRad : LABELS_LATEX.thetaDeg} = ${formatValeurCibleConversionLatex(exercice)}`)] }];
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

/** ★ conversion ; ★★ deux grandeurs → trois, formules directes ; ★★★ dès qu'il faut une racine
 * (r à partir de A et θ) ou r à partir de s et A (deux formules à combiner). */
function difficulteArcSecteur(exercice: ExerciceArcSecteur): 1 | 2 | 3 {
  if (exercice.mode === "conversion") return 1;
  const c = exercice.connues;
  const rDepuisAire = !c.includes("r") && c.includes("A") && (c.includes("thetaDeg") || c.includes("thetaRad"));
  const rDepuisSA = c.includes("l") && c.includes("A");
  return rDepuisAire || rDepuisSA ? 3 : 2;
}

function reponseBreveArcSecteur(exercice: ExerciceArcSecteur): FragmentConsigne[] {
  if (exercice.mode === "conversion") {
    return [latex(`${exercice.direction === "degVersRad" ? LABELS_LATEX.thetaRad : LABELS_LATEX.thetaDeg} = ${formatValeurCibleConversionLatex(exercice)}`)];
  }
  return quantitesManquantes(exercice).flatMap((q, i) => [...(i > 0 ? [texte(" ; ")] : []), latex(valeurAvecApprocheLatex(q, exercice))]);
}

const LETTRES = "abcdefghijklmnopqrstuvwxyz";

/** Formule réellement utilisée à l'étape de `q` : la première applicable avec ce qui est connu à cet
 * écran — la même que celle que substitue l'aide de niveau 2 de l'appli. */
function formuleDeLEtape(exercice: ExerciceModeDeuxVersTrois, q: QuantiteArcSecteur) {
  const connues = quantitesConnuesJusqua(exercice, q);
  return formulesDisponibles(q, connues)[0];
}

/** Étape où l'on utilise θ en radians dans s = rθ, A = ½r²θ (ou leurs réciproques) — c'est là que
 * se place le piège « θ en degrés ». `null` si aucune étape ne le fait. */
function etapeAvecThetaRadians(exercice: ExerciceModeDeuxVersTrois): number | null {
  const manquantes = quantitesManquantes(exercice);
  const i = manquantes.findIndex((q) => q !== "thetaDeg" && q !== "thetaRad" && formuleDeLEtape(exercice, q).requiert.includes("thetaRad"));
  return i >= 0 ? i : null;
}

function correctionConversion(exercice: ExerciceModeConversion): EtapeCorrection[] {
  const versRad = exercice.direction === "degVersRad";
  return [
    { label: "Méthode", fragments: [texte(versRad ? "Pour passer des degrés aux radians, on multiplie par " : "Pour passer des radians aux degrés, on multiplie par "), latex(versRad ? "\\dfrac{\\pi}{180}" : "\\dfrac{180}{\\pi}"), texte(".")] },
    { label: "Calcul", fragments: [latex(`${latexAideConversionNiveau2(exercice)} = ${formatValeurCibleConversionLatex(exercice)}`)] },
    { label: "Piège", fragments: [texte("Ne pas inverser les deux facteurs : un angle en degrés est un « grand » nombre (360° pour un tour), le même angle en radians est petit (2π ≈ 6,28 pour un tour).")] },
  ];
}

function correctionDetailleeArcSecteur(exercice: ExerciceArcSecteur): EtapeCorrection[] {
  if (exercice.mode === "conversion") return correctionConversion(exercice);
  const manquantes = quantitesManquantes(exercice);
  const etapePiege = etapeAvecThetaRadians(exercice);
  return manquantes.flatMap((q, i): EtapeCorrection[] => {
    const sousQuestion = LETTRES[i];
    const formule = formuleDeLEtape(exercice, q);
    const lignes: EtapeCorrection[] = [
      { label: "Formule", sousQuestion, fragments: [latex(formule.latexGeneral)] },
      { label: "Calcul", sousQuestion, fragments: [latex(`${formule.latexSubstitue(exercice)} = ${formatValeurQuantiteLatex(q, exercice)}`)] },
      { label: "Conclusion", sousQuestion, fragments: [latex(valeurAvecApprocheLatex(q, exercice))] },
    ];
    if (etapePiege === i) {
      lignes.push({ label: "Piège", sousQuestion, fragments: [texte("Dans "), latex("s = r\\theta"), texte(" et "), latex("A = \\dfrac{1}{2}r^2\\theta"), texte(", l'angle θ est TOUJOURS en radians, jamais en degrés.")] });
    } else if (etapePiege === null && q === "thetaDeg") {
      lignes.push({ label: "Piège", sousQuestion, fragments: [texte("Pour revenir aux degrés, on multiplie par "), latex("\\dfrac{180}{\\pi}"), texte(", pas par "), latex("\\dfrac{\\pi}{180}"), texte(".")] });
    }
    return lignes;
  });
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
  difficulte: difficulteArcSecteur,
  reponseBreve: reponseBreveArcSecteur,
  correctionDetaillee: correctionDetailleeArcSecteur,
  bareme: baremeArcSecteur,
  enoncePapier: enoncePapierArcSecteur,
  dureeMinutes: 6,
};
