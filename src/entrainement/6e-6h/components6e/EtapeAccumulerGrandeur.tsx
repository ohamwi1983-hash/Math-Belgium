import { useState } from "react";
import { ApercuExpressionLatex } from "../components/ApercuExpressionLatex";
import { Katex } from "../components/Katex";
import { RenduFragments } from "../components/RenduFragments";
import type { StatutVerification } from "../moteur/statutVerification";
import { formatMessageErreur } from "../ui/messageErreur";
import type { AideAvecLatex, ChampAccumuler, FragmentConsigne, OptionModele } from "../ui6e/formatAccumulerGrandeur";
import { etiquetteFragments } from "../ui6e/formatAccumulerGrandeur";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { BoutonAide } from "./BoutonAide";
import { EnTeteExercice } from "./EnTeteExercice";

export type ModeEcranAccumuler = { type: "champ"; champ: ChampAccumuler } | { type: "choix"; options: OptionModele[] };

interface Props {
  consigneGenerale: FragmentConsigne[];
  blocDonnees: string[];
  /** Graphique du taux (chaîne SVG autonome), sans hachure. */
  figureSvg: string | null;
  consigneEcran: FragmentConsigne[];
  mode: ModeEcranAccumuler;
  aideNiveau1: AideAvecLatex;
  aideNiveau2: AideAvecLatex;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (valeurs: string[]) => void;
  diagnostiquer: (valeurs: string[]) => StatutVerification;
  validation?: ValidationEtapeProps | null;
}

/**
 * Écran unique de `6gen80` (un champ libre OU un choix fermé) — structure du chantier : consigne
 * générale → données → graphique du taux → consigne de l'écran → bloc de travail → aide → « Valider ».
 * Saisie libre jamais filtrée (pas d'`inputMode`, pas de `type="number"`) ; une saisie illisible
 * affiche un message de syntaxe SANS appeler `onValider` (aucune tentative consommée). Choix fermé :
 * boutons `.btn.toggle-active`, une seule tentative. `App6gen80.tsx` change la `key` à chaque écran
 * ET à chaque nouvel exercice (saisie remise à vide).
 */
export function EtapeAccumulerGrandeur({
  consigneGenerale,
  blocDonnees,
  figureSvg,
  consigneEcran,
  mode,
  aideNiveau1,
  aideNiveau2,
  tentativesUtilisees,
  tentativesMax,
  niveauAide,
  niveauAideMax,
  onActiverAide,
  onValider,
  diagnostiquer,
  validation,
}: Props) {
  const [valeur, setValeur] = useState("");
  const [erreurSyntaxe, setErreurSyntaxe] = useState(false);
  const rempli = valeur.trim() !== "";
  const montrerErreur = tentativesUtilisees > 0 || erreurSyntaxe;

  function changer(v: string) {
    setValeur(v);
    setErreurSyntaxe(false);
  }

  function valider() {
    if (!rempli) return;
    if (diagnostiquer([valeur]) === "parse_error") {
      setErreurSyntaxe(true);
      return;
    }
    onValider([valeur]);
  }

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
      {figureSvg && <div style={{ margin: "12px 0" }} dangerouslySetInnerHTML={{ __html: figureSvg }} />}
      <p className="prompt-text">
        <RenduFragments fragments={consigneEcran} />
      </p>
      {mode.type === "champ" ? (
        <>
          {mode.champ.expression && <ApercuExpressionLatex texte={valeur} />}
          <div className="field">
            <label className="field-label field-label-minuscule">
              <RenduFragments fragments={etiquetteFragments(mode.champ.label)} />
            </label>
            <input
              type="text"
              className={`text-input ${tentativesUtilisees > 0 && !validation ? "is-erronee" : ""}`}
              value={valeur}
              placeholder={mode.champ.placeholder}
              disabled={!!validation}
              onChange={(e) => changer(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") valider();
              }}
            />
          </div>
        </>
      ) : (
        <div className="options-grid-compact" style={{ gridTemplateColumns: "1fr" }}>
          {mode.options.map((option) => (
            <button
              key={option.id}
              type="button"
              className={`btn ${valeur === option.id ? "toggle-active" : ""} ${tentativesUtilisees > 0 && valeur === option.id ? "is-erronee" : ""}`}
              style={{ overflowX: "auto", maxWidth: "100%" }}
              disabled={!!validation}
              onClick={() => changer(option.id)}
            >
              <span>
                <RenduFragments fragments={option.fragments} />
              </span>
            </button>
          ))}
        </div>
      )}
      {niveauAide >= 1 && (
        <div className="aide-5e">
          <p>{aideNiveau1.texte}</p>
          {aideNiveau1.latex && <Katex expression={aideNiveau1.latex} block />}
          {niveauAide >= 2 && aideNiveau2.texte && (
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
          <button type="button" className="btn btn-primary" disabled={!rempli} onClick={valider}>
            Valider
          </button>
          {montrerErreur && (
            <p className="alert-error" role="alert">
              {erreurSyntaxe
                ? "Écriture non reconnue — vérifie la syntaxe (parenthèses, nombre seul sans unité, virgule décimale) ; aucune tentative n'est décomptée."
                : formatMessageErreur(tentativesUtilisees, tentativesMax, "not_equivalent")}
            </p>
          )}
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
