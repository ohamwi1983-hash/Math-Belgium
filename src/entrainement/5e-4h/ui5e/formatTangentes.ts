/**
 * Couche présentation (5e) — consignes/labels/aides/LaTeX pour 5gen28 ("Tangentes"). Dépend
 * librement des couches inférieures (jamais l'inverse) : réutilise `valeurFPointDonne`/
 * `deriveeFPointDonne`/`valeurFHorizontale`/`deriveeFHorizontale`/`valeurFDoubleTangence`/
 * `deriveeFDoubleTangence` (`generateurs5e/tangentes/index.ts`) — même patron que
 * `formatDefinitionDerivee.ts` réutilisant `valeurExacte`/`deriveeExacte` depuis la Couche A.
 *
 * Toute valeur numérique connue de l'exercice (a, p, q une fois confirmé) est TOUJOURS substituée
 * dans les consignes/labels — jamais la forme générique "f(a)"/"tangente(x)"
 * (`prompt5gen28variantesabc.md`). Aucune ligne "Objectif : ..." (redondante avec les
 * consignes/questions ci-dessous, supprimée partout).
 */
import type { ExerciceTangente, ExerciceTangenteDoubleTangence, ExerciceTangenteHorizontale, ExerciceTangentePointDonne, ExerciceTangentePointDonneRadicale } from "../core5e/tangentes.types";
import { deriveeFDoubleTangence, deriveeFPointDonne, valeurFDoubleTangence, valeurFHorizontale, valeurFPointDonne } from "../generateurs5e/tangentes/index";
import { reduireFraction } from "../generateurs5e/limites/fraction";
import type { EcranTangente } from "../moteur5e/typesTangentes";
import { ordreEcransTangente } from "../moteur5e/typesTangentes";

// ============================================================================
// Fragments LaTeX de bas niveau.
// ============================================================================

/** Polynôme à partir de coefficients ASCENDANTS [constante, coeff1, coeff2...]. */
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

function formatValeurRadicaleLatex(coeff: number, radicande: number): string {
  const racine = `\\sqrt{${radicande}}`;
  if (coeff === 1) return racine;
  if (coeff === -1) return `-${racine}`;
  return `${coeff}${racine}`;
}

/** Fraction numerateur/(denomCoeff·√radicandeLatex), RÉDUITE par PGCD (`reduireFraction`, Couche A
 * déjà établie) avant affichage — jamais "-4/(2√...)" quand "-2/√..." est la forme réduite (audit
 * transversal, `promptauditfractionsnonreduites.md`). `radicandeLatex` accepte un nombre concret
 * (f'(a) confirmé) ou un fragment symbolique en x (f'(x) donné) — même formule dans les 2 cas. */
function formatFractionSurRacineLatex(numerateur: number, denomCoeff: number, radicandeLatex: string | number): string {
  if (numerateur === 0) return "0";
  const { num, den } = reduireFraction(numerateur, denomCoeff);
  const signe = num < 0 ? "-" : "";
  const numAbs = Math.abs(num);
  const racine = `\\sqrt{${radicandeLatex}}`;
  return den === 1 ? `${signe}\\dfrac{${numAbs}}{${racine}}` : `${signe}\\dfrac{${numAbs}}{${den}${racine}}`;
}

function formatDeriveeRadicaleLatex(coeff: number, m: number, radicande: number): string {
  return formatFractionSurRacineLatex(coeff * m, 2, radicande);
}

/** "x-q" ou "x+|q|" — jamais un double signe moins juxtaposé quand `q` est négatif (audit
 * transversal, `promptauditdoublesigne.md`) — même patron que `formatFacteurXMoinsQ`
 * (`ui5e/formatDefinitionDerivee.ts`). */
function formatFacteurXMoinsQ(q: number): string {
  if (q === 0) return "x";
  return q > 0 ? `x-${q}` : `x+${Math.abs(q)}`;
}

/** Retire le préfixe "y=" d'une équation de tangente confirmée — pour la recomposer sous une autre
 * forme ("f(x)=...", "t_{x=a}\equiv..."), jamais en la reformattant depuis zéro. */
function rhsDeTangente(tangenteLatex: string): string {
  return tangenteLatex.replace(/^y=/, "");
}

