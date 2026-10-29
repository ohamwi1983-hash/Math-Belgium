import { useState, type ReactNode } from "react";
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
  soumettreReponsePossibiliteCoefficients,
} from "./moteur/sessionEquationDroite";
import type { EtatSessionEquationDroite, PhaseEquationDroite, ReponseCoefficients, ReponsePossibiliteCoefficients } from "./moteur/typesEquationDroite";
import type { ReponseExtraction } from "./moteur/verificationEquationDroite";
import { EtapeCoefficientsEquationDroite } from "./components/EtapeCoefficientsEquationDroite";
import { EtapeExtractionEquationDroite } from "./components/EtapeExtractionEquationDroite";
import { EtapePossibiliteCoefficientsEquationDroite } from "./components/EtapePossibiliteCoefficientsEquationDroite";
import {
  formatAideCoefficientsNiveau2Latex,
  formatEquationExpliciteXLatex,
  formatEquationExpliciteYLatex,
  formatEquationImpliciteLatex,
  formatEtatActuelPointVecteurLatex,
  formatPointLatex,
  formatValeurGenereeLatex,
  formatVecteurLatex,
} from "./ui/formatEquationDroite";
import { Katex } from "./components/Katex";
import { RecapitulatifPanel } from "./components/RecapitulatifPanel";
import { calculerRecapitulatifEquationDroite } from "./ui/recapitulatifEquationDroite";
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

function nouvelleSession(): EtatSessionEquationDroite {
  return demarrerSessionEquationDroite(REGLAGES_DEMO, genererExerciceEquationDroite);
}

/** Révélation de l'équation — toujours la vraie référence de l'exercice (`refExpliciteY`/
 * `refExpliciteX`/`referenceImplicite`/le système paramétrique complet), jamais la saisie de
 * l'élève. Réutilisée pour l'écran "coefficients" (formes "implicite"/"parametrique") et pour
 * l'écran fusionné (formes explicite_y/explicite_x, `promptgen42modificationsv2.md` partie A) : le
 * repli final (forme implicite) couvre le cas `!exercice.possible`, seule réponse valide attendue
 * dans ce cas. Paramétrique : les équations elles-mêmes (ce que l'écran demande), plus le seul
 * point + vecteur. */
