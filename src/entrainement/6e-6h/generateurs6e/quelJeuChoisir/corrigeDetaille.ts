import type { EtapeCorrection, FragmentConsigne, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, ligne, piege, resultat, utilise, verification } from "../../../export/corrigeTableau";
import type { Exercice161, Jeu } from "../../core6e/quelJeuChoisir";
import { apres, binom, couplesEcart, couplesSomme, proba } from "../../core6e/quelJeuChoisir";
import { lx, tx } from "../../../5e-4h/ui5e/ecransTrigo.types";
import type { Frag } from "../../../5e-4h/ui5e/ecransTrigo.types";
import { ppcm, reponse, verdict161 } from "../../ui6e/format161";
import { decL, q, qL } from "../../ui6e/nombresExp";

/**
 * Corrigé détaillé « comme au tableau » de `6gen161` : a) probabilité de gagner au jeu A, b) au jeu
 * B (dénombrement des 36 couples, chemins de l'arbre, produit le long d'un chemin, événement
 * contraire), c) comparaison au même dénominateur (produits en croix si ce dénominateur dépasse
 * 2 000) et choix. Fractions écrites telles qu'obtenues, puis simplifiées. Même source que l'écran.
 */

type E = Exercice161;
const fr = (f: Frag[]): FragmentConsigne[] => f as FragmentConsigne[];
const t = tx;
const l = lx;
const f = (n: number, d: number) => `\\dfrac{${n}}{${d}}`;

/** « = n/d » puis « = réduite » si elle diffère. */
function finFraction(n: number, d: number, just?: string): LigneCalcul[] {
  const r = q(n, d);
  const out = [ligne(`=${f(n, d)}`, just)];
  if (r.n !== n || r.d !== d) out.push(ligne(`=${qL(r)}`, "on simplifie"));
  return out;
}

function couplesSommeListe(s: number): string {
  const out: string[] = [];
  for (let a = 1; a <= 6; a++) if (s - a >= 1 && s - a <= 6) out.push(`(${a} ; ${s - a})`);
  return out.join(", ");
}

const NOMS: Record<number, string> = { 2: "deux", 3: "trois", 4: "quatre" };

/** Chemins de n lancers ayant exactement k fois P (ordre lexicographique, P avant F). */
function chemins(n: number, k: number): string[] {
  const out: string[] = [];
  const rec = (s: string, p: number) => {
    if (s.length === n) {
      if (p === k) out.push(s);
      return;
    }
    rec(s + "P", p + 1);
    rec(s + "F", p);
  };
  rec("", 0);
  return out;
}

