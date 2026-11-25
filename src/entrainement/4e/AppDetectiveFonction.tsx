import { Fragment, useState } from "react";
import type { ReactNode } from "react";
import type { ExerciceDetectiveFonction, IdDescriptionFonction } from "./core/detectiveFonction.types";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceDetectiveFonction } from "./generateurs/detectiveFonction";
import { correctionDetailleeDetectiveFonction } from "./generateurs/detectiveFonction/corrigeDetaille";
import { genererAvecCode, lireCodeDepuisUrl } from "../export/codeExercice";
import { CorrigeDetailleEcran } from "../components/CorrigeDetailleEcran";
import { lettreEtape, lignesDeLEtape } from "../export/corrigeTableau";
import { NOMBRE_ECRANS, activerAide, demarrer, ecranSuivant, soumettre, tentativesMaxEcran, type EtatDetectiveFonction as Etat } from "./moteur/sessionDetectiveFonction";
import { copieEleve, indiceLigneFausse, nombreLignes } from "./moteur/modeleDetectiveFonction";
import { diagnostiquerChamps, type StatutChamp } from "./moteur/verificationTransfertSecondDegre";
import { CONSIGNE_GENERALE, TITRES_ECRANS, aidesEcran, champsCorrection, consignesEcrans, descriptionFragments, recit, reponseFragments } from "./ui/formatDetectiveFonction";
import { ecranClos, segmentsDepuisHistorique, type EcranClos } from "./ui/historiqueProgression";
import { SelecteurVarianteDev } from "./components/SelecteurVarianteDev";
import { EnTeteExercice } from "./components/EnTeteExercice";
import { RenduFragments } from "./components/RenduFragments";
import { CopieEleve, EtapeDescriptionErreur, EtapeLigneFausse } from "./components/EtapesDetectiveErreurs";
import { EtapeChampsTransfert, saisieAffichee } from "./components/EtapesTransfertSecondDegre";
import { ProgressionPuces } from "../components/ProgressionPuces";
import { FicheReponseEcran } from "../components/FicheReponseEcran";
import type { ValidationEtapeProps } from "../components/ValidationEcran";

/**
 * gen127 — « Détective d'erreurs : fonction du second degré » (4e, chapitre 1, section `revision`,
 * processus 3 TRANSFÉRER), même mécanique que gen121 (ch. 2) et gen112. La copie d'un élève fictif
 * (4 ou 5 lignes) contient UNE ligne fausse ; la suite en découle. Trois écrans :
 * 1. quelle ligne est fausse ? (choix fermé, une tentative) ;
 * 2. quelle est l'erreur ? (4 descriptions, une tentative) ;
 * 3. le résultat corrigé (champs libres de la coquille « transfert » : nombres ou image construite,
 *    3 tentatives ; une saisie illisible ne compte pas ; le résultat de la copie a un message ciblé).
 * Aides à deux niveaux, corrigé de l'étape quand la réponse est révélée, aucun point affiché.
 * `?code=` : première instance tirée avec les MÊMES fonctions que l'adaptateur.
 */

function exerciceInitial(): ExerciceDetectiveFonction {
  const code = lireCodeDepuisUrl();
  if (!code) return genererExerciceDetectiveFonction();
  return genererAvecCode(code, CATALOGUE_VARIANTES, genererExerciceDetectiveFonction, construireAvecVariante);
}

interface TransitionEnAttente {
  revele: boolean;
  reponseAttendue: ReactNode;
  messageRevele?: string;
  derniere: boolean;
}

function reponseAttendue(e: ExerciceDetectiveFonction, ecran: number): ReactNode {
  if (ecran === 0) return <p style={{ margin: 0 }}>{`Ligne ${indiceLigneFausse(e) + 1}`}</p>;
  const fragments = ecran === 1 ? descriptionFragments(e.type, e) : reponseFragments(e);
  return (
    <p style={{ margin: 0 }}>
      <RenduFragments fragments={fragments} />
    </p>
  );
}

