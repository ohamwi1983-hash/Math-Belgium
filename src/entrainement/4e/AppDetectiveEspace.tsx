import { Fragment, useState } from "react";
import type { ReactNode } from "react";
import type { ExerciceDetectiveEspace } from "./core/detectiveEspace.types";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceDetectiveEspace } from "./generateurs/detectiveEspace";
import { genererAvecCode, lireCodeDepuisUrl } from "../export/codeExercice";
import { activerAide, demarrer, ecranSuivant, verifierChoix, type EtatDetectiveEspace } from "./moteur/sessionDetectiveEspace";
import { CONSIGNE_GENERALE, NOMBRE_ECRANS, TITRES_ECRANS, aidesEcran, cadreCommun, consignesEcrans, correctionCorrecte, descriptionCorrecte, dessinPaveSvg } from "./ui/formatDetectiveEspace";
import { ecranClos, segmentsDepuisHistorique, type EcranClos } from "./ui/historiqueProgression";
import { SelecteurVarianteDev } from "./components/SelecteurVarianteDev";
import { EnTeteExercice } from "./components/EnTeteExercice";
import { RenduFragments } from "./components/RenduFragments";
import { CopieEleve, EtapeDescriptionErreur, EtapeLigneFausse } from "./components/EtapesDetectiveErreurs";
import { EtapeChoixDessin, FigureDetectiveEspace } from "./components/EtapesDetectiveEspace";
import { ProgressionPuces } from "../components/ProgressionPuces";
import { FicheReponseEcran } from "../components/FicheReponseEcran";
import type { ValidationEtapeProps } from "../components/ValidationEcran";

/**
 * gen107 — « Détective d'erreurs : géométrie dans l'espace » (4e, chapitre 8, section « revision »,
 * processus 3 TRANSFÉRER), même mécanique que gen91 / 6gen99. La copie d'un élève fictif — position
 * de droites, plans déterminés, section plane, démonstration d'un parallélisme ou dessin en
 * perspective cavalière — contient UNE ligne fausse. Trois écrans, tous des choix fermés (UNE
 * tentative ; la bonne réponse est montrée après un échec) :
 * 1. quelle ligne est fausse ? 2. quelle est l'erreur ? 3. la correction (ligne corrigée, droite,
 * justification ou dessin juste).
 * Aucun point affiché. `?code=` (QR code d'une feuille) : première instance tirée avec les MÊMES
 * fonctions que l'adaptateur.
 */

function exerciceInitial(): ExerciceDetectiveEspace {
  const code = lireCodeDepuisUrl();
  if (!code) return genererExerciceDetectiveEspace();
  return genererAvecCode(code, CATALOGUE_VARIANTES, genererExerciceDetectiveEspace, construireAvecVariante);
}

interface TransitionEnAttente {
  revele: boolean;
  reponseAttendue: ReactNode;
  messageRevele?: string;
  derniere: boolean;
}

function Fragments({ f }: { f: Parameters<typeof RenduFragments>[0]["fragments"] }) {
  return (
    <p style={{ margin: 0 }}>
      <RenduFragments fragments={f} />
    </p>
  );
}

/** Un dessin (thème cavalière) dans la fiche d'un écran. */
function DessinFiche({ e, indice }: { e: ExerciceDetectiveEspace; indice: number }) {
  const dessins = e.corrections.map((c) => c.dessin!);
  const svg = dessinPaveSvg(dessins[indice]!, "ecran", { etiquettes: false, cadre: cadreCommun(dessins) });
  return <div style={{ maxWidth: 220 }} dangerouslySetInnerHTML={{ __html: svg }} />;
}

function reponseEcran(e: ExerciceDetectiveEspace, ecran: number, choix: number): ReactNode {
  if (ecran === 0) return <p style={{ margin: 0 }}>{`Ligne ${choix + 1}`}</p>;
  if (ecran === 1) return <Fragments f={e.descriptions[choix]!.fragments} />;
  if (e.theme === "cavaliere") return <DessinFiche e={e} indice={choix} />;
  return <Fragments f={e.corrections[choix]!.fragments} />;
}

