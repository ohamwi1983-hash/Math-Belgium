import type { EtapeCorrection, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise } from "../../../export/corrigeTableau";
import type { ExerciceEffectif, ExerciceGroupes, ExerciceMediane, ExerciceNote, ExerciceValeurManquante } from "../../core/valeurManquante.types";
import { conclusions, ecrans, equations, inconnue, nombreLatex, piegeCorrige } from "../../ui/formatValeurManquante";
import { contexteTableau } from "../../moteur/contextesValeurManquante";
import { arrondi9, cumules, sommesConnues } from "./index";
import { COURS_MOYENNE, COURS_POSITION, egalOuEnviron, lignesSomme, produits, formulesInsecables } from "../../ui/corrigeStatistique2";

/**
 * Corrigé détaillé « comme au tableau » de gen109 (retrouver une valeur manquante) — règle
 * `.claude/rules/feuilles-evaluations.md`. Trois étapes = trois écrans : a) poser l'équation (les
 * quantités utiles calculées, puis l'équation de l'écran, `equations(e)[0]`), b) la résoudre (une
 * transformation par ligne), c) conclure (vérification dans le contexte : note ≤ 20, effectif total,
 * test du seuil de la médiane avec k₀ et k₀ + 1, moyenne entre les deux moyennes). Valeurs du
 * générateur et de l'écran (`ui/formatValeurManquante.ts`) ; partagé par l'adaptateur et l'appli.
 */

type E = ExerciceValeurManquante;
const n = nombreLatex;
const np = (v: number) => (v < 0 ? `(${n(v)})` : n(v));

function terme(coef: number, lettre: string): string {
  return coef === 1 ? lettre : `${coef}\\,${lettre}`;
}

// ---------------------------------------------------------------------------------------------
// a) Poser l'équation
// ---------------------------------------------------------------------------------------------

function lignesEquationNote(e: ExerciceNote): LigneCalcul[] {
  const eq = equations(e)[0]!;
  if (e.forme === "sans-coef") {
    return [ligne(`n=${e.notes.length}+1`, "les notes connues et celle qui manque"), ligne(`=${e.notes.length + 1}`), ligne(eq, "somme de toutes les notes ÷ nombre de notes = moyenne visée")];
  }
  const coefs = [...e.coefs, e.coefDernier];
  return [
    ligne(`\\Sigma\\,\\text{coef.}=${coefs.join("+")}`, "tous les coefficients, dernière épreuve comprise"),
    ligne(`=${coefs.reduce((s, c) => s + c, 0)}`),
    ligne(eq, "notes × coefficients, ÷ somme des coefficients"),
  ];
}

function lignesEquationEffectif(e: ExerciceEffectif): LigneCalcul[] {
  const { somme, n: nn } = sommesConnues(e);
  const autres = e.valeurs.map((_, i) => i).filter((i) => i !== e.indexInconnu);
  const p = produits(autres.map((i) => e.valeurs[i]!), autres.map((i) => e.effectifs[i]!));
  const v = e.valeurs[e.indexInconnu]!;
  return [
    ...lignesSomme("\\Sigma(x_i\\cdot n_i)", p.termes, p.valeurs, "sans la ligne « ? »"),
    ...lignesSomme("\\Sigma n_i", autres.map((i) => String(e.effectifs[i])), autres.map((i) => e.effectifs[i]!), "effectifs connus"),
    ligne(equations(e)[0]!, [texte("la ligne « ? » ajoute "), latex(`${v}\\,k`), texte(" au numérateur et "), latex("k"), texte(` au dénominateur (somme ${somme}, effectif ${nn})`)]),
  ];
}

function lignesCumules(e: ExerciceMediane, jusqua: number): LigneCalcul[] {
  const cum = cumules(e.effectifs);
  return e.valeurs.slice(0, jusqua + 1).map((v, i) => ligne(`N_{\\leq ${n(v)}}=${i === 0 ? "" : `${cum[i - 1]}+`}${e.effectifs[i]}${i === 0 ? "" : `=${cum[i]}`}`, i === 0 ? "effectif cumulé de la première valeur" : "on ajoute l'effectif de la valeur"));
}

