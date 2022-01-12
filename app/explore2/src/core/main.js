// © Copyright 2019-2021 J. Poulsen. All Rights Reserved.

'use strict';

const explore = {

  host                : CONZEPT_HOSTNAME,
  base                : CONZEPT_WEB_BASE,
  version             : CONZEPT_VERSION,

  url                 : undefined,  // current URL
  q                   : undefined,  // current query-term (can initially be set from the URL) --> this sets "terms"
                                    // and is then used to store the URL query-string state
                                    // (which is used for comparing the old and new URL query-string state)
  q_prev              : '', // previous query-term
  terms               : undefined, // query-term

  query               : '', // query-builder form-state

  hash                : undefined, // URL hash from URL
  //hash_prev         : undefined, // previous URL hash from URL

  embedded            : getParameterByName('embedded') || '', // signals to open links in the local iframe

  language            :  undefined, // current language 2-letter-code
  language_script     : '',       // see: https://www.w3.org/International/questions/qa-scripts.en#examples
  language_name       : '',
  language_qid        : '',
  language_direction  : 'ltr', // see: https://www.w3.org/International/questions/qa-scripts.en#examples
  splitter_direction  : 'ltr', // used to determine of splitter layout needs to be changed
  language_prev       :  '', // previous language 2-letter-code
  lang3               : undefined,
  iptv                : undefined,
  langcode_librivox   : undefined,
  lang_category       : undefined,
  lang_catre1         : undefined, // localized "Category:" replace
  lang_catre2         : undefined, // localized "Category:3A" replace
  lang_portal         : undefined,
  lang_porre1         : undefined, // localized "Portal:" replace
  lang_book           : undefined,
  lang_bookre         : undefined,
  lang_current_events_page : undefined,
  language_param      : getParameterByName('l') || undefined, // requested language from the URL
  locale_param        : getParameterByName('h') || undefined, // requested 'human locale' language from the URL
  query_param         : getParameterByName('query') || undefined, // requested 'structured query' from the URL
  //country           : 'us', // default is "United States"

  uls                 : undefined, // reference to the ULS object

  topic_cursor        : 'n1-1',

  // core URL params
  type                : getParameterByName('t') || '',  // type
  type2               : getParameterByName('t2') || '', // type for second content-pane
  type_prev           : '',   // previous query-term

  qid                 : getParameterByName('i') || '',  // global identifier
  qid2                : getParameterByName('i2') || '', // global identifier for second content-pane

  uri                 : getParameterByName('u') || '',  // URL
  uri2                : getParameterByName('u2') || '', // URL for second content-pane

  custom              : getParameterByName('c') || '',  // custom data (needed for some types)
  custom2             : getParameterByName('c2') || '', // custom data for second content-pane

  // other URL params
  fragment            : getParameterByName('f') || '',  // allow for going directly to a detail-fragment

  direct              : getParameterByName('d') || '',  // allow for direct-title-linking on first action

  marks               : getParameterByName('m') || '',  // list of linemarks (m=2-4,6,30-32)

  compares            : [], // list of IDs used by the wikidata-compare tool

  map_compares        : [], // list of query-URLs used by the map tool

  sections            : {}, // template structure: list of section objects in a topic-card
  section_dom         : $('<span></span>'), // template section-structure (as a jQuery DOM-object)

  datasources         : undefined,

  db                  : undefined, // persistent client-side storage using immortalDB

  // see also:
  //  https://stats.wikimedia.org/#/all-projects/reading/page-views-by-country/normal|table|last-month|~total|monthly
  //  https://wikirank.net/
  locales             : CONZEPT_LOCALES.split(',').map( loc => loc.trim() ),

  banana              : undefined,  // i18n engine for UI
  banana_native       : undefined,  // i18n engine for native-wikipedia-content elements

  // TODO could we rewrite and remove this?
  curr_title          : '',
  curr_article_id     : undefined,

  autocomplete_limit  : 10, // mobile default

  // global paging state
  page                    : 1, // page number we are on
  wikipedia_search_limit  : 5, // mobile default
  wikidata_search_limit   : 10, // sync with query-builder source!
  wikidata_query      : '',
  searchmode          : 'wikipedia', // wikipedia or wikidata
  totalRecords        : undefined,
  lastContinue        : [],
  firstAction         : true,

  sparql_limit        : 100, // wikidata sparql query limit

  nearby_radius_limit : 10000,  // distance in meters
  nearby_max_results  : 250,  // maximum nearby results

  vids_mute           : '',

  // UI state
  replaceState        : true,
  leftPanel           : true,
  fetchFail           : false,
  activeTab           : undefined,
  tabsInstance        : M.Tabs.init( document.querySelector('#tabs-swipe-demo' ), {
    onShow: onTabShow,
    swipeable: false,
  }),
  tabPositions        : [0, 0, 0, 0, 0], // 5 tabs
	swiperLimit         : 2, // only used on mobile
  preventSliding      : false, // to allow input-search-submits to stay on the same slide
  windowName          : window.name || '', // used to check if this explore-window is in "infoframeSplit2"
  deviceOrientation   : undefined,
  splitter            : undefined,
  splitterWidth       : undefined,
  embedded_splitter   : undefined,
  embedded_splitter_left_width : 50,
  show_sidebar        : getParameterByName('s') === "false" ? false : true, // iframe-embedded apps can turn of the sidebar with this option
  show_sidebar_prev   : undefined,
  panel2_minimized    : false, // used for toggling content pane 2 to full width
  viewMode            : getParameterByName('v') || '' , // view modes: desktop / mobile / XR-VR / REST-JSON?
  click_on_sidebar_article : true, // 
  showMobileConsole   : false,
  //droppingQuery     : false,

  // pre-calculated dates
  current_year        : new Date().getFullYear(),
  previous_year       : new Date().getFullYear() - 4, // used by pageview-stats-link
  current_month       : monthFormatted(),
  current_day         : new Date().getDate(),

  // large table lists
  table               : undefined,

  // TTS system
  tts_enabled         : true,
  synth               : window.speechSynthesis,
  synth_paused        : false,
  //tts_removals      : 'table, sub, sup, style, .internal.hash, .rt-commentedText, .IPA, math',

  // TTS helper
  voice_code          : undefined,   // used voice code like "en-GB", etc.
  voice_code_selected : '', // user-selected voice code like "en-GB", etc.
  voice_rate          : 1.00,
  speakingNow         : 'false',
  speakingTitle       : '',

  baseframe           : '#infoframe', // desktop

  // default font styles
  default_font        : 'Quicksand',
  default_fontsize    : 15,                // default for mobile screens
  default_fontsize_small_desktop : 18,  // default for small desktops (<1300)
  default_fontsize_medium_desktop: 18,  // default for medium desktops (<1600)
  default_fontsize_large_desktop : 18,  // default for large desktops (>1600)

  banner_width        : '1200px', // desktop size

  // styling options
  bold                : undefined,
  underline           : undefined,
  multicolumn         : undefined,
  linkpreview         : undefined,
  darkmode            : undefined,
  bgmode              : undefined,
  personas            : [],
  colorfilter         : undefined,
  covertopic          : undefined,
  locale              : undefined,
  grayscale           : undefined,
  font1               : undefined,
  fontsize            : undefined,
  linkcolor           : undefined,
  linkbgcolor         : undefined,
  autocomplete        : undefined,
  minimalmode         : undefined,
  minimal_detail_open : '',
  minimal_detail_close: '',

  bookmarks           : undefined,

  uls_languages       : {}, // used by the universal-language-switcher widget

  isMobile            : detectMobile(),
  isSafari            : detectSafari(),

  wallpaper           : '',

  covers              : cover_titles,

  // TODO 
  //  - add entry for "Category" translations (to make the category-rendering work well for other languages)
  //  - complete adding 3-letter language-codes to this table (which are used by Archive.org)
  //
  //    wikipedia (iso lang2):        https://www.loc.gov/standards/iso639-2/php/code_list.php
  //    archive.org (lang-3 english): https://github.com/internetarchive/dweb-archivecontroller/blob/master/Util.js#L683
  //    franc.js (lang3 localized):   https://github.com/wooorm/franc/tree/master/packages/franc

  wp_languages        : wp_languages,

  osm_tag_options     : '',

  keyboard_ctrl_pressed : false,

  presentation_playing  : false,
  presentation_id       : '',
  presentation_slide    : 0,
  presentation_nr_of_slides : 0,
}


