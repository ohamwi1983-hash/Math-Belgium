import { useState } from "react";
import type { EnsembleReelGuide } from "../core6e/ensembleReel.types";
import type { ExerciceInjectiviteFonctions } from "../core6e/injectiviteFonctions.types";
import type { CoteBranche } from "../moteur6e/typesInjectiviteFonctions";
import type { ReponseBijection } from "../moteur6e/verificationInjectiviteFonctions";
import { diagnostiquerBijection } from "../moteur6e/verificationInjectiviteFonctions";
import { CONSIGNE_ECRAN_BIJECTION, CONSIGNE_GENERALE, TEXTE_AIDE_BIJECTION_NIVEAU1, formatFLatexAffichage, lignesEtatActuelApresImage } from "../ui6e/formatInjectiviteFonctions";
import { Katex } from "../components/Katex";
import { BoutonAide } from "./BoutonAide";
import { DoubleComboboxIntervalle } from "./DoubleComboboxIntervalle";
import { EtatActuelPanel } from "./EtatActuelPanel";

interface Props {
  exercice: ExerciceInjectiviteFonctions;
  /** Intervalle d'injectivité retenu (écran 2) — pour le bloc "état actuel" ACCUMULÉ (correctif
   * transversal, voir `ui6e/formatInjectiviteFonctions.ts::lignesEtatActuelApresImage`), jamais
   * recalculé ici. `exercice.image` (écran 4) est déjà disponible directement sur `exercice`. */
  intervalleConfirme: EnsembleReelGuide;
  /** Branche mémorisée par la Couche B (écran "injective") — pour reformer la réciproque
   * CONFIRMÉE à l'écran 3 dans le bloc "état actuel" (voir
   * `ui6e/formatInjectiviteFonctions.ts::lignesEtatActuelApresImage`), jamais recalculée depuis la
   * saisie brute de l'élève. */
  coteChoisi: CoteBranche;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseBijection) => void;
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
export function EtapeBijectionInjectiviteFonctions({ exercice, intervalleConfirme, coteChoisi, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider }: Props) {
  const [x, setX] = useState<EnsembleReelGuide | null>(null);
  const [y, setY] = useState<EnsembleReelGuide | null>(null);
  const [derniereReponse, setDerniereReponse] = useState<ReponseBijection | null>(null);

  const complet = x !== null && y !== null;
  const montrerErreurs = tentativesUtilisees > 0 && derniereReponse !== null;
  const statut = montrerErreurs ? diagnostiquerBijection(exercice, derniereReponse as ReponseBijection) : null;
  const lignesEtatActuel = lignesEtatActuelApresImage(exercice, intervalleConfirme, coteChoisi);

  function valider() {
    if (x === null || y === null) return;
    const reponse: ReponseBijection = { x, y };
    setDerniereReponse(reponse);
    onValider(reponse);
  }

  return (
    <div>
      <p className="prompt-text">{CONSIGNE_GENERALE}</p>
      <div className="equation-box">
        <Katex expression={formatFLatexAffichage(exercice)} />
      </div>
      {lignesEtatActuel.map((ligne) => (
        <EtatActuelPanel key={ligne.label} label={ligne.label} latex={ligne.latex} />
      ))}
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

      <BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />
      <button type="button" className="btn btn-primary" disabled={!complet} onClick={valider}>
        Valider
      </button>

      {montrerErreurs && !statut?.global && (
        <p className="alert-error" role="alert">
          Incorrect — tentative {tentativesUtilisees}/{tentativesMax}, réessaie.
        </p>
      )}

      {niveauAide >= 1 && (
        <div className="aide-5e">
          <p>{TEXTE_AIDE_BIJECTION_NIVEAU1}</p>
        </div>
      )}
    </div>
  );
}
