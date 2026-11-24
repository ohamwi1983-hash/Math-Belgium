import type { CleBranche, CleCellule, ExerciceArbreTableauEffectifs } from "../../core6e/arbreTableauEffectifs.types";
import type { EtapeCorrection, FragmentConsigne, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { phasesPourExercice } from "../../moteur6e/typesArbreTableauEffectifs";
import type { PhaseArbreTableauEffectifs } from "../../moteur6e/typesArbreTableauEffectifs";
import { branchesInconnues, brancheComplementaire, fractionASachantB, fractionB, fractionBSachantA, fractionBranche, ordreRemplissage, sontIndependantsArbreTableau, valeurBranche } from "../../moteur6e/verificationArbreTableauEffectifs";
import { construireArbre, construireTableau, decimalLatex, entierLatex, formatReponseAttenduePhaseLatex, latexBranche, latexCellule, latexPAsachantB, latexPBsachantA, verdictIndependanceTexte } from "../../ui6e/formatArbreTableauEffectifs";
import { arbreSvg, tableauHtml } from "../../ui6e/figuresArbreTableauEffectifs";
import { COURS_INDEPENDANCE, calcul, finaliser, latex, ligne, listeEt, pgcd, piege, resultat, texte, utiliseCours, verification } from "../../ui6e/corrigeProbabilites";

/**
 * Corrigé détaillé « comme au tableau » de `6gen74` (Arbre, tableau, effectifs) — partagé par
 * l'adaptateur papier et le générateur interactif (étape révélée). Une lettre par écran, dans l'ordre
 * du sens de départ (`phasesPourExercice`) ; arbre et tableau complets en `figureHtml`. Valeurs : les
 * effectifs entiers de l'instance (`effectifs`), mêmes écritures que l'écran (`\bar{A}`, `P(B\mid A)`,
 * milliers espacés).
 */

type Ex = ExerciceArbreTableauEffectifs;
type Fragments = FragmentConsigne[];
const LETTRES = "abcdefghij";
const COURS = COURS_INDEPENDANCE;
const dec = (v: number) => decimalLatex(v);
const ent = (n: number) => entierLatex(n);

export function lettreEcranArbreTableau(e: Ex, phase: PhaseArbreTableauEffectifs): string {
  return LETTRES[phasesPourExercice(e).indexOf(phase)];
}

function lettresAB(e: Ex) {
  return { A: e.contexte.lettreA, B: e.contexte.lettreB };
}

function reponse(e: Ex, phase: PhaseArbreTableauEffectifs): Fragments {
  return listeEt(formatReponseAttenduePhaseLatex(e, phase));
}

/** « gauche = n/d » (effectifs), fraction irréductible si elle diffère, puis valeur (exacte à 4
 * décimales, ou arrondie au centième comme l'écran). */
function lignesQuotient(gauche: string, num: number, den: number, justification: string | Fragments): LigneCalcul[] {
  const lignes: LigneCalcul[] = [ligne(`${gauche}=\\dfrac{${ent(num)}}{${ent(den)}}`, justification)];
  const g = pgcd(num, den);
  if (g > 1 && den / g !== 1) lignes.push(ligne(`=\\dfrac{${ent(num / g)}}{${ent(den / g)}}`, `on simplifie par ${g}`));
  const v = num / den;
  const exact = Math.abs(Math.round(v * 10000) * den - num * 10000) < 1e-6;
  lignes.push(ligne(exact ? `=${dec(v)}` : `\\approx ${(Math.round(v * 100) / 100).toFixed(2).replace(".", "{,}")}`, exact ? "valeur décimale" : "arrondi au centième"));
  return lignes;
}

// ============================================================================
// Étapes
// ============================================================================

function etapeArbre(e: Ex): EtapeCorrection[] {
  const L = lettreEcranArbreTableau(e, "arbre");
  const { A } = lettresAB(e);
  const n = e.effectifs;
  const complement = (b: CleBranche): LigneCalcul[] => [ligne(`${latexBranche(e, b)}=1-${latexBranche(e, brancheComplementaire(b))}`, "branches d'un même nœud : somme 1"), ligne(`=1-${dec(valeurBranche(e, brancheComplementaire(b)))}`), ligne(`=${dec(valeurBranche(e, b))}`)];
  let utiliseFr: Fragments;
  let lignes: LigneCalcul[];
  if (e.mode === "pourcentages") {
    utiliseFr = [texte("Chaque pourcentage devient une probabilité (on divise par 100). Le premier porte sur toute la population : 1er niveau. Les deux autres sont pris « parmi » un groupe : ce sont des probabilités conditionnelles, portées par les branches issues du nœud de ce groupe ; sur chaque nœud, les branches ont pour somme 1")];
    const pct = (b: CleBranche): LigneCalcul[] => {
      const v = valeurBranche(e, b);
      return [ligne(`${latexBranche(e, b)}=\\dfrac{${dec(v * 100)}}{100}`, b === "A" ? "pourcentage de toute la population" : "pourcentage pris « parmi » un groupe"), ligne(`=${dec(v)}`)];
    };
    lignes = [...pct("A"), ...pct("B_A"), ...pct("B_nA"), ...complement("nA"), ...complement("nB_A"), ...complement("nB_nA")];
  } else if (e.mode === "arbrePartiel") {
    utiliseFr = [texte("Les branches issues d'un même nœud ont des probabilités de somme 1 : chaque branche manquante est le complément à 1 de la branche donnée issue du même nœud")];
    lignes = branchesInconnues(e).flatMap(complement);
  } else {
    utiliseFr = [texte("On divise chaque effectif par celui du nœud de départ : par "), latex("N"), texte(" au 1er niveau, par "), latex(`n(${A})`), texte(" ou "), latex(`n(\\bar{${A}})`), texte(" au 2e niveau (probabilités conditionnelles)")];
    const q = (b: CleBranche, justification: string): LigneCalcul[] => {
      const f = fractionBranche(e, b);
      return lignesQuotient(latexBranche(e, b), f.num, f.den, justification);
    };
    lignes = [...q("A", "effectif sur N"), ...q("nA", "effectif sur N"), ...q("B_A", `on choisit parmi ${ent(n.A)}`), ...q("nB_A", `on choisit parmi ${ent(n.A)}`), ...q("B_nA", `on choisit parmi ${ent(n.nA)}`), ...q("nB_nA", `on choisit parmi ${ent(n.nA)}`)];
  }
  return [
    utiliseCours(L, utiliseFr, COURS),
    calcul(L, lignes),
    { ...resultat(L, reponse(e, "arbre")), figureHtml: arbreSvg(construireArbre(e, []), "Arbre pondéré complet") },
    piege(L, [texte("Diviser un effectif du 2e niveau par l'effectif total "), latex("N"), texte(" : une branche du 2e niveau est une probabilité conditionnelle, on divise par l'effectif de son nœud.")]),
  ];
}

function etapeTableau(e: Ex): EtapeCorrection[] {
  const L = lettreEcranArbreTableau(e, "tableau");
  const { A, B } = lettresAB(e);
  const n = e.effectifs;
  const c = (k: CleCellule) => latexCellule(e, k);
  const lignes: LigneCalcul[] = [];
  let utiliseFr: Fragments;
  if (e.mode === "tableauPartiel") {
    utiliseFr = [texte("Dans chaque ligne et dans chaque colonne, les deux cases ont pour somme le total : on complète de proche en proche, en commençant par une ligne ou une colonne où il ne manque qu'une case")];
    for (const pas of ordreRemplissage(e.cellulesDonnees) ?? []) {
      const [total, p1, p2] = pas.relation;
      if (pas.cle === total) lignes.push(ligne(`${c(total)}=${c(p1)}+${c(p2)}`, "somme des deux cases"), ligne(`=${ent(n[p1])}+${ent(n[p2])}`), ligne(`=${ent(n[total])}`));
      else {
        const autre = pas.cle === p1 ? p2 : p1;
        lignes.push(ligne(`${c(pas.cle)}=${c(total)}-${c(autre)}`, "total moins l'autre case"), ligne(`=${ent(n[total])}-${ent(n[autre])}`), ligne(`=${ent(n[pas.cle])}`));
      }
    }
  } else {
    utiliseFr = [texte("L'effectif d'un chemin vaut l'effectif de son nœud de départ multiplié par la probabilité de la branche ; les autres cases s'obtiennent par soustraction, les totaux par addition")];
    lignes.push(
      ligne(`${c("A")}=${ent(n.N)}\\times ${dec(valeurBranche(e, "A"))}`, "N fois la branche"),
      ligne(`=${ent(n.A)}`),
      ligne(`${c("nA")}=${ent(n.N)}-${ent(n.A)}`, "le reste de la population"),
      ligne(`=${ent(n.nA)}`),
      ligne(`${c("AB")}=${ent(n.A)}\\times ${dec(valeurBranche(e, "B_A"))}`, `n(${A}) fois la branche`),
      ligne(`=${ent(n.AB)}`),
      ligne(`${c("AnB")}=${ent(n.A)}-${ent(n.AB)}`, `ligne ${A}`),
      ligne(`=${ent(n.AnB)}`),
      ligne(`${c("nAB")}=${ent(n.nA)}\\times ${dec(valeurBranche(e, "B_nA"))}`, [texte("effectif de "), latex(`\\bar{${A}}`), texte(" fois la branche")]),
      ligne(`=${ent(n.nAB)}`),
      ligne(`${c("nAnB")}=${ent(n.nA)}-${ent(n.nAB)}`, [texte("ligne "), latex(`\\bar{${A}}`)]),
      ligne(`=${ent(n.nAnB)}`),
      ligne(`${c("B")}=${ent(n.AB)}+${ent(n.nAB)}`, `colonne ${B}`),
      ligne(`=${ent(n.B)}`),
      ligne(`${c("nB")}=${ent(n.AnB)}+${ent(n.nAnB)}`, [texte("colonne "), latex(`\\bar{${B}}`)]),
      ligne(`=${ent(n.nB)}`),
    );
  }
  return [
    utiliseCours(L, utiliseFr, COURS),
    calcul(L, lignes),
    { ...resultat(L, reponse(e, "tableau")), figureHtml: `<div>${tableauHtml(construireTableau(e, []))}</div>` },
    verification(L, [texte("Les deux colonnes et les deux lignes redonnent l'effectif total : "), latex(`${ent(n.B)}+${ent(n.nB)}=${ent(n.N)}`), texte(" et "), latex(`${ent(n.A)}+${ent(n.nA)}=${ent(n.N)}`), texte(".")]),
    piege(L, [texte("Multiplier par "), latex("N"), texte(" une probabilité du 2e niveau : elle s'applique à l'effectif de son groupe.")]),
  ];
}

function etapeConditionnelles(e: Ex): EtapeCorrection[] {
  const L = lettreEcranArbreTableau(e, "conditionnelles");
  const { A, B } = lettresAB(e);
  const bA = fractionBSachantA(e);
  const aB = fractionASachantB(e);
  const egales = bA.num * aB.den === aB.num * bA.den;
  return [
    utiliseCours(L, [texte("Une probabilité conditionnelle se calcule dans la sous-population de la condition (l'événement écrit après la barre) : on divise par son effectif, "), latex(`P(${B}\\mid ${A})=\\dfrac{n(${A}\\cap ${B})}{n(${A})}`)], COURS),
    calcul(L, [
      ligne(`${latexPBsachantA(e)}=\\dfrac{n(${A}\\cap ${B})}{n(${A})}`, "on choisit parmi " + A),
      ...lignesQuotient("", bA.num, bA.den, "effectifs du tableau"),
      ligne(`${latexPAsachantB(e)}=\\dfrac{n(${A}\\cap ${B})}{n(${B})}`, "on choisit parmi " + B),
      ...lignesQuotient("", aB.num, aB.den, "effectifs du tableau"),
    ]),
    resultat(L, reponse(e, "conditionnelles")),
    verification(L, egales ? [texte("Les deux probabilités sont égales parce que "), latex(`n(${A})=n(${B})`), texte(" : c'est une coïncidence, pas une règle.")] : [latex(latexPBsachantA(e)), texte(" se lit sur l'arbre (branche de "), latex(A), texte(" vers "), latex(B), texte("), alors que "), latex(latexPAsachantB(e)), texte(" ne s'y lit pas.")]),
    piege(L, [texte("Ne pas confondre "), latex(latexPBsachantA(e)), texte(" (on divise par "), latex(`n(${A})`), texte(") et "), latex(latexPAsachantB(e)), texte(" (on divise par "), latex(`n(${B})`), texte(", total de la colonne).")]),
  ];
}

function etapeIndependance(e: Ex): EtapeCorrection[] {
  const L = lettreEcranArbreTableau(e, "independance");
  const { A, B } = lettresAB(e);
  const n = e.effectifs;
  const fB = fractionB(e);
  const indep = sontIndependantsArbreTableau(e);
  return [
    utiliseCours(L, [latex(A), texte(" et "), latex(B), texte(" sont indépendants lorsque "), latex(`P(${B}\\mid ${A})=P(${B})`), texte(", ou, avec les effectifs, "), latex(`n(${A}\\cap ${B})\\times N=n(${A})\\times n(${B})`)], COURS),
    calcul(L, [
      ...lignesQuotient(`P(${B})`, fB.num, fB.den, "effectif de la colonne sur N"),
      ligne(`n(${A}\\cap ${B})\\times N=${ent(n.AB)}\\times ${ent(n.N)}`, "produit en croix"),
      ligne(`=${ent(n.AB * n.N)}`),
      ligne(`n(${A})\\times n(${B})=${ent(n.A)}\\times ${ent(n.B)}`, "produit en croix"),
      ligne(`=${ent(n.A * n.B)}`),
      ligne(`${ent(n.AB * n.N)}${indep ? "=" : "\\neq "}${ent(n.A * n.B)}`, [texte("donc "), latex(indep ? `${latexPBsachantA(e)}=P(${B})` : `${latexPBsachantA(e)}\\neq P(${B})`)]),
    ]),
    resultat(L, [texte(verdictIndependanceTexte(e))]),
    piege(L, [texte("Conclure sur des valeurs arrondies « presque égales » : l'égalité doit être exacte (produits en croix des effectifs).")]),
  ];
}

export function correctionDetailleeArbreTableauEffectifs(e: Ex): EtapeCorrection[] {
  const parPhase: Record<PhaseArbreTableauEffectifs, () => EtapeCorrection[]> = {
    arbre: () => etapeArbre(e),
    tableau: () => etapeTableau(e),
    conditionnelles: () => etapeConditionnelles(e),
    independance: () => etapeIndependance(e),
  };
  return finaliser(phasesPourExercice(e).flatMap((p) => parPhase[p]()));
}
