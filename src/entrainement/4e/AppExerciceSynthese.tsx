import { useState } from "react";
import type { ReglagesSession } from "./core/session.types";
import {
  activerAideSuivante,
  demarrerSessionExerciceSynthese,
  soumettreReponseBoxplot,
  soumettreReponseBtIntervalle,
  soumettreReponseBtPourcent,
  soumettreReponseCentres,
  soumettreReponseLecture,
  soumettreReponseMediane,
  soumettreReponseMinMaxMode,
  soumettreReponsePolygone,
  soumettreReponseQ1,
  soumettreReponseQ3,
  soumettreReponseQuotient,
  soumettreReponseSommes,
  soumettreReponseSynthese,
  soumettreReponseTableau,
  soumettreReponseVarianceEcartType,
} from "./moteur/sessionExerciceSynthese";
import type { EtatSessionExerciceSynthese, PhaseExerciceSynthese } from "./moteur/typesExerciceSynthese";
import { SEQUENCES } from "./moteur/typesExerciceSynthese";
import {
  versBoiteMoustaches,
  versDispersion,
  versMedianeClasses,
  versMedianeDiscrete,
  versMoyennePondereeClasses,
  versMoyennePonderee,
} from "./moteur/verificationExerciceSynthese";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceSynthese } from "./generateurs/exerciceSynthese";
import type { ExerciceSynthese, VarianteExerciceSynthese } from "./core/exerciceSynthese.types";
import { SelecteurVarianteDev } from "./components/SelecteurVarianteDev";
import { CalculatriceScientifique } from "./components/CalculatriceScientifique";
import { EtapeCentresMoyennePonderee } from "./components/EtapeCentresMoyennePonderee";
import { EtapeSommesMoyennePonderee } from "./components/EtapeSommesMoyennePonderee";
import { EtapeQuotientMoyennePonderee } from "./components/EtapeQuotientMoyennePonderee";
import { EtapeMedianeDiscrete } from "./components/EtapeMedianeDiscrete";
import { EtapeQ1Mediane } from "./components/EtapeQ1Mediane";
import { EtapeQ3Mediane } from "./components/EtapeQ3Mediane";
import { EtapeMinMaxModeMediane } from "./components/EtapeMinMaxModeMediane";
import { EtapePolygoneMediane } from "./components/EtapePolygoneMediane";
import { EtapeLectureMediane } from "./components/EtapeLectureMediane";
import { EtapeSyntheseMediane } from "./components/EtapeSyntheseMediane";
import { EtapeConstruction } from "./components/EtapeConstruction";
import { EtapeTableauDispersion } from "./components/EtapeTableauDispersion";
import { EtapeVarianceEcartTypeDispersion } from "./components/EtapeVarianceEcartTypeDispersion";
import { EtapeBtIntervalle } from "./components/EtapeBtIntervalle";
import { EtapeBtPourcent } from "./components/EtapeBtPourcent";
import { Katex } from "./components/Katex";
import { formatEcartTypeAttendueTexte, formatTableauAttenduTexte, formatVarianceAttendueTexte } from "./ui/formatDispersion";
import { formatTermesCinqNombresLatex } from "./ui/formatBoiteMoustaches";
import {
  formatLectureAttendueTexte,
  formatMedianeAttendueTexte,
  formatMinMaxModeAttendueTexte,
  formatPolygoneAttenduTexte,
  formatQ1AttendueTexte,
  formatQ3AttendueTexte,
  formatSyntheseAttendueTexte,
  LABEL_X_MAX,
  LABEL_X_MIN,
  surlignageSeuilTable,
} from "./ui/formatMediane";
import { formatCentresAttendusTexte, formatSommesAttenduesTexte } from "./ui/formatMoyennePonderee";
import { formatBtIntervalleAttenduTexte, formatBtPourcentAttenduTexte, formatEnonceTexte } from "./ui/formatExerciceSynthese";
import { SegmentsInline } from "./components/SegmentsInline";
import { RecapitulatifPanel } from "./components/RecapitulatifPanel";
import { calculerRecapitulatifExerciceSynthese } from "./ui/recapitulatifExerciceSynthese";
import { EnTeteExercice } from "./components/EnTeteExercice";
import type { EtatPuceProgression } from "../components/ProgressionPuces";
import { ProgressionPuces } from "../components/ProgressionPuces";
import { TableEffectifsDiscrete } from "./components/TableEffectifsDiscrete";
import { TableEffectifsClasses } from "./components/TableEffectifsClasses";
import { pasCommun } from "./generateurs/bienaymeTchebychev/echelleContexte";
import { nombreFr } from "./ui/nombreFr";

