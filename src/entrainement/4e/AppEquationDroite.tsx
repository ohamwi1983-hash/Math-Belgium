import { useState } from "react";
import type { ExerciceEquationDroite } from "./core/equationDroite.types";
import type { ReglagesSession } from "./core/session.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceEquationDroite } from "./generateurs/equationDroite";
import type { TypeDonneeEntree } from "./core/equationDroite.types";
import { SelecteurVarianteDev } from "./components/SelecteurVarianteDev";
import {
  activerAideSuivante,
  demarrerSessionEquationDroite,
  soumettreReponseCoefficients,
  soumettreReponseExtraction,
  soumettreReponsePossibilite,
  soumettreReponsePossibiliteCoefficients,
} from "./moteur/sessionEquationDroite";
import type { EtatSessionEquationDroite, PhaseEquationDroite } from "./moteur/typesEquationDroite";
import { EtapeCoefficientsEquationDroite } from "./components/EtapeCoefficientsEquationDroite";
import { EtapeExtractionEquationDroite } from "./components/EtapeExtractionEquationDroite";
import { EtapePossibiliteEquationDroite } from "./components/EtapePossibiliteEquationDroite";
import { EtapePossibiliteCoefficientsEquationDroite } from "./components/EtapePossibiliteCoefficientsEquationDroite";
import {
  LATEX_GABARIT_FORME,
  formatAideCoefficientsNiveau2Latex,
  formatEquationExpliciteXLatex,
  formatEquationExpliciteYLatex,
  formatEquationImpliciteLatex,
  formatEtatActuelPointVecteurLatex,
} from "./ui/formatEquationDroite";
import { Katex } from "./components/Katex";

const REGLAGES_DEMO: ReglagesSession = {
  nombreExercices: 1,
  tentativesMax: 3,
  penaliteActivee: true,
  affichageReponseApresEchec: true,
  affichageExplication: true,
};

function nouvelleSession(): EtatSessionEquationDroite {
  return demarrerSessionEquationDroite(REGLAGES_DEMO, genererExerciceEquationDroite);
}

/** Révélation des coefficients — toujours la vraie référence de l'exercice (`refExpliciteY`/
 * `refExpliciteX`/`referenceImplicite`/le point+vecteur pour paramétrique), jamais la saisie de
 * l'élève. Réutilisée à la fois pour l'ancienne révélation "Coefficients attendus" (formes
 * "implicite"/"parametrique") et pour la révélation de l'écran fusionné (formes explicite_y/
 * explicite_x, `promptgen42modificationsv2.md` partie A) : le repli final (forme implicite) couvre
 * le cas `!exercice.possible`, seule réponse valide attendue dans ce cas. */
function revelationCoefficients(exercice: ExerciceEquationDroite) {
  const forme = exercice.formeCible;
  if (forme === "parametrique") {
    return <Katex expression={formatEtatActuelPointVecteurLatex(exercice)} />;
  }
  if (forme === "implicite") {
    const { a, b, c } = exercice.referenceImplicite;
    return <Katex expression={formatEquationImpliciteLatex(a, b, c)} />;
  }
  if (forme === "explicite_y" && exercice.refExpliciteY !== null) {
    const { m, p } = exercice.refExpliciteY;
    return <Katex expression={formatEquationExpliciteYLatex(m, p)} />;
  }
  if (forme === "explicite_x" && exercice.refExpliciteX !== null) {
    const { n, q } = exercice.refExpliciteX;
    return <Katex expression={formatEquationExpliciteXLatex(n, q)} />;
  }
  // Forme demandée structurellement impossible pour cette instance (`!exercice.possible`) — repli
  // sur la forme implicite, toujours calculable, seule réponse valide attendue dans ce cas.
  const { a, b, c } = exercice.referenceImplicite;
  return <Katex expression={formatEquationImpliciteLatex(a, b, c)} />;
}

/** État tenu en attente dès qu'un écran se termine (bonne réponse, ou tentatives épuisées) — l'état
 * de session calculé par le moteur n'est appliqué (`setEtat`) qu'au clic sur le bouton de
 * `ValidationEcran`, jamais immédiatement (convention CLAUDE.md, "validation/invalidation avant de
 * passer à l'écran suivant"). */
interface TransitionEnAttente {
  etatSuivant: EtatSessionEquationDroite;
  revele: boolean;
}

const LIBELLE_PHASE: Record<PhaseEquationDroite, string> = {
  extraction: "Extraction",
  possibilite: "Possibilité de la forme",
  coefficients: "Coefficients",
  possibiliteCoefficients: "Possibilité et équation",
};

export function AppEquationDroite() {
  const [etat, setEtat] = useState<EtatSessionEquationDroite>(nouvelleSession);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);

  function terminerEtape(nouvelEtat: EtatSessionEquationDroite) {
    const transitionDEcran = nouvelEtat.phase !== etat.phase || nouvelEtat.terminee !== etat.terminee;
    if (transitionDEcran) {
      const revele =
        etat.phase === "extraction"
          ? nouvelEtat.extractionRevele
          : etat.phase === "possibilite"
            ? nouvelEtat.possibiliteRevele
            : etat.phase === "coefficients"
              ? nouvelEtat.resultats[nouvelEtat.resultats.length - 1]!.coefficientsRevele
              : nouvelEtat.resultats[nouvelEtat.resultats.length - 1]!.possibiliteCoefficientsRevele;
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

  const exercice = etat.exerciceCourant;

  function onGenererDev(varianteId: string) {
    setEnAttente(null);
    setEtat(demarrerSessionEquationDroite(REGLAGES_DEMO, () => construireAvecVarianteId(varianteId as TypeDonneeEntree)));
  }

  const validation = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue: !etat.reglages.affichageReponseApresEchec
          ? undefined
          : etat.phase === "extraction" ? (
              <>
                Point/vecteur attendus : <Katex expression={formatEtatActuelPointVecteurLatex(exercice)} />
              </>
            ) : etat.phase === "possibilite" ? (
              <>
                Réponse attendue : {exercice.possible ? "Possible" : "Impossible"} — gabarit :{" "}
                <Katex expression={LATEX_GABARIT_FORME[exercice.formeCible]} />
              </>
            ) : etat.phase === "coefficients" ? (
              <>
                Coefficients attendus : {revelationCoefficients(exercice)}
                <br />
                Méthode : <Katex expression={formatAideCoefficientsNiveau2Latex(exercice)} />
              </>
            ) : (
              <>
                Réponse attendue : {exercice.possible ? "Possible" : "Impossible"} — équation : {revelationCoefficients(exercice)}
              </>
            ),
        labelSuivant: enAttente.etatSuivant.terminee ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
      }
    : null;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">4e — Entraînement</p>
        <h1 className="app-title">Équation d'une droite</h1>
        <p className="app-subtitle">Chapitre 6 — Géométrie analytique</p>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={onGenererDev} />
        <div className="card-progress">
          <div className="card-progress-row">
            <span className="card-progress-phase">{LIBELLE_PHASE[etat.phase]}</span>
          </div>
        </div>
      </header>

      <main className="card">
        <div className="card-body">
        {etat.phase === "extraction" ? (
          <EtapeExtractionEquationDroite
            exercice={exercice}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAideExtraction}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(reponse) => terminerEtape(soumettreReponseExtraction(etat, reponse))}
            validation={validation}
          />
        ) : etat.phase === "possibilite" ? (
          <EtapePossibiliteEquationDroite
            exercice={exercice}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            onValider={(reponse) => terminerEtape(soumettreReponsePossibilite(etat, reponse))}
            validation={validation}
          />
        ) : etat.phase === "possibiliteCoefficients" ? (
          <EtapePossibiliteCoefficientsEquationDroite
            exercice={exercice}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAidePossibiliteCoefficients}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(reponse) => terminerEtape(soumettreReponsePossibiliteCoefficients(etat, reponse))}
            validation={validation}
          />
        ) : (
          <EtapeCoefficientsEquationDroite
            exercice={exercice}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAideCoefficients}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(reponse) => terminerEtape(soumettreReponseCoefficients(etat, reponse))}
            validation={validation}
          />
        )}
        </div>
      </main>
    </div>
  );
}
