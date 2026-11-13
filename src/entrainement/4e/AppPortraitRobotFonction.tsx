import { Fragment, useState } from "react";
import type { ReactNode } from "react";
import type { ExerciceCourbe, ExerciceDeduction, ExerciceExpression, ExercicePortraitRobot, VerdictComparaison } from "./core/portraitRobotFonction.types";
import type { FamilleReference } from "./core/fonctionsReference.types";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExercicePortraitRobot, sensSymetrique, valeurOpposee } from "./generateurs/portraitRobotFonction";
import { genererAvecCode, lireCodeDepuisUrl } from "../export/codeExercice";
import {
  activerAidePortraitRobot,
  demarrerPortraitRobot,
  ecranSuivantPortraitRobot,
  estChoixFerme,
  soumettrePortraitRobot,
  tentativesMaxEcran,
  type EtatPortraitRobot,
} from "./moteur/sessionPortraitRobot";
import {
  courbesEcartees,
  diagnostiquerExpression,
  verifierComparaisonImages,
  verifierComparaisonValeur,
  verifierConditionViolee,
  verifierControle,
  verifierCourbe,
  verifierFamille,
  verifierTranslations,
  verifierValeurOpposee,
  verifierVariations,
  type ChoixVariations,
} from "./moteur/verificationPortraitRobot";
import {
  LETTRES_COURBES,
  NOMBRE_ECRANS,
  NOMS_FAMILLES,
  TITRES_ECRANS,
  aidesCourbe,
  aidesDeduction,
  aidesExpression,
  avecMajuscule,
  conditionFragments,
  consigneGenerale,
  consignesEcrans,
  donneesDeductionFragments,
  expressionLatex,
  gaucheDroiteImages,
  gaucheDroiteValeur,
  imageLatex,
  libelleSens,
  libelleVerdictComparaison,
  nombreLatex,
  optionsComparaison,
  referenceLatex,
} from "./ui/formatPortraitRobot";
import { OPTIONS_FAMILLE } from "./ui/famillesReferenceLabels";
import { ecranClos, nombreTexte, saisieEnLatex, segmentsDepuisHistorique, type EcranClos } from "./ui/historiqueProgression";
import { SelecteurVarianteDev } from "./components/SelecteurVarianteDev";
import { EnTeteExercice } from "./components/EnTeteExercice";
import { Katex } from "./components/Katex";
import { RenduFragments } from "./components/RenduFragments";
import { EtapeChoixPortrait, EtapeExpressionPortrait, EtapeNombresPortrait } from "./components/EtapesPortraitRobot";
import { GrilleCourbesPortraitRobot } from "./components/CourbesPortraitRobot";
import { ProgressionPuces } from "../components/ProgressionPuces";
import { FicheReponseEcran } from "../components/FicheReponseEcran";
import type { ValidationEtapeProps } from "../components/ValidationEcran";

/**
 * gen71 — « Le portrait-robot d'une fonction » (4e, chapitre 3, section « transformer », processus 3
 * TRANSFÉRER). Trois familles, toujours 4 écrans :
 * - A : fonction de référence (choix fermé) → translations → expression → vérification ;
 * - B : f(−p) → variations sur [−m ; 0] → comparaison de deux images → comparaison à f(p) ;
 * - C : choix de la courbe → pour chaque courbe écartée, la condition qu'elle viole.
 * Choix fermés : une tentative. Aucun point affiché. `?code=` (QR code d'une feuille) : première
 * instance tirée avec les MÊMES fonctions que l'adaptateur `exportEvaluation.ts`.
 */

function exerciceInitial(): ExercicePortraitRobot {
  const code = lireCodeDepuisUrl();
  if (!code) return genererExercicePortraitRobot();
  return genererAvecCode(code, CATALOGUE_VARIANTES, genererExercicePortraitRobot, construireAvecVariante);
}

interface TransitionEnAttente {
  revele: boolean;
  reponseAttendue: ReactNode;
  messageRevele?: string;
  derniere: boolean;
}

