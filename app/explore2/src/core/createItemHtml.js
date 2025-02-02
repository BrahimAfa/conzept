'use strict';

function createItemHtml( args ){ // creates the HTML-card for each result

  if ( typeof explore.language === undefined || typeof explore.language === 'undefined' ){
    explore.language = window.language = '';
  }

  let sections_struct   = JSON.parse(JSON.stringify( explore.sections )); // copy template section-structure
  let dom               = $( explore.section_dom.html() ); // copy the general section-DOM 

  // take the required arguments
  let id                = args.id;
  let language          = args.language;
  let qid               = args.qid;
  let pid               = args.pid;
  let title             = args.title;
  let source            = args.source;

  let source_icon       = '';

  //console.log( args );
  //console.log( 'datasources: ', datasources, source );

  if ( source === 'raw' ){
    source_icon = `<span class="article-title-icon" title="plain string topic">...</span>`;
  }
  else {

    //console.log( source, datasources[ source ].name, datasources[ source ].icon );
    source_icon = `<span class="article-title-icon" title="${ datasources[ source ].name} topic">${datasources[ source ].icon }</span>`;

  }

  let headline_buttons  = []; // list of headline objects
  let headline_html     = ''; // processed headline content
  let headline          = ''; // final headline html (with some structure options)

  let math_formulas     = [];

  const topic_id        = 'mv-' + args.id;
  let topic_onclick     = '';
  let topic_label       = '';

  // custom-titles
  const title_enc       = encodeURIComponent( title );
  const title_linkgraph = title.replace(/,/g, '%252C');
  const title_quoted    = quoteTitle( title );
  const title_plus      = removebracesTitle( title ).replace(/ /g, '+');

  const title_          = minimizeTitle( title ); // removes any "namespace-string" and parentheses
  const title_dashed    = title_.replace(/\//g, '').replace(/ /g, '-').toLowerCase();
  const title_lowercase = title_.toLowerCase(); // for lexeme matching
  const title_no_spaces = encodeURIComponent( title_.replace(/ /g, '') );

  const title_no_braces = removebracesTitle( title );
  const title_no_braces_lowercase = title_no_braces.toLowerCase();

  const date_yyyy_mm_dd = new Date().toISOString().slice(0,10);

  let item          = args.item || {};
  let snippet       = valid( args.snippet )? args.snippet : '';
  let extra_classes = args.extra_classes;
  let custom        = valid ( args.custom )? args.custom : '';
  let subtitle      = valid ( item.subtitle )? args.subtitle : '';

  args.languages    = item.languages;

  let thumbs = [ 'panoramic_image', 'icon_image', 'seal', 'service_ribbon_image', 'grave_view', 'musical_motif', 'molecular_model', 'location_map', 'relief_map', 'distribution_map', 'detail_map', 'commemorative_plaque', 'place_name_sign', 'schematic', 'plan_view', 'interior_view', 'bathymetry_map', 'route_map', 'locator_map', 'sectional_view', 'monogram', 'coat_of_arms_image', 'image', 'film_poster', 'traffic_sign', 'logo', 'collage_image' ];

  let thumbnail = '';

  if ( args.thumbnail === '' ){ // no thumnail set yet

    // progressively (with increasing priority), try to set the thumbnail-image, for any Wikidata image-type.
  	thumbs.forEach(( name, index ) => {

    	if ( valid( item[ name ] ) ){

      	thumbnail = '<div class="summary-thumb"><img class="thumbnail" src="' + item[name] + '" title="' + name + '" alt="' + name + '" /></div>';

			}

		});

	}
	else { // use the standard thumb (coming from the wikipedia search API)

		thumbnail = args.thumbnail;

	}

  item.thumbnail = thumbnail; // store so we can use it in field-conditions

  let type_ = 'string';

  if ( valid( item.from_sparql ) ){

    type_ = 'wikipedia-qid';

  }

  item.date_obj = getDatingHTML( item, args );
  const dating  = ( valid( item.date_obj.dating )? item.date_obj.dating : '' ); // TODO: do this using a JSON-field

  let hide              = '';
  let hide_meta         = ''; // hides actions which are not usable with Category/Book/etc. query-concepts
  let tag_icon          = '';
  let tags              = [ '', '' ];
  let languages         = '';
  let url               = '';
  let motto_text        = '';
	let loader            = '<img class="mv-loader ' + id + '" alt="loading" width="36" height="36" src="' + explore.base + '/app/explore2/assets/images/loading.gif"/>';

  if ( valid ( item.languages ) ){
    languages = item.languages;
  }

  if ( validAny( item.tags ) ){

    tags      = item.tags; // use the setWikidata() found tags
    args.tag  = tags[0];

  }

  let o = {}; // output container for the HTML buttons

  // process all Conzept fields, check if we need to render something
  conzept_field_names.forEach(( val, index ) => {

    let name = val[0];
    let v   = val[1];

    o[ name ] = ''; // always preset the button HTML to an empty string

    if ( typeof item[name] === undefined || typeof item[name] === 'undefined' || item[name] === 'undefined' || item[name] === '' || item[name] === false ){ // inactive field

			// set empty derived-symbol-fields (since there was no other value), so we can always use their variables
      if ( v.type === 'symbol-number' ){

				o[ name + '_nr'] = '';
		    o[name + '_display_value'] = '';

			}
      else if ( v.type === 'symbol-html' ){

				o[ name + '_string'] = '';
		    o[name + '_display_value'] = '';

			}

    }
    else { // item is described and active

      // set datasource, should/could we do this earlier in setWikidata()?
      v.source = source;

      // check for render-condition
      if ( typeof v.render_condition === undefined || typeof v.render_condition === 'undefined' ){
        // continue, no conditionial found --> we may still render the field
      }
      else { // render-condition found

				let test = eval(`\`${ v.render_condition }\``); // expand condition variables into code

        if ( eval( test ) ){
					// continue to render this field
        }
				else { // do not render this field

          // check for a render_trigger
					if ( typeof v.render_trigger === undefined || typeof v.render_trigger === 'undefined' || v.render_trigger === false ){
						// continue
					}
					else { // render trigger found

            if ( typeof v.render_trigger === undefined || typeof v.render_trigger === 'undefined' || v.render_trigger === false ){
              // continue
            }
            else { // render trigger found

              let trigger = eval(`\`${ v.render_trigger }\``); // expand trigger-code variables into code

              eval( trigger ); // run trigger code

            }

					}

					// the derived-symbol-field may still be unset, so set it to empty
					if ( v.type === 'symbol-number' ){

						o[ name + '_nr'] = '';
		        o[name + '_display_value'] = '';

					}
					else if ( v.type === 'symbol-html' ){

						o[ name + '_string'] = '';
		        o[name + '_display_value'] = '';

					}

          return true;

          // TODO implement fallback, as we might need to do other things here, for some cases

				}

      }

			// handle some special type cases;
      if ( v.type === 'symbol-number' ){ // numberic symbol

        let nr_value = '';

				if ( item[name] > 10000 || countDecimals( item[name] ) > 3 ){ // large numebrs
					nr_value = numbro( item[name] ).format({ thousandSeparated: true, totalLength: 2 });
				}
				else if ( item[name] > 10 ){ // medium numbers
					nr_value = numbro( item[name] ).format({ average: true });
				}
				else { // small numbers
					nr_value = item[name];
				}

		    o[name + '_display_value']  = nr_value;
		    o[name + '_nr'] = '&nbsp;<span title="' + v.title + '" class="nowrap"><i class="' + v.icon + '"></i>&#8239;' + '<span class="headline-symbol-value">' + nr_value + '</span></span>';

        // render these fields as a list of: "key: value"
        o[ name ] = '<div class="field-info field-info-key" title="' + v.title + '" aria-label="' + v.title + '">' + v.title + '</div><div class="field-info field-info-value number" title="' + v.title + '" aria-label="' + v.title + '">' + nr_value + '</div>';

			}
      if ( v.type === 'symbol-string' ){ // string symbol

				if ( typeof v.string_format === undefined || typeof v.string_format === 'undefined' || v.string_format === '' ){ // plain string

		      o[name + '_display_value']  = item[name];
          o[ name ] = '<div class="field-info field-info-key" title="' + v.title + '" aria-label="' + v.title + '">' + v.title + '</div><div class="field-info field-info-value string" title="' + v.title + '" aria-label="' + v.title + '">' + item[name] + '</div>'; // render these fields as a list of: "key: value"

				}
				else { // constructed string

          o[ name ] = '<div class="field-info field-info-key" title="' + v.title + '" aria-label="' + v.title + '">' + v.title + '</div><div class="field-info field-info-value string" title="' + v.title + '" aria-label="' + v.title + '">' + eval(`\`${ v.string_format }\``)  + '</div>';

		      o[name + '_display_value'] = eval(`\`${ v.string_format }\``);

				}

      }
      else if ( v.type === 'symbol-html' ){ // string symbol

				if ( typeof v.string_format === undefined || typeof v.string_format === 'undefined' || v.string_format === '' ){ // plain string

					o[name + '_string']         = item[name];
		      o[name + '_display_value']  = item[name];

				}
				else { // constructed string

          o[name + '_string']         = eval(`\`${ v.string_format }\``);
		      o[name + '_display_value']  = eval(`\`${ v.string_format }\``);

				}

        return true;

			}
      else if ( v.type === 'bookmark' ){

        if ( findObjectByKey( explore.bookmarks, 'name', title ).length > 0 ){ // check if this item was bookmarked
          v.icon = 'bookmark-icon fa-solid fa-bookmark bookmarked';
        }
        else {
          v.icon = 'bookmark-icon fa-regular fa-bookmark bookmark';
        }

      }

      if ( v.type === 'code' && valid( v.code) ){ // custom-code action-button

				let code = eval(`\`${ v.code }\``); // expand condition variables into code

        o[ name ] = '<a href="javascript:void(0)" title="' + v.title + '" aria-label="' + v.title + '" onclick="' + code + '"> <span class="icon"><i class="' + v.icon + '" style="position:relative;"><span class="subtext">' + v.text + '</span></i></span> </a>';

		    o[name + '_display_value'] = v.text;

      }
      else if ( v.mv ){ // MULTI-value button

        // check what type of multi-value we have
        if ( Array.isArray( item[name] ) || ( v.type === 'wikipedia-qid-sparql' || v.type === 'rest-json' ) ){ // array-mv [ Q20, Q44, ...]

          if ( item[name].length < 2 ){ // check how many values we actually have

            // FIXME: explore-title not updated in URL, when these are clicked
            // issue: currently we don't fetch the label for these single-multi-values, so we can't pass the correct title upon clicking.
            // possible solution: fetch the label upon click and then pass the correct title?
            o[ name ] = '<a href="javascript:void(0)" title="' + v.title + '" aria-label="' + v.title + '"' + setOnClick( Object.assign({}, args, { type: v.type, qid: item[name][0] } ) ) + '> <span class="icon"><i class="' + v.icon + '" style="position:relative;"><span class="subtext">' + v.text + '</span></i></span> </a>';

		        o[name + '_display_value'] = v.text;

          }
          else {

            let list = [];

            list = item[name]; // could be: list of qid's | URL | ...

            o[ name ] = '<details title="' + name + '" id="mv-' + id + '" class="multi-value"' + setOnMultiValueClick( Object.assign({}, args, { topic: item.title, list: list, target: id, title: v.title.replace(/ /g, '_') } ) ) + '><summary class="multi-value"><span class="icon"><i class="' + v.icon + '" style="position:relative;"><span class="subtext">' + v.text + '</span></i></span></summary> <p class="mv-content">' + loader + '</p> </details> ';

          }

        }
        else { // some other mv-type

          // TODO: also implement simplification, in cases where the mv only has one value.

          if ( v.type === 'link' || v.type === 'url' ){ // object-mv { name : ext-url, ... }

            let mv_html = '';
            let target  = '';
            let newtab  = false;
            let extra_class = '';

            if ( v.type === 'url' ){

              target = '  target="_blank"  ';

            }

            if ( Object.keys(item[name]).length < 2 ){ // check how many values we actually have

              let url   = item[name][Object.keys(item[name])[0]];
              let label = Object.keys(item[name])[0];

              if ( v.type === 'url' ){

                url = encodeURI( url );

                o[ name ] = '<a href="javascript:void(0)" class="' + extra_class + '" title="' + v.title + '" aria-label="' + v.title + '" onclick="openInNewTab( &quot;' + url + '&quot;)"> <span class="icon newtab"><i class="' + v.icon + '" style="position:relative;"><span class="subtext">' + v.text + '</span></i></span> </a>';

		            o[name + '_display_value'] = v.text;

              }
              else { 

                o[ name ] = '<a href="javascript:void(0)" class="' + extra_class + '" title="' + v.title + '" aria-label="' + v.title + '"' + setOnClick( Object.assign({}, args, { type: v.type, url: url, title: label } ) ) + '> <span class="icon"><i class="' + v.icon + '" style="position:relative;"><span class="subtext">' + v.text + '</span></i></span> </a>';

		            o[name + '_display_value'] = v.text;

              }

            }
            else {

              // get shorter display label for URLs
              $.each( item[name], function( label, url ){

                // remove protocol-string (if needed)
                label = label.replace(/^(?:https?:\/\/)?(?:www\.)?/i, '');

                // add newtab-class to external-URLSs
                mv_html += '<li><a class="mv-extra-topic ' + extra_class + '" ' + target + 'href="' + url + '" title="' + label + '" aria-label="' + label + '">' + label + '</a></li>';

		            o[name + '_display_value'] = '';

              });

              o[ name ]  = '<details title="' + v.title + '" aria-label="' + v.title + '" id="mv-' + id + '" class="multi-value"><summary class="multi-value"><span class="icon"><i class="' + v.icon + '" style="position:relative;"><span class="subtext">' + v.text + '</span></i></span></summary> <p class="mv-content"><ul class="multi-value">' + mv_html + '</ul></p></details> ';

            }

          }

        }

      }
      else { // SINGLE-value button

        // first check the optional-values which need to be set
        if ( v.type === 'link-split' ){

          if ( typeof v.panelwidth === undefined || typeof v.panelwidth === 'undefined' || v.panelwidth === '' ){ // no panelwidth set

            args.panelwidth = 50; // default value

          }
          else { // panelwidth is set -> add it to the arguments

            args.panelwidth = v.panelwidth;

          }

        }

        if ( v.type === 'link' || v.type === 'link-split' || v.type === 'url' ){ // for any link-type

          // detect if URL needs to be constructed
          if ( typeof v.url === undefined || typeof v.url === 'undefined' || v.url === '' ){ // plain URL

            if ( valid( v.url_format ) ){ // use the given URL-format

              item.url = v.url_format.replace( /\$1/g, item[name] );

            }
            else {

              item.url = item[name];

            }

          }
          else { // constructed URL

            item.url = eval(`\`${ v.url }\``);

          }

          let newtab = false;

          if ( v.type === 'link' || v.type === 'link-split' ){ // embedded links
            item.url = encodeURI( item.url );
          }
          else { // new-tab-links
            item.url = encodeURI( item.url );
            newtab = true;
          }

          // build button html
          if ( newtab ){

            o[ name ] = '<a href="javascript:void(0)" title="' + v.title + '" aria-label="' + v.title + '" onclick="openInNewTab( &quot;' + item.url + '&quot;)"> <span class="icon newtab"><i class="' + v.icon + '" style="position:relative;"><span class="subtext">' + v.text + '</span></i></span> </a>';

		        o[name + '_display_value'] = v.text;

          }
          else {

            o[ name ] = '<a href="javascript:void(0)" title="' + v.title + '" aria-label="' + v.title + '"' + setOnClick( Object.assign({}, args, { type: v.type, url: item.url } ) ) + '> <span class="icon"><i class="' + v.icon + '" style="position:relative;"><span class="subtext">' + v.text + '</span></i></span> </a>';

		        o[name + '_display_value'] = v.text;

          }

        }
        else if ( v.type === 'symbol-string' ){
        }
        else if ( v.type === 'symbol-number' ){
        }
        else { // any non-link-type

          // set any other custom args first
          let custom_args = { type: v.type };

          for (const [key_, value_] of Object.entries( item.args )) {

            custom_args[ key_ ] = value_;

          }
          
          // build button html
          o[ name ] = '<a href="javascript:void(0)" title="' + v.title + '" aria-label="' + v.title + '"' + setOnClick( Object.assign({}, args, custom_args ) ) + '> <span class="icon"><i class="' + v.icon + '" style="position:relative;"><span class="subtext">' + v.text + '</span></i></span> </a>';

		      o[name + '_display_value'] = v.text;

        }

      }

      // add field to section(s)
      if ( valid( v.section) ){ // field has defined a section

        if ( Array.isArray( v.section ) ){ // add to multiple sections

          v.section.forEach(( s, index ) => {

            if ( typeof sections_struct[ s ] === 'object' ){ // section structure exists

              let rank = '';

              // determine rank value
              if ( Array.isArray( v.section ) ){

                if ( valid( v.rank[index] ) ){ // check if that rank-index is valid

                  rank = v.rank[index];

                }
                else { // take last value of array

                  rank = v.rank[ -1 ];

                }

              }
              else { // rank is a singular-value

                rank = v.rank;

              }

              // add to sections structure
              sections_struct[ s ].push({ name: name, rank: rank, html: o[ name ], });

            }

          });

        }
        else { // add to single section

          if ( typeof sections_struct[ v.section ] === 'object' ){ // section structure exists

            // add to sections structure
            sections_struct[ v.section ].push({ name: name, rank: v.rank, html: o[ name ], });

          }

        }

      }

      // check if there is headline-definition for this field
      if ( typeof v.headline_create === undefined || typeof v.headline_create === 'undefined' || v.headline_create === false ){
        // continue
      }
      else { // headline found

        let test = eval(`\`${ v.headline_create }\``); // expand headline-creation variables into code

        if ( eval( test ) ){ // create headline

          // headline trigger
          if ( typeof v.headline_trigger === undefined || typeof v.headline_trigger === 'undefined' || v.headline_trigger === false ){
            // continue

          }
          else { // headline trigger found

            let trigger = eval(`\`${ v.headline_trigger }\``); // expand trigger-code variables into code

            eval( trigger ); // run trigger code

          }

          // create headline html
          if ( !valid( v.headline_type ) ){ // no headline-type info: use existing field info

            if ( v.type === 'symbol-string' ){

              // note: onlye handles simple symbol case
              headline_buttons.push({ name: name, string: item[ name ], rank: v.headline_rank });

              // TODO: implement symbol-format case
              // eval(`\`${ v.string_format }\``)

            }
            else if ( v.type === 'symbol-number' ){

              headline_buttons.push({ name: name, string: o[ name + '_nr' ], rank: v.headline_rank });

            }
            else if ( valid( item[ name ] ) ){

              headline_buttons.push({ name: name, string: o[ name ], rank: v.headline_rank });

            }

          }
          else { // create a new headline link

            let icon        = valid( v.headline_icon )? v.headline_icon : v.icon;
            let hover_title = valid( v.headline_title )? v.headline_title : v.title;
            let link_text   = ''; // allow for dynamic "link display text" instead of an icon

            if ( valid( v.headline_text ) ){ // use this text instead of the icon

              link_text = eval(`\`${ v.headline_text }\``); // replace variables
              link_text = eval( link_text ); // run any code to get output

            }

            if ( v.headline_type === 'code'){

              let code = eval(`\`${ v.headline_code }\``);

              headline_buttons.push({ name: name, string: '<a href="javascript:void(0)" title="' + hover_title + '" aria-label="' + hover_title + '" onclick="' + code + '"><span title="' + hover_title + '" class="icon"><i class="' + icon + '" style="position:relative;"></i></span><span class="headline-link-text">' + link_text + '</span></a> ', rank: v.headline_rank });

            }
            else if ( v.headline_type === 'link' || v.headline_type === 'link-split' || v.headline_type === 'url' ){ // for any link-type
              // detect if URL needs to be constructed
              if ( typeof v.headline_url === undefined || typeof v.headline_url === 'undefined' || v.headline_url === '' ){

                if ( valid( v.url ) ){ // use item URL as the fallback

                  item.headline_url = eval(`\`${ v.url }\``);

                }

              }
              else { // constructed URL

                item.headline_url = eval(`\`${ v.headline_url }\``);

              }

              let newtab = false;

              if ( v.headline_type === 'link' || v.headline_type === 'link-split' ){ // embedded links
                item.headline_url = encodeURI( item.headline_url );
              }
              else { // new-tab-links
                item.headline_url = encodeURI( item.headline_url );
                newtab = true;
              }

              let link_display_value = ''; // note: we should only show display value's for symbol_nr and symbol_strings

              if ( v.type === 'symbol-string' || v.type === 'symbol-number' || v.type === 'symbol-html' ){

                if ( valid( v.headline_text ) ){

                  link_text = '';

                }
                else {

                  link_display_value = o[name + '_display_value'];

                }

              }

              // build button html
              if ( newtab ){

                headline_buttons.push({ name: name, string: '<a href="javascript:void(0)" title="' + hover_title + '" aria-label="' + hover_title + '" onclick="openInNewTab( &quot;' + item.headline_url + '&quot;)"> <span class="icon newtab"><i class="' + icon + '" style="position:relative;"><span class="subtext">' + link_display_value + '</span></i></span> <span class="headline-link-text">' + link_text + '<span></a>', rank: v.headline_rank });

              }
              else {

                headline_buttons.push({ name: name, string: '<a href="javascript:void(0)" title="' + hover_title + '" aria-label="' + hover_title + '"' + setOnClick( Object.assign({}, args, { type: v.headline_type, url: item.headline_url } ) ) + '> <span class="icon"><i class="' + icon + '" style="position:relative;"></i>' + link_display_value + '</span> <span class="headline-link-text">' + link_text + '</span></a>', rank: v.headline_rank });

              }

            }
            else if ( v.headline_type === 'symbol-string' ){

              headline_buttons.push({ name: name, string: '&nbsp;<span title="' + hover_title + '" class="nowrap"><i class="' + icon + '"></i>&#8239;' + '<span class="headline-symbol-value">' + o[name + '_display_value'] + '</span></span>', rank: v.headline_rank });

            }
            else if ( v.headline_type === 'symbol-number' ){

              headline_buttons.push({ name: name, string: '&nbsp;<span title="' + hover_title + '" class="nowrap"><i class="' + icon + '"></i>&#8239;' + '<span class="headline-symbol-value">' + o[name + '_display_value'] + '</span></span>', rank: v.headline_rank });

            }
            else { // any non-link-type

              headline_buttonse.push({ name: name, string: '&nbsp;<span title="' + hover_title + '" class="nowrap"><i class="' + icon + '"></i>&#8239;' + o[name + '_display_value'] + '</span>', rank: v.headline_rank });

            }

          }

        }

      }

    }

  });


  // set the topic-link values (where possible)
  if ( item.subclass_qid !== '' ){ // TODO: verify if this subclass-preference works well in most cases

    if ( valid( item.qid ) ){
      topic_onclick = ' onclick="queryClassInstances( &quot;' + item.qid + '&quot; );" '; // TODO: add onauxclick()
      topic_label = ' (click to see instances of this class)';
    }

  }

  if ( valid( item.parent_taxon ) ){

    // TODO: check if this works for all "taxon ranks" described in setWikidata.js
    topic_onclick = ' onclick="queryParentTaxonInstances( &quot;' + item.parent_taxon + '&quot; );" '; // TODO: add onauxclick()
    topic_label = ' (click to see the group taxons)';

  }
  else if ( tags[0] === 'location' && valid( [ item.instance_qid, item.country ] ) ){

    topic_onclick = ' onclick="queryLocationTypeInstances( &quot;' + item.instance_qid + '&quot;,&quot;' + item.country + '&quot; );" '; // TODO: add onauxclick()
    topic_label = ' (click to see the same location types in this country)';

  }
  
  // motto
  if ( valid( item.motto_text ) ){

    motto_text = '<div class="topic-description motto">“' + item.motto_text + '”</div>';

  }

  //  FIXME markup raw query, so it can be hidden if needed later
  if ( id === 'n00' ){

    type_         = 'wikipedia-search';
    extra_classes = 'no-wikipedia-entry';
    hide          = 'display:none;';
    item          = { dist: '' };

  }

  if ( title.startsWith( explore.lang_category + ':' ) ){ // category page
    hide_meta  = 'display:none;';
  }

  // set tag_icon
  if ( valid( conzept_tags[ tags[0] ] ) ){ // found a matching main-tag, now also check the sub-tags

    let tag = conzept_tags[ tags[0] ];

    if ( tags[1] !== '' ){ // a sub-tag is defined

      // check if there is a matching sub-tag object
      if ( valid( tag.sub[ tags[1] ] ) ){ // match

        tag = conzept_tags[ tags[0] ].sub[ tags[1] ];

        tag_icon = ' <i title="' + tag.text + topic_label + '" class="tag-icon ' + tag.icon[0] + '"></i>';

        if ( valid( tag.icon[1] ) ){ // also add the second icon-symbol
          tag_icon += ' <i title="' + tag.text + topic_label + '" class="tag-icon ' + tag.icon[1] + '"></i>';
        }

      }
      else { // no matching sub-tag object

        tag_icon = ' <i title="' + tag.text + topic_label + '" class="tag-icon ' + tag.icon[0] + '"></i>';

        if ( valid( tag.icon[1] ) ){ // also add the second icon-symbol
          tag_icon += ' <i title="' + tag.text + '" class="tag-icon ' + tag.icon[1] + '"></i>';
        }

      }

    }
    else { // set icon from root-class

      tag_icon = ' <i title="' + tag.text + topic_label + '" class="tag-icon ' + tag.icon[0] + '"></i>';

    }

  }

  //console.log( '  --> ', title, tags[0], tags[1], tag_icon );

  if ( title.startsWith( explore.lang_category + ':' ) ){ // category

    tag_icon = '<i title="category" class="tag-icon fa-regular fa-folder-open"></i>';

  }
  else if ( tags[0] === 'list' || title.startsWith( 'List of ' ) || title.startsWith( 'Index of ' ) || title.startsWith( 'Glossary of ' ) || title.endsWith( 'bibliography' ) || title.endsWith( 'discography' ) || title.endsWith( 'filmography' ) || title.startsWith( 'Portal:') || title.startsWith( 'Book:' ) || title.startsWith( 'Outline of ') ){ // list FIXME use language-indepent-regex

    tag_icon = '<i title="list / overview" class="tag-icon fa-solid fa-list-ul"></i>';

  }

  if ( tags[0] === 'person' ){
    o.height_nr = '';
  }

  if ( valid( item.defining_formula ) ){

    item.defining_formula.forEach(( formula ) => {

      // see: https://katex.org/docs/support_table.html
      const list = [ '\mbox', '\and', '\bbox' ]; // more: [ '\ang', '\array', '\bfseries', '\class', '\color', '\colorbox', '\ddddot', '\dddot', '\DeclareMathOperator', '\definecolor', '\trileleft' ];

      const tex = removeWords( formula, list );

      const formula_html = '<div class="topic-description formula" title="mathematical formula" aria-label="mathematical formula">' + katex.renderToString( tex, { throwOnError: false }) + '</div>';

      math_formulas.push( formula_html );

    });

  }

  let flags = '';

  if ( item.countries ){

    item.countries.forEach(( country, i ) => { flags += country.flag; }); // collect all flags

  }

  // TODO: try to move these appends to JSON if possible
  headline_html += 
    ( valid( item.flag ) ? item.flag : '' )  + // flag-image directly set on the item
    flags + // country flags
    dating
  ;

  headline_buttons = sortObjectsArray( headline_buttons, 'rank' ); // sort by headline fields by their ranking value

  headline_buttons.forEach(( h, i ) => { headline_html += h.string; }); // collect all headline strings

  const headline_button_length = $( $.parseHTML( headline_html ) ).find('i').length; // check how many icons there are

  let hide_headline = false;

  if ( source === 'wikipedia' ||  source === 'wikidata' ){ // TODO: still needed?
    hide_headline = ( headline_button_length === 0 ) ? true : false; // if there are no icons, hide the headline
  }

  if ( tag_icon !== '' ){ // set the final identifying icon

    if ( args.id == 'n00' ){ // raw-search-string topic 

      headline = '<a href="javascript:void(0)" class="article-title linkblock" style="margin-left: 3%;" tabindex="-1" title="Bing web search" aria-label="Bing web search"' + setOnClick( Object.assign({}, args, { type: 'link', url : 'https://www.bing.com/search?q=' + title_quoted + '+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++-wikipedia.org+-wikimedia.org+-wikiwand.com+-wiki2.org&setlang=' + explore.language + '-' + explore.language } ) ) + '>' + tag_icon + ' <span style="font-weight: normal; font-size: smaller;">(<span id="app-guide-string-search">' + explore.banana.i18n('app-guide-string-search') + '</span>)</a>';

    }
    else {

      if ( hide_headline ){

        headline_html = '';

      }

      if ( valid( topic_onclick ) ){ // with topic-class-link

        headline = '<span class="headline-left-half icon"><a href="javascript:void(0)" class="topic-class ' + topic_label + '" aria-label="topic class ' + topic_label + '" ' + topic_onclick + '>' + tag_icon + ' </a></span>' + '<span class="headline-right-half">' + headline_html + '</span>';

      }
      else { // without topic-class-lik

        headline = '<span class="headline-left-half icon"><span class="topic-class" aria-label="topic class">' + tag_icon + ' </span></span>' + '<span class="headline-right-half">' + headline_html + '</span>';

      }

    }

  }
  else { // no tags set, only show the other headline-icons

    if ( !hide_headline ){

      headline = '<span style="margin-left: 3%;">' + '<span class="headline-right-half">' + headline_html + '</span>';

    }

  }

  if ( args.id == 'n00' ){ // raw-search-string topic (not a Wikipedia or Wikidata item)

    o.mark = '';

    // override the normal wikidata-page-button with a wikidata-search-button
    o.wikidata = '<a href="javascript:void(0)" title="Wikidata search" aria-label="Wikidata search"' + setOnClick( Object.assign({}, args, { type: 'link', url: encodeURI( explore.base + '/app/wikidata/?find=' + title_ + '&lang=' + explore.language ) } ) ) + '"> <span class="icon"><i class="fa-solid fa-hockey-puck" style="position:relative;"><span class="subtext">wData</span></i></span> </a>';

    o.linkgraph = ''; // reset fields not usable for this raw-type

  }

  let current_pane  = 'p0';

  let topic_title   = ''

  let description   = '';

  // TODO:
  //  - add datasource filter
  //  - add Wikidata "qid" to bookmark meteadata as "gid"
  //  - for Wikidata datasource: check by "gid" also
  const bookmark_class = findObjectByKey( explore.bookmarks, 'name', title ).length > 0 ? 'bookmarked' : ''; // check if this item was bookmarked

  if ( args.id == 'n00' ){ // raw-search-string

    topic_title = '<a href="javascript:void(0)" class="article-title linkblock sticky-title" aria-label="Bing web search"' + setOnClick( Object.assign({}, args, { type: 'link', url : 'https://www.bing.com/search?q=' + title_quoted + '+-wikipedia.org&setlang=' + explore.language + '-' + explore.language, current_pane: current_pane, target_pane: 'p1' } ) )  + '> ' + title.replace(/:/g, ': ') + '</a>';

    item.description = '(<span id="app-guide-string-search">' + explore.banana.i18n('app-guide-string-search') + '</span>)';
  }

  if ( valid( item.display_url ) ){ // assume we can render an embedded page-link

    topic_title = `<a href="javascript:void(0)" class="article-title linkblock sticky-title ${bookmark_class}" aria-label="datasource item"` + setOnClick( Object.assign({}, args, { type: 'link', url : item.display_url, current_pane: current_pane, target_pane: 'p1' } ) )  + '> ' + title + source_icon + '</a>';

  }
  else { // assume wikipedia / wikidata render

    topic_title = `<a href="javascript:void(0)" class="article-title linkblock sticky-title ${bookmark_class}" aria-label="wikipedia"` + setOnClick( Object.assign({}, args, { type: type_, current_pane: current_pane, target_pane: 'p1', gbif_id: item.gbif_id } ) )  + '>' + title.replace(/:/g, ': ') + source_icon + '</a>';

  }

  if ( valid( item.description ) ){ // assume wikipedia / wikidata (FIXME: make this more general)


    description = '<a href="javascript:void(0)" class="summary-link" aria-label="topic description" tabindex="-1" ' + setOnClick( Object.assign({}, args, { type: type_, current_pane: current_pane, target_pane: 'p1', gbif_id: item.gbif_id } ) )  + '><div class="topic-description">' + item.description + '</div></a>'; 

  }

  // for each known section
  Object.keys( explore.sections ).forEach(( sid, i ) => {

    let html_section = '';

    const section_sorted = sortObjectsArray( sections_struct[ sid ], 'rank' ); // sort its field-objects by rank

    section_sorted.forEach(( field, j ) => {

      html_section += field.html; // append its HTML-value to "html_section"

    });

    // add the section to the DOM object
    dom.find( '#section-' + sid ).append( html_section );

  });

  let all_section_html = '';

  dom.each( function( i ) {

    all_section_html += $( this ).html();

  });

  const tts_buttons = ( source === 'wikipedia' ) ? '<div class="topic-tts-buttons">' + o.speak_article + o.pause_speaking_article + o.stop_speaking_article + '</div>' : '';

  // compose HTML output
  const html_output = '<div id="' + id + '" class="entry articles box ' + extra_classes + '" style="' + hide + '">' + 

    topic_title +

    '<div class="topic">' + headline + '</div>' +
    math_formulas.join('') +
    description +
    motto_text +

    '<a href="javascript:void(0)" class="summary-link" aria-label="wikipedia" tabindex="-1" ' + setOnClick( Object.assign({}, args, { type: 'string', current_pane: current_pane, target_pane: 'p1', gbif_id: item.gbif_id } ) )  + '>' +
      thumbnail +
      '<div class="summary ' + pid + '">' +
        snippet +
      '</div>' +
    '</a>' + 

    tts_buttons +

    o.audio_widget_string +
    '<div style="clear: both;"></div>' +

    explore.minimal_detail_open +
    '<span class="medialinks" style="display:block;">' +
      '<details id="sections" class="more-details" " title="show more links" aria-label="show more links">' +
        '<summary class="more bt"></summary>' +
          all_section_html +
      '</details>' +
    '</span>' +
    explore.minimal_detail_close +

  '</div>';

  return html_output;

}
