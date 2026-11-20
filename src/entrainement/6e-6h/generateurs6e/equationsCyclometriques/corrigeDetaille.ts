import type { ArgumentLineaire, ExerciceArcfonctionsDifferentes, ExerciceEquationsCyclometriques } from "../../core6e/equationsCyclometriques.types";
import type { EtapeCorrection, FragmentConsigne, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import { PHASE_INITIALE, phaseApres, type PhaseEquationsCyclometriques } from "../../moteur6e/typesEquationsCyclometriques";
import { formatEquationNonCycloLatex, formatLineaireLatex, formatQuadratiqueLatex, valeurTrigDepuisAngle } from "../../ui6e/formatEquationsCyclometriques";
import { type Poly, type Q, lignesTrinome, polyL, polyMul, polySub, q, qAdd, qDepuis, qDiv, qL, qMul, qNeg, qP, qSub, qTerme, qVal, substituer } from "../../ui6e/corrigeIntegrales1";
import { COURS_CYCLO, COURS_EQUATIONS, IMAGE_ARC, NOM_ARC, NOM_TRIG_DE_ARC, appartientEnsemble, ensembleL, finaliser, justif, ligne, lignesPropres } from "../../ui6e/corrigeReciproques";

/**
 * Corrigé détaillé « comme au tableau » de `6gen3` (équations cyclométriques) — règle
 * `.claude/rules/feuilles-evaluations.md`. SOURCE UNIQUE : adaptateur papier ET appli
 * (`App6gen3.tsx`). Une lettre par ÉCRAN, séquence du moteur (`PHASE_INITIALE` → `phaseApres`) :
 * CE, [condition (variante 4)], équation sans arcfonction, solutions, [accepter / rejeter].
 * Tous les nombres sont calculés en RATIONNELS exacts depuis les coefficients de l'instance.
 */

type E = ExerciceEquationsCyclometriques;
type Fragments = FragmentConsigne[];

const LETTRES = "abcdefghij";

export function sequenceEquationsCyclometriques(e: E): PhaseEquationsCyclometriques[] {
  const phases: PhaseEquationsCyclometriques[] = [];
  let p: PhaseEquationsCyclometriques | "termine" = PHASE_INITIALE;
  while (p !== "termine") {
    phases.push(p);
    p = phaseApres(p, e);
  }
  return phases;
}

/** Consignes des écrans (titres « Étape n — … » sur papier, mêmes phrases qu'à l'écran). */
export const CONSIGNES_ECRANS: Record<PhaseEquationsCyclometriques, string> = {
  ce: "Établis la condition d'existence (CE) de cette équation, sous la forme d'un intervalle pour x.",
  condition: "Établis la condition supplémentaire qui rend compatibles les images des deux arcfonctions, sous la forme d'un intervalle pour x.",
  equation: "Écris l'équation obtenue après avoir éliminé toutes les arcfonctions.",
  solutions: "Cette équation a-t-elle des solutions ? Si oui, donne-les toutes (sans encore tenir compte de la CE).",
  acceptRejet: "Pour chaque solution trouvée à l'étape précédente, accepte-la ou rejette-la.",
};

function Qx(v: number): Q {
  const r = qDepuis(v);
  if (!r) throw new Error(`Qx : ${v} n'est pas rationnel`);
  return r;
}

function lin(arg: ArgumentLineaire): string {
  return formatLineaireLatex(arg);
}

/** « 3x », « -\dfrac{2x}{5} », « x » : terme en x de coefficient rationnel. */
function monoX(a: Q): string {
  return polyL(new Map([[1, a]]));
}

/** Polynôme a·x + b. */
function polyLin(arg: ArgumentLineaire): Poly {
  const p: Poly = new Map();
  const a = Qx(arg.a);
  const b = Qx(arg.b);
  if (a.n !== 0) p.set(1, a);
  if (b.n !== 0) p.set(0, b);
  return p;
}

function opB(b: Q): string {
  return b.n > 0 ? "on soustrait " : "on ajoute ";
}

function justifOp(b: Q): Fragments {
  return justif(opB(b), { l: qL(b.n > 0 ? b : qNeg(b)) });
}

/** −1 ≤ a·x + b ≤ 1 résolu ligne à ligne → [lo ; hi]. */
function lignesEncadrement(arg: ArgumentLineaire): LigneCalcul[] {
  const a = Qx(arg.a);
  const b = Qx(arg.b);
  const l: LigneCalcul[] = [ligne(`-1\\leq ${lin(arg)}\\leq 1`, "domaine de l'arcfonction")];
  const g = qSub(q(-1), b);
  const d = qSub(q(1), b);
  if (b.n !== 0) l.push(ligne(`${qL(g)}\\leq ${monoX(a)}\\leq ${qL(d)}`, justifOp(b)));
  if (!(a.n === 1 && a.d === 1)) {
    const x1 = qDiv(g, a);
    const x2 = qDiv(d, a);
    const neg = a.n < 0;
    l.push(ligne(`${qL(neg ? x2 : x1)}\\leq x\\leq ${qL(neg ? x1 : x2)}`, neg ? justif("on divise par ", { l: qL(a) }, " < 0 : les inégalités changent de sens") : justif("on divise par ", { l: qL(a) })));
  }
  return lignesPropres(l);
}

/** a·x + b ≥ 0 (> 0 si `strict`) résolu ligne à ligne. */
function lignesSigne(arg: ArgumentLineaire, strict: boolean): LigneCalcul[] {
  const a = Qx(arg.a);
  const b = Qx(arg.b);
  const rel = strict ? ">" : "\\geq ";
  const inv = strict ? "<" : "\\leq ";
  const l: LigneCalcul[] = [ligne(`${lin(arg)}${rel}0`)];
  if (b.n !== 0) l.push(ligne(`${monoX(a)}${rel}${qL(qNeg(b))}`, justifOp(b)));
  if (!(a.n === 1 && a.d === 1)) {
    const s = qDiv(qNeg(b), a);
    l.push(ligne(`x${a.n < 0 ? inv : rel}${qL(s)}`, a.n < 0 ? justif("on divise par ", { l: qL(a) }, " < 0 : le sens change") : justif("on divise par ", { l: qL(a) })));
  }
  return lignesPropres(l);
}

// ============================================================================
// Étape « ce ».
// ============================================================================

function etapeCE(e: E, sq: string): EtapeCorrection[] {
  const res = resultat(sq, [latex(`\\text{CE}=${ensembleL(e.ce)}`)]);
  if (e.variante === "angleLineaire" || e.variante === "angleQuadratique" || e.variante === "memeArcfonction") {
    if (e.arcfonction === "arctan") {
      return [
        utilise(sq, [texte(`arctan est définie sur ℝ : aucune condition sur son argument ${COURS_CYCLO}.`)]),
        calcul(sq, [ligne("\\text{CE}=\\mathbb{R}", "arctan est définie pour tout réel")]),
        res,
      ];
    }
  }
  const ut = (detail: Fragments): EtapeCorrection => utilise(sq, [texte("arcsin et arccos ne sont définies que sur "), latex("[-1\\,;\\,1]"), texte(" : chaque argument doit y rester"), ...detail, texte(` ${COURS_EQUATIONS}.`)]);
  switch (e.variante) {
    case "angleLineaire":
      return [ut([]), calcul(sq, lignesEncadrement(e.arg)), res];
    case "memeArcfonction": {
      return [
        ut([texte(" ; la CE est l'intersection des deux conditions")]),
        calcul(sq, lignesEncadrement(e.arg1), [], "Premier argument"),
        calcul(sq, lignesEncadrement(e.arg2), [], "Second argument"),
        calcul(sq, [ligne(`\\text{CE}=${ensembleL(e.ce)}`, "partie commune des deux intervalles")], [], "Intersection"),
        res,
      ];
    }
    case "angleQuadratique": {
      const { a, b } = e.arg;
      const h = -b / (2 * a);
      const A = Math.abs(a);
      const R = Qx(1 / Math.sqrt(A));
      const hQ = Qx(h);
      const carre = `\\left(${polyL(new Map([[1, q(1)], [0, qNeg(hQ)]]))}\\right)^{2}`;
      const coef = a === 1 ? "" : a === -1 ? "-" : `${a}`;
      const l: LigneCalcul[] = [
        ligne(`-1\\leq ${formatQuadratiqueLatex(e.arg)}\\leq 1`, "domaine de l'arcfonction"),
        ligne(`-1\\leq ${coef}${carre}\\leq 1`, justif("on factorise : ", { l: `${formatQuadratiqueLatex(e.arg)}=${coef}${carre}` })),
      ];
      if (a > 0) l.push(ligne(`${coef}${carre}\\leq 1`, "le membre est positif : seule la borne 1 compte"));
      else l.push(ligne(`${coef}${carre}\\geq -1`, "le membre est négatif : seule la borne −1 compte"));
      if (A !== 1) l.push(ligne(`${carre}\\leq ${qL(q(1, A))}`, a > 0 ? `on divise par ${a}` : `on divise par ${a} < 0 : le sens change`));
      else if (a < 0) l.push(ligne(`${carre}\\leq 1`, "on multiplie par −1 : le sens change"));
      l.push(ligne(`${qL(qNeg(R))}\\leq ${polyL(new Map([[1, q(1)], [0, qNeg(hQ)]]))}\\leq ${qL(R)}`, justif("racine carrée : ", { l: `${qP(R)}^{2}=${qL(q(1, A))}` })));
      l.push(ligne(`${qL(qSub(hQ, R))}\\leq x\\leq ${qL(qAdd(hQ, R))}`, hQ.n > 0 ? justif("on ajoute ", { l: qL(hQ) }) : justif("on soustrait ", { l: qL(qNeg(hQ)) })));
      return [ut([]), calcul(sq, lignesPropres(l)), res];
    }
    case "arcfonctionsDifferentes": {
      if (e.sousCas === "asin_acos") {
        return [
          ut([texte(" ; la CE est l'intersection des deux conditions")]),
          calcul(sq, lignesEncadrement(e.arg1), [], "Argument de arcsin"),
          calcul(sq, lignesEncadrement(e.arg2), [], "Argument de arccos"),
          calcul(sq, [ligne(`\\text{CE}=${ensembleL(e.ce)}`, "partie commune des deux intervalles")], [], "Intersection"),
          res,
        ];
      }
      if (e.sousCas === "asin_atan") return [ut([texte(" ; arctan est définie sur ℝ")]), calcul(sq, lignesEncadrement(e.arg1)), res];
      // acos_atan : −1 ≤ u ≤ 1 et u > 0 (arccos u doit être un angle de ]−π/2 ; π/2[)
      return [
        utilise(sq, [
          texte("arccos n'est définie que sur "),
          latex("[-1\\,;\\,1]"),
          texte(" ; de plus "),
          latex("\\arccos u"),
          texte(" doit être une valeur de arctan, donc un angle de "),
          latex(IMAGE_ARC.arctan),
          texte(" : "),
          latex("\\arccos u<\\dfrac{\\pi}{2}"),
          texte(", c'est-à-dire "),
          latex("u>0"),
          texte(` ${COURS_EQUATIONS}.`),
        ]),
        calcul(sq, lignesEncadrement(e.arg1), [], "Domaine de arccos"),
        calcul(sq, lignesSigne(e.arg1, true), [], "Argument strictement positif"),
        calcul(sq, [ligne(`\\text{CE}=${ensembleL(e.ce)}`, "partie commune")], [], "Intersection"),
        res,
      ];
    }
  }
}

// ============================================================================
// Étape « condition » (variante 4).
// ============================================================================

/** Coefficient m tel que v = m·u (sous-cas avec arctan). */
function mDe(e: ExerciceArcfonctionsDifferentes): Q {
  return Qx(e.arg2.a / e.arg1.a);
}

function etapeCondition(e: ExerciceArcfonctionsDifferentes, sq: string): EtapeCorrection[] {
  const res = resultat(sq, [latex(`x\\in ${ensembleL(e.conditionParasite)}`)]);
  const u = lin(e.arg1);
  const v = lin(e.arg2);
  if (e.sousCas === "asin_acos") {
    return [
      utilise(sq, [
        texte("arcsin u est un angle de "),
        latex(IMAGE_ARC.arcsin),
        texte(", arccos v un angle de "),
        latex(IMAGE_ARC.arccos),
        texte(" : s'ils sont égaux, l'angle est dans "),
        latex("\\left[0\\,;\\,\\dfrac{\\pi}{2}\\right]"),
        texte(", où le sinus (u) et le cosinus (v) sont positifs "),
        texte(`${COURS_EQUATIONS}.`),
      ]),
      calcul(sq, lignesSigne(e.arg1, false), [], "Argument de arcsin positif"),
      calcul(sq, lignesSigne(e.arg2, false), [], "Argument de arccos positif"),
      calcul(sq, [ligne(`x\\in ${ensembleL(e.conditionParasite)}`, "partie commune")], [], "Intersection"),
      res,
      piege(sq, [texte("La condition v ≥ 0 ne suffit pas : il faut aussi u ≥ 0, sinon arcsin u est négatif alors que arccos v ne l'est jamais.")]),
    ];
  }
  const m = mDe(e);
  if (e.sousCas === "asin_atan") {
    const lignes: LigneCalcul[] = [ligne(`${v}=${qL(m)}\\left(${u}\\right)`, justif("on met ", { l: qL(m) }, " en évidence"))];
    if (m.n > 0) lignes.push(ligne("x\\in\\mathbb{R}", "un facteur positif : u et v ont toujours le même signe"));
    else lignes.push(ligne(`${u}=0`, "facteur négatif : u et v sont de signes contraires, sauf si u = 0"), ligne(`x=${qL(qNeg(Qx(e.arg1.b)))}`, justifOp(Qx(e.arg1.b))));
    return [
      utilise(sq, [
        texte("arctan v est un angle de "),
        latex(IMAGE_ARC.arctan),
        texte(" ; sur cet intervalle, sinus et tangente ont le signe de l'angle : u et v doivent avoir le même signe "),
        texte(`${COURS_EQUATIONS}.`),
      ]),
      calcul(sq, lignesPropres(lignes)),
      res,
      ...(m.n < 0 ? [piege(sq, [texte("La condition se réduit à un seul point : les autres racines trouvées plus loin seront parasites.")])] : []),
    ];
  }
  return [
    utilise(sq, [
      texte("arccos u est un angle de "),
      latex("\\left]0\\,;\\,\\dfrac{\\pi}{2}\\right]"),
      texte(" (CE : u > 0) ; arctan v doit valoir cet angle, positif ou nul : v ≥ 0 "),
      texte(`${COURS_EQUATIONS}.`),
    ]),
    calcul(sq, lignesSigne(e.arg2, false), [], "Argument de arctan positif"),
    res,
    piege(sq, [texte("La condition u > 0 est déjà dans la CE : celle qui reste porte sur l'argument de arctan.")]),
  ];
}

// ============================================================================
// Étape « equation ».
// ============================================================================

function etapeEquation(e: E, sq: string): EtapeCorrection[] {
  const res = resultat(sq, [latex(formatEquationNonCycloLatex(e))]);
  switch (e.variante) {
    case "angleLineaire":
    case "angleQuadratique": {
      const trig = NOM_TRIG_DE_ARC[e.arcfonction];
      const arg = e.variante === "angleLineaire" ? lin(e.arg) : formatQuadratiqueLatex(e.arg);
      const T = valeurTrigDepuisAngle(e.arcfonction, e.angle);
      return [
        utilise(sq, [texte("On applique la fonction trigonométrique aux deux membres : "), latex(`${trig}\\left(${NOM_ARC[e.arcfonction]}\\,u\\right)=u`), texte(` pour u dans le domaine ${COURS_EQUATIONS}.`)]),
        calcul(sq, [
          ligne(`${trig}\\left(${NOM_ARC[e.arcfonction]}\\left(${arg}\\right)\\right)=${trig}\\left(${e.angle.latex}\\right)`, justif("on applique ", { l: trig }, " aux deux membres")),
          ligne(`${arg}=${trig}\\left(${e.angle.latex}\\right)`, justif({ l: `${trig}\\left(${NOM_ARC[e.arcfonction]}\\,u\\right)=u` })),
          ligne(`${arg}=${T}`, "valeur remarquable"),
        ]),
        res,
        piege(sq, [texte("L'angle "), latex(e.angle.latex), texte(" est bien dans "), latex(IMAGE_ARC[e.arcfonction]), texte(" : sinon l'équation n'aurait aucune solution.")]),
      ];
    }
    case "memeArcfonction":
      return [
        utilise(sq, [latex(NOM_ARC[e.arcfonction]), texte(` est injective : deux images égales ont le même antécédent ${COURS_EQUATIONS}.`)]),
        calcul(sq, [ligne(`${lin(e.arg1)}=${lin(e.arg2)}`, justif({ l: `${NOM_ARC[e.arcfonction]}\\,u=${NOM_ARC[e.arcfonction]}\\,v\\Rightarrow u=v` }))]),
        res,
      ];
    case "arcfonctionsDifferentes": {
      const u = lin(e.arg1);
      const v = lin(e.arg2);
      const U = `\\left(${u}\\right)^{2}`;
      const V = `\\left(${v}\\right)^{2}`;
      if (e.sousCas === "asin_acos")
        return [
          utilise(sq, [texte("On applique cos aux deux membres, avec "), latex("\\cos(\\arcsin u)=\\sqrt{1-u^{2}}"), texte(" et "), latex("\\cos(\\arccos v)=v"), texte(`, puis on élève au carré ${COURS_EQUATIONS}.`)]),
          calcul(sq, [
            ligne(`\\sqrt{1-${U}}=${v}`, justif("on applique cos aux deux membres")),
            ligne(`1-${U}=${V}`, "on élève au carré"),
            ligne(`${V}=1-${U}`, "on échange les membres"),
          ]),
          res,
          piege(sq, [texte("Élever au carré peut ajouter des solutions : la condition de l'étape b les écartera.")]),
        ];
      if (e.sousCas === "asin_atan")
        return [
          utilise(sq, [texte("On applique tan aux deux membres, avec "), latex("\\tan(\\arcsin u)=\\dfrac{u}{\\sqrt{1-u^{2}}}"), texte(" et "), latex("\\tan(\\arctan v)=v"), texte(`, puis on élève au carré ${COURS_EQUATIONS}.`)]),
          calcul(sq, [
            ligne(`\\dfrac{${u}}{\\sqrt{1-${U}}}=${v}`, justif("on applique tan aux deux membres")),
            ligne(`\\dfrac{${U}}{1-${U}}=${V}`, "on élève au carré"),
            ligne(`${U}=${V}\\left(1-${U}\\right)`, "produit en croix"),
            ligne(`${V}\\left(1-${U}\\right)=${U}`, "on échange les membres"),
          ]),
          res,
          piege(sq, [texte("Élever au carré peut ajouter des solutions : la condition de l'étape b les écartera.")]),
        ];
      return [
        utilise(sq, [texte("On applique tan aux deux membres, avec "), latex("\\tan(\\arccos u)=\\dfrac{\\sqrt{1-u^{2}}}{u}"), texte(" et "), latex("\\tan(\\arctan v)=v"), texte(`, puis on élève au carré ${COURS_EQUATIONS}.`)]),
        calcul(sq, [
          ligne(`\\dfrac{\\sqrt{1-${U}}}{${u}}=${v}`, justif("on applique tan aux deux membres")),
          ligne(`\\dfrac{1-${U}}{${U}}=${V}`, "on élève au carré"),
          ligne(`1-${U}=${U}${V}`, "produit en croix"),
          ligne(`${U}+${U}${V}=1`, "on regroupe"),
          ligne(`${U}\\left(1+${V}\\right)=1`, "on met le carré de u en évidence"),
        ]),
        res,
        piege(sq, [texte("Élever au carré peut ajouter des solutions : la CE et la condition de l'étape b les écarteront.")]),
      ];
    }
  }
}

// ============================================================================
// Étape « solutions ».
// ============================================================================

function listeSolutions(xs: Q[]): string {
  return xs.length === 0 ? "\\varnothing" : `\\left\\{${xs.map((x) => qL(x)).join("\\,;\\,")}\\right\\}`;
}

function etapeSolutions(e: E, sq: string): EtapeCorrection[] {
  const cands = e.candidats.map((c) => Qx(c.x));
  const res = resultat(
    sq,
    cands.length === 0 ? [texte("Aucune solution réelle.")] : [texte(cands.length === 1 ? "Une solution : " : `${cands.length === 2 ? "Deux" : "Trois"} solutions : `), ...cands.flatMap((x, i) => [...(i ? [texte(" ; ")] : []), latex(`x=${qL(x)}`)]), texte(".")],
  );
  switch (e.variante) {
    case "angleLineaire":
    case "memeArcfonction": {
      const a = e.variante === "angleLineaire" ? Qx(e.arg.a) : qSub(Qx(e.arg1.a), Qx(e.arg2.a));
      const droite = e.variante === "angleLineaire" ? qSub(Qx(Number(valeurNum(e))), Qx(e.arg.b)) : qSub(Qx(e.arg2.b), Qx(e.arg1.b));
      const depart = formatEquationNonCycloLatex(e);
      const l: LigneCalcul[] = [ligne(depart), ligne(`${monoX(a)}=${qL(droite)}`, e.variante === "angleLineaire" ? justifOp(Qx(e.arg.b)) : "on regroupe les termes en x d'un côté, les nombres de l'autre")];
      if (!(a.n === 1 && a.d === 1)) l.push(ligne(`x=${qL(qDiv(droite, a))}`, justif("on divise par ", { l: qL(a) })));
      return [utilise(sq, [texte(`Équation du premier degré : on isole x ${COURS_EQUATIONS}.`)]), calcul(sq, lignesPropres(l)), res];
    }
    case "angleQuadratique": {
      const { a, b } = e.arg;
      const h = Qx(-b / (2 * a));
      const T = Qx(Number(valeurNum(e)));
      const carre = `\\left(${polyL(new Map([[1, q(1)], [0, qNeg(h)]]))}\\right)^{2}`;
      const coef = a === 1 ? "" : a === -1 ? "-" : `${a}`;
      const k = qDiv(T, q(a));
      const l: LigneCalcul[] = [ligne(formatEquationNonCycloLatex(e)), ligne(`${coef}${carre}=${qL(T)}`, "même factorisation que pour la CE")];
      if (a !== 1) l.push(ligne(`${carre}=${qL(k)}`, `on divise par ${a}`));
      if (k.n < 0) {
        return [
          utilise(sq, [texte(`On isole le carré : un carré n'est jamais négatif ${COURS_EQUATIONS}.`)]),
          calcul(sq, lignesPropres(l)),
          res,
          piege(sq, [texte("Le second membre est négatif : l'équation n'a aucune solution, inutile de chercher plus loin.")]),
        ];
      }
      if (k.n === 0) l.push(ligne(`${polyL(new Map([[1, q(1)], [0, qNeg(h)]]))}=0`, "un carré est nul si et seulement si le nombre est nul"), ligne(`x=${qL(h)}`, "on isole x"));
      else {
        const r = Qx(Math.sqrt(qVal(k)));
        const xh = polyL(new Map([[1, q(1)], [0, qNeg(h)]]));
        l.push(ligne(`${xh}=${qL(qNeg(r))}`, "première racine carrée (négative)"));
        l.push(ligne(`x_{1}=${qL(qSub(h, r))}`, "on isole x"));
        l.push(ligne(`${xh}=${qL(r)}`, "seconde racine carrée (positive)"));
        l.push(ligne(`x_{2}=${qL(qAdd(h, r))}`, "on isole x"));
      }
      return [utilise(sq, [texte(`On isole le carré, puis on prend les deux racines carrées opposées ${COURS_EQUATIONS}.`)]), calcul(sq, lignesPropres(l)), res];
    }
    case "arcfonctionsDifferentes":
      return etapeSolutionsV4(e, sq, res);
  }
}

function valeurNum(e: Extract<E, { variante: "angleLineaire" | "angleQuadratique" }>): number {
  const L = valeurTrigDepuisAngle(e.arcfonction, e.angle);
  return L === "-1" ? -1 : L === "1" ? 1 : 0;
}

function etapeSolutionsV4(e: ExerciceArcfonctionsDifferentes, sq: string, res: EtapeCorrection): EtapeCorrection[] {
  if (e.sousCas === "asin_acos") {
    const U = polyLin(e.arg1);
    const V = polyLin(e.arg2);
    const U2 = polyMul(U, U);
    const V2 = polyMul(V, V);
    const P = polySub(polyAdd(U2, V2), new Map([[0, q(1)]]));
    // dénominateur commun : coefficients entiers
    // coefficients entiers premiers entre eux : on multiplie par ppcm(dénominateurs) / pgcd(numérateurs)
    const den = [...P.values()].reduce((m, c) => ppcm(m, c.d), 1);
    const g = [...P.values()].reduce((m, c) => pgcd(m, (c.n * den) / c.d), 0);
    const facteur = q(den, g);
    const Pk: Poly = new Map([...P].map(([n, c]) => [n, qMul(c, facteur)] as [number, Q]));
    const l: LigneCalcul[] = [
      ligne(formatEquationNonCycloLatex(e)),
      ligne(`${polyL(V2)}=1-\\left(${polyL(U2)}\\right)`, "on développe les deux carrés"),
      ligne(`${polyL(P)}=0`, "on regroupe tout dans le premier membre"),
    ];
    if (!(facteur.n === 1 && facteur.d === 1)) l.push(ligne(`${polyL(Pk)}=0`, justif("on multiplie par ", { l: qL(facteur) })));
    const t = lignesTrinome(Pk);
    l.push(...t.lignes);
    return [utilise(sq, [texte(`Équation du second degré : on développe, on regroupe, puis discriminant ${COURS_EQUATIONS}.`)]), calcul(sq, lignesPropres(l)), res];
  }
  const m = mDe(e);
  const b = Qx(e.arg1.b);
  const tDef = polyL(new Map([[1, q(1)], ...(b.n !== 0 ? [[0, b] as [number, Q]] : [])]));
  const m2 = qMul(m, m);
  const xDepuisT = (t: Q) => qSub(t, b);
  if (e.sousCas === "asin_atan") {
    const s2 = qDiv(qSub(m2, q(1)), m2);
    const s = Qx(Math.sqrt(qVal(s2)));
    const l: LigneCalcul[] = [
      ligne(`${qL(m2)}\\,t^{2}\\left(1-t^{2}\\right)=t^{2}`, justif("on pose ", { l: `t=${tDef}` }, ", alors ", { l: `${lin(e.arg2)}=${qL(m)}\\,t` })),
      ligne(`t^{2}\\left[${qL(m2)}\\left(1-t^{2}\\right)-1\\right]=0`, justif("on met ", { l: "t^{2}" }, " en évidence")),
      ligne("t^{2}=0", "produit nul : premier facteur"),
      ligne("t=0", "racine double"),
      ligne(`${qL(m2)}\\left(1-t^{2}\\right)=1`, "produit nul : second facteur"),
      ligne(`1-t^{2}=${qL(qDiv(q(1), m2))}`, justif("on divise par ", { l: qL(m2) })),
      ligne(`t^{2}=${qL(s2)}`, "on isole le carré"),
      ligne(`t_{1}=-${qL(s)}`, "deux racines opposées"),
      ligne(`t_{2}=${qL(s)}`),
      ...[qNeg(s), q(0), s].flatMap((t, i) => [
        ligne(`x_{${i + 1}}=${qL(t)}${b.n === 0 ? "" : qTerme(qNeg(b))}`, i === 0 ? justif("on revient à x : ", { l: `x=t${b.n === 0 ? "" : qTerme(qNeg(b))}` }) : undefined),
        ligne(`=${qL(xDepuisT(t))}`),
      ]),
    ];
    return [utilise(sq, [texte(`On pose t égal à l'argument de arcsin pour se ramener à un produit nul ${COURS_EQUATIONS}.`)]), calcul(sq, lignesPropres(l)), res];
  }
  // acos_atan : t²(1 + m²t²) = 1 → m²T² + T − 1 = 0 avec T = t²
  // coefficients entiers : on multiplie par le dénominateur de m²
  const k = m2.d;
  const P: Poly = new Map([
    [2, q(m2.n)],
    [1, q(k)],
    [0, q(-k)],
  ]);
  const t = lignesTrinome(P, "T");
  const Tpos = t.racines.filter((r) => r.n > 0)[0];
  const Tneg = t.racines.filter((r) => r.n < 0)[0];
  const u0 = Qx(Math.sqrt(qVal(Tpos)));
  const l: LigneCalcul[] = [
    ligne(`t^{2}\\left(1+${qL(m2)}\\,t^{2}\\right)=1`, justif("on pose ", { l: `t=${tDef}` }, ", alors ", { l: `${lin(e.arg2)}=${qL(m)}\\,t` })),
    ligne(`${qL(m2)}\\,t^{4}+t^{2}-1=0`, "on distribue"),
    ligne(`${qL(m2)}\\,T^{2}+T-1=0`, justif("on pose ", { l: "T=t^{2}" })),
    ...(k !== 1 ? [ligne(`${polyL(P, "T")}=0`, `on multiplie par ${k}`)] : []),
    ...t.lignes,
    ...(Tneg ? [ligne(`${qL(Tneg)}<0`, justif("valeur rejetée : ", { l: "T=t^{2}" }, " n'est jamais négatif"))] : []),
    ligne(`t^{2}=${qL(Tpos)}`, "seule valeur possible"),
    ligne(`t_{1}=-${qL(u0)}`, "deux racines opposées"),
    ligne(`t_{2}=${qL(u0)}`),
    ligne(`x_{1}=${qL(qNeg(u0))}${b.n === 0 ? "" : qTerme(qNeg(b))}`, justif("on revient à x : ", { l: `x=t${b.n === 0 ? "" : qTerme(qNeg(b))}` })),
    ligne(`=${qL(xDepuisT(qNeg(u0)))}`),
    ligne(`x_{2}=${qL(u0)}${b.n === 0 ? "" : qTerme(qNeg(b))}`),
    ligne(`=${qL(xDepuisT(u0))}`),
  ];
  return [
    utilise(sq, [texte(`On pose t égal à l'argument de arccos, puis `), latex("T=t^{2}"), texte(` : équation bicarrée, ramenée au second degré ${COURS_EQUATIONS}.`)]),
    calcul(sq, lignesPropres(l)),
    res,
    piege(sq, [texte("La valeur négative de "), latex("T=t^{2}"), texte(" ne donne aucune solution : un carré n'est jamais négatif.")]),
  ];
}

function polyAdd(a: Poly, b: Poly): Poly {
  return polySub(a, new Map([...b].map(([n, c]) => [n, qNeg(c)] as [number, Q])));
}

function pgcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a || 1;
}

