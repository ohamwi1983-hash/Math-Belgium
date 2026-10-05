import { useState } from "react";
import type { ExerciceSectionPlaneSolide } from "../core/sectionPlaneSolide.types";
import { NIVEAU_AIDE_MAX_AUXILIAIRE } from "../moteur/sessionSectionPlaneSolide";
import {
  CONSIGNE_AUXILIAIRE_LIGNES,
  TEXTE_AIDE_AUXILIAIRE_NIVEAU1,
  apercuLignesChoisies,
  candidatsLignesAuxiliaires,
  facesAMoitieConnues,
  libelleBoutonAide,
  pointsExtraConnus,
  segmentsExtraTraces,
  texteAideAuxiliaireNiveau2,
  texteProgressionPoints,
  texteProgressionSegments,
} from "../ui/formatSectionPlaneSolide";
import { formatMessageErreur } from "../ui/messageErreur";
import { Solide3DSketch } from "./Solide3DSketch";

interface Props {
  exercice: ExerciceSectionPlaneSolide;
  connus: number[];
  segmentsTraces: string[];
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  onActiverAide: () => void;
  onValider: (ligne1: string, ligne2: string) => void;
}

/**
 * Écran type B, étape 1 — "Construire un point auxiliaire" : sélection de 2 droites coplanaires
 * (exactement 2, jamais plus) parmi les arêtes/diagonales du solide et les segments déjà tracés de
 * la section, dont le prolongement se croise. L'aide (2 niveaux, PARTAGÉE avec l'étape suivante,
 * `niveauAide` non réinitialisé entre les deux — voir `sessionSectionPlaneSolide.ts`) reste donc
 * visible identiquement sur l'écran suivant si déjà activée ici.
 */
export function EtapeAuxiliaireLignes({ exercice, connus, segmentsTraces, tentativesUtilisees, tentativesMax, niveauAide, onActiverAide, onValider }: Props) {
  const [selection, setSelection] = useState<string[]>([]);
  const max = NIVEAU_AIDE_MAX_AUXILIAIRE;
  const erronee = tentativesUtilisees > 0;

  const lignesStatiques = exercice.lignesStatiques.map((l) => ({ cle: l.cle, label: l.label }));
  const candidats = candidatsLignesAuxiliaires(connus, lignesStatiques, segmentsTraces);
  const facesAide = facesAMoitieConnues(exercice, new Set(connus));

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
      <p className="prompt-text">
        {texteProgressionPoints(exercice, connus)} — {texteProgressionSegments(exercice, segmentsTraces)}
      </p>

      <Solide3DSketch
        solide={exercice.solide}
        pointsExtra={pointsExtraConnus(exercice, connus)}
        segmentsExtra={[...segmentsExtraTraces(exercice, segmentsTraces), ...apercuLignesChoisies(exercice, selection)]}
      />

      <div className="options-grid-compact">
        {candidats.map((candidat) => {
          const actif = selection.includes(candidat.cle);
          return (
            <button
              key={candidat.cle}
              type="button"
              className={`btn${actif ? " toggle-active" : ""}${erronee && actif ? " is-erronee" : ""}`}
              onClick={() => basculer(candidat.cle)}
            >
              {candidat.label}
            </button>
          );
        })}
      </div>

      {niveauAide > 0 && (
        <div className="triangle-quelconque-aide">
          <p>{TEXTE_AIDE_AUXILIAIRE_NIVEAU1}</p>
          {niveauAide >= 2 && <p>{texteAideAuxiliaireNiveau2(exercice, facesAide)}</p>}
        </div>
      )}
      <button type="button" className="btn btn-aide" disabled={niveauAide >= max} onClick={onActiverAide}>
        {libelleBoutonAide(niveauAide, max)}
      </button>

      <button type="button" className="btn btn-primary" disabled={selection.length !== 2} onClick={() => selection.length === 2 && onValider(selection[0], selection[1])}>
        Valider
      </button>
      {tentativesUtilisees > 0 && (
        <p className="alert-error" role="alert">
          {formatMessageErreur(tentativesUtilisees, tentativesMax)}
        </p>
      )}
    </div>
  );
}
