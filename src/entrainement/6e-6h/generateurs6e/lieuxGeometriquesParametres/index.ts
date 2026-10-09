import type { ExerciceLieuxGeometriquesParametres, FamilleLieuxGeometriquesParametres } from "../../core6e/lieuxGeometriquesParametres.types";
import { construireFamilleA, construireLosange, construireNonBorne, construireParalleles as construireAParalleles } from "./familleA";
import { construireApollonius, construireBissectrices, construireCerclePerp, construireDroite, construireFamilleB, construireSeuil2Points, construireSeuilCarre } from "./familleB";
import { construireFamilleC } from "./familleC";
import { construireFamilleD, construireFractions, construireRatio, construireSubstitution } from "./familleD";
import { construireCarre, construireFamilleE, construireParalleles as construireEParalleles, construirePerpendiculaires, construireSecantes } from "./familleE";

/**
 * Couche A (6e) — point d'entrée `6gen56` ("Lieux géométriques et élimination de paramètre"),
 * générateur D'OUVERTURE du nouveau chapitre "Lieux géométriques" (6e FWB, 6h). Tirage à 2 niveaux
 * (mirroir `denombrementFondamental/index.ts`, 6gen43) : la FAMILLE (A à E) est tirée ÉQUIPROBABLE
 * en premier, puis le sous-type de la famille tirée est tiré ÉQUIPROBABLE ensuite.
 *
 * Le catalogue "forcer une variante" détaille CHAQUE RÉGIME séparément pour les 3 sous-types à
 * seuil de la famille B (seuil2Points/apollonius/seuilCarre) et les 2 sous-types à seuil de la
 * famille E (paralleles/carre) — indispensable pour que la vérification manuelle (panneau dev,
 * Playwright) puisse forcer chaque régime (k>seuil / k=seuil / k<seuil, ou k=1 / k≠1) sans dépendre
 * du hasard : c'est la partie la plus critique de ce générateur (mission).
 */
export type IdVarianteLieuxGeometriquesParametres =
  | "A_paralleles"
  | "A_nonBorne"
  | "A_losange"
  | "B_bissectrices"
  | "B_droite"
  | "B_cerclePerp"
  | "B_seuil2Points_cercle"
  | "B_seuil2Points_point"
  | "B_seuil2Points_vide"
  | "B_apollonius_k1"
  | "B_apollonius_kAutre"
  | "B_seuilCarre_cercle"
  | "B_seuilCarre_point"
  | "B_seuilCarre_vide"
  | "C_cercle"
  | "D_substitution"
  | "D_fractions"
  | "D_ratio"
  | "E_paralleles_vide"
  | "E_paralleles_bandePleine"
  | "E_paralleles_pairDeDroites"
  | "E_perpendiculaires"
  | "E_secantes"
  | "E_carre_vide"
  | "E_carre_bandePleine"
  | "E_carre_formeEtendue";

