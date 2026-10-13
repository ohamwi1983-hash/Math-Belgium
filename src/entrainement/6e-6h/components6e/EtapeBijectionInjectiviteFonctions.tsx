import { useState } from "react";
import type { EnsembleReelGuide } from "../core6e/ensembleReel.types";
import type { ExerciceInjectiviteFonctions } from "../core6e/injectiviteFonctions.types";
import type { ReponseBijection } from "../moteur6e/verificationInjectiviteFonctions";
import { diagnostiquerBijection } from "../moteur6e/verificationInjectiviteFonctions";
import { CONSIGNE_ECRAN_BIJECTION, CONSIGNE_GENERALE, TEXTE_AIDE_BIJECTION_NIVEAU1, formatFLatexAffichage } from "../ui6e/formatInjectiviteFonctions";
import { Katex } from "../components/Katex";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { BoutonAide } from "./BoutonAide";
import { DoubleComboboxIntervalle } from "./DoubleComboboxIntervalle";
import { EnTeteExercice } from "./EnTeteExercice";

interface Props {
  exercice: ExerciceInjectiviteFonctions;
  estPremierEcran: boolean;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseBijection) => void;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

/**
 * Écran 5 — bijection, phrase répartie sur 2 lignes ("La fonction f est bijective" / "sur X dans
 * Y") avec 2 comboboxes indépendantes (`DoubleComboboxIntervalle`, INCHANGÉ — seul le texte
 * environnant se met désormais en page sur 2 lignes distinctes, complément ciblé, voir
 * historique-6e.md). Le clic sur une option ne fait QUE la sélectionner (via le `<select>` natif) —
 * seul le clic sur "Valider" déclenche `onValider` (checklist transversale : bouton Valider présent
 * sur TOUS les écrans, y compris les écrans à choix). Un seul palier d'aide sur cet écran (complément
 * ciblé — voir `moteur6e/sessionInjectiviteFonctions.ts::NIVEAU_AIDE_MAX`).
 */
export function EtapeBijectionInjectiviteFonctions({ exercice, estPremierEcran, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, validation}: Props) {
  const [x, setX] = useState<EnsembleReelGuide | null>(null);
  const [y, setY] = useState<EnsembleReelGuide | null>(null);
  const [derniereReponse, setDerniereReponse] = useState<ReponseBijection | null>(null);

  const complet = x !== null && y !== null;
  const montrerErreurs = tentativesUtilisees > 0 && derniereReponse !== null;
  const statut = montrerErreurs ? diagnostiquerBijection(exercice, derniereReponse as ReponseBijection) : null;

  function valider() {
    if (x === null || y === null) return;
    const reponse: ReponseBijection = { x, y };
    setDerniereReponse(reponse);
    onValider(reponse);
  }

  return (
    <div>
      <EnTeteExercice
        estPremierEcran={estPremierEcran}
        consigneGenerale={CONSIGNE_GENERALE}
        blocDonnees={
          <div className="equation-box">
            <Katex expression={formatFLatexAffichage(exercice)} />
          </div>
        }
      />
      <p className="prompt-text">{CONSIGNE_ECRAN_BIJECTION}</p>
      <p className="prompt-text">La fonction f est bijective</p>

      <DoubleComboboxIntervalle
        labelX="sur"
        labelY="dans"
        optionsX={exercice.optionsX}
        optionsY={exercice.optionsY}
        valeurX={x}
        valeurY={y}
        onChangeX={setX}
        onChangeY={setY}
        erroneeX={statut !== null && !statut.xCorrect}
        erroneeY={statut !== null && !statut.yCorrect}
      />

      {!validation && (
        <>
        <BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />
        <button type="button" className="btn btn-primary" disabled={!complet} onClick={valider}>
          Valider
        </button>

        {montrerErreurs && !statut?.global && (
          <p className="alert-error" role="alert">
            Incorrect — tentative {tentativesUtilisees}/{tentativesMax}, réessaie.
          </p>
        )}
        </>
      )}
      {validation && <ValidationEcran {...validation} />}

      {niveauAide >= 1 && (
        <div className="aide-5e">
          <p>{TEXTE_AIDE_BIJECTION_NIVEAU1}</p>
        </div>
      )}
    </div>
  );
}
