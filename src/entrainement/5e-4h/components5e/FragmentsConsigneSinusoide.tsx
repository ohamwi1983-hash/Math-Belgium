import { Katex } from "../components/Katex";
import type { FragmentConsigne } from "../../export/genererFeuilleExercices";

/** Consigne d'écran de 5gen13 en fragments (texte mêlé de KaTeX en ligne), sans conteneur — les
 * formules des consignes (« u = 0,16t + 2,94 », « f(t) = 12,35 », « sin u ≥ m ») ne sont plus écrites
 * au clavier (`consignePhaseFragments`). Espaces insécables avant « ? ! : ; » et après « « ». */
export function FragmentsConsigneSinusoide({ fragments }: { fragments: FragmentConsigne[] }) {
  return (
    <>
      {fragments.map((f, i) => (f.type === "texte" ? <span key={i}>{f.valeur.replace(/ ([?!:;»])/g, " $1").replace(/« /g, "« ")}</span> : <Katex key={i} expression={f.valeur} />))}
    </>
  );
}
