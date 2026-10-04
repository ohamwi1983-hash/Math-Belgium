import { useState } from "react";
import { estModeDevActif } from "../devMode";

export interface OptionVarianteDev {
  id: string;
  label: string;
}

interface Props {
  options: OptionVarianteDev[];
  onGenerer: (id: string) => void;
}

/**
 * Panneau dev-only "forcer une variante" — voir CLAUDE.md, "Panneau dev — forcer une variante".
 * Réutilisé tel quel par les 58 générateurs de 4e qui exposent un axe de variante/famille/catégorie
 * de plus haut niveau (`CATALOGUE_VARIANTES`/`CATALOGUE_FAMILLES` + `construireAvecVarianteId`/
 * `construireAvecFamilleId`, voir CLAUDE.md "Catalogue de variantes"). Rend `null` hors mode dev —
 * jamais visible sur l'URL normale donnée aux élèves.
 */
export function SelecteurVarianteDev({ options, onGenerer }: Props) {
  const [id, setId] = useState(options[0]?.id ?? "");

  if (!estModeDevActif() || options.length === 0) return null;

  return (
    <div className="selecteur-variante-dev">
      <label htmlFor="selecteur-variante-dev-select" className="selecteur-variante-dev-label">
        Dev — forcer une variante
      </label>
      <div className="selecteur-variante-dev-row">
        <select id="selecteur-variante-dev-select" className="selecteur-variante-dev-select" value={id} onChange={(e) => setId(e.target.value)}>
          {options.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
        <button type="button" className="btn selecteur-variante-dev-bouton" onClick={() => onGenerer(id)}>
          Générer
        </button>
      </div>
    </div>
  );
}
