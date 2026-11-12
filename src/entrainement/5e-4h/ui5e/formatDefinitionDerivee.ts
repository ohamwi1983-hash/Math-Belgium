/**
 * Couche présentation (5e) — consignes/labels/aides/LaTeX pour 5gen26 ("Calculer f'(a) par la
 * définition"). Dépend librement des couches inférieures (jamais l'inverse) : réutilise
 * `valeurExacte`/`deriveeExacte` (`generateurs5e/definitionDerivee/index.ts`) pour l'affichage des
 * valeurs exactes (f(a), f'(a)) — même patron que `formatEtudeComplete.ts` réutilisant
 * `formatPolynomeLatex` depuis `generateurs5e/`.
 *
 * UNE SEULE valeur de `a` par exercice (voir `prompt5gen26unevaleurareecriture.md`) — la valeur est
 * TOUJOURS substituée dans les consignes/labels, jamais affichée sous forme générique "f(a)".
 */
import type { ExerciceDefinitionDerivee } from "../core5e/definitionDerivee.types";
import type { FractionExacte } from "../core5e/limites.types";
import { deriveeExacte, valeurExacte } from "../generateurs5e/definitionDerivee/index";
import { pgcd } from "../generateurs5e/limites/fraction";
import { ORDRE_COMPLET } from "../moteur5e/typesDefinitionDerivee";
import type { EcranDefinitionDerivee } from "../moteur5e/typesDefinitionDerivee";

// ============================================================================
// Fragments LaTeX de bas niveau.
// ============================================================================

function formatFractionLatex(f: FractionExacte): string {
  if (f.den === 1) return `${f.num}`;
  const signe = f.num < 0 ? "-" : "";
  return `${signe}\\dfrac{${Math.abs(f.num)}}{${f.den}}`;
}

/** "h", "h+c" ou "h-|c|" — h plus une constante entière. */
function formatHPlusConstante(c: number): string {
  if (c === 0) return "h";
  return c > 0 ? `h+${c}` : `h-${Math.abs(c)}`;
}

/** Polynôme à partir de coefficients ascendants [constante, coeff1, coeff2...] — même patron que
 * `formatPolynomeLatex` (`ui5e/formatAsymptoteOblique.ts`/`formatLimites.ts`), variable
 * paramétrable ("x" pour f(x), "h" pour un développement en h). */
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

function formatPolynomeHLatex(coeffs: number[]): string {
  return formatPolynomeVarLatex(coeffs, "h");
}

/** ±(coeff·facteurLatex)/denLatex — signe porté devant la fraction, jamais au numérateur. Le
 * coefficient "1" implicite n'est omis QUE s'il reste un `facteurLatex` pour porter le numérateur à
 * l'affichage — sinon (facteurLatex vide) le "1"/"-1" DOIT rester affiché, jamais un numérateur
 * vide "\dfrac{}{...}" (bug jumeau découvert lors de l'audit fractions non réduites,
 * `promptauditfractionsnonreduites.md`). */
function formatFractionAvecFacteurLatex(coeff: number, facteurLatex: string, denLatex: string): string {
  const signe = coeff < 0 ? "-" : "";
  const abs = Math.abs(coeff);
  const coeffAffiche = abs === 1 && facteurLatex !== "" ? "" : `${abs}`;
  return `${signe}\\dfrac{${coeffAffiche}${facteurLatex}}{${denLatex}}`;
}

/** Réduit |numerateur|/|denomCoeff| par leur PGCD — CHAQUE signe reste indépendant (un facteur
 * symbolique du dénominateur, ex. "(h+a)", n'est jamais affecté par cette réduction, seul le
 * COEFFICIENT numérique qui l'accompagne l'est) — audit transversal,
 * `promptauditfractionsnonreduites.md` (même bug que `formatTangentes.ts::formatFractionSurRacineLatex`,
 * adapté ici à un facteur linéaire plutôt qu'une racine). */
