import { Fragment, useState } from "react";
import type { ReactNode } from "react";
import type { ExerciceSigneRacines, VerdictSignes } from "./core/signeRacines.types";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceSigneRacines } from "./generateurs/signeRacines";
import { correctionDetailleeSigneRacines } from "./generateurs/signeRacines/corrigeDetaille";
import { genererAvecCode, lireCodeDepuisUrl } from "../export/codeExercice";
import { CorrigeDetailleEcran } from "../components/CorrigeDetailleEcran";
import { lettreEtape, lignesDeLEtape } from "../export/corrigeTableau";
import { activerAide, demarrer, ecranSuivant, soumettre, tentativesMaxEcran, type EtatSigneRacines } from "./moteur/sessionSigneRacines";
import { diagnostiquer, messageErreur } from "./moteur/verificationSigneRacines";
import { phases } from "./moteur/modeleSigneRacines";
import { AIDE_SAISIE, LIBELLES_VERDICTS, TITRES_PHASES, aidesPhase, consigneGenerale, consignePhase, equationLatex, prefixePhase, reponsePhase } from "./ui/formatSigneRacines";
import { ecranClos, segmentsDepuisHistorique, type EcranClos } from "./ui/historiqueProgression";
import { SelecteurVarianteDev } from "./components/SelecteurVarianteDev";
import { EnTeteExercice } from "./components/EnTeteExercice";
import { RenduFragments } from "./components/RenduFragments";
import { Katex } from "./components/Katex";
import { ChoixUniqueFragments } from "./components/ChoixUniqueFragments";
import { EtapeChampLibreTrinome } from "./components/EtapeChampLibreTrinome";
import { ProgressionPuces } from "../components/ProgressionPuces";
import { FicheReponseEcran } from "../components/FicheReponseEcran";
import type { ValidationEtapeProps } from "../components/ValidationEcran";

/**
 * gen114 — « Signe des racines sans les calculer » (4e, chapitre 2, section `resoudre`, processus 2
 * APPLIQUER). Variante « signes » : P → (Δ si P > 0) → (S si Δ > 0) → verdict ; variante « racine
 * évidente » : x₁ → P → x₂ → verdict. Champs libres (3 tentatives, saisie illisible non comptée),
 * verdict en choix fermé (une tentative). Aucun point affiché. `?code=` : première instance tirée avec
 * les MÊMES fonctions que l'adaptateur.
 */

function exerciceInitial(): ExerciceSigneRacines {
  const code = lireCodeDepuisUrl();
  if (!code) return genererExerciceSigneRacines();
  return genererAvecCode(code, CATALOGUE_VARIANTES, genererExerciceSigneRacines, construireAvecVariante);
}

interface TransitionEnAttente {
  revele: boolean;
  reponseAttendue: ReactNode;
  messageRevele?: string;
  derniere: boolean;
}

