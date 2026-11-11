import { useState } from "react";
import type { ReactNode } from "react";
import type { ReglagesSession } from "./core/session.types";
import {
  activerAideSuivante,
  demarrerSessionEquationInequationSecondDegre,
  soumettreReponseInterpretation,
  soumettreReponseIsolerSubstituer,
  soumettreReponsePoserEquationInequation,
  soumettreReponsePoserSysteme,
  soumettreReponseResoudre,
  soumettreReponseValidationEquation,
  soumettreReponseValidationInequation,
  tentativesMaxCourant,
} from "./moteur/sessionEquationInequationSecondDegre";
import type { EtatSessionEquationInequationSecondDegre, PhaseEquationInequationSecondDegre } from "./moteur/typesEquationInequationSecondDegre";
import {
  CATALOGUE_FAMILLES,
  CATALOGUE_VARIANTES,
  PAIRES_VALIDES,
  construireAvecFamilleId,
  genererExerciceEquationInequationSecondDegre,
} from "./generateurs/equationInequationSecondDegre";
import type { FamilleEquationInequationSecondDegre, VarianteEquationInequationSecondDegre } from "./core/equationInequationSecondDegre.types";
import { SelecteurVarianteDev } from "./components/SelecteurVarianteDev";
import { RecapitulatifPanel } from "./components/RecapitulatifPanel";
import { calculerRecapitulatifEquationInequationSecondDegre } from "./ui/recapitulatifEquationInequationSecondDegre";
import { EtapePoserSystemeEquationInequationSecondDegre } from "./components/EtapePoserSystemeEquationInequationSecondDegre";
import { EtapePoserEquationInequationSecondDegre } from "./components/EtapePoserEquationInequationSecondDegre";
import { EtapeResoudreEquationInequationSecondDegre } from "./components/EtapeResoudreEquationInequationSecondDegre";
import { EtapeValidationEquationInequationSecondDegre } from "./components/EtapeValidationEquationInequationSecondDegre";
import { EtapeInterpretationEquationInequationSecondDegre } from "./components/EtapeInterpretationEquationInequationSecondDegre";
import { QuestionFinale } from "./components/QuestionFinale";
import { formatEquationInequationLatex, formatNombreTexte, formatResolutionAttendueTexte, formatValidationAttendueTexte, texteAidePoserSystemeNiveau2 } from "./ui/formatEquationInequationSecondDegre";
import { Katex } from "./components/Katex";
import type { EtatPuceProgression } from "../components/ProgressionPuces";
import { ProgressionPuces } from "../components/ProgressionPuces";
import { genererAvecCode, lireCodeDepuisUrl } from "../export/codeExercice";
import type { EntreeHistoriqueEtape } from "../components/FicheReponseEcran";
import { FicheReponseEcran } from "../components/FicheReponseEcran";
import { expressionLibreVersLatex } from "./ui/formatExpressionLatex";

const REGLAGES_DEMO: ReglagesSession = {
  nombreExercices: 1,
  tentativesMax: 3,
  affichageReponseApresEchec: true,
  affichageExplication: true,
};

function nouvelleSession(): EtatSessionEquationInequationSecondDegre {
  return demarrerSessionEquationInequationSecondDegre(REGLAGES_DEMO, genererExerciceEquationInequationSecondDegre);
}

const LABEL_FAMILLE: Record<FamilleEquationInequationSecondDegre, string> = Object.fromEntries(
  CATALOGUE_FAMILLES.map((f) => [f.id, f.label]),
) as Record<FamilleEquationInequationSecondDegre, string>;
const LABEL_VARIANTE: Record<VarianteEquationInequationSecondDegre, string> = Object.fromEntries(
  CATALOGUE_VARIANTES.map((v) => [v.id, v.label]),
) as Record<VarianteEquationInequationSecondDegre, string>;

/** Combine les 2 axes (famille × variante) — SelecteurVarianteDev n'expose qu'un seul menu, donc
 * chaque paire réellement tirable (PAIRES_VALIDES) devient une option unique de ce menu. */
const OPTIONS_DEV = PAIRES_VALIDES.map((p) => ({
  id: `${p.familleId}::${p.varianteId}`,
  label: `${LABEL_FAMILLE[p.familleId]} — ${LABEL_VARIANTE[p.varianteId]}`,
}));