function reduireCoeffs(numerateur: number, denomCoeff: number): { num: number; denomCoeff: number } {
  const g = pgcd(numerateur, denomCoeff);
  return { num: numerateur / g, denomCoeff: denomCoeff / g };
}

function formatFacteurXMoinsQ(q: number): string {
  if (q === 0) return "x";
  return q > 0 ? `x-${q}` : `x+${Math.abs(q)}`;
}

// ============================================================================
// f(x) — bloc de données. UNIQUEMENT f(x) — la valeur de `a` est annoncée dans la consigne
// générale, jamais répétée en ligne séparée (redondant).
// ============================================================================

export function formatFDeXLatex(exercice: ExerciceDefinitionDerivee): string {
  switch (exercice.famille) {
    case "affine":
      return `f(x)=${formatPolynomeVarLatex([exercice.p, exercice.m], "x")}`;
    case "quadratique":
      return `f(x)=${formatPolynomeVarLatex([exercice.p, 0, exercice.m], "x")}`;
    case "rationnelleSimple":
      return exercice.expo === 1 ? `f(x)=\\dfrac{${exercice.k}}{x}` : `f(x)=\\dfrac{${exercice.k}}{x^2}`;
    case "rationnelleLineaire":
      return `f(x)=\\dfrac{${formatPolynomeVarLatex([exercice.p, exercice.m], "x")}}{${formatFacteurXMoinsQ(exercice.q)}}`;
  }
}

export function formatTermesDonneesLatex(exercice: ExerciceDefinitionDerivee): string[] {
  return [formatFDeXLatex(exercice)];
}

/** Nombre écrit en texte courant : « − » typographique, jamais le trait d'union (audit 5c5a,
 * point 18). */
export function nombreTexte(n: number): string {
  return n < 0 ? `−${Math.abs(n)}` : `${n}`;
}

export function consigneGenerale(exercice: ExerciceDefinitionDerivee): string {
  return `Calcule le nombre dérivé f'(${nombreTexte(exercice.a)}) à partir de sa définition en termes de limite.`;
}

// ============================================================================
// Question spécifique par écran — texte + (pour "quotient"/"limite") un fragment LaTeX central à
// rendre via `<Katex>` côté composant (`EtapeDevelopperDerivee.tsx`/`EtapeChampLibreDerivee.tsx`),
// jamais en texte plat avec crochets pour une fraction/limite. La valeur de `a` de CET exercice est
// systématiquement substituée, y compris dans l'expression du quotient simplifié affichée en
// écran 3 (réutilise `formatQuotientConfirmeLatex`, définie plus bas, seule source de vérité pour
// cette forme).
// ============================================================================

export interface QuestionSpecifique {
  texteAvant: string;
  /** Fragment LaTeX central, rendu séparément via `<Katex>` — absent pour "developper" (aucune
   * fraction/limite à empiler dans ce cas, texte simple suffisant). */
  latex?: string;
  texteApres?: string;
}

export function questionSpecifiqueEcran(exercice: ExerciceDefinitionDerivee, ecran: EcranDefinitionDerivee): QuestionSpecifique {
  const a = exercice.a;
  switch (ecran) {
    case "developper":
      return exercice.famille === "affine" || exercice.famille === "quadratique"
        ? { texteAvant: `Calcule f(${nombreTexte(a)}), puis écris f(${nombreTexte(a)} + h) en fonction de h, sous forme développée et réduite.` }
        : { texteAvant: `Calcule f(${nombreTexte(a)}), puis écris f(${nombreTexte(a)} + h) en fonction de h : un seul numérateur et un seul dénominateur, chacun réduit.` };
    case "quotient":
      return {
        texteAvant: "Donne le taux d'accroissement",
        latex: `\\dfrac{f(${a}+h)-f(${a})}{h}`,
        texteApres: "en le simplifiant au maximum.",
      };
    case "limite":
      // Famille affine : pas d'écran « quotient » (il ferait recopier m) — l'élève part de la
      // définition elle-même.
      return exercice.famille === "affine"
        ? { texteAvant: "Calcule", latex: `f'(${a})=\\displaystyle\\lim_{h \\to 0}\\dfrac{f(${a}+h)-f(${a})}{h}`, texteApres: "." }
        : { texteAvant: "Calcule", latex: `f'(${a})=\\displaystyle\\lim_{h \\to 0}\\left(${formatQuotientConfirmeLatex(exercice, a)}\\right)`, texteApres: "." };
  }
}

