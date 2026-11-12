import katex from "katex";
import type { EvenementTableauA, ExerciceFamilleA, ExerciceFamilleB, ExerciceProbabilitesEnsembles } from "../../core6e/probabilitesEnsembles.types";
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
import { phasesPourExercice } from "../../moteur6e/typesProbabilitesEnsembles";
import type { PhaseProbabilitesEnsembles } from "../../moteur6e/typesProbabilitesEnsembles";
import { comparaisonConditionnellesA, effectifEvenementA, effectifIntersectionA, independantsB, relationPaireEcran3 } from "../../moteur6e/verificationProbabilitesEnsembles";
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
import { COULEURS } from "../../ui6e/figureRepereIntegrales";
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

function lettre(e: Ex, phase: PhaseProbabilitesEnsembles): string {
  return LETTRES[phasesPourExercice(e).indexOf(phase)];
}

/** Même règle que `diagnostiquerProbabilite` et que la consigne des écrans de saisie. */
const PRECISION = " Donne chaque probabilité sous forme exacte, ou décimale arrondie au centième (au millième si elle est inférieure à 0,1).";

const LATEX_EVENEMENT: Record<EvenementTableauA, string> = {
  A: "A",
  Abar: "\\overline{A}",
  B: "B",
  Bbar: "\\overline{B}",
  AetB: "A\\cap B",
  AetBbar: "A\\cap\\overline{B}",
  AbaretB: "\\overline{A}\\cap B",
  AbaretBbar: "\\overline{A}\\cap\\overline{B}",
};

function latexIntersection(x: EvenementTableauA, y: EvenementTableauA): string {
  const p = (ev: EvenementTableauA) => (ev.length > 4 ? `(${LATEX_EVENEMENT[ev]})` : LATEX_EVENEMENT[ev]);
  return `${p(x)}\\cap ${p(y)}`;
}

const frac = (n: number, d: number) => formatFractionLatex(n, d);
const proba = (n: number, d: number) => formatProbaLatex(n, d);
/** Fraction NON simplifiée sur le dénominateur commun (calculs du corrigé). */
const surN = (n: number, d: number) => `\\dfrac{${n}}{${d}}`;
/** « réduite = sur N » seulement si les deux écritures diffèrent. */
function egalSurN(n: number, d: number): string {
  const r = frac(n, d);
  return r === surN(n, d) ? r : `${r}=${surN(n, d)}`;
}

function rendre(expr: string): string {
  return katex.renderToString(expr, { throwOnError: false });
}

// ============================================================================
// Effectifs (famille A)
// ============================================================================

function cases(e: ExerciceFamilleA) {
  return { AB: e.nAetB, ABb: e.nA - e.nAetB, AbB: e.nB - e.nAetB, AbBb: e.denominateur - e.nA - e.nB + e.nAetB, AouB: e.nA + e.nB - e.nAetB };
}

// ============================================================================
// Figures
// ============================================================================

const BORD = "border:1px solid #888;padding:0.35em 0.9em;text-align:center;min-width:3.6em";

/** Tableau à double entrée des probabilités (lignes A, Ā, total ; colonnes B, B̄, total). `null` =
 * case vide (à compléter). */
function tableauProbabilitesHtml(valeurs: (string | null)[][]): string {
  const entetes = ["B", "\\overline{B}", "\\text{Total}"];
  const lignes = ["A", "\\overline{A}", "\\text{Total}"];
  let h = `<table style="border-collapse:collapse;margin:0.5em auto"><tr><th style="${BORD}"></th>`;
  for (const c of entetes) h += `<th style="${BORD}">${rendre(c)}</th>`;
  h += "</tr>";
  valeurs.forEach((ligne, i) => {
    h += `<tr><th style="${BORD}">${rendre(lignes[i])}</th>`;
    for (const v of ligne) h += `<td style="${BORD}">${v === null ? "" : rendre(v)}</td>`;
    h += "</tr>";
  });
  return `${h}</table>`;
}

