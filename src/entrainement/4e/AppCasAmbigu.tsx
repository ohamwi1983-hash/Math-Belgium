import { Fragment, useState } from "react";
import type { ReactNode } from "react";
import type { ExerciceCasAmbigu } from "./core/casAmbigu.types";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceCasAmbigu } from "./generateurs/casAmbigu";
import { genererAvecCode, lireCodeDepuisUrl } from "../export/codeExercice";
import { NOMBRE_ECRANS, activerAide, demarrer, ecranFerme, ecranSuivant, soumettre, tentativesMaxEcran, type EtatCasAmbigu } from "./moteur/sessionCasAmbigu";
import { resoudreSSA } from "./moteur/modeleCasAmbigu";
import { REPONSE_ARC_SANS_CANDIDAT, diagnostiquerChamps, lireNombreCasAmbigu, verifierArc, verifierComparaison, verifierNombre, type StatutChampCasAmbigu } from "./moteur/verificationCasAmbigu";
import {
  CONSIGNE_GENERALE,
  MESSAGES_REVELE,
  OPTIONS_ARC,
  OPTIONS_COMPARAISON,
  OPTIONS_NOMBRE,
  TITRES_ECRANS,
  aidesEcran,
  consignesEcrans,
  donneesFragments,
  libellesChamps,
  optionComparaison,
  optionNombre,
  reponsesChampsLatex,
} from "./ui/formatCasAmbigu";
import { ecranClos, segmentsDepuisHistorique, type EcranClos } from "./ui/historiqueProgression";
import { SelecteurVarianteDev } from "./components/SelecteurVarianteDev";
import { EnTeteExercice } from "./components/EnTeteExercice";
import { CalculatriceScientifique } from "./components/CalculatriceScientifique";
import { Katex } from "./components/Katex";
import { RenduFragments } from "./components/RenduFragments";
import { FigureCasAmbigu } from "./components/FigureCasAmbigu";
import { EtapeChampsCasAmbigu, EtapeChoixCasAmbigu } from "./components/EtapesCasAmbigu";
import { ProgressionPuces } from "../components/ProgressionPuces";
import { FicheReponseEcran } from "../components/FicheReponseEcran";
import type { ValidationEtapeProps } from "../components/ValidationEcran";

/**
 * gen74 — « Cas ambigu : 0, 1 ou 2 triangles ? » (4e, chapitre 5, section « triangle », processus 2
 * APPLIQUER). Données SSA : a, b et l'angle Â opposé à a. Toujours 5 écrans (la barre de progression
 * ne trahit pas l'issue) :
 * 1. sin B̂ = b · sin Â / a (champ, au millième) ;
 * 2. trancher : sin B̂ > 1, = 1 ou < 1 (choix fermé, une tentative) ;
 * 3. tester les candidats : B̂ et Â + B̂ pour chacun (champs) — ou, sans candidat, que fait l'arc de
 *    compas (choix fermé) ;
 * 4. nombre de triangles : 0, 1 ou 2 (choix fermé, une tentative) — la figure montre ensuite l'arc
 *    de compas de centre C et de rayon a ;
 * 5. le côté c de chaque triangle (un champ par triangle) — ou, sans triangle, la plus petite
 *    longueur de BC qui en donnerait un (la hauteur h).
 * Aucun point affiché. `?code=` (QR code d'une feuille) : première instance tirée avec les MÊMES
 * fonctions que l'adaptateur.
 */

function exerciceInitial(): ExerciceCasAmbigu {
  const code = lireCodeDepuisUrl();
  if (!code) return genererExerciceCasAmbigu();
  return genererAvecCode(code, CATALOGUE_VARIANTES, genererExerciceCasAmbigu, construireAvecVariante);
}

interface TransitionEnAttente {
  revele: boolean;
  reponseAttendue: ReactNode;
  messageRevele?: string;
  derniere: boolean;
}

function ListeLatex({ lignes }: { lignes: string[] }) {
  if (lignes.length === 1) return <Katex expression={lignes[0]!} />;
  return (
    <ul style={{ margin: 0, paddingLeft: "1.2em" }}>
      {lignes.map((l) => (
        <li key={l}>
          <Katex expression={l} />
        </li>
      ))}
    </ul>
  );
}

function reponseAttendue(e: ExerciceCasAmbigu, ecran: number): ReactNode {
  const r = resoudreSSA(e);
  if (ecran === 1) return <RenduFragments fragments={optionComparaison(r.comparaison).fragments} />;
  if (ecran === 3) return <RenduFragments fragments={optionNombre(r.nombreTriangles).fragments} />;
  if (ecran === 2 && r.candidats.length === 0) return <RenduFragments fragments={OPTIONS_ARC.find((o) => o.id === REPONSE_ARC_SANS_CANDIDAT)!.fragments} />;
  return <ListeLatex lignes={reponsesChampsLatex(e, ecran)} />;
}

