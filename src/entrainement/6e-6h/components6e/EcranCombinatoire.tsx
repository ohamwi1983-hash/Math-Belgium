import { useState } from "react";
import type { ReactNode } from "react";
import { Katex } from "../components/Katex";
import { RenduFragments } from "../components/RenduFragments";
import type { StatutVerification } from "../moteur/statutVerification";
import { apercuLatex } from "../moteur6e/saisieCombinatoire";
import { joindreLignes, refusAttentes, statutsAttentes } from "../moteur6e/attentesCombinatoire";
import type { Attente } from "../moteur6e/attentesCombinatoire";
import { f } from "../ui6e/fragmentsCombinatoire";
import type { AideCombi, ChampCombi, FragmentConsigne } from "../ui6e/fragmentsCombinatoire";
import { MessageRetour, useTentativeLisible } from "../../4e/components/RetourSaisie";
import { ariaOptionChoixFerme, classeOptionChoixFerme } from "../../4e/ui/choixFige";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { BoutonAide } from "./BoutonAide";
import { EnTeteExercice } from "./EnTeteExercice";

interface Props {
  consigneGenerale: FragmentConsigne[];
  donnees: FragmentConsigne[][];
  illustration?: ReactNode;
  /** Outil de l'écran (tableau, courbe, table consultable), sous la consigne. */
  complement?: ReactNode;
  consigneEcran: FragmentConsigne[];
  champs: ChampCombi[];
  attentes: Attente[];
  aides: AideCombi[];
  niveauAide: number;
  onActiverAide: () => void;
  tentativesUtilisees: number;
  tentativesMax: number;
  messageCible?: (valeurs: string[]) => FragmentConsigne[] | null;
  onValider: (valeurs: string[]) => void;
  validation?: ValidationEtapeProps | null;
}

const MAX_LIGNES = 8;

/**
 * Écran COMMUN des générateurs 6gen43–6gen48 (6e ch. 7, audit, lot B) — remplace les sept écrans
 * d'origine. Règles communes :
 * - une saisie illisible ou de mauvaise forme n'est jamais transmise au moteur (aucune tentative) ;
 *   message propre à la nature du champ (`refusAttentes`) ;
 * - un choix fermé est SEUL sur son écran, une tentative ; une fois jugé, l'option choisie fausse est
 *   marquée ✗ et la bonne ✓ (`choixFige`, porté du 4e) ;
 * - seuls les champs faux passent en rouge (statut figé au moment de la validation) ; champs figés
 *   une fois l'écran clos ;
 * - libellés, options et aides en KaTeX (`$…$`), jamais de notation clavier ; champs empilés en
 *   grille (aucun débordement à 390 px) ; aperçu KaTeX sous un champ « formule » ;
 * - aides à deux niveaux (propriété du cours, puis posée pour l'instance), jamais la réponse.
 * Le parent le rend avec une `key` qui change à chaque écran et à chaque exercice : champs vides.
 */
