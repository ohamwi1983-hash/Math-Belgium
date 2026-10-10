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
      {libelleBoutonAide(niveauAide, niveauAideMax)}
    </button>
  );
}
