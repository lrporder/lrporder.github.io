
function throwError(message, log) {
    // jQuery alternative
    // $('#loadError').append(message).show();
    var t = document.getElementById('loadError');
    t.innerHTML += message + '<br>';        // add error message
    t.style.display = "block";      // show error div
    if(log) { console.log(log); }    // console log if present
}

function hideError() {
    // var t = document.getElementById('loadError');
    // t.textContent = "";               // reset error message
    // t.style.display = "none";         // hide error div
    $('#loadError').empty().hide();
}

function toggleDisplay(target) {
    var t = document.getElementById(target);
    t.style.display = (t.style.display == 'block') ? "none" : "block";
}

function makeFile(content) {
    var xmlFile = null;
    var data = new Blob([content], {type: 'text/xml'});
    if (xmlFile !== null) {
        window.URL.revokeObjectURL(xmlFile);
    }
    xmlFile = window.URL.createObjectURL(data);
    return xmlFile;
}

function changeFileTag(xml, tag, oldValue, newValue) {
    var oldString = '<' + tag + '>' + oldValue + '</' + tag + '>';
    var newString = '<' + tag + '>' + newValue + '</' + tag + '>';
    var regex = new RegExp(oldString, "g");
    var newXML = xml.replace(regex, newString);
    return newXML;
}

function getTimeStamp() {
    var t = new Date(),
    Y = t.getFullYear(),
    M = (((t.getMonth()+1) < 10)?"0":"") + (t.getMonth()+1),
    D = ((t.getDate() < 10)?"0":"") + t.getDate(),
    hh = ((t.getHours() < 10)?"0":"") + t.getHours(),
    mm = ((t.getMinutes() < 10)?"0":"") + t.getMinutes(),
    ss = ((t.getSeconds() < 10)?"0":"") + t.getSeconds(),
    newTimeStamp = Y + M + D + hh + mm + ss;
    // console.log('New timestamp = ' + newTimeStamp);
    return newTimeStamp;
}

function changeFile(f) {
    // ReqdColltnDt
    var newReqdColltnDt = $('#newReqdColltnDt').val();
    var newXML = changeFileTag(f, 'ReqdColltnDt', ReqdColltnDt, newReqdColltnDt);

    // if it was already submitted
    var regexTS = new RegExp(oldTimeStamp, "g");
    var newTimeStamp = getTimeStamp();
    newXML = newXML.replace(regexTS, newTimeStamp); // replace timestamp in msg and batch-id's
    newFiles.push(newXML);
}


function validateXml(f, c, nr) {

    // validate filename
    fileName = f.name.replace(/^.*?([^\\\/]*)$/, '$1');      // trim path (IE shows that) couldn't you use f.split('/').pop() ?
    fileNameProper = fileName.replace(/\.[^/.]+$/, ""); // trim extension
    var regexFN = new RegExp(fileNameProper, "g");
    fileNameExt = fileName.replace(regexFN, "");    // get extension
    //console.log('Filename proper = ' + fileNameProper);
    //console.log('Filename extension = ' + fileNameExt);
    fileNames.push(fileName);
    newFileNames.push(fileName);

    try {
        // is bestandsnaam correct?
        if((fileNameExt != '.P' && fileNameExt.toUpperCase() != ".XML")) throw ' heeft onjuiste bestandsextensie.';
        
        // is het xml? (NB. filetype checken kan niet: .P wordt niet herkend)
        var xmlStart = c.substring(0,5);
        if(xmlStart != '<?xml') throw " is geen XML-bestand.";
 
        // is het CAMT?
        var cXml = $.parseXML(c);
        var xmlns = $(cXml).find("Document").attr("xmlns");
        if(xmlns != 'urn:iso:std:iso:20022:tech:xsd:camt.053.001.02') throw " is geen CAMT-bestand.";
    }
    catch(e) {
        var error = 'Fout: ' + fileName + e;
        throwError(error, error);
        fileStats.push(error);
        oldFiles.push('ERROR occurred with ' + fileName);
        return false;
    };

    // if we end up here, all is well
    fileStats.push('&#10004;');
    oldFiles.push(c);

    return true;
}

