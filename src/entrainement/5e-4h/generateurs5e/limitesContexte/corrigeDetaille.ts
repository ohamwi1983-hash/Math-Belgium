import type { EtapeCorrection, FragmentConsigne, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, ligne, piege, resultat, utilise, verification } from "../../../export/corrigeTableau";
import type { ExerciceClubLoisirs, ExerciceEauSalee, ExerciceLimitesContexte, ExercicePopulation, ExercicePrixRevient } from "../../core5e/limitesContexte.types";
import { ordreComplet, type PhaseLimitesContexte } from "../../moteur5e/typesLimitesContexte";
import { formatReponseAttendueTexte, formatTermesDonneesLatex, nombreTexte } from "../../ui5e/formatLimitesContexte";
import { COURS_CONTEXTE, COURS_LIMITES, decL, egalOuApprox, estExact, finaliser, fracBrute, fracL, lim, nbT, par, pgcd, t, f } from "../../ui5e/corrigeLimites";

/**
 * Corrigé détaillé « comme au tableau » de 5gen23 (limites et asymptotes en contexte) — règle
 * `.claude/rules/feuilles-evaluations.md`. Une lettre par ÉCRAN (`ordreComplet` du moteur) :
 * - prix de revient : a = limite du coût unitaire (k/x → 0), b = interprétation (signe de l'écart à la
 *   limite), c = sens de l'asymptote verticale x = 0 (domaine réel) ;
 * - eau salée : a = C(t) = Q(t)/V(t), b = limite (division par t), c = interprétation (volume initial
 *   négligeable) ;
 * - club : a = valeurs réelles (f(0), f(x) puis × facteur), b = premier mois (équation, second degré,
 *   racine négative rejetée, entier suivant), c = asymptote oblique (la fraction tend vers 0),
 *   d = pente convertie ;
 * - population : a = division euclidienne du numérateur par x + p, b = croissance ou régression
 *   (f(0) comparé à la limite b), c = valeur en l'année demandée et comparaison au seuil.
 * Les interprétations (écrans à choix) ont pour « Résultat » la phrase correcte de l'écran
 * (`formatReponseAttendueTexte`). SANS `docx` : importé par l'adaptateur ET par `App5gen23.tsx`.
 */

const LETTRES = "abcd";

export function lettrePhaseLimitesContexte(exercice: ExerciceLimitesContexte, phase: PhaseLimitesContexte): string {
  return LETTRES[ordreComplet(exercice).indexOf(phase)] ?? "a";
}

/** Consigne d'étape pour le papier (les écrans à choix demandent une justification écrite). */
export function consigneEtapeLimitesContexte(exercice: ExerciceLimitesContexte, phase: PhaseLimitesContexte): FragmentConsigne[] {
  switch (exercice.famille) {
    case "prixRevient":
      if (phase === "asymptoteHorizontale") return [t("Calcule la limite du coût unitaire quand "), f("x"), t(" tend vers "), f("+\\infty"), t(".")];
      if (phase === "interpreter") return [t("Interprète ce résultat dans le contexte.")];
      return [t("L'asymptote verticale "), f("x=0"), t(" a-t-elle un sens dans ce contexte ? Justifie.")];
    case "eauSalee":
      if (phase === "construireC") return [t(`Construis la concentration ${exercice.contexte.quantitePhrase} à l'instant t, `), f("C(t)"), t(", à partir de "), f("V(t)"), t(" et "), f("Q(t)"), t(".")];
      if (phase === "limiteC") return [t("Calcule la limite de "), f("C(t)"), t(" quand "), f("t"), t(" tend vers "), f("+\\infty"), t(".")];
      return [t("Justifie que ce résultat était prévisible sans calcul.")];
    case "clubLoisirs":
      if (phase === "evaluer") return [t(`Calcule la valeur réelle (en ${exercice.contexte.unitePluriel}) à la création, puis après ${exercice.xEval} mois. Arrondis à l'unité.`)];
      if (phase === "inequation") return [t("Résous "), f(`f(x)\\geq ${exercice.k0}`), t(" : donne le plus petit nombre entier de mois pour lequel le seuil est atteint.")];
      if (phase === "asymptoteOblique") return [t("Donne l'équation de l'asymptote oblique de la courbe de f en "), f("+\\infty"), t(".")];
      return [t(`Interprète la pente de l'asymptote oblique comme une évolution réelle (en ${exercice.contexte.unitePluriel} par mois).`)];
    case "population":
      if (phase === "identification") return [t("Écris "), f("f(x)"), t(" sous la forme "), f("\\dfrac{a}{x+p}+b"), t(" (division euclidienne).")];
      if (phase === "interpreter") return [t(`Déduis-en si ${exercice.contexte.grandeurArticle} est en croissance ou en régression, et sa valeur limite.`)];
      return [t(`Évalue ${exercice.contexte.grandeurArticle} en ${exercice.anneeEval} (au centième) et compare-la au seuil de ${nombreTexte(exercice.seuil)} ${exercice.contexte.unitePourValeur}.`)];
  }
}

