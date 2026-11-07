"""Génère tools/prompts-images.html : les descriptions à donner à ChatGPT/Gemini pour chaque page."""
import html
from pathlib import Path

STYLE = """Je vais te demander une série d'illustrations pour un livre d'histoires pour enfants. Garde exactement le même style et les mêmes personnages pour toutes les images.

STYLE : illustration de livre jeunesse, peinture numérique douce façon gouache et aquarelle, couleurs chaudes et lumineuses, lumière dorée, décors riches et détaillés du monde arabe ancien (sauf pour l'histoire grecque d'Icare), expressions des visages claires et attachantes, personnages vus en entier. Format paysage 3:2. Aucun texte, aucune lettre, aucune écriture dans l'image.

PERSONNAGES (toujours identiques d'une image à l'autre) :
- Zeydoune : garçon de 9 ans, peau mate claire, cheveux courts bruns, grands yeux marron, T-shirt bleu, pantalon gris foncé, baskets blanches.
- Ali, son ami : garçon de 9 ans, peau mate, cheveux noirs bouclés, T-shirt vert, pantalon beige.
- La chatte : petite chatte rousse tigrée aux yeux verts.
- Joha : homme d'une cinquantaine d'années, rond et jovial, barbe grise, grand turban blanc, longue robe marron avec ceinture beige, babouches.
- Le fils de Joha : garçon de 10 ans, calotte blanche, robe beige.
- L'âne de Joha : petit âne gris aux grandes oreilles, selle rouge.
- Sindbad : marchand de 35 ans, barbe noire soignée, turban orange orné d'un bijou vert et d'une plume, robe bleue avec ceinture dorée.
- Dédale : vieil inventeur grec, chauve, barbe blanche, tunique blanche avec ceinture bleue.
- Icare : garçon grec de 12 ans, cheveux châtains bouclés, tunique blanche courte.
- Le lion : grand lion majestueux à crinière brune. Le lièvre : petit lièvre brun aux longues oreilles, l'air malin.

RÈGLE : dans l'histoire de la fourmi, le prophète Soulayman n'est jamais représenté (ni visage, ni silhouette, ni ombre). On montre seulement les fourmis, la nature et, au loin, une armée floue de chevaux et d'oiseaux.

Réponds seulement « Prêt ». Je t'enverrai ensuite les scènes une par une."""

