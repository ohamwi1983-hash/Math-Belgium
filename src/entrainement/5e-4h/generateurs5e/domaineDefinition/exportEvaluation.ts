import katex from "katex";
import type { EnsembleReelGuide, ExerciceDomaineDefinition, ExerciceFractionSousRacine, Polynome, SlotCE } from "../../core5e/domaineDefinition.types";
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
import { formatDomfLatex, formatEnsembleReelLatex, formatSlotConditionLatex, formatValeurLatex } from "../../ui5e/formatDomaineDefinition";
import { phaseApresCE } from "../../moteur5e/typesDomaineDefinition";
import { CATALOGUE_FAMILLES, construireAvecFamilleId, genererExerciceDomaineDefinition } from "./index";
import { LIBELLE_CAS_DOMAINE_DEFINITION, profilDomaineDefinition } from "../profilsEvaluationFonctions1-2";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceDomaineDefinition>` pour 5gen1 (domaine de
 * définition) — feuille d'exercices et évaluation (méthode : `.claude/rules/feuilles-evaluations.md`).
 *
 * Énoncé papier = la fonction et la consigne globale « Détermine son domaine de définition ». Les
 * écrans du générateur (conditions d'existence, résolution — seulement pour √N/D et la fraction sous
 * racine —, domaine) passent dans le corrigé « Étape n — consigne », avec CHAQUE condition résolue
 * puis l'intersection.
 *
 * Valeurs : les champs de l'instance (`slots`, `resolution…`, `domf`, `grille`) et les formateurs de
 * l'écran (`formatSlotConditionLatex`, `formatEnsembleReelLatex`, `formatDomfLatex`,
 * `formatValeurLatex`) — les racines d'un radicande du 2e degré sont relues sur `coeffs` (Δ et
 * racines exactes, entières ou rationnelles par construction), jamais une autre résolution.
 *
 * Aucune prose en mode math : « Aucune CE » et « et » sont écrits en texte (l'ancien
 * `formatCEAttendueLatex` n'est plus utilisé ici).
 */

// ============================================================================
// Outils : polynômes (coefficients par degré croissant), étapes.
// ============================================================================

function degre(p: Polynome): number {
  let d = p.length - 1;
  while (d > 0 && Math.abs(p[d]) < 1e-12) d--;
  return d;
}

/** Δ et racines réelles d'un polynôme du 2e degré (triées). */
function etudeTrinome(p: Polynome): { a: number; delta: number; racines: number[] } {
  const [c, b, a] = [p[0] ?? 0, p[1] ?? 0, p[2] ?? 0];
  const delta = b * b - 4 * a * c;
  if (delta < -1e-9) return { a, delta, racines: [] };
  if (Math.abs(delta) <= 1e-9) return { a, delta: 0, racines: [-b / (2 * a)] };
  const r = Math.sqrt(delta);
  return { a, delta, racines: [(-b - r) / (2 * a), (-b + r) / (2 * a)].sort((u, v) => u - v) };
}

/** Lettres d'étapes, dans l'ordre des écrans : a = conditions, (b = résolution), dernière = domaine. */
function lettres(exercice: ExerciceDomaineDefinition): { ce: string; resolution: string | null; domaine: string } {
  const resolutionSeparee = phaseApresCE(exercice) === "resolution";
  return { ce: "a", resolution: resolutionSeparee ? "b" : null, domaine: resolutionSeparee ? "c" : "b" };
}

/** « x = r₁ et x = r₂ » en fragments. */
function fragmentsValeurs(valeurs: number[]): FragmentConsigne[] {
  return valeurs.flatMap((v, i) => {
    const f = latex(`x = ${formatValeurLatex(v)}`);
    if (i === 0) return [f];
    return [texte(i === valeurs.length - 1 ? " et " : ", "), f];
  });
}

// ============================================================================
// Énoncés.
// ============================================================================

function entete(exercice: ExerciceDomaineDefinition): FragmentConsigne[] {
  return [texte("On considère la fonction "), latex(exercice.fLatex), texte(".")];
}

const CONSIGNE_CE = "Écris la ou les conditions d'existence de f(x) (sans les résoudre).";
const CONSIGNE_DOMAINE = "Exprime le domaine de définition de f en notation ensembliste.";

function consigneResolution(exercice: ExerciceDomaineDefinition): string {
  return exercice.famille === "fractionSousRacine"
    ? "Résous la condition d'existence à l'aide d'un tableau de signes."
    : "Résous chacune des deux conditions d'existence.";
}

function construireEnonceDomaineDefinition(exercice: ExerciceDomaineDefinition): SectionExercice {
  const l = lettres(exercice);
  return {
    enteteFragments: entete(exercice),
    questions: [
      { consigne: [texte(CONSIGNE_CE)] },
      ...(l.resolution ? [{ consigne: [texte(consigneResolution(exercice))] }] : []),
      { consigne: [texte(CONSIGNE_DOMAINE)] },
    ],
  };
}

function enoncePapierDomaineDefinition(exercice: ExerciceDomaineDefinition): EnoncePapier {
  return { section: { enteteFragments: [...entete(exercice), texte(" Détermine son domaine de définition, en justifiant.")], questions: [] } };
}

function reponseBreveDomaineDefinition(exercice: ExerciceDomaineDefinition): FragmentConsigne[] {
  return [latex(formatDomfLatex(exercice.domf))];
}

// ============================================================================
// Corrigé : chaque condition, sa résolution, l'intersection.
// ============================================================================

function lignesConditions(exercice: ExerciceDomaineDefinition, lettre: string): EtapeCorrection[] {
  if (exercice.famille === "pasDeCE") {
    const raison = exercice.raison === "racineImpaire" ? "Une racine d'indice impair existe pour tout réel" : "Une valeur absolue existe pour tout réel";
    return [{ label: "Condition", sousQuestion: lettre, fragments: [texte(`${raison}, et f(x) ne contient ni division par une expression en x, ni racine d'indice pair : aucune condition d'existence.`)] }];
  }
  const lignes: EtapeCorrection[] = exercice.slots.map((slot): EtapeCorrection => {
    const raison =
      slot.role === "denominateur"
        ? "On ne divise pas par 0 : le dénominateur doit être non nul, "
        : slot.symboleAttendu === ">"
          ? "La racine d'indice pair est au dénominateur : son radicande doit être strictement positif, "
          : "Une racine d'indice pair n'existe que pour un radicande positif ou nul, ";
    return { label: "Condition", sousQuestion: lettre, fragments: [texte(raison), latex(formatSlotConditionLatex(slot)), texte(".")] };
  });
  if (exercice.famille === "racineImpaireDenominateur") {
    lignes.unshift({ label: "Méthode", sousQuestion: lettre, fragments: [texte("La racine d'indice impair existe pour tout réel : seule la division impose une condition.")] });
  }
  if (exercice.famille === "fractionSousRacine") {
    lignes.push({ label: "Méthode", sousQuestion: lettre, fragments: [texte("Les deux conditions sont exigées : le quotient sous la racine positif ou nul ET son dénominateur non nul.")] });
  }
  return lignes;
}

/** Résolution d'un dénominateur ≠ 0, à partir de l'ensemble déjà connu (ℝ ou ℝ privé de points). */
function resolutionDenominateur(slot: SlotCE, valeurs: number[]): FragmentConsigne[] {
  if (valeurs.length === 0) {
    if (degre(slot.coeffs) === 2) {
      const { delta } = etudeTrinome(slot.coeffs);
      return [latex(`${slot.latex}`), texte(" : "), latex(`\\Delta = ${formatValeurLatex(delta)} < 0`), texte(", ce trinôme ne s'annule jamais. La condition est toujours vraie : aucune valeur exclue.")];
    }
    return [latex(slot.latex), texte(" ne s'annule pour aucun réel : la condition est toujours vraie.")];
  }
  return [latex(`${slot.latex} = 0`), texte(" pour "), ...fragmentsValeurs(valeurs), texte(valeurs.length > 1 ? " : ces valeurs sont exclues." : " : cette valeur est exclue.")];
}

/** Résolution d'un radicande ≥ 0 (ou > 0), qui aboutit à l'ensemble `ensemble`. */
function resolutionRadicande(slot: SlotCE, ensemble: EnsembleReelGuide): FragmentConsigne[] {
  const strict = slot.symboleAttendu === ">";
  const conclusion = [texte(" Donc "), latex(`x \\in ${formatEnsembleReelLatex(ensemble)}`), texte(".")];
  if (degre(slot.coeffs) === 1) {
    const [b, a] = [slot.coeffs[0] ?? 0, slot.coeffs[1]];
    const borne = formatValeurLatex(-b / a);
    const sens = a > 0 ? (strict ? ">" : "\\geq") : strict ? "<" : "\\leq";
    return [
      latex(`${formatSlotConditionLatex(slot)} \\iff x ${sens} ${borne}`),
      texte(a < 0 ? " (on divise par un nombre négatif : le sens de l'inégalité s'inverse)." : "."),
      ...conclusion,
    ];
  }
  const { a, delta, racines } = etudeTrinome(slot.coeffs);
  if (racines.length === 0) {
    return [latex(`\\Delta = ${formatValeurLatex(delta)} < 0`), texte(` : le trinôme ne s'annule jamais et garde le signe de a (${a > 0 ? "positif" : "négatif"}).`), ...conclusion];
  }
  if (racines.length === 1) {
    return [latex(`\\Delta = 0`), texte(", racine double "), latex(`x = ${formatValeurLatex(racines[0])}`), texte(" ; ailleurs, le trinôme a le signe de a."), ...conclusion];
  }
  return [
    latex(`\\Delta = ${formatValeurLatex(delta)}`),
    texte(", racines "),
    latex(`x_1 = ${formatValeurLatex(racines[0])}`),
    texte(" et "),
    latex(`x_2 = ${formatValeurLatex(racines[1])}`),
    texte(a > 0 ? " ; le trinôme est positif à l'extérieur des racines (signe de a)." : " ; le trinôme est positif entre les racines (signe de a à l'extérieur)."),
    ...conclusion,
  ];
}