// ============================================================================
// Libellés d'écran (récapitulatif) + labels de champs — valeur de `a` substituée partout.
// ============================================================================

export const LIBELLE_ECRAN: Record<EcranDefinitionDerivee, string> = {
  developper: "f(a) et f(a+h)",
  quotient: "Quotient simplifié",
  limite: "f'(a)",
};

/** Libellé d'écran avec la valeur de a substituée (récapitulatif, fiches des puces) — jamais
 * « f(a) » générique quand a est connu (audit 5c5a, point 16). */
export function libelleEcran(exercice: ExerciceDefinitionDerivee, ecran: EcranDefinitionDerivee): string {
  const a = exercice.a;
  switch (ecran) {
    case "developper":
      return `f(${nombreTexte(a)}) et f(${nombreTexte(a)} + h)`;
    case "quotient":
      return "Taux d'accroissement simplifié";
    case "limite":
      return `f'(${nombreTexte(a)})`;
  }
}

export function labelFA(a: number): string {
  return `f(${a})=`;
}

export function labelFAH(a: number): string {
  return `f(${a}+h)=`;
}

export function labelQuotient(a: number): string {
  return `\\dfrac{f(${a}+h)-f(${a})}{h}=`;
}

export function labelLimite(a: number): string {
  return `f'(${a})=`;
}

// ============================================================================
// Aides — niveau 1 (technique/piège spécifique à la famille), niveau 2 (exemple substitué proche,
// jamais la réponse) — pièges documentés par famille (spec) : familles 1-2, erreurs de signe en
// développant (a+h)²/en distribuant un coefficient négatif ; familles 3-4, oubli du même
// dénominateur avant de pouvoir factoriser le h.
// ============================================================================

/** Aide fragmentée — texte en français d'un côté, formule KaTeX de l'autre (jamais de formule
 * brute dans le texte), rendue via `<p>{aide.texte}</p> {aide.latex && <Katex expression={aide.latex} block />}`. */
export interface AideFragmentee {
  texte: string;
  latex: string | null;
}

