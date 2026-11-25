import type { EtapeCorrection, FragmentConsigne, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import type { ExerciceChemins } from "../../core6e/cheminsQuadrillage";
import { apresP, avantP, cheminExemple, parP, reponseFinale, totalAB } from "../../core6e/cheminsQuadrillage";
import { reponse } from "../../ui6e/formatCheminsQuadrillage";
import { figureCheminExemple, motL } from "../../ui6e/figureCheminsQuadrillage";
import { C, cL, entL } from "../../ui6e/nombresCombinatoireLotH2";
import type { Frag } from "../../../5e-4h/ui5e/ecransTrigo.types";

/**
 * Corrigé détaillé « comme au tableau » de `6gen106`, partagé par l'appli et le papier — une lettre
 * par écran. Chaque comptage : déplacements de chaque sorte, mot de flèches, Cₐ₊ᵦᵇ calculé (produit
 * décroissant sur b!). La dernière étape montre un chemin d'exemple sur la figure (`figureHtml`), par P
 * (passage) ou en évitant P (éviter), avec son mot de flèches.
 */

type E = ExerciceChemins;
const t = texte;
const f = latex;
const fr = (x: Frag[]) => x as unknown as FragmentConsigne[];
const COURS = "(cours, § 4, chemins dans un quadrillage)";

function lignesC(n: number, k: number, justif?: string): LigneCalcul[] {
  const kk = Math.min(k, n - k);
  if (kk <= 1) return [ligne(`${cL(n, k)}=${entL(C(n, k))}`, justif)];
  const num = Array.from({ length: kk }, (_, i) => `${n - i}`).join("\\cdot ");
  return [ligne(`${cL(n, k)}=\\dfrac{${num}}{${kk}!}`, justif ?? (kk !== k ? [texte("symétrie : "), latex(`${cL(n, k)}=${cL(n, n - k)}`)] : undefined)), ligne(`=${entL(C(n, k))}`)];
}

/** Étape « comptage de chemins » d'un sous-trajet de a pas « → » et b pas « ↑ ». */
function comptage(sq: string, de: string, a: string, droite: number, haut: number, p: Parameters<typeof reponse>[1], e: E): EtapeCorrection[] {
  return [
    utilise(sq, [t("De "), f(de), t(" à "), f(a), t(" : "), f(`${droite}`), t(" pas vers la droite et "), f(`${haut}`), t(" vers le haut, soit "), f(`${droite + haut}`), t(" déplacements ; un chemin est un mot de ces flèches, fixé par les places des flèches vers le haut "), t(COURS), t(".")]),
    calcul(sq, lignesC(droite + haut, haut, `places des ${haut} flèches vers le haut parmi ${droite + haut}`)),
    resultat(sq, fr(reponse(e, p))),
  ];
}

export function correctionDetailleeChemins(e: E): EtapeCorrection[] {
  const etapes: EtapeCorrection[] = [];
  if (e.variante === "total") {
    const mot = cheminExemple(e, false);
    etapes.push(
      utilise("a", [t("Un chemin le plus court ne revient jamais en arrière : il franchit chaque carreau de largeur une fois vers la droite et chaque carreau de hauteur une fois vers le haut.")]),
      calcul("a", [ligne(`${e.m}+${e.n}=${e.m + e.n}`, `${e.m} pas vers la droite, ${e.n} vers le haut`)]),
      resultat("a", fr(reponse(e, "pas"))),
      utilise("b", [t("Un chemin est un mot de "), f(`${e.m + e.n}`), t(" flèches, dont "), f(`${e.n}`), t(" vers le haut ; il est fixé par les places de ces flèches, choisies sans ordre parmi les "), f(`${e.m + e.n}`), t(" déplacements "), t(COURS), t(".")]),
      calcul("b", lignesC(e.m + e.n, e.n)),
      { ...resultat("b", fr(reponse(e, "chemins"))), figureHtml: figureCheminExemple(e, mot) },
      verification("b", [t("Par symétrie, choisir les places des flèches vers la droite donne le même nombre :")], [ligne(`${cL(e.m + e.n, e.m)}=${cL(e.m + e.n, e.n)}=${entL(totalAB(e))}`)]),
      piege("b", [t("Le chemin d'exemple, "), f(motL(mot)), t(", est un mot parmi les "), f(entL(totalAB(e))), t(" ; écrire "), f(`2^{${e.m + e.n}}`), t(" reviendrait à laisser chaque déplacement libre, alors que leur nombre de chaque sorte est imposé.")]),
    );
    return etapes;
  }
  if (e.variante === "passage") {
    const mot = cheminExemple(e, true);
    etapes.push(...comptage("a", "A", "P", e.px, e.py, "avantP", e));
    etapes.push(...comptage("b", "P", "B", e.m - e.px, e.n - e.py, "apresP", e));
    etapes.push(
      utilise("c", [t("Principe de multiplication (cours, § 1) : un chemin par "), f("P"), t(" = un chemin de "), f("A"), t(" à "), f("P"), t(", puis un chemin de "), f("P"), t(" à "), f("B"), t(".")]),
      calcul("c", [ligne(`N=${entL(avantP(e))}\\times ${entL(apresP(e))}`), ligne(`=${entL(parP(e))}`)]),
      { ...resultat("c", fr(reponse(e, "chemins"))), figureHtml: figureCheminExemple(e, mot) },
      verification("c", [t("Le résultat est inférieur au nombre de tous les chemins de "), f("A"), t(" à "), f("B"), t(" :")], [ligne(`${entL(parP(e))}<${cL(e.m + e.n, e.n)}=${entL(totalAB(e))}`)]),
      piege("c", [t("Additionner les deux nombres : chaque début de chemin se combine avec chaque fin, on multiplie.")]),
    );
    return etapes;
  }
  // eviter
  const mot = cheminExemple(e, false);
  etapes.push(...comptage("a", "A", "B", e.m, e.n, "total", e));
  etapes.push(
    utilise("b", [t("Un chemin par "), f("P"), t(" = un chemin de "), f("A"), t(" à "), f("P"), t(" ("), f(`${e.px}`), t(" à droite, "), f(`${e.py}`), t(" en haut), puis un chemin de "), f("P"), t(" à "), f("B"), t(" ("), f(`${e.m - e.px}`), t(" à droite, "), f(`${e.n - e.py}`), t(" en haut) : principe de multiplication.")]),
    calcul("b", [...lignesC(e.px + e.py, e.py, "de A à P"), ...lignesC(e.m - e.px + e.n - e.py, e.n - e.py, "de P à B"), ligne(`${entL(avantP(e))}\\times ${entL(apresP(e))}=${entL(parP(e))}`, "par P")]),
    resultat("b", fr(reponse(e, "parP"))),
    utilise("c", [t("Complément (cours, § 2) : les chemins qui évitent "), f("P"), t(" sont tous les chemins, moins ceux qui passent par "), f("P"), t(".")]),
    calcul("c", [ligne(`N=${entL(totalAB(e))}-${entL(parP(e))}`), ligne(`=${entL(reponseFinale(e))}`)]),
    { ...resultat("c", fr(reponse(e, "chemins"))), figureHtml: figureCheminExemple(e, mot) },
    verification("c", [t("Les chemins par "), f("P"), t(" et ceux qui l'évitent se partagent tous les chemins :")], [ligne(`${entL(parP(e))}+${entL(reponseFinale(e))}=${entL(totalAB(e))}`)]),
    piege("c", [t("Retirer seulement les chemins de "), f("A"), t(" à "), f("P"), t(" (ou un seul chemin) : chacun d'eux se prolonge de "), f(`${entL(apresP(e))}`), t(" façons jusqu'à "), f("B"), t(".")]),
  );
  return etapes;
}
