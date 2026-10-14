import { useState } from "react";
import type { ReglagesSession } from "./core/session.types";
import {
  activerAideSuivante,
  demarrerSessionMediane,
  soumettreReponseLectureMediane,
  soumettreReponseLectureQ1,
  soumettreReponseLectureQ3,
  soumettreReponseMediane,
  soumettreReponseMinMaxMode,
  soumettreReponsePolygone,
  soumettreReponseQ1,
  soumettreReponseQ3,
  soumettreReponseSynthese,
} from "./moteur/sessionMediane";
import type { EtatSessionMediane, PhaseMediane } from "./moteur/typesMediane";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceMediane } from "./generateurs/mediane";
import type { VarianteMediane } from "./core/mediane.types";
import { SelecteurVarianteDev } from "./components/SelecteurVarianteDev";
import { EtapeMedianeDiscrete } from "./components/EtapeMedianeDiscrete";
import { EtapeQ1Mediane } from "./components/EtapeQ1Mediane";
import { EtapeQ3Mediane } from "./components/EtapeQ3Mediane";
import { EtapeMinMaxModeMediane } from "./components/EtapeMinMaxModeMediane";
import { EtapePolygoneMediane } from "./components/EtapePolygoneMediane";
import { EtapeLectureMediane } from "./components/EtapeLectureMediane";
import { EtapeSyntheseMediane } from "./components/EtapeSyntheseMediane";
import { Katex } from "./components/Katex";
import { EnTeteExercice } from "./components/EnTeteExercice";
import { TableEffectifsDiscrete } from "./components/TableEffectifsDiscrete";
import { TableEffectifsClasses } from "./components/TableEffectifsClasses";
import {
  LABEL_X_MAX,
  LABEL_X_MIN,
  formatEnonceTexte,
  formatLectureAttendueTexte,
  formatMedianeAttendueTexte,
  formatMinMaxModeAttendueTexte,
  formatPolygoneAttenduTexte,
  formatQ1AttendueTexte,
  formatQ3AttendueTexte,
  formatSyntheseAttendueTexte,
  surlignageSeuilTable,
} from "./ui/formatMediane";

const REGLAGES_DEMO: ReglagesSession = {
  nombreExercices: 1,
  tentativesMax: 3,
  penaliteActivee: true,
  affichageReponseApresEchec: true,
  affichageExplication: true,
};

function nouvelleSession(): EtatSessionMediane {
  return demarrerSessionMediane(REGLAGES_DEMO, genererExerciceMediane);
}

const LIBELLE_PHASE: Record<PhaseMediane, string> = {
  mediane: "Médiane",
  q1: "Premier quartile",
  q3: "Troisième quartile",
  minMaxMode: "Min, max et mode(s)",
  polygone: "Polygone des effectifs cumulés",
  lectureQ1: "Lecture — Q1",
  lectureMediane: "Lecture — médiane",
  lectureQ3: "Lecture — Q3",
  synthese: "Synthèse",
};

/** État tenu en attente dès qu'un écran se termine (bonne réponse, ou tentatives épuisées) — l'état
 * de session calculé par le moteur n'est appliqué (`setEtat`) qu'au clic sur le bouton de
 * `ValidationEcran`, jamais immédiatement (convention CLAUDE.md, "validation/invalidation avant de
 * passer à l'écran suivant"). */
interface TransitionEnAttente {
  etatSuivant: EtatSessionMediane;
  revele: boolean;
}

