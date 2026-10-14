import { useState } from "react";
import type { ReglagesSession5e } from "./core5e/session5e.types";
import { CATALOGUE_FAMILLES, construireAvecFamilleId, genererExerciceComparaisonSuites } from "./generateurs5e/comparaisonSuites";
import type { FamilleComparaisonSuites } from "./core5e/comparaisonSuites.types";
import { SelecteurVarianteDev } from "./components5e/SelecteurVarianteDev";
import {
  NIVEAU_AIDE_MAX_COMPARAISON_SUITES,
  activerAideSuivante,
  demarrerSessionComparaisonSuites,
  soumettreReponseConclusion,
  soumettreReponseTableau,
} from "./moteur5e/sessionComparaisonSuites";
import type { EtatSessionComparaisonSuites, PhaseComparaisonSuites } from "./moteur5e/typesComparaisonSuites";
import {
  diagnostiquerCelluleTableau,
  diagnostiquerConclusion,
  diagnostiquerNSeuil,
  diagnostiquerTableau,
  diagnostiquerTraduction,
} from "./moteur5e/verificationComparaisonSuites";
import { EtapeConclusionComparaisonSuites } from "./components5e/EtapeConclusionComparaisonSuites";
import { EtapeTableauComparaisonSuites } from "./components5e/EtapeTableauComparaisonSuites";
import { CalculatriceScientifique } from "./components5e/CalculatriceScientifique";
import { formatConclusionNLatex, formatTraductionAttendueTexte } from "./ui5e/formatComparaisonSuites";
import { Katex } from "./components/Katex";
import { TableComparaisonRecap } from "./components5e/TableComparaisonRecap";
import type { EtatPuceProgression } from "../components/ProgressionPuces";
import { ProgressionPuces } from "../components/ProgressionPuces";

const REGLAGES_DEMO: ReglagesSession5e = { nombreExercices: 1, tentativesMax: 3, penaliteActivee: true };

function nouvelleSession(): EtatSessionComparaisonSuites {
  return demarrerSessionComparaisonSuites(REGLAGES_DEMO, genererExerciceComparaisonSuites);
}

interface TransitionEnAttente {
  etatSuivant: EtatSessionComparaisonSuites;
  revele: boolean;
}

/** Ordre d'affichage des puces de progression — séquence FIXE à 2 écrans (`phaseApres`,
 * `moteur5e/typesComparaisonSuites.ts`) : "tableau" puis "conclusion", identique pour les 3 familles. */
const ORDRE_PHASES: PhaseComparaisonSuites[] = ["tableau", "conclusion"];

/** Aucun booléen dédié `tableauRevele`/`conclusionRevele` ni `scoreTableauExercice` propre côté
 * session (seul `derniereEtapeRevelee`, qui se réécrit à chaque clôture de phase, et
 * `scoreTableauPartiel`, qui ne survit que jusqu'à la fin de l'exercice courant — voir
 * `sessionComparaisonSuites.ts`) : heuristique `score === 0 ⟺ révélée` (`soumettreEtapeTentatives`,
 * `moteur/etapeTentatives.ts` — score forcé à 0 exactement quand l'étape est révélée), même
 * convention que `AppMethodeRapide.tsx` (4e). "conclusion" (dernière phase) clôture toujours
 * l'exercice : jamais de champ de score qui lui survivrait une fois la phase quittée, donc toujours
 * "courante" ou "a-venir", jamais "revele"/"correcte" avant la fin. */
function calculerSegmentsProgression(etat: EtatSessionComparaisonSuites): EtatPuceProgression[] {
  return ORDRE_PHASES.map((phase) => {
    if (phase === etat.phase) return "courante";
    if (phase !== "tableau" || etat.scoreTableauPartiel === null) return "a-venir";
    return etat.scoreTableauPartiel === 0 ? "revele" : "correcte";
  });
}

export function App5gen18() {
  const [etat, setEtat] = useState<EtatSessionComparaisonSuites>(nouvelleSession);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);

  function terminerEtape(nouvelEtat: EtatSessionComparaisonSuites) {
    const transitionDEcran = nouvelEtat.phase !== etat.phase || nouvelEtat.terminee !== etat.terminee;
    if (transitionDEcran) {
      setEnAttente({ etatSuivant: nouvelEtat, revele: nouvelEtat.derniereEtapeRevelee });
      return;
    }
    setEtat(nouvelEtat);
  }

  function passerEcranSuivant() {
    if (!enAttente) return;
    setEtat(enAttente.etatSuivant.terminee ? nouvelleSession() : enAttente.etatSuivant);
    setEnAttente(null);
  }

  function forcerVariante(id: string) {
    setEnAttente(null);
    setEtat(demarrerSessionComparaisonSuites(REGLAGES_DEMO, () => construireAvecFamilleId(id as FamilleComparaisonSuites)));
  }

  const exercice = etat.exerciceCourant;
  const tentativesUtilisees = etat.etapeCourante.tentativesUtilisees;
  const tentativesMax = etat.reglages.tentativesMax;
  const cleEcran = `${etat.indexExercice}-${etat.phase}`;

  const validation = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue:
          etat.phase === "tableau" ? (
            <TableComparaisonRecap exercice={exercice} />
          ) : (
            <>
              <Katex expression={formatConclusionNLatex(exercice)} /> — {formatTraductionAttendueTexte(exercice)}
            </>
          ),
        labelSuivant: enAttente.etatSuivant.terminee ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
      }
    : null;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">5e — Entraînement</p>
        <h1 className="app-title">Comparaison numérique de deux suites</h1>
        <ProgressionPuces segments={calculerSegmentsProgression(etat)} />
      </header>
      <SelecteurVarianteDev options={CATALOGUE_FAMILLES} onGenerer={forcerVariante} />
      <main className="card">
        <div className="card-body">
          <>
              {etat.phase === "tableau" && (
                <EtapeTableauComparaisonSuites
                  key={cleEcran}
                  exercice={exercice}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={etat.niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX_COMPARAISON_SUITES}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(textes) => terminerEtape(soumettreReponseTableau(etat, textes))}
                  diagnostiquer={(textes) => diagnostiquerTableau(textes, exercice)}
                  diagnostiquerCellule={(index, texte) => diagnostiquerCelluleTableau(texte, index, exercice)}
                  validation={validation}
                />
              )}
              {etat.phase === "tableau" && <CalculatriceScientifique />}

              {etat.phase === "conclusion" && (
                <EtapeConclusionComparaisonSuites
                  key={cleEcran}
                  exercice={exercice}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={etat.niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX_COMPARAISON_SUITES}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(reponse) => terminerEtape(soumettreReponseConclusion(etat, reponse))}
                  diagnostiquer={(reponse) => diagnostiquerConclusion(reponse, exercice)}
                  diagnostiquerNSeuil={(texte) => diagnostiquerNSeuil(texte, exercice)}
                  diagnostiquerTraduction={(texte) => diagnostiquerTraduction(texte, exercice)}
                  validation={validation}
                />
              )}
            </>
        </div>
      </main>
    </div>
  );
}
