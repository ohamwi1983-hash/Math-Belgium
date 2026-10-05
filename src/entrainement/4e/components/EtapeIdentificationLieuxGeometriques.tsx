import { useState } from "react";
import type { ExerciceLieuxGeometriques, Lieu, TypeLieu } from "../core/lieuxGeometriques.types";
import { diagnostiquerIdentification, diagnostiquerIdentificationLieu } from "../moteur/verificationLieuxGeometriques";
import type { ReponseIdentification, ReponseIdentificationLieu } from "../moteur/verificationLieuxGeometriques";
import { filtrerSaisieNumerique, gererKeyDownNumerique } from "../ui/bloquerSaisieNonNumerique";
import { PLACEHOLDER_COORDONNEE } from "../ui/formatEquationDroite";
import {
  CONSIGNE_GENERALE_IDENTIFICATION,
  LIBELLE_TYPE_LIEU,
  SOUS_TITRE_CHAMPS_IDENTIFICATION,
  libelleBoutonAide,
  segmentsAideIdentificationNiveau1,
  segmentsAideIdentificationNiveau2,
  segmentsEnonce,
} from "../ui/formatLieuxGeometriques";
import { formatMessageErreur } from "../ui/messageErreur";
import { Katex } from "./Katex";
import { RenduFragments } from "./RenduFragments";

const TYPES_LIEU: TypeLieu[] = ["droite", "cercle", "parabole"];

interface ChampsLieuBrut {
  type: TypeLieu | null;
  m: string;
  p: string;
  x0: string;
  y0: string;
  rayon: string;
  xF: string;
  yF: string;
  pParabole: string;
}

const CHAMPS_VIDES: ChampsLieuBrut = { type: null, m: "", p: "", x0: "", y0: "", rayon: "", xF: "", yF: "", pParabole: "" };

function nombre(texte: string): number {
  return Number(texte.trim().replace(",", "."));
}

function construireReponseLieu(champs: ChampsLieuBrut): ReponseIdentificationLieu | null {
  if (champs.type === "droite") {
    if (champs.m.trim() === "" || champs.p.trim() === "") return null;
    return { type: "droite", m: nombre(champs.m), p: nombre(champs.p) };
  }
  if (champs.type === "cercle") {
    if (champs.x0.trim() === "" || champs.y0.trim() === "" || champs.rayon.trim() === "") return null;
    return { type: "cercle", x0: nombre(champs.x0), y0: nombre(champs.y0), rayon: nombre(champs.rayon) };
  }
  if (champs.type === "parabole") {
    if (champs.xF.trim() === "" || champs.yF.trim() === "" || champs.pParabole.trim() === "") return null;
    return { type: "parabole", xF: nombre(champs.xF), yF: nombre(champs.yF), p: nombre(champs.pParabole) };
  }
  return null;
}

interface ChampsLieuInputProps {
  numero: 1 | 2;
  champs: ChampsLieuBrut;
  onChange: (champs: ChampsLieuBrut) => void;
  lieuReel: Lieu;
  apresEchec: boolean;
}

/** Choix catégoriel (droite/cercle/parabole) puis champs numériques adaptés — un bloc par lieu,
 * réutilisé pour les 2 (`numero` ne sert plus qu'à distinguer les identifiants DOM des champs,
 * jamais affiché comme "premier"/"second" : la vérification se fait désormais PAR ENSEMBLE, voir
 * `verificationLieuxGeometriques.ts::diagnostiquerIdentification`, B.4). Un sous-titre apparaît
 * au-dessus des champs numériques une fois un type sélectionné (B.2), jamais avant. */
