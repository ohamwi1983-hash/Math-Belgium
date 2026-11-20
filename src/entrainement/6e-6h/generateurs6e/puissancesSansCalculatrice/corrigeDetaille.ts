import type { EtapeCorrection, FragmentConsigne, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import type { ExerciceComparer, ExerciceInverse, ExercicePuissances, ExerciceSimplifier } from "../../core6e/puissancesSansCalculatrice.types";
import {
  baseDecimaleL,
  baseL,
  COURS_PUISSANCES,
  expressionInverseL,
  expressionSimplifierL,
  exposantInverseL,
  exposantsSimplifier,
  puissanceComparerL,
  puissanceExacte,
  reponse,
  sommeRacL,
  valeurInverse,
} from "../../ui6e/formatPuissancesSansCalculatrice";
import { affineL, coefL, decL, parN, qL, termeL } from "../../ui6e/nombresExp";

/**
 * Corrigé détaillé « comme au tableau » de 6gen146, une lettre par écran : simplifier / inverse :
 * a) une seule puissance de a (règles (1), (2), (4), bases réécrites), b) valeur exacte (et, pour
 * `inverse`, vérification sur l'expression de départ) ; comparer : a) ordre des exposants par les
 * carrés (ou π ≈ 3,1416), b) sens de variation, c) conclusion, contrôlée à la calculatrice.
 */

type E = ExercicePuissances;
const t = texte;
const f = latex;

/** Retire une ligne identique à la précédente (exposant déjà simplifié). */
function sansDoublons(lignes: LigneCalcul[]): LigneCalcul[] {
  return lignes.filter((l, i) => i === 0 || l.latex.replace(/^=/, "") !== lignes[i - 1].latex.replace(/^.*=/, ""));
}

/** p + s écrit sans terme nul. */
function sommeEntiers(p: number, s: number): string {
  return p === 0 ? `${s}` : `${p}${termeL(s)}`;
}

/** m·x₀ dans un exposant (« 3\\cdot(−2) », « −2 », « 4 »). */
function produitSubst(m: number, x0: number): string {
  if (m === 1) return parN(x0);
  if (m === -1) return `-${parN(x0)}`;
  return `${m}\\cdot ${parN(x0)}`;
}

function lignesPuissanceEntiere(a: number, n: number): LigneCalcul[] {
  if (n === 1) return [ligne(`${a}^{1}=${a}`)];
  if (n > 1) return [ligne(`${a}^{${n}}=${Array(n).fill(a).join("\\cdot ")}`, "n facteurs égaux"), ligne(`=${a ** n}`)];
  const m = -n;
  const l: LigneCalcul[] = [ligne(`${a}^{${n}}=\\dfrac{1}{${a}^{${m}}}`, [t("exposant négatif : "), f("a^{-n}=\\dfrac{1}{a^{n}}")])];
  l.push(ligne(`=\\dfrac{1}{${a ** m}}`, m > 1 ? [f(`${a}^{${m}}=${a ** m}`)] : undefined));
  return l;
}

function etapesSimplifier(e: ExerciceSimplifier): EtapeCorrection[] {
  const [u, v] = exposantsSimplifier(e);
  const a = e.a;
  const expr = expressionSimplifierL(e);
  const rac = `\\sqrt{${e.k}}`;
  let lignes: LigneCalcul[];
  let regle: FragmentConsigne[];
  let piegeA: FragmentConsigne[];
  switch (e.sousType) {
    case "produit":
      regle = [t("Règle (1) : "), f("a^{r}\\cdot a^{s}=a^{r+s}"), t(`, pour tous exposants réels ${COURS_PUISSANCES}.`)];
      lignes = [ligne(`${expr}=${a}^{(${u})+(${v})}`, "règle (1) : on additionne les exposants"), ligne(`=${a}^{${sommeEntiers(e.p, e.s)}}`, [t("les termes en "), f(rac), t(" se compensent")]), ligne(`=${a}^{${e.n}}`)];
      piegeA = [t("Multiplier les exposants : "), f("a^{r}\\cdot a^{s}"), t(" n'est pas "), f("a^{r\\cdot s}"), t(".")];
      break;
    case "quotient":
      regle = [t("Règle (2) : "), f("\\dfrac{a^{r}}{a^{s}}=a^{r-s}"), t(`, pour tous exposants réels ${COURS_PUISSANCES}.`)];
      lignes = [ligne(`${expr}=${a}^{(${u})-(${v})}`, "règle (2) : on soustrait l'exposant du dénominateur"), ligne(`=${a}^{${sommeEntiers(e.p, -e.s)}}`, [t("les termes en "), f(rac), t(" se compensent")]), ligne(`=${a}^{${e.n}}`)];
      piegeA = [t("Oublier les parenthèses : c'est tout l'exposant "), f(v), t(" qu'on retranche.")];
      break;
    case "puissance":
      regle = [t("Règle (4) : "), f("\\left(a^{r}\\right)^{s}=a^{r\\cdot s}"), t(`, pour tous exposants réels ${COURS_PUISSANCES}.`)];
      lignes = [ligne(`${expr}=${a}^{${rac}\\cdot ${coefL(e.r) === "-" ? "(-" + rac + ")" : coefL(e.r) + rac}}`, "règle (4) : on multiplie les exposants"), ligne(`=${a}^{${parN(e.r)}\\cdot ${e.k}}`, [f(`${rac}\\cdot ${rac}=${e.k}`)]), ligne(`=${a}^{${e.n}}`)];
      piegeA = [t("Additionner les exposants : "), f("\\left(a^{r}\\right)^{s}"), t(" n'est pas "), f("a^{r+s}"), t(".")];
      break;
    case "base": {
      const c = a * a;
      const u2 = sommeRacL(0, 2 * e.r, e.k);
      regle = [t("On écrit "), f(`${c}=${a}^{2}`), t(", puis règles (4) et (1) : "), f("\\left(a^{r}\\right)^{s}=a^{r\\cdot s}"), t(", "), f("a^{r}\\cdot a^{s}=a^{r+s}"), t(` ${COURS_PUISSANCES}.`)];
      lignes = [
        ligne(`${c}^{${u}}=\\left(${a}^{2}\\right)^{${u}}`, [f(`${c}=${a}^{2}`)]),
        ligne(`=${a}^{${u2}}`, "règle (4) : on multiplie les exposants"),
        ligne(`${expr}=${a}^{${u2}}\\cdot ${a}^{${v}}`, "on remplace"),
        ligne(`=${a}^{(${u2})+(${v})}`, "règle (1)"),
        ligne(`=${a}^{${e.n}}`, [t("les termes en "), f(rac), t(" se compensent")]),
      ];
      piegeA = [t("Garder "), f(`${c}`), t(" comme s'il valait "), f(`${a}`), t(" : "), f(`${c}^{u}=${a}^{2u}`), t(".")];
      break;
    }
  }
  const valeur = puissanceExacte(a, e.n);
  return [
    utilise("a", regle),
    calcul("a", sansDoublons(lignes)),
    resultat("a", reponse(e, "exposant")),
    piege("a", piegeA),
    utilise("b", [t("Puissance d'exposant entier"), ...(e.n < 0 ? [t(" ; un exposant négatif donne un inverse : "), f("a^{-n}=\\dfrac{1}{a^{n}}")] : []), t(".")]),
    calcul("b", lignesPuissanceEntiere(a, e.n)),
    resultat("b", [f(`E=${qL(valeur)}`)]),
    piege("b", e.n < 0 ? [t("Écrire "), f(`-${a ** -e.n}`), t(" : un exposant négatif ne rend pas le nombre négatif.")] : [t("Confondre "), f(`${a}^{${e.n}}`), t(" et "), f(`${a}\\times ${e.n}`), t(".")]),
  ];
}

function lignesExposants(e: ExerciceComparer): LigneCalcul[] {
  const g = e.gauche;
  const d = e.droite;
  if (e.genre === "pi") {
    const dec = g.latex === "\\pi" ? d : g;
    const piAGauche = g.latex === "\\pi";
    const relPi = Math.PI > dec.valeur ? ">" : "<";
    return [ligne("\\pi\\approx 3{,}14159", "valeur du cours"), ligne(`3{,}14159${relPi}${dec.latex}`, piAGauche ? undefined : "on compare chiffre par chiffre")];
  }
  const carre = (x: typeof g): LigneCalcul[] => {
    if (e.genre === "egaux" && !x.latex.startsWith("\\sqrt")) {
      const m = e.m!;
      return [ligne(`\\left(${x.latex}\\right)^{2}=${m}^{2}\\cdot ${e.k}`, [f("(m\\sqrt{k})^{2}=m^{2}\\cdot k")]), ligne(`=${x.carreLatex}`)];
    }
    return [ligne(`\\left(${x.latex}\\right)^{2}=${x.carreLatex}`)];
  };
  const relCarres = e.relationExposants;
  return [...carre(g), ...carre(d), ligne(`${g.carreLatex}${relCarres}${d.carreLatex}`, e.genre === "egaux" ? "mêmes carrés, deux nombres positifs : égaux" : "deux nombres positifs sont rangés comme leurs carrés")];
}

/** Valeur approchée à 5 chiffres significatifs (au plus 4 décimales). */
function approx4(v: number): string {
  const dec = Math.max(0, Math.min(4, 4 - Math.floor(Math.log10(Math.abs(v)))));
  return decL(Math.round(v * 10 ** dec) / 10 ** dec, dec);
}

function etapesComparer(e: ExerciceComparer): EtapeCorrection[] {
  const A = puissanceComparerL(e, "gauche");
  const B = puissanceComparerL(e, "droite");
  const base = e.base.latex;
  const va = e.base.valeur ** e.gauche.valeur;
  const vb = e.base.valeur ** e.droite.valeur;
  return [
    utilise("a", e.genre === "pi" ? [t("Une valeur approchée de "), f("\\pi"), t(" suffit pour le comparer à un décimal à un ou deux chiffres après la virgule.")] : [t("Deux nombres positifs sont rangés dans le même ordre que leurs carrés : on compare les carrés, sans calculatrice.")]),
    calcul("a", lignesExposants(e)),
    resultat("a", reponse(e, "exposants")),
    utilise("b", [t("La fonction "), f("x\\mapsto a^{x}"), t(" est croissante si "), f("a>1"), t(", décroissante si "), f("0<a<1"), t(` ${COURS_PUISSANCES}.`)]),
    calcul("b", [ligne(`${base}${e.croissante ? ">" : "<"}1`, e.croissante ? "la base est plus grande que 1" : "la base est comprise entre 0 et 1")]),
    resultat("b", reponse(e, "sens")),
    utilise("c", [t("Une fonction croissante conserve l'ordre ; une fonction décroissante l'inverse.")]),
    calcul("c", [
      ligne(`${e.gauche.latex}${e.relationExposants}${e.droite.latex}`, "ordre des exposants (étape 1)"),
      ligne(`${A}${e.relation}${B}`, e.relation === "=" ? "mêmes exposants : mêmes puissances" : e.croissante ? [f(`x\\mapsto ${baseL(base)}^{x}`), t(" croissante : même ordre")] : [f(`x\\mapsto ${baseL(base)}^{x}`), t(" décroissante : ordre inversé")]),
    ]),
    resultat("c", [f(`A${e.relation}B`), t(", c'est-à-dire "), ...reponse(e, "conclusion")]),
    verification("c", [t("Contrôle à la calculatrice (après coup) :")], [ligne(`${A}\\approx ${approx4(va)}`), ligne(`${B}\\approx ${approx4(vb)}`)]),
    piege("c", e.croissante ? [t("Inverser l'ordre alors que la base est plus grande que 1.")] : [t("Garder l'ordre des exposants : avec une base entre 0 et 1, il s'inverse.")]),
  ];
}

/** Expression de départ, x remplacé par x₀ (vérification de la valeur). */
function expressionInverseEnL(e: ExerciceInverse): string {
  const x = e.x0;
  const unSurA = `\\left(\\dfrac{1}{${e.a}}\\right)`;
  switch (e.sousType) {
    case "inverse":
      return `${unSurA}^{${e.p - e.i * x}}`;
    case "produit":
      return `${unSurA}^{${e.i * x}}\\cdot ${e.a ** e.j}^{${x}}`;
    case "quotient":
      return `\\dfrac{${e.a ** e.j}^{${x}}}{${e.a}^{${x + e.p}}}`;
    case "decimale":
      return `\\left(${baseDecimaleL(e.a, e.i)}\\right)^{${x}}\\cdot ${e.a ** e.j}^{${x}}`;
  }
}

function etapesInverse(e: ExerciceInverse): EtapeCorrection[] {
  const a = e.a;
  const expr = expressionInverseL(e);
  const fin = exposantInverseL(e);
  const unSurA = `\\left(\\dfrac{1}{${a}}\\right)`;
  const c = a ** e.j;
  const lignes: LigneCalcul[] = [];
  switch (e.sousType) {
    case "inverse": {
      const u = affineL(-e.i, e.p);
      lignes.push(ligne(`${expr}=\\left(${a}^{-1}\\right)^{${u}}`, [f(`\\dfrac{1}{${a}}=${a}^{-1}`)]));
      lignes.push(ligne(`=${a}^{-(${u})}`, "règle (4) : on multiplie les exposants"));
      lignes.push(ligne(`=${a}^{${fin}}`, "on distribue le signe −"));
      break;
    }
    case "produit":
    case "decimale": {
      const d = e.sousType === "produit" ? `${unSurA}^{${coefL(e.i)}x}` : `\\left(${baseDecimaleL(a, e.i)}\\right)^{x}`;
      if (e.sousType === "produit") lignes.push(ligne(`${d}=\\left(${a}^{-1}\\right)^{${coefL(e.i)}x}`, [f(`\\dfrac{1}{${a}}=${a}^{-1}`)]));
      else lignes.push(ligne(`${d}=\\left(${a}^{-${e.i}}\\right)^{x}`, [f(`${baseDecimaleL(a, e.i)}=\\dfrac{1}{${a ** e.i}}=${a}^{-${e.i}}`)]));
      lignes.push(ligne(`=${a}^{${coefL(-e.i)}x}`, "règle (4)"));
      lignes.push(ligne(`${c}^{x}=\\left(${a}^{${e.j}}\\right)^{x}`, [f(`${c}=${a}^{${e.j}}`)]));
      lignes.push(ligne(`=${a}^{${e.j}x}`, "règle (4)"));
      lignes.push(ligne(`${expr}=${a}^{${coefL(-e.i)}x}\\cdot ${a}^{${e.j}x}`, "on remplace"));
      lignes.push(ligne(`=${a}^{${coefL(-e.i)}x+${e.j}x}`, "règle (1) : on additionne les exposants"));
      lignes.push(ligne(`=${a}^{${fin}}`));
      break;
    }
    case "quotient":
      lignes.push(ligne(`${c}^{x}=\\left(${a}^{${e.j}}\\right)^{x}`, [f(`${c}=${a}^{${e.j}}`)]));
      lignes.push(ligne(`=${a}^{${e.j}x}`, "règle (4)"));
      lignes.push(ligne(`${expr}=\\dfrac{${a}^{${e.j}x}}{${a}^{${affineL(1, e.p)}}}`, "on remplace"));
      lignes.push(ligne(`=${a}^{${e.j}x-(${affineL(1, e.p)})}`, "règle (2) : on soustrait les exposants"));
      lignes.push(ligne(`=${a}^{${fin}}`));
      break;
  }
  const e0 = e.m * e.x0 + e.c;
  const val = valeurInverse(e);
  return [
    utilise("a", [t("On écrit chaque base comme une puissance de "), f(`${a}`), t(" ("), f("\\dfrac{1}{a}=a^{-1}"), t("), puis on applique les règles (4) et (1) ou (2) "), t(`${COURS_PUISSANCES}.`)]),
    calcul("a", lignes),
    resultat("a", reponse(e, "exposant")),
    piege(
      "a",
      e.sousType === "quotient"
        ? [t("Ne retrancher que "), f("x"), t(" : c'est tout l'exposant "), f(affineL(1, e.p)), t(" du dénominateur qu'on soustrait.")]
        : e.sousType === "decimale"
          ? [t("Oublier le signe « − » : "), f(`${baseDecimaleL(a, e.i)}=${a}^{-${e.i}}`), t(", une base plus petite que 1.")]
          : [t("Oublier le signe « − » de "), f(`${a}^{-1}`), t(" : la base "), f(`\\dfrac{1}{${a}}`), t(" est plus petite que 1.")],
    ),
    utilise("b", [t("On remplace "), f("x"), t(" par "), f(`${e.x0}`), t(" dans l'exposant, puis on calcule la puissance entière.")]),
    calcul("b", [
      ...(e.m === 1 && e.c === 0 ? [] : [ligne(`${a}^{${produitSubst(e.m, e.x0)}${termeL(e.c)}}=${a}^{${e0}}`, [t("on remplace "), f("x"), t(" par "), f(`${e.x0}`)])]),
      ...lignesPuissanceEntiere(a, e0),
    ]),
    resultat("b", [f(`f(${e.x0})=${qL(val)}`)]),
    verification("b", [t("Directement sur l'expression de départ :")], [ligne(`${expressionInverseEnL(e)}=${qL(val)}`)]),
    piege("b", [t("Calculer "), f(`${a}\\times ${parN(e0)}`), t(" au lieu de la puissance "), f(`${a}^{${e0}}`), t(".")]),
  ];
}

export function correctionDetailleePuissances(e: E): EtapeCorrection[] {
  if (e.variante === "simplifier") return etapesSimplifier(e);
  if (e.variante === "comparer") return etapesComparer(e);
  return etapesInverse(e);
}
