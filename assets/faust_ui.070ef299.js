import"./modulepreload-polyfill.b7f2da20.js";var Y={exports:{}};(function(G,Q){(function(H,w){G.exports=w()})(self,function(){return(()=>{var X={"./node_modules/@shren/typed-event-emitter/dist/index.js":(E,l)=>{Object.defineProperty(l,"__esModule",{value:!0});class t{constructor(){this._listeners={}}get listeners(){return this._listeners}getListeners(u){return u in this._listeners||(this._listeners[u]=[]),this._listeners[u]}on(u,r){this.getListeners(u).indexOf(r)===-1&&this.getListeners(u).push(r)}once(u,r){const n=a=>{const s=r(a);return this.off(u,n),s};this.on(u,n)}off(u,r){const n=this.getListeners(u).indexOf(r);n!==-1&&this.getListeners(u).splice(n,1)}async emit(u,r){const n=this.getListeners(u);return n.length?Promise.all(n.map(a=>a(r))):[]}async emitSerial(u,r){const n=this.getListeners(u);if(!n.length)return[];const a=[];for(let s=0;s<n.length;s++){const o=n[s];a[s]=await o(r)}return a}emitSync(u,r){const n=this.getListeners(u);return n.length?n.map(a=>a(r)):[]}removeAllListeners(u){u?this._listeners[u]=[]:this._listeners={}}listenerCount(u){return u in this._listeners?this._listeners[u].length:0}}l.default=t},"./src/FaustUI.ts":(E,l,t)=>{t.r(l),t.d(l,{FaustUI:()=>n});var c=t("./src/layout/Layout.ts");t("./src/index.scss");var u=t("./src/components/Group.ts");function r(a,s,o){return s in a?Object.defineProperty(a,s,{value:o,enumerable:!0,configurable:!0,writable:!0}):a[s]=o,a}class n{constructor(s){r(this,"componentMap",{}),r(this,"DOMroot",void 0),r(this,"faustUIRoot",void 0),r(this,"hostWindow",void 0),r(this,"grid",void 0),r(this,"_ui",void 0),r(this,"_layout",void 0),r(this,"paramChangeByUI",(v,y)=>{!this.hostWindow||this.hostWindow.postMessage({path:v,value:y,type:"param"},"*")});var o=s.root,e=s.ui,i=s.listenWindowResize,d=s.listenWindowMessage;this.DOMroot=o,this.ui=e||[],(typeof i=="undefined"||i===!0)&&window.addEventListener("resize",()=>{this.resize()}),(typeof d=="undefined"||d===!0)&&window.addEventListener("message",v=>{var y=v.data,A=v.source;this.hostWindow=A;var p=y.type;if(!!p){if(p==="ui")this.ui=y.ui;else if(p==="param"){var m=y.path,_=y.value;this.paramChangeByDSP(m,_)}}})}mount(){this.componentMap={},this.DOMroot.innerHTML="";var s={label:"",type:"vgroup",items:this.ui,style:{grid:this.grid,width:this.layout.width,height:this.layout.height,left:this.layout.offsetLeft,top:this.layout.offsetTop},isRoot:!0,emitter:this};this.faustUIRoot=new u.Group(s),this.faustUIRoot.componentWillMount(),this.faustUIRoot.mount(),this.DOMroot.appendChild(this.faustUIRoot.container),this.faustUIRoot.componentDidMount()}register(s,o){this.componentMap[s]?this.componentMap[s].push(o):this.componentMap[s]=[o]}paramChangeByDSP(s,o){this.componentMap[s]&&this.componentMap[s].forEach(e=>e.setState({value:o}))}calc(){var s=c.Layout.calc(this.ui),o=s.items,e=s.layout;this._ui=o,this._layout=e,this.calcGrid()}calcGrid(){var s=this.DOMroot.getBoundingClientRect(),o=s.width,e=s.height,i=Math.max(40,Math.min(o/this._layout.width,e/this._layout.height));return this.grid=i,i}resize(){!this.faustUIRoot||(this.calcGrid(),this.faustUIRoot.setState({style:{grid:this.grid}}))}get ui(){return this._ui}set ui(s){this._ui=s,this.calc(),this.mount()}get layout(){return this._layout}get minWidth(){return this._layout.width*40+1}get minHeight(){return this._layout.height*40+1}}},"./src/components/AbstractComponent.ts":(E,l,t)=>{t.r(l),t.d(l,{AbstractComponent:()=>a});var c=t("./node_modules/@shren/typed-event-emitter/dist/index.js");function u(s,o){var e=Object.keys(s);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(s);o&&(i=i.filter(function(d){return Object.getOwnPropertyDescriptor(s,d).enumerable})),e.push.apply(e,i)}return e}function r(s){for(var o=1;o<arguments.length;o++){var e=arguments[o]!=null?arguments[o]:{};o%2?u(Object(e),!0).forEach(function(i){n(s,i,e[i])}):Object.getOwnPropertyDescriptors?Object.defineProperties(s,Object.getOwnPropertyDescriptors(e)):u(Object(e)).forEach(function(i){Object.defineProperty(s,i,Object.getOwnPropertyDescriptor(e,i))})}return s}function n(s,o,e){return o in s?Object.defineProperty(s,o,{value:e,enumerable:!0,configurable:!0,writable:!0}):s[o]=e,s}class a extends c.default{get defaultProps(){return this.constructor.defaultProps}constructor(o){return super(),n(this,"state",void 0),n(this,"$frame",0),n(this,"frameReduce",1),n(this,"$raf",void 0),n(this,"raf",()=>{if(this.$frame++,this.$frame%this.frameReduce!==0){this.$raf=window.requestAnimationFrame(this.raf);return}this.$raf=void 0,this.tasks.forEach(e=>e()),this.tasks=[]}),n(this,"tasks",[]),this.state=r(r({},this.defaultProps),o),this}setState(o){var e=!1;for(var i in o){var d=o[i];if(i in this.state&&this.state[i]!==d)this.state[i]=d,e=!0;else return;e&&this.emit(i,this.state[i])}}schedule(o){this.tasks.indexOf(o)===-1&&this.tasks.push(o),!this.$raf&&(this.$raf=window.requestAnimationFrame(this.raf))}}n(a,"defaultProps",{})},"./src/components/AbstractItem.ts":(E,l,t)=>{t.r(l),t.d(l,{AbstractItem:()=>s}),t("./src/components/Base.scss");var c=t("./src/components/AbstractComponent.ts"),u=t("./src/components/utils.ts");function r(o,e){var i=Object.keys(o);if(Object.getOwnPropertySymbols){var d=Object.getOwnPropertySymbols(o);e&&(d=d.filter(function(v){return Object.getOwnPropertyDescriptor(o,v).enumerable})),i.push.apply(i,d)}return i}function n(o){for(var e=1;e<arguments.length;e++){var i=arguments[e]!=null?arguments[e]:{};e%2?r(Object(i),!0).forEach(function(d){a(o,d,i[d])}):Object.getOwnPropertyDescriptors?Object.defineProperties(o,Object.getOwnPropertyDescriptors(i)):r(Object(i)).forEach(function(d){Object.defineProperty(o,d,Object.getOwnPropertyDescriptor(i,d))})}return o}function a(o,e,i){return e in o?Object.defineProperty(o,e,{value:i,enumerable:!0,configurable:!0,writable:!0}):o[e]=i,o}class s extends c.AbstractComponent{constructor(e){return super(e),a(this,"container",void 0),a(this,"label",void 0),a(this,"labelCanvas",void 0),a(this,"labelCtx",void 0),a(this,"className",void 0),a(this,"frameReduce",3),a(this,"handleKeyDown",i=>{}),a(this,"handleKeyUp",i=>{}),a(this,"handleTouchStart",i=>{i.preventDefault();var d=i.currentTarget.getBoundingClientRect(),v=i.touches[0].pageX,y=i.touches[0].pageY,A=v-d.left,p=y-d.top,m=this.state.value;this.handlePointerDown({x:A,y:p,originalEvent:i});var _=h=>{h.preventDefault();var f=h.changedTouches[0].pageX,B=h.changedTouches[0].pageY,b=f-v,M=B-y;v=f,y=B;var O=f-d.left,C=B-d.top;this.handlePointerDrag({prevValue:m,x:O,y:C,fromX:A,fromY:p,movementX:b,movementY:M,originalEvent:h})},g=h=>{h.preventDefault();var f=h.changedTouches[0].pageX-d.left,B=h.changedTouches[0].pageY-d.top;this.handlePointerUp({x:f,y:B,originalEvent:h}),document.removeEventListener("touchmove",_),document.removeEventListener("touchend",g)};document.addEventListener("touchmove",_,{passive:!1}),document.addEventListener("touchend",g,{passive:!1})}),a(this,"handleWheel",i=>{}),a(this,"handleClick",i=>{}),a(this,"handleMouseDown",i=>{i.preventDefault(),i.currentTarget.focus();var d=i.currentTarget.getBoundingClientRect(),v=i.pageX-d.left,y=i.pageY-d.top,A=this.state.value;this.handlePointerDown({x:v,y,originalEvent:i});var p=_=>{_.preventDefault();var g=_.pageX-d.left,h=_.pageY-d.top;this.handlePointerDrag({prevValue:A,x:g,y:h,fromX:v,fromY:y,movementX:_.movementX,movementY:_.movementY,originalEvent:_})},m=_=>{_.preventDefault();var g=_.pageX-d.left,h=_.pageY-d.top;this.handlePointerUp({x:g,y:h,originalEvent:_}),document.removeEventListener("mousemove",p),document.removeEventListener("mouseup",m)};document.addEventListener("mousemove",p),document.addEventListener("mouseup",m)}),a(this,"handleMouseOver",i=>{}),a(this,"handleMouseOut",i=>{}),a(this,"handleContextMenu",i=>{}),a(this,"handlePointerDown",i=>{}),a(this,"handlePointerDrag",i=>{}),a(this,"handlePointerUp",i=>{}),a(this,"handleFocusIn",i=>this.setState({focus:!0})),a(this,"handleFocusOut",i=>this.setState({focus:!1})),this.state.style=n(n({},this.defaultProps.style),e.style),this.state.emitter&&this.state.emitter.register(this.state.address,this),this}toValidNumber(e){var i=this.state,d=i.min,v=i.max,y=i.step;if(typeof d!="number"||typeof v!="number")return e;var A=Math.min(v,Math.max(d,e));return y?d+Math.floor((A-d)/y)*y:A}setValue(e){var i=this.toValidNumber(e),d=this.setState({value:i});return d&&this.change(i),d}change(e){this.state.emitter&&this.state.emitter.paramChangeByUI(this.state.address,typeof e=="number"?e:this.state.value)}setState(e){var i=!1;for(var d in e){var v=d,y=e[v];if(v==="style")for(var A in e.style)A in this.state.style&&this.state.style[A]!==e.style[A]&&(this.state.style[A]=e.style[A],i=!0);else if(v in this.state&&this.state[v]!==y)this.state[v]=y,i=!0;else return!1;i&&this.emit(v,this.state[v])}return i}componentWillMount(){return this.container=document.createElement("div"),this.container.className=["faust-ui-component","faust-ui-component-"+this.className].join(" "),this.container.tabIndex=1,this.container.id=this.state.address,this.state.tooltip&&(this.container.title=this.state.tooltip),this.label=document.createElement("div"),this.label.className="faust-ui-component-label",this.labelCanvas=document.createElement("canvas"),this.labelCtx=this.labelCanvas.getContext("2d"),this}mount(){return this.label.appendChild(this.labelCanvas),this}paintLabel(e){var i=this.state.label,d=this.state.style.labelcolor,v=this.labelCtx,y=this.labelCanvas,A=this.label.getBoundingClientRect(),p=A.width,m=A.height;return!p||!m?this:(p=Math.floor(p),m=Math.floor(m),y.height=m,y.width=p,v.clearRect(0,0,p,m),v.fillStyle=d,v.textBaseline="middle",v.textAlign=e||"center",v.font="bold ".concat(m*.9,'px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"'),v.fillText(i,e==="left"?0:e==="right"?p:p/2,m/2,p),this)}componentDidMount(){var e=()=>{var i=this.state.style,d=i.grid,v=i.left,y=i.top,A=i.width,p=i.height;this.container.style.width="".concat(A*d,"px"),this.container.style.height="".concat(p*d,"px"),this.container.style.left="".concat(v*d,"px"),this.container.style.top="".concat(y*d,"px"),this.label.style.height="".concat(d*.25,"px"),this.paintLabel()};return this.on("style",()=>this.schedule(e)),e(),this}get stepsCount(){var e=this.state,i=e.type,d=e.max,v=e.min,y=e.step,A=e.enums,p=i==="enum"?A.length:i==="int"?d-v:(d-v)/y;return y?i==="enum"?A.length:i==="int"?Math.min(Math.floor((d-v)/(Math.round(y)||1)),p):Math.floor((d-v)/y):p}get distance(){var e=this.state,i=e.type,d=e.max,v=e.min,y=e.value,A=e.enums,p=e.scale;return s.getDistance({type:i,max:d,min:v,value:y,enums:A,scale:p})}static getDistance(e){var i=e.type,d=e.max,v=e.min,y=e.value,A=e.enums,p=e.scale;if(i==="enum")return y/(A.length-1);var m=p==="exp"?(0,u.normLog)(y,v,d):p==="log"?(0,u.normExp)(y,v,d):y;return(0,u.normalize)(m,v,d)}get stepRange(){var e=100,i=this.stepsCount;return e/i}}a(s,"defaultProps",{value:0,active:!0,focus:!1,label:"",address:"",min:0,max:1,enums:{},type:"float",unit:"",scale:"linear",step:.01,style:{width:45,height:15,left:0,top:0,labelcolor:"rgba(226, 222, 255, 0.5)"}})},"./src/components/Button.ts":(E,l,t)=>{t.r(l),t.d(l,{Button:()=>a});var c=t("./src/components/AbstractItem.ts");t("./src/components/Button.scss");function u(s,o){var e=Object.keys(s);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(s);o&&(i=i.filter(function(d){return Object.getOwnPropertyDescriptor(s,d).enumerable})),e.push.apply(e,i)}return e}function r(s){for(var o=1;o<arguments.length;o++){var e=arguments[o]!=null?arguments[o]:{};o%2?u(Object(e),!0).forEach(function(i){n(s,i,e[i])}):Object.getOwnPropertyDescriptors?Object.defineProperties(s,Object.getOwnPropertyDescriptors(e)):u(Object(e)).forEach(function(i){Object.defineProperty(s,i,Object.getOwnPropertyDescriptor(e,i))})}return s}function n(s,o,e){return o in s?Object.defineProperty(s,o,{value:e,enumerable:!0,configurable:!0,writable:!0}):s[o]=e,s}class a extends c.AbstractItem{constructor(){super(...arguments),n(this,"className","button"),n(this,"btn",void 0),n(this,"span",void 0),n(this,"setStyle",()=>{var o=this.state,e=o.value,i=o.style,d=i.height,v=i.grid,y=i.fontsize,A=i.fontname,p=i.fontface,m=i.textcolor,_=i.textoncolor,g=i.bgoncolor,h=i.bgcolor,f=i.bordercolor,B=i.borderoncolor;this.btn.style.backgroundColor=e?g:h,this.btn.style.borderColor=e?B:f,this.btn.style.color=e?_:m,this.btn.style.fontSize="".concat(y||d*v/4,"px"),this.btn.style.fontFamily="".concat(A,", sans-serif"),this.btn.style.fontStyle=p}),n(this,"handlePointerDown",()=>{this.setValue(1)}),n(this,"handlePointerUp",()=>{this.setValue(0)})}static get defaultProps(){var o=super.defaultProps;return r(r({},o),{},{style:r(r({},o.style),{},{fontname:"Arial",fontsize:void 0,fontface:"normal",bgcolor:"rgba(40, 40, 40, 1)",bgoncolor:"rgba(18, 18, 18, 1)",bordercolor:"rgba(80, 80, 80, 1)",borderoncolor:"rgba(255, 165, 0, 1)",textcolor:"rgba(226, 222, 255, 0.5)",textoncolor:"rgba(255, 165, 0, 1)"})})}componentWillMount(){return super.componentWillMount(),this.btn=document.createElement("div"),this.span=document.createElement("span"),this.span.innerText=this.state.label,this.setStyle(),this}mount(){return this.btn.appendChild(this.span),this.container.appendChild(this.btn),super.mount()}componentDidMount(){super.componentDidMount(),this.btn.addEventListener("mousedown",this.handleMouseDown),this.btn.addEventListener("touchstart",this.handleTouchStart),this.on("style",()=>this.schedule(this.setStyle));var o=()=>this.span.innerText=this.state.label;return this.on("label",()=>this.schedule(o)),this.on("value",()=>this.schedule(this.setStyle)),this}}},"./src/components/Checkbox.ts":(E,l,t)=>{t.r(l),t.d(l,{Checkbox:()=>r});var c=t("./src/components/Button.ts");t("./src/components/Checkbox.scss");function u(n,a,s){return a in n?Object.defineProperty(n,a,{value:s,enumerable:!0,configurable:!0,writable:!0}):n[a]=s,n}class r extends c.Button{constructor(){super(...arguments),u(this,"className","checkbox"),u(this,"handlePointerDown",()=>{this.setValue(1-this.state.value)}),u(this,"handlePointerUp",()=>{})}}},"./src/components/Group.ts":(E,l,t)=>{t.r(l),t.d(l,{Group:()=>_});var c=t("./src/components/AbstractComponent.ts"),u=t("./src/components/HSlider.ts"),r=t("./src/components/VSlider.ts"),n=t("./src/components/Nentry.ts"),a=t("./src/components/Button.ts"),s=t("./src/components/Checkbox.ts"),o=t("./src/components/Knob.ts"),e=t("./src/components/Menu.ts"),i=t("./src/components/Radio.ts"),d=t("./src/components/Led.ts"),v=t("./src/components/Numerical.ts"),y=t("./src/components/HBargraph.ts"),A=t("./src/components/VBargraph.ts"),p=t("./src/layout/Layout.ts");t("./src/components/Group.scss");function m(g,h,f){return h in g?Object.defineProperty(g,h,{value:f,enumerable:!0,configurable:!0,writable:!0}):g[h]=f,g}class _ extends c.AbstractComponent{constructor(){super(...arguments),m(this,"container",void 0),m(this,"label",void 0),m(this,"labelCanvas",void 0),m(this,"labelCtx",void 0),m(this,"tabs",void 0),m(this,"children",void 0),m(this,"layout",void 0),m(this,"updateUI",()=>{this.children=[];var h=this.state,f=h.style,B=h.type,b=h.items,M=h.emitter,O=h.isRoot,C=f.grid,P=f.left,I=f.top,S=f.width,x=f.height;this.label.style.height="".concat(C*.3,"px"),this.container.style.left="".concat(P*C,"px"),this.container.style.top="".concat(I*C,"px"),this.container.style.width="".concat(S*C,"px"),this.container.style.height="".concat(x*C,"px"),this.container.className=["faust-ui-group","faust-ui-".concat(B),"".concat(O?"faust-ui-root":"")].join(" "),b.forEach(D=>{if(D.type.endsWith("group")){var j=_.getComponent(D,M,C);j&&this.children.push(j)}else{var U=D,T=_.getComponent(U,this.state.emitter,C);T&&this.children.push(T)}}),B==="tgroup"&&(this.tabs.innerHTML="",this.tabs.style.height="".concat(C,"px"),this.tabs.style.top="".concat(.25*C,"px"),this.state.items.forEach((D,j)=>{var U=D.label,T=document.createElement("span");T.innerText=U,T.className="faust-ui-tgroup-tab",T.style.fontSize="".concat(.25*C,"px"),T.style.width="".concat(2*C-20,"px"),T.style.height="".concat(C-20,"px"),T.style.lineHeight="".concat(C-20,"px"),T.addEventListener("click",()=>{for(var W=[],R=0;R<this.container.children.length;R++){var L=this.container.children[R];R>1&&W.push(L)}for(var K=0;K<W.length;K++){var $=W[K];$.style.visibility=j===K?"visible":"hidden"}for(var V=0;V<this.tabs.children.length;V++){var N=this.tabs.children[V];j!==V?N.classList.contains("active")&&N.classList.remove("active"):N.classList.add("active")}}),this.tabs.appendChild(T)}))})}static parseMeta(h){var f={};if(!h)return{metaObject:f};if(h.forEach(P=>Object.assign(f,P)),f.style){var B=/\{(?:(?:'|_)(.+?)(?:'|_):([-+]?[0-9]*\.?[0-9]+?);)+(?:(?:'|_)(.+?)(?:'|_):([-+]?[0-9]*\.?[0-9]+?))\}/,b=f.style.match(B);if(b){for(var M=/(?:(?:'|_)(.+?)(?:'|_):([-+]?[0-9]*\.?[0-9]+?))/g,O={},C;C=M.exec(b[0]);)O[C[1]]=+C[2];return{metaObject:f,enums:O}}}return{metaObject:f}}static getComponent(h,f,B){var b=p.Layout.predictType(h);if(b.endsWith("group")){var M=h,O=M.label,C=M.items,P=M.type,I=M.layout,S={label:O,type:P,items:C,style:{grid:B,width:I.width,height:I.height,left:I.offsetLeft,top:I.offsetTop,labelcolor:"rgba(255, 255, 255, 0.7)"},emitter:f};return new _(S)}var x=h,D=this.parseMeta(x.meta),j=D.metaObject,U=D.enums,T=j.tooltip,W=j.unit,R=j.scale,L=x.label,K=x.min,$=x.max,V=x.address,N=x.layout,z={label:L,address:V,tooltip:T,unit:W,scale:R||"linear",emitter:f,enums:U,style:{grid:B,width:N.width,height:N.height,left:N.offsetLeft,top:N.offsetTop},type:"float",min:isFinite(K)?K:0,max:isFinite($)?$:1,step:"step"in h?+h.step:1,value:"init"in h&&+h.init||0};return b==="button"?new a.Button(z):b==="checkbox"?new s.Checkbox(z):b==="nentry"?new n.Nentry(z):b==="knob"?new o.Knob(z):b==="menu"?new e.Menu(z):b==="radio"?new i.Radio(z):b==="hslider"?new u.HSlider(z):b==="vslider"?new r.VSlider(z):b==="hbargraph"?new y.HBargraph(z):b==="vbargraph"?new A.VBargraph(z):b==="numerical"?new v.Numerical(z):b==="led"?new d.Led(z):null}setState(h){var f=!1;for(var B in h){var b=B,M=h[b];if(b==="style")for(var O in h.style){var C=O;C in this.state.style&&this.state.style[C]!==h.style[C]&&(this.state.style[C]=h.style[C],f=!0)}else if(b in this.state&&this.state[b]!==M)this.state[b]=M,f=!0;else return;f&&this.emit(b,this.state[b])}}componentWillMount(){return this.container=document.createElement("div"),this.tabs=document.createElement("div"),this.tabs.className="faust-ui-tgroup-tabs",this.label=document.createElement("div"),this.label.className="faust-ui-group-label",this.labelCanvas=document.createElement("canvas"),this.labelCtx=this.labelCanvas.getContext("2d"),this.updateUI(),this.children.forEach(h=>h.componentWillMount()),this}paintLabel(){var h=this.state.label,f=this.state.style.labelcolor,B=this.labelCtx,b=this.labelCanvas,M=this.label.getBoundingClientRect(),O=M.width,C=M.height;return!O||!C?this:(O=Math.floor(O),C=Math.floor(C),b.height=C,b.width=O,B.clearRect(0,0,O,C),B.fillStyle=f,B.textBaseline="middle",B.textAlign="left",B.font="bold ".concat(C*.9,'px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"'),B.fillText(h,0,C/2,O),this)}mount(){return this.label.appendChild(this.labelCanvas),this.container.appendChild(this.label),this.tabs.children.length&&this.container.appendChild(this.tabs),this.children.forEach(h=>{h.mount(),this.container.appendChild(h.container)}),this}componentDidMount(){var h=()=>{var b=this.state.style,M=b.grid,O=b.left,C=b.top,P=b.width,I=b.height;if(this.label.style.height="".concat(M*.3,"px"),this.container.style.width="".concat(P*M,"px"),this.container.style.height="".concat(I*M,"px"),this.container.style.left="".concat(O*M,"px"),this.container.style.top="".concat(C*M,"px"),this.state.type==="tgroup"){this.tabs.style.height="".concat(M,"px"),this.tabs.style.top="".concat(.25*M,"px");for(var S=0;S<this.tabs.children.length;S++){var x=this.tabs.children[S];x.style.fontSize="".concat(.25*M,"px"),x.style.width="".concat(2*M-20,"px"),x.style.height="".concat(M-20,"px"),x.style.lineHeight="".concat(M-20,"px")}}this.paintLabel(),this.children.forEach(D=>D.setState({style:{grid:M}}))};this.on("style",()=>this.schedule(h));var f=()=>{this.updateUI(),this.children.forEach(b=>b.componentWillMount())};this.on("items",()=>this.schedule(f));var B=()=>{this.paintLabel(),this.label.title=this.state.label};return this.on("label",()=>this.schedule(B)),this.paintLabel(),this.tabs&&this.tabs.children.length&&this.tabs.children[0].click(),this.children.forEach(b=>b.componentDidMount()),this}}},"./src/components/HBargraph.ts":(E,l,t)=>{t.r(l),t.d(l,{HBargraph:()=>n});var c=t("./src/components/AbstractItem.ts");t("./src/components/HBargraph.scss");var u=t("./src/components/VBargraph.ts");function r(a,s,o){return s in a?Object.defineProperty(a,s,{value:o,enumerable:!0,configurable:!0,writable:!0}):a[s]=o,a}class n extends u.VBargraph{constructor(){super(...arguments),r(this,"className","hbargraph"),r(this,"setStyle",()=>{var s=this.state.style,o=s.height,e=s.grid,i=s.fontsize,d=s.textcolor,v=s.bgcolor,y=s.bordercolor;this.input.style.fontSize="".concat(i||o*e*.2,"px"),this.input.style.color=d,this.container.style.backgroundColor=v,this.container.style.borderColor=y}),r(this,"paint",()=>{var s=this.state.style,o=s.barwidth,e=s.barbgcolor,i=s.coldcolor,d=s.warmcolor,v=s.hotcolor,y=s.overloadcolor,A=this.state,p=A.type,m=A.max,_=A.min,g=A.enums,h=A.scale,f=A.value,B=this.ctx,b=this.canvas,M=this.canvasDiv.getBoundingClientRect(),O=M.width,C=M.height;O=Math.floor(O),C=Math.floor(C),b.width=O,b.height=C;var P=O*.9,I=o||Math.min(C/3,P*.05),S=O*.05,x=(C-I)*.5;this.paintValue=f;var D=this.paintValue;D>this.maxValue&&(this.maxValue=D,this.maxTimer&&window.clearTimeout(this.maxTimer),this.maxTimer=window.setTimeout(()=>{this.maxValue=this.paintValue,this.maxTimer=void 0,this.schedule(this.paint)},1e3)),D<this.maxValue&&typeof this.maxTimer=="undefined"&&(this.maxTimer=window.setTimeout(()=>{this.maxValue=this.paintValue,this.maxTimer=void 0,this.schedule(this.paint)},1e3));var j=this.maxValue,U=(-18-_)/(m-_),T=(-6-_)/(m-_),W=(-3-_)/(m-_),R=Math.max(0,-_/(m-_)),L=B.createLinearGradient(S,0,P,0);if(U<=1&&U>=0?L.addColorStop(U,i):U>1&&L.addColorStop(1,i),T<=1&&T>=0&&L.addColorStop(T,d),W<=1&&W>=0&&L.addColorStop(W,v),R<=1&&R>=0?L.addColorStop(R,y):R<0&&L.addColorStop(0,i),B.fillStyle=e,D<0&&B.fillRect(S,x,P*R,I),D<m&&B.fillRect(S+P*R+1,x,P*(1-R)-1,I),B.fillStyle=L,D>_){var K=Math.max(0,c.AbstractItem.getDistance({type:p,max:m,min:_,enums:g,scale:h,value:Math.min(0,D)}));B.fillRect(S,x,K*P,I)}if(D>0){var $=Math.max(0,c.AbstractItem.getDistance({type:p,max:m,min:_,enums:g,scale:h,value:Math.min(m,D)})-R);B.fillRect(S+R*P+1,x,$*P-1,I)}if(j>D){if(j<=0){var V=Math.max(0,c.AbstractItem.getDistance({type:p,max:m,min:_,enums:g,scale:h,value:Math.min(0,j)}));B.fillRect(S+V*P-1,x,1,I)}if(j>0){var N=Math.max(0,c.AbstractItem.getDistance({type:p,max:m,min:_,enums:g,scale:h,value:Math.min(m,j)})-R);B.fillRect(S+Math.min(P-1,(R+N)*P),x,1,I)}}})}paintLabel(){return super.paintLabel("left")}}},"./src/components/HSlider.ts":(E,l,t)=>{t.r(l),t.d(l,{HSlider:()=>n}),t("./src/components/HSlider.scss");var c=t("./src/components/utils.ts"),u=t("./src/components/VSlider.ts");function r(a,s,o){return s in a?Object.defineProperty(a,s,{value:o,enumerable:!0,configurable:!0,writable:!0}):a[s]=o,a}class n extends u.VSlider{constructor(){super(...arguments),r(this,"className","hslider"),r(this,"setStyle",()=>{var s=this.state.style,o=s.height,e=s.grid,i=s.fontsize,d=s.textcolor,v=s.bgcolor,y=s.bordercolor;this.input.style.fontSize="".concat(i||o*e*.2,"px"),this.input.style.color=d,this.container.style.backgroundColor=v,this.container.style.borderColor=y}),r(this,"paint",()=>{var s=this.state.style,o=s.sliderwidth,e=s.sliderbgcolor,i=s.sliderbgoncolor,d=s.slidercolor,v=this.ctx,y=this.canvas,A=this.distance,p=this.canvasDiv.getBoundingClientRect(),m=p.width,_=p.height;m=Math.floor(m),_=Math.floor(_),y.width=m,y.height=_;var g=m*.9,h=o||Math.min(_/3,g*.05),f=m*.05,B=(_-h)*.5,b=h*.25;this.interactionRect=[f,0,g,_];var M=v.createLinearGradient(f,0,f+g,0);M.addColorStop(Math.max(0,Math.min(1,A)),i),M.addColorStop(Math.max(0,Math.min(1,A)),e),v.fillStyle=M,(0,c.fillRoundedRect)(v,f,B,g,h,b),v.fillStyle=d,(0,c.fillRoundedRect)(v,f+g*A-h,B-h,h*2,h*3,b)})}paintLabel(){return super.paintLabel("left")}}},"./src/components/Knob.ts":(E,l,t)=>{t.r(l),t.d(l,{Knob:()=>s});var c=t("./src/components/AbstractItem.ts");t("./src/components/Knob.scss");var u=t("./src/components/utils.ts");function r(o,e){var i=Object.keys(o);if(Object.getOwnPropertySymbols){var d=Object.getOwnPropertySymbols(o);e&&(d=d.filter(function(v){return Object.getOwnPropertyDescriptor(o,v).enumerable})),i.push.apply(i,d)}return i}function n(o){for(var e=1;e<arguments.length;e++){var i=arguments[e]!=null?arguments[e]:{};e%2?r(Object(i),!0).forEach(function(d){a(o,d,i[d])}):Object.getOwnPropertyDescriptors?Object.defineProperties(o,Object.getOwnPropertyDescriptors(i)):r(Object(i)).forEach(function(d){Object.defineProperty(o,d,Object.getOwnPropertyDescriptor(i,d))})}return o}function a(o,e,i){return e in o?Object.defineProperty(o,e,{value:i,enumerable:!0,configurable:!0,writable:!0}):o[e]=i,o}class s extends c.AbstractItem{constructor(){super(...arguments),a(this,"className","knob"),a(this,"canvas",void 0),a(this,"inputNumber",void 0),a(this,"input",void 0),a(this,"ctx",void 0),a(this,"handleChange",e=>{var i=parseFloat(e.currentTarget.value);if(isFinite(i)){var d=this.setValue(+this.inputNumber.value);if(d)return}this.input.value=this.inputNumber.value+(this.state.unit||"")}),a(this,"setStyle",()=>{var e=this.state.style,i=e.fontsize,d=e.height,v=e.grid,y=e.textcolor,A=e.bgcolor,p=e.bordercolor;this.input.style.fontSize="".concat(i||d*v*.1,"px"),this.input.style.color=y,this.container.style.backgroundColor=A,this.container.style.borderColor=p}),a(this,"paint",()=>{var e=this.state.style,i=e.knobwidth,d=e.knobcolor,v=e.knoboncolor,y=e.needlecolor,A=this.ctx,p=this.canvas,m=this.distance,_=this.canvas.getBoundingClientRect(),g=_.width,h=_.height;g=Math.floor(g),h=Math.floor(h),p.width=g,p.height=h;var f=5/8*Math.PI,B=19/8*Math.PI,b=f+(0,u.toRad)(m*315),M=Math.min(g,h)*.75,O=M*.5,C=g*.5,P=h*.5,I=C+M*.5*Math.cos(b),S=P+M*.5*Math.sin(b),x=i||O*.2;A.strokeStyle=d,A.lineWidth=x,A.lineCap="round",A.beginPath(),A.arc(C,P,O,b,B),A.stroke(),m&&(A.strokeStyle=v,A.beginPath(),A.arc(C,P,O,f,b),A.stroke()),A.strokeStyle=y,A.beginPath(),A.moveTo(C,P),A.lineTo(I,S),A.stroke()}),a(this,"handlePointerDrag",e=>{var i=this.getValueFromDelta(e);i!==this.state.value&&this.setValue(i)})}static get defaultProps(){var e=super.defaultProps;return n(n({},e),{},{style:n(n({},e.style),{},{fontname:"Arial",fontsize:void 0,fontface:"regular",bgcolor:"rgba(18, 18, 18, 0)",bordercolor:"rgba(80, 80, 80, 0)",labelcolor:"rgba(226, 222, 255, 0.5)",textcolor:"rgba(18, 18, 18, 1)",knobwidth:void 0,knobcolor:"rgba(18, 18, 18, 1)",knoboncolor:"rgba(255, 165, 0, 1)",needlecolor:"rgba(200, 200, 200, 0.75)"})})}componentWillMount(){return super.componentWillMount(),this.canvas=document.createElement("canvas"),this.canvas.width=10,this.canvas.height=10,this.ctx=this.canvas.getContext("2d"),this.inputNumber=document.createElement("input"),this.inputNumber.type="number",this.inputNumber.value=(+this.state.value.toFixed(3)).toString(),this.inputNumber.max=this.state.max.toString(),this.inputNumber.min=this.state.min.toString(),this.inputNumber.step=this.state.step.toString(),this.input=document.createElement("input"),this.input.value=this.inputNumber.value+(this.state.unit||""),this.input.spellcheck=!1,this.setStyle(),this}componentDidMount(){super.componentDidMount(),this.input.addEventListener("change",this.handleChange),this.canvas.addEventListener("mousedown",this.handleMouseDown),this.canvas.addEventListener("touchstart",this.handleTouchStart,{passive:!1}),this.on("style",()=>{this.schedule(this.setStyle),this.schedule(this.paint)}),this.on("label",()=>this.schedule(this.paintLabel));var e=()=>{this.inputNumber.value=(+this.state.value.toFixed(3)).toString(),this.input.value=this.inputNumber.value+(this.state.unit||"")};this.on("value",()=>{this.schedule(e),this.schedule(this.paint)});var i=()=>this.inputNumber.max=this.state.max.toString();this.on("max",()=>{this.schedule(i),this.schedule(this.paint)});var d=()=>this.inputNumber.min=this.state.min.toString();this.on("min",()=>{this.schedule(d),this.schedule(this.paint)});var v=()=>this.inputNumber.step=this.state.step.toString();return this.on("step",()=>{this.schedule(v),this.schedule(this.paint)}),this.schedule(this.paint),this}mount(){return this.container.appendChild(this.label),this.container.appendChild(this.canvas),this.container.appendChild(this.input),super.mount()}getValueFromDelta(e){var i=this.state,d=i.type,v=i.min,y=i.max,A=i.enums,p=i.scale,m=d==="enum"?1:this.state.step||1,_=this.stepRange,g=this.stepsCount,h=100,f=c.AbstractItem.getDistance({value:e.prevValue,type:d,min:v,max:y,enums:A,scale:p})*h,B=f+e.fromY-e.y,b=(0,u.denormalize)(B/h,v,y),M=p==="exp"?(0,u.normExp)(b,v,y):p==="log"?(0,u.normLog)(b,v,y):b,O=Math.round((0,u.normalize)(M,v,y)*h/_);return O=Math.min(g,Math.max(0,O)),d==="enum"?O:d==="int"?Math.round(O*m+v):O*m+v}}},"./src/components/Led.ts":(E,l,t)=>{t.r(l),t.d(l,{Led:()=>a});var c=t("./src/components/AbstractItem.ts");t("./src/components/Led.scss");function u(s,o){var e=Object.keys(s);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(s);o&&(i=i.filter(function(d){return Object.getOwnPropertyDescriptor(s,d).enumerable})),e.push.apply(e,i)}return e}function r(s){for(var o=1;o<arguments.length;o++){var e=arguments[o]!=null?arguments[o]:{};o%2?u(Object(e),!0).forEach(function(i){n(s,i,e[i])}):Object.getOwnPropertyDescriptors?Object.defineProperties(s,Object.getOwnPropertyDescriptors(e)):u(Object(e)).forEach(function(i){Object.defineProperty(s,i,Object.getOwnPropertyDescriptor(e,i))})}return s}function n(s,o,e){return o in s?Object.defineProperty(s,o,{value:e,enumerable:!0,configurable:!0,writable:!0}):s[o]=e,s}class a extends c.AbstractItem{constructor(){super(...arguments),n(this,"className","led"),n(this,"canvasDiv",void 0),n(this,"canvas",void 0),n(this,"tempCanvas",void 0),n(this,"ctx",void 0),n(this,"tempCtx",void 0),n(this,"setStyle",()=>{var o=this.state.style,e=o.bgcolor,i=o.bordercolor;this.container.style.backgroundColor=e,this.container.style.borderColor=i}),n(this,"paint",()=>{var o=this.state.style,e=o.shape,i=o.ledbgcolor,d=o.coldcolor,v=o.warmcolor,y=o.hotcolor,A=o.overloadcolor,p=this.state,m=p.min,_=p.max,g=this.canvas,h=this.ctx,f=this.tempCanvas,B=this.tempCtx,b=this.distance,M=g.getBoundingClientRect(),O=M.width,C=M.height;g.width=O,g.height=C;var P=Math.min(C,O)*.75,I=P,S=(O-I)*.5,x=(C-P)*.5,D=(-18-m)/(_-m),j=(-6-m)/(_-m),U=(-3-m)/(_-m),T=-m/(_-m),W=B.createLinearGradient(0,0,f.width,0);D<=1&&D>=0?W.addColorStop(D,d):D>1&&W.addColorStop(1,d),j<=1&&j>=0&&W.addColorStop(j,v),U<=1&&U>=0&&W.addColorStop(U,y),T<=1&&T>=0?W.addColorStop(T,A):T<0&&W.addColorStop(0,d),B.fillStyle=W,B.fillRect(0,0,f.width,10);var R=B.getImageData(Math.min(f.width-1,b*f.width),0,1,1).data;b?h.fillStyle="rgb(".concat(R[0],", ").concat(R[1],", ").concat(R[2],")"):h.fillStyle=i,e==="circle"?h.arc(O/2,C/2,O/2-S,0,2*Math.PI):h.rect(S,x,I,P),h.fill()})}static get defaultProps(){var o=super.defaultProps;return r(r({},o),{},{style:r(r({},o.style),{},{fontname:"Arial",fontsize:void 0,fontface:"regular",bgcolor:"rgba(18, 18, 18, 0)",bordercolor:"rgba(80, 80, 80, 0)",labelcolor:"rgba(226, 222, 255, 0.5)",textcolor:"rgba(18, 18, 18, 1)",shape:"circle",ledbgcolor:"rgba(18, 18, 18, 1)",coldcolor:"rgba(12, 248, 100, 1)",warmcolor:"rgba(195, 248, 100, 1)",hotcolor:"rgba(255, 193, 10, 1)",overloadcolor:"rgba(255, 10, 10, 1)"})})}componentWillMount(){return super.componentWillMount(),this.canvasDiv=document.createElement("div"),this.canvasDiv.className="faust-ui-component-".concat(this.className,"-canvasdiv"),this.canvas=document.createElement("canvas"),this.canvas.width=10,this.canvas.height=10,this.ctx=this.canvas.getContext("2d"),this.tempCanvas=document.createElement("canvas"),this.tempCtx=this.tempCanvas.getContext("2d"),this.tempCanvas.width=128,this.tempCanvas.height=1,this.setStyle(),this}componentDidMount(){return super.componentDidMount(),this.canvas.addEventListener("mousedown",this.handleMouseDown),this.canvas.addEventListener("touchstart",this.handleTouchStart,{passive:!1}),this.on("style",()=>this.schedule(this.setStyle)),this.on("label",()=>this.schedule(this.paintLabel)),this.on("value",()=>this.schedule(this.paint)),this.on("max",()=>this.schedule(this.paint)),this.on("min",()=>this.schedule(this.paint)),this.on("step",()=>this.schedule(this.paint)),this.schedule(this.paint),this}mount(){return this.canvasDiv.appendChild(this.canvas),this.container.appendChild(this.label),this.container.appendChild(this.canvasDiv),super.mount()}}},"./src/components/Menu.ts":(E,l,t)=>{t.r(l),t.d(l,{Menu:()=>a});var c=t("./src/components/AbstractItem.ts");t("./src/components/Menu.scss");function u(s,o){var e=Object.keys(s);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(s);o&&(i=i.filter(function(d){return Object.getOwnPropertyDescriptor(s,d).enumerable})),e.push.apply(e,i)}return e}function r(s){for(var o=1;o<arguments.length;o++){var e=arguments[o]!=null?arguments[o]:{};o%2?u(Object(e),!0).forEach(function(i){n(s,i,e[i])}):Object.getOwnPropertyDescriptors?Object.defineProperties(s,Object.getOwnPropertyDescriptors(e)):u(Object(e)).forEach(function(i){Object.defineProperty(s,i,Object.getOwnPropertyDescriptor(e,i))})}return s}function n(s,o,e){return o in s?Object.defineProperty(s,o,{value:e,enumerable:!0,configurable:!0,writable:!0}):s[o]=e,s}class a extends c.AbstractItem{constructor(){super(...arguments),n(this,"className","menu"),n(this,"select",void 0),n(this,"handleChange",o=>{this.setValue(+o.currentTarget.value)}),n(this,"setStyle",()=>{var o=this.state.style,e=o.height,i=o.grid,d=o.fontsize,v=o.textcolor,y=o.bgcolor,A=o.bordercolor;this.select.style.backgroundColor=y,this.select.style.borderColor=A,this.select.style.color=v,this.select.style.fontSize="".concat(d||e*i/4,"px")})}static get defaultProps(){var o=super.defaultProps;return r(r({},o),{},{style:r(r({},o.style),{},{fontname:"Arial",fontsize:void 0,fontface:"regular",bgcolor:"rgba(255, 255, 255, 0.25)",bordercolor:"rgba(80, 80, 80, 0)",labelcolor:"rgba(226, 222, 255, 0.5)",textcolor:"rgba(18, 18, 18, 1)"})})}componentWillMount(){return super.componentWillMount(),this.select=document.createElement("select"),this.getOptions(),this.setStyle(),this}getOptions(){var o=this.state.enums;if(this.select.innerHTML="",o){var e=0;for(var i in o){var d=document.createElement("option");d.value=o[i].toString(),d.text=i,e===0&&(d.selected=!0),this.select.appendChild(d),e++}}}componentDidMount(){super.componentDidMount(),this.select.addEventListener("change",this.handleChange),this.on("style",()=>this.schedule(this.setStyle)),this.on("label",()=>this.schedule(this.paintLabel)),this.on("enums",()=>this.schedule(this.getOptions));var o=()=>{for(var e=this.select.children.length-1;e>=0;e--){var i=this.select.children[e];+i.value===this.state.value&&(this.select.selectedIndex=e)}};return this.on("value",()=>this.schedule(o)),o(),this}mount(){return this.container.appendChild(this.label),this.container.appendChild(this.select),super.mount()}}},"./src/components/Nentry.ts":(E,l,t)=>{t.r(l),t.d(l,{Nentry:()=>a});var c=t("./src/components/AbstractItem.ts");t("./src/components/Nentry.scss");function u(s,o){var e=Object.keys(s);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(s);o&&(i=i.filter(function(d){return Object.getOwnPropertyDescriptor(s,d).enumerable})),e.push.apply(e,i)}return e}function r(s){for(var o=1;o<arguments.length;o++){var e=arguments[o]!=null?arguments[o]:{};o%2?u(Object(e),!0).forEach(function(i){n(s,i,e[i])}):Object.getOwnPropertyDescriptors?Object.defineProperties(s,Object.getOwnPropertyDescriptors(e)):u(Object(e)).forEach(function(i){Object.defineProperty(s,i,Object.getOwnPropertyDescriptor(e,i))})}return s}function n(s,o,e){return o in s?Object.defineProperty(s,o,{value:e,enumerable:!0,configurable:!0,writable:!0}):s[o]=e,s}class a extends c.AbstractItem{constructor(){super(...arguments),n(this,"className","nentry"),n(this,"input",void 0),n(this,"handleChange",o=>{this.setValue(+o.currentTarget.value)}),n(this,"setStyle",()=>{var o=this.state.style,e=o.height,i=o.grid,d=o.fontsize,v=o.textcolor,y=o.bgcolor,A=o.bordercolor;this.input.style.backgroundColor=y,this.input.style.borderColor=A,this.input.style.color=v,this.input.style.fontSize="".concat(d||e*i/4,"px")})}static get defaultProps(){var o=super.defaultProps;return r(r({},o),{},{style:r(r({},o.style),{},{fontname:"Arial",fontsize:void 0,fontface:"regular",bgcolor:"rgba(255, 255, 255, 0.25)",bordercolor:"rgba(80, 80, 80, 0)",labelcolor:"rgba(226, 222, 255, 0.5)",textcolor:"rgba(18, 18, 18, 1)"})})}componentWillMount(){return super.componentWillMount(),this.input=document.createElement("input"),this.input.type="number",this.input.value=(+this.state.value.toFixed(3)).toString(),this.input.max=this.state.max.toString(),this.input.min=this.state.min.toString(),this.input.step=this.state.step.toString(),this.setStyle(),this}componentDidMount(){super.componentDidMount(),this.input.addEventListener("change",this.handleChange),this.on("style",()=>this.schedule(this.setStyle)),this.on("label",()=>this.schedule(this.paintLabel));var o=()=>this.input.value=(+this.state.value.toFixed(3)).toString();this.on("value",()=>this.schedule(o));var e=()=>this.input.max=this.state.max.toString();this.on("max",()=>this.schedule(e));var i=()=>this.input.min=this.state.min.toString();this.on("min",()=>this.schedule(i));var d=()=>this.input.step=this.state.step.toString();return this.on("step",()=>this.schedule(d)),this}mount(){return this.container.appendChild(this.label),this.container.appendChild(this.input),super.mount()}}},"./src/components/Numerical.ts":(E,l,t)=>{t.r(l),t.d(l,{Numerical:()=>a});var c=t("./src/components/AbstractItem.ts");t("./src/components/Numerical.scss");function u(s,o){var e=Object.keys(s);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(s);o&&(i=i.filter(function(d){return Object.getOwnPropertyDescriptor(s,d).enumerable})),e.push.apply(e,i)}return e}function r(s){for(var o=1;o<arguments.length;o++){var e=arguments[o]!=null?arguments[o]:{};o%2?u(Object(e),!0).forEach(function(i){n(s,i,e[i])}):Object.getOwnPropertyDescriptors?Object.defineProperties(s,Object.getOwnPropertyDescriptors(e)):u(Object(e)).forEach(function(i){Object.defineProperty(s,i,Object.getOwnPropertyDescriptor(e,i))})}return s}function n(s,o,e){return o in s?Object.defineProperty(s,o,{value:e,enumerable:!0,configurable:!0,writable:!0}):s[o]=e,s}class a extends c.AbstractItem{constructor(){super(...arguments),n(this,"className","numerical"),n(this,"input",void 0),n(this,"setStyle",()=>{var o=this.state.style,e=o.height,i=o.grid,d=o.fontsize,v=o.textcolor,y=o.bgcolor,A=o.bordercolor;this.input.style.backgroundColor=y,this.input.style.borderColor=A,this.input.style.color=v,this.input.style.fontSize="".concat(d||e*i/4,"px")})}static get defaultProps(){var o=super.defaultProps;return r(r({},o),{},{style:r(r({},o.style),{},{fontname:"Arial",fontsize:void 0,fontface:"regular",bgcolor:"rgba(255, 255, 255, 0.25)",bordercolor:"rgba(80, 80, 80, 0)",labelcolor:"rgba(226, 222, 255, 0.5)",textcolor:"rgba(18, 18, 18, 1)"})})}componentWillMount(){return super.componentWillMount(),this.input=document.createElement("input"),this.input.disabled=!0,this.input.value=(+this.state.value.toFixed(3)).toString()+(this.state.unit||""),this.setStyle(),this}componentDidMount(){super.componentDidMount(),this.on("style",()=>this.schedule(this.setStyle)),this.on("label",()=>this.schedule(this.paintLabel));var o=()=>this.input.value=(+this.state.value.toFixed(3)).toString()+(this.state.unit||"");return this.on("value",()=>this.schedule(o)),this}mount(){return this.container.appendChild(this.label),this.container.appendChild(this.input),super.mount()}}},"./src/components/Radio.ts":(E,l,t)=>{t.r(l),t.d(l,{Radio:()=>a});var c=t("./src/components/AbstractItem.ts");t("./src/components/Radio.scss");function u(s,o){var e=Object.keys(s);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(s);o&&(i=i.filter(function(d){return Object.getOwnPropertyDescriptor(s,d).enumerable})),e.push.apply(e,i)}return e}function r(s){for(var o=1;o<arguments.length;o++){var e=arguments[o]!=null?arguments[o]:{};o%2?u(Object(e),!0).forEach(function(i){n(s,i,e[i])}):Object.getOwnPropertyDescriptors?Object.defineProperties(s,Object.getOwnPropertyDescriptors(e)):u(Object(e)).forEach(function(i){Object.defineProperty(s,i,Object.getOwnPropertyDescriptor(e,i))})}return s}function n(s,o,e){return o in s?Object.defineProperty(s,o,{value:e,enumerable:!0,configurable:!0,writable:!0}):s[o]=e,s}class a extends c.AbstractItem{constructor(){var o;super(...arguments),o=this,n(this,"className","radio"),n(this,"group",void 0),n(this,"getOptions",()=>{var e=this.state,i=e.enums,d=e.address;if(this.group.innerHTML="",i){var v=0,y=function(m){var _=document.createElement("input"),g=document.createElement("div");_.value=i[m].toString(),_.name=d,_.type="radio",v===0&&(_.checked=!0),_.addEventListener("change",()=>{_.checked&&o.setValue(i[m])}),g.appendChild(_),g.append(m),o.group.appendChild(g),v++};for(var A in i)y(A)}}),n(this,"setStyle",()=>{var e=this.state.style,i=e.height,d=e.width,v=e.grid,y=e.fontsize,A=e.textcolor,p=e.bgcolor,m=e.bordercolor,_=Math.min(i*v*.1,d*v*.1);this.group.style.backgroundColor=p,this.group.style.borderColor=m,this.group.style.color=A,this.group.style.fontSize="".concat(y||_,"px")})}static get defaultProps(){var o=super.defaultProps;return r(r({},o),{},{style:r(r({},o.style),{},{fontname:"Arial",fontsize:void 0,fontface:"regular",bgcolor:"rgba(255, 255, 255, 0.25)",bordercolor:"rgba(80, 80, 80, 0)",labelcolor:"rgba(226, 222, 255, 0.5)",textcolor:"rgba(18, 18, 18, 1)"})})}componentWillMount(){return super.componentWillMount(),this.group=document.createElement("div"),this.group.className="faust-ui-component-radio-group",this.getOptions(),this.setStyle(),this}componentDidMount(){super.componentDidMount(),this.on("style",()=>this.schedule(this.setStyle)),this.on("label",()=>this.schedule(this.paintLabel)),this.on("enums",()=>this.schedule(this.getOptions));var o=()=>{for(var e=this.group.children.length-1;e>=0;e--){var i=this.group.children[e].querySelector("input");+i.value===this.state.value&&(i.checked=!0)}};return this.on("value",()=>this.schedule(o)),o(),this}mount(){return this.container.appendChild(this.label),this.container.appendChild(this.group),super.mount()}}},"./src/components/VBargraph.ts":(E,l,t)=>{t.r(l),t.d(l,{VBargraph:()=>a});var c=t("./src/components/AbstractItem.ts");t("./src/components/VBargraph.scss");function u(s,o){var e=Object.keys(s);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(s);o&&(i=i.filter(function(d){return Object.getOwnPropertyDescriptor(s,d).enumerable})),e.push.apply(e,i)}return e}function r(s){for(var o=1;o<arguments.length;o++){var e=arguments[o]!=null?arguments[o]:{};o%2?u(Object(e),!0).forEach(function(i){n(s,i,e[i])}):Object.getOwnPropertyDescriptors?Object.defineProperties(s,Object.getOwnPropertyDescriptors(e)):u(Object(e)).forEach(function(i){Object.defineProperty(s,i,Object.getOwnPropertyDescriptor(e,i))})}return s}function n(s,o,e){return o in s?Object.defineProperty(s,o,{value:e,enumerable:!0,configurable:!0,writable:!0}):s[o]=e,s}class a extends c.AbstractItem{constructor(){super(...arguments),n(this,"className","vbargraph"),n(this,"canvas",void 0),n(this,"input",void 0),n(this,"flexDiv",void 0),n(this,"canvasDiv",void 0),n(this,"ctx",void 0),n(this,"setStyle",()=>{var o=this.state.style,e=o.height,i=o.width,d=o.grid,v=o.fontsize,y=o.textcolor,A=o.bgcolor,p=o.bordercolor,m=Math.min(e*d*.05,i*d*.2);this.input.style.fontSize="".concat(v||m,"px"),this.input.style.color=y,this.container.style.backgroundColor=A,this.container.style.borderColor=p}),n(this,"paintValue",0),n(this,"maxValue",-1/0),n(this,"maxTimer",void 0),n(this,"paint",()=>{var o=this.state.style,e=o.barwidth,i=o.barbgcolor,d=o.coldcolor,v=o.warmcolor,y=o.hotcolor,A=o.overloadcolor,p=this.state,m=p.type,_=p.max,g=p.min,h=p.enums,f=p.scale,B=p.value,b=this.ctx,M=this.canvas,O=this.canvasDiv.getBoundingClientRect(),C=O.width,P=O.height;C=Math.floor(C),P=Math.floor(P),M.width=C,M.height=P;var I=P*.9,S=e||Math.min(C/3,I*.05),x=(C-S)*.5,D=P*.05;this.paintValue=B;var j=this.paintValue;j>this.maxValue&&(this.maxValue=j,this.maxTimer&&window.clearTimeout(this.maxTimer),this.maxTimer=window.setTimeout(()=>{this.maxValue=this.paintValue,this.maxTimer=void 0,this.schedule(this.paint)},1e3)),j<this.maxValue&&typeof this.maxTimer=="undefined"&&(this.maxTimer=window.setTimeout(()=>{this.maxValue=this.paintValue,this.maxTimer=void 0,this.schedule(this.paint)},1e3));var U=this.maxValue,T=(-18-g)/(_-g),W=(-6-g)/(_-g),R=(-3-g)/(_-g),L=Math.max(0,-g/(_-g)),K=b.createLinearGradient(0,I,0,D);if(T<=1&&T>=0?K.addColorStop(T,d):T>1&&K.addColorStop(1,d),W<=1&&W>=0&&K.addColorStop(W,v),R<=1&&R>=0&&K.addColorStop(R,y),L<=1&&L>=0?K.addColorStop(L,A):L<0&&K.addColorStop(0,d),b.fillStyle=i,j<0&&b.fillRect(x,D+(1-L)*I,S,I*L),j<_&&b.fillRect(x,D,S,(1-L)*I-1),b.fillStyle=K,j>g){var $=Math.max(0,c.AbstractItem.getDistance({type:m,max:_,min:g,enums:h,scale:f,value:Math.min(0,j)}));b.fillRect(x,D+(1-$)*I,S,I*$)}if(j>0){var V=Math.max(0,c.AbstractItem.getDistance({type:m,max:_,min:g,enums:h,scale:f,value:Math.min(_,j)})-L);b.fillRect(x,D+(1-L-V)*I,S,I*V-1)}if(U>j){if(U<=0){var N=Math.max(0,c.AbstractItem.getDistance({type:m,max:_,min:g,enums:h,scale:f,value:Math.min(0,U)}));b.fillRect(x,D+(1-N)*I,S,1)}if(U>0){var z=Math.max(0,c.AbstractItem.getDistance({type:m,max:_,min:g,enums:h,scale:f,value:Math.min(_,U)})-L);b.fillRect(x,Math.max(D,D+(1-L-z)*I-1),S,1)}}})}static get defaultProps(){var o=super.defaultProps;return r(r({},o),{},{style:r(r({},o.style),{},{fontname:"Arial",fontsize:void 0,fontface:"regular",bgcolor:"rgba(18, 18, 18, 0)",bordercolor:"rgba(80, 80, 80, 0)",labelcolor:"rgba(226, 222, 255, 0.5)",textcolor:"rgba(18, 18, 18, 1)",barwidth:void 0,barbgcolor:"rgba(18, 18, 18, 1)",coldcolor:"rgba(12, 248, 100, 1)",warmcolor:"rgba(195, 248, 100, 1)",hotcolor:"rgba(255, 193, 10, 1)",overloadcolor:"rgba(255, 10, 10, 1)"})})}componentWillMount(){return super.componentWillMount(),this.flexDiv=document.createElement("div"),this.flexDiv.className="faust-ui-component-".concat(this.className,"-flexdiv"),this.canvasDiv=document.createElement("div"),this.canvasDiv.className="faust-ui-component-".concat(this.className,"-canvasdiv"),this.canvas=document.createElement("canvas"),this.canvas.width=10,this.canvas.height=10,this.ctx=this.canvas.getContext("2d"),this.input=document.createElement("input"),this.input.disabled=!0,this.input.value=(+this.state.value.toFixed(3)).toString()+(this.state.unit||""),this.setStyle(),this}componentDidMount(){super.componentDidMount(),this.canvas.addEventListener("mousedown",this.handleMouseDown),this.canvas.addEventListener("touchstart",this.handleTouchStart,{passive:!1}),this.on("style",()=>{this.schedule(this.setStyle),this.schedule(this.paint)}),this.on("label",()=>this.schedule(this.paintLabel));var o=()=>this.input.value=(+this.state.value.toFixed(3)).toString()+(this.state.unit||"");return this.on("value",()=>{this.schedule(o),this.schedule(this.paint)}),this.on("max",()=>this.schedule(this.paint)),this.on("min",()=>this.schedule(this.paint)),this.on("step",()=>this.schedule(this.paint)),this.schedule(this.paint),this}mount(){return this.canvasDiv.appendChild(this.canvas),this.flexDiv.appendChild(this.canvasDiv),this.flexDiv.appendChild(this.input),this.container.appendChild(this.label),this.container.appendChild(this.flexDiv),super.mount()}}},"./src/components/VSlider.ts":(E,l,t)=>{t.r(l),t.d(l,{VSlider:()=>s});var c=t("./src/components/AbstractItem.ts");t("./src/components/VSlider.scss");var u=t("./src/components/utils.ts");function r(o,e){var i=Object.keys(o);if(Object.getOwnPropertySymbols){var d=Object.getOwnPropertySymbols(o);e&&(d=d.filter(function(v){return Object.getOwnPropertyDescriptor(o,v).enumerable})),i.push.apply(i,d)}return i}function n(o){for(var e=1;e<arguments.length;e++){var i=arguments[e]!=null?arguments[e]:{};e%2?r(Object(i),!0).forEach(function(d){a(o,d,i[d])}):Object.getOwnPropertyDescriptors?Object.defineProperties(o,Object.getOwnPropertyDescriptors(i)):r(Object(i)).forEach(function(d){Object.defineProperty(o,d,Object.getOwnPropertyDescriptor(i,d))})}return o}function a(o,e,i){return e in o?Object.defineProperty(o,e,{value:i,enumerable:!0,configurable:!0,writable:!0}):o[e]=i,o}class s extends c.AbstractItem{constructor(){super(...arguments),a(this,"className","vslider"),a(this,"canvas",void 0),a(this,"inputNumber",void 0),a(this,"input",void 0),a(this,"flexDiv",void 0),a(this,"canvasDiv",void 0),a(this,"ctx",void 0),a(this,"interactionRect",[0,0,0,0]),a(this,"handleChange",e=>{var i=parseFloat(e.currentTarget.value);if(isFinite(i)){var d=this.setValue(+i);if(d)return}this.input.value=this.inputNumber.value+(this.state.unit||"")}),a(this,"setStyle",()=>{var e=this.state.style,i=e.height,d=e.width,v=e.grid,y=e.fontsize,A=e.textcolor,p=e.bgcolor,m=e.bordercolor,_=Math.min(i*v*.05,d*v*.2);this.input.style.fontSize="".concat(y||_,"px"),this.input.style.color=A,this.container.style.backgroundColor=p,this.container.style.borderColor=m}),a(this,"paint",()=>{var e=this.state.style,i=e.sliderwidth,d=e.sliderbgcolor,v=e.sliderbgoncolor,y=e.slidercolor,A=this.ctx,p=this.canvas,m=this.distance,_=this.canvasDiv.getBoundingClientRect(),g=_.width,h=_.height;g=Math.floor(g),h=Math.floor(h),p.width=g,p.height=h;var f=h*.9,B=i||Math.min(g/3,f*.05),b=(g-B)*.5,M=h*.05,O=B*.25;this.interactionRect=[0,M,g,f];var C=A.createLinearGradient(0,M,0,M+f);C.addColorStop(Math.max(0,Math.min(1,1-m)),d),C.addColorStop(Math.max(0,Math.min(1,1-m)),v),A.fillStyle=C,(0,u.fillRoundedRect)(A,b,M,B,f,O),A.fillStyle=y,(0,u.fillRoundedRect)(A,b-B,M+f*(1-m)-B,B*3,B*2,O)}),a(this,"handlePointerDown",e=>{var i=this.state.value;if(!(e.x<this.interactionRect[0]||e.x>this.interactionRect[0]+this.interactionRect[2]||e.y<this.interactionRect[1]||e.y>this.interactionRect[1]+this.interactionRect[3])){var d=this.getValueFromPos(e);d!==i&&this.setValue(this.getValueFromPos(e))}}),a(this,"handlePointerDrag",e=>{var i=this.getValueFromPos(e);i!==this.state.value&&this.setValue(i)})}static get defaultProps(){var e=super.defaultProps;return n(n({},e),{},{style:n(n({},e.style),{},{fontname:"Arial",fontsize:void 0,fontface:"regular",bgcolor:"rgba(18, 18, 18, 0)",bordercolor:"rgba(80, 80, 80, 0)",labelcolor:"rgba(226, 222, 255, 0.5)",textcolor:"rgba(18, 18, 18, 1)",sliderwidth:void 0,sliderbgcolor:"rgba(18, 18, 18, 1)",sliderbgoncolor:"rgba(255, 165, 0, 1)",slidercolor:"rgba(200, 200, 200, 0.75)"})})}componentWillMount(){return super.componentWillMount(),this.flexDiv=document.createElement("div"),this.flexDiv.className="faust-ui-component-".concat(this.className,"-flexdiv"),this.canvasDiv=document.createElement("div"),this.canvasDiv.className="faust-ui-component-".concat(this.className,"-canvasdiv"),this.canvas=document.createElement("canvas"),this.canvas.width=10,this.canvas.height=10,this.ctx=this.canvas.getContext("2d"),this.inputNumber=document.createElement("input"),this.inputNumber.type="number",this.inputNumber.value=(+this.state.value.toFixed(3)).toString(),this.inputNumber.max=this.state.max.toString(),this.inputNumber.min=this.state.min.toString(),this.inputNumber.step=this.state.step.toString(),this.input=document.createElement("input"),this.input.value=this.inputNumber.value+(this.state.unit||""),this.input.spellcheck=!1,this.setStyle(),this}componentDidMount(){super.componentDidMount(),this.input.addEventListener("change",this.handleChange),this.canvas.addEventListener("mousedown",this.handleMouseDown),this.canvas.addEventListener("touchstart",this.handleTouchStart,{passive:!1}),this.on("style",()=>{this.schedule(this.setStyle),this.schedule(this.paint)}),this.on("label",()=>this.schedule(this.paintLabel));var e=()=>{this.inputNumber.value=(+this.state.value.toFixed(3)).toString(),this.input.value=this.inputNumber.value+(this.state.unit||"")};this.on("value",()=>{this.schedule(e),this.schedule(this.paint)});var i=()=>this.inputNumber.max=this.state.max.toString();this.on("max",()=>{this.schedule(i),this.schedule(this.paint)});var d=()=>this.inputNumber.min=this.state.min.toString();this.on("min",()=>{this.schedule(d),this.schedule(this.paint)});var v=()=>this.inputNumber.step=this.state.step.toString();return this.on("step",()=>{this.schedule(v),this.schedule(this.paint)}),this.schedule(this.paint),this}mount(){return this.canvasDiv.appendChild(this.canvas),this.flexDiv.appendChild(this.canvasDiv),this.flexDiv.appendChild(this.input),this.container.appendChild(this.label),this.container.appendChild(this.flexDiv),super.mount()}get stepsCount(){var e=this.state,i=e.type,d=e.max,v=e.min,y=e.step,A=e.enums,p=i==="enum"?A.length:i==="int"?d-v:(d-v)/y;return y?i==="enum"?A.length:i==="int"?Math.min(Math.floor((d-v)/(Math.round(y)||0)),p):Math.floor((d-v)/y):p}get stepRange(){var e=this.interactionRect[this.className==="vslider"?3:2],i=this.stepsCount;return e/i}getValueFromPos(e){var i=this.state,d=i.type,v=i.min,y=i.max,A=i.scale,p=d==="enum"?1:this.state.step||1,m=this.stepRange,_=this.stepsCount,g=this.className==="vslider"?this.interactionRect[3]-(e.y-this.interactionRect[1]):e.x-this.interactionRect[0],h=this.className==="vslider"?this.interactionRect[3]:this.interactionRect[2],f=(0,u.denormalize)(g/h,v,y),B=A==="exp"?(0,u.normExp)(f,v,y):A==="log"?(0,u.normLog)(f,v,y):f,b=Math.round((0,u.normalize)(B,v,y)*h/m);return b=Math.min(_,Math.max(0,b)),d==="enum"?b:d==="int"?Math.round(b*p+v):b*p+v}}},"./src/components/utils.ts":(E,l,t)=>{t.r(l),t.d(l,{toMIDI:()=>c,toRad:()=>u,atodb:()=>r,dbtoa:()=>n,denormalize:()=>a,normalize:()=>s,normLog:()=>o,iNormLog:()=>e,normExp:()=>i,iNormExp:()=>d,roundedRect:()=>v,fillRoundedRect:()=>y});var c=A=>["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"][(A%12+12)%12]+Math.round(A/12-2),u=A=>A*Math.PI/180,r=A=>20*Math.log10(A),n=A=>Math.pow(10,A/20),a=(A,p,m)=>p+(m-p)*A,s=(A,p,m)=>(A-p)/(m-p)||0,o=(A,p,m)=>{var _=s(A,p,m),g=Math.log(Math.max(Number.EPSILON,p)),h=Math.log(Math.max(Number.EPSILON,m)),f=a(_,g,h),B=Math.exp(f);return Math.max(p,Math.min(m,B))},e=(A,p,m)=>{var _=Math.max(p,Math.min(m,A)),g=Math.log(Math.max(Number.EPSILON,_)),h=Math.log(Math.max(Number.EPSILON,p)),f=Math.log(Math.max(Number.EPSILON,m)),B=s(g,h,f);return a(B,p,m)},i=e,d=o,v=(A,p,m,_,g,h)=>{var f=[0,0,0,0];typeof h=="number"?f.fill(h):h.forEach((B,b)=>f[b]=B),A.beginPath(),A.moveTo(p+f[0],m),A.lineTo(p+_-f[1],m),A.quadraticCurveTo(p+_,m,p+_,m+f[1]),A.lineTo(p+_,m+g-f[2]),A.quadraticCurveTo(p+_,m+g,p+_-f[2],m+g),A.lineTo(p+f[3],m+g),A.quadraticCurveTo(p,m+g,p,m+g-f[3]),A.lineTo(p,m+f[0]),A.quadraticCurveTo(p,m,p+f[0],m),A.closePath(),A.stroke()},y=(A,p,m,_,g,h)=>{var f=[0,0,0,0];typeof h=="number"?f.fill(h):h.forEach((B,b)=>f[b]=B),A.beginPath(),A.moveTo(p+f[0],m),A.lineTo(p+_-f[1],m),A.quadraticCurveTo(p+_,m,p+_,m+f[1]),A.lineTo(p+_,m+g-f[2]),A.quadraticCurveTo(p+_,m+g,p+_-f[2],m+g),A.lineTo(p+f[3],m+g),A.quadraticCurveTo(p,m+g,p,m+g-f[3]),A.lineTo(p,m+f[0]),A.quadraticCurveTo(p,m,p+f[0],m),A.closePath(),A.fill()}},"./src/instantiate.ts":(E,l,t)=>{t.r(l),t.d(l,{instantiate:()=>u});var c=t("./src/FaustUI.ts"),u=()=>{var r=new c.FaustUI({root:document.getElementById("root")}),n;window.addEventListener("message",a=>{var s=a.source;n=s}),window.addEventListener("keydown",a=>{n&&n.postMessage({type:"keydown",key:a.key},"*")}),window.addEventListener("keyup",a=>{n&&n.postMessage({type:"keyup",key:a.key},"*")}),window.faustUI=r}},"./src/layout/AbstractGroup.ts":(E,l,t)=>{t.r(l),t.d(l,{AbstractGroup:()=>u});function c(r,n,a){return n in r?Object.defineProperty(r,n,{value:a,enumerable:!0,configurable:!0,writable:!0}):r[n]=a,r}class u{constructor(n,a){c(this,"isRoot",void 0),c(this,"type",void 0),c(this,"label",void 0),c(this,"items",void 0),c(this,"layout",void 0),this.isRoot=!!a,Object.assign(this,n);var s=this.hasHSizingDesc,o=this.hasVSizingDesc,e=s&&o?"both":s?"horizontal":o?"vertical":"none";this.layout={type:n.type,width:u.padding*2,height:u.padding*2+u.labelHeight,sizing:e}}get hasHSizingDesc(){return!!this.items.find(n=>n instanceof u?n.hasHSizingDesc:n.layout.sizing==="horizontal"||n.layout.sizing==="both")}get hasVSizingDesc(){return!!this.items.find(n=>n instanceof u?n.hasVSizingDesc:n.layout.sizing==="vertical"||n.layout.sizing==="both")}adjust(){return this}expand(n,a){return this}offset(){return this}}c(u,"padding",.2),c(u,"labelHeight",.25),c(u,"spaceBetween",.1)},"./src/layout/AbstractInputItem.ts":(E,l,t)=>{t.r(l),t.d(l,{AbstractInputItem:()=>r});var c=t("./src/layout/AbstractItem.ts");function u(n,a,s){return a in n?Object.defineProperty(n,a,{value:s,enumerable:!0,configurable:!0,writable:!0}):n[a]=s,n}class r extends c.AbstractItem{constructor(a){super(a),u(this,"init",void 0),u(this,"step",void 0),this.init=+a.init||0,this.step=+a.step||1}}},"./src/layout/AbstractItem.ts":(E,l,t)=>{t.r(l),t.d(l,{AbstractItem:()=>u});function c(r,n,a){return n in r?Object.defineProperty(r,n,{value:a,enumerable:!0,configurable:!0,writable:!0}):r[n]=a,r}class u{constructor(n){c(this,"type",void 0),c(this,"label",void 0),c(this,"address",void 0),c(this,"index",void 0),c(this,"init",void 0),c(this,"min",void 0),c(this,"max",void 0),c(this,"meta",void 0),c(this,"layout",void 0),Object.assign(this,n),this.min=isFinite(+this.min)?+this.min:0,this.max=isFinite(+this.max)?+this.max:1}adjust(){return this}expand(n,a){return this}offset(){return this}}},"./src/layout/AbstractOutputItem.ts":(E,l,t)=>{t.r(l),t.d(l,{AbstractOutputItem:()=>u});var c=t("./src/layout/AbstractItem.ts");class u extends c.AbstractItem{}},"./src/layout/Button.ts":(E,l,t)=>{t.r(l),t.d(l,{Button:()=>r});var c=t("./src/layout/AbstractInputItem.ts");function u(n,a,s){return a in n?Object.defineProperty(n,a,{value:s,enumerable:!0,configurable:!0,writable:!0}):n[a]=s,n}class r extends c.AbstractInputItem{constructor(){super(...arguments),u(this,"layout",{type:"button",width:2,height:1,sizing:"horizontal"})}}},"./src/layout/Checkbox.ts":(E,l,t)=>{t.r(l),t.d(l,{Checkbox:()=>r});var c=t("./src/layout/AbstractInputItem.ts");function u(n,a,s){return a in n?Object.defineProperty(n,a,{value:s,enumerable:!0,configurable:!0,writable:!0}):n[a]=s,n}class r extends c.AbstractInputItem{constructor(){super(...arguments),u(this,"layout",{type:"checkbox",width:2,height:1,sizing:"horizontal"})}}},"./src/layout/HBargraph.ts":(E,l,t)=>{t.r(l),t.d(l,{HBargraph:()=>r});var c=t("./src/layout/AbstractOutputItem.ts");function u(n,a,s){return a in n?Object.defineProperty(n,a,{value:s,enumerable:!0,configurable:!0,writable:!0}):n[a]=s,n}class r extends c.AbstractOutputItem{constructor(){super(...arguments),u(this,"layout",{type:"hbargraph",width:5,height:1,sizing:"horizontal"})}}},"./src/layout/HGroup.ts":(E,l,t)=>{t.r(l),t.d(l,{HGroup:()=>u});var c=t("./src/layout/AbstractGroup.ts");class u extends c.AbstractGroup{adjust(){return this.items.forEach(n=>{n.adjust(),this.layout.width+=n.layout.width,this.layout.height=Math.max(this.layout.height,n.layout.height+2*c.AbstractGroup.padding+c.AbstractGroup.labelHeight)}),this.layout.width+=c.AbstractGroup.spaceBetween*(this.items.length-1),this.layout.width<1&&(this.layout.width+=1),this}expand(n){var a=0;return this.items.forEach(s=>{(s.layout.sizing==="both"||s.layout.sizing==="horizontal")&&a++}),this.items.forEach(s=>{var o=0,e=0;(s.layout.sizing==="both"||s.layout.sizing==="horizontal")&&(o=a?n/a:0,s.layout.width+=o),(s.layout.sizing==="both"||s.layout.sizing==="vertical")&&(e=this.layout.height-2*c.AbstractGroup.padding-c.AbstractGroup.labelHeight-s.layout.height,s.layout.height+=e),s.expand(o,e)}),this}offset(){var n=c.AbstractGroup.labelHeight,a=c.AbstractGroup.padding,s=c.AbstractGroup.spaceBetween,o=a,e=a+n,i=this.layout.height;return this.items.forEach(d=>{d.layout.offsetLeft=o,d.layout.offsetTop=e,d.layout.offsetTop+=(i-n-d.layout.height)/2-a,d.layout.left=(this.layout.left||0)+d.layout.offsetLeft,d.layout.top=(this.layout.top||0)+d.layout.offsetTop,d.offset(),o+=d.layout.width+s}),this}}},"./src/layout/HSlider.ts":(E,l,t)=>{t.r(l),t.d(l,{HSlider:()=>r});var c=t("./src/layout/AbstractInputItem.ts");function u(n,a,s){return a in n?Object.defineProperty(n,a,{value:s,enumerable:!0,configurable:!0,writable:!0}):n[a]=s,n}class r extends c.AbstractInputItem{constructor(){super(...arguments),u(this,"layout",{type:"hslider",width:5,height:1,sizing:"horizontal"})}}},"./src/layout/Knob.ts":(E,l,t)=>{t.r(l),t.d(l,{Knob:()=>r});var c=t("./src/layout/AbstractInputItem.ts");function u(n,a,s){return a in n?Object.defineProperty(n,a,{value:s,enumerable:!0,configurable:!0,writable:!0}):n[a]=s,n}class r extends c.AbstractInputItem{constructor(){super(...arguments),u(this,"layout",{type:"knob",width:1,height:1.75,sizing:"none"})}}},"./src/layout/Layout.ts":(E,l,t)=>{t.r(l),t.d(l,{Layout:()=>_});var c=t("./src/layout/HSlider.ts"),u=t("./src/layout/VSlider.ts"),r=t("./src/layout/Nentry.ts"),n=t("./src/layout/Button.ts"),a=t("./src/layout/Checkbox.ts"),s=t("./src/layout/Knob.ts"),o=t("./src/layout/Menu.ts"),e=t("./src/layout/Radio.ts"),i=t("./src/layout/Led.ts"),d=t("./src/layout/Numerical.ts"),v=t("./src/layout/HBargraph.ts"),y=t("./src/layout/VBargraph.ts"),A=t("./src/layout/HGroup.ts"),p=t("./src/layout/VGroup.ts"),m=t("./src/layout/TGroup.ts");class _{static predictType(h){if(h.type==="vgroup"||h.type==="hgroup"||h.type==="tgroup"||h.type==="button"||h.type==="checkbox")return h.type;if(h.type==="hbargraph"||h.type==="vbargraph")return h.meta&&h.meta.find(f=>f.style&&f.style.startsWith("led"))?"led":h.meta&&h.meta.find(f=>f.style&&f.style.startsWith("numerical"))?"numerical":h.type;if(h.type==="hslider"||h.type==="nentry"||h.type==="vslider"){if(h.meta&&h.meta.find(f=>f.style&&f.style.startsWith("knob")))return"knob";if(h.meta&&h.meta.find(f=>f.style&&f.style.startsWith("menu")))return"menu";if(h.meta&&h.meta.find(f=>f.style&&f.style.startsWith("radio")))return"radio"}return h.type}static getItem(h){var f={hslider:c.HSlider,vslider:u.VSlider,nentry:r.Nentry,button:n.Button,checkbox:a.Checkbox,knob:s.Knob,menu:o.Menu,radio:e.Radio,led:i.Led,numerical:d.Numerical,hbargraph:v.HBargraph,vbargraph:y.VBargraph,hgroup:A.HGroup,vgroup:p.VGroup,tgroup:m.TGroup},B=this.predictType(h);return new f[B](h)}static getItems(h){return h.map(f=>("items"in f&&(f.items=this.getItems(f.items)),this.getItem(f)))}static calc(h){var f=new p.VGroup({items:this.getItems(h),type:"vgroup",label:""},!0);return f.adjust(),f.expand(0,0),f.offset(),f}}},"./src/layout/Led.ts":(E,l,t)=>{t.r(l),t.d(l,{Led:()=>r});var c=t("./src/layout/AbstractOutputItem.ts");function u(n,a,s){return a in n?Object.defineProperty(n,a,{value:s,enumerable:!0,configurable:!0,writable:!0}):n[a]=s,n}class r extends c.AbstractOutputItem{constructor(){super(...arguments),u(this,"layout",{type:"led",width:1,height:1,sizing:"none"})}}},"./src/layout/Menu.ts":(E,l,t)=>{t.r(l),t.d(l,{Menu:()=>r});var c=t("./src/layout/AbstractInputItem.ts");function u(n,a,s){return a in n?Object.defineProperty(n,a,{value:s,enumerable:!0,configurable:!0,writable:!0}):n[a]=s,n}class r extends c.AbstractInputItem{constructor(){super(...arguments),u(this,"layout",{type:"menu",width:2,height:1,sizing:"horizontal"})}}},"./src/layout/Nentry.ts":(E,l,t)=>{t.r(l),t.d(l,{Nentry:()=>r});var c=t("./src/layout/AbstractInputItem.ts");function u(n,a,s){return a in n?Object.defineProperty(n,a,{value:s,enumerable:!0,configurable:!0,writable:!0}):n[a]=s,n}class r extends c.AbstractInputItem{constructor(){super(...arguments),u(this,"layout",{type:"nentry",width:1,height:1,sizing:"none"})}}},"./src/layout/Numerical.ts":(E,l,t)=>{t.r(l),t.d(l,{Numerical:()=>r});var c=t("./src/layout/AbstractOutputItem.ts");function u(n,a,s){return a in n?Object.defineProperty(n,a,{value:s,enumerable:!0,configurable:!0,writable:!0}):n[a]=s,n}class r extends c.AbstractOutputItem{constructor(){super(...arguments),u(this,"layout",{type:"numerical",width:1,height:1,sizing:"none"})}}},"./src/layout/Radio.ts":(E,l,t)=>{t.r(l),t.d(l,{Radio:()=>r});var c=t("./src/layout/AbstractInputItem.ts");function u(n,a,s){return a in n?Object.defineProperty(n,a,{value:s,enumerable:!0,configurable:!0,writable:!0}):n[a]=s,n}class r extends c.AbstractInputItem{constructor(){super(...arguments),u(this,"layout",{type:"radio",width:2,height:2,sizing:"both"})}}},"./src/layout/TGroup.ts":(E,l,t)=>{t.r(l),t.d(l,{TGroup:()=>r});var c=t("./src/layout/AbstractGroup.ts");function u(n,a,s){return a in n?Object.defineProperty(n,a,{value:s,enumerable:!0,configurable:!0,writable:!0}):n[a]=s,n}class r extends c.AbstractGroup{adjust(){this.items.forEach(s=>{s.adjust(),this.layout.width=Math.max(this.layout.width,s.layout.width+2*c.AbstractGroup.padding),this.layout.height=Math.max(this.layout.height,s.layout.height+2*c.AbstractGroup.padding+r.labelHeight)});var a=this.items.length;return this.layout.width=Math.max(this.layout.width,a*r.tabLayout.width),this.layout.height+=r.tabLayout.height,this.layout.width<1&&(this.layout.width+=1),this}expand(){var a=this.items.length;return this.items.forEach(s=>{var o=0,e=0;(s.layout.sizing==="both"||s.layout.sizing==="horizontal")&&(e=this.layout.width-2*c.AbstractGroup.padding-s.layout.width),(s.layout.sizing==="both"||s.layout.sizing==="vertical")&&(o=this.layout.height-2*c.AbstractGroup.padding-c.AbstractGroup.labelHeight-(a?r.tabLayout.height:0)-s.layout.height),s.expand(e,o)}),this}offset(){var a=c.AbstractGroup.labelHeight,s=c.AbstractGroup.padding,o=s,e=s+a+r.tabLayout.height;return this.items.forEach(i=>{i.layout.offsetLeft=o,i.layout.offsetTop=e,i.layout.left=(this.layout.left||0)+i.layout.offsetLeft,i.layout.top=(this.layout.top||0)+i.layout.offsetTop,i.offset()}),this}}u(r,"tabLayout",{width:2,height:1})},"./src/layout/VBargraph.ts":(E,l,t)=>{t.r(l),t.d(l,{VBargraph:()=>r});var c=t("./src/layout/AbstractOutputItem.ts");function u(n,a,s){return a in n?Object.defineProperty(n,a,{value:s,enumerable:!0,configurable:!0,writable:!0}):n[a]=s,n}class r extends c.AbstractOutputItem{constructor(){super(...arguments),u(this,"layout",{type:"vbargraph",width:1,height:5,sizing:"vertical"})}}},"./src/layout/VGroup.ts":(E,l,t)=>{t.r(l),t.d(l,{VGroup:()=>u});var c=t("./src/layout/AbstractGroup.ts");class u extends c.AbstractGroup{adjust(){return this.items.forEach(n=>{n.adjust(),this.layout.width=Math.max(this.layout.width,n.layout.width+2*c.AbstractGroup.padding),this.layout.height+=n.layout.height}),this.layout.height+=c.AbstractGroup.spaceBetween*(this.items.length-1),this.layout.width<1&&(this.layout.width+=1),this}expand(n,a){var s=0;return this.items.forEach(o=>{(o.layout.sizing==="both"||o.layout.sizing==="vertical")&&s++}),this.items.forEach(o=>{var e=0,i=0;(o.layout.sizing==="both"||o.layout.sizing==="horizontal")&&(e=this.layout.width-2*c.AbstractGroup.padding-o.layout.width,o.layout.width+=e),(o.layout.sizing==="both"||o.layout.sizing==="vertical")&&(i=s?a/s:0,o.layout.height+=i),o.expand(e,i)}),this}offset(){var n=c.AbstractGroup.labelHeight,a=c.AbstractGroup.padding,s=c.AbstractGroup.spaceBetween,o=a,e=a+n,i=this.layout.width;return this.items.forEach(d=>{d.layout.offsetLeft=o,d.layout.offsetTop=e,d.layout.offsetLeft+=(i-d.layout.width)/2-a,d.layout.left=(this.layout.left||0)+d.layout.offsetLeft,d.layout.top=(this.layout.top||0)+d.layout.offsetTop,d.offset(),e+=d.layout.height+s}),this}}},"./src/layout/VSlider.ts":(E,l,t)=>{t.r(l),t.d(l,{VSlider:()=>r});var c=t("./src/layout/AbstractInputItem.ts");function u(n,a,s){return a in n?Object.defineProperty(n,a,{value:s,enumerable:!0,configurable:!0,writable:!0}):n[a]=s,n}class r extends c.AbstractInputItem{constructor(){super(...arguments),u(this,"layout",{type:"vslider",width:1,height:5,sizing:"vertical"})}}},"./node_modules/css-loader/dist/cjs.js!./node_modules/sass-loader/dist/cjs.js!./src/components/Base.scss":(E,l,t)=>{t.r(l),t.d(l,{default:()=>s});var c=t("./node_modules/css-loader/dist/runtime/cssWithMappingToString.js"),u=t.n(c),r=t("./node_modules/css-loader/dist/runtime/api.js"),n=t.n(r),a=n()(u());a.push([E.id,`.faust-ui-component {
  display: flex;
  position: absolute;
  flex-direction: column;
  overflow: hidden; }
  .faust-ui-component:focus {
    outline: none; }
  .faust-ui-component > .faust-ui-component-label {
    position: relative;
    margin-top: 4px;
    width: 100%;
    user-select: none; }
    .faust-ui-component > .faust-ui-component-label > canvas {
      position: relative;
      display: block;
      max-width: 100%;
      max-height: 100%; }
  .faust-ui-component input {
    box-shadow: none; }
`,"",{version:3,sources:["webpack://./src/components/Base.scss"],names:[],mappings:"AAAA;EACI,aAAa;EACb,kBAAkB;EAClB,sBAAsB;EACtB,gBAAgB,EAAA;EAJpB;IAMQ,aAAa,EAAA;EANrB;IASQ,kBAAkB;IAClB,eAAe;IACf,WAAW;IACX,iBAAiB,EAAA;IAZzB;MAcY,kBAAkB;MAClB,cAAc;MACd,eAAe;MACf,gBAAgB,EAAA;EAjB5B;IAqBQ,gBAAgB,EAAA",sourcesContent:[`.faust-ui-component {
    display: flex;
    position: absolute;
    flex-direction: column;
    overflow: hidden;
    &:focus {
        outline: none;
    }
    & > .faust-ui-component-label {
        position: relative;
        margin-top: 4px;
        width: 100%;
        user-select: none;
        & > canvas {
            position: relative;
            display: block;
            max-width: 100%;
            max-height: 100%;
        }
    }
    & input {
        box-shadow: none;
    }
}`],sourceRoot:""}]);const s=a},"./node_modules/css-loader/dist/cjs.js!./node_modules/sass-loader/dist/cjs.js!./src/components/Button.scss":(E,l,t)=>{t.r(l),t.d(l,{default:()=>s});var c=t("./node_modules/css-loader/dist/runtime/cssWithMappingToString.js"),u=t.n(c),r=t("./node_modules/css-loader/dist/runtime/api.js"),n=t.n(r),a=n()(u());a.push([E.id,`.faust-ui-component.faust-ui-component-button > div {
  display: flex;
  position: relative;
  cursor: pointer;
  border-width: 1px;
  text-align: center;
  border-radius: 4px;
  flex: 1 0 auto;
  border-style: solid; }
  .faust-ui-component.faust-ui-component-button > div > span {
    user-select: none;
    margin: auto; }
`,"",{version:3,sources:["webpack://./src/components/Button.scss"],names:[],mappings:"AAAA;EAEQ,aAAa;EACb,kBAAkB;EAClB,eAAe;EACf,iBAAiB;EACjB,kBAAkB;EAClB,kBAAkB;EAClB,cAAc;EACd,mBAAmB,EAAA;EAT3B;IAWY,iBAAiB;IACjB,YAAY,EAAA",sourcesContent:[`.faust-ui-component.faust-ui-component-button {
    & > div {
        display: flex;
        position: relative;
        cursor: pointer;
        border-width: 1px;
        text-align: center;
        border-radius: 4px;
        flex: 1 0 auto;
        border-style: solid;
        & > span {
            user-select: none;
            margin: auto;
        }
    }
}`],sourceRoot:""}]);const s=a},"./node_modules/css-loader/dist/cjs.js!./node_modules/sass-loader/dist/cjs.js!./src/components/Checkbox.scss":(E,l,t)=>{t.r(l),t.d(l,{default:()=>s});var c=t("./node_modules/css-loader/dist/runtime/cssWithMappingToString.js"),u=t.n(c),r=t("./node_modules/css-loader/dist/runtime/api.js"),n=t.n(r),a=n()(u());a.push([E.id,`.faust-ui-component.faust-ui-component-checkbox > div {
  display: flex;
  position: relative;
  cursor: pointer;
  border-width: 1px;
  text-align: center;
  border-radius: 1px;
  flex: 1 0 auto;
  border-style: solid; }
  .faust-ui-component.faust-ui-component-checkbox > div > span {
    margin: auto;
    user-select: none; }
`,"",{version:3,sources:["webpack://./src/components/Checkbox.scss"],names:[],mappings:"AAAA;EAEQ,aAAa;EACb,kBAAkB;EAClB,eAAe;EACf,iBAAiB;EACjB,kBAAkB;EAClB,kBAAkB;EAClB,cAAc;EACd,mBAAmB,EAAA;EAT3B;IAWY,YAAY;IACZ,iBAAiB,EAAA",sourcesContent:[`.faust-ui-component.faust-ui-component-checkbox {
    & > div {
        display: flex;
        position: relative;
        cursor: pointer;
        border-width: 1px;
        text-align: center;
        border-radius: 1px;
        flex: 1 0 auto;
        border-style: solid;
        & > span {
            margin: auto;
            user-select: none;
        }
    }
}`],sourceRoot:""}]);const s=a},"./node_modules/css-loader/dist/cjs.js!./node_modules/sass-loader/dist/cjs.js!./src/components/Group.scss":(E,l,t)=>{t.r(l),t.d(l,{default:()=>s});var c=t("./node_modules/css-loader/dist/runtime/cssWithMappingToString.js"),u=t.n(c),r=t("./node_modules/css-loader/dist/runtime/api.js"),n=t.n(r),a=n()(u());a.push([E.id,`.faust-ui-group {
  position: absolute;
  display: block;
  background-color: rgba(80, 80, 80, 0.75);
  border-radius: 4px;
  border: 1px rgba(255, 255, 255, 0.25) solid; }
  .faust-ui-group > .faust-ui-group-label {
    position: relative;
    margin: 4px;
    width: calc(100% - 8px);
    user-select: none; }
    .faust-ui-group > .faust-ui-group-label > canvas {
      position: relative;
      display: block;
      max-width: 100%;
      max-height: 100%; }
  .faust-ui-group .faust-ui-tgroup-tabs {
    position: absolute;
    display: inline-block; }
    .faust-ui-group .faust-ui-tgroup-tabs .faust-ui-tgroup-tab {
      position: relative;
      display: inline-block;
      border-radius: 5px;
      cursor: pointer;
      text-overflow: ellipsis;
      white-space: nowrap;
      user-select: none;
      margin: 10px;
      text-align: center;
      background-color: rgba(255, 255, 255, 0.5); }
      .faust-ui-group .faust-ui-tgroup-tabs .faust-ui-tgroup-tab:hover {
        background-color: white; }
      .faust-ui-group .faust-ui-tgroup-tabs .faust-ui-tgroup-tab.active {
        background-color: #282828;
        color: white; }
`,"",{version:3,sources:["webpack://./src/components/Group.scss"],names:[],mappings:"AACA;EACI,kBAAkB;EAClB,cAAc;EACd,wCAAwC;EACxC,kBAAkB;EAClB,2CAA2C,EAAA;EAL/C;IAOQ,kBAAkB;IAClB,WAAW;IACX,uBAAuB;IACvB,iBAAiB,EAAA;IAVzB;MAYY,kBAAkB;MAClB,cAAc;MACd,eAAe;MACf,gBAAgB,EAAA;EAf5B;IAmBQ,kBAAkB;IAClB,qBAAqB,EAAA;IApB7B;MAsBY,kBAAkB;MAClB,qBAAqB;MACrB,kBAAkB;MAClB,eAAe;MACf,uBAAuB;MACvB,mBAAmB;MACnB,iBAAiB;MACjB,YAAY;MACZ,kBAAkB;MAClB,0CAA0C,EAAA;MA/BtD;QAiCgB,uBAAwC,EAAA;MAjCxD;QAoCgB,yBAAqC;QACrC,YAAY,EAAA",sourcesContent:[`
.faust-ui-group {
    position: absolute;
    display: block;
    background-color: rgba(80, 80, 80, 0.75);
    border-radius: 4px;
    border: 1px rgba(255, 255, 255, 0.25) solid;
    & > .faust-ui-group-label {
        position: relative;
        margin: 4px;
        width: calc(100% - 8px);
        user-select: none;
        & > canvas {
            position: relative;
            display: block;
            max-width: 100%;
            max-height: 100%;
        }
    }
    & .faust-ui-tgroup-tabs {
        position: absolute;
        display: inline-block;
        & .faust-ui-tgroup-tab {
            position: relative;
            display: inline-block;
            border-radius: 5px;
            cursor: pointer;
            text-overflow: ellipsis;
            white-space: nowrap;
            user-select: none;
            margin: 10px;
            text-align: center;
            background-color: rgba(255, 255, 255, 0.5);
            &:hover {
                background-color: rgba(255, 255, 255, 1);
            }
            &.active {
                background-color: rgba(40, 40, 40, 1);
                color: white;
            }
        }
    }
}`],sourceRoot:""}]);const s=a},"./node_modules/css-loader/dist/cjs.js!./node_modules/sass-loader/dist/cjs.js!./src/components/HBargraph.scss":(E,l,t)=>{t.r(l),t.d(l,{default:()=>s});var c=t("./node_modules/css-loader/dist/runtime/cssWithMappingToString.js"),u=t.n(c),r=t("./node_modules/css-loader/dist/runtime/api.js"),n=t.n(r),a=n()(u());a.push([E.id,`.faust-ui-component.faust-ui-component-hbargraph > .faust-ui-component-label {
  flex: 0 0 auto; }

.faust-ui-component.faust-ui-component-hbargraph > .faust-ui-component-hbargraph-flexdiv {
  position: relative;
  display: flex;
  flex-direction: row-reverse;
  flex: 1 1 auto;
  width: 100%;
  height: auto; }
  .faust-ui-component.faust-ui-component-hbargraph > .faust-ui-component-hbargraph-flexdiv > .faust-ui-component-hbargraph-canvasdiv {
    position: relative;
    display: block;
    flex: 1 1 auto;
    height: 100%;
    margin: auto; }
    .faust-ui-component.faust-ui-component-hbargraph > .faust-ui-component-hbargraph-flexdiv > .faust-ui-component-hbargraph-canvasdiv > canvas {
      position: absolute;
      display: block;
      height: 100%;
      width: 100%; }
  .faust-ui-component.faust-ui-component-hbargraph > .faust-ui-component-hbargraph-flexdiv > input {
    position: relative;
    display: block;
    flex: 0 1 auto;
    text-align: center;
    background-color: rgba(255, 255, 255, 0.25);
    margin: auto 5px auto auto;
    border-width: 0px;
    border-radius: 4px;
    width: calc(20% - 13px);
    padding: 2px 4px; }
`,"",{version:3,sources:["webpack://./src/components/HBargraph.scss"],names:[],mappings:"AAAA;EAEQ,cAAc,EAAA;;AAFtB;EAKQ,kBAAkB;EAClB,aAAa;EACb,2BAA2B;EAC3B,cAAc;EACd,WAAW;EACX,YAAY,EAAA;EAVpB;IAYY,kBAAkB;IAClB,cAAc;IACd,cAAc;IACd,YAAY;IACZ,YAAY,EAAA;IAhBxB;MAkBgB,kBAAkB;MAClB,cAAc;MACd,YAAY;MACZ,WAAW,EAAA;EArB3B;IAyBY,kBAAkB;IAClB,cAAc;IACd,cAAc;IACd,kBAAkB;IAClB,2CAA2C;IAC3C,0BAA0B;IAC1B,iBAAiB;IACjB,kBAAkB;IAClB,uBAAuB;IACvB,gBAAgB,EAAA",sourcesContent:[`.faust-ui-component.faust-ui-component-hbargraph {
    & > .faust-ui-component-label {
        flex: 0 0 auto;
    }
    & > .faust-ui-component-hbargraph-flexdiv {
        position: relative;
        display: flex;
        flex-direction: row-reverse;
        flex: 1 1 auto;
        width: 100%;
        height: auto;
        & > .faust-ui-component-hbargraph-canvasdiv {
            position: relative;
            display: block;
            flex: 1 1 auto;
            height: 100%;
            margin: auto;
            & > canvas {
                position: absolute;
                display: block;
                height: 100%;
                width: 100%;
            }
        }
        & > input {
            position: relative;
            display: block;
            flex: 0 1 auto;
            text-align: center;
            background-color: rgba(255, 255, 255, 0.25);
            margin: auto 5px auto auto;
            border-width: 0px;
            border-radius: 4px;
            width: calc(20% - 13px);
            padding: 2px 4px;
        }
    }
}`],sourceRoot:""}]);const s=a},"./node_modules/css-loader/dist/cjs.js!./node_modules/sass-loader/dist/cjs.js!./src/components/HSlider.scss":(E,l,t)=>{t.r(l),t.d(l,{default:()=>s});var c=t("./node_modules/css-loader/dist/runtime/cssWithMappingToString.js"),u=t.n(c),r=t("./node_modules/css-loader/dist/runtime/api.js"),n=t.n(r),a=n()(u());a.push([E.id,`.faust-ui-component.faust-ui-component-hslider > .faust-ui-component-label {
  flex: 0 0 auto; }

.faust-ui-component.faust-ui-component-hslider > .faust-ui-component-hslider-flexdiv {
  position: relative;
  display: flex;
  flex-direction: row-reverse;
  flex: 1 1 auto;
  width: 100%;
  height: auto; }
  .faust-ui-component.faust-ui-component-hslider > .faust-ui-component-hslider-flexdiv > .faust-ui-component-hslider-canvasdiv {
    position: relative;
    display: block;
    flex: 1 1 auto;
    height: 100%;
    margin: auto; }
    .faust-ui-component.faust-ui-component-hslider > .faust-ui-component-hslider-flexdiv > .faust-ui-component-hslider-canvasdiv > canvas {
      position: absolute;
      display: block;
      height: 100%;
      width: 100%; }
  .faust-ui-component.faust-ui-component-hslider > .faust-ui-component-hslider-flexdiv > input {
    position: relative;
    display: block;
    flex: 0 1 auto;
    text-align: center;
    background-color: rgba(255, 255, 255, 0.25);
    margin: auto 5px auto auto;
    border-width: 0px;
    border-radius: 4px;
    width: calc(20% - 13px);
    padding: 2px 4px;
    -moz-appearance: textfield; }
    .faust-ui-component.faust-ui-component-hslider > .faust-ui-component-hslider-flexdiv > input::-webkit-inner-spin-button, .faust-ui-component.faust-ui-component-hslider > .faust-ui-component-hslider-flexdiv > input::-webkit-outer-spin-button {
      -webkit-appearance: none;
      margin: 0; }
`,"",{version:3,sources:["webpack://./src/components/HSlider.scss"],names:[],mappings:"AAAA;EAEQ,cAAc,EAAA;;AAFtB;EAKQ,kBAAkB;EAClB,aAAa;EACb,2BAA2B;EAC3B,cAAc;EACd,WAAW;EACX,YAAY,EAAA;EAVpB;IAYY,kBAAkB;IAClB,cAAc;IACd,cAAc;IACd,YAAY;IACZ,YAAY,EAAA;IAhBxB;MAkBgB,kBAAkB;MAClB,cAAc;MACd,YAAY;MACZ,WAAW,EAAA;EArB3B;IAyBY,kBAAkB;IAClB,cAAc;IACd,cAAc;IACd,kBAAkB;IAClB,2CAA2C;IAC3C,0BAA0B;IAC1B,iBAAiB;IACjB,kBAAkB;IAClB,uBAAuB;IACvB,gBAAgB;IAChB,0BAAyB,EAAA;IAnCrC;MAsCgB,wBAAwB;MACxB,SAAS,EAAA",sourcesContent:[`.faust-ui-component.faust-ui-component-hslider {
    & > .faust-ui-component-label {
        flex: 0 0 auto;
    }
    & > .faust-ui-component-hslider-flexdiv {
        position: relative;
        display: flex;
        flex-direction: row-reverse;
        flex: 1 1 auto;
        width: 100%;
        height: auto;
        & > .faust-ui-component-hslider-canvasdiv {
            position: relative;
            display: block;
            flex: 1 1 auto;
            height: 100%;
            margin: auto;
            & > canvas {
                position: absolute;
                display: block;
                height: 100%;
                width: 100%;
            }
        }
        & > input {
            position: relative;
            display: block;
            flex: 0 1 auto;
            text-align: center;
            background-color: rgba(255, 255, 255, 0.25);
            margin: auto 5px auto auto;
            border-width: 0px;
            border-radius: 4px;
            width: calc(20% - 13px);
            padding: 2px 4px;
            -moz-appearance:textfield;
            &::-webkit-inner-spin-button, 
            &::-webkit-outer-spin-button {
                -webkit-appearance: none;
                margin: 0;
            }
        }
    }
}
`],sourceRoot:""}]);const s=a},"./node_modules/css-loader/dist/cjs.js!./node_modules/sass-loader/dist/cjs.js!./src/components/Knob.scss":(E,l,t)=>{t.r(l),t.d(l,{default:()=>s});var c=t("./node_modules/css-loader/dist/runtime/cssWithMappingToString.js"),u=t.n(c),r=t("./node_modules/css-loader/dist/runtime/api.js"),n=t.n(r),a=n()(u());a.push([E.id,`.faust-ui-component.faust-ui-component-knob {
  align-items: center; }
  .faust-ui-component.faust-ui-component-knob > canvas {
    position: relative;
    display: block;
    flex: 1 1 auto;
    min-height: 50%;
    width: 100%; }
  .faust-ui-component.faust-ui-component-knob > input {
    position: relative;
    display: block;
    flex: 0 1 auto;
    text-align: center;
    background-color: rgba(255, 255, 255, 0.25);
    margin: 0px;
    border-width: 0px;
    border-radius: 4px;
    max-width: calc(100% - 8px);
    padding: 2px 4px;
    -moz-appearance: textfield; }
    .faust-ui-component.faust-ui-component-knob > input::-webkit-inner-spin-button, .faust-ui-component.faust-ui-component-knob > input::-webkit-outer-spin-button {
      -webkit-appearance: none;
      margin: 0; }
`,"",{version:3,sources:["webpack://./src/components/Knob.scss"],names:[],mappings:"AAAA;EACI,mBAAmB,EAAA;EADvB;IAGQ,kBAAkB;IAClB,cAAc;IACd,cAAc;IACd,eAAe;IACf,WAAW,EAAA;EAPnB;IAUQ,kBAAkB;IAClB,cAAc;IACd,cAAc;IACd,kBAAkB;IAClB,2CAA2C;IAC3C,WAAW;IACX,iBAAiB;IACjB,kBAAkB;IAClB,2BAA2B;IAC3B,gBAAgB;IAChB,0BAAyB,EAAA;IApBjC;MAuBY,wBAAwB;MACxB,SAAS,EAAA",sourcesContent:[`.faust-ui-component.faust-ui-component-knob {
    align-items: center;
    & > canvas {
        position: relative;
        display: block;
        flex: 1 1 auto;
        min-height: 50%;
        width: 100%;
    }
    & > input {
        position: relative;
        display: block;
        flex: 0 1 auto;
        text-align: center;
        background-color: rgba(255, 255, 255, 0.25);
        margin: 0px;
        border-width: 0px;
        border-radius: 4px;
        max-width: calc(100% - 8px);
        padding: 2px 4px;
        -moz-appearance:textfield;
        &::-webkit-inner-spin-button, 
        &::-webkit-outer-spin-button {
            -webkit-appearance: none;
            margin: 0;
        }
    }
}`],sourceRoot:""}]);const s=a},"./node_modules/css-loader/dist/cjs.js!./node_modules/sass-loader/dist/cjs.js!./src/components/Led.scss":(E,l,t)=>{t.r(l),t.d(l,{default:()=>s});var c=t("./node_modules/css-loader/dist/runtime/cssWithMappingToString.js"),u=t.n(c),r=t("./node_modules/css-loader/dist/runtime/api.js"),n=t.n(r),a=n()(u());a.push([E.id,`.faust-ui-component.faust-ui-component-led {
  align-items: center; }
  .faust-ui-component.faust-ui-component-led > .faust-ui-component-label {
    flex: 0 0 auto; }
  .faust-ui-component.faust-ui-component-led > .faust-ui-component-led-canvasdiv {
    position: relative;
    display: block;
    flex: 1 1 auto;
    width: 100%; }
    .faust-ui-component.faust-ui-component-led > .faust-ui-component-led-canvasdiv > canvas {
      position: absolute;
      display: block;
      height: 100%;
      width: 100%; }
`,"",{version:3,sources:["webpack://./src/components/Led.scss"],names:[],mappings:"AAAA;EACI,mBAAmB,EAAA;EADvB;IAGQ,cAAc,EAAA;EAHtB;IAMQ,kBAAkB;IAClB,cAAc;IACd,cAAc;IACd,WAAW,EAAA;IATnB;MAWY,kBAAkB;MAClB,cAAc;MACd,YAAY;MACZ,WAAW,EAAA",sourcesContent:[`.faust-ui-component.faust-ui-component-led {
    align-items: center;
    & > .faust-ui-component-label {
        flex: 0 0 auto;
    }
    & > .faust-ui-component-led-canvasdiv {
        position: relative;
        display: block;
        flex: 1 1 auto;
        width: 100%;
        & > canvas {
            position: absolute;
            display: block;
            height: 100%;
            width: 100%;
        }
    }
}
`],sourceRoot:""}]);const s=a},"./node_modules/css-loader/dist/cjs.js!./node_modules/sass-loader/dist/cjs.js!./src/components/Menu.scss":(E,l,t)=>{t.r(l),t.d(l,{default:()=>s});var c=t("./node_modules/css-loader/dist/runtime/cssWithMappingToString.js"),u=t.n(c),r=t("./node_modules/css-loader/dist/runtime/api.js"),n=t.n(r),a=n()(u());a.push([E.id,`.faust-ui-component.faust-ui-component-menu {
  align-items: center; }
  .faust-ui-component.faust-ui-component-menu > select {
    margin: 0px;
    text-align: center;
    border-width: 1px;
    border-radius: 4px;
    padding: 2px 4px;
    width: calc(100% - 8px); }
`,"",{version:3,sources:["webpack://./src/components/Menu.scss"],names:[],mappings:"AAAA;EACI,mBAAmB,EAAA;EADvB;IAGQ,WAAW;IACX,kBAAkB;IAClB,iBAAiB;IACjB,kBAAkB;IAClB,gBAAgB;IAChB,uBAAuB,EAAA",sourcesContent:[`.faust-ui-component.faust-ui-component-menu {
    align-items: center;
    & > select {
        margin: 0px;
        text-align: center;
        border-width: 1px;
        border-radius: 4px;
        padding: 2px 4px;
        width: calc(100% - 8px);
    }
}`],sourceRoot:""}]);const s=a},"./node_modules/css-loader/dist/cjs.js!./node_modules/sass-loader/dist/cjs.js!./src/components/Nentry.scss":(E,l,t)=>{t.r(l),t.d(l,{default:()=>s});var c=t("./node_modules/css-loader/dist/runtime/cssWithMappingToString.js"),u=t.n(c),r=t("./node_modules/css-loader/dist/runtime/api.js"),n=t.n(r),a=n()(u());a.push([E.id,`.faust-ui-component.faust-ui-component-nentry {
  align-items: center; }
  .faust-ui-component.faust-ui-component-nentry input {
    margin: 0px;
    text-align: center;
    border-width: 1px;
    border-radius: 4px;
    padding: 2px 4px;
    width: calc(100% - 8px); }
    .faust-ui-component.faust-ui-component-nentry input::-webkit-inner-spin-button, .faust-ui-component.faust-ui-component-nentry input::-webkit-outer-spin-button {
      opacity: 1; }
`,"",{version:3,sources:["webpack://./src/components/Nentry.scss"],names:[],mappings:"AAAA;EACI,mBAAmB,EAAA;EADvB;IAGQ,WAAW;IACX,kBAAkB;IAClB,iBAAiB;IACjB,kBAAkB;IAClB,gBAAgB;IAChB,uBAAuB,EAAA;IAR/B;MAWY,UAAU,EAAA",sourcesContent:[`.faust-ui-component.faust-ui-component-nentry {
    align-items: center;
    & input {
        margin: 0px;
        text-align: center;
        border-width: 1px;
        border-radius: 4px;
        padding: 2px 4px;
        width: calc(100% - 8px);
        &::-webkit-inner-spin-button, 
        &::-webkit-outer-spin-button {
            opacity: 1;
        }
    }
}`],sourceRoot:""}]);const s=a},"./node_modules/css-loader/dist/cjs.js!./node_modules/sass-loader/dist/cjs.js!./src/components/Numerical.scss":(E,l,t)=>{t.r(l),t.d(l,{default:()=>s});var c=t("./node_modules/css-loader/dist/runtime/cssWithMappingToString.js"),u=t.n(c),r=t("./node_modules/css-loader/dist/runtime/api.js"),n=t.n(r),a=n()(u());a.push([E.id,`.faust-ui-component.faust-ui-component-numerical {
  align-items: center; }
  .faust-ui-component.faust-ui-component-numerical > input {
    position: relative;
    display: block;
    flex: 0 1 auto;
    text-align: center;
    background-color: rgba(255, 255, 255, 0.25);
    margin: auto;
    border-width: 0px;
    border-radius: 4px;
    width: calc(100% - 8px);
    padding: 2px 4px; }
`,"",{version:3,sources:["webpack://./src/components/Numerical.scss"],names:[],mappings:"AAAA;EACI,mBAAmB,EAAA;EADvB;IAGQ,kBAAkB;IAClB,cAAc;IACd,cAAc;IACd,kBAAkB;IAClB,2CAA2C;IAC3C,YAAY;IACZ,iBAAiB;IACjB,kBAAkB;IAClB,uBAAuB;IACvB,gBAAgB,EAAA",sourcesContent:[`.faust-ui-component.faust-ui-component-numerical {
    align-items: center;
    & > input {
        position: relative;
        display: block;
        flex: 0 1 auto;
        text-align: center;
        background-color: rgba(255, 255, 255, 0.25);
        margin: auto;
        border-width: 0px;
        border-radius: 4px;
        width: calc(100% - 8px);
        padding: 2px 4px;
    }
}`],sourceRoot:""}]);const s=a},"./node_modules/css-loader/dist/cjs.js!./node_modules/sass-loader/dist/cjs.js!./src/components/Radio.scss":(E,l,t)=>{t.r(l),t.d(l,{default:()=>s});var c=t("./node_modules/css-loader/dist/runtime/cssWithMappingToString.js"),u=t.n(c),r=t("./node_modules/css-loader/dist/runtime/api.js"),n=t.n(r),a=n()(u());a.push([E.id,`.faust-ui-component.faust-ui-component-radio {
  align-items: center; }
  .faust-ui-component.faust-ui-component-radio > .faust-ui-component-label {
    flex: 0 0 auto;
    margin-top: auto; }
  .faust-ui-component.faust-ui-component-radio > .faust-ui-component-radio-group {
    flex: 0 0 auto;
    margin-bottom: auto;
    border-width: 1px;
    border-radius: 4px;
    padding: 2px 4px;
    width: calc(100% - 8px); }
    .faust-ui-component.faust-ui-component-radio > .faust-ui-component-radio-group > div {
      text-overflow: ellipsis;
      white-space: nowrap;
      overflow: hidden; }
`,"",{version:3,sources:["webpack://./src/components/Radio.scss"],names:[],mappings:"AAAA;EACI,mBAAmB,EAAA;EADvB;IAGQ,cAAc;IACd,gBAAgB,EAAA;EAJxB;IAOQ,cAAc;IACd,mBAAmB;IACnB,iBAAiB;IACjB,kBAAkB;IAClB,gBAAgB;IAChB,uBAAuB,EAAA;IAZ/B;MAcY,uBAAuB;MACvB,mBAAmB;MACnB,gBAAgB,EAAA",sourcesContent:[`.faust-ui-component.faust-ui-component-radio {
    align-items: center;
    & > .faust-ui-component-label {
        flex: 0 0 auto;
        margin-top: auto;
    }
    & > .faust-ui-component-radio-group {
        flex: 0 0 auto;
        margin-bottom: auto;
        border-width: 1px;
        border-radius: 4px;
        padding: 2px 4px;
        width: calc(100% - 8px);
        & > div {
            text-overflow: ellipsis;
            white-space: nowrap;
            overflow: hidden;
        }
    }
}`],sourceRoot:""}]);const s=a},"./node_modules/css-loader/dist/cjs.js!./node_modules/sass-loader/dist/cjs.js!./src/components/VBargraph.scss":(E,l,t)=>{t.r(l),t.d(l,{default:()=>s});var c=t("./node_modules/css-loader/dist/runtime/cssWithMappingToString.js"),u=t.n(c),r=t("./node_modules/css-loader/dist/runtime/api.js"),n=t.n(r),a=n()(u());a.push([E.id,`.faust-ui-component.faust-ui-component-vbargraph {
  align-items: center; }
  .faust-ui-component.faust-ui-component-vbargraph > .faust-ui-component-label {
    flex: 0 0 auto; }
  .faust-ui-component.faust-ui-component-vbargraph > .faust-ui-component-vbargraph-flexdiv {
    position: relative;
    display: flex;
    flex-direction: column;
    flex: 1 1 auto;
    width: 100%;
    height: inherit; }
    .faust-ui-component.faust-ui-component-vbargraph > .faust-ui-component-vbargraph-flexdiv > .faust-ui-component-vbargraph-canvasdiv {
      position: relative;
      display: block;
      flex: 1 1 auto;
      width: 100%; }
      .faust-ui-component.faust-ui-component-vbargraph > .faust-ui-component-vbargraph-flexdiv > .faust-ui-component-vbargraph-canvasdiv > canvas {
        position: absolute;
        display: block;
        height: 100%;
        width: 100%; }
    .faust-ui-component.faust-ui-component-vbargraph > .faust-ui-component-vbargraph-flexdiv > input {
      position: relative;
      display: block;
      flex: 0 1 auto;
      text-align: center;
      background-color: rgba(255, 255, 255, 0.25);
      margin: 5px auto auto auto;
      border-width: 0px;
      border-radius: 4px;
      height: 5%;
      width: calc(100% - 8px);
      padding: 2px 4px; }
`,"",{version:3,sources:["webpack://./src/components/VBargraph.scss"],names:[],mappings:"AAAA;EACI,mBAAmB,EAAA;EADvB;IAGQ,cAAc,EAAA;EAHtB;IAMQ,kBAAkB;IAClB,aAAa;IACb,sBAAsB;IACtB,cAAc;IACd,WAAW;IACX,eAAe,EAAA;IAXvB;MAaY,kBAAkB;MAClB,cAAc;MACd,cAAc;MACd,WAAW,EAAA;MAhBvB;QAkBgB,kBAAkB;QAClB,cAAc;QACd,YAAY;QACZ,WAAW,EAAA;IArB3B;MAyBY,kBAAkB;MAClB,cAAc;MACd,cAAc;MACd,kBAAkB;MAClB,2CAA2C;MAC3C,0BAA0B;MAC1B,iBAAiB;MACjB,kBAAkB;MAClB,UAAU;MACV,uBAAuB;MACvB,gBAAgB,EAAA",sourcesContent:[`.faust-ui-component.faust-ui-component-vbargraph {
    align-items: center;
    & > .faust-ui-component-label {
        flex: 0 0 auto;
    }
    & > .faust-ui-component-vbargraph-flexdiv {
        position: relative;
        display: flex;
        flex-direction: column;
        flex: 1 1 auto;
        width: 100%;
        height: inherit;
        & > .faust-ui-component-vbargraph-canvasdiv {
            position: relative;
            display: block;
            flex: 1 1 auto;
            width: 100%;
            & > canvas {
                position: absolute;
                display: block;
                height: 100%;
                width: 100%;
            }
        }
        & > input {
            position: relative;
            display: block;
            flex: 0 1 auto;
            text-align: center;
            background-color: rgba(255, 255, 255, 0.25);
            margin: 5px auto auto auto;
            border-width: 0px;
            border-radius: 4px;
            height: 5%;
            width: calc(100% - 8px);
            padding: 2px 4px;
        }
    }
}
`],sourceRoot:""}]);const s=a},"./node_modules/css-loader/dist/cjs.js!./node_modules/sass-loader/dist/cjs.js!./src/components/VSlider.scss":(E,l,t)=>{t.r(l),t.d(l,{default:()=>s});var c=t("./node_modules/css-loader/dist/runtime/cssWithMappingToString.js"),u=t.n(c),r=t("./node_modules/css-loader/dist/runtime/api.js"),n=t.n(r),a=n()(u());a.push([E.id,`.faust-ui-component.faust-ui-component-vslider {
  align-items: center; }
  .faust-ui-component.faust-ui-component-vslider > .faust-ui-component-label {
    flex: 0 0 auto; }
  .faust-ui-component.faust-ui-component-vslider > .faust-ui-component-vslider-flexdiv {
    position: relative;
    display: flex;
    flex-direction: column;
    flex: 1 1 auto;
    width: 100%;
    height: auto; }
    .faust-ui-component.faust-ui-component-vslider > .faust-ui-component-vslider-flexdiv > .faust-ui-component-vslider-canvasdiv {
      position: relative;
      display: block;
      flex: 1 1 auto;
      width: 100%; }
      .faust-ui-component.faust-ui-component-vslider > .faust-ui-component-vslider-flexdiv > .faust-ui-component-vslider-canvasdiv > canvas {
        position: absolute;
        display: block;
        height: 100%;
        width: 100%; }
    .faust-ui-component.faust-ui-component-vslider > .faust-ui-component-vslider-flexdiv input {
      position: relative;
      display: block;
      flex: 0 1 auto;
      text-align: center;
      background-color: rgba(255, 255, 255, 0.25);
      margin: 5px auto auto auto;
      border-width: 0px;
      border-radius: 4px;
      height: 5%;
      max-width: calc(100% - 8px);
      padding: 2px 4px;
      -moz-appearance: textfield; }
      .faust-ui-component.faust-ui-component-vslider > .faust-ui-component-vslider-flexdiv input::-webkit-inner-spin-button, .faust-ui-component.faust-ui-component-vslider > .faust-ui-component-vslider-flexdiv input::-webkit-outer-spin-button {
        -webkit-appearance: none;
        margin: 0; }
`,"",{version:3,sources:["webpack://./src/components/VSlider.scss"],names:[],mappings:"AAAA;EACI,mBAAmB,EAAA;EADvB;IAGQ,cAAc,EAAA;EAHtB;IAMQ,kBAAkB;IAClB,aAAa;IACb,sBAAsB;IACtB,cAAc;IACd,WAAW;IACX,YAAY,EAAA;IAXpB;MAaY,kBAAkB;MAClB,cAAc;MACd,cAAc;MACd,WAAW,EAAA;MAhBvB;QAkBgB,kBAAkB;QAClB,cAAc;QACd,YAAY;QACZ,WAAW,EAAA;IArB3B;MAyBY,kBAAkB;MAClB,cAAc;MACd,cAAc;MACd,kBAAkB;MAClB,2CAA2C;MAC3C,0BAA0B;MAC1B,iBAAiB;MACjB,kBAAkB;MAClB,UAAU;MACV,2BAA2B;MAC3B,gBAAgB;MAChB,0BAAyB,EAAA;MApCrC;QAuCgB,wBAAwB;QACxB,SAAS,EAAA",sourcesContent:[`.faust-ui-component.faust-ui-component-vslider {
    align-items: center;
    & > .faust-ui-component-label {
        flex: 0 0 auto;
    }
    & > .faust-ui-component-vslider-flexdiv {
        position: relative;
        display: flex;
        flex-direction: column;
        flex: 1 1 auto;
        width: 100%;
        height: auto;
        & > .faust-ui-component-vslider-canvasdiv {
            position: relative;
            display: block;
            flex: 1 1 auto;
            width: 100%;
            & > canvas {
                position: absolute;
                display: block;
                height: 100%;
                width: 100%;
            }
        }
        & input {
            position: relative;
            display: block;
            flex: 0 1 auto;
            text-align: center;
            background-color: rgba(255, 255, 255, 0.25);
            margin: 5px auto auto auto;
            border-width: 0px;
            border-radius: 4px;
            height: 5%;
            max-width: calc(100% - 8px);
            padding: 2px 4px;
            -moz-appearance:textfield;
            &::-webkit-inner-spin-button, 
            &::-webkit-outer-spin-button {
                -webkit-appearance: none;
                margin: 0;
            }
        }
    }
}`],sourceRoot:""}]);const s=a},"./node_modules/css-loader/dist/cjs.js!./node_modules/sass-loader/dist/cjs.js!./src/index.scss":(E,l,t)=>{t.r(l),t.d(l,{default:()=>s});var c=t("./node_modules/css-loader/dist/runtime/cssWithMappingToString.js"),u=t.n(c),r=t("./node_modules/css-loader/dist/runtime/api.js"),n=t.n(r),a=n()(u());a.push([E.id,`.faust-ui-root {
  margin: 0px auto;
  flex: 1 0 auto;
  position: relative !important;
  background-color: transparent !important;
  border: none !important;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"; }
`,"",{version:3,sources:["webpack://./src/index.scss"],names:[],mappings:"AAAA;EACI,gBAAgB;EAChB,cAAc;EACd,6BAA6B;EAC7B,wCAAwC;EACxC,uBAAuB;EACvB,kMAAkM,EAAA",sourcesContent:[`.faust-ui-root {
    margin: 0px auto;
    flex: 1 0 auto;
    position: relative !important;
    background-color: transparent !important;
    border: none !important;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
}`],sourceRoot:""}]);const s=a},"./node_modules/css-loader/dist/runtime/api.js":E=>{E.exports=function(l){var t=[];return t.toString=function(){return this.map(function(u){var r=l(u);return u[2]?"@media ".concat(u[2]," {").concat(r,"}"):r}).join("")},t.i=function(c,u,r){typeof c=="string"&&(c=[[null,c,""]]);var n={};if(r)for(var a=0;a<this.length;a++){var s=this[a][0];s!=null&&(n[s]=!0)}for(var o=0;o<c.length;o++){var e=[].concat(c[o]);r&&n[e[0]]||(u&&(e[2]?e[2]="".concat(u," and ").concat(e[2]):e[2]=u),t.push(e))}},t}},"./node_modules/css-loader/dist/runtime/cssWithMappingToString.js":E=>{function l(a,s){return n(a)||r(a,s)||c(a,s)||t()}function t(){throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`)}function c(a,s){if(!!a){if(typeof a=="string")return u(a,s);var o=Object.prototype.toString.call(a).slice(8,-1);if(o==="Object"&&a.constructor&&(o=a.constructor.name),o==="Map"||o==="Set")return Array.from(a);if(o==="Arguments"||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(o))return u(a,s)}}function u(a,s){(s==null||s>a.length)&&(s=a.length);for(var o=0,e=new Array(s);o<s;o++)e[o]=a[o];return e}function r(a,s){var o=a&&(typeof Symbol!="undefined"&&a[Symbol.iterator]||a["@@iterator"]);if(o!=null){var e=[],i=!0,d=!1,v,y;try{for(o=o.call(a);!(i=(v=o.next()).done)&&(e.push(v.value),!(s&&e.length===s));i=!0);}catch(A){d=!0,y=A}finally{try{!i&&o.return!=null&&o.return()}finally{if(d)throw y}}return e}}function n(a){if(Array.isArray(a))return a}E.exports=function(s){var o=l(s,4),e=o[1],i=o[3];if(typeof btoa=="function"){var d=btoa(unescape(encodeURIComponent(JSON.stringify(i)))),v="sourceMappingURL=data:application/json;charset=utf-8;base64,".concat(d),y="/*# ".concat(v," */"),A=i.sources.map(function(p){return"/*# sourceURL=".concat(i.sourceRoot||"").concat(p," */")});return[e].concat(A).concat([y]).join(`
`)}return[e].join(`
`)}},"./src/components/Base.scss":(E,l,t)=>{t.r(l),t.d(l,{default:()=>a});var c=t("./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js"),u=t.n(c),r=t("./node_modules/css-loader/dist/cjs.js!./node_modules/sass-loader/dist/cjs.js!./src/components/Base.scss"),n={};n.insert="head",n.singleton=!1,u()(r.default,n);const a=r.default.locals||{}},"./src/components/Button.scss":(E,l,t)=>{t.r(l),t.d(l,{default:()=>a});var c=t("./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js"),u=t.n(c),r=t("./node_modules/css-loader/dist/cjs.js!./node_modules/sass-loader/dist/cjs.js!./src/components/Button.scss"),n={};n.insert="head",n.singleton=!1,u()(r.default,n);const a=r.default.locals||{}},"./src/components/Checkbox.scss":(E,l,t)=>{t.r(l),t.d(l,{default:()=>a});var c=t("./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js"),u=t.n(c),r=t("./node_modules/css-loader/dist/cjs.js!./node_modules/sass-loader/dist/cjs.js!./src/components/Checkbox.scss"),n={};n.insert="head",n.singleton=!1,u()(r.default,n);const a=r.default.locals||{}},"./src/components/Group.scss":(E,l,t)=>{t.r(l),t.d(l,{default:()=>a});var c=t("./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js"),u=t.n(c),r=t("./node_modules/css-loader/dist/cjs.js!./node_modules/sass-loader/dist/cjs.js!./src/components/Group.scss"),n={};n.insert="head",n.singleton=!1,u()(r.default,n);const a=r.default.locals||{}},"./src/components/HBargraph.scss":(E,l,t)=>{t.r(l),t.d(l,{default:()=>a});var c=t("./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js"),u=t.n(c),r=t("./node_modules/css-loader/dist/cjs.js!./node_modules/sass-loader/dist/cjs.js!./src/components/HBargraph.scss"),n={};n.insert="head",n.singleton=!1,u()(r.default,n);const a=r.default.locals||{}},"./src/components/HSlider.scss":(E,l,t)=>{t.r(l),t.d(l,{default:()=>a});var c=t("./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js"),u=t.n(c),r=t("./node_modules/css-loader/dist/cjs.js!./node_modules/sass-loader/dist/cjs.js!./src/components/HSlider.scss"),n={};n.insert="head",n.singleton=!1,u()(r.default,n);const a=r.default.locals||{}},"./src/components/Knob.scss":(E,l,t)=>{t.r(l),t.d(l,{default:()=>a});var c=t("./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js"),u=t.n(c),r=t("./node_modules/css-loader/dist/cjs.js!./node_modules/sass-loader/dist/cjs.js!./src/components/Knob.scss"),n={};n.insert="head",n.singleton=!1,u()(r.default,n);const a=r.default.locals||{}},"./src/components/Led.scss":(E,l,t)=>{t.r(l),t.d(l,{default:()=>a});var c=t("./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js"),u=t.n(c),r=t("./node_modules/css-loader/dist/cjs.js!./node_modules/sass-loader/dist/cjs.js!./src/components/Led.scss"),n={};n.insert="head",n.singleton=!1,u()(r.default,n);const a=r.default.locals||{}},"./src/components/Menu.scss":(E,l,t)=>{t.r(l),t.d(l,{default:()=>a});var c=t("./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js"),u=t.n(c),r=t("./node_modules/css-loader/dist/cjs.js!./node_modules/sass-loader/dist/cjs.js!./src/components/Menu.scss"),n={};n.insert="head",n.singleton=!1,u()(r.default,n);const a=r.default.locals||{}},"./src/components/Nentry.scss":(E,l,t)=>{t.r(l),t.d(l,{default:()=>a});var c=t("./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js"),u=t.n(c),r=t("./node_modules/css-loader/dist/cjs.js!./node_modules/sass-loader/dist/cjs.js!./src/components/Nentry.scss"),n={};n.insert="head",n.singleton=!1,u()(r.default,n);const a=r.default.locals||{}},"./src/components/Numerical.scss":(E,l,t)=>{t.r(l),t.d(l,{default:()=>a});var c=t("./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js"),u=t.n(c),r=t("./node_modules/css-loader/dist/cjs.js!./node_modules/sass-loader/dist/cjs.js!./src/components/Numerical.scss"),n={};n.insert="head",n.singleton=!1,u()(r.default,n);const a=r.default.locals||{}},"./src/components/Radio.scss":(E,l,t)=>{t.r(l),t.d(l,{default:()=>a});var c=t("./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js"),u=t.n(c),r=t("./node_modules/css-loader/dist/cjs.js!./node_modules/sass-loader/dist/cjs.js!./src/components/Radio.scss"),n={};n.insert="head",n.singleton=!1,u()(r.default,n);const a=r.default.locals||{}},"./src/components/VBargraph.scss":(E,l,t)=>{t.r(l),t.d(l,{default:()=>a});var c=t("./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js"),u=t.n(c),r=t("./node_modules/css-loader/dist/cjs.js!./node_modules/sass-loader/dist/cjs.js!./src/components/VBargraph.scss"),n={};n.insert="head",n.singleton=!1,u()(r.default,n);const a=r.default.locals||{}},"./src/components/VSlider.scss":(E,l,t)=>{t.r(l),t.d(l,{default:()=>a});var c=t("./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js"),u=t.n(c),r=t("./node_modules/css-loader/dist/cjs.js!./node_modules/sass-loader/dist/cjs.js!./src/components/VSlider.scss"),n={};n.insert="head",n.singleton=!1,u()(r.default,n);const a=r.default.locals||{}},"./src/index.scss":(E,l,t)=>{t.r(l),t.d(l,{default:()=>a});var c=t("./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js"),u=t.n(c),r=t("./node_modules/css-loader/dist/cjs.js!./node_modules/sass-loader/dist/cjs.js!./src/index.scss"),n={};n.insert="head",n.singleton=!1,u()(r.default,n);const a=r.default.locals||{}},"./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js":(E,l,t)=>{var c=function(){var m;return function(){return typeof m=="undefined"&&(m=Boolean(window&&document&&document.all&&!window.atob)),m}}(),u=function(){var m={};return function(g){if(typeof m[g]=="undefined"){var h=document.querySelector(g);if(window.HTMLIFrameElement&&h instanceof window.HTMLIFrameElement)try{h=h.contentDocument.head}catch{h=null}m[g]=h}return m[g]}}(),r=[];function n(p){for(var m=-1,_=0;_<r.length;_++)if(r[_].identifier===p){m=_;break}return m}function a(p,m){for(var _={},g=[],h=0;h<p.length;h++){var f=p[h],B=m.base?f[0]+m.base:f[0],b=_[B]||0,M="".concat(B," ").concat(b);_[B]=b+1;var O=n(M),C={css:f[1],media:f[2],sourceMap:f[3]};O!==-1?(r[O].references++,r[O].updater(C)):r.push({identifier:M,updater:A(C,m),references:1}),g.push(M)}return g}function s(p){var m=document.createElement("style"),_=p.attributes||{};if(typeof _.nonce=="undefined"){var g=t.nc;g&&(_.nonce=g)}if(Object.keys(_).forEach(function(f){m.setAttribute(f,_[f])}),typeof p.insert=="function")p.insert(m);else{var h=u(p.insert||"head");if(!h)throw new Error("Couldn't find a style target. This probably means that the value for the 'insert' parameter is invalid.");h.appendChild(m)}return m}function o(p){if(p.parentNode===null)return!1;p.parentNode.removeChild(p)}var e=function(){var m=[];return function(g,h){return m[g]=h,m.filter(Boolean).join(`
`)}}();function i(p,m,_,g){var h=_?"":g.media?"@media ".concat(g.media," {").concat(g.css,"}"):g.css;if(p.styleSheet)p.styleSheet.cssText=e(m,h);else{var f=document.createTextNode(h),B=p.childNodes;B[m]&&p.removeChild(B[m]),B.length?p.insertBefore(f,B[m]):p.appendChild(f)}}function d(p,m,_){var g=_.css,h=_.media,f=_.sourceMap;if(h?p.setAttribute("media",h):p.removeAttribute("media"),f&&typeof btoa!="undefined"&&(g+=`
/*# sourceMappingURL=data:application/json;base64,`.concat(btoa(unescape(encodeURIComponent(JSON.stringify(f))))," */")),p.styleSheet)p.styleSheet.cssText=g;else{for(;p.firstChild;)p.removeChild(p.firstChild);p.appendChild(document.createTextNode(g))}}var v=null,y=0;function A(p,m){var _,g,h;if(m.singleton){var f=y++;_=v||(v=s(m)),g=i.bind(null,_,f,!1),h=i.bind(null,_,f,!0)}else _=s(m),g=d.bind(null,_,m),h=function(){o(_)};return g(p),function(b){if(b){if(b.css===p.css&&b.media===p.media&&b.sourceMap===p.sourceMap)return;g(p=b)}else h()}}E.exports=function(p,m){m=m||{},!m.singleton&&typeof m.singleton!="boolean"&&(m.singleton=c()),p=p||[];var _=a(p,m);return function(h){if(h=h||[],Object.prototype.toString.call(h)==="[object Array]"){for(var f=0;f<_.length;f++){var B=_[f],b=n(B);r[b].references--}for(var M=a(h,m),O=0;O<_.length;O++){var C=_[O],P=n(C);r[P].references===0&&(r[P].updater(),r.splice(P,1))}_=M}}}}},H={};function w(E){var l=H[E];if(l!==void 0)return l.exports;var t=H[E]={id:E,exports:{}};return X[E](t,t.exports,w),t.exports}w.n=E=>{var l=E&&E.__esModule?()=>E.default:()=>E;return w.d(l,{a:l}),l},w.d=(E,l)=>{for(var t in l)w.o(l,t)&&!w.o(E,t)&&Object.defineProperty(E,t,{enumerable:!0,get:l[t]})},w.o=(E,l)=>Object.prototype.hasOwnProperty.call(E,l),w.r=E=>{typeof Symbol!="undefined"&&Symbol.toStringTag&&Object.defineProperty(E,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(E,"__esModule",{value:!0})};var F={};return(()=>{/*!**********************!*\
  !*** ./src/index.ts ***!
  \**********************/w.r(F),w.d(F,{FaustUI:()=>E.FaustUI,instantiate:()=>l.instantiate});var E=w("./src/FaustUI.ts"),l=w("./src/instantiate.ts")})(),F})()})})(Y);Y.exports.instantiate();
