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

/** Ampoule — icône du bouton "Aide" (design "Ardoise + icônes"), `currentColor` pour suivre la
 * couleur du texte du bouton dans tous ses états (normal/survolé/désactivé), jamais une couleur en
 * dur. Dupliquée à l'identique dans les 3 copies de `BoutonAide.tsx` (même convention que le reste
 * du composant, jamais partagée entre chantiers). */
function IconeAmpoule() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" width="15" height="15" aria-hidden="true">
      <path d="M9 18h6" />
      <path d="M10 21h4" />
      <path d="M12 3a6 6 0 0 0-3.5 10.9c.6.44 1 1.13 1 1.85V16h5v-.25c0-.72.4-1.4 1-1.85A6 6 0 0 0 12 3Z" />
    </svg>
  );
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
      <IconeAmpoule />
      {libelleBoutonAide(niveauAide, niveauAideMax)}
    </button>
  );
}
