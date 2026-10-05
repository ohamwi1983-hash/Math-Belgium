import { useState } from "react";
import { Katex } from "../components/Katex";
import { useLargeurConteneur } from "../components/useLargeurConteneur";
import type { EnsembleReelGuide } from "../core6e/ensembleReel.types";
import type { ExerciceGraphiquesCyclometriques, ParticulariteParite } from "../core6e/graphiquesCyclometriques.types";
import { evaluerValeurCyclometrique } from "../moteur6e/expressionCyclometrique";
import type { DiagnosticEcranUniqueGraphiquesCyclometriques, ReponseEcranUniqueGraphiquesCyclometriques, ReponseExtremum } from "../moteur6e/verificationGraphiquesCyclometriques";
import { diagnostiquerEcranUnique } from "../moteur6e/verificationGraphiquesCyclometriques";
import type { AideAvecLatex } from "../ui6e/formatGraphiquesCyclometriques";
import { CONSIGNE_GENERALE, LIBELLE_PARITE, calculerViewBoxGraphique, formatExpressionLatex } from "../ui6e/formatGraphiquesCyclometriques";
import { BoutonAide } from "./BoutonAide";
import { EnsembleReelGuideBuilder } from "./EnsembleReelGuideBuilder";
import { GrapheOptionCyclo } from "./GrapheOptionCyclo";

const LETTRES = ["A", "B", "C", "D"] as const;

interface EtatExtremum {
  existe: boolean | null;
  xTexte: string;
  yTexte: string;
}

const EXTREMUM_VIDE: EtatExtremum = { existe: null, xTexte: "", yTexte: "" };

function extremumComplet(e: EtatExtremum): boolean {
  if (e.existe === null) return false;
  if (e.existe === false) return true;
  return evaluerValeurCyclometrique(e.xTexte) !== null && evaluerValeurCyclometrique(e.yTexte) !== null;
}

function extremumVersReponse(e: EtatExtremum): ReponseExtremum {
  if (!e.existe) return { existe: false };
  return { existe: true, x: evaluerValeurCyclometrique(e.xTexte) as number, y: evaluerValeurCyclometrique(e.yTexte) as number };
}

function ChampExtremum({
  titre,
  etat,
  onChange,
  erroneeExistence,
  erroneeValeurs,
}: {
  titre: string;
  etat: EtatExtremum;
  onChange: (e: EtatExtremum) => void;
  erroneeExistence: boolean;
  erroneeValeurs: boolean;
}) {
  return (
    <div className="field">
      <p className="field-label">{titre}</p>
      <div className="options-grid-compact">
        <button
          type="button"
          className={`btn${etat.existe === false ? " toggle-active" : ""}${erroneeExistence && etat.existe === false ? " is-erronee" : ""}`}
          onClick={() => onChange({ ...etat, existe: false })}
        >
          N'existe pas
        </button>
        <button
          type="button"
          className={`btn${etat.existe === true ? " toggle-active" : ""}${erroneeExistence && etat.existe === true ? " is-erronee" : ""}`}
          onClick={() => onChange({ ...etat, existe: true })}
        >
          Existe
        </button>
      </div>
      {etat.existe === true && (
        <div className="field-row field-row-wrap contenu-conditionnel">
          <label className="field-label field-label-minuscule">position x =</label>
          <input
            type="text"
            className={`text-input${erroneeValeurs ? " is-erronee" : ""}`}
            value={etat.xTexte}
            onChange={(e) => onChange({ ...etat, xTexte: e.target.value })}
          />
          <label className="field-label field-label-minuscule">valeur y =</label>
          <input
            type="text"
            className={`text-input${erroneeValeurs ? " is-erronee" : ""}`}
            value={etat.yTexte}
            onChange={(e) => onChange({ ...etat, yTexte: e.target.value })}
          />
        </div>
      )}
    </div>
  );
}

interface Props {
  exercice: ExerciceGraphiquesCyclometriques;
  aideNiveau1: AideAvecLatex;
  aideNiveau2: AideAvecLatex;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseEcranUniqueGraphiquesCyclometriques) => void;
}

