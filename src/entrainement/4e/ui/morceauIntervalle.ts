import type { Crochet, Morceau } from "../core/inequation.types";

/**
 * État local d'un composant "morceau d'intervalle" (section 3) : rangée de champs fixes, pas de
 * boutons librement enchaînables. crochetGauche/crochetDroit valent null tant que l'élève n'a
 * pas cliqué le toggle — aucune présélection automatique (ni "fermé" par défaut, ni déduite du
 * caractère strict/large de l'inégalité) : c'est un choix actif de l'élève, noté comme tel.
 * Une fois choisis, ils n'ont d'effet que si la borne correspondante est finie — voir
 * crochetGaucheEffectif / crochetDroitEffectif (borne infinie ⇒ crochet ouvert forcé, "[-∞"
 * n'ayant pas de sens).
 */
export interface EtatMorceau {
  crochetGauche: Crochet | null;
  borneGaucheMode: "nombre" | "-inf";
  borneGaucheValeur: string;
  crochetDroit: Crochet | null;
  borneDroiteMode: "nombre" | "+inf";
  borneDroiteValeur: string;
}

export function etatMorceauInitial(): EtatMorceau {
  return {
    crochetGauche: null,
    borneGaucheMode: "nombre",
    borneGaucheValeur: "",
    crochetDroit: null,
    borneDroiteMode: "nombre",
    borneDroiteValeur: "",
  };
}

/**
 * Notation francophone à crochets inversés : à gauche, fermé="[", ouvert="]" ; premier clic
 * choisit "[" (fermé), puis alterne. Jamais de calcul depuis l'inégalité de l'exercice.
 */
export function toggleCrochetGauche(actuel: Crochet | null): Crochet {
  if (actuel === null) return "[";
  return actuel === "[" ? "]" : "[";
}

/** À droite, fermé="]", ouvert="[" ; premier clic choisit "]" (fermé), puis alterne. */
export function toggleCrochetDroit(actuel: Crochet | null): Crochet {
  if (actuel === null) return "]";
  return actuel === "]" ? "[" : "]";
}

export function crochetGaucheVerrouille(etat: EtatMorceau): boolean {
  return etat.borneGaucheMode === "-inf";
}

export function crochetDroitVerrouille(etat: EtatMorceau): boolean {
  return etat.borneDroiteMode === "+inf";
}

/** "-∞" est toujours ouvert à gauche, donc toujours "]" en notation francophone. */
export function crochetGaucheEffectif(etat: EtatMorceau): Crochet | null {
  return crochetGaucheVerrouille(etat) ? "]" : etat.crochetGauche;
}

/** "+∞" est toujours ouvert à droite, donc toujours "[" en notation francophone. */
export function crochetDroitEffectif(etat: EtatMorceau): Crochet | null {
  return crochetDroitVerrouille(etat) ? "[" : etat.crochetDroit;
}

/** Accepte la virgule comme séparateur décimal (notation française), en plus du point. */
function parseNombreFr(texte: string): number {
  return Number(texte.trim().replace(",", "."));
}

function borneGaucheValide(etat: EtatMorceau): boolean {
  return etat.borneGaucheMode === "-inf" || (etat.borneGaucheValeur.trim() !== "" && Number.isFinite(parseNombreFr(etat.borneGaucheValeur)));
}

function borneDroiteValide(etat: EtatMorceau): boolean {
  return etat.borneDroiteMode === "+inf" || (etat.borneDroiteValeur.trim() !== "" && Number.isFinite(parseNombreFr(etat.borneDroiteValeur)));
}

/** Complet seulement si les deux bornes ET les deux crochets ont été activement choisis (ou verrouillés par une borne infinie). */
export function morceauEstComplet(etat: EtatMorceau): boolean {
  return (
    borneGaucheValide(etat) &&
    borneDroiteValide(etat) &&
    crochetGaucheEffectif(etat) !== null &&
    crochetDroitEffectif(etat) !== null
  );
}

/** Assemble le Morceau final à partir de l'état, ou null si la saisie n'est pas encore complète. */
export function construireMorceau(etat: EtatMorceau): Morceau | null {
  if (!morceauEstComplet(etat)) return null;

  return {
    crochetGauche: crochetGaucheEffectif(etat) as Crochet,
    borneGauche: etat.borneGaucheMode === "-inf" ? "-inf" : parseNombreFr(etat.borneGaucheValeur),
    crochetDroit: crochetDroitEffectif(etat) as Crochet,
    borneDroite: etat.borneDroiteMode === "+inf" ? "+inf" : parseNombreFr(etat.borneDroiteValeur),
  };
}
