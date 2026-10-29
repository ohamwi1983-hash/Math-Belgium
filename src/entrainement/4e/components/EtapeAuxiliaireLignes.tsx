import { useState } from "react";
import type { ExerciceSectionPlaneSolide } from "../core/sectionPlaneSolide.types";
import { NIVEAU_AIDE_MAX_AUXILIAIRE } from "../moteur/sessionSectionPlaneSolide";
import {
  CONSIGNE_AUXILIAIRE_LIGNES,
  TEXTE_AIDE_AUXILIAIRE_NIVEAU1,
  apercuLignesChoisies,
  elementsConstructionAuxiliaire,
  groupesLignesAuxiliaires,
  pointsExtraConnus,
  segmentsExtraTraces,
  texteAideLignesNiveau2,
  texteProgression,
} from "../ui/formatSectionPlaneSolide";
import { formatMessageErreur } from "../ui/messageErreur";
import { Solide3DSketch } from "./Solide3DSketch";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { BoutonAide } from "./BoutonAide";

interface Props {
  exercice: ExerciceSectionPlaneSolide;
  connus: number[];
  segmentsTraces: string[];
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  onActiverAide: () => void;
  onValider: (ligne1: string, ligne2: string) => void;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
  /** Paire de droites CONFIRMÉE (celle de l'élève si correcte, sinon la paire révélée) — présente
   * avec `validation` : ses prolongements et le point auxiliaire I sont alors dessinés. */
  paireConfirmee?: [string, string] | null;
}

/**
 * Écran type B, étape 1 — "Construire un point auxiliaire" : sélection de 2 droites coplanaires
 * (exactement 2, jamais plus) parmi les arêtes/diagonales du solide et les segments déjà tracés de
 * la section, dont le prolongement se croise. Les droites sont rangées en 3 groupes (segments
 * tracés, arêtes, diagonales — audit chapitre 8, point 27). Seule la paire réellement REFUSÉE est
 * marquée en rouge, et seulement tant que la sélection n'a pas changé.
 */
export function EtapeAuxiliaireLignes({ exercice, connus, segmentsTraces, tentativesUtilisees, tentativesMax, niveauAide, onActiverAide, onValider, validation, paireConfirmee }: Props) {
  const [selection, setSelection] = useState<string[]>([]);
  const [paireSoumise, setPaireSoumise] = useState<string[]>([]);
  const max = NIVEAU_AIDE_MAX_AUXILIAIRE;
  const selectionInchangee = selection.length === 2 && selection.every((c) => paireSoumise.includes(c));
  const refusee = (validation ? validation.revele : tentativesUtilisees > 0) && selectionInchangee;

  const groupes = groupesLignesAuxiliaires(exercice, connus, segmentsTraces);
  const construction = validation && paireConfirmee ? elementsConstructionAuxiliaire(exercice, connus, paireConfirmee[0], paireConfirmee[1]) : null;

  function basculer(cle: string) {
    setSelection((liste) => {
      if (liste.includes(cle)) return liste.filter((c) => c !== cle);
      if (liste.length >= 2) return liste;
      return [...liste, cle];
    });
  }

  return (
    <div>
      <p className="prompt-text">{CONSIGNE_AUXILIAIRE_LIGNES}</p>
      <p className="prompt-fact">{texteProgression(connus, segmentsTraces)}</p>

      <Solide3DSketch
        solide={exercice.solide}
        pointsExtra={[...pointsExtraConnus(exercice, connus), ...(construction?.points ?? [])]}
        segmentsExtra={[...segmentsExtraTraces(exercice, segmentsTraces), ...(construction ? construction.segments : apercuLignesChoisies(exercice, selection))]}
      />

      {groupes.map((groupe) => (
        <div key={groupe.titre} style={{ marginTop: "0.75rem" }}>
          <p className="field-label field-label-minuscule">{groupe.titre}</p>
          <div className="options-grid-compact">
            {groupe.lignes.map((ligne) => {
              const actif = selection.includes(ligne.cle);
              return (
                <button
                  key={ligne.cle}
                  type="button"
                  className={`btn${actif ? " toggle-active" : ""}${refusee && actif ? " is-erronee" : ""}`}
                  onClick={() => basculer(ligne.cle)}
                  disabled={Boolean(validation)}
                >
                  {ligne.label}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {niveauAide > 0 && (
        <div className="triangle-quelconque-aide">
          <p>{TEXTE_AIDE_AUXILIAIRE_NIVEAU1}</p>
          {niveauAide >= 2 && <p>{texteAideLignesNiveau2(exercice, connus, segmentsTraces)}</p>}
        </div>
      )}
      {!validation && (
        <>
          <BoutonAide niveauAide={niveauAide} niveauAideMax={max} onActiverAide={onActiverAide} />

          <button
            type="button"
            className="btn btn-primary"
            disabled={selection.length !== 2}
            onClick={() => {
              if (selection.length !== 2) return;
              setPaireSoumise(selection);
              onValider(selection[0], selection[1]);
            }}
          >
            Valider
          </button>
          {tentativesUtilisees > 0 && (
            <p className="alert-error" role="alert">
              {formatMessageErreur(tentativesUtilisees, tentativesMax)}
            </p>
          )}
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
