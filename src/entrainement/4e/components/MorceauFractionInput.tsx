import type { EtatMorceauFraction } from "../ui/morceauFraction";
import {
  crochetDroitEffectifFraction,
  crochetDroitVerrouilleFraction,
  crochetGaucheEffectifFraction,
  crochetGaucheVerrouilleFraction,
  toggleCrochetDroitFraction as toggleCrochetDroitValeur,
  toggleCrochetGaucheFraction as toggleCrochetGaucheValeur,
} from "../ui/morceauFraction";

interface Props {
  etat: EtatMorceauFraction;
  onChange: (etat: EtatMorceauFraction) => void;
}

/** Variante fraction-compatible de `MorceauIntervalleInput.tsx` (mêmes structure/UX exactes, seul
 * le parsing des bornes change — voir `ui/morceauFraction.ts`). Champs de borne sans `placeholder`
 * visuel (`aria-label` gardé pour le lecteur d'écran) — condition de la ligne unique compacte à
 * ~380px, voir le commentaire au-dessus de `.morceau-row .morceau-input` dans `App.css`. */
export function MorceauFractionInput({ etat, onChange }: Props) {
  const verrouilleGauche = crochetGaucheVerrouilleFraction(etat);
  const verrouilleDroit = crochetDroitVerrouilleFraction(etat);

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
      <button type="button" className="btn bracket-btn" disabled={verrouilleGauche} onClick={toggleCrochetGauche} aria-label="Crochet gauche">
        {crochetGaucheEffectifFraction(etat) ?? "?"}
      </button>
      <input
        className="text-input morceau-input"
        value={etat.borneGaucheMode === "-inf" ? "" : etat.borneGaucheValeur}
        disabled={etat.borneGaucheMode === "-inf"}
        aria-label="Borne gauche"
        onChange={(e) => onChange({ ...etat, borneGaucheMode: "nombre", borneGaucheValeur: e.target.value })}
      />
      <button type="button" className={etat.borneGaucheMode === "-inf" ? "btn toggle-active" : "btn"} onClick={toggleMoinsInfini}>
        -∞
      </button>
      <span className="morceau-separateur">;</span>
      <button type="button" className={etat.borneDroiteMode === "+inf" ? "btn toggle-active" : "btn"} onClick={togglePlusInfini}>
        +∞
      </button>
      <input
        className="text-input morceau-input"
        value={etat.borneDroiteMode === "+inf" ? "" : etat.borneDroiteValeur}
        disabled={etat.borneDroiteMode === "+inf"}
        aria-label="Borne droite"
        onChange={(e) => onChange({ ...etat, borneDroiteMode: "nombre", borneDroiteValeur: e.target.value })}
      />
      <button type="button" className="btn bracket-btn" disabled={verrouilleDroit} onClick={toggleCrochetDroit} aria-label="Crochet droit">
        {crochetDroitEffectifFraction(etat) ?? "?"}
      </button>
    </div>
  );
}
