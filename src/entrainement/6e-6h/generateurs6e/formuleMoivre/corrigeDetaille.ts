import type { ExerciceFormuleMoivre, TermeDeveloppementMoivre } from "../../core6e/formuleMoivre.types";
import type { EtapeCorrection, FragmentConsigne, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import { aideNiveau1, formatReponseAttenduePhaseLatex } from "../../ui6e/formatFormuleMoivre";
import { phasesPourExercice, type PhaseFormuleMoivre } from "../../moteur6e/typesFormuleMoivre";
import { frac, fracLatex } from "../../ui6e/corrigeComplexes";

/**
 * Corrigé détaillé « comme au tableau » de `6gen38` (formule de Moivre : développer cos(nx) et
 * sin(nx)) — règle `.claude/rules/feuilles-evaluations.md` (« Corrigé détaillé — comme au
 * tableau »). Étape 1 : binôme de Newton terme à terme ; étape 2 : chaque puissance de i simplifiée
 * (une ligne par terme) ; étape 3 : identification, et, pour une cible en cos(x) seul, substitution
 * sin²(x) = 1 − cos²(x), développement terme à terme, puis regroupement (résultat de l'écran).
 */

const LETTRES = "abcdefghij";
const COURS = "(cours, § 5)";
const nx = (e: ExerciceFormuleMoivre) => `${e.n}x`;

const coefL = (c: number) => (c === 1 ? "" : `${c}`);
const cosP = (p: number) => (p === 0 ? "" : p === 1 ? "\\cos(x)" : `\\cos^{${p}}(x)`);
const sinP = (p: number) => (p === 0 ? "" : p === 1 ? "\\sin(x)" : `\\sin^{${p}}(x)`);
const produit = (...f: string[]) => f.filter((x) => x !== "").join("") || "1";
const iSin = (k: number) => (k === 0 ? "" : k === 1 ? "(i\\sin(x))" : `(i\\sin(x))^{${k}}`);
const PUISSANCES_I = ["1", "i", "-1", "-i"];

function somme(termes: { s: number; m: string }[]): string {
  if (termes.length === 0) return "0";
  return termes.map((t, i) => `${t.s < 0 ? "-" : i === 0 ? "" : "+"}${t.m}`).join("");
}

/** Monômes en cos(x) (coefficient par puissance) : somme écrite par puissances décroissantes. */
function polynomeCos(coefs: Map<number, number>): string {
  const termes = [...coefs.entries()].filter(([, c]) => c !== 0).sort((a, b) => b[0] - a[0]);
  return somme(termes.map(([p, c]) => ({ s: c, m: p === 0 ? `${Math.abs(c)}` : produit(coefL(Math.abs(c)), cosP(p)) })));
}

function binome(m: number, j: number): number {
  let r = 1;
  for (let k = 1; k <= j; k++) r = (r * (m - k + 1)) / k;
  return r;
}

function sansTexte(s: string): string {
  return s.replace(/^\\text\{[^}]*\}/, "").replace(/\\text\{ ;\}$/, "");
}

/** Termes ±C·cosᵖ(x)·sin²ᵐ(x) (sin déjà divisé `decalage` fois) → substitution, développement, regroupement. */
function lignesCosSeul(nom: string, termes: TermeDeveloppementMoivre[], signe: (t: TermeDeveloppementMoivre) => number, decalage: number, final: string): LigneCalcul[] {
  const substitue = somme(
    termes.map((t) => {
      const m = (t.k - decalage) / 2;
      return { s: signe(t), m: produit(coefL(t.coefBinomial), cosP(t.puissanceCos), m === 0 ? "" : m === 1 ? "\\left(1-\\cos^2(x)\\right)" : `\\left(1-\\cos^2(x)\\right)^{${m}}`) };
    }),
  );
  // Développement terme à terme (binôme de (1 − c²)ᵐ), sans regrouper.
  const monomes: { s: number; m: string }[] = [];
  const total = new Map<number, number>();
  for (const t of termes) {
    const m = (t.k - decalage) / 2;
    for (let j = 0; j <= m; j++) {
      const c = signe(t) * t.coefBinomial * binome(m, j) * (j % 2 === 0 ? 1 : -1);
      const p = t.puissanceCos + 2 * j;
      monomes.push({ s: c, m: p === 0 ? `${Math.abs(c)}` : produit(coefL(Math.abs(c)), cosP(p)) });
      total.set(p, (total.get(p) ?? 0) + c);
    }
  }
  const lignes: LigneCalcul[] = [ligne(`${nom}=${substitue}`, "sin²(x) = 1 − cos²(x)")];
  const developpe = somme(monomes);
  if (developpe !== substitue) lignes.push(ligne(`=${developpe}`, "on développe chaque terme"));
  const regroupe = polynomeCos(total);
  if (regroupe !== developpe) lignes.push(ligne(`=${regroupe}`, "on regroupe les termes de même puissance"));
  if (regroupe !== final) lignes.push(ligne(`=${final}`));
  return lignes;
}

