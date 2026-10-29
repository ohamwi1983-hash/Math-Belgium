import { useState, type ReactNode } from "react";
import type { ReglagesSession } from "./core/session.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceLieuxGeometriques } from "./generateurs/lieuxGeometriques";
import type { VarianteLieuxGeometriquesId } from "./generateurs/lieuxGeometriques";
import { SelecteurVarianteDev } from "./components/SelecteurVarianteDev";
import {
  activerAideSuivante,
  demarrerSessionLieuxGeometriques,
  soumettreReponseEquations,
  soumettreReponseIdentification,
  soumettreReponseResolution,
} from "./moteur/sessionLieuxGeometriques";
import type { EtatSessionLieuxGeometriques, PhaseLieuxGeometriques } from "./moteur/typesLieuxGeometriques";
import { EtapeEquationsLieuxGeometriques } from "./components/EtapeEquationsLieuxGeometriques";
import { EtapeIdentificationLieuxGeometriques } from "./components/EtapeIdentificationLieuxGeometriques";
import { EtapeResolutionLieuxGeometriques } from "./components/EtapeResolutionLieuxGeometriques";
import { Katex } from "./components/Katex";
import { RenduFragments } from "./components/RenduFragments";
import { EnTeteExercice } from "./components/EnTeteExercice";
import { RecapitulatifPanel } from "./components/RecapitulatifPanel";
import type { ExerciceLieuxGeometriques } from "./core/lieuxGeometriques.types";
import type { ReponseIdentification } from "./moteur/verificationLieuxGeometriques";
import {
  formatEquationsAttenduesLatex,
  formatReponseIdentificationLatex,
  segmentsDescriptionLieu,
  segmentsEnonce,
  texteNombrePointsAttendu,
  texteReponseResolutionAttendue,
} from "./ui/formatLieuxGeometriques";
import { calculerRecapitulatifLieuxGeometriques } from "./ui/recapitulatifLieuxGeometriques";
import type { EtatPuceProgression } from "../components/ProgressionPuces";
import { ProgressionPuces } from "../components/ProgressionPuces";
import { FicheReponseEcran } from "../components/FicheReponseEcran";
import type { EntreeHistoriqueEtape } from "../components/FicheReponseEcran";

const CONSIGNE_GENERALE = "Détermine l'intersection de ces lieux géométriques.";

const REGLAGES_DEMO: ReglagesSession = {
  nombreExercices: 1,
  tentativesMax: 3,
  affichageReponseApresEchec: true,
  affichageExplication: true,
};

function nouvelleSession(): EtatSessionLieuxGeometriques {
  return demarrerSessionLieuxGeometriques(REGLAGES_DEMO, genererExerciceLieuxGeometriques);
}

/** 3 phases fixes (voir `PhaseLieuxGeometriques`). "resolution" (dernière phase) n'a jamais besoin
 * de sa propre branche "close" : un nouvel exercice redémarre toujours juste après, donc elle reste
 * "a-venir" jusqu'à devenir "courante" — jamais consultée comme passée. Puces cliquables : chaque
 * écran clos ouvre sa fiche de consultation (`FicheReponseEcran`, même patron qu'`AppNormeDistance`). */
const ORDRE_PHASES: PhaseLieuxGeometriques[] = ["identification", "equations", "resolution"];

function calculerSegmentsProgression(etat: EtatSessionLieuxGeometriques): EtatPuceProgression[] {
  const indexCourant = ORDRE_PHASES.indexOf(etat.phase);
  return ORDRE_PHASES.map((phase, index) => {
    if (index === indexCourant) return "courante";
    if (index > indexCourant) return "a-venir";
    const revele = phase === "identification" ? etat.identificationRevele : etat.equationsRevele;
    if (revele) return "revele";
    const niveauAide = phase === "identification" ? etat.niveauAideIdentification : etat.niveauAideEquations;
    return niveauAide > 0 ? "aide" : "correcte";
  });
}

const TITRES_ECRANS: Record<PhaseLieuxGeometriques, string> = {
  identification: "Identification des lieux",
  equations: "Équations",
  resolution: "Points d'intersection",
};

/** Réponse attendue de l'écran `phase` — VALEUR seule : `ValidationEcran` et `FicheReponseEcran`
 * affichent déjà eux-mêmes le libellé « Réponse attendue » (jamais « Équations attendues : » en
 * double, audit chapitre 7, point 5). */
function construireReponseAttendue(exercice: ExerciceLieuxGeometriques, phase: PhaseLieuxGeometriques): ReactNode {
  if (phase === "identification") {
    return (
      <>
        <p>
          <RenduFragments fragments={segmentsDescriptionLieu(exercice.lieu1)} />
        </p>
        <p>
          <RenduFragments fragments={segmentsDescriptionLieu(exercice.lieu2)} />
        </p>
      </>
    );
  }
  if (phase === "equations") return <Katex expression={formatEquationsAttenduesLatex(exercice)} block />;
  return (
    <>
      <p>{texteNombrePointsAttendu(exercice.nombrePoints)}</p>
      {exercice.nombrePoints > 0 && <Katex expression={texteReponseResolutionAttendue(exercice)} block />}
    </>
  );
}

function reponseIdentificationSaisie(reponse: ReponseIdentification): ReactNode {
  return (
    <>
      <p>
        <Katex expression={formatReponseIdentificationLatex(reponse.lieu1)} />
      </p>
      <p>
        <Katex expression={formatReponseIdentificationLatex(reponse.lieu2)} />
      </p>
    </>
  );
}

