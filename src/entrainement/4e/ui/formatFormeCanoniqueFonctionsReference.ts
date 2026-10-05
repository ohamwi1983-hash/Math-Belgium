import type { ExerciceFormeCanoniqueFonctionReference, FamilleReference } from "../core/formeCanoniqueFonctionsReference.types";
import type { FonctionDouble, FonctionSimple } from "../moteur/verificationFormeCanoniqueFonctionsReference";
import { formatFractionIrreductible } from "./formatFraction";

/** Dénominateur borné assez large pour retrouver exactement un coefficient combiné du type
 * SOX·(EV/CV)·(CH/EH)^n (n jusqu'à 3 pour `cube`, CH/EH/EV/CV ∈ [1,5]) — jamais un décimal
 * arrondi/périodique affiché brut (même convention que tout le reste du projet, ex.
 * `formatFractionIrreductible` déjà utilisée pour xS/yS ailleurs). */
const DENOMINATEUR_MAX_COEFFICIENT = 700;

/** Rend un coefficient combiné (potentiellement fractionnaire, ex. `2/27`) en LaTeX — signe porté
 * devant `\frac{}{}`, jamais à l'intérieur du numérateur. */
function formatCoefficientLatex(valeur: number): string {
  const brut = formatFractionIrreductible(valeur, DENOMINATEUR_MAX_COEFFICIENT);
  if (!brut.includes("/")) return brut;
  const negatif = brut.startsWith("-");
  const [numerateur, denominateur] = (negatif ? brut.slice(1) : brut).split("/");
  return `${negatif ? "-" : ""}\\frac{${numerateur}}{${denominateur}}`;
}

/** `ax+b` — coefficient 1/-1 jamais explicite, terme constant omis s'il est nul, `x` nu si a=0
 * (dégénère alors en constante pure). `a`/`b` peuvent être des fractions (le coefficient de départ
 * de plusieurs familles est désormais dérivé directement de CH/EH/EV/CV, généralement non entier —
 * voir `construireFormeDepart`) : rendues en `\frac{}{}` exacte via `formatCoefficientLatex`,
 * jamais en décimal brut. */
function formatLineaire(a: number, b: number): string {
  const partieX = a === 0 ? "" : a === 1 ? "x" : a === -1 ? "-x" : `${formatCoefficientLatex(a)}x`;
  if (b === 0) return partieX === "" ? "0" : partieX;
  const signe = b > 0 ? "+" : "-";
  const partieB = `${signe} ${formatCoefficientLatex(Math.abs(b))}`;
  return partieX === "" ? `${formatCoefficientLatex(b)}` : `${partieX} ${partieB}`;
}

/** Enveloppe une expression déjà formatée (le "wrapper" non simplifié — `(a+bx)^3`, `\sqrt{ax+b}`,
 * `\sqrt[3]{ax+b}`, `|ax+b|`) avec le coefficient externe `K=SOX·(EV/CV)` et le résidu `Q=TV` —
 * affichés EXPLICITEMENT en clair, jamais quelque chose que l'élève doit redériver : ces 2 valeurs
 * ne peuvent pas être recomposées par la seule technique de simplification de ces 4 familles (voir
 * la justification algébrique complète dans `verificationFormeCanoniqueFonctionsReference.ts`,
 * section "Étape 1"), mais peuvent toujours être affichées en clair puisqu'elles multiplient/
 * s'ajoutent au résultat du wrapper de l'EXTÉRIEUR, jamais combinées à l'intérieur — donc jamais de
 * racine n-ième à calculer pour les y faire apparaître. `carre`/`inverse` n'utilisent jamais cette
 * fonction : leur technique (compléter le carré / diviser) recompose déjà K et Q nativement. */
