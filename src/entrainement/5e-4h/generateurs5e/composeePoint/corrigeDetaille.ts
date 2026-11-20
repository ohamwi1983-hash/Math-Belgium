import type { EtapeCorrection, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise } from "../../../export/corrigeTableau";
import type { ExerciceComposeePoint } from "../../core5e/composeePoint";
import { extraireCarre, nomExt, nomInt, radicande, reduire } from "../../core5e/composeePoint";
import { composeeL, domaineExtL, extL, intL, parN, radicandeL, radicandeSubstitueL, reponse, valeurReduiteL } from "../../ui5e/formatComposeePoint";

/**
 * Corrigé détaillé « comme au tableau » de `5gen60`, une lettre par écran : a) la fonction
 * appliquée d'abord et la valeur intermédiaire (substitution, une opération par ligne) ; b) la
 * condition d'existence de la seconde fonction résolue, son domaine, puis le test de la valeur
 * intermédiaire ; c) (si la composée existe) la valeur exacte, simplifiée ligne à ligne.
 */

type E = ExerciceComposeePoint;
const t = texte;
const f = latex;

function lignesInterieure(e: E): LigneCalcul[] {
  const it = nomInt(e);
  const a = e.a;
  const L: LigneCalcul[] = [ligne(`${it}(${a})=${intL(e.int, parN(a))}`, [t("on remplace x par "), f(`${a}`)])];
  const fi = e.int;
  if (fi.genre === "affine") {
    const prod = fi.m * a;
    if (fi.b !== 0 && fi.m !== 1) L.push(ligne(`=${prod}${fi.b > 0 ? `+${fi.b}` : fi.b}`));
  } else if (fi.genre === "carre") {
    const c = a * a;
    if (fi.b !== 0) L.push(ligne(`=${fi.s === -1 ? "-" : ""}${c}${fi.b > 0 ? `+${fi.b}` : fi.b}`, a < 0 ? [f(`(${a})^2=${c}`)] : undefined));
  } else if (fi.genre === "abs") {
    const inside = a - fi.p;
    if (fi.p !== 0) L.push(ligne(`=\\left|${inside}\\right|${fi.b === 0 ? "" : fi.b > 0 ? `+${fi.b}` : fi.b}`));
    if (fi.b !== 0) L.push(ligne(`=${Math.abs(inside)}${fi.b > 0 ? `+${fi.b}` : fi.b}`, "valeur absolue : le nombre sans son signe"));
  } else {
    L.push(ligne(`=\\sqrt{${a + fi.p}}`));
  }
  L.push(ligne(`=${e.m}`));
  return dedoublonner(L);
}

/** Retire une ligne identique à la précédente (« =5 » après « =5 »). */
function dedoublonner(L: LigneCalcul[]): LigneCalcul[] {
  return L.filter((l, i) => i === 0 || l.latex.replace(/^=/, "") !== L[i - 1]!.latex.replace(/^.*=/, ""));
}

function etapeA(e: E): EtapeCorrection[] {
  const ex = nomExt(e);
  const it = nomInt(e);
  return [
    utilise("a", [f(`(${ex}\\circ ${it})(a)=${ex}\\big(${it}(a)\\big)`), t(" : on lit de droite à gauche, "), f(it), t(" s'applique d'abord (cours, § 2).")]),
    calcul("a", lignesInterieure(e)),
    resultat("a", reponse(e, "inter")),
    piege("a", [t("Calculer "), f(`${ex}(${e.a})`), t(" en premier : dans "), f(composeeL(e)), t(", c'est "), f(it), t(" qui reçoit "), f(`${e.a}`), t(".")]),
  ];
}

