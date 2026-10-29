import type { Composantes } from "../../core/vecteur.types";

/** Borne des composantes des paires tirées par `tirerPaireUniforme` — la MÊME pour les paires qui
 * vérifient le critère et pour celles qui ne le vérifient pas (audit du chapitre 6 : quand les
 * paires colinéaires/orthogonales étaient construites par `k·v` avec |k| jusqu'à 3, leurs
 * composantes montaient jusqu'à 15 alors que les autres restaient dans [−5 ; 5], si bien que « une
 * composante > 5 ⇒ colinéaire » devinait la réponse dans 93 % des cas). Tirées uniformément parmi
 * TOUTES les paires de la boîte, la meilleure règle fondée sur la taille des composantes ne dépasse
 * plus ~59 %. */
export const BORNE_PAIRES_UNIFORMES = 6;

function vecteurBoite(borne: number): Composantes {
  let v = { x: 0, y: 0 };
  while (v.x === 0 && v.y === 0) {
    v = { x: Math.floor(Math.random() * (2 * borne + 1)) - borne, y: Math.floor(Math.random() * (2 * borne + 1)) - borne };
  }
  return v;
}

/**
 * Paire de vecteurs non nuls tirée UNIFORMÉMENT parmi les paires de la boîte [−borne ; borne]² dont
 * `critere(v1, v2)` est nul (`doitEtreNul`) ou non nul — par rejet, donc sans biais de construction
 * (k fractionnaires, k = ±1 et vecteurs sur les axes compris pour les paires « nulles »).
 */
export function tirerPaireUniforme(
  critere: (v1: Composantes, v2: Composantes) => number,
  doitEtreNul: boolean,
  borne = BORNE_PAIRES_UNIFORMES,
): [Composantes, Composantes] {
  for (;;) {
    const v1 = vecteurBoite(borne);
    const v2 = vecteurBoite(borne);
    if ((critere(v1, v2) === 0) === doitEtreNul) return [v1, v2];
  }
}
