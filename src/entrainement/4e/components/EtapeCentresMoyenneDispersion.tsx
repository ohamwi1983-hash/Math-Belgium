import { useState } from "react";
import type { ExerciceDispersion } from "../core/dispersion.types";
import type { ReponseCentresMoyenneDispersion } from "../moteur/verificationDispersion";
import { diagnostiquerCentresMoyenneDispersion, piegesCentresMoyenneDispersion, saisieIllisible } from "../moteur/verificationDispersion";
import { NIVEAU_AIDE_MAX_CENTRES_MOYENNE } from "../moteur/sessionDispersion";
import {
  INDEX_LIGNE_EXEMPLE,
  LABEL_EFFECTIF_NI,
  LABEL_VALEUR_XI,
  LABEL_XBAR,
  MESSAGE_SAISIE_ILLISIBLE,
  PLACEHOLDER_CENTRE,
  PLACEHOLDER_MOYENNE,
  consigneCentresMoyenne,
  formatClasseDispersionTexte,
  texteAideCentresMoyenneNiveau1,
  texteAideCentresMoyenneNiveau2,
} from "../ui/formatDispersion";
import { formatMessageErreur } from "../ui/messageErreur";
import { Katex } from "./Katex";
import { SegmentsInline } from "./SegmentsInline";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { BoutonAide } from "./BoutonAide";
import { normaliserSigneMoins } from "../../../lib/normaliserSaisie";

interface Props {
  exercice: ExerciceDispersion;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseCentresMoyenneDispersion) => void;
  validation?: ValidationEtapeProps | null;
}

/**
 * Écran supplémentaire de la famille "classes" (toujours le premier de cette famille) : les classes
 * et leurs effectifs sont affichés, l'élève complète la colonne des centres puis donne x̄ —
 * soumis ensemble (tout ou rien, 3 tentatives). Pièges reconnus après une erreur : un centre égal à
 * une borne, x̄ calculé avec les bornes, x̄ non pondéré. Une saisie illisible n'est jamais envoyée.
 */
export function EtapeCentresMoyenneDispersion({ exercice, tentativesUtilisees, tentativesMax, niveauAide, onActiverAide, onValider, validation }: Props) {
  const classes = exercice.enClasses?.classes ?? [];
  const [centres, setCentres] = useState<string[]>(() => Array.from({ length: classes.length }, () => ""));
  const [moyenne, setMoyenne] = useState("");
  const [illisible, setIllisible] = useState(false);

  function modifierCentre(index: number, valeur: string) {
    setIllisible(false);
    setCentres(centres.map((c, i) => (i === index ? valeur : c)));
  }

  const reponse: ReponseCentresMoyenneDispersion = { centres, moyenne };
  const complet = centres.every((c) => c.trim() !== "") && moyenne.trim() !== "";
  const evaluation = tentativesUtilisees > 0 ? diagnostiquerCentresMoyenneDispersion(exercice, reponse) : null;
  const pieges = tentativesUtilisees > 0 ? piegesCentresMoyenneDispersion(exercice, reponse) : null;
  const ligneExempleSurlignee = niveauAide >= 2;
  const aide1 = texteAideCentresMoyenneNiveau1();
  const aide2 = texteAideCentresMoyenneNiveau2(exercice);

  function valider() {
    if (centres.some(saisieIllisible) || saisieIllisible(moyenne)) {
      setIllisible(true);
      return;
    }
    onValider(reponse);
  }

  return (
    <div>
      <p className="prompt-text">
        <SegmentsInline segments={consigneCentresMoyenne(exercice)} />
      </p>

      <div className="tf-table-scroll">
        <table className="tf-table mp-table">
          <thead>
            <tr>
              <th>Classe</th>
              <th>
                Effectif <Katex expression={LABEL_EFFECTIF_NI} />
              </th>
              <th>
                Centre <Katex expression={LABEL_VALEUR_XI} />
              </th>
            </tr>
          </thead>
          <tbody>
            {classes.map((classe, index) => {
              const estExemple = ligneExempleSurlignee && index === INDEX_LIGNE_EXEMPLE;
              const erronee = (evaluation !== null && evaluation.centres[index] !== "correct") || (illisible && saisieIllisible(centres[index] ?? ""));
              return (
                <tr key={index} className={estExemple ? "is-surlignee" : undefined}>
                  <td>{formatClasseDispersionTexte(exercice, index)}</td>
                  <td>{classe.effectif}</td>
                  <td>
                    <input
                      className={`text-input${erronee ? " is-erronee" : ""}`}
                      placeholder={PLACEHOLDER_CENTRE}
                      value={centres[index]}
                      onChange={(e) => modifierCentre(index, normaliserSigneMoins(e.target.value))}
                      aria-label={`Centre de la classe ${formatClasseDispersionTexte(exercice, index)}`}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="field field-inline">
        <label className="field-label field-label-minuscule" htmlFor="dispersion-moyenne">
          <Katex expression={`${LABEL_XBAR} =`} />
        </label>
        <input
          id="dispersion-moyenne"
          className={`text-input${(evaluation && evaluation.moyenne !== "correct") || (illisible && saisieIllisible(moyenne)) ? " is-erronee" : ""}`}
          placeholder={PLACEHOLDER_MOYENNE}
          value={moyenne}
          onChange={(e) => {
            setIllisible(false);
            setMoyenne(normaliserSigneMoins(e.target.value));
          }}
        />
        <span style={{ flex: "none" }}>{exercice.contexte.unite}</span>
      </div>

      {niveauAide >= 1 && (
        <div className="triangle-quelconque-aide">
          <p>
            <SegmentsInline segments={aide1.segments} />
          </p>
          <Katex expression={aide1.latex} block />
          {niveauAide >= 2 && (
            <>
              <p>{aide2.texte}</p>
              <Katex expression={aide2.latex} block />
            </>
          )}
        </div>
      )}
      {!validation && (
        <>
          <BoutonAide niveauAide={niveauAide} niveauAideMax={NIVEAU_AIDE_MAX_CENTRES_MOYENNE} onActiverAide={onActiverAide} />

          <button type="button" className="btn btn-primary" disabled={!complet} onClick={valider}>
            Valider
          </button>
          {illisible && (
            <p className="alert-error" role="alert">
              {MESSAGE_SAISIE_ILLISIBLE}
            </p>
          )}
          {!illisible && tentativesUtilisees > 0 && (
            <p className="alert-error" role="alert">
              {/* Un seul enfant : `.alert-error` est un conteneur flex, chaque morceau deviendrait une colonne. */}
              <span>
                {formatMessageErreur(tentativesUtilisees, tentativesMax)}
                {pieges?.centreEgalBorne && <> Un centre n'est pas une borne : c'est le milieu de la classe, la moyenne de ses deux bornes.</>}
                {pieges?.moyenneAvecBornes && <> Ta moyenne est calculée avec les bornes des classes : il faut utiliser les centres.</>}
                {pieges?.moyenneNonPonderee && (
                  <>
                    {" "}Ta moyenne ne tient pas compte des effectifs : multiplie chaque centre par son effectif <Katex expression={LABEL_EFFECTIF_NI} />, puis divise par l'effectif total.
                  </>
                )}
              </span>
            </p>
          )}
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