function filePreview(n, filename, row) {
    $('tr').removeClass('xmlLineDiff');
    $(row).addClass('xmlLineDiff');
    
    var spanTagIn = '<span class="xmlLine">',
    spanTagOut = '</span>',
    spanTagInDiff = '<span class="xmlLine xmlLineDiff">';

    // replace < and > and add separator (only on one-line files where > and < exist together)
    var oldFileTmp = oldFiles[n].replace(/>/g, '&gt').replace(/</g, '&lt').replace(/&gt&lt/g, '&gtQ@Q&lt');
    var newFileTmp = newFiles[n].replace(/>/g, '&gt').replace(/</g, '&lt').replace(/&gt&lt/g, '&gtQ@Q&lt');

    // split into array on added separator or line-breaks
    var oldFileParts = oldFileTmp.split(/Q@Q|\r\n|\r|\n/);
    var newFileParts = newFileTmp.split(/Q@Q|\r\n|\r|\n/);

    // create html strings
    var oldFilePretty = [], newFilePretty = [];

    for (i in oldFileParts) {
        if (oldFileParts[i] === newFileParts[i]) {
            oldFilePretty.push(spanTagIn + oldFileParts[i] + spanTagOut);
            newFilePretty.push(spanTagIn + newFileParts[i] + spanTagOut);
        } else {
            oldFilePretty.push(spanTagInDiff + oldFileParts[i] + spanTagOut);
            newFilePretty.push(spanTagInDiff + newFileParts[i] + spanTagOut);
        };
    };

    // embed strings in html
    $('#xmlContent').html(oldFilePretty.join(''));
    $('#xmlNewContent').html(newFilePretty.join(''));
    $('#previewContainer').show();

    // modify header
    var newPreviewTitle = "Preview " + filename;
    $('#previewTitle').text(newPreviewTitle);
}
 
function showDetails(f, xml, nr) {
    var BookgDt = "";

    if(fileStats[nr] == '&#10004;'){    // if file was OK, do this
		var fileStatus = fileStats[nr];
		var fileStatusClass = 'fileOK';

		// data in old file
		var BookgDt = $(xml).find("BookgDt").first().find("dt").text();

		// CHANGE FILE
		var oldYear = $('#oldYear').val();
		var newYear = $('#newYear').val();
		
		var regexOldYear = new RegExp("\\." + oldYear + "-", "g");
		var strNewYear = "." + newYear + "-";
		var newXML = xml.replace(regexOldYear, strNewYear);
				
		var regexOldYear2 = new RegExp("<Dt>" + oldYear, "g");
		var strNewYear2 = "<Dt>" + newYear;
		var newXML = newXML.replace(regexOldYear2, strNewYear2);
		
		// oude betalingskenmerken onherkenbaar maken
		var newXML = newXML.replace("<Ref>", "<Ref>2");
		
		// betalingskenmerken uit omschrijving filteren
		var newXML = newXML.replace(/REF: \d{16}/g, "REF: ");
		
		newFiles.push(newXML);		
		
		// modify filename
		newFileNames.push(fileName);

		var filePreviewString = '<input type="button" onclick="filePreview(\'' + nr + '\', \'' + fileName + '\', $(this).closest(\'tr\'))" value="Preview">';
		var fileDownloadString = '<a href="' + makeFile(newFiles[nr]) + '" download="' + newFileNames[nr] + '"><input type="button" value="Download"></a>';
    } else {                             // if file was not OK, do this
        var fileStatus = '&#10008;';
        var fileStatusClass = 'fileNotOK';
        var filePreviewString = "";
        var fileDownloadString = "";
        newFiles.push('ERROR occurred with ' + fileName);
        newFileNames.push(fileName);
    };

    // fill table
    var rowContent = '<tr class="rowFileDetails">';
    rowContent += '<td>' + (nr+1) + '</td>';  // add nr
    rowContent += '<td>' + f.name + '</td>'; // add name
    rowContent += '<td>' + BookgDt + '</td>'; // add incassodatum
    rowContent += '<td class="' + fileStatusClass + '" title="' + fileStats[nr] + '">' + fileStatus + '</td>'; // add status
    rowContent += '<td>' + filePreviewString + '&nbsp;' + fileDownloadString + '</td>'; // add previewknop en downloadknop
    rowContent += '</tr>';

    $('#tableDetails').append(rowContent).show();
}

function downloadZipFile() {
    var zip = new JSZip();

    $.each(newFiles, function(i, newFile) {
        // if file was validated ok, add to zip
        if ( fileStats[i] == "&#10004;" ) {
            zip.file(newFileNames[i], newFile);
        };
    });
    zip.generateAsync({ type: "blob"}).then( function(blob) {
        saveAs(blob, "Bestanden.zip");
    });
}

