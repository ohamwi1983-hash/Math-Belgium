import type {
  ExerciceFamilleA_Problemes,
  ExerciceFamilleB_Problemes,
  ExerciceFamilleC_Problemes,
  ExerciceFamilleD_Problemes,
  ExerciceFamilleE_Problemes,
  ExerciceFamilleF_Problemes,
  ExerciceFamilleG_Problemes,
  ExerciceIntegralesProblemes,
} from "../../core6e/integralesProblemes.types";
import type { EtapeCorrection, FragmentConsigne, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import { phasesPourExercice } from "../../moteur6e/typesIntegralesProblemes";
import type { PhaseIntegralesProblemes } from "../../moteur6e/typesIntegralesProblemes";
import { afficheAffine, cLatexD, coefRacineLatex, decimalFixeLatex, decimalLatex, demandeLatexF, fLatexE, formatReponseAttenduePhaseLatex, fractionDebordeeLatex, fractionLatex, valeurFractionDebordeeLatex, vLatexB, xLatexB } from "../../ui6e/formatIntegralesProblemes";
import { equilibreArrondiF, surplusAuCentiemeF } from "../../moteur6e/valeursIntegralesProblemes";
import { figureSurplusSvg, figureTrapezesSvg } from "../../ui6e/figureIntegralesProblemes";
import { volumeExactALatex } from "../../ui6e/formatVolumesRevolution";
import { cours, crochet, lignesFin, lignesIntegralePoly, piL, polyL, q, qDepuis, qDiv, qL, qMul, qP, qPow, qSub, qVal, substituer } from "../../ui6e/corrigeIntegrales1";
import type { Poly, Q } from "../../ui6e/corrigeIntegrales1";
import { blocsVolumeA } from "../volumesRevolution/corrigeDetaille";

/**
 * Corrigé détaillé « comme au tableau » de `6gen29` (intégrales et primitives : problèmes) — règle
 * `.claude/rules/feuilles-evaluations.md`. Trapèzes (somme écrite terme à terme), cinématique
 * (primitive + condition initiale, valeur ou équation testée), loi de Hooke, coût marginal, valeur
 * moyenne en contexte, surplus du consommateur, volumes (pièce percée, Archimède, calotte). Partagé
 * par l'adaptateur papier et `App6gen29.tsx`.
 */

const LETTRES = "abcdefgh";
const t = (s: string): FragmentConsigne => texte(s);
const f = (s: string): FragmentConsigne => latex(s);
const C7 = cours(7);

interface Contenu {
  utilise: FragmentConsigne[];
  calcul: LigneCalcul[];
  /** Blocs de calcul supplémentaires, avec un intitulé. */
  blocs?: { titre: string; lignes: LigneCalcul[] }[];
  verification?: { fragments: FragmentConsigne[]; lignes?: LigneCalcul[] };
  piege?: string;
  figure?: string;
}

/** Résultat d'une étape (la réponse de l'écran ; unité pour les trapèzes, libellé pour l'interprétation). */
export function reponseIntegralesProblemes(exercice: ExerciceIntegralesProblemes, phase: PhaseIntegralesProblemes): FragmentConsigne[] {
  if (exercice.famille === "A" && phase === "aEcran2") {
    return [latex(`${formatReponseAttenduePhaseLatex(exercice, phase).join("")}\\ \\text{${exercice.contexte === "terrain" ? "m}^2" : "m}^3"}`)];
  }
  if (exercice.famille === "E" && phase === "eEcran3") {
    const correcte = exercice.optionsInterpretation.find((o) => o.valeur === exercice.interpretationCorrecte);
    if (correcte) return [texte(correcte.label)];
  }
  return [latex(formatReponseAttenduePhaseLatex(exercice, phase).join(",\\quad "))];
}

const nb = (v: number): string => decimalLatex(v, 3);
const qOu = (v: number): Q => qDepuis(v) ?? q(Math.round(v * 1000), 1000);

function contenuA(e: ExerciceFamilleA_Problemes, phase: PhaseIntegralesProblemes): Contenu {
  const n = e.y.length - 1;
  const milieu = e.y.slice(1, n);
  if (phase === "aEcran1") {
    const extremes = (e.y[0] + e.y[n]) / 2;
    return {
      utilise: [t(`Méthode des trapèzes ${C7} : chaque bande est approchée par un trapèze ; les hauteurs extrêmes comptent une demi-fois, les autres une fois.`)],
      calcul: [
        ligne(`S=\\dfrac{y_0+y_{${n}}}{2}+${milieu.map((_, i) => `y_{${i + 1}}`).join("+")}`, "formule des trapèzes"),
        ligne(`=\\dfrac{${e.y[0]}+${e.y[n]}}{2}+${milieu.join("+")}`, "on remplace par les mesures"),
        ligne(`=${nb(extremes)}+${nb(milieu.reduce((s, v) => s + v, 0))}`, "on calcule la demi-somme et la somme"),
        ligne(`=${nb(e.sommeAttendue)}`),
      ],
      figure: figureTrapezesSvg(e),
      piege: "Compter les hauteurs extrêmes en entier : elles ne comptent qu'une demi-fois.",
    };
  }
  const p = e.dimensionSupplementaire;
  return p === null
    ? {
        utilise: [t(`L'aire approchée vaut Δx fois la somme S ${C7}.`)],
        calcul: [ligne("\\text{Aire}\\approx\\Delta x\\cdot S", "formule des trapèzes"), ligne(`=${e.deltaX}\\cdot ${nb(e.sommeAttendue)}`), ligne(`=${nb(e.valeurFinaleAttendue)}`)],
      }
    : {
        utilise: [t(`L'aire de la coupe vaut Δx fois S ; le volume s'obtient en la multipliant par la profondeur p ${C7}.`)],
        calcul: [ligne("V\\approx\\Delta x\\cdot S\\cdot p", "aire de la coupe × profondeur"), ligne(`=${e.deltaX}\\cdot ${nb(e.sommeAttendue)}\\cdot ${p}`), ligne(`=${nb(e.valeurFinaleAttendue)}`)],
      };
}

function contenuB(e: ExerciceFamilleB_Problemes, phase: PhaseIntegralesProblemes): Contenu {
  const a = afficheAffine(e.k, e.p, "t");
  if (phase === "bEcran1") {
    const sans = polyL(new Map([[2, q(e.k, 2)], [1, q(e.p)]]), "t");
    return {
      utilise: [t(`La vitesse est une primitive de l'accélération ${C7} ; la condition `), f("v(0)"), t(" fixe sa constante.")],
      calcul: [
        ligne(`v(t)=\\int(${a})\\,dt`, [f("v'(t)=a(t)")]),
        ligne(`=${sans}+C_1`, [t("primitive de "), f("t"), t(" : "), f("\\dfrac{t^{2}}{2}")]),
        ligne("v(0)=C_1", "on remplace t par 0"),
        ligne(`C_1=${e.v0}`, [t("car "), f(`v(0)=${e.v0}`)]),
        ligne(`v(t)=${vLatexB(e)}`),
      ],
    };
  }
  if (phase === "bEcran2") {
    const sans = polyL(new Map([[3, q(e.k, 6)], [2, q(e.p, 2)], [1, q(e.v0)]]), "t");
    return {
      utilise: [t(`La position est une primitive de la vitesse ${C7} ; sa propre constante est fixée par `), f("x(0)"), t(".")],
      calcul: [
        ligne(`x(t)=\\int\\left(${vLatexB(e)}\\right)dt`, [f("x'(t)=v(t)")]),
        ligne(`=${sans}+C_2`, "primitive terme à terme"),
        ligne("x(0)=C_2", "on remplace t par 0"),
        ligne(`C_2=${e.x0}`, [t("car "), f(`x(0)=${e.x0}`)]),
        ligne(`x(t)=${xLatexB(e)}`),
      ],
      piege: "Réutiliser la constante de v(t) pour x(t) : chaque intégration introduit sa propre constante.",
    };
  }
  const X = xLatexB(e);
  if (e.sousType === "evaluer") {
    const t1 = e.t1 as number;
    const v = e.xReference(t1);
    return {
      utilise: [t("On remplace t par "), f(`${t1}`), t(" dans "), f("x(t)"), t(` ${C7}.`)],
      calcul: [ligne(`x(${t1})=${substituer(X, `${t1}`, "t")}`, [t("on remplace t par "), f(`${t1}`)]), ...lignesFin(v, null, "on calcule")],
    };
  }
  const ts = e.tSolution as number;
  const cible = e.cible as number;
  const cL = qL(qOu(cible));
  const avant = e.xReference(ts - 1);
  return {
    utilise: [t("Comme "), f("v(t)\\geq 0"), t(" pour "), f("t\\geq 0"), t(`, la position est croissante : l'équation a une seule solution positive ; on la cherche parmi les entiers ${C7}.`)],
    calcul: [
      ligne(`${X}=${cL}`, "équation à résoudre"),
      ligne(`x(${ts - 1})=${substituer(X, `${ts - 1}`, "t")}`, [t("on teste "), f(`t=${ts - 1}`)]),
      ligne(`=${qL(qOu(avant))}`, [t("trop petit : "), f(`${qL(qOu(avant))}<${cL}`)]),
      ligne(`x(${ts})=${substituer(X, `${ts}`, "t")}`, [t("on teste "), f(`t=${ts}`)]),
      ligne(`=${cL}`, "c'est la position visée"),
    ],
  };
}

function lignesTravail(k: number, a: number, b: number, nom: string): { lignes: LigneCalcul[]; valeur: Q } {
  const p: Poly = new Map([[1, q(k)]]);
  return lignesIntegralePoly({ gauche: nom, integrande: `${k === 1 ? "" : k}x`, p, a: q(a), b: q(b) });
}

function contenuC(e: ExerciceFamilleC_Problemes, phase: PhaseIntegralesProblemes): Contenu {
  if (phase === "cEcran1") {
    return {
      utilise: [t("Loi de Hooke : "), f("F(x)=k\\cdot x"), t(`, donc avec la force connue, `), f("F(x_0)=k\\cdot x_0"), t(` ${C7}.`)],
      calcul: [ligne(`${e.F0}=k\\cdot ${e.x0}`, [f(`F(${e.x0})=${e.F0}`)]), ligne(`k=\\dfrac{${e.F0}}{${e.x0}}`, `on divise par ${e.x0}`), ligne(`=${e.k}`)],
    };
  }
  if (phase === "cEcran2") {
    return { utilise: [t("Le travail est l'intégrale de la force ; une primitive de "), f("kx"), t(" est "), f("\\dfrac{kx^2}{2}"), t(` ${C7}.`)], calcul: lignesTravail(e.k, e.a, e.b, "W").lignes, piege: "Oublier le facteur 1/2 de la primitive de kx." };
  }
  if (phase === "cEcran3") return { utilise: [t(`Même calcul sur le second intervalle ${C7}.`)], calcul: lignesTravail(e.k, e.a2 as number, e.b2 as number, "W_2").lignes };
  const w1 = lignesTravail(e.k, e.a, e.b, "W").valeur;
  const w2 = lignesTravail(e.k, e.a2 as number, e.b2 as number, "W_2").valeur;
  const d = qSub(w2, w1);
  return {
    utilise: [t("La force "), f("F(x)=kx"), t(` augmente avec l'allongement : à longueur égale, le travail est plus grand sur l'intervalle le plus éloigné de 0 ${C7}. On compare par la différence.`)],
    calcul: [ligne(`W_2-W=${qL(w2)}-${qP(w1)}`, "travaux des étapes précédentes"), ligne(`=${qL(d)}`), ligne(d.n > 0 ? "W_2>W" : "W>W_2", d.n > 0 ? "la différence est positive" : "la différence est négative")],
    piege: "Le travail ne dépend pas que de la longueur de l'intervalle, mais aussi de sa position.",
  };
}

function contenuD(e: ExerciceFamilleD_Problemes, phase: PhaseIntegralesProblemes): Contenu {
  const b = fractionLatex(e.bNum, e.bDen);
  const C = cLatexD(e);
  if (phase === "dEcran1") {
    return {
      utilise: [t("Le coût total est la primitive du coût marginal qui vaut "), f("C(0)"), t(` en 0 ${C7}.`)],
      calcul: [
        ligne(`C(q)=\\int\\left(${e.a}-${b}q\\right)dq`, [f("C'(q)=f(q)")]),
        ligne(`=${e.a}q-${fractionLatex(e.bNum, 2 * e.bDen)}q^2+K`, [t("primitive de "), f("q"), t(" : "), f("\\dfrac{q^{2}}{2}")]),
        ligne("C(0)=K", "on remplace q par 0"),
        ligne(`K=${e.F0}`, "coût fixe"),
        ligne(`C(q)=${C}`),
      ],
    };
  }
  if (phase === "dEcran2") {
    return { utilise: [t("On remplace q par "), f(`${e.q1}`), t(" dans "), f("C(q)"), t(` ${C7}.`)], calcul: [ligne(`C(${e.q1})=${substituer(C, `${e.q1}`, "q")}`, [t("on remplace q par "), f(`${e.q1}`)]), ...lignesFin(e.CReference(e.q1), null, "on calcule")] };
  }
  if (phase === "dEcran3") {
    const c1 = e.CReference(e.q1);
    const c2 = e.CReference(e.q2);
    return {
      utilise: [t("L'augmentation du coût total est la différence des coûts totaux, égale à l'intégrale du coût marginal "), f(`\\int_{${e.q1}}^{${e.q2}} f(q)\\,dq`), t(` ${C7}.`)],
      calcul: [ligne(`C(${e.q2})-C(${e.q1})=${substituer(C, `${e.q2}`, "q")}-\\left(${substituer(C, `${e.q1}`, "q")}\\right)`, "coûts totaux"), ligne(`=${qL(qOu(c2))}-${qP(qOu(c1))}`, "on calcule"), ...lignesFin(c2 - c1, null)],
      piege: "Donner C(q₂) au lieu de la différence C(q₂) − C(q₁).",
    };
  }
  return {
    utilise: [t(`Le coût moyen est le coût total divisé par la quantité produite ${C7}.`)],
    calcul: [ligne("C_{\\text{moy}}(q)=\\dfrac{C(q)}{q}"), ligne(`=\\dfrac{${C}}{q}`, "coût total de l'étape 1"), ligne(`=${e.a}-${fractionLatex(e.bNum, 2 * e.bDen)}q+\\dfrac{${e.F0}}{q}`, "on divise chaque terme par q")],
  };
}

function contenuE(e: ExerciceFamilleE_Problemes, phase: PhaseIntegralesProblemes): Contenu {
  const { a, b } = e.exerciceMoyenne;
  const termes = e.exerciceMoyenne.primitive.famille === "A" && e.exerciceMoyenne.primitive.sousType === "direct" ? e.exerciceMoyenne.primitive.termes : [];
  const m = termes.find((x) => x.type === "puissance")?.coef ?? 0;
  const c = termes.find((x) => x.type === "constante")?.coef ?? 0;
  const p: Poly = new Map([[1, q(m)], [0, q(c)]]);
  const I = lignesIntegralePoly({ gauche: `\\int_{${a}}^{${b}} f(t)\\,dt`, integrande: `\\left(${fLatexE(e)}\\right)`, p, a: q(a), b: q(b), variable: "t" });
  const mu = qDiv(I.valeur, q(b - a));
  if (phase === "eEcran1") return { utilise: [t(`La variation totale d'une grandeur est l'intégrale de son taux de variation ${C7}.`)], calcul: I.lignes };
  if (phase === "eEcran2") {
    return {
      utilise: [t(`La valeur moyenne est l'intégrale divisée par la longueur de l'intervalle ${C7} : `), f("\\mu=\\dfrac{1}{b-a}\\int_a^b f(t)\\,dt"), t(".")],
      calcul: [ligne(`\\mu=\\dfrac{1}{${b}-${a}}\\int_{${a}}^{${b}} f(t)\\,dt`), ligne(`=\\dfrac{1}{${b - a}}\\cdot ${qP(I.valeur)}`, "intégrale de l'étape 1"), ...lignesFin(qVal(mu), null, "on divise")],
    };
  }
  const unite = e.contexte === "stock" ? "unités par jour" : "euros par jour";
  return {
    utilise: [t(`f n'est pas la grandeur elle-même mais son taux de variation : sa valeur moyenne est un taux moyen, dans la même unité que f (${unite}) ${C7}.`)],
    calcul: [ligne(`\\mu\\cdot(${b}-${a})=${qP(mu)}\\cdot ${b - a}`, "ce taux constant pendant toute la durée…"), ligne(`=${qL(I.valeur)}`, "…produit la même variation totale")],
    piege: "Confondre avec le niveau moyen : f n'est pas la grandeur elle-même, mais sa vitesse de variation.",
  };
}

function contenuF(e: ExerciceFamilleF_Problemes, phase: PhaseIntegralesProblemes): Contenu {
  const dem = demandeLatexF(e);
  const g = afficheAffine(e.m, e.p, "x");
  const arrondis = equilibreArrondiF(e);
  const Q2 = decimalFixeLatex(arrondis.Q, 2);
  const P2 = decimalFixeLatex(arrondis.P, 2);
  if (phase === "fEcran1") {
    return {
      utilise: [t("Le point d'équilibre est l'intersection de la demande et de l'offre : on résout "), f("f(x)=g(x)"), t(` à la calculatrice (graphique ou solveur), puis P = g(Q) ${C7}.`)],
      calcul: [ligne(`${dem}=${g}`, "équation f(x) = g(x)"), ligne(`Q\\approx ${Q2}`, "abscisse du point d'intersection (calculatrice)"), ligne("P=g(Q)", "prix d'équilibre"), ligne(`=${afficheAffine(e.m, e.p, "Q")}`), ligne(`\\approx ${P2}`, "avec la valeur de Q de la calculatrice, non arrondie")],
      verification: { fragments: [t("Avec la demande, "), f(`f(${Q2})\\approx ${decimalLatex(e.A * Math.exp((-e.kNum / e.kDen) * arrondis.Q), 2)}`), t(" : on retrouve P, aux arrondis près.")] },
    };
  }
  const aSurK = fractionLatex(e.A * e.kDen, e.kNum);
  const ex = dem.slice(String(e.A).length);
  const F = `-${aSurK}${ex}-${P2}x`;
  // Même valeur que l'écran et la vérification (`valeursIntegralesProblemes.ts`) : S calculé avec Q
  // et P arrondis au centième ; le résultat encadré (réponse de l'écran) l'arrondit au dixième.
  const S2 = decimalFixeLatex(surplusAuCentiemeF(e), 2);
  return {
    utilise: [t("Le surplus est l'aire entre la courbe de demande et la droite du prix d'équilibre, de 0 à Q ; une primitive de "), f(dem), t(" est "), f(`-${aSurK}${ex}`), t(` ${C7}.`)],
    calcul: [
      ligne(`S=\\int_0^{Q}\\big(f(x)-P\\big)\\,dx`, "définition du surplus"),
      ligne(`\\approx\\int_0^{${Q2}}\\big(${dem}-${P2}\\big)\\,dx`, "Q et P de l'étape 1"),
      ligne(`=${crochet(F, "0", Q2)}`, "primitive terme à terme"),
      ligne(`=${substituer(F, Q2)}-\\left(-${aSurK}\\right)`, [t("F(Q) − F(0), avec "), f("e^{0}=1")]),
      ligne(`\\approx ${S2}`, "valeur approchée"),
    ],
    piege: "Arrondir Q et P trop tôt : garde au moins deux décimales jusqu'au calcul de S.",
    figure: figureSurplusSvg(e),
  };
}

function contenuG(e: ExerciceFamilleG_Problemes, phase: PhaseIntegralesProblemes): Contenu {
  if (e.sousType === "soustraction") {
    const vt = e.volumeTotal;
    const rho = q(e.rayonTrouNum, e.rayonTrouDen);
    const trou = qMul(qMul(rho, rho), q(e.longueurTrou));
    if (phase === "gSoustractionEcran1") {
      const blocs = blocsVolumeA(vt);
      return { utilise: [t(`Méthode des disques ${C7} : `), f("V=\\pi\\int_a^b [f(x)]^2\\,dx"), t(" ; on développe le carré, on primitive, puis on évalue.")], calcul: blocs[0].lignes, blocs: blocs.slice(1) };
    }
    const polyn = vt.type === "polynomiale";
    const coefP = polyn ? qDepuis(e.volumeTotalAttendu / Math.PI) : null;
    const VpL = coefP ? piL(coefP) : volumeExactALatex(vt) ?? decimalLatex(e.volumeTotalAttendu, 2);
    const lignes: LigneCalcul[] = [
      ligne(`V_{\\text{trou}}=\\pi\\rho^2(b-a)`, "volume d'un cylindre"),
      ligne(`=\\pi\\cdot ${qP(rho)}^2\\cdot ${e.longueurTrou}`),
      ligne(`=${piL(trou)}`),
      ligne(`V_{\\text{matière}}=V_{\\text{pièce}}-V_{\\text{trou}}`, "on retire le trou"),
      ligne(`=${VpL}-${piL(trou)}`, "volumes calculés"),
    ];
    if (coefP) lignes.push(ligne(`=${piL(qSub(coefP, trou))}`, "on réduit"));
    lignes.push(ligne(`\\approx ${decimalLatex(e.volumeTotalAttendu - e.volumeInterieur, 2)}`, "valeur approchée"));
    return {
      utilise: [t("Le trou est un cylindre de rayon "), f("\\rho"), t(" et de longueur "), f("b-a"), t(" ; on retire son volume de celui de la pièce pleine "), t(C7), t(".")],
      calcul: lignes,
      piege: "Soustraire les rayons (ou les fonctions) au lieu des volumes.",
    };
  }
  if (e.sousType === "archimede") {
    const p = e.paraboloide;
    const k = q(p.kNum, p.kDen);
    const k2 = qMul(k, k);
    const Vv = qDiv(qMul(k2, q(p.L * p.L)), q(2));
    const r = qOu(e.r);
    const Vb = qMul(q(4, 3), qPow(r, 3));
    const kL = coefRacineLatex(p.kNum, p.kDen);
    if (phase === "gArchimedeEcran1") {
      const demi: Poly = new Map([[2, qDiv(k2, q(2))]]);
      return {
        utilise: [t(`Méthode des disques ${C7} : le carré fait disparaître la racine.`)],
        calcul: [
          ligne(`V_{\\text{verre}}=\\pi\\int_0^{${p.L}}\\left(${kL}\\sqrt{x}\\right)^2dx`),
          ligne(`=\\pi\\int_0^{${p.L}} ${qL(k2) === "1" ? "" : qL(k2)}x\\,dx`, [f("\\left(\\sqrt{x}\\right)^2=x")]),
          ligne(`=\\pi${crochet(polyL(demi), "0", `${p.L}`)}`, [t("primitive de "), f("x"), t(" : "), f("\\dfrac{x^{2}}{2}")]),
          ligne(`=${piL(Vv)}`, "F(L) − F(0)"),
          ligne(`\\approx ${decimalLatex(qVal(Vv) * Math.PI, 2)}`, "valeur approchée"),
        ],
      };
    }
    if (phase === "gArchimedeEcran2") {
      return {
        utilise: [t(`Principe d'Archimède : le volume d'eau qui déborde est celui de la bille immergée, `), f("V=\\dfrac{4}{3}\\pi r^3"), t(` ${C7}.`)],
        calcul: [ligne(`V_{\\text{bille}}=\\dfrac{4}{3}\\pi\\cdot ${Number.isInteger(e.r) ? `${e.r}` : `(${decimalLatex(e.r)})`}^3`, [f(`r=${decimalLatex(e.r)}`)]), ligne(`=${piL(Vb)}`), ligne(`\\approx ${decimalLatex(qVal(Vb) * Math.PI, 2)}`, "valeur approchée")],
      };
    }
    // Fraction et valeur décimale : mêmes fonctions que la réponse de l'écran (`fractionDebordeeLatex`).
    const fracL = fractionDebordeeLatex(e);
    const valeurL = valeurFractionDebordeeLatex(e);
    return {
      utilise: [t(`Fraction débordée : volume de la bille divisé par le volume du verre (π se simplifie) ${C7}.`)],
      calcul: [
        ligne(`\\dfrac{V_{\\text{bille}}}{V_{\\text{verre}}}=\\dfrac{${piL(Vb)}}{${piL(Vv)}}`, "volumes des étapes précédentes"),
        ligne(`=${qL(Vb)}\\cdot ${qL(qDiv(q(1), Vv))}`, "on simplifie par π : diviser, c'est multiplier par l'inverse"),
        ligne(`=${fracL.slice(0, fracL.length - valeurL.length)}`, "on calcule"),
        ligne(valeurL, valeurL.startsWith("=") ? "écriture décimale" : "valeur approchée, trois chiffres significatifs"),
      ],
      piege: "Arrondir la fraction au centième : elle vaut souvent quelques millièmes, garde trois chiffres significatifs.",
    };
  }
  const r = e.r;
  const h = e.hDemande;
  if (phase === "gCalotteEcran1") {
    return { utilise: [t("On remplace r par "), f(`${r}`), t(` dans l'intégrande ${C7}.`)], calcul: [ligne(`r^2-(y-r)^2=${r}^2-(y-${r})^2`, [f(`r=${r}`)])] };
  }
  const p: Poly = new Map([[1, q(2 * r)], [2, q(-1)]]);
  if (phase === "gCalotteEcran2") {
    return {
      utilise: [t("On développe avec "), f("(a-b)^2=a^2-2ab+b^2"), t(`, puis on primitive terme à terme ${C7}.`)],
      calcul: [
        ligne(`${r}^2-(y-${r})^2=${r * r}-\\left(y^2-${2 * r}y+${r * r}\\right)`, [f("(a-b)^2=a^2-2ab+b^2")]),
        ligne(`=${polyL(p, "y")}`, "on réduit"),
        ligne(`\\int\\left(${polyL(p, "y")}\\right)dy=${r}y^2-\\dfrac{y^3}{3}+C`, [t("primitive de "), f("y^{n}"), t(" : "), f("\\dfrac{y^{n+1}}{n+1}")]),
      ],
    };
  }
  const { lignes } = lignesIntegralePoly({ gauche: `V(${h})`, integrande: `\\left(${polyL(p, "y")}\\right)`, p, a: q(0), b: q(h), facteur: "\\pi", variable: "y" });
  return { utilise: [t(`On évalue la primitive entre 0 et h, puis on multiplie par π ${C7}.`)], calcul: lignes, piege: "Oublier le facteur π devant l'intégrale." };
}

function contenu(e: ExerciceIntegralesProblemes, phase: PhaseIntegralesProblemes): Contenu {
  switch (e.famille) {
    case "A":
      return contenuA(e, phase);
    case "B":
      return contenuB(e, phase);
    case "C":
      return contenuC(e, phase);
    case "D":
      return contenuD(e, phase);
    case "E":
      return contenuE(e, phase);
    case "F":
      return contenuF(e, phase);
    case "G":
      return contenuG(e, phase);
  }
}

export function piegeIntegralesProblemes(e: ExerciceIntegralesProblemes, phase: PhaseIntegralesProblemes): string | undefined {
  return contenu(e, phase).piege;
}

export function correctionDetailleeIntegralesProblemes(e: ExerciceIntegralesProblemes): EtapeCorrection[] {
  return phasesPourExercice(e).flatMap((phase, i) => {
    const sq = LETTRES[i];
    const c = contenu(e, phase);
    const etapes: EtapeCorrection[] = [utilise(sq, c.utilise), calcul(sq, c.calcul, [], c.blocs ? "Carré" : "Calcul")];
    for (const b of c.blocs ?? []) etapes.push(calcul(sq, b.lignes, [], b.titre));
    etapes.push({ ...resultat(sq, reponseIntegralesProblemes(e, phase)), ...(c.figure ? { figureHtml: c.figure } : {}) });
    if (c.verification) etapes.push(verification(sq, c.verification.fragments, c.verification.lignes));
    if (c.piege) etapes.push(piege(sq, [t(c.piege)]));
    return etapes;
  });
}

