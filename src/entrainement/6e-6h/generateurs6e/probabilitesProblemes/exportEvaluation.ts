import type {
  ExerciceFamilleA,
  ExerciceFamilleB,
  ExerciceFamilleC,
  ExerciceFamilleEMixte,
  ExerciceFamilleF,
  ExerciceFamilleGMelange,
  ExerciceProbabilitesProblemes,
} from "../../core6e/probabilitesProblemes.types";
import type {
  AdaptateurFeuilleExercices,
  BaremeExercice,
  BlocCorrection,
  CriteresDifficulte,
  EnoncePapier,
  FragmentConsigne,
  QuestionExercice,
  SectionExercice,
} from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { correctionDetailleeProbabilitesProblemes as correctionDetaillee } from "./corrigeDetaille";
import { phasesPourExercice } from "../../moteur6e/typesProbabilitesProblemes";
import type { PhaseProbabilitesProblemes } from "../../moteur6e/typesProbabilitesProblemes";
import { affirmationFEstVraie, valeurAlternativeF } from "../../moteur6e/verificationProbabilitesProblemes";
import {
  PRECISION,
  PRECISION_FIABILITE,
  blocDonnees,
  consigneEcran,
  consigneGenerale,
  descriptionMontage,
  egalite,
  evenementC,
  formatReponseAttenduePhaseLatex,
  nombreLatex,
  phrasesMixte,
} from "../../ui6e/formatProbabilitesProblemes";
import { deuxSchemasHtml, schemaMontageSvg } from "../../ui6e/figureProbabilitesProblemes";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceProbabilitesProblemes } from "./index";
import type { IdVarianteProbabilitesProblemes } from "./index";
import { LIBELLE_CAS_PROBABILITES_PROBLEMES, profilProbabilitesProblemes } from "./profilEvaluation";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceProbabilitesProblemes>` pour `6gen33`
 * (« Probabilités : problèmes ») — feuille d'exercices et évaluation, méthode de
 * `.claude/rules/feuilles-evaluations.md` (refonte de l'audit 6e ch. 6, décision I ; modèle :
 * `integralesProblemes/exportEvaluation.ts`). Générateur de PROCESSUS 3 (résoudre un problème) :
 *
 * - `construireEnonce` : une question par écran du générateur interactif (= une ÉTAPE, lettre a, b…
 *   dans l'ordre des écrans) — ses consignes deviennent les titres « Étape n — … » du corrigé.
 * - `enoncePapier` : le problème en contexte + la consigne globale, SANS les étapes de guidage :
 *   l'élève organise lui-même sa résolution. Seules les vraies questions distinctes restent en a) b) :
 *   B (exactement k succès, puis la seconde probabilité demandée) et F (fiabilité du système, puis
 *   l'autre montage). A, C, E et G n'ont qu'une demande.
 * - Figures : schémas des deux montages dans l'énoncé de F (le texte seul les décrit mal) ; arbre
 *   des chemins (B) et arbre pondéré (E) dans le corrigé — noir et blanc
 *   (`ui6e/figureProbabilitesProblemes.ts`).
 * - Résultats : `formatReponseAttenduePhaseLatex` (ceux de l'appli), valeurs exactes puis « ≈ »
 *   avec l'arrondi annoncé ; les lignes « Calcul » reprennent les aides de l'écran (même source).
 *   Aucun coefficient C(n,k) : le nombre de chemins se compte dans l'arbre (décision G).
 */

const LETTRES = "abcdefgh";

const f = (valeur: string): FragmentConsigne => latex(valeur);
const t = (valeur: string): FragmentConsigne => texte(valeur);
const q = (...fragments: FragmentConsigne[]): QuestionExercice => ({ consigne: fragments });

function reponse(exercice: ExerciceProbabilitesProblemes, phase: PhaseProbabilitesProblemes): FragmentConsigne[] {
  // Vrai/faux de F : sur papier, un verdict rédigé suivi de la fiabilité qui le justifie.
  if (exercice.famille === "F" && phase === "fEcran3" && exercice.demandeEcran3 === "verifierAffirmation") {
    return [t(affirmationFEstVraie(exercice) ? "L'affirmation est vraie : " : "L'affirmation est fausse : "), f(egalite("\\text{fiabilité}", valeurAlternativeF(exercice), 4))];
  }
  return [f(formatReponseAttenduePhaseLatex(exercice, phase).join(",\\quad "))];
}

// ============================================================================
// Énoncé interactif (étapes) — titres des étapes du corrigé.
// ============================================================================

function construireEnonce(exercice: ExerciceProbabilitesProblemes): SectionExercice {
  const donnees = blocDonnees(exercice);
  return {
    enteteFragments: donnees.length > 0 ? [...consigneGenerale(exercice), t(" Données : "), f(donnees.join(",\\quad ")), t(".")] : consigneGenerale(exercice),
    questions: phasesPourExercice(exercice).map((phase) => ({ consigne: consigneEtape(exercice, phase) })),
  };
}

/** Consigne d'une étape (titre « Étape n — … » du corrigé) : celle de l'écran, sauf l'étape 1 de E,
 * dont la consigne d'écran recopie les 3 informations (déjà dans l'énoncé papier) et parle de champs. */
function consigneEtape(exercice: ExerciceProbabilitesProblemes, phase: PhaseProbabilitesProblemes): FragmentConsigne[] {
  if (phase === "eMixteEcran1") return [t("Associe chacune des 3 informations à la bonne probabilité : P(c₁), P(E | c₁) ou P(E | c₂).")];
  return consigneEcran(exercice, phase);
}

/** Corrigé historique (pipelines Word/PDF sans corrigé détaillé) : le résultat de chaque étape. */
function construireCorrection(exercice: ExerciceProbabilitesProblemes): BlocCorrection[] {
  return phasesPourExercice(exercice).map((phase, i) => ({ type: "paragraphe", fragments: [t(`${LETTRES[i]}) `), ...reponse(exercice, phase)] }));
}

// ============================================================================
// Énoncé papier : le problème, sans les étapes de guidage.
// ============================================================================

/** Formules séparées par des points-virgules en prose : une égalité n'est jamais coupée en fin de ligne. */
function listeFormules(formules: string[]): FragmentConsigne[] {
  return formules.flatMap((v, i) => (i === 0 ? [f(v)] : [t(" ; "), f(v)]));
}

function papierA(e: ExerciceFamilleA): EnoncePapier {
  return {
    section: {
      enteteFragments: [
        t(`On réunit ${e.n} personnes. On suppose que les 365 jours de l'année sont équiprobables pour un anniversaire (on ignore le 29 février) et que les anniversaires des différentes personnes sont indépendants. Calcule la probabilité qu'au moins deux de ces personnes aient leur anniversaire le même jour. ${PRECISION}`),
      ],
      questions: [],
    },
  };
}

const NOM_EPREUVES: Record<string, string> = { tir: "tirs", penalty: "penalties", piece: "répétitions" };

function libelleDemandeB(e: ExerciceFamilleB): string {
  return e.demandeEcran3 === "auMoinsK" ? `d'obtenir au moins ${e.k} succès` : "d'obtenir au moins un succès et au moins un échec";
}
function papierB(e: ExerciceFamilleB): EnoncePapier {
  return {
    section: {
      enteteFragments: [
        t(`${e.contexte.texte} On considère `),
        f(`n=${e.n}`),
        t(` épreuves (${NOM_EPREUVES[e.contexte.id] ?? "répétitions"}) ; à chaque épreuve, la probabilité de succès vaut `),
        f(`p=${nombreLatex(e.p)}`),
        t(`. ${PRECISION}`),
      ],
      questions: [q(t(`Calcule la probabilité d'obtenir exactement ${e.k} succès.`)), q(t(`Calcule la probabilité ${libelleDemandeB(e)}.`))],
    },
    etapesParQuestion: [["a", "b"], ["c"]],
    reponseBreve: [t("a) "), ...reponse(e, "bEcran2"), t(" ; b) "), ...reponse(e, "bEcran3")],
  };
}

