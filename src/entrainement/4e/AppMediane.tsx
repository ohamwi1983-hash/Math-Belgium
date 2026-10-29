import { useState } from "react";
import type { ReactNode } from "react";
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
import type { ExerciceMediane, VarianteMediane } from "./core/mediane.types";
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
  formatClasseTexte,
  surlignageSeuilTable,
} from "./ui/formatMediane";
import type { EtatPuceProgression } from "../components/ProgressionPuces";
import { ProgressionPuces } from "../components/ProgressionPuces";
import { nombreFr } from "./ui/nombreFr";
import type { EntreeHistoriqueEtape } from "../components/FicheReponseEcran";
import { FicheReponseEcran } from "../components/FicheReponseEcran";
import type { PointPolygone, ReponseMediane, ReponseMinMaxMode, ReponseQ1, ReponseQ3, ReponseSynthese } from "./moteur/verificationMediane";

const REGLAGES_DEMO: ReglagesSession = {
  nombreExercices: 1,
  tentativesMax: 3,
  affichageReponseApresEchec: true,
  affichageExplication: true,
};

function nouvelleSession(): EtatSessionMediane {
  return demarrerSessionMediane(REGLAGES_DEMO, genererExerciceMediane);
}

/** Séquence FIXE mais choisie dès le départ selon la variante (même logique que `phaseInitiale`,
 * `moteur/sessionMediane.ts`) : "discrete" → mediane → q1 → q3 → minMaxMode (terminal) ; "classes" →
 * polygone → lectureMediane → lectureQ1 → lectureQ3 → synthese (terminal). Pas de fichier recap
 * partagé pour ce générateur (contrairement à `AppOptimisation`/`recapitulatifOptimisation.ts`),
 * donc la séquence est définie ici, directement depuis la même logique que le moteur. */
function sequencePourExercice(exercice: ExerciceMediane): PhaseMediane[] {
  return exercice.variante === "discrete"
    ? ["mediane", "q1", "q3", "minMaxMode"]
    : ["polygone", "lectureMediane", "lectureQ1", "lectureQ3", "synthese"];
}

/** La dernière phase de chaque séquence (minMaxMode / synthese) n'a jamais besoin de sa propre
 * branche "close" : un nouvel exercice redémarre toujours juste après, donc elle reste "a-venir"
 * jusqu'à devenir "courante" — jamais consultée comme passée (même principe que la dernière phase
 * d'`AppFormeCanoniqueTransformations`/`AppOptimisation`). Puces purement visuelles (pas de
 * `onSegmentClick`). */
function calculerSegmentsProgression(etat: EtatSessionMediane): EtatPuceProgression[] {
  const sequence = sequencePourExercice(etat.exerciceCourant);
  const indexCourant = sequence.indexOf(etat.phase);
  return sequence.map((phase, index) => {
    if (index === indexCourant) return "courante";
    if (index > indexCourant) return "a-venir";
    const revele =
      phase === "mediane"
        ? etat.medianeRevele
        : phase === "q1"
          ? etat.q1Revele
          : phase === "q3"
            ? etat.q3Revele
            : phase === "polygone"
              ? etat.polygoneRevele
              : phase === "lectureMediane"
                ? etat.lectureMedianeRevele
                : phase === "lectureQ1"
                  ? etat.lectureQ1Revele
                  : etat.lectureQ3Revele;
    if (revele) return "revele";
    const niveauAide =
      phase === "mediane"
        ? etat.niveauAideMediane
        : phase === "q1"
          ? etat.niveauAideQ1
          : phase === "q3"
            ? etat.niveauAideQ3
            : phase === "polygone"
              ? etat.niveauAidePolygone
              : phase === "lectureMediane"
                ? etat.niveauAideLectureMediane
                : phase === "lectureQ1"
                  ? etat.niveauAideLectureQ1
                  : etat.niveauAideLectureQ3;
    return niveauAide > 0 ? "aide" : "correcte";
  });
}

/** État tenu en attente dès qu'un écran se termine (bonne réponse, ou tentatives épuisées) — l'état
 * de session calculé par le moteur n'est appliqué (`setEtat`) qu'au clic sur le bouton de
 * `ValidationEcran`, jamais immédiatement (convention CLAUDE.md, "validation/invalidation avant de
 * passer à l'écran suivant"). */
/** Titre de la fiche de consultation d'un écran clos (puces cliquables). */
const TITRE_PHASE: Record<PhaseMediane, string> = {
  mediane: "Médiane",
  q1: "Premier quartile Q1",
  q3: "Troisième quartile Q3",
  minMaxMode: "Minimum, maximum et mode(s)",
  polygone: "Polygone des effectifs cumulés",
  lectureMediane: "Lecture de la médiane",
  lectureQ1: "Lecture de Q1",
  lectureQ3: "Lecture de Q3",
  synthese: "Synthèse",
};