export function texteAideNiveau1(exercice: ExerciceDefinitionDerivee, ecran: EcranDefinitionDerivee): AideFragmentee {
  if (ecran === "developper") {
    switch (exercice.famille) {
      case "affine":
        return { texte: "Développe simplement, aucun terme au carré ici :", latex: "f(a+h)=m(a+h)+p=ma+mh+p" };
      case "quadratique":
        return {
          texte: "Développe d'abord le carré, puis multiplie par m. Piège : oublier le terme croisé 2ah, ou une erreur de signe si m est négatif :",
          latex: "f(a+h)=m(a+h)^2+p, \\quad (a+h)^2=a^2+2ah+h^2",
        };
      case "rationnelleSimple":
        return exercice.expo === 1
          ? { texte: "Remplace x par a + h : le numérateur ne change pas, le dénominateur devient a + h, que tu peux garder tel quel :", latex: "f(a+h)=\\dfrac{k}{a+h}" }
          : { texte: "Remplace x par a + h : le numérateur ne change pas, le dénominateur devient le carré de a + h :", latex: "f(a+h)=\\dfrac{k}{(a+h)^2}" };
      case "rationnelleLineaire":
        return {
          texte: "Remplace x par a + h au numérateur et au dénominateur, puis réduis chacun des deux :",
          latex: "f(a+h)=\\dfrac{m(a+h)+p}{(a+h)-q}",
        };
    }
  }
  if (ecran === "quotient") {
    switch (exercice.famille) {
      case "affine":
        return { texte: "Le h se simplifie directement, sans reste :", latex: "\\dfrac{f(a+h)-f(a)}{h}=\\dfrac{mh}{h}=m" };
      case "quadratique":
        return {
          texte: "Mets h en évidence au numérateur de f(a + h) − f(a) avant de diviser par h. Une fois le h simplifié, il doit rester :",
          latex: "2ma+mh",
        };
      case "rationnelleSimple":
        return {
          texte: "Mets f(a + h) − f(a) au même dénominateur avant de diviser par h — sinon impossible de mettre h en évidence au numérateur pour le simplifier.",
          latex: null,
        };
      case "rationnelleLineaire":
        return {
          texte: "Mets f(a + h) − f(a) au même dénominateur avant de diviser par h — le numérateur se réduit alors à un multiple de h, qui se simplifie avec le h du quotient. Dénominateur commun :",
          latex: "(a+h-q)(a-q)",
        };
    }
  }
  if (exercice.famille === "affine") {
    return { texte: "Calcule f(a + h) − f(a) : les termes sans h s'annulent, il ne reste qu'un multiple de h, qui se simplifie avec le h du dénominateur.", latex: null };
  }
  return {
    texte: "Dans le quotient simplifié, il ne reste plus de facteur h qui annulerait le dénominateur : remplace directement h par 0 pour obtenir f'(a).",
    latex: null,
  };
}

export function texteAideNiveau2(exercice: ExerciceDefinitionDerivee, ecran: EcranDefinitionDerivee): AideFragmentee {
  if (ecran === "developper") {
    switch (exercice.famille) {
      case "affine":
        return { texte: "Exemple :", latex: "\\begin{array}{l} f(x)=2x+3 \\\\ \\Rightarrow\\; f(a+h)=2(a+h)+3=2a+2h+3 \\end{array}" };
      case "quadratique":
        return {
          texte: "Exemple :",
          latex: "\\begin{array}{l} f(x)=x^2+1,\\ a=5 \\\\ \\Rightarrow\\; f(5+h)=(5+h)^2+1 \\\\ =25+10h+h^2+1=h^2+10h+26 \\end{array}",
        };
      case "rationnelleSimple":
        return exercice.expo === 1
          ? { texte: "Exemple :", latex: "\\begin{array}{l} f(x)=\\dfrac{4}{x},\\ a=2 \\\\ \\Rightarrow\\; f(2+h)=\\dfrac{4}{2+h} \\end{array}" }
          : { texte: "Exemple :", latex: "\\begin{array}{l} f(x)=\\dfrac{4}{x^2},\\ a=2 \\\\ \\Rightarrow\\; f(2+h)=\\dfrac{4}{(2+h)^2} \\end{array}" };
      case "rationnelleLineaire":
        return {
          texte: "Exemple :",
          latex: "\\begin{array}{l} f(x)=\\dfrac{x+1}{x-2},\\ a=3 \\\\ \\Rightarrow\\; f(3+h)=\\dfrac{(3+h)+1}{(3+h)-2} \\\\ =\\dfrac{h+4}{h+1} \\end{array}",
        };
    }
  }
  if (ecran === "quotient") {
    switch (exercice.famille) {
      case "affine":
        return {
          texte: "Exemple :",
          latex: "\\begin{array}{l} f(x)=2x+3 \\\\ f(a+h)-f(a)=(2a+2h+3)-(2a+3)=2h \\\\ \\Rightarrow\\; \\dfrac{2h}{h}=2 \\end{array}",
        };
      case "quadratique":
        return {
          texte: "Exemple :",
          latex: "\\begin{array}{l} a=5:\\ f(5+h)-f(5)=(h^2+10h+26)-26 \\\\ =h^2+10h=h(h+10) \\\\ \\Rightarrow\\; \\dfrac{h(h+10)}{h}=h+10 \\end{array}",
        };
      case "rationnelleSimple":
        return {
          texte: "Exemple :",
          latex:
            "\\begin{array}{l} f(x)=\\dfrac{4}{x},\\ a=2 \\\\ \\dfrac{\\frac{4}{2+h}-\\frac{4}{2}}{h} = \\dfrac{\\frac{8-4(2+h)}{2(2+h)}}{h} \\\\ = \\dfrac{\\frac{-4h}{2(2+h)}}{h} = \\dfrac{-2}{2+h} \\end{array}",
        };
      case "rationnelleLineaire":
        return {
          texte: "Exemple :",
          latex:
            "\\begin{array}{l} f(x)=\\dfrac{x+1}{x-2},\\ a=3 \\\\ \\dfrac{\\frac{h+4}{h+1}-4}{h}=\\dfrac{\\frac{h+4-4(h+1)}{h+1}}{h} \\\\ =\\dfrac{\\frac{-3h}{h+1}}{h}=\\dfrac{-3}{h+1} \\end{array}",
        };
    }
  }
  if (exercice.famille === "affine") {
    return { texte: "Exemple :", latex: "\\begin{array}{l} f(x)=2x+3 \\\\ \\dfrac{f(a+h)-f(a)}{h}=\\dfrac{2h}{h}=2 \\;\\xrightarrow{h\\to0}\\; f'(a)=2 \\end{array}" };
  }
  return { texte: "Exemple : si le quotient simplifié vaut 2a + h, on remplace h par 0 :", latex: "\\lim_{h\\to0}(2a+h)=2a" };
}