/** Tableau de l'ÉNONCÉ : P(A), P(B), le total 1 et la case donnée (A∩B ou Ā∩B̄) ; le reste vide. */
function tableauEnonceA(e: ExerciceFamilleA): string {
  const N = e.denominateur;
  const c = cases(e);
  const AB = e.troisiemeDonnee === "PAetB" ? frac(c.AB, N) : null;
  const AbBb = e.troisiemeDonnee === "PniAniB" ? frac(c.AbBb, N) : null;
  return tableauProbabilitesHtml([
    [AB, null, frac(e.nA, N)],
    [null, AbBb, null],
    [frac(e.nB, N), null, "1"],
  ]);
}

function tableauCompletA(e: ExerciceFamilleA): string {
  const N = e.denominateur;
  const c = cases(e);
  return tableauProbabilitesHtml([
    [frac(c.AB, N), frac(c.ABb, N), frac(e.nA, N)],
    [frac(c.AbB, N), frac(c.AbBb, N), frac(N - e.nA, N)],
    [frac(e.nB, N), frac(N - e.nB, N), "1"],
  ]);
}

/** Diagramme de Venn : deux disques A et B dans l'univers Ω, une valeur (KaTeX) par région. */
function vennHtml(valeurs: { aSeul: string; ab: string; bSeul: string; dehors: string }, libelle: string): string {
  const W = 340;
  const H = 200;
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" style="position:absolute;left:0;top:0" aria-hidden="true">`;
  svg += `<rect x="4" y="4" width="${W - 8}" height="${H - 8}" rx="6" fill="none" stroke="${COULEURS.doux}" stroke-width="1.3"/>`;
  svg += `<circle cx="130" cy="104" r="70" fill="${COULEURS.accentDoux}" fill-opacity="0.55" stroke="${COULEURS.encre}" stroke-width="1.4"/>`;
  svg += `<circle cx="210" cy="104" r="70" fill="${COULEURS.bonDoux}" fill-opacity="0.55" stroke="${COULEURS.encre}" stroke-width="1.4"/>`;
  svg += `<text x="70" y="38" font-size="17" font-style="italic" font-family="Georgia, 'Times New Roman', serif" fill="${COULEURS.encre}">A</text>`;
  svg += `<text x="260" y="38" font-size="17" font-style="italic" font-family="Georgia, 'Times New Roman', serif" fill="${COULEURS.encre}">B</text>`;
  svg += `<text x="14" y="26" font-size="15" font-family="Georgia, 'Times New Roman', serif" fill="${COULEURS.doux}">Ω</text></svg>`;
  const place = (x: number, y: number, v: string) => `<span style="position:absolute;left:${x}px;top:${y}px;transform:translate(-50%,-50%);white-space:nowrap">${rendre(v)}</span>`;
  return (
    `<div role="img" aria-label="${libelle}" style="position:relative;width:${W}px;height:${H}px;margin:0.5em auto;max-width:100%">${svg}` +
    place(98, 108, valeurs.aSeul) +
    place(170, 108, valeurs.ab) +
    place(242, 108, valeurs.bSeul) +
    place(305, 180, valeurs.dehors) +
    "</div>"
  );
}

function vennA(e: ExerciceFamilleA): string {
  const N = e.denominateur;
  const c = cases(e);
  return vennHtml({ aSeul: frac(c.ABb, N), ab: frac(c.AB, N), bSeul: frac(c.AbB, N), dehors: frac(c.AbBb, N) }, "Diagramme de Venn des probabilités");
}

function vennB(e: ExerciceFamilleB): string {
  const ab = e.countAetB;
  return vennHtml(
    { aSeul: String(e.eventA.count - ab), ab: String(ab), bSeul: String(e.eventB.count - ab), dehors: String(e.denominateur - e.eventA.count - e.eventB.count + ab) },
    "Diagramme de Venn des effectifs",
  );
}

// ============================================================================
// Énoncé
// ============================================================================

