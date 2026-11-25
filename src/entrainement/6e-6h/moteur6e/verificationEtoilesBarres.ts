import type { StatutVerification } from "../../5e-4h/moteur/statutVerification";
import type { Frag } from "../../5e-4h/ui5e/ecransTrigo.types";
import { lx, tx } from "../../5e-4h/ui5e/ecransTrigo.types";
import type { Exercice104, Phase104 } from "../core6e/etoilesBarres";
import { barres, pLibre, reponse104, symboles } from "../core6e/etoilesBarres";
import { comb } from "../ui6e/nombresCombinatoireLotH";
import { lireCompte, vautEntier } from "./lectureCombinatoireLotH";

/**
 * Vérification de `6gen104`. Saisie LUE avant tout verdict (illisible → `parse_error`, aucune
 * tentative) ; calcul exact (« 7!/(3!·4!) », « C(7 ; 3) », « 35 » acceptés). Écran « codage » :
 * le nombre de barres peut être n − 1 (barres) ou, si l'élève compte les étoiles, il est refusé
 * avec un message ciblé. Messages ciblés : n et p inversés, objet obligatoire oublié, une barre de
 * trop, Cₙᵖ sans répétition, nᵖ (ordre compté), mauvais haut de C.
 */

type E = Exercice104;
type P = Phase104;
const t = tx;
const l = lx;

const statut = (brut: string, attendu: number): StatutVerification => {
  if (lireCompte(brut) === null) return "parse_error";
  return vautEntier(brut, attendu) ? "correct" : "not_equivalent";
};

export function diagnostiquer104(e: E, p: P, valeurs: string[]): StatutVerification[] {
  if (p === "np") return [statut(valeurs[0] ?? "", e.n), statut(valeurs[1] ?? "", pLibre(e))];
  if (p === "codage") return [statut(valeurs[0] ?? "", symboles(e)), statut(valeurs[1] ?? "", barres(e))];
  return [statut(valeurs[0] ?? "", reponse104(e))];
}

export function piege104(e: E, p: P, valeurs: string[]): Frag[] | null {
  const v = valeurs.map((x) => lireCompte(x));
  const libre = pLibre(e);
  if (p === "np") {
    if (v[0] === libre && v[1] === e.n) return [t("Les deux nombres sont inversés : les cases sont les choix possibles (ce qui peut se répéter), les objets sont ce qu'on répartit.")];
    if (e.variante === "auMoinsUn" && v[1] === e.p) return [t("Chaque case a déjà reçu un objet : il ne reste à répartir que les objets en trop.")];
    return null;
  }
  if (p === "codage") {
    if (v[0] === libre + e.n) return [t("Il y a une barre de moins que de cases : "), l(`${e.n}`), t(" cases sont séparées par "), l(`${e.n}-1`), t(" barres.")];
    if (v[1] === e.n) return [t("Les barres séparent deux cases voisines : il y en a une de moins que de cases.")];
    if (v[1] === libre && v[1] !== barres(e)) return [t("C'est le nombre d'étoiles (les objets) ; on demande le nombre de barres.")];
    return null;
  }
  const r = v[0];
  if (r === null) return null;
  const attendu = reponse104(e);
  const pieges: { valeur: number; message: Frag[] }[] = [
    { valeur: comb(e.n, libre), message: [t("C'est "), l("C_n^p"), t(", une combinaison sans répétition : ici, une même case peut recevoir plusieurs objets.")] },
    { valeur: e.n ** libre, message: [t("C'est "), l("n^p"), t(" : il compte l'ordre des objets, alors qu'ils sont identiques (seul compte le nombre d'objets par case).")] },
    { valeur: comb(libre + e.n, libre), message: [t("Le haut du "), l("C"), t(" est le nombre de symboles, "), l("n+p-1"), t(" : il y a une barre de moins que de cases.")] },
    { valeur: comb(symboles(e), e.n), message: [t("On choisit la place des "), l("n-1"), t(" barres (ou des "), l("p"), t(" étoiles) parmi les symboles, pas de "), l("n"), t(" symboles.")] },
  ];
  if (e.variante === "auMoinsUn") pieges.push({ valeur: comb(e.p + e.n - 1, e.n - 1), message: [t("Ce calcul autorise les cases vides : retire d'abord un objet par case.")] });
  for (const x of pieges) if (x.valeur !== attendu && r === x.valeur) return x.message;
  return null;
}
