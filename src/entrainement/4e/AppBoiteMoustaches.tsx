import { useState } from "react";
import type { ReglagesSession } from "./core/session.types";
import {
  activerAideSuivante,
  demarrerSessionBoiteMoustaches,
  soumettreReponseComparaisonDispersions,
  soumettreReponseComparaisonMedianes,
  soumettreReponseConstruction,
  soumettreReponseLecture,
} from "./moteur/sessionBoiteMoustaches";
import type { EtatSessionBoiteMoustaches, PhaseBoiteMoustaches } from "./moteur/typesBoiteMoustaches";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceBoiteMoustaches } from "./generateurs/boiteMoustaches";
import type { VarianteBoiteMoustaches } from "./core/boiteMoustaches.types";
import { SelecteurVarianteDev } from "./components/SelecteurVarianteDev";
import { EtapeConstruction } from "./components/EtapeConstruction";
import { EtapeLecture } from "./components/EtapeLecture";
import { EtapeComparaisonMedianes } from "./components/EtapeComparaisonMedianes";
import { EtapeComparaisonDispersions } from "./components/EtapeComparaisonDispersions";
import { BoiteMoustachesGraph } from "./components/BoiteMoustachesGraph";
import { Katex } from "./components/Katex";
import { SegmentsInline } from "./components/SegmentsInline";
import {
  formatEnonceTexte,
  formatTermesCinqNombresLatex,
  segmentsComparaisonDispersionsAttendue,
  segmentsComparaisonMedianesAttendue,
} from "./ui/formatBoiteMoustaches";
import { EnTeteExercice } from "./components/EnTeteExercice";

const REGLAGES_DEMO: ReglagesSession = {
  nombreExercices: 1,
  tentativesMax: 3,
  penaliteActivee: true,
  affichageReponseApresEchec: true,
  affichageExplication: true,
};

function nouvelleSession(): EtatSessionBoiteMoustaches {
  return demarrerSessionBoiteMoustaches(REGLAGES_DEMO, genererExerciceBoiteMoustaches);
}

const LIBELLE_PHASE: Record<PhaseBoiteMoustaches, string> = {
  construction: "Construction",
  lecture: "Lecture",
  comparaisonMedianes: "Comparaison — médianes",
  comparaisonDispersions: "Comparaison — dispersions",
};

/** État tenu en attente dès qu'un écran se termine (bonne réponse, ou tentatives épuisées) — l'état
 * de session calculé par le moteur n'est appliqué (`setEtat`) qu'au clic sur le bouton de
 * `ValidationEcran`, jamais immédiatement (convention CLAUDE.md, "validation/invalidation avant de
 * passer à l'écran suivant"). */
interface TransitionEnAttente {
  etatSuivant: EtatSessionBoiteMoustaches;
  revele: boolean;
}

export function AppBoiteMoustaches() {
  const [etat, setEtat] = useState<EtatSessionBoiteMoustaches>(nouvelleSession);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);

  function terminerEtape(nouvelEtat: EtatSessionBoiteMoustaches) {
    const transitionDEcran = nouvelEtat.phase !== etat.phase || nouvelEtat.terminee !== etat.terminee;
    if (transitionDEcran) {
      const revele =
        etat.phase === "comparaisonMedianes"
          ? nouvelEtat.comparaisonMedianesRevele
          : etat.phase === "comparaisonDispersions"
            ? nouvelEtat.resultats[nouvelEtat.resultats.length - 1]!.comparaisonDispersionsRevele
            : nouvelEtat.resultats[nouvelEtat.resultats.length - 1]!.revele;
      setEnAttente({ etatSuivant: nouvelEtat, revele });
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
    setEtat(demarrerSessionBoiteMoustaches(REGLAGES_DEMO, () => construireAvecVarianteId(id as VarianteBoiteMoustaches)));
  }

  const exercice = etat.exerciceCourant;

  function calculerReponseAttendue() {
    if (!etat.reglages.affichageReponseApresEchec) return undefined;
    if (exercice.variante === "construction" || exercice.variante === "lecture") {
      return (
        <span className="equation-box-termes">
          {formatTermesCinqNombresLatex(exercice.valeurs).map((terme, i) => (
            <Katex key={i} expression={terme} />
          ))}
        </span>
      );
    }
    if (etat.phase === "comparaisonMedianes") {
      return <SegmentsInline segments={segmentsComparaisonMedianesAttendue(exercice)} />;
    }
    return <SegmentsInline segments={segmentsComparaisonDispersionsAttendue(exercice)} />;
  }

  const reponseAttendue = enAttente ? calculerReponseAttendue() : undefined;

  const validation = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue,
        labelSuivant: enAttente.etatSuivant.terminee ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
      }
    : null;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">4e — Entraînement</p>
        <h1 className="app-title">Boîte à moustaches</h1>
        <p className="app-subtitle">Chapitre 5</p>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={forcerVariante} />
      </header>

      <main className="card">
        <div className="card-progress">
          <div className="card-progress-row">
            <span className="card-progress-phase">{LIBELLE_PHASE[etat.phase]}</span>
          </div>
        </div>

        <div className="card-body">
          <EnTeteExercice
            consigneGenerale={formatEnonceTexte(exercice)}
            blocDonnees={
              exercice.variante === "comparaison" ? (
                <BoiteMoustachesGraph
                  bornePlage={exercice.bornePlage}
                  lignes={[
                    { valeurs: exercice.serieA, label: "A" },
                    { valeurs: exercice.serieB, label: "B" },
                  ]}
                />
              ) : null
            }
          />
          {exercice.variante === "construction" ? (
            <EtapeConstruction
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAide}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(reponse) => terminerEtape(soumettreReponseConstruction(etat, reponse))}
              validation={validation}
            />
          ) : exercice.variante === "lecture" ? (
            <EtapeLecture
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAide}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(reponse) => terminerEtape(soumettreReponseLecture(etat, reponse))}
              validation={validation}
            />
          ) : etat.phase === "comparaisonMedianes" ? (
            <EtapeComparaisonMedianes
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAide}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(choix) => terminerEtape(soumettreReponseComparaisonMedianes(etat, choix))}
              validation={validation}
            />
          ) : (
            <EtapeComparaisonDispersions
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAide}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(choix) => terminerEtape(soumettreReponseComparaisonDispersions(etat, choix))}
              validation={validation}
            />
          )}
        </div>
      </main>
    </div>
  );
}