export const CATALOGUE_VARIANTES: { id: IdVarianteLieuxGeometriquesParametres; label: string }[] = [
  { id: "A_paralleles", label: "A — |αx+βy+γ|=k : paire de droites parallèles" },
  { id: "A_nonBorne", label: "A — |x-p|-|y-q|=k : lieu non borné (différence)" },
  { id: "A_losange", label: "A — |x-p|+|y-q|=k : losange borné (somme)" },
  { id: "B_bissectrices", label: "B — Bissectrices (équidistance à 2 droites, sans seuil)" },
  { id: "B_droite", label: "B — Différence des carrés des distances : droite (sans seuil)" },
  { id: "B_cerclePerp", label: "B — Somme aux 2 perpendiculaires : cercle (sans seuil)" },
  { id: "B_seuil2Points_cercle", label: "B — Seuil, 2 points : régime CERCLE (k>seuil)" },
  { id: "B_seuil2Points_point", label: "B — Seuil, 2 points : régime POINT (k=seuil)" },
  { id: "B_seuil2Points_vide", label: "B — Seuil, 2 points : régime ∅ (k<seuil)" },
  { id: "B_apollonius_k1", label: "B — Apollonius : cas particulier k=1 (médiatrice)" },
  { id: "B_apollonius_kAutre", label: "B — Apollonius : k≠1 (cercle)" },
  { id: "B_seuilCarre_cercle", label: "B — Seuil, carré : régime CERCLE (k>seuil)" },
  { id: "B_seuilCarre_point", label: "B — Seuil, carré : régime POINT (k=seuil)" },
  { id: "B_seuilCarre_vide", label: "B — Seuil, carré : régime ∅ (k<seuil)" },
  { id: "C_cercle", label: "C — Cercle depuis une équation quadratique" },
  { id: "D_substitution", label: "D — Éliminer t : substitution directe (avec carré)" },
  { id: "D_fractions", label: "D — Éliminer t : manipulation de fractions" },
  { id: "D_ratio", label: "D — Éliminer t : rapport direct (raccourci)" },
  { id: "E_paralleles_vide", label: "E — Parallèles : régime ∅ (k<d)" },
  { id: "E_paralleles_bandePleine", label: "E — Parallèles : régime bande pleine (k=d)" },
  { id: "E_paralleles_pairDeDroites", label: "E — Parallèles : régime 2 droites supp. (k>d)" },
  { id: "E_perpendiculaires", label: "E — Perpendiculaires : losange (toujours, sans seuil)" },
  { id: "E_secantes", label: "E — Sécantes non ⊥ : parallélogramme (toujours, sans seuil)" },
  { id: "E_carre_vide", label: "E — Carré : régime ∅ (k<4c)" },
  { id: "E_carre_bandePleine", label: "E — Carré : régime intérieur plein (k=4c)" },
  { id: "E_carre_formeEtendue", label: "E — Carré : régime octogone (k>4c)" },
];

export function construireAvecVarianteId(id: IdVarianteLieuxGeometriquesParametres): ExerciceLieuxGeometriquesParametres {
  switch (id) {
    case "A_paralleles":
      return construireAParalleles();
    case "A_nonBorne":
      return construireNonBorne();
    case "A_losange":
      return construireLosange();
    case "B_bissectrices":
      return construireBissectrices();
    case "B_droite":
      return construireDroite();
    case "B_cerclePerp":
      return construireCerclePerp();
    case "B_seuil2Points_cercle":
      return construireSeuil2Points("cercle");
    case "B_seuil2Points_point":
      return construireSeuil2Points("point");
    case "B_seuil2Points_vide":
      return construireSeuil2Points("vide");
    case "B_apollonius_k1":
      return construireApollonius(true);
    case "B_apollonius_kAutre":
      return construireApollonius(false);
    case "B_seuilCarre_cercle":
      return construireSeuilCarre("cercle");
    case "B_seuilCarre_point":
      return construireSeuilCarre("point");
    case "B_seuilCarre_vide":
      return construireSeuilCarre("vide");
    case "C_cercle":
      return construireFamilleC();
    case "D_substitution":
      return construireSubstitution();
    case "D_fractions":
      return construireFractions();
    case "D_ratio":
      return construireRatio();
    case "E_paralleles_vide":
      return construireEParalleles("vide");
    case "E_paralleles_bandePleine":
      return construireEParalleles("bandePleine");
    case "E_paralleles_pairDeDroites":
      return construireEParalleles("pairDeDroites");
    case "E_perpendiculaires":
      return construirePerpendiculaires();
    case "E_secantes":
      return construireSecantes();
    case "E_carre_vide":
      return construireCarre("vide");
    case "E_carre_bandePleine":
      return construireCarre("bandePleine");
    case "E_carre_formeEtendue":
      return construireCarre("formeEtendue");
  }
}

const FAMILLES: FamilleLieuxGeometriquesParametres[] = ["A", "B", "C", "D", "E"];

const CONSTRUCTEURS_PAR_FAMILLE: Record<FamilleLieuxGeometriquesParametres, () => ExerciceLieuxGeometriquesParametres> = {
  A: construireFamilleA,
  B: construireFamilleB,
  C: construireFamilleC,
  D: construireFamilleD,
  E: construireFamilleE,
};

export function genererExerciceLieuxGeometriquesParametres(): ExerciceLieuxGeometriquesParametres {
  const famille = FAMILLES[Math.floor(Math.random() * FAMILLES.length)];
  return CONSTRUCTEURS_PAR_FAMILLE[famille]();
}