function papierC(e: ExerciceFamilleC): EnoncePapier {
  return {
    section: {
      enteteFragments: [t(`${e.contexte.texte} Données : `), ...listeFormules(blocDonnees(e)), t(`. Calcule la probabilité de l'événement « ${evenementC(e)} ». ${PRECISION}`)],
      questions: [],
    },
  };
}

function papierE(e: ExerciceFamilleEMixte): EnoncePapier {
  const c = e.base.contexte;
  const phrases = phrasesMixte(e.base);
  const ordre = e.ordreAffichage.map((i) => phrases[i]);
  const question = e.base.demandeEcran3 === "cause1SachantEffet" ? "Calcule la probabilité de c₁ sachant que E s'est produit." : "Calcule la probabilité de c₁ sachant que E ne s'est pas produit.";
  return {
    section: {
      enteteFragments: [
        t(`${c.texte} On note c₁ : « ${c.labelCause1} », c₂ : « ${c.labelCause2} » et E : « ${c.labelEffet} ». On sait que : ${ordre.map((p) => p.charAt(0).toLowerCase() + p.slice(1).replace(/\.$/, "")).join(" ; ")}. ${question} ${PRECISION}`),
      ],
      questions: [],
    },
  };
}

function papierF(e: ExerciceFamilleF): EnoncePapier {
  const labels = e.contexte.labelComposants;
  const nouveau = `On monte maintenant les mêmes composants autrement (second schéma) : ${descriptionMontage(e, e.configurationAlternative, e.positionMixteAlternative)}.`;
  const derniere =
    e.demandeEcran3 === "comparerValeur"
      ? q(t(`${nouveau} Calcule la fiabilité de ce nouveau montage.`))
      : q(t(`${nouveau} Un technicien affirme : « La fiabilité de ce nouveau montage, arrondie à 4 décimales, vaut ${(e.affirmationValeur ?? 0).toFixed(4).replace(".", ",")}. » Vérifie cette affirmation. Justifie.`));
  return {
    section: {
      enteteFragments: [
        t(`${e.contexte.texte} Ils sont montés comme sur le premier schéma : ${descriptionMontage(e, e.configuration, e.positionMixte)}. Données : `),
        ...listeFormules(blocDonnees(e)),
        t(`. ${PRECISION_FIABILITE}`),
      ],
      enteteHtml: deuxSchemasHtml(
        { svg: schemaMontageSvg(labels, e.configuration, e.positionMixte, "Montage du système"), legende: "Montage du système" },
        { svg: schemaMontageSvg(labels, e.configurationAlternative, e.positionMixteAlternative, "Nouveau montage"), legende: "Nouveau montage (question b)" },
      ),
      questions: [q(t("Calcule la fiabilité de ce système.")), derniere],
    },
    etapesParQuestion: [["a", "b"], ["c"]],
    reponseBreve: [t("a) "), ...reponse(e, "fEcran2"), t(" ; b) "), ...reponse(e, "fEcran3")],
  };
}

