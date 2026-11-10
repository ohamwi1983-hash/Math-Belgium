import { useState } from "react";
import type { ReglagesSession } from "./core/session.types";
import {
  activerAideSuivante,
  demarrerSessionOmbreSoleil,
  sequencePourExercice,
  soumettreConclusion,
  soumettreReponseDirection,
  soumettreReponseDirectionInconnue,
  soumettreReponsePoint,
  soumettreReponsePointSimple,
} from "./moteur/sessionOmbreSoleil";
import type { EtatSessionOmbreSoleil, PhaseOmbreSoleil } from "./moteur/typesOmbreSoleil";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceOmbreSoleil } from "./generateurs/ombreSoleil";
import type { VarianteOmbreSoleil } from "./core/ombreSoleil.types";
import { SelecteurVarianteDev } from "./components/SelecteurVarianteDev";
import { EtapeConclusionOmbreSoleil } from "./components/EtapeConclusionOmbreSoleil";
import { EtapeDirectionInconnue } from "./components/EtapeDirectionInconnue";
import { EtapeDirectionOmbre } from "./components/EtapeDirectionOmbre";
import { EtapePointOmbre } from "./components/EtapePointOmbre";
import { EtapePointSimple } from "./components/EtapePointSimple";
import { EtapePointSommetOmbre } from "./components/EtapePointSommetOmbre";
import type { FicheChoixOmbre } from "./components/ChoixCandidatsOmbre";
import { EnTeteExercice } from "./components/EnTeteExercice";
import type { EtatPuceProgression } from "../components/ProgressionPuces";
import { ProgressionPuces } from "../components/ProgressionPuces";
import { FicheReponseEcran } from "../components/FicheReponseEcran";
import type { EntreeHistoriqueEtape } from "../components/FicheReponseEcran";
import { genererAvecCode, lireCodeDepuisUrl } from "../export/codeExercice";

const CONSIGNE_GENERALE = "Détermine l'ombre portée au soleil.";

/** Une seule tentative par écran de choix (décision H2a de l'audit du chapitre 8) : avec 4
 * candidats, plusieurs essais permettaient de gagner par élimination. */
const REGLAGES_DEMO: ReglagesSession = {
  nombreExercices: 1,
  tentativesMax: 1,
  affichageReponseApresEchec: true,
  affichageExplication: true,
};

function nouvelleSession(): EtatSessionOmbreSoleil {
  return demarrerSessionOmbreSoleil(REGLAGES_DEMO, genererExerciceOmbreSoleil);
}

/** Première session : si l'URL porte le code d'un exercice imprimé (`?code=XXXXXX`), son PREMIER
 * exercice est cette instance — tirée avec les MÊMES fonctions et le même catalogue que l'adaptateur
 * d'export (`generateurs/ombreSoleil/exportEvaluation.ts`) ; la suite reste un tirage normal. */
function sessionInitiale(): EtatSessionOmbreSoleil {
  const code = lireCodeDepuisUrl();
  if (!code) return nouvelleSession();
  return demarrerSessionOmbreSoleil(REGLAGES_DEMO, () => genererAvecCode(code, CATALOGUE_VARIANTES, genererExerciceOmbreSoleil, (id) => construireAvecVarianteId(id as VarianteOmbreSoleil)));
}

const TITRES_ECRANS: Record<PhaseOmbreSoleil, string> = {
  pointSimple: "Ombre du sommet",
  directionInconnue: "Direction de la lumière",
  direction: "Direction de la lumière",
  point: "Ombre du sommet",
  conclusion: "Conclusion",
};

/** Puces — une par écran noté (`sequencePourExercice`), l'écran courant étant
 * `etat.scoresAccumules.length`. */
function calculerSegmentsProgression(etat: EtatSessionOmbreSoleil): EtatPuceProgression[] {
  const sequence = sequencePourExercice(etat.exerciceCourant);
  const indexCourant = etat.scoresAccumules.length;
  return sequence.map((_phase, index) => {
    if (index === indexCourant) return "courante";
    if (index > indexCourant) return "a-venir";
    if (etat.revelesAccumules[index]) return "revele";
    return etat.niveauxAideAccumules[index] > 0 ? "aide" : "correcte";
  });
}

/** État tenu en attente dès qu'un écran noté se termine — appliqué au clic sur le bouton de
 * `ValidationEcran`. */
interface TransitionEnAttente {
  etatSuivant: EtatSessionOmbreSoleil;
  revele: boolean;
}

