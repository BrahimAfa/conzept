a:329:{i:0;a:3:{i:0;s:14:"document_start";i:1;a:0:{}i:2;i:0;}i:1;a:3:{i:0;s:6:"header";i:1;a:3:{i:0;s:14:"code structure";i:1;i:1;i:2;i:1;}i:2;i:1;}i:2;a:3:{i:0;s:12:"section_open";i:1;a:1:{i:0;i:1;}i:2;i:1;}i:3;a:3:{i:0;s:6:"p_open";i:1;a:0:{}i:2;i:1;}i:4;a:3:{i:0;s:5:"cdata";i:1;a:1:{i:0;s:117:"Here is a high-level description of how the code in the Conzept project is structured.
You can also browse it online ";}i:2;i:31;}i:5;a:3:{i:0;s:12:"externallink";i:1;a:2:{i:0;s:36:"https://github1s.com/waldenn/conzept";i:1;s:4:"here";}i:2;i:148;}i:6;a:3:{i:0;s:5:"cdata";i:1;a:1:{i:0;s:1:".";}i:2;i:193;}i:7;a:3:{i:0;s:7:"p_close";i:1;a:0:{}i:2;i:194;}i:8;a:3:{i:0;s:13:"section_close";i:1;a:0:{}i:2;i:196;}i:9;a:3:{i:0;s:6:"header";i:1;a:3:{i:0;s:24:"root directory structure";i:1;i:2;i:2;i:196;}i:2;i:196;}i:10;a:3:{i:0;s:12:"section_open";i:1;a:1:{i:0;i:2;}i:2;i:196;}i:11;a:3:{i:0;s:4:"code";i:1;a:3:{i:0;s:437:"
.
├── app (all ~40 embedded apps, including the Conzept main app, see next section)
│  ├── ...
│  ├── ...
│  └── ...
│
├── assets (globally shared assets)
│  ├── icons
│  └── fonts
│
└── services (background services started upon system boot)
   ├── allorigins (general CORS proxy)
   └── json-proxy (JSON-only CORS proxy, which can also handle secret API-keys)
";i:1;N;i:2;N;}i:2;i:239;}i:12;a:3:{i:0;s:6:"p_open";i:1;a:0:{}i:2;i:239;}i:13;a:3:{i:0;s:5:"cdata";i:1;a:1:{i:0;s:78:"The Conzept-project root-directory also contains the following relevant files:";}i:2;i:686;}i:14;a:3:{i:0;s:7:"p_close";i:1;a:0:{}i:2;i:764;}i:15;a:3:{i:0;s:10:"listu_open";i:1;a:0:{}i:2;i:764;}i:16;a:3:{i:0;s:13:"listitem_open";i:1;a:1:{i:0;i:1;}i:2;i:764;}i:17;a:3:{i:0;s:16:"listcontent_open";i:1;a:0:{}i:2;i:764;}i:18;a:3:{i:0;s:5:"cdata";i:1;a:1:{i:0;s:36:" authors, copyright and license file";}i:2;i:768;}i:19;a:3:{i:0;s:17:"listcontent_close";i:1;a:0:{}i:2;i:804;}i:20;a:3:{i:0;s:14:"listitem_close";i:1;a:0:{}i:2;i:804;}i:21;a:3:{i:0;s:13:"listitem_open";i:1;a:1:{i:0;i:1;}i:2;i:804;}i:22;a:3:{i:0;s:16:"listcontent_open";i:1;a:0:{}i:2;i:804;}i:23;a:3:{i:0;s:5:"cdata";i:1;a:1:{i:0;s:70:" manifest.json (this enables Conzept to be installed as a desktop app)";}i:2;i:808;}i:24;a:3:{i:0;s:17:"listcontent_close";i:1;a:0:{}i:2;i:878;}i:25;a:3:{i:0;s:14:"listitem_close";i:1;a:0:{}i:2;i:878;}i:26;a:3:{i:0;s:13:"listitem_open";i:1;a:1:{i:0;i:1;}i:2;i:878;}i:27;a:3:{i:0;s:16:"listcontent_open";i:1;a:0:{}i:2;i:878;}i:28;a:3:{i:0;s:5:"cdata";i:1;a:1:{i:0;s:68:" service-worker.js (required for making the Conzept app installable)";}i:2;i:882;}i:29;a:3:{i:0;s:17:"listcontent_close";i:1;a:0:{}i:2;i:950;}i:30;a:3:{i:0;s:14:"listitem_close";i:1;a:0:{}i:2;i:950;}i:31;a:3:{i:0;s:13:"listitem_open";i:1;a:1:{i:0;i:1;}i:2;i:950;}i:32;a:3:{i:0;s:16:"listcontent_open";i:1;a:0:{}i:2;i:950;}i:33;a:3:{i:0;s:5:"cdata";i:1;a:1:{i:0;s:75:" opensearch.xml (used by search engines and web browsers to understand the ";}i:2;i:954;}i:34;a:3:{i:0;s:7:"acronym";i:1;a:1:{i:0;s:3:"URL";}i:2;i:1029;}i:35;a:3:{i:0;s:5:"cdata";i:1;a:1:{i:0;s:28:" search format of a website)";}i:2;i:1032;}i:36;a:3:{i:0;s:17:"listcontent_close";i:1;a:0:{}i:2;i:1060;}i:37;a:3:{i:0;s:14:"listitem_close";i:1;a:0:{}i:2;i:1060;}i:38;a:3:{i:0;s:11:"listu_close";i:1;a:0:{}i:2;i:1060;}i:39;a:3:{i:0;s:13:"section_close";i:1;a:0:{}i:2;i:1063;}i:40;a:3:{i:0;s:6:"header";i:1;a:3:{i:0;s:16:"conzept main app";i:1;i:2;i:2;i:1063;}i:2;i:1063;}i:41;a:3:{i:0;s:12:"section_open";i:1;a:1:{i:0;i:2;}i:2;i:1063;}i:42;a:3:{i:0;s:6:"p_open";i:1;a:0:{}i:2;i:1063;}i:43;a:3:{i:0;s:5:"cdata";i:1;a:1:{i:0;s:23:"The Conzept main app - ";}i:2;i:1093;}i:44;a:3:{i:0;s:11:"strong_open";i:1;a:0:{}i:2;i:1116;}i:45;a:3:{i:0;s:5:"cdata";i:1;a:1:{i:0;s:35:"the UI wrapping all the other apps!";}i:2;i:1118;}i:46;a:3:{i:0;s:12:"strong_close";i:1;a:0:{}i:2;i:1153;}i:47;a:3:{i:0;s:5:"cdata";i:1;a:1:{i:0;s:22:" -  is located in the ";}i:2;i:1155;}i:48;a:3:{i:0;s:18:"doublequoteopening";i:1;a:0:{}i:2;i:1177;}i:49;a:3:{i:0;s:11:"strong_open";i:1;a:0:{}i:2;i:1178;}i:50;a:3:{i:0;s:12:"externallink";i:1;a:2:{i:0;s:59:"https://github.com/waldenn/conzept/tree/master/app/explore2";i:1;s:29:"<root_directory>/app/explore2";}i:2;i:1180;}i:51;a:3:{i:0;s:12:"strong_close";i:1;a:0:{}i:2;i:1273;}i:52;a:3:{i:0;s:18:"doublequoteclosing";i:1;a:0:{}i:2;i:1275;}i:53;a:3:{i:0;s:5:"cdata";i:1;a:1:{i:0;s:43:" directory and has the following structure:";}i:2;i:1276;}i:54;a:3:{i:0;s:7:"p_close";i:1;a:0:{}i:2;i:1319;}i:55;a:3:{i:0;s:4:"code";i:1;a:3:{i:0;s:1454:"
.
├── assets
│   ├── geojson (used only for the data-layers in the organism-occurrence web-component)
│   ├── i18n (localization files)
│   ├── images (some static images)
│   ├── json (mainly used for storing lists of Wikidata "topic theme" entity IDs)
│   ├── models (used to store Draco-optimized GLB 3D models)
│   └── svg (used for flags, former-flags)
│
├── css
│   ├── conzept (all the Conzept style files)
│   ├── openmoji (icon set style)
│   └── various (a few style files not yet installable with NPM)
│
├── dist (the build-output directory - never manually edit these files)
│
├── libs (a few JS libraries not yet installable with NPM)
│
├── notes (a collection of design notes)
│
├── php (PHP mobile-detect library)
│
├── src (Conzept source directory)
│   ├── core (core code parts)
│   ├── data (code which creates dynamic data structures)
│   ├── datasources (code which functions to handle various datasources, such as "wikipedia" and "wikidata")
│   ├── command ([[command API]] related code)
│   ├── fetch (code which fetches API data, each API has its own file - see the section "API code" below)
│   └── webcomponent (used for storing web-components)
│
└── tools (various tools used for: building, installing services, fetching monthly covers, etc.)
";i:1;N;i:2;N;}i:2;i:1326;}i:56;a:3:{i:0;s:13:"section_close";i:1;a:0:{}i:2;i:2790;}i:57;a:3:{i:0;s:6:"header";i:1;a:3:{i:0;s:11:"entry point";i:1;i:2;i:2;i:2790;}i:2;i:2790;}i:58;a:3:{i:0;s:12:"section_open";i:1;a:1:{i:0;i:2;}i:2;i:2790;}i:59;a:3:{i:0;s:6:"p_open";i:1;a:0:{}i:2;i:2790;}i:60;a:3:{i:0;s:5:"cdata";i:1;a:1:{i:0;s:30:"The Conzept app is started in ";}i:2;i:2815;}i:61;a:3:{i:0;s:18:"doublequoteopening";i:1;a:0:{}i:2;i:2845;}i:62;a:3:{i:0;s:11:"strong_open";i:1;a:0:{}i:2;i:2846;}i:63;a:3:{i:0;s:12:"externallink";i:1;a:2:{i:0;s:76:"https://github.com/waldenn/conzept/tree/master/app/explore2/src/core/main.js";i:1;s:16:"src/core/main.js";}i:2;i:2848;}i:64;a:3:{i:0;s:12:"strong_close";i:1;a:0:{}i:2;i:2945;}i:65;a:3:{i:0;s:18:"doublequoteclosing";i:1;a:0:{}i:2;i:2947;}i:66;a:3:{i:0;s:5:"cdata";i:1;a:1:{i:0;s:58:" and will from there call various function located in the ";}i:2;i:2948;}i:67;a:3:{i:0;s:18:"doublequoteopening";i:1;a:0:{}i:2;i:3006;}i:68;a:3:{i:0;s:11:"strong_open";i:1;a:0:{}i:2;i:3007;}i:69;a:3:{i:0;s:12:"externallink";i:1;a:2:{i:0;s:76:"https://github.com/waldenn/conzept/tree/master/app/explore2/src/core/main.js";i:1;s:22:"src/core/lib.js|lib.js";}i:2;i:3009;}i:70;a:3:{i:0;s:12:"strong_close";i:1;a:0:{}i:2;i:3112;}i:71;a:3:{i:0;s:18:"doublequoteclosing";i:1;a:0:{}i:2;i:3114;}i:72;a:3:{i:0;s:5:"cdata";i:1;a:1:{i:0;s:1:".";}i:2;i:3115;}i:73;a:3:{i:0;s:7:"p_close";i:1;a:0:{}i:2;i:3116;}i:74;a:3:{i:0;s:6:"p_open";i:1;a:0:{}i:2;i:3116;}i:75;a:3:{i:0;s:5:"cdata";i:1;a:1:{i:0;s:5:"From ";}i:2;i:3118;}i:76;a:3:{i:0;s:18:"doublequoteopening";i:1;a:0:{}i:2;i:3123;}i:77;a:3:{i:0;s:5:"cdata";i:1;a:1:{i:0;s:7:"main.js";}i:2;i:3124;}i:78;a:3:{i:0;s:18:"doublequoteclosing";i:1;a:0:{}i:2;i:3131;}i:79;a:3:{i:0;s:5:"cdata";i:1;a:1:{i:0;s:1:":";}i:2;i:3132;}i:80;a:3:{i:0;s:7:"p_close";i:1;a:0:{}i:2;i:3134;}i:81;a:3:{i:0;s:10:"listu_open";i:1;a:0:{}i:2;i:3134;}i:82;a:3:{i:0;s:13:"listitem_open";i:1;a:1:{i:0;i:1;}i:2;i:3134;}i:83;a:3:{i:0;s:16:"listcontent_open";i:1;a:0:{}i:2;i:3134;}i:84;a:3:{i:0;s:5:"cdata";i:1;a:1:{i:0;s:9:" All the ";}i:2;i:3138;}i:85;a:3:{i:0;s:7:"acronym";i:1;a:1:{i:0;s:3:"URL";}i:2;i:3147;}i:86;a:3:{i:0;s:5:"cdata";i:1;a:1:{i:0;s:44:" parameters are cleansed, parsed and stored.";}i:2;i:3150;}i:87;a:3:{i:0;s:17:"listcontent_close";i:1;a:0:{}i:2;i:3194;}i:88;a:3:{i:0;s:14:"listitem_close";i:1;a:0:{}i:2;i:3194;}i:89;a:3:{i:0;s:11:"listu_close";i:1;a:0:{}i:2;i:3194;}i:90;a:3:{i:0;s:10:"listu_open";i:1;a:0:{}i:2;i:3195;}i:91;a:3:{i:0;s:13:"listitem_open";i:1;a:1:{i:0;i:1;}i:2;i:3195;}i:92;a:3:{i:0;s:16:"listcontent_open";i:1;a:0:{}i:2;i:3195;}i:93;a:3:{i:0;s:5:"cdata";i:1;a:1:{i:0;s:5:" The ";}i:2;i:3199;}i:94;a:3:{i:0;s:11:"strong_open";i:1;a:0:{}i:2;i:3204;}i:95;a:3:{i:0;s:5:"cdata";i:1;a:1:{i:0;s:14:"global object ";}i:2;i:3206;}i:96;a:3:{i:0;s:18:"doublequoteopening";i:1;a:0:{}i:2;i:3220;}i:97;a:3:{i:0;s:9:"locallink";i:1;a:2:{i:0;s:14:"explore_object";i:1;s:7:"explore";}i:2;i:3221;}i:98;a:3:{i:0;s:18:"doublequoteopening";i:1;a:0:{}i:2;i:3248;}i:99;a:3:{i:0;s:12:"strong_close";i:1;a:0:{}i:2;i:3249;}i:100;a:3:{i:0;s:5:"cdata";i:1;a:1:{i:0;s:68:" is created. The values in this  JS-object can be accessed through: ";}i:2;i:3251;}i:101;a:3:{i:0;s:18:"doublequoteopening";i:1;a:0:{}i:2;i:3319;}i:102;a:3:{i:0;s:11:"strong_open";i:1;a:0:{}i:2;i:3320;}i:103;a:3:{i:0;s:5:"cdata";i:1;a:1:{i:0;s:23:"explore.<property-name>";}i:2;i:3322;}i:104;a:3:{i:0;s:12:"strong_close";i:1;a:0:{}i:2;i:3345;}i:105;a:3:{i:0;s:18:"doublequoteclosing";i:1;a:0:{}i:2;i:3347;}i:106;a:3:{i:0;s:5:"cdata";i:1;a:1:{i:0;s:90:" (see next section). Note: The explore-object is not accessible in the embedded apps, use ";}i:2;i:3348;}i:107;a:3:{i:0;s:7:"acronym";i:1;a:1:{i:0;s:3:"URL";}i:2;i:3438;}i:108;a:3:{i:0;s:5:"cdata";i:1;a:1:{i:0;s:56:"-parameters to pass relevant data into the embedded app.";}i:2;i:3441;}i:109;a:3:{i:0;s:17:"listcontent_close";i:1;a:0:{}i:2;i:3497;}i:110;a:3:{i:0;s:14:"listitem_close";i:1;a:0:{}i:2;i:3497;}i:111;a:3:{i:0;s:11:"listu_close";i:1;a:0:{}i:2;i:3497;}i:112;a:3:{i:0;s:10:"listu_open";i:1;a:0:{}i:2;i:3498;}i:113;a:3:{i:0;s:13:"listitem_open";i:1;a:1:{i:0;i:1;}i:2;i:3498;}i:114;a:3:{i:0;s:16:"listcontent_open";i:1;a:0:{}i:2;i:3498;}i:115;a:3:{i:0;s:5:"cdata";i:1;a:1:{i:0;s:111:" The language and locale are setup (while checking for the language setting in the persistent browser storage).";}i:2;i:3502;}i:116;a:3:{i:0;s:17:"listcontent_close";i:1;a:0:{}i:2;i:3613;}i:117;a:3:{i:0;s:14:"listitem_close";i:1;a:0:{}i:2;i:3613;}i:118;a:3:{i:0;s:11:"listu_close";i:1;a:0:{}i:2;i:3613;}i:119;a:3:{i:0;s:10:"listu_open";i:1;a:0:{}i:2;i:3614;}i:120;a:3:{i:0;s:13:"listitem_open";i:1;a:1:{i:0;i:1;}i:2;i:3614;}i:121;a:3:{i:0;s:16:"listcontent_open";i:1;a:0:{}i:2;i:3614;}i:122;a:3:{i:0;s:5:"cdata";i:1;a:1:{i:0;s:85:" Dynamic UI-element are setup and activated (autocompletion, user settings UI, etc.).";}i:2;i:3618;}i:123;a:3:{i:0;s:17:"listcontent_close";i:1;a:0:{}i:2;i:3703;}i:124;a:3:{i:0;s:14:"listitem_close";i:1;a:0:{}i:2;i:3703;}i:125;a:3:{i:0;s:11:"listu_close";i:1;a:0:{}i:2;i:3703;}i:126;a:3:{i:0;s:10:"listu_open";i:1;a:0:{}i:2;i:3704;}i:127;a:3:{i:0;s:13:"listitem_open";i:1;a:1:{i:0;i:1;}i:2;i:3704;}i:128;a:3:{i:0;s:16:"listcontent_open";i:1;a:0:{}i:2;i:3704;}i:129;a:3:{i:0;s:5:"cdata";i:1;a:1:{i:0;s:31:" Keyboard event-handlers setup.";}i:2;i:3708;}i:130;a:3:{i:0;s:17:"listcontent_close";i:1;a:0:{}i:2;i:3739;}i:131;a:3:{i:0;s:14:"listitem_close";i:1;a:0:{}i:2;i:3739;}i:132;a:3:{i:0;s:11:"listu_close";i:1;a:0:{}i:2;i:3739;}i:133;a:3:{i:0;s:13:"section_close";i:1;a:0:{}i:2;i:3741;}i:134;a:3:{i:0;s:6:"header";i:1;a:3:{i:0;s:14:"explore object";i:1;i:2;i:2;i:3741;}i:2;i:3741;}i:135;a:3:{i:0;s:12:"section_open";i:1;a:1:{i:0;i:2;}i:2;i:3741;}i:136;a:3:{i:0;s:6:"p_open";i:1;a:0:{}i:2;i:3741;}i:137;a:3:{i:0;s:5:"cdata";i:1;a:1:{i:0;s:112:"This is the global data-structure which Conzept uses for the main app. All its values can also be accessed from ";}i:2;i:3769;}i:138;a:3:{i:0;s:12:"internallink";i:1;a:2:{i:0;s:19:"field_customization";i:1;s:17:"field definitions";}i:2;i:3881;}i:139;a:3:{i:0;s:5:"cdata";i:1;a:1:{i:0;s:1:".";}i:2;i:3922;}i:140;a:3:{i:0;s:7:"p_close";i:1;a:0:{}i:2;i:3923;}i:141;a:3:{i:0;s:6:"p_open";i:1;a:0:{}i:2;i:3923;}i:142;a:3:{i:0;s:5:"cdata";i:1;a:1:{i:0;s:57:"Here are some of the important properties on this object:";}i:2;i:3925;}i:143;a:3:{i:0;s:7:"p_close";i:1;a:0:{}i:2;i:3983;}i:144;a:3:{i:0;s:10:"table_open";i:1;a:3:{i:0;i:2;i:1;i:9;i:2;i:3984;}i:2;i:3983;}i:145;a:3:{i:0;s:15:"tablethead_open";i:1;a:0:{}i:2;i:3983;}i:146;a:3:{i:0;s:13:"tablerow_open";i:1;a:0:{}i:2;i:3983;}i:147;a:3:{i:0;s:16:"tableheader_open";i:1;a:3:{i:0;i:1;i:1;s:4:"left";i:2;i:1;}i:2;i:3983;}i:148;a:3:{i:0;s:5:"cdata";i:1;a:1:{i:0;s:15:" property      ";}i:2;i:3985;}i:149;a:3:{i:0;s:17:"tableheader_close";i:1;a:0:{}i:2;i:4000;}i:150;a:3:{i:0;s:16:"tableheader_open";i:1;a:3:{i:0;i:1;i:1;s:4:"left";i:2;i:1;}i:2;i:4000;}i:151;a:3:{i:0;s:5:"cdata";i:1;a:1:{i:0;s:14:" description  ";}i:2;i:4001;}i:152;a:3:{i:0;s:17:"tableheader_close";i:1;a:0:{}i:2;i:4015;}i:153;a:3:{i:0;s:14:"tablerow_close";i:1;a:0:{}i:2;i:4016;}i:154;a:3:{i:0;s:16:"tablethead_close";i:1;a:0:{}i:2;i:4016;}i:155;a:3:{i:0;s:13:"tablerow_open";i:1;a:0:{}i:2;i:4016;}i:156;a:3:{i:0;s:14:"tablecell_open";i:1;a:3:{i:0;i:1;i:1;N;i:2;i:1;}i:2;i:4016;}i:157;a:3:{i:0;s:5:"cdata";i:1;a:1:{i:0;s:9:" explore.";}i:2;i:4018;}i:158;a:3:{i:0;s:11:"strong_open";i:1;a:0:{}i:2;i:4027;}i:159;a:3:{i:0;s:5:"cdata";i:1;a:1:{i:0;s:1:"q";}i:2;i:4029;}i:160;a:3:{i:0;s:12:"strong_close";i:1;a:0:{}i:2;i:4030;}i:161;a:3:{i:0;s:5:"cdata";i:1;a:1:{i:0;s:1:" ";}i:2;i:4032;}i:162;a:3:{i:0;s:15:"tablecell_close";i:1;a:0:{}i:2;i:4033;}i:163;a:3:{i:0;s:14:"tablecell_open";i:1;a:3:{i:0;i:1;i:1;N;i:2;i:1;}i:2;i:4033;}i:164;a:3:{i:0;s:5:"cdata";i:1;a:1:{i:0;s:14:" query string ";}i:2;i:4034;}i:165;a:3:{i:0;s:15:"tablecell_close";i:1;a:0:{}i:2;i:4048;}i:166;a:3:{i:0;s:14:"tablerow_close";i:1;a:0:{}i:2;i:4049;}i:167;a:3:{i:0;s:13:"tablerow_open";i:1;a:0:{}i:2;i:4049;}i:168;a:3:{i:0;s:14:"tablecell_open";i:1;a:3:{i:0;i:1;i:1;N;i:2;i:1;}i:2;i:4049;}i:169;a:3:{i:0;s:5:"cdata";i:1;a:1:{i:0;s:9:" explore.";}i:2;i:4051;}i:170;a:3:{i:0;s:11:"strong_open";i:1;a:0:{}i:2;i:4060;}i:171;a:3:{i:0;s:5:"cdata";i:1;a:1:{i:0;s:8:"language";}i:2;i:4062;}i:172;a:3:{i:0;s:12:"strong_close";i:1;a:0:{}i:2;i:4070;}i:173;a:3:{i:0;s:5:"cdata";i:1;a:1:{i:0;s:1:" ";}i:2;i:4072;}i:174;a:3:{i:0;s:15:"tablecell_close";i:1;a:0:{}i:2;i:4073;}i:175;a:3:{i:0;s:14:"tablecell_open";i:1;a:3:{i:0;i:1;i:1;N;i:2;i:1;}i:2;i:4073;}i:176;a:3:{i:0;s:5:"cdata";i:1;a:1:{i:0;s:18:" content language ";}i:2;i:4074;}i:177;a:3:{i:0;s:15:"tablecell_close";i:1;a:0:{}i:2;i:4092;}i:178;a:3:{i:0;s:14:"tablerow_close";i:1;a:0:{}i:2;i:4093;}i:179;a:3:{i:0;s:13:"tablerow_open";i:1;a:0:{}i:2;i:4093;}i:180;a:3:{i:0;s:14:"tablecell_open";i:1;a:3:{i:0;i:1;i:1;N;i:2;i:1;}i:2;i:4093;}i:181;a:3:{i:0;s:5:"cdata";i:1;a:1:{i:0;s:9:" explore.";}i:2;i:4095;}i:182;a:3:{i:0;s:11:"strong_open";i:1;a:0:{}i:2;i:4104;}i:183;a:3:{i:0;s:5:"cdata";i:1;a:1:{i:0;s:6:"locale";}i:2;i:4106;}i:184;a:3:{i:0;s:12:"strong_close";i:1;a:0:{}i:2;i:4112;}i:185;a:3:{i:0;s:5:"cdata";i:1;a:1:{i:0;s:1:" ";}i:2;i:4114;}i:186;a:3:{i:0;s:15:"tablecell_close";i:1;a:0:{}i:2;i:4115;}i:187;a:3:{i:0;s:14:"tablecell_open";i:1;a:3:{i:0;i:1;i:1;N;i:2;i:1;}i:2;i:4115;}i:188;a:3:{i:0;s:5:"cdata";i:1;a:1:{i:0;s:1:" ";}i:2;i:4116;}i:189;a:3:{i:0;s:12:"internallink";i:1;a:2:{i:0;s:12:"localization";i:1;s:6:"locale";}i:2;i:4117;}i:190;a:3:{i:0;s:5:"cdata";i:1;a:1:{i:0;s:24:" (interface) language ) ";}i:2;i:4140;}i:191;a:3:{i:0;s:15:"tablecell_close";i:1;a:0:{}i:2;i:4164;}i:192;a:3:{i:0;s:14:"tablerow_close";i:1;a:0:{}i:2;i:4165;}i:193;a:3:{i:0;s:13:"tablerow_open";i:1;a:0:{}i:2;i:4165;}i:194;a:3:{i:0;s:14:"tablecell_open";i:1;a:3:{i:0;i:1;i:1;N;i:2;i:1;}i:2;i:4165;}i:195;a:3:{i:0;s:5:"cdata";i:1;a:1:{i:0;s:9:" explore.";}i:2;i:4167;}i:196;a:3:{i:0;s:11:"strong_open";i:1;a:0:{}i:2;i:4176;}i:197;a:3:{i:0;s:5:"cdata";i:1;a:1:{i:0;s:3:"qid";}i:2;i:4178;}i:198;a:3:{i:0;s:12:"strong_close";i:1;a:0:{}i:2;i:4181;}i:199;a:3:{i:0;s:5:"cdata";i:1;a:1:{i:0;s:1:" ";}i:2;i:4183;}i:200;a:3:{i:0;s:15:"tablecell_close";i:1;a:0:{}i:2;i:4184;}i:201;a:3:{i:0;s:14:"tablecell_open";i:1;a:3:{i:0;i:1;i:1;N;i:2;i:1;}i:2;i:4184;}i:202;a:3:{i:0;s:5:"cdata";i:1;a:1:{i:0;s:52:" Wikidata Qid (if any, of the current active topic) ";}i:2;i:4185;}i:203;a:3:{i:0;s:15:"tablecell_close";i:1;a:0:{}i:2;i:4237;}i:204;a:3:{i:0;s:14:"tablerow_close";i:1;a:0:{}i:2;i:4238;}i:205;a:3:{i:0;s:13:"tablerow_open";i:1;a:0:{}i:2;i:4238;}i:206;a:3:{i:0;s:14:"tablecell_open";i:1;a:3:{i:0;i:1;i:1;N;i:2;i:1;}i:2;i:4238;}i:207;a:3:{i:0;s:5:"cdata";i:1;a:1:{i:0;s:9:" explore.";}i:2;i:4240;}i:208;a:3:{i:0;s:11:"strong_open";i:1;a:0:{}i:2;i:4249;}i:209;a:3:{i:0;s:5:"cdata";i:1;a:1:{i:0;s:2:"db";}i:2;i:4251;}i:210;a:3:{i:0;s:12:"strong_close";i:1;a:0:{}i:2;i:4253;}i:211;a:3:{i:0;s:5:"cdata";i:1;a:1:{i:0;s:1:" ";}i:2;i:4255;}i:212;a:3:{i:0;s:15:"tablecell_close";i:1;a:0:{}i:2;i:4256;}i:213;a:3:{i:0;s:14:"tablecell_open";i:1;a:3:{i:0;i:1;i:1;N;i:2;i:1;}i:2;i:4256;}i:214;a:3:{i:0;s:5:"cdata";i:1;a:1:{i:0;s:33:" persistent storage object using ";}i:2;i:4257;}i:215;a:3:{i:0;s:12:"externallink";i:1;a:2:{i:0;s:35:"https://github.com/gruns/ImmortalDB";i:1;s:10:"ImmortalDB";}i:2;i:4290;}i:216;a:3:{i:0;s:15:"tablecell_close";i:1;a:0:{}i:2;i:4340;}i:217;a:3:{i:0;s:14:"tablerow_close";i:1;a:0:{}i:2;i:4341;}i:218;a:3:{i:0;s:13:"tablerow_open";i:1;a:0:{}i:2;i:4341;}i:219;a:3:{i:0;s:14:"tablecell_open";i:1;a:3:{i:0;i:1;i:1;N;i:2;i:1;}i:2;i:4341;}i:220;a:3:{i:0;s:5:"cdata";i:1;a:1:{i:0;s:9:" explore.";}i:2;i:4343;}i:221;a:3:{i:0;s:11:"strong_open";i:1;a:0:{}i:2;i:4352;}i:222;a:3:{i:0;s:5:"cdata";i:1;a:1:{i:0;s:11:"query_param";}i:2;i:4354;}i:223;a:3:{i:0;s:12:"strong_close";i:1;a:0:{}i:2;i:4365;}i:224;a:3:{i:0;s:5:"cdata";i:1;a:1:{i:0;s:1:" ";}i:2;i:4367;}i:225;a:3:{i:0;s:15:"tablecell_close";i:1;a:0:{}i:2;i:4368;}i:226;a:3:{i:0;s:14:"tablecell_open";i:1;a:3:{i:0;i:1;i:1;N;i:2;i:1;}i:2;i:4368;}i:227;a:3:{i:0;s:5:"cdata";i:1;a:1:{i:0;s:1:" ";}i:2;i:4369;}i:228;a:3:{i:0;s:12:"internallink";i:1;a:2:{i:0;s:29:"user_manual#structured_search";i:1;s:17:"structured search";}i:2;i:4370;}i:229;a:3:{i:0;s:5:"cdata";i:1;a:1:{i:0;s:7:" query-";}i:2;i:4421;}i:230;a:3:{i:0;s:7:"acronym";i:1;a:1:{i:0;s:3:"URL";}i:2;i:4428;}i:231;a:3:{i:0;s:5:"cdata";i:1;a:1:{i:0;s:1:" ";}i:2;i:4431;}i:232;a:3:{i:0;s:15:"tablecell_close";i:1;a:0:{}i:2;i:4432;}i:233;a:3:{i:0;s:14:"tablerow_close";i:1;a:0:{}i:2;i:4433;}i:234;a:3:{i:0;s:13:"tablerow_open";i:1;a:0:{}i:2;i:4433;}i:235;a:3:{i:0;s:14:"tablecell_open";i:1;a:3:{i:0;i:1;i:1;N;i:2;i:1;}i:2;i:4433;}i:236;a:3:{i:0;s:5:"cdata";i:1;a:1:{i:0;s:9:" explore.";}i:2;i:4435;}i:237;a:3:{i:0;s:11:"strong_open";i:1;a:0:{}i:2;i:4444;}i:238;a:3:{i:0;s:5:"cdata";i:1;a:1:{i:0;s:4:"hash";}i:2;i:4446;}i:239;a:3:{i:0;s:12:"strong_close";i:1;a:0:{}i:2;i:4450;}i:240;a:3:{i:0;s:5:"cdata";i:1;a:1:{i:0;s:1:" ";}i:2;i:4452;}i:241;a:3:{i:0;s:15:"tablecell_close";i:1;a:0:{}i:2;i:4453;}i:242;a:3:{i:0;s:14:"tablecell_open";i:1;a:3:{i:0;i:1;i:1;N;i:2;i:1;}i:2;i:4453;}i:243;a:3:{i:0;s:5:"cdata";i:1;a:1:{i:0;s:9:" current ";}i:2;i:4454;}i:244;a:3:{i:0;s:7:"acronym";i:1;a:1:{i:0;s:3:"URL";}i:2;i:4463;}i:245;a:3:{i:0;s:5:"cdata";i:1;a:1:{i:0;s:10:"-fragment ";}i:2;i:4466;}i:246;a:3:{i:0;s:15:"tablecell_close";i:1;a:0:{}i:2;i:4476;}i:247;a:3:{i:0;s:14:"tablerow_close";i:1;a:0:{}i:2;i:4477;}i:248;a:3:{i:0;s:13:"tablerow_open";i:1;a:0:{}i:2;i:4477;}i:249;a:3:{i:0;s:14:"tablecell_open";i:1;a:3:{i:0;i:1;i:1;N;i:2;i:1;}i:2;i:4477;}i:250;a:3:{i:0;s:5:"cdata";i:1;a:1:{i:0;s:9:" explore.";}i:2;i:4479;}i:251;a:3:{i:0;s:11:"strong_open";i:1;a:0:{}i:2;i:4488;}i:252;a:3:{i:0;s:5:"cdata";i:1;a:1:{i:0;s:8:"fragment";}i:2;i:4490;}i:253;a:3:{i:0;s:12:"strong_close";i:1;a:0:{}i:2;i:4498;}i:254;a:3:{i:0;s:5:"cdata";i:1;a:1:{i:0;s:1:" ";}i:2;i:4500;}i:255;a:3:{i:0;s:15:"tablecell_close";i:1;a:0:{}i:2;i:4501;}i:256;a:3:{i:0;s:14:"tablecell_open";i:1;a:3:{i:0;i:1;i:1;N;i:2;i:1;}i:2;i:4501;}i:257;a:3:{i:0;s:5:"cdata";i:1;a:1:{i:0;s:59:" sidebar topic-detail-fragment to go to, after loading the ";}i:2;i:4502;}i:258;a:3:{i:0;s:7:"acronym";i:1;a:1:{i:0;s:3:"URL";}i:2;i:4561;}i:259;a:3:{i:0;s:5:"cdata";i:1;a:1:{i:0;s:2:" (";}i:2;i:4564;}i:260;a:3:{i:0;s:12:"externallink";i:1;a:2:{i:0;s:71:"https://conze.pt/explore/London?l=en&t=wikipedia&f=category_tree&s=true";i:1;s:7:"example";}i:2;i:4566;}i:261;a:3:{i:0;s:5:"cdata";i:1;a:1:{i:0;s:2:") ";}i:2;i:4649;}i:262;a:3:{i:0;s:15:"tablecell_close";i:1;a:0:{}i:2;i:4651;}i:263;a:3:{i:0;s:14:"tablerow_close";i:1;a:0:{}i:2;i:4652;}i:264;a:3:{i:0;s:11:"table_close";i:1;a:1:{i:0;i:4652;}i:2;i:4652;}i:265;a:3:{i:0;s:13:"section_close";i:1;a:0:{}i:2;i:4654;}i:266;a:3:{i:0;s:6:"header";i:1;a:3:{i:0;s:8:"API code";i:1;i:2;i:2;i:4654;}i:2;i:4654;}i:267;a:3:{i:0;s:12:"section_open";i:1;a:1:{i:0;i:2;}i:2;i:4654;}i:268;a:3:{i:0;s:6:"p_open";i:1;a:0:{}i:2;i:4654;}i:269;a:3:{i:0;s:5:"cdata";i:1;a:1:{i:0;s:24:"All the (non-essential) ";}i:2;i:4675;}i:270;a:3:{i:0;s:7:"acronym";i:1;a:1:{i:0;s:3:"API";}i:2;i:4699;}i:271;a:3:{i:0;s:5:"cdata";i:1;a:1:{i:0;s:33:" data-fetching code is hosted in ";}i:2;i:4702;}i:272;a:3:{i:0;s:18:"doublequoteopening";i:1;a:0:{}i:2;i:4735;}i:273;a:3:{i:0;s:11:"strong_open";i:1;a:0:{}i:2;i:4736;}i:274;a:3:{i:0;s:12:"externallink";i:1;a:2:{i:0;s:69:"https://github.com/waldenn/conzept/tree/master/app/explore2/src/fetch";i:1;s:22:"app/explore2/src/fetch";}i:2;i:4738;}i:275;a:3:{i:0;s:12:"strong_close";i:1;a:0:{}i:2;i:4834;}i:276;a:3:{i:0;s:18:"doublequoteclosing";i:1;a:0:{}i:2;i:4836;}i:277;a:3:{i:0;s:5:"cdata";i:1;a:1:{i:0;s:40:". There are currently over 40 different ";}i:2;i:4837;}i:278;a:3:{i:0;s:7:"acronym";i:1;a:1:{i:0;s:3:"API";}i:2;i:4877;}i:279;a:3:{i:0;s:5:"cdata";i:1;a:1:{i:0;s:33:" integrations in use for Conzept.";}i:2;i:4880;}i:280;a:3:{i:0;s:7:"p_close";i:1;a:0:{}i:2;i:4913;}i:281;a:3:{i:0;s:6:"p_open";i:1;a:0:{}i:2;i:4913;}i:282;a:3:{i:0;s:11:"strong_open";i:1;a:0:{}i:2;i:4915;}i:283;a:3:{i:0;s:5:"cdata";i:1;a:1:{i:0;s:5:"Each ";}i:2;i:4917;}i:284;a:3:{i:0;s:7:"acronym";i:1;a:1:{i:0;s:3:"API";}i:2;i:4922;}i:285;a:3:{i:0;s:5:"cdata";i:1;a:1:{i:0;s:49:" has its own file, but shares a common structure.";}i:2;i:4925;}i:286;a:3:{i:0;s:12:"strong_close";i:1;a:0:{}i:2;i:4974;}i:287;a:3:{i:0;s:5:"cdata";i:1;a:1:{i:0;s:23:" This makes adding new ";}i:2;i:4976;}i:288;a:3:{i:0;s:7:"acronym";i:1;a:1:{i:0;s:3:"API";}i:2;i:4999;}i:289;a:3:{i:0;s:5:"cdata";i:1;a:1:{i:0;s:99:"'s relatively easy, though it still requires some coding and looking at the data structures of the ";}i:2;i:5002;}i:290;a:3:{i:0;s:7:"acronym";i:1;a:1:{i:0;s:3:"API";}i:2;i:5101;}i:291;a:3:{i:0;s:5:"cdata";i:1;a:1:{i:0;s:18:" returned results.";}i:2;i:5104;}i:292;a:3:{i:0;s:7:"p_close";i:1;a:0:{}i:2;i:5122;}i:293;a:3:{i:0;s:6:"p_open";i:1;a:0:{}i:2;i:5122;}i:294;a:3:{i:0;s:5:"cdata";i:1;a:1:{i:0;s:45:"That common code structure is used to handle:";}i:2;i:5124;}i:295;a:3:{i:0;s:7:"p_close";i:1;a:0:{}i:2;i:5169;}i:296;a:3:{i:0;s:10:"listu_open";i:1;a:0:{}i:2;i:5169;}i:297;a:3:{i:0;s:13:"listitem_open";i:1;a:1:{i:0;i:1;}i:2;i:5169;}i:298;a:3:{i:0;s:16:"listcontent_open";i:1;a:0:{}i:2;i:5169;}i:299;a:3:{i:0;s:5:"cdata";i:1;a:1:{i:0;s:84:" The input arguments (title string, current paging status and sometimes custom data)";}i:2;i:5173;}i:300;a:3:{i:0;s:17:"listcontent_close";i:1;a:0:{}i:2;i:5257;}i:301;a:3:{i:0;s:14:"listitem_close";i:1;a:0:{}i:2;i:5257;}i:302;a:3:{i:0;s:13:"listitem_open";i:1;a:1:{i:0;i:1;}i:2;i:5257;}i:303;a:3:{i:0;s:16:"listcontent_open";i:1;a:0:{}i:2;i:5257;}i:304;a:3:{i:0;s:5:"cdata";i:1;a:1:{i:0;s:55:" Result paging (page size, current page, total results)";}i:2;i:5261;}i:305;a:3:{i:0;s:17:"listcontent_close";i:1;a:0:{}i:2;i:5316;}i:306;a:3:{i:0;s:14:"listitem_close";i:1;a:0:{}i:2;i:5316;}i:307;a:3:{i:0;s:13:"listitem_open";i:1;a:1:{i:0;i:1;}i:2;i:5316;}i:308;a:3:{i:0;s:16:"listcontent_open";i:1;a:0:{}i:2;i:5316;}i:309;a:3:{i:0;s:5:"cdata";i:1;a:1:{i:0;s:27:" Sorting options (optional)";}i:2;i:5320;}i:310;a:3:{i:0;s:17:"listcontent_close";i:1;a:0:{}i:2;i:5347;}i:311;a:3:{i:0;s:14:"listitem_close";i:1;a:0:{}i:2;i:5347;}i:312;a:3:{i:0;s:13:"listitem_open";i:1;a:1:{i:0;i:1;}i:2;i:5347;}i:313;a:3:{i:0;s:16:"listcontent_open";i:1;a:0:{}i:2;i:5347;}i:314;a:3:{i:0;s:5:"cdata";i:1;a:1:{i:0;s:44:" Rendering the returned results into Conzept";}i:2;i:5351;}i:315;a:3:{i:0;s:17:"listcontent_close";i:1;a:0:{}i:2;i:5395;}i:316;a:3:{i:0;s:14:"listitem_close";i:1;a:0:{}i:2;i:5395;}i:317;a:3:{i:0;s:11:"listu_close";i:1;a:0:{}i:2;i:5395;}i:318;a:3:{i:0;s:6:"p_open";i:1;a:0:{}i:2;i:5395;}i:319;a:3:{i:0;s:5:"cdata";i:1;a:1:{i:0;s:13:"To add a new ";}i:2;i:5397;}i:320;a:3:{i:0;s:7:"acronym";i:1;a:1:{i:0;s:3:"API";}i:2;i:5410;}i:321;a:3:{i:0;s:5:"cdata";i:1;a:1:{i:0;s:6:", see ";}i:2;i:5413;}i:322;a:3:{i:0;s:11:"strong_open";i:1;a:0:{}i:2;i:5419;}i:323;a:3:{i:0;s:12:"internallink";i:1;a:2:{i:0;s:18:"integrating an API";i:1;N;}i:2;i:5421;}i:324;a:3:{i:0;s:12:"strong_close";i:1;a:0:{}i:2;i:5443;}i:325;a:3:{i:0;s:5:"cdata";i:1;a:1:{i:0;s:1:".";}i:2;i:5445;}i:326;a:3:{i:0;s:7:"p_close";i:1;a:0:{}i:2;i:5446;}i:327;a:3:{i:0;s:13:"section_close";i:1;a:0:{}i:2;i:5446;}i:328;a:3:{i:0;s:12:"document_end";i:1;a:0:{}i:2;i:5446;}}