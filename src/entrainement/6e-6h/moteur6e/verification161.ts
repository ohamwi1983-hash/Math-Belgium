import type { Exercice161, Jeu } from "../core6e/quelJeuChoisir";
import { apres, couplesEcart, couplesSomme, proba } from "../core6e/quelJeuChoisir";
import type { StatutVerification } from "../moteur/statutVerification";
import type { Frag } from "../../5e-4h/ui5e/ecransTrigo.types";
import { lx, tx } from "../../5e-4h/ui5e/ecransTrigo.types";
import type { Phase161 } from "../ui6e/format161";
import { jeuDe, parContraire, verdict161 } from "../ui6e/format161";
import { qVal } from "../ui6e/nombresExp";
import { MESSAGE_APPROCHEE_PROBA, probabiliteApprochee, statutProbabilite, vaut } from "./lectureProbaLotG";

/**
 * Vérification de `6gen161` : probabilité de gagner comparée NUMÉRIQUEMENT à la valeur exacte
 * (toute écriture exacte acceptée) ; valeur décimale approchée arrêtée sans tentative ; choix fermé
 * comparé au verdict RECALCULÉ. Messages ciblés propres au jeu : probabilité de perdre donnée au
 * lieu de celle de gagner, probabilités additionnées au lieu de passer par le contraire, remise
 * oubliée ou ajoutée, un seul des deux chemins, sommes ou nombres de « pile » pris pour équiprobables.
 */

type E = Exercice161;
const t = tx;
const l = lx;

export function diagnostiquer(e: E, p: Phase161, valeurs: string[]): StatutVerification[] {
  if (p === "choix") return [valeurs[0] === verdict161(e) ? "correct" : "not_equivalent"];
  return [statutProbabilite(valeurs[0] ?? "", qVal(proba(jeuDe(e, p))))];
}

export function approchee(e: E, p: Phase161, valeurs: string[]): string | null {
  if (p === "choix") return null;
  return probabiliteApprochee(valeurs[0] ?? "", qVal(proba(jeuDe(e, p)))) ? MESSAGE_APPROCHEE_PROBA : null;
}

const CONTRAIRE_ADDITION: Frag[] = [t("Les probabilités ne s'additionnent pas ici (le cas « les deux » serait compté deux fois) : passe par l'événement contraire.")];

function piegeJeu(j: Jeu, s: string): Frag[] | null {
  const p = qVal(proba(j));
  if (parContraire(j) && vaut(s, 1 - p)) return [t("Tu as calculé la probabilité de perdre : il reste à prendre l'événement contraire, "), l("1-\\ldots"), t(".")];
  switch (j.type) {
    case "auMoinsUnDe":
      if (vaut(s, (2 * (7 - j.k)) / 6)) return CONTRAIRE_ADDITION;
      return null;
    case "repete":
      if (vaut(s, j.n / 6)) return CONTRAIRE_ADDITION;
      if (vaut(s, (1 / 6) ** j.n)) return [t("Ça, c'est la probabilité d'obtenir un 6 à chaque lancer ; ici, un seul 6 suffit.")];
      return null;
    case "somme": {
      if (vaut(s, 1 / 11)) return [t("Les 11 sommes possibles ne sont pas équiprobables : compte parmi les 36 couples.")];
      const c = j.mode === "egal" ? couplesSomme(j.s) : 0;
      if (j.mode === "egal" && vaut(s, Math.ceil(c / 2) / 21)) return [t("Les couples "), l("(1\\,;6)"), t(" et "), l("(6\\,;1)"), t(" sont différents : il y a 36 couples, pas 21.")];
      return null;
    }
    case "ecart":
      if (j.mode === "egal" && vaut(s, couplesEcart(j.d) / 2 / 36)) return [t("Compte les deux ordres : "), l(`(1\\,;${1 + j.d})`), t(" et "), l(`(${1 + j.d}\\,;1)`), t(" sont deux couples différents.")];
      return null;
    case "double":
      if (vaut(s, 1 / 36)) return [t("Il y a six doubles, pas un seul.")];
      return null;
    case "pieces":
      if (j.mode === "exactement" && vaut(s, 1 / 2 ** j.n)) return [t("Plusieurs chemins de l'arbre mènent au même nombre de « pile » : compte-les tous.")];
      if (vaut(s, 1 / (j.n + 1))) return [t("Les nombres de « pile » possibles ne sont pas équiprobables : compte les chemins de l'arbre.")];
      return null;
    case "urne": {
      const autre = { ...j, remise: !j.remise };
      if ((j.remise || (j.r >= 2 && j.v >= 2)) && Math.abs(qVal(proba(autre)) - p) > 1e-12 && vaut(s, qVal(proba(autre))))
        return j.remise ? [t("Avec remise, l'urne est la même au second tirage : le second facteur ne change pas.")] : [t("Sans remise, il reste une boule de moins au second tirage : le second facteur change.")];
      const n = j.r + j.v;
      const ar = apres(j, "r");
      const av = apres(j, "v");
      const RR = (j.r / n) * (ar.r / ar.n);
      const VV = (j.v / n) * (av.v / av.n);
      const RV = (j.r / n) * (ar.v / ar.n);
      if (j.evt === "meme" && (vaut(s, RR) || vaut(s, VV))) return [t("« Même couleur » : deux rouges ou deux vertes — additionne les deux chemins.")];
      if (j.evt === "differentes" && vaut(s, RV)) return [t("Deux chemins mènent à deux couleurs différentes : rouge puis verte, et verte puis rouge.")];
      if (j.evt === "auMoinsUneR" && vaut(s, RV + RR)) return [t("Il manque le chemin « verte puis rouge » : le plus simple est de passer par le contraire, « aucune rouge ».")];
      return null;
    }
    case "roue": {
      if (j.evt === "auMoinsUne" && vaut(s, (2 * j.k) / j.n)) return CONTRAIRE_ADDITION;
      if (j.evt === "exactementUne" && vaut(s, (j.k / j.n) * ((j.n - j.k) / j.n))) return [t("Deux chemins gagnants : gagnant puis perdant, et perdant puis gagnant.")];
      return null;
    }
    default:
      return null;
  }
}

export function piege(e: E, p: Phase161, valeurs: string[]): Frag[] | null {
  if (p !== "choix") return piegeJeu(jeuDe(e, p), valeurs[0] ?? "");
  const v = verdict161(e);
  if (v === "egal") return [t("Les deux probabilités sont égales : écrites au même dénominateur, elles ont le même numérateur.")];
  if (valeurs[0] === "egal") return [t("Les deux probabilités ne sont pas égales : écris-les au même dénominateur pour les comparer.")];
  return [t("Au même dénominateur, la fraction qui a le plus grand numérateur donne le plus de chances de gagner.")];
}
