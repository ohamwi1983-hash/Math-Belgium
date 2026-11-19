import type { FragmentConsigne } from "../../export/genererFeuilleExercices";
import { latex, texte } from "../../export/corrigeTableau";
import type { ExerciceEffectif, ExerciceGroupes, ExerciceMediane, ExerciceNote, ExerciceValeurManquante } from "../core/valeurManquante.types";
import { contexteGroupes, contexteNoteAvecCoef, contexteNoteSansCoef, contexteTableau, PRENOMS, type ContexteGroupes, type ContexteTableau } from "../moteur/contextesValeurManquante";
import { nombreTexteFr } from "../moteur/contextesTransformationDonnees";
import { arrondi9, cumules, solutionsEquations, sommesConnues } from "../generateurs/valeurManquante";

/**
 * Textes de gen109 (écran ET papier : une seule source). Formules toujours en LaTeX, jamais au
 * clavier ; virgule décimale ; signe moins typographique ; unités du contexte partout. Notations du
 * cours : x̄ = Σ(xᵢ·nᵢ)/Σnᵢ, règle du seuil n/2 pour la médiane.
 */

export const NOMBRE_ECRANS = 3;
export const TITRES_ECRANS = ["Poser l'équation", "Résoudre", "Conclure"];

export const CONSIGNE_GENERALE =
  "Une donnée manque. Traduis l'information connue par une équation, résous-la, puis conclus dans le contexte. Toutes les valeurs sont exactes : aucun arrondi n'est nécessaire.";

// ---------------------------------------------------------------------------------------------
// Nombres
// ---------------------------------------------------------------------------------------------

export function nombreTexte(v: number): string {
  return nombreTexteFr(v);
}

/** Nombre pour KaTeX : virgule `{,}`, espace fine des milliers (à partir de 10 000), « − ». */
export function nombreLatex(v: number): string {
  return nombreTexteFr(v).replace(",", "{,}").replace(/[\s\u202f\u00a0]/g, "\\,").replace("−", "-");
}

/** « 12, 9 et 14 ». */
function listeTexte(valeurs: string[]): string {
  if (valeurs.length <= 1) return valeurs.join("");
  return `${valeurs.slice(0, -1).join(", ")} et ${valeurs[valeurs.length - 1]}`;
}

const EN_LETTRES = ["zéro", "un", "deux", "trois", "quatre", "cinq"];

function majuscule(t: string): string {
  return t.charAt(0).toUpperCase() + t.slice(1);
}

/** « l'examen de juin » → « à l'examen de juin » ; « le dossier » → « au dossier ». */
function aArticle(nom: string): string {
  if (nom.startsWith("le ")) return `au ${nom.slice(3)}`;
  return `à ${nom}`;
}

/** « les bureaux » → « des bureaux » ; « le groupe » → « du groupe » ; « la 4e A » → « de la 4e A ». */
function deArticle(nom: string): string {
  if (nom.startsWith("les ")) return `des ${nom.slice(4)}`;
  if (nom.startsWith("le ")) return `du ${nom.slice(3)}`;
  return `de ${nom}`;
}

/** « de Léa », « d'Adam ». */
function dePrenom(prenom: string): string {
  return /^[AEIOUÉÈ]/.test(prenom) ? `d'${prenom}` : `de ${prenom}`;
}