const CELLULE = "border:1px solid #555;padding:4px 10px;text-align:center;";
const k = (s: string) => katex.renderToString(s, { throwOnError: false });

/** Tableau de signes de N, D et N/D (figure du corrigé, `figureHtml`). */
function tableauSignesHtml(e: ExerciceFractionSousRacine): string {
  const g = e.grille;
  const teteValeurs = ["-\\infty", ...e.racines.map(formatValeurLatex), "+\\infty"];
  const tete = [`<th style="${CELLULE}">${k("x")}</th>`];
  teteValeurs.forEach((v, i) => {
    tete.push(`<th style="${CELLULE}">${k(v)}</th>`);
    if (i < teteValeurs.length - 1) tete.push(`<th style="${CELLULE}"></th>`);
  });
  const ligne = (label: string, valeurs: string[]) => {
    const cellules = [`<td style="${CELLULE}">${k(label)}</td>`, `<td style="${CELLULE}"></td>`];
    valeurs.forEach((v) => cellules.push(`<td style="${CELLULE}">${v === "-" ? "−" : v === "∄" ? "‖" : v}</td>`));
    cellules.push(`<td style="${CELLULE}"></td>`);
    return `<tr>${cellules.join("")}</tr>`;
  };
  return (
    `<table style="border-collapse:collapse;margin:6px auto;">` +
    `<tr>${tete.join("")}</tr>` +
    ligne(e.numerateurLatex, g.ligneNumerateur) +
    ligne(e.denominateurLatex, g.ligneDenominateur) +
    ligne(`\\dfrac{${e.numerateurLatex}}{${e.denominateurLatex}}`, g.ligneQuotient) +
    `</table>`
  );
}

