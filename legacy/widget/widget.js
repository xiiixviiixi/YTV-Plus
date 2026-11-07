(function () {
    'use strict';
    var nativePostMessage = window.postMessage;
    window.postMessage = function (message, options, transfer) {
        var isOptions = options !== null && typeof options === 'object';
        var origin = isOptions ? (options.targetOrigin === undefined ? '*' : options.targetOrigin) : options;
        var transfers = isOptions ? options.transfer : transfer;
        var args = [message, origin];
        if (transfers) args.push(transfers);
        return nativePostMessage.apply(window, args);
    };
    var player = document.getElementById('player');
    var setup = document.getElementById('setup');
    var button = document.getElementById('connect');
    var baseline = document.getElementById('baseline');
    var options = document.getElementById('options');
    var status = document.getElementById('status');
    var panel = document.getElementById('log');
    var feedback = document.getElementById('feedback');
    var feedbackText = document.getElementById('feedback-text');
    var spinner = document.getElementById('busy-spinner');
    function showFeedback(text, spinning) {
        // Loading spinner/status overlay removed: never show it.
        feedback.style.display = 'none';
        spinner.style.display = 'none';
    }
    window.__legacyStatus = function (text, frame, spinning) {
        if (frame !== player.contentWindow || setup.style.display !== 'none') return;
        showFeedback(text, spinning);
    };
    var visible = false;
    var renderTimer;
    var mode = 'mods';
    var bootTimer;
    var pending;
    var widgetBase = location.href.split('#')[0].split('?')[0].replace(/[^/]*$/, '');
    var log = LegacyLogger.create(300, function (entry) {
        if (entry.code === 'page.start') clearTimeout(bootTimer);
        if (visible && !renderTimer) renderTimer = setTimeout(function () {
            renderTimer = null; render();
        }, 250);
    });
    window.__legacyLog = log;
    var tlsTransport = LegacyTLS.create(document.getElementById('tls-module'), log, function (info) {
        document.getElementById('tls-summary').textContent = 'Mode: ' + info.mode + ' · Interface/API (NaCl): ' + info.api +
            ' · Video (NaCl): ' + info.video + ' · System stack: unknown';
    });
    window.__legacyTLS = tlsTransport;
    tlsTransport.install(window);
    function render() {
        panel.style.display = visible ? 'block' : 'none';
        if (!visible) return;
        var entries = log.read();
        var lines = ['YouTube — memory log (' + entries.length + '/300)'];
        for (var i = Math.max(0, entries.length - 6); i < entries.length; i++) {
            lines.push('+' + entries[i].ms + 'ms ' + entries[i].code + ' ' + entries[i].detail);
        }
        panel.textContent = lines.join('\n');
    }
    function script(name) { return '<script src="' + widgetBase + name + '"></script>'; }
    function connect(selectedMode) {
        mode = selectedMode || mode;
        menu();
        options.style.display = 'none';
        log.record('page.loading', mode);
        status.textContent = 'Connecting to YouTube…';
        showFeedback('Connecting to YouTube…');
        var xhr = new XMLHttpRequest(); pending = xhr;
        xhr.open('GET', 'https://www.youtube.com/tv', true); xhr.timeout = 25000;
        function failed(code, detail) {
            if (pending !== xhr) return;
            pending = null; menu();
            status.textContent = code === 'page.timeout' ? 'YouTube connection timed out. Press Red / 1 for details.' :
                code === 'page.http-error' ? 'YouTube returned HTTP ' + xhr.status + '. Press Red / 1 for details.' :
                'YouTube connection failed. Press Red / 1 for details.';
            log.record(code, detail);
        }
        xhr.onerror = function () { failed('page.network-error', 'XHR status=' + xhr.status); };
        xhr.ontimeout = function () { failed('page.timeout', 'YouTube HTML request timed out'); };
        xhr.onload = function () {
            if (pending !== xhr) return;
            if (xhr.status !== 200) { failed('page.http-error', 'HTTP=' + xhr.status); return; }
            pending = null; log.record('page.received', 'HTTP=200; bytes=' + xhr.responseText.length);
            showFeedback('Starting YouTube…');
            var html = xhr.responseText.replace(/\s(?:integrity|nonce|crossorigin)=(?:"[^"]*"|'[^']*')/gi, '');
            // Force configured language: patch the server-supplied HL before any YouTube script runs.
            var lang = 'en';
            try { var c = JSON.parse(localStorage.getItem('ytaf-configuration') || '{}'); if (c && typeof c.forcedLanguage === 'string' && /^[a-z]{2,3}(-[A-Za-z]{2,4})?$/.test(c.forcedLanguage)) lang = c.forcedLanguage; } catch (e) {}
            html = html.replace(/("HL"\s*:\s*")[^"]*(")/gi, '$1' + lang + '$2');
            html = html.replace(/("I18N_LANGUAGE"\s*:\s*")[^"]*(")/gi, '$1' + lang + '$2');
            html = html.replace(/("GL"\s*:\s*")[^"]*(")/gi, '$1US$2');
            html = html.replace(/<head([^>]*)>/i, '$&<base href="https://www.youtube.com/tv"><style>[idomkey="lazy-debug-watermark"],.ZI6lfc{display:none!important}</style><link rel="stylesheet" href="' + widgetBase + 'player.css">' + script('logger.js') + script('frame.js') + '<script>parent.__legacyTLS.install(window);</script>' + script('compat.js'));
            html = html.replace(/<body([^>]*)>/i, '$&<script>var TT_LANG="' + lang + '";if(window.ytcfg){var os=ytcfg.set.bind(ytcfg);ytcfg.set=function(k,v){if(k==="HL"||k==="I18N_LANGUAGE")v=TT_LANG;if(k==="GL")v="US";return os(k,v);};ytcfg.set("USE_NET_AJAX_FOR_PING_TRANSPORT",true);ytcfg.set("HL",TT_LANG);ytcfg.set("I18N_LANGUAGE",TT_LANG);ytcfg.set("GL","US");}</script>' + (mode === 'mods' ? script('userScript.js') : '') + '<script>(function(){var b="ytlr-button-renderer,yt-button-renderer";function s(e){if(e&&e.shadowRoot){var r=e.shadowRoot;r.querySelectorAll(b).forEach(function(t){t.style.setProperty("border-radius","8px !important","");});r.querySelectorAll("*").forEach(function(t){if(t.shadowRoot)s(t);});}}document.querySelectorAll(b).forEach(function(e){e.style.setProperty("border-radius","8px !important","");if(e.shadowRoot)s(e);});new MutationObserver(function(m){m.forEach(function(mu){mu.addedNodes.forEach(function(n){if(n.nodeType===1){if(n.matches&&n.matches(b)){n.style.setProperty("border-radius","8px !important","");if(n.shadowRoot)s(n);}n.querySelectorAll&&n.querySelectorAll(b).forEach(function(e){e.style.setProperty("border-radius","8px !important","");if(e.shadowRoot)s(e);});s(n);}})};});}).observe(document.body,{childList:!0,subtree:!0});})();</script>');
            bootTimer = setTimeout(function () {
                menu(); status.textContent = 'YouTube did not start. Press Red / 1 for details.';
                log.record('page.boot-timeout', 'YouTube diagnostic script did not start');
            }, 35000);
            // Render the fetched page from a local frame document.
            player.onload = function () {
                player.onload = null;
                var frameDocument = player.contentWindow.document;
                frameDocument.open(); frameDocument.write(html); frameDocument.close();
                player.focus();
            };
            setup.style.display = 'none'; player.style.display = 'block'; player.src = widgetBase + 'player.html';
        };
        xhr.send();
    }
    function menu() {
        clearTimeout(bootTimer);
        if (pending) { var xhr = pending; pending = null; xhr.abort(); }
        setup.style.display = 'block';
        showFeedback('');
        player.onload = null; player.src = 'about:blank';
        player.style.display = 'none'; setup.style.display = 'block'; options.style.display = 'block';
        status.textContent = 'Diagnostics and restart'; button.focus();
    }
    function command(key) {
        if (key === 403 || key === 49) { visible = !visible; render(); }
        else if (key === 50) connect();
        else if (key === 406 || key === 52) menu();
        else return false;
        return true;
    }
    window.__legacyCommand = command;
    window.__legacyFrameNavigation = function (frame) {
        if (frame !== player.contentWindow || setup.style.display !== 'none') return;
        // Native navigation cannot recreate the modified page on old WebKit.
        setup.style.display = 'block';
        showFeedback('Restoring YouTube…');
        log.record('page.navigation', 'Reloading YouTube after document navigation');
        setTimeout(function () { connect(); }, 0);
    };
    document.addEventListener('keydown', function (event) {
        if (command(event.keyCode)) { event.preventDefault(); return; }
        if ((event.keyCode === 10009 || event.keyCode === 27) && setup.style.display !== 'none') {
            if (window.tizen) tizen.application.getCurrentApplication().exit(); return;
        }
        if (options.style.display !== 'none' && setup.style.display !== 'none' && event.keyCode >= 37 && event.keyCode <= 40) {
            (document.activeElement === button ? baseline : button).focus(); event.preventDefault();
        }
    });
    button.onclick = function () { connect('mods'); }; baseline.onclick = function () { connect('baseline'); };
    window.onerror = function (message, source, line, column) { log.record('widget.error', message + ' line=' + line + ' column=' + column); };
    log.record('widget.start', 'ES5; native fetch=' + typeof window.fetch + '; MSE=' + !!(window.MediaSource || window.WebKitMediaSource));
    if (window.tizen) {
        var keys = ['ColorF0Red', 'ColorF1Green', 'ColorF2Yellow', 'ColorF3Blue', 'MediaPlayPause', 'MediaPlay', 'MediaPause', 'MediaStop', 'MediaRewind', 'MediaFastForward'];
        for (var i = 0; i < keys.length; i++) {
            try { tizen.tvinputdevice.registerKey(keys[i]); } catch (e) { log.record('key.unavailable', keys[i]); }
        }
        try { log.record('service.capability', String(tizen.systeminfo.getCapability('http://tizen.org/feature/web.service'))); }
        catch (e) { log.record('service.capability-error', e.name); }
    }
    connect('mods');
}());
