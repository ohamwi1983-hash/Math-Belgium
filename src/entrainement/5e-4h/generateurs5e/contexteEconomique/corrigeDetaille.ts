import type { EtapeCorrection, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, ligne, piege, resultat, utilise, verification } from "../../../export/corrigeTableau";
import type { CoutTotalA, ExerciceContexteEconomique, ExerciceContexteEconomiqueA, ExerciceContexteEconomiqueB, ExerciceContexteEconomiqueBonus } from "../../core5e/contexteEconomique.types";
import { ordreEcransContexteEconomique, type EcranContexteEconomique } from "../../moteur5e/typesContexteEconomique";
import { formatNombreTexte, formatReponseAttenduePhaseLatex } from "../../ui5e/formatContexteEconomique";
import {
  COURS_ECONOMIQUE,
  COURS_SIGNE,
  approche,
  dec,
  deriveePoly,
  egalApprox,
  f,
  finaliserDerivees,
  lignesDeriveePoly,
  lignesTrinome,
  lignesValeurPoly,
  lignesValeurQ,
  listeEt,
  parN,
  pgcd,
  polyV,
  q,
  qL,
  qVal,
  racineL,
  signeRel,
  t,
  type Fragments,
} from "../../ui5e/corrigeDerivees2";
import { evaluerP } from "./index";

/**
 * Corrigé détaillé « comme au tableau » de 5gen33 (contexte économique) — règle
 * `.claude/rules/feuilles-evaluations.md`. Une lettre par ÉCRAN (`ordreEcransContexteEconomique`).
 * Famille A : C_T(q₀ + 1) et C_T(q₀) calculés puis soustraits, C′_T terme à terme, C′_T(q₀) substitué,
 * écart absolu et écart en % (fraction puis arrondi) ; minimum du coût moyen (C_M = C_T/q divisé terme à
 * terme, C′_M = 0 ⟺ aq² = c, q > 0, puis C_M = 2aq + b car c/q = aq à l'optimum) ou du coût marginal
 * (C″_T = 0, puis C′_T en la fraction trouvée). Famille B : recette distribuée, deux dérivées, égalité des
 * marginales ramenée à un trinôme (discriminant, racine négative rejetée), bénéfice réduit, B′, signe en
 * deux points test, B(x) au maximum. Dichotomie : P(q) développé et réduit, milieu et signe de P à chaque
 * étape (tableau des quatre étapes en figure), milieu du dernier intervalle. SANS `docx` : importé par
 * l'adaptateur ET par `App5gen33.tsx`.
 */

const LETTRES = "abcdefgh";

export function lettreEcranContexteEconomique(e: ExerciceContexteEconomique, ecran: EcranContexteEconomique): string {
  return LETTRES[ordreEcransContexteEconomique(e).indexOf(ecran)] ?? "a";
}

const rep = (e: ExerciceContexteEconomique, ecran: EcranContexteEconomique): Fragments => listeEt(formatReponseAttenduePhaseLatex(e, ecran).map((x) => [f(x)]));

function coeffs(c: CoutTotalA): number[] {
  return c.degre === 2 ? [c.c, c.b, c.a] : [c.d, c.c, c.b, c.a];
}

// ============================================================================
// Famille A.
// ============================================================================

