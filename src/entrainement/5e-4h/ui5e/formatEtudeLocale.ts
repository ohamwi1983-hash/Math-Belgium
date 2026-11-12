/**
 * Couche présentation (5e) — consignes/labels/aides/LaTeX pour 5gen29 ("Étude locale (extremums et
 * points critiques)"). Dépend librement des couches inférieures (jamais l'inverse) : réutilise
 * `deriveeFEtudeLocale`/`valeurFEtudeLocale`/`valeurNumeriqueRacineEtudeLocale`
 * (`generateurs5e/etudeLocale/index.ts`) — même patron que `formatTangentes.ts` (5gen28).
 */
import type {
  ClassificationExtremum,
  ClassificationInflexion,
  ExerciceEtudeLocale,
  RacineEtudeLocale,
  ValeurLigne2Tableau,
  ValeurSigneTableau,
} from "../core5e/etudeLocale.types";
import type { EnsembleReelGuide } from "../core5e/domaineDefinition.types";
import { valeurFEtudeLocale, valeurNumeriqueRacineEtudeLocale } from "../generateurs5e/etudeLocale/index";
import type { EcranEtudeLocale } from "../moteur5e/typesEtudeLocale";
import { ordreEcransEtudeLocale } from "../moteur5e/typesEtudeLocale";
import { domaineAttendu, xDesExtremums, xDesInflexions } from "../moteur5e/verificationEtudeLocale";

// ============================================================================
// Fragments LaTeX de bas niveau.
// ============================================================================

/** Polynôme à partir de coefficients ASCENDANTS [constante, x, x², ...]. */
function formatPolynomeVarLatex(coeffs: number[], symbole: string): string {
  let out = "";
  let premier = true;
  for (let d = coeffs.length - 1; d >= 0; d--) {
    const coeff = coeffs[d];
    if (coeff === 0) continue;
    const abs = Math.abs(coeff);
    const signe = coeff < 0 ? "-" : premier ? "" : "+";
    const variable = d === 0 ? "" : d === 1 ? symbole : `${symbole}^{${d}}`;
    const coeffAffiche = abs === 1 && d !== 0 ? "" : `${abs}`;
    out += `${signe}${coeffAffiche}${variable}`;
    premier = false;
  }
  return out === "" ? "0" : out;
}

function formatDenominateurInterieurLatex(e: number): string {
  if (e === 0) return "x";
  return e > 0 ? `x-${e}` : `x+${-e}`;
}

/** "(x-e)²+k" (ou -|k|) — jamais "+(-k)" (convention transversale, signe toujours distribué).
 * Parenthèses autour de l'intérieur UNIQUEMENT quand e≠0 (expression composée "x-e"/"x+e") —
 * jamais autour d'un "x" seul, qui donnerait "(x)²" superflu (audit transversal,
 * `promptauditparenthesessuperflues.md`). */
function formatDLatex(e: number, k: number): string {
  const interieur = formatDenominateurInterieurLatex(e);
  const base = e === 0 ? `${interieur}^2` : `(${interieur})^2`;
  if (k === 0) return base;
  return k > 0 ? `${base}+${k}` : `${base}-${-k}`;
}

function formatRacineLatex(r: RacineEtudeLocale): string {
  if (r.exact) {
    const { num, den } = r.valeur;
    if (den === 1) return `${num}`;
    return num < 0 ? `-\\dfrac{${-num}}{${den}}` : `\\dfrac{${num}}{${den}}`;
  }
  const centreTxt = r.centre === 0 ? "" : `${r.centre}`;
  const sqrtTxt = `\\sqrt{${r.radicande}}`;
  if (r.centre === 0) return r.signe < 0 ? `-${sqrtTxt}` : sqrtTxt;
  return r.signe < 0 ? `${centreTxt}-${sqrtTxt}` : `${centreTxt}+${sqrtTxt}`;
}

// ============================================================================
// f(x)/f'(x)/f''(x) — bloc de données (f'(x) toujours affichée, f''(x) uniquement si avancé).
// ============================================================================

