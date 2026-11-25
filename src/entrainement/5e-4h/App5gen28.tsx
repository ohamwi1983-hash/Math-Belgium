import { useState } from "react";
import type { ReactNode } from "react";
import type { ReglagesSession5e } from "./core5e/session5e.types";
import type { ExerciceTangente } from "./core5e/tangentes.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceTangente, genererExerciceTangenteLibre } from "./generateurs5e/tangentes/index";
import { SelecteurVarianteDev } from "./components5e/SelecteurVarianteDev";
import { consigneGenerale, formatReponseAttenduePhaseLatex, formatTermesDonneesLatex, labelTangenteEquiv, PLACEHOLDER_EQUATION_TANGENTE, questionSpecifiqueEcran } from "./ui5e/formatTangentes";
import { activerAideSuivante, demarrerSessionTangentes, niveauAideMaxTangentes, soumettreReponseTangente } from "./moteur5e/sessionTangentes";
import type { EcranTangente, EtatSessionTangente } from "./moteur5e/typesTangentes";
import { ordreEcransTangente } from "./moteur5e/typesTangentes";
import { refusSaisieTangente } from "./moteur5e/verificationTangentesLotC";
import type { ReponseTangente } from "./moteur5e/verificationTangentesLotC";
import { aidesTangente, cibleTangente } from "./ui5e/retoursTangentes";
import { EcranTangente as EcranTangenteGenerique } from "./components5e/EcranTangente";
import type { DispositionTangente } from "./components5e/EcranTangente";
import { EnTeteExercice } from "./components5e/EnTeteExercice";
import { calculerRecapitulatifTangentes } from "./ui5e/recapitulatifTangentes";
import { RecapitulatifPanel } from "./components5e/RecapitulatifPanel";
import type { EtatPuceProgression } from "../components/ProgressionPuces";
import { ProgressionPuces } from "../components/ProgressionPuces";
import type { EntreeHistoriqueEtape } from "../components/FicheReponseEcran";
import { FicheReponseEcran } from "../components/FicheReponseEcran";
import { Katex } from "./components/Katex";
import type { ValidationEtapeProps } from "../components/ValidationEcran";
import { genererAvecCode, lireCodeDepuisUrl } from "../export/codeExercice";
import { correctionDetailleeTangente, lettreEtapeTangente } from "./generateurs5e/tangentes/corrigeDetaille";
import { CorrigeDetailleEcran } from "../components/CorrigeDetailleEcran";
import { lignesDeLEtape } from "../export/corrigeTableau";

const REGLAGES_DEMO: ReglagesSession5e = { nombreExercices: 1, tentativesMax: 3 };

/** Option « f′ donnée / à calculer » de l'écran (lot C, question 3 ; défaut : à calculer, comme le
 * papier). Un `?code=` garde l'option de l'exercice imprimé. */
type ModeDerivee = "calculer" | "donnee";

function avecMode(e: ExerciceTangente, mode: ModeDerivee): ExerciceTangente {
  return e.variante === "doubleTangence" ? e : { ...e, deriveeDonnee: mode === "donnee" };
}

function nouvelleSession(mode: ModeDerivee): EtatSessionTangente {
  return demarrerSessionTangentes(REGLAGES_DEMO, () => avecMode(genererExerciceTangenteLibre(), mode));
}

function sessionInitiale(): EtatSessionTangente {
  const code = lireCodeDepuisUrl();
  if (!code) return nouvelleSession("calculer");
  return demarrerSessionTangentes(REGLAGES_DEMO, () => genererAvecCode(code, CATALOGUE_VARIANTES, genererExerciceTangente, (id) => construireAvecVarianteId(id)));
}

function reponseAttendueTangentes(exercice: ExerciceTangente, phase: EcranTangente) {
  return (
    <span className="equation-box-termes">
      {formatReponseAttenduePhaseLatex(exercice, phase).map((frag, i) => (
        <Katex key={i} expression={frag} />
      ))}
    </span>
  );
}

interface TransitionEnAttente {
  etatSuivant: EtatSessionTangente;
  revele: boolean;
}

function calculerSegmentsProgression(etat: EtatSessionTangente, aideParPhase: Partial<Record<EcranTangente, boolean>>): EtatPuceProgression[] {
  return ordreEcransTangente(etat.exerciceCourant).map((ecran) => {
    if (ecran === etat.phase) return "courante";
    const score = etat.scoresPartiels[ecran];
    if (score === undefined) return "a-venir";
    if (etat.revelesPartiels[ecran]) return "revele";
    return aideParPhase[ecran] ? "aide" : "correcte";
  });
}

/** Saisie de l'élève en texte, pour la fiche des puces. */
function texteReponse(r: ReponseTangente, ecran: EcranTangente): string {
  if (r.aucune) return "Aucune solution";
  if (ecran === "coordonnees") return Array.from({ length: r.valeurs.length / 2 }, (_, i) => `(${r.valeurs[2 * i]} ; ${r.valeurs[2 * i + 1]})`).join(" ; ");
  return r.valeurs.join(" ; ");
}