export function lignesJeu(j: Jeu, G: string): { u: Frag[]; lignes: LigneCalcul[] } {
  const nonG = `\\overline{${G}}`;
  switch (j.type) {
    case "somme": {
      const u: Frag[] = [t("Deux dés : "), l("6\\times 6=36"), t(" couples équiprobables (diagramme cartésien, cours, § 2).")];
      if (j.mode === "egal") {
        const c = couplesSomme(j.s);
        return { u, lignes: [ligne("n(\\Omega)=6\\times 6=36"), ligne(`n(${G})=${c}`, couplesSommeListe(j.s)), ligne(`P(${G})=${f(c, 36)}`), ...finFraction(c, 36).slice(1)] };
      }
      const parts: number[] = [];
      for (let s = j.s; s <= 12; s++) parts.push(couplesSomme(s));
      const c = parts.reduce((a, b) => a + b, 0);
      const just = Array.from({ length: 13 - j.s }, (_, i) => j.s + i).map((s, i) => `somme ${s} : ${parts[i]}`).join(" ; ");
      return { u, lignes: [ligne("n(\\Omega)=36"), ligne(`n(${G})=${parts.join("+")}=${c}`, just), ligne(`P(${G})=${f(c, 36)}`), ...finFraction(c, 36).slice(1)] };
    }
    case "double":
      return { u: [t("Deux dés : 36 couples équiprobables (cours, § 2).")], lignes: [ligne("n(\\Omega)=36"), ligne(`n(${G})=6`, "(1 ; 1), (2 ; 2), …, (6 ; 6)"), ligne(`P(${G})=${f(6, 36)}`), ligne(`=${qL(q(1, 6))}`, "on simplifie")] };
    case "ecart": {
      const u: Frag[] = [t("Deux dés : 36 couples équiprobables (cours, § 2) ; chaque écart non nul s'obtient dans les deux ordres.")];
      if (j.mode === "egal") {
        const c = couplesEcart(j.d);
        return { u, lignes: [ligne("n(\\Omega)=36"), ligne(`n(${G})=2\\times ${6 - j.d}=${c}`, `(1 ; ${1 + j.d}), …, (${6 - j.d} ; 6) et leurs inverses`), ligne(`P(${G})=${f(c, 36)}`), ...finFraction(c, 36).slice(1)] };
      }
      const parts: number[] = [];
      for (let d = j.d; d <= 5; d++) parts.push(couplesEcart(d));
      const c = parts.reduce((a, b) => a + b, 0);
      const just = Array.from({ length: 6 - j.d }, (_, i) => j.d + i).map((d, i) => `écart ${d} : ${parts[i]}`).join(" ; ");
      return { u, lignes: [ligne("n(\\Omega)=36"), ligne(`n(${G})=${parts.join("+")}=${c}`, just), ligne(`P(${G})=${f(c, 36)}`), ...finFraction(c, 36).slice(1)] };
    }
    case "produitPair":
      return {
        u: [t("Événement contraire (cours, § 4) : le produit est impair seulement si les deux dés sont impairs (dés indépendants, cours, § 2).")],
        lignes: [ligne(`P(${nonG})=${f(3, 6)}\\times ${f(3, 6)}`, "deux résultats impairs"), ligne(`=${f(9, 36)}`), ligne(`P(${G})=1-P(${nonG})`), ligne(`=1-${f(9, 36)}`), ...finFraction(27, 36)],
      };
    case "auMoinsUnDe": {
      const a = j.k - 1;
      return {
        u: [t("« Au moins un » : événement contraire (cours, § 4). "), l(nonG), t(` : aucun des deux dés ne montre ${j.k === 6 ? "un 6" : `${j.k} ou plus`} (dés indépendants).`)],
        lignes: [ligne(`P(${nonG})=${f(a, 6)}\\times ${f(a, 6)}`), ligne(`=${f(a * a, 36)}`), ligne(`P(${G})=1-P(${nonG})`), ligne(`=1-${f(a * a, 36)}`), ...finFraction(36 - a * a, 36)],
      };
    }
    case "repete": {
      const den = 6 ** j.n;
      const num = 5 ** j.n;
      return {
        u: [t("« Au moins un 6 » : événement contraire (cours, § 4). "), l(nonG), t(` : aucun 6 en ${NOMS[j.n]} lancers indépendants.`)],
        lignes: [ligne(`P(${nonG})=\\left(\\dfrac{5}{6}\\right)^{${j.n}}`), ligne(`=${f(num, den)}`), ligne(`P(${G})=1-P(${nonG})`), ligne(`=1-${f(num, den)}`), ...finFraction(den - num, den)],
      };
    }
    case "pieces": {
      const N = 2 ** j.n;
      if (j.mode === "auMoins" && j.k === 1)
        return {
          u: [t("« Au moins une fois pile » : événement contraire (cours, § 4). "), l(nonG), t(" : face à chaque lancer.")],
          lignes: [ligne(`P(${nonG})=\\left(\\dfrac{1}{2}\\right)^{${j.n}}`), ligne(`=${f(1, N)}`), ligne(`P(${G})=1-${f(1, N)}`), ...finFraction(N - 1, N)],
        };
      const u: Frag[] = [t("Épreuves répétées (cours, § 4) : l'arbre a "), l(`2^{${j.n}}=${N}`), t(" chemins de même probabilité (P : pile, F : face) ; on compte les chemins gagnants.")];
      if (j.mode === "exactement") {
        const ch = chemins(j.n, j.k);
        return { u, lignes: [ligne(`n(\\Omega)=2^{${j.n}}=${N}`), ligne(`n(${G})=${ch.length}`, ch.join(", ")), ligne(`P(${G})=${f(ch.length, N)}`), ...finFraction(ch.length, N).slice(1)] };
      }
      const parts: number[] = [];
      for (let k = j.k; k <= j.n; k++) parts.push(binom(j.n, k));
      const c = parts.reduce((a, b) => a + b, 0);
      const just = parts.map((x, i) => `${x} chemin${x > 1 ? "s" : ""} à ${j.k + i} P`).join(" ; ");
      return { u, lignes: [ligne(`n(\\Omega)=${N}`), ligne(`n(${G})=${parts.join("+")}=${c}`, just), ligne(`P(${G})=${f(c, N)}`), ...finFraction(c, N).slice(1)] };
    }
    case "urne": {
      const n = j.r + j.v;
      const ar = apres(j, "r");
      const av = apres(j, "v");
      const RR = `${f(j.r, n)}\\times ${f(ar.r, ar.n)}`;
      const VV = `${f(j.v, n)}\\times ${f(av.v, av.n)}`;
      const RV = `${f(j.r, n)}\\times ${f(ar.v, ar.n)}`;
      const VR = `${f(j.v, n)}\\times ${f(av.r, av.n)}`;
      const D = n * ar.n;
      const u: Frag[] = [t(`Arbre pondéré (cours, § 2) : on multiplie le long d'un chemin, on additionne les chemins. ${j.remise ? "Avec remise, le second tirage se fait dans la même urne." : "Sans remise, le second tirage se fait avec une boule de moins."}`)];
      if (j.evt === "deuxR") return { u, lignes: [ligne(`P(${G})=${RR}`, "chemin rouge puis rouge"), ...finFraction(j.r * ar.r, D)] };
      if (j.evt === "meme") {
        const a = j.r * ar.r;
        const b = j.v * av.v;
        return { u, lignes: [ligne(`P(${G})=${RR}+${VV}`, "chemins rouge-rouge et vert-vert"), ligne(`=${f(a, D)}+${f(b, D)}`), ...finFraction(a + b, D)] };
      }
      if (j.evt === "differentes") {
        const a = j.r * ar.v;
        const b = j.v * av.r;
        return { u, lignes: [ligne(`P(${G})=${RV}+${VR}`, "chemins rouge-vert et vert-rouge"), ligne(`=${f(a, D)}+${f(b, D)}`), ...finFraction(a + b, D)] };
      }
      const b = j.v * av.v;
      return {
        u: [...u, t(" « Au moins une rouge » : événement contraire (cours, § 4), "), l(nonG), t(" : aucune rouge.")],
        lignes: [ligne(`P(${nonG})=${VV}`, "chemin vert puis vert"), ligne(`=${f(b, D)}`), ligne(`P(${G})=1-${f(b, D)}`), ...finFraction(D - b, D)],
      };
    }
    case "roue": {
      const g = f(j.k, j.n);
      const p = f(j.n - j.k, j.n);
      const D = j.n * j.n;
      const u: Frag[] = [t("Arbre pondéré (cours, § 2) : deux lancers indépendants, on multiplie le long d'un chemin, on additionne les chemins.")];
      if (j.evt === "deuxFois") return { u, lignes: [ligne(`P(${G})=${g}\\times ${g}`, "gagnant puis gagnant"), ...finFraction(j.k * j.k, D)] };
      if (j.evt === "exactementUne") {
        const a = j.k * (j.n - j.k);
        return { u, lignes: [ligne(`P(${G})=${g}\\times ${p}+${p}\\times ${g}`, "gagnant-perdant et perdant-gagnant"), ligne(`=${f(a, D)}+${f(a, D)}`), ...finFraction(2 * a, D)] };
      }
      const b = (j.n - j.k) ** 2;
      return {
        u: [...u, t(" « Au moins une fois » : événement contraire (cours, § 4), "), l(nonG), t(" : perdant les deux fois.")],
        lignes: [ligne(`P(${nonG})=${p}\\times ${p}`, "perdant puis perdant"), ligne(`=${f(b, D)}`), ligne(`P(${G})=1-${f(b, D)}`), ...finFraction(D - b, D)],
      };
    }
  }
}