/** « la taille moyenne » → « taille moyenne » ; « l'âge moyen » → « âge moyen ». */
function sansArticle(t: string): string {
  return t.replace(/^(la |le |les |l')/, "");
}

export function pronom(e: ExerciceNote): "il" | "elle" {
  return PRENOMS.find((p) => p.prenom === e.prenom)?.pronom ?? "elle";
}

function note20(v: number): string {
  return `${nombreTexte(v)}/20`;
}

export function valeurGroupe(c: ContexteGroupes, v: number): string {
  return c.uniteCollee ? `${nombreTexte(v)}${c.unite}` : `${nombreTexte(v)} ${c.unite}`;
}

function moyenneTableauTexte(c: ContexteTableau, m: number): string {
  return c.uniteMoyenne ? `${nombreTexte(m)} ${c.uniteMoyenne}` : nombreTexte(m);
}

// ---------------------------------------------------------------------------------------------
// Énoncé : récit, tableau, question
// ---------------------------------------------------------------------------------------------

export interface TableauDonnees {
  legende: string;
  entetes: string[];
  lignes: string[][];
}

/** Paragraphes du récit (avant le tableau éventuel), le tableau, puis les phrases après lui. */
export interface Recit {
  avant: string[];
  tableau: TableauDonnees | null;
  apres: string[];
  question: string;
}

function recitNote(e: ExerciceNote): Recit {
  const il = pronom(e);
  if (e.forme === "sans-coef") {
    const c = contexteNoteSansCoef(e.contexte);
    const premiers = c.feminin ? "premières" : "premiers";
    const dernier = c.feminin ? "une dernière" : "un dernier";
    return {
      avant: [
        `En ${c.matiere}, ${e.prenom} a obtenu ${listeTexte(e.notes.map(nombreTexte))} (sur 20) aux ${EN_LETTRES[e.notes.length]} ${premiers} ${c.pluriel} de la période. Il reste ${dernier} ${c.epreuve}, qui compte autant que les autres.`,
        `${e.prenom} voudrait atteindre une moyenne de ${note20(e.cible)}.`,
      ],
      tableau: null,
      apres: [],
      question: `Quelle note doit-${il} obtenir, au minimum, ${c.feminin ? "à la dernière" : "au dernier"} ${c.epreuve} ? Est-ce possible ?`,
    };
  }
  const c = contexteNoteAvecCoef(e.contexte);
  const lignes = c.connues.map((ep, i) => [majuscule(ep.nom), `${e.coefs[i]}`, note20(e.notes[i]!)]);
  lignes.push([majuscule(c.derniere.nom), `${e.coefDernier}`, "?"]);
  return {
    avant: [c.intro(e.prenom, dePrenom(e.prenom)), `Il ne reste plus que ${c.derniere.nom} à passer.`],
    tableau: { legende: `Les notes ${dePrenom(e.prenom)}`, entetes: ["Épreuve", "Coefficient", "Note"], lignes },
    apres: [`${e.prenom} voudrait atteindre une moyenne de ${note20(e.cible)}.`],
    question: `Quelle note doit-${il} obtenir, au minimum, ${aArticle(c.derniere.nom)} ? Est-ce possible ?`,
  };
}

function tableauSerie(c: ContexteTableau, valeurs: number[], effectifs: (number | null)[]): TableauDonnees {
  return {
    legende: "La série",
    entetes: [`${c.enTeteValeur} xᵢ`, `${c.enTeteEffectif} nᵢ`],
    lignes: valeurs.map((v, i) => [nombreTexte(v), effectifs[i] === null ? "?" : `${effectifs[i]}`]),
  };
}

function recitEffectif(e: ExerciceEffectif): Recit {
  const c = contexteTableau(e.contexte);
  const v = e.valeurs[e.indexInconnu]!;
  return {
    avant: [`${c.intro} Une tache d'encre a effacé un effectif du tableau.`],
    tableau: tableauSerie(
      c,
      e.valeurs,
      e.effectifs.map((n, i) => (i === e.indexInconnu ? null : n)),
    ),
    apres: [`On sait que la moyenne de la série est de ${moyenneTableauTexte(c, e.moyenne)}.`],
    question: `Combien y a-t-il de ${c.groupe(v)} ?`,
  };
}

function valeurAjoutee(e: ExerciceMediane): number {
  return e.forme === "haut" ? e.valeurs[e.valeurs.length - 1]! : e.valeurs[0]!;
}

function recitMediane(e: ExerciceMediane): Recit {
  const c = contexteTableau(e.contexte);
  return {
    avant: [c.intro],
    tableau: tableauSerie(c, e.valeurs, e.effectifs),
    apres: [
      `La médiane de cette série vaut ${c.valeurTexte(e.valeurs[e.indexMedianeActuelle]!)} (règle du seuil : première valeur dont l'effectif cumulé dépasse strictement la moitié de l'effectif total).`,
      `On complète l'enquête avec des ${c.groupe(valeurAjoutee(e))}, et seulement avec eux.`,
    ],
    question: `Combien faut-il en ajouter, au minimum, pour que la médiane devienne ${c.valeurTexte(e.valeurs[e.indexCible]!)} ?`,
  };
}

function nomTableau(nom: string): string {
  return majuscule(sansArticle(nom));
}

function recitGroupes(e: ExerciceGroupes): Recit {
  const c = contexteGroupes(e.contexte);
  const tableau: TableauDonnees = {
    legende: "Les deux groupes",
    entetes: ["Groupe", "Effectif", majuscule(sansArticle(c.grandeur))],
    lignes: [
      [nomTableau(c.groupe1), `${e.n1}`, valeurGroupe(c, e.m1)],
      [nomTableau(c.groupe2), `${e.n2}`, e.forme === "groupe" ? "?" : valeurGroupe(c, e.m2)],
    ],
  };
  if (e.forme === "globale") {
    return { avant: [c.intro], tableau, apres: [], question: `Que vaut ${c.grandeur} de l'ensemble des ${c.individus}, les deux groupes réunis ?` };
  }
  return {
    avant: [c.intro],
    tableau,
    apres: [`Pour l'ensemble des ${c.individus} des deux groupes réunis, ${c.grandeur} est de ${valeurGroupe(c, e.globale)}.`],
    question: `Que vaut ${c.grandeur} ${deArticle(c.groupe2)} ?`,
  };
}

export function recit(e: ExerciceValeurManquante): Recit {
  switch (e.variante) {
    case "note-a-obtenir":
      return recitNote(e);
    case "effectif-manquant":
      return recitEffectif(e);
    case "valeur-pour-mediane":
      return recitMediane(e);
    case "moyenne-groupes":
      return recitGroupes(e);
  }
}

function echapper(t: string): string {
  return t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

const TD = 'style="border:1px solid #b9bec7;padding:3px 10px;text-align:center"';
const TH = 'style="border:1px solid #b9bec7;padding:3px 10px;text-align:center;font-weight:600"';

/** Tableau HTML (papier). */
export function tableauHtml(t: TableauDonnees): string {
  const tete = `<tr>${t.entetes.map((h) => `<th ${TH}>${echapper(h)}</th>`).join("")}</tr>`;
  const corps = t.lignes.map((l) => `<tr>${l.map((x) => `<td ${TD}>${echapper(x)}</td>`).join("")}</tr>`).join("");
  return `<table style="border-collapse:collapse;margin:6px 0"><caption style="caption-side:top;text-align:left;font-weight:bold;padding-bottom:3px;">${echapper(t.legende)}</caption>${tete}${corps}</table>`;
}

// ---------------------------------------------------------------------------------------------
// Écran 1 — les quatre équations (indice 0 : la bonne)
// ---------------------------------------------------------------------------------------------

/** « 2 \times 11 + 3 \times 13 » (ou « 12 + 9 + 14 » sans coefficients). */
function produitsNote(e: ExerciceNote, avecCoefs = e.forme === "avec-coef"): string {
  return e.notes.map((n, i) => (avecCoefs ? `${e.coefs[i]} \\times ${nombreLatex(n)}` : nombreLatex(n))).join(" + ");
}

function terme(coef: number, lettre: string): string {
  return coef === 1 ? lettre : `${coef}\\,${lettre}`;
}

function sommeCoefsLatex(e: ExerciceNote, avecDernier: boolean): string {
  return [...e.coefs, ...(avecDernier ? [e.coefDernier] : [])].join(" + ");
}

function equationsNote(e: ExerciceNote): string[] {
  const m = nombreLatex(e.cible);
  const k = e.notes.length;
  if (e.forme === "sans-coef") {
    const s = produitsNote(e);
    return [`\\dfrac{${s} + x}{${k + 1}} = ${m}`, `\\dfrac{${s} + x}{${k}} = ${m}`, `\\dfrac{1}{2}\\left(\\dfrac{${s}}{${k}} + x\\right) = ${m}`, `${s} + x = ${m}`];
  }
  const s = produitsNote(e);
  return [
    `\\dfrac{${s} + ${terme(e.coefDernier, "x")}}{${sommeCoefsLatex(e, true)}} = ${m}`,
    `\\dfrac{${s} + ${terme(e.coefDernier, "x")}}{${sommeCoefsLatex(e, false)}} = ${m}`,
    `\\dfrac{${s} + x}{${sommeCoefsLatex(e, true)}} = ${m}`,
    `\\dfrac{${produitsNote(e, false)} + x}{${k + 1}} = ${m}`,
  ];
}

function equationsEffectif(e: ExerciceEffectif): string[] {
  const { somme, n } = sommesConnues(e);
  const v = e.valeurs[e.indexInconnu]!;
  const m = nombreLatex(e.moyenne);
  return [`\\dfrac{${somme} + ${v}\\,k}{${n} + k} = ${m}`, `\\dfrac{${somme} + ${v}\\,k}{${n}} = ${m}`, `\\dfrac{${somme} + k}{${n} + k} = ${m}`, `\\dfrac{${somme}}{${n} + k} = ${m}`];
}

function equationsMediane(e: ExerciceMediane): string[] {
  const cum = cumules(e.effectifs);
  const s = cum[cum.length - 1]!;
  const j = e.indexCible;
  if (e.forme === "haut") {
    const c = cum[j - 1]!;
    return [`\\dfrac{${s} + k}{2} = ${c}`, `\\dfrac{${s} + k}{2} = ${cum[j]}`, `\\dfrac{${s} + k}{2} = ${c} + k`, `${s} + k = ${c}`];
  }
  const c = cum[j]!;
  return [`${c} + k = \\dfrac{${s} + k}{2}`, `${c} = \\dfrac{${s} + k}{2}`, `${cum[j - 1]} + k = \\dfrac{${s} + k}{2}`, `${c} + k = \\dfrac{${s}}{2}`];
}

function equationsGroupes(e: ExerciceGroupes): string[] {
  const { n1, n2 } = e;
  const m1 = nombreLatex(e.m1);
  const g = nombreLatex(e.globale);
  if (e.forme === "globale") {
    const m2 = nombreLatex(e.m2);
    return [
      `G = \\dfrac{${n1} \\times ${m1} + ${n2} \\times ${m2}}{${n1} + ${n2}}`,
      `G = \\dfrac{${m1} + ${m2}}{2}`,
      `G = \\dfrac{${n1} \\times ${m1} + ${n2} \\times ${m2}}{2}`,
      `G = \\dfrac{${n2} \\times ${m1} + ${n1} \\times ${m2}}{${n1} + ${n2}}`,
    ];
  }
  return [
    `\\dfrac{${n1} \\times ${m1} + ${n2}\\,y}{${n1} + ${n2}} = ${g}`,
    `\\dfrac{${m1} + y}{2} = ${g}`,
    `\\dfrac{${n1} \\times ${m1} + y}{${n1} + ${n2}} = ${g}`,
    `\\dfrac{${n1} \\times ${m1} + ${n2}\\,y}{${n2}} = ${g}`,
  ];
}

export function equations(e: ExerciceValeurManquante): string[] {
  switch (e.variante) {
    case "note-a-obtenir":
      return equationsNote(e);
    case "effectif-manquant":
      return equationsEffectif(e);
    case "valeur-pour-mediane":
      return equationsMediane(e);
    case "moyenne-groupes":
      return equationsGroupes(e);
  }
}

/** Lettre de l'inconnue. */
export function inconnue(e: ExerciceValeurManquante): string {
  switch (e.variante) {
    case "note-a-obtenir":
      return "x";
    case "effectif-manquant":
    case "valeur-pour-mediane":
      return "k";
    case "moyenne-groupes":
      return e.forme === "globale" ? "G" : "y";
  }
}

/** Valeur attendue à l'écran 2 (solution de l'équation). */
export function solution(e: ExerciceValeurManquante): number {
  return solutionsEquations(e)[0]!;
}

// ---------------------------------------------------------------------------------------------
// Types d'écrans (compatibles avec les composants partagés de gen108)
// ---------------------------------------------------------------------------------------------

export interface PiegeChamp {
  valeur: number;
  message: string;
}

export interface Champ {
  id: string;
  libelle: FragmentConsigne[];
  unite: string;
  cible: number;
  pieges: PiegeChamp[];
  messageSiFaux?: string;
}

export type Ecran =
  | { type: "choix"; titre: string; consigne: FragmentConsigne[]; options: FragmentConsigne[][]; bonne: number; aides: FragmentConsigne[][]; messageFaux: string }
  | { type: "champs"; titre: string; consigne: FragmentConsigne[]; champs: Champ[]; aides: FragmentConsigne[][]; reponse: FragmentConsigne[] };

function pieges(cible: number, liste: (PiegeChamp | false | null)[]): PiegeChamp[] {
  const vus: number[] = [];
  const resultat: PiegeChamp[] = [];
  for (const p of liste) {
    if (!p || !Number.isFinite(p.valeur)) continue;
    const v = arrondi9(p.valeur);
    if (Math.abs(v - cible) < 1e-9 || vus.some((w) => Math.abs(w - v) < 1e-9)) continue;
    vus.push(v);
    resultat.push({ valeur: v, message: p.message });
  }
  return resultat;
}

// ---------------------------------------------------------------------------------------------
// Écran 1
// ---------------------------------------------------------------------------------------------

const FORMULE_MOYENNE = "\\bar{x} = \\dfrac{\\Sigma(x_i \\cdot n_i)}{\\Sigma n_i}";

function consigneEquation(e: ExerciceValeurManquante): FragmentConsigne[] {
  switch (e.variante) {
    case "note-a-obtenir":
      return [texte("On note "), latex("x"), texte(` la note qui manque. Quelle équation traduit « la moyenne vaut ${note20(e.cible)} » ?`)];
    case "effectif-manquant":
      return [texte("On note "), latex("k"), texte(" l'effectif effacé (le « ? » du tableau). Quelle équation traduit l'information donnée sur la moyenne ?")];
    case "valeur-pour-mediane": {
      const c = contexteTableau(e.contexte);
      const cible = c.valeurTexte(e.valeurs[e.indexCible]!);
      const fin =
        e.forme === "haut"
          ? ` pour laquelle la médiane devient tout juste ${cible} (le seuil tombe alors exactement sur un effectif cumulé) ?`
          : `, la valeur limite pour laquelle l'effectif cumulé de ${cible} est exactement égal au seuil ?`;
      return [texte("On ajoute "), latex("k"), texte(` ${c.groupe(valeurAjoutee(e))}. Quelle équation donne la valeur de `), latex("k"), texte(fin)];
    }
    case "moyenne-groupes":
      return e.forme === "globale"
        ? [texte("On note "), latex("G"), texte(" la moyenne des deux groupes réunis. Quelle formule permet de la calculer ?")]
        : [texte("On note "), latex("y"), texte(` la moyenne qui manque. Quelle équation traduit l'information donnée sur l'ensemble des deux groupes ?`)];
  }
}

function aidesEquation(e: ExerciceValeurManquante): FragmentConsigne[][] {
  switch (e.variante) {
    case "note-a-obtenir":
      return e.forme === "sans-coef"
        ? [
            [texte("La moyenne est la somme de toutes les notes, divisée par le nombre de notes : "), latex("\\bar{x} = \\dfrac{\\Sigma x_i}{n}")],
            [texte("La note qui manque compte aussi : elle s'ajoute aux autres au numérateur, et elle augmente de 1 le nombre de notes au dénominateur.")],
          ]
        : [
            [texte("La moyenne pondérée est la somme des notes multipliées par leur coefficient, divisée par la somme des coefficients : "), latex(FORMULE_MOYENNE)],
            [texte(`La note qui manque a elle aussi son coefficient (${e.coefDernier}) : il la multiplie au numérateur, et il compte dans la somme des coefficients au dénominateur.`)],
          ];
    case "effectif-manquant": {
      const { somme, n } = sommesConnues(e);
      return [
        [texte("La moyenne d'un tableau d'effectifs : "), latex(FORMULE_MOYENNE)],
        [texte("Sans la ligne « ? », le tableau donne "), latex(`\\Sigma(x_i \\cdot n_i) = ${somme}`), texte(" et "), latex(`\\Sigma n_i = ${n}`), texte(". La ligne « ? » ajoute encore son produit au numérateur et son effectif au dénominateur.")],
      ];
    }
    case "valeur-pour-mediane": {
      const c = contexteTableau(e.contexte);
      const cible = c.valeurTexte(e.valeurs[e.indexCible]!);
      return [
        [texte("Règle du seuil : la médiane est la première valeur dont l'effectif cumulé dépasse strictement la moitié de l'effectif total : "), latex("\\dfrac{n}{2}")],
        e.forme === "haut"
          ? [texte(`Les valeurs ajoutées sont plus grandes que ${cible} : elles augmentent l'effectif total (donc le seuil), mais pas l'effectif cumulé des valeurs plus petites. L'effectif total devient : `), latex("n + k")]
          : [texte(`Les valeurs ajoutées sont plus petites que ${cible} : elles augmentent l'effectif total ET l'effectif cumulé de ${cible}. L'effectif total devient : `), latex("n + k")],
      ];
    }
    case "moyenne-groupes":
      return [
        [texte("Pour réunir deux groupes, il faut d'abord la somme de toutes les valeurs. La somme des valeurs d'un groupe vaut son effectif fois sa moyenne : "), latex("\\Sigma x_i = n \\times \\bar{x}")],
        [texte("On divise ensuite la somme totale par le nombre total d'individus — pas par 2 : les deux groupes n'ont pas la même taille.")],
      ];
  }
}

function ecranEquation(e: ExerciceValeurManquante): Ecran {
  const eqs = equations(e);
  return {
    type: "choix",
    titre: TITRES_ECRANS[0]!,
    consigne: consigneEquation(e),
    options: e.ordreEquations.map((i) => [latex(eqs[i]!)]),
    bonne: e.ordreEquations.indexOf(0),
    aides: aidesEquation(e),
    messageFaux: "Ce n'était pas la bonne équation.",
  };
}

// ---------------------------------------------------------------------------------------------
// Écran 2
// ---------------------------------------------------------------------------------------------

export function uniteSolution(e: ExerciceValeurManquante): string {
  switch (e.variante) {
    case "note-a-obtenir":
      return "/20";
    case "effectif-manquant":
    case "valeur-pour-mediane":
      return contexteTableau(e.contexte).population;
    case "moyenne-groupes":
      return contexteGroupes(e.contexte).unite;
  }
}

/** La solution avec son unité, en texte (« 13,5/20 », « 7 familles », « 162 cm »). */
export function solutionTexte(e: ExerciceValeurManquante, v: number = solution(e)): string {
  switch (e.variante) {
    case "note-a-obtenir":
      return note20(v);
    case "effectif-manquant":
    case "valeur-pour-mediane":
      return `${nombreTexte(v)} ${contexteTableau(e.contexte).population}`;
    case "moyenne-groupes":
      return valeurGroupe(contexteGroupes(e.contexte), v);
  }
}

/** Première étape de résolution (aide 2, corrigé) : l'équation sans dénominateur. */
export function equationSansDenominateur(e: ExerciceValeurManquante): string {
  switch (e.variante) {
    case "note-a-obtenir": {
      const total = e.coefs.reduce((s, c) => s + c, 0) + e.coefDernier;
      return `${produitsNote(e)} + ${terme(e.coefDernier, "x")} = ${nombreLatex(e.cible)} \\times ${total}`;
    }
    case "effectif-manquant": {
      const { somme, n } = sommesConnues(e);
      return `${somme} + ${e.valeurs[e.indexInconnu]}\\,k = ${nombreLatex(e.moyenne)} \\times (${n} + k)`;
    }
    case "valeur-pour-mediane": {
      const cum = cumules(e.effectifs);
      const s = cum[cum.length - 1]!;
      return e.forme === "haut" ? `${s} + k = 2 \\times ${cum[e.indexCible - 1]}` : `2 \\times (${cum[e.indexCible]} + k) = ${s} + k`;
    }
    case "moyenne-groupes":
      if (e.forme === "globale") return `G = \\dfrac{${nombreLatex(e.n1 * e.m1)} + ${nombreLatex(e.n2 * e.m2)}}{${e.n1 + e.n2}}`;
      return `${e.n1} \\times ${nombreLatex(e.m1)} + ${e.n2}\\,y = ${nombreLatex(e.globale)} \\times ${e.n1 + e.n2}`;
  }
}

/** Résolution complète, en une chaîne d'équivalences (corrigé). */
export function resolutionLatex(e: ExerciceValeurManquante): string {
  switch (e.variante) {
    case "note-a-obtenir": {
      const total = e.coefs.reduce((s, c) => s + c, 0) + e.coefDernier;
      const somme = arrondi9(e.notes.reduce((s, n, i) => s + n * e.coefs[i]!, 0));
      const mc = arrondi9(e.cible * total);
      const diff = arrondi9(mc - somme);
      const debut = `${equationSansDenominateur(e)} \\iff ${nombreLatex(somme)} + ${terme(e.coefDernier, "x")} = ${nombreLatex(mc)}`;
      if (e.coefDernier === 1) return `${debut} \\iff x = ${nombreLatex(e.inconnue)}`;
      return `${debut} \\iff ${e.coefDernier}\\,x = ${nombreLatex(diff)} \\iff x = ${nombreLatex(e.inconnue)}`;
    }
    case "effectif-manquant": {
      const { somme, n } = sommesConnues(e);
      const v = e.valeurs[e.indexInconnu]!;
      const m = e.moyenne;
      const mn = arrondi9(m * n);
      const k = e.effectifs[e.indexInconnu]!;
      const developpe = `${somme} + ${v}\\,k = ${nombreLatex(mn)} + ${nombreLatex(m)}\\,k`;
      const regroupe = v > m ? `${nombreLatex(arrondi9(v - m))}\\,k = ${nombreLatex(arrondi9(mn - somme))}` : `${nombreLatex(arrondi9(somme - mn))} = ${nombreLatex(arrondi9(m - v))}\\,k`;
      return `${equationSansDenominateur(e)} \\iff ${developpe} \\iff ${regroupe} \\iff k = ${k}`;
    }
    case "valeur-pour-mediane": {
      const cum = cumules(e.effectifs);
      const s = cum[cum.length - 1]!;
      if (e.forme === "haut") return `${equationSansDenominateur(e)} = ${2 * cum[e.indexCible - 1]!} \\iff k = ${e.k0}`;
      const c = cum[e.indexCible]!;
      return `${equationSansDenominateur(e)} \\iff ${2 * c} + 2\\,k = ${s} + k \\iff k = ${e.k0}`;
    }
    case "moyenne-groupes": {
      const p1 = arrondi9(e.n1 * e.m1);
      const n = e.n1 + e.n2;
      if (e.forme === "globale") return `${equationSansDenominateur(e)} = \\dfrac{${nombreLatex(arrondi9(p1 + e.n2 * e.m2))}}{${n}} = ${nombreLatex(e.globale)}`;
      const gn = arrondi9(e.globale * n);
      return `${equationSansDenominateur(e)} \\iff ${nombreLatex(p1)} + ${e.n2}\\,y = ${nombreLatex(gn)} \\iff ${e.n2}\\,y = ${nombreLatex(arrondi9(gn - p1))} \\iff y = ${nombreLatex(e.m2)}`;
    }
  }
}

const MESSAGES_PIEGES: Record<string, string[]> = {
  "note-a-obtenir:sans-coef": [
    "",
    "C'est la solution d'une équation où le nombre de notes n'a pas été mis à jour : avec la note qui manque, il y en a une de plus.",
    "Tu as fait la moyenne de deux moyennes : la note qui manque ne pèse pas autant que toutes les autres réunies.",
    "On a oublié de diviser par le nombre de notes : une moyenne est un quotient.",
  ],
  "note-a-obtenir:avec-coef": [
    "",
    "Le coefficient de la dernière épreuve doit aussi compter dans la somme des coefficients, au dénominateur.",
    "La note qui manque doit être multipliée par son coefficient — ou, ce qui revient au même, il reste à diviser par ce coefficient.",
    "Les coefficients ont été oubliés : chaque note doit être multipliée par son coefficient.",
  ],
  "effectif-manquant:effectif": [
    "",
    "L'effectif total n'a pas été mis à jour : les individus de la ligne « ? » comptent aussi au dénominateur.",
    "Au numérateur, la ligne « ? » apporte le produit de sa valeur par son effectif, pas l'effectif seul.",
    "La ligne « ? » a été oubliée au numérateur : elle apporte elle aussi un produit valeur × effectif.",
  ],
  "valeur-pour-mediane:haut": [
    "",
    "Le seuil doit atteindre l'effectif cumulé de la valeur JUSTE AVANT la médiane voulue, pas celui de la médiane voulue elle-même.",
    "Les valeurs ajoutées sont plus grandes : elles ne comptent pas dans l'effectif cumulé des valeurs plus petites.",
    "Le seuil de la médiane est la MOITIÉ de l'effectif total.",
  ],
  "valeur-pour-mediane:bas": [
    "",
    "Les valeurs ajoutées sont plus petites : elles comptent aussi dans l'effectif cumulé de la médiane voulue.",
    "Il faut l'effectif cumulé de la médiane voulue elle-même, pas celui de la valeur juste avant.",
    "L'effectif total n'a pas été mis à jour : les valeurs ajoutées comptent aussi dans l'effectif total, donc dans le seuil.",
  ],
  "moyenne-groupes:globale": [
    "",
    "C'est la moyenne des deux moyennes : elle ne tient pas compte de la taille des groupes.",
    "Il faut diviser par le nombre total d'individus, pas par 2.",
    "Les effectifs ont été échangés : chaque moyenne doit être multipliée par l'effectif de SON groupe.",
  ],
  "moyenne-groupes:groupe": [
    "",
    "Tu as utilisé la moyenne des deux moyennes : elle ne tient pas compte de la taille des groupes.",
    "La moyenne cherchée doit être multipliée par l'effectif de son groupe.",
    "Au dénominateur, il faut l'effectif total des deux groupes.",
  ],
};

function cleForme(e: ExerciceValeurManquante): string {
  return `${e.variante}:${e.forme}`;
}

function piegesSolution(e: ExerciceValeurManquante): PiegeChamp[] {
  const sols = solutionsEquations(e);
  const messages = MESSAGES_PIEGES[cleForme(e)]!;
  const liste: (PiegeChamp | null)[] = sols.slice(1).map((v, i) => (v === null ? null : { valeur: v, message: messages[i + 1]! }));
  if (e.variante === "valeur-pour-mediane") {
    const msg = "Ici, on demande la solution EXACTE de l'équation (l'égalité entre le seuil et l'effectif cumulé). Tu concluras à l'étape suivante.";
    liste.push({ valeur: e.k0 + 1, message: msg }, { valeur: e.k0 - 1, message: msg });
  }
  if (e.variante === "note-a-obtenir" && e.forme === "avec-coef") {
    // Oubli de diviser par la somme des coefficients après « M × total ».
    const somme = e.notes.reduce((s, n, i) => s + n * e.coefs[i]!, 0);
    liste.push({ valeur: (e.cible - somme) / e.coefDernier, message: "Il faut multiplier la moyenne visée par la somme des coefficients : c'est le total de points pondérés à atteindre." });
  }
  return pieges(solution(e), liste);
}

function consigneResolution(e: ExerciceValeurManquante): FragmentConsigne[] {
  const l = inconnue(e);
  if (e.variante === "valeur-pour-mediane") return [texte("Résous l'équation : pour quelle valeur de "), latex("k"), texte(" l'égalité est-elle exactement vraie ?")];
  if (e.variante === "moyenne-groupes" && e.forme === "globale") return [texte("Calcule "), latex("G"), texte(", avec son unité.")];
  if (e.variante === "note-a-obtenir") return [texte("Résous l'équation et donne la valeur exacte de "), latex(l), texte(", quelle qu'elle soit.")];
  return [texte("Résous l'équation et donne la valeur exacte de "), latex(l), texte(".")];
}

function aidesResolution(e: ExerciceValeurManquante): FragmentConsigne[][] {
  if (e.variante === "moyenne-groupes" && e.forme === "globale") {
    return [
      [texte("Calcule d'abord chaque produit effectif × moyenne : c'est la somme des valeurs de chaque groupe. Le dénominateur est l'effectif total : "), latex(`${e.n1} + ${e.n2} = ${e.n1 + e.n2}`)],
      [texte("Avec les produits calculés, il reste une division : "), latex(equationSansDenominateur(e))],
    ];
  }
  if (e.variante === "valeur-pour-mediane") {
    return [
      [texte("Débarrasse-toi de la fraction en multipliant les deux membres par 2, puis isole "), latex("k"), texte(".")],
      [texte("Après multiplication par 2 : "), latex(equationSansDenominateur(e))],
    ];
  }
  return [
    [texte("Multiplie les deux membres par le dénominateur : la fraction disparaît. Isole ensuite l'inconnue.")],
    [texte("En multipliant les deux membres par le dénominateur, on obtient : "), latex(equationSansDenominateur(e))],
  ];
}

function ecranResolution(e: ExerciceValeurManquante): Ecran {
  const l = inconnue(e);
  const v = solution(e);
  return {
    type: "champs",
    titre: TITRES_ECRANS[1]!,
    consigne: consigneResolution(e),
    champs: [{ id: "solution", libelle: [latex(`${l} =`)], unite: uniteSolution(e), cible: v, pieges: piegesSolution(e) }],
    aides: aidesResolution(e),
    reponse: [latex(`${l} = ${nombreLatex(v)}`), texte(` (${solutionTexte(e, v)})`)],
  };
}

// ---------------------------------------------------------------------------------------------
// Écran 3 — conclusion (indice 0 : la bonne)
// ---------------------------------------------------------------------------------------------

function conclusionsNote(e: ExerciceNote): FragmentConsigne[][] {
  const x = note20(e.inconnue);
  const m = note20(e.cible);
  const il = pronom(e);
  const Il = majuscule(il);
  if (e.possible) {
    return [
      [texte(`${Il} doit obtenir au moins ${x} : avec exactement ${x}, sa moyenne vaut ${m} ; avec plus, elle dépasse ${m}. C'est possible.`)],
      [texte(`${Il} doit obtenir au plus ${x} : avec une note plus haute, sa moyenne dépasserait ${m}.`)],
      [texte(`C'est impossible : il faudrait une note supérieure à 20/20.`)],
      [texte(`Il lui suffit d'obtenir ${m}, la moyenne qu'${il} vise.`)],
    ];
  }
  return [
    [texte(`C'est impossible : il faudrait ${x}, or une note ne dépasse pas 20/20. Même avec 20/20, ${il} n'atteindrait pas ${m} de moyenne.`)],
    [texte(`${Il} doit obtenir au moins ${x} : c'est possible ${il === "il" ? "s'il" : "si elle"} travaille assez.`)],
    [texte(`Il lui suffit d'obtenir 20/20 : sa moyenne vaudra alors exactement ${m}.`)],
    [texte(`Il lui suffit d'obtenir ${m}, la moyenne qu'${il} vise.`)],
  ];
}

function conclusionsEffectif(e: ExerciceEffectif): FragmentConsigne[][] {
  const c = contexteTableau(e.contexte);
  const v = e.valeurs[e.indexInconnu]!;
  const k = e.effectifs[e.indexInconnu]!;
  const { n } = sommesConnues(e);
  return [
    [texte(`Il y a ${k} ${c.groupe(v)} : l'enquête porte donc sur ${n + k} ${c.population} en tout.`)],
    [texte(`Il y a ${k} ${c.groupe(v)} : l'enquête porte donc sur ${n} ${c.population} en tout.`)],
    [texte(`Il y a ${v * k} ${c.groupe(v)} : l'enquête porte donc sur ${n + v * k} ${c.population} en tout.`)],
    [texte(`Il y a ${n + k} ${c.groupe(v)} : c'est l'effectif total de la série.`)],
  ];
}

function conclusionsMediane(e: ExerciceMediane): FragmentConsigne[][] {
  const c = contexteTableau(e.contexte);
  const cum = cumules(e.effectifs);
  const s = cum[cum.length - 1]!;
  const cible = c.valeurTexte(e.valeurs[e.indexCible]!);
  const groupe = c.groupe(valeurAjoutee(e));
  const k0 = e.k0;
  if (e.forme === "haut") {
    const avant = c.valeurTexte(e.valeurs[e.indexCible - 1]!);
    const C = cum[e.indexCible - 1]!;
    return [
      [texte(`Il faut en ajouter au moins ${k0} : le seuil vaut alors ${nombreTexte((s + k0) / 2)}, exactement l'effectif cumulé de ${avant}, qui ne le dépasse donc pas strictement ; la première valeur qui le dépasse est ${cible}.`)],
      [texte(`Il faut en ajouter au moins ${k0 + 1} : avec ${k0}, l'effectif cumulé de ${avant} (${C}) atteint le seuil, donc la médiane serait encore ${avant}.`)],
      [texte(`Il faut en ajouter exactement ${k0} : avec un de plus, la médiane changerait encore.`)],
      [texte(`Il suffit d'en ajouter un seul : dès qu'on ajoute une grande valeur, la médiane monte jusqu'à ${cible}.`)],
    ];
  }
  const apres = c.valeurTexte(e.valeurs[e.indexCible + 1]!);
  return [
    [texte(`Il faut en ajouter au moins ${k0 + 1} : avec ${k0}, l'effectif cumulé de ${cible} serait exactement égal au seuil, sans le dépasser strictement, et la médiane serait encore ${apres}.`)],
    [texte(`Il faut en ajouter au moins ${k0} : l'effectif cumulé de ${cible} atteint alors le seuil, et c'est suffisant.`)],
    [texte(`Il faut en ajouter exactement ${k0 + 1} : avec davantage de ${groupe}, la médiane descendrait encore.`)],
    [texte(`Il suffit d'en ajouter un seul : dès qu'on ajoute une petite valeur, la médiane descend jusqu'à ${cible}.`)],
  ];
}

function conclusionsGroupes(e: ExerciceGroupes): FragmentConsigne[][] {
  const c = contexteGroupes(e.contexte);
  const grand = e.n1 > e.n2 ? c.groupe1 : c.groupe2;
  const petit = e.n1 > e.n2 ? c.groupe2 : c.groupe1;
  const g = valeurGroupe(c, e.globale);
  if (e.forme === "globale") {
    return [
      [texte(`La moyenne de l'ensemble vaut ${g} : elle est plus proche de la moyenne ${deArticle(grand)}, le groupe le plus nombreux, qui pèse davantage.`)],
      [texte(`La moyenne de l'ensemble vaut ${valeurGroupe(c, arrondi9((e.m1 + e.m2) / 2))} : c'est la moyenne des deux moyennes.`)],
      [texte(`La moyenne de l'ensemble vaut ${g} : elle est plus proche de la moyenne ${deArticle(petit)}, le groupe le moins nombreux.`)],
      [texte(`La moyenne de l'ensemble vaut ${g} : elle est exactement au milieu des deux moyennes.`)],
    ];
  }
  const y = valeurGroupe(c, e.m2);
  return [
    [texte(`Pour ${c.groupe2}, la moyenne est de ${y} : la moyenne de l'ensemble (${g}) est bien comprise entre les deux moyennes, plus près de celle ${deArticle(grand)}, le groupe le plus nombreux.`)],
    [texte(`Pour ${c.groupe2}, la moyenne est de ${valeurGroupe(c, arrondi9(2 * e.globale - e.m1))} : la moyenne de l'ensemble est exactement au milieu des deux moyennes.`)],
    [texte(`Pour ${c.groupe2}, la moyenne est de ${g}, comme pour l'ensemble : réunir deux groupes ne change pas leur moyenne.`)],
    [texte(`Pour ${c.groupe2}, la moyenne est de ${y} : la moyenne de l'ensemble est plus près de celle ${deArticle(petit)}, le groupe le moins nombreux.`)],
  ];
}

export function conclusions(e: ExerciceValeurManquante): FragmentConsigne[][] {
  switch (e.variante) {
    case "note-a-obtenir":
      return conclusionsNote(e);
    case "effectif-manquant":
      return conclusionsEffectif(e);
    case "valeur-pour-mediane":
      return conclusionsMediane(e);
    case "moyenne-groupes":
      return conclusionsGroupes(e);
  }
}

function aidesConclusion(e: ExerciceValeurManquante): FragmentConsigne[][] {
  switch (e.variante) {
    case "note-a-obtenir":
      return [[texte("Une note est comprise entre 0 et 20.")], [texte("Si la dernière note est plus haute que la solution trouvée, la moyenne monte-t-elle ou descend-elle ?")]];
    case "effectif-manquant":
      return [[texte("L'effectif total compte toutes les lignes du tableau, y compris celle du « ? ».")], [texte("L'effectif trouvé compte des individus ; le produit valeur × effectif compte autre chose.")]];
    case "valeur-pour-mediane":
      return [
        [texte("Teste la solution de l'équation : calcule le nouveau seuil et compare-le aux effectifs cumulés. « Égal » ne suffit pas : il faut dépasser strictement.")],
        [texte("Teste aussi un nombre plus grand de valeurs ajoutées : la médiane change-t-elle tout de suite ?")],
      ];
    case "moyenne-groupes":
      return [
        [texte("La moyenne de deux groupes réunis est toujours comprise entre les deux moyennes.")],
        [texte("Le groupe qui a le plus d'individus pèse le plus : la moyenne de l'ensemble est plus proche de la sienne.")],
      ];
  }
}

function ecranConclusion(e: ExerciceValeurManquante): Ecran {
  const phrases = conclusions(e);
  return {
    type: "choix",
    titre: TITRES_ECRANS[2]!,
    consigne: [texte("Quelle phrase conclut correctement, dans le contexte de l'énoncé ?")],
    options: e.ordreConclusions.map((i) => phrases[i]!),
    bonne: e.ordreConclusions.indexOf(0),
    aides: aidesConclusion(e),
    messageFaux: "Ce n'était pas la bonne conclusion.",
  };
}

export function ecrans(e: ExerciceValeurManquante): Ecran[] {
  return [ecranEquation(e), ecranResolution(e), ecranConclusion(e)];
}

// ---------------------------------------------------------------------------------------------
// Papier : justification de l'équation, conclusion brève, piège
// ---------------------------------------------------------------------------------------------

/** Pourquoi cette équation (corrigé, étape a). */
export function justificationEquation(e: ExerciceValeurManquante): FragmentConsigne[] {
  const eq = latex(equations(e)[0]!);
  switch (e.variante) {
    case "note-a-obtenir":
      return e.forme === "sans-coef"
        ? [texte(`Avec la note qui manque, il y a ${e.notes.length + 1} notes ; leur moyenne doit valoir ${note20(e.cible)} : `), eq]
        : [texte("Moyenne pondérée : chaque note est multipliée par son coefficient, et on divise par la somme de TOUS les coefficients (celui de la dernière épreuve compris) : "), eq];
    case "effectif-manquant": {
      const { somme, n } = sommesConnues(e);
      const v = e.valeurs[e.indexInconnu]!;
      return [texte("Sans la ligne « ? » : "), latex(`\\Sigma(x_i \\cdot n_i) = ${somme}`), texte(" et "), latex(`\\Sigma n_i = ${n}`), texte(". La ligne « ? » ajoute "), latex(`${v}\\,k`), texte(" au numérateur et "), latex("k"), texte(" au dénominateur : "), eq];
    }
    case "valeur-pour-mediane": {
      const c = contexteTableau(e.contexte);
      const cum = cumules(e.effectifs);
      const s = cum[cum.length - 1]!;
      const effCum = `effectifs cumulés : ${cum.join(" ; ")}`;
      if (e.forme === "haut") {
        return [
          texte(`Tableau des ${effCum} ; effectif total ${s}. Avec `),
          latex("k"),
          texte(` valeurs ajoutées (toutes plus grandes), l'effectif total devient `),
          latex(`${s} + k`),
          texte(` et l'effectif cumulé de ${c.valeurTexte(e.valeurs[e.indexCible - 1]!)} reste ${cum[e.indexCible - 1]}. La médiane passe à ${c.valeurTexte(e.valeurs[e.indexCible]!)} quand le seuil atteint cet effectif cumulé : `),
          eq,
        ];
      }
      return [
        texte(`Tableau des ${effCum} ; effectif total ${s}. Avec `),
        latex("k"),
        texte(` valeurs ajoutées (toutes plus petites), l'effectif total devient `),
        latex(`${s} + k`),
        texte(` et l'effectif cumulé de ${c.valeurTexte(e.valeurs[e.indexCible]!)} devient `),
        latex(`${cum[e.indexCible]} + k`),
        texte(". Il doit atteindre, puis dépasser, le seuil : "),
        eq,
      ];
    }
    case "moyenne-groupes":
      return e.forme === "globale"
        ? [texte("La somme des valeurs d'un groupe vaut son effectif fois sa moyenne ; on divise la somme totale par l'effectif total : "), eq]
        : [texte("Même formule que pour la moyenne de l'ensemble, avec la moyenne inconnue "), latex("y"), texte(" : "), eq];
  }
}

/** Conclusion courte (réponse brève du papier). */
export function conclusionBreve(e: ExerciceValeurManquante): string {
  switch (e.variante) {
    case "note-a-obtenir":
      return e.possible ? `au moins ${note20(e.inconnue)} : c'est possible.` : `il faudrait ${note20(e.inconnue)} : c'est impossible.`;
    case "effectif-manquant": {
      const c = contexteTableau(e.contexte);
      return `${e.effectifs[e.indexInconnu]} ${c.groupe(e.valeurs[e.indexInconnu]!)} (${sommesConnues(e).n + e.effectifs[e.indexInconnu]!} ${c.population} en tout).`;
    }
    case "valeur-pour-mediane":
      return `au moins ${e.kMin} ${contexteTableau(e.contexte).groupe(valeurAjoutee(e))}.`;
    case "moyenne-groupes":
      return e.forme === "globale" ? `${valeurGroupe(contexteGroupes(e.contexte), e.globale)}.` : `${valeurGroupe(contexteGroupes(e.contexte), e.m2)}.`;
  }
}

/** Ligne « Piège » du corrigé (ciblée sur l'instance). */
export function piegeCorrige(e: ExerciceValeurManquante): FragmentConsigne[] {
  const sols = solutionsEquations(e);
  switch (e.variante) {
    case "note-a-obtenir":
      return e.forme === "sans-coef"
        ? [texte(`Ne pas faire la moyenne de deux moyennes (moyenne des notes connues et note qui manque) : on trouverait ${note20(sols[2]!)}, mais la dernière note ne pèse pas autant que les ${EN_LETTRES[e.notes.length]} autres réunies.`)]
        : [texte(`Ne pas oublier le coefficient ${e.coefDernier} de la dernière épreuve au dénominateur${sols[1]! > 0 && sols[1]! <= 40 ? ` : on trouverait ${note20(sols[1]!)}` : ""}, et ne pas oublier de multiplier la note cherchée par ce coefficient.`)];
    case "effectif-manquant":
      return [texte(`Mettre à jour l'effectif total : diviser par ${sommesConnues(e).n} au lieu de `), latex(`${sommesConnues(e).n} + k`), texte(" donnerait "), latex(`k = ${nombreLatex(sols[1]!)}`), texte(Number.isInteger(arrondi9(sols[1]!)) && sols[1]! > 0 ? ", une valeur fausse." : ", qui n'est même pas un nombre entier positif d'individus.")];
    case "valeur-pour-mediane":
      return e.forme === "haut"
        ? [texte(`Avec ${e.k0} valeurs ajoutées, l'effectif cumulé de la valeur précédente est ÉGAL au seuil : il ne le dépasse pas strictement, la médiane est donc déjà la valeur suivante. Inutile d'en ajouter ${e.k0 + 1}.`)]
        : [texte(`Avec ${e.k0} valeurs ajoutées, l'effectif cumulé de la médiane voulue est seulement ÉGAL au seuil : il faut le dépasser strictement, donc en ajouter une de plus (${e.k0 + 1}).`)];
    case "moyenne-groupes":
      return e.forme === "globale"
        ? [texte(`Ne pas faire la moyenne des deux moyennes (${valeurGroupe(contexteGroupes(e.contexte), sols[1]!)}) : les groupes n'ont pas le même effectif.`)]
        : [texte(`Ne pas écrire que la moyenne de l'ensemble est la moyenne des deux moyennes : on trouverait ${valeurGroupe(contexteGroupes(e.contexte), sols[1]!)}.`)];
  }
}
