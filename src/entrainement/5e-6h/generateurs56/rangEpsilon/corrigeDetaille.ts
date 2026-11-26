import type { EtapeCorrection, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import { pgcd } from "../../../5e-4h/ui5e/nombresTrigo";
import type { ExerciceFibonacci, ExerciceGeometrique, ExerciceRang, ExerciceRationnelle } from "./index";
import { ecart, fibonacci, valeurEps } from "./index";
import { borneL, borneValeur, COURS_LIMITE, ecartL, ecartNomL, ecartSigneGeoL, ecartValeurL, epsL, inverseEps, limiteL, reponse, termeL } from "./ui/formatRang";
import { affineVarL, fractionL, nbL } from "../nombres56";

/**
 * Corrigé détaillé « comme au tableau » de `56gen22` (cours, étape 9), une lettre par écran.
 * Rationnelle : limite (division par n), écart réduit au même dénominateur, inéquation résolue ligne à
 * ligne en entiers EXACTS (passage aux inverses de nombres positifs), m = ⌊B⌋. Géométrique et Fibonacci :
 * table — écarts aux rangs qui encadrent le seuil —, m = N − 1.
 */

type E = ExerciceRang;
const t = texte;
const f = latex;

/** Écart aux rangs N − 2, N − 1, N (et N + 1 pour montrer qu'il continue de diminuer). */
function lignesTable(e: E, nom: string): LigneCalcul[] {
  const eps = valeurEps(e.eps);
  const out: LigneCalcul[] = [];
  for (let n = Math.max(1, e.N - 2); n <= e.N + 1; n++) {
    const x = ecart(e, n);
    out.push(ligne(`${nom.replace("{n}", `{${n}}`)}${ecartValeurL(x)}`, x >= eps ? [t("rang "), f(`${n}`), t(" : "), f(`\\geq ${epsL(e.eps)}`)] : [t("rang "), f(`${n}`), t(" : "), f(`<${epsL(e.eps)}`)]));
  }
  return out;
}

function etapesRang(e: E, sq: string, lignes: LigneCalcul[]): EtapeCorrection[] {
  return [
    utilise(sq, [t("Définition de la limite : on veut "), f(`${ecartNomL(e)}<\\varepsilon`), t(" pour tout "), f("n>m"), t(` ${COURS_LIMITE} ; le plus petit m est le rang juste avant le premier rang qui convient.`)]),
    calcul(sq, lignes),
    resultat(sq, reponse(e, "rang")),
    verification(sq, [t("Au rang "), f(`${e.m}`), t(", "), f(`${ecartNomL(e, `${e.m}`)}${ecartValeurL(ecart(e, e.m))}`), t(" n'est pas sous "), f(epsL(e.eps)), t(" ; au-delà, l'écart diminue et reste sous "), f(epsL(e.eps)), t(".")]),
    piege(sq, [t("Donner le premier rang qui convient ("), f(`${e.N}`), t(") : la définition dit « n > m ».")]),
  ];
}

function corrigeRationnelle(e: ExerciceRationnelle): EtapeCorrection[] {
  const num = affineVarL(e.a, e.b, "n");
  const den = affineVarL(e.c, e.d, "n");
  const g = pgcd(Math.abs(e.a), e.c);
  const diff = e.b * e.c - e.a * e.d; // numérateur de uₙ − ℓ (sur c(cn + d))
  const K = e.K;
  const inv = inverseEps(e.eps); // 1/ε
  const KsurEps = K * inv;
  const etapeA: EtapeCorrection[] = [
    utilise("a", [t("On divise le numérateur et le dénominateur par n ; "), f("\\dfrac{1}{n}"), t(` tend vers 0 ${COURS_LIMITE}.`)]),
    calcul("a", [
      ligne(`u_n=\\dfrac{${num}}{${den}}=\\dfrac{${e.a}${e.b === 0 ? "" : e.b < 0 ? `-\\frac{${-e.b}}{n}` : `+\\frac{${e.b}}{n}`}}{${e.c}+\\frac{${e.d}}{n}}`, "on divise par n"),
      ligne(`\\lim\\limits_{n\\to+\\infty}u_n=${e.c === 1 ? e.a : `${fractionL(e.a, e.c)}${g !== 1 ? `=${limiteL(e)}` : ""}`}`, [f("\\frac{1}{n}\\to 0")]),
    ]),
    resultat("a", reponse(e, "limite")),
    piege("a", [t("Prendre le quotient des termes constants "), f(fractionL(e.b, e.d)), t(".")]),
  ];
  const pa = e.a < 0 ? `(${e.a})` : `${e.a}`;
  const lignesB: LigneCalcul[] =
    e.c === 1
      ? [
          ligne(`u_n-\\ell=\\dfrac{${num}}{${den}}-${pa}`, "on soustrait la limite"),
          ligne(`=\\dfrac{${num}-${e.a === 1 ? "" : e.a === -1 ? "(-1)" : pa}(${den})}{${den}}`, "même dénominateur"),
          ligne(`=\\dfrac{${diff}}{${den}}`, "les termes en n s'annulent"),
        ]
      : [
          ligne(`u_n-\\ell=\\dfrac{${num}}{${den}}-${e.a < 0 ? `\\left(-\\dfrac{${-e.a}}{${e.c}}\\right)` : `\\dfrac{${e.a}}{${e.c}}`}`, "on soustrait la limite"),
          ligne(`=\\dfrac{${e.c}(${num})-${pa}(${den})}{${e.c}(${den})}`, "même dénominateur"),
          ligne(`=\\dfrac{${diff}}{${e.c}(${den})}`, "les termes en n s'annulent"),
        ];
  lignesB.push(
    ligne(`|u_n-\\ell|=${ecartL(e)}`, diff < 0 ? "valeur absolue : on enlève le signe (dénominateur positif)" : "positif : la valeur absolue ne change rien"),
  );
  const etapeB: EtapeCorrection[] = [
    utilise("b", [t("On réduit au même dénominateur ; le dénominateur est positif pour tout naturel n non nul.")]),
    calcul("b", lignesB),
    resultat("b", reponse(e, "ecart")),
    verification("b", [t("Pour "), f("n=1"), t(" : "), f(`|u_1-\\ell|=\\left|${fractionL((e.a + e.b) / pgcd(Math.abs(e.a + e.b), e.c + e.d), (e.c + e.d) / pgcd(Math.abs(e.a + e.b), e.c + e.d))}-${limiteL(e)}\\right|${ecartValeurL(ecart(e, 1))}`.replace(`-${limiteL(e)}\\right|`, `-${e.a < 0 ? `\\left(${limiteL(e)}\\right)` : limiteL(e)}\\right|`)), t(", comme la formule.")]),
    piege("b", [t(diff < 0 ? "Garder le signe « − » : une valeur absolue est positive (la suite est ici en dessous de sa limite)." : "Oublier de réduire au même dénominateur, ou se tromper de signe dans la soustraction.")]),
  ];
  // Inéquation : K / (c(cn + d)) < ε ⟺ c(cn + d) > K/ε ⟺ cn + d > K/(cε) ⟺ n > B.
  const X1 = KsurEps; // c(cn + d) > X1
  const lignesC: LigneCalcul[] = [ligne(`\\dfrac{${K}}{${e.c === 1 ? den : `${e.c}(${den})`}}<${epsL(e.eps)}`, "inéquation à résoudre"), ligne(`${e.c === 1 ? den : `${e.c}(${den})`}>${K}\\cdot ${inv}=${X1}`, "deux nombres positifs : on passe aux inverses")];
  let a = X1;
  let aDen = 1;
  if (e.c !== 1) {
    const gg = pgcd(X1, e.c);
    a = X1 / gg;
    aDen = e.c / gg;
    lignesC.push(ligne(`${den}>${fractionL(a, aDen)}`, [t("on divise par "), f(`${e.c}`)]));
  }
  // c n > a/aDen − d
  const n1 = a - e.d * aDen;
  const g1 = pgcd(Math.abs(n1), aDen);
  lignesC.push(ligne(`${e.c === 1 ? "n" : `${e.c}n`}>${fractionL(n1 / g1, aDen / g1)}`, [t("on retire "), f(`${e.d}`)]));
  if (e.c !== 1) lignesC.push(ligne(`n>${borneL(e)}`, [t("on divise par "), f(`${e.c}`)]));
  if (e.bDen !== 1) lignesC.push(ligne(`n>${borneL(e)}\\approx ${nbL(borneValeur(e), 2, true)}`, "valeur décimale"));
  const etapeC: EtapeCorrection[] = [
    utilise("c", [t("Les deux membres sont positifs : en passant aux inverses, l'inégalité change de sens ; puis on isole n.")]),
    calcul("c", lignesC),
    resultat("c", reponse(e, "inequation")),
    piege("c", [t("Garder le sens de l'inégalité en passant aux inverses.")]),
  ];
  const B = borneValeur(e);
  const lignesD: LigneCalcul[] =
    e.bDen === 1
      ? [ligne(`n>${e.bNum}`, [t("les rangs qui conviennent : "), f(`n\\geq ${e.bNum + 1}`)]), ligne(`m=${e.m}`, [t("au rang "), f(`${e.bNum}`), t(", l'écart vaut exactement "), f("\\varepsilon")])]
      : [ligne(`n>${nbL(B, 2, true)}`, [t("les rangs qui conviennent : "), f(`n\\geq ${e.N}`)]), ligne(`m=${e.m}`, "rang juste avant")];
  return [...etapeA, ...etapeB, ...etapeC, ...etapesRang(e, "d", lignesD)];
}

function corrigeGeometrique(e: ExerciceGeometrique): EtapeCorrection[] {
  const nom = "|u_{n}-\\ell|";
  const raison = e.forme === "puissance" ? nbL(e.q, 2) : e.forme === "alterne" ? `-\\frac{1}{${e.q}}` : `\\frac{1}{${e.q}}`;
  const etapeA: EtapeCorrection[] = [
    utilise("a", [t("Le terme en n est une suite géométrique de raison "), f(raison), t(`, comprise strictement entre −1 et 1 : il tend vers 0 ${COURS_LIMITE}.`)]),
    calcul("a", [ligne(`\\lim\\limits_{n\\to+\\infty}${ecartSigneGeoL(e)}=0`, "raison entre −1 et 1"), ligne(`\\lim\\limits_{n\\to+\\infty}u_n=${e.ell}`, "il reste la constante")]),
    resultat("a", reponse(e, "limite")),
    piege("a", [t("Croire que la suite tend vers 0 : c'est seulement le terme en n.")]),
  ];
  const etapeB: EtapeCorrection[] = [
    utilise("b", [t("On retire la limite, puis on prend la valeur absolue.")]),
    calcul("b", [ligne(`u_n-\\ell=${termeL(e)}${e.ell === 0 ? "" : e.ell < 0 ? `+${-e.ell}` : `-${e.ell}`}=${ecartSigneGeoL(e)}`, "on retire la limite"), ligne(`|u_n-\\ell|=${ecartL(e)}`, e.k < 0 || e.forme === "alterne" ? "la valeur absolue enlève les signes" : "positif")]),
    resultat("b", reponse(e, "ecart")),
    piege("b", [t(e.forme === "alterne" ? "Garder le facteur " : "Garder le signe « − » : une valeur absolue est positive."), ...(e.forme === "alterne" ? [f("(-1)^n"), t(" : sa valeur absolue vaut 1.")] : [])]),
  ];
  const etapeC: EtapeCorrection[] = [
    utilise("c", [t("Menu Table : "), f(`f(x)=${ecartL(e).replace(/n/g, "x")}`), t(", pas de 1 ; l'écart diminue quand n augmente (raison entre 0 et 1 en valeur absolue).")]),
    calcul("c", lignesTable(e, nom)),
    resultat("c", reponse(e, "premier")),
    piege("c", [t("S'arrêter au premier rang affiché à l'écran où la valeur « semble » petite : compare-la vraiment à "), f(epsL(e.eps)), t(".")]),
  ];
  return [...etapeA, ...etapeB, ...etapeC, ...etapesRang(e, "d", [ligne(`n\\geq ${e.N}`, "rangs qui conviennent"), ligne(`m=${e.N}-1=${e.m}`, "rang juste avant")])];
}

function corrigeFibonacci(e: ExerciceFibonacci): EtapeCorrection[] {
  const n0 = e.n0;
  const fibs = Array.from({ length: n0 + 1 }, (_, i) => fibonacci(i + 1));
  const etapeA: EtapeCorrection[] = [
    utilise("a", [t("Chaque nombre de Fibonacci est la somme des deux précédents ; "), f("v_n=\\dfrac{F_{n+1}}{F_n}"), t(".")]),
    calcul("a", [ligne(`F_1,\\ldots,F_{${n0 + 1}}:\\ ${fibs.join(";\\ ")}`, "on additionne les deux précédents"), ligne(`v_{${n0}}=\\dfrac{F_{${n0 + 1}}}{F_{${n0}}}=\\dfrac{${fibonacci(n0 + 1)}}{${fibonacci(n0)}}`, "définition de v")]),
    resultat("a", reponse(e, "terme")),
    piege("a", [t("Inverser la fraction ou décaler les indices d'un rang.")]),
  ];
  const etapeB: EtapeCorrection[] = [
    utilise("b", [t("Si "), f("(v_n)"), t(" converge vers Φ, alors "), f("v_{n+1}"), t(" aussi : on passe à la limite dans "), f("v_{n+1}=1+\\dfrac{1}{v_n}"), t(` ${COURS_LIMITE}.`)]),
    calcul("b", [
      ligne("\\Phi=1+\\dfrac{1}{\\Phi}", "passage à la limite"),
      ligne("\\Phi^2-\\Phi-1=0", [t("on multiplie par "), f("\\Phi")]),
      ligne("\\Phi=\\dfrac{1+\\sqrt{5}}{2}\\approx 1{,}618034", "solution positive (les rapports sont positifs)"),
    ]),
    resultat("b", reponse(e, "limite")),
    piege("b", [t("Garder aussi la solution négative "), f("\\dfrac{1-\\sqrt{5}}{2}"), t(".")]),
  ];
  const etapeC: EtapeCorrection[] = [
    utilise("c", [t("Menu Récurrence : "), f("v_{n+1}=1+\\dfrac{1}{v_n}"), t(", "), f("v_1=1"), t(" ; dans la table, on compare chaque terme à Φ (l'écart diminue).")]),
    calcul("c", lignesTable(e, "|v_{n}-\\Phi|")),
    resultat("c", reponse(e, "premier")),
    piege("c", [t("Arrondir Φ trop tôt (1,62) : les écarts calculés seraient faux.")]),
  ];
  return [...etapeA, ...etapeB, ...etapeC, ...etapesRang(e, "d", [ligne(`n\\geq ${e.N}`, "rangs qui conviennent"), ligne(`m=${e.N}-1=${e.m}`, "rang juste avant")])];
}

export function correctionDetailleeRang(e: E): EtapeCorrection[] {
  if (e.variante === "rationnelle") return corrigeRationnelle(e);
  if (e.variante === "geometrique") return corrigeGeometrique(e);
  return corrigeFibonacci(e);
}