function ListeFragments({ items }: { items: Parameters<typeof RenduFragments>[0]["fragments"][] }) {
  return (
    <ul style={{ margin: "8px 0 0", paddingLeft: "1.3em", display: "grid", gap: 6 }}>
      {items.map((fragments, i) => (
        <li key={i}>
          <RenduFragments fragments={fragments} />
        </li>
      ))}
    </ul>
  );
}

function ensembleSymetriqueLatex(m: number): string {
  return `[-${nombreLatex(m)} \\,;\\, 0]`;
}

/** Courbe écartée traitée à l'écran `ecran` (1, 2, 3) de la famille C. */
function courbeDeLEcran(e: ExerciceCourbe, ecran: number): number {
  return courbesEcartees(e)[ecran - 1]!;
}

function reponseAttendue(etat: EtatPortraitRobot): ReactNode {
  const { exercice: e, ecran } = etat;
  if (e.famille === "expression") {
    const c = e.cible;
    if (ecran === 0)
      return (
        <span>
          {`La fonction ${NOMS_FAMILLES[c.famille]} `}
          <Katex expression={`x \\mapsto ${referenceLatex(c.famille)}`} />
        </span>
      );
    if (ecran === 1) return <Katex expression={`\\text{TH} = ${nombreLatex(c.h)} \\quad \\text{TV} = ${nombreLatex(c.k)}`} />;
    if (ecran === 2) return <Katex expression={`f(x) = ${expressionLatex(c)}`} />;
    return <Katex expression={`f(${nombreLatex(e.controle.x)}) = ${nombreLatex(e.controle.y)}`} />;
  }
  if (e.famille === "deduction") {
    if (ecran === 0) return <Katex expression={`f(-${nombreLatex(e.p)}) = ${nombreLatex(valeurOpposee(e))}`} />;
    if (ecran === 1)
      return (
        <span>
          {`f est ${libelleSens(sensSymetrique(e))} sur `}
          <Katex expression={ensembleSymetriqueLatex(e.m)} />
        </span>
      );
    const [g, d] = ecran === 2 ? gaucheDroiteImages(e.comparaisonImages) : gaucheDroiteValeur(e, e.comparaisonValeur);
    const verdict = ecran === 2 ? e.comparaisonImages.verdict : e.comparaisonValeur.verdict;
    return <RenduFragments fragments={libelleVerdictComparaison(verdict, g, d)} />;
  }
  if (ecran === 0) return <span>Courbe {LETTRES_COURBES[e.indexCorrect]}</span>;
  const indexCondition = e.violations[courbeDeLEcran(e, ecran)]!;
  return <RenduFragments fragments={avecMajuscule(conditionFragments(e.conditions[indexCondition]!))} />;
}