const REGLAGES_DEMO: ReglagesSession = {
  nombreExercices: 1,
  tentativesMax: 3,
  affichageReponseApresEchec: true,
  affichageExplication: true,
};


function nouvelleSession(): EtatSessionExerciceSynthese {
  return demarrerSessionExerciceSynthese(REGLAGES_DEMO, genererExerciceSynthese);
}

/** Écrans nécessitant un calcul décimal non fourni par l'énoncé — moyenne pondérée (quotient),
 * variance/écart-type (racine carrée), et bornes de l'intervalle de Bienaymé-Tchebychev (arithmétique
 * décimale sur x̄/σ déjà confirmés) ; les autres écrans (centres, sommes, tableau, médiane/quartiles,
 * lecture graphique, boîte à moustaches, btPourcent — k fixé à 2, résultat toujours 75) restent exacts
 * ou fournis par l'énoncé. */
const PHASES_CALCULATRICE = new Set<PhaseExerciceSynthese>(["quotient", "varianceEcartType", "btIntervalle"]);

/** Segments de la barre de puces — réutilise `SEQUENCES[exercice.variante]` (même séquence réelle
 * que le moteur, jamais une deuxième reconstitution) et `etat.scoresAccumules[phase]` (écrans déjà
 * clos de CET exercice — `revele`/`niveauAide` déjà calculés par le moteur). "btPourcent" (dernière
 * phase des 2 séquences) n'a jamais besoin de sa propre branche "close" : jamais consultée comme
 * phase passée. Puces purement visuelles (pas de `onSegmentClick`). */
function calculerSegmentsProgression(etat: EtatSessionExerciceSynthese): EtatPuceProgression[] {
  const sequence = SEQUENCES[etat.exerciceCourant.variante];
  const indexCourant = sequence.indexOf(etat.phase);
  return sequence.map((phase, index) => {
    if (index === indexCourant) return "courante";
    if (index > indexCourant) return "a-venir";
    const ecran = etat.scoresAccumules[phase]!;
    if (ecran.revele) return "revele";
    return ecran.niveauAide > 0 ? "aide" : "correcte";
  });
}

/** Réponse attendue à afficher dans `ValidationEcran` pour la phase QUI VIENT DE SE TERMINER —
 * reprend tel quel le contenu de chaque bloc `answer-reveal` de l'ancien `ResultatPanelExerciceSynthese.tsx`
 * (seules les gardes `afficherReponseApresEchec`/`resultat.scoreXxx === 0`/`exercice.variante === ...`
 * disparaissent : `ValidationEcran` n'affiche déjà `reponseAttendue` que si `revele`, et la phase en
 * cours détermine déjà sans ambiguïté la variante de l'exercice). */
