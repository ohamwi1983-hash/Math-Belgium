import type { EtapeCorrection, LigneCalcul } from "../../../export/genererFeuilleExercices";
import type { ExerciceBinomialeA, ExerciceBinomialeB, ExerciceBinomialeSequenceOrdonnee } from "../../core6e/binomialeSequenceOrdonnee.types";
import { probabiliteBinomialeExacte, resultatExact, termesExacts } from "../../moteur6e/verificationBinomialeSequenceOrdonnee";
import { arrangementBig, combinaisonBig, rationnel } from "../../moteur6e/saisieCombinatoire";
import type { Rationnel } from "../../moteur6e/saisieCombinatoire";
import { decimalLatex, fractionLatex, milliers } from "../../ui6e/fragmentsCombinatoire";
import { evenementLatex, nomObjetsB } from "../../ui6e/formatBinomialeSequenceOrdonnee";
import { AL } from "../../ui6e/nombresCombinatoireLotH";
import { COURS_BINOMIALE, COURS_HYPERGEO, calcul, decimalExact, finaliserCombinatoire, fx, ligne, ligneDecimale, lignesProbabilite, piege, resultat, utiliseCours, valeurProbabilite, verification } from "../../ui6e/corrigeCombinatoire";

/**
 * Corrigé détaillé « comme au tableau » de `6gen48` (6e ch. 7, § 6 ; séquence exacte : § 5), une lettre
 * par écran — MÊME source pour l'écran révélé et pour le papier :
 * - A : a) loi binomiale (n, p) et stratégie (nombre de valeurs de l'événement et de son contraire) ;
 *   b) valeurs de k et écriture de la probabilité cherchée ; c) chaque terme Cₙᵏ pᵏ (1 − p)ⁿ⁻ᵏ en
 *   décimaux EXACTS (p en dixièmes) ; d) somme ou complément (stratégies à plusieurs termes) ;
 * - B : a) probabilité de chaque tirage ; b) règle du produit, vérifiée par 1/Aₙᵏ.
 */

type E = ExerciceBinomialeSequenceOrdonnee;

/** Écriture décimale exacte (les probabilités binomiales à p en dixièmes ont un développement fini). */
function dec(r: Rationnel): string {
  return decimalExact(r)?.latex ?? fractionLatex(r);
}

function ensemble(valeurs: number[]): string {
  if (valeurs.length <= 4) return `\\{${valeurs.join("\\,;")}\\}`;
  return `\\{${valeurs[0]}\\,;${valeurs[1]}\\,;\\ldots;${valeurs[valeurs.length - 1]}\\}`;
}

function intervalle(a: number, b: number): number[] {
  return Array.from({ length: b - a + 1 }, (_, i) => a + i);
}

/** Valeurs de X de l'événement demandé. */
function valeursEvenement(e: ExerciceBinomialeA): number[] {
  switch (e.typeQuestion) {
    case "auMoins":
      return intervalle(e.k, e.n);
    case "auPlus":
      return intervalle(0, e.k);
    default:
      return [e.k];
  }
}

function contraireLatex(e: ExerciceBinomialeA): string {
  return e.typeQuestion === "auMoins" ? (e.k - 1 === 0 ? "X=0" : `X\\leq ${e.k - 1}`) : e.k + 1 === e.n ? `X=${e.n}` : `X\\geq ${e.k + 1}`;
}

function sommeP(ks: number[]): string {
  return ks.map((k) => `P(X=${k})`).join("+");
}

function puissance(base: string, exp: number): string {
  return `${base}^{${exp}}`;
}

