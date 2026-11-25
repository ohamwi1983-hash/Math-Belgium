import type { EtapeCorrection, LigneCalcul } from "../../../export/genererFeuilleExercices";
import type { ExerciceLoiBinomiale, ExerciceLoiBinomialeA, ExerciceLoiBinomialeB, ExerciceLoiBinomialeC } from "../../core6e/loiBinomiale.types";
import { combinaisonBig, rationnel } from "../../moteur6e/saisieCombinatoire";
import type { Rationnel } from "../../moteur6e/saisieCombinatoire";
import { esperanceEtVariance } from "../../moteur6e/verificationLoiBinomiale";
import { phasesPourExercice } from "../../moteur6e/typesLoiBinomiale";
import type { PhaseLoiBinomiale } from "../../moteur6e/typesLoiBinomiale";
import { decimalExact, finaliserCombinatoire, fx, ligne, calcul, piege, resultat, utiliseCours, verification } from "../../ui6e/corrigeCombinatoire";
import { BIN, COURS_BINOMIALE_8, ar, dl, versLettresPapier } from "../../ui6e/corrigeVariablesAleatoires";
import { fractionLatex, milliers } from "../../ui6e/fragmentsCombinatoire";
import { LIBELLES_CONDITION } from "./contextes";
import { loiBinomialeExacte } from "./familleB";
import { frontiereC, uniteC } from "./familleC";

/**
 * Corrigé détaillé « comme au tableau » de `6gen50` (6e ch. 8, § 2), une lettre par ÉCRAN — même source
 * pour l'écran révélé et pour le papier (`correctionDetailleeLoiBinomiale` : l'écran « diagramme » de B,
 * propre à l'appli, n'est pas une étape du papier, `versLettresPapier`).
 * - A : a) les conditions du schéma de Bernoulli passées en revue sur la situation, verdict ; b) n et p,
 *   ou la condition qui échoue ;
 * - B : a) P(X = k) = Cₙᵏ pᵏ (1 − p)ⁿ⁻ᵏ pour chaque k (décimaux exacts, somme 1) ; b) diagramme (écran) ;
 *   c) E = np, V = np(1 − p) ; d) σ = √V ;
 * - C : a) P(au moins un succès) = 1 − (1 − p)ⁿ > seuil ; b) logarithme, le sens change ; c) n minimal
 *   et contrôle des deux entiers voisins.
 */

type E = ExerciceLoiBinomiale;

/** σ = √V : « = 0,6 » quand la racine est un décimal exact (V = 0,36), sinon « ≈ » au centième. */
export function sigmaExact(V: number): boolean {
  const s = Math.sqrt(V);
  return Math.abs(s * 100 - Math.round(s * 100)) < 1e-9;
}
export function suiteSigma(V: number): string {
  return sigmaExact(V) ? `=${dl(Math.sqrt(V))}` : `\\approx ${ar(Math.sqrt(V), 2)}`;
}

export function pLatexA(e: ExerciceLoiBinomialeA): string {
  return e.pDen === 10 || e.pDen === 100 ? dl(e.pNum / e.pDen) : `\\dfrac{${e.pNum}}{${e.pDen}}`;
}

function dec(r: Rationnel): string {
  return decimalExact(r)?.latex ?? fractionLatex(r);
}

