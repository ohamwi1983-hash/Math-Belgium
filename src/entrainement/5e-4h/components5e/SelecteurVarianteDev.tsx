import { useState } from "react";

export interface OptionVarianteDev {
  id: string;
  label: string;
}

interface Props {
  options: OptionVarianteDev[];
  onGenerer: (id: string) => void;
}

/** Panneau "forcer une variante". Force la génération d'un exercice selon une variante/famille/
 * scénario de plus haut niveau choisie dans un menu déroulant, plutôt que le tirage aléatoire
 * habituel. Ne rend rien si `options` est vide (aucun point de tirage de haut niveau identifiable
 * pour ce générateur) — jamais un sélecteur artificiel. Toujours visible (plus seulement derrière
 * `import.meta.env.DEV`/`?dev=1` — changement demandé explicitement pour que ce choix soit
 * accessible directement depuis le lien « S'entraîner » d'un chapitre, sans manipulation d'URL). */
export function SelecteurVarianteDev({ options, onGenerer }: Props) {
  const [id, setId] = useState(options[0]?.id ?? "");
  if (options.length === 0) return null;
  return (
    <details className="dev-panel">
      <summary>🛠 Dev — forcer une variante</summary>
      <div className="dev-panel-body">
        <select className="dev-panel-select" value={id} onChange={(e) => setId(e.target.value)}>
          {options.map((o) => (
            <option key={o.id} value={o.id}>
              {o.label}
            </option>
          ))}
        </select>
        <button type="button" className="btn" onClick={() => onGenerer(id)}>
          Générer
        </button>
      </div>
    </details>
  );
}
