import { Fragment, useState } from "react";
import { ApercuExpressionLatex } from "../components/ApercuExpressionLatex";
import { Katex } from "../components/Katex";
import type { StatutVerification } from "../moteur/statutVerification";
import { formatMessageErreur } from "../ui/messageErreur";
import type { AideAvecLatex, ChampDef } from "../ui6e/formatIntersectionsConiques";
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

const MAX_LIGNES_DEFAUT = 2;

/**
 * Écran GÉNÉRIQUE à N champs pour `6gen61` — mirroir `EtapeChampsEquationConiqueCaracteristiques.tsx`
 * (6gen59) : chaque champ TOUJOURS dans un `.field` empilé (label AU-DESSUS), **jamais
 * `.field-inline`** (CLAUDE.md — piège d'un label descriptif qui déborderait sur mobile).
 *
 * **Type `"liste"` (famille A, écran 4 — add-as-needed 0/1/2 points)** : un écran de ce type n'a
 * JAMAIS qu'un seul champ (`champs.length===1`, garanti par `ui6e/formatIntersectionsConiques.ts`,
 * `champsEcranA`) — rendu par une sous-UI dédiée, mirroir `EtapeListeEquationsExpLog.tsx` (6gen14) :
 * croix rouge `×` pour retirer une ligne (jamais un bouton texte), gate "Pas de point
 * d'intersection" pour le cas 0 solution — jamais des champs fixes (convention transversale
 * CLAUDE.md, "interface de saisie flexible").
 */
export function EtapeChampsIntersectionsConiques({ consigneGenerale, blocDonnees, etatActuel, consigneEcran, champs, aideNiveau1, aideNiveau2, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, diagnostiquer }: Props) {
  const champListe = champs.length === 1 && champs[0].type === "liste" ? champs[0] : null;

  const [valeurs, setValeurs] = useState<string[]>(() => champs.map(() => ""));
  const [aucune, setAucune] = useState(false);
  const [lignes, setLignes] = useState<string[]>([""]);

  const montrerErreurs = tentativesUtilisees > 0;

  const valeursListe = aucune ? [] : lignes;
  const toutRempliListe = aucune || lignes.every((l) => l.trim() !== "");
  const toutRempliChamps = valeurs.every((v) => v.trim() !== "");
  const toutRempli = champListe ? toutRempliListe : toutRempliChamps;

  const dernierStatut = montrerErreurs ? diagnostiquer(champListe ? valeursListe : valeurs) : null;

  function valider() {
    if (!toutRempli) return;
    onValider(champListe ? valeursListe : valeurs);
  }

  function changer(index: number, valeur: string) {
    setValeurs((prev) => prev.map((v, i) => (i === index ? valeur : v)));
  }

  const maxLignes = champListe?.maxLignes ?? MAX_LIGNES_DEFAUT;

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
      {champListe ? (
        <>
          <button type="button" className={`btn ${aucune ? "toggle-active" : ""}`} onClick={() => setAucune((v) => !v)}>
            {champListe.labelAucune}
          </button>
          {!aucune && (
            <div className="contenu-conditionnel">
              <div className="field">
                <label className="field-label">{champListe.label}</label>
                {lignes.map((ligne, i) => (
                  <div key={i} className="field-row">
                    <input
                      type="text"
                      className={`text-input ${montrerErreurs ? "is-erronee" : ""}`}
                      value={ligne}
                      placeholder="ex : (3;4)"
                      onChange={(e) => setLignes((arr) => arr.map((x, j) => (j === i ? e.target.value : x)))}
                    />
                    {lignes.length > 1 && (
                      <button type="button" className="btn liste-morceaux-retirer" aria-label={`Retirer le point ${i + 1}`} onClick={() => setLignes((arr) => arr.filter((_, j) => j !== i))}>
                        ×
                      </button>
                    )}
                  </div>
                ))}
                {lignes.length < maxLignes && (
                  <button type="button" className="btn" onClick={() => setLignes((arr) => (arr.length >= maxLignes ? arr : [...arr, ""]))}>
                    {champListe.labelAjout}
                  </button>
                )}
              </div>
            </div>
          )}
        </>
      ) : (
        champs.map((champ, i) =>
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
              <ApercuExpressionLatex texte={valeurs[i]} />
              <div className="field">
                <label className={`field-label ${champ.minuscule ? "field-label-minuscule" : ""}`}>{champ.label}</label>
                <input type="text" className={`text-input ${montrerErreurs ? "is-erronee" : ""}`} value={valeurs[i]} placeholder={champ.placeholder} onChange={(e) => changer(i, e.target.value)} />
              </div>
            </Fragment>
          ),
        )
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
