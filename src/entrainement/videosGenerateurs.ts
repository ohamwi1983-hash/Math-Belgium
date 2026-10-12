export interface VideoCapsuleGenerateur {
  titre: string;
  youtubeId: string;
}

/**
 * Une entrée par générateur ayant au moins une capsule vidéo — un générateur absent de cette table
 * n'affiche AUCUN lien (`LienVideoGenerateur` rend `null`), jamais un "à venir" qui resterait
 * affiché indéfiniment : contrairement aux vidéos de chapitre (`content/types.ts`, `BlockRenderer`),
 * ces capsules sont une ressource ajoutée au fil de l'eau par générateur, pas une structure de
 * chapitre prévue à l'avance avec un contenu "manquant".
 *
 * Clé = EXACTEMENT la clé de `ENTRAINEMENT_REGISTRY` (`registry.ts`), ex. "gen29"/"5gen12"/
 * "6gen14" — jamais un id recalculé séparément, pour que l'ajout d'une capsule reste un simple
 * copier-coller de la clé déjà utilisée pour router ce générateur.
 *
 * Fichier UNIQUE (pas une copie par chantier comme `CalculatriceScientifique.tsx`) : consommé par
 * `LienVideoGenerateur`, monté une seule fois dans `EntrainementPage.tsx` — un composant déjà
 * commun aux 3 chantiers (la page générique `/entrainement/:chantier/:generatorId`), donc aucune
 * raison d'éclater cette table par chantier.
 *
 * 1 seule entrée → `LienVideoGenerateur` saute directement au lecteur au clic (pas de liste
 * intermédiaire pour une seule vidéo). Plusieurs entrées → une liste s'affiche d'abord.
 */
export const VIDEOS_GENERATEURS: Record<string, VideoCapsuleGenerateur[]> = {
  gen7: [{ titre: "Vue d'ensemble et exemple résolu", youtubeId: "uljJGHyI_Tg" }],
  gen8: [{ titre: "Vue d'ensemble et exemple résolu", youtubeId: "ZpaYRtDPlfw" }],
  gen9: [{ titre: "Vue d'ensemble et exemple résolu", youtubeId: "2ku6OJ9zfME" }],
  gen10: [{ titre: "Vue d'ensemble et exemple résolu", youtubeId: "aQgPzCbCBQI" }],
  gen11: [{ titre: "Vue d'ensemble et exemple résolu", youtubeId: "mATOPgGtoPc" }],
  gen12: [{ titre: "Vue d'ensemble et exemple résolu", youtubeId: "Y2nF1siWrzk" }],
  gen13: [
    { titre: "Vue d'ensemble et exemple résolu", youtubeId: "E-jDap0w9Zs" },
    { titre: "Vue d'ensemble et exemple résolu", youtubeId: "_v26RduUGA4" },
  ],
  "6gen5": [{ titre: "Vue d'ensemble et exemple résolu", youtubeId: "-S_NR6qUoYc" }],
};
