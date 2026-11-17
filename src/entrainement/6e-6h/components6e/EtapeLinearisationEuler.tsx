import { useState } from "react";
import { ApercuExpressionLatex } from "../components/ApercuExpressionLatex";
import { Katex } from "../components/Katex";
import { RenduFragments } from "../components/RenduFragments";
import type { StatutVerification } from "../moteur/statutVerification";
import { formatMessageErreur } from "../ui/messageErreur";
import type { AideAvecLatex, ChampDef, FragmentConsigne } from "../ui6e/formatLinearisationEuler";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { BoutonAide } from "./BoutonAide";
import { EnTeteExercice } from "./EnTeteExercice";

interface Props {
  consigneGenerale: FragmentConsigne[];
  consigneEcran: FragmentConsigne[];
  champs: ChampDef[];
  aideNiveau1: AideAvecLatex;
  aideNiveau2: AideAvecLatex;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (valeurs: string[]) => void;
  /** Statut champ par champ : seuls les champs faux sont marqués. */
  diagnostiquer: (valeurs: string[]) => StatutVerification[];
  /** Message qui arrête la soumission (saisie illisible, puissance non calculée, forme non
   * linéarisée, valeur seulement arrondie) — aucune tentative consommée. */
  controle: (valeurs: string[]) => string | null;
  /** Message ciblé sur une erreur classique ((2i)ⁿ mal calculé, 2cos(kx) oublié…). */
  piege: (valeurs: string[]) => string | null;
  validation?: ValidationEtapeProps | null;
}

/**
 * Écran unique de `6gen93` (champs libres) — même structure que `EtapeGrandsNombresLog` (6gen92) :
 * consigne générale → consigne de l'écran → champs → aide → « Valider ». Saisie jamais filtrée (pas
 * d'`inputMode`, pas de `type="number"`) ; un refus de `controle` n'est PAS soumis : message, aucune
 * tentative consommée. `App6gen93.tsx` change la `key` à chaque écran ET à chaque nouvel exercice.
 */
export function EtapeLinearisationEuler({
  consigneGenerale,
  consigneEcran,
  champs,
  aideNiveau1,
  aideNiveau2,
  tentativesUtilisees,
  tentativesMax,
  niveauAide,
  niveauAideMax,
  onActiverAide,
  onValider,
  diagnostiquer,
  controle,
  piege,
  validation,
}: Props) {
  const [valeurs, setValeurs] = useState<string[]>(() => champs.map(() => ""));
  const [statutsSoumis, setStatutsSoumis] = useState<StatutVerification[] | null>(null);
  const [messagePiege, setMessagePiege] = useState<string | null>(null);
  const [erreurLecture, setErreurLecture] = useState<string | null>(null);
  const montrerErreurs = tentativesUtilisees > 0 && statutsSoumis !== null;
  const toutRempli = valeurs.every((v) => v.trim() !== "");
  const gele = !!validation;

  function changer(index: number, valeur: string) {
    setValeurs((prev) => prev.map((v, i) => (i === index ? valeur : v)));
    setErreurLecture(null);
  }

  function valider() {
    if (!toutRempli || gele) return;
    const refus = controle(valeurs);
    if (refus) {
      setErreurLecture(refus);
      return;
    }
    const statuts = diagnostiquer(valeurs);
    setErreurLecture(null);
    setStatutsSoumis(statuts);
    setMessagePiege(statuts.every((s) => s === "correct") ? null : piege(valeurs));
    onValider(valeurs);
  }

  return (
    <div>
      <EnTeteExercice consigneGenerale={<RenduFragments fragments={consigneGenerale} />} blocDonnees={null} />
      <p className="prompt-text" style={{ overflowX: "auto", maxWidth: "100%" }}>
        <RenduFragments fragments={consigneEcran} />
      </p>
      <div>
        {champs.map((champ, i) => (
          <div key={i}>
            {/* Aperçu seulement pour une écriture à mettre en forme (fraction, cos, π…), pas pour un entier. */}
            {/[^\d\s,.−-]/.test(valeurs[i]) && <ApercuExpressionLatex texte={valeurs[i]} />}
            <div className="field">
              <label className="field-label field-label-minuscule">{champ.labelLatex ? <Katex expression={champ.labelLatex} /> : champ.label}</label>
              <input
                type="text"
                aria-label={champ.label}
                className={`text-input ${montrerErreurs && statutsSoumis[i] !== "correct" ? "is-erronee" : ""}`}
                value={valeurs[i]}
                placeholder={champ.placeholder}
                disabled={gele}
                autoComplete="off"
                autoCapitalize="off"
                spellCheck={false}
                onChange={(e) => changer(i, e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") valider();
                }}
              />
            </div>
          </div>
        ))}
      </div>
      {niveauAide >= 1 && (
        <div className="aide-5e">
          <p>{aideNiveau1.texte}</p>
          {aideNiveau1.latex && (
            <div style={{ overflowX: "auto", maxWidth: "100%" }}>
              <Katex expression={aideNiveau1.latex} block />
            </div>
          )}
          {niveauAide >= 2 && aideNiveau2.texte && (
            <>
              <p>{aideNiveau2.texte}</p>
              {aideNiveau2.latex && (
                <div style={{ overflowX: "auto", maxWidth: "100%" }}>
                  <Katex expression={aideNiveau2.latex} block />
                </div>
              )}
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
          {erreurLecture && (
            <p className="alert-error" role="alert">
              {erreurLecture}
            </p>
          )}
          {!erreurLecture && montrerErreurs && (
            <p className="alert-error" role="alert">
              {formatMessageErreur(tentativesUtilisees, tentativesMax, "not_equivalent")}
              {messagePiege ? ` ${messagePiege}` : ""}
            </p>
          )}
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