function lignesEquationMediane(e: ExerciceMediane): LigneCalcul[] {
  const cum = cumules(e.effectifs);
  const s = cum[cum.length - 1]!;
  const j = e.indexCible;
  const c = contexteTableau(e.contexte);
  return [
    ...lignesCumules(e, e.forme === "haut" ? j : j),
    ligne(`n=${s}+k`, `effectif total avec les k ${e.forme === "haut" ? "grandes" : "petites"} valeurs ajoutées`),
    ligne(`\\dfrac{n}{2}=\\dfrac{${s}+k}{2}`, "seuil de la médiane"),
    e.forme === "haut"
      ? ligne(equations(e)[0]!, `le seuil atteint l'effectif cumulé de ${c.valeurTexte(e.valeurs[j - 1]!)}, qui ne change pas`)
      : ligne(equations(e)[0]!, `effectif cumulé de ${c.valeurTexte(e.valeurs[j]!)}, augmenté de k, égal au seuil`),
  ];
}

function lignesEquationGroupes(e: ExerciceGroupes): LigneCalcul[] {
  return [ligne(`n=${e.n1}+${e.n2}`, "effectif total des deux groupes"), ligne(`=${e.n1 + e.n2}`), ligne(equations(e)[0]!, "somme des valeurs (effectif × moyenne de chaque groupe) ÷ effectif total")];
}

function utiliseEquation(e: E) {
  if (e.variante === "valeur-pour-mediane") {
    return utilise("a", [texte("Règle du seuil : la médiane est la première valeur dont l'effectif cumulé dépasse strictement la moitié de l'effectif total, "), latex("\\dfrac{n}{2}"), texte(` ${COURS_POSITION}. La médiane change de valeur quand le seuil et l'effectif cumulé concerné deviennent égaux.`)]);
  }
  if (e.variante === "moyenne-groupes") return utilise("a", [texte("La somme des valeurs d'un groupe vaut son effectif fois sa moyenne : "), latex("\\Sigma x_i = n \\times \\bar{x}"), texte(` ; la moyenne de l'ensemble est la somme totale divisée par l'effectif total ${COURS_MOYENNE}.`)]);
  return utilise("a", [texte("Moyenne pondérée : "), latex("\\bar{x} = \\dfrac{\\Sigma(x_i \\cdot n_i)}{\\Sigma n_i}"), texte(` — la donnée qui manque compte au numérateur ET au dénominateur ${COURS_MOYENNE}.`)]);
}

function etapeEquation(e: E): EtapeCorrection[] {
  const lignes =
    e.variante === "note-a-obtenir" ? lignesEquationNote(e) : e.variante === "effectif-manquant" ? lignesEquationEffectif(e) : e.variante === "valeur-pour-mediane" ? lignesEquationMediane(e) : lignesEquationGroupes(e);
  return [
    utiliseEquation(e),
    calcul("a", lignes),
    resultat("a", [latex(equations(e)[0]!)]),
    ...(e.variante === "valeur-pour-mediane" ? [] : [piege("a", piegeCorrige(e))]),
  ];
}

// ---------------------------------------------------------------------------------------------
// b) Résoudre
// ---------------------------------------------------------------------------------------------

function lignesResolutionNote(e: ExerciceNote): LigneCalcul[] {
  const total = e.coefs.reduce((s, c) => s + c, 0) + e.coefDernier;
  const somme = arrondi9(e.notes.reduce((s, x, i) => s + x * e.coefs[i]!, 0));
  const mc = arrondi9(e.cible * total);
  const diff = arrondi9(mc - somme);
  const produitsNote = e.notes.map((x, i) => (e.forme === "avec-coef" ? `${e.coefs[i]} \\times ${n(x)}` : n(x))).join("+");
  const lignes: LigneCalcul[] = [
    ligne(equations(e)[0]!, "équation de l'étape 1"),
    ligne(`${produitsNote}+${terme(e.coefDernier, "x")}=${n(e.cible)}\\times ${total}`, `on multiplie les deux membres par ${total}`),
    ligne(`${n(somme)}+${terme(e.coefDernier, "x")}=${n(mc)}`, "on calcule chaque membre"),
    ligne(`${terme(e.coefDernier, "x")}=${n(mc)}-${n(somme)}`, `on soustrait ${somme}`.replace(".", ",")),
    ligne(`=${n(diff)}`),
  ];
  if (e.coefDernier !== 1) lignes.push(ligne(`x=\\dfrac{${n(diff)}}{${e.coefDernier}}`, `on divise par ${e.coefDernier}`), ligne(`=${n(e.inconnue)}`));
  return lignes;
}