export function AppOmbreSoleil() {
  const [etat, setEtat] = useState<EtatSessionOmbreSoleil>(sessionInitiale);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  const [historique, setHistorique] = useState<EntreeHistoriqueEtape[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);
  /** Entre dans la `key` des écrans : chaque nouvel exercice remonte les écrans, ce qui re-mélange
   * l'ordre des candidats et efface la sélection (audit, points 4 et 28). */
  const [numeroExercice, setNumeroExercice] = useState(0);

  /** Un écran noté est clos dès que `scoresAccumules` grandit — y compris d'un écran "point" à
   * l'écran "point" suivant (même phase), cas que l'ancien test sur la phase manquait (point 29). */
  function terminerEtape(nouvelEtat: EtatSessionOmbreSoleil, fiche: FicheChoixOmbre) {
    const ecranClos = nouvelEtat.scoresAccumules.length > etat.scoresAccumules.length || nouvelEtat.terminee !== etat.terminee;
    if (!ecranClos) {
      setEtat(nouvelEtat);
      return;
    }
    const revele = nouvelEtat.revelesAccumules[nouvelEtat.revelesAccumules.length - 1]!;
    setEnAttente({ etatSuivant: nouvelEtat, revele });
    setHistorique((h) => [...h, { titre: TITRES_ECRANS[etat.phase], votreReponse: fiche.votreReponse, correcte: !revele, reponseAttendue: fiche.reponseAttendue }]);
  }

  function reinitialiser() {
    setHistorique([]);
    setFicheOuverteIndex(null);
    setNumeroExercice((n) => n + 1);
  }

  function passerEcranSuivant() {
    if (!enAttente) return;
    if (enAttente.etatSuivant.terminee) reinitialiser();
    setEtat(enAttente.etatSuivant.terminee ? nouvelleSession() : enAttente.etatSuivant);
    setEnAttente(null);
  }

  function onGenererDev(varianteId: string) {
    setEnAttente(null);
    reinitialiser();
    setEtat(demarrerSessionOmbreSoleil(REGLAGES_DEMO, () => construireAvecVarianteId(varianteId as VarianteOmbreSoleil)));
  }

  const exercice = etat.exerciceCourant;
  const phase = etat.phase;
  const cle = `${numeroExercice}-${etat.scoresAccumules.length}-${phase}`;

  const validation = enAttente
    ? {
        revele: enAttente.revele,
        labelSuivant: "Écran suivant",
        onSuivant: passerEcranSuivant,
      }
    : null;

  const commun = {
    tentativesUtilisees: etat.etapeCourante.tentativesUtilisees,
    tentativesMax: etat.reglages.tentativesMax,
    niveauAide: etat.niveauAide,
    onActiverAide: () => setEtat(activerAideSuivante(etat)),
    validation,
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">4e — Entraînement</p>
        <h1 className="app-title">Ombre au soleil</h1>
        <p className="app-subtitle">Chapitre 8 — Géométrie dans l'espace</p>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={onGenererDev} />
        <ProgressionPuces segments={calculerSegmentsProgression(etat)} onSegmentClick={(index) => setFicheOuverteIndex(index)} />
      </header>

      <main className="card">
        <div className="card-body">
          <EnTeteExercice consigneGenerale={CONSIGNE_GENERALE} blocDonnees={null} />
          {phase === "pointSimple" && exercice.variante === "simple" ? (
            <EtapePointSimple key={cle} exercice={exercice} {...commun} onValider={(id, fiche) => terminerEtape(soumettreReponsePointSimple(etat, id), fiche)} />
          ) : phase === "directionInconnue" && exercice.variante === "directionInconnue" ? (
            <EtapeDirectionInconnue key={cle} exercice={exercice} {...commun} onValider={(id, fiche) => terminerEtape(soumettreReponseDirectionInconnue(etat, id), fiche)} />
          ) : phase === "direction" && exercice.variante === "obstacle" ? (
            <EtapeDirectionOmbre key={cle} exercice={exercice} {...commun} onValider={(id, fiche) => terminerEtape(soumettreReponseDirection(etat, id), fiche)} />
          ) : phase === "point" && exercice.variante === "obstacle" ? (
            <EtapePointOmbre key={cle} exercice={exercice} {...commun} onValider={(id, fiche) => terminerEtape(soumettreReponsePoint(etat, id), fiche)} />
          ) : phase === "point" && exercice.variante === "directionInconnue" ? (
            <EtapePointSommetOmbre
              key={cle}
              exercice={exercice}
              index={etat.resolus.length}
              {...commun}
              onValider={(id, fiche) => terminerEtape(soumettreReponsePoint(etat, id), fiche)}
            />
          ) : (
            <EtapeConclusionOmbreSoleil
              key={cle}
              exercice={exercice}
              onContinuer={() => {
                const nouvelEtat = soumettreConclusion(etat);
                reinitialiser();
                setEtat(nouvelEtat.terminee ? nouvelleSession() : nouvelEtat);
              }}
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
