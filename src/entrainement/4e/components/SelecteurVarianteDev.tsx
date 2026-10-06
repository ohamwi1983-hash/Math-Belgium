import { useState } from "react";

export interface OptionVarianteDev {
  id: string;
  label: string;
}

interface Props {
  options: OptionVarianteDev[];
  onGenerer: (id: string) => void;
}

/**
 * Panneau "forcer une variante" — réutilisé tel quel par les 58 générateurs de 4e qui exposent un
 * axe de variante/famille/catégorie de plus haut niveau (`CATALOGUE_VARIANTES`/
 * `CATALOGUE_FAMILLES` + `construireAvecVarianteId`/`construireAvecFamilleId`, voir CLAUDE.md
 * "Catalogue de variantes"). Toujours visible (plus seulement en mode dev — changement demandé
 * explicitement pour que ce choix soit accessible directement depuis le lien « S'entraîner » d'un
 * chapitre, sans manipulation d'URL). Rend `null` seulement si `options` est vide.
 */
export function SelecteurVarianteDev({ options, onGenerer }: Props) {
  const [id, setId] = useState(options[0]?.id ?? "");

  if (options.length === 0) return null;

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
