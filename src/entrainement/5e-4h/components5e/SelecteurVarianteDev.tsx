import { useState } from "react";

export interface OptionVarianteDev {
  id: string;
  label: string;
}

interface Props {
  options: OptionVarianteDev[];
  onGenerer: (id: string) => void;
}

/** Combobox "choisir une variante". Force la génération d'un exercice selon une variante/famille/
 * scénario de plus haut niveau choisie dans un menu déroulant, plutôt que le tirage aléatoire
 * habituel. Ne rend rien si `options` est vide (aucun point de tirage de haut niveau identifiable
 * pour ce générateur) — jamais un sélecteur artificiel. Toujours visible (plus seulement derrière
 * `import.meta.env.DEV`/`?dev=1` — changement demandé explicitement pour que ce choix soit
 * accessible directement depuis le lien « S'entraîner » d'un chapitre, sans manipulation d'URL) ;
 * devenu depuis un vrai outil pour l'élève, stylé en conséquence et structurellement identique aux
 * composants 4e/6e — voir `.selecteur-variante*` dans `theme.css`, partagé par les 3 chantiers
 * (auparavant un `<details>` sans aucune règle CSS dédiée, rendu entièrement par défaut). */
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
            {options.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
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