export function AppMediane() {
  const [etat, setEtat] = useState<EtatSessionMediane>(nouvelleSession);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);

  function terminerEtape(nouvelEtat: EtatSessionMediane) {
    const transitionDEcran = nouvelEtat.phase !== etat.phase || nouvelEtat.terminee !== etat.terminee;
    if (transitionDEcran) {
      const dernierResultat = () => nouvelEtat.resultats[nouvelEtat.resultats.length - 1]!;
      const revele =
        etat.phase === "mediane"
          ? nouvelEtat.medianeRevele
          : etat.phase === "q1"
            ? nouvelEtat.q1Revele
            : etat.phase === "q3"
              ? nouvelEtat.q3Revele
              : etat.phase === "polygone"
                ? nouvelEtat.polygoneRevele
                : etat.phase === "lectureMediane"
                  ? nouvelEtat.lectureMedianeRevele
                  : etat.phase === "lectureQ1"
                    ? nouvelEtat.lectureQ1Revele
                    : etat.phase === "lectureQ3"
                      ? nouvelEtat.lectureQ3Revele
                      : etat.phase === "minMaxMode"
                        ? dernierResultat().minMaxModeRevele
                        : dernierResultat().syntheseRevele;
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

  const exercice = etat.exerciceCourant;
  const phase = etat.phase;

  /** Bloc de données centralisé (`EnTeteExercice`) — le tableau valeurs/effectifs(/classes) est
   * identique sur les écrans "mediane"/"q1"/"q3" (variante "discrete") et "polygone"/"synthese"
   * (variante "classes"), chacun gardant son propre surlignage (seuil/index de sa propre
   * question). "minMaxMode" (tableau sans colonne cumulée, sans surlignage) et "lectureQ1"/
   * "lectureMediane"/"lectureQ3" (graphe, pas de tableau) restent hors de cette centralisation. */
  const surlignageDiscrete =
    exercice.variante !== "discrete"
      ? null
      : phase === "mediane"
        ? (etat.niveauAideMediane >= 2 ? surlignageSeuilTable(exercice, exercice.seuil, exercice.indexMediane) : null)
        : phase === "q1"
          ? (etat.niveauAideQ1 >= 2 ? surlignageSeuilTable(exercice, exercice.seuilQ1, exercice.indexQ1) : null)
          : phase === "q3"
            ? (etat.niveauAideQ3 >= 2 ? surlignageSeuilTable(exercice, exercice.seuilQ3, exercice.indexQ3) : null)
            : null;

  const blocDonnees =
    exercice.variante === "discrete" && (phase === "mediane" || phase === "q1" || phase === "q3") ? (
      <TableEffectifsDiscrete exercice={exercice} surlignage={surlignageDiscrete} />
    ) : exercice.variante === "classes" && (phase === "polygone" || phase === "synthese") ? (
      <TableEffectifsClasses exercice={exercice} />
    ) : null;

  function onGenererDev(varianteId: string) {
    setEnAttente(null);
    setEtat(demarrerSessionMediane(REGLAGES_DEMO, () => construireAvecVarianteId(varianteId as VarianteMediane)));
  }

  const reponseAttendue =
    phase === "mediane" && exercice.variante === "discrete" ? (
      <>Réponse attendue : {formatMedianeAttendueTexte(exercice)}</>
    ) : phase === "q1" && exercice.variante === "discrete" ? (
      <>Q1 attendu : {formatQ1AttendueTexte(exercice)}</>
    ) : phase === "q3" && exercice.variante === "discrete" ? (
      <>Q3 attendu : {formatQ3AttendueTexte(exercice)}</>
    ) : phase === "minMaxMode" && exercice.variante === "discrete" ? (
      <>Min/max/mode(s) attendus : {formatMinMaxModeAttendueTexte(exercice)}</>
    ) : phase === "polygone" && exercice.variante === "classes" ? (
      <>Polygone attendu : {formatPolygoneAttenduTexte(exercice)}</>
    ) : phase === "lectureQ1" && exercice.variante === "classes" ? (
      <>Q1 attendu (lecture) : {formatLectureAttendueTexte(exercice, "q1")}</>
    ) : phase === "lectureMediane" && exercice.variante === "classes" ? (
      <>Médiane attendue (lecture) : {formatLectureAttendueTexte(exercice, "mediane")}</>
    ) : phase === "lectureQ3" && exercice.variante === "classes" ? (
      <>Q3 attendu (lecture) : {formatLectureAttendueTexte(exercice, "q3")}</>
    ) : exercice.variante === "classes" ? (
      <>
        Synthèse attendue : <Katex expression={LABEL_X_MIN} /> = {exercice.xMin}, <Katex expression={LABEL_X_MAX} /> = {exercice.xMax},{" "}
        {formatSyntheseAttendueTexte(exercice)}
      </>
    ) : null;

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
        <h1 className="app-title">Paramètres de position</h1>
        <p className="app-subtitle">Chapitre 5</p>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={onGenererDev} />
      </header>

      <main className="card">
        <div className="card-progress">
          <div className="card-progress-row">
            <span className="card-progress-phase">{LIBELLE_PHASE[phase]}</span>
          </div>
        </div>

        <div className="card-body">
          <EnTeteExercice consigneGenerale={formatEnonceTexte(exercice)} blocDonnees={blocDonnees} />
          {phase === "mediane" && exercice.variante === "discrete" ? (
            <EtapeMedianeDiscrete
              key={phase}
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAideMediane}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(reponse) => terminerEtape(soumettreReponseMediane(etat, reponse))}
              validation={validation}
            />
          ) : phase === "q1" && exercice.variante === "discrete" ? (
            <EtapeQ1Mediane
              key={phase}
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAideQ1}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(reponse) => terminerEtape(soumettreReponseQ1(etat, reponse))}
              validation={validation}
            />
          ) : phase === "q3" && exercice.variante === "discrete" ? (
            <EtapeQ3Mediane
              key={phase}
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAideQ3}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(reponse) => terminerEtape(soumettreReponseQ3(etat, reponse))}
              validation={validation}
            />
          ) : phase === "minMaxMode" && exercice.variante === "discrete" ? (
            <EtapeMinMaxModeMediane
              key={phase}
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAideMinMaxMode}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(reponse) => terminerEtape(soumettreReponseMinMaxMode(etat, reponse))}
              validation={validation}
            />
          ) : phase === "polygone" && exercice.variante === "classes" ? (
            <EtapePolygoneMediane
              key={phase}
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAidePolygone}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(points) => terminerEtape(soumettreReponsePolygone(etat, points))}
              validation={validation}
            />
          ) : /* Les 3 branches ci-dessous rendent le MÊME type de composant (`EtapeLectureMediane`) à
          la même position de l'arbre React — sans `key` distincte, React réutiliserait l'instance
          existante d'un écran à l'autre, reportant silencieusement l'état local (champ de réponse,
          position de la barre, zoom du graphe) d'un quartile au suivant. `key={parametre}` force un
          remontage complet à chaque transition (`promptgen33ajustements.md`, point 2 — même
          principe déjà établi par `EtapeTestSommetOrthogonalite`, keyée par sommet A/B/C). */
          phase === "lectureMediane" && exercice.variante === "classes" ? (
            <EtapeLectureMediane
              key="mediane"
              exercice={exercice}
              parametre="mediane"
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAideLectureMediane}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(texte) => terminerEtape(soumettreReponseLectureMediane(etat, texte))}
              validation={validation}
            />
          ) : phase === "lectureQ1" && exercice.variante === "classes" ? (
            <EtapeLectureMediane
              key="q1"
              exercice={exercice}
              parametre="q1"
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAideLectureQ1}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(texte) => terminerEtape(soumettreReponseLectureQ1(etat, texte))}
              validation={validation}
            />
          ) : phase === "lectureQ3" && exercice.variante === "classes" ? (
            <EtapeLectureMediane
              key="q3"
              exercice={exercice}
              parametre="q3"
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAideLectureQ3}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(texte) => terminerEtape(soumettreReponseLectureQ3(etat, texte))}
              validation={validation}
            />
          ) : phase === "synthese" && exercice.variante === "classes" ? (
            <EtapeSyntheseMediane
              key={phase}
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAideSynthese}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(reponse) => terminerEtape(soumettreReponseSynthese(etat, reponse))}
              validation={validation}
            />
          ) : null}{" "}
        </div>
      </main>
    </div>
  );
}