function revelationCoefficients(exercice: ExerciceEquationDroite) {
  const forme = exercice.formeCible;
  if (forme === "parametrique") {
    return <Katex expression={formatAideCoefficientsNiveau2Latex(exercice)} />;
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

/** Séquence dépendant de `formeCible` — 2 chemins DISJOINTS (voir `typesEquationDroite.ts`,
 * `PhaseEquationDroite`). La dernière phase de chaque chemin n'est jamais consultée comme phase
 * passée (un nouvel exercice redémarre juste après) : seule "extraction" a une branche "close". */
function sequencePourExercice(exercice: ExerciceEquationDroite): PhaseEquationDroite[] {
  if (exercice.formeCible === "parametrique" || exercice.formeCible === "implicite") return ["extraction", "coefficients"];
  return ["extraction", "possibiliteCoefficients"];
}

function calculerSegmentsProgression(etat: EtatSessionEquationDroite): EtatPuceProgression[] {
  const sequence = sequencePourExercice(etat.exerciceCourant);
  const indexCourant = sequence.indexOf(etat.phase);
  return sequence.map((_phase, index) => {
    if (index === indexCourant) return "courante";
    if (index > indexCourant) return "a-venir";
    if (etat.extractionRevele) return "revele";
    return etat.niveauAideExtraction > 0 ? "aide" : "correcte";
  });
}

const TITRES_ECRANS: Record<PhaseEquationDroite, string> = {
  extraction: "Point et vecteur directeur",
  coefficients: "Équation",
  possibiliteCoefficients: "Forme demandée et équation",
};

/** Nombre saisi (déjà lu par l'écran) — « ? » s'il était illisible. */
function nombreSaisiLatex(valeur: number): string {
  return Number.isFinite(valeur) ? formatValeurGenereeLatex(valeur) : "?";
}

function saisieExtraction(reponse: ReponseExtraction): ReactNode {
  const point = { x: reponse.x0, y: reponse.y0 };
  const vecteur = { x: reponse.a, y: reponse.b };
  const lisibles = [reponse.x0, reponse.y0, reponse.a, reponse.b].every(Number.isFinite);
  if (!lisibles) {
    const valeurs = [reponse.x0, reponse.y0, reponse.a, reponse.b].map(nombreSaisiLatex);
    return <Katex expression={`(${valeurs[0]} ; ${valeurs[1]}) \\quad \\vec{u}\\,(${valeurs[2]} ; ${valeurs[3]})`} />;
  }
  return <Katex expression={`\\displaystyle ${formatPointLatex(point)} \\quad \\vec{u}${formatVecteurLatex(vecteur)}`} />;
}

/** Saisie libre de l'élève, telle quelle (jamais réinterprétée) — champ vide affiché « — ». */
function saisieBrute(texte: string): string {
  return texte.trim() === "" ? "—" : texte;
}

function saisieCoefficients(reponse: ReponseCoefficients): ReactNode {
  if ("texteX" in reponse) return `${saisieBrute(reponse.texteX)} ; ${saisieBrute(reponse.texteY)}`;
  if ("c" in reponse) return <Katex expression={`a = ${nombreSaisiLatex(reponse.a)}, \\; b = ${nombreSaisiLatex(reponse.b)}, \\; c = ${nombreSaisiLatex(reponse.c)}`} />;
  return "—";
}

function saisiePossibiliteCoefficients(reponse: ReponsePossibiliteCoefficients): ReactNode {
  return `${reponse.choix === "possible" ? "Possible" : "Impossible"} — ${saisieBrute(reponse.texte)}`;
}

/** Réponse attendue de l'écran `phase` — VALEUR seule : `ValidationEcran` et `FicheReponseEcran`
 * affichent déjà eux-mêmes le libellé « Réponse attendue » (jamais « Coefficients attendus : » en
 * double — audit chapitre 7, point 5). */
function construireReponseAttendue(exercice: ExerciceEquationDroite, phase: PhaseEquationDroite): ReactNode {
  if (phase === "extraction") return <Katex expression={`\\displaystyle ${formatEtatActuelPointVecteurLatex(exercice)}`} />;
  if (phase === "coefficients") return revelationCoefficients(exercice);
  return (
    <>
      {exercice.possible ? "Possible" : "Impossible"} : {revelationCoefficients(exercice)}
    </>
  );
}

export function AppEquationDroite() {
  const [etat, setEtat] = useState<EtatSessionEquationDroite>(nouvelleSession);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  /** Consultation en lecture seule des écrans clos (puces cliquables) — un écran clos = une
   * entrée, dans l'ordre de `sequencePourExercice` (même index que sa puce). */
  const [historique, setHistorique] = useState<EntreeHistoriqueEtape[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);
  /** Incrémenté à chaque nouvel exercice : entre dans la `key` des écrans pour qu'aucune saisie de
   * l'exercice précédent ne survive à « Générer » ou à « Nouvel exercice » (audit chapitre 7,
   * point 2). */
  const [numeroExercice, setNumeroExercice] = useState(0);

  function terminerEtape(nouvelEtat: EtatSessionEquationDroite, votreReponse: ReactNode) {
    const transitionDEcran = nouvelEtat.phase !== etat.phase || nouvelEtat.terminee !== etat.terminee;
    if (transitionDEcran) {
      const revele =
        etat.phase === "extraction"
          ? nouvelEtat.extractionRevele
          : etat.phase === "coefficients"
            ? nouvelEtat.resultats[nouvelEtat.resultats.length - 1]!.coefficientsRevele
            : nouvelEtat.resultats[nouvelEtat.resultats.length - 1]!.possibiliteCoefficientsRevele;
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

  const exercice = etat.exerciceCourant;
  const phase = etat.phase;
  const recapitulatif = calculerRecapitulatifEquationDroite(etat);

  function onGenererDev(varianteId: string) {
    setEnAttente(null);
    reinitialiserHistorique();
    setEtat(demarrerSessionEquationDroite(REGLAGES_DEMO, () => construireAvecVarianteId(varianteId as TypeDonneeEntree)));
  }

  const validation = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue: etat.reglages.affichageReponseApresEchec ? construireReponseAttendue(exercice, phase) : undefined,
        labelSuivant: enAttente.etatSuivant.terminee ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
      }
    : null;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">4e — Entraînement</p>
        <h1 className="app-title">Équation d'une droite</h1>
        <p className="app-subtitle">Chapitre 7 — Géométrie analytique plane</p>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={onGenererDev} />
        <ProgressionPuces segments={calculerSegmentsProgression(etat)} onSegmentClick={(index) => setFicheOuverteIndex(index)} />
      </header>

      <main className="card">
        <div className="card-body">
        <RecapitulatifPanel entrees={recapitulatif} />
        {phase === "extraction" ? (
          <EtapeExtractionEquationDroite
            key={`${numeroExercice}-${phase}`}
            exercice={exercice}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAideExtraction}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(reponse) => terminerEtape(soumettreReponseExtraction(etat, reponse), saisieExtraction(reponse))}
            validation={validation}
          />
        ) : phase === "possibiliteCoefficients" ? (
          <EtapePossibiliteCoefficientsEquationDroite
            key={`${numeroExercice}-${phase}`}
            exercice={exercice}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAidePossibiliteCoefficients}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(reponse) => terminerEtape(soumettreReponsePossibiliteCoefficients(etat, reponse), saisiePossibiliteCoefficients(reponse))}
            validation={validation}
          />
        ) : (
          <EtapeCoefficientsEquationDroite
            key={`${numeroExercice}-${phase}`}
            exercice={exercice}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAideCoefficients}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(reponse) => terminerEtape(soumettreReponseCoefficients(etat, reponse), saisieCoefficients(reponse))}
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
