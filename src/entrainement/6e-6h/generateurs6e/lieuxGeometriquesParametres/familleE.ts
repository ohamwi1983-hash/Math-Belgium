import type { ExerciceLieuxE, ExerciceLieuxE_Carre, ExerciceLieuxE_Paralleles, ExerciceLieuxE_Perpendiculaires, ExerciceLieuxE_Secantes } from "../../core6e/lieuxGeometriquesParametres.types";
import { tirerEntier, tirerParmi } from "./aleatoire";

/**
 * Couche A (6e) — génération, famille E ("Lieu par seuil, somme de distances SIMPLES — pas au
 * carré") de `6gen56`, NOUVEAUTÉ CENTRALE de ce générateur. 4 sous-types, 2 groupes :
 *
 * **À seuil** ("paralleles"/"carre") : dist(P,a)+dist(P,b)=k avec a,b DEUX RÉFÉRENCES OPPOSÉES
 * (parallèles, ou côtés opposés d'un carré) — la somme admet un MINIMUM GÉOMÉTRIQUE incompressible
 * (l'écart entre les 2 droites, ou le côté du carré) : k<seuil→∅, k=seuil→toute la région entre les
 * 2 références (bords compris), k>seuil→une forme étendue à l'extérieur.
 *
 * **SANS seuil** ("perpendiculaires"/"secantes") : a,b se CROISENT (à 90° ou non) — la somme
 * n'admet AUCUN minimum incompressible autre que 0 (atteint au point de croisement lui-même, pour
 * k=0 seulement) : pour tout k>0 donné, le lieu est TOUJOURS une forme bien définie (losange ou
 * parallélogramme) — écrans 2 ET 3 réellement SAUTÉS (pas seulement allégés, contrairement à la
 * famille B), le "raisonnement par seuil" n'ayant tout simplement AUCUNE prise ici : passer de
 * l'écran1 directement à l'écran4 (construction de la forme).
 *
 * Toutes les identités (dist(x,0)+dist(x,d)=constante sur la bande, décomposition
 * max(|x|,c) du carré, diagonales du losange/parallélogramme) vérifiées par force brute dans
 * `familleE.test.ts`.
 */

// ============================================================================
// paralleles — droites a:x=0, b:x=d (d>0=seuil). |x|+|x-d|=k.
// ============================================================================

function construireParalleles(regimeForce?: "vide" | "bandePleine" | "pairDeDroites"): ExerciceLieuxE_Paralleles {
  const d = tirerEntier(2, 8);
  const regime = regimeForce ?? tirerParmi(["vide", "bandePleine", "pairDeDroites"] as const);
  let k: number;
  if (regime === "vide") k = d - tirerEntier(1, d - 1 > 0 ? d - 1 : 1);
  else if (regime === "bandePleine") k = d;
  else k = d + tirerEntier(1, 8);

  if (regime === "pairDeDroites") {
    const xGauche = (d - k) / 2;
    const xDroite = (k + d) / 2;
    return { famille: "E", sousType: "paralleles", d, k, regime, xGauche, xDroite };
  }
  return { famille: "E", sousType: "paralleles", d, k, regime, xGauche: null, xDroite: null };
}

// ============================================================================
// perpendiculaires — a:x=0, b:y=0. |x|+|y|=k, k>0. TOUJOURS un losange, aucun seuil.
// ============================================================================

function construirePerpendiculaires(): ExerciceLieuxE_Perpendiculaires {
  return { famille: "E", sousType: "perpendiculaires", k: tirerEntier(2, 9) };
}

// ============================================================================
// secantes — a: y=0, b: 3x-4y=0 (norme 5, non perpendiculaires : pente de b = 3/4 ≠ ⊥ à a).
// dist(P,a)=|y|, dist(P,b)=|3x-4y|/5. Condition : |y|+|3x-4y|/5=k, k multiple de 3 pour sommets
// entiers. TOUJOURS un parallélogramme (diagonales portées par a,b), aucun seuil.
// ============================================================================

function construireSecantes(): ExerciceLieuxE_Secantes {
  const k = tirerEntier(1, 6) * 3;
  const sommets = [
    { x: (5 * k) / 3, y: 0 },
    { x: -(5 * k) / 3, y: 0 },
    { x: (4 * k) / 3, y: k },
    { x: -(4 * k) / 3, y: -k },
  ];
  return { famille: "E", sousType: "secantes", k, sommets };
}

// ============================================================================
// carre — carré [-c,c]×[-c,c] (c=demi-côté). Somme des 4 DISTANCES (pas au carré) aux 4 côtés = k.
// (x-c)+(x+c) style : en fait somme = 2max(|x|,c)+2max(|y|,c), minimum 4c au centre (seuil=4c).
// ============================================================================

function construireCarre(regimeForce?: "vide" | "bandePleine" | "formeEtendue"): ExerciceLieuxE_Carre {
  const c = tirerEntier(2, 6);
  const seuil = 4 * c;
  const regime = regimeForce ?? tirerParmi(["vide", "bandePleine", "formeEtendue"] as const);
  let k: number;
  if (regime === "vide") k = seuil - tirerEntier(1, seuil - 1 > 0 ? seuil - 1 : 1);
  else if (regime === "bandePleine") k = seuil;
  else k = seuil + tirerEntier(1, 6) * 2; // pair pour garder m=k/2-c entier

  const m = regime === "formeEtendue" ? k / 2 - c : null;
  return { famille: "E", sousType: "carre", c, k, seuil, regime, m };
}

export function construireFamilleE(): ExerciceLieuxE {
  return tirerParmi([construireParalleles, construirePerpendiculaires, construireSecantes, construireCarre] as const)();
}

export { construireCarre, construireParalleles, construirePerpendiculaires, construireSecantes };
