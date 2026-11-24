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
import { consigneGenerale, formatFDeXLatex, formatFPrimeDeXLatex, formatReponseAttenduePhaseLatex } from "../../ui5e/formatTangentes";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { correctionDetailleeTangente, etapesTangente, lettreEtapeTangente } from "./corrigeDetaille";
import { type EcranTangente } from "../../moteur5e/typesTangentes";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceTangente } from "./index";
import { LIBELLE_CAS_TANGENTES, PARAMETRES_TANGENTES, profilTangente } from "../profilsEvaluationDerivees28-30";

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

/** Étapes = écrans (avec « deriver » quand f′ est à calculer) — même source que le corrigé. */
type EtapeTangente = EcranTangente;

function lettre(exercice: ExerciceTangente, etape: EtapeTangente): string {
  return lettreEtapeTangente(exercice, etape);
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
    case "resoudrePente":
      return [texte("Résous "), latex(`f'(x)=${exercice.variante === "pente" ? exercice.m : "m"}`), texte(".")];
    case "tangentesPente":
      return [texte("Écris l'équation de la tangente en chaque point trouvé.")];
    case "condition":
      return [texte("Écris l'équation vérifiée par l'abscisse t d'un point de contact (la tangente en ce point passe par P).")];
    case "abscissesContact":
      return [texte("Résous cette équation : abscisses des points de contact.")];
    case "tangentesContact":
      return [texte("Écris l'équation de chaque tangente.")];
  }
}

/** En-tête : f(x), puis f′(x) quand elle est DONNÉE (option du lot C, réglage `derivee-donnee`). */
function entete(exercice: ExerciceTangente): FragmentConsigne[] {
  const f = [texte("On considère la fonction "), latex(formatFDeXLatex(exercice))];
  if (exercice.variante === "doubleTangence" || !exercice.deriveeDonnee) return f;
  return [...f, texte(" ; sa dérivée est "), latex(formatFPrimeDeXLatex(exercice))];
}

