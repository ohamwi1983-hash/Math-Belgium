import type { ExerciceFamilleA, ExerciceFamilleC, ExerciceProbabilitesEnsembles } from "../../core6e/probabilitesEnsembles.types";
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
import { phasesPourExercice } from "../../moteur6e/typesProbabilitesEnsembles";
import { relationPaireEcran3 } from "../../moteur6e/verificationProbabilitesEnsembles";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { LATEX_EVENEMENT_A, casesA as cases, correctionDetailleeProbabilitesEnsembles, lettreEcranProbabilitesEnsembles, tableauEnonceA, vennC, verdictProbabilitesEnsembles } from "./corrigeDetaille";
import { latexConditionnelleC, latexDemandeC, phraseConditionnelleC, phraseDemandeC, reponseC, zoneL } from "../../ui6e/formatVennTrois";
import { ZONES_ECRAN1_C, ZONES_ECRAN2_C, effectifInterC, fractionEcran3C, fractionEcran4C } from "../../moteur6e/verificationVennTrois";
import { listeEt } from "../../ui6e/corrigeProbabilites";
import {
  LIBELLE_PHASE,
  blocDonnees,
  consigneEcran,
  consigneGenerale,
  formatFractionLatex,
  formatProbaLatex,
  formatReponseAttenduePhaseLatex,
  libelleChoixCorrect,
} from "../../ui6e/formatProbabilitesEnsembles";
import { LIBELLE_CAS_PROBABILITES_ENSEMBLES, profilProbabilitesEnsembles } from "../profilsEvaluationProbabilitesEnsembles";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceProbabilitesEnsembles } from "./index";
import type { IdVarianteProbabilitesEnsembles } from "./index";

/**
 * Adaptateur feuille d'exercices / évaluation de `6gen30` (Probabilités et ensembles) — méthode
 * `.claude/rules/feuilles-evaluations.md` (refonte, décision I de l'audit 6e ch. 6).
 *
 * - Énoncé papier = situation + données + UNE consigne globale (avec la précision attendue) ; pour la
 *   famille A, le tableau à double entrée des données (cases à compléter vides) en `enteteHtml`, les
 *   données restant aussi écrites en clair pour les exports sans figure (Word/PDF). Les écrans
 *   (`phasesPourExercice`, `consigneEcran`) deviennent les étapes « Étape n » du corrigé.
 * - Écran à choix → sur papier une question « …? Justifie. » ; le corrigé donne le libellé correct
 *   (`libelleChoixCorrect`) et la justification de `formatReponseAttenduePhaseLatex`.
 * - Toutes les valeurs : fractions exactes d'effectifs entiers (`formatFractionLatex`), puis
 *   « ≈ décimal » arrondi comme annoncé (`formatProbaLatex`) — les MÊMES fonctions que l'écran.
 * - Corrigé : tableau complet et diagramme de Venn en `figureHtml`.
 * - Version aménagée : même énoncé (contrat du pipeline).
 */

type Ex = ExerciceProbabilitesEnsembles;

const LETTRES = "abcdefghij";

const lettre = lettreEcranProbabilitesEnsembles;

/** Même règle que `diagnostiquerProbabilite` et que la consigne des écrans de saisie. */
const PRECISION = " Donne chaque probabilité sous forme exacte, ou décimale arrondie au centième (au millième si elle est inférieure à 0,1), ou en pourcentage.";

const LATEX_EVENEMENT = LATEX_EVENEMENT_A;

const frac = (n: number, d: number) => formatFractionLatex(n, d);
const proba = (n: number, d: number) => formatProbaLatex(n, d);

// ============================================================================
// Énoncé
// ============================================================================

function questionEtape3(e: Exclude<Ex, ExerciceFamilleC>): FragmentConsigne[] {
  if (e.famille === "B") return [texte(" Enfin, "), latex("A"), texte(" et "), latex("B"), texte(" sont-ils indépendants ? Justifie par un calcul.")];
  if (e.sousTypeEcran3 === "relation" && e.paireEcran3) {
    const [x, y] = e.paireEcran3;
    return [texte(" Enfin, les événements "), latex(LATEX_EVENEMENT[x]), texte(" et "), latex(LATEX_EVENEMENT[y]), texte(" sont-ils incompatibles, indépendants, ou ni l'un ni l'autre ? Justifie.")];
  }
  return [texte(" Enfin, compare "), latex("P(A|\\overline{B})"), texte(" et "), latex("P(A|B)"), texte(" : laquelle est la plus grande, ou sont-elles égales ? Justifie.")];
}

function latexDemandeA(e: ExerciceFamilleA): string {
  return { AetBbar: "P(A\\cap\\overline{B})", AbaretB: "P(\\overline{A}\\cap B)", condAsachantB: "P(A|B)", condBsachantA: "P(B|A)" }[e.demandeEcran2];
}