export function formatFDeXLatex(exercice: ExerciceEtudeLocale): string {
  if (exercice.type === "polynomiale") return `f(x)=${formatPolynomeVarLatex([exercice.d, exercice.c, exercice.b, exercice.a], "x")}`;
  return `f(x)=\\dfrac{${exercice.c}}{${formatDLatex(exercice.e, exercice.k)}}`;
}

export function formatFPrimeDeXLatex(exercice: ExerciceEtudeLocale): string {
  if (exercice.type === "polynomiale") return `f'(x)=${formatPolynomeVarLatex([exercice.c, 2 * exercice.b, 3 * exercice.a], "x")}`;
  const { c, e, k } = exercice;
  const numerateur = formatPolynomeVarLatex([2 * c * e, -2 * c], "x");
  return `f'(x)=\\dfrac{${numerateur}}{\\left[${formatDLatex(e, k)}\\right]^2}`;
}

/** UNIQUEMENT affichée si `niveau==="avance"` — voir la tâche : f''(x) n'est jamais montrée pour
 * un exercice "base" (aucun écran n'en a besoin). */
export function formatFSecondeDeXLatex(exercice: ExerciceEtudeLocale): string {
  if (exercice.type === "polynomiale") return `f''(x)=${formatPolynomeVarLatex([2 * exercice.b, 6 * exercice.a], "x")}`;
  const { c, e, k } = exercice;
  const numerateur = formatPolynomeVarLatex([6 * c * e * e - 2 * c * k, -12 * c * e, 6 * c], "x");
  return `f''(x)=\\dfrac{${numerateur}}{\\left[${formatDLatex(e, k)}\\right]^3}`;
}

export function formatTermesDonneesLatex(exercice: ExerciceEtudeLocale): string[] {
  const termes = [formatFDeXLatex(exercice), formatFPrimeDeXLatex(exercice)];
  if (exercice.niveau === "avance") termes.push(formatFSecondeDeXLatex(exercice));
  return termes;
}

// ============================================================================
// Consigne générale + objectif persistant (`QuestionFinale`, `components/QuestionFinale.tsx`).
// ============================================================================

export const CONSIGNE_GENERALE_ETUDE_LOCALE =
  "Les dérivées f'(x) et, si besoin, f''(x) sont données : inutile de dériver. Étudie les points critiques de f à partir de ces expressions.";

export function questionFinaleEtudeLocale(exercice: ExerciceEtudeLocale): string {
  return exercice.niveau === "avance" ? "Objectif : localiser tous les extremums et tous les points d'inflexion de f." : "Objectif : localiser tous les extremums de f.";
}

// ============================================================================
// Libellés/consignes par écran.
// ============================================================================

export const LIBELLE_ECRAN_ETUDE_LOCALE: Record<EcranEtudeLocale, string> = {
  domaine: "Domaine de définition",
  resoudreFPrime: "Résoudre f'(x)=0",
  tableauFPrime: "Tableau de signes de f'",
  extremums: "Valeur de f aux extremums",
  resoudreFSeconde: "Résoudre f''(x)=0",
  tableauFSeconde: "Tableau de signes de f''",
  inflexions: "Valeur de f aux points d'inflexion",
};

export function consigneEcranEtudeLocale(ecran: EcranEtudeLocale): string {
  switch (ecran) {
    case "domaine":
      return "Détermine le domaine de définition de f.";
    case "resoudreFPrime":
      return "Calcule les éventuels zéros de f'(x).";
    case "tableauFPrime":
      return "Complète le tableau de signes de f'(x), puis les variations de f qui en découlent dans chaque zone et en chaque zéro de f'(x).";
    case "extremums":
      return "Pour chaque zéro de f'(x) classé maximum ou minimum au tableau précédent, calcule f(x).";
    case "resoudreFSeconde":
      return "Calcule les éventuels zéros de f''(x).";
    case "tableauFSeconde":
      return "Complète le tableau de signes de f''(x), puis la concavité de f qui en découle dans chaque zone et en chaque zéro de f''(x).";
    case "inflexions":
      return "Pour chaque point classé PI (point d'inflexion) au tableau précédent, calcule f(x).";
  }
}

