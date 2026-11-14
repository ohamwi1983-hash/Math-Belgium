import { DUREES, basesCommunes, donneesTaille, ecritureScientifique, logPuissance, logsComparer, logsDuree, premierEstPlusGrand } from "../core6e/grandsNombresLog";
import type { ExerciceComparer, ExerciceGrandsNombres } from "../core6e/grandsNombresLog";
import type { PhaseGrandsNombres } from "../moteur6e/typesGrandsNombresLog";
import { estPhaseChoix } from "../moteur6e/typesGrandsNombresLog";

/**
 * Couche C (6e) — textes de `6gen92` « Grands nombres et logarithme décimal ». SOURCE UNIQUE des
 * consignes, aides, options et réponses attendues : l'écran, le récapitulatif et l'adaptateur de
 * feuilles (`generateurs6e/grandsNombresLog/exportEvaluation.ts`) en dérivent.
 *
 * Notations du cours (chapitre 3 de 6e, section « propriétés ») : `\log` = logarithme décimal
 * (`\log_{10}`), propriété de la puissance `\log(a^n) = n\log(a)`, virgule décimale `{,}`, espace
 * fine des milliers, jamais de prose dans le mode math ; aides = phrase terminée par « : » puis la
 * formule, sans la réponse finale.
 */

export type FragmentConsigne = { type: "texte"; valeur: string } | { type: "latex"; valeur: string };

export interface ChampDef {
  /** Texte brut (historique, aria-label). */
  label: string;
  labelLatex?: string;
  placeholder: string;
}

export interface AideAvecLatex {
  texte: string;
  latex?: string;
}

export interface OptionChoix {
  id: string;
  fragments: FragmentConsigne[];
}

const t = (valeur: string): FragmentConsigne => ({ type: "texte", valeur });
const l = (valeur: string): FragmentConsigne => ({ type: "latex", valeur });

// ============================================================================
// Écriture des nombres.
// ============================================================================

function grouper(entier: string, separateur: string): string {
  if (entier.length < 5) return entier;
  return entier.replace(/\B(?=(\d{3})+(?!\d))/g, separateur);
}

/** « 12.500 » → « 12.5 », « 3.000 » → « 3 » ; un entier (« 1880 ») garde ses zéros. */
function sansZerosInutiles(s: string): string {
  return s.includes(".") ? s.replace(/0+$/, "").replace(/\.$/, "") : s;
}

/** Nombre arrondi à `decimales` chiffres, virgule `{,}` et espace fine des milliers (dès 10 000). */
export function nbLatex(x: number, decimales = 3): string {
  const facteur = Math.pow(10, decimales);
  const arrondi = Math.round(x * facteur) / facteur;
  const [ent, dec] = sansZerosInutiles(Math.abs(arrondi).toFixed(decimales)).split(".");
  return `${arrondi < 0 ? "-" : ""}${grouper(ent, "\\,")}${dec ? `{,}${dec}` : ""}`;
}

/** Même chose en texte brut (virgule, espace fine insécable des milliers). */
export function nbTexte(x: number, decimales = 3): string {
  const facteur = Math.pow(10, decimales);
  const arrondi = Math.round(x * facteur) / facteur;
  const [ent, dec] = sansZerosInutiles(Math.abs(arrondi).toFixed(decimales)).split(".");
  return `${arrondi < 0 ? "−" : ""}${grouper(ent, " ")}${dec ? `,${dec}` : ""}`;
}

const EXPOSANTS_UNICODE = "⁰¹²³⁴⁵⁶⁷⁸⁹";

/** 7¹⁵⁰ en texte brut (exposant en chiffres Unicode). */
export function puissanceTexte(a: number, n: number): string {
  return `${a}${String(n)
    .split("")
    .map((c) => EXPOSANTS_UNICODE[Number(c)])
    .join("")}`;
}

/** 7^{150} en LaTeX (espace fine des milliers dans l'exposant). */
export function puissanceLatex(a: number, n: number): string {
  return `${a}^{${grouper(String(n), "\\,")}}`;
}

/** Mantisse « au centième » et exposant d'un nombre de logarithme L : « 5{,}79\times 10^{126} ». */
export function scientifiqueLatex(L: number): string {
  const s = ecritureScientifique(L);
  return `${nbLatex(s.m, 2)}\\times 10^{${s.E}}`;
}