function reponseAttendue(e: ExerciceDetectiveEspace, ecran: number): ReactNode {
  if (ecran === 0) return <p style={{ margin: 0 }}>{`Ligne ${e.ligneFausse + 1}`}</p>;
  if (ecran === 1) return <Fragments f={descriptionCorrecte(e)} />;
  if (e.theme === "cavaliere") return <DessinFiche e={e} indice={e.corrections.indexOf(correctionCorrecte(e))} />;
  return <Fragments f={correctionCorrecte(e).fragments} />;
}

export function AppDetectiveEspace() {
  const [etat, setEtat] = useState<EtatDetectiveEspace>(() => demarrer(exerciceInitial()));
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  const [historique, setHistorique] = useState<EcranClos[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);
  /** Clé des écrans : les choix repartent vides après « Générer » ou « Nouvel exercice ». */
  const [generation, setGeneration] = useState(0);

  const e = etat.exercice;
  const ecran = etat.ecran;

  function recommencer(exercice: ExerciceDetectiveEspace) {
    setEtat(demarrer(exercice));
    setEnAttente(null);
    setHistorique([]);
    setFicheOuverteIndex(null);
    setGeneration((g) => g + 1);
  }

  function conclure(choix: number) {
    const correct = verifierChoix(e, ecran, choix);
    const attendue = reponseAttendue(e, ecran);
    setHistorique((h) => [...h, ecranClos(TITRES_ECRANS[ecran]!, reponseEcran(e, ecran, choix), !correct, etat.niveauAide > 0, attendue)]);
    setEnAttente({
      revele: !correct,
      reponseAttendue: attendue,
      messageRevele: ecran === 0 ? "Ce n'était pas la ligne fausse." : ecran === 1 ? "Ce n'était pas la bonne explication." : "Ce n'était pas la bonne correction.",
      derniere: ecran >= NOMBRE_ECRANS - 1,
    });
  }

  function passerEcranSuivant() {
    if (!enAttente) return;
    if (enAttente.derniere) {
      recommencer(genererExerciceDetectiveEspace());
      return;
    }
    setEtat(ecranSuivant(etat));
    setEnAttente(null);
  }

  // Hook DEV-ONLY (même garde que `SelecteurVarianteDev`) : exercice tiré exposé pour Playwright.
  const modeDevActif = import.meta.env.DEV || new URLSearchParams(window.location.search).get("dev") === "1";
  if (modeDevActif) {
    (window as unknown as { __debugGen107?: unknown }).__debugGen107 = { exercice: e, ecran };
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
      return <EtapeLigneFausse {...communs} consigne={consigne} nombreLignes={e.lignes.length} attendue={e.ligneFausse} onValider={conclure} />;
    }
    if (ecran === 1) {
      return (
        <EtapeDescriptionErreur<string>
          {...communs}
          consigne={consigne}
          options={e.descriptions.map((d, i) => ({ id: String(i), fragments: d.fragments }))}
          attendue={String(e.descriptions.findIndex((d) => d.correcte))}
          onValider={(id) => conclure(Number(id))}
        />
      );
    }
    if (e.theme === "cavaliere") {
      return <EtapeChoixDessin {...communs} consigne={consigne} dessins={e.corrections.map((c) => c.dessin!)} attendue={e.corrections.findIndex((c) => c.correcte)} onValider={conclure} />;
    }
    return (
      <EtapeDescriptionErreur<string>
        {...communs}
        consigne={consigne}
        options={e.corrections.map((d, i) => ({ id: String(i), fragments: d.fragments }))}
        attendue={String(e.corrections.findIndex((d) => d.correcte))}
        onValider={(id) => conclure(Number(id))}
      />
    );
  }

  const blocDonnees = (
    <>
      <p style={{ margin: "6px 0" }}>
        <RenduFragments fragments={e.enonce} />
      </p>
      <FigureDetectiveEspace key={generation} e={e} />
      <CopieEleve lignes={e.lignes} ligneSignalee={ecran >= 1 ? e.ligneFausse : null} />
    </>
  );

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">4e — Entraînement</p>
        <h1 className="app-title">Détective d'erreurs : géométrie dans l'espace</h1>
        <p className="app-subtitle">Chapitre 8 — Géométrie dans l'espace</p>
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