/** Légende des symboles du tableau, affichée sous la grille (audit 5e ch. 5, point 38) : « ∪ » se
 * confond sinon avec la réunion d'ensembles, et « PI » n'est défini nulle part à l'écran. */
export function legendeTableauEtudeLocale(mode: "fprime" | "fseconde"): string {
  return mode === "fprime"
    ? "↗ : f croissante · ↘ : f décroissante · « ni l'un ni l'autre » : f' s'annule sans changer de signe."
    : "∪ : f convexe (tournée vers le haut) · ∩ : f concave (tournée vers le bas) · PI : point d'inflexion.";
}

// ============================================================================
// Aides — niveau 1 (technique/piège), niveau 2 (exemple proche, jamais la réponse). Texte en
// français terminé par « : » et formule en LaTeX à part (aucune formule écrite au clavier, audit
// 5e ch. 5, points 9–14) ; valeurs de CET exercice substituées quand elles sont connues.
// ============================================================================

function formatEquationDomaineLatex(exercice: ExerciceEtudeLocale): string | null {
  if (exercice.type === "polynomiale") return null;
  const { e, k } = exercice;
  const carre = e === 0 ? "x^2" : `(${formatDenominateurInterieurLatex(e)})^2`;
  return `${formatDLatex(e, k)}=0 \\iff ${carre}=${-k}`;
}

export function texteAideNiveau1EtudeLocale(ecran: EcranEtudeLocale, exercice?: ExerciceEtudeLocale): AideFragmentee {
  switch (ecran) {
    case "domaine": {
      const equation = exercice ? formatEquationDomaineLatex(exercice) : null;
      return {
        texte: "Cherche les valeurs qui annulent le dénominateur ; un carré n'est jamais négatif, donc ne garde que les solutions réelles :",
        latex: equation,
      };
    }
    case "resoudreFPrime":
      return {
        texte: "Selon la fonction, cette équation est du second degré (une ou deux solutions) ou du premier degré (une seule solution) :",
        latex: "f'(x)=0",
      };
    case "tableauFPrime":
      return {
        texte: "Piège : une racine double de f' l'annule sans que son signe change ; ce point n'est alors ni un maximum ni un minimum. Compare toujours le signe juste avant et juste après chaque zéro.",
        latex: null,
      };
    case "extremums":
      return {
        texte: "Remplace x par l'abscisse dans f(x) — pas dans f'(x), qui ne donne que la pente :",
        latex: "f(x_0)",
      };
    case "resoudreFSeconde":
      return {
        texte: "Même démarche que pour f', mais cette équation renseigne sur la concavité de f, pas sur ses variations :",
        latex: "f''(x)=0",
      };
    case "tableauFSeconde":
      return {
        texte: "Piège : f' renseigne sur les variations, f'' sur la concavité. Un zéro de f'' n'est un point d'inflexion que si le signe de f'' change de part et d'autre.",
        latex: null,
      };
    case "inflexions":
      return {
        texte: "Remplace x par l'abscisse du point d'inflexion dans f(x) — pas dans f''(x) :",
        latex: "f(x_0)",
      };
  }
}

/** Aide fragmentée — texte en français d'un côté, formule KaTeX de l'autre (jamais de formule
 * brute dans le texte), rendue via `<p>{aide.texte}</p> {aide.latex && <Katex expression={aide.latex} block />}`. */
export interface AideFragmentee {
  texte: string;
  latex: string | null;
}