/** « 3x+8 » (a > 0, b quelconque). */
function affine(a: number, b: number): string {
  const ax = a === 1 ? "x" : `${a}x`;
  return b === 0 ? ax : `${ax}${b > 0 ? "+" : "-"}${Math.abs(b)}`;
}

// ============================================================================
// A — prix de revient.
// ============================================================================

function etapesPrixRevient(e: ExercicePrixRevient): EtapeCorrection[] {
  const { a, b, seuil } = e;
  const L = lim("+\\infty");
  const unite = e.contexte.unitePluriel;
  return [
    utilise("a", [t("Quand "), f("x\\to+\\infty"), t(", un terme "), f("\\dfrac{k}{x}"), t(` (k constant) tend vers 0 ; la limite d'une somme est la somme des limites ${COURS_LIMITES}.`)]),
    calcul("a", [
      ligne(`${L} C_u(x)=${L}\\left(${b}+\\dfrac{${a}}{x}\\right)`, "on remplace Cᵤ(x)"),
      ligne(`=${b}+${L}\\dfrac{${a}}{x}`, "limite d'une somme"),
      ligne(`=${b}+0`, [f(`\\frac{${a}}{x}\\to 0`), t(" quand x devient très grand")]),
      ligne(`=${b}`),
    ]),
    resultat("a", [f(`${L} C_u(x)=${b}`), t(` : la droite y = ${b} est asymptote horizontale.`)]),
    utilise("b", [t("On compare "), f("C_u(x)"), t(" à sa limite : le signe de l'écart dit si la courbe est au-dessus ou en dessous, et l'écart qui diminue dit dans quel sens elle évolue "), t(COURS_CONTEXTE), t(".")]),
    calcul("b", [
      ligne(`C_u(x)-${b}=\\dfrac{${a}}{x}`, "écart entre le coût unitaire et la limite"),
      ligne(`\\dfrac{${a}}{x}>0`, `pour x > 0 : le coût unitaire reste au-dessus de ${b} €`),
      ligne(`${L}\\dfrac{${a}}{x}=0`, "quand x grandit, l'écart diminue vers 0 : le coût unitaire diminue"),
    ]),
    resultat("b", [t(formatReponseAttendueTexte(e, "interpreter") ?? "")]),
    piege("b", [t(`Le coût unitaire s'approche de ${b} € sans jamais l'atteindre : l'écart `), f(`\\frac{${a}}{x}`), t(" n'est jamais nul.")]),
    utilise("c", [t("Une asymptote n'a de sens dans le contexte que si les valeurs de x proches de 0 appartiennent au domaine réel du problème "), t(COURS_CONTEXTE), t(".")]),
    calcul("c", [ligne(`x\\geq ${seuil}`, `nombre minimal accepté : ${seuil} ${unite}`), ligne(`0<${seuil}`, "x = 0 (et les valeurs proches de 0) sont hors du domaine réel")]),
    resultat("c", [t(formatReponseAttendueTexte(e, "vaSens") ?? "")]),
    piege("c", [t("Mathématiquement, x = 0 est une asymptote verticale de la courbe ; dans le contexte, ces valeurs n'existent pas.")]),
  ];
}