function lignesResolution(exercice: ExerciceDomaineDefinition, lettre: string): EtapeCorrection[] {
  const ligne = (fragments: FragmentConsigne[], label = "Résolution", figureHtml?: string): EtapeCorrection => ({ label, sousQuestion: lettre, fragments, ...(figureHtml ? { figureHtml } : {}) });
  switch (exercice.famille) {
    case "pasDeCE":
      return [];
    case "rationnelle":
    case "racineImpaireDenominateur": {
      const valeurs = exercice.resolution.forme === "prive_points" ? exercice.resolution.points : [];
      return [ligne(resolutionDenominateur(exercice.slots[0], valeurs))];
    }
    case "irrationnelleSimple":
      return [ligne(resolutionRadicande(exercice.slots[0], exercice.resolution))];
    case "racineSurFraction": {
      if (exercice.structure === "nSurRacineD") return [ligne(resolutionRadicande(exercice.slots[0], exercice.resolutionRadicande))];
      const [radicande, denominateur] = exercice.slots as [SlotCE, SlotCE];
      const d = exercice.resolutionDenominateur;
      return [
        ligne(resolutionRadicande(radicande, exercice.resolutionRadicande)),
        ligne(d === null ? resolutionDenominateur(denominateur, []) : resolutionDenominateur(denominateur, [d])),
      ];
    }
    case "fractionSousRacine": {
      if (exercice.aucuneCE) {
        return [ligne([texte("Le numérateur et le dénominateur ne s'annulent jamais et gardent le même signe : le quotient est toujours strictement positif. Les conditions sont toujours vraies.")])];
      }
      const lignesF: EtapeCorrection[] = [
        ligne([texte("Valeurs remarquables (racines du numérateur et du dénominateur) : "), ...fragmentsValeurs(exercice.racines), texte(".")]),
        ligne([texte("Tableau de signes du quotient :")], "Tableau", tableauSignesHtml(exercice)),
      ];
      if (exercice.denominateurSansRacineReelle) {
        lignesF.push(ligne([texte("Le dénominateur ne s'annule jamais : le signe du quotient est celui du numérateur.")]));
      }
      return lignesF;
    }
  }
}