function texteSaisi(valeur: string): string {
  return valeur.trim() === "" ? "—" : valeur.trim();
}

interface TransitionEnAttente {
  etatSuivant: EtatSessionMediane;
  revele: boolean;
}

/** Numéro stable par objet exercice (le moteur garde la même référence d'une phase à l'autre). */
const idsExercices = new WeakMap<object, number>();
let prochainIdExercice = 0;
function idExercice(exercice: object): number {
  let id = idsExercices.get(exercice);
  if (id === undefined) {
    id = ++prochainIdExercice;
    idsExercices.set(exercice, id);
  }
  return id;
}

export function AppMediane() {
  const [etat, setEtat] = useState<EtatSessionMediane>(nouvelleSession);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  /** Consultation en lecture seule des écrans clos (puces cliquables) — une entrée par écran, dans
   * l'ordre de la séquence (chaque écran se clôt une seule fois), remise à vide à chaque exercice. */
  const [historique, setHistorique] = useState<EntreeHistoriqueEtape[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);

  function terminerEtape(nouvelEtat: EtatSessionMediane, votreReponse: ReactNode) {
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
      setHistorique((h) => [
        ...h,
        { titre: TITRE_PHASE[etat.phase], votreReponse, correcte: !revele, reponseAttendue: revele ? reponseAttenduePhase(etat.phase) : undefined },
      ]);
      setEnAttente({ etatSuivant: nouvelEtat, revele });
      return;
    }
    setEtat(nouvelEtat);
  }

  function passerEcranSuivant() {
    if (!enAttente) return;
    if (enAttente.etatSuivant.terminee) {
      setEtat(nouvelleSession());
      setHistorique([]);
      setFicheOuverteIndex(null);
    } else {
      setEtat(enAttente.etatSuivant);
    }
    setEnAttente(null);
  }

  const exercice = etat.exerciceCourant;
  const phase = etat.phase;
  /** Identité de l'exercice dans les `key` des écrans : un nouvel exercice (même phase, ex. via
   * « Générer ») remonte l'écran au lieu de garder l'état local de l'exercice précédent (audit
   * chapitre 4 : points du polygone restés à l'échelle de l'ancien exercice). */
  const cleExercice = idExercice(exercice);

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
    setHistorique([]);
    setFicheOuverteIndex(null);
    setEtat(demarrerSessionMediane(REGLAGES_DEMO, () => construireAvecVarianteId(varianteId as VarianteMediane)));
  }

  function reponseAttenduePhase(phase: PhaseMediane): ReactNode {
    return phase === "mediane" && exercice.variante === "discrete" ? (
      <>{formatMedianeAttendueTexte(exercice)}</>
    ) : phase === "q1" && exercice.variante === "discrete" ? (
      <>{formatQ1AttendueTexte(exercice)}</>
    ) : phase === "q3" && exercice.variante === "discrete" ? (
      <>{formatQ3AttendueTexte(exercice)}</>
    ) : phase === "minMaxMode" && exercice.variante === "discrete" ? (
      <>{formatMinMaxModeAttendueTexte(exercice)}</>
    ) : phase === "polygone" && exercice.variante === "classes" ? (
      <>{formatPolygoneAttenduTexte(exercice)}</>
    ) : phase === "lectureQ1" && exercice.variante === "classes" ? (
      <>{formatLectureAttendueTexte(exercice, "q1")}</>
    ) : phase === "lectureMediane" && exercice.variante === "classes" ? (
      <>{formatLectureAttendueTexte(exercice, "mediane")}</>
    ) : phase === "lectureQ3" && exercice.variante === "classes" ? (
      <>{formatLectureAttendueTexte(exercice, "q3")}</>
    ) : exercice.variante === "classes" ? (
      <>
        <Katex expression={LABEL_X_MIN} /> = {nombreFr(exercice.xMin)}, <Katex expression={LABEL_X_MAX} /> = {nombreFr(exercice.xMax)},{" "}
        {formatSyntheseAttendueTexte(exercice)}
      </>
    ) : null;
  }
  const reponseAttendue = reponseAttenduePhase(phase);

  const saisieMediane = (r: ReponseMediane) => `seuil = ${texteSaisi(r.seuil)}, médiane = ${texteSaisi(r.mediane)}`;
  const saisieQ1 = (r: ReponseQ1) => `seuil = ${texteSaisi(r.seuil)}, Q1 = ${texteSaisi(r.q1)}`;
  const saisieQ3 = (r: ReponseQ3) => `seuil = ${texteSaisi(r.seuil)}, Q3 = ${texteSaisi(r.q3)}`;
  const saisieMinMaxMode = (r: ReponseMinMaxMode) =>
    `min = ${texteSaisi(r.min)}, max = ${texteSaisi(r.max)}, mode(s) = ${r.modes.map((m) => m.trim()).filter((m) => m !== "").join(" ; ") || "—"}`;
  const saisiePolygone = (points: PointPolygone[]) => points.map((p) => `(${nombreFr(p.x)} ; ${nombreFr(p.y)})`).join(", ");
  const saisieSynthese = (r: ReponseSynthese) => (
    <>
      <Katex expression={LABEL_X_MIN} /> = {texteSaisi(r.xMin)}, <Katex expression={LABEL_X_MAX} /> = {texteSaisi(r.xMax)}, étendue ={" "}
      {texteSaisi(r.etendue)}, classe modale = {r.classeModale === null || exercice.variante !== "classes" ? "—" : formatClasseTexte(exercice, r.classeModale)}, mode ={" "}
      {texteSaisi(r.mode)}
    </>
  );

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
        <p className="app-subtitle">Chapitre 4</p>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={onGenererDev} />
      </header>

      <main className="card">
        <ProgressionPuces segments={calculerSegmentsProgression(etat)} onSegmentClick={(index) => setFicheOuverteIndex(index)} />

        <div className="card-body">
          <EnTeteExercice consigneGenerale={formatEnonceTexte(exercice)} blocDonnees={blocDonnees} />
          {phase === "mediane" && exercice.variante === "discrete" ? (
            <EtapeMedianeDiscrete
              key={`${cleExercice}-${phase}`}
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAideMediane}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(reponse) => terminerEtape(soumettreReponseMediane(etat, reponse), saisieMediane(reponse))}
              validation={validation}
            />
          ) : phase === "q1" && exercice.variante === "discrete" ? (
            <EtapeQ1Mediane
              key={`${cleExercice}-${phase}`}
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAideQ1}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(reponse) => terminerEtape(soumettreReponseQ1(etat, reponse), saisieQ1(reponse))}
              validation={validation}
            />
          ) : phase === "q3" && exercice.variante === "discrete" ? (
            <EtapeQ3Mediane
              key={`${cleExercice}-${phase}`}
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAideQ3}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(reponse) => terminerEtape(soumettreReponseQ3(etat, reponse), saisieQ3(reponse))}
              validation={validation}
            />
          ) : phase === "minMaxMode" && exercice.variante === "discrete" ? (
            <EtapeMinMaxModeMediane
              key={`${cleExercice}-${phase}`}
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAideMinMaxMode}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(reponse) => terminerEtape(soumettreReponseMinMaxMode(etat, reponse), saisieMinMaxMode(reponse))}
              validation={validation}
            />
          ) : phase === "polygone" && exercice.variante === "classes" ? (
            <EtapePolygoneMediane
              key={`${cleExercice}-${phase}`}
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAidePolygone}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(points) => terminerEtape(soumettreReponsePolygone(etat, points), saisiePolygone(points))}
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
              key={`${cleExercice}-mediane`}
              exercice={exercice}
              parametre="mediane"
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAideLectureMediane}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(texte) => terminerEtape(soumettreReponseLectureMediane(etat, texte), `médiane ≈ ${texteSaisi(texte)}`)}
              validation={validation}
            />
          ) : phase === "lectureQ1" && exercice.variante === "classes" ? (
            <EtapeLectureMediane
              key={`${cleExercice}-q1`}
              exercice={exercice}
              parametre="q1"
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAideLectureQ1}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(texte) => terminerEtape(soumettreReponseLectureQ1(etat, texte), `Q1 ≈ ${texteSaisi(texte)}`)}
              validation={validation}
            />
          ) : phase === "lectureQ3" && exercice.variante === "classes" ? (
            <EtapeLectureMediane
              key={`${cleExercice}-q3`}
              exercice={exercice}
              parametre="q3"
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAideLectureQ3}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(texte) => terminerEtape(soumettreReponseLectureQ3(etat, texte), `Q3 ≈ ${texteSaisi(texte)}`)}
              validation={validation}
            />
          ) : phase === "synthese" && exercice.variante === "classes" ? (
            <EtapeSyntheseMediane
              key={`${cleExercice}-${phase}`}
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAideSynthese}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(reponse) => terminerEtape(soumettreReponseSynthese(etat, reponse), saisieSynthese(reponse))}
              validation={validation}
            />
          ) : null}{" "}
        </div>
      </main>

      {ficheOuverteIndex !== null && historique[ficheOuverteIndex] && (
        <FicheReponseEcran entree={historique[ficheOuverteIndex]} onFermer={() => setFicheOuverteIndex(null)} />
      )}
    </div>
  );
}
