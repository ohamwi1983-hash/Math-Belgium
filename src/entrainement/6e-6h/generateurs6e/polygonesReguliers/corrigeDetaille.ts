import type { ExercicePolygones, ExerciceSommets, PointEntier } from "../../core6e/polygonesReguliers.types";
import type { EtapeCorrection, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, ligne, lignesDepuisChaine, piege, resultat, utilise, verification } from "../../../export/corrigeTableau";
import { affixeLatex, complexeExactLatex, cosSinPas, radicalLatexParenthese, sommetExact, sommetsAutres, tournerExact, vecteurCA } from "../../moteur6e/modelePolygonesReguliers";
import { phasesDe, type PhasePolygones } from "../../moteur6e/typesPolygonesReguliers";
import { calculEtape, controleSommets, methodeFragments, piegeEtape, reponseFragments } from "../../ui6e/formatPolygonesReguliers";
import { figureCorrigeSommetsSvg } from "../../ui6e/figurePolygonesReguliers";

/**
 * Corrigé détaillé « comme au tableau » de `6gen97` (polygones réguliers et racines n-ièmes) —
 * règle `.claude/rules/feuilles-evaluations.md` (« Corrigé détaillé — comme au tableau »). Par
 * écran : ce qu'on utilise (méthode de l'écran), les chaînes de calcul de l'écran (`calculEtape`)
 * éclatées en une transformation par ligne, le produit (a − c)·e^{iθ} développé pour chaque
 * sommet, le résultat (réponse de l'écran), le contrôle géométrique, le piège.
 */

const LETTRES = ["a", "b", "c", "d"];

function parP(p: PointEntier): string {
  const tx = affixeLatex(p);
  return p.x === 0 || p.y === 0 ? (tx.startsWith("-") ? `(${tx})` : tx) : `(${tx})`;
}

/** zₖ = c + (a − c)·e^{2ikπ/n} : formule, cos et sin exacts, produit développé, puis + c. */
function lignesSommet(e: ExerciceSommets, k: number): LigneCalcul[] {
  const ca = vecteurCA(e);
  const { cos, sin } = cosSinPas(e.n, k);
  const C = radicalLatexParenthese(cos);
  const S = radicalLatexParenthese(sin);
  const tourne = tournerExact(ca, cos, sin);
  const c = affixeLatex(e.c);
  const centreNul = e.c.x === 0 && e.c.y === 0;
  const prefixe = centreNul ? "" : `${parP(e.c)}+`;
  // Produits nuls omis (x = 0, y = 0, cos = 0 ou sin = 0).
  const nul = (r: string) => r === "0";
  const prod = (n: number, r: string) => (n === 0 || nul(r) ? "" : `${n}\\cdot ${r}`);
  const joindre = (a: string, signe: string, b: string) => (a && b ? `${a}${signe}${b}` : a || (b ? (signe === "-" ? `-${b}` : b) : "0"));
  const yP = ca.y < 0 ? `(${ca.y})` : `${ca.y}`;
  const reTxt = joindre(prod(ca.x, C), "-", ca.y === 0 || nul(S) ? "" : `${yP}\\cdot ${S}`);
  const imTxt = joindre(prod(ca.x, S), "+", ca.y === 0 || nul(C) ? "" : `${yP}\\cdot ${C}`);
  const [formule, substitution] = lignesDepuisChaine(calculEtape(e, k === 1 ? "sommet1" : "autresSommets")[k === 1 ? 0 : sommetsAutres(e).indexOf(k)]).map((l) => l.latex);
  const lignes: LigneCalcul[] = [ligne(formule, "rotation de centre C, angle 2kπ/n"), ligne(substitution, "valeurs exactes de cos et sin")];
  lignes.push(ligne(`=${prefixe}\\left(${reTxt}\\right)+\\left(${imTxt}\\right)i`, "(x + yi)(p + qi) = (xp − yq) + (xq + yp)i"));
  if (!centreNul) lignes.push(ligne(`=${prefixe}\\left(${complexeExactLatex(tourne)}\\right)`, "on calcule"));
  lignes.push(ligne(`=${complexeExactLatex(sommetExact(e, k))}`, centreNul ? "on calcule" : `on ajoute c = ${c.replace(/-/g, "−")}`));
  return lignes;
}

/** Chaîne(s) de l'écran, coupées aux « , \qquad » et « ⟹ » puis éclatées aux « = ». */
function lignesChaines(chaines: string[], justifs: (string | undefined)[][] = []): LigneCalcul[] {
  return chaines.flatMap((ch, i) =>
    ch
      .split(/,\\qquad |\\ \\Longrightarrow\\ |\\ \\Longleftrightarrow\\ /)
      .flatMap((morceau, j) => lignesDepuisChaine(morceau.trim(), justifs[i + j] ?? [])),
  );
}

const JUSTIFS: Partial<Record<PhasePolygones, (string | undefined)[][]>> = {
  formule: [["rotation de centre C et d'angle 2π/n, k fois"], ["on isole zₖ"]],
  donnees: [["affixe du vecteur CA", "on calcule"], ["un tour partagé en n"]],
  rayon: [["module de z₀", "|x + yi| = √(x² + y²)", "on calcule", "on simplifie la racine"]],
  cote: [["on met z₀ en facteur", "|z₀| = r ; on factorise par l'exponentielle de l'angle moitié", "formule d'Euler, le facteur de module 1 disparaît", "|2i| = 2"], ["on remplace r et sin(π/n)", "on calcule"]],
  perimetre: [["n côtés de longueur ℓ", "on remplace ℓ", "on calcule"]],
  aire: [["n triangles isocèles d'angle au sommet 2π/n", "on remplace r² et sin(2π/n)", "on calcule"]],
  identite: [["on multiplie S par ω"], ["on soustrait : les termes intermédiaires s'annulent"], []],
  conclusion: [["puissance d'une puissance", "un tour complet : cos 2π + i sin 2π = 1"], [], ["identité de l'étape 1, ω ≠ 1", "ωⁿ = 1", ""]],
  somme: [["zₖ = c + (a − c)ωᵏ, somme sur k", "S = 0", "on calcule"]],
  sansA: [["on retire z₀ = a", "valeur de l'étape précédente", "on calcule"]],
};

function lignesEtape(e: ExercicePolygones, phase: PhasePolygones, sq: string): EtapeCorrection[] {
  const L: EtapeCorrection[] = [utilise(sq, methodeFragments(e, phase))];
  if ((phase === "sommet1" || phase === "autresSommets") && e.variante === "sommets") {
    const ks = phase === "sommet1" ? [1] : sommetsAutres(e);
    for (const k of ks) L.push(calcul(sq, lignesSommet(e, k), [], ks.length > 1 ? `Sommet Z${"₀₁₂₃₄₅₆₇₈"[k]}` : "Calcul"));
  } else {
    L.push(calcul(sq, lignesChaines(calculEtape(e, phase), JUSTIFS[phase])));
  }
  const avecFigure = phase === "autresSommets" && e.variante === "sommets";
  L.push({ ...resultat(sq, reponseFragments(e, phase)), ...(avecFigure ? { figureHtml: figureCorrigeSommetsSvg(e) } : {}) });
  if (avecFigure) {
    const controle = controleSommets(e as ExerciceSommets);
    if (controle) L.push(verification(sq, controle.filter((fr, i) => !(i === 0 && fr.type === "texte" && fr.valeur.startsWith("Contrôle")))));
  }
  L.push(piege(sq, piegeEtape(e, phase)));
  return L;
}

export function correctionDetailleePolygones(e: ExercicePolygones): EtapeCorrection[] {
  return phasesDe(e).flatMap((phase, i) => lignesEtape(e, phase, LETTRES[i]));
}
