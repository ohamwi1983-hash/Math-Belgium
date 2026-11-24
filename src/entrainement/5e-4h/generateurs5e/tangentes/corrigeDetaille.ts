import type { EtapeCorrection, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, ligne, piege, resultat, utilise, verification } from "../../../export/corrigeTableau";
import type { ExerciceTangente, ExerciceTangenteDoubleTangence, ExerciceTangenteHorizontale, ExerciceTangentePente, ExerciceTangentePointDonne, ExerciceTangentePointDonneRadicale, ExerciceTangentePointExterieur } from "../../core5e/tangentes.types";
import { ordreEcransTangente, type EcranTangente } from "../../moteur5e/typesTangentes";
import { conditionContactLatex, formatFDeXLatex, formatFPrimeDeXLatex, formatReponseAttenduePhaseLatex, pointPLatex } from "../../ui5e/formatTangentes";
import {
  COURS_DERIVEE,
  COURS_TANGENTES,
  dernierMembre,
  droiteEntiere,
  f,
  finaliser,
  jf,
  lignesDeriveePoly,
  lignesTangenteEntiere,
  lignesTrinomeUnitaireNul,
  lignesValeurPoly,
  liste,
  membresEgalite,
  nbT,
  par,
  pgcd,
  polyLatex,
  q,
  sansDoublons,
  somme,
  t,
  xMoins,
  type Q,
} from "../../ui5e/corrigeDerivees1";
import { coeffsTangente, deriveeFDoubleTangence, deriveeFPointDonne, deriveeFTangente, valeurFDoubleTangence, valeurFPointDonne, valeurFTangente } from "./index";

/**
 * Corrigé détaillé « comme au tableau » de 5gen28 (tangentes) — règle
 * `.claude/rules/feuilles-evaluations.md`. Étapes = « dérivée » (papier seulement, variantes A et B :
 * l'écran donne f′) puis les écrans (`ordreEcransTangente`). f(a), f′(a) substitués terme à terme ;
 * tangente y = f(a) + f′(a)(x − a) remplie, distribuée, réduite (radicale : dénominateur rendu rationnel) ;
 * tangente horizontale : f′(x) = 0 divisée par 3a, puis trinôme unitaire ; double tangence : f(x) − t(x)
 * factorisée par (x − p)², pente en q. Résultats = réponses de l'écran (`formatReponseAttenduePhaseLatex`).
 * SANS `docx` : importé par l'adaptateur ET par `App5gen28.tsx`.
 */

const LETTRES = "abcdefgh";

type EtapeTangente = EcranTangente;

/** Étapes du corrigé = écrans (lot C : l'écran « deriver » existe dès que f′ est à calculer ; f′
 * donnée → pas d'étape « dérivée »). */
export function etapesTangente(e: ExerciceTangente): EtapeTangente[] {
  return ordreEcransTangente(e);
}

export function lettreEtapeTangente(e: ExerciceTangente, etape: EtapeTangente): string {
  return LETTRES[etapesTangente(e).indexOf(etape)] ?? "a";
}

/** k·√r, k rationnel réduit : « \sqrt{5} », « -3\sqrt{5} », « \dfrac{3\sqrt{5}}{10} » (même écriture que l'écran). */
function multRacine(k: Q, r: number): string {
  if (k.n === 0) return "0";
  const signe = k.n < 0 ? "-" : "";
  const a = Math.abs(k.n);
  const num = `${a === 1 ? "" : a}\\sqrt{${r}}`;
  return k.d === 1 ? `${signe}${num}` : `${signe}\\dfrac{${num}}{${k.d}}`;
}

function plus(l: string): string {
  return l.startsWith("-") ? l : `+${l}`;
}

// ============================================================================
// Variante A — point donné.
// ============================================================================