STORIES = [
    ('chatte', 'Zeydoune et la chatte', [
        "Zeydoune entre joyeusement dans un beau jardin fleuri un matin ensoleillé, avec un grand arbre, des buissons et une allée.",
        "Dans le jardin, Zeydoune découvre une petite chatte rousse tigrée près d'un buisson ; il la montre du doigt, émerveillé.",
        "Gros plan sur la petite chatte rousse assise, l'air triste et affamé, devant une gamelle vide, dans le jardin.",
        "Dans la cuisine chaleureuse d'une maison, Zeydoune pose doucement un bol de lait par terre devant la chatte.",
        "La chatte boit le lait avec bonheur, les yeux mi-clos ; Zeydoune, accroupi à côté, sourit. Ambiance tendre et lumineuse.",
    ]),
    ('pomme', 'La pomme partagée', [
        "Zeydoune, dans le jardin, tient une belle pomme rouge brillante dans sa main et la regarde avec plaisir.",
        "Son ami Ali arrive en courant dans le jardin et fait un grand signe de la main à Zeydoune.",
        "Ali, l'air affamé, se tient le ventre ; Zeydoune le regarde avec gentillesse, la pomme à la main.",
        "Zeydoune coupe la pomme rouge en deux moitiés égales et en tend une à Ali.",
        "Les deux amis, assis sur un banc dans le jardin, mangent chacun leur moitié de pomme en riant aux éclats.",
    ]),
    ('joha-lune', 'Joha et la lune', [
        "La nuit, dans un village arabe ancien sous un ciel étoilé, Joha marche avec une lanterne vers un vieux puits en pierre.",
        "Joha se penche au-dessus du puits et voit le reflet de la pleine lune dans l'eau, tout au fond.",
        "Joha, les mains sur les joues, l'air paniqué et comique, s'écrie que la lune est tombée dans le puits.",
        "Joha lance une longue corde avec un crochet dans le puits, très concentré.",
        "Joha tire de toutes ses forces sur la corde, le crochet se décroche et il tombe à la renverse sur le dos, les jambes en l'air. Scène comique.",
        "Joha, allongé sur le dos par terre, voit la pleine lune dans le ciel et sourit fièrement : il croit l'avoir sauvée.",
    ]),
    ('corbeau', 'Le corbeau qui avait soif', [
        "Un corbeau noir assoiffé, le bec entrouvert, sous un soleil brûlant, dans un paysage sec et chaud.",
        "Le corbeau découvre une grande cruche en terre cuite posée sur un muret de pierre.",
        "Le corbeau plonge son bec dans la cruche mais n'atteint pas l'eau tout au fond (on voit un peu d'eau en bas de la cruche, vue en coupe).",
        "Le corbeau, l'air pensif, ramasse de petits cailloux avec son bec à côté de la cruche.",
        "Le corbeau laisse tomber les cailloux un à un dans la cruche et l'eau monte jusqu'en haut (vue en coupe).",
        "Le corbeau a bu et s'envole, heureux, dans le ciel bleu au-dessus du paysage.",
    ]),
    ('fourmi', 'La fourmi et Soulayman', [
        "Une colonne de fourmis marche dans l'herbe près de leur fourmilière, vue à hauteur de fourmi, avec de grands brins d'herbe et des fleurs.",
        "Au premier plan, des fourmis minuscules sur un caillou ; au loin dans la vallée, une immense armée floue de chevaux avance en soulevant de la poussière, avec des oiseaux dans le ciel. Aucun personnage humain visible en détail.",
        "Une fourmi montée sur un caillou alerte les autres fourmis, qui courent se réfugier dans la fourmilière.",
        "Toutes les fourmis sont entrées à l'abri dans la fourmilière ; lumière douce et paisible, petites étincelles dorées dans l'air.",
        "Un paysage magnifique au lever du soleil : vallée verte, fleurs, oiseaux, lumière dorée qui évoque la gratitude. Aucun personnage.",
    ]),
    ('joha-ane', 'Joha, son fils et l’âne', [
        "Joha, son fils et leur âne gris partent vers le marché d'une ville arabe ancienne, sur un chemin de terre.",
        "Joha est assis sur l'âne et son fils marche à côté ; des passants les montrent du doigt d'un air désapprobateur.",
        "Le fils est maintenant sur l'âne et Joha marche à côté ; d'autres passants les critiquent.",
        "Joha et son fils sont assis tous les deux sur le pauvre petit âne qui plie sous le poids ; des passants s'indignent.",
        "Joha et son fils marchent derrière l'âne ; des passants se moquent d'eux.",
        "Joha et son fils portent l'âne sur leurs épaules, l'âne a l'air étonné ; toute la foule éclate de rire. Scène très comique.",
        "Joha, sage et souriant, parle à son fils en levant un doigt, au bord du chemin.",
        "Au coucher du soleil, Joha, son fils et l'âne reprennent la route, tranquilles et heureux.",
    ]),
    ('lion-lievre', 'Le lion et le lièvre', [
        "Un grand lion majestueux dans une forêt profonde et luxuriante.",
        "Le lion rugit ; les animaux de la forêt (cerf, lièvre, singe) fuient, effrayés.",
        "Les animaux de la forêt (éléphant, zèbre, girafe, lièvre, cerf) réunis en cercle dans une clairière, en pleine discussion.",
        "Le petit lièvre avance lentement sur un sentier de la forêt, sans se presser, l'air rusé.",
        "Le lion, très en colère, attend le lièvre en montrant les crocs.",
        "Le lièvre, devant le lion, raconte avec de grands gestes qu'il a croisé un autre lion.",
        "Le lièvre guide le lion à travers la forêt.",
        "Le lièvre montre au lion un vieux puits profond au milieu de la forêt.",
        "Vue plongeante : le lion penché au-dessus du puits voit son propre reflet dans l'eau sombre.",
        "Les animaux de la forêt font la fête autour du lièvre, joyeux ; le puits est au loin.",
    ]),
    ('icare', 'Icare, le garçon qui volait', [
        "Une île grecque ensoleillée au bord d'une mer turquoise ; Dédale et son fils Icare devant leur atelier.",
        "Dédale et Icare enfermés en haut d'une haute tour de pierre, regardant la mer par une fenêtre ; au loin, le palais du roi.",
        "Dans la tour, Dédale assemble de grandes ailes avec des plumes et de la cire, à la lumière d'une bougie ; Icare l'aide.",
        "Dédale attache les ailes sur le dos d'Icare et lui montre le soleil du doigt pour le mettre en garde.",
        "Dédale et Icare volent ensemble au-dessus de la mer bleue avec leurs ailes de plumes.",
        "Icare, émerveillé, monte de plus en plus haut vers le soleil.",
        "Près du soleil, la cire fond et les plumes s'envolent des ailes d'Icare.",
        "Icare tombe doucement vers la mer ; au loin, son père vole, inquiet. Image douce, pas violente.",
    ]),
    ('sindbad', 'Sindbad et l’île magique', [
        "Sindbad, riche marchand, dans une rue animée de l'ancienne Bagdad, avec des mosquées, des palmiers et des étals.",
        "Sindbad regarde une grande carte et une boussole, rêvant de voyages et d'aventures.",
        "Sindbad monte à bord d'un grand voilier arabe (un boutre) avec d'autres marchands, dans le port.",
        "Le voilier navigue sur l'océan, d'un côté sous le soleil, de l'autre sous la lune.",
        "Les marins découvrent une île verdoyante au milieu de la mer.",
        "Sur l'île, Sindbad et les marins allument un feu et préparent un repas.",
        "Soudain l'île tremble ; Sindbad et les marins, effrayés, perdent l'équilibre.",
        "Révélation : l'« île » est en fait le dos d'un poisson géant qui sort de l'eau, avec le feu encore allumé dessus.",
        "Le poisson géant plonge et Sindbad tombe dans la mer.",
        "La nuit, Sindbad s'accroche à un morceau de bois et nage sous les étoiles.",
        "Au petit matin, Sindbad arrive épuisé sur la plage d'une vraie île.",
        "Sur l'île, Sindbad découvre de magnifiques chevaux et un roi bienveillant qui l'accueille.",
        "Sindbad remercie le roi et monte à bord d'un bateau pour rentrer à Bagdad.",
        "De retour chez lui à Bagdad, Sindbad raconte son aventure à ses amis émerveillés, assis sur des coussins.",
    ]),
]


