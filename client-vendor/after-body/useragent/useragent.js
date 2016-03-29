(function(f) {
  if (typeof exports === "object" && typeof module !== "undefined") {
    module.exports = f()
  } else if (typeof define === "function" && define.amd) {
    define([], f)
  } else {
    var g;
    if (typeof window !== "undefined") {
      g = window
    } else if (typeof global !== "undefined") {
      g = global
    } else if (typeof self !== "undefined") {
      g = self
    } else {
      g = this
    }
    g.UserAgent = f()
  }
})(function() {
  var define, module, exports;
  return (function e(t, n, r) {
    function s(o, u) {
      if (!n[o]) {
        if (!t[o]) {
          var a = typeof require == "function" && require;
          if (!u && a) {
            return a(o, !0);
          }
          if (i) {
            return i(o, !0);
          }
          var f = new Error("Cannot find module '" + o + "'");
          throw f.code = "MODULE_NOT_FOUND", f
        }
        var l = n[o] = {exports: {}};
        t[o][0].call(l.exports, function(e) {
          var n = t[o][1][e];
          return s(n ? n : e)
        }, l, l.exports, e, t, n, r)
      }
      return n[o].exports
    }

    var i = typeof require == "function" && require;
    for (var o = 0; o < r.length; o++) {
      s(r[o]);
    }
    return s
  })({
    1: [function(require, module, exports) {
      'use strict';

      /**
       * This is where all the magic comes from, specially crafted for `useragent`.
       */
      var regexps = require('./lib/regexps');

      /**
       * Reduce references by storing the lookups.
       */
      // OperatingSystem parsers:
      var osparsers = regexps.os
        , osparserslength = osparsers.length;

      // UserAgent parsers:
      var agentparsers = regexps.browser
        , agentparserslength = agentparsers.length;

      // Device parsers:
      var deviceparsers = regexps.device
        , deviceparserslength = deviceparsers.length;

      /**
       * The representation of a parsed user agent.
       *
       * @constructor
       * @param {String} family The name of the browser
       * @param {String} major Major version of the browser
       * @param {String} minor Minor version of the browser
       * @param {String} patch Patch version of the browser
       * @param {String} source The actual user agent string
       * @api public
       */
      function Agent(family, major, minor, patch, source) {
        this.family = family || 'Other';
        this.major = major || '0';
        this.minor = minor || '0';
        this.patch = patch || '0';
        this.source = source || '';
      }

      /**
       * OnDemand parsing of the Operating System.
       *
       * @type {OperatingSystem}
       * @api public
       */
      Object.defineProperty(Agent.prototype, 'os', {
        get: function lazyparse() {
          var userAgent = this.source
            , length = osparserslength
            , parsers = osparsers
            , i = 0
            , parser
            , res;

          for (; i < length; i++) {
            if (res = parsers[i][0].exec(userAgent)) {
              parser = parsers[i];

              if (parser[1]) {
                res[1] = parser[1].replace('$1', res[1]);
              }
              break;
            }
          }

          return Object.defineProperty(this, 'os', {
            value: !parser || !res
              ? new OperatingSystem()
              : new OperatingSystem(
              res[1]
              , parser[2] || res[2]
              , parser[3] || res[3]
              , parser[4] || res[4]
            )
          }).os;
        },

        /**
         * Bypass the OnDemand parsing and set an OperatingSystem instance.
         *
         * @param {OperatingSystem} os
         * @api public
         */
        set: function set(os) {
          if (!(os instanceof OperatingSystem)) {
            return false;
          }

          return Object.defineProperty(this, 'os', {
            value: os
          }).os;
        }
      });

      /**
       * OnDemand parsing of the Device type.
       *
       * @type {Device}
       * @api public
       */
      Object.defineProperty(Agent.prototype, 'device', {
        get: function lazyparse() {
          var userAgent = this.source
            , length = deviceparserslength
            , parsers = deviceparsers
            , i = 0
            , parser
            , res;

          for (; i < length; i++) {
            if (res = parsers[i][0].exec(userAgent)) {
              parser = parsers[i];

              if (parser[1]) {
                res[1] = parser[1].replace('$1', res[1]);
              }
              break;
            }
          }

          return Object.defineProperty(this, 'device', {
            value: !parser || !res
              ? new Device()
              : new Device(
              res[1]
              , parser[2] || res[2]
              , parser[3] || res[3]
              , parser[4] || res[4]
            )
          }).device;
        },

        /**
         * Bypass the OnDemand parsing and set an Device instance.
         *
         * @param {Device} device
         * @api public
         */
        set: function set(device) {
          if (!(device instanceof Device)) {
            return false;
          }

          return Object.defineProperty(this, 'device', {
            value: device
          }).device;
        }
      });
      /*** Generates a string output of the parsed user agent.
       *
       * @returns {String}
       * @api public
       */
      Agent.prototype.toAgent = function toAgent() {
        var output = this.family
          , version = this.toVersion();

        if (version) {
          output += ' ' + version;
        }
        return output;
      };

      /**
       * Generates a string output of the parser user agent and operating system.
       *
       * @returns {String}  "UserAgent 0.0.0 / OS"
       * @api public
       */
      Agent.prototype.toString = function toString() {
        var agent = this.toAgent()
          , os = this.os !== 'Other' ? this.os : false;

        return agent + (os ? ' / ' + os : '');
      };

      /**
       * Outputs a compiled veersion number of the user agent.
       *
       * @returns {String}
       * @api public
       */
      Agent.prototype.toVersion = function toVersion() {
        var version = '';

        if (this.major) {
          version += this.major;

          if (this.minor) {
            version += '.' + this.minor;

            // Special case here, the patch can also be Alpha, Beta etc so we need
            // to check if it's a string or not.
            if (this.patch) {
              version += (isNaN(+this.patch) ? ' ' : '.') + this.patch;
            }
          }
        }

        return version;
      };

      /**
       * Outputs a JSON string of the Agent.
       *
       * @returns {String}
       * @api public
       */
      Agent.prototype.toJSON = function toJSON() {
        return {
          family: this.family
          , major: this.major
          , minor: this.minor
          , patch: this.patch
          , device: this.device
          , os: this.os
        };
      };

      /**
       * The representation of a parsed Operating System.
       *
       * @constructor
       * @param {String} family The name of the os
       * @param {String} major Major version of the os
       * @param {String} minor Minor version of the os
       * @param {String} patch Patch version of the os
       * @api public
       */
      function OperatingSystem(family, major, minor, patch) {
        this.family = family || 'Other';
        this.major = major || '';
        this.minor = minor || '';
        this.patch = patch || '';
      }

      /**
       * Generates a stringified version of the Operating System.
       *
       * @returns {String} "Operating System 0.0.0"
       * @api public
       */
      OperatingSystem.prototype.toString = function toString() {
        var output = this.family
          , version = this.toVersion();

        if (version) {
          output += ' ' + version;
        }
        return output;
      };

      /**
       * Generates the version of the Operating System.
       *
       * @returns {String}
       * @api public
       */
      OperatingSystem.prototype.toVersion = function toVersion() {
        var version = '';

        if (this.major) {
          version += this.major;

          if (this.minor) {
            version += '.' + this.minor;

            // Special case here, the patch can also be Alpha, Beta etc so we need
            // to check if it's a string or not.
            if (this.patch) {
              version += (isNaN(+this.patch) ? ' ' : '.') + this.patch;
            }
          }
        }

        return version;
      };

      /**
       * Outputs a JSON string of the OS, values are defaulted to undefined so they
       * are not outputed in the stringify.
       *
       * @returns {String}
       * @api public
       */
      OperatingSystem.prototype.toJSON = function toJSON() {
        return {
          family: this.family
          , major: this.major || undefined
          , minor: this.minor || undefined
          , patch: this.patch || undefined
        };
      };

      /**
       * The representation of a parsed Device.
       *
       * @constructor
       * @param {String} family The name of the os
       * @api public
       */
      function Device(family, major, minor, patch) {
        this.family = family || 'Other';
        this.major = major || '';
        this.minor = minor || '';
        this.patch = patch || '';
      }

      /**
       * Generates a stringified version of the Device.
       *
       * @returns {String} "Device 0.0.0"
       * @api public
       */
      Device.prototype.toString = function toString() {
        var output = this.family
          , version = this.toVersion();

        if (version) {
          output += ' ' + version;
        }
        return output;
      };

      /**
       * Generates the version of the Device.
       *
       * @returns {String}
       * @api public
       */
      Device.prototype.toVersion = function toVersion() {
        var version = '';

        if (this.major) {
          version += this.major;

          if (this.minor) {
            version += '.' + this.minor;

            // Special case here, the patch can also be Alpha, Beta etc so we need
            // to check if it's a string or not.
            if (this.patch) {
              version += (isNaN(+this.patch) ? ' ' : '.') + this.patch;
            }
          }
        }

        return version;
      };

      /**
       * Get string representation.
       *
       * @returns {String}
       * @api public
       */
      Device.prototype.toString = function toString() {
        var output = this.family
          , version = this.toVersion();

        if (version) {
          output += ' ' + version;
        }
        return output;
      };

      /**
       * Outputs a JSON string of the Device, values are defaulted to undefined so they
       * are not outputed in the stringify.
       *
       * @returns {String}
       * @api public
       */
      Device.prototype.toJSON = function toJSON() {
        return {
          family: this.family
          , major: this.major || undefined
          , minor: this.minor || undefined
          , patch: this.patch || undefined
        };
      };

      /**
       * Nao that we have setup all the different classes and configured it we can
       * actually start assembling and exposing everything.
       */
      exports.Device = Device;
      exports.OperatingSystem = OperatingSystem;
      exports.Agent = Agent;

      /**
       * Parses the user agent string with the generated parsers from the
       * ua-parser project on google code.
       *
       * @param {String} userAgent The user agent string
       * @param {String} jsAgent Optional UA from js to detect chrome frame
       * @returns {Agent}
       * @api public
       */
      exports.parse = function parse(userAgent, jsAgent) {
        if (!userAgent) {
          return new Agent();
        }

        var length = agentparserslength
          , parsers = agentparsers
          , i = 0
          , parser
          , res;

        for (; i < length; i++) {
          if (res = parsers[i][0].exec(userAgent)) {
            parser = parsers[i];

            if (parser[1]) {
              res[1] = parser[1].replace('$1', res[1]);
            }
            if (!jsAgent) {
              return new Agent(
                res[1]
                , parser[2] || res[2]
                , parser[3] || res[3]
                , parser[4] || res[4]
                , userAgent
              );
            }

            break;
          }
        }

        // Return early if we didn't find an match, but might still be able to parse
        // the os and device, so make sure we supply it with the source
        if (!parser || !res) {
          return new Agent('', '', '', '', userAgent);
        }

        // Detect Chrome Frame, but make sure it's enabled! So we need to check for
        // the Chrome/ so we know that it's actually using Chrome under the hood.
        if (jsAgent && ~jsAgent.indexOf('Chrome/') && ~userAgent.indexOf('chromeframe')) {
          res[1] = 'Chrome Frame (IE ' + res[1] + '.' + res[2] + ')';

          // Run the JavaScripted userAgent string through the parser again so we can
          // update the version numbers;
          parser = parse(jsAgent);
          parser[2] = parser.major;
          parser[3] = parser.minor;
          parser[4] = parser.patch;
        }

        return new Agent(
          res[1]
          , parser[2] || res[2]
          , parser[3] || res[3]
          , parser[4] || res[4]
          , userAgent
        );
      };

      /**
       * Does a more inaccurate but more common check for useragents identification.
       * The version detection is from the jQuery.com library and is licensed under
       * MIT.
       *
       * @param {String} useragent The user agent
       * @returns {Object} matches
       * @api public
       */
      exports.is = function is(useragent) {
        var ua = (useragent || '').toLowerCase()
          , details = {
            chrome: false
            , firefox: false
            , ie: false
            , mobile_safari: false
            , mozilla: false
            , opera: false
            , safari: false
            , webkit: false
            , version: (ua.match(exports.is.versionRE) || [0, "0"])[1]
          };

        if (~ua.indexOf('webkit')) {
          details.webkit = true;

          if (~ua.indexOf('chrome')) {
            details.chrome = true;
          } else if (~ua.indexOf('safari')) {
            details.safari = true;

            if (~ua.indexOf('mobile') && ~ua.indexOf('apple')) {
              details.mobile_safari = true;
            }
          }
        } else if (~ua.indexOf('opera')) {
          details.opera = true;
        } else if (~ua.indexOf('mozilla') && !~ua.indexOf('compatible')) {
          details.mozilla = true;

          if (~ua.indexOf('firefox')) {
            details.firefox = true;
          }
        } else if (~ua.indexOf('msie')) {
          details.ie = true;
        }

        return details;
      };

      /**
       * Parses out the version numbers.
       *
       * @type {RegExp}
       * @api private
       */
      exports.is.versionRE = /.+(?:rv|it|ra|ie)[\/: ]([\d.]+)/;

      /**
       * Transform a JSON object back to a valid userAgent string
       *
       * @param {Object} details
       * @returns {Agent}
       */
      exports.fromJSON = function fromJSON(details) {
        if (typeof details === 'string') {
          details = JSON.parse(details);
        }

        var agent = new Agent(details.family, details.major, details.minor, details.patch)
          , os = details.os;

        // The device family was added in v2.0
        if ('device' in details) {
          agent.device = new Device(details.device.family);
        } else {
          agent.device = new Device();
        }

        if ('os' in details && os) {
          // In v1.1.0 we only parsed out the Operating System name, not the full
          // version which we added in v2.0. To provide backwards compatible we should
          // we should set the details.os as family
          if (typeof os === 'string') {
            agent.os = new OperatingSystem(os);
          } else {
            agent.os = new OperatingSystem(os.family, os.major, os.minor, os.patch);
          }
        }

        return agent;
      };

    }, {"./lib/regexps": 2}], 2: [function(require, module, exports) {
      var parser;

      exports.browser = Object.create(null);

      parser = Object.create(null);
      parser[0] = new RegExp("(HbbTV)/(\\d+)\\.(\\d+)\\.(\\d+) \\(");
      parser[1] = 0;
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.browser[0] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(Chimera|SeaMonkey|Camino)/(\\d+)\\.(\\d+)\\.?([ab]?\\d+[a-z]*)?");
      parser[1] = 0;
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.browser[1] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(Pale[Mm]oon)/(\\d+)\\.(\\d+)\\.?(\\d+)?");
      parser[1] = "Pale Moon (Firefox Variant)";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.browser[2] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(Fennec)/(\\d+)\\.(\\d+)\\.?([ab]?\\d+[a-z]*)");
      parser[1] = "Firefox Mobile";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.browser[3] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(Fennec)/(\\d+)\\.(\\d+)(pre)");
      parser[1] = "Firefox Mobile";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.browser[4] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(Fennec)/(\\d+)\\.(\\d+)");
      parser[1] = "Firefox Mobile";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.browser[5] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("Mobile.*(Firefox)/(\\d+)\\.(\\d+)");
      parser[1] = "Firefox Mobile";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.browser[6] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(Namoroka|Shiretoko|Minefield)/(\\d+)\\.(\\d+)\\.(\\d+(?:pre)?)");
      parser[1] = "Firefox ($1)";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.browser[7] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(Firefox)/(\\d+)\\.(\\d+)(a\\d+[a-z]*)");
      parser[1] = "Firefox Alpha";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.browser[8] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(Firefox)/(\\d+)\\.(\\d+)(b\\d+[a-z]*)");
      parser[1] = "Firefox Beta";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.browser[9] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(Firefox)-(?:\\d+\\.\\d+)?/(\\d+)\\.(\\d+)(a\\d+[a-z]*)");
      parser[1] = "Firefox Alpha";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.browser[10] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(Firefox)-(?:\\d+\\.\\d+)?/(\\d+)\\.(\\d+)(b\\d+[a-z]*)");
      parser[1] = "Firefox Beta";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.browser[11] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(Namoroka|Shiretoko|Minefield)/(\\d+)\\.(\\d+)([ab]\\d+[a-z]*)?");
      parser[1] = "Firefox ($1)";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.browser[12] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(Firefox).*Tablet browser (\\d+)\\.(\\d+)\\.(\\d+)");
      parser[1] = "MicroB";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.browser[13] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(MozillaDeveloperPreview)/(\\d+)\\.(\\d+)([ab]\\d+[a-z]*)?");
      parser[1] = 0;
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.browser[14] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(Flock)/(\\d+)\\.(\\d+)(b\\d+?)");
      parser[1] = 0;
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.browser[15] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(RockMelt)/(\\d+)\\.(\\d+)\\.(\\d+)");
      parser[1] = 0;
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.browser[16] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(Navigator)/(\\d+)\\.(\\d+)\\.(\\d+)");
      parser[1] = "Netscape";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.browser[17] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(Navigator)/(\\d+)\\.(\\d+)([ab]\\d+)");
      parser[1] = "Netscape";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.browser[18] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(Netscape6)/(\\d+)\\.(\\d+)\\.?([ab]?\\d+)?");
      parser[1] = "Netscape";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.browser[19] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(MyIBrow)/(\\d+)\\.(\\d+)");
      parser[1] = "My Internet Browser";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.browser[20] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(Opera Tablet).*Version/(\\d+)\\.(\\d+)(?:\\.(\\d+))?");
      parser[1] = 0;
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.browser[21] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(Opera)/.+Opera Mobi.+Version/(\\d+)\\.(\\d+)");
      parser[1] = "Opera Mobile";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.browser[22] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(Opera)/(\\d+)\\.(\\d+).+Opera Mobi");
      parser[1] = "Opera Mobile";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.browser[23] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("Opera Mobi.+(Opera)(?:/|\\s+)(\\d+)\\.(\\d+)");
      parser[1] = "Opera Mobile";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.browser[24] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("Opera Mobi");
      parser[1] = "Opera Mobile";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.browser[25] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(Opera Mini)(?:/att)?/(\\d+)\\.(\\d+)");
      parser[1] = 0;
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.browser[26] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(Opera)/9.80.*Version/(\\d+)\\.(\\d+)(?:\\.(\\d+))?");
      parser[1] = 0;
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.browser[27] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(?:Mobile Safari).*(OPR)/(\\d+)\\.(\\d+)\\.(\\d+)");
      parser[1] = "Opera Mobile";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.browser[28] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(?:Chrome).*(OPR)/(\\d+)\\.(\\d+)\\.(\\d+)");
      parser[1] = "Opera";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.browser[29] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(hpw|web)OS/(\\d+)\\.(\\d+)(?:\\.(\\d+))?");
      parser[1] = "webOS Browser";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.browser[30] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(luakit)");
      parser[1] = "LuaKit";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.browser[31] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(Snowshoe)/(\\d+)\\.(\\d+).(\\d+)");
      parser[1] = 0;
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.browser[32] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(Lightning)/(\\d+)\\.(\\d+)\\.?((?:[ab]?\\d+[a-z]*)|(?:\\d*))");
      parser[1] = 0;
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.browser[33] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(Firefox)/(\\d+)\\.(\\d+)\\.(\\d+(?:pre)?) \\(Swiftfox\\)");
      parser[1] = "Swiftfox";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.browser[34] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(Firefox)/(\\d+)\\.(\\d+)([ab]\\d+[a-z]*)? \\(Swiftfox\\)");
      parser[1] = "Swiftfox";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.browser[35] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(rekonq)/(\\d+)\\.(\\d+)\\.?(\\d+)? Safari");
      parser[1] = "Rekonq";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.browser[36] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("rekonq");
      parser[1] = "Rekonq";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.browser[37] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(conkeror|Conkeror)/(\\d+)\\.(\\d+)\\.?(\\d+)?");
      parser[1] = "Conkeror";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.browser[38] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(konqueror)/(\\d+)\\.(\\d+)\\.(\\d+)");
      parser[1] = "Konqueror";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.browser[39] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(WeTab)-Browser");
      parser[1] = 0;
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.browser[40] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(Comodo_Dragon)/(\\d+)\\.(\\d+)\\.(\\d+)");
      parser[1] = "Comodo Dragon";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.browser[41] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(YottaaMonitor|BrowserMob|HttpMonitor|YandexBot|Slurp|BingPreview|PagePeeker|ThumbShotsBot|WebThumb|URL2PNG|ZooShot|GomezA|Catchpoint bot|Willow Internet Crawler|Google SketchUp|Read%20Later)");
      parser[1] = 0;
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.browser[42] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(Symphony) (\\d+).(\\d+)");
      parser[1] = 0;
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.browser[43] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(Minimo)");
      parser[1] = 0;
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.browser[44] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("PLAYSTATION 3.+WebKit");
      parser[1] = "NetFront NX";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.browser[45] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("PLAYSTATION 3");
      parser[1] = "NetFront";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.browser[46] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(PlayStation Portable)");
      parser[1] = "NetFront";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.browser[47] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(PlayStation Vita)");
      parser[1] = "NetFront NX";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.browser[48] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("AppleWebKit.+ (NX)/(\\d+)\\.(\\d+)\\.(\\d+)");
      parser[1] = "NetFront NX";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.browser[49] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(Nintendo 3DS)");
      parser[1] = "NetFront NX";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.browser[50] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(Silk)/(\\d+)\\.(\\d+)(?:\\.([0-9\\-]+))?");
      parser[1] = "Amazon Silk";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.browser[51] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(Puffin)/(\\d+)\\.(\\d+)(?:\\.(\\d+))?");
      parser[1] = 0;
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.browser[52] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(CrMo)/(\\d+)\\.(\\d+)\\.(\\d+)\\.(\\d+)");
      parser[1] = "Chrome Mobile";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.browser[53] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(CriOS)/(\\d+)\\.(\\d+)\\.(\\d+)\\.(\\d+)");
      parser[1] = "Chrome Mobile iOS";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.browser[54] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(Chrome)/(\\d+)\\.(\\d+)\\.(\\d+)\\.(\\d+) Mobile");
      parser[1] = "Chrome Mobile";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.browser[55] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(chromeframe)/(\\d+)\\.(\\d+)\\.(\\d+)");
      parser[1] = "Chrome Frame";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.browser[56] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(UCBrowser)[ /](\\d+)\\.(\\d+)\\.(\\d+)");
      parser[1] = "UC Browser";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.browser[57] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(UC Browser)[ /](\\d+)\\.(\\d+)\\.(\\d+)");
      parser[1] = 0;
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.browser[58] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(UC Browser|UCBrowser|UCWEB)(\\d+)\\.(\\d+)\\.(\\d+)");
      parser[1] = "UC Browser";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.browser[59] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(SLP Browser)/(\\d+)\\.(\\d+)");
      parser[1] = "Tizen Browser";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.browser[60] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(SE 2\\.X) MetaSr (\\d+)\\.(\\d+)");
      parser[1] = "Sogou Explorer";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.browser[61] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(baidubrowser)[/\\s](\\d+)");
      parser[1] = "Baidu Browser";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.browser[62] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(FlyFlow)/(\\d+)\\.(\\d+)");
      parser[1] = "Baidu Explorer";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.browser[63] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(MQQBrowser/Mini)(?:(\\d+)(?:\\.(\\d+)(?:\\.(\\d+))?)?)?");
      parser[1] = "QQ Browser Mini";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.browser[64] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(MQQBrowser)(?:/(\\d+)(?:\\.(\\d+)(?:\\.(\\d+))?)?)?");
      parser[1] = "QQ Browser Mobile";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.browser[65] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(QQBrowser)(?:/(\\d+)(?:\\.(\\d+)\\.(\\d+)(?:\\.(\\d+))?)?)?");
      parser[1] = "QQ Browser";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.browser[66] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(Pingdom.com_bot_version_)(\\d+)\\.(\\d+)");
      parser[1] = "PingdomBot";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.browser[67] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(facebookexternalhit)/(\\d+)\\.(\\d+)");
      parser[1] = "FacebookBot";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.browser[68] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(LinkedInBot)/(\\d+)\\.(\\d+)");
      parser[1] = "LinkedInBot";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.browser[69] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(Twitterbot)/(\\d+)\\.(\\d+)");
      parser[1] = "TwitterBot";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.browser[70] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("Google.*/\\+/web/snippet");
      parser[1] = "GooglePlusBot";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.browser[71] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(Rackspace Monitoring)/(\\d+)\\.(\\d+)");
      parser[1] = "RackspaceBot";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.browser[72] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(PyAMF)/(\\d+)\\.(\\d+)\\.(\\d+)");
      parser[1] = 0;
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.browser[73] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(YaBrowser)/(\\d+)\\.(\\d+)\\.(\\d+)");
      parser[1] = "Yandex Browser";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.browser[74] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(Chrome)/(\\d+)\\.(\\d+)\\.(\\d+).* MRCHROME");
      parser[1] = "Mail.ru Chromium Browser";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.browser[75] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(AOL) (\\d+)\\.(\\d+); AOLBuild (\\d+)");
      parser[1] = 0;
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.browser[76] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(AdobeAIR|FireWeb|Jasmine|ANTGalio|Midori|Fresco|Lobo|PaleMoon|Maxthon|Lynx|OmniWeb|Dillo|Camino|Demeter|Fluid|Fennec|Epiphany|Shiira|Sunrise|Flock|Netscape|Lunascape|WebPilot|NetFront|Netfront|Konqueror|SeaMonkey|Kazehakase|Vienna|Iceape|Iceweasel|IceWeasel|Iron|K-Meleon|Sleipnir|Galeon|GranParadiso|Opera Mini|iCab|NetNewsWire|ThunderBrowse|Iris|UP\\.Browser|Bunjalloo|Google Earth|Raven for Mac|Openwave)/(\\d+)\\.(\\d+)\\.(\\d+)");
      parser[1] = 0;
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.browser[77] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("MSOffice 12");
      parser[1] = "Outlook";
      parser[2] = "2007";
      parser[3] = 0;
      parser[4] = 0;
      exports.browser[78] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("MSOffice 14");
      parser[1] = "Outlook";
      parser[2] = "2010";
      parser[3] = 0;
      parser[4] = 0;
      exports.browser[79] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("Microsoft Outlook 15\\.\\d+\\.\\d+");
      parser[1] = "Outlook";
      parser[2] = "2013";
      parser[3] = 0;
      parser[4] = 0;
      exports.browser[80] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(Airmail) (\\d+)\\.(\\d+)(?:\\.(\\d+))?");
      parser[1] = 0;
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.browser[81] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(Thunderbird)/(\\d+)\\.(\\d+)\\.(\\d+(?:pre)?)");
      parser[1] = "Thunderbird";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.browser[82] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(Chromium|Chrome)/(\\d+)\\.(\\d+)\\.(\\d+)");
      parser[1] = 0;
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.browser[83] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("\\b(Dolphin)(?: |HDCN/|/INT\\-)(\\d+)\\.(\\d+)\\.?(\\d+)?");
      parser[1] = 0;
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.browser[84] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(bingbot|Bolt|Jasmine|IceCat|Skyfire|Midori|Maxthon|Lynx|Arora|IBrowse|Dillo|Camino|Shiira|Fennec|Phoenix|Chrome|Flock|Netscape|Lunascape|Epiphany|WebPilot|Opera Mini|Opera|NetFront|Netfront|Konqueror|Googlebot|SeaMonkey|Kazehakase|Vienna|Iceape|Iceweasel|IceWeasel|Iron|K-Meleon|Sleipnir|Galeon|GranParadiso|iCab|NetNewsWire|Space Bison|Stainless|Orca|Dolfin|BOLT|Minimo|Tizen Browser|Polaris|Abrowser|Planetweb|ICE Browser|mDolphin)/(\\d+)\\.(\\d+)\\.?(\\d+)?");
      parser[1] = 0;
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.browser[85] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(Chromium|Chrome)/(\\d+)\\.(\\d+)");
      parser[1] = 0;
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.browser[86] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(IEMobile)[ /](\\d+)\\.(\\d+)");
      parser[1] = "IE Mobile";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.browser[87] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(iRider|Crazy Browser|SkipStone|iCab|Lunascape|Sleipnir|Maemo Browser) (\\d+)\\.(\\d+)\\.(\\d+)");
      parser[1] = 0;
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.browser[88] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(iCab|Lunascape|Opera|Android|Jasmine|Polaris) (\\d+)\\.(\\d+)\\.?(\\d+)?");
      parser[1] = 0;
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.browser[89] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(Kindle)/(\\d+)\\.(\\d+)");
      parser[1] = 0;
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.browser[90] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(Android) Donut");
      parser[1] = 0;
      parser[2] = "1";
      parser[3] = "2";
      parser[4] = 0;
      exports.browser[91] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(Android) Eclair");
      parser[1] = 0;
      parser[2] = "2";
      parser[3] = "1";
      parser[4] = 0;
      exports.browser[92] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(Android) Froyo");
      parser[1] = 0;
      parser[2] = "2";
      parser[3] = "2";
      parser[4] = 0;
      exports.browser[93] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(Android) Gingerbread");
      parser[1] = 0;
      parser[2] = "2";
      parser[3] = "3";
      parser[4] = 0;
      exports.browser[94] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(Android) Honeycomb");
      parser[1] = 0;
      parser[2] = "3";
      parser[3] = 0;
      parser[4] = 0;
      exports.browser[95] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(MSIE) (\\d+)\\.(\\d+).*XBLWP7");
      parser[1] = "IE Large Screen";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.browser[96] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(Obigo)InternetBrowser");
      parser[1] = 0;
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.browser[97] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(Obigo)\\-Browser");
      parser[1] = 0;
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.browser[98] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(Obigo|OBIGO)[^\\d]*(\\d+)(?:.(\\d+))?");
      parser[1] = "Obigo";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.browser[99] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(MAXTHON|Maxthon) (\\d+)\\.(\\d+)");
      parser[1] = "Maxthon";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.browser[100] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(Maxthon|MyIE2|Uzbl|Shiira)");
      parser[1] = 0;
      parser[2] = "0";
      parser[3] = 0;
      parser[4] = 0;
      exports.browser[101] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(BrowseX) \\((\\d+)\\.(\\d+)\\.(\\d+)");
      parser[1] = 0;
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.browser[102] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(NCSA_Mosaic)/(\\d+)\\.(\\d+)");
      parser[1] = "NCSA Mosaic";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.browser[103] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(POLARIS)/(\\d+)\\.(\\d+)");
      parser[1] = "Polaris";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.browser[104] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(Embider)/(\\d+)\\.(\\d+)");
      parser[1] = "Polaris";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.browser[105] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(BonEcho)/(\\d+)\\.(\\d+)\\.?([ab]?\\d+)?");
      parser[1] = "Bon Echo";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.browser[106] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(CFNetwork)(?:/(\\d+)\\.(\\d+)\\.?(\\d+)?)?");
      parser[1] = "CFNetwork";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.browser[107] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(iPod).+Version/(\\d+)\\.(\\d+)\\.(\\d+)");
      parser[1] = "Mobile Safari";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.browser[108] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(iPod).*Version/(\\d+)\\.(\\d+)");
      parser[1] = "Mobile Safari";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.browser[109] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(iPhone).*Version/(\\d+)\\.(\\d+)\\.(\\d+)");
      parser[1] = "Mobile Safari";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.browser[110] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(iPhone).*Version/(\\d+)\\.(\\d+)");
      parser[1] = "Mobile Safari";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.browser[111] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(iPad).*Version/(\\d+)\\.(\\d+)\\.(\\d+)");
      parser[1] = "Mobile Safari";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.browser[112] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(iPad).*Version/(\\d+)\\.(\\d+)");
      parser[1] = "Mobile Safari";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.browser[113] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(iPod|iPhone|iPad);.*CPU.*OS (\\d+)_(\\d+)(?:_(\\d+))?.*Mobile");
      parser[1] = "Mobile Safari";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.browser[114] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(iPod|iPhone|iPad)");
      parser[1] = "Mobile Safari";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.browser[115] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(AvantGo) (\\d+).(\\d+)");
      parser[1] = 0;
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.browser[116] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(OneBrowser)/(\\d+).(\\d+)");
      parser[1] = "ONE Browser";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.browser[117] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(Avant)");
      parser[1] = 0;
      parser[2] = "1";
      parser[3] = 0;
      parser[4] = 0;
      exports.browser[118] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(QtCarBrowser)");
      parser[1] = 0;
      parser[2] = "1";
      parser[3] = 0;
      parser[4] = 0;
      exports.browser[119] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("^(iBrowser/Mini)(\\d+).(\\d+)");
      parser[1] = "iBrowser Mini";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.browser[120] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("^(iBrowser|iRAPP)/(\\d+).(\\d+)");
      parser[1] = 0;
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.browser[121] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("^(Nokia)");
      parser[1] = "Nokia Services (WAP) Browser";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.browser[122] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(NokiaBrowser)/(\\d+)\\.(\\d+).(\\d+)\\.(\\d+)");
      parser[1] = "Nokia Browser";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.browser[123] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(NokiaBrowser)/(\\d+)\\.(\\d+).(\\d+)");
      parser[1] = "Nokia Browser";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.browser[124] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(NokiaBrowser)/(\\d+)\\.(\\d+)");
      parser[1] = "Nokia Browser";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.browser[125] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(BrowserNG)/(\\d+)\\.(\\d+).(\\d+)");
      parser[1] = "Nokia Browser";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.browser[126] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(Series60)/5\\.0");
      parser[1] = "Nokia Browser";
      parser[2] = "7";
      parser[3] = "0";
      parser[4] = 0;
      exports.browser[127] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(Series60)/(\\d+)\\.(\\d+)");
      parser[1] = "Nokia OSS Browser";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.browser[128] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(S40OviBrowser)/(\\d+)\\.(\\d+)\\.(\\d+)\\.(\\d+)");
      parser[1] = "Ovi Browser";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.browser[129] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(Nokia)[EN]?(\\d+)");
      parser[1] = 0;
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.browser[130] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(BB10);");
      parser[1] = "BlackBerry WebKit";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.browser[131] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(PlayBook).+RIM Tablet OS (\\d+)\\.(\\d+)\\.(\\d+)");
      parser[1] = "BlackBerry WebKit";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.browser[132] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(Black[bB]erry).+Version/(\\d+)\\.(\\d+)\\.(\\d+)");
      parser[1] = "BlackBerry WebKit";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.browser[133] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(Black[bB]erry)\\s?(\\d+)");
      parser[1] = "BlackBerry";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.browser[134] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(OmniWeb)/v(\\d+)\\.(\\d+)");
      parser[1] = 0;
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.browser[135] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(Blazer)/(\\d+)\\.(\\d+)");
      parser[1] = "Palm Blazer";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.browser[136] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(Pre)/(\\d+)\\.(\\d+)");
      parser[1] = "Palm Pre";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.browser[137] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(ELinks)/(\\d+)\\.(\\d+)");
      parser[1] = 0;
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.browser[138] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(ELinks) \\((\\d+)\\.(\\d+)");
      parser[1] = 0;
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.browser[139] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(Links) \\((\\d+)\\.(\\d+)");
      parser[1] = 0;
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.browser[140] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(QtWeb) Internet Browser/(\\d+)\\.(\\d+)");
      parser[1] = 0;
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.browser[141] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(PhantomJS)/(\\d+)\\.(\\d+)\\.(\\d+)");
      parser[1] = 0;
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.browser[142] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(AppleWebKit)/(\\d+)\\.?(\\d+)?\\+ .* Safari");
      parser[1] = "WebKit Nightly";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.browser[143] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(Version)/(\\d+)\\.(\\d+)(?:\\.(\\d+))?.*Safari/");
      parser[1] = "Safari";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.browser[144] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(Safari)/\\d+");
      parser[1] = 0;
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.browser[145] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(OLPC)/Update(\\d+)\\.(\\d+)");
      parser[1] = 0;
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.browser[146] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(OLPC)/Update()\\.(\\d+)");
      parser[1] = 0;
      parser[2] = "0";
      parser[3] = 0;
      parser[4] = 0;
      exports.browser[147] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(SEMC\\-Browser)/(\\d+)\\.(\\d+)");
      parser[1] = 0;
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.browser[148] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(Teleca)");
      parser[1] = "Teleca Browser";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.browser[149] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(Phantom)/V(\\d+)\\.(\\d+)");
      parser[1] = "Phantom Browser";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.browser[150] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("Trident(.*)rv.(\\d+)\\.(\\d+)");
      parser[1] = "IE";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.browser[151] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(Espial)/(\\d+)(?:\\.(\\d+))?(?:\\.(\\d+))?");
      parser[1] = 0;
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.browser[152] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(AppleWebKit)/(\\d+)\\.(\\d+)\\.(\\d+)");
      parser[1] = "AppleMail";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.browser[153] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(Firefox)/(\\d+)\\.(\\d+)\\.(\\d+)");
      parser[1] = 0;
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.browser[154] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(Firefox)/(\\d+)\\.(\\d+)(pre|[ab]\\d+[a-z]*)?");
      parser[1] = 0;
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.browser[155] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("([MS]?IE) (\\d+)\\.(\\d+)");
      parser[1] = "IE";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.browser[156] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(python-requests)/(\\d+)\\.(\\d+)");
      parser[1] = "Python Requests";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.browser[157] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(Thunderbird)/(\\d+)\\.(\\d+)\\.?(\\d+)?");
      parser[1] = 0;
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.browser[158] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(Wget)/(\\d+)\\.(\\d+)\\.?([ab]?\\d+[a-z]*)");
      parser[1] = 0;
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.browser[159] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(curl)/(\\d+)\\.(\\d+)\\.(\\d+)");
      parser[1] = "cURL";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.browser[160] = parser;

      exports.browser.length = 161;

      exports.device = Object.create(null);

      parser = Object.create(null);
      parser[0] = new RegExp("HTC ([A-Z][a-z0-9]+) Build");
      parser[1] = "HTC $1";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.device[0] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("HTC ([A-Z][a-z0-9 ]+) \\d+\\.\\d+\\.\\d+\\.\\d+");
      parser[1] = "HTC $1";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.device[1] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("HTC_Touch_([A-Za-z0-9]+)");
      parser[1] = "HTC Touch ($1)";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.device[2] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("USCCHTC(\\d+)");
      parser[1] = "HTC $1 (US Cellular)";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.device[3] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("Sprint APA(9292)");
      parser[1] = "HTC $1 (Sprint)";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.device[4] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("HTC ([A-Za-z0-9]+ [A-Z])");
      parser[1] = "HTC $1";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.device[5] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("HTC[-_/\\s]([A-Za-z0-9]+)");
      parser[1] = "HTC $1";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.device[6] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(ADR[A-Za-z0-9]+)");
      parser[1] = "HTC $1";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.device[7] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(HTC)");
      parser[1] = 0;
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.device[8] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(QtCarBrowser)");
      parser[1] = "Tesla Model S";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.device[9] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(SamsungSGHi560)");
      parser[1] = "Samsung SGHi560";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.device[10] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(SCH-[A-Za-z0-9_-]+)");
      parser[1] = "Samsung $1";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.device[11] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(SGH-[A-Za-z0-9_-]+)");
      parser[1] = "Samsung $1";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.device[12] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(GT-[A-Za-z0-9_-]+)");
      parser[1] = "Samsung $1";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.device[13] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(SM-[A-Za-z0-9_-]+)");
      parser[1] = "Samsung $1";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.device[14] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(SPH-[A-Za-z0-9_-]+)");
      parser[1] = "Samsung $1";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.device[15] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("SAMSUNG-([A-Za-z0-9_-]+)");
      parser[1] = "Samsung $1";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.device[16] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("SAMSUNG ([A-Za-z0-9_-]+)");
      parser[1] = "Samsung $1";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.device[17] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("SonyEricsson([A-Za-z0-9]+)/");
      parser[1] = "Ericsson $1";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.device[18] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("PLAYSTATION 3");
      parser[1] = "PlayStation 3";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.device[19] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(PlayStation (:?Portable|Vita))");
      parser[1] = 0;
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.device[20] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(PlayStation (:?\\d+))");
      parser[1] = 0;
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.device[21] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(KFOT Build)");
      parser[1] = "Kindle Fire";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.device[22] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(KFTT Build)");
      parser[1] = "Kindle Fire HD";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.device[23] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(KFJWI Build)");
      parser[1] = "Kindle Fire HD 8.9\" WiFi";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.device[24] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(KFJWA Build)");
      parser[1] = "Kindle Fire HD 8.9\" 4G";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.device[25] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(KFSOWI Build)");
      parser[1] = "Kindle Fire HD 7\" WiFi";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.device[26] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(KFTHWI Build)");
      parser[1] = "Kindle Fire HDX 7\" WiFi";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.device[27] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(KFTHWA Build)");
      parser[1] = "Kindle Fire HDX 7\" 4G";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.device[28] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(KFAPWI Build)");
      parser[1] = "Kindle Fire HDX 8.9\" WiFi";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.device[29] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(KFAPWA Build)");
      parser[1] = "Kindle Fire HDX 8.9\" 4G";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.device[30] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(Kindle Fire)");
      parser[1] = 0;
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.device[31] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(Kindle)");
      parser[1] = 0;
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.device[32] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(Silk)/(\\d+)\\.(\\d+)(?:\\.([0-9\\-]+))?");
      parser[1] = "Kindle Fire";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.device[33] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("NokiaN([0-9]+)");
      parser[1] = "Nokia N$1";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.device[34] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("NOKIA([A-Za-z0-9\\v-]+)");
      parser[1] = "Nokia $1";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.device[35] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("Nokia([A-Za-z0-9\\v-]+)");
      parser[1] = "Nokia $1";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.device[36] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("NOKIA ([A-Za-z0-9\\-]+)");
      parser[1] = "Nokia $1";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.device[37] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("Nokia ([A-Za-z0-9\\-]+)");
      parser[1] = "Nokia $1";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.device[38] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("Lumia ([A-Za-z0-9\\-]+)");
      parser[1] = "Lumia $1";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.device[39] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("Symbian");
      parser[1] = "Nokia";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.device[40] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("BB10; ([A-Za-z0-9\\- ]+)\\)");
      parser[1] = "BlackBerry $1";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.device[41] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(PlayBook).+RIM Tablet OS");
      parser[1] = "BlackBerry Playbook";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.device[42] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("Black[Bb]erry ([0-9]+);");
      parser[1] = "BlackBerry $1";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.device[43] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("Black[Bb]erry([0-9]+)");
      parser[1] = "BlackBerry $1";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.device[44] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("Black[Bb]erry;");
      parser[1] = "BlackBerry";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.device[45] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(Pre)/(\\d+)\\.(\\d+)");
      parser[1] = "Palm Pre";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.device[46] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(Pixi)/(\\d+)\\.(\\d+)");
      parser[1] = "Palm Pixi";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.device[47] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(Touch[Pp]ad)/(\\d+)\\.(\\d+)");
      parser[1] = "HP TouchPad";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.device[48] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("HPiPAQ([A-Za-z0-9]+)/(\\d+).(\\d+)");
      parser[1] = "HP iPAQ $1";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.device[49] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("Palm([A-Za-z0-9]+)");
      parser[1] = "Palm $1";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.device[50] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("Treo([A-Za-z0-9]+)");
      parser[1] = "Palm Treo $1";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.device[51] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("webOS.*(P160UNA)/(\\d+).(\\d+)");
      parser[1] = "HP Veer";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.device[52] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(AppleTV)");
      parser[1] = "AppleTV";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.device[53] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("AdsBot-Google-Mobile");
      parser[1] = "Spider";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.device[54] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("Googlebot-Mobile/(\\d+).(\\d+)");
      parser[1] = "Spider";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.device[55] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("Googlebot/\\d+.\\d+");
      parser[1] = "Spider";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.device[56] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("NING/(\\d+).(\\d+)");
      parser[1] = "Spider";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.device[57] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("MsnBot-Media /(\\d+).(\\d+)");
      parser[1] = "Spider";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.device[58] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(iPad) Simulator;");
      parser[1] = 0;
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.device[59] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(iPad);");
      parser[1] = 0;
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.device[60] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(iPod) touch;");
      parser[1] = 0;
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.device[61] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(iPod);");
      parser[1] = 0;
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.device[62] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(iPhone) Simulator;");
      parser[1] = 0;
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.device[63] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(iPhone);");
      parser[1] = 0;
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.device[64] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("acer_([A-Za-z0-9]+)_");
      parser[1] = "Acer $1";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.device[65] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("acer_([A-Za-z0-9]+)_");
      parser[1] = "Acer $1";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.device[66] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("ALCATEL-([A-Za-z0-9]+)");
      parser[1] = "Alcatel $1";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.device[67] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("Alcatel-([A-Za-z0-9]+)");
      parser[1] = "Alcatel $1";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.device[68] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("ALCATEL_ONE_TOUCH_([A-Za-z0-9]+)");
      parser[1] = "Alcatel ONE TOUCH $1";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.device[69] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("ALCATEL (ONE TOUCH [A-Za-z0-9]+)");
      parser[1] = "Alcatel $1";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.device[70] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("ALCATEL (one touch [A-Za-z0-9]+)");
      parser[1] = "Alcatel $1";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.device[71] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("ALCATEL ([A-Za-z0-9]+)");
      parser[1] = "Alcatel $1";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.device[72] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("Amoi\\-([A-Za-z0-9]+)");
      parser[1] = "Amoi $1";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.device[73] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("AMOI\\-([A-Za-z0-9]+)");
      parser[1] = "Amoi $1";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.device[74] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("Asus\\-([A-Za-z0-9]+)");
      parser[1] = "Asus $1";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.device[75] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("ASUS\\-([A-Za-z0-9]+)");
      parser[1] = "Asus $1";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.device[76] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("BIRD\\-([A-Za-z0-9]+)");
      parser[1] = "Bird $1";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.device[77] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("BIRD\\.([A-Za-z0-9]+)");
      parser[1] = "Bird $1";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.device[78] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("BIRD ([A-Za-z0-9]+)");
      parser[1] = "Bird $1";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.device[79] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("Dell ([A-Za-z0-9]+)");
      parser[1] = "Dell $1";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.device[80] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("DoCoMo/2\\.0 ([A-Za-z0-9]+)");
      parser[1] = "DoCoMo $1";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.device[81] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("([A-Za-z0-9]+)_W\\;FOMA");
      parser[1] = "DoCoMo $1";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.device[82] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("([A-Za-z0-9]+)\\;FOMA");
      parser[1] = "DoCoMo $1";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.device[83] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("Huawei([A-Za-z0-9]+)");
      parser[1] = "Huawei $1";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.device[84] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("HUAWEI-([A-Za-z0-9]+)");
      parser[1] = "Huawei $1";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.device[85] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("vodafone([A-Za-z0-9]+)");
      parser[1] = "Huawei Vodafone $1";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.device[86] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("i\\-mate ([A-Za-z0-9]+)");
      parser[1] = "i-mate $1";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.device[87] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("Kyocera\\-([A-Za-z0-9]+)");
      parser[1] = "Kyocera $1";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.device[88] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("KWC\\-([A-Za-z0-9]+)");
      parser[1] = "Kyocera $1";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.device[89] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("Lenovo\\-([A-Za-z0-9]+)");
      parser[1] = "Lenovo $1";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.device[90] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("Lenovo_([A-Za-z0-9]+)");
      parser[1] = "Lenovo $1";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.device[91] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(HbbTV)/[0-9]+\\.[0-9]+\\.[0-9]+");
      parser[1] = 0;
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.device[92] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("LG/([A-Za-z0-9]+)");
      parser[1] = "LG $1";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.device[93] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("LG-LG([A-Za-z0-9]+)");
      parser[1] = "LG $1";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.device[94] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("LGE-LG([A-Za-z0-9]+)");
      parser[1] = "LG $1";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.device[95] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("LGE VX([A-Za-z0-9]+)");
      parser[1] = "LG $1";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.device[96] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("LG ([A-Za-z0-9]+)");
      parser[1] = "LG $1";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.device[97] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("LGE LG\\-AX([A-Za-z0-9]+)");
      parser[1] = "LG $1";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.device[98] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("LG\\-([A-Za-z0-9]+)");
      parser[1] = "LG $1";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.device[99] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("LGE\\-([A-Za-z0-9]+)");
      parser[1] = "LG $1";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.device[100] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("LG([A-Za-z0-9]+)");
      parser[1] = "LG $1";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.device[101] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(KIN)\\.One (\\d+)\\.(\\d+)");
      parser[1] = "Microsoft $1";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.device[102] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(KIN)\\.Two (\\d+)\\.(\\d+)");
      parser[1] = "Microsoft $1";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.device[103] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(Motorola)\\-([A-Za-z0-9]+)");
      parser[1] = 0;
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.device[104] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("MOTO\\-([A-Za-z0-9]+)");
      parser[1] = "Motorola $1";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.device[105] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("MOT\\-([A-Za-z0-9]+)");
      parser[1] = "Motorola $1";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.device[106] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp(" (DROID RAZR [A-Za-z0-9 ]+) ");
      parser[1] = "Motorola $1";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.device[107] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp(" (DROID[2 ][A-Za-z0-9 ]+) ");
      parser[1] = "Motorola $1";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.device[108] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp(" (Droid2| )");
      parser[1] = "Motorola $1";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.device[109] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp(" (DROID2| )");
      parser[1] = "Motorola $1";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.device[110] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(Nintendo WiiU)");
      parser[1] = "Nintendo Wii U";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.device[111] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("Nintendo (DS|3DS|DSi|Wii);");
      parser[1] = "Nintendo $1";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.device[112] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("Pantech([A-Za-z0-9]+)");
      parser[1] = "Pantech $1";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.device[113] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("Philips([A-Za-z0-9]+)");
      parser[1] = "Philips $1";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.device[114] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("Philips ([A-Za-z0-9]+)");
      parser[1] = "Philips $1";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.device[115] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("SAMSUNG-([A-Za-z0-9\\-]+)");
      parser[1] = "Samsung $1";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.device[116] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("SAMSUNG\\; ([A-Za-z0-9\\-]+)");
      parser[1] = "Samsung $1";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.device[117] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("ZTE-([A-Za-z0-9\\-]+)");
      parser[1] = "ZTE $1";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.device[118] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("ZTE ([A-Za-z0-9\\-]+)");
      parser[1] = "ZTE $1";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.device[119] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("ZTE_([A-Za-z0-9\\-]+)");
      parser[1] = "ZTE $1";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.device[120] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("Dreamcast");
      parser[1] = "Sega Dreamcast";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.device[121] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("Softbank/1\\.0/([A-Za-z0-9]+)");
      parser[1] = "Softbank $1";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.device[122] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("Softbank/2\\.0/([A-Za-z0-9]+)");
      parser[1] = "Softbank $1";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.device[123] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("Sony([^ ]+) ");
      parser[1] = "Sony $1";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.device[124] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(WebTV)/(\\d+).(\\d+)");
      parser[1] = 0;
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.device[125] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("Android[\\- ][\\d]+\\.[\\d]+\\.[\\d]+; [^;]+; ([A-Za-z0-9 _-]+) ");
      parser[1] = 0;
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.device[126] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("Android[\\- ][\\d]+\\.[\\d]+; [^;]+; ([A-Za-z0-9 _-]+) ");
      parser[1] = 0;
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.device[127] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("Android[\\- ][\\d]+\\.[\\d]+; [^;]+; WOWMobile ([A-Za-z0-9 _-]+) ");
      parser[1] = 0;
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.device[128] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("Android[\\- ][\\d]+\\.[\\d]+\\-update1; [^;]+; ([A-Za-z0-9 _-]+) ");
      parser[1] = 0;
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.device[129] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("Android[\\- ][\\d]+\\.[\\d]+\\.[\\d]+;[^;]+;([A-Za-z0-9 _-]+) ");
      parser[1] = 0;
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.device[130] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("Android[\\- ][\\d]+\\.[\\d]+\\.[\\d]+; ([A-Za-z0-9 _-]+) ");
      parser[1] = 0;
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.device[131] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("Android[\\- ][\\d]+\\.[\\d]+; ([A-Za-z0-9 _-]+) ");
      parser[1] = 0;
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.device[132] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("Android[\\- ][\\d]+\\.[\\d]+\\.[\\d]+; [^;]+; ([A-Za-z0-9\\.\\/_-]+) ");
      parser[1] = 0;
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.device[133] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("Android[\\- ][\\d]+\\.[\\d]+; [^;]+; ([A-Za-z0-9\\.\\/_-]+) ");
      parser[1] = 0;
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.device[134] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(hiptop|avantgo|plucker|xiino|blazer|elaine|up.browser|up.link|mmp|smartphone|midp|wap|vodafone|o2|pocket|mobile|pda)");
      parser[1] = "Generic Smartphone";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.device[135] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("^(1207|3gso|4thp|501i|502i|503i|504i|505i|506i|6310|6590|770s|802s|a wa|acer|acs\\-|airn|alav|asus|attw|au\\-m|aur |aus |abac|acoo|aiko|alco|alca|amoi|anex|anny|anyw|aptu|arch|argo|bell|bird|bw\\-n|bw\\-u|beck|benq|bilb|blac|c55/|cdm\\-|chtm|capi|comp|cond|craw|dall|dbte|dc\\-s|dica|ds\\-d|ds12|dait|devi|dmob|doco|dopo|el49|erk0|esl8|ez40|ez60|ez70|ezos|ezze|elai|emul|eric|ezwa|fake|fly\\-|fly_|g\\-mo|g1 u|g560|gf\\-5|grun|gene|go.w|good|grad|hcit|hd\\-m|hd\\-p|hd\\-t|hei\\-|hp i|hpip|hs\\-c|htc |htc\\-|htca|htcg)");
      parser[1] = "Generic Feature Phone";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.device[136] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("^(htcp|htcs|htct|htc_|haie|hita|huaw|hutc|i\\-20|i\\-go|i\\-ma|i230|iac|iac\\-|iac/|ig01|im1k|inno|iris|jata|java|kddi|kgt|kgt/|kpt |kwc\\-|klon|lexi|lg g|lg\\-a|lg\\-b|lg\\-c|lg\\-d|lg\\-f|lg\\-g|lg\\-k|lg\\-l|lg\\-m|lg\\-o|lg\\-p|lg\\-s|lg\\-t|lg\\-u|lg\\-w|lg/k|lg/l|lg/u|lg50|lg54|lge\\-|lge/|lynx|leno|m1\\-w|m3ga|m50/|maui|mc01|mc21|mcca|medi|meri|mio8|mioa|mo01|mo02|mode|modo|mot |mot\\-|mt50|mtp1|mtv |mate|maxo|merc|mits|mobi|motv|mozz|n100|n101|n102|n202|n203|n300|n302|n500|n502|n505|n700|n701|n710|nec\\-|nem\\-|newg|neon)");
      parser[1] = "Generic Feature Phone";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.device[137] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("^(netf|noki|nzph|o2 x|o2\\-x|opwv|owg1|opti|oran|ot\\-s|p800|pand|pg\\-1|pg\\-2|pg\\-3|pg\\-6|pg\\-8|pg\\-c|pg13|phil|pn\\-2|pt\\-g|palm|pana|pire|pock|pose|psio|qa\\-a|qc\\-2|qc\\-3|qc\\-5|qc\\-7|qc07|qc12|qc21|qc32|qc60|qci\\-|qwap|qtek|r380|r600|raks|rim9|rove|s55/|sage|sams|sc01|sch\\-|scp\\-|sdk/|se47|sec\\-|sec0|sec1|semc|sgh\\-|shar|sie\\-|sk\\-0|sl45|slid|smb3|smt5|sp01|sph\\-|spv |spv\\-|sy01|samm|sany|sava|scoo|send|siem|smar|smit|soft|sony|t\\-mo|t218|t250|t600|t610|t618|tcl\\-|tdg\\-|telm|tim\\-|ts70|tsm\\-|tsm3|tsm5|tx\\-9|tagt)");
      parser[1] = "Generic Feature Phone";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.device[138] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("^(talk|teli|topl|tosh|up.b|upg1|utst|v400|v750|veri|vk\\-v|vk40|vk50|vk52|vk53|vm40|vx98|virg|vite|voda|vulc|w3c |w3c\\-|wapj|wapp|wapu|wapm|wig |wapi|wapr|wapv|wapy|wapa|waps|wapt|winc|winw|wonu|x700|xda2|xdag|yas\\-|your|zte\\-|zeto|aste|audi|avan|blaz|brew|brvw|bumb|ccwa|cell|cldc|cmd\\-|dang|eml2|fetc|hipt|http|ibro|idea|ikom|ipaq|jbro|jemu|jigs|keji|kyoc|kyok|libw|m\\-cr|midp|mmef|moto|mwbp|mywa|newt|nok6|o2im|pant|pdxg|play|pluc|port|prox|rozo|sama|seri|smal|symb|treo|upsi|vx52|vx53|vx60|vx61|vx70|vx80|vx81|vx83|vx85|wap\\-|webc|whit|wmlb|xda\\-|xda_)");
      parser[1] = "Generic Feature Phone";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.device[139] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(bingbot|bot|borg|google(^tv)|yahoo|slurp|msnbot|msrbot|openbot|archiver|netresearch|lycos|scooter|altavista|teoma|gigabot|baiduspider|blitzbot|oegp|charlotte|furlbot|http%20client|polybot|htdig|ichiro|mogimogi|larbin|pompos|scrubby|searchsight|seekbot|semanticdiscovery|silk|snappy|speedy|spider|voila|vortex|voyager|zao|zeal|fast\\-webcrawler|converacrawler|dataparksearch|findlinks|crawler|Netvibes|Sogou Pic Spider|ICC\\-Crawler|Innovazion Crawler|Daumoa|EtaoSpider|A6\\-Indexer|YisouSpider|Riddler|DBot|wsr\\-agent|Xenu|SeznamBot|PaperLiBot|SputnikBot|CCBot|ProoXiBot|Scrapy|Genieo|Screaming Frog|YahooCacheSystem|CiBra|Nutch)");
      parser[1] = "Spider";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.device[140] = parser;

      exports.device.length = 141;

      exports.os = Object.create(null);

      parser = Object.create(null);
      parser[0] = new RegExp("HbbTV/\\d+\\.\\d+\\.\\d+ \\( ;(LG)E ;NetCast 4.0");
      parser[1] = 0;
      parser[2] = "2013";
      parser[3] = 0;
      parser[4] = 0;
      exports.os[0] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("HbbTV/\\d+\\.\\d+\\.\\d+ \\( ;(LG)E ;NetCast 3.0");
      parser[1] = 0;
      parser[2] = "2012";
      parser[3] = 0;
      parser[4] = 0;
      exports.os[1] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("HbbTV/1.1.1 \\(;;;;;\\) Maple_2011");
      parser[1] = "Samsung";
      parser[2] = "2011";
      parser[3] = 0;
      parser[4] = 0;
      exports.os[2] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("HbbTV/\\d+\\.\\d+\\.\\d+ \\(;(Samsung);SmartTV([0-9]{4});.*FXPDEUC");
      parser[1] = 0;
      parser[2] = 0;
      parser[3] = "UE40F7000";
      parser[4] = 0;
      exports.os[3] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("HbbTV/\\d+\\.\\d+\\.\\d+ \\(;(Samsung);SmartTV([0-9]{4});.*MST12DEUC");
      parser[1] = 0;
      parser[2] = 0;
      parser[3] = "UE32F4500";
      parser[4] = 0;
      exports.os[4] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("HbbTV/1.1.1 \\(; (Philips);.*NETTV/4");
      parser[1] = 0;
      parser[2] = "2013";
      parser[3] = 0;
      parser[4] = 0;
      exports.os[5] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("HbbTV/1.1.1 \\(; (Philips);.*NETTV/3");
      parser[1] = 0;
      parser[2] = "2012";
      parser[3] = 0;
      parser[4] = 0;
      exports.os[6] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("HbbTV/1.1.1 \\(; (Philips);.*NETTV/2");
      parser[1] = 0;
      parser[2] = "2011";
      parser[3] = 0;
      parser[4] = 0;
      exports.os[7] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("HbbTV/\\d+\\.\\d+\\.\\d+.*(firetv)-firefox-plugin (\\d+).(\\d+).(\\d+)");
      parser[1] = "FireHbbTV";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.os[8] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("HbbTV/\\d+\\.\\d+\\.\\d+ \\(.*; ?([a-zA-Z]+) ?;.*(201[1-9]).*\\)");
      parser[1] = 0;
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.os[9] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(Windows Phone) (?:OS[ /])?(\\d+)\\.(\\d+)");
      parser[1] = 0;
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.os[10] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(Android)[ \\-/](\\d+)\\.(\\d+)(?:[.\\-]([a-z0-9]+))?");
      parser[1] = 0;
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.os[11] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(Android) Donut");
      parser[1] = 0;
      parser[2] = "1";
      parser[3] = "2";
      parser[4] = 0;
      exports.os[12] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(Android) Eclair");
      parser[1] = 0;
      parser[2] = "2";
      parser[3] = "1";
      parser[4] = 0;
      exports.os[13] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(Android) Froyo");
      parser[1] = 0;
      parser[2] = "2";
      parser[3] = "2";
      parser[4] = 0;
      exports.os[14] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(Android) Gingerbread");
      parser[1] = 0;
      parser[2] = "2";
      parser[3] = "3";
      parser[4] = 0;
      exports.os[15] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(Android) Honeycomb");
      parser[1] = 0;
      parser[2] = "3";
      parser[3] = 0;
      parser[4] = 0;
      exports.os[16] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("^UCWEB.*; (Adr) (\\d+)\\.(\\d+)(?:[.\\-]([a-z0-9]+))?;");
      parser[1] = "Android";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.os[17] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("^UCWEB.*; (iPad OS|iPh OS) (\\d+)_(\\d+)(?:_(\\d+))?;");
      parser[1] = "iOS";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.os[18] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("^UCWEB.*; (wds) (\\d+)\\.(\\d+)(?:\\.(\\d+))?;");
      parser[1] = "Windows Phone";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.os[19] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("^(JUC).*; ?U; ?(?:Android)?(\\d+)\\.(\\d+)(?:[\\.\\-]([a-z0-9]+))?");
      parser[1] = "Android";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.os[20] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(Silk-Accelerated=[a-z]{4,5})");
      parser[1] = "Android";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.os[21] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(XBLWP7)");
      parser[1] = "Windows Phone";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.os[22] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(Windows ?Mobile)");
      parser[1] = "Windows Mobile";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.os[23] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(Windows (?:NT 5\\.2|NT 5\\.1))");
      parser[1] = "Windows XP";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.os[24] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(Windows NT 6\\.1)");
      parser[1] = "Windows 7";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.os[25] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(Windows NT 6\\.0)");
      parser[1] = "Windows Vista";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.os[26] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(Win 9x 4\\.90)");
      parser[1] = "Windows ME";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.os[27] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(Windows 98|Windows XP|Windows ME|Windows 95|Windows CE|Windows 7|Windows NT 4\\.0|Windows Vista|Windows 2000|Windows 3.1)");
      parser[1] = 0;
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.os[28] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(Windows NT 6\\.2; ARM;)");
      parser[1] = "Windows RT";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.os[29] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(Windows NT 6\\.2)");
      parser[1] = "Windows 8";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.os[30] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(Windows NT 6\\.3; ARM;)");
      parser[1] = "Windows RT 8.1";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.os[31] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(Windows NT 6\\.3)");
      parser[1] = "Windows 8.1";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.os[32] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(Windows NT 5\\.0)");
      parser[1] = "Windows 2000";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.os[33] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(WinNT4.0)");
      parser[1] = "Windows NT 4.0";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.os[34] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(Windows ?CE)");
      parser[1] = "Windows CE";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.os[35] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("Win ?(95|98|3.1|NT|ME|2000)");
      parser[1] = "Windows $1";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.os[36] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("Win16");
      parser[1] = "Windows 3.1";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.os[37] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("Win32");
      parser[1] = "Windows 95";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.os[38] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(Tizen)/(\\d+)\\.(\\d+)");
      parser[1] = 0;
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.os[39] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(Mac OS X) (\\d+)[_.](\\d+)(?:[_.](\\d+))?");
      parser[1] = 0;
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.os[40] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp(" (Dar)(win)/(9).(\\d+).*\\((?:i386|x86_64|Power Macintosh)\\)");
      parser[1] = "Mac OS X";
      parser[2] = "10";
      parser[3] = "5";
      parser[4] = 0;
      exports.os[41] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp(" (Dar)(win)/(10).(\\d+).*\\((?:i386|x86_64)\\)");
      parser[1] = "Mac OS X";
      parser[2] = "10";
      parser[3] = "6";
      parser[4] = 0;
      exports.os[42] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp(" (Dar)(win)/(11).(\\d+).*\\((?:i386|x86_64)\\)");
      parser[1] = "Mac OS X";
      parser[2] = "10";
      parser[3] = "7";
      parser[4] = 0;
      exports.os[43] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp(" (Dar)(win)/(12).(\\d+).*\\((?:i386|x86_64)\\)");
      parser[1] = "Mac OS X";
      parser[2] = "10";
      parser[3] = "8";
      parser[4] = 0;
      exports.os[44] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp(" (Dar)(win)/(13).(\\d+).*\\((?:i386|x86_64)\\)");
      parser[1] = "Mac OS X";
      parser[2] = "10";
      parser[3] = "9";
      parser[4] = 0;
      exports.os[45] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("Mac_PowerPC");
      parser[1] = "Mac OS";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.os[46] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(?:PPC|Intel) (Mac OS X)");
      parser[1] = 0;
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.os[47] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(CPU OS|iPhone OS|CPU iPhone) +(\\d+)[_\\.](\\d+)(?:[_\\.](\\d+))?");
      parser[1] = "iOS";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.os[48] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(iPhone|iPad|iPod); Opera");
      parser[1] = "iOS";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.os[49] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(iPhone|iPad|iPod).*Mac OS X.*Version/(\\d+)\\.(\\d+)");
      parser[1] = "iOS";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.os[50] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(AppleTV)/(\\d+)\\.(\\d+)");
      parser[1] = "ATV OS X";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.os[51] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(CFNetwork)/(5)48\\.0\\.3.* Darwin/11\\.0\\.0");
      parser[1] = "iOS";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.os[52] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(CFNetwork)/(5)48\\.(0)\\.4.* Darwin/(1)1\\.0\\.0");
      parser[1] = "iOS";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.os[53] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(CFNetwork)/(5)48\\.(1)\\.4");
      parser[1] = "iOS";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.os[54] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(CFNetwork)/(4)85\\.1(3)\\.9");
      parser[1] = "iOS";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.os[55] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(CFNetwork)/(6)09\\.(1)\\.4");
      parser[1] = "iOS";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.os[56] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(CFNetwork)/(6)(0)9");
      parser[1] = "iOS";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.os[57] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(CFNetwork)/6(7)2\\.(1)\\.13");
      parser[1] = "iOS";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.os[58] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(CFNetwork)/6(7)2\\.(1)\\.(1)4");
      parser[1] = "iOS";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.os[59] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(CF)(Network)/6(7)(2)\\.1\\.15");
      parser[1] = "iOS";
      parser[2] = "7";
      parser[3] = "1";
      parser[4] = 0;
      exports.os[60] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(CFNetwork)/6(7)2\\.(0)\\.(?:2|8)");
      parser[1] = "iOS";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.os[61] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(CFNetwork)/709\\.1");
      parser[1] = "iOS";
      parser[2] = "8";
      parser[3] = "0.b5";
      parser[4] = 0;
      exports.os[62] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("CFNetwork/.* Darwin/(9)\\.\\d+");
      parser[1] = "iOS";
      parser[2] = "1";
      parser[3] = 0;
      parser[4] = 0;
      exports.os[63] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("CFNetwork/.* Darwin/(10)\\.\\d+");
      parser[1] = "iOS";
      parser[2] = "4";
      parser[3] = 0;
      parser[4] = 0;
      exports.os[64] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("CFNetwork/.* Darwin/(11)\\.\\d+");
      parser[1] = "iOS";
      parser[2] = "5";
      parser[3] = 0;
      parser[4] = 0;
      exports.os[65] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("CFNetwork/.* Darwin/(13)\\.\\d+");
      parser[1] = "iOS";
      parser[2] = "6";
      parser[3] = 0;
      parser[4] = 0;
      exports.os[66] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("CFNetwork/6.* Darwin/(14)\\.\\d+");
      parser[1] = "iOS";
      parser[2] = "7";
      parser[3] = 0;
      parser[4] = 0;
      exports.os[67] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("CFNetwork/7.* Darwin/(14)\\.\\d+");
      parser[1] = "iOS";
      parser[2] = "8";
      parser[3] = "0";
      parser[4] = 0;
      exports.os[68] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("\\b(iOS[ /]|iPhone(?:/| v|[ _]OS[/,]|; | OS : |\\d,\\d/|\\d,\\d; )|iPad/)(\\d{1,2})[_\\.](\\d{1,2})(?:[_\\.](\\d+))?");
      parser[1] = "iOS";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.os[69] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(CrOS) [a-z0-9_]+ (\\d+)\\.(\\d+)(?:\\.(\\d+))?");
      parser[1] = "Chrome OS";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.os[70] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("([Dd]ebian)");
      parser[1] = "Debian";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.os[71] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(Linux Mint)(?:/(\\d+))?");
      parser[1] = 0;
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.os[72] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(Mandriva)(?: Linux)?/(?:[\\d.-]+m[a-z]{2}(\\d+).(\\d))?");
      parser[1] = 0;
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.os[73] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(Symbian[Oo][Ss])[/ ](\\d+)\\.(\\d+)");
      parser[1] = "Symbian OS";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.os[74] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(Symbian/3).+NokiaBrowser/7\\.3");
      parser[1] = "Symbian^3 Anna";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.os[75] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(Symbian/3).+NokiaBrowser/7\\.4");
      parser[1] = "Symbian^3 Belle";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.os[76] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(Symbian/3)");
      parser[1] = "Symbian^3";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.os[77] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("\\b(Series 60|SymbOS|S60Version|S60V\\d|S60\\b)");
      parser[1] = "Symbian OS";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.os[78] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(MeeGo)");
      parser[1] = 0;
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.os[79] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("Symbian [Oo][Ss]");
      parser[1] = "Symbian OS";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.os[80] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("Series40;");
      parser[1] = "Nokia Series 40";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.os[81] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("Series30Plus;");
      parser[1] = "Nokia Series 30 Plus";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.os[82] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(BB10);.+Version/(\\d+)\\.(\\d+)\\.(\\d+)");
      parser[1] = "BlackBerry OS";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.os[83] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(Black[Bb]erry)[0-9a-z]+/(\\d+)\\.(\\d+)\\.(\\d+)(?:\\.(\\d+))?");
      parser[1] = "BlackBerry OS";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.os[84] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(Black[Bb]erry).+Version/(\\d+)\\.(\\d+)\\.(\\d+)(?:\\.(\\d+))?");
      parser[1] = "BlackBerry OS";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.os[85] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(RIM Tablet OS) (\\d+)\\.(\\d+)\\.(\\d+)");
      parser[1] = "BlackBerry Tablet OS";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.os[86] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(Play[Bb]ook)");
      parser[1] = "BlackBerry Tablet OS";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.os[87] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(Black[Bb]erry)");
      parser[1] = "BlackBerry OS";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.os[88] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("\\((?:Mobile|Tablet);.+Firefox/\\d+\\.\\d+");
      parser[1] = "Firefox OS";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.os[89] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(BREW)[ /](\\d+)\\.(\\d+)\\.(\\d+)");
      parser[1] = 0;
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.os[90] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(BREW);");
      parser[1] = 0;
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.os[91] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(Brew MP|BMP)[ /](\\d+)\\.(\\d+)\\.(\\d+)");
      parser[1] = "Brew MP";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.os[92] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("BMP;");
      parser[1] = "Brew MP";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.os[93] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(GoogleTV)(?: (\\d+)\\.(\\d+)(?:\\.(\\d+))?|/[\\da-z]+)");
      parser[1] = 0;
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.os[94] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(WebTV)/(\\d+).(\\d+)");
      parser[1] = 0;
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.os[95] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(hpw|web)OS/(\\d+)\\.(\\d+)(?:\\.(\\d+))?");
      parser[1] = "webOS";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.os[96] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(VRE);");
      parser[1] = 0;
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.os[97] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(Fedora|Red Hat|PCLinuxOS|Puppy|Ubuntu|Kindle|Bada|Lubuntu|BackTrack|Slackware|(?:Free|Open|Net|\\b)BSD)[/ ](\\d+)\\.(\\d+)(?:\\.(\\d+)(?:\\.(\\d+))?)?");
      parser[1] = 0;
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.os[98] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(Linux)[ /](\\d+)\\.(\\d+)(?:\\.(\\d+))?.*gentoo");
      parser[1] = "Gentoo";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.os[99] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("\\((Bada);");
      parser[1] = 0;
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.os[100] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(Windows|Android|WeTab|Maemo)");
      parser[1] = 0;
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.os[101] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(Ubuntu|Kubuntu|Arch Linux|CentOS|Slackware|Gentoo|openSUSE|SUSE|Red Hat|Fedora|PCLinuxOS|Gentoo|Mageia|(?:Free|Open|Net|\\b)BSD)");
      parser[1] = 0;
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.os[102] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(Linux)(?:[ /](\\d+)\\.(\\d+)(?:\\.(\\d+))?)?");
      parser[1] = 0;
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.os[103] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("SunOS");
      parser[1] = "Solaris";
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.os[104] = parser;
      parser = Object.create(null);
      parser[0] = new RegExp("(Red Hat)");
      parser[1] = 0;
      parser[2] = 0;
      parser[3] = 0;
      parser[4] = 0;
      exports.os[105] = parser;

      exports.os.length = 106;
    }, {}]
  }, {}, [1])(1)
});