/**
 * Écran UNIQUE de `6gen5` (refonte complète, remplace l'ancienne séquence "calcul → sélection" à 1
 * ou 2 écrans) — toutes familles confondues : 4 graphiques Mafs empilés (réutilise `GrapheOptionCyclo`,
 * composant partagé, jamais un rendu ad hoc) + 4 boutons de choix A-D, puis, dès qu'une lettre est
 * sélectionnée, un bloc de justification à 6 sous-réponses (ordonnée à l'origine, domf, imf,
 * parité, maximum, minimum) — le tout soumis en UNE SEULE tentative combinée (même mécanique que
 * l'écran "bijection" à 2 comboboxes de 6gen1, `EtapeBijectionInjectiviteFonctions.tsx`, généralisée
 * à 7 sous-réponses). Chaque sous-réponse est diagnostiquée INDÉPENDAMMENT (`diagnostiquerEcranUnique`)
 * pour le surlignage rouge — jamais une tentative fausse sur un champ confondue avec une autre.
 */
export function EtapeApparierGraphiqueCyclo({ exercice, aideNiveau1, aideNiveau2, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider }: Props) {
  const [lettre, setLettre] = useState<number | null>(null);
  const [ordonnee, setOrdonnee] = useState<EtatExtremum>(EXTREMUM_VIDE);
  const [domf, setDomf] = useState<EnsembleReelGuide | null>(null);
  const [imf, setImf] = useState<EnsembleReelGuide | null>(null);
  const [parite, setParite] = useState<ParticulariteParite | "">("");
  const [maximum, setMaximum] = useState<EtatExtremum>(EXTREMUM_VIDE);
  const [minimum, setMinimum] = useState<EtatExtremum>(EXTREMUM_VIDE);
  const [derniereReponse, setDerniereReponse] = useState<ReponseEcranUniqueGraphiquesCyclometriques | null>(null);

  const [wrapperRef, largeurMesuree] = useLargeurConteneur<HTMLDivElement>();
  const largeur = Math.min(360, Math.max(200, largeurMesuree || 280));
  const viewBox = calculerViewBoxGraphique(exercice);

  const ordonneeComplete = ordonnee.existe !== null && (ordonnee.existe === false || evaluerValeurCyclometrique(ordonnee.xTexte) !== null);
  const complet = lettre !== null && ordonneeComplete && domf !== null && imf !== null && parite !== "" && extremumComplet(maximum) && extremumComplet(minimum);

  const montrerErreurs = tentativesUtilisees > 0 && derniereReponse !== null;
  const diagnostic: DiagnosticEcranUniqueGraphiquesCyclometriques | null = montrerErreurs ? diagnostiquerEcranUnique(exercice, derniereReponse as ReponseEcranUniqueGraphiquesCyclometriques) : null;

  function valider() {
    // Le seul garde-fou nécessaire : `complet` alias déjà toutes les conditions individuelles
    // (lettre/domf/imf/parite non vides) — TypeScript 4.4+ narrowe `parite`/`lettre`/`domf`/`imf`
    // en conséquence pour le reste de cette fonction (analyse de flux des conditions aliasées).
    // Répéter ces conditions individuellement ici entre en contradiction avec cette narrowing (la
    // 2e moitié d'un `||` court-circuité hérite déjà de la négation de la 1re) — jamais les
    // dupliquer.
    if (!complet) return;
    const reponse: ReponseEcranUniqueGraphiquesCyclometriques = {
      lettre,
      ordonnee: ordonnee.existe ? { existe: true, valeur: evaluerValeurCyclometrique(ordonnee.xTexte) as number } : { existe: false },
      domf,
      imf,
      parite,
      maximum: extremumVersReponse(maximum),
      minimum: extremumVersReponse(minimum),
    };
    setDerniereReponse(reponse);
    onValider(reponse);
  }

  return (
    <div>
      <p className="prompt-text">{CONSIGNE_GENERALE}</p>
      <div className="equation-box">
        <Katex expression={formatExpressionLatex(exercice)} />
      </div>

      <div className="graphes-qcm-liste" ref={wrapperRef}>
        {exercice.candidats.map((_, index) => (
          <div className="graphe-qcm-carte" key={index}>
            <p className="graphe-qcm-label">{LETTRES[index]}</p>
            <GrapheOptionCyclo exercice={exercice} index={index} viewBox={viewBox} largeur={largeur} hauteur={largeur} />
          </div>
        ))}
      </div>

      <div className="options-grid-compact">
        {LETTRES.slice(0, exercice.candidats.length).map((l, index) => (
          <button
            key={l}
            type="button"
            className={`btn${lettre === index ? " toggle-active" : ""}${diagnostic && diagnostic.lettre !== "correct" && lettre === index ? " is-erronee" : ""}`}
            onClick={() => setLettre(index)}
          >
            {l}
          </button>
        ))}
      </div>

      {lettre !== null && (
        <div className="contenu-conditionnel">
          <p className="prompt-text">Pourquoi as-tu sélectionné {LETTRES[lettre]} ?</p>

          <div className="field">
            <p className="field-label">Ordonnée à l'origine</p>
            <div className="options-grid-compact">
              <button
                type="button"
                className={`btn${ordonnee.existe === false ? " toggle-active" : ""}${diagnostic && diagnostic.ordonnee !== "correct" && ordonnee.existe === false ? " is-erronee" : ""}`}
                onClick={() => setOrdonnee({ ...ordonnee, existe: false })}
              >
                N'existe pas
              </button>
              <button
                type="button"
                className={`btn${ordonnee.existe === true ? " toggle-active" : ""}${diagnostic && diagnostic.ordonnee !== "correct" && ordonnee.existe === true ? " is-erronee" : ""}`}
                onClick={() => setOrdonnee({ ...ordonnee, existe: true })}
              >
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
                  onChange={(e) => setOrdonnee({ ...ordonnee, xTexte: e.target.value })}
                />
              </div>
            )}
          </div>

          <div className="field">
            <p className="field-label">Domaine de f</p>
            <EnsembleReelGuideBuilder label="\text{dom} f=" onChange={setDomf} erronee={diagnostic !== null && diagnostic.domf !== "correct"} parseurNombre={evaluerValeurCyclometrique} />
          </div>

          <div className="field">
            <p className="field-label">Image de f</p>
            <EnsembleReelGuideBuilder label="\text{Im}(f)=" onChange={setImf} erronee={diagnostic !== null && diagnostic.imf !== "correct"} parseurNombre={evaluerValeurCyclometrique} />
          </div>

          <div className="field">
            <p className="field-label">Parité</p>
            <select
              className={`ce-select${diagnostic && diagnostic.parite !== "correct" ? " is-erronee" : ""}`}
              value={parite}
              onChange={(e) => setParite(e.target.value as ParticulariteParite)}
            >
              <option value="" disabled>
                choisir…
              </option>
              <option value="paire">{LIBELLE_PARITE.paire}</option>
              <option value="impaire">{LIBELLE_PARITE.impaire}</option>
              <option value="aucune">{LIBELLE_PARITE.aucune}</option>
            </select>
          </div>

          <ChampExtremum
            titre="Maximum"
            etat={maximum}
            onChange={setMaximum}
            erroneeExistence={diagnostic !== null && diagnostic.maximum !== "correct"}
            erroneeValeurs={diagnostic !== null && diagnostic.maximum !== "correct"}
          />
          <ChampExtremum
            titre="Minimum"
            etat={minimum}
            onChange={setMinimum}
            erroneeExistence={diagnostic !== null && diagnostic.minimum !== "correct"}
            erroneeValeurs={diagnostic !== null && diagnostic.minimum !== "correct"}
          />
        </div>
      )}

      <BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />
      <button type="button" className="btn btn-primary" disabled={!complet} onClick={valider}>
        Valider
      </button>

      {montrerErreurs && (
        <p className="alert-error" role="alert">
          Incorrect — tentative {tentativesUtilisees}/{tentativesMax}, réessaie.
        </p>
      )}

      {niveauAide >= 1 && (
        <div className="aide-5e">
          <p>{aideNiveau1.texte}</p>
          {aideNiveau1.latex && <Katex expression={aideNiveau1.latex} block />}
          {niveauAide >= 2 && (
            <>
              <p>{aideNiveau2.texte}</p>
              {aideNiveau2.latex && <Katex expression={aideNiveau2.latex} block />}
            </>
          )}
        </div>
      )}
    </div>
  );
}
