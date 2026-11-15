import { Fragment, useState } from "react";
import type { ReactNode } from "react";
import type { ExerciceDetectiveSuites, IdDescriptionSuites } from "./core5e/detectiveSuites.types";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceDetectiveSuites } from "./generateurs5e/detectiveSuites";
import { genererAvecCode, lireCodeDepuisUrl } from "../export/codeExercice";
import { NOMBRE_ECRANS, activerAide, demarrer, ecranSuivant, soumettre, tentativesMaxEcran, type EtatDetectiveSuites } from "./moteur5e/sessionDetectiveSuites";
import { diagnostiquerCorrection, estResultatCopie, verifierDescription, verifierLigne } from "./moteur5e/verificationDetectiveSuites";
import { descriptionCorrecte, indiceLigneFausse, nombreLignes } from "./moteur5e/modeleDetectiveSuites";
import {
  CONSIGNE_GENERALE,
  TITRES_ECRANS,
  aideSaisie,
  aidesEcran,
  consignesEcrans,
  descriptionFragments,
  enonceExercice,
  libelleChamp,
  lignesCopie,
  prefixeChamp,
  raccourcisChamp,
  reponseFragments,
  uniteChamp,
} from "./ui5e/formatDetectiveSuites";
import { ecranClos, segmentsDepuisHistorique, type EcranClos } from "../4e/ui/historiqueProgression";
import { SelecteurVarianteDev } from "./components5e/SelecteurVarianteDev";
import { EnTeteExercice } from "./components5e/EnTeteExercice";
import { RenduFragments } from "../4e/components/RenduFragments";
import { Katex } from "./components/Katex";
import { expressionLibreVersLatex } from "./ui/formatExpressionLatex";
import { CopieEleve, EtapeDescriptionErreur, EtapeLigneFausse } from "../4e/components/EtapesDetectiveErreurs";
import { EtapeCorrectionDetectiveSuites } from "./components5e/EtapeCorrectionDetectiveSuites";
import { ProgressionPuces } from "../components/ProgressionPuces";
import { FicheReponseEcran } from "../components/FicheReponseEcran";
import type { ValidationEtapeProps } from "../components/ValidationEcran";

/**
 * 5gen49 — « Détective d'erreurs : suites » (5e, chapitre 3 « Suites », section
 * `problemes-classiques`, processus 3 TRANSFÉRER), même mécanique que 6gen88 / 6gen84. La
 * résolution d'un exercice du chapitre par un élève fictif (4 ou 5 lignes) contient UNE ligne
 * fausse ; la suite en découle. Trois écrans :
 * 1. quelle ligne est fausse ? (choix fermé, une tentative) ;
 * 2. quelle est l'erreur ? (4 descriptions, une tentative) ;
 * 3. le résultat final corrigé (champ libre, 3 tentatives ; « n'existe pas » ou ±∞ possibles).
 * Aucun point affiché. `?code=` (QR code d'une feuille) : première instance tirée avec les MÊMES
 * fonctions que l'adaptateur.
 */

function exerciceInitial(): ExerciceDetectiveSuites {
  const code = lireCodeDepuisUrl();
  if (!code) return genererExerciceDetectiveSuites();
  return genererAvecCode(code, CATALOGUE_VARIANTES, genererExerciceDetectiveSuites, construireAvecVariante);
}

interface TransitionEnAttente {
  revele: boolean;
  reponseAttendue: ReactNode;
  messageRevele?: string;
  derniere: boolean;
}