function lignesResolutionEffectif(e: ExerciceEffectif): LigneCalcul[] {
  const { somme, n: nn } = sommesConnues(e);
  const v = e.valeurs[e.indexInconnu]!;
  const m = e.moyenne;
  const mn = arrondi9(m * nn);
  const k = e.effectifs[e.indexInconnu]!;
  const lignes: LigneCalcul[] = [
    ligne(equations(e)[0]!, "équation de l'étape 1"),
    ligne(`${somme}+${v}\\,k=${n(m)}\\times (${nn}+k)`, `on multiplie les deux membres par ${nn} + k`),
    ligne(`${somme}+${v}\\,k=${n(mn)}+${n(m)}\\,k`, "on distribue"),
  ];
  if (v > m) {
    lignes.push(ligne(`${v}\\,k-${n(m)}\\,k=${n(mn)}-${somme}`, "les termes en k à gauche, les nombres à droite"), ligne(`${n(arrondi9(v - m))}\\,k=${n(arrondi9(mn - somme))}`), ligne(`k=\\dfrac{${n(arrondi9(mn - somme))}}{${n(arrondi9(v - m))}}`, `on divise par ${String(arrondi9(v - m)).replace(".", ",")}`), ligne(`=${k}`));
  } else {
    lignes.push(ligne(`${somme}-${n(mn)}=${n(m)}\\,k-${v}\\,k`, "les termes en k à droite, les nombres à gauche"), ligne(`${n(arrondi9(somme - mn))}=${n(arrondi9(m - v))}\\,k`), ligne(`k=\\dfrac{${n(arrondi9(somme - mn))}}{${n(arrondi9(m - v))}}`, `on divise par ${String(arrondi9(m - v)).replace(".", ",")}`), ligne(`=${k}`));
  }
  return lignes;
}

function lignesResolutionMediane(e: ExerciceMediane): LigneCalcul[] {
  const cum = cumules(e.effectifs);
  const s = cum[cum.length - 1]!;
  if (e.forme === "haut") {
    const c = cum[e.indexCible - 1]!;
    return [
      ligne(equations(e)[0]!, "équation de l'étape 1"),
      ligne(`${s}+k=2\\times ${c}`, "on multiplie les deux membres par 2"),
      ligne(`=${2 * c}`),
      ligne(`k=${2 * c}-${s}`, `on soustrait ${s}`),
      ligne(`=${e.k0}`),
    ];
  }
  const c = cum[e.indexCible]!;
  return [
    ligne(equations(e)[0]!, "équation de l'étape 1"),
    ligne(`2\\times (${c}+k)=${s}+k`, "on multiplie les deux membres par 2"),
    ligne(`${2 * c}+2\\,k=${s}+k`, "on distribue"),
    ligne(`2\\,k-k=${s}-${2 * c}`, "les termes en k à gauche, les nombres à droite"),
    ligne(`k=${e.k0}`),
  ];
}

function lignesResolutionGroupes(e: ExerciceGroupes): LigneCalcul[] {
  const p1 = arrondi9(e.n1 * e.m1);
  const nn = e.n1 + e.n2;
  if (e.forme === "globale") {
    const p2 = arrondi9(e.n2 * e.m2);
    return [
      ligne(equations(e)[0]!, "formule de l'étape 1"),
      ligne(`=\\dfrac{${n(p1)}+${n(p2)}}{${nn}}`, "on calcule chaque produit effectif × moyenne"),
      ligne(`=\\dfrac{${n(arrondi9(p1 + p2))}}{${nn}}`),
      ligne(`=${n(e.globale)}`),
    ];
  }
  const gn = arrondi9(e.globale * nn);
  const diff = arrondi9(gn - p1);
  return [
    ligne(equations(e)[0]!, "équation de l'étape 1"),
    ligne(`${e.n1}\\times ${n(e.m1)}+${e.n2}\\,y=${n(e.globale)}\\times ${nn}`, `on multiplie les deux membres par ${nn}`),
    ligne(`${n(p1)}+${e.n2}\\,y=${n(gn)}`, "on calcule chaque membre"),
    ligne(`${e.n2}\\,y=${n(gn)}-${n(p1)}`, "on soustrait"),
    ligne(`=${n(diff)}`),
    ligne(`y=\\dfrac{${n(diff)}}{${e.n2}}`, `on divise par ${e.n2}`),
    ligne(`=${n(e.m2)}`),
  ];
}