export function EcranCombinatoire({
  consigneGenerale,
  donnees,
  illustration,
  complement,
  consigneEcran,
  champs,
  attentes,
  aides,
  niveauAide,
  onActiverAide,
  tentativesUtilisees,
  tentativesMax,
  messageCible,
  onValider,
  validation,
}: Props) {
  const [valeurs, setValeurs] = useState<string[]>(() => champs.map(() => ""));
  const [lignes, setLignes] = useState<string[][]>(() => champs.map(() => [""]));
  const [statuts, setStatuts] = useState<StatutVerification[] | null>(null);
  const [refus, setRefus] = useState<string | null>(null);
  const essai = useTentativeLisible<string[]>();
  const gele = !!validation;

  function valeursCourantes(): string[] {
    return champs.map((c, i) => (c.type === "liste" ? joindreLignes(lignes[i]) : valeurs[i]));
  }
  const toutRempli = champs.every((c, i) => (c.type === "liste" ? lignes[i].every((l) => l.trim() !== "") : valeurs[i].trim() !== ""));

  function valider() {
    if (!toutRempli || gele) return;
    const v = valeursCourantes();
    const msg = refusAttentes(attentes, v);
    setRefus(msg);
    if (!msg) setStatuts(statutsAttentes(attentes, v));
    essai.tenter(v, msg === null, onValider);
  }

  function changer(i: number, v: string) {
    setValeurs((prev) => prev.map((x, j) => (j === i ? v : x)));
  }
  function changerLigne(i: number, l: number, v: string) {
    setLignes((prev) => prev.map((arr, j) => (j === i ? arr.map((x, k) => (k === l ? v : x)) : arr)));
  }

  const erreur = (i: number) => statuts !== null && tentativesUtilisees > 0 && statuts[i] !== "correct";
  const cible = tentativesUtilisees > 0 && essai.soumise && messageCible ? messageCible(essai.soumise) : null;
    const textes = champs.filter((c) => c.type === "texte").length;

  return (
    <div>
      <EnTeteExercice
        consigneGenerale={<RenduFragments fragments={consigneGenerale} />}
        blocDonnees={
          donnees.length > 0 || illustration ? (
            <div className="donnees-combinatoire">
              {donnees.map((ligne, i) => (
                <p key={i} style={{ margin: "4px 0" }}>
                  <RenduFragments fragments={ligne} />
                </p>
              ))}
              {illustration}
            </div>
          ) : null
        }
      />
      <p className="prompt-text">
        <RenduFragments fragments={consigneEcran} />
      </p>
      {complement}
      <div style={textes > 1 ? { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: "0 12px" } : undefined}>
        {champs.map((champ, i) => {
          if (champ.type === "choix") {
            const choisie = gele ? valeurs[i] : null;
            const bonne = "choix" in attentes[i] ? (attentes[i] as { choix: string }).choix : "";
            return (
              <div className="field" key={i} role="group" aria-label={champ.label.replace(/\$/g, "")}>
                {champ.label && (
                  <p className="field-label field-label-minuscule">
                    <RenduFragments fragments={f(champ.label)} />
                  </p>
                )}
                <div style={{ display: "grid", gap: 8, gridTemplateColumns: (champ.options ?? []).some((o) => o.label.length > 24) ? "1fr" : "repeat(auto-fit, minmax(140px, 1fr))" }} className="options-grid options-choix-combinatoire">
                  {(champ.options ?? []).map((o) => (
                    <button
                      key={o.valeur}
                      type="button"
                      className={classeOptionChoixFerme(o.valeur, { selection: valeurs[i] || null, choisie, bonne })}
                      aria-pressed={valeurs[i] === o.valeur}
                      aria-label={ariaOptionChoixFerme(o.valeur, { choisie, bonne }) ? `${o.label.replace(/\$/g, "")} (${ariaOptionChoixFerme(o.valeur, { choisie, bonne })})` : undefined}
                      disabled={gele}
                      style={{ minHeight: 44, textAlign: "left", whiteSpace: "normal" }}
                      onClick={() => changer(i, o.valeur)}
                    >
                      <span style={{ display: "block", width: "100%" }}>
                        <RenduFragments fragments={f(o.label)} />
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            );
          }
          if (champ.type === "liste") {
            return (
              <div className="field" key={i}>
                <p className="field-label field-label-minuscule">
                  <RenduFragments fragments={f(champ.label)} />
                </p>
                {lignes[i].map((ligne, l) => (
                  <div key={l} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
                    <input
                      type="text"
                      className={`text-input ${erreur(i) ? "is-erronee" : ""}`}
                      style={{ minHeight: 44, flex: 1, minWidth: 0 }}
                      aria-label={`${champ.label.replace(/\$/g, "")}, ligne ${l + 1}`}
                      value={ligne}
                      placeholder={champ.placeholder}
                      disabled={gele}
                      onChange={(e) => changerLigne(i, l, e.target.value)}
                    />
                    {lignes[i].length > 1 && !gele && (
                      <button type="button" className="btn" style={{ minWidth: 44, minHeight: 44 }} aria-label={`Retirer la ligne ${l + 1}`} onClick={() => setLignes((prev) => prev.map((arr, j) => (j === i ? arr.filter((_, k) => k !== l) : arr)))}>
                        −
                      </button>
                    )}
                  </div>
                ))}
                {lignes[i].length < MAX_LIGNES && !gele && (
                  <button type="button" className="btn" style={{ minHeight: 44 }} onClick={() => setLignes((prev) => prev.map((arr, j) => (j === i ? [...arr, ""] : arr)))}>
                    + Ajouter une ligne
                  </button>
                )}
              </div>
            );
          }
          const apercu = valeurs[i].trim() === "" ? null : champ.apercuFn ? champ.apercuFn(valeurs[i]) : champ.apercu ? apercuLatex(valeurs[i], champ.nature === "polynome") : null;
          return (
            <div className="field" key={i} style={{ minWidth: 0 }}>
              <label className="field-label field-label-minuscule" htmlFor={`champ-combi-${i}`}>
                <RenduFragments fragments={f(champ.label)} />
              </label>
              <input
                id={`champ-combi-${i}`}
                type="text"
                autoComplete="off"
                className={`text-input ${erreur(i) ? "is-erronee" : ""}`}
                style={{ minHeight: 44, width: "100%", boxSizing: "border-box" }}
                value={valeurs[i]}
                placeholder={champ.placeholder}
                disabled={gele}
                onChange={(e) => changer(i, e.target.value)}
              />
              {apercu && (
                <div className="apercu-expression-latex contenu-conditionnel" aria-hidden="true" style={{ marginTop: 6 }}>
                  <Katex expression={apercu} />
                </div>
              )}
            </div>
          );
        })}
      </div>
      {niveauAide >= 1 && (
        <div className="aide-5e">
          {aides.slice(0, niveauAide).map((aide, i) => (
            <p key={i}>
              <RenduFragments fragments={f(aide.texte)} />
              {aide.latex && (
                <>
                  {" "}
                  <Katex expression={`\\displaystyle ${aide.latex}`} />
                </>
              )}
            </p>
          ))}
        </div>
      )}
      {!validation && (
        <>
          {aides.length > 0 && <BoutonAide niveauAide={niveauAide} niveauAideMax={aides.length} onActiverAide={onActiverAide} />}
          <button type="button" className="btn btn-primary" disabled={!toutRempli} onClick={valider}>
            Valider
          </button>
          <MessageRetour illisible={essai.illisible} texteIllisible={refus ?? undefined} tentativesUtilisees={tentativesUtilisees} tentativesMax={tentativesMax} cible={cible} />
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
