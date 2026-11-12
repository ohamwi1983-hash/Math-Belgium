import { useState } from "react";
import type { ReactNode } from "react";
import type { ReglagesSession5e } from "./core5e/session5e.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceLectureGraphiqueDerivees } from "./generateurs5e/lectureGraphiqueDerivees";
import { SelecteurVarianteDev } from "./components5e/SelecteurVarianteDev";
import {
  activerAideSuivante,
  demarrerSessionLectureGraphiqueDerivees,
  niveauAideMaxLectureGraphiqueDerivees,
  soumettreReponseAsymptotes,
  soumettreReponseExtremums,
  soumettreReponseInflexions,
  soumettreReponseTableauFPrime,
  soumettreReponseTableauFSeconde,
  soumettreReponseZerosFPrime,
} from "./moteur5e/sessionLectureGraphiqueDerivees";
import type { EcranLectureGraphiqueDerivees, EtatSessionLectureGraphiqueDerivees } from "./moteur5e/typesLectureGraphiqueDerivees";
import { ecranSansObjet, ORDRE_ECRANS_LECTURE_GRAPHIQUE_DERIVEES } from "./moteur5e/typesLectureGraphiqueDerivees";
import type { ReponseNommerAsymptotes } from "./moteur5e/typesLectureGraphiqueLimites";
import { tableauFPrimeAttendu, tableauFSecondeAttendu } from "./moteur5e/verificationLectureGraphiqueDerivees";
import type { ReponseListeAbscisses, ReponseTableauEtudeLocale } from "./moteur5e/verificationLectureGraphiqueDerivees";
import type { ExerciceLectureGraphiqueDerivees } from "./core5e/lectureGraphiqueDerivees.types";
import { EtapeAsymptotesLectureGraphiqueDerivees } from "./components5e/EtapeAsymptotesLectureGraphiqueDerivees";
import { EtapeListeAbscissesLectureGraphiqueDerivees } from "./components5e/EtapeListeAbscissesLectureGraphiqueDerivees";
import { EtapeTableauLectureGraphiqueDerivees } from "./components5e/EtapeTableauLectureGraphiqueDerivees";
import { EtapeChampsLectureGraphiqueDerivees } from "./components5e/EtapeChampsLectureGraphiqueDerivees";
import { TableauEtudeLocaleRecap } from "./components5e/TableauEtudeLocaleRecap";
import { RecapitulatifPanel } from "./components5e/RecapitulatifPanel";
import { calculerRecapitulatifLectureGraphiqueDerivees } from "./ui5e/recapitulatifLectureGraphiqueDerivees";
import { Katex } from "./components/Katex";
import type { ValidationEtapeProps } from "../components/ValidationEcran";
import type { EtatPuceProgression } from "../components/ProgressionPuces";
import { ProgressionPuces } from "../components/ProgressionPuces";
import type { EntreeHistoriqueEtape } from "../components/FicheReponseEcran";
import { FicheReponseEcran } from "../components/FicheReponseEcran";
import { formatEnteteColonnesTableauFPrime, formatEnteteColonnesTableauFSeconde, formatReponseAttenduePhaseLatex, LIBELLE_ECRAN_LECTURE_GRAPHIQUE_DERIVEES } from "./ui5e/formatLectureGraphiqueDerivees";
import { LIBELLE_TYPE_ASYMPTOTE } from "./ui5e/formatLectureGraphiqueLimites";
import { genererAvecCode, lireCodeDepuisUrl } from "../export/codeExercice";

const REGLAGES_DEMO: ReglagesSession5e = { nombreExercices: 1, tentativesMax: 3 };

function nouvelleSession(): EtatSessionLectureGraphiqueDerivees {
  return demarrerSessionLectureGraphiqueDerivees(REGLAGES_DEMO, genererExerciceLectureGraphiqueDerivees);
}