function lignesTerme(e: ExerciceBinomialeA, k: number): LigneCalcul[] {
  const P = Math.round(e.p * 10);
  const p = decimalLatex(e.p);
  const q = decimalLatex(1 - e.p);
  const pk = rationnel(BigInt(P) ** BigInt(k), 10n ** BigInt(k));
  const qk = rationnel(BigInt(10 - P) ** BigInt(e.n - k), 10n ** BigInt(e.n - k));
  const r = probabiliteBinomialeExacte(e.n, e.p, k);
  return [
    ligne(`P(X=${k})=C_{${e.n}}^{${k}}\\times ${puissance(p, k)}\\times ${puissance(q, e.n - k)}`, "formule de la loi binomiale"),
    ligne(`=${milliers(combinaisonBig(e.n, k))}\\times ${dec(pk)}\\times ${dec(qk)}`, k === 0 || k === e.n ? undefined : fx(`$C_{${e.n}}^{${k}}=${milliers(combinaisonBig(e.n, k))}$`)),
    ligne(`=${dec(r)}`),
  ];
}

function corrigeA(e: ExerciceBinomialeA): EtapeCorrection[] {
  const ev = evenementLatex(e);
  const vals = valeursEvenement(e);
  const contraire = intervalle(0, e.n).filter((x) => !vals.includes(x));
  const termes = termesExacts(e);
  const res = resultatExact(e);
  const lignesA: LigneCalcul[] = [ligne(`n=${e.n}`, "répétitions identiques et indépendantes"), ligne(`p=${decimalLatex(e.p)}`, `probabilité du succès « ${e.contexte.labelSucces} »`)];
  if (e.strategie === "termeUnique") lignesA.push(ligne(`${ev}`, "une seule valeur de X"));
  else {
    lignesA.push(ligne(`${ev}\\iff X\\in${ensemble(vals)}`, `${vals.length} valeurs`));
    lignesA.push(ligne(`${contraireLatex(e)}\\iff X\\in${ensemble(contraire)}`, `événement contraire : ${contraire.length} valeurs`));
  }
  const conclusionA =
    e.strategie === "termeUnique"
      ? fx(`Un seul terme : $P(${ev})$.`)
      : e.strategie === "somme"
        ? fx(`La somme directe (${vals.length} termes) est plus courte que le complément (${contraire.length} termes).`)
        : fx(`Le complément (${contraire.length} termes) est plus court que la somme directe (${vals.length} termes).`);

  const ks = e.termesACalculer;
  const lignesB: LigneCalcul[] =
    e.strategie === "termeUnique"
      ? [ligne(`k=${e.k}`, "la valeur demandée")]
      : e.strategie === "somme"
        ? [ligne(`P(${ev})=${sommeP(ks)}`, "événements incompatibles : on additionne")]
        : [ligne(`P(${ev})=1-P(${contraireLatex(e)})`, "événement contraire"), ligne(`=1-\\big(${sommeP(ks)}\\big)`)];

  const out: EtapeCorrection[] = [
    utiliseCours("a", fx(`$X$ suit une loi binomiale : $n$ répétitions identiques et indépendantes d'une épreuve à deux issues, de probabilité de succès $p$`), COURS_BINOMIALE),
    calcul("a", lignesA),
    resultat("a", conclusionA),
    utiliseCours(
      "b",
      e.strategie === "termeUnique" ? fx("Un seul terme $P(X=k)$") : e.strategie === "somme" ? fx("Les événements $X=k$ sont incompatibles : on additionne leurs probabilités") : fx("Probabilité de l'événement contraire : $P(A)=1-P(\\overline{A})$"),
      COURS_BINOMIALE,
    ),
    calcul("b", lignesB),
    resultat("b", fx(ks.length === 1 ? `$k=${ks[0]}$` : `$k\\in\\{${ks.join("\\,;")}\\}$`)),
    utiliseCours("c", fx("Pour chaque $k$ : $P(X=k)=C_n^k\\,p^k\\,(1-p)^{n-k}$"), COURS_BINOMIALE),
    calcul("c", [...ks.flatMap((k) => lignesTerme(e, k)), ...(e.strategie === "termeUnique" ? ligneDecimale(res) : [])]),
    resultat("c", fx(ks.map((k, i) => `$P(X=${k})=${e.strategie === "termeUnique" ? valeurProbabilite(termes[i]) : dec(termes[i])}$`).join(" ; "))),
  ];
  if (e.strategie !== "termeUnique") {
    const somme = termes.reduce((a, r) => rationnel(a.n * r.d + r.n * a.d, a.d * r.d), rationnel(0));
    const lignesD: LigneCalcul[] =
      e.strategie === "somme"
        ? [ligne(`P(${ev})=${termes.map(dec).join("+")}`, "termes de l'étape 3"), ligne(`=${dec(res)}`), ...ligneDecimale(res)]
        : [ligne(`P(${ev})=1-(${termes.map(dec).join("+")})`, "termes de l'étape 3"), ...(termes.length > 1 ? [ligne(`=1-${dec(somme)}`)] : []), ligne(`=${dec(res)}`), ...ligneDecimale(res)];
    out.push(utiliseCours("d", e.strategie === "somme" ? fx("On additionne les termes") : fx("On retire de 1 la probabilité de l'événement contraire"), COURS_BINOMIALE), calcul("d", lignesD), resultat("d", fx(`$P(${ev})=${valeurProbabilite(res)}$`)));
  }
  out.push(
    piege(
      e.strategie === "termeUnique" ? "c" : "d",
      e.strategie === "termeUnique"
        ? fx(`Oublier $C_{${e.n}}^{${e.k}}$ : $p^k(1-p)^{n-k}$ n'est la probabilité que d'un seul ordre des succès et des échecs.`)
        : e.strategie === "somme"
          ? fx(`« ${e.typeQuestion === "auMoins" ? "Au moins" : "Au plus"} ${e.k} » contient $X=${e.k}$ : la borne fait partie de l'événement.`)
          : fx("Oublier de retirer de 1 : la somme calculée est la probabilité de l'événement contraire."),
    ),
  );
  return out;
}

