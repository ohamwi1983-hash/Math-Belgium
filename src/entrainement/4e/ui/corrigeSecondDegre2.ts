import type { Categorie, Enonce, Exercice } from "../core/generateur.types";
import type { Symbole } from "../core/inequation.types";
import type { EtapeCorrection, FragmentConsigne, LigneCalcul } from "../../export/genererFeuilleExercices";
import { calcul, latex, ligne, resultat, texte, utilise, verification } from "../../export/corrigeTableau";
import { formatFacteurRacine, formatMembreGauche } from "./formatEquation";
import { mono, nombreTexte, q, qp } from "./corrigeChapitre3";
import { libelleCategorie } from "./categorieLabels";
import { facteurCommun } from "../moteur/simplificationEquation";

/**
 * Briques des corrigés détaillés « comme au tableau » du chapitre 2 de 4e (« Équations et inéquations
 * du second degré »), seconde moitié : gen5 (signe d'un produit), gen6 (inéquations rationnelles),
 * gen57 (équations et inéquations en contexte), gen67 (relations entre racines et coefficients) —
 * règle `.claude/rules/feuilles-evaluations.md`, section « Corrigé détaillé — comme au tableau ».
 *
 * Mécanisme « méthode la plus rapide » partagé par gen5 (facteur du second degré) et gen6
 * (numérateur, dénominateur, fraction à simplifier) : un constructeur par ÉCRAN — réduction,
 * reconnaissance de la méthode, champ 1 (forme factorisée ou Δ), racines, factorisation après Δ.
 * Le résultat de chaque écran est celui que l'écran affiche (forme passée par l'appelant, issue de
 * la même fonction que l'écran). Écritures exactes (entiers, fractions), « − » typographique (LaTeX
 * « - »). Aucune dépendance à `docx` : importé par les générateurs interactifs.
 */

export type Fragments = FragmentConsigne[];

/** Renvois au cours (sections numérotées de `equations-inequations-second-degre.ts`). */
export const COURS_RESOUDRE = "(cours, § 1)";
export const COURS_SIGNE_TRINOME = "(cours, § 2)";
export const COURS_PRODUIT = "(cours, § 3)";
export const COURS_SIMPLIFIER = "(cours, § 4)";
export const COURS_DENOMINATEUR = "(cours, § 5)";
export const COURS_RATIONNELLE = "(cours, § 6)";
export const COURS_CONTEXTE = "(cours, § 7)";

/** `kx + c` en LaTeX (« 2x-6 », « -x+3 », « x »). */
export function lineaireLatex(k: number, c: number): string {
  const kx = mono(k, "x");
  if (Math.abs(c) < 1e-12) return kx;
  return c > 0 ? `${kx}+${q(c)}` : `${kx}-${q(-c)}`;
}

/** Trinôme `ax² + bx + c` (même écriture que l'écran : `formatMembreGauche`). */
export function trinomeLatex(e: Enonce): string {
  return formatMembreGauche(e);
}

/** Préfixe d'un coefficient devant une parenthèse : « », « - », « 2 », « -3 ». */
export function prefixe(a: number): string {
  return a === 1 ? "" : a === -1 ? "-" : q(a);
}

/** « de » + nom : « du facteur 2 », « du numérateur », « de la fraction », « de l'expression ». */
export function deNom(nom: string): string {
  if (nom.startsWith("le ")) return `du ${nom.slice(3)}`;
  if (nom.startsWith("les ")) return `des ${nom.slice(4)}`;
  return `de ${nom}`;
}

/** Forme factorisée « monique » `a·x(x − r)`, `a(x − r₁)(x − r₂)`, `a(x − r)²` (coefficient devant,
 * binômes unitaires) : celle dont on lit les racines. */
export function formeMonique(a: number, r1: number, r2: number): string {
  const facteur = (r: number) => (r === 0 ? "x" : `(${formatFacteurRacine(r)})`);
  if (r1 === r2) return `${prefixe(a)}${r1 === 0 ? "x^2" : `(${formatFacteurRacine(r1)})^2`}`;
  // Même ordre que l'écran (`formatFormeFactoriseeDepuisRacines`) : facteur x d'abord, sinon la plus grande racine.
  const [u, v] = r1 === 0 ? [r1, r2] : r2 === 0 ? [r2, r1] : r1 > r2 ? [r1, r2] : [r2, r1];
  return `${prefixe(a)}${facteur(u)}${facteur(v)}`;
}