function lignesComparaison(e: E): { u: Frag[]; lignes: LigneCalcul[] } {
  const a = proba(e.jeuA);
  const b = proba(e.jeuB);
  const L = ppcm(a.d, b.d);
  const rel = a.n * b.d === b.n * a.d ? "=" : a.n * b.d > b.n * a.d ? ">" : "<";
  if (L <= 2000) {
    const na = (a.n * L) / a.d;
    const nb = (b.n * L) / b.d;
    const ecr = (x: typeof a, nx: number, G: string) => (x.d === L ? ligne(`P(${G})=${f(nx, L)}`) : ligne(`P(${G})=${qL(x)}=${f(nx, L)}`, `× ${L / x.d} en haut et en bas`));
    return {
      u: [t("Pour comparer deux fractions, on les écrit au même dénominateur, ici "), l(`${L}`), t(".")],
      lignes: [ecr(a, na, "G_A"), ecr(b, nb, "G_B"), ligne(`${f(na, L)}${rel}${f(nb, L)}`, "on compare les numérateurs")],
    };
  }
  const pa = a.n * b.d;
  const pb = b.n * a.d;
  return {
    u: [t("Dénominateur commun trop grand : on compare les produits en croix ("), l("\\dfrac{a}{b}<\\dfrac{c}{d}"), t(" quand "), l("a\\times d<c\\times b"), t(", dénominateurs positifs).")],
    lignes: [ligne(`${a.n}\\times ${b.d}=${pa}`), ligne(`${b.n}\\times ${a.d}=${pb}`), ligne(`${qL(a)}${rel}${qL(b)}`, `car ${pa} ${rel === "=" ? "=" : rel === ">" ? ">" : "<"} ${pb}`)],
  };
}

