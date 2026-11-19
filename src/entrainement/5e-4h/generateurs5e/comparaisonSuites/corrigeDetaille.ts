import type { EtapeCorrection, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise } from "../../../export/corrigeTableau";
import type { ExerciceComparaisonSuites } from "../../core5e/comparaisonSuites.types";
import { formuleU, formuleV } from "../../ui5e/formatComparaisonSuites";
import { COURS_COMPARAISON, jf } from "../../ui5e/corrigeSuites1";

/**
 * Corrigé détaillé « comme au tableau » de 5gen18 (comparaison numérique de deux suites) — règle
 * `.claude/rules/feuilles-evaluations.md`. Étape a (tableau) : les deux formules de l'écran
 * (`formuleU`/`formuleV`), puis un bloc de calcul par rang du tableau (rang substitué, puissance à la
 * calculatrice arrondie à l'unité, ou produit et somme pour une suite arithmétique). Étape b
 * (conclusion) : la comparaison au rang qui précède la bascule et au rang de bascule, puis la
 * traduction en année ou en mois. SANS `docx`.
 */

type E = ExerciceComparaisonSuites;
const t = texte;
const f = latex;

/** Entier arrondi, groupes de milliers séparés par `\,` (même rendu que l'écran). */
function entierLatex(valeur: number): string {
  const n = Math.round(valeur);
  return (n < 0 ? "-" : "") + String(Math.abs(n)).replace(/\B(?=(\d{3})+(?!\d))/g, "\\,");
}
const coef = (pct: number) => (1 + pct / 100).toFixed(2).replace(".", "{,}");

/** Tableau n / Aₙ / Bₙ sur les 4 rangs de la fenêtre de l'écran, valeurs arrondies à l'unité. */
export function tableauComparaisonLatex(exercice: E): string {
  const rang = (tete: string, valeurs: string[]) => `${tete} & ${valeurs.join(" & ")}`;
  return (
    `\\begin{array}{c|${"c".repeat(exercice.nTable.length)}}` +
    `${rang("n", exercice.nTable.map(String))} \\\\ \\hline ` +
    `${rang("A_n", exercice.uTable.map(entierLatex))} \\\\ ` +
    `${rang("B_n", exercice.vTable.map(entierLatex))}` +
    "\\end{array}"
  );
}

function enAnnees(exercice: E): boolean {
  return exercice.contexte.periode === "an";
}
function ordinal(n: number): string {
  return n === 1 ? "1er" : `${n}e`;
}
/** Réponse dans les mots de la question (« À partir de 2027 » / « Au cours du 7e mois »). */
export function reponseTexteComparaison(exercice: E): string {
  const v = Math.round(exercice.traductionValeur);
  return enAnnees(exercice) ? `À partir de ${v}` : `Au cours du ${ordinal(v)} mois`;
}

/** Lignes d'un terme au rang k : géométrique (u₁ × c^(k−1) ≈ …) ou arithmétique (produit puis somme). */
function lignesTerme(nom: "A" | "B", k: number, valeur: number, geo: { u1: number; pct: number } | null, arith: { v1: number; d: number; signe: 1 | -1 } | null): LigneCalcul[] {
  if (geo) {
    return [ligne(`${nom}_{${k}}=${entierLatex(geo.u1)}\\times${coef(geo.pct)}^{${k - 1}}`, `on remplace n par ${k}`), ligne(`\\approx ${entierLatex(valeur)}`, "calculatrice, arrondi à l'unité")];
  }
  const a = arith!;
  const op = a.signe > 0 ? "+" : "-";
  return [
    ligne(`${nom}_{${k}}=${entierLatex(a.v1)}${op}${k - 1}\\times ${entierLatex(a.d)}`, `on remplace n par ${k}`),
    ligne(`=${entierLatex(a.v1)}${op}${entierLatex((k - 1) * a.d)}`, "on multiplie"),
    ligne(`=${entierLatex(valeur)}`),
  ];
}