function papierG(e: ExerciceFamilleGMelange): EnoncePapier {
  const { faceSpeciale, autreFace } = e.base;
  return {
    section: {
      enteteFragments: [
        t(
          `On choisit une urne parmi deux, puis on lance le dé à 6 faces qu'elle contient. Le dé de l'urne 1 est truqué : la face ${faceSpeciale} a une probabilité connue, notée a, et les 5 autres faces ont toutes la même probabilité, notée p, inconnue. Données : `,
        ),
        ...listeFormules(blocDonnees(e)),
        t(`. Calcule la probabilité d'obtenir la face ${faceSpeciale} ou la face ${autreFace}. ${PRECISION}`),
      ],
      questions: [],
    },
  };
}

function enoncePapier(exercice: ExerciceProbabilitesProblemes): EnoncePapier {
  switch (exercice.famille) {
    case "A":
      return papierA(exercice);
    case "B":
      return papierB(exercice);
    case "C":
      return papierC(exercice);
    case "E":
      return papierE(exercice);
    case "F":
      return papierF(exercice);
    case "G":
      return papierG(exercice);
  }
}

// ============================================================================
// Corrigé détaillé : par étape, Méthode, Calcul, Piège éventuel, Conclusion.
// ============================================================================












// ============================================================================
// Difficulté, réponse brève, barème.
// ============================================================================


/** Niveau (`niveauDifficulte.ts`) : une étape par écran ; méthode 2 (problème : l'élève construit
 * lui-même le modèle — arbre des épreuves, configurations, arbre de Bayes, montage, urnes) ; piège
 * dans les données : E (données présentées dans le désordre, sens des conditionnelles) et F
 * « vérifier » (valeur affirmée issue d'une confusion série / parallèle, posée que l'affirmation soit
 * vraie ou fausse) ; nombres : profil `calcul` (calculatrice). */
