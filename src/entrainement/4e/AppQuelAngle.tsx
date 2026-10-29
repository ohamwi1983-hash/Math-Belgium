import { useState } from "react";
import type { ReglagesSession } from "./core/session.types";
import { activerAide, demarrerSessionQuelAngle, soumettreReponse } from "./moteur/sessionQuelAngle";
import type { EtatSessionQuelAngle } from "./moteur/typesQuelAngle";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceQuelAngle } from "./generateurs/quelAngle";
import type { FonctionTrig } from "./core/quelAngle.types";
import { SelecteurVarianteDev } from "./components/SelecteurVarianteDev";
import { EtapeQuelAngle } from "./components/EtapeQuelAngle";
import { Katex } from "./components/Katex";
import { formatTermesSolutionsLatex } from "./ui/formatQuelAngle";
import { EnTeteExercice } from "./components/EnTeteExercice";

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

/** État tenu en attente dès qu'un écran se termine (bonne réponse, ou tentatives épuisées) — l'état
 * de session calculé par le moteur n'est appliqué (`setEtat`) qu'au clic sur le bouton de
 * `ValidationEcran`. */
interface TransitionEnAttente {
  etatSuivant: EtatSessionQuelAngle;
  revele: boolean;
}

/** Pas de `Phase` (comme "Transformations graphiques", générateur 8) : un seul écran, une seule
 * note — voir `sessionQuelAngle.ts`. Mono-écran : la transition n'est jamais qu'une clôture
 * d'exercice (`terminee` passe à `true`, `nombreExercices` vaut 1). */
export function AppQuelAngle() {
  const [etat, setEtat] = useState<EtatSessionQuelAngle>(nouvelleSession);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  /** Incrémenté à chaque nouvel exercice (« Nouvel exercice » ou « Générer ») — `key` de l'écran,
   * pour qu'il reparte sans choix ni valeur saisie (audit du chapitre 5). */
  const [numeroExercice, setNumeroExercice] = useState(0);

  function terminerEtape(nouvelEtat: EtatSessionQuelAngle) {
    const transitionDEcran = nouvelEtat.terminee !== etat.terminee;
    if (transitionDEcran) {
      const resultat = nouvelEtat.resultats[nouvelEtat.resultats.length - 1]!;
      setEnAttente({ etatSuivant: nouvelEtat, revele: resultat.revele });
      return;
    }
    setEtat(nouvelEtat);
  }

  function passerEcranSuivant() {
    if (!enAttente) return;
    setEtat(enAttente.etatSuivant.terminee ? nouvelleSession() : enAttente.etatSuivant);
    setEnAttente(null);
    setNumeroExercice((n) => n + 1);
  }

  const exercice = etat.exerciceCourant;

  function onGenererDev(varianteId: string) {
    setEnAttente(null);
    setEtat(demarrerSessionQuelAngle(REGLAGES_DEMO, () => construireAvecVarianteId(varianteId as FonctionTrig)));
    setNumeroExercice((n) => n + 1);
  }

  const validation = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue: (
          <span className="equation-box-termes">
            {formatTermesSolutionsLatex(exercice).map((terme, i) => (
              <Katex key={i} expression={terme} />
            ))}
          </span>
        ),
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
        <div className="card-body">
          <EnTeteExercice consigneGenerale={CONSIGNE_GENERALE} blocDonnees={null} />
          <EtapeQuelAngle
            key={numeroExercice}
            exercice={exercice}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            aideActivee={etat.aideUtilisee}
            onActiverAide={() => setEtat(activerAide(etat))}
            onValider={(reponse) => terminerEtape(soumettreReponse(etat, reponse))}
            validation={validation}
          />
        </div>
      </main>
    </div>
  );
}
