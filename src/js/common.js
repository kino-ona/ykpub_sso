var layer = {};
//openLayer
layer = {
    scrollLock : true,
    open: function(hash, openCallback, closeCallback) {
        $(hash).popup({
            onopen : function() {
                if (openCallback != undefined && openCallback != null && $.isFunction(openCallback)) {
                    openCallback();
                }
            },
            onclose : function() {
                if (closeCallback != undefined && closeCallback != null && $.isFunction(closeCallback)) {
                    closeCallback();
                }
            },
            autoopen: true,
            transition: 'all 0.3s',
            scrolllock: layer.scrollLock,
        });
    },
    //closeLayer
    close: function(hash) {
        $(hash).popup('hide');
        $(hash).trigger('closed');
    },
}

//years, months, days selectbox setting
function setBirthSelectOption(el, classNameYears, classNameMonths, classNameDays, limitYearStart, limitYearEnd) {
    //populate our years select box
    if (limitYearStart == undefined) {
        limitYearStart = 10;
    }
    if (limitYearEnd == undefined) {
        limitYearEnd = 10;
    }
    for (i = (new Date().getFullYear()+limitYearStart); i > (new Date().getFullYear()-limitYearEnd); i--){
        $('.'+classNameYears, el).append($('<option />').val(i).html(i));
        if (i == new Date().getFullYear()) {
            $('.'+classNameYears, el).val(i);
        }
    }
    //populate our months select box
    for (i = 1; i < 13; i++){
        $('.'+classNameMonths, el).append($('<option />').val(i).html(i));
        if (i == new Date().getMonth()+1) {
            $('.'+classNameMonths, el).val(i);
        }
    }
    //populat.e our Days select box
    updateNumberOfDays(el, classNameYears, classNameMonths, classNameDays); 

    $('.'+classNameMonths, el).parent().find('.'+classNameDays).val(new Date().getDate());
}

function updateNumberOfDays(el, classNameYears, classNameMonths, classNameDays) {
    $('.'+classNameDays, el).html('');
    month = $('.'+classNameMonths, el).val();
    year = $('.'+classNameYears, el).val();
    allDays =  new Date(year, month, 0).getDate();

    for(i=1; i < allDays+1 ; i++){
        $('.'+classNameMonths, el).parent().find('.'+classNameDays).append($('<option />').val(i).html(i));
    }
}

// �먭컻�� �좎쭨瑜� 鍮꾧탳�섏뿬 李⑥씠瑜� �뚮젮以���.
function dateDiff(_date1, _date2, abs) {
    var diffDate_1 = _date1 instanceof Date ? _date1 :new Date(_date1);
    var diffDate_2 = _date2 instanceof Date ? _date2 :new Date(_date2);
    diffDate_1 = new Date(diffDate_1.getFullYear(), diffDate_1.getMonth(), diffDate_1.getDate());
    diffDate_2 = new Date(diffDate_2.getFullYear(), diffDate_2.getMonth(), diffDate_2.getDate());

    if (abs == 'abs') {
        var diff = Math.abs(diffDate_2.getTime() - diffDate_1.getTime());
    } else {
        var diff = (diffDate_2.getTime() - diffDate_1.getTime());
    }
    diff = Math.ceil(diff / (1000 * 3600 * 24));
 
    return diff;
}

//Template 媛��몄삤湲�
function getTemplateContent(selector) {
    var _tplClone = false;
    if ('content' in document.createElement('template')) {
        var _template = document.querySelector('template'+selector);
        _tplClone = document.importNode(_template.content, true);
    } else {
        var _template = document.querySelector('template'+selector);
        _tplClone = _template.cloneNode(true);
    }
    return _tplClone;
}

function checkPasswordPattern(str) {
    var pattern1 = /[0-9]/;
    // �レ옄 
    var pattern2 = /[a-zA-Z]/;
    // 臾몄옄 
    var pattern3 = /[~!@#$%^&*()_+|<>?:{}]/;
    // �뱀닔臾몄옄 
    if (!pattern1.test(str) || !pattern2.test(str) || !pattern3.test(str) || str.length < 8) {
        return false;
    } else {
        return true;
    } 
}

//�곗냽�� 臾몄옄/�レ옄 移댁슫��
function checkPasswordContinuity (str, limit) {
    var o, d, p, n = 0, l = limit == null ? 4 : limit;
    for (var i = 0; i < str.length; i++) {
        var c = str.charCodeAt(i);
        if (c >= 48 && c <= 57) { // �レ옄留� 泥댄겕 �섎룄濡� 蹂�寃�.
            if (i > 0 && (p = o - c) > -2 && p < 2 && (n = p == d ? n + 1 : 0) > l - 3) {
                return false;
            }
        }
        d = p, o = c;
    }
    return true;
}

// 鍮꾨�踰덊샇媛� �꾩씠�붿� �숈씪�섍굅�� 3�먮━ �댁긽 �쇱튂�� 寃쎌슦 �ъ슜�� �� �놁뒿�덈떎.
function checkPassIdWithPw (validid, validpw) {
	var tmp = "";
	var cnt = 0;
	for (i=0; i<validid.length-2; i++) {
		tmp = validid.charAt(i) + validid.charAt(i+1) + validid.charAt(i+2);
		if (validpw.indexOf(tmp) > -1) {
			cnt = cnt + 1;
		}
	}
	if (cnt > 0) {
		return false;
	} else {
		return true;
	}
}

//鍮꾨�踰덊샇 議곌굔 �꾩씠�붿� 3�먮━ �댁긽 以묐났�섍굅�� 1234 媛숈� 4�먮━ �댁긽�� �곗냽�섎뒗 �レ옄 �쒗븳
function checkPasswordPatternComp (pass, id) {
    //var pattern1 = /^.*(.)\1\1.*$/;
    //var pattern2 = /(\d){3,}/;
    //if (pattern1.test(pass) || pattern2.test(pass) || checkPassIdWithPw (id, pass) == false) {
    if (! checkPassIdWithPw(id, pass)) {
        return false;
    }
    if (! checkPasswordContinuity(pass)) {
        return false;
    }
    return true;
}