/** Résolution de `kx + c = 0` (une transformation par ligne), ligne de départ comprise. */
export function lignesRacineLineaire(k: number, c: number): LigneCalcul[] {
  const r = -c / k;
  const lignes: LigneCalcul[] = [ligne(`${lineaireLatex(k, c)}=0`)];
  if (c !== 0) lignes.push(ligne(`${mono(k, "x")}=${q(-c)}`, c > 0 ? `on soustrait ${nombreTexte(c)}` : `on ajoute ${nombreTexte(-c)}`));
  if (k !== 1 && c === 0) lignes.push(ligne("x=0", `on divise par ${nombreTexte(k)}`));
  else if (k !== 1) {
    lignes.push(ligne(`x=\\dfrac{${q(-c)}}{${q(k)}}`, `on divise par ${nombreTexte(k)}`));
    lignes.push(ligne(`=${q(r)}`));
  }
  return lignes;
}

/** Lignes « produit nul » sur la forme `a·(x − r₁)(x − r₂)` : un facteur nul à la fois. */
export function lignesProduitNul(a: number, r1: number, r2: number, avecDepart = true, justificationDepart?: string): LigneCalcul[] {
  const lignes: LigneCalcul[] = [];
  if (avecDepart) lignes.push(ligne(`${formeMonique(a, r1, r2)}=0`, justificationDepart ?? (Math.abs(a) === 1 ? "forme factorisée" : `forme factorisée ; ${nombreTexte(a)} ≠ 0 ne s'annule pas`)));
  const ordre = r1 === r2 ? [r1] : r1 === 0 ? [r1, r2] : r2 === 0 ? [r2, r1] : r1 > r2 ? [r1, r2] : [r2, r1];
  for (const r of ordre) {
    if (r === 0) {
      lignes.push(ligne("x=0", "le facteur x est nul"));
      continue;
    }
    lignes.push(ligne(`${formatFacteurRacine(r)}=0`, r1 === r2 ? "un carré est nul quand sa base est nulle" : "un facteur est nul"));
    lignes.push(ligne(`x=${q(r)}`, r > 0 ? `on ajoute ${nombreTexte(r)}` : `on soustrait ${nombreTexte(-r)}`));
  }
  return lignes;
}

/** Valeur d'un trinôme en un point. */
export function valeurTrinome(e: Enonce, x: number): number {
  return e.a * x * x + e.b * x + e.c;
}

/** Racines triées, distinctes. */
export function racinesDistinctes(racines: readonly number[]): number[] {
  return [...new Set([...racines].map((r) => (Object.is(r, -0) ? 0 : r)))].sort((u, v) => u - v);
}

// ---------------------------------------------------------------------------------------------
// Réduction (diviser par le facteur commun, ou le mettre en évidence)
// ---------------------------------------------------------------------------------------------

/**
 * Écran « réduction » : le trinôme est divisé par le plus grand diviseur commun POSITIF de ses
 * coefficients (racines et signe inchangés). `resultatLatex` : la forme réduite de l'écran.
 */
export function etapeReductionDivision(sq: string, e: Enonce, nom: string, resultatLatex: string, raison: string): EtapeCorrection[] {
  const g = facteurCommun(e);
  const reduit: Enonce = { a: e.a / g, b: e.b / g, c: e.c / g };
  return [
    utilise(sq, [texte(`Réduire ${nom} : on le divise par le plus grand diviseur commun de ses coefficients, pris positif — ${raison}.`)]),
    calcul(sq, [
      ligne(`${trinomeLatex(e)}=${g}\\,(${trinomeLatex(reduit)})`, `${g} divise les trois coefficients : mise en évidence de ${g}`),
      ligne(`\\dfrac{${trinomeLatex(e)}}{${g}}=${trinomeLatex(reduit)}`, `on divise par ${g}, positif`),
    ]),
    resultat(sq, [texte(`${nom[0].toUpperCase()}${nom.slice(1)} réduit : `), latex(resultatLatex)]),
  ];
}

/** Écran « mise en évidence » d'un trinôme d'une FRACTION (le facteur commun est gardé devant, jamais
 * divisé : la fraction ne doit pas changer). */
