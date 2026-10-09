import type { ExerciceMethodeGeneratrices } from "../../core6e/methodeGeneratrices.types";
import { tirerEntier } from "./aleatoire";
import { construireOptionsRestriction } from "./texte";

/**
 * Couche A (6e) — famille C ("Angles α et 2α, cercle") de `6gen57`. Droite AB, A(0;0), B(k;0). Par
 * A, droite a faisant un angle α avec AB. Par B, droite b faisant un angle 2α avec AB. Lieu
 * cherché : intersection de a et b.
 *
 * **Dérivation** : contrairement à A/B/D/E, la génératrice b utilise `tan(2α)` (formule de l'angle
 * double) — pas de coefficient de α linéaire commun, la substitution t=tan(α) donne une équation
 * QUADRATIQUE en t pour la 2e droite. Élimination par SUBSTITUTION DIRECTE (t=y/x tiré de la 1ʳᵉ
 * équation, injecté dans la 2ᵉ, puis on chasse les dénominateurs) — TECHNIQUE DIFFÉRENTE du produit
 * croisé des autres familles, mais toujours "éliminer α algébriquement", conforme au principe
 * transversal de la mission. Résultat brut : `y*(2*k*x-x^2-y^2)=0` ; en complétant le carré
 * (`2kx-x²=-(x-k)²+k²`) on reconnaît `y*((x-k)^2+y^2-k^2)=0` — exactement le "Résultat attendu
 * (vérifié)". Écran 4 ALLÉGÉ : aucun lieu parasite (signalé explicitement côté `ui6e`).
 */
export function construireFamilleC(k: number = tirerEntier(2, 6)): ExerciceMethodeGeneratrices {
  const generatrice1 = `y=tan(alpha)*x`;
  const generatrice2 = `y=tan(2*alpha)*(x-${k})`;
  const elimineBrut = `y*(2*${k}*x-x^2-y^2)=0`;
  const elimineFactorise = `y*((x-${k})^2+y^2-${k}^2)=0`;
  const equationLieuPropre = `(x-${k})^2+y^2=${k}^2`;

  const { options, idCorrecte } = construireOptionsRestriction(`Aucune restriction — le cercle entier est décrit, aucune valeur de α n'est exclue`, [
    `Segment ouvert entre A et B`,
    `Droite entière (le cercle n'est en réalité qu'une droite)`,
    `Point isolé exclu, au centre du cercle`,
  ]);

  return {
    donnees: { famille: "C", k },
    generatrice1,
    generatrice2,
    elimineBrut,
    elimineFactorise,
    morceaux: [
      { label: "y = 0", statut: "singulier" },
      { label: `(x − ${k})² + y² − ${k}² = 0`, statut: "propre" },
    ],
    equationLieuPropre,
    optionsRestriction: options,
    idRestrictionCorrecte: idCorrecte,
  };
}