/** Instance d'une paire « famille::variante » du sélecteur — MÊME fonction que l'adaptateur d'export
 * (`generateurs/equationInequationSecondDegre/exportEvaluation.ts`, catalogue = ces 24 paires). */
function construireDepuisOption(id: string) {
  const [familleId, varianteId] = id.split("::") as [FamilleEquationInequationSecondDegre, VarianteEquationInequationSecondDegre];
  return construireAvecFamilleId(familleId, varianteId);
}

/** Première session : si l'URL porte le code d'un exercice imprimé (`?code=XXXXXX`), son exercice est
 * cette instance (même catalogue, même graine que la feuille). */
function sessionInitiale(): EtatSessionEquationInequationSecondDegre {
  const code = lireCodeDepuisUrl();
  if (!code) return nouvelleSession();
  return demarrerSessionEquationInequationSecondDegre(REGLAGES_DEMO, () => genererAvecCode(code, OPTIONS_DEV, genererExerciceEquationInequationSecondDegre, construireDepuisOption));
}

/** Séquence dépendant de `exercice.voieSysteme` (architecture D vs A/B/C — voir
 * `typesEquationInequationSecondDegre.ts`) : "interpretation" (dernière phase des 2 chemins) n'a
 * jamais besoin de sa propre branche "close" ci-dessous — jamais consultée comme phase passée.
 * Les puces closes sont cliquables (`onSegmentClick` → `FicheReponseEcran`). */
function sequencePourExercice(exercice: EtatSessionEquationInequationSecondDegre["exerciceCourant"]): PhaseEquationInequationSecondDegre[] {
  return exercice.voieSysteme
    ? ["poserSysteme", "isolerSubstituer", "resoudre", "validation", "interpretation"]
    : ["poserEquationInequation", "resoudre", "validation", "interpretation"];
}

function calculerSegmentsProgression(etat: EtatSessionEquationInequationSecondDegre): EtatPuceProgression[] {
  const sequence = sequencePourExercice(etat.exerciceCourant);
  const indexCourant = sequence.indexOf(etat.phase);
  return sequence.map((phase, index) => {
    if (index === indexCourant) return "courante";
    if (index > indexCourant) return "a-venir";
    const revele =
      phase === "poserSysteme"
        ? etat.poserSystemeRevele
        : phase === "isolerSubstituer"
          ? etat.isolerSubstituerRevele
          : phase === "poserEquationInequation"
            ? etat.poserEquationInequationRevele
            : phase === "resoudre"
              ? etat.resoudreRevele
              : etat.validationRevele;
    if (revele) return "revele";
    const niveauAide =
      phase === "poserSysteme"
        ? etat.niveauAidePoserSysteme
        : phase === "isolerSubstituer"
          ? etat.niveauAideIsolerSubstituer
          : phase === "poserEquationInequation"
            ? etat.niveauAidePoserEquationInequation
            : phase === "resoudre"
              ? etat.niveauAideResoudre
              : etat.niveauAideValidation;
    return niveauAide > 0 ? "aide" : "correcte";
  });
}

type ExerciceCourant = EtatSessionEquationInequationSecondDegre["exerciceCourant"];

/** Saisie libre de l'élève rendue en KaTeX (même conversion que l'aperçu sous le champ) — texte brut
 * si elle ne se lit pas comme une expression. */
function saisieLatex(texte: string): ReactNode {
  try {
    return <Katex expression={expressionLibreVersLatex(texte)} />;
  } catch {
    return texte;
  }
}

/** Nombre tapé par l'élève, virgule décimale et « − » typographique. */
function nombreSaisi(texte: string): string {
  return texte.trim().replace(".", ",").replace(/^-/, "−");
}

/** Titre de chaque écran dans la fiche de consultation (mêmes libellés que « Ce qu'on sait déjà »). */
function titrePhase(exercice: ExerciceCourant, phase: PhaseEquationInequationSecondDegre): string {
  switch (phase) {
    case "poserSysteme":
      return "Système posé";
    case "isolerSubstituer":
      return exercice.variante === "equation" ? "Équation réduite" : "Inéquation réduite";
    case "poserEquationInequation":
      return exercice.variante === "equation" ? "Équation posée" : "Inéquation posée";
    case "resoudre":
      return "Résolution";
    case "validation":
      return "Validation";
    case "interpretation":
      return "Interprétation";
  }
}