function etapesA(e: ExerciceContexteEconomiqueA, l: (x: EcranContexteEconomique) => string): EtapeCorrection[] {
  const C = coeffs(e.coutTotal);
  const dC = deriveePoly(C);
  const q0 = e.q0;
  const v1 = lignesValeurPoly(`C_T(${q0 + 1})`, C, q0 + 1, undefined, "q");
  const v0 = lignesValeurPoly(`C_T(${q0})`, C, q0, undefined, "q");
  const out: EtapeCorrection[] = [];
  // a) différence
  const la = l("coutMarginalDiscret");
  out.push(
    utilise(la, [t("Le coût de l'unité supplémentaire se lit comme une différence de deux coûts totaux : "), f("C_T(q_0+1)-C_T(q_0)"), t(" "), t(COURS_ECONOMIQUE), t(".")]),
    calcul(la, v1.lignes, [], `En q = ${q0 + 1}`),
    calcul(la, v0.lignes, [], `En q = ${q0}`),
    calcul(la, [ligne(`C_T(${q0 + 1})-C_T(${q0})=${v1.valeur}-${v0.valeur}`, "on soustrait"), ligne(`=${v1.valeur - v0.valeur}`)], [], "Différence"),
    resultat(la, [...rep(e, "coutMarginalDiscret"), t(" €.")]),
  );
  // b) dérivée
  const lb = l("deriveeSymbolique");
  out.push(
    utilise(lb, [t("Le coût marginal est la dérivée du coût total ; on dérive terme à terme, "), f("(a\\,q^{n})'=n\\,a\\,q^{n-1}"), t(" "), t(COURS_ECONOMIQUE), t(".")]),
    calcul(lb, [ligne(`C_T(q)=${polyV(C, "q")}`, "énoncé"), ...lignesDeriveePoly("C'_T(q)", C, "q")]),
    resultat(lb, [...rep(e, "deriveeSymbolique"), t(".")]),
  );
  // c) valeur
  const lc = l("deriveeValeur");
  out.push(
    utilise(lc, [t("On remplace q par "), f(`q_0=${q0}`), t(" dans "), f(`C'_T(q)=${polyV(dC, "q")}`), t(" "), t(COURS_ECONOMIQUE), t(".")]),
    calcul(lc, lignesValeurPoly(`C'_T(${q0})`, dC, q0, undefined, "q").lignes),
    resultat(lc, [...rep(e, "deriveeValeur"), t(" €.")]),
  );
  // d) écarts
  const ld = l("comparaisonEcart");
  const fr = q(e.ecartAbsolu * 100, e.cmDerivee);
  const lignesD: LigneCalcul[] = [
    ligne(`E=|${e.cmDiscret}-${e.cmDerivee}|`, "écart absolu : distance entre les deux estimations"),
    ligne(`=${e.ecartAbsolu}`),
    ligne(`p=\\dfrac{E}{C'_T(${q0})}\\times 100`, "écart rapporté à l'estimation par la dérivée"),
    ligne(`=\\dfrac{${e.ecartAbsolu}}{${e.cmDerivee}}\\times 100`),
    ligne(`=${qL(fr)}`),
  ];
  if (fr.d !== 1) lignesD.push(ligne(egalApprox(qVal(fr), 2), "arrondi au centième"));
  out.push(
    utilise(ld, [t("Écart absolu = différence (positive) des deux estimations ; écart en pourcentage = écart absolu ÷ estimation par la dérivée × 100 "), t(COURS_ECONOMIQUE), t(".")]),
    calcul(ld, lignesD),
    resultat(ld, [...rep(e, "comparaisonEcart"), t(".")]),
    piege(ld, [t("L'écart en pourcentage se rapporte à l'estimation par la dérivée, pas à l'estimation par différence.")]),
  );
  // e) minimum
  const le = l("extremum");
  const c = e.coutTotal;
  if (e.minimum.grandeur === "coutMoyen" && c.degre === 2) {
    const ca = q(c.c, c.a);
    const lignesE: LigneCalcul[] = [
      ligne(`C_M(q)=\\dfrac{${polyV(C, "q")}}{q}`, [f("C_M=\\frac{C_T}{q}")]),
      ligne(`=${c.a === 1 ? "" : c.a}q+${c.b}+\\dfrac{${c.c}}{q}`, "on divise chaque terme par q"),
      ligne(`C'_M(q)=${c.a}-\\dfrac{${c.c}}{q^{2}}`, [t("dérivée : "), f("\\left(\\frac{k}{q}\\right)'=-\\frac{k}{q^{2}}")]),
    ];
    const resol: LigneCalcul[] = [
      ligne(`${c.a}-\\dfrac{${c.c}}{q^{2}}=0`, [f("C'_M(q)=0")]),
      ligne(`${c.a === 1 ? "" : c.a}q^{2}=${c.c}`, "on multiplie par q² (q > 0) et on isole"),
    ];
    if (c.a !== 1) resol.push(ligne(`q^{2}=${qL(ca)}`, `on divise par ${c.a}`));
    const exact = e.minimum.exact;
    resol.push(ligne(`q=\\sqrt{${qL(ca, true)}}`, "q > 0 : on garde la racine positive"));
    if (exact) resol.push(ligne(`=${Math.round(e.minimum.q)}`));
    else resol.push(ligne(`\\approx ${approche(e.minimum.q, 2)}`));
    const qTxt = exact ? `${Math.round(e.minimum.q)}` : `\\sqrt{${qL(ca, true)}}`;
    const valeur: LigneCalcul[] = [
      ligne(`\\dfrac{${c.c}}{q}=${c.a === 1 ? "" : c.a}q`, [t("à l'optimum, car "), f(`${c.a === 1 ? "" : c.a}q^{2}=${c.c}`)]),
      ligne(`C_M(q)=${2 * c.a}q+${c.b}`, [t("on remplace "), f(`\\frac{${c.c}}{q}`), t(" dans "), f("C_M(q)")]),
      ligne(`=${2 * c.a}\\cdot ${qTxt}+${c.b}`),
    ];
    if (!exact && c.a !== 1) valeur.push(ligne(`=2\\sqrt{${c.a * c.c}}+${c.b}`, [f(`${2 * c.a}\\sqrt{\\frac{${c.c}}{${c.a}}}=2\\sqrt{${c.a}\\cdot ${c.c}}`)]));
    valeur.push(ligne(egalApprox(e.minimum.valeur, 2), exact ? undefined : "arrondi au centième"));
    out.push(
      utilise(le, [t("Le coût moyen est "), f("C_M(q)=\\frac{C_T(q)}{q}"), t(" ; il est minimal là où sa dérivée s'annule en changeant de signe (− puis +) "), t(COURS_ECONOMIQUE), t(".")]),
      calcul(le, lignesE, [], "Coût moyen"),
      calcul(le, resol, [], "Production"),
      calcul(le, valeur, [], "Minimum"),
      resultat(le, [...rep(e, "extremum"), t(" €.")]),
      verification(le, [t("Signe de "), f("C'_M"), t(" : négatif avant cette production, positif après — "), f("C_M"), t(" décroît puis croît, c'est bien un minimum.")], [
        ligne(`C'_M(${Math.max(1, Math.floor(e.minimum.q) - 1)})=${c.a}-\\dfrac{${c.c}}{${Math.max(1, Math.floor(e.minimum.q) - 1) ** 2}}`),
        ligne(`${egalApprox(c.a - c.c / Math.max(1, Math.floor(e.minimum.q) - 1) ** 2, 2)}<0`),
      ]),
      piege(le, [t("On dérive le coût moyen (le coût total divisé par q), pas le coût total, qui croît toujours.")]),
    );
  } else if (c.degre === 3) {
    const d2 = deriveePoly(dC);
    const qMin = q(-c.b, 3 * c.a);
    const lignesE: LigneCalcul[] = [ligne(`C'_T(q)=${polyV(dC, "q")}`, "étape 2"), ...lignesDeriveePoly("C''_T(q)", dC, "q")];
    const resol: LigneCalcul[] = [ligne(`${polyV(d2, "q")}=0`, [f("C''_T(q)=0")]), ligne(`${d2[1]}q=${-d2[0]}`, "on isole le terme en q"), ligne(`q=\\dfrac{${-d2[0]}}{${d2[1]}}`, `on divise par ${d2[1]}`)];
    if (qMin.d !== d2[1] || qMin.n !== -d2[0]) resol.push(ligne(`=${qL(qMin)}`, "on simplifie"));
    if (qMin.d !== 1) resol.push(ligne(`\\approx ${approche(qVal(qMin), 2)}`));
    const v = lignesValeurQ(`C'_T\\left(${qL(qMin, true)}\\right)`, dC, qMin, "q");
    const val: LigneCalcul[] = [...v.lignes];
    if (v.valeur.d !== 1) val.push(ligne(egalApprox(qVal(v.valeur), 2), "arrondi au centième"));
    out.push(
      utilise(le, [t("Le coût marginal "), f("C'_T"), t(" est minimal là où sa dérivée "), f("C''_T"), t(" s'annule en passant de − à + ; on calcule ensuite "), f("C'_T"), t(" en cette production "), t(COURS_ECONOMIQUE), t(".")]),
      calcul(le, lignesE, [], "Dérivée seconde"),
      calcul(le, resol, [], "Production"),
      calcul(le, val, [], "Minimum"),
      resultat(le, [...rep(e, "extremum"), t(" €.")]),
      verification(le, [f(`C''_T(q)=${polyV(d2, "q")}`), t(` a un coefficient de q positif (${d2[1]}) : négatif avant, positif après — `), f("C'_T"), t(" décroît puis croît, c'est bien un minimum.")]),
      piege(le, [t("On dérive le coût marginal C′ (donc C″ = 0), pas le coût total, qui croît toujours.")]),
    );
  }
  return out;
}