export function AppSigneRacines() {
  const [etat, setEtat] = useState<EtatSigneRacines>(() => demarrer(exerciceInitial()));
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  const [historique, setHistorique] = useState<EcranClos[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);
  const [generation, setGeneration] = useState(0);
  const [erronee, setErronee] = useState(false);
  const [messageFaux, setMessageFaux] = useState<string | null>(null);
  const [illisible, setIllisible] = useState(false);

  const e = etat.exercice;
  const liste = phases(e);
  const phase = liste[etat.ecran]!;

  function recommencer(exercice: ExerciceSigneRacines) {
    setEtat(demarrer(exercice));
    setEnAttente(null);
    setHistorique([]);
    setFicheOuverteIndex(null);
    setErronee(false);
    setMessageFaux(null);
    setIllisible(false);
    setGeneration((g) => g + 1);
  }

  function conclure(correct: boolean, votreReponse: ReactNode) {
    const resultat = soumettre(etat, correct);
    setIllisible(false);
    if (!resultat.clos) {
      setEtat(resultat.etat);
      return;
    }
    const attendue = (
      <p style={{ margin: 0 }}>
        <RenduFragments fragments={reponsePhase(e, phase)} />
      </p>
    );
    setHistorique((h) => [...h, ecranClos(TITRES_PHASES[phase], votreReponse, resultat.revele, etat.niveauAide > 0, attendue, corrigeDetailleEcranCourant())]);
    setEtat(resultat.etat);
    setEnAttente({ revele: resultat.revele, reponseAttendue: attendue, messageRevele: phase === "verdict" ? "Ce n'était pas le bon signe." : undefined, derniere: etat.ecran >= liste.length - 1 });
  }

  function passerEcranSuivant() {
    if (!enAttente) return;
    if (enAttente.derniere) {
      recommencer(genererExerciceSigneRacines());
      return;
    }
    setEtat(ecranSuivant(etat));
    setErronee(false);
    setMessageFaux(null);
    setEnAttente(null);
  }

  const modeDevActif = import.meta.env.DEV || new URLSearchParams(window.location.search).get("dev") === "1";
  if (modeDevActif) {
    (window as unknown as { __debuggen114?: unknown }).__debuggen114 = { exercice: e, ecran: etat.ecran };
  }

  /** Corrigé détaillé « comme au tableau » de l'écran en cours — UNE seule source pour la validation
   * (après la réponse) et pour l'entrée d'historique de l'étape (fiche de sa puce). */
  function corrigeDetailleEcranCourant() {
    return <CorrigeDetailleEcran etapes={lignesDeLEtape(correctionDetailleeSigneRacines(e), lettreEtape(etat.ecran))} />;
  }

  const validation: ValidationEtapeProps | null = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue: enAttente.reponseAttendue,
        labelSuivant: enAttente.derniere ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
        messageRevele: enAttente.messageRevele,
        corrigeDetaille: corrigeDetailleEcranCourant(),
      }
    : null;

  const consigne = <RenduFragments fragments={consignePhase(e, phase)} />;
  const communs = { aides: aidesPhase(e, phase), niveauAide: etat.niveauAide, onActiverAide: () => setEtat(activerAide(etat)), validation };

  function ecranCourant(): ReactNode {
    if (phase === "verdict") {
      return (
        <ChoixUniqueFragments<VerdictSignes>
          {...communs}
          consigne={consigne}
          libelleGroupe="Signe des racines"
          disposition="grille"
          options={e.options.map((id) => ({ id, fragments: [{ type: "texte", valeur: LIBELLES_VERDICTS[id] }] }))}
          acceptees={[e.verdict]}
          onValider={(id) => conclure(id === e.verdict, <p style={{ margin: 0 }}>{LIBELLES_VERDICTS[id]}</p>)}
        />
      );
    }
    return (
      <EtapeChampLibreTrinome
        {...communs}
        consigne={consigne}
        idChamp={`signe-racines-${phase}`}
        libelle={[{ type: "texte", valeur: TITRES_PHASES[phase] }]}
        prefixe={prefixePhase(phase)}
        aideSaisie={AIDE_SAISIE}
        messageIllisible="Écriture non reconnue : écris un nombre (fraction comme 3/2, virgule décimale)."
        tentativesUtilisees={etat.tentativesUtilisees}
        tentativesMax={tentativesMaxEcran(etat)}
        erronee={erronee}
        messageFaux={messageFaux}
        illisible={illisible}
        onValider={(texte) => {
          const statut = diagnostiquer(e, phase, texte);
          if (statut === "parse_error") {
            setIllisible(true);
            return;
          }
          const correct = statut === "correct";
          setErronee(!correct);
          setMessageFaux(correct ? null : messageErreur(e, phase, texte));
          conclure(correct, <p style={{ margin: 0 }}>{texte.trim().replace(/^\s*[^=]*=\s*/, "").replace(/-/g, "−").replace(/(\d)\.(\d)/g, "$1,$2")}</p>);
        }}
      />
    );
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">4e — Entraînement</p>
        <h1 className="app-title">Signe des racines sans les calculer</h1>
        <p className="app-subtitle">Chapitre 2 — Équations et inéquations du second degré</p>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={(id) => recommencer(construireAvecVariante(id))} />
      </header>

      <main className="card">
        <ProgressionPuces segments={segmentsDepuisHistorique(historique, liste.length, !enAttente)} onSegmentClick={(index) => setFicheOuverteIndex(index)} />
        <div className="card-body">
          <EnTeteExercice
            consigneGenerale={consigneGenerale(e)}
            blocDonnees={
              <div className="apercu-box" style={{ margin: "8px 0" }}>
                <Katex expression={equationLatex(e)} />
              </div>
            }
          />
          <Fragment key={`${generation}-${etat.ecran}`}>{ecranCourant()}</Fragment>
        </div>
      </main>

      {ficheOuverteIndex !== null && historique[ficheOuverteIndex] && (
        <FicheReponseEcran entree={historique[ficheOuverteIndex].entree} onFermer={() => setFicheOuverteIndex(null)} />
      )}
    </div>
  );
}
