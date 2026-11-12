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
  EnoncePapier,
  EtapeCorrection,
  FragmentConsigne,
  QuestionExercice,
  SectionExercice,
} from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { phasesPourExercice } from "../../moteur6e/typesProbabilitesProblemes";
import type { PhaseProbabilitesProblemes } from "../../moteur6e/typesProbabilitesProblemes";
import { affirmationFEstVraie, configurationsExactementK, valeurAlternativeF } from "../../moteur6e/verificationProbabilitesProblemes";
import {
  PRECISION,
  PRECISION_FIABILITE,
  aideNiveau1,
  aideNiveau2,
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
import { arbreBayesSvg, arbreCheminsSvg, cheminsAKSucces, deuxSchemasHtml, schemaMontageSvg } from "../../ui6e/figureProbabilitesProblemes";
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

interface ContenuEtape {
  methode: FragmentConsigne[];
  calcul?: string;
  piege?: string;
  figure?: string;
}

/** Aide de niveau 1 de l'écran, en fragments (texte puis formule éventuelle). */
function aide1(exercice: ExerciceProbabilitesProblemes, phase: PhaseProbabilitesProblemes): FragmentConsigne[] {
  const a = aideNiveau1(exercice, phase);
  return a.latex === null ? [t(a.texte)] : [t(`${a.texte} `), f(a.latex)];
}
/** Calcul posé de l'aide de niveau 2 de l'écran (même source que l'écran). */
function calcul2(exercice: ExerciceProbabilitesProblemes, phase: PhaseProbabilitesProblemes): string | undefined {
  return aideNiveau2(exercice, phase).latex ?? undefined;
}

function contenuA(e: ExerciceFamilleA, phase: PhaseProbabilitesProblemes): ContenuEtape {
  if (phase === "aEcran1") {
    return {
      methode: [t("On numérote les personnes. Quand les k premières ont des anniversaires tous différents, la personne numéro k + 1 doit éviter k jours sur 365 : la probabilité de cet événement vaut "), f("\\dfrac{365-k}{365}"), t(".")],
    };
  }
  if (phase === "aEcran2") return { methode: [t("Règle du produit le long du chemin de l'arbre (une personne après l'autre) : on multiplie les facteurs.")], calcul: calcul2(e, phase) };
  return {
    methode: aide1(e, phase),
    calcul: calcul2(e, phase),
    piege: "Chercher « au moins deux le même jour » directement : il y a beaucoup trop de cas ; on passe par l'événement contraire « tous différents ».",
  };
}

function branches(nombre: number): string {
  return nombre === 1 ? "1 branche" : `${nombre} branches`;
}

function contenuB(e: ExerciceFamilleB, phase: PhaseProbabilitesProblemes): ContenuEtape {
  if (phase === "bEcran1") {
    const chemins = cheminsAKSucces(e.n, e.k);
    return {
      methode: [t(`Chaque chemin de l'arbre est une suite de ${e.n} résultats, succès (S) ou échec (É). On énumère, avec méthode, ceux qui comportent exactement ${e.k} succès :`)],
      calcul: chemins.map((m) => `\\text{${m}}`).join(",\\ "),
      figure: arbreCheminsSvg(e.n, e.k, nombreLatex(e.p).replace("{,}", ","), nombreLatex(1 - e.p).replace("{,}", ",")),
    };
  }
  if (phase === "bEcran2") {
    return {
      methode: [t(`Règle du produit : chacun de ces chemins passe par ${branches(e.k)} de probabilité p et ${branches(e.n - e.k)} de probabilité 1 − p, donc ils ont tous la même probabilité ; on additionne ces probabilités, c'est-à-dire qu'on multiplie par le nombre de chemins.`)],
      calcul: calcul2(e, phase),
      piege: "Oublier de multiplier par le nombre de chemins : un seul chemin ne donne pas « exactement k succès ».",
    };
  }
  return {
    methode: aide1(e, phase),
    calcul: calcul2(e, phase),
    piege: e.demandeEcran3 === "auMoinsK" ? `Confondre « au moins ${e.k} » et « exactement ${e.k} », ou oublier le cas « ${e.n} succès ».` : "Ne retirer que « que des succès » et oublier « que des échecs ».",
  };
}

function contenuC(e: ExerciceFamilleC, phase: PhaseProbabilitesProblemes): ContenuEtape {
  const configs = configurationsExactementK(e.k);
  if (phase === "cEcran1") return { methode: aide1(e, phase) };
  if (phase === "cEcran2") {
    const lignes = configs.map((c) => {
      const facteurs = [0, 1, 2].map((i) => (c.includes(i) ? nombreLatex(e.p[i]) : `(1-${nombreLatex(e.p[i])})`));
      return `P(\\{${c.map((i) => i + 1).join("\\,;\\,")}\\})=${facteurs.join("\\cdot ")}`;
    });
    return { methode: aide1(e, phase), calcul: `\\begin{gathered}${lignes.join("\\\\")}\\end{gathered}`, piege: "Oublier le facteur 1 − pᵢ des éléments non concernés." };
  }
  return {
    methode: aide1(e, phase),
    calcul: calcul2(e, phase),
    piege: "Appliquer la règle des épreuves répétées avec une probabilité moyenne : les trois probabilités sont différentes, chaque configuration a sa propre probabilité.",
  };
}

function contenuE(e: ExerciceFamilleEMixte, phase: PhaseProbabilitesProblemes): ContenuEtape {
  if (phase === "eMixteEcran1") return { methode: aide1(e, phase) };
  if (phase === "eMixteEcran2") {
    // Les 4 chemins et P(E) posés (l'aide de l'écran n'en montre qu'un).
    const { p, q1, q2 } = e.base;
    const [P, Q1, Q2] = [p, q1, q2].map((v) => nombreLatex(v));
    const calcul =
      `\\begin{gathered}P(c_1\\cap E)=${P}\\cdot ${Q1}\\qquad P(c_1\\cap\\overline{E})=${P}\\cdot(1-${Q1})\\\\` +
      `P(c_2\\cap E)=(1-${P})\\cdot ${Q2}\\qquad P(c_2\\cap\\overline{E})=(1-${P})\\cdot(1-${Q2})\\\\` +
      `P(E)=P(c_1\\cap E)+P(c_2\\cap E)\\end{gathered}`;
    return { methode: aide1(e, phase), calcul, figure: arbreBayesSvg(e.base), piege: "Oublier l'un des deux chemins qui mènent à E dans le calcul de P(E)." };
  }
  return { methode: aide1(e, phase), calcul: calcul2(e, phase), piege: "Confondre P(c₁ | E) avec P(E | c₁), qui est une donnée de l'énoncé." };
}

function contenuF(e: ExerciceFamilleF, phase: PhaseProbabilitesProblemes): ContenuEtape {
  if (phase === "fEcran1") return { methode: aide1(e, phase), piege: "Confondre série (produit des fiabilités) et parallèle (1 moins le produit des probabilités de panne)." };
  if (phase === "fEcran2") return { methode: [t("On effectue le calcul posé.")] };
  const verifier = e.demandeEcran3 === "verifierAffirmation";
  return {
    methode: [t(`On identifie le nouveau montage et on applique la même méthode${verifier ? ", puis on compare le résultat, arrondi à 4 décimales, à la valeur affirmée" : ""}.`)],
    calcul: calcul2(e, phase),
  };
}

function contenuG(e: ExerciceFamilleGMelange, phase: PhaseProbabilitesProblemes): ContenuEtape {
  if (phase === "gMelangeEcran1") return { methode: [t("La somme des probabilités des 6 faces du dé de l'urne 1 vaut 1 : une face vaut a, chacune des 5 autres vaut p.")] };
  if (phase === "gMelangeEcran4") return { methode: aide1(e, phase), calcul: calcul2(e, phase), piege: "Additionner les deux probabilités sans les pondérer par la probabilité de choisir chaque urne." };
  return { methode: aide1(e, phase), calcul: calcul2(e, phase) };
}

function contenuEtape(exercice: ExerciceProbabilitesProblemes, phase: PhaseProbabilitesProblemes): ContenuEtape {
  switch (exercice.famille) {
    case "A":
      return contenuA(exercice, phase);
    case "B":
      return contenuB(exercice, phase);
    case "C":
      return contenuC(exercice, phase);
    case "E":
      return contenuE(exercice, phase);
    case "F":
      return contenuF(exercice, phase);
    case "G":
      return contenuG(exercice, phase);
  }
}

function correctionDetaillee(exercice: ExerciceProbabilitesProblemes): EtapeCorrection[] {
  return phasesPourExercice(exercice).flatMap((phase, i) => {
    const sousQuestion = LETTRES[i];
    const contenu = contenuEtape(exercice, phase);
    const etapes: EtapeCorrection[] = [];
    if (contenu.methode.length > 0) etapes.push({ label: "Méthode", sousQuestion, fragments: contenu.methode, ...(contenu.figure ? { figureHtml: contenu.figure } : {}) });
    if (contenu.calcul) etapes.push({ label: "Calcul", sousQuestion, fragments: [f(contenu.calcul)] });
    if (contenu.piege) etapes.push({ label: "Piège", sousQuestion, fragments: [t(contenu.piege)] });
    etapes.push({ label: "Conclusion", sousQuestion, fragments: reponse(exercice, phase) });
    return etapes;
  });
}

// ============================================================================
// Difficulté, réponse brève, barème.
// ============================================================================

function difficulte(exercice: ExerciceProbabilitesProblemes): 1 | 2 | 3 {
  switch (exercice.famille) {
    case "A":
    case "C":
      return 2;
    case "B":
      return exercice.demandeEcran3 === "auMoinsK" && exercice.k >= 2 ? 3 : 2;
    case "E":
    case "G":
      return 3;
    case "F":
      return exercice.configuration === "mixte" || exercice.configurationAlternative === "mixte" ? 3 : 2;
  }
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
  const erreurs = phases.flatMap((phase) => {
    const piege = contenuEtape(exercice, phase).piege;
    return piege ? [{ description: [t(piege)], cout: "−1" }] : [];
  });
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
  difficulte,
  reponseBreve,
  correctionDetaillee,
  bareme,
  enoncePapier,
  dureeMinutes: 12,
  profilInstance: profilProbabilitesProblemes,
  libelleCasParticulier: LIBELLE_CAS_PROBABILITES_PROBLEMES,
  // Anniversaires (produit de facteurs (365 − k)/365), Bayes à données réalistes et fiabilités à
  // 4 décimales : la calculatrice est indispensable pour ces variantes.
  calculatriceIndispensable: VARIANTES_CALCULATRICE,
};
