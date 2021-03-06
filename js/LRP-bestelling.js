﻿    // read url parameters
    var urlParams;
    (window.onpopstate = function () {
        var match,
            pl     = /\+/g,  // Regex for replacing addition symbol with a space
            search = /([^&=]+)=?([^&]*)/g,
            decode = function (s) { return decodeURIComponent(s.replace(pl, " ")); },
            query  = window.location.search.substring(1);

        urlParams = {};
        while (match = search.exec(query))
            urlParams[decode(match[1])] = decode(match[2]);
    })();

    // productlijst t.b.v. kostenindicatie
    var productperbestelling = [
    { id: 96000000, product: "Per bestelling", price: 25 },
    { id: 96000005, product: "Inbrengen brief", price: 60 },
    { id: 96001000, product: "Inpakken", price: "12,50" },
    { id: 96000018, product: "Looplijst", price: 25 },
    { id: 96000019, product: "Opmaak brief", price: 60 },            // logo's of plaatjes buiten LRP om
    { id: 96000024, product: "Looplijst via e-mail", price: 25 },
    { id: 96001101, product: "Verzenden per pakket", price: 7 },
    { id: 96003008, product: "Aut. incasso (per jaar)", price: 225 }
    ];

    var productperstuk = [
    { id: 96000006, product: "Printen", price: "0,09" },            // adrukken blanco A4
    { id: 96000035, product: "Printen", price: "0,10" },            // afdrukken PKN briefpapier
    { id: 96000007, product: "Printen", price: "0,08" },            // afdrukken acceptgiro
    { id: 96000003, product: "Printen", price: "0,16" },            // afdrukken combola blanco
    { id: 96000004, product: "Printen", price: "0,17" },            // afdrukken combola PKN-logo
    { id: 96000020, product: "Printen bijlage", price: "0,07" },    // afdrukken bijlage enkelzijdig zwart-wit
    { id: 96000021, product: "Printen bijlage", price: "0,10" },    // afdrukken bijlage dubbelzijdig zwart-wit
    { id: 96000022, product: "Printen bijlage", price: "0,25" },    // afdrukken bijlage enkelzijdig kleur
    { id: 96000023, product: "Printen bijlage", price: "0,45" },    // afdrukken bijlage dubbelzijdig kleur
    { id: 96000122, product: "Antw.Env. bijvoegen", price: "0,01" }, // antwoordenvelop uit gemeente
    { id: 96000148, product: "Bijsluiter", price: "0,02" },         // bijsluiter kopie toezegging
    { id: 96000153, product: "Folder bijvoegen", price: "0,01" },   // folder Solidariteitskas
    { id: 96000101, product: "Envelop", price: "0,00" },            // envelop via gemeente
    { id: 96000108, product: "Envelop", price: "0,04" },            // envelop blanco
    { id: 96000109, product: "Envelop", price: "0,25" },            // envelop printstudio
    { id: 96000106, product: "Envelop", price: "0,05" },            // envelop PKN
    { id: 96000104, product: "Envelop", price: "0,07" },            // C5-envelop PKN
    { id: 96000123, product: "Antw.Env. aangepast", price: "0,25" }, // antwoordenvelop via printstudio
    { id: 96000150, product: "Antw.env. bijvoegen", price: "0,01" },   // Antw.env. via gemeente / VKB
    { id: 96000130, product: "Brief bijvoegen", price: "0,01" },   // Brief via gemeente
    { id: 96000140, product: "Bijsluiter bijvoegen", price: "0,01" },   // Bijsluiter via gemeente
    { id: 96000151, product: "Folder bijvoegen", price: "0,01" },   // folder via gemeente / VKB
    { id: 96000157, product: "Antw.Env. standaard", price: "0,07" }, // antwoordenvelop Uw antw. wordt opgehaald
    { id: 96001001, product: "Inpakken", price: "0,02" },
    { id: 96001004, product: "Schoonsnijden", price: "0,02" },
    { id: 96001102, product: "Verzenden", price: "0,60" }
    ];
    
    // if fieldset was already .hasRequired, do nothing, else: add star and class
    $.fn.addReq2Fs = function(target) {
	    if(target.is('.hasRequired')) {
	        return true;
	    } else {
	    	target.append('<span class="star" title="Dit is een verplicht veld"> *</span>').addClass("hasRequired");
	    }
	};
		
    // set required, add star to question; add star and class to fieldset using addReq2Fs
	$.fn.addRequired = function(target) {
	    target.prop("required", true);
	    target.parent('.Answer').prev('.Question').append('<span class="star" title="Dit is een verplicht veld"> *</span>');
	    target.closest('fieldset').addReq2Fs(this);
	};
	
    // tell IE stat redio has changed without waiting for focus-out
    function radioClick(){
        this.blur();
        this.focus();
    };
 
    // bij iedere form: als goed ingevuld, naar volgende, dat is volgende fieldset met class=type bestelling
    function processActieNaam(){
        $('form').bind("onSuccess", function(e, inputs) {
            if (e.originalEvent.type == 'submit') {
                var actie = $('[name="ActieNaam"]:checked').attr('data-fsclass');
                var thisFs = $('fieldset:visible');
                var nextFs = $(thisFs).nextAll('fieldset').filter('.' + actie).first();
                //alert('actie: ' + actie + '\nnextFs: ' + $(nextFs).prop('id'));
                $(thisFs).fadeToggle(400, function() {
                $(nextFs).fadeToggle(400)});
                $('#errorBox').hide();
            }
            // indien AKB, blijft C5-VKB mogelijk, maar wel afstemmen
            if (actie !== "AKB") {
                $('option[value="C5-VKB"]').prop('disabled', true);
				$('option[value="Venster-PPS"]').prop('disabled', true);
				$('option[value="C5-PPS"]').prop('disabled', true);
            }
            
            $('.bestellingstekst').find('textarea').prop('value', ''); // voorkomt append in textarea, whytf het niet vervangt weet ik niet
            showOrder('below');
            e.preventDefault();
        });
    }
    
    function showOrder(actie){
        if(actie == "below"){
            var eol = '</p><p style="padding: 0; margin: 0;">'; // regeleinde om in browser te tonen
        } else if(actie == "returnpdf"){
            // jspdf geeft geen regeleindes na \r of \n of <br>, dus dan elke regel eindigen met </div><div>
            // het worden allemaal divjes, die gaan wél op een regel. 
            // bij output zorgen dat eerst <div> wordt meegegeven vóór results
            // TODO: lange bestellingen worden in pdf afgekapt, daarom ';' als delimiter en alles op één regel
            var returntag = '<div>'
            var closereturntag = '</div>'
            var eol = closereturntag + returntag; // regeleinde om te returnen
        } else {
            var eol = '%0D%0A'; // regeleinde om via mailto in mail te plakken
        };
        var FinActie = $('[name="ActieNaam"]:checked').val();
        if( FinActie == "Overig" ){
            FinActie = $('#AdhocActie').val();
        };
        var results = "Bestelling: " + FinActie + eol + eol;
        var fsClass = $('[name="ActieNaam"]:checked').data('fsclass');
        
        $('fieldset.' + fsClass).find('input,select,textarea').each( function(){
            if($(this).prop('type') == "hidden" || $(this).prop('type') == "submit" || $(this).prop('disabled')){
                return true;
            } else if($(this).prop('type') == "radio"){
                if($(this).prop('checked') == true){
                    results += this.name + ": " + this.value + eol;
                }
            } else if($(this).prop('type') == "checkbox"){
                if($(this).prop('checked') == true){
                    results += this.name + ": " + this.value + eol;
                }
            } else if($(this).prop('type') == "text" || $(this).prop('type') == "number" || $(this).prop('type') == "email"){
                if($(this).val() != 0){
                    results += this.name + ": " + this.value + eol;
                }
            } else if($(this).val() != 0){
                results += this.name + ": " + this.value + eol;
            }
        });
        if("M" in urlParams){
            results += $('#BesteldViaKBnl').html() + eol; // Bestelde producten via kerkbalans.nl
            results += 'Bestelnummer: ' + urlParams['M'] + eol; // Magentonummer via kerkbalans.nl
            results += 'URL: ' + window.location.href + eol; // add url in case #BesteldViaKBnl is broken
        }
        
        results += eol + "UserAgent: " + navigator.userAgent + eol;
        if(actie == "below"){
            $('.bestellingstekst').hide();
            $('.bestellingstekst').html('<div id="editable" contentEditable onclick="$(this).selectText()">' + results + '</div>');
            $('.bestellingstekst').show();
        } else if(actie == "returnpdf"){
            return returntag + results + closereturntag;
        } else {
            // ampersands vervangen, anders klopt mailto link niet (%-tekens blijven problematisch)
            mailbody = results.replace(/&/gi, "%26");
            mailsubject = "Bestelling%20" + FinActie + "%20" + $('#Gemnm').val().replace(/&/gi, "%26");
            window.location = "mailto:lrp-order@pkn.nl?subject=" + mailsubject + "&body=" + mailbody;
        };
    };

    // functie om tekst van getoonde bestelling te kunnen selecteren en kopiëren
    jQuery.fn.selectText = function(){
        var doc = document;
        var element = this[0];
        console.log(this, element);
        if (doc.body.createTextRange) {
            var range = document.body.createTextRange();
            range.moveToElementText(element);
            range.select();
        } else if (window.getSelection) {
            var selection = window.getSelection();        
            var range = document.createRange();
            range.selectNodeContents(element);
            selection.removeAllRanges();
            selection.addRange(range);
        }
    };

    function processBetaalwijze(ac, ai, id, ov){
        if(ac){
            $('#AkbAcceptgiro').prop('disabled', false);
        } else {
            $('#AkbAcceptgiro').prop('disabled', true);
        };
        if(ai){
            $('#AkbIncasso').prop('disabled', false);
        } else {
            $('#AkbIncasso').prop('disabled', true);
        };
        if(id){
            $('#AkbIdeal').prop('disabled', false);
        } else {
            $('#AkbIdeal').prop('disabled', true);
        };
    };
    
    function processSKTweeBestellingen(checked){
        if(checked){
            $('.BLDLA').show();
            $('#SK-BL').hide();
            $('#SK-selectie-uitleg').hide();
            //TODO?: kosten bestelling + inpakken + verzending x2
        } else {
            $('.BLDLA').hide();
            $('#SK-BL').show();
            $('#SK-selectie-uitleg').show();
            //TODO?: kosten bestelling + inpakken + verzending :2
        }
    };
    
    function processVerzendwijze(wijze){
        $('select#Env').prop('selectedIndex', null); // bij wijzigen verzendwijze ook enveloppen opnieuw kiezen
        if(wijze == "AfleverAdres"){
            $('#labelAA')
                .append('<span class="star starAtAA" title="Dit is een verplicht veld">&nbsp;&nbsp;*</span>');
            $('div.KB-Afleveradres')
                .find('input')
                .prop('disabled', false)
                .prop('required', true)
                .not('#PostNaam').attr('data-message', ' ');
            $('.AAshow').css('display', 'block');
            document.getElementById('optionEnvGeen').removeAttribute('disabled');
            document.getElementById('Sort').selectedIndex = 0; // set to default value
        } else if(wijze == "PortBetaald"){
            $('.AAshow').css('display', 'none');
            $('.AAopts').prop('disabled', true);
            Qopen = document.getElementById('EnvOpen');
            Qopen.checked = false;
            $(Qopen).prop('disabled', true);
            $('div.KB-Afleveradres').find('input')
                .prop('disabled', true)
                .prop('required', false);
            $('span.starAtAA').remove();
            $('select#Sort').val("Nvt");
        } else {
            return false;
        }
    };

    function processEnvelop(enve){
        Qopen = document.getElementById('EnvOpen');
        if(enve == "Geen"){
            Qopen.checked = false;
            $(Qopen).prop('disabled', true);
            $('#96001001,#96001000').hide(); // producten couverteren verwijderen kostenindicatie
            if($('#96000007').is(':visible')) {
                $('#96001004').show();
            };
        } else {
            Qopen.removeAttribute('disabled');
            $('#96001001,#96001000').show(); // product couverteren toevoegen kostenindicatie
            $('#96001004').hide(); // schoonsnijden verbergen (ivm mogelijke wijziging bestelling)
        }
    };

    function processCombi(check, targetclass){
        if(check){
            $('.' + targetclass).show();
            $('.' + targetclass).find('input').prop('disabled', false);
        } else {
            $('.' + targetclass).hide();
        }
    };
    
    function validateAS(reknr){
        var ASrekeningenEncr = bf.decrypt(encryptedData);
        return $.inArray(reknr, ASrekeningenEncr.split(',')) > -1;
        // true means it's in te list
    };
    
    function checkAS(reknr, div_to_show, div_error){
        if(reknr == ""){
            $('#' + div_to_show).hide();
        } else {
            if(!validateAS(reknr)) {
                $('#' + div_to_show).show();
            } else {
                $('#' + div_to_show).hide();
            }
        }
    };
    
    function echoBFencrypted(text){
        var encryptedTxt = bf.encrypt(text);
        $('.encrDiv').hide();
        $('.encrDiv').html('<div id="encrDiv" contentEditable onclick="$(this).selectText()">' + encryptedTxt + '</div>');
        $('.encrDiv').show();
    };
    
    function echoBFdecrypted(){
        var decryptedTxt = bf.decrypt(encryptedData);
        $('.decrDiv').hide();
        $('.decrDiv').html('<div id="encrDiv" contentEditable onclick="$(this).selectText()">' + decryptedTxt + '</div>');
        $('.decrDiv').show();
    };
    
    // aan te roepen bij onchange van checkbox: als checked, dan target enable vice versa:
    // onchange="connectToggle($(this).prop('checked'), '#TargetId');"
    function connectToggle(on, target){
        (on) ? $(target).prop('disabled', false) : $(target).prop('disabled', true);
    };
    
    function connectToggleVisible(on, target){
        (on) ? $(target).prop('disabled', false) : $(target).prop('disabled', true);
        (on) ? $(target).show() : $(target).hide();
    };
    
    // aan te roepen bij keuze 'als vorig jaar': form novalidate, inputs e.d. hidden en disabled (laatste om te voorkomen dat het in bestelresultaten komt)
    // aanroepen als: onchange="processAlsVorigJaar(this.checked, '.thisClass');"  met .thisClass meegegeven aan betreffende input, .Question, .Answer en evt .Toelichting
    function processAlsVorigJaar(on, target) {
        if (on) {
            $(target).parent('form')
                .prop('novalidate', true)
                .find('.Question, .Answer, .Toelichting, .Vraagteken, .starcomment, #Selectieoverzicht').not(target).hide()
                .find('input, select').prop('disabled', true);
            $('#AkbIncasso, #AkbAcceptgiro, #AkbIdeal').prop('disabled', false);
        } else {
            $(target).parent('form')
                .prop('novalidate', false)
                .find('.Question, .Answer, .Toelichting, .Vraagteken, .starcomment, #Selectieoverzicht').not(target).show()
                .find('input, select').prop('disabled', false);
        };
    }
    
    //============================
    //   DOCUMENT READY
    //============================
    
    $(document).ready(function() {
        //===========================
        //   IMPORTANT TO DO FIRST
        //===========================
        
        // if javascript enabled this will hide error message
        $('.noScriptWarning').hide();
        
        $('.Help').hide();
        
        // acties uitschakelen totdat het bestelbaar is
        // $('input#ActieNaamKerkbalans').prop('disabled', true);
        // $('input#ActieNaamEJC').prop('disabled', true);
        
        //===========================
        //   BUILD DOM
        //===========================

        // alle vraagtekens voorzien van title
        $('.Vraagteken').attr('title','Klik om info te openen/sluiten');
        
        // alle helptekst voorzien van knop "Sluiten"
        $('.Help').append('<hr><span class="Sluiten">sluiten</span>');
        
        // wrap Q&A in div class QandA en visualize required
        $('*[required]').parent('.Answer').prev('.Question').append('<span class="star" title="Dit is een verplicht veld"> *</span>');
        $('*[required]').closest('fieldset').append('<div class="starcomment"><span class="star">*</span><span> Dit is een verplicht veld</span></div>');
        
        // wrap fieldsets in forms
        $('fieldset').not('.noNext')
            .wrapInner('<form>');

        //===========================
        //   ADD EVENT LISTENERS
        //===========================
        $('.Sluiten').on ("click", function() {
            $(this).parent('div').slideToggle();
        });
        
        $('.toggleDiv, .Vraagteken').on( "click", function() {
            $(this).next('div').slideToggle();
        }); // end toggle
        
        // NavLinks functie: opslaan positie in bestelling; tonen fieldset;
        $('.NavLink').on( "click", function() {
            $('#errorBox').hide();
            var currFs = $('fieldset:visible');
            if(currFs.attr('class') != "noNext") { // niet positie opslaan buiten bestelling, anders kun je nooit terug
                currentFieldsetId = currFs.attr('id');
            }
				var linkedFieldsetId = $(this).text();
				// huidige fieldset hiden
				currFs.fadeToggle(400, function(e) {
				// betreffende fieldset showen
					$('#' + linkedFieldsetId).fadeToggle(400)});
			});
  
        $('input:radio[name="ActieNaam"]').on( "click", function(){
            $('form').unbind('onSuccess'); // anders problemen als je teruggaat en actie wijzigt
            processActieNaam(); // helpt dit???
        });        
        
        // in fieldset Help elke kop zijn antwoord laten showen
        $('fieldset#Help').find('H4').on( "click", function(){
            $(this).next('div').slideToggle();
        });
        
        //===========================
        //   USE URL PARAMETERS
        //===========================
                
        // read urlParams
        if("test" in urlParams){
            $('.Quicklinks').show();
            
            // alle acties bestelbaar voor test
            $('input[name="ActieNaam"]').prop('disabled', false);
            
            var allUrlParams = ""
            for (var key in urlParams) {
                var val = urlParams[key];
                allUrlParams += key+": "+val+"\n";
            }
            //alert(allUrlParams);
        };
        
        // als bestelling via kerkbalans.nl: Start anders en route class VKB
        if(urlParams['V']){
            $('#Start').removeClass('Start');
            $('#Gemeente').addClass('Start');
            //$('#ActieNaamKerkbalans').attr('checked', true)
            $('#ActieNaamKerkbalans').prop('checked', true)
                .attr('data-fsclass', 'VKB');
            $('#ActieNaamKerkbalansLabel').trigger('click'); // JAWEL, je moet label clicken
            processActieNaam();
            
            $('#BijlaAntwEnvVKB').prop('disabled', true);
            $('#BijlaFolderVKB').prop('disabled', true);
            
            if(urlParams['V'] == "true"){
                var ItemsViaKBnl = "Besteld via kerkbalans.nl:";
                $('select#Env option[value="Venster-PKN"]').prop('disabled', true);
                $('select#Env option[value="Venster-blanco"]').prop('disabled', true);
                $('select#Env option[value="Venster-Eigen"]').prop('disabled', true);
                $('select#Env option[value="Venster-PPS"]').prop('disabled', true);
                if(urlParams['E'] == "true"){
                    $('select#Env').val('C5-VKB').prop('disabled', true);
                    ItemsViaKBnl += " Enveloppen,";
                } else {
                    $('select#Env option[value="C5-VKB"]').prop('disabled', true);
                };
                
                if(urlParams['A'] == "true"){
                    $('#BijlaAntwEnvVKB').prop('checked', true);
                    ItemsViaKBnl += " Antwoordenveloppen";
                };
                
                if(urlParams['F'] == "true"){
                    $('#BijlaFolderVKB').prop('checked', true);
                    ItemsViaKBnl += ", Folders";
                };
                
                $('.ViaKBnl').html('<p>U kunt nu uw bestelling bij het LRP-team ten behoeve van de actie Kerkbalans plaatsen. Gegevens van uw bestelling via www.kerkbalans.nl zijn zo veel mogelijk verwerkt.</p><p><b>Bij kerkbalans.nl is aangegeven dat het LRP-team de hierna genoemde materialen ontvangt en verwerkt in uw bestelling.</b></p><p id="BesteldViaKBnl">' + ItemsViaKBnl + '</p>');
            };
            $('.ViaKBnl').show();
            
        };

        //===========================
        //   GOED BEGINNEN (na URL PARAMS)
        //===========================
        
        // alle fieldsets behalve de eerste hiden en knoppen next/back toevoegen
        $('fieldset').not(".Start").hide()
            .find('form')
            .append('<span class="goBack navButton">&#171;&nbsp;&nbsp;Terug</span>');
        $('.noNext').append('<span class="goBack navButton">&#171;&nbsp;&nbsp;Terug</span>');
        
        $('fieldset').not(".noNext").not('.lastFieldset')
            .find('form')
            .append('<input type="submit" class="goNext navButton" value="Verder&nbsp;&nbsp;&#187;">');
        
        // back button functioneel maken, binnen bestelling vorige tonen, anders laatst geopende tonen
        $('.goBack').on( "click", function() {
            $('#errorBox').hide();
            var thisFs = $(this).closest('fieldset');
            var backFsClass = $('[name="ActieNaam"]:checked').attr('data-fsclass');
            var backFs = $(thisFs).prevAll('fieldset').filter('.' + backFsClass).first();
            //alert('thisFs: ' + thisFs + '\nbackFsClass: ' + backFsClass + '\nbackFs: ' + backFs + '\nbackFsId: ' + backFsId);
            if(thisFs.attr('class') == "noNext") { 
                $(thisFs).fadeToggle(400, function() {
                    $('#' + currentFieldsetId).fadeToggle(400)});
            } else { 
                $(thisFs).fadeToggle(400, function() {
                    $(backFs).fadeToggle(400)});
            }
        });
        
        //// start add producten
        var productlijstpb = ""
        var productlijstps = ""
        for (var key in productperbestelling){
            productlijstpb += '<div class="product" id="'+productperbestelling[key].id+'">'+productperbestelling[key].product+': <span class="price">€ '+productperbestelling[key].price+'</span></div>';
        };
        for (var key in productperstuk){
            productlijstps += '<div class="product" id="'+productperstuk[key].id+'">'+productperstuk[key].product+': <span class="price">€ '+productperstuk[key].price+'</span></div>';
        };
        $('#productenperbestelling').append(productlijstpb);
        $('#productenperstuk').append(productlijstps);
        //// end add producten
        
        
        //===========================
        //   SETTINGS
        //===========================
        
        // vanwege IE alles met onChange ook onClick="radioclick" meegeven
        $('form').find('input').each( function() {
            if($(this).attr('onChange') && $(this).attr('type') !== "text"){
                $(this).attr('onClick', 'this.blur();');
            }
        });
        
        // opties AKB acc en inc koppelen aan vinkjes betaalwijzen
        $('input[name="Betaalwijze"]').change( function(){
            ac = $('#BetaalwijzeAcceptgiro').prop('checked');
            ai = $('#BetaalwijzeIncasso').prop('checked');
            id = $('#BetaalwijzeIdeal').prop('checked');
            ov = $('#BetaalwijzeOverig').prop('checked');
            processBetaalwijze(ac, ai, id, ov);
        });
        
        // AKB-vragen disabelen zodat standaard aangevinkte zaken niet meekomen in bestelling; pas activeren zodra AKB aangevinkt en pagina wordt ververst
        if($('#AkbAcceptgiro').prop('checked')){
            $('.AKB-acc').show();
            $('.AKB-acc').find('input,select').each( function(){
                $(this).removeProp('disabled');
            });
        } else {
            $('.AKB-acc').hide();
            $('.AKB-acc').find('input,select').each( function(){
                $(this).prop('disabled', true);
            });
        }
        
        if($('#AkbHerinnering').prop('checked')){
            $('.AKB-her').show();
            $('.AKB-her').find('input,select').each( function(){
                $(this).removeProp('disabled');
            });
        } else {
            $('.AKB-her').hide();
            $('.AKB-her').find('input,select').each( function(){
                $(this).prop('disabled', true);
            });
        }
        
        // bij refresh zorgen dat je verder kunt
        $('input:checked').trigger('click');
        
        // in selects kopjes niet-selecteerbaar maken
        $('.blankoption').prop('disabled', true);
        

        // waarom moet dit nou weer; radio is anders op het oog wel checked, maar niet als zodanig te gebruiken
        //$('fieldset#Start').find('input').each( function() {
        //    $(this).attr('checked', false);
        //});

        
        // update kostenindicatie
        // elke input/select onchange? mist evt default ingestelde dingen met kosten? onblur moet wachten tot je volgende selecteert
        // array bouwen met id en kosten? dan toevoegen en weghalen wellicht makkelijker
        // string bouwen van array elements = join(), of convert array to string = toString()
        // var myArray = { key1: 100, key2: 200 }; for(ZZ
        
                
        //=============================
        //   FORM VALIDATION
        //=============================
        
        // adds an effect called "wall" to the validator
        $.tools.validator.addEffect("wall", function(errors, event) {
 
            // get the message wall
            var wall = $(this.getConf().container);
 
            // remove all existing messages
            wall.find("p").remove();
 
            // add new ones
            $.each(errors, function(index, error) {
                wall.append(
                    "<p><strong>" +error.input.attr("name")+ "</strong> " +error.messages[0]+ "</p>"
                ).fadeIn().fadeOut().fadeIn();
                
                error.input.parent('.Answer').prevAll('.Question').first().addClass('wrongAnswer');
                
            });
 
            // when all inputs are valid
            }, function(inputs)  {
                $('*').removeClass('wrongAnswer');
        });
            
        $.tools.validator.localize("nl", {
            ':email'    : 'Vul een geldig e-mailadres in a.u.b.',
            ':number'   : 'Vul een nummer in a.u.b.',
            '[max]'     : 'Vul een nummer in dat lager is dan $1 a.u.b.',
            '[min]'     : 'Vul een nummer in dat hoger is dan $1 a.u.b.',
            '[required]': 'Vul dit verplichte onderdeel in a.u.b.',
            '*'         : 'Corrigeer dit onderdeel a.u.b.'
        });              
            
//        $('body').find('form').each( function() {
//            $(this).validator({
//                lang: 'nl',
//                position: 'top right',
//                message: '<span/>',
//                offset: [-10, 400],
//            });
//        });
  
        // initialize validator with the new effect
        $('body').find('form').each( function() {
            $(this).validator({
                effect: 'wall',
                container: '#errorBox',
                lang: 'nl',
                
                // do not validate inputs when they are edited
                errorInputEvent: null
 
            // custom form submission logic
            }).submit(function(e)  {
 
                // when data is valid
                if (!e.isDefaultPrevented()) {
 
                    // tell user that everything is OK
                    $("#errorBox").html("<h2>Fouten:</h2>");
 
                    // prevent the form data being submitted to the server
                    e.preventDefault();
                }
                
                //// added prijsberekening
                $('#Kosten').show();
                $(this).find('input,select option').each( function(){
                    prod = $(this).attr('data-product');
                    $('#' + prod).hide();
                });
                $(this).find('input:checked, select option:selected').each( function(){
                    prod = $(this).attr('data-product');
                    //alert('To show: ' + '#' + prod);
                    $('#' + prod).show();
                });
                
                //// end prijsberekening
            
            });
        });

        // error-message in Nederlands mits nog niet meegegeven
        $('form').find('input,select').each( function() {
            if(! $(this).attr('data-message')){
                $(this).attr('data-message', 'Corrigeer dit onderdeel a.u.b.');
            }
        });

    });

    function createOrderPdf() {
        var doc = new jsPDF('p', 'cm', 'a4'); // orientation ([p]ortait or [l]andscape), unit (pt/mm/cm/in), format (a3/a4/a5/letter/legal)
        //var source = showOrder('returnpdf');
		var source = $('.bestellingstekst')[0];

        var specialElementHandlers = {
			// element of #id kan aparte behandeling krijgen; true = overslaan
            '#overslaan': function(element, renderer){
                return true;
            }
        };
        
        margins = {
            top: 1.0,
            bottom: 1.0, // om een of andere reden effectloos
			left: 1.0,
            width: 18
			
        };
        
        doc.setFontSize(8); // size = int points
        
        doc.fromHTML(
            source,
            margins.left,
            margins.top,
            {
                'width': margins.width,
                'elementHandlers': specialElementHandlers
            },
			function(dispose) {
				// dispose: object with X, Y of the last line add to the PDF
				// this allow the insertion of new lines after html
				doc.save('Bestelling.pdf');
			},
			margins
        );  
    };