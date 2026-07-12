const SVGS = {
  LITURGY:
    'data:image/svg+xml;utf8,<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>',
  MUSIC:
    'data:image/svg+xml;utf8,<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>',
  PSALMS:
    'data:image/svg+xml;utf8,<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path><path d="M9 14V7l8-1v7"></path><circle cx="7.5" cy="14" r="1.5"></circle><circle cx="15.5" cy="13" r="1.5"></circle></svg>',
  CROSS:
    'data:image/svg+xml;utf8,<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="2" x2="12" y2="22"></line><line x1="7" y1="9" x2="17" y2="9"></line></svg>',
  DEFAULT:
    'data:image/svg+xml;utf8,<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>',
};

export const getBookSvg = (name: string) => {
  const re = /fihirana|hanandratra/i;
  if (re.test(name)) return SVGS.MUSIC;
  if (name.includes("Salamo")) return SVGS.PSALMS;
  if (name.includes("Hazo Fijaliana")) return SVGS.CROSS;
  if (name.includes("Litorjia")) return SVGS.LITURGY;
  return SVGS.DEFAULT;
};

export const zigzagIcon =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">\
  <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="44"\
  d="M 190.3038,256 H 410 M 102,156 H 307.11392 M 102,356 h 205.11392"/></svg>';

export const verticalIcon =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">\
  <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="44"\
  d="M 102,256 H 410 M 102,156 H 410 M 102,356 h 308"/></svg>';

export const starIcon =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">\
  <path d="M0 0h24v24H0z" fill="none" />\
  <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" \
  d="m12 17.75l-6.172 3.245l1.179-6.873l-5-4.867l6.9-1l3.086-6.253l3.086 6.253l6.9 1l-5 4.867l1.179 6.873z" /></svg>';

export const starIconSolid =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">\
  <path d="M0 0h24v24H0z" fill="none" />\
  <path fill="currentColor" \
  d="m8.243 7.34l-6.38.925l-.113.023a1 1 0 0 0-.44 1.684l4.622 4.499l-1.09 6.355l-.013.11a1 1 0 0 0 1.464.944l5.706-3l5.693 3l.1.046a1 1 0 0 0 1.352-1.1l-1.091-6.355l4.624-4.5l.078-.085a1 1 0 0 0-.633-1.62l-6.38-.926l-2.852-5.78a1 1 0 0 0-1.794 0z" /></svg>';
