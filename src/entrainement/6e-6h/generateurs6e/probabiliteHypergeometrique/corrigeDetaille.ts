import type { EtapeCorrection, LigneCalcul } from "../../../export/genererFeuilleExercices";
import type { CategorieHypergeoC, ExerciceHypergeoA, ExerciceHypergeoB, ExerciceHypergeoC, ExerciceProbabiliteHypergeometrique } from "../../core6e/probabiliteHypergeometrique.types";
import { rationnel } from "../../moteur6e/saisieCombinatoire";
import type { Rationnel } from "../../moteur6e/saisieCombinatoire";
import { fractionLatex, milliers } from "../../ui6e/fragmentsCombinatoire";
import { CC, COURS_HYPERGEO, calcul, finaliserCombinatoire, fx, ligne, lignesCombinaison, lignesProbabilite, piege, resultat, utiliseCours, valeurProbabilite, verification } from "../../ui6e/corrigeCombinatoire";
import { compositionTexte } from "../../ui6e/formatProbabiliteHypergeometrique";

/**
 * Corrigé détaillé « comme au tableau » de `6gen47` (6e ch. 7, § 5), une lettre par écran — MÊME
 * source pour l'écran révélé (`AppCombinatoire.corrigeDetaille`) et pour le papier :
 * - A : a) N, K, n, k et la formule hypergéométrique avec les nombres ; b) chaque combinaison, puis la
 *   fraction simplifiée et l'arrondi, vérification par le produit des tirages successifs ;
 * - B : a) règle du produit (séquence) ; b) nombre d'ordres Cₐ³ ; c) composition = ordres × séquence,
 *   vérifiée par la formule hypergéométrique ;
 * - C : a) numéros principaux ; b) numéros bonus ; c) produit (tirages indépendants).
 */

type E = ExerciceProbabiliteHypergeometrique;

function formule(N: number, K: number, n: number, k: number): string {
  return `\\dfrac{${CC(K, k)}\\times ${CC(N - K, n - k)}}{${CC(N, n)}}`;
}

/** Produit des probabilités des tirages successifs dans l'ordre « k succès puis n − k échecs ». */
function produitSuccessif(N: number, K: number, n: number, k: number): { num: number[]; den: number[] } {
  const num: number[] = [];
  const den: number[] = [];
  for (let i = 0; i < k; i++) num.push(K - i);
  for (let i = 0; i < n - k; i++) num.push(N - K - i);
  for (let i = 0; i < n; i++) den.push(N - i);
  return { num, den };
}

function corrigeA(e: ExerciceHypergeoA): EtapeCorrection[] {
  const { N, K, n, k } = e;
  const P = `P(X=${k})`;
  const num = BigInt(e.numerateurFacteur1) * BigInt(e.numerateurFacteur2);
  const r = rationnel(num, e.denominateur);
  const succ = produitSuccessif(N, K, n, k);
  return [
    utiliseCours("a", fx("Tirage de $n$ éléments, sans remise, parmi $N$ dont $K$ « succès » : loi hypergéométrique, $P(X=k)=\\dfrac{C_K^k\\times C_{N-K}^{n-k}}{C_N^n}$"), COURS_HYPERGEO),
    calcul("a", [
      ligne(`N=${N}`, e.contexte.labelPopulation),
      ligne(`K=${K}`, e.contexte.labelSucces),
      ligne(`n=${n}`, e.contexte.labelTirage),
      ligne(`k=${k}`, fx(`on cherche $P(X=${k})$, où $X$ compte les ${e.contexte.labelSucces} parmi les ${e.contexte.labelTirage}`)),
      ligne(`${P}=${formule(N, K, n, k)}`, "on remplace"),
    ]),
    resultat("a", fx(`$${P}=${formule(N, K, n, k)}$`)),
    utiliseCours("b", fx("On calcule chaque combinaison $C_n^k=\\dfrac{n!}{k!\\,(n-k)!}$, puis on simplifie la fraction"), COURS_HYPERGEO),
    calcul("b", [
      ...lignesCombinaison(K, k),
      ...lignesCombinaison(N - K, n - k),
      ...lignesCombinaison(N, n),
      ...lignesProbabilite(P, num, e.denominateur, fx(`$${milliers(e.numerateurFacteur1)}\\times ${milliers(e.numerateurFacteur2)}$ au numérateur`)),
    ]),
    resultat("b", fx(`$${P}=${valeurProbabilite(r)}$`)),
    verification(
      "b",
      k === 0 || k === n
        ? fx(`Par les tirages successifs, sans remise : $\\dfrac{${succ.num.join("\\times ")}}{${succ.den.join("\\times ")}}=${fractionSeule(r)}$.`)
        : fx(`Par les tirages successifs (les ${e.contexte.labelSucces} d'abord), multipliés par les $${CC(n, k)}=${binom(n, k)}$ ordres possibles : $${CC(n, k)}\\times\\dfrac{${succ.num.join("\\times ")}}{${succ.den.join("\\times ")}}=${fractionSeule(r)}$.`),
    ),
    piege("b", fx(`Le dénominateur compte tous les tirages de $${n}$ éléments parmi $${N}$ : $${CC(N, n)}$, et non $${k === n ? CC(K, n) : CC(N, k)}$.`)),
  ];
}

