import { Fragment, useState } from "react";
import type { ReactNode } from "react";
import type { ExerciceConstructionParabole } from "./core/constructionParabole.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceConstructionParabole } from "./generateurs/constructionParabole";
import { genererAvecCode, lireCodeDepuisUrl } from "../export/codeExercice";
import {
  TENTATIVES_MAX_CONSTRUCTION,
  activerAide,
  demarrer,
  ecranCourant,
  ecranSuivant,
  nombreEcrans,
  soumettre,
  type EtatConstructionParabole,
} from "./moteur/sessionConstructionParabole";
import { ordreTraceCorrect, pointsATracer, tracesAttendues, verifierEcran, type TraceConstruction, type VerificationEcran } from "./moteur/modeleConstructionParabole";
import { aidesEcran, bilanEcran, consigneEcran, consigneGenerale, messageDiagnostic, titreEcran } from "./ui/formatConstructionParabole";
import { ecranClos, segmentsDepuisHistorique, type EcranClos } from "./ui/historiqueProgression";
import type { FragmentConsigne } from "../export/genererFeuilleExercices";
import { SelecteurVarianteDev } from "./components/SelecteurVarianteDev";
import { EnTeteExercice } from "./components/EnTeteExercice";
import { RenduFragments } from "./components/RenduFragments";
import { EtapeConstructionParabole } from "./components/EtapeConstructionParabole";
import { EtapeTraceParabole } from "./components/EtapeTraceParabole";
import { ProgressionPuces } from "../components/ProgressionPuces";
import { FicheReponseEcran } from "../components/FicheReponseEcran";
import type { ValidationEtapeProps } from "../components/ValidationEcran";

/**
 * `gen53` — Construction de la parabole au compas et à l'équerre. L'élève manipule de vrais
 * instruments (équerre qui glisse le long d'une droite, compas piqué sur un point construit) ; chaque
 * écran vérifie le GESTE (centre du cercle, même ouverture, position de l'équerre), sur une figure
 * sans grille ni coordonnée. Deux méthodes (variante) : cercle et parallèle, ou médiatrice.
 */
function exerciceInitial(): ExerciceConstructionParabole {
  const code = lireCodeDepuisUrl();
  if (!code) return genererExerciceConstructionParabole();
  return genererAvecCode(code, CATALOGUE_VARIANTES, genererExerciceConstructionParabole, construireAvecVarianteId);
}

interface TransitionEnAttente {
  revele: boolean;
  derniere: boolean;
  tracesClos: TraceConstruction[] | null;
}

function descriptionTraces(traces: TraceConstruction[]): string {
  if (traces.length === 0) return "aucun tracé";
  return traces
    .map((t) => (t.type === "cercle" ? `cercle de centre ${t.centre.replace(/H(\d)/, (_m, n: string) => `H${"₁₂₃"[Number(n) - 1]}`)}` : t.reference === "d" ? "perpendiculaire à d" : "parallèle à d"))
    .join(", ");
}