export function texteAideNiveau2EtudeLocale(ecran: EcranEtudeLocale): AideFragmentee {
  switch (ecran) {
    case "domaine":
      return {
        texte: "Deux exemples :",
        latex:
          "(x-1)^2-4=0 \\iff (x-1)^2=4 \\iff x=-1 \\text{ ou } x=3 \\;\\Rightarrow\\; \\operatorname{dom} f=\\mathbb{R}\\setminus\\{-1\\,;3\\} \\qquad (x-1)^2+6=0 \\iff (x-1)^2=-6 \\text{ : impossible} \\;\\Rightarrow\\; \\operatorname{dom} f=\\mathbb{R}",
      };
    case "resoudreFPrime":
      return { texte: "Exemple :", latex: "f'(x)=6x^2-6=0 \\;\\Rightarrow\\; x^2=1 \\;\\Rightarrow\\; x=-1 \\text{ ou } x=1" };
    case "tableauFPrime":
      return {
        texte: "Exemple : avec une racine double en 0, f' reste positive des deux côtés de 0 ; on écrit « ni l'un ni l'autre » même si f'(0) = 0 :",
        latex: "f'(x)=6x^2",
      };
    case "extremums":
      return { texte: "Exemple :", latex: "f(x)=2x^3-6x,\\ x=-1 \\;\\Rightarrow\\; f(-1)=2\\cdot(-1)^3-6\\cdot(-1)=-2+6=4" };
    case "resoudreFSeconde":
      return { texte: "Exemple :", latex: "f''(x)=12x=0 \\;\\Rightarrow\\; x=0" };
    case "tableauFSeconde":
      return {
        texte: "Exemple : f'' change de signe en 0 (négative avant, positive après), donc ce point est un point d'inflexion (PI) :",
        latex: "f''(x)=12x",
      };
    case "inflexions":
      return { texte: "Exemple :", latex: "f(x)=2x^3,\\ x=0 \\;\\Rightarrow\\; f(0)=2\\cdot0^3=0" };
  }
}

// ============================================================================
// Labels/placeholders des champs numériques — variables selon le nombre de racines/points.
// ============================================================================

/** Généralisé à N champs (add-as-needed, prompt5gen29corrections.md) — 1 → "x=" ; 2+ → "x_1=",
 * "x_2=", ... (même patron que `ui5e/formatTangentes.ts`, 5gen28). */
export function labelsChampsRacines(nb: number): string[] {
  if (nb <= 1) return ["x="];
  return Array.from({ length: nb }, (_, i) => `x_${i + 1}=`);
}

/** Exemples HORS de l'espace des tirages (aucune racine en septièmes ni en √7 n'est produite). */
const EXEMPLES_RACINES = ["2/7", "1 + √7", "−3/7"];

export function placeholdersChampsRacines(nb: number): string[] {
  return Array.from({ length: Math.max(1, nb) }, (_, i) => `ex : ${EXEMPLES_RACINES[i % EXEMPLES_RACINES.length]}`);
}

/** Exemple des champs « valeur de f » — hors de l'espace des tirages (aucune valeur en septièmes). */
export const PLACEHOLDER_VALEUR_F = "ex : −2/7";

/** Précision annoncée UNIQUEMENT quand AU MOINS une des racines attendues est irrationnelle (voir
 * CLAUDE.md, "Annonce de précision = tolérance réellement vérifiée") — jamais affichée pour un
 * champ dont toutes les racines cibles sont exactes. */
export function precisionAnnonceeRacines(racines: RacineEtudeLocale[]): string | null {
  return racines.some((r) => !r.exact) ? "(arrondi au centième accepté si besoin)" : null;
}

/** Labels EXPLICITES "f(x)=" pour les écrans extremums/inflexions — l'abscisse est déjà connue
 * (confirmée à l'écran précédent), jamais une simple étiquette générique "y1=". */
export function labelsChampsValeurF(racines: RacineEtudeLocale[]): string[] {
  return racines.map((r) => `f(${formatRacineLatex(r)})=`);
}

export function placeholdersChampsValeurF(): string[] {
  return [PLACEHOLDER_VALEUR_F];
}