function ppcm(a: number, b: number): number {
  return (a / pgcd(a, b)) * b;
}

// ============================================================================
// Étape « acceptRejet ».
// ============================================================================

function etapeAcceptRejet(e: E, sq: string): EtapeCorrection[] {
  const v4 = e.variante === "arcfonctionsDifferentes";
  const lignes: LigneCalcul[] = [];
  for (const c of e.candidats) {
    const x = Qx(c.x);
    const dansCE = appartientEnsemble(c.x, e.ce);
    if (!dansCE) {
      lignes.push(ligne(`${qL(x)}\\notin ${ensembleL(e.ce)}`, "hors de la CE : rejetée"));
      continue;
    }
    if (!v4) {
      lignes.push(ligne(`${qL(x)}\\in ${ensembleL(e.ce)}`, "dans la CE : acceptée"));
      continue;
    }
    const ex = e as ExerciceArcfonctionsDifferentes;
    const uV = qAdd(qMul(Qx(ex.arg1.a), x), Qx(ex.arg1.b));
    const vV = qAdd(qMul(Qx(ex.arg2.a), x), Qx(ex.arg2.b));
    lignes.push(ligne(`${qL(x)}\\in ${ensembleL(e.ce)}`, "dans la CE"));
    lignes.push(ligne(`${substituer(lin(ex.arg1), qL(x))}=${qL(uV)}`, "valeur de u"));
    lignes.push(ligne(`${substituer(lin(ex.arg2), qL(x))}=${qL(vV)}`, "valeur de v"));
    const okCond = appartientEnsemble(c.x, ex.conditionParasite);
    lignes.push(ligne(`${qL(x)}${okCond ? "\\in" : "\\notin"} ${ensembleL(ex.conditionParasite)}`, okCond ? "la condition est vérifiée : acceptée" : "la condition n'est pas vérifiée : solution parasite, rejetée"));
  }
  const acceptes = e.candidats.filter((c) => c.accepteAttendu).map((c) => Qx(c.x));
  const res = resultat(sq, [latex(`S=${listeSolutions(acceptes)}`)]);
  const veri = acceptes.length > 0 ? verifEquation(e, acceptes[0]) : null;
  const pg: Fragments | null = v4
    ? [texte("Une racine de l'équation élevée au carré n'est pas forcément une solution : on la confronte à la CE ET à la condition de l'étape b.")]
    : acceptes.length < e.candidats.length
      ? [texte("La solution de l'équation sans arcfonction est hors de la CE : elle est rejetée, S est vide.")]
      : null;
  return [
    utilise(sq, [texte(v4 ? "Une solution est acceptée si elle vérifie la CE et la condition de l'étape b " : "Une solution est acceptée si elle vérifie la CE "), texte(`${COURS_EQUATIONS}.`)]),
    calcul(sq, lignes),
    res,
    ...(veri ? [veri] : []),
    ...(pg ? [piege(sq, pg)] : []),
  ];
}

