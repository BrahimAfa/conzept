a:203:{i:0;a:3:{i:0;s:14:"document_start";i:1;a:0:{}i:2;i:0;}i:1;a:3:{i:0;s:6:"header";i:1;a:3:{i:0;s:12:"installation";i:1;i:1;i:2;i:1;}i:2;i:1;}i:2;a:3:{i:0;s:12:"section_open";i:1;a:1:{i:0;i:1;}i:2;i:1;}i:3;a:3:{i:0;s:6:"plugin";i:1;a:4:{i:0;s:8:"imagebox";i:1;a:2:{i:0;i:1;i:1;a:9:{s:4:"type";s:13:"internalmedia";s:3:"src";s:17:"::ubuntu_logo.png";s:5:"title";s:0:"";s:5:"align";s:5:"right";s:5:"width";i:225;s:6:"height";i:225;s:5:"cache";s:5:"cache";s:7:"linking";s:6:"direct";s:5:"exist";b:1;}}i:2;i:1;i:3;s:29:"[{{ ::ubuntu_logo.png?direct|";}i:2;i:29;}i:4;a:3:{i:0;s:6:"plugin";i:1;a:4:{i:0;s:8:"imagebox";i:1;a:2:{i:0;i:3;i:1;s:11:"Ubuntu logo";}i:2;i:3;i:3;s:11:"Ubuntu logo";}i:2;i:58;}i:5;a:3:{i:0;s:6:"plugin";i:1;a:4:{i:0;s:8:"imagebox";i:1;a:2:{i:0;i:4;i:1;s:3:"}}]";}i:2;i:4;i:3;s:3:"}}]";}i:2;i:69;}i:6;a:3:{i:0;s:6:"p_open";i:1;a:0:{}i:2;i:69;}i:7;a:3:{i:0;s:5:"cdata";i:1;a:1:{i:0;s:66:"Conzept installation documention (written for Ubuntu 2020.04 LTS).";}i:2;i:74;}i:8;a:3:{i:0;s:7:"p_close";i:1;a:0:{}i:2;i:140;}i:9;a:3:{i:0;s:13:"section_close";i:1;a:0:{}i:2;i:142;}i:10;a:3:{i:0;s:6:"header";i:1;a:3:{i:0;s:8:"OS setup";i:1;i:2;i:2;i:142;}i:2;i:142;}i:11;a:3:{i:0;s:12:"section_open";i:1;a:1:{i:0;i:2;}i:2;i:142;}i:12;a:3:{i:0;s:6:"p_open";i:1;a:0:{}i:2;i:142;}i:13;a:3:{i:0;s:5:"cdata";i:1;a:1:{i:0;s:26:"- Install Ubuntu 20.04 LTS";}i:2;i:164;}i:14;a:3:{i:0;s:7:"p_close";i:1;a:0:{}i:2;i:190;}i:15;a:3:{i:0;s:6:"p_open";i:1;a:0:{}i:2;i:190;}i:16;a:3:{i:0;s:5:"cdata";i:1;a:1:{i:0;s:19:"- Set the hostname:";}i:2;i:192;}i:17;a:3:{i:0;s:7:"p_close";i:1;a:0:{}i:2;i:217;}i:18;a:3:{i:0;s:4:"code";i:1;a:3:{i:0;s:7:"sudo su";i:1;N;i:2;N;}i:2;i:217;}i:19;a:3:{i:0;s:4:"code";i:1;a:3:{i:0;s:16:"vi /etc/hostname";i:1;N;i:2;N;}i:2;i:238;}i:20;a:3:{i:0;s:4:"code";i:1;a:3:{i:0;s:10:"reboot now";i:1;N;i:2;N;}i:2;i:268;}i:21;a:3:{i:0;s:6:"p_open";i:1;a:0:{}i:2;i:268;}i:22;a:3:{i:0;s:5:"cdata";i:1;a:1:{i:0;s:30:"- Install additional packages:";}i:2;i:288;}i:23;a:3:{i:0;s:7:"p_close";i:1;a:0:{}i:2;i:324;}i:24;a:3:{i:0;s:4:"code";i:1;a:3:{i:0;s:7:"sudo su";i:1;N;i:2;N;}i:2;i:324;}i:25;a:3:{i:0;s:4:"code";i:1;a:3:{i:0;s:10:"apt update";i:1;N;i:2;N;}i:2;i:345;}i:26;a:3:{i:0;s:4:"code";i:1;a:3:{i:0;s:152:"apt install apache2 apache2-bin apache2-data apache2-utils libapache2-mod-php7.4 libapache2-mod-php libapache2-mod-uwsgi php-fpm snapd nodejs npm sed jq";i:1;N;i:2;N;}i:2;i:369;}i:27;a:3:{i:0;s:13:"section_close";i:1;a:0:{}i:2;i:531;}i:28;a:3:{i:0;s:6:"header";i:1;a:3:{i:0;s:15:"webserver setup";i:1;i:2;i:2;i:531;}i:2;i:531;}i:29;a:3:{i:0;s:12:"section_open";i:1;a:1:{i:0;i:2;}i:2;i:531;}i:30;a:3:{i:0;s:13:"section_close";i:1;a:0:{}i:2;i:560;}i:31;a:3:{i:0;s:6:"header";i:1;a:3:{i:0;s:15:"Install Certbot";i:1;i:3;i:2;i:560;}i:2;i:560;}i:32;a:3:{i:0;s:12:"section_open";i:1;a:1:{i:0;i:3;}i:2;i:560;}i:33;a:3:{i:0;s:4:"code";i:1;a:3:{i:0;s:41:"snap install core; sudo snap refresh core";i:1;N;i:2;N;}i:2;i:592;}i:34;a:3:{i:0;s:4:"code";i:1;a:3:{i:0;s:30:"snap install --classic certbot";i:1;N;i:2;N;}i:2;i:647;}i:35;a:3:{i:0;s:4:"code";i:1;a:3:{i:0;s:40:"ln -s /snap/bin/certbot /usr/bin/certbot";i:1;N;i:2;N;}i:2;i:691;}i:36;a:3:{i:0;s:4:"code";i:1;a:3:{i:0;s:16:"certbot --apache";i:1;N;i:2;N;}i:2;i:745;}i:37;a:3:{i:0;s:4:"code";i:1;a:3:{i:0;s:23:"certbot renew --dry-run";i:1;N;i:2;N;}i:2;i:775;}i:38;a:3:{i:0;s:13:"section_close";i:1;a:0:{}i:2;i:808;}i:39;a:3:{i:0;s:6:"header";i:1;a:3:{i:0;s:33:"setup Apache2 with PHP and HTTP/2";i:1;i:3;i:2;i:808;}i:2;i:808;}i:40;a:3:{i:0;s:12:"section_open";i:1;a:1:{i:0;i:3;}i:2;i:808;}i:41;a:3:{i:0;s:4:"code";i:1;a:3:{i:0;s:87:"a2enmod proxy proxy_http headers expires proxy_fcgi setenvif && service apache2 restart";i:1;N;i:2;N;}i:2;i:858;}i:42;a:3:{i:0;s:4:"code";i:1;a:3:{i:0;s:46:"a2enconf php7.4-fpm && service apache2 restart";i:1;N;i:2;N;}i:2;i:959;}i:43;a:3:{i:0;s:4:"code";i:1;a:3:{i:0;s:42:"a2dismod php7.4 && service apache2 restart";i:1;N;i:2;N;}i:2;i:1019;}i:44;a:3:{i:0;s:4:"code";i:1;a:3:{i:0;s:98:"a2dismod mpm_prefork && a2enmod mpm_event && service apache2 restart && service php7.4-fpm restart";i:1;N;i:2;N;}i:2;i:1075;}i:45;a:3:{i:0;s:4:"code";i:1;a:3:{i:0;s:30:"cd /etc/apache2/sites-enabled/";i:1;N;i:2;N;}i:2;i:1187;}i:46;a:3:{i:0;s:4:"code";i:1;a:3:{i:0;s:120:"wget -O 000-default-le-ssl.conf https://raw.githubusercontent.com/waldenn/conzept/master/000-default-le-ssl.conf.example";i:1;N;i:2;N;}i:2;i:1231;}i:47;a:3:{i:0;s:6:"p_open";i:1;a:0:{}i:2;i:1231;}i:48;a:3:{i:0;s:5:"cdata";i:1;a:1:{i:0;s:56:"Change the YOUR_SERVER_NAME and YOUR_SERVER_HOST values:";}i:2;i:1361;}i:49;a:3:{i:0;s:7:"p_close";i:1;a:0:{}i:2;i:1423;}i:50;a:3:{i:0;s:4:"code";i:1;a:3:{i:0;s:26:"vi 000-default-le-ssl.conf";i:1;N;i:2;N;}i:2;i:1423;}i:51;a:3:{i:0;s:4:"code";i:1;a:3:{i:0;s:13:"a2enmod http2";i:1;N;i:2;N;}i:2;i:1464;}i:52;a:3:{i:0;s:4:"code";i:1;a:3:{i:0;s:20:"apachectl configtest";i:1;N;i:2;N;}i:2;i:1491;}i:53;a:3:{i:0;s:4:"code";i:1;a:3:{i:0;s:23:"service apache2 restart";i:1;N;i:2;N;}i:2;i:1525;}i:54;a:3:{i:0;s:6:"p_open";i:1;a:0:{}i:2;i:1525;}i:55;a:3:{i:0;s:5:"cdata";i:1;a:1:{i:0;s:33:"Remove the default Apache-server ";}i:2;i:1558;}i:56;a:3:{i:0;s:7:"acronym";i:1;a:1:{i:0;s:4:"HTML";}i:2;i:1591;}i:57;a:3:{i:0;s:5:"cdata";i:1;a:1:{i:0;s:6:" file:";}i:2;i:1595;}i:58;a:3:{i:0;s:7:"p_close";i:1;a:0:{}i:2;i:1607;}i:59;a:3:{i:0;s:4:"code";i:1;a:3:{i:0;s:27:"rm /var/www/html/index.html";i:1;N;i:2;N;}i:2;i:1607;}i:60;a:3:{i:0;s:13:"section_close";i:1;a:0:{}i:2;i:1644;}i:61;a:3:{i:0;s:6:"header";i:1;a:3:{i:0;s:10:"Node setup";i:1;i:2;i:2;i:1644;}i:2;i:1644;}i:62;a:3:{i:0;s:12:"section_open";i:1;a:1:{i:0;i:2;}i:2;i:1644;}i:63;a:3:{i:0;s:4:"code";i:1;a:3:{i:0;s:4:"exit";i:1;N;i:2;N;}i:2;i:1673;}i:64;a:3:{i:0;s:4:"code";i:1;a:3:{i:0;s:2:"cd";i:1;N;i:2;N;}i:2;i:1691;}i:65;a:3:{i:0;s:4:"code";i:1;a:3:{i:0;s:79:"curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash";i:1;N;i:2;N;}i:2;i:1707;}i:66;a:3:{i:0;s:4:"code";i:1;a:3:{i:0;s:6:"logout";i:1;N;i:2;N;}i:2;i:1801;}i:67;a:3:{i:0;s:6:"p_open";i:1;a:0:{}i:2;i:1801;}i:68;a:3:{i:0;s:5:"cdata";i:1;a:1:{i:0;s:52:"(then log in again, to reload the shell environment)";}i:2;i:1817;}i:69;a:3:{i:0;s:7:"p_close";i:1;a:0:{}i:2;i:1869;}i:70;a:3:{i:0;s:6:"p_open";i:1;a:0:{}i:2;i:1869;}i:71;a:3:{i:0;s:5:"cdata";i:1;a:1:{i:0;s:104:"Install the node version manager (note: you can check for newer LTS vresions by running: nvm ls-remote):";}i:2;i:1871;}i:72;a:3:{i:0;s:7:"p_close";i:1;a:0:{}i:2;i:1975;}i:73;a:3:{i:0;s:4:"code";i:1;a:3:{i:0;s:20:"nvm install v16.13.1";i:1;N;i:2;N;}i:2;i:1982;}i:74;a:3:{i:0;s:4:"code";i:1;a:3:{i:0;s:6:"logout";i:1;N;i:2;N;}i:2;i:2017;}i:75;a:3:{i:0;s:6:"p_open";i:1;a:0:{}i:2;i:2017;}i:76;a:3:{i:0;s:5:"cdata";i:1;a:1:{i:0;s:52:"(then log in again, to reload the shell environment)";}i:2;i:2033;}i:77;a:3:{i:0;s:7:"p_close";i:1;a:0:{}i:2;i:2085;}i:78;a:3:{i:0;s:4:"code";i:1;a:3:{i:0;s:99:"sudo npm install -g minify minify-json clean-css-cli @swc/cli @swc/core webpack webpack-cli esbuild";i:1;N;i:2;N;}i:2;i:2092;}i:79;a:3:{i:0;s:13:"section_close";i:1;a:0:{}i:2;i:2200;}i:80;a:3:{i:0;s:6:"header";i:1;a:3:{i:0;s:13:"Conzept setup";i:1;i:2;i:2;i:2200;}i:2;i:2200;}i:81;a:3:{i:0;s:12:"section_open";i:1;a:1:{i:0;i:2;}i:2;i:2200;}i:82;a:3:{i:0;s:4:"code";i:1;a:3:{i:0;s:48:"git clone https://github.com/waldenn/conzept.git";i:1;N;i:2;N;}i:2;i:2232;}i:83;a:3:{i:0;s:4:"code";i:1;a:3:{i:0;s:10:"cd conzept";i:1;N;i:2;N;}i:2;i:2294;}i:84;a:3:{i:0;s:4:"code";i:1;a:3:{i:0;s:7:"sudo su";i:1;N;i:2;N;}i:2;i:2318;}i:85;a:3:{i:0;s:4:"code";i:1;a:3:{i:0;s:22:"cp -r * /var/www/html/";i:1;N;i:2;N;}i:2;i:2339;}i:86;a:3:{i:0;s:4:"code";i:1;a:3:{i:0;s:27:"cp .htaccess /var/www/html/";i:1;N;i:2;N;}i:2;i:2375;}i:87;a:3:{i:0;s:4:"code";i:1;a:3:{i:0;s:40:"chown -R www-data:www-data /var/www/html";i:1;N;i:2;N;}i:2;i:2416;}i:88;a:3:{i:0;s:4:"code";i:1;a:3:{i:0;s:27:"chmod -R g+rw /var/www/html";i:1;N;i:2;N;}i:2;i:2470;}i:89;a:3:{i:0;s:6:"p_open";i:1;a:0:{}i:2;i:2470;}i:90;a:3:{i:0;s:5:"cdata";i:1;a:1:{i:0;s:20:"Add yourself to the ";}i:2;i:2507;}i:91;a:3:{i:0;s:18:"doublequoteopening";i:1;a:0:{}i:2;i:2527;}i:92;a:3:{i:0;s:5:"cdata";i:1;a:1:{i:0;s:8:"www-data";}i:2;i:2528;}i:93;a:3:{i:0;s:18:"doublequoteclosing";i:1;a:0:{}i:2;i:2536;}i:94;a:3:{i:0;s:5:"cdata";i:1;a:1:{i:0;s:43:" group (so you can make edits as yourself):";}i:2;i:2537;}i:95;a:3:{i:0;s:7:"p_close";i:1;a:0:{}i:2;i:2586;}i:96;a:3:{i:0;s:4:"code";i:1;a:3:{i:0;s:35:"usermod -a -G www-data YOUR_USER_ID";i:1;N;i:2;N;}i:2;i:2586;}i:97;a:3:{i:0;s:4:"code";i:1;a:3:{i:0;s:6:"logout";i:1;N;i:2;N;}i:2;i:2635;}i:98;a:3:{i:0;s:6:"p_open";i:1;a:0:{}i:2;i:2635;}i:99;a:3:{i:0;s:5:"cdata";i:1;a:1:{i:0;s:52:"(then log in again, to reload the shell environment)";}i:2;i:2651;}i:100;a:3:{i:0;s:7:"p_close";i:1;a:0:{}i:2;i:2703;}i:101;a:3:{i:0;s:4:"code";i:1;a:3:{i:0;s:29:"cd /var/www/html/app/explore2";i:1;N;i:2;N;}i:2;i:2710;}i:102;a:3:{i:0;s:4:"code";i:1;a:3:{i:0;s:11:"npm install";i:1;N;i:2;N;}i:2;i:2753;}i:103;a:3:{i:0;s:4:"code";i:1;a:3:{i:0;s:13:"npm run build";i:1;N;i:2;N;}i:2;i:2778;}i:104;a:3:{i:0;s:10:"listu_open";i:1;a:0:{}i:2;i:2800;}i:105;a:3:{i:0;s:13:"listitem_open";i:1;a:1:{i:0;i:1;}i:2;i:2800;}i:106;a:3:{i:0;s:16:"listcontent_open";i:1;a:0:{}i:2;i:2800;}i:107;a:3:{i:0;s:5:"cdata";i:1;a:1:{i:0;s:32:" OPTIONAL: edit the settings in ";}i:2;i:2804;}i:108;a:3:{i:0;s:18:"doublequoteopening";i:1;a:0:{}i:2;i:2836;}i:109;a:3:{i:0;s:5:"cdata";i:1;a:1:{i:0;s:26:"/etc/conzept/settings.conf";}i:2;i:2837;}i:110;a:3:{i:0;s:18:"doublequoteclosing";i:1;a:0:{}i:2;i:2863;}i:111;a:3:{i:0;s:5:"cdata";i:1;a:1:{i:0;s:9:" and run ";}i:2;i:2864;}i:112;a:3:{i:0;s:18:"doublequoteopening";i:1;a:0:{}i:2;i:2873;}i:113;a:3:{i:0;s:5:"cdata";i:1;a:1:{i:0;s:13:"npm run build";}i:2;i:2874;}i:114;a:3:{i:0;s:18:"doublequoteclosing";i:1;a:0:{}i:2;i:2887;}i:115;a:3:{i:0;s:5:"cdata";i:1;a:1:{i:0;s:6:" again";}i:2;i:2888;}i:116;a:3:{i:0;s:17:"listcontent_close";i:1;a:0:{}i:2;i:2894;}i:117;a:3:{i:0;s:14:"listitem_close";i:1;a:0:{}i:2;i:2894;}i:118;a:3:{i:0;s:11:"listu_close";i:1;a:0:{}i:2;i:2894;}i:119;a:3:{i:0;s:10:"listu_open";i:1;a:0:{}i:2;i:2895;}i:120;a:3:{i:0;s:13:"listitem_open";i:1;a:2:{i:0;i:1;i:1;i:1;}i:2;i:2895;}i:121;a:3:{i:0;s:16:"listcontent_open";i:1;a:0:{}i:2;i:2895;}i:122;a:3:{i:0;s:5:"cdata";i:1;a:1:{i:0;s:72:" NOTE: any modifications to the CONZEPT_WEB_BASE also requires changing:";}i:2;i:2899;}i:123;a:3:{i:0;s:17:"listcontent_close";i:1;a:0:{}i:2;i:2971;}i:124;a:3:{i:0;s:10:"listu_open";i:1;a:0:{}i:2;i:2971;}i:125;a:3:{i:0;s:13:"listitem_open";i:1;a:1:{i:0;i:2;}i:2;i:2971;}i:126;a:3:{i:0;s:16:"listcontent_open";i:1;a:0:{}i:2;i:2971;}i:127;a:3:{i:0;s:5:"cdata";i:1;a:1:{i:0;s:23:" the Apache site config";}i:2;i:2977;}i:128;a:3:{i:0;s:17:"listcontent_close";i:1;a:0:{}i:2;i:3000;}i:129;a:3:{i:0;s:14:"listitem_close";i:1;a:0:{}i:2;i:3000;}i:130;a:3:{i:0;s:13:"listitem_open";i:1;a:1:{i:0;i:2;}i:2;i:3000;}i:131;a:3:{i:0;s:16:"listcontent_open";i:1;a:0:{}i:2;i:3000;}i:132;a:3:{i:0;s:5:"cdata";i:1;a:1:{i:0;s:24:" the root .htaccess file";}i:2;i:3006;}i:133;a:3:{i:0;s:17:"listcontent_close";i:1;a:0:{}i:2;i:3030;}i:134;a:3:{i:0;s:14:"listitem_close";i:1;a:0:{}i:2;i:3030;}i:135;a:3:{i:0;s:13:"listitem_open";i:1;a:1:{i:0;i:2;}i:2;i:3030;}i:136;a:3:{i:0;s:16:"listcontent_open";i:1;a:0:{}i:2;i:3030;}i:137;a:3:{i:0;s:5:"cdata";i:1;a:1:{i:0;s:28:" the root manifest.json file";}i:2;i:3036;}i:138;a:3:{i:0;s:17:"listcontent_close";i:1;a:0:{}i:2;i:3064;}i:139;a:3:{i:0;s:14:"listitem_close";i:1;a:0:{}i:2;i:3064;}i:140;a:3:{i:0;s:11:"listu_close";i:1;a:0:{}i:2;i:3064;}i:141;a:3:{i:0;s:14:"listitem_close";i:1;a:0:{}i:2;i:3064;}i:142;a:3:{i:0;s:11:"listu_close";i:1;a:0:{}i:2;i:3064;}i:143;a:3:{i:0;s:13:"section_close";i:1;a:0:{}i:2;i:3065;}i:144;a:3:{i:0;s:6:"header";i:1;a:3:{i:0;s:22:"Conzept services setup";i:1;i:2;i:2;i:3065;}i:2;i:3065;}i:145;a:3:{i:0;s:12:"section_open";i:1;a:1:{i:0;i:2;}i:2;i:3065;}i:146;a:3:{i:0;s:4:"code";i:1;a:3:{i:0;s:7:"sudo su";i:1;N;i:2;N;}i:2;i:3106;}i:147;a:3:{i:0;s:6:"p_open";i:1;a:0:{}i:2;i:3106;}i:148;a:3:{i:0;s:5:"cdata";i:1;a:1:{i:0;s:58:"Create a services startup script (using the example below)";}i:2;i:3123;}i:149;a:3:{i:0;s:7:"p_close";i:1;a:0:{}i:2;i:3187;}i:150;a:3:{i:0;s:4:"code";i:1;a:3:{i:0;s:16:"vi /etc/rc.local";i:1;N;i:2;N;}i:2;i:3187;}i:151;a:3:{i:0;s:6:"p_open";i:1;a:0:{}i:2;i:3187;}i:152;a:3:{i:0;s:5:"cdata";i:1;a:1:{i:0;s:8:"Example:";}i:2;i:3213;}i:153;a:3:{i:0;s:7:"p_close";i:1;a:0:{}i:2;i:3221;}i:154;a:3:{i:0;s:4:"file";i:1;a:3:{i:0;s:423:"
#!/bin/sh -e

# read conzept settings
. /etc/conzept/settings.conf

# JSON CORS-proxy (with secret-API-key support, port 50001 on localhost only)
su conzept -s /bin/sh -c '$CONZEPT_SERVICES_DIR/json-proxy/bin/json-proxy -p 50001 -c $CONZEPT_SERVICES_DIR/json-proxy.json &'

# any-file CORS-proxy (port 1458 on localhpst only)
su conzept -s /bin/sh -c 'cd "$CONZEPT_SERVICES_DIR/allorigins" && npm start app.js &'

exit 0;
";i:1;N;i:2;N;}i:2;i:3228;}i:155;a:3:{i:0;s:6:"p_open";i:1;a:0:{}i:2;i:3228;}i:156;a:3:{i:0;s:5:"cdata";i:1;a:1:{i:0;s:19:"Make it executable:";}i:2;i:3661;}i:157;a:3:{i:0;s:7:"p_close";i:1;a:0:{}i:2;i:3686;}i:158;a:3:{i:0;s:4:"code";i:1;a:3:{i:0;s:22:"chmod +x /etc/rc.local";i:1;N;i:2;N;}i:2;i:3686;}i:159;a:3:{i:0;s:6:"p_open";i:1;a:0:{}i:2;i:3686;}i:160;a:3:{i:0;s:5:"cdata";i:1;a:1:{i:0;s:36:"Setup crontab for periodic commands:";}i:2;i:3718;}i:161;a:3:{i:0;s:7:"p_close";i:1;a:0:{}i:2;i:3754;}i:162;a:3:{i:0;s:4:"code";i:1;a:3:{i:0;s:10:"crontab -e";i:1;N;i:2;N;}i:2;i:3761;}i:163;a:3:{i:0;s:6:"p_open";i:1;a:0:{}i:2;i:3761;}i:164;a:3:{i:0;s:5:"cdata";i:1;a:1:{i:0;s:8:"Example:";}i:2;i:3781;}i:165;a:3:{i:0;s:7:"p_close";i:1;a:0:{}i:2;i:3789;}i:166;a:3:{i:0;s:4:"file";i:1;a:3:{i:0;s:471:"
# check every day at 10:30 if a certificate renewal is needed
30 10 * * * sudo certbot renew >> /tmp/certbot-cron.log > /dev/null 2>&1

# read conzept settings daily
0 5 * * * . /etc/conzept/settings.conf

# fetch conzept-cover-data for the previous month (we wait until the second day of the month, so the Wikipedia stats are available)
0 0 2 * * su - www-data -s /bin/sh -c cd $CONZEPT_WEB_DIR$CONZEPT_BASE_DIR/app/explore2/tools/ && sh ./get_previous_month_covers.sh
";i:1;N;i:2;N;}i:2;i:3796;}i:167;a:3:{i:0;s:6:"p_open";i:1;a:0:{}i:2;i:3796;}i:168;a:3:{i:0;s:5:"cdata";i:1;a:1:{i:0;s:39:"Manually fetch the initial covers once:";}i:2;i:4277;}i:169;a:3:{i:0;s:7:"p_close";i:1;a:0:{}i:2;i:4322;}i:170;a:3:{i:0;s:4:"code";i:1;a:3:{i:0;s:160:". /etc/conzept/settings.conf && sudo su - www-data -s /bin/sh -c "cd $CONZEPT_WEB_DIR$CONZEPT_BASE_DIR/app/explore2/tools/ && sh ./get_previous_month_covers.sh"";i:1;N;i:2;N;}i:2;i:4322;}i:171;a:3:{i:0;s:6:"p_open";i:1;a:0:{}i:2;i:4322;}i:172;a:3:{i:0;s:5:"cdata";i:1;a:1:{i:0;s:34:"Startup the services by rebooting:";}i:2;i:4492;}i:173;a:3:{i:0;s:7:"p_close";i:1;a:0:{}i:2;i:4532;}i:174;a:3:{i:0;s:4:"code";i:1;a:3:{i:0;s:15:"sudo reboot now";i:1;N;i:2;N;}i:2;i:4532;}i:175;a:3:{i:0;s:13:"section_close";i:1;a:0:{}i:2;i:4557;}i:176;a:3:{i:0;s:6:"header";i:1;a:3:{i:0;s:30:"Conzept-extra setup (optional)";i:1;i:2;i:2;i:4557;}i:2;i:4557;}i:177;a:3:{i:0;s:12:"section_open";i:1;a:1:{i:0;i:2;}i:2;i:4557;}i:178;a:3:{i:0;s:6:"p_open";i:1;a:0:{}i:2;i:4557;}i:179;a:3:{i:0;s:5:"cdata";i:1;a:1:{i:0;s:158:"This setup part is only required if you want to build and modify certain NPM-build conzept apps (there are currently seven apps and one library in this repo).";}i:2;i:4600;}i:180;a:3:{i:0;s:7:"p_close";i:1;a:0:{}i:2;i:4758;}i:181;a:3:{i:0;s:4:"code";i:1;a:3:{i:0;s:54:"git clone https://github.com/waldenn/conzept-extra.git";i:1;N;i:2;N;}i:2;i:4765;}i:182;a:3:{i:0;s:4:"code";i:1;a:3:{i:0;s:16:"cd conzept-extra";i:1;N;i:2;N;}i:2;i:4834;}i:183;a:3:{i:0;s:6:"p_open";i:1;a:0:{}i:2;i:4834;}i:184;a:3:{i:0;s:5:"cdata";i:1;a:1:{i:0;s:68:"You can now modify, build and deploy out-of-tree Conzept apps. Just ";}i:2;i:4860;}i:185;a:3:{i:0;s:18:"doublequoteopening";i:1;a:0:{}i:2;i:4928;}i:186;a:3:{i:0;s:5:"cdata";i:1;a:1:{i:0;s:2:"cd";}i:2;i:4929;}i:187;a:3:{i:0;s:18:"doublequoteclosing";i:1;a:0:{}i:2;i:4931;}i:188;a:3:{i:0;s:5:"cdata";i:1;a:1:{i:0;s:69:" into each directory and follow the build instructions. Then use the ";}i:2;i:4932;}i:189;a:3:{i:0;s:18:"doublequoteopening";i:1;a:0:{}i:2;i:5001;}i:190;a:3:{i:0;s:5:"cdata";i:1;a:1:{i:0;s:22:"npm run conzept-deploy";}i:2;i:5002;}i:191;a:3:{i:0;s:18:"doublequoteclosing";i:1;a:0:{}i:2;i:5024;}i:192;a:3:{i:0;s:5:"cdata";i:1;a:1:{i:0;s:89:" within each app directory, to insert the build-artifacts into the Conzept web directory.";}i:2;i:5025;}i:193;a:3:{i:0;s:7:"p_close";i:1;a:0:{}i:2;i:5114;}i:194;a:3:{i:0;s:6:"p_open";i:1;a:0:{}i:2;i:5114;}i:195;a:3:{i:0;s:5:"cdata";i:1;a:1:{i:0;s:68:"(TODO: read Conzept environment file and use these settings for the ";}i:2;i:5116;}i:196;a:3:{i:0;s:18:"doublequoteopening";i:1;a:0:{}i:2;i:5184;}i:197;a:3:{i:0;s:5:"cdata";i:1;a:1:{i:0;s:14:"conzept-deploy";}i:2;i:5185;}i:198;a:3:{i:0;s:18:"doublequoteclosing";i:1;a:0:{}i:2;i:5199;}i:199;a:3:{i:0;s:5:"cdata";i:1;a:1:{i:0;s:9:" action.)";}i:2;i:5200;}i:200;a:3:{i:0;s:7:"p_close";i:1;a:0:{}i:2;i:5209;}i:201;a:3:{i:0;s:13:"section_close";i:1;a:0:{}i:2;i:5209;}i:202;a:3:{i:0;s:12:"document_end";i:1;a:0:{}i:2;i:5209;}}