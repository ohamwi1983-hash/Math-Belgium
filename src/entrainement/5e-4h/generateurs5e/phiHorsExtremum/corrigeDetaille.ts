import type { EtapeCorrection, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import type { ExercicePhiHorsExtremum } from "../../core5e/phiHorsExtremum";
import { exactA, nbL, piL, q, qAdd, qDiv, qL, qMul, qSub, qVal, valeurRemarquableL } from "../../ui5e/nombresTrigo";
import { mValeurL, modeleL, omegaL, omegaTL, phi1L, phi2L, phiL, reponse, TL, tMaxL, vL } from "../../ui5e/formatPhiHorsExtremum";

/**
 * Corrigé détaillé « comme au tableau » de `5gen54` (`.claude/rules/feuilles-evaluations.md`), une
 * étape par écran : a) A, b, ω ; b) sin φ ; c) les deux candidats ; d) le sens de variation tranche ;
 * e) premier maximum (vérification du modèle). Valeurs approchées toujours calculées depuis les
 * valeurs NON arrondies (φ, t), écritures de `formatPhiHorsExtremum.ts`.
 */

type E = ExercicePhiHorsExtremum;
const t = texte;
const f = latex;
const COURS = "(cours, point 8)";
/** « 8k », mais « k » pour une période 1. */
const kL = (p: string) => (p === "1" ? "k" : `${p}k`);

function etapeA(e: E): EtapeCorrection[] {
  const sq = "a";
  const lignes: LigneCalcul[] = [];
  if (e.variante === "roue") {
    lignes.push(ligne(`\\max=${vL(e, e.h!)}+${vL(e, e.r!)}=${vL(e, e.max)}`, "centre + rayon : le point le plus haut"));
    lignes.push(ligne(`\\min=${vL(e, e.h!)}-${vL(e, e.r!)}=${vL(e, e.min)}`, "centre − rayon : le point le plus bas"));
  }
  const ecart = e.max - e.min;
  const somme = e.max + e.min;
  const pMin = e.min < 0 ? `(${vL(e, e.min)})` : vL(e, e.min);
  lignes.push(ligne(`A=\\dfrac{${vL(e, e.max)}-${pMin}}{2}=\\dfrac{${vL(e, ecart)}}{2}=${vL(e, e.A)}`, "demi-écart des extrêmes"));
  lignes.push(ligne(`b=\\dfrac{${vL(e, e.max)}+${pMin}}{2}=\\dfrac{${vL(e, somme)}}{2}=${vL(e, e.b)}`, "moyenne des extrêmes"));
  const o = omegaL(e);
  const quotient = `\\dfrac{2\\pi}{${qVal(e.T) === 1 ? "T" : TL(e)}}`;
  lignes.push(ligne(`\\omega=${quotient}${quotient === o ? "" : `=${o}`}${exactA(e.omega, 2) ? "" : `\\approx ${nbL(e.omega, 2)}`}`, `période T = ${nbL(qVal(e.T), 2).replace("{,}", ",")} ${e.contexte.tempsCourt}`));
  return [
    utilise(sq, [t("Amplitude et décalage vertical à partir des valeurs extrêmes, pulsation à partir de la période "), t(COURS), t(" : "), f("A=\\dfrac{\\max-\\min}{2}"), t(", "), f("b=\\dfrac{\\max+\\min}{2}"), t(", "), f("\\omega=\\dfrac{2\\pi}{T}"), t(".")]),
    calcul(sq, lignes),
    resultat(sq, reponse(e, "parametres")),
    piege(sq, [t("Prendre "), f("A=\\max-\\min"), t(" (le double de l'amplitude) ou "), f("\\omega=\\dfrac{T}{2\\pi}"), t(".")]),
  ];
}

function etapeB(e: E): EtapeCorrection[] {
  const sq = "b";
  const nom = e.contexte.nomFonction;
  const d = e.y0 - e.b;
  const lignes: LigneCalcul[] = [
    ligne(`${nom}(0)=${vL(e, e.A)}\\sin\\varphi+${vL(e, e.b)}=${vL(e, e.y0)}`, [t("on remplace "), f("t"), t(" par 0 : "), f("\\sin(\\omega\\cdot 0+\\varphi)=\\sin\\varphi")]),
    ligne(`${vL(e, e.A)}\\sin\\varphi=${vL(e, d)}`, [t("on retranche "), f(vL(e, e.b))]),
  ];
  const fr = `\\dfrac{${vL(e, d)}}{${vL(e, e.A)}}`;
  const m = mValeurL(e);
  lignes.push(ligne(`\\sin\\varphi=${fr}${fr === m ? "" : `=${m}`}${e.mode === "exact" || exactA(qVal(e.m), 4) ? "" : `\\approx ${nbL(qVal(e.m), 4)}`}`, [t("on divise par "), f(vL(e, e.A))]));
  return [
    utilise(sq, [t("La condition initiale : la valeur à "), f("t=0"), t(" est connue "), t(COURS), t(".")]),
    calcul(sq, lignes),
    resultat(sq, reponse(e, "sinus")),
    verification(sq, [t("La valeur est bien comprise entre "), f("-1"), t(" et "), f("1"), t(" ; elle n'est pas égale à "), f("\\pm1"), t(" : le départ n'est pas un extremum.")]),
  ];
}

function etapeC(e: E): EtapeCorrection[] {
  const sq = "c";
  const m = mValeurL(e);
  const lignes: LigneCalcul[] = [];
  if (e.phi1Pi && e.phi2Pi) {
    lignes.push(ligne(`\\varphi_1=\\arcsin\\left(${m}\\right)=${piL(e.phi1Pi)}`, "valeur remarquable, dans [−π/2 ; π/2]"));
    const brut = qSub(q(1), e.phi1Pi);
    const p1 = e.phi1Pi.n < 0 ? `\\left(${piL(e.phi1Pi)}\\right)` : piL(e.phi1Pi);
    lignes.push(ligne(`${qVal(brut) > 1 ? "" : "\\varphi_2="}\\pi-${p1}=${piL(brut)}`, "même sinus, symétrique par rapport à l'axe vertical"));
    if (qVal(brut) > 1) lignes.push(ligne(`\\varphi_2=${piL(brut)}-2\\pi=${piL(e.phi2Pi)}`, "on retire un tour pour revenir dans ]−π ; π]"));
  } else {
    lignes.push(ligne(`\\varphi_1=\\arcsin\\left(${m}\\right)\\approx ${nbL(e.phi1, 2, true)}`, "touche sin⁻¹ en mode radian"));
    if (Math.PI - e.phi1 > Math.PI) {
      lignes.push(ligne(`\\varphi_2=\\pi-\\arcsin\\left(${m}\\right)-2\\pi`, "π − arcsin m dépasse π : on retire un tour"));
      lignes.push(ligne(`=-\\pi-\\arcsin\\left(${m}\\right)\\approx ${nbL(e.phi2, 2, true)}`));
    } else {
      lignes.push(ligne(`\\varphi_2=\\pi-\\arcsin\\left(${m}\\right)\\approx ${nbL(e.phi2, 2, true)}`, "même sinus, symétrique par rapport à l'axe vertical"));
    }
  }
  const verif = e.phi2Pi
    ? [ligne(`\\sin\\left(${piL(e.phi2Pi)}\\right)=${valeurRemarquableL(Math.sin(qVal(e.phi2Pi) * Math.PI)) ?? nbL(Math.sin(qVal(e.phi2Pi) * Math.PI), 4)}`)]
    : [ligne(`\\sin\\varphi_2=\\sin\\left(\\pi-\\arcsin\\left(${m}\\right)\\right)=${m}`)];
  return [
    utilise(sq, [t("Hors d'un extremum, deux angles de "), f("]-\\pi\\,;\\pi]"), t(" ont le même sinus "), t(COURS), t(" : "), f("\\arcsin m"), t(" et "), f("\\pi-\\arcsin m"), t(".")]),
    calcul(sq, lignes),
    resultat(sq, reponse(e, "candidats")),
    verification(sq, [t("Le second candidat a bien le même sinus :")], verif),
    piege(sq, [t("Prendre "), f("-\\arcsin m"), t(" comme second candidat : il a le même cosinus, pas le même sinus.")]),
  ];
}

function cosL(e: E, quel: 1 | 2): string {
  const exact = quel === 1 ? e.phi1Pi : e.phi2Pi;
  const v = quel === 1 ? e.phi1 : e.phi2;
  const c = Math.cos(v);
  const signe = c > 0 ? ">0" : "<0";
  if (exact) {
    const val = valeurRemarquableL(c);
    return `\\cos\\left(${piL(exact)}\\right)=${val}${signe}`;
  }
  return `\\cos\\varphi_${quel}\\approx ${nbL(c, 2, true)}${signe}`;
}

function etapeD(e: E): EtapeCorrection[] {
  const sq = "d";
  const monte = e.sens === "monte";
  return [
    utilise(sq, [t("Au départ, l'argument vaut "), f("u=\\varphi"), t(" ; la grandeur monte si le point du cercle monte, c'est-à-dire si "), f("\\cos\\varphi>0"), t(" "), t(COURS), t(".")]),
    calcul(sq, [ligne(cosL(e, 1), `avec φ₁, ${Math.cos(e.phi1) > 0 ? "la grandeur monte" : "la grandeur descend"}`), ligne(cosL(e, 2), `avec φ₂, ${Math.cos(e.phi2) > 0 ? "la grandeur monte" : "la grandeur descend"}`)]),
    resultat(sq, [t(monte ? "La grandeur monte : on garde " : "La grandeur descend : on garde "), f(`\\varphi${e.phiPi ? "=" : "\\approx "}${phiL(e)}`), t(", d'où "), f(modeleL(e)), t(".")]),
    piege(sq, [t("Croire que les deux candidats conviennent : ce n'est pas un « "), f("+2k\\pi"), t(" », ils donnent deux fonctions différentes (l'une monte, l'autre descend au départ).")]),
  ];
}

function etapeE(e: E): EtapeCorrection[] {
  const sq = "e";
  const nom = e.contexte.nomFonction;
  const T = qVal(e.T);
  const lignes: LigneCalcul[] = [];
  const pPhi = (s: string) => (s === "0" ? "" : s.startsWith("-") ? s : `+${s}`);
  if (e.phiPi && e.tMaxQ) {
    const x = qSub(q(1, 2), e.phiPi);
    lignes.push(ligne(`${omegaTL(e)}${pPhi(piL(e.phiPi))}=\\dfrac{\\pi}{2}+2k\\pi`, "le sinus vaut 1"));
    lignes.push(ligne(`${omegaTL(e)}=${piL(x)}+2k\\pi`, e.phiPi.n < 0 ? [t("on ajoute "), f(piL(q(-e.phiPi.n, e.phiPi.d)))] : [t("on retranche "), f(piL(e.phiPi))]));
    const t0 = qDiv(x, e.omegaPi);
    const per = qDiv(q(2), e.omegaPi);
    lignes.push(ligne(`t=${qL(t0)}+${kL(qL(per))}`, [t("on divise par "), f(omegaL(e))]));
    if (qVal(t0) > 0) lignes.push(ligne(`t=${qL(t0)}${exactA(qVal(t0), 2) ? "" : `\\approx ${nbL(qVal(t0), 2)}`}`, "k = 0 : le plus petit instant positif"));
    else {
      const t1 = qAdd(t0, per);
      lignes.push(ligne(`t=${qL(t0)}+${qL(per)}=${qL(t1)}${exactA(qVal(t1), 2) ? "" : `\\approx ${nbL(qVal(t1), 2)}`}`, "k = 0 donne un instant négatif : k = 1"));
    }
  } else {
    lignes.push(ligne(`${omegaTL(e)}+\\varphi=\\dfrac{\\pi}{2}+2k\\pi`, "le sinus vaut 1"));
    lignes.push(ligne(`t=\\dfrac{\\frac{\\pi}{2}-\\varphi}{${omegaL(e)}}+${kL(nbL(T, 2))}`, [t("on divise par "), f(omegaL(e)), t(" ; période "), f(`T=${TL(e)}`)]));
    const t0 = (Math.PI / 2 - e.phi) / e.omega;
    lignes.push(ligne(`t\\approx ${nbL(t0, 2, true)}+${kL(nbL(T, 2))}`, "avec la valeur non arrondie de φ"));
    if (t0 <= 0) lignes.push(ligne(`t\\approx ${nbL(t0, 2, true)}+${nbL(T, 2)}\\approx ${nbL(e.tMax, 2, true)}`, "k = 0 donne un instant négatif : k = 1"));
  }
  // Vérification : l'argument vaut π/2 + 2kπ.
  const arg = e.phiPi && e.tMaxQ ? qAdd(qMul(e.omegaPi, e.tMaxQ), e.phiPi) : null;
  const verif: LigneCalcul[] = arg
    ? [ligne(`${nom}\\left(${qL(e.tMaxQ!)}\\right)=${vL(e, e.A)}\\sin\\left(${piL(arg)}\\right)+${vL(e, e.b)}=${vL(e, e.A)}+${vL(e, e.b)}=${vL(e, e.max)}`, "c'est bien le maximum")]
    : [ligne(`${nom}(t)=${vL(e, e.A)}\\cdot 1+${vL(e, e.b)}=${vL(e, e.max)}`, "à cet instant, le sinus vaut 1 : c'est le maximum")];
  return [
    utilise(sq, [t("Le maximum est atteint quand le sinus vaut 1 : "), f("\\omega t+\\varphi=\\dfrac{\\pi}{2}+2k\\pi"), t(" "), t(COURS), t(".")]),
    calcul(sq, lignes),
    resultat(sq, [f(`t${e.tMaxQ ? "=" : ""}${tMaxL(e)}`), t(` ${e.contexte.tempsCourt}`)]),
    verification(sq, [t(e.sens === "monte" ? "La grandeur monte au départ : le maximum arrive en moins d'une demi-période, comme prévu." : "La grandeur descend au départ : elle passe d'abord par son minimum, le maximum arrive après plus d'une demi-période.")], verif),
    piege(sq, [t("Garder un instant négatif (il faut ajouter une période "), f("T"), t(") ou utiliser le candidat rejeté.")]),
  ];
}

export function correctionDetailleePhiHorsExtremum(e: E): EtapeCorrection[] {
  return [...etapeA(e), ...etapeB(e), ...etapeC(e), ...etapeD(e), ...etapeE(e)];
}

export { phi1L, phi2L };