function etapeResolution(e: E): EtapeCorrection[] {
  const lignes =
    e.variante === "note-a-obtenir" ? lignesResolutionNote(e) : e.variante === "effectif-manquant" ? lignesResolutionEffectif(e) : e.variante === "valeur-pour-mediane" ? lignesResolutionMediane(e) : lignesResolutionGroupes(e);
  const ec = ecrans(e)[1]!;
  return [
    utilise("b", [texte(e.variante === "moyenne-groupes" && e.forme === "globale" ? "On calcule chaque produit effectif × moyenne (la somme des valeurs du groupe), puis on divise par l'effectif total." : "On multiplie les deux membres par le dénominateur pour faire disparaître la fraction, puis on isole l'inconnue.")]),
    calcul("b", lignes),
    resultat("b", ec.type === "champs" ? ec.reponse : [latex(`${inconnue(e)}=${n(0)}`)]),
  ];
}

// ---------------------------------------------------------------------------------------------
// c) Conclure
// ---------------------------------------------------------------------------------------------

function lignesConclusionNote(e: ExerciceNote): LigneCalcul[] {
  const total = e.coefs.reduce((s, c) => s + c, 0) + e.coefDernier;
  const somme = arrondi9(e.notes.reduce((s, x, i) => s + x * e.coefs[i]!, 0));
  if (e.possible) {
    return [
      ligne(`${n(e.inconnue)}\\leq 20`, "une note ne dépasse pas 20 : c'est possible"),
      ligne(`\\dfrac{${n(somme)}+${e.coefDernier === 1 ? "" : `${e.coefDernier}\\times `}${n(e.inconnue)}}{${total}}=${n(e.cible)}`, "avec exactement cette note, la moyenne vaut la moyenne visée ; avec plus, elle la dépasse"),
    ];
  }
  const max = (somme + e.coefDernier * 20) / total;
  return [
    ligne(`${n(e.inconnue)}>20`, "une note ne dépasse pas 20 : c'est impossible"),
    ligne(`\\dfrac{${n(somme)}+${e.coefDernier === 1 ? "" : `${e.coefDernier}\\times `}20}{${total}}${egalOuEnviron(max, 2)}`, "même avec 20/20"),
    ligne(`<${n(e.cible)}`, "la moyenne visée n'est pas atteinte"),
  ];
}

function lignesConclusionEffectif(e: ExerciceEffectif): LigneCalcul[] {
  const { somme, n: nn } = sommesConnues(e);
  const v = e.valeurs[e.indexInconnu]!;
  const k = e.effectifs[e.indexInconnu]!;
  return [ligne(`\\Sigma n_i=${nn}+${k}`, "effectif total, ligne « ? » comprise"), ligne(`=${nn + k}`), ligne(`\\dfrac{${somme}+${v}\\times ${k}}{${nn + k}}=${n(e.moyenne)}`, "on retrouve la moyenne donnée ✓")];
}