export function AppDetectiveFonction() {
  const [etat, setEtat] = useState<Etat>(() => demarrer(exerciceInitial()));
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  const [historique, setHistorique] = useState<EcranClos[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);
  const [generation, setGeneration] = useState(0);
  const [statuts, setStatuts] = useState<StatutChamp[] | null>(null);
  const [illisible, setIllisible] = useState(false);

  const e = etat.exercice;
  const ecran = etat.ecran;

  function recommencer(exercice: ExerciceDetectiveFonction) {
    setEtat(demarrer(exercice));
    setEnAttente(null);
    setHistorique([]);
    setFicheOuverteIndex(null);
    setStatuts(null);
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
    const attendue = reponseAttendue(e, ecran);
    setHistorique((h) => [...h, ecranClos(TITRES_ECRANS[ecran]!, votreReponse, resultat.revele, etat.niveauAide > 0, attendue, corrigeDetailleEcranCourant())]);
    setEtat(resultat.etat);
    setEnAttente({
      revele: resultat.revele,
      reponseAttendue: attendue,
      messageRevele: ecran === 0 ? "Ce n'était pas la ligne fausse." : ecran === 1 ? "Ce n'était pas la bonne explication." : undefined,
      derniere: ecran >= NOMBRE_ECRANS - 1,
    });
  }

  function passerEcranSuivant() {
    if (!enAttente) return;
    if (enAttente.derniere) {
      recommencer(genererExerciceDetectiveFonction());
      return;
    }
    setEtat(ecranSuivant(etat));
    setStatuts(null);
    setIllisible(false);
    setEnAttente(null);
  }

  // Crochet DEV-ONLY (même garde que `SelecteurVarianteDev`) : exercice tiré exposé pour Playwright.
  if (import.meta.env.DEV || new URLSearchParams(window.location.search).get("dev") === "1") {
    (window as unknown as { __debuggen127?: unknown }).__debuggen127 = { exercice: e, ecran };
  }

  /** Corrigé détaillé « comme au tableau » de l'écran en cours — UNE seule source pour la validation
   * (après la réponse) et pour l'entrée d'historique de l'étape (fiche de sa puce). */
  function corrigeDetailleEcranCourant() {
    return <CorrigeDetailleEcran etapes={lignesDeLEtape(correctionDetailleeDetectiveFonction(e), lettreEtape(ecran))} />;
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

  const consigne = <RenduFragments fragments={consignesEcrans(e)[ecran]!} />;
  const communs = { aides: aidesEcran(e, ecran), niveauAide: etat.niveauAide, onActiverAide: () => setEtat(activerAide(etat)), validation };

  function ecranCourant(): ReactNode {
    if (ecran === 0) {
      return (
        <EtapeLigneFausse
          {...communs}
          consigne={consigne}
          nombreLignes={nombreLignes(e)}
          attendue={indiceLigneFausse(e)}
          onValider={(i) => conclure(i === indiceLigneFausse(e), <p style={{ margin: 0 }}>{`Ligne ${i + 1}`}</p>)}
        />
      );
    }
    if (ecran === 1) {
      return (
        <EtapeDescriptionErreur<IdDescriptionFonction>
          {...communs}
          consigne={consigne}
          options={e.options.map((id) => ({ id, fragments: descriptionFragments(id, e) }))}
          attendue={e.type}
          onValider={(id) =>
            conclure(
              id === e.type,
              <p style={{ margin: 0 }}>
                <RenduFragments fragments={descriptionFragments(id, e)} />
              </p>,
            )
          }
        />
      );
    }
    const champs = champsCorrection(e);
    return (
      <EtapeChampsTransfert
        {...communs}
        consigne={consignesEcrans(e)[2]!}
        champs={champs}
        tentativesUtilisees={etat.tentativesUtilisees}
        tentativesMax={tentativesMaxEcran(ecran)}
        statuts={statuts}
        illisible={illisible}
        onValider={(saisies) => {
          const diagnostic = diagnostiquerChamps(saisies, champs);
          if (diagnostic.some((s) => s.etat === "parse_error")) {
            setIllisible(true);
            return;
          }
          setStatuts(diagnostic);
          conclure(
            diagnostic.every((s) => s.etat === "correct"),
            <span>
              {champs.map((c, i) => (
                <span key={c.id} style={{ marginRight: 14, display: "inline-block" }}>
                  <RenduFragments fragments={c.libelle} /> {saisieAffichee(saisies[i]!, c)}
                </span>
              ))}
            </span>,
          );
        }}
      />
    );
  }

  const blocDonnees = (
    <>
      <p style={{ margin: "6px 0" }}>
        <RenduFragments fragments={recit(e)} />
      </p>
      <CopieEleve lignes={copieEleve(e)} ligneSignalee={ecran >= 1 ? indiceLigneFausse(e) : null} />
    </>
  );

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">4e — Entraînement</p>
        <h1 className="app-title">{"Détective d'erreurs : fonction du second degré"}</h1>
        <p className="app-subtitle">Chapitre 1 — La fonction du second degré</p>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={(id) => recommencer(construireAvecVariante(id))} />
      </header>

      <main className="card">
        <ProgressionPuces segments={segmentsDepuisHistorique(historique, NOMBRE_ECRANS, !enAttente)} onSegmentClick={(index) => setFicheOuverteIndex(index)} />

        <div className="card-body">
          <EnTeteExercice consigneGenerale={CONSIGNE_GENERALE} blocDonnees={blocDonnees} />
          <Fragment key={`${generation}-${ecran}`}>{ecranCourant()}</Fragment>
        </div>
      </main>

      {ficheOuverteIndex !== null && historique[ficheOuverteIndex] && (
        <FicheReponseEcran entree={historique[ficheOuverteIndex].entree} onFermer={() => setFicheOuverteIndex(null)} />
      )}
    </div>
  );
}
