import type { EtapeCorrection, FragmentConsigne, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import type {
  ExerciceAlgebriqueRangN,
  ExerciceAlgebriqueSommeSn,
  ExerciceAlgebriqueTermeGeneral,
  ExercicePrincipalSuiteGeometrique,
  ExerciceSuiteGeometrique,
  FractionQ,
  TermeLineaire,
  TermeLineaireFractionQ,
} from "../../core5e/suitesGeometriques.types";
import type { PhaseSuiteGeometrique } from "../../moteur5e/typesSuiteGeometrique";
import { ordreComplet } from "../../moteur5e/typesSuiteGeometrique";
import { formatTermesReponseAttendueSuiteGeometrique } from "../../ui5e/formatSuiteGeometrique";
import {
  COURS_CONVERGENCE,
  dedoublonner,
  lignesArrondi,
  lignesSommeGeometrique,
  COURS_GEOMETRIQUE,
  abs,
  divise,
  egal,
  ent,
  estEntier,
  fois,
  fr,
  fragmentsListe,
  frT,
  inverse,
  justifDiviser,
  lignesDiviser,
  lignesPremierDegre,
  lin,
  moins,
  nomIndice,
  par,
  parT,
  plus,
  puiss,
  puissanceLatex,
  puissanceLatexT,
  quotientLatex,
  type Q,
} from "../../ui5e/corrigeSuites1";

/**
 * Corrigé détaillé « comme au tableau » de 5gen15 (suites géométriques) — règle
 * `.claude/rules/feuilles-evaluations.md`. Une étape par écran (`ordreComplet`, branches B1/B2
 * comprises) : formule du cours (§ 2, somme infinie § 3), substitution, une opération par ligne en
 * fractions exactes (`suitesGeometriques/fraction.ts`), puis l'arrondi au centième ; « Résultat » =
 * réponse de l'écran (`formatTermesReponseAttendueSuiteGeometrique`). SANS `docx` : importé par
 * l'adaptateur ET par `App5gen15.tsx`.
 */

type E = ExerciceSuiteGeometrique;
type P = ExercicePrincipalSuiteGeometrique;

const LETTRES = "abcdefghijklmnopqrstuvwxyz";
const t = texte;
const f = latex;
const u = (i: number | string) => `u_{${i}}`;
const S = (i: number | string) => `S_{${i}}`;

type PhaseBase = "trouverQ" | "trouverU1" | "formuleGenerale" | "termesProches" | "termeEloigne" | "sommeSn" | "sommeInfinie" | "poserEquationAlgebrique" | "resoudreXAlgebrique" | "calculerTermesAlgebrique" | "calculerSn" | "poserEquationRangN" | "resoudreRangN";
function base(phase: PhaseSuiteGeometrique): PhaseBase {
  return phase.replace(/B[12]$/, "") as PhaseBase;
}

function reponse(exercice: E, phase: PhaseSuiteGeometrique): FragmentConsigne[] {
  return fragmentsListe(formatTermesReponseAttendueSuiteGeometrique(exercice, phase));
}

/** « (2e suite, q = −3) » quand q a deux valeurs. */
function precisionBranche(phase: PhaseSuiteGeometrique): string {
  if (!phase.endsWith("B1") && !phase.endsWith("B2")) return "";
  return ` (${phase.endsWith("B1") ? "1re" : "2e"} suite)`;
}

function branche(exercice: P, phase: PhaseSuiteGeometrique) {
  return exercice.branches[phase.endsWith("B2") ? 1 : 0];
}

/** nom = u₁ × q^k : substitution, puissance, produit, arrondi. */
function lignesTermeGeometrique(nom: string, u1: Q, q: Q, k: number, justif = `terme général, n − 1 = ${k}`): LigneCalcul[] {
  const qk = puiss(q, k);
  const v = fois(u1, qk);
  const lignes = [ligne(`${nom}=${fr(u1)}\\times ${puissanceLatex(q, k)}`, justif)];
  if (k > 1 || q.den !== 1 || q.num < 0) lignes.push(ligne(`=${fr(u1)}\\times ${par(qk)}`, "on calcule la puissance"));
  lignes.push(ligne(`=${fr(v)}`));
  return [...lignes, ...lignesArrondi(v)];
}

/** Racine k-ième d'un rationnel positif (q^k = Q) écrite : `\sqrt[k]{Q}` puis sa valeur. */
function lignesRacine(k: number, Qv: Q, q: Q, signe: "" | "-", justification: string): LigneCalcul[] {
  const indice = k === 2 ? "" : `[${k}]`;
  const lignes = [ligne(`q=${signe}\\sqrt${indice}{${fr(abs(Qv))}}`, justification)];
  if (Qv.den !== 1) lignes.push(ligne(`=${signe}\\dfrac{\\sqrt${indice}{${Math.abs(Qv.num)}}}{\\sqrt${indice}{${Qv.den}}}`, "racine d'un quotient"));
  lignes.push(ligne(`=${fr(q)}`));
  return lignes;
}

// ============================================================================
// Famille « principal ».
// ============================================================================

function etapeTrouverQ(exercice: P, sq: string): EtapeCorrection[] {
  const d = exercice.donnees;
  const k = exercice.k as number;
  let bas: { nom: string; valeur: FractionQ };
  let haut: { indice: number; valeur: FractionQ };
  let relation: string;
  let justifRelation: string;
  if (d.combo === "u1_up") {
    bas = { nom: "u_1", valeur: d.u1 };
    haut = d.up;
    relation = `${u(d.up.indice)}=u_1\\times q^{${d.up.indice}-1}`;
    justifRelation = `terme général pour n = ${d.up.indice}`;
  } else if (d.combo === "up_um") {
    const [b, h] = d.up.indice < d.um.indice ? [d.up, d.um] : [d.um, d.up];
    bas = { nom: u(b.indice), valeur: b.valeur };
    haut = h;
    relation = `${u(h.indice)}=${u(b.indice)}\\times q^{${h.indice}-${b.indice}}`;
    justifRelation = `de ${nomIndice("u", b.indice)} à ${nomIndice("u", h.indice)}, on multiplie ${k} fois par q`;
  } else return [];
  const Qv = divise(haut.valeur, bas.valeur);
  const qk = k === 1 ? "q" : `q^{${k}}`;
  const lignes: LigneCalcul[] = [ligne(relation, justifRelation), ligne(`${fr(haut.valeur)}=${fr(bas.valeur)}\\times ${qk}`, "on remplace les deux termes")];
  const ecrit = quotientLatex(haut.valeur, bas.valeur);
  lignes.push(ligne(`${qk}=${ecrit}`, justifDiviser(bas.valeur)));
  if (ecrit !== fr(Qv)) lignes.push(ligne(`=${fr(Qv)}`, "on simplifie"));
  if (k > 1) {
    if (k % 2 === 0) {
      const [qPos, qNeg] = exercice.branches[0].q.num > 0 ? [exercice.branches[0].q, exercice.branches[1].q] : [exercice.branches[1].q, exercice.branches[0].q];
      lignes.push(...lignesRacine(k, Qv, qPos, "", `exposant ${k} pair : la racine positive…`));
      lignes.push(...lignesRacine(k, Qv, qNeg, "-", "… ou son opposée"));
    } else {
      lignes.push(...lignesRacine(k, Qv, exercice.branches[0].q, Qv.num < 0 ? "-" : "", `exposant ${k} impair : une seule valeur, du signe du quotient`));
    }
  }
  const verifs = exercice.branches.map((b) => ligne(`${bas.nom}\\times ${puissanceLatex(b.q, k)}=${fr(bas.valeur)}\\times ${par(puiss(b.q, k))}`)).flatMap((l, i) => [l, ligne(`=${fr(haut.valeur)}`, i === exercice.branches.length - 1 ? [t("c'est bien "), f(u(haut.indice)), t(" ✓")] : "✓")]);
  return [
    utilise(sq, [
      t(d.combo === "u1_up" ? "Terme général d'une suite géométrique : " : "Entre deux termes d'une suite géométrique, on multiplie par q autant de fois que l'écart des rangs : "),
      f(d.combo === "u1_up" ? "u_n=u_1\\times q^{n-1}" : "u_m=u_p\\times q^{m-p}"),
      t(`. On isole la puissance de q, puis on prend la racine ; si l'exposant est pair, q a deux valeurs opposées ${COURS_GEOMETRIQUE}.`),
    ]),
    calcul(sq, lignes),
    resultat(sq, reponse(exercice, "trouverQ")),
    verification(sq, [t("On recalcule le terme donné avec chaque valeur de q :")], verifs),
    piege(
      sq,
      k % 2 === 0
        ? [t("Une puissance paire efface le signe : "), f(`q^{${k}}=${fr(Qv)}`), t(" a deux solutions opposées. Oublier la valeur négative fait perdre une suite.")]
        : [t("Une puissance impaire garde le signe : q a le signe du quotient, une seule valeur.")],
    ),
  ];
}

function etapeTrouverU1(exercice: P, phase: PhaseSuiteGeometrique, sq: string): EtapeCorrection[] {
  const d = exercice.donnees;
  if (d.combo !== "q_up" && d.combo !== "up_um") return [];
  const { q } = branche(exercice, phase);
  const P0 = d.up.indice;
  const C = puiss(q, P0 - 1);
  return [
    utilise(sq, [t(`q est connu${precisionBranche(phase)} ; terme général d'une suite géométrique, écrit pour le terme donné : `), f("u_n=u_1\\times q^{n-1}"), t(` ${COURS_GEOMETRIQUE}.`)]),
    calcul(sq, [
      ligne(`${u(P0)}=u_1\\times q^{${P0}-1}`, `terme général pour n = ${P0}`),
      ligne(`${fr(d.up.valeur)}=u_1\\times ${puissanceLatex(q, P0 - 1)}`, "on remplace le terme et q"),
      ...(P0 - 1 > 1 || q.den !== 1 || q.num < 0 ? [ligne(`${fr(d.up.valeur)}=u_1\\times ${par(C)}`, "on calcule la puissance")] : []),
      ...lignesDiviser(C, d.up.valeur, "u_1"),
    ]),
    resultat(sq, reponse(exercice, phase)),
    piege(sq, [t("On divise par "), f(`q^{${P0 - 1}}`), t(` (exposant ${P0} − 1), pas par `), f(`q^{${P0}}`), t(".")]),
  ];
}

function etapeFormule(exercice: P, phase: PhaseSuiteGeometrique, sq: string): EtapeCorrection[] {
  const { u1, q } = branche(exercice, phase);
  return [
    utilise(sq, [t(`Terme général d'une suite géométrique${precisionBranche(phase)} : `), f("u_n=u_1\\times q^{n-1}"), t(` ${COURS_GEOMETRIQUE}.`)]),
    calcul(sq, [ligne(`u_n=u_1\\times q^{n-1}`, "terme général"), ligne(`=${fr(u1)}\\times ${puissanceLatex(q, "n-1")}`, "on remplace u₁ et q")]),
    resultat(sq, reponse(exercice, phase)),
    verification(sq, [t("Pour n = 1, on doit retrouver u₁ :")], [ligne(`u_1=${fr(u1)}\\times ${puissanceLatex(q, 0)}`), ligne(`=${fr(u1)}`, "car une puissance d'exposant 0 vaut 1 ✓")]),
    piege(sq, [t("Le terme de rang n est "), f("u_1\\times q^{n-1}"), t(", pas "), f("u_1\\times q^{n}"), t(" : de u₁ à uₙ, on multiplie par q seulement (n − 1) fois.")]),
  ];
}

function etapeTermesProches(exercice: P, phase: PhaseSuiteGeometrique, sq: string): EtapeCorrection[] {
  const { u1, q } = branche(exercice, phase);
  const indices = exercice.indicesTermesProches;
  const valeurs = indices.map((k) => fois(u1, puiss(q, k - 1)));
  const lignes: LigneCalcul[] = lignesTermeGeometrique(u(indices[0]), u1, q, indices[0] - 1);
  for (let i = 1; i < indices.length; i++) {
    lignes.push(ligne(`${u(indices[i])}=${fr(valeurs[i - 1])}\\times ${par(q)}`, "on multiplie le terme précédent par q"));
    lignes.push(ligne(`=${fr(valeurs[i])}`));
    lignes.push(...lignesArrondi(valeurs[i]));
  }
  const dernier = indices[indices.length - 1];
  return [
    utilise(sq, [t("Terme général pour le premier terme demandé, "), f("u_n=u_1\\times q^{n-1}"), t(", puis on multiplie par q pour passer au suivant : "), f("u_{n+1}=u_n\\times q"), t(` ${COURS_GEOMETRIQUE}.`)]),
    calcul(sq, lignes),
    resultat(sq, reponse(exercice, phase)),
    verification(sq, [t("Le dernier terme, avec la formule :")], [ligne(`${u(dernier)}=${fr(u1)}\\times ${puissanceLatex(q, dernier - 1)}`), ligne(`=${fr(valeurs[valeurs.length - 1])}`, "✓")]),
  ];
}

function etapeTermeEloigne(exercice: P, phase: PhaseSuiteGeometrique, sq: string): EtapeCorrection[] {
  const { u1, q } = branche(exercice, phase);
  const N = exercice.indiceTermeEloigne;
  return [
    utilise(sq, [t("Terme général d'une suite géométrique : "), f("u_n=u_1\\times q^{n-1}"), t(` ${COURS_GEOMETRIQUE}.`)]),
    calcul(sq, [ligne(`${u(N)}=u_1\\times q^{${N}-1}`, `terme général pour n = ${N}`), ...lignesTermeGeometrique("", u1, q, N - 1, "on remplace u₁ et q")]),
    resultat(sq, reponse(exercice, phase)),
    piege(sq, [t("L'exposant est "), f(`${N}-1=${N - 1}`), t(", pas "), f(`${N}`), t(".")]),
  ];
}

function etapeSomme(exercice: P, phase: PhaseSuiteGeometrique, sq: string): EtapeCorrection[] {
  const { u1, q } = branche(exercice, phase);
  const N = exercice.indiceSn;
  return [
    utilise(sq, [t("Somme des n premiers termes d'une suite géométrique (q ≠ 1) : "), f("S_n=u_1\\times\\dfrac{1-q^n}{1-q}"), t(` ${COURS_GEOMETRIQUE}.`)]),
    calcul(sq, lignesSommeGeometrique(N, u1, q)),
    resultat(sq, reponse(exercice, phase)),
    piege(sq, [t(`${nomIndice("S", N)} compte ${N} termes : l'exposant de q au numérateur est ${N}, pas ${N - 1}.`)]),
  ];
}

function etapeSommeInfinie(exercice: P, phase: PhaseSuiteGeometrique, sq: string): EtapeCorrection[] {
  const { u1, q } = branche(exercice, phase);
  const existe = Math.abs(q.num) < q.den;
  const ut = utilise(sq, [t("La somme infinie d'une suite géométrique existe seulement si |q| < 1 ; elle vaut alors "), f("S_\\infty=\\dfrac{u_1}{1-q}"), t(` ${COURS_CONVERGENCE}.`)]);
  if (!existe) {
    return [
      ut,
      calcul(sq, [ligne(`|q|=${fr(abs(q))}`, "valeur absolue de la raison"), ligne(`${fr(abs(q))}\\geq 1`, "la condition |q| < 1 n'est pas remplie")]),
      resultat(sq, [t("La suite n'a pas de somme infinie : "), f("|q|\\geq 1"), t(".")]),
      piege(sq, [t("La formule donnerait quand même un nombre, "), f(`\\dfrac{${frT(u1)}}{1-${parT(q)}}=${fr(divise(u1, moins(ent(1), q)))}`), t(", mais il ne représente rien : les sommes ne se stabilisent pas.")]),
    ];
  }
  const B = moins(ent(1), q);
  const s = divise(u1, B);
  const lignes: LigneCalcul[] = [
    ligne(`|q|=${fr(abs(q))}`, "valeur absolue de la raison"),
    ligne(`${fr(abs(q))}<1`, "la somme infinie existe"),
    ligne(`S_\\infty=\\dfrac{u_1}{1-q}`, "somme infinie"),
    ligne(`=\\dfrac{${frT(u1)}}{1-${parT(q)}}`, "on remplace u₁ et q"),
    ligne(`=\\dfrac{${frT(u1)}}{${frT(B)}}`, "on calcule le dénominateur"),
  ];
  if (!estEntier(B)) lignes.push(ligne(`=${fr(u1)}\\times ${par(inverse(B))}`, [t("diviser par "), f(fr(B)), t(", c'est multiplier par "), f(fr(inverse(B)))]));
  if (!estEntier(B) || !estEntier(u1) || !egal(s, u1)) lignes.push(ligne(`=${fr(s)}`, estEntier(B) ? "on simplifie" : "on multiplie"));
  return [ut, calcul(sq, [...dedoublonner(lignes), ...lignesArrondi(s)]), resultat(sq, reponse(exercice, phase)), piege(sq, [t("On vérifie |q| < 1 avant d'appliquer la formule : avec |q| ≥ 1, la somme infinie n'existe pas.")])];
}

// ============================================================================
// Familles algébriques et rang n.
// ============================================================================

function valeurLin(t0: TermeLineaire | TermeLineaireFractionQ, x: Q): Q {
  const b = typeof t0.b === "number" ? ent(t0.b) : t0.b;
  return plus(fois(ent(t0.a), x), b);
}
function linT(t0: TermeLineaire | TermeLineaireFractionQ): string {
  return lin(t0.a, typeof t0.b === "number" ? ent(t0.b) : t0.b);
}

function lignesSubstitution(nom: string, t0: TermeLineaire | TermeLineaireFractionQ, x: Q): LigneCalcul[] {
  const ax = fois(ent(t0.a), x);
  const b = typeof t0.b === "number" ? ent(t0.b) : t0.b;
  const lignes = [ligne(`${nom}=${t0.a}\\times ${par(x)}${b.num === 0 ? "" : b.num < 0 ? fr(b) : `+${fr(b)}`}`, "on remplace x")];
  if (b.num !== 0) lignes.push(ligne(`=${fr(ax)}${b.num < 0 ? fr(b) : `+${fr(b)}`}`, "on multiplie"));
  lignes.push(ligne(`=${fr(plus(ax, b))}`));
  return lignes;
}

/** Facteur (1 − q^N)/(1 − q) de la somme, q entier : puissance, numérateur et dénominateur, quotient. */
function facteurSomme(q: Q, N: number): Q {
  return divise(moins(ent(1), puiss(q, N)), moins(ent(1), q));
}

function etapePoser(exercice: ExerciceAlgebriqueTermeGeneral | ExerciceAlgebriqueSommeSn, sq: string): EtapeCorrection[] {
  if (exercice.famille === "algebriqueTermeGeneral") {
    const { p, n: N, q, up, un } = exercice;
    return [
      utilise(sq, [t("Entre deux termes d'une suite géométrique, on multiplie par q autant de fois que l'écart des rangs : "), f("u_n=q^{n-p}\\times u_p"), t(` ${COURS_GEOMETRIQUE}.`)]),
      calcul(sq, [
        ligne(`${u(N)}=q^{${N}-${p}}\\times ${u(p)}`, `relation entre ${nomIndice("u", N)} et ${nomIndice("u", p)}`),
        ligne(`${linT(un)}=${puissanceLatex(q, N - p)}\\times(${linT(up)})`, "on remplace les deux termes et q"),
      ]),
      resultat(sq, reponse(exercice, "poserEquationAlgebrique")),
      piege(sq, [t("La puissance de q multiplie toute l'expression de uₚ(x) : parenthèses indispensables."), ...(N < p ? [t(" Ici l'exposant est négatif : "), f(`q^{${N - p}}=\\dfrac{1}{q^{${p - N}}}`), t(".")] : [])]),
    ];
  }
  const e = exercice;
  const N = e.n;
  if (e.sousCas === "B") {
    return [
      utilise(sq, [t("La somme "), f(S(N)), t(" a deux écritures : sa valeur calculée à l'étape 1 et l'expression en x donnée. Elles sont égales.")]),
      calcul(sq, [ligne(`${S(N)}=${fr(e.k)}`, "valeur calculée à l'étape 1"), ligne(`${S(N)}=${linT(e.sn)}`, "expression donnée"), ligne(`${linT(e.sn)}=${fr(e.k)}`, "on égale les deux écritures")]),
      resultat(sq, reponse(exercice, "poserEquationAlgebrique")),
      piege(sq, [t("On égale l'expression en x à la valeur de Sₙ calculée avec u₁ et q.")]),
    ];
  }
  return [
    utilise(sq, [t("Somme des n premiers termes, égalée à la valeur donnée : "), f("S_n=u_1\\times\\dfrac{1-q^n}{1-q}"), t(` ${COURS_GEOMETRIQUE}.`)]),
    calcul(sq, [
      ligne(`${S(N)}=u_1\\times\\dfrac{1-q^{${N}}}{1-q}`, `somme des ${N} premiers termes`),
      ligne(`${fr(e.k)}=(${linT(e.u1)})\\times\\dfrac{1-${puissanceLatexT(e.q, N)}}{1-${parT(e.q)}}`, "on remplace u₁ par son expression, q et n"),
    ]),
    resultat(sq, reponse(exercice, "poserEquationAlgebrique")),
    piege(sq, [t("u₁(x) multiplie toute la fraction "), f("\\dfrac{1-q^n}{1-q}"), t(" : parenthèses indispensables.")]),
  ];
}

function lignesResolution(exercice: ExerciceAlgebriqueTermeGeneral | ExerciceAlgebriqueSommeSn): LigneCalcul[] {
  if (exercice.famille === "algebriqueTermeGeneral") {
    const { p, n: N, q, up, un } = exercice;
    const C = puiss(q, N - p);
    const a = fois(C, ent(up.a));
    const b = fois(C, ent(up.b));
    return [
      ligne(`${linT(un)}=${puissanceLatex(q, N - p)}\\times(${linT(up)})`, "équation de l'étape 1"),
      ligne(`${linT(un)}=${par(C)}\\times(${linT(up)})`, "on calcule la puissance"),
      ligne(`${linT(un)}=${lin(a, b)}`, "on distribue"),
      ...lignesPremierDegre(ent(un.a), un.b, a, b),
    ];
  }
  const e = exercice;
  if (e.sousCas === "B") return [ligne(`${linT(e.sn)}=${fr(e.k)}`, "équation de l'étape 2"), ...lignesPremierDegre(ent(e.sn.a), e.sn.b, ent(0), e.k)];
  const N = e.n;
  const q = e.q;
  const qN = puiss(q, N);
  const A = moins(ent(1), qN);
  const B = moins(ent(1), q);
  const F = facteurSomme(q, N);
  const a = fois(F, ent(e.u1.a));
  const b = fois(F, ent(e.u1.b));
  const g = `(${linT(e.u1)})`;
  return [
    ligne(`${g}\\times\\dfrac{1-${puissanceLatexT(q, N)}}{1-${parT(q)}}=${fr(e.k)}`, "équation de l'étape 1"),
    ligne(`${g}\\times\\dfrac{1-${parT(qN)}}{1-${parT(q)}}=${fr(e.k)}`, "on calcule la puissance"),
    ligne(`${g}\\times\\dfrac{${frT(A)}}{${frT(B)}}=${fr(e.k)}`, "on calcule le numérateur et le dénominateur"),
    ligne(`${g}\\times ${par(F)}=${fr(e.k)}`, "on divise"),
    ligne(`${lin(a, b)}=${fr(e.k)}`, "on distribue"),
    ...lignesPremierDegre(a, b, ent(0), e.k),
  ];
}

function etapeResoudre(exercice: ExerciceAlgebriqueTermeGeneral | ExerciceAlgebriqueSommeSn, sq: string): EtapeCorrection[] {
  return [
    utilise(sq, [t("Équation du premier degré : on calcule les nombres, on développe, on regroupe les termes en x d'un côté et les nombres de l'autre, puis on divise par le coefficient de x.")]),
    calcul(sq, dedoublonner(lignesResolution(exercice))),
    resultat(sq, reponse(exercice, "resoudreXAlgebrique")),
  ];
}

function etapeCalculerTermes(exercice: ExerciceAlgebriqueTermeGeneral | ExerciceAlgebriqueSommeSn, sq: string): EtapeCorrection[] {
  const x = exercice.xReel;
  const blocs: { nom: string; t0: TermeLineaire | TermeLineaireFractionQ }[] =
    exercice.famille === "algebriqueTermeGeneral"
      ? [
          { nom: u(exercice.p), t0: exercice.up },
          { nom: u(exercice.n), t0: exercice.un },
        ]
      : exercice.sousCas === "A"
        ? [{ nom: "u_1", t0: exercice.u1 }]
        : [];
  let verif: EtapeCorrection | null = null;
  if (exercice.famille === "algebriqueTermeGeneral") {
    const { p, n: N, q } = exercice;
    const C = puiss(q, N - p);
    const vp = valeurLin(exercice.up, x);
    verif = verification(sq, [t("Les deux valeurs vérifient la relation entre les termes :")], [
      ligne(`${puissanceLatex(q, N - p)}\\times ${par(vp)}=${par(C)}\\times ${par(vp)}`),
      ligne(`=${fr(fois(C, vp))}`, [t("c'est bien "), f(u(N)), t(" ✓")]),
    ]);
  } else if (exercice.sousCas === "A") {
    const F = facteurSomme(exercice.q, exercice.n);
    const v1 = valeurLin(exercice.u1, x);
    verif = verification(sq, [t("On recalcule la somme avec cette valeur :")], [
      ligne(`${par(v1)}\\times\\dfrac{1-${puissanceLatexT(exercice.q, exercice.n)}}{1-${parT(exercice.q)}}=${par(v1)}\\times ${par(F)}`),
      ligne(`=${fr(fois(v1, F))}`, [t("c'est bien "), f(S(exercice.n)), t(" ✓")]),
    ]);
  }
  return [
    utilise(sq, [t("On remplace x par sa valeur, "), f(`x=${fr(x)}`), t(", dans chaque expression.")]),
    calcul(sq, blocs.flatMap((b) => lignesSubstitution(b.nom, b.t0, x))),
    resultat(sq, reponse(exercice, "calculerTermesAlgebrique")),
    ...(verif ? [verif] : []),
  ];
}

function etapeCalculerSn(exercice: ExerciceAlgebriqueSommeSn, sq: string): EtapeCorrection[] {
  if (exercice.sousCas !== "B") return [];
  return [
    utilise(sq, [t("Somme des n premiers termes d'une suite géométrique (q ≠ 1) : "), f("S_n=u_1\\times\\dfrac{1-q^n}{1-q}"), t(` ${COURS_GEOMETRIQUE}.`)]),
    calcul(sq, lignesSommeGeometrique(exercice.n, ent(exercice.u1), exercice.q)),
    resultat(sq, reponse(exercice, "calculerSn")),
  ];
}

function etapePoserRangN(exercice: ExerciceAlgebriqueRangN, sq: string): EtapeCorrection[] {
  const { u1, q, k } = exercice;
  return [
    utilise(sq, [t("Le terme de rang n vaut la valeur donnée ; terme général d'une suite géométrique : "), f("u_n=u_1\\times q^{n-1}"), t(` ${COURS_GEOMETRIQUE}.`)]),
    calcul(sq, [ligne(`u_n=${k}`, "le terme cherché vaut la valeur donnée"), ligne(`u_1\\times q^{n-1}=${k}`, "terme général"), ligne(`${u1}\\times ${puissanceLatex(q, "n-1")}=${k}`, "on remplace u₁ et q")]),
    resultat(sq, reponse(exercice, "poserEquationRangN")),
  ];
}

function etapeResoudreRangN(exercice: ExerciceAlgebriqueRangN, sq: string): EtapeCorrection[] {
  const { u1, q, k, m, n: N } = exercice;
  const quotient = divise(ent(k), ent(u1));
  const lignes: LigneCalcul[] = [ligne(`${u1}\\times ${puissanceLatex(q, "n-1")}=${k}`, "équation de l'étape 1"), ligne(`${puissanceLatex(q, "n-1")}=\\dfrac{${k}}{${u1}}`, `on divise par ${u1}`)];
  if (`\\dfrac{${k}}{${u1}}` !== fr(quotient)) lignes.push(ligne(`=${fr(quotient)}`, "on simplifie"));
  const ecritPuissances = quotient.den === 1 ? `${q.num}^{${m}}` : `\\dfrac{${quotient.num === 1 ? 1 : `${q.num}^{${m}}`}}{${q.den}^{${m}}}`;
  const justifPuissances: FragmentConsigne[] =
    quotient.den === 1 ? [f(`${quotient.num}=${q.num}^{${m}}`)] : quotient.num === 1 ? [f(`${quotient.den}=${q.den}^{${m}}`)] : [f(`${quotient.num}=${q.num}^{${m}}`), t(" et "), f(`${quotient.den}=${q.den}^{${m}}`)];
  lignes.push(ligne(`=${ecritPuissances}`, justifPuissances));
  if (quotient.den !== 1) lignes.push(ligne(`=${puissanceLatex(q, m)}`, "puissance d'un quotient"));
  lignes.push(ligne(`n-1=${m}`, "mêmes bases : on égale les exposants"));
  lignes.push(ligne(`n=${m}+1`, "on ajoute 1"));
  lignes.push(ligne(`=${N}`));
  return [
    utilise(sq, [t("On divise par u₁, on écrit le quotient comme une puissance de q (même base), puis on égale les exposants.")]),
    calcul(sq, lignes),
    resultat(sq, reponse(exercice, "resoudreRangN")),
    verification(sq, [t("On recalcule le terme de rang " + N + " :")], [ligne(`${u(N)}=${u1}\\times ${puissanceLatex(q, m)}`), ligne(`=${u1}\\times ${par(puiss(q, m))}`), ligne(`=${k}`, "c'est la valeur donnée ✓")]),
    piege(sq, [t("L'exposant obtenu est n − 1, pas n : ne pas oublier d'ajouter 1.")]),
  ];
}

// ============================================================================
// Assemblage.
// ============================================================================

function principal(exercice: E): P {
  if (exercice.famille !== "principal") throw new Error("famille hors 'principal'");
  return exercice;
}

function etape(exercice: E, phase: PhaseSuiteGeometrique, sq: string): EtapeCorrection[] {
  switch (base(phase)) {
    case "trouverQ":
      return etapeTrouverQ(principal(exercice), sq);
    case "trouverU1":
      return etapeTrouverU1(principal(exercice), phase, sq);
    case "formuleGenerale":
      return etapeFormule(principal(exercice), phase, sq);
    case "termesProches":
      return etapeTermesProches(principal(exercice), phase, sq);
    case "termeEloigne":
      return etapeTermeEloigne(principal(exercice), phase, sq);
    case "sommeSn":
      return etapeSomme(principal(exercice), phase, sq);
    case "sommeInfinie":
      return etapeSommeInfinie(principal(exercice), phase, sq);
    case "poserEquationAlgebrique":
      return exercice.famille === "algebriqueTermeGeneral" || exercice.famille === "algebriqueSommeSn" ? etapePoser(exercice, sq) : [];
    case "resoudreXAlgebrique":
      return exercice.famille === "algebriqueTermeGeneral" || exercice.famille === "algebriqueSommeSn" ? etapeResoudre(exercice, sq) : [];
    case "calculerTermesAlgebrique":
      return exercice.famille === "algebriqueTermeGeneral" || exercice.famille === "algebriqueSommeSn" ? etapeCalculerTermes(exercice, sq) : [];
    case "calculerSn":
      return exercice.famille === "algebriqueSommeSn" ? etapeCalculerSn(exercice, sq) : [];
    case "poserEquationRangN":
      return exercice.famille === "algebriqueRangN" ? etapePoserRangN(exercice, sq) : [];
    case "resoudreRangN":
      return exercice.famille === "algebriqueRangN" ? etapeResoudreRangN(exercice, sq) : [];
  }
}

/** Corrigé détaillé : une étape par écran (`ordreComplet`), lettre = rang de l'écran. */
export function correctionDetailleeSuiteGeometrique(exercice: E): EtapeCorrection[] {
  return ordreComplet(exercice).flatMap((phase, i) => etape(exercice, phase, LETTRES[i]));
}
