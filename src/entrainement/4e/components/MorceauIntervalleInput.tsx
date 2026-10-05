import type { EtatMorceau } from "../ui/morceauIntervalle";
import {
  crochetDroitEffectif,
  crochetDroitVerrouille,
  crochetGaucheEffectif,
  crochetGaucheVerrouille,
  toggleCrochetDroit as toggleCrochetDroitValeur,
  toggleCrochetGauche as toggleCrochetGaucheValeur,
} from "../ui/morceauIntervalle";

interface Props {
  etat: EtatMorceau;
  onChange: (etat: EtatMorceau) => void;
}

/**
 * Rangée de champs fixes pour un morceau d'intervalle (section 3) : toggle crochet gauche, borne
 * gauche (nombre ou -∞), point-virgule statique, borne droite (nombre ou +∞), toggle crochet
 * droit. Pas de boutons librement enchaînables — la structure de la rangée est fixe. Notation
 * francophone à crochets inversés (]a,b[), jamais de parenthèses. Aucun crochet n'est présélectionné
 * : le bouton affiche "?" tant que l'élève n'a pas cliqué au moins une fois.
 *
 * Champs de borne sans `placeholder` visuel (`aria-label` gardé pour le lecteur d'écran) —
 * condition de la ligne unique compacte à ~380px, voir le commentaire au-dessus de
 * `.morceau-row .morceau-input` dans `App.css`.
 */
export function MorceauIntervalleInput({ etat, onChange }: Props) {
  const verrouilleGauche = crochetGaucheVerrouille(etat);
  const verrouilleDroit = crochetDroitVerrouille(etat);

  function toggleCrochetGauche() {
    onChange({ ...etat, crochetGauche: toggleCrochetGaucheValeur(etat.crochetGauche) });
  }

  function toggleCrochetDroit() {
    onChange({ ...etat, crochetDroit: toggleCrochetDroitValeur(etat.crochetDroit) });
  }

  function toggleMoinsInfini() {
    onChange(
      etat.borneGaucheMode === "-inf"
        ? { ...etat, borneGaucheMode: "nombre", borneGaucheValeur: "" }
        : { ...etat, borneGaucheMode: "-inf", borneGaucheValeur: "" },
    );
  }

  function togglePlusInfini() {
    onChange(
      etat.borneDroiteMode === "+inf"
        ? { ...etat, borneDroiteMode: "nombre", borneDroiteValeur: "" }
        : { ...etat, borneDroiteMode: "+inf", borneDroiteValeur: "" },
    );
  }

  return (
    <div className="morceau-row">
      <button
        type="button"
        className="btn bracket-btn"
        disabled={verrouilleGauche}
        onClick={toggleCrochetGauche}
        aria-label="Crochet gauche"
      >
        {crochetGaucheEffectif(etat) ?? "?"}
      </button>
      <input
        className="text-input morceau-input"
        value={etat.borneGaucheMode === "-inf" ? "" : etat.borneGaucheValeur}
        disabled={etat.borneGaucheMode === "-inf"}
        aria-label="Borne gauche"
        onChange={(e) => onChange({ ...etat, borneGaucheMode: "nombre", borneGaucheValeur: e.target.value })}
      />
      <button
        type="button"
        className={etat.borneGaucheMode === "-inf" ? "btn toggle-active" : "btn"}
        onClick={toggleMoinsInfini}
      >
        -∞
      </button>
      <span className="morceau-separateur">;</span>
      <button
        type="button"
        className={etat.borneDroiteMode === "+inf" ? "btn toggle-active" : "btn"}
        onClick={togglePlusInfini}
      >
        +∞
      </button>
      <input
        className="text-input morceau-input"
        value={etat.borneDroiteMode === "+inf" ? "" : etat.borneDroiteValeur}
        disabled={etat.borneDroiteMode === "+inf"}
        aria-label="Borne droite"
        onChange={(e) => onChange({ ...etat, borneDroiteMode: "nombre", borneDroiteValeur: e.target.value })}
      />
      <button
        type="button"
        className="btn bracket-btn"
        disabled={verrouilleDroit}
        onClick={toggleCrochetDroit}
        aria-label="Crochet droit"
      >
        {crochetDroitEffectif(etat) ?? "?"}
      </button>
    </div>
  );
}
