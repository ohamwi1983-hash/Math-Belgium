import type { ExerciceMethodeGeneratrices } from "../../core6e/methodeGeneratrices.types";
import { tirerEntier } from "./aleatoire";
import { construireOptionsRestriction } from "./texte";

/**
 * Couche A (6e) — famille B ("Triangle et céviennes parallèles") de `6gen57`. B(0;0), C(c;0),
 * A(0;a). d∥BC coupe [AB] en D et [AC] en E, à la hauteur α. Lieu cherché : intersection de (BE) et
 * (CD).
 *
 * **Dérivation** : D=(0,α), E=(c(a-α)/a,α). Génératrice BE : `alpha*(a*x+c*y)=a*c*y`. Génératrice
 * CD : `alpha*(c-x)=c*y`. Coefficients de α réellement différents ⇒ élimination par produit croisé,
 * donne `c*y*(2*a*x+c*y-a*c)=0` (brut), soit `y*(2*a*x+c*y-a*c)=0` une fois divisé par c —
 * exactement le "Résultat attendu (vérifié)". Le morceau propre est la médiane issue de A (vérifiée
 * ci-contre : passe par A(0,a) et par le milieu de [BC]). Segment propre : α∈]0,a[ borne le lieu
 * entre le milieu de [BC] (α→0) et le sommet A (α→a).
 */
export function construireFamilleB(a: number = tirerEntier(2, 6), c: number = tirerEntier(2, 6)): ExerciceMethodeGeneratrices {
  const generatrice1 = `alpha*(${a}*x+${c}*y)=${a}*${c}*y`;
  const generatrice2 = `alpha*(${c}-x)=${c}*y`;
  const elimineBrut = `${c}*y*(2*${a}*x+${c}*y-${a}*${c})=0`;
  const elimineFactorise = `y*(2*${a}*x+${c}*y-${a}*${c})=0`;
  const equationLieuPropre = `2*${a}*x+${c}*y-${a}*${c}=0`;

  const { options, idCorrecte } = construireOptionsRestriction(
    `Segment ouvert entre le milieu de [BC] et le sommet A`,
    [`Droite entière (aucune restriction)`, `Segment FERMÉ (bornes incluses) entre le milieu de [BC] et le sommet A`, `Point isolé exclu, au sommet A`],
  );

  return {
    donnees: { famille: "B", a, c },
    generatrice1,
    generatrice2,
    elimineBrut,
    elimineFactorise,
    morceaux: [
      { label: "y = 0", statut: "singulier" },
      { label: `2·${a}x + ${c}y − ${a * c} = 0`, statut: "propre" },
    ],
    equationLieuPropre,
    optionsRestriction: options,
    idRestrictionCorrecte: idCorrecte,
  };
}
