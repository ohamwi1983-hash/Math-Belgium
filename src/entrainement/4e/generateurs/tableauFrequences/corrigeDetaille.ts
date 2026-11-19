import type { EtapeCorrection } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import type { ExerciceTableauFrequences } from "../../core/tableauFrequences.types";
import { COURS_FREQUENCES, lignesSomme, ligneFrequence, listeResultat, nb, nbt, formulesInsecables } from "../../ui/corrigeStatistique1";

/**
 * Corrigé détaillé « comme au tableau » de gen30 (tableau de fréquences) — règle
 * `.claude/rules/feuilles-evaluations.md`. Quatre étapes = les quatre écrans : a) valeurs distinctes
 * et effectifs, b) fréquences, c) effectifs cumulés, d) fréquences cumulées. Toutes les valeurs
 * viennent de `instance.lignes` (la table de référence de l'écran) ; partagé par l'adaptateur papier
 * et l'appli (étape échouée).
 */

type E = ExerciceTableauFrequences;

const xi = (i: number) => `x_{${i + 1}}`;

export function correctionDetailleeTableauFrequences(e: E): EtapeCorrection[] {
  const { lignes, n } = e;
  const k = lignes.length;
  const derniere = lignes[k - 1];
  return formulesInsecables([
    // a) Valeurs distinctes et effectifs
    utilise("a", [
      texte("On range les valeurs distinctes de la liste par ordre croissant, puis on compte combien de fois chacune apparaît : c'est son effectif "),
      latex("n_i"),
      texte(`. La somme des effectifs est le nombre n de données ${COURS_FREQUENCES}.`),
    ]),
    calcul(
      "a",
      [
        ...lignes.map((l, i) => ligne(`n_{${i + 1}}=${nb(l.effectif)}`, [latex(`${xi(i)}=${nb(l.valeur)}`), texte(` apparaît ${l.effectif} fois dans la liste`)])),
        ...lignesSomme("\\Sigma n_i", lignes.map((l) => l.effectif), "on additionne les effectifs"),
      ],
      [texte(`Valeurs distinctes rangées : ${lignes.map((l) => nbt(l.valeur)).join(" ; ")} (en ${e.contexte.unite}).`)],
      "Effectifs",
    ),
    resultat("a", listeResultat(lignes.map((l, i) => `${xi(i)}=${nb(l.valeur)}\\ :\\ n_{${i + 1}}=${nb(l.effectif)}`))),
    verification("a", [texte(`La somme des effectifs vaut ${n} : c'est bien le nombre de données de la liste, aucune n'est oubliée.`)]),
    piege("a", [texte("Les valeurs se rangent par ordre croissant, jamais dans l'ordre où elles apparaissent dans la liste.")]),
    // b) Fréquences
    utilise("b", [texte("Fréquence d'une valeur, en % : "), latex("f_i=\\dfrac{n_i}{n}\\times 100\\,\\%"), texte(`, avec n = ${n} ${COURS_FREQUENCES}.`)]),
    calcul("b", lignes.map((l, i) => ligneFrequence(`f_{${i + 1}}`, l.effectif, n, l.frequencePourcent, [latex(`${xi(i)}=${nb(l.valeur)}`)])), [], "Fréquences"),
    resultat("b", listeResultat(lignes.map((l, i) => `f_{${i + 1}}=${nb(l.frequencePourcent)}\\,\\%`))),
    verification("b", [texte("La somme des fréquences vaut 100 % :")], lignesSomme("\\Sigma f_i", lignes.map((l) => l.frequencePourcent), undefined, "\\,\\%")),
    piege("b", [texte(`On divise par n = ${n}, le nombre total de données — jamais par le nombre de valeurs distinctes (${k}).`)]),
    // c) Effectifs cumulés
    utilise("c", [
      texte("Effectif cumulé : celui de la ligne précédente plus l'effectif de la ligne, "),
      latex("v_i=v_{i-1}+n_i"),
      texte(" ; pour la première valeur, "),
      latex("v_1=n_1"),
      texte(` ${COURS_FREQUENCES}.`),
    ]),
    calcul(
      "c",
      lignes.map((l, i) =>
        i === 0
          ? ligne(`v_{1}=${nb(l.effectif)}`, [texte("première valeur : "), latex("v_1=n_1")])
          : ligne(`v_{${i + 1}}=${nb(lignes[i - 1].effectifCumule)}+${nb(l.effectif)}=${nb(l.effectifCumule)}`, [latex(`v_{${i + 1}}=v_{${i}}+n_{${i + 1}}`)]),
      ),
      [],
      "Effectifs cumulés",
    ),
    resultat("c", listeResultat(lignes.map((l, i) => `v_{${i + 1}}=${nb(l.effectifCumule)}`))),
    verification("c", [texte(`Le dernier effectif cumulé vaut n = ${n} : `), latex(`v_{${k}}=${nb(derniere.effectifCumule)}`), texte(".")]),
    piege("c", [texte("On cumule dans l'ordre croissant des valeurs ; le dernier effectif cumulé doit valoir n.")]),
    // d) Fréquences cumulées
    utilise("d", [
      texte("La fréquence cumulée se déduit de l'effectif cumulé : "),
      latex("\\varphi_i=\\dfrac{v_i}{n}\\times 100\\,\\%"),
      texte(` (c'est aussi la fréquence cumulée précédente plus la fréquence de la ligne) ${COURS_FREQUENCES}.`),
    ]),
    calcul("d", lignes.map((l, i) => ligneFrequence(`\\varphi_{${i + 1}}`, l.effectifCumule, n, l.frequenceCumulee, [latex(`v_{${i + 1}}=${nb(l.effectifCumule)}`)])), [], "Fréquences cumulées"),
    resultat("d", listeResultat(lignes.map((l, i) => `\\varphi_{${i + 1}}=${nb(l.frequenceCumulee)}\\,\\%`))),
    verification("d", [texte("La dernière fréquence cumulée vaut 100 % : "), latex(`\\varphi_{${k}}=${nb(derniere.frequenceCumulee)}\\,\\%`), texte(".")]),
  ]);
}