// ============================================================================
// f(x) — bloc de données, par variante.
// ============================================================================

export function formatFDeXLatex(exercice: ExerciceTangente): string {
  switch (exercice.variante) {
    case "pointDonne":
      return exercice.sousFamille === "polynomiale"
        ? `f(x)=${formatPolynomeVarLatex(exercice.coeffs, "x")}`
        : `f(x)=${formatValeurRadicaleAvecArgumentLatex(exercice.coeff, exercice.m, exercice.p)}`;
    case "horizontale":
      return `f(x)=${formatPolynomeVarLatex([exercice.d, exercice.c, exercice.b, exercice.a], "x")}`;
    case "doubleTangence":
      return `f(x)=${formatPolynomeVarLatex(exercice.coeffs, "x")}`;
  }
}

function formatArgumentRadicalLatex(m: number, p: number): string {
  const mLatex = m === 1 ? "x" : m === -1 ? "-x" : `${m}x`;
  if (p === 0) return mLatex;
  return p > 0 ? `${mLatex}+${p}` : `${mLatex}-${Math.abs(p)}`;
}

function formatValeurRadicaleAvecArgumentLatex(coeff: number, m: number, p: number): string {
  const racine = `\\sqrt{${formatArgumentRadicalLatex(m, p)}}`;
  if (coeff === 1) return racine;
  if (coeff === -1) return `-${racine}`;
  return `${coeff}${racine}`;
}

/** f'(x) — GIVEN sur l'écran, uniquement pour les variantes A et B (jamais C, voir CLAUDE.md/la
 * tâche : le quartique de la variante C doit être dérivé PAR l'élève lui-même). */
export function formatFPrimeDeXLatex(exercice: ExerciceTangentePointDonne | ExerciceTangenteHorizontale): string {
  if (exercice.variante === "pointDonne") {
    if (exercice.sousFamille === "polynomiale") {
      const derivee: number[] = [];
      for (let i = 1; i < exercice.coeffs.length; i++) derivee.push(i * exercice.coeffs[i]);
      return `f'(x)=${formatPolynomeVarLatex(derivee, "x")}`;
    }
    const argumentLatex = formatArgumentRadicalLatex(exercice.m, exercice.p);
    return `f'(x)=${formatFractionSurRacineLatex(exercice.coeff * exercice.m, 2, argumentLatex)}`;
  }
  return `f'(x)=${formatPolynomeVarLatex([exercice.c, 2 * exercice.b, 3 * exercice.a], "x")}`;
}

// ============================================================================
// Bloc de données — consigne générale + en-tête, par variante. Les valeurs a/p connues DÈS LE
// DÉBUT ne sont plus reprises en ligne séparée (redondant avec la consigne générale, qui les
// substitue déjà) — `prompt5gen28variantesabc.md`.
// ============================================================================

export function formatTermesDonneesLatex(exercice: ExerciceTangente): string[] {
  switch (exercice.variante) {
    case "pointDonne":
      return [formatFDeXLatex(exercice), formatFPrimeDeXLatex(exercice)];
    case "horizontale":
      return [formatFDeXLatex(exercice), formatFPrimeDeXLatex(exercice)];
    case "doubleTangence":
      return [formatFDeXLatex(exercice)];
  }
}

export function consigneGenerale(exercice: ExerciceTangente): string {
  switch (exercice.variante) {
    case "pointDonne":
      return exercice.sousFamille === "radicale"
        ? `Détermine l'équation de la tangente à la courbe de f au point d'abscisse x = ${nombreTexte(exercice.a)}. Donne des valeurs exactes (racines carrées acceptées).`
        : `Détermine l'équation de la tangente à la courbe de f au point d'abscisse x = ${nombreTexte(exercice.a)}.`;
    case "horizontale":
      return "Détermine les points de la courbe de f où la tangente est horizontale, puis donne leurs coordonnées.";
    case "doubleTangence":
      return `La tangente t à la courbe de f au point d'abscisse x = ${nombreTexte(exercice.p)} recoupe la courbe en un second point, d'abscisse q. Détermine q, puis la pente de la courbe en ce point : t y est-elle aussi tangente ?`;
  }
}

