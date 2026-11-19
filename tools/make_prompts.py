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
- Aladin : garçon de 12 ans, cheveux noirs, gilet rouge sur chemise blanche, pantalon bouffant beige, babouches. Sa mère : femme douce, voile bleu.
- Le sorcier : grand, maigre, robe noire, barbe grise pointue, turban sombre. Le génie : géant bleu à gros bras, torse nu, bracelets dorés, queue de fumée.
- Ali Baba : bûcheron de 45 ans, barbe noire courte, turban beige, robe brune usée. Qassim : son frère riche, rond, robe de soie verte. Marjana : jeune servante, robe orange, voile blanc. Le chef des voleurs : moustache noire, turban rouge.
- Le roi : couronne dorée, robe bleue brodée, barbe grise taillée. Le garçon malin : 11 ans, tunique beige propre, sourire malicieux.
- Le lion : grand lion majestueux à crinière brune. Le lièvre : petit lièvre brun aux longues oreilles, l'air malin.

RÈGLE : dans l'histoire de la fille et du lait, le calife Omar n'est pas représenté (juste une ombre floue dehors). Dans l'histoire de la fourmi, le prophète Soulayman n'est jamais représenté (ni visage, ni silhouette, ni ombre). On montre seulement les fourmis, la nature et, au loin, une armée floue de chevaux et d'oiseaux.

Réponds seulement « Prêt ». Je t'enverrai ensuite les scènes une par une."""

