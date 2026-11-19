import type { EtapeCorrection, FragmentConsigne, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import type { ExerciceIntegraleGraphique, Morceau } from "../../core6e/integraleGraphique.types";
import { abscissesAttendues, aireTotale, integraleMorceau, integraleTotale, intervallesSigne, signeMorceau, somme, valeurAbsolue, valeurDonnee, valeurEn } from "../../moteur6e/verificationIntegraleGraphique";
import type { ValeurExacte } from "../../moteur6e/verificationIntegraleGraphique";
import { bornes, bornesDonnee, bornesInconnue, bornesInversees, calculAireLatex, exactDansSomme, exactLatex, formatReponseAttenduePhaseLatex, integraleLatex, intervalleLatex, nomFigure, positionFigure } from "../../ui6e/formatIntegraleGraphique";
import { figureIntegraleGraphiqueSvg } from "../../ui6e/figureIntegraleGraphique";
import { COURS_INTEGRALES, integraleTexte, listeFormules, moinsTexte, sommeTermes } from "../../ui6e/corrigeIntegrales2";

/**
 * Corrigé détaillé « comme au tableau » de `6gen77` (l'intégrale lue sur un graphique) — règle
 * `.claude/rules/feuilles-evaluations.md`. Trois étapes = trois écrans : `calcul` (découpe, intégrale
 * de chaque morceau, somme), `aireIntegrale` (changements de signe, intégrale par intervalle,
 * intégrale ET aire), `proprietes` (lecture, Chasles, bornes inversées). Valeurs tirées des
 * fonctions de l'écran (`formatIntegraleGraphique.ts`, `verificationIntegraleGraphique.ts`) ;
 * partagé par l'adaptateur papier et l'appli.
 */

type E = ExerciceIntegraleGraphique;
type Proprietes = Extract<E, { variante: "proprietes" }>;
const t = texte;
const f = latex;

// ============================================================================
// Lectures sur la figure.
// ============================================================================

/** Dimensions lues d'une figure (justification d'une ligne de calcul). */
function dimensions(m: Morceau): string {
  const pos = positionFigure(m);
  if (m.type === "demiDisque") return `demi-disque de rayon ${m.r} ${pos}`;
  if (m.type === "quartDisque") return `quart de disque de rayon ${m.r} ${pos}`;
  const w = m.x1 - m.x0;
  const h0 = Math.abs(m.y0);
  const h1 = Math.abs(m.y1);
  if (h0 === h1) return `rectangle ${w} × ${h0} ${pos}`;
  if (h0 === 0 || h1 === 0) return `triangle ${pos} : base ${w}, hauteur ${Math.max(h0, h1)}`;
  return `trapèze ${pos} : bases ${Math.max(h0, h1)} et ${Math.min(h0, h1)}, hauteur ${w}`;
}

/** Formule d'aire d'une figure, sans sa valeur (`\dfrac{3\times 2}{2}`). */
function formuleAire(m: Morceau): string {
  return calculAireLatex(m).replace(/=[^=]*$/, "");
}

/** Valeur absolue (aire) d'un morceau. */
function aireMorceau(m: Morceau): ValeurExacte {
  return valeurAbsolue(integraleMorceau(m));
}

/** Intégrale d'un morceau : `∫ = ±(formule)`, puis `= valeur` (la justification dit ce qu'on lit). */
function lignesMorceau(m: Morceau): LigneCalcul[] {
  const formule = formuleAire(m);
  const negatif = signeMorceau(m) < 0;
  const v = integraleMorceau(m);
  const lignes = [ligne(`${integraleLatex(m.x0, m.x1)}=${negatif ? "-" : ""}${formule}`, negatif ? `${dimensions(m)}, aire comptée négativement` : dimensions(m))];
  if (exactLatex(v) !== `${negatif ? "-" : ""}${formule}`) lignes.push(ligne(`=${exactLatex(v)}`));
  return lignes;
}

/** Pourquoi on coupe en x = c (entre les morceaux i − 1 et i). */
function raisonCoupe(e: E, i: number): string {
  const p = e.morceaux[i - 1]!;
  const m = e.morceaux[i]!;
  const y = valeurEn(e.morceaux, m.x0);
  const pt = `(${moinsTexte(m.x0)} ; ${moinsTexte(Math.round(y * 1000) / 1000)})`;
  if (signeMorceau(p) !== signeMorceau(m)) return `la courbe traverse l'axe des abscisses en ${pt}`;
  if (p.type !== "segment" || m.type !== "segment") return `${p.type !== "segment" ? "fin" : "début"} d'un arc de cercle en ${pt}`;
  return `sommet ${pt} : la courbe change de direction`;
}

// ============================================================================
// Sommes de valeurs exactes.
// ============================================================================

/** `= v₁ + v₂ + …`, puis les nombres et les multiples de π regroupés, puis le total. */
function lignesSomme(valeurs: ValeurExacte[], justification: string): LigneCalcul[] {
  const total = somme(valeurs);
  const lignes: LigneCalcul[] = [];
  const brut = valeurs.map(exactDansSomme).join("+");
  lignes.push(ligne(`=${brut}`, justification));
  const nombres = valeurs.filter((v) => v.q4 !== 0).map((v) => exactLatex({ q4: v.q4, p4: 0 }));
  const pis = valeurs.filter((v) => v.p4 !== 0).map((v) => exactLatex({ q4: 0, p4: v.p4 }));
  const regroupe = sommeTermes([...nombres, ...pis]);
  const final = exactLatex(total);
  if (regroupe !== brut && regroupe !== final && valeurs.length > 1) lignes.push(ligne(`=${regroupe}`, nombres.length > 0 && pis.length > 0 ? "on regroupe les nombres, puis les multiples de π" : "on retire les parenthèses"));
  if (final !== brut || lignes.length > 1) lignes.push(ligne(`=${final}`));
  return lignes;
}

/** Relation de Chasles écrite avec les intégrales des sous-intervalles (style texte). */
function chasles(gauche: string, intervalles: [number, number][]): LigneCalcul {
  return ligne(`${gauche}=${intervalles.map(([u, v]) => integraleTexte(u, v)).join("+")}`, "relation de Chasles");
}

// ============================================================================
// Variante « calcul ».
// ============================================================================

function etapesCalcul(e: E): EtapeCorrection[] {
  const { a, b } = bornes(e);
  const coupes = abscissesAttendues(e);
  const zeroTraverse = e.morceaux.slice(1).some((m, i) => {
    const p = e.morceaux[i]!;
    return m.type === "segment" && p.type === "segment" && m.y0 === 0 && Math.abs((m.y1 - m.y0) / (m.x1 - m.x0) - (p.y1 - p.y0) / (p.x1 - p.x0)) < 1e-9;
  });
  const valeurs = e.morceaux.map(integraleMorceau);
  const total = integraleTotale(e);
  return [
    utilise("a", [t(`On coupe à chaque sommet de la courbe (changement de direction, début ou fin d'un arc de cercle) et là où elle traverse l'axe des abscisses : chaque morceau est alors une figure simple d'un seul signe ${COURS_INTEGRALES}.`)]),
    calcul(
      "a",
      e.morceaux.slice(1).map((m, k) => ligne(`x=${m.x0}`, raisonCoupe(e, k + 1))),
      [t("On parcourt la courbe de gauche à droite :")],
    ),
    resultat("a", [...listeFormules(coupes.map((x) => `x=${x}`)), t(`, d'où ${e.morceaux.length} morceaux : `), ...listeFormules(e.morceaux.map((m) => intervalleLatex(m.x0, m.x1))), t(".")]),
    ...(zeroTraverse ? [piege("a", [t("Oublier de couper là où la courbe traverse l'axe en ligne droite (ce n'est pas un coin) : un morceau « à cheval » sur l'axe mélangerait une partie positive et une partie négative.")])] : []),
    utilise("b", methodeAires(e.morceaux)),
    calcul("b", e.morceaux.flatMap(lignesMorceau), [t("Figure par figure (une case du quadrillage mesure une unité) :")]),
    { ...resultat("b", listeFormules(formatReponseAttenduePhaseLatex(e, "ecran2"))), figureHtml: figureIntegraleGraphiqueSvg(e, true) },
    piege("b", piegeDisqueOuSigne(e.morceaux)),
    utilise("c", [t(`Additivité (relation de Chasles) : l'intégrale sur `), f(intervalleLatex(a, b)), t(` est la somme des intégrales des morceaux, chacune avec son signe ${COURS_INTEGRALES}.`)]),
    calcul("c", [
      chasles(
        integraleLatex(a, b),
        e.morceaux.map((m) => [m.x0, m.x1]),
      ),
      ...lignesSomme(valeurs, "valeurs de l'étape 2"),
    ]),
    resultat("c", [f(`${integraleLatex(a, b)}=${exactLatex(total)}`)]),
    piege("c", [t("Additionner les aires sans leur signe donne "), f(exactLatex(aireTotale(e))), t(" : c'est l'aire de la région, pas l'intégrale.")]),
  ];
}

function methodeAires(morceaux: Morceau[]): FragmentConsigne[] {
  const formules: string[] = [];
  const ajouter = (x: string) => {
    if (!formules.includes(x)) formules.push(x);
  };
  for (const m of morceaux) {
    const n = nomFigure(m);
    if (n === "un rectangle") ajouter("\\mathcal{A}_{\\text{rectangle}}=L\\times \\ell");
    else if (n === "un triangle") ajouter("\\mathcal{A}_{\\text{triangle}}=\\dfrac{b\\times h}{2}");
    else if (n === "un trapèze") ajouter("\\mathcal{A}_{\\text{trapèze}}=\\dfrac{(B+b)\\times h}{2}");
    else if (n === "un demi-disque") ajouter("\\mathcal{A}_{\\text{demi-disque}}=\\dfrac{\\pi r^2}{2}");
    else ajouter("\\mathcal{A}_{\\text{quart de disque}}=\\dfrac{\\pi r^2}{4}");
  }
  return [
    t(`Sur un intervalle où f garde un signe constant, l'intégrale vaut l'aire de la région entre la courbe et l'axe, comptée positivement au-dessus de l'axe et négativement en dessous ${COURS_INTEGRALES}. Aires utiles : `),
    ...listeFormules(formules),
    t("."),
  ];
}

function piegeDisqueOuSigne(morceaux: Morceau[]): FragmentConsigne[] {
  const disque = morceaux.find((m) => m.type !== "segment");
  if (disque) {
    return disque.type === "demiDisque"
      ? [t("Compter le demi-disque comme un disque entier ("), f(`\\pi\\times ${disque.r}^2`), t(" au lieu de "), f(`\\dfrac{\\pi\\times ${disque.r}^2}{2}`), t(").")]
      : [t("Compter le quart de disque comme un demi-disque ("), f(`\\dfrac{\\pi\\times ${disque.r}^2}{2}`), t(" au lieu de "), f(`\\dfrac{\\pi\\times ${disque.r}^2}{4}`), t(").")];
  }
  return [t("Oublier le signe moins d'un morceau situé sous l'axe : son intégrale est négative.")];
}

// ============================================================================
// Variante « aire ou intégrale ».
// ============================================================================

/** Intégrale sur un intervalle de signe constant formé de plusieurs figures. */
function lignesIntervalle(i: ReturnType<typeof intervallesSigne>[number]): LigneCalcul[] {
  if (i.morceaux.length === 1) return lignesMorceau(i.morceaux[0]!);
  const negatif = i.signe < 0;
  const formules = i.morceaux.map(formuleAire).join("+");
  const aires = i.morceaux.map((m) => exactLatex(aireMorceau(m))).join("+");
  const abs = exactLatex(valeurAbsolue(i.valeur));
  const enveloppe = (x: string) => (negatif ? `-(${x})` : x);
  const lignes: LigneCalcul[] = [ligne(`${integraleLatex(i.x0, i.x1)}=${enveloppe(formules)}`, `${i.morceaux.map(dimensions).join(" ; ")}${negatif ? " : aires comptées négativement" : ""}`)];
  if (aires !== formules) lignes.push(ligne(`=${enveloppe(aires)}`));
  if (negatif) {
    const compose = /[+-]/.test(abs);
    const cumul = `-${compose ? `(${abs})` : abs}`;
    if (cumul !== `-(${aires})`) lignes.push(ligne(`=${cumul}`));
    if (exactLatex(i.valeur) !== cumul) lignes.push(ligne(`=${exactLatex(i.valeur)}`));
  } else if (abs !== aires) lignes.push(ligne(`=${abs}`));
  return lignes;
}

function etapesAireIntegrale(e: E): EtapeCorrection[] {
  const { a, b } = bornes(e);
  const intervalles = intervallesSigne(e);
  const zeros = abscissesAttendues(e);
  const total = integraleTotale(e);
  const aire = aireTotale(e);
  const valeurs = intervalles.map((i) => i.valeur);
  const lectures: LigneCalcul[] = [];
  intervalles.forEach((i, k) => {
    if (k > 0) lectures.push(ligne(`f(${i.x0})=0`, `la courbe traverse l'axe en x = ${moinsTexte(i.x0)} : f passe de ${intervalles[k - 1]!.signe > 0 ? "+ à −" : "− à +"}`));
    lectures.push(ligne(`x\\in${intervalleLatex(i.x0, i.x1)}`, i.signe > 0 ? "courbe au-dessus de l'axe : f ≥ 0" : "courbe sous l'axe : f ≤ 0"));
  });
  return [
    utilise("a", [t(`f change de signe là où sa courbe TRAVERSE l'axe des abscisses (elle passe d'au-dessus à en dessous, ou l'inverse) ${COURS_INTEGRALES}.`)]),
    calcul("a", lectures, [t("On lit le signe de f de gauche à droite :")]),
    resultat("a", [t(zeros.length === 1 ? "Un changement de signe : " : `${zeros.length} changements de signe : `), ...listeFormules(zeros.map((x) => `x=${x}`)), t(".")]),
    utilise("b", methodeAires(e.morceaux)),
    calcul("b", intervalles.flatMap(lignesIntervalle), [t("Intervalle par intervalle (une case du quadrillage mesure une unité) :")]),
    { ...resultat("b", listeFormules(formatReponseAttenduePhaseLatex(e, "ecran2"))), figureHtml: figureIntegraleGraphiqueSvg(e, true) },
    piege("b", piegeDisqueOuSigne(e.morceaux)),
    utilise("c", [
      t("L'intégrale additionne les intégrales signées des intervalles (relation de Chasles) ; l'aire additionne leurs valeurs absolues, car une aire est toujours positive "),
      t(`${COURS_INTEGRALES}.`),
    ]),
    calcul("c", [chasles(integraleLatex(a, b), intervalles.map((i) => [i.x0, i.x1])), ...lignesSomme(valeurs, "valeurs de l'étape 2")], [], "Intégrale"),
    calcul("c", [ligne(`\\mathcal{A}=${intervalles.map((i) => `\\left|${exactLatex(i.valeur)}\\right|`).join("+")}`, "somme des valeurs absolues"), ...lignesSomme(valeurs.map(valeurAbsolue), "valeurs absolues")], [], "Aire"),
    resultat("c", [f(`${integraleLatex(a, b)}=${exactLatex(total)}`), t(" et "), f(`\\mathcal{A}=${exactLatex(aire)}`), t(" u.a.")]),
    verification("c", [t("Les parties sous l'axe se retranchent dans l'intégrale et s'ajoutent dans l'aire : "), f(`\\mathcal{A}>\\left|${exactLatex(total)}\\right|`), t(".")]),
    piege("c", [t("Donner l'intégrale comme aire (ou l'inverse) : une aire est toujours positive, on additionne les valeurs absolues des intégrales de chaque intervalle.")]),
  ];
}

// ============================================================================
// Variante « propriétés ».
// ============================================================================

function etapesProprietes(e: Proprietes): EtapeCorrection[] {
  const [g, d] = bornesInconnue(e);
  const [gd, dd] = bornesDonnee(e);
  const [hi, lo] = bornesInversees(e);
  const lu = integraleTotale(e);
  const donnee = valeurDonnee(e);
  const inconnue: ValeurExacte = { q4: 4 * e.inconnue, p4: 0 };
  const valeurs = e.morceaux.map(integraleMorceau);
  const lecture: LigneCalcul[] = e.morceaux.flatMap(lignesMorceau);
  if (e.morceaux.length > 1) lecture.push(chasles(integraleLatex(e.c, e.d), e.morceaux.map((m) => [m.x0, m.x1])), ...lignesSomme(valeurs, "valeurs ci-dessus"));
  const somme2 = e.cote === "gauche" ? [integraleTexte(g, d), integraleTexte(e.c, e.d)] : [integraleTexte(e.c, e.d), integraleTexte(g, d)];
  const D = exactLatex(donnee);
  const L = exactDansSomme(lu);
  const avecInconnue = e.cote === "gauche" ? `${integraleTexte(g, d)}+${L}` : `${L}+${integraleTexte(g, d)}`;
  const inc = exactLatex(inconnue);
  return [
    utilise("a", methodeAires(e.morceaux)),
    calcul("a", lecture, [t("Sur la partie tracée, figure par figure :")]),
    { ...resultat("a", [f(`${integraleLatex(e.c, e.d)}=${exactLatex(lu)}`)]), figureHtml: figureIntegraleGraphiqueSvg(e, true) },
    piege("a", piegeDisqueOuSigne(e.morceaux)),
    utilise("b", [t("Additivité (relation de Chasles) : pour "), f(`${Math.min(gd, dd)}\\le c\\le ${Math.max(gd, dd)}`), t(", "), f(`\\int_{${gd}}^{${dd}} f(x)\\,dx=\\int_{${gd}}^{c} f(x)\\,dx+\\int_{c}^{${dd}} f(x)\\,dx`), t(` ${COURS_INTEGRALES}.`)]),
    calcul("b", [
      ligne(`${integraleLatex(gd, dd)}=${somme2.join("+")}`, `relation de Chasles en x = ${moinsTexte(e.cote === "gauche" ? e.c : e.d)}`),
      ligne(`${D}=${avecInconnue}`, "valeur donnée et valeur lue à l'étape 1"),
      ligne(`${integraleTexte(g, d)}=${D}-${L}`, "on isole l'intégrale inconnue"),
      ligne(`=${inc}`),
    ]),
    resultat("b", [f(`${integraleLatex(g, d)}=${inc}`)]),
    verification("b", [t("On recompose l'intégrale donnée :")], [ligne(`${e.cote === "gauche" ? `${inc.startsWith("-") ? `(${inc})` : inc}+${L}` : `${L}+${inc.startsWith("-") ? `(${inc})` : inc}`}=${D}`, "c'est bien la valeur donnée ✓")]),
    piege("b", [t("Ajouter l'intégrale lue au lieu de la retrancher, ou se tromper de sous-intervalle : écris d'abord la relation de Chasles avec les bornes, puis isole l'inconnue.")]),
    utilise("c", [t("Échanger les bornes d'une intégrale change son signe : "), f("\\int_b^a f(x)\\,dx=-\\int_a^b f(x)\\,dx"), t(` ${COURS_INTEGRALES}.`)]),
    calcul("c", [
      ligne(`${integraleLatex(hi, lo)}=-${integraleTexte(lo, hi)}`, "bornes échangées"),
      ligne(`=-${inc.startsWith("-") ? `(${inc})` : inc}`, "valeur de l'étape 2"),
      ...(e.inconnue < 0 ? [ligne(`=${exactLatex({ q4: -inconnue.q4, p4: 0 })}`)] : []),
    ]),
    resultat("c", [f(`${integraleLatex(hi, lo)}=${exactLatex({ q4: -inconnue.q4, p4: 0 })}`)]),
    piege("c", [t("Garder le même signe : la borne du haut ("), f(`${lo}`), t(") est plus petite que celle du bas, l'intégrale change de signe.")]),
  ];
}

export function correctionDetailleeIntegraleGraphique(e: E): EtapeCorrection[] {
  if (e.variante === "calcul") return etapesCalcul(e);
  if (e.variante === "aireIntegrale") return etapesAireIntegrale(e);
  return etapesProprietes(e);
}