function approx(x: { n: number; d: number }): string {
  const v = x.n / x.d;
  const r = Math.round(v * 1000) / 1000;
  return `${Math.abs(r - v) < 1e-12 ? "=" : "\\approx"}${decL(r, 3)}`;
}

export function correctionDetaillee161(e: E): EtapeCorrection[] {
  const out: EtapeCorrection[] = [];
  for (const [sq, j, G, ph] of [["a", e.jeuA, "G_A", "pA"], ["b", e.jeuB, "G_B", "pB"]] as const) {
    const { u, lignes } = lignesJeu(j, G);
    out.push(utilise(sq, fr(u)), calcul(sq, lignes), resultat(sq, fr(reponse(e, ph))));
  }
  const c = lignesComparaison(e);
  const v = verdict161(e);
  out.push(
    utilise("c", fr(c.u)),
    calcul("c", c.lignes),
    resultat("c", fr([t(v === "egal" ? "Autant de chances aux deux jeux : " : `Le jeu ${v} donne plus de chances de gagner : `), l(`P(G_A)${v === "egal" ? "=" : v === "A" ? ">" : "<"}P(G_B)`), t(".")])),
    verification("c", fr([t("Valeurs décimales : "), l(`P(G_A)${approx(proba(e.jeuA))}`), t(" et "), l(`P(G_B)${approx(proba(e.jeuB))}`), t(".")])),
    piege("c", fr(v === "egal" ? [t("Se fier à l'intuition (« plus de dés », « sans remise », « deux tours de roue ») : deux jeux très différents peuvent donner exactement la même probabilité.")] : [t("Comparer les numérateurs, ou les dénominateurs, de deux fractions qui n'ont pas le même dénominateur.")])),
  );
  return out;
}