function consigneGlobale(e: Ex): FragmentConsigne[] {
  if (e.famille === "C") {
    return [texte(" Complète le diagramme de Venn (effectif de chaque zone), en partant du centre. Calcule ensuite "), ...(phraseDemandeC(e) as FragmentConsigne[]), texte(", puis "), ...(phraseConditionnelleC(e) as FragmentConsigne[]), texte("."), texte(PRECISION)];
  }
  if (e.famille === "A") {
    const debut: FragmentConsigne[] =
      e.troisiemeDonnee === "PAetB"
        ? [texte(" Calcule "), latex("P(A\\cup B)"), texte(", puis les probabilités inconnues (« ? ») du tableau à double entrée.")]
        : e.troisiemeDonnee === "PAouB"
          ? [texte(" Déduis-en "), latex("P(A\\cap B)"), texte(", puis calcule les probabilités inconnues (« ? ») du tableau à double entrée.")]
          : [texte(" Déduis-en "), latex("P(A\\cup B)"), texte(" puis "), latex("P(A\\cap B)"), texte(", et calcule les probabilités inconnues (« ? ») du tableau à double entrée.")];
    return [...debut, texte(" Calcule ensuite "), latex(latexDemandeA(e)), texte("."), ...questionEtape3(e), texte(PRECISION)];
  }
  const ope = e.demandeEcran2 === "intersection" ? "P(A\\cap B)" : "P(A\\cup B)";
  return [texte(" Calcule "), latex("P(A)"), texte(" et "), latex("P(B)"), texte(", puis "), latex(ope), texte(" et la probabilité conditionnelle "), latex("P(A|B)"), texte("."), ...questionEtape3(e), texte(PRECISION)];
}

/** Données en formules séparées (famille C : huit données, une formule affichée unique sortait de la
 * colonne) ; familles A et B : la liste d'origine. */
function donnees(e: Ex): FragmentConsigne[] {
  if (e.famille === "C") return [texte(" Données : "), ...listeEt(blocDonnees(e)), texte(".")];
  return [texte(" Données : "), latex(`${blocDonnees(e).join(",\\quad ")}.`)];
}

function entetePapier(e: Ex): FragmentConsigne[] {
  if (e.famille === "C") return [...(consigneGenerale(e) as FragmentConsigne[]), ...donnees(e), ...consigneGlobale(e)];
  return [...(consigneGenerale(e) as FragmentConsigne[]), texte(" Données : "), latex(`${blocDonnees(e).join(",\\quad ")}.`), ...consigneGlobale(e)];
}

function figureEnonce(e: Ex): string | undefined {
  if (e.famille === "C") return vennC(e, []);
  return e.famille === "A" ? tableauEnonceA(e) : undefined;
}

/** Énoncé « par écrans » : ses questions donnent les titres d'étapes du corrigé (« Étape n — … »). */
function construireEnonce(e: Ex): SectionExercice {
  return {
    enteteFragments: [...(consigneGenerale(e) as FragmentConsigne[]), ...donnees(e)],
    ...(e.famille === "C" ? { enteteHtml: vennC(e, []) } : {}),
    questions: phasesPourExercice(e).map((phase) => ({ consigne: consigneEcran(e, phase) as FragmentConsigne[] })),
  };
}

function enoncePapier(e: Ex): EnoncePapier {
  return { section: { enteteFragments: entetePapier(e), enteteHtml: figureEnonce(e), questions: [] } };
}

function construireCorrection(e: Ex): BlocCorrection[] {
  return phasesPourExercice(e).map((phase, i) => {
    const libelle = libelleChoixCorrect(e, phase);
    return {
      type: "paragraphe",
      fragments: [texte(`${LETTRES[i]}) ${LIBELLE_PHASE[phase]} : `), ...(libelle ? [texte(`${libelle}. `)] : []), latex(formatReponseAttenduePhaseLatex(e, phase).join(",\\quad "))],
    };
  });
}

// ============================================================================
// Réponse brève, difficulté, barème
// ============================================================================

const verdict = verdictProbabilitesEnsembles;

function reponseBreve(e: Ex): FragmentConsigne[] {
  if (e.famille === "C") return [...listeEt([...reponseC(e, "cEcran1"), ...reponseC(e, "cEcran2")]), texte(" ; "), latex(reponseC(e, "cEcran3")[0]), texte(" ; "), latex(reponseC(e, "cEcran4")[0])];
  if (e.famille === "A") {
    const N = e.denominateur;
    const c = cases(e);
    const etape1 = e.troisiemeDonnee === "PAetB" ? `P(A\\cup B)=${proba(c.AouB, N)}` : `P(A\\cap B)=${proba(c.AB, N)}`;
    const [etape2] = formatReponseAttenduePhaseLatex(e, "aEcran2");
    return [latex(etape1), texte(" ; "), latex(etape2), texte(" ; "), ...verdict(e)];
  }
  const [pA, pB] = formatReponseAttenduePhaseLatex(e, "bEcran1");
  const [ope] = formatReponseAttenduePhaseLatex(e, "bEcran2");
  const [cond] = formatReponseAttenduePhaseLatex(e, "bEcran3");
  return [latex(pA), texte(" ; "), latex(pB), texte(" ; "), latex(ope), texte(" ; "), latex(cond), texte(" ; "), ...verdict(e)];
}

