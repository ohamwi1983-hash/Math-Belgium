import { useState, type ReactNode } from "react";
import type { ReglagesSession } from "./core/session.types";
import { demarrerSessionPointVectoriel, soumettreReponseCoordonnees } from "./moteur/sessionPointVectoriel";
import type { EtatSessionPointVectoriel } from "./moteur/typesPointVectoriel";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExercicePointVectoriel, genererExercicePointVectorielLibre } from "./generateurs/pointVectoriel";
import { genererAvecCode, lireCodeDepuisUrl } from "../export/codeExercice";
import type { VariantePointVectoriel } from "./core/pointVectoriel.types";
import { SelecteurVarianteDev } from "./components/SelecteurVarianteDev";
import { EtapePointVectoriel } from "./components/EtapePointVectoriel";
import { EnTeteExercice } from "./components/EnTeteExercice";
import { Katex } from "./components/Katex";
import { formatNombreLatex } from "./ui/formatPointVectoriel";
import { CorrigeDetailleEcran } from "../components/CorrigeDetailleEcran";
import { lignesDeLEtape } from "../export/corrigeTableau";
import { correctionDetailleePointVectoriel } from "./generateurs/pointVectoriel/corrigeDetaille";
import { ProgressionPuces } from "../components/ProgressionPuces";
import { FicheReponseEcran } from "../components/FicheReponseEcran";
import { ecranClos, nombreDecimalSaisi, segmentsDepuisHistorique, type EcranClos } from "./ui/historiqueProgression";

const CONSIGNE_GENERALE = "Détermine les coordonnées de ce point à partir de la relation vectorielle.";

const REGLAGES_DEMO: ReglagesSession = {
  nombreExercices: 1,
  tentativesMax: 3,
  affichageReponseApresEchec: true,
  affichageExplication: true,
};

function nouvelleSession(): EtatSessionPointVectoriel {
  // Tirage libre de l'appli : symétrique compris ; les codes gardent l'ancien tirage (voir l'index).
  return demarrerSessionPointVectoriel(REGLAGES_DEMO, genererExercicePointVectorielLibre);
}

/** Première session : si l'URL porte le code d'un exercice imprimé (`?code=XXXXXX`, QR code de la
 * feuille ou de l'évaluation), son PREMIER exercice est celui de la copie — même catalogue et mêmes
 * fonctions de génération que l'adaptateur d'export. */
function sessionInitiale(): EtatSessionPointVectoriel {
  const code = lireCodeDepuisUrl();
  if (!code) return nouvelleSession();
  return demarrerSessionPointVectoriel(REGLAGES_DEMO, () => genererAvecCode(code, CATALOGUE_VARIANTES, genererExercicePointVectoriel, (id) => construireAvecVarianteId(id as Parameters<typeof construireAvecVarianteId>[0])));
}

/** État tenu en attente dès qu'un écran se termine (bonne réponse, ou tentatives épuisées) — l'état
 * de session calculé par le moteur n'est appliqué (`setEtat`) qu'au clic sur le bouton de
 * `ValidationEcran`. */
interface TransitionEnAttente {
  etatSuivant: EtatSessionPointVectoriel;
  revele: boolean;
}

/** Pas de `Phase` (comme "Quel angle ?") : un seul écran par exercice. Mono-écran : la transition
 * n'est jamais qu'une clôture d'exercice (`terminee` passe à `true`, `nombreExercices` vaut 1). */
export function AppPointVectoriel() {
  const [etat, setEtat] = useState<EtatSessionPointVectoriel>(sessionInitiale);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  /** Incrémenté à chaque nouvel exercice (« Nouvel exercice » ou « Générer ») : sert de `key` à
   * l'écran, pour que ses champs repartent vides au lieu de garder la saisie précédente. */
  const [numeroExercice, setNumeroExercice] = useState(0);
  /** Écrans clos de l'exercice en cours (puces cliquables → fiche en lecture seule). */
  const [historique, setHistorique] = useState<EcranClos[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);

  function viderHistorique() {
    setHistorique([]);
    setFicheOuverteIndex(null);
  }

  function terminerEtape(nouvelEtat: EtatSessionPointVectoriel, votreReponse: ReactNode) {
    const transitionDEcran = nouvelEtat.terminee !== etat.terminee;
    if (transitionDEcran) {
      const resultat = nouvelEtat.resultats[nouvelEtat.resultats.length - 1]!;
      // Pas d'aide sur cet écran : jamais « réussi avec aide ».
      setHistorique((h) => [...h, ecranClos("Coordonnées", votreReponse, resultat.coordonneesRevele, false, reponseAttendueEcran(), corrigeDetailleEcranCourant())]);
      setEnAttente({ etatSuivant: nouvelEtat, revele: resultat.coordonneesRevele });
      return;
    }
    setEtat(nouvelEtat);
  }

  function passerEcranSuivant() {
    if (!enAttente) return;
    if (enAttente.etatSuivant.terminee) {
      setNumeroExercice((n) => n + 1);
      viderHistorique();
    }
    setEtat(enAttente.etatSuivant.terminee ? nouvelleSession() : enAttente.etatSuivant);
    setEnAttente(null);
  }

  const exercice = etat.exerciceCourant;

  function onGenererDev(varianteId: string) {
    setEnAttente(null);
    viderHistorique();
    setNumeroExercice((n) => n + 1);
    setEtat(demarrerSessionPointVectoriel(REGLAGES_DEMO, () => construireAvecVarianteId(varianteId as VariantePointVectoriel)));
  }

  function reponseAttendueEcran() {
    return <Katex expression={`${exercice.pointCherche}(${formatNombreLatex(exercice.reponse.x)} \\,;\\, ${formatNombreLatex(exercice.reponse.y)})`} />;
  }

  /** Corrigé détaillé « comme au tableau » de l'écran unique — UNE seule source pour la validation
   * (après la réponse) et pour l'entrée d'historique (fiche de la puce). */
  function corrigeDetailleEcranCourant() {
    return <CorrigeDetailleEcran etapes={lignesDeLEtape(correctionDetailleePointVectoriel(exercice), "a")} />;
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
        <p className="app-eyebrow">4e — Entraînement</p>
        <h1 className="app-title">Point à partir d'une relation vectorielle (libre)</h1>
        <p className="app-subtitle">Chapitre 6 — Calcul vectoriel</p>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={onGenererDev} />
      </header>

      <main className="card">
        <ProgressionPuces segments={segmentsDepuisHistorique(historique, 1, !enAttente)} onSegmentClick={(index) => setFicheOuverteIndex(index)} />
        <div className="card-body">
          <EnTeteExercice consigneGenerale={CONSIGNE_GENERALE} blocDonnees={null} />
          <EtapePointVectoriel
            key={numeroExercice}
            exercice={exercice}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            onValider={(reponse) => terminerEtape(soumettreReponseCoordonnees(etat, reponse), `${exercice.pointCherche}(${nombreDecimalSaisi(reponse.x)} ; ${nombreDecimalSaisi(reponse.y)})`)}
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