function envelopperKQ(exercice: ExerciceFormeCanoniqueFonctionReference, wrapperLatex: string): string {
  const signeSox = exercice.sox ? -1 : 1;
  const k = signeSox * (exercice.ev / exercice.cv);
  const q = exercice.tv;
  const prefixe = k === 1 ? "" : k === -1 ? "-" : formatCoefficientLatex(k);
  return `f(x) = ${prefixe}${wrapperLatex}${formatResidu(q)}`;
}

/** La "forme de départ" non simplifiée (table section 1 de la spec), affichée aux étapes 0
 * (reconnaissance) et 1 (point de départ de la simplification) — jamais pré-simplifiée. Pour
 * `cube`/`racine_carree`/`racine_cubique`/`valeur_absolue`, enveloppée par `K·(...)+Q` (voir
 * `envelopperKQ`) — sans quoi la fonction finalement testée aux étapes suivantes (`K` et `Q`
 * inclus) n'aurait aucun rapport visible avec celle de cet écran (bug corrigé,
 * `prompt-bugpersistediagnosticapprofondi.md`). */
export function formatFormeDepartLatex(exercice: ExerciceFormeCanoniqueFonctionReference): string {
  const forme = exercice.formeDepart;
  switch (forme.type) {
    case "carre": {
      const termeA = forme.a === 1 ? "" : forme.a === -1 ? "-" : formatCoefficientLatex(forme.a);
      const termeB =
        forme.b === 0 ? "" : ` ${forme.b > 0 ? "+" : "-"} ${Math.abs(forme.b) === 1 ? "" : formatCoefficientLatex(Math.abs(forme.b))}x`;
      const termeC = forme.c === 0 ? "" : ` ${forme.c > 0 ? "+" : "-"} ${formatCoefficientLatex(Math.abs(forme.c))}`;
      return `f(x) = ${termeA}x^2${termeB}${termeC}`;
    }
    case "cube":
      // La table (section 1) note ce cas "(a+bx)^3" — `a` est ici la constante et `b` le
      // coefficient de x (seule famille qui inverse cet ordre par rapport aux 4 autres, où `a`
      // désigne toujours le coefficient de x — voir construireFormeDepart, générateurs/…) ;
      // formatLineaire(coeffDeX, constante) attend l'ordre inverse, d'où l'échange ici.
      return envelopperKQ(exercice, `(${formatLineaire(forme.b, forme.a)})^3`);
    case "racine_carree":
      return envelopperKQ(exercice, `\\sqrt{${formatLineaire(forme.a, forme.b)}}`);
    case "racine_cubique":
      return envelopperKQ(exercice, `\\sqrt[3]{${formatLineaire(forme.a, forme.b)}}`);
    case "inverse":
      return `f(x) = \\frac{${formatLineaire(forme.a, forme.b)}}{${formatLineaire(forme.c, forme.d)}}`;
    case "valeur_absolue":
      return envelopperKQ(exercice, `\\left|${formatLineaire(forme.a, forme.b)}\\right|`);
  }
}

/** `coef(x-p)` — coefficient 1/-1 jamais explicite, `x` nu si p=0, signe adapté. Brique partagée par
 * les formateurs de forme canonique ci-dessous. */
function formatBinomeCoef(coef: number, p: number, avecParentheses: boolean): string {
  const interieur = p === 0 ? "x" : p > 0 ? `x - ${p}` : `x + ${-p}`;
  // Un coefficient de 1 n'a jamais besoin de parenthèses (rien à grouper) — contrairement à -1 ou
  // à un coefficient numérique, où elles évitent une lecture ambiguë (ex. "-x-2" au lieu de
  // "-(x-2)").
  if (coef === 1) return interieur;
  const groupe = p === 0 ? interieur : avecParentheses ? `(${interieur})` : interieur;
  if (coef === -1) return `-${groupe}`;
  return `${formatCoefficientLatex(coef)}${p === 0 && !avecParentheses ? interieur : `(${interieur})`}`;
}

function formatResidu(q: number): string {
  if (q === 0) return "";
  return ` ${q > 0 ? "+" : "-"} ${Math.abs(q)}`;
}