// ============================================================================
// B — eau salée.
// ============================================================================

function etapesEauSalee(e: ExerciceEauSalee): EtapeCorrection[] {
  const { v0, r, c } = e;
  const cr = c * r;
  const [V, Q] = formatTermesDonneesLatex(e);
  const rt = r === 1 ? "t" : `${r}t`;
  const crt = cr === 1 ? "t" : `${cr}t`;
  const Ct = `\\dfrac{${crt}}{${v0}+${rt}}`;
  const L = lim("+\\infty", "t");
  return [
    utilise("a", [t(`La concentration est la quantité ${e.contexte.quantitePhrase} divisée par le volume total, au même instant : `), f("C(t)=\\dfrac{Q(t)}{V(t)}"), t(` ${COURS_CONTEXTE}.`)]),
    calcul("a", [ligne("C(t)=\\dfrac{Q(t)}{V(t)}", "concentration = quantité / volume"), ligne(`=${Ct}`, [t("on remplace "), f(Q), t(" et "), f(V)])]),
    resultat("a", [f(`C(t)=${Ct}`)]),
    piege("a", [t("On divise par le volume total V(t), et non par le seul volume ajouté.")]),
    utilise("b", [t("Forme "), f("\\frac{\\infty}{\\infty}"), t(" : on divise le numérateur et le dénominateur par t, puis "), f("\\frac{k}{t}\\to 0"), t(` ${COURS_LIMITES}.`)]),
    calcul("b", [
      ligne(`C(t)=\\dfrac{${cr}}{\\frac{${v0}}{t}+${r}}`, "on divise numérateur et dénominateur par t"),
      ligne(`${L} C(t)=\\dfrac{${cr}}{0+${r}}`, [f(`\\frac{${v0}}{t}\\to 0`)]),
      ligne(`=${fracBrute(cr, r)}`),
      ligne(`=${c}`, "on simplifie"),
    ]),
    resultat("b", [f(`${L} C(t)=${c}`), t(` : la concentration tend vers ${c} g/L.`)]),
    utilise("c", [t("Pour t très grand, on compare le volume initial au volume ajouté : celui qui domine impose sa concentration "), t(COURS_CONTEXTE), t(".")]),
    calcul("c", [
      ligne(`${L}\\dfrac{${v0}}{${rt}}=0`, "le volume initial devient négligeable devant le volume ajouté"),
      ligne(`\\dfrac{${crt}}{${rt}}=${c}`, "concentration du seul liquide ajouté"),
    ]),
    resultat("c", [t(formatReponseAttendueTexte(e, "interpreter") ?? "")]),
  ];
}

// ============================================================================
// C — club de loisirs.
// ============================================================================

/** f(x) = ax + b − c/(x + d) en x entier, en fraction exacte n/den. */
function valeurClub(e: ExerciceClubLoisirs, x: number): { n: number; d: number } {
  const den = x + e.d;
  return { n: (e.a * x + e.b) * den - e.c, d: den };
}