function fractionSeule(r: Rationnel): string {
  return fractionLatex(r);
}

function binom(n: number, k: number): number {
  let r = 1;
  for (let i = 0; i < k; i++) r = (r * (n - i)) / (i + 1);
  return Math.round(r);
}

const lettreCouleur = (c: "c1" | "c2") => (c === "c1" ? "R" : "B");

function facteursSequence(e: ExerciceHypergeoB): [number, number][] {
  let r1 = e.n1;
  let r2 = e.n2;
  let tot = e.N;
  const f: [number, number][] = [];
  for (const c of e.sequence) {
    f.push([c === "c1" ? r1 : r2, tot]);
    if (c === "c1") r1--;
    else r2--;
    tot--;
  }
  return f;
}

function ordres(e: ExerciceHypergeoB): string[] {
  const r: string[] = [];
  for (let i = 0; i < 3; i++)
    for (let j = 0; j < 3; j++) {
      const s = ["B", "B", "B"];
      if (e.a === 1) {
        if (j > 0) continue;
        s[i] = "R";
      } else {
        if (j <= i) continue;
        s[i] = "R";
        s[j] = "R";
      }
      r.push(s.join(""));
    }
  return r;
}

function corrigeB(e: ExerciceHypergeoB): EtapeCorrection[] {
  const seq = e.sequence.map(lettreCouleur).join("");
  const f = facteursSequence(e);
  const rs = rationnel(e.numerateurSequence, e.denominateurSequence);
  const rc = rationnel(e.numerateurComposition, e.denominateurComposition);
  const lignesSeq: LigneCalcul[] = [
    ligne(`P(${seq})=${f.map(([a, b]) => `\\dfrac{${a}}{${b}}`).join("\\times ")}`, "une boule de moins à chaque tirage"),
    ...lignesProbabilite("", e.numerateurSequence, e.denominateurSequence, "on multiplie numérateurs et dénominateurs"),
  ];
  return [
    utiliseCours("a", fx("Tirages successifs sans remise : règle du produit, l'urne perd une boule à chaque tirage (R : rouge, B : bleue)"), COURS_HYPERGEO),
    calcul("a", lignesSeq),
    resultat("a", fx(`$P(${seq})=${valeurProbabilite(rs)}$`)),
    utiliseCours("b", fx("Un ordre est le choix des places des boules rouges parmi les trois tirages : $C_3^a$ ordres"), COURS_HYPERGEO),
    calcul("b", [ligne(`${CC(3, e.a)}=${e.nombreArrangements}`, `places des ${e.a > 1 ? "deux rouges" : "rouges"} : ${ordres(e).join(", ")}`)]),
    resultat("b", fx(`$${e.nombreArrangements}$ ordres donnent ${compositionTexte(e)}.`)),
    utiliseCours("c", fx("Chaque ordre a la même probabilité que la séquence (mêmes facteurs, dans un autre ordre) : on multiplie par le nombre d'ordres"), COURS_HYPERGEO),
    calcul("c", [
      ligne(`P=${e.nombreArrangements}\\times ${fractionSeule(rs)}`, "ordres × probabilité d'un ordre"),
      ...lignesProbabilite("", BigInt(e.nombreArrangements) * rs.n, rs.d),
    ]),
    resultat("c", fx(`$P=${valeurProbabilite(rc)}$`)),
    verification("c", fx(`Formule hypergéométrique : $\\dfrac{${CC(e.n1, e.a)}\\times ${CC(e.n2, e.b)}}{${CC(e.N, 3)}}=\\dfrac{${binom(e.n1, e.a)}\\times ${binom(e.n2, e.b)}}{${milliers(binom(e.N, 3))}}=${fractionSeule(rc)}$.`)),
    piege("c", fx("Garder la probabilité de la seule séquence : la composition s'obtient dans plusieurs ordres, tous aussi probables.")),
  ];
}