function piege(exercice: ExerciceDomaineDefinition): string {
  switch (exercice.famille) {
    case "pasDeCE":
      return "Ne pas inventer de condition : une racine d'indice impair et une valeur absolue sont définies pour tout réel.";
    case "rationnelle":
    case "racineImpaireDenominateur":
      if (exercice.aucuneCE) return "Ne pas exclure de valeur au hasard : ce dénominateur ne s'annule jamais (Δ < 0).";
      return exercice.famille === "racineImpaireDenominateur"
        ? "Seul le dénominateur compte : la racine d'indice impair n'impose pas de radicande positif."
        : "Toute valeur qui annule le dénominateur est exclue : on écrit ℝ privé de ces valeurs.";
    case "irrationnelleSimple":
      if (degre(exercice.slots[0].coeffs) === 1 && (exercice.slots[0].coeffs[1] ?? 0) < 0) return "En divisant par le coefficient négatif de x, le sens de l'inégalité s'inverse.";
      return "Le radicande peut valoir 0 : la borne est incluse (≥ 0, crochet fermé).";
    case "racineSurFraction":
      return exercice.structure === "nSurRacineD"
        ? "La racine est au dénominateur : la condition est stricte (> 0), la borne est exclue."
        : "La valeur qui annule le dénominateur reste exclue, même si elle appartient à l'intervalle du radicande.";
    case "fractionSousRacine":
      return "Les valeurs qui annulent le dénominateur sont exclues (crochet ouvert), celles qui annulent seulement le numérateur sont incluses.";
  }
}

function correctionDetailleeDomaineDefinition(exercice: ExerciceDomaineDefinition): EtapeCorrection[] {
  const l = lettres(exercice);
  const lignes: EtapeCorrection[] = [...lignesConditions(exercice, l.ce)];
  if (l.resolution) {
    lignes.push(...lignesResolution(exercice, l.resolution));
    lignes.push({ label: "Intersection", sousQuestion: l.domaine, fragments: [texte("On garde les réels qui vérifient toutes les conditions à la fois.")] });
  } else {
    lignes.push(...lignesResolution(exercice, l.domaine));
  }
  lignes.push({ label: "Piège", sousQuestion: l.domaine, fragments: [texte(piege(exercice))] });
  lignes.push({ label: "Conclusion", sousQuestion: l.domaine, fragments: [latex(formatDomfLatex(exercice.domf)), texte(".")] });
  return lignes;
}

// ============================================================================
// Barème, difficulté.
// ============================================================================

