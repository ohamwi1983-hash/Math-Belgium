import { useState } from "react";
import type { ExerciceSectionPlaneSolide } from "../core/sectionPlaneSolide.types";
import { NIVEAU_AIDE_MAX_AUXILIAIRE } from "../moteur/sessionSectionPlaneSolide";
import { etapeParallele } from "../moteur/verificationSectionPlaneSolide";
import {
  TEXTE_AIDE_PARALLELE_NIVEAU1,
  consigneParallele,
  decorDonnees,
  elementsConstructionParallele,
  nomCoteKLM,
  pointsExtraConnus,
  segmentsExtraTraces,
  texteAideParalleleNiveau2,
  texteProgression,
} from "../ui/formatSectionPlaneSolide";
import { ariaOptionChoixFerme, classeOptionChoixFerme } from "../ui/choixFige";
import { Solide3DSketch } from "./Solide3DSketch";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { BoutonAide } from "./BoutonAide";
import { TexteInsistance } from "../../components/TexteInsistance";

interface Props {
  exercice: ExerciceSectionPlaneSolide;
  connus: number[];
  segmentsTraces: string[];
  niveauAide: number;
  onActiverAide: () => void;
  onValider: (cote: number) => void;
  validation?: ValidationEtapeProps | null;
  /** Côté de KLM juste (vert ✓ une fois l'écran clos ; un choix faux est marqué rouge ✗). */
  coteJuste?: number | null;
}

/**
 * Écran « parallèle » — variante du manuel « plan π parallèle à (KLM) passant par P » (gen40). La
 * face et le point de départ du côté sont donnés (on fait le tour de la section depuis P) ; l'élève
 * choisit le côté du triangle KLM auquel le côté cherché est parallèle (une tentative, choix figé
 * ✗ / ✓). Une fois l'écran clos, le côté et son nouveau point sont dessinés, et le côté de KLM
 * correspondant est repassé en orange.
 */
export function EtapeParalleleSection({ exercice, connus, segmentsTraces, niveauAide, onActiverAide, onValider, validation, coteJuste }: Props) {
  const [coteChoisi, setCoteChoisi] = useState<number | null>(null);
  const etape = etapeParallele(exercice, connus);
  const plan = exercice.planParallele;
  if (!etape || !plan) return null;
  const etatOptions = { selection: coteChoisi, choisie: validation ? coteChoisi : null, bonne: coteJuste ?? -1 };
  const decor = decorDonnees(exercice);
  const construction = validation ? elementsConstructionParallele(exercice, connus, etape) : { segments: [], points: [] };

  return (
    <div>
      <p className="prompt-text">{consigneParallele(exercice, connus, etape.face, etape.depuis)}</p>
      <p className="prompt-fact">{texteProgression(connus, segmentsTraces, exercice)}</p>

      <Solide3DSketch
        solide={exercice.solide}
        pointsExtra={[...decor.points, ...pointsExtraConnus(exercice, connus), ...construction.points]}
        segmentsExtra={[...decor.segments, ...segmentsExtraTraces(exercice, segmentsTraces), ...construction.segments]}
      />

      <div className="options-grid-compact" role="radiogroup">
        {plan.cotes.map((_, cote) => {
          const aria = ariaOptionChoixFerme(cote, etatOptions);
          return (
            <button
              key={cote}
              type="button"
              role="radio"
              aria-checked={coteChoisi === cote}
              className={classeOptionChoixFerme(cote, etatOptions)}
              onClick={() => setCoteChoisi(cote)}
              disabled={Boolean(validation)}
            >
              {nomCoteKLM(exercice, cote)}
              {aria && <span className="sr-only"> — {aria}</span>}
            </button>
          );
        })}
      </div>

      {niveauAide > 0 && (
        <div className="triangle-quelconque-aide">
          <p>{TEXTE_AIDE_PARALLELE_NIVEAU1}</p>
          {niveauAide >= 2 && <p><TexteInsistance texte={texteAideParalleleNiveau2(exercice, etape.face)} /></p>}
        </div>
      )}
      {!validation && (
        <>
          <BoutonAide niveauAide={niveauAide} niveauAideMax={NIVEAU_AIDE_MAX_AUXILIAIRE} onActiverAide={onActiverAide} />
          <button
            type="button"
            className="btn btn-primary"
            disabled={coteChoisi === null}
            onClick={() => {
              if (coteChoisi !== null) onValider(coteChoisi);
            }}
          >
            Valider
          </button>
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
