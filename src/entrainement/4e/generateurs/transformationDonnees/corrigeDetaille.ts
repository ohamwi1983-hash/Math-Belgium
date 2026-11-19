import type { EtapeCorrection, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import type { ExerciceTransformationDonnees } from "../../core/transformationDonnees.types";
import { aCarre, affineLatex, contexte, ecrans, equationLatex, imageNonCalculee, nombreLatex, phrasesConclusion, uniteVariance, valeurAvecUnite } from "../../ui/formatTransformationDonnees";
import { COURS_DISPERSION, nbp, formulesInsecables } from "../../ui/corrigeStatistique2";

/**
 * Corrigé détaillé « comme au tableau » de gen108 (effet d'une transformation des données) — règle
 * `.claude/rules/feuilles-evaluations.md`. Quatre étapes = quatre écrans : a) y = a·x + b,
 * b) moyenne et médiane, c) étendue, variance et écart-type, d) conclusion (constat chiffré à partir
 * des résultats b et c). Valeurs et écritures de l'écran (`ui/formatTransformationDonnees.ts` :
 * `imageNonCalculee`, `aCarre`, réponses des écrans) ; partagé par l'adaptateur papier et l'appli.
 */

type E = ExerciceTransformationDonnees;
const n = nombreLatex;
const r9 = (x: number) => Math.round(x * 1e9) / 1e9;

function nombreTexte(v: number): string {
  return valeurAvecUnite(v, "").trim();
}

function reponseEcran(e: E, i: number) {
  const ec = ecrans(e)[i]!;
  return ec.type === "champs" ? ec.reponse : [];
}

// ---------------------------------------------------------------------------------------------
// a) La transformation
// ---------------------------------------------------------------------------------------------

function lignesCoefficientPourcentage(e: E): LigneCalcul[] {
  const t = e.pourcentage!;
  return [ligne(`a=1${t > 0 ? "+" : "-"}\\dfrac{${n(Math.abs(t))}}{100}`, `${t > 0 ? "hausse" : "baisse"} de ${nombreTexte(Math.abs(t))} % : on garde la valeur et on ${t > 0 ? "ajoute" : "retire"} ${nombreTexte(Math.abs(t))} %`), ligne(`=${n(e.a)}`)];
}

function lignesTransformation(e: E): LigneCalcul[] {
  const c = contexte(e);
  switch (e.forme) {
    case "constante":
      return [
        ligne(equationLatex(e), `on ${e.b > 0 ? "ajoute" : "retire"} ${valeurAvecUnite(Math.abs(e.b), c.uniteX)} à chaque ${c.singulier}, sans multiplier`),
        ligne("a=1", "chaque valeur est gardée telle quelle"),
        ligne(`b=${n(e.b)}`, e.b < 0 ? "on retire : b est négatif" : "nombre ajouté"),
      ];
    case "pourcentage":
      return [...lignesCoefficientPourcentage(e), ligne("b=0", "rien n'est ajouté"), ligne(equationLatex(e))];
    case "facteur":
      return [ligne(`a=${n(e.a)}`, `changement d'unité : ${c.equivalence!(e)}`), ligne("b=0", "rien n'est ajouté"), ligne(equationLatex(e))];
    case "direct":
      return [
        ...(e.pourcentage !== null ? lignesCoefficientPourcentage(e) : [ligne(`a=${n(e.a)}`, "nombre qui multiplie chaque valeur")]),
        ligne(`b=${n(e.b)}`, "nombre ajouté APRÈS la multiplication"),
        ligne(equationLatex(e)),
      ];
    case "avant": {
      const cst = e.constante!;
      return [
        ...(e.pourcentage !== null ? lignesCoefficientPourcentage(e) : []),
        ligne(`y=${n(e.a)}\\,(x+${n(cst)})`, `la constante ${nombreTexte(cst)} est ajoutée AVANT la multiplication`),
        ligne(`=${n(e.a)}\\,x+${n(e.a)}\\times ${n(cst)}`, "on distribue"),
        ligne(`=${affineLatex(e.a, e.b)}`),
        ligne(`a=${n(e.a)}`),
        ligne(`b=${n(e.b)}`, "la constante est multipliée elle aussi"),
      ];
    }
    case "negatif":
      return [
        ligne(`y=${n(e.b)}-x`, `${c.descY} : ${nombreTexte(e.b)} moins la valeur de départ`),
        ligne(`=${affineLatex(e.a, e.b)}`, "on range sous la forme a x + b"),
        ligne(`a=${n(e.a)}`),
        ligne(`b=${n(e.b)}`),
      ];
  }
}

function etapeTransformation(e: E): EtapeCorrection[] {
  return [
    utilise("a", [texte("Chaque valeur subit la même transformation, qu'on écrit "), latex("y = a\\,x + b"), texte(` : a est le nombre qui MULTIPLIE chaque valeur, b le nombre AJOUTÉ à la fin (négatif si on retire) ${COURS_DISPERSION}.`)]),
    calcul("a", lignesTransformation(e)),
    resultat("a", reponseEcran(e, 0)),
    ...(e.forme === "avant" ? [piegeAvant(e)] : []),
  ];
}

// ---------------------------------------------------------------------------------------------
// b) Position
// ---------------------------------------------------------------------------------------------

function lignesImage(e: E, nom: string, x: number, y: number): LigneCalcul[] {
  const lignes: LigneCalcul[] = [ligne(`${nom}=${imageNonCalculee(e, x)}`, `y = a x + b avec la valeur de départ ${nombreTexte(x)}`)];
  if (e.a !== 1 && e.a !== -1 && e.b !== 0) lignes.push(ligne(`=${n(r9(e.a * x))}${e.b > 0 ? "+" : "-"}${n(Math.abs(e.b))}`, "on multiplie d'abord"));
  lignes.push(ligne(`=${n(y)}`));
  return lignes;
}

function etapePosition(e: E): EtapeCorrection[] {
  return [
    utilise("b", [
      texte("La moyenne et la médiane subissent la même transformation que chaque valeur : "),
      latex("\\bar{y} = a\\,\\bar{x} + b"),
      texte(` ; de même pour la médiane, puisque l'ordre des valeurs est conservé (ou exactement retourné si a < 0) ${COURS_DISPERSION}.`),
    ]),
    calcul("b", [...lignesImage(e, "\\bar{y}", e.depart.moyenne, e.arrivee.moyenne), ...lignesImage(e, "\\text{médiane}_y", e.depart.mediane, e.arrivee.mediane)]),
    resultat("b", reponseEcran(e, 1)),
  ];
}

// ---------------------------------------------------------------------------------------------
// c) Dispersion
// ---------------------------------------------------------------------------------------------

function lignesEcart(e: E, nom: string, x: number, y: number): LigneCalcul[] {
  if (e.a === 1) return [ligne(`${nom}=${n(y)}`, "b ne change aucun écart : valeur inchangée")];
  if (e.a === -1) return [ligne(`${nom}=|-1|\\times ${n(x)}`, "multiplié par |a|"), ligne(`=${n(y)}`)];
  return [ligne(`${nom}=${e.a < 0 ? `|${n(e.a)}|` : n(e.a)}\\times ${n(x)}`, "multiplié par |a|, b sans effet"), ligne(`=${n(y)}`)];
}

function lignesVariance(e: E): LigneCalcul[] {
  const x = e.depart.variance;
  const y = e.arrivee.variance;
  if (e.a === 1) return [ligne(`V_y=${n(y)}`, "b ne change aucun écart : variance inchangée")];
  return [ligne(`V_y=${e.a < 0 ? `(${n(e.a)})` : n(e.a)}^2\\times ${n(x)}`, "multipliée par a²"), ligne(`=${n(aCarre(e))}\\times ${n(x)}`), ligne(`=${n(y)}`)];
}

function etapeEcarts(e: E): EtapeCorrection[] {
  const c = contexte(e);
  const y = e.arrivee;
  return [
    utilise("c", [
      texte("La constante b décale toutes les valeurs du même montant : elle ne change aucun écart. Seul a agit, en valeur absolue — au carré pour la variance : "),
      latex("E_y = |a| \\times E_x"),
      texte(", "),
      latex("V_y = a^2 \\times V_x"),
      texte(", "),
      latex("\\sigma_y = |a| \\times \\sigma_x"),
      texte(` ${COURS_DISPERSION}.`),
    ]),
    calcul("c", [...lignesEcart(e, "E_y", e.depart.etendue, y.etendue), ...lignesVariance(e), ...lignesEcart(e, "\\sigma_y", e.depart.ecartType, y.ecartType)]),
    resultat("c", reponseEcran(e, 2)),
    verification("c", [texte(`L'écart-type est bien la racine carrée de la variance (en ${uniteVariance(c.uniteY)}) :`)], [ligne(`\\sqrt{${n(y.variance)}}=${n(y.ecartType)}`, "= σ_y ✓")]),
    ...(e.forme === "avant" ? [] : [piegeAutre(e)]),
  ];
}

// ---------------------------------------------------------------------------------------------
// d) Conclusion
// ---------------------------------------------------------------------------------------------

function lignesConstat(e: E): LigneCalcul[] {
  const x = e.depart;
  const y = e.arrivee;
  const lignes: LigneCalcul[] = [];
  if (e.a === 1) {
    lignes.push(ligne(`\\bar{y}-\\bar{x}=${n(y.moyenne)}-${nbp(x.moyenne)}`, "la moyenne est décalée de b"), ligne(`=${n(r9(y.moyenne - x.moyenne))}`));
    lignes.push(ligne(`\\sigma_y=\\sigma_x=${n(y.ecartType)}`, "la dispersion ne change pas"));
    return lignes;
  }
  if (e.a === -1) {
    lignes.push(ligne(`\\bar{x}+\\bar{y}=${n(x.moyenne)}+${nbp(y.moyenne)}`, "série retournée : la somme x̄ + ȳ vaut b"), ligne(`=${n(r9(x.moyenne + y.moyenne))}`));
    lignes.push(ligne(`\\sigma_y=\\sigma_x=${n(y.ecartType)}`, "|a| = 1 : la dispersion ne change pas"));
    return lignes;
  }
  if (e.b === 0) lignes.push(ligne(`\\dfrac{\\bar{y}}{\\bar{x}}=\\dfrac{${n(y.moyenne)}}{${n(x.moyenne)}}`, "la moyenne est multipliée par a"), ligne(`=${n(e.a)}`));
  lignes.push(ligne(`\\dfrac{\\sigma_y}{\\sigma_x}=\\dfrac{${n(y.ecartType)}}{${n(x.ecartType)}}`, e.b === 0 ? "l'écart-type aussi" : "l'écart-type est multiplié par |a| seulement"), ligne(`=${n(Math.abs(e.a))}`));
  lignes.push(ligne(`\\dfrac{V_y}{V_x}=\\dfrac{${n(y.variance)}}{${n(x.variance)}}`, "la variance par a²"), ligne(`=${n(aCarre(e))}`));
  return lignes;
}

function etapeConclusion(e: E): EtapeCorrection[] {
  return [
    utilise("d", [texte(`Un nombre ajouté à toutes les valeurs déplace la série sans changer ses écarts ; un nombre qui multiplie toutes les valeurs agrandit ou rétrécit ses écarts. On le constate sur les résultats des étapes 2 et 3 ${COURS_DISPERSION}.`)]),
    calcul("d", lignesConstat(e)),
    resultat("d", phrasesConclusion(e)[0]!),
  ];
}

// ---------------------------------------------------------------------------------------------
// Pièges (ciblés sur la forme)
// ---------------------------------------------------------------------------------------------

function piegeAvant(e: E): EtapeCorrection {
  const c = contexte(e);
  return piege("a", [
    texte(`La constante ${nombreTexte(e.constante!)} est ajoutée avant la multiplication : `),
    latex(`b = ${n(e.a)} \\times ${n(e.constante!)} = ${n(e.b)}`),
    texte(`, pas ${nombreTexte(e.constante!)}. Avec `),
    latex(`b = ${n(e.constante!)}`),
    texte(`, la moyenne serait fausse (${valeurAvecUnite(r9(e.a * e.depart.moyenne + e.constante!), c.uniteY)}).`),
  ]);
}

function piegeAutre(e: E): EtapeCorrection {
  const c = contexte(e);
  const y = e.arrivee;
  const x = e.depart;
  switch (e.forme) {
    case "constante":
      return piege("c", [texte(`Ne pas ${e.b > 0 ? "ajouter" : "retirer"} ${nombreTexte(Math.abs(e.b))} à l'écart-type : on obtiendrait ${valeurAvecUnite(r9(x.ecartType + e.b), c.uniteY)}, alors que décaler toutes les valeurs du même nombre ne change aucun écart entre elles.`)]);
    case "pourcentage":
    case "facteur":
      return piege("c", [
        texte("La variance est une moyenne de carrés d'écarts : elle est multipliée par "),
        latex(`a^2 = ${n(aCarre(e))}`),
        texte(`, pas par ${nombreTexte(e.a)} — sinon on trouverait ${valeurAvecUnite(r9(e.a * x.variance), uniteVariance(c.uniteY))} au lieu de ${valeurAvecUnite(y.variance, uniteVariance(c.uniteY))}.`),
        ...(e.pourcentage !== null ? [texte(` Et une ${e.pourcentage > 0 ? "hausse" : "baisse"} de ${nombreTexte(Math.abs(e.pourcentage))} % multiplie par ${nombreTexte(e.a)}, pas par ${nombreTexte(Math.abs(e.pourcentage) / 100)}.`)] : []),
      ]);
    case "direct":
      return piege("c", [texte(`Le « + ${nombreTexte(e.b)} » ne touche ni l'étendue ni l'écart-type : l'écart-type vaut ${valeurAvecUnite(y.ecartType, c.uniteY)}, pas ${valeurAvecUnite(r9(y.ecartType + e.b), c.uniteY)}.`)]);
    default:
      return piege("c", [texte("Ici "), latex("a = -1"), texte(" : l'écart-type est multiplié par "), latex("|a| = 1"), texte(" — il ne change pas et ne devient surtout pas négatif. La variance est multipliée par "), latex("a^2 = 1"), texte(".")]);
  }
}

function correctionDetailleeTransformationDonneesBrut(e: E): EtapeCorrection[] {
  return [...etapeTransformation(e), ...etapePosition(e), ...etapeEcarts(e), ...etapeConclusion(e)];
}

export function correctionDetailleeTransformationDonnees(e: E): EtapeCorrection[] {
  return formulesInsecables(correctionDetailleeTransformationDonneesBrut(e));
}
