// Shared library functions used within the API-fetch files

function getAbstract( text, keyword_match, title ){

  const term  = new RegExp( keyword_match, 'gi');

  const detail_title = valid( title ) ? title : '<i class="fa-solid fa-ellipsis-h"></i>';

  return '<details class="inline-abstract"><summary><small>' + detail_title + '</small></summary>' + text.replace( term, '<span class="highlight">' + keyword_match + '</span>' ) + '</details>';

}

function getExploreLink( args, label, qid ){

 return '<a href="javascript:void(0)" class="mv-extra-icon" title="explore" aria-label="explore this topic"' + setOnClick( Object.assign({}, args, { type: 'explore', title: encodeURIComponent( label ), qid: qid, language  : explore.language } ) ) + '"> <span class="icon"><i class="fa-solid fa-retweet" style="position:relative;"></i></span></a>';

}

function getOpenInNewTabLink( label, qid ){

  let url = '';

  if ( valid( qid ) ){ // wikipedia-qid

    url = explore.hostname + '/explore/' + encodeURIComponent( label ) + '?t=wikipedia-qid&i=' + qid + '&l=' + explore.language;


  }
  else { // wikipedia

    url = explore.hostname + '/explore/' + encodeURIComponent( label ) + '?t=string&l=' + explore.language;

  }

  return '<a href="javascript:void(0)" class="mv-extra-icon" title="open in new tab" aria-label="open in new tab" onclick="openInNewTab( &quot;' + url + '&quot;)" onauxclick="openInNewTab( &quot;' + url + '&quot;)"> <span class="icon"><i class="fa-solid fa-external-link-alt" style="position:relative;"></i></span> </a>';

}

function getBooksLink( args, label ){

  return '<a href="javascript:void(0)" class="mv-extra-icon" title="books" aria-label="books"' + setOnClick( Object.assign({}, args, { type: 'link', title: encodeURIComponent( label ), url: encodeURI( 'https://openlibrary.org/search?q=%22' + label + '%22&mode=everything&language=' + explore.lang3 ), language : explore.language } ) ) + '"> <span class="icon"><i class="fa-brands fa-mizuni" style="position:relative;"></i></span></a>';

}

function getImagesLink( args, label, qid ){

  if ( valid( qid ) ){

    return '<a href="javascript:void(0)" class="mv-extra-icon" title="Commons images" aria-label="Comons images"' + setOnClick( Object.assign({}, args, { type: 'link', title: encodeURIComponent( label ), url: encodeURI( `${explore.base}/app/commons/?q=${qid}&l=${explore.language}` ), language  : explore.language } ) ) + '"> <span class="icon"><i class="fa-regular fa-images" style="position:relative;"></i></span></a>';

  }
  else {

    return '<a href="javascript:void(0)" class="mv-extra-icon" title="Bing images" aria-label="Bing images"' + setOnClick( Object.assign({}, args, { type: 'link', title: encodeURIComponent( label ), url: encodeURI( 'https://www.bing.com/images/search?&q=' + label + '&qft=+filterui:photo-photo&FORM=IRFLTR&setlang=' + explore.language + '-' + explore.language ), language  : explore.language } ) ) + '"> <span class="icon"><i class="fa-regular fa-images" style="position:relative;"></i></span></a>';

  }

}

function getVideoLink( args, label ){

  return '<a href="javascript:void(0)" class="mv-extra-icon" title="video" aria-label="video"' + setOnClick( Object.assign({}, args, { type: 'link', url: '/app/video/#/search/' + label, title: label, language  : explore.language } ) ) + '"> <span class="icon"><i class="fa-solid fa-video" style="position:relative;"></i></span></a>';

}

function getWanderLink( args, label ){

  return '<a href="javascript:void(0)" class="mv-extra-icon" title="streaming video" aria-label="streaming video"' + setOnClick( Object.assign({}, args, { type: 'wander', title: label, language : explore.language } ) ) + '"> <span class="icon"><i class="fa-brands fa-youtube" style="position:relative;"></i></span></a>';

}

function getCompareLink( qid ){

  return '<a href="javascript:void(0)" class="mv-extra-icon" title="add to compare" aria-label="add to compare" onclick="addToCompare( &quot;' + qid + '&quot;)"> <span class="icon"><i class="fa-solid fa-plus" style="position:relative;"></i></span> </a>';

}

function getExternalWebsiteLink( url ){

  return '<a href="javascript:void(0)" class="mv-extra-icon" title="website" aria-label="website" onclick="openInNewTab( &quot;' + JSON.parse( decodeURIComponent( url ) ) + '&quot;)"> <span class="icon"><i class="fa-solid fa-home" style="position:relative;"></i></span> </a>';

}

function getLocalWebsiteLink( args, url ){

  return '<a href="javascript:void(0)" class="mv-extra-icon" title="website" aria-label="website"' + setOnClick( Object.assign({}, args, { type: 'link', url: JSON.parse( decodeURI( url ) ) } ) ) + '> <span class="icon"><i class="fa-solid fa-home" style="position:relative;"></i></span> </a>';

}

function getWebsearchLink( args, label ){

  return '<a href="javascript:void(0)" class="mv-extra-icon" title="Bing web search" aria-label="Bing web search"' + setOnClick( Object.assign({}, args, { type: 'link', url: 'https://www.bing.com/search?q=' + quoteTitle( args.topic ) + ' ' + label + '+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++-wikipedia.org+-wikimedia.org+-wikiwand.com+-wiki2.org' + '&setlang=' + explore.language + '-' + explore.language, title: args.topic + ' ' + label, language : explore.language } ) ) + '"> <span class="icon"><i class="fa-brands fa-searchengin" style="position:relative;"></i></span></a>';

}