function baremeDomaineDefinition(exercice: ExerciceDomaineDefinition): BaremeExercice {
  const l = lettres(exercice);
  const c = (sousQuestion: string, texteCritere: string, points: number): CritereBareme => ({ sousQuestion, critere: [texte(texteCritere)], points });
  let criteres: CritereBareme[];
  if (exercice.famille === "pasDeCE") {
    criteres = [c(l.ce, "Aucune condition d'existence, justifiée (racine d'indice impair ou valeur absolue)", 2), c(l.domaine, "Domaine ℝ", 2)];
  } else if (exercice.aucuneCE) {
    criteres = [c(l.ce, "Condition d'existence écrite", 1), c(l.resolution ?? l.domaine, "Condition toujours vraie justifiée (aucune valeur exclue)", 2), c(l.domaine, "Domaine ℝ", 1)];
  } else if (exercice.famille === "fractionSousRacine") {
    criteres = [c(l.ce, "Les deux conditions (quotient ≥ 0 et dénominateur ≠ 0)", 1), c("b", "Tableau de signes correct", 1.5), c(l.domaine, "Domaine : bornes du dénominateur exclues, celles du numérateur incluses", 1.5)];
  } else if (exercice.famille === "racineSurFraction" && exercice.structure === "racineSurD") {
    criteres = [
      c(l.ce, "Les deux conditions d'existence", 1),
      c("b", "Radicande résolu", 1),
      c("b", "Valeur exclue par le dénominateur", 0.5),
      c(l.domaine, "Intersection et notation ensembliste", 1.5),
    ];
  } else {
    criteres = [c(l.ce, "Condition d'existence correcte (bon symbole)", 1), c(l.domaine, "Condition résolue", 2), c(l.domaine, "Domaine en notation ensembliste", 1)];
  }
  return {
    reponseFinale: reponseBreveDomaineDefinition(exercice),
    criteres,
    erreursFrequentes: [
      { description: [texte(piege(exercice))], cout: "−1" },
      ...(exercice.famille === "pasDeCE" ? [] : [{ description: [texte("Domaine juste sans aucune condition écrite")], cout: "0 pt sur les conditions" }]),
    ],
    reponsesAcceptees: [
      [texte("Toute écriture équivalente du domaine (réunion d'intervalles ou ℝ privé de valeurs)")],
      ...(exercice.aucuneCE && exercice.famille !== "pasDeCE" ? [[texte("« Aucune condition d'existence », ou la condition écrite puis reconnue toujours vraie")]] : []),
    ],
  };
}

function difficulteDomaineDefinition(exercice: ExerciceDomaineDefinition): 1 | 2 | 3 {
  switch (exercice.famille) {
    case "pasDeCE":
      return 1;
    case "rationnelle":
    case "racineImpaireDenominateur":
      return degre(exercice.slots[0].coeffs) <= 1 ? 1 : 2;
    case "irrationnelleSimple":
      return degre(exercice.slots[0].coeffs) <= 1 ? 1 : 2;
    case "racineSurFraction":
      return exercice.structure === "racineSurD" && exercice.exclusionDansIntervalle ? 3 : 2;
    case "fractionSousRacine":
      return 3;
  }
}

/** Ancien corrigé (repli, documents Word) : les lignes du corrigé détaillé, sans le piège. */
function construireCorrectionDomaineDefinition(exercice: ExerciceDomaineDefinition): BlocCorrection[] {
  return correctionDetailleeDomaineDefinition(exercice)
    .filter((l) => l.label !== "Piège")
    .map((l) => ({ type: "paragraphe", fragments: l.fragments }));
}

export const adaptateurEvaluationDomaineDefinition: AdaptateurFeuilleExercices<ExerciceDomaineDefinition> = {
  titreDocument: "Domaine de définition — Évaluation",
  nomFichierBase: "domaine-definition",
  genererInstance: genererExerciceDomaineDefinition,
  catalogueVariantes: CATALOGUE_FAMILLES,
  genererInstanceAvecVariante: (id) => construireAvecFamilleId(id),
  construireEnonce: construireEnonceDomaineDefinition,
  construireCorrection: construireCorrectionDomaineDefinition,
  difficulte: difficulteDomaineDefinition,
  reponseBreve: reponseBreveDomaineDefinition,
  correctionDetaillee: correctionDetailleeDomaineDefinition,
  bareme: baremeDomaineDefinition,
  enoncePapier: enoncePapierDomaineDefinition,
  dureeMinutes: 6,
  profilInstance: profilDomaineDefinition,
  libelleCasParticulier: LIBELLE_CAS_DOMAINE_DEFINITION,
  regroupable: false,
};
