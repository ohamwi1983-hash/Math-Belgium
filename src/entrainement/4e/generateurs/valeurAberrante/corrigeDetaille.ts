import type { EtapeCorrection, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise } from "../../../export/corrigeTableau";
import type { ExerciceValeurAberrante } from "../../core/valeurAberrante.types";
import { arrondi9, indicateursComplets, indicateursSansExtreme, valeurRetiree, type Indicateurs } from "../../moteur/modeleValeurAberrante";
import { figureNuageSvg } from "../../ui/figureValeurAberrante";
import { bonneJustification, conclusionVerdict, ecrans, laValeurRetiree, listeTexte, piegeVerdict, texteJustification, valeurTexte } from "../../ui/formatValeurAberrante";
import { nombreLatex } from "../../ui/formatTransformationDonnees";
import { COURS_MOYENNE, COURS_POSITION, lignesSomme, formulesInsecables } from "../../ui/corrigeStatistique2";

/**
 * Corrigé détaillé « comme au tableau » de gen110 (moyenne ou médiane ? la valeur aberrante) — règle
 * `.claude/rules/feuilles-evaluations.md`. Trois étapes = trois écrans : a) moyenne (somme écrite en
 * sommes partielles quand elle est longue) et médiane (liste rangée, seuil n/2, rang) de la série,
 * b) les mêmes sans la valeur la plus éloignée (somme = ancienne somme − valeur retirée),
 * c) verdict appuyé sur les écarts calculés (nuage de points en figure). Valeurs du modèle
 * (`moteur/modeleValeurAberrante.ts`) et textes de l'écran ; partagé par l'adaptateur et l'appli.
 */

type E = ExerciceValeurAberrante;
const n = nombreLatex;

function lignesMediane(ind: Indicateurs): LigneCalcul[] {
  return [
    ligne(`\\dfrac{n}{2}=\\dfrac{${ind.n}}{2}`, "seuil de la médiane"),
    ligne(`=${n(ind.n / 2)}`),
    ligne(`\\text{médiane}=${n(ind.mediane)}`, `${ind.rang}e valeur de la liste rangée : premier rang > ${String(ind.n / 2).replace(".", ",")}`),
  ];
}

function blocsIndicateurs(sq: string, ind: Indicateurs, valeurs: readonly number[], sansValeur: number | null): EtapeCorrection[] {
  const somme: LigneCalcul[] =
    sansValeur === null
      ? lignesSomme("\\Sigma x_i", valeurs.map((v) => n(v)), [...valeurs], `les ${ind.n} valeurs`)
      : [ligne(`\\Sigma x_i=${n(arrondi9(ind.somme + sansValeur))}-${n(sansValeur)}`, "somme de l'étape 1, moins la valeur retirée"), ligne(`=${n(ind.somme)}`)];
  return [
    calcul(sq, [...somme, ligne(`\\bar{x}=\\dfrac{${n(ind.somme)}}{${ind.n}}`, `somme ÷ nombre de valeurs (${ind.n})`), ligne(`=${n(ind.moyenne)}`)], [], "Moyenne"),
    calcul(sq, lignesMediane(ind), [texte(`Liste rangée (${ind.n} valeurs) : ${listeTexte(ind.triees)}.`)], "Médiane"),
  ];
}

function reponse(e: E, i: number) {
  const ec = ecrans(e)[i]!;
  return ec.reponse;
}

function etapeA(e: E): EtapeCorrection[] {
  const a = indicateursComplets(e);
  return [
    utilise("a", [
      texte(`Moyenne : somme des valeurs divisée par leur nombre ${COURS_MOYENNE}. Médiane : on RANGE d'abord les valeurs dans l'ordre croissant, puis on prend la première dont le rang dépasse strictement `),
      latex("\\dfrac{n}{2}"),
      texte(` (règle du seuil) ${COURS_POSITION}.`),
    ]),
    ...blocsIndicateurs("a", a, e.valeurs, null),
    resultat("a", reponse(e, 0)),
    piege("a", [texte("La médiane se lit sur la liste RANGÉE, jamais au milieu de la liste dans l'ordre de l'énoncé.")]),
  ];
}

function etapeB(e: E): EtapeCorrection[] {
  const b = indicateursSansExtreme(e);
  const x = valeurRetiree(e);
  return [
    utilise("b", [texte(`On retire ${laValeurRetiree(e)} (${valeurTexte(e, x)}) : il reste ${b.n} valeurs. Même méthode ; la nouvelle somme est l'ancienne moins la valeur retirée ${COURS_MOYENNE}.`)]),
    ...blocsIndicateurs("b", b, [], x),
    resultat("b", reponse(e, 1)),
    piege("b", [texte(`Diviser par ${b.n}, le nouveau nombre de valeurs — pas par ${b.n + 1}.`)]),
  ];
}

function etapeC(e: E): EtapeCorrection[] {
  const a = indicateursComplets(e);
  const b = indicateursSansExtreme(e);
  const dm = arrondi9(Math.abs(a.moyenne - b.moyenne));
  const dmed = arrondi9(Math.abs(a.mediane - b.mediane));
  const ecart = arrondi9(Math.abs(a.moyenne - a.mediane));
  const ordre = (u: number, v: number) => (u >= v ? `${n(u)}-${n(v)}` : `${n(v)}-${n(u)}`);
  const lignes: LigneCalcul[] = [
    ligne(`|\\Delta\\bar{x}|=${ordre(a.moyenne, b.moyenne)}`, `effet du retrait sur la moyenne`),
    ligne(`=${n(dm)}`),
    ligne(`|\\Delta\\,\\text{médiane}|=${dmed === 0 ? "0" : ordre(a.mediane, b.mediane)}`, dmed === 0 ? "la médiane ne bouge pas" : "effet du retrait sur la médiane"),
    ...(dmed === 0 ? [] : [ligne(`=${n(dmed)}`)]),
    ligne(`${n(dm)}${dm > dmed ? ">" : dm < dmed ? "<" : "="}${n(dmed)}`, "on compare les deux effets"),
    ligne(`|\\bar{x}-\\text{médiane}|=${ordre(a.moyenne, a.mediane)}`, "écart entre les deux indicateurs (série complète)"),
    ligne(`=${n(ecart)}`),
  ];
  return [
    utilise("c", [texte(`Une valeur très éloignée des autres attire la moyenne, jamais la médiane, qui ne dépend que du rang ${COURS_POSITION}. Si le retrait d'une seule valeur fait beaucoup bouger la moyenne, la médiane est plus représentative ; sinon, les deux se valent.`)]),
    { ...calcul("c", lignes), figureHtml: figureNuageSvg(e, 380) },
    resultat("c", [texte(`${conclusionVerdict(e)} ${texteJustification(e, bonneJustification(e))}`)]),
    piege("c", piegeVerdict(e)),
  ];
}

function correctionDetailleeValeurAberranteBrut(e: E): EtapeCorrection[] {
  return [...etapeA(e), ...etapeB(e), ...etapeC(e)];
}

export function correctionDetailleeValeurAberrante(e: E): EtapeCorrection[] {
  return formulesInsecables(correctionDetailleeValeurAberranteBrut(e));
}
