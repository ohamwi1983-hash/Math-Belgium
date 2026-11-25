import type { EtapeCorrection, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, lettreEtape, ligne, piege, resultat, utilise, verification } from "../../../export/corrigeTableau";
import { lx, tx } from "../../../5e-4h/ui5e/ecransTrigo.types";
import type { CandidatValide, Exercice112 } from "../../core6e/fonctionRepartition";
import { Fi, cumuls, phases112, probaIntervalle, probaQueue, valeurF } from "../../core6e/fonctionRepartition";
import { evenementIntervalle, evenementIntervalleC, evenementProba, evenementQueue, formuleDensite, formuleF, raisonInvalide, reponse112 } from "../../ui6e/formatFonctionRepartition";
import { escalierSvg } from "../../ui6e/figuresVariablesAleatoiresLotH1";
import { dl, fr, moins, q, ql } from "../../ui6e/outilsVariablesAleatoiresLotH1";

/**
 * Corrigé détaillé « comme au tableau » de `6gen112`, une lettre par écran. Escalier : F cumulée valeur
 * par valeur (graphique en escalier dans le corrigé : point plein = valeur prise), intervalle par
 * F(b) − F(a) avec les bornes décalées à la valeur voisine, complément ; vérifiés par la somme des
 * P(X = x) concernées. Continue : propriétés d'une fonction de répartition (raison qui disqualifie
 * l'autre), substitution dans F, F(b) − F(a), dérivée (vérifiée : F(L) − F(0) = 1).
 */

type E = Exercice112;
const t = tx;
const l = lx;
const p100 = (c: number) => dl(c / 100);

/** F(a) écrite avec la valeur substituée (sans le résultat). */
function substitue(nom: CandidatValide, L: number, a: number): string {
  switch (nom) {
    case "carre":
      return `\\dfrac{${a}^2}{${L * L}}`;
    case "lineaire":
      return `\\dfrac{${a}}{${L}}`;
    case "concave":
      return `\\dfrac{${2 * L}\\times ${a}-${a}^2}{${L * L}}`;
    case "cube":
      return `\\dfrac{${a}^3}{${L ** 3}}`;
  }
}

function lignesRepartition(e: E): LigneCalcul[] {
  const c = cumuls(e);
  return e.valeurs!.map((x, i) =>
    i === 0 ? ligne(`F(${x})=P(X=${x})=${p100(c[0]!)}`, "première valeur") : ligne(`F(${x})=${p100(c[i - 1]!)}+${p100(e.probas![i]!)}=${p100(c[i]!)}`, i === 1 ? "on ajoute P(X = x)" : undefined),
  );
}

/** Retire une ligne « = … » identique à la précédente (substitution déjà égale au résultat). */
function sansDoublons(lignes: LigneCalcul[]): LigneCalcul[] {
  const droite = (x: string) => x.slice(x.indexOf("=") + 1);
  return lignes.filter((lg, i) => i === 0 || !lg.latex.startsWith("=") || droite(lg.latex) !== droite(lignes[i - 1]!.latex));
}

/** Valeurs de X dans l'intervalle (ou la queue) : « 2, 3 et 4 ». */
function liste(xs: number[]): string {
  return xs.length === 1 ? `${xs[0]}` : `${xs.slice(0, -1).join(", ")} et ${xs[xs.length - 1]}`;
}