// ============================================================================
// Libellés d'écran (récapitulatif).
// ============================================================================

export const LIBELLE_ECRAN: Record<EcranTangente, string> = {
  substituer: "f(a) et f'(a)",
  tangente: "Équation de la tangente",
  resoudre: "Résoudre f'(x) = 0",
  coordonnees: "Points de tangence",
  tangenteEnP: "f'(p) et tangente en p",
  trouverQ: "Le second point q",
  verifierPente: "Pente en q",
};

/** Libellé d'écran avec les valeurs CONNUES substituées (« f(3) et f'(3) ») — fiches des puces et
 * « Ce qu'on sait déjà » (audit 5e ch. 5, points 9–14). */
export function libelleEcranTangente(exercice: ExerciceTangente, ecran: EcranTangente): string {
  if (ecran === "substituer" && exercice.variante === "pointDonne") return `f(${nombreTexte(exercice.a)}) et f'(${nombreTexte(exercice.a)})`;
  if (ecran === "tangenteEnP" && exercice.variante === "doubleTangence") return `f'(${nombreTexte(exercice.p)}) et tangente en x = ${nombreTexte(exercice.p)}`;
  return LIBELLE_ECRAN[ecran];
}

/** Nombre en texte brut avec le « − » typographique. */
function nombreTexte(n: number): string {
  return n < 0 ? `−${Math.abs(n)}` : `${n}`;
}

// ============================================================================
// Question spécifique par écran — texte + (pour "tangente"/"trouverQ") un fragment LaTeX central à
// rendre via `<Katex>` côté composant, jamais en texte plat pour un symbole mathématique empilé.
// Toute valeur connue de CET exercice est substituée, y compris l'équation de tangente RÉELLEMENT
// trouvée pour cet exercice (réutilise `formatTangenteConfirmeeDoubleTangenceLatex`, plus bas,
// seule source de vérité pour cette forme).
// ============================================================================

export interface QuestionSpecifique {
  texteAvant: string;
  /** Fragment LaTeX central, rendu séparément via `<Katex>` — absent quand aucun symbole empilé
   * n'est nécessaire. */
  latex?: string;
  texteApres?: string;
}

export function questionSpecifiqueEcran(exercice: ExerciceTangente, ecran: EcranTangente): QuestionSpecifique {
  switch (ecran) {
    case "substituer": {
      const ex = exercice as ExerciceTangentePointDonne;
      const a = ex.a;
      return {
        texteAvant: "Calcule",
        latex: `f(${a}) \\text{ puis } f'(${a})`,
        texteApres: ex.sousFamille === "radicale" ? "à partir de f(x) et f'(x) données ci-dessus. Donne des valeurs exactes." : "à partir de f(x) et f'(x) données ci-dessus.",
      };
    }
    case "tangente": {
      const a = (exercice as ExerciceTangentePointDonne).a;
      return { texteAvant: "Donne l'équation de la tangente", latex: `t_{x=${a}}`, texteApres: "(par exemple sous la forme y = mx + p)." };
    }
    case "resoudre":
      return { texteAvant: "Résous l'équation", latex: "f'(x)=0", texteApres: "et donne chaque solution." };
    case "coordonnees":
      return { texteAvant: "Pour chaque solution trouvée, calcule l'ordonnée", latex: "y=f(x)", texteApres: "et donne le point de tangence complet (x ; y)." };
    case "tangenteEnP": {
      const p = (exercice as ExerciceTangenteDoubleTangence).p;
      return { texteAvant: "Calcule", latex: `f'(${p})`, texteApres: `puis écris l'équation de la tangente au point d'abscisse x = ${nombreTexte(p)}.` };
    }
    case "trouverQ": {
      const ex = exercice as ExerciceTangenteDoubleTangence;
      const rhs = rhsDeTangente(formatTangenteConfirmeeDoubleTangenceLatex(ex));
      return {
        texteAvant: "L'équation",
        latex: `f(x)=${rhs}`,
        texteApres: `admet la solution x = ${nombreTexte(ex.p)} et une seconde solution x = q. Trouve q.`,
      };
    }
    case "verifierPente": {
      const ex = exercice as ExerciceTangenteDoubleTangence;
      return { texteAvant: "Calcule la pente de la courbe au second point :", latex: `f'(${ex.q})` };
    }
  }
}

