/**
 * Bouton "Aide" partagé — `promptalignementstyle4epour6e.md`, point 1. Convention à 3 états
 * (`niveauAide < niveauAideMax` selon la valeur exacte) plutôt qu'un simple booléen "utilisée" :
 * `"Aide"` (niveau 0, rien encore consulté), `"Aide supplémentaire"` (au moins un niveau consulté
 * mais le plafond n'est pas encore atteint), `"Aide utilisée"` (plafond atteint, bouton désactivé).
 * Classe `.btn-aide` (jamais `.btn.btn-primary`, réservée au bouton "Valider") — CSS déjà présente
 * dans `App.css`, jusqu'ici jamais consommée par aucun générateur 6e (chacun rendait son propre
 * `<button className="btn" ...>Aide</button>` générique).
 *
 * **Rend `null` si `niveauAideMax === 0`** (écran sans aide prévue, ex. un QCM de reconnaissance
 * pure) — même convention "max=0 → pas de bouton" déjà établie ailleurs sur la plateforme.
 *
 * **Doit être rendu par le composant ÉCRAN lui-même (l'`Etape*.tsx`), jamais par l'`App6genX.tsx`
 * parent** — piège documenté par l'audit (déjà trouvé et corrigé sur 18 générateurs 5e) : rendu au
 * niveau du parent, ce bouton apparaissait systématiquement APRÈS le bouton "Valider" de l'écran
 * enfant dans l'ordre du DOM, jamais avant, quel que soit l'ordre visuel voulu. Chaque écran doit
 * donc accepter `niveauAide`/`niveauAideMax`/`onActiverAide` en props et rendre lui-même
 * `<BoutonAide .../>` À L'ENDROIT voulu (juste avant son propre bouton "Valider").
 */
interface Props {
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
}

export function BoutonAide({ niveauAide, niveauAideMax, onActiverAide }: Props) {
  if (niveauAideMax === 0) return null;

  const plafondAtteint = niveauAide >= niveauAideMax;
  const libelle = niveauAide === 0 ? "Aide" : plafondAtteint ? "Aide utilisée" : "Aide supplémentaire";

  return (
    <button type="button" className="btn btn-aide" disabled={plafondAtteint} onClick={onActiverAide}>
      {libelle}
    </button>
  );
}
