import { Fragment, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { FragmentConsigne } from "../export/genererFeuilleExercices";
import { latex } from "../export/fragmentsDocx";
import type { ExerciceComposantes, ExerciceDecompositionVecteur, SystemeOption } from "./core/decompositionVecteur.types";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceDecompositionVecteur } from "./generateurs/decompositionVecteur";
import { genererAvecCode, lireCodeDepuisUrl } from "../export/codeExercice";
import { activerAide, demarrer, ecranSuivant, soumettre, tentativesMaxEcran, type EtatDecompositionVecteur } from "./moteur/sessionDecompositionVecteur";
import {
  diagnostiquerCoefficient,
  diagnostiquerK,
  diagnostiquerResolution,
  diagnostiquerVerification,
  lireNombre,
  verifierPoint,
  verifierSysteme,
  verifierVerdict,
} from "./moteur/verificationDecompositionVecteur";
import { nombreEcrans } from "./moteur/modeleDecompositionVecteur";
import {
  LIBELLES_VERDICT,
  MESSAGE_VERIFICATION,
  U,
  V,
  W,
  aidesEcran,
  combinaisonLatex,
  composantesLatex,
  consigneGenerale,
  consignesEcrans,
  enonceFragments,
  libelleOptionPoint,
  messageCoefficient,
  messageK,
  messageResolution,
  messageRevele,
  nombreLatex,
  reponseAttendueFragments,
  systemeOptionLatex,
  termeSansSigneSigne,
  titresEcrans,
} from "./ui/formatDecompositionVecteur";
import { construireFigureDecomposition } from "./ui/figureDecompositionVecteur";
import { ecranClos, segmentsDepuisHistorique, type EcranClos } from "./ui/historiqueProgression";
import { SelecteurVarianteDev } from "./components/SelecteurVarianteDev";
import { EnTeteExercice } from "./components/EnTeteExercice";
import { Katex } from "./components/Katex";
import { RenduFragments } from "./components/RenduFragments";
import { EtapeChampsDecomposition, EtapeChoixDecomposition, type GroupeChamps, type OptionChoix } from "./components/EtapesDecompositionVecteur";
import { ProgressionPuces } from "../components/ProgressionPuces";
import { FicheReponseEcran } from "../components/FicheReponseEcran";
import type { ValidationEtapeProps } from "../components/ValidationEcran";

/**
 * gen82 — « Décomposer un vecteur selon deux directions » (4e, chapitre 6, section
 * « decompositionGeometrique », processus 2 APPLIQUER).
 * - Famille graphique (réseau de parallélogrammes, parallélogramme découpé, hexagone régulier,
 *   quadrillage) : 1. le point de construction M (choix fermé, une tentative) — parallèle à v par
 *   l'origine de u, parallèle à w par son extrémité ; 2. a (\vec{PM} = a\vec{v}) ; 3. b, et la
 *   combinaison complète s'affiche à la validation. Écrire la combinaison n'est pas un écran à part :
 *   ce serait recopier deux nombres déjà validés.
 * - Composantes : 1. le système (choix fermé) ; 2. a et b ; 3. vérification (a·v et b·w).
 * - « Possible ? » : 1. verdict (choix fermé) ; 2. a et b, ou k tel que w = k·v.
 * Aucun point affiché. `?code=` (QR code d'une feuille) : première instance tirée avec les MÊMES
 * fonctions que l'adaptateur.
 */

function exerciceInitial(): ExerciceDecompositionVecteur {
  const code = lireCodeDepuisUrl();
  if (!code) return genererExerciceDecompositionVecteur();
  return genererAvecCode(code, CATALOGUE_VARIANTES, genererExerciceDecompositionVecteur, construireAvecVariante);
}

interface TransitionEnAttente {
  revele: boolean;
  reponseAttendue: ReactNode;
  messageRevele?: string;
  derniere: boolean;
}

function valeurLatex(texte: string): string {
  const x = lireNombre(texte);
  return x === null ? texte : nombreLatex(x);
}

function groupesResolution(): GroupeChamps[] {
  return [
    { label: [latex("a =")], n: 1 },
    { label: [latex("b =")], n: 1 },
  ];
}

function groupesVerification(e: ExerciceComposantes): GroupeChamps[] {
  return [
    { label: [latex(`${termeSansSigneSigne(e.a!, V)} =`)], n: 2 },
    { label: [latex(`${termeSansSigneSigne(e.b!, W)} =`)], n: 2 },
  ];
}

