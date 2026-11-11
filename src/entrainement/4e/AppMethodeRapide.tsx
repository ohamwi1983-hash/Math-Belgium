import { Fragment, useState } from "react";
import type { ReactNode } from "react";
import type { Categorie, Exercice } from "./core/generateur.types";
import type { ReglagesSession } from "./core/session.types";
import {
  activerAideChamp1,
  activerAideDevelopper,
  activerAideIsolement,
  activerAideSimplification,
  activerAideZeros,
  demarrerSession,
  diagnostiquerChampPrincipal,
  diagnostiquerIsolement,
  diagnostiquerSimplification,
  soumettreChoixCategorie,
  soumettreReponseChamp1,
  soumettreReponseChamp2,
  soumettreReponseDevelopper,
  soumettreReponseIsolement,
  soumettreReponseSimplification,
} from "./moteur";
import type { EtatSession, ReponseZeros } from "./moteur";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceSecondDegre, type VarianteSecondDegreId } from "./generateurs/secondDegre";
import { EtapeSimplificationCoefficients } from "./components/EtapeSimplificationCoefficients";
import { EtapeIsolement } from "./components/EtapeIsolement";
import { SelecteurVarianteDev } from "./components/SelecteurVarianteDev";
import { genererAvecCode, lireCodeDepuisUrl } from "../export/codeExercice";
import { EtapeReconnaissance } from "./components/EtapeReconnaissance";
import { EtapeChamp1 } from "./components/EtapeChamp1";
import { EtapeZeros } from "./components/EtapeZeros";
import { Katex } from "./components/Katex";
import { calculerRecapitulatif } from "./ui/recapitulatif";
import { libelleCategorie } from "./ui/categorieLabels";
import { formatEnonceAffichage, formatEnonceLatex, formatEquationIsoleeNonDeveloppee, formatTermesZerosAttendusLatex } from "./ui/formatEquation";
import { ProgressionPuces } from "../components/ProgressionPuces";
import { FicheReponseEcran } from "../components/FicheReponseEcran";
import { ecranClos, nombreSaisi, saisieEnLatex, segmentsDepuisHistorique, type EcranClos } from "./ui/historiqueProgression";
import { phasesExercice } from "./moteur/session";
import { EnTeteExercice } from "./components/EnTeteExercice";

const REGLAGES_DEMO: ReglagesSession = {
  nombreExercices: 1,
  tentativesMax: 3,
  affichageReponseApresEchec: true,
  affichageExplication: true,
};

function nouvelleSession(): EtatSession {
  return demarrerSession(REGLAGES_DEMO, genererExerciceSecondDegre);
}

/** Première session : si l'URL porte le code d'un exercice imprimé (`?code=XXXXXX`, QR code de la
 * feuille), son exercice est cette instance — tirée avec les MÊMES fonctions et le MÊME catalogue
 * que l'adaptateur d'export ; la suite reste un tirage normal. */
function sessionInitiale(): EtatSession {
  const code = lireCodeDepuisUrl();
  if (!code) return nouvelleSession();
  return demarrerSession(REGLAGES_DEMO, () => genererAvecCode(code, CATALOGUE_VARIANTES, genererExerciceSecondDegre, (id) => construireAvecVarianteId(id as VarianteSecondDegreId)));
}

function titreEcran(phase: EtatSession["phase"], exercice: Exercice): string {
  switch (phase) {
    case "simplification":
      return "Équation simplifiée";
    case "isolement":
      return "Équation isolée";
    case "developper":
      return "Équation développée";
    case "reconnaissance":
      return "Méthode";
    case "champ1":
      return exercice.categorie === "cas_general" ? "Discriminant" : "Factorisation";
    default:
      return "Solutions";
  }
}

function aideEcran(etat: EtatSession): boolean {
  switch (etat.phase) {
    case "simplification":
      return etat.aideSimplificationUtilisee;
    case "isolement":
      return etat.aideIsolementUtilisee;
    case "developper":
      return etat.aideDevelopperUtilisee;
    case "champ1":
      return etat.aideChamp1Utilisee;
    case "champ2":
      return etat.aideZerosUtilisee;
    default:
      return false;
  }
}

