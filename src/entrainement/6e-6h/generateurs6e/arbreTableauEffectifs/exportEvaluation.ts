import type { CleBranche, CleCellule, ExerciceArbreTableauEffectifs } from "../../core6e/arbreTableauEffectifs.types";
import type {
  AdaptateurFeuilleExercices,
  BaremeExercice,
  BlocCorrection,
  EnoncePapier,
  EtapeCorrection,
  FragmentConsigne,
  SectionExercice,
} from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { phasesPourExercice } from "../../moteur6e/typesArbreTableauEffectifs";
import type { PhaseArbreTableauEffectifs } from "../../moteur6e/typesArbreTableauEffectifs";
import {
  branchesInconnues,
  brancheComplementaire,
  cellulesInconnues,
  fractionASachantB,
  fractionB,
  fractionBSachantA,
  ordreRemplissage,
  sontIndependantsArbreTableau,
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
        ? `Complète l'arbre pondéré, puis construis ${effectifs}. Calcule ensuite `
        : "Complète le tableau des effectifs, puis représente la situation par un arbre pondéré. Calcule ensuite ";
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

function entetePapier(e: Ex): FragmentConsigne[] {
  return [...(consigneGenerale(e) as FragmentConsigne[]), ...donneesEnClair(e), ...consigneGlobale(e)];
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

function correctionArbre(e: Ex): EtapeCorrection[] {
  const L = lettre(e, "arbre");
  const { A } = lettresAB(e);
  const n = e.effectifs;
  const lignes: EtapeCorrection[] = [];
  const egal = (b: CleBranche) => `${latexBranche(e, b)}=${dec(valeurBranche(e, b))}`;
  if (e.mode === "pourcentages") {
    lignes.push({
      label: "Méthode",
      sousQuestion: L,
      fragments: [
        texte("Chaque pourcentage devient une probabilité (on divise par 100). Le premier porte sur toute la population : 1er niveau. Les deux autres sont pris « parmi » un groupe : ce sont des probabilités conditionnelles, portées par les branches qui partent du nœud de ce groupe."),
      ],
    });
    lignes.push({ label: "Calcul", sousQuestion: L, fragments: [texte("Traduction des pourcentages : "), latex(["A", "B_A", "B_nA"].map((b) => egal(b as CleBranche)).join(",\\quad "))] });
    lignes.push({
      label: "Calcul",
      sousQuestion: L,
      fragments: [texte("Branches complémentaires (somme 1 sur chaque nœud) : "), latex((["nA", "nB_A", "nB_nA"] as CleBranche[]).map((b) => `${latexBranche(e, b)}=1-${dec(valeurBranche(e, brancheComplementaire(b)))}=${dec(valeurBranche(e, b))}`).join(",\\quad "))],
    });
  } else if (e.mode === "arbrePartiel") {
    lignes.push({ label: "Méthode", sousQuestion: L, fragments: [texte("Les branches qui partent d'un même nœud ont des probabilités de somme 1 : chaque branche manquante est la complémentaire de la branche donnée issue du même nœud.")] });
    lignes.push({
      label: "Calcul",
      sousQuestion: L,
      fragments: [latex(branchesInconnues(e).map((b) => `${latexBranche(e, b)}=1-${dec(valeurBranche(e, brancheComplementaire(b)))}=${dec(valeurBranche(e, b))}`).join(",\\quad "))],
    });
  } else {
    lignes.push({ label: "Méthode", sousQuestion: L, fragments: [texte("On divise chaque effectif par celui du nœud de départ : par "), latex("N"), texte(" au 1er niveau, par "), latex(`n(${A})`), texte(" ou "), latex(`n(\\bar{${A}})`), texte(" au 2e niveau.")] });
    lignes.push({
      label: "Calcul",
      sousQuestion: L,
      fragments: [texte("1er niveau : "), latex(`P(${A})=\\dfrac{${ent(n.A)}}{${ent(n.N)}}=${dec(valeurBranche(e, "A"))},\\quad P(\\bar{${A}})=\\dfrac{${ent(n.nA)}}{${ent(n.N)}}=${dec(valeurBranche(e, "nA"))}`)],
    });
    lignes.push({
      label: "Calcul",
      sousQuestion: L,
      fragments: [
        texte("2e niveau : "),
        latex(
          [
            `${latexBranche(e, "B_A")}=\\dfrac{${ent(n.AB)}}{${ent(n.A)}}=${dec(valeurBranche(e, "B_A"))}`,
            `${latexBranche(e, "nB_A")}=\\dfrac{${ent(n.AnB)}}{${ent(n.A)}}=${dec(valeurBranche(e, "nB_A"))}`,
          ].join(",\\quad "),
        ),
        texte(" ; "),
        latex(
          [
            `${latexBranche(e, "B_nA")}=\\dfrac{${ent(n.nAB)}}{${ent(n.nA)}}=${dec(valeurBranche(e, "B_nA"))}`,
            `${latexBranche(e, "nB_nA")}=\\dfrac{${ent(n.nAnB)}}{${ent(n.nA)}}=${dec(valeurBranche(e, "nB_nA"))}`,
          ].join(",\\quad "),
        ),
      ],
    });
  }
  lignes.push({ label: "Conclusion", sousQuestion: L, fragments: [texte("L'arbre pondéré complet :")], figureHtml: arbreSvg(construireArbre(e, []), "Arbre pondéré complet") });
  return lignes;
}

function correctionTableau(e: Ex): EtapeCorrection[] {
  const L = lettre(e, "tableau");
  const { A, B } = lettresAB(e);
  const n = e.effectifs;
  const c = (k: CleCellule) => latexCellule(e, k);
  const lignes: EtapeCorrection[] = [];
  if (e.mode === "tableauPartiel") {
    lignes.push({ label: "Méthode", sousQuestion: L, fragments: [texte("Dans chaque ligne et dans chaque colonne, les deux cases ont pour somme le total : on complète de proche en proche, en commençant par une ligne ou une colonne où il ne manque qu'une case.")] });
    for (const pas of ordreRemplissage(e.cellulesDonnees) ?? []) {
      const [total, p1, p2] = pas.relation;
      let calcul: string;
      if (pas.cle === total) calcul = `${c(total)}=${c(p1)}+${c(p2)}=${ent(n[p1])}+${ent(n[p2])}=${ent(n[total])}`;
      else {
        const autre = pas.cle === p1 ? p2 : p1;
        calcul = `${c(pas.cle)}=${c(total)}-${c(autre)}=${ent(n[total])}-${ent(n[autre])}=${ent(n[pas.cle])}`;
      }
      lignes.push({ label: "Calcul", sousQuestion: L, fragments: [latex(calcul)] });
    }
  } else {
    lignes.push({
      label: "Méthode",
      sousQuestion: L,
      fragments: [texte("L'effectif d'un chemin vaut "), latex("N"), texte(" multiplié par les probabilités lues le long du chemin ; les autres cases s'obtiennent par soustraction, les totaux par addition.")],
    });
    lignes.push({ label: "Calcul", sousQuestion: L, fragments: [latex(`${c("A")}=${ent(n.N)}\\times${dec(valeurBranche(e, "A"))}=${ent(n.A)},\\quad ${c("nA")}=${ent(n.N)}-${ent(n.A)}=${ent(n.nA)}`)] });
    lignes.push({ label: "Calcul", sousQuestion: L, fragments: [latex(`${c("AB")}=${ent(n.A)}\\times${dec(valeurBranche(e, "B_A"))}=${ent(n.AB)},\\quad ${c("AnB")}=${ent(n.A)}-${ent(n.AB)}=${ent(n.AnB)}`)] });
    lignes.push({ label: "Calcul", sousQuestion: L, fragments: [latex(`${c("nAB")}=${ent(n.nA)}\\times${dec(valeurBranche(e, "B_nA"))}=${ent(n.nAB)},\\quad ${c("nAnB")}=${ent(n.nA)}-${ent(n.nAB)}=${ent(n.nAnB)}`)] });
    lignes.push({ label: "Calcul", sousQuestion: L, fragments: [latex(`${c("B")}=${ent(n.AB)}+${ent(n.nAB)}=${ent(n.B)},\\quad ${c("nB")}=${ent(n.AnB)}+${ent(n.nAnB)}=${ent(n.nB)}`)] });
  }
  lignes.push({ label: "Vérification", sousQuestion: L, fragments: [latex(`n(${B})+n(\\bar{${B}})=${ent(n.B)}+${ent(n.nB)}=${ent(n.N)}=n(${A})+n(\\bar{${A}})`)] });
  lignes.push({ label: "Conclusion", sousQuestion: L, fragments: [texte("Le tableau des effectifs complet :")], figureHtml: `<div>${tableauHtml(construireTableau(e, []))}</div>` });
  return lignes;
}

function correctionConditionnelles(e: Ex): EtapeCorrection[] {
  const L = lettre(e, "conditionnelles");
  const { A, B } = lettresAB(e);
  const bA = fractionBSachantA(e);
  const aB = fractionASachantB(e);
  const egales = bA.num * aB.den === aB.num * bA.den;
  return [
    {
      label: "Méthode",
      sousQuestion: L,
      fragments: [texte("Une probabilité conditionnelle se calcule dans la sous-population de la condition (l'événement écrit après la barre) : on divise par son effectif.")],
    },
    { label: "Calcul", sousQuestion: L, fragments: [latex(`${latexPBsachantA(e)}=\\dfrac{n(${A}\\cap ${B})}{n(${A})}=${egaliteFraction(bA)}`), texte(" : c'est la branche de l'arbre qui va de "), latex(A), texte(" à "), latex(B), texte(".")] },
    { label: "Calcul", sousQuestion: L, fragments: [latex(`${latexPAsachantB(e)}=\\dfrac{n(${A}\\cap ${B})}{n(${B})}=${egaliteFraction(aB)}`), texte(" : elle ne se lit pas sur l'arbre ; son dénominateur est le total de la colonne de "), latex(B), texte(".")] },
    {
      label: "Conclusion",
      sousQuestion: L,
      fragments: egales
        ? [texte("Ici les deux probabilités sont égales, parce que "), latex(`n(${A})=n(${B})`), texte(" : c'est une coïncidence, pas une règle.")]
        : [texte("Les deux probabilités sont différentes : "), latex(`${latexPBsachantA(e)}\\neq ${latexPAsachantB(e)}`), texte(".")],
    },
  ];
}

function correctionIndependance(e: Ex): EtapeCorrection[] {
  const L = lettre(e, "independance");
  const { A, B } = lettresAB(e);
  const n = e.effectifs;
  const bA = fractionBSachantA(e);
  const indep = sontIndependantsArbreTableau(e);
  return [
    {
      label: "Méthode",
      sousQuestion: L,
      fragments: [latex(A), texte(" et "), latex(B), texte(" sont indépendants lorsque "), latex(`${latexPBsachantA(e)}=P(${B})`), texte(" : savoir que "), latex(A), texte(" est réalisé ne change pas la probabilité de "), latex(B), texte(".")],
    },
    { label: "Calcul", sousQuestion: L, fragments: [latex(`P(${B})=\\dfrac{n(${B})}{N}=${egaliteFraction(fractionB(e))}`), texte(" et "), latex(`${latexPBsachantA(e)}=${dec(bA.num / bA.den)}`)] },
    {
      label: "Vérification",
      sousQuestion: L,
      fragments: [texte("Avec les effectifs : "), latex(`n(${A}\\cap ${B})\\times N=${ent(n.AB)}\\times${ent(n.N)}=${ent(n.AB * n.N)}`), texte(indep ? " est égal à " : " est différent de "), latex(`n(${A})\\times n(${B})=${ent(n.A)}\\times${ent(n.B)}=${ent(n.A * n.B)}`), texte(".")],
    },
    {
      label: "Conclusion",
      sousQuestion: L,
      fragments: [latex(indep ? `${latexPBsachantA(e)}=P(${B})` : `${latexPBsachantA(e)}\\neq P(${B})`), texte(` : ${verdictIndependanceTexte(e)}`)],
    },
  ];
}

function piege(e: Ex): EtapeCorrection {
  const { A, B } = lettresAB(e);
  return {
    label: "Piège",
    fragments: [
      texte("Ne pas confondre "),
      latex(latexPBsachantA(e)),
      texte(" (on divise par "),
      latex(`n(${A})`),
      texte(", elle se lit sur l'arbre) et "),
      latex(latexPAsachantB(e)),
      texte(" (on divise par "),
      latex(`n(${B})`),
      texte(", total de la colonne, qui ne se lit pas sur l'arbre)."),
    ],
  };
}

function correctionDetaillee(e: Ex): EtapeCorrection[] {
  const parPhase: Record<PhaseArbreTableauEffectifs, () => EtapeCorrection[]> = {
    arbre: () => correctionArbre(e),
    tableau: () => correctionTableau(e),
    conditionnelles: () => correctionConditionnelles(e),
    independance: () => correctionIndependance(e),
  };
  return [...phasesPourExercice(e).flatMap((p) => parPhase[p]()), piege(e)];
}

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

function difficulte(e: Ex): 1 | 2 | 3 {
  return e.mode === "tableauPartiel" ? 3 : 2;
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
  difficulte,
  reponseBreve,
  correctionDetaillee,
  bareme,
  enoncePapier,
  dureeMinutes: 12,
};
