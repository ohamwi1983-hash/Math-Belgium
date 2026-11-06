import type {
  ExerciceConvergenceArithmetique,
  ExerciceConvergenceGeometrique,
  ExerciceConvergenceQuelconque,
  ExerciceConvergenceSuite,
  VarianteConvergenceSuite,
} from "../../core5e/convergenceSuites.types";
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
import {
  consigneGenerale,
  consignePhase,
  formatExpressionDiviseeLatex,
  formatTermesDonneesLatex,
  libelleClassificationAttendue,
  lignesAideNiveau1,
  lignesAideNiveau2,
  texteAideNiveau1,
  texteAideNiveau2,
  type LigneAide,
} from "../../ui5e/formatConvergenceSuites";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceConvergenceSuite } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceConvergenceSuite>` pour 5gen16 (Convergence et
 * divergence des suites) — feuille d'exercices et évaluation (méthode : `.claude/rules/
 * feuilles-evaluations.md`).
 *
 * - `construireEnonce` : une question PAR ÉCRAN (`moteur5e/typesConvergenceSuites.ts::ordreComplet`)
 *   — 1 pour "arithmetique"/"geometrique", 2 pour "quelconque" (diviser, puis conclure). Ce sont les
 *   étapes d'apprentissage, reprises en titres « Étape n — … » du corrigé ; le choix fermé de l'écran
 *   y devient une étape rédigée.
 * - `enoncePapier` : ce qui est imprimé — la suite et la consigne globale (« converge-t-elle ou
 *   diverge-t-elle ? justifie, donne sa limite »), jamais les étapes.
 * Corrigé, barème et réponse brève réutilisent les fonctions de l'écran (`lignesAideNiveau1/2`,
 * `libelleClassificationAttendue`, `formatExpressionDiviseeLatex`, `texteAideNiveau2`) ; seules les
 * justifications `raisonArithmetiqueLatex`/`raisonGeometriqueLatex` sont écrites ici : elles
 * instancient la propriété du cours avec le r/q/u₁ réels, la classification restant toujours lue sur
 * `exercice.classification`.
 */

function enteteConvergence(exercice: ExerciceConvergenceSuite) {
  return [texte(`${consigneGenerale(exercice)} `), latex(formatTermesDonneesLatex(exercice).join(" \\quad "))];
}

/** Justification LaTeX pour "classificationArithmetique" — voir le commentaire de tête de fichier :
 * fait général instancié avec le `r` réel, la classification restant celle déjà tranchée par le
 * générateur (`exercice.classification`), jamais recalculée ici. */
function raisonArithmetiqueLatex(exercice: ExerciceConvergenceArithmetique): string {
  if (exercice.classification === "convergeVersU1") return `r = ${exercice.r} = 0 \\Rightarrow u_n \\text{ est constante : converge vers } u_1 = ${exercice.u1}.`;
  if (exercice.classification === "divergePlusInfini") return `r = ${exercice.r} > 0 \\Rightarrow u_n \\text{ diverge vers } +\\infty.`;
  return `r = ${exercice.r} < 0 \\Rightarrow u_n \\text{ diverge vers } -\\infty.`;
}

/** Justification LaTeX pour "classificationGeometrique" — même principe que ci-dessus ; réutilise
 * `formatTermesDonneesLatex(exercice)[1]` (déjà le "q=..." formaté en fraction irréductible par
 * `ui5e/formatConvergenceSuites.ts`, jamais reformaté indépendamment ici). */
function raisonGeometriqueLatex(exercice: ExerciceConvergenceGeometrique): string {
  const qLatex = formatTermesDonneesLatex(exercice)[1];
  switch (exercice.classification) {
    case "convergeVersU1":
      return `${qLatex} = 1 \\Rightarrow u_n \\text{ est constante : converge vers } u_1 = ${exercice.u1}.`;
    case "convergeVersZero":
      return `${qLatex}, \\ |q|<1 \\Rightarrow u_n \\to 0.`;
    case "divergePlusInfini":
      return `${qLatex} > 1 \\text{ et } u_1 = ${exercice.u1} > 0 \\Rightarrow u_n \\text{ diverge vers } +\\infty.`;
    case "divergeMoinsInfini":
      return `${qLatex} > 1 \\text{ et } u_1 = ${exercice.u1} < 0 \\Rightarrow u_n \\text{ diverge vers } -\\infty.`;
    case "oscilleNeConvergePas":
      return `${qLatex} = -1 \\Rightarrow u_n \\text{ oscille entre } u_1 \\text{ et } -u_1 \\text{ : ne converge pas.}`;
    case "oscilleDivergeSansLimite":
      return `${qLatex} < -1 \\Rightarrow u_n \\text{ oscille avec une amplitude croissante : diverge sans limite.}`;
  }
}

/** Étapes du générateur (une par écran) — reprises en titres « Étape n — … » du corrigé, jamais
 * imprimées dans l'énoncé (voir `enoncePapierConvergenceSuite`). Le choix fermé de l'écran
 * (« Choisis le comportement de la suite ») devient sur papier une étape rédigée. */
function construireEnonceConvergenceSuite(exercice: ExerciceConvergenceSuite): SectionExercice {
  if (exercice.variante === "quelconque") {
    return {
      enteteFragments: enteteConvergence(exercice),
      questions: [
        { consigne: [texte(consignePhase(exercice, "diviserQuelconque"))] },
        { consigne: [texte(consignePhase(exercice, "classifierQuelconque"))] },
      ],
    };
  }
  const objet = exercice.variante === "arithmetique" ? "du signe de la raison r" : "de la raison q (et, si besoin, du signe de u₁)";
  return {
    enteteFragments: enteteConvergence(exercice),
    questions: [{ consigne: [texte(`Déduis ${objet} le comportement de la suite : converge-t-elle (vers quelle limite) ou diverge-t-elle ?`)] }],
  };
}

// ============================================================================
// Feuilles enrichies (méthode : `.claude/rules/feuilles-evaluations.md`).
// ============================================================================

/** Énoncé papier : les données et la consigne globale seulement (une seule question), jamais les
 * étapes de l'écran. */
function enoncePapierConvergenceSuite(exercice: ExerciceConvergenceSuite): EnoncePapier {
  const donnees = formatTermesDonneesLatex(exercice).join("\\text{ et }");
  if (exercice.variante === "quelconque") {
    return {
      section: {
        enteteFragments: [texte("On considère la suite définie, pour n ≥ 1, par "), latex(donnees), texte("."), texte(consignePapier(exercice))],
        questions: [],
      },
    };
  }
  const nature = exercice.variante === "arithmetique" ? "arithmétique" : "géométrique";
  return {
    section: {
      enteteFragments: [texte(`On considère la suite ${nature} définie par `), latex(donnees), texte("."), texte(consignePapier(exercice))],
      questions: [],
    },
  };
}

/** La consigne globale, ajoutée en fin d'en-tête papier (une phrase, la même pour toute la variante). */
function consignePapier(exercice: ExerciceConvergenceSuite): string {
  return exercice.variante === "quelconque"
    ? " Étudie la limite de cette suite quand n tend vers l'infini : converge-t-elle (donne alors sa limite, valeur exacte) ou diverge-t-elle ? Justifie."
    : " Cette suite converge-t-elle ou diverge-t-elle ? Justifie et donne sa limite si elle en a une.";
}

/** Limite en LaTeX (`\lim u_n = …`), `null` si la suite n'a pas de limite (oscillation). */
function limiteLatex(exercice: ExerciceConvergenceSuite): string | null {
  const c = exercice.classification;
  if (c === "divergePlusInfini") return "\\lim u_n = +\\infty";
  if (c === "divergeMoinsInfini") return "\\lim u_n = -\\infty";
  if (exercice.variante === "quelconque") {
    if (exercice.classification === "limiteZero") return "\\lim u_n = 0";
    return `\\lim u_n = ${texteAideNiveau2(exercice, "classifierQuelconque").replace(/^\\lim\s*=\s*/, "")}`;
  }
  if (c === "convergeVersU1") return `\\lim u_n = u_1 = ${exercice.u1}`;
  if (c === "convergeVersZero") return "\\lim u_n = 0";
  return null;
}

function phaseConclusion(exercice: ExerciceConvergenceSuite) {
  return exercice.variante === "arithmetique" ? "classificationArithmetique" : exercice.variante === "geometrique" ? "classificationGeometrique" : "classifierQuelconque";
}

function reponseBreveConvergenceSuite(exercice: ExerciceConvergenceSuite): FragmentConsigne[] {
  const libelle = libelleClassificationAttendue(exercice, phaseConclusion(exercice));
  const lim = limiteLatex(exercice);
  return lim === null ? [texte(`${libelle} : pas de limite.`)] : [texte(`${libelle} : `), latex(lim), texte(".")];
}

/** Lignes d'aide de l'écran (même source que l'appli) → fragments d'une phrase. */
function fragmentsLignes(lignes: LigneAide[]): FragmentConsigne[] {
  return lignes.flatMap((l, i) => {
    const f: FragmentConsigne[] = [];
    if (i > 0) f.push(texte(" "));
    if (l.texte) f.push(texte(l.texte));
    if (l.latex) f.push(latex(l.latex));
    if (l.texteApres) f.push(texte(l.texteApres));
    return f;
  });
}

function piegeGeometrique(exercice: ExerciceConvergenceGeometrique): string {
  const q = exercice.q.num / exercice.q.den;
  switch (exercice.classification) {
    case "divergeMoinsInfini":
      return "Avec q > 1, la suite ne diverge pas toujours vers +∞ : c'est le signe de u₁ qui décide (ici u₁ < 0, donc −∞).";
    case "oscilleNeConvergePas":
      return "q = −1 : la suite reste bornée (elle oscille entre u₁ et −u₁) mais ne converge pas.";
    case "oscilleDivergeSansLimite":
      return "q < −1 : les termes changent de signe et grandissent en valeur absolue — ni +∞ ni −∞, la suite n'a pas de limite.";
    case "convergeVersZero":
      return q < 0 ? "q est négatif, mais |q| < 1 : les termes alternent de signe et tendent quand même vers 0." : "C'est |q| qu'on compare à 1 : ici |q| < 1, les termes se rapprochent de 0.";
    default:
      return "C'est |q| qu'on compare à 1, puis le signe de q (et celui de u₁ si q > 1).";
  }
}

function correctionDetailleeConvergenceSuite(exercice: ExerciceConvergenceSuite): EtapeCorrection[] {
  const libelle = libelleClassificationAttendue(exercice, phaseConclusion(exercice));
  const lim = limiteLatex(exercice);
  const conclusion: FragmentConsigne[] = lim === null ? [texte(`${libelle} : la suite n'a pas de limite.`)] : [texte(`${libelle} : `), latex(lim), texte(".")];
  if (exercice.variante === "arithmetique") {
    return [
      { label: "Méthode", sousQuestion: "a", fragments: fragmentsLignes(lignesAideNiveau1(exercice, "classificationArithmetique")) },
      { label: "Lecture", sousQuestion: "a", fragments: [latex(raisonArithmetiqueLatex(exercice))] },
      { label: "Conclusion", sousQuestion: "a", fragments: conclusion },
      {
        label: "Piège",
        sousQuestion: "a",
        fragments: [texte(exercice.r === 0 ? "r = 0 : la suite est constante — elle converge (vers u₁), même si elle « ne bouge pas »." : "Une suite arithmétique de raison non nulle n'a jamais de limite finie : elle ne converge pas, même si sa raison est petite.")],
      },
    ];
  }
  if (exercice.variante === "geometrique") {
    return [
      { label: "Méthode", sousQuestion: "a", fragments: fragmentsLignes(lignesAideNiveau1(exercice, "classificationGeometrique")) },
      { label: "Lecture", sousQuestion: "a", fragments: [latex(raisonGeometriqueLatex(exercice))] },
      { label: "Conclusion", sousQuestion: "a", fragments: conclusion },
      { label: "Piège", sousQuestion: "a", fragments: [texte(piegeGeometrique(exercice))] },
    ];
  }
  const exo: ExerciceConvergenceQuelconque = exercice;
  const calculLimite: EtapeCorrection[] =
    exo.classification === "limiteValeur"
      ? [{ label: "Calcul", sousQuestion: "b", fragments: [texte("Quotient des coefficients dominants : "), latex(texteAideNiveau2(exo, "classifierQuelconque"))] }]
      : [];
  return [
    { label: "Méthode", sousQuestion: "a", fragments: fragmentsLignes([...lignesAideNiveau1(exo, "diviserQuelconque"), ...lignesAideNiveau2(exo, "diviserQuelconque")]) },
    { label: "Calcul", sousQuestion: "a", fragments: [latex(formatExpressionDiviseeLatex(exo))] },
    { label: "Piège", sousQuestion: "a", fragments: [texte("On divise par la plus haute puissance du dénominateur, pas du numérateur : sinon le dénominateur tend vers 0 et on ne peut pas conclure.")] },
    { label: "Méthode", sousQuestion: "b", fragments: fragmentsLignes(lignesAideNiveau1(exo, "classifierQuelconque")) },
    ...calculLimite,
    { label: "Conclusion", sousQuestion: "b", fragments: conclusion },
  ];
}

