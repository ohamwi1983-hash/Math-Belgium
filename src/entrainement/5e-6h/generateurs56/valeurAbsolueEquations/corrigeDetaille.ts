import type { EtapeCorrection, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import { borneRacine } from "../communReels/ensemblesExacts";
import { q, qL } from "../communReels/outilsReels";
import type { Q } from "../communReels/outilsReels";
import type { ExerciceAbsolue } from "./core/types";
import { absL, affineL, AL, BL, enonceL, estPetit, reponse, sGrand, sPetit } from "./ui/format";

/**
 * Corrigé détaillé « comme au tableau » de `56gen18`, une lettre par écran : a) traduction sans valeur
 * absolue (méthode du cours, cas selon le signe de c) ; b) résolution ligne à ligne (une transformation
 * par ligne, sens changé en divisant par un négatif), ensemble des solutions, vérification. deuxAbsolues :
 * a) A = B, b) A = −B, c) réunion.
 */

type E = ExerciceAbsolue;
const t = texte;
const f = latex;
const COURS = "(cours, point 4)";
const ajoute = (b: number) => (b > 0 ? `on retranche ${b}` : `on ajoute ${-b}`);
const INVERSE: Record<string, string> = { "<": ">", ">": "<", "\\leq": "\\geq ", "\\geq": "\\leq " };
const inverse = (s: string): string => INVERSE[s.trim()];

/** a x + b ◇ r résolue : « 3x+1=5 », « 3x=4 », « x=4/3 ». */
function lignesPremierDegre(a: number, b: number, rel: string, r: number): LigneCalcul[] {
  const L: LigneCalcul[] = [ligne(`${affineL(a, b)}${rel}${r}`)];
  if (b !== 0) L.push(ligne(`${affineL(a, 0)}${rel}${r - b}`, ajoute(b)));
  if (a !== 1) {
    const relF = a < 0 && rel !== "=" ? inverse(rel) : rel;
    L.push(ligne(`x${relF}${qL(q(r - b, a))}`, a < 0 ? (rel === "=" ? `on divise par ${a}` : `on divise par ${a} (négatif) : le sens change`) : `on divise par ${a}`));
  }
  return L;
}

function corrigeEquationOuInequation(e: E): EtapeCorrection[] {
  const A = AL(e);
  const k = Math.abs(e.c);
  const lignesA: LigneCalcul[] = [];
  const lignesB: LigneCalcul[] = [];
  let utiliseA: string;
  let piegeA: string;
  if (e.signe === "negatif") {
    lignesA.push(ligne(`${absL(A)}\\geq 0>${e.c}`, "une valeur absolue n'est jamais négative"));
    utiliseA = `Une valeur absolue est toujours positive ou nulle ${COURS}.`;
    piegeA = "Traduire par « A = c ou A = −c » sans regarder le signe de c.";
    const tous = e.variante === "inequation" && !estPetit(e);
    lignesB.push(ligne(`${enonceL(e)}`, tous ? "vrai pour tout réel x" : "faux pour tout réel x"));
  } else if (e.signe === "nul") {
    utiliseA = `|A| = 0 équivaut à A = 0, et |A| > 0 à A ≠ 0 ${COURS}.`;
    piegeA = "Croire qu'une valeur absolue ne peut jamais être nulle.";
    const x0 = q(-e.b, e.a);
    if (e.symbole === "=" || e.symbole === "\\leq") {
      lignesA.push(ligne(`${enonceL(e)}\\iff ${A}=0`, e.symbole === "=" ? "|A| = 0 ⟺ A = 0" : "|A| ≥ 0 : seul |A| = 0 convient"));
      lignesB.push(...lignesPremierDegre(e.a, e.b, "=", 0));
    } else if (e.symbole === ">") {
      lignesA.push(ligne(`${enonceL(e)}\\iff ${A}\\neq 0`, "|A| > 0 dès que A ≠ 0"));
      lignesB.push(ligne(`${A}=0\\iff x=${qL(x0)}`, "valeur à exclure"));
    } else if (e.symbole === "<") {
      lignesA.push(ligne(`${absL(A)}\\geq 0`, "jamais strictement négatif"));
      lignesB.push(ligne(`${enonceL(e)}`, "faux pour tout réel x"));
    } else {
      lignesA.push(ligne(`${absL(A)}\\geq 0`, "toujours vrai"));
      lignesB.push(ligne(`${enonceL(e)}`, "vrai pour tout réel x"));
    }
  } else if (e.variante === "equation") {
    utiliseA = `Pour c > 0, |A| = c équivaut à A = c ou A = −c ${COURS}.`;
    piegeA = "N'écrire qu'un des deux cas.";
    lignesA.push(ligne(`${enonceL(e)}\\iff ${A}=${k}\\ \\text{ou}\\ ${A}=-${k}`, "deux nombres ont la valeur absolue c"));
    lignesB.push(...lignesPremierDegre(e.a, e.b, "=", k), ...lignesPremierDegre(e.a, e.b, "=", -k));
  } else if (estPetit(e)) {
    utiliseA = `Pour c > 0, |A| < c équivaut à −c < A < c (avec ≤ : bornes comprises) ${COURS}.`;
    piegeA = "Prendre l'extérieur de l'intervalle : |A| petit veut dire A proche de 0.";
    const s = sPetit(e);
    lignesA.push(ligne(`${enonceL(e)}\\iff -${k}${s}${A}${s}${k}`, "distance de A à 0 au plus c"));
    const g = q(-k - e.b, e.a);
    const d = q(k - e.b, e.a);
    lignesB.push(ligne(`-${k}${s}${A}${s}${k}`));
    if (e.b !== 0) lignesB.push(ligne(`${-k - e.b}${s}${affineL(e.a, 0)}${s}${k - e.b}`, ajoute(e.b)));
    if (e.a > 0) {
      if (e.a !== 1) lignesB.push(ligne(`${qL(g)}${s}x${s}${qL(d)}`, `on divise par ${e.a}`));
    } else {
      lignesB.push(ligne(`${qL(g)}${inverse(s)}x${inverse(s)}${qL(d)}`, `on divise par ${e.a} (négatif) : les sens changent`));
      lignesB.push(ligne(`${qL(d)}${s}x${s}${qL(g)}`, "dans l'ordre croissant"));
    }
  } else {
    utiliseA = `Pour c > 0, |A| > c équivaut à A < −c ou A > c (avec ≥ : bornes comprises) ${COURS}.`;
    piegeA = "Écrire −c > A > c : c'est impossible, la solution est formée de deux morceaux.";
    lignesA.push(ligne(`${enonceL(e)}\\iff ${A}${sPetit(e)}-${k}\\ \\text{ou}\\ ${A}${sGrand(e)}${k}`, "A loin de 0, d'un côté ou de l'autre"));
    lignesB.push(...lignesPremierDegre(e.a, e.b, sPetit(e), -k), ...lignesPremierDegre(e.a, e.b, sGrand(e), k));
  }
  const etapes: EtapeCorrection[] = [
    utilise("a", [t(utiliseA)]),
    calcul("a", lignesA),
    resultat("a", reponse(e, "traduire")),
    piege("a", [t(piegeA)]),
    utilise("b", [t("Premier degré : une transformation par ligne ; diviser par un nombre négatif change le sens d'une inégalité. Ensemble écrit avec des accolades ou des intervalles.")]),
    calcul("b", lignesB),
    resultat("b", reponse(e, "ensemble")),
  ];
  // Vérification : une solution remplacée dans l'énoncé (équation), ou une valeur de S (inéquation).
  const test = valeurTest(e);
  if (test) etapes.push(verification("b", [t("Avec "), f(`x=${test.xL}`), t(", qui est dans S :")], [ligne(`${absL(test.substitue)}=${absL(test.dedans)}`), ligne(`=${test.resultat}`, test.conclusion)]));
  etapes.push(piege("b", [t(e.a < 0 ? "Oublier de changer le sens de l'inégalité en divisant par un nombre négatif." : "Se tromper de crochet : borne comprise pour ≤ et ≥, exclue pour < et >.")]));
  return etapes;
}

/** Une valeur de S (entière si possible) et le calcul de |A| en ce point. */
function valeurTest(e: E): { xL: string; substitue: string; dedans: string; resultat: string; conclusion: ReturnType<typeof f>[] } | null {
  if (e.solutions.length === 0) return null;
  let x: Q | null = null;
  const premier = e.solutions[0];
  if (premier.g.v === premier.d.v) {
    // Point : la solution elle-même (rationnelle).
    const cand = [-12, -11, -10, -9, -8, -7, -6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].find((n) => Math.abs(n - premier.g.v) < 1e-9);
    if (cand !== undefined) x = q(cand);
    else
      for (let d = 2; d <= 8 && !x; d++) {
        const n = Math.round(premier.g.v * d);
        if (Math.abs(n / d - premier.g.v) < 1e-9) x = q(n, d);
      }
  } else {
    for (let n = Math.ceil(premier.g.v === -Infinity ? premier.d.v - 3 : premier.g.v); n <= (premier.d.v === Infinity ? premier.g.v + 3 : premier.d.v); n++) {
      const dans = (n > premier.g.v || (premier.gF && n === premier.g.v)) && (n < premier.d.v || (premier.dF && n === premier.d.v));
      if (dans && Number.isFinite(n)) {
        x = q(n);
        break;
      }
    }
  }
  if (!x) return null;
  const xl = qL(x);
  const par = x.n < 0 || x.d !== 1 ? `\\left(${xl}\\right)` : xl;
  const substitue = `${e.a === 1 ? "" : e.a === -1 ? "-" : `${e.a}\\cdot `}${par}${e.b === 0 ? "" : e.b > 0 ? `+${e.b}` : `${e.b}`}`;
  const dedans = q(e.a * x.n + e.b * x.d, x.d);
  const absV = q(Math.abs(dedans.n), dedans.d);
  const rel = e.symbole === "=" ? "=" : e.symbole;
  return { xL: xl, substitue, dedans: qL(dedans), resultat: qL(absV), conclusion: [t("et "), f(`${qL(absV)}${rel}${e.c}`)] };
}

function corrigeDeuxAbsolues(e: E): EtapeCorrection[] {
  const A = AL(e);
  const B = BL(e);
  const lignesA: LigneCalcul[] = [ligne(`${A}=${B}`), ligne(`${affineL(e.a - e.c, 0)}=${e.d - e.b}`, "termes en x à gauche, nombres à droite"), ...(e.a - e.c !== 1 ? [ligne(`x=${qL(e.x1!)}`, `on divise par ${e.a - e.c}`)] : [])];
  const lignesB: LigneCalcul[] = [ligne(`${A}=-(${B})`), ligne(`${A}=${affineL(-e.c, -e.d)}`, "on distribue le signe −"), ligne(`${affineL(e.a + e.c, 0)}=${-e.d - e.b}`, "termes en x à gauche, nombres à droite"), ...(e.a + e.c !== 1 ? [ligne(`x=${qL(e.x2!)}`, `on divise par ${e.a + e.c}`)] : [])];
  const x1 = e.x1!;
  const vA = q(e.a * x1.n + e.b * x1.d, x1.d);
  const vB = q(e.c * x1.n + e.d * x1.d, x1.d);
  return [
    utilise("a", [t(`Deux nombres de même valeur absolue sont égaux ou opposés : |A| = |B| ⟺ A = B ou A = −B ${COURS}.`)]),
    calcul("a", lignesA),
    resultat("a", reponse(e, "egaux")),
    piege("a", [t("Résoudre seulement A = B et oublier le cas opposé.")]),
    utilise("b", [t("Second cas : A = −B ; le signe « − » porte sur toute l'expression B.")]),
    calcul("b", lignesB),
    resultat("b", reponse(e, "opposes")),
    piege("b", [t("Écrire −B en changeant le signe d'un seul terme.")]),
    utilise("c", [t("L'ensemble des solutions réunit les solutions des deux cas.")]),
    calcul("c", [ligne(`${enonceL(e)}\\iff x=${qL(e.x1!)}\\ \\text{ou}\\ x=${qL(e.x2!)}`)]),
    resultat("c", reponse(e, "ensemble")),
    verification("c", [t("Avec "), f(`x=${qL(x1)}`), t(" : les deux expressions valent "), f(qL(vA)), t(" et "), f(qL(vB)), t(", de même valeur absolue.")], [ligne(`${absL(qL(vA))}=${absL(qL(vB))}`)]),
    piege("c", [t("Oublier une des deux solutions dans l'ensemble.")]),
  ];
}

function corrigeCarre(e: E): EtapeCorrection[] {
  const k = e.a;
  const c = e.c;
  const s = sPetit(e);
  const S = sGrand(e);
  const r1 = borneRacine(k - c, 1).L;
  const r2 = borneRacine(k + c, 1).L;
  const lignesA: LigneCalcul[] = estPetit(e)
    ? [ligne(`${enonceL(e)}\\iff -${c}${s}x^{2}-${k}${s}${c}`, "|A| < c ⟺ −c < A < c"), ligne(`${k - c}${s}x^{2}${s}${k + c}`, `on ajoute ${k}`)]
    : [ligne(`${enonceL(e)}\\iff x^{2}-${k}${s}-${c}\\ \\text{ou}\\ x^{2}-${k}${S}${c}`, "|A| > c ⟺ A < −c ou A > c"), ligne(`x^{2}${s}${k - c}\\ \\text{ou}\\ x^{2}${S}${k + c}`, `on ajoute ${k}`)];
  const lignesB: LigneCalcul[] = estPetit(e)
    ? [
        ligne(`x^{2}${S}${k - c}\\iff x${s}-${r1}\\ \\text{ou}\\ x${S}${r1}`, "x² > m ⟺ |x| > √m"),
        ligne(`x^{2}${s}${k + c}\\iff -${r2}${s}x${s}${r2}`, "x² < m ⟺ |x| < √m"),
      ]
    : [
        ligne(`x^{2}${s}${k - c}\\iff -${r1}${s}x${s}${r1}`, "x² < m ⟺ |x| < √m"),
        ligne(`x^{2}${S}${k + c}\\iff x${s}-${r2}\\ \\text{ou}\\ x${S}${r2}`, "x² > m ⟺ |x| > √m"),
      ];
  return [
    utilise("a", [t(`On traite A = x² − ${k} comme un tout : pour c > 0, |A| < c ⟺ −c < A < c et |A| > c ⟺ A < −c ou A > c ${COURS}.`)]),
    calcul("a", lignesA),
    resultat("a", reponse(e, "traduire")),
    piege("a", [t(`Oublier d'ajouter ${k} à chaque membre, ou ne garder qu'une des deux conditions.`)]),
    utilise("b", [t("x² < m ⟺ −√m < x < √m et x² > m ⟺ x < −√m ou x > √m (m > 0), car √(x²) = |x| ; on garde les x qui vérifient les deux conditions (« et ») ou l'une d'elles (« ou »).")]),
    calcul("b", lignesB, [t(estPetit(e) ? "Les deux conditions à la fois :" : "L'une ou l'autre condition :")]),
    resultat("b", reponse(e, "ensemble")),
    piege("b", [t("Oublier les solutions négatives : "), f("x^{2}=(-x)^{2}"), t(".")]),
  ];
}

export function correctionDetailleeAbsolue(e: E): EtapeCorrection[] {
  if (e.variante === "deuxAbsolues") return corrigeDeuxAbsolues(e);
  if (e.variante === "carre") return corrigeCarre(e);
  return corrigeEquationOuInequation(e);
}

