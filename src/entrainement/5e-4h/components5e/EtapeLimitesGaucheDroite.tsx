import { useState } from "react";
import type { ExerciceLimite } from "../core5e/limites.types";
import type { ReponseLimitesGaucheDroite } from "../moteur5e/sessionLimites";
import { consigneGenerale, formatBlocDonneesLatex, formatLabelLimiteDroiteLatex, formatLabelLimiteGaucheLatex, texteAideNiveau1, texteAideNiveau2 } from "../ui5e/formatLimites";
import { Katex } from "../components/Katex";
import { BoutonAide } from "./BoutonAide";
import { EtatActuelLimite } from "./EtatActuelLimite";

const OPTIONS_SIGNE_INFINI: { id: "1" | "-1"; label: string }[] = [
  { id: "1", label: "+∞" },
  { id: "-1", label: "−∞" },
];

interface Props {
  exercice: ExerciceLimite;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseLimitesGaucheDroite) => void;
  /** Correction PAR CÔTÉ, calculée côté PRÉSENTATION uniquement. */
  diagnostiquer?: (reponse: ReponseLimitesGaucheDroite) => { gauche: boolean; droite: boolean };
}

/** Écran "limitesGaucheDroite" (Branche B, famille "limiteInfiniePoint" uniquement) — 2 questions
 * sur le même écran, chacune étiquetée par la limite UNILATÉRALE correspondante (notation par
 * EXPOSANT, `x\to a^-`/`x\to a^+` — `formatLabelLimiteGaucheLatex`/`formatLabelLimiteDroiteLatex`),
 * réponse par VRAI combobox natif (`<select>.ce-select`, jamais des boutons). Aide à 2 niveaux :
 * niveau 1 = méthode (signes numérateur/dénominateur), niveau 2 = exemple DIFFÉRENT de l'exercice. */
export function EtapeLimitesGaucheDroite({ exercice, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, diagnostiquer }: Props) {
  const [gauche, setGauche] = useState<1 | -1 | null>(null);
  const [droite, setDroite] = useState<1 | -1 | null>(null);
  const montrerErreurs = tentativesUtilisees > 0;
  const complet = gauche !== null && droite !== null;
  const apresEchec = tentativesUtilisees > 0;
  const correction = apresEchec && diagnostiquer && complet ? diagnostiquer({ gauche, droite }) : null;
  const aide2 = texteAideNiveau2(exercice, "limitesGaucheDroite");

  function valider() {
    if (gauche === null || droite === null) return;
    onValider({ gauche, droite });
  }

  function comboboxSigne(id: string, valeur: 1 | -1 | null, setValeur: (v: 1 | -1) => void, erronee: boolean) {
    return (
      <select
        id={id}
        className={erronee ? "ce-select is-erronee" : "ce-select"}
        aria-label="Signe de la limite"
        value={valeur === null ? "" : String(valeur)}
        onChange={(e) => setValeur(Number(e.target.value) as 1 | -1)}
      >
        <option value="" disabled>
          Choisis…
        </option>
        {OPTIONS_SIGNE_INFINI.map((o) => (
          <option key={o.id} value={o.id}>
            {o.label}
          </option>
        ))}
      </select>
    );
  }

  return (
    <div>
      <p className="prompt-text">{consigneGenerale()}</p>
      <div className="equation-box equation-box-donnees">
        <Katex expression={formatBlocDonneesLatex(exercice)} block />
      </div>
      <EtatActuelLimite exercice={exercice} phase="limitesGaucheDroite" />

      <p className="prompt-text">Détermine la limite à gauche.</p>
      <div className="field-row">
        <span className="field-label field-label-minuscule">
          <Katex expression={formatLabelLimiteGaucheLatex(exercice)} block />
        </span>
        {comboboxSigne("limite-gauche", gauche, setGauche, correction !== null && !correction.gauche)}
      </div>

      <p className="prompt-text">Détermine la limite à droite.</p>
      <div className="field-row">
        <span className="field-label field-label-minuscule">
          <Katex expression={formatLabelLimiteDroiteLatex(exercice)} block />
        </span>
        {comboboxSigne("limite-droite", droite, setDroite, correction !== null && !correction.droite)}
      </div>

      <BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />
      <button type="button" className="btn btn-primary" disabled={!complet} onClick={valider}>
        Valider
      </button>
      {montrerErreurs && (
        <p className="alert-error" role="alert">
          Incorrect — tentative {tentativesUtilisees}/{tentativesMax}, réessaie.
        </p>
      )}
      {niveauAide >= 1 && (
        <div className="aide-5e">
          <p>{texteAideNiveau1(exercice, "limitesGaucheDroite")}</p>
          {niveauAide >= 2 && <p>{aide2}</p>}
        </div>
      )}
    </div>
  );
}
