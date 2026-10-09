import type { ExerciceMethodeGeneratrices } from "../../core6e/methodeGeneratrices.types";
import { tirerEntier } from "./aleatoire";
import { construireOptionsRestriction } from "./texte";

/**
 * Couche A (6e) — famille E ("Perpendiculaires variables") de `6gen57`. A(p;0), B(r;0), d=axe des
 * ordonnées. C(0;α) variable sur d. a⊥AC par A, b⊥BC par B. Lieu cherché : intersection de a et b.
 *
 * **Dérivation** : les 2 génératrices ont, comme la famille D, le MÊME coefficient de α (`-y` dans
 * les 2 cas, car les 2 droites sont perpendiculaires à des segments partageant le même point mobile
 * C) — soustraction directe des 2 équations, `(p-r)*(x-p-r)=0` (brut), soit `x=p+r` une fois divisé
 * par (p−r) — exactement le "Résultat attendu (vérifié)". Écran 4 : UN SEUL morceau (propre, comme
 * D) — MAIS, DIFFÉRENCE avec D, une restriction de type POINT PARASITE existe ici (le point (p+r;0),
 * intersection du lieu avec la droite AB, n'est jamais atteint pour une valeur finie de α) : géré à
 * l'écran 5, pas à l'écran 4 (qui ne classe QUE les morceaux de l'équation factorisée).
 */
export function construireFamilleE(): ExerciceMethodeGeneratrices {
  let p = 0;
  let r = 0;
  while (p === r || p === 0 || r === 0) {
    p = tirerEntier(-4, 4);
    r = tirerEntier(-4, 4);
  }

  const generatrice1 = `alpha*y=(${p})*(x-(${p}))`;
  const generatrice2 = `alpha*y=(${r})*(x-(${r}))`;
  const elimineBrut = `((${p})-(${r}))*(x-(${p})-(${r}))=0`;
  const elimineFactorise = `x=(${p})+(${r})`;
  const equationLieuPropre = elimineFactorise;
  const pointExclu = p + r;

  const { options, idCorrecte } = construireOptionsRestriction(`Droite entière PRIVÉE du point (${pointExclu};0), parasite — il exigerait α infini pour être atteint`, [
    `Aucune restriction (droite entière, y compris (${pointExclu};0))`,
    `Segment ouvert entre A et B`,
    `Droite entière privée du point (${p};0)`,
  ]);

  return {
    donnees: { famille: "E", p, r },
    generatrice1,
    generatrice2,
    elimineBrut,
    elimineFactorise,
    morceaux: [{ label: `x = ${p + r}`, statut: "propre" }],
    equationLieuPropre,
    optionsRestriction: options,
    idRestrictionCorrecte: idCorrecte,
  };
}
