import { Fragment, useState } from "react";
import type { ReactNode } from "react";
import type { EtapeCorrection } from "../../export/genererFeuilleExercices";
import type { CatalogueVarianteEntree } from "../../export/genererFeuilleExercices";
import { genererAvecCode, lireCodeDepuisUrl } from "../../export/codeExercice";
import { lettreEtape, lignesDeLEtape } from "../../export/corrigeTableau";
import { CorrigeDetailleEcran } from "../../components/CorrigeDetailleEcran";
import { ProgressionPuces } from "../../components/ProgressionPuces";
import { FicheReponseEcran } from "../../components/FicheReponseEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import type { EcranTSD } from "../ui/ecransTransfertSecondDegre";
import { ecranClos, segmentsDepuisHistorique, type EcranClos } from "../ui/historiqueProgression";
import { activerAide, demarrer, ecranSuivant, soumettre, tentativesMax, type EtatTransfert } from "../moteur/sessionTransfertSecondDegre";
import { diagnostiquerChamps, type StatutChamp } from "../moteur/verificationTransfertSecondDegre";
import { SelecteurVarianteDev } from "./SelecteurVarianteDev";
import { EnTeteExercice } from "./EnTeteExercice";
import { RenduFragments } from "./RenduFragments";
import { EtapeChoixTransformation } from "./EtapesTransformationDonnees";
import { EtapeChampsTransfert, saisieAffichee } from "./EtapesTransfertSecondDegre";

/**
 * Coquille commune des nouveaux générateurs du chapitre 2 de 4e (gen115, gen116, gen118, gen119,
 * gen120) : chaque appli (`AppXxx.tsx`) ne fournit que ses données — générateur, catalogue,
 * écrans (`EcranTSD[]`), énoncé et corrigé détaillé. Progression par puces (fiches cliquables),
 * choix fermé à UNE tentative, champs à 3 tentatives (une saisie illisible ne compte pas), aides
 * graduées, corrigé détaillé « comme au tableau » de l'étape quand la réponse est révélée, champs
 * vides à chaque nouvel exercice (clé de génération). Aucun point affiché. `?code=` : la première
 * instance est tirée avec les MÊMES fonctions que l'adaptateur papier.
 */

export interface PropsAppTransfert<E> {
  titre: string;
  sousTitre: string;
  catalogue: CatalogueVarianteEntree[];
  generer: () => E;
  construireAvecVariante: (id: string) => E;
  ecrans: (e: E) => EcranTSD[];
  consigneGenerale: (e: E) => ReactNode;
  blocDonnees: (e: E) => ReactNode;
  correction: (e: E) => EtapeCorrection[];
}

interface TransitionEnAttente {
  revele: boolean;
  reponseAttendue: ReactNode;
  messageRevele?: string;
  derniere: boolean;
}

function reponseAttendue(def: EcranTSD): ReactNode {
  if (def.type === "choix") return <RenduFragments fragments={def.options[def.bonne]!} />;
  return <RenduFragments fragments={def.reponse} />;
}

function Figure({ svg }: { svg: string }) {
  return <div className="figure-transfert-second-degre" style={{ margin: "10px auto 4px", maxWidth: 420 }} dangerouslySetInnerHTML={{ __html: svg }} />;
}

