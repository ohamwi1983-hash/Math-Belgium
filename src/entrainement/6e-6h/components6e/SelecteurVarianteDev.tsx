import { useId, useState } from "react";

interface OptionVarianteDev {
  id: string;
  label: string;
}

interface Props {
  options: OptionVarianteDev[];
  onGenerer: (id: string) => void;
}

/**
 * Combobox "choisir une variante", réutilisé par tous les générateurs `6genX` du chantier 6e FWB
 * (6h). Force la génération d'un exercice selon la famille/variante de plus haut niveau choisie
 * dans le menu déroulant, plutôt que le tirage aléatoire habituel — replié par défaut derrière un
 * déclencheur à chevron (option A retenue après comparaison de 3 designs avec l'utilisateur — la
 * plupart des élèves n'ont jamais besoin de forcer une variante précise, inutile de lui faire
 * payer la place en permanence) ; reste ouvert après un clic sur "Générer" pour enchaîner
 * plusieurs essais sans rouvrir à chaque fois. État local (`ouvert`), jamais mémorisé entre
 * générateurs — voir `.selecteur-variante*` dans `theme.css`, partagé tel quel par les 3
 * chantiers. Rend `null` seulement si `options` est vide (aucun axe de variante identifiable pour
 * ce générateur).
 */
export function SelecteurVarianteDev({ options, onGenerer }: Props) {
  const [id, setId] = useState(options[0]?.id ?? "");
  const [ouvert, setOuvert] = useState(false);
  const panelId = useId();

  if (options.length === 0) return null;

  return (
    <div className="selecteur-variante-bloc">
      <button type="button" className="selecteur-variante-toggle" aria-expanded={ouvert} aria-controls={panelId} onClick={() => setOuvert((v) => !v)}>
        <span className="selecteur-variante-toggle-chevron" />
        Choisir une variante spécifique
      </button>
      <div id={panelId} className={`selecteur-variante-reveal${ouvert ? " est-ouvert" : ""}`}>
        <div className="selecteur-variante-reveal-inner">
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
        </div>
      </div>
    </div>
  );
}