/** Première session : si l'URL porte le code d'un exercice imprimé (`?code=XXXXXX`), son PREMIER
 * exercice est cette instance — tirée avec les MÊMES fonctions que l'adaptateur d'export
 * (`generateurs5e/lectureGraphiqueDerivees/exportEvaluation.ts`) ; la suite reste un tirage normal. */
function sessionInitiale(): EtatSessionLectureGraphiqueDerivees {
  const code = lireCodeDepuisUrl();
  if (!code) return nouvelleSession();
  return demarrerSessionLectureGraphiqueDerivees(REGLAGES_DEMO, () => genererAvecCode(code, CATALOGUE_VARIANTES, genererExerciceLectureGraphiqueDerivees, (id) => construireAvecVarianteId(id)));
}

/** Réponse attendue de l'écran qui vient de se terminer. */
function reponseAttenduePhase(exercice: ExerciceLectureGraphiqueDerivees, phase: EcranLectureGraphiqueDerivees): ReactNode {
  if (phase === "tableauFPrime" || phase === "tableauFSeconde") {
    const mode = phase === "tableauFPrime" ? "fprime" : "fseconde";
    const attendu = mode === "fprime" ? tableauFPrimeAttendu(exercice) : tableauFSecondeAttendu(exercice);
    const enteteColonnes = mode === "fprime" ? formatEnteteColonnesTableauFPrime(exercice, attendu.colonnes) : formatEnteteColonnesTableauFSeconde(exercice, attendu.colonnes);
    return <TableauEtudeLocaleRecap colonnes={attendu.colonnes} enteteColonnes={enteteColonnes} mode={mode} attendu={attendu} />;
  }
  return (
    <span className="equation-box-termes">
      {formatReponseAttenduePhaseLatex(exercice, phase).map((frag, i) => (
        <Katex key={i} expression={frag} />
      ))}
    </span>
  );
}

interface TransitionEnAttente {
  etatSuivant: EtatSessionLectureGraphiqueDerivees;
  revele: boolean;
}

/** Puces : 6 écrans pour TOUS les exercices (décision J) ; un écran sans objet n'apparaît comme tel
 * qu'une fois atteint ou dépassé. */
function calculerSegmentsProgression(etat: EtatSessionLectureGraphiqueDerivees, aideParPhase: Partial<Record<EcranLectureGraphiqueDerivees, boolean>>, termine: boolean): EtatPuceProgression[] {
  const indexCourant = ORDRE_ECRANS_LECTURE_GRAPHIQUE_DERIVEES.indexOf(etat.phase);
  return ORDRE_ECRANS_LECTURE_GRAPHIQUE_DERIVEES.map((ecran, i) => {
    if (ecranSansObjet(etat.exerciceCourant, ecran)) return i < indexCourant || termine ? "sans-objet" : "a-venir";
    if (ecran === etat.phase && !termine) return "courante";
    if (etat.scoresPartiels[ecran] === undefined) return "a-venir";
    if (etat.revelesPartiels[ecran]) return "revele";
    return aideParPhase[ecran] ? "aide" : "correcte";
  });
}

function texteTableau(reponse: ReponseTableauEtudeLocale): string {
  const signes = reponse.signes.map((s) => s ?? "?").join(" ");
  const ligne2 = reponse.ligne2.map((v) => v ?? "·").join(" ");
  return `signes : ${signes} ; ligne 2 : ${ligne2}`;
}

function texteListe(reponse: ReponseListeAbscisses): string {
  return reponse.aucun ? "aucun point" : reponse.valeurs.map((v) => `x ≈ ${v}`).join(" ; ");
}

function texteAsymptotes(reponse: ReponseNommerAsymptotes): string {
  if (reponse.aucune) return "aucune asymptote";
  return reponse.lignes.map((l) => `${LIBELLE_TYPE_ASYMPTOTE[l.type].sigle} : ${l.type === "verticale" ? "x" : "y"} = ${l.texte}`).join(" ; ");
}