// ============================================================================
// Famille B.
// ============================================================================

function etapesB(e: ExerciceContexteEconomiqueB, l: (x: EcranContexteEconomique) => string): EtapeCorrection[] {
  const p = [e.k, e.m];
  const R = [0, e.k, e.m];
  const C = [e.d, e.c, e.b, e.a];
  const B = [-e.d, e.k - e.c, e.m - e.b, -e.a];
  const dB = deriveePoly(B);
  const out: EtapeCorrection[] = [];
  const la = l("recetteTotale");
  out.push(
    utilise(la, [t("Recette totale = quantité × prix unitaire : "), f("R_T(x)=x\\cdot p(x)"), t(" "), t(COURS_ECONOMIQUE), t(".")]),
    calcul(la, [ligne(`R_T(x)=x\\cdot p(x)`, "définition"), ligne(`=x(${polyV(p)})`, [f(`p(x)=${polyV(p)}`)]), ligne(`=${polyV(R)}`, "on distribue x")]),
    resultat(la, [...rep(e, "recetteTotale"), t(".")]),
  );
  const lb = l("marginales");
  out.push(
    utilise(lb, [t("Coût marginal et recette marginale sont les dérivées du coût total et de la recette totale ; on dérive terme à terme "), t(COURS_ECONOMIQUE), t(".")]),
    calcul(lb, [ligne(`C_T(x)=${polyV(C)}`, "énoncé"), ...lignesDeriveePoly("C'_T(x)", C)], [], "Coût marginal"),
    calcul(lb, [ligne(`R_T(x)=${polyV(R)}`, "étape 1"), ...lignesDeriveePoly("R'_T(x)", R)], [], "Recette marginale"),
    resultat(lb, [...rep(e, "marginales"), t(".")]),
  );
  const lc = l("resoudreEgaliteMarginales");
  const A2 = 3 * e.a;
  const B2 = 2 * e.b - 2 * e.m;
  const C2 = e.c - e.k;
  const g = pgcd(pgcd(A2, B2), C2);
  const sol = lignesTrinome(A2 / g, B2 / g, C2 / g, "x");
  const racines = sol.racines.map((r) => racineL(r));
  out.push(
    utilise(lc, [t("Le bénéfice est maximal là où coût marginal et recette marginale sont égaux ("), f("B'=R'_T-C'_T=0"), t(") ; on ramène l'égalité à une équation du second degré "), t(COURS_ECONOMIQUE), t(".")]),
    calcul(lc, [ligne(`${polyV(deriveePoly(C))}=${polyV(deriveePoly(R))}`, [f("C'_T(x)=R'_T(x)")]), ligne(`${polyV([C2, B2, A2])}=0`, "on ramène tout dans le membre de gauche"), ...(g > 1 ? [ligne(`${polyV([C2 / g, B2 / g, A2 / g])}=0`, `on divise les deux membres par ${g}`)] : []), ...sol.lignes]),
    resultat(lc, [t("Solutions "), f(`x=${racines[0]}`), t(" et "), f(`x=${racines[1]}`), t(" : "), ...rep(e, "resoudreEgaliteMarginales"), t(".")]),
    piege(lc, [t("Une quantité produite est positive : la solution négative est rejetée.")]),
  );
  const ld = l("beneficeFormule");
  out.push(
    utilise(ld, [t("Bénéfice = recette − coût : "), f("B(x)=R_T(x)-C_T(x)"), t(" ; le signe − se distribue sur tous les termes du coût "), t(COURS_ECONOMIQUE), t(".")]),
    calcul(ld, [
      ligne(`B(x)=R_T(x)-C_T(x)`, "définition"),
      ligne(`=${polyV(R)}-(${polyV(C)})`, "on remplace"),
      ligne(`=${polyV(R)}${polyV(C.map((x) => -x)).replace(/^(?!-)/, "+")}`, "on distribue le signe −"),
      ligne(`=${polyV(B)}`, "on regroupe les termes de même degré"),
    ]),
    resultat(ld, [...rep(e, "beneficeFormule"), t(".")]),
  );
  const le = l("beneficeDerivee");
  out.push(
    utilise(le, [t("On dérive le bénéfice terme à terme (c'est aussi "), f("R'_T(x)-C'_T(x)"), t(") "), t(COURS_ECONOMIQUE), t(".")]),
    calcul(le, [ligne(`B(x)=${polyV(B)}`, "étape précédente"), ...lignesDeriveePoly("B'(x)", B)]),
    resultat(le, [...rep(e, "beneficeDerivee"), t(".")]),
  );
  const lf = l("tableauSigneBenefice");
  const signer = (x: number) => {
    const v = lignesValeurPoly(`B'(${x})`, dB, x, `on remplace x par ${x}`);
    const lignes = [...v.lignes];
    const der = lignes[lignes.length - 1];
    lignes[lignes.length - 1] = { ...der, latex: `${der.latex}${signeRel(v.valeur)}` };
    return lignes;
  };
  out.push(
    utilise(lf, [t("Le signe de B′ de part et d'autre de la quantité retenue donne les variations de B : + puis −, B croît puis décroît, maximum "), t(COURS_SIGNE), t(".")]),
    calcul(lf, signer(e.pointTestAvant), [], `Avant x = ${e.xOpt}`),
    calcul(lf, signer(e.pointTestApres), [], `Après x = ${e.xOpt}`),
    resultat(lf, [...rep(e, "tableauSigneBenefice"), t(".")]),
  );
  const lg = l("beneficeMaximum");
  const vB = lignesValeurPoly(`B(${e.xOpt})`, B, e.xOpt);
  out.push(
    utilise(lg, [t("Le bénéfice maximal est "), f(`B(${e.xOpt})`), t(" : on remplace x par la quantité retenue dans B(x), pas dans B′(x) "), t(COURS_ECONOMIQUE), t(".")]),
    calcul(lg, vB.lignes),
    resultat(lg, [...rep(e, "beneficeMaximum"), t(" centaines d'euros.")]),
    piege(lg, [t("On remplace x dans B(x), pas dans B′(x).")]),
  );
  return out;
}

