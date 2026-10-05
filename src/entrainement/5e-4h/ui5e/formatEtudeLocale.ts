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
  "f'(x) et, si nécessaire, f''(x) te sont DONNÉES (jamais à dériver toi-même) — étudie les points critiques de f à partir de ces informations.";

export function questionFinaleEtudeLocale(exercice: ExerciceEtudeLocale): string {
  return exercice.niveau === "avance" ? "Objectif : localiser tous les extremums ET tous les points d'inflexion de f." : "Objectif : localiser tous les extremums de f.";
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
      return "Complète le tableau de signes de f'(x), puis les variations de f qui en découlent à chaque zone et à chaque zéro de f'(x).";
    case "extremums":
      return "Pour CHAQUE zéro de f'(x) classé MAX ou min au tableau précédent, calcule f(x).";
    case "resoudreFSeconde":
      return "Calcule les éventuels zéros de f''(x).";
    case "tableauFSeconde":
      return "Complète le tableau de signes de f''(x), puis la concavité de f qui en découle à chaque zone et à chaque zéro de f''(x).";
    case "inflexions":
      return "Pour CHAQUE point classé PI (point d'inflexion) au tableau précédent, calcule f(x).";
  }
}

// ============================================================================
// Aides — niveau 1 (technique/piège), niveau 2 (exemple proche, jamais la réponse).
// ============================================================================

export function texteAideNiveau1EtudeLocale(ecran: EcranEtudeLocale): string {
  switch (ecran) {
    case "domaine":
      return "Résous (x-e)²+k=0, c'est-à-dire (x-e)²=-k — ne conserve que les solutions RÉELLES.";
    case "resoudreFPrime":
      return "Selon la famille de f, f'(x)=0 peut être une équation du second degré (1 ou 2 solutions) ou une simple égalité linéaire (1 seule solution).";
    case "tableauFPrime":
      return "PIÈGE CENTRAL : une racine DOUBLE de f' touche zéro SANS que le signe change autour d'elle — ce point n'est NI un maximum NI un minimum. Compare toujours le signe juste avant ET juste après chaque racine avant de conclure.";
    case "extremums":
      return "Substitue l'abscisse directement dans f(x) — jamais dans f'(x), qui ne donne que la pente, pas la hauteur.";
    case "resoudreFSeconde":
      return "f''(x)=0 se résout exactement comme f'(x)=0 — mais porte sur la CONCAVITÉ de f, jamais sur ses variations.";
    case "tableauFSeconde":
      return "PIÈGE : ne confonds pas le rôle de f' (variations/extremums de f) et celui de f'' (concavité/points d'inflexion) — une racine de f''(x)=0 n'est un VRAI point d'inflexion que si le signe de f'' change réellement autour d'elle, exactement comme pour f' et les extremums.";
    case "inflexions":
      return "Substitue l'abscisse du point d'inflexion dans f(x) — jamais dans f''(x).";
  }
}

export function texteAideNiveau2EtudeLocale(ecran: EcranEtudeLocale): string {
  switch (ecran) {
    case "domaine":
      return "Exemple : (x-1)²-4=0 ⟺ (x-1)²=4 ⟺ x-1=±2 ⟺ x=-1 ou x=3 — domf=ℝ\\{-1;3}.";
    case "resoudreFPrime":
      return "Exemple : f'(x)=6x²-6=0 ⟹ x²=1 ⟹ x=-1 ou x=1.";
    case "tableauFPrime":
      return "Exemple : f'(x)=6x² (racine double en 0) reste POSITIVE des 2 côtés de 0 — 'ni l'un ni l'autre', même si f'(0)=0.";
    case "extremums":
      return "Exemple : pour f(x)=2x³-6x et x=-1, f(-1)=2·(-1)³-6·(-1)=-2+6=4.";
    case "resoudreFSeconde":
      return "Exemple : f''(x)=12x=0 ⟹ x=0.";
    case "tableauFSeconde":
      return "Exemple : f''(x)=12x change bien de signe en x=0 (négative avant, positive après) — c'est un vrai point d'inflexion (PI).";
    case "inflexions":
      return "Exemple : pour f(x)=2x³ et x=0, f(0)=2·0³=0.";
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

const EXEMPLES_RACINES = [-1, 1, -2, 2, -3, 3];

export function placeholdersChampsRacines(nb: number): string[] {
  if (nb <= 1) return ["ex : 2"];
  return Array.from({ length: nb }, (_, i) => `ex : ${EXEMPLES_RACINES[i] ?? i + 1}`);
}

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
  return ["ex : 4"];
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
      return "MAX";
    case "min":
      return "min";
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
  return xs.map((x) => `f(${formatRacineDepuisNombreLatex(exercice, x)})=${formatNombreLatex(valeurFEtudeLocale(exercice, x))}`);
}

/** Retrouve la racine STOCKÉE (donc son écriture exacte/irrationnelle) correspondant à une valeur
 * numérique `x` déjà connue — jamais reconstruite depuis `x` seul (perdrait la forme exacte). */
function formatRacineDepuisNombreLatex(exercice: ExerciceEtudeLocale, x: number): string {
  const toutes = [...exercice.racinesFPrime, ...exercice.racinesFSeconde];
  const trouvee = toutes.find((r) => Math.abs(valeurNumeriqueRacineEtudeLocale(r) - x) < 1e-6);
  return trouvee ? formatRacineLatex(trouvee) : formatNombreLatex(x);
}

function formatNombreLatex(v: number): string {
  const arrondi = Math.round(v * 100) / 100;
  return Number.isInteger(v) ? `${v}` : `${arrondi}`;
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
        termes.push(`domf=${formatEnsembleReelGuideLatex(domaineAttendu(exercice))}`);
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
      return [`domf=${formatEnsembleReelGuideLatex(domaineAttendu(exercice))}`];
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
      return "MAX";
    case "min":
      return "min";
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
