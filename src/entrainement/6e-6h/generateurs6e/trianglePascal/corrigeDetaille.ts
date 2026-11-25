import type { EtapeCorrection, FragmentConsigne } from "../../../export/genererFeuilleExercices";
import { calcul, lettreEtape, ligne, piege, resultat, utilise, verification } from "../../../export/corrigeTableau";
import type { Frag } from "../../../5e-4h/ui5e/ecransTrigo.types";
import { lx, tx } from "../../../5e-4h/ui5e/ecransTrigo.types";
import type { Exercice102 } from "../../core6e/trianglePascal";
import { identite, ligneTriangle, phases102, valeur102 } from "../../core6e/trianglePascal";
import { CL, comb, mil } from "../../ui6e/nombresCombinatoireLotH";
import { figurePascal, reponse102 } from "../../ui6e/formatTrianglePascal";

/**
 * Corrigé détaillé « comme au tableau » de `6gen102`, une lettre par écran : relation de Pascal
 * (les deux voisins lus sur la ligne au-dessus), symétrie (indices complémentaires), somme d'une
 * ligne (2ⁿ, vérifiée en doublant la somme de la ligne précédente), parties (2ⁿ puis complément),
 * identité (propriété citée, membres comparés). Figure complétée en `figureHtml` pour « ligne ».
 */

type E = Exercice102;
const fr = (f: Frag[]): FragmentConsigne[] => f as FragmentConsigne[];
const t = tx;
const l = lx;
const PASCAL = `${CL("n", "k")}+${CL("n", "k+1")}=${CL("n+1", "k+1")}`;
const SYM = `${CL("n", "k")}=${CL("n", "n-k")}`;
const SOMME = `${CL("n", 0)}+${CL("n", 1)}+\\cdots+${CL("n", "n")}=2^n`;

