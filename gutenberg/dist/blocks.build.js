!function(e){function t(r){if(n[r])return n[r].exports;var a=n[r]={i:r,l:!1,exports:{}};return e[r].call(a.exports,a,a.exports,t),a.l=!0,a.exports}var n={};t.m=e,t.c=n,t.d=function(e,n,r){t.o(e,n)||Object.defineProperty(e,n,{configurable:!1,enumerable:!0,get:r})},t.n=function(e){var n=e&&e.__esModule?function(){return e.default}:function(){return e};return t.d(n,"a",n),n},t.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},t.p="",t(t.s=0)}([function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var r=n(1);n.n(r),n(2)},function(e,t){wp.i18n.setLocaleData({"":{}},"thundertix")},function(e,t,n){"use strict";var r=n(3),a=(n.n(r),n(4)),l=(n.n(a),wp.i18n.__),i=wp.blocks.registerBlockType,s=wp.element.useEffect,c=wp.components.Spinner;i("thundertix/events",{title:l("Events","thundertix"),description:l("This plugin allow us to share your next events with your audience.","thundertix"),category:"thundertix",icon:"calendar",attributes:{events:{type:"array",source:"children",selector:".thundertix-events"},isLoading:{type:"boolean",default:!0}},edit:function(e){var t=e.attributes,n=e.className,r=e.setAttributes,a=t.events,i=t.isLoading,u=thundertix_base_api+"/events";if(s(function(){r({isLoading:!0}),fetch(u).then(function(e){return e.json()}).then(function(e){return r({events:e,isLoading:!1})})},[]),i)return wp.element.createElement("p",null,wp.element.createElement(c,null),l("Loading Events","thundertix"));if("error"===a.status)return wp.element.createElement("a",{href:a.url,rel:"nofollow"},a.message);if(0===a.length)return wp.element.createElement("p",null,l("No Events","thundertix"));var o=function(e){var t=new Date(e),n={year:"numeric",month:"short",day:"numeric"};return t.toLocaleDateString("en-US",n)},m=function(e,t){return o(e)+" - "+o(t)},p=function(e){return e?wp.element.createElement("button",{className:"button button-success button-block"},"Buy Tickets"):null},d=function(e,t){return e?wp.element.createElement("span",{className:"warn sold-out-message"},wp.element.createElement("strong",null,t)):null};return wp.element.createElement("div",{className:n},wp.element.createElement("div",{className:"thundertix_section"},wp.element.createElement("div",{className:"thundertix_events"},a.map(function(e,t){var n=e.name,r=e.picture,a=e.description,l=e.on_sale,i=e.without_availability,s=e.sold_out_message,c=e.created_at,u=e.expires;return wp.element.createElement("div",{className:"event",key:t},wp.element.createElement("div",{className:"event-details"},wp.element.createElement("article",null,r?wp.element.createElement("div",{className:"event-image",style:{backgroundImage:"url("+r+")"}}):wp.element.createElement("div",{className:"not-event-image"}),wp.element.createElement("div",{className:"title-description"},wp.element.createElement("div",{className:"row event-title clear"},wp.element.createElement("h4",null,n),wp.element.createElement("div",{className:"row event-date clear"},m(c,u))),wp.element.createElement("div",{className:"event-description",dangerouslySetInnerHTML:{__html:a}}))),wp.element.createElement("div",{className:"event-actions"},p(l),d(i,s))))}))))},save:function(){return null}})},function(e,t){},function(e,t){}]);