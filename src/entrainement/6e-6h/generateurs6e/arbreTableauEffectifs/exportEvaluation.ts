import type { CleBranche, CleCellule, ExerciceArbreTableauEffectifs } from "../../core6e/arbreTableauEffectifs.types";
import type {
  AdaptateurFeuilleExercices,
  BaremeExercice,
  BlocCorrection,
  CriteresDifficulte,
  EnoncePapier,
  FragmentConsigne,
  SectionExercice,
} from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { correctionDetailleeArbreTableauEffectifs } from "./corrigeDetaille";
import { phasesPourExercice } from "../../moteur6e/typesArbreTableauEffectifs";
import type { PhaseArbreTableauEffectifs } from "../../moteur6e/typesArbreTableauEffectifs";
import {
  branchesInconnues,
  cellulesInconnues,
  fractionASachantB,
  fractionBSachantA,
  valeurBranche,
} from "../../moteur6e/verificationArbreTableauEffectifs";
import {
  LIBELLE_PHASE,
  consigneEcran,
  consigneGenerale,
  construireArbre,
  construireTableau,
  decimalLatex,
  egaliteFraction,
  entierLatex,
  entierTexte,
  formatReponseAttenduePhaseLatex,
  latexBranche,
  latexCellule,
  latexPAsachantB,
  latexPBsachantA,
  verdictIndependanceTexte,
} from "../../ui6e/formatArbreTableauEffectifs";
import { arbreSvg, tableauHtml } from "../../ui6e/figuresArbreTableauEffectifs";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceArbreTableauEffectifs, type IdVarianteArbreTableauEffectifs } from "./index";
import { profilArbreTableauEffectifs } from "../profilsEvaluationProbabilites74";

/**
 * Adaptateur feuille d'exercices / évaluation de `6gen74` (« Arbre, tableau, effectifs : une
 * situation, trois écritures ») — méthode `.claude/rules/feuilles-evaluations.md`.
 *
 * - Énoncé papier = la situation (texte, pourcentages, ou arbre / tableau partiel en figure) + UNE
 *   consigne globale ; jamais les écrans de guidage. Les données d'une figure sont aussi écrites en
 *   clair (« Données : … ») pour les exports sans figure.
 * - Les 4 écrans (`phasesPourExercice`, `consigneEcran`) deviennent les étapes du corrigé
 *   (`sousQuestion` = lettre de l'écran, dans l'ordre du sens de départ) ; arbre et tableau
 *   complets en `figureHtml`. Toutes les valeurs viennent des fonctions de l'écran.
 * - Version aménagée : même énoncé (contrat du pipeline).
 */

type Ex = ExerciceArbreTableauEffectifs;

const LETTRES = "abcdefghij";

function lettre(e: Ex, phase: PhaseArbreTableauEffectifs): string {
  return LETTRES[phasesPourExercice(e).indexOf(phase)];
}

function lettresAB(e: Ex) {
  return { A: e.contexte.lettreA, B: e.contexte.lettreB };
}

const dec = (v: number) => decimalLatex(v);
const ent = (n: number) => entierLatex(n);

// ============================================================================
// Énoncé
// ============================================================================

function figureDonnee(e: Ex): string | undefined {
  if (e.mode === "arbrePartiel") return arbreSvg(construireArbre(e, branchesInconnues(e)), "Arbre pondéré partiellement complété");
  if (e.mode === "tableauPartiel") return `<div>${tableauHtml(construireTableau(e, cellulesInconnues(e)))}</div>`;
  return undefined;
}

/** Données d'une figure, écrites en clair (exports sans figure). */
function donneesEnClair(e: Ex): FragmentConsigne[] {
  if (e.mode === "arbrePartiel") return [texte(" Données de l'arbre : "), latex(e.branchesDonnees.map((b) => `${latexBranche(e, b)}=${dec(valeurBranche(e, b))}`).join(",\\quad ")), texte(".")];
  if (e.mode === "tableauPartiel") return [texte(" Données du tableau : "), latex(e.cellulesDonnees.map((c) => `${latexCellule(e, c)}=${ent(e.effectifs[c])}`).join(",\\quad ")), texte(".")];
  return [];
}

function consigneGlobale(e: Ex): FragmentConsigne[] {
  const { A, B } = lettresAB(e);
  const effectifs = `le tableau des effectifs des ${entierTexte(e.effectifs.N)} ${e.contexte.population}`;
  const debut =
    e.mode === "pourcentages"
      ? `Représente la situation par un arbre pondéré, puis construis ${effectifs}. Calcule ensuite `
      : e.mode === "arbrePartiel"
        ? `Calcule les probabilités inconnues (« ? ») de l'arbre pondéré, puis construis ${effectifs}. Calcule ensuite `
        : "Calcule les effectifs inconnus (« ? ») du tableau, puis représente la situation par un arbre pondéré. Calcule ensuite ";
  return [
    texte(` ${debut}`),
    latex(latexPBsachantA(e)),
    texte(" et "),
    latex(latexPAsachantB(e)),
    texte(" (forme exacte ou décimale arrondie au centième). Enfin, dis si "),
    latex(A),
    texte(" et "),
    latex(B),
    texte(" sont indépendants, en justifiant."),
  ];
}

/** Sur papier, rien n'est « à compléter » (pas de place de réponse, règle utilisateur) : les
 * branches inconnues sont marquées « ? » sur la figure. */
function situationPapier(e: Ex): FragmentConsigne[] {
  return (consigneGenerale(e) as FragmentConsigne[]).map((f) =>
    f.type === "texte" ? { ...f, valeur: f.valeur.replace("certaines branches sont à compléter", "les probabilités inconnues sont marquées « ? »") } : f,
  );
}

function entetePapier(e: Ex): FragmentConsigne[] {
  return [...situationPapier(e), ...donneesEnClair(e), ...consigneGlobale(e)];
}

/** Énoncé « par écrans » : ses questions donnent les titres d'étapes du corrigé (« Étape n — … »). */
function construireEnonce(e: Ex): SectionExercice {
  return {
    enteteFragments: entetePapier(e),
    enteteHtml: figureDonnee(e),
    questions: phasesPourExercice(e).map((phase) => ({ consigne: consigneEcran(e, phase) as FragmentConsigne[] })),
  };
}

function enoncePapier(e: Ex): EnoncePapier {
  return { section: { enteteFragments: entetePapier(e), enteteHtml: figureDonnee(e), questions: [] } };
}

function construireCorrection(e: Ex): BlocCorrection[] {
  return phasesPourExercice(e).map((phase, i) => ({
    type: "paragraphe",
    fragments: [
      texte(`${LETTRES[i]}) ${LIBELLE_PHASE[phase]} : `),
      ...(phase === "independance" ? [texte(`${verdictIndependanceTexte(e)} `)] : []),
      latex(formatReponseAttenduePhaseLatex(e, phase).join(",\\quad ")),
    ],
  }));
}

// ============================================================================
// Corrigé détaillé
// ============================================================================







// ============================================================================
// Réponse brève, difficulté, barème
// ============================================================================

function reponseBreve(e: Ex): FragmentConsigne[] {
  const { A, B } = lettresAB(e);
  return [
    latex(`n(${A}\\cap ${B})=${ent(e.effectifs.AB)}`),
    texte(" ; "),
    latex(`${latexPBsachantA(e)}=${egaliteFraction(fractionBSachantA(e))}`),
    texte(" ; "),
    latex(`${latexPAsachantB(e)}=${egaliteFraction(fractionASachantB(e))}`),
    texte(` ; ${verdictIndependanceTexte(e)}`),
  ];
}


/** Niveau (`niveauDifficulte.ts`) : une étape par écran (quatre) ; méthode 1 (traduire pourcentages,
 * arbre et tableau l'un dans l'autre, conditionnelle dans la bonne sous-population) ; aucun piège
 * dans les données ; nombres 0 (effectifs entiers, branches décimales exactes). Étape « indépendance »
 * sans charge : niveau et durée constants quel que soit le verdict. */