function lignesValeurClub(e: ExerciceClubLoisirs, x: number): { lignes: LigneCalcul[]; valeur: number; arrondi: number; exact: boolean } {
  const { a, b, c, d, facteur } = e;
  const v = valeurClub(e, x);
  const g = pgcd(c, x + d);
  const partie = a * x + b;
  const lignes: LigneCalcul[] = [];
  lignes.push(ligne(`f(${x})=${x === 0 ? "" : `${a}\\cdot ${x}+`}${b}-\\dfrac{${c}}{${x === 0 ? d : `${x}+${d}`}}`, `on remplace x par ${x}`));
  lignes.push(ligne(`=${partie}-\\dfrac{${c}}{${x + d}}`, "on calcule"));
  if (g > 1) lignes.push(ligne(`=${partie}-${fracL(c, x + d)}`, "on simplifie la fraction"));
  lignes.push(ligne(`=${fracL(v.n, v.d)}`, v.n % v.d === 0 ? "on calcule" : "même dénominateur"));
  const valeur = v.n / v.d;
  const arrondi = Math.round(valeur * facteur);
  lignes.push(ligne(`f(${x})\\times ${facteur}=${fracL(v.n, v.d)}\\times ${facteur}`, `1 unité = ${facteur} ${e.contexte.unitePluriel}`));
  const exact = Number.isInteger(Math.round(valeur * facteur * 1e9) / 1e9);
  lignes.push(ligne(exact ? `=${arrondi}` : `\\approx ${arrondi}`, exact ? undefined : "arrondi à l'unité"));
  return { lignes, valeur, arrondi, exact };
}

