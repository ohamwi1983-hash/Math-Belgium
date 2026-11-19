import type { EtapeCorrection } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import type { ExerciceMoyennePonderee, ExerciceMoyennePondereeClasses } from "../../core/moyennePonderee.types";
import { LABEL_MOYENNE_BARRE, LABEL_SOMME_N, LABEL_SOMME_XN } from "../../ui/formatMoyennePonderee";
import { COURS_MOYENNE, classeTexte, egalOuEnviron, exact, lignesSomme, lignesSommeProduits, ligneCentre, ligneOrdre, listeResultat, nb, nbt, formulesInsecables } from "../../ui/corrigeStatistique1";

/**
 * Corrigé détaillé « comme au tableau » de gen32 (moyenne pondérée) — règle
 * `.claude/rules/feuilles-evaluations.md`. Étapes = écrans : (a) centres des classes — variante
 * « classes » seulement,) sommes Σnᵢ et Σ(xᵢ·nᵢ), quotient x̄. Les constructeurs d'étapes sont
 * réutilisés par l'exercice de synthèse (gen35) sur l'exercice « mappé » (`versMoyennePonderee`).
 */

type E = ExerciceMoyennePonderee;

function donnees(e: E): { x: number; n: number }[] {
  return e.variante === "discrete" ? e.lignes.map((l) => ({ x: l.valeur, n: l.effectif })) : e.classes.map((c) => ({ x: c.centre, n: c.effectif }));
}

export function etapesCentres(e: ExerciceMoyennePondereeClasses, lettre: string): EtapeCorrection[] {
  const k = e.classes.length;
  const amplitudes = new Set(e.classes.map((c) => c.borneSup - c.borneInf));
  return [
    utilise(lettre, [texte("Le centre d'une classe est la moyenne de ses deux bornes : "), latex("x_i=\\dfrac{a+b}{2}"), texte(` pour la classe [a ; b[ ${COURS_MOYENNE}.`)]),
    calcul(lettre, e.classes.map((c, i) => ligneCentre(`x_{${i + 1}}`, c.borneInf, c.borneSup, classeTexte(c.borneInf, c.borneSup, i === k - 1)))),
    resultat(lettre, listeResultat(e.classes.map((c, i) => `x_{${i + 1}}=${nb(c.centre)}`), [], ` (en ${e.contexte.unite})`)),
    ...(amplitudes.size > 1 ? [piege(lettre, [texte("Les classes n'ont pas toutes la même amplitude : chaque centre se calcule avec les bornes de SA classe.")])] : []),
  ];
}

export function etapesSommes(e: E, lettre: string): EtapeCorrection[] {
  const d = donnees(e);
  const classes = e.variante === "classes";
  return [
    utilise(lettre, [
      texte(`On multiplie chaque ${classes ? "centre" : "valeur"} `),
      latex("x_i"),
      texte(" par son effectif "),
      latex("n_i"),
      texte(" et on additionne les produits ; "),
      latex(LABEL_SOMME_N),
      texte(` est la somme des effectifs ${COURS_MOYENNE}.`),
    ]),
    calcul(lettre, [...lignesSomme(LABEL_SOMME_N, d.map((l) => l.n), "somme des effectifs"), ...lignesSommeProduits(LABEL_SOMME_XN, d.map((l) => [l.x, l.n]), "chaque valeur fois son effectif")]),
    resultat(lettre, [latex(`${LABEL_SOMME_N}=${nb(e.n)}`), texte(" et "), latex(`${LABEL_SOMME_XN}=${nb(e.sommeXN)}`)]),
  ];
}

export function etapesQuotient(e: E, lettre: string): EtapeCorrection[] {
  const d = donnees(e);
  const classes = e.variante === "classes";
  const exacte = e.sommeXN / e.n;
  const rel = egalOuEnviron(e.moyenne, exacte);
  const min = classes ? e.classes[0].borneInf : d[0].x;
  const max = classes ? e.classes[e.classes.length - 1].borneSup : d[d.length - 1].x;
  const u = e.contexte.unite;
  const lignes = [ligne(`${LABEL_MOYENNE_BARRE}=\\dfrac{${nb(e.sommeXN)}}{${nb(e.n)}}`, "on divise la somme des produits par n")];
  if (rel === "=") lignes.push(ligne(`=${nb(e.moyenne)}`));
  else lignes.push(ligne(`=${exact(exacte)}`), ligne(`\\approx ${nb(e.moyenne)}`, "arrondi au centième"));
  return [
    utilise(lettre, [texte("Moyenne pondérée : "), latex(`${LABEL_MOYENNE_BARRE}=\\dfrac{${LABEL_SOMME_XN}}{${LABEL_SOMME_N}}`), texte(` ${COURS_MOYENNE}.`)]),
    calcul(lettre, lignes),
    resultat(lettre, [latex(`${LABEL_MOYENNE_BARRE}${rel}${nb(e.moyenne)}`), texte(` ${u}${classes ? " — une estimation : les valeurs exactes à l'intérieur des classes sont inconnues." : ""}`)]),
    verification(lettre, [texte(`La moyenne est comprise entre ${classes ? "les bornes extrêmes des classes" : "la plus petite et la plus grande valeur"} :`)], [ligneOrdre([min, e.moyenne, max])]),
    piege(lettre, [texte(`On divise par n = ${nbt(e.n)}, la somme des effectifs — jamais par le nombre de ${classes ? "classes" : "valeurs distinctes"} (${d.length}).`)]),
  ];
}

export function correctionDetailleeMoyennePonderee(e: E): EtapeCorrection[] {
  return formulesInsecables(e.variante === "classes" ? [...etapesCentres(e, "a"), ...etapesSommes(e, "b"), ...etapesQuotient(e, "c")] : [...etapesSommes(e, "a"), ...etapesQuotient(e, "b")]);
}