if ('serviceWorker' in navigator) {

  navigator.serviceWorker.register('/service-worker.js')

    .then(function(registration) { // registration was successful
      //console.log('ServiceWorker registration successful with scope: ', registration.scope);
    })
		.catch(function(err) { // registration failed
      console.log('ServiceWorker registration failed: ', err);
    });

}

if ( explore.isMobile ){

  explore.baseframe     = '#infoframeSplit1';
  explore.banner_width  = '600px';
    
}

//let table = {}; // array of wikipedia-language-info objects
//let table2;

$( document ).ready( function() {

  init();

  (async () => { 

    // immortalDB: https://github.com/gruns/ImmortalDB
    explore.db = ImmortalDB.ImmortalDB;

    // i18n engine: https://github.com/wikimedia/banana-i18n
    // set default locale and locale-fallback, we will set the true user-locale later.
    explore.banana        = new Banana( 'en', { finalFallback: 'en' } ); // used for the UI interface
    explore.banana_native = new Banana( 'en', { finalFallback: 'en' } ); // allows for translating to the native-content language

    explore.font1			  =  await explore.db.get('font1');
    explore.linkcolor   = await explore.db.get('linkcolor');
    explore.linkbgcolor = await explore.db.get('linkbgcolor');
    explore.fontsize    = await explore.db.get('fontsize');

    // load user defined voice code (but will only be used for a matching language)
    let vcs = await explore.db.get('voice_code_selected');

    if ( vcs !== null && vcs !== 'null' && vcs !== '' ){

      explore.voice_code_selected = await explore.db.get('voice_code_selected');

      //console.log( explore.voice_code_selected );

    }

    if ( typeof explore.uri === undefined || typeof explore.uri === 'undefined' || explore.uri === '' ){
      // do nothing
    }
    else { // first decode the URL param

      explore.uri = decodeURI( explore.uri );

    }

    if ( explore.custom !== '' ){

      //console.log('explore.custom: ', explore.custom );

      //if ( explore.type === 'nearby' ){
      //  explore.compares = explore.custom.split(','); // get IDs from explore.custom
      //}

      if ( explore.type === 'compare' ){
        explore.compares = explore.custom.split(','); // get IDs from explore.custom
      }

    }

    setupFonts();
    setupSwiping();
    setupBookmarks();
    setupOptionTopicCover(); // needs to be called earlier (so the topic is set when we display the default cover page)
    setupKeyboardNavigation();
    setupKeyboardCombos();

    explore.language = window.language = await explore.db.get('language');
    explore.locale = await explore.db.get('locale');
    //explore.voice_code_selected = await explore.db.get( 'voice_code_selected' );
    setupLanguage();

    createSectionDOM();

    // set event-handlers for various search actions (search form input, and some other search-input actions)
    setupSearch();

    // user-customizable options:
    setupOptionBoldLinks();
    setupOptionUnderlineLinks();
    setupOptionBgmode();
    setupOptionDarkmode();
    setupOptionColorFilter();
    setupOptionPersonas();
    setupOptionAutocompleteToggle();
    setupOptionMulticolumn(); // experimental feature
    setupOptionLinkPreview();
    // setupOptionVoiceCommand();
    // setupOptionLinkTypes();

    /*
    if ( explore.isMobile ){ // only show this option on mobile devices

      $('#option-toggle-mobile-console').show();

      setupOptionMobileConsole();

      //toggleMobileConsole();

    }
    */

    setupURL();
    setupUI();

    setupInfiniteScroll();
    setupAmbientAudio();

    setupAutoStopAudio();

    // this can trigger the URL-query-search (if there is a URL query parameter) or just displays the cover photo screen
    triggerQueryForm();

    $('#splash').hide();

  })();

});

jQuery.extend({

  random: function(X) {
      return Math.floor(X * (Math.random() % 1));
  },

  randomBetween: function(MinV, MaxV) {
      return MinV + jQuery.random(MaxV - MinV + 1);
  }

});

async function onTabShow( tab ){
  explore.activeTab = tab.id.replace('swipe-', ''); // set active tab
  $('#sidebar').scrollTop( explore.tabPositions[ explore.activeTab ] ); // use previous scroll position
}