export function etapeReductionMiseEnEvidence(sq: string, e: Enonce, nom: string, resultatLatex: string): EtapeCorrection[] {
  const g = facteurCommun(e);
  const reduit: Enonce = { a: e.a / g, b: e.b / g, c: e.c / g };
  return [
    utilise(sq, [texte(`Mettre en évidence le facteur commun des coefficients ${deNom(nom)} : on le garde devant la parenthèse (le diviser changerait la fraction) ${COURS_SIMPLIFIER}.`)]),
    calcul(sq, [ligne(`${trinomeLatex(e)}=${g}\\,(${trinomeLatex(reduit)})`, `${g} divise les trois coefficients`)]),
    resultat(sq, [latex(resultatLatex)]),
  ];
}

// ---------------------------------------------------------------------------------------------
// Reconnaissance de la méthode la plus rapide
// ---------------------------------------------------------------------------------------------

/** Conditions testées dans l'ordre du tableau du cours (§ 1) : c = 0, b = 0, b² = 4ac, sinon Δ. */
export function lignesReconnaissance(e: Enonce, categorie: Categorie): LigneCalcul[] {
  const { a, b, c } = e;
  const lignes: LigneCalcul[] = [];
  if (c === 0) {
    lignes.push(ligne("c=0", "pas de terme constant : x se met en évidence"));
    return lignes;
  }
  lignes.push(ligne(`c=${q(c)}\\neq 0`, "un terme constant : pas de mise en évidence de x"));
  if (b === 0) {
    lignes.push(ligne("b=0", "pas de terme en x"));
    const ac = a * c;
    lignes.push(
      ligne(
        `a\\cdot c=${q(a)}\\cdot ${qp(c)}=${q(ac)}${ac < 0 ? "<" : ">"}0`,
        ac < 0 ? "a et c de signes opposés : différence de deux carrés" : [texte("a et c de même signe : "), latex("x^2=-\\dfrac{c}{a}<0"), texte(", aucune racine")],
      ),
    );
    return lignes;
  }
  lignes.push(ligne(`b=${q(b)}\\neq 0`, "un terme en x : ni mise en évidence, ni différence de deux carrés"));
  const quatreAC = 4 * a * c;
  lignes.push(ligne(`b^2=${qp(b)}^2=${q(b * b)}`));
  lignes.push(ligne(`4ac=4\\cdot ${qp(a)}\\cdot ${qp(c)}=${q(quatreAC)}`, b * b === quatreAC ? "b² = 4ac : Δ = 0, carré parfait" : "b² ≠ 4ac : pas un carré parfait"));
  if (categorie === "irreductible") {
    const delta = b * b - quatreAC;
    lignes.push(ligne(`\\Delta=b^2-4ac=${q(b * b)}-${qp(quatreAC)}`, "discriminant"));
    lignes.push(ligne(`=${q(delta)}<0`, "aucune racine : le trinôme ne se factorise pas"));
  }
  return lignes;
}

/** Écran « méthode » : la méthode la plus rapide (ou « Non factorisable »). */
export function etapeReconnaissance(sq: string, e: Enonce, categorie: Categorie, nom: string): EtapeCorrection[] {
  return [
    utilise(sq, [texte(`Méthode la plus rapide pour ${nom} : on teste les cas rapides dans l'ordre du tableau (c = 0, puis b = 0, puis b² = 4ac) avant le discriminant ${COURS_RESOUDRE}.`)]),
    calcul(sq, lignesReconnaissance(e, categorie)),
    resultat(sq, [texte(`Méthode : ${libelleCategorie(categorie)}.`)]),
  ];
}

// ---------------------------------------------------------------------------------------------
// Champ 1 : forme factorisée (cas rapides) ou discriminant (cas général)
// ---------------------------------------------------------------------------------------------

/** Lignes du discriminant `Δ = b² − 4ac`, substitution puis calcul. */
export function lignesDiscriminant(e: Enonce): LigneCalcul[] {
  const { a, b, c } = e;
  const quatreAC = 4 * a * c;
  const delta = b * b - quatreAC;
  const lignes = [
    ligne("\\Delta=b^2-4ac", "discriminant"),
    ligne(`=${qp(b)}^2-4\\cdot ${qp(a)}\\cdot ${qp(c)}`, "on remplace a, b et c"),
  ];
  const milieu = `=${q(b * b)}${quatreAC < 0 ? "+" : "-"}${q(Math.abs(quatreAC))}`;
  if (milieu !== `=${q(delta)}`) lignes.push(ligne(milieu));
  lignes.push(ligne(`=${q(delta)}`));
  return lignes;
}

