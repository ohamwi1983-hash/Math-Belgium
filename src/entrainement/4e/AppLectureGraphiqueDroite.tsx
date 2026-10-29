import { useState } from "react";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceLectureGraphiqueDroite } from "./generateurs/lectureGraphiqueDroite";
import type { VarianteLectureGraphiqueDroite } from "./core/lectureGraphiqueDroite.types";
import type { ReglagesSession } from "./core/session.types";
import { SelecteurVarianteDev } from "./components/SelecteurVarianteDev";
import {
  activerAideSuivante,
  demarrerSessionLectureGraphiqueDroite,
  soumettreReponseCartesienne,
  soumettreReponseParametrique,
} from "./moteur/sessionLectureGraphiqueDroite";
import type { EtatSessionLectureGraphiqueDroite } from "./moteur/typesLectureGraphiqueDroite";
import { EtapeLectureCartesienne } from "./components/EtapeLectureCartesienne";
import { EtapeLectureParametrique } from "./components/EtapeLectureParametrique";
import { Katex } from "./components/Katex";
import { formatReponseAttendueLatex } from "./ui/formatLectureGraphiqueDroite";

const REGLAGES_DEMO: ReglagesSession = {
  nombreExercices: 1,
  tentativesMax: 3,
  affichageReponseApresEchec: true,
  affichageExplication: true,
};

function nouvelleSession(): EtatSessionLectureGraphiqueDroite {
  return demarrerSessionLectureGraphiqueDroite(REGLAGES_DEMO, genererExerciceLectureGraphiqueDroite);
}

/** État tenu en attente dès qu'un écran se termine (bonne réponse, ou tentatives épuisées) — l'état
 * de session calculé par le moteur n'est appliqué (`setEtat`) qu'au clic sur le bouton de
 * `ValidationEcran`, jamais immédiatement (convention CLAUDE.md, "validation/invalidation avant de
 * passer à l'écran suivant"). */
interface TransitionEnAttente {
  etatSuivant: EtatSessionLectureGraphiqueDroite;
  revele: boolean;
}

/** Pas de `Phase` (comme "Quel angle ?"/"Transformations graphiques") : un seul écran par exercice,
 * déterminé directement par `exerciceCourant.variante`. Mono-écran : la transition n'est jamais
 * qu'une clôture d'exercice (`terminee` passe à `true`, `nombreExercices` vaut 1). */
export function AppLectureGraphiqueDroite() {
  const [etat, setEtat] = useState<EtatSessionLectureGraphiqueDroite>(nouvelleSession);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  /** Incrémenté à chaque nouvel exercice : entre dans la `key` de l'écran pour qu'aucune saisie de
   * l'exercice précédent ne survive à « Générer » ou à « Nouvel exercice » (audit chapitre 7,
   * point 2). */
  const [numeroExercice, setNumeroExercice] = useState(0);

  function terminerEtape(nouvelEtat: EtatSessionLectureGraphiqueDroite) {
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
    if (enAttente.etatSuivant.terminee) setNumeroExercice((n) => n + 1);
    setEtat(enAttente.etatSuivant.terminee ? nouvelleSession() : enAttente.etatSuivant);
    setEnAttente(null);
  }

  const exercice = etat.exerciceCourant;

  // Mono-écran (voir commentaire plus haut) : chaque exercice n'a qu'un seul écran, qui est donc
  // toujours son premier (et unique) écran.

  function onGenererDev(varianteId: string) {
    setEnAttente(null);
    setNumeroExercice((n) => n + 1);
    setEtat(demarrerSessionLectureGraphiqueDroite(REGLAGES_DEMO, () => construireAvecVarianteId(varianteId as VarianteLectureGraphiqueDroite)));
  }

  const validation = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue: <Katex expression={formatReponseAttendueLatex(exercice)} />,
        labelSuivant: enAttente.etatSuivant.terminee ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
      }
    : null;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">4e — Entraînement</p>
        <h1 className="app-title">Lecture graphique — équation d'une droite</h1>
        <p className="app-subtitle">Chapitre 7 — Géométrie analytique plane</p>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={onGenererDev} />
      </header>

      <main className="card">
        <div className="card-body">
        {exercice.variante === "cartesienne" ? (
          <EtapeLectureCartesienne
            key={`${numeroExercice}-cartesienne`}
            exercice={exercice}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAide}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(texte) => terminerEtape(soumettreReponseCartesienne(etat, texte))}
            validation={validation}
          />
        ) : (
          <EtapeLectureParametrique
            key={`${numeroExercice}-parametrique`}
            exercice={exercice}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAide}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(reponse) => terminerEtape(soumettreReponseParametrique(etat, reponse))}
            validation={validation}
          />
        )}
        </div>
      </main>
    </div>
  );
}
