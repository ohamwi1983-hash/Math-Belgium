import type { EtapeCorrection, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, lettreEtape, ligne, piege, resultat, utilise, verification } from "../../../export/corrigeTableau";
import { lx, tx } from "../../../5e-4h/ui5e/ecransTrigo.types";
import type { Exercice110, Loi110 } from "../../core6e/varianceLoiDiscrete";
import { ecartType, esperance, esperanceCarres, phases110, variance } from "../../core6e/varianceLoiDiscrete";
import { reponse110, sommeProduits } from "../../ui6e/formatVarianceLoiDiscrete";
import { dl, dlp, fr, sommeLatex } from "../../ui6e/outilsVariablesAleatoiresLotH1";

/**
 * Corrigé détaillé « comme au tableau » de `6gen110`, une lettre par écran : somme pondérée de
 * l'espérance (produits, puis somme), E(X²) de même, formule de König (carré de l'espérance calculé
 * sur sa ligne), racine de la variance (vérifiée en l'élevant au carré) ; variante `risque` : un bloc
 * par jeu, puis la comparaison des variances. Même source que l'écran (`reponse110`).
 */

type E = Exercice110;
const t = tx;
const l = lx;

/** Longueur visible d'une formule (sans commandes ni accolades) : au-delà de 40 caractères, la ligne
 * des produits ne tiendrait pas dans la colonne du corrigé papier (≈ 230 px). */
const visible = (latex: string) => latex.replace(/\\times/g, "×").replace(/\\[a-zA-Z]+|[{}]/g, "").length;

/** Somme pondérée : produits écrits, puis leurs valeurs, puis la somme ; si la ligne des produits est
 * trop longue, on écrit directement les valeurs des produits (calcul mental élémentaire). */
function lignesSomme(gauche: string, L: Loi110, carre: boolean, justification: string, total: number): LigneCalcul[] {
  const produits = `${gauche}=${sommeProduits(L, carre)}`;
  const valeurs = sommeLatex(L.valeurs.map((x, i) => ((carre ? x * x : x) * L.probas[i]!) / 100));
  if (visible(produits) > 34) return [ligne(`${gauche}=${valeurs}`, carre ? "chaque valeur au carré × sa probabilité" : "chaque valeur × sa probabilité"), ligne(`=${dl(total)}`)];
  return [ligne(produits, justification), ligne(`=${valeurs}`), ligne(`=${dl(total)}`)];
}

function lignesEsperance(L: Loi110, nom: string): LigneCalcul[] {
  return lignesSomme(`E(${nom})`, L, false, "somme des valeurs pondérées", esperance(L));
}

function lignesCarres(L: Loi110, nom: string): LigneCalcul[] {
  return lignesSomme(`E(${nom}^2)`, L, true, "valeurs au carré, pondérées", esperanceCarres(L));
}

function lignesVariance(L: Loi110, nom: string): LigneCalcul[] {
  const E = esperance(L);
  return [
    ligne(`V(${nom})=E(${nom}^2)-[E(${nom})]^2`, "formule de König"),
    ligne(`=${dl(esperanceCarres(L))}-${dlp(E)}^2`),
    ligne(`=${dl(esperanceCarres(L))}-${dl(E * E)}`),
    ligne(`=${dl(variance(L))}`),
  ];
}

const sommeProbas = (L: Loi110) => `${L.probas.map((p) => dl(p / 100)).join("+")}=1`;

