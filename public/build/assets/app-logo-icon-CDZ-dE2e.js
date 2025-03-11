import{r as m,j as E}from"./app-BqBBs0yN.js";/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Re=e=>e.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase(),me=(...e)=>e.filter((o,r,t)=>!!o&&o.trim()!==""&&t.indexOf(o)===r).join(" ").trim();/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */var Ve={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ie=m.forwardRef(({color:e="currentColor",size:o=24,strokeWidth:r=2,absoluteStrokeWidth:t,className:n="",children:s,iconNode:a,...p},d)=>m.createElement("svg",{ref:d,...Ve,width:o,height:o,stroke:e,strokeWidth:t?Number(r)*24/Number(o):r,className:me("lucide",n),...p},[...a.map(([f,g])=>m.createElement(f,g)),...Array.isArray(s)?s:[s]]));/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Mr=(e,o)=>{const r=m.forwardRef(({className:t,...n},s)=>m.createElement(Ie,{ref:s,iconNode:o,className:me(`lucide-${Re(e)}`,t),...n}));return r.displayName=`${e}`,r};function he(e){var o,r,t="";if(typeof e=="string"||typeof e=="number")t+=e;else if(typeof e=="object")if(Array.isArray(e)){var n=e.length;for(o=0;o<n;o++)e[o]&&(r=he(e[o]))&&(t&&(t+=" "),t+=r)}else for(r in e)e[r]&&(t&&(t+=" "),t+=r);return t}function ve(){for(var e,o,r=0,t="",n=arguments.length;r<n;r++)(e=arguments[r])&&(o=he(e))&&(t&&(t+=" "),t+=o);return t}const te="-",Pe=e=>{const o=je(e),{conflictingClassGroups:r,conflictingClassGroupModifiers:t}=e;return{getClassGroupId:a=>{const p=a.split(te);return p[0]===""&&p.length!==1&&p.shift(),xe(p,o)||Ee(a)},getConflictingClassGroupIds:(a,p)=>{const d=r[a]||[];return p&&t[a]?[...d,...t[a]]:d}}},xe=(e,o)=>{var a;if(e.length===0)return o.classGroupId;const r=e[0],t=o.nextPart.get(r),n=t?xe(e.slice(1),t):void 0;if(n)return n;if(o.validators.length===0)return;const s=e.join(te);return(a=o.validators.find(({validator:p})=>p(s)))==null?void 0:a.classGroupId},de=/^\[(.+)\]$/,Ee=e=>{if(de.test(e)){const o=de.exec(e)[1],r=o==null?void 0:o.substring(0,o.indexOf(":"));if(r)return"arbitrary.."+r}},je=e=>{const{theme:o,classGroups:r}=e,t={nextPart:new Map,validators:[]};for(const n in r)Q(r[n],t,n,o);return t},Q=(e,o,r,t)=>{e.forEach(n=>{if(typeof n=="string"){const s=n===""?o:ue(o,n);s.classGroupId=r;return}if(typeof n=="function"){if(Ge(n)){Q(n(t),o,r,t);return}o.validators.push({validator:n,classGroupId:r});return}Object.entries(n).forEach(([s,a])=>{Q(a,ue(o,s),r,t)})})},ue=(e,o)=>{let r=e;return o.split(te).forEach(t=>{r.nextPart.has(t)||r.nextPart.set(t,{nextPart:new Map,validators:[]}),r=r.nextPart.get(t)}),r},Ge=e=>e.isThemeGetter,Ne=e=>{if(e<1)return{get:()=>{},set:()=>{}};let o=0,r=new Map,t=new Map;const n=(s,a)=>{r.set(s,a),o++,o>e&&(o=0,t=r,r=new Map)};return{get(s){let a=r.get(s);if(a!==void 0)return a;if((a=t.get(s))!==void 0)return n(s,a),a},set(s,a){r.has(s)?r.set(s,a):n(s,a)}}},Y="!",ee=":",Te=ee.length,Oe=e=>{const{prefix:o,experimentalParseClassName:r}=e;let t=n=>{const s=[];let a=0,p=0,d=0,f;for(let y=0;y<n.length;y++){let w=n[y];if(a===0&&p===0){if(w===ee){s.push(n.slice(d,y)),d=y+Te;continue}if(w==="/"){f=y;continue}}w==="["?a++:w==="]"?a--:w==="("?p++:w===")"&&p--}const g=s.length===0?n:n.substring(d),x=_e(g),C=x!==g,S=f&&f>d?f-d:void 0;return{modifiers:s,hasImportantModifier:C,baseClassName:x,maybePostfixModifierPosition:S}};if(o){const n=o+ee,s=t;t=a=>a.startsWith(n)?s(a.substring(n.length)):{isExternal:!0,modifiers:[],hasImportantModifier:!1,baseClassName:a,maybePostfixModifierPosition:void 0}}if(r){const n=t;t=s=>r({className:s,parseClassName:n})}return t},_e=e=>e.endsWith(Y)?e.substring(0,e.length-1):e.startsWith(Y)?e.substring(1):e,Be=e=>{const o=Object.fromEntries(e.orderSensitiveModifiers.map(t=>[t,!0]));return t=>{if(t.length<=1)return t;const n=[];let s=[];return t.forEach(a=>{a[0]==="["||o[a]?(n.push(...s.sort(),a),s=[]):s.push(a)}),n.push(...s.sort()),n}},We=e=>({cache:Ne(e.cacheSize),parseClassName:Oe(e),sortModifiers:Be(e),...Pe(e)}),Fe=/\s+/,$e=(e,o)=>{const{parseClassName:r,getClassGroupId:t,getConflictingClassGroupIds:n,sortModifiers:s}=o,a=[],p=e.trim().split(Fe);let d="";for(let f=p.length-1;f>=0;f-=1){const g=p[f],{isExternal:x,modifiers:C,hasImportantModifier:S,baseClassName:y,maybePostfixModifierPosition:w}=r(g);if(x){d=g+(d.length>0?" "+d:d);continue}let L=!!w,R=t(L?y.substring(0,w):y);if(!R){if(!L){d=g+(d.length>0?" "+d:d);continue}if(R=t(y),!R){d=g+(d.length>0?" "+d:d);continue}L=!1}const B=s(C).join(":"),W=S?B+Y:B,j=W+R;if(a.includes(j))continue;a.push(j);const G=n(R,L);for(let c=0;c<G.length;++c){const z=G[c];a.push(W+z)}d=g+(d.length>0?" "+d:d)}return d};function Ze(){let e=0,o,r,t="";for(;e<arguments.length;)(o=arguments[e++])&&(r=ye(o))&&(t&&(t+=" "),t+=r);return t}const ye=e=>{if(typeof e=="string")return e;let o,r="";for(let t=0;t<e.length;t++)e[t]&&(o=ye(e[t]))&&(r&&(r+=" "),r+=o);return r};function Ue(e,...o){let r,t,n,s=a;function a(d){const f=o.reduce((g,x)=>x(g),e());return r=We(f),t=r.cache.get,n=r.cache.set,s=p,p(d)}function p(d){const f=t(d);if(f)return f;const g=$e(d,r);return n(d,g),g}return function(){return s(Ze.apply(null,arguments))}}const h=e=>{const o=r=>r[e]||[];return o.isThemeGetter=!0,o},we=/^\[(?:(\w[\w-]*):)?(.+)\]$/i,ke=/^\((?:(\w[\w-]*):)?(.+)\)$/i,He=/^\d+\/\d+$/,qe=/^(\d+(\.\d+)?)?(xs|sm|md|lg|xl)$/,De=/\d+(%|px|r?em|[sdl]?v([hwib]|min|max)|pt|pc|in|cm|mm|cap|ch|ex|r?lh|cq(w|h|i|b|min|max))|\b(calc|min|max|clamp)\(.+\)|^0$/,Ke=/^(rgba?|hsla?|hwb|(ok)?(lab|lch))\(.+\)$/,Je=/^(inset_)?-?((\d+)?\.?(\d+)[a-z]+|0)_-?((\d+)?\.?(\d+)[a-z]+|0)/,Xe=/^(url|image|image-set|cross-fade|element|(repeating-)?(linear|radial|conic)-gradient)\(.+\)$/,T=e=>He.test(e),u=e=>!!e&&!Number.isNaN(Number(e)),I=e=>!!e&&Number.isInteger(Number(e)),pe=e=>e.endsWith("%")&&u(e.slice(0,-1)),M=e=>qe.test(e),Qe=()=>!0,Ye=e=>De.test(e)&&!Ke.test(e),oe=()=>!1,er=e=>Je.test(e),rr=e=>Xe.test(e),tr=e=>!i(e)&&!l(e),or=e=>O(e,Le,oe),i=e=>we.test(e),P=e=>O(e,Ae,Ye),X=e=>O(e,br,u),nr=e=>O(e,Ce,oe),sr=e=>O(e,ze,rr),ir=e=>O(e,oe,er),l=e=>ke.test(e),q=e=>_(e,Ae),lr=e=>_(e,gr),ar=e=>_(e,Ce),cr=e=>_(e,Le),dr=e=>_(e,ze),ur=e=>_(e,mr,!0),O=(e,o,r)=>{const t=we.exec(e);return t?t[1]?o(t[1]):r(t[2]):!1},_=(e,o,r=!1)=>{const t=ke.exec(e);return t?t[1]?o(t[1]):r:!1},Ce=e=>e==="position",pr=new Set(["image","url"]),ze=e=>pr.has(e),fr=new Set(["length","size","percentage"]),Le=e=>fr.has(e),Ae=e=>e==="length",br=e=>e==="number",gr=e=>e==="family-name",mr=e=>e==="shadow",hr=()=>{const e=h("color"),o=h("font"),r=h("text"),t=h("font-weight"),n=h("tracking"),s=h("leading"),a=h("breakpoint"),p=h("container"),d=h("spacing"),f=h("radius"),g=h("shadow"),x=h("inset-shadow"),C=h("drop-shadow"),S=h("blur"),y=h("perspective"),w=h("aspect"),L=h("ease"),R=h("animate"),B=()=>["auto","avoid","all","avoid-page","page","left","right","column"],W=()=>["bottom","center","left","left-bottom","left-top","right","right-bottom","right-top","top"],j=()=>["auto","hidden","clip","visible","scroll"],G=()=>["auto","contain","none"],c=()=>[l,i,d],z=()=>[T,"full","auto",...c()],ne=()=>[I,"none","subgrid",l,i],se=()=>["auto",{span:["full",I,l,i]},l,i],F=()=>[I,"auto",l,i],ie=()=>["auto","min","max","fr",l,i],D=()=>["start","end","center","between","around","evenly","stretch","baseline"],N=()=>["start","end","center","stretch"],A=()=>["auto",...c()],V=()=>[T,"auto","full","dvw","dvh","lvw","lvh","svw","svh","min","max","fit",...c()],b=()=>[e,l,i],K=()=>[pe,P],v=()=>["","none","full",f,l,i],k=()=>["",u,q,P],$=()=>["solid","dashed","dotted","double"],le=()=>["normal","multiply","screen","overlay","darken","lighten","color-dodge","color-burn","hard-light","soft-light","difference","exclusion","hue","saturation","color","luminosity"],ae=()=>["","none",S,l,i],ce=()=>["center","top","top-right","right","bottom-right","bottom","bottom-left","left","top-left",l,i],Z=()=>["none",u,l,i],U=()=>["none",u,l,i],J=()=>[u,l,i],H=()=>[T,"full",...c()];return{cacheSize:500,theme:{animate:["spin","ping","pulse","bounce"],aspect:["video"],blur:[M],breakpoint:[M],color:[Qe],container:[M],"drop-shadow":[M],ease:["in","out","in-out"],font:[tr],"font-weight":["thin","extralight","light","normal","medium","semibold","bold","extrabold","black"],"inset-shadow":[M],leading:["none","tight","snug","normal","relaxed","loose"],perspective:["dramatic","near","normal","midrange","distant","none"],radius:[M],shadow:[M],spacing:["px",u],text:[M],tracking:["tighter","tight","normal","wide","wider","widest"]},classGroups:{aspect:[{aspect:["auto","square",T,i,l,w]}],container:["container"],columns:[{columns:[u,i,l,p]}],"break-after":[{"break-after":B()}],"break-before":[{"break-before":B()}],"break-inside":[{"break-inside":["auto","avoid","avoid-page","avoid-column"]}],"box-decoration":[{"box-decoration":["slice","clone"]}],box:[{box:["border","content"]}],display:["block","inline-block","inline","flex","inline-flex","table","inline-table","table-caption","table-cell","table-column","table-column-group","table-footer-group","table-header-group","table-row-group","table-row","flow-root","grid","inline-grid","contents","list-item","hidden"],sr:["sr-only","not-sr-only"],float:[{float:["right","left","none","start","end"]}],clear:[{clear:["left","right","both","none","start","end"]}],isolation:["isolate","isolation-auto"],"object-fit":[{object:["contain","cover","fill","none","scale-down"]}],"object-position":[{object:[...W(),i,l]}],overflow:[{overflow:j()}],"overflow-x":[{"overflow-x":j()}],"overflow-y":[{"overflow-y":j()}],overscroll:[{overscroll:G()}],"overscroll-x":[{"overscroll-x":G()}],"overscroll-y":[{"overscroll-y":G()}],position:["static","fixed","absolute","relative","sticky"],inset:[{inset:z()}],"inset-x":[{"inset-x":z()}],"inset-y":[{"inset-y":z()}],start:[{start:z()}],end:[{end:z()}],top:[{top:z()}],right:[{right:z()}],bottom:[{bottom:z()}],left:[{left:z()}],visibility:["visible","invisible","collapse"],z:[{z:[I,"auto",l,i]}],basis:[{basis:[T,"full","auto",p,...c()]}],"flex-direction":[{flex:["row","row-reverse","col","col-reverse"]}],"flex-wrap":[{flex:["nowrap","wrap","wrap-reverse"]}],flex:[{flex:[u,T,"auto","initial","none",i]}],grow:[{grow:["",u,l,i]}],shrink:[{shrink:["",u,l,i]}],order:[{order:[I,"first","last","none",l,i]}],"grid-cols":[{"grid-cols":ne()}],"col-start-end":[{col:se()}],"col-start":[{"col-start":F()}],"col-end":[{"col-end":F()}],"grid-rows":[{"grid-rows":ne()}],"row-start-end":[{row:se()}],"row-start":[{"row-start":F()}],"row-end":[{"row-end":F()}],"grid-flow":[{"grid-flow":["row","col","dense","row-dense","col-dense"]}],"auto-cols":[{"auto-cols":ie()}],"auto-rows":[{"auto-rows":ie()}],gap:[{gap:c()}],"gap-x":[{"gap-x":c()}],"gap-y":[{"gap-y":c()}],"justify-content":[{justify:[...D(),"normal"]}],"justify-items":[{"justify-items":[...N(),"normal"]}],"justify-self":[{"justify-self":["auto",...N()]}],"align-content":[{content:["normal",...D()]}],"align-items":[{items:[...N(),"baseline"]}],"align-self":[{self:["auto",...N(),"baseline"]}],"place-content":[{"place-content":D()}],"place-items":[{"place-items":[...N(),"baseline"]}],"place-self":[{"place-self":["auto",...N()]}],p:[{p:c()}],px:[{px:c()}],py:[{py:c()}],ps:[{ps:c()}],pe:[{pe:c()}],pt:[{pt:c()}],pr:[{pr:c()}],pb:[{pb:c()}],pl:[{pl:c()}],m:[{m:A()}],mx:[{mx:A()}],my:[{my:A()}],ms:[{ms:A()}],me:[{me:A()}],mt:[{mt:A()}],mr:[{mr:A()}],mb:[{mb:A()}],ml:[{ml:A()}],"space-x":[{"space-x":c()}],"space-x-reverse":["space-x-reverse"],"space-y":[{"space-y":c()}],"space-y-reverse":["space-y-reverse"],size:[{size:V()}],w:[{w:[p,"screen",...V()]}],"min-w":[{"min-w":[p,"screen","none",...V()]}],"max-w":[{"max-w":[p,"screen","none","prose",{screen:[a]},...V()]}],h:[{h:["screen",...V()]}],"min-h":[{"min-h":["screen","none",...V()]}],"max-h":[{"max-h":["screen",...V()]}],"font-size":[{text:["base",r,q,P]}],"font-smoothing":["antialiased","subpixel-antialiased"],"font-style":["italic","not-italic"],"font-weight":[{font:[t,l,X]}],"font-stretch":[{"font-stretch":["ultra-condensed","extra-condensed","condensed","semi-condensed","normal","semi-expanded","expanded","extra-expanded","ultra-expanded",pe,i]}],"font-family":[{font:[lr,i,o]}],"fvn-normal":["normal-nums"],"fvn-ordinal":["ordinal"],"fvn-slashed-zero":["slashed-zero"],"fvn-figure":["lining-nums","oldstyle-nums"],"fvn-spacing":["proportional-nums","tabular-nums"],"fvn-fraction":["diagonal-fractions","stacked-fractions"],tracking:[{tracking:[n,l,i]}],"line-clamp":[{"line-clamp":[u,"none",l,X]}],leading:[{leading:[s,...c()]}],"list-image":[{"list-image":["none",l,i]}],"list-style-position":[{list:["inside","outside"]}],"list-style-type":[{list:["disc","decimal","none",l,i]}],"text-alignment":[{text:["left","center","right","justify","start","end"]}],"placeholder-color":[{placeholder:b()}],"text-color":[{text:b()}],"text-decoration":["underline","overline","line-through","no-underline"],"text-decoration-style":[{decoration:[...$(),"wavy"]}],"text-decoration-thickness":[{decoration:[u,"from-font","auto",l,P]}],"text-decoration-color":[{decoration:b()}],"underline-offset":[{"underline-offset":[u,"auto",l,i]}],"text-transform":["uppercase","lowercase","capitalize","normal-case"],"text-overflow":["truncate","text-ellipsis","text-clip"],"text-wrap":[{text:["wrap","nowrap","balance","pretty"]}],indent:[{indent:c()}],"vertical-align":[{align:["baseline","top","middle","bottom","text-top","text-bottom","sub","super",l,i]}],whitespace:[{whitespace:["normal","nowrap","pre","pre-line","pre-wrap","break-spaces"]}],break:[{break:["normal","words","all","keep"]}],hyphens:[{hyphens:["none","manual","auto"]}],content:[{content:["none",l,i]}],"bg-attachment":[{bg:["fixed","local","scroll"]}],"bg-clip":[{"bg-clip":["border","padding","content","text"]}],"bg-origin":[{"bg-origin":["border","padding","content"]}],"bg-position":[{bg:[...W(),ar,nr]}],"bg-repeat":[{bg:["no-repeat",{repeat:["","x","y","space","round"]}]}],"bg-size":[{bg:["auto","cover","contain",cr,or]}],"bg-image":[{bg:["none",{linear:[{to:["t","tr","r","br","b","bl","l","tl"]},I,l,i],radial:["",l,i],conic:[I,l,i]},dr,sr]}],"bg-color":[{bg:b()}],"gradient-from-pos":[{from:K()}],"gradient-via-pos":[{via:K()}],"gradient-to-pos":[{to:K()}],"gradient-from":[{from:b()}],"gradient-via":[{via:b()}],"gradient-to":[{to:b()}],rounded:[{rounded:v()}],"rounded-s":[{"rounded-s":v()}],"rounded-e":[{"rounded-e":v()}],"rounded-t":[{"rounded-t":v()}],"rounded-r":[{"rounded-r":v()}],"rounded-b":[{"rounded-b":v()}],"rounded-l":[{"rounded-l":v()}],"rounded-ss":[{"rounded-ss":v()}],"rounded-se":[{"rounded-se":v()}],"rounded-ee":[{"rounded-ee":v()}],"rounded-es":[{"rounded-es":v()}],"rounded-tl":[{"rounded-tl":v()}],"rounded-tr":[{"rounded-tr":v()}],"rounded-br":[{"rounded-br":v()}],"rounded-bl":[{"rounded-bl":v()}],"border-w":[{border:k()}],"border-w-x":[{"border-x":k()}],"border-w-y":[{"border-y":k()}],"border-w-s":[{"border-s":k()}],"border-w-e":[{"border-e":k()}],"border-w-t":[{"border-t":k()}],"border-w-r":[{"border-r":k()}],"border-w-b":[{"border-b":k()}],"border-w-l":[{"border-l":k()}],"divide-x":[{"divide-x":k()}],"divide-x-reverse":["divide-x-reverse"],"divide-y":[{"divide-y":k()}],"divide-y-reverse":["divide-y-reverse"],"border-style":[{border:[...$(),"hidden","none"]}],"divide-style":[{divide:[...$(),"hidden","none"]}],"border-color":[{border:b()}],"border-color-x":[{"border-x":b()}],"border-color-y":[{"border-y":b()}],"border-color-s":[{"border-s":b()}],"border-color-e":[{"border-e":b()}],"border-color-t":[{"border-t":b()}],"border-color-r":[{"border-r":b()}],"border-color-b":[{"border-b":b()}],"border-color-l":[{"border-l":b()}],"divide-color":[{divide:b()}],"outline-style":[{outline:[...$(),"none","hidden"]}],"outline-offset":[{"outline-offset":[u,l,i]}],"outline-w":[{outline:["",u,q,P]}],"outline-color":[{outline:[e]}],shadow:[{shadow:["","none",g,ur,ir]}],"shadow-color":[{shadow:b()}],"inset-shadow":[{"inset-shadow":["none",l,i,x]}],"inset-shadow-color":[{"inset-shadow":b()}],"ring-w":[{ring:k()}],"ring-w-inset":["ring-inset"],"ring-color":[{ring:b()}],"ring-offset-w":[{"ring-offset":[u,P]}],"ring-offset-color":[{"ring-offset":b()}],"inset-ring-w":[{"inset-ring":k()}],"inset-ring-color":[{"inset-ring":b()}],opacity:[{opacity:[u,l,i]}],"mix-blend":[{"mix-blend":[...le(),"plus-darker","plus-lighter"]}],"bg-blend":[{"bg-blend":le()}],filter:[{filter:["","none",l,i]}],blur:[{blur:ae()}],brightness:[{brightness:[u,l,i]}],contrast:[{contrast:[u,l,i]}],"drop-shadow":[{"drop-shadow":["","none",C,l,i]}],grayscale:[{grayscale:["",u,l,i]}],"hue-rotate":[{"hue-rotate":[u,l,i]}],invert:[{invert:["",u,l,i]}],saturate:[{saturate:[u,l,i]}],sepia:[{sepia:["",u,l,i]}],"backdrop-filter":[{"backdrop-filter":["","none",l,i]}],"backdrop-blur":[{"backdrop-blur":ae()}],"backdrop-brightness":[{"backdrop-brightness":[u,l,i]}],"backdrop-contrast":[{"backdrop-contrast":[u,l,i]}],"backdrop-grayscale":[{"backdrop-grayscale":["",u,l,i]}],"backdrop-hue-rotate":[{"backdrop-hue-rotate":[u,l,i]}],"backdrop-invert":[{"backdrop-invert":["",u,l,i]}],"backdrop-opacity":[{"backdrop-opacity":[u,l,i]}],"backdrop-saturate":[{"backdrop-saturate":[u,l,i]}],"backdrop-sepia":[{"backdrop-sepia":["",u,l,i]}],"border-collapse":[{border:["collapse","separate"]}],"border-spacing":[{"border-spacing":c()}],"border-spacing-x":[{"border-spacing-x":c()}],"border-spacing-y":[{"border-spacing-y":c()}],"table-layout":[{table:["auto","fixed"]}],caption:[{caption:["top","bottom"]}],transition:[{transition:["","all","colors","opacity","shadow","transform","none",l,i]}],"transition-behavior":[{transition:["normal","discrete"]}],duration:[{duration:[u,"initial",l,i]}],ease:[{ease:["linear","initial",L,l,i]}],delay:[{delay:[u,l,i]}],animate:[{animate:["none",R,l,i]}],backface:[{backface:["hidden","visible"]}],perspective:[{perspective:[y,l,i]}],"perspective-origin":[{"perspective-origin":ce()}],rotate:[{rotate:Z()}],"rotate-x":[{"rotate-x":Z()}],"rotate-y":[{"rotate-y":Z()}],"rotate-z":[{"rotate-z":Z()}],scale:[{scale:U()}],"scale-x":[{"scale-x":U()}],"scale-y":[{"scale-y":U()}],"scale-z":[{"scale-z":U()}],"scale-3d":["scale-3d"],skew:[{skew:J()}],"skew-x":[{"skew-x":J()}],"skew-y":[{"skew-y":J()}],transform:[{transform:[l,i,"","none","gpu","cpu"]}],"transform-origin":[{origin:ce()}],"transform-style":[{transform:["3d","flat"]}],translate:[{translate:H()}],"translate-x":[{"translate-x":H()}],"translate-y":[{"translate-y":H()}],"translate-z":[{"translate-z":H()}],"translate-none":["translate-none"],accent:[{accent:b()}],appearance:[{appearance:["none","auto"]}],"caret-color":[{caret:b()}],"color-scheme":[{scheme:["normal","dark","light","light-dark","only-dark","only-light"]}],cursor:[{cursor:["auto","default","pointer","wait","text","move","help","not-allowed","none","context-menu","progress","cell","crosshair","vertical-text","alias","copy","no-drop","grab","grabbing","all-scroll","col-resize","row-resize","n-resize","e-resize","s-resize","w-resize","ne-resize","nw-resize","se-resize","sw-resize","ew-resize","ns-resize","nesw-resize","nwse-resize","zoom-in","zoom-out",l,i]}],"field-sizing":[{"field-sizing":["fixed","content"]}],"pointer-events":[{"pointer-events":["auto","none"]}],resize:[{resize:["none","","y","x"]}],"scroll-behavior":[{scroll:["auto","smooth"]}],"scroll-m":[{"scroll-m":c()}],"scroll-mx":[{"scroll-mx":c()}],"scroll-my":[{"scroll-my":c()}],"scroll-ms":[{"scroll-ms":c()}],"scroll-me":[{"scroll-me":c()}],"scroll-mt":[{"scroll-mt":c()}],"scroll-mr":[{"scroll-mr":c()}],"scroll-mb":[{"scroll-mb":c()}],"scroll-ml":[{"scroll-ml":c()}],"scroll-p":[{"scroll-p":c()}],"scroll-px":[{"scroll-px":c()}],"scroll-py":[{"scroll-py":c()}],"scroll-ps":[{"scroll-ps":c()}],"scroll-pe":[{"scroll-pe":c()}],"scroll-pt":[{"scroll-pt":c()}],"scroll-pr":[{"scroll-pr":c()}],"scroll-pb":[{"scroll-pb":c()}],"scroll-pl":[{"scroll-pl":c()}],"snap-align":[{snap:["start","end","center","align-none"]}],"snap-stop":[{snap:["normal","always"]}],"snap-type":[{snap:["none","x","y","both"]}],"snap-strictness":[{snap:["mandatory","proximity"]}],touch:[{touch:["auto","none","manipulation"]}],"touch-x":[{"touch-pan":["x","left","right"]}],"touch-y":[{"touch-pan":["y","up","down"]}],"touch-pz":["touch-pinch-zoom"],select:[{select:["none","text","all","auto"]}],"will-change":[{"will-change":["auto","scroll","contents","transform",l,i]}],fill:[{fill:["none",...b()]}],"stroke-w":[{stroke:[u,q,P,X]}],stroke:[{stroke:["none",...b()]}],"forced-color-adjust":[{"forced-color-adjust":["auto","none"]}]},conflictingClassGroups:{overflow:["overflow-x","overflow-y"],overscroll:["overscroll-x","overscroll-y"],inset:["inset-x","inset-y","start","end","top","right","bottom","left"],"inset-x":["right","left"],"inset-y":["top","bottom"],flex:["basis","grow","shrink"],gap:["gap-x","gap-y"],p:["px","py","ps","pe","pt","pr","pb","pl"],px:["pr","pl"],py:["pt","pb"],m:["mx","my","ms","me","mt","mr","mb","ml"],mx:["mr","ml"],my:["mt","mb"],size:["w","h"],"font-size":["leading"],"fvn-normal":["fvn-ordinal","fvn-slashed-zero","fvn-figure","fvn-spacing","fvn-fraction"],"fvn-ordinal":["fvn-normal"],"fvn-slashed-zero":["fvn-normal"],"fvn-figure":["fvn-normal"],"fvn-spacing":["fvn-normal"],"fvn-fraction":["fvn-normal"],"line-clamp":["display","overflow"],rounded:["rounded-s","rounded-e","rounded-t","rounded-r","rounded-b","rounded-l","rounded-ss","rounded-se","rounded-ee","rounded-es","rounded-tl","rounded-tr","rounded-br","rounded-bl"],"rounded-s":["rounded-ss","rounded-es"],"rounded-e":["rounded-se","rounded-ee"],"rounded-t":["rounded-tl","rounded-tr"],"rounded-r":["rounded-tr","rounded-br"],"rounded-b":["rounded-br","rounded-bl"],"rounded-l":["rounded-tl","rounded-bl"],"border-spacing":["border-spacing-x","border-spacing-y"],"border-w":["border-w-s","border-w-e","border-w-t","border-w-r","border-w-b","border-w-l"],"border-w-x":["border-w-r","border-w-l"],"border-w-y":["border-w-t","border-w-b"],"border-color":["border-color-s","border-color-e","border-color-t","border-color-r","border-color-b","border-color-l"],"border-color-x":["border-color-r","border-color-l"],"border-color-y":["border-color-t","border-color-b"],translate:["translate-x","translate-y","translate-none"],"translate-none":["translate","translate-x","translate-y","translate-z"],"scroll-m":["scroll-mx","scroll-my","scroll-ms","scroll-me","scroll-mt","scroll-mr","scroll-mb","scroll-ml"],"scroll-mx":["scroll-mr","scroll-ml"],"scroll-my":["scroll-mt","scroll-mb"],"scroll-p":["scroll-px","scroll-py","scroll-ps","scroll-pe","scroll-pt","scroll-pr","scroll-pb","scroll-pl"],"scroll-px":["scroll-pr","scroll-pl"],"scroll-py":["scroll-pt","scroll-pb"],touch:["touch-x","touch-y","touch-pz"],"touch-x":["touch"],"touch-y":["touch"],"touch-pz":["touch"]},conflictingClassGroupModifiers:{"font-size":["leading"]},orderSensitiveModifiers:["before","after","placeholder","file","marker","selection","first-line","first-letter","backdrop","*","**"]}},vr=Ue(hr);function xr(...e){return vr(ve(e))}function fe(e,o){if(typeof e=="function")return e(o);e!=null&&(e.current=o)}function Me(...e){return o=>{let r=!1;const t=e.map(n=>{const s=fe(n,o);return!r&&typeof s=="function"&&(r=!0),s});if(r)return()=>{for(let n=0;n<t.length;n++){const s=t[n];typeof s=="function"?s():fe(e[n],null)}}}}function Sr(...e){return m.useCallback(Me(...e),e)}var Se=m.forwardRef((e,o)=>{const{children:r,...t}=e,n=m.Children.toArray(r),s=n.find(wr);if(s){const a=s.props.children,p=n.map(d=>d===s?m.Children.count(a)>1?m.Children.only(null):m.isValidElement(a)?a.props.children:null:d);return E.jsx(re,{...t,ref:o,children:m.isValidElement(a)?m.cloneElement(a,void 0,p):null})}return E.jsx(re,{...t,ref:o,children:r})});Se.displayName="Slot";var re=m.forwardRef((e,o)=>{const{children:r,...t}=e;if(m.isValidElement(r)){const n=Cr(r),s=kr(t,r.props);return r.type!==m.Fragment&&(s.ref=o?Me(o,n):n),m.cloneElement(r,s)}return m.Children.count(r)>1?m.Children.only(null):null});re.displayName="SlotClone";var yr=({children:e})=>E.jsx(E.Fragment,{children:e});function wr(e){return m.isValidElement(e)&&e.type===yr}function kr(e,o){const r={...o};for(const t in o){const n=e[t],s=o[t];/^on[A-Z]/.test(t)?n&&s?r[t]=(...p)=>{s(...p),n(...p)}:n&&(r[t]=n):t==="style"?r[t]={...n,...s}:t==="className"&&(r[t]=[n,s].filter(Boolean).join(" "))}return{...e,...r}}function Cr(e){var t,n;let o=(t=Object.getOwnPropertyDescriptor(e.props,"ref"))==null?void 0:t.get,r=o&&"isReactWarning"in o&&o.isReactWarning;return r?e.ref:(o=(n=Object.getOwnPropertyDescriptor(e,"ref"))==null?void 0:n.get,r=o&&"isReactWarning"in o&&o.isReactWarning,r?e.props.ref:e.props.ref||e.ref)}const be=e=>typeof e=="boolean"?`${e}`:e===0?"0":e,ge=ve,zr=(e,o)=>r=>{var t;if((o==null?void 0:o.variants)==null)return ge(e,r==null?void 0:r.class,r==null?void 0:r.className);const{variants:n,defaultVariants:s}=o,a=Object.keys(n).map(f=>{const g=r==null?void 0:r[f],x=s==null?void 0:s[f];if(g===null)return null;const C=be(g)||be(x);return n[f][C]}),p=r&&Object.entries(r).reduce((f,g)=>{let[x,C]=g;return C===void 0||(f[x]=C),f},{}),d=o==null||(t=o.compoundVariants)===null||t===void 0?void 0:t.reduce((f,g)=>{let{class:x,className:C,...S}=g;return Object.entries(S).every(y=>{let[w,L]=y;return Array.isArray(L)?L.includes({...s,...p}[w]):{...s,...p}[w]===L})?[...f,x,C]:f},[]);return ge(e,a,d,r==null?void 0:r.class,r==null?void 0:r.className)},Lr=zr("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-[color,box-shadow] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",{variants:{variant:{default:"bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",destructive:"bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40",outline:"border border-input bg-background shadow-xs hover:bg-accent hover:text-accent-foreground",secondary:"bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",ghost:"hover:bg-accent hover:text-accent-foreground",link:"text-primary underline-offset-4 hover:underline"},size:{default:"h-9 px-4 py-2 has-[>svg]:px-3",sm:"h-8 rounded-md px-3 has-[>svg]:px-2.5",lg:"h-10 rounded-md px-6 has-[>svg]:px-4",icon:"size-9"}},defaultVariants:{variant:"default",size:"default"}});function Rr({className:e,variant:o,size:r,asChild:t=!1,...n}){const s=t?Se:"button";return E.jsx(s,{"data-slot":"button",className:xr(Lr({variant:o,size:r,className:e})),...n})}function Vr(e){return E.jsx("svg",{...e,viewBox:"0 0 40 42",xmlns:"http://www.w3.org/2000/svg",children:E.jsx("path",{fillRule:"evenodd",clipRule:"evenodd",d:"M17.2 5.63325L8.6 0.855469L0 5.63325V32.1434L16.2 41.1434L32.4 32.1434V23.699L40 19.4767V9.85547L31.4 5.07769L22.8 9.85547V18.2999L17.2 21.411V5.63325ZM38 18.2999L32.4 21.411V15.2545L38 12.1434V18.2999ZM36.9409 10.4439L31.4 13.5221L25.8591 10.4439L31.4 7.36561L36.9409 10.4439ZM24.8 18.2999V12.1434L30.4 15.2545V21.411L24.8 18.2999ZM23.8 20.0323L29.3409 23.1105L16.2 30.411L10.6591 27.3328L23.8 20.0323ZM7.6 27.9212L15.2 32.1434V38.2999L2 30.9666V7.92116L7.6 11.0323V27.9212ZM8.6 9.29991L3.05913 6.22165L8.6 3.14339L14.1409 6.22165L8.6 9.29991ZM30.4 24.8101L17.2 32.1434V38.2999L30.4 30.9666V24.8101ZM9.6 11.0323L15.2 7.92117V22.5221L9.6 25.6333V11.0323Z"})})}export{Vr as A,Rr as B,Se as S,xr as a,yr as b,Mr as c,zr as d,Me as e,Sr as u};
