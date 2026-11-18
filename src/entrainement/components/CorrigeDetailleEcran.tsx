import { Fragment } from "react";
import { InlineMath } from "react-katex";
import "katex/dist/katex.min.css";
import { normaliserLogDecimal } from "../../lib/notationLog";
import type { EtapeCorrection, FragmentConsigne, LigneCalcul } from "../export/genererFeuilleExercices";
import { decouperLigneCalcul, estLignePiege } from "../export/corrigeTableau";

/**
 * Corrigé détaillé « comme au tableau » d'UNE étape, à l'écran d'un générateur : affiché sous la
 * réponse attendue quand l'élève a épuisé ses tentatives (`ValidationEcran.corrigeDetaille`).
 * Mêmes lignes que le corrigé papier (`correctionDetaillee` de l'adaptateur, filtré par
 * `lignesDeLEtape`) et même découpage des chaînes de calcul (`decouperLigneCalcul`) — jamais une
 * seconde source recalculée à part. Partagé par tous les niveaux.
 *
 * Mise en page étroite (téléphone) : étiquette au-dessus de son contenu ; chaîne de calcul alignée
 * sur « = » dans un bloc qui défile horizontalement s'il le faut (la page ne déborde jamais), la
 * justification passe sous sa ligne.
 */

function Formule({ latex }: { latex: string }) {
  return <InlineMath math={normaliserLogDecimal(latex)} />;
}

function espacesInsecables(texte: string): string {
  return texte.replace(/ ([?!:;»])/g, " $1").replace(/« /g, "« ");
}

function Fragments({ fragments }: { fragments: FragmentConsigne[] }) {
  return (
    <>
      {fragments.map((f, i) => (f.type === "texte" ? <span key={i}>{espacesInsecables(f.valeur)}</span> : <Formule key={i} latex={f.valeur} />))}
    </>
  );
}

function Calcul({ lignes }: { lignes: LigneCalcul[] }) {
  return (
    <div className="corrige-ecran-calcul-defile">
      <div className="corrige-ecran-calcul">
        {lignes.map((l, i) => {
          const { gauche, droite } = decouperLigneCalcul(l.latex);
          const j = l.justification === undefined ? null : typeof l.justification === "string" ? [{ type: "texte" as const, valeur: l.justification }] : l.justification;
          return (
            <Fragment key={i}>
              {droite === null ? (
                <span className="cc-s">
                  <Formule latex={gauche} />
                </span>
              ) : (
                <>
                  <span className="cc-g">{gauche ? <Formule latex={gauche} /> : null}</span>
                  <span className="cc-d">
                    <Formule latex={`{}${droite}`} />
                  </span>
                </>
              )}
              {j ? (
                <span className="cc-j">
                  <Fragments fragments={j} />
                </span>
              ) : null}
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}

export function CorrigeDetailleEcran({ etapes, titre = "Corrigé détaillé de l'étape" }: { etapes: EtapeCorrection[]; titre?: string }) {
  if (etapes.length === 0) return null;
  const normales = etapes.filter((e) => !estLignePiege(e));
  const pieges = etapes.filter(estLignePiege);
  return (
    <div className="corrige-ecran">
      <p className="corrige-ecran-titre">{titre}</p>
      {normales.map((e, i) => (
        <div key={i} className={`corrige-ecran-ligne${e.type === "resultat" ? " corrige-ecran-resultat" : ""}`}>
          <span className="corrige-ecran-lbl">{e.label}</span>
          <div className="corrige-ecran-contenu">
            {e.fragments.length > 0 ? (
              <div className={e.type === "resultat" ? "corrige-ecran-cadre" : undefined}>
                <Fragments fragments={e.fragments} />
              </div>
            ) : null}
            {e.calcul && e.calcul.length > 0 ? <Calcul lignes={e.calcul} /> : null}
            {e.figureHtml ? <div className="corrige-ecran-figure" dangerouslySetInnerHTML={{ __html: e.figureHtml }} /> : null}
          </div>
        </div>
      ))}
      {pieges.map((p, i) => (
        <div key={`p${i}`} className="corrige-ecran-piege">
          <span className="corrige-ecran-piege-lbl">Piège</span>
          <span>
            <Fragments fragments={p.fragments} />
          </span>
        </div>
      ))}
    </div>
  );
}