/** Résolution de la condition d'existence de l'extérieure, une transformation par ligne. */
function lignesCondition(e: E): LigneCalcul[] {
  const ext = e.ext;
  const rel = ext.genre === "racine" ? "\\geq" : ext.genre === "inverse" ? "\\neq" : ">";
  const relInv = ext.genre === "racine" ? "\\leq" : ext.genre === "inverse" ? "\\neq" : "<";
  const L: LigneCalcul[] = [ligne(`${radicandeL(ext, "x")}${rel} 0`, ext.genre === "racine" ? "nombre sous la racine positif ou nul" : ext.genre === "inverse" ? "dénominateur non nul" : "racine au dénominateur : strictement positif")];
  if (ext.genre !== "inverse" && ext.s === -1) {
    if (ext.p !== 0) L.push(ligne(`-x${rel} ${-ext.p}`, `on retranche ${ext.p}`.replace("-", "−")));
    L.push(ligne(`x${relInv} ${ext.p}`, "on multiplie par −1 : le sens change"));
  } else if (ext.genre === "racine" && ext.k !== 1) {
    if (ext.p !== 0) L.push(ligne(`${ext.k}x${rel} ${ext.k * ext.p}`, ext.p > 0 ? `on ajoute ${ext.k * ext.p}` : `on retranche ${-ext.k * ext.p}`));
    L.push(ligne(`x${rel} ${ext.p}`, `on divise par ${ext.k}`));
  } else if (ext.p !== 0) {
    L.push(ligne(`x${rel} ${ext.p}`, ext.p > 0 ? `on ajoute ${ext.p}` : `on retranche ${-ext.p}`));
  }
  L.push(ligne(domaineExtL(e)));
  return L;
}

function etapeB(e: E): EtapeCorrection[] {
  const ex = nomExt(e);
  const ext = e.ext;
  const r = radicande(ext, e.m);
  const regle =
    ext.genre === "racine"
      ? [t("Une racine carrée n'existe que si le nombre sous la racine est positif ou nul (cours, § 1).")]
      : ext.genre === "inverse"
        ? [t("Une fraction n'existe que si son dénominateur n'est pas nul (cours, § 1).")]
        : [t("Racine au dénominateur : le nombre sous la racine doit être positif ou nul ET la racine non nulle, donc strictement positif (cours, § 1).")];
  const brut = radicandeSubstitueL(e);
  // Substitution sans opération (√x, c/x : « 5 ») : pas de « 5 = 5 ».
  const direct = brut === `${r}` || brut === `(${r})`;
  const sub = direct ? "" : `${brut}=`;
  const rel = ext.genre === "racine" ? (r >= 0 ? "\\geq 0" : "<0") : ext.genre === "inverse" ? (r !== 0 ? "\\neq 0" : "") : r > 0 ? ">0" : r === 0 ? "" : "<0";
  const test = rel === "" ? (direct ? `${e.m}\\notin\\operatorname{dom}${ex}` : `${brut}=0`) : `${sub}${r}${rel}`;
  const just = e.existe ? `condition vérifiée pour x = ${e.m}` : `condition fausse pour x = ${e.m}`;
  const L = [...lignesCondition(e), ligne(test, just.replace("-", "−"))];
  const pieges: EtapeCorrection[] = [];
  if (ext.genre === "racineDen") pieges.push(piege("b", [t("Écrire « ≥ 0 » : "), f("\\sqrt{0}=0"), t(" au dénominateur est interdit, il faut « > 0 ».")]));
  else if (ext.genre === "racine") pieges.push(piege("b", r === 0 ? [f("\\sqrt{0}=0"), t(" existe : 0 est permis sous une racine carrée.")] : [t("Tester la valeur de départ "), f(`${e.a}`), t(" au lieu de la valeur intermédiaire "), f(`${e.m}`), t(" : c'est elle que "), f(ex), t(" reçoit.")]));
  else pieges.push(piege("b", [t("Tester la valeur de départ "), f(`${e.a}`), t(" au lieu de la valeur intermédiaire "), f(`${e.m}`), t(" : c'est elle que "), f(ex), t(" reçoit.")]));
  return [utilise("b", regle), calcul("b", L), resultat("b", reponse(e, "existence")), ...pieges];
}

