import { useState } from "react";

interface OptionVarianteDev {
  id: string;
  label: string;
}

interface Props {
  options: OptionVarianteDev[];
  onGenerer: (id: string) => void;
}

/**
 * Panneau "forcer une variante", réutilisé par tous les générateurs `6genX` du chantier 6e FWB
 * (6h). Force la génération d'un exercice selon la famille/variante de plus haut niveau choisie
 * dans le menu déroulant, plutôt que le tirage aléatoire habituel — toujours visible (plus
 * seulement en mode dev, `import.meta.env.DEV`/`?dev=1` — changement demandé explicitement pour
 * que ce choix soit accessible directement depuis le lien « S'entraîner » d'un chapitre, sans
 * manipulation d'URL). Rend `null` seulement si `options` est vide (aucun axe de variante
 * identifiable pour ce générateur).
 */
export function SelecteurVarianteDev({ options, onGenerer }: Props) {
  const [id, setId] = useState(options[0]?.id ?? "");

  if (options.length === 0) return null;

  return (
    <div className="selecteur-variante-dev">
      <p className="selecteur-variante-dev-label">🛠 Dev — forcer une variante</p>
      <div className="field-row">
        <select className="text-input" value={id} onChange={(e) => setId(e.target.value)}>
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
    </div>
  );
}