function corrigeA(e: ExerciceLoiBinomialeA): EtapeCorrection[] {
  const raison =
    e.condition === "nombre"
      ? "On s'arrête quand un résultat se produit : on ne sait pas à l'avance combien d'épreuves on fera."
      : e.condition === "independance"
        ? "Le résultat d'une épreuve (ou son rang) modifie la probabilité de succès : les épreuves ne sont pas identiques et indépendantes."
        : "$X$ additionne des valeurs qui ne sont pas des succès (plus de deux issues, ou des valeurs différentes de 1) : elle ne compte pas des succès.";
  const out: EtapeCorrection[] = [
    utiliseCours("a", fx("$X$ suit une loi binomiale si l'on répète un nombre $n$ fixé d'épreuves identiques et indépendantes, à deux issues (succès / échec), et si $X$ compte les succès"), COURS_BINOMIALE_8),
  ];
  if (e.binomiale) {
    out.push(
      calcul("a", [ligne(`n=${e.n}`, "le nombre d'épreuves est fixé à l'avance")]),
      resultat("a", fx("Les épreuves sont identiques et indépendantes (le résultat de l'une ne change pas les autres), chacune a deux issues (succès ou échec) et $X$ compte les succès : les conditions sont réunies, $X$ suit une loi binomiale.")),
    );
    out.push(
      utiliseCours("b", fx("$n$ = nombre d'épreuves, $p$ = probabilité d'un succès à une épreuve"), COURS_BINOMIALE_8),
      calcul("b", [ligne(`n=${e.n}`, "nombre d'épreuves"), ligne(`p=${pLatexA(e)}`, "probabilité du succès à chaque épreuve")]),
      resultat("b", fx(`$X\\sim${BIN(e.n, pLatexA(e))}$.`)),
      piege("b", fx("Prendre pour $p$ la probabilité de l'échec, ou pour $n$ le nombre de succès espérés.")),
    );
  } else {
    out.push(resultat("a", fx(`${raison} $X$ ne suit donc pas une loi binomiale.`)));
    out.push(
      utiliseCours("b", fx("Il suffit qu'une seule condition échoue pour que la loi ne soit pas binomiale"), COURS_BINOMIALE_8),
      resultat("b", fx(`Condition non respectée : ${((c) => (c.startsWith("X ") ? c.replace(/^X /, "$X$ ") : c[0].toLowerCase() + c.slice(1)))(LIBELLES_CONDITION[e.condition ?? "nombre"])}`)),
      piege("b", fx("Conclure « binomiale » parce qu'il y a des répétitions : le nombre d'épreuves doit être fixé, les épreuves indépendantes, et $X$ doit compter des succès.")),
    );
  }
  return out;
}

function terme(e: ExerciceLoiBinomialeB, k: number): LigneCalcul[] {
  const P = Math.round(e.p * 10);
  const pk = rationnel(BigInt(P) ** BigInt(k), 10n ** BigInt(k));
  const qk = rationnel(BigInt(10 - P) ** BigInt(e.n - k), 10n ** BigInt(e.n - k));
  const r = rationnel(combinaisonBig(e.n, k) * pk.n * qk.n, pk.d * qk.d);
  return [
    ligne(`P(X=${k})=C_{${e.n}}^{${k}}\\times ${dl(e.p)}^{${k}}\\times ${dl(1 - e.p)}^{${e.n - k}}`, k === 0 ? "formule de la loi binomiale" : undefined),
    ligne(`=${milliers(combinaisonBig(e.n, k))}\\times ${dec(pk)}\\times ${dec(qk)}=${dec(r)}`),
  ];
}

function corrigeB(e: ExerciceLoiBinomialeB): EtapeCorrection[] {
  const loi = loiBinomialeExacte(e.n, e.p);
  const { E: esp, V } = esperanceEtVariance(e.n, e.p);
  const mode = loi.map((r) => Number(r.n) / Number(r.d)).reduce((m, x, i, t) => (x > t[m] ? i : m), 0);
  return [
    utiliseCours("a", fx(`$X\\sim${BIN(e.n, dl(e.p))}$ : pour $k=0,\\ldots,${e.n}$, $P(X=k)=C_n^k\\,p^k\\,(1-p)^{n-k}$`), COURS_BINOMIALE_8),
    calcul("a", Array.from({ length: e.n + 1 }, (_, k) => terme(e, k)).flat()),
    resultat("a", fx(`Loi de $X$ : ${loi.map((r, k) => `$P(X=${k})=${dec(r)}$`).join(" ; ")}.`)),
    verification("a", fx(`Les ${e.n + 1} probabilités ont pour somme 1.`)),
    piege("a", fx("Oublier $C_n^k$ : $p^k(1-p)^{n-k}$ n'est la probabilité que d'un seul ordre des succès et des échecs.")),
    utiliseCours("b", fx("Le sommet du diagramme en barres est la valeur la plus probable, proche de $n\\times p$"), COURS_BINOMIALE_8),
    resultat("b", fx(`Valeur la plus probable : $k=${mode}$, proche de $n\\times p=${dl(e.n * e.p)}$ ; ${e.p < 0.5 ? "le sommet est à gauche, les barres s'étirent vers la droite" : "le sommet est à droite, les barres s'étirent vers la gauche"}.`)),
    utiliseCours("c", fx("Pour une loi binomiale : $E(X)=n\\,p$ et $V(X)=n\\,p\\,(1-p)$"), COURS_BINOMIALE_8),
    calcul("c", [ligne(`E(X)=${e.n}\\times ${dl(e.p)}=${dl(esp)}`, "n p"), ligne(`V(X)=${e.n}\\times ${dl(e.p)}\\times ${dl(1 - e.p)}=${dl(V)}`, "n p (1 − p)")]),
    resultat("c", fx(`$E(X)=${dl(esp)}$ et $V(X)=${dl(V)}$.`)),
    utiliseCours("d", fx("L'écart-type est la racine carrée de la variance : $\\sigma(X)=\\sqrt{V(X)}$"), COURS_BINOMIALE_8),
    calcul("d", [ligne(`\\sigma(X)=\\sqrt{${dl(V)}}`, "racine de la variance"), ligne(suiteSigma(V), sigmaExact(V) ? "racine exacte" : "arrondi au centième")]),
    resultat("d", fx(`$\\sigma(X)${suiteSigma(V)}$.`)),
  ];
}