/** Une saisie de l'écran 3 réécrite en LaTeX pour la fiche (jamais la notation clavier brute). */
function saisieEcrite(texte: string): ReactNode {
  const brut = texte.trim();
  const valeur = brut.replace(/^[^=≈]*[=≈]/, "").trim();
  if (valeur === "" || /[a-zA-Zàéèê∞']/.test(valeur)) return <p style={{ margin: 0 }}>{brut}</p>;
  try {
    const sansMilliers = valeur.replace(/(\d)[\s  ]+(?=\d)/g, "$1").replace(/(\d),(\d)/g, "$1.$2");
    const latex = expressionLibreVersLatex(sansMilliers).replace(/(\d)\.(\d)/g, "$1{,}$2");
    return (
      <p style={{ margin: 0 }}>
        <Katex expression={latex} />
      </p>
    );
  } catch {
    return <p style={{ margin: 0 }}>{brut}</p>;
  }
}

function reponseAttendue(e: ExerciceDetectiveSuites, ecran: number): ReactNode {
  if (ecran === 0) return <p style={{ margin: 0 }}>{`Ligne ${indiceLigneFausse(e) + 1}`}</p>;
  const fragments = ecran === 1 ? descriptionFragments(descriptionCorrecte(e), e) : reponseFragments(e);
  return (
    <p style={{ margin: 0 }}>
      <RenduFragments fragments={fragments} />
    </p>
  );
}

export function App5gen49() {
  const [etat, setEtat] = useState<EtatDetectiveSuites>(() => demarrer(exerciceInitial()));
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  const [historique, setHistorique] = useState<EcranClos[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);
  /** Clé des écrans : les champs repartent vides après « Générer » ou « Nouvel exercice ». */
  const [generation, setGeneration] = useState(0);
  const [erronee, setErronee] = useState(false);
  const [messageFaux, setMessageFaux] = useState<string | null>(null);
  const [nonComptee, setNonComptee] = useState<"parse_error" | "approchee" | null>(null);

  const e = etat.exercice;
  const ecran = etat.ecran;

  function recommencer(exercice: ExerciceDetectiveSuites) {
    setEtat(demarrer(exercice));
    setEnAttente(null);
    setHistorique([]);
    setFicheOuverteIndex(null);
    setErronee(false);
    setMessageFaux(null);
    setNonComptee(null);
    setGeneration((g) => g + 1);
  }

  function conclure(correct: boolean, votreReponse: ReactNode) {
    const resultat = soumettre(etat, correct);
    setNonComptee(null);
    if (!resultat.clos) {
      setEtat(resultat.etat);
      return;
    }
    const attendue = reponseAttendue(e, ecran);
    setHistorique((h) => [...h, ecranClos(TITRES_ECRANS[ecran]!, votreReponse, resultat.revele, etat.niveauAide > 0, attendue)]);
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
      recommencer(genererExerciceDetectiveSuites());
      return;
    }
    setEtat(ecranSuivant(etat));
    setErronee(false);
    setMessageFaux(null);
    setEnAttente(null);
  }

  // Hook DEV-ONLY (même garde que `SelecteurVarianteDev`) : exercice tiré exposé pour Playwright.
  const modeDevActif = import.meta.env.DEV || new URLSearchParams(window.location.search).get("dev") === "1";
  if (modeDevActif) {
    (window as unknown as { __debug5gen49?: unknown }).__debug5gen49 = { exercice: e, ecran };
  }

  const validation: ValidationEtapeProps | null = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue: enAttente.reponseAttendue,
        labelSuivant: enAttente.derniere ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
        messageRevele: enAttente.messageRevele,
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
          onValider={(i) => conclure(verifierLigne(e, i), <p style={{ margin: 0 }}>{`Ligne ${i + 1}`}</p>)}
        />
      );
    }
    if (ecran === 1) {
      return (
        <EtapeDescriptionErreur<IdDescriptionSuites>
          {...communs}
          consigne={consigne}
          options={e.options.map((id) => ({ id, fragments: descriptionFragments(id, e) }))}
          attendue={descriptionCorrecte(e)}
          onValider={(id) =>
            conclure(
              verifierDescription(e, id),
              <p style={{ margin: 0 }}>
                <RenduFragments fragments={descriptionFragments(id, e)} />
              </p>,
            )
          }
        />
      );
    }
    return (
      <EtapeCorrectionDetectiveSuites
        {...communs}
        consigne={consigne}
        libelle={libelleChamp(e)}
        prefixe={prefixeChamp(e)}
        unite={uniteChamp(e)}
        raccourcis={raccourcisChamp(e)}
        aideSaisie={aideSaisie(e)}
        tentativesUtilisees={etat.tentativesUtilisees}
        tentativesMax={tentativesMaxEcran(ecran)}
        erronee={erronee}
        messageFaux={messageFaux}
        nonComptee={nonComptee}
        onValider={(texte) => {
          const statut = diagnostiquerCorrection(e, texte);
          if (statut === "parse_error" || statut === "approchee") {
            setNonComptee(statut);
            return;
          }
          const correct = statut === "correct";
          setErronee(!correct);
          setMessageFaux(!correct && estResultatCopie(e, texte) ? `C'est le résultat de la copie : reprends la résolution à partir de la ligne ${indiceLigneFausse(e) + 1}.` : null);
          conclure(correct, saisieEcrite(texte));
        }}
      />
    );
  }

  const blocDonnees = (
    <>
      <p style={{ margin: "6px 0" }}>
        <RenduFragments fragments={enonceExercice(e)} />
      </p>
      <CopieEleve lignes={lignesCopie(e)} ligneSignalee={ecran >= 1 ? indiceLigneFausse(e) : null} />
    </>
  );

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">5e — Entraînement</p>
        <h1 className="app-title">Détective d'erreurs : suites</h1>
        <p className="app-subtitle">Chapitre 3 — Suites</p>
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
