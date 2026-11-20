import { useState } from "react";
import type { ReactNode } from "react";
import type { ReglagesSession6e } from "../core6e/session6e.types";
import type { DefinitionEcrans, Frag } from "../ui6e/ecransExp.types";
import { decoderLigne } from "../ui6e/ecransExp.types";
import {
  activerAideEcran,
  demarrerSessionEcrans,
  niveauAideMaxEcran,
  soumettreEcran,
  TENTATIVES_CHAMP,
  tentativesMaxEcran,
} from "../moteur6e/sessionEcransExp";
import type { EtatSessionEcrans } from "../moteur6e/sessionEcransExp";
import { EtapeEcransExp, FigureSvg, Fragments, TableauDonneesVue } from "./EtapeEcransExp";
import { SelecteurVarianteDev } from "./SelecteurVarianteDev";
import { ProgressionPuces } from "../../components/ProgressionPuces";
import type { EtatPuceProgression } from "../../components/ProgressionPuces";
import type { EntreeHistoriqueEtape } from "../../components/FicheReponseEcran";
import { FicheReponseEcran } from "../../components/FicheReponseEcran";
import { genererAvecCode, lireCodeDepuisUrl } from "../../export/codeExercice";
import { CorrigeDetailleEcran } from "../../components/CorrigeDetailleEcran";
import { lettreEtape, lignesDeLEtape } from "../../export/corrigeTableau";
import { CopieEleve } from "../../4e/components/EtapesDetectiveErreurs";

const REGLAGES: ReglagesSession6e = { nombreExercices: 1, tentativesMax: TENTATIVES_CHAMP };

export interface ConfigAppEcrans<E, P extends string> {
  /** « 6gen144 » : nom du crochet de débogage `window.__debug6gen144` (mode DEV ou `?dev=1`). */
  id: string;
  titre: string;
  definition: DefinitionEcrans<E, P>;
  catalogue: { id: string; label: string }[];
  genererLibre: () => E;
  genererVariante: (id: string) => E;
  /** Largeur maximale de la figure de l'énoncé (px). */
  largeurFigure?: number;
  /** Nombre de puces affichées quand un cas particulier a moins d'écrans (structure fixe). */
  nombrePuces?: number;
}

interface TransitionEnAttente<E, P extends string> {
  etatSuivant: EtatSessionEcrans<E, P>;
  revele: boolean;
  /** Dernière saisie (choix fermé faux : message ciblé affiché avec la réponse). */
  valeurs: string[];
}