export function App5gen28() {
  const [etat, setEtat] = useState<EtatSessionTangente>(sessionInitiale);
  const [mode, setMode] = useState<ModeDerivee>(() => (etat.exerciceCourant.deriveeDonnee ? "donnee" : "calculer"));
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  /** Consultation en lecture seule des écrans déjà clos — tenu ICI, à part du moteur. */
  const [historique, setHistorique] = useState<EntreeHistoriqueEtape[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);
  /** Niveau d'aide RÉELLEMENT utilisé par écran clos (le niveau du moteur repart à 0 à chaque écran). */
  const [aideParPhase, setAideParPhase] = useState<Partial<Record<EcranTangente, boolean>>>({});
  /** Compteur de génération dans la clé d'écran : les champs repartent vides après « Nouvel exercice ». */
  const [numeroGeneration, setNumeroGeneration] = useState(0);

  function ajouterHistorique(votreReponse: ReactNode, nouvelEtat: EtatSessionTangente) {
    const recap = calculerRecapitulatifTangentes(nouvelEtat);
    const derniere = recap[recap.length - 1];
    if (!derniere) return;
    setHistorique((h) => [
      ...h,
      {
        corrigeDetaille: corrigeDetailleEcranCourant(),
        titre: derniere.libelle,
        votreReponse,
        correcte: !derniere.revele,
        reponseAttendue: derniere.revele ? (derniere.estLatex ? <Katex expression={derniere.valeur} /> : derniere.valeur) : undefined,
      },
    ]);
  }

  function terminerEtape(nouvelEtat: EtatSessionTangente, votreReponse?: ReactNode) {
    const transitionDEcran = nouvelEtat.phase !== etat.phase || nouvelEtat.terminee !== etat.terminee;
    if (transitionDEcran) {
      if (votreReponse !== undefined) ajouterHistorique(votreReponse, nouvelEtat);
      if (etat.niveauAide > 0) setAideParPhase((m) => ({ ...m, [etat.phase]: true }));
      setEnAttente({ etatSuivant: nouvelEtat, revele: nouvelEtat.derniereEtapeRevelee });
      return;
    }
    setEtat(nouvelEtat);
  }

  function repartir(nouvel: EtatSessionTangente) {
    setEnAttente(null);
    setHistorique([]);
    setAideParPhase({});
    setNumeroGeneration((g) => g + 1);
    setEtat(nouvel);
  }

  function passerEcranSuivant() {
    if (!enAttente) return;
    if (enAttente.etatSuivant.terminee) repartir(nouvelleSession(mode));
    else {
      setEtat(enAttente.etatSuivant);
      setEnAttente(null);
    }
  }

  function forcerVariante(id: string) {
    repartir(demarrerSessionTangentes(REGLAGES_DEMO, () => avecMode(construireAvecVarianteId(id), mode)));
  }

  function changerMode(m: ModeDerivee) {
    if (m === mode) return;
    setMode(m);
    repartir(nouvelleSession(m));
  }

  const exercice = etat.exerciceCourant;
  const tentativesUtilisees = etat.etapeCourante.tentativesUtilisees;
  const tentativesMax = etat.reglages.tentativesMax;
  const cleEcran = `${numeroGeneration}-${etat.indexExercice}-${etat.phase}`;

  /** Corrigé détaillé « comme au tableau » de l'écran en cours — UNE seule source pour la validation
   * (après la réponse) et pour l'entrée d'historique de l'étape (fiche de sa puce). */
  function corrigeDetailleEcranCourant() {
    return <CorrigeDetailleEcran etapes={lignesDeLEtape(correctionDetailleeTangente(exercice), lettreEtapeTangente(exercice, etat.phase))} />;
  }

  const validation: ValidationEtapeProps | null = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue: reponseAttendueTangentes(exercice, etat.phase),
        corrigeDetaille: corrigeDetailleEcranCourant(),
        labelSuivant: enAttente.etatSuivant.terminee ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
      }
    : null;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">5e — Entraînement</p>
        <h1 className="app-title">Tangentes</h1>
        <p className="app-subtitle">Chapitre 5 — Dérivées et applications</p>
        <div className="options-grid" role="group" aria-label="Dérivée f′">
          <button type="button" className={`btn${mode === "calculer" ? " toggle-active" : ""}`} aria-pressed={mode === "calculer"} onClick={() => changerMode("calculer")}>
            f′ à calculer
          </button>
          <button type="button" className={`btn${mode === "donnee" ? " toggle-active" : ""}`} aria-pressed={mode === "donnee"} onClick={() => changerMode("donnee")}>
            f′ donnée
          </button>
        </div>
        <ProgressionPuces segments={calculerSegmentsProgression(etat, aideParPhase)} onSegmentClick={(index) => setFicheOuverteIndex(index)} />
      </header>
      <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={forcerVariante} />
      <main className="card">
        <div className="card-body">
          <RecapitulatifPanel entrees={calculerRecapitulatifTangentes(etat)} />
          <EcranCourant key={cleEcran} exercice={exercice} etat={etat} tentativesUtilisees={tentativesUtilisees} tentativesMax={tentativesMax} terminerEtape={terminerEtape} setEtat={setEtat} validation={validation} />
        </div>
      </main>

      {ficheOuverteIndex !== null && historique[ficheOuverteIndex] && <FicheReponseEcran entree={historique[ficheOuverteIndex]} onFermer={() => setFicheOuverteIndex(null)} />}
    </div>
  );
}