export function correctionDetaillee112(e: E): EtapeCorrection[] {
  const out: EtapeCorrection[] = [];
  phases112(e).forEach((ph, i) => {
    const sq = lettreEtape(i);
    switch (ph) {
      case "repartition": {
        const c = cumuls(e);
        out.push(
          utilise(sq, [t("Fonction de répartition (cours, § 1) : "), l("F(x)=P(X\\leq x)"), t(", on cumule les probabilités.")]),
          calcul(sq, lignesRepartition(e)),
          resultat(sq, fr(reponse112(e, ph))),
          { ...verification(sq, [t("Le dernier palier vaut 1, comme il se doit. Graphique de F (point plein : la valeur est prise ; point vide : elle ne l'est pas) :")]), figureHtml: escalierSvg(e.valeurs!, c.map((x) => x / 100)) },
          piege(sq, [t("Donner les probabilités "), l("P(X=x)"), t(" au lieu de leurs cumuls.")]),
        );
        break;
      }
      case "intervalle": {
        const { haut, bas, valeur } = probaIntervalle(e);
        const xs = e.valeurs!.slice(bas + 1, haut + 1);
        const lignes: LigneCalcul[] =
          bas < 0
            ? [ligne(`${evenementIntervalle(e)}=P(X\\leq ${e.valeurs![haut]})`, `valeurs ${liste(xs)}`), ligne(`=F(${e.valeurs![haut]})`), ligne(`=${p100(valeur)}`)]
            : [
                ligne(`${evenementIntervalle(e)}=P(X\\leq ${e.valeurs![haut]})-P(X\\leq ${e.valeurs![bas]})`, `valeurs ${liste(xs)}`),
                ligne(`=F(${e.valeurs![haut]})-F(${e.valeurs![bas]})`),
                ligne(`=${p100(Fi(e, haut))}-${p100(Fi(e, bas))}`),
                ligne(`=${p100(valeur)}`),
              ];
        out.push(
          utilise(sq, [t("Probabilité d'un intervalle (cours, § 1) : "), l("P(a<X\\leq b)=F(b)-F(a)"), t(" ; pour une variable discrète, on décale une borne à la valeur voisine selon qu'elle est incluse ou non.")]),
          calcul(sq, lignes),
          resultat(sq, fr(reponse112(e, ph))),
          verification(sq, [t("Somme des probabilités des valeurs concernées : "), l(`${xs.map((x) => `P(X=${x})`).join("+")}=${xs.map((x) => p100(e.probas![e.valeurs!.indexOf(x)]!)).join("+")}=${p100(valeur)}`), t(".")]),
          piege(sq, [t("Garder une borne exclue (ou retirer une borne incluse) : en discret, "), l("P(X=a)"), t(" n'est pas nulle.")]),
        );
        break;
      }
      case "queue": {
        const { indice, valeur } = probaQueue(e);
        const xs = e.valeurs!.slice(indice + 1);
        out.push(
          utilise(sq, [t("Événement contraire (cours, § 1) : "), l("P(X>a)=1-F(a)"), t(e.queue!.type === ">=" ? " ; le contraire de « au moins k » est « au plus la valeur juste avant k »." : ".")]),
          calcul(sq, [ligne(`${evenementQueue(e)}=1-P(X\\leq ${e.valeurs![indice]})`, "événement contraire"), ligne(`=1-F(${e.valeurs![indice]})`), ligne(`=1-${p100(Fi(e, indice))}`), ligne(`=${p100(valeur)}`)]),
          resultat(sq, fr(reponse112(e, ph))),
          verification(sq, [t("Somme des probabilités des valeurs concernées : "), l(`${xs.map((x) => p100(e.probas![e.valeurs!.indexOf(x)]!)).join("+")}=${p100(valeur)}`), t(".")]),
          piege(sq, e.queue!.type === ">=" ? [t("Calculer "), l(`1-F(${e.valeurs![e.queue!.k]})`), t(" : on retirerait aussi la valeur k, qui fait partie de l'événement.")] : [t("Calculer "), l(`1-F(${e.valeurs![e.queue!.k - 1]})`), t(" : la valeur k ne fait pas partie de « plus de k ».")]),
        );
        break;
      }
      case "choix":
        out.push(
          utilise(sq, [t("Fonction de répartition d'une variable continue (cours, § 3) : croissante, nulle à gauche, égale à 1 à droite, et continue (aucun saut).")]),
          resultat(sq, fr(reponse112(e, ph))),
          verification(sq, [t("L'autre fonction ne convient pas : "), ...fr(raisonInvalide(e))]),
          piege(sq, [t("Vérifier seulement la valeur en 0 ou en "), l(`${e.L}`), t(" : il faut aussi que la fonction soit croissante (et reste entre 0 et 1).")]),
        );
        break;
      case "proba": {
        const { a, type } = e.proba!;
        const F = valeurF(e, a);
        const lignes: LigneCalcul[] =
          type === "<="
            ? [ligne(`${evenementProba(e)}=F(${a})`, "définition de F"), ligne(`=${substitue(e.valide!, e.L!, a)}`), ligne(`=${ql(F)}`)]
            : [ligne(`${evenementProba(e)}=1-F(${a})`, "événement contraire"), ligne(`=1-${substitue(e.valide!, e.L!, a)}`), ligne(`=1-${ql(F)}`), ligne(`=${ql(moins(q(1), F))}`)];
        out.push(
          utilise(sq, [t("Propriétés de F (cours, § 3) : "), l("P(X\\leq a)=F(a)"), t(" et "), l("P(X>a)=1-F(a)"), t(".")]),
          calcul(sq, sansDoublons(lignes)),
          resultat(sq, fr(reponse112(e, ph))),
          piege(sq, type === "<=" ? [t("Prendre le complément alors que "), l("P(X\\leq a)"), t(" est directement F(a).")] : [t("Oublier le complément : "), l("F(a)"), t(" est "), l("P(X\\leq a)"), t(", pas "), l("P(X>a)"), t(".")]),
        );
        break;
      }
      case "intervalleC": {
        const { a, b } = e.bornes!;
        const Fa = valeurF(e, a);
        const Fb = valeurF(e, b);
        out.push(
          utilise(sq, [t("Propriétés de F (cours, § 3) : "), l("P(a<X<b)=F(b)-F(a)"), t(", bornes strictes ou larges : même valeur, car "), l("P(X=a)=0"), t(".")]),
          calcul(sq, sansDoublons([ligne(`${evenementIntervalleC(e)}=F(${b})-F(${a})`), ligne(`=${substitue(e.valide!, e.L!, b)}-${substitue(e.valide!, e.L!, a)}`), ligne(`=${ql(Fb)}-${ql(Fa)}`), ligne(`=${ql(moins(Fb, Fa))}`)])),
          resultat(sq, fr(reponse112(e, ph))),
          piege(sq, [t("Calculer seulement "), l(`F(${b})`), t(" : c'est "), l(`P(X\\leq ${b})`), t(", qui contient aussi les valeurs inférieures à "), l(`${a}`), t(".")]),
        );
        break;
      }
      case "densite":
        out.push(
          utilise(sq, [t("La densité est la dérivée de la fonction de répartition (cours, § 3) : "), l("f=F'"), t(".")]),
          calcul(sq, [ligne(`f(x)=F'(x)`), ligne(`=\\left(${formuleF(e.valide!, e.L!)}\\right)'`), ligne(`=${formuleDensite(e.valide!, e.L!)}`, "le dénominateur est une constante")]),
          resultat(sq, fr(reponse112(e, ph))),
          verification(sq, [t("L'aire sous f vaut bien 1 : "), l(`\\displaystyle\\int_0^{${e.L}}f(x)\\,dx=F(${e.L})-F(0)=1-0=1`), t(".")]),
          piege(sq, [t("Recopier F au lieu de la dériver : F donne des probabilités cumulées, f une densité.")]),
        );
        break;
    }
  });
  return out;
}
