import type { Enonce, Morceau, SolutionEnsemble, Symbole } from "../../core/inequation.types";

/**
 * Implémente EXACTEMENT la table de la section 2 de la spec — ne pas re-dériver cette logique de
 * tête (source d'erreurs de signe passées sur ce projet, mise en évidence/binôme conjugué). Trois
 * branches (Δ<0, Δ=0, Δ>0), chacune une correspondance ligne par ligne recopiée du tableau.
 */
/** -0 et 0 sont mathématiquement identiques, mais pas via toEqual/comparaisons structurelles. */
function normaliserZero(x: number): number {
  return x === 0 ? 0 : x;
}

export function classifierSolution(enonce: Enonce, symbole: Symbole): SolutionEnsemble {
  const { a, b, c } = enonce;
  const delta = b * b - 4 * a * c;
  const signeA: "+" | "-" = a > 0 ? "+" : "-";

  if (delta < 0) return classifierDeltaNegatif(signeA, symbole);
  if (delta === 0) {
    const r = normaliserZero(-b / (2 * a));
    return classifierDeltaNul(signeA, symbole, r);
  }
  const racineDelta = Math.sqrt(delta);
  const x1 = normaliserZero((-b - racineDelta) / (2 * a));
  const x2 = normaliserZero((-b + racineDelta) / (2 * a));
  const [r1, r2] = x1 <= x2 ? [x1, x2] : [x2, x1];
  return classifierDeltaPositif(signeA, symbole, r1, r2);
}

/** | Δ<0 | signe(a) | ◇ | Solution | — lignes 21-28 de la table. */
function classifierDeltaNegatif(signeA: "+" | "-", symbole: Symbole): SolutionEnsemble {
  const table: Record<"+" | "-", Record<Symbole, "reel" | "vide">> = {
    "+": { ">": "reel", "<": "vide", "≥": "reel", "≤": "vide" },
    "-": { ">": "vide", "<": "reel", "≥": "vide", "≤": "reel" },
  };
  return { forme: table[signeA][symbole] };
}

/** | Δ=0 | signe(a) | ◇ | Solution | — lignes 29-36 de la table. */
function classifierDeltaNul(signeA: "+" | "-", symbole: Symbole, r: number): SolutionEnsemble {
  type Resultat = "reel" | "vide" | "reel_sauf_point" | "point";
  const table: Record<"+" | "-", Record<Symbole, Resultat>> = {
    "+": { ">": "reel_sauf_point", "<": "vide", "≥": "reel", "≤": "point" },
    "-": { ">": "vide", "<": "reel_sauf_point", "≥": "point", "≤": "reel" },
  };
  const resultat = table[signeA][symbole];
  if (resultat === "reel_sauf_point" || resultat === "point") {
    return { forme: resultat, valeur: r };
  }
  return { forme: resultat };
}

/** | Δ>0 | signe(a) | ◇ | Solution | — lignes 37-44 de la table. */
function classifierDeltaPositif(signeA: "+" | "-", symbole: Symbole, r1: number, r2: number): SolutionEnsemble {
  type Resultat = "exterieur_ouvert" | "interieur_ouvert" | "exterieur_ferme" | "interieur_ferme";
  const table: Record<"+" | "-", Record<Symbole, Resultat>> = {
    "+": { ">": "exterieur_ouvert", "<": "interieur_ouvert", "≥": "exterieur_ferme", "≤": "interieur_ferme" },
    "-": { ">": "interieur_ouvert", "<": "exterieur_ouvert", "≥": "interieur_ferme", "≤": "exterieur_ferme" },
  };
  const resultat = table[signeA][symbole];

  if (resultat === "interieur_ouvert") {
    return { forme: "intervalle", morceau: intervalle(false, r1, r2, false) };
  }
  if (resultat === "interieur_ferme") {
    return { forme: "intervalle", morceau: intervalle(true, r1, r2, true) };
  }
  if (resultat === "exterieur_ouvert") {
    return {
      forme: "union",
      morceau1: { crochetGauche: "]", borneGauche: "-inf", crochetDroit: "[", borneDroite: r1 },
      morceau2: { crochetGauche: "]", borneGauche: r2, crochetDroit: "[", borneDroite: "+inf" },
    };
  }
  // exterieur_ferme
  return {
    forme: "union",
    morceau1: { crochetGauche: "]", borneGauche: "-inf", crochetDroit: "]", borneDroite: r1 },
    morceau2: { crochetGauche: "[", borneGauche: r2, crochetDroit: "[", borneDroite: "+inf" },
  };
}

/** Notation francophone : gauche fermé="[" /ouvert="]", droite fermé="]" /ouvert="[". */
function intervalle(gaucheFerme: boolean, r1: number, r2: number, droiteFerme: boolean): Morceau {
  return {
    crochetGauche: gaucheFerme ? "[" : "]",
    borneGauche: r1,
    crochetDroit: droiteFerme ? "]" : "[",
    borneDroite: r2,
  };
}