function reponseAttenduePhase(phase: PhaseExerciceSynthese, exercice: ExerciceSynthese) {
  switch (phase) {
    case "centres": {
      if (exercice.variante !== "classes") return null;
      return <>Centres attendus : {formatCentresAttendusTexte(versMoyennePondereeClasses(exercice))}</>;
    }
    case "sommes":
      return (
        <>
          Sommes attendues : <SegmentsInline segments={formatSommesAttenduesTexte(versMoyennePonderee(exercice))} />
        </>
      );
    case "quotient":
      return <>Moyenne pondérée attendue : {nombreFr(exercice.xBar)}</>;
    case "mediane": {
      if (exercice.variante !== "discrete") return null;
      return <>Médiane attendue : {formatMedianeAttendueTexte(versMedianeDiscrete(exercice))}</>;
    }
    case "q1": {
      if (exercice.variante !== "discrete") return null;
      return <>Q1 attendu : {formatQ1AttendueTexte(versMedianeDiscrete(exercice))}</>;
    }
    case "q3": {
      if (exercice.variante !== "discrete") return null;
      return <>Q3 attendu : {formatQ3AttendueTexte(versMedianeDiscrete(exercice))}</>;
    }
    case "minMaxMode": {
      if (exercice.variante !== "discrete") return null;
      return <>Min/max/mode(s) attendus : {formatMinMaxModeAttendueTexte(versMedianeDiscrete(exercice))}</>;
    }
    case "polygone": {
      if (exercice.variante !== "classes") return null;
      return <>Polygone attendu : {formatPolygoneAttenduTexte(versMedianeClasses(exercice))}</>;
    }
    case "lectureMediane": {
      if (exercice.variante !== "classes") return null;
      return <>Médiane attendue (lecture) : {formatLectureAttendueTexte(versMedianeClasses(exercice), "mediane")}</>;
    }
    case "lectureQ1": {
      if (exercice.variante !== "classes") return null;
      return <>Q1 attendu (lecture) : {formatLectureAttendueTexte(versMedianeClasses(exercice), "q1")}</>;
    }
    case "lectureQ3": {
      if (exercice.variante !== "classes") return null;
      return <>Q3 attendu (lecture) : {formatLectureAttendueTexte(versMedianeClasses(exercice), "q3")}</>;
    }
    case "synthese": {
      if (exercice.variante !== "classes") return null;
      return (
        <>
          Synthèse attendue : <Katex expression={LABEL_X_MIN} /> = {nombreFr(exercice.xMin)}, <Katex expression={LABEL_X_MAX} /> = {nombreFr(exercice.xMax)},{" "}
          {formatSyntheseAttendueTexte(versMedianeClasses(exercice))}
        </>
      );
    }
    case "boxplot":
      return (
        <>
          Réponse attendue :{" "}
          <span className="equation-box-termes">
            {formatTermesCinqNombresLatex(versBoiteMoustaches(exercice).valeurs).map((terme, i) => (
              <Katex key={i} expression={terme} />
            ))}
          </span>
        </>
      );
    case "tableau":
      return (
        <>
          Sommes attendues : <SegmentsInline segments={formatTableauAttenduTexte(versDispersion(exercice))} />
        </>
      );
    case "varianceEcartType":
      return (
        <>
          Variance attendue : {formatVarianceAttendueTexte(versDispersion(exercice))}, écart-type attendu : {formatEcartTypeAttendueTexte(versDispersion(exercice))}
        </>
      );
    case "btIntervalle":
      return <>Intervalle attendu : {formatBtIntervalleAttenduTexte(exercice)}</>;
    case "btPourcent":
      return <>% minimal attendu : {formatBtPourcentAttenduTexte(exercice)}</>;
  }
}

/** État tenu en attente dès qu'un écran se termine (bonne réponse, ou tentatives épuisées) — l'état
 * de session calculé par le moteur n'est appliqué (`setEtat`) qu'au clic sur le bouton de
 * `ValidationEcran`, jamais immédiatement (convention CLAUDE.md, "validation/invalidation avant de
 * passer à l'écran suivant"). */
interface TransitionEnAttente {
  etatSuivant: EtatSessionExerciceSynthese;
  revele: boolean;
}

/**
 * "Exercice de synthèse" (chapitre 4, remplace "Étendue et écart interquartile" à la même
 * position, gen35 — `promptgen35synthese.md`) — UN SEUL dataset (contexte + table x_i/n_i ou
 * classes/effectifs), généré une fois pour toutes, suivi de bout en bout à travers 11 (variante
 * "discrete") ou 13 (variante "classes") écrans REPRIS des générateurs sources (gen32/33/34/36),
 * plus 2 écrans "gen37 adaptés" propres à cet exercice. Seule la phase "btPourcent" est jamais
 * terminale (dernière phase des 2 séquences, `SEQUENCES` — `typesExerciceSynthese.ts`).
 */