/** Saisies relues pour la fiche d'historique : libellé + valeur tapée (virgule décimale). */
function saisiesLues(e: ExerciceCasAmbigu, ecran: number, saisies: string[]): ReactNode {
  const champs = libellesChamps(e, ecran);
  return (
    <ul style={{ margin: 0, paddingLeft: "1.2em" }}>
      {champs.map((c, i) => {
        const v = lireNombreCasAmbigu(saisies[i] ?? "");
        const texte = v === null ? (saisies[i] ?? "") : String(v).replace(".", ",").replace("-", "−");
        return (
          <li key={i}>
            <RenduFragments fragments={c.libelle} /> {texte}
            {c.suffixe === "°" ? "°" : c.suffixe ? ` ${c.suffixe}` : ""}
          </li>
        );
      })}
    </ul>
  );
}

export function AppCasAmbigu() {
  const [etat, setEtat] = useState<EtatCasAmbigu>(() => demarrer(exerciceInitial()));
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  const [historique, setHistorique] = useState<EcranClos[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);
  /** Clé des écrans : les champs repartent vides après « Générer » ou « Nouvel exercice ». */
  const [generation, setGeneration] = useState(0);
  const [statuts, setStatuts] = useState<StatutChampCasAmbigu[] | null>(null);
  const [erreurLecture, setErreurLecture] = useState(false);

  const e = etat.exercice;
  const ecran = etat.ecran;
  const r = resoudreSSA(e);

  function recommencer(exercice: ExerciceCasAmbigu) {
    setEtat(demarrer(exercice));
    setEnAttente(null);
    setHistorique([]);
    setFicheOuverteIndex(null);
    setStatuts(null);
    setErreurLecture(false);
    setGeneration((g) => g + 1);
  }

  function conclure(correct: boolean, votreReponse: ReactNode) {
    const resultat = soumettre(etat, correct);
    setErreurLecture(false);
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
      messageRevele: ecranFerme(e, ecran) ? MESSAGES_REVELE[ecran] : undefined,
      derniere: ecran >= NOMBRE_ECRANS - 1,
    });
  }

  function passerEcranSuivant() {
    if (!enAttente) return;
    if (enAttente.derniere) {
      recommencer(genererExerciceCasAmbigu());
      return;
    }
    setEtat(ecranSuivant(etat));
    setStatuts(null);
    setEnAttente(null);
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

  function choixFerme(options: typeof OPTIONS_NOMBRE, attendu: string, verifier: (choix: string) => boolean) {
    return (
      <EtapeChoixCasAmbigu
        {...communs}
        consigne={consigne}
        options={options}
        attendu={attendu}
        onValider={(choix) => conclure(verifier(choix), <RenduFragments fragments={options.find((o) => o.id === choix)!.fragments} />)}
      />
    );
  }

  function ecranCourant(): ReactNode {
    if (ecran === 1) return choixFerme(OPTIONS_COMPARAISON, r.comparaison, (c) => verifierComparaison(e, c));
    if (ecran === 3) return choixFerme(OPTIONS_NOMBRE, String(r.nombreTriangles), (c) => verifierNombre(e, c));
    if (ecran === 2 && r.candidats.length === 0) return choixFerme(OPTIONS_ARC, REPONSE_ARC_SANS_CANDIDAT, verifierArc);
    return (
      <EtapeChampsCasAmbigu
        {...communs}
        consigne={consigne}
        champs={libellesChamps(e, ecran)}
        idBase={`ca-${ecran}`}
        parPaires={ecran === 2 && r.candidats.length === 2}
        tentativesUtilisees={etat.tentativesUtilisees}
        tentativesMax={tentativesMaxEcran(e, ecran)}
        statuts={statuts}
        erreurLecture={erreurLecture}
        onValider={(saisies) => {
          const diagnostic = diagnostiquerChamps(e, ecran, saisies);
          if (diagnostic.includes("parse_error")) {
            setErreurLecture(true);
            return;
          }
          setStatuts(diagnostic);
          conclure(
            diagnostic.every((s) => s === "correct"),
            saisiesLues(e, ecran, saisies),
          );
        }}
      />
    );
  }

  // L'arc de compas n'apparaît qu'une fois le nombre de triangles tranché (écran 4 clos).
  const avecArc = ecran > 3 || (ecran === 3 && enAttente !== null);

  const blocDonnees = (
    <>
      <p style={{ margin: "6px 0" }}>
        <RenduFragments fragments={donneesFragments(e)} />
      </p>
      <FigureCasAmbigu exercice={e} avecArc={avecArc} />
    </>
  );

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">4e — Entraînement</p>
        <h1 className="app-title">Cas ambigu : 0, 1 ou 2 triangles ?</h1>
        <p className="app-subtitle">Chapitre 5 — Cercle trigonométrique & triangles quelconques</p>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={(id) => recommencer(construireAvecVariante(id))} />
      </header>

      <main className="card">
        <ProgressionPuces segments={segmentsDepuisHistorique(historique, NOMBRE_ECRANS, !enAttente)} onSegmentClick={(index) => setFicheOuverteIndex(index)} />

        <div className="card-body">
          <EnTeteExercice consigneGenerale={<RenduFragments fragments={CONSIGNE_GENERALE} />} blocDonnees={blocDonnees} />
          <CalculatriceScientifique />
          <Fragment key={`${generation}-${ecran}`}>{ecranCourant()}</Fragment>
        </div>
      </main>

      {ficheOuverteIndex !== null && historique[ficheOuverteIndex] && (
        <FicheReponseEcran entree={historique[ficheOuverteIndex].entree} onFermer={() => setFicheOuverteIndex(null)} />
      )}
    </div>
  );
}