export function AppConstructionParabole() {
  const [etat, setEtat] = useState<EtatConstructionParabole>(() => demarrer(exerciceInitial()));
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  const [historique, setHistorique] = useState<EcranClos[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);
  const [generation, setGeneration] = useState(0);
  const [messageErreur, setMessageErreur] = useState<FragmentConsigne[] | null>(null);

  const e = etat.exercice;
  const ecran = ecranCourant(etat);
  const total = nombreEcrans(etat);
  if (import.meta.env.DEV) (window as unknown as { __debugGen53?: unknown }).__debugGen53 = { exercice: e, acquis: etat.acquis };

  function recommencer(exercice: ExerciceConstructionParabole) {
    setEtat(demarrer(exercice));
    setEnAttente(null);
    setHistorique([]);
    setFicheOuverteIndex(null);
    setMessageErreur(null);
    setGeneration((g) => g + 1);
  }

  function conclure(verification: VerificationEcran, diagnostic: FragmentConsigne[] | null, votreReponse: ReactNode, traces: TraceConstruction[] | null) {
    const resultat = soumettre(etat, verification);
    setEtat(resultat.etat);
    if (!resultat.clos) {
      setMessageErreur(diagnostic);
      return;
    }
    setMessageErreur(null);
    const attendues = ecran.type === "trace" ? null : resultat.revele ? tracesAttendues(e, ecran, resultat.etat.acquis) : traces;
    const attendueTexte = <RenduFragments fragments={bilanEcran(ecran)} />;
    setHistorique((h) => [...h, ecranClos(titreEcran(ecran), votreReponse, resultat.revele, etat.niveauAide > 0, attendueTexte)]);
    setEnAttente({ revele: resultat.revele, derniere: etat.ecran >= total - 1, tracesClos: attendues });
  }

  function validerConstruction(traces: TraceConstruction[]) {
    const verification = verifierEcran(e, ecran, etat.acquis, traces);
    conclure(verification, verification.diagnostic ? messageDiagnostic(verification.diagnostic, ecran) : null, descriptionTraces(traces), traces);
  }

  function validerTrace(ordre: number[]) {
    const nombre = pointsATracer(e, etat.acquis).length;
    const correct = ordreTraceCorrect(nombre, ordre);
    conclure({ correct, diagnostic: correct ? null : "trace-ordre" }, correct ? null : messageDiagnostic("trace-ordre", ecran), correct ? "points reliés de proche en proche" : "points reliés dans le désordre", null);
  }

  function passerEcranSuivant() {
    if (!enAttente) return;
    if (enAttente.derniere) {
      recommencer(genererExerciceConstructionParabole());
      return;
    }
    setEtat(ecranSuivant(etat));
    setMessageErreur(null);
    setEnAttente(null);
  }

  const validation: ValidationEtapeProps | null = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue: enAttente.revele ? (ecran.type === "trace" ? "La courbe passe par les points de proche en proche, d'une extrémité à l'autre, en passant par le sommet." : "La construction attendue est dessinée sur la figure.") : undefined,
        labelSuivant: enAttente.derniere ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
      }
    : null;

  const communs = {
    exercice: e,
    acquis: etat.acquis,
    consigne: consigneEcran(ecran),
    aides: aidesEcran(ecran),
    niveauAide: etat.niveauAide,
    onActiverAide: () => setEtat(activerAide(etat)),
    tentativesUtilisees: etat.tentativesUtilisees,
    tentativesMax: TENTATIVES_MAX_CONSTRUCTION,
    messageErreur,
    validation,
    bilan: bilanEcran(ecran),
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">4e — Entraînement</p>
        <h1 className="app-title">Construction de la parabole au compas et à l'équerre</h1>
        <p className="app-subtitle">Chapitre 7 — Géométrie analytique plane</p>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={(id) => recommencer(construireAvecVarianteId(id))} />
      </header>

      <main className="card">
        <ProgressionPuces segments={segmentsDepuisHistorique(historique, total, !enAttente)} onSegmentClick={(index) => setFicheOuverteIndex(index)} />

        <div className="card-body">
          <EnTeteExercice consigneGenerale={<RenduFragments fragments={consigneGenerale(e)} />} blocDonnees={null} />
          <Fragment key={`${generation}-${etat.ecran}`}>
            {ecran.type === "trace" ? (
              <EtapeTraceParabole {...communs} onValider={validerTrace} />
            ) : (
              <EtapeConstructionParabole {...communs} ecran={ecran} onValider={validerConstruction} tracesClos={enAttente?.tracesClos ?? null} />
            )}
          </Fragment>
        </div>
      </main>

      {ficheOuverteIndex !== null && historique[ficheOuverteIndex] && (
        <FicheReponseEcran entree={historique[ficheOuverteIndex].entree} onFermer={() => setFicheOuverteIndex(null)} />
      )}
    </div>
  );
}