function criteresDifficulte(e: Ex): CriteresDifficulte {
  const base = etapesDuCorrige(correctionDetailleeArbreTableauEffectifs(e));
  return { ...base, lettresSansCharge: [...(base.lettresSansCharge ?? []), lettre(e, "independance")], methode: 1, piege: 0, nombres: 0 };
}

const crit = (sousQuestion: string, points: number, ...critere: FragmentConsigne[]) => ({ sousQuestion, points, critere });

function bareme(e: Ex): BaremeExercice {
  const { A, B } = lettresAB(e);
  const La = lettre(e, "arbre");
  const Lt = lettre(e, "tableau");
  const Lc = lettre(e, "conditionnelles");
  const Li = lettre(e, "independance");
  const branches = (liste: CleBranche[]) => latex(liste.map((b) => `${latexBranche(e, b)}=${dec(valeurBranche(e, b))}`).join(",\\ "));
  const cellules = (liste: CleCellule[]) => latex(liste.map((k) => `${latexCellule(e, k)}=${ent(e.effectifs[k])}`).join(",\\ "));
  const criteresArbre =
    e.mode === "arbrePartiel"
      ? [crit(La, 1, texte("Branches manquantes (complémentaires sur chaque nœud) : "), branches(branchesInconnues(e)))]
      : [crit(La, 0.5, texte("1er niveau : "), branches(["A", "nA"])), crit(La, 0.5, texte("2e niveau (probabilités conditionnelles) : "), branches(["B_A", "nB_A", "B_nA", "nB_nA"]))];
  const criteresTableau =
    e.mode === "tableauPartiel"
      ? [crit(Lt, 1, texte("Cases manquantes : "), cellules(cellulesInconnues(e)))]
      : [crit(Lt, 0.5, texte("Cases intérieures : "), cellules(["AB", "AnB", "nAB", "nAnB"])), crit(Lt, 0.5, texte("Totaux : "), cellules(["A", "nA", "B", "nB"]))];
  return {
    reponseFinale: reponseBreve(e),
    criteres: [
      ...criteresArbre,
      ...criteresTableau,
      crit(Lc, 0.5, latex(`${latexPBsachantA(e)}=${egaliteFraction(fractionBSachantA(e))}`)),
      crit(Lc, 1, latex(`${latexPAsachantB(e)}=${egaliteFraction(fractionASachantB(e))}`), texte(" (dénominateur "), latex(`n(${B})`), texte(")")),
      crit(Li, 0.5, texte("Comparaison chiffrée de "), latex(latexPBsachantA(e)), texte(" et "), latex(`P(${B})`), texte(` (ou des produits d'effectifs) et conclusion : ${verdictIndependanceTexte(e)}`)),
    ],
    erreursFrequentes: [
      { description: [latex(latexPAsachantB(e)), texte(" calculée en divisant par "), latex(`n(${A})`), texte(" (confusion avec "), latex(latexPBsachantA(e)), texte(")")], cout: "0 pt sur cette probabilité" },
      { description: [texte("Branche du 2e niveau calculée en divisant par l'effectif total "), latex("N")], cout: "−0,5" },
      { description: [texte("Indépendance affirmée ou niée sans comparaison chiffrée")], cout: "0 pt sur l'indépendance" },
    ],
    reponsesAcceptees: [[texte("Probabilités écrites en pourcentage ou en fraction non simplifiée (par exemple "), latex("\\dfrac{18}{120}"), texte(" pour "), latex("0{,}15"), texte(")")]],
  };
}

export const adaptateurEvaluationArbreTableauEffectifs: AdaptateurFeuilleExercices<ExerciceArbreTableauEffectifs> = {
  profilInstance: profilArbreTableauEffectifs,
  titreDocument: "Arbre, tableau, effectifs : une situation, trois écritures — Évaluation",
  nomFichierBase: "arbre-tableau-effectifs",
  genererInstance: genererExerciceArbreTableauEffectifs,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as IdVarianteArbreTableauEffectifs),
  construireEnonce,
  construireCorrection,
  reponseBreve,
  correctionDetaillee: correctionDetailleeArbreTableauEffectifs,
  criteresDifficulte,
  bareme,
  enoncePapier,
};