function ChampsLieuInput({ numero, champs, onChange, lieuReel, apresEchec }: ChampsLieuInputProps) {
  const reponse = construireReponseLieu(champs);
  const erronee = apresEchec && reponse !== null && diagnostiquerIdentificationLieu(lieuReel, reponse) !== "correct";
  const classeChamp = `text-input${erronee ? " is-erronee" : ""}`;
  const prefixe = `lieux-geometriques-lieu${numero}`;

  return (
    <div className="triangle-quelconque-aide">
      <div className="options-grid-compact">
        {TYPES_LIEU.map((type) => (
          <button
            key={type}
            type="button"
            className={`btn${champs.type === type ? " toggle-active" : ""}`}
            onClick={() => onChange({ ...CHAMPS_VIDES, type })}
          >
            {LIBELLE_TYPE_LIEU[type]}
          </button>
        ))}
      </div>

      {champs.type !== null && <p className="field-label contenu-conditionnel">{SOUS_TITRE_CHAMPS_IDENTIFICATION[champs.type]}</p>}

      {champs.type === "droite" && (
        <div className="field-row">
          <div className="field field-inline">
            <label className="field-label field-label-minuscule" htmlFor={`${prefixe}-m`}>
              m =
            </label>
            <input
              id={`${prefixe}-m`}
              className={classeChamp}
              placeholder={PLACEHOLDER_COORDONNEE}
              value={champs.m}
              onChange={(e) => onChange({ ...champs, m: filtrerSaisieNumerique(e.target.value) })}
              onKeyDown={gererKeyDownNumerique}
            />
          </div>
          <div className="field field-inline">
            <label className="field-label field-label-minuscule" htmlFor={`${prefixe}-p`}>
              p =
            </label>
            <input
              id={`${prefixe}-p`}
              className={classeChamp}
              placeholder={PLACEHOLDER_COORDONNEE}
              value={champs.p}
              onChange={(e) => onChange({ ...champs, p: filtrerSaisieNumerique(e.target.value) })}
              onKeyDown={gererKeyDownNumerique}
            />
          </div>
        </div>
      )}

      {champs.type === "cercle" && (
        <>
          <div className="field-row">
            <div className="field field-inline">
              <label className="field-label field-label-minuscule" htmlFor={`${prefixe}-x0`}>
                x₀ =
              </label>
              <input
                id={`${prefixe}-x0`}
                className={classeChamp}
                placeholder={PLACEHOLDER_COORDONNEE}
                value={champs.x0}
                onChange={(e) => onChange({ ...champs, x0: filtrerSaisieNumerique(e.target.value) })}
                onKeyDown={gererKeyDownNumerique}
              />
            </div>
            <div className="field field-inline">
              <label className="field-label field-label-minuscule" htmlFor={`${prefixe}-y0`}>
                y₀ =
              </label>
              <input
                id={`${prefixe}-y0`}
                className={classeChamp}
                placeholder={PLACEHOLDER_COORDONNEE}
                value={champs.y0}
                onChange={(e) => onChange({ ...champs, y0: filtrerSaisieNumerique(e.target.value) })}
                onKeyDown={gererKeyDownNumerique}
              />
            </div>
          </div>
          <div className="field field-inline">
            <label className="field-label" htmlFor={`${prefixe}-rayon`}>
              R =
            </label>
            <input
              id={`${prefixe}-rayon`}
              className={classeChamp}
              placeholder={PLACEHOLDER_COORDONNEE}
              value={champs.rayon}
              onChange={(e) => onChange({ ...champs, rayon: filtrerSaisieNumerique(e.target.value) })}
              onKeyDown={gererKeyDownNumerique}
            />
          </div>
        </>
      )}

      {champs.type === "parabole" && (
        <>
          <div className="field-row">
            <div className="field field-inline">
              <label className="field-label field-label-minuscule" htmlFor={`${prefixe}-xF`}>
                <Katex expression="x_F" /> =
              </label>
              <input
                id={`${prefixe}-xF`}
                className={classeChamp}
                placeholder={PLACEHOLDER_COORDONNEE}
                value={champs.xF}
                onChange={(e) => onChange({ ...champs, xF: filtrerSaisieNumerique(e.target.value) })}
                onKeyDown={gererKeyDownNumerique}
              />
            </div>
            <div className="field field-inline">
              <label className="field-label field-label-minuscule" htmlFor={`${prefixe}-yF`}>
                <Katex expression="y_F" /> =
              </label>
              <input
                id={`${prefixe}-yF`}
                className={classeChamp}
                placeholder={PLACEHOLDER_COORDONNEE}
                value={champs.yF}
                onChange={(e) => onChange({ ...champs, yF: filtrerSaisieNumerique(e.target.value) })}
                onKeyDown={gererKeyDownNumerique}
              />
            </div>
          </div>
          <div className="field field-inline">
            <label className="field-label field-label-minuscule" htmlFor={`${prefixe}-p`}>
              p =
            </label>
            <input
              id={`${prefixe}-p`}
              className={classeChamp}
              placeholder={PLACEHOLDER_COORDONNEE}
              value={champs.pParabole}
              onChange={(e) => onChange({ ...champs, pParabole: filtrerSaisieNumerique(e.target.value) })}
              onKeyDown={gererKeyDownNumerique}
            />
          </div>
        </>
      )}
    </div>
  );
}

