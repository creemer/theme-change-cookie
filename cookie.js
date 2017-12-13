require(["jquery", "splunkjs/mvc", "splunkjs/mvc/utils","splunkjs/mvc/simplexml/ready!"], 

function($, mvc, utils) {
    console.log('Start of cookie.js');

    /**
     * Create cookie in browser storage.
     * 
     * @param {*string} cname - name of cookie.
     * @param {*string} cvalue - cookie value.
     * @param {*number} exdays - expires days of cookie. Default - 1 day.
     */
    function setCookie(cname, cvalue, exdays) {
        if(!exdays) exdays = 1; // if no expires value, set it to 1 day.
        
        var d = new Date();
        d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));        
        var expires = "expires="+d.toUTCString();

        document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
    }

    /**
     * Parse string of cookies by delimiter. 
     * Then in cicle serching name of cookie.
     * 
     * @param {*string} cname - name of cookie needed. 
     */
    function getCookie(cname) {
        var name = cname + "=";
        var ca = document.cookie.split(';');
        for(var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) == 0) {
                return c.substring(name.length, c.length);
            }
        }
        return "";
    }

    // take tokens from App.
    var defaultTokenModel = mvc.Components.getInstance('default', {create: true});
    //console.log('defaultTokenModel', defaultTokenModel);


    /**
     *  Trying to set values from cookies.
     *  Try/catch -  if there is no needed cookie.
     */ 
    try {
        defaultTokenModel.set('form.downsampleDotsDash', getCookie('downsampleDots'));
    } catch (error) {
        console.log('Have no downsampleDots cookie');
    }

    try {
        defaultTokenModel.set('form.needDownsampleDash', getCookie('needDownsample'));
    } catch (error) {
        console.log('Have no needDownsample cookie');
    }

    /**
     * On every input change event, set new cookie value.
     */
    defaultTokenModel.on('change:form.downsampleDotsDash', function(event) {    
        setCookie('downsampleDots', defaultTokenModel.get('form.downsampleDotsDash'), 100);
        console.log('document.cookie', document.cookie);
    });

    defaultTokenModel.on('change:form.needDownsampleDash', function(event) {    
        setCookie('needDownsample', defaultTokenModel.get('form.needDownsampleDash'), 100);
        console.log('document.cookie', document.cookie);
    })
    
    //----------------------
    /**
     * Can add button, to hide green header.
     * Must be button with id == hide-header-btn
     

    var button = document.querySelector('#hide-header-btn');
    var header = document.querySelector('#header').lastElementChild;

    button.addEventListener('click', function(ev) {
        if(header.style.display !== 'none') {
            header.style.display = 'none';
            button.innerHTML = 'Показать шапку';
        } else {
            header.style.display = 'block';
            button.innerHTML = 'Скрыть шапку';
        }
    });
    */

    /** ------------------------------
     * Theme change and save to cookie
     -------------------------------  */

    var currentColor = defaultTokenModel.get('theme-change');
    
    // Make my own link element in the end or head tag. 
    // Work 2-3 times faster then Jquery analog. 
    if(!document.querySelector('#dashboard-custom-styles')) {
        var link = document.createElement('link');

        link.setAttribute('id', 'dashboard-custom-styles');
        link.setAttribute('rel', 'stylesheet');
        link.setAttribute('type', 'text/css');

        document.head.appendChild(link);
    }    

    // If there no colorTheme cookie, sets it.
    if(!getCookie('colorTheme')) {
        setCookie('colorTheme', currentColor, 100);
    }

    // Sets cookie value to token value and changing theme.
    try {
        let color = getCookie('colorTheme') || 'base';
        defaultTokenModel.set('form.theme-change', color);
        changeTheme(color);        
    } catch (error) {
        console.log('Have no colorTheme cookie');
    }

    /**
     * Listening for token(input) change event,
     * if so changing theme and sets cookie.
     */
    defaultTokenModel.on('change:form.theme-change', function(event) {   
        currentColor = event.changed['form.theme-change'];
        changeTheme(currentColor);
        setCookie('colorTheme', currentColor, 100);
        
        //console.log('document.cookie ', document.cookie);
    })   

    function changeTheme(theme) {
        console.log('Changing Theme');
        var link = document.querySelector('#dashboard-custom-styles');

        /**
         * Make url with out file name.
         * After that in switch adding there file name.
         * If there no specific value, or value == baseStyles, 
         * set href to empty string, and using default styles.
         */
        var prefix = Splunk.util.make_url();
        var url = prefix + '/static/app/' + utils.getCurrentApp() + '/css/';
        
        switch (theme) {
            case 'dark':            
                link.setAttribute('href', url + 'dark.css');
                break;
    
            case 'blue':
                link.setAttribute('href', url + 'blue.css');
                break;
        
            default:
                link.setAttribute('href', '');
                break;
        };
    };
});
