import type { ExerciceTangente } from "../../core5e/tangentes.types";
import type {
  AdaptateurFeuilleExercices,
  BaremeExercice,
  BlocCorrection,
  CritereBareme,
  CriteresDifficulte,
  EnoncePapier,
  FragmentConsigne,
  SectionExercice,
} from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { consigneGenerale, formatFDeXLatex, formatReponseAttenduePhaseLatex } from "../../ui5e/formatTangentes";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { correctionDetailleeTangente } from "./corrigeDetaille";
import { ordreEcransTangente, type EcranTangente } from "../../moteur5e/typesTangentes";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceTangente } from "./index";
import { LIBELLE_CAS_TANGENTES, profilTangente } from "../profilsEvaluationDerivees28-30";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceTangente>` pour 5gen28 (Tangentes) — feuille
 * d'exercices et évaluation (méthode : `.claude/rules/feuilles-evaluations.md`).
 *
 * Énoncé papier = la fonction f et la consigne globale de la variante (`consigneGenerale`, la même
 * qu'à l'écran ; double tangence : « montre que t est aussi tangente en un second point »). f'(x)
 * n'est PAS imprimée : sur papier, la dérivée fait partie du travail (l'écran la donne parce que la
 * compétence propre au générateur est la tangente ; le chapitre enseigne la dérivation en § 3).
 * Les écrans du générateur (`ordreEcransTangente`) deviennent les étapes du corrigé, précédés pour
 * les variantes A et B d'une étape « dérivée » (absente de l'écran, où f' est fournie).
 *
 * Valeurs : `formatReponseAttenduePhaseLatex`, `formatFPrimeDeXLatex`, `texteAideNiveau1`
 * (`ui5e/formatTangentes.ts`) — jamais recalculées ici.
 */

const LETTRES = "abcdefgh";

/** Étapes du corrigé : « dérivée » (papier seulement, A et B) puis les écrans du générateur. */
type EtapeTangente = "deriver" | EcranTangente;

function etapesTangente(exercice: ExerciceTangente): EtapeTangente[] {
  const ecrans = ordreEcransTangente(exercice);
  return exercice.variante === "doubleTangence" ? ecrans : ["deriver", ...ecrans];
}

function lettre(exercice: ExerciceTangente, etape: EtapeTangente): string {
  return LETTRES[etapesTangente(exercice).indexOf(etape)] ?? "a";
}

/** Nombre en texte brut avec le « − » typographique. */
function nombre(n: number): string {
  return n < 0 ? `−${Math.abs(n)}` : `${n}`;
}

function consigneEtape(exercice: ExerciceTangente, etape: EtapeTangente): FragmentConsigne[] {
  switch (etape) {
    case "deriver":
      return [texte("Calcule la dérivée "), latex("f'(x)"), texte(".")];
    case "substituer": {
      const a = exercice.variante === "pointDonne" ? exercice.a : 0;
      return [texte("Calcule "), latex(`f(${a})`), texte(" et "), latex(`f'(${a})`), texte(".")];
    }
    case "tangente":
      return [texte("Écris l'équation de la tangente à l'aide de la formule du cours.")];
    case "resoudre":
      return [texte("Résous "), latex("f'(x)=0"), texte(".")];
    case "coordonnees":
      return [texte("Pour chaque solution, calcule l'ordonnée "), latex("y=f(x)"), texte(" et donne le point de tangence.")];
    case "tangenteEnP": {
      const p = exercice.variante === "doubleTangence" ? exercice.p : 0;
      return [texte("Dérive f, calcule "), latex(`f'(${p})`), texte(` puis écris l'équation de la tangente t au point d'abscisse x = ${nombre(p)}.`)];
    }
    case "trouverQ":
      return [texte("Résous "), latex("f(x)=t(x)"), texte(" pour trouver l'abscisse q du second point commun.")];
    case "verifierPente":
      return [texte("Calcule la pente de la courbe en q et conclus.")];
  }
}

function construireEnonceTangente(exercice: ExerciceTangente): SectionExercice {
  return {
    enteteFragments: [texte("On considère la fonction "), latex(formatFDeXLatex(exercice))],
    questions: etapesTangente(exercice).map((etape) => ({ consigne: consigneEtape(exercice, etape) })),
  };
}

function consignePapier(exercice: ExerciceTangente): string {
  if (exercice.variante !== "doubleTangence") return consigneGenerale(exercice);
  return `Détermine l'équation de la tangente t à la courbe de f au point d'abscisse x = ${nombre(exercice.p)}. Montre que t est aussi tangente à la courbe en un second point, dont tu donneras l'abscisse.`;
}

function enoncePapierTangente(exercice: ExerciceTangente): EnoncePapier {
  return {
    section: {
      enteteFragments: [texte("On considère la fonction "), latex(formatFDeXLatex(exercice))],
      questions: [{ consigne: [texte(consignePapier(exercice))] }],
    },
    etapesParQuestion: [etapesTangente(exercice).map((_, i) => LETTRES[i])],
  };
}

