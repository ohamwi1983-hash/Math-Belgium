import type { ExerciceEqLogA, ExerciceEqLogB, ExerciceEqLogC, ExerciceEqLogD, ExerciceEqLogE, ExerciceEqLogG, ExerciceEquationsExpLog } from "../../core6e/equationsExpLog.types";
import type { PhaseEquationsExpLog } from "../../moteur6e/typesEquationsExpLog";
import type { EtapeCorrection, FragmentConsigne, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import { ceELatex, ceIdentiteLatex, combinaisonLnLatex, exposantExactA, formatAffineLatex, formatBaseLatex, formatCLatex, formatDecimal, formatReponseAttenduePhaseLatex, polynomeELatex, xExactA, xExactC, xExactD } from "../../ui6e/formatEquationsExpLog";
import { affine, COURS_EQUATIONS, finaliserCorrige, frac, justif, logBase, nb, parN, sommeTermes } from "../../ui6e/corrigeLogarithmes1";
import { lignesTrinome, q, sansRepetition } from "../../ui6e/corrigeIntegrales1";

/**
 * Corrigé détaillé « comme au tableau » de `6gen14` (équations exponentielles et logarithmiques)
 * — règle `.claude/rules/feuilles-evaluations.md`. SOURCE UNIQUE : importé par l'adaptateur papier
 * (`exportEvaluation.ts`) ET par l'appli (`App6gen14.tsx`, corrigé d'une étape échouée). Étapes
 * a, b, c = les écrans de `PHASES_PAR_FAMILLE` ; chaque résultat est la réponse de l'écran
 * (`formatReponseAttenduePhaseLatex`), les valeurs intermédiaires (Δ, racines, bornes de la CE,
 * valeur testée) sont calculées depuis l'instance. Logarithme décimal écrit « log » (jamais log₁₀).
 */

function rep(ex: ExerciceEquationsExpLog, phase: PhaseEquationsExpLog): string[] {
  return formatReponseAttenduePhaseLatex(ex, phase);
}

function estEntier(v: number): boolean {
  return Math.abs(v - Math.round(v)) < 1e-9;
}

/** « x = exact ≈ approché » (la réponse de l'écran commence déjà par la valeur exacte). */
function egaliteX(valeur: string, nom = "x"): string {
  return valeur.startsWith("\\approx") ? `${nom} ${valeur}` : `${nom} = ${valeur}`;
}

function ensemble(valeurs: string[]): string {
  return valeurs.length === 0 ? "S=\\varnothing" : `S=\\left\\{${valeurs.join(" ; ")}\\right\\}`;
}

/** Valeur approchée au millième, si la valeur n'est pas entière. */
function lignesApprox(v: number): LigneCalcul[] {
  if (estEntier(v)) return [];
  // Décimal exact (au plus 3 chiffres) : « = », sinon « ≈ » au millième.
  if (Math.abs(v * 1000 - Math.round(v * 1000)) < 1e-9) return [ligne(`=${formatDecimal(v, 3)}`, "écriture décimale")];
  return [ligne(`\\approx ${formatDecimal(v, 3)}`, "valeur approchée au millième")];
}

/** Terme « c·ln(a)·x » ou « c·ln(a) » d'une somme (signe compris). */
function lnTerme(c: number, arg: number, avecX: boolean, premier: boolean): string {
  if (c === 0) return "";
  const abs = Math.abs(c);
  const corps = `${abs === 1 ? "" : abs}\\ln(${arg})${avecX ? "\\,x" : ""}`;
  return c < 0 ? `-${corps}` : premier ? corps : `+${corps}`;
}

function sommeLn(termes: [number, number, boolean][]): string {
  let s = "";
  for (const [c, a, x] of termes) s += lnTerme(c, a, x, s === "");
  return s === "" ? "0" : s;
}

// ---------------------------------------------------------------------------- Famille A

function correctionA(ex: ExerciceEqLogA): EtapeCorrection[] {
  const b = ex.base;
  const u = formatAffineLatex(ex.m, ex.n);
  const E = exposantExactA(ex);
  const etapes: EtapeCorrection[] = [];
  // a) exposant
  const la: LigneCalcul[] = [];
  if (ex.estPuissancePropre) {
    const p = ex.p as number;
    etapes.push(utilise("a", [texte(`Le second membre est une puissance de ${b} : on l'écrit sous la forme `), latex(`${b}^{p}`), texte(` puis on égale les exposants (même base) ${COURS_EQUATIONS}. Aucun logarithme n'est utile.`)]));
    la.push(ligne(`${b}^{${u}}=${formatCLatex(ex)}`, "équation de départ"));
    if (p < 0) la.push(ligne(`=${b}^{${p}}`, justif("car ", { l: `\\dfrac{1}{${b}^{${-p}}}=${b}^{${p}}` })));
    else la.push(ligne(`=${b}^{${p}}`, p === 0 ? justif("car ", { l: `${b}^{0}=1` }) : justif("car ", { l: `${b}^{${p}}=${ex.C}` })));
    la.push(ligne(`${u}=${p}`, "même base : on égale les exposants"));
  } else {
    etapes.push(
      utilise("a", [
        latex(String(ex.C)),
        texte(` n'est pas une puissance entière de ${b} : on prend le logarithme de base ${b}, `),
        latex(`${b}^{u}=C\\iff u=${logBase(b)}(C)=\\dfrac{\\ln(C)}{\\ln(${b})}`),
        texte(` ${COURS_EQUATIONS}.`),
      ]),
    );
    la.push(ligne(`${b}^{${u}}=${ex.C}`, "équation de départ"));
    la.push(ligne(`${u}=${logBase(b)}(${ex.C})`, `on prend le logarithme de base ${b}`));
    la.push(ligne(`=${E}`, "changement de base"));
    la.push(...lignesApprox(ex.exposantCible));
  }
  etapes.push(calcul("a", la));
  etapes.push(resultat("a", [latex(egaliteX(rep(ex, "aEcran1")[0], u))]));
  if (ex.estPuissancePropre && (ex.p as number) <= 0) etapes.push(piege("a", ex.p === 0 ? [texte("Le second membre vaut 1 : "), latex(`1=${b}^{0}`), texte(", l'exposant est 0 (pas 1).")] : [texte("Une fraction "), latex(`\\dfrac{1}{${b}^{k}}`), texte(" s'écrit "), latex(`${b}^{-k}`), texte(" : l'exposant est négatif.")]));
  if (!ex.estPuissancePropre) etapes.push(piege("a", [latex(`${logBase(b)}(${ex.C})=\\dfrac{\\ln(${ex.C})}{\\ln(${b})}`), texte(", et non "), latex(`\\dfrac{\\ln(${b})}{\\ln(${ex.C})}`), texte(" ni "), latex(`\\ln\\!\\left(\\dfrac{${ex.C}}{${b}}\\right)`), texte(".")]));
  // b) x
  etapes.push(utilise("b", [texte("Équation du premier degré : on isole x (on retire la constante, puis on divise par le coefficient de x).")]));
  const lb: LigneCalcul[] = [ligne(`${u}=${E}`, "exposant obtenu à l'étape 1")];
  const m = ex.m;
  const n = ex.n;
  const mx = m === 1 ? "x" : m === -1 ? "-x" : `${m}x`;
  if (ex.estPuissancePropre) {
    const p = ex.p as number;
    if (n !== 0) lb.push(ligne(`${mx}=${p}${n > 0 ? "-" : "+"}${Math.abs(n)}`, n > 0 ? `on soustrait ${n}` : `on ajoute ${-n}`), ligne(`${mx}=${p - n}`));
    if (m !== 1) {
      lb.push(ligne(`x=\\dfrac{${p - n}}{${m}}`, `on divise par ${m}`));
      if (frac(p - n, m) !== `\\dfrac{${p - n}}{${m}}`) lb.push(ligne(`=${frac(p - n, m)}`, "on simplifie"));
    }
  } else {
    const num = combinaisonLnLatex([
      { c: 1, arg: ex.C },
      { c: -n, arg: b },
    ]);
    if (n !== 0) {
      lb.push(ligne(`${mx}=${E}${n > 0 ? "-" : "+"}${Math.abs(n)}`, n > 0 ? `on soustrait ${n}` : `on ajoute ${-n}`));
      lb.push(ligne(`${mx}=\\dfrac{${num}}{\\ln(${b})}`, justif("même dénominateur : ", { l: `${Math.abs(n)}=\\dfrac{${Math.abs(n)}\\ln(${b})}{\\ln(${b})}` })));
    }
    if (m !== 1) {
      lb.push(ligne(`x=\\dfrac{${num}}{${m === -1 ? "-" : m}\\ln(${b})}`, `on divise par ${m}`));
      if (m < 0) lb.push(ligne(`=${xExactA(ex)}`, "on change les signes du numérateur et du dénominateur"));
    } else if (n === 0) {
      lb.push(ligne(`x=${xExactA(ex)}`));
    }
  }
  lb.push(...lignesApprox(ex.x));
  etapes.push(calcul("b", sansRepetition(lb)));
  etapes.push(resultat("b", [latex(egaliteX(rep(ex, "aEcran2")[0])), texte(", soit "), latex(ensemble([xExactA(ex)]))]));
  if (ex.estPuissancePropre) {
    const x = ex.x;
    etapes.push(verification("b", [texte("On remplace x dans l'exposant :")], [ligne(`${m === 1 ? "" : m === -1 ? "-" : `${m}\\cdot `}${parN(x)}${n === 0 ? "" : n > 0 ? `+${n}` : `-${-n}`}=${ex.p}`, justif("on retrouve ", { l: `${b}^{${ex.p}}=${formatCLatex(ex)}` }))]));
  }
  if (ex.estPuissancePropre && ex.p !== null && ex.p > 0 && m !== 1) {
    etapes.push(piege("b", m < 0 ? [texte("Diviser par "), latex(String(m)), texte(" (nombre négatif) change le signe du résultat.")] : [texte("Pour isoler x, on retire d'abord la constante, puis on divise par "), latex(String(m)), texte(" — dans cet ordre.")]));
  }
  return etapes;
}

// ---------------------------------------------------------------------------- Famille B

function correctionB(ex: ExerciceEqLogB): EtapeCorrection[] {
  const u1 = formatAffineLatex(ex.m1, ex.n1);
  const u2 = formatAffineLatex(ex.m2, ex.n2);
  const etapes: EtapeCorrection[] = [];
  etapes.push(utilise("a", [texte(`Bases différentes (${ex.base1} et ${ex.base2}) : on prend ln des deux membres (ln est strictement croissante, donc injective), puis `), latex("\\ln(a^u)=u\\cdot\\ln(a)"), texte(` ${COURS_EQUATIONS}.`)]));
  etapes.push(
    calcul("a", [
      ligne(`${ex.base1}^{${u1}}=${ex.base2}^{${u2}}`, "équation de départ"),
      ligne(`\\ln\\!\\left(${ex.base1}^{${u1}}\\right)=\\ln\\!\\left(${ex.base2}^{${u2}}\\right)`, "on applique ln aux deux membres"),
      ligne(rep(ex, "bEcran1")[0], justif("", { l: "\\ln(a^u)=u\\cdot\\ln(a)" })),
    ]),
  );
  etapes.push(resultat("a", [latex(rep(ex, "bEcran1")[0])]));
  etapes.push(piege("a", [texte("Tout l'exposant multiplie le ln : "), latex(`\\ln\\!\\left(${ex.base1}^{${u1}}\\right)=(${u1})\\ln(${ex.base1})`), texte(" — parenthèses obligatoires.")]));
  // b)
  const den = combinaisonLnLatex([
    { c: ex.m1, arg: ex.base1 },
    { c: -ex.m2, arg: ex.base2 },
  ]);
  const num = combinaisonLnLatex([
    { c: ex.n2, arg: ex.base2 },
    { c: -ex.n1, arg: ex.base1 },
  ]);
  const exact = rep(ex, "bEcran2")[0].split(" \\approx")[0];
  etapes.push(utilise("b", [texte("Équation du premier degré en x : on développe, on regroupe les termes en x d'un côté et les constantes de l'autre, on met x en évidence et on divise.")]));
  const lb: LigneCalcul[] = [
    ligne(rep(ex, "bEcran1")[0], "forme obtenue à l'étape 1"),
    ligne(`${sommeLn([[ex.m1, ex.base1, true], [ex.n1, ex.base1, false]])}=${sommeLn([[ex.m2, ex.base2, true], [ex.n2, ex.base2, false]])}`, "on distribue"),
    ligne(`${sommeLn([[ex.m1, ex.base1, true], [-ex.m2, ex.base2, true]])}=${num}`, "termes en x à gauche, constantes à droite"),
    ligne(`x\\,(${den})=${num}`, "on met x en évidence"),
    ligne(`x=\\dfrac{${num}}{${den}}`, justif("on divise par ", { l: den }, " (non nul)")),
  ];
  if (exact.replace(/\s/g, "") !== `\\dfrac{${num}}{${den}}`.replace(/\s/g, "")) lb.push(ligne(`=${exact}`, "on change les signes du numérateur et du dénominateur"));
  lb.push(...lignesApprox(ex.x));
  etapes.push(calcul("b", sansRepetition(lb)));
  etapes.push(resultat("b", [latex(egaliteX(rep(ex, "bEcran2")[0])), texte(", soit "), latex(ensemble([exact]))]));
  return etapes;
}

// ---------------------------------------------------------------------------- Famille C

function racinesEnT(ex: ExerciceEqLogC): number[] {
  const delta = ex.B * ex.B - 4 * ex.A * ex.Cc;
  const r = Math.sqrt(delta);
  return [(-ex.B - r) / (2 * ex.A), (-ex.B + r) / (2 * ex.A)].map((t) => (estEntier(t) ? Math.round(t) : t)).sort((a, c) => a - c);
}

function correctionC(ex: ExerciceEqLogC): EtapeCorrection[] {
  const b = formatBaseLatex(ex.base);
  const eqT = rep(ex, "cEcran1")[0];
  const etapes: EtapeCorrection[] = [];
  const termeT = (c: number, partie: string, premier: boolean) => {
    if (c === 0) return "";
    const abs = Math.abs(c);
    const corps = abs === 1 ? partie : `${abs}\\cdot ${partie}`;
    return c < 0 ? `-${corps}` : premier ? corps : `+${corps}`;
  };
  const depart = `${termeT(ex.A, `${b}^{2x}`, true)}${termeT(ex.B, `${b}^{x}`, false)}${ex.Cc === 0 ? "" : ex.Cc > 0 ? `+${ex.Cc}` : `-${-ex.Cc}`}=0`;
  const intermediaire = `${termeT(ex.A, `(${b}^{x})^{2}`, true)}${termeT(ex.B, `${b}^{x}`, false)}${ex.Cc === 0 ? "" : ex.Cc > 0 ? `+${ex.Cc}` : `-${-ex.Cc}`}=0`;
  etapes.push(utilise("a", [texte("Changement de variable : on pose "), latex(`t=${b}^{x}`), texte(", alors "), latex(`${b}^{2x}=\\left(${b}^{x}\\right)^{2}=t^{2}`), texte(` ${COURS_EQUATIONS}.`)]));
  etapes.push(
    calcul("a", [
      ligne(`${b}^{2x}=\\left(${b}^{x}\\right)^{2}`, justif("", { l: "a^{2x}=(a^{x})^{2}" })),
      ligne(`=t^{2}`, justif("on pose ", { l: `t=${b}^{x}` })),
      ligne(depart, "équation de départ"),
      ligne(intermediaire, justif("on écrit ", { l: `${b}^{2x}=\\left(${b}^{x}\\right)^{2}` })),
      ligne(eqT, justif("on remplace ", { l: `${b}^{x}` }, " par t")),
    ]),
  );
  etapes.push(resultat("a", [latex(eqT)]));
  // b)
  const racines = racinesEnT(ex);
  const poly = new Map([
    [2, q(ex.A)],
    [1, q(ex.B)],
    [0, q(ex.Cc)],
  ]);
  for (const [k, v] of [...poly]) if (v.n === 0) poly.delete(k);
  const { lignes } = lignesTrinome(poly, "t");
  etapes.push(utilise("b", [texte("Équation du second degré en t : discriminant et formule "), latex("\\dfrac{-b\\pm\\sqrt{\\Delta}}{2a}"), texte(" ; puis on ne garde que les t strictement positifs, car "), latex(`t=${b}^{x}>0`), texte(" pour tout réel x.")]));
  const tri: LigneCalcul[] = racines.map((t, i) => (t > 0 ? ligne(`t_${i + 1}=${nb(t)}>0`, "convient") : ligne(`t_${i + 1}=${nb(t)}\\leq 0`, justif("rejeté : ", { l: `${b}^{x}>0` }))));
  etapes.push(calcul("b", [...lignes, ...tri]));
  etapes.push(resultat("b", ex.tValides.length === 0 ? [texte("Aucune valeur de t ne convient : "), latex("S=\\varnothing")] : ex.tValides.flatMap((t, i) => [...(i ? [texte(" ou ")] : []), latex(`t=${nb(t)}`)])));
  if (racines.some((t) => t <= 0)) etapes.push(piege("b", [texte("Une racine "), latex("t\\le 0"), texte(" ne donne aucune solution : "), latex(`${b}^{x}`), texte(" n'est jamais négatif ni nul.")]));
  // c)
  etapes.push(utilise("c", [latex(`${b}^{x}=t\\iff x=${logBase(ex.base)}(t)`), texte(Math.abs(ex.base - Math.E) < 1e-9 ? ` (t > 0) ${COURS_EQUATIONS}.` : ` (t > 0), et `), ...(Math.abs(ex.base - Math.E) < 1e-9 ? [] : [latex(`${logBase(ex.base)}(t)=\\dfrac{\\ln(t)}{\\ln(${b})}`), texte(` ${COURS_EQUATIONS}.`)])]));
  const lc: LigneCalcul[] = [];
  if (ex.tValides.length === 0) lc.push(ligne("S=\\varnothing", "aucune valeur de t strictement positive à l'étape 2"));
  ex.tValides.forEach((t, i) => {
    const xe = xExactC(ex, t);
    const nom = ex.tValides.length > 1 ? `x_${i + 1}` : "x";
    lc.push(ligne(`${b}^{${nom}}=${nb(t)}`, justif("", { l: `t=${nb(t)}` })));
    if (estEntier(Math.log(t) / Math.log(ex.base)) && /^-?\d+$/.test(xe)) {
      lc.push(ligne(`${b}^{${nom}}=${b}^{${xe}}`, justif("car ", { l: `${nb(t)}=${b}^{${xe}}` })));
      lc.push(ligne(`${nom}=${xe}`, "même base : on égale les exposants"));
    } else {
      lc.push(ligne(`${nom}=${logBase(ex.base)}(${nb(t)})`, `on prend le logarithme de base ${b}`));
      if (xe !== `${logBase(ex.base)}(${nb(t)})`) lc.push(ligne(`=${xe}`, "changement de base"));
      lc.push(...lignesApprox(ex.xValides[i]));
    }
  });
  etapes.push(calcul("c", lc));
  etapes.push(resultat("c", [latex(ensemble(ex.tValides.map((t) => xExactC(ex, t))))]));
  if (!racines.some((t) => t <= 0)) etapes.push(piege("a", [latex(`${b}^{2x}=t^{2}`), texte(", et non "), latex("2t"), texte(".")]));
  return etapes;
}

// ---------------------------------------------------------------------------- Famille D

function correctionD(ex: ExerciceEqLogD): EtapeCorrection[] {
  const L = logBase(ex.a);
  const xe = xExactD(ex);
  return [
    utilise("a", [texte(`L'argument d'un logarithme doit être strictement positif ${COURS_EQUATIONS}.`)]),
    calcul("a", [ligne("x>0", justif("argument de ", { l: `${L}(x)` }))]),
    resultat("a", [latex(`\\text{CE} : x\\in ${rep(ex, "dEcran1")[0]}`)]),
    utilise("b", [texte("Un logarithme et une exponentielle de même base se défont : "), latex(`${L}(x)=k\\iff x=${ex.a}^{k}`), texte(` ${COURS_EQUATIONS}.`)]),
    calcul(
      "b",
      sansRepetition([
        ligne(`${L}(x)=${ex.k}`, "équation de départ"),
        ligne(`x=${ex.a}^{${ex.k}}`, "on passe à la forme exponentielle"),
        ...(ex.k < 0 ? [ligne(`=\\dfrac{1}{${ex.a}^{${-ex.k}}}`, justif("", { l: `a^{-n}=\\dfrac{1}{a^{n}}` }))] : ex.k === 0 ? [] : []),
        ligne(`=${xe}`, ex.k === 0 ? justif("", { l: "a^{0}=1" }) : "on calcule la puissance"),
      ]),
    ),
    resultat("b", [latex(`x=${xe}`), texte(", qui est dans la CE : "), latex(ensemble([xe]))]),
    verification("b", [], [ligne(`${L}\\left(${xe}\\right)=${L}\\left(${ex.a}^{${ex.k}}\\right)`, justif("", { l: `${xe}=${ex.a}^{${ex.k}}` })), ligne(`=${ex.k}`, "on retrouve le second membre")]),
    piege("b", ex.k < 0 ? [latex(`${ex.a}^{-n}=\\dfrac{1}{${ex.a}^{n}}`), texte(", jamais un nombre négatif.")] : ex.k === 0 ? [latex(`${ex.a}^{0}=1`), texte(", pas 0.")] : [latex(`x=${ex.a}^{${ex.k}}`), texte(", pas "), latex(`${ex.k}^{${ex.a}}`), texte(" ni "), latex(`${ex.a}\\cdot ${ex.k}`), texte(".")]),
  ];
}

// ---------------------------------------------------------------------------- Famille E

/** Condition « m x + n > 0 » résolue (bornes exactes). */
function lignesCondition(m: number, n: number): LigneCalcul[] {
  const seuil = frac(-n, m);
  const l = [ligne(`${affine(m, n)}>0`, "argument strictement positif")];
  if (n !== 0) l.push(ligne(`${affine(m, 0)}>${-n}`, n < 0 ? `on ajoute ${-n}` : `on soustrait ${n}`));
  if (m !== 1) l.push(ligne(`x${m > 0 ? ">" : "<"}${seuil}`, m > 0 ? `on divise par ${m}` : `on divise par ${m} : le sens change`));
  return l;
}

function correctionE(ex: ExerciceEqLogE): EtapeCorrection[] {
  const L = logBase(ex.base);
  const A = affine(1, -ex.p);
  const B = affine(1, -ex.q);
  const D = affine(ex.e, ex.d);
  const etapes: EtapeCorrection[] = [];
  etapes.push(utilise("a", [texte(`Chaque argument de chaque logarithme doit être strictement positif ; la CE est l'intersection des trois conditions ${COURS_EQUATIONS}.`)]));
  etapes.push(calcul("a", [...lignesCondition(1, -ex.p), ...lignesCondition(1, -ex.q), ...lignesCondition(ex.e, ex.d)]));
  etapes.push(resultat("a", [latex(`\\text{CE} : ${ceELatex(ex)}`)]));
  const eq2 = rep(ex, "eEcran2")[0];
  etapes.push(utilise("b", [texte("Somme de logarithmes de même base : "), latex(`${L}(A)+${L}(B)=${L}(A\\cdot B)`), texte(", puis deux logarithmes de même base sont égaux si et seulement si leurs arguments le sont "), texte(COURS_EQUATIONS), texte(".")]));
  etapes.push(
    calcul("b", [
      ligne(`${L}(${A})+${L}(${B})=${L}(${D})`, "équation de départ"),
      ligne(`${L}\\big((${A})(${B})\\big)=${L}(${D})`, "propriété du produit"),
      ligne(eq2, "même base : on égale les arguments"),
    ]),
  );
  etapes.push(resultat("b", [latex(eq2)]));
  if (ex.solutionsFinales.length === 2) etapes.push(piege("b", [latex(`${L}(A)+${L}(B)\\neq ${L}(A+B)`), texte(" : la somme de logarithmes devient le logarithme du produit.")]));
  // c)
  const S = ex.p + ex.q;
  const P = ex.p * ex.q;
  const reste = sommeTermes([
    [-S, "x"],
    [P, ""],
  ]);
  const developpe = `x^2${reste === "0" ? "" : reste.startsWith("-") ? reste : `+${reste}`}`;
  const poly = new Map([
    [2, q(1)],
    [1, q(-(ex.p + ex.q + ex.e))],
    [0, q(ex.p * ex.q - ex.d)],
  ]);
  for (const [k, v] of [...poly]) if (v.n === 0) poly.delete(k);
  const { lignes } = lignesTrinome(poly);
  const borne = (v: number) => (estEntier(v) ? String(Math.round(v)) : frac(-ex.d, ex.e));
  const tri: LigneCalcul[] = ex.racinesAlgebriques.map((r, i) => {
    const nom = `x_${i + 1}=${nb(r)}`;
    if (ex.solutionsFinales.includes(r)) return ligne(ex.ceSup === null ? `${nom}>${borne(ex.ceInf)}` : `${borne(ex.ceInf)}<${nb(r)}<${borne(ex.ceSup)}`, "dans la CE : convient");
    if (r <= ex.ceInf + 1e-9) return ligne(`${nom}\\leq ${borne(ex.ceInf)}`, "hors de la CE : rejetée");
    return ligne(`${nom}\\geq ${borne(ex.ceSup as number)}`, "hors de la CE : rejetée");
  });
  etapes.push(utilise("c", [texte("Équation du second degré : on développe, on ramène tout dans un membre, discriminant et formule "), latex("\\dfrac{-b\\pm\\sqrt{\\Delta}}{2a}"), texte(" ; puis chaque racine est confrontée à la CE de l'étape 1.")]));
  etapes.push(
    calcul("c", [
      ligne(eq2, "équation de l'étape 2"),
      ligne(`${developpe}=${D}`, "on développe"),
      ligne(`${polynomeELatex(ex)}=0`, "on ramène tout dans le membre de gauche"),
      ...lignes,
      ...tri,
    ]),
  );
  etapes.push(resultat("c", [latex(ensemble(ex.solutionsFinales.map((r) => nb(r))))]));
  if (ex.solutionsFinales.length < 2) etapes.push(piege("c", [texte("Une racine de l'équation du second degré n'est solution que si elle respecte la CE de l'équation de départ.")]));
  return etapes;
}

// ---------------------------------------------------------------------------- Famille G

function correctionG(ex: ExerciceEqLogG): EtapeCorrection[] {
  const L = logBase(ex.base);
  const simplifiee = rep(ex, "gEcran1")[0];
  const etapes: EtapeCorrection[] = [];
  if (ex.type === "violationCE") {
    const u1 = formatAffineLatex(ex.m1, ex.n1);
    const u2 = formatAffineLatex(ex.m2, ex.n2);
    const x0 = (ex.n2 - ex.n1) / (ex.m1 - ex.m2);
    const v = ex.m1 * x0 + ex.n1;
    etapes.push(utilise("a", [texte(`Deux logarithmes de même base sont égaux si et seulement si leurs arguments le sont ${COURS_EQUATIONS}.`)]));
    etapes.push(calcul("a", [ligne(`${L}(${u1})=${L}(${u2})`, "équation de départ"), ligne(simplifiee, "même base : on égale les arguments")]));
    etapes.push(resultat("a", [latex(simplifiee)]));
    const dm = ex.m1 - ex.m2;
    const dn = ex.n2 - ex.n1;
    etapes.push(utilise("b", [texte("On résout l'équation obtenue, puis on vérifie que la valeur trouvée rend les arguments strictement positifs (CE de l'équation de départ).")]));
    etapes.push(
      calcul(
        "b",
        sansRepetition([
          ligne(simplifiee, "équation de l'étape 1"),
          ligne(`${affine(dm, 0)}=${dn}`, "termes en x à gauche, constantes à droite"),
          ligne(`x=${nb(x0)}`, dm === 1 ? "valeur candidate" : `on divise par ${dm}`),
          ligne(`${ex.m1 === 1 ? "" : ex.m1 === -1 ? "-" : `${ex.m1}\\cdot `}${parN(x0)}${ex.n1 === 0 ? "" : ex.n1 > 0 ? `+${ex.n1}` : `-${-ex.n1}`}=${nb(v)}`, justif("premier argument en ", { l: `x=${nb(x0)}` })),
          ligne(`${nb(v)}\\leq 0`, "argument non strictement positif : la CE n'est pas respectée"),
        ]),
      ),
    );
    etapes.push(resultat("b", [latex("S=\\varnothing"), texte(" : la seule valeur trouvée viole la CE.")]));
    etapes.push(piege("b", [texte("La valeur trouvée en égalant les arguments n'est qu'une candidate : sans test de la CE, on conclurait à tort "), latex(`S=\\{${nb(x0)}\\}`), texte(".")]));
    return etapes;
  }
  if (ex.type === "identite") {
    const u1 = formatAffineLatex(ex.m1, ex.n1);
    const u2 = formatAffineLatex(ex.m2, ex.n2);
    const produit = `(${u1})(${u2})`;
    etapes.push(utilise("a", [texte("Propriété du produit au membre de gauche : "), latex(`${L}(A)+${L}(B)=${L}(A\\cdot B)`), texte(", puis on égale les arguments "), texte(COURS_EQUATIONS), texte(".")]));
    etapes.push(
      calcul("a", [
        ligne(`${L}(${u1})+${L}(${u2})=${L}\\big(${produit}\\big)`, "équation de départ"),
        ligne(`${L}\\big(${produit}\\big)=${L}\\big(${produit}\\big)`, "propriété du produit"),
        ligne(`${produit}=${produit}`, "même base : on égale les arguments"),
        ligne("0=0", "on soustrait le membre de droite"),
      ]),
    );
    etapes.push(resultat("a", [latex(simplifiee)]));
    etapes.push(utilise("b", [texte("L'égalité ne dépend plus de x : elle est vraie partout où l'équation a un sens, c'est-à-dire sur la CE (chaque argument strictement positif).")]));
    etapes.push(calcul("b", [...lignesCondition(ex.m1, ex.n1), ...lignesCondition(ex.m2, ex.n2)]));
    etapes.push(resultat("b", [latex(`S=\\left\\{x\\in\\mathbb{R} \\mid ${ceIdentiteLatex(ex)}\\right\\}`), texte(" : vrai pour tout x de la CE.")]));
    etapes.push(piege("b", [texte("« Vrai pour tout x » ne veut pas dire "), latex("S=\\mathbb{R}"), texte(" : seulement les x de la CE.")]));
    return etapes;
  }
  etapes.push(utilise("a", [texte(`Même base des deux côtés : deux logarithmes de même base sont égaux si et seulement si leurs arguments le sont ${COURS_EQUATIONS}.`)]));
  etapes.push(calcul("a", [ligne(`${L}(x^{2}+${ex.b0})=${L}(${ex.c0})`, "équation de départ"), ligne(`x^{2}+${ex.b0}=${ex.c0}`, "même base : on égale les arguments"), ligne(simplifiee, `on soustrait ${ex.b0}`)]));
  etapes.push(resultat("a", [latex(simplifiee)]));
  etapes.push(utilise("b", [texte("Un carré n'est jamais négatif ; la CE "), latex(`x^{2}+${ex.b0}>0`), texte(" est vraie pour tout réel x (elle n'exclut rien).")]));
  etapes.push(calcul("b", [ligne(`x^{2}=${ex.c0 - ex.b0}<0`, "second membre négatif"), ligne("x^{2}\\geq 0", "pour tout réel x : aucune solution")]));
  etapes.push(resultat("b", [latex("S=\\varnothing"), texte(" (un carré ne peut pas être négatif).")]));
  etapes.push(piege("b", [texte("Écrire "), latex(`x=\\pm\\sqrt{${ex.c0 - ex.b0}}`), texte(" n'a pas de sens : la racine carrée d'un nombre négatif n'existe pas.")]));
  return etapes;
}

/** Ordre des étapes : lettres groupées (le piège d'une étape reste dans son étape). */
function ordonner(etapes: EtapeCorrection[]): EtapeCorrection[] {
  return [...etapes].sort((a, b) => (a.sousQuestion ?? "").localeCompare(b.sousQuestion ?? ""));
}

export function correctionDetailleeEquationsExpLog(exercice: ExerciceEquationsExpLog): EtapeCorrection[] {
  switch (exercice.famille) {
    case "A":
      return finaliserCorrige(ordonner(correctionA(exercice)));
    case "B":
      return finaliserCorrige(ordonner(correctionB(exercice)));
    case "C":
      return finaliserCorrige(ordonner(correctionC(exercice)));
    case "D":
      return finaliserCorrige(ordonner(correctionD(exercice)));
    case "E":
      return finaliserCorrige(ordonner(correctionE(exercice)));
    case "G":
      return finaliserCorrige(ordonner(correctionG(exercice)));
  }
}

export type { FragmentConsigne };