interface Props {
  exercice: ExerciceLieuxGeometriques;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseIdentification) => void;
}

/** Écran 1 — Identification. Pour chacun des 2 lieux : choix catégoriel (droite/cercle/parabole)
 * puis champs numériques adaptés au choix. */
export function EtapeIdentificationLieuxGeometriques({ exercice, tentativesUtilisees, tentativesMax, niveauAide, onActiverAide, onValider }: Props) {
  const [champs1, setChamps1] = useState<ChampsLieuBrut>(CHAMPS_VIDES);
  const [champs2, setChamps2] = useState<ChampsLieuBrut>(CHAMPS_VIDES);
  const apresEchec = tentativesUtilisees > 0;

  const reponseLieu1 = construireReponseLieu(champs1);
  const reponseLieu2 = construireReponseLieu(champs2);
  const complet = reponseLieu1 !== null && reponseLieu2 !== null;
  const statutGlobal = apresEchec && complet ? diagnostiquerIdentification(exercice, { lieu1: reponseLieu1, lieu2: reponseLieu2 }) : undefined;

  return (
    <div>
      <div className="equation-box">
        <p>
          <RenduFragments fragments={segmentsEnonce(exercice)} />
        </p>
      </div>
      <p className="prompt-text">{CONSIGNE_GENERALE_IDENTIFICATION}</p>

      <ChampsLieuInput numero={1} champs={champs1} onChange={setChamps1} lieuReel={exercice.lieu1} apresEchec={apresEchec} />
      <ChampsLieuInput numero={2} champs={champs2} onChange={setChamps2} lieuReel={exercice.lieu2} apresEchec={apresEchec} />

      {niveauAide > 0 && (
        <div className="triangle-quelconque-aide">
          <p>
            <RenduFragments fragments={segmentsAideIdentificationNiveau1()} />
          </p>
          {niveauAide >= 2 && (
            <p>
              <RenduFragments fragments={segmentsAideIdentificationNiveau2(exercice)} />
            </p>
          )}
        </div>
      )}
      <button type="button" className="btn btn-aide" disabled={niveauAide >= 2} onClick={onActiverAide}>
        {libelleBoutonAide(niveauAide, 2)}
      </button>

      <button
        type="button"
        className="btn btn-primary"
        disabled={!complet}
        onClick={() => reponseLieu1 !== null && reponseLieu2 !== null && onValider({ lieu1: reponseLieu1, lieu2: reponseLieu2 })}
      >
        Valider
      </button>
      {apresEchec && (
        <p className="alert-error" role="alert">
          {formatMessageErreur(tentativesUtilisees, tentativesMax, statutGlobal)}
        </p>
      )}
    </div>
  );
}
