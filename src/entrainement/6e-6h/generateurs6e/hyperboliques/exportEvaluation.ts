import type { ExerciceHyperboliques, ExerciceHyperboliquesB, ExerciceHyperboliquesC, ExerciceHyperboliquesD, StatutPariteHyperbolique } from "../../core6e/hyperboliques.types";
import type { AdaptateurFeuilleExercices, BlocCorrection, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import type { FragmentConsigne } from "../../ui/formatEquationDroite";
import { phaseApres, phaseInitiale, type PhaseHyperboliques } from "../../moteur6e/typesHyperboliques";
import { pariteAttendueA, signeLimiteMoinsInfiniD, signeLimitePlusInfiniD } from "../../moteur6e/verificationHyperboliques";
import { CONSIGNE_GENERALE, aideNiveau2, blocDonnees, consigneEcran } from "../../ui6e/formatHyperboliques";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceHyperboliques, type VarianteId } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceHyperboliques>` pour `6gen19` (Sinus et cosinus
 * hyperboliques, sh/ch) — feuille d'évaluation.
 *
 * 4 familles STRUCTURELLEMENT DISJOINTES (1 à 3 écrans chacune, voir `moteur6e/
 * typesHyperboliques.ts`) — condensées ici en autant de questions écrites qu'il y a d'écrans
 * RÉELLEMENT traversés par la famille tirée (`phasesPourExercice`, dérivé des mêmes
 * `phaseInitiale`/`phaseApres` exportés que le moteur de session — jamais une liste dupliquée à la
 * main). Consignes reprises telles quelles depuis `ui6e/formatHyperboliques.ts::consigneEcran`
 * (texte affiché à l'écran), jamais réécrites. Famille A ajoute juste "Justifie en calculant
 * f(−x)." : l'écran interactif se contente de 3 boutons (aucune justification écrite requise côté
 * app), mais une feuille papier sans exigence de justification ne testerait rien.
 *
 * Le corrigé réutilise autant que possible les valeurs/formules déjà exportées
 * (`pariteAttendueA`, `aideNiveau2` pour la substitution f(−x) de la famille A,
 * `signeLimitePlusInfiniD`/`signeLimiteMoinsInfiniD` pour la famille D) plutôt que de les
 * recalculer indépendamment. Les formules encore purement internes à `ui6e/formatHyperboliques.ts`
 * (expression isolée famille B, dérivée/dérivée seconde famille C, forme exponentielle famille D)
 * sont dupliquées ici à l'identique — même convention documentée que
 * `generateurs6e/domaineDeriveeExponentielles/exportEvaluation.ts` (duplication de formules déjà
 * vérifiées côté moteur, jamais un recalcul indépendant du fait mathématique).
 */

const SH = "\\operatorname{sh}";
const CH = "\\operatorname{ch}";

const LETTRES = "abcd";

const LIBELLE_PARITE: Record<StatutPariteHyperbolique, string> = { paire: "paire", impaire: "impaire", aucune: "ni paire ni impaire" };

const NOMBRE_LIGNES_PAR_PHASE: Record<PhaseHyperboliques, number> = {
  aParite: 3,
  bIsoler: 2,
  bValeurs: 2,
  cDerivee: 3,
  cDeriveeSeconde: 3,
  cRelation: 2,
  dReecriture: 3,
  dLimites: 3,
};

/** Écrans RÉELLEMENT traversés par cette instance, dans l'ordre — dérivé des mêmes
 * `phaseInitiale`/`phaseApres` que `moteur6e/sessionHyperboliques.ts`, jamais une liste
 * dupliquée à la main (qui se désynchroniserait silencieusement d'un changement de découpage). */
function phasesPourExercice(exercice: ExerciceHyperboliques): PhaseHyperboliques[] {
  const phases: PhaseHyperboliques[] = [];
  let phase: PhaseHyperboliques | "termine" = phaseInitiale(exercice);
  while (phase !== "termine") {
    phases.push(phase);
    phase = phaseApres(phase);
  }
  return phases;
}

// ============================================================================
// Formules dupliquées de `ui6e/formatHyperboliques.ts` (fonctions internes non exportées) — même
// convention que `domaineDeriveeExponentielles/exportEvaluation.ts`.
// ============================================================================

interface TermeSigne {
  valeur: number;
  suffixe: string;
}

function formatSommeTermes(termes: TermeSigne[]): string {
  const nonNuls = termes.filter((t) => t.valeur !== 0);
  if (nonNuls.length === 0) return "0";
  return nonNuls
    .map((t, i) => {
      const abs = Math.abs(t.valeur);
      const corps = abs === 1 ? t.suffixe : `${abs}${t.suffixe}`;
      if (i === 0) return t.valeur < 0 ? `-${corps}` : corps;
      return `${t.valeur < 0 ? "-" : "+"} ${corps}`;
    })
    .join(" ");
}

// Famille B — √(1+k²) (trouverCh) ou ±√(k²−1) (trouverSh) ; duplique
// `cibleTrouverCh`/`racineTrouverSh`/`valeursAttenduesB` de `moteur6e/verificationHyperboliques.ts`.
function calculerReponseB(exercice: ExerciceHyperboliquesB): { radicande: number; valeurs: number[] } {
  if (exercice.sousType === "trouverCh") {
    const radicande = 1 + exercice.k * exercice.k;
    return { radicande, valeurs: [Math.sqrt(radicande)] };
  }
  const radicande = exercice.k * exercice.k - 1;
  const racine = Math.sqrt(radicande);
  if (exercice.signeX0 !== null) return { radicande, valeurs: [exercice.signeX0 * racine] };
  return { radicande, valeurs: [racine, -racine] };
}

// Expression isolée SYMBOLIQUE (radicande en fonction de k, signe non substitué numériquement) —
// duplique `formatExpressionIsoleeB` de `ui6e/formatHyperboliques.ts` à l'identique (même texte
// que celui déjà affiché côté aide niveau 2, écran "bValeurs").
function formatExpressionIsoleeLatex(exercice: ExerciceHyperboliquesB): string {
  if (exercice.sousType === "trouverCh") return `${CH}(x_0) = \\sqrt{1+(${exercice.k})^2}`;
  const radicande = `(${exercice.k})^2-1`;
  if (exercice.signeX0 === null) return `${SH}(x_0) = \\pm\\sqrt{${radicande}}`;
  return `${SH}(x_0) = ${exercice.signeX0 > 0 ? "" : "-"}\\sqrt{${radicande}}`;
}

function formatValeursLatex(exercice: ExerciceHyperboliquesB): string {
  const { radicande, valeurs } = calculerReponseB(exercice);
  const racineLatex = `\\sqrt{${radicande}}`;
  if (valeurs.length === 1) {
    const v = valeurs[0];
    const signe = v < 0 ? "-" : "";
    return `${signe}${racineLatex} \\approx ${v.toFixed(2)}`;
  }
  const [positif, negatif] = valeurs;
  return `${racineLatex} \\approx ${positif.toFixed(2)} \\quad \\text{ou} \\quad -${racineLatex} \\approx ${negatif.toFixed(2)}`;
}

// Famille C — f(x)=a·sh(kx)+b·ch(kx), f'(x)=k[a·ch(kx)+b·sh(kx)], f''(x)=k²·f(x) ; duplique
// `formatFonctionC`/`formatDeriveeC`/`formatDeriveeSecondeC` de `ui6e/formatHyperboliques.ts`.
function formatFonctionCLatex(exercice: ExerciceHyperboliquesC): string {
  const { a, b, k } = exercice;
  return formatSommeTermes([
    { valeur: a, suffixe: `${SH}(${k}x)` },
    { valeur: b, suffixe: `${CH}(${k}x)` },
  ]);
}
function formatDeriveeCLatex(exercice: ExerciceHyperboliquesC): string {
  const { a, b, k } = exercice;
  const interieur = formatSommeTermes([
    { valeur: a, suffixe: `${CH}(${k}x)` },
    { valeur: b, suffixe: `${SH}(${k}x)` },
  ]);
  return `${k}\\left[${interieur}\\right]`;
}
function formatDeriveeSecondeCLatex(exercice: ExerciceHyperboliquesC): string {
  return `${exercice.k * exercice.k}\\left[${formatFonctionCLatex(exercice)}\\right]`;
}

// Famille D — f(x)=a·sh(x)+b·ch(x) = [(a+b)eˣ+(b−a)e⁻ˣ]/2 ; duplique
// `formatFormeExponentielleD` de `ui6e/formatHyperboliques.ts`.
function formatFormeExponentielleDLatex(exercice: ExerciceHyperboliquesD): string {
  const { a, b } = exercice;
  const numerateur = formatSommeTermes([
    { valeur: a + b, suffixe: "e^x" },
    { valeur: b - a, suffixe: "e^{-x}" },
  ]);
  return `\\dfrac{${numerateur}}{2}`;
}

// ============================================================================
// Énoncé.
// ============================================================================

function construireEnonceHyperboliques(exercice: ExerciceHyperboliques): SectionExercice {
  const phases = phasesPourExercice(exercice);
  const donnees = blocDonnees(exercice);
  return {
    enteteFragments: [texte(CONSIGNE_GENERALE), latex(donnees.join(",\\quad "))],
    questions: phases.map((phase) => {
      const suffixe = phase === "aParite" ? " Justifie en calculant f(−x)." : "";
      return {
        consigne: [texte(consigneEcran(exercice, phase) + suffixe)],
        reponse: { type: "lignes", nombre: NOMBRE_LIGNES_PAR_PHASE[phase] },
      };
    }),
  };
}

// ============================================================================
// Correction.
// ============================================================================

function fragmentsCorrectionPhase(exercice: ExerciceHyperboliques, phase: PhaseHyperboliques): FragmentConsigne[] {
  if (exercice.famille === "A" && phase === "aParite") {
    const substitution = aideNiveau2(exercice, phase).latex ?? "";
    const parite = pariteAttendueA(exercice);
    return [texte("f(−x) : "), latex(substitution), texte(`, donc f est ${LIBELLE_PARITE[parite]}.`)];
  }
  if (exercice.famille === "B" && phase === "bIsoler") {
    return [latex(formatExpressionIsoleeLatex(exercice))];
  }
  if (exercice.famille === "B" && phase === "bValeurs") {
    return [latex(formatValeursLatex(exercice))];
  }
  if (exercice.famille === "C" && phase === "cDerivee") {
    return [latex(`f'(x) = ${formatDeriveeCLatex(exercice)}`)];
  }
  if (exercice.famille === "C" && phase === "cDeriveeSeconde") {
    return [latex(`f''(x) = ${formatDeriveeSecondeCLatex(exercice)}`)];
  }
  if (exercice.famille === "C" && phase === "cRelation") {
    const kCarre = exercice.k * exercice.k;
    return [latex(`f''(x) = ${kCarre}\\cdot f(x)`), texte(` (coefficient = ${kCarre}).`)];
  }
  if (exercice.famille === "D" && phase === "dReecriture") {
    return [latex(`f(x) = ${formatFormeExponentielleDLatex(exercice)}`)];
  }
  // exercice.famille === "D" && phase === "dLimites"
  const exerciceD = exercice as ExerciceHyperboliquesD;
  const plus = signeLimitePlusInfiniD(exerciceD);
  const moins = signeLimiteMoinsInfiniD(exerciceD);
  return [
    latex(`\\lim_{x\\to+\\infty} f(x) = ${plus === "plus_infini" ? "+\\infty" : "-\\infty"}`),
    texte(" ; "),
    latex(`\\lim_{x\\to-\\infty} f(x) = ${moins === "plus_infini" ? "+\\infty" : "-\\infty"}`),
  ];
}

function construireCorrectionHyperboliques(exercice: ExerciceHyperboliques): BlocCorrection[] {
  const phases = phasesPourExercice(exercice);
  return phases.map((phase, i) => ({
    type: "paragraphe",
    fragments: [texte(`${LETTRES[i]}) `), ...fragmentsCorrectionPhase(exercice, phase)],
  }));
}

export const adaptateurEvaluationHyperboliques: AdaptateurFeuilleExercices<ExerciceHyperboliques> = {
  titreDocument: "Sinus et cosinus hyperboliques (sh, ch) — Évaluation",
  nomFichierBase: "hyperboliques",
  genererInstance: genererExerciceHyperboliques,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as VarianteId),
  construireEnonce: construireEnonceHyperboliques,
  construireCorrection: construireCorrectionHyperboliques,
};