/** « Ce qu'on sait déjà » : valeurs CONFIRMÉES des écrans clos (jamais la saisie de l'élève). */
function Recapitulatif<E, P extends string>({ def, etat }: { def: DefinitionEcrans<E, P>; etat: EtatSessionEcrans<E, P> }) {
  const e = etat.exerciceCourant;
  const phases = def.phases(e);
  const index = etat.terminee ? phases.length : phases.indexOf(etat.phase);
  const closes = phases.slice(0, index);
  if (closes.length === 0) return null;
  return (
    <div className="recap-panel">
      <p className="recap-panel-titre">Ce qu'on sait déjà</p>
      <ul className="recap-list">
        {closes.map((phase, i) => {
          const revele = etat.revelesPartiels[phase] ?? false;
          return (
            <li key={`${i}-${phase}`} className="recap-item">
              <span className={`recap-icone ${revele ? "recap-icone-revele" : "recap-icone-correcte"}`}>{revele ? "✗" : "✓"}</span>
              <span className="recap-corps">
                <span className="recap-libelle">{def.libelle(e, phase)} :</span> <Fragments fragments={def.recap(e, phase)} />
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function texteSaisie<E, P extends string>(def: DefinitionEcrans<E, P>, e: E, phase: P, valeurs: string[]): ReactNode {
  const mode = def.mode(e, phase);
  if (mode.type === "choix") {
    const o = mode.options.find((x) => x.id === valeurs[0]);
    return o ? <Fragments fragments={o.fragments} /> : valeurs[0];
  }
  if (mode.type === "intervalles") {
    return valeurs
      .map((v) => {
        const l = decoderLigne(v);
        return `${l.ouvrant}${l.gauche} ; ${l.droite}${l.fermant}`;
      })
      .join(" ∪ ");
  }
  const parties: string[] = [];
  let k = 0;
  if (mode.symboles) {
    const s = mode.symboles.options.find((o) => o.id === valeurs[0]);
    parties.push(`${mode.symboles.label} : ${s ? s.id : "?"}`);
    k = 1;
  }
  mode.champs.forEach((c, i) => parties.push(mode.champs.length === 1 && !mode.symboles ? valeurs[i + k] : `${c.label} : ${valeurs[i + k]}`));
  return parties.join(" ; ");
}

function ReponseAttendue({ fragments }: { fragments: Frag[] }) {
  return (
    <span className="prompt-text" style={{ overflowX: "auto", display: "block", maxWidth: "100%" }}>
      <Fragments fragments={fragments} />
    </span>
  );
}

/**
 * Appli partagée des générateurs 6gen144–6gen147 (6e ch. 2) — copie adaptée de l'appli du socle 5e :
 * `?code=` (QR code des feuilles) rejoue la PREMIÈRE instance avec les MÊMES fonctions de génération
 * que l'adaptateur (`genererAvecCode`) ; `SelecteurVarianteDev` toujours présent ; puces cliquables
 * (fiche en lecture seule) ; corrigé détaillé de l'étape (même source que le papier) sous la réponse
 * révélée.
 */
export function AppEcransExp<E, P extends string>({ config }: { config: ConfigAppEcrans<E, P> }) {
  const def = config.definition;
  const [etat, setEtat] = useState<EtatSessionEcrans<E, P>>(() => {
    const code = lireCodeDepuisUrl();
    if (!code) return demarrerSessionEcrans(def, REGLAGES, config.genererLibre);
    return demarrerSessionEcrans(def, REGLAGES, () => genererAvecCode(code, config.catalogue, config.genererLibre, config.genererVariante));
  });
  const [enAttente, setEnAttente] = useState<TransitionEnAttente<E, P> | null>(null);
  const [historique, setHistorique] = useState<EntreeHistoriqueEtape[]>([]);
  const [ficheOuverte, setFicheOuverte] = useState<number | null>(null);
  const [aideParPhase, setAideParPhase] = useState<Partial<Record<P, boolean>>>({});
  const [compteur, setCompteur] = useState(0);

  const e = etat.exerciceCourant;
  const phase = etat.phase;
  const phases = def.phases(e);

  function reinitialiser(nouvel: EtatSessionEcrans<E, P>) {
    setEtat(nouvel);
    setEnAttente(null);
    setHistorique([]);
    setAideParPhase({});
    setFicheOuverte(null);
    setCompteur((c) => c + 1);
  }

  function terminerEtape(nouvel: EtatSessionEcrans<E, P>, valeurs: string[]) {
    const transition = nouvel.phase !== etat.phase || nouvel.terminee !== etat.terminee || nouvel.exerciceCourant !== etat.exerciceCourant;
    if (!transition) {
      setEtat(nouvel);
      return;
    }
    const revele = nouvel.derniereTransitionRevelee;
    setAideParPhase((p) => ({ ...p, [phase]: etat.niveauAide > 0 }));
    setHistorique((h) => [
      ...h,
      {
        titre: def.libelle(e, phase),
        votreReponse: texteSaisie(def, e, phase, valeurs),
        correcte: !revele,
        reponseAttendue: revele ? <ReponseAttendue fragments={def.reponseAttendue(e, phase)} /> : undefined,
      },
    ]);
    setEnAttente({ etatSuivant: nouvel, revele, valeurs });
  }

  function suivant() {
    if (!enAttente) return;
    if (enAttente.etatSuivant.terminee) {
      reinitialiser(demarrerSessionEcrans(def, REGLAGES, config.genererLibre));
      return;
    }
    setEtat(enAttente.etatSuivant);
    setEnAttente(null);
  }

  const modeDev = import.meta.env.DEV || new URLSearchParams(window.location.search).get("dev") === "1";
  if (modeDev) (window as unknown as Record<string, unknown>)[`__debug${config.id}`] = { exercice: e, phase };

  const choix = def.estChoix(e, phase);
  const indexPhase = phases.indexOf(phase);
  // Choix fermé faux (une seule tentative) : le message ciblé de `piege` s'affiche avec la réponse,
  // puisque l'écran ne se rejoue pas (sur un champ, il s'affiche à chaque tentative fausse).
  const piegeChoix = choix && enAttente?.revele ? def.piege(e, phase, enAttente.valeurs) : null;
  const validation = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue: <ReponseAttendue fragments={def.reponseAttendue(e, phase)} />,
        labelSuivant: enAttente.etatSuivant.terminee ? "Nouvel exercice" : "Écran suivant",
        onSuivant: suivant,
        corrigeDetaille: <CorrigeDetailleEcran etapes={lignesDeLEtape(def.correction(e), lettreEtape(indexPhase))} />,
        ...(choix && enAttente.revele
          ? { messageRevele: `Ce n'était pas le bon choix (une seule tentative sur un choix fermé).${def.explicationChoix ? ` ${def.explicationChoix(e, phase)}` : ""}` }
          : {}),
        ...(piegeChoix
          ? {
              figureApres: (
                <p style={{ margin: "8px 0", lineHeight: 1.6 }}>
                  <Fragments fragments={piegeChoix} />
                </p>
              ),
            }
          : {}),
      }
    : null;

  const segments: EtatPuceProgression[] = phases.map((p, i) => {
    const idx = etat.terminee ? phases.length : indexPhase;
    if (i > idx) return "a-venir";
    if (i === idx) return enAttente ? (enAttente.revele ? "revele" : aideParPhase[p] || etat.niveauAide > 0 ? "aide" : "correcte") : "courante";
    if (etat.revelesPartiels[p]) return "revele";
    return aideParPhase[p] ? "aide" : "correcte";
  });
  // Structure FIXE (cas particulier plus court) : puces « à venir », puis « sans objet » une fois
  // le dernier écran validé — le nombre de puces ne trahit jamais le cas dès le premier écran.
  if (config.nombrePuces && config.nombrePuces > phases.length) {
    const fini = !!enAttente && indexPhase === phases.length - 1;
    for (let i = phases.length; i < config.nombrePuces; i++) segments.push(fini ? "sans-objet" : "a-venir");
  }

  const figure = def.figure?.(e, phase) ?? null;
  const tableau = def.tableau?.(e) ?? null;
  const copie = def.copie?.(e, phase) ?? null;
  const blocDonnees =
    figure || tableau || copie ? (
      <>
        {tableau && <TableauDonneesVue tableau={tableau} />}
        {figure && <FigureSvg svg={figure} largeurMax={config.largeurFigure} />}
        {copie && <CopieEleve lignes={copie.lignes} ligneSignalee={copie.signalee} />}
      </>
    ) : null;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">6e — Entraînement</p>
        <h1 className="app-title">{config.titre}</h1>
        <p className="app-subtitle">Chapitre 2 — Fonctions exponentielles</p>
        <SelecteurVarianteDev options={config.catalogue} onGenerer={(id) => reinitialiser(demarrerSessionEcrans(def, REGLAGES, () => config.genererVariante(id)))} />
        <ProgressionPuces segments={segments} onSegmentClick={(i) => setFicheOuverte(i)} />
      </header>
      <main className="card">
        <Recapitulatif def={def} etat={etat} />
        <EtapeEcransExp
          key={`${compteur}-${phase}`}
          consigneGenerale={def.consigneGenerale(e)}
          blocDonnees={blocDonnees}
          consigneEcran={def.consigne(e, phase)}
          mode={def.mode(e, phase)}
          aide1={def.aide1(e, phase)}
          aide2={def.aide2(e, phase)}
          tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
          tentativesMax={tentativesMaxEcran(def, etat)}
          niveauAide={etat.niveauAide}
          niveauAideMax={niveauAideMaxEcran(def, etat)}
          onActiverAide={() => setEtat(activerAideEcran(def, etat))}
          validation={validation}
          diagnostiquer={(v) => def.diagnostiquer(e, phase, v)}
          piege={(v) => def.piege(e, phase, v)}
          messageIllisible={def.messageIllisible(e, phase)}
          approchee={def.approchee ? (v) => def.approchee!(e, phase, v) : undefined}
          onValider={(v) => terminerEtape(soumettreEcran(def, etat, v), v)}
        />
      </main>
      {ficheOuverte !== null && historique[ficheOuverte] && <FicheReponseEcran entree={historique[ficheOuverte]} onFermer={() => setFicheOuverte(null)} />}
    </div>
  );
}