function questionEtape3(e: Ex): FragmentConsigne[] {
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
  if (e.famille === "A") {
    const debut: FragmentConsigne[] =
      e.troisiemeDonnee === "PAetB"
        ? [texte(" Calcule "), latex("P(A\\cup B)"), texte(", puis complète le tableau à double entrée des probabilités.")]
        : e.troisiemeDonnee === "PAouB"
          ? [texte(" Déduis-en "), latex("P(A\\cap B)"), texte(", puis complète le tableau à double entrée des probabilités.")]
          : [texte(" Déduis-en "), latex("P(A\\cup B)"), texte(" puis "), latex("P(A\\cap B)"), texte(", et complète le tableau à double entrée des probabilités.")];
    return [...debut, texte(" Calcule ensuite "), latex(latexDemandeA(e)), texte("."), ...questionEtape3(e), texte(PRECISION)];
  }
  const ope = e.demandeEcran2 === "intersection" ? "P(A\\cap B)" : "P(A\\cup B)";
  return [texte(" Calcule "), latex("P(A)"), texte(" et "), latex("P(B)"), texte(", puis "), latex(ope), texte(" et la probabilité conditionnelle "), latex("P(A|B)"), texte("."), ...questionEtape3(e), texte(PRECISION)];
}

function entetePapier(e: Ex): FragmentConsigne[] {
  return [...(consigneGenerale(e) as FragmentConsigne[]), texte(" Données : "), latex(blocDonnees(e).join(",\\quad ")), texte("."), ...consigneGlobale(e)];
}

function figureEnonce(e: Ex): string | undefined {
  return e.famille === "A" ? tableauEnonceA(e) : undefined;
}