export function App5gen30() {
  const [etat, setEtat] = useState<EtatSessionLectureGraphiqueDerivees>(sessionInitiale);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  const [historique, setHistorique] = useState<EntreeHistoriqueEtape[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);
  const [aideParPhase, setAideParPhase] = useState<Partial<Record<EcranLectureGraphiqueDerivees, boolean>>>({});
  /** Compteur de générations : entre dans la clé d'écran, donc tout « Générer » repart de champs vides. */
  const [numeroGeneration, setNumeroGeneration] = useState(0);

  function ajouterHistorique(ecran: EcranLectureGraphiqueDerivees, votreReponse: ReactNode, nouvelEtat: EtatSessionLectureGraphiqueDerivees) {
    const revele = nouvelEtat.revelesPartiels[ecran] ?? false;
    setHistorique((h) => [
      ...h,
      {
        titre: LIBELLE_ECRAN_LECTURE_GRAPHIQUE_DERIVEES[ecran],
        votreReponse,
        correcte: !revele,
        reponseAttendue: revele ? reponseAttenduePhase(nouvelEtat.exerciceCourant, ecran) : undefined,
      },
    ]);
  }

  function terminerEtape(nouvelEtat: EtatSessionLectureGraphiqueDerivees, votreReponse?: ReactNode) {
    const transitionDEcran = nouvelEtat.phase !== etat.phase || nouvelEtat.terminee !== etat.terminee;
    if (transitionDEcran) {
      if (votreReponse !== undefined) ajouterHistorique(etat.phase, votreReponse, nouvelEtat);
      if (etat.niveauAide > 0) setAideParPhase((m) => ({ ...m, [etat.phase]: true }));
      setEnAttente({ etatSuivant: nouvelEtat, revele: nouvelEtat.derniereEtapeRevelee });
      return;
    }
    setEtat(nouvelEtat);
  }

  function repartir(nouvelEtat: EtatSessionLectureGraphiqueDerivees) {
    setEnAttente(null);
    setHistorique([]);
    setAideParPhase({});
    setFicheOuverteIndex(null);
    setNumeroGeneration((n) => n + 1);
    setEtat(nouvelEtat);
  }

  function passerEcranSuivant() {
    if (!enAttente) return;
    if (enAttente.etatSuivant.terminee) {
      repartir(nouvelleSession());
      return;
    }
    setEtat(enAttente.etatSuivant);
    setEnAttente(null);
  }

  const exercice = etat.exerciceCourant;
  const tentativesUtilisees = etat.etapeCourante.tentativesUtilisees;
  const tentativesMax = etat.reglages.tentativesMax;
  const cleEcran = `${numeroGeneration}-${etat.indexExercice}-${etat.phase}`;
  // Pendant la validation, les puces montrent déjà l'écran qui vient de se clore.
  const etatPuces = enAttente ? enAttente.etatSuivant : etat;

  const validation = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue: reponseAttenduePhase(exercice, etat.phase),
        labelSuivant: enAttente.etatSuivant.terminee ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
      }
    : null;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">5e — Entraînement</p>
        <h1 className="app-title">Lecture graphique — dérivées et applications</h1>
        <p className="app-subtitle">Chapitre 5 — Dérivées et applications</p>
        <ProgressionPuces segments={calculerSegmentsProgression(etatPuces, aideParPhase, etatPuces.terminee)} onSegmentClick={(index) => setFicheOuverteIndex(index)} />
      </header>
      <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={(id) => repartir(demarrerSessionLectureGraphiqueDerivees(REGLAGES_DEMO, () => construireAvecVarianteId(id)))} />
      <main className="card">
        <div className="card-body">
          <RecapitulatifPanel entrees={calculerRecapitulatifLectureGraphiqueDerivees(etat)} />
          <EcranCourant
            exercice={exercice}
            phase={etat.phase}
            etat={etat}
            tentativesUtilisees={tentativesUtilisees}
            tentativesMax={tentativesMax}
            cleEcran={cleEcran}
            terminerEtape={terminerEtape}
            setEtat={setEtat}
            validation={validation}
          />
        </div>
      </main>

      {ficheOuverteIndex !== null && historiquePourPuce(historique, etatPuces, ficheOuverteIndex) && (
        <FicheReponseEcran entree={historiquePourPuce(historique, etatPuces, ficheOuverteIndex) as EntreeHistoriqueEtape} onFermer={() => setFicheOuverteIndex(null)} />
      )}
    </div>
  );
}