export function precisionAnnonceeValeursF(exercice: ExerciceEtudeLocale, racines: RacineEtudeLocale[]): string | null {
  // f(x) évaluée en un point IRRATIONNEL est généralement elle-même irrationnelle (famille
  // rationnelle : f(x)=c/D(x), D(x) déjà irrationnel en ce point) — même annonce que pour une
  // racine irrationnelle. Pour la famille "polynomiale", cette situation ne se produit jamais (le
  // seul point d'inflexion "avancé" est toujours rationnel, voir generateurs5e/etudeLocale) mais le
  // calcul reste générique, jamais supposé.
  void exercice;
  return precisionAnnonceeRacines(racines);
}

// ============================================================================
// Formatage LaTeX d'un `EnsembleReelGuide` déjà complet (domaine confirmé) — petite fonction PURE
// locale, jamais importée cross-chantier (même principe que `ui6e/formatEnsembleReel.ts`, qui
// réplique volontairement plutôt que d'importer `ui5e/formatDomaineDefinition.ts`).
// ============================================================================

export function formatEnsembleReelGuideLatex(ensemble: EnsembleReelGuide): string {
  if (ensemble.forme === "reel") return "\\mathbb{R}";
  if (ensemble.forme === "prive_points") return `\\mathbb{R} \\setminus \\{${ensemble.points.join("\\,;\\,")}\\}`;
  return "\\mathbb{R}"; // jamais atteint pour ce générateur (domaine toujours "reel"/"prive_points")
}

// ============================================================================
// Formatage LaTeX d'une classification confirmée — pour le bloc "état actuel"/le récapitulatif.
// ============================================================================

function formatClassificationExtremumTexte(c: ClassificationExtremum): string {
  switch (c) {
    case "max":
      return "maximum";
    case "min":
      return "minimum";
    case "ni_lun_ni_lautre":
      return "ni l'un ni l'autre";
  }
}

function formatClassificationInflexionTexte(c: ClassificationInflexion): string {
  return c === "pi" ? "PI" : "pas de PI";
}

function formatRacinesFPrimeAvecClassificationLatex(exercice: ExerciceEtudeLocale): string[] {
  return exercice.racinesFPrime.map((r, i) => `x=${formatRacineLatex(r)} \\Rightarrow \\text{${formatClassificationExtremumTexte(exercice.classificationFPrime[i])}}`);
}

function formatRacinesFSecondeAvecClassificationLatex(exercice: ExerciceEtudeLocale): string[] {
  return exercice.racinesFSeconde.map((r, i) => `x=${formatRacineLatex(r)} \\Rightarrow \\text{${formatClassificationInflexionTexte(exercice.classificationFSeconde[i])}}`);
}

function formatRacinesSimpleLatex(racines: RacineEtudeLocale[]): string {
  return racines.map((r) => `x=${formatRacineLatex(r)}`).join("\\text{ ou }");
}

/** "f'(x)=0 ⟺", puis CHAQUE racine sur sa PROPRE ligne, séparées d'une ligne "ou" — jamais une
 * seule ligne combinée (bloc état actuel, `prompt5gen29corrections.md`). Généralisé au nombre de
 * racines (1 racine ⟹ pas de ligne "ou", ce générateur en produit parfois une seule — famille
 * rationnelle, racine double). */
function formatLignesRacinesEtatActuel(entete: string, racines: RacineEtudeLocale[]): string[] {
  if (racines.length === 0) return [];
  const lignes: string[] = [`${entete} \\Leftrightarrow`];
  racines.forEach((r, i) => {
    if (i > 0) lignes.push("\\text{ou}");
    lignes.push(`x=${formatRacineLatex(r)}`);
  });
  return lignes;
}

function formatValeursFLatex(exercice: ExerciceEtudeLocale, xs: number[]): string[] {
  return xs.map((x) => {
    const racine = racineDepuisNombre(exercice, x);
    const abscisse = racine ? formatRacineLatex(racine) : formatNombreLatex(x);
    return `f(${abscisse})=${racine ? formatValeurExacteFLatex(exercice, racine) : formatNombreLatex(valeurFEtudeLocale(exercice, x))}`;
  });
}

