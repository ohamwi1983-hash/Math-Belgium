import type { EtapeCorrection, FragmentConsigne, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import type { Decomposition, ExerciceChangementBaseLog, ExerciceComparerEncadrerLog, ExerciceComparerLog, ExerciceRangerLog, Rationnel, TermeLog } from "../../core6e/comparerEncadrerLogarithmes.types";
import { MILLIEMES, logApprocheMilli, valeurDecomposition, valeurNombre, valeurRat } from "../../core6e/comparerEncadrerLogarithmesCalcul";
import { estPhaseChoix, phasesExercice } from "../../moteur6e/typesComparerEncadrerLogarithmes";
import type { PhaseComparerEncadrerLog } from "../../moteur6e/typesComparerEncadrerLogarithmes";
import {
  centiemesLatex,
  cibleChangementBase,
  developpementLatex,
  encadrementEntierLatex,
  entierLatex,
  entierTexte,
  estBaseInf1,
  formatReponseAttendueLatex,
  logDonneLatex,
  logLatex,
  milliemesLatex,
  nombresRangerLatex,
  optionCorrecteFragments,
  ratLatex,
  symboleLogBase,
  termeLatex,
  valeursDonneesLatex,
} from "../../ui6e/formatComparerEncadrerLogarithmes";
import { COURS_PROPRIETES, dec, sansRepetition, vaut } from "../../ui6e/corrigeLogarithmes2";

/**
 * Corrigé détaillé « comme au tableau » de `6gen86` (comparer et encadrer des logarithmes sans
 * calculatrice) — règle `.claude/rules/feuilles-evaluations.md`. Une étape par écran
 * (`phasesExercice`) : puissances de la base écrites une par ligne, encadrement de l'argument,
 * application du logarithme (croissant, ou décroissant pour une base inférieure à 1 : l'ordre
 * s'inverse), propriété (P3) ; comparaison par séparation des intervalles ou changement de base ;
 * changement de base avec les valeurs DONNÉES (log 2 ≈ 0,301…, `logApprocheMilli`). Réponses :
 * `formatReponseAttendueLatex` / `optionCorrecteFragments` (mêmes fonctions que l'écran).
 */

type E = ExerciceComparerEncadrerLog;
const t = texte;
const f = latex;
const LETTRES = "abcd";

function reponse(e: E, phase: PhaseComparerEncadrerLog): FragmentConsigne[] {
  if (estPhaseChoix(phase)) return optionCorrecteFragments(e, phase as "verdict" | "ordre" | "formule");
  return formatReponseAttendueLatex(e, phase as Exclude<PhaseComparerEncadrerLog, "verdict" | "ordre" | "formule">).flatMap((x, i) => (i === 0 ? [f(x)] : [t(" ; "), f(x)]));
}

// ============================================================================
// Puissances d'une base rationnelle et encadrement d'un logarithme.
// ============================================================================

function puissanceRat(b: Rationnel, j: number): Rationnel {
  return { num: Math.pow(j >= 0 ? b.num : b.den, Math.abs(j)), den: Math.pow(j >= 0 ? b.den : b.num, Math.abs(j)) };
}

function basePuissance(b: Rationnel): string {
  return b.den === 1 ? `${b.num}` : `\\left(${ratLatex(b)}\\right)`;
}

/** Nom du logarithme de base b : « \log », « \log_{2} », « \log_{1/3} ». */
function nomLog(b: Rationnel): string {
  if (b.den === 1 && b.num === 10) return "\\log";
  return `\\log_{${b.den === 1 ? b.num : `${b.num}/${b.den}`}}`;
}

function argL(r: Rationnel): string {
  return r.den === 1 ? `(${entierLatex(r.num)})` : `\\left(${ratLatex(r)}\\right)`;
}

/** Lignes d'encadrement d'un logarithme entre deux entiers consécutifs (puissances, ordre, log appliqué, (P3)). */
function lignesEncadrement(te: TermeLog): LigneCalcul[] {
  const inf1 = estBaseInf1(te);
  const k = te.plancher;
  // Puissances rangées par VALEUR croissante : bᵏ < x < bᵏ⁺¹ (b > 1), b^{k+1} < x < bᵏ (b < 1).
  const [jg, jd] = inf1 ? [k + 1, k] : [k, k + 1];
  const pg = puissanceRat(te.base, jg);
  const pd = puissanceRat(te.base, jd);
  const nom = nomLog(te.base);
  const rel = inf1 ? ">" : "<";
  return [
    ligne(`${basePuissance(te.base)}^{${jg}}=${ratLatex(pg)}`, "puissance de la base juste en dessous de l'argument"),
    ligne(`${basePuissance(te.base)}^{${jd}}=${ratLatex(pd)}`, "puissance suivante, juste au-dessus"),
    ligne(`${ratLatex(pg)}<${ratLatex(te.argument)}<${ratLatex(pd)}`, "l'argument est entre les deux"),
    ligne(
      `${nom}${argL(pg)}${rel}${termeLatex(te)}${rel}${nom}${argL(pd)}`,
      inf1 ? `${"base inférieure à 1 : le logarithme est strictement décroissant, l'ordre s'inverse"}` : "le logarithme est strictement croissant (base supérieure à 1)",
    ),
    ligne(`${entierLatex(jg)}${rel}${termeLatex(te)}${rel}${entierLatex(jd)}`, [t("(P3) : "), f("\\log_b\\left(b^{r}\\right)=r")]),
  ];
}

function utiliseEncadrement(inf1: boolean): FragmentConsigne[] {
  return [
    t("On encadre l'argument entre deux puissances consécutives de la base, puis on applique le logarithme aux trois membres : il est strictement croissant si la base est supérieure à 1, strictement décroissant (l'ordre s'inverse) si elle est comprise entre 0 et 1 ; enfin (P3) "),
    f("\\log_b\\left(b^{r}\\right)=r"),
    t(` ${COURS_PROPRIETES}.`),
    ...(inf1 ? [t(" Ici la base est inférieure à 1.")] : []),
  ];
}

// ============================================================================
// Encadrer.
// ============================================================================

function etapesEncadrer(e: E & { variante: "encadrer" }, phase: PhaseComparerEncadrerLog, sq: string): EtapeCorrection[] {
  const log = symboleLogBase(e.a);
  const logN = logLatex({ num: e.a, den: 1 }, { num: e.N, den: 1 });
  if (phase === "puissances") {
    const debut = Math.max(0, e.k - 2);
    const lignes: LigneCalcul[] = [];
    for (let j = debut; j <= e.k + 1; j++) lignes.push(ligne(`${e.a}^{${j}}=${entierLatex(Math.pow(e.a, j))}`, j === e.k ? `encore inférieur à ${entierTexte(e.N)}` : j === e.k + 1 ? `dépasse ${entierTexte(e.N)}` : ""));
    lignes.push(ligne(`${e.a}^{${e.k}}<${entierLatex(e.N)}<${e.a}^{${e.k + 1}}`, "deux puissances consécutives"));
    return [
      utilise(sq, [t(`On écrit les puissances successives de ${e.a} jusqu'à dépasser ${entierTexte(e.N)} : l'entier k cherché vérifie `), f(`${e.a}^{k}<${entierLatex(e.N)}<${e.a}^{k+1}`), t(` ${COURS_PROPRIETES}.`)]),
      calcul(sq, lignes),
      resultat(sq, [t("Encadrement : "), ...reponse(e, phase)]),
    ];
  }
  return [
    utilise(sq, [f(log), t(" est strictement croissante (base supérieure à 1) : on l'applique aux trois membres, puis (P3) "), f("\\log_a\\left(a^{r}\\right)=r"), t(` ${COURS_PROPRIETES}.`)]),
    calcul(sq, [
      ligne(`${e.a}^{${e.k}}<${entierLatex(e.N)}<${e.a}^{${e.k + 1}}`, "étape 1"),
      ligne(`${log}\\left(${e.a}^{${e.k}}\\right)<${logN}<${log}\\left(${e.a}^{${e.k + 1}}\\right)`, `${e.a === 10 ? "log" : `log de base ${e.a}`} strictement croissante`),
      ligne(`${e.k}<${logN}<${e.k + 1}`, "(P3)"),
    ]),
    resultat(sq, [t("Encadrement entre deux entiers consécutifs : "), ...reponse(e, phase)]),
    verification(sq, [t("Le logarithme est l'exposant : "), f(`${e.a}^{${e.k}}<${entierLatex(e.N)}<${e.a}^{${e.k + 1}}`), t(` donne bien ${e.k} et ${e.k + 1}.`)]),
    piege(sq, [t("Donner les puissances au lieu de leurs exposants : "), f(logN), t(` est compris entre ${e.k} et ${e.k + 1}, pas entre ${entierTexte(Math.pow(e.a, e.k))} et ${entierTexte(Math.pow(e.a, e.k + 1))}.`)]),
  ];
}

// ============================================================================
// Comparer.
// ============================================================================

function lignesVerdict(e: ExerciceComparerLog): { utilise: FragmentConsigne[]; lignes: LigneCalcul[] } {
  const A = termeLatex(e.A);
  const B = termeLatex(e.B);
  if (e.type === "separes" || !e.lien) {
    const [petit, grand] = e.verdict === "<" ? [e.A, e.B] : [e.B, e.A];
    const borne = petit.plancher + 1;
    const milieu = borne === grand.plancher ? `<${entierLatex(borne)}<` : `<${entierLatex(borne)}\\leq ${entierLatex(grand.plancher)}<`;
    return {
      utilise: [t("Les deux encadrements se séparent : tout nombre du premier intervalle est plus petit que tout nombre du second " + COURS_PROPRIETES + ".")],
      lignes: [ligne(`${termeLatex(petit)}${milieu}${termeLatex(grand)}`, "étapes 1 et 2 : les intervalles ne se chevauchent pas"), ligne(`A${e.verdict}B`)],
    };
  }
  const { c, n, x, y } = e.lien;
  const decroit = c.num < c.den;
  const yn = Math.pow(y, n);
  const cN = puissanceRat(c, n);
  const tCn = logLatex(cN, { num: x, den: 1 });
  const tC = logLatex(c, { num: y, den: 1 });
  const logC = (v: number) => logLatex(c, { num: v, den: 1 });
  const ordreArg = x === yn ? "=" : x < yn ? "<" : ">";
  const inverse = (r: string) => (r === "=" ? "=" : r === "<" ? ">" : "<");
  const ordreLog = decroit ? inverse(ordreArg) : ordreArg;
  const lignes: LigneCalcul[] = [];
  if (n === 1) {
    lignes.push(ligne(`${entierLatex(x)}${ordreArg}${entierLatex(y)}`, "même base : on compare les arguments"));
    lignes.push(ligne(`${tCn}${ordreLog}${tC}`, decroit ? "base inférieure à 1 : logarithme décroissant, l'ordre s'inverse" : "logarithme strictement croissant"));
  } else {
    const nomC = c.den === 1 ? `${c.num}` : `1/${c.den}`;
    lignes.push(ligne(`${tCn}=\\dfrac{${logC(x)}}{${n}}`, [t("changement de base vers la base " + nomC + " : "), f(`${nomLog(cN)}(x)=\\dfrac{${nomLog(c)}(x)}{${n}}`)]));
    lignes.push(ligne(`${tC}=\\dfrac{${n}\\,${tC}}{${n}}`, `on multiplie et on divise par ${n}`));
    lignes.push(ligne(`=\\dfrac{${logC(yn)}}{${n}}`, [f(`${n}\\log_b(y)=\\log_b\\left(y^{${n}}\\right)`), t(`, ${y}${superscript(n)} = ${entierTexte(yn)}`)]));
    lignes.push(ligne(`${entierLatex(x)}${ordreArg}${entierLatex(yn)}`, "on compare les arguments"));
    lignes.push(ligne(`${logC(x)}${ordreLog}${logC(yn)}`, ordreArg === "=" ? "mêmes arguments" : decroit ? "base inférieure à 1 : l'ordre s'inverse" : "logarithme strictement croissant"));
    lignes.push(ligne(`${tCn}${ordreLog}${tC}`, `on divise par ${n} > 0`));
  }
  lignes.push(ligne(`${A}${e.verdict}${B}`, e.lien.termeCn === "A" ? "A est le logarithme de base " + (cN.den === 1 ? cN.num : `1/${cN.den}`) : "B est le logarithme de base " + (cN.den === 1 ? cN.num : `1/${cN.den}`)));
  return {
    lignes: sansRepetition(lignes),
    utilise: [
      t("Les deux encadrements sont identiques : ils ne suffisent pas. On ramène les deux logarithmes à la même base (changement de base "),
      f("\\log_{b^{n}}(x)=\\dfrac{\\log_b(x)}{n}"),
      t(`), puis on compare les arguments ${COURS_PROPRIETES}.`),
    ],
  };
}

const EXPOSANTS = ["⁰", "¹", "²", "³", "⁴", "⁵", "⁶", "⁷", "⁸", "⁹"];
function superscript(n: number): string {
  return String(n).split("").map((c) => EXPOSANTS[Number(c)] ?? c).join("");
}

function etapesComparer(e: ExerciceComparerLog, phase: PhaseComparerEncadrerLog, sq: string): EtapeCorrection[] {
  if (phase === "encadrerA" || phase === "encadrerB") {
    const te = phase === "encadrerA" ? e.A : e.B;
    return [utilise(sq, utiliseEncadrement(estBaseInf1(te))), calcul(sq, lignesEncadrement(te)), resultat(sq, [t(`Encadrement de ${phase === "encadrerA" ? "A" : "B"} : `), ...reponse(e, phase)])];
  }
  const v = lignesVerdict(e);
  const p: FragmentConsigne[] = e.baseInf1
    ? [t("Oublier que le logarithme d'une base inférieure à 1 est décroissant : l'encadrement des puissances change de sens et les logarithmes d'arguments plus grands que 1 sont négatifs.")]
    : e.type === "lies"
      ? [t("Conclure à partir d'encadrements identiques : ils ne permettent pas de comparer ; il faut ramener les deux logarithmes à une même base.")]
      : [t("Comparer seulement les arguments (ou seulement les bases) : un logarithme dépend des deux à la fois.")];
  return [utilise(sq, v.utilise), calcul(sq, v.lignes), resultat(sq, [t("Comparaison : "), ...reponse(e, phase)]), piege(sq, p)];
}

// ============================================================================
// Ranger.
// ============================================================================

function etapesRanger(e: ExerciceRangerLog, phase: PhaseComparerEncadrerLog, sq: string): EtapeCorrection[] {
  const logs = e.nombres.flatMap((n) => (n.type === "log" ? [n.terme] : []));
  if (phase === "situer") {
    const rangs = ["1ᵉʳ", "2ᵉ", "3ᵉ", "4ᵉ"];
    return [
      utilise(sq, utiliseEncadrement(logs.some(estBaseInf1))),
      ...logs.map((te, i) => calcul(sq, lignesEncadrement(te), [], `${rangs[i]} logarithme`)),
      resultat(sq, [t("Encadrements : "), ...reponse(e, phase)]),
      piege(sq, logs.some((te) => te.plancher < 0) ? [t("Pour un nombre négatif, l'entier inférieur est le plus négatif : par exemple "), f("-3<-2{,}4<-2"), t(".")] : [t("Oublier qu'une base inférieure à 1 rend le logarithme décroissant.")]),
    ];
  }
  const textes = nombresRangerLatex(e);
  const lignes: LigneCalcul[] = [];
  e.nombres.forEach((n, i) => {
    if (n.type === "log") lignes.push(ligne(encadrementEntierLatex(n.terme), "étape 1"));
    else {
      const v = valeurNombre(n);
      const lo = Math.floor(v);
      if (n.valeur.den !== 1) lignes.push(ligne(`${textes[i]}${vaut(v, 3)}`, "écriture décimale"));
      if (!Number.isInteger(v)) lignes.push(ligne(`${entierLatex(lo)}<${dec(v, 3)}<${entierLatex(lo + 1)}`, "entre deux entiers consécutifs"));
    }
  });
  const ordre = [...e.nombres.keys()].sort((a, b) => valeurNombre(e.nombres[a]!) - valeurNombre(e.nombres[b]!));
  lignes.push(ligne(ordre.map((i) => textes[i]).join("<"), "on range les intervalles"));
  return [
    utilise(sq, [t("Chaque logarithme est dans son intervalle entre deux entiers consécutifs (étape 1) ; l'entier ou la fraction se place parmi ces intervalles (une fraction s'écrit sous forme décimale) " + COURS_PROPRIETES + ".")]),
    calcul(sq, lignes),
    resultat(sq, [t("Ordre croissant : "), ...reponse(e, phase)]),
  ];
}

// ============================================================================
// Changement de base.
// ============================================================================

function decompositionLatex(d: Decomposition): string {
  const facteurs = (signe: 1 | -1) =>
    ([
      [d.p, 2],
      [d.q, 3],
      [d.r, 5],
    ] as const)
      .filter(([c]) => c * signe > 0)
      .map(([c, b]) => (Math.abs(c) === 1 ? `${b}` : `${b}^{${Math.abs(c)}}`))
      .join("\\cdot ");
  const num = facteurs(1) || "1";
  const den = facteurs(-1);
  return den ? `\\dfrac{${num}}{${den}}` : num;
}

function substitue(e: ExerciceChangementBaseLog, d: Decomposition): string {
  const m = MILLIEMES[e.mode];
  const termes: string[] = [];
  for (const [c, v] of [
    [d.p, m.deux],
    [d.q, m.trois],
    [d.r, m.cinq],
  ] as const) {
    if (c === 0) continue;
    const abs = Math.abs(c);
    const terme = abs === 1 ? milliemesLatex(v) : `${abs}\\times ${milliemesLatex(v)}`;
    termes.push(termes.length === 0 ? (c < 0 ? `-${terme}` : terme) : `${c < 0 ? "-" : "+"}${terme}`);
  }
  return termes.join("");
}

function lignesValeur(e: ExerciceChangementBaseLog, d: Decomposition): LigneCalcul[] {
  const s = e.mode === "log" ? "\\log" : "\\ln";
  const arg = valeurDecomposition(d);
  const decomp = decompositionLatex(d);
  const lignes: LigneCalcul[] = [];
  const nb = Math.abs(d.p) + Math.abs(d.q) + Math.abs(d.r);
  const dejaSimple = nb === 1 && d.p + d.q + d.r === 1;
  if (!dejaSimple && decomp !== ratLatex(arg)) lignes.push(ligne(`${logDonneLatex(e, d)}=${s}\\left(${decomp}\\right)`, "décomposition en facteurs premiers"));
  if (!dejaSimple) lignes.push(ligne(`${lignes.length ? "" : logDonneLatex(e, d)}=${developpementLatex(e, d)}`, "logarithme d'un produit, d'un quotient, d'une puissance"));
  const sub = substitue(e, d);
  const val = logApprocheMilli(d, e.mode);
  const gauche = lignes.length ? "" : logDonneLatex(e, d);
  if (/[+\-\\]/.test(sub.replace(/^-/, ""))) {
    lignes.push(ligne(`${gauche}\\approx ${sub}`, [t("valeurs données "), f(valeursDonneesLatex(e).replace("\\qquad", ",\\ ")), ...(d.r !== 0 ? [t(", "), f("\\log(5)=1-\\log(2)\\approx 0{,}699")] : [])]));
    lignes.push(ligne(`=${milliemesLatex(val)}`));
  } else lignes.push(ligne(`${gauche}\\approx ${milliemesLatex(val)}`, "valeur donnée"));
  return lignes;
}

function etapesChangementBase(e: ExerciceChangementBaseLog, phase: PhaseComparerEncadrerLog, sq: string): EtapeCorrection[] {
  const s = e.mode === "log" ? "\\log" : "\\ln";
  const cible = cibleChangementBase(e);
  const quotient = `\\dfrac{${logDonneLatex(e, e.N)}}{${logDonneLatex(e, e.a)}}`;
  if (phase === "formule")
    return [
      utilise(sq, [t(`Changement de base vers la base ${e.mode === "log" ? "10" : "e"} : `), f(`\\log_a(x)=\\dfrac{${s}(x)}{${s}(a)}`), t(` ${COURS_PROPRIETES}.`)]),
      calcul(sq, [ligne(`${cible}=${quotient}`, "argument au numérateur, base au dénominateur")]),
      resultat(sq, [t("Changement de base : "), ...reponse(e, phase)]),
    ];
  if (phase === "valeurs")
    return [
      utilise(sq, [
        t("On décompose en produits (ou quotients) de puissances de 2 et de 3"),
        ...(e.N.r !== 0 || e.a.r !== 0 ? [t(" (et de 5, avec "), f("\\log(5)=\\log(10)-\\log(2)"), t(")")] : []),
        t(", puis on applique "),
        f(`${s}(xy)=${s}(x)+${s}(y)`),
        t(", "),
        f(`${s}\\left(\\dfrac{x}{y}\\right)=${s}(x)-${s}(y)`),
        t(" et "),
        f(`${s}\\left(x^{n}\\right)=n\\,${s}(x)`),
        t(` ${COURS_PROPRIETES}.`),
      ]),
      calcul(sq, lignesValeur(e, e.N), [], "Numérateur"),
      calcul(sq, lignesValeur(e, e.a), [], "Dénominateur"),
      resultat(sq, [t("Valeurs approchées : "), ...reponse(e, phase)]),
    ];
  const approche = e.logNMilli / e.logAMilli;
  return [
    utilise(sq, [t("On remplace chaque logarithme par sa valeur approchée (étape 2) dans le changement de base, puis on arrondit au centième " + COURS_PROPRIETES + ".")]),
    calcul(sq, [
      ligne(`${cible}=${quotient}`, "étape 1"),
      ligne(`\\approx\\dfrac{${milliemesLatex(e.logNMilli)}}{${milliemesLatex(e.logAMilli)}}`, "valeurs de l'étape 2"),
      ligne(`\\approx ${dec(approche, 4)}`, "division"),
      ligne(`\\approx ${centiemesLatex(e.resultatCentiemes)}`, "arrondi au centième"),
    ]),
    resultat(sq, [t("Valeur approchée : "), f(`${cible}\\approx ${centiemesLatex(e.resultatCentiemes)}`)]),
    verification(sq, [t("Ordre de grandeur : "), f(`${basePuissance(valeurDecomposition(e.a))}^{${dec(e.resultatCentiemes / 100, 2)}}\\approx ${dec(Math.pow(valeurRat(valeurDecomposition(e.a)), e.resultatCentiemes / 100), 2)}`), t(` est proche de `), f(ratLatex(valeurDecomposition(e.N))), t(".")]),
    piege(sq, [t("Inverser le quotient, ou écrire une différence "), f(`${logDonneLatex(e, e.N)}-${logDonneLatex(e, e.a)}`), t(" : le changement de base donne un quotient, argument au numérateur.")]),
  ];
}

export function correctionDetailleeComparerEncadrerLog(e: E): EtapeCorrection[] {
  return phasesExercice(e).flatMap((phase, i): EtapeCorrection[] => {
    const sq = LETTRES[i]!;
    switch (e.variante) {
      case "encadrer":
        return etapesEncadrer(e, phase, sq);
      case "comparer":
        return etapesComparer(e, phase, sq);
      case "ranger":
        return etapesRanger(e, phase, sq);
      case "changementBase":
        return etapesChangementBase(e, phase, sq);
    }
  });
}

