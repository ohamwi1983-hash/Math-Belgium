import { useState } from "react";
import type { ReactNode } from "react";
import type { ReglagesSession5e } from "./core5e/session5e.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceVitessePosition } from "./generateurs5e/vitessePosition/index";
import { SelecteurVarianteDev } from "./components5e/SelecteurVarianteDev";
import {
  activerAideSuivante,
  demarrerSessionVitessePosition,
  niveauAideMaxVitessePosition,
  soumettreReponseConversion,
  soumettreReponseDerivee,
  soumettreReponseEvaluerV0,
  soumettreReponseResoudre,
  soumettreReponseSegmentConstant,
  soumettreReponseTempsTotal,
  soumettreReponseVitessePointe,
} from "./moteur5e/sessionVitessePosition";
import type { EcranVitessePosition, EtatSessionVitessePosition } from "./moteur5e/typesVitessePosition";
import { ordreEcransVitessePosition } from "./moteur5e/typesVitessePosition";
import {
  diagnostiquerConversionKmh,
  diagnostiquerDeriveeVitesse,
  diagnostiquerEvaluerV0,
  diagnostiquerRacineChamp,
  diagnostiquerSegmentConstant,
  diagnostiquerTempsTotal,
  diagnostiquerVitessePointe,
} from "./moteur5e/verificationVitessePosition";
import { EtapeChampVitessePosition } from "./components5e/EtapeChampVitessePosition";
import { EtapeResoudreVitessePosition } from "./components5e/EtapeResoudreVitessePosition";
import {
  formatReponseAttenduePhaseLatex,
  formatTermesDonneesLatex,
  phraseEnonce,
  questionFinale,
  segmentsEnonce,
} from "./ui5e/formatVitessePosition";
import { calculerRecapitulatifVitessePosition } from "./ui5e/recapitulatifVitessePosition";
import { RecapitulatifPanel } from "./components5e/RecapitulatifPanel";
import { EnTeteExercice } from "./components5e/EnTeteExercice";
import { SegmentsInline } from "./components/SegmentsInline";
import { QuestionFinale } from "./components/QuestionFinale";
import type { EtatPuceProgression } from "../components/ProgressionPuces";
import { ProgressionPuces } from "../components/ProgressionPuces";
import type { EntreeHistoriqueEtape } from "../components/FicheReponseEcran";
import { FicheReponseEcran } from "../components/FicheReponseEcran";
import { Katex } from "./components/Katex";
import type { ValidationEtapeProps } from "../components/ValidationEcran";
import type { ReponseResoudre } from "./moteur5e/verificationVitessePosition";

const REGLAGES_DEMO: ReglagesSession5e = { nombreExercices: 1, tentativesMax: 3, penaliteActivee: true };

function nouvelleSession(): EtatSessionVitessePosition {
  return demarrerSessionVitessePosition(REGLAGES_DEMO, genererExerciceVitessePosition);
}

/** État tenu en attente dès qu'un écran se termine — l'état de session calculé par le moteur n'est
 * appliqué (`setEtat`) qu'au clic sur le bouton de `ValidationEcran` (convention CLAUDE.md). */
interface TransitionEnAttente {
  etatSuivant: EtatSessionVitessePosition;
  revele: boolean;
}

/** Même source que `calculerRecapitulatifVitessePosition` (`etat.revelesPartiels[ecran]`, jamais
 * `scoresPartiels[ecran] === 0` — point A, balayage générique) — `ordreEcransVitessePosition(exercice)`
 * donne la séquence RÉELLE (5 écrans pour la variante "A", 6 pour "B", fixée dès le tirage). */
function calculerSegmentsProgression(
  etat: EtatSessionVitessePosition,
  aideUtiliseeParPhase: Partial<Record<string, boolean>>,
): EtatPuceProgression[] {
  return ordreEcransVitessePosition(etat.exerciceCourant).map((ecran) => {
    if (ecran === etat.phase) return "courante";
    const score = etat.scoresPartiels[ecran];
    if (score === undefined) return "a-venir";
    if (etat.revelesPartiels[ecran]) return "revele";
    return aideUtiliseeParPhase[ecran] ? "aide" : "correcte";
  });
}