// ============================================================================
// Dichotomie.
// ============================================================================

const STYLE_TABLE = 'style="border-collapse:collapse;margin:4px 0;font-size:13px;font-family:Archivo, Arial, Helvetica, sans-serif"';
const STYLE_CASE = 'style="border:1px solid #868e96;padding:3px 8px;text-align:center"';
const STYLE_ENTETE = 'style="border:1px solid #868e96;padding:3px 8px;text-align:center;background:#f1f3f5"';

export function tableauDichotomieHtml(e: ExerciceContexteEconomiqueBonus): string {
  const lignes = e.iterations.map((it, i) => {
    const garde = it.garderCote === "gauche" ? [it.gauche, it.milieu] : [it.milieu, it.droite];
    const cases = [`${i + 1}`, `[${formatNombreTexte(it.gauche)} ; ${formatNombreTexte(it.droite)}]`, formatNombreTexte(it.milieu), it.signeMilieu > 0 ? "+" : "−", `[${formatNombreTexte(garde[0])} ; ${formatNombreTexte(garde[1])}]`];
    return `<tr>${cases.map((c) => `<td ${STYLE_CASE}>${c}</td>`).join("")}</tr>`;
  });
  const tetes = ["Étape", "Intervalle", "Milieu m", "Signe de P(m)", "Intervalle gardé"].map((x) => `<th ${STYLE_ENTETE}>${x}</th>`).join("");
  return `<table ${STYLE_TABLE}><thead><tr>${tetes}</tr></thead><tbody>${lignes.join("")}</tbody></table>`;
}