export function AppDecompositionVecteur() {
  const [etat, setEtat] = useState<EtatDecompositionVecteur>(() => demarrer(exerciceInitial()));
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  const [historique, setHistorique] = useState<EcranClos[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);
  /** Clé des écrans : les champs repartent vides après « Générer » ou « Nouvel exercice ». */
  const [generation, setGeneration] = useState(0);
  const [erronees, setErronees] = useState<boolean[] | null>(null);
  const [message, setMessage] = useState<FragmentConsigne[] | null>(null);
  const [erreurLecture, setErreurLecture] = useState(false);

  const e = etat.exercice;
  const ecran = etat.ecran;
  const total = nombreEcrans(e);

  function recommencer(exercice: ExerciceDecompositionVecteur) {
    setEtat(demarrer(exercice));
    setEnAttente(null);
    setHistorique([]);
    setFicheOuverteIndex(null);
    setErronees(null);
    setMessage(null);
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
    const attendue = <RenduFragments fragments={reponseAttendueFragments(e, ecran)} />;
    setHistorique((h) => [...h, ecranClos(titresEcrans(e)[ecran]!, votreReponse, resultat.revele, etat.niveauAide > 0, attendue)]);
    setEtat(resultat.etat);
    setEnAttente({ revele: resultat.revele, reponseAttendue: attendue, messageRevele: messageRevele(e, ecran), derniere: ecran >= total - 1 });
  }

  function passerEcranSuivant() {
    if (!enAttente) return;
    if (enAttente.derniere) {
      recommencer(genererExerciceDecompositionVecteur());
      return;
    }
    setEtat(ecranSuivant(etat));
    setErronees(null);
    setMessage(null);
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

  // Figure : la droite d'aide (parallèle à v par P) au 2e niveau d'aide de l'écran 1 ; la
  // construction (PM et MQ) dès que l'écran 1 est clos — jamais avant, ce serait sa réponse.
  const clos = historique.length;
  const droiteV = ecran === 0 && !enAttente && etat.niveauAide >= 2;
  const figure = useMemo(
    () => (e.type === "graphique" ? construireFigureDecomposition(e, { theme: "ecran", construction: clos >= 1, droiteV }) : null),
    [e, clos, droiteV],
  );

  const consigne = <RenduFragments fragments={consignesEcrans(e)[ecran]!} />;
  const communs = { niveauAide: etat.niveauAide, onActiverAide: () => setEtat(activerAide(etat)), validation, aides: aidesEcran(e, ecran) };
  const champsCommuns = { tentativesUtilisees: etat.tentativesUtilisees, tentativesMax: tentativesMaxEcran(ecran), erronees, message, erreurLecture };

  function ecranResolution(ex: ExerciceComposantes): ReactNode {
    return (
      <EtapeChampsDecomposition
        {...communs}
        {...champsCommuns}
        consigne={consigne}
        groupes={groupesResolution()}
        conclusion={[latex(`${U} = ${combinaisonLatex(ex.a!, ex.b!)}`)]}
        onValider={([ta, tb]) => {
          const d = diagnostiquerResolution(ex, ta!, tb!);
          if (d.statut === "parse_error") {
            setErreurLecture(true);
            return;
          }
          setErronees([!d.aJuste, !d.bJuste]);
          setMessage(messageResolution(d.statut));
          conclure(d.statut === "correct", <Katex expression={`a = ${valeurLatex(ta!)} \\quad ; \\quad b = ${valeurLatex(tb!)}`} />);
        }}
      />
    );
  }

  function ecranCourant(): ReactNode {
    if (e.type === "graphique") {
      if (ecran === 0) {
        const options: OptionChoix[] = e.options.map((nom) => ({ id: nom, rendu: libelleOptionPoint(nom), label: libelleOptionPoint(nom) }));
        return <EtapeChoixDecomposition {...communs} consigne={consigne} options={options} attendu={e.pointM} onValider={(choix) => conclure(verifierPoint(e, choix), `M = ${choix}`)} />;
      }
      const ec = ecran as 1 | 2;
      const nom = ec === 1 ? "a" : "b";
      return (
        <EtapeChampsDecomposition
          {...communs}
          {...champsCommuns}
          consigne={consigne}
          groupes={[{ label: [latex(`${nom} =`)], n: 1 }]}
          conclusion={ec === 2 ? [latex(`${U} = ${combinaisonLatex(e.a, e.b)}`)] : undefined}
          onValider={([t]) => {
            const statut = diagnostiquerCoefficient(e, ec, t!);
            if (statut === "parse_error") {
              setErreurLecture(true);
              return;
            }
            setErronees([statut !== "correct"]);
            setMessage(messageCoefficient(e, ec, statut));
            conclure(statut === "correct", <Katex expression={`${nom} = ${valeurLatex(t!)}`} />);
          }}
        />
      );
    }
    if (e.famille === "composantes") {
      if (ecran === 0) {
        const options: OptionChoix[] = e.ordreSystemes.map((o, i) => ({ id: o, rendu: <Katex expression={systemeOptionLatex(e, o)} />, label: `Système ${i + 1}` }));
        return (
          <EtapeChoixDecomposition
            {...communs}
            consigne={consigne}
            options={options}
            attendu="correct"
            colonne
            onValider={(choix) => conclure(verifierSysteme(choix as SystemeOption), <Katex expression={systemeOptionLatex(e, choix as SystemeOption)} />)}
          />
        );
      }
      if (ecran === 1) return ecranResolution(e);
      return (
        <EtapeChampsDecomposition
          {...communs}
          {...champsCommuns}
          consigne={consigne}
          groupes={groupesVerification(e)}
          onValider={(textes) => {
            const d = diagnostiquerVerification(e, textes);
            if (d.statut === "parse_error") {
              setErreurLecture(true);
              return;
            }
            setErronees(d.justes.map((j) => !j));
            setMessage(d.statut === "correct" ? null : MESSAGE_VERIFICATION);
            const vec = (i: number) => composantesLatex({ x: lireNombre(textes[i]!)!, y: lireNombre(textes[i + 1]!)! });
            conclure(d.statut === "correct", <Katex expression={`${termeSansSigneSigne(e.a!, V)} = ${vec(0)} \\quad ; \\quad ${termeSansSigneSigne(e.b!, W)} = ${vec(2)}`} />);
          }}
        />
      );
    }
    // Variante « possible ? »
    if (ecran === 0) {
      const options: OptionChoix[] = (["possible", "impossible"] as const).map((o) => ({ id: o, rendu: LIBELLES_VERDICT[o], label: LIBELLES_VERDICT[o] }));
      return (
        <EtapeChoixDecomposition
          {...communs}
          consigne={consigne}
          options={options}
          attendu={e.possible ? "possible" : "impossible"}
          onValider={(choix) => conclure(verifierVerdict(e, choix === "possible"), LIBELLES_VERDICT[choix as "possible" | "impossible"])}
        />
      );
    }
    if (e.possible) return ecranResolution(e);
    return (
      <EtapeChampsDecomposition
        {...communs}
        {...champsCommuns}
        consigne={consigne}
        groupes={[{ label: [latex("k =")], n: 1 }]}
        onValider={([t]) => {
          const statut = diagnostiquerK(e, t!);
          if (statut === "parse_error") {
            setErreurLecture(true);
            return;
          }
          setErronees([statut !== "correct"]);
          setMessage(messageK(statut));
          conclure(statut === "correct", <Katex expression={`k = ${valeurLatex(t!)}`} />);
        }}
      />
    );
  }

  const blocDonnees = (
    <>
      <p style={{ margin: "6px 0" }}>
        <RenduFragments fragments={enonceFragments(e)} />
      </p>
      {figure && <div className="decomposition-vecteur-figure" style={{ maxWidth: 440, margin: "10px auto 0" }} dangerouslySetInnerHTML={{ __html: figure }} />}
    </>
  );

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">4e — Entraînement</p>
        <h1 className="app-title">Décomposer un vecteur selon deux directions</h1>
        <p className="app-subtitle">Chapitre 6 — Calcul vectoriel</p>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={(id) => recommencer(construireAvecVariante(id))} />
      </header>

      <main className="card">
        <ProgressionPuces segments={segmentsDepuisHistorique(historique, total, !enAttente)} onSegmentClick={(index) => setFicheOuverteIndex(index)} />

        <div className="card-body">
          <EnTeteExercice consigneGenerale={consigneGenerale(e)} blocDonnees={blocDonnees} />
          <Fragment key={`${generation}-${ecran}`}>{ecranCourant()}</Fragment>
        </div>
      </main>

      {ficheOuverteIndex !== null && historique[ficheOuverteIndex] && (
        <FicheReponseEcran entree={historique[ficheOuverteIndex].entree} onFermer={() => setFicheOuverteIndex(null)} />
      )}
    </div>
  );
}
