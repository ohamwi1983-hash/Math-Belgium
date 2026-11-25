import { useState, type ReactNode } from "react";
import type { ReglagesSession6e } from "./core6e/session6e.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceFonctionsCyclometriques } from "./generateurs6e/fonctionsCyclometriques";
import {
  NIVEAU_AIDE_MAX,
  activerAideSuivante,
  demarrerSessionFonctionsCyclometriques,
  soumettreReponseFonctionsCyclometriques,
} from "./moteur6e/sessionFonctionsCyclometriques";
import type { EtatSessionFonctionsCyclometriques } from "./moteur6e/typesFonctionsCyclometriques";
import { Katex } from "./components/Katex";
import { EtapeFonctionsCyclometriques } from "./components6e/EtapeFonctionsCyclometriques";
import { SelecteurVarianteDev } from "./components6e/SelecteurVarianteDev";
import { CorrigeDetailleEcran } from "../components/CorrigeDetailleEcran";
import { genererAvecCode, lireCodeDepuisUrl } from "../export/codeExercice";
import { correctionDetailleeFonctionsCyclometriques, resultatFonctionsCyclometriquesLatex } from "./generateurs6e/fonctionsCyclometriques/corrigeDetaille";
import { ProgressionPuces } from "../components/ProgressionPuces";
import { FicheReponseEcran } from "../components/FicheReponseEcran";
import { ecranClos, segmentsDepuisHistorique, type EcranClos } from "../4e/ui/historiqueProgression";
import { saisieEnLatex6e } from "./ui6e/saisieEnLatex6e";

const REGLAGES_DEMO: ReglagesSession6e = { nombreExercices: 1, tentativesMax: 3 };

function nouvelleSession(): EtatSessionFonctionsCyclometriques {
  return demarrerSessionFonctionsCyclometriques(REGLAGES_DEMO, genererExerciceFonctionsCyclometriques);
}

/** Première session : `?code=XXXXXX` (QR code d'une feuille) rouvre l'exercice imprimé — mêmes
 * fonctions de tirage que l'adaptateur d'export, comme `App6gen14.tsx`. */
function sessionInitiale(): EtatSessionFonctionsCyclometriques {
  const code = lireCodeDepuisUrl();
  if (!code) return nouvelleSession();
  return demarrerSessionFonctionsCyclometriques(REGLAGES_DEMO, () => genererAvecCode(code, CATALOGUE_VARIANTES, genererExerciceFonctionsCyclometriques, (id) => construireAvecVarianteId(id as Parameters<typeof construireAvecVarianteId>[0])));
}

/** État tenu en attente dès que l'écran unique se termine (bonne réponse, ou tentatives
 * épuisées) — l'état de session calculé par le moteur n'est appliqué (`setEtat`) qu'au clic sur le
 * bouton de `ValidationEcran`, jamais immédiatement (convention CLAUDE.md, "validation/
 * invalidation avant de passer à l'écran suivant"). */
interface TransitionEnAttente {
  etatSuivant: EtatSessionFonctionsCyclometriques;
  revele: boolean;
}

/**
 * `6gen2` (REFONTE TOTALE) — écran UNIQUE quelle que soit la variante tirée (voir
 * `moteur6e/typesFonctionsCyclometriques.ts`) : pas de branchement par phase ici, contrairement à
 * la quasi-totalité des autres `App6genX.tsx` de ce chantier. L'écran unique se termine dès que
 * `resultats` grandit (= aucune machinerie de phase à surveiller).
 */
export function App6gen2() {
  const [etat, setEtat] = useState<EtatSessionFonctionsCyclometriques>(sessionInitiale);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  /** Écrans clos de l'exercice en cours (puces cliquables → fiche en lecture seule). */
  const [historique, setHistorique] = useState<EcranClos[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);

  function viderHistorique() {
    setHistorique([]);
    setFicheOuverteIndex(null);
  }

  function terminerEtape(nouvelEtat: EtatSessionFonctionsCyclometriques, votreReponse: ReactNode) {
    if (nouvelEtat.resultats.length > etat.resultats.length) {
      const revele = nouvelEtat.resultats[nouvelEtat.resultats.length - 1].revele;
      setHistorique((h) => [...h, ecranClos("Valeur", votreReponse, revele, etat.niveauAide > 0, reponseAttendueEcran(), corrigeDetailleEcranCourant())]);
      setEnAttente({ etatSuivant: nouvelEtat, revele });
      return;
    }
    setEtat(nouvelEtat);
  }

  function passerEcranSuivant() {
    if (!enAttente) return;
    if (enAttente.etatSuivant.terminee) viderHistorique();
    setEtat(enAttente.etatSuivant.terminee ? nouvelleSession() : enAttente.etatSuivant);
    setEnAttente(null);
  }

  function forcerVariante(id: string) {
    setEnAttente(null);
    viderHistorique();
    setEtat(
      demarrerSessionFonctionsCyclometriques(REGLAGES_DEMO, () => construireAvecVarianteId(id as Parameters<typeof construireAvecVarianteId>[0])),
    );
  }

  const exercice = etat.exerciceCourant;
  // Écran unique par exercice (pas de notion de "phase" ici, voir commentaire de tête) → c'est
  // toujours le premier (et seul) écran de l'exercice en cours.
  const tentativesUtilisees = etat.etapeCourante.tentativesUtilisees;
  const tentativesMax = etat.reglages.tentativesMax;

  function reponseAttendueEcran() {
    return exercice.existe ? <Katex expression={resultatFonctionsCyclometriquesLatex(exercice) as string} /> : "N'existe pas";
  }

  /** Corrigé détaillé « comme au tableau » (source unique avec le papier) — écran unique « a ». UNE
   * seule source pour la validation (après la réponse) et pour l'entrée d'historique (fiche de la puce). */
  function corrigeDetailleEcranCourant() {
    return <CorrigeDetailleEcran etapes={correctionDetailleeFonctionsCyclometriques(exercice)} />;
  }

  const validation = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue: reponseAttendueEcran(),
        corrigeDetaille: corrigeDetailleEcranCourant(),
        labelSuivant: enAttente.etatSuivant.terminee ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
      }
    : null;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">6e — Entraînement</p>
        <h1 className="app-title">Valeurs cyclométriques — existence et calcul</h1>
        <p className="app-subtitle">Chapitre 1 — Fonctions réciproques & cyclométriques</p>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={forcerVariante} />
      </header>
      <main className="card">
        <ProgressionPuces segments={segmentsDepuisHistorique(historique, 1, !enAttente)} onSegmentClick={(index) => setFicheOuverteIndex(index)} />
        <div className="card-body">
          <EtapeFonctionsCyclometriques
            key={etat.indexExercice}
            exercice={exercice}
            tentativesUtilisees={tentativesUtilisees}
            tentativesMax={tentativesMax}
            niveauAide={etat.niveauAide}
            niveauAideMax={NIVEAU_AIDE_MAX}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(reponse) => terminerEtape(soumettreReponseFonctionsCyclometriques(etat, reponse), reponse.existe ? saisieEnLatex6e(reponse.texte ?? "") : "N'existe pas")}
            validation={validation}
          />
        </div>
      </main>

      {ficheOuverteIndex !== null && historique[ficheOuverteIndex] && (
        <FicheReponseEcran entree={historique[ficheOuverteIndex].entree} onFermer={() => setFicheOuverteIndex(null)} />
      )}
    </div>
  );
}
