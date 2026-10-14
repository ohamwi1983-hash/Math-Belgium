import { useId, useState } from "react";

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
 * "Catalogue de variantes"). Replié par défaut derrière un déclencheur à chevron (option A retenue
 * après comparaison de 3 designs avec l'utilisateur — la plupart des élèves n'ont jamais besoin de
 * forcer une variante précise, inutile de lui faire payer la place en permanence) ; reste ouvert
 * après un clic sur "Générer" pour enchaîner plusieurs essais sans rouvrir à chaque fois. État
 * local (`ouvert`), jamais mémorisé entre générateurs — replié à chaque nouveau chargement. Voir
 * `.selecteur-variante*` dans `theme.css`, partagé par les 3 chantiers. Rend `null` seulement si
 * `options` est vide.
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
        </div>
      </div>
    </div>
  );
}
