import type { EtapeCorrection, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise } from "../../../export/corrigeTableau";
import type { ExerciceDispersion } from "../../core/dispersion.types";
import { LABEL_ECART_TYPE, LABEL_PRODUIT, LABEL_SOMME_N, LABEL_SOMME_PRODUIT, LABEL_VARIANCE, LABEL_XBAR } from "../../ui/formatDispersion";
import { COURS_DISPERSION, classeTexte, egalOuEnviron, exact, lignesSomme, lignesSommeProduits, ligneCentre, listeResultat, nb, nbp, nbt, net, couperSiLongue, formulesInsecables } from "../../ui/corrigeStatistique1";

/**
 * Corrigé détaillé « comme au tableau » de gen34 (variance et écart-type) — règle
 * `.claude/rules/feuilles-evaluations.md`. Étapes = écrans : (a) centres et moyenne — famille
 * « classes » seulement,) tableau des écarts pondérés et totaux, variance et écart-type. Valeurs de
 * l'instance (produits, totaux, variance arrondie au centième puis écart-type déduit de CETTE
 * variance, comme à l'écran). Constructeurs réutilisés par l'exercice de synthèse (gen35, exercice
 * « mappé » `versDispersion`).
 */

type E = ExerciceDispersion;

export function etapeCentresMoyenne(e: E, lettre: string): EtapeCorrection[] {
  const donnees = e.enClasses!;
  const k = donnees.classes.length;
  const lignes: LigneCalcul[] = [
    ...donnees.classes.map((c, i) => ligneCentre(`x_{${i + 1}}`, c.borneInf, c.borneSup, classeTexte(c.borneInf, c.borneSup, i === k - 1))),
    ...lignesSomme(LABEL_SOMME_N, donnees.classes.map((c) => c.effectif), "somme des effectifs"),
    ...lignesSommeProduits("\\Sigma(x_i \\cdot n_i)", donnees.classes.map((c) => [c.centre, c.effectif]), "chaque centre fois son effectif"),
    ligne(`${LABEL_XBAR}=\\dfrac{${nb(donnees.sommeCentresN)}}{${nb(e.n)}}`, "moyenne pondérée"),
    ligne(`=${nb(e.xBar)}`),
  ];
  return [
    utilise(lettre, [
      texte("Chaque classe est représentée par son centre, la moyenne de ses bornes "),
      latex("x_i=\\dfrac{a+b}{2}"),
      texte(" ; puis "),
      latex(`${LABEL_XBAR}=\\dfrac{\\Sigma(x_i \\cdot n_i)}{${LABEL_SOMME_N}}`),
      texte(` ${COURS_DISPERSION}.`),
    ]),
    calcul(lettre, lignes),
    resultat(lettre, [...listeResultat(donnees.classes.map((c, i) => `x_{${i + 1}}=${nb(c.centre)}`)), texte(" ; "), latex(`${LABEL_XBAR}=${nb(e.xBar)}`), texte(` ${e.contexte.unite}`)]),
    piege(lettre, [texte("On calcule avec les centres des classes (jamais leurs bornes), chacun multiplié par son effectif.")]),
  ];
}

export function etapeTableau(e: E, lettre: string): EtapeCorrection[] {
  const lignes: LigneCalcul[] = e.lignes.flatMap((l, i) => {
    const ecart = net(l.valeur - e.xBar);
    const carre = net(ecart * ecart);
    return couperSiLongue(ligne(`(${nb(l.valeur)}-${nbp(e.xBar)})^2\\cdot ${nb(l.effectif)}=${nbp(carre)}\\cdot ${nb(l.effectif)}=${nb(l.produitAttendu)}`, i === 0 ? `écart ${nbt(ecart)}, au carré, fois l'effectif` : `écart ${nbt(ecart)}`));
  });
  lignes.push(...lignesSomme(LABEL_SOMME_N, e.lignes.map((l) => l.effectif), "somme des effectifs"));
  lignes.push(...lignesSomme(LABEL_SOMME_PRODUIT, e.lignes.map((l) => l.produitAttendu), "somme des écarts pondérés"));
  return [
    utilise(lettre, [
      texte("Pour chaque valeur : écart à la moyenne "),
      latex(`${nb(e.xBar)}`),
      texte(", élevé au carré, multiplié par l'effectif — "),
      latex(LABEL_PRODUIT),
      texte(` ; puis les deux totaux ${COURS_DISPERSION}.`),
    ]),
    calcul(lettre, lignes, [texte("Avec "), latex(`${LABEL_XBAR}=${nb(e.xBar)}`), texte(" :")]),
    resultat(lettre, [latex(`${LABEL_SOMME_N}=${nb(e.n)}`), texte(" et "), latex(`${LABEL_SOMME_PRODUIT}=${nb(e.sommeProduits)}`)]),
    piege(lettre, [texte("On élève l'écart au carré AVANT de multiplier par l'effectif ; un écart négatif se met entre parenthèses.")]),
  ];
}

export function etapeVarianceEcartType(e: E, lettre: string): EtapeCorrection[] {
  const u = e.contexte.unite;
  const vExacte = e.sommeProduits / e.n;
  const relV = egalOuEnviron(e.varianceAttendue, vExacte);
  const relS = egalOuEnviron(e.ecartTypeAttendu, Math.sqrt(e.varianceAttendue));
  const lignes: LigneCalcul[] = [ligne(`${LABEL_VARIANCE}=\\dfrac{${nb(e.sommeProduits)}}{${nb(e.n)}}`, "somme des écarts pondérés divisée par n")];
  if (relV === "=") lignes.push(ligne(`=${nb(e.varianceAttendue)}`));
  else lignes.push(ligne(`=${exact(vExacte)}`), ligne(`\\approx ${nb(e.varianceAttendue)}`, "arrondi au centième"));
  lignes.push(ligne(`${LABEL_ECART_TYPE}=\\sqrt{${nb(e.varianceAttendue)}}`, relV === "=" ? "racine carrée de la variance" : "racine carrée de la variance arrondie"));
  lignes.push(ligne(`${relS === "=" ? "=" : "\\approx "}${nb(e.ecartTypeAttendu)}`, relS === "=" ? undefined : "arrondi au centième"));
  return [
    utilise(lettre, [
      texte("Variance : "),
      latex(`${LABEL_VARIANCE}=\\dfrac{${LABEL_SOMME_PRODUIT}}{${LABEL_SOMME_N}}`),
      texte(" ; écart-type : "),
      latex(`${LABEL_ECART_TYPE}=\\sqrt{${LABEL_VARIANCE}}`),
      texte(` ${COURS_DISPERSION}.`),
    ]),
    calcul(lettre, lignes),
    resultat(lettre, [latex(`${LABEL_VARIANCE}${relV}${nb(e.varianceAttendue)}`), texte(` ${u}² et `), latex(`${LABEL_ECART_TYPE}${relS}${nb(e.ecartTypeAttendu)}`), texte(` ${u}`)]),
    piege(lettre, [texte(`On divise par n = ${e.n}, l'effectif total — pas par le nombre de valeurs (${e.lignes.length}) ; l'écart-type est la racine carrée de la variance.`)]),
  ];
}

export function correctionDetailleeDispersion(e: E): EtapeCorrection[] {
  if (e.enClasses) return formulesInsecables([...etapeCentresMoyenne(e, "a"), ...etapeTableau(e, "b"), ...etapeVarianceEcartType(e, "c")]);
  return formulesInsecables([...etapeTableau(e, "a"), ...etapeVarianceEcartType(e, "b")]);
}