export function correctionDetaillee110(e: E): EtapeCorrection[] {
  const out: EtapeCorrection[] = [];
  const L = e.loi;
  phases110(e).forEach((ph, i) => {
    const sq = lettreEtape(i);
    switch (ph) {
      case "esperance":
        out.push(
          utilise(sq, [t("Espérance (cours, § 1) : somme des valeurs pondérées par leurs probabilités, "), l("E(X)=\\sum x_i\\times P(X=x_i)"), t(".")]),
          calcul(sq, lignesEsperance(L, "X")),
          resultat(sq, fr(reponse110(e, ph))),
          verification(sq, [t("La loi est valide : "), l(sommeProbas(L)), t(" ; l'espérance est bien comprise entre la plus petite et la plus grande valeur de X.")]),
          piege(sq, [t("Faire la moyenne simple des valeurs (sans les probabilités) : elle ignore que certaines valeurs sont plus probables.")]),
        );
        break;
      case "carres":
        out.push(
          utilise(sq, [t("Même somme pondérée (cours, § 1), avec les carrés des valeurs : "), l("E(X^2)=\\sum x_i^2\\times P(X=x_i)"), t(".")]),
          calcul(sq, lignesCarres(L, "X")),
          resultat(sq, fr(reponse110(e, ph))),
          piege(sq, L.valeurs[0]! < 0 ? [t("Compter négatif le carré d'une valeur négative : "), l(`${dlp(L.valeurs[0]!)}^2=${dl(L.valeurs[0]! ** 2)}`), t(".")] : [t("Calculer "), l("[E(X)]^2"), t(" à la place de "), l("E(X^2)"), t(" : on élève chaque valeur au carré avant de pondérer.")]),
        );
        break;
      case "variance":
        out.push(
          utilise(sq, [t("Formule de König (cours, § 1) : "), l("V(X)=E(X^2)-[E(X)]^2"), t(".")]),
          calcul(sq, lignesVariance(L, "X")),
          resultat(sq, fr(reponse110(e, ph))),
          piege(sq, [t("Oublier le carré de l'espérance ("), l("E(X^2)-E(X)"), t(") : une variance se mesure dans l'unité au carré.")]),
        );
        break;
      case "ecartType": {
        const s = ecartType(L);
        out.push(
          utilise(sq, [t("Écart-type (cours, § 1) : "), l("\\sigma(X)=\\sqrt{V(X)}"), t(", dans la même unité que X.")]),
          calcul(sq, [ligne(`\\sigma(X)=\\sqrt{${dl(variance(L))}}`, "racine carrée de la variance"), ligne(`=${dl(s)}`)]),
          resultat(sq, fr(reponse110(e, ph))),
          verification(sq, [l(`${dl(s)}^2=${dl(s * s)}`), t(" : on retrouve la variance.")]),
          piege(sq, [t("Donner la variance comme écart-type : il faut encore prendre la racine carrée.")]),
        );
        break;
      }
      case "esperances":
        out.push(
          utilise(sq, [t("Espérance (cours, § 1) : "), l("E(X)=\\sum x_i\\times P(X=x_i)"), t(".")]),
          calcul(sq, lignesEsperance(L, "X"), [t("Jeu A :")]),
          calcul(sq, lignesEsperance(e.loiB!, "Y"), [t("Jeu B :")]),
          resultat(sq, fr(reponse110(e, ph))),
          piege(sq, [t("S'arrêter ici : deux jeux de même espérance rapportent autant en moyenne, mais pas avec le même risque.")]),
        );
        break;
      case "variances":
        out.push(
          utilise(sq, [t("Formule de König (cours, § 1) : "), l("V(X)=E(X^2)-[E(X)]^2"), t(", après "), l("E(X^2)=\\sum x_i^2\\times P(X=x_i)"), t(".")]),
          calcul(sq, [...lignesCarres(L, "X"), ...lignesVariance(L, "X")], [t("Jeu A :")]),
          calcul(sq, [...lignesCarres(e.loiB!, "Y"), ...lignesVariance(e.loiB!, "Y")], [t("Jeu B :")]),
          resultat(sq, fr(reponse110(e, ph))),
          piege(sq, [t("Oublier le carré de l'espérance dans la formule de König.")]),
        );
        break;
      case "verdict":
        out.push(
          utilise(sq, [t("La variance (cours, § 1) mesure la dispersion des gains autour de l'espérance : à espérance égale, le jeu le plus risqué a la plus grande variance (et le plus grand écart-type).")]),
          resultat(sq, fr(reponse110(e, ph))),
          verification(sq, [t("Écarts-types : "), l(`\\sigma(X)\\approx ${dl(Math.round(ecartType(L) * 100) / 100)}`), t(" et "), l(`\\sigma(Y)\\approx ${dl(Math.round(ecartType(e.loiB!) * 100) / 100)}`), t(" : même classement.")]),
          piege(sq, [t("Choisir le jeu qui a le plus grand gain possible : le risque se lit sur la variance, qui tient compte de toutes les valeurs et de leurs probabilités.")]),
        );
        break;
    }
  });
  return out;
}
