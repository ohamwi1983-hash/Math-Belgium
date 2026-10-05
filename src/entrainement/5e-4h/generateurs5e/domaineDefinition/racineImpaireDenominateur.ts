import type { ExerciceRacineImpaireDenominateur, SlotCE, SousCasDenominateurQuadratique } from "../../core5e/domaineDefinition.types";
import { choisirParmi, deuxEntiersDistincts, entierAleatoire, entierNonNulAleatoire, signeAleatoire } from "./aleatoire";
import { formatPolynomeLatex, polynomeCarreParfait, polynomeLineaire, polynomeQuadratiqueDepuisRacines } from "./polynome";
import { ensemblePrivePoints, ensembleReel } from "./resolutionSigne";

const INDICES_IMPAIRS = [3, 5];
const SOUS_CAS_DEGRE2: SousCasDenominateurQuadratique[] = ["racinesDistinctes", "racineDouble", "discriminantNegatif"];

/** N(x)/∛(D(x)) — indice impair, CE = D(x)≠0 UNIQUEMENT (piège central : pas de condition ≥0,
 * contrairement à une racine paire au dénominateur). Enrichissement (point 5) : D(x) degré 1
 * (existant) ou 2 (nouveau, 3 sous-cas pondérés — "discriminantNegatif" ⇒ D toujours ≠0, gate=
 * "Aucune CE" par le principe unifié 1.10) ; N(x) constante (existant) ou degré 1/2 (nouveaux,
 * purement visuels — n'introduisent jamais de CE supplémentaire). */

interface Denominateur {
  coeffs: number[];
  latex: string;
  domf: ReturnType<typeof ensemblePrivePoints>;
  aucuneCE: boolean;
  sousCasDegre2: SousCasDenominateurQuadratique | null;
}

function construireDenominateurDegre1(): Denominateur {
  const a = entierNonNulAleatoire(1, 3);
  const b = entierAleatoire(-9, 9);
  const coeffs = polynomeLineaire(a, b);
  return { coeffs, latex: formatPolynomeLatex(coeffs), domf: ensemblePrivePoints([-b / a]), aucuneCE: false, sousCasDegre2: null };
}

function construireDenominateurDegre2(sousCas: SousCasDenominateurQuadratique): Denominateur {
  if (sousCas === "racinesDistinctes") {
    const [r1, r2] = deuxEntiersDistincts(-6, 6);
    const coeffs = polynomeQuadratiqueDepuisRacines(signeAleatoire(), r1, r2);
    return { coeffs, latex: formatPolynomeLatex(coeffs), domf: ensemblePrivePoints([r1, r2]), aucuneCE: false, sousCasDegre2: sousCas };
  }
  if (sousCas === "racineDouble") {
    const r = entierAleatoire(-6, 6);
    const coeffs = polynomeCarreParfait(signeAleatoire(), r);
    return { coeffs, latex: formatPolynomeLatex(coeffs), domf: ensemblePrivePoints([r]), aucuneCE: false, sousCasDegre2: sousCas };
  }
  // discriminantNegatif — forme x²+c (c>0, discriminant -4c<0) : D(x) toujours strictement positif,
  // jamais nul sur R ⇒ CE structurellement "toujours vraie" (principe unifié 1.10).
  const c = entierAleatoire(1, 9);
  const coeffs = [c, 0, 1];
  return { coeffs, latex: formatPolynomeLatex(coeffs), domf: ensembleReel(), aucuneCE: true, sousCasDegre2: sousCas };
}

interface Numerateur {
  latex: string;
  degre: 0 | 1 | 2;
}

function construireNumerateur(degre: 0 | 1 | 2): Numerateur {
  if (degre === 0) return { latex: String(entierNonNulAleatoire(1, 9)), degre };
  if (degre === 1) {
    const a = entierNonNulAleatoire(1, 3);
    const b = entierAleatoire(-9, 9);
    return { latex: formatPolynomeLatex(polynomeLineaire(a, b)), degre };
  }
  const [r1, r2] = deuxEntiersDistincts(-6, 6);
  return { latex: formatPolynomeLatex(polynomeQuadratiqueDepuisRacines(signeAleatoire(), r1, r2)), degre };
}

export function construireRacineImpaireDenominateur(denominateurDegre: 1 | 2, numerateurDegre: 0 | 1 | 2): ExerciceRacineImpaireDenominateur {
  const den = denominateurDegre === 1 ? construireDenominateurDegre1() : construireDenominateurDegre2(choisirParmi(SOUS_CAS_DEGRE2));
  const num = construireNumerateur(numerateurDegre);
  const indice = choisirParmi(INDICES_IMPAIRS);

  const slot: SlotCE = {
    id: "denominateur",
    role: "denominateur",
    latex: den.latex,
    texte: den.latex,
    coeffs: den.coeffs,
    symboleAttendu: "≠",
    decoys: numerateurDegre >= 1 ? [{ id: "numerateur", latex: num.latex, texte: num.latex }] : undefined,
  };

  return {
    famille: "racineImpaireDenominateur",
    denominateurDegre,
    sousCasDegre2: den.sousCasDegre2,
    numerateurDegre,
    fLatex: `f(x) = \\dfrac{${num.latex}}{\\sqrt[${indice}]{${den.latex}}}`,
    slots: [slot],
    resolution: den.domf,
    domf: den.domf,
    aucuneCE: den.aucuneCE,
  };
}

/** Tirage 50/50 sur le degré du radicande, uniforme sur les 3 sous-cas de degré 2, uniforme sur le
 * degré du numérateur (0/1/2). */
export function genererExerciceRacineImpaireDenominateur(): ExerciceRacineImpaireDenominateur {
  const denominateurDegre: 1 | 2 = Math.random() < 0.5 ? 1 : 2;
  const numerateurDegre = choisirParmi([0, 1, 2] as const);
  return construireRacineImpaireDenominateur(denominateurDegre, numerateurDegre);
}