function corrigeB(e: ExerciceBinomialeB): EtapeCorrection[] {
  const nom = nomObjetsB(e);
  const A = arrangementBig(e.n, e.k);
  const r = rationnel(1n, A);
  return [
    utiliseCours("a", fx(`Tirages successifs sans remise d'objets tous différents : à chaque tirage, un seul des objets restants convient`), COURS_HYPERGEO),
    calcul("a", e.denominateurs.map((d, i) => ligne(`p_{${i + 1}}=\\dfrac{1}{${d}}`, `${i + 1 === 1 ? "1er" : `${i + 1}e`} tirage : ${d} ${nom} ${nom === "jetons" ? "restants" : "restantes"}`))),
    resultat("a", fx(e.denominateurs.map((d, i) => `$p_{${i + 1}}=\\dfrac{1}{${d}}$`).join(" ; "))),
    utiliseCours("b", fx("Règle du produit : on multiplie les probabilités des tirages successifs"), COURS_HYPERGEO),
    calcul("b", [ligne(`P=${e.denominateurs.map((d) => `\\dfrac{1}{${d}}`).join("\\times ")}`, "règle du produit"), ...lignesProbabilite("", 1n, A, "on multiplie les dénominateurs")]),
    resultat("b", fx(`$P=${valeurProbabilite(r)}$`)),
    verification("b", fx(`Une seule séquence favorable parmi les $${AL(e.n, e.k)}$ séquences ordonnées possibles : $\\dfrac{1}{${AL(e.n, e.k)}}=\\dfrac{1}{${milliers(A)}}$.`)),
    piege("b", fx(`Calculer comme avec remise ($\\dfrac{1}{${e.n}^{${e.k}}}$) : l'objet tiré n'est pas remis, il en reste un de moins à chaque tirage.`)),
  ];
}

export function correctionDetailleeBinomialeSequenceOrdonnee(e: E): EtapeCorrection[] {
  return finaliserCombinatoire(e.famille === "A" ? corrigeA(e) : corrigeB(e));
}