function lignesDeriveeRadicale(e: ExerciceTangentePointDonneRadicale): LigneCalcul[] {
  const arg = dernierMembre(formatFDeXLatex(e)).replace(/^.*\\sqrt\{(.*)\}$/, "$1");
  const brut = e.coeff === 1 ? `\\dfrac{${e.m}}{2\\sqrt{${arg}}}` : e.coeff === -1 ? `-\\dfrac{${e.m}}{2\\sqrt{${arg}}}` : `${e.coeff}\\cdot\\dfrac{${e.m}}{2\\sqrt{${arg}}}`;
  return sansDoublons([
    ligne(`f'(x)=${brut}`, jf("règle de la chaîne ", { l: "(\\sqrt{u})'=\\frac{u'}{2\\sqrt{u}}" }, `, avec u′ = ${nbT(e.m)}`)),
    ligne(`=${dernierMembre(formatFPrimeDeXLatex(e))}`, "on simplifie"),
  ]);
}

function lignesSubstitutionRadicale(e: ExerciceTangentePointDonneRadicale): { fa: LigneCalcul[]; fpa: LigneCalcul[] } {
  const { coeff: c, m, p, a } = e;
  const r = m * a + p;
  const prod = m === 1 ? par(a) : m === -1 ? `-${par(a)}` : `${m}\\cdot ${par(a)}`;
  const sousRacine = somme([prod, `${p}`]);
  const coef = c === 1 ? "" : c === -1 ? "-" : `${c}`;
  const [faEcran, fpaEcran] = formatReponseAttenduePhaseLatex(e, "substituer");
  const fa = sansDoublons([ligne(`f(${a})=${coef}\\sqrt{${sousRacine}}`, `on remplace x par ${nbT(a)}`), ligne(`=${dernierMembre(faEcran)}`, "on calcule sous la racine")]);
  const brut = `\\dfrac{${c * m}}{2\\sqrt{${r}}}`.replace(/^\\dfrac\{-/, "-\\dfrac{");
  const fpa = sansDoublons([
    ligne(`f'(${a})=${brut}`, `on remplace x par ${nbT(a)} dans f′(x)`),
    ligne(`=${dernierMembre(fpaEcran)}`, pgcd(c * m, 2) > 1 ? "on simplifie par 2" : "on écrit la fraction"),
  ]);
  return { fa, fpa };
}

function lignesTangenteRadicale(e: ExerciceTangentePointDonneRadicale): LigneCalcul[] {
  const { coeff: c, m, a } = e;
  const r = m * a + e.p;
  const ecran = formatReponseAttenduePhaseLatex(e, "tangente")[0];
  const membres = membresEgalite(ecran);
  const lignes: LigneCalcul[] = [ligne(`y=${membres[1]}`, jf("on remplace ", { l: `f(${a})` }, " et ", { l: `f'(${a})` }))];
  if (a === 0) return lignes;
  // pente = c·m/(2√r) = (c·m/(2r))·√r ; f(a) = c√r.
  const pente = q(c * m, 2 * r);
  const fa = multRacine(q(c), r);
  lignes.push(ligne(`=${fa}${plus(`${multRacine(pente, r)}(${xMoins(a)})`)}`, jf("dénominateur rendu rationnel : ", { l: `\\frac{1}{\\sqrt{${r}}}=\\frac{\\sqrt{${r}}}{${r}}` })));
  const terme = q(-pente.n * a, pente.d);
  lignes.push(ligne(`=${multRacine(pente, r)}\\,x${plus(multRacine(terme, r))}${plus(fa)}`, "on distribue la pente"));
  lignes.push(ligne(`=${membres[membres.length - 1]}`, "on réduit au même dénominateur"));
  return sansDoublons(lignes);
}

function etapesPointDonne(e: ExerciceTangentePointDonne): EtapeCorrection[] {
  const L = (x: EtapeTangente) => lettreEtapeTangente(e, x);
  const a = e.a;
  const etapes: EtapeCorrection[] = [];
  const fPrime = formatFPrimeDeXLatex(e);
  // Dérivée (seulement si elle est à calculer).
  if (e.deriveeDonnee) {
    // f′ donnée : rien à dériver.
  } else if (e.sousFamille === "polynomiale") {
    etapes.push(
      utilise(L("deriver"), [t("Dérivée d'un polynôme : on dérive terme à terme avec "), f("(x^n)'=n\\,x^{n-1}"), t(`, une constante a pour dérivée 0 ${COURS_DERIVEE}.`)]),
      calcul(L("deriver"), lignesDeriveePoly("f'(x)", e.coeffs).lignes),
    );
  } else {
    etapes.push(utilise(L("deriver"), [t("Règle de la chaîne pour une racine : "), f("(\\sqrt{u})'=\\frac{u'}{2\\sqrt{u}}"), t(`, ici u est du premier degré ${COURS_DERIVEE}.`)]), calcul(L("deriver"), lignesDeriveeRadicale(e)));
  }
  if (!e.deriveeDonnee) etapes.push(resultat(L("deriver"), [f(fPrime)]));
  // f(a) et f'(a).
  const [faEcran, fpaEcran] = formatReponseAttenduePhaseLatex(e, "substituer");
  etapes.push(utilise(L("substituer"), [t(`f(${nbT(a)}) : on remplace x par ${nbT(a)} dans f(x) ; f′(${nbT(a)}) : dans f′(x) ${COURS_TANGENTES}.`)]));
  if (e.sousFamille === "polynomiale") {
    const derivee = e.coeffs.slice(1).map((c, i) => (i + 1) * c);
    etapes.push(calcul(L("substituer"), lignesValeurPoly(`f(${a})`, e.coeffs, q(a)).lignes, [], `f(${nbT(a)})`));
    etapes.push(calcul(L("substituer"), lignesValeurPoly(`f'(${a})`, derivee, q(a)).lignes, [], `f′(${nbT(a)})`));
  } else {
    const { fa, fpa } = lignesSubstitutionRadicale(e);
    etapes.push(calcul(L("substituer"), fa, [], `f(${nbT(a)})`), calcul(L("substituer"), fpa, [], `f′(${nbT(a)})`));
  }
  etapes.push(resultat(L("substituer"), [f(faEcran), t(" et "), f(fpaEcran)]));
  // Tangente.
  const tangente = formatReponseAttenduePhaseLatex(e, "tangente")[0];
  etapes.push(utilise(L("tangente"), [t("Équation de la tangente au point d'abscisse a : "), f("y=f(a)+f'(a)(x-a)"), t(`, puis on distribue et on réduit ${COURS_TANGENTES}.`)]));
  if (e.sousFamille === "polynomiale") {
    const fa = valeurFPointDonne(e, a);
    const fpa = deriveeFPointDonne(e, a);
    const m = fpa;
    const p0 = fa - fpa * a;
    etapes.push(calcul(L("tangente"), lignesTangenteEntiere(a, fa, fpa, dernierMembre(tangente))));
    etapes.push(resultat(L("tangente"), [t("T : "), f(tangente)]));
    etapes.push(
      verification(L("tangente"), [t(`La tangente passe par le point de contact (${nbT(a)} ; ${nbT(fa)}) :`)], [ligne(`${m === 0 ? `${p0}` : somme([m === 1 ? par(a) : m === -1 ? `-${par(a)}` : `${m}\\cdot ${par(a)}`, `${p0}`])}=${fa}`, `on remplace x par ${nbT(a)} dans l'équation de T`)]),
    );
  } else {
    etapes.push(calcul(L("tangente"), lignesTangenteRadicale(e)));
    etapes.push(resultat(L("tangente"), [t("T : "), f(`y=${dernierMembre(tangente)}`)]));
  }
  etapes.push(piege(L("tangente"), [t("La pente de la tangente est "), f(`f'(${a})`), t(", et "), f(`f(${a})`), t(" est l'ordonnée du point de contact. Les intervertir donne une autre droite.")]));
  return etapes;
}

// ============================================================================
// Variante B — tangentes horizontales.
// ============================================================================

/** Étape « dérivée » d'un polynôme (seulement si f′ est à calculer). */
function etapesDeriverPoly(e: ExerciceTangente, coeffs: number[]): EtapeCorrection[] {
  if (e.deriveeDonnee) return [];
  const L = lettreEtapeTangente(e, "deriver");
  return [
    utilise(L, [t("Dérivée d'un polynôme : on dérive terme à terme avec "), f("(x^n)'=n\\,x^{n-1}"), t(`, une constante a pour dérivée 0 ${COURS_DERIVEE}.`)]),
    calcul(L, lignesDeriveePoly("f'(x)", coeffs).lignes),
    resultat(L, [f(formatFPrimeDeXLatex(e))]),
  ];
}

function etapesHorizontale(e: ExerciceTangenteHorizontale): EtapeCorrection[] {
  const L = (x: EtapeTangente) => lettreEtapeTangente(e, x);
  const coeffs = [e.d, e.c, e.b, e.a];
  const { derivee } = lignesDeriveePoly("f'(x)", coeffs);
  const k = 3 * e.a;
  const B = derivee[1] / k;
  const C = derivee[0] / k;
  if (e.racines.length === 0) {
    // Lot C — aucune tangente horizontale (Δ < 0).
    const delta = B * B - 4 * C;
    return [
      ...etapesDeriverPoly(e, coeffs),
      utilise(L("resoudre"), [t("La tangente est horizontale là où sa pente est nulle : on résout "), f("f'(x)=0"), t(`, une équation du second degré ${COURS_TANGENTES}.`)]),
      calcul(L("resoudre"), [
        ligne(`${polyLatex(derivee)}=0`, "tangente horizontale : pente nulle, f′(x) = 0"),
        ligne(`\\iff ${polyLatex([C, B, 1])}=0`, `on divise par ${nbT(k)}`),
        ligne(`\\Delta=${par(B)}^{2}-4\\cdot 1\\cdot ${par(C)}`, [t("discriminant de "), f(polyLatex([C, B, 1]))]),
        ligne(`=${delta}`, "Δ < 0 : le trinôme n'a aucune racine"),
      ]),
      resultat(L("resoudre"), [t("Aucune solution : la courbe de f n'a aucune tangente horizontale.")]),
      piege(L("resoudre"), [t("Un discriminant négatif ne donne aucun point : il n'y a pas d'ordonnée à calculer.")]),
    ];
  }
  const resolution = lignesTrinomeUnitaireNul(B, C);
  const lignesRes: LigneCalcul[] = [ligne(`${polyLatex(derivee)}=0`, "tangente horizontale : pente nulle, f′(x) = 0"), ligne(`\\iff ${polyLatex([C, B, 1])}=0`, `on divise par ${nbT(k)}`), ...resolution.lignes];
  const racineDouble = e.racines.length === 1;
  const etapes: EtapeCorrection[] = [
    ...etapesDeriverPoly(e, coeffs),
    utilise(L("resoudre"), [t("La tangente est horizontale là où sa pente est nulle : on résout "), f("f'(x)=0"), t(`, une équation du second degré ${COURS_TANGENTES}.`)]),
    calcul(L("resoudre"), lignesRes),
    resultat(L("resoudre"), [f(formatReponseAttenduePhaseLatex(e, "resoudre")[0]), ...(racineDouble ? [t(" (racine double : un seul point)")] : [])]),
    utilise(L("coordonnees"), [t("Un point de tangence a deux coordonnées : pour chaque solution x, son ordonnée est "), f("y=f(x)"), t(` — on remplace dans f, pas dans f′ ${COURS_TANGENTES}.`)]),
  ];
  for (const r of e.racines) etapes.push(calcul(L("coordonnees"), lignesValeurPoly(`f(${r})`, coeffs, q(r)).lignes, [], `x = ${nbT(r)}`));
  etapes.push(resultat(L("coordonnees"), [t(racineDouble ? "Point de tangence : " : "Points de tangence : "), ...liste(formatReponseAttenduePhaseLatex(e, "coordonnees"))]));
  etapes.push(
    piege(L("coordonnees"), racineDouble ? [t("Une racine double ne donne qu'un seul point à tangente horizontale.")] : [t("Un point de tangence a deux coordonnées : l'abscisse seule ne suffit pas.")]),
  );
  return etapes;
}

// ============================================================================
// Variante C — double tangence.
// ============================================================================

function carre(r: number): string {
  return r === 0 ? "x^{2}" : `(${xMoins(r)})^{2}`;
}

function etapesDoubleTangence(e: ExerciceTangenteDoubleTangence): EtapeCorrection[] {
  const L = (x: EtapeTangente) => lettreEtapeTangente(e, x);
  const { p, q: qq } = e;
  const k = e.coeffs[4];
  const fp = valeurFDoubleTangence(e, p);
  const m = deriveeFDoubleTangence(e, p);
  const c0 = fp - m * p;
  const { lignes: lignesDer, derivee } = lignesDeriveePoly("f'(x)", e.coeffs);
  const [fppEcran, tEcran] = formatReponseAttenduePhaseLatex(e, "tangenteEnP");
  const diff = e.coeffs.map((c, i) => c - (i === 0 ? c0 : i === 1 ? m : 0));
  const trinomeP = [p * p, -2 * p, 1];
  const quotient = [k * qq * qq, -2 * k * qq, k];
  const lignesQ: LigneCalcul[] = [
    ligne(`f(x)-t(x)=${polyLatex(diff)}`, jf("on soustrait ", { l: `t(x)=${droiteEntiere(m, c0)}` })),
    ligne(`=(${polyLatex(trinomeP)})(${polyLatex(quotient)})`, jf("division par ", { l: `${carre(p)}=${polyLatex(trinomeP)}` }, " (reste nul : tangence en p)")),
    ligne(`=${k === 1 ? "" : k === -1 ? "-" : k}${carre(p)}${carre(qq)}`, "identités remarquables, coefficient mis en évidence"),
    ligne(`f(x)=t(x)\\iff ${carre(p)}${carre(qq)}=0`, "point commun : f(x) − t(x) = 0"),
    ligne(`\\iff x=${p}\\text{ ou }x=${qq}`, "un produit est nul si l'un des facteurs est nul"),
  ];
  const [fpqEcran, conclusion] = formatReponseAttenduePhaseLatex(e, "verifierPente");
  const lignesPente = [...lignesValeurPoly(`f'(${qq})`, derivee, q(qq)).lignes, ligne(`=f'(${p})`, "même pente que la tangente t")];
  return [
    utilise(L("tangenteEnP"), [t("On dérive terme à terme avec "), f("(x^n)'=n\\,x^{n-1}"), t(", puis la tangente au point d'abscisse p : "), f("y=f(p)+f'(p)(x-p)"), t(` ${COURS_TANGENTES}.`)]),
    calcul(L("tangenteEnP"), lignesDer, [], "f′(x)"),
    calcul(L("tangenteEnP"), lignesValeurPoly(`f'(${p})`, derivee, q(p)).lignes, [], `f′(${nbT(p)})`),
    calcul(L("tangenteEnP"), lignesValeurPoly(`f(${p})`, e.coeffs, q(p)).lignes, [], `f(${nbT(p)})`),
    calcul(L("tangenteEnP"), lignesTangenteEntiere(p, fp, m, dernierMembre(tEcran)), [], "Tangente t"),
    resultat(L("tangenteEnP"), [f(fppEcran), t(" et t : "), f(tEcran)]),
    utilise(L("trouverQ"), [t("Les points communs à la courbe et à t sont les solutions de "), f("f(x)=t(x)"), t(" ; la tangence en p fait de p une racine double : "), f("f(x)-t(x)"), t(` est divisible par ${p === 0 ? "x²" : "(x − p)²"} ${COURS_TANGENTES}.`)]),
    calcul(L("trouverQ"), sansDoublons(lignesQ)),
    resultat(L("trouverQ"), [t("Second point commun : "), f(formatReponseAttenduePhaseLatex(e, "trouverQ")[0])]),
    utilise(L("verifierPente"), [t("La droite t est tangente en q si la pente de la courbe en q, "), f(`f'(${qq})`), t(`, est égale à la pente de t ${COURS_TANGENTES}.`)]),
    calcul(L("verifierPente"), sansDoublons(lignesPente)),
    resultat(L("verifierPente"), [f(fpqEcran), t(", donc "), f(conclusion)]),
    piege(L("verifierPente"), [t("Un point commun ne suffit pas : la droite n'est tangente en q que si la pente de la courbe y est la même que celle de t.")]),
  ];
}

// ============================================================================
// Variante D (lot C) — tangentes de pente donnée.
// ============================================================================

function lignesTangenteFinale(e: ExerciceTangente, x0: number, droite: string): LigneCalcul[] {
  return lignesTangenteEntiere(x0, valeurFTangente(e, x0), deriveeFTangente(e, x0), droite);
}

function etapesPente(e: ExerciceTangentePente): EtapeCorrection[] {
  const L = (x: EtapeTangente) => lettreEtapeTangente(e, x);
  const c = e.coeffs;
  const derivee = c.slice(1).map((v, i) => (i + 1) * v);
  const moinsM = derivee.map((v, i) => (i === 0 ? v - e.m : v));
  const lignesRes: LigneCalcul[] = [ligne(`${polyLatex(derivee)}=${e.m}`, [t("pente imposée : "), f(`f'(x)=${e.m}`)]), ligne(`\\iff ${polyLatex(moinsM)}=0`, `on soustrait ${nbT(e.m)}`)];
  if (c.length === 4) {
    const k = moinsM[2];
    const B = moinsM[1] / k;
    const C = moinsM[0] / k;
    lignesRes.push(ligne(`\\iff ${polyLatex([C, B, 1])}=0`, `on divise par ${nbT(k)}`), ...lignesTrinomeUnitaireNul(B, C).lignes);
  } else {
    lignesRes.push(ligne(`\\iff x=${e.racines[0]}`, `on divise par ${nbT(moinsM[1])}`));
  }
  const etapes: EtapeCorrection[] = [
    ...etapesDeriverPoly(e, c),
    utilise(L("resoudrePente"), [t("La pente de la tangente au point d'abscisse x est f′(x) : on résout "), f(`f'(x)=${e.m}`), t(` ${COURS_TANGENTES}.`)]),
    calcul(L("resoudrePente"), sansDoublons(lignesRes)),
    resultat(L("resoudrePente"), [f(formatReponseAttenduePhaseLatex(e, "resoudrePente")[0])]),
    piege(L("resoudrePente"), [t("On résout "), f(`f'(x)=${e.m}`), t(", pas "), f("f'(x)=0"), t(" : la tangente n'est pas horizontale.")]),
    utilise(L("coordonnees"), [t("Pour chaque solution x, l'ordonnée du point de contact est "), f("y=f(x)"), t(` ${COURS_TANGENTES}.`)]),
  ];
  for (const r of e.racines) etapes.push(calcul(L("coordonnees"), lignesValeurPoly(`f(${r})`, c, q(r)).lignes, [], `x = ${nbT(r)}`));
  etapes.push(resultat(L("coordonnees"), [t(e.racines.length === 1 ? "Point de contact : " : "Points de contact : "), ...liste(formatReponseAttenduePhaseLatex(e, "coordonnees"))]));
  etapes.push(utilise(L("tangentesPente"), [t("En chaque point de contact (x₀ ; f(x₀)), la tangente a la pente imposée : "), f(`y=f(x_0)+${par(e.m)}(x-x_0)`), t(` ${COURS_TANGENTES}.`)]));
  const droites = formatReponseAttenduePhaseLatex(e, "tangentesPente");
  e.racines.forEach((r, i) => etapes.push(calcul(L("tangentesPente"), lignesTangenteFinale(e, r, dernierMembre(droites[i])), [], `Tangente en x = ${nbT(r)}`)));
  etapes.push(resultat(L("tangentesPente"), liste(droites)));
  return etapes;
}

// ============================================================================
// Variante E (lot C) — tangentes issues d'un point extérieur.
// ============================================================================

function etapesPointExterieur(e: ExerciceTangentePointExterieur): EtapeCorrection[] {
  const L = (x: EtapeTangente) => lettreEtapeTangente(e, x);
  const c = coeffsTangente(e) as number[];
  const fT = polyLatex(c).replace(/(?<![a-z])x(?![a-z])/g, "t");
  const fpT = polyLatex([e.b, 2 * e.a]).replace(/(?<![a-z])x(?![a-z])/g, "t");
  const xpt = e.xP === 0 ? "-t" : `${e.xP}-t`;
  const k = -e.a;
  const cst = e.b * e.xP + e.c - e.yP;
  const developpee = polyLatex([cst, 2 * e.a * e.xP, -e.a]).replace(/(?<![a-z])x(?![a-z])/g, "t");
  const [t1, t2] = e.contacts;
  const lignesCond: LigneCalcul[] = [
    ligne(`y=f(t)+f'(t)(x-t)`, "tangente au point d'abscisse t"),
    ligne(`${e.yP}=f(t)+f'(t)(${xpt})`, jf("P est sur la tangente : on remplace x et y par ", { l: pointPLatex(e) })),
    ligne(`${e.yP}=${fT}+(${fpT})(${xpt})`, [t("on remplace "), f(`f(t)=${fT}`), t(" et "), f(`f'(t)=${fpT}`)]),
    ligne(`0=${developpee}`, "on développe, on réduit et on passe tout dans un membre"),
    ligne(`\\iff ${conditionContactLatex(e)}`, `on divise par ${nbT(k)}`),
  ];
  const etapes: EtapeCorrection[] = [
    ...etapesDeriverPoly(e, c),
    utilise(L("condition"), [t("La tangente au point d'abscisse t a pour équation "), f("y=f(t)+f'(t)(x-t)"), t(" ; elle passe par P si les coordonnées de P vérifient cette équation "), t(`${COURS_TANGENTES}.`)]),
    calcul(L("condition"), sansDoublons(lignesCond)),
    resultat(L("condition"), [f(conditionContactLatex(e))]),
    utilise(L("abscissesContact"), [t("On résout l'équation du second degré en t : chaque solution est l'abscisse d'un point de contact.")]),
    calcul(
      L("abscissesContact"),
      lignesTrinomeUnitaireNul(-(t1 + t2), t1 * t2).lignes.map((x) => {
        const enT = (l: string) => l.replace(/(?<![a-z])x(?![a-z])/g, "t");
        const j = x.justification;
        return { ...x, latex: enT(x.latex), justification: typeof j === "string" || j === undefined ? j : j.map((fr) => (fr.type === "latex" ? { ...fr, valeur: enT(fr.valeur) } : fr)) };
      }),
    ),
    resultat(L("abscissesContact"), [f(formatReponseAttenduePhaseLatex(e, "abscissesContact")[0])]),
    piege(L("abscissesContact"), [t("P n'est pas sur la courbe : la pente f′("), f(`${e.xP}`), t(") n'est celle d'aucune tangente passant par P.")]),
    utilise(L("tangentesContact"), [t("En chaque abscisse de contact t : "), f("y=f(t)+f'(t)(x-t)"), t(`, puis on distribue et on réduit ${COURS_TANGENTES}.`)]),
  ];
  const droites = formatReponseAttenduePhaseLatex(e, "tangentesContact");
  e.contacts.forEach((u, i) => etapes.push(calcul(L("tangentesContact"), lignesTangenteFinale(e, u, dernierMembre(droites[i])), [], `Tangente en t = ${nbT(u)}`)));
  etapes.push(resultat(L("tangentesContact"), liste(droites)));
  etapes.push(
    verification(L("tangentesContact"), [t("Chaque tangente passe bien par P :")], droites.map((d) => ligne(`${dernierMembre(d).replace(/x/g, `\\cdot ${par(e.xP)}`).replace(/^\\cdot /, "")}=${e.yP}`, `on remplace x par ${nbT(e.xP)}`))),
  );
  return etapes;
}

export function correctionDetailleeTangente(e: ExerciceTangente): EtapeCorrection[] {
  switch (e.variante) {
    case "pointDonne":
      return finaliser(etapesPointDonne(e));
    case "horizontale":
      return finaliser(etapesHorizontale(e));
    case "doubleTangence":
      return finaliser(etapesDoubleTangence(e));
    case "pente":
      return finaliser(etapesPente(e));
    case "pointExterieur":
      return finaliser(etapesPointExterieur(e));
  }
}