/** Énoncé « par écrans » : ses questions donnent les titres d'étapes du corrigé (« Étape n — … »). */
function construireEnonce(e: Ex): SectionExercice {
  return {
    enteteFragments: [...(consigneGenerale(e) as FragmentConsigne[]), texte(" Données : "), latex(blocDonnees(e).join(",\\quad ")), texte(".")],
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
// Corrigé détaillé — famille A
// ============================================================================

function correctionA1(e: ExerciceFamilleA): EtapeCorrection[] {
  const L = lettre(e, "aEcran1");
  const N = e.denominateur;
  const c = cases(e);
  const fA = frac(e.nA, N);
  const fB = frac(e.nB, N);
  const lignes: EtapeCorrection[] = [
    {
      label: "Méthode",
      sousQuestion: L,
      fragments: [texte("Relation d'inclusion-exclusion "), latex("P(A\\cup B)=P(A)+P(B)-P(A\\cap B)"), texte(" ; dans le tableau, les deux cases d'une ligne (ou d'une colonne) ont pour somme le total de cette ligne (ou colonne).")],
    },
  ];
  const sommeAB = `${surN(e.nA, N)}+${surN(e.nB, N)}`;
  if (e.troisiemeDonnee === "PAetB") {
    lignes.push({ label: "Calcul", sousQuestion: L, fragments: [latex(`P(A\\cup B)=${fA}+${fB}-${frac(c.AB, N)}=${sommeAB}-${surN(c.AB, N)}=${proba(c.AouB, N)}`)] });
  } else {
    if (e.troisiemeDonnee === "PniAniB") {
      lignes.push({ label: "Calcul", sousQuestion: L, fragments: [texte("L'événement « ni A ni B » est le contraire de « A ou B » : "), latex(`P(A\\cup B)=1-P(\\overline{A}\\cap\\overline{B})=1-${egalSurN(c.AbBb, N)}=${frac(c.AouB, N)}`)] });
    }
    lignes.push({
      label: "Calcul",
      sousQuestion: L,
      fragments: [texte("On isole "), latex("P(A\\cap B)"), texte(" dans la relation : "), latex(`P(A\\cap B)=P(A)+P(B)-P(A\\cup B)=${sommeAB}-${surN(c.AouB, N)}=${proba(c.AB, N)}`)],
    });
  }
  const casesCalcul = [
    `P(A\\cap\\overline{B})=P(A)-P(A\\cap B)=${surN(e.nA, N)}-${surN(c.AB, N)}=${frac(c.ABb, N)}`,
    `P(\\overline{A}\\cap B)=P(B)-P(A\\cap B)=${surN(e.nB, N)}-${surN(c.AB, N)}=${frac(c.AbB, N)}`,
  ];
  if (e.troisiemeDonnee !== "PniAniB") casesCalcul.push(`P(\\overline{A}\\cap\\overline{B})=1-P(A\\cup B)=1-${surN(c.AouB, N)}=${frac(c.AbBb, N)}`);
  for (const calcul of casesCalcul) lignes.push({ label: "Calcul", sousQuestion: L, fragments: [latex(calcul)] });
  lignes.push({ label: "Vérification", sousQuestion: L, fragments: [texte("Les quatre cases ont pour somme 1 : "), latex(`${surN(c.AB, N)}+${surN(c.ABb, N)}+${surN(c.AbB, N)}+${surN(c.AbBb, N)}=1`), texte(".")] });
  lignes.push({ label: "Conclusion", sousQuestion: L, fragments: [texte("Le tableau complet :")], figureHtml: tableauCompletA(e) });
  lignes.push({ label: "Conclusion", sousQuestion: L, fragments: [texte("Les mêmes probabilités sur un diagramme de Venn :")], figureHtml: vennA(e) });
  return lignes;
}

function correctionA2(e: ExerciceFamilleA): EtapeCorrection[] {
  const L = lettre(e, "aEcran2");
  const N = e.denominateur;
  const c = cases(e);
  switch (e.demandeEcran2) {
    case "AetBbar":
      return [{ label: "Calcul", sousQuestion: L, fragments: [texte("C'est la case de la ligne "), latex("A"), texte(" et de la colonne "), latex("\\overline{B}"), texte(" : "), latex(`P(A\\cap\\overline{B})=${proba(c.ABb, N)}`)] }];
    case "AbaretB":
      return [{ label: "Calcul", sousQuestion: L, fragments: [texte("C'est la case de la ligne "), latex("\\overline{A}"), texte(" et de la colonne "), latex("B"), texte(" : "), latex(`P(\\overline{A}\\cap B)=${proba(c.AbB, N)}`)] }];
    case "condAsachantB":
      return [
        { label: "Méthode", sousQuestion: L, fragments: [texte("On se place dans la colonne "), latex("B"), texte(" : on divise la case "), latex("A\\cap B"), texte(" par le total de cette colonne.")] },
        { label: "Calcul", sousQuestion: L, fragments: [latex(`P(A|B)=\\dfrac{P(A\\cap B)}{P(B)}=\\dfrac{${surN(c.AB, N)}}{${surN(e.nB, N)}}=\\dfrac{${c.AB}}{${e.nB}}=${proba(c.AB, e.nB)}`)] },
      ];
    case "condBsachantA":
      return [
        { label: "Méthode", sousQuestion: L, fragments: [texte("On se place dans la ligne "), latex("A"), texte(" : on divise la case "), latex("A\\cap B"), texte(" par le total de cette ligne.")] },
        { label: "Calcul", sousQuestion: L, fragments: [latex(`P(B|A)=\\dfrac{P(A\\cap B)}{P(A)}=\\dfrac{${surN(c.AB, N)}}{${surN(e.nA, N)}}=\\dfrac{${c.AB}}{${e.nA}}=${proba(c.AB, e.nA)}`)] },
      ];
  }
}

const TEXTE_RELATION = { incompatibles: "incompatibles", independants: "indépendants", ni_l_un_ni_l_autre: "ni incompatibles, ni indépendants" } as const;

function correctionA3(e: ExerciceFamilleA): EtapeCorrection[] {
  const L = lettre(e, "aEcran3");
  const N = e.denominateur;
  const c = cases(e);
  if (e.sousTypeEcran3 === "relation" && e.paireEcran3) {
    const [x, y] = e.paireEcran3;
    const X = LATEX_EVENEMENT[x];
    const Y = LATEX_EVENEMENT[y];
    const inter = latexIntersection(x, y);
    const relation = relationPaireEcran3(e);
    const nX = effectifEvenementA(e, x);
    const nY = effectifEvenementA(e, y);
    const nXY = effectifIntersectionA(e, x, y);
    const lignes: EtapeCorrection[] = [
      {
        label: "Méthode",
        sousQuestion: L,
        fragments: [texte("Incompatibles : l'intersection est vide. Indépendants : "), latex(`P(${inter})=P(${X})\\cdot P(${Y})`), texte(" (égalité exacte). Deux événements incompatibles de probabilités non nulles ne sont jamais indépendants.")],
      },
      { label: "Calcul", sousQuestion: L, fragments: [texte("Lecture dans le tableau : "), latex(`P(${X})=${frac(nX, N)},\\quad P(${Y})=${frac(nY, N)}`)] },
    ];
    if (relation === "incompatibles") {
      lignes.push({ label: "Calcul", sousQuestion: L, fragments: [texte("Aucune case du tableau n'est commune aux deux événements : "), latex(`${inter}=\\varnothing`), texte(", donc "), latex(`P(${inter})=0`), texte(", alors que "), latex(`P(${X})\\cdot P(${Y})\\neq 0`), texte(".")] });
    } else {
      lignes.push({ label: "Calcul", sousQuestion: L, fragments: [latex(`P(${X})\\cdot P(${Y})=${frac(nX, N)}\\cdot ${frac(nY, N)}=${frac(nX * nY, N * N)}`)] });
      lignes.push({ label: "Calcul", sousQuestion: L, fragments: [texte("L'intersection n'est pas vide : "), latex(`P(${inter})=${frac(nXY, N)}`), texte(relation === "independants" ? ", égale au produit." : ", différente du produit.")] });
      lignes.push({
        label: "Vérification",
        sousQuestion: L,
        fragments: [texte("En entiers : "), latex(`${nXY}\\times ${N}=${nXY * N}`), texte(relation === "independants" ? " et " : " alors que "), latex(`${nX}\\times ${nY}=${nX * nY}`), texte(".")],
      });
    }
    lignes.push({ label: "Conclusion", sousQuestion: L, fragments: [latex(X), texte(" et "), latex(Y), texte(` sont ${TEXTE_RELATION[relation]}.`)] });
    return lignes;
  }
  const comp = comparaisonConditionnellesA(e);
  const nBb = N - e.nB;
  const signe = comp === "egal" ? "=" : comp === "superieur" ? ">" : "<";
  const g = c.ABb * e.nB;
  const d = c.AB * nBb;
  return [
    { label: "Méthode", sousQuestion: L, fragments: [texte("Chaque probabilité conditionnelle se calcule dans sa colonne : la case de la ligne "), latex("A"), texte(" divisée par le total de la colonne.")] },
    { label: "Calcul", sousQuestion: L, fragments: [latex(`P(A|\\overline{B})=\\dfrac{P(A\\cap\\overline{B})}{P(\\overline{B})}=\\dfrac{${c.ABb}}{${nBb}}=${proba(c.ABb, nBb)}`)] },
    { label: "Calcul", sousQuestion: L, fragments: [latex(`P(A|B)=\\dfrac{P(A\\cap B)}{P(B)}=\\dfrac{${c.AB}}{${e.nB}}=${proba(c.AB, e.nB)}`)] },
    { label: "Vérification", sousQuestion: L, fragments: [texte("Produits en croix : "), latex(`${c.ABb}\\times ${e.nB}=${g}`), texte(comp === "egal" ? " est égal à " : comp === "superieur" ? " est supérieur à " : " est inférieur à "), latex(`${c.AB}\\times ${nBb}=${d}`), texte(".")] },
    {
      label: "Conclusion",
      sousQuestion: L,
      fragments:
        comp === "egal"
          ? [latex(`P(A|\\overline{B})=P(A|B)`), texte(" : savoir que "), latex("B"), texte(" est réalisé ou non ne change pas la probabilité de "), latex("A"), texte(" ; c'est le cas exactement quand "), latex("A"), texte(" et "), latex("B"), texte(" sont indépendants.")]
          : [latex(`P(A|\\overline{B})${signe}P(A|B)`), texte(".")],
    },
  ];
}

function piegeA(e: ExerciceFamilleA): EtapeCorrection {
  if (e.sousTypeEcran3 === "relation") {
    return { label: "Piège", fragments: [texte("Ne pas confondre incompatibles et indépendants : deux événements incompatibles (de probabilités non nulles) ne sont jamais indépendants, puisque "), latex("0\\neq P(X)\\cdot P(Y)"), texte(".")] };
  }
  return { label: "Piège", fragments: [texte("Le dénominateur de "), latex("P(A|\\overline{B})"), texte(" est "), latex("P(\\overline{B})=1-P(B)"), texte(", pas "), latex("P(B)"), texte(" ni 1.")] };
}

// ============================================================================
// Corrigé détaillé — famille B
// ============================================================================

function correctionB(e: ExerciceFamilleB): EtapeCorrection[] {
  const N = e.denominateur;
  const nA = e.eventA.count;
  const nB = e.eventB.count;
  const nAB = e.countAetB;
  const nAouB = nA + nB - nAB;
  const [L1, L2, L3, L4] = (["bEcran1", "bEcran2", "bEcran3", "bEcran4"] as const).map((p) => lettre(e, p));
  const univers = e.sousType === "cartes" ? "les 52 cartes sont équiprobables" : `les ${N} couples de résultats (premier dé ; second dé) sont équiprobables`;
  const indep = independantsB(e);
  const lignes: EtapeCorrection[] = [
    { label: "Méthode", sousQuestion: L1, fragments: [texte(`Équiprobabilité : ${univers}. On compte les issues favorables : `), latex("P(A)=\\dfrac{n(A)}{n(\\Omega)}"), texte(".")] },
    { label: "Calcul", sousQuestion: L1, fragments: [latex(`P(A)=\\dfrac{${nA}}{${N}}=${proba(nA, N)},\\quad P(B)=\\dfrac{${nB}}{${N}}=${proba(nB, N)}`)] },
  ];
  if (e.demandeEcran2 === "intersection") {
    lignes.push({ label: "Calcul", sousQuestion: L2, fragments: [texte(`On compte les issues qui réalisent A et B à la fois : il y en a ${nAB}, donc `), latex(`P(A\\cap B)=\\dfrac{${nAB}}{${N}}=${proba(nAB, N)}`), texte(".")] });
  } else {
    lignes.push({ label: "Méthode", sousQuestion: L2, fragments: [texte("Relation d'inclusion-exclusion : "), latex("P(A\\cup B)=P(A)+P(B)-P(A\\cap B)"), texte(`, avec ${nAB} issue${nAB > 1 ? "s" : ""} commune${nAB > 1 ? "s" : ""} à A et B.`)] });
    lignes.push({ label: "Calcul", sousQuestion: L2, fragments: [latex(`P(A\\cup B)=\\dfrac{${nA}}{${N}}+\\dfrac{${nB}}{${N}}-\\dfrac{${nAB}}{${N}}=${proba(nAouB, N)}`)] });
  }
  lignes.push({ label: "Conclusion", sousQuestion: L2, fragments: [texte("Les effectifs sur un diagramme de Venn :")], figureHtml: vennB(e) });
  lignes.push({
    label: "Calcul",
    sousQuestion: L3,
    fragments: nB > 0 ? [latex(`P(A|B)=\\dfrac{P(A\\cap B)}{P(B)}=\\dfrac{n(A\\cap B)}{n(B)}=\\dfrac{${nAB}}{${nB}}=${proba(nAB, nB)}`)] : [texte("Sans objet.")],
  });
  lignes.push({ label: "Méthode", sousQuestion: L4, fragments: [latex("A"), texte(" et "), latex("B"), texte(" sont indépendants lorsque "), latex("P(A\\cap B)=P(A)\\cdot P(B)"), texte(" exactement (ou, ce qui revient au même, "), latex("P(A|B)=P(A)"), texte(").")] });
  lignes.push({ label: "Calcul", sousQuestion: L4, fragments: [latex(`P(A)\\cdot P(B)=${frac(nA, N)}\\cdot ${frac(nB, N)}=${frac(nA * nB, N * N)}`), texte(" et "), latex(`P(A\\cap B)=${frac(nAB, N)}`)] });
  lignes.push({
    label: "Vérification",
    sousQuestion: L4,
    fragments: [texte("En entiers : "), latex(`n(A\\cap B)\\times n(\\Omega)=${nAB}\\times ${N}=${nAB * N}`), texte(indep ? " et " : " alors que "), latex(`n(A)\\times n(B)=${nA}\\times ${nB}=${nA * nB}`), texte(".")],
  });
  lignes.push({
    label: "Conclusion",
    sousQuestion: L4,
    fragments: [latex(indep ? "P(A\\cap B)=P(A)\\cdot P(B)" : "P(A\\cap B)\\neq P(A)\\cdot P(B)"), texte(indep ? " : A et B sont indépendants." : " : A et B ne sont pas indépendants.")],
  });
  return lignes;
}

function piegeB(e: ExerciceFamilleB): EtapeCorrection {
  if (e.countAetB === 0) {
    return { label: "Piège", fragments: [texte("A et B ne peuvent pas se produire ensemble : ils sont incompatibles, et c'est justement pour cela qu'ils ne sont pas indépendants ("), latex("P(A\\cap B)=0"), texte(" alors que "), latex("P(A)\\cdot P(B)\\neq 0"), texte(").")] };
  }
  return { label: "Piège", fragments: [texte("L'indépendance ne se devine pas (« les deux événements n'ont rien à voir ») : seul le calcul tranche, et l'égalité doit être exacte — comparer des valeurs arrondies ne suffit pas.")] };
}

function correctionDetaillee(e: Ex): EtapeCorrection[] {
  if (e.famille === "A") return [...correctionA1(e), ...correctionA2(e), ...correctionA3(e), piegeA(e)];
  return [...correctionB(e), piegeB(e)];
}

// ============================================================================
// Réponse brève, difficulté, barème
// ============================================================================

function verdictTexte(e: Ex): string {
  const phase: PhaseProbabilitesEnsembles = e.famille === "A" ? "aEcran3" : "bEcran4";
  return libelleChoixCorrect(e, phase) ?? "";
}

function reponseBreve(e: Ex): FragmentConsigne[] {
  if (e.famille === "A") {
    const N = e.denominateur;
    const c = cases(e);
    const etape1 = e.troisiemeDonnee === "PAetB" ? `P(A\\cup B)=${proba(c.AouB, N)}` : `P(A\\cap B)=${proba(c.AB, N)}`;
    const [etape2] = formatReponseAttenduePhaseLatex(e, "aEcran2");
    return [latex(etape1), texte(" ; "), latex(etape2), texte(` ; ${verdictTexte(e)}`)];
  }
  const [pA, pB] = formatReponseAttenduePhaseLatex(e, "bEcran1");
  const [ope] = formatReponseAttenduePhaseLatex(e, "bEcran2");
  const [cond] = formatReponseAttenduePhaseLatex(e, "bEcran3");
  return [latex(pA), texte(" ; "), latex(pB), texte(" ; "), latex(ope), texte(" ; "), latex(cond), texte(` ; ${verdictTexte(e).toLowerCase()}`)];
}

function difficulte(e: Ex): 1 | 2 | 3 {
  if (e.famille === "B") return 2;
  if (e.troisiemeDonnee === "PniAniB" || e.sousTypeEcran3 === "comparaisonConditionnelle") return 3;
  return relationPaireEcran3(e) === "incompatibles" ? 2 : 3;
}

const crit = (sousQuestion: string, points: number, ...critere: FragmentConsigne[]): CritereBareme => ({ sousQuestion, points, critere });

function bareme(e: Ex): BaremeExercice {
  if (e.famille === "A") {
    const N = e.denominateur;
    const c = cases(e);
    const [L1, L2, L3] = (["aEcran1", "aEcran2", "aEcran3"] as const).map((p) => lettre(e, p));
    const deduit = e.troisiemeDonnee === "PAetB" ? `P(A\\cup B)=${frac(c.AouB, N)}` : `P(A\\cap B)=${frac(c.AB, N)}`;
    const [etape2] = formatReponseAttenduePhaseLatex(e, "aEcran2");
    const conclusion = e.sousTypeEcran3 === "relation" ? "calcul (ou intersection vide) et conclusion" : "les deux probabilités conditionnelles comparées et conclusion";
    return {
      reponseFinale: reponseBreve(e),
      criteres: [
        crit(L1, 0.5, texte("Inclusion-exclusion : "), latex(deduit)),
        crit(L1, 1, texte("Tableau complet : "), latex(`${frac(c.AB, N)},\\ ${frac(c.ABb, N)},\\ ${frac(c.AbB, N)},\\ ${frac(c.AbBb, N)}`)),
        crit(L2, 1, latex(etape2)),
        crit(L3, 0.5, texte("Probabilités utiles lues dans le tableau")),
        crit(L3, 1, texte(`Justification (${conclusion}) : ${verdictTexte(e).toLowerCase()}`)),
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
      crit(L4, 1, texte(`Conclusion justifiée : ${verdictTexte(e).toLowerCase()}`)),
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
  difficulte,
  reponseBreve,
  correctionDetaillee,
  bareme,
  enoncePapier,
  dureeMinutes: 12,
};