// ============================================================================
// Labels de champs — valeur connue substituée (jamais la forme générique).
// ============================================================================

export function labelFAPointDonne(a: number): string {
  return `f(${a})=`;
}

export function labelFPrimeAPointDonne(a: number): string {
  return `f'(${a})=`;
}

/** "t_{x=valeur}\equiv" — remplace le label "y=" sur les champs d'équation de tangente (variante A
 * écran "tangente", variante C écran "tangenteEnP"). */
export function labelTangenteEquiv(valeur: number): string {
  return `t_{x=${valeur}}\\equiv`;
}

export function labelFPrimeP(p: number): string {
  return `f'(${p})=`;
}

// ============================================================================
// Aides — niveau 1 (technique/piège), niveau 2 (exemple proche, jamais la réponse).
// ============================================================================

/** Aide de niveau 1 — phrase terminée par « : » et formule en LaTeX à part (aucune formule écrite
 * au clavier dans le texte, audit 5e ch. 5, points 9–14). Valeurs connues substituées. */
export function texteAideNiveau1(ecran: EcranTangente, exercice?: ExerciceTangente): AideFragmentee {
  const a = exercice?.variante === "pointDonne" ? exercice.a : null;
  const p = exercice?.variante === "doubleTangence" ? exercice.p : null;
  switch (ecran) {
    case "substituer":
      return {
        texte: "Deux substitutions indépendantes, aucune dérivation à faire : remplace x par l'abscisse du point dans f(x), puis dans f'(x) donnée.",
        latex: a !== null ? `f(${a}) \\quad \\text{et} \\quad f'(${a})` : null,
      };
    case "tangente":
      return {
        texte: "Applique la formule du cours, puis distribue la pente sur la parenthèse avant d'ajouter l'ordonnée (attention aux signes) :",
        latex: a !== null ? `y=f(${a})+f'(${a})(${formatFacteurXMoinsQ(a)})` : "y=f(a)+f'(a)(x-a)",
      };
    case "resoudre":
      return {
        texte: "La tangente est horizontale là où la pente est nulle. Cette équation du second degré peut avoir deux solutions, ou une seule (racine double) :",
        latex: "f'(x)=0",
      };
    case "coordonnees":
      return {
        texte: "Piège fréquent : ne donner que l'abscisse. Un point de tangence a deux coordonnées ; pour chaque solution, calcule aussi :",
        latex: "y=f(x)",
      };
    case "tangenteEnP":
      return {
        texte: "f(x) est déjà développée : dérive chaque terme avec la règle de la puissance, puis remplace x par l'abscisse du point :",
        latex: p !== null ? `(x^n)'=n\\,x^{n-1} \\quad\\Rightarrow\\quad f'(${p})` : "(x^n)'=n\\,x^{n-1}",
      };
    case "trouverQ":
      return {
        texte: "La différence entre la courbe et la tangente a une racine double en x = p : elle est divisible par (x − p)². Divise, puis résous le quotient du second degré :",
        latex: p !== null ? `f(x)-t(x)=(${formatFacteurXMoinsQ(p)})^2\\cdot Q(x)` : "f(x)-t(x)=(x-p)^2\\cdot Q(x)",
      };
    case "verifierPente": {
      const q = exercice?.variante === "doubleTangence" ? exercice.q : null;
      return {
        texte: "Reprends la dérivée f'(x) calculée au premier écran et remplace x par l'abscisse du second point :",
        latex: q !== null ? `f'(${q})` : "f'(q)",
      };
    }
  }
}

/** Aide fragmentée — texte en français d'un côté, formule KaTeX de l'autre (jamais de formule
 * brute dans le texte), rendue via `<p>{aide.texte}</p> {aide.latex && <Katex expression={aide.latex} block />}`. */
export interface AideFragmentee {
  texte: string;
  latex: string | null;
}