export function piegeEtape(e: ExerciceFormuleMoivre, phase: PhaseFormuleMoivre): FragmentConsigne[] {
  if (phase === "ecran1") return [texte(`Oublier les coefficients binomiaux : ce sont ceux de la ligne ${e.n} du triangle de Pascal.`)];
  if (phase === "ecran2") return [texte("Mal simplifier les puissances de i : "), latex("i^2=-1"), texte(" et "), latex("i^3=-i"), texte(", donc les signes alternent d'un terme réel (ou imaginaire) au suivant.")];
  if (e.cible === "cosSeul")
    return e.n >= 4
      ? [texte("Développer "), latex("\\left(1-\\cos^2(x)\\right)^2"), texte(" comme "), latex("1-\\cos^4(x)"), texte(" : c'est "), latex("1-2\\cos^2(x)+\\cos^4(x)"), texte(".")]
      : [texte("Remplacer "), latex("\\sin^2(x)"), texte(" par "), latex("1+\\cos^2(x)"), texte(" au lieu de "), latex("1-\\cos^2(x)"), texte(".")];
  if (e.cible === "sinSurSin") return [texte("Oublier de diviser chaque terme par "), latex("\\sin(x)"), texte(", ou laisser des puissances paires de "), latex("\\sin(x)"), texte(" sans les remplacer.")];
  return [texte("Garder le facteur "), latex("i"), texte(" dans "), latex(`\\sin(${nx(e)})`), texte(" : c'est le coefficient de "), latex("i"), texte(", un nombre réel.")];
}