function lignesConclusionMediane(e: ExerciceMediane): LigneCalcul[] {
  const cum = cumules(e.effectifs);
  const s = cum[cum.length - 1]!;
  const k0 = e.k0;
  const c = contexteTableau(e.contexte);
  if (e.forme === "haut") {
    const j = e.indexCible;
    return [
      ligne(`\\dfrac{${s}+${k0}}{2}=${n((s + k0) / 2)}`, `seuil avec ${k0} valeurs ajoutées`),
      ligne(`N_{\\leq ${n(e.valeurs[j - 1]!)}}=${cum[j - 1]}`, "égal au seuil : il ne le dépasse pas strictement"),
      ligne(`N_{\\leq ${n(e.valeurs[j]!)}}=${cum[j]}>${n((s + k0) / 2)}`, `premier effectif cumulé > seuil : la médiane est ${c.valeurTexte(e.valeurs[j]!)}`),
      ...(k0 >= 2 ? [ligne(`\\dfrac{${s}+${k0 - 1}}{2}=${n((s + k0 - 1) / 2)}<${cum[j - 1]}`, `avec ${k0 - 1} seulement, ${c.valeurTexte(e.valeurs[j - 1]!)} dépasse encore le seuil`)] : []),
    ];
  }
  const j = e.indexCible;
  return [
    ligne(`\\dfrac{${s}+${k0}}{2}=${n((s + k0) / 2)}`, `seuil avec ${k0} valeurs ajoutées`),
    ligne(`N_{\\leq ${n(e.valeurs[j]!)}}=${cum[j]}+${k0}=${cum[j] + k0}`, "égal au seuil : il ne le dépasse pas strictement"),
    ligne(`\\dfrac{${s}+${k0 + 1}}{2}=${n((s + k0 + 1) / 2)}`, `seuil avec ${k0 + 1} valeurs ajoutées`),
    ligne(`N_{\\leq ${n(e.valeurs[j]!)}}=${cum[j]}+${k0 + 1}=${cum[j] + k0 + 1}`, `dépasse strictement le seuil (${String((s + k0 + 1) / 2).replace(".", ",")}) : la médiane devient ${c.valeurTexte(e.valeurs[j]!)}`),
  ];
}

function lignesConclusionGroupes(e: ExerciceGroupes): LigneCalcul[] {
  const [mMin, mMax] = e.m1 < e.m2 ? [e.m1, e.m2] : [e.m2, e.m1];
  const d1 = arrondi9(Math.abs(e.globale - e.m1));
  const d2 = arrondi9(Math.abs(e.globale - e.m2));
  const grand1 = e.n1 > e.n2;
  return [
    ligne(`${n(mMin)}<${n(e.globale)}<${n(mMax)}`, "la moyenne de l'ensemble est entre les deux moyennes"),
    ligne(`|${n(e.globale)}-${np(e.m1)}|=${n(d1)}`, "écart à la moyenne du groupe 1"),
    ligne(`|${n(e.globale)}-${np(e.m2)}|=${n(d2)}`, "écart à la moyenne du groupe 2"),
    ligne(`${n(grand1 ? d1 : d2)}<${n(grand1 ? d2 : d1)}`, "plus près de la moyenne du groupe le plus nombreux"),
  ];
}

function etapeConclusion(e: E): EtapeCorrection[] {
  const lignes =
    e.variante === "note-a-obtenir" ? lignesConclusionNote(e) : e.variante === "effectif-manquant" ? lignesConclusionEffectif(e) : e.variante === "valeur-pour-mediane" ? lignesConclusionMediane(e) : lignesConclusionGroupes(e);
  const utiliseC =
    e.variante === "note-a-obtenir"
      ? "Une note est comprise entre 0 et 20 ; si la dernière note dépasse la solution, la moyenne dépasse la moyenne visée."
      : e.variante === "effectif-manquant"
        ? "L'effectif total compte toutes les lignes du tableau ; on contrôle en recalculant la moyenne."
        : e.variante === "valeur-pour-mediane"
          ? "On teste la solution de l'équation avec la règle du seuil : « égal » ne suffit pas, il faut dépasser strictement."
          : "La moyenne de deux groupes réunis est comprise entre les deux moyennes, plus près de celle du groupe le plus nombreux.";
  return [
    utilise("c", [texte(`${utiliseC} ${e.variante === "valeur-pour-mediane" ? COURS_POSITION : COURS_MOYENNE}`)]),
    calcul("c", lignes),
    resultat("c", conclusions(e)[0]!),
    ...(e.variante === "valeur-pour-mediane" ? [piege("c", piegeCorrige(e))] : []),
  ];
}

function correctionDetailleeValeurManquanteBrut(e: E): EtapeCorrection[] {
  return [...etapeEquation(e), ...etapeResolution(e), ...etapeConclusion(e)];
}

export function correctionDetailleeValeurManquante(e: E): EtapeCorrection[] {
  return formulesInsecables(correctionDetailleeValeurManquanteBrut(e));
}