export function scientifiqueTexte(L: number): string {
  const s = ecritureScientifique(L);
  return `${nbTexte(s.m, 2)} × 10${String(s.E)
    .split("")
    .map((c) => EXPOSANTS_UNICODE[Number(c)])
    .join("")}`;
}

/** Logarithme arrondi au millième, précédé de « = » ou « ≈ ». */
function approxLatex(x: number): string {
  return Math.abs(Math.round(x * 1000) / 1000 - x) < 1e-12 ? `=${nbLatex(x)}` : `\\approx ${nbLatex(x)}`;
}

const PRECISION_LOG = " (arrondi au millième)";
const LOG_DECIMAL = [t("On note "), l("\\log"), t(" le logarithme décimal ("), l("\\log=\\log_{10}"), t(").")];

// ============================================================================
// Consigne générale et données.
// ============================================================================

function nomPuissance(e: ExerciceGrandsNombres): string {
  return e.variante === "chiffres" || e.variante === "premier-chiffre" ? puissanceLatex(e.a, e.n) : "";
}

export function consigneGenerale(e: ExerciceGrandsNombres): FragmentConsigne[] {
  switch (e.variante) {
    case "chiffres":
      if (e.mersenne) {
        const p = puissanceLatex(2, e.n);
        return [
          t(`En ${e.mersenne.annee}, on a démontré que `),
          l(`${p}-1`),
          t(" est un nombre premier (un « nombre premier de Mersenne »). Combien de chiffres faut-il pour l'écrire en entier ? Comme "),
          l(p),
          t(" se termine par 2, 4, 6 ou 8, il compte autant de chiffres que "),
          l(`${p}-1`),
          t(" : on travaille avec "),
          l(p),
          t(". "),
          ...LOG_DECIMAL,
        ];
      }
      return [
        t("Le nombre "),
        l(nomPuissance(e)),
        t(" est bien trop grand pour ta calculatrice, qui ne peut pas l'afficher. Le logarithme décimal permet pourtant de savoir combien de chiffres il faut pour l'écrire en entier. "),
        ...LOG_DECIMAL,
      ];
    case "premier-chiffre":
      return [
        t("Le nombre "),
        l(nomPuissance(e)),
        t(" est trop grand pour ta calculatrice. À l'aide du logarithme décimal, détermine son écriture scientifique "),
        l(`${nomPuissance(e)}\\approx m\\times 10^{E}`),
        t(" (avec "),
        l("1\\leq m<10"),
        t(" et "),
        l("E"),
        t(" entier), puis son premier chiffre. "),
        ...LOG_DECIMAL,
      ];
    case "comparer": {
      const x = puissanceLatex(e.a, e.n);
      const y = puissanceLatex(e.b, e.m);
      if (e.sousCas === "exact") return [t("Sans calculatrice, détermine lequel des deux nombres "), l(x), t(" et "), l(y), t(" est le plus grand.")];
      return [t("Les nombres "), l(x), t(" et "), l(y), t(" sont trop grands pour ta calculatrice. Lequel est le plus grand ? "), ...LOG_DECIMAL];
    }
    case "temps": {
      const debut = [t("Un ordinateur effectue "), l(`10^{${e.p}}`), t(" opérations par seconde. Un algorithme demande "), l("2^{n}"), t(" opérations pour traiter un problème de taille "), l("n"), t(". ")];
      if (e.sousCas === "duree") return [...debut, t("Combien de temps lui faut-il pour "), l(`n=${e.n}`), t(" ? On prend 1 an = 365 jours. "), ...LOG_DECIMAL];
      return [...debut, t("Quelle est la plus grande taille "), l("n"), t(` qu'il peut traiter en ${DUREES[e.duree].libelle} ? `), ...LOG_DECIMAL];
    }
  }
}

// ============================================================================
// Écrans.
// ============================================================================