export function texteAideNiveau2(ecran: EcranTangente): AideFragmentee {
  switch (ecran) {
    case "substituer":
      return { texte: "Exemple :", latex: "f(x)=x^2+1,\\ f'(x)=2x \;\\Rightarrow\; f(2)=5,\\ f'(2)=4" };
    case "tangente":
      return { texte: "Exemple :", latex: "f(2)=5,\\ f'(2)=4 \;\\Rightarrow\; y=5+4(x-2)=4x-3" };
    case "resoudre":
      return { texte: "Exemple :", latex: "6x^2-6=0 \\iff x^2=1 \\iff x=-1 \\text{ ou } x=1" };
    case "coordonnees":
      return { texte: "Exemple, avec f(x) = 2x³ − 6x + 1 :", latex: "x=1 \;\\Rightarrow\; y=f(1)=-3 \;\\Rightarrow\; (1\\,;-3)" };
    case "tangenteEnP":
      return {
        texte: "Exemple :",
        latex: "\\begin{aligned} f(x)&=x^4-4x^3+4x^2+x\\\\ f'(x)&=4x^3-12x^2+8x+1\\\\ f'(0)&=1,\\ f(0)=0 \;\\Rightarrow\; y=x \\end{aligned}",
      };
    case "trouverQ":
      return {
        texte: "Exemple, avec la tangente y = x en p = 0 :",
        latex: "\\begin{aligned} f(x)-x&=x^4-4x^3+4x^2\\\\ &=x^2(x-2)^2 \;\\Rightarrow\; q=2 \\end{aligned}",
      };
    case "verifierPente":
      return { texte: "Exemple :", latex: "\\begin{aligned} f'(x)&=4x^3-12x^2+8x+1\\\\ f'(2)&=32-48+16+1=1 \\end{aligned}" };
  }
}

// ============================================================================
// Labels/placeholders des champs — nombre de champs déterminé DYNAMIQUEMENT côté composant
// (pattern add-as-needed, variante B) : 1 champ → "x" (jamais indexé), 2+ champs → "x_1","x_2"...
// ============================================================================

export function labelsChampsRacines(nb: number): string[] {
  if (nb <= 1) return ["x="];
  return Array.from({ length: nb }, (_, i) => `x_${i + 1}=`);
}

/** Exemples HORS de l'espace des tirages (racines entières) : jamais une vraie réponse. */
const EXEMPLES_RACINES = ["1,5", "−2,5", "0,5", "−0,5"];

export function placeholdersChampsRacines(nb: number): string[] {
  return Array.from({ length: Math.max(1, nb) }, (_, i) => `ex : ${EXEMPLES_RACINES[i % EXEMPLES_RACINES.length]}`);
}

/** Exemple du champ d'équation de tangente — pente 1,5 et ordonnée 0,5, jamais tirées. */
export const PLACEHOLDER_EQUATION_TANGENTE = "ex : 1,5x + 0,5";

/** "Point :" (1 seul point) ou "Point 1 :"/"Point 2 :"/... (plusieurs) — label texte SIMPLE
 * précédant les 2 champs x/y séparés d'une ligne (jamais de KaTeX, pas un fragment mathématique). */
export function labelPointCoordonnees(nb: number, index: number): string {
  return nb <= 1 ? "Point :" : `Point ${index + 1} :`;
}

// ============================================================================
// Valeurs CONFIRMÉES — formes canoniques (état actuel + récapitulatif). Toute forme
// algébriquement équivalente est acceptée par la vérification ; ces fonctions n'affichent qu'UNE
// forme correcte de référence.
// ============================================================================

function formatFAConfirmeeLatex(exercice: ExerciceTangentePointDonne): string {
  const a = exercice.a;
  const valeur = valeurFPointDonne(exercice, a);
  if (exercice.sousFamille === "polynomiale") return `f(${a})=${valeur}`;
  const radicande = exercice.m * a + exercice.p;
  return `f(${a})=${formatValeurRadicaleLatex(exercice.coeff, radicande)}`;
}

function formatFPrimeAConfirmeeLatex(exercice: ExerciceTangentePointDonne): string {
  const a = exercice.a;
  if (exercice.sousFamille === "polynomiale") return `f'(${a})=${deriveeFPointDonne(exercice, a)}`;
  const radicande = exercice.m * a + exercice.p;
  return `f'(${a})=${formatDeriveeRadicaleLatex(exercice.coeff, exercice.m, radicande)}`;
}

