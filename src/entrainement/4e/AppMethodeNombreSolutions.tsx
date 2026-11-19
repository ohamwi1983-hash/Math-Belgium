import { Fragment, useState } from "react";
import type { ReactNode } from "react";
import type { ExerciceMethodeNombreSolutions, IdAffirmation, MethodeRapide } from "./core/methodeNombreSolutions.types";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceMethodeNombreSolutions } from "./generateurs/methodeNombreSolutions";
import { correctionDetailleeMethodeNombreSolutions } from "./generateurs/methodeNombreSolutions/corrigeDetaille";
import { genererAvecCode, lireCodeDepuisUrl } from "../export/codeExercice";
import { CorrigeDetailleEcran } from "../components/CorrigeDetailleEcran";
import { lettreEtape, lignesDeLEtape } from "../export/corrigeTableau";
import { activerAide, demarrer, ecranSuivant, soumettre, tentativesMaxEcran, type EtatMethodeNombreSolutions } from "./moteur/sessionMethodeNombreSolutions";
import { diagnostiquerSolutions, verifierAffirmation, verifierMethode } from "./moteur/verificationMethodeNombreSolutions";
import { affirmationAttendue, enonceLatex, methodesAcceptees, nombreEcrans, solutions } from "./moteur/modeleMethodeNombreSolutions";
import { AIDE_SAISIE, CONSIGNE_GENERALE, METHODES, TITRES_ECRANS, affirmationFragments, aidesEcran, consignesEcrans, libelleMethode, reponseSolutionsFragments } from "./ui/formatMethodeNombreSolutions";
import { lireValeurs } from "./ui/ensembleSolutionTrinome";
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
 * gen113 — « Reconnaître la méthode et le nombre de solutions » (4e, chapitre 2, section `resoudre`,
 * processus 1 CONNAÎTRE). Une équation, 2 ou 3 écrans :
 * 1. la méthode la plus rapide (6 choix, une tentative ; racine évidente OU discriminant acceptés
 *    quand a ± b + c = 0, décision 1) ;
 * 2. le nombre de solutions : la seule affirmation vraie parmi quatre (une tentative) ;
 * 3. les solutions, seulement quand elles sont évidentes (champ libre, 3 tentatives).
 * Aucun point affiché. `?code=` : première instance tirée avec les MÊMES fonctions que l'adaptateur.
 */

function exerciceInitial(): ExerciceMethodeNombreSolutions {
  const code = lireCodeDepuisUrl();
  if (!code) return genererExerciceMethodeNombreSolutions();
  return genererAvecCode(code, CATALOGUE_VARIANTES, genererExerciceMethodeNombreSolutions, construireAvecVariante);
}

interface TransitionEnAttente {
  revele: boolean;
  reponseAttendue: ReactNode;
  messageRevele?: string;
  derniere: boolean;
}

function reponseAttendue(e: ExerciceMethodeNombreSolutions, ecran: number): ReactNode {
  if (ecran === 0) return <p style={{ margin: 0 }}>{methodesAcceptees(e).map(libelleMethode).join(" (ou ") + (methodesAcceptees(e).length > 1 ? ")" : "")}</p>;
  const fragments = ecran === 1 ? affirmationFragments(affirmationAttendue(e)) : reponseSolutionsFragments(e);
  return (
    <p style={{ margin: 0 }}>
      <RenduFragments fragments={fragments} />
    </p>
  );
}