function construireEnonceTangente(exercice: ExerciceTangente): SectionExercice {
  return {
    enteteFragments: entete(exercice),
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
      enteteFragments: entete(exercice),
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
      return exercice.racines.length === 0 ? [texte("Aucune tangente horizontale (Δ < 0).")] : joindre(formatReponseAttenduePhaseLatex(exercice, "coordonnees"));
    case "pente":
      return [...joindre(formatReponseAttenduePhaseLatex(exercice, "coordonnees")), texte(" ; tangentes "), ...joindre(formatReponseAttenduePhaseLatex(exercice, "tangentesPente"), " et ")];
    case "pointExterieur":
      return joindre(formatReponseAttenduePhaseLatex(exercice, "tangentesContact"), " et ");
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
  // f′ donnée : le point de la dérivée passe à l'étape suivante.
  const derive = !exercice.deriveeDonnee;
  if (exercice.variante === "pointDonne") {
    criteres = [...(derive ? [c(L("deriver"), "Dérivée f′(x) correcte", 1)] : []), c(L("substituer"), "f(a) et f′(a) correctement calculés", derive ? 1 : 2), c(L("tangente"), "Équation de la tangente (formule du cours appliquée et réduite)", 2)];
  } else if (exercice.variante === "horizontale") {
    criteres =
      exercice.racines.length === 0
        ? [...(derive ? [c(L("deriver"), "Dérivée f′(x) correcte", 1)] : []), c(L("resoudre"), "Discriminant de f′(x) = 0 calculé, négatif", derive ? 2 : 3), c(L("resoudre"), "Conclusion : aucune tangente horizontale", 1)]
        : [...(derive ? [c(L("deriver"), "Dérivée f′(x) correcte", 1)] : []), c(L("resoudre"), "Résolution de f′(x) = 0 (toutes les solutions)", derive ? 1.5 : 2), c(L("coordonnees"), "Coordonnées de chaque point de tangence", derive ? 1.5 : 2)];
  } else if (exercice.variante === "pente") {
    criteres = [...(derive ? [c(L("deriver"), "Dérivée f′(x) correcte", 1)] : []), c(L("resoudrePente"), "Équation f′(x) = m posée et résolue", derive ? 1 : 1.5), c(L("coordonnees"), "Ordonnée de chaque point de contact", 0.5), c(L("tangentesPente"), "Équation de chaque tangente", derive ? 1.5 : 2)];
  } else if (exercice.variante === "pointExterieur") {
    criteres = [...(derive ? [c(L("deriver"), "Dérivée f′(x) correcte", 0.5)] : []), c(L("condition"), "Condition « P est sur la tangente en t » posée et réduite", derive ? 1.5 : 2), c(L("abscissesContact"), "Abscisses des deux points de contact", 1), c(L("tangentesContact"), "Équations des deux tangentes", 1)];
  } else {
    criteres = [c(L("tangenteEnP"), "Dérivée, f′(p) et équation de la tangente t", 1.5), c(L("trouverQ"), "Second point commun q (factorisation par la racine double)", 1.5), c(L("verifierPente"), "f′(q) = f′(p) : tangence justifiée", 1)];
  }
  const erreursFrequentes =
    exercice.variante === "pointDonne"
      ? [
          { description: [texte("Pente et ordonnée interverties (f(a) pris comme pente)")], cout: "0 pt sur l'équation" },
          { description: [texte("Erreur de signe en distribuant f′(a)(x − a)")], cout: "−0,5" },
        ]
      : exercice.variante === "horizontale"
        ? [
            { description: [texte("Abscisses seules, sans l'ordonnée des points")], cout: "−1" },
            { description: [texte("Racine double comptée deux fois")], cout: "−0,5" },
          ]
        : exercice.variante === "pente"
          ? [
              { description: [texte("f′(x) = 0 résolue au lieu de f′(x) = m")], cout: "0 pt sur la résolution" },
              { description: [texte("Ordonnée à l'origine prise égale à f(x₀)")], cout: "−0,5 par tangente" },
            ]
          : exercice.variante === "pointExterieur"
            ? [
                { description: [texte("Tangente calculée au point d'abscisse de P (P n'est pas sur la courbe)")], cout: "0 pt sur la condition" },
                { description: [texte("Une seule tangente donnée")], cout: "−1" },
              ]
            : [{ description: [texte("Second point trouvé sans vérifier la pente en q")], cout: "0 pt sur la vérification" }];
  return {
    reponseFinale: reponseBreveTangente(exercice),
    criteres,
    erreursFrequentes,
    reponsesAcceptees: [
      [texte("Équation laissée sous la forme y = f(a) + f′(a)(x − a), valeurs remplacées")],
      ...(exercice.variante === "pointDonne" && exercice.sousFamille === "radicale" ? [[texte("Valeurs exactes sous une autre forme équivalente (dénominateur non rationalisé)")]] : []),
    ],
  };
}

/** Niveau 1–7 : l'étape « dérivée » (papier) compte comme les écrans ; méthode 1 (formule de la
 * tangente, ou f′(x) = 0 à poser) ; piège dans les DONNÉES : radicande (racine à simplifier, dénominateur
 * à rendre rationnel), racine double de f′ (un seul point), double tangence (racine double cachée). */
function criteresDifficulteTangente(exercice: ExerciceTangente): CriteresDifficulte {
  const piege = exercice.variante === "doubleTangence" || exercice.variante === "pointExterieur" ? 1 : 0;
  // Groupe à verdict « horizontale » (lot D) : niveau et durée ceux des deux racines distinctes, quel
  // que soit le verdict (0, 1 ou 2 points) — sinon la feuille trahirait l'issue.
  const reference: ExerciceTangente =
    exercice.variante === "horizontale" ? { variante: "horizontale", a: 2, b: 0, c: -6, d: exercice.d, racines: [-1, 1], deriveeDonnee: exercice.deriveeDonnee } : exercice;
  return { ...etapesDuCorrige(correctionDetailleeTangente(reference), []), methode: 1, piege };
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
  parametresAuChoix: PARAMETRES_TANGENTES,
  groupesVerdict: [{ id: "groupe_horizontale", label: "B. Horizontale — 0, 1 ou 2 points (tiré au hasard)", variantes: ["horizontale-double", "horizontale-distinct", "horizontale-aucune"], formeCommune: true }],
  // Regroupement a), b), c) : l'abscisse va dans la ligne (`export/regroupementsPapier.ts`, 5gen28).
};