/** "+terme" ou "terme" (déjà signé "-...") — jamais un "+" juxtaposé à un terme commençant par
 * "-" (audit transversal, `promptauditdoublesigne.md`). */
function formatAdditionSigneeLatex(termeLatex: string): string {
  return termeLatex.startsWith("-") ? termeLatex : `+${termeLatex}`;
}

/** Droite y = m·x + p à coefficients ENTIERS, bien écrite : jamais « 1x », « −1x », « 0x », « + 0 »
 * (audit 5e ch. 5, point 34). */
function formatDroiteEntiereLatex(m: number, p: number): string {
  let out = "";
  if (m !== 0) out = m === 1 ? "x" : m === -1 ? "-x" : `${m}x`;
  if (p !== 0 || out === "") out += out === "" ? `${p}` : p > 0 ? `+${p}` : `${p}`;
  return `y=${out}`;
}

/** k·√r avec k = n/d réduit : « \sqrt{5} », « -3\sqrt{5} », « \dfrac{3\sqrt{5}}{10} ». */
function formatMultipleRacineLatex(n: number, d: number, r: number): string {
  if (n === 0) return "0";
  const { num, den } = reduireFraction(n, d);
  const signe = num < 0 ? "-" : "";
  const absNum = Math.abs(num);
  const racine = `\\sqrt{${r}}`;
  const numerateur = absNum === 1 ? racine : `${absNum}${racine}`;
  return den === 1 ? `${signe}${numerateur}` : `${signe}\\dfrac{${numerateur}}{${den}}`;
}

/** Tangente de la sous-famille radicale : forme du cours y = f(a) + f'(a)(x − a), puis forme
 * développée y = mx + p à coefficients exacts rationalisés. Avec r = m·a + p (radicande en a) :
 * pente = c·m/(2√r) = (c·m/(2r))·√r et ordonnée à l'origine = c(2r − m·a)/(2r)·√r. */
function formatTangenteRadicaleLatex(exercice: ExerciceTangentePointDonneRadicale): string {
  const { coeff, m, a } = exercice;
  const r = m * a + exercice.p;
  const fALatex = formatValeurRadicaleLatex(coeff, r);
  const pentePointLatex = formatDeriveeRadicaleLatex(coeff, m, r);
  const formeCours = a === 0 ? `y=${fALatex}${formatAdditionSigneeLatex(`${pentePointLatex}\\,x`)}` : `y=${fALatex}${formatAdditionSigneeLatex(`${pentePointLatex}(${formatFacteurXMoinsQ(a)})`)}`;
  if (a === 0) return formeCours;
  const pente = formatMultipleRacineLatex(coeff * m, 2 * r, r);
  const ordonnee = formatMultipleRacineLatex(coeff * (2 * r - m * a), 2 * r, r);
  const terme1 = pente.startsWith("-") ? `-${pente.slice(1)}\\,x` : `${pente}\\,x`;
  const developpee = ordonnee === "0" ? terme1 : `${terme1}${formatAdditionSigneeLatex(ordonnee)}`;
  return `${formeCours}=${developpee}`;
}

function formatTangenteConfirmeePointDonneLatex(exercice: ExerciceTangentePointDonne): string {
  const a = exercice.a;
  if (exercice.sousFamille === "radicale") return formatTangenteRadicaleLatex(exercice);
  const fA = valeurFPointDonne(exercice, a);
  const fPrimeA = deriveeFPointDonne(exercice, a);
  return formatDroiteEntiereLatex(fPrimeA, fA - fPrimeA * a);
}

function formatRacinesConfirmeesLatex(exercice: ExerciceTangenteHorizontale): string {
  return exercice.racines.map((r) => `x=${r}`).join("\\text{ ou }");
}

function formatCoordonneesConfirmeesLatex(exercice: ExerciceTangenteHorizontale): string[] {
  return exercice.racines.map((r) => `(${r};${valeurFHorizontale(exercice, r)})`);
}

function formatFPrimePConfirmeeLatex(exercice: ExerciceTangenteDoubleTangence): string {
  return `f'(${exercice.p})=${deriveeFDoubleTangence(exercice, exercice.p)}`;
}

