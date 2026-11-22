import { useState } from "react";
import { Katex } from "../components/Katex";
import { useLargeurConteneur } from "../components/useLargeurConteneur";
import type { EnsembleReelGuide } from "../core6e/ensembleReel.types";
import type { ExerciceGraphiquesCyclometriques, ParticulariteParite } from "../core6e/graphiquesCyclometriques.types";
import type { FragmentConsigne } from "../../export/genererFeuilleExercices";
import { evaluerValeurCyclometrique } from "../moteur6e/expressionCyclometrique";
import type { ReponseEcranUniqueGraphiquesCyclometriques, ReponseExtremum } from "../moteur6e/verificationGraphiquesCyclometriques";
import { diagnostiquerEcranUnique } from "../moteur6e/verificationGraphiquesCyclometriques";
import { CONSIGNE_GENERALE, LIBELLE_PARITE, calculerViewBoxGraphique, formatExpressionLatex } from "../ui6e/formatGraphiquesCyclometriques";
import { aideGraphique1, aideGraphique2, cibleJustification } from "../ui6e/aidesGraphiquesCyclometriques";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { BoutonAide } from "./BoutonAide";
import { EnsembleReelGuideBuilder } from "./EnsembleReelGuideBuilder";
import { EnTeteExercice } from "./EnTeteExercice";
import { GrapheOptionCyclo } from "./GrapheOptionCyclo";
import { LoupeGraphique } from "../../components/LoupeGraphique";
import { AidesCyclo, MESSAGES_ILLISIBLE_CYCLO, MessageRetourCyclo, useRetourCyclo } from "./RetourSaisieCyclo";

const LETTRES = ["A", "B", "C", "D"] as const;

interface EtatExtremum {
  existe: boolean | null;
  xTexte: string;
  yTexte: string;
}

const EXTREMUM_VIDE: EtatExtremum = { existe: null, xTexte: "", yTexte: "" };

const lisible = (t: string) => evaluerValeurCyclometrique(t) !== null;

function extremumRempli(e: EtatExtremum): boolean {
  return e.existe === false || (e.existe === true && e.xTexte.trim() !== "" && e.yTexte.trim() !== "");
}

function extremumLisible(e: EtatExtremum): boolean {
  return e.existe !== true || (lisible(e.xTexte) && lisible(e.yTexte));
}

function extremumVersReponse(e: EtatExtremum): ReponseExtremum {
  if (!e.existe) return { existe: false };
  return { existe: true, x: evaluerValeurCyclometrique(e.xTexte) as number, y: evaluerValeurCyclometrique(e.yTexte) as number };
}

function ChampExtremum({ titre, etat, onChange, erronee, desactive }: { titre: string; etat: EtatExtremum; onChange: (e: EtatExtremum) => void; erronee: boolean; desactive: boolean }) {
  return (
    <div className="field">
      <p className="field-label">{titre}</p>
      <div className="options-grid-compact">
        <button type="button" className={`btn${etat.existe === false ? " toggle-active" : ""}`} disabled={desactive} onClick={() => onChange({ ...etat, existe: false })}>
          N'existe pas
        </button>
        <button type="button" className={`btn${etat.existe === true ? " toggle-active" : ""}`} disabled={desactive} onClick={() => onChange({ ...etat, existe: true })}>
          Existe
        </button>
      </div>
      {etat.existe === true && (
        <div className="field-row field-row-wrap contenu-conditionnel">
          <label className="field-label field-label-minuscule">atteint en x =</label>
          <input type="text" className={`text-input${erronee ? " is-erronee" : ""}`} value={etat.xTexte} disabled={desactive} onChange={(e) => onChange({ ...etat, xTexte: e.target.value })} />
          <label className="field-label field-label-minuscule">valeur y =</label>
          <input type="text" className={`text-input${erronee ? " is-erronee" : ""}`} value={etat.yTexte} disabled={desactive} onChange={(e) => onChange({ ...etat, yTexte: e.target.value })} />
        </div>
      )}
    </div>
  );
}

interface Props {
  exercice: ExerciceGraphiquesCyclometriques;
  lettreValidee: boolean;
  pariteRevelee: boolean;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValiderLettre: (lettre: number) => void;
  onValider: (reponse: ReponseEcranUniqueGraphiquesCyclometriques) => void;
  validation?: ValidationEtapeProps | null;
}

/**
 * Écran unique de `6gen5`, en deux temps (audit du 6e ch. 1, lot B, G2) : 1) choix du graphique
 * (A–D), choix fermé à UNE tentative, validé seul ; 2) justification (ordonnée à l'origine, domaine,
 * image, parité, extremums) en trois tentatives — la parité (choix fermé) est jugée une seule fois,
 * puis figée et révélée si elle était fausse. Valeur illisible : message sans tentative ; π, √,
 * fractions et « − » lus. Message ciblé : la liste des propriétés à revoir.
 */
