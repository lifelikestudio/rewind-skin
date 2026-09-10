/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./src/outbound-tracking.js":
/*!**********************************!*\
  !*** ./src/outbound-tracking.js ***!
  \**********************************/
/***/ (() => {

eval("{function _typeof(o) { \"@babel/helpers - typeof\"; return _typeof = \"function\" == typeof Symbol && \"symbol\" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && \"function\" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? \"symbol\" : typeof o; }, _typeof(o); }\nfunction ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }\nfunction _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }\nfunction _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }\nfunction _toPropertyKey(t) { var i = _toPrimitive(t, \"string\"); return \"symbol\" == _typeof(i) ? i : i + \"\"; }\nfunction _toPrimitive(t, r) { if (\"object\" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || \"default\"); if (\"object\" != _typeof(i)) return i; throw new TypeError(\"@@toPrimitive must return a primitive value.\"); } return (\"string\" === r ? String : Number)(t); }\n/**\n * Rewind Skin — outbound link tracking for Umami.\n *\n * A delegated capture-phase listener covers links rendered after page load\n * without adding Umami's per-element event attributes.\n */\n(function () {\n  'use strict';\n\n  var OUTBOUND_CONFIG = {\n    hosts: {\n      'rewindskinco-book.as.me': {\n        event: 'booking-cta-click'\n      },\n      'www.instagram.com': {\n        event: 'social-profile-click',\n        props: {\n          network: 'instagram'\n        }\n      },\n      'ca.linkedin.com': {\n        event: 'social-profile-click',\n        props: {\n          network: 'linkedin'\n        }\n      },\n      'www.tiktok.com': {\n        event: 'social-profile-click',\n        props: {\n          network: 'tiktok'\n        }\n      }\n    },\n    sameSiteHosts: ['account.rewindskinco.com'],\n    bookingRootPath: '/schedule/4a0c3baa',\n    bookingManageEvent: 'booking-manage-click'\n  };\n  var resolvePlacement = function resolvePlacement(anchor) {\n    var explicit = anchor.closest('[data-rs-placement]');\n    if (explicit) return explicit.dataset.rsPlacement;\n    var section = anchor.closest('[data-section-type], .shopify-section');\n    if (!section) return 'unknown';\n    return section.dataset.sectionType || section.id || 'unknown';\n  };\n  var buildEvent = function buildEvent(anchor, url) {\n    var match = OUTBOUND_CONFIG.hosts[url.hostname];\n    if (!match) return null;\n    var eventName = match.event;\n    var props = _objectSpread({\n      destination: url.href,\n      placement: resolvePlacement(anchor)\n    }, match.props || {});\n    var isBookingRoot = url.pathname.replace(/\\/$/, '') === OUTBOUND_CONFIG.bookingRootPath;\n    var hasAppointmentContext = url.search.length > 0 || Boolean(anchor.dataset.rsTreatment);\n    if (eventName === 'booking-cta-click' && isBookingRoot && !hasAppointmentContext) {\n      eventName = OUTBOUND_CONFIG.bookingManageEvent;\n    }\n    var _anchor$dataset = anchor.dataset,\n      rsTreatment = _anchor$dataset.rsTreatment,\n      rsCategory = _anchor$dataset.rsCategory;\n    if (rsTreatment) props.treatment = rsTreatment;\n    if (rsCategory) props.category = rsCategory;\n    return {\n      eventName: eventName,\n      props: props\n    };\n  };\n  document.addEventListener('click', function (event) {\n    var _window$umami;\n    if (typeof ((_window$umami = window.umami) === null || _window$umami === void 0 ? void 0 : _window$umami.track) !== 'function') return;\n    if (!(event.target instanceof Element)) return;\n    var anchor = event.target.closest('a[href]');\n    if (!anchor) return;\n    var url;\n    try {\n      url = new URL(anchor.href, window.location.origin);\n    } catch (_unused) {\n      return;\n    }\n    if (url.hostname === window.location.hostname) return;\n    if (OUTBOUND_CONFIG.sameSiteHosts.includes(url.hostname)) return;\n    var tracked = buildEvent(anchor, url);\n    if (!tracked) return;\n    window.umami.track(tracked.eventName, tracked.props);\n  }, true);\n})();\n\n//# sourceURL=webpack://rewind-skin/./src/outbound-tracking.js?\n}");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = {};
/******/ 	__webpack_modules__["./src/outbound-tracking.js"]();
/******/ 	
/******/ })()
;