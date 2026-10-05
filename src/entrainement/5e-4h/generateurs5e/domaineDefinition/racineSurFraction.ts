import type { EnsembleReelGuide, ExerciceRacineSurFraction, SlotCE, StructureRacineSurFraction } from "../../core5e/domaineDefinition.types";
import { entierAleatoire, entierNonNulAleatoire, deuxEntiersDistincts, signeAleatoire } from "./aleatoire";
import { formatPolynomeLatex, polynomeLineaire, polynomeQuadratiqueDepuisRacines } from "./polynome";
import { excluPointDeMorceaux, resoudreLineaireSigne, resoudreQuadratiqueSigne } from "./resolutionSigne";

function numerateurConstant(): string {
  return String(entierNonNulAleatoire(1, 9));
}

/**
 * Construction "points cibles d'abord" (même principe que gen54/gen58 côté 4e) : la valeur exclue
 * `d` du dénominateur est choisie EN PREMIER, puis le radicande N(x) est construit pour que `d`
 * tombe délibérément dedans ou dehors de sa zone solution — jamais un tirage indépendant suivi
 * d'une vérification a posteriori, qui biaiserait la répartition 50/50 exigée par la spec.
 *
 * Simplification assumée pour cette première livraison (signalée explicitement) : le signe
 * directeur de N(x) est fixé (a=1 en linéaire, a=-1 en quadratique — solution toujours "vers la
 * droite"/"intervalle borné") plutôt que tiré aléatoirement, pour garder la construction de la
 * cible tractable ; D(x) reste toujours linéaire (jamais la variante cubique à mise en évidence
 * mentionnée dans la spec).
 */
function construireLineaire(d: number, dedans: boolean): { coeffs: number[]; latex: string; resolution: EnsembleReelGuide } {
  const offset = entierAleatoire(1, 5);
  const seuil = dedans ? d - offset : d + offset;
  const coeffs = polynomeLineaire(1, -seuil);
  return { coeffs, latex: formatPolynomeLatex(coeffs), resolution: resoudreLineaireSigne(1, -seuil, "≥") };
}

function construireQuadratique(d: number, dedans: boolean): { coeffs: number[]; latex: string; resolution: EnsembleReelGuide } {
  const offset1 = entierAleatoire(1, 4);
  const offset2 = entierAleatoire(1, 4);
  const [rmin, rmax] = dedans ? [d - offset1, d + offset2] : [d + offset1, d + offset1 + offset2];
  const coeffs = polynomeQuadratiqueDepuisRacines(-1, rmin, rmax);
  return { coeffs, latex: formatPolynomeLatex(coeffs), resolution: resoudreQuadratiqueSigne(-1, rmin, rmax, "≥") };
}

/** D(x) > 0 STRICT, D EST le radicande (sous-variante "nSurRacineD", point 7) — jamais une valeur
 * particulière exclue à construire, contrairement à `construireLineaire`/`construireQuadratique`
 * (qui ciblent une exclusion de dénominateur SÉPARÉE du radicande) : ici il n'y a qu'UNE condition. */
function construireLineaireStrict(): { coeffs: number[]; latex: string; resolution: EnsembleReelGuide } {
  const a = entierNonNulAleatoire(1, 3);
  const b = entierAleatoire(-9, 9);
  const coeffs = polynomeLineaire(a, b);
  return { coeffs, latex: formatPolynomeLatex(coeffs), resolution: resoudreLineaireSigne(a, b, ">") };
}

function construireQuadratiqueStrict(): { coeffs: number[]; latex: string; resolution: EnsembleReelGuide } {
  const [r1, r2] = deuxEntiersDistincts(-6, 6);
  const a = signeAleatoire();
  const coeffs = polynomeQuadratiqueDepuisRacines(a, r1, r2);
  return { coeffs, latex: formatPolynomeLatex(coeffs), resolution: resoudreQuadratiqueSigne(a, r1, r2, ">") };
}

/** Sous-variante "nSurRacineD" (point 7) — 1 seule CE : D(x)>0 STRICT (jamais juste ≥0, le
 * radicande étant ici au DÉNOMINATEUR — piège central : √D=0 annulerait la fraction). */
function construireNSurRacineD(radicandeQuadratique: boolean): ExerciceRacineSurFraction {
  const d = radicandeQuadratique ? construireQuadratiqueStrict() : construireLineaireStrict();
  const slot: SlotCE = { id: "radicande", role: "radicande", latex: d.latex, texte: d.latex, coeffs: d.coeffs, symboleAttendu: ">" };
  return {
    famille: "racineSurFraction",
    structure: "nSurRacineD",
    radicandeQuadratique,
    exclusionDansIntervalle: false,
    slots: [slot],
    fLatex: `f(x) = \\dfrac{${numerateurConstant()}}{\\sqrt{${d.latex}}}`,
    resolutionRadicande: d.resolution,
    resolutionDenominateur: null,
    domf: d.resolution,
    aucuneCE: false,
  };
}

/** Sous-variante "racineSurD" (existant) — 2 CE indépendantes (radicande ≥0, dénominateur ≠0). */
function construireRacineSurD(radicandeQuadratique: boolean, exclusionDansIntervalle: boolean): ExerciceRacineSurFraction {
  const d = entierAleatoire(-6, 6);
  const n = radicandeQuadratique ? construireQuadratique(d, exclusionDansIntervalle) : construireLineaire(d, exclusionDansIntervalle);

  const cDenominateur = entierNonNulAleatoire(1, 3);
  const denCoeffs = polynomeLineaire(cDenominateur, -cDenominateur * d);
  const denLatex = formatPolynomeLatex(denCoeffs);

  const slotRadicande: SlotCE = { id: "radicande", role: "radicande", latex: n.latex, texte: n.latex, coeffs: n.coeffs, symboleAttendu: "≥" };
  const slotDenominateur: SlotCE = {
    id: "denominateur",
    role: "denominateur",
    latex: denLatex,
    texte: denLatex,
    coeffs: denCoeffs,
    symboleAttendu: "≠",
  };

  const morceauxFinaux = excluPointDeMorceaux(n.resolution.morceaux, d);

  return {
    famille: "racineSurFraction",
    structure: "racineSurD",
    radicandeQuadratique,
    exclusionDansIntervalle,
    fLatex: `f(x) = \\dfrac{\\sqrt{${n.latex}}}{${denLatex}}`,
    slots: [slotRadicande, slotDenominateur],
    resolutionRadicande: n.resolution,
    resolutionDenominateur: d,
    domf: { forme: "intervalles", points: [], morceaux: morceauxFinaux },
    aucuneCE: false,
  };
}

export function construireRacineSurFraction(structure: StructureRacineSurFraction, radicandeQuadratique: boolean, exclusionDansIntervalle: boolean): ExerciceRacineSurFraction {
  return structure === "nSurRacineD" ? construireNSurRacineD(radicandeQuadratique) : construireRacineSurD(radicandeQuadratique, exclusionDansIntervalle);
}

/** Tirage 50/50 sur la structure (point 7), équilibré (~50/50) sur `radicandeQuadratique` et
 * `exclusionDansIntervalle` (ce dernier sans objet pour "nSurRacineD", ignoré dans ce cas). */
export function genererExerciceRacineSurFraction(): ExerciceRacineSurFraction {
  const structure: StructureRacineSurFraction = Math.random() < 0.5 ? "racineSurD" : "nSurRacineD";
  return construireRacineSurFraction(structure, Math.random() < 0.5, Math.random() < 0.5);
}