function corrigeC(e: ExerciceLoiBinomialeC): EtapeCorrection[] {
  const q = dl(1 - e.p);
  const s = dl(e.seuil);
  const u = dl(1 - e.seuil);
  const fr = frontiereC(e.p, e.seuil);
  const n = e.valeurN;
  return [
    utiliseCours("a", fx("Sur $n$ épreuves indépendantes de même probabilité de succès $p$, « au moins un succès » est le contraire de « aucun succès » : $P=1-(1-p)^n$"), COURS_BINOMIALE_8),
    calcul("a", [ligne(`P(\\text{aucun succès})=${q}^{n}`, `chaque épreuve échoue avec la probabilité 1 − p = ${q.replace("{,}", ",")}`), ligne(`P(\\text{au moins un succès})=1-${q}^{n}`, "événement contraire")]),
    resultat("a", fx(`On cherche le plus petit entier $n$ tel que $1-${q}^{n}>${s}$.`)),
    utiliseCours("b", fx("On isole la puissance, puis on prend le logarithme : $\\ln(a^n)=n\\ln a$ ; diviser par un nombre négatif change le sens de l'inégalité"), COURS_BINOMIALE_8),
    calcul("b", [
      ligne(`1-${q}^{n}>${s}`),
      ligne(`${q}^{n}<${u}`, "on isole la puissance"),
      ligne(`n\\ln(${q})<\\ln(${u})`, "logarithme des deux membres (ln croissante)"),
      ligne(`n>\\dfrac{\\ln(${u})}{\\ln(${q})}`, `on divise par ln(${q.replace("{,}", ",")}) < 0 : le sens change`),
      ligne(`n>${ar(fr, 2)}`, "valeur approchée"),
    ]),
    resultat("b", fx(`$n>${ar(fr, 2)}$ (environ).`)),
    piege("b", fx(`Garder le sens « $<$ » après la division : $\\ln(${q})$ est négatif, le sens de l'inégalité change.`)),
    utiliseCours("c", fx("$n$ est un nombre entier : on prend le premier entier qui vérifie l'inéquation"), COURS_BINOMIALE_8),
    calcul("c", [ligne(`n=${n}`, `premier entier au-delà de ${ar(fr, 2).replace("{,}", ",")}`)]),
    resultat("c", fx(`Il faut au minimum ${n} ${uniteC(e)}.`)),
    verification("c", fx(`$1-${q}^{${n - 1}}\\approx ${ar(1 - (1 - e.p) ** (n - 1), 4)}<${s}$ et $1-${q}^{${n}}\\approx ${ar(1 - (1 - e.p) ** n, 4)}>${s}$.`)),
  ];
}

/** Corrigé par ÉCRAN de l'appli (une lettre par écran, diagramme compris). */
export function correctionEcranLoiBinomiale(e: E): EtapeCorrection[] {
  return finaliserCombinatoire(e.famille === "A" ? corrigeA(e) : e.famille === "B" ? corrigeB(e) : corrigeC(e));
}

/** Écrans gardés sur papier : tous sauf le diagramme (trois diagrammes de l'appli à comparer). */
export function phasesPapierLoiBinomiale(e: E): PhaseLoiBinomiale[] {
  return phasesPourExercice(e).filter((p) => p !== "bDiagramme");
}

/** Corrigé du PAPIER (une lettre par étape papier). */
export function correctionDetailleeLoiBinomiale(e: E): EtapeCorrection[] {
  return versLettresPapier(correctionEcranLoiBinomiale(e), phasesPourExercice(e), phasesPapierLoiBinomiale(e));
}