function checkRequiredItems() {
	hideError();
    if($('#oldYear').val() == "" || $('#newYear').val() == "") {
        throwError('Vul oude en/of nieuwe jaar in s.v.p.');
        $('#fileInput').val("");
        return false;
    };
}

function handleFiles(files) {
    if (checkRequiredItems() === false) {
        return false;
    };

    $('.rowFileDetails').remove(); // remove earlier files
    $('#previewContainer').hide();

    hideError();

    // TODO: make objects instead of arrays?
    fileStats = [];
    oldFiles = [];
    newFiles = [];
    fileNames = [];
    newFileNames = [];

    if (files) {    
    $('#reset, #resetLabel').show();
    
    //origFiles = [];
    $.each(files, function(i, file) {
        var reader = new FileReader();       // start FileReader
        reader.onload = (function(loadedFile) {    // to do on load
            return function(e) {
                // CONTENT
                var xml = e.target.result;
                // NAME
                //name = encodeURIComponent(loadedFile.name); // bij spaties bv
                
                // TESTS
                validateXml(loadedFile, xml, i);
                showDetails(loadedFile, xml, i);
            };
        })(file);
           // ACTUALLY READ THE FILE
           reader.readAsText(file, "UTF-8");
        });
    } else {
        console.log('Failed to load file(s)');
    };
}

function pageDragOver(e) {
    e.stopPropagation();
    e.preventDefault();
    e.dataTransfer.effectAllowed = 'none'; // for IE >= 10, but it won't listen anyway
    e.dataTransfer.dropEffect = 'none';
    $('#dropbox').addClass('dragInside');
    $('#fileComment, #fileInput, #fileLabel').hide();
    $('#dropTarget').show();
}

function pageDragExit(e) {
    e.stopPropagation();
    e.preventDefault();
    $('#dropbox').removeClass('dragInside');
    $('#fileComment, #fileInput, #fileLabel').show();
    $('#dropTarget').hide();
}

function dropboxDragEnter(e) {
    e.stopPropagation();
    e.preventDefault();
    $('#dropbox').addClass('dragInside')
        .children().addClass('noPointerEvents');
    $('#fileComment, #fileInput, #fileLabel').hide();
    $('#dropTarget').show();
}

function dropboxDragOver(e) {
    e.stopPropagation();
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy'; // simulate copying file, not moving
}

function dropboxDragLeave(e) {
    e.stopPropagation();
    e.preventDefault();
    $('#dropbox').removeClass('dragInside')
        .children().removeClass('noPointerEvents');
    $('#dropTarget').hide();
    $('#fileComment, #fileInput, #fileLabel').show();
}

function dropboxDrop(e) {
    e.stopPropagation();
    e.preventDefault();
    $('#dropbox').removeClass('dragInside')
        .children().removeClass('noPointerEvents');
    $('#fileInput').val(""); // empty file input, we used drag and drop now
    $('#dropTarget').hide();
    $('#fileComment, #fileInput, #fileLabel').show();

    var dtFiles = e.dataTransfer.files;

    handleFiles(dtFiles);
}

$(document).ready(function() {
    /*
     * ON FILE INPUT
     */

    $('#fileInput').on('click', function(evt) {
        (checkRequiredItems() === false) && evt.preventDefault();
    });
 
    $('#fileInput').on('change', function(evt) {
        (checkRequiredItems() === false) && evt.preventDefault();
        handleFiles(evt.target.files);
    });

    /*
     * ON DRAG AND DROP
     * dragstart or dragend work on page elements that are picked up or dropped, not for external files moved into page
     * you'll need dragenter/-over on body element for that
     * IE won't listen to dataTranser.effectAllowed property (bug)
     */
    var dropbox = document.getElementById('dropbox');
    dropbox.addEventListener("dragenter", dropboxDragEnter, false);
    // dragover is needed, else file will be opened immediately
    dropbox.addEventListener("dragover", dropboxDragOver, false);
    dropbox.addEventListener("dragleave", dropboxDragLeave, false);
    dropbox.addEventListener("drop", dropboxDrop, false);
    document.addEventListener("dragover", pageDragOver, false);
    document.addEventListener("dragexit", pageDragExit, false);
});

