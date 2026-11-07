// Les 28 lettres : [lettre, nom en arabe (lu par la voix), nom en français]
window.LETTERS = [
  ['ا', 'أَلِف', 'Alif'], ['ب', 'بَاء', 'Ba'], ['ت', 'تَاء', 'Ta'], ['ث', 'ثَاء', 'Tha'],
  ['ج', 'جِيم', 'Jim'], ['ح', 'حَاء', 'Ḥa'], ['خ', 'خَاء', 'Kha'], ['د', 'دَال', 'Dal'],
  ['ذ', 'ذَال', 'Dhal'], ['ر', 'رَاء', 'Ra'], ['ز', 'زَاي', 'Zay'], ['س', 'سِين', 'Sin'],
  ['ش', 'شِين', 'Shin'], ['ص', 'صَاد', 'Sad'], ['ض', 'ضَاد', 'Dad'], ['ط', 'طَاء', 'Ṭa'],
  ['ظ', 'ظَاء', 'Ẓa'], ['ع', 'عَيْن', 'Ayn'], ['غ', 'غَيْن', 'Ghayn'], ['ف', 'فَاء', 'Fa'],
  ['ق', 'قَاف', 'Qaf'], ['ك', 'كَاف', 'Kaf'], ['ل', 'لَام', 'Lam'], ['م', 'مِيم', 'Mim'],
  ['ن', 'نُون', 'Noun'], ['ه', 'هَاء', 'Ha'], ['و', 'وَاو', 'Waw'], ['ي', 'يَاء', 'Ya'],
].map(([c, name, fr]) => ({ c, name, fr }));

// Ce qui distingue une lettre de ses jumelles (affiché après une erreur).
window.LETTER_HINTS = {
  'ا': 'Un trait droit, tout simple. Rien en bas.',
  'ل': 'Un trait droit avec un crochet en bas, comme un hameçon 🪝',
  'ع': 'Ouverte en haut comme un petit « c ». Son profond de la gorge.',
  'ح': 'Un petit toit en haut, sans point. Son soufflé « hhh », comme sur une vitre.',
  'ه': 'Toute ronde, comme une petite tête. Son léger « h ».',
  'غ': 'Comme Ayn, mais avec un point dessus. Son « gh » qui gratte.',
  'ج': 'Un point dedans.',
  'خ': 'Un point dessus.',
  'ب': 'Un point dessous.',
  'ت': 'Deux points dessus.',
  'ث': 'Trois points dessus.',
  'د': 'Sans point.',
  'ذ': 'Un point dessus.',
  'ر': 'Sans point.',
  'ز': 'Un point dessus.',
  'س': 'Sans point.',
  'ش': 'Trois points dessus.',
  'ص': 'Sans point.',
  'ض': 'Un point dessus.',
  'ط': 'Sans point.',
  'ظ': 'Un point dessus.',
  'ف': 'Un seul point dessus.',
  'ق': 'Deux points dessus, et la queue descend plus bas.',
};

// Les lettres jumelles. prio = confusions repérées chez Zeydoune.
// words = mots qui contiennent une seule des lettres du groupe.
window.TWINS = [
  { id: 'alif-lam', l: ['ا', 'ل'], prio: true, words: {
    'ا': ['بَاب', 'نَار', 'كِتَاب', 'دَار', 'تَاج'],
    'ل': ['قَلَم', 'جَمَل', 'فِيل', 'وَلَد', 'لَيْل'] } },
  { id: 'ayn-ha', l: ['ع', 'ح'], prio: true, words: {
    'ع': ['عَيْن', 'عِنَب', 'ضِفْدَع', 'شَمْع', 'عَسَل'],
    'ح': ['حُوت', 'بَحْر', 'تُفَّاح', 'حِصَان', 'قَمْح'] } },
  { id: 'ha-ha', l: ['ح', 'ه'], prio: true, words: {
    'ح': ['حُوت', 'بَحْر', 'تُفَّاح', 'حِصَان', 'قَمْح'],
    'ه': ['هُدْهُد', 'وَجْه', 'نَهْر', 'سَهْم', 'هِلَال'] } },
  { id: 'ayn-ghayn', l: ['ع', 'غ'], words: {
    'ع': ['عَيْن', 'عِنَب', 'ضِفْدَع', 'شَمْع', 'عَسَل'],
    'غ': ['غُرَاب', 'غَزَال', 'غَابَة', 'غَيْم', 'بَبَّغَاء'] } },
  { id: 'ba-ta-tha', l: ['ب', 'ت', 'ث'] },
  { id: 'jim-ha-kha', l: ['ج', 'ح', 'خ'] },
  { id: 'dal-dhal', l: ['د', 'ذ'] },
  { id: 'ra-zay', l: ['ر', 'ز'] },
  { id: 'sin-shin', l: ['س', 'ش'] },
  { id: 'sad-dad', l: ['ص', 'ض'] },
  { id: 'ta-za', l: ['ط', 'ظ'] },
  { id: 'fa-qaf', l: ['ف', 'ق'] },
];