function etapeTableau(e: E): EtapeCorrection[] {
  const sq = "a";
  const geoA = e.famille === "villesCroissance" ? { u1: e.u1, pct: e.tauxPct } : e.famille === "epargneCroissance" ? { u1: e.u1, pct: e.r1Pct } : null;
  const arithA = e.famille === "stockDemande" ? { v1: e.u1, d: e.d1, signe: -1 as const } : null;
  const geoB = e.famille === "epargneCroissance" ? { u1: e.v1, pct: e.r2Pct } : null;
  const arithB = e.famille === "villesCroissance" ? { v1: e.v1, d: e.d, signe: 1 as const } : e.famille === "stockDemande" ? { v1: e.v1, d: e.d2, signe: 1 as const } : null;
  const blocs = e.nTable.map((k, i) => calcul(sq, [...lignesTerme("A", k, e.uTable[i], geoA, arithA), ...lignesTerme("B", k, e.vTable[i], geoB, arithB)], [], `Rang n = ${k}`));
  const geometrique = e.famille !== "stockDemande";
  return [
    utilise(sq, [
      t("Une croissance de p % par période multiplie la grandeur par "),
      f("1+\\dfrac{p}{100}"),
      t(" (suite géométrique) ; une variation fixe l'augmente ou la diminue toujours du même nombre (suite arithmétique). Le rang 1 est la valeur de départ : "),
      f(formuleU(e)),
      t(" et "),
      f(formuleV(e)),
      t(` ${COURS_COMPARAISON}.`),
    ]),
    calcul(sq, [ligne(formuleU(e), "suite A"), ligne(formuleV(e), "suite B")], [], "Formules"),
    ...blocs,
    resultat(sq, [f(tableauComparaisonLatex(e))]),
    piege(
      sq,
      geometrique
        ? [t("L'exposant est n − 1 (rang 1 = valeur de départ), pas n : sinon tout le tableau est décalé d'un rang.")]
        : [t("La raison est multipliée par n − 1 (rang 1 = valeur de départ), pas par n.")],
    ),
  ];
}

function etapeConclusion(e: E): EtapeCorrection[] {
  const sq = "b";
  const i = e.nTable.indexOf(e.nSeuil);
  const nAvant = e.nTable[i - 1];
  const aDepasse = e.condition === "aDepasseB";
  const lignes: LigneCalcul[] = [];
  if (nAvant !== undefined) {
    const a1 = e.uTable[i - 1];
    const b1 = e.vTable[i - 1];
    lignes.push(ligne(aDepasse ? `A_{${nAvant}}<B_{${nAvant}}` : `B_{${nAvant}}<A_{${nAvant}}`, jf(`rang ${nAvant} : `, { l: aDepasse ? `${entierLatex(a1)}<${entierLatex(b1)}` : `${entierLatex(b1)}<${entierLatex(a1)}` }, ", pas encore")));
  }
  const a2 = e.uTable[i];
  const b2 = e.vTable[i];
  lignes.push(ligne(aDepasse ? `A_{${e.nSeuil}}>B_{${e.nSeuil}}` : `B_{${e.nSeuil}}>A_{${e.nSeuil}}`, jf(`rang ${e.nSeuil} : `, { l: aDepasse ? `${entierLatex(a2)}>${entierLatex(b2)}` : `${entierLatex(b2)}>${entierLatex(a2)}` }, ", premier dépassement")));
  lignes.push(ligne(`n=${e.nSeuil}`, "premier rang où la condition est vraie"));
  if (enAnnees(e)) {
    lignes.push(ligne(`\\text{année}=${e.anneeDepart}+(${e.nSeuil}-1)`, `le rang 1 correspond à ${e.anneeDepart}`));
    lignes.push(ligne(`=${Math.round(e.traductionValeur)}`));
  } else {
    lignes.push(ligne(`\\text{mois}=${e.nSeuil}`, "le rang n est le n-ième mois"));
  }
  const cond = aDepasse ? "A_n>B_n" : "B_n>A_n";
  const contraire = aDepasse ? "A_n\\leq B_n" : "B_n\\leq A_n";
  return [
    utilise(sq, [t("On descend le tableau : le rang cherché est le premier n tel que "), f(cond), t(" ; au rang précédent, on a encore "), f(contraire), t(` ${COURS_COMPARAISON}.`)]),
    calcul(sq, lignes),
    resultat(sq, [f(`n=${e.nSeuil}`), t(` : ${reponseTexteComparaison(e).replace(/^À/, "à").replace(/^Au/, "au")}.`)]),
    piege(
      sq,
      enAnnees(e)
        ? [t("Le rang 1 est l'année de départ : l'année cherchée est "), f(`${e.anneeDepart}+(n-1)`), t(", pas "), f(`${e.anneeDepart}+n`), t(".")]
        : [t("Le dépassement est strict : le rang cherché est le premier où "), f(cond), t(", pas le dernier où "), f(contraire), t(".")],
    ),
  ];
}

export function correctionDetailleeComparaisonSuites(exercice: E): EtapeCorrection[] {
  return [...etapeTableau(exercice), ...etapeConclusion(exercice)];
}

