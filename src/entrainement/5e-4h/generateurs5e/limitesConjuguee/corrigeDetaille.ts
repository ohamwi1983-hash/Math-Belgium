import type { EtapeCorrection, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import type { ExerciceConjuguee } from "../../core5e/limitesConjuguee";
import { cible, fonction, forme, limite, partielles } from "../../core5e/limitesConjuguee";
import { exacteL, extraire, fracL, limL, limiteL, polyL } from "../../ui5e/ecrituresLimitesLotG";
import { aD, abL, apresProduitL, apresSimplificationL, conjL, FORMES, modeSimplification, morceauxL, negatif, produitL, racineDiviseeL, racineE1L, radicandeL, reponse, rL, termesAB } from "../../ui5e/formatLimitesConjuguee";

/**
 * Corrigé détaillé « comme au tableau » de `5gen64`, une lettre par écran : a) limite de chaque
 * morceau et forme ; b) multiplication par l'expression conjuguée, produit remarquable ligne à ligne
 * (ou x² mis en évidence, √(x²) = |x| = −x) ; c) simplification ou division par x, limites du
 * numérateur et du dénominateur ; d) conclusion exacte (dénominateur rendu rationnel) et contrôle
 * numérique f(10⁴) ≈ … Même source que l'écran (`ui5e/formatLimitesConjuguee.ts`).
 */

type E = ExerciceConjuguee;

/** Ligne trop large pour la colonne de droite du calcul (membre de gauche long) : entre accolades,
 * elle n'a plus de « = » de niveau 0 et s'affiche sur toute la largeur (`decouperLigneCalcul`). */
const pleineLargeur = (l: string): string => `{${l}}`;
const t = texte;
const f = latex;

function etapeA(e: E): EtapeCorrection[] {
  const fo = forme(e);
  const m = morceauxL(e);
  const justifs: string[] =
    e.sous === "C" || e.sous === "D"
      ? ["numérateur : on remplace x par la valeur visée", "dénominateur"]
      : e.sous === "E1"
        ? ["le nombre sous la racine tend vers +∞", e.d.p > 0 ? "coefficient de x positif, x → −∞" : "coefficient de x négatif, x → −∞"]
        : ["le nombre sous la racine tend vers +∞", e.sous === "E2" ? "coefficient de x positif, x → −∞" : "x → +∞"];
  const lignes: LigneCalcul[] = m.map((l, i) => ligne(l, justifs[i]));
  const pieges: Record<string, EtapeCorrection> = {
    infMoinsInf: piege("a", [t("Écrire "), f("\\infty-\\infty=0"), t(" : c'est une forme indéterminée, la différence peut tendre vers n'importe quel nombre.")]),
    zeroSurZero: piege("a", [t("Écrire "), f("\\dfrac{0}{0}=0"), t(" ou 1 : c'est une forme indéterminée.")]),
    infSurInf: piege("a", [t("Écrire "), f("\\dfrac{\\infty}{\\infty}=1"), t(" : c'est une forme indéterminée.")]),
  };
  return [
    utilise("a", [t("On calcule la limite de chaque morceau ; "), f("\\infty-\\infty"), t(", "), f("\\dfrac{0}{0}"), t(" et "), f("\\dfrac{\\infty}{\\infty}"), t(" sont des formes indéterminées (cours, § 1).")]),
    calcul("a", lignes),
    resultat("a", [t("Forme indéterminée "), ...FORMES[fo]]),
    pieges[fo]!,
  ];
}

function etapeB(e: E): EtapeCorrection[] {
  const d = e.d;
  if (e.sous === "E1") {
    const R = radicandeL(e);
    const rac = racineE1L(e);
    return [
      utilise("b", [t("On met "), f("x^2"), t(" en évidence sous la racine ; la racine d'un carré est une valeur absolue : "), f("\\sqrt{x^2}=|x|"), t(" (cours, § 1).")]),
      calcul("b", [
        ligne(`\\sqrt{${R}}=\\sqrt{x^2\\left(${rac.slice(6, -1)}\\right)}`, "x² en évidence (x ≠ 0)"),
        ligne(`=\\sqrt{x^2}\\cdot ${rac}`, "racine d'un produit de nombres positifs"),
        ligne(`=|x|${rac}`),
        ligne(`=-x${rac}`, [f("x<0"), t(", donc "), f("|x|=-x")]),
      ]),
      resultat("b", reponse(e, "transformer")),
      piege("b", [t("Écrire "), f("\\sqrt{x^2}=x"), t(" : pour x < 0, "), f("\\sqrt{x^2}=-x"), t(" (une racine n'est jamais négative).")]),
    ];
  }
  const [A, B] = termesAB(e);
  const ab = abL(e);
  const conj = conjL(e);
  const P = produitL(e);
  const deuxRacines = e.sous === "B1" || e.sous === "B2";
  const lignes: LigneCalcul[] = [];
  // Carrés : A² = radicande, B² écrit.
  let a2: string;
  let b2: string;
  switch (e.sous) {
    case "A":
    case "E2":
      a2 = radicandeL(e);
      b2 = `${d.p * d.p === 1 ? "" : d.p * d.p}x^2`;
      break;
    case "B1":
      a2 = polyL([1, d.a]);
      b2 = polyL([1, d.b]);
      break;
    case "B2":
      a2 = polyL([1, d.a, d.c]);
      b2 = polyL([1, d.b, d.d]);
      break;
    case "C":
      a2 = polyL([d.k, d.c]);
      b2 = `${d.c}`;
      break;
    default:
      a2 = polyL([1, d.p]);
      b2 = `${d.n * d.n}`;
  }
  const Bsq = B === "x" || B === "-x" ? "x^2" : /sqrt|x/.test(B) ? `\\left(${B}\\right)^2` : `${B}^2`;
  const b2Paren = /[+-]/.test(b2.slice(1)) ? `\\left(${b2}\\right)` : b2;
  if (e.sous === "C" || e.sous === "D") {
    const den0 = e.sous === "C" ? "x" : `${d.m === 1 ? "" : d.m}\\left(${polyL([1, -aD(e)])}\\right)`;
    lignes.push(ligne(`f(x)=\\dfrac{\\left(${ab}\\right)\\left(${conj}\\right)}{${den0}\\left(${conj}\\right)}`, "on multiplie et on divise par la conjuguée du numérateur"));
    lignes.push(ligne(`=\\dfrac{\\left(${A}\\right)^2-${Bsq}}{${den0}\\left(${conj}\\right)}`, [f("(A-B)(A+B)=A^2-B^2")]));
    lignes.push(ligne(`=\\dfrac{${a2}-${b2Paren}}{${den0}\\left(${conj}\\right)}`, "carré d'une racine : le nombre sous la racine"));
    lignes.push(ligne(`=\\dfrac{${P}}{${den0}\\left(${conj}\\right)}`, "on réduit le numérateur"));
  } else if (deuxRacines) {
    // Deux racines : le produit (A − B)(A + B) écrit en entier ne tient pas dans la colonne du
    // calcul ; la multiplication par la conjuguée est annoncée dans l'introduction de la chaîne.
    lignes.push(ligne(`f(x)=\\dfrac{\\left(${A}\\right)^2-${Bsq}}{${conj}}`, [f("(A-B)(A+B)=A^2-B^2")]));
  } else {
    lignes.push(ligne(`f(x)=\\dfrac{\\left(${ab}\\right)\\left(${conj}\\right)}{${conj}}`, "on multiplie et on divise par la conjuguée (non nulle)"));
    lignes.push(ligne(`=\\dfrac{\\left(${A}\\right)^2-${Bsq}}{${conj}}`, [f("(A-B)(A+B)=A^2-B^2")]));
    lignes.push(ligne(`=\\dfrac{${a2}-${b2Paren}}{${conj}}`, e.sous === "B1" || e.sous === "B2" ? "carré d'une racine : le nombre sous la racine" : "carré d'une racine ; le coefficient de x est aussi élevé au carré"));
    lignes.push(ligne(`=\\dfrac{${P}}{${conj}}`, "on réduit le numérateur"));
  }
  return [
    utilise("b", [t("Expression conjuguée : celle de "), f("A-B"), t(" est "), f("A+B"), t(" ; leur produit est le produit remarquable "), f("(A-B)(A+B)=A^2-B^2"), t(", qui fait disparaître la racine (cours, § 1).")]),
    calcul("b", lignes, deuxRacines ? [t("On multiplie et on divise "), f("f(x)"), t(" par la conjuguée "), f(conj), t(" (non nulle) :")] : []),
    resultat("b", reponse(e, "transformer")),
    piege("b", [t("Multiplier seulement le numérateur par la conjuguée : on multiplie et on divise, sinon la fonction change.")]),
  ];
}

function etapeC(e: E): EtapeCorrection[] {
  const d = e.d;
  const L = limL(cible(e));
  const m = modeSimplification(e);
  const [n, den] = partielles(e);
  const ap = apresProduitL(e);
  const as = apresSimplificationL(e);
  const lignes: LigneCalcul[] = [];
  let usage: ReturnType<typeof t>[];
  let pg: ReturnType<typeof t>[];
  if (m === "simplifier") {
    const facteur = e.sous === "C" ? "x" : polyL([1, -aD(e)]);
    usage = [t("Le facteur "), f(facteur), t(" qui s'annule est au numérateur et au dénominateur : on le simplifie (il n'est pas nul tant que "), f(e.sous === "C" ? "x\\neq 0" : `x\\neq ${aD(e)}`), t("), puis on remplace x par la valeur visée (cours, § 1).")];
    lignes.push(ligne(`f(x)=\\dfrac{${ap.num}}{${ap.den}}`));
    lignes.push(ligne(`=\\dfrac{${as.num}}{${as.den}}`, [t("on simplifie par "), f(facteur)]));
    lignes.push(ligne(`${L}${as.num}=${as.num}`, "constante"));
    const r = e.sous === "C" ? rL(e) : `${d.n}`;
    const somme = `${r}+${r}`;
    const total = e.sous === "C" ? (Number.isInteger(Math.sqrt(d.c)) ? `${2 * Math.sqrt(d.c)}` : `2\\sqrt{${d.c}}`) : `${2 * d.n}`;
    if (e.sous === "D" && d.m !== 1) lignes.push(ligne(`${L}${as.den}=${d.m}\\left(${somme}\\right)=${2 * d.m * d.n}`, [t("on remplace x par "), f(`${aD(e)}`)]));
    else lignes.push(ligne(`${L}\\left(${as.den}\\right)=${somme}=${total}`, [t("on remplace x par "), f(e.sous === "C" ? "0" : `${aD(e)}`)]));
    pg = [t("Remplacer x avant de simplifier : on retombe sur "), f("\\dfrac{0}{0}"), t(".")];
  } else if (m === "direct") {
    usage = [t("Le numérateur est un nombre fixe ; le dénominateur est une somme de deux racines qui tendent vers "), f("+\\infty"), t(" (cours, § 1).")];
    lignes.push(ligne(`f(x)=\\dfrac{${ap.num}}{${ap.den}}`));
    lignes.push(ligne(pleineLargeur(`${L}\\left(${as.den}\\right)=+\\infty`), "somme de deux termes qui tendent vers +∞"));
    pg = [t("Conclure trop vite « "), f("\\infty-\\infty=0"), t(" » : ici le résultat est bien 0, mais il faut le démontrer.")];
  } else if (e.sous === "E1") {
    usage = [t("On divise le numérateur et le dénominateur par x (x < 0) ; "), f("\\dfrac{c}{x}"), t(" et "), f("\\dfrac{c}{x^2}"), t(" tendent vers 0 (cours, § 1).")];
    lignes.push(ligne(`f(x)=\\dfrac{${ap.num}}{${ap.den}}`));
    lignes.push(ligne(`=\\dfrac{${as.num}}{${as.den}}`, "on divise numérateur et dénominateur par x"));
    lignes.push(ligne(`${L}\\left(${as.num}\\right)=-\\sqrt{${d.m * d.m}}=${-d.m}`, [f("\\dfrac{1}{x}"), t(" et "), f("\\dfrac{1}{x^2}"), t(" tendent vers 0")]));
    lignes.push(ligne(`${L}\\left(${as.den}\\right)=${d.p}`, [f(`\\dfrac{${Math.abs(d.q)}}{x}`), t(" tend vers 0")]));
    pg = [t("Oublier le signe « − » apporté par "), f("\\sqrt{x^2}=-x"), t(" : le numérateur tend vers un nombre négatif.")];
  } else {
    const neg = negatif(e);
    usage = [t(`On divise le numérateur et le dénominateur par x, le terme dominant ; x ${neg ? "< 0" : "> 0"}, donc `), f(neg ? "x=-\\sqrt{x^2}" : "x=\\sqrt{x^2}"), t(" pour entrer x sous la racine (cours, § 1).")];
    lignes.push(ligne(`f(x)=\\dfrac{${ap.num}}{${ap.den}}`));
    if (e.sous === "B2") {
      lignes.push(ligne(`\\dfrac{\\sqrt{${polyL([1, d.a, d.c])}}}{x}=\\sqrt{\\dfrac{${polyL([1, d.a, d.c])}}{x^2}}=${racineDiviseeL(1, d.a, d.c)}`, [f("x>0"), t(" : "), f("x=\\sqrt{x^2}")]));
      lignes.push(ligne(`\\dfrac{\\sqrt{${polyL([1, d.b, d.d])}}}{x}=${racineDiviseeL(1, d.b, d.d)}`, "de même"));
    } else {
      const R = radicandeL(e);
      lignes.push(ligne(`\\dfrac{\\sqrt{${R}}}{x}=${neg ? "-" : ""}\\sqrt{\\dfrac{${R}}{x^2}}=${neg ? "-" : ""}${racineDiviseeL(d.p * d.p, d.b, d.c)}`, neg ? [f("x<0"), t(" : "), f("x=-\\sqrt{x^2}")] : [f("x>0"), t(" : "), f("x=\\sqrt{x^2}")]));
    }
    lignes.push(ligne(`f(x)=\\dfrac{${as.num}}{${as.den}}`, "on divise numérateur et dénominateur par x"));
    lignes.push(ligne(`${L}\\left(${as.num}\\right)=${n}`, [t("les termes en "), f("\\dfrac{1}{x}"), t(" tendent vers 0")]));
    const s1 = e.sous === "B2" ? "1+1" : neg ? `-${d.p}-${d.p}` : `${d.p}+${d.p}`;
    lignes.push(ligne(e.sous === "B2" ? pleineLargeur(`${L}\\left(${as.den}\\right)=${s1}=${den}`) : `${L}\\left(${as.den}\\right)=${s1}=${den}`, [t("les termes en "), f("\\dfrac{1}{x}"), t(" et "), f("\\dfrac{1}{x^2}"), t(" tendent vers 0")]));
    pg = neg
      ? [t("Écrire "), f("\\dfrac{\\sqrt{x^2}}{x}=1"), t(" : pour x < 0, il vaut −1.")]
      : [t("Oublier l'un des deux termes du dénominateur : chacun tend vers "), f(e.sous === "B2" ? "1" : `${d.p}`), t(".")];
  }
  return [utilise("c", usage), calcul("c", lignes), resultat("c", reponse(e, "partielles")), piege("c", pg)];
}

/** Valeur numérique de contrôle : f en un point proche de la cible. */
function pointControle(e: E): { xL: string; x: number } {
  const c = cible(e);
  if (c.type === "plus") return { xL: "10^{4}", x: 1e4 };
  if (c.type === "moins") return { xL: "-10^{4}", x: -1e4 };
  const x = c.a + 0.001;
  return { xL: `${x}`.replace(".", "{,}"), x };
}

function etapeD(e: E): EtapeCorrection[] {
  const L = limL(cible(e));
  const [n, den] = partielles(e);
  const lim = limite(e);
  const lignes: LigneCalcul[] = [];
  if (!Number.isFinite(den)) lignes.push(ligne(`${L}f(x)=0`, "un nombre fixe divisé par une quantité qui tend vers +∞"));
  else if (e.sous === "C" && !Number.isInteger(Math.sqrt(e.d.c))) {
    const { c: K, r } = extraire(e.d.c);
    const denL = K === 1 ? `2\\sqrt{${r}}` : `${2 * K}\\sqrt{${r}}`;
    lignes.push(ligne(`${L}f(x)=\\dfrac{${e.d.k}}{${denL}}`, "quotient des limites"));
    lignes.push(ligne(`=\\dfrac{${e.d.k}\\sqrt{${r}}}{${2 * K}\\cdot ${r}}`, [t("on multiplie numérateur et dénominateur par "), f(`\\sqrt{${r}}`)]));
    lignes.push(ligne(`=${exacteL(lim)}`));
  } else {
    lignes.push(ligne(`${L}f(x)=\\dfrac{${limiteL(n)}}{${limiteL(den)}}`, "quotient des limites (dénominateur non nul)"));
    const fin = exacteL(lim);
    const brut = `\\dfrac{${limiteL(n)}}{${limiteL(den)}}`;
    if (fracL(n, den) !== brut) lignes.push(ligne(`=${fin}`, Number.isInteger(n) && Number.isInteger(den) && fracL(n, den) !== `${n / den}` ? "on simplifie" : undefined));
  }
  const pc = pointControle(e);
  const v = fonction(e)(pc.x);
  const vL = v.toFixed(4).replace(".", "{,}");
  return [
    utilise("d", [t("Limite d'un quotient : quotient des limites quand le dénominateur a une limite non nulle ; un nombre fixe divisé par l'infini tend vers 0 (cours, § 1).")]),
    calcul("d", lignes),
    resultat("d", reponse(e, "limite")),
    verification("d", [t("Contrôle numérique : la valeur de f près de la cible est proche de la limite.")], [ligne(`f\\left(${pc.xL}\\right)\\approx ${vL}`)]),
    piege("d", negatif(e) ? [t("Donner "), f(exacteL({ q: { n: -lim.q.n, d: lim.q.d }, r: lim.r })), t(" : c'est le résultat obtenu avec "), f("\\sqrt{x^2}=x"), t(", faux pour x < 0.")] : [t("Laisser une racine au dénominateur, ou une fraction non simplifiée : la valeur exacte se donne simplifiée.")]),
  ];
}

export function correctionDetailleeConjuguee(e: E): EtapeCorrection[] {
  return [...etapeA(e), ...etapeB(e), ...etapeC(e), ...etapeD(e)];
}