/** Niveau (décision de l'utilisateur, `niveauDifficulte.ts`) : une étape par écran ; l'étape 2 de
 * la famille A est une LECTURE quand elle demande une case déjà calculée (P(A∩B̄), P(Ā∩B)).
 * Méthode 1 (choisir parmi les outils du cours : inclusion-exclusion, tableau, conditionnelle,
 * test d'indépendance). Étape du verdict sans charge. Aucun piège dans les données (verdict jamais noté). Nombres 0 : fractions
 * exactes d'effectifs, la valeur décimale n'est qu'une écriture équivalente. */
function criteresDifficulte(e: Ex): CriteresDifficulte {
  if (e.famille === "C") {
    // Venn à trois ensembles : quatre étapes qui transforment, méthode 1 (imposée sur l'écran,
    // « complète le diagramme » sur papier), piège 1 dans les données (chaque intersection donnée
    // contient le centre : la zone « deux seulement » n'est pas l'intersection), nombres 0.
    // Étapes 1 et 2 : le même calcul répété pour trois zones (« termes proches ») → sans charge.
    return { ...etapesDuCorrige(correctionDetailleeProbabilitesEnsembles(e)), lettresSansCharge: [lettre(e, "cEcran1"), lettre(e, "cEcran2")], methode: 1, piege: 1, nombres: 0 };
  }
  const lecture = e.famille === "A" && (e.demandeEcran2 === "AetBbar" || e.demandeEcran2 === "AbaretB") ? [lettre(e, "aEcran2")] : [];
  const base = etapesDuCorrige(correctionDetailleeProbabilitesEnsembles(e), lecture);
  // Étape du verdict sans charge : sa longueur dépend de l'issue (fractions simplifiables ou non),
  // niveau et durée restent ainsi constants dans un verdict.
  const verdict = lettre(e, e.famille === "A" ? "aEcran3" : "bEcran4");
  return { ...base, lettresSansCharge: [...(base.lettresSansCharge ?? []), verdict], methode: 1, piege: 0, nombres: 0 };
}

const crit = (sousQuestion: string, points: number, ...critere: FragmentConsigne[]): CritereBareme => ({ sousQuestion, points, critere });

function baremeC(e: ExerciceFamilleC): BaremeExercice {
  const [L1, L2, L3, L4] = (["cEcran1", "cEcran2", "cEcran3", "cEcran4"] as const).map((ph) => lettre(e, ph));
  const [n3, d3] = fractionEcran3C(e);
  const [n4, d4] = fractionEcran4C(e);
  return {
    reponseFinale: reponseBreve(e),
    criteres: [
      crit(L1, 1, texte("Centre et zones « deux seulement » (intersection moins le centre) : "), latex(ZONES_ECRAN1_C.map((z) => e.zones[z]).join(",\\ "))),
      crit(L2, 1, texte("Zones « un seul » et extérieur : "), latex(ZONES_ECRAN2_C.map((z) => e.zones[z]).join(",\\ "))),
      crit(L3, 1, latex(`${latexDemandeC(e)}=${frac(n3, d3)}`)),
      crit(L4, 1, latex(`${latexConditionnelleC(e)}=${frac(n4, d4)}`), texte(" (dénominateur : effectif de la condition)")),
    ],
    erreursFrequentes: [
      { description: [texte("Intersection donnée écrite dans la zone « deux seulement », par exemple "), latex(`n(${zoneL("110")})=${effectifInterC(e, 0, 1)}`), texte(" (centre compté deux fois)")], cout: "−0,5 par zone" },
      { description: [texte("Extérieur calculé par "), latex("N-n(A)-n(B)-n(C)")], cout: "−0,5" },
      { description: [texte("Probabilité conditionnelle divisée par l'effectif total")], cout: "0 pt sur l'étape 4" },
    ],
    reponsesAcceptees: [[texte("Fractions non simplifiées, décimaux arrondis au centième (au millième sous 0,1) ou pourcentages ; zones remplies dans un autre ordre si les effectifs sont justes")]],
  };
}