/** Vérification : la solution acceptée remise dans l'équation de départ (valeurs numériques). */
function verifEquation(e: E, x: Q): EtapeCorrection | null {
  let g: string;
  let d: string;
  switch (e.variante) {
    case "angleLineaire":
      g = `${NOM_ARC[e.arcfonction]}\\left(${substituer(lin(e.arg), qL(x))}\\right)`;
      d = e.angle.latex;
      break;
    case "angleQuadratique":
      g = `${NOM_ARC[e.arcfonction]}\\left(${substituer(formatQuadratiqueLatex(e.arg), qL(x))}\\right)`;
      d = e.angle.latex;
      break;
    case "memeArcfonction":
      g = `${NOM_ARC[e.arcfonction]}\\left(${substituer(lin(e.arg1), qL(x))}\\right)`;
      d = `${NOM_ARC[e.arcfonction]}\\left(${substituer(lin(e.arg2), qL(x))}\\right)`;
      break;
    case "arcfonctionsDifferentes":
      return null;
  }
  return verification("", [texte("On remet "), latex(`x=${qL(x)}`), texte(" dans l'équation de départ :")], [ligne(`${g}=${d}`)]);
}

/** Corrigé complet, une lettre par écran. */
export function correctionDetailleeEquationsCyclometriques(e: E): EtapeCorrection[] {
  const seq = sequenceEquationsCyclometriques(e);
  const etapes: EtapeCorrection[] = [];
  seq.forEach((phase, i) => {
    const sq = LETTRES[i];
    let bloc: EtapeCorrection[];
    switch (phase) {
      case "ce":
        bloc = etapeCE(e, sq);
        break;
      case "condition":
        bloc = etapeCondition(e as ExerciceArcfonctionsDifferentes, sq);
        break;
      case "equation":
        bloc = etapeEquation(e, sq);
        break;
      case "solutions":
        bloc = etapeSolutions(e, sq);
        break;
      case "acceptRejet":
        bloc = etapeAcceptRejet(e, sq);
        break;
    }
    etapes.push(...bloc.map((x) => (x.sousQuestion === "" ? { ...x, sousQuestion: sq } : x)));
  });
  return finaliser(etapes);
}

/** Lettre de l'écran « ce » quand la CE est ℝ (arctan) : écran de pure lecture. */
export function lettresLectureEquations(e: E): string[] {
  return e.ce.forme === "reel" ? ["a"] : [];
}

/** Solutions acceptées (réponse de l'écran final), en LaTeX. */
export function ensembleSolutionsLatex(e: E): string {
  return `S=${listeSolutions(e.candidats.filter((c) => c.accepteAttendu).map((c) => Qx(c.x)))}`;
}