/** `a(x-p)^2+q` / `a(x-p)^3+q` / `a|x-p|+q` / `\frac{a}{x-p}+q` selon la famille — un seul
 * coefficient combiné (voir verificationFormeCanoniqueFonctionsReference.ts pour la justification
 * algébrique de cette réduction à un seul coefficient pour ces 4 familles). */
export function formatFonctionSimpleLatex(
  famille: "carre" | "cube" | "valeur_absolue" | "inverse",
  fonction: FonctionSimple,
): string {
  const { a, p, q } = fonction;
  if (famille === "carre" || famille === "cube") {
    const exposant = famille === "carre" ? "2" : "3";
    const base = a === 1 ? "" : a === -1 ? "-" : formatCoefficientLatex(a);
    const groupe = p === 0 ? "x" : `(${p > 0 ? `x - ${p}` : `x + ${-p}`})`;
    return `f(x) = ${base}${groupe}^${exposant}${formatResidu(q)}`;
  }
  if (famille === "valeur_absolue") {
    const groupe = p === 0 ? "x" : p > 0 ? `x - ${p}` : `x + ${-p}`;
    const base = a === 1 ? "" : formatCoefficientLatex(a);
    return `f(x) = ${base}\\left|${groupe}\\right|${formatResidu(q)}`;
  }
  const groupe = p === 0 ? "x" : p > 0 ? `x - ${p}` : `x + ${-p}`;
  return `f(x) = \\frac{${formatCoefficientLatex(a)}}{${groupe}}${formatResidu(q)}`;
}

/** `outer·\sqrt{inner(x-p)}+q` / `outer·\sqrt[3]{inner(x-p)}+q` — coefficients externe et interne
 * séparés (jamais combinés, voir la justification algébrique dans le module de vérification). */
export function formatFonctionDoubleLatex(famille: "racine_carree" | "racine_cubique", fonction: FonctionDouble): string {
  const { outer, inner, p, q } = fonction;
  const argument = formatBinomeCoef(inner, p, true);
  const base = famille === "racine_carree" ? `\\sqrt{${argument}}` : `\\sqrt[3]{${argument}}`;
  const prefixe = outer === 1 ? "" : outer === -1 ? "-" : formatCoefficientLatex(outer);
  return `f(x) = ${prefixe}${base}${formatResidu(q)}`;
}

export function formatCibleLatex(famille: FamilleReference, cible: FonctionSimple | FonctionDouble): string {
  if (famille === "racine_carree" || famille === "racine_cubique") {
    return formatFonctionDoubleLatex(famille, cible as FonctionDouble);
  }
  return formatFonctionSimpleLatex(famille, cible as FonctionSimple);
}

// ---------------------------------------------------------------------------------------------
// Gabarit persistant des 4 écrans de transformation (EH/CH/SOY, TH, EV/CV/SOX, TV) —
// `prompt-gabaritvaleursnoncombinees.md`. Remplace l'affichage précédent (la forme canonique
// COMBINÉE — `formatCibleLatex`/`cibleFinale`, ex. `16|x-4|+1`) par le gabarit littéral
// `SOX·(EV/CV)·[base](SOY·(CH/EH)·(x-TH))+TV`, chaque paramètre inséré à sa place mais JAMAIS
// combiné à un autre — CH et EH, par exemple, ne sont jamais réduits en un seul rapport flottant
// avant affichage (contrairement à `coefficientInterneDouble`/`coefficientCompletSimple`,
// verificationFormeCanoniqueFonctionsReference.ts, qui restent les seules fonctions à calculer la
// forme combinée — utilisées pour la VÉRIFICATION et pour la forme attendue à l'étape 1, jamais
// pour ce gabarit). Exactement les 8 valeurs vraies de l'exercice (jamais recalculées ni
// masquées selon l'écran) : le gabarit affiché est donc rigoureusement identique sur les 4
// écrans, cohérent avec le correctif de cohérence déjà en place
// (`prompt-coherenceexerciceetcastrivial.md`/`prompt-bugpersistediagnosticapprofondi.md`).
// ---------------------------------------------------------------------------------------------

