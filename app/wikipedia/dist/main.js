"use strict";window.wbk=WBK({instance:"https://www.wikidata.org",sparqlEndpoint:"https://query.wikidata.org/sparql"});let current_pane="",parentref="";const explore={host:CONZEPT_HOSTNAME,base:CONZEPT_WEB_BASE,version:CONZEPT_VERSION,title:getParameterByName("t")||"",language:getParameterByName("l")||"en",lang3:getParameterByName("lang3")||"",language_direction:getParameterByName("dir")||"",voice_code:getParameterByName("voice")||"",voice_rate:"1",voice_pitch:"1",hash:location.hash.substring(1)||"",qid:getParameterByName("qid")||"",embedded:getParameterByName("embedded")||"",languages:[],firstVisit:!0,locale:getParameterByName("locale")||"en",fontsize:getParameterByName("fs")||"19",font1:getParameterByName("font")||"Quicksand",darkmode:getParameterByName("darkmode")||!1,isMobile:getParameterByName("mobile")||detectMobile(),db:void 0,locales:["ceb","en","es","de","fr","hi","ja","nl","pt","ru"],banana:void 0,banana_native:void 0,language_script:"",language_name:"",language_prev:"",langcode3:void 0,langcode_librivox:void 0,lang_category:void 0,lang_catre1:void 0,lang_catre2:void 0,lang_portal:void 0,lang_porre1:void 0,lang_book:void 0,lang_bookre:void 0,lang_talk:void 0,lang_talkre:void 0,isSafari:detectSafari(),isChrome:detectChrome(),isFirefox:detectFirefox(),wp_languages,tts_enabled:!0,synth:window.speechSynthesis,synth_paused:!1,tts_removals:"table, sub, sup, style, .internal.hash, .rt-commentedText, .IPA, .catlink, .notts, #coordinates",autospeak:getParameterByName("autospeak")||!1,keyboard_ctrl_pressed:!1};$(document).ready(function(){current_pane=getCurrentPane(),setupAppKeyboardNavigation(),setupAutoStopAudio(),explore.language_direction===""&&["ar","arz","bal","bgn","ckb","fa","khw","ps","sd","ur","he","yi","arc","dv"].includes(explore.language)&&(explore.language_direction="rtl"),explore.locale==="simple"&&(explore.locale="en"),explore.title=explore.title.charAt(0).toUpperCase()+explore.title.slice(1),explore.isMobile&&explore.isChrome&&(explore.tts_enabled=!1),explore.isMobile&&setupSwipe("wikipedia-content"),(async()=>{explore.db=ImmortalDB.ImmortalDB,explore.voice_code===""&&(explore.voice_code=await explore.db.get("voice_code_selected"),explore.voice_code=explore.voice_code===null||explore.voice_code===void 0?"":explore.voice_code),valid(getParameterByName("darkmode"))||(explore.darkmode=await explore.db.get("darkmode"),explore.darkmode=!(explore.darkmode===null||explore.darkmode==="false"),valid(explore.darkmode)&&$("body").addClass("dark")),explore.lang3=getLangCode3(explore.language);const e=await explore.db.get("voice_rate");isNumeric(e)&&(explore.voice_rate=e);const t=await explore.db.get("voice_pitch");if(isNumeric(t)&&(explore.voice_pitch=t),explore.font1=await explore.db.get("font1"),explore.font1!=="Quicksand"?(valid(explore.font1)||(explore.font1="Quicksand"),$("#fontlink").replaceWith('<link id="fontlink" href="https://fonts.googleapis.com/css?family='+explore.font1+':400,500&display=swap&subset=latin-ext" rel="stylesheet" type="text/css">'),$("#fontlink").replaceWith('<link id="fontlink" href="https://fonts.googleapis.com/css?family='+explore.font1+':400,500&display=swap&subset=latin-ext" rel="stylesheet" type="text/css">'),$("body").css("fontFamily",explore.font1,"")):$("#fontlink").replaceWith("<link id=fontlink />"),explore.linkpreview=await explore.db.get("linkpreview"),explore.fontsize=await explore.db.get("fontsize"),$("body").css("fontSize",explore.fontsize+"px"),explore.banana=new Banana(explore.locale,{finalFallback:"en"}),explore.banana_native=new Banana(explore.locale,{finalFallback:"en"}),updateLocaleNative(),explore.qid==="-1"&&(explore.qid=""),window.addEventListener("message",receiveMessage,!1),$.ajaxSetup({beforeSend:function(s){s.overrideMimeType&&s.overrideMimeType("application/json")}}),explore.title===""&&explore.qid==="")return 0;if(explore.qid!=="")explore.qid.startsWith("Q")||(explore.qid="Q"+explore.qid),getWikidata(explore.qid);else{let s="";explore.embedded?s=decodeURI(s):s=encodeURIComponent(explore.title);const n="https://"+explore.language+".wikipedia.org/w/api.php?action=query&titles="+s+"&prop=langlinks&lllimit=500&format=json";console.log(n),$.ajax({url:n,dataType:"jsonp",success:function(l){if(!(typeof l===void 0||typeof l=="undefined")){if(typeof l.query.pages[Object.keys(l.query.pages)[0]]!==void 0){let i={};$.each(l.query.pages[Object.keys(l.query.pages)[0]].langlinks,function(g,p){i[p.lang]=p["*"]}),explore.languages=encodeURIComponent(JSON.stringify(i)),renderWikiArticle(explore.title,explore.language,explore.hash,explore.languages,"tag","","",!1,"")}}}})}})(),$(document).keydown(function(e){(e.keyCode?e.keyCode:e.which)=="70"&&document.toggleFullscreen()})});function getWikidata(e){const t=window.wbk.getEntities({ids:[e],redirections:!1});fetch(t).then(s=>s.json()).then(window.wbk.parse.wd.entities).then(s=>{let n={qid:e};setWikidata(n,s[n.qid],!0,current_pane,afterSetWikidata)})}function afterSetWikidata(e){if(explore.languages=e.languages,valid(e.title)){explore.title=e.title;let t="",s="";valid(e.gbif_id)&&(t=e.gbif_id),valid(e.page_banner)&&(s=e.page_banner),renderWikiArticle(explore.title,explore.language,explore.hash,explore.languages,"tag",e.qid,t,!1,s)}else window.location.href="../wikidata/?q="+explore.qid+"&lang="+explore.language}function updateLocaleNative(){let e=explore.language;e==="simple"&&(e="en"),explore.banana_native.setLocale(e),explore.locales.includes(e)&&fetch("../explore2/assets/i18n/conzept-"+e+".json?"+explore.version).then(t=>t.json()).then(t=>{explore.banana_native.load(t,e)})}function getTitleFromQid(e){}function renderWikiArticle(e,t,s,n,l,i,g,p,w){let c={};c.title="",c.html="",$.ajax({url:"https://"+explore.language+".wikipedia.org/w/api.php?action=parse&page="+encodeURIComponent(e)+"&prop=text&formatversion=2&format=json&redirects=",dataType:"jsonp",success:function(o){o===null&&(o=void 0),(explore.language===void 0||explore.language==="undefined")&&(explore.language=window.language="en"),e.startsWith(explore.lang_category+":")?$.ajax({url:"https://"+explore.language+".wikipedia.org/w/api.php",dataType:"jsonp",data:{action:"query",format:"json",list:"categorymembers",cmlimit:300,cmtitle:decodeURIComponent(e),cmnamespace:"0|14|100"},success:function(d){renderWikipediaHTML(e,t,s,c,"category",d.query.categorymembers,"",n,l,i,g,w)},error:function(d){console.log("Category JSON fetch error: "+errorMessage)}}):$.ajax({url:"https://"+explore.language+".wikipedia.org/w/api.php",dataType:"jsonp",data:{action:"query",format:"json",list:"categorymembers",cmlimit:300,cmtitle:decodeURIComponent(explore.lang_category+":"+e),cmnamespace:"0|14"},success:function(d){if(typeof d.query===void 0||typeof d.query=="undefined")console.log("warning: no pages.query results found");else if(typeof o.query===void 0||typeof o.query=="undefined"||typeof o.query.redirects[0].to===void 0||(c.title=o.query.redirects[0].to||""),typeof o.parse===void 0||typeof o.parse=="undefined"||typeof o.parse.title===void 0||(c.title=o.parse.title),e==c.title||p===!1){if(typeof o.parse===void 0||typeof o.parse=="undefined")return console.log("Wikipedia app: no article found for: ",explore.language,explore.title),window.location.href="https://www.bing.com/search?q=%22"+explore.title+"%22+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++-wikipedia.org+-wikimedia.org+-wikiwand.com+-wiki2.org&setlang="+explore.language+"-"+explore.language,$("#loader").hide(),1;c.html=o.parse.text,c===void 0?explore.noWikipediaContentYet=!0:(explore.noWikipediaContentYet=!1,renderWikipediaHTML(c.title,t,s,c,"standard-with-category",d.query.categorymembers,"",n,l,i,g,w))}else return console.log("Hmmm... redirect found: fetch wikidata for it: ",c.title,e),0},error:function(d){console.log("error fetching wikipedia data")}})}})}function renderWikipediaHTML(e,t,s,n,l,i,g,p,w,c,o,d){const N="https://"+t+".wikipedia.org/wiki/"+e,P="https://"+t+".wikipedia.org/w/index.php?title="+e+"&action=history",T=explore.isMobile?t:getNamefromLangCode2(explore.language);let y='<body id="wikipedia-content"><h2 class="article-title">'+e+"</h2> <!--catheadline-->"+n.html+"</body>",h='<div class="catheadline"><ul class="notts">',v=[];const E="https://"+explore.language+".wikipedia.org/w/api.php?action=query&format=json&titles="+encodeURIComponent(e)+"&prop=categories";$.ajax({url:E,dataType:"jsonp",success:function(k){typeof k.query.pages===void 0||typeof k.query.pages=="undefined"||valid(k.query.pages)&&valid(Object.keys(k.query.pages)[0])&&valid(k.query.pages[Object.keys(k.query.pages)[0]].categories)&&(v=k.query.pages[Object.keys(k.query.pages)[0]].categories.map(u=>u.title));let m="",W=0;for(let u=0;u<v.length;++u){const a=encodeURIComponent(v[u]);let r=v[u].replace(explore.lang_catre1,"");e===a?m+='<li class="notts"><a class="link catlink" href="'+a+'"><b>  <span class="icon"><i class="far fa-folder-open fa-xs">&nbsp; </i></span> '+r+"</b></a></li>":m+='<li class="notts"><a class="link catlink" href="'+a+'">  <span class="icon"><i class="far fa-folder-open fa-xs">&nbsp; </i></span> '+r+"</a></li>",W<3&&(a.startsWith(explore.lang_category+"%3AWikipedia")||a.startsWith(explore.lang_category+"%3ACS1")||a.startsWith(explore.lang_category+"%3A!")||a.startsWith(explore.lang_category+"%3APages%20")||a.startsWith(explore.lang_category+"%3AWebarchive%20")||a.startsWith(explore.lang_category+"%3ACite%20")||a.startsWith(explore.lang_category+"%3ATemplate%20")||a.endsWith("%20errors")||a.endsWith("%20Wikidata")||a.endsWith("%20categories")||a.endsWith("%20pages")||a.endsWith("uncertain")||a.startsWith(explore.lang_category+"%3AAll%20")||a.startsWith(explore.lang_category+"%3AArticles%20")||a.startsWith(explore.lang_category+"%3ABurials%20at")||a.startsWith(explore.lang_category+"%3ABurials%20in")||a.startsWith(explore.lang_category+"%3APeople%20from")||a.startsWith(explore.lang_category+"%3AGood%20articles")||a.startsWith(explore.lang_category+"%3AAC%20with%20")||a.startsWith(explore.lang_category+"%3AUse%20")||a.endsWith("births")||a.endsWith("deaths")||a.endsWith("alumni")||a.endsWith("people")||a.startsWith("Cat%C3%A9gorie%3AArticle%20")||a.startsWith("Cat%C3%A9gorie%3APage%20")||a.startsWith("Cat%C3%A9gorie%3APortail%3A")||(W+=1,h+='<li class="notts"><a class="link catlink" href="'+a+'"><span class="icon"><i class="far fa-folder-open fa-xs"></i></span>&nbsp; '+r+"</a></li>"))}h+="</ul></div>";const C=h.match(/<ul class="notts"><\/ul>/g);C!==null&&C.length>0&&(h=""),h.length<33&&(h="");let _="",b="",f="",q="super",x="<h1>"+decodeURIComponent(e)+"</h1>";if(l==="portal")x="",h="";else if(l==="book")x="",h="";else if(l==="category"){x='<h2> <span class="icon"><i class="far fa-folder-open fa-xs">&nbsp; </i></span> '+decodeURIComponent(e.replace(explore.lang_catre1,""))+"</h2>",q="";const u="^"+explore.lang_category+":",a=new RegExp(u,"g");for(let r=0;r<i.length;++r)if(i[r].ns===14){const j=i[r].title.replace(explore.lang_catre1,"");_+='<li class="notts"><a class="link catlink" href="'+encodeURIComponent(i[r].title)+'"> <span class="icon"><i class="far fa-folder-open fa-xs">&nbsp; </i></span> '+j+"</a></li>"}else decodeURIComponent(e.replace(explore.lang_catre2,""))===i[r].title?b+='<li class="notts"><a class="link catlinks" href="'+encodeURIComponent(i[r].title)+'"><b>'+i[r].title+"</b></a></li>":b+='<li class="notts"><a class="link catlink" href="'+encodeURIComponent(i[r].title)+'">'+i[r].title+"</a></li>";m!==""&&(f+='<div class="catheadline"><ul class="notts">'+m+"</ul></div>"),_!==""&&(f+='<h3 class="catheader">sub </h3><ul class="foldercats subs notts">'+_+"</ul>"),b!==""&&(f+='<h3 class="catheader">pages</h3><ul class="notts">'+b+"</ul>")}else if(l==="standard-with-category"){typeof o===void 0||typeof o=="undefined"||o===""||o===!0||o===!1||(f+=renderEmbeddedGbifMap(o,e)),q="super";for(let a=0;a<i.length;++a)if(i[a].ns===14){const r=i[a].title.replace(explore.lang_catre1,"");_+='<li class="notts"><a class="link catlink" href="'+i[a].title+'"> <span class="icon"><i class="far fa-folder-open fa-xs">&nbsp; </i></span> '+r+"</a></li>"}else decodeURIComponent(e.replace(/Category%3A/,""))===i[a].title?b+='<li class="notts"><a class="link catlink" href="'+encodeURIComponent(i[a].title)+'"><b>'+i[a].title+"</b></a></li>":b+='<li class="notts"><a class="link catlink" href="'+encodeURIComponent(i[a].title)+'">'+i[a].title+"</a></li>";const u=explore.language==="en"?"Categories":explore.lang_category;f+='<div class="section"> <h2 class="catheader">'+u+"</h2>",m!==""&&(f+='<h3 class="catheader">super</h3><div class="categories"><div class="catheadline"><ul class="foldercats">'+m+"</ul></div></div>"),_!==""&&(f+='<h3 class="catheader">sub </h3><ul class="foldercats subs">'+_+"</ul>"),b!==""&&(f+='<h3 class="catheader">pages</h3><ul>'+b+"</ul>"),f+="</div>",y=y.replace(/<\!--catheadline-->/,h)}const R=explore.darkmode?"dark":"";g=g.replace(/\/wiki\//g,"/explore/"),y=y.replace(/\/wiki\//g,"/explore/").replace(/listaref/g,"listaref reflist").replace(/references-small/g,"references-small reflist").replace(/infobox_v2/g,"infobox").replace(/infobox_v3/g,"infobox").replace(/"tright"/g,'"tright infobox"').replace(/infocaseta/g,"infobox infocaseta").replace(/legende-bloc/g,"legend legende-bloc");let A='<link id="fontlink" />';explore.font1!=="Quicksand"&&(A='<link id="fontlink" href="https://fonts.googleapis.com/css?family='+explore.font1+':400,500&display=swap&subset=latin-ext" rel="stylesheet" type="text/css">');let I="";typeof d===void 0||typeof d=="undefined"||d!==""&&(I='<img id="article-banner" class="no-enlarge" src="'+d+'"></img>');let B='<span id="gotoTalkPage"><button onclick="gotoTalkPage()" onauxclick="gotoTalkPage( true )" class="dropbtn" tabIndex="0" title="go to talk-page" aria-label="go to talk-page"><span class="icon"><i class="far fa-comments"></i></span></button></span> ';e.startsWith(explore.lang_talk+":")&&(B='<span id="gotoArticle"><button onclick="gotoArticle()" onauxclick="gotoArticle( true )" class="dropbtn" tabIndex="0" title="go to article" aria-label="go to article"><span class="icon"><i class="fas fa-align-justify"></i></span></button></span> '),y=y.replace(/<body id="wikipedia-content">/,A+'<a href="javascript:void(0)" id="fullscreenToggle" onclick="document.toggleFullscreen()" class="global-actions"><i id="fullscreenIcon" title="fullscreen toggle" class="fas fa-expand-arrows-alt"></i></a><script> let language = "'+t+'"; let locale =  "'+explore.locale+'"; let title =  "'+e+'"; let qid =  "'+explore.qid+'"; let languages =  "'+p+'"; let font1 =  "'+explore.font1+'"; let darkmode = '+explore.darkmode+'; <\/script><meta name="viewport" content="width=device-width, height=device-height, initial-scale=1.0, user-scalable=1, minimum-scale=1.0, maximum-scale=5.0"><style>html{visibility: hidden;opacity:0;}</style><aside class="js-toc"> </aside><main class="explore" role="main"><div id="openseadragon" style="display:none; width: 100vw; height: 100vh;"><img id="loader-openseadragon" class="no-enlarge" style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 999999; width: 100px; height: 100px;" alt="loading" src="../explore2/assets/images/loading.gif"/></div><div id="wikipedia-menu"><span id="exploreTopic"><button onclick="goExplore()" onauxclick="goExplore(true)" class="dropbtn" tabIndex="0" title="explore this topic" aria-label="explore this topic"><span class="icon"><i class="fas fa-retweet"></i></span></button></span> <span id="newTab"><button onclick="openInNewTab( &quot;https://'+CONZEPT_HOSTNAME+CONZEPT_WEB_BASE+"/explore/"+encodeURIComponent(e)+"?l="+explore.language+"&t=wikipedia&i="+explore.qid+'&quot;)" onauxclick="openInNewTab( &quot;https://'+CONZEPT_HOSTNAME+CONZEPT_WEB_BASE+"/explore/"+encodeURIComponent(e)+"?l="+explore.language+"&t=wikipedia&i="+explore.qid+'&quot;)" class="dropbtn" tabIndex="0" title="open in new tab"><span class="icon"><i class="fas fa-external-link-alt"></i></span></button></span>'+B+'<span id="gotoVideo"><button onclick="gotoVideo()" onauxclick="gotoVideo( true )" class="dropbtn" tabIndex="0" title="go to video" aria-label="go to video"><span class="icon"><i class="fas fa-video"></i></span></button></span> <span id="gotoImages"><button onclick="gotoImages()" onauxclick="gotoImages( true )" class="dropbtn" tabIndex="0" title="go to images" aria-label="go to images"><span class="icon"><i class="far fa-images"></i></span></button></span> <span id="gotoBooks"><button onclick="gotoBooks()"  onauxclick="gotoBooks( true )" class="dropbtn" tabIndex="0" title="go to books" aria-label="go to books"><span class="icon"><i class="fab fa-mizuni"></i></span></button></span> <span id="addToCompare"><button onclick="addToCompare()" class="dropbtn" tabIndex="0" title="add to compare" aria-label="add to compare"><span class="icon"><i class="fas fa-plus"></i></span></button></span> <span id="gotoWikipedia"><button onclick="gotoWikipedia()" onauxclick="gotoWikipedia( true )"class="dropbtn" tabIndex="0" title="go to Wikipedia" aria-label="go to wikipedia"><span class="icon"><i class="fab fa-wikipedia-w"></i></span></button></span> <span id="otherLanguage"><button onclick="showWikipediaLanguages()" class="dropbtn active uls-trigger" tabIndex="0" title="article in other languages"> '+T+"</button></span></div>"+I),$("body#wikipedia-content").html(y+'<base target="_parent" /><script type="text/javascript" src="../wikipedia/dist/transform.js?'+explore.version+'"><\/script>'+g+f+'<script src="../explore2/dist/webcomponent/gbif-map.js?'+explore.version+'" type="module"><\/script><script src="../explore2/libs/sortable.js"><\/script><br/><div id="legalnotice">This page is based on a <a target="_blank_" href="'+N+'">Wikipedia</a> article written by <a href="'+P+'">contributors</a>. The text is available under the <a href="https://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0</a> license; additional terms may apply. Images, videos and audio are available under their respective licenses.</div></main><br/><br/><br/>'),explore.isMobile&&($("#gotoImages").hide(),$("#gotoBooks").hide(),$("#addToCompare").hide()),explore.isFirefox&&$("#pauseButton").hide()}})}document.toggleFullscreen=function(){return screenfull.enabled&&screenfull.toggle(),0};function getLangCode3(e){let t;for(const[s,n]of Object.entries(explore.wp_languages))if(e===s){if(t=n.iso3,explore.language_script=n.script,explore.language_name=n.name,explore.voice_code.startsWith(explore.language)||(explore.voice_code=n.voice||"en-GB"),explore.langcode_librivox=n.librivox||1,explore.lang_category=n.namespaces.category,explore.language_direction==="rtl"){const l=":"+explore.lang_category+"$";explore.lang_catre1=new RegExp(l,"g");const i="%3A"+explore.lang_category+"$";explore.lang_catre2=new RegExp(i,"g"),explore.lang_portal=n.namespaces.portal;const g=":"+explore.lang_portal+"$";explore.lang_porre1=new RegExp(g,"g"),explore.lang_talk=n.namespaces.talk;const p=":"+explore.lang_talk+"$";explore.lang_talkre=new RegExp(p,"g")}else{const l="^"+explore.lang_category+":";explore.lang_catre1=new RegExp(l,"g");const i="^"+explore.lang_category+"%3A";explore.lang_catre2=new RegExp(i,"g"),explore.lang_portal=n.namespaces.portal;const g="^"+explore.lang_portal+":";explore.lang_porre1=new RegExp(g,"g"),explore.lang_book=n.namespaces.book;const p="^"+explore.lang_book+":";explore.lang_bookre=new RegExp(p,"g"),explore.lang_talk=n.namespaces.talk;const w="^"+explore.lang_talk+":";explore.lang_talkre=new RegExp(w,"g")}break}return t}function getNamefromLangCode2(e){let t="";return explore.wp_languages.hasOwnProperty(e)&&(t=explore.wp_languages[e].namelocal),t}function detectMobile(){return getParameterByName("v")==="mobile"?!0:getParameterByName("v")==="desktop"?!1:/Android|webOS|iPhone|iPad|iPod|BlackBerry|Mobile/i.test(navigator.userAgent)}function receiveMessage(e){e.data.event_id==="set-value"?explore[e.data.data[0]]=e.data.data[1]:e.data.event_id==="pause-speaking"?pauseSpeaking():e.data.event_id==="resume-speaking"?resumeSpeaking():e.data.event_id==="stop-speaking"&&(console.log("wikipedia app: stop speaking"),stopSpeaking())}function showWikipediaLanguages(){}function renderEmbeddedGbifMap(e,t){const s=explore.isMobile?"300px":"500px";return'<div class="section"><h2 class="map-gbif">'+explore.banana_native.i18n("app-title-occurence")+'</h2><gbif-map style="resize: both; overflow: auto; width:100%;height:'+s+';" gbif-id="'+e+'" gbif-title="'+t+'" gbif-language="'+explore.language+'" gbif-style="scaled.circles" center-latitude="30.0" center-longitude="13.6" controls ></gbif-map>'}function pauseSpeaking(){console.log("speaking paused"),explore.synth_paused=!0,explore.synth.pause()}function stopSpeaking(){explore.synth.cancel()}function cleanText(e){if(typeof e===void 0||typeof e=="undefined")return"";for(e=e.replace(/(\r\n|\n|\r|'|"|`|\(|\)|\[|\])/gm,"");e!=(e=e.replace(/\{[^\{\}]*\}/gm,"")););return e}function resumeSpeaking(){explore.synth_paused=!1,explore.synth.resume()}function startSpeaking(e){if(parentref.postMessage({event_id:"show-loader",data:{}},"*"),explore.synth_paused)return resumeSpeaking(),0;if(explore.synth.speaking){if(explore.firstVisit===!0)return console.log("dont speak: other speaker active upon first visit"),explore.firstVisit=!1,0;stopSpeaking()}explore.synth_paused=!1,(typeof e===void 0||typeof e=="undefined"||e==="")&&(e=$(".mw-parser-output h2, h3, h4, h5, h6, p:not(table p), ul:not(table ul), li:not(table li), dl, dd").clone().find(explore.tts_removals).remove().end().text(),e=$("h2:first").text()+e),e=cleanText(e);let t=new SpeechSynthesisUtterance(e);t.lang=explore.voice_code,t.rate=explore.voice_rate,t.pitch=explore.voice_pitch,explore.synth.speaking||explore.synth.speak(t),parentref.postMessage({event_id:"hide-loader",data:{}},"*")}
//# sourceMappingURL=main.js.map