/** Réponse attendue d'un écran — la MÊME pour l'écran de validation et pour la fiche de consultation. */
function reponseAttenduePour(exercice: ExerciceCourant, phase: PhaseEquationInequationSecondDegre): ReactNode {
  switch (phase) {
    case "poserSysteme":
      return <Katex expression={texteAidePoserSystemeNiveau2(exercice)} />;
    case "isolerSubstituer":
    case "poserEquationInequation":
      return <Katex expression={formatEquationInequationLatex(exercice)} />;
    case "resoudre":
      return <>{formatResolutionAttendueTexte(exercice)}</>;
    case "validation":
      return <>{formatValidationAttendueTexte(exercice)}</>;
    case "interpretation": {
      const optionCorrecte = exercice.optionsInterpretation.find((option) => option.correcte);
      return optionCorrecte ? <>{optionCorrecte.texte}</> : undefined;
    }
  }
}

/** État tenu en attente dès qu'un écran se termine (bonne réponse, ou tentatives épuisées) — l'état
 * de session calculé par le moteur n'est appliqué (`setEtat`) qu'au clic sur le bouton de
 * `ValidationEcran`, jamais immédiatement (convention CLAUDE.md, "validation/invalidation avant de
 * passer à l'écran suivant"). */
interface TransitionEnAttente {
  etatSuivant: EtatSessionEquationInequationSecondDegre;
  revele: boolean;
}