export function AppPortraitRobotFonction() {
  const [etat, setEtat] = useState<EtatPortraitRobot>(() => demarrerPortraitRobot(exerciceInitial()));
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  const [historique, setHistorique] = useState<EcranClos[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);
  /** Compteur de génération : clé des écrans, pour que les champs repartent vides après « Générer »
   * ou « Nouvel exercice », même si l'écran affiché est du même type. */
  const [generation, setGeneration] = useState(0);
  const [erreurSyntaxe, setErreurSyntaxe] = useState(false);

  const e = etat.exercice;
  const ecran = etat.ecran;

  function recommencer(exercice: ExercicePortraitRobot) {
    setEtat(demarrerPortraitRobot(exercice));
    setEnAttente(null);
    setHistorique([]);
    setFicheOuverteIndex(null);
    setErreurSyntaxe(false);
    setGeneration((g) => g + 1);
  }

  function soumettre(correct: boolean, votreReponse: ReactNode) {
    const resultat = soumettrePortraitRobot(etat, correct);
    setErreurSyntaxe(false);
    if (!resultat.clos) {
      setEtat(resultat.etat);
      return;
    }
    const attendue = reponseAttendue(etat);
    setHistorique((h) => [...h, ecranClos(TITRES_ECRANS[e.famille][ecran], votreReponse, resultat.revele, etat.niveauAide > 0, attendue)]);
    setEtat(resultat.etat);
    setEnAttente({
      revele: resultat.revele,
      reponseAttendue: attendue,
      messageRevele: estChoixFerme(e, ecran) ? "Ce n'était pas la bonne réponse." : undefined,
      derniere: ecran >= NOMBRE_ECRANS - 1,
    });
  }

  function passerEcranSuivant() {
    if (!enAttente) return;
    if (enAttente.derniere) {
      recommencer(genererExercicePortraitRobot());
      return;
    }
    setEtat(ecranSuivantPortraitRobot(etat));
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

  const communs = {
    niveauAide: etat.niveauAide,
    onActiverAide: () => setEtat(activerAidePortraitRobot(etat)),
    validation,
  };

  function ecranExpression(ex: ExerciceExpression): ReactNode {
    const aides = aidesExpression(ex, ecran);
    if (ecran === 0) {
      return (
        <EtapeChoixPortrait<FamilleReference>
          {...communs}
          aides={aides}
          consigne={consigne}
          options={OPTIONS_FAMILLE.map((o) => ({ valeur: o.valeur, rendu: o.libelle }))}
          onValider={(choix) => soumettre(verifierFamille(ex, choix), `La fonction ${NOMS_FAMILLES[choix]}`)}
        />
      );
    }
    if (ecran === 1) {
      return (
        <EtapeNombresPortrait
          {...communs}
          aides={aides}
          consigne={consigne}
          champs={[
            { id: "portrait-th", labelLatex: "\\text{TH} =" },
            { id: "portrait-tv", labelLatex: "\\text{TV} =" },
          ]}
          tentativesUtilisees={etat.tentativesUtilisees}
          tentativesMax={tentativesMaxEcran(ex, ecran)}
          onValider={([th, tv]) => soumettre(verifierTranslations(ex, { th: th!, tv: tv! }), <Katex expression={`\\text{TH} = ${nombreLatex(th!)} \\quad \\text{TV} = ${nombreLatex(tv!)}`} />)}
        />
      );
    }
    if (ecran === 2) {
      return (
        <EtapeExpressionPortrait
          {...communs}
          aides={aides}
          consigne={consigne}
          tentativesUtilisees={etat.tentativesUtilisees}
          tentativesMax={tentativesMaxEcran(ex, ecran)}
          erreurSyntaxe={erreurSyntaxe}
          onValider={(saisie) => {
            const statut = diagnostiquerExpression(ex, saisie);
            if (statut === "parse_error") {
              setErreurSyntaxe(true);
              return;
            }
            soumettre(statut === "correct", saisieEnLatex(saisie));
          }}
        />
      );
    }
    return (
      <EtapeNombresPortrait
        {...communs}
        aides={aides}
        consigne={consigne}
        champs={[{ id: "portrait-controle", labelLatex: `f(${nombreLatex(ex.controle.x)}) =` }]}
        tentativesUtilisees={etat.tentativesUtilisees}
        tentativesMax={tentativesMaxEcran(ex, ecran)}
        onValider={([y]) => soumettre(verifierControle(ex, y!), nombreTexte(y!))}
      />
    );
  }

  function ecranDeduction(ex: ExerciceDeduction): ReactNode {
    const aides = aidesDeduction(ex, ecran);
    if (ecran === 0) {
      return (
        <EtapeNombresPortrait
          {...communs}
          aides={aides}
          consigne={consigne}
          champs={[{ id: "portrait-valeur", labelLatex: `${imageLatex(-ex.p)} =` }]}
          tentativesUtilisees={etat.tentativesUtilisees}
          tentativesMax={tentativesMaxEcran(ex, ecran)}
          onValider={([y]) => soumettre(verifierValeurOpposee(ex, y!), nombreTexte(y!))}
        />
      );
    }
    if (ecran === 1) {
      const options: { valeur: ChoixVariations; rendu: string }[] = [
        { valeur: "croissante", rendu: "Strictement croissante" },
        { valeur: "decroissante", rendu: "Strictement décroissante" },
        { valeur: "indetermine", rendu: "On ne peut pas savoir" },
      ];
      return (
        <EtapeChoixPortrait<ChoixVariations>
          {...communs}
          aides={aides}
          consigne={consigne}
          options={options}
          onValider={(choix) => soumettre(verifierVariations(ex, choix), options.find((o) => o.valeur === choix)!.rendu)}
        />
      );
    }
    const [g, d] = ecran === 2 ? gaucheDroiteImages(ex.comparaisonImages) : gaucheDroiteValeur(ex, ex.comparaisonValeur);
    const options = optionsComparaison(g, d).map((o) => ({ valeur: o.valeur, rendu: o.latex ? <Katex expression={o.latex} /> : o.texte }));
    return (
      <EtapeChoixPortrait<VerdictComparaison>
        {...communs}
        aides={aides}
        consigne={consigne}
        options={options}
        onValider={(choix) =>
          soumettre(
            ecran === 2 ? verifierComparaisonImages(ex, choix) : verifierComparaisonValeur(ex, choix),
            <RenduFragments fragments={libelleVerdictComparaison(choix, g, d)} />,
          )
        }
      />
    );
  }

  function ecranCourbe(ex: ExerciceCourbe): ReactNode {
    if (ecran === 0) {
      return (
        <EtapeChoixPortrait<number>
          {...communs}
          aides={aidesCourbe(ex, 0, "")}
          consigne={consigne}
          options={LETTRES_COURBES.map((lettre, i) => ({ valeur: i, rendu: `Courbe ${lettre}` }))}
          onValider={(i) => soumettre(verifierCourbe(ex, i), `Courbe ${LETTRES_COURBES[i]}`)}
        />
      );
    }
    const indexCourbe = courbeDeLEcran(ex, ecran);
    const lettre = LETTRES_COURBES[indexCourbe]!;
    return (
      <EtapeChoixPortrait<number>
        {...communs}
        aides={aidesCourbe(ex, ecran, lettre)}
        consigne={consigne}
        options={ex.conditions.map((c, i) => ({ valeur: i, rendu: <RenduFragments fragments={avecMajuscule(conditionFragments(c))} /> }))}
        uneColonne
        onValider={(i) => soumettre(verifierConditionViolee(ex, indexCourbe, i), <RenduFragments fragments={avecMajuscule(conditionFragments(ex.conditions[i]!))} />)}
      />
    );
  }

  const blocDonnees =
    e.famille === "expression" ? (
      <ListeFragments items={e.conditions.map((c) => avecMajuscule(conditionFragments(c)))} />
    ) : e.famille === "deduction" ? (
      <ListeFragments items={donneesDeductionFragments(e).map(avecMajuscule)} />
    ) : (
      <>
        <ListeFragments items={e.conditions.map((c) => avecMajuscule(conditionFragments(c)))} />
        <GrilleCourbesPortraitRobot courbes={e.courbes} surlignee={ecran >= 1 ? courbeDeLEcran(e, ecran) : null} />
      </>
    );

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">4e — Entraînement</p>
        <h1 className="app-title">Le portrait-robot d'une fonction</h1>
        <p className="app-subtitle">Chapitre 3 — Caractéristiques d'une fonction et fonctions de référence</p>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={(id) => recommencer(construireAvecVariante(id))} />
      </header>

      <main className="card">
        <ProgressionPuces segments={segmentsDepuisHistorique(historique, NOMBRE_ECRANS, !enAttente)} onSegmentClick={(index) => setFicheOuverteIndex(index)} />

        <div className="card-body">
          <EnTeteExercice consigneGenerale={consigneGenerale(e.famille)} blocDonnees={blocDonnees} />
          <Fragment key={`${generation}-${ecran}`}>
            {e.famille === "expression" ? ecranExpression(e) : e.famille === "deduction" ? ecranDeduction(e) : ecranCourbe(e)}
          </Fragment>
        </div>
      </main>

      {ficheOuverteIndex !== null && historique[ficheOuverteIndex] && (
        <FicheReponseEcran entree={historique[ficheOuverteIndex].entree} onFermer={() => setFicheOuverteIndex(null)} />
      )}
    </div>
  );
}