/** Retrouve la racine STOCKÉE (donc son écriture exacte/irrationnelle) correspondant à une valeur
 * numérique `x` déjà connue — jamais reconstruite depuis `x` seul (perdrait la forme exacte). */
function racineDepuisNombre(exercice: ExerciceEtudeLocale, x: number): RacineEtudeLocale | undefined {
  return [...exercice.racinesFPrime, ...exercice.racinesFSeconde].find((r) => Math.abs(valeurNumeriqueRacineEtudeLocale(r) - x) < 1e-6);
}

function pgcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a || 1;
}

/** Fraction exacte réduite en LaTeX : « 3 », « -\dfrac{1}{9} ». */
function formatFractionLatex(num: number, den: number): string {
  const g = pgcd(num, den);
  let n = num / g;
  let d = den / g;
  if (d < 0) {
    n = -n;
    d = -d;
  }
  if (d === 1) return `${n}`;
  return n < 0 ? `-\\dfrac{${-n}}{${d}}` : `\\dfrac{${n}}{${d}}`;
}

/**
 * Valeur EXACTE de f en une racine stockée (audit 5e ch. 5, décision I : plus de « −0.11 » pour
 * −1/9) — toutes les valeurs de ce générateur ont une forme exacte :
 * - polynomiale, x = p/q : f(x) = (a·p³ + b·p²q + c·pq² + d·q³)/q³ ;
 * - polynomiale, x = e + s√r (zéros de f' = 3a(x−e)² − 3ar) : f(x) = f(e) − 2ar·s·√r ;
 * - rationnelle c/((x−e)² + k) : en x = e, c/k ; en x = e ± √(k/3), 3c/(4k).
 * Une valeur irrationnelle est suivie de sa valeur approchée (virgule décimale).
 */
function formatValeurExacteFLatex(exercice: ExerciceEtudeLocale, racine: RacineEtudeLocale): string {
  if (exercice.type === "polynomiale") {
    const { a, b, c, d } = exercice;
    if (racine.exact) {
      const { num: p, den: q } = racine.valeur;
      return formatFractionLatex(a * p ** 3 + b * p * p * q + c * p * q * q + d * q ** 3, q ** 3);
    }
    const e = racine.centre;
    const r = racine.radicande;
    const fe = a * e ** 3 + b * e * e + c * e + d;
    const coeffRacine = -2 * a * r * racine.signe;
    const partieRacine = `${Math.abs(coeffRacine) === 1 ? "" : Math.abs(coeffRacine)}\\sqrt{${r}}`;
    const exacte = fe === 0 ? `${coeffRacine < 0 ? "-" : ""}${partieRacine}` : `${fe}${coeffRacine < 0 ? "-" : "+"}${partieRacine}`;
    return `${exacte}\\approx ${formatNombreLatex(valeurFEtudeLocale(exercice, valeurNumeriqueRacineEtudeLocale(racine)))}`;
  }
  const { c, k } = exercice;
  return racine.exact ? formatFractionLatex(c, k) : formatFractionLatex(3 * c, 4 * k);
}

/** Nombre décimal arrondi au centième, virgule décimale (« 3{,}72 »). */
function formatNombreLatex(v: number): string {
  if (Number.isInteger(v)) return `${v}`;
  const arrondi = Math.round(v * 100) / 100;
  return `${arrondi}`.replace(".", "{,}");
}

// ============================================================================
// Bloc "état actuel" — accumule les faits CONFIRMÉS des écrans déjà traversés pour CET exercice
// (jamais dérivé de la saisie brute de l'élève, absent tant que rien n'est confirmé).
// ============================================================================

export function formatTermesEtatActuelLatex(exercice: ExerciceEtudeLocale, phase: EcranEtudeLocale): string[] | null {
  const ordre = ordreEcransEtudeLocale(exercice);
  const index = ordre.indexOf(phase);
  if (index <= 0) return null;

  const termes: string[] = [];
  for (let i = 0; i < index; i++) {
    switch (ordre[i]) {
      case "domaine":
        termes.push(`\\operatorname{dom} f=${formatEnsembleReelGuideLatex(domaineAttendu(exercice))}`);
        break;
      case "resoudreFPrime":
        termes.push(...formatLignesRacinesEtatActuel("f'(x)=0", exercice.racinesFPrime));
        break;
      case "tableauFPrime":
        termes.push(...formatRacinesFPrimeAvecClassificationLatex(exercice));
        break;
      case "extremums":
        termes.push(...formatValeursFLatex(exercice, xDesExtremums(exercice)));
        break;
      case "resoudreFSeconde":
        termes.push(`f''(x)=0 : ${formatRacinesSimpleLatex(exercice.racinesFSeconde)}`);
        break;
      case "tableauFSeconde":
        termes.push(...formatRacinesFSecondeAvecClassificationLatex(exercice));
        break;
      case "inflexions":
        termes.push(...formatValeursFLatex(exercice, xDesInflexions(exercice)));
        break;
    }
  }
  return termes.length === 0 ? null : termes;
}

// ============================================================================
// Récapitulatif final — réponse ATTENDUE, par écran RÉELLEMENT traversé.
// ============================================================================

export function formatReponseAttenduePhaseLatex(exercice: ExerciceEtudeLocale, ecran: EcranEtudeLocale): string[] {
  switch (ecran) {
    case "domaine":
      return [`\\operatorname{dom} f=${formatEnsembleReelGuideLatex(domaineAttendu(exercice))}`];
    case "resoudreFPrime":
      return [formatRacinesSimpleLatex(exercice.racinesFPrime)];
    case "tableauFPrime":
      return formatRacinesFPrimeAvecClassificationLatex(exercice);
    case "extremums":
      return formatValeursFLatex(exercice, xDesExtremums(exercice));
    case "resoudreFSeconde":
      return [formatRacinesSimpleLatex(exercice.racinesFSeconde)];
    case "tableauFSeconde":
      return formatRacinesFSecondeAvecClassificationLatex(exercice);
    case "inflexions":
      return formatValeursFLatex(exercice, xDesInflexions(exercice));
  }
}

// ============================================================================
// Formatage des cellules du tableau étendu (utilisé par les composants builder/recap).
// ============================================================================

export function libelleSigneTableau(v: ValeurSigneTableau | null): string {
  return v ?? "?";
}

export function libelleLigne2Tableau(v: ValeurLigne2Tableau | null): string {
  if (v === null) return "?";
  switch (v) {
    case "max":
      return "maximum";
    case "min":
      return "minimum";
    case "ni_lun_ni_lautre":
      return "ni l'un ni l'autre";
    case "pi":
      return "PI";
    case "pas_de_pi":
      return "pas de PI";
    default:
      return v; // "↗"/"↘"/"∪"/"∩" déjà lisibles tels quels
  }
}

/** LaTeX affiché en en-tête de colonne pour le tableau étendu — "" pour une colonne "zone"
 * (aucun marqueur), la racine formatée (forme exacte/irrationnelle préservée) pour une colonne
 * "racine", la valeur exclue pour une colonne "exclusion". */
export function formatEnteteColonnesTableau(exercice: ExerciceEtudeLocale, colonnes: { type: "zone" | "racine" | "exclusion"; index: number }[], mode: "fprime" | "fseconde"): string[] {
  const racines = mode === "fprime" ? exercice.racinesFPrime : exercice.racinesFSeconde;
  return colonnes.map((col) => {
    if (col.type === "racine") return formatRacineLatex(racines[col.index]);
    if (col.type === "exclusion") return `${exercice.exclusionsCE[col.index]}`;
    return "";
  });
}

export { formatRacineLatex };
