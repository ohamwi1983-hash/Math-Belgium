import { useState } from "react";
import type { ReactNode } from "react";
import type { ReglagesSession } from "./core/session.types";
import {
  TENTATIVES_MAX_DIAGNOSTIC,
  activerAideSuivante,
  demarrerSessionIntersectionDroites,
  soumettreReponseDiagnostic,
  soumettreReponsePoint,
} from "./moteur/sessionIntersectionDroites";
import type { EtatSessionIntersectionDroites, PhaseIntersectionDroites } from "./moteur/typesIntersectionDroites";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceIntersectionDroites } from "./generateurs/intersectionDroites";
import type { ExerciceIntersectionDroites, VarianteIntersectionDroites } from "./core/intersectionDroites.types";
import { SelecteurVarianteDev } from "./components/SelecteurVarianteDev";
import { EtapeDiagnosticIntersectionDroites } from "./components/EtapeDiagnosticIntersectionDroites";
import { EtapePointIntersectionDroites } from "./components/EtapePointIntersectionDroites";
import { LIBELLE_CONCLUSION, formatReponsePointAttendueLatex, texteConclusionAttendue } from "./ui/formatIntersectionDroites";
import { calculerRecapitulatifIntersectionDroites } from "./ui/recapitulatifIntersectionDroites";
import { Katex } from "./components/Katex";
import { RecapitulatifPanel } from "./components/RecapitulatifPanel";
import type { EtatPuceProgression } from "../components/ProgressionPuces";
import { ProgressionPuces } from "../components/ProgressionPuces";
import { FicheReponseEcran } from "../components/FicheReponseEcran";
import type { EntreeHistoriqueEtape } from "../components/FicheReponseEcran";

const REGLAGES_DEMO: ReglagesSession = {
  nombreExercices: 1,
  tentativesMax: 3,
  affichageReponseApresEchec: true,
  affichageExplication: true,
};

function nouvelleSession(): EtatSessionIntersectionDroites {
  return demarrerSessionIntersectionDroites(REGLAGES_DEMO, genererExerciceIntersectionDroites);
}

/** Séquence dépendant de `exercice.conclusion` — "point" uniquement si `conclusion === "secantes"`,
 * sinon l'exercice se clôt directement après "diagnostic" (voir `typesIntersectionDroites.ts`).
 * "point", quand présent, est toujours la dernière phase : jamais consultée comme phase passée.
 * Puces cliquables : le diagnostic clos ouvre sa fiche de consultation (`FicheReponseEcran`). */
function sequencePourExercice(exercice: EtatSessionIntersectionDroites["exerciceCourant"]): PhaseIntersectionDroites[] {
  return exercice.conclusion === "secantes" ? ["diagnostic", "point"] : ["diagnostic"];
}

function calculerSegmentsProgression(etat: EtatSessionIntersectionDroites): EtatPuceProgression[] {
  const sequence = sequencePourExercice(etat.exerciceCourant);
  const indexCourant = sequence.indexOf(etat.phase);
  return sequence.map((_phase, index) => {
    if (index === indexCourant) return "courante";
    if (index > indexCourant) return "a-venir";
    // phase === "diagnostic" (seule phase jamais terminale pouvant être "passée" ici)
    if (etat.diagnosticRevele) return "revele";
    return etat.niveauAideDiagnostic > 0 ? "aide" : "correcte";
  });
}

const TITRES_ECRANS: Record<PhaseIntersectionDroites, string> = {
  diagnostic: "Position relative",
  point: "Point d'intersection",
};

/** Réponse attendue de l'écran `phase` — VALEUR seule : `ValidationEcran` et `FicheReponseEcran`
 * affichent déjà le libellé « Réponse attendue » (audit chapitre 7, point 35 : « Réponse attendue :
 * Réponse attendue : … »). */
function construireReponseAttendue(exercice: ExerciceIntersectionDroites, phase: PhaseIntersectionDroites): ReactNode {
  if (phase === "diagnostic") return texteConclusionAttendue(exercice);
  const latex = formatReponsePointAttendueLatex(exercice);
  return latex ? <Katex expression={latex} /> : null;
}

