import { useState } from "react";
import { ApercuExpressionLatex } from "../components/ApercuExpressionLatex";
import { Katex } from "../components/Katex";
import { RenduFragments } from "../components/RenduFragments";
import type { NatureLieu } from "../core6e/complexesAvances.types";
import type { StatutVerification } from "../moteur/statutVerification";
import { formatMessageErreur } from "../ui/messageErreur";
import { MESSAGE_SAISIE_ILLISIBLE, NATURES_DISPONIBLES } from "../ui6e/formatComplexesAvances";
import type { AideAvecLatex, FragmentConsigne } from "../ui6e/formatComplexesAvances";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { BoutonAide } from "./BoutonAide";
import { EnTeteExercice } from "./EnTeteExercice";

interface Props {
  consigneGenerale: FragmentConsigne[];
  blocDonnees: string[];
  consigneEcran: FragmentConsigne[];
  demandePoleExclu: boolean;
  aideNiveau1: AideAvecLatex;
  aideNiveau2: AideAvecLatex;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (valeurs: string[]) => void;
  diagnostiquer: (valeurs: string[]) => StatutVerification;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

const NOMBRE_MAX_ANGLES = 2;

/**
 * Écran DÉDIÉ famille B, écran 2 (sous-types simples uniquement — jamais "intersection") :
 * "identifier la nature du lieu (droite/cercle/demi-droite(s)) PUIS ses paramètres" — mirroir DIRECT
 * de `EtapeTypeParametresTransformationsPlan.tsx` (6gen40), généralisé à 3 natures au lieu de 2.
 * D'abord un choix `.btn.toggle-active` parmi `NATURES_DISPONIBLES` (JAMAIS `.btn-primary`,
 * convention CLAUDE.md), PUIS (bloc `.contenu-conditionnel`, révélé seulement après le choix) le(s)
 * champ(s) pertinent(s) : 2 champs "point" (a+bi) pour droite, "centre" (a+bi) + "rayon" (réel) pour
 * cercle, "origine" (a+bi) + 1 à 2 champs "angle" (réel, add-as-needed) pour demi-droite(s). Si `demandePoleExclu`, un
 * champ supplémentaire "point exclu" (a+bi) est TOUJOURS demandé une fois une nature choisie — piège
 * transversal de la famille B (droite/cercle de Thalès), voir en-tête
 * `generateurs6e/complexesAvances/familleB.ts`.
 *
 * `valeurs` soumis à `onValider`/`diagnostiquer` : `[nature, ...params, poleTexte?]` (demi-droite :
 * params = `[origine, ...angles]`) — voir
 * `moteur6e/verificationComplexesAvances.ts`, `diagnostiquerBEcran2`. `App6gen42.tsx` doit le rendre
 * avec `key={phase}`.
 */
export function EtapeLocusComplexesAvances({ consigneGenerale, blocDonnees, consigneEcran, demandePoleExclu, aideNiveau1, aideNiveau2, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, diagnostiquer, validation}: Props) {
  const [nature, setNature] = useState<NatureLieu | null>(null);
  const [point1, setPoint1] = useState("");
  const [point2, setPoint2] = useState("");
  const [centre, setCentre] = useState("");
  const [rayon, setRayon] = useState("");
  const [origine, setOrigine] = useState("");
  const [angles, setAngles] = useState<string[]>([""]);
  const [poleTexte, setPoleTexte] = useState("");
  const [saisieIllisible, setSaisieIllisible] = useState(false);
  const montrerErreurs = tentativesUtilisees > 0;

  /** demiDroite : [origine, ...angles] — origine O pour z+z̄=c|z|, a pour arg(z−a)≡θ. */
  function paramsPourNature(): string[] {
    if (nature === "droite") return [point1, point2];
    if (nature === "cercle") return [centre, rayon];
    if (nature === "demiDroite") return [origine, ...angles];
    return [];
  }

  const toutRempli =
    nature !== null &&
    (nature === "droite" ? point1.trim() !== "" && point2.trim() !== "" : nature === "cercle" ? centre.trim() !== "" && rayon.trim() !== "" : origine.trim() !== "" && angles.length > 0 && angles.every((a) => a.trim() !== "")) &&
    (!demandePoleExclu || poleTexte.trim() !== "");

  function valider() {
    if (!toutRempli || nature === null) return;
    const valeurs = [nature, ...paramsPourNature(), ...(demandePoleExclu ? [poleTexte] : [])];
    if (diagnostiquer(valeurs) === "parse_error") {
      setSaisieIllisible(true);
      return;
    }
    onValider(valeurs);
  }

  /** Toute modification efface le message de saisie illisible. */
  function modifier<T>(setter: (v: T) => void) {
    return (v: T) => {
      setSaisieIllisible(false);
      setter(v);
    };
  }

  function ajouterAngle() {
    if (angles.length >= NOMBRE_MAX_ANGLES) return;
    setAngles((arr) => [...arr, ""]);
  }
  function retirerAngle(i: number) {
    setSaisieIllisible(false);
    setAngles((arr) => arr.filter((_, j) => j !== i));
  }
  function modifierAngle(i: number, valeur: string) {
    setSaisieIllisible(false);
    setAngles((arr) => arr.map((v, j) => (j === i ? valeur : v)));
  }
  const gele = Boolean(validation);
  const classeChamp = `text-input ${montrerErreurs ? "is-erronee" : ""}`;

  return (
    <div>
      <EnTeteExercice
        consigneGenerale={<RenduFragments fragments={consigneGenerale} />}
        blocDonnees={
          <div className="equation-box">
            <div className="equation-box-donnees">
              {blocDonnees.map((frag, i) => (
                <Katex key={i} expression={frag} block />
              ))}
            </div>
          </div>
        }
      />
      <p className="prompt-text">
        <RenduFragments fragments={consigneEcran} />
      </p>
      <div className="options-grid-compact">
        {NATURES_DISPONIBLES.map((option) => (
          <button type="button" key={option.id} className={`btn ${nature === option.id ? "toggle-active" : ""} ${montrerErreurs && nature === option.id ? "is-erronee" : ""}`} disabled={gele} onClick={() => modifier(setNature)(option.id)}>
            {option.label}
          </button>
        ))}
      </div>

      {/* Libellé au-dessus du champ, champs empilés : lisibles à 390 px (audit 6e ch. 5). Exemples
          hors de l'espace des tirages, sans « sqrt » ni « * ». */}
      {nature === "droite" && (
        <div className="contenu-conditionnel">
          <div className="field">
            <ApercuExpressionLatex texte={point1} label="Point 1 (a+bi) =" />
            <label className="field-label field-label-minuscule">Point 1 de la droite (a+bi) =</label>
            <input type="text" className={classeChamp} value={point1} placeholder="ex : 1/2+3i" disabled={gele} onChange={(e) => modifier(setPoint1)(e.target.value)} />
          </div>
          <div className="field">
            <ApercuExpressionLatex texte={point2} label="Point 2 (a+bi) =" />
            <label className="field-label field-label-minuscule">Point 2 de la droite (a+bi) =</label>
            <input type="text" className={classeChamp} value={point2} placeholder="ex : 5−i/3" disabled={gele} onChange={(e) => modifier(setPoint2)(e.target.value)} />
          </div>
        </div>
      )}

      {nature === "cercle" && (
        <div className="contenu-conditionnel">
          <div className="field">
            <ApercuExpressionLatex texte={centre} label="Centre (a+bi) =" />
            <label className="field-label field-label-minuscule">Centre (a+bi) =</label>
            <input type="text" className={classeChamp} value={centre} placeholder="ex : 2/3−i" disabled={gele} onChange={(e) => modifier(setCentre)(e.target.value)} />
          </div>
          <div className="field">
            <ApercuExpressionLatex texte={rayon} label="Rayon =" />
            <label className="field-label field-label-minuscule">Rayon =</label>
            <input type="text" className={classeChamp} value={rayon} placeholder="ex : 2,5" disabled={gele} onChange={(e) => modifier(setRayon)(e.target.value)} />
          </div>
        </div>
      )}

      {nature === "demiDroite" && (
        <div className="contenu-conditionnel">
          <div className="field">
            <ApercuExpressionLatex texte={origine} label="Origine (a+bi) =" />
            <label className="field-label field-label-minuscule">Origine commune (a+bi) =</label>
            <input type="text" className={classeChamp} value={origine} placeholder="ex : 2/3+i" disabled={gele} onChange={(e) => modifier(setOrigine)(e.target.value)} />
          </div>
          <label className="field-label field-label-minuscule">Angle(s) de direction (radians) =</label>
          {angles.map((a, i) => (
            <div key={i}>
              <ApercuExpressionLatex texte={a} />
              <div className="field-row">
                <input type="text" style={{ flex: "1 1 auto" }} aria-label={`Angle ${i + 1}`} className={classeChamp} value={a} placeholder="ex : 3pi/5" disabled={gele} onChange={(e) => modifierAngle(i, e.target.value)} />
                {angles.length > 1 && !gele && (
                  <button type="button" className="btn liste-morceaux-retirer" aria-label={`Retirer l'angle ${i + 1}`} onClick={() => retirerAngle(i)}>
                    ×
                  </button>
                )}
              </div>
            </div>
          ))}
          {angles.length < NOMBRE_MAX_ANGLES && !gele && (
            <button type="button" className="btn" onClick={ajouterAngle}>
              + Ajouter un angle
            </button>
          )}
        </div>
      )}

      {nature !== null && demandePoleExclu && (
        <div className="contenu-conditionnel">
          <div className="field">
            <ApercuExpressionLatex texte={poleTexte} />
            <label className="field-label field-label-minuscule">Point exclu du lieu (a+bi) =</label>
            <input type="text" className={classeChamp} value={poleTexte} placeholder="ex : 1/2−i" disabled={gele} onChange={(e) => modifier(setPoleTexte)(e.target.value)} />
          </div>
        </div>
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
      {!validation && (
        <>
        <BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />
        <button type="button" className="btn btn-primary" disabled={!toutRempli} onClick={valider}>
          Valider
        </button>
        {saisieIllisible ? (
          <p className="alert-error" role="alert">
            {MESSAGE_SAISIE_ILLISIBLE}
          </p>
        ) : (
          montrerErreurs && (
            <p className="alert-error" role="alert">
              {formatMessageErreur(tentativesUtilisees, tentativesMax)}
            </p>
          )
        )}
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
