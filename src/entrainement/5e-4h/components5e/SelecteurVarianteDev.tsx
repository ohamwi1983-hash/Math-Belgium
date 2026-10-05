import { useState } from "react";

export interface OptionVarianteDev {
  id: string;
  label: string;
}

interface Props {
  options: OptionVarianteDev[];
  onGenerer: (id: string) => void;
}

/** Actif en mode développement local (`import.meta.env.DEV`) OU sur un déploiement de production
 * (ex. Vercel) quand l'URL porte `?dev=1` — permet à Omar de forcer une variante depuis n'importe
 * quelle URL déployée pour ses tests manuels, sans avoir besoin de lancer `npm run dev` en local.
 * Jamais actif par défaut sur une URL "normale" (celle donnée aux élèves) : le paramètre doit être
 * ajouté explicitement. `typeof window === "undefined"` couvre un éventuel rendu côté serveur, où
 * `window.location` n'existe pas. */
function panneauDevActif(): boolean {
  if (import.meta.env.DEV) return true;
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).get("dev") === "1";
}

/** Panneau dev-only — voir `panneauDevActif` pour les conditions d'activation. Force la génération
 * d'un exercice selon une variante/famille/scénario de plus haut niveau choisie dans un menu
 * déroulant, plutôt que le tirage aléatoire habituel. Ne rend rien si `options` est vide (aucun
 * point de tirage de haut niveau identifiable pour ce générateur) — jamais un sélecteur artificiel.
 * Contrairement à la version d'origine (dev-only stricte), ce composant N'EST PLUS éliminé du
 * bundle de production par dead-code elimination (la condition n'est plus une constante statique) —
 * changement de comportement voulu, demandé explicitement pour permettre l'usage sur Vercel. */
export function SelecteurVarianteDev({ options, onGenerer }: Props) {
  const [id, setId] = useState(options[0]?.id ?? "");
  if (!panneauDevActif() || options.length === 0) return null;
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