export function AppTransfertSecondDegre<E>(props: PropsAppTransfert<E>) {
  const { titre, sousTitre, catalogue, generer, construireAvecVariante } = props;
  const [etat, setEtat] = useState<EtatTransfert<E>>(() => {
    const code = lireCodeDepuisUrl();
    return demarrer(code ? genererAvecCode(code, catalogue, generer, construireAvecVariante) : generer());
  });
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  const [historique, setHistorique] = useState<EcranClos[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);
  const [generation, setGeneration] = useState(0);
  const [statuts, setStatuts] = useState<StatutChamp[] | null>(null);
  const [illisible, setIllisible] = useState(false);

  const e = etat.exercice;
  const tous = props.ecrans(e);
  const ecran = etat.ecran;
  const def = tous[ecran]!;

  function recommencer(exercice: E) {
    setEtat(demarrer(exercice));
    setEnAttente(null);
    setHistorique([]);
    setFicheOuverteIndex(null);
    setStatuts(null);
    setIllisible(false);
    setGeneration((g) => g + 1);
  }

  function conclure(correct: boolean, votreReponse: ReactNode) {
    const resultat = soumettre(etat, def, correct);
    setIllisible(false);
    if (!resultat.clos) {
      setEtat(resultat.etat);
      return;
    }
    const attendue = reponseAttendue(def);
    setHistorique((h) => [...h, ecranClos(def.titre, votreReponse, resultat.revele, etat.niveauAide > 0, attendue)]);
    setEtat(resultat.etat);
    setEnAttente({
      revele: resultat.revele,
      reponseAttendue: attendue,
      messageRevele: def.type === "choix" ? def.messageFaux : undefined,
      derniere: ecran >= tous.length - 1,
    });
  }

  function passerEcranSuivant() {
    if (!enAttente) return;
    if (enAttente.derniere) {
      recommencer(generer());
      return;
    }
    setEtat(ecranSuivant(etat));
    setStatuts(null);
    setIllisible(false);
    setEnAttente(null);
  }

  const validation: ValidationEtapeProps | null = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue: enAttente.reponseAttendue,
        labelSuivant: enAttente.derniere ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
        messageRevele: enAttente.messageRevele,
        corrigeDetaille: <CorrigeDetailleEcran etapes={lignesDeLEtape(props.correction(e), lettreEtape(ecran))} />,
      }
    : null;

  const communs = { niveauAide: etat.niveauAide, onActiverAide: () => setEtat(activerAide(etat, def.aides.length)), validation, aides: def.aides, consigne: def.consigne };

  function ecranCourant(): ReactNode {
    if (def.type === "choix") {
      return <EtapeChoixTransformation {...communs} options={def.options} bonne={def.bonne} onValider={(i) => conclure(i === def.bonne, <RenduFragments fragments={def.options[i]!} />)} />;
    }
    return (
      <EtapeChampsTransfert
        {...communs}
        champs={def.champs}
        tentativesUtilisees={etat.tentativesUtilisees}
        tentativesMax={tentativesMax(def)}
        statuts={statuts}
        illisible={illisible}
        onValider={(saisies) => {
          const diagnostic = diagnostiquerChamps(saisies, def.champs);
          if (diagnostic.some((s) => s.etat === "parse_error")) {
            setIllisible(true);
            return;
          }
          setStatuts(diagnostic);
          conclure(
            diagnostic.every((s) => s.etat === "correct"),
            <span>
              {def.champs.map((c, i) => (
                <span key={c.id} style={{ marginRight: 14, display: "inline-block" }}>
                  <RenduFragments fragments={c.libelle} /> {saisieAffichee(saisies[i]!, c)}
                  {c.unite && c.type !== "ensemble" ? ` ${c.unite}` : ""}
                </span>
              ))}
            </span>,
          );
        }}
      />
    );
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">4e — Entraînement</p>
        <h1 className="app-title">{titre}</h1>
        <p className="app-subtitle">{sousTitre}</p>
        <SelecteurVarianteDev options={catalogue} onGenerer={(id) => recommencer(construireAvecVariante(id))} />
      </header>

      <main className="card">
        <ProgressionPuces segments={segmentsDepuisHistorique(historique, tous.length, !enAttente)} onSegmentClick={(index) => setFicheOuverteIndex(index)} />

        <div className="card-body">
          <EnTeteExercice consigneGenerale={props.consigneGenerale(e)} blocDonnees={props.blocDonnees(e)} />
          {def.figure && <Figure svg={def.figure} />}
          <Fragment key={`${generation}-${ecran}`}>{ecranCourant()}</Fragment>
          {enAttente && def.figureApres && <Figure svg={def.figureApres} />}
        </div>
      </main>

      {ficheOuverteIndex !== null && historique[ficheOuverteIndex] && (
        <FicheReponseEcran entree={historique[ficheOuverteIndex].entree} onFermer={() => setFicheOuverteIndex(null)} />
      )}
    </div>
  );
}