// ============================================================================
// Développement/quotient CONFIRMÉS — formes canoniques (état actuel + récapitulatif + question
// spécifique écran 3). Toute forme algébriquement équivalente est acceptée par la vérification ;
// ces fonctions n'affichent qu'UNE forme correcte de référence.
// ============================================================================

function formatDeveloppementConfirmeLatex(exercice: ExerciceDefinitionDerivee, a: number): string {
  switch (exercice.famille) {
    case "affine":
      return formatPolynomeHLatex([exercice.m * a + exercice.p, exercice.m]);
    case "quadratique":
      return formatPolynomeHLatex([exercice.m * a * a + exercice.p, 2 * exercice.m * a, exercice.m]);
    case "rationnelleSimple":
      return exercice.expo === 1 ? `\\dfrac{${exercice.k}}{${formatHPlusConstante(a)}}` : `\\dfrac{${exercice.k}}{(${formatHPlusConstante(a)})^2}`;
    case "rationnelleLineaire":
      return `\\dfrac{${formatPolynomeHLatex([exercice.m * a + exercice.p, exercice.m])}}{${formatHPlusConstante(a - exercice.q)}}`;
  }
}

/** Coefficient numérique écrit DEVANT un facteur entre parenthèses (« 2(h+1) », « (h+1) » si 1) —
 * jamais « (h+1)(−1) » (audit 5c5a, point 14) : le signe est reporté sur le numérateur avant
 * l'appel. */
function formatCoeffDevantFacteur(coeff: number, facteurLatex: string): string {
  return coeff === 1 ? facteurLatex : `${coeff}${facteurLatex}`;
}

/** Normalise le signe : dénominateur numérique toujours positif, signe porté par le numérateur. */
function signeAuNumerateur(num: number, denomCoeff: number): { num: number; denomCoeff: number } {
  return denomCoeff < 0 ? { num: -num, denomCoeff: -denomCoeff } : { num, denomCoeff };
}