function etapesClub(e: ExerciceClubLoisirs): EtapeCorrection[] {
  const { a, b, c, d, k0, facteur, xEval, moisAttendu } = e;
  const unite = e.contexte.unitePluriel;
  const v0 = lignesValeurClub(e, 0);
  const vx = lignesValeurClub(e, xEval);
  const B0 = b - k0;
  // (ax + B0)(x + d) − c = 0  ⟺  A x² + B x + C = 0
  const A = a;
  const B = a * d + B0;
  const C = B0 * d - c;
  const delta = B * B - 4 * A * C;
  const racine = Math.sqrt(delta);
  const carre = Number.isInteger(racine);
  const x1 = (-B + racine) / (2 * A);
  const x2 = (-B - racine) / (2 * A);
  const affB0 = B0 === 0 ? `${a}x` : affine(a, B0);
  const trin = `${a === 1 ? "" : a}x^{2}${B === 0 ? "" : B > 0 ? `+${B === 1 ? "" : B}x` : `-${B === -1 ? "" : -B}x`}${C === 0 ? "" : C > 0 ? `+${C}` : `${C}`}`;
  const relX1 = carre && estExact(x1, 4) ? `=${fracL(-B + racine, 2 * A)}` : `\\approx ${decL(x1, 2)}`;
  const relX2 = carre && estExact(x2, 4) ? `=${fracL(-B - racine, 2 * A)}` : `\\approx ${decL(x2, 2)}`;
  const fracRes = `\\dfrac{${c}}{x+${d}}`;
  return [
    utilise("a", [t("On calcule "), f("f(x)"), t(" dans l'échelle du modèle, puis on multiplie par le facteur de conversion "), t(COURS_CONTEXTE), t(".")]),
    calcul("a", v0.lignes, [t("À la création ("), f("x=0"), t(") :")], "Création"),
    calcul("a", vx.lignes, [t(`Après ${xEval} mois (`), f(`x=${xEval}`), t(") :")], `Après ${xEval} mois`),
    resultat("a", [t(`${v0.exact ? "" : "Environ "}${v0.arrondi} ${unite} à la création et ${vx.exact ? "" : "environ "}${vx.arrondi} ${unite} après ${xEval} mois.`.replace(/^(\d)/, "$1"))]),
    utilise("b", [t("f est croissante : on cherche quand f atteint le seuil ("), f(`f(x)=${k0}`), t("), on multiplie par "), f(`x+${d}>0`), t(", on résout l'équation du second degré, on garde la solution positive puis le premier entier qui la dépasse "), t(COURS_CONTEXTE), t(".")]),
    calcul("b", [
      ligne(`f(x)=${k0}`, "le seuil est atteint"),
      ligne(`${affine(a, b)}-\\dfrac{${c}}{x+${d}}=${k0}`, "on remplace f(x)"),
      ligne(`${affB0}-\\dfrac{${c}}{x+${d}}=0`, `on retire ${k0}`),
      ligne(`(${affB0})(x+${d})-${c}=0`, [t("on multiplie par "), f(`x+${d}>0`)]),
      ligne(`${trin}=0`, "on développe et on réduit"),
      ligne(`\\Delta=${par(B)}^{2}-4\\cdot ${par(A)}\\cdot ${par(C)}`, "discriminant"),
      ligne(`=${delta}`),
      ligne(`x_1=\\dfrac{${-B}+\\sqrt{${delta}}}{${2 * A}}`, "racine positive"),
      ligne(relX1),
      ligne(`x_2=\\dfrac{${-B}-\\sqrt{${delta}}}{${2 * A}}`, "racine négative : hors du domaine (x ≥ 0), rejetée"),
      ligne(relX2),
      ligne(`x=${moisAttendu}`, [t("premier entier supérieur ou égal à "), f(`x_1`), t(" : f est croissante")]),
    ]),
    resultat("b", [t(`Le seuil de ${k0 * facteur} ${unite} est atteint pour la première fois après ${moisAttendu} mois.`)]),
    verification("b", [t("De part et d'autre : "), f(`f(${moisAttendu - 1})${valeurClub(e, moisAttendu - 1).n / valeurClub(e, moisAttendu - 1).d < k0 ? "<" : "\\geq"}${k0}`), t(" et "), f(`f(${moisAttendu})\\geq ${k0}`), t(".")]),
    piege("b", [t("On prend le premier nombre entier de mois pour lequel le seuil est atteint (on arrondit vers le haut), pas l'entier le plus proche.")]),
    utilise("c", [t("La droite "), f("y=ax+b"), t(" est asymptote oblique en "), f("+\\infty"), t(" si "), f("f(x)-(ax+b)"), t(` tend vers 0 ${COURS_LIMITES}.`)]),
    calcul("c", [
      ligne(`f(x)-(${affine(a, b)})=-${fracRes}`, "on retire la partie affine"),
      ligne(`${lim("+\\infty")}\\left(-${fracRes}\\right)=0`, "numérateur constant, dénominateur → +∞"),
    ]),
    resultat("c", [f(`y=${affine(a, b)}`)]),
    utilise("d", [t("La pente a de l'asymptote est l'augmentation de f par mois, à long terme, dans l'échelle du modèle ; on la convertit avec le facteur "), t(COURS_CONTEXTE), t(".")]),
    calcul("d", [ligne(`a=${a}`, "pente de l'asymptote oblique"), ligne(`${a}\\times ${facteur}=${a * facteur}`, `1 unité = ${facteur} ${unite}`)]),
    resultat("d", [t(`À long terme, ${e.contexte.grandeurArticle} augmente d'environ ${a * facteur} ${unite} par mois.`)]),
  ];
}

// ============================================================================
// D — population.
// ============================================================================

