import type { CibleLimiteLog, ExerciceLimiteLogarithmique, ExerciceLimiteLogA, ExerciceLimiteLogB, ExerciceLimiteLogC } from "../../core6e/limitesLogarithmiques.types";
import type { AdaptateurFeuilleExercices, EnoncePapier, BaremeExercice, BlocCorrection, CritereBareme, EtapeAmenagee, EtapeCorrection, FragmentConsigne, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { CONSIGNE_GENERALE, configDiagnosticPartiesC, consigneEcran, formatCategorieLabel, formatCibleTexte, formatLimiteEnonceLatex, formatReformulationBLatex, formeFactoriseeA } from "../../ui6e/formatLimitesLogarithmiques";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceLimiteLogarithmique } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceLimiteLogarithmique>` pour `6gen17` (Calcul de
 * limites, fonctions logarithmes) — feuille d'évaluation, voir
 * `generateurs/analyseFonction/exportWord.ts` pour le mécanisme générique de référence.
 *
 * Contrairement à `deriveesCyclometriques` (6gen4, UNE seule question générique par instance),
 * `6gen17` a une consigne écran PAR FAMILLE (et parfois par sous-type, ex. B) qui change de nature
 * à chaque étape (identifier une dominance, poser une substitution, diagnostiquer chaque partie,
 * calculer un exposant puis sa limite, développer puis simplifier...) — voir
 * `moteur6e/typesLimitesLogarithmiques.ts` (`phaseInitiale`/`phaseApres`) : 2 écrans par famille.
 * Chaque écran RÉELLEMENT traversé devient donc une question a)/b) séparée — `regroupable` n'est
 * donc PAS activé ici. Les consignes réutilisent directement `consigneEcran` (ui6e), jamais
 * réécrites en dur ici. Le corrigé n'affiche que des formes EXACTES déjà construites par le
 * générateur (`CibleLimiteLog.latex`, `limiteLatex`, `formatReformulationBLatex`) et une valeur
 * approchée à virgule quand elle est utile — jamais un flottant brut à point décimal (audit
 * chapitre 3 de 6e, point 7).
 */

/** Valeur approchée au centième, virgule décimale. */
function formatApproche(valeur: number): string {
  return valeur.toFixed(2).replace(".", "{,}");
}

function construireEnonceLimitesLogarithmiques(exercice: ExerciceLimiteLogarithmique): SectionExercice {
  const entete = [texte(CONSIGNE_GENERALE + " "), latex(formatLimiteEnonceLatex(exercice))];

  switch (exercice.famille) {
    case "A":
      return {
        enteteFragments: entete,
        questions: [
          { consigne: consigneEcran("aDominance", exercice), reponse: { type: "lignes", nombre: 2 } },
          { consigne: consigneEcran("aConclure", exercice), reponse: { type: "lignes", nombre: 1 } },
        ],
      };
    case "B":
      return {
        enteteFragments: entete,
        questions: [
          { consigne: consigneEcran("bReformuler", exercice), reponse: { type: "lignes", nombre: 2 } },
          { consigne: consigneEcran("bConclure", exercice), reponse: { type: "lignes", nombre: 1 } },
        ],
      };
    case "C":
      return {
        enteteFragments: entete,
        questions: [
          { consigne: consigneEcran("cDiagnostic", exercice), reponse: { type: "lignes", nombre: 2 } },
          { consigne: consigneEcran("cConclure", exercice), reponse: { type: "lignes", nombre: 1 } },
        ],
      };
  }
}

function construireCorrectionLimitesLogarithmiques(exercice: ExerciceLimiteLogarithmique): BlocCorrection[] {
  switch (exercice.famille) {
    case "A":
      return [
        {
          type: "paragraphe",
          fragments: [
            texte("a) Dominance — numérateur : "),
            texte(formatCategorieLabel(exercice.dominanceNumerateur)),
            texte(", dénominateur : "),
            texte(formatCategorieLabel(exercice.dominanceDenominateur)),
            texte("."),
          ],
        },
        {
          type: "paragraphe",
          fragments:
            exercice.limiteGlobale.type === "valeur" && exercice.limiteGlobale.latex !== "1"
              ? [texte("b) Limite : "), latex(formatCibleTexte(exercice.limiteGlobale)), texte(" ≈ "), latex(formatApproche(exercice.limiteGlobale.valeur)), texte(".")]
              : [texte("b) Limite : "), latex(formatCibleTexte(exercice.limiteGlobale)), texte(".")],
        },
      ];

    case "B":
      return [
        { type: "paragraphe", fragments: [texte("a) En posant u = x/x₀ − 1 (u → 0), f devient : "), latex(formatReformulationBLatex(exercice)), texte(", où apparaît la limite de référence ln(1+u)/u → 1.")] },
        {
          type: "paragraphe",
          fragments:
            exercice.sousType === "produit"
              ? [texte("b) Limite : "), latex(exercice.limiteLatex), texte(" ≈ "), latex(formatApproche(exercice.limiteFinale)), texte(".")]
              : [texte("b) Limite : "), latex(exercice.limiteLatex), texte(".")],
        },
      ];

    case "C": {
      const { partie1, partie2 } = configDiagnosticPartiesC(exercice);
      const [cible1, cible2] = exercice.sousType === "c2" ? [exercice.partieFacteur1, exercice.partieFacteur2] : [exercice.partieNumerateur, exercice.partieDenominateur];
      return [
        {
          type: "paragraphe",
          fragments: [
            texte(`a) ${partie1.label} : `),
            latex(formatCibleTexte(cible1)),
            texte(`. ${partie2.label} : `),
            latex(formatCibleTexte(cible2)),
            texte("."),
          ],
        },
        { type: "paragraphe", fragments: [texte("b) Limite : "), latex(formatCibleTexte(exercice.limiteFinale)), texte(".")] },
      ];
    }
  }
}

// ============================================================================
// Champs de la refonte des feuilles (difficulté, réponse brève, corrigé détaillé, barème, version
// aménagée) — tout est calculé à partir de l'instance, avec les mêmes formes exactes que le corrigé.
// ============================================================================

const HIERARCHIE_LATEX = "\\ln(x) \\ll x^n \\ll b^x \\ (b>1)";
const REFERENCE_LATEX = "\\lim_{u \\to 0} \\dfrac{\\ln(1+u)}{u} = 1";

/** Limite attendue de l'exercice, quelle que soit sa famille. */
function limiteAttendue(exercice: ExerciceLimiteLogarithmique): CibleLimiteLog {
  if (exercice.famille === "A") return exercice.limiteGlobale;
  if (exercice.famille === "B") return { type: "valeur", valeur: exercice.limiteFinale, latex: exercice.limiteLatex };
  return exercice.limiteFinale;
}

/** Limite en LaTeX, avec une valeur approchée au centième quand elle n'est pas entière. */
function limiteLatexAvecApproche(cible: CibleLimiteLog): string {
  const exacte = formatCibleTexte(cible);
  if (cible.type === "valeur" && !Number.isInteger(cible.valeur)) return `${exacte} \\approx ${formatApproche(cible.valeur)}`;
  return exacte;
}

function difficulte(exercice: ExerciceLimiteLogarithmique): 1 | 2 | 3 {
  switch (exercice.famille) {
    case "A":
      // Comparaison directe (1), même polynôme ou mélange de termes (2), changement de base (3).
      return exercice.sousType === "sous1" || exercice.sousType === "sous2" ? 1 : exercice.sousType === "sous3" ? 3 : 2;
    case "B":
      return 3;
    case "C":
      // c3 : forme 0/0 apparente qui n'en est pas une (piège central).
      return exercice.sousType === "c3" ? 3 : 2;
  }
}

function reponseBreve(exercice: ExerciceLimiteLogarithmique): FragmentConsigne[] {
  return [latex(`\\text{limite} = ${limiteLatexAvecApproche(limiteAttendue(exercice))}`)];
}

/** Justification de la conclusion de la famille A, à partir de la forme factorisée. */
function raisonConclusionA(exercice: ExerciceLimiteLogA): FragmentConsigne[] {
  switch (exercice.sousType) {
    case "sous1":
      return [texte("Le polynôme l'emporte sur le logarithme : "), latex(`\\dfrac{\\ln(x)}{${exercice.d === 1 ? "x" : `x^{${exercice.d}}`}} \\to 0`), texte(", et le second facteur tend vers une constante.")];
    case "sous2":
      return exercice.orientation === "expSurPoly"
        ? [texte("L'exponentielle de base > 1 l'emporte sur la puissance : le quotient tend vers "), latex("+\\infty"), texte(".")]
        : [texte("L'exponentielle de base > 1, au dénominateur, l'emporte sur la puissance : le quotient tend vers 0.")]
    case "sous3":
      return [
        texte("ln(x) se simplifie ; comme "),
        latex(`\\log_{${exercice.base}}(x) = \\dfrac{\\ln(x)}{\\ln(${exercice.base})}`),
        texte(" et que les termes constants divisés par ln(x) tendent vers 0, la limite vaut "),
        latex(`\\dfrac{${exercice.p1}}{\\frac{${exercice.p2}}{\\ln(${exercice.base})}} = ${formatCibleTexte(exercice.limiteGlobale)}`),
        texte("."),
      ];
    case "sous4":
      return [texte("Les logarithmes et la constante sont négligeables devant le même polynôme en haut et en bas : chaque parenthèse tend vers 1.")];
    case "sous5":
      return [texte("La puissance divisée par l'exponentielle de base > 1 tend vers 0, et le second facteur tend vers une constante : le produit tend vers 0.")];
  }
}

function correctionA(exercice: ExerciceLimiteLogA): EtapeCorrection[] {
  return [
    { label: "Méthode", fragments: [texte("Forme indéterminée à l'infini : on compare les termes dominants grâce à la hiérarchie "), latex(HIERARCHIE_LATEX), texte(".")] },
    {
      label: "Dominance",
      sousQuestion: "a",
      fragments: [texte(`Numérateur : ${formatCategorieLabel(exercice.dominanceNumerateur).toLowerCase()} ; dénominateur : ${formatCategorieLabel(exercice.dominanceDenominateur).toLowerCase()}.`)],
    },
    { label: "Calcul", sousQuestion: "b", fragments: [texte("On met en évidence les termes dominants : "), latex(formeFactoriseeA(exercice)), texte(".")] },
    { label: "Justification", sousQuestion: "b", fragments: raisonConclusionA(exercice) },
    { label: "Conclusion", sousQuestion: "b", fragments: [latex(`${formatLimiteEnonceLatex(exercice)} = ${limiteLatexAvecApproche(exercice.limiteGlobale)}`), texte(".")] },
  ];
}

/** mx + n sans coefficient 1 visible ni « + 0 ». */
function formatAffine(m: number, n: number): string {
  const terme = m === 1 ? "x" : m === -1 ? "-x" : `${m}x`;
  if (n === 0) return terme;
  return `${terme} ${n < 0 ? "-" : "+"} ${Math.abs(n)}`;
}

/** x exprimé en u : x = x0(1 + u). */
function xEnU(x0: number): string {
  return x0 === 1 ? "x = 1+u" : `x = ${x0}(1+u)`;
}

function correctionB(exercice: ExerciceLimiteLogB): EtapeCorrection[] {
  const etapes: EtapeCorrection[] = [
    {
      label: "Méthode",
      fragments: [texte("La base et l'argument du logarithme tendent tous deux vers 1 : c'est une forme 0/0 déguisée. On pose "), latex("u = \\dfrac{x}{x_0} - 1"), texte(".")],
    },
    { label: "Substitution", sousQuestion: "a", fragments: [texte("Quand "), latex(`x \\to ${exercice.x0}`), texte(", "), latex("u \\to 0"), texte(", et "), latex(xEnU(exercice.x0)), texte(".")] },
  ];
  if (exercice.sousType === "quotient") {
    const c = exercice.m * exercice.x0;
    etapes.push({
      label: "Réécriture",
      sousQuestion: "a",
      fragments: [
        texte("Changement de base : le logarithme s'écrit "),
        latex(`\\dfrac{\\ln(${formatAffine(exercice.m, exercice.n)})}{${exercice.k === 1 ? "" : exercice.k}\\ln\\left(${exercice.x0 === 1 ? "x" : `\\frac{x}{${exercice.x0}}`}\\right)}`),
        texte(" ; comme "),
        latex(`${exercice.m < 0 ? `(${exercice.m})` : exercice.m} \\cdot ${exercice.x0} ${exercice.n < 0 ? "-" : "+"} ${Math.abs(exercice.n)} = 1`),
        texte(", l'argument vaut "),
        latex(`1 ${c < 0 ? "-" : "+"} ${Math.abs(c) === 1 ? "" : Math.abs(c)}u`),
        texte(" : "),
        latex(formatReformulationBLatex(exercice)),
        texte("."),
      ],
    });
  } else {
    etapes.push({
      label: "Réécriture",
      sousQuestion: "a",
      fragments: [
        texte("Changement de base : "),
        latex(`\\log_{x/${exercice.x0}}(${exercice.k}) = \\dfrac{\\ln(${exercice.k})}{\\ln(1+u)}`),
        texte(" et "),
        latex(`x - ${exercice.x0} = ${exercice.x0 === 1 ? "" : exercice.x0}u`),
        texte(" : "),
        latex(formatReformulationBLatex(exercice)),
        texte("."),
      ],
    });
  }
  etapes.push(
    { label: "Référence", sousQuestion: "b", fragments: [texte("On applique la limite de référence "), latex(REFERENCE_LATEX), texte(".")] },
    { label: "Conclusion", sousQuestion: "b", fragments: [latex(`${formatLimiteEnonceLatex(exercice)} = ${limiteLatexAvecApproche(limiteAttendue(exercice))}`), texte(".")] },
  );
  return etapes;
}

/** Les deux parties évaluées séparément (numérateur/dénominateur, ou les deux facteurs). */
function partiesC(exercice: ExerciceLimiteLogC): { label1: string; label2: string; cible1: CibleLimiteLog; cible2: CibleLimiteLog; signe2: string } {
  if (exercice.sousType === "c2") {
    return { label1: "Facteur x", label2: "Second facteur", cible1: exercice.partieFacteur1, cible2: exercice.partieFacteur2, signe2: "1" };
  }
  const signe2 = exercice.sousType === "c1" ? (exercice.direction === "droite" ? "0^+" : "0^-") : "0^+";
  return { label1: "Numérateur", label2: "Dénominateur", cible1: exercice.partieNumerateur, cible2: exercice.partieDenominateur, signe2 };
}

function correctionC(exercice: ExerciceLimiteLogC): EtapeCorrection[] {
  const { label1, label2, cible1, signe2 } = partiesC(exercice);
  const justif2: FragmentConsigne[] =
    exercice.sousType === "c1"
      ? [texte("ln(1) = 0, et ln(x) est "), texte(exercice.direction === "droite" ? "positif à droite de 1" : "négatif à gauche de 1"), texte(" : "), latex(`\\ln(x) \\to ${signe2}`), texte(".")]
      : exercice.sousType === "c2"
        ? [texte("L'exposant "), latex(`\\frac{${exercice.coefC}}{x} \\to 0`), texte(", donc "), latex(`${exercice.base}^{\\frac{${exercice.coefC}}{x}} \\to ${exercice.base}^0 = 1`), texte(".")]
        : [latex(`1 + ${exercice.coefC === 1 ? "" : exercice.coefC}x^2 \\to 1^+`), texte(", donc le dénominateur tend vers "), latex("\\ln(1) = 0"), texte(" par valeurs positives.")];
  const etapes: EtapeCorrection[] = [
    { label: "Méthode", fragments: [texte("Avant toute technique de forme indéterminée, on évalue chaque partie séparément.")] },
    { label: label1, sousQuestion: "a", fragments: [latex(`\\to ${formatCibleTexte(cible1)}`), texte(exercice.sousType === "c3" ? ` (car ${exercice.base}⁰ = 1 et sin(0) = 0).` : ".")] },
    { label: label2, sousQuestion: "a", fragments: justif2 },
  ];
  if (exercice.sousType === "c3") {
    etapes.push({ label: "Piège", fragments: [texte("Le numérateur ne s'annule pas : ce n'est PAS une forme 0/0, aucune technique de forme indéterminée n'est nécessaire.")] });
  }
  const regle =
    exercice.sousType === "c2"
      ? [texte("Un infini multiplié par une constante positive reste un infini de même signe.")]
      : [texte("Une constante non nulle divisée par un nombre qui tend vers "), latex(signe2), texte(" tend vers l'infini, avec le signe du quotient.")];
  etapes.push(
    { label: "Règle", sousQuestion: "b", fragments: regle },
    { label: "Conclusion", sousQuestion: "b", fragments: [latex(`${formatLimiteEnonceLatex(exercice)} = ${formatCibleTexte(exercice.limiteFinale)}`), texte(".")] },
  );
  return etapes;
}

function correctionDetaillee(exercice: ExerciceLimiteLogarithmique): EtapeCorrection[] {
  if (exercice.famille === "A") return correctionA(exercice);
  if (exercice.famille === "B") return correctionB(exercice);
  return correctionC(exercice);
}

function bareme(exercice: ExerciceLimiteLogarithmique): BaremeExercice {
  const limite = limiteAttendue(exercice);
  const finale = [latex(formatCibleTexte(limite))];
  let criteres: CritereBareme[];
  let erreursFrequentes: BaremeExercice["erreursFrequentes"];
  if (exercice.famille === "A") {
    criteres = [
      { sousQuestion: "a", critere: [texte(`Terme dominant du numérateur : ${formatCategorieLabel(exercice.dominanceNumerateur).toLowerCase()}`)], points: 1 },
      { sousQuestion: "a", critere: [texte(`Terme dominant du dénominateur : ${formatCategorieLabel(exercice.dominanceDenominateur).toLowerCase()}`)], points: 1 },
      { sousQuestion: "b", critere: [texte("Mise en évidence des termes dominants, raisonnement justifié")], points: 1 },
      { sousQuestion: "b", critere: [texte("Limite : "), latex(formatCibleTexte(limite))], points: 1 },
    ];
    erreursFrequentes = [
      { description: [texte("Conclure « forme indéterminée » sans comparer les termes dominants")], cout: "0 pt en b)" },
      exercice.sousType === "sous3"
        ? { description: [texte("Oublier le facteur ln(" + exercice.base + ") du changement de base")], cout: "−1" }
        : { description: [texte("Inverser la hiérarchie (logarithme plus rapide que le polynôme)")], cout: "−2" },
    ];
  } else if (exercice.famille === "B") {
    criteres = [
      { sousQuestion: "a", critere: [texte("Substitution "), latex("u = x/x_0 - 1"), texte(" posée, "), latex("u \\to 0")], points: 1 },
      { sousQuestion: "a", critere: [texte("Réécriture : "), latex(formatReformulationBLatex(exercice))], points: 1 },
      { sousQuestion: "b", critere: [texte("Limite de référence "), latex("\\ln(1+u)/u \\to 1"), texte(" invoquée")], points: 1 },
      { sousQuestion: "b", critere: [texte("Limite : "), latex(exercice.limiteLatex)], points: 1 },
    ];
    erreursFrequentes = [
      { description: [texte("Remplacer directement x par " + exercice.x0 + ", obtenir 0/0 et s'arrêter")], cout: "0 pt en a)" },
      { description: [texte("Oublier le coefficient de u en appliquant la limite de référence")], cout: "−1" },
    ];
  } else {
    const { label1, label2, cible1, signe2 } = partiesC(exercice);
    criteres = [
      { sousQuestion: "a", critere: [texte(`${label1} → `), latex(formatCibleTexte(cible1))], points: 1 },
      { sousQuestion: "a", critere: [texte(`${label2} → `), latex(signe2)], points: 1 },
      { sousQuestion: "b", critere: [texte(exercice.sousType === "c2" ? "Produit d'un infini par une constante positive" : "Règle des signes du quotient")], points: 1 },
      { sousQuestion: "b", critere: [texte("Limite : "), latex(formatCibleTexte(exercice.limiteFinale))], points: 1 },
    ];
    erreursFrequentes = [
      exercice.sousType === "c3"
        ? { description: [texte("Traiter l'expression comme une forme 0/0 (le numérateur ne s'annule pas)")], cout: "0 pt en a) pour le numérateur" }
        : { description: [texte("Conclure « forme indéterminée » sans évaluer chaque partie")], cout: "0 pt en a)" },
      ...(exercice.sousType === "c2" ? [] : [{ description: [texte("Oublier le signe du 0 au dénominateur (+∞ au lieu de −∞ ou l'inverse)")], cout: "−1" }]),
    ];
  }
  const reponsesAcceptees: FragmentConsigne[][] = [];
  if (limite.type === "valeur" && !Number.isInteger(limite.valeur)) reponsesAcceptees.push([texte("Valeur approchée "), latex(formatApproche(limite.valeur)), texte(" si la forme exacte est aussi donnée dans la démarche")]);
  if (exercice.famille === "A" && exercice.sousType === "sous3") reponsesAcceptees.push([latex(`\\dfrac{${exercice.p1}\\ln(${exercice.base})}{${exercice.p2}}`), texte(" non simplifiée")]);
  return { reponseFinale: finale, criteres, erreursFrequentes, ...(reponsesAcceptees.length > 0 ? { reponsesAcceptees } : {}) };
}

function enonceAmenage(exercice: ExerciceLimiteLogarithmique): EtapeAmenagee[] {
  if (exercice.famille === "A") {
    return [
      { consigne: [texte("Trouve le terme dominant du numérateur.")], rappel: [texte("Hiérarchie à l'infini : "), latex(HIERARCHIE_LATEX), texte(".")], points: 1 },
      { consigne: [texte("Trouve le terme dominant du dénominateur.")], points: 1 },
      { consigne: [texte("Mets ces termes dominants en évidence en haut et en bas.")], points: 1 },
      { consigne: [texte("Conclus : donne la limite (valeur exacte si elle est finie).")], points: 1 },
    ];
  }
  if (exercice.famille === "B") {
    return [
      { consigne: [texte("Pose "), latex("u = \\dfrac{x}{x_0} - 1"), texte(" et écris x en fonction de u.")], rappel: [texte("Quand x tend vers "), latex(`x_0 = ${exercice.x0}`), texte(", u tend vers 0.")], points: 1 },
      { consigne: [texte("Réécris l'expression en fonction de u.")], rappel: [latex("\\log_b(a) = \\dfrac{\\ln(a)}{\\ln(b)}"), texte(".")], points: 1 },
      { consigne: [texte("Fais apparaître "), latex("\\dfrac{\\ln(1+u)}{u}"), texte(".")], rappel: [latex(REFERENCE_LATEX), texte(".")], points: 1 },
      { consigne: [texte("Conclus : donne la limite exacte.")], points: 1 },
    ];
  }
  const { label1, label2 } = partiesC(exercice);
  return [
    { consigne: [texte(`Calcule la limite de la partie « ${label1.toLowerCase()} ».`)], rappel: [texte("Remplace x par la valeur vers laquelle il tend.")], points: 1 },
    { consigne: [texte(`Calcule la limite de la partie « ${label2.toLowerCase()} ».`)], rappel: [texte("Si elle tend vers 0, précise de quel côté (0⁺ ou 0⁻).")], points: 1 },
    { consigne: [texte("Conclus : donne la limite, avec son signe.")], rappel: [texte("Pense à la règle des signes.")], points: 2 },
  ];
}

/** Énoncé PAPIER (feuille d'exercices, évaluation) : l'énoncé et la consigne globale seulement.
 * Les sous-questions de `construireEnonce` sont les étapes d'apprentissage du générateur
 * interactif : sur papier, elles passent dans le corrigé (voir `EnoncePapier`). */
function enoncePapier(exercice: ExerciceLimiteLogarithmique): EnoncePapier {
  return { section: { ...construireEnonceLimitesLogarithmiques(exercice), questions: [] } };
}

export const adaptateurEvaluationLimitesLogarithmiques: AdaptateurFeuilleExercices<ExerciceLimiteLogarithmique> = {
  titreDocument: "Calcul de limites (fonctions logarithmes) — Évaluation",
  nomFichierBase: "limites-logarithmiques",
  genererInstance: genererExerciceLimiteLogarithmique,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id),
  construireEnonce: construireEnonceLimitesLogarithmiques,
  construireCorrection: construireCorrectionLimitesLogarithmiques,
  difficulte,
  reponseBreve,
  correctionDetaillee,
  bareme,
  enonceAmenage,
  enoncePapier: enoncePapier,
  dureeMinutes: 5,
};