/** Rend `signe · (numérateur/dénominateur)` SANS jamais réduire numérateur et dénominateur en un
 * seul nombre — dénominateur omis si 1 (`EH`/`CV` neutre), numérateur omis si 1 ET dénominateur
 * omis (facteur entièrement neutre) ; un numérateur de 1 reste néanmoins affiché explicitement
 * dès que le dénominateur ne l'est pas (`\frac{1}{3}`, jamais une fraction sans numérateur). Le
 * signe se réduit à un simple `-` si le reste est neutre (jamais `-1·`), sinon précède directement
 * le corps numérique (`-4`, `-\frac{2}{3}`), jamais séparé par un `\cdot` de son propre facteur. */
function formatFacteurSigneEtRatio(signeNegatif: boolean, numerateur: number, denominateur: number): string {
  const corpsRatio = denominateur === 1 ? (numerateur === 1 ? "" : `${numerateur}`) : `\\frac{${numerateur}}{${denominateur}}`;
  return (signeNegatif ? "-" : "") + corpsRatio;
}

/** `SOY·(CH/EH)·(x-TH)` — jamais combiné en un seul coefficient (voir le docstring de section).
 * `x` nu si TH=0 (jamais `(x-0)`) ; parenthèses autour du binôme dès qu'un préfixe (signe et/ou
 * ratio CH/EH) précède, jamais sinon (`x - 4` reste nu, `4(x - 4)` est parenthésé). */
function formatArgumentGabarit(ch: number, eh: number, th: number, soy: boolean): string {
  const prefixe = formatFacteurSigneEtRatio(soy, ch, eh);
  const binomeNu = th === 0 ? "x" : th > 0 ? `x - ${th}` : `x + ${-th}`;
  if (prefixe === "") return binomeNu;
  return th === 0 ? `${prefixe}x` : `${prefixe}(${binomeNu})`;
}

/** `[base]` selon la famille, appliqué à l'argument déjà construit (jamais pré-simplifié) — `x`
 * nu reste sans parenthèses supplémentaires pour `carre`/`cube` (`x^2`, jamais `(x)^2`), tout
 * autre argument (avec préfixe et/ou décalage) en reçoit (`(x - 4)^2`, `(4(x - 4))^2`). */
function formatBaseGabarit(famille: FamilleReference, argument: string): string {
  const groupe = argument === "x" ? "x" : `(${argument})`;
  switch (famille) {
    case "carre":
      return `${groupe}^2`;
    case "cube":
      return `${groupe}^3`;
    case "racine_carree":
      return `\\sqrt{${argument}}`;
    case "racine_cubique":
      return `\\sqrt[3]{${argument}}`;
    case "inverse":
      return `\\frac{1}{${argument}}`;
    case "valeur_absolue":
      return `\\left|${argument}\\right|`;
  }
}

/** Les 8 champs géométriques dont dépend le gabarit — jamais `formeDepart` (non pertinent pour ce
 * rendu). `ExerciceFormeCanoniqueFonctionReference` reste structurellement assignable à ce type
 * (surplus de `formeDepart` toléré), donc tous les appelants existants qui passent `exercice`
 * directement continuent de fonctionner sans changement. */
export interface ParametresGabarit {
  famille: FamilleReference;
  th: number;
  tv: number;
  ch: number;
  eh: number;
  ev: number;
  cv: number;
  sox: boolean;
  soy: boolean;
}