export function libellePhase(phase: PhaseGrandsNombres): string {
  switch (phase) {
    case "logPuissance":
      return "Logarithme de la puissance";
    case "partieEntiere":
      return "Partie entière";
    case "nombreChiffres":
      return "Nombre de chiffres";
    case "logsDeux":
      return "Logarithmes des deux nombres";
    case "memeExposant":
      return "Même exposant";
    case "verdict":
      return "Conclusion";
    case "scientifique":
      return "Écriture scientifique";
    case "premierChiffre":
      return "Premier chiffre";
    case "logOperations":
      return "Logarithme du nombre d'opérations";
    case "dureeSecondes":
      return "Durée en secondes";
    case "dureeAnnees":
      return "Durée en années";
    case "operations":
      return "Opérations disponibles";
    case "borne":
      return "Inéquation";
    case "plusGrandN":
      return "Plus grande taille";
  }
}

export function consigneEcran(e: ExerciceGrandsNombres, phase: PhaseGrandsNombres): FragmentConsigne[] {
  switch (e.variante) {
    case "chiffres":
    case "premier-chiffre": {
      const P = puissanceLatex(e.a, e.n);
      if (phase === "logPuissance") return [t("Calcule "), l(`\\log(${P})`), t(`${PRECISION_LOG}.`)];
      if (phase === "partieEntiere") return [t("Donne la partie entière de "), l(`\\log(${P})`), t(".")];
      if (phase === "nombreChiffres") return [t("Déduis-en le nombre de chiffres de "), l(P), t(".")];
      if (phase === "scientifique") return [t("Donne l'écriture scientifique "), l(`${P}\\approx m\\times 10^{E}`), t(" : la mantisse "), l("m"), t(" (arrondie au centième) et l'exposant "), l("E"), t(".")];
      if (phase === "premierChiffre") return [t("Déduis-en le premier chiffre (le plus à gauche) de "), l(P), t(" et le nombre de chiffres de son écriture.")];
      return [];
    }
    case "comparer": {
      const x = puissanceLatex(e.a, e.n);
      const y = puissanceLatex(e.b, e.m);
      if (phase === "logsDeux") return [t("Calcule "), l(`\\log(${x})`), t(" et "), l(`\\log(${y})`), t(" (arrondis au millième).")];
      if (phase === "memeExposant") return [t("Écris les deux nombres comme des puissances d'exposant "), l(`${e.k}`), t(" : donne les deux bases.")];
      if (phase === "verdict") return [t("Quelle conclusion tirer ? Une seule tentative.")];
      return [];
    }
    case "temps": {
      if (e.sousCas === "duree") {
        const P = puissanceLatex(2, e.n);
        if (phase === "logOperations") return [t("Calcule "), l(`\\log(${P})`), t(`, le logarithme du nombre d'opérations${PRECISION_LOG}.`)];
        if (phase === "dureeSecondes") return [t("Calcule la durée "), l("T"), t(" du calcul, en secondes, sous la forme "), l("T\\approx m\\times 10^{E}"), t(" (mantisse "), l("m"), t(" arrondie au centième).")];
        if (phase === "dureeAnnees") return [t("Convertis cette durée en années (1 an = 365 jours) : "), l("T'\\approx m\\times 10^{E}"), t(" années (mantisse "), l("m"), t(" arrondie au centième).")];
        return [];
      }
      const D = DUREES[e.duree].libelle;
      if (phase === "operations") return [t("Combien d'opérations "), l("N"), t(` l'ordinateur effectue-t-il en ${D} ? Donne-le sous la forme `), l("N=m\\times 10^{E}"), t(".")];
      if (phase === "borne") return [t("Résous l'inéquation "), l("2^{n}\\leq N"), t(" en appliquant "), l("\\log"), t(" aux deux membres : donne la borne de "), l("n"), t(" (arrondie au centième).")];
      if (phase === "plusGrandN") return [t("Quelle est la plus grande taille "), l("n"), t(` (entière) que l'ordinateur peut traiter en ${D} ?`)];
      return [];
    }
  }
}

const CHAMP_MANTISSE: ChampDef = { label: "Mantisse m", labelLatex: "m", placeholder: "ex : 3,14" };
const CHAMP_EXPOSANT: ChampDef = { label: "Exposant E", labelLatex: "E", placeholder: "ex : 52" };

