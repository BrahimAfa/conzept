'use strict';

// fetch the list of voices and populate the voice options.
function reloadVoices() {

	if ('speechSynthesis' in window) {

		// get the available voices.
		let voices = window.speechSynthesis.getVoices();

		$('#voices').empty();

		$('#voices').append( `<option value="${explore.voice_code}"></option>` ); 

		voices.forEach(function(voice, i) {

			if ( voice.lang.startsWith( explore.language ) ){

				$('#voices').append( `<option value="${voice.lang}">${voice.name}</option>` ); 

			}

		});

    // use user-preference if the language matches
    if ( explore.voice_code_selected.startsWith( explore.language ) ){

      $('#voices option[value=' + explore.voice_code_selected + ']').attr('selected','selected');

    }

	}

}

async function setupAmbientAudio(){

	let randomize = true;

	Array.prototype.shuffle = function() {

		let input = this;

		for ( let i = input.length-1; i >=0; i-- ) {

			let randomIndex = Math.floor(Math.random()*(i+1));
			let itemAtIndex = input[randomIndex];

			input[randomIndex] = input[i];
			input[i] = itemAtIndex;

		}

		return input;

	}

  const supportsAudio = !! document.createElement('audio').canPlayType;

  if ( supportsAudio ){

    let keys = [];

    for (let key in PLAYLIST){
      keys.push(key);
    }

    if (randomize){
      keys = keys.shuffle();
    }

    let tracks = [];

    for (let i = 0; i < keys.length; i++) {
      tracks = tracks.concat( PLAYLIST[ keys[i] ] );
    }

    let index = 0,

      playing = false,

      buildPlaylist = $.each(tracks, function(key, value) {

        let trackNumber = key,
          trackName = value.name,
          trackLength = value.length;

        if (trackNumber.toString().length === 1) {
          trackNumber = '0' + trackNumber;
        }
        else {
          trackNumber = '' + trackNumber;
        }

        $('#plList').append('<li><div class="plItem"><div class="plNum">' + trackNumber + '.</div><div class="plTitle" tabindex="0">' + trackName + '</div><div class="plLength">' + trackLength + '</div></div></li>'); 

      }),

      trackCount = tracks.length,
      npAction = $('#npAction'),
      npTitle = $('#npTitle'),

      audio = $('#audio1').bind('play', function() {

        playing = true;
        npAction.text('Now Playing...');

      })

      .bind('pause', function() {

        playing = false;
        npAction.text('Paused...');

      })

      .bind('ended', function() {

        npAction.text('Paused...');

        if ((index + 1) < trackCount) { // still more tracks to play

          if ( explore.autoplay ) {

            index++;
            loadTrack(index);
            audio.play();

          }

        }
        else {

          audio.pause();
          index = 0;
          loadTrack(index);

        }
      })
      .get(0),

      btnPrev = $('#btnPrev').click(function() {

        if ((index - 1) > -1) {

          index--;
          loadTrack(index);

          if (playing) {
            audio.play();
          }

        }
        else {

          audio.pause();
          index = 0;
          loadTrack(index);

        }

      }),

      btnNext = $('#btnNext').click(function() {

        if ((index + 1) < trackCount) {

          index++;
          loadTrack(index);

          if (playing) {

            audio.play();

          }

        }
        else {

          audio.pause();
          index = 0;
          loadTrack(index);

        }

      }),

      li = $('#plList li').click(function() {

        let id = parseInt($(this).index());

        if (id !== index) {

          playTrack(id);

        }

      }),

      loadTrack = function(id) {

        $('.plSel').removeClass('plSel');
        $('#plList li:eq(' + id + ')').addClass('plSel');

        npTitle.text(tracks[id].name);
        index = id;
        audio.src = tracks[id].file;

      },

      playTrack = function(id) {

        loadTrack(id);
        audio.play();

      };

    if ( explore.autoplay ) {

      playTrack(index);

    }
    else {

      loadTrack(index);

    }
  }

}


async function setupInfiniteScroll(){

	const sentinel = document.querySelector('.sentinel'); // intersection-observer sensor

	// see: https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API
	let intersectionObserver = new IntersectionObserver( entries => {

		if ( entries[0].intersectionRatio <= 0 ) { // sentinel out of view
			return;
		}

    $('#loader').show();

		loadNextPage(); // load in more results (if any)

	});

	intersectionObserver.observe( sentinel );

}

const loadNextPage = async function() {

  if ( explore.searchmode === 'wikidata' ){

    $('#blink').show();

    explore.page += 1; // increment page
    const offset = ( explore.page - 1 ) * datasources.wikidata.pagesize;

    explore.wikidata_query = explore.wikidata_query.replace( /OFFSET%20.*%20LIMIT/, 'OFFSET%20' + offset + '%20LIMIT');

    // only fetch and render next-pages (since the first page was already fetched)
    if ( explore.page > 1 ){

      let topicResults = await fetchWikidataQuery();

      console.log('fetchWikidataQuery data: ', topicResults );

      renderTopics( { 'wikidata' : { data: topicResults } } );

    }

  }
  else { // string-based search

    explore.q = getSearchValue();

    let combined_pagesize = 0; // reset

    $.each( explore.datasources, function( index, source ){ // for each active datasource

      if ( ! datasources[ source ].done ){

        combined_pagesize += parseInt( datasources[ source ].pagesize );

      }


    });

    const relative_done   = explore.totalRecords / ( combined_pagesize *  explore.page ); 

    const no_more_results = ( Math.max( Math.ceil( relative_done ), 1) === 1 );
    
    if ( no_more_results ){

    	$('#loader').hide();

    }
    else {

      $('#blink').show();

      explore.page += 1;

      explore.type = 'wikipedia';

      loadTopics( true ); // "true" indicates loading a follow-up page

    }

  }

}

async function applyFont( font ) {

	explore.font1 = font; // store new font

  (async () => { await explore.db.set( 'font1', explore.font1 ); })();

  //console.log( explore.font1 );

	// setup fontlink
  //if ( explore.font1 !== 'FOO IBM Plex Sans Condensed' ){ // custom font FIXME

	  $('#fontlink').replaceWith( '<link id="fontlink" href="https://fonts.googleapis.com/css?family=' + explore.font1 + ':400,500&display=swap&subset=latin-ext" rel="stylesheet" type="text/css">' );
	  $( explore.baseframe ).contents().find('#fontlink').replaceWith( '<link id="fontlink" href="https://fonts.googleapis.com/css?family=' + explore.font1 + ':400,500&display=swap&subset=latin-ext" rel="stylesheet" type="text/css">' );

  //}
  //else { // standard font
	  //$( explore.baseframe ).contents().find('#fontlink').replaceWith( '<link id=fontlink />' );
  //}

  // activate font on parent-body
	$('body').css( 'font-family', explore.font1 , '');
	$('.article-title.linkblock').css( 'font-family', explore.default_font, 'important');
	$('body').css( 'font-size', explore.fontsize + 'px' );

  // TODO: make fontsize also work in splitframes

  // activate font on iframe
  $( explore.baseframe ).contents().find('body').css( 'fontFamily', explore.font1 , '');


}

async function setupFonts(){

	// font type
	explore.font1 = ( explore.font1 === null || explore.font1 === undefined ) ? explore.default_font : explore.font1;

  applyFont( explore.font1 );

	$('#font1').fontselect().on('change', function() {

    let font = this.value.replace(/\+/g, ' '); // replace + signs with spaces for css
    font = font.split(':'); // split font into family and weight
		applyFont( font[0] );

	});

  $('#selectedfont').text( explore.font1 );

  // detect default fontsize
  if ( !explore.isMobile ){ // desktop computer

    if ( window.innerWidth < 1300 ){
      explore.default_fontsize = explore.default_fontsize_small_desktop;
    }
    else if ( window.innerWidth < 1600 ){
      explore.default_fontsize = explore.default_fontsize_medium_desktop;
    }
    else { // smaller desktop screen
      explore.default_fontsize = explore.default_fontsize_large_desktop;
    }

  }

  explore.fontsize = ( explore.fontsize === undefined || explore.fontsize === null || explore.fontsize === 'null' || isNaN( explore.fontsize ) ) ? explore.default_fontsize : explore.fontsize;

  (async () => { await explore.db.set( 'fontsize', explore.fontsize ); })();

	// set font size
	$('body').css( 'fontFamily', explore.font1 , 'important');
	$('body').css( 'fontWeight', explore.fontsize + 'px' );

  // sync UI value
  $('#fontsizer').val( explore.fontsize );
  $('#fontsize').text( explore.fontsize );

  // set default fontsize
  $('body').css('font-size', explore.fontsize + 'px');
  //$( explore.baseframe ).contents().find("body").css('font-size', explore.fontsize + 'px'); // FIXME not needed?

  // change fontsize
	$('#fontsizer').on('input', function () {

		explore.fontsize = $(this).val();

    $('#fontsize').text( explore.fontsize );
    (async () => { await explore.db.set( 'fontsize', explore.fontsize ); })();

		$('body').css('font-size', explore.fontsize + 'px');
    $( explore.baseframe ).contents().find("body").css('font-size', explore.fontsize + 'px'); // FIXME not needed?

    resizeFont();

	});

  // apply link colors
	explore.linkcolor = ( explore.linkcolor === null || explore.linkcolor === undefined ) ? 'inherit' : explore.linkcolor;
	explore.linkbgcolor = ( explore.linkbgcolor === null || explore.linkbgcolor === undefined ) ? 'inherit' : explore.linkbgcolor;

  $( explore.baseframe ).contents().find('a.link').css( 'color', explore.linkcolor , 'important');
  $( explore.baseframe ).contents().find('a.link').css( 'background', explore.linkbgcolor , 'important');

}

function setupSwiping(){

  if ( explore.isMobile ){

		explore.swiper = new Swiper(".swiper-container", {
			slidesPerView: 1,
			spaceBetween: 30,
			autoHeight: true,
			keyboard: {
				enabled: true,
			},
			pagination: {
				el: ".swiper-pagination",
				clickable: true,
			},
			navigation: {
				nextEl: ".swiper-button-next",
				prevEl: ".swiper-button-prev",
			},
		});

		$('[aria-label="Go to slide 1"]').css( 'background-image', 'url("' + explore.base + '/app/explore2/assets/images/icon_home.png")' );
		$('[aria-label="Go to slide 1"]').css( 'background-size', 'contain' );

    // TODO: by default hide unused slides
		//$('[aria-label="Go to slide 3"]').hide();
		//$('[aria-label="Go to slide 4"]').hide();

		// check which slides are active upon each sliding-action,
		explore.swiper.on("slideNextTransitionStart", function() { updateSlideAvalability(); });
		explore.swiper.on("slidePrevTransitionEnd", function() { updateSlideAvalability(); });

	}

}

function updateSlideAvalability(){

	// 0 nav
	// 1 primary content frame
	// 2 secondary content frame 1
	// 3 secondary content frame 1

	if ( explore.swiper.realIndex >= explore.swiperLimit ) {
		explore.swiper.allowSlideNext = 0; // disable sliding
	}
	else {
		explore.swiper.allowSlideNext = 1; // enable sliding
	}

}

function triggerQueryForm(){

  if ( explore.q.charAt(0) === '!' ){ // command query

    explore.page = 1; // reset page position

    $('#pager').hide();

    let s = explore.q;

    $('#srsearch').val( explore.q );
    explore.q = getSearchValue();

    $('.submitSearch').click(); // trigger submit

  }
  else if ( explore.commands !== '' ){ // editor commands

    let check = setInterval(function() {

     if ( $('textarea.ace_text-input').length > 0 ) {

        clearInterval( check );

        // insert editor command
        //explore.editor.setValue( beautify( explore.commands ) );
        explore.editor.setValue( explore.commands );

				runEditorCode( explore.commands );

     }
     else  {

      console.log('waiting for command editor...');

     }

    }, 1000);

  }
  else if ( explore.query !== '' ){ // structured-query

    let check = setInterval(function() {

     if ( $('.querybuilder__run button').length > 0 ) {

        clearInterval( check );

        //explore.query_run = false;

        $('.querybuilder__run button').click();

     }
     else  {

      console.log('waiting for query-builder...');

     }

    }, 1000);

    // try to render content-pane too
    handleClick({
      id        : 'n1-0',
      type      : explore.type,
      title     : explore.q,
      language  : explore.language,
      qid       : explore.qid,
      url       : explore.uri,
      tag       : '',
      languages : '',
      custom    : explore.custom,
      target_pane : 'p1',
    });

  }
  else if ( explore.q !== ''){ // normal query

    explore.searchmode = 'wikipedia';

    explore.page = 1; // reset page position

    $('#pager').hide();

    explore.q = explore.q.trim().replace('/\/|\\|?/g','').replace(/&quot;/g, '"');

    $('#srsearch').val( explore.q );
    explore.q = getSearchValue();

    $('.submitSearch').trigger('click'); // synthetic trigger submit

    // show non-wikipedia types (if needed)
    if ( explore.type !== 'wikipedia' && explore.type !== '' ){

      handleClick({
        id        : 'n1-0',
        type      : explore.type,
        title     : explore.q,
        language  : explore.language,
        qid       : explore.qid,
        url       : explore.uri,
        tag       : '',
        languages : '',
        custom    : explore.custom,
        target_pane : 'p1',
      });

    }

  }
  else if ( explore.q === '' && explore.type === 'wikipedia-qid' && explore.qid !== '' ){ // wikipedia-qid query

    explore.searchmode = 'wikipedia';

    let qid = '';

    if ( !explore.qid.startsWith('Q') ){
      explore.qid = 'Q' + explore.qid; // add 'Q' to qid string
    }

    qid = explore.qid;

    resetIframe();

    let promiseB = fetchLabel([ qid ], explore.language ).then(function(result) {

      let label = '';

      if ( result.entities[ qid ]?.labels[ explore.language ] ){ // with label

        label = result.entities[ qid ].labels[ explore.language ].value;

        // show results
        handleClick({ 
          id        : 'n1-0',
          type      : 'articles',
          title     : label,
          language  : explore.language,
          qid       : '' + qid,
          url       : '',
          tag       : '',
          languages : '',
          custom    : '',
          target_pane : 'p0',
        });

        // try to show a single wikipedia page derived from this qid
        handleClick({
          id        : 'n1-0',
          type      : 'wikipedia-qid',
          title     : label,
          language  : explore.language,
          qid       : '' + qid,
          url       : '',
          tag       : '',
          languages : '',
          custom    : '',
          target_pane : 'p1',
        });

      }
      else { // without label

        handleClick({ 
          id        : 'n1-0',
          type      : 'wikipedia-qid',
          title     : '',
          language  : explore.language,
          qid       : '' + qid,
          url       : '',
          tag       : '',
          languages : '',
          custom    : '',
          target_pane : 'p1',
        });

      }

    });

  }
  else if ( explore.q === '' && explore.type === 'compare' ){ // compare request  && explore.compares !== []

    explore.searchmode = 'wikipedia';

    resetIframe();

    // try to show a single wikipedia page derived from this qid
    explore.custom = explore.compares;

    if ( explore.compares.length >= 2 ){

      handleClick({ 
        id        : 'n1-0',
        type      : 'compare',
        title     : explore.q.trim(),
        language  : explore.language,
        qid       : '',
        url       : '',
        tag       : '',
        languages : '',
        ids       : explore.compares.join(),
        custom    : '',
        target_pane : 'p1',
      });

      explore.custom = '';

    }

  }
  else { // no query, show intro screen

    showStartPage();

  }

}

async function newSearch(){

  explore.searchmode    = 'wikipedia';
  explore.type          = '';

  $('#srsearch').val('');
  $('#srsearch').focus();

  explore.tabsInstance.select('tab-topics');

}

async function showStartPage(){

  explore.searchmode    = 'wikipedia';
  explore.type          = '';
  explore.hash          = '';

  $('#srsearch').val('');
  $('#srsearch').focus();
  $('#tab-topics .overflow-container').scrollTop(0);

  if ( valid( explore.tab ) ){
    explore.tabsInstance.select( explore.tab );
    explore.tab = '';
  }
  else {
    explore.tabsInstance.select('tab-topics');
  }

  let title = 'home - Conzept encyclopedia';

  document.title = title;
  $('title').text( title );

  // reset meta-tags
  $('meta[property="og:title"]').attr('content', title );
  $('meta[property="twitter:title"]').attr('content', title );

  const description = 'Conzept is an attempt to create an encyclopedia for the 21st century. A modern topic-exploration tool based on Wikipedia, Wikidata, Open Library and many other information sources.';

  $('meta[name=description]').attr('content', description );
  $('meta[property="og:description"]').attr('content', description );
  $('meta[property="twitter:description"]').attr('content', description );

  const url = 'https://' + explore.host + explore.base + '/explore?l=' + explore.language + '#' + explore.hash;

  $('link[rel=canonical]').attr('href', url );
  $('meta[property="og:url"]').attr('content', url );
  $('meta[property="twitter:url"]').attr('content', url );

  history.pushState({ id: 'home' }, 'conzept explore', url );

  setDefaultDisplaySettings();

}

async function setupKeyboardNavigation(){

    document.addEventListener('keyup', e => {

      explore.keyboard_ctrl_pressed = false;

    });

    document.addEventListener('keydown', e => {

      if ( e.key === 'Control' || e.which == '17' ){

        explore.keyboard_ctrl_pressed = true;

      }

      const exclude_from_navigation = [ 'INPUT' ];

      // exclude some (already keybinding) form-elements from this keyboard-navigation
      if ( ! exclude_from_navigation.includes( $(document.activeElement).prop('nodeName') ) ){

        if (e.key === 'ArrowDown' ) { // go to next topic

          if ( $( '#' + explore.topic_cursor ).next().length ){ // topic exists

            if ( $( '#' + explore.topic_cursor ).next().is(":visible") ){ // and is not hidden

              $('#results details').removeAttr("open"); // needed to position the cursor correctly
              explore.topic_cursor = $( '#' + explore.topic_cursor ).next().attr('id');
              $( '#' + explore.topic_cursor )[0].scrollIntoView({block: 'center'});
              $( '#' + explore.topic_cursor + ' a').first().focus();

            }

          }

        }

        if (e.key === 'ArrowUp') { // go to previous topic

          if ( $( '#' + explore.topic_cursor ).prev().length ){ // topic exists

            if ( $( '#' + explore.topic_cursor ).prev().is(":visible") ){ // and is not hidden

              $('#results details').removeAttr("open"); // needed to position the cursor correctly
              explore.topic_cursor = $( '#' + explore.topic_cursor ).prev().attr('id');
              $( '#' + explore.topic_cursor )[0].scrollIntoView({block: 'center'});
              $( '#' + explore.topic_cursor + ' a').first().focus();

            }

          }

        }

        if (e.key === 'ArrowRight') { // move to content-pane

          if ( $( explore.baseframe ).contents().find('html').length ){ // content-pane exists

            if ( $( explore.baseframe ).contents()[0].baseURI.startsWith( 'https://' + explore.host ) ){ // local iframe URL

              $( explore.baseframe ).contents().find('a').first().focus();

            }

          }

        }

      }

	  }
  );

}

async function setupKeyboardCombos(){

  // see:
  //  https://github.com/RobertWHurst/KeyboardJS
  //  https://www.jqueryscript.net/other/jQuery-Plugin-For-Scrolling-Content-with-Arrow-Keys-keyscroll.html

  keyboardJS.bind('f', function(e) {

		// only go on if no input/editor-element has focus!
    if (	!($('input').is(':focus')) && !($('.ace_text-input').is(':focus')) ){
      toggleFullscreen();
    }

  });

  keyboardJS.bind('alt+x', function(e) {
    newSearch();
  });

  keyboardJS.bind('alt+y', function(e) {
    toggleSidebar();
  });

  keyboardJS.bind('alt+i', function(e) {
    //e.preventRepeat();
    addBookmark(event, 'clicked' );
  });

  keyboardJS.bind('alt+r', function(e) {
    showRandomQuery();
  });

}

async function auxClick( e ) {

  if ( typeof e.parentElement.attributes.getNamedItem('onClick').value === null || typeof e.parentElement.attributes.getNamedItem('onClick').value === undefined ){
    // do nothing
  }
  else {

    let hc_string = e.parentElement.attributes.getNamedItem('onClick').value; // get string
    let args      = hc_string.replace(/handleClick\(/g, '').slice(0, -1); // cleanup string
    args          = args.split(',');

    // create new URL from args
    let url = '/explore/';

    // handleClick (  0:id,   1:type,  2:title,                   3:lang, 4:url,                                                                    5:qid,      6:tag, 7:languages ) {
    //               "n1-0",  "link" , "Vanessa Benelli Mosell" , "en" ,  "https://commons.m.wikimedia.org/wiki/Category:Vanessa Benelli Mosell" ,  "4008536"

    // title
    if ( valid( args[2] ) ){
      url += args[2].trim().replace(/"/g, '');
      url += '?';
    }

    // type 
    if ( valid( args[1] ) ){
      url += '&t=' + args[1].trim().replace(/"/g, '');
    }

    // language
    if ( valid( args[3] ) ){
      url += '&l=' + args[3].trim().replace(/"/g, '');
    }

    // url
    if ( valid( args[4] ) ){
      url += '&u=' + args[4].trim().replace(/"/g, '');
    }

    // identifier
    if ( valid( args[5] ) ){
      url += '&i=' + args[5].trim().replace(/"/g, '');
    }

    // sidebar
    if ( explore.show_sidebar ){
      url += '&s=true';
    }
    else {
      url += '&s=false';
    }

    openInNewTab( url );

  }

}

function init() {

  // setup wikibase library
  window.wbk = WBK({
    instance:       datasources.wikidata.instance,
    sparqlEndpoint: datasources.wikidata.endpoint,
  })

	window.SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;

  // simple number padding
  Number.prototype.pad = function(size) {
    let s = String(this);
    while (s.length < (size || 2)) {s = "0" + s;}
    return s;
  }

  window.addEventListener("message", receiveMessage, false);

  // MIME-type hack: https://stackoverflow.com/questions/2618959/not-well-formed-warning-when-loading-client-side-json-in-firefox-via-jquery-aj
  $.ajaxSetup({beforeSend: function(xhr){ if (xhr.overrideMimeType) { xhr.overrideMimeType("application/json"); } } });

  // build the supported-languages object for the ULS widget
  for ( const [ code , langobj ] of Object.entries( explore.wp_languages )) {
    explore.uls_languages[ code ] =  langobj.name + ' - ' + langobj.title;
  }

  if ( explore.direct === true || explore.direct === 'true' ){
    explore.direct = true;
  }
  else {
    explore.direct = false;
  }

  /* TODO: how to re-implement this using data-sources?
  if ( explore.isMobile === false ){ // desktop

    //  increase some search-result limits
    explore.wikipedia_search_limit  = 10;
    explore.autocomplete_limit      = 20;

  }
  */

  // pre-construct the HTML tag-select options, so we only have to do this once
  explore.osm_tag_options += '<option value=""></option>';

  $.each( osm_tags, function ( i, v ) {

    const label = v.value.replace('Tag:', '').replace('=', ' : ').replace(':', ' : ').replace('_', ' ') + ' : ' + v.label;

    explore.osm_tag_options += '<option value="' + v.value.replace('Tag:', '') + '">' + label + '</option>';

  });

  explore.date_tag_options += '<option value=""></option>';

  let date_tags = Array.from({length: 2021}, (v, k) => k+1);

  date_tags.push( '2000s', '1900s', '1800s', '1700s', '1600s', '1500s', '1400s', '1300s', '1200s', '1100s', '1st century', '2nd century', '3rd century', '4th century', '5th century', '6th century', '7th century', '8th century', '9th century', '10th century', '11th century', '12th century', '13th century', '14th century', '15th century', '16th century', '17th century', '18th century', '19th century', '20th century', 'middle ages', 'prehistory', 'ancient', 'history', 'modern' );

  date_tags = date_tags.sort((a, b) => a - b).reverse();

  $.each( date_tags, function ( i, v ) {

    explore.date_tag_options += '<option value="' + v + '">' + v + '</option>';

  });

  // temporary toggle the icon class
  $('#add-bookmark').on("click", function () {
  
    $('#bookmarkIcon').addClass('fas');
    setTimeout( removeBookmarkClass, 4000);

  });

  // add hexagonal-covers list
  //if ( explore.language === 'en' || explore.language === 'simple' ){

    // FIXME:
    //  - make this language-independent with Qid's
    //  - allow other lists to be created from a SPARQL-based query
    //  - make this also work for mobile
    $( '#hexpages' ).html(
        '<li><a title="1000 essential articles" href="' + explore.base + '/app/coverhex/1000_essential_articles.html" target="infoframe"><span class="icon"><i class="fa-brands fa-first-order"></i></span> 1000 essential articles</a></li>' + 
        '<li><a title="100 non-western artists" href="' + explore.base + '/app/coverhex/artists.html" target="infoframe"><span class="icon"><i class="fa-brands fa-first-order"></i></span> 100 non-western artists</a></li>'
    );

  //}

  let cover_topic_html = '';

  $.each( cover_topics, function ( i, v ) {

    cover_topic_html += '<option value="' + v + '">' + v + '</option>'; // TODO: how to translate the label in all languages?

  });

  $('#covertopic').append( cover_topic_html );

  // handle clicks on json-tree leaf-nodes
  //$('#swipe-5').on( 'click', '.LIText', function(){ jsontreeClick( $(this) ) }  );

}

/*
function jsontreeClick( el ){

  let type  = el.children().eq(0).text().trim() || '';
  let value = el.children().eq(1).text().trim() || '';

  if ( type === 'name' ){

    const url = '';

    renderToPane( 'p1', explore.base + '/app/wikipedia/?t=' + encodeURIComponent( value ) + '&l=' + explore.language + '&voice=' + explore.voice_code + '&qid=' + '&dir=' + explore.language_direction  + '&embedded=' + explore.embedded );

  }

}
*/

function removeBookmarkClass(){

  $('#bookmarkIcon').removeClass('fas')

}

function setupBookmarks() {

  const t = $('#tree');

  // get stored bookmarks
  (async () => {

    explore.bookmarks = await explore.db.get('bookmarks');

    if ( explore.bookmarks === undefined ){ // no stored bookmarks found
      explore.bookmarks = [ { name: "my bookmarks", display: 'my bookmarks', url: explore.base + '/blank.html', id: '1', language: 'en', type: 'none' }, ];
    }
    else { // stored bookmarks found
      explore.bookmarks = JSON.parse( explore.bookmarks );
    }

    // see: https://mbraak.github.io/jqTree/
    t.tree({

      data: explore.bookmarks,
      //saveState: true, // FIXME not yet working, see also: https://mbraak.github.io/jqTree/examples/04_save_state/
      buttonLeft: false,
      autoOpen: false,
      slide: false,

      // https://stackoverflow.com/questions/18376165/remove-node-by-id-in-jstree-when-button-is-clicked
      closedIcon: $('<span class="icon"><i class="fa-solid fa-plus"></i></span>'),
      openedIcon: $('<span class="icon"><i class="fa-solid fa-minus"></i></span>'),
      dragAndDrop: true,
      onCreateLi: function(node, $li, is_selected) {

        let icon = '';

        if ( node.type === 'wikipedia' ){
          icon = '<i style="font-size: smaller; font-style: italic;" class="fa-brands fa-wikipedia-w"></i>:' + node.language ;
        }
        else if ( node.type === 'video' ){
          icon = '<span class="icon"><i class="fa-solid fa-video">';
        }
        else if ( node.type === 'music' ){
          icon = '<span class="icon"><i class="fa-brands fa-itunes-note">';
        }
        else if ( node.type === 'images' ){
          icon = '<span class="icon"><i class="fa-regular fa-images">';
        }
        else if ( node.type === 'book' || node.type === 'archive-book-pdf' || node.type === 'archive-book-html' ){
          icon = '<span class="icon"><i class="fa-solid fa-book-open">';
        }
        else if ( node.type === 'archive' ){
          icon = '<span class="icon"><i class="fa-solid fa-archive"></i></span>';
        }
        else if ( node.type === 'websearch' ){
          icon = '<span class="icon"><i class="fa-brands fa-searchengin"></i></span>';
        }
        else if ( node.type === 'compare' ){
          icon = '<span class="icon"><i class="fa-solid fa-equals"></i></span>';
        }
        else {
          icon = '<span class="icon"><i class="fa-solid fa-link"></i></span>';
        }

        $li.find('.jqtree-title').before('<div class="bookmark-row">');

        $li.find('.jqtree-title').after(node.custom_b);

        $li.attr( 'tabindex' , '0');

        if ( node.id === 1 ){ // never show removal-button on root node
          // skip root node
        }
        else { // construct bookmark-element and its action-buttons

          let explore_button = '';

          if ( node.type === 'wikipedia' ){ // for wikipedia-bookmark add an explore-button

            explore_button = '<a href="javascript:void(0)" aria-label="exploreBookmark" title="explore bookmark" onclick="exploreBookmark( event, &quot;' + node.id + '&quot;)" class="bookmark-explore" data-node-id="'+ node.id +'"><span class="icon"><i class="fa-solid fa-retweet"></i></span></a> ';
  
          }

          $li.find('.jqtree-title.jqtree_common ').prepend( explore_button +  icon + '&nbsp;&nbsp;' );
          $li.find('.jqtree-element').append( '&nbsp;<a href="javascript:void(0)" aria-label="removeBookmark" title="remove bookmark" onclick="removeBookmark( event, &quot;' + node.id + '&quot;)" class="bookmark-remove" data-node-id="'+ node.id +'"><span class="icon"><i class="fa-solid fa-trash-alt"></i></span></a> ');
        }

        $li.find('b').after(node.custom_i + '</div>');
        $li.attr('id', node.id);
        $li.attr('data-type', node.type);
        $li.attr('title', node.display );

        $li.keypress(function(e){

          // FIXME
          if( e.which === 13 ){
            console.log('bookmark ENTER keypress');
            $li.click();
          }

        });

      }

    });

    t.bind(
      'tree.move',
      function(event) {
        event.preventDefault();
        event.move_info.do_move();
        (async () => { await explore.db.set('bookmarks', $('#tree').tree('toJson') ); })();
      }
    );

    // initially collapse all nodes
    //const $tree = $('#tree');

    //$('#collapse').click(function() {
      let tree = t.tree('getTree');
      tree.iterate(function(node) {

        if (node.hasChildren()) {
          t.tree('closeNode', node, true);
        }
        return true;
      });
    //});

  })();

  // bind left-mouse click 
  t.on( 'tree.click', function(event) { openBookmark( event, false ) } );

  // bind middle-mouse click
  t.on("auxclick", (event) => {

    if ( event.button === 1) {

      const node = t.tree("getNodeByHtmlElement", event.target);

      if (node) {

        event.node = node;

        openBookmark( event, true );

      }

    }

  });

  // TODO: bind right-mouse click
  //$('#tree').on( 'tree.contextmenu', function(event) { openBookmark( event, true ) } );

}

function openBookmark( event, newtab ) {

  let node = event.node; // clicked node

  // items can be:
  //		URL (new handleClick type?) --> IF its an iframe-safe URL: load this URL in the iframe 
  //		                            --> ELSE: load this URL in a new tab 
  //  	string											--> construct: type, title, language 

  // detect bookmark type

  let pattern = /^((http|https):\/\/)/;

  setLanguage ( node.language );

  if ( pattern.test(node.url) ) { // check if datatype "url"

    if ( newtab ){

      const url = '/explore/' + encodeURIComponent( node.name ) + '?l=' + explore.language + '&t=link&u=' + encodeURIComponent( node.url );

      openInNewTab( url );

    }
    else {

      handleClick({ 
        id        : 'n1-0',
        type      : 'link',
        title     : node.name,
        language  : node.language,
        qid       : '',
        url       : encodeURI( node.url ),
        tag       : '',
        languages : '',
        custom    : '',
        target_pane : 'p1',
      });

    }

  }
  else { // wikipedia title-string

    if ( newtab ){

      const url = '/explore/' + encodeURIComponent( node.name ) + '?l=' + explore.language + '&t=wikipedia' + '#' + explore.hash;

      openInNewTab( url );

    }
    else {

      handleClick({ 
        id          : 'n1-0',
        type        : 'wikipedia',
        title       : node.name,
        language    : node.language,
        qid         : '',
        url         : '',
        tag         : '',
        languages   : '',
        custom      : '',
        target_pane : 'p1',
      });

    }

  }

}

function updateActiveDatasources(){

  explore.datasources = []; // reset

  Object.keys( datasources ).forEach(( key, index ) => {

    let d = datasources[key];

    if ( d.active ){

      explore.datasources.push( key );

    }

  });

}

function setupOptionActiveDatasources(){

  let html    = '';
  let checked = '';

  Object.keys( datasources ).forEach(( key, index ) => {

    let d = datasources[key];

    if ( d.active ){

      checked = 'checked';

    }
    else {

      checked   = '';

    }

    html += `
      <div id="datasource-setting-${key}" class="switch">
        <label>
          <input type="checkbox" ${checked} id="datasource-${key}" onclick="console.log( toggleDatasource( &quot;${key}&quot;) )">
          <span class="lever"></span>
          <span id="datasource-name">${d.name}</span>
        </label>
      </div>`;

  });

  $('#datasources-setting').html( html );

}

async function toggleDatasource( source ) {

  if ( valid( datasources[ source ]) ){

    datasources[ source ].active = $( '#datasource-' + source ).prop("checked");

  }

  updateActiveDatasources();

}

async function fetchAutocompleteData( term ) {

  term = cleanText( term );

  let autocomplete_fetches = [];

  $.each( explore.datasources, function( index, source ){ // for each active datasource

    let d = datasources[ source ];

    if ( valid( d.autocomplete_active ) ){ // active autocomplete

      autocomplete_fetches.push( $.ajax({

        url:      eval(`\`${ d.autocomplete_url }\``),
        dataType: d.autocomplete_connect,
        success:  function( data ) { },

      }) );

    }
    else { // disabled autocomplete: use a dummy promise query

      autocomplete_fetches.push( Promise.resolve([]) );

    }

  });

  // TODO: make this promise-handing dynamic (like was done with the result-data-fetching)

  let res     = '';
  let dataset = [];

  [ ...res ] = await Promise.all( autocomplete_fetches );

  res.forEach(( r, index ) => {

    //console.log( 'autocomplete: ', r );

    // FIXME: how to solve this source-mapping + post-data-processing properly?
    if ( Array.isArray( r ) ){ // assume wikipedia (for now)

      r = r[1];

      dataset.push( r );

    }
    else { // assume wikidata (for now)

      let json	= [];
      let wd		= [];

      if ( valid( r.results ) ){

        json = r.results.bindings;

        json.forEach(( v ) => {

          if ( valid( v.itemLabel.value ) ){

            wd.push( v.itemLabel.value );

          }

        });

        dataset.push( [...new Set( wd )] ); // use only the unique values

      }

    }

  });

  // merge results
  let union = [...new Set( dataset.flat(1) )] // flatten and get the unique values

  //console.log( 'autocomplete union: ', union );

  return union;

}

function setupSearch() {

	// TODO is this more efficient?: https://stackoverflow.com/questions/8748559/how-does-jqueryui-autocomplete-handle-asynchronous-results

  $('#srsearch, a.submitSearch').keypress(function(event) {

      explore.searchmode = 'wikipedia';

      if (event.which == 13) { // ENTER-key

          event.preventDefault();

          explore.topic_cursor = 'n1-1';

          // reset any structured-search query-data
          explore.query     = '';
          explore.hash      = '';
          explore.commands  = '';

          explore.type  = 'wikipedia'; // set to default type

          if ( explore.q.charAt(0) === '!' ){ // form-query-command

            if ( explore.q.startsWith( '!graph' ) ){ 
              console.log('graph query detected');
            }

          }

          if ( explore.isMobile ){

            explore.preventSliding = true;
          }

          $('.submitSearch').click();

          // TODO always close autocomplete-result upon ENTER
          $('.searchbox').autocomplete('close');

          // go to the results tab
          explore.tabsInstance.select('tab-topics');
      }

  });

  // jQueryUI autocomplete: http://api.jqueryui.com/autocomplete/
  //  bug on iOS? https://forum.jquery.com/topic/jqueryui-dialog-closes-immediately
  //  Wikipedia opensearch API: https://www.mediawiki.org/wiki/API:Opensearch
  $('.searchbox').autocomplete({

    source: function(request, response) {

			fetchAutocompleteData( request.term ).then(( union ) => {

        response( union ); // return the final autocomplete results

			}).catch(error => {

				console.log('some request failed: ', request, error );

			});

    },

    search: function( event, ui ){

      if ( getSearchValue().charAt(0) === '!' ){ // structured form-query

        $('.searchbox').autocomplete('close');

        // skip normal json-results-fetch
        event.preventDefault();

      }

    }

    // TODO
    /*
    // custom item rendering:
    //  https://api.jqueryui.com/autocomplete/#method-_renderItem
    //  https://stackoverflow.com/questions/15664964/jquery-autocomplete-renderitem
    _renderItem: function( ul, item ) {
      return $( "<li>" )
        .attr( "data-value", item.value )
        .append( item.label )
        .appendTo( ul );
    },
    */

  });


  $('.searchbox').on( 'autocompleteselect', function( event, ui ){

    $('#pager').hide();

    // trigger input-search change
    $('#srsearch').val( ui.item.label );
    explore.q = getSearchValue();

    // reset any structured-search query-data
    explore.query     = '';
    explore.commands  = '';

    explore.type  = 'wikipedia'; // set default type

    // discern user-click from synthetic-click
    if ( event.hasOwnProperty('originalEvent') ){ // user-click

      explore.hash = ''; // reset hash

      if ( explore.isMobile ){

        explore.preventSliding = true; // for mobile: stay on search-results page

      }

    }
    else if ( explore.isMobile && explore.isSafari ){ // HACK: iOS Safari does not support synthetic-click detection, so dont slide

      explore.preventSliding = true; // for mobile: stay on search-results page

    }

    // trigger submit
    $('.submitSearch').trigger('click');

    // goto to results tab
    explore.tabsInstance.select('tab-topics');

  });

  document.getElementById('srsearch').addEventListener("dragover", function(event) {

    event.preventDefault();

    $('#srsearch').val('');

  });

  $('#srsearch').on( 'drop', function(event) {

    //$('.searchbox').autocomplete( 'disable' );
    event.target.style.border = 'none';
    event.target.style.borderBottom = '1px solid #9e9e9e';

    // TODO: unable to get the "event.target" string
    //console.log( event.target );

    explore.type = 'wikipedia';

    const q = getSearchValue( );

 		//if ( q.startsWith( 'https://' ) || q.startsWith( 'http://' ) ){ // remove 'dropped' URL-string-text
		//	q = decodeURIComponent( q.substring( q.lastIndexOf('/') + 1) ).replace(/_/g, ' ');
    //}

		$('#srsearch').val( q );
    explore.q = $('#srsearch').val();

    explore.tabsInstance.select('tab-topics');
    $('#tab-topics .overflow-container').scrollTop(0);

  });

  $('a.submitSearch').on( 'click', function (e) {

    explore.searchmode = 'wikipedia';

    // discern user-click from synthetic-click
    if ( e.hasOwnProperty('originalEvent') ){ // user-click

      // reset any structured-search query-data
      explore.query     = '';
      explore.hash      = '';
      explore.commands  = '';

      if ( explore.isMobile ){

        explore.preventSliding = true; // for mobile: stay on search-results page

      }

      // go to the results tab
      explore.tabsInstance.select('tab-topics');

    }
    else if ( explore.isMobile && explore.isSafari ){ // iOS Safari does not support synthetic-click detection, so dont slide

      explore.preventSliding = true; // for mobile: stay on search-results page

    }

    // reset any structured-search query-data
    explore.query     = '';
    explore.commands  = '';

    e.preventDefault();

    let q = getSearchValue();

    explore.page = 1;       // reset page position
    explore.wallpaper = ''; // reset wallpaper

    if ( explore.q.charAt(0) === '!' ){ // structured form-query

      let s = explore.q.substring(1);
      console.log( 'structured form-query submit: ', s );

    }

    $('#pager').hide();

    explore.q = q;

 		if ( explore.q.startsWith( 'https://' ) || explore.q.startsWith( 'http://' ) ){ // remove 'dropped' URL-string-text
			explore.q = decodeURIComponent( explore.q.substring( explore.q.lastIndexOf('/') + 1) ).replace(/_/g, ' ');

			$('#srsearch').val( explore.q );
		}

    // reset some query-dependent fields

    // make wikipedia the base type (we can override later)
    if ( explore.type === '' && explore.page === 1 ){
      explore.type = 'wikipedia';
    }

    // only use custom type on firstAction visits
    if ( ! explore.firstAction ){
      explore.type = 'wikipedia';
    }

    if ( explore.q ) {

      if ( explore.q.charAt(0) === '!' ){ // show command search query results

        if ( explore.q.startsWith( '!graph' ) ){ // graph command

          explore.q = explore.q.trim().charAt(0).toUpperCase() + explore.q.slice(1);

          const url = explore.base + '/app/xrgraph/?function=' + explore.q.replace( '!graph ', '' ).replace('=','%3D');

          handleClick({ 
            id        : 'n1-0',
            type      : 'link',
            title     : explore.q,
            language  : explore.language,
            qid       : '',
            url       : encodeURI( url ),
            tag       : '',
            languages : '',
            custom    : '',
            target_pane : 'p1',
          });

        }

      }
      else { // normal query results

        // TODO: verify this is URL update is correct in all cases
        updatePushState( explore.q, 'add' );

        refreshArticles(); // render the list of sidebar-topics

      }

    }
    else {

      explore.type = '';

      setDefaultDisplaySettings();

    }

  });

  $('a.link.clear').on( 'click', function (e) {

    e.preventDefault();
    $('#srsearch').val('');
    $('#srsearch').focus();

  });

  $('a.link.compare').on( 'click', function (e) {

    e.preventDefault();

    explore.custom = explore.compares;

    if ( explore.compares.length >= 2 ){

      handleClick({ 
        id        : 'n1-0',
        type      : 'compare',
        title     : explore.q.trim(),
        language  : explore.language,
        qid       : '',
        url       : '',
        tag       : '',
        languages : '',
        ids       : explore.compares.join(),
        custom    : '',
        target_pane : 'p1',
      });

      explore.custom = '';

    }
    else {

      $.toast({
        heading: explore.banana.i18n('app-notification-too-few-compare-topics'),
        text: '',
        hideAfter : 10000,
        stack : 1,
        showHideTransition: 'slide',
        icon: 'info'
      })

    }

  });

  if ( explore.page === 1 ){
    $('#previous').css("visibility", "hidden");
  }

}

function setBgmode( ) {

  if ( explore.wallpaper === ''  ){ // no wallpaper set, just use the default background

    return 0;
  }

  if ( explore.bgmode ){

    if ( explore.type === 'wikipedia' || explore.type === 'video' ){
      $( explore.baseframe ).contents().find("body").addClass('wallpaper').trigger('classChange');
      $( explore.baseframe ).contents().find("body").css( 'background-image', 'linear-gradient(to right, rgba(251, 250, 249,0.95), rgba(251, 250, 249,0.80)), url("' + explore.wallpaper + '"', 'important' );
      $( explore.baseframe ).contents().find("aside").css( 'background-color', 'transparent', 'important');
    }

  }
  else {

    $( explore.baseframe ).contents().find("body").removeClass('wallpaper').trigger('classChange');
    $( explore.baseframe ).contents().find("body").css( 'background', '#fbfaf9', 'important');
    $( explore.baseframe ).contents().find("body").css( 'background-image', 'none', 'important');
    $( explore.baseframe ).contents().find("aside").css( 'background-color', 'inherit', 'important');

  }

}


function setupOptionBgmode() {

  (async () => {

    explore.bgmode = await explore.db.get('bgmode');
    explore.bgmode = ( explore.bgmode === null || explore.bgmode === 'false' ) ? false : true;

    if ( explore.bgmode ){
      $('#bgmode').prop('checked', true);
    }
    else {
      $('#bgmode').prop('checked', false);
    }

    setBgmode();

    $('#bgmode').change(function() {

      if ( $('#bgmode').prop('checked') ){

        (async () => { await explore.db.set('bgmode', true); })();
        explore.bgmode = true;
        setBgmode();

      }
      else {

        (async () => { await explore.db.set('bgmode', false); })();
        explore.bgmode = false;
        setBgmode();

      }

    })

  })();

}

function setDarkmode() {

  // also check user preference for darkmode
  if ( explore.darkmode ){
    $('#darkmode').prop('checked', true);
  }
  else {
    $('#darkmode').prop('checked', false);
  }

  if ( explore.darkmode ){
    $('body').addClass('dark');
    $( explore.baseframe ).contents().find("body").addClass('dark').trigger('classChange');

    $('#infoframeSplit1').contents().find("body").addClass('dark').trigger('classChange');
    $('#infoframeSplit2').contents().find("body").addClass('dark').trigger('classChange');

    // TODO: also go into the sub-iframes of #infoframeSplit2

  }
  else {
    $('body').removeClass('dark');
    $( explore.baseframe ).contents().find("body").removeClass('dark').trigger('classChange');

    $('#infoframeSplit1').contents().find("body").removeClass('dark').trigger('classChange');
    $('#infoframeSplit2').contents().find("body").removeClass('dark').trigger('classChange');

    // TODO: also go into the sub-iframes of #infoframeSplit2
  }

}


function setupOptionDarkmode() {

  (async () => {

    explore.darkmode = await explore.db.get('darkmode');

    let prefersDarkMode   = '';
    let darkmode_was_set  = false;

    darkmode_was_set = ( explore.darkmode === null ) ? false : true;

    if ( !darkmode_was_set ){ // no darkmode was set previously

      // follow prefersDarkmode
      prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;

      if ( prefersDarkMode ) {
        explore.darkmode = true;
      }

    }
    else { // use the set darkmode

        explore.darkmode = ( explore.darkmode === null || explore.darkmode === 'false' ) ? false : true;

    }

    setDarkmode();

    $('#darkmode').change(function() {

      if ( $('#darkmode').prop('checked') ){

        (async () => { await explore.db.set('darkmode', true); })();
        explore.darkmode = true;
        setDarkmode();

      }
      else {

        (async () => { await explore.db.set('darkmode', false); })();
        explore.darkmode = false;
        setDarkmode();

      }

    })

  })();

}

function setBold() {

  if ( explore.bold ){

    $( explore.baseframe ).contents().find("a.link").css({ 'font-weight': '450'});
    $('#bold').prop('checked', true);
  }
  else {

    $( explore.baseframe ).contents().find("a.link").css({ 'font-weight': 'initial'});
    $('#bold').prop('checked', false);
  }

};

function setupOptionBoldLinks() {

  (async () => {

    explore.bold = await explore.db.get('bold');
    explore.bold = ( explore.bold === 'false' ) ? false : true;

    setBold();

    $('#bold').change(function() {

      if ( $('#bold').prop('checked') ){
        explore.bold = true;
        (async () => { await explore.db.set('bold', true); })();
      }
      else {
        explore.bold = false;
        (async () => { await explore.db.set('bold', false); })();
      }

      setBold();

    })

  })();

}

async function setUnderline() {

  if ( explore.underline ){

    $( explore.baseframe ).contents().find("a").addClass('underline');
    $('#underline').prop('checked', true);
  }
  else {

    $( explore.baseframe ).contents().find("a").removeClass('underline');
    $('#underline').prop('checked', false);
  }

};

function setupOptionUnderlineLinks() {

  (async () => {

    explore.underline = await explore.db.get('underline');
    explore.underline = ( explore.underline === 'false' ) ? false : true;

    setUnderline();

    $('#underline').change(function() {

      if ( $('#underline').prop('checked') ){
        explore.underline = true;
        (async () => { await explore.db.set('underline', true); })();
      }
      else {
        explore.underline = false;
        (async () => { await explore.db.set('underline', false); })();
      }

      setUnderline();

    })

  })();

}

function setLinkPreview() {

  if ( explore.linkpreview ){

    $('#linkpreview').prop('checked', true);

  }
  else {

    $('#linkpreview').prop('checked', false);

  }

};

function setupOptionLinkPreview(){

  (async () => {

    explore.linkpreview = await explore.db.get('linkpreview');
    explore.linkpreview = ( explore.linkpreview === null || explore.linkpreview === 'false' ) ? false : true;

    setLinkPreview();

    $('#linkpreview').change(function() {

      if ( $('#linkpreview').prop('checked') ){
        explore.linkpreview = true;
        (async () => { await explore.db.set('linkpreview', true); })();
      }
      else {
        explore.linkpreview = false;
        (async () => { await explore.db.set('linkpreview', false); })();
        console.log('linkpreview set to false');
      }

      setLinkPreview();

    })

  })();

}

function setMulticolumn() {

  if ( explore.multicolumn ){

    $( explore.baseframe ).contents().find('p').css({ 'column-count': '2', 'text-align' : 'unset' });

    $( explore.baseframe ).contents().find('main').css({ 'max-width': 'initial'});
    $('#multicolumn').prop('checked', true);

  }
  else {

    $( explore.baseframe ).contents().find('p').css({ 'column-count': '', 'text-align' : 'justify' });

    $('#multicolumn').prop('checked', false);

  }

};

function setupOptionMulticolumn() {

  (async () => {

    explore.multicolumn = await explore.db.get('multicolumn');
    explore.multicolumn = ( explore.multicolumn === null || explore.multicolumn === 'false' ) ? false : true;

    setMulticolumn();

    $('#multicolumn').change( function() {

      if ( $('#multicolumn').prop('checked') ){
        explore.multicolumn = true;
        (async () => { await explore.db.set('multicolumn', true); })();
      }
      else {
        explore.multicolumn = false;
        (async () => { await explore.db.set('multicolumn', false); })();
      }

      setMulticolumn();

    })

  })();

}

function setupLanguage() {

  let fallback_language = 'en';
  let fallback_voice_code = 'en-GB';

  let sync_locale_with_language = false; 

  // determine locale
  if ( !valid( explore.locale ) && !valid( explore.locale_param ) ){ // no locale defined yet

    // no locale was given, use browser preference if available
    let locale = window.navigator.language;

    if ( valid( locale ) ){ // we have a browser-locale

      fallback_language  = locale.split('-')[0];

      explore.locale = fallback_language;
      fallback_voice_code = locale;

    }
    else { // no locale

      explore.locale = fallback_language;

    }

    sync_locale_with_language = true;

  }

  //console.log('locale: ', explore.locale );

  // something went wrong, use the default locale
  if ( explore.locale === null || ! explore.locales.includes( explore.locale ) ){

    explore.locale    = 'en';
    fallback_language = 'en';

  }

  // determine editor-commands
  if ( explore.commands_param !== undefined ){

    explore.commands = decodeURIComponent( explore.commands_param ).replace('“', '"').replace('”','"');
    //explore.commands = unpackString( explore.commands_param );

  }

  // determine structured-search query
  if ( explore.query_param !== undefined ){

    explore.query = explore.query_param;

  }

  // determine language
  if ( !valid( explore.language ) && !valid( explore.language_param ) ){ // no language

    explore.language = window.language = fallback_language; // use fallback-language 'en'
    explore.voice_code = fallback_voice_code;

  }
  else if ( explore.language_param !== undefined ){

    for ( const [ code , langobj ] of Object.entries( explore.wp_languages ) ) {

      // verify language-code correctness
      if ( explore.language_param === code ){

        explore.language = window.language = explore.language_param;

				if ( explore.voice_code_selected.startsWith( explore.language ) ){

					explore.voice_code = explore.voice_code_selected;

				} 
				else {

        	explore.voice_code = langobj.voice || fallback_voice_code;

				}

        explore.language_script           = langobj.script;
        explore.language_name             = langobj.name;
        explore.language_name_capitalized = capitalizeFirstLetter( explore.language_name );
        explore.lang_current_events_page  = langobj.articles.current_events;

        setLanguageDirection();

        (async () => { await explore.db.set('language', explore.language ); })();

        break;

      }
      else {

        explore.language = window.language = fallback_language; // no language match found: fallback to default
        explore.voice_code = fallback_voice_code;

      }

    }

    updateLocaleNative();

  }

  // if the locale was set initially, but is unmatched against the current language -> sync the locale to the language
  if ( sync_locale_with_language && explore.locale !== explore.language ){
    explore.locale = explore.language;
  }

  if ( ! explore.locales.includes( explore.locale ) ){

    explore.locale = 'en';

  }

  // update locale
  updateLocale( explore.locale );

  explore.lang3 = getLangCode3( explore.language ); // used by Open Library and Archive.org

  const language_name = ( explore.language === 'en') ? 'English' : explore.language;

  afterLanguageUpdate();

  // setup "Universal Language Selector" (ULS)
  // 	https://github.com/wikimedia/jquery.uls
  // 	https://www.mediawiki.org/wiki/Universal_Language_Selector
  $( '.uls-trigger' ).uls( {

    top: '10px', 

    onSelect: function( l ) {

      (async () => { await explore.db.set('language', l ); })();

      explore.language    = window.language = l;
      explore.lang3       = getLangCode3( explore.language );

      explore.voice_code  = getVoiceCode( explore.language );

      let languageName    = $.uls.data.getAutonym( l );

      $( '.uls-trigger' ).html( '<span class="icon"><i class="fa-solid fa-caret-right"></i></span> &nbsp; ' + getNamefromLangCode2( explore.language ) );

      $('.submitSearch').click(); // do submit

			reloadVoices(); // update voices list after language change

      afterLanguageUpdate();

    },

    languages: explore.uls_languages,

    //showRegions: [ 'WW', 'AM', 'EU', 'ME', 'AF', 'AS', 'PA' ],

  });

  $( '.uls-trigger' ).click( function () {

    $( '.uls-menu' ).addClass( 'uls-mobile' ).css( 'left', '2.5%' );

  });


  // locale configuration option change-event-listener
  $('#locale').change(function() {

    explore.locale = $(this).val();
    (async () => { await explore.db.set('locale', $(this).val() ); })();

    updateLocale( explore.locale );

  })

	// TTS voice option handling
	if ('speechSynthesis' in window) {

		explore.tts_enabled = true;

	  reloadVoices(); // needed for Firefox

    window.speechSynthesis.onvoiceschanged = () =>{ // needed for Chromium-browsers

      reloadVoices();

    };

  }
	else {

		explore.tts_enabled = false;

	}

  $('#voices').change(function(){

		explore.voice_code_selected = explore.voice_code = $(this).val();

    (async () => { await explore.db.set('voice_code_selected', explore.voice_code_selected ); })();

    // also update the voice-code of any open Wikikipedia-app-pane
    updateValueInPanes( 'voice_code', explore.voice_code_selected );

  });

  // change voice-rate
	$('#voice-rate').on('input', function () {

		explore.voice_rate = $(this).val();

    $('#voicerate').text( explore.voice_rate );

    (async () => { await explore.db.set( 'voice_rate', explore.voice_rate ); })();

    updateValueInPanes( 'voice_rate', explore.voice_rate );

	});

  // check for user voice-rate
  (async () => {

    explore.voice_rate = await explore.db.get('voice_rate');

    explore.voice_rate = ( explore.voice_rate === null || explore.voice_rate === '' ) ? 1.00 : explore.voice_rate;

    $('#voicerate').text( explore.voice_rate );
    $('#voice-rate').val(  explore.voice_rate );

  })();

  // change voice-pitch
	$('#voice-pitch').on('input', function () {

		explore.voice_pitch = $(this).val();

    $('#voicepitch').text( explore.voice_pitch );

    (async () => { await explore.db.set( 'voice_pitch', explore.voice_pitch ); })();

    updateValueInPanes( 'voice_pitch', explore.voice_pitch );

	});

  // check for user voice-pitch
  (async () => {

    explore.voice_pitch = await explore.db.get('voice_pitch');

    explore.voice_pitch = ( explore.voice_pitch === null || explore.voice_pitch === '' ) ? 1.00 : explore.voice_pitch;

    $('#voicepitch').text( explore.voice_pitch );
    $('#voice-pitch').val(  explore.voice_pitch );

  })();

}

async function updateValueInPanes( name, value ){

  // also update the voice-code of any open Wikikipedia-app-pane
  let iframeEl = '';

  if ( document.getElementById('infoframeSplit2') === null ){ // single-content-frame

    iframeEl = document.getElementById( 'infoframe' );

  }
  else { // dual-content-frame

    iframeEl = document.getElementById( 'infoframeSplit2' );

  }

  if ( valid( iframeEl ) ){

    iframeEl.contentWindow.postMessage( { event_id: 'set-value', data: [ name, value ] }, '*' );

  }

}


function updateLocale( l ){ // set from user-locale

    explore.banana.setLocale( l );

    if ( l === 'simple' ){

      l = 'en';

    }

    if ( explore.locales.includes( l ) ){

      explore.locale = l;

      fetch(explore.base + '/app/explore2/assets/i18n/conzept-' + explore.banana.locale + '.json?' + explore.version ).then((response) => response.json()).then((messages) => {

        explore.banana.load( messages, explore.banana.locale)
        updateLocaleInterface();

        $('#locale').find('option[value="' + explore.locale + '"]').prop('selected', true);
        $('#locale').formSelect();

      });

    }

}

function updateLocaleNative( ){ // set from language

    let l = explore.language;

    if ( l === 'simple' ){

      l = 'en';

    }

    explore.banana_native.setLocale( l );

    if ( explore.locales.includes( l ) ){

      fetch(explore.base + '/app/explore2/assets/i18n/conzept-' + l + '.json?' + explore.version ).then((response) => response.json()).then((messages) => {

        explore.banana_native.load( messages, l );

      });

    }

}

async function updateLocaleInterface(){

  // search-input-placeholder
  const placeholder = explore.banana.i18n('app-search-placeholder') || 'search';
  $('#srsearch').attr('placeholder', placeholder );

  // tab-titles
  $('#app-tab-topics-title').text( explore.banana.i18n('app-tab-topics-title') );
  $('#app-tab-list-title').text( explore.banana.i18n('app-tab-list-title') );
  $('#app-tab-bookmarks-title').text( explore.banana.i18n('app-tab-bookmarks-title') );
  $('#app-tab-tools-title').text( explore.banana.i18n('app-tab-tools-title') );
  $('#app-tab-settings-title').text( explore.banana.i18n('app-tab-settings-title') );
  $('#app-tab-help-title').text( explore.banana.i18n('app-tab-help-title') );
  $('#app-tab-audio-chat-title').text( explore.banana.i18n('app-tab-audio-chat-title') );

  // menus
  $('#app-menu-actions').html( explore.banana.i18n('app-menu-actions') );
  $('#app-menu-background-audio').html( explore.banana.i18n('app-menu-background-audio') );
  $('#app-menu-background-midi').html( explore.banana.i18n('app-menu-background-midi') );
  $('#app-menu-topic-lists').html( explore.banana.i18n('app-menu-topic-lists') );
  $('#app-menu-various-links').html( explore.banana.i18n('app-menu-various-links') );
  $('#app-menu-font').html( explore.banana.i18n('app-menu-font') );
  $('#app-menu-theme').html( explore.banana.i18n('app-menu-theme') );
  $('#app-menu-interface-language').html( explore.banana.i18n('app-menu-interface-language') );
  $('#app-menu-voice').html( explore.banana.i18n('app-menu-voice') );
  $('#app-menu-user-manual').html( explore.banana.i18n('app-menu-user-manual') );
  $('#app-menu-keyboard-shortcuts').html( explore.banana.i18n('app-menu-keyboard-shortcuts') );
  $('#app-menu-credits').html( explore.banana.i18n('app-menu-credits') );
  $('#app-menu-license').html( explore.banana.i18n('app-menu-license') );
  $('#app-menu-about').html( explore.banana.i18n('app-menu-about') );

  $('#app-menu-random-topic').html( explore.banana.i18n('app-menu-random-topic') );
  $('#app-menu-compare-topics').html( explore.banana.i18n('app-menu-compare-topics') );
  $('#app-menu-toggle-fullscreen').html( explore.banana.i18n('app-menu-toggle-fullscreen') );
  $('#app-menu-bookmark-current-url').html( explore.banana.i18n('app-menu-bookmark-current-url') );
  $('#app-menu-clone-tab').html( explore.banana.i18n('app-menu-clone-tab') );
  $('#app-menu-plant-identification').html( explore.banana.i18n('app-menu-plant-identification') );
  $('#app-menu-text-identification').html( explore.banana.i18n('app-menu-text-identification') );
  $('#app-menu-digital-libraries').html( explore.banana.i18n('app-menu-digital-libraries') );
  $('#app-menu-geography').html( explore.banana.i18n('app-menu-geography') );
  $('#app-menu-version').html( explore.banana.i18n('app-menu-version') );
  $('#app-menu-made-by').html( explore.banana.i18n('app-menu-made-by') );
  $('#app-menu-all-rights-reserved').html( explore.banana.i18n('app-menu-all-rights-reserved') );
  $('#app-menu-font-type').html( explore.banana.i18n('app-menu-font-type') );
  $('#app-menu-font-size').html( explore.banana.i18n('app-menu-font-size') );
  $('#app-menu-darkmode').html( explore.banana.i18n('app-menu-darkmode') );
  $('#app-menu-link-preview').html( explore.banana.i18n('app-menu-link-preview') );
  $('#app-menu-color-filter').html( explore.banana.i18n('app-menu-color-filter') );
  $('#app-menu-locale').html( explore.banana.i18n('app-menu-locale') );
  $('#app-menu-style').html( explore.banana.i18n('app-menu-style') );
  $('#app-menu-speed').html( explore.banana.i18n('app-menu-speed') );
  $('#app-menu-pitch').html( explore.banana.i18n('app-menu-pitch') );
  $('#app-menu-fullscreen-active-pane').html( explore.banana.i18n('app-menu-fullscreen-active-pane') );
  $('#app-menu-toggle-sidebar').html( explore.banana.i18n('app-menu-toggle-sidebar') );
  $('#app-menu-add-bookmark').html( explore.banana.i18n('app-menu-add-bookmark') );
  $('#app-menu-random-topic-key').html( explore.banana.i18n('app-menu-random-topic-key') );
  $('#app-menu-note-1').html( explore.banana.i18n('app-menu-note-1') );

  $('#app-menu-goto-next-topic').html( explore.banana.i18n('app-menu-goto-next-topic') );
  $('#app-menu-goto-previous-topic').html( explore.banana.i18n('app-menu-goto-previous-topic') );
  $('#app-menu-goto-next-pane').html( explore.banana.i18n('app-menu-goto-next-pane') );
  $('#app-menu-goto-previous-pane').html( explore.banana.i18n('app-menu-goto-previous-pane') );
  $('#app-menu-new-search').html( explore.banana.i18n('app-menu-new-search') );

  $('#app-menu-cover-topic').text( explore.banana.i18n('app-menu-cover-topic') );
  $('#app-menu-culture').text( explore.banana.i18n('app-menu-culture') );
  $('#app-menu-nature').text( explore.banana.i18n('app-menu-nature') );
  $('#app-menu-license').text( explore.banana.i18n('app-menu-license') );
  $('#app-menu-persona').text( explore.banana.i18n('app-menu-persona') );
  $('#app-menu-country').text( explore.banana.i18n('app-menu-country') );

  $('#app-menu-all-rights-reserved').text( explore.banana.i18n('app-menu-all-rights-reserved') );
  $('#app-menu-interests').text( explore.banana.i18n('app-menu-interests') );
  $('#app-menu-country-select').text( explore.banana.i18n('app-menu-country-select') );
  $('#app-menu-command-editor').text( explore.banana.i18n('app-menu-command-editor') );
  $('#app-menu-run-code').text( explore.banana.i18n('app-menu-run-code') );
  $('#app-menu-clear-editor').text( explore.banana.i18n('app-menu-clear-editor') );
  $('#app-menu-presentation').text( explore.banana.i18n('app-menu-presentation') );
  $('#app-menu-editor').text( explore.banana.i18n('app-menu-editor') );

  $('#app-guide-string-search').text( explore.banana.i18n('app-guide-string-search') );

  // welcome view
  $('#app-guide-welcome-text').html( explore.banana.i18n('app-guide-welcome-text') );
  $('#app-guide-featured-article').text( explore.banana.i18n('app-guide-featured-article') );
  $('#app-guide-featured-portal').text( explore.banana.i18n('app-guide-featured-portal') );
  $('#app-guide-continent').text( explore.banana.i18n('app-guide-continent') );
  $('#app-guide-bioregion').text( explore.banana.i18n('app-guide-bioregion') );
  $('#app-guide-mountain-range').text( explore.banana.i18n('app-guide-mountain-range') );
  $('#app-guide-disease').text( explore.banana.i18n('app-guide-disease') );
  $('#app-guide-organism').text( explore.banana.i18n('app-guide-organism') );
  $('#app-guide-protein').text( explore.banana.i18n('app-guide-protein') );
  $('#app-guide-atom').text( explore.banana.i18n('app-guide-atom') );
  $('#app-guide-protist').text( explore.banana.i18n('app-guide-protist') );
  $('#app-guide-help').text( explore.banana.i18n('app-guide-help') );
  $('#app-guide-sea').text( explore.banana.i18n('app-guide-sea') );

  $('#app-guide-news').text( explore.banana.i18n('app-guide-news') );
  $('#app-guide-topic').text( explore.banana.i18n('app-guide-topic') );
  $('#app-guide-artwork').text( explore.banana.i18n('app-guide-artwork') );
  $('#app-guide-music').text( explore.banana.i18n('app-guide-music') );
  $('#app-guide-documentary').text( explore.banana.i18n('app-guide-documentary') );
  $('#app-guide-country').text( explore.banana.i18n('app-guide-country') );
  $('#app-guide-historical-country').text( explore.banana.i18n('app-guide-historical-country') );
  $('#app-guide-ethnic-group').text( explore.banana.i18n('app-guide-ethnic-group') );
  $('#app-guide-language').text( explore.banana.i18n('app-guide-language') );
  $('#app-guide-national-park').text( explore.banana.i18n('app-guide-national-park') );
  $('#app-guide-mammal').text( explore.banana.i18n('app-guide-mammal') );
  $('#app-guide-bird').text( explore.banana.i18n('app-guide-bird') );
  $('#app-guide-reptile').text( explore.banana.i18n('app-guide-reptile') );
  $('#app-guide-fish').text( explore.banana.i18n('app-guide-fish') );
  $('#app-guide-amphibian').text( explore.banana.i18n('app-guide-amphibian') );
  $('#app-guide-insect').text( explore.banana.i18n('app-guide-insect') );
  $('#app-guide-spider').text( explore.banana.i18n('app-guide-spider') );
  $('#app-guide-plant').text( explore.banana.i18n('app-guide-plant') );
  $('#app-guide-algae').text( explore.banana.i18n('app-guide-algae') );
  $('#app-guide-fungus').text( explore.banana.i18n('app-guide-fungus') );
  $('#app-guide-bacterium').text( explore.banana.i18n('app-guide-bacterium') );
  $('#app-guide-virus').text( explore.banana.i18n('app-guide-virus') );
  $('#app-guide-cell-type').text( explore.banana.i18n('app-guide-cell-type') );
  $('#app-guide-archae').text( explore.banana.i18n('app-guide-archae') );

  $('#app-guide-country-map').text( explore.banana.i18n('app-guide-country-map') );
  $('#app-guide-country').text( explore.banana.i18n('app-guide-country') );
  $('#app-guide-capitol').text( explore.banana.i18n('app-guide-capitol') );
  $('#app-guide-form-of-government').text( explore.banana.i18n('app-guide-form-of-government') );
  $('#app-guide-religion').text( explore.banana.i18n('app-guide-religion') );
  $('#app-guide-period').text( explore.banana.i18n('app-guide-period') );
  $('#app-guide-history-aspect').text( explore.banana.i18n('app-guide-history-aspect') );
  $('#app-guide-revolution').text( explore.banana.i18n('app-guide-revolution') );
  $('#app-guide-war').text( explore.banana.i18n('app-guide-war') );
  $('#app-guide-battle').text( explore.banana.i18n('app-guide-battle') );
  $('#app-guide-documentary').text( explore.banana.i18n('app-guide-documentary') );
  $('#app-guide-documentary-title').text( explore.banana.i18n('app-guide-documentary-title') );
  $('#app-guide-film-title').text( explore.banana.i18n('app-guide-film-title') );
  $('#app-guide-art-movement').text( explore.banana.i18n('app-guide-art-movement') );
  $('#app-guide-composer').text( explore.banana.i18n('app-guide-composer') );
  $('#app-guide-painter').text( explore.banana.i18n('app-guide-painter') );
  $('#app-guide-poet').text( explore.banana.i18n('app-guide-poet') );
  $('#app-guide-philosopher').text( explore.banana.i18n('app-guide-philosopher') );
  $('#app-guide-architect').text( explore.banana.i18n('app-guide-architect') );
  $('#app-guide-inventor').text( explore.banana.i18n('app-guide-inventor') );
  $('#app-guide-software').text( explore.banana.i18n('app-guide-software') );
  $('#app-guide-mathematics').text( explore.banana.i18n('app-guide-mathematics') );
  $('#app-guide-tourist-attraction').text( explore.banana.i18n('app-guide-tourist-attraction') );
  $('#app-guide-dish').text( explore.banana.i18n('app-guide-dish') );

  // other elements
  $('#app-structured-search-title').text( explore.banana.i18n('app-structured-search-title') );
  $('#app-topics-found').text( explore.banana.i18n('app-topics-found') );
  $('#app-guide-see-more').text( explore.banana.i18n('app-guide-see-more') );
  $('#app-guide-page').text( explore.banana.i18n('app-guide-page') );

  // TODO: localize all section-names
  Object.keys( explore.sections ).forEach(( sid ) => {

    let id = 'app-section-' + sid;

    // update all current sections
 		$( '[id=' + id + ']' ).text( explore.banana.i18n( id ) );

    // update future section-html
 		explore.section_dom.find('#' + id ).text( explore.banana.i18n( id ) );

  });

}

async function setPersonas() {

  if ( valid( explore.personas ) ){

    if ( !Array.isArray( explore.personas ) ){ // string

      if ( explore.personas.includes(',') ){ // string with multiple values

        explore.personas = explore.personas.split(',') || [];

      }
      else if ( ! explore.personas.includes('"') ){ // one string

        explore.personas = [ explore.personas ];

      }
      else { // string of an array

        explore.personas = eval( explore.personas ) || [];

      }

    }

    explore.personas.forEach(( v ) => {

      $('#persona-select').find('option[value="' + v + '"]').prop('selected', true);

    });

    $('#persona-select').formSelect();

  }

};


function setupOptionPersonas() {

  (async () => {

    explore.personas = await explore.db.get('personas');
    explore.personas = ( explore.personas === null || explore.personas === '' ) ? [] : explore.personas;

    setPersonas();

    $('#persona-select').change(function() {

      explore.personas = $(this).val();

      (async () => { await explore.db.set('personas', $(this).val() ); })();

      setPersonas();

    })

  })();

}

async function setCountry( country ) {

  console.log( 'setCountry to: ', country );

  explore.country = country.toLowerCase();

	$.each( Object.values( countries ), function( i, c ){

    if ( c.iso2.toLowerCase() === explore.country ){

      explore.country_name = c.name;

    }

  });

  console.log( explore.country );

  (async () => { await explore.db.set('country', explore.country ); })();

  $('#country-select').countrySelect('selectCountry', explore.country);

}

function setupOptionCountry() {

  // see: https://github.com/mrmarkfrench/country-select-js
  $("#country-select").countrySelect({
    //defaultCountry: "jp",
    //onlyCountries: ['us', 'gb', 'ch', 'ca', 'do', 'jp'],
    //preferredCountries: ['ca', 'gb', 'us'],
    responsiveDropdown: true
  });

  (async () => {

    explore.country = await explore.db.get('country');

    if ( explore.country === null  || !valid( explore.country ) ){

      let split = navigator.language.split('-');

      if ( valid( split[1] ) ){

        explore.country = split[1].toLowerCase();

        setCountry( explore.country );

        $('#country-select').change(function(e) {{ 

          console.log( 'country changed' );

          setCountry( $('#country-select').countrySelect('getSelectedCountryData')['iso2']  );

        }});

      }
      else {

        explore.country = '';

      }

    }
    else {
 
      // do nothing

    }

  })();

}

async function setTopicCover() {

  $('#covertopic').find('option[value="' + explore.covertopic + '"]').prop('selected', true);
  $('#covertopic').formSelect();

}

function setupOptionTopicCover(){

  (async () => {

    explore.covertopic = await explore.db.get('covertopic');
    explore.covertopic = ( explore.covertopic === null || explore.covertopic === '' ) ? '' : explore.covertopic;

    setTopicCover();

    $('#covertopic').change(function() {

      explore.covertopic = $(this).val();
      (async () => { await explore.db.set('covertopic', $(this).val() ); })();

      setTopicCover();

    })

  })();

}

async function setColorFilter() {

  if ( explore.colorfilter === 'grayscale' ){
    $('iframe').css({ 'filter': 'grayscale(100)'});
    $('body').css({ 'filter': 'grayscale(100)'});
  }
  else if ( explore.colorfilter === 'sepia' ){
    $('iframe').css({ 'filter': 'sepia(10%)'});
    $('body').css({ 'filter': 'sepia(10%)'});
  }
  else if ( explore.colorfilter === 'invert' ){
    $('iframe').css({ 'filter': 'invert(85%)'});
    $('body').css({ 'filter': 'invert(85%)'});
  }
  else if ( explore.colorfilter === 'reduced-contrast' ){
    $('body').css({ 'filter': 'constrast(80%)'});
  }
  else if ( explore.colorfilter === 'blur' ){
    $('body').css({ 'filter': 'blur(0.3em)'});
  }
  else {
    $('iframe').css({ 'filter': 'none'});
    $('body').css({ 'filter': 'none'});
  }

  $('#colorfilter').find('option[value="' + explore.colorfilter + '"]').prop('selected', true);
  $('#colorfilter').formSelect();

};

function setupOptionColorFilter() {

  (async () => {

    explore.colorfilter = await explore.db.get('colorfilter');
    explore.colorfilter = ( explore.colorfilter === null || explore.colorfilter === '' ) ? '' : explore.colorfilter;

    setColorFilter();

    $('#colorfilter').change(function() {

      explore.colorfilter = $(this).val();
      (async () => { await explore.db.set('colorfilter', $(this).val() ); })();

      setColorFilter();

    })

  })();

}

function setupOptionAutocompleteToggle() {

  (async () => {

    explore.autocomplete = await explore.db.get('autocomplete');

    if ( explore.autocomplete === 'false' ){
      explore.autocomplete = false;
    }
    else {
      explore.autocomplete = true;
    }

    if ( explore.autocomplete ){
      $('#autocompletetoggle').prop('checked', true);
      $('.searchbox').autocomplete( 'enable' );
    }
    else {
      $('#autocompletetoggle').prop('checked', false);
      $('.searchbox').autocomplete( 'disable' );
    }

    $('#autocompletetoggle').change(function() {

      if ( $('#autocompletetoggle').prop('checked') ){
        (async () => { await explore.db.set('autocomplete', true); })();
        explore.autocomplete = true;
        $('.searchbox').autocomplete( 'enable' );
      }
      else {
        (async () => { await explore.db.set('autocomplete', false); })();
        explore.autocomplete = false;
        $('.searchbox').autocomplete( 'disable' );
      }

    })

  })();

}

function setupURL() {

  // URI.js: https://medialize.github.io/URI.js/docs.html
  //				 https://medialize.github.io/URI.js/docs.html#search-set
  explore.url = URI.parse( document.URL );
  //explore.hash = window.location.hash.substring(1) || '';

  // store previous URL state values
  explore.q_prev = explore.q;
  explore.type_prev = explore.type;
  explore.language_prev = explore.language;
  explore.show_sidebar_prev = explore.sidebar;

  explore.q = explore.url.path.split('/')[2] || ''; 
  explore.q = decodeURIComponent( explore.q.trim().replace(/(_|%20)/g, ' ').replace(/%25/g, '%') ).replace(/<\/?("[^"]*"|'[^']*'|[^>])*(>|$)/g, "");

  // handle backward & forward URL requests:
  //   https://developer.mozilla.org/en-US/docs/Web/API/WindowEventHandlers/onpopstate
  $(window).on('popstate', function (e) {

    // set hash if needed
    //let hash = window.location.hash.substring(1) || '';
    explore.hash = explore.hash.replace(/[ %{}|^~\[\]()`"'+<%'&\.\/?:@;=,]/g, '_').toLowerCase();

    // set language 
    explore.language = window.language = getParameterByName('l');

    // set type
    explore.type = getParameterByName('t');

    if ( explore.type === '' || explore.type === undefined ){
      explore.type = 'wikipedia';
    }

    //console.log('moving backwards, type is: ', explore.type );

    // set direct title
    explore.direct = getParameterByName('d');

    if ( explore.direct === true ){
      explore.direct = true;
    }
    else {
      explore.direct = false;
    }

    // set custom data
    explore.custom = getParameterByName('c');

    // FIXME: not yet using this info when going back
    explore.uri = getParameterByName('u');

    // set query-builder data
    explore.query = getParameterByName('query');

    // set editor-commands data
    explore.commands = getParameterByName('commands');
    //explore.commands = unpackString( getParameterByName('commands') );

    // set linemarks
    explore.marks = getParameterByName('m');

    if ( explore.marks === '' || explore.marks === undefined ){
      explore.marks = '';
    }

    setReplaceState();

  });

}

function setReplaceState(){

  // store previous URL state values
  explore.q_prev        = explore.q;
  explore.language_prev = explore.language;

  // get current query string
  let q = window.location.pathname.replace(/\/explore\/?/g, ' ') || ''; 
  q = q.replace(/<\/?("[^"]*"|'[^']*'|[^>])*(>|$)/g, '').replace(/_/g, ' ');

  q = q.replace(/%25/g, '%');
  q = q.replace(/%20/g, ' ');

  explore.q = decodeURIComponent( q ).trim();

  if ( explore.q_prev === explore.q && explore.type_prev === explore.type && explore.language_prev === explore.language && explore.show_sidebar_prev === explore.show_sidebar_prev ){

    // we are on the same URL query (so likely also the same page)

    if ( explore.hash !== '' ){

      // TODO cleanup this duplicate hash-code into a utility function
      const hash_ = explore.hash.replace(/[ %{}|^~\[\]()`"'+<>%'&\.\/?:@;=,]/g, '_').toLowerCase(); // NOTE: sync this replace-line with wikipedia-iframe.js
      const iframeEl = document.getElementById( explore.baseframe );

      if ( iframeEl === null ){
        // no iframe found?
      }
      else {

        iframeEl.contentWindow.location.hash = hash_;

      }
    }

    explore.replaceState = true; // allow any new replace State calls to work

  }
  else { // user-browser went backwards or forwards

    // FIXME: going back and forth is not yet triggering the sidebar toggling
    //if ( explore.show_sidebar_prev !== explore.show_sidebar_prev ){
    //  toggleSidebar();
    //}

    // in this case: prevent the replace State() action to take place (as this would cause a loop)
    explore.replaceState = false;

    let terms = $('#srsearch').val( decodeURIComponent( explore.q ) );

    $('.submitSearch').click();
    //console.log( 'go to page with state: ', explore.q, explore.language, ' type: ', explore.type, ' hash: ', explore.hash );

    explore.replaceState = true;
  }

}

async function sparqlQueryCommand( args, view, list ){

  let conditions = args.toString();
  let sparql_conditions = [];

  let sparql_strings		= [];
  let sparql_filters		= [];

  let sparql_url				= '';

  if ( view === 'sidebar' ){ // wikidata-structured-query URL

    sparql_url  = datasources.wikidata.endpoint + '?format=json&query=SELECT%20DISTINCT%20%3Fitem%20%3FitemLabel%20WHERE%20%7B%0A%20%20SERVICE%20wikibase%3Alabel%20%7B%20bd%3AserviceParam%20wikibase%3Alanguage%20%22' + explore.language + '%22.%20%7D%0A%20%20%3Fitem';

  }
  else { // Qid-fetching URL

    sparql_url  = datasources.wikidata.endpoint + '?format=json&query=SELECT%20DISTINCT%20%3Fitem%20WHERE%20%7B%20%3Fitem';

  }

  let sparql_url_web		= 'https://query.wikidata.org/embed.html#SELECT%20DISTINCT%20%3Fitem%20WHERE%20%7B%20%3Fitem';

  // split conditions by comma
  conditions = conditions.split(',');

  //console.log( 'SPARQL query: ', conditions  );

  conditions.forEach( ( c ) => {

    //console.log( c.split(' ') );

    sparql_conditions.push( c.replace(/\(|\)/g, '' ).split(' ') );

    // [ "P31", "=", "Q146" ]
    // ?item wdt:P31 wd:Q146 .

  });

  sparql_conditions.forEach( ( c, index ) => {

    const comparator = c[1]; // =, >, <

    // assume a qid for c[2] for now!

    if ( comparator === '='){

      // see also: https://www.w3.org/TR/sparql11-property-paths/
      if ( c[0].includes('/') ){ // property path statement (assume just 1-level for now)

        // P31/P279* Q123  ->  wdt:P31/wdt:P279* Q123

        let property_paths  = c[0].split('/');
        let string_         = '';

        property_paths.forEach( ( p ) => {

          string_ += ( '%20wdt%3A' + p + '%2F' );

        });

        // remove last '/'
        string_ = string_.replace(/%2F$/, '');
        string_ += '%20wd%3A' + c[2] + '%3B%0A%20';

        sparql_strings.push( string_ );

      }
      else { // > or < 

        sparql_strings.push( '%20wdt%3A' + c[0] + '%20wd%3A' + encodeURIComponent( c[2] ) + '%3B%0A%20' );

      }

    }
    else {

      //console.log( 'comparator: ', comparator );

      sparql_strings.push( '%20wdt%3A' + c[0] + '%20' + '%3Fns' + index + '%3B%0A%20' );

      // check type of compare-value
      if ( ['P569', 'P570', 'P571', 'P574', 'P575', 'P576', 'P577', 'P578', 'P580', 'P582', 'P585', 'P606', 'P619', 'P620', 'P621', 'P622', 'P729', 'P730', 'P746', 'P813', 'P1191', 'P1249', 'P1317', 'P1319', 'P1326', 'P1619', 'P1636', 'P1734', 'P2031', 'P2032', 'P2285', 'P2310', 'P2311', 'P2669', 'P2754', 'P2913', 'P2960', 'P3893', 'P3999', 'P4566', 'P4602', 'P5017', 'P5204', 'P6949', 'P7103', 'P7104', 'P7124', 'P7125', 'P7295', 'P7588', 'P7589', 'P8554', 'P8555', 'P8556', 'P9052', 'P9448', 'P9667', 'P9905', 'P9946', 'P10135', 'P10673', 'P10786' ].includes( c[0] ) ){ // should be a timestamp

        sparql_filters.push( '%20FILTER(%3Fns' + index + '%20' + encodeURIComponent( comparator ) + '%20%22' + c[2] + '%22%5E%5Exsd%3AdateTime)%20' );

      } 
      else { // number

        sparql_filters.push( '%20FILTER(%3Fns' + index + '%20' + encodeURIComponent( comparator ) + '%20%22' + c[2] + '%22%5E%5Exsd%3Adecimal)%20' );

      }

    }

  })

  sparql_strings.forEach( ( c ) => {

    sparql_url      += c;
    sparql_url_web  += c;

  })

  if ( view === 'sidebar' ){ // show wikidata structured-search results

    // TODO: is an "ORDER BY" useful here?
    //  %20ORDER%20BY%20%3Fitem
    sparql_url      += sparql_filters.join('') + '%7D%20OFFSET%200%20LIMIT%20' + datasources.wikidata.pagesize;
    sparql_url_web  += sparql_filters.join('') + '%7D%20OFFSET%200%20LIMIT%20' + datasources.wikidata.pagesize;

  }
  else {

    sparql_url      += sparql_filters.join('') + '%7D%20LIMIT%20' + explore.sparql_limit;
    sparql_url_web  += sparql_filters.join('') + '%7D%20LIMIT%20' + explore.sparql_limit;

  }

  //console.log( sparql_conditions );
  //console.log( sparql_query );
  //console.log( sparql_strings );
  console.log( sparql_url );
  console.log( sparql_url_web );

  if ( view === 'sidebar' ){ // show wikidata structured-search results

    let query_json = '';

    runQuery( '', sparql_url  );

  }
  else { // execute query (to fetch a list of Qids), then render the Qids as requested

    $.ajax({ // fetch sparql-data

      url: sparql_url,

      // The name of the callback parameter, as specified by the YQL service
      jsonp: "callback",

      // Tell jQuery we're expecting JSONP
      dataType: "json",

      // Work with the response
      success: function( response ) {

        //console.log( response );

        // TODO: check that we have valid results
        let json = response.results.bindings || [];

        if ( typeof json === undefined || typeof json === 'undefined' ){
          $('#blink').hide();
          return 1; // no more results
        }
        else if ( json.length === 0 ) { // no more results
          $('#blink').hide();
          return 0;
        }

        json.forEach(( v ) => {

          //console.log( v );

          list.push( v.item.value.replace( 'http://www.wikidata.org/entity/', '' ) );

        });

        renderShowCommand( view, list );

      },  

    });

  }

}


async function fetchPresentationData( title, language ) {

	// see also: https://dmitripavlutin.com/javascript-fetch-async-await/#5-parallel-fetch-requests
  const [q1Response, q2Response] = await Promise.all([

    fetch( `${base}/app/cors/raw?url=${ encodeURIComponent( "https://${language}.wikipedia.org/w/api.php?action=query&titles=${title}&prop=extlinks&format=json" ) }` ),

  ]);

  const q1 = await q1Response.json();
  //const q2 = await q2Response.json();

  return q1;
  //return [q1, q2];

}

async function showPresentation( item, type ){

  item = unpackString( item ); 
  type = type.trim();

  let languages = unpackString( item.languages ); 

  //console.log('create presentation for: ', type,  item );

  const start_date  = item.start_date ? parseInt( item.start_date ) : new Date().getFullYear() + 1;
  const end_date    = item.end_date ? parseInt( item.end_date ) : new Date().getFullYear() + 1;

  const date_obj = getDatingHTML( item, {} );

  let dating = $('<p>' + date_obj.dating + '</p>').text();
  //console.log( dating );

  //console.log( start_date, end_date, date_obj );

  // create Scheme-code for presentation
  let code      = '( presentation\n';
  let slides    = []; // code for each slide

	let title_enc = encodeURIComponent( item.title );
	let title     = encodeURIComponent( quoteTitle( item.title ) );

  explore.q = item.title;

  let desc      = '';

  if ( valid( item.description ) ){

    desc = `<h3>${ item.description }</h3>`;

  }

	// set background
  let background= '';

  explore.presentation_text_background_css = '';

  // presentation configuration
  if ( type === 'pubchem' ){ background = "https://conze.pt/app/explore2/assets/svg/backgrounds/003.svg"; }
  else if ( type === 'mathematics' ){ background = "https://conze.pt/app/explore2/assets/svg/backgrounds/004.svg"; }
  else { 

    if ( valid( item.image ) ){

      //console.log('before: ', item.image );

      //background = decodeURIComponent( item.image );
      //background = item.image.replace( /width=\d+px/g, 'width=600px' ).replace('(', '%28').replace(')', '%29');
      background = item.image.replace( /width=\d+px/g, 'width=600px' )

      //console.log('after: ', item.background );

      // for text readability 
      explore.presentation_text_background_css = 'background: rgba(0, 0, 0, 0.40) none repeat scroll 0% 0%; border-radius: 0.7em;';
    }
    else {

			if ( type === 'organism' ){ background = "https://conze.pt/app/explore2/assets/svg/backgrounds/005.svg" };
			if ( type === 'art-movement' ){ background = "https://conze.pt/app/explore2/assets/svg/backgrounds/001.svg" };
			if ( type === 'art-movement' ){ background = "https://conze.pt/app/explore2/assets/svg/backgrounds/001.svg" };
			if ( type === 'location' ){ background = "https://conze.pt/app/explore2/assets/svg/backgrounds/001.svg" };
			if ( type === 'geographical-structure' ){ background = "#115699" };
			if ( type === 'time' ){ background = "https://conze.pt/app/explore2/assets/svg/backgrounds/003.svg" };
			if ( type === 'organization' ){ background = "#115699" };

    }

  }

  if ( valid( background ) ){

    code += `  ( set '( 'background \"${background}\" ) )\n`;

  }

	// store initial language, so we can restore after it changes
  let language = explore.language;

	let external_links = [];

	// fetch API data
	// see also: https://dmitripavlutin.com/javascript-fetch-async-await/#5-parallel-fetch-requests
	/*
	fetchPresentationData( item.title, language ).then(( q1 ) => {

		if ( q1.query?.pages ){

			if ( valid( q1.query.pages[ Object.keys( q1.query.pages )[0] ] ) ){

				//console.log( q1.query.pages[ Object.keys( q1.query.pages )[0] ].extlinks );

				external_links = q1.query.pages[ Object.keys( q1.query.pages )[0] ].extlinks;

			}

		}
		*/

		// frequently used ready-made slides
		let video_slide                 = `  ( slide "${ item.title } <h3>${ dating }</h3> <h3><i class='fa-solid fa-video' title='videos'></i></h3>"\n    ( show \'link \'( "https://conze.pt/app/video/#/search/%22${ title_enc }%22" ) ) )\n`;
		let linkgraph_slide             = `  ( slide "${ item.title } <h3>${ dating }</h3> <h3><i class='fa-solid fa-diagram-project' title='link relations'></i></h3>"\n    ( show \'linkgraph \'( ${ item.qid } ) ) )\n`;
		let open_library_meta_slide     = `  ( slide "${ item.title } <h3>${ dating }</h3> <h3>Open Library (meta-data)<h3><h3><i class='fa-solid fa-book-open' title='books'></i></h3>"\n    ( show \'link \'( "https://openlibrary.org/search?q=${title}&language=${explore.lang3}" ) ) )\n`;
		let open_library_fulltext_slide = `  ( slide "${ item.title } <h3>${ dating }</h3> <h3>Open Library (fulltext)</h3><h3><i class='fa-solid fa-book-open' title='books'></i></h3>"\n    ( show \'link \'( "https://openlibrary.org/search/inside?q=${title}&language=${explore.lang3}&has_fulltext=true" ) ) )\n`;
		let libretext_chemistry         = `  ( slide "${ item.title } <h3>${ dating }</h3> <h3>LibreText</h3><h3><i class='fa-solid fa-person-chalkboard'></i></h3>"\n    ( show \'link \'( "https://chem.libretexts.org/Special:Search?query=${ title }&type=wiki&classifications=article%3Atopic-category%2Carticle%3Atopic-guide" ) ) )\n`;
		let oer_commons_slide = `  ( slide "${ item.title } <h3>${ dating }</h3> <h3>OER Commons</h3><h3><i class='fa-solid fa-person-chalkboard'></i></h3>"\n    ( show \'link \'( "https://www.oercommons.org/search?f.search=${title}&f.language=${language}" ) ) )\n`;
		let scholia_slide               = `  ( slide "${ item.title } <h3>${ dating }</h3> <h3>Scholia</h3><h3><i class='fa-solid fa-graduation-cap' title='science research'></i></h3>"\n    ( show \'link \'( "https://scholia.toolforge.org/topic/${ item.qid }" ) ) )\n`;

		let commons_slide = `  ( slide "${ item.title } <h3>${ dating }</h3> <h3><i class='fa-regular fa-image' title='Commons images'></i></h3>"\n    ( show \'link \'( "https://conze.pt/app/commons/?q=${ item.qid }" ) ) )\n`;
		let commons_time_music_slide    = `  ( slide "${ item.title } <h3>${ dating }</h3> <h3>Commons</h3><h3><i class='fa-regular fa-image' title='Commons images'></i></h3>"\n    ( show \'audio-query \'( "source:conzept;start:${start_date};end:${end_date}" ) )\n    ( show \'link \'( "https://conze.pt/app/commons/?q=${ item.qid }" ) ) )\n`;
		let commons_country_music_slide = `  ( slide "${ item.title } <h3>${ dating }</h3> <h3>Commons</h3><h3><i class='fa-regular fa-images' title='images'></i></h3>"\n    ( show \'audio-query \'( "source:conzept;country:${ valid( item.country )? item.country : '' };" ) )\n    ( show \'link \'( "https://conze.pt/app/commons/?q=${ item.qid }" ) ) )\n`;

		let europeana_slide = `  ( slide "${ item.title } <h3>${ dating }</h3> <h3><i class='fa-regular fa-image' title='Europeana images'></i></h3>"\n    ( show \'link \'( "https://conze.pt/app/europeana/?q=${ title }&l=${language}&t=images,videos,sounds,3ds" ) ) )\n`;
		let europeana_time_music_slide    = `  ( slide "${ item.title } <h3>${ dating }</h3> <h3>Europeana</h3><h3><i class='fa-regular fa-image' title='Europeana images'></i></h3>"\n    ( show \'audio-query \'( "source:conzept;start:${start_date};end:${end_date}" ) )\n    ( show \'link \'( "https://conze.pt/app/europeana/?q=${ title }&l=${language}&t=images,videos,sounds,3ds" ) ) )\n`;
		let europeana_country_music_slide = `  ( slide "${ item.title } <h3>${ dating }</h3> <h3>Europeana</h3><h3><i class='fa-regular fa-images' title='images'></i></h3>"\n    ( show \'audio-query \'( "source:conzept;country:${ valid( item.country )? item.country : '' };" ) )\n    ( show \'link \'( "https://conze.pt/app/europeana/?q=${ title }&l=${language}" ) ) )\n`;

		let bing_images_slide           = `  ( slide "${ item.title } <h3>${ dating }</h3> <h3>Bing images</h3><h3><i class='fa-regular fa-image' title='Commons images'></i></h3>"\n    ( show \'link \'( "https://www.bing.com/images/search?&q=${title}&qft=+filterui:photo-photo&FORM=IRFLTR&setlang=${language}-${language}" ) ) )\n`;
		let arxiv_slide = `  ( slide "${ item.title } <h3>arXiv</h3> <h3>${ dating }</h3> <h3><i class='fa-solid fa-graduation-cap' title='science research'></i></h3>"\n    ( show \'link \'( "https://search.arxiv.org/?query=${title}&in=grp_math" ) ) )\n`; // note: only fulltext-search works for embedding the webpage

    let timeline_slide              = `  ( slide "${ item.title } <h3>${ dating }</h3> <h3>timeline</h3> <h3><i class='fa-solid fa-timeline' title='Wikipedia article timeline'></i></h3>"\n    ( show \'link \'( "${explore.base}/app/timeline/?t=${title_enc}" ) ) )\n`;

    let quiz_location_slide         = `  ( slide "${ item.title } <h3></h3> <h3>location quiz</h3> <h3><i class='fa-solid fa-puzzle-piece' title='guess the location'></i></h3>"\n    ( show \'link \'( "${explore.base}/app/quiz/location/?${ item.qid }" ) ) )\n`;

		let street_map_slide  = '';
		let nearby_map_slide  = '';
		let satellite_map     = '';

		if ( valid( item.lat ) ){

			street_map_slide  = `  ( slide "${ item.title } <h3>streetmap</h3><h3><i class='fa-regular fa-map' title='map'></i></h3>"\n    ( show \'link \'( "${explore.base}/app/map/?l=${explore.language}&bbox=${getBoundingBox(item.lon, item.lat, 0.05 )}&lat=${item.lat}&lon=${item.lon}&osm_id=${ valid( item.osm_relation_id )? item.osm_relation_id : '' }&qid=${item.qid}&title=${title_enc}" ) ) )\n`;
			nearby_map_slide  = `  ( slide "${ item.title } <h3>nearby map</h3><h3><i class='fa-regular fa-map' title='map'></i></h3>"\n    ( show \'link-split \'( "/app/nearby/#lat=${item.lat}&lng=${item.lon}&zoom=17&interface_language=${language}&layers=wikidata_image,wikidata_no_image,wikipedia" ) ) )\n`;

			satellite_map     = `  ( slide "${ item.title } <h3>satellite map</h3><h3><i class='fa-regular fa-map' title='map'></i></h3>"\n    ( show \'link \'( "${explore.base}/app/map3d/?lat=${item.lat}&lon=${item.lon}" ) ) )\n`;

		}

		// START of slide content

		// COMMON SLIDES
		if ( language === 'en' ){

			if ( valid( languages['simplewiki'] ) ){ slides.push( `  ( slide "${ item.title } ${ desc } <h3>${ dating }</h3> <h4>(simple)</h4>"\n    ( show \'link \'( "https://conze.pt/app/wikipedia/?t=${ title_enc }&l=simple&qid=${ item.qid }&dir=ltr" ) ) )\n` ); }

		}

		// note: we need to set the initial-language again before the next slide (since the previous "simple-language" slide might have changed the language)
		slides.push( `  ( slide "${ item.title } ${ desc } <h3>${ dating }</h3> <h4>(wikipedia)</h4>"\n    ( show \'topic \'( ${ item.qid } ${ language }  ) ) ) \n` );

		if ( valid( item.wikiversity ) ){ slides.push( `  ( slide "${ item.title } <br><h3>Wikiversity</h3>"\n    ( show \'link \'( "${ item.wikiversity }" ) ) )\n` ); }

		// TOPICAL SLIDES
		if ( type === 'pubchem' ){

			slides.push( `  ( slide "${ item.title } <h2><span class='withborder'><a target='infoframe' style='text-decoration:none !important;' href='/app/wikipedia/?qid=Q83147'>${ ( valid( item.chemical_formula ) ? item.chemical_formula : '' ) }</a></span></h2>"\n    ( show \'chemical \'( ${ item.pubchem } ) ) )\n` );

			slides.push( video_slide );
			slides.push( linkgraph_slide );

			if ( language === 'en' ){ slides.push( libretext_chemistry ); }

			slides.push( open_library_meta_slide );
			slides.push( open_library_fulltext_slide );

			slides.push( `  ( slide "${ item.title } <h3>PubChem</h3>"\n    ( show \'link \'( "https://pubchem.ncbi.nlm.nih.gov/compound/${ item.pubchem }" ) ) )\n` );
			if ( valid( item.chebi ) ){ slides.push( `  ( slide "${ item.title } <h3>ChEBI</h3>"\n    ( show \'link \'( "https://www.ebi.ac.uk/chebi/searchId.do?chebiId=CHEBI:${ item.chebi }" ) ) )\n` ); }

			slides.push( scholia_slide );
			slides.push( arxiv_slide );

		}
		else if ( type === 'mathematics' ){

			if ( item.mathworld ){ slides.push( `  ( slide "${ item.title } <br><h3>Wolfram MathWorld</h3>"\n    ( show \'link \'( "https://mathworld.wolfram.com/${item.mathworld}.html" ) ) )\n` ) };

			slides.push( video_slide );
			slides.push( linkgraph_slide );

			slides.push( `  ( slide "${ item.title } <h3>GeoGebra</h3>"\n    ( show \'link \'( "https://www.geogebra.org/search/${ title }" ) ) )\n` );

			if ( language === 'en' ){ slides.push( `  ( slide "${ item.title } <h3>LibreText</h3>"\n    ( show \'link \'( "https://math.libretexts.org/Special:Search?query=${ title }&type=wiki&classifications=article%3Atopic-category%2Carticle%3Atopic-guide" ) ) )\n` ); }

			slides.push( oer_commons_slide );

			if ( item.msc2010_id ){ slides.push( `  ( slide "${ item.title } <h3>Mathematics Subject Classification</h3>"\n    ( show \'link \'( "https://mathscinet.ams.org/mathscinet/msc/msc2010.html?t=${ item.msc2010_id }" ) ) )\n` ) };

			//slides.push( `  ( slide "${ item.title } <br><h3>Open Syllabus</h3>"\n    ( show \'link \'( "https://opensyllabus.org/results-list/titles?size=25&findWorks=${title}" ) ) )\n` );
			slides.push( `  ( slide "${ item.title } <h3>Open Syllabus Galaxy</h3>"\n    ( show \'link \'( "https://galaxy.opensyllabus.org/#!search/courses/${title}" ) ) )\n` );

			slides.push( open_library_meta_slide );
			slides.push( open_library_fulltext_slide );

			slides.push( scholia_slide );
			slides.push( arxiv_slide );

			slides.push( `  ( slide "${ item.title } <h3>EuDML</h3><h3><i class='fa-solid fa-graduation-cap' title='science research'></i></h3>"\n    ( show \'link \'( "https://eudml.org/search/page?q=sc.general*op*l_0*c_0all_0eq%253A1.${title}&qt=SEARCH" ) ) )\n` );

		}
		else if ( type === 'organism' ){

			// intro
			if ( valid( item.gbif_id ) ){ slides.push( `  ( slide "${ item.title } <h3><i class='fa-solid fa-binoculars' title='GBIF observations'></i></h3>"\n    ( show \'link \'( "${explore.base}/app/response/gbif-map?l=${language}&t=${title_enc}&id=${item.gbif_id}" ) ) )\n` ); }


			slides.push( commons_slide );

			slides.push( video_slide );

			if ( valid( item.has_taxon ) ){ slides.push( `  ( slide "${ item.title } <br><h3><i class='fa-solid fa-sitemap' title='taxon tree'></i></h3>"\n    ( show \'link-split \'( "${explore.base}/app/tree/${language}/P171/${item.qid}" ) ) )\n` ); }

			slides.push( linkgraph_slide );
			slides.push( open_library_meta_slide );
			slides.push( open_library_fulltext_slide );
			slides.push( scholia_slide );

		}
		else if ( type === 'art-movement' ){

			slides.push( `  ( slide "${ item.title } <h3>Open Art Browser</h3><h3><i class='fa-regular fa-images' title='images'></i></h3>"\n    ( show \'audio-query \'( "source:conzept;start:${start_date};end:${end_date}" ) )\n    ( show \'link \'( "https://openartbrowser.org/en/movement/${item.qid}?tab=artworks&page=0" ) ) )\n` );
			slides.push( commons_time_music_slide );
			slides.push( europeana_time_music_slide );
			//slides.push( bing_images_slide );
			slides.push( video_slide );
			slides.push( linkgraph_slide );
			slides.push( open_library_meta_slide );
			slides.push( open_library_fulltext_slide );
			slides.push( scholia_slide );

		}
		else if ( type === 'location' ){

			// FIXME: check if article-language is available
			//if ( valid( item.topic_history ) ){ slides.push( `  ( slide "${ item.title } <h3><i class='fa-regular fa-clock' title='history'></i></h3>"\n    ( show \'link \'( "https://conze.pt/app/wikipedia/?t=&l=${language}&qid=${ item.topic_history }&dir=ltr" ) ) )\n` ); }

			// FIXME: There may be an Qid for this location-culture, but we also need to check that the article-language is available for item.culture.
			//  example: NL-language -> "Germany"-article-presentation -> culture-article does not exist in Dutch!
			//if ( valid( item.culture ) ){ slides.push( `  ( slide "${ item.title } <h3><i class='fa-solid fa-hand-holding-heart' title='culture'></i></h3>"\n    ( show \'audio-query \'( "source:conzept;country:${ valid( item.country )? item.country : '' };" ) ) ( show \'link \'( "https://conze.pt/app/wikipedia/?t=&l=${language}&qid=${ item.culture }&dir=ltr" ) ) )\n` ); }

			if ( valid( item.wikivoyage ) ){ slides.push( `  ( slide "${ item.title } <h3>Wikivoyage</h3><h3><i class='fa-solid fa-plane-departure' title='travel information'></i></h3>"\n    ( show \'link \'( "${ item.wikivoyage }" ) ) )\n` ); }

			slides.push( commons_country_music_slide );
			slides.push( europeana_country_music_slide );
			slides.push( bing_images_slide );
			slides.push( video_slide );

			if ( valid( item.lat ) ){ slides.push( satellite_map ) };
			if ( valid( item.lat ) ){ slides.push( street_map_slide ) };

			// FIXME: field-URL required a "\n" before defaultView
			if ( valid( item.country_l1_subdivisions_query ) ){ slides.push( `  ( slide "${ item.title } <h3>L1 admin subdivisions</h3><h3><i class='fa-regular fa-map' title='L1 division map'></i></h3>"\n    ( show \'link-split \'( "${explore.base}/app/query/embed.html?l=${language}#SELECT%20DISTINCT%20%3Fitem%20%3FitemLabel%20%3FitemDescription%20%3Finception%20%3Fbirth%20%3Fstart%20%3Fpit%20%3Fcoord%20%3Fgeoshape%20%3Fimg%20WHERE%20%7B%0A%20%20%3Fitem%20wdt%3AP31%20wd%3A${ item.l1 }.%0A%20%20%3Fsitelink%20schema%3Aabout%20%3Fitem.%0A%0A%20%20%3Fsitelink%20schema%3AinLanguage%20%3Flang%20.%0A%20%20SERVICE%20wikibase%3Alabel%20%7B%20bd%3AserviceParam%20wikibase%3Alanguage%20%22en%2C${ language }%22.%20%7D%0A%20%20optional%20%7B%3Fitem%20wdt%3AP18%20%3Fimg%20.%7D%20%0A%20%20optional%20%7B%3Fitem%20wdt%3AP569%20%3Fbirt%20.%7D%20%0A%20%20optional%20%7B%3Fitem%20wdt%3AP571%20%3Finception%20.%7D%20%0A%20%20optional%20%7B%3Fitem%20wdt%3AP580%20%3Fstart%20.%7D%0A%20%20optional%20%7B%3Fitem%20wdt%3AP585%20%3Fpit%20.%7D%0A%20%20optional%20%7B%3Fitem%20wdt%3AP625%20%3Fcoord%20.%7D%0A%20%20optional%20%7B%3Fitem%20wdt%3AP3896%20%3Fgeoshape%20.%7D%0A%20%0A%7D%0AORDER%20BY%20%3FitemLabel%20%0ALIMIT%202000\n%0A%23defaultView%3AMap%0A%23meta%3Alevel-1%20subdivisions%20in%20${title_enc}%0A%0A" ) ) )\n` ); }

			// FIXME: field-URL required a "\n" before defaultView
			if ( valid( item.country_l2_subdivisions_query ) ){ slides.push( `  ( slide "${ item.title } <h3>L2 admin subdivisions</h3><h3><i class='fa-regular fa-map' title='L1 division map'></i></h3>"\n    ( show \'link-split \'( "${explore.base}/app/query/embed.html?l=${language}#SELECT%20DISTINCT%20%3Fitem%20%3FitemLabel%20%3FitemDescription%20%3Finception%20%3Fbirth%20%3Fstart%20%3Fpit%20%3Fcoord%20%3Fgeoshape%20%3Fimg%20WHERE%20%7B%0A%20%20%3Fitem%20wdt%3AP31%20wd%3A${ item.l2 }.%0A%20%20%3Fsitelink%20schema%3Aabout%20%3Fitem.%0A%0A%20%20%3Fsitelink%20schema%3AinLanguage%20%3Flang%20.%0A%20%20SERVICE%20wikibase%3Alabel%20%7B%20bd%3AserviceParam%20wikibase%3Alanguage%20%22en%2C${ language }%22.%20%7D%0A%20%20optional%20%7B%3Fitem%20wdt%3AP18%20%3Fimg%20.%7D%20%0A%20%20optional%20%7B%3Fitem%20wdt%3AP569%20%3Fbirt%20.%7D%20%0A%20%20optional%20%7B%3Fitem%20wdt%3AP571%20%3Finception%20.%7D%20%0A%20%20optional%20%7B%3Fitem%20wdt%3AP580%20%3Fstart%20.%7D%0A%20%20optional%20%7B%3Fitem%20wdt%3AP585%20%3Fpit%20.%7D%0A%20%20optional%20%7B%3Fitem%20wdt%3AP625%20%3Fcoord%20.%7D%0A%20%20optional%20%7B%3Fitem%20wdt%3AP3896%20%3Fgeoshape%20.%7D%0A%20%0A%7D%0AORDER%20BY%20%3FitemLabel%20%0ALIMIT%202000\n%0A%23defaultView%3AMap%0A%23meta%3Alevel-2%20subdivisions%20in%20${title_enc}%0A%0A" ) ) )\n` ); }

			slides.push( `  ( slide "${ item.title } <h3>infrastructure map</h3><h3><i class='fa-regular fa-map' title='map'></i></h3>"\n    ( show \'link \'( "https://openinframap.org/#8/${item.lat}/${item.lon}" ) ) )\n` );

			slides.push( nearby_map_slide );

			slides.push( linkgraph_slide );

			slides.push( open_library_meta_slide );
			slides.push( open_library_fulltext_slide );

			slides.push( scholia_slide );

		}
		else if ( type === 'geographical-structure' ){

			slides.push( commons_slide );

			slides.push( video_slide );

			slides.push( linkgraph_slide );

      slides.push( quiz_location_slide );

			slides.push( open_library_meta_slide );
			slides.push( open_library_fulltext_slide );

			slides.push( scholia_slide );

    }
		else if ( type === 'organization' ){

			if ( valid( item.subsidiary_organization_entitree ) ){ slides.push( `  ( slide "${ item.title } <h3>subsidiaries</h3><h3><i class='fa-solid fa-sitemap' title='tree'></i></h3>"\n    ( show \'link-split \'( "${explore.base}/app/tree/${language}/P355/${item.qid}" ) ) )\n` ); }
			if ( valid( item.parent_organization_entitree ) ){ slides.push( `  ( slide "${ item.title } <h3>parent</h3><h3><i class='fa-solid fa-sitemap' title='tree'></i></h3>"\n    ( show \'link-split \'( "${explore.base}/app/tree/${language}/P749/${item.qid}" ) ) )\n` ); }
			if ( valid( item.member_of_entitree ) ){ slides.push( `  ( slide "${ item.title } <h3>member of</h3><h3><i class='fa-solid fa-sitemap' title='tree'></i></h3>"\n    ( show \'link-split \'( "${explore.base}/app/tree/${language}/P463/${item.qid}" ) ) )\n` ); }
			if ( valid( item.part_of_entitree ) ){ slides.push( `  ( slide "${ item.title } <h3>part of</h3><h3><i class='fa-solid fa-sitemap' title='tree'></i></h3>"\n    ( show \'link-split \'( "${explore.base}/app/tree/${language}/P361/${item.qid}" ) ) )\n` ); }
			if ( valid( item.has_parts_entitree ) ){ slides.push( `  ( slide "${ item.title } <h3>has parts</h3><h3><i class='fa-solid fa-sitemap' title='tree'></i></h3>"\n    ( show \'link-split \'( "${explore.base}/app/tree/${language}/P527/${item.qid}" ) ) )\n` ); }

			if ( valid( item.lat ) ){ slides.push( street_map_slide  ) };
			if ( valid( item.lat ) ){ slides.push( nearby_map_slide  ) };

			slides.push( commons_slide );

			slides.push( video_slide );

			if ( valid( item.has_taxon ) ){ slides.push( `  ( slide "${ item.title } <h3><i class='fa-solid fa-sitemap' title='taxon tree'></i></h3>"\n    ( show \'link-split \'( "${explore.base}/app/tree/${language}/P171/${item.qid}" ) ) )\n` ); }

			slides.push( linkgraph_slide );
			slides.push( open_library_meta_slide );
			slides.push( open_library_fulltext_slide );
			slides.push( scholia_slide );

		}

		else if ( type === 'time' ){

			// TODO: put this time-space-link code somewhere central
			// not bullet-proof, but we need some 'relevance'-filters before showing the timspace-button (as most events don't have the required data to show a timeline)
			if (  valid( item.category ) || ( valid( item.followed_by ) || valid( item.part_of ) || valid( item.has_parts ) || valid( item.list_of ) ) ){

				let used_qid = item.qid;

				if ( !valid( item.category ) && valid( item.part_of ) ){ // this is a fallible escape-hatch for using an alternative qid

					//console.log( item.part_of )

					if ( Array.isArray( item.part_of ) ){

						used_qid = item.part_of[0];

					}
					else {

						used_qid = item.part_of;

					}

				}

				let limited_types = [
					'3186692', '577', '578', '39911', '36507', // year, decade, century, milennium, 

					// FIXME: how to better handle these:
					'27020041', '82414', '159821', // sports events
				];

				let limited_query = '&limited=false';

				if ( limited_types.includes( item.instance_qid ) ) { 

					limited_query = '&limited=true';
				}

				let url = explore.base + '/app/timespace/?q=' + used_qid + '&l=' + explore.language + '&highlight=' + item.qid + limited_query;

				slides.push( `  ( slide "${ item.title } <h3>${ dating }</h3> <h3>event cluster</h3> <h3><i class='fa-solid fa-hourglass-end' title='time-space view'></i></h3>"\n    ( show \'link-split \'( "${url}" ) ) )\n` );

			}

			if ( valid( item.significant_event_entitree ) ){ slides.push( `  ( slide "${ item.title } <h3>significant events</h3><h3><i class='fa-solid fa-sitemap' title='significant event tree'></i></h3>"\n    ( show \'link-split \'( "${explore.base}/app/tree/${language}/P793/${item.qid}" ) ) )\n` ); }

		  if ( language === 'en' && valid( item.wikipedia_timeline ) ){ slides.push( timeline_slide ); }

			slides.push( commons_time_music_slide );
			slides.push( europeana_time_music_slide );
			slides.push( bing_images_slide );
			slides.push( video_slide );
			slides.push( linkgraph_slide );
			slides.push( open_library_meta_slide );
			slides.push( open_library_fulltext_slide );
			slides.push( scholia_slide );

		}

		/*
		external_links.forEach( (l) => {

			const extlink = l['*'];

			slides.push( `  ( slide "${ item.title } <h4><a target='_blank' href='${ extlink }'>${extlink.replace('http://', '').replace('https://', '') }</a></h4><h4>(click on the above link, if it fails to open here)</h4><h3><i class='fa-solid fa-link' title='links'></i></h3>"\n    ( show \'link \'( "${ extlink }" ) ) )\n` );

		});
		*/

		// END of slide content

		//console.log( slides );

		// add each slide-code to code
		$.each( slides, function ( i, slide ) {

			code += slide;

		});

		// finalize presentation code
		code += ')\n';

		// add code to editor
		//explore.editor.setValue( beautify( code ) );
		explore.editor.setValue( code );

		//console.log('code: ', code );
		//explore.commands = code;

		runLISP( code );

	//}).catch(error => { console.log('error fetching presentation data'); });

}

async function runEditorCode( code ){

	// run commands
	runLISP( code );

	// go to tools-tab
	explore.tabsInstance.select('tab-tools');

	// open editor detail
	$('#editor-detail').attr( 'open', '' );

	// focus on editor
	explore.editor.focus(); 

}

function getTitlefromImageURL( url ){

	const url_dec = decodeURIComponent( url );

	let name  = url_dec.split('FilePath/')[1] || '';

	if ( name === '' ){ // no name yet

		//console.log( url_dec );

		name  = url_dec.substring( url_dec.lastIndexOf("/") + 1, url_dec.length) || '';

	}

	name = name.replace(/_/g, ' ' );
	name = name.substr(0, name.lastIndexOf('.') ); // remove last file-extension

	return name;

}


let lp;

async function setupLispEnv(){

  // see also: https://www.wikidata.org/wiki/Wikidata:REST_API_feedback_round

  // to allow nested lisp code, to be implemented in JS, we use a "lips.Macro"
  // IN:  scheme code in string form
  // OUT: Lips-structured data
  lips.env.set('query', new lips.Macro('query', function( code, { dynamic_scope, error }) {

    const args = { env: this, error };
    if (dynamic_scope) { args.dynamic_scope = this; }

    //console.log( 'code.car: ', code.car );

    // Take the relevant fields using "code.car" and such calls.
    // In this case we create a new Lips-list from the list-argument supplied
    let wrap = new lips.Pair(new lips.LSymbol('list'), code.car);
  
    // - take the wrapped-code and evaluate it
    // - then return as a Lips-array
    return this.get('list->array')( lips.evaluate(wrap, args));

  }));

  /*
  lips.env.set('vector2', new lips.Macro('vector2', function( code, { dynamic_scope, error }) {

    const args = { env: this, error };
    if (dynamic_scope) { args.dynamic_scope = this; }

    // Take the relevant fields using "code.car" and such calls.
    // In this case we create a new Lips-list from the list-argument supplied
    let wrap = new lips.Pair(new lips.LSymbol('list'), code.car);

    console.log( 'code: ', code );
    console.log( 'wrap: ', wrap );
    console.log( 'lisp eval: ', lips.evaluate(wrap, args)  );
    console.log( 'return: ', this.get('list->array')( lips.evaluate(wrap, args)) );

    // - take the wrapped-code and evaluate it
    // - then return as a Lips-array
    return this.get('list->array')( lips.evaluate(wrap, args));

  }));
  */
  lips.env.set('presentation', new lips.Macro('presentation', function( code, { dynamic_scope, error }) {

    let meta = {};

    meta.toc = true; // show table-of-contents

    explore.presentation_building_mode = true;

    const args = { env: this, error };
    if (dynamic_scope) { args.dynamic_scope = this; }

    //console.log('presentation slides: ', code.length(), code );

    //console.log( 'code.car: ', code.car );

    let i = 0;

    // build slide commands list
    code.map( ( slide, index ) => {

      //console.log( slide, index);

      // dont add "set" elements
      if ( slide.car?.__name__ === 'set' ){

        // parse set-data
        let wrap  = new lips.Pair(new lips.LSymbol('list'), slide );
        let set   = this.get('list->array')( lips.evaluate(wrap, args));

        //console.log( set );
        //lp = set[1];

        let key = set[1].car.cdr.toString().replace(/\(|\)/g, '') || '';
        let val = set[1].cdr.toString().replace( /^\(/, '' ).replace( /\)$/, '') || '';
        //let val = set[1].cdr.toString().replace(/\(|\)/g, '') || '';

        if (
          key === 'background' ||
          key === 'color' ||
          key === 'autoslide'
        ){

          meta[ key ] = val;

        }

        //console.log( 'meta: ', meta );

      }
      else {
      
        // Take the relevant fields using "code.car" and such calls.
        // In this case we create a new Lips-list from the list-argument supplied
        let wrap = new lips.Pair(new lips.LSymbol('list'), slide );

        explore.presentation_building_slide = i;

        // create an empty slide-command-container
        explore.presentation_commands[ explore.presentation_building_slide ]  = [];

        i += 1;

        // - take the wrapped-code and evaluate it
        // - then return as a Lips-array
        return this.get('list->array')( lips.evaluate(wrap, args));

      }

    });

    let text_background_styling = '';
    
    if ( valid( explore.presentation_text_background_css ) ){

      text_background_styling = `<style>.slides section { ${ explore.presentation_text_background_css } }</style>`;

    }

    // create HTML-start
    let html = `<!DOCTYPE html>
      <head>
        <base target="_blank">
        <link rel="stylesheet" href="../app/explore2/node_modules/reveal.js/dist/reveal.css?v4.3.1">
        <link rel="stylesheet" href="../app/explore2/node_modules/reveal.js/dist/theme/black.css?v4.3.1">
        <link rel="stylesheet" href="/assets/fonts/fontawesome/css/all.min.css?v6.01" type="text/css">
        <!--link rel="stylesheet" href="../app/explore2/dist/css/conzept/common.css?v${explore.version}" type="text/css"-->
        <link rel="stylesheet" href="../app/explore2/css/conzept/revealjs_custom.css?v${explore.version}" type="text/css">
        <script type="text/javascript" src="../app/explore2/node_modules/reveal.js/dist/reveal.js?v4.3.1"></script>
        <script src="../app/explore2/node_modules/jquery/dist/jquery.min.js"></script>
        <script src="../app/explore2/dist/core/utils.js"></script>
        ${ text_background_styling }
      </head>
      <body>
        <div class="reveal">
          <div class="slides">
      `;

    let s = 0;

    // add each slide-section HTML
    code.map( ( slide ) => {

      // dont add "set" elements
      if ( slide.car?.__name__ === 'set' ){

        //console.log( 'skip this element');
        
      }
      else {

        //console.log( 'slide title?: ', slide.cdr.car.toString() );

        let title = slide.cdr.car.toString();

        let elements = '';

        // find commands which can be rendered by slide-html (eg. direct audio / video links)
        $.each( explore.presentation_commands[ s ], function ( i, c ) {

          const command = c[0];
          const view		= c[1];
          let   data		= c[2];

          //console.log( 'command: ', command, view, data );

          if ( view === 'audio' ){

            //console.log( 'insert html-audio: ', c[2] );

            elements += '<audio controls src="' + data + '"></audio>';

          }
          else if ( command === 'fragment' ){

            //console.log( command, view, data );

            let autoslide = '';

            if ( valid( meta.autoslide ) ){

              autoslide = ` data-autoslide="${ meta.autoslide }"`;

            }

            // replace markdown-links formatted as "(Q12345)" with: "(https://conze.pt/explore/&t=wikipedia&i=Q12345)"
            data = data.replace( /\(\s*(Q\d+)\s*\)/g, '(https://conze.pt/explore/?&t=wikipedia-qid&i=$1)' );

            elements += `<p class="fragment" ${autoslide} data-trigger="${ view }">${ data }</p>`;
            // FIXME: markdown rendering caused all fragments of a slide to show at once
            //elements += `<p class="fragment" ${autoslide} data-trigger="${ view }">${ marked.parse( data ) }</p>`;

          }

        });


        // apply slide meta-data
        //console.log('meta now: ', meta );

        let options = {};

        if ( valid( meta.color ) ){

          options.color = ` color:${ meta.color } !important `;

        }
        else {
          options.color = '';
        }

        if ( valid( meta.background ) ){

          //console.log('using bg, before: ', meta.background );
          //meta.background = decodeURIComponent( meta.background );
          //console.log('using bg, after: ', meta.background );

          let ext = meta.background.split('.');

          if ( ext.length > 1 ){
            ext = ext.pop();
          }
          else {
            ext = '';
          }

          //console.log( meta.background, ext );

          // see: https://revealjs.com/backgrounds/
          if ( ext === 'mp4' ){ // video background

            options.background = `data-background-video="${ meta.background }" data-background-video-loop data-background-video-muted`;

          }
          else if (
            meta.background.startsWith('rgb') ||
            meta.background.startsWith('hsl') ||
            meta.background.startsWith('#')
          ){ // color value

            options.background = `data-background-color="${ meta.background }"`;

          }
          else if ( meta.background.includes( 'gradient' ) ){ // gradient definition

            options.background = `data-background-gradient="${ meta.background }"`;

          }
          else { // image background

            //console.log('final image: ', meta.background );
            options.background = `data-background-image="${ decodeURIComponent( meta.background  ) }"`;

          }

        }

        html += `<section style="${options.color}" ${ options.background }><h1> ${ title } </h1> ${ elements } </section>`;

        s += 1;

      }

    });

    //console.log( html );

    // add HTML-end
    html += `
  <script type="text/javascript">

		let slide_nr = 0;

    let reveal_options = {
      transition: "fade",
      autoPlayMedia: true,
      loop: false,
      progress: true,
      slideNumber: false,
    };

    //let reveal_plugins = [];

    if ( valid( ${ meta.autoslide } ) ){

      reveal_options[ 'autoSlide' ] = ${ meta.autoslide };

      //$('p.fragment').addClass('visible'); // show all fragments at once

    }

    /*
    if ( valid( ${ meta.toc } ) ){

      console.log('show ToC'):

      reveal_plugins.push( 'toc'  );

    }
    */

    Reveal.initialize(

      reveal_options,

      //plugins : reveal_plugins,
      
    );

    const parentref = parent; Reveal.on( "slidechanged", event => { parentref.postMessage({ event_id: "run-slide-commands", data: { slide : event.indexh } }, "*" ); });

    Reveal.on( "ready", event => {

      parentref.postMessage({ event_id: "run-slide-commands", data: { slide : 0 } }, "*" );

      //Reveal.nextFragment(); // auto-show the first fragment

    });

    Reveal.on( "fragmentshown", event => {

      //console.log( $( event.fragment ).data("trigger") );
			//console.log( Reveal.getState() );

      let trigger = $( event.fragment ).data("trigger").split(":") || [];

      let trigger_command = trigger[0];

      let goto_args = trigger;
      goto_args.shift();
      goto_args.join(':');

      //console.log( trigger, trigger_command, goto_args );

      if ( trigger_command === 'goto' ){ // trigger command in 'infoframe'

        parent.postMessage({ event_id: 'goto', data: { value: goto_args } }, '*' );

      }

    });

		Reveal.addEventListener( 'slidechanged', function( event ) {

			// only when we go back a slide AND there is a fragment, we replay that last fragment
			if ( ( event.indexh + 1 ) === slide_nr ){ // going back a slide

				let state = Reveal.getState();

				if ( state.indexf > 0 ){ // we are on a fragment (from a slide-change)

					// we are at the end of all fragments, so replay the one before this fragment-position
					let sel		= '.fragment[data-fragment-index="' + ( state.indexf - 1 ) + '"]';

					let trigger = $( sel ).data("trigger").split(":") || [];

          let trigger_command = trigger[0];

          let goto_args = trigger.slice();
          goto_args.shift();
          goto_args.join(':');

          //console.log( trigger, trigger_command, goto_args );

					if ( trigger_command === 'goto' ){ // trigger command in 'infoframe'

						// TODO: we should wait until the iframe has completely loaded, but how?
						parent.postMessage({ event_id: 'goto', data: { value: goto_args } }, '*' );

					}

				}

			}
      else { // going forward a slide

        //Reveal.nextFragment(); // auto-show the first fragment

        //if ( valid( ${ meta.autoslide } ) ){

          //$('p.fragment').addClass('visible'); // show all fragments at once

        //}

      }

			slide_nr = event.indexh; // sync slide number

		} );

		Reveal.on( 'fragmenthidden', event => { // going back a fragment (without a slide-change!)

			// replay the fragment before this one

			let state = Reveal.getState();

			if ( state.indexf >= 0 ){

				let sel		= '.fragment[data-fragment-index="' + ( state.indexf ) + '"]';
				//console.log( sel );

				let trigger = $( sel ).data("trigger").split(":") || [];
        //console.log('TRIGGER: ', trigger );

        const trigger_command = trigger[0];

        let goto_args = trigger.slice();
        goto_args.shift();
        goto_args.join(':');

        //console.log( trigger, trigger_command, goto_args );

				if ( trigger[0] === 'goto' ){ // trigger command in 'infoframe'

					parent.postMessage({ event_id: 'goto', data: { value: goto_args } }, '*' );

				}

			}

		} );

  </script>
</body> </html>`;

    //console.log( html );

    // show presentation
		// insert HTML into iframe-srcdoc
    $('iframe#presentation').attr( 'srcdoc', html );

  	// go to tools-tab
   	explore.tabsInstance.select('tab-tools');

    console.log('open presentation detail');

    // open presentation detail
   	$('#presentation-detail').attr( 'open', '' );
   	$('#editor-detail').removeAttr( 'open', '' );

    explore.presentation_building_mode  = false;
    explore.presentation_building_slide = undefined;
    explore.presentation_text_background_css = ''; // reset

    $('#blink').hide();

  }));

	lips.env.set('slide', function(...args) {

    explore.keyboard_ctrl_pressed = false;

    console.log('slide ...');

  });


	lips.env.set('show', function(...args) {

    explore.keyboard_ctrl_pressed = false;

    let view      = args.shift().toString();
    let list      = [];

    //console.log( args[0] );
    
    if ( !valid( args[0].car ) ) { // SPARQL-query (has multiple objects, where "car" is located 1-level deeper than for a simple array)

			if ( explore.presentation_building_mode ){ // store command

				explore.presentation_commands[ explore.presentation_building_slide ].push( [ 'sparqlQueryCommand', view, list, args ] );

			}
			else { // direct command execution

        sparqlQueryCommand( args, view, list );

        if ( view === 'sidebar' ){ // Wikidata-results in the sidebar

          explore.tabsInstance.select('tab-topics');

          return 0;

        }

      }

    }
    else if ( view === 'link' || view === 'link-split' ){ // simple command (no need to fetch any Qid-data with SPARQL)

      list = args.shift().to_array() || [];

			if ( explore.presentation_building_mode ){

				explore.presentation_commands[ explore.presentation_building_slide ].push( [ 'show', view, list ] );

			}
			else {

				handleClick({ 
					id        : 'n1-0',
					type      : view,
					title     : '',
					qid       : '',
					language  : explore.language,
					url       : list[0],
					tag       : '',
					languages : '',
					custom    : '',
					target_pane : 'p1',
				});

			}

      return 0;

    }
    else if ( view === 'url' ){ // simple command (no need to fetch any Qid-data with SPARQL)

      list = args.shift().to_array() || [];

			if ( explore.presentation_building_mode ){

        console.log( 'url: ', list, args );

				explore.presentation_commands[ explore.presentation_building_slide ].push( [ 'show', view, list ] );

			}
			else {

        //console.log( 'url: ', list[0], list );

        // note: This does not work on first URL-visit, only after an user-interaction (such as a click).
        openInNewTab( decodeURI( list[0] ) );
			}

      return 0;

    }
    else if ( view === 'pdf' ){ // simple command (no need to fetch any Qid-data with SPARQL)

      list = args.shift().to_array() || [];

			if ( explore.presentation_building_mode ){

				explore.presentation_commands[ explore.presentation_building_slide ].push( [ 'show', view, list ] );

			}
			else {

				handleClick({ 
					id        : 'n1-0',
					type      : 'link',
					title     : '',
					qid       : '',
					language  : explore.language,
					url       : `https://${ explore.host }/app/pdf/?file=https://${ explore.host }/app/cors/raw/?url=${ list[0]  }#page=0&zoom=page-width&phrase=true&pagemode=thumbs`,
					tag       : '',
					languages : '',
					custom    : '',
					target_pane : 'p1',
				});

			}

      return 0;

    }
    else if ( view === 'iiif' ){ // simple command (no need to fetch any Qid-data with SPARQL)

      list = args.shift().to_array() || [];

			if ( explore.presentation_building_mode ){

				explore.presentation_commands[ explore.presentation_building_slide ].push( [ 'show', view, list ] );

			}
			else {

				handleClick({ 
					id        : 'n1-0',
					type      : 'link',
					title     : '',
					qid       : '',
					language  : explore.language,
					url       : `${explore.base}/app/iiif/#?cv=&c=&m=&s=&manifest=${ encodeURIComponent( list[0] ) }`,
					tag       : '',
					languages : '',
					custom    : '',
					target_pane : 'p1',
				});

			}

      return 0;

    }
    else if ( view === 'audio-query' ){ // fetch audio-file-URLs from Archive.org or Europeana

      // inception, end time, publication, ...

      list = args.shift().to_array() || [];

      //console.log( list );

      list[0] = list[0].replace(/;$/, ''); 
      let data = list[0].split(';');

      let obj = {};

      for ( let el of data ) {

        let key_val = el.split(':');

        if ( valid( key_val[0] && valid( key_val[1] ) ) ){

          obj[key_val[0].trim()] = key_val[1].trim();

        }

      }

      let song = '';

      if ( obj.source === 'conzept' ){

        let year;

        if ( valid( obj.start ) ){ // time-period audio-query

          // list of supported years
          const supported_years = Object.keys( music_by_year ).map( function(item) { return parseInt(item, 10); } );

          // list of requested years
          let requested_years = [];

          for (let y = obj.start; y <= obj.end; y++ ){
            requested_years.push( parseInt( y ) )
          }

          // get the year matches of these two sets
          const matching_years = requested_years.filter( y => supported_years.includes( y ) );

          //console.log( supported_years, requested_years, matching_years, matching_years.length );


          if ( matching_years.length === 0 ){ // no matches found, pick a random instead

            //console.log('no year matches found' );
            return 0;

            //year = supported_years[ Math.floor( Math.random() * supported_years.length ) ];


          }
          else {

            year = matching_years[ Math.floor( Math.random() * matching_years.length ) ];

          }

          // pick a random song from that year
          song = music_by_year[ year ][ Math.floor(Math.random() * music_by_year[ year ].length ) ];

        }
        else if ( valid( obj.country ) ){ // country audio-query

          let music_by_country = {}

          // create a structure for music by country
	        $.each( Object.values( music_by_year ), function( i, yearObj ){
            
            $.each( yearObj, function( j, songObj ){

              if ( valid( music_by_country[ songObj.country ] ) ){  // structure already exists
                // do nothing
              }
              else { // create structure

                music_by_country[ songObj.country ] = [];

              }

              music_by_country[ songObj.country ].push( songObj );

            });

          });

          //console.log( music_by_country, obj.country );

          if ( valid( music_by_country[ obj.country ] ) ){

            // pick a random song from that year
            song = music_by_country[ obj.country ][ Math.floor(Math.random() * music_by_country[ obj.country ].length ) ];

          }

          if ( ! valid(song) ){ // no song found

            return 0;

          }

        }

      }
      else {

        return 0;

      }

      //console.log( song );

      // TODO: Could we use Archive.org or Europeana for finding songs by year-range?
      //
      // create Europeana query:
      //  see: https://pro.europeana.eu/page/search
      //
      //  can we find music in a date-range?
      //  https://www.europeana.eu/api/v2/search.json?wskey=4ZViVZKMe&rows=10&query=music%201933%20mp3&media=true&qf=TYPE%3A%22SOUND%22
      //
      //  http://sparql.europeana.eu/?default-graph-uri=&query=PREFIX+dc%3A+%3Chttp%3A%2F%2Fpurl.org%2Fdc%2Felements%2F1.1%2F%3E%0D%0APREFIX+edm%3A+%3Chttp%3A%2F%2Fwww.europeana.eu%2Fschemas%2Fedm%2F%3E%0D%0APREFIX+ore%3A+%3Chttp%3A%2F%2Fwww.openarchives.org%2Fore%2Fterms%2F%3E%0D%0ASELECT+%3Ftitle+%3Fcreator+%3FmediaURL+%3Fdate%0D%0AWHERE+%7B%0D%0A++%3FCHO+edm%3Atype+%22SOUND%22+%3B%0D%0A++++++ore%3AproxyIn+%3Fproxy%3B%0D%0A++++++dc%3Atitle+%3Ftitle+%3B%0D%0A++++++dc%3Acreator+%3Fcreator+%3B%0D%0A++++++dc%3Adate+%3Fdate+.%0D%0A++%3Fproxy+edm%3AisShownBy+%3FmediaURL+.%0D%0A%7D%0D%0ALIMIT+100&should-sponge=&format=text%2Fhtml&timeout=0&debug=on

      // Archive.org query:
      //
      // random 0-10 number (the URL requires a query-string)
      // start time
      // end time
      //
      // https://archive.org/advancedsearch.php?q=1&query=mediatype%3A(audio)%20AND%20date%3A[1920-01-01%20TO%201950-01-01]&output=json&rows=10&
      //
      // -> identifier: mp3.mp3_716
      // -> get identifier file(s): https://archive.org/metadata/mp3.mp3_716
      //   ...
      //   Mp3.mp3
      //   ...
      // -> file URL: https://archive.org/download/IDENTIFIER/FILE 
      //              https://archive.org/download/mp3.mp3_716/Mp3.mp3
      //
      //              https://archive.org/metadata/1-1-5
      //              https://archive.org/download/1-1-5/Ba3th-1-15.ogg

      // get query results

      // use query results
			if ( explore.presentation_building_mode ){

				explore.presentation_commands[ explore.presentation_building_slide ].push( [ 'show', 'audio', [ song.url ] ] );

			}
			else {

				explore.autoplay = false;
				$('.plSel').removeClass('plSel'); // remove fixed-playlist highlight

				// insert audio-URL
				document.getElementById('audio1').src = song.url;

				// play audio
				document.getElementById('audio1').play();

			}

      return 0;

    }
    else if ( view === 'audio' ){

      list = args.shift().to_array() || [];

			if ( explore.presentation_building_mode ){

				explore.presentation_commands[ explore.presentation_building_slide ].push( [ 'show', view, list ] );

			}
			else {

				explore.autoplay = false;
				$('.plSel').removeClass('plSel'); // remove fixed-playlist highlight

				// insert audio-URL
				document.getElementById('audio1').src = list[0];

				// play audio
				document.getElementById('audio1').play();

			}

      return 0;

    }
    else if ( view === 'image-set' ){ // simple command (no need to fetch any Qid-data with SPARQL)

      list = args.shift().to_array() || [];
      console.log( list );

      let url = '';

			if ( list.length === 1 ){ // single image

				let img = list[0];

				// create IIIF-link
				let coll = { "images": [ ]};

				let label		= encodeURIComponent( getTitlefromImageURL( img ) );
				let desc    = encodeURIComponent( 'image description' );
				let author  = encodeURIComponent( 'author' );
				let source  = encodeURIComponent( 'source' );

				// for each image add:
				coll.images.push( [ img, label, desc, author, source ] );

				if ( coll.images.length > 0 ){ // we found some images

					// create an IIIF image-collection file
					let iiif_manifest_link = explore.base + '/app/response/iiif-manifest?l=en&single=true&t=' + label + '&json=' + JSON.stringify( coll );

					let iiif_viewer_url = explore.base + '/app/iiif/#?c=&m=&s=&cv=&manifest=' + encodeURIComponent( iiif_manifest_link );

					url = encodeURIComponent( JSON.stringify( encodeURIComponent( iiif_viewer_url ) ) );

				}

			}
			else if ( list.length > 1 ) { // multiple images

				let coll = { "images": [ ]};

				$.each( list, function ( index, img ) {

					let ctitle = encodeURIComponent( getTitlefromImageURL( img ) );

					// license data retrieval: https://en.wikipedia.org/w/api.php?action=query&prop=imageinfo&iiprop=extmetadata&titles=File%3aBrad_Pitt_at_Incirlik2.jpg&format=json

					coll.images.push( [ img, ctitle, ctitle, 'attribution: ...', '...' ] );

				});

			 // create an IIIF image-collection file
				let iiif_manifest_link = '/app/response/iiif-manifest?l=en&t=' + encodeURIComponent( '...' ) + '&json=' + JSON.stringify( coll );

				let iiif_viewer_url = '/app/iiif/#?c=&m=&s=&cv=0&manifest=' + encodeURIComponent( iiif_manifest_link );

				url = encodeURIComponent( JSON.stringify( encodeURIComponent( iiif_viewer_url ) ) );

			}
			else {

				console.log('warning: no image-URLs given');

				return 0;

			}
  
			if ( explore.presentation_building_mode ){

				// note: we force a link view
				explore.presentation_commands[ explore.presentation_building_slide ].push( [ 'show', 'link', [ url ] ] );

			}
			else {

        // open IIIF-url

				handleClick({ 
					id        : 'n1-0',
					type      : 'link',
					title     : '',
					qid       : '',
					language  : explore.language,
					url       : url,
					tag       : '',
					languages : '',
					custom    : '',
					target_pane : 'p1',
				});

			}

      return 0;

    }
    else if ( view === 'audio-waveform' ){

      list = args.shift().to_array() || [];

      let url = `${explore.base}/app/audio/?url=${ encodeURIComponent( "/app/cors/raw/?url=" + list[0] ) }`

      console.log('audio-waveform: ', view, list, url );

			if ( explore.presentation_building_mode ){

				explore.presentation_commands[ explore.presentation_building_slide ].push( [ 'show', view, list, url ] );

			}
			else {

				handleClick({ 
					id        : 'n1-0',
					type      : 'link',
					title     : '',
					qid       : '',
					language  : explore.language,
          url       : url,
					tag       : '',
					languages : '',
					custom    : '',
					target_pane : 'p1',
				});

			}

      return 0;

    }
    else if ( view === 'youtube' ){

      list = args.shift().to_array() || [];

      // target URL: /app/video/?wide=true#/view/zqNTltOGh5c/20/40

      let url   = '';
      let vid   = getParameterByName( 'v', list[0] ) || '';
      let start = getParameterByName( 't', list[0] ) || '0';
      let end   = '';

      if ( vid === '' ){ // assume a short url: https://youtu.be/zqNTltOGh5c?t=104

        vid = list[0].split('/').pop();
        vid = vid.split('?')[0]; // remove any params left over in the string

      }

      if ( start === '0' ){ // also check for start/end times
        start = getParameterByName( 'start', list[0] ) || '0';
        end   = getParameterByName( 'end', list[0] ) || '';
      }

      // remove any "s" second-string on timestamps
      start = start.replace('s', '');
      end   = end.replace('s', '');

      if ( valid( end ) ){

        url = `${explore.base}/app/video/?wide=true#/view/${ vid }/${ start }/${ end }`;

      }
      else {

        url = `${explore.base}/app/video/?wide=true#/view/${ vid }/${ start }`;

      }

      console.log('youtube: ', vid, start, end, url );

			if ( explore.presentation_building_mode ){

				explore.presentation_commands[ explore.presentation_building_slide ].push( [ 'show', view, list, url ] );

			}
			else {

        //url       : `${explore.base}/app/wander/?videoId=${ list[0] }?&mute=false`,

				handleClick({ 
					id        : 'n1-0',
					type      : 'link',
					title     : '',
					qid       : '',
					language  : explore.language,
          url       : url,
					tag       : '',
					languages : '',
					custom    : '',
					target_pane : 'p1',
				});

			}

      return 0;

    }

    else {

      list = args.shift().to_array() || [];

			renderShowCommand( view, list );

    }

    /*
		args.forEach( (arg) => {

		  const qid = arg.toString();

      if ( isQid( qid ) ){ list.push( qid ); }

		});
    */
    
	});

	lips.env.set('search', function(...args) {

    explore.keyboard_ctrl_pressed = false;

    let view      = args.shift().toString();
    let list      = args.shift().to_array() || [];

    //console.log('view: ', view );
    //console.log('list: ', list );

    if ( view === 'explore' ){ // search Wikipedia by string or Qid

      let promiseB = fetchLabel( list, explore.language ).then(function(result) {

        let labels = [];

        if ( valid( result.entities ) ){

          Object.keys( result.entities ).forEach(( k, index ) => {

            if ( result.entities[ k ]?.labels[ explore.language ] ){

              labels.push( result.entities[ k ].labels[ explore.language ].value );

            }

          });

        }

        labels = labels.join(' ');

        handleClick({ 
          id        : 'n1-0',
          type      : 'explore',
          title     : labels,
          language  : explore.language,
          qid       : '',
          url       : '',
          tag       : '',
          languages : '',
          custom    : '',
          target_pane : 'p0',
        });

      });

    }
    else if ( view === 'web' ){

      let promiseB = fetchLabel( list, explore.language ).then(function(result) {

        let labels = [];

        if ( valid( result.entities ) ){

          Object.keys( result.entities ).forEach(( k, index ) => {

            if ( result.entities[ k ]?.labels[ explore.language ] ){

              labels.push( result.entities[ k ].labels[ explore.language ].value );

            }

          });

        }

        labels = labels.join(' ');

        handleClick({ 
          id        : 'n1-0',
          type      : 'link',
          title     : '',
          language  : explore.language,
          qid       : '',
          url       : `https://www.bing.com/search?q=${labels}++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++-wikipedia.org+-wikimedia.org+-wikiwand.com+-wiki2.org&setlang=${language}-${language}`,
          tag       : '',
          languages : '',
          custom    : '',
          target_pane : 'p1',
        });

      });

    }
    if ( view === 'image' ){

      let promiseB = fetchLabel( list, language ).then(function(result) {

        let labels = [];

        if ( valid( result.entities ) ){

          Object.keys( result.entities ).forEach(( k, index ) => {

            if ( result.entities[ k ]?.labels[ explore.language ] ){

              labels.push( result.entities[ k ].labels[ explore.language ].value );

            }

          });

        }

        labels = labels.join(' ');

        handleClick({ 
          id        : 'n1-0',
          type      : 'link',
          title     : '',
          language  : explore.language,
          qid       : '',
          url       : `https://www.bing.com/images/search?&q=${labels}&qft=+filterui:photo-photo&FORM=IRFLTR&setlang=${explore.language}-${explore.language}`,
          tag       : '',
          languages : '',
          custom    : '',
          target_pane : 'p1',
        });

      });

    }
    else if ( view === 'video' ){

      let promiseB = fetchLabel( list, explore.language ).then(function(result) {

        let labels = [];

        if ( valid( result.entities ) ){

          Object.keys( result.entities ).forEach(( k, index ) => {

            if ( result.entities[ k ]?.labels[ explore.language ] ){

              labels.push( result.entities[ k ].labels[ explore.language ].value );

            }

          });

        }

        labels = labels.join(' ');

        handleClick({ 
          id        : 'n1-0',
          type      : 'link',
          title     : '',
          language  : explore.language,
          qid       : '',
          url       : `${explore.base}/app/video/#/search/${labels}`,
          tag       : '',
          languages : '',
          custom    : '',
          target_pane : 'p1',
        });

      });

    }

  });

	lips.env.set('fragment', function(...args) {

    //console.log( 'args: ', args );

    let text		= args.shift().toString();
		let trigger	= '';

		if ( args.length > 0 ){ // action-trigger defined

    	trigger		= args.shift().toString();

			//console.log( 'fragment trigger: ', trigger );

		}

    if ( explore.presentation_building_mode ){

      explore.presentation_commands[ explore.presentation_building_slide ].push( [ 'fragment', trigger, text ] );

    }
    else {

      // do nothing (not supported outside of presentations?)

    }

  });

	lips.env.set('say', function(...args) {

    let text = args.shift().toString();

    if ( explore.presentation_building_mode ){

      explore.presentation_commands[ explore.presentation_building_slide ].push( [ 'say', '', text ] );

    }
    else {

      if ( isQid( text ) ){

        startSpeakingArticle( '',  text, explore.language );

      }
      else {

        startSpeaking( text );

      }

    }

	});

	lips.env.set( 'set', function(...args) {

    explore.keyboard_ctrl_pressed = false;

    console.log('set commands: ', args );

    let prop  = args.shift().toString();
    let value = args.shift().toString();

    console.log('set: ', prop, ' to: ', value );

    if ( prop === 'language' ){

			if ( explore.presentation_building_mode ){

				explore.presentation_commands[ explore.presentation_building_slide ].push( [ 'set', prop, value ] );

			}
			else {

        setLanguage( value );

      }


    }
    else if ( prop === 'darkmode' ){

      if ( value === 'system' ){ // TODO: not yet implemented in the settings
        //... set darkmode to "system setting"
        console.log('system-darkmode not yet supported.');
      }
      else {

        explore.darkmode = valid( value );
        setDarkmode();

      }

    }

    return 0;

	});

}

async function renderShowCommand( view, list ){

	if ( view === 'image' || view === 'images' ){
		view = 'ImageGrid'; 
	}

	//console.log('view: ', view );
	//console.log('list: ', list );

	if ( view === 'topic' ){

    if ( explore.presentation_building_mode ){

      if ( Array.isArray( list ) ){ // the provided second value should be a language

        if ( explore.wp_languages.hasOwnProperty( list[1] ) ){ // valid language-code

          explore.presentation_commands[ explore.presentation_building_slide ].push( [ 'show', view, list[0], list[1] ] );

        }

      }
      else {

        explore.presentation_commands[ explore.presentation_building_slide ].push( [ 'show', view, list ] );

      }

      //return 0;

    }
    else {

      // check the optional provided language

      if ( valid( list[1] ) ){

        let l =  list[1].toString();

        console.log( 'set language to: ', l );
        setLanguage ( l );

      }

      handleClick({ 
        id        : 'n1-0',
        type      : 'wikipedia-qid',
        title     : '',
        qid       : list[0].toString(),
        language  : explore.language,
        //url       : explore.base + '/app/wikipedia/?t=&l=' + explore.language + '&voice=' + explore.voice_code + '&qid=' + list[0].toString() + '&dir=' + explore.language_direction + '&embedded=' + explore.embedded + '#' + explore.has,
        tag       : '',
        languages : '',
        custom    : '',
        target_pane : 'p1',
      });

    }

	}
	else if ( view === 'compare' ){

    list.forEach( ( q ) => {

      addToCompare( q.toString() );

    });

    if ( explore.presentation_building_mode ){

      explore.presentation_commands[ explore.presentation_building_slide ].push( [ 'show', view, [], [] ] );

    }
    else {

      showCompare();

    }

	}
	else if ( view === 'chemical' ){

		const qid_list = []

    if ( explore.presentation_building_mode ){

      explore.presentation_commands[ explore.presentation_building_slide ].push( [ 'show', view, qid_list, list[0] ] );

    }
    else {

      handleClick({ 
        id        : 'n1-0',
        type      : 'link',
        title     : '',
        language  : explore.language,
        qid       : '',
        url       : `${explore.base}/app/molview/?cid=${list[0].toString()}`,
        tag       : '',
        languages : '',
        custom    : '',
        target_pane : 'p1',
      });

    }


	}
	else if ( view === 'ontology' ){

		const qid_list = list.map( n => n.replace('', '') ).join('%252C').toString();

    if ( explore.presentation_building_mode ){

      explore.presentation_commands[ explore.presentation_building_slide ].push( [ 'show', view, qid_list, list[0] ] );

    }
    else {

      handleClick({ 
        id        : 'n1-0',
        type      : 'link-split',
        title     : '',
        language  : explore.language,
        qid       : '',
        url       : `${explore.base}/app/ontology/?lang=${explore.language}&q=${list[0].toString()}&rp=P279`,
        tag       : '',
        languages : '',
        custom    : '',
        target_pane : 'p1',
      });

      $( '#infoframeSplit2' ).attr({"src": explore.base + '/app/wikipedia/?t=&l=' + explore.language + '&voice=' + explore.voice_code + '&qid=' + list[0].toString() + '&dir=' + explore.language_direction + '&embedded=' + explore.embedded + '#' + explore.hash });

    }

	}
	else if ( view === 'linkgraph' ){

		const qid_list = list.map( n => n.replace('', '') ).join('%252C').toString();

    if ( explore.presentation_building_mode ){

      explore.presentation_commands[ explore.presentation_building_slide ].push( [ 'show', view, qid_list, list[0] ] );

    }
    else {

      handleClick({ 
        id        : 'n1-0',
        type      : 'link-split',
        title     : '',
        language  : explore.language,
        qid       : '',
        url       : `${explore.base}/app/links/?l=${explore.language}&t=&q=${qid_list}`,
        tag       : '',
        languages : '',
        custom    : '',
        target_pane : 'p1',
      });

      $( '#infoframeSplit2' ).attr({"src": explore.base + '/app/wikipedia/?t=&l=' + explore.language + '&voice=' + explore.voice_code + '&qid=' + list[0].toString() + '&dir=' + explore.language_direction + '&embedded=' + explore.embedded + '#' + explore.hash });

    }

	}
	else if ( view === 'map3d' ){

    const qid_list = list.map( n => n.replace('', '') ).join(',').toString();

    if ( explore.presentation_building_mode ){

      explore.presentation_commands[ explore.presentation_building_slide ].push( [ 'show', view, qid_list, list[0] ] );

    }
    else {

      //console.log( qid_list );

      handleClick({ 
        id        : 'n1-0',
        type      : 'link',
        title     : '',
        language  : explore.language,
        qid       : '',
        url       : `${explore.base}/app/map/?l=${explore.language}&qid=${qid_list}`,
        tag       : '',
        languages : '',
        custom    : '',
        target_pane : 'p1',
      });

      $( '#infoframeSplit2' ).attr({"src": explore.base + '/app/wikipedia/?t=&l=' + explore.language + '&voice=' + explore.voice_code + '&qid=' + list[0].toString() + '&dir=' + explore.language_direction + '&embedded=' + explore.embedded + '#' + explore.hash });

     }

	}
	else if ( view === 'map3d-instance-of' ){

    list.forEach(( qid ) => {

      addToMapCompare( `https%3A%2F%2Fquery.wikidata.org%2Fsparql%3Fformat%3Djson%26query%3DSELECT%20DISTINCT%20%3Fitem%20%3FitemLabel%20%3FitemDescription%20%3Fgeoshape%20%3Flat%20%3Flon%20WHERE%20%7B%0A%20%20%20%3Fitem%20p%3AP31%20%3Fstatement0.%0A%20%20%3Fstatement0%20(ps%3AP31)%20wd%3A${ qid }.%20%20%20%0A%20%20%3Fitem%20p%3AP625%20%5B%0A%20%20%20%20%20%20%20%20%20%20%20psv%3AP625%20%5B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20wikibase%3AgeoLatitude%20%3Flat%20%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20wikibase%3AgeoLongitude%20%3Flon%20%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20wikibase%3AgeoGlobe%20%3Fglobe%20%3B%0A%20%20%20%20%20%20%20%20%20%20%20%5D%20%3B%0A%20%20%20%20%20%20%20%20%20%20%20ps%3AP625%20%3Fcoord%0A%20%20%20%20%20%20%20%20%20%5D%20%20%0A%20%20%0A%20%20OPTIONAL%20%7B%20%3Fitem%20wdt%3AP3896%20%3Fgeoshape.%20%7D%0A%0A%0A%20%20SERVICE%20wikibase%3Alabel%20%7B%20bd%3AserviceParam%20wikibase%3Alanguage%20%22${ explore.language }%2Cen%2Cceb%2Csv%2Cde%2Cfr%2Cnl%2Cru%2Cit%2Ces%2Cpl%2Cwar%2Cvi%2Cja%2Czh%2Carz%2Car%2Cuk%2Cpt%2Cfa%2Cca%2Csr%2Cid%2Cno%2Cko%2Cfi%2Chu%2Ccs%2Csh%2Cro%2Cnan%2Ctr%2Ceu%2Cms%2Cce%2Ceo%2Che%2Chy%2Cbg%2Cda%2Cazb%2Csk%2Ckk%2Cmin%2Chr%2Cet%2Clt%2Cbe%2Cel%2Caz%2Csl%2Cgl%2Cur%2Cnn%2Cnb%2Chi%2Cka%2Cth%2Ctt%2Cuz%2Cla%2Ccy%2Cta%2Cvo%2Cmk%2Cast%2Clv%2Cyue%2Ctg%2Cbn%2Caf%2Cmg%2Coc%2Cbs%2Csq%2Cky%2Cnds%2Cnew%2Cbe-tarask%2Cml%2Cte%2Cbr%2Ctl%2Cvec%2Cpms%2Cmr%2Csu%2Cht%2Csw%2Clb%2Cjv%2Csco%2Cpnb%2Cba%2Cga%2Cszl%2Cis%2Cmy%2Cfy%2Ccv%2Clmo%2Cwuu%2Cbn%22.%20%7D%0A%7D%0ALIMIT%20500%0A%23meta%3Asimilar%20topics%20%23defaultView%3ATable &quot;)addToMapCompare( &quot; https%3A%2F%2Fquery.wikidata.org%2Fsparql%3Fformat%3Djson%26query%3DSELECT%20DISTINCT%20%3Fitem%20%3FitemLabel%20%3FitemDescription%20%3Fgeoshape%20%3Flat%20%3Flon%20WHERE%20%7B%0A%20%20%20%3Fitem%20p%3AP31%20%3Fstatement0.%0A%20%20%3Fstatement0%20(ps%3AP31)%20wd%3A${ qid }.%20%20%20%0A%20%20%3Fitem%20p%3AP625%20%5B%0A%20%20%20%20%20%20%20%20%20%20%20psv%3AP625%20%5B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20wikibase%3AgeoLatitude%20%3Flat%20%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20wikibase%3AgeoLongitude%20%3Flon%20%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20wikibase%3AgeoGlobe%20%3Fglobe%20%3B%0A%20%20%20%20%20%20%20%20%20%20%20%5D%20%3B%0A%20%20%20%20%20%20%20%20%20%20%20ps%3AP625%20%3Fcoord%0A%20%20%20%20%20%20%20%20%20%5D%20%20%0A%20%20%0A%20%20OPTIONAL%20%7B%20%3Fitem%20wdt%3AP3896%20%3Fgeoshape.%20%7D%0A%0A%0A%20%20SERVICE%20wikibase%3Alabel%20%7B%20bd%3AserviceParam%20wikibase%3Alanguage%20%22${ explore.language }%2Cen%2Cceb%2Csv%2Cde%2Cfr%2Cnl%2Cru%2Cit%2Ces%2Cpl%2Cwar%2Cvi%2Cja%2Czh%2Carz%2Car%2Cuk%2Cpt%2Cfa%2Cca%2Csr%2Cid%2Cno%2Cko%2Cfi%2Chu%2Ccs%2Csh%2Cro%2Cnan%2Ctr%2Ceu%2Cms%2Cce%2Ceo%2Che%2Chy%2Cbg%2Cda%2Cazb%2Csk%2Ckk%2Cmin%2Chr%2Cet%2Clt%2Cbe%2Cel%2Caz%2Csl%2Cgl%2Cur%2Cnn%2Cnb%2Chi%2Cka%2Cth%2Ctt%2Cuz%2Cla%2Ccy%2Cta%2Cvo%2Cmk%2Cast%2Clv%2Cyue%2Ctg%2Cbn%2Caf%2Cmg%2Coc%2Cbs%2Csq%2Cky%2Cnds%2Cnew%2Cbe-tarask%2Cml%2Cte%2Cbr%2Ctl%2Cvec%2Cpms%2Cmr%2Csu%2Cht%2Csw%2Clb%2Cjv%2Csco%2Cpnb%2Cba%2Cga%2Cszl%2Cis%2Cmy%2Cfy%2Ccv%2Clmo%2Cwuu%2Cbn%22.%20%7D%0A%7D%0ALIMIT%20500%0A%23meta%3Asimilar%20topics%20%23defaultView%3ATable` );

    });

    if ( explore.presentation_building_mode ){

      explore.presentation_commands[ explore.presentation_building_slide ].push( [ 'show', view, [], [] ] );

    }
    else {

      showMapCompare();

      // TODO: allow the user to reset the data from the map-app
      //explore.map_compares = [];

    }

	}
	else { // use the sparql-query-view tool

		// TODO: check that each item in the list is a valid entity-ID

		const qid_list = list.map( n => n.replace('Q', 'wd%3AQ') ).join('%20').toString();

    const url_ = `https://${ explore.host }${explore.base}/app/query/embed.html#SELECT%20%3Fitem%20%3FitemLabel%20%3Fdied%20%3Fborn%20%3Finception%20%3Fpublication%20%3Fstart%20%3Fend%20%20%3Fimg%20%3Fcoordinate%20%3Fgeoshape%20WHERE%20%7B%0A%20%20VALUES%20%3Fitem%20%7B%20${ qid_list }%20%7D%0A%20%20%3Fitem%20wdt%3AP31%20%3Fclass.%0A%20%20OPTIONAL%20%7B%20%3Fitem%20wdt%3AP18%20%3Fimg.%20%7D%0A%20%20OPTIONAL%20%7B%20%3Fitem%20wdt%3AP625%20%3Fcoordinate.%20%7D%0A%20%20OPTIONAL%20%7B%20%3Fitem%20wdt%3AP3896%20%3Fgeoshape.%20%7D%0A%20%20OPTIONAL%20%7B%20%3Fitem%20wdt%3AP571%20%3Finception.%20%7D%0A%20%20OPTIONAL%20%7B%20%3Fitem%20wdt%3AP577%20%3Fpublication.%20%7D%0A%20%20OPTIONAL%20%7B%20%3Fitem%20wdt%3AP569%20%3Fborn.%20%7D%0A%20%20OPTIONAL%20%7B%20%3Fitem%20wdt%3AP570%20%3Fdied.%20%7D%20%20%0A%20%20OPTIONAL%20%7B%20%3Fitem%20wdt%3AP580%20%3Fstart.%20%7D%0A%20%20OPTIONAL%20%7B%20%3Fitem%20wdt%3AP581%20%3Fend.%20%7D%0A%20%20SERVICE%20wikibase%3Alabel%20%7B%20bd%3AserviceParam%20wikibase%3Alanguage%20%22${ explore.language }%2Cen%22.%20%7D%0A%7D%0A%0A%23defaultView%3A${ view.charAt(0).toUpperCase() + view.slice(1) }%0A%23meta%3Alist%20of%20entities`;

    console.log( url_ );

    if ( explore.presentation_building_mode ){

      explore.presentation_commands[ explore.presentation_building_slide ].push( [ 'show', view, qid_list, list[0] ] );

    }
    else {

      handleClick({ 
        id        : 'n1-0',
        type      : 'link-split',
        title     : '',
        language  : explore.language,
        qid       : '',
        url       : `${explore.base}/app/query/embed.html#SELECT%20%3Fitem%20%3FitemLabel%20%3Fdied%20%3Fborn%20%3Finception%20%3Fpublication%20%3Fstart%20%3Fend%20%20%3Fimg%20%3Fcoordinate%20%3Fgeoshape%20WHERE%20%7B%0A%20%20VALUES%20%3Fitem%20%7B%20${ qid_list }%20%7D%0A%20%20%3Fitem%20wdt%3AP31%20%3Fclass.%0A%20%20OPTIONAL%20%7B%20%3Fitem%20wdt%3AP18%20%3Fimg.%20%7D%0A%20%20OPTIONAL%20%7B%20%3Fitem%20wdt%3AP625%20%3Fcoordinate.%20%7D%0A%20%20OPTIONAL%20%7B%20%3Fitem%20wdt%3AP3896%20%3Fgeoshape.%20%7D%0A%20%20OPTIONAL%20%7B%20%3Fitem%20wdt%3AP571%20%3Finception.%20%7D%0A%20%20OPTIONAL%20%7B%20%3Fitem%20wdt%3AP577%20%3Fpublication.%20%7D%0A%20%20OPTIONAL%20%7B%20%3Fitem%20wdt%3AP569%20%3Fborn.%20%7D%0A%20%20OPTIONAL%20%7B%20%3Fitem%20wdt%3AP570%20%3Fdied.%20%7D%20%20%0A%20%20OPTIONAL%20%7B%20%3Fitem%20wdt%3AP580%20%3Fstart.%20%7D%0A%20%20OPTIONAL%20%7B%20%3Fitem%20wdt%3AP581%20%3Fend.%20%7D%0A%20%20SERVICE%20wikibase%3Alabel%20%7B%20bd%3AserviceParam%20wikibase%3Alanguage%20%22${ explore.language }%2Cen%22.%20%7D%0A%7D%0A%0A%23defaultView%3A${ view.charAt(0).toUpperCase() + view.slice(1) }%0A%23meta%3Alist%20of%20entities`,
        tag       : '',
        languages : '',
        custom    : '',
        target_pane : 'p1',
      });


      $( '#infoframeSplit2' ).attr({"src": explore.base + '/app/wikipedia/?t=&l=' + explore.language + '&voice=' + explore.voice_code + '&qid=' + list[0].toString() + '&dir=' + explore.language_direction + '&embedded=' + explore.embedded + '#' + explore.hash });

    }

	}

}


async function setupEditor() {

  let langTools = ace.require("ace/ext/language_tools");

	/*
	// see: https://github.com/ajaxorg/ace/issues/3905#issuecomment-472091655
	let TextHighlightRules = ace.require("ace/mode/text_highlight_rules").TextHighlightRules
	TextHighlightRules.prototype.createKeywordMapper = function(
			 map, defaultToken, ignoreCase, splitChar
	) {
	let keywords  = this.$keywords = Object.create(null);

	explore.editor.session.$mode.$highlightRules.$keywords["foo"] = "variable.language
	*/

	//explore.editor = ace.edit("editor");
	explore.editor.session.setMode("ace/mode/scheme");
	explore.editor.setTheme("ace/theme/chaos");

	//explore.editor.setKeyboardHandler("ace/keyboard/vim");

	// Ace-editor options
	explore.editor.setOptions({
		enableBasicAutocompletion: true,
		enableSnippets: true,
		enableLiveAutocompletion: false,

		//fontFamily: explore.font1,
		fontSize: parseFloat( explore.fontsize ),

		tabSize: 1,
		useSoftTabs: true,
	});

  explore.editor.setShowPrintMargin(false);

	if ( explore.editor.completer) {
		explore.editor.completer.exactMatch = true;
		explore.editor.completer.autoSelect = false;
		//explore.editor.completer.keyboardHandler.removeCommand('Tab');
	}

	// custom autocomplete definition
	let wikidataPropertyCompleter = {
		getCompletions: function(editor, session, pos, prefix, callback) {
			if (prefix.length === 0) { callback(null, []); return }

			$.getJSON(

				datasources.wikidata.instance_api + '?origin=*&action=wbsearchentities&format=json&limit=50&continue=0&language=' + explore.language + '&uselang=' + explore.language + '&search=' + prefix + '&type=property',

				function( item ) {

					callback(null, item.search.map(function( item, index ) {

						//console.log( item, index );

						return {
							value:		item.id,
              caption:	item.label,
							meta:			item.description + ' (' + item.id + ')',
              //score:    0,
						}

					}));

				}

			)
		},

	}

	// custom autocomplete definition
	let wikidataEntityCompleter = {
		getCompletions: function(editor, session, pos, prefix, callback) {
			if (prefix.length === 0) { callback(null, []); return }

			$.getJSON(

        datasources.wikidata.instance_api + '?origin=*&action=wbsearchentities&format=json&limit=50&continue=0&language=' + explore.language + '&uselang=' + explore.language + '&search=' + prefix + '&type=item',

				function( item ) {

					callback(null, item.search.map(function( item, index ) {

						//console.log( item, index );

						return {
							value:		item.id,
              caption:	item.label,
							meta:			item.description + ' (' + item.id + ')',
						}

					}));

				}

			)
		},

	}

	/*
	// custom autocomplete definition
	let rhymeCompleter = {
		getCompletions: function(editor, session, pos, prefix, callback) {
			if (prefix.length === 0) { callback(null, []); return }

			$.getJSON( "http://rhymebrain.com/talk?function=getRhymes&word=" + prefix,

				function(wordList) {
					// wordList like [{"word":"flow","freq":24,"score":300,"flags":"bc","syllables":"1"}]
					callback(null, wordList.map(function(ea) {
						return {name: ea.word, value: ea.word, score: ea.score, meta: "rhyme"}
					}));
				}

			)
		}
	}
	*/

	let conzeptCommandCompleter = {

		getCompletions: function( editor, session, pos, prefix, callback){

			let wordList = ['query', 'set', 'show', 'search'];

			callback( null, wordList.map( function( word ){

				return { caption: word, value: word, meta: "Conzept command function" };

			}));

		}

	}

	// add the custom autocomplete function
	langTools.addCompleter( wikidataEntityCompleter );
	langTools.addCompleter( wikidataPropertyCompleter );
	langTools.addCompleter( conzeptCommandCompleter );

	explore.editor.commands.addCommand({

		name: 'execute',

		bindKey: {
			win: 'Ctrl-ENTER',
			mac: 'Command-ENTER',
		},

		exec: function() {
			runLISP( explore.editor.getValue() );
		}

	});

}

async function highlightLISP(){

  // visually highlight entities
  $('span.ace_identifier:contains("Q")').css({
    'background': '#2e8d41b8',
  });

}

async function runLISP( code ) {

  "use strict";

  //highlightLISP();

  // FIXME: small hack (until there is some better UI for this)
  stopSpeakingArticle();

  // update URL command-param state
  explore.commands = explore.editor.getValue();
  setParameter( 'commands', encodeURIComponent( explore.commands ), explore.hash );
  //setParameter( 'commands', encodeURIComponent( explore.commands.replace('<', '%253C').replace('>', '%253E') ), explore.hash );
  //setParameter( 'commands', encodeURIComponent( JSON.stringify( explore.commands ) ), explore.hash );

	//console.log( 'explore.commands now: ', explore.commands );
	//console.log( 'commands paramater now: ', getParameterByName('commands') );

	//console.log( 'in: ', code );

	explore.lisp( code, true ).then( function( results ) {

		console.log( 'results: ', results );

		results.forEach( function(result) {

			if ( valid( result ) ){

				console.log( 'out: ', result );
				//console.log( 'out: ', result.toString() );

			}
			else {

				console.log( 'invalid: ', result );

			}

		});

	});

}

async function setupUI() {

  // FIXME cleanup / order this code

  // sticky header
  $(window).scroll(function(){

    const sticky = $('.sticky');
    const scroll = $(window).scrollTop();

    if ( scroll >= 100 ){
      sticky.addClass('fixed');
    }
    else {
      sticky.removeClass('fixed');
    }
  });

  $('select').formSelect(); // required MaterializeCSS "select"-init

  // close inactive details 
  $('details.auto').click(function (event) {
    $('details.auto').not(this).removeAttr("open");  
  });

  if ( !explore.isMobile ){

    determineWidthSplitter();

  }

  // screen resizing
  $( window ).resize(function() {

    if (window.matchMedia("(orientation: portrait)").matches) {
      explore.deviceOrientation = 'portrait';
    }

    if (window.matchMedia("(orientation: landscape)").matches) {
      explore.deviceOrientation = 'landscape';
    }

    if ( !explore.isMobile ){ // tablets & desktops

      if ( explore.splitter === undefined ){
        // do nothing
      }
      else {

        // resize splitter dimensions
        $('#splitter').css({ width : $(window).width(), height: $(window).height() });

        // resize sidebar
        $('div.sticky').css({ 'width' : explore.splitter.position() });

        explore.splitter.refresh();
      }

      resizeEmbeddedSplitter();

    }

  });

  // initial sticky header width
  $('.sticky').width( $('#sidebar').css('width') );
  $('#srsearch').focus();
  $('#srsearch').change( function( e ) {

    $('#srsearch').val();
    explore.q = getSearchValue();

    if ( explore.q ) {

      if ( valid( explore.tab ) ){
        explore.tabsInstance.select( explore.tab );
        explore.tab = '';
      }
      else if ( explore.isMobile === false ){
        explore.tabsInstance.select('tab-topics');
      }

    }

  });

}


// =======================

async function showRandomTopicItem( prop, topic ) {

  let qid = '';

  // the "topic" can be a Qid or an topic-indicator-string (requiring a lookup)
	if ( isQid( topic ) ){

    qid = topic;

  }
  else { // topic-string

    // TODO: verify the topic-list is valid
    qid = 'Q' + indicators[topic].value[ getRandomInt( indicators[topic].value.length ) ];

  }

  let item_qid    = '';
  let item_label  = '';

	const url = 'https://query.wikidata.org/sparql?format=json&query=SELECT%20%3Fitem%20%3FitemLabel%20(MD5(CONCAT(str(%3Fitem)%2Cstr(RAND())))%20as%20%3Frandom)%20%0AWHERE%20%0A%7B%0A%20%20%3Fitem%20wdt%3A' + prop + '%20wd%3A' + qid + '.%0A%20%20SERVICE%20wikibase%3Alabel%20%7B%20bd%3AserviceParam%20wikibase%3Alanguage%20%22' + explore.language + '%2Cen%22.%20%7D%0A%7D%0AORDER%20BY%20%3Frandom%0ALIMIT%201';

  $.ajax({ // fetch sparql-data

		url: url,

		// The name of the callback parameter, as specified by the YQL service
		jsonp: "callback",

		// Tell jQuery we're expecting JSONP
		dataType: "json",

		// Work with the response
		success: function( response ) {

			console.log( response );

			// TODO: check that we have valid results
			let json = response.results.bindings || [];

			if ( typeof json === undefined || typeof json === 'undefined' ){
        $('#blink').hide();
				return 1; // no more results
			}
			else if ( json.length === 0 ) { // no more results
        $('#blink').hide();
				return 0;
			}

			json.forEach(( v ) => {

        if ( valid( v.itemLabel.value ) ){
          item_label  = v.itemLabel.value;
          item_qid    = v.item.value.replace( 'http://www.wikidata.org/entity/', '' );
        }

			});

      // show sidebar-results
			handleClick({ 
        id        : 'n1-0',
				type      : 'explore',
				title     : item_label,
				language  : explore.language,
				qid       : item_qid,
				url       : '',
				tag       : '',
				languages : '',
				custom    : '',
				target_pane : 'p0',
			});

		},  
  
  }); 

}

async function showRandomOrganism( ){

  const list = [ 'mammal', 'bird', 'reptile', 'fish', 'amphibian', 'insect', 'spider', 'plant', 'algae', 'fungus', 'protist', 'bacterium', 'archae', 'virus' ];
  const nr  = Math.floor( Math.random() * list.length );

  showRandomListItem( list[ nr ] );

}

async function showRandomRadioStation(){

  $('#blink').show();

  $.ajax({

		url: 'https://nl1.api.radio-browser.info/json/stations/bylanguageexact/' + explore.language_name.toLowerCase(),

		dataType: "json",

		success: function( response ) {

			let json = response || [];

			if ( typeof json === undefined || typeof json === 'undefined' ){
        $('#blink').hide();

        $.toast({
          heading: 'no results found',
          text: '',
          hideAfter : 2000,
          stack : 1,
          showHideTransition: 'slide',
          icon: 'info'
        })

				return 1; // no more results
			}
			else if ( json.length === 0 ) { // no more results

        $('#blink').hide();

        $.toast({
          heading: 'no results found',
          text: '',
          hideAfter : 2000,
          stack : 1,
          showHideTransition: 'slide',
          icon: 'info'
        })

				return 0;

			}

      const nr      = Math.floor( Math.random() * json.length );
      const station = json[ nr ];

      // sidebar results
      handleClick({ 
        id        : 'n1-0',
        type      : 'articles',
        title     : station.name,
        language  : explore.language,
        qid       : '',
        url       : '',
        tag       : '',
        languages : '',
        custom    : '',
        target_pane : 'p0',
      });

      // content pane
      handleClick({ 
        id        : 'n1-0',
        type      : 'link',
        title     : station.name,
        language  : explore.language,
        qid       : '',
        url       : station.url_resolved,
        tag       : '',
        languages : '',
        custom    : '',
        target_pane : 'p1',
      });

    }

  });

}

async function showRandomListItem( name ){

  $('#blink').show();

  // data creation steps:
  //  wdtaxonomy Q7377 -P P171 --brief -f csv -o /tmp/foo.csv
  //  sed -nr 's/.*,Q([0-9]*),.*$/\1/p' foo.csv | paste -sd "," - > NAME.json
  //  scp -P22000 NAME.js jama@wikischool.org:/var/www/html/conze.pt' + explore.base + '/app/explore2/assets/json/lists/

  let url = '';

  if ( name === 'featured-article' ){ // non-standard URL

    url = explore.base + '/app/explore2/assets/json/lists/featured-article/' + explore.language + '.json';

  }
  else if ( name === 'featured-portal' ){ // non-standard URL

    url = explore.base + '/app/explore2/assets/json/lists/featured-portal/' + explore.language + '.json';

  }
  else { // standard URL

    url = explore.base + '/app/explore2/assets/json/lists/' + name + '.json';

  }

  fetch( url )
    .then(response => response.json())
    .then( list => {

      const nr  = Math.floor( Math.random() * list.length );
      let qid = 'Q' + list[ nr ];
      let other_id = '';

      if ( name === 'country-map' ){ // split QID|OSMID

        const fields = qid.split('|');
        qid = fields[0];
        other_id = fields[1];

      }

      let promiseB = fetchLabel([ qid ], explore.language ).then(function(result) {

        let label = '';

        if ( valid( result.entities ) ){

          if ( result.entities[ qid ]?.labels[ explore.language ] ){

            label = result.entities[ qid ].labels[ explore.language ].value;

            // sidebar results
            handleClick({ 
              id        : 'n1-0',
              type      : 'articles',
              title     : label,
              language  : explore.language,
              qid       : '' + qid,
              url       : '',
              tag       : '',
              languages : '',
              custom    : '',
              target_pane : 'p0',
            });

            // content pane info
            if ( name === 'country-map' ){ // split QID|OSMID

              handleClick({ 
                id        : 'n1-0',
                type      : 'link',
                title     : label,
                language  : explore.language,
                qid       : '' + qid,
                url       : `${explore.base}/app/map/?l=${explore.language}&bbox=&osm_id=${other_id}&qid=${qid}&title=${label}`,
                tag       : '',
                languages : '',
                custom    : '',
                target_pane : 'p1',
              });

            }
            else {

              handleClick({ 
                id        : 'n1-0',
                type      : 'wikipedia-qid',
                title     : label,
                language  : explore.language,
                qid       : '' + qid,
                url       : '',
                tag       : '',
                languages : '',
                custom    : '',
                target_pane : 'p1',
              });

            }

          }
          else {

            handleClick({ 
              id        : 'n1-0',
              type      : 'wikipedia-qid',
              title     : '',
              language  : explore.language,
              qid       : '' + qid,
              url       : '',
              tag       : '',
              languages : '',
              custom    : '',
              target_pane : 'p1',
            });

          }

        }
        else {

          $.toast({
              heading: 'no results found',
              text: '',
              hideAfter : 2000,
              stack : 1,
              showHideTransition: 'slide',
              icon: 'info'
          })

        }

      });

    });

}

async function showRandomLanguage(){

  $('#blink').show();

  const nr  = Math.floor( Math.random() * Object.keys( wp_languages ).length );
  const qid = 'Q' + wp_languages[ Object.keys( wp_languages )[ nr ] ].qid;

  let promiseB = fetchLabel([ qid ], explore.language ).then(function(result) {

    let label = '';

    if ( ! valid( result.entities[ qid ] ) ){

      console.log('missing language-qid for: ', wp_languages[ Object.keys( wp_languages )[ nr ] ] );

      return 1;

    }

    if ( result.entities[ qid ]?.labels[ explore.language ] ){

      label = result.entities[ qid ].labels[ explore.language ].value;

      handleClick({ 
        id        : 'n1-0',
        type      : 'articles',
        title     : label,
        language  : explore.language,
        qid       : '' + qid,
        url       : '',
        tag       : '',
        languages : '',
        custom    : '',
        target_pane : 'p0',
      });

      handleClick({ 
        id        : 'n1-0',
        type      : 'wikipedia-qid',
        title     : label,
        language  : explore.language,
        qid       : '' + qid,
        url       : '',
        tag       : '',
        languages : '',
        custom    : '',
        target_pane : 'p1',
      });

    }
    else {

      handleClick({ 
        id        : 'n1-0',
        type      : 'wikipedia-qid',
        title     : '',
        language  : explore.language,
        qid       : '' + qid,
        url       : '',
        tag       : '',
        languages : '',
        custom    : '',
        target_pane : 'p1',
      });

    }

  });

}

async function showRandomCountry(){

  const nr  = Math.floor( Math.random() * Object.keys( countries ).length );
  const qid = Object.keys( countries )[ nr ];

  let promiseB = fetchLabel([ qid ], explore.language ).then(function(result) {

    const label = result.entities[ qid ].labels[ explore.language ].value;

    // show results
    handleClick({ 
      id        : 'n1-0',
      type      : 'explore',
      title     : label,
      language  : explore.language,
      qid       : '' + qid,
      url       : '',
      tag       : '',
      languages : '',
      custom    : '',
      target_pane : 'p0',
    });

  });

}

async function showRandomDocumentary(){

  $('#blink').show();

  const chance  = 10;
  const rnd     = Math.random() * 100;

  if ( rnd < chance ) {

    showArchiveDocumentary();

  }
  else {

    showRandomYoutubeDocumentary();

  }

}

async function showRandomYoutubeDocumentary() {

  const year = new Date().getFullYear() - getRandomInt( 600 );
  const randomNumber = getRandomInt( 99 ) + 1;

  const randomBCCentury = getRandomInt( 1100 );
  const randomADCentury = getRandomInt( 1500 );

  let explore_string  = 'documentary ';

  const chance  = 10;
  const rnd     = Math.random() * 100;

  // random choice between century and year
  if ( rnd < chance ) {

    explore_string += randomBCCentury + ' BC';

  }
  else if ( rnd < chance * 2) {

    explore_string += randomADCentury + ' AD';

  }
  else {

    explore_string += year;

  }

  // show sidebar-results
  handleClick({ 
    id        : 'n1-0',
    type      : 'articles',
    title     : '' + explore_string.replace('documentary ', ''),
    language  : explore.language,
    qid       : '',
    url       : '',
    tag       : '',
    languages : '',
    custom    : '',
    target_pane : 'p0',
  });

  // open link in content-pane
  handleClick({ 
    id        : '0',
    type      : 'wander',
    title     : explore_string,
    language  : explore.language,
    qid       : '',
    url       : '',
    tag       : '',
    languages : '',
    custom    : 'long',
    target_pane : 'p1',
  });

}

async function showArchiveDocumentary() {

  let id              = '';
  let explore_string  = ''; // author, work title

	const year = new Date().getFullYear() - getRandomInt( 120 );
  const randomNumber = getRandomInt( 99 ) + 1;

	const url = 'https://archive.org/advancedsearch.php?q=(documentary ' + randomNumber + ')+and+mediatype%3Amovies+and+year%3A' + year + '+and+item_size%3A%5B%2250000000%22%20TO%2010000000000%5D' + '&rows=1&page=1&output=json';

	console.log( url );

  $.ajax({ // fetch sparql-data

		url: url,
		jsonp: "callback",
		dataType: "json",

		success: function( response ) {

			let json = response.response.docs || [];

			if ( typeof json === undefined || typeof json === 'undefined' ){
        $('#blink').hide();
				return 1; // no more results
			}
			else if ( json.length === 0 ) { // no more results

        showArchiveDocumentary(); // search again
				return 0;

			}

      const item = json[0];

      if ( valid( item ) ){

        // set explore-query-string
        if ( valid( item.creator ) ){ // try creator-field

          if ( Array.isArray( item.creator ) ){

            explore_string = item.creator[0];

          }
          else {

            explore_string = item.creator;

          }

        }

        if ( explore_string === '' ){ // try "subject"-field

          if ( valid( item.subject ) ){

            if ( Array.isArray( item.subject ) ){

              explore_string = item.subject[0];

            }
            else {

              explore_string = item.subject;

            }

          }

        }


        if ( explore_string === '' ){ // try title-field

          if ( valid( item.title ) ){

            explore_string = item.title;

          }

        }

        if ( explore_string === '' ){ // still no title-string

          console.log( 'no usable title string found in this item: ',  item );
          explore_string = 'documentary';

        }

        // set item ID
        if ( valid( item.identifier ) ){

          id = item.identifier;

        }

      }
    
      // show sidebar-results
			handleClick({ 
        id        : 'n1-0',
				type      : 'articles',
				title     : explore_string,
				language  : explore.language,
				qid       : '',
				url       : '',
				tag       : '',
				languages : '',
				custom    : '',
				target_pane : 'p0',
			});

			// open link in content-pane
			handleClick({ 
        id        : '0',
				type      : 'link',
				title     : explore_string,
				language  : explore.language,
				qid       : '',
				url       : 'https://archive.org/details/' + id + '&autoplay=1',
				tag       : '',
				languages : '',
				custom    : '',
				target_pane : 'p1',
			});

		},  
  
  }); 

}

async function showRandomMusic(){

  $('#blink').show();

  const chance  = 90;
  const rnd     = Math.random() * 100;

  if ( rnd < chance ) {

    showArchiveMusic();

  }
  else {

    showWikidataMusic();

  }

}

async function showArchiveMusic() {

  let id              = '';
  let explore_string  = ''; // author, work title

	const year = new Date().getFullYear() - getRandomInt( 100 );
  const randomNumber = getRandomInt( 99 ) + 1;

	const url = 'https://archive.org/advancedsearch.php?q=(' + randomNumber + ')+and+mediatype%3Aaudio+and+year%3A' + year + '&rows=1&page=1&output=json';

  $.ajax({ // fetch sparql-data

		url: url,
		jsonp: "callback",
		dataType: "json",

		success: function( response ) {

			let json = response.response.docs || [];

			if ( typeof json === undefined || typeof json === 'undefined' ){
        $('#blink').hide();
				return 1; // no more results
			}
			else if ( json.length === 0 ) { // no more results

        showRandomMusic(); // search again
				return 0;

			}

      const item = json[0];

      if ( valid( item ) ){

        // set explore-query-string
        if ( valid( item.creator ) ){ // try creator-field

          if ( Array.isArray( item.creator ) ){

            explore_string = item.creator[0];

          }
          else {

            explore_string = item.creator;

          }

        }

        if ( explore_string === '' ){ // try "subject"-field

          if ( valid( item.subject ) ){

            if ( Array.isArray( item.subject ) ){

              explore_string = item.subject[0];

            }
            else {

              explore_string = item.subject;

            }

          }

        }


        if ( explore_string === '' ){ // try title-field

          if ( valid( item.title ) ){

            explore_string = item.title;

          }

        }

        if ( explore_string === '' ){ // still no title-string

          explore_string = 'music';

        }

        // set item ID
        if ( valid( item.identifier ) ){

          id = item.identifier;

        }

      }
    
      // show sidebar-results
			handleClick({ 
        id        : 'n1-0',
				type      : 'articles',
				title     : explore_string,
				language  : explore.language,
				qid       : '',
				url       : '',
				tag       : '',
				languages : '',
				custom    : '',
				target_pane : 'p0',
			});

			// open link in content-pane
			handleClick({ 
        id        : '0',
				type      : 'link',
				title     : explore_string,
				language  : explore.language,
				qid       : '',
				url       : 'https://archive.org/details/' + id + '&autoplay=1',
				tag       : '',
				languages : '',
				custom    : '',
				target_pane : 'p1',
			});

		},  
  
  }); 

}

async function showWikidataMusic() {

  $('#blink').show();

  let audio_url   = '';

  let title       = '';
  let author      = '';
  let author_qid  = '';

  let item_qid    = '';
  let item_label  = '';

	const upper_year = new Date().getFullYear() - 70 - getRandomInt( 200 );
	const lower_year = upper_year - getRandomInt( 50 );

	const url = datasources.wikidata.endpoint + '?format=json&query=SELECT%20DISTINCT%20%3Fitem%20%3FitemLabel%20%3Faudio%20%3Fcreator%20%3FcreatorLabel%20%3Finception%0AWHERE%20%0A%7B%0A%20%20%3Fitem%20wdt%3AP31%20wd%3AQ105543609%20.%0A%20%20%3Fitem%20wdt%3AP51%20%3Faudio%20.%0A%20%20OPTIONAL%20%7B%20%3Fitem%20wdt%3AP86%20%3Fcreator.%20%7D%20%0A%20%20%3Fitem%20wdt%3AP571%20%3Finception.%20%20%0A%20%20FILTER%20(%3Finception%20%3C%20%22' + upper_year + '-12-01T00%3A00%3A00Z%22%5E%5Exsd%3AdateTime)%0A%20%20FILTER%20(%3Finception%20%3E%20%22' + lower_year + '-01-01T00%3A00%3A00Z%22%5E%5Exsd%3AdateTime)%20%20%20%0A%20%20SERVICE%20wikibase%3Alabel%20%7B%20bd%3AserviceParam%20wikibase%3Alanguage%20%22' + explore.language + '%2Cen%22.%20%7D%0A%7D%20ORDER%20BY%20%3Finception%0ALIMIT%2010%0A%0A';

  $.ajax({ // fetch sparql-data

		url: url,
		jsonp: "callback",
		dataType: "json",

		success: function( response ) {

			// TODO: check that we have valid results
			let json = response.results.bindings || [];

			if ( typeof json === undefined || typeof json === 'undefined' ){
        $('#blink').hide();
				return 1; // no more results
			}
			else if ( json.length === 0 ) { // no more results

        $('#blink').hide();
        showRandomMusic(); // search again
				return 0;

			}

      for (let i = 0; i < json.length; i++){

        const v = json[i];

        if ( valid( v.itemLabel.value ) ){
          item_label  = v.itemLabel.value;
          item_qid    = v.item.value.replace( 'http://www.wikidata.org/entity/', '' );
        }

        // TODO: handle items with multiple authors?
        if ( valid( v.creatorLabel ) ){

          if ( valid( v.creatorLabel.value ) ){

            author_qid  = v.creatorLabel.value.replace( 'http://www.wikidata.org/entity/', '' );
            author      = v.creatorLabel.value;

          }

        }

        if ( valid( v.audio.value ) ){

          let f = v.audio.value;

          if (  f.toLowerCase().endsWith('.mid') || // unsupported audio formats
                f.toLowerCase().endsWith('.midi')
              ){

				    continue;

          }
          else {

            audio_url = encodeURIComponent( f.replace( 'http:', 'https:' ) );

            break;

          }

        }

			};

      // show sidebar-results
			handleClick({ 
        id        : 'n1-0',
				type      : 'articles',
				title     : author,
				language  : explore.language,
				qid       : author_qid,
				url       : '',
				tag       : '',
				languages : '',
				custom    : '',
				target_pane : 'p0',
			});

			// open link in content-pane
			handleClick({ 
        id        : '0',
				type      : 'link',
				title     : author,
				language  : explore.language,
				qid       : item_qid,
				url       : explore.base + '/app/audio/?url=' + encodeURIComponent( explore.base + '/app/cors/raw/?url=' + audio_url ),
				tag       : '',
				languages : '',
				custom    : '',
				target_pane : 'p1',
			});

		},  
  
  }); 

}

async function showRandomEuropeanaArtwork() {

  $('#blink').show();

	let view_url    = '';
  let title       = '';
  let item_qid    = '';
  let author      = '';
  let author_qid  = '';

	const url = 'https://www.europeana.eu/api/v2/search.json?wskey=4ZViVZKMe&rows=50&query=' + encodeURIComponent( explore.country_name ) + '&theme=art';

  console.log( url );

  $.ajax({ // fetch sparql-data

		url: url,
		jsonp: "callback",
		dataType: "json",

		success: function( response ) {

      //console.log( response );

			// TODO: check that we have valid results
			let json = response.items || [];

			if ( typeof json === undefined || typeof json === 'undefined' ){
        $('#blink').hide();
				return 1; // no more results
			}
			else if ( json.length === 0 ) { // no more results

        $('#blink').hide();
				return 0;

			}

			const v = json.at( 2 );

			console.log( v );

			if ( valid( v.edmPreview ) ){

				console.log( '0: ', v.edmPreview[0] );

				//if ( valid( v.image  ) ){

          let label     = '';
          let label_url = '';
          let img       = '';
          let thumb     = '';
          let view_url 	= '';
          let desc      = '';
          let desc_plain= '';
          let subtitle  = '';

          let authors       = '';
          let authors_plain = '';

          let provider      = '';

					let attribution = '';
  
          if ( typeof v.title === undefined || typeof v.title === 'undefined' ){
            label = '---';
          }
          else {

            label  = v.title[0];

          }

          if ( valid( v.year ) ){

            if ( valid( v.year[0] ) ){

              desc = v.year[0];

            }

          }

          if ( valid( v.edmIsShownAt ) ){

            label_url  = v.edmIsShownAt[0];

          }

          if ( typeof v.dcDescription === undefined || typeof v.dcDescription === 'undefined' ){
            // do nothing
          }
          else {

            desc  += '';

            desc_plain = encodeURIComponent( v.dcDescription[0] );

          }

          if ( typeof v.dcCreator === undefined || typeof v.dcCreator === 'undefined' ){
            // do nothing
          }
          else {

            $.each( v.dcCreator, function ( j, name ) {

              if ( typeof name === undefined ){

                console.log('author undefined! skipping...');

                return 0;

              }
              else if ( name.startsWith( 'http' ) ){

                return 0;

              }

              // TODO: needs more name cleanups
              name = name.replace(/[#]/g, '').replace(/_/g, ' ').replace('Künstler/in', '').trim();

              authors_plain += name;

              let author_name = encodeURIComponent( name );

            });

          }

          if ( typeof v.dataProvider === undefined || typeof v.dataProvider === 'undefined' ){
            // do nothing
          }
          else {

            subtitle = v.dataProvider[0];
            provider = v.dataProvider[0];

          }

					console.log('1');

					if ( valid( v.edmPreview[0] ) ){

						console.log('2');

						img = v.edmPreview[0];

						// create IIIF-viewer-link
						let coll = { "images": [ ]};

						coll.images.push( [ img, label, desc_plain, authors_plain + '<br>', provider ] ); // TODO: add an extra field to the IIIF-field for "url" using "v.links.web" ?

						if ( coll.images.length > 0 ){ // we found some images

							// create an IIIF image-collection file
							let iiif_manifest_link = '/app/response/iiif-manifest?l=en&single=true&t=' + label + '&json=' + JSON.stringify( coll );

							view_url = '/app/iiif/#?c=&m=&s=&cv=&manifest=' + encodeURIComponent( iiif_manifest_link );

							console.log( view_url );

							//view_url = encodeURIComponent( JSON.stringify( encodeURIComponent( iiif_viewer_url ) ) );

						}

					}

				//}

			};

			// open link in content-pane

			/*
      // show sidebar-results
			handleClick({ 
        id        : 'n1-0',
				type      : 'articles',
				title     : author,
				language  : explore.language,
				qid       : '', //author_qid,
				url       : '',
				tag       : '',
				languages : '',
				custom    : '',
				target_pane : 'p0',
			});
			*/

			console.log( view_url );

      // show image in content-pane
			handleClick({ 
				id        : '000',
				type      : 'link',
				title     : '',
				language  : explore.language,
				qid       : '',
				url       : view_url,
				tag       : '',
				languages : '',
				custom    : '',
				target_pane : 'p1',
			});

		},
  
  }); 


}

async function showRandomArtwork() {

  $('#blink').show();

	let view_url    = '';
  let title       = '';
  let item_qid    = '';
  let author      = '';
  let author_qid  = '';

	const upper_year = new Date().getFullYear() - getRandomInt( 250 );
	const lower_year = upper_year - getRandomInt( 20 );

	const url = datasources.wikidata.endpoint + '?format=json&query=SELECT%20DISTINCT%20%3Finception%20%3Fitem%20%3FcreatorLabel%20%3Fcreator%20%3FitemLabel%20%3Fimage%20WHERE%20%7B%0A%20%20%3Fitem%20wdt%3AP31%20wd%3AQ3305213.%0A%20%20%3Fitem%20wdt%3AP18%20%3Fimage.%0A%20%20OPTIONAL%20%7B%20%3Fitem%20wdt%3AP170%20%3Fcreator.%20%7D%0A%20%20%3Fitem%20wdt%3AP571%20%3Finception.%0A%20%20FILTER%20(%3Finception%20%3C%20%22' + upper_year + '-12-01T00%3A00%3A00Z%22%5E%5Exsd%3AdateTime)%0A%20%20FILTER%20(%3Finception%20%3E%20%22' + lower_year + '-01-01T00%3A00%3A00Z%22%5E%5Exsd%3AdateTime)%20%20%0A%20%20SERVICE%20wikibase%3Alabel%20%7B%20bd%3AserviceParam%20wikibase%3Alanguage%20%22' + explore.language + '%2Cen%22%7D%0A%7D%20ORDER%20BY%20%3Finception%0ALIMIT%201%0A%23meta%3Aart%20%0A%23defaultView%3AImageGrid';

  $.ajax({ // fetch sparql-data

		url: url,
		jsonp: "callback",
		dataType: "json",

		success: function( response ) {

			// TODO: check that we have valid results
			let json = response.results.bindings || [];

			if ( typeof json === undefined || typeof json === 'undefined' ){
        $('#blink').hide();
				return 1; // no more results
			}
			else if ( json.length === 0 ) { // no more results

        $('#blink').hide();
				return 0;

			}

			json.forEach(( v ) => {

				// use image to create an IIIF-link

				if ( valid( v.image  ) ){

					const img       = v.image.value;

          let file_name   = img.replace( 'http://commons.wikimedia.org/wiki/Special:FilePath/', '' );
					let commons_link= 'https://commons.wikimedia.org/wiki/File:' + file_name;

					let label       = '';
					let date        = '';
					let desc        = '';

					let attribution = '';
  
					if ( valid( v.itemLabel.value ) ){
						label     = title = v.itemLabel.value;
						item_qid  = v.item.value.replace( 'http://www.wikidata.org/entity/', '' );
					}

					if ( valid( v.inception.value ) ){
						date = v.inception.value.split('-')[0];
            label += ' (' + date + ')';
					}

          // TODO: handle items with multiple authors?
					if ( valid( v.creatorLabel.value ) ){

						author_qid  = v.creatorLabel.value.replace( 'http://www.wikidata.org/entity/', '' );
						author      = v.creatorLabel.value;

					}

					// create IIIF-viewer-link
					let coll = { "images": [ ]};

          desc = '';

          attribution = '<br>Source: ' + commons_link;
        
          // TODO: add an extra field to the IIIF-field for "url" using "v.links.web"?
					coll.images.push( [ img, encodeURIComponent( label ), encodeURIComponent( desc ), encodeURIComponent( 'Author: ' + author ), encodeURIComponent( attribution ) ] );

					if ( coll.images.length > 0 ){ // we found some images

						// create an IIIF image-collection file
						let iiif_manifest_link = explore.base + '/app/response/iiif-manifest?l=en&single=true&t=' + label + '&json=' + JSON.stringify( coll );

						let iiif_viewer_url = explore.base + '/app/iiif/#?c=&m=&s=&cv=&manifest=' + encodeURIComponent( iiif_manifest_link );

						view_url = encodeURIComponent( JSON.stringify( encodeURIComponent( iiif_viewer_url ) ) );

					}

				}

			});

			// open link in content-pane

      // show sidebar-results
			handleClick({ 
        id        : 'n1-0',
				type      : 'articles',
				title     : author,
				language  : explore.language,
				qid       : '', //author_qid,
				url       : '',
				tag       : '',
				languages : '',
				custom    : '',
				target_pane : 'p0',
			});

      // show image in content-pane
			handleClick({ 
				id        : '000',
				type      : 'link',
				title     : author,
				language  : explore.language,
				qid       : '',
				url       : view_url,
				tag       : '',
				languages : '',
				custom    : '',
				target_pane : 'p1',
			});

		},  
  
  }); 

}

async function showCurrentEventsPage() {

  $('#blink').show();

  $('#pager').hide();

  handleClick({ 
    id        : 'n1-0',
    type      : 'wikipedia',

    // TOFIX:
    //  - rtl-scripts
    //  - non-portal news articles
    title     : explore.lang_portal + ':' + explore.lang_current_events_page,
    language  : explore.language,
    qid       : '',
    url       : '',
    tag       : '',
    languages : '',
    custom    : '',
    target_pane : 'p1',
  });

}

async function showRandomQuery() {

  $('#blink').show();

  $('#pager').hide();

  handleClick({ 
    id        : 'n1-0',
    type      : 'random',
    title     : '',
    language  : explore.language,
    qid       : '',
    url       : '',
    tag       : '',
    languages : '',
    custom    : '',
    target_pane : 'p1',
  });

  explore.type = 'wikipedia';

}

async function exploreTopic( qid ) {

  handleClick({ 
    id        : 'n1-0',
    type      : 'wikipedia-qid',
    title     : '',
    language  : explore.language,
    qid       : qid,
    url       : '',
    tag       : '',
    languages : '',
    custom    : '',
    target_pane : 'p1',
  });

}

async function updateQueryBuilder(){

  if ( valid( explore.language ) ){

    setParameter( 'l', explore.language, explore.hash );

  }

  if ( valid( explore.query ) ){

    setParameter( 'query', explore.query, explore.hash );

  }

  const query_builder_html =
    '<link href="' + explore.base + '/app/query-builder/css/app.4dc2b4db.css" rel="stylesheet">' + 
    '<link href="' + explore.base + '/app/query-builder/css/chunk-vendors.313a1896.css" rel="stylesheet">' +
    '<link href="' + explore.base + '/app/explore2/dist/css/conzept/query-builder-custom.css?v001" rel="stylesheet">' +
    '<script src="' + explore.base + '/app/query-builder/js/chunk-vendors.9d2b1a47.js"></script>' +
    '<script src="' + explore.base + '/app/query-builder/js/app.9d67c455.js"></script>';

  $( '#query-builder-code' ).html( query_builder_html );

}

// reset the elements visibility to default.
async function setDefaultDisplaySettings( cover, type ) {

  if ( window.location !== window.parent.location ) { // embedded in an iframe

    resetIframe();

    $( explore.baseframe ).attr({"src": explore.base + '/blank.html' }); // TODO: is it worth it to fix this via a PHP page?

    $('#loader').hide(); // not really needed?

    return 0;

  }

  explore.topic_cursor = 'n1-1';

	$( '#results-paging' ).css( 'display', 'none' );
	$( '#results-label' ).css( 'display', 'inline-block' );
	$( '#next' ).css( 'display', 'none' );
	$( '#previous' ).css( 'display', 'none' );
	$( '#results' ).empty();
  $( '#total-results' ).empty();

  const welcome_footer_space = explore.isMobile ? '<div style="margin-bottom:18rem;"></div>' : '';

  let quote_author  = '';
  let quote_line    = '';
  let quote         = '';
  let wp_prefix     = '';

  $( '#results' ).html( 
    '<div class="intro-box">' +
      '<img title="Boston Public Library" alt="Boston Public Library" style="width: 100%; border-radius:0.2em;" src="' + explore.base + '/app/explore2/assets/images/front.jpg">' +

      '<p>' + 
        '<span id="app-guide-welcome-text"></span> &nbsp;' + 
        '<span id="app-social-icons">' + 
          '<a target="_blank" rel="noopener" href="https://github.com/waldenn/conzept" title="GitHub repository" aria-label="GitHub repository"><i class="fa-brands fa-github"></i></a> &nbsp;' + 
          '<a target="_blank" rel="noopener" href="https://github.com/sponsors/waldenn?o=esb" title="GitHub sponsor" aria-label="GitHub sponsor"><i class="fa-solid fa-heart"></i></a> &nbsp;' + 
          '<a target="_blank" rel="noopener" href="https://addons.mozilla.org/en-US/firefox/addon/conzept-encyclopedia-extension/" title="Firefox browser extension" aria-label="Firefox browser extension"><i class="fa-brands fa-firefox-browser"></i></a> &nbsp;' + 
          '<a target="_blank" rel="noopener" href="https://twitter.com/conzept__" title="Twitter news" aria-label="Twitter news"><i class="fa-brands fa-twitter"></i></a> &nbsp;' + 
        '</span>' + 
      '</p>' + 
    
      '<div class="frontpage-grid-container">' +
        '<div><a class="link random" title="documentation" aria-label="documentation" href="/guide/user_manual" target="infoframe"><span class="icon"><i class="fa-solid fa-question fa-2x" style=""></i></span><br><span class="frontpage-icon"><span id="app-guide-help">help</span></span></a></div>' +
        '<div><a class="link random" title="go to a random topic" aria-label="random topic" href="javascript:void(0)" onclick="showRandomQuery()"><span class="icon"><i class="fa-solid fa-map-signs fa-2x" style="transform:rotate(5deg);"></i></span><br><span class="frontpage-icon"><span id="app-guide-topic"></span></span></a></div>' +
        '<div><a class="" title="random featured article" aria-label="random featured article" href="javascript:void(0)" onclick="showRandomListItem( &quot;featured-article&quot; )"><span class="icon"><i class="fa-regular fa-star fa-2x" ></i></span><br><span class="frontpage-icon"><span id="app-guide-featured-article">featured article</span></span></a></div>' +
      '</div>' +

        '<details class="auto frontpage" style="" closed>' +
          '<summary><span id="app-menu-culture">culture</span></summary>' +

          '<div class="frontpage-grid-container">' +

            // general culture
            '<div><a class="" title="random featured portal" aria-label="random featured portal" href="javascript:void(0)" onclick="showRandomListItem( &quot;featured-portal&quot; )"><span class="icon"><i class="fa-regular fa-star fa-2x" ></i></span><br><span class="frontpage-icon"><span id="app-guide-featured-portal">featured portal</span></span></a></div>' +
            '<div><a class="" title="current events" aria-label="current events" href="javascript:void(0)" onclick="showCurrentEventsPage()"><span class="icon"><i class="fa-regular fa-newspaper fa-2x" ></i></span><br><span class="frontpage-icon"><span id="app-guide-news"></span></span></a></div>' +

            // geography
            '<div><a class="" title="random country map" aria-label="random country map" href="javascript:void(0)" onclick="showRandomListItem( &quot;country-map&quot; )"><span class="icon"><i class="fa-solid fa-globe-africa fa-2x" ></i></span><br><span class="frontpage-icon"><span id="app-guide-country-map">country map</span></span></a></div>' +
            '<div><a class="" title="random country" aria-label="random country" href="javascript:void(0)" onclick="showRandomCountry()"><span class="icon"><i class="fa-regular fa-flag fa-2x" ></i></span><br><span class="frontpage-icon"><span id="app-guide-country"></span></span></a></div>' +
            '<div><a class="" title="random historical country" aria-label="random historical country" href="javascript:void(0)" onclick="showRandomListItem( &quot;historical-country&quot; )"><span class="icon"><i class="fa-regular fa-flag fa-2x" ></i></span><br><span class="frontpage-icon"><span id="app-guide-historical-country"></span></span></a></div>' +
            '<div><a class="" title="random capitol" aria-label="random capitol" href="javascript:void(0)" onclick="showRandomListItem( &quot;capitol&quot; )"><span class="icon"><i class="fa-solid fa-map-marker-alt fa-2x" ></i></span><br><span class="frontpage-icon"><span id="app-guide-capitol">capitol</span></span></a></div>' +
            '<div><a class="" title="random form of government" aria-label="random form of government" href="javascript:void(0)" onclick="showRandomListItem( &quot;form-of-government&quot; )"><span class="icon"><i class="fa-solid fa-balance-scale-right fa-2x" ></i></span><br><span class="frontpage-icon"><span id="app-guide-form-of-government">form of gov.</span></span></a></div>' +
            '<div><a class="" title="random ethnic group" aria-label="random ethnic group" href="javascript:void(0)" onclick="showRandomListItem( &quot;ethnic-group&quot; )"><span class="icon"><i class="fa-solid fa-hand-holding-heart fa-2x" ></i></span><br><span class="frontpage-icon"><span id="app-guide-ethnic-group"></span></span></a></div>' +
            '<div><a class="" title="random language" aria-label="random language" href="javascript:void(0)" onclick="showRandomLanguage()"><span class="icon"><i class="fa-solid fa-language fa-2x" ></i></span><br><span class="frontpage-icon"><span id="app-guide-language"></span></span></a></div>' +
            '<div><a class="" title="random religion" aria-label="random religion" href="javascript:void(0)" onclick="showRandomListItem( &quot;religion&quot; )"><span class="icon"><i class="fa-solid fa-dharmachakra fa-2x" ></i></span><br><span class="frontpage-icon"><span id="app-guide-religion">religion</span></span></a></div>' +

            // history
            '<div><a class="" title="random period" aria-label="random period" href="javascript:void(0)" onclick="showRandomListItem( &quot;period&quot; )"><span class="icon"><i class="fa-solid fa-history fa-2x" ></i></span><br><span class="frontpage-icon"><span id="app-guide-period">period</span></span></a></div>' +
            '<div><a class="" title="random aspect of history" aria-label="random aspect of history" href="javascript:void(0)" onclick="showRandomListItem( &quot;history-aspect&quot; )"><span class="icon"><i class="fa-solid fa-history fa-2x" ></i></span><br><span class="frontpage-icon"><span id="app-guide-history-aspect">history aspect</span></span></a></div>' +
            '<div><a class="" title="random revolution" aria-label="random revolution" href="javascript:void(0)" onclick="showRandomListItem( &quot;revolution&quot; )"><span class="icon"><i class="fa-solid fa-history fa-2x" ></i></span><br><span class="frontpage-icon"><span id="app-guide-revolution">revolution</span></span></a></div>' +
            '<div><a class="" title="random war" aria-label="random war" href="javascript:void(0)" onclick="showRandomListItem( &quot;war&quot; )"><span class="icon"><i class="fa-solid fa-crosshairs fa-2x" ></i></span><br><span class="frontpage-icon"><span id="app-guide-war">war</span></span></a></div>' +
            '<div><a class="" title="random battle" aria-label="random battle" href="javascript:void(0)" onclick="showRandomListItem( &quot;battle&quot; )"><span class="icon"><i class="fa-solid fa-crosshairs fa-2x" ></i></span><br><span class="frontpage-icon"><span id="app-guide-battle">battle</span></span></a></div>' +

            // film
            '<div><a class="" title="random documentary" aria-label="random documentary" href="javascript:void(0)" onclick="showRandomDocumentary()"><span class="icon"><i class="fa-solid fa-film fa-2x" ></i></span><br><span class="frontpage-icon"><span id="app-guide-documentary"></span></span></a></div>' +
            '<div><a class="" title="random documentary title" aria-label="random documentary title" href="javascript:void(0)" onclick="showRandomListItem( &quot;documentary&quot; )"><span class="icon"><i class="fa-solid fa-film fa-2x" ></i></span><br><span class="frontpage-icon"><span id="app-guide-documentary-title">documentary title</span></span></a></div>' +
            '<div><a class="" title="random film title" aria-label="random film title" href="javascript:void(0)" onclick="showRandomListItem( &quot;film&quot; )"><span class="icon"><i class="fa-solid fa-film fa-2x" ></i></span><br><span class="frontpage-icon"><span id="app-guide-film-title">film title</span></span></a></div>' +

            // arts
            '<div><a class="" title="random art movement" aria-label="random art movement" href="javascript:void(0)" onclick="showRandomListItem( &quot;art-movement&quot; )"><span class="icon"><i class="fa-brands fa-uncharted fa-2x" ></i></span><br><span class="frontpage-icon"><span id="app-guide-art-movement">art movement</span></span></a></div>' +
            '<div><a class="" title="random artwork" aria-label="random artwork" href="javascript:void(0)" onclick="showRandomArtwork()"><span class="icon"><i class="fa-regular fa-image fa-2x" ></i></span><br><span class="frontpage-icon"><span id="app-guide-artwork"></span></span></a></div>' +
            //'<div><a class="" title="random Europeana artwork" aria-label="random Europeana artwork" href="javascript:void(0)" onclick="showRandomEuropeanaArtwork()"><span class="icon"><i class="fa-regular fa-image fa-2x" ></i></span><br><span class="frontpage-icon">Europeana</span></a></div>' +
            '<div><a class="" title="random music" aria-label="random music" href="javascript:void(0)" onclick="showRandomMusic()"><span class="icon"><i class="fa-solid fa-music fa-2x" ></i></span><br><span class="frontpage-icon"><span id="app-guide-music"></span></span></a></div>' +
            '<div><a class="" title="random radio station" aria-label="random radio station" href="javascript:void(0)" onclick="showRandomRadioStation()"><span class="icon"><i class="fa-solid fa-music fa-2x" ></i></span><br><span class="frontpage-icon"><span id="app-guide-radio">radio</span></span></a></div>' +
            '<div><a class="" title="random musical instrument" aria-label="random musical instrument" href="javascript:void(0)" onclick="showRandomListItem( &quot;musical-instrument&quot; )"><span class="icon"><i class="fa-solid fa-guitar fa-2x" ></i></span><br><span class="frontpage-icon"><span id="app-guide-musical-instrument">instrument</span></span></a></div>' +
            '<div><a class="" title="random music composer" aria-label="random music composer" href="javascript:void(0)" onclick="showRandomListItem( &quot;composer&quot; )"><span class="icon"><i class="fa-solid fa-user-edit fa-2x" ></i></span><br><span class="frontpage-icon"><span id="app-guide-composer">composer</span></span></a></div>' +
            '<div><a class="" title="random painter" aria-label="random painter" href="javascript:void(0)" onclick="showRandomListItem( &quot;painter&quot; )"><span class="icon"><i class="fa-solid fa-user-edit fa-2x" ></i></span><br><span class="frontpage-icon"><span id="app-guide-painter">painter</span></span></a></div>' +
            '<div><a class="" title="random poet" aria-label="random poet" href="javascript:void(0)" onclick="showRandomListItem( &quot;poet&quot; )"><span class="icon"><i class="fa-solid fa-user-edit fa-2x" ></i></span><br><span class="frontpage-icon"><span id="app-guide-poet">poet</span></span></a></div>' +
            '<div><a class="" title="random philosopher" aria-label="random philosopher" href="javascript:void(0)" onclick="showRandomListItem( &quot;philosopher&quot; )"><span class="icon"><i class="fa-solid fa-user-edit fa-2x" ></i></span><br><span class="frontpage-icon"><span id="app-guide-philosopher">philosopher</span></span></a></div>' +
            '<div><a class="" title="random architect" aria-label="random architect" href="javascript:void(0)" onclick="showRandomListItem( &quot;architect&quot; )"><span class="icon"><i class="fa-solid fa-user-edit fa-2x" ></i></span><br><span class="frontpage-icon"><span id="app-guide-architect">architect</span></span></a></div>' +

            // industry
            '<div><a class="" title="random inventor" aria-label="random inventor" href="javascript:void(0)" onclick="showRandomListItem( &quot;inventor&quot; )"><span class="icon"><i class="fa-solid fa-user-edit fa-2x" ></i></span><br><span class="frontpage-icon"><span id="app-guide-inventor">inventor</span></span></a></div>' +
            '<div><a class="" title="random software" aria-label="random software" href="javascript:void(0)" onclick="showRandomListItem( &quot;software&quot; )"><span class="icon"><i class="fa-regular fa-window-maximize fa-2x" ></i></span><br><span class="frontpage-icon"><span id="app-guide-software">software</span></span></a></div>' +
            '<div><a class="" title="random area of mathematics" aria-label="random area of mathematics" href="javascript:void(0)" onclick="showRandomListItem( &quot;mathematics&quot; )"><span class="icon"><i class="fa-solid fa-square-root-alt fa-2x" ></i></span><br><span class="frontpage-icon"><span id="app-guide-mathematics">mathematics</span></span></a></div>' +

            // various
            '<div><a class="" title="random tourist attraction" aria-label="random tourist attraction" href="javascript:void(0)" onclick="showRandomListItem( &quot;tourist-attraction&quot; )"><span class="icon"><i class="fa-solid fa-gopuram fa-2x" ></i></span><br><span class="frontpage-icon"><span id="app-guide-tourist-attraction">tourist attraction</span></span></a></div>' +
            '<div><a class="" title="random dish" aria-label="random dish" href="javascript:void(0)" onclick="showRandomListItem( &quot;dish&quot; )"><span class="icon"><i class="fa-solid fa-utensils fa-2x" ></i></span><br><span class="frontpage-icon"><span id="app-guide-dish">dish</span></span></a></div>' +

          '</div>' +

        '</details>' +

        '<details class="auto frontpage" style="" closed>' +
          '<summary><span id="app-menu-nature">nature</span></summary>' +

          '<div class="frontpage-grid-container">' +
            '<div><a class="" title="random sea" aria-label="random sea" href="javascript:void(0)" onclick="showRandomListItem( &quot;sea&quot; )"><span class="icon"><i class="fa-solid fa-water fa-2x" ></i></span><br><span class="frontpage-icon"><span id="app-guide-sea">sea</span></span></a></div>' +
            '<div><a class="" title="random continent" aria-label="random continent" href="javascript:void(0)" onclick="showRandomListItem( &quot;continent&quot; )"><span class="icon"><i class="fa-brands fa-firstdraft fa-2x" ></i></span><br><span class="frontpage-icon"><span id="app-guide-continent">continent</span></span></a></div>' +
            '<div><a class="" title="random bioregion" aria-label="random bioregion" href="javascript:void(0)" onclick="showRandomListItem( &quot;bioregion&quot; )"><span class="icon"><i class="fa-brands fa-firstdraft fa-2x" ></i></span><br><span class="frontpage-icon"><span id="app-guide-bioregion">bioregion</span></span></a></div>' +
            '<div><a class="" title="random mountain range" aria-label="random mountain range" href="javascript:void(0)" onclick="showRandomListItem( &quot;mountain-range&quot; )"><span class="icon"><i class="fa-solid fa-mountain fa-2x" ></i></span><br><span class="frontpage-icon"><span id="app-guide-mountain-range">mountain range</span></span></a></div>' +
            '<div><a class="" title="random national park" aria-label="random national park" href="javascript:void(0)" onclick="showRandomListItem( &quot;national-park&quot; )"><span class="icon"><i class="fa-solid fa-mountain fa-2x" ></i></span><br><span class="frontpage-icon"><span id="app-guide-national-park"></span></span></a></div>' +
            '<div><a class="" title="random disease" aria-label="random disease" href="javascript:void(0)" onclick="showRandomListItem( &quot;disease&quot; )"><span class="icon"><i class="fa-solid fa-head-side-cough fa-2x" ></i></span><br><span class="frontpage-icon"><span id="app-guide-disease">disease</span></span></a></div>' +
            '<div><a class="" title="random organism" aria-label="random organism" href="javascript:void(0)" onclick="showRandomOrganism()"><span class="icon"><i class="fa-solid fa-paw fa-2x" ></i></span><br><span class="frontpage-icon"><span id="app-guide-organism">organism</span></span></a></div>' +
            '<div><a class="" title="random mammal" aria-label="random mammal" href="javascript:void(0)" onclick="showRandomListItem( &quot;mammal&quot; )"><span class="icon"><i class="fa-solid fa-otter fa-2x" ></i></span><br><span class="frontpage-icon"><span id="app-guide-mammal"></span></span></a></div>' +
            '<div><a class="" title="random bird" aria-label="random bird" href="javascript:void(0)" onclick="showRandomListItem( &quot;bird&quot; )"><span class="icon"><i class="fa-solid fa-crow fa-2x" ></i></span><br><span class="frontpage-icon"><span id="app-guide-bird"></span></span></a></div>' +
            '<div><a class="" title="random reptile" aria-label="random reptile" href="javascript:void(0)" onclick="showRandomListItem( &quot;reptile&quot; )"><span class="icon"><i class="oma oma-black-snake oma-2x" ></i></span><br><span class="frontpage-icon"><span id="app-guide-reptile"></span></span></a></div>' +
            '<div><a class="" title="random fish" aria-label="random fish" href="javascript:void(0)" onclick="showRandomListItem( &quot;fish&quot; )"><span class="icon"><i class="fa-solid fa-fish fa-2x" ></i></span><br><span class="frontpage-icon"><span id="app-guide-fish"></span></span></a></div>' +
            '<div><a class="" title="random fish" aria-label="random amphibian" href="javascript:void(0)" onclick="showRandomListItem( &quot;amphibian&quot; )"><span class="icon"><i class="fa-solid fa-frog fa-2x" ></i></span><br><span class="frontpage-icon"><span id="app-guide-amphibian"></span></span></a></div>' +
            '<div><a class="" title="random insect" aria-label="random insect" href="javascript:void(0)" onclick="showRandomListItem( &quot;insect&quot; )"><span class="icon"><i class="fa-solid fa-bug fa-2x" ></i></span><br><span class="frontpage-icon"><span id="app-guide-insect"></span></span></a></div>' +
            '<div><a class="" title="random spider" aria-label="random spider" href="javascript:void(0)" onclick="showRandomListItem( &quot;spider&quot; )"><span class="icon"><i class="fa-solid fa-spider fa-2x" ></i></span><br><span class="frontpage-icon"><span id="app-guide-spider"></span></span></a></div>' +
            '<div><a class="" title="random plant" aria-label="random plant" href="javascript:void(0)" onclick="showRandomListItem( &quot;plant&quot; )"><span class="icon"><i class="fa-brands fa-pagelines fa-2x" ></i></span><br><span class="frontpage-icon"><span id="app-guide-plant"></span></span></a></div>' +
            '<div><a class="" title="random algae" aria-label="random algae" href="javascript:void(0)" onclick="showRandomListItem( &quot;algae&quot; )"><span class="icon"><i class="oma oma-black-fish-cake-with-swirl oma-2x" ></i></span><br><span class="frontpage-icon"><span id="app-guide-algae"></span></span></a></div>' +
            '<div><a class="" title="random fungus" aria-label="random fungus" href="javascript:void(0)" onclick="showRandomListItem( &quot;fungus&quot; )"><span class="icon"><i class="oma oma-black-champignon-brown oma-2x" ></i></span><br><span class="frontpage-icon"><span id="app-guide-fungus"></span></span></a></div>' +
            '<div><a class="" title="random protist" aria-label="random protist" href="javascript:void(0)" onclick="showRandomListItem( &quot;protist&quot; )"><span class="icon"><i class="fa-solid fa-bacterium fa-2x" ></i></span><br><span class="frontpage-icon"><span id="app-guide-protist">protist</span></span></a></div>' +
            '<div><a class="" title="random bacterium" aria-label="random bacterium" href="javascript:void(0)" onclick="showRandomListItem( &quot;bacterium&quot; )"><span class="icon"><i class="fa-solid fa-bacterium fa-2x" ></i></span><br><span class="frontpage-icon"><span id="app-guide-bacterium"></span></span></a></div>' +
            '<div><a class="" title="random archae" aria-label="random archae" href="javascript:void(0)" onclick="showRandomListItem( &quot;archae&quot; )"><span class="icon"><i class="fa-solid fa-bacterium fa-2x" ></i></span><br><span class="frontpage-icon"><span id="app-guide-archae">archae</span></span></a></div>' +
            '<div><a class="" title="random cell type" aria-label="random cell type" href="javascript:void(0)" onclick="showRandomListItem( &quot;cell-type&quot; )"><span class="icon"><i class="oma oma-black-hollow-red-circle oma-2x" ></i></span><br><span class="frontpage-icon"><span id="app-guide-cell-type">cell type</span></span></a></div>' +
            '<div><a class="" title="random virus" aria-label="random virus" href="javascript:void(0)" onclick="showRandomListItem( &quot;virus&quot; )"><span class="icon"><i class="fa-solid fa-virus fa-2x" ></i></span><br><span class="frontpage-icon"><span id="app-guide-virus"></span></span></a></div>' +
            '<div><a class="" title="random protein" aria-label="random protein" href="javascript:void(0)" onclick="showRandomListItem( &quot;protein&quot; )"><span class="icon"><i class="fa-solid fa-dna fa-2x" ></i></span><br><span class="frontpage-icon"><span id="app-guide-protein">protein</span></span></a></div>' +
            '<div><a class="" title="random atomic element" aria-label="random atomic element" href="javascript:void(0)" onclick="showRandomListItem( &quot;element&quot; )"><span class="icon"><i class="fa-solid fa-atom fa-2x" ></i></span><br><span class="frontpage-icon"><span id="app-guide-atom">atom</span></span></a></div>' +
          '</div>' +
        '</details>' +

    '</div>'
  );

  if ( explore.type === 'random'){
  
    return 0;

  }

  if (  explore.firstAction &&
        valid( explore.uri ) &&
        !valid( explore.query_param ) &&
        !valid( explore.commands_param )
      ){ // an URL was passed upon a new load, which is not a structured-query, nor editor-commands

    $( explore.baseframe ).attr({"src": explore.uri });

    explore.uri = ''; // reset URL param

    $('#blink').hide();
    $('#loader').hide();

    return 0;

  }

  resetIframe();

  if ( explore.isMobile ){

    $( explore.baseframe ).attr({"src": explore.base + '/blank.html' });
    $('#loader').hide();

  }
  else { // desktop

    if ( listed( cover_topics, [ explore.covertopic ] ) ){ // show cover-topic

      renderTopicCover( explore.covertopic );

    }
    else { // show default cover

      setPopularCover();

    }

  }

}

async function renderTopicCover( name ) {

  $('#blink').show();

  let url = '';

  if ( name === 'featured-article' ){ // non-standard URL

    url = explore.base + '/app/explore2/assets/json/lists/featured-article/' + explore.language + '.json';

  }
  else if ( name === 'featured-portal' ){ // non-standard URL

    url = explore.base + '/app/explore2/assets/json/lists/featured-portal/' + explore.language + '.json';

  }
  else { // standard URL

    url = explore.base + '/app/explore2/assets/json/lists/' + name + '.json';

  }

  //console.log( name, url );

  fetch( url )
    .then(response => response.json())
    .then( list => {

      const nr  = Math.floor( Math.random() * list.length );
      let qid = 'Q' + list[ nr ];
      let other_id = '';

      if ( name === 'country-map' ){ // split QID|OSMID

        const fields = qid.split('|');
        qid = fields[0];
        other_id = fields[1];

      }

      let promiseB = fetchLabel([ qid ], explore.language ).then(function(result) {

        let label = '';

        if ( valid( result.entities ) ){

          if ( result.entities[ qid ]?.labels[ explore.language ] ){

            label = result.entities[ qid ].labels[ explore.language ].value;

            // content pane info
            if ( name === 'country-map' ){ // split QID|OSMID

              handleClick({ 
                id        : 'n1-0',
                type      : 'link',
                title     : label,
                language  : explore.language,
                qid       : '' + qid,
                url       : `${explore.base}/app/map/?l=${explore.language}&bbox=&osm_id=${other_id}&qid=${qid}&title=${label}`,
                tag       : '',
                languages : '',
                custom    : '',
                target_pane : 'p1',
              });

            }
            else {

              let cover_name = label || '';
              cover_name = cover_name.replace(/_/g, ' ');

              let cover_file = '';
              let cover_type = '';
              let cover_css_extra = '';

              let fontlink_html = '<link id="fontlink" />';

              //if ( explore.font1 !== 'IBM Plex Sans Condensed' ){ // only add font-link for alternative fonts

                //fontlink_html = '<link id="fontlink" href="https://fonts.googleapis.com/css?family=' + explore.font1 + ':400,500&display=swap&subset=latin-ext" rel="stylesheet" type="text/css">';

              //}

              // API format: https://en.wikipedia.org/w/api.php?action=query&titles=Flamenco&prop=pageimages&format=json&pithumbsize=600
              let url_api_image = `https://${explore.language}.${datasources.wikipedia.endpoint}?action=query&titles=${ encodeURIComponent( cover_name ) }&prop=pageimages&format=json&pithumbsize=600&pilimit=1`;
              //let url_api_image = 'https://' + explore.language + '.wikipedia.org/w/api.php?action=query&titles=' + encodeURIComponent( cover_name ) + '&prop=pageimages&format=json&pithumbsize=600&pilimit=1';

              let covers = [ 'abstract_004.jpg', 'abstract_005.jpg' ];

              const abstract_cover = covers[ Math.floor( Math.random() * covers.length) ];

              let noCoverFound = false;

              $.ajax({

                url: url_api_image,

                dataType: "jsonp",

                success: function( img_data ) {

                  if ( typeof img_data.query.pages[ Object.keys( img_data.query.pages)[0] ] === undefined ){ // no cover image found

                    //cover_file = explore.base + '/app/explore2/assets/images/wallpapers/' + abstract_cover;

                    noCoverFound = true;

                  }
                  else {

                    if (  typeof img_data.query.pages[ Object.keys( img_data.query.pages)[0] ].thumbnail === undefined ||
                          typeof img_data.query.pages[ Object.keys( img_data.query.pages)[0] ].thumbnail === 'undefined' ){ // no cover image found

                      //cover_file = explore.base + '/app/explore2/assets/images/wallpapers/' + abstract_cover;

                      noCoverFound = true;
                      
                    }
                    else {

                      // TODO?: get higher-resolution image
                      cover_file = img_data.query.pages[ Object.keys( img_data.query.pages)[0] ].thumbnail.source || '';
                      cover_css_extra = 'background-size: contain !important;';

                    }

                  }

                  $( explore.baseframe ).attr({ "srcdoc": 
                    '<!DOCTYPE html> <html lang=' + explore.language + '> <head>' +
                    '<meta name="viewport" content="width=device-width, height=device-height, initial-scale=1.0, user-scalable=1, minimum-scale=1.0, maximum-scale=5.0">' +
                    '<link rel="stylesheet" href="' + explore.base + '/app/explore2/node_modules/animate.css/animate.min.css">' +
                    '<link rel="stylesheet" href="' + explore.base + '/assets/fonts/fontawesome/css/all.min.css?v6.01" type="text/css">' +
                    '<link rel="stylesheet" href="' + explore.base + '/app/explore2/dist/css/conzept/common.css">'+
                    '<link rel="stylesheet" href="' + explore.base + '/app/explore2/dist/css/conzept/cover.css?0.10">' +
                    fontlink_html +

                    '</head>' +
                    '<body style="' + cover_css_extra + ' font-size: ' + explore.fontsize + 'px">' + 
                    '<canvas id="canvas"></canvas>' +
                    //'</head><body style="' + cover_css_extra + ' font-family: ' + explore.default_font + '; font-size: ' + explore.fontsize + 'px">' + 

                    '<div class="bgimg-1"><div class="caption btn animated fadeIn delay-1s"><span class="border"><a id="topiclink" href="javascript:void(0)" onauxclick="openInNewTab( &quot;' + '/explore/' + encodeURIComponent( cover_name ) + '?t=wikipedia&l=' + explore.language + '&quot;)">' + cover_name.trim() + '</a></span></div> </div> <span id="copyright-notice"><a id="image-source" title="source" aria-label="source" target="_blank" href="https://en.wikipedia.org"><span class="icon"><i class="fa-regular fa-copyright fa-2x"></i></span></a></span>' + 

                    '<img id="color-test-image" src="" style="display:none;"></img>' +
                    '<a href="javascript:void(0)" id="fullscreenToggle" onclick="document.toggleFullscreen()" class="global-actions" style="display:none;"><i id="fullscreenIcon" title="fullscreen toggle" class="fa-solid fa-expand"></i></a>' +

                    '<script>let noCoverFound = ' + noCoverFound + '; let language = "en"; let hash = ""; let title = "' + cover_name.trim() + '"; const file = "' + cover_file + '"; let type = "' + cover_type  + '"; const fontsize = ' + explore.fontsize + '</script>' +
                    '<script src="' + explore.base + '/app/explore2/node_modules/jquery/dist/jquery.min.js"></script>' +
                    '<script src="' + explore.base + '/app/explore2/node_modules/keyboardjs/dist/keyboard.min.js"></script>' +
                    '<script src="' + explore.base + '/app/explore2/node_modules/sunzi-color-thief/dist/color-thief.umd.js"></script>' +
                    '<script src="' + explore.base + '/app/explore2/dist/core/utils.js?' + explore.version + '"></script>' +
                    '<script src="' + explore.base + '/app/explore2/dist/core/cover.js?' + explore.version + '"></script>' +

                    '</body></html>'

                  });

                },

              });

            }

          }
          else {

            console.log('todo: handle topic cover without a matching language')

            handleClick({ 
              id        : 'n1-0',
              type      : 'wikipedia-qid',
              title     : '',
              language  : explore.language,
              qid       : '' + qid,
              url       : '',
              tag       : '',
              languages : '',
              custom    : '',
              target_pane : 'p1',
            });

          }

        }
        else {

          $.toast({
              heading: 'no results found',
              text: '',
              hideAfter : 2000,
              stack : 1,
              showHideTransition: 'slide',
              icon: 'info'
          })

        }

    });

  });

}

async function setPopularCover() {

  if ( ! valid( explore.language ) ){

    return 0;

  }

  let date          = new Date();
  //let year          = '2021';
  let year        = date.getFullYear();
  let day_of_month  = date.getDate();

  let month         = ''; 

  if ( day_of_month <= 2 ){ // ALSO use the previous month during the first two days of the month (so there is time for the stats data to update first)

    month = (date.getMonth() - 1 <= 9 ? '0': '') + ( date.getMonth() - 1 );

    if ( month === '0-1' ){ // special case: January (00) -> December (11)
      month = '11';
    }

  }
  else {

    month = (date.getMonth() <= 9 ? '0': '') + date.getMonth(); // get previous month (and pad with a zero if needed)

  }

  //month = '12';

  // FIXME looks like something sets the language to 'eng' at times, research what is causing this.
  if ( explore.language === 'eng' ){
    explore.language = 'en'; // or use: getLangCode2( lang3 )
  }

  let url = explore.base + '/app/explore2/assets/json/covers/' + explore.language + '-' + year + '-' + month + '.json?' + explore.version;

  $.ajax({

    url: url,

    success: function( data ) {

      let articles = data.items[0].articles;

      const nr = getRandomInt( articles.length );

      let cover_name = articles[ nr ].article || '';
      cover_name = cover_name.replace(/_/g, ' ');

      let cover_file = '';
      let cover_type = '';
      let cover_css_extra = '';

      let fontlink_html = '<link id="fontlink" />';

      if ( explore.font1 !== 'Hind' ){ // only add font-link for alternative fonts

        fontlink_html = '<link id="fontlink" href="https://fonts.googleapis.com/css?family=' + explore.font1 + ':400,500&display=swap&subset=latin-ext" rel="stylesheet" type="text/css">';

      }

      // https://en.wikipedia.org/w/api.php?action=query&titles=Flamenco&prop=pageimages&format=json&pithumbsize=600
      let url_api_image = 'https://' + explore.language + '.wikipedia.org/w/api.php?action=query&titles=' + encodeURIComponent( cover_name ) + '&prop=pageimages&format=json&pithumbsize=600&pilimit=1';

      let covers = [ 'abstract_004.jpg', 'abstract_005.jpg' ];
      const abstract_cover = covers[ Math.floor( Math.random() * covers.length) ];
  
      let noCoverFound = false;

      $.ajax({

        url: url_api_image,
        dataType: "jsonp",

        success: function( img_data ) {

          if ( typeof img_data.query.pages[ Object.keys( img_data.query.pages)[0] ] === undefined ){ // no cover image found

            cover_file = explore.base + '/app/explore2/assets/images/wallpapers/' + abstract_cover;

            noCoverFound = true;
              

          }
          else {

            if (  typeof img_data.query.pages[ Object.keys( img_data.query.pages)[0] ].thumbnail === undefined ||
                  typeof img_data.query.pages[ Object.keys( img_data.query.pages)[0] ].thumbnail === 'undefined' ){ // no cover image found

              cover_file = explore.base + '/app/explore2/assets/images/wallpapers/' + abstract_cover;
              noCoverFound = true;
              
            }
            else {

              // TODO?: get higher-resolution image
              cover_file = img_data.query.pages[ Object.keys( img_data.query.pages)[0] ].thumbnail.source || '';
              cover_css_extra = 'background-size: contain !important;';

            }

          }

          $( explore.baseframe ).attr({ "srcdoc": 
            '<!DOCTYPE html> <html lang=' + explore.language + '> <head>' +
            '<meta name="viewport" content="width=device-width, height=device-height, initial-scale=1.0, user-scalable=1, minimum-scale=1.0, maximum-scale=5.0">' +
            '<link rel="stylesheet" href="' + explore.base + '/app/explore2/node_modules/animate.css/animate.min.css">' +
            '<link rel="stylesheet" href="' + explore.base + '/assets/fonts/fontawesome/css/all.min.css?v6.01" type="text/css">' +
            '<link rel="stylesheet" href="' + explore.base + '/app/explore2/dist/css/conzept/common.css">'+
            '<link rel="stylesheet" href="' + explore.base + '/app/explore2/dist/css/conzept/cover.css?0.10">' +
            fontlink_html +

            '</head><body style="' + cover_css_extra + ' font-family: ' + explore.default_font + '; font-size: ' + explore.fontsize + 'px">' + 
            '<canvas id="canvas"></canvas>' +

            '<div class="bgimg-1"><div class="caption btn animated fadeIn delay-1s"><span class="border"><a id="topiclink" href="javascript:void(0)" onauxclick="openInNewTab( &quot;' + '/explore/' + encodeURIComponent( cover_name ) + '?t=wikipedia&l=' + explore.language + '&quot;)">' + cover_name.trim() + '</a></span></div> </div> <span id="copyright-notice"><a id="image-source" title="source" aria-label="source" target="_blank" href="https://en.wikipedia.org"><span class="icon"><i class="fa-regular fa-copyright fa-2x"></i></span></a></span>' + 

            '<img id="color-test-image" src="" style="display:none;"></img>' +
						'<a href="javascript:void(0)" id="fullscreenToggle" onclick="document.toggleFullscreen()" class="global-actions" style="display:none;"><i id="fullscreenIcon" title="fullscreen toggle" class="fa-solid fa-expand"></i></a>' +

            '<script>let noCoverFound = ' + noCoverFound + '; let language = "en"; let hash = ""; let title = "' + cover_name.trim() + '"; const file = "' + cover_file + '"; let type = "' + cover_type  + '"; const fontsize = ' + explore.fontsize + '</script>' +
            '<script src="' + explore.base + '/app/explore2/node_modules/jquery/dist/jquery.min.js"></script>' +
            '<script src="' + explore.base + '/app/explore2/node_modules/keyboardjs/dist/keyboard.min.js"></script>' +
            '<script src="' + explore.base + '/app/explore2/node_modules/sunzi-color-thief/dist/color-thief.umd.js"></script>' +
            '<script src="' + explore.base + '/app/explore2/dist/core/utils.js?' + explore.version + '"></script>' +
            '<script src="' + explore.base + '/app/explore2/dist/core/cover.js?' + explore.version + '"></script>' +

            '</body></html>'

          });

        },

      });

    },

    error: function( errorMessage ) {
      console.log('popular cover data JSON fetch error for language: ', explore.language );
    },

    //timeout: 3000,

  });

}

// display the hidden elements meant for results.
async function setDisplayForResults() {
	$( '#results-paging' ).css( "display", "inline-block" );
	$( '#results-label' ).css( "display", "inline-block" );
}

// prepares data for query to get random pages and triggers request.
function getRandomPages() {

	const data = {
		action: "query",
		generator: "random",
		format: "json",
		grnlimit: 5,
		grnnamespace: 0,
		prop: "extracts",
		exlimit: 5,
		exchars: 500,
		exintro: true
	};

	getData( 'https://' + explore.language + '.wikipedia.org/w/api.php?callback=?', data, displayRandomPages );

}

function displayRandomPages ( response ) {

	$.each( response.query.pages, function( i, item ){

    if ( item.title !== '' ){

      // prevent infinite-loop-case from happening when the 'explore'-view is triggered by replaceState()
      if ( explore.replaceState ){

        explore.q = item.title;

        $('#srsearch').val( decodeURI( explore.q ) );

        $('.submitSearch').click();

      }

      return false; // break after the first item, we have a random title
    }

	});

}

// send JSON request to get data from an API-URL
function getData( url, data, callback ) {

	$.getJSON( url, data, callback )

		.fail(function( error ){

				console.log( 'error reaching wikipedia API: ', error.responseText);

				$.toast({
						heading: 'Search error',
						text: 'The Wikipedia search API is not working correctly for the <b>' + explore.language + '</b> language.',
						hideAfter : 5000,
						stack : 1,
						showHideTransition: 'slide',
						icon: 'error'
				})

		});

}

function processWikipediaResults( topicResults ) {

  return new Promise(( resolve, reject ) => {

    /* "topicResults" is now a list of these type of results:

      <result nr>:
        ns: 0
        pageid: 47717515
        size: 32590
        snippet: "<span class=\"searchmatch\">Quranism</span> (Arabic: القرآنية‎; al-Qur'āniyya) comprises views that Islamic law and guidance should only be based on the Qur'an, thus opposing the religious"
        timestamp: "2020-04-11T14:19:12Z"
        title: "Quranism"
        wordcount: 3797

    */

    const data_titles = [];

    //console.log('processWikipediaResults: ', topicResults );

    if ( topicResults.query === undefined || topicResults.query === 'undefined' ){

      console.log('topicResults.query undefined');
      //return 1;

      console.log('no results found, promise: ', [], [] );
      resolve( [ [], [] ] );
    }

    // create a list of titles from the "topicResults"
    $.each( topicResults.query.search, function( i, item ) {

      data_titles.push( item.title );
      //data_titles.push( encodeURIComponent( item.title ) );

    });

    const data_titles_ = data_titles.join('|');

    // fetch the wikipedia-with-qid data for each of those titles
    $.ajax({

      url: 'https://' + explore.language + '.wikipedia.org/w/api.php?action=query&prop=pageprops&titles=' + encodeURIComponent( data_titles_ ) + '&format=json',

      dataType: "jsonp",

      success: function( qdata ) {

          /* "qdata" is a list containing results structured like this:

            36922: (pageid)
              title: "Quran"
              ns: 0
              pageid: 36922
              pageprops:
                page_image_free: "Opened_Qur'an.jpg"
                wikibase-shortdesc: "The central religious text of Islam"
                wikibase_item: "Q428"
          */

          // match the Wikipedia results with the "qdata"

          // create empty qdata structures, if no qdata was found
          if ( typeof qdata.query === undefined || typeof qdata.query === 'undefined' ){
            qdata.query = {};
            qdata.query.pages = [];

            if ( explore.type === 'wikipedia-qid' ){ // TODO: check correctness

              addRawTopicCard( explore.q );

              return 0;
            }

          }

          const qlist = [];
          const qids  = [];

          // add "pageid matching Q-IDs and image-URLs" to topicResults data
          $.each( qdata.query.pages, function( j, item ) {

            if ( typeof item.pageprops !== 'undefined' ){

              const pid   = item.pageid || undefined; 
              const qid   = item.pageprops.wikibase_item || ''; 
              const thumb = item.pageprops.page_image_free || '';

              qlist.push( { pid, qid, thumb } );

              if ( qid !== '' ){

                qids.push( qid );

              }

            }

          });

          // find matching page-IDs
          $.each( topicResults.query.search, function( k, item ) {

            const matched_obj = findObjectByKey( qlist, 'pid', item.pageid ); //[0].pid;

            if ( typeof matched_obj !== undefined ){

              if ( matched_obj[0] !== undefined ){

                // insert "qid" and "thumb" fields
                item.qid    = matched_obj[0].qid;
                item.thumb  = matched_obj[0].thumb;

                if ( item.thumb !== '' ){

                  item.thumbnail_fullsize =  'https://'+ explore.language + '.wikipedia.org/wiki/' + explore.language + ':Special:Filepath/' + item.thumb + '?width=3000';

                }

              }

            }

          });

          if ( qids.length > 0 ){

            let my_promises = [];

            my_promises.push( fetchWikidata( qids, topicResults, 'wikipedia' ) );

            // resolve my promises
            Promise.allSettled( my_promises ).
              then((results) => results.forEach((result) => {

                // add meta structure
                result.value[0].source.data.continue = { 'continue': "-||", 'sroffset': datasources['wikipedia'].pagesize, 'source': 'wikipedia' },

                // set source in results (so we can distinguish between other sources in the rendering phase)
                //console.log( 'FIXME?: ', result );
                //result.value[0].source.data.continue.source = 'wikipedia';

                //console.log( 'processWikipedia: ', result )

                resolve( [ result ] );

              }));

          }
          else { // no qids found

            //console.log( 'processWikipedia: no Qids found' );
            resolve( [ 'done' ] );

          }

      },

      //timeout: 3000,

    });

  });

}

function getTitleFromQid( qid, target_pane ){

  // QQQ TODO: check that the 'wikidata' source is correct in all cases
  fetchWikidata( [ qid ], '', 'wikidata', target_pane );

}

function getWikidataFromTitle( title, allow_recheck, target_pane ){

  explore.item = '';

  // get qid and wikidata data
  // https://www.wikidata.org/w/api.php?action=wbgetentities&sites=enwiki&format=json&titles=Karachi

  $.ajax({
    url: datasources.wikidata.instance_api + '?action=wbgetentities&sites=' + explore.language + 'wiki&format=json&titles=' + title,
    dataType: "jsonp",

    success: function( wd ) {

      if ( typeof wd.entities === undefined || typeof wd.entities === 'undefined' ){
        // do nothing
      }
      else {
        const qid = Object.keys( wd.entities )[0];

        if ( qid.startsWith('Q') ){

          fetchWikidata( [ qid ], '', 'wikipedia', target_pane );

        }
        else {

          // determine if we should render someting else than the wikipedia artcle, eg: link
          if ( explore.type === 'link' ){

            if ( explore.uri !== '' ){ // use URL param

              if ( document.getElementById('infoframeSplit2') === null ){ // single-content-frame
                resetIframe();
                $( explore.baseframe ).attr({"src": decodeURI( explore.uri ) });
              }
              else { // dual-content-frame

		            if ( explore.isMobile ){

                  $( explore.baseframe ).attr({"src": decodeURI( explore.uri ) });

                }
                else {

                  $( '#infoframeSplit2' ).attr({"src": decodeURI( explore.uri ) });

                }

              }

            }

          }
          else {

            if ( target_pane === 'p0' || target_pane === 'p1' || document.getElementById('infoframeSplit2') === null ){ // single-content-frame

              resetIframe();

              $( explore.baseframe ).attr({"src": explore.base + '/app/wikipedia/?t=' + title + '&l=' + explore.language + '&voice=' + explore.voice_code + '&qid=' + qid + '&dir=' + explore.language_direction + '&embedded=' + explore.embedded + '#' + explore.hash });

            }
            else { // dual-content-frame

              $( '#infoframeSplit2' ).attr({"src": explore.base + '/app/wikipedia/?t=' + title + '&l=' + explore.language + '&voice=' + explore.voice_code + '&qid=' + qid + '&dir=' + explore.language_direction + '&embedded=' + explore.embedded + '#' + explore.hash });

            }

          }
        }

      }

    },

  });

}

function addRawTopicCard( title ){

  const args = { 
    id            : 'n00',
    language      : explore.language,
    qid           : '',
    pid           : '',
    thumbnail     : '',
    title         : title,
    snippet       : '',
    extra_classes : 'raw-entry',
    item          : '',
    source        : 'raw',
  }

  // set non-wikidata fields
  let item_raw = { qid : '' };
  setWikidata( item_raw, [ ], true, 'p1' );
  item_raw.title = title;
  item_raw.tags[0] = 'raw-query-string';
  //console.log( item_raw );

  args.item = item_raw;

  const raw_entry = createItemHtml( args );

  // non-wikipedia entry
  if ( explore.page === 1 && explore.searchmode === 'wikipedia' ){
    $('#results').append( raw_entry );
  }

  //$('.no-wikipedia-entry').show();

}

async function insertMultiValues( args ){

	let obj = {};

  if ( typeof args === 'string' ){ // args is a string

    if ( args.startsWith('%7B%') ){ // args is an encoded string

      // decode the args-string
      args  = JSON.parse( decodeURIComponent( args ) );

	    let sel = 'details#mv-' + args.target + '[data-title=' + args.title + '] p ul';

      if ( $( sel ).length > 0 ){ // check if the mv-element is already filled

        return 0; // do nothing, mv-content already fetched

      }
      else {

        //console.log( args, 'list: ', args.list );

        if ( typeof args.list === 'string' ){

          // TODO: find a way to add these function calls to the fields-JSON and call them dynamically

					if ( args.list.startsWith('https://iptv-org') ){

          	args.list = args.list.toLowerCase(); // lowercase the iso2-code in this url
						fetchIPTV( args, args.list );

					}
					else if ( args.list.startsWith('https://nl1') ){

          	args.list = args.list.toLowerCase(); // lowercase the iso2-code in this url
						fetchRadio( args, args.list );

					}
					else if ( args.list.startsWith('osm:') ){

						insertSelectMenuOSM( args, args.list );

          }
					else if ( args.list.startsWith('stocks:') ){

            let f = args.list.split(':') || [];

            if ( f[2] === 'true' ){

              fetchStocks( args, args.list );

            }
    
          }
					else if ( args.list.startsWith('openlibrary-ebooks-meta:') ){

            fetchEbooksMeta( args, null, 1, 'relevance', '' );

          }
					else if ( args.list.startsWith('openlibrary-ebooks-author:') ){

            fetchEbooksMeta( args, null, 1, 'relevance', 'author' );

          }
					else if ( args.list.startsWith('openlibrary-ebooks-inside:') ){

            fetchEbooksInside( args, null, 1, 'relevance' );

          }
					else if ( args.list.startsWith('archive-audio:') ){

            fetchArchiveAudio( args, null, 1, 'month+desc' );

          }
					else if ( args.list.startsWith('crossref:') ){

            fetchCrossRef( args, null, 1, 'relevance', '*' );

          }
					else if ( args.list.startsWith('wikisource:') ){

            fetchWikiSource( args, args.list );

          }
					else if ( args.list.startsWith('wikiquote:') ){

            fetchWikiQuote( args, args.list );

          }
					else if ( args.list.startsWith('wikinews:') ){

            fetchWikiNews( args, args.list );

          }
					else if ( args.list.startsWith('hackernews:') ){

            fetchHackerNews( args, null, 1, 'relevance' );

          }
					else if ( args.list.startsWith('archive-scholar:') ){

            fetchArchiveScholar( args, null, 1, 'relevancy' );

          }
					else if ( args.list.startsWith('unpaywall') ){

            fetchUnpaywall( args, null, 1, 'relevance' );

          }
					else if ( args.list.startsWith('ms-academic') ){

            fetchMSAcademic( args, null, 1, 'DESC(%3FpaperPubDate)' );

          }
					else if ( args.list.startsWith('bhl:') ){

            fetchBHL( args, null, 1, 'relevance' );

          }
					else if ( args.list.startsWith('mastodon') ){

            fetchMastodon( args, null, 1, 'relevance' );

          }
					else if ( args.list.startsWith('pexels') ){

            fetchPexels( args, null, 1, 'relevance' );

          }
					else if ( args.list.startsWith('europeana') ){

            fetchEuropeana( args, null, 1, 'score' );

          }
					else if ( args.list.startsWith('rijksmuseum') ){

            fetchRijksmuseum( args, null, 1, 'relevance' );

          }
					else if ( args.list.startsWith('searchculture-greece') ){

            fetchSearchCultureGreece( args, null, 1, 'relevance' );

          }
					else if ( args.list.startsWith('loc-images') ){

            fetchLoCImages( args, null, 1, 'date_desc' );

          }
					else if ( args.list.startsWith('depicts') ){

            fetchDepicts( args, null, 1, '%3Fdate' );

          }
					else if ( args.list.startsWith('wikicommons') ){

            fetchWikicommons( args, null, 1, 'DESC(%3Fdate)' );

          }
					else if ( args.list.startsWith('met') ){

            fetchMET( args, null, 1, 'relevance' );

          }
					else if ( args.list.startsWith('cleveland') ){

            fetchCleveland( args, null, 1, 'relevance' );

          }
					else if ( args.list.startsWith('smithsonian:') ){

            fetchSmithsonian( args, null, 1, 'relevance' );

          }
					else if ( args.list.startsWith('us-archives:') ){

            fetchUSArchive( args, null, 1, 'relevance' );

          }
					else if ( args.list.startsWith('paintings:') ){

            fetchPaintings( args, null, 1, 'DESC(%3Fdate)' );

          }
					else if ( args.list.startsWith('wikidata-inlinks:') ){

            fetchWikidataInlinks( args, args.list );

          }
					else if ( args.list.startsWith('inlinks:') ){

            fetchInlinks( args, args.list );

          }
					else if ( args.list.startsWith('outlinks:') ){

            fetchOutlinks( args, args.list );

          }
					else if ( args.list.startsWith('arxiv:') ){

            fetchArxiv( args, null, 1, 'descending' );

          }
					else if ( args.list.startsWith('gdelt-news:') ){

            fetchGN( args, args.list );
    
          }
					else if ( args.list.startsWith('gdelt-tv-news:') ){

            fetchGTV( args, args.list );
    
          }
					else if ( args.list.startsWith('currentsapi:') ){

            let f = args.list.split(':') || [];

            if ( f[2] === 'true' ){

              fetchCurrentsAPI( args, args.list );

            }
    
          }
					else if ( args.list.startsWith('searchcode') ){

            fetchSearchCode( args, args.list );
    
          }
					else if ( args.list.startsWith('ebird-quiz-search') ){

            fetchEbirdHotspots( args, null  );

          }
					else if ( args.list.startsWith('plos') ){

            fetchPLOS( args, null, 1, 'relevance' );
    
          }
					else if ( args.list.startsWith('semantic-scholar-author') ){

            fetchSemanticScholarAuthorPapers( args, args.list );
    
          }
					else if ( args.list.startsWith('semantic-scholar-query') ){

            fetchSemanticScholarQuery( args, null, 1, 'relevance' );
    
          }
					else if ( args.list.startsWith('dates:') ){ // not a sparql-query, fix this workflow later!

						insertSelectMenuDates( args, args.list );

          }

					else if ( args.list.startsWith('category_tree:') ){ // not a sparql-query, fix this workflow later!

						insertCategoryTree( args );

          }
					else if ( args.list.startsWith('iframe-url:') ){ // map-sparql HTML

            showInlineIframe( args, false );

          }
					else { // wikipedia-qid-sparql URL

            fetchSparql( args, null, 1, '%3Fdate' );

					}

        }
        else { // render a topic-list of Qid's 

          //console.log('qid topics');

          // TODO: if there are more than 50 labels, split the resolving up into batches.
          insertQidTopics( args, args.list );

        }

        // set URL-fragment
        let args_ = unpackString( args ); 

        //if ( valid( args.list ) ){

          // FIXME: args.list not matching up
          //console.log( 'fragment to match for: ', args.list );
          //console.log( 'fragment to match: ', args.list.split(':')[0] );
          //explore.fragment = args.list.split(':')[0];
          //updatePushState( args.topic, 'add' );
          //explore.fragment = '';

        //}

      }

    }

  }

}

async function insertCategoryTree( args ){

  // check if detail-element was already opened
  let check = 'details#mv-' + args.target + '[data-title="' + args.title + '"] p div';

  if ( $( check ).length > 0 ){ // element was already opened

    return 0;

  }

  let f         = args.list.split(':') || [];
  let cat_title = '';
  let sel       = 'details#mv-' + args.target + '[data-title=' + args.title + '] p';

  if ( isCategory( args.topic ) ){ // check for "Category:FooBar" string first

    cat_title = args.topic;

  }
  else if ( valid( f[1] ) ){ // use Qid to resolve to the Category title

    let qid = f[1];

    const labels = await fetchLabel( [ qid ], explore.language );

    // see: https://stackoverflow.com/questions/58780817/using-optional-chaining-operator-for-object-property-access#58780897
    // example?.a?.[1]?.b
    if ( valid( labels.entities[ qid ].labels[explore.language] ) ){

      if ( labels.entities[ qid ].labels[explore.language].value ){ // FIXME

        cat_title = labels.entities[ qid ].labels[explore.language].value;

      }

    }
    else { // no matching category-language

      // TODO: it would be better to never show the cattree-button if there is no matching language. so use fetchLabel on each category-article?
      console.log('no matching category-language');

      // remove the fetch-more loading indicator
      $( sel + ' .mv-loader.' + args.id ).remove();

      return 0;

    }

  }

  if ( cat_title.length > 0 ){

    let html =
      '<div>' + 
        '<h6 class="category main">' +
          '<a class="main" href="#' + cat_title + '">' + removeCategoryFromTitle( cat_title ) + '</a>' +
        '</h6>' +
      '</div>';

    $( sel ).html( html );

    // trigger the opening of the first category
    $( sel + ' a.main ' ).click();

  }

}

async function openInline( title, fragment_id, fragment_title ){

  //explore.hash = ''; // reset hash

  //console.log( 'openInline: ', title, fragment_id, fragment_title );

  //if ( valid( title) && valid( fragment_title ) ){

    explore.fragment = fragment_title;
    updatePushState( title , 'add' );
    explore.fragment = '';

    const sel = 'details#' + fragment_id + '[data-title=' + fragment_title + ']';

    if ( $( sel ).length ){ // element exists

      //console.log( sel );

      $( sel ).first().parents('details').attr( 'open', '' );
      $( sel ).first().click().attr('open', '');

      const container = $('#tab-topics .overflow-container');
      const position	= $( sel ).first().offset().top - container.offset().top + container.scrollTop() - 20;
      container.animate({ scrollTop: position });

      $( sel + ' a:first' ).focus();

    }

  //}

}

function showInlineIframe( args ){

  args = unpackString( args );

  let limit = 1000;

  let f = args.list.split(':') || [];

  if ( valid( f[1] ) ){

    if ( f[1] === 'similar' ){

      showInlineSimilar( args );

    }
    else { // by URL

      const url = 'https://' + f[1];

      const min_height = explore.isMobile ? '300px' : '500px';

      const html = '<ul class="multi-value"><li class="resizer"><iframe class="inline-iframe resized" style="min-height: ' + min_height + '; border:none;" src="' + url + '" width="100%" height="100%" allowvr="yes" allow="autoplay; fullscreen" allowfullscreen allow-downloads allow-scripts allow-same-origin allow-forms allow-popups allow-pointer-lock title="embedded widget: URL-content" role="application"></iframe></li></ul>'; 

      const sel = 'details#mv-' + args.target + '[data-title=' + args.title + '] p';

      $( sel ).html( html );

    }

  }

}

async function showInlineSimilar( args ){

  let limit = 1000;

  let f     = args.list.split(':') || [];

  // TODO:
  //  - constrain by country-qid if available
  //  - constrain by industry for companies
  //  - choose table-view if non-geo-item-class, example: "Breaking Bad"

  let url = '';

  // TODO: remove this hack, when the tag works again
  if ( valid( f[3] ) ){

    if ( f[3] === '5' ){ // person

      args.tag = 'person';
    }

  }

  if ( args.tag === 'person' ){ // person

    if ( valid( f[6] ) ){ // with an occupation

      const qid = f[6];

      url = explore.base + '/app/query/embed.html?l=' + explore.language + '#SELECT%20DISTINCT%20%3Fitem%20%3FitemLabel%20%3FitemDescription%20%3Finception%20%3Fbirth%20%3Fstart%20%3Fpit%20%3Fcoord%20%3Fgeoshape%20%3Fimg%20WHERE%20%7B%0A%20%20%3Fitem%20wdt%3AP106%20wd%3AQ' + qid + '.%0A%20%20%3Fsitelink%20schema%3Aabout%20%3Fitem.%0A%0A%20%20%3Fsitelink%20schema%3AinLanguage%20%3Flang%20.%0A%20%20SERVICE%20wikibase%3Alabel%20%7B%20bd%3AserviceParam%20wikibase%3Alanguage%20%22' + explore.language + '%22.%20%7D%0A%20%20optional%20%7B%3Fitem%20wdt%3AP18%20%3Fimg%20.%7D%20%0A%20%20optional%20%7B%3Fitem%20wdt%3AP569%20%3Fbirt%20.%7D%20%0A%20%20optional%20%7B%3Fitem%20wdt%3AP571%20%3Finception%20.%7D%20%0A%20%20optional%20%7B%3Fitem%20wdt%3AP580%20%3Fstart%20.%7D%0A%20%20optional%20%7B%3Fitem%20wdt%3AP585%20%3Fpit%20.%7D%0A%20%20optional%20%7B%3Fitem%20wdt%3AP625%20%3Fcoord%20.%7D%20%0A%20%20optional%20%7B%3Fitem%20wdt%3AP3896%20%3Fgeoshape%20.%7D%20%20%0A%20%20FILTER(%3Flang%3D%22' + explore.language + '%22)%0A%7D%0AORDER%20BY%20%3FitemLabel%0ALIMIT%20' + limit + '%0A%20%23meta%3Asimilar%20topics%20%23defaultView%3AMap%0A';

    }

  }
  else if ( valid( f[2] ) ){ // by subclass-qid

    const qid = f[2];

    url = explore.base + '/app/query/embed.html?l=' + explore.language + '#SELECT%20DISTINCT%20%3Fitem%20%3FitemLabel%20%3FitemDescription%20%3Finception%20%3Fbirth%20%3Fstart%20%3Fpit%20%3Fcoord%20%3Fgeoshape%20%3Fimg%20WHERE%20%7B%0A%20%20%3Fitem%20wdt%3AP279%20wd%3AQ' + qid + '.%0A%20%20%3Fsitelink%20schema%3Aabout%20%3Fitem.%0A%0A%20%20%3Fsitelink%20schema%3AinLanguage%20%3Flang%20.%0A%20%20SERVICE%20wikibase%3Alabel%20%7B%20bd%3AserviceParam%20wikibase%3Alanguage%20%22' + explore.language + '%22.%20%7D%0A%20%20optional%20%7B%3Fitem%20wdt%3AP18%20%3Fimg%20.%7D%20%0A%20%20optional%20%7B%3Fitem%20wdt%3AP569%20%3Fbirt%20.%7D%20%0A%20%20optional%20%7B%3Fitem%20wdt%3AP571%20%3Finception%20.%7D%20%0A%20%20optional%20%7B%3Fitem%20wdt%3AP580%20%3Fstart%20.%7D%0A%20%20optional%20%7B%3Fitem%20wdt%3AP585%20%3Fpit%20.%7D%0A%20%20optional%20%7B%3Fitem%20wdt%3AP625%20%3Fcoord%20.%7D%20%0A%20%20optional%20%7B%3Fitem%20wdt%3AP3896%20%3Fgeoshape%20.%7D%20%20%0A%20%20FILTER(%3Flang%3D%22' + explore.language + '%22)%0A%7D%0AORDER%20BY%20%3FitemLabel%0ALIMIT%20' + limit + '%0A%20%23meta%3Asimilar%20topics%20%23defaultView%3AMap%0A';


  }
  else if ( valid( f[3] ) ){ // by instance-qid

    const qid = f[3];

    url = explore.base + '/app/query/embed.html?l=' + explore.language + '#SELECT%20DISTINCT%20%3Fitem%20%3FitemLabel%20%3FitemDescription%20%3Finception%20%3Fbirth%20%3Fstart%20%3Fpit%20%3Fcoord%20%3Fgeoshape%20%3Fimg%20WHERE%20%7B%0A%20%20%3Fitem%20wdt%3AP31%20wd%3AQ' + qid + '.%0A%20%20%3Fsitelink%20schema%3Aabout%20%3Fitem.%0A%0A%20%20%3Fsitelink%20schema%3AinLanguage%20%3Flang%20.%0A%20%20SERVICE%20wikibase%3Alabel%20%7B%20bd%3AserviceParam%20wikibase%3Alanguage%20%22' + explore.language + '%22.%20%7D%0A%20%20optional%20%7B%3Fitem%20wdt%3AP18%20%3Fimg%20.%7D%20%0A%20%20optional%20%7B%3Fitem%20wdt%3AP569%20%3Fbirt%20.%7D%20%0A%20%20optional%20%7B%3Fitem%20wdt%3AP571%20%3Finception%20.%7D%20%0A%20%20optional%20%7B%3Fitem%20wdt%3AP580%20%3Fstart%20.%7D%0A%20%20optional%20%7B%3Fitem%20wdt%3AP585%20%3Fpit%20.%7D%0A%20%20optional%20%7B%3Fitem%20wdt%3AP625%20%3Fcoord%20%0A%20%20optional%20%7B%3Fitem%20wdt%3AP3896%20%3Fgeoshape%20.%7D%20.%7D%20%20%0A%20%20FILTER(%3Flang%3D%22' + explore.language + '%22)%0A%7D%0AORDER%20BY%20%3FitemLabel%0ALIMIT%20' + limit + '%0A%20%23meta%3Asimilar%20topics%20%23defaultView%3AMap%0A';

  }

  const min_height = explore.isMobile ? '300px' : '500px';

  const html = '<ul class="multi-value"><li class="resizer"><iframe class="inline-iframe resized" style="min-height: ' + min_height + '; border:none;" src="' + url + '" width="100%" height="100%" allowvr="yes" allow="autoplay; fullscreen" allowfullscreen allow-downloads allow-scripts allow-same-origin allow-forms allow-popups allow-pointer-lock title="embedded widget: similar topics" role="application"></iframe></li></ul>'; 

  const sel = 'details#mv-' + args.target + '[data-title=' + args.title + '] p';

  $( sel ).html( html );

}

async function insertSelectMenuDates( args, fields ){

  let html = '<ul class="multi-value"><li><select class="mv-select" name="' + args.target + '">' + explore.date_tag_options + '</select></li></ul> <ul style="display:none;" class="multi-value mv-select-card" name="' + args.target + '"><li></li></ul>'; 

  let sel = 'details#mv-' + args.target + '[data-title=' + args.title + '] p';

  $( sel ).html( html );

  const s2 = 'select[name ="' + args.target + '"]';

  // see: https://select2.org/configuration/options-api
  $( s2 ).select2({

    dropdownPosition: 'below', // see library-extension here: https://jsfiddle.net/byxj73ov/ and https://jsfiddle.net/byxj73ov/ 
    width: '95%',
    //escapeMarku: function (markup) { return markup; },

  });

  $( s2 ).on('select2:select', function(e) {

    let data      = e.params.data;
    let tag       = data.id;
    tag           = encodeURIComponent( tag );

    let new_title = args.topic + ' ' + tag;
    let new_title_quoted = '%22' + args.topic + '%22%20' + tag;

    // create topic html
		let title_link = '<a href="javascript:void(0)" class="mv-extra-topic" title="' + new_title + '" aria-label="' + new_title + '"' + setOnClick( Object.assign({}, args, { type: 'link', url: explore.base + '/app/video/#/search/' + new_title_quoted, title: new_title, qid: '', language  : explore.language } ) ) + '> ' + decodeURIComponent( new_title ) + '</a><br>';

    let topic_html = 
      '<ul class="multi-value mv-select-card" name="' + args.target + '"><li>' +
        title_link +
        '<span class="mv-extra-buttons">' +
          '<a href="javascript:void(0)" class="mv-extra-icon" title="explore" aria-label="explore this topic"' + setOnClick( Object.assign({}, args, { type: 'explore', title: encodeURIComponent( new_title ), qid: '', language  : explore.language } ) ) + '"> <span class="icon"><i class="fa-solid fa-retweet" style="position:relative;"></i></span></a>' +
          '<a href="javascript:void(0)" class="mv-extra-icon" title="video" aria-label="video"' + setOnClick( Object.assign({}, args, { type: 'link', url: explore.base + '/app/video/#/search/' + new_title_quoted, title: new_title, qid: '', language  : explore.language } ) ) + '"> <span class="icon"><i class="fa-solid fa-video" style="position:relative;"></i></span></a>' +
          '<a href="javascript:void(0)" class="mv-extra-icon" title="streaming video" aria-label="streaming video"' + setOnClick( Object.assign({}, args, { type: 'wander', title: encodeURIComponent( new_title ), qid: '', language  : explore.language } ) ) + '"> <span class="icon"><i class="fa-brands fa-youtube" style="position:relative;"></i></span></a>' +
          '<a href="javascript:void(0)" class="mv-extra-icon" title="images" aria-label="images"' + setOnClick( Object.assign({}, args, { type: 'link', title: encodeURIComponent( new_title ), url: encodeURI( 'https://www.bing.com/images/search?&q=' + new_title_quoted + '&qft=+filterui:photo-photo&FORM=IRFLTR&setlang=' + explore.language + '-' + explore.language ), qid: '', language  : explore.language } ) ) + '"> <span class="icon"><i class="fa-regular fa-images" style="position:relative;"></i></span></a>' +
          '<a href="javascript:void(0)" class="mv-extra-icon" title="books" aria-label="books"' + setOnClick( Object.assign({}, args, { type: 'link', title: encodeURIComponent( new_title ), url: encodeURI( 'https://openlibrary.org/search?q=' + new_title_quoted + '&mode=everything&language=' + explore.lang3 ), qid: '', language  : explore.language } ) ) + '"> <span class="icon"><i class="fa-brands fa-mizuni" style="position:relative;"></i></span></a>' +
          '<a href="javascript:void(0)" class="mv-extra-icon" title="Bing web search" aria-label="Bing web search"' + setOnClick( Object.assign({}, args, { type: 'link', url: 'https://www.bing.com/search?q=' + new_title_quoted + '&setlang=' + explore.language + '-' + explore.language, title: new_title, qid: '', language  : explore.language } ) ) + '"> <span class="icon"><i class="fa-brands fa-searchengin" style="position:relative;"></i></span></a>' +
        '</span>' +
      '</li></ul>';

    // remove any possible previous card
    let sel_card = 'details#mv-' + args.target + ' .mv-select-card';
    $( sel_card ).replaceWith( topic_html );

  });

}

function insertQidTopics( args, list ){

	let obj = {};
	let qlist = '';

	$.each( list, function (j, item ) {

    if (  j < 49 ){

		  qlist += item + '|';

    }
    else {
      // skip label, as we are over the query-limit
    }

	});

	qlist = qlist.slice(0, -1);

	// note API limit of 50!
	let lurl = datasources.wikidata.instance_api + '?action=wbgetentities&ids=' + qlist + '&format=json&languages=' + explore.language + '|en&props=labels';

	$.ajax({

			url: lurl,

			jsonp: "callback",
			dataType: "jsonp",

			success: function( response ) {

				if ( typeof response.entities === undefined || typeof response.entities === 'undefined' ){

					return 1;
				}

				Object.entries( response.entities ).forEach(([ k , v ]) => {

          let label = '';
          let qid   = v.id;

          if ( typeof v.labels[explore.language] === undefined || typeof v.labels[explore.language] === 'undefined' ){ // no label-language match

            if ( typeof v.labels['en'] === undefined || typeof v.labels['en'] === 'undefined' ){

              label = v.id; // use qid-string as the label

            }
            else{
 
              label = v.labels['en'].value ; // english fallback

            }

          }
          else {

            label = v.labels[explore.language].value;

            obj[ qid ] = {

              title_link:           encodeURIComponent( '<a href="javascript:void(0)" class="mv-extra-topic" title="' + label + '" aria-label="' + label + '"' + setOnClick( Object.assign({}, args, { type: 'wikipedia-qid', qid: qid, title: label } ) ) + '>' + label + '</a><br>' ),
              thumb_link:           '',
              explore_link:         encodeURIComponent( getExploreLink( args, label, qid ) ),
              video_link:           encodeURIComponent( getVideoLink( args, label ) ),
              wander_link:          encodeURIComponent( getWanderLink( args, label ) ),
              images_link:          encodeURIComponent( getImagesLink( args, label ) ),
              books_link:           encodeURIComponent( getBooksLink( args, label, qid ) ),
              websearch_link:       encodeURIComponent( getWebsearchLink( args, label, qid ) ),
              compare_link:         encodeURIComponent( getCompareLink( qid ) ),
              website_link:         '', // getExternalWebsiteLink( url ) , getLocalWebsiteLink( args, url )
              custom_links:         '', // custom_links,
              raw_html:             '', // raw_html
              mv_buttons_style:     '',

            };

          }

				});

				insertMultiValuesHTML( args, obj, {} );

			},

	});

}

async function insertMultiValuesHTML( args, obj, meta ){

  let sort_select = '';

  let sel = 'details#mv-' + args.target + '[data-title=' + args.title + '] p';

  // create meta header
  let meta_header = '';

  if ( typeof meta === undefined || typeof meta === 'undefined' ){
    // do nothing

    meta = {};

  }
  else {

    if ( valid( meta.page ) ) {
      // do nothing
    }
    else {

      meta.page = 1;

    }

    if ( valid( meta.sort_select ) ){ // add select form

      sort_select = meta.sort_select;

    }

    if ( valid( meta.source ) ){ // add select form
      // do nothing
    }
    else {

      meta.source = args.title.replace(/_/g, ' ');

    }

    let result_counter_html = '';

    if ( meta.page === 1 ){ // only for the first results

      if ( valid( meta.call ) ){ // fetch-more enabled, dont show counter

        result_counter_html = '( ' + meta.total_results + ' )';

      }
      else if ( valid( meta.total_results ) ){ // no fetching-enabled

        result_counter_html = '( ' + meta.results_shown + ' / ' + meta.total_results + ' )';

      }
      else if ( valid( meta.total_results_shown ) ){

        result_counter_html = '( ' + meta.results_shown + ' )';

      }

      meta_header = '<div class="topic-extra meta"><a href="javascript:void(0)" title="link to query" onclick="openInNewTab( &quot;' + meta.link + '&quot;)">' + meta.source + '</a> <span class="results">' + result_counter_html + '</span></div>' + sort_select;

    }

  }

  let html = meta_header + '<ul class="multi-value">';

  let i = 0;

  // 3) output: html button row for each qid:
  Object.entries( obj ).forEach(([ id , v ]) => {

    v.end_summary = '';

    html +=
      '<li>' +
        decodeURIComponent( v.title_link ) +
        '<span class="mv-extra-buttons" style="' + v.mv_buttons_style + '">' +
          decodeURIComponent( v.custom_links ) +
          decodeURIComponent( v.explore_link ) +
          decodeURIComponent( v.video_link ) +
          decodeURIComponent( v.wander_link ) +
          decodeURIComponent( v.images_link ) +
          decodeURIComponent( v.books_link ) +
          decodeURIComponent( v.websearch_link ) +
          decodeURIComponent( v.compare_link ) +
          decodeURIComponent( v.website_link ) +
        '</span>' +

        decodeURIComponent( v.raw_html ) +
        v.end_summary + // ends detail-summary for presentation-html

        decodeURIComponent( v.thumb_link ) +
        '<a class="go-to-top-detail" title="scroll to top of list" onclick="$(&apos;' + sel + '&apos;)[0].scrollIntoView();"><i class="fa-solid fa-chevron-up"></i></a>' +
      '</li>';

    // fetch-more button
    if ( i === Object.entries( obj ).length - 1 ){

      if ( valid( meta.call ) ){

        let cursor_string = '';

        if ( valid( meta.cursor ) ){ // use cursor

          cursor_string = ', &quot;' + meta.cursor + '&quot;';

        }

        let qid_string = '';

        if ( valid( meta.qid ) ){ // use qid

          qid_string = ', &quot;' + meta.qid + '&quot;';

        }

        html += '<a href="javascript:void(0)" class="mv-extra-topic fetch-more" title="more results" aria-label="more results" onclick="' + meta.call + '( &quot;' + encodeURIComponent( JSON.stringify( args ) ) + '&quot;, ' + meta.total_results + ',' +  ( meta.page + 1 )  + ', &quot;' + meta.sortby + '&quot; ' + cursor_string + qid_string + '); $(this).remove();" data-title="' + args.title + '"><i class="fa-solid fa-ellipsis-h"></i></a>';

      }

    }

    i += 1;

  });

  html += '</ul>';

  // remove the fetch-more loading indicator
  $( sel + ' .loaderMV' ).remove();

  // TODO can we merge these two loader-add-remove versions? (see createItemHtml.js)
  $( sel + ' .mv-loader.' + args.id ).remove();

  if ( meta.page === 1 ){ // insert first html

    $( sel ).html( html );

  }
  else { // append extra html

    // append extra results
    $( sel ).append( html );

  }

}

async function fetchWikidata( qids, topicResults, source, target_pane ){

  return new Promise((resolve, reject) => {

    let item_ = ''; // used for the single return value

    const wikidata_url = window.wbk.getEntities({
      ids: qids,
      redirections: false,
    })

    //wbk.simplify.claims( entity.claims, { keepQualifiers: true })

    // get wikidata json
    fetch( wikidata_url )

      .then( response => response.json() )
      .then( window.wbk.parse.wd.entities )
      //.then( data => window.wbk.simplify.entities(data.entities, { keepQualifiers: true } )) // TODO
      .then( entities => {

        //console.log( 'nr of wikidata results: ', topicResults.query.search.length );

        if ( topicResults !== '' ){ // multiple results found with a matching qid

          //if ( source === 'wikidata' ){
            //console.log( 'more wikidata results?: ', topicResults );
          //}

          // add wikidata to respective wikiresult item
          $.each( topicResults.query.search, function( k, item ) {

            // make sure the item has a qid
            if ( typeof item.qid === undefined || typeof item.qid === 'undefined'){
              // do nothing
            }
            // AND make sure that there is an entity with this qid
            else if ( typeof entities[ item.qid ] === undefined || typeof entities[ item.qid ] === 'undefined'){
              // do nothing
            }
            else { // item with qid

              if ( item.qid === entities[ item.qid ].id ){ // matching qid

                // detect the relevant wikidata-data and put this info into each item
                setWikidata( item, entities[ item.qid ], false, target_pane );

              }

            }

          });

          resolve( [ { source : { data: topicResults } } ] );

        }
        else { // single result

          let item = { qid : qids[0] };

          // detect the relevant wikidata-data and put this info into the item
          setWikidata( item, entities[ item.qid ], true, target_pane );

          // QQQ FIXME: how should we handle this? 
          //console.log('fetchWikidata: single: ', source, ' fix needed?' );

          resolve( [ { source : { data: item } } ] );

        }

    }) // end of qid entitie processing

    //return item_;

  });

}

async function renderTopics( inputs ) {

  setDisplayForResults();

  //console.log( 'inputs: ',  inputs );

  explore.totalRecords  = 0; // default reset
  let combined_pagesize = 0; // default

  Object.keys( inputs ).forEach(( key, index ) => {

    explore.totalRecords += parseInt( inputs[ key ].data.value[0].source.data.query.searchinfo.totalhits );
    combined_pagesize += parseInt( datasources[ key ].pagesize );

  });

  if ( explore.totalRecords === 0 ){

    $('#results-label' ).empty();

  }
  else {

    $('#results-label').html( '<span id="app-guide-page">' + explore.banana.i18n('app-guide-page') + '</span>' + ' ' + explore.page + ' / <span id="total"></span>');

  }

  // non-wikipedia-entry title
  const t = encodeURIComponent( getSearchValue() );

  const title = getSearchValue();

  const args = { 
    id            : 'n00',
    language      : explore.language,
    qid           : '',
    pid           : 'p' + explore.page, // page ID
    thumbnail     : '',
    title         : title,
    snippet       : '',
    extra_classes : 'raw-entry',
    item          : '',
    source        : 'raw',
  }

  // set non-wikidata fields
  let item_raw      = { qid : '' };
  setWikidata( item_raw, [ ], true, 'p1' );
  item_raw.title    = title;
 	item_raw.tags[0]  = 'raw-query-string';

	if ( args.id === 'n00' ){

		args.item		= item_raw;

	}

  const raw_entry = createItemHtml( args );

  // QQQ FIXME
  // non-wikipedia entry
  //if ( explore.page === 1 && explore.searchmode === 'wikipedia' ){
  //  $('#results').append( raw_entry );
  //}

  if ( explore.totalRecords === 0 ){ // no topics found

    $('.no-wikipedia-entry').show();

	  markArticle('n00', explore.type );

    $( explore.baseframe ).attr({"src": explore.base + '/blank.html' });

  }
	else { // multiple results found

    Object.keys( inputs ).forEach(( key, index ) => {

      addTopics( key, inputs[ key ].data.value[0].source.data.query.search );

    });

		// calculate total nr of pages (and force to one when no results are found)
	  $('#total-results').html( '<b>' + explore.totalRecords + '</b> <span id="app-topics-found">' + explore.banana.i18n('app-topics-found') + '</span>');;

    if ( explore.searchmode === 'wikidata' ){

		  $('#total').html( Math.max( Math.ceil( explore.totalRecords / datasources.wikidata.pagesize ), 1) );

    }
    else { // wikipedia

		  $('#total').html( Math.max( Math.ceil( explore.totalRecords / combined_pagesize ), 1) );

    }

		// hide next-page-button when there are no other pages available
		if ( explore.totalRecords < combined_pagesize ){
			$('#next').css("display", "none");
      $('#scroll-end').hide();
		}
    else {
      $('#scroll-end').show();
			$('#next').css("display", "inline-block");
    }

    // FIXME why does the highlighting not work when the following "instance" line is moved to the to top the function?
    const markjs_instance = new Mark( document.querySelectorAll( '.p' + explore.page ) ) ;

    // highlight the matching search-query words in article-summaries
    const m = explore.q.replace(/[()"“”'‘’]/g, '').replace(/[\-,]/g, ' ');

    markjs_instance.mark( m , {
      'element': 'span',
      'className': 'highlight',
      'accuracy': 'exactly',
      'separateWordSearch' : true,
      'ignoreJoiners' : true,
      'diacritics' : true,
      //'ignorePunctuation' : [ ' ' ],
      //'wildcards' : "withSpaces",
      //'accuracy': {
      //  'value': 'exactly',
      //  'limiters': [',', '.'],
      //},
    });

    if ( valid( explore.tab ) ){
      explore.tabsInstance.select( explore.tab );
      explore.tab = '';
    }
		else if ( explore.isMobile ){
			explore.tabsInstance.select('tab-topics');
		}

    // QQQ FIXME make this work for other targeted non-wikipedia-types
    /*
		if ( inputs['wikipedia'].data.value[0].source.data.query.length > 0 ){

      const id = $( ".entry:nth-child(2)" ).attr('id'); // 'n1'

			const q_ = getSearchValue().toLowerCase().replace(/^"|"$/g, '').trim();

      // TODO: handle this with multiple data sources
			// check if the names match of the non-wikipedia and wikipedia article
			const c0 = ( q_ === inputs['wikipedia'].data.value[0].source.data.query.search[0].title.toLowerCase().trim() );
      const c1 = ( typeof inputs['wikipedia'].data.value[0].source.data.query.search[1] !== 'undefined' ) ? (q_ === inputs['wikipedia'].data.value[0].source.data.query.search[1].title.toLowerCase().trim() ) : ''
      const c2 = ( typeof inputs['wikipedia'].data.value[0].source.data.query.search[2] !== 'undefined' ) ? (q_ === inputs['wikipedia'].data.value[0].source.data.query.search[2].title.toLowerCase().trim() ) : ''
      const c3 = ( typeof inputs['wikipedia'].data.value[0].source.data.query.search[3] !== 'undefined' ) ? (q_ === inputs['wikipedia'].data.value[0].source.data.query.search[3].title.toLowerCase().trim() ) : ''
			const cl = ( explore.page > 1 );

			// check at least the first four (standard, category, book, portal) articles
			if ( explore.page > 1 || c0 || c1 || c2 || c3 || cl ){
        // do nothing: raw-string-topic is hidden by default
			}
      else {
				$('.no-wikipedia-entry').show();
      }

			// only on the INITIAL app visit AND WITH wikipedia results: mark the "id" article
			if ( explore.firstAction && explore.page === 1 ){

				markArticle(id, explore.type );

			}

		}
		else { // mark on the "no-wikipedia-article"
	    $('.no-wikipedia-entry').show();
			markArticle('n0', explore.type );
		}
    */

	}

  // auto-close inactive "multi-value detail" elements in the sidebar
  $('details.multi-value').click(function (event) {
    $('details.multi-value').not(this).removeAttr("open");  
  });

  // store URL-query title for future uses
  explore.q_prev        = explore.q;
  explore.type_prev     = explore.type;
  explore.language_prev = explore.language;

  let q     = window.location.pathname.replace(/\/explore\//g, ' ') || ''; 
  q         = q.replace(/<\/?("[^"]*"|'[^']*'|[^>])*(>|$)/g, '').trim().replace(/_/g, ' ').replace(/%25/g, '%').replace(/%20/g, ' ');
  explore.q = decodeURIComponent( q );

  $('#pager').show(); // initially hidden, and also temporarily hidden during the next-page-loading phase

  $('#blink').hide();

  // add note to the first detail-element
  $('#n1-0 .bt:first').html('<span class="guiding-info"> &nbsp;&nbsp; <i class="fa-solid fa-long-arrow-alt-left"></span></i><span id="app-guide-see-more" class="notbold"> ' + explore.banana.i18n('app-guide-see-more') + '</span>');

  // if there is a fragment parameter: try to open the detail-fragment
  if ( valid( explore.fragment ) ){
    
    let fragment_id  = 'mv-' + $( "div#results a.article-title:contains(" + explore.q + ")" ).first().parent().attr('id') || '';

    // FIXME
    if ( fragment_id === 'mv-n00' ){
      fragment_id = 'mv-n1-0';
    }

    console.log( 'opening detail-fragment: ',  encodeURIComponent( explore.q ), fragment_id , explore.fragment );

    openInline( encodeURIComponent( explore.q ), fragment_id , explore.fragment ); // openInline('Red Robin', 'mv-n1-1', 'taxon_group')

  }

  $('#loader').hide();

}

function addTopics( source, list ){

  // for each topic
  $.each( list, function( i, item ) {

    let title = encodeURIComponent( item.title );
    let q   = encodeURIComponent( item.qid ) || 0;
    let qid   = '';
    let custom = '';
    let concept_class = '';
    let thumb = encodeURIComponent( item.thumb ) || '';

    if ( thumb === 'undefined' ){ thumb = ''; }

    const thumbnail = ( thumb.length > 0 )? '<div class="summary-thumb"><img class="thumbnail" src="' + 'https://'+ explore.language + '.wikipedia.org/wiki/' + explore.language + ':Special:Filepath/' + thumb + '?width=150' + '" alt="" /></div>' : '';

    if ( q.length > 1 ){
      qid  = q.substring(1);
    }

    if ( typeof item.lat === undefined || typeof item.lat === 'undefined' ){
      // do nothing
    }
    else {
      custom = { lat: item.lat, lon: item.lon, radius: explore.nearby_radius_limit, limit: explore.nearby_max_results };
    }

    title = title.replace(/%3A/, ':'); // FIXME why is this needed? any other problematic character encodings?

    // cleanup "namespaces" in title (as this is better for some search-services)
    const title_ = minimizeTitle( title );

    const id  = 'n' + explore.page + '-' + i; // entry ID

    const scrollTriggerClass = ( i === ( list.length - 1) ) ? 'triggerLoading' : '';

    const args = { 
      id            : id,
      language      : explore.language,
      qid           : qid,
      pid           : 'p' + explore.page,
      thumbnail     : thumbnail,
      title         : item.title,
      snippet       : item.snippet,
      extra_classes : '',
      item          : item,
      custom        : custom,
      source        : source,
    }

    const html_result_list = createItemHtml( args );

    // wikipedia article
    $('#results').append( html_result_list );

    if ( explore.type === 'articles'){ // dont re
      explore.type = '';
      return 0;
    }

    // do this ONLY on the first result page, not later pages
    if ( explore.page === 1 && i === 0 ){  // we are at the first wikipedia result

      if ( explore.type === 'wikipedia' || explore.type === '' ){ // NOTE: the empty-type-case (with results) indicates a structured-query WITHOUT an "explore.q"

        explore.replaceState = false;

        // no wikipedia article found for this title, so click on first article in result-list
        $('#n1-0 a:first').click(); 

        explore.replaceState = true;

      }

      markArticle('n1-0', explore.type );

    }

  });

}

async function renderType( args ) {

  // args
  let type      = args.type;
  let title     = args.title;  // formal title
  let title_    = args.title_; // minimized title (contains no: namespace, or "[()]"-characters  )
  let title_quoted = args.title_quoted;
  let url       = args.url;
  let qid       = args.qid; // with 'Q' character
  let qid_      = '';       // without 'Q' character
  let current_pane = args.current_pane;
  let target_pane = args.target_pane;
  let id        = args.id;
  let ids       = args.ids;
  let tag       = args.tag;
  let languages = args.languages;
  let custom    = args.custom;
  let gbif_id   = args.gbif_id;
  let banner    = args.page_banner;
  let panelwidth= args.panelwidth || '';
  let slide     = args.slide      || '';
  // TODO should we also add a "hash" argument?

  //console.log( 'args: ', args );

  explore.curr_title = title;
  explore.curr_article_id = '1';

  let hash_ = explore.hash;

  // FIXME check correctness
  if ( typeof qid === undefined || typeof qid === 'undefined' ){

    if ( typeof explore.qid === undefined || explore.qid === 'undefined' ){
      qid = explore.qid = '';
    }
    else {
      qid = explore.qid || '';
    }
  }

  if ( qid.startsWith('Q') ){
    qid = qid.substring(1); // remove 'Q' from string, which is needed for some types
  }

  // reset cache fields
  explore.archive_cached_sentences = '';
  explore.archive_cached_html = '';

  if ( type === 'wikipedia' || type === ''){ // RIGHT-side: load new iframe content from wikipedia (default type)

    // FIXME don't do this for known items which lack a qid
    if ( typeof tag === undefined || typeof tag === 'undefined' ){ // try to get a qid first: if the qid exists: we try to fetch its wikidata 

      explore.title = title;

      if ( title.startsWith( explore.lang_talk + ':' ) ||
           title.startsWith( explore.lang_portal + ':' ) ||
           title.startsWith( explore.lang_book + ':' )
          ){ // render without wikidata-info

        resetIframe();

        $( explore.baseframe ).attr({"src": explore.base + '/app/wikipedia/?t=' + title + '&l=' + explore.language + '&voice=' + explore.voice_code + '&dir=' + explore.language_direction  + '&embedded=' + explore.embedded + '#' + explore.hash });

      }
      else { // render with wikidata-info

        if ( qid === '' ){

          getWikidataFromTitle( title, true, target_pane );

        }
        else {

          getTitleFromQid( 'Q' + qid, target_pane );

        }

      }

    }
    else {

      // determine if we should render someting else than the wikipedia artcle, eg: link
      if ( explore.type === 'link' ){

        if ( explore.uri !== '' ){ // use URL param

          //console.log( 'link is: ', explore.uri );

          if ( explore.uri.startsWith('%25') ){ // is an encoded string

            explore.uri = JSON.parse( decodeURIComponent( explore.uri ) );

          }

          renderToPane( target_pane, explore.uri );

        }

      }
      else { // wikipedia

        if ( languages === '' ){ 

          // no wikidata set yet for this article, so get wikidata and render the article.
          getWikidataFromTitle( title, true, target_pane );

        }
        else { // user is coming from an internal click, which should have the wikidata already

          renderToPane( target_pane, explore.base + '/app/wikipedia/?t=' + title + '&l=' + explore.language + '&voice=' + explore.voice_code + '&qid=' + qid + '&dir=' + explore.language_direction + '&embedded=' + explore.embedded + '#' + explore.hash );

        }

      }

    }

  }
	else if ( type === 'wikipedia-qid' ){ // get wikipedia page from a wikidata qid

    if ( explore.firstAction ){

      getTitleFromQid( explore.qid, target_pane );

    }
    else {

      getTitleFromQid( 'Q' + qid, target_pane );

    }

  }
	else if ( type === 'explore' ){ // LEFT + RIGHT-side: search & load new iframe content. Used by the "explore this topic" button

		$('#pager').hide();

    explore.page = 1; // reset active page

    // TODO: make this work for secondary-iframes

    // remove "Category:" string when needed?
    const title_nocat = removeCategoryFromTitle( title ); // TODO: also make this work for RTL-scripts

    // prevent this duplicate (loop-causing) call from happening when the 'explore'-view is triggered by replace State()
    explore.type = 'wikipedia';

    $('#srsearch').val( decodeURIComponent( title_nocat ) );

    explore.q = getSearchValue();
    $('.submitSearch').click();

    if ( valid( explore.tab ) ){
      explore.tabsInstance.select( explore.tab );
      explore.tab = '';
    }
    else {
      explore.tabsInstance.select('tab-topics');
    }

		markArticle('n1-0', explore.type );

	}

	else if ( type === 'articles' ){ // LEFT-side: only show new search results (dont change the iframe window). Used in: geo app

		$('#srsearch').val( decodeURIComponent( title ) );
    explore.q = getSearchValue();

    $('.submitSearch').click();
    explore.type = 'articles';
    explore.tabsInstance.select('tab-topics');

  }
	else if ( type === 'bookmark' ){

    addBookmark( event, 'clicked' );

    // immediately modify items bookmark-icon
    if ( id !== '' ){
      $( '#' + id ).find( '.bookmark-icon' ).removeClass().addClass( 'bookmark-icon fa-solid fa-bookmark bookmarked' ).data( 'bookmarkid', id );;
    }

	}
	else if ( type === 'random' ){ // LEFT + RIGHT-side: search & load new iframe content. Used by the "explore this topic" button

    getRandomPages(); // this will set the type back to "wikipedia" and submit the search also.

    explore.tabsInstance.select('tab-topics');

	}

	else if ( type === 'wander' ){

    let firstAction = explore.firstAction; // due to the async-ajax-call we need to store this value

    explore.vids = [];
    explore.vids_index = 0;

    let custom_param      = '';
    let number_of_results = 10;

    if ( custom === 'long' ){
      custom_param = '&videoDuration=long';
      number_of_results = 4;
    }

    let wander_url = explore.base + '/app/proxy/video/search?part=id&type=video&relevanceLanguage=' + explore.language + '&maxResults=' + number_of_results + '&q=' + encodeURIComponent( title_quoted ) + custom_param;

    $.ajax({

      // videoDuration=long
      url: wander_url,

      dataType: "json",

      success: function ( data ) {

        if ( custom === 'long' ){ // sort array randomly (to prevent the same video from playing each time)
          data.items = shuffleArray( data.items );
        }

        $.each( data.items, function( i, item ){

          explore.vids.push( item.id.videoId );
    
        });	

        if ( explore.vids_mute !== '' ){
          // do nothing
        }
        else { // no value set yet
          explore.vids_mute = firstAction? true : false;
        }

        // TODO
        // add title
        // open-in-tab from correct resume time
        // prevent needless control-menu flickering
        // add skip ahead 30sec?
        let url_ = explore.base + '/app/video/?wide=true&wander=true#/view/' + explore.vids[ explore.vids_index ];

        // target URL: /app/video/?wide=true#/view/zqNTltOGh5c/20/40
        //let url_ = explore.base + '/app/wander/?videoId=' + explore.vids[ explore.vids_index ] + '&mute=' + explore.vids_mute;

        resetIframe();
        $( explore.baseframe ).attr({"src": url_ });
        explore.firstAction = false;

      },

      error: function (xhr, ajaxOptions, thrownError) {
        console.log(xhr.status);
        console.log(thrownError);
        explore.firstAction = false;
      }

    });

	}
	else if ( type === 'nlp-query' ){ // TODO

    resetIframe();

	}
  else if ( type === 'compare' ){

    const url =  encodeURI( explore.base + '/app/compare/?r&lang=' + explore.language + '&i=' + explore.compares.join() );

    resetIframe();
    $( explore.baseframe ).attr({"src": decodeURI( url ) });

  }
  else if ( type === 'link-split' ){

    if ( ! isNaN( panelwidth ) ){

      resetIframe( 'split', panelwidth, 100 - panelwidth );

    }
    else {

      resetIframe( 'split' );

    }

    if ( explore.uri !== '' ){ // use URL param

      if ( explore.isMobile ){

        $('#infoframeSplit1').attr({"src": decodeURI( explore.uri ) });

        $('#infoframeSplit2').attr({"src": explore.base + '/app/wikipedia/?t=' + title + '&l=' + explore.language + '&voice=' + explore.voice_code + '&dir=' + explore.language_direction + '&embedded=' + explore.embedded + '#' + explore.hash });

      }
      else {

        $('#infoframeSplit1').attr({"src": decodeURI( explore.uri ) });
        $('#infoframeSplit2').attr({"src": explore.base + '/app/wikipedia/?t=' + title + '&l=' + explore.language + '&voice=' + explore.voice_code + '&dir=' + explore.language_direction + '&embedded=' + explore.embedded + '#' + explore.hash });

        $('.fixed-action-btn.direction-left').hide();

      }

    }

    explore.firstAction = false;

  }

	else if ( type === 'link' ){

    if ( explore.uri !== '' ){ // use URL param

      if ( explore.uri.startsWith('%22') ){ // is an encoded string

        explore.uri = JSON.parse( decodeURIComponent( explore.uri ) );

      }

      renderToPane( target_pane, decodeURIComponent( explore.uri ) );

    }
    else { // use passed URL value

      renderToPane( target_pane, decodeURIComponent( url ) ); // TODO: is the decodeURIComponent() needed here?

    }

    explore.firstAction = false;

  }
	else if ( type === 'url' ){

    // TODO: can back/forward work with "open in new tab" actions?
    if ( explore.uri !== '' ){ // use URL param
      openInNewTab( JSON.parse( decodeURI( explore.uri ) )  );
    }
    else { // use passed URL value

      if ( url !== '' ){
        openInNewTab( JSON.parse( decodeURI( url ) )  );
      }

    }

    // hide loaders
    $('#loader').hide();
    $('#blink').hide();

    explore.firstAction = false;

  }

  // store URL-query title for future uses
  explore.q_prev = explore.q;
  explore.type_prev = explore.type;
  explore.language_prev = explore.language;

  if ( explore.type === 'wikipedia-qid' ){
    // keep the explore.qid in the URL
  }
  else { // else remove the explore.qid from the URL

    explore.qid = '';
  }

  explore.uri     = '';
  explore.direct  = false;

  /*

  ALWAYS RESET:
    explore.qid (unless wikipedia-qid type)
    explore.uri
    explore.custom
    explore.direct
    explore.marks

   PERSIST UNTILL CHANGED REQUESTED:
    explore.language
    explore.type
    explore.viewMode

  */

  let q = window.location.pathname.replace(/\/explore\//g, ' ') || ''; 
  q = q.trim().replace(/_/g, ' ').replace(/%25/g, '%').replace(/%20/g, ' ');
  explore.q = decodeURIComponent( q ).replace(/<\/?("[^"]*"|'[^']*'|[^>])*(>|$)/g, "").trim();

  // TODO: handle automatic mobile-page-swipe better
  if ( explore.isMobile ){

    if ( explore.swiper.activeIndex === 0 ){

      const no_sliding_types = [ 'no_slide', 'url', 'dates', 'places', 'nearby', 'random', 'explore', 'bookmark' ];

      if ( custom === 'explore' ){ // hack to prevent panel-sliding on mobile during "explore -> wikipedia"
        type = 'no_slide';
      }

      if ( no_sliding_types.includes( type ) ){
        // do nothing
      }
      else {

        //console.log('slide active index: ', explore.preventSliding, explore.swiper.activeIndex );

        if ( !explore.preventSliding ){

          explore.swiper.slideTo( 1 );

        }

      }

    }

    // always reset this value
    explore.preventSliding = false;

  }

}

async function handleClick ( args ) {

  //console.log( 'explore.keyboard_ctrl_pressed: ', explore.keyboard_ctrl_pressed );
  //console.log( 'event.ctrlKey: ', event.ctrlKey );

  // check for CTRL-key, to open link in new tab
  if ( valid( [ explore.keyboard_ctrl_pressed, event ] ) ){

    event.preventDefault();

    explore.keyboard_ctrl_pressed = false;

    if ( valid( event.target.Window ) ){ // embedded app call

      //console.log('handle embedded-app CTRL-click' );

    }
    else { // main app call

      //console.log('main app CTRL-click: open in new window');
      //console.log( event.target.hasAttribute("onauxclick") );

      const open_in_new_tab_code = event.target.getAttribute('onauxclick');

      if ( valid( open_in_new_tab_code ) ){

        eval( open_in_new_tab_code );

      }

    }

    return 0;

  }

  $('#blink').show();

  if ( typeof args === 'string' ){ // args is a string

    if ( args.startsWith('%7B%') ){ // args is an encoded string

      args = JSON.parse( decodeURIComponent( args ) ); // decode the args-string

    }

  }

  //console.log( 'handleClick() args: ', args );

  // TODO make all args optional, so the caller does not need to use each field
  let id            = args.id;
  let type          = args.type;
  let title         = args.title;
  let lang          = args.language;
  let qid           = args.qid;
  let url           = args.url;
  let tag           = args.tag;
  let languages     = args.languages;

  let current_pane  = '';
  let target_pane   = '';

  let ids           = '';             // any other needed type-specific identifiers
  let custom        = args.custom;    // any other data needed (eg. iso2-country-code, ...)
  let gbif_id       = '';             // used for rendering the GBIF occurence map
  let panelwidth    = args.panelwidth // used for setting the left link-split panel width

  // get current topic ID, to set the topic-cursor
  if ( valid( id ) ){

    if ( id.startsWith('n') ){

      explore.topic_cursor = id;

    }
    else if ( id.startsWith('mv-') ){

      explore.topic_cursor = id.replace( 'mv-', '' );

    }

  }

  if ( typeof args.thumbnail === undefined ){
    // do nothing
  }
  else {

    explore.wallpaper = $( args.thumbnail ).find('img').attr('src') || '';
    const image_size = ( explore.isMobile ) ? '200' : '400';
    explore.wallpaper = explore.wallpaper.replace(/width=.*$/, 'width=' + image_size );
    //console.log( explore.wallpaper );

  }

  if ( typeof args.current_pane === undefined || typeof args.current_pane === 'undefined'){
    // do nothing
  }
  else {
    current_pane = args.current_pane;
  }

  if ( typeof args.target_pane === undefined || typeof args.target_pane === 'undefined'){
    // do nothing
  }
  else {
    target_pane = args.target_pane;
  }

  if ( typeof args.ids === undefined || typeof args.ids === 'undefined'){
    // do nothing
  }
  else {
    ids = args.ids;
  }

  if ( typeof args.gbif_id === undefined || typeof args.gbif_id === 'undefined'){
    // do nothing
  }
  else {
    gbif_id = args.gbif_id;
  }

  if ( lang == '' || lang == undefined ){
    setLanguage ( 'en' ); // FIXME: find out where language was not being set, then fix it.
  }
  else {
    setLanguage ( lang.trim() );
  }

	title = title.replace(/%3A/, ':'); // FIXME why is this needed? any other problematic character encodings?

	// cleanup "namespaces" in title (as this is better for some search-services)
  const title_        = minimizeTitle( title );
  const title_quoted  = quoteTitle( title );

  if ( type !== 'map'){
    markArticle(id, type);
  }

	explore.type  = type; // user clicked for a new type, so store that

  if ( valid( qid ) ){ // a valid "qid" was passed (note: passing a qid is optional!)

	  explore.qid   = qid;

    if ( !explore.qid.startsWith('Q') ){

      explore.qid = 'Q' + explore.qid; // add 'Q' to qid string

    }

  }

	explore.uri     = url;
	explore.custom  = custom;

  //console.log('JSON LD: ', args );

  // set some linked-data fields
  explore.ld = {

    tag           : valid( args.tag ) ? args.tag.replace('-', ' ') : '',
    summary       : valid( args.snippet ) ? args.snippet.replace(/<[^>]+>/g, '') : '',
    imageUrl      : valid( args.thumbnail ) ? 'http' + args.thumbnail.split('http')[1].split('?width')[0] : '',
    thumbnailUrl  : valid( args.thumbnail ) ? 'http' + args.thumbnail.split('http')[1].split('?width')[0] + '?width=150' : '',

  }

  //console.log( explore.ld );

  updatePushState( title, 'add' );

	explore.curr_title = decodeURIComponent( title );

  const renderType_args = {
    type          : explore.type,
    title         : explore.curr_title,
    title_        : title_,
    title_quoted  : title_quoted,
    url           : url,
    qid           : explore.qid,
    current_pane  : current_pane,
    target_pane   : target_pane,
    id            : id,
    tag           : tag,
    languages     : languages,
    ids           : ids,
    custom        : custom,
    gbif_id       : gbif_id,
    panelwidth    : panelwidth,
  };

  renderType( renderType_args );

  //explore.hash = ''; // TODO: redesign hash handling

};

function updatePushState( title, mode ){

  title = title.replace( /\?/g, '%3F'); // need to escape "?" for structured form-query URLs

  if ( ! valid( explore.hash ) ){

    explore.hash = '';

  }

  const no_update_types = [ 'bookmark' ];

  // some type-actions should not update the URL
  if ( no_update_types.includes( explore.type ) ){ // no URL update needed

    return 0;

  }

  let title_i = '';

  if ( explore.replaceState ){ // this allows "action-triggering code parts" to prevent updating the URL (needed to not mess with the users firstAction query)

    if ( typeof mode === undefined || typeof mode === 'undefined' ){
      mode = 'add'; // default mode is to add new URLs to the history object
    }

    const p = buildURLParameters();

    //console.log( p );

    if ( title === '' ){

      // TODO: allow for some alternative URL title to be passed when there is no title available (eg. with wdq-queries)?
      document.title = decodeURIComponent( explore.type + ' - conzept');

    }
    else {

      const title_    = decodeURIComponent( title ) + ' - Conzept encyclopedia';

      // title
      document.title  = title_;
      $('title').text( title_ );
      $('meta[property="og:title"]').attr('content', title_ );
      $('meta[property="twitter:title"]').attr('content', title_ );

      // description
      $('meta[name=description]').attr('content', title_ );
      $('meta[property="og:description"]').attr('content', title_ );
      $('meta[property="twitter:description"]').attr('content', title_ );

    }

    // encode any path-influencing (URL-reloading relevant) properties correcly first:
    const t = title.replace('/', '%252F').replace('?', '%253F'); //.replace(' ', '%20');;

    const url = 'https://' + explore.host + explore.base + '/explore/' + t + '?l=' + explore.language + '&t=' + explore.type + p.i + p.u + p.c + p.t2 + p.i2 + p.u2 + p.c2 + p.m + p.v + p.d + p.f + '&s=' + explore.show_sidebar + p.query + p.commands + '#' + explore.hash.replace(/#/g, '');

    const linked_url = 'https://' + explore.host + explore.base + '/explore/' + t + '?l=' + explore.language + p.i + '&t=' + explore.type + p.u + p.query;

    $('link[rel=canonical]').attr('href', linked_url );
    $('meta[property="og:url"]').attr('content', linked_url );
    $('meta[name="twitter:url"]').attr('content', linked_url );

    explore.ld.title          = t;
    explore.ld.inLanguage     = explore.voice_code ? explore.voice_code : explore.language || 'en';
    explore.ld.identifier     = explore.qid ? 'http://www.wikidata.org/entity/' + explore.qid : '';
    explore.ld.main_entity    = explore.qid ? 'http://www.wikidata.org/entity/' + explore.qid : '';
    explore.ld.wikidata_link  = explore.qid ? 'http://www.wikidata.org/wiki/' + explore.qid : '';
    explore.ld.wikipedia_link = explore.qid ? 'http://' + explore.language + '.wikipedia.org/wiki/' + t : '';
    explore.ld.dbpedia_link   = explore.language === 'en' ? 'http://dbpedia.org/page/' + t : '';

    explore.ld.url = valid( explore.uri )? linked_url : '';

    // FIXME: can we set these images from an initial-visit and a click on the sidebar?
    //if ( !valid( explore.ld.image ) ){
    //  explore.ld.imageUrl       = '';
    //  explore.ld.thumbnailUrl   = '';
    //}

    //console.log( explore.ld );

    setJSONLD( explore.ld );

    if ( explore.type === 'random' ){

      return 0; // no need to store the URL yet, do this later when the title is set

    }

    if ( mode === 'add' ){

      //console.log( 'add to history: ', document.title, url, title );
      history.pushState({ id: 'home' }, 'conzept explore', url );

    }

  }
  
}

function setJSONLD( ld ){

  //console.log( 'set ld: ', ld );

  // get current "ld-info" DOM ref
  const ld_current = document.querySelector('script#ld-info');

  // create JSON-LD element
  let el  = document.createElement('script');
  el.type = 'application/ld+json';
  el.setAttribute("id", "ld-info");

  //console.log( 'set mainEntity: ', ld.main_entity );

  let obj = {
    "@context": "http://schema.org",      // https://schema.org
    "@type": "WebPage",                   // https://schema.org/WebPage
    "inLanguage": ld.inLanguage,  // https://schema.org/Language
    "name": ld.title,
    "description": ld.summary,
    "teaches" : ld.tag,
    //"speciality" : ld.tag,
    //"thumbnailUrl" : ld.thumbnailUrl,
    //"image": ld.imageUrl,
    "url": ld.url,
    "mainEntityOfPage": ld.main_entity,
    //"identifier": ld.identifier,
    "sameAs": [
      ld.wikipedia_link,
      ld.wikidata_link, 
      ld.dbpedia_link, 
    ].filter(Boolean),
    "author": { "@type": "Organization", "name": "Conzept encyclopedia" },
    "publisher": { "@type": "Organization", "name": "Conzept encyclopedia",
      "logo": {
        "@type": "ImageObject",
        "url": `https://${explore.host}/assets/icons/logo.svg`
      }
    },
    //"datePublished": new Date().toISOString(),
    //"dateModified": new Date().toISOString(),
    "license" : 'https://creativecommons.org/licenses/by-sa/4.0/',
    "copyrightNotice" : 'The Wikipedia text is available under the CC BY-SA 4.0 license; additional terms may apply. Images, videos and audio are available under their respective licenses.',
    "copyrightHolder" : 'The Wikipedia article contributors',

  };

  if ( valid( ld.image ) ){ obj.image = ld.imageUrl; } 
  if ( valid( ld.thumbnailUrl ) ){ obj.thumbnailUrl = ld.thumbnailUrl; } 

  el.text = JSON.stringify( obj );

  // replace previous JSON-LD element
  ld_current.parentNode.replaceChild(el, ld_current);

}

function updateJSONLD( ld ){

  // get current "ld-info" DOM ref
  const el = document.querySelector('script#ld-info');

  let jsonld = JSON.parse( el.innerText );

  //console.log( 'update ld: ', jsonld );
  //console.log( 'update mainEntity: ', ld.qid );

  //jsonld.identifier       = ld.qid ? 'http://www.wikidata.org/entity/' + ld.qid : '';
  jsonld.mainEntityOfPage = ld.qid ? 'http://www.wikidata.org/entity/' + ld.qid : '';

  jsonld.sameAs             = [
    ld.title ? 'http://' + explore.language + '.wikipedia.org/wiki/' + ld.title : '',
    ld.qid ? 'http://www.wikidata.org/wiki/' + ld.qid : '',
    ld.title && explore.language === 'en' ? 'http://dbpedia.org/page/' + ld.title : '',
    ld.google_kg ? 'https://g.co/kg' + ld.google_kg : '',
  ].filter(Boolean),

  jsonld.teaches        = valid( ld.tags )? ld.tags.map(n => n.replace('-', ' ') ) : [];
  jsonld.description    = ld.description;
  jsonld.text           = valid( ld.text )? ld.text : '';

  if ( valid( ld.image ) ){ jsonld.image = ld.image; } 
  if ( valid( ld.thumbnailUrl ) ){ jsonld.thumbnailUrl = ld.thumbnailUrl; } 

  let newJson = JSON.stringify( jsonld );

  el.innerHTML = newJson;

  document.getElementById('ld-info').textContent = el.innerText;

}

function buildURLParameters(){ // builds a URL state object from the current state

  //console.log( 'explore.show_sidebar: ', explore.show_sidebar );
  //console.log( 'explore.embedded: ', explore.embedded );

  // QUERY-DATA PARAMETERS
  let p = {};

  p.t2 = '';

  if ( explore.type2 === '' ) { explore.t2 = '' } else {
    p.t2 = '&t2=' + explore.type2;
  }

  // ID (qid or something else)
  p.i = '';

  if ( explore.qid === '' || explore.qid === 'undefined' || explore.qid === undefined ){ explore.qid = ''; } else {
    p.i = '&i=' + explore.qid;
  }

  p.i2 = '';

  if ( explore.qid2 === '' || explore.qid2 === 'undefined' || explore.qid2 === undefined ){ explore.qid2 = ''; } else {
    p.i2 = '&i2=' + explore.qid2;
  }

  // URL
  p.u = '';

  if ( explore.uri === '' || explore.uri === undefined ){ explore.uri = ''; } else {

    if ( explore.uri.startsWith('%25') || explore.uri.startsWith('%22') ){ // is an encoded string

      p.u = '&u=' + explore.uri.replace(/^%22/, '').replace(/%22$/, '');

    }
    else {

      //p.u = '&u=' + encodeURIComponent( JSON.stringify( explore.uri ) ).replace(/^%22/, '').replace(/%22$/, '' );

      p.u = '&u=' + encodeURIComponent( explore.uri );

    }

  }

  // url2 parameter
  p.u2 = '';

  if ( explore.uri2 === '' || explore.uri2 === undefined ){ explore.uri2 = ''; } else {

    if ( explore.uri2.startsWith('%25') || explore.uri2.startsWith('%22') ){ // is an encoded string

      p.u2 = '&u=' + explore.uri2;

    }
    else {

      p.u2 = '&u2=' + encodeURIComponent( explore.uri2 ).replace(/"/g, '');

    }

  }


  // CUSTOM DATA (needed for some types)
  p.c = '';

  if ( explore.custom === '' || explore.custom === undefined || explore.custom === 'undefined' || explore.custom === null ){ explore.custom = ''; } else {

    if ( typeof explore.custom === 'object' ){ // found object "lat,lon,dist,radius,limit"

      explore.custom = explore.custom.lat + ',' + explore.custom.lon ; // convert to a string

    }

    p.c = '&c=' + explore.custom;
  }

  p.c2 = '';

  if ( explore.custom2 === '' || explore.custom2 === undefined || explore.custom2 === 'undefined' || explore.custom2 === null ){ explore.custom2 = ''; } else {

    if ( typeof explore.custom2 === 'object' ){ // found object "lat,lon,dist,radius,limit"

      explore.custom2 = explore.custom2.lat + ',' + explore.custom2.lon ; // convert to a string

    }

    p.c2 = '&c2=' + explore.custom2;

  }

  // QUERY-BUILDER DATA (needed for re-using the query-builder state)
  p.query = '';

  if ( explore.query === '' || explore.query === undefined || explore.query === 'undefined' || explore.query === null ){ explore.query = ''; } else {

    p.query = '&query=' + encodeURIComponent( explore.query );

  }

  // EDITOR-COMMAND DATA
  p.commands = '';

  if ( explore.commands === '' || explore.commands === undefined || explore.commands === 'undefined' || explore.commands === null ){ explore.commands = ''; } else {

    //console.log( 'before: ', p.commands );
    p.commands = '&commands=' + encodeURIComponent( explore.commands.replace(/</g, '%3C').replace(/>/g, '%3E') ).replace(/#/g, '%23');
    //console.log( 'after:  ', p.commands );

  }

  // OTHER URL parameters

    p.f = '';

    if ( explore.fragment === '' || explore.fragment === undefined ){ explore.fragment = ''; } else {
      p.f = '&f=' + explore.fragment;
    }

    // direct title parameter
    p.d = '';

    if ( explore.direct === true ){ p.d = '&d=' + explore.direct; } else {
      explore.direct = false;
    }

    // line marks parameter
    p.m = '';

    if ( explore.marks === '' || explore.marks === undefined ){ explore.marks = ''; } else {
      p.m = '&m=' + explore.marks;
    }

    // viewMode paramater
    p.v = '';

    if ( explore.viewMode === '' || explore.viewMode === undefined ){ explore.viewMode = ''; } else {
      p.v = '&v=' + explore.viewMode;
    }

  return p;

}

function tryFallbackToQid(){

  if ( explore.type === 'wikipedia-qid' ){

    if ( explore.qid.startsWith('Q') ){
      explore.qid = explore.qid.substring(1); // always remove 'Q' from string
    }

    if ( document.getElementById('infoframeSplit2') === null ){ // single-content-frame

      $( explore.baseframe ).attr({"src": explore.base + '/app/wikidata/?q=Q' + explore.qid + '&lang=' + explore.language });

    }
    else { // dual-content-frame

      $( '#infoframeSplit2' ).attr({"src": explore.base + '/app/wikidata/?q=Q' + explore.qid + '&lang=' + explore.language });

    }

  }

}

function resizeFont() {

  const fontsizable_types = [ 'wikipedia', 'explore', 'map', 'elements', ];

  if ( fontsizable_types.includes( explore.type ) ){

    $( explore.baseframe ).contents().find('body').css('font-size', explore.fontsize + 'px', 'important');

    $('#infoframeSplit1').contents().find( explore.baseframe ).contents().find('#layout-topdown').click();

		//explore.editor.setFontSize( parseFloat( explore.fontsize ) );

  }

}

function postIframeLoad() {

  setLanguageDirection();
  renderLanguageDirection();

  // hide loaders
  $('#loader').hide();
  $('#blink').hide();

  setBold();
  setUnderline();
  setBgmode();
  setDarkmode();
  setColorFilter();
  setTopicCover();
  setMulticolumn();
  setLinkPreview();
  updateLocale( explore.locale );
  updateLocaleNative();

  $( explore.baseframe ).contents().find('body').css('fontSize', explore.fontsize + 'px' );
  $( explore.baseframe ).contents().find('a.link').css( 'color', explore.linkcolor , 'important');
  $( explore.baseframe ).contents().find('a.link').css( 'background', explore.linkbgcolor , 'important');

  // close inactive details 
  $('details.auto').click(function (event) {
    $('details.auto').not(this).removeAttr("open");  
  });

  resizeFont();

  const iframeEl = document.getElementById( explore.baseframe ); // FIXME for split-iframes

  if ( iframeEl === null ){
    //console.log( 'warning: postIframeLoaded but iframe is null');
    // do nothing
  }
  else {

    // send language child iframe
    iframeEl.contentWindow.postMessage( explore.language , '*');

    // scroll to hash (if needed)
    if ( explore.hash !== '' ){

      const hash_ = explore.hash.replace(/[ %{}|^~\[\]()"'+<>%'&\.\/?:@;=,]/g, '_').toLowerCase(); // NOTE: sync this replace-line with wikipedia-iframe.js
 
      iframeEl.contentWindow.location.hash = hash_;

      //explore.hash = ''; // reset hash
    }


  }

	if ( explore.type === 'dates' ){

    renderTypeDates( '', explore.type );

  }

}

function togglePanel2( ){

	if ( explore.embedded_splitter.position() === 0 ){ // panel 2 is maximized

		explore.show_sidebar = true;

		refreshSplitter( explore.splitterWidth );
		$('div.sticky').css({ 'width' : explore.splitter.position() });
    resizeEmbeddedSplitter();

		explore.embedded_splitter.position( explore.embedded_splitter_left_width + '%');
		explore.panel2_minimized = true;

	}
	else { // panel 2 is minimized

		// minimize sidebar
		explore.show_sidebar = false;
		explore.splitterWidth = 100 * ( explore.splitter.position() / $(window).width() ) ;
		refreshSplitter(0);
		updatePushState( explore.q, 'add' ); 
		resizeEmbeddedSplitter();

		// toggle full width for pane 2
		explore.embedded_splitter.position( '0%');

		explore.panel2_minimized = false;

	}

}

function minimizeLeftPanesToggle( pane_number ){

  if ( pane_number === 1 ){ // 1st content pane

    toggleSidebar();

  }
  else if ( pane_number === 2 ){ // 2nd content pane

		window.parent.postMessage({ event_id: 'toggle-panel2', data: { } }, '*' );

  }

}

function fixSafari(){

  // workaround for Safari bug: sticky-header positioned too high (and out of sight).
  $('swiper-paginaton').css({ 'margin-bottom' : '110px' }); // NOTE: remember to sync this pixel value in "css/main.css"

}

function resetIframe( mode, leftWidth, rightWidth ){

  // make sure to show the hover-menu (which could have been hidden due to a secondary iframe earlier)
  $('.fixed-action-btn.direction-left').show();

  if ( explore.isMobile ){ // mobile

    if ( window.frameElement === null ){
      //console.log( 'inside main window ');
    }
    else {

      return 0;
    }

    if ( mode === 'split' ){ // reset both content frames

      $('#doc').empty();

      $('#doc').append( '<div id="frameWrap">' + '<iframe id="infoframeSplit1" onload="postIframeLoad()" name="infoframeSplit1" title="content pane 1" role="application" width="100%" height="100%" frameBorder="0" src="" allowvr="yes" allow="autoplay; fullscreen" allowfullscreen allow-downloads allow-scripts allow-same-origin allow-forms allow-popups allow-pointer-loc></iframe>' + '</div>');

      $('#doc2').empty();

      $('#doc2').append( '<div id="frameWrap">' + '<iframe id="infoframeSplit2" onload="postIframeLoad()" name="infoframeSplit2" title="content pane 2" role="application" width="100%" height="100%" frameBorder="0" src="" allowvr="yes" allow="autoplay; fullscreen" allowfullscreen allow-downloads allow-scripts allow-same-origin allow-forms allow-popups allow-pointer-loc></iframe>' + '</div>');

    }
    else { // only reset primary content frame

      $('#doc').empty();

      $('#doc').append( '<div id="frameWrap">' + '<iframe id="infoframeSplit1" onload="postIframeLoad()" name="infoframeSplit1" title="content pane" width="100%" role="application" height="100%" frameBorder="0" src="" allowvr="yes" allow="autoplay; fullscreen" allowfullscreen allow-downloads allow-scripts allow-same-origin allow-forms allow-popups allow-pointer-loc></iframe>' + '</div>');

      // TODO: hide "#doc2" on mobile

    }

  }
  else { // desktop

    $('#doc').empty();

    if ( mode === 'split' ){

      if ( typeof leftWidth === undefined || typeof leftWidth === 'undefined' || leftWidth === '' ){
        leftWidth = 50;
      }

      if ( typeof rightWidth === undefined || typeof rightWidth === 'undefined' || rightWidth === '' ){
        rightWidth = 50;
      }

      explore.embedded_splitter_left_width = leftWidth;

      $('#doc').append(

        '<script  src="' + explore.base + '/app/explore2/libs/splitter.js"></script>' +

        '<div id="frameWrap">' +

          '<img id="loader" alt="loading" width="36" height="36" src="' + explore.base + '/app/explore2/assets/images/loading.gif"/>' +

          '<div id="embedded-splitter">' + 
            '<div id="infoframeSplit1-split"><iframe id="infoframeSplit1" onload="postIframeLoad()" name="infoframeSplit1" title="content pane 1" role="application" width="100%" height="100%" frameBorder="0" src="" allowvr="yes" allow="autoplay; fullscreen" allowfullscreen allow-downloads allow-scripts allow-same-origin allow-forms allow-popups allow-pointer-loc></iframe></div>' +

            '<div id="infoframeSplit2-split"><iframe id="infoframeSplit2" onload="postIframeLoad()" name="infoframeSplit2" title="content pane 2" role="application" width="100%" height="100%" frameBorder="0" src="" allowvr="yes" allow="autoplay; fullscreen" allowfullscreen allow-downloads allow-scripts allow-same-origin allow-forms allow-popups allow-pointer-lock></iframe></div>' +

        '</div>');

      // init splitter
      const w = window.parent.$('#frameWrap').width();
      const h = window.innerHeight;

      // see: https://github.com/jcubic/jquery.splitter
      explore.embedded_splitter = $('#embedded-splitter').width( w ).height( h ).split({

        orientation: 'vertical',
        position: leftWidth + '%',
        limit: 0,

        //onDrag: function(event) {
        //  console.log( 'embedded-splitter drag');
        //}

      });

      // TODO handle screen-resizing for the embedded iframe.
      // ...

    }
    else {

      $('#doc').append('<div id="frameWrap"><img id="loader" alt="loading" width="36" height="36" src="' + explore.base + '/app/explore2/assets/images/loading.gif"/><iframe id="infoframe" onload="postIframeLoad()" name="infoframe" title="content pane" role="application" width="100%" height="100%" frameBorder="0" src="" allowvr="yes" allow="autoplay; fullscreen" allowfullscreen allow-downloads allow-scripts allow-same-origin allow-forms allow-popups allow-pointer-lock></iframe></div>');

    }

  }

  if ( explore.isMobile && explore.isSafari ){ fixSafari(); }

  if ( ! explore.isMobile ){

    let pane_number         = $('#doc').hasClass('right_panel') ? 1 : 2;
    let iframe_is_external  = false;

   // add minimize-left-panes-toggle
    if ( iframe_is_external ){ // external iframe in pane2

      if ( $('#infoframeSplit2').prev().attr('id') !== 'minimizeLeftPanesToggle' ){

        $('#infoframeSplit2').before('<span id="minimizeLeftPanesToggle" onclick="minimizeLeftPanesToggle( 2 )" title="toggle left panes"><i class="fa-solid fa-angle-left"></i></span>');

      } 

    }
    else { // local iframe in pane1 or pane2

      $('#doc').prepend('<span id="minimizeLeftPanesToggle" onclick="minimizeLeftPanesToggle( ' + pane_number + ' )" title="toggle left panes"><i class="fa-solid fa-angle-left"></i></span>');

    }

  }

  // show loading indicator
  $('#loader').show();
  $('#blink').show();

  // timeout for showing loading indicator
  setTimeout(removeLoader, 20000);

}

function removeLoader() { // remove loading indicator after timeout

  $('#loader').hide();
  $('#blink').hide();

}

function receiveMessage(event){

  //console.log( 'received postMessage() data: ', event.data.event_id, event.data.data );

  if ( event.data.event_id === 'handleClick' ){

		//console.log( 'received iframe data: ', event.data.data.type, event.data.data.title, event.data.data.language );

		explore.hash  = event.data.data.hash;

		let current_pane  = '';
		let target_pane   = '';

		let tag           = '';
		let ids           = '';
		let languages     = '';
		let panelwidth    = '';

    if ( event.data.data.current_pane !== '' ){  current_pane = event.data.data.current_pane }

    if ( event.data.data.target_pane !== '' ){  target_pane = event.data.data.target_pane }

    if ( event.data.data.language !== '' ){ setLanguage( event.data.data.language ); }

    if ( event.data.data.qid !== '' ){ explore.qid = event.data.data.qid; }

    if ( event.data.data.url !== '' ){ explore.uri = event.data.data.url; }

    if ( event.data.data.tag !== '' ){ tag = event.data.data.tag; }

    if ( event.data.data.panelwidth !== '' ){ panelwidth = event.data.data.panelwidth; }

    if ( event.data.data.ids !== '' ){ ids = event.data.data.ids; } // used by link-graph app (to go to the line of the first link ID)

    if ( event.data.data.languages !== '' ){ languages = event.data.data.languages; }

    if ( event.data.data.type === 'explore' && explore.windowName === 'infoframeSplit2' ){ // request from secondary content iframe

      window.parent.postMessage({ event_id: 'handleClick', data: { type: 'explore', title: event.data.data.title, hash: explore.hash, language: explore.language  } }, '*' );

    }
    else { // normal flow

      if ( explore.isMobile ){

        if ( event.data.data.type === 'explore' ){

          explore.preventSliding = true;
          explore.swiper.slideTo( 0 ); // go back to sidebar on mobile when 'exploring'

        }    

      }

      if ( event.data.data.hash !== '' ){
        explore.hash = event.data.data.hash;
      }

      // language may have changed also: update voice menu
      reloadVoices(); // TODO: research if we could only do this upon a language-change

      handleClick({
        id            : 'n1-1',
        type          : event.data.data.type,
        title         : event.data.data.title,
        language      : explore.language,
        qid           : explore.qid,
        url           : event.data.data.url,
        tag           : tag,
        languages     : encodeURIComponent( JSON.stringify( languages ) ),
        ids           : ids,
        panelwidth    : panelwidth,
        custom        : '',
        current_pane  : current_pane,
        target_pane   : target_pane,
      });

    }

  }
  else if ( event.data.event_id === 'goto' ){

    let iframeEl = document.getElementById( 'infoframe' );

    console.log( 'passing data: ', event.data.data.value, event.data.data.value );

    if ( valid( iframeEl ) ){

      // use only for self-hosted apps (which have a receivedMessage()-listener containing a "goto"-handler).
      if ( iframeEl.src.startsWith( `https://${CONZEPT_HOSTNAME}` ) ){

        console.log( 'passing data 2: ', event.data.data.value );

        iframeEl.contentWindow.postMessage( { event_id: 'goto', data: [ event.data.data.value ] }, '*' );

      }

    }

  }
  else if ( event.data.event_id === 'run-slide-commands' ){

    //$('#presentation').contents().find('div.reveal').focus();

    stopSpeaking(); // stop global window speaking
    $('#tts-article').remove(); // stop iframe-article speaking

    //console.log('run-slide-commands for slide: ', event.data.data.slide );
    //console.log( 'run slide commands: ', event.data.data.slide, explore.presentation_commands[ event.data.data.slide ] );

		$.each( explore.presentation_commands[ event.data.data.slide ] , function ( index, c ) {

			//console.log( c );

			const command = c[0];
			const view		= c[1];
			const data		= c[2];
			const first		= valid( c[3] )? c[3] : '';

      //console.log( command, view, data, first );

			if ( command === 'sparqlQueryCommand' ){
      
				//explore.presentation_commands[ explore.presentation_building_slide ].push( [ 'sparqlQueryCommand', view, list, args ] );

        sparqlQueryCommand( first, view, data ); // FIXME: first should be named "args" here

        if ( view === 'sidebar' ){ // Wikidata-results in the sidebar

          explore.tabsInstance.select('tab-topics');

        }

      }
			else if ( command === 'show' ){

				if ( command === 'set' && view === 'language' ){

          setLanguage( data );

        }
        else if ( view === 'audio' || view === 'video' ){

          // do nothing (revealjs takes care of this)
          return 0;

        }
        else if ( view === 'audio-waveform' ){

          handleClick({ 
            id        : 'n1-0',
            type      : 'link',
            title     : explore.q,
            qid       : '',
            language  : explore.language,
            url       : first,
            tag       : '',
            languages : '',
            custom    : '',
            target_pane : 'p1',
          });

        }
        else if ( view === 'youtube' ){

          handleClick({ 
            id        : 'n1-0',
            type      : 'link',
            title     : explore.q,
            qid       : '',
            language  : explore.language,
            url       : first,
            tag       : '',
            languages : '',
            custom    : '',
            target_pane : 'p1',
          });

        }
				else if ( view === 'chemical' ){

          handleClick({ 
            id        : 'n1-0',
            type      : 'link',
            title     : explore.q,
            language  : explore.language,
            qid       : '',
            url       : `${explore.base}/app/molview/?cid=${ first.toString() }`,
            tag       : '',
            languages : '',
            custom    : '',
            target_pane : 'p1',
          });

        }
				else if ( view === 'topic' ){

          let l = explore.language;

          // check the optional provided language
          if ( valid( first ) ){

            l = first.toString();

            if ( explore.wp_languages.hasOwnProperty( l ) ){ // valid language-code

              setLanguage ( l );

            }

          }

					handleClick({ 
						id        : 'n1-0',
						type      : 'wikipedia-qid',
						title     : explore.q,
						qid       : data.toString(),
						language  : l,
						tag       : '',
						languages : '',
						custom    : '',
						target_pane : 'p1',
					});

				}
				else if ( view === 'link' || view === 'link-split' ){

					handleClick({ 
						id        : 'n1-0',
						type      : view,
						title     : explore.q,
						qid       : '',
						language  : explore.language,
						url       : data[0],
						tag       : '',
						languages : '',
						custom    : '',
						target_pane : 'p1',
					});

				}
				else if ( view === 'url' ){

          console.log('open the external URL: ', view, data );

          openInNewTab( decodeURI( data[0] ) );

				}
				else if ( view === 'pdf' ){

					handleClick({ 
						id        : 'n1-0',
						type      : 'link',
            title     : explore.q,
						qid       : '',
						language  : explore.language,
					  url       : `${explore.base}/app/pdf/?file=https://${ explore.host }/app/cors/raw/?url=${ data[0]  }#page=0&zoom=page-width&phrase=true&pagemode=thumbs`,
						tag       : '',
						languages : '',
						custom    : '',
						target_pane : 'p1',
					});

				}
				else if ( view === 'iiif' ){

					handleClick({ 
						id        : 'n1-0',
						type      : 'link',
            title     : explore.q,
						language  : explore.language,
					  url       : `${explore.base}/app/iiif/#?cv=&c=&m=&s=&manifest=${ encodeURIComponent( data[0] ) }`,
						tag       : '',
						languages : '',
						custom    : '',
						target_pane : 'p1',
					});

				}
				else if ( view === 'map3d' ){

          //console.log('map3d view');

          handleClick({ 
            id        : 'n1-0',
            type      : 'link',
            title     : explore.q,
            language  : explore.language,
            qid       : '',
            url       : `${explore.base}/app/map/?l=${explore.language}&qid=${data}`,
            tag       : '',
            languages : '',
            custom    : '',
            target_pane : 'p1',
          });

          $( '#infoframeSplit2' ).attr({"src": explore.base + '/app/wikipedia/?t=&l=' + explore.language + '&voice=' + explore.voice_code + '&qid=' + first.toString() + '&dir=' + explore.language_direction + '&embedded=' + explore.embedded + '#' + explore.hash });

        }
				else if ( view === 'linkgraph' ){

          handleClick({ 
            id        : 'n1-0',
            type      : 'link-split',
            title     : explore.q,
            language  : explore.language,
            qid       : '',
            url       : `${explore.base}/app/links/?l=${explore.language}&t=&q=${data}`,
            tag       : '',
            languages : '',
            custom    : '',
            target_pane : 'p1',
          });

          $( '#infoframeSplit2' ).attr({"src": explore.base + '/app/wikipedia/?t=&l=' + explore.language + '&voice=' + explore.voice_code + '&qid=' + first.toString() + '&dir=' + explore.language_direction + '&embedded=' + explore.embedded + '#' + explore.hash });

        }
				else if ( view === 'ontology' ){

            handleClick({ 
              id        : 'n1-0',
              type      : 'link-split',
              title     : explore.q,
              language  : explore.language,
              qid       : '',
              url       : `${explore.base}/app/ontology/?lang=${explore.language}&q=${list[0].toString()}&rp=P279`,
              tag       : '',
              languages : '',
              custom    : '',
              target_pane : 'p1',
            });

            $( '#infoframeSplit2' ).attr({"src": explore.base + '/app/wikipedia/?t=&l=' + explore.language + '&voice=' + explore.voice_code + '&qid=' + first.toString() + '&dir=' + explore.language_direction + '&embedded=' + explore.embedded + '#' + explore.hash });

        }
				else if ( view === 'chemistry' ){

          handleClick({ 
            id        : 'n1-0',
            type      : 'link',
            title     : explore.q,
            language  : explore.language,
            qid       : '',
            url       : `${explore.base}/app/molview/?cid=${first.toString()}`,
            tag       : '',
            languages : '',
            custom    : '',
            target_pane : 'p1',
          });

        }
				else if ( view === 'compare' ){

          showCompare();

        }
				else if ( view === 'map3d-instance-of' ){

          showMapCompare();

        }
        else {

          handleClick({ 
            id        : 'n1-0',
            type      : 'link-split',
            title     : explore.q,
            language  : explore.language,
            qid       : '',
            url       : `${explore.base}/app/query/embed.html#SELECT%20%3Fitem%20%3FitemLabel%20%3Fdied%20%3Fborn%20%3Finception%20%3Fstart%20%3Fend%20%20%3Fimg%20%3Fcoordinate%20%3Fgeoshape%20WHERE%20%7B%0A%20%20VALUES%20%3Fitem%20%7B%20${ data }%20%7D%0A%20%20%3Fitem%20wdt%3AP31%20%3Fclass.%0A%20%20OPTIONAL%20%7B%20%3Fitem%20wdt%3AP18%20%3Fimg.%20%7D%0A%20%20OPTIONAL%20%7B%20%3Fitem%20wdt%3AP625%20%3Fcoordinate.%20%7D%0A%20%20OPTIONAL%20%7B%20%3Fitem%20wdt%3AP3896%20%3Fgeoshape.%20%7D%0A%20%20OPTIONAL%20%7B%20%3Fitem%20wdt%3AP571%20%3Finception.%20%7D%0A%20%20OPTIONAL%20%7B%20%3Fitem%20wdt%3AP569%20%3Fborn.%20%7D%0A%20%20OPTIONAL%20%7B%20%3Fitem%20wdt%3AP570%20%3Fdied.%20%7D%20%20%0A%20%20OPTIONAL%20%7B%20%3Fitem%20wdt%3AP580%20%3Fstart.%20%7D%0A%20%20OPTIONAL%20%7B%20%3Fitem%20wdt%3AP581%20%3Fend.%20%7D%0A%20%20SERVICE%20wikibase%3Alabel%20%7B%20bd%3AserviceParam%20wikibase%3Alanguage%20%22${ explore.language }%2Cen%22.%20%7D%0A%7D%0A%0A%23defaultView%3A${ view.charAt(0).toUpperCase() + view.slice(1) }%0A%23meta%3Alist%20of%20entities`,
            tag       : '',
            languages : '',
            custom    : '',
            target_pane : 'p1',
          });

          $( '#infoframeSplit2' ).attr({"src": explore.base + '/app/wikipedia/?t=&l=' + explore.language + '&voice=' + explore.voice_code + '&qid=' + first.toString() + '&dir=' + explore.language_direction + '&embedded=' + explore.embedded + '#' + explore.hash });

        }


			}
			else if ( command === 'say' ){

				if ( isQid( data ) ){

					startSpeakingArticle( '', data, explore.language );

				}
				else {

					startSpeaking( data );

				}

			}

		});

  }
  else if ( event.data.event_id === 'update-jsonld' ){

    //console.log( 'update-jsonld triggered', event.data.data.fields );
    
    updateJSONLD( event.data.data.fields );

  }
  else if ( event.data.event_id === 'hash-change' ){

    // see also: https://gist.github.com/manufitoussi/7529fa882ff0b737f257
    //console.log('hash change signalled: ', event.data.data.hash );

    explore.hash = event.data.data.hash.replace(/#/g, '');;

    window.location.hash = explore.hash;

  }
  else if ( event.data.event_id === 'uls-close' ){
 
    // allow to hide the active ULS-widget, when clicking the wikipedia-content-pane 
    if( $('.grid.uls-menu').is(':visible') ){
      $('.active.uls-trigger').click();
    }

  }
  else if ( event.data.event_id === 'structured-query' ){

    // NOTE: use this logging to see the used "Query Builder" data
    //console.log('structure query: ', event.data.data );

    // first-time fetch of SPARQL results
    if ( event.data.data.json_url !== '' ){ 

      //console.log( event.data.data.query_json, event.data.data.json_url );
      runQuery( event.data.data.query_json, event.data.data.json_url  );

    }

  }
  else if ( event.data.event_id === 'toggle-panel2' ){
    
		togglePanel2();

  }
  else if ( event.data.event_id === 'stop-parent-speaking' ){

    $('#tts-article').remove(); // stop iframe-article speaking

  }
  else if ( event.data.event_id === 'stop-all-speaking' ){

    stopSpeaking(); // stop global window speaking
    $('#tts-article').remove(); // stop iframe-article speaking

  }
  else if ( event.data.event_id === 'stop-all-audio' ){

    stopAllAudio();

  }
  else if ( event.data.event_id === 'toggle-wander-mute' ){ // used by the "wander" video app to prevent permanent audio-muting

    explore.vids_mute = explore.vids_mute ? false : true;

  }
  else if ( event.data.event_id === 'next-wander-video' ){

    if ( valid( explore.vids[ explore.vids_index + 1] ) ){ // we have a "next" video
      explore.vids_index += 1;

      resetIframe();
      $( explore.baseframe ).attr({"src": explore.base + '/app/video/?wide=true&wander=true#/view/' + explore.vids[ explore.vids_index ] });

    }

  }
  else if ( event.data.event_id === 'previous-wander-video' ){

    if ( valid( explore.vids[ explore.vids_index - 1] ) ){ // we have a "previous" video

      explore.vids_index -= 1;

      resetIframe();
      $( explore.baseframe ).attr({"src": explore.base + '/app/video/?wide=true&wander=true#/view/' + explore.vids[ explore.vids_index ] });

    }

  }

  else if ( event.data.event_id === 'add-to-compare' ){

    let qid = '';

    if ( event.data.data.qid !== '' ){ qid = event.data.data.qid; }

    if ( qid !== '' ){

      addToCompare( qid );
      showCompare();

    }

  }
  else if ( event.data.event_id === 'page-rendered' ){

    if ( explore.marks !== '' ){

      markSentences( explore.marks );
      explore.marks = ''; // reset marks

    }

		// TODO?: trigger pending fragment command
		// ..

  }
  else if ( event.data.event_id === 'show-loader' ){
    $('#blink').show();
  }
  else if ( event.data.event_id === 'hide-loader' ){
    $('#blink').hide();
  }
  else if ( event.data.event_id === 'next-presentation-slide' ){
    console.log( event.data.event_id );
  }
  //else if ( event.data.event_id === 'go-to-previous-slide' ){ // TODO
  //  console.log( event.data.event_id );
  //}
  //else if ( event.data.event_id === 'go-to-slide-n' ){ // TODO
  //  console.log( event.data.event_id );
  //}

  else if ( event.data.event_id === 'slide-to-previous' ){ // Swiper action (not presentation!)

    if ( explore.isMobile ){
      explore.swiper.slideTo( explore.swiper.activeIndex + 1);
    }

  }
  else if ( event.data.event_id === 'slide-to-next' ){		// Swiper action (not presentation!)

    if ( explore.isMobile ){
      explore.swiper.slideTo( explore.swiper.activeIndex - 1);
    }

  }
	else if ( event.data.event_id === 'move-to-sidebar' ){ // keyboard-navigation from content-pane: move-to-sidebar

  	if ( explore.isMobile === false ){ // this feature only available on desktop

			if ( $( '#' + explore.topic_cursor ).length ){ // topic exists

				if ( $( '#' + explore.topic_cursor ).css('display') === 'block' ){ // and is not hidden

          explore.tabsInstance.select('tab-topics');
					explore.topic_cursor = $( '#' + explore.topic_cursor ).attr('id');
					$( '#' + explore.topic_cursor + ' a').first().focus();

				}

			}

		}

	}
  else if ( event.data.event_id === 'scroll-to' ){

    let id = '';

    // get id
    if ( event.data.data.id !== '' ){
      id = event.data.data.id;
    }

    // show list tab
    //explore.tabsInstance.select('tab-list');

    // highlight id
    markArticle( id );

    // scroll to ID
    $('#' + id).get(0).scrollIntoView({behavior: "auto", block: 'start'});
    //setTimeout(() => { $('#tab-list')[0].scrollBy(0, -120) }, 100); // TODO: the y-value probably needs some adjusting on other platforms

  }
  else if ( event.data.event_id === 'remove-compare-items' ){

    explore.compares = [];

  }
  else if ( event.data.event_id === 'remove-compare-item' ){

    if ( event.data.data.mygid !== '' ){

      const index = explore.compares.indexOf( event.data.data.mygid.trim() );

      if (index !== -1) {
        explore.compares.splice(index, 1);
      }

    }

  }
  else if ( event.data.event_id === 'toggle-sidebar' ){

    toggleSidebar();

  }
  else if ( event.data.event_id === 'add-bookmark' ){

    console.log('add bookmark...');

    addBookmark(event, 'clicked' );

  }
  else if ( event.data.event_id === 'remove-bookmark' ){

    console.log( event.data.data.id );

    if ( event.data.data.id !== '' ){

      removeBookmark( event, event.data.data.id )

    }

  }

}

async function runQuery( json, json_url ){

  //console.log( 'runQuery: ', json, json_url );

  // clear search-input
  //$( '#srsearch' ).val('');

  explore.searchmode    = 'wikidata';
  explore.query         = json;
  explore.topic_cursor  = 'n1-1';

  updatePushState( explore.q , 'add' );

  explore.page = 1;

  $('#pager').hide();

  explore.wikidata_query = json_url;

  runWikidataQuery();

}

async function runWikidataQuery(){

  $('#blink').show();
  $('#pager').hide();
  $('#results-label' ).empty();
  $('#total-results').empty();
  $('#scroll-end').hide();
  $('#results').empty();

  if ( explore.page === 1 ){ // first time fetch

    explore.totalRecords = 0;

    let count_query = explore.wikidata_query;
    count_query = count_query.replace( /(.*)%20WHERE%20%7B/, 'SELECT%20%28COUNT%28%2a%29%20AS%20%3Fcount%29%7B');
    count_query = count_query.replace( /ORDER%20BY(.*)/, '');

    let count_url = datasources.wikidata.endpoint + '?format=json&query=' + count_query;
    //console.log( 'count URL: ', count_url );
    
    // get total amount of results
    fetch( count_url )
      .then( response2 => response2.json() )
      .then( count_json => {

        if ( valid( count_json.results.bindings[0].count.value ) ){

          if ( count_json.results.bindings[0].count.value > 0 ){

            explore.totalRecords = count_json.results.bindings[0].count.value;

            fetchWikidataQuery();

          }
          else {

            $('#loader').hide();
            $('#blink').hide();
            $('#results-label' ).html('no results found');
            $('#pager').show();

          }

        }
        else {

          $('#loader').hide();
          $('#blink').hide();
          $('#results-label' ).html('no results found');
          $('#pager').show();

        }

    });

  }

}

async function fetchWikidataQuery(){

  return new Promise(( resolve, reject ) => {

    //console.log( 'fetchWikidataQuery: ', explore.wikidata_query );

    // fetch results
    fetch( explore.wikidata_query )

      .then( response => response.json() )
      .then( entities => {

        if ( entities.results.length === 0 ){ // no results found

          $('#scroll-end').hide();
          $('#loader').hide();
          $('#blink').hide();
          $('#results-label').html('no results found');

        }
        else { // results found

          let [ qids, topicResults ] = prepareWikidata( entities );

          let my_promises = [];

          my_promises.push( fetchWikidata( qids, topicResults, 'wikipedia', 'p1' ) );

          // resolve my promises
          Promise.allSettled( my_promises ).
            then((results) => results.forEach((result) => {

              // set source in results (so we can distinguish between other sources in the rendering phase)
              console.log( 'FIXME: ', result );
              result.value[0].source.data.continue.source = 'wikidata';

              resolve( [ result ] );

            }));

          //fetchWikidata( qids, topicResults, 'wikidata', 'p1' );

          $('details#detail-structured-search').removeAttr("open");

        }

      })

  });

}

function prepareWikidata( entities, source ){

  let qids = [];

  let topicResults = {

    batchcomplete : '',
    'continue' : {
      'continue': "-||",
      'sroffset': datasources.wikidata.pagesize,
      'source': source,
    },

    query : {
      search : [],
      searchinfo : {
        totalhits : datasources.wikidata.total,
      },
    }

  };

  $.each( entities.results.bindings , function( index, entity ){

    qids.push( entity.item.value.substring( entity.item.value.lastIndexOf("/") + 1) );

    let title = '';
    let desc  = '';

    if ( valid( entity.itemLabel.value ) ){

      title = entity.itemLabel.value;

    }

    topicResults.query.search.push({

      title: entity.itemLabel.value,
      qid: entity.item.value.substring( entity.item.value.lastIndexOf("/") + 1),
      ns: 0,
      pageid: '',
      size: 0,
      snippet: desc,
      timestamp: "2020-04-11T14:19:12Z",
      wordcount: 0,
      from_sparql: true,

    });

  });

  return [ qids, topicResults ];

}


function setLanguageDirection(){

  const rtl_scripts = [ 'arab', 'hebr', 'syrc', 'nkoo', 'thaa' ];

  // set direction
  if ( rtl_scripts.includes( explore.language_script.trim().toLowerCase() ) ){  // right-to-left

    explore.language_direction = 'rtl';

    if ( explore.language_direction !== explore.splitter_direction ){

      explore.splitter_direction = explore.language_direction;

      // #doc | .vsplitter | #sidebar
      // move "doc" before "sidebar"
      $('#doc').insertBefore(".vsplitter");
      $('#sidebar').insertAfter(".vsplitter");

    }

    // FIXME: temporary style-fix (until a better fix is found)
    $('#clearSearch').hide();
   
  } 
  else { // left-to-right

    explore.language_direction = 'ltr';

    if ( explore.language_direction !== explore.splitter_direction ){

      explore.splitter_direction = explore.language_direction;

      // #sidebar | .vsplitter | #doc
      $('#sidebar').insertBefore(".vsplitter");
      $('#doc').insertAfter(".vsplitter");

    }

    // FIXME: temporary style-fix (until a better fix is found)
    $('#clearSearch').show();

  }

}

function renderLanguageDirection(){

  //console.log('script direction: ', explore.language_script , explore.language_direction,  explore.language );

  if ( explore.language_direction === 'rtl' ){

    updateValueInPanes( 'rtl', true );

  }

  $('body').removeClass( [ 'ltr', 'rtl'] ); // reset
  $('body').addClass( explore.language_direction );

  // TODO: also set the direction in any explore-split-frame
  if ( explore.windowName === 'infoframeSplit2' ){ // request from secondary content iframe

    $('#infoframeSplit2').contents().find('body').addClass( explore.language_direction );
    $('#infoframeSplit2').contents().find('main').css({ 'direction' : explore.language_direction  });
    $('#infoframeSplit2').contents().find('aside').css({ 'direction' : explore.language_direction  });

  }
  else {

    $( 'body').css({ 'direction' : explore.language_direction });

    $( explore.baseframe ).contents().find('body').addClass( explore.language_direction );

    // FIXME this is not yet working
    $( explore.baseframe ).contents().find('main').css({ 'direction' : explore.language_direction });
    $( explore.baseframe ).contents().find('aside').css({ 'direction' : explore.language_direction });
 
  }

  //console.log( 'rendering language direction with: ', explore.language_direction );

}

function setLanguage( language ){

  // change language settings
  explore.language    = window.language = language;
  explore.lang3       = getLangCode3( explore.language );
  explore.voice_code  = getVoiceCode( explore.language );

  // store language settings
  (async () => { await explore.db.set('language', explore.language ); })();

  // set ULS-widget language display
  explore.language_name = ( explore.language === 'en') ? 'English' : getNamefromLangCode2( explore.language )

  updateLocaleNative();

  setLanguageDirection();

  afterLanguageUpdate();

}

async function afterLanguageUpdate(){

  // HTML page
  $('html').attr('lang', explore.language );

  //TODO: do this via some JS API for ULS
  $( '.uls-trigger' ).html( '<span class="icon"><i class="fa-solid fa-caret-right"></i></span> &nbsp; <span title="' + explore.language_name + '" aria-label="' + explore.language_name + '">' + getNamefromLangCode2( explore.language ) + '</span>' );

  updateQueryBuilder();

  // update show-live-edits link
  // TODO: call funtion (too avoid code duplication)
  $('li#show-live-edits').html('<a href="https://wikistream.toolforge.org/#namespace=article&wiki=' + explore.language + '.wikipedia" target="infoframe" title="Wikipedia edits liveive" aria-label="Wikipedia edits live"><i class="fa-solid fa-edit"></i> &nbsp; Wikipedia edits live</a>');

}

function markArticle( id, type ){

  $('.entry.active').removeClass('active'); // remove old highlight
  $('.entry#' + id ).addClass('active');    // make entry active

}


function toggleSidebar() {

  if ( explore.isMobile === false ){ // this feature only available on desktop

    if ( explore.windowName === 'infoframeSplit2' ){ // request from secondary content iframe

      window.parent.postMessage({ event_id: 'toggle-sidebar', data: { } }, '*' );

    }
    else {

      // store previous state, so we can detect URL-history changes for this field
      explore.show_sidebar_prev = explore.show_sidebar;

      if ( explore.splitter.position() <= 2) { // show sidebar

        explore.show_sidebar = true;

        if ( typeof explore.splitterWidth === 'undefined' ){
          explore.splitterWidth = 25;
        }

        refreshSplitter( explore.splitterWidth );
        $('div.sticky').css({ 'width' : explore.splitter.position() });

      }
      else { // hide sidebar

        explore.show_sidebar = false;
        explore.splitterWidth = 100 * ( explore.splitter.position() / $(window).width() ) ;
        refreshSplitter(0);
      }

      updatePushState( explore.q, 'add' );

    }

    resizeEmbeddedSplitter();

  }

}

function toggleFullscreen() {

	if ( screenfull.enabled ) {

    if ( explore.windowName === 'infoframeSplit2' ){ // request from secondary content iframe
      window.parent.postMessage({ event_id: 'toggle-fullscreen', data: { } }, '*' );
    }
    else {
		  screenfull.toggle();
    }

	}

}

function refreshSplitter( perc ){

  explore.splitter.position( perc + '%');
  explore.splitter.refresh();

}

function resizeEmbeddedSplitter( ){

  // if there is a splitframe: send a message for resizing the framewrap
  let iframeEl = window.frames.infoframeSplit1;

  if ( valid( iframeEl ) ){

    explore.embedded_splitter.width('100%');
    explore.embedded_splitter.height('100%');
    explore.embedded_splitter.refresh();
    explore.embedded_splitter.position( explore.embedded_splitter_left_width + '%');

  }

}

function setupSplitter( perc ){

	const w = window.innerWidth;
	const h = window.innerHeight;

  // see: https://github.com/jcubic/jquery.splitter
  explore.splitter = $('#splitter').width( w ).height( h ).split({

    orientation: 'vertical',
    position: perc + '%',
    limit: 0,

    onDrag: function(event) {

      $('div.sticky').css({ 'width' : explore.splitter.position() });

      resizeEmbeddedSplitter();
      
    }

  });

}

function identifyPlant( ) {

  handleClick({ 
    id        : 'n1-0',
    type      : 'link-split',
    title     : '',
    language  : explore.language,
    qid       : '',
    url       : encodeURI( explore.base + '/app/plantnet/index.php?l=' + explore.language ),
    tag       : '',
    languages : '',
    custom    : '',
    target_pane : 'p1',
  });

}

function identifyOCR( ) {

  handleClick({ 
    id        : 'n1-0',
    type      : 'link-split',
    title     : explore.q,
    language  : explore.language,
    qid       : '',
    url       : encodeURI( explore.base + '/app/ocr/?l=' + explore.language + '&lang3=' + explore.lang3 ),
    tag       : '',
    languages : '',
    custom    : '',
    target_pane : 'p1',
  });

}


/* bookmark functions */

function createBookmarkId() {
  return 'b' + Math.random().toString(36).substring(6);
};


function bookmarkAllowDrop(event) { // "something is being dragged and could get dropped"
  event.preventDefault();
}

function exploreBookmark(event, id) { 

  event.preventDefault();

  let node = $('#tree').tree('getNodeById', id );

  handleClick({ 
    id        : 'n1-0',
    type      : 'explore',
    title     : node.name,
    language  : node.language,
    qid       : '',
    url       : '',
    tag       : '',
    languages : '',
    custom    : '',
    target_pane : 'p1',
  });

  //console.log( node );

}

function removeBookmark( event, id ) { 

  event.preventDefault();

	if ( id !== 1 ){ // never remove root node
		$('#tree').tree('removeNode', $('#tree').tree('getNodeById', id ) );

    (async () => {

  	  await explore.db.set('bookmarks', $('#tree').tree('toJson') );

      // update current bookmarks data structure
      explore.bookmarks = await explore.db.get('bookmarks');
      explore.bookmarks = JSON.parse( explore.bookmarks );

    })();

	}

}

function addBookmark( e , action_type ) {

  // TODO: implement bookmark-removal (if this bookmark already exists)
  // removeBookmark( event, node.id )

  if ( typeof e === undefined || typeof e === 'undefined' ){
    // do nothing
  }
  else {
    e.preventDefault();
  }

  if ( explore.windowName === 'infoframeSplit2' ){ // request from secondary content iframe
    // TODO
    //window.parent.postMessage({ event_id: 'toggle-fullscreen', data: { } }, '*' );
    //$('#blink').hide();
  }
  else {

    // TODO re-sync bookmark data with browser-storage
    // first re-read bookmark data
    //bookmarks = await db.get('bookmarks');

    let link_       = $( explore.baseframe ).attr('src') || '';

    let language_   = explore.language;

    let title_      = decodeURIComponent( explore.curr_title ) || explore.q || '';
    let display_    = title_ + ' (' + language_ +')';

    let type        = explore.type;

    const video   = '\/video\/';

    if ( link_.match( video, 'g') ){ // video link
      type = 'video';
    }

    if ( type === 'wikipedia' || type === 'explore' || type === 'articles' || type === 'bookmark' || type === '' ){

      //language_ = $( explore.baseframe ).attr("data-language");
      display_  = decodeURIComponent( $( explore.baseframe ).attr("data-title") ) + ' (' + language_ + ')';
      link_     = title_;
      type      = 'wikipedia';

    }
    else if ( type === 'video'){

      link_ = $( explore.baseframe )[0].contentWindow.location.href || '';

    }
    else if ( type === 'books' ){
      type = 'book';
    }
    else if ( type === 'music' || type === 'musescore' ){
      type = 'music';
    }
    else if ( type === 'wikischool' || type === 'wikischool-page' ){
      type = 'wikischool';
    }
    else if ( type === 'imagescc' ){
      type = 'images';
    }
    else if ( type === 'compare' ){
      type = 'compare';
    }

    // determine user-action
    if ( action_type === 'dropped' ){

      const parent_id = event.target.parentNode.id;
      const new_id = createBookmarkId();
      $('#tree').tree( 'appendNode', { name: title_, display: display_, url: link_, id: new_id, language: language_, type: type }, $('#tree').tree('getNodeById', parent_id  ) );

    }
    else {

      if ( title_ !== '' && type !== '' ){

        const new_id = createBookmarkId();

        $('#tree').tree( 'appendNode', { name: title_, display: display_, url: link_, id: new_id, language: language_, type: type });

        if ( !explore.isMobile ){

          $.toast({
            heading: '<span class="icon"><i class="fa-solid fa-bookmark" title="bookmarks"></i></span> &nbsp; bookmark added',
            text: type + ' : ' + title_ ,
            hideAfter : 5000,
            showHideTransition: 'slide',
            icon: 'success'
          })

        }

        $('#tab-head-bookmarks').delay(100).fadeOut(500).fadeIn(300).fadeOut(500).fadeIn(300);

      }

    }

    (async () => {
      await explore.db.set('bookmarks', $('#tree').tree('toJson') );

      // update current bookmarks data structure
      explore.bookmarks = await explore.db.get('bookmarks');
      explore.bookmarks = JSON.parse( explore.bookmarks );

    })();

    $('#blink').hide();
  }

}


function determineWidthSplitter(){

  if ( !explore.show_sidebar && !explore.isMobile ){ // show_sidebar is false AND we are in desktop mode

    if ( explore.windowName === 'infoframeSplit2' ){ // request from secondary content iframe

      // hide left-pane
      $('#sidebar').hide();

      // add a maximize-window-button in the infoframeSplit2 window
      $('body').prepend('<a href="javascript:void(0)" id="fullscreenToggle" onclick="screenfull.toggle()" class="global-actions"><i id="fullscreenIcon" title="fullscreen toggle [f-key]" class="fa-solid fa-expand"></i></span></a>');

      return 0;

    }
    else { // request from primary content iframe

      setupSplitter(0);
      return 0;

    }

  }

	const w = $(window).width();

	if ( w < 700 ) { // TODO: use mobile functionality?
		setupSplitter(50);
	}
	else if ( w < 900 ) {
		setupSplitter(40);
	}
	else if ( w < 1300 ) {
		setupSplitter(33);
	}
	else if ( w < 1650 ) {
		setupSplitter(28);
	}
	else if ( w < 2000 ) {
		setupSplitter(25);
	}
	else if ( w > 3500 ) {
		setupSplitter(10);
	}
	else {
		setupSplitter(20);
	}

}

function refreshArticles(){

	explore.q = getSearchValue();

  // set language to 'en' if none was set: hack to fix 'undefined' language when going back to the explore-homepage
  if ( explore.language === undefined || explore.language === 'undefined' ){
    explore.language = window.language = 'en';
  }

  // store hash from URL, for later use
  const hash_ = ( explore.hash !== '') ? explore.hash : '';
 
  if ( explore.replaceState ){

    // force-merge to 'wikipedia' type when refreshing articles, as that is the only type that can output anything in the content-pane later
    if ( explore.type === 'explore' || explore.type === 'articles' || explore.type === '' ){

      explore.type = 'wikipedia';

    }

    // build an object of URL-parameters from the current state
    updatePushState( explore.q , 'replace' );

  }

	$('#results').empty();
  $('#total-results').empty();
  $('#scroll-end').hide();

  loadTopics( false );

}

function loadTopics( nextpage ){

  // TODO: (note: loadNextPage() will have increased the page)
  if ( nextpage ){ // request for the next page of results

    $.each( explore.datasources, function( index, source ){ // for each active datasource

      // check if we should fetch more results
      if ( valid( datasources[ source ].done ) ){ // datasource already marked as "done"

        // do nothing

      }
      else if ( valid( datasources[ source ].total ) ){ // total results available

        if ( ( explore.page - 1 ) * datasources[ source ].pagesize < datasources[ source ].total ){ // more to fetch for this datasource

          datasources[ source ].done = false;

        }
        else { // no more to fetch

          datasources[ source ].done = true;

        }
    
      }
      else { // without a total count: no more results to fetch

        console.log('hmm, no total count was found');
        datasources[ source ].done = true;

      }

    });
  
  }
  else { // first page

    $.each( explore.datasources, function( index, source ){ // for each active datasource

      datasources[ source ].done = false; // fetch results

    });

  }

  //console.log( datasources );

  // TODO: handle any cases of "no results found"

  fetchDatasources().then(( ret ) => {

    //console.log( 'ret: ', ret );

    let struct  = ret[0];
    let data    = ret[1];

    let my_promises = [];

    // collect my promise functions
    data.forEach(( r, index ) => {

      //console.log( struct[ index ].name, struct[ index ].count );

      if ( struct[ index ].count ){ // skip count-query data
        // do nothing
      }
      else if ( struct[ index ].name === 'wikipedia' ){

        //console.log('Wikipedia: ', data[ index ] );
        //console.log('Wikipedia results: ', data[index] );

        my_promises.push( processWikipediaResults( data[ index ] ) );

      }
      else if ( struct[ index ].name === 'wikidata' ){

        //console.log( 'Wikidata: ', data[index], data[index].length, r );

        // QQQ TODO: research and clear up the first two conditions here.
        if ( data[index].length === 0 ){ // no results found

          //console.log('Wikidata: no results found...');
          //my_promises.push( Promise.resolve([]) ); // dummy call

          datasources.wikidata.done = true; // dont fetch more from this datasource

        }
        else if ( !valid( data[index].results.bindings.length ) ){
          //console.log('error: Wikidata: invalid result length, why?');
          datasources.wikidata.done = true; // dont fetch more from this datasource
        }
        else if ( data[index].results.bindings.length === 0 ){
          //console.log('no Wikidata results: 0 length');
          datasources.wikidata.done = true; // dont fetch more from this datasource
        }
        else { // results found

          let [ qids, topicResults ] = prepareWikidata( data[ index ], struct[ index ].name );

          //console.log('Wikidata results found: ', struct[ index ].name, topicResults );
          my_promises.push( fetchWikidata( qids, topicResults, struct[ index ].name, 'p1' ) );

          $('details#detail-structured-search').removeAttr("open");

        }

      }

    });

    let renderObject = {};

    // call and resolve all my promise functions
    Promise.allSettled( my_promises )

      .then((results) => results.forEach((result) => {

        //console.log( result );

        if ( result.value[0]?.source ){ // wikidata

          //console.log('wikidata');

          if ( result.value[0] === 'done' ){ // no results were found

            datasources.wikidata.done = true; // dont fetch more from this datasource
            //console.log('wikidata datasource is done');

          }
          else {

            renderObject[ result.value[0].source.data.continue.source ] = { data : result };

          }
          
        }
        else { // wikipedia

          //console.log('wikipedia check: ', result.value[0] );

          if ( !valid( result.value[0] ) ){ // no results were found?

            datasources.wikipedia.done = true; // dont fetch more from this datasource
            //console.log('FIXME: wikipedia datasource is done (invalid results)');

          }
          else if ( result.value[0] === 'done' ){ // no results were found

            datasources.wikipedia.done = true; // dont fetch more from this datasource
            //console.log('wikipedia datasource is done (already marked as "done")');

          }
          else {

            renderObject[ 'wikipedia' ] = { data : result.value[0] };
            //renderObject[ result.value[0].value[0].source.data.continue.source ] = { data : result.value[0] };

          }

        }

        //console.log( 'my promises results: ', result, result.status );

      }))
      .then((value) => {

        // finally render all topics
        renderTopics( renderObject );

      })
      .catch( error => {

        console.log('some processing request(s) failed: ', error );

      });

  }).catch( error => {

    // TODO: send a notification if a resource is down or not functioning correctly
    console.log('some fetch request(s) failed: ', error );

  });

}

async function fetchDatasources(){

  let struct  = []; // structure to map the array of fetch results to the datasources
  let fetches = []; // holds all fetch-function calls
  let done    = '';

  // create a meta-structure (so we can align the list of fetch-results with the datasource)
  $.each( explore.datasources, function( index, source ){ // for each active datasource

    let d = datasources[ source ];

		if ( explore.page === 1 ){ // on first page


      if ( d.protocol === 'sparql' ){ // SPARQL-fetch: first set the "count url"

        struct.push({ name: source, count: true, done: false });

      }

      d.done = false; // we always need to fetch

      // always reset the total on the first page
      d.total = 0;

		}
    else { // on following page

      if ( d.done ){ // done fetching for this datasource

        done = true;

      }

    }

		struct.push({ name: source, count: false, done: done });

  });

  // setup fetch-calls
  $.each( explore.datasources, function( index, source ){ // for each active datasource

    let d = datasources[ source ];

		if ( explore.page === 1 && d.protocol === 'sparql' ){ // SPARQL-fetch: first set the "count url"

			//console.log( 'count url: ', encodeURI( eval(`\`${ d.count_url }\``) ) );

      fetches.push( $.ajax({

        url:      eval(`\`${ d.count_url }\``),

        dataType: d.connect,

        success:  function( data ) {
          //console.log(data);
        },

      }) );

		}

    if ( struct[ index ].done ){ // datasource "done"

     fetches.push( Promise.resolve([]) ); // dummy fetch call

    }
    else { // normal data fetch

      //console.log( 'url: ', encodeURI( eval(`\`${ d.url }\``) ) );

      fetches.push( $.ajax({

        url:      eval(`\`${ d.url }\``),

        dataType: d.connect,

        success:  function( data ) {
          //console.log(data);
        },

      }) );

    }

	});

  //console.log( 'fetches: ', fetches );

  let res = '';

  [ ...res ] = await Promise.all( fetches );

  //console.log( 'res: ', res, res.length, struct );

  // for the first fetch: set the fetch-result-totals
  if ( explore.page === 1 ){

    res.forEach(( r, index ) => {

      // TODO: also handle "no results" found
      //  --> datasources[ struct[index].name ].done = true;

      if ( struct[index].count ){ // count-query-fetch-result (SPARQL only)

        // TODO: How to make this count-value-check dynamic?
        if ( r.results?.bindings[0]?.count?.value ){ // Wikidata count value

          if ( r.results.bindings[0].count.value > 0 ){

            datasources[ struct[index].name ].total = r.results.bindings[0].count.value;

          }

        }

      }
      else { // normal data-fetch

          // TODO: How to make this count-value-check dynamic?
          if ( r.query?.searchinfo?.totalhits ){ // Wikipedia count value

            if ( r.query.searchinfo.totalhits > 0 ){

              datasources[ struct[index].name ].total = r.query.searchinfo.totalhits;

            }

          }

      }
        
    });

  }
  //else { // follow-up pages
  //
  //}

  return [ struct, res ];

}

function gotoSentence( ID ){

  document.getElementById( explore.baseframe ).contentWindow.scrollBy(0, -200); // FIXME descrease Y-scrolling for mobile screens

}

function markSentences( IDs ){

  // TODO
  //  - handle case where Id is invalid / negative / non-existing
  //  - handle case where endId is smaller than startId

  let marks = [];

  if ( IDs.indexOf(',') == -1 ){ // no comma found, so assume its a single value
    marks[0] = IDs;
  }
  else { // comma found
    marks = IDs.split(',');
  }

  //console.log( marks );

  // remove old highlights
  $( explore.baseframe ).contents().find('.highlight').removeClass("highlight");

  const content = $( explore.baseframe ).contents();

  $.each( marks , function( index, mark ){

    if ( /[\-]/.test( mark ) ){ // range mark
      let range = mark.split('-');
 
      // mark from range-start to range-end
      for ( let i=range[0]; i <= range[1]; i++ ){

        content.find('#' + i ).addClass('highlight');

      }

    }
    else if ( isNaN(mark) ){ // invalid mark
      //continue; 
    }
    else { // single mark
  
      // mark sentence
      content.find('#' + mark ).addClass('highlight');

      // goto sentence
      document.getElementById( 'infoframe' ).contentWindow.location.hash = mark ;
      document.getElementById( 'infoframe' ).contentWindow.scrollBy(0, -200);

    }

  });

}

function markSentence( t, sid, inSideFrame ){

  //console.log('foo: ', t, sid, inSideFrame, explore.type, explore.marks );

  if ( inSideFrame ){ // in wikipedia side frame

    console.log('sentence mark: ', sid );

    $('#infoframeSplit2').contents().find( explore.baseframe ).contents().find('.highlight').removeClass("highlight");
    $('#infoframeSplit2').contents().find( explore.baseframe ).contents().find('#' + sid ).addClass('highlight');

    $('#infoframeSplit2').contents().find( explore.baseframe ).get(0).contentWindow.location.hash = sid;
    $('#infoframeSplit2').contents().find( explore.baseframe ).get(0).contentWindow.scrollBy(0, -200);

  }
  else { // standard content frame

    // check if we are still on the corresponding page, TODO also add language-check ?
    if ( explore.curr_title !== decodeURIComponent( t ) ){ // incorrect iframe page

      // show the corresponding wikipedia page for the dates again
      handleClick({
        id        : 'n1-0',
        type      : 'dates',
        title     : t,
        language  : '',
        qid       : '',
        url       : '',
        tag       : '',
        languages : '',
        custom    : '',
        target_pane : 'p1',
      });

      //handleClick( id, 'dates', t);

      // FIXME correctly mark sentence again after the iframe was change
      //markSentence(t, sid); // call markSentence() again, since the iframe was changed
    }

    $( explore.baseframe ).contents().find('.highlight').removeClass("highlight"); // remove old highlights
    $( explore.baseframe ).contents().find('#' + sid ).addClass('highlight'); // add current highlight

    // TODO: make the frameID work for mobile
    document.getElementById( 'infoframe' ).contentWindow.location.hash = sid ;
    document.getElementById( 'infoframe' ).contentWindow.scrollBy(0, -200); // FIXME descrease Y-scrolling for mobile screens

    if ( explore.isMobile ){

      if ( explore.swiper.activeIndex === 0 ){

        explore.swiper.slideTo( 1 );

      }

    }

  }

}

function getVoiceCode( lang2 ){

  //console.log( explore.language, lang2 );

  let voice_code = undefined;

  if ( valid( lang2) ){

    for ( const [ code , langobj ] of Object.entries( explore.wp_languages )) {

      if ( lang2.trim().toLowerCase() === code.toLowerCase() ){

        voice_code = langobj.voice;

      }

    }

    // check if we should use the user-selected voice (instead of the default one)
    if ( explore.voice_code_selected.startsWith( explore.language ) ){

      voice_code = explore.voice_code_selected;

    }

  }

	return voice_code;
}

function getNamefromLangCode2( lang2 ){

  let name = '';

  if ( explore.wp_languages.hasOwnProperty( lang2 ) ){

    name = explore.wp_languages[ lang2 ].namelocal;

  }

  return name;

}

function getLatinNamefromLangCode2( lang2 ){

  let name = '';

  for ( const [ code , langobj ] of Object.entries( explore.wp_languages )) {

    if ( lang2 === code ){

      name = langobj.title;
      explore.language_script = langobj.script;

      break;
    }

  }

  return name;

}

function getLangCode2fromName( lang_name ){

  let lang2 = undefined;

  for ( const [ code , langobj ] of Object.entries( explore.wp_languages )) {

    if ( lang_name.trim().toLowerCase() === langobj.name.toLowerCase() ){

      lang2 = code;
      explore.language_script = langobj.script;

      break;

    }

  }

  return lang2;

}

function getLangCode2( lang3 ){

  let lang2 = undefined;

  for ( const [ code , langobj ] of Object.entries( explore.wp_languages )) {

    if ( lang3 === langobj.iso3 ){

      lang2 = code;
      explore.language_script = langobj.script;

      break;

    }

  }

  return lang2;

}

function getLangCode3( lang2 ){

  let lang3 = undefined;

  for ( const [ code , langobj ] of Object.entries( explore.wp_languages )) {

    if ( lang2 === code ){

      lang3 = langobj.iso3;

      // TODO DRY this code
      explore.iptv              = langobj.iptv;
      explore.language_script   = langobj.script;
      explore.language_qid      = langobj.qid || '';
      explore.language_name     = langobj.name;
      explore.language_name_capitalized = capitalizeFirstLetter( langobj.name );

      explore.lang_current_events_page = langobj.articles.current_events;

      if ( explore.voice_code_selected.startsWith( explore.language ) ){

        explore.voice_code = explore.voice_code_selected;

      } 
      else {

        explore.voice_code = langobj.voice || 'en-GB';

      }

      explore.langcode_librivox = langobj.librivox || 1;
      setLanguageDirection();

      // "Category" regexes
      explore.lang_category = langobj.namespaces.category;

      // TODO handle RTL-scripts like Arab for category-matching

      if ( explore.language_direction === 'rtl' ){

        const c1 = ':' + explore.lang_category + '$';
        explore.lang_catre1 = new RegExp( c1, "g" );

        const c2 = '%3A' + explore.lang_category + '$';
        explore.lang_catre2 = new RegExp( c2, "g" );

        explore.lang_portal = langobj.namespaces.portal;
        const p1 = ':' + explore.lang_portal + '$';
        explore.lang_porre1 = new RegExp( p1, "g" );

        explore.lang_talk = langobj.namespaces.talk;

      }
      else {

        const c1 = '^' + explore.lang_category + ':';
        explore.lang_catre1 = new RegExp( c1, "g" );

        const c2 = '^' + explore.lang_category + '%3A';
        explore.lang_catre2 = new RegExp( c2, "g" );

        explore.lang_portal = langobj.namespaces.portal;
        const p1 = '^' + explore.lang_portal + ':';
        explore.lang_porre1 = new RegExp( p1, "g" );

        explore.lang_book = langobj.namespaces.book; // TODO
        const b1 = '^' + explore.lang_book + ':';
        explore.lang_bookre = new RegExp( b1, "g" );

        explore.lang_talk = langobj.namespaces.talk;

      }

      break;
    }

  }

  return lang3;

}

async function addToCompare( qid ) {

  qid = qid.trim();

  if ( !qid.startsWith('Q') ){
    qid = 'Q' + qid; // add 'Q' to qid-string
  }

  explore.compares.push( qid );
  explore.compares = [...new Set( explore.compares )]; // use only the unique values

}

async function showCompare(){

  let message = '';

  if ( explore.compares.length >= 2 ){

    explore.custom = explore.compares;

    handleClick({
      id        : 'n1-0',
      type      : 'compare',
      title     : explore.q.trim(),
      language  : explore.language,
      qid       : '',
      url       : '',
      tag       : '',
      languages : '',
      ids       : explore.compares.join(), // TODO should we only pass this data to ONE field?
      custom    : explore.compares.join(),
      target_pane : 'p1',
    });

    explore.custom = '';

    message = 'showing comparison of ' + explore.compares.length + ' topics';

  }
  else {
    message = 'Add at least one other topic to view the comparision';
  }

  $.toast({
    heading: '<span class="icon"><i class="fa-solid fa-plus" title="add to compare"></i></span> &nbsp; topic added to compare list',
    text: message,
    hideAfter : 5000,
    showHideTransition: 'slide',
    icon: 'success',
    stack: 1,
  })

}

async function addToMapCompare( url ) {

  //console.log( url );

  explore.map_compares.push( url );

  //console.log( explore.map_compares.length );

  //explore.map_compares = [...new Set( explore.map_compares )]; // use only the unique values

}


async function showMapCompare( ) {

  let message = '';

  if ( explore.map_compares.length >= 1 ){

    let queries = [];

    $.each( explore.map_compares, function( i, url_ ) {

      let item = {
        url   : url_,
        title : 'foo',
      };

      queries.push( item );

    });

    queries = encodeURIComponent( JSON.stringify( queries ) );

    //explore.custom = explore.compares;

    handleClick({
      id        : 'n1-0',
      type      : 'link',
      title     : explore.q.trim(),
      language  : explore.language,
      qid       : '',
      url       : encodeURIComponent( `${explore.base}/app/map/?l=${explore.language}&bbox=&lat=&lon=&osm_id=&qid=&title=&query=${queries}` ),
      tag       : '',
      languages : '',
      //ids     : explore.compares.join(), // TODO should we only pass this data to ONE field?
      //custom  : explore.compares.join(),
      target_pane : 'p1',
    });

    explore.custom = '';

    message = 'showing map comparison of ' + explore.map_compares.length + ' topics';

  }
  //else {
  //  message = 'Add at least one other topic to view the map comparision';
  //}

  $.toast({
    heading: '<span class="icon"><i class="fa-solid fa-plus" title="add to map compare"></i></span> &nbsp; topic added to map compare list',
    text: message,
    hideAfter : 5000,
    showHideTransition: 'slide',
    icon: 'success',
    stack: 1,
  })

}

async function queryLocationTypeInstances( qid, country_qid ) {

  qid = qid.trim();
  country_qid = country_qid.trim();

  if ( !qid.startsWith('Q') ){ qid  = 'Q' + qid; }
  if ( !country_qid.startsWith('Q') ){ country_qid    = 'Q' + country_qid; }

  let query_json = '{"conditions"%3A[{"propertyId"%3A"P31"%2C"propertyDataType"%3A"wikibase-item"%2C"propertyValueRelation"%3A"matching"%2C"referenceRelation"%3A"regardless"%2C"value"%3A"' + qid + '"%2C"subclasses"%3Atrue%2C"conditionRelation"%3Anull%2C"negate"%3Afalse}%2C{"propertyId"%3A"P17"%2C"propertyDataType"%3A"wikibase-item"%2C"propertyValueRelation"%3A"matching"%2C"referenceRelation"%3A"regardless"%2C"value"%3A"' + country_qid + '"%2C"subclasses"%3Atrue%2C"conditionRelation"%3A"and"%2C"negate"%3Afalse}]%2C"limit"%3A10%2C"useLimit"%3Atrue%2C"omitLabels"%3Afalse}';

  let json_url = 'https://query.wikidata.org/sparql?format=json&query=SELECT%20DISTINCT%20?item%20?itemLabel%20?itemDescription%20WHERE%20%7B%0A%20%20SERVICE%20wikibase:label%20%7B%20bd:serviceParam%20wikibase:language%20%22en%2Cen%2Ces%2Cfr%2Cde%2Cit%2Cru%2Cja%2Czh%2Cfa%2Car%2Cnl%2Cca%2Cel%22.%20%7D%0A%20%20%7B%0A%20%20%20%20SELECT%20DISTINCT%20?item%20WHERE%20%7B%0A%20%20%20%20%20%20?item%20p:P31%20?statement0.%0A%20%20%20%20%20%20?statement0%20(ps:P31/(wdt:P279*))%20wd:' + qid + '.%0A%20%20%20%20%20%20?item%20p:P17%20?statement1.%0A%20%20%20%20%20%20?statement1%20(ps:P17)%20wd:' + country_qid + '.%0A%20%20%20%20%7D%0A%20%20%20%20ORDER%20BY%20%3FitemLabel%0A%20OFFSET%200%20LIMIT%2010%0A%20%20%7D%0A%7D';

  console.log( json_url );

  runQuery( query_json, json_url  );

}

async function queryParentTaxonInstances( qid ) {

  qid = qid.trim();

  if ( !qid.startsWith('Q') ){

    qid = 'Q' + qid;

  }

  let query_json = '{\"conditions\":[{\"propertyId\":\"P171\",\"propertyDataType\":\"wikibase-item\",\"propertyValueRelation\":\"matching\",\"referenceRelation\":\"regardless\",\"value\":\"Q185194\",\"subclasses\":true,\"conditionRelation\":null,\"negate\":false}],\"limit\":10,\"useLimit\":true,\"omitLabels\":false}';

  let json_url = 'https://query.wikidata.org/sparql?format=json&query=SELECT%20DISTINCT%20?item%20?itemLabel%20?itemDescription%20WHERE%20%7B%0A%20%20SERVICE%20wikibase:label%20%7B%20bd:serviceParam%20wikibase:language%20%22' + explore.language + '%2Cen%2Ces%2Cfr%2Cde%2Cit%2Cru%2Cja%2Czh%2Cfa%2Car%2Cnl%2Cca%2Cel%22.%20%7D%0A%20%20%7B%0A%20%20%20%20SELECT%20DISTINCT%20?item%20WHERE%20%7B%0A%20%20%20%20%20%20?item%20p:P171%20?statement0.%0A%20%20%20%20%20%20?statement0%20(ps:P171/(wdt:P171*))%20wd:' + qid + '.%0A%20%20%20%20%7D%0A%20%20%20%20ORDER%20BY%20%3FitemLabel%0A%20OFFSET%200%20LIMIT%2010%0A%20%20%7D%0A%7D';

  runQuery( query_json, json_url  );

}

async function queryClassInstances( qid ) {

  qid = qid.trim();

  if ( !qid.startsWith('Q') ){

    qid = 'Q' + qid;

  }

  let query_json = '{\"conditions\":[{\"propertyId\":\"P31\",\"propertyDataType\":\"wikibase-item\",\"propertyValueRelation\":\"matching\",\"referenceRelation\":\"regardless\",\"value\":\"' + qid + '\",\"subclasses\":true,\"conditionRelation\":null,\"negate\":false}],\"limit\":10,\"useLimit\":true,\"omitLabels\":false}';

  let json_url = 'https://query.wikidata.org/sparql?format=json&query=SELECT%20DISTINCT%20?item%20?itemLabel%20?itemDescription%20WHERE%20%7B%0A%20%20SERVICE%20wikibase:label%20%7B%20bd:serviceParam%20wikibase:language%20%22' + explore.language + '%2Cen%2Ces%2Cfr%2Cde%2Cit%2Cru%2Cja%2Czh%2Cfa%2Car%2Cnl%2Cca%2Cel%22.%20%7D%0A%20%20%7B%0A%20%20%20%20SELECT%20DISTINCT%20?item%20WHERE%20%7B%0A%20%20%20%20%20%20?item%20p:P31%20?statement0.%0A%20%20%20%20%20%20?statement0%20(ps:P31)%20wd:' + qid + '.%0A%20%20%20%20%7D%0A%20%20%20%20ORDER%20BY%20%3FitemLabel%0A%20OFFSET%200%20LIMIT%2010%0A%20%20%7D%0A%7D';

  runQuery( query_json, json_url  );

}

function getSearchValue( string ) {

  if ( string !== undefined ){

    return string.replace(/<\/?("[^"]*"|'[^']*'|[^>])*(>|$)/g, "").trim() || '';

  }
  else {

    return $( '#srsearch' ).val().replace(/<\/?("[^"]*"|'[^']*'|[^>])*(>|$)/g, "").trim() || '';

  }
}

function goExplore( title ){

	handleClick({ 
		id        : 'n1-0',
		type      : 'explore',
		title     : title,
		language  : explore.language,
		qid       : '',
		url       : '',
		tag       : '',
		languages : '',
		custom    : '',
    target_pane : 'p1',
	});

}

function pauseSpeaking(){

  if ( explore.isChrome ){ // note: Chrome is broken for "synth.paused"

    if ( explore.synth_paused ){

      explore.synth_paused = false;
      explore.synth.resume();

    }
    else {

      explore.synth_paused = true;
      explore.synth.pause();

    }

  }
  else {

    if ( explore.synth.paused ){

      console.log('resume speaking');
      explore.synth.resume();

    }
    else {

      console.log('pause speaking');
      explore.synth.pause();

    }

  }

}

async function stopSpeaking(){

  explore.synth.cancel();

}

function startSpeakingArticle( title, qid, language ){

  $('#blink').show();

  const title_new = encodeURIComponent( title );
  const title_cur = $('#tts-article').data('title')

  if ( explore.synth_paused === false || title_cur !== title_new ){ // speak article

    //console.log( 'speak article: ', valid( title_cur ), title_cur !== title_new );

    if ( valid( title_cur ) && title_cur !== title_new ){ // request to speak another article

      console.log('first stopping speech...');

      // FIXME: why does this not stop the speaking on MS Edge?
      stopSpeakingArticle();

    }

    explore.synth_paused = false;

    $('#tts-container').html( '<iframe id="tts-article" class="inline-iframe" title="" data-title="' + title_new + '" role="application" style="" src="' + explore.base + '/app/wikipedia/?t=' + title_new + '&l=' + language + '&qid=' + qid + '&autospeak=true' + '&embedded=' + explore.embedded + '#' + explore.hash + '" allow="autoplay; fullscreen" allowfullscreen="" allow-downloads="" width="0%" height="0%"></iframe>' );

  }
  else { // resume existing utterence

    explore.synth_paused = false;

    const iframeEl = document.getElementById( 'tts-article' );

    iframeEl.dataset.title = title_new;
    
    iframeEl.contentWindow.postMessage( { event_id: 'resume-speaking', data: '' }, '*' );

    $('#blink').hide();

  }

}

function pauseSpeakingArticle( ){

  explore.synth_paused = true;

  console.log( 'pauseSpeakingArticle()' );

  const iframeEl = document.getElementById( 'tts-article' );
  iframeEl.contentWindow.postMessage( { event_id: 'pause-speaking', data: '' }, '*' );

}

function stopSpeakingArticle(){

  explore.synth_paused = false;

  //console.log( 'stopSpeakingArticle()' );

  const iframeEl = document.getElementById( 'tts-article' );

  if ( valid( iframeEl ) ){

    iframeEl.contentWindow.postMessage( { event_id: 'stop-speaking', data: '' }, '*' );

  }

}


async function startSpeaking( text ){

  if ( explore.synth.speaking ){

    stopSpeaking(); // already speaking, so stop speaking first

  }

  if ( valid( text ) ){ // speak full article

    text = cleanText( text );

  }

  //console.log( text );

  let utterance = new SpeechSynthesisUtterance( text );

  utterance.lang  = explore.voice_code;
  utterance.rate  = explore.voice_rate;
  utterance.pitch = explore.voice_pitch;

  if ( explore.synth.speaking ){
    // do nothing, already speaking
  }
  else {
    explore.synth.speak( utterance );
  }

}

// category-tree click-handling
$('#tab-topics').on('click', 'h6 > a', function(event) {

  event.preventDefault();

  const link      = $( event.target );
  const category  = link.attr('href').slice(1);
  const heading   = link.parent();

  let  container  = heading.next('.category');

  if ( container.length ) {

    if ( container.is(':visible') ) {

      container.hide();

    }
    else {

      container.show();

    }

    return;

  }

  if ( !container.length ) {

     container = $('<div/>').addClass('category').insertAfter(link.parent());

  }

  const subcats = $.getJSON('https://' + explore.language + '.wikipedia.org/w/api.php?callback=?', {
      'action': 'query',
      'list': 'categorymembers',
      'cmtype': 'subcat',
      'cmlimit': 'max',
      'format': 'json',
      'cmtitle': category,
  });

  const pages = $.getJSON('https://' + explore.language + '.wikipedia.org/w/api.php?callback=?', {
      'action': 'query',
      'list': 'categorymembers',
      'cmtype': 'page',
      'cmlimit': 'max',
      'format': 'json',
      'cmtitle': category,
  });

  const args = { 
    id            : 'cat-item',
    language      : explore.language,
    qid           : '',
    pid           : '',
    thumbnail     : '',
    snippet       : '',
    extra_classes : '',
    item          : '',
  }

  subcats.done(function(data) {

    $.each( data.query.categorymembers, function(index, member) {

      const text = removeCategoryFromTitle( member.title );

      const item = $('<h6/>');

      const link = $('<a/>', {
        href: '#' + member.title.replace(/\s/g, '_'),
        text: text,
      });

      /*
      const buttons =
        '<span href="javascript:void(0)" class="mv-extra-icon catbutton" title="explore" aria-label="explore this topic"' + setOnClick( Object.assign({}, args, { type: 'explore', title: encodeURIComponent( text ), qid: '', language  : explore.language } ) ) + '"> <span class="icon" style="text-indent: 0em;"><i class="fa-solid fa-retweet" style="position:relative;"></i></span></span>';
        //'<span href="javascript:void(0)" class="mv-extra-icon catbutton" title="wikipedia" aria-label="wikipedia"' + setOnClick( Object.assign({}, args, { type: 'wikipedia', title: encodeURIComponent( text ), qid: '', language  : explore.language } ) ) + '"> <span class="icon" style="text-indent: 0em;"><i class="fa-brands fa-wikipedia-w" style="position:relative;"></i></span></span>';
      */

      item
        //.append( buttons )
        .append( link )
        .appendTo(container);

    });

    pages.done(function(data) {

      $.each( data.query.categorymembers, function( index, member ) {

        const item = $('<span class="catlink"/>');

        const title         = member.title;
        const title_quoted  = quoteTitle( title );

        let more_html = 
          '<ul class="catmore multi-value" name="' + args.target + '">' +
            '<li><span class="mv-extra-buttons noindent">' +
              '<a href="javascript:void(0)" class="mv-extra-icon" title="explore" aria-label="explore this topic"' + setOnClick( Object.assign({}, args, { type: 'explore', title: encodeURIComponent( title ), qid: '', language  : explore.language } ) ) + '"> <span class="icon"><i class="fa-solid fa-retweet" style="position:relative;"></i></span></a>' +
              '<a href="javascript:void(0)" class="mv-extra-icon" title="show article" aria-label="show article"' + setOnClick( Object.assign({}, args, { type: 'wikipedia', title: encodeURIComponent( title ), qid: '', language  : explore.language } ) ) + '"> <span class="icon"><i class="fa-solid fa-align-justify" style="position:relative;"></i></span></a>' +

              '<a href="javascript:void(0)" class="mv-extra-icon" title="video" aria-label="video"' + setOnClick( Object.assign({}, args, { type: 'link', url: explore.base + '/app/video/#/search/' + title_quoted, title: title, qid: '', language  : explore.language } ) ) + '"> <span class="icon"><i class="fa-solid fa-video" style="position:relative;"></i></span></a>' +

              // hide these buttons on mobile (screen is too narrow)
              ( explore.isMobile ? '' : '<a href="javascript:void(0)" class="mv-extra-icon" title="streaming video" aria-label="streaming video"' + setOnClick( Object.assign({}, args, { type: 'wander', title: title, qid: '', language  : explore.language } ) ) + '"> <span class="icon"><i class="fa-brands fa-youtube" style="position:relative;"></i></span></a>' ) +

              ( explore.isMobile ? '' : '<a href="javascript:void(0)" class="mv-extra-icon" title="audio" aria-label="audio"' + setOnClick( Object.assign({}, args, { type: 'link', url: 'https://archive.org/search.php?query=' + title_quoted + '&and[]=mediatype%3A%22audio%22&and[]=mediatype%3A%22etree%22', title: title, qid: '', language  : explore.language } ) ) + '"> <span class="icon"><i class="fa-solid fa-music" style="position:relative;"></i></span></a>' ) +
              '<a href="javascript:void(0)" class="mv-extra-icon" title="images" aria-label="images"' + setOnClick( Object.assign({}, args, { type: 'link', title: encodeURIComponent( title_quoted ), url: encodeURI( 'https://www.bing.com/images/search?&q=' + title_quoted + '&qft=+filterui:photo-photo&FORM=IRFLTR&setlang=' + explore.language + '-' + explore.language ), qid: '', language  : explore.language } ) ) + '"> <span class="icon"><i class="fa-regular fa-images" style="position:relative;"></i></span></a>' +
              '<a href="javascript:void(0)" class="mv-extra-icon" title="books" aria-label="books"' + setOnClick( Object.assign({}, args, { type: 'link', title: encodeURIComponent( title_quoted ), url: encodeURI( 'https://openlibrary.org/search?q=' + title_quoted + '&mode=everything&language=' + explore.lang3 ), qid: '', language  : explore.language } ) ) + '"> <span class="icon"><i class="fa-brands fa-mizuni" style="position:relative;"></i></span></a>' +

            '</span></li>' +

            '<li><span class="mv-extra-buttons noindent audio-buttons">' +
              '<a href="javascript:void(0)" title="speak article" aria-label="speak article" onclick="startSpeakingArticle( &apos;' + title + '&apos;, &apos;&apos;, &apos;' + explore.language + '&apos; )"> <span class="icon"><i class="fa-solid fa-play" style="position:relative;"><span class="subtext"></span></i></span> </a>' + 
              '<a href="javascript:void(0)" title="pause speaking" aria-label="pause speaking" onclick="pauseSpeakingArticle()"> <span class="icon"><i class="fa-solid fa-pause" style="position:relative;"><span class="subtext"></span></i></span> </a>' + 
              '<a href="javascript:void(0)" title="stop speaking" aria-label="stop speaking" onclick="stopSpeakingArticle()"> <span class="icon"><i class="fa-solid fa-stop" style="position:relative;"><span class="subtext"></span></i></span> </a>' + 
            '</span></li>' +
          '</ul>';

        let more = '<details id="cat-' + hashCode( title ) + '" class="catmore" title="see more links"><summary class="catmore">' + title + '</summary>' + more_html + '</details><br>';

        item.append(more).appendTo(container);

      });

    });

  });

});

async function getQidsFromTitles( titles ){

  let qids = [];
  let titles_param = '';

  titles.forEach(function( title ) {

    titles_param += '|' + encodeURIComponent( title );

  });

  console.log( titles_param.substring(1) );
  
  // TODO
  /*
  const url = 'https://en.wikipedia.org/w/api.php?action=query&prop=pageprops&titles=' + title + '&format=json';

  try {

    const data = await $.ajax({
        url: url,
        type: 'GET',
        jsonp: "callback",
        dataType: "jsonp",
    });

		if ( typeof data.query.pages[ Object.keys( data.query.pages)[0] ] === undefined ){

			console.log( 'no Qid found for this title: ', title );

		}
		else {

			qid = data.query.pages[ Object.keys( data.query.pages)[0] ].pageprops.wikibase_item;

			//console.log( qid );

		}

    return qid;

  }
  catch ( error ) {

		console.error('Qid fetch error: ' + title, error );

  }
  */

}

async function getQidFromTitle( title ){

  let qid = '';

  const url = 'https://en.wikipedia.org/w/api.php?action=query&prop=pageprops&titles=' + title + '&format=json';

  try {

    const data = await $.ajax({
        url: url,
        type: 'GET',
        jsonp: "callback",
        dataType: "jsonp",
    });

		if ( typeof data.query.pages[ Object.keys( data.query.pages)[0] ] === undefined ){

			console.log( 'no Qid found for this title: ', title );

		}
		else {

			qid = data.query.pages[ Object.keys( data.query.pages)[0] ].pageprops.wikibase_item;

		}

    return qid;

  }
  catch ( error ) {

		console.error('Qid fetch error: ' + title, error );

  }

}

async function showTopicCard( args ){ // creates the "onclick"-string for most dynamic-content links / buttons

  if ( typeof args === 'string' ){ // args is a string

    if ( args.startsWith('%7B%') ){ // args is an encoded string

      args = JSON.parse( decodeURIComponent( args ) ); // decode args-string

    }

  }

  const qid = await getQidFromTitle( args.title );

	if ( isQid( qid ) ){

		//console.log('show topic card for: ', qid, args.title, args );

		// TODO
		//getWikidata( qid );

		/*
		const id  = 'n' + explore.page + '-' + qid;

		args.id			= id;
		args.qid		= qid;
		args.pid		= 'p' + explore.page;
		args.title	= decodeURIComponent( args.title );
		args.item		= { qid : qid };

		args = { 
			id            : id,
			language      : explore.language,
			qid           : qid,
			pid           : 'p' + explore.page,
			thumbnail     : '',
			title         : title,
			snippet       : '...',
			extra_classes : '',
			item          : item,
			custom        : '',
			source        : 'raw',
		}
		*/

    //setWikidata( args.item, qid, true, 'p1', afterSetWikidata );

		/*
		const card_html = createItemHtml( args );

		const sel = '#cat-' + hashCode( args.title  );

		console.log( sel );

		$( sel ).append( card_html );

		//console.log( card_html );
		*/

	}

}

function getWikidata( qid ){
  
  //let item_ = ''; // used for the single return value

  const wikidata_url = window.wbk.getEntities({
    ids: [ qid ],
    redirections: false,
  })

  //wbk.simplify.claims( entity.claims, { keepQualifiers: true })

  // get wikidata json
  fetch( wikidata_url )

    .then( response => response.json() )
    .then( window.wbk.parse.wd.entities )
    //.then( data => window.wbk.simplify.entities(data.entities, { keepQualifiers: true } ))
    .then( entities => {

      //console.log( entities )

      let item = { qid : qid };

      // detect the relevant wikidata-data and put this info into the item
      setWikidata( item, item.qid, true, 'p0', afterSetWikidata ); // TODO: use target_pane?

  })

}

function afterSetWikidata( item ){

	console.log( item );

	return 0;

}

function setOnClickTopicCard( args ){ // creates the "onclick"-string for most dynamic-content links / buttons

  delete args.item; // remove unneeded data

  return ' onclick="showTopicCard( &quot;' + encodeURIComponent( JSON.stringify( args ) ) + '&quot;)" ';

}

async function insert_audio_chat_app(){

  if ( $('#audio-chat-app').length === 0 ){ // check if app was already inserted

    //$('#audio-chat-app-container').html( '<iframe id="audio-chat-app" src="https://jam.systems/Conzept" allow="microphone *;" width="90%" height="500"> </iframe>' );

    const url = 'https://jam.systems/Conzept';

    const min_height = explore.isMobile ? '300px' : '500px';

    const html = '<ul class="multi-value"><li class="resizer"><iframe class="inline-iframe resized" style="min-height: ' + min_height + '; border:none;" src="' + url + '" width="100%" height="100%" allowvr="yes" allow="autoplay; fullscreen" allowfullscreen allow-downloads allow-scripts allow-same-origin allow-forms allow-popups allow-pointer-lock title="embedded widget: URL-content" role="application"></iframe></li></ul>'; 

    $( '#audio-chat-app-container' ).html( html );

  }

}

async function insert_MIDI_app(){

  if ( $('#midi-music-app').length === 0 ){ // check if app was already inserted

    $('#midi-music-app-container').html( '<p id="midi-music-app" class="mv-content"><ul class="multi-value"><li class="resizer"><iframe class="inline-iframe resized" title="embedded MIDI music app" role="application" style="min-height: 600px" src="https://mmontag.github.io/chip-player-js/?p=/browse" allowvr="yes" allow="autoplay; fullscreen" allowfullscreen="" allow-downloads="" width="100%" height="100%" loading="lazy"></iframe></li></ul></p>' );

  }

}

function stateResetCheck( event ){

  // discern user-click from synthetic-click
  if ( event instanceof Event ){ // user event

    // reset some state
    explore.hash    = '';
    explore.commands = '';

  }

}