/** Le gabarit complet `SOX·(EV/CV)·[base](SOY·(CH/EH)·(x-TH))+TV`, valeurs insérées mais jamais
 * combinées entre elles — voir le docstring de section pour la justification complète. `\cdot`
 * explicite entre le facteur externe et `[base](...)` dès que ce facteur externe n'est ni neutre ni
 * un simple signe (jamais de `\cdot` entre un signe seul et ce qui suit, ni entre le coefficient
 * interne et le binôme qu'il multiplie — juxtaposition directe, comme partout ailleurs dans le
 * projet). */
export function formatGabaritLatex(parametres: ParametresGabarit): string {
  const { famille, ch, eh, th, soy, ev, cv, sox, tv } = parametres;
  const argument = formatArgumentGabarit(ch, eh, th, soy);
  const base = formatBaseGabarit(famille, argument);
  const prefixeExterne = formatFacteurSigneEtRatio(sox, ev, cv);
  const corps = prefixeExterne === "" ? base : prefixeExterne === "-" ? `-${base}` : `${prefixeExterne}\\cdot ${base}`;
  return `f(x) = ${corps}${formatResidu(tv)}`;
}

// ---------------------------------------------------------------------------------------------
// Gabarit PARTIEL — `prompt-generaliserformatnoncombine.md`. Le même gabarit non combiné que
// ci-dessus, mais figé à l'état de progression atteint à la fin d'une étape donnée (paramètres pas
// encore confirmés forcés à leur valeur neutre) — jamais les vraies valeurs finales de l'exercice
// pour un paramètre pas encore abordé, exactement le même principe que `cibleEtape2`/`cibleEtape3`/
// `cibleEtape4` (verificationFormeCanoniqueFonctionsReference.ts), mais rendu en gabarit plutôt
// qu'en coefficient combiné. Utilisé par l'énoncé "à partir de f(x)=..." de chaque écran de
// transformation (jamais par les légendes du graphe, qui restent volontairement combinées — un
// pur repère visuel de couleur, pas une valeur dont l'élève doit déduire un curseur) et par la
// révélation "Fonction attendue" de l'étape correspondante après épuisement des tentatives.
// ---------------------------------------------------------------------------------------------

/** État atteint après confirmation de EH/CH/SOY (étape 2) — TH/EV/CV/SOX/TV encore neutres. Sert
 * d'énoncé "à partir de" sur l'écran TH (étape 3) et de révélation pour l'étape EH/CH/SOY. */
export function formatGabaritEtape2Latex(exercice: ExerciceFormeCanoniqueFonctionReference): string {
  return formatGabaritLatex({
    famille: exercice.famille,
    ch: exercice.ch,
    eh: exercice.eh,
    soy: exercice.soy,
    th: 0,
    ev: 1,
    cv: 1,
    sox: false,
    tv: 0,
  });
}

/** État atteint après confirmation de EH/CH/SOY et TH (étape 3) — EV/CV/SOX/TV encore neutres. Sert
 * d'énoncé "à partir de" sur l'écran EV/CV/SOX (étape 4) et de révélation pour l'étape TH. */
export function formatGabaritEtape3Latex(exercice: ExerciceFormeCanoniqueFonctionReference): string {
  return formatGabaritLatex({
    famille: exercice.famille,
    ch: exercice.ch,
    eh: exercice.eh,
    soy: exercice.soy,
    th: exercice.th,
    ev: 1,
    cv: 1,
    sox: false,
    tv: 0,
  });
}

/** État atteint après confirmation de EH/CH/SOY, TH et EV/CV/SOX (étape 4) — TV encore neutre. Sert
 * d'énoncé "à partir de" sur l'écran TV (étape 5) et de révélation pour l'étape EV/CV/SOX. */
export function formatGabaritEtape4Latex(exercice: ExerciceFormeCanoniqueFonctionReference): string {
  return formatGabaritLatex({
    famille: exercice.famille,
    ch: exercice.ch,
    eh: exercice.eh,
    soy: exercice.soy,
    th: exercice.th,
    ev: exercice.ev,
    cv: exercice.cv,
    sox: exercice.sox,
    tv: 0,
  });
}
