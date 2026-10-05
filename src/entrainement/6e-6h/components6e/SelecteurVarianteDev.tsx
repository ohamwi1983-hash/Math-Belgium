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
 * Panneau DEV-ONLY "forcer une variante" — jamais destiné aux élèves, réutilisé par tous les
 * générateurs `6genX` du chantier 6e FWB (6h). Force la génération d'un exercice selon la
 * famille/variante de plus haut niveau choisie dans le menu déroulant, plutôt que le tirage
 * aléatoire habituel — utile pour tester manuellement une famille précise sans retirer jusqu'à la
 * voir apparaître.
 *
 * Actif dans deux cas SEULEMENT : en local (`import.meta.env.DEV`, toujours vrai sous `npm run
 * dev`), OU sur le déploiement de production via le paramètre d'URL `?dev=1`. Sans l'un ou
 * l'autre, rend `null` — jamais visible par défaut sur l'URL normale donnée aux élèves
 * (`/6e-6h`). Le paramètre `?dev=1` reste lu dynamiquement (jamais figé au premier rendu) via
 * `window.location.search` à chaque rendu du composant : un simple ajout du paramètre à l'URL,
 * sans recharger le module, suffit à l'activer.
 */
export function SelecteurVarianteDev({ options, onGenerer }: Props) {
  const [id, setId] = useState(options[0]?.id ?? "");

  const modeDevActif = import.meta.env.DEV || new URLSearchParams(window.location.search).get("dev") === "1";
  if (!modeDevActif || options.length === 0) return null;

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
