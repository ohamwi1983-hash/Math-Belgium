import type { ExerciceMethodeGeneratrices } from "../../core6e/methodeGeneratrices.types";
import { tirerEntier } from "./aleatoire";
import { construireOptionsRestriction, fractionTexte } from "./texte";

/**
 * Couche A (6e) — famille A ("Parallélogramme") de `6gen57`. ABCD parallélogramme, A(0;0), B(b;0),
 * D(0;d), C(b;d). Z∈]AD[, Y∈]BC[ à la hauteur α∈]0;d[, YZ∥AB. Lieu cherché : intersection de (AY) et
 * (BZ).
 *
 * **Dérivation (voir `docs/historique-6e.md` pour le détail complet)** : Z=(0,α), Y=(b,α).
 * Génératrice AY (droite (0,0)-(b,α)) : `alpha*x - b*y = 0`. Génératrice BZ (droite (b,0)-(0,α)) :
 * `alpha*(x-b) + b*y = 0`. Les 2 coefficients de α diffèrent réellement (x et x-b) — élimination par
 * PRODUIT CROISÉ (P1·Q2 − P2·Q1) légitime ici, donne `b*y*(2*x-b)=0` (brut), soit `y*(2*x-b)=0` une
 * fois divisé par b — exactement le "Résultat attendu (vérifié)" de la mission, indépendant de d.
 * Segment propre : α∈]0,d[ ⇒ y=α/2∈]0,d/2[ sur la droite x=b/2, entre le milieu de [AB] (α→0) et le
 * point d'intersection des diagonales (α→d, milieu de [AC] aussi).
 */
export function construireFamilleA(b: number = tirerEntier(2, 6), d: number = tirerEntier(2, 6)): ExerciceMethodeGeneratrices {
  const generatrice1 = `alpha*x-${b}*y=0`;
  const generatrice2 = `alpha*(x-${b})+${b}*y=0`;
  const elimineBrut = `${b}*y*(2*x-${b})=0`;
  const elimineFactorise = `y*(2*x-${b})=0`;
  const equationLieuPropre = `x=${fractionTexte(b, 2)}`;

  const { options, idCorrecte } = construireOptionsRestriction(
    `Segment ouvert entre le milieu de [AB] et le point d'intersection des diagonales`,
    [`Droite entière x=${fractionTexte(b, 2)} (aucune restriction)`, `Segment FERMÉ (bornes incluses) entre le milieu de [AB] et le milieu de [CD]`, `Point isolé exclu, au milieu de [AB]`],
  );

  return {
    donnees: { famille: "A", b, d },
    generatrice1,
    generatrice2,
    elimineBrut,
    elimineFactorise,
    morceaux: [
      { label: "y = 0", statut: "singulier" },
      { label: `2x − ${b} = 0`, statut: "propre" },
    ],
    equationLieuPropre,
    optionsRestriction: options,
    idRestrictionCorrecte: idCorrecte,
  };
}