export function correctionDetaillee102(e: E): EtapeCorrection[] {
  const out: EtapeCorrection[] = [];
  const { n, k } = e;
  phases102(e).forEach((p, i) => {
    const sq = lettreEtape(i);
    switch (p) {
      case "pascal":
        out.push(
          utilise(sq, fr([t("Relation de Pascal (cours, § 3) : "), l(PASCAL), t(".")])),
          calcul(sq, [ligne(`${CL(n + 1, k)}=${CL(n, k - 1)}+${CL(n, k)}`, "les deux nombres au-dessus"), ligne(`=${mil(comb(n, k - 1))}+${mil(comb(n, k))}`, `lus sur la ligne ${n}`), ligne(`=${mil(valeur102(e, p))}`)]),
          resultat(sq, fr(reponse102(e, p))),
        );
        break;
      case "symetrique":
        out.push(
          utilise(sq, fr([t("Symétrie (cours, § 3) : "), l(SYM), t(".")])),
          calcul(sq, [ligne(`${n + 1}-${n + 1 - k}=${k}`, "indice symétrique"), ligne(`${CL(n + 1, n + 1 - k)}=${CL(n + 1, k)}=${mil(valeur102(e, p))}`, "trouvé à l'étape 1")]),
          { ...resultat(sq, fr(reponse102(e, p))), figureHtml: figurePascal(e, true) ?? undefined },
        );
        break;
      case "somme":
        out.push(
          utilise(sq, fr([t("Somme d'une ligne (cours, § 3) : "), l(SOMME), t(".")])),
          calcul(sq, [ligne(`S_{${n + 1}}=2^{${n + 1}}`), ligne(`=${mil(valeur102(e, p))}`)]),
          resultat(sq, fr(reponse102(e, p))),
          verification(sq, fr([t(`La somme de la ligne ${n} vaut `), l(`${ligneTriangle(n).length > 6 ? `2^{${n}}` : ligneTriangle(n).join("+")}=${mil(2 ** n)}`), t(" ; chaque ligne double la somme de la précédente : "), l(`2\\times ${mil(2 ** n)}=${mil(2 ** (n + 1))}`), t(".")])),
          piege(sq, fr([t("Donner "), l(`2^{${n}}`), t(", la somme de la ligne au-dessus.")])),
        );
        break;
      case "partenaire":
        out.push(
          utilise(sq, fr([t("Symétrie (cours, § 3) : "), l(SYM), t(".")])),
          calcul(sq, [ligne(`${n}-${n - k}=${k}`, "indice symétrique"), ligne(`${CL(n, n - k)}=${CL(n, k)}=${mil(valeur102(e, p))}`, "valeur donnée")]),
          resultat(sq, fr(reponse102(e, p))),
          piege(sq, fr([t("Prendre "), l(CL(n, k + 1)), t(" : le partenaire de symétrie a des indices de somme "), l(`${n}`), t(".")])),
        );
        break;
      case "suivant":
        out.push(
          utilise(sq, fr([t("Relation de Pascal (cours, § 3) : "), l(PASCAL), t(".")])),
          calcul(sq, [ligne(`${CL(n + 1, k + 1)}=${CL(n, k)}+${CL(n, k + 1)}`), ligne(`=${mil(comb(n, k))}+${mil(comb(n, k + 1))}`, "valeurs données"), ligne(`=${mil(valeur102(e, p))}`)]),
          resultat(sq, fr(reponse102(e, p))),
        );
        break;
      case "toutes":
        out.push(
          utilise(sq, fr([t("Un ensemble à "), l("n"), t(" éléments a "), l("2^n"), t(" parties (somme de la ligne "), l("n"), t(", cours, § 3) : chaque élément est pris ou non.")])),
          calcul(sq, [ligne(`${CL(n, 0)}+${CL(n, 1)}+\\cdots+${CL(n, n)}=2^{${n}}`), ligne(`=${mil(valeur102(e, p))}`)]),
          resultat(sq, fr(reponse102(e, p))),
        );
        break;
      case "contrainte": {
        const lignes =
          e.contrainte === "auMoinsDeux"
            ? [ligne(`N=2^{${n}}-${CL(n, 0)}-${CL(n, 1)}`, "sans la partie vide ni les parties à un élément"), ligne(`=${mil(2 ** n)}-1-${n}`), ligne(`=${mil(valeur102(e, p))}`)]
            : [ligne(`N=2^{${n}}-1`, e.contrainte === "pasTous" ? `sans la partie à ${n} éléments` : "sans la partie vide"), ligne(`=${mil(valeur102(e, p))}`)];
        out.push(
          utilise(sq, fr([t("Complément : toutes les parties, moins celles qui ne respectent pas la contrainte.")])),
          calcul(sq, lignes),
          resultat(sq, fr(reponse102(e, p))),
          piege(sq, fr([t(e.contrainte === "auMoinsDeux" ? "Ne retirer que la partie vide : les parties à un seul élément ne conviennent pas non plus." : "Répondre "), ...(e.contrainte === "auMoinsDeux" ? [] : [l(`2^{${n}}`), t(" : une partie ne respecte pas la contrainte.")])])),
        );
        break;
      }
      case "propriete":
        out.push(
          utilise(sq, fr([t("Les trois propriétés du triangle (cours, § 3) : Pascal "), l(PASCAL), t(", symétrie "), l(SYM), t(", somme "), l(SOMME), t(".")])),
          resultat(sq, fr([t(e.propriete === "pascal" ? "Deux coefficients voisins d'une même ligne sont additionnés : relation de Pascal." : e.propriete === "symetrie" ? "Deux coefficients d'une même ligne sont comparés : symétrie." : "Toute une ligne est additionnée : somme d'une ligne.")])),
        );
        break;
      case "verdict": {
        const id = identite(e);
        const juste = e.propriete === "pascal" ? CL(n + 1, k + 1) : e.propriete === "symetrie" ? CL(n, n - k) : `2^{${n}}`;
        out.push(
          utilise(sq, fr([t("On applique la propriété à l'égalité, indice par indice.")])),
          calcul(sq, e.vrai ? [ligne(`${id.gauche}=${juste}`, "propriété du cours : c'est le membre de droite")] : [ligne(`${id.gauche}=${juste}`, "propriété du cours"), ligne(`${juste}\\neq ${id.droite}`, "membre de droite différent")]),
          resultat(sq, fr(reponse102(e, p))),
          verification(sq, fr([t("Valeurs : "), l(`${id.gauche}=${mil(id.vg)}`), t(" et "), l(`${id.droite}=${mil(id.vd)}`), t(".")])),
        );
        break;
      }
    }
  });
  return out;
}
