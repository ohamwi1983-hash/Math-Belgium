import { useState } from "react";
import type { ReglagesSession } from "./core/session.types";
import {
  activerAideSuivante,
  demarrerSessionComparaisonSeries,
  soumettreReponseCentrage,
  soumettreReponseDispersion,
  soumettreReponseInterpretation,
  soumettreReponseSeuil,
} from "./moteur/sessionComparaisonSeries";
import type { EtatSessionComparaisonSeries } from "./moteur/typesComparaisonSeries";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceComparaisonSeries } from "./generateurs/comparaisonSeries";
import type { VarianteComparaisonSeries } from "./core/comparaisonSeries.types";
import { SelecteurVarianteDev } from "./components/SelecteurVarianteDev";
import { EtapeCentrageComparaison } from "./components/EtapeCentrageComparaison";
import { EtapeDispersionComparaison } from "./components/EtapeDispersionComparaison";
import { EtapeInterpretationComparaison } from "./components/EtapeInterpretationComparaison";
import { EtapeSeuilComparaison } from "./components/EtapeSeuilComparaison";
import { SegmentsInline } from "./components/SegmentsInline";
import { formatEnonceTexte, segmentsReponseAttendue } from "./ui/formatComparaisonSeries";
import { EnTeteExercice } from "./components/EnTeteExercice";
import { DonneesComparaisonSeries } from "./components/DonneesComparaisonSeries";

const REGLAGES_DEMO: ReglagesSession = {
  nombreExercices: 1,
  tentativesMax: 3,
  affichageReponseApresEchec: true,
  affichageExplication: true,
};

function nouvelleSession(): EtatSessionComparaisonSeries {
  return demarrerSessionComparaisonSeries(REGLAGES_DEMO, genererExerciceComparaisonSeries);
}

/** État tenu en attente dès qu'un écran se termine (bonne réponse, ou tentatives épuisées) — l'état
 * de session calculé par le moteur n'est appliqué (`setEtat`) qu'au clic sur le bouton de
 * `ValidationEcran`. */
interface TransitionEnAttente {
  etatSuivant: EtatSessionComparaisonSeries;
  revele: boolean;
}

/** Pas de `Phase` (comme "Quel angle ?"/"Transformations graphiques") : un seul écran par
 * exercice, dont la FORME dépend de `exercice.question.type` (4 possibles) — voir
 * `sessionComparaisonSeries.ts`. Mono-écran : la transition n'est jamais qu'une clôture
 * d'exercice (`terminee` passe à `true`, `nombreExercices` vaut 1). */
export function AppComparaisonSeries() {
  const [etat, setEtat] = useState<EtatSessionComparaisonSeries>(nouvelleSession);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);

  function terminerEtape(nouvelEtat: EtatSessionComparaisonSeries) {
    const transitionDEcran = nouvelEtat.terminee !== etat.terminee;
    if (transitionDEcran) {
      const resultat = nouvelEtat.resultats[nouvelEtat.resultats.length - 1];
      setEnAttente({ etatSuivant: nouvelEtat, revele: resultat.revele });
      return;
    }
    setEtat(nouvelEtat);
  }

  function passerEcranSuivant() {
    if (!enAttente) return;
    setEtat(enAttente.etatSuivant.terminee ? nouvelleSession() : enAttente.etatSuivant);
    setEnAttente(null);
  }

  const exercice = etat.exerciceCourant;
  const question = exercice.question;

  function onGenererDev(varianteId: string) {
    setEnAttente(null);
    setEtat(demarrerSessionComparaisonSeries(REGLAGES_DEMO, () => construireAvecVarianteId(varianteId as VarianteComparaisonSeries)));
  }

  const validation = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue: <SegmentsInline segments={segmentsReponseAttendue(exercice)} />,
        labelSuivant: enAttente.etatSuivant.terminee ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
      }
    : null;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">4e — Entraînement</p>
        <h1 className="app-title">Comparaison de deux séries statistiques</h1>
        <p className="app-subtitle">Chapitre 4</p>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={onGenererDev} />
      </header>

      <main className="card">

        <div className="card-body">
          <EnTeteExercice consigneGenerale={formatEnonceTexte(exercice)} blocDonnees={<DonneesComparaisonSeries exercice={exercice} />} />
          {question.type === "centrage" ? (
            <EtapeCentrageComparaison
              exercice={exercice}
              question={question}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAide}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(choix) => terminerEtape(soumettreReponseCentrage(etat, choix))}
              validation={validation}
            />
          ) : question.type === "dispersion" ? (
            <EtapeDispersionComparaison
              exercice={exercice}
              question={question}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAide}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(reponse) => terminerEtape(soumettreReponseDispersion(etat, reponse))}
              validation={validation}
            />
          ) : question.type === "seuil" ? (
            <EtapeSeuilComparaison
              exercice={exercice}
              question={question}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAide}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(texte) => terminerEtape(soumettreReponseSeuil(etat, texte))}
              validation={validation}
            />
          ) : (
            <EtapeInterpretationComparaison
              exercice={exercice}
              question={question}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAide}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(choix) => terminerEtape(soumettreReponseInterpretation(etat, choix))}
              validation={validation}
            />
          )}{" "}
        </div>
      </main>
    </div>
  );
}