function formatTangenteConfirmeeDoubleTangenceLatex(exercice: ExerciceTangenteDoubleTangence): string {
  const p = exercice.p;
  const fP = valeurFDoubleTangence(exercice, p);
  const fPrimeP = deriveeFDoubleTangence(exercice, p);
  return formatDroiteEntiereLatex(fPrimeP, fP - fPrimeP * p);
}

function formatQConfirmeLatex(exercice: ExerciceTangenteDoubleTangence): string {
  return `q=${exercice.q}`;
}

function formatFPrimeQConfirmeeLatex(exercice: ExerciceTangenteDoubleTangence): string {
  return `f'(${exercice.q})=${deriveeFDoubleTangence(exercice, exercice.q)}`;
}

/** Conclusion affichée APRÈS validation de l'écran « pente en q » (jamais annoncée dans la
 * question — audit 5e ch. 5, décision B) : même pente qu'en p, donc t est aussi tangente en q. */
function formatConclusionDoubleTangenceLatex(exercice: ExerciceTangenteDoubleTangence): string {
  return `f'(${exercice.q})=f'(${exercice.p}) \\;\\Rightarrow\\; \\text{la droite } t \\text{ est aussi tangente en } x=${exercice.q} \\text{ (double tangence)}`;
}

// ============================================================================
// Bloc "état actuel" — rappelle les valeurs CONFIRMÉES des écrans déjà traversés pour CET exercice
// (jamais dérivé de la saisie brute de l'élève, absent tant que rien n'est confirmé).
// ============================================================================

export function formatTermesEtatActuelLatex(exercice: ExerciceTangente, phase: EcranTangente): string[] | null {
  const ordre = ordreEcransTangente(exercice);
  const index = ordre.indexOf(phase);
  if (index === 0) return null;

  if (exercice.variante === "pointDonne") {
    return [formatFAConfirmeeLatex(exercice), formatFPrimeAConfirmeeLatex(exercice)];
  }
  if (exercice.variante === "horizontale") {
    return [formatRacinesConfirmeesLatex(exercice)];
  }
  // doubleTangence : 3 écrans, accumulation progressive. "t_{x=p}\equiv..." cohérent avec le label
  // du champ d'équation sur l'écran "tangenteEnP" (jamais "\text{tangente : }...").
  const tangenteLatex = formatTangenteConfirmeeDoubleTangenceLatex(exercice);
  const termes = [formatFPrimePConfirmeeLatex(exercice), `t_{x=${exercice.p}}\\equiv ${rhsDeTangente(tangenteLatex)}`];
  if (index >= 2) termes.push(formatQConfirmeLatex(exercice));
  return termes;
}

// ============================================================================
// Récapitulatif final — réponse ATTENDUE, par écran RÉELLEMENT traversé (voir
// `ordreEcransTangente`).
// ============================================================================

export function formatReponseAttenduePhaseLatex(exercice: ExerciceTangente, ecran: EcranTangente): string[] {
  switch (ecran) {
    case "substituer": {
      const ex = exercice as ExerciceTangentePointDonne;
      return [formatFAConfirmeeLatex(ex), formatFPrimeAConfirmeeLatex(ex)];
    }
    case "tangente":
      return [formatTangenteConfirmeePointDonneLatex(exercice as ExerciceTangentePointDonne)];
    case "resoudre":
      return [formatRacinesConfirmeesLatex(exercice as ExerciceTangenteHorizontale)];
    case "coordonnees":
      return formatCoordonneesConfirmeesLatex(exercice as ExerciceTangenteHorizontale);
    case "tangenteEnP": {
      const ex = exercice as ExerciceTangenteDoubleTangence;
      return [formatFPrimePConfirmeeLatex(ex), formatTangenteConfirmeeDoubleTangenceLatex(ex)];
    }
    case "trouverQ":
      return [formatQConfirmeLatex(exercice as ExerciceTangenteDoubleTangence)];
    case "verifierPente": {
      const ex = exercice as ExerciceTangenteDoubleTangence;
      return [formatFPrimeQConfirmeeLatex(ex), formatConclusionDoubleTangenceLatex(ex)];
    }
  }
}