export function champsEcran(e: ExerciceGrandsNombres, phase: PhaseGrandsNombres): ChampDef[] {
  switch (e.variante) {
    case "chiffres":
    case "premier-chiffre": {
      const P = puissanceLatex(e.a, e.n);
      if (phase === "logPuissance") return [{ label: `log(${puissanceTexte(e.a, e.n)})`, labelLatex: `\\log(${P})`, placeholder: "ex : 52,318" }];
      if (phase === "partieEntiere") return [{ label: "Partie entière", placeholder: "ex : 52" }];
      if (phase === "nombreChiffres") return [{ label: "Nombre de chiffres", placeholder: "ex : 53" }];
      if (phase === "scientifique") return [CHAMP_MANTISSE, CHAMP_EXPOSANT];
      if (phase === "premierChiffre") return [{ label: "Premier chiffre", placeholder: "ex : 4" }, { label: "Nombre de chiffres", placeholder: "ex : 53" }];
      return [];
    }
    case "comparer":
      if (phase === "logsDeux") {
        return [
          { label: `log(${puissanceTexte(e.a, e.n)})`, labelLatex: `\\log(${puissanceLatex(e.a, e.n)})`, placeholder: "ex : 52,318" },
          { label: `log(${puissanceTexte(e.b, e.m)})`, labelLatex: `\\log(${puissanceLatex(e.b, e.m)})`, placeholder: "ex : 52,318" },
        ];
      }
      if (phase === "memeExposant") {
        return [
          { label: `Base pour ${puissanceTexte(e.a, e.n)}`, labelLatex: `${puissanceLatex(e.a, e.n)}=\\left(\\,?\\,\\right)^{${e.k}}`, placeholder: "ex : 4" },
          { label: `Base pour ${puissanceTexte(e.b, e.m)}`, labelLatex: `${puissanceLatex(e.b, e.m)}=\\left(\\,?\\,\\right)^{${e.k}}`, placeholder: "ex : 5" },
        ];
      }
      return [];
    case "temps":
      if (e.sousCas === "duree") {
        if (phase === "logOperations") return [{ label: `log(${puissanceTexte(2, e.n)})`, labelLatex: `\\log(${puissanceLatex(2, e.n)})`, placeholder: "ex : 52,318" }];
        if (phase === "dureeSecondes" || phase === "dureeAnnees") return [CHAMP_MANTISSE, CHAMP_EXPOSANT];
        return [];
      }
      if (phase === "operations") return [CHAMP_MANTISSE, CHAMP_EXPOSANT];
      if (phase === "borne") return [{ label: "Borne de n", labelLatex: "n\\leq", placeholder: "ex : 52,31" }];
      if (phase === "plusGrandN") return [{ label: "Plus grande taille n", labelLatex: "n", placeholder: "ex : 52" }];
      return [];
  }
}

// ============================================================================
// Choix fermé (verdict de la comparaison).
// ============================================================================

function verdictsCanoniques(e: ExerciceComparer): string[] {
  const x = puissanceLatex(e.a, e.n);
  const y = puissanceLatex(e.b, e.m);
  return [`${x}>${y}`, `${x}<${y}`];
}

export function optionsChoix(e: ExerciceGrandsNombres): OptionChoix[] {
  if (e.variante !== "comparer") return [];
  const c = verdictsCanoniques(e);
  return e.ordreVerdict.map((i) => ({ id: `${i}`, fragments: [l(c[i])] }));
}

export function fragmentsOption(options: OptionChoix[], id: string | null): FragmentConsigne[] {
  return options.find((o) => o.id === id)?.fragments ?? [];
}

// ============================================================================
// Réponses attendues (source unique : écran, récapitulatif, corrigé, barème).
// ============================================================================

/** « \log(7^{150})=150\log(7)\approx 126{,}763 ». */
export function logPuissanceLatex(a: number, n: number): string {
  return `\\log(${puissanceLatex(a, n)})=${grouper(String(n), "\\,")}\\log(${a})${approxLatex(logPuissance(a, n))}`;
}

/** Comparaison des deux nombres, signe juste. */
export function comparaisonLatex(e: ExerciceComparer): string {
  return verdictsCanoniques(e)[premierEstPlusGrand(e) ? 0 : 1];
}

function memeExposantLatex(e: ExerciceComparer): string[] {
  const [A, B] = basesCommunes(e);
  const k = e.k ?? 1;
  const ecrire = (a: number, n: number, base: number) => (n / k === 1 ? puissanceLatex(a, n) : `${puissanceLatex(a, n)}=\\left(${a}^{${n / k}}\\right)^{${k}}=${base}^{${k}}`);
  return [ecrire(e.a, e.n, A), ecrire(e.b, e.m, B)];
}