function lignesValeur(e: E): LigneCalcul[] {
  const ex = nomExt(e);
  const ext = e.ext;
  const r = radicande(ext, e.m);
  const L: LigneCalcul[] = [ligne(`${ex}(${e.m})=${extL(ext, parN(e.m))}`, [t("on remplace x par "), f(`${e.m}`)])];
  if (ext.genre === "racine") {
    L.push(ligne(`=\\sqrt{${r}}`));
    const { c, r: rr } = extraireCarre(r);
    if (r === 0 || rr === 1) L.push(ligne(`=${c * (r === 0 ? 0 : 1)}`, r === 0 ? undefined : `${r} = ${c}²`));
    else if (c !== 1) {
      L.push(ligne(`=\\sqrt{${c * c}\\times ${rr}}`));
      L.push(ligne(`=${c}\\sqrt{${rr}}`, [f(`\\sqrt{${c * c}}=${c}`)]));
    }
    return L;
  }
  const signe = ext.c < 0 ? "-" : "";
  const c = Math.abs(ext.c);
  if (ext.genre === "inverse") {
    L.push(ligne(`=${signe}\\dfrac{${c}}{${r}}`));
    const v = reduire(ext.c, 1, r);
    const fin = valeurReduiteL(v);
    if (fin !== `${signe}\\dfrac{${c}}{${r}}`) L.push(ligne(`=${fin}`, v.den === 1 ? undefined : "on simplifie la fraction"));
    return L;
  }
  L.push(ligne(`=${signe}\\dfrac{${c}}{\\sqrt{${r}}}`));
  const { c: k, r: rr } = extraireCarre(r);
  if (rr === 1) {
    L.push(ligne(`=${signe}\\dfrac{${c}}{${k}}`, `√${r} = ${k}`));
    const v = reduire(ext.c, 1, k);
    const fin = valeurReduiteL(v);
    if (fin !== `${signe}\\dfrac{${c}}{${k}}`) L.push(ligne(`=${fin}`, v.den === 1 ? undefined : "on simplifie la fraction"));
    return L;
  }
  let denL = `\\sqrt{${rr}}`;
  if (k !== 1) {
    denL = `${k}\\sqrt{${rr}}`;
    L.push(ligne(`=${signe}\\dfrac{${c}}{${denL}}`, [f(`\\sqrt{${r}}=${k}\\sqrt{${rr}}`)]));
  }
  L.push(ligne(`=${signe}\\dfrac{${c}\\sqrt{${rr}}}{${k === 1 ? "" : `${k}\\times `}${rr}}`, [t("on multiplie le numérateur et le dénominateur par "), f(`\\sqrt{${rr}}`)]));
  const v = reduire(ext.c, rr, k * rr);
  const fin = valeurReduiteL(v);
  const brut = `${signe}\\dfrac{${c}\\sqrt{${rr}}}{${k * rr}}`;
  if (k !== 1) L.push(ligne(`=${brut}`));
  if (fin !== brut) L.push(ligne(`=${fin}`, "on simplifie la fraction"));
  return L;
}

function etapeC(e: E): EtapeCorrection[] {
  const ex = nomExt(e);
  const it = nomInt(e);
  return [
    utilise("c", [t("On applique "), f(ex), t(" à la valeur intermédiaire : "), f(`${composeeL(e)}=${ex}(${e.m})`), t(" ; on donne la valeur exacte, simplifiée.")]),
    calcul("c", dedoublonner(lignesValeur(e))),
    resultat("c", reponse(e, "valeur")),
    piege("c", [t("Calculer "), f(`(${it}\\circ ${ex})(${e.a})`), t(" : l'ordre compte, en général "), f(`${ex}\\circ ${it}\\neq ${it}\\circ ${ex}`), t(".")]),
  ];
}

export function correctionDetailleeComposeePoint(e: E): EtapeCorrection[] {
  return [...etapeA(e), ...etapeB(e), ...(e.existe ? etapeC(e) : [])];
}