function criteresDifficulte(exercice: ExerciceProbabilitesProblemes): CriteresDifficulte {
  const piege = exercice.famille === "E" || (exercice.famille === "F" && exercice.demandeEcran3 === "verifierAffirmation") ? 1 : 0;
  return { ...etapesDuCorrige(correctionDetaillee(exercice)), methode: 2, piege, nombres: profilProbabilitesProblemes(exercice).calcul === "calculatrice" ? 1 : 0 };
}

function reponseBreve(exercice: ExerciceProbabilitesProblemes): FragmentConsigne[] {
  const papier = enoncePapier(exercice);
  if (papier.reponseBreve) return papier.reponseBreve;
  const phases = phasesPourExercice(exercice);
  return reponse(exercice, phases[phases.length - 1]);
}

/** Poids des étapes (total 4, aucun critère sous 0,5) : l'étape principale du problème pèse plus. */
function poids(exercice: ExerciceProbabilitesProblemes): number[] {
  switch (exercice.famille) {
    case "A":
      return [1.5, 1.5, 1];
    case "B":
    case "C":
      return [1, 1.5, 1.5];
    case "E":
      return [1, 2, 1];
    case "F":
      return [1.5, 1, 1.5];
    case "G":
      return [1, 1, 1, 1];
  }
}

function bareme(exercice: ExerciceProbabilitesProblemes): BaremeExercice {
  const phases = phasesPourExercice(exercice);
  const w = poids(exercice);
  const erreurs = correctionDetaillee(exercice)
    .filter((l) => l.type === "piege")
    .map((l) => ({ description: l.fragments, cout: "−1" }));
  erreurs.push({ description: [t("Arrondir trop tôt une valeur intermédiaire (écart sur le résultat final)")], cout: "−0,5" });
  const acceptees: FragmentConsigne[][] = [
    exercice.famille === "F"
      ? [t("Fiabilité sous forme exacte ou arrondie à 4 décimales")]
      : [t("Valeur exacte (fraction, produit) ou arrondie au centième (au millième si elle est inférieure à 0,1), ou pourcentage équivalent")],
  ];
  if (exercice.famille === "B") acceptees.push([t("Nombre de chemins justifié par l'arbre ou par une liste ordonnée des chemins")]);
  if (exercice.famille === "E") acceptees.push([t("Tableau à double entrée (effectifs sur une population fictive) à la place de l'arbre")]);
  return {
    reponseFinale: reponse(exercice, phases[phases.length - 1]),
    criteres: phases.map((phase, i) => ({ sousQuestion: LETTRES[i], critere: reponse(exercice, phase), points: w[i] })),
    erreursFrequentes: erreurs,
    reponsesAcceptees: acceptees,
  };
}

const VARIANTES_CALCULATRICE: IdVarianteProbabilitesProblemes[] = [
  "A-n4",
  "A-n8",
  "E-mixte-effet",
  "E-mixte-pasEffet",
  "F-serie-comparer",
  "F-serie-verifier",
  "F-parallele-comparer",
  "F-parallele-verifier",
  "F-mixte-comparer",
  "F-mixte-verifier",
];

export const adaptateurEvaluationProbabilitesProblemes: AdaptateurFeuilleExercices<ExerciceProbabilitesProblemes> = {
  titreDocument: "Probabilités : problèmes — Évaluation",
  nomFichierBase: "probabilites-problemes",
  genererInstance: genererExerciceProbabilitesProblemes,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as IdVarianteProbabilitesProblemes),
  construireEnonce,
  construireCorrection,
  reponseBreve,
  correctionDetaillee,
  criteresDifficulte,
  bareme,
  enoncePapier,
  profilInstance: profilProbabilitesProblemes,
  libelleCasParticulier: LIBELLE_CAS_PROBABILITES_PROBLEMES,
  // Anniversaires (produit de facteurs (365 − k)/365), Bayes à données réalistes et fiabilités à
  // 4 décimales : la calculatrice est indispensable pour ces variantes.
  calculatriceIndispensable: VARIANTES_CALCULATRICE,
};