/** Réponse juste d'un écran, en fragments (texte et LaTeX). */
export function reponseFragments(e: ExerciceGrandsNombres, phase: PhaseGrandsNombres): FragmentConsigne[] {
  switch (e.variante) {
    case "chiffres":
    case "premier-chiffre": {
      const P = puissanceLatex(e.a, e.n);
      const L = logPuissance(e.a, e.n);
      const s = ecritureScientifique(L);
      if (phase === "logPuissance") return [l(logPuissanceLatex(e.a, e.n))];
      if (phase === "partieEntiere") return [l(`${s.E}\\leq\\log(${P})<${s.E + 1}`), t(` : la partie entière vaut ${nbTexte(s.E, 0)}.`)];
      if (phase === "nombreChiffres") return [l(`10^{${s.E}}\\leq ${P}<10^{${s.E + 1}}`), t(" : "), l(P), t(` compte ${nbTexte(s.E, 0)} + 1 = ${nbTexte(s.E + 1, 0)} chiffres.`)];
      if (phase === "scientifique") return [l(`${P}\\approx 10^{${nbLatex(s.f)}}\\times 10^{${s.E}}\\approx ${scientifiqueLatex(L)}`)];
      if (phase === "premierChiffre") return [t(`Premier chiffre : ${Math.floor(s.m)} ; nombre de chiffres : ${nbTexte(s.E, 0)} + 1 = ${nbTexte(s.E + 1, 0)}.`)];
      return [];
    }
    case "comparer": {
      if (phase === "logsDeux") return [l(logPuissanceLatex(e.a, e.n)), t(" ; "), l(logPuissanceLatex(e.b, e.m))];
      if (phase === "memeExposant") {
        const [x, y] = memeExposantLatex(e);
        return [l(x), t(" ; "), l(y)];
      }
      if (phase === "verdict") {
        if (e.sousCas === "exact") {
          const [A, B] = basesCommunes(e);
          const k = e.k ?? 1;
          return [l(`${A}${A > B ? ">" : "<"}${B}`), t(" donc "), l(`${A}^{${k}}${A > B ? ">" : "<"}${B}^{${k}}`), t(", c'est-à-dire "), l(comparaisonLatex(e)), t(".")];
        }
        const [l1, l2] = logsComparer(e);
        const signe = l1 > l2 ? ">" : "<";
        return [
          l(`\\log(${puissanceLatex(e.a, e.n)})\\approx ${nbLatex(l1)}${signe}${nbLatex(l2)}\\approx\\log(${puissanceLatex(e.b, e.m)})`),
          t(" et la fonction log est croissante, donc "),
          l(comparaisonLatex(e)),
          t("."),
        ];
      }
      return [];
    }
    case "temps": {
      if (e.sousCas === "duree") {
        const L = logsDuree(e);
        if (phase === "logOperations") return [l(logPuissanceLatex(2, e.n))];
        if (phase === "dureeSecondes") return [l(`T=\\dfrac{${puissanceLatex(2, e.n)}}{10^{${e.p}}}\\approx ${scientifiqueLatex(L.secondes)}`), t(" secondes")];
        if (phase === "dureeAnnees") return [l(`T'=\\dfrac{T}{31\\,536\\,000}\\approx ${scientifiqueLatex(L.annees)}`), t(" années")];
        return [];
      }
      const d = donneesTaille(e);
      if (phase === "operations") {
        const sN = ecritureScientifique(d.logN);
        return [l(`N=10^{${e.p}}\\times ${nbLatex(DUREES[e.duree].secondes, 0)}=${nbLatex(sN.m, 4)}\\times 10^{${sN.E}}`)];
      }
      if (phase === "borne") return [l(`2^{n}\\leq N\\iff n\\log(2)\\leq\\log(N)\\iff n\\leq\\dfrac{\\log(N)}{\\log(2)}\\approx ${nbLatex(d.borne, 2)}`)];
      if (phase === "plusGrandN") return [t("Plus grande taille traitable : "), l(`n=${d.nMax}`), t(".")];
      return [];
    }
  }
}