/** Format court de la réponse de l'élève à l'écran "resoudre" — mêmes données que
 * `ReponseResoudre` (2 racines + justification du rejet d'une des deux). */
function formatReponseResoudreTexte(exercice: EtatSessionVitessePosition["exerciceCourant"], r: ReponseResoudre): string {
  const justification = r.justificationIndex !== null ? exercice.optionsRejetRacine[r.justificationIndex].texte : "?";
  return `racines : ${r.racines[0]} ; ${r.racines[1]} — justification : ${justification}`;
}

export function App5gen35() {
  const [etat, setEtat] = useState<EtatSessionVitessePosition>(nouvelleSession);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  /** Consultation en lecture seule des écrans déjà clos (puces cliquables de `ProgressionPuces`) —
   * tenu ICI, à part de `EtatSessionVitessePosition`, jamais dans le moteur (même principe que
   * `AppAnalyseFonction.tsx`, 4e). Remis à vide à chaque nouvel exercice. */
  const [historique, setHistorique] = useState<EntreeHistoriqueEtape[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);
  const [aideUtiliseeParPhase, setAideUtiliseeParPhase] = useState<Partial<Record<string, boolean>>>({});

  /** Réutilise `calculerRecapitulatifVitessePosition` (même mécanisme que `RecapitulatifPanel`)
   * pour la réponse ATTENDUE : l'entrée qui vient d'être ajoutée est toujours la dernière du
   * tableau, les écrans se closent dans l'ordre (`ordreEcransVitessePosition`). */
  function ajouterHistorique(votreReponse: ReactNode, nouvelEtat: EtatSessionVitessePosition) {
    const recap = calculerRecapitulatifVitessePosition(nouvelEtat);
    const derniere = recap[recap.length - 1];
    if (!derniere) return;
    setHistorique((h) => [
      ...h,
      {
        titre: derniere.libelle,
        votreReponse,
        correcte: !derniere.revele,
        reponseAttendue: derniere.revele ? <Katex expression={derniere.valeur} /> : undefined,
      },
    ]);
  }

  /** `votreReponse` : UNIQUEMENT poussée dans l'historique quand l'écran se clôt RÉELLEMENT (même
   * garde `transitionDEcran` que celui qui déclenche déjà `setEnAttente`), et JAMAIS pour le
   * DERNIER écran de l'exercice — ici variable selon la variante ("conversion" pour "A",
   * "tempsTotal" pour "B", voir `ordreEcransVitessePosition`), donc détecté dynamiquement via
   * `nouvelEtat.resultats.length > etat.resultats.length` plutôt que par le nom d'un écran fixe. */
  function terminerEtape(nouvelEtat: EtatSessionVitessePosition, votreReponse?: ReactNode) {
    const transitionDEcran = nouvelEtat.phase !== etat.phase || nouvelEtat.terminee !== etat.terminee;
    if (transitionDEcran) {
      setAideUtiliseeParPhase((m) => ({ ...m, [etat.phase]: etat.niveauAide > 0 }));
      const exerciceTermine = nouvelEtat.resultats.length > etat.resultats.length;
      if (!exerciceTermine && votreReponse !== undefined) {
        ajouterHistorique(votreReponse, nouvelEtat);
      }
      setEnAttente({ etatSuivant: nouvelEtat, revele: nouvelEtat.derniereEtapeRevelee });
      return;
    }
    setEtat(nouvelEtat);
  }

  function passerEcranSuivant() {
    if (!enAttente) return;
    if (enAttente.etatSuivant.terminee) {
      setEtat(nouvelleSession());
      setHistorique([]);
      setAideUtiliseeParPhase({});
      setFicheOuverteIndex(null);
    } else {
      setEtat(enAttente.etatSuivant);
    }
    setEnAttente(null);
  }

  function forcerVariante(id: string) {
    setEnAttente(null);
    setHistorique([]);
    setAideUtiliseeParPhase({});
    setFicheOuverteIndex(null);
    setEtat(demarrerSessionVitessePosition(REGLAGES_DEMO, () => construireAvecVarianteId(id)));
  }

  const exercice = etat.exerciceCourant;
  const tentativesUtilisees = etat.etapeCourante.tentativesUtilisees;
  const tentativesMax = etat.reglages.tentativesMax;
  const cleEcran = `${etat.indexExercice}-${etat.phase}`;

  const validation = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue: (
          <span className="equation-box-termes">
            {formatReponseAttenduePhaseLatex(exercice, etat.phase).map((frag, i) => (
              <Katex key={i} expression={frag} />
            ))}
          </span>
        ),
        labelSuivant: enAttente.etatSuivant.terminee ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
      }
    : null;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">5e — Entraînement</p>
        <h1 className="app-title">Vitesse et position</h1>
        <ProgressionPuces
          segments={calculerSegmentsProgression(etat, aideUtiliseeParPhase)}
          onSegmentClick={(index) => setFicheOuverteIndex(index)}
        />
      </header>
      <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={forcerVariante} />
      <main className="card">
        <div className="card-body">
          <EnTeteExercice
            consigneGenerale={<SegmentsInline segments={segmentsEnonce(phraseEnonce(exercice))} />}
            blocDonnees={
              <>
                <div className="equation-box equation-box-donnees">
                  {formatTermesDonneesLatex(exercice).map((frag, i) => (
                    <Katex key={i} expression={frag} />
                  ))}
                </div>
                <QuestionFinale question={questionFinale(exercice)} />
              </>
            }
          />
          <RecapitulatifPanel entrees={calculerRecapitulatifVitessePosition(etat)} />
          <EcranCourant
            exercice={exercice}
            phase={etat.phase}
            etat={etat}
            tentativesUtilisees={tentativesUtilisees}
            tentativesMax={tentativesMax}
            cleEcran={cleEcran}
            terminerEtape={terminerEtape}
            setEtat={setEtat}
            validation={validation}
          />
        </div>
      </main>

      {ficheOuverteIndex !== null && historique[ficheOuverteIndex] && (
        <FicheReponseEcran entree={historique[ficheOuverteIndex]} onFermer={() => setFicheOuverteIndex(null)} />
      )}
    </div>
  );
}