function saisieBrute(texte: string): ReactNode {
  return texte.trim() === "" ? "—" : texte;
}

/** État tenu en attente dès qu'un écran se termine (bonne réponse, ou tentatives épuisées) — l'état
 * de session calculé par le moteur n'est appliqué (`setEtat`) qu'au clic sur le bouton de
 * `ValidationEcran`, jamais immédiatement (convention CLAUDE.md, "validation/invalidation avant de
 * passer à l'écran suivant"). */
interface TransitionEnAttente {
  etatSuivant: EtatSessionLieuxGeometriques;
  revele: boolean;
}

export function AppLieuxGeometriques() {
  const [etat, setEtat] = useState<EtatSessionLieuxGeometriques>(nouvelleSession);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  /** Consultation en lecture seule des écrans clos (puces cliquables) — tenue ici, jamais dans le
   * moteur ; un écran clos = une entrée, dans l'ordre de `ORDRE_PHASES` (même index que sa puce). */
  const [historique, setHistorique] = useState<EntreeHistoriqueEtape[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);
  /** Incrémenté à chaque nouvel exercice : entre dans la `key` des écrans pour qu'aucune saisie de
   * l'exercice précédent ne survive à « Générer » ou à « Nouvel exercice » (audit chapitre 7,
   * point 2 : deux exercices successifs partagent la même première phase). */
  const [numeroExercice, setNumeroExercice] = useState(0);

  function terminerEtape(nouvelEtat: EtatSessionLieuxGeometriques, votreReponse: ReactNode) {
    const transitionDEcran = nouvelEtat.phase !== etat.phase || nouvelEtat.terminee !== etat.terminee;
    if (transitionDEcran) {
      const revele =
        etat.phase === "identification"
          ? nouvelEtat.identificationRevele
          : etat.phase === "equations"
            ? nouvelEtat.equationsRevele
            : nouvelEtat.resultats[nouvelEtat.resultats.length - 1]!.resolutionRevele;
      setEnAttente({ etatSuivant: nouvelEtat, revele });
      setHistorique((h) => [
        ...h,
        { titre: TITRES_ECRANS[etat.phase], votreReponse, correcte: !revele, reponseAttendue: construireReponseAttendue(etat.exerciceCourant, etat.phase) },
      ]);
      return;
    }
    setEtat(nouvelEtat);
  }

  function reinitialiserHistorique() {
    setHistorique([]);
    setFicheOuverteIndex(null);
    setNumeroExercice((n) => n + 1);
  }

  function passerEcranSuivant() {
    if (!enAttente) return;
    if (enAttente.etatSuivant.terminee) reinitialiserHistorique();
    setEtat(enAttente.etatSuivant.terminee ? nouvelleSession() : enAttente.etatSuivant);
    setEnAttente(null);
  }

  function onGenererDev(varianteId: string) {
    setEnAttente(null);
    reinitialiserHistorique();
    setEtat(demarrerSessionLieuxGeometriques(REGLAGES_DEMO, () => construireAvecVarianteId(varianteId as VarianteLieuxGeometriquesId)));
  }

  const exercice = etat.exerciceCourant;
  const phase = etat.phase;

  const validation = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue: construireReponseAttendue(exercice, phase),
        labelSuivant: enAttente.etatSuivant.terminee ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
      }
    : null;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">4e — Entraînement</p>
        <h1 className="app-title">Lieux géométriques : intersection</h1>
        <p className="app-subtitle">Chapitre 7 — Géométrie analytique plane</p>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={onGenererDev} />
        <ProgressionPuces segments={calculerSegmentsProgression(etat)} onSegmentClick={(index) => setFicheOuverteIndex(index)} />
      </header>

      <main className="card">
        <div className="card-body">
        <EnTeteExercice
          consigneGenerale={CONSIGNE_GENERALE}
          blocDonnees={
            <div className="equation-box">
              <p>
                <RenduFragments fragments={segmentsEnonce(exercice)} />
              </p>
            </div>
          }
        />
        <RecapitulatifPanel entrees={calculerRecapitulatifLieuxGeometriques(etat)} />
        {phase === "identification" ? (
          <EtapeIdentificationLieuxGeometriques
            key={`${numeroExercice}-${phase}`}
            exercice={exercice}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAideIdentification}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(reponse) => terminerEtape(soumettreReponseIdentification(etat, reponse), reponseIdentificationSaisie(reponse))}
            validation={validation}
          />
        ) : phase === "equations" ? (
          <EtapeEquationsLieuxGeometriques
            key={`${numeroExercice}-${phase}`}
            exercice={exercice}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAideEquations}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(reponse) =>
              terminerEtape(
                soumettreReponseEquations(etat, reponse),
                <>
                  <p>{saisieBrute(reponse.texteLieu1)}</p>
                  <p>{saisieBrute(reponse.texteLieu2)}</p>
                </>,
              )
            }
            validation={validation}
          />
        ) : (
          <EtapeResolutionLieuxGeometriques
            key={`${numeroExercice}-${phase}`}
            exercice={exercice}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAideResolution}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(reponse) => terminerEtape(soumettreReponseResolution(etat, reponse), null)}
            validation={validation}
          />
        )}
        </div>
      </main>
      {ficheOuverteIndex !== null && historique[ficheOuverteIndex] && (
        <FicheReponseEcran entree={historique[ficheOuverteIndex]} onFermer={() => setFicheOuverteIndex(null)} />
      )}
    </div>
  );
}
