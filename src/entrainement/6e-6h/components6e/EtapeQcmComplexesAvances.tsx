import { useState } from "react";
import { Katex } from "../components/Katex";
import { RenduFragments } from "../components/RenduFragments";
import type { AideAvecLatex, FragmentConsigne, OptionQcm } from "../ui6e/formatComplexesAvances";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { BoutonAide } from "./BoutonAide";
import { EnTeteExercice } from "./EnTeteExercice";

interface Props {
  consigneGenerale: FragmentConsigne[];
  blocDonnees: string[];
  consigneEcran: FragmentConsigne[];
  options: OptionQcm[];
  aideNiveau1: AideAvecLatex;
  aideNiveau2: AideAvecLatex;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (id: string) => void;
  /** Mélange l'ordre des options une fois, au montage de l'écran (audit 6e ch. 5 : la bonne
   * réponse était toujours la 1re). */
  melanger?: boolean;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

function melangerOptions<T>(liste: T[]): T[] {
  const copie = [...liste];
  for (let i = copie.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copie[i], copie[j]] = [copie[j], copie[i]];
  }
  return copie;
}

/**
 * Écran GÉNÉRIQUE "choix parmi N options" pour `6gen42` — mirroir
 * `EtapeChoixCongruenceFormeTrigonometrique.tsx` (6gen37), généralisé à un nombre d'options
 * variable. Réutilisé par les 3 écrans QCM de la famille A (`aEcran1/2/3`) et les écrans 3 des
 * familles C et E (`cEcran3`, `eEcran3`). Boutons `.btn.toggle-active`, JAMAIS `.btn-primary`
 * (réservé à "Valider", convention CLAUDE.md). `App6gen42.tsx` doit le rendre avec `key={phase}`.
 */
export function EtapeQcmComplexesAvances({ consigneGenerale, blocDonnees, consigneEcran, options, aideNiveau1, aideNiveau2, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, validation, melanger = false }: Props) {
  const [choix, setChoix] = useState<string | null>(null);
  const [ordre] = useState<OptionQcm[]>(() => (melanger ? melangerOptions(options) : options));
  // Options longues (conditions sur plusieurs lignes, phrases) : une seule colonne, sinon la grille
  // à 2 colonnes débordait de l'écran à 390 px (audit 6e ch. 5).
  const uneColonne = options.some((o) => (o.latex ?? "").includes("array") || o.label.length > 34);
  const montrerErreurs = tentativesUtilisees > 0;

  function valider() {
    if (choix === null) return;
    onValider(choix);
  }

  return (
    <div>
      <EnTeteExercice
        consigneGenerale={<RenduFragments fragments={consigneGenerale} />}
        blocDonnees={
          <div className="equation-box">
            <div className="equation-box-donnees">
              {blocDonnees.map((frag, i) => (
                <Katex key={i} expression={frag} block />
              ))}
            </div>
          </div>
        }
      />
      <p className="prompt-text">
        <RenduFragments fragments={consigneEcran} />
      </p>
      <div className="options-grid-compact" style={uneColonne ? { gridTemplateColumns: "minmax(0, 1fr)" } : undefined}>
        {ordre.map((option) => (
          <button key={option.id} type="button" data-option-id={option.id} aria-label={option.label} className={`btn ${choix === option.id ? "toggle-active" : ""} ${montrerErreurs && choix === option.id ? "is-erronee" : ""}`} disabled={Boolean(validation)} onClick={() => setChoix(option.id)}>
            {option.latex ? <Katex expression={option.latex} /> : option.label}
          </button>
        ))}
      </div>
      {niveauAide >= 1 && (
        <div className="aide-5e">
          <p>{aideNiveau1.texte}</p>
          {aideNiveau1.latex && <Katex expression={aideNiveau1.latex} block />}
          {niveauAide >= 2 && (
            <>
              <p>{aideNiveau2.texte}</p>
              {aideNiveau2.latex && <Katex expression={aideNiveau2.latex} block />}
            </>
          )}
        </div>
      )}
      {!validation && (
        <>
        <BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />
        <button type="button" className="btn btn-primary" disabled={choix === null} onClick={valider}>
          Valider
        </button>
        {montrerErreurs && (
          <p className="alert-error" role="alert">
            Incorrect — tentative {tentativesUtilisees}/{tentativesMax}, réessaie.
          </p>
        )}
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
