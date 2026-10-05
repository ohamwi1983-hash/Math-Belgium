import type { EnsembleReelGuide } from "../core6e/ensembleReel.types";
import { formatEnsembleReelTexte } from "../ui6e/formatEnsembleReel";

/**
 * Double combobox INDÉPENDANTE — 2 `<select>` natifs côte à côte (`.ce-select`/`.ce-ligne-champs`,
 * déjà partagés par `EtapeCEDomaineDefinition.tsx`, 5gen1), chacun proposant plusieurs
 * `EnsembleReelGuide` (bonne(s) réponse(s) + distracteurs plausibles, mélangés et fournis par le
 * parent — voir `generateurs6e/injectiviteFonctions/distracteurs.ts::construireOptionsCombobox`).
 *
 * Introduit pour `6gen1` écran 5 ("La fonction est bijective sur X dans Y.") — conçu comme un
 * composant RÉUTILISABLE propre à ce générateur pour l'instant (pas généralisé activement dans
 * `components6e/` au sens d'un import par plusieurs générateurs dès aujourd'hui), mais documenté et
 * écrit sans rien de spécifique à l'injectivité : un futur générateur ayant besoin de 2 choix
 * d'ensemble de ℝ indépendants sur un même écran peut l'importer tel quel.
 *
 * Options rendues en TEXTE BRUT (`formatEnsembleReelTexte`, unicode) — un `<select>` HTML natif ne
 * peut afficher que du texte dans ses `<option>`, jamais de KaTeX.
 *
 * Sélection par INDEX dans le tableau `optionsX`/`optionsY` fourni (comparaison par référence,
 * jamais structurelle) — chaque combobox démarre SANS sélection (`value=""`, option placeholder
 * désactivée), jamais une présélection qui donnerait l'impression d'une réponse déjà proposée.
 */
interface Props {
  labelX: string;
  labelY: string;
  optionsX: EnsembleReelGuide[];
  optionsY: EnsembleReelGuide[];
  valeurX: EnsembleReelGuide | null;
  valeurY: EnsembleReelGuide | null;
  onChangeX: (valeur: EnsembleReelGuide) => void;
  onChangeY: (valeur: EnsembleReelGuide) => void;
  disabled?: boolean;
  erroneeX?: boolean;
  erroneeY?: boolean;
}

function indexDe(options: EnsembleReelGuide[], valeur: EnsembleReelGuide | null): string {
  if (valeur === null) return "";
  const i = options.indexOf(valeur);
  return i === -1 ? "" : String(i);
}

export function DoubleComboboxIntervalle({ labelX, labelY, optionsX, optionsY, valeurX, valeurY, onChangeX, onChangeY, disabled = false, erroneeX = false, erroneeY = false }: Props) {
  return (
    <div className="ce-ligne-champs">
      <span>{labelX}</span>
      <select
        className={`ce-select${erroneeX ? " is-erronee" : ""}`}
        value={indexDe(optionsX, valeurX)}
        disabled={disabled}
        onChange={(e) => {
          const i = Number(e.target.value);
          if (Number.isInteger(i) && optionsX[i]) onChangeX(optionsX[i]);
        }}
      >
        <option value="" disabled>
          choisir…
        </option>
        {optionsX.map((o, i) => (
          <option key={i} value={i}>
            {formatEnsembleReelTexte(o)}
          </option>
        ))}
      </select>
      <span>{labelY}</span>
      <select
        className={`ce-select${erroneeY ? " is-erronee" : ""}`}
        value={indexDe(optionsY, valeurY)}
        disabled={disabled}
        onChange={(e) => {
          const i = Number(e.target.value);
          if (Number.isInteger(i) && optionsY[i]) onChangeY(optionsY[i]);
        }}
      >
        <option value="" disabled>
          choisir…
        </option>
        {optionsY.map((o, i) => (
          <option key={i} value={i}>
            {formatEnsembleReelTexte(o)}
          </option>
        ))}
      </select>
    </div>
  );
}
