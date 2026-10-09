import { Fragment, useState } from "react";
import { ApercuExpressionLatex } from "../components/ApercuExpressionLatex";
import { Katex } from "../components/Katex";
import type { StatutVerification } from "../moteur/statutVerification";
import { formatMessageErreur } from "../ui/messageErreur";
import type { AideAvecLatex, ChampDef } from "../ui6e/formatProprietesOptiquesConiques";
import { BoutonAide } from "./BoutonAide";

interface Props {
  consigneGenerale: string;
  blocDonnees: string[];
  etatActuel: string[] | null;
  consigneEcran: string;
  champs: ChampDef[];
  aideNiveau1: AideAvecLatex;
  aideNiveau2: AideAvecLatex;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (valeurs: string[]) => void;
  diagnostiquer: (valeurs: string[]) => StatutVerification;
}

/** Un champ dont le placeholder est un point littéral "(x;y)" (ex. "ex : (-3;0)") est vérifié par
 * `diagnostiquerPointOrdonne`/`parserPointLibre` (`verificationProprietesOptiquesConiques.ts`), pas
 * par la grammaire d'expression libre (point-virgule séparateur non géré, mirroir de la restriction
 * documentée pour `EtapeListeCentresCercles.tsx`) — l'aperçu LaTeX est donc omis pour ce champ précis. */
function estChampPointLitteral(champ: ChampDef): boolean {
  return /^ex\s*:\s*\(.*;.*\)$/.test(champ.placeholder ?? "");
}

/**
 * Écran GÉNÉRIQUE à N champs pour `6gen63` — mirroir `EtapeChampsIntersectionsConiques.tsx` (6gen61),
 * ALLÉGÉ : ce générateur n'a jamais de champ `type:"liste"` (aucun ensemble de taille variable — les
 * 2 foyers, les 2 points d'intersection et le point de réflexion sont TOUJOURS en nombre fixe), donc
 * aucune sous-UI add-as-needed. Chaque champ TOUJOURS dans un `.field` empilé (label AU-DESSUS),
 * **jamais `.field-inline`** (CLAUDE.md).
 */
export function EtapeChampsProprietesOptiquesConiques({ consigneGenerale, blocDonnees, etatActuel, consigneEcran, champs, aideNiveau1, aideNiveau2, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, diagnostiquer }: Props) {
  const [valeurs, setValeurs] = useState<string[]>(() => champs.map(() => ""));

  const montrerErreurs = tentativesUtilisees > 0;
  const toutRempli = valeurs.every((v) => v.trim() !== "");
  const dernierStatut = montrerErreurs ? diagnostiquer(valeurs) : null;

  function valider() {
    if (!toutRempli) return;
    onValider(valeurs);
  }

  function changer(index: number, valeur: string) {
    setValeurs((prev) => prev.map((v, i) => (i === index ? valeur : v)));
  }

  return (
    <div>
      <p className="prompt-text">{consigneGenerale}</p>
      <div className="equation-box">
        <div className="equation-box-donnees">
          {blocDonnees.map((frag, i) => (
            <Katex key={i} expression={frag} block />
          ))}
        </div>
      </div>
      {etatActuel && (
        <div className="etat-actuel-box">
          <div className="etat-actuel-box-termes">
            {etatActuel.map((frag, i) => (
              <Katex key={i} expression={frag} />
            ))}
          </div>
        </div>
      )}
      <p className="prompt-text">{consigneEcran}</p>
      {champs.map((champ, i) =>
        champ.type === "choix" ? (
          <div className="field" key={i}>
            <label className={`field-label ${champ.minuscule ? "field-label-minuscule" : ""}`}>{champ.label}</label>
            {/* Grille 2 colonnes (`.options-grid-compact`, jamais `.field-row-wrap`) — convention
             * transversale "boutons de choix toujours 2 colonnes, jamais empilés verticalement"
             * (CLAUDE.md). */}
            <div className="options-grid-compact">
              {(champ.options ?? []).map((option) => (
                <button key={option.valeur} type="button" className={`btn ${valeurs[i] === option.valeur ? "toggle-active" : ""} ${montrerErreurs && valeurs[i] === option.valeur ? "is-erronee" : ""}`} onClick={() => changer(i, option.valeur)}>
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <Fragment key={i}>
            {!estChampPointLitteral(champ) && <ApercuExpressionLatex texte={valeurs[i]} />}
            <div className="field">
              <label className={`field-label ${champ.minuscule ? "field-label-minuscule" : ""}`}>{champ.label}</label>
              <input type="text" className={`text-input ${montrerErreurs ? "is-erronee" : ""}`} value={valeurs[i]} placeholder={champ.placeholder} onChange={(e) => changer(i, e.target.value)} />
            </div>
          </Fragment>
        ),
      )}
      <BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />
      <button type="button" className="btn btn-primary" disabled={!toutRempli} onClick={valider}>
        Valider
      </button>
      {montrerErreurs && (
        <p className="alert-error" role="alert">
          {formatMessageErreur(tentativesUtilisees, tentativesMax, dernierStatut)}
        </p>
      )}
      {niveauAide >= 1 && (
        <div className="aide-5e contenu-conditionnel">
          <p>{aideNiveau1.texte}</p>
          {aideNiveau1.latex.map((frag, i) => (
            <Katex key={i} expression={frag} block />
          ))}
          {niveauAide >= 2 && (
            <>
              <p>{aideNiveau2.texte}</p>
              {aideNiveau2.latex.map((frag, i) => (
                <Katex key={i} expression={frag} block />
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