function baremeConvergenceSuite(exercice: ExerciceConvergenceSuite): BaremeExercice {
  const lim = limiteLatex(exercice);
  const libelle = libelleClassificationAttendue(exercice, phaseConclusion(exercice));
  const critereConclusion: FragmentConsigne[] = lim === null ? [texte(`Conclusion : ${libelle.toLowerCase()} (pas de limite)`)] : [texte(`Conclusion : ${libelle.toLowerCase()}, `), latex(lim)];
  let criteres: CritereBareme[];
  const erreurs: ErreurFrequente[] = [];
  const acceptees: FragmentConsigne[][] = [];
  if (exercice.variante === "arithmetique") {
    criteres = [
      { sousQuestion: "a", critere: [texte("Signe de la raison identifié : "), latex(`r = ${exercice.r}`)], points: 1.5 },
      { sousQuestion: "a", critere: [texte("Justification par la propriété du cours (r > 0, r < 0 ou r = 0)")], points: 1 },
      { sousQuestion: "a", critere: critereConclusion, points: 1.5 },
    ];
    erreurs.push({ description: [texte("Confondre « croissante » ou « décroissante » avec « converge »")], cout: "0 pt sur la conclusion" });
  } else if (exercice.variante === "geometrique") {
    criteres = [
      { sousQuestion: "a", critere: [texte("Position de q par rapport à −1 et 1 : "), latex(formatTermesDonneesLatex(exercice)[1])], points: 1.5 },
      { sousQuestion: "a", critere: [texte("Justification par la propriété du cours (et signe de u₁ si q > 1)")], points: 1 },
      { sousQuestion: "a", critere: critereConclusion, points: 1.5 },
    ];
    erreurs.push({ description: [texte("Comparer q à 1 au lieu de |q| (q négatif)")], cout: "0 pt sur la conclusion" });
    if (exercice.classification === "divergeMoinsInfini") erreurs.push({ description: [texte("Annoncer +∞ sans tenir compte du signe de u₁")], cout: "−1" });
    if (exercice.classification === "oscilleNeConvergePas") erreurs.push({ description: [texte("Dire que la suite converge parce qu'elle est bornée")], cout: "0 pt sur la conclusion" });
  } else {
    criteres = [
      { sousQuestion: "a", critere: [texte("Division par la plus haute puissance du dénominateur, "), latex(exercice.degQ === 2 ? "n^2" : "n")], points: 1.5 },
      { sousQuestion: "b", critere: [texte("Termes en "), latex("\\dfrac{1}{n}"), texte(" qui tendent vers 0, limite de chaque partie")], points: 1 },
      { sousQuestion: "b", critere: critereConclusion, points: 1.5 },
    ];
    erreurs.push({ description: [texte("Diviser par la plus haute puissance du numérateur")], cout: "0 pt sur a)" });
    if (exercice.classification === "limiteValeur") acceptees.push([texte("Limite donnée en valeur décimale arrondie au centième")]);
    if (exercice.classification === "divergePlusInfini" || exercice.classification === "divergeMoinsInfini") erreurs.push({ description: [texte("Oublier le signe de la divergence (signe du quotient des coefficients dominants)")], cout: "−0,5" });
  }
  return { reponseFinale: reponseBreveConvergenceSuite(exercice), criteres, erreursFrequentes: erreurs, reponsesAcceptees: acceptees };
}