/** Les puces suivent l'ordre FIXE (écrans sans objet compris) ; l'historique ne contient que les
 * écrans réellement parcourus : décalage à compenser. */
function historiquePourPuce(historique: EntreeHistoriqueEtape[], etat: EtatSessionLectureGraphiqueDerivees, indexPuce: number): EntreeHistoriqueEtape | undefined {
  const ecran = ORDRE_ECRANS_LECTURE_GRAPHIQUE_DERIVEES[indexPuce];
  if (ecranSansObjet(etat.exerciceCourant, ecran)) return undefined;
  const avant = ORDRE_ECRANS_LECTURE_GRAPHIQUE_DERIVEES.slice(0, indexPuce).filter((e) => !ecranSansObjet(etat.exerciceCourant, e)).length;
  return historique[avant];
}

interface EcranProps {
  exercice: ExerciceLectureGraphiqueDerivees;
  phase: EcranLectureGraphiqueDerivees;
  etat: EtatSessionLectureGraphiqueDerivees;
  tentativesUtilisees: number;
  tentativesMax: number;
  cleEcran: string;
  terminerEtape: (nouvelEtat: EtatSessionLectureGraphiqueDerivees, votreReponse?: ReactNode) => void;
  setEtat: (etat: EtatSessionLectureGraphiqueDerivees) => void;
  validation: ValidationEtapeProps | null;
}

function EcranCourant({ exercice, phase, etat, tentativesUtilisees, tentativesMax, cleEcran, terminerEtape, setEtat, validation }: EcranProps) {
  const niveauAideMax = niveauAideMaxLectureGraphiqueDerivees();
  const onActiverAide = () => setEtat(activerAideSuivante(etat));
  const communs = { exercice, tentativesUtilisees, niveauAide: etat.niveauAide, niveauAideMax, onActiverAide, validation };

  switch (phase) {
    case "asymptotes":
      return <EtapeAsymptotesLectureGraphiqueDerivees key={cleEcran} {...communs} tentativesMax={tentativesMax} onValider={(r) => terminerEtape(soumettreReponseAsymptotes(etat, r), texteAsymptotes(r))} />;
    case "zerosFPrime":
      return <EtapeListeAbscissesLectureGraphiqueDerivees key={cleEcran} {...communs} ecran="zerosFPrime" tentativesMax={tentativesMax} onValider={(r) => terminerEtape(soumettreReponseZerosFPrime(etat, r), texteListe(r))} />;
    case "tableauFPrime":
      return <EtapeTableauLectureGraphiqueDerivees key={cleEcran} {...communs} phase="tableauFPrime" onValider={(r) => terminerEtape(soumettreReponseTableauFPrime(etat, r), texteTableau(r))} />;
    case "extremums":
      return <EtapeChampsLectureGraphiqueDerivees key={cleEcran} {...communs} tentativesMax={tentativesMax} onValider={(r) => terminerEtape(soumettreReponseExtremums(etat, r), r.join(" ; "))} />;
    case "inflexions":
      return <EtapeListeAbscissesLectureGraphiqueDerivees key={cleEcran} {...communs} ecran="inflexions" tentativesMax={tentativesMax} onValider={(r) => terminerEtape(soumettreReponseInflexions(etat, r), texteListe(r))} />;
    case "tableauFSeconde":
      return <EtapeTableauLectureGraphiqueDerivees key={cleEcran} {...communs} phase="tableauFSeconde" onValider={(r) => terminerEtape(soumettreReponseTableauFSeconde(etat, r), texteTableau(r))} />;
  }
}