/**
 * Consigne générale — rappelle l'objectif complet de l'exercice, affichée identique sur tous les
 * écrans de travail, redondante avec les consignes spécifiques à chaque étape mais utile pour ne
 * jamais perdre de vue l'objectif final (prompt du 27/09).
 */
const CONSIGNE_GENERALE = "Résous l'équation suivante en utilisant la méthode la plus rapide.";

/**
 * true ssi la forme de surface isolée garde un produit x(x+b) non développé
 * (formeAffichage "produit_egale_constante") pour une catégorie qui a besoin de a,b,c explicites
 * (cas_general : Δ ; produit_remarquable : carré parfait c=(b/2)²) — dans ce seul cas, l'isolement
 * lui-même ne fait que regrouper ("Regroupe tous les termes du même côté."), et une étape
 * "developper" séparée suit (gen1 "regroupe avant de développer"). Pour isolee_constante/isolee_carre
 * (rien à développer), l'isolement demande directement cette forme générale, en un seul écran.
 */
function demandeFormeGeneraleDirecte(exercice: Exercice): boolean {
  const c = exercice.categorie;
  if (c !== "cas_general" && c !== "produit_remarquable") return false;
  return exercice.formeAffichage !== "produit_egale_constante";
}

/** État tenu en attente dès qu'un écran se termine (bonne réponse, ou tentatives épuisées) — l'état
 * de session calculé par le moteur n'est appliqué (`setEtat`) qu'au clic sur le bouton de
 * `ValidationEcran`, jamais immédiatement (convention CLAUDE.md, "validation/invalidation avant de
 * passer à l'écran suivant"). */
interface TransitionEnAttente {
  etatSuivant: EtatSession;
  revele: boolean;
}

