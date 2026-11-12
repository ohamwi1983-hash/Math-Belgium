import type { ExerciceTangente, ExerciceTangenteDoubleTangence } from "../../core5e/tangentes.types";
import type {
  AdaptateurFeuilleExercices,
  BaremeExercice,
  BlocCorrection,
  CritereBareme,
  EnoncePapier,
  EtapeCorrection,
  FragmentConsigne,
  SectionExercice,
} from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { consigneGenerale, formatFDeXLatex, formatFPrimeDeXLatex, formatReponseAttenduePhaseLatex, texteAideNiveau1 } from "../../ui5e/formatTangentes";
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

/** « x − 2 », « x + 3 », « x » en LaTeX. */
function facteurLatex(r: number): string {
  if (r === 0) return "x";
  return r > 0 ? `x-${r}` : `x+${Math.abs(r)}`;
}

/** « (x − 2)² », ou « x² » quand la racine est 0. */
function carreLatex(r: number): string {
  return r === 0 ? "x^2" : `(${facteurLatex(r)})^2`;
}

/** f'(x) de la double tangence — le quartique développé est dérivé terme à terme ; mis en forme par
 * le MÊME formateur que f (`formatFDeXLatex`, appliqué aux coefficients de la dérivée). */
function fPrimeDoubleTangenceLatex(exercice: ExerciceTangenteDoubleTangence): string {
  const derivee = exercice.coeffs.slice(1).map((c, i) => (i + 1) * c);
  return formatFDeXLatex({ variante: "doubleTangence", coeffs: derivee, p: 0, q: 0 }).replace(/^f\(x\)/, "f'(x)");
}

function fPrimeLatex(exercice: ExerciceTangente): string {
  return exercice.variante === "doubleTangence" ? fPrimeDoubleTangenceLatex(exercice) : formatFPrimeDeXLatex(exercice);
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

/** Ligne « Méthode » tirée de l'aide de niveau 1 de l'écran (texte + formule à part). */
function methode(exercice: ExerciceTangente, ecran: EcranTangente, sousQuestion: string): EtapeCorrection {
  const aide = texteAideNiveau1(ecran, exercice);
  return { label: "Méthode", sousQuestion, fragments: [texte(aide.texte), ...(aide.latex ? [texte(" "), latex(aide.latex)] : [])] };
}

function correctionDetailleeTangente(exercice: ExerciceTangente): EtapeCorrection[] {
  const L = (e: EtapeTangente) => lettre(exercice, e);
  if (exercice.variante === "pointDonne") {
    const [fA, fPrimeA] = formatReponseAttenduePhaseLatex(exercice, "substituer");
    const lignes: EtapeCorrection[] = [];
    if (exercice.sousFamille === "radicale") {
      lignes.push({ label: "Méthode", sousQuestion: L("deriver"), fragments: [texte("Règle de la chaîne : "), latex("\\left(\\sqrt{u}\\right)'=\\dfrac{u'}{2\\sqrt{u}}"), texte(".")] });
    }
    lignes.push(
      { label: "Dérivée", sousQuestion: L("deriver"), fragments: [latex(fPrimeLatex(exercice))] },
      { label: "Calcul", sousQuestion: L("substituer"), fragments: [latex(fA), texte(" et "), latex(fPrimeA), texte(".")] },
      methode(exercice, "tangente", L("tangente")),
      { label: "Conclusion", sousQuestion: L("tangente"), fragments: [latex(formatReponseAttenduePhaseLatex(exercice, "tangente")[0])] },
      {
        label: "Piège",
        sousQuestion: L("tangente"),
        fragments: [texte("La pente de la tangente est "), latex(`f'(${exercice.a})`), texte(" ; "), latex(`f(${exercice.a})`), texte(" est l'ordonnée du point de contact. Les intervertir donne une autre droite.")],
      },
    );
    return lignes;
  }
  if (exercice.variante === "horizontale") {
    const racineDouble = exercice.racines.length === 1;
    return [
      { label: "Dérivée", sousQuestion: L("deriver"), fragments: [latex(fPrimeLatex(exercice))] },
      methode(exercice, "resoudre", L("resoudre")),
      { label: "Calcul", sousQuestion: L("resoudre"), fragments: [latex(formatReponseAttenduePhaseLatex(exercice, "resoudre")[0]), texte(racineDouble ? " (racine double)." : ".")] },
      { label: "Calcul", sousQuestion: L("coordonnees"), fragments: [...joindre(formatReponseAttenduePhaseLatex(exercice, "coordonnees")), texte(".")] },
      {
        label: "Piège",
        sousQuestion: L("coordonnees"),
        fragments: racineDouble
          ? [texte("Une racine double ne donne qu'un seul point à tangente horizontale.")]
          : [texte("Un point de tangence a deux coordonnées : l'abscisse seule ne suffit pas.")],
      },
    ];
  }
  const [fPrimeP, tangenteP] = formatReponseAttenduePhaseLatex(exercice, "tangenteEnP");
  const [fPrimeQ, conclusion] = formatReponseAttenduePhaseLatex(exercice, "verifierPente");
  const k = exercice.coeffs[4];
  const kLatex = k === 1 ? "" : k === -1 ? "-" : `${k}`;
  return [
    { label: "Dérivée", sousQuestion: L("tangenteEnP"), fragments: [latex(fPrimeLatex(exercice))] },
    { label: "Calcul", sousQuestion: L("tangenteEnP"), fragments: [latex(fPrimeP), texte(" ; tangente "), latex(tangenteP), texte(".")] },
    methode(exercice, "trouverQ", L("trouverQ")),
    {
      label: "Calcul",
      sousQuestion: L("trouverQ"),
      fragments: [latex(`f(x)-t(x)=${kLatex}${carreLatex(exercice.p)}${carreLatex(exercice.q)}`), texte(" ; d'où "), latex(formatReponseAttenduePhaseLatex(exercice, "trouverQ")[0]), texte(".")],
    },
    { label: "Calcul", sousQuestion: L("verifierPente"), fragments: [latex(fPrimeQ), texte(", la même pente qu'en "), latex(`x=${exercice.p}`), texte(".")] },
    { label: "Conclusion", sousQuestion: L("verifierPente"), fragments: [latex(conclusion)] },
    {
      label: "Piège",
      sousQuestion: L("verifierPente"),
      fragments: [texte("Un point commun ne suffit pas : la droite n'est tangente en q que si la pente de la courbe y est la même que celle de t.")],
    },
  ];
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

function difficulteTangente(exercice: ExerciceTangente): 1 | 2 | 3 {
  if (exercice.variante === "doubleTangence") return 3;
  if (exercice.variante === "pointDonne" && exercice.sousFamille === "polynomiale") return 1;
  return 2;
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
  difficulte: difficulteTangente,
  reponseBreve: reponseBreveTangente,
  correctionDetaillee: correctionDetailleeTangente,
  bareme: baremeTangente,
  enoncePapier: enoncePapierTangente,
  dureeMinutes: 7,
  profilInstance: profilTangente,
  libelleCasParticulier: LIBELLE_CAS_TANGENTES,
  // Consigne propre à la variante (abscisse interpolée) : pas de regroupement.
  regroupable: false,
};