function etapesPopulation(e: ExercicePopulation): EtapeCorrection[] {
  const { a, b, p, anneeRef, anneeEval, seuil } = e;
  const [fLatex] = formatTermesDonneesLatex(e);
  const fx = fLatex.replace(/^f\(x\)=/, "");
  const constante = a + b * p;
  const x = anneeEval - anneeRef;
  const valeur = b + a / (x + p);
  const exacte = estExact(valeur, 2);
  const g = pgcd(a, p);
  const unite = e.contexte.unitePourValeur;
  const bTxt = nbT(b);
  return [
    utilise("a", [t("Division euclidienne du numérateur par "), f(`x+${p}`), t(" : on écrit le numérateur comme un multiple de "), f(`x+${p}`), t(" plus un reste constant "), t(COURS_CONTEXTE), t(".")]),
    calcul("a", [
      ligne(`f(x)=${fx}`, "modèle de l'énoncé"),
      ligne(`=\\dfrac{${b}(x+${p})${a < 0 ? "-" : "+"}${Math.abs(a)}}{x+${p}}`, [f(`${b}(x+${p})=${b === 1 ? "" : b}x+${b * p}`), t(" et "), f(`${constante}-${par(b * p)}=${a}`)]),
      ligne(`=${b}${a < 0 ? "-" : "+"}\\dfrac{${Math.abs(a)}}{x+${p}}`, "on sépare la fraction"),
    ]),
    resultat("a", [f(`a=${a}`), t(" et "), f(`b=${b}`), t(" : "), f(`f(x)=\\dfrac{${a}}{x+${p}}+${b}`), t(".")]),
    utilise("b", [t("La limite en "), f("+\\infty"), t(" est b (la fraction tend vers 0) ; on compare la valeur de départ "), f("f(0)"), t(` à cette limite ${COURS_LIMITES}.`)]),
    calcul("b", [
      ligne(`${lim("+\\infty")} f(x)=${b}`, [f(`${a < 0 ? "-" : ""}\\frac{${Math.abs(a)}}{x+${p}}\\to 0`)]),
      ligne(`f(0)-${b}=${fracBrute(a, p)}`, "écart entre le départ et la limite"),
      ...(g > 1 ? [ligne(`=${fracL(a, p)}`, "on simplifie")] : []),
      ligne(`${fracL(a, p)}${a > 0 ? ">" : "<"}0`, a > 0 ? `départ au-dessus de la limite : la grandeur descend vers ${bTxt}` : `départ en dessous de la limite : la grandeur monte vers ${bTxt}`),
    ]),
    resultat("b", [t(formatReponseAttendueTexte(e, "interpreter") ?? "")]),
    piege("b", [t(`La grandeur s'approche de ${bTxt} ${unite} sans jamais l'atteindre ni la dépasser : l'écart `), f(`\\frac{${a}}{x+${p}}`), t(" garde son signe pour x ≥ 0.")]),
    utilise("c", [t("x = année demandée − année de référence ; on évalue f(x), on arrondit au centième puis on compare au seuil "), t(COURS_CONTEXTE), t(".")]),
    calcul("c", [
      ligne(`x=${anneeEval}-${anneeRef}`, "années écoulées"),
      ligne(`=${x}`),
      ligne(`f(${x})=${b}${a < 0 ? "-" : "+"}\\dfrac{${Math.abs(a)}}{${x}+${p}}`, `on remplace x par ${x}`),
      ligne(`=${b}${a < 0 ? "-" : "+"}\\dfrac{${Math.abs(a)}}{${x + p}}`),
      ligne(egalOuApprox(valeur, 2), exacte ? undefined : "arrondi au centième"),
      ligne(`${decL(valeur, 2)}${valeur > seuil ? ">" : "<"}${decL(seuil, 2)}`, valeur > seuil ? "au-dessus du seuil" : "en dessous du seuil"),
    ]),
    resultat("c", [f(`f(${x})${exacte ? "=" : "\\approx "}${decL(valeur, 2)}`), t(valeur > seuil ? ` : supérieure au seuil de ${nombreTexte(seuil)} ${unite}.` : ` : inférieure au seuil de ${nombreTexte(seuil)} ${unite}.`)]),
    piege("c", [t("Comparer la limite b au seuil ne suffit pas : il faut calculer f(x) en l'année demandée.")]),
  ];
}

export function correctionDetailleeLimitesContexte(exercice: ExerciceLimitesContexte): EtapeCorrection[] {
  switch (exercice.famille) {
    case "prixRevient":
      return finaliser(etapesPrixRevient(exercice));
    case "eauSalee":
      return finaliser(etapesEauSalee(exercice));
    case "clubLoisirs":
      return finaliser(etapesClub(exercice));
    case "population":
      return finaliser(etapesPopulation(exercice));
  }
}