/** Saisie libre de l'élève, telle quelle — champ vide affiché « — ». */
function saisieBrute(texte: string): string {
  return texte.trim() === "" ? "—" : texte;
}

/** État tenu en attente dès qu'un écran se termine (bonne réponse, ou tentatives épuisées) — l'état
 * de session calculé par le moteur n'est appliqué (`setEtat`) qu'au clic sur le bouton de
 * `ValidationEcran`, jamais immédiatement (convention CLAUDE.md, "validation/invalidation avant de
 * passer à l'écran suivant"). */
interface TransitionEnAttente {
  etatSuivant: EtatSessionIntersectionDroites;
  revele: boolean;
}

export function AppIntersectionDroites() {
  const [etat, setEtat] = useState<EtatSessionIntersectionDroites>(nouvelleSession);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  /** Consultation en lecture seule des écrans clos (puces cliquables). */
  const [historique, setHistorique] = useState<EntreeHistoriqueEtape[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);
  /** Entre dans la `key` des écrans : aucune saisie ni aucun choix ne survit à « Générer » ou
   * « Nouvel exercice » (audit chapitre 7, point 37 — `key={phase}` seule restait identique). */
  const [numeroExercice, setNumeroExercice] = useState(0);

  function terminerEtape(nouvelEtat: EtatSessionIntersectionDroites, votreReponse: ReactNode) {
    const transitionDEcran = nouvelEtat.phase !== etat.phase || nouvelEtat.terminee !== etat.terminee;
    if (transitionDEcran) {
      // "diagnostic" clôture directement l'exercice quand la conclusion n'est pas "secantes" (pas
      // de second écran "point") — dans ce cas comme dans celui de "point" (toujours terminal),
      // `nouvelEtat` ne porte plus de champ `xxxRevele` à jour au niveau racine (reposé par
      // `cloturerExerciceOuSuivant`), donc on lit `revele` sur le `resultats` tout juste construit ;
      // seule la vraie transition interne diagnostic → point garde le champ racine `diagnosticRevele`.
      const revele = nouvelEtat.terminee
        ? etat.phase === "diagnostic"
          ? nouvelEtat.resultats[nouvelEtat.resultats.length - 1]!.diagnosticRevele
          : nouvelEtat.resultats[nouvelEtat.resultats.length - 1]!.pointRevele
        : nouvelEtat.diagnosticRevele;
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
    setEtat(demarrerSessionIntersectionDroites(REGLAGES_DEMO, () => construireAvecVarianteId(varianteId as VarianteIntersectionDroites)));
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
        <h1 className="app-title">Intersection entre deux droites</h1>
        <p className="app-subtitle">Chapitre 7 — Géométrie analytique plane</p>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={onGenererDev} />
        <ProgressionPuces segments={calculerSegmentsProgression(etat)} onSegmentClick={(index) => setFicheOuverteIndex(index)} />
      </header>

      <main className="card">
        <div className="card-body">
          <RecapitulatifPanel entrees={calculerRecapitulatifIntersectionDroites(etat)} />
          {phase === "diagnostic" ? (
            <EtapeDiagnosticIntersectionDroites
              key={`${numeroExercice}-${phase}`}
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={TENTATIVES_MAX_DIAGNOSTIC}
              niveauAide={etat.niveauAideDiagnostic}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(reponse) => terminerEtape(soumettreReponseDiagnostic(etat, reponse), LIBELLE_CONCLUSION[reponse])}
              validation={validation}
            />
          ) : (
            <EtapePointIntersectionDroites
              key={`${numeroExercice}-${phase}`}
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAidePoint}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(reponse, saisie) => {
                const parametres = [
                  exercice.tAttendu !== null ? `t = ${saisieBrute(saisie.t)}` : null,
                  exercice.sAttendu !== null ? `s = ${saisieBrute(saisie.s)}` : null,
                ].filter(Boolean);
                const votreReponse = [...parametres, `(${saisieBrute(saisie.x)} ; ${saisieBrute(saisie.y)})`].join(", ");
                terminerEtape(soumettreReponsePoint(etat, reponse), votreReponse);
              }}
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
