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
 * Combobox "choisir une variante" — réutilisé tel quel par les 58 générateurs de 4e qui exposent
 * un axe de variante/famille/catégorie de plus haut niveau (`CATALOGUE_VARIANTES`/
 * `CATALOGUE_FAMILLES` + `construireAvecVarianteId`/`construireAvecFamilleId`, voir CLAUDE.md
 * "Catalogue de variantes"). Toujours visible (plus seulement en mode dev — changement demandé
 * explicitement pour que ce choix soit accessible directement depuis le lien « S'entraîner » d'un
 * chapitre, sans manipulation d'URL) ; devenu depuis un vrai outil pour l'élève, stylé en
 * conséquence — voir `.selecteur-variante*` dans `theme.css`, partagé par les 3 chantiers. Rend
 * `null` seulement si `options` est vide.
 */
export function SelecteurVarianteDev({ options, onGenerer }: Props) {
  const [id, setId] = useState(options[0]?.id ?? "");

  if (options.length === 0) return null;

  return (
    <div className="selecteur-variante">
      <label htmlFor="selecteur-variante-select" className="selecteur-variante-label">
        Choisir une variante
      </label>
      <div className="selecteur-variante-row">
        <div className="selecteur-variante-select-wrap">
          <select id="selecteur-variante-select" className="selecteur-variante-select" value={id} onChange={(e) => setId(e.target.value)}>
            {options.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <button type="button" className="btn selecteur-variante-bouton" onClick={() => onGenerer(id)}>
          Générer
        </button>
      </div>
    </div>
  );
}