export function AppMethodeRapide() {
  const [etat, setEtat] = useState<EtatSession>(sessionInitiale);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  /** Consultation en lecture seule des écrans déjà clos (puces cliquables de `ProgressionPuces`) —
   * tenu ICI, à part de `EtatSession`, jamais dans le moteur (voir AppAnalyseFonction.tsx). Remis à
   * vide à chaque nouvel exercice, comme `enAttente`. */
  const [historique, setHistorique] = useState<EcranClos[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);
  /** Compteur d'exercices : clé de la zone d'étapes, pour que les champs repartent vides à chaque
   * nouvel exercice même quand il commence par le même écran que le précédent. */
  const [numeroExercice, setNumeroExercice] = useState(0);

  /** `votreReponse` : UNIQUEMENT formatée/poussée dans l'historique quand l'étape se clôt
   * RÉELLEMENT (`transitionDEcran`) — jamais à chaque clic sur "Valider" (voir le commentaire détaillé
   * de AppAnalyseFonction.tsx::terminerEtape, même garde reproduit ici à l'identique). */
  function terminerEtape(nouvelEtat: EtatSession, votreReponse?: ReactNode) {
    const transitionDEcran = nouvelEtat.phase !== etat.phase || nouvelEtat.terminee !== etat.terminee;
    if (transitionDEcran) {
      const revele =
        etat.phase === "simplification"
          ? nouvelEtat.simplificationRevele
          : etat.phase === "isolement"
            ? nouvelEtat.isolementRevele
            : etat.phase === "developper"
              ? nouvelEtat.developperRevele
              : etat.phase === "reconnaissance"
                ? nouvelEtat.categorieRevelee
                : etat.phase === "champ1"
                  ? nouvelEtat.champPrincipalRevele
                  : nouvelEtat.resultats[nouvelEtat.resultats.length - 1]!.zerosRevele;
      setHistorique((h) => [...h, ecranClos(titreEcran(etat.phase, etat.exerciceCourant), votreReponse, revele, aideEcran(etat), reponseAttenduePour(etat.phase, nouvelEtat))]);
      setEnAttente({ etatSuivant: nouvelEtat, revele });
      return;
    }
    setEtat(nouvelEtat);
  }

  function passerEcranSuivant() {
    if (!enAttente) return;
    if (enAttente.etatSuivant.terminee) {
      setEtat(nouvelleSession());
      setHistorique([]);
      setFicheOuverteIndex(null);
      setNumeroExercice((n) => n + 1);
    } else {
      setEtat(enAttente.etatSuivant);
    }
    setEnAttente(null);
  }

  const recapitulatif = calculerRecapitulatif(etat);
  // Bloc "énoncé" fixe : toujours l'exercice tel que généré, jamais la forme réduite par la
  // simplification (etat.exerciceCourant) — voir EtatSession.exerciceOriginal.
  const enonceFixe = formatEnonceAffichage(
    etat.exerciceOriginal.enonce,
    etat.exerciceOriginal.formeAffichage,
    etat.exerciceOriginal.parametresAffichage,
    etat.exerciceOriginal.irrationnel,
  );

  function onGenererDev(varianteId: string) {
    setEnAttente(null);
    setHistorique([]);
    setFicheOuverteIndex(null);
    setNumeroExercice((n) => n + 1);
    setEtat(demarrerSession(REGLAGES_DEMO, () => construireAvecVarianteId(varianteId as VarianteSecondDegreId)));
  }

  const exercice = etat.exerciceCourant;
  const phase = etat.phase;

  /** Couvre les 6 phases — reprend exactement la logique/formatage déjà calculée pour le
   * récapitulatif live par `ui/recapitulatif.ts::calculerRecapitulatif` ("Équation simplifiée"/
   * "Équation isolée"/"Équation développée"/"Méthode"). Les 4 premières phases renvoyaient `null`
   * ici auparavant (bug trouvé par le même audit que gen6/`AppInequationRationnelle.tsx` : le
   * reveal immédiat affichait "✗ Incorrect" sans jamais montrer la réponse attendue, sur TOUS les
   * exercices puisque ces 4 phases ne dépendent d'aucune niveau/variante). */
  /** Réponse attendue d'un écran — la même sur l'écran de validation et dans la fiche de la puce.
   * Simplification : l'équation RÉDUITE (`etatApres.exerciceCourant`), jamais celle de l'énoncé. */
  function reponseAttenduePour(phase: EtatSession["phase"], etatApres: EtatSession): ReactNode {
    const exercice = phase === "simplification" ? etatApres.exerciceCourant : etat.exerciceCourant;
    return phase === "simplification" ? (
      <>
        Équation simplifiée attendue :{" "}
        <Katex expression={formatEnonceAffichage(exercice.enonce, exercice.formeAffichage, exercice.parametresAffichage, exercice.irrationnel)} />
      </>
    ) : phase === "isolement" ? (
      <>
        Équation isolée attendue : <Katex expression={formatEquationIsoleeNonDeveloppee(exercice)} />
      </>
    ) : phase === "developper" ? (
      <>
        Équation développée attendue : <Katex expression={formatEnonceLatex(exercice.enonce)} />
      </>
    ) : phase === "reconnaissance" ? (
      <>Méthode attendue : {libelleCategorie(exercice.categorie)}</>
    ) : phase === "champ1" ? (
      <Katex expression={exercice.categorie === "cas_general" ? `\\Delta = ${exercice.solution.delta}` : `${exercice.solution.formeFactorisee} = 0`} />
    ) : phase === "champ2" ? (
      <span className="equation-box-termes">
        {formatTermesZerosAttendusLatex(exercice).map((terme, i) => (
          <Katex key={i} expression={terme} />
        ))}
      </span>
    ) : null;
  }
  const reponseAttendue = enAttente ? reponseAttenduePour(phase, enAttente.etatSuivant) : null;

  const validation = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue,
        labelSuivant: enAttente.etatSuivant.terminee ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
      }
    : null;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">4e — Entraînement</p>
        <h1 className="app-title">Second degré — choisir la méthode la plus rapide</h1>
        <p className="app-subtitle">Équations du second degré</p>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={onGenererDev} />
      </header>

      <main className="card">
        <ProgressionPuces
          segments={segmentsDepuisHistorique(historique, phasesExercice(etat.exerciceOriginal).length, !enAttente)}
          onSegmentClick={(index) => setFicheOuverteIndex(index)}
        />
        <div className="card-body">
          <EnTeteExercice
            consigneGenerale={CONSIGNE_GENERALE}
            blocDonnees={
              <div className="equation-box">
                <Katex expression={enonceFixe} block />
              </div>
            }
          />
          <Fragment key={numeroExercice}>
          {phase === "simplification" ? (
            <EtapeSimplificationCoefficients
              key={phase}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              diagnostiquer={(v) => diagnostiquerSimplification(exercice, v)}
              aideActivee={etat.aideSimplificationUtilisee}
              onActiverAide={() => setEtat(activerAideSimplification(etat))}
              onValider={(reponse) => terminerEtape(soumettreReponseSimplification(etat, reponse), saisieEnLatex(reponse))}
              validation={validation}
            />
          ) : phase === "isolement" ? (
            <EtapeIsolement
              key={phase}
              exercice={exercice}
              enonceFixe={enonceFixe}
              masquerBlocDonnees
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              recapitulatif={recapitulatif}
              question={demandeFormeGeneraleDirecte(exercice) ? undefined : "Regroupe tous les termes du même côté."}
              label={demandeFormeGeneraleDirecte(exercice) ? undefined : null}
              diagnostiquer={(v) => diagnostiquerIsolement(exercice, v)}
              aideActivee={etat.aideIsolementUtilisee}
              onActiverAide={() => setEtat(activerAideIsolement(etat))}
              onValider={(reponse) => terminerEtape(soumettreReponseIsolement(etat, reponse), saisieEnLatex(reponse))}
              validation={validation}
            />
          ) : phase === "developper" ? (
            <EtapeIsolement
              key={phase}
              exercice={exercice}
              enonceFixe={enonceFixe}
              masquerBlocDonnees
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              recapitulatif={recapitulatif}
              diagnostiquer={(v) => diagnostiquerIsolement(exercice, v)}
              aideActivee={etat.aideDevelopperUtilisee}
              onActiverAide={() => setEtat(activerAideDevelopper(etat))}
              onValider={(reponse) => terminerEtape(soumettreReponseDevelopper(etat, reponse), saisieEnLatex(reponse))}
              validation={validation}
            />
          ) : phase === "reconnaissance" ? (
            <EtapeReconnaissance
              key={phase}
              exercice={exercice}
              enonceFixe={enonceFixe}
              masquerBlocDonnees
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              recapitulatif={recapitulatif}
              onChoisir={(choix: Categorie) => terminerEtape(soumettreChoixCategorie(etat, choix), libelleCategorie(choix))}
              validation={validation}
            />
          ) : phase === "champ1" ? (
            <EtapeChamp1
              key={phase}
              exercice={exercice}
              enonceFixe={enonceFixe}
              masquerBlocDonnees
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              recapitulatif={recapitulatif}
              diagnostiquer={(v) => diagnostiquerChampPrincipal(exercice, v)}
              aideActivee={etat.aideChamp1Utilisee}
              onActiverAide={() => setEtat(activerAideChamp1(etat))}
              onValider={(reponse) =>
                terminerEtape(soumettreReponseChamp1(etat, reponse), exercice.categorie === "cas_general" ? <>Δ = {saisieEnLatex(reponse)}</> : saisieEnLatex(reponse.includes("=") ? reponse : `${reponse}=0`))
              }
              validation={validation}
            />
          ) : (
            <EtapeZeros
              key={phase}
              exercice={exercice}
              enonceFixe={enonceFixe}
              masquerBlocDonnees
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              recapitulatif={recapitulatif}
              aideActivee={etat.aideZerosUtilisee}
              onActiverAide={() => setEtat(activerAideZeros(etat))}
              onValider={(reponse: ReponseZeros) => terminerEtape(soumettreReponseChamp2(etat, reponse), reponse.aucun ? "Pas de solution" : reponse.valeurs.map((v) => `x = ${nombreSaisi(v)}`).join(" ; "))}
              validation={validation}
            />
          )}
          </Fragment>
        </div>
      </main>

      {ficheOuverteIndex !== null && historique[ficheOuverteIndex] && (
        <FicheReponseEcran entree={historique[ficheOuverteIndex].entree} onFermer={() => setFicheOuverteIndex(null)} />
      )}
    </div>
  );
}