def box(label, text, name=None):
    e = html.escape(text)
    tag = f'<div class="name">📁 Enregistrer sous : <b>{name}.png</b></div>' if name else ''
    return f'''<div class="box"><div class="head"><b>{label}</b><button onclick="cp(this)">📋 Copier</button></div>
<pre>{e}</pre>{tag}</div>'''


parts = [box('1. À coller une seule fois au début de la conversation', STYLE)]
for sid, title, pages in STORIES:
    parts.append(f'<h2>{html.escape(title)} <small>({len(pages)} images)</small></h2>')
    for i, p in enumerate(pages, 1):
        parts.append(box(f'Page {i}', f'Image {sid}-{i} : {p}', f'{sid}-{i}'))

total = sum(len(p) for _, _, p in STORIES)
page = f'''<!DOCTYPE html>
<html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Alif — images des histoires</title>
<style>
body {{ margin: 0; font-family: -apple-system, system-ui, sans-serif; background: #fff8ec; color: #3a2e2a; }}
main {{ max-width: 820px; margin: 0 auto; padding: 24px 16px 60px; }}
h1 {{ font-size: 26px; margin: 0 0 6px; }} h2 {{ margin: 34px 0 10px; font-size: 21px; }} h2 small {{ color: #8a7a70; font-weight: 500; }}
.steps {{ background: #fff; border-radius: 16px; padding: 14px 18px 14px 36px; line-height: 1.6; }}
.box {{ background: #fff; border-radius: 14px; padding: 12px 14px; margin: 10px 0; box-shadow: 0 2px 0 #0001; }}
.head {{ display: flex; justify-content: space-between; align-items: center; gap: 10px; }}
pre {{ white-space: pre-wrap; font: 15px/1.5 -apple-system, system-ui, sans-serif; margin: 8px 0 0; }}
button {{ font: inherit; border: 0; background: #ff8a3d; color: #fff; border-radius: 10px; padding: 7px 14px; cursor: pointer; flex: none; }}
.name {{ margin-top: 8px; font-size: 14px; color: #22806f; }}
</style></head><body><main>
<h1>🎨 Images des histoires d'Alif</h1>
<p>{total} images au total. Commence par <b>Zeydoune et la chatte</b> (5 images) pour valider le style avant de faire le reste.</p>
<ol class="steps">
<li>Ouvre une <b>nouvelle conversation</b> dans ChatGPT (ou Gemini) et colle le bloc n° 1.</li>
<li>Envoie ensuite les pages <b>une par une</b>, dans la même conversation (les personnages restent identiques).</li>
<li>Télécharge chaque image et renomme-la comme indiqué (ex. <b>chatte-1.png</b>).</li>
<li>Mets les images dans le dossier <b>C:\\Dev\\appli\\Alif\\images-source</b> du PC.</li>
<li>Dis-moi « importe les images » : je les ajoute à l'application avec les animations.</li>
</ol>
{"".join(parts)}
</main>
<script>
async function cp(b) {{
  const t = b.closest('.box').querySelector('pre').textContent;
  try {{ await navigator.clipboard.writeText(t); b.textContent = '✅ Copié'; }}
  catch {{ const r = document.createRange(); r.selectNodeContents(b.closest('.box').querySelector('pre')); const s = getSelection(); s.removeAllRanges(); s.addRange(r); b.textContent = 'Texte sélectionné'; }}
  setTimeout(() => b.textContent = '📋 Copier', 1800);
}}
</script></body></html>'''
out = Path(__file__).with_name('prompts-images.html')
out.write_text(page, encoding='utf-8')
print(out, total, 'images')
