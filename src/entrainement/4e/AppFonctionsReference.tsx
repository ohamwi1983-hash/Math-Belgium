import { useState } from "react";
import type { ExerciceFonctionReference, ReglagesFamillesFonctionReference } from "./core/fonctionsReference.types";
import type { ReglagesSession } from "./core/session.types";
import { activerAide, demarrerSessionFonctionReference, soumettreChoixFamille, soumettreReponse } from "./moteur/sessionFonctionsReference";
import type { EtatSessionFonctionReference, ResultatExerciceFonctionReference } from "./moteur/typesFonctionsReference";
import { CATALOGUE_VARIANTES, construireAvecFamille, creerGenerateurFonctionReference } from "./generateurs/fonctionsReference";
import type { FamilleReference } from "./core/fonctionsReference.types";
import { calculerRecapitulatifFonctionReference } from "./ui/recapitulatifFonctionsReference";
import { SelecteurVarianteDev } from "./components/SelecteurVarianteDev";
import { EtapeReglagesFonctionsReference } from "./components/EtapeReglagesFonctionsReference";
import { EtapeReconnaissanceFonction } from "./components/EtapeReconnaissanceFonction";
import { EtapeFonctionsReferenceExercice } from "./components/EtapeFonctionsReferenceExercice";
import { ResultatPanelFonctionsReference } from "./components/ResultatPanelFonctionsReference";
import { ResumeSessionFonctionsReference } from "./components/ResumeSessionFonctionsReference";

const NOMBRE_EXERCICES_ALEATOIRE = 5;

const REGLAGES_BASE = {
  tentativesMax: 3,
  penaliteActivee: true,
  affichageReponseApresEchec: true,
  affichageExplication: true,
} as const;

/**
 * Démarre (ou redémarre) une session à partir du réglage de sélection des familles
 * (`prompt-reglage-nombre-par-famille.md`) — `nombreExercices` se déduit de la somme des
 * quantités en mode "personnalisé" (aucun réglage séparé), reste la constante historique en mode
 * "aléatoire".
 */
function demarrer(reglagesFamilles: ReglagesFamillesFonctionReference): EtatSessionFonctionReference {
  const nombreExercices =
    reglagesFamilles.mode === "aleatoire"
      ? NOMBRE_EXERCICES_ALEATOIRE
      : Object.values(reglagesFamilles.quantites).reduce((total: number, quantite: number) => total + quantite, 0);
  const reglagesSession: ReglagesSession = { ...REGLAGES_BASE, nombreExercices };
  return demarrerSessionFonctionReference(reglagesSession, creerGenerateurFonctionReference(reglagesFamilles));
}

interface Bilan {
  resultat: ResultatExerciceFonctionReference;
  exercice: ExerciceFonctionReference;
}

export function AppFonctionsReference() {
  const [reglagesFamilles, setReglagesFamilles] = useState<ReglagesFamillesFonctionReference | null>(null);
  const [etat, setEtat] = useState<EtatSessionFonctionReference | null>(null);
  const [dernierBilan, setDernierBilan] = useState<Bilan | null>(null);

  function commencerSession(reglages: ReglagesFamillesFonctionReference) {
    setReglagesFamilles(reglages);
    setEtat(demarrer(reglages));
  }

  function recommencer() {
    if (reglagesFamilles) setEtat(demarrer(reglagesFamilles));
  }

  function onGenererDev(familleId: string) {
    setDernierBilan(null);
    const reglagesSession: ReglagesSession = { ...REGLAGES_BASE, nombreExercices: NOMBRE_EXERCICES_ALEATOIRE };
    setEtat(demarrerSessionFonctionReference(reglagesSession, () => construireAvecFamille(familleId as FamilleReference)));
  }

  function terminerEtape(
    etatCourant: EtatSessionFonctionReference,
    exerciceTermine: ExerciceFonctionReference,
    nouvelEtat: EtatSessionFonctionReference,
  ) {
    if (nouvelEtat.resultats.length > etatCourant.resultats.length) {
      setDernierBilan({ resultat: nouvelEtat.resultats[nouvelEtat.resultats.length - 1], exercice: exerciceTermine });
    }
    setEtat(nouvelEtat);
  }

  if (!etat) {
    return (
      <div className="app-shell">
        <header className="app-header">
          <p className="app-eyebrow">4e — Entraînement</p>
          <h1 className="app-title">Transformations graphiques — fonctions de référence</h1>
          <p className="app-subtitle">Chapitre 2</p>
          <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={onGenererDev} />
        </header>
        <main className="card">
          <div className="card-body">
            <EtapeReglagesFonctionsReference onCommencer={commencerSession} />
          </div>
        </main>
      </div>
    );
  }

  const enCoursDeSession = !etat.terminee && !dernierBilan;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">4e — Entraînement</p>
        <h1 className="app-title">Transformations graphiques — fonctions de référence</h1>
        <p className="app-subtitle">Chapitre 2</p>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={onGenererDev} />
      </header>

      <main className="card">
        {enCoursDeSession && (
          <div className="card-progress">
            <div className="card-progress-row">
              <span className="card-progress-step">
                Exercice {etat.indexExercice + 1} / {etat.reglages.nombreExercices}
              </span>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${(etat.indexExercice / etat.reglages.nombreExercices) * 100}%` }} />
            </div>
          </div>
        )}
        <div className="card-body">
          {dernierBilan ? (
            <ResultatPanelFonctionsReference
              resultat={dernierBilan.resultat}
              exercice={dernierBilan.exercice}
              afficherReponseApresEchec={etat.reglages.affichageReponseApresEchec}
              labelBouton={etat.terminee ? "Voir le résumé" : "Exercice suivant"}
              onContinuer={() => setDernierBilan(null)}
            />
          ) : etat.terminee ? (
            <ResumeSessionFonctionsReference resultats={etat.resultats} onRecommencer={recommencer} />
          ) : etat.phase === "reconnaissance" ? (
            <EtapeReconnaissanceFonction
              exercice={etat.exerciceCourant}
              tentativesUtilisees={etat.etapeReconnaissance.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              onChoisir={(choix) => setEtat(soumettreChoixFamille(etat, choix))}
            />
          ) : (
            <EtapeFonctionsReferenceExercice
              exercice={etat.exerciceCourant}
              recapitulatif={calculerRecapitulatifFonctionReference(etat)}
              tentativesEquation={etat.etapeEquation.tentativesUtilisees}
              tentativesCurseurs={etat.etapeCurseurs.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              equationFermee={etat.etapeEquation.terminee}
              curseursFermee={etat.etapeCurseurs.terminee}
              aideActivee={etat.aideUtilisee}
              onActiverAide={() => setEtat(activerAide(etat))}
              onValider={(reponse) => {
                const exerciceTermine = etat.exerciceCourant;
                terminerEtape(etat, exerciceTermine, soumettreReponse(etat, reponse));
              }}
            />
          )}
        </div>
      </main>
    </div>
  );
}
