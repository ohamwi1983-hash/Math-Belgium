import { useState } from "react";
import type { ReactNode } from "react";
import type { FragmentConsigne } from "../../export/genererFeuilleExercices";
import type { ChoixIndicateur, Justification } from "../core/valeurAberrante.types";
import type { OptionChoix } from "../ui/formatValeurAberrante";
import { BlocAides, type PropsAides } from "./EtapesDetectiveErreurs";
import { RenduFragments } from "./RenduFragments";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";

/**
 * Écran c de gen110 (« Moyenne ou médiane ? La valeur aberrante ») : DEUX choix fermés validés
 * ensemble, en UNE seule tentative — l'indicateur le plus représentatif (moyenne / médiane / les
 * deux se valent) et sa justification (quatre phrases, toujours les mêmes, mélangées). Juste si les
 * deux le sont. Une fois l'écran clos : l'explication chiffrée et le nuage de points (moyenne et
 * médiane repérées), puis « Écran suivant / Nouvel exercice ». Les écrans a et b (champs) réutilisent
 * `EtapeChampsTransformation` (gen108). Aucun point affiché.
 */

interface Props extends PropsAides {
  consigne: FragmentConsigne[];
  indicateurs: OptionChoix<ChoixIndicateur>[];
  justifications: OptionChoix<Justification>[];
  bonIndicateur: ChoixIndicateur;
  bonneJustification: Justification;
  explication: FragmentConsigne[];
  figure: string;
  onValider: (indicateur: ChoixIndicateur, justification: Justification) => void;
  validation?: ValidationEtapeProps | null;
}

function GroupeChoix<T extends string>({ titre, options, choix, bonne, fige, onChoisir }: { titre: string; options: OptionChoix<T>[]; choix: T | null; bonne: T; fige: boolean; onChoisir: (id: T) => void }): ReactNode {
  return (
    <div style={{ margin: "12px 0" }}>
      <p style={{ margin: "0 0 6px", fontWeight: 600 }}>{titre}</p>
      <div style={{ display: "grid", gap: 8 }} role="group" aria-label={titre}>
        {options.map(({ id, fragments }) => {
          const choisi = choix === id;
          const faux = fige && choisi && id !== bonne;
          return (
            <button
              key={id}
              type="button"
              disabled={fige}
              aria-pressed={choisi}
              className={`btn${choisi ? " toggle-active" : ""}${faux ? " is-erronee" : ""}`}
              style={{ textAlign: "left", justifyContent: "flex-start", whiteSpace: "normal", lineHeight: 1.45, padding: "10px 14px", minHeight: 44, height: "auto" }}
              onClick={() => onChoisir(id)}
            >
              <span>
                <RenduFragments fragments={fragments} />
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function EtapeVerdictAberrante({ consigne, indicateurs, justifications, bonIndicateur, bonneJustification, explication, figure, onValider, validation, ...aides }: Props) {
  const [indicateur, setIndicateur] = useState<ChoixIndicateur | null>(null);
  const [justification, setJustification] = useState<Justification | null>(null);
  const fige = !!validation;
  const complet = indicateur !== null && justification !== null;
  return (
    <div>
      <p className="prompt-text">
        <RenduFragments fragments={consigne} />
      </p>
      <GroupeChoix titre="Indicateur le plus représentatif" options={indicateurs} choix={indicateur} bonne={bonIndicateur} fige={fige} onChoisir={setIndicateur} />
      <GroupeChoix titre="Justification" options={justifications} choix={justification} bonne={bonneJustification} fige={fige} onChoisir={setJustification} />
      {!validation && (
        <>
          <BlocAides {...aides} />
          <button type="button" className="btn btn-primary" disabled={!complet} onClick={() => complet && onValider(indicateur, justification)}>
            Valider
          </button>
          {!complet && (indicateur !== null || justification !== null) && (
            <p className="field-hint" style={{ fontSize: "0.9em", color: "var(--color-text-muted)" }}>
              Choisis un indicateur ET une justification : une seule tentative pour les deux.
            </p>
          )}
        </>
      )}
      {validation && (
        <>
          <div className="triangle-quelconque-aide">
            <p>
              <RenduFragments fragments={explication} />
            </p>
          </div>
          <div style={{ margin: "10px auto 4px", maxWidth: 440 }} dangerouslySetInnerHTML={{ __html: figure }} />
          <ValidationEcran {...validation} />
        </>
      )}
    </div>
  );
}
