import type { ExerciceMethodeGeneratrices } from "../../core6e/methodeGeneratrices.types";
import { tirerEntier, tirerParmi } from "./aleatoire";
import { construireOptionsRestriction, fractionTexte } from "./texte";

/**
 * Couche A (6e) — famille D ("Centre de gravité, médianes") de `6gen57`, 2 sous-cas. ABC triangle,
 * B,C fixes, A variable sur une droite d. M,N milieux de [AB],[AC]. Lieu cherché : intersection de
 * (BN) et (CM) — le centre de gravité G quand A varie.
 *
 * **Dérivation, structurellement DIFFÉRENTE de A/B/C** : dans les 2 sous-cas, les 2 génératrices
 * PARTAGENT LE MÊME coefficient de α (la propriété clé qui permet une soustraction directe des 2
 * équations plutôt qu'un produit croisé) — conséquence géométrique du fait que A se déplace toujours
 * PARALLÈLEMENT à l'un des 2 axes tandis que B,C restent sur l'autre axe. Ni A ni B, dans les 2
 * sous-cas, ne coïncide jamais avec l'autre droite pour une valeur admissible de α — d'où l'absence
 * totale de lieu singulier ou parasite (contrairement à A/B/C, qui ont un morceau y=0 singulier) :
 * ce générateur n'expose donc qu'UN SEUL morceau à l'écran 4 pour cette famille, toujours "propre".
 * Résultat cohérent avec la propriété du centre de gravité (moyenne des coordonnées des 3 sommets).
 */
export function construireSousCas1(c: number = tirerEntier(2, 6), h: number = tirerEntier(2, 6)): ExerciceMethodeGeneratrices {
  const generatrice1 = `y*(alpha+${c})=${h}*x`;
  const generatrice2 = `y*(alpha-2*${c})=${h}*(x-${c})`;
  const elimineBrut = `${c}*(3*y-${h})=0`;
  const elimineFactorise = `y=${fractionTexte(h, 3)}`;
  const equationLieuPropre = elimineFactorise;

  const { options, idCorrecte } = construireOptionsRestriction(`Aucune restriction — la droite entière est décrite quand α parcourt tout son domaine`, [
    `Segment ouvert entre B et C`,
    `Point isolé exclu, au milieu de [BC]`,
    `Segment ouvert entre le milieu de [AB] et le milieu de [AC]`,
  ]);

  return {
    donnees: { famille: "D", sousCas: 1, c, h },
    generatrice1,
    generatrice2,
    elimineBrut,
    elimineFactorise,
    morceaux: [{ label: `y = ${fractionTexte(h, 3)}`, statut: "propre" }],
    equationLieuPropre,
    optionsRestriction: options,
    idRestrictionCorrecte: idCorrecte,
  };
}

export function construireSousCas2(): ExerciceMethodeGeneratrices {
  const b = tirerEntier(2, 6);
  let c = tirerEntier(2, 6);
  while (c === b) c = tirerEntier(2, 6);

  const generatrice1 = `alpha*(x-${b})=y*(${c}-2*${b})`;
  const generatrice2 = `alpha*(x-${c})=y*(${b}-2*${c})`;
  const elimineBrut = `(${b}-${c})*(3*x-${b}-${c})=0`;
  const elimineFactorise = `x=${fractionTexte(b + c, 3)}`;
  const equationLieuPropre = elimineFactorise;

  const { options, idCorrecte } = construireOptionsRestriction(`Aucune restriction — la droite entière est décrite quand α parcourt tout son domaine`, [
    `Segment ouvert entre B et C`,
    `Point isolé exclu, au milieu de [BC]`,
    `Segment ouvert entre le milieu de [AB] et le milieu de [AC]`,
  ]);

  return {
    donnees: { famille: "D", sousCas: 2, b, c },
    generatrice1,
    generatrice2,
    elimineBrut,
    elimineFactorise,
    morceaux: [{ label: `x = ${fractionTexte(b + c, 3)}`, statut: "propre" }],
    equationLieuPropre,
    optionsRestriction: options,
    idRestrictionCorrecte: idCorrecte,
  };
}

export function construireFamilleD(): ExerciceMethodeGeneratrices {
  return tirerParmi([construireSousCas1, construireSousCas2] as const)();
}
