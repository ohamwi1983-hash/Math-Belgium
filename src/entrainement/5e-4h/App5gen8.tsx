import { useState } from "react";
import type { ReactNode } from "react";
import type { ReglagesSession5e } from "./core5e/session5e.types";
import { CATALOGUE_FORMES, construireAvecFormeId, genererExerciceParametresSinusoide } from "./generateurs5e/parametresSinusoide";
import type { FormeAffichageSinusoide } from "./core5e/parametresSinusoide.types";
import { SelecteurVarianteDev } from "./components5e/SelecteurVarianteDev";
import {
  NIVEAU_AIDE_MAX_SINUSOIDE,
  activerAideSuivante,
  demarrerSessionParametresSinusoide,
  soumettreReponseParametresSinusoide,
} from "./moteur5e/sessionParametresSinusoide";
import type { EtatSessionParametresSinusoide } from "./moteur5e/typesParametresSinusoide";
import { ORDRE_PHASES_SINUSOIDE } from "./moteur5e/typesParametresSinusoide";
import { EtapeParametreSinusoide } from "./components5e/EtapeParametreSinusoide";
import { formatChampParametreLatex, labelPhase } from "./ui5e/formatParametresSinusoide";
import { Katex } from "./components/Katex";
import type { PhaseParametresSinusoide } from "./moteur5e/typesParametresSinusoide";
import { diagnostiquerPhaseParametresSinusoide } from "./moteur5e/verificationParametresSinusoide";
import { genererAvecCode, lireCodeDepuisUrl } from "../export/codeExercice";
import { calculerRecapitulatifParametresSinusoide } from "./ui5e/recapitulatifParametresSinusoide";
import { RecapitulatifPanel } from "./components5e/RecapitulatifPanel";
import type { EtatPuceProgression } from "../components/ProgressionPuces";
import { ProgressionPuces } from "../components/ProgressionPuces";
import type { EntreeHistoriqueEtape } from "../components/FicheReponseEcran";
import { FicheReponseEcran } from "../components/FicheReponseEcran";

const REGLAGES_DEMO: ReglagesSession5e = { nombreExercices: 1, tentativesMax: 3 };

function nouvelleSession(): EtatSessionParametresSinusoide {
  return demarrerSessionParametresSinusoide(REGLAGES_DEMO, genererExerciceParametresSinusoide);
}

/** Première session : si l'URL porte un code d'exercice (QR code d'une feuille, `?code=`), rouvre
 * EXACTEMENT l'exercice imprimé — mêmes fonctions de tirage que l'adaptateur d'export ; ensuite,
 * tirages libres. */
function sessionInitiale(): EtatSessionParametresSinusoide {
  const code = lireCodeDepuisUrl();
  if (!code) return nouvelleSession();
  const premier = genererAvecCode(code, CATALOGUE_FORMES, genererExerciceParametresSinusoide, (id) => construireAvecFormeId(id as FormeAffichageSinusoide));
  return demarrerSessionParametresSinusoide(REGLAGES_DEMO, () => premier);
}

/** Score "partiel" (déjà clos) de `phase`, `null` si pas encore close — "decalage" (7e et dernière
 * phase de `ORDRE_PHASES_SINUSOIDE`) n'a pas de champ `scoreDecalagePartiel` dédié à la racine de
 * l'état (toujours la phase COURANTE tant que l'exercice est en cours, jamais "déjà close" —
 * voir `moteur5e/typesParametresSinusoide.ts`). */
function scorePartielDeLaPhase(etat: EtatSessionParametresSinusoide, phase: PhaseParametresSinusoide): number | null {
  switch (phase) {
    case "amplitude":
      return etat.scoreAmplitudePartiel;
    case "pulsation":
      return etat.scorePulsationPartiel;
    case "dephasage":
      return etat.scoreDephasagePartiel;
    case "phi":
      return etat.scorePhiPartiel;
    case "periode":
      return etat.scorePeriodePartiel;
    case "frequence":
      return etat.scoreFrequencePartiel;
    case "decalage":
      return null;
  }
}

/** Même source que `calculerRecapitulatifParametresSinusoide`
 * (`ui5e/recapitulatifParametresSinusoide.ts`) — "decalage" n'a pas de champ `xxxRevele` dédié,
 * même raison que `scorePartielDeLaPhase` ci-dessus (toujours la phase courante tant que
 * l'exercice n'est pas terminé). */
function reveleDeLaPhase(etat: EtatSessionParametresSinusoide, phase: PhaseParametresSinusoide): boolean {
  switch (phase) {
    case "amplitude":
      return etat.amplitudeRevele;
    case "pulsation":
      return etat.pulsationRevele;
    case "dephasage":
      return etat.dephasageRevele;
    case "phi":
      return etat.phiRevele;
    case "periode":
      return etat.periodeRevele;
    case "frequence":
      return etat.frequenceRevele;
    case "decalage":
      return false;
  }
}