export function AppEquationInequationSecondDegre() {
  const [etat, setEtat] = useState<EtatSessionEquationInequationSecondDegre>(sessionInitiale);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  /** Compteur de génération, dans la clé des écrans : « Générer » ou « Nouvel exercice » remonte
   * l'écran (champs vidés) même s'il reste sur la même phase. */
  const [generation, setGeneration] = useState(0);
  /** Consultation en lecture seule des écrans déjà clos (puces cliquables) — une entrée par écran
   * clos, dans l'ordre de `sequencePourExercice` (donc au même index que sa puce). Vidé à chaque
   * nouvel exercice. */
  const [historique, setHistorique] = useState<EntreeHistoriqueEtape[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);

  /** `votreReponse` n'est poussé dans l'historique que lorsque l'écran se clôt réellement (jamais à
   * chaque essai raté). */
  function terminerEtape(nouvelEtat: EtatSessionEquationInequationSecondDegre, votreReponse?: ReactNode) {
    const transitionDEcran = nouvelEtat.phase !== etat.phase || nouvelEtat.terminee !== etat.terminee;
    if (transitionDEcran) {
      const revele = (() => {
        switch (etat.phase) {
          case "poserSysteme":
            return nouvelEtat.poserSystemeRevele;
          case "isolerSubstituer":
            return nouvelEtat.isolerSubstituerRevele;
          case "poserEquationInequation":
            return nouvelEtat.poserEquationInequationRevele;
          case "resoudre":
            return nouvelEtat.resoudreRevele;
          case "validation":
            return nouvelEtat.validationRevele;
          case "interpretation":
            return nouvelEtat.resultats[nouvelEtat.resultats.length - 1]!.interpretationRevele;
        }
      })();
      if (votreReponse !== undefined && etat.phase !== "interpretation") {
        const phaseClose = etat.phase;
        const exerciceClos = etat.exerciceCourant;
        setHistorique((h) => [
          ...h,
          { titre: titrePhase(exerciceClos, phaseClose), votreReponse, correcte: !revele, reponseAttendue: revele ? reponseAttenduePour(exerciceClos, phaseClose) : undefined },
        ]);
      }
      setEnAttente({ etatSuivant: nouvelEtat, revele });
      return;
    }
    setEtat(nouvelEtat);
  }

  function passerEcranSuivant() {
    if (!enAttente) return;
    if (enAttente.etatSuivant.terminee) {
      setGeneration((g) => g + 1);
      setHistorique([]);
    }
    setEtat(enAttente.etatSuivant.terminee ? nouvelleSession() : enAttente.etatSuivant);
    setEnAttente(null);
  }

  function forcerVariante(id: string) {
    setEnAttente(null);
    setGeneration((g) => g + 1);
    setHistorique([]);
    setFicheOuverteIndex(null);
    setEtat(demarrerSessionEquationInequationSecondDegre(REGLAGES_DEMO, () => construireDepuisOption(id)));
  }

  const exercice = etat.exerciceCourant;
  const recapitulatif = calculerRecapitulatifEquationInequationSecondDegre(etat);

  const validation = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue: !etat.reglages.affichageReponseApresEchec ? undefined : reponseAttenduePour(exercice, etat.phase),
        labelSuivant: enAttente.etatSuivant.terminee ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
      }
    : null;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">4e — Entraînement</p>
        <h1 className="app-title">Équations/inéquations du second degré en contexte</h1>
        <p className="app-subtitle">Chapitre 2</p>
        <SelecteurVarianteDev options={OPTIONS_DEV} onGenerer={forcerVariante} />
      </header>

      <main className="card">
        <ProgressionPuces segments={calculerSegmentsProgression(etat)} onSegmentClick={(index) => setFicheOuverteIndex(index)} />

        <div className="card-body">
          <RecapitulatifPanel entrees={recapitulatif} />
          <QuestionFinale question={exercice.questionFinale} />
          {etat.phase === "poserSysteme" ? (
            <EtapePoserSystemeEquationInequationSecondDegre
              key={`${generation}-${etat.phase}`}
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={tentativesMaxCourant(etat)}
              niveauAide={etat.niveauAidePoserSysteme}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(reponse) =>
                terminerEtape(soumettreReponsePoserSysteme(etat, reponse), (
                  <>
                    {saisieLatex(reponse.relation1)}
                    <br />
                    {saisieLatex(reponse.relation2)}
                  </>
                ))
              }
              validation={validation}
            />
          ) : etat.phase === "isolerSubstituer" ? (
            <EtapePoserEquationInequationSecondDegre
              key={`${generation}-${etat.phase}`}
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={tentativesMaxCourant(etat)}
              niveauAide={etat.niveauAideIsolerSubstituer}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(texte) => terminerEtape(soumettreReponseIsolerSubstituer(etat, texte), saisieLatex(texte))}
              validation={validation}
            />
          ) : etat.phase === "poserEquationInequation" ? (
            <EtapePoserEquationInequationSecondDegre
              key={`${generation}-${etat.phase}`}
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={tentativesMaxCourant(etat)}
              niveauAide={etat.niveauAidePoserEquationInequation}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(texte) => terminerEtape(soumettreReponsePoserEquationInequation(etat, texte), saisieLatex(texte))}
              validation={validation}
            />
          ) : etat.phase === "resoudre" ? (
            <EtapeResoudreEquationInequationSecondDegre
              key={`${generation}-${etat.phase}`}
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={tentativesMaxCourant(etat)}
              niveauAide={etat.niveauAideResoudre}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(valeurs) => terminerEtape(soumettreReponseResoudre(etat, valeurs), valeurs.map((v, i) => `${exercice.base.contexte.labelVariable}${i === 0 ? "₁" : "₂"} = ${nombreSaisi(v)}`).join(" ; "))}
              validation={validation}
            />
          ) : etat.phase === "validation" ? (
            <EtapeValidationEquationInequationSecondDegre
              key={`${generation}-${etat.phase}`}
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={tentativesMaxCourant(etat)}
              niveauAide={etat.niveauAideValidation}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValiderEquation={(reponses) =>
                terminerEtape(
                  soumettreReponseValidationEquation(etat, reponses),
                  exercice.variante === "equation"
                    ? exercice.racinesCandidates.map((r, i) => `${exercice.base.contexte.labelVariable} = ${formatNombreTexte(r)} : ${reponses[i] ? "valide" : "rejetée"}`).join(", ")
                    : undefined,
                )
              }
              onValiderInequation={(reponse) =>
                terminerEtape(soumettreReponseValidationInequation(etat, reponse), `${exercice.base.contexte.labelVariable} ∈ [${nombreSaisi(reponse.inf)} ; ${nombreSaisi(reponse.sup)}]`)
              }
              validation={validation}
            />
          ) : etat.phase === "interpretation" ? (
            <EtapeInterpretationEquationInequationSecondDegre
              key={`${generation}-${etat.phase}`}
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={tentativesMaxCourant(etat)}
              niveauAide={etat.niveauAideInterpretation}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(indexChoisi) => terminerEtape(soumettreReponseInterpretation(etat, indexChoisi))}
              validation={validation}
            />
          ) : null}
        </div>
      </main>

      {ficheOuverteIndex !== null && historique[ficheOuverteIndex] && (
        <FicheReponseEcran entree={historique[ficheOuverteIndex]} onFermer={() => setFicheOuverteIndex(null)} />
      )}
    </div>
  );
}