export function AppMethodeNombreSolutions() {
  const [etat, setEtat] = useState<EtatMethodeNombreSolutions>(() => demarrer(exerciceInitial()));
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  const [historique, setHistorique] = useState<EcranClos[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);
  const [generation, setGeneration] = useState(0);
  const [erronee, setErronee] = useState(false);
  const [messageFaux, setMessageFaux] = useState<string | null>(null);
  const [illisible, setIllisible] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  const e = etat.exercice;
  const ecran = etat.ecran;
  const total = nombreEcrans(e);

  function recommencer(exercice: ExerciceMethodeNombreSolutions) {
    setEtat(demarrer(exercice));
    setEnAttente(null);
    setHistorique([]);
    setFicheOuverteIndex(null);
    setErronee(false);
    setMessageFaux(null);
    setIllisible(false);
    setNote(null);
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
    setHistorique((h) => [...h, ecranClos(TITRES_ECRANS[ecran]!, votreReponse, resultat.revele, etat.niveauAide > 0, attendue)]);
    setEtat(resultat.etat);
    setEnAttente({
      revele: resultat.revele,
      reponseAttendue: attendue,
      messageRevele: ecran === 0 ? "Ce n'était pas la méthode la plus rapide." : ecran === 1 ? "Cette affirmation est fausse pour cette équation." : undefined,
      derniere: ecran >= total - 1,
    });
  }

  function passerEcranSuivant() {
    if (!enAttente) return;
    if (enAttente.derniere) {
      recommencer(genererExerciceMethodeNombreSolutions());
      return;
    }
    setEtat(ecranSuivant(etat));
    setErronee(false);
    setMessageFaux(null);
    setNote(null);
    setEnAttente(null);
  }

  const modeDevActif = import.meta.env.DEV || new URLSearchParams(window.location.search).get("dev") === "1";
  if (modeDevActif) {
    (window as unknown as { __debuggen113?: unknown }).__debuggen113 = { exercice: e, ecran };
  }

  const validation: ValidationEtapeProps | null = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue: enAttente.reponseAttendue,
        labelSuivant: enAttente.derniere ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
        messageRevele: enAttente.messageRevele,
        corrigeDetaille: <CorrigeDetailleEcran etapes={lignesDeLEtape(correctionDetailleeMethodeNombreSolutions(e), lettreEtape(ecran))} />,
      }
    : null;

  const consigne = <RenduFragments fragments={consignesEcrans()[ecran]!} />;
  const communs = { aides: aidesEcran(e, ecran), niveauAide: etat.niveauAide, onActiverAide: () => setEtat(activerAide(etat)), validation };

  function ecranCourant(): ReactNode {
    if (ecran === 0) {
      return (
        <ChoixUniqueFragments<MethodeRapide>
          {...communs}
          consigne={consigne}
          libelleGroupe="Méthode la plus rapide"
          disposition="grille"
          options={METHODES.map((m) => ({ id: m.id, fragments: [{ type: "texte", valeur: m.libelle }] }))}
          acceptees={methodesAcceptees(e)}
          note={note}
          onValider={(m) => {
            const ok = verifierMethode(e, m);
            if (ok && m === "discriminant" && e.methode === "racineEvidente") setNote("Juste : le discriminant marche toujours. Mais ici, a + b + c ou a − b + c vaut 0 : la racine évidente est encore plus rapide.");
            conclure(ok, <p style={{ margin: 0 }}>{libelleMethode(m)}</p>);
          }}
        />
      );
    }
    if (ecran === 1) {
      return (
        <ChoixUniqueFragments<IdAffirmation>
          {...communs}
          consigne={consigne}
          libelleGroupe="Nombre de solutions"
          options={e.affirmations.map((id) => ({ id, fragments: affirmationFragments(id) }))}
          acceptees={e.affirmations.filter((id) => verifierAffirmation(e, id))}
          onValider={(id) =>
            conclure(
              verifierAffirmation(e, id),
              <p style={{ margin: 0 }}>
                <RenduFragments fragments={affirmationFragments(id)} />
              </p>,
            )
          }
        />
      );
    }
    return (
      <EtapeChampLibreTrinome
        {...communs}
        consigne={consigne}
        idChamp="methode-solutions-champ"
        libelle={[{ type: "texte", valeur: "Les solutions, séparées par « ; »" }]}
        prefixe={null}
        aideSaisie={AIDE_SAISIE}
        messageIllisible="Écriture non reconnue : écris des nombres séparés par « ; » (fraction 3/4, racine sqrt(2))."
        tentativesUtilisees={etat.tentativesUtilisees}
        tentativesMax={tentativesMaxEcran(ecran)}
        erronee={erronee}
        messageFaux={messageFaux}
        illisible={illisible}
        onValider={(texte) => {
          const statut = diagnostiquerSolutions(e, texte);
          if (statut === "parse_error") {
            setIllisible(true);
            return;
          }
          const correct = statut === "correct";
          const lues = lireValeurs(texte) ?? [];
          const attendues = solutions(e);
          setErronee(!correct);
          setMessageFaux(!correct && lues.length < attendues.length && lues.every((v) => attendues.some((a) => Math.abs(a - v) < 1e-9)) ? "Il manque une solution." : null);
          conclure(correct, <p style={{ margin: 0 }}>{texte.trim().replace(/-/g, "−").replace(/(\d)\.(\d)/g, "$1,$2")}</p>);
        }}
      />
    );
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">4e — Entraînement</p>
        <h1 className="app-title">Méthode et nombre de solutions</h1>
        <p className="app-subtitle">Chapitre 2 — Équations et inéquations du second degré</p>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={(id) => recommencer(construireAvecVariante(id))} />
      </header>

      <main className="card">
        <ProgressionPuces segments={segmentsDepuisHistorique(historique, total, !enAttente)} onSegmentClick={(index) => setFicheOuverteIndex(index)} />
        <div className="card-body">
          <EnTeteExercice
            consigneGenerale={CONSIGNE_GENERALE}
            blocDonnees={
              <div className="apercu-box" style={{ margin: "8px 0" }}>
                <Katex expression={enonceLatex(e)} />
              </div>
            }
          />
          <Fragment key={`${generation}-${ecran}`}>{ecranCourant()}</Fragment>
        </div>
      </main>

      {ficheOuverteIndex !== null && historique[ficheOuverteIndex] && (
        <FicheReponseEcran entree={historique[ficheOuverteIndex].entree} onFermer={() => setFicheOuverteIndex(null)} />
      )}
    </div>
  );
}
