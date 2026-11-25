import type { StatutVerification } from "../../5e-4h/moteur/statutVerification";
import type { Frag } from "../../5e-4h/ui5e/ecransTrigo.types";
import { lx, tx } from "../../5e-4h/ui5e/ecransTrigo.types";
import type { Exercice103, Phase103 } from "../core6e/anagrammesContraintes";
import { consonnesDe, sansUne, totalPermutations, valeur103, voyellesDe } from "../core6e/anagrammesContraintes";
import { fact } from "../ui6e/nombresCombinatoireLotH";
import { lireCompte, vautEntier } from "./lectureCombinatoireLotH";

/**
 * Vérification de `6gen103`. Saisie lue avant tout verdict (illisible → `parse_error`, aucune
 * tentative), écriture exacte quelconque (« 6!/(2!·2!) », « 180 − 1 », « 179 »). Messages ciblés :
 * répétitions non divisées (n!), le mot lui-même oublié (− 1) ou retiré à tort, lettre fixée non
 * retirée de son effectif, ordre interne du bloc oublié, bloc oublié comme symbole, complément
 * oublié (mots collés donnés), collées comptées sans fusionner la paire.
 */

type E = Exercice103;
type P = Phase103;
const t = tx;
const l = lx;

export function diagnostiquer103(e: E, p: P, valeurs: string[]): StatutVerification[] {
  const v = valeurs[0] ?? "";
  if (lireCompte(v) === null) return ["parse_error"];
  return [vautEntier(v, valeur103(e, p)) ? "correct" : "not_equivalent"];
}

export function piege103(e: E, p: P, valeurs: string[]): Frag[] | null {
  const r = lireCompte(valeurs[0] ?? "");
  if (r === null) return null;
  const m = e.mot;
  const attendu = valeur103(e, p);
  const cand: { valeur: number; message: Frag[] }[] = [];
  if (p === "total") cand.push({ valeur: fact(m.length), message: [t("C'est "), l(`${m.length}!`), t(" : il compte comme différents des mots qui ne diffèrent que par l'échange de deux lettres identiques. Divise par les factorielles des répétitions.")] });
  if (p === "anagrammes") {
    cand.push({ valeur: totalPermutations(m), message: [t(`Ce nombre compte aussi le mot ${m} lui-même, qui n'est pas une anagramme de lui-même : retire-le.`)] });
    cand.push({ valeur: fact(m.length) - 1, message: [t("Les lettres répétées : divise d'abord "), l(`${m.length}!`), t(" par les factorielles des répétitions.")] });
  }
  if (p === "fixe") {
    cand.push({ valeur: totalPermutations(m), message: [t("C'est le nombre de mots sans contrainte : la première lettre est imposée, il reste une lettre de moins à ranger.")] });
    const reste = sansUne(m, e.lettre!);
    cand.push({ valeur: fact(reste.length), message: [t("Parmi les lettres restantes, certaines sont encore identiques : divise par les factorielles de leurs répétitions.")] });
  }
  if (p === "interne") cand.push({ valeur: fact(voyellesDe(m).length), message: [t("Certaines voyelles sont identiques : divise par les factorielles de leurs répétitions.")] });
  if (p === "externe") {
    const c = consonnesDe(m);
    cand.push({ valeur: totalPermutations(c), message: [t("N'oublie pas le bloc des voyelles : il compte comme une lettre de plus à ranger.")] });
    cand.push({ valeur: fact(c.length + 1), message: [t("Certaines consonnes sont identiques : divise par les factorielles de leurs répétitions.")] });
  }
  if (p === "produit") {
    cand.push({ valeur: valeur103(e, "externe"), message: [t("Il manque l'ordre des voyelles à l'intérieur du bloc : multiplie par le nombre trouvé à l'écran 1.")] });
    cand.push({ valeur: valeur103(e, "interne") + valeur103(e, "externe"), message: [t("Les deux choix se font l'un et l'autre : on multiplie, on n'additionne pas.")] });
  }
  if (p === "collees") {
    cand.push({ valeur: totalPermutations(m), message: [t("C'est le nombre total de mots : colle d'abord les deux lettres en un seul symbole.")] });
    cand.push({ valeur: 2 * valeur103(e, "collees"), message: [t(`Les deux lettres ${e.lettre} sont identiques : les échanger dans la paire ne donne rien de nouveau.`)] });
  }
  if (p === "jamais") {
    cand.push({ valeur: valeur103(e, "collees"), message: [t("C'est le nombre de mots où elles sont collées : on demande le contraire (complément).")] });
    cand.push({ valeur: valeur103(e, "total") - 2 * valeur103(e, "collees"), message: [t("Les mots où les deux lettres sont collées ne sont comptés qu'une fois : retire-les une seule fois.")] });
  }
  for (const c of cand) if (c.valeur !== attendu && Math.abs(r - c.valeur) < 1e-9) return c.message;
  return null;
}
