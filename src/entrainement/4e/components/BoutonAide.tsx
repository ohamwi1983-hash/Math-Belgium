interface Props {
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  /** Condition de verrouillage SUPPLÉMENTAIRE, au-delà du plafond d'aide normal (ex. l'aide reste
   * indisponible tant que l'élève n'a pas fait un premier choix) — cas rare, voir
   * `EtapePossibiliteCoefficientsEquationDroite.tsx`, seul appelant à la passer. Absente partout
   * ailleurs, le bouton se comporte exactement comme avant. */
  disabledSupplementaire?: boolean;
}

/** Même libellé à 3 états que le reste de la plateforme (`libelleBoutonAide`, dupliqué jusqu'ici
 * dans 22 fichiers `ui/format*.ts` de ce chantier) — "Aide" tant qu'aucun palier n'a été utilisé,
 * "Aide supplémentaire" pour un palier suivant, "Aide utilisée" une fois le plafond atteint. */
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
 * Bouton "Aide" générique, réplique exacte de `components5e/BoutonAide.tsx`/`components6e/BoutonAide.tsx`
 * (même props, même libellé à 3 états, même classe `.btn-aide`) — jusqu'ici jamais extrait en 4e :
 * chaque écran recopiait son propre `<button className="btn btn-aide">...</button>` à la main, avec
 * sa propre copie de `libelleBoutonAide` dans son `ui/format*.ts`. Rend `null` si l'écran n'a aucune
 * aide prévue (`niveauAideMax === 0`, convention déjà établie côté 5e/6e).
 */
export function BoutonAide({ niveauAide, niveauAideMax, onActiverAide, disabledSupplementaire = false }: Props) {
  if (niveauAideMax === 0) return null;
  const epuise = niveauAide >= niveauAideMax || disabledSupplementaire;
  return (
    <button type="button" className="btn btn-aide" disabled={epuise} onClick={onActiverAide}>
      <IconeAmpoule />
      {libelleBoutonAide(niveauAide, niveauAideMax)}
    </button>
  );
}