/** Disposition des champs de chaque écran. */
function disposition(exercice: ExerciceTangente, ecran: EcranTangente): DispositionTangente {
  switch (ecran) {
    case "deriver":
      return { type: "champs", champs: [{ label: "f'(x)=", placeholder: "ex : 6x^2 − 1", apercu: true }] };
    case "substituer": {
      const a = exercice.variante === "pointDonne" ? exercice.a : 0;
      return { type: "champs", champs: [{ label: `f(${a})=`, placeholder: "ex : −0,5" }, { label: `f'(${a})=`, placeholder: "ex : 1,5" }] };
    }
    case "tangente":
      return { type: "champs", champs: [{ label: labelTangenteEquiv(exercice.variante === "pointDonne" ? exercice.a : 0), placeholder: PLACEHOLDER_EQUATION_TANGENTE, apercu: true }] };
    case "tangentesPente":
    case "tangentesContact": {
      const xs = exercice.variante === "pente" ? exercice.racines : exercice.variante === "pointExterieur" ? exercice.contacts : [];
      return { type: "champs", champs: xs.map((x) => ({ label: labelTangenteEquiv(x), placeholder: PLACEHOLDER_EQUATION_TANGENTE, apercu: true })) };
    }
    case "resoudre":
      return { type: "liste", variable: "x", aucune: true };
    case "resoudrePente":
      return { type: "liste", variable: "x" };
    case "abscissesContact":
      return { type: "liste", variable: "t" };
    case "coordonnees":
      return { type: "points" };
    case "condition":
      return { type: "champs", champs: [{ label: "\\text{équation : }", placeholder: "ex : t² − 4t + 3 = 0" }] };
    case "tangenteEnP": {
      const p = exercice.variante === "doubleTangence" ? exercice.p : 0;
      return { type: "champs", champs: [{ label: `f'(${p})=`, placeholder: "ex : 0,5" }, { label: labelTangenteEquiv(p), placeholder: PLACEHOLDER_EQUATION_TANGENTE, apercu: true }] };
    }
    case "trouverQ":
      return { type: "champs", champs: [{ label: "q=", placeholder: "ex : 0,5" }] };
    case "verifierPente":
      return { type: "champs", champs: [{ label: `f'(${exercice.variante === "doubleTangence" ? exercice.q : 0})=`, placeholder: "ex : 0,5" }] };
  }
}

interface EcranProps {
  exercice: ExerciceTangente;
  etat: EtatSessionTangente;
  tentativesUtilisees: number;
  tentativesMax: number;
  terminerEtape: (nouvelEtat: EtatSessionTangente, votreReponse?: ReactNode) => void;
  setEtat: (etat: EtatSessionTangente) => void;
  validation: ValidationEtapeProps | null;
}

function EcranCourant({ exercice, etat, tentativesUtilisees, tentativesMax, terminerEtape, setEtat, validation }: EcranProps) {
  const ecran = etat.phase;
  const q = questionSpecifiqueEcran(exercice, ecran);
  const enTete = (
    <EnTeteExercice
      consigneGenerale={consigneGenerale(exercice)}
      blocDonnees={
        <div className="equation-box equation-box-donnees">
          {formatTermesDonneesLatex(exercice).map((frag, i) => (
            <Katex key={i} expression={frag} />
          ))}
        </div>
      }
    />
  );
  return (
    <EcranTangenteGenerique
      enTete={enTete}
      question={
        <>
          {q.texteAvant} {q.latex && <Katex expression={q.latex} />} {q.texteApres}
        </>
      }
      disposition={disposition(exercice, ecran)}
      avecCalculatrice={ecran === "trouverQ" || ecran === "verifierPente"}
      aides={aidesTangente(exercice, ecran)}
      niveauAide={etat.niveauAide}
      niveauAideMax={niveauAideMaxTangentes()}
      onActiverAide={() => setEtat(activerAideSuivante(etat))}
      tentativesUtilisees={tentativesUtilisees}
      tentativesMax={tentativesMax}
      refus={(r) => refusSaisieTangente(exercice, ecran, r)}
      cible={(r) => cibleTangente(exercice, ecran, r)}
      onValider={(r) => terminerEtape(soumettreReponseTangente(etat, r), texteReponse(r, ecran))}
      validation={validation}
    />
  );
}