export function AppExerciceSynthese() {
  const [etat, setEtat] = useState<EtatSessionExerciceSynthese>(nouvelleSession);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);

  function terminerEtape(nouvelEtat: EtatSessionExerciceSynthese) {
    const transitionDEcran = nouvelEtat.phase !== etat.phase || nouvelEtat.terminee !== etat.terminee;
    if (transitionDEcran) {
      // "btPourcent" est la seule phase terminale des 2 séquences — à ce moment,
      // `nouvelEtat.scoresAccumules` ne contient PAS encore l'entrée de cette dernière phase
      // (`cloturerExerciceOuSuivant` repart de l'`etat` d'avant sa fusion), donc on lit `revele`
      // sur le `resultats` tout juste construit plutôt que sur `scoresAccumules`.
      const revele =
        etat.phase === "btPourcent" ? nouvelEtat.resultats[nouvelEtat.resultats.length - 1]!.btPourcentRevele : nouvelEtat.scoresAccumules[etat.phase]!.revele;
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

  function onGenererDev(varianteId: string) {
    setEnAttente(null);
    setEtat(demarrerSessionExerciceSynthese(REGLAGES_DEMO, () => construireAvecVarianteId(varianteId as VarianteExerciceSynthese)));
  }

  const exercice = etat.exerciceCourant;
  const phase = etat.phase;
  const recapitulatif = calculerRecapitulatifExerciceSynthese(etat);

  /** Bloc de données centralisé (`EnTeteExercice`) — même tableau, même centralisation que dans
   * `AppMediane` (voir son propre commentaire) ; `niveauAide` y est ici un champ unique partagé
   * par toutes les phases (pas un champ par phase comme dans `AppMediane`). */
  const medianeDiscrete = exercice.variante === "discrete" ? versMedianeDiscrete(exercice) : null;
  const medianeClasses = exercice.variante === "classes" ? versMedianeClasses(exercice) : null;

  const surlignageDiscrete =
    !medianeDiscrete || etat.niveauAide < 2
      ? null
      : phase === "mediane"
        ? surlignageSeuilTable(medianeDiscrete, medianeDiscrete.seuil, medianeDiscrete.indexMediane)
        : phase === "q1"
          ? surlignageSeuilTable(medianeDiscrete, medianeDiscrete.seuilQ1, medianeDiscrete.indexQ1)
          : phase === "q3"
            ? surlignageSeuilTable(medianeDiscrete, medianeDiscrete.seuilQ3, medianeDiscrete.indexQ3)
            : null;

  const blocDonnees =
    medianeDiscrete && (phase === "mediane" || phase === "q1" || phase === "q3") ? (
      <TableEffectifsDiscrete exercice={medianeDiscrete} surlignage={surlignageDiscrete} />
    ) : medianeClasses && (phase === "polygone" || phase === "synthese") ? (
      <TableEffectifsClasses exercice={medianeClasses} />
    ) : null;

  const validation = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue: <div className="answer-reveal">{reponseAttenduePhase(phase, exercice)}</div>,
        labelSuivant: enAttente.etatSuivant.terminee ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
      }
    : null;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">4e — Entraînement</p>
        <h1 className="app-title">Synthèse — Statistique descriptive complète</h1>
        <p className="app-subtitle">Chapitre 4 — Statistiques</p>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={onGenererDev} />
      </header>

      <main className="card">
        <ProgressionPuces segments={calculerSegmentsProgression(etat)} />

        <div className="card-body">
          <EnTeteExercice consigneGenerale={formatEnonceTexte(exercice)} blocDonnees={blocDonnees} />
          <RecapitulatifPanel entrees={recapitulatif} />
          {PHASES_CALCULATRICE.has(phase) && <CalculatriceScientifique />}
          {phase === "centres" && exercice.variante === "classes" ? (
            <EtapeCentresMoyennePonderee
              key={phase}
              exercice={versMoyennePondereeClasses(exercice)}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAide}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(reponse) => terminerEtape(soumettreReponseCentres(etat, reponse))}
              validation={validation}
            />
          ) : phase === "sommes" ? (
            <EtapeSommesMoyennePonderee
              key={phase}
              exercice={versMoyennePonderee(exercice)}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAide}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(reponse) => terminerEtape(soumettreReponseSommes(etat, reponse))}
              validation={validation}
            />
          ) : phase === "quotient" ? (
            <EtapeQuotientMoyennePonderee
              key={phase}
              exercice={versMoyennePonderee(exercice)}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAide}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(reponse) => terminerEtape(soumettreReponseQuotient(etat, reponse))}
              validation={validation}
            />
          ) : phase === "mediane" && exercice.variante === "discrete" ? (
            <EtapeMedianeDiscrete
              key={phase}
              exercice={versMedianeDiscrete(exercice)}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAide}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(reponse) => terminerEtape(soumettreReponseMediane(etat, reponse))}
              validation={validation}
            />
          ) : phase === "q1" && exercice.variante === "discrete" ? (
            <EtapeQ1Mediane
              key={phase}
              exercice={versMedianeDiscrete(exercice)}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAide}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(reponse) => terminerEtape(soumettreReponseQ1(etat, reponse))}
              validation={validation}
            />
          ) : phase === "q3" && exercice.variante === "discrete" ? (
            <EtapeQ3Mediane
              key={phase}
              exercice={versMedianeDiscrete(exercice)}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAide}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(reponse) => terminerEtape(soumettreReponseQ3(etat, reponse))}
              validation={validation}
            />
          ) : phase === "minMaxMode" && exercice.variante === "discrete" ? (
            <EtapeMinMaxModeMediane
              key={phase}
              exercice={versMedianeDiscrete(exercice)}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAide}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(reponse) => terminerEtape(soumettreReponseMinMaxMode(etat, reponse))}
              validation={validation}
            />
          ) : phase === "polygone" && exercice.variante === "classes" ? (
            <EtapePolygoneMediane
              key={phase}
              exercice={versMedianeClasses(exercice)}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAide}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(points) => terminerEtape(soumettreReponsePolygone(etat, points))}
              validation={validation}
            />
          ) : phase === "lectureMediane" && exercice.variante === "classes" ? (
            <EtapeLectureMediane
              key={phase}
              exercice={versMedianeClasses(exercice)}
              parametre="mediane"
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAide}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(texte) => terminerEtape(soumettreReponseLecture(etat, "mediane", texte))}
              validation={validation}
            />
          ) : phase === "lectureQ1" && exercice.variante === "classes" ? (
            <EtapeLectureMediane
              key={phase}
              exercice={versMedianeClasses(exercice)}
              parametre="q1"
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAide}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(texte) => terminerEtape(soumettreReponseLecture(etat, "q1", texte))}
              validation={validation}
            />
          ) : phase === "lectureQ3" && exercice.variante === "classes" ? (
            <EtapeLectureMediane
              key={phase}
              exercice={versMedianeClasses(exercice)}
              parametre="q3"
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAide}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(texte) => terminerEtape(soumettreReponseLecture(etat, "q3", texte))}
              validation={validation}
            />
          ) : phase === "synthese" && exercice.variante === "classes" ? (
            <EtapeSyntheseMediane
              key={phase}
              exercice={versMedianeClasses(exercice)}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAide}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(reponse) => terminerEtape(soumettreReponseSynthese(etat, reponse))}
              validation={validation}
            />
          ) : phase === "boxplot" ? (
            <EtapeConstruction
              key={phase}
              exercice={versBoiteMoustaches(exercice)}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAide}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(reponse) => terminerEtape(soumettreReponseBoxplot(etat, reponse))}
              // Cran du glissement = plus grand pas commun des 5 valeurs attendues (entiers, multiples de
              // l'unité d'échelle du contexte, ou quartiles arrondis au palier de lecture).
              pas={pasCommun(Object.values(versBoiteMoustaches(exercice).valeurs))}
              validation={validation}
            />
          ) : phase === "tableau" ? (
            <EtapeTableauDispersion
              key={phase}
              exercice={versDispersion(exercice)}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAide}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(reponse) => terminerEtape(soumettreReponseTableau(etat, reponse))}
              validation={validation}
            />
          ) : phase === "varianceEcartType" ? (
            <EtapeVarianceEcartTypeDispersion
              key={phase}
              exercice={versDispersion(exercice)}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAide}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(reponse) => terminerEtape(soumettreReponseVarianceEcartType(etat, reponse))}
              validation={validation}
            />
          ) : phase === "btIntervalle" ? (
            <EtapeBtIntervalle
              key={phase}
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAide}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(reponse) => terminerEtape(soumettreReponseBtIntervalle(etat, reponse))}
              validation={validation}
            />
          ) : (
            <EtapeBtPourcent
              key={phase}
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAide}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(texte) => terminerEtape(soumettreReponseBtPourcent(etat, texte))}
              validation={validation}
            />
          )}
        </div>
      </main>
    </div>
  );
}
