import type { EtapeCorrection, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import type { ExerciceInequationTrigo } from "../../core5e/inequationsTrigo";
import { estStrict, estSup, valeurM } from "../../core5e/inequationsTrigo";
import { piL, q, qAdd, qDiv, qL, qMul, qSub, qVal } from "../../ui5e/nombresTrigo";
import type { Q } from "../../ui5e/nombresTrigo";
import { figureCercleInequation } from "../../ui5e/figureInequationsTrigo";
import { angleRefPi, argL, ensembleL, familleL, FENETRE_L, gaucheL, intervalleL, intervalleXL, isoleL, kPeriodeL, phases, reponse, SYMBOLE_L, valeurL } from "../../ui5e/formatInequationsTrigo";

/**
 * Corrigé détaillé « comme au tableau » de `5gen55` : a) isoler la fonction trigonométrique ;
 * b) l'arc lu sur le cercle (figure) ; c) retour à x, borne par borne ; d) les intervalles de
 * [0 ; 2π[, k par k. Cas particulier : a) puis b) conclusion (|m| > 1). Tout est exact.
 */

type E = ExerciceInequationTrigo;
const t = texte;
const f = latex;
const COURS = "(cours, § 8)";
/** « a + b », mais « b » seul quand a vaut 0. */
const plus = (a: string, b: string) => (a === "0" ? b : `${a}+${b}`);
/** Figure du corrigé papier : largeur limitée (6,5 cm), centrée. */
const figurePapier = (svg: string) => `<div style="max-width:6.5cm;margin:4px auto">${svg.replace(/<svg ([^>]*?)width="([\d.]+)" height="([\d.]+)"/, '<svg $1width="100%" style="height:auto;display:block"')}</div>`;

function etapeIsoler(e: E): EtapeCorrection[] {
  const sq = "a";
  const lignes: LigneCalcul[] = [ligne(enonceU(e, gaucheL(e, true), e.symboleAffiche, valeurL(e.e)), [t("on pose "), f(`u=${argL(e)}`)])];
  const trig = `\\${e.fonction} u`;
  let droite = e.e;
  if (qVal(e.d) !== 0) {
    droite = { num: qSub(e.e.num, e.d), rad: 1 };
    const kL = e.k === 1 ? "" : e.k === -1 ? "-" : `${e.k}`;
    lignes.push(ligne(`${kL}${trig}${SYMBOLE_L[e.symboleAffiche]}${valeurL(droite)}`, e.d.n < 0 ? [t("on ajoute "), f(qL(q(-e.d.n, e.d.d)))] : [t("on retranche "), f(qL(e.d))]));
  }
  if (e.k !== 1) {
    const just = e.k < 0 ? [t(e.k === -1 ? "on multiplie par −1 : le sens de l'inégalité change" : `on divise par ${e.k} (négatif) : le sens de l'inégalité change`.replace("-", "−"))] : [t(`on divise par ${e.k}`)];
    lignes.push(ligne(isoleL(e), just));
  }
  void droite;
  return [
    utilise(sq, [t("On isole la fonction trigonométrique comme dans une équation ; diviser par un nombre négatif change le sens de l'inégalité "), t(COURS), t(".")]),
    calcul(sq, lignes),
    resultat(sq, reponse(e, "isoler")),
    piege(sq, e.inversion ? [t("Garder le même sens après avoir divisé par "), f(`${e.k}`), t(", un nombre négatif.")] : [t("Changer le sens de l'inégalité : ici, on ne divise pas par un nombre négatif.")]),
  ];
}

function enonceU(_e: E, gauche: string, s: "ge" | "gt" | "le" | "lt", droite: string): string {
  return `${gauche}${SYMBOLE_L[s]}${droite}`;
}

function etapeConclusion(e: E): EtapeCorrection[] {
  const sq = "b";
  const fn = `\\${e.fonction} u`;
  const m = valeurM(e.m);
  const ml = valeurL(e.m);
  const lignes: LigneCalcul[] = [ligne(`-1\\leq ${fn}\\leq 1`, "pour tout nombre u")];
  lignes.push(ligne(m > 1 ? `${ml}>1` : `${ml}<-1`, "m sort de [−1 ; 1]"));
  return [
    utilise(sq, [t("Un sinus et un cosinus sont toujours compris entre "), f("-1"), t(" et "), f("1"), t(" "), t(COURS), t(".")]),
    calcul(sq, lignes),
    resultat(sq, reponse(e, "conclusion")),
    piege(sq, [t("Chercher un arc ou un « arcsin » d'une valeur hors de "), f("[-1\\,;\\,1]"), t(" : il n'existe pas.")]),
  ];
}

function etapeArc(e: E): EtapeCorrection[] {
  const sq = "b";
  const ref = angleRefPi(e);
  const ml = valeurL(e.m);
  const [g, d] = e.arcU!;
  const lignes: LigneCalcul[] = [];
  if (e.fonction === "sin") {
    lignes.push(ligne(`\\arcsin\\left(${ml}\\right)=${piL(ref)}`, "valeur remarquable : l'angle α de [−π/2 ; π/2]"));
    const p1 = ref.n < 0 ? `\\left(${piL(ref)}\\right)` : piL(ref);
    lignes.push(ligne(`\\pi-${p1}=${piL(qSub(q(1), ref))}`, "même sinus : π − α"));
    if (!estSup(e.symbole)) lignes.push(ligne(`2\\pi+${p1}=${piL(qAdd(q(2), ref))}`, "arc du bas : de π − α à 2π + α"));
  } else {
    lignes.push(ligne(`\\cos\\left(${piL(ref)}\\right)=${ml}`, "valeur remarquable : l'angle β de [0 ; π]"));
    if (estSup(e.symbole)) lignes.push(ligne(`\\cos\\left(${piL(q(-ref.n, ref.d))}\\right)=${ml}`, "même cosinus : −β"));
    else lignes.push(ligne(`2\\pi-${piL(ref)}=${piL(qSub(q(2), ref))}`, "arc de gauche : de β à 2π − β"));
  }
  // Vérification : milieu de l'arc (valeur remarquable : π/2, 3π/2, 0 ou π).
  const mil = qDiv(qAdd(g, d), q(2));
  const vm = e.fonction === "sin" ? Math.sin(qVal(mil) * Math.PI) : Math.cos(qVal(mil) * Math.PI);
  const vmL = `${Math.round(vm)}`;
  const rel = vm > valeurM(e.m) ? ">" : "<";
  return [
    utilise(sq, [
      t(e.fonction === "sin" ? "Le sinus est l'ordonnée du point du cercle : l'arc solution est " + (estSup(e.symbole) ? "au-dessus" : "au-dessous") + " de la droite " : "Le cosinus est l'abscisse du point du cercle : l'arc solution est " + (estSup(e.symbole) ? "à droite" : "à gauche") + " de la droite "),
      f(e.fonction === "sin" ? `\\sin u=${ml}` : `\\cos u=${ml}`),
      t(`, parcouru dans le sens trigonométrique ${COURS}.`),
    ]),
    calcul(sq, lignes),
    { ...resultat(sq, reponse(e, "arc")), figureHtml: figurePapier(figureCercleInequation(e, true)) },
    verification(sq, [t("Au milieu de l'arc, "), f(`u_0=${piL(mil)}`), t(" vérifie l'inéquation :")], [ligne(`\\${e.fonction}\\left(${piL(mil)}\\right)=${vmL}${rel}${ml}`)]),
    piege(sq, [t(e.fonction === "sin" ? "Garder l'arc complémentaire : pour ≥, l'arc au-dessus de la droite ; pour ≤, celui en dessous (sa borne droite est 2π + α)." : "Garder l'arc complémentaire : pour ≥, l'arc de droite (de −β à β) ; pour ≤, celui de gauche (de β à 2π − β).")]),
  ];
}

function lignesBorne(e: E, u: Q, x: Q): LigneCalcul[] {
  const b = e.bPi;
  const ub = qSub(u, b);
  const out: LigneCalcul[] = [ligne(`${argL(e)}=${plus(piL(u), "2k\\pi")}`, "une borne de l'arc")];
  if (qVal(b) !== 0) out.push(ligne(`${e.a}x=${plus(piL(ub), "2k\\pi")}`, b.n < 0 ? [t("on ajoute "), f(piL(q(-b.n, b.d)))] : [t("on retranche "), f(piL(b))]));
  out.push(ligne(`x=${plus(piL(x), kPeriodeL(e.periode))}`, `on divise chaque terme par ${e.a}, la période aussi`));
  return out;
}

function etapeRetour(e: E): EtapeCorrection[] {
  const sq = "c";
  return [
    utilise(sq, [t("Pour chaque borne, on résout "), f("ax+b=\\text{borne}+2k\\pi"), t(" ; comme "), f(`a=${e.a}>0`), t(", l'ordre des bornes est conservé "), t(COURS), t(".")]),
    calcul(sq, lignesBorne(e, e.arcU![0], e.xg!), [], "Borne gauche"),
    calcul(sq, lignesBorne(e, e.arcU![1], e.xd!), [], "Borne droite"),
    resultat(sq, [f(familleL(e))]),
    piege(sq, [t("Oublier de diviser la période par "), f(`${e.a}`), t(" : elle vaut "), f(piL(e.periode)), t(", pas "), f("2\\pi"), t(".")]),
  ];
}

function etapeIntervalles(e: E): EtapeCorrection[] {
  const sq = "d";
  const lignes: LigneCalcul[] = [];
  const strict = estStrict(e.symbole);
  const o: "[" | "]" = strict ? "]" : "[";
  const fe: "[" | "]" = strict ? "[" : "]";
  let avant = false;
  for (let k = -3 * e.a - 2; k <= 3 * e.a + 2; k++) {
    const g = qAdd(e.xg!, qMul(q(k), e.periode));
    const d = qAdd(e.xd!, qMul(q(k), e.periode));
    const gv = qVal(g);
    const dv = qVal(d);
    const brut = intervalleL(o, piL(g), piL(d), fe);
    const kT = `k = ${k}`.replace("-", "−");
    if (dv <= 0) {
      if (qVal(qAdd(d, e.periode)) > 0) lignes.push(ligne(`${piL(d)}${dv < 0 ? "<" : "\\leq"}0`, `${kT} : l'intervalle s'arrête avant 0, rejeté`));
      continue;
    }
    if (gv >= 2) {
      if (!avant) lignes.push(ligne(`${piL(g)}\\geq 2\\pi`, `${kT} : l'intervalle commence après 2π, rejeté`));
      avant = true;
      continue;
    }
    if (gv < 0 || dv > 2) {
      const coupe = intervalleL(gv < 0 ? "[" : o, gv < 0 ? "0" : piL(g), dv > 2 ? "2\\pi" : piL(d), dv > 2 ? "[" : fe);
      lignes.push(ligne(`${brut}\\cap${FENETRE_L}=${coupe}`, `${kT} : on coupe ${gv < 0 ? "en 0" : "en 2π (exclu)"}`));
    } else lignes.push(ligne(`x\\in${brut}`, kT));
  }
  // Vérification : un point du premier intervalle complet (milieu de l'arc).
  const verif = verifPoint(e);
  return [
    utilise(sq, [t("On donne à "), f("k"), t(" des valeurs entières et on garde ce qui est dans "), f(FENETRE_L), t(" ; "), f("2\\pi"), t(" est exclu.")]),
    calcul(sq, lignes),
    resultat(sq, [f(ensembleL(e))]),
    ...(verif ? [verification(sq, verif.texte, verif.lignes)] : []),
    piege(sq, [t("Oublier un intervalle (une période de plus dans "), f(FENETRE_L), t(") ou inclure "), f("2\\pi"), t(".")]),
  ];
}

/** Point de contrôle : le milieu de l'arc ramené en x, dans la fenêtre. */
function verifPoint(e: E): { texte: ReturnType<typeof t>[] | (ReturnType<typeof t> | ReturnType<typeof f>)[]; lignes: LigneCalcul[] } | null {
  const [g, d] = e.arcU!;
  const um = qDiv(qAdd(g, d), q(2));
  let xm = qDiv(qSub(um, e.bPi), q(e.a));
  while (qVal(xm) < 0) xm = qAdd(xm, e.periode);
  while (qVal(xm) >= 2) xm = qSub(xm, e.periode);
  const u = qAdd(qMul(q(e.a), xm), e.bPi);
  const tv = Math.round(e.fonction === "sin" ? Math.sin(qVal(u) * Math.PI) : Math.cos(qVal(u) * Math.PI));
  const val = qAdd(q(e.k * tv), e.d);
  const bL = qVal(e.bPi) === 0 ? "" : e.bPi.n < 0 ? piL(e.bPi) : `+${piL(e.bPi)}`;
  const kL = e.k === 1 ? "" : e.k === -1 ? "-" : `${e.k}`;
  const dL = qVal(e.d) === 0 ? "" : e.d.n < 0 ? qL(e.d) : `+${qL(e.d)}`;
  const xmL = piL(xm);
  const lignes: LigneCalcul[] = [
    ligne(`u_0=${e.a}\\cdot ${xmL.startsWith("-") ? `\\left(${xmL}\\right)` : xmL}${bL}=${piL(u)}`, "on remplace x par x₀"),
    ligne(`${kL}\\${e.fonction}\\left(${piL(u)}\\right)${dL}=${qL(val)}`, [t("et "), f(`${qL(val)}${SYMBOLE_L[e.symboleAffiche]}${valeurL(e.e)}`), t(" : c'est bien une solution")]),
  ];
  return { texte: [t("Un point de l'ensemble, "), f(`x_0=${xmL}`), t(", vérifie l'inéquation :")], lignes };
}

export function correctionDetailleeInequationTrigo(e: E): EtapeCorrection[] {
  if (e.cas) return [...etapeIsoler(e), ...etapeConclusion(e)];
  return [...etapeIsoler(e), ...etapeArc(e), ...etapeRetour(e), ...etapeIntervalles(e)];
}

export { phases, intervalleXL };
