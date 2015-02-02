/*
 * Author: CM
 */
(function($, global) {

  /**
   * @param {Object} paramList
   * @return {String}
   */
  function encodeUrlQuery(paramList) {
    var parts = [];
    for (var param in paramList) {
      parts.push(encodeURIComponent(param) + '=' + encodeURIComponent(paramList[param]));
    }
    return parts.join('&');
  }

  /**
   * @param {String} category
   * @param {String} action
   * @param {String} label
   */
  function trackEvent(category, action, label) {
    if (global.ga) {
      global.ga('send', {
        'hitType': 'event',
        'eventCategory': category,
        'eventAction': action,
        'eventLabel': label,
      });
    }
  }

  $.fn.openx = function() {
    return this.each(function() {
      var zoneId = $(this).data('zone-id');
      var host = $(this).data('host');
      var variables = $(this).data('variables');

      var m3_u = (location.protocol == 'https:' ? 'https://' + host + '/delivery/ajs-proxy.php' : 'http://' + host + '/delivery/ajs-proxy.php');
      var m3_r = Math.floor(Math.random() * 99999999999);
      if (!document.MAX_used) {
        document.MAX_used = ',';
      }
      var src = '';
      src += m3_u;
      src += "?zoneid=" + zoneId;
      src += '&cb=' + m3_r;
      if (document.MAX_used != ',') {
        src += "&exclude=" + document.MAX_used;
      }
      src += document.charset ? '&charset=' + document.charset : (document.characterSet ? '&charset=' + document.characterSet : '');
      src += "&loc=" + escape(window.location);
      if (document.referrer) {
        src += "&referer=" + escape(document.referrer);
      }
      if (document.context) {
        src += "&context=" + escape(document.context);
      }
      if (document.mmm_fo) {
        src += "&mmm_fo=1";
      }

      variables['window-width'] = $(window).width();
      variables['window-height'] = $(window).height();

      var variablesQuery = encodeUrlQuery(variables);
      if ('' !== variablesQuery) {
        src += '&' + variablesQuery;
      }

      var $element = $(this);

      var loadCallback = function(html) {
        $element.html(html);
        var hasContent = $.trim(html).length > 0;
        $element.trigger('openx-loaded', {hasContent: hasContent});

        if (hasContent) {
          trackEvent('Banner', 'Impression', 'zone-' + zoneId);
          if ($element.is(':visible') && $element.find('a[href]').length > 0) {
            trackEvent('Banner', 'Impression-Clickable', 'zone-' + zoneId);
          }
          $element.find('a[href]').on('click', function() {
            trackEvent('Banner', 'Click', 'zone-' + zoneId);
          });
        }
      };

      $.getJSON(src + '&callback=?', loadCallback);
    });
  };
})(jQuery, window);