function joindre(latexs: string[], separateur = " ; "): FragmentConsigne[] {
  return latexs.flatMap((l, i) => [...(i === 0 ? [] : [texte(separateur)]), latex(l)]);
}

function reponseBreveTangente(exercice: ExerciceTangente): FragmentConsigne[] {
  switch (exercice.variante) {
    case "pointDonne":
      return [latex(formatReponseAttenduePhaseLatex(exercice, "tangente")[0])];
    case "horizontale":
      return joindre(formatReponseAttenduePhaseLatex(exercice, "coordonnees"));
    case "doubleTangence":
      return [
        texte("t : "),
        latex(formatReponseAttenduePhaseLatex(exercice, "tangenteEnP")[1]),
        texte(" ; second point de tangence en "),
        latex(formatReponseAttenduePhaseLatex(exercice, "trouverQ")[0]),
      ];
  }
}

function baremeTangente(exercice: ExerciceTangente): BaremeExercice {
  const L = (e: EtapeTangente) => lettre(exercice, e);
  const c = (sousQuestion: string, texteCritere: string, points: number): CritereBareme => ({ sousQuestion, critere: [texte(texteCritere)], points });
  let criteres: CritereBareme[];
  if (exercice.variante === "pointDonne") {
    criteres = [c(L("deriver"), "Dérivée f'(x) correcte", 1), c(L("substituer"), "f(a) et f'(a) correctement calculés", 1), c(L("tangente"), "Équation de la tangente (formule du cours appliquée et réduite)", 2)];
  } else if (exercice.variante === "horizontale") {
    criteres = [c(L("deriver"), "Dérivée f'(x) correcte", 1), c(L("resoudre"), "Résolution de f'(x) = 0 (toutes les solutions)", 1.5), c(L("coordonnees"), "Coordonnées de chaque point de tangence", 1.5)];
  } else {
    criteres = [c(L("tangenteEnP"), "Dérivée, f'(p) et équation de la tangente t", 1.5), c(L("trouverQ"), "Second point commun q (factorisation par la racine double)", 1.5), c(L("verifierPente"), "f'(q) = f'(p) : tangence justifiée", 1)];
  }
  const erreursFrequentes =
    exercice.variante === "pointDonne"
      ? [
          { description: [texte("Pente et ordonnée interverties (f(a) pris comme pente)")], cout: "0 pt sur l'équation" },
          { description: [texte("Erreur de signe en distribuant f'(a)(x − a)")], cout: "−0,5" },
        ]
      : exercice.variante === "horizontale"
        ? [
            { description: [texte("Abscisses seules, sans l'ordonnée des points")], cout: "−1" },
            { description: [texte("Racine double comptée deux fois")], cout: "−0,5" },
          ]
        : [{ description: [texte("Second point trouvé sans vérifier la pente en q")], cout: "0 pt sur la vérification" }];
  return {
    reponseFinale: reponseBreveTangente(exercice),
    criteres,
    erreursFrequentes,
    reponsesAcceptees: [
      [texte("Équation laissée sous la forme y = f(a) + f'(a)(x − a), valeurs remplacées")],
      ...(exercice.variante === "pointDonne" && exercice.sousFamille === "radicale" ? [[texte("Valeurs exactes sous une autre forme équivalente (dénominateur non rationalisé)")]] : []),
    ],
  };
}

/** Niveau 1–7 : l'étape « dérivée » (papier) compte comme les écrans ; méthode 1 (formule de la
 * tangente, ou f′(x) = 0 à poser) ; piège dans les DONNÉES : radicande (racine à simplifier, dénominateur
 * à rendre rationnel), racine double de f′ (un seul point), double tangence (racine double cachée). */
function criteresDifficulteTangente(exercice: ExerciceTangente): CriteresDifficulte {
  const piege = exercice.variante === "doubleTangence" ? 1 : 0;
  return { ...etapesDuCorrige(correctionDetailleeTangente(exercice), []), methode: 1, piege };
}

/** Ancien corrigé (repli, documents Word) : les lignes du corrigé détaillé, en paragraphes. */
function construireCorrectionTangente(exercice: ExerciceTangente): BlocCorrection[] {
  return correctionDetailleeTangente(exercice)
    .filter((l) => l.label !== "Piège" && l.label !== "Méthode")
    .map((l) => ({ type: "paragraphe", fragments: l.fragments }));
}

export const adaptateurEvaluationTangentes: AdaptateurFeuilleExercices<ExerciceTangente> = {
  titreDocument: "Tangentes — Évaluation",
  nomFichierBase: "tangentes",
  genererInstance: genererExerciceTangente,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id),
  construireEnonce: construireEnonceTangente,
  construireCorrection: construireCorrectionTangente,
  criteresDifficulte: criteresDifficulteTangente,
  reponseBreve: reponseBreveTangente,
  correctionDetaillee: correctionDetailleeTangente,
  bareme: baremeTangente,
  enoncePapier: enoncePapierTangente,
  profilInstance: profilTangente,
  libelleCasParticulier: LIBELLE_CAS_TANGENTES,
  // Regroupement a), b), c) : l'abscisse va dans la ligne (`export/regroupementsPapier.ts`, 5gen28).
};