function nombreSolutionsDelta(delta: number): string {
  return delta > 0 ? "deux racines distinctes (Δ > 0)" : delta === 0 ? "une racine double (Δ = 0)" : "aucune racine (Δ < 0)";
}

/** Facteur sorti devant la parenthèse d'une mise en évidence (« 2x », « x », « -x », « -3x »). */
function facteurDevant(forme: string): string {
  const i = forme.indexOf("(");
  return i > 0 ? forme.slice(0, i).replace(/\\,/g, "") : "x";
}

/**
 * Écran « champ 1 » : forme factorisée (mise en évidence, différence de deux carrés, carré parfait)
 * ou discriminant (cas général). `formeEcran` : la forme factorisée affichée par l'écran (sans « = 0 »).
 */
export function etapeChamp1(sq: string, p2: Exercice, nom: string, formeEcran: string): EtapeCorrection[] {
  const e = p2.enonce;
  const M = trinomeLatex(e);
  const { a } = e;
  switch (p2.categorie) {
    case "mise_en_evidence": {
      const f = facteurDevant(formeEcran);
      return [
        utilise(sq, [texte(`Mise en évidence (c = 0) : x est un facteur des deux termes ${deNom(nom)} ${COURS_RESOUDRE}.`)]),
        calcul(sq, [ligne(`${M}=${formeEcran}`, [texte("mise en évidence de "), latex(f)])]),
        resultat(sq, [latex(`${formeEcran} = 0`)]),
      ];
    }
    case "binome_conjugue": {
      const r = Math.max(...p2.solution.racines.map(Math.abs));
      const lignes: LigneCalcul[] = [];
      const diff = `x^2-${q(r * r)}`;
      if (a !== 1) lignes.push(ligne(`${M}=${prefixe(a)}(${diff})`, a === -1 ? "mise en évidence de −1" : `mise en évidence de ${nombreTexte(a)}`));
      lignes.push(ligne(`${a !== 1 ? "" : M}=${formeEcran}`, [texte("différence de deux carrés : "), latex(`{${diff}=(x-${q(r)})(x+${q(r)})}`)]));
      return [
        utilise(sq, [texte(`Différence de deux carrés (b = 0) : `), latex("u^2-v^2=(u-v)(u+v)"), texte(` ${COURS_RESOUDRE}.`)]),
        calcul(sq, lignes),
        resultat(sq, [latex(`${formeEcran} = 0`)]),
      ];
    }
    case "produit_remarquable": {
      const r = p2.solution.racines[0];
      const interieur = formatMembreGauche({ a: 1, b: -2 * r, c: r * r });
      const carre = r === 0 ? "x^2" : `(${formatFacteurRacine(r)})^2`;
      const lignes: LigneCalcul[] = [];
      if (a !== 1) lignes.push(ligne(`${M}=${prefixe(a)}(${interieur})`, a === -1 ? "mise en évidence de −1" : `mise en évidence de ${nombreTexte(a)}`));
      lignes.push(ligne(`${a !== 1 ? "" : M}=${formeEcran}`, [texte("carré parfait : "), latex(`{${interieur}=${carre}}`)]));
      return [
        utilise(sq, [texte(`Carré parfait (b² = 4ac) : `), latex("u^2-2uv+v^2=(u-v)^2"), texte(` ${COURS_RESOUDRE}.`)]),
        calcul(sq, lignes),
        resultat(sq, [latex(`${formeEcran} = 0`)]),
      ];
    }
    default: {
      const delta = e.b * e.b - 4 * e.a * e.c;
      return [
        utilise(sq, [texte(`Cas général : le discriminant ${deNom(nom)}, `), latex("\\Delta=b^2-4ac"), texte(` ${COURS_RESOUDRE}.`)]),
        calcul(sq, lignesDiscriminant(e)),
        resultat(sq, [latex(`\\Delta = ${q(delta)}`), texte(` : ${nombreSolutionsDelta(delta)}.`)]),
      ];
    }
  }
}

// ---------------------------------------------------------------------------------------------
// Racines
// ---------------------------------------------------------------------------------------------

