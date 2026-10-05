interface Props {
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
}

/** Même libellé à 3 états que le reste de la plateforme (`libelleBoutonAide`, ex.
 * `ui/formatColinearite.ts`/`ui/formatOrthogonalite.ts`/`ui/formatMediane.ts`...) — "Aide" tant
 * qu'aucun palier n'a été utilisé, "Aide supplémentaire" pour un palier suivant, "Aide utilisée"
 * une fois le plafond atteint. */
function libelleBoutonAide(niveau: number, max: number): string {
  if (niveau >= max) return "Aide utilisée";
  return niveau === 0 ? "Aide" : "Aide supplémentaire";
}

/**
 * Bouton "Aide" générique, réutilisé par tous les `App5genN.tsx` (5gen1-5gen19) — jamais un bouton
 * `.btn`/`.btn-primary` propre à chaque générateur avec un texte inventé ("(pénalisante)"...), même
 * classe `.btn-aide` (bordure/texte en couleur primaire, jamais plein comme "Valider") et même
 * libellé à 3 états que les générateurs 4e (voir CLAUDE.md, section 5gen1 — "le même système d'aide
 * que dans les générateurs de 4e"). Rend `null` si l'écran n'a aucune aide prévue
 * (`niveauAideMax === 0`, convention "max=0 → pas de bouton" déjà établie ailleurs sur la
 * plateforme).
 */
export function BoutonAide({ niveauAide, niveauAideMax, onActiverAide }: Props) {
  if (niveauAideMax === 0) return null;
  const epuise = niveauAide >= niveauAideMax;
  return (
    <button type="button" className="btn btn-aide" disabled={epuise} onClick={onActiverAide}>
      {libelleBoutonAide(niveauAide, niveauAideMax)}
    </button>
  );
}