STORIES = [
    ('chatte', 'Zeydoune et le petit chat', [
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
    ('oiseau', 'Le petit oiseau qui n’écoutait pas', [
        "Un grand arbre feuillu avec un petit nid dans ses branches, la lumière du matin ; un petit oiseau et sa mère sont dans le nid.",
        "La maman oiseau, l'air sérieux et tendre, parle à son petit dans le nid ; elle lui fait signe de rester.",
        "Le petit oiseau regarde le ciel bleu avec envie, l'air têtu, la tête tournée à l'opposé de sa maman.",
        "Le petit oiseau tombe du nid dans les airs, les ailes grandes ouvertes et l'air effrayé, au-dessus d'un jardin.",
        "Au sol, le petit oiseau tremblant ; un gros chat roux s'approche à pas de loup derrière un buisson.",
        "La maman oiseau fonce en piqué en criant ; le gros chat s'enfuit en courant, effrayé.",
        "Le petit oiseau, repentant, se blottit contre sa maman dans le nid, au coucher du soleil, scène tendre.",
    ]),
    ('batons', 'Le père et les bâtons', [
        "Un vieux père barbu à la robe brune, assis devant sa maison de village, avec ses trois fils debout à côté de lui.",
        "Les trois frères se disputent dans la cour en se montrant du doigt, l'air fâché, le père triste derrière eux.",
        "Le père donne un bâton de bois à chacun de ses trois fils, qui le tiennent dans leurs mains.",
        "Chaque fils casse facilement son bâton sur son genou ; le père les regarde en souriant calmement.",
        "Le père tend aux fils un gros fagot de bâtons liés ensemble avec une corde.",
        "Les trois fils tirent, serrent, poussent de toutes leurs forces sur le fagot, rouges d'effort, sans réussir à le casser.",
        "Les trois frères se tiennent par les épaules en souriant, le père au centre les serre dans ses bras. Lumière chaleureuse.",
    ]),
    ('palmier', 'Le vieil homme et le palmier', [
        "Un très vieil homme à la barbe blanche et à la robe simple plante un jeune palmier avec une petite pelle, dans un grand jardin de dattiers.",
        "Un roi (vu de dos ou de loin, sans détail du visage) passe à cheval sur le chemin et s'arrête, surpris, ses gardes derrière lui.",
        "Le roi, sur son cheval, interroge le vieil homme qui se redresse appuyé sur sa pelle ; on sent l'étonnement.",
        "Le vieil homme montre de son bras de grands palmiers chargés de dattes autour de lui, serein, avec un doux sourire.",
        "Le roi, ravi, tend une bourse d'or au vieil homme qui la reçoit avec une inclinaison respectueuse.",
        "Le vieil homme, joyeux, tient une datte dorée dans une main, devant son jeune palmier. Lumière dorée de fin de journée.",
    ]),
    ('lait', 'La fille qui ne trichait pas', [
        "Une petite maison simple en pierre au bord d'un village ; une fille de 12 ans et sa mère se tiennent devant la porte, souriantes.",
        "Au marché ancien du matin, la mère et la fille vendent du lait dans des jarres, avec des clients autour de l'étal.",
        "La nuit, dans la maison, la mère tient une jarre de lait et un pichet d'eau à la lueur d'une lampe à huile, l'air tentée.",
        "La fille secoue la tête, mains devant elle, refusant d'un air doux mais ferme ; la mère est près de la jarre.",
        "La mère, gênée, fait un geste de la main pour dire que personne ne regarde ; la nuit étoilée est visible par la fenêtre.",
        "La fille lève le doigt vers le ciel étoilé à travers la fenêtre, le visage lumineux et sincère.",
        "À l'extérieur, la nuit, une porte en bois entrouverte avec un halo de lumière ; on ne voit qu'une ombre floue d'une personne dehors qui écoute (aucun visage).",
        "Le lendemain, la fille et la mère devant leur maison ; un jeune homme en tenue de fête et son père, vus de dos, les saluent. Ambiance joyeuse.",
    ]),
    ('sadiq', 'Le garçon qui ne mentait pas', [
        "Un garçon de 12 ans, sac de voyage à l'épaule, devant la porte de sa maison au matin, regarde l'horizon.",
        "La mère coud avec soin de l'argent dans la doublure du vêtement du garçon, à la lueur d'une lampe, scène tendre.",
        "La mère pose les mains sur les épaules de son fils et lui dit adieu avec un regard plein d'amour.",
        "Le garçon marche à côté d'une longue caravane de chameaux dans le désert, au lever du soleil.",
        "Des brigands à cheval, turbans noirs, foncent sur la caravane dans un nuage de poussière.",
        "Un brigand à l'air dur se penche vers le garçon debout, calme et courageux, au milieu du désert.",
        "Le garçon, droit et sincère, regarde le brigand dans les yeux, ses mains ouvertes.",
        "Deux brigands emmènent le garçon vers un grand campement de tentes au pied d'une colline rocheuse.",
        "Le chef des brigands, assis sur des coussins sous une tente, regarde le garçon debout devant lui avec étonnement.",
        "Le chef des brigands et ses hommes pleurent, repentis, agenouillés ; ils rendent le butin. Lumière douce du soir.",
    ]),
    ('berger', 'Le berger menteur', [
        "Un petit berger de 11 ans avec son bâton garde un troupeau de moutons sur une colline verte, ciel bleu, village au loin.",
        "Le petit berger, mains autour de la bouche, crie vers le village du haut de la colline, les moutons paisibles derrière lui.",
        "Des villageois accourent sur le chemin avec des bâtons et des fourches, essoufflés, inquiets.",
        "Le berger se tient le ventre en riant à gorge déployée ; les villageois, furieux, le regardent en secouant la tête.",
        "Le berger, seul sur la colline, rit encore en se frottant les mains, l'air malicieux, le village loin derrière.",
        "Un grand loup gris surgit des buissons près du troupeau, moutons paniqués, le berger pétrifié.",
        "Le berger crie de toutes ses forces vers le village qui reste silencieux, personne ne vient ; il a l'air désespéré.",
        "Le loup s'enfuit avec un mouton dans la gueule vers la forêt ; le berger, en larmes, assis au sol. Lumière grise du soir.",
    ]),
    ('souris', 'Le lion et la petite souris', [
        "Un grand lion dort paisiblement à l'ombre d'un acacia dans la savane dorée.",
        "Une petite souris grise grimpe et saute sur le dos du lion endormi, l'air espiègle.",
        "Le lion, réveillé en colère, a attrapé la petite souris sous sa grosse patte ; la souris, terrifiée, tremble.",
        "La souris, mains jointes, supplie le lion, la patte du lion juste au-dessus d'elle.",
        "Le lion, amusé, éclate de rire et soulève sa patte ; la souris s'enfuit en courant.",
        "Le lion, pris dans un grand filet de cordes tendu entre deux arbres, rugit de détresse.",
        "La petite souris ronge les cordes du filet avec ses dents, le lion immobile la regarde, plein d'espoir.",
        "Le lion, libre, incline sa grosse tête vers la petite souris perchée sur une pierre, qui sourit. Lumière chaude de fin de journée.",
    ]),
    ('joha-kumm', 'Joha et sa manche', [
        "Un messager remet à Joha une invitation à un grand festin devant sa maison ; Joha, joyeux, la lit.",
        "Joha, avec une vieille robe usée et rapiécée, marche dans la rue vers une grande demeure illuminée.",
        "Joha, à l'entrée de la grande salle, est ignoré : des invités élégants lui tournent le dos, il est seul et gêné.",
        "Joha, dans sa chambre, enfile une magnifique robe brodée et un turban neuf devant un miroir de cuivre.",
        "Joha arrive à la fête dans sa belle tenue ; des invités l'accueillent en souriant et le conduisent à la table.",
        "À table, Joha plonge sa manche brodée dans un plat de sauce, sous le regard étonné des convives.",
        "Les invités le regardent, stupéfaits, bouche bée ; Joha, malicieux, tient sa manche dégoulinante.",
    ]),
    ('joha-hamir', 'Joha compte ses ânes', [
        "Joha, tout content, devant dix ânes alignés devant sa maison, les mains sur les hanches.",
        "Joha monté sur un âne compte avec ses doigts les ânes devant lui, l'air concentré.",
        "Joha, inquiet, les yeux écarquillés, regarde les ânes : il n'en voit que neuf, un point d'interrogation flotte dans l'air.",
        "Joha, descendu de l'âne, compte à nouveau ses dix ânes à côté de lui, rassuré.",
        "Joha, de nouveau sur son âne, recompte en pointant les autres et fait la grimace : neuf seulement.",
        "Joha marche à pied à côté des dix ânes, tout sourire, en les comptant. Paysage de campagne ensoleillé.",
    ]),
    ('joha-qidr', 'Joha et la marmite', [
        "Joha emprunte une grosse marmite en cuivre à son voisin, qui la lui confie sur le pas de sa porte.",
        "Joha rend la grosse marmite avec une petite marmite posée à côté ; le voisin regarde, surpris.",
        "Joha explique avec un geste que la marmite a eu un bébé ; le voisin lève un sourcil, perplexe.",
        "Le voisin, ravi, tient les deux marmites contre lui avec un grand sourire.",
        "Un mois plus tard, Joha emprunte de nouveau la grosse marmite, le voisin la lui tend avec confiance.",
        "Le voisin, devant chez Joha, frappe à la porte, l'air impatient, plusieurs jours ont passé (lune dans le ciel).",
        "Joha, très triste, joint les mains et baisse la tête ; une marmite cassée repose sur la table devant lui.",
        "Le voisin, furieux, les mains en l'air ; Joha lui répond calmement, l'air innocent, avec un petit sourire en coin.",
    ]),
    ('aladdin', 'Aladin et la lampe magique', [
        "Aladin, un garçon pauvre de 12 ans aux habits simples, et sa mère dans une petite maison modeste d'une ville arabe, ambiance chaleureuse.",
        "Un sorcier en robe noire, grande barbe grise pointue et turban sombre, aborde Aladin dans un souk animé avec un faux sourire.",
        "Dans le désert, le sorcier montre une dalle de pierre ouverte dans le sol qui révèle un escalier qui descend sous la terre ; Aladin, impressionné, regarde.",
        "Aladin, la tête qui dépasse de l'ouverture de la dalle, regarde vers le sorcier en colère qui le presse du doigt.",
        "Aladin, émerveillé, au milieu d'une grotte de trésors : or, bijoux, arbres de pierres précieuses, lampe à huile ancienne dans une niche.",
        "En haut de l'escalier, le sorcier au visage dur tend la main avec impatience ; Aladin, en bas, tient la vieille lampe à deux mains.",
        "Aladin frotte la lampe ; un grand génie bleu surgit dans un nuage de fumée dorée, les bras croisés, Aladin, bouche bée.",
        "Aladin et sa mère, dans une riche demeure, un génie bleu amical à l'arrière-plan ; fenêtres ouvertes sur la ville de nuit.",
        "La mère d'Aladin sourit largement, assise sur de beaux coussins devant une table pleine de mets, Aladin la serre dans ses bras.",
    ]),
    ('alibaba', 'Ali Baba et les quarante voleurs', [
        "Ali Baba, un bûcheron pauvre à barbe noire courte, portant une hache et un turban simple, devant sa petite maison au lever du soleil.",
        "Ali Baba conduit son âne chargé de fagots sur un sentier dans une forêt dense, matin doré.",
        "Ali Baba, caché dans un arbre, voit au loin quarante cavaliers masqués arriver au galop sur des chevaux noirs, nuage de poussière.",
        "Le chef des voleurs, grand, moustache noire et turban rouge, se tient seul devant un immense rocher, sous un ciel d'orage.",
        "La porte secrète du rocher s'ouvre, laissant voir une grotte pleine d'or ; les voleurs entrent portant des sacs.",
        "Ali Baba, devant le rocher, lève les bras ; la porte de pierre s'ouvre devant lui, lumière dorée de la grotte.",
        "Qassim, le frère riche d'Ali Baba, bien habillé, rond, avec une longue robe de soie, regarde Ali Baba avec curiosité dans une pièce luxueuse.",
        "Qassim, seul devant le rocher, la porte de la grotte ouverte, ses sacs vides à la main, avide.",
        "Qassim, à l'intérieur de la grotte avec des sacs d'or, devant la porte fermée, paniqué, cherche en vain le mot (aucun mot écrit).",
        "Les quarante voleurs, torches à la main, entrent dans la grotte où Qassim est effrayé, dans l'ombre.",
        "Le chef des voleurs, au visage sévère, debout devant ses hommes, regarde tout autour de la grotte avec méfiance, sourcils froncés.",
        "Le chef des voleurs, déguisé en marchand d'huile, avec des mules chargées de grandes jarres, frappe à la porte de la maison d'Ali Baba, nuit.",
        "Marjana, la jeune servante intelligente aux cheveux sombres et à la robe orange, découvre, effrayée, un voleur caché dans une grande jarre, à la lueur d'une lampe.",
        "Marjana, fermement, verse de l'huile bouillante d'un grand chaudron dans les jarres alignées dans la cour la nuit.",
        "Les gardes de la ville, en uniforme, arrêtent le chef des voleurs, menotté, devant la maison d'Ali Baba, matin.",
        "Ali Baba remercie Marjana, mains sur le cœur ; plus loin il distribue de l'or aux pauvres dans une rue de la ville, ambiance heureuse.",
    ]),
    ('sindbad-rukh', 'Sindbad et l’oiseau géant', [
        "Sindbad, sur le pont d'un grand navire de bois aux voiles blanches, regarde l'horizon, mer scintillante, mouettes.",
        "Sindbad dort à l'ombre d'un arbre sur une belle île, au loin le navire est encore amarré.",
        "Sindbad, réveillé en sursaut, voit son navire à l'horizon qui s'éloigne ; il agite les bras, désespéré, sur la plage.",
        "Sindbad, la main au front, découvre une immense coupole blanche, lisse, au milieu de la plage, à côté d'un palmier.",
        "Un oiseau géant (le Rokh) au plumage blanc et doré, aux ailes immenses, descend du ciel, ombre énorme sur la plage ; Sindbad est minuscule.",
        "Sindbad attache son turban autour de sa taille à la patte énorme du Rokh posé près de l'œuf-dôme, concentré et courageux.",
        "Le Rokh s'envole haut dans le ciel avec Sindbad accroché à sa patte, au-dessus de la mer et de montagnes lointaines, nuages dorés.",
        "Le Rokh se pose dans une vallée profonde entre de hautes falaises ; Sindbad se détache et regarde autour de lui, étonné.",
        "Le sol de la vallée scintille de diamants énormes, Sindbad à genoux en prend un dans ses mains, émerveillé ; des serpents au loin.",
        "En haut de la falaise, des marchands jettent de gros morceaux de viande dans la vallée ; des aigles s'approchent en volant.",
        "Sindbad s'attache à un gros morceau de viande ; un aigle l'emporte vers le haut de la montagne avec des diamants dans ses poches.",
        "Les marchands accueillent Sindbad qui sourit, les mains pleines de diamants ; un grand navire les attend. Atmosphère de joie.",
    ]),
    ('roi-mensonges', 'Le roi et les trois mensonges', [
        "Un roi sur son balcon de palais en marbre blanc, couronne et robe bleue brodée d'or ; un crieur public sur la place déroule une proclamation (sans texte lisible).",
        "Une foule d'hommes (marchands, nobles, paysans) rassemblés devant le palais, chacun racontant un mensonge avec de grands gestes.",
        "Un garçon pauvre et malin, en habits simples mais propres, sourire confiant, marche vers le palais au milieu de la foule.",
        "Le garçon, devant le roi, bras écartés, parle d'une vache imaginaire grande comme une montagne ; on voit, en bulle de rêve, une vache géante.",
        "Le garçon décrit une tige de fève qui monte jusqu'au ciel ; bulle de rêve avec une tige géante et des nuages.",
        "Le garçon, d'un air sérieux, pointe un doigt vers le roi ; on voit en bulle une jarre d'or sur une table, le roi surpris.",
        "Le roi, rouge de colère, se lève de son trône et pointe un doigt vers le garçon ; les courtisans se figent.",
        "Le garçon, souriant et calme, tend la main vers un grand sac d'or posé à côté du trône ; le roi, pris au piège, éclate de rire.",
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
<p>{total} images au total. Commence par <b>Zeydoune et le petit chat</b> (5 images) pour valider le style avant de faire le reste.</p>
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