function lignesEtape(e: ExerciceFormuleMoivre, phase: PhaseFormuleMoivre, sq: string): EtapeCorrection[] {
  const L: EtapeCorrection[] = [];
  const reels = e.termes.filter((t) => t.k % 2 === 0);
  const imag = e.termes.filter((t) => t.k % 2 === 1);
  if (phase === "ecran1") {
    const coefs = e.termes.map((x) => x.coefBinomial).join(",\\ ");
    L.push(utilise(sq, [texte(`Binôme de Newton ${COURS} : `), latex("(a+b)^n=\\sum_{k=0}^{n}C_n^k\\,a^{n-k}b^k"), texte(", avec "), latex("a=\\cos(x)"), texte(", "), latex("b=i\\sin(x)"), texte(" et les coefficients de la ligne "), latex(`${e.n}`), texte(" du triangle de Pascal : "), latex(coefs), texte(".")]));
    L.push(
      calcul(sq, [
        ligne(`(\\cos(x)+i\\sin(x))^{${e.n}}=\\sum_{k=0}^{${e.n}}C_{${e.n}}^{k}\\cos^{${e.n}-k}(x)\\,(i\\sin(x))^{k}`, "binôme de Newton"),
        ligne(`=${e.termes.map((t) => produit(coefL(t.coefBinomial), cosP(t.puissanceCos), iSin(t.k))).join("+")}`, [texte("on écrit les termes "), latex(`k=0,\\ldots,${e.n}`)]),
      ]),
    );
    L.push(resultat(sq, [latex(`(\\cos(x)+i\\sin(x))^{${e.n}}=${formatReponseAttenduePhaseLatex(e, "ecran1")[0]}`)]));
  } else if (phase === "ecran2") {
    const a1 = aideNiveau1(e, phase);
    L.push(utilise(sq, [texte("On développe "), latex("(i\\sin(x))^k=i^k\\sin^k(x)"), texte(` ; les puissances de i se répètent tous les 4 exposants ${COURS.replace("5", "1")} : `), ...(a1.latex ? [latex(a1.latex)] : [])]));
    L.push(
      calcul(
        sq,
        e.termes
          .filter((t) => t.k > 0)
          .map((t) => {
            const valeur = PUISSANCES_I[t.k % 4];
            const signe = t.k % 2 === 0 ? t.reI : t.imI;
            const mag = produit(coefL(t.coefBinomial), t.k % 2 === 1 ? "i" : "", cosP(t.puissanceCos), sinP(t.k));
            return ligne(`${produit(coefL(t.coefBinomial), cosP(t.puissanceCos), iSin(t.k))}=${signe < 0 ? "-" : ""}${mag}`, [texte("car "), latex(`i^{${t.k}}=${valeur}`)]);
          }),
      ),
    );
    const [r, im] = formatReponseAttenduePhaseLatex(e, "ecran2").map(sansTexte);
    L.push(resultat(sq, [texte("Termes réels (k pair) : "), latex(r), texte(" ; termes imaginaires (k impair) : "), latex(im)]));
  } else {
    const finales = formatReponseAttenduePhaseLatex(e, "ecran3").map(sansTexte);
    const cosNx = somme(reels.map((t) => ({ s: t.reI, m: produit(coefL(t.coefBinomial), cosP(t.puissanceCos), sinP(t.k)) })));
    const sinNx = somme(imag.map((t) => ({ s: t.imI, m: produit(coefL(t.coefBinomial), cosP(t.puissanceCos), sinP(t.k)) })));
    if (e.cible === "standard") {
      L.push(utilise(sq, [texte(`Formule de Moivre ${COURS} : `), latex(`(\\cos(x)+i\\sin(x))^{${e.n}}=\\cos(${nx(e)})+i\\sin(${nx(e)})`), texte(". Deux complexes égaux ont la même partie réelle et la même partie imaginaire.")]));
      L.push(calcul(sq, [ligne(`\\cos(${nx(e)})=${cosNx}`, "parties réelles"), ligne(`\\sin(${nx(e)})=${sinNx}`, "coefficients de i")]));
      L.push(resultat(sq, finales.flatMap((l, i) => (i === 0 ? [latex(l)] : [texte(" et "), latex(l)]))));
    } else if (e.cible === "cosSeul") {
      L.push(utilise(sq, [latex(`\\cos(${nx(e)})`), texte(" est la partie réelle (formule de Moivre) ; on remplace chaque puissance paire de "), latex("\\sin(x)"), texte(" grâce à "), latex("\\sin^2(x)=1-\\cos^2(x)"), texte(", puis on développe et on regroupe.")]));
      L.push(calcul(sq, [ligne(`\\cos(${nx(e)})=${cosNx}`, "partie réelle de l'étape 2"), ...lignesCosSeul("", reels, (t) => t.reI, 0, finales[0].split("=").slice(1).join("="))]));
      L.push(resultat(sq, [latex(finales[0])]));
    } else {
      const divise = somme(imag.map((t) => ({ s: t.imI, m: produit(coefL(t.coefBinomial), cosP(t.puissanceCos), sinP(t.k - 1)) })));
      L.push(utilise(sq, [latex(`\\sin(${nx(e)})`), texte(" est le coefficient de i (formule de Moivre) ; on divise par "), latex("\\sin(x)"), texte(", puis on remplace "), latex("\\sin^2(x)=1-\\cos^2(x)"), texte(", on développe et on regroupe.")]));
      L.push(
        calcul(sq, [
          ligne(`\\sin(${nx(e)})=${sinNx}`, "coefficient de i de l'étape 2"),
          ligne(`\\dfrac{\\sin(${nx(e)})}{\\sin(x)}=${divise}`, "on divise chaque terme par sin(x)"),
          ...lignesCosSeul("", imag, (t) => t.imI, 1, finales[0].split("=").slice(1).join("=")),
        ]),
      );
      L.push(resultat(sq, [latex(finales[0])]));
    }
    if (e.cible !== "standard") {
      // Vérification en x = π/3 (cos x = 1/2) : les deux membres donnent la même valeur.
      const poly = finales[0].split("=").slice(1).join("=");
      const substitue = poly.replace(/\\cos\^\{(\d+)\}\(x\)/g, "\\left(\\frac{1}{2}\\right)^{$1}").replace(/\\cos\(x\)/g, "\\left(\\frac{1}{2}\\right)");
      const valeur = e.cible === "cosSeul" ? Math.cos((e.n * Math.PI) / 3) : Math.sin((e.n * Math.PI) / 3) / Math.sin(Math.PI / 3);
      const v = fracLatex(frac(Math.round(2 * valeur), 2), { decimal: false });
      const gauche = e.cible === "cosSeul" ? `\\cos\\dfrac{${e.n}\\pi}{3}` : `\\dfrac{\\sin\\frac{${e.n}\\pi}{3}}{\\sin\\frac{\\pi}{3}}`;
      L.push(
        verification(sq, [texte("En "), latex("x=\\dfrac{\\pi}{3}"), texte(" (où "), latex("\\cos x=\\dfrac{1}{2}"), texte("), les deux membres doivent être égaux :")], [
          ligne(`${gauche}=${v}`, "valeur remarquable"),
          ligne(`${substitue}=${v}`, "même valeur ✓"),
        ]),
      );
    }
  }
  L.push(piege(sq, piegeEtape(e, phase)));
  return L;
}

export function correctionDetailleeFormuleMoivre(e: ExerciceFormuleMoivre): EtapeCorrection[] {
  return phasesPourExercice(e).flatMap((phase, i) => lignesEtape(e, phase, LETTRES[i]));
}