export function EtapeApparierGraphiqueCyclo({
  exercice,
  lettreValidee,
  pariteRevelee,
  tentativesUtilisees,
  tentativesMax,
  niveauAide,
  niveauAideMax,
  onActiverAide,
  onValiderLettre,
  onValider,
  validation,
}: Props) {
  const [lettre, setLettre] = useState<number | null>(null);
  const [ordonnee, setOrdonnee] = useState<EtatExtremum>(EXTREMUM_VIDE);
  const [domf, setDomf] = useState<EnsembleReelGuide | null>(null);
  const [imf, setImf] = useState<EnsembleReelGuide | null>(null);
  const [domIllisible, setDomIllisible] = useState(false);
  const [imIllisible, setImIllisible] = useState(false);
  const [parite, setParite] = useState<ParticulariteParite | "">("");
  const [maximum, setMaximum] = useState<EtatExtremum>(EXTREMUM_VIDE);
  const [minimum, setMinimum] = useState<EtatExtremum>(EXTREMUM_VIDE);
  const retour = useRetourCyclo<ReponseEcranUniqueGraphiquesCyclometriques>();

  const [wrapperRef, largeurMesuree] = useLargeurConteneur<HTMLDivElement>();
  // Grille 2 × 2 dès 312 px (maquette C du 22/11/2026), loupe pour agrandir ; avant : une colonne,
  // graphiques de 200 à 360 px empilés.
  const colonnes = (largeurMesuree || 280) >= 312 ? 2 : 1;
  const largeur = Math.round(Math.min(360, ((largeurMesuree || 280) - 12 * (colonnes - 1)) / colonnes));
  const viewBox = calculerViewBoxGraphique(exercice);
  const desactive = !!validation;

  const pariteEffective: ParticulariteParite | "" = pariteRevelee ? exercice.proprietes.parite : parite;
  const ordonneeRemplie = ordonnee.existe === false || (ordonnee.existe === true && ordonnee.xTexte.trim() !== "");
  const complet = (domf !== null || domIllisible) && (imf !== null || imIllisible) && ordonneeRemplie && pariteEffective !== "" && extremumRempli(maximum) && extremumRempli(minimum);

  const derniere = retour.soumise;
  const diagnostic = tentativesUtilisees > 0 && derniere !== null ? diagnostiquerEcranUnique(exercice, derniere) : null;

  function validerJustification() {
    if (!complet) return;
    const illisible = domIllisible || imIllisible || (ordonnee.existe === true && !lisible(ordonnee.xTexte)) || !extremumLisible(maximum) || !extremumLisible(minimum);
    if (illisible || domf === null || imf === null) {
      retour.tenter(derniere as ReponseEcranUniqueGraphiquesCyclometriques, domIllisible || imIllisible ? MESSAGES_ILLISIBLE_CYCLO.borne : MESSAGES_ILLISIBLE_CYCLO.extremum, onValider);
      return;
    }
    const reponse: ReponseEcranUniqueGraphiquesCyclometriques = {
      lettre: exercice.indexCorrect,
      ordonnee: ordonnee.existe ? { existe: true, valeur: evaluerValeurCyclometrique(ordonnee.xTexte) as number } : { existe: false },
      domf,
      imf,
      parite: pariteEffective,
      maximum: extremumVersReponse(maximum),
      minimum: extremumVersReponse(minimum),
    };
    retour.tenter(reponse, null, onValider);
  }

  const cible: FragmentConsigne[] | null = diagnostic ? cibleJustification(exercice, diagnostic) : null;

  return (
    <div>
      <EnTeteExercice
        consigneGenerale={CONSIGNE_GENERALE}
        blocDonnees={
          <div className="equation-box">
            <Katex expression={formatExpressionLatex(exercice)} />
          </div>
        }
      />

      <div className="graphes-qcm-liste" ref={wrapperRef} style={{ display: "grid", gridTemplateColumns: `repeat(${colonnes}, minmax(0, 1fr))`, gap: 12 }}>
        {exercice.candidats.map((_, index) => (
          <div className={`graphe-qcm-carte${(lettreValidee ? exercice.indexCorrect : lettre) === index ? " est-choisi" : ""}`} key={index} onClick={desactive || lettreValidee ? undefined : () => setLettre(index)}>
            <p className="graphe-qcm-label">{LETTRES[index]}</p>
            <LoupeGraphique titre={`Graphique ${LETTRES[index]}`} ratio={1} rendu={(l) => <GrapheOptionCyclo exercice={exercice} index={index} viewBox={viewBox} largeur={l} hauteur={l} />} />
            <GrapheOptionCyclo exercice={exercice} index={index} viewBox={viewBox} largeur={largeur} hauteur={largeur} />
          </div>
        ))}
      </div>

      <p className="prompt-text">Quel graphique représente f ?</p>
      <div className="options-grid-compact">
        {LETTRES.slice(0, exercice.candidats.length).map((l, index) => (
          <button
            key={l}
            type="button"
            className={`btn${(lettreValidee ? exercice.indexCorrect : lettre) === index ? " toggle-active" : ""}`}
            disabled={desactive || lettreValidee}
            onClick={() => setLettre(index)}
          >
            {l}
          </button>
        ))}
      </div>

      {lettreValidee && (
        <div className="contenu-conditionnel">
          <p className="prompt-text">Graphique {LETTRES[exercice.indexCorrect]} : c'est juste. Justifie ce choix.</p>

          <div className="field">
            <p className="field-label">Ordonnée à l'origine</p>
            <div className="options-grid-compact">
              <button type="button" className={`btn${ordonnee.existe === false ? " toggle-active" : ""}`} disabled={desactive} onClick={() => setOrdonnee({ ...ordonnee, existe: false })}>
                N'existe pas
              </button>
              <button type="button" className={`btn${ordonnee.existe === true ? " toggle-active" : ""}`} disabled={desactive} onClick={() => setOrdonnee({ ...ordonnee, existe: true })}>
                Existe
              </button>
            </div>
            {ordonnee.existe === true && (
              <div className="field field-inline contenu-conditionnel">
                <label className="field-label field-label-minuscule">f(0) =</label>
                <input
                  type="text"
                  className={`text-input${diagnostic && diagnostic.ordonnee !== "correct" ? " is-erronee" : ""}`}
                  value={ordonnee.xTexte}
                  disabled={desactive}
                  onChange={(e) => setOrdonnee({ ...ordonnee, xTexte: e.target.value })}
                />
              </div>
            )}
          </div>

          <div className="field">
            <p className="field-label">Domaine de f</p>
            <EnsembleReelGuideBuilder label="\text{dom}\,f=" onChange={setDomf} onIllisible={setDomIllisible} erronee={diagnostic !== null && diagnostic.domf !== "correct"} parseurNombre={evaluerValeurCyclometrique} disabled={desactive} />
          </div>

          <div className="field">
            <p className="field-label">Image de f</p>
            <EnsembleReelGuideBuilder label="\text{Im}\,f=" onChange={setImf} onIllisible={setImIllisible} erronee={diagnostic !== null && diagnostic.imf !== "correct"} parseurNombre={evaluerValeurCyclometrique} disabled={desactive} />
          </div>

          <div className="field">
            <p className="field-label">Parité (une seule tentative)</p>
            <div className="options-grid-compact">
              {(["paire", "impaire", "aucune"] as const).map((p) => (
                <button key={p} type="button" className={`btn${pariteEffective === p ? " toggle-active" : ""}`} disabled={desactive || pariteRevelee} onClick={() => setParite(p)}>
                  {LIBELLE_PARITE[p]}
                </button>
              ))}
            </div>
            {pariteRevelee && <p className="prompt-text">Parité révélée : {LIBELLE_PARITE[exercice.proprietes.parite].toLowerCase()}.</p>}
          </div>

          <ChampExtremum titre="Maximum" etat={maximum} onChange={setMaximum} erronee={diagnostic !== null && diagnostic.maximum !== "correct"} desactive={desactive} />
          <ChampExtremum titre="Minimum" etat={minimum} onChange={setMinimum} erronee={diagnostic !== null && diagnostic.minimum !== "correct"} desactive={desactive} />
        </div>
      )}

      <AidesCyclo aide1={aideGraphique1(exercice)} aide2={aideGraphique2(exercice)} niveauAide={niveauAide} />
      {!validation && (
        <>
          <BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />
          {!lettreValidee ? (
            <button type="button" className="btn btn-primary" disabled={lettre === null} onClick={() => lettre !== null && onValiderLettre(lettre)}>
              Valider le choix
            </button>
          ) : (
            <button type="button" className="btn btn-primary" disabled={!complet} onClick={validerJustification}>
              Valider
            </button>
          )}
          {lettreValidee && <MessageRetourCyclo blocage={retour.blocage} tentativesUtilisees={tentativesUtilisees} tentativesMax={tentativesMax} cible={cible} />}
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
