import { createContext, useContext, useSyncExternalStore } from "react";
import type { EtatPuceProgression } from "./ProgressionPuces";

/**
 * Cadre commun de la page d'un générateur (refonte du 22/11/2026, maquettes A–E) : petit magasin
 * d'état partagé entre `EntrainementPage` (barre du haut) et les composants partagés rendus À
 * L'INTÉRIEUR de chaque générateur (`ProgressionPuces`, « Ce qu'on sait déjà », `EnTeteExercice`).
 *
 * `ProgressionPuces` y PUBLIE ses segments et son `onSegmentClick` au lieu de les dessiner sur place :
 * la barre du haut les affiche (segments + « Étape n / N »), les lignes de rappel s'en servent pour
 * colorer chaque écran clos et ouvrir la même `FicheReponseEcran` (« Revoir »). Rien n'est recalculé :
 * ce sont exactement les segments construits par chaque `App*.tsx`, comme avant.
 *
 * Magasin externe (`useSyncExternalStore`) plutôt qu'un état React de la page : publier ne doit
 * jamais re-rendre le générateur lui-même (sinon `ProgressionPuces` republierait à chaque rendu, en
 * boucle) — seuls les abonnés (barre, lignes de rappel, en-tête d'énoncé) se mettent à jour.
 */
export interface EtatCadre {
  segments: EtatPuceProgression[] | null;
  /** `true` si `onSegmentClick` a été fourni (fiche « lecture seule » disponible). */
  consultable: boolean;
}

const VIDE: EtatCadre = { segments: null, consultable: false };

export interface StoreCadre {
  lire: () => EtatCadre;
  abonner: (rappel: () => void) => () => void;
  publier: (id: number, segments: EtatPuceProgression[], onSegmentClick?: (index: number) => void) => void;
  retirer: (id: number) => void;
  /** Ouvre la fiche de l'écran `index` (même appel que le clic sur la puce d'avant). */
  revoir: (index: number) => void;
}

export function creerStoreCadre(): StoreCadre {
  let etat: EtatCadre = VIDE;
  let proprietaire: number | null = null;
  let gestionnaire: ((index: number) => void) | undefined;
  const abonnes = new Set<() => void>();
  const notifier = () => abonnes.forEach((f) => f());
  return {
    lire: () => etat,
    abonner(rappel) {
      abonnes.add(rappel);
      return () => abonnes.delete(rappel);
    },
    publier(id, segments, onSegmentClick) {
      proprietaire = id;
      gestionnaire = onSegmentClick;
      const consultable = !!onSegmentClick;
      const memes = etat.segments !== null && etat.segments.length === segments.length && etat.segments.every((s, i) => s === segments[i]);
      if (memes && etat.consultable === consultable) return;
      etat = { segments: [...segments], consultable };
      notifier();
    },
    retirer(id) {
      if (proprietaire !== id) return;
      proprietaire = null;
      gestionnaire = undefined;
      etat = VIDE;
      notifier();
    },
    revoir(index) {
      gestionnaire?.(index);
    },
  };
}

export const CadreGenerateurContext = createContext<StoreCadre | null>(null);

const lireVide = () => VIDE;
const abonnerVide = () => () => {};

/** État publié (segments) — `VIDE` hors de la page d'un générateur (ex. un futur aperçu). */
export function useEtatCadre(): EtatCadre {
  const store = useContext(CadreGenerateurContext);
  return useSyncExternalStore(store ? store.abonner : abonnerVide, store ? store.lire : lireVide, lireVide);
}

export function useStoreCadre(): StoreCadre | null {
  return useContext(CadreGenerateurContext);
}

/** Un écran clos qu'on peut consulter : mêmes états que les puces cliquables d'avant. */
export function estConsultable(etat: EtatPuceProgression): boolean {
  return etat === "correcte" || etat === "aide" || etat === "revele";
}

export function estClos(etat: EtatPuceProgression): boolean {
  return estConsultable(etat) || etat === "sans-objet";
}

export interface LigneRappel {
  /** Couleur de la ligne : vert (juste), jaune (juste avec aide), rouge (révélée). */
  ton: "correcte" | "aide" | "revele";
  /** Ouvre la fiche « lecture seule » de l'écran correspondant, si le générateur en a une. */
  revoir?: () => void;
}

/**
 * Lignes de « Ce qu'on sait déjà » : couleur et « Revoir » de chaque entrée, à partir des segments
 * publiés. Correspondance entrée k ↔ k-ième écran clos consultable SEULEMENT si elle est sûre :
 * autant d'entrées que d'écrans clos, et le même verdict (révélé ou non) pour chaque paire. Sinon,
 * on n'invente rien : couleur d'après `revele` seul (vert/rouge, comme avant), pas de « Revoir ».
 */
export function useLignesRappel(reveles: boolean[]): LigneRappel[] {
  const store = useStoreCadre();
  const { segments, consultable } = useEtatCadre();
  const sansLien = reveles.map((r): LigneRappel => ({ ton: r ? "revele" : "correcte" }));
  if (!store || !segments) return sansLien;
  const clos = segments.map((s, i) => ({ s, i })).filter(({ s }) => estConsultable(s));
  if (clos.length !== reveles.length) return sansLien;
  if (!clos.every(({ s }, k) => (s === "revele") === reveles[k])) return sansLien;
  return clos.map(({ s, i }) => ({
    ton: s === "revele" ? "revele" : s === "aide" ? "aide" : "correcte",
    revoir: consultable ? () => store.revoir(i) : undefined,
  }));
}
