import { useState, type ReactNode } from "react";
import type { ReglagesSession } from "./core/session.types";
import { activerAide, demarrerSessionQuelAngle, soumettreReponse } from "./moteur/sessionQuelAngle";
import type { EtatSessionQuelAngle } from "./moteur/typesQuelAngle";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceQuelAngle } from "./generateurs/quelAngle";
import type { IdVarianteQuelAngle, ReponseQuelAngle } from "./core/quelAngle.types";
import { SelecteurVarianteDev } from "./components/SelecteurVarianteDev";
import { EtapeQuelAngle } from "./components/EtapeQuelAngle";
import { Katex } from "./components/Katex";
import { formatTermesSolutionsLatex } from "./ui/formatQuelAngle";
import { EnTeteExercice } from "./components/EnTeteExercice";
import { genererAvecCode, lireCodeDepuisUrl } from "../export/codeExercice";
import { lignesDeLEtape } from "../export/corrigeTableau";
import { CorrigeDetailleEcran } from "../components/CorrigeDetailleEcran";
import { correctionDetailleeQuelAngle } from "./generateurs/quelAngle/corrigeDetaille";
import { ProgressionPuces } from "../components/ProgressionPuces";
import { FicheReponseEcran } from "../components/FicheReponseEcran";
import { ecranClos, nombreDecimalSaisi, segmentsDepuisHistorique, type EcranClos } from "./ui/historiqueProgression";

const CONSIGNE_GENERALE = "Résous cette équation trigonométrique.";

const REGLAGES_DEMO: ReglagesSession = {
  nombreExercices: 1,
  tentativesMax: 3,
  affichageReponseApresEchec: true,
  affichageExplication: true,
};

function nouvelleSession(): EtatSessionQuelAngle {
  return demarrerSessionQuelAngle(REGLAGES_DEMO, genererExerciceQuelAngle);
}

/** Première session : si l'URL porte le code d'un exercice imprimé (`?code=XXXXXX`, QR code de la
 * feuille ou de l'évaluation), son PREMIER exercice est celui de la copie — même catalogue et mêmes
 * fonctions de génération que l'adaptateur d'export. */
function sessionInitiale(): EtatSessionQuelAngle {
  const code = lireCodeDepuisUrl();
  if (!code) return nouvelleSession();
  return demarrerSessionQuelAngle(REGLAGES_DEMO, () => genererAvecCode(code, CATALOGUE_VARIANTES, genererExerciceQuelAngle, (id) => construireAvecVarianteId(id as IdVarianteQuelAngle)));
}

/** État tenu en attente dès qu'un écran se termine (bonne réponse, ou tentatives épuisées) — l'état
 * de session calculé par le moteur n'est appliqué (`setEtat`) qu'au clic sur le bouton de
 * `ValidationEcran`. */
interface TransitionEnAttente {
  etatSuivant: EtatSessionQuelAngle;
  revele: boolean;
}

/** Réponse réellement donnée : « Pas de solution », ou les valeurs de α saisies (en degrés). */
function reponseQuelAngleAffichee(reponse: ReponseQuelAngle): ReactNode {
  if (reponse.aucune) return "Pas de solution";
  return `α = ${reponse.valeurs.map((v) => `${nombreDecimalSaisi(v)}°`).join(" ; ")}`;
}

/** Pas de `Phase` (comme "Transformations graphiques", générateur 8) : un seul écran, une seule
 * note — voir `sessionQuelAngle.ts`. Mono-écran : la transition n'est jamais qu'une clôture
 * d'exercice (`terminee` passe à `true`, `nombreExercices` vaut 1). */
export function AppQuelAngle() {
  const [etat, setEtat] = useState<EtatSessionQuelAngle>(sessionInitiale);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  /** Incrémenté à chaque nouvel exercice (« Nouvel exercice » ou « Générer ») — `key` de l'écran,
   * pour qu'il reparte sans choix ni valeur saisie (audit du chapitre 5). */
  const [numeroExercice, setNumeroExercice] = useState(0);
  /** Écrans clos de l'exercice en cours (puces cliquables → fiche en lecture seule). */
  const [historique, setHistorique] = useState<EcranClos[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);

  function viderHistorique() {
    setHistorique([]);
    setFicheOuverteIndex(null);
  }

  function terminerEtape(nouvelEtat: EtatSessionQuelAngle, votreReponse: ReactNode) {
    const transitionDEcran = nouvelEtat.terminee !== etat.terminee;
    if (transitionDEcran) {
      const resultat = nouvelEtat.resultats[nouvelEtat.resultats.length - 1]!;
      setHistorique((h) => [...h, ecranClos("Solutions", votreReponse, resultat.revele, etat.aideUtilisee, reponseAttendueEcran(), corrigeDetailleEcranCourant())]);
      setEnAttente({ etatSuivant: nouvelEtat, revele: resultat.revele });
      return;
    }
    setEtat(nouvelEtat);
  }

  function passerEcranSuivant() {
    if (!enAttente) return;
    if (enAttente.etatSuivant.terminee) viderHistorique();
    setEtat(enAttente.etatSuivant.terminee ? nouvelleSession() : enAttente.etatSuivant);
    setEnAttente(null);
    setNumeroExercice((n) => n + 1);
  }

  const exercice = etat.exerciceCourant;

  function onGenererDev(varianteId: string) {
    setEnAttente(null);
    viderHistorique();
    setEtat(demarrerSessionQuelAngle(REGLAGES_DEMO, () => construireAvecVarianteId(varianteId as IdVarianteQuelAngle)));
    setNumeroExercice((n) => n + 1);
  }

  function reponseAttendueEcran() {
    return (
      <span className="equation-box-termes">
        {formatTermesSolutionsLatex(exercice).map((terme, i) => (
          <Katex key={i} expression={terme} />
        ))}
      </span>
    );
  }

  /** Corrigé détaillé « comme au tableau » de l'écran (mêmes lignes que le papier) — UNE seule source
   * pour la validation (après la réponse) et pour l'entrée d'historique (fiche de la puce). */
  function corrigeDetailleEcranCourant() {
    return <CorrigeDetailleEcran etapes={lignesDeLEtape(correctionDetailleeQuelAngle(exercice), "a")} />;
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
        <h1 className="app-title">Trouver l'angle connaissant sin, cos ou tan</h1>
        <p className="app-subtitle">Chapitre 5</p>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={onGenererDev} />
      </header>

      <main className="card">
        <ProgressionPuces segments={segmentsDepuisHistorique(historique, 1, !enAttente)} onSegmentClick={(index) => setFicheOuverteIndex(index)} />
        <div className="card-body">
          <EnTeteExercice consigneGenerale={CONSIGNE_GENERALE} blocDonnees={null} />
          <EtapeQuelAngle
            key={numeroExercice}
            exercice={exercice}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            aideActivee={etat.aideUtilisee}
            onActiverAide={() => setEtat(activerAide(etat))}
            onValider={(reponse) => terminerEtape(soumettreReponse(etat, reponse), reponseQuelAngleAffichee(reponse))}
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