/** Ligne du récapitulatif : formules LaTeX (`latex`) ou phrase en texte brut (`texte`). */
export function reponseRecap(e: ExerciceGrandsNombres, phase: PhaseGrandsNombres): { latex: string[] } | { texte: string } {
  if (estPhaseChoix(phase) && e.variante === "comparer") return { latex: [comparaisonLatex(e)] };
  const frags = reponseFragments(e, phase);
  const formules = frags.filter((f) => f.type === "latex").map((f) => f.valeur);
  switch (phase) {
    case "nombreChiffres":
      return e.variante === "chiffres" ? { texte: `${puissanceTexte(e.a, e.n)} compte ${nbTexte(ecritureScientifique(logPuissance(e.a, e.n)).E + 1, 0)} chiffres` } : { latex: formules };
    case "premierChiffre":
      return { texte: frags.map((f) => f.valeur).join("").replace(/\.$/, "") };
    case "dureeSecondes":
      return e.variante === "temps" && e.sousCas === "duree" ? { texte: `T ≈ ${scientifiqueTexte(logsDuree(e).secondes)} s` } : { latex: formules };
    case "dureeAnnees":
      return e.variante === "temps" && e.sousCas === "duree" ? { texte: `T′ ≈ ${scientifiqueTexte(logsDuree(e).annees)} années` } : { latex: formules };
    case "partieEntiere":
    case "plusGrandN":
      return { latex: formules.slice(0, 1) };
    default:
      return { latex: formules };
  }
}

// ============================================================================
// Aides (jamais la réponse finale).
// ============================================================================

const AIDE_PUISSANCE: AideAvecLatex = { texte: "La propriété de la puissance fait passer l'exposant devant le logarithme :", latex: "\\log\\left(a^{n}\\right)=n\\log(a)" };

export function aideNiveau1(e: ExerciceGrandsNombres, phase: PhaseGrandsNombres): AideAvecLatex {
  switch (phase) {
    case "logPuissance":
    case "logsDeux":
    case "logOperations":
      return AIDE_PUISSANCE;
    case "partieEntiere":
      return { texte: "La partie entière d'un nombre positif est l'entier juste en dessous : on supprime les décimales, sans arrondir. Par exemple :", latex: "3\\leq 3{,}9<4" };
    case "nombreChiffres":
      return { texte: "Encadre le logarithme entre deux entiers consécutifs, puis applique l'exponentielle de base 10, qui est croissante :", latex: "E\\leq\\log(N)<E+1\\iff 10^{E}\\leq N<10^{E+1}" };
    case "memeExposant":
      return { texte: "Utilise la propriété des puissances de puissances :", latex: "a^{p\\cdot k}=\\left(a^{p}\\right)^{k}" };
    case "verdict":
      return e.variante === "comparer" && e.sousCas === "exact"
        ? { texte: "Deux puissances de même exposant positif sont rangées dans le même ordre que leurs bases (positives) :", latex: `A<B\\iff A^{${e.k}}<B^{${e.k}}` }
        : { texte: "La fonction log est strictement croissante : deux nombres sont rangés dans le même ordre que leurs logarithmes :", latex: "x<y\\iff\\log(x)<\\log(y)" };
    case "scientifique":
      return { texte: "Sépare le logarithme en sa partie entière E et sa partie décimale f (avec 0 ≤ f < 1), puis repasse aux puissances de 10 :", latex: "N=10^{E+f}=10^{f}\\times 10^{E}" };
    case "premierChiffre":
      return { texte: "Le premier chiffre du nombre est le chiffre des unités de sa mantisse :", latex: "N\\approx m\\times 10^{E}\\qquad 1\\leq m<10" };
    case "dureeSecondes":
      if (e.variante !== "temps" || e.sousCas !== "duree") return { texte: "" };
      return {
        texte: "La durée est le nombre d'opérations divisé par le nombre d'opérations par seconde ; en logarithme, la division devient une soustraction :",
        latex: `\\log(T)=\\log\\left(${puissanceLatex(2, e.n)}\\right)-\\log\\left(10^{${e.p}}\\right)=${e.n}\\log(2)-${e.p}`,
      };
    case "dureeAnnees":
      return { texte: "Une année de 365 jours compte, en secondes :", latex: "365\\times 24\\times 3600=31\\,536\\,000" };
    case "operations":
      if (e.variante !== "temps" || e.sousCas !== "taille") return { texte: "" };
      return { texte: `Exprime d'abord ${DUREES[e.duree].libelle.replace(/ \(.*\)$/, "")} en secondes :`, latex: DUREES[e.duree].calculLatex };
    case "borne":
      return { texte: "Applique log (croissante) aux deux membres, puis la propriété de la puissance :", latex: "2^{n}\\leq N\\iff n\\log(2)\\leq\\log(N)" };
    case "plusGrandN":
      return { texte: "n doit être un entier qui vérifie l'inégalité obtenue à l'étape précédente : on garde le plus grand entier inférieur ou égal à la borne." };
  }
}