/** Lignes « formule » d'une racine : `x_i = (−b ± √Δ)/(2a)`, substitution, racine, valeur. */
export function lignesFormuleRacine(e: Enonce, indice: 1 | 2, signe: "-" | "+"): LigneCalcul[] {
  const { a, b, c } = e;
  const delta = b * b - 4 * a * c;
  const s = Math.sqrt(delta);
  const x = (-b + (signe === "+" ? s : -s)) / (2 * a);
  const rac = Number.isInteger(s) ? q(s) : `\\sqrt{${q(delta)}}`;
  const lignes = [
    ligne(`x_${indice}=\\dfrac{-b${signe}\\sqrt{\\Delta}}{2a}`, indice === 1 ? "formule des racines" : undefined),
    ligne(`=\\dfrac{${q(-b)}${signe}\\sqrt{${q(delta)}}}{2\\cdot ${qp(a)}}`, "on remplace"),
  ];
  if (Number.isInteger(s)) lignes.push(ligne(`=\\dfrac{${q(-b)}${signe}${rac}}{${q(2 * a)}}`, `√${nombreTexte(delta)} = ${nombreTexte(s)}`));
  lignes.push(ligne(`=${q(x)}`));
  return lignes;
}

/** Écran « racines ». Cas général : formule ; sinon produit nul sur la forme factorisée. */
export function etapeRacines(sq: string, p2: Exercice, nom: string): EtapeCorrection[] {
  const e = p2.enonce;
  const [r1, r2] = racinesDistinctes(p2.solution.racines).length === 1 ? [p2.solution.racines[0], p2.solution.racines[0]] : racinesDistinctes(p2.solution.racines);
  const res: Fragments = r1 === r2 ? [latex(`x = ${q(r1)}`), texte(" (racine double)")] : [latex(`x = ${q(r1)}`), texte(" ou "), latex(`x = ${q(r2)}`)];
  if (p2.categorie === "cas_general") {
    return [
      utilise(sq, [texte(`Δ > 0 : deux racines `), latex("x=\\dfrac{-b\\pm\\sqrt{\\Delta}}{2a}"), texte(` ${COURS_RESOUDRE}.`)]),
      calcul(sq, [...lignesFormuleRacine(e, 1, "-"), ...lignesFormuleRacine(e, 2, "+")]),
      resultat(sq, [texte(`Racines ${deNom(nom)} : `), ...res]),
      verification(sq, [texte("Somme et produit des racines : "), latex(`${qp(r1)}+${qp(r2)}=${q(r1 + r2)}=-\\dfrac{b}{a}`), texte(" et "), latex(`${qp(r1)}\\cdot ${qp(r2)}=${q(r1 * r2)}=\\dfrac{c}{a}`), texte(".")]),
    ];
  }
  const lignes = lignesProduitNul(e.a, r1, r2);
  return [
    utilise(sq, [texte(`Produit nul : un produit est nul si et seulement si l'un de ses facteurs est nul ${COURS_RESOUDRE}.`)]),
    calcul(sq, lignes),
    resultat(sq, [texte(`Racines ${deNom(nom)} : `), ...res]),
  ];
}

/** Écran « factorisation » après Δ : `a(x − x₁)(x − x₂)`. `formeEcran` : forme de l'écran (sans « = 0 »). */
export function etapeFactorisationCasGeneral(sq: string, p2: Exercice, nom: string, formeEcran: string): EtapeCorrection[] {
  const e = p2.enonce;
  const [x1, x2] = racinesDistinctes(p2.solution.racines);
  const substitue = `${prefixe(e.a)}(x-${qp(x1)})(x-${qp(x2)})`;
  const lignes: LigneCalcul[] = [ligne(`${trinomeLatex(e)}=a(x-x_1)(x-x_2)`, "forme factorisée"), ligne(`=${substitue}`, "on remplace a et les racines")];
  if (substitue.replace(/\s/g, "") !== formeEcran.replace(/\s/g, "")) lignes.push(ligne(`=${formeEcran}`));
  return [
    utilise(sq, [texte(`Factoriser ${nom} à partir de ses racines : `), latex("ax^2+bx+c=a(x-x_1)(x-x_2)"), texte(` ${COURS_RESOUDRE}.`)]),
    calcul(sq, lignes),
    resultat(sq, [latex(`${formeEcran} = 0`)]),
  ];
}

// ---------------------------------------------------------------------------------------------
// Signes (tableaux de signes de gen5 et gen6)
// ---------------------------------------------------------------------------------------------