function bareme(e: Ex): BaremeExercice {
  if (e.famille === "C") return baremeC(e);
  if (e.famille === "A") {
    const N = e.denominateur;
    const c = cases(e);
    const [L1, L2, L3] = (["aEcran1", "aEcran2", "aEcran3"] as const).map((p) => lettre(e, p));
    const deduit = e.troisiemeDonnee === "PAetB" ? `P(A\\cup B)=${frac(c.AouB, N)}` : `P(A\\cap B)=${frac(c.AB, N)}`;
    const [etape2] = formatReponseAttenduePhaseLatex(e, "aEcran2");
    const critere3: FragmentConsigne[] =
      e.sousTypeEcran3 !== "relation"
        ? [texte("Les deux probabilités conditionnelles calculées (dénominateurs "), latex("P(\\overline{B})"), texte(" et "), latex("P(B)"), texte(")")]
        : relationPaireEcran3(e) === "incompatibles"
          ? [texte("Intersection reconnue vide : aucune case commune aux deux événements")]
          : [texte("Probabilité de l'intersection et produit des deux probabilités calculés")];
    return {
      reponseFinale: reponseBreve(e),
      criteres: [
        crit(L1, 0.5, texte("Inclusion-exclusion : "), latex(deduit)),
        crit(L1, 1, texte("Tableau complet : "), latex(`${frac(c.AB, N)},\\ ${frac(c.ABb, N)},\\ ${frac(c.AbB, N)},\\ ${frac(c.AbBb, N)}`)),
        crit(L2, 1, latex(etape2)),
        crit(L3, 0.5, ...critere3),
        crit(L3, 1, texte("Conclusion justifiée : "), ...verdict(e)),
      ],
      erreursFrequentes: [
        { description: [latex("P(A\\cup B)=P(A)+P(B)"), texte(" (intersection oubliée)")], cout: "−0,5" },
        e.sousTypeEcran3 === "relation"
          ? { description: [texte("Incompatibles et indépendants confondus")], cout: "0 pt sur la conclusion" }
          : { description: [texte("Probabilité conditionnelle divisée par l'effectif total au lieu du total de la colonne")], cout: "−0,5 par probabilité" },
        { description: [texte("Conclusion sans calcul ni justification")], cout: "0 pt sur la conclusion" },
      ],
      reponsesAcceptees: [[texte("Fractions non simplifiées, décimaux arrondis au centième (au millième sous 0,1) ou pourcentages")]],
    };
  }
  const [L1, L2, L3, L4] = (["bEcran1", "bEcran2", "bEcran3", "bEcran4"] as const).map((p) => lettre(e, p));
  const [pA, pB] = formatReponseAttenduePhaseLatex(e, "bEcran1");
  const [ope] = formatReponseAttenduePhaseLatex(e, "bEcran2");
  const [cond] = formatReponseAttenduePhaseLatex(e, "bEcran3");
  return {
    reponseFinale: reponseBreve(e),
    criteres: [
      crit(L1, 1, latex(`${pA},\\quad ${pB}`)),
      crit(L2, 1, latex(ope)),
      crit(L3, 0.5, latex(cond)),
      crit(L4, 0.5, texte("Produit "), latex("P(A)\\cdot P(B)"), texte(" calculé et comparé à "), latex("P(A\\cap B)")),
      crit(L4, 1, texte("Conclusion justifiée : "), ...verdict(e)),
    ],
    erreursFrequentes: [
      { description: [texte("Effectifs favorables mal dénombrés (issue oubliée ou comptée deux fois)")], cout: "−0,5" },
      { description: [latex("P(A|B)"), texte(" calculée en divisant par "), latex("n(\\Omega)"), texte(" au lieu de "), latex("n(B)")], cout: "0 pt sur cette probabilité" },
      { description: [texte("Indépendance affirmée ou niée sans comparaison chiffrée, ou sur des valeurs arrondies")], cout: "0 pt sur la conclusion" },
    ],
    reponsesAcceptees: [[texte("Fractions non simplifiées, décimaux arrondis au centième (au millième sous 0,1) ou pourcentages ; comparaison par "), latex("P(A|B)=P(A)"), texte(" au lieu du produit")]],
  };
}

export const adaptateurEvaluationProbabilitesEnsembles: AdaptateurFeuilleExercices<ExerciceProbabilitesEnsembles> = {
  profilInstance: profilProbabilitesEnsembles,
  libelleCasParticulier: LIBELLE_CAS_PROBABILITES_ENSEMBLES,
  titreDocument: "Probabilités et ensembles — Évaluation",
  nomFichierBase: "probabilites-ensembles",
  genererInstance: genererExerciceProbabilitesEnsembles,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as IdVarianteProbabilitesEnsembles),
  construireEnonce,
  construireCorrection,
  reponseBreve,
  correctionDetaillee: correctionDetailleeProbabilitesEnsembles,
  criteresDifficulte,
  bareme,
  enoncePapier,
};