function calculerSegmentsProgression(
  etat: EtatSessionParametresSinusoide,
  aideUtiliseeParPhase: Partial<Record<string, boolean>>,
): EtatPuceProgression[] {
  return ORDRE_PHASES_SINUSOIDE.map((phase) => {
    if (phase === etat.phase) return "courante";
    const score = scorePartielDeLaPhase(etat, phase);
    if (score === null) return "a-venir";
    if (reveleDeLaPhase(etat, phase)) return "revele";
    return aideUtiliseeParPhase[phase] ? "aide" : "correcte";
  });
}

/** État tenu en attente dès qu'un écran se termine — l'état de session calculé par le moteur n'est
 * appliqué (`setEtat`) qu'au clic sur le bouton de `ValidationEcran` (convention CLAUDE.md). */
interface TransitionEnAttente {
  etatSuivant: EtatSessionParametresSinusoide;
  revele: boolean;
}

export function App5gen8() {
  const [etat, setEtat] = useState<EtatSessionParametresSinusoide>(sessionInitiale);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  /** Consultation en lecture seule des phases déjà closes (puces cliquables de `ProgressionPuces`) —
   * tenu ICI, à part de `EtatSessionParametresSinusoide`, jamais dans le moteur. Remis à vide à
   * chaque nouvel exercice. */
  const [historique, setHistorique] = useState<EntreeHistoriqueEtape[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);
  const [aideUtiliseeParPhase, setAideUtiliseeParPhase] = useState<Partial<Record<string, boolean>>>({});

  /** Réutilise `calculerRecapitulatifParametresSinusoide` pour la réponse ATTENDUE : la phase qui
   * vient de se clore est toujours la DERNIÈRE entrée du tableau. */
  function ajouterHistorique(votreReponse: ReactNode, nouvelEtat: EtatSessionParametresSinusoide) {
    const recap = calculerRecapitulatifParametresSinusoide(nouvelEtat);
    const derniere = recap[recap.length - 1];
    if (!derniere) return;
    setHistorique((h) => [
      ...h,
      { titre: derniere.libelle, votreReponse, correcte: !derniere.revele, reponseAttendue: derniere.revele ? <Katex expression={derniere.valeur} /> : undefined },
    ]);
  }

  /** `votreReponse` : UNIQUEMENT poussée dans l'historique quand la phase se clôt RÉELLEMENT (même
   * garde `transitionDEcran` que celui qui déclenche déjà `setEnAttente`), et JAMAIS pour
   * "decalage" (5e et dernière phase, jamais "close" au sens de `calculerRecapitulatifParametresSinusoide`
   * non plus, voir sa tête de fichier) — détectée dynamiquement via
   * `nouvelEtat.resultats.length > etat.resultats.length`. */
  function terminerEtape(nouvelEtat: EtatSessionParametresSinusoide, votreReponse?: ReactNode) {
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
    setEtat(demarrerSessionParametresSinusoide(REGLAGES_DEMO, () => construireAvecFormeId(id as FormeAffichageSinusoide)));
  }

  const exercice = etat.exerciceCourant;
  const tentativesUtilisees = etat.etapeCourante.tentativesUtilisees;
  const tentativesMax = etat.reglages.tentativesMax;

  const validation = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue: <Katex expression={formatChampParametreLatex(exercice, etat.phase)} />,
        labelSuivant: enAttente.etatSuivant.terminee ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
      }
    : null;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">5e — Entraînement</p>
        <h1 className="app-title">Paramètres d'une fonction sinusoïdale</h1>
        <p className="app-subtitle">Chapitre 2 — Trigonométrie</p>
        <ProgressionPuces
          segments={calculerSegmentsProgression(etat, aideUtiliseeParPhase)}
          onSegmentClick={(index) => setFicheOuverteIndex(index)}
        />
      </header>
      <SelecteurVarianteDev options={CATALOGUE_FORMES} onGenerer={forcerVariante} />
      <main className="card">
        <div className="card-body">
          <RecapitulatifPanel entrees={calculerRecapitulatifParametresSinusoide(etat)} />
          <EtapeParametreSinusoide
            key={etat.phase}
            exercice={exercice}
            phase={etat.phase}
            tentativesUtilisees={tentativesUtilisees}
            tentativesMax={tentativesMax}
            niveauAide={etat.niveauAide}
            niveauAideMax={NIVEAU_AIDE_MAX_SINUSOIDE}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(texte) => terminerEtape(soumettreReponseParametresSinusoide(etat, texte), `${labelPhase(etat.phase)} ${texte}`)}
            diagnostiquer={(texte) => diagnostiquerPhaseParametresSinusoide(exercice, etat.phase, texte)}
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