export function aideNiveau2(e: ExerciceGrandsNombres, phase: PhaseGrandsNombres): AideAvecLatex {
  switch (phase) {
    case "logPuissance":
    case "logOperations": {
      const a = e.variante === "temps" ? 2 : e.variante === "chiffres" || e.variante === "premier-chiffre" ? e.a : 2;
      const n = e.variante === "temps" && e.sousCas === "duree" ? e.n : e.variante === "chiffres" || e.variante === "premier-chiffre" ? e.n : 0;
      return { texte: "Calcule le produit d'un seul coup à la calculatrice, sans arrondir le logarithme avant de multiplier :", latex: `${grouper(String(n), "\\,")}\\times\\log(${a})` };
    }
    case "logsDeux":
      if (e.variante !== "comparer") return { texte: "" };
      return { texte: "Calcule chaque produit d'un seul coup à la calculatrice, sans arrondi intermédiaire :", latex: `${e.n}\\times\\log(${e.a})\\qquad ${e.m}\\times\\log(${e.b})` };
    case "partieEntiere":
      return { texte: "Ne garde que la partie du logarithme obtenu à l'étape précédente qui est avant la virgule." };
    case "nombreChiffres":
      return { texte: "Compte les chiffres de la plus petite puissance de 10 de l'encadrement : 10² = 100 en a trois, 10³ = 1000 en a quatre." };
    case "memeExposant":
      if (e.variante !== "comparer") return { texte: "" };
      return { texte: `Écris chaque exposant comme un multiple de ${e.k} :`, latex: `${grouper(String(e.n), "\\,")}=${e.n / (e.k ?? 1)}\\times ${e.k}\\qquad ${grouper(String(e.m), "\\,")}=${e.m / (e.k ?? 1)}\\times ${e.k}` };
    case "verdict":
      return { texte: "" };
    case "scientifique":
      return { texte: "La mantisse s'obtient à la calculatrice à partir de la seule partie décimale f :", latex: "m=10^{f}" };
    case "premierChiffre":
      return { texte: "La puissance de 10 qui suit s'écrit avec E + 1 chiffres ; multiplier par m (entre 1 et 10) ne change pas ce nombre de chiffres :", latex: "10^{E}\\leq m\\times 10^{E}<10^{E+1}" };
    case "dureeSecondes":
    case "dureeAnnees":
      return phase === "dureeSecondes"
        ? { texte: "Écris T à partir de la partie entière E et de la partie décimale f de log(T) :", latex: "T=10^{f}\\times 10^{E}" }
        : { texte: "Divise la durée en secondes par ce nombre ; en logarithme, on soustrait :", latex: "\\log(T')=\\log(T)-\\log(31\\,536\\,000)" };
    case "operations":
      if (e.variante !== "temps") return { texte: "" };
      return { texte: "Multiplie par le nombre d'opérations effectuées en une seconde, puis écris le résultat avec une mantisse entre 1 et 10 :", latex: `N=10^{${e.p}}\\times\\ldots` };
    case "borne":
      return { texte: "log(2) est positif : divise les deux membres par log(2) sans changer le sens de l'inégalité :", latex: "n\\leq\\dfrac{\\log(N)}{\\log(2)}" };
    case "plusGrandN":
      return { texte: "Vérifie : pour ce n, le nombre d'opérations ne dépasse pas N, et pour l'entier suivant, il le dépasse :", latex: "2^{n}\\leq N<2^{n+1}" };
  }
}