function formatQuotientConfirmeLatex(exercice: ExerciceDefinitionDerivee, a: number): string {
  switch (exercice.famille) {
    case "affine":
      return `${exercice.m}`;
    case "quadratique":
      return formatPolynomeHLatex([2 * exercice.m * a, exercice.m]);
    case "rationnelleSimple": {
      if (exercice.expo === 1) {
        const reduit = reduireCoeffs(-exercice.k, a);
        const { num, denomCoeff } = signeAuNumerateur(reduit.num, reduit.denomCoeff);
        return formatFractionAvecFacteurLatex(num, "", formatCoeffDevantFacteur(denomCoeff, `(${formatHPlusConstante(a)})`));
      }
      const { num, denomCoeff } = reduireCoeffs(-exercice.k, a * a);
      const numFacteur = `(${formatPolynomeHLatex([2 * a, 1])})`;
      return formatFractionAvecFacteurLatex(num, numFacteur, formatCoeffDevantFacteur(denomCoeff, `(${formatHPlusConstante(a)})^2`));
    }
    case "rationnelleLineaire": {
      const numConst = -(exercice.m * exercice.q + exercice.p);
      const denomCoeffRaw = a - exercice.q;
      const reduit = reduireCoeffs(numConst, denomCoeffRaw);
      const { num, denomCoeff } = signeAuNumerateur(reduit.num, reduit.denomCoeff);
      return formatFractionAvecFacteurLatex(num, "", formatCoeffDevantFacteur(denomCoeff, `(${formatHPlusConstante(denomCoeffRaw)})`));
    }
  }
}

function formatFAConfirmeLatex(exercice: ExerciceDefinitionDerivee, a: number): string {
  return `f(${a})=${formatFractionLatex(valeurExacte(exercice, a))}`;
}

function formatDeveloppementEtatActuelLatex(exercice: ExerciceDefinitionDerivee, a: number): string {
  return `f(${a}+h)=${formatDeveloppementConfirmeLatex(exercice, a)}`;
}

function formatQuotientEtatActuelLatex(exercice: ExerciceDefinitionDerivee, a: number): string {
  return `\\dfrac{f(${a}+h)-f(${a})}{h}=${formatQuotientConfirmeLatex(exercice, a)}`;
}

function formatLimiteConfirmeeLatex(exercice: ExerciceDefinitionDerivee, a: number): string {
  return `f'(${a})=${formatFractionLatex(deriveeExacte(exercice, a))}`;
}

// ============================================================================
// Bloc "état actuel" — récapitule les valeurs CONFIRMÉES de l'exercice EN COURS.
// ============================================================================

export function formatTermesEtatActuelLatex(exercice: ExerciceDefinitionDerivee, ecran: EcranDefinitionDerivee): string[] | null {
  const indexEcran = ORDRE_COMPLET.indexOf(ecran);
  if (indexEcran === 0) return null;
  const a = exercice.a;
  const termes: string[] = [`${formatFAConfirmeLatex(exercice, a)}\\,;`, formatDeveloppementEtatActuelLatex(exercice, a)];
  if (indexEcran >= 2 && exercice.famille !== "affine") termes.push(formatQuotientEtatActuelLatex(exercice, a));
  return termes;
}

// ============================================================================
// Récapitulatif final — réponse ATTENDUE pour chaque écran (les 3 traversés).
// ============================================================================

export function formatReponseAttendueEcranLatex(exercice: ExerciceDefinitionDerivee, ecran: EcranDefinitionDerivee): string[] {
  const a = exercice.a;
  switch (ecran) {
    case "developper":
      // Point-virgule après f(a) : les deux égalités ne se lisent jamais comme un produit.
      return [`${formatFAConfirmeLatex(exercice, a)}\\,;`, formatDeveloppementEtatActuelLatex(exercice, a)];
    case "quotient":
      return [formatQuotientEtatActuelLatex(exercice, a)];
    case "limite":
      return [formatLimiteConfirmeeLatex(exercice, a)];
  }
}