interface EcranProps {
  exercice: EtatSessionVitessePosition["exerciceCourant"];
  phase: EcranVitessePosition;
  etat: EtatSessionVitessePosition;
  tentativesUtilisees: number;
  tentativesMax: number;
  cleEcran: string;
  terminerEtape: (nouvelEtat: EtatSessionVitessePosition, votreReponse?: ReactNode) => void;
  setEtat: (etat: EtatSessionVitessePosition) => void;
  validation: ValidationEtapeProps | null;
}

function EcranCourant({ exercice, phase, etat, tentativesUtilisees, tentativesMax, cleEcran, terminerEtape, setEtat, validation }: EcranProps) {
  const niveauAideMax = niveauAideMaxVitessePosition();
  const onActiverAide = () => setEtat(activerAideSuivante(etat));

  switch (phase) {
    case "derivee":
      return (
        <EtapeChampVitessePosition
          key={cleEcran}
          exercice={exercice}
          ecran="derivee"
          labelChamp="v(t)="
          placeholder="ex : 2*t+3"
          avecCalculatrice={false}
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
          niveauAide={etat.niveauAide}
          niveauAideMax={niveauAideMax}
          onActiverAide={onActiverAide}
          onValider={(texte) => terminerEtape(soumettreReponseDerivee(etat, texte), `v(t) = ${texte}`)}
          diagnostiquer={(t) => diagnostiquerDeriveeVitesse(t, exercice)}
          validation={validation}
        />
      );

    case "evaluerV0":
      return (
        <EtapeChampVitessePosition
          key={cleEcran}
          exercice={exercice}
          ecran="evaluerV0"
          labelChamp="v(t₀)="
          placeholder="ex : 7"
          avecCalculatrice={true}
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
          niveauAide={etat.niveauAide}
          niveauAideMax={niveauAideMax}
          onActiverAide={onActiverAide}
          onValider={(texte) => terminerEtape(soumettreReponseEvaluerV0(etat, texte), `v(t₀) = ${texte}`)}
          diagnostiquer={(t) => diagnostiquerEvaluerV0(t, exercice)}
          validation={validation}
        />
      );

    case "resoudre":
      return (
        <EtapeResoudreVitessePosition
          key={cleEcran}
          exercice={exercice}
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
          niveauAide={etat.niveauAide}
          niveauAideMax={niveauAideMax}
          onActiverAide={onActiverAide}
          onValider={(reponse) => terminerEtape(soumettreReponseResoudre(etat, reponse), formatReponseResoudreTexte(exercice, reponse))}
          diagnostiquerRacine={(t) => diagnostiquerRacineChamp(t, exercice)}
          validation={validation}
        />
      );

    case "vitessePointe":
      return (
        <EtapeChampVitessePosition
          key={cleEcran}
          exercice={exercice}
          ecran="vitessePointe"
          labelChamp="v="
          placeholder="ex : 13"
          avecCalculatrice={true}
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
          niveauAide={etat.niveauAide}
          niveauAideMax={niveauAideMax}
          onActiverAide={onActiverAide}
          onValider={(texte) => terminerEtape(soumettreReponseVitessePointe(etat, texte), `v = ${texte}`)}
          diagnostiquer={(t) => diagnostiquerVitessePointe(t, exercice)}
          validation={validation}
        />
      );

    case "conversion":
      return (
        <EtapeChampVitessePosition
          key={cleEcran}
          exercice={exercice}
          ecran="conversion"
          labelChamp="v (km/h) ="
          placeholder="ex : 46.8"
          avecCalculatrice={true}
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
          niveauAide={etat.niveauAide}
          niveauAideMax={niveauAideMax}
          onActiverAide={onActiverAide}
          onValider={(texte) => terminerEtape(soumettreReponseConversion(etat, texte), `v (km/h) = ${texte}`)}
          diagnostiquer={(t) => diagnostiquerConversionKmh(t, exercice)}
          validation={validation}
        />
      );

    case "segmentConstant":
      return (
        <EtapeChampVitessePosition
          key={cleEcran}
          exercice={exercice}
          ecran="segmentConstant"
          labelChamp="t₂ ="
          placeholder="ex : 7.33"
          avecCalculatrice={true}
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
          niveauAide={etat.niveauAide}
          niveauAideMax={niveauAideMax}
          onActiverAide={onActiverAide}
          onValider={(texte) => terminerEtape(soumettreReponseSegmentConstant(etat, texte), `t₂ = ${texte}`)}
          diagnostiquer={(t) => diagnostiquerSegmentConstant(t, exercice)}
          validation={validation}
        />
      );

    case "tempsTotal":
      return (
        <EtapeChampVitessePosition
          key={cleEcran}
          exercice={exercice}
          ecran="tempsTotal"
          labelChamp="t total ="
          placeholder="ex : 11.33"
          avecCalculatrice={true}
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
          niveauAide={etat.niveauAide}
          niveauAideMax={niveauAideMax}
          onActiverAide={onActiverAide}
          onValider={(texte) => terminerEtape(soumettreReponseTempsTotal(etat, texte), `t total = ${texte}`)}
          diagnostiquer={(t) => diagnostiquerTempsTotal(t, exercice)}
          validation={validation}
        />
      );
  }
}