function difficulteConvergenceSuite(exercice: ExerciceConvergenceSuite): 1 | 2 | 3 {
  if (exercice.variante === "arithmetique") return 1;
  if (exercice.variante === "geometrique") return exercice.classification === "convergeVersU1" || exercice.classification === "divergePlusInfini" ? 1 : 2;
  return exercice.classification === "limiteValeur" ? 2 : 3;
}

function construireCorrectionConvergenceSuite(exercice: ExerciceConvergenceSuite): BlocCorrection[] {
  if (exercice.variante === "arithmetique") {
    return [
      {
        type: "paragraphe",
        fragments: [texte(`Réponse : ${libelleClassificationAttendue(exercice, "classificationArithmetique")}. `), latex(raisonArithmetiqueLatex(exercice))],
      },
    ];
  }
  if (exercice.variante === "geometrique") {
    return [
      {
        type: "paragraphe",
        fragments: [texte(`Réponse : ${libelleClassificationAttendue(exercice, "classificationGeometrique")}. `), latex(raisonGeometriqueLatex(exercice))],
      },
    ];
  }

  const exo: ExerciceConvergenceQuelconque = exercice;
  const blocA: BlocCorrection = { type: "paragraphe", fragments: [texte("a) "), latex(formatExpressionDiviseeLatex(exo))] };

  const labelB = libelleClassificationAttendue(exo, "classifierQuelconque");
  const justificationB = exo.classification === "limiteValeur" ? texteAideNiveau2(exo, "classifierQuelconque") : texteAideNiveau1(exo, "classifierQuelconque");
  const blocB: BlocCorrection = { type: "paragraphe", fragments: [texte(`b) Réponse : ${labelB}. `), latex(justificationB)] };

  return [blocA, blocB];
}

export const adaptateurEvaluationConvergenceSuites: AdaptateurFeuilleExercices<ExerciceConvergenceSuite> = {
  titreDocument: "Convergence et divergence des suites — Évaluation",
  nomFichierBase: "convergence-suites",
  genererInstance: genererExerciceConvergenceSuite,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as VarianteConvergenceSuite),
  construireEnonce: construireEnonceConvergenceSuite,
  construireCorrection: construireCorrectionConvergenceSuite,
  difficulte: difficulteConvergenceSuite,
  reponseBreve: reponseBreveConvergenceSuite,
  correctionDetaillee: correctionDetailleeConvergenceSuite,
  bareme: baremeConvergenceSuite,
  enoncePapier: enoncePapierConvergenceSuite,
  dureeMinutes: 4,
  // NON regroupable : la variante "quelconque" produit 2 questions par instance (les 2 autres n'en
  // ont qu'1), condition explicitement exclue par `AdaptateurFeuilleExercices.regroupable`.
};