/** Signe d'un facteur du premier degré `kx + c` (racine `r`). */
export function ligneSigneLineaire(k: number, c: number, r: number): LigneCalcul {
  return ligne(`${lineaireLatex(k, c)}>0\\iff x${k > 0 ? ">" : "<"}${q(r)}`, k > 0 ? "coefficient de x positif : + à droite de la racine" : "coefficient de x négatif : + à gauche de la racine");
}

/** Signe d'un trinôme sans racine (Δ < 0) : signe de a partout. */
export function ligneSigneIrreductible(e: Enonce): LigneCalcul {
  const delta = e.b * e.b - 4 * e.a * e.c;
  return ligne(`\\Delta=${q(delta)}<0`, `aucune racine : le trinôme a partout le signe de a (${e.a > 0 ? "+" : "−"})`);
}

/** Signe d'un trinôme à deux racines (§ 2) : signe de a à l'extérieur des racines, contraire entre
 * elles ; racine double : signe de a, nul en la racine. `expr` : le trinôme tel qu'écrit. */
export function ligneSigneTrinome(expr: string, a: number, r1: number, r2: number): LigneCalcul {
  if (r1 === r2) return ligne(`${expr}${a > 0 ? "\\geq" : "\\leq"}0`, `carré parfait : signe de a (${a > 0 ? "+" : "−"}) partout, nul en x = ${nombreTexte(r1)}`);
  return ligne(`${expr}${a > 0 ? "<" : ">"}0\\iff x\\in\\,]${q(r1)}\\,;\\,${q(r2)}[`, `signe de a (${a > 0 ? "+" : "−"}) à l'extérieur des racines, contraire entre elles`);
}

/** Ligne d'une constante négative (coefficient sorti du tableau). */
export function ligneConstante(a: number): LigneCalcul {
  return ligne(`${q(a)}<0`, "constante négative : − partout");
}

/** Une zone ou une racine du tableau, avec sa décision (gardée ou exclue). */
export interface DecisionZone {
  latex: string;
  justification: string;
}

/** Morceau de la droite réelle entre deux bornes (intervalle ouvert, notation belge). */
export function zoneLatex(g: number | null, d: number | null): string {
  return `x\\in\\,]${g === null ? "-\\infty" : q(g)}\\,;\\,${d === null ? "+\\infty" : q(d)}[`;
}

/** Ce qu'on garde selon le symbole (zones positives / négatives, racines du numérateur). */
export function signeVoulu(symbole: Symbole): { signe: "+" | "-"; large: boolean } {
  return { signe: symbole === ">" || symbole === "≥" ? "+" : "-", large: symbole === "≤" || symbole === "≥" };
}

/**
 * Lignes de lecture de l'ensemble-solution : une ligne par zone et par racine du tableau, avec la
 * décision (« gardée » / « exclue ») et ce qu'on lit dans la dernière ligne du tableau.
 * `valeurs` : la ligne du résultat (2n + 1 cellules, zone / racine alternées).
 */
export function lignesLectureSolution(racines: number[], valeurs: readonly string[], symbole: Symbole, nomResultat: string): LigneCalcul[] {
  const { signe, large } = signeVoulu(symbole);
  const lignes: LigneCalcul[] = [];
  const nomSigne = (s: string) => (s === "+" ? "positif" : "négatif");
  for (let i = 0; i < valeurs.length; i++) {
    const v = valeurs[i];
    if (i % 2 === 0) {
      const g = i === 0 ? null : racines[i / 2 - 1];
      const d = i === valeurs.length - 1 ? null : racines[i / 2];
      lignes.push(ligne(zoneLatex(g, d), `${nomResultat} ${nomSigne(v)} : ${v === signe ? "zone gardée" : "zone exclue"}`));
    } else {
      const r = racines[(i - 1) / 2];
      if (v === "∄") lignes.push(ligne(`x=${q(r)}`, "valeur interdite : toujours exclue"));
      else lignes.push(ligne(`x=${q(r)}`, `${nomResultat} nul : ${large ? "gardé (inégalité large)" : "exclu (inégalité stricte)"}`));
    }
  }
  return lignes;
}

/** Valeur test dans la dernière zone (à droite de toutes les racines) — vérification du tableau. */
export function valeurTest(racines: number[]): number {
  return racines.length ? Math.floor(Math.max(...racines)) + 1 : 0;
}
