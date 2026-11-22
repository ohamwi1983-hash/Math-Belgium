import { useState } from "react";
import type { ExerciceRelationsDroites } from "../core/relationsDroites.types";
import { NIVEAU_AIDE_MAX_EXTRACTION, NIVEAU_AIDE_MAX_EXTRACTION2 } from "../moteur/sessionRelationsDroites";
import { diagnostiquerExtraction, diagnostiquerExtraction2 } from "../moteur/verificationRelationsDroites";
import type { ReponseVecteur } from "../moteur/verificationRelationsDroites";
import {
  PLACEHOLDER_COMPOSANTE,
  consigneExtraction,
  consigneExtraction2,
  formatDonneesRechercheeLatex,
  formatEnonceLatex,
  segmentsAideExtraction2Niveau1,
  segmentsAideExtraction2Niveau2,
  segmentsAideExtractionNiveau1,
  segmentsAideExtractionNiveau2,
} from "../ui/formatRelationsDroites";
import { ConsigneGeneraleRelationsDroites } from "./ConsigneGeneraleRelationsDroites";
import { Katex } from "./Katex";
import { RenduFragments } from "./RenduFragments";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { PiedAnalytique } from "./PiedAnalytique";
import { ILLISIBLE_ANALYTIQUE, cibleVecteurDirecteur, nombreOuNaN, nombresLisibles } from "../ui/retoursAnalytique";
import { EnTeteExercice } from "./EnTeteExercice";
import { normaliserSigneMoins } from "../../../lib/normaliserSaisie";

interface Props {
  exercice: ExerciceRelationsDroites;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseVecteur) => void;
  /** `true` pour l'écran "extraction2" (famille `reconnaissance`) : vecteur $\vec v$ de d₂ au lieu
   * du vecteur $\vec u$ de d (ou d₁). */
  seconde?: boolean;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

/**
 * Écran 1 (et écran "extraction2" de la famille `reconnaissance`, `seconde`) — extraction d'un
 * vecteur directeur d'une droite donnée (2 champs numériques, fraction « p/q » acceptée : la droite
 * y = 3/2·x + 1 donne naturellement (1 ; 3/2), audit chapitre 7, gen45 point 20). Vérifiée par
 * colinéarité avec le vecteur canonique, jamais un couple exact imposé — n'importe quel multiple
 * non nul convient. Un seul niveau d'aide.
 */
export function EtapeExtractionRelationsDroites({ exercice, tentativesUtilisees, tentativesMax, niveauAide, onActiverAide, onValider, validation, seconde = false }: Props) {
  const [x, setX] = useState("");
  const [y, setY] = useState("");
  const nom = seconde ? "v" : "u";

  const complet = [x, y].every((v) => v.trim() !== "");

  function construireReponse(): ReponseVecteur {
    return { x: nombreOuNaN(x), y: nombreOuNaN(y) };
  }

  const apresEchec = tentativesUtilisees > 0;
  const statut = apresEchec ? (seconde ? diagnostiquerExtraction2 : diagnostiquerExtraction)(exercice, construireReponse()) : undefined;
  const erronee = apresEchec && statut !== "correct";

  return (
    <div>
      <EnTeteExercice
        consigneGenerale={<ConsigneGeneraleRelationsDroites exercice={exercice} />}
        blocDonnees={
          <div className="equation-box">
            <Katex expression={formatEnonceLatex(exercice)} block />
            <Katex expression={formatDonneesRechercheeLatex(exercice)} block />
          </div>
        }
      />
      <p className="prompt-text">{seconde ? consigneExtraction2(exercice) : consigneExtraction(exercice)}</p>

      <div className="field-row">
        <div className="field field-inline">
          <label className="field-label field-label-minuscule" htmlFor={`relations-droites-extraction-${nom}-x`}>
            <Katex expression={`x_{\\vec{${nom}}}=`} />
          </label>
          <input
            id={`relations-droites-extraction-${nom}-x`}
            className={`text-input${erronee ? " is-erronee" : ""}`}
            placeholder={PLACEHOLDER_COMPOSANTE}
            value={x}
            onChange={(e) => setX(normaliserSigneMoins(e.target.value))}
          />
        </div>
        <div className="field field-inline">
          <label className="field-label field-label-minuscule" htmlFor={`relations-droites-extraction-${nom}-y`}>
            <Katex expression={`y_{\\vec{${nom}}}=`} />
          </label>
          <input
            id={`relations-droites-extraction-${nom}-y`}
            className={`text-input${erronee ? " is-erronee" : ""}`}
            placeholder={PLACEHOLDER_COMPOSANTE}
            value={y}
            onChange={(e) => setY(normaliserSigneMoins(e.target.value))}
          />
        </div>
      </div>

      {niveauAide > 0 && (
        <div className="triangle-quelconque-aide">
          <p>
            <RenduFragments fragments={seconde ? segmentsAideExtraction2Niveau1(exercice) : segmentsAideExtractionNiveau1(exercice)} />
          </p>
          {niveauAide >= 2 && (
            <p>
              <RenduFragments fragments={seconde ? segmentsAideExtraction2Niveau2(exercice) : segmentsAideExtractionNiveau2(exercice)} />
            </p>
          )}
        </div>
      )}
      {!validation && (
        <PiedAnalytique
          niveauAide={niveauAide}
          niveauAideMax={seconde ? NIVEAU_AIDE_MAX_EXTRACTION2 : NIVEAU_AIDE_MAX_EXTRACTION}
          onActiverAide={onActiverAide}
          complet={complet}
          reponse={() => construireReponse()}
          lisible={() => nombresLisibles(x, y)}
          onValider={onValider}
          texteIllisible={ILLISIBLE_ANALYTIQUE.composante}
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
          cible={(r) => cibleVecteurDirecteur(r, seconde ? exercice.droite2!.vecteur : exercice.vecteurReference)}
        />
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