function etapeCategorie(sq: string, nom: string, P: string, cat: CategorieHypergeoC): EtapeCorrection[] {
  const r = rationnel(cat.numerateur, cat.denominateur);
  const c1 = binom(cat.K, cat.k);
  const c2 = binom(cat.N - cat.K, cat.n - cat.k);
  const c3 = binom(cat.N, cat.n);
  return [
    utiliseCours(sq, fx(`Loi hypergéométrique pour les ${nom} : $${cat.n}$ tirés parmi $${cat.N}$, dont $${cat.K}$ cochés`), COURS_HYPERGEO),
    calcul(sq, [
      ligne(`${P}=${formule(cat.N, cat.K, cat.n, cat.k)}`, fx(`$N=${cat.N}$, $K=${cat.K}$, $n=${cat.n}$, $k=${cat.k}$`)),
      ligne(`=\\dfrac{${milliers(c1)}\\times ${milliers(c2)}}{${milliers(c3)}}`, fx(`$${CC(cat.K, cat.k)}=${milliers(c1)}$ ; $${CC(cat.N - cat.K, cat.n - cat.k)}=${milliers(c2)}$ ; $${CC(cat.N, cat.n)}=${milliers(c3)}$`)),
      ...lignesProbabilite("", BigInt(c1) * BigInt(c2), c3),
    ]),
    resultat(sq, fx(`$${P}=${valeurProbabilite(r)}$`)),
  ];
}

function corrigeC(e: ExerciceHypergeoC): EtapeCorrection[] {
  const r1 = rationnel(e.principal.numerateur, e.principal.denominateur);
  const r2 = rationnel(e.bonus.numerateur, e.bonus.denominateur);
  const r = rationnel(e.numerateurCombine, e.denominateurCombine);
  const ecrit = fractionSeule;
  return [
    ...etapeCategorie("a", "numéros principaux", "P_1", e.principal),
    ...etapeCategorie("b", "numéros bonus", "P_2", e.bonus),
    utiliseCours("c", fx("Les deux tirages se font dans deux urnes différentes : ils sont indépendants, $P(A\\cap B)=P(A)\\times P(B)$"), COURS_HYPERGEO),
    calcul("c", [ligne(`P=P_1\\times P_2`, "événements indépendants"), ligne(`=${ecrit(r1)}\\times ${ecrit(r2)}`), ...lignesProbabilite("", r1.n * r2.n, r1.d * r2.d, "on multiplie numérateurs et dénominateurs")]),
    resultat("c", fx(`$P=${valeurProbabilite(r)}$`)),
    piege("c", fx("Additionner $P_1$ et $P_2$ : les deux événements doivent se produire ensemble, on multiplie.")),
  ];
}

export function correctionDetailleeProbabiliteHypergeometrique(e: E): EtapeCorrection[] {
  switch (e.famille) {
    case "A":
      return finaliserCombinatoire(corrigeA(e));
    case "B":
      return finaliserCombinatoire(corrigeB(e));
    case "C":
      return finaliserCombinatoire(corrigeC(e));
  }
}