function etapesBonus(e: ExerciceContexteEconomiqueBonus, l: (x: EcranContexteEconomique) => string): EtapeCorrection[] {
  const c = e.coutTotal;
  const C = [c.d, c.c, c.b, c.a];
  const dC = deriveePoly(C);
  const P = [-c.d, 0, c.b, 2 * c.a];
  const out: EtapeCorrection[] = [];
  const la = l("poserEquationReduite");
  out.push(
    utilise(la, [t("L'égalité "), f("C'_T(q)=C_M(q)=\\frac{C_T(q)}{q}"), t(" équivaut (q > 0) à "), f("q\\cdot C'_T(q)-C_T(q)=0"), t(" ; on développe et on réduit "), t(COURS_ECONOMIQUE), t(".")]),
    calcul(la, [
      ligne(`C'_T(q)=${polyV(dC, "q")}`, "dérivée terme à terme"),
      ligne(`P(q)=q(${polyV(dC, "q")})-(${polyV(C, "q")})`, [f("P(q)=q\\cdot C'_T(q)-C_T(q)")]),
      ligne(`=${polyV([0, ...dC], "q")}${polyV(C.map((x) => -x), "q").replace(/^(?!-)/, "+")}`, "on distribue q, puis le signe −"),
      ligne(`=${polyV(P, "q")}`, "on regroupe : les termes en q s'annulent"),
    ]),
    resultat(la, [...rep(e, "poserEquationReduite"), t(".")]),
  );
  const nombre = (v: number) => dec(v, 6);
  const valeurP = (x: number): LigneCalcul[] => {
    const base = parN(x);
    const sub = `${2 * c.a === 1 ? "" : `${2 * c.a}\\cdot `}${base}^{3}${c.b === 0 ? "" : `${c.b < 0 ? "-" : "+"}${Math.abs(c.b) === 1 ? "" : `${Math.abs(c.b)}\\cdot `}${base}^{2}`}-${c.d}`;
    const v = evaluerP(c, x);
    return [ligne(`P(${nombre(x)})=${sub.replace(/\./g, "{,}")}`, `on remplace q par ${formatNombreTexte(x)}`), ligne(`${egalApprox(v, 4)}${signeRel(v)}`)];
  };
  (["iteration0", "iteration1", "iteration2", "iteration3"] as const).forEach((ecran, i) => {
    const li = l(ecran);
    const it = e.iterations[i];
    const garde = it.garderCote === "gauche" ? [it.gauche, it.milieu] : [it.milieu, it.droite];
    const signeG = evaluerP(c, it.gauche) > 0 ? 1 : -1;
    const blocs: EtapeCorrection[] = [
      utilise(li, [t("Dichotomie : on calcule le milieu m de l'intervalle et le signe de P(m) ; on garde la moitié aux bornes de laquelle P prend des signes contraires (la solution s'y trouve) "), t(COURS_ECONOMIQUE), t(".")]),
      calcul(li, [ligne(`m=\\dfrac{${nombre(it.gauche)}+${nombre(it.droite)}}{2}`, "milieu de l'intervalle"), ligne(`=${nombre(it.milieu)}`)], [], "Milieu"),
      calcul(li, valeurP(it.milieu), [], "Signe de P(m)"),
      calcul(li, valeurP(it.gauche), [t(`À la borne gauche (signe ${signeG > 0 ? "+" : "−"}) :`)], "Borne gauche"),
      { ...resultat(li, [...rep(e, ecran), t(` : P change de signe entre ${formatNombreTexte(garde[0])} et ${formatNombreTexte(garde[1])}.`)]), ...(i === 3 ? { figureHtml: tableauDichotomieHtml(e) } : {}) },
    ];
    out.push(...blocs);
  });
  const lr = l("racineApprochee");
  const der = e.iterations[e.iterations.length - 1];
  const [g, d] = der.garderCote === "gauche" ? [der.gauche, der.milieu] : [der.milieu, der.droite];
  out.push(
    utilise(lr, [t("La solution est dans le dernier intervalle gardé ; son milieu l'approche à une demi-largeur près "), t(COURS_ECONOMIQUE), t(".")]),
    calcul(lr, [ligne(`q\\approx\\dfrac{${nombre(g)}+${nombre(d)}}{2}`, "milieu du dernier intervalle"), ligne(`=${nombre((g + d) / 2)}`), ligne(`\\dfrac{${nombre(d)}-${nombre(g)}}{2}=${nombre((d - g) / 2)}`, "demi-largeur : précision de la valeur approchée")]),
    resultat(lr, [...rep(e, "racineApprochee"), t(` (à ${formatNombreTexte(e.toleranceFinale)} près).`)]),
  );
  return out;
}

export function correctionDetailleeContexteEconomique(e: ExerciceContexteEconomique): EtapeCorrection[] {
  const l = (x: EcranContexteEconomique) => lettreEcranContexteEconomique(e, x);
  const etapes = e.famille === "A" ? etapesA(e, l) : e.famille === "B" ? etapesB(e, l) : etapesBonus(e, l);
  return finaliserDerivees(etapes);
}
