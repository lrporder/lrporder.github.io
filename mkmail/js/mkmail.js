// mailto specs: http://www.ietf.org/rfc/rfc2368.txt
// https://msdn.microsoft.com/en-us/library/aa767737%28v=vs.85%29.aspx?f=255&MSPPError=-2147217396
// MS doesn't accept "to=recipient@domain.ext" name-value pair, so we need to parse this separately

function createLink(showalert) {
  var recipient = document.getElementById('to').value;
  var string = (recipient) ? "mailto:" + encodeURIComponent(recipient) : "mailto:";
  var args = ["cc","bcc","subject","body"];
  for (var i in args) {
    var delimiter = (string.indexOf("?") == -1) ? "?" : "&";
    var component = document.getElementById(args[i]).value;
    if (component) {
      var string = string + delimiter + args[i] + '=' + encodeURIComponent(component);
    };
  };
  (showalert) && alert(string);
};

function createGmail() {
  var compose = "https://mail.google.com/mail?view=cm&tf=0"
  var args = ["to","cc","bcc","subject","body"];
  for(var i in args) {
    var component = document.getElementById(args[i]).value;
    if (component) {
      compose += '&' + args[i] + '=' + encodeURIComponent(component);
    };
  };
  compose = compose.replace('&subject=', '&su=');
  window.open(compose);
};

function toggleDisplay(target) {
  t = document.getElementById(target);
  t.style.display = (t.style.display == 'block') ? "none" : "block";
};

function readLink(link) {
  var pl = /\+/g;
  if(link.substr(0,23) === "https://mail.google.com") {
    // it's gmail
    var urlParamsStr = link.split("?")[1];
    var urlParams = urlParamsStr.split("&");
    for ( var i in urlParams ) {
      nameValCombo = urlParams[i].split("=");
      var nameValue = nameValCombo[1].replace(pl, " ");
      if (nameValCombo[0] == "su") {
        document.getElementById('subject').value = decodeURIComponent(nameValue);
      } else if (nameValCombo[0] === "to" || nameValCombo[0] === "cc" || nameValCombo[0] ==="bcc" || nameValCombo[0] === "body") {
        document.getElementById(nameValCombo[0]).value = decodeURIComponent(nameValue);
        }
    };
                           
  } else if(link.substr(0,6) === "mailto") {
    var mailtoPart = link.split('?')[0];
    var recipients = decodeURIComponent(mailtoPart.split(':')[1]);
    if ( recipients !== undefined ) {
      document.getElementById('to').value = recipients;
    };
    var urlParamsStr = link.split('?')[1];
    var urlParams = urlParamsStr.split('&');
    for ( var i in urlParams ) {
      nameValCombo = urlParams[i].split("=");
      var nameValue = nameValCombo[1].replace(pl, " ");
      if (nameValCombo[0] === "cc" || nameValCombo[0] ==="bcc" || nameValCombo[0] === "body" || nameValCombo[0] === "subject") {
        document.getElementById(nameValCombo[0]).value = decodeURIComponent(nameValue);
      }
    }
  } else {
    console.log("Link not recognized");
  }
};
