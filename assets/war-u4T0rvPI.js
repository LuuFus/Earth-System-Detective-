import{$ as e,B as t,E as n,N as r,P as i,Q as a,S as o,T as s,U as c,V as l,X as u,Y as d,at as f,c as p,dt as m,et as h,h as g,i as _,it as v,l as y,m as b,n as x,nt as S,o as C,ot as w,pt as T,st as E,u as D,v as O,x as k,y as A,z as j}from"./index-CRVvhqut.js";import{a as M,c as N,d as ee,f as P,h as F,l as te,m as ne,n as re,o as ie,p as ae,t as oe,v as I}from"./variables-DQS35A7j.js";import{t as se}from"./countries-DGaalRGQ.js";import{n as ce,r as L}from"./photos-hlTONOoc.js";var R=T(m(),1);function le(e,t=!0,n=null){let[r,i]=(0,R.useState)(null);return(0,R.useEffect)(()=>{if(!t)return;let r=!1;return e().then(e=>!r&&i({key:n,v:e})).catch(()=>void 0),()=>{r=!0}},[t,n]),r&&r.key===n?r.v:null}var ue=null;function de(){return ue||(ue=fetch(`/Earth-System-Detective-/data/geo/cities.json`).then(e=>{if(!e.ok)throw Error(`cities ${e.status}`);return e.json()}).then(e=>fe(e.cities)),ue.catch(()=>ue=null)),ue}function fe(e){return e.map(([e,t,n,r,i,a,o,s,c],l)=>({id:l,uk:e,en:t,lat:n,lon:r,code:i,pop:a,areaKm2:o,rank:s,capital:c===1}))}function pe(e){let t=e.areaKm2>0?Math.sqrt(e.areaKm2/Math.PI)*1.15:0,n=e.pop>0?4+Math.sqrt(e.pop/1e6)*9:8;return Math.round(Math.min(40,Math.max(6,t||n)))}function me(e){return e.toLowerCase().normalize(`NFD`).replace(/\u0438\u0306/g,`й`).replace(/\u0456\u0308/g,`ї`).replace(/[\u0300-\u036f]/g,``).replace(/[ʼ'’`‘-]/g,``).replace(/\s+/g,` `).replace(/ґ/g,`г`).replace(/ё/g,`е`).trim()}function he(e,t,n=8){let r=me(t);if(r.length<2)return[];let i=[],a=[];for(let t of e){let e=me(t.uk),n=me(t.en);e.startsWith(r)||n.startsWith(r)?i.push(t):(e.includes(r)||n.includes(r))&&a.push(t)}let o=e=>me(e.uk)===r||me(e.en)===r?0:1;return i.sort((e,t)=>o(e)-o(t)||t.pop-e.pop),a.sort((e,t)=>t.pop-e.pop),[...i,...a].slice(0,n)}function ge(e,t,n,r){let i=null,o=r/111;for(let s of e){if(Math.abs(s.lat-t)>o)continue;let e=a(t,n,s.lat,s.lon);e<=r&&(!i||e<i.km)&&(i={city:s,km:e})}return i}var _e=e=>({name:{uk:e.uk,en:e.en},lat:e.lat,lon:e.lon,code:e.code,pop:e.pop,areaKm2:e.areaKm2,capital:e.capital});function ve(e){return{kind:`point`,lat:e.lat,lon:e.lon,radiusKm:pe({areaKm2:e.areaKm2??0,pop:e.pop??0}),name:e.name,city:e.pop?{pop:e.pop,areaKm2:e.areaKm2??0,code:e.code??``}:void 0}}var ye={US:[`США`,`Америка`,`Сполучені Штати Америки`,`Штати`,`USA`,`US`,`America`,`United States of America`],GB:[`Британія`,`Велика Британія`,`Англія`,`Сполучене Королівство`,`UK`,`Britain`,`Great Britain`,`England`],RU:[`РФ`,`Russian Federation`],KR:[`Південна Корея`,`Корея`,`South Korea`,`Korea`],KP:[`Північна Корея`,`КНДР`,`North Korea`,`DPRK`],AE:[`ОАЕ`,`Емірати`,`UAE`,`Emirates`],ZA:[`ПАР`,`Південна Африка`,`South Africa`,`RSA`],CD:[`ДР Конго`,`ДРК`,`Конго-Кіншаса`,`DR Congo`,`DRC`],CG:[`Республіка Конго`,`Конго-Браззавіль`,`Congo-Brazzaville`],CZ:[`Чехія`,`Чеська Республіка`,`Czechia`,`Czech Republic`],NL:[`Голландія`,`Holland`],CF:[`ЦАР`,`CAR`],DO:[`Домінікана`],TR:[`Туреччина`,`Turkey`,`Türkiye`],CI:[`Кот-д'Івуар`,`Берег Слонової Кістки`,`Ivory Coast`],MM:[`Бірма`,`М'янма`,`Burma`],SZ:[`Свазіленд`,`Есватіні`,`Swaziland`],MK:[`Македонія`,`Macedonia`],BA:[`Боснія`,`Bosnia`],VA:[`Ватикан`,`Vatican`],CN:[`КНР`,`PRC`],BY:[`Білорусія`,`Беларусь`],MD:[`Молдавія`],KG:[`Киргизія`,`Kirghizia`],NZ:[`NZ`],VN:[`В'єтнам`],LA:[`Laos`],PS:[`Палестина`,`Palestine`],BO:[`Bolivia`],VE:[`Venezuela`],IR:[`Iran`],SY:[`Syria`],TZ:[`Tanzania`],TL:[`Східний Тимор`,`East Timor`],CV:[`Кабо-Верде`,`Cape Verde`]},z=e=>e.toLocaleLowerCase().normalize(`NFD`).replace(/[̀-ͯ]/g,``).replace(/[’'`ʼ]/g,``).replace(/\s+/g,` `).trim();function be(e,t,n,r=()=>[]){let i=e=>{let t=new Intl.DisplayNames([e],{type:`region`});return e=>{try{let n=t.of(e);return n&&n!==e?n:void 0}catch{return}}},a=i(n),o=i(`uk`),s=i(`en`);return e.map(e=>{let i=t(e),c=r(e),l=a(i)??c[n===`uk`?0:1]??c[0]??i,u=[l,o(i),s(i),i,...c,...ye[i]??[]].filter(e=>!!e);return{item:e,code:i,label:l,keys:[...new Set(u.map(z))]}}).sort((e,t)=>e.label.localeCompare(t.label,n))}function xe(e,t,n=!1){let r=z(t);if(!r)return null;let i=e.find(e=>e.keys.includes(r));return i||n?i??null:e.find(e=>e.keys.some(e=>e.startsWith(r)))??(r.length>=3?e.find(e=>e.keys.some(e=>e.includes(r)))??null:null)}function Se(e,t){let n=/[а-яіїєґ]/i,r=[];for(let i of e)for(let e of ye[i.code]??[])(t===`uk`===n.test(e)||/^[A-Z]{2,4}$/.test(e))&&r.push({value:e,label:i.label});return r}var B=w(),Ce=(e,t)=>{let n=e.code?I(e.code,t):``;return n?`${e[t]}, ${n}`:e[t]};function V(e){return{kind:`city`,lat:e.lat,lon:e.lon,name:{uk:e.uk,en:e.en},city:e,code:e.code}}function H({onFound:e,countriesOnly:t=!1}){let{lang:n,t:r}=f(),[i,a]=(0,R.useState)(``),[o,s]=(0,R.useState)(!1),[c,l]=(0,R.useState)(!1),u=le(de),d=(0,R.useMemo)(()=>t?[]:u??[],[u,t]),p=(0,R.useMemo)(()=>be(se,e=>e.code,n,e=>[e.name]),[n]),m=(0,R.useMemo)(()=>Se(p,n),[p,n]),h=(0,R.useMemo)(()=>d.filter(e=>e.pop>=3e5||e.code===`UA`).map(e=>({c:e,label:Ce(e,n)})),[d,n]),g=e=>({kind:`country`,lat:e.item.lat,lon:e.item.lon,big:e.item.big,code:e.item.code,name:{uk:I(e.item.code,`uk`),en:I(e.item.code,`en`)}}),_=e=>{let t=h.find(t=>t.label===e);if(t)return t.c;let[r,i]=e.split(`,`).map(e=>e.trim()),a=he(d,r,40);return(i?a.filter(e=>e.code&&me(I(e.code,n)).startsWith(me(i))):a)[0]??a[0]??null},v=async r=>{let i=r.trim();if(!i)return;let o=xe(p,i,!0);if(o)return s(!1),a(o.label),e(g(o));let c=t?null:_(i),u=xe(p,i),d=c&&(!u||me(c[n]).startsWith(me(i.split(`,`)[0])));if(c&&d)return s(!1),a(Ce(c,n)),e(V(c));if(u)return s(!1),a(u.label),e(g(u));if(t)s(!0);else{l(!0);try{let[t]=await O(i,n);s(!t),t&&(a([t.name,t.country].filter(Boolean).join(`, `)),e({kind:`city`,lat:t.lat,lon:t.lon,name:{uk:t.name,en:t.name},city:null,code:t.cc?.toUpperCase()}))}catch{s(!0)}finally{l(!1)}}};return(0,B.jsxs)(`form`,{className:`search`,role:`search`,onSubmit:e=>{e.preventDefault(),v(i)},children:[(0,B.jsx)(`label`,{className:`visually-hidden`,htmlFor:`country-search`,children:t?r.explore.search.countryLabel:r.explore.search.label}),(0,B.jsxs)(`svg`,{className:`search__icon`,viewBox:`0 0 16 16`,width:`16`,height:`16`,"aria-hidden":`true`,focusable:`false`,children:[(0,B.jsx)(`circle`,{cx:`7`,cy:`7`,r:`4.8`,fill:`none`,stroke:`currentColor`,strokeWidth:`1.3`}),(0,B.jsx)(`path`,{d:`m10.6 10.6 3.6 3.6`,stroke:`currentColor`,strokeWidth:`1.3`})]}),(0,B.jsx)(`input`,{id:`country-search`,className:`search__input`,type:`search`,enterKeyHint:`search`,list:`country-list`,autoComplete:`off`,placeholder:t?r.explore.search.countryPlaceholder:r.explore.search.placeholder,value:i,"aria-invalid":o||void 0,"aria-busy":c||void 0,onFocus:e=>e.currentTarget.select(),"aria-describedby":o?`country-search-error`:void 0,onChange:t=>{let n=t.target.value;a(n),s(!1);let r=xe(p,n,!0);if(r&&(r.label===n||m.some(e=>e.value===n)))return e(g(r));let i=h.find(e=>e.label===n);i&&e(V(i.c))}}),(0,B.jsxs)(`datalist`,{id:`country-list`,children:[p.map(e=>(0,B.jsx)(`option`,{value:e.label},e.code)),m.map(e=>(0,B.jsx)(`option`,{value:e.value,label:e.label},`${e.value}-${e.label}`)),h.map(e=>(0,B.jsx)(`option`,{value:e.label},`c${e.c.id}`))]}),(0,B.jsx)(`button`,{type:`submit`,className:`search__go`,disabled:c,children:r.explore.search.go}),o&&(0,B.jsx)(`p`,{className:`search__error`,id:`country-search-error`,role:`status`,children:t?r.explore.search.notCountry:r.explore.search.notFound})]})}var we={LEFT:0,MIDDLE:1,RIGHT:2,ROTATE:0,DOLLY:1,PAN:2},Te={ROTATE:0,PAN:1,DOLLY_PAN:2,DOLLY_ROTATE:3},Ee=1e3,De=1001,Oe=1002,ke=1003,Ae=1004,je=1005,U=1006,Me=1007,Ne=1008,Pe=1009,Fe=1010,Ie=1011,Le=1012,Re=1013,ze=1014,Be=1015,Ve=1016,He=1017,Ue=1018,We=1020,Ge=35902,Ke=35899,qe=1021,Je=1022,Ye=1023,Xe=1026,Ze=1027,Qe=1028,$e=1029,et=1030,tt=1031,nt=1033,rt=33776,it=33777,at=33778,ot=33779,st=35840,ct=35841,lt=35842,ut=35843,dt=36196,ft=37492,pt=37496,mt=37488,ht=37489,gt=37490,_t=37491,vt=37808,yt=37809,bt=37810,xt=37811,St=37812,Ct=37813,wt=37814,Tt=37815,Et=37816,Dt=37817,Ot=37818,kt=37819,At=37820,jt=37821,Mt=36492,Nt=36494,Pt=36495,Ft=36283,It=36284,Lt=36285,Rt=36286,zt=2300,Bt=2301,Vt=2302,Ht=2303,Ut=2400,Wt=2401,Gt=2402,Kt=3200,qt=`srgb`,Jt=`srgb-linear`,Yt=`linear`,Xt=`srgb`,Zt=7680,Qt=35044,$t=35048,en=2e3;function tn(e){for(let t=e.length-1;t>=0;--t)if(e[t]>=65535)return!0;return!1}function nn(e){return ArrayBuffer.isView(e)&&!(e instanceof DataView)}function rn(e){return document.createElementNS(`http://www.w3.org/1999/xhtml`,e)}function an(){let e=rn(`canvas`);return e.style.display=`block`,e}var on={};function sn(...e){let t=`THREE.`+e.shift();console.log(t,...e)}function cn(e){let t=e[0];if(typeof t==`string`&&t.startsWith(`TSL:`)){let t=e[1];t&&t.isStackTrace?e[0]+=` `+t.getLocation():e[1]=`Stack trace not available. Enable "THREE.Node.captureStackTrace" to capture stack traces.`}return e}function W(...e){e=cn(e);let t=`THREE.`+e.shift();{let n=e[0];n&&n.isStackTrace?console.warn(n.getError(t)):console.warn(t,...e)}}function G(...e){e=cn(e);let t=`THREE.`+e.shift();{let n=e[0];n&&n.isStackTrace?console.error(n.getError(t)):console.error(t,...e)}}function ln(...e){let t=e.join(` `);t in on||(on[t]=!0,W(...e))}function un(e,t,n){return new Promise(function(r,i){function a(){switch(e.clientWaitSync(t,e.SYNC_FLUSH_COMMANDS_BIT,0)){case e.WAIT_FAILED:i();break;case e.TIMEOUT_EXPIRED:setTimeout(a,n);break;default:r()}}setTimeout(a,n)})}var dn={0:0,2:6,4:4,3:5,1:1,6:2,7:7,5:3},fn=class{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});let n=this._listeners;n[e]===void 0&&(n[e]=[]),n[e].indexOf(t)===-1&&n[e].push(t)}hasEventListener(e,t){let n=this._listeners;return n!==void 0&&n[e]!==void 0&&n[e].indexOf(t)!==-1}removeEventListener(e,t){let n=this._listeners;if(n===void 0)return;let r=n[e];if(r!==void 0){let e=r.indexOf(t);e!==-1&&r.splice(e,1)}}dispatchEvent(e){let t=this._listeners;if(t===void 0)return;let n=t[e.type];if(n!==void 0){e.target=this;let t=n.slice(0);for(let n=0,r=t.length;n<r;n++)t[n].call(this,e);e.target=null}}},pn=`00.01.02.03.04.05.06.07.08.09.0a.0b.0c.0d.0e.0f.10.11.12.13.14.15.16.17.18.19.1a.1b.1c.1d.1e.1f.20.21.22.23.24.25.26.27.28.29.2a.2b.2c.2d.2e.2f.30.31.32.33.34.35.36.37.38.39.3a.3b.3c.3d.3e.3f.40.41.42.43.44.45.46.47.48.49.4a.4b.4c.4d.4e.4f.50.51.52.53.54.55.56.57.58.59.5a.5b.5c.5d.5e.5f.60.61.62.63.64.65.66.67.68.69.6a.6b.6c.6d.6e.6f.70.71.72.73.74.75.76.77.78.79.7a.7b.7c.7d.7e.7f.80.81.82.83.84.85.86.87.88.89.8a.8b.8c.8d.8e.8f.90.91.92.93.94.95.96.97.98.99.9a.9b.9c.9d.9e.9f.a0.a1.a2.a3.a4.a5.a6.a7.a8.a9.aa.ab.ac.ad.ae.af.b0.b1.b2.b3.b4.b5.b6.b7.b8.b9.ba.bb.bc.bd.be.bf.c0.c1.c2.c3.c4.c5.c6.c7.c8.c9.ca.cb.cc.cd.ce.cf.d0.d1.d2.d3.d4.d5.d6.d7.d8.d9.da.db.dc.dd.de.df.e0.e1.e2.e3.e4.e5.e6.e7.e8.e9.ea.eb.ec.ed.ee.ef.f0.f1.f2.f3.f4.f5.f6.f7.f8.f9.fa.fb.fc.fd.fe.ff`.split(`.`),mn=1234567,hn=Math.PI/180,gn=180/Math.PI;function _n(){let e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,n=Math.random()*4294967295|0,r=Math.random()*4294967295|0;return(pn[e&255]+pn[e>>8&255]+pn[e>>16&255]+pn[e>>24&255]+`-`+pn[t&255]+pn[t>>8&255]+`-`+pn[t>>16&15|64]+pn[t>>24&255]+`-`+pn[n&63|128]+pn[n>>8&255]+`-`+pn[n>>16&255]+pn[n>>24&255]+pn[r&255]+pn[r>>8&255]+pn[r>>16&255]+pn[r>>24&255]).toLowerCase()}function K(e,t,n){return Math.max(t,Math.min(n,e))}function vn(e,t){return(e%t+t)%t}function yn(e,t,n,r,i){return r+(e-t)*(i-r)/(n-t)}function bn(e,t,n){return e===t?0:(n-e)/(t-e)}function xn(e,t,n){return(1-n)*e+n*t}function Sn(e,t,n,r){return xn(e,t,1-Math.exp(-n*r))}function Cn(e,t=1){return t-Math.abs(vn(e,t*2)-t)}function wn(e,t,n){return e<=t?0:e>=n?1:(e=(e-t)/(n-t),e*e*(3-2*e))}function Tn(e,t,n){return e<=t?0:e>=n?1:(e=(e-t)/(n-t),e*e*e*(e*(e*6-15)+10))}function En(e,t){return e+Math.floor(Math.random()*(t-e+1))}function Dn(e,t){return e+Math.random()*(t-e)}function On(e){return e*(.5-Math.random())}function kn(e){e!==void 0&&(mn=e);let t=mn+=1831565813;return t=Math.imul(t^t>>>15,t|1),t^=t+Math.imul(t^t>>>7,t|61),((t^t>>>14)>>>0)/4294967296}function An(e){return e*hn}function jn(e){return e*gn}function Mn(e){return e>0&&Number.isInteger(e)&&2**Math.round(Math.log2(e))===e}function Nn(e){return 2**Math.ceil(Math.log(e)/Math.LN2)}function Pn(e){return 2**Math.floor(Math.log(e)/Math.LN2)}function Fn(e,t,n,r,i){let a=Math.cos,o=Math.sin,s=a(n/2),c=o(n/2),l=a((t+r)/2),u=o((t+r)/2),d=a((t-r)/2),f=o((t-r)/2),p=a((r-t)/2),m=o((r-t)/2);switch(i){case`XYX`:e.set(s*u,c*d,c*f,s*l);break;case`YZY`:e.set(c*f,s*u,c*d,s*l);break;case`ZXZ`:e.set(c*d,c*f,s*u,s*l);break;case`XZX`:e.set(s*u,c*m,c*p,s*l);break;case`YXY`:e.set(c*p,s*u,c*m,s*l);break;case`ZYZ`:e.set(c*m,c*p,s*u,s*l);break;default:W(`MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: `+i)}}function In(e){switch(e.constructor){case Uint32Array:return 4294967295;case Uint16Array:return 65535;case Uint8Array:case Uint8ClampedArray:return 255;case Int32Array:return 2147483647;case Int16Array:return 32767;case Int8Array:return 127;default:return}}function Ln(e,t){if(t.constructor===Float32Array)return e;let n=In(t);if(n===void 0)throw Error(`THREE.MathUtils: Invalid component type.`);return Math.max(e/n,-1)}function Rn(e,t){if(t.constructor===Float32Array)return e;let n=In(t);if(n===void 0)throw Error(`THREE.MathUtils: Invalid component type.`);return Math.round(e*n)}var zn={DEG2RAD:hn,RAD2DEG:gn,generateUUID:_n,clamp:K,euclideanModulo:vn,mapLinear:yn,inverseLerp:bn,lerp:xn,damp:Sn,pingpong:Cn,smoothstep:wn,smootherstep:Tn,randInt:En,randFloat:Dn,randFloatSpread:On,seededRandom:kn,degToRad:An,radToDeg:jn,isPowerOfTwo:Mn,ceilPowerOfTwo:Nn,floorPowerOfTwo:Pn,setQuaternionFromProperEuler:Fn,normalize:Rn,denormalize:Ln},q=class{static{this.prototype.isVector2=!0}constructor(e=0,t=0){this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw Error(`THREE.Vector2: index is out of range: `+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw Error(`THREE.Vector2: index is out of range: `+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){let t=this.x,n=this.y,r=e.elements;return this.x=r[0]*t+r[3]*n+r[6],this.y=r[1]*t+r[4]*n+r[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=K(this.x,e.x,t.x),this.y=K(this.y,e.y,t.y),this}clampScalar(e,t){return this.x=K(this.x,e,t),this.y=K(this.y,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(K(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(K(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y;return t*t+n*n}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){let n=Math.cos(t),r=Math.sin(t),i=this.x-e.x,a=this.y-e.y;return this.x=i*n-a*r+e.x,this.y=i*r+a*n+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}},Bn=class{constructor(e=0,t=0,n=0,r=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=n,this._w=r}static slerpFlat(e,t,n,r,i,a,o){let s=n[r+0],c=n[r+1],l=n[r+2],u=n[r+3],d=i[a+0],f=i[a+1],p=i[a+2],m=i[a+3];if(u!==m||s!==d||c!==f||l!==p){let e=s*d+c*f+l*p+u*m;e<0&&(d=-d,f=-f,p=-p,m=-m,e=-e);let t=1-o;if(e<.9995){let n=Math.acos(e),r=Math.sin(n);t=Math.sin(t*n)/r,o=Math.sin(o*n)/r,s=s*t+d*o,c=c*t+f*o,l=l*t+p*o,u=u*t+m*o}else{s=s*t+d*o,c=c*t+f*o,l=l*t+p*o,u=u*t+m*o;let e=1/Math.sqrt(s*s+c*c+l*l+u*u);s*=e,c*=e,l*=e,u*=e}}e[t]=s,e[t+1]=c,e[t+2]=l,e[t+3]=u}static multiplyQuaternionsFlat(e,t,n,r,i,a){let o=n[r],s=n[r+1],c=n[r+2],l=n[r+3],u=i[a],d=i[a+1],f=i[a+2],p=i[a+3];return e[t]=o*p+l*u+s*f-c*d,e[t+1]=s*p+l*d+c*u-o*f,e[t+2]=c*p+l*f+o*d-s*u,e[t+3]=l*p-o*u-s*d-c*f,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,n,r){return this._x=e,this._y=t,this._z=n,this._w=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){let n=e._x,r=e._y,i=e._z,a=e._order,o=Math.cos,s=Math.sin,c=o(n/2),l=o(r/2),u=o(i/2),d=s(n/2),f=s(r/2),p=s(i/2);switch(a){case`XYZ`:this._x=d*l*u+c*f*p,this._y=c*f*u-d*l*p,this._z=c*l*p+d*f*u,this._w=c*l*u-d*f*p;break;case`YXZ`:this._x=d*l*u+c*f*p,this._y=c*f*u-d*l*p,this._z=c*l*p-d*f*u,this._w=c*l*u+d*f*p;break;case`ZXY`:this._x=d*l*u-c*f*p,this._y=c*f*u+d*l*p,this._z=c*l*p+d*f*u,this._w=c*l*u-d*f*p;break;case`ZYX`:this._x=d*l*u-c*f*p,this._y=c*f*u+d*l*p,this._z=c*l*p-d*f*u,this._w=c*l*u+d*f*p;break;case`YZX`:this._x=d*l*u+c*f*p,this._y=c*f*u+d*l*p,this._z=c*l*p-d*f*u,this._w=c*l*u-d*f*p;break;case`XZY`:this._x=d*l*u-c*f*p,this._y=c*f*u-d*l*p,this._z=c*l*p+d*f*u,this._w=c*l*u+d*f*p;break;default:W(`Quaternion: .setFromEuler() encountered an unknown order: `+a)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){let n=t/2,r=Math.sin(n);return this._x=e.x*r,this._y=e.y*r,this._z=e.z*r,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(e){let t=e.elements,n=t[0],r=t[4],i=t[8],a=t[1],o=t[5],s=t[9],c=t[2],l=t[6],u=t[10],d=n+o+u;if(d>0){let e=.5/Math.sqrt(d+1);this._w=.25/e,this._x=(l-s)*e,this._y=(i-c)*e,this._z=(a-r)*e}else if(n>o&&n>u){let e=2*Math.sqrt(1+n-o-u);this._w=(l-s)/e,this._x=.25*e,this._y=(r+a)/e,this._z=(i+c)/e}else if(o>u){let e=2*Math.sqrt(1+o-n-u);this._w=(i-c)/e,this._x=(r+a)/e,this._y=.25*e,this._z=(s+l)/e}else{let e=2*Math.sqrt(1+u-n-o);this._w=(a-r)/e,this._x=(i+c)/e,this._y=(s+l)/e,this._z=.25*e}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let n=e.dot(t)+1;return n<1e-8?(n=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=n):(this._x=0,this._y=-e.z,this._z=e.y,this._w=n)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=n),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(K(this.dot(e),-1,1)))}rotateTowards(e,t){let n=this.angleTo(e);if(n===0)return this;let r=Math.min(1,t/n);return this.slerp(e,r),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x*=e,this._y*=e,this._z*=e,this._w*=e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){let n=e._x,r=e._y,i=e._z,a=e._w,o=t._x,s=t._y,c=t._z,l=t._w;return this._x=n*l+a*o+r*c-i*s,this._y=r*l+a*s+i*o-n*c,this._z=i*l+a*c+n*s-r*o,this._w=a*l-n*o-r*s-i*c,this._onChangeCallback(),this}slerp(e,t){let n=e._x,r=e._y,i=e._z,a=e._w,o=this.dot(e);o<0&&(n=-n,r=-r,i=-i,a=-a,o=-o);let s=1-t;if(o<.9995){let e=Math.acos(o),c=Math.sin(e);s=Math.sin(s*e)/c,t=Math.sin(t*e)/c,this._x=this._x*s+n*t,this._y=this._y*s+r*t,this._z=this._z*s+i*t,this._w=this._w*s+a*t,this._onChangeCallback()}else this._x=this._x*s+n*t,this._y=this._y*s+r*t,this._z=this._z*s+i*t,this._w=this._w*s+a*t,this.normalize();return this}slerpQuaternions(e,t,n){return this.copy(e).slerp(t,n)}random(){let e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),n=Math.random(),r=Math.sqrt(1-n),i=Math.sqrt(n);return this.set(r*Math.sin(e),r*Math.cos(e),i*Math.sin(t),i*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},J=class{static{this.prototype.isVector3=!0}constructor(e=0,t=0,n=0){this.x=e,this.y=t,this.z=n}set(e,t,n){return n===void 0&&(n=this.z),this.x=e,this.y=t,this.z=n,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw Error(`THREE.Vector3: index is out of range: `+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw Error(`THREE.Vector3: index is out of range: `+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(Hn.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(Hn.setFromAxisAngle(e,t))}applyMatrix3(e){let t=this.x,n=this.y,r=this.z,i=e.elements;return this.x=i[0]*t+i[3]*n+i[6]*r,this.y=i[1]*t+i[4]*n+i[7]*r,this.z=i[2]*t+i[5]*n+i[8]*r,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){let t=this.x,n=this.y,r=this.z,i=e.elements,a=1/(i[3]*t+i[7]*n+i[11]*r+i[15]);return this.x=(i[0]*t+i[4]*n+i[8]*r+i[12])*a,this.y=(i[1]*t+i[5]*n+i[9]*r+i[13])*a,this.z=(i[2]*t+i[6]*n+i[10]*r+i[14])*a,this}applyQuaternion(e){let t=this.x,n=this.y,r=this.z,i=e.x,a=e.y,o=e.z,s=e.w,c=2*(a*r-o*n),l=2*(o*t-i*r),u=2*(i*n-a*t);return this.x=t+s*c+a*u-o*l,this.y=n+s*l+o*c-i*u,this.z=r+s*u+i*l-a*c,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){let t=this.x,n=this.y,r=this.z,i=e.elements;return this.x=i[0]*t+i[4]*n+i[8]*r,this.y=i[1]*t+i[5]*n+i[9]*r,this.z=i[2]*t+i[6]*n+i[10]*r,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=K(this.x,e.x,t.x),this.y=K(this.y,e.y,t.y),this.z=K(this.z,e.z,t.z),this}clampScalar(e,t){return this.x=K(this.x,e,t),this.y=K(this.y,e,t),this.z=K(this.z,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(K(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){let n=e.x,r=e.y,i=e.z,a=t.x,o=t.y,s=t.z;return this.x=r*s-i*o,this.y=i*a-n*s,this.z=n*o-r*a,this}projectOnVector(e){let t=e.lengthSq();if(t===0)return this.set(0,0,0);let n=e.dot(this)/t;return this.copy(e).multiplyScalar(n)}projectOnPlane(e){return Vn.copy(this).projectOnVector(e),this.sub(Vn)}reflect(e){return this.sub(Vn.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(K(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y,r=this.z-e.z;return t*t+n*n+r*r}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,n){let r=Math.sin(t)*e;return this.x=r*Math.sin(n),this.y=Math.cos(t)*e,this.z=r*Math.cos(n),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,n){return this.x=e*Math.sin(t),this.y=n,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){let t=this.setFromMatrixColumn(e,0).length(),n=this.setFromMatrixColumn(e,1).length(),r=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=n,this.z=r,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let e=Math.random()*Math.PI*2,t=Math.random()*2-1,n=Math.sqrt(1-t*t);return this.x=n*Math.cos(e),this.y=t,this.z=n*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}},Vn=new J,Hn=new Bn,Y=class{static{this.prototype.isMatrix3=!0}constructor(e,t,n,r,i,a,o,s,c){this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,n,r,i,a,o,s,c)}set(e,t,n,r,i,a,o,s,c){let l=this.elements;return l[0]=e,l[1]=r,l[2]=o,l[3]=t,l[4]=i,l[5]=s,l[6]=n,l[7]=a,l[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],this}extractBasis(e,t,n){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(e){let t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,r=t.elements,i=this.elements,a=n[0],o=n[3],s=n[6],c=n[1],l=n[4],u=n[7],d=n[2],f=n[5],p=n[8],m=r[0],h=r[3],g=r[6],_=r[1],v=r[4],y=r[7],b=r[2],x=r[5],S=r[8];return i[0]=a*m+o*_+s*b,i[3]=a*h+o*v+s*x,i[6]=a*g+o*y+s*S,i[1]=c*m+l*_+u*b,i[4]=c*h+l*v+u*x,i[7]=c*g+l*y+u*S,i[2]=d*m+f*_+p*b,i[5]=d*h+f*v+p*x,i[8]=d*g+f*y+p*S,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[1],r=e[2],i=e[3],a=e[4],o=e[5],s=e[6],c=e[7],l=e[8];return t*a*l-t*o*c-n*i*l+n*o*s+r*i*c-r*a*s}invert(){let e=this.elements,t=e[0],n=e[1],r=e[2],i=e[3],a=e[4],o=e[5],s=e[6],c=e[7],l=e[8],u=l*a-o*c,d=o*s-l*i,f=c*i-a*s,p=t*u+n*d+r*f;if(p===0)return this.set(0,0,0,0,0,0,0,0,0);let m=1/p;return e[0]=u*m,e[1]=(r*c-l*n)*m,e[2]=(o*n-r*a)*m,e[3]=d*m,e[4]=(l*t-r*s)*m,e[5]=(r*i-o*t)*m,e[6]=f*m,e[7]=(n*s-c*t)*m,e[8]=(a*t-n*i)*m,this}transpose(){let e,t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){let t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,n,r,i,a,o){let s=Math.cos(i),c=Math.sin(i);return this.set(n*s,n*c,-n*(s*a+c*o)+a+e,-r*c,r*s,-r*(-c*a+s*o)+o+t,0,0,1),this}scale(e,t){return ln(`Matrix3: .scale() is deprecated. Use .makeScale() instead.`),this.premultiply(Un.makeScale(e,t)),this}rotate(e){return ln(`Matrix3: .rotate() is deprecated. Use .makeRotation() instead.`),this.premultiply(Un.makeRotation(-e)),this}translate(e,t){return ln(`Matrix3: .translate() is deprecated. Use .makeTranslation() instead.`),this.premultiply(Un.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,n,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){let t=this.elements,n=e.elements;for(let e=0;e<9;e++)if(t[e]!==n[e])return!1;return!0}fromArray(e,t=0){for(let n=0;n<9;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e}clone(){return new this.constructor().fromArray(this.elements)}},Un=new Y,Wn=new Y().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),Gn=new Y().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function Kn(){let e={enabled:!0,workingColorSpace:Jt,spaces:{},convert:function(e,t,n){return this.enabled===!1||t===n||!t||!n||(this.spaces[t].transfer===`srgb`&&(e.r=qn(e.r),e.g=qn(e.g),e.b=qn(e.b)),this.spaces[t].primaries!==this.spaces[n].primaries&&(e.applyMatrix3(this.spaces[t].toXYZ),e.applyMatrix3(this.spaces[n].fromXYZ)),this.spaces[n].transfer===`srgb`&&(e.r=Jn(e.r),e.g=Jn(e.g),e.b=Jn(e.b))),e},workingToColorSpace:function(e,t){return this.convert(e,this.workingColorSpace,t)},colorSpaceToWorking:function(e,t){return this.convert(e,t,this.workingColorSpace)},getPrimaries:function(e){return this.spaces[e].primaries},getTransfer:function(e){return e===``?Yt:this.spaces[e].transfer},getToneMappingMode:function(e){return this.spaces[e].outputColorSpaceConfig.toneMappingMode||`standard`},getLuminanceCoefficients:function(e,t=this.workingColorSpace){return e.fromArray(this.spaces[t].luminanceCoefficients)},define:function(e){Object.assign(this.spaces,e)},_getMatrix:function(e,t,n){return e.copy(this.spaces[n].fromXYZ).multiply(this.spaces[t].toXYZ)},_getDrawingBufferColorSpace:function(e){return this.spaces[e].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(e=this.workingColorSpace){return this.spaces[e].workingColorSpaceConfig.unpackColorSpace}},t=[.64,.33,.3,.6,.15,.06],n=[.2126,.7152,.0722],r=[.3127,.329];return e.define({[Jt]:{primaries:t,whitePoint:r,transfer:Yt,toXYZ:Wn,fromXYZ:Gn,luminanceCoefficients:n,workingColorSpaceConfig:{unpackColorSpace:qt},outputColorSpaceConfig:{drawingBufferColorSpace:qt}},[qt]:{primaries:t,whitePoint:r,transfer:Xt,toXYZ:Wn,fromXYZ:Gn,luminanceCoefficients:n,outputColorSpaceConfig:{drawingBufferColorSpace:qt}}}),e}var X=Kn();function qn(e){return e<.04045?e*.0773993808:(e*.9478672986+.0521327014)**2.4}function Jn(e){return e<.0031308?e*12.92:1.055*e**.41666-.055}var Yn,Xn=class{static getDataURL(e,t=`image/png`){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>`u`)return e.src;let n;if(e instanceof HTMLCanvasElement)n=e;else{Yn===void 0&&(Yn=rn(`canvas`)),Yn.width=e.width,Yn.height=e.height;let t=Yn.getContext(`2d`);e instanceof ImageData?t.putImageData(e,0,0):t.drawImage(e,0,0,e.width,e.height),n=Yn}return n.toDataURL(t)}static sRGBToLinear(e){if(typeof HTMLImageElement<`u`&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<`u`&&e instanceof HTMLCanvasElement||typeof ImageBitmap<`u`&&e instanceof ImageBitmap){let t=rn(`canvas`);t.width=e.width,t.height=e.height;let n=t.getContext(`2d`);n.drawImage(e,0,0,e.width,e.height);let r=n.getImageData(0,0,e.width,e.height),i=r.data;for(let e=0;e<i.length;e++)i[e]=qn(i[e]/255)*255;return n.putImageData(r,0,0),t}if(e.data){let t=e.data.slice(0);for(let e=0;e<t.length;e++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[e]=Math.floor(qn(t[e]/255)*255):t[e]=qn(t[e]);return{data:t,width:e.width,height:e.height}}return W(`ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied.`),e}},Zn=0,Qn=class{constructor(e=null){this.isTextureSource=!0,Object.defineProperty(this,"id",{value:Zn++}),this.uuid=_n(),this.data=e,this.dataReady=!0,this.version=0}getSize(e){let t=this.data;return typeof HTMLVideoElement<`u`&&t instanceof HTMLVideoElement?e.set(t.videoWidth,t.videoHeight,0):typeof VideoFrame<`u`&&t instanceof VideoFrame?e.set(t.displayWidth,t.displayHeight,0):t===null?e.set(0,0,0):e.set(t.width||0,t.height||0,t.depth||0),e}set needsUpdate(e){e===!0&&this.version++}toJSON(e){let t=e===void 0||typeof e==`string`;if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];let n={uuid:this.uuid,url:``},r=this.data;if(r!==null){let e;if(Array.isArray(r)){e=[];for(let t=0,n=r.length;t<n;t++)r[t].isDataTexture?e.push($n(r[t].image)):e.push($n(r[t]))}else e=$n(r);n.url=e}return t||(e.images[this.uuid]=n),n}};function $n(e){return typeof HTMLImageElement<`u`&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<`u`&&e instanceof HTMLCanvasElement||typeof ImageBitmap<`u`&&e instanceof ImageBitmap?Xn.getDataURL(e):e.data?{data:Array.from(e.data),width:e.width,height:e.height,type:e.data.constructor.name}:(W(`Texture: Unable to serialize Texture.`),{})}var er=0,tr=new J,nr=class e extends fn{constructor(t=e.DEFAULT_IMAGE,n=e.DEFAULT_MAPPING,r=De,i=De,a=U,o=Ne,s=Ye,c=Pe,l=e.DEFAULT_ANISOTROPY,u=``){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:er++}),this.uuid=_n(),this.name=``,this.source=new Qn(t),this.mipmaps=[],this.mapping=n,this.channel=0,this.wrapS=r,this.wrapT=i,this.magFilter=a,this.minFilter=o,this.anisotropy=l,this.format=s,this.internalFormat=null,this.type=c,this.offset=new q(0,0),this.repeat=new q(1,1),this.center=new q(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Y,this.generateMipmaps=!0,this.mipmapsAutoUpdate=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=u,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(t&&t.depth&&t.depth>1),this.pmremVersion=0,this.isPMREMTexture=!1,this.normalized=!1}get width(){return this.source.getSize(tr).x}get height(){return this.source.getSize(tr).y}get depth(){return this.source.getSize(tr).z}get image(){return this.source.data}set image(e){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.normalized=e.normalized,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.mipmapsAutoUpdate=e.mipmapsAutoUpdate,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.renderTarget=e.renderTarget,this.isRenderTargetTexture=e.isRenderTargetTexture,this.isPMREMTexture=e.isPMREMTexture,this.isArrayTexture=e.isArrayTexture,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}setValues(e){for(let t in e){let n=e[t];if(n===void 0){W(`Texture.setValues(): parameter '${t}' has value of undefined.`);continue}let r=this[t];r===void 0?W(`Texture.setValues(): property '${t}' does not exist.`):r&&n&&r.isVector2&&n.isVector2||r&&n&&r.isVector3&&n.isVector3||r&&n&&r.isMatrix3&&n.isMatrix3?r.copy(n):this[t]=n}}toJSON(e){let t=e===void 0||typeof e==`string`;if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];let n={metadata:{version:4.7,type:`Texture`,generator:`Texture.toJSON`},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,normalized:this.normalized,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,mipmapsAutoUpdate:this.mipmapsAutoUpdate,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),t||(e.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:`dispose`})}transformUv(e){if(this.mapping!==300)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case Ee:e.x-=Math.floor(e.x);break;case De:e.x=e.x<0?0:1;break;case Oe:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x-=Math.floor(e.x)}if(e.y<0||e.y>1)switch(this.wrapT){case Ee:e.y-=Math.floor(e.y);break;case De:e.y=e.y<0?0:1;break;case Oe:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y-=Math.floor(e.y)}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}};nr.DEFAULT_IMAGE=null,nr.DEFAULT_MAPPING=300,nr.DEFAULT_ANISOTROPY=1;var rr=class{static{this.prototype.isVector4=!0}constructor(e=0,t=0,n=0,r=1){this.x=e,this.y=t,this.z=n,this.w=r}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,n,r){return this.x=e,this.y=t,this.z=n,this.w=r,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw Error(`THREE.Vector4: index is out of range: `+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw Error(`THREE.Vector4: index is out of range: `+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w===void 0?1:e.w,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){let t=this.x,n=this.y,r=this.z,i=this.w,a=e.elements;return this.x=a[0]*t+a[4]*n+a[8]*r+a[12]*i,this.y=a[1]*t+a[5]*n+a[9]*r+a[13]*i,this.z=a[2]*t+a[6]*n+a[10]*r+a[14]*i,this.w=a[3]*t+a[7]*n+a[11]*r+a[15]*i,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);let t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,n,r,i,a=.01,o=.1,s=e.elements,c=s[0],l=s[4],u=s[8],d=s[1],f=s[5],p=s[9],m=s[2],h=s[6],g=s[10];if(Math.abs(l-d)<a&&Math.abs(u-m)<a&&Math.abs(p-h)<a){if(Math.abs(l+d)<o&&Math.abs(u+m)<o&&Math.abs(p+h)<o&&Math.abs(c+f+g-3)<o)return this.set(1,0,0,0),this;t=Math.PI;let e=(c+1)/2,s=(f+1)/2,_=(g+1)/2,v=(l+d)/4,y=(u+m)/4,b=(p+h)/4;return e>s&&e>_?e<a?(n=0,r=.707106781,i=.707106781):(n=Math.sqrt(e),r=v/n,i=y/n):s>_?s<a?(n=.707106781,r=0,i=.707106781):(r=Math.sqrt(s),n=v/r,i=b/r):_<a?(n=.707106781,r=.707106781,i=0):(i=Math.sqrt(_),n=y/i,r=b/i),this.set(n,r,i,t),this}let _=Math.sqrt((h-p)*(h-p)+(u-m)*(u-m)+(d-l)*(d-l));return Math.abs(_)<.001&&(_=1),this.x=(h-p)/_,this.y=(u-m)/_,this.z=(d-l)/_,this.w=Math.acos((c+f+g-1)/2),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=K(this.x,e.x,t.x),this.y=K(this.y,e.y,t.y),this.z=K(this.z,e.z,t.z),this.w=K(this.w,e.w,t.w),this}clampScalar(e,t){return this.x=K(this.x,e,t),this.y=K(this.y,e,t),this.z=K(this.z,e,t),this.w=K(this.w,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(K(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this.w=e.w+(t.w-e.w)*n,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}},ir=class extends fn{constructor(e=1,t=1,n={}){super(),n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:U,depthBuffer:!0,stencilBuffer:!1,resolveColorBuffer:!0,resolveDepthBuffer:!0,resolveStencilBuffer:!0,storeMultisampledColorBuffer:!0,storeMultisampledDepthBuffer:!0,storeMultisampledStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1,useArrayDepthTexture:!1},n),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=n.depth,this.scissor=new rr(0,0,e,t),this.scissorTest=!1,this.viewport=new rr(0,0,e,t),this.textures=[];let r=n.count;for(let i=0;i<r;i++)this.textures[i]=new nr({width:e,height:t,depth:n.depth}),this.textures[i].isRenderTargetTexture=!0,this.textures[i].renderTarget=this;this._setTextureOptions(n),this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveColorBuffer=n.resolveColorBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this.storeMultisampledColorBuffer=n.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=n.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=n.storeMultisampledStencilBuffer,this._depthTexture=null,this.depthTexture=n.depthTexture,this.samples=n.samples,this.multiview=n.multiview,this.useArrayDepthTexture=n.useArrayDepthTexture}_setTextureOptions(e={}){let t={minFilter:U,generateMipmaps:!1,flipY:!1,internalFormat:null};e.mapping!==void 0&&(t.mapping=e.mapping),e.wrapS!==void 0&&(t.wrapS=e.wrapS),e.wrapT!==void 0&&(t.wrapT=e.wrapT),e.wrapR!==void 0&&(t.wrapR=e.wrapR),e.magFilter!==void 0&&(t.magFilter=e.magFilter),e.minFilter!==void 0&&(t.minFilter=e.minFilter),e.format!==void 0&&(t.format=e.format),e.type!==void 0&&(t.type=e.type),e.anisotropy!==void 0&&(t.anisotropy=e.anisotropy),e.colorSpace!==void 0&&(t.colorSpace=e.colorSpace),e.flipY!==void 0&&(t.flipY=e.flipY),e.generateMipmaps!==void 0&&(t.generateMipmaps=e.generateMipmaps),e.mipmapsAutoUpdate!==void 0&&(t.mipmapsAutoUpdate=e.mipmapsAutoUpdate),e.internalFormat!==void 0&&(t.internalFormat=e.internalFormat);for(let e=0;e<this.textures.length;e++)this.textures[e].setValues(t)}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}set depthTexture(e){this._depthTexture!==null&&this._depthTexture.renderTarget===this&&(this._depthTexture.renderTarget=null),e!==null&&e.renderTarget===null&&(e.renderTarget=this),this._depthTexture=e}get depthTexture(){return this._depthTexture}setSize(e,t,n=1){if(this.width!==e||this.height!==t||this.depth!==n){this.width=e,this.height=t,this.depth=n;for(let r=0,i=this.textures.length;r<i;r++)this.textures[r].image.width=e,this.textures[r].image.height=t,this.textures[r].image.depth=n,this.textures[r].isData3DTexture!==!0&&(this.textures[r].isArrayTexture=this.textures[r].image.depth>1);this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let t=0,n=e.textures.length;t<n;t++){this.textures[t]=e.textures[t].clone(),this.textures[t].isRenderTargetTexture=!0,this.textures[t].renderTarget=this;let n=Object.assign({},e.textures[t].image);this.textures[t].source=new Qn(n)}if(this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveColorBuffer=e.resolveColorBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,this.storeMultisampledColorBuffer=e.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=e.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=e.storeMultisampledStencilBuffer,e.depthTexture!==null){if(e.depthTexture.renderTarget===e){let t=e.depthTexture.clone();t.renderTarget=null,this.depthTexture=t}else this.depthTexture=e.depthTexture}else this.depthTexture=null;return this.samples=e.samples,this.multiview=e.multiview,this.useArrayDepthTexture=e.useArrayDepthTexture,this}dispose(){this.dispatchEvent({type:`dispose`})}},ar=class extends ir{constructor(e=1,t=1,n={}){super(e,t,n),this.isWebGLRenderTarget=!0}},or=class extends nr{constructor(e=null,t=1,n=1,r=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:n,depth:r},this.magFilter=ke,this.minFilter=ke,this.wrapR=De,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}copy(e){return super.copy(e),this.wrapR=e.wrapR,this}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}},sr=class extends nr{constructor(e=null,t=1,n=1,r=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:n,depth:r},this.magFilter=ke,this.minFilter=ke,this.wrapR=De,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}copy(e){return super.copy(e),this.wrapR=e.wrapR,this}},cr=class e{static{this.prototype.isMatrix4=!0}constructor(e,t,n,r,i,a,o,s,c,l,u,d,f,p,m,h){this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,n,r,i,a,o,s,c,l,u,d,f,p,m,h)}set(e,t,n,r,i,a,o,s,c,l,u,d,f,p,m,h){let g=this.elements;return g[0]=e,g[4]=t,g[8]=n,g[12]=r,g[1]=i,g[5]=a,g[9]=o,g[13]=s,g[2]=c,g[6]=l,g[10]=u,g[14]=d,g[3]=f,g[7]=p,g[11]=m,g[15]=h,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new e().fromArray(this.elements)}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],t[9]=n[9],t[10]=n[10],t[11]=n[11],t[12]=n[12],t[13]=n[13],t[14]=n[14],t[15]=n[15],this}copyPosition(e){let t=this.elements,n=e.elements;return t[12]=n[12],t[13]=n[13],t[14]=n[14],this}setFromMatrix3(e){let t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,n){return this.determinantAffine()===0?(e.set(1,0,0),t.set(0,1,0),n.set(0,0,1),this):(e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this)}makeBasis(e,t,n){return this.set(e.x,t.x,n.x,0,e.y,t.y,n.y,0,e.z,t.z,n.z,0,0,0,0,1),this}extractRotation(e){if(e.determinantAffine()===0)return this.identity();let t=this.elements,n=e.elements,r=1/lr.setFromMatrixColumn(e,0).length(),i=1/lr.setFromMatrixColumn(e,1).length(),a=1/lr.setFromMatrixColumn(e,2).length();return t[0]=n[0]*r,t[1]=n[1]*r,t[2]=n[2]*r,t[3]=0,t[4]=n[4]*i,t[5]=n[5]*i,t[6]=n[6]*i,t[7]=0,t[8]=n[8]*a,t[9]=n[9]*a,t[10]=n[10]*a,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){let t=this.elements,n=e.x,r=e.y,i=e.z,a=Math.cos(n),o=Math.sin(n),s=Math.cos(r),c=Math.sin(r),l=Math.cos(i),u=Math.sin(i);if(e.order===`XYZ`){let e=a*l,n=a*u,r=o*l,i=o*u;t[0]=s*l,t[4]=-s*u,t[8]=c,t[1]=n+r*c,t[5]=e-i*c,t[9]=-o*s,t[2]=i-e*c,t[6]=r+n*c,t[10]=a*s}else if(e.order===`YXZ`){let e=s*l,n=s*u,r=c*l,i=c*u;t[0]=e+i*o,t[4]=r*o-n,t[8]=a*c,t[1]=a*u,t[5]=a*l,t[9]=-o,t[2]=n*o-r,t[6]=i+e*o,t[10]=a*s}else if(e.order===`ZXY`){let e=s*l,n=s*u,r=c*l,i=c*u;t[0]=e-i*o,t[4]=-a*u,t[8]=r+n*o,t[1]=n+r*o,t[5]=a*l,t[9]=i-e*o,t[2]=-a*c,t[6]=o,t[10]=a*s}else if(e.order===`ZYX`){let e=a*l,n=a*u,r=o*l,i=o*u;t[0]=s*l,t[4]=r*c-n,t[8]=e*c+i,t[1]=s*u,t[5]=i*c+e,t[9]=n*c-r,t[2]=-c,t[6]=o*s,t[10]=a*s}else if(e.order===`YZX`){let e=a*s,n=a*c,r=o*s,i=o*c;t[0]=s*l,t[4]=i-e*u,t[8]=r*u+n,t[1]=u,t[5]=a*l,t[9]=-o*l,t[2]=-c*l,t[6]=n*u+r,t[10]=e-i*u}else if(e.order===`XZY`){let e=a*s,n=a*c,r=o*s,i=o*c;t[0]=s*l,t[4]=-u,t[8]=c*l,t[1]=e*u+i,t[5]=a*l,t[9]=n*u-r,t[2]=r*u-n,t[6]=o*l,t[10]=i*u+e}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(dr,e,fr)}lookAt(e,t,n){let r=this.elements;return hr.subVectors(e,t),hr.lengthSq()===0&&(hr.z=1),hr.normalize(),pr.crossVectors(n,hr),pr.lengthSq()===0&&(Math.abs(n.z)===1?hr.x+=1e-4:hr.z+=1e-4,hr.normalize(),pr.crossVectors(n,hr)),pr.normalize(),mr.crossVectors(hr,pr),r[0]=pr.x,r[4]=mr.x,r[8]=hr.x,r[1]=pr.y,r[5]=mr.y,r[9]=hr.y,r[2]=pr.z,r[6]=mr.z,r[10]=hr.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,r=t.elements,i=this.elements,a=n[0],o=n[4],s=n[8],c=n[12],l=n[1],u=n[5],d=n[9],f=n[13],p=n[2],m=n[6],h=n[10],g=n[14],_=n[3],v=n[7],y=n[11],b=n[15],x=r[0],S=r[4],C=r[8],w=r[12],T=r[1],E=r[5],D=r[9],O=r[13],k=r[2],A=r[6],j=r[10],M=r[14],N=r[3],ee=r[7],P=r[11],F=r[15];return i[0]=a*x+o*T+s*k+c*N,i[4]=a*S+o*E+s*A+c*ee,i[8]=a*C+o*D+s*j+c*P,i[12]=a*w+o*O+s*M+c*F,i[1]=l*x+u*T+d*k+f*N,i[5]=l*S+u*E+d*A+f*ee,i[9]=l*C+u*D+d*j+f*P,i[13]=l*w+u*O+d*M+f*F,i[2]=p*x+m*T+h*k+g*N,i[6]=p*S+m*E+h*A+g*ee,i[10]=p*C+m*D+h*j+g*P,i[14]=p*w+m*O+h*M+g*F,i[3]=_*x+v*T+y*k+b*N,i[7]=_*S+v*E+y*A+b*ee,i[11]=_*C+v*D+y*j+b*P,i[15]=_*w+v*O+y*M+b*F,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[4],r=e[8],i=e[12],a=e[1],o=e[5],s=e[9],c=e[13],l=e[2],u=e[6],d=e[10],f=e[14],p=e[3],m=e[7],h=e[11],g=e[15],_=s*f-c*d,v=o*f-c*u,y=o*d-s*u,b=a*f-c*l,x=a*d-s*l,S=a*u-o*l;return t*(m*_-h*v+g*y)-n*(p*_-h*b+g*x)+r*(p*v-m*b+g*S)-i*(p*y-m*x+h*S)}determinantAffine(){let e=this.elements,t=e[0],n=e[4],r=e[8],i=e[1],a=e[5],o=e[9],s=e[2],c=e[6],l=e[10];return t*(a*l-o*c)-n*(i*l-o*s)+r*(i*c-a*s)}transpose(){let e=this.elements,t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,n){let r=this.elements;return e.isVector3?(r[12]=e.x,r[13]=e.y,r[14]=e.z):(r[12]=e,r[13]=t,r[14]=n),this}invert(){let e=this.elements,t=e[0],n=e[1],r=e[2],i=e[3],a=e[4],o=e[5],s=e[6],c=e[7],l=e[8],u=e[9],d=e[10],f=e[11],p=e[12],m=e[13],h=e[14],g=e[15],_=t*o-n*a,v=t*s-r*a,y=t*c-i*a,b=n*s-r*o,x=n*c-i*o,S=r*c-i*s,C=l*m-u*p,w=l*h-d*p,T=l*g-f*p,E=u*h-d*m,D=u*g-f*m,O=d*g-f*h,k=_*O-v*D+y*E+b*T-x*w+S*C;if(k===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let A=1/k;return e[0]=(o*O-s*D+c*E)*A,e[1]=(r*D-n*O-i*E)*A,e[2]=(m*S-h*x+g*b)*A,e[3]=(d*x-u*S-f*b)*A,e[4]=(s*T-a*O-c*w)*A,e[5]=(t*O-r*T+i*w)*A,e[6]=(h*y-p*S-g*v)*A,e[7]=(l*S-d*y+f*v)*A,e[8]=(a*D-o*T+c*C)*A,e[9]=(n*T-t*D-i*C)*A,e[10]=(p*x-m*y+g*_)*A,e[11]=(u*y-l*x-f*_)*A,e[12]=(o*w-a*E-s*C)*A,e[13]=(t*E-n*w+r*C)*A,e[14]=(m*v-p*b-h*_)*A,e[15]=(l*b-u*v+d*_)*A,this}scale(e){let t=this.elements,n=e.x,r=e.y,i=e.z;return t[0]*=n,t[4]*=r,t[8]*=i,t[1]*=n,t[5]*=r,t[9]*=i,t[2]*=n,t[6]*=r,t[10]*=i,t[3]*=n,t[7]*=r,t[11]*=i,this}getMaxScaleOnAxis(){let e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],n=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],r=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,n,r))}makeTranslation(e,t,n){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,n,0,0,0,1),this}makeRotationX(e){let t=Math.cos(e),n=Math.sin(e);return this.set(1,0,0,0,0,t,-n,0,0,n,t,0,0,0,0,1),this}makeRotationY(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,0,n,0,0,1,0,0,-n,0,t,0,0,0,0,1),this}makeRotationZ(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,0,n,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){let n=Math.cos(t),r=Math.sin(t),i=1-n,a=e.x,o=e.y,s=e.z,c=i*a,l=i*o;return this.set(c*a+n,c*o-r*s,c*s+r*o,0,c*o+r*s,l*o+n,l*s-r*a,0,c*s-r*o,l*s+r*a,i*s*s+n,0,0,0,0,1),this}makeScale(e,t,n){return this.set(e,0,0,0,0,t,0,0,0,0,n,0,0,0,0,1),this}makeShear(e,t,n,r,i,a){return this.set(1,n,i,0,e,1,a,0,t,r,1,0,0,0,0,1),this}compose(e,t,n){let r=this.elements,i=t._x,a=t._y,o=t._z,s=t._w,c=i+i,l=a+a,u=o+o,d=i*c,f=i*l,p=i*u,m=a*l,h=a*u,g=o*u,_=s*c,v=s*l,y=s*u,b=n.x,x=n.y,S=n.z;return r[0]=(1-(m+g))*b,r[1]=(f+y)*b,r[2]=(p-v)*b,r[3]=0,r[4]=(f-y)*x,r[5]=(1-(d+g))*x,r[6]=(h+_)*x,r[7]=0,r[8]=(p+v)*S,r[9]=(h-_)*S,r[10]=(1-(d+m))*S,r[11]=0,r[12]=e.x,r[13]=e.y,r[14]=e.z,r[15]=1,this}decompose(e,t,n){let r=this.elements;e.x=r[12],e.y=r[13],e.z=r[14];let i=this.determinantAffine();if(i===0)return n.set(1,1,1),t.identity(),this;let a=lr.set(r[0],r[1],r[2]).length(),o=lr.set(r[4],r[5],r[6]).length(),s=lr.set(r[8],r[9],r[10]).length();i<0&&(a=-a),ur.copy(this);let c=1/a,l=1/o,u=1/s;return ur.elements[0]*=c,ur.elements[1]*=c,ur.elements[2]*=c,ur.elements[4]*=l,ur.elements[5]*=l,ur.elements[6]*=l,ur.elements[8]*=u,ur.elements[9]*=u,ur.elements[10]*=u,t.setFromRotationMatrix(ur),n.x=a,n.y=o,n.z=s,this}makePerspective(e,t,n,r,i,a,o=en,s=!1){let c=this.elements,l=2*i/(t-e),u=2*i/(n-r),d=(t+e)/(t-e),f=(n+r)/(n-r),p,m;if(s)p=i/(a-i),m=a*i/(a-i);else if(o===2e3)p=-(a+i)/(a-i),m=-2*a*i/(a-i);else if(o===2001)p=-a/(a-i),m=-a*i/(a-i);else throw Error(`THREE.Matrix4.makePerspective(): Invalid coordinate system: `+o);return c[0]=l,c[4]=0,c[8]=d,c[12]=0,c[1]=0,c[5]=u,c[9]=f,c[13]=0,c[2]=0,c[6]=0,c[10]=p,c[14]=m,c[3]=0,c[7]=0,c[11]=-1,c[15]=0,this}makeOrthographic(e,t,n,r,i,a,o=en,s=!1){let c=this.elements,l=2/(t-e),u=2/(n-r),d=-(t+e)/(t-e),f=-(n+r)/(n-r),p,m;if(s)p=1/(a-i),m=a/(a-i);else if(o===2e3)p=-2/(a-i),m=-(a+i)/(a-i);else if(o===2001)p=-1/(a-i),m=-i/(a-i);else throw Error(`THREE.Matrix4.makeOrthographic(): Invalid coordinate system: `+o);return c[0]=l,c[4]=0,c[8]=0,c[12]=d,c[1]=0,c[5]=u,c[9]=0,c[13]=f,c[2]=0,c[6]=0,c[10]=p,c[14]=m,c[3]=0,c[7]=0,c[11]=0,c[15]=1,this}equals(e){let t=this.elements,n=e.elements;for(let e=0;e<16;e++)if(t[e]!==n[e])return!1;return!0}fromArray(e,t=0){for(let n=0;n<16;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e[t+9]=n[9],e[t+10]=n[10],e[t+11]=n[11],e[t+12]=n[12],e[t+13]=n[13],e[t+14]=n[14],e[t+15]=n[15],e}},lr=new J,ur=new cr,dr=new J(0,0,0),fr=new J(1,1,1),pr=new J,mr=new J,hr=new J,gr=new cr,_r=new Bn,vr=class e{constructor(t=0,n=0,r=0,i=e.DEFAULT_ORDER){this.isEuler=!0,this._x=t,this._y=n,this._z=r,this._order=i}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,n,r=this._order){return this._x=e,this._y=t,this._z=n,this._order=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,n=!0){let r=e.elements,i=r[0],a=r[4],o=r[8],s=r[1],c=r[5],l=r[9],u=r[2],d=r[6],f=r[10];switch(t){case`XYZ`:this._y=Math.asin(K(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-l,f),this._z=Math.atan2(-a,i)):(this._x=Math.atan2(d,c),this._z=0);break;case`YXZ`:this._x=Math.asin(-K(l,-1,1)),Math.abs(l)<.9999999?(this._y=Math.atan2(o,f),this._z=Math.atan2(s,c)):(this._y=Math.atan2(-u,i),this._z=0);break;case`ZXY`:this._x=Math.asin(K(d,-1,1)),Math.abs(d)<.9999999?(this._y=Math.atan2(-u,f),this._z=Math.atan2(-a,c)):(this._y=0,this._z=Math.atan2(s,i));break;case`ZYX`:this._y=Math.asin(-K(u,-1,1)),Math.abs(u)<.9999999?(this._x=Math.atan2(d,f),this._z=Math.atan2(s,i)):(this._x=0,this._z=Math.atan2(-a,c));break;case`YZX`:this._z=Math.asin(K(s,-1,1)),Math.abs(s)<.9999999?(this._x=Math.atan2(-l,c),this._y=Math.atan2(-u,i)):(this._x=0,this._y=Math.atan2(o,f));break;case`XZY`:this._z=Math.asin(-K(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(d,c),this._y=Math.atan2(o,i)):(this._x=Math.atan2(-l,f),this._y=0);break;default:W(`Euler: .setFromRotationMatrix() encountered an unknown order: `+t)}return this._order=t,n===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,n){return gr.makeRotationFromQuaternion(e),this.setFromRotationMatrix(gr,t,n)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return _r.setFromEuler(this),this.setFromQuaternion(_r,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};vr.DEFAULT_ORDER=`XYZ`;var yr=class{constructor(){this.mask=1}set(e){this.mask=1<<e>>>0}enable(e){this.mask|=1<<e}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e}disable(e){this.mask&=~(1<<e)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return!!(this.mask&1<<e)}},br=0,xr=new J,Sr=new Bn,Cr=new cr,wr=new J,Tr=new J,Er=new J,Dr=new Bn,Or=new J(1,0,0),kr=new J(0,1,0),Ar=new J(0,0,1),jr={type:`added`},Mr={type:`removed`},Nr={type:`childadded`,child:null},Pr={type:`childremoved`,child:null},Fr=class e extends fn{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:br++}),this.uuid=_n(),this.name=``,this.type=`Object3D`,this.parent=null,this.children=[],this.up=e.DEFAULT_UP.clone();let t=new J,n=new vr,r=new Bn,i=new J(1,1,1);function a(){r.setFromEuler(n,!1)}function o(){n.setFromQuaternion(r,void 0,!1)}n._onChange(a),r._onChange(o),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:t},rotation:{configurable:!0,enumerable:!0,value:n},quaternion:{configurable:!0,enumerable:!0,value:r},scale:{configurable:!0,enumerable:!0,value:i},modelViewMatrix:{value:new cr},normalMatrix:{value:new Y}}),this.matrix=new cr,this.matrixWorld=new cr,this.matrixAutoUpdate=e.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=e.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new yr,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.static=!1,this.userData={},this.pivot=null}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale),this.pivot!==null&&this.position.copy(this.pivot).applyMatrix4(this.matrix).sub(this.pivot)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return Sr.setFromAxisAngle(e,t),this.quaternion.multiply(Sr),this}rotateOnWorldAxis(e,t){return Sr.setFromAxisAngle(e,t),this.quaternion.premultiply(Sr),this}rotateX(e){return this.rotateOnAxis(Or,e)}rotateY(e){return this.rotateOnAxis(kr,e)}rotateZ(e){return this.rotateOnAxis(Ar,e)}translateOnAxis(e,t){return xr.copy(e).applyQuaternion(this.quaternion),this.position.add(xr.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(Or,e)}translateY(e){return this.translateOnAxis(kr,e)}translateZ(e){return this.translateOnAxis(Ar,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(Cr.copy(this.matrixWorld).invert())}lookAt(e,t,n){e.isVector3?wr.copy(e):wr.set(e,t,n);let r=this.parent;this.updateWorldMatrix(!0,!1),Tr.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?Cr.lookAt(Tr,wr,this.up):Cr.lookAt(wr,Tr,this.up),this.quaternion.setFromRotationMatrix(Cr),r&&(Cr.extractRotation(r.matrixWorld),Sr.setFromRotationMatrix(Cr),this.quaternion.premultiply(Sr.invert()))}add(e){if(arguments.length>1){for(let e=0;e<arguments.length;e++)this.add(arguments[e]);return this}return e===this?(G(`Object3D.add: object can't be added as a child of itself.`,e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(jr),Nr.child=e,this.dispatchEvent(Nr),Nr.child=null):G(`Object3D.add: object not an instance of THREE.Object3D.`,e),this)}remove(e){if(arguments.length>1){for(let e=0;e<arguments.length;e++)this.remove(arguments[e]);return this}let t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(Mr),Pr.child=e,this.dispatchEvent(Pr),Pr.child=null),this}removeFromParent(){let e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),Cr.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),Cr.multiply(e.parent.matrixWorld)),e.applyMatrix4(Cr),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(jr),Nr.child=e,this.dispatchEvent(Nr),Nr.child=null,this}getObjectById(e){return this.getObjectByProperty(`id`,e)}getObjectByName(e){return this.getObjectByProperty(`name`,e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let n=0,r=this.children.length;n<r;n++){let r=this.children[n].getObjectByProperty(e,t);if(r!==void 0)return r}}getObjectsByProperty(e,t,n=[]){this[e]===t&&n.push(this);let r=this.children;for(let i=0,a=r.length;i<a;i++)r[i].getObjectsByProperty(e,t,n);return n}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Tr,e,Er),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Tr,Dr,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);let t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}intersectsFrustum(){return!0}traverse(e){e(this);let t=this.children;for(let n=0,r=t.length;n<r;n++)t[n].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);let t=this.children;for(let n=0,r=t.length;n<r;n++)t[n].traverseVisible(e)}traverseAncestors(e){let t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale);let e=this.pivot;if(e!==null){let t=e.x,n=e.y,r=e.z,i=this.matrix.elements;i[12]+=t-i[0]*t-i[4]*n-i[8]*r,i[13]+=n-i[1]*t-i[5]*n-i[9]*r,i[14]+=r-i[2]*t-i[6]*n-i[10]*r}this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);let t=this.children;for(let n=0,r=t.length;n<r;n++)t[n].updateMatrixWorld(e)}updateWorldMatrix(e,t,n=!1){let r=this.parent;if(e===!0&&r!==null&&r.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||n)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,n=!0),t===!0){let e=this.children;for(let t=0,r=e.length;t<r;t++)e[t].updateWorldMatrix(!1,!0,n)}}toJSON(e){let t=e===void 0||typeof e==`string`,n={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.7,type:`Object`,generator:`Object3D.toJSON`});let r={};r.uuid=this.uuid,r.type=this.type,r.name=this.name,r.castShadow=this.castShadow,r.receiveShadow=this.receiveShadow,r.visible=this.visible,r.frustumCulled=this.frustumCulled,r.renderOrder=this.renderOrder,r.static=this.static,r.matrixAutoUpdate=this.matrixAutoUpdate,Object.keys(this.userData).length>0&&(r.userData=this.userData),r.layers=this.layers.mask,r.matrix=this.matrix.toArray(),r.up=this.up.toArray(),this.pivot!==null&&(r.pivot=this.pivot.toArray()),this.morphTargetDictionary!==void 0&&(r.morphTargetDictionary=Object.assign({},this.morphTargetDictionary)),this.morphTargetInfluences!==void 0&&(r.morphTargetInfluences=this.morphTargetInfluences.slice()),this.isInstancedMesh&&(r.type=`InstancedMesh`,r.count=this.count,r.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(r.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(r.type=`BatchedMesh`,r.perObjectFrustumCulled=this.perObjectFrustumCulled,r.sortObjects=this.sortObjects,r.drawRanges=this._drawRanges,r.reservedRanges=this._reservedRanges,r.geometryInfo=this._geometryInfo.map(e=>({...e,boundingBox:e.boundingBox?e.boundingBox.toJSON():void 0,boundingSphere:e.boundingSphere?e.boundingSphere.toJSON():void 0})),r.instanceInfo=this._instanceInfo.map(e=>({...e})),r.availableInstanceIds=this._availableInstanceIds.slice(),r.availableGeometryIds=this._availableGeometryIds.slice(),r.nextIndexStart=this._nextIndexStart,r.nextVertexStart=this._nextVertexStart,r.geometryCount=this._geometryCount,r.maxInstanceCount=this._maxInstanceCount,r.maxVertexCount=this._maxVertexCount,r.maxIndexCount=this._maxIndexCount,r.geometryInitialized=this._geometryInitialized,r.matricesTexture=this._matricesTexture.toJSON(e),r.indirectTexture=this._indirectTexture.toJSON(e),this._colorsTexture!==null&&(r.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(r.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(r.boundingBox=this.boundingBox.toJSON()));function i(t,n){return t[n.uuid]===void 0&&(t[n.uuid]=n.toJSON(e)),n.uuid}if(this.isScene)this.background&&(this.background.isColor?r.background=this.background.toJSON():this.background.isTexture&&(r.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(r.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){r.geometry=i(e.geometries,this.geometry);let t=this.geometry.parameters;if(t!==void 0&&t.shapes!==void 0){let n=t.shapes;if(Array.isArray(n))for(let t=0,r=n.length;t<r;t++){let r=n[t];i(e.shapes,r)}else i(e.shapes,n)}}if(this.isSkinnedMesh&&(r.bindMode=this.bindMode,r.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(i(e.skeletons,this.skeleton),r.skeleton=this.skeleton.uuid)),this.material!==void 0){if(Array.isArray(this.material)){let t=[];for(let n=0,r=this.material.length;n<r;n++)t.push(i(e.materials,this.material[n]));r.material=t}else r.material=i(e.materials,this.material)}if(this.children.length>0){r.children=[];for(let t=0;t<this.children.length;t++)r.children.push(this.children[t].toJSON(e).object)}if(this.animations.length>0){r.animations=[];for(let t=0;t<this.animations.length;t++){let n=this.animations[t];r.animations.push(i(e.animations,n))}}if(t){let t=a(e.geometries),r=a(e.materials),i=a(e.textures),o=a(e.images),s=a(e.shapes),c=a(e.skeletons),l=a(e.animations),u=a(e.nodes);t.length>0&&(n.geometries=t),r.length>0&&(n.materials=r),i.length>0&&(n.textures=i),o.length>0&&(n.images=o),s.length>0&&(n.shapes=s),c.length>0&&(n.skeletons=c),l.length>0&&(n.animations=l),u.length>0&&(n.nodes=u)}return n.object=r,n;function a(e){let t=[];for(let n in e){let r=e[n];delete r.metadata,t.push(r)}return t}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.pivot=e.pivot===null?null:e.pivot.clone(),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.static=e.static,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let t=0;t<e.children.length;t++){let n=e.children[t];this.add(n.clone())}return this}dispose(){this.dispatchEvent({type:`dispose`})}};Fr.DEFAULT_UP=new J(0,1,0),Fr.DEFAULT_MATRIX_AUTO_UPDATE=!0,Fr.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var Ir=class extends Fr{constructor(){super(),this.isGroup=!0,this.type=`Group`}},Lr={type:`move`},Rr=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new Ir,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new Ir,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new J,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new J),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new Ir,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new J,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new J,this._grip.eventsEnabled=!1),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){let t=this._hand;if(t)for(let n of e.hand.values())this._getHandJoint(t,n)}return this.dispatchEvent({type:`connected`,data:e}),this}disconnect(e){return this.dispatchEvent({type:`disconnected`,data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,n){let r=null,i=null,a=null,o=this._targetRay,s=this._grip,c=this._hand;if(e&&t.session.visibilityState!==`visible-blurred`){if(c&&e.hand){a=!0;for(let r of e.hand.values()){let e=t.getJointPose(r,n),i=this._getHandJoint(c,r);e!==null&&(i.matrix.fromArray(e.transform.matrix),i.matrix.decompose(i.position,i.quaternion,i.scale),i.matrixWorldNeedsUpdate=!0,i.jointRadius=e.radius),i.visible=e!==null}let r=c.joints[`index-finger-tip`],i=c.joints[`thumb-tip`],o=r.position.distanceTo(i.position);c.inputState.pinching&&o>.025?(c.inputState.pinching=!1,this.dispatchEvent({type:`pinchend`,handedness:e.handedness,target:this})):!c.inputState.pinching&&o<=.015&&(c.inputState.pinching=!0,this.dispatchEvent({type:`pinchstart`,handedness:e.handedness,target:this}))}else s!==null&&e.gripSpace&&(i=t.getPose(e.gripSpace,n),i!==null&&(s.matrix.fromArray(i.transform.matrix),s.matrix.decompose(s.position,s.quaternion,s.scale),s.matrixWorldNeedsUpdate=!0,i.linearVelocity?(s.hasLinearVelocity=!0,s.linearVelocity.copy(i.linearVelocity)):s.hasLinearVelocity=!1,i.angularVelocity?(s.hasAngularVelocity=!0,s.angularVelocity.copy(i.angularVelocity)):s.hasAngularVelocity=!1,s.eventsEnabled&&s.dispatchEvent({type:`gripUpdated`,data:e,target:this})));o!==null&&(r=t.getPose(e.targetRaySpace,n),r===null&&i!==null&&(r=i),r!==null&&(o.matrix.fromArray(r.transform.matrix),o.matrix.decompose(o.position,o.quaternion,o.scale),o.matrixWorldNeedsUpdate=!0,r.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(r.linearVelocity)):o.hasLinearVelocity=!1,r.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(r.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent(Lr)))}return o!==null&&(o.visible=r!==null),s!==null&&(s.visible=i!==null),c!==null&&(c.visible=a!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){let n=new Ir;n.matrixAutoUpdate=!1,n.visible=!1,e.joints[t.jointName]=n,e.add(n)}return e.joints[t.jointName]}},zr={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},Br={h:0,s:0,l:0},Vr={h:0,s:0,l:0};function Hr(e,t,n){return n<0&&(n+=1),n>1&&--n,n<1/6?e+(t-e)*6*n:n<1/2?t:n<2/3?e+(t-e)*6*(2/3-n):e}var Z=class{constructor(e,t,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,n)}set(e,t,n){if(t===void 0&&n===void 0){let t=e;t&&t.isColor?this.copy(t):typeof t==`number`?this.setHex(t):typeof t==`string`&&this.setStyle(t)}else this.setRGB(e,t,n);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=qt){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,X.colorSpaceToWorking(this,t),this}setRGB(e,t,n,r=X.workingColorSpace){return this.r=e,this.g=t,this.b=n,X.colorSpaceToWorking(this,r),this}setHSL(e,t,n,r=X.workingColorSpace){if(e=vn(e,1),t=K(t,0,1),n=K(n,0,1),t===0)this.r=this.g=this.b=n;else{let r=n<=.5?n*(1+t):n+t-n*t,i=2*n-r;this.r=Hr(i,r,e+1/3),this.g=Hr(i,r,e),this.b=Hr(i,r,e-1/3)}return X.colorSpaceToWorking(this,r),this}setStyle(e,t=qt){function n(t){t!==void 0&&parseFloat(t)<1&&W(`Color: Alpha component of `+e+` will be ignored.`)}let r;if(r=/^(\w+)\(([^\)]*)\)/.exec(e)){let i,a=r[1],o=r[2];switch(a){case`rgb`:case`rgba`:if(i=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d+(?:\.\d+)?|\.\d+)\s*)?$/.exec(o))return n(i[4]),this.setRGB(Math.min(255,parseInt(i[1],10))/255,Math.min(255,parseInt(i[2],10))/255,Math.min(255,parseInt(i[3],10))/255,t);if(i=/^\s*(\d+(?:\.\d+)?|\.\d+)\%\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*(?:,\s*(\d+(?:\.\d+)?|\.\d+)\s*)?$/.exec(o))return n(i[4]),this.setRGB(Math.min(100,parseFloat(i[1]))/100,Math.min(100,parseFloat(i[2]))/100,Math.min(100,parseFloat(i[3]))/100,t);break;case`hsl`:case`hsla`:if(i=/^\s*([+-]?(?:\d+(?:\.\d+)?|\.\d+))\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*(?:,\s*(\d+(?:\.\d+)?|\.\d+)\s*)?$/.exec(o))return n(i[4]),this.setHSL(parseFloat(i[1])/360,parseFloat(i[2])/100,parseFloat(i[3])/100,t);break;default:W(`Color: Unknown color model `+e)}}else if(r=/^\#([A-Fa-f\d]+)$/.exec(e)){let n=r[1],i=n.length;if(i===3)return this.setRGB(parseInt(n.charAt(0),16)/15,parseInt(n.charAt(1),16)/15,parseInt(n.charAt(2),16)/15,t);if(i===6)return this.setHex(parseInt(n,16),t);W(`Color: Invalid hex color `+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=qt){let n=zr[e.toLowerCase()];return n===void 0?W(`Color: Unknown color `+e):this.setHex(n,t),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=qn(e.r),this.g=qn(e.g),this.b=qn(e.b),this}copyLinearToSRGB(e){return this.r=Jn(e.r),this.g=Jn(e.g),this.b=Jn(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=qt){return X.workingToColorSpace(Ur.copy(this),e),Math.round(K(Ur.r*255,0,255))*65536+Math.round(K(Ur.g*255,0,255))*256+Math.round(K(Ur.b*255,0,255))}getHexString(e=qt){return(`000000`+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=X.workingColorSpace){X.workingToColorSpace(Ur.copy(this),t);let n=Ur.r,r=Ur.g,i=Ur.b,a=Math.max(n,r,i),o=Math.min(n,r,i),s,c,l=(o+a)/2;if(o===a)s=0,c=0;else{let e=a-o;switch(c=l<=.5?e/(a+o):e/(2-a-o),a){case n:s=(r-i)/e+(r<i?6:0);break;case r:s=(i-n)/e+2;break;case i:s=(n-r)/e+4}s/=6}return e.h=s,e.s=c,e.l=l,e}getRGB(e,t=X.workingColorSpace){return X.workingToColorSpace(Ur.copy(this),t),e.r=Ur.r,e.g=Ur.g,e.b=Ur.b,e}getStyle(e=qt){X.workingToColorSpace(Ur.copy(this),e);let t=Ur.r,n=Ur.g,r=Ur.b;return e===`srgb`?`rgb(${Math.round(t*255)},${Math.round(n*255)},${Math.round(r*255)})`:`color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${r.toFixed(3)})`}offsetHSL(e,t,n){return this.getHSL(Br),this.setHSL(Br.h+e,Br.s+t,Br.l+n)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,n){return this.r=e.r+(t.r-e.r)*n,this.g=e.g+(t.g-e.g)*n,this.b=e.b+(t.b-e.b)*n,this}lerpHSL(e,t){this.getHSL(Br),e.getHSL(Vr);let n=xn(Br.h,Vr.h,t),r=xn(Br.s,Vr.s,t),i=xn(Br.l,Vr.l,t);return this.setHSL(n,r,i),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){let t=this.r,n=this.g,r=this.b,i=e.elements;return this.r=i[0]*t+i[3]*n+i[6]*r,this.g=i[1]*t+i[4]*n+i[7]*r,this.b=i[2]*t+i[5]*n+i[8]*r,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},Ur=new Z;Z.NAMES=zr;var Wr=class extends Fr{constructor(){super(),this.isScene=!0,this.type=`Scene`,this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new vr,this.environmentIntensity=1,this.environmentRotation=new vr,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<`u`&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent(`observe`,{detail:this}))}copy(e,t){return super.copy(e,t),this.background=e.background===null?null:e.background.clone(),this.environment=e.environment===null?null:e.environment.clone(),this.fog=e.fog===null?null:e.fog.clone(),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),this.overrideMaterial=e.overrideMaterial===null?null:e.overrideMaterial.clone(),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){let t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),t.object.backgroundBlurriness=this.backgroundBlurriness,t.object.backgroundIntensity=this.backgroundIntensity,t.object.backgroundRotation=this.backgroundRotation.toArray(),t.object.environmentIntensity=this.environmentIntensity,t.object.environmentRotation=this.environmentRotation.toArray(),t}},Gr=new J,Kr=new J,qr=new J,Jr=new J,Yr=new J,Xr=new J,Zr=new J,Qr=new J,$r=new J,ei=new J,ti=new rr,ni=new rr,ri=new rr,ii=class e{constructor(e=new J,t=new J,n=new J){this.a=e,this.b=t,this.c=n}static getNormal(e,t,n,r){r.subVectors(n,t),Gr.subVectors(e,t),r.cross(Gr);let i=r.lengthSq();return i>0?r.multiplyScalar(1/Math.sqrt(i)):r.set(0,0,0)}static getBarycoord(e,t,n,r,i){Gr.subVectors(r,t),Kr.subVectors(n,t),qr.subVectors(e,t);let a=Gr.dot(Gr),o=Gr.dot(Kr),s=Gr.dot(qr),c=Kr.dot(Kr),l=Kr.dot(qr),u=a*c-o*o;if(u===0)return i.set(0,0,0),null;let d=1/u,f=(c*s-o*l)*d,p=(a*l-o*s)*d;return i.set(1-f-p,p,f)}static containsPoint(e,t,n,r){return this.getBarycoord(e,t,n,r,Jr)!==null&&Jr.x>=0&&Jr.y>=0&&Jr.x+Jr.y<=1}static getInterpolation(e,t,n,r,i,a,o,s){return this.getBarycoord(e,t,n,r,Jr)===null?(s.x=0,s.y=0,`z`in s&&(s.z=0),`w`in s&&(s.w=0),null):(s.setScalar(0),s.addScaledVector(i,Jr.x),s.addScaledVector(a,Jr.y),s.addScaledVector(o,Jr.z),s)}static getInterpolatedAttribute(e,t,n,r,i,a){return ti.setScalar(0),ni.setScalar(0),ri.setScalar(0),ti.fromBufferAttribute(e,t),ni.fromBufferAttribute(e,n),ri.fromBufferAttribute(e,r),a.setScalar(0),a.addScaledVector(ti,i.x),a.addScaledVector(ni,i.y),a.addScaledVector(ri,i.z),a}static isFrontFacing(e,t,n,r){return Gr.subVectors(n,t),Kr.subVectors(e,t),Gr.cross(Kr).dot(r)<0}set(e,t,n){return this.a.copy(e),this.b.copy(t),this.c.copy(n),this}setFromPointsAndIndices(e,t,n,r){return this.a.copy(e[t]),this.b.copy(e[n]),this.c.copy(e[r]),this}setFromAttributeAndIndices(e,t,n,r){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,n),this.c.fromBufferAttribute(e,r),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return Gr.subVectors(this.c,this.b),Kr.subVectors(this.a,this.b),Gr.cross(Kr).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(t){return e.getNormal(this.a,this.b,this.c,t)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(t,n){return e.getBarycoord(t,this.a,this.b,this.c,n)}getInterpolation(t,n,r,i,a){return e.getInterpolation(t,this.a,this.b,this.c,n,r,i,a)}containsPoint(t){return e.containsPoint(t,this.a,this.b,this.c)}isFrontFacing(t){return e.isFrontFacing(this.a,this.b,this.c,t)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){let n=this.a,r=this.b,i=this.c,a,o;Yr.subVectors(r,n),Xr.subVectors(i,n),Qr.subVectors(e,n);let s=Yr.dot(Qr),c=Xr.dot(Qr);if(s<=0&&c<=0)return t.copy(n);$r.subVectors(e,r);let l=Yr.dot($r),u=Xr.dot($r);if(l>=0&&u<=l)return t.copy(r);let d=s*u-l*c;if(d<=0&&s>=0&&l<=0&&s-l>0)return a=s/(s-l),t.copy(n).addScaledVector(Yr,a);ei.subVectors(e,i);let f=Yr.dot(ei),p=Xr.dot(ei);if(p>=0&&f<=p)return t.copy(i);let m=f*c-s*p;if(m<=0&&c>=0&&p<=0)return o=c/(c-p),t.copy(n).addScaledVector(Xr,o);let h=l*p-f*u;if(h<=0&&u-l>=0&&f-p>=0)return Zr.subVectors(i,r),o=(u-l)/(u-l+(f-p)),t.copy(r).addScaledVector(Zr,o);let g=1/(h+m+d);return a=m*g,o=d*g,t.copy(n).addScaledVector(Yr,a).addScaledVector(Xr,o)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}},ai=class{constructor(e=new J(1/0,1/0,1/0),t=new J(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t+=3)this.expandByPoint(si.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,n=e.count;t<n;t++)this.expandByPoint(si.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){let n=si.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(n),this.max.copy(e).add(n),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);let n=e.geometry;if(n!==void 0){let r=n.getAttribute(`position`);if(t===!0&&r!==void 0&&e.isInstancedMesh!==!0&&e.isBatchedMesh!==!0)for(let t=0,n=r.count;t<n;t++)e.isMesh===!0?e.getVertexPosition(t,si):si.fromBufferAttribute(r,t),si.applyMatrix4(e.matrixWorld),this.expandByPoint(si);else e.boundingBox===void 0?(n.boundingBox===null&&n.computeBoundingBox(),ci.copy(n.boundingBox)):(e.boundingBox===null&&e.computeBoundingBox(),ci.copy(e.boundingBox)),ci.applyMatrix4(e.matrixWorld),this.union(ci)}let r=e.children;for(let e=0,n=r.length;e<n;e++)this.expandByObject(r[e],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,si),si.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,n;return e.normal.x>0?(t=e.normal.x*this.min.x,n=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,n=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,n+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,n+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,n+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,n+=e.normal.z*this.min.z),t<=-e.constant&&n>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(hi),gi.subVectors(this.max,hi),li.subVectors(e.a,hi),ui.subVectors(e.b,hi),di.subVectors(e.c,hi),fi.subVectors(ui,li),pi.subVectors(di,ui),mi.subVectors(li,di);let t=[0,-fi.z,fi.y,0,-pi.z,pi.y,0,-mi.z,mi.y,fi.z,0,-fi.x,pi.z,0,-pi.x,mi.z,0,-mi.x,-fi.y,fi.x,0,-pi.y,pi.x,0,-mi.y,mi.x,0];return!yi(t,li,ui,di,gi)||(t=[1,0,0,0,1,0,0,0,1],!yi(t,li,ui,di,gi))?!1:(_i.crossVectors(fi,pi),t=[_i.x,_i.y,_i.z],yi(t,li,ui,di,gi))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,si).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(si).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()||(oi[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),oi[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),oi[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),oi[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),oi[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),oi[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),oi[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),oi[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(oi)),this}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(e){return this.min.fromArray(e.min),this.max.fromArray(e.max),this}},oi=[new J,new J,new J,new J,new J,new J,new J,new J],si=new J,ci=new ai,li=new J,ui=new J,di=new J,fi=new J,pi=new J,mi=new J,hi=new J,gi=new J,_i=new J,vi=new J;function yi(e,t,n,r,i){for(let a=0,o=e.length-3;a<=o;a+=3){vi.fromArray(e,a);let o=i.x*Math.abs(vi.x)+i.y*Math.abs(vi.y)+i.z*Math.abs(vi.z),s=t.dot(vi),c=n.dot(vi),l=r.dot(vi);if(Math.max(-Math.max(s,c,l),Math.min(s,c,l))>o)return!1}return!0}var bi=new J,xi=new q,Si=0,Ci=class extends fn{constructor(e,t,n=!1){if(super(),Array.isArray(e))throw TypeError(`THREE.BufferAttribute: array should be a Typed Array.`);this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:Si++}),this.name=``,this.array=e,this.itemSize=t,this.count=e===void 0?0:e.length/t,this.normalized=n,this.usage=Qt,this.updateRanges=[],this.gpuType=Be,this.version=0,this._normalizationScale=e===void 0?void 0:In(e)}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this._normalizationScale=e._normalizationScale,this}copyAt(e,t,n){e*=this.itemSize,n*=t.itemSize;for(let r=0,i=this.itemSize;r<i;r++)this.array[e+r]=t.array[n+r];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,n=this.count;t<n;t++)xi.fromBufferAttribute(this,t),xi.applyMatrix3(e),this.setXY(t,xi.x,xi.y);else if(this.itemSize===3)for(let t=0,n=this.count;t<n;t++)bi.fromBufferAttribute(this,t),bi.applyMatrix3(e),this.setXYZ(t,bi.x,bi.y,bi.z);return this}applyMatrix4(e){for(let t=0,n=this.count;t<n;t++)bi.fromBufferAttribute(this,t),bi.applyMatrix4(e),this.setXYZ(t,bi.x,bi.y,bi.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)bi.fromBufferAttribute(this,t),bi.applyNormalMatrix(e),this.setXYZ(t,bi.x,bi.y,bi.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)bi.fromBufferAttribute(this,t),bi.transformDirection(e),this.setXYZ(t,bi.x,bi.y,bi.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let n=this.array[e*this.itemSize+t];return this.normalized&&(n=this._denormalize(n)),n}setComponent(e,t,n){return this.normalized&&(n=this._normalize(n)),this.array[e*this.itemSize+t]=n,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=this._denormalize(t)),t}setX(e,t){return this.normalized&&(t=this._normalize(t)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=this._denormalize(t)),t}setY(e,t){return this.normalized&&(t=this._normalize(t)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=this._denormalize(t)),t}setZ(e,t){return this.normalized&&(t=this._normalize(t)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=this._denormalize(t)),t}setW(e,t){return this.normalized&&(t=this._normalize(t)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,n){return e*=this.itemSize,this.normalized&&(t=this._normalize(t),n=this._normalize(n)),this.array[e+0]=t,this.array[e+1]=n,this}setXYZ(e,t,n,r){return e*=this.itemSize,this.normalized&&(t=this._normalize(t),n=this._normalize(n),r=this._normalize(r)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=r,this}setXYZW(e,t,n,r,i){return e*=this.itemSize,this.normalized&&(t=this._normalize(t),n=this._normalize(n),r=this._normalize(r),i=this._normalize(i)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=r,this.array[e+3]=i,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return e.name=this.name,e.usage=this.usage,e.gpuType=this.gpuType,e}dispose(){this.dispatchEvent({type:`dispose`})}_denormalize(e){let t=this._normalizationScale;return t===void 0?Ln(e,this.array):Math.max(e/t,-1)}_normalize(e){let t=this._normalizationScale;return t===void 0?Rn(e,this.array):Math.round(e*t)}},wi=class extends Ci{constructor(e,t,n){super(new Uint16Array(e),t,n)}},Ti=class extends Ci{constructor(e,t,n){super(new Uint32Array(e),t,n)}},Ei=class extends Ci{constructor(e,t,n){super(new Float32Array(e),t,n)}},Di=new ai,Oi=new J,ki=new J,Ai=class{constructor(e=new J,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){let n=this.center;t===void 0?Di.setFromPoints(e).getCenter(n):n.copy(t);let r=0;for(let t=0,i=e.length;t<i;t++)r=Math.max(r,n.distanceToSquared(e[t]));return this.radius=Math.sqrt(r),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){let t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){let n=this.center.distanceToSquared(e);return t.copy(e),n>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius*=e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;Oi.subVectors(e,this.center);let t=Oi.lengthSq();if(t>this.radius*this.radius){let e=Math.sqrt(t),n=(e-this.radius)*.5;this.center.addScaledVector(Oi,n/e),this.radius+=n}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(ki.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(Oi.copy(e.center).add(ki)),this.expandByPoint(Oi.copy(e.center).sub(ki))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(e){return this.radius=e.radius,this.center.fromArray(e.center),this}},ji=0,Mi=new cr,Ni=new Fr,Pi=new J,Fi=new ai,Ii=new ai,Li=new J,Ri=class e extends fn{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:ji++}),this.uuid=_n(),this.name=``,this.type=`BufferGeometry`,this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={},this._transformed=!1}getIndex(){return this.index}setIndex(e){return this.index=Array.isArray(e)?new(tn(e)?Ti:wi)(e,1):e,this}setIndirect(e,t=0){return this.indirect=e,this.indirectOffset=t,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,n=0){this.groups.push({start:e,count:t,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){let t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);let n=this.attributes.normal;if(n!==void 0){let t=new Y().getNormalMatrix(e);n.applyNormalMatrix(t),n.needsUpdate=!0}let r=this.attributes.tangent;return r!==void 0&&(r.transformDirection(e),r.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this._transformed=!0,this}applyQuaternion(e){return Mi.makeRotationFromQuaternion(e),this.applyMatrix4(Mi),this}rotateX(e){return Mi.makeRotationX(e),this.applyMatrix4(Mi),this}rotateY(e){return Mi.makeRotationY(e),this.applyMatrix4(Mi),this}rotateZ(e){return Mi.makeRotationZ(e),this.applyMatrix4(Mi),this}translate(e,t,n){return Mi.makeTranslation(e,t,n),this.applyMatrix4(Mi),this}scale(e,t,n){return Mi.makeScale(e,t,n),this.applyMatrix4(Mi),this}lookAt(e){return Ni.lookAt(e),Ni.updateMatrix(),this.applyMatrix4(Ni.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Pi).negate(),this.translate(Pi.x,Pi.y,Pi.z),this}setFromPoints(e){let t=this.getAttribute(`position`);if(t===void 0){let t=[];for(let n=0,r=e.length;n<r;n++){let r=e[n];t.push(r.x,r.y,r.z||0)}this.setAttribute(`position`,new Ei(t,3))}else{let n=Math.min(e.length,t.count);for(let r=0;r<n;r++){let n=e[r];t.setXYZ(r,n.x,n.y,n.z||0)}e.length>t.count&&W(`BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry.`),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new ai);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute)G(`BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.`,this),this.boundingBox.set(new J(-1/0,-1/0,-1/0),new J(1/0,1/0,1/0));else{if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let e=0,n=t.length;e<n;e++){let n=t[e];Fi.setFromBufferAttribute(n),this.morphTargetsRelative?(Li.addVectors(this.boundingBox.min,Fi.min),this.boundingBox.expandByPoint(Li),Li.addVectors(this.boundingBox.max,Fi.max),this.boundingBox.expandByPoint(Li)):(this.boundingBox.expandByPoint(Fi.min),this.boundingBox.expandByPoint(Fi.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&G(`BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.`,this)}}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new Ai);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute)G(`BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.`,this),this.boundingSphere.set(new J,1/0);else if(e){let n=this.boundingSphere.center;if(Fi.setFromBufferAttribute(e),t)for(let e=0,n=t.length;e<n;e++){let n=t[e];Ii.setFromBufferAttribute(n),this.morphTargetsRelative?(Li.addVectors(Fi.min,Ii.min),Fi.expandByPoint(Li),Li.addVectors(Fi.max,Ii.max),Fi.expandByPoint(Li)):(Fi.expandByPoint(Ii.min),Fi.expandByPoint(Ii.max))}Fi.getCenter(n);let r=0;for(let t=0,i=e.count;t<i;t++)Li.fromBufferAttribute(e,t),r=Math.max(r,n.distanceToSquared(Li));if(t)for(let i=0,a=t.length;i<a;i++){let a=t[i],o=this.morphTargetsRelative;for(let t=0,i=a.count;t<i;t++)Li.fromBufferAttribute(a,t),o&&(Pi.fromBufferAttribute(e,t),Li.add(Pi)),r=Math.max(r,n.distanceToSquared(Li))}this.boundingSphere.radius=Math.sqrt(r),isNaN(this.boundingSphere.radius)&&G(`BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.`,this)}}computeTangents(){let e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){G(`BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)`);return}let n=t.position,r=t.normal,i=t.uv,a=this.getAttribute(`tangent`);(a===void 0||a.count!==n.count)&&(a=new Ci(new Float32Array(4*n.count),4),this.setAttribute(`tangent`,a));let o=[],s=[],c=new Uint8Array(n.count);for(let e=0;e<n.count;e++)o[e]=new J,s[e]=new J;let l=new J,u=new J,d=new J,f=new q,p=new q,m=new q,h=new J,g=new J;function _(e,t,r){c[e]=c[t]=c[r]=1,l.fromBufferAttribute(n,e),u.fromBufferAttribute(n,t),d.fromBufferAttribute(n,r),f.fromBufferAttribute(i,e),p.fromBufferAttribute(i,t),m.fromBufferAttribute(i,r),u.sub(l),d.sub(l),p.sub(f),m.sub(f);let a=1/(p.x*m.y-m.x*p.y);isFinite(a)&&(h.copy(u).multiplyScalar(m.y).addScaledVector(d,-p.y).multiplyScalar(a),g.copy(d).multiplyScalar(p.x).addScaledVector(u,-m.x).multiplyScalar(a),o[e].add(h),o[t].add(h),o[r].add(h),s[e].add(g),s[t].add(g),s[r].add(g))}let v=this.groups;v.length===0&&(v=[{start:0,count:e.count}]);for(let t=0,n=v.length;t<n;++t){let n=v[t],r=n.start,i=n.count;for(let t=r,n=r+i;t<n;t+=3)_(e.getX(t+0),e.getX(t+1),e.getX(t+2))}let y=new J,b=new J,x=new J,S=new J;function C(e){x.fromBufferAttribute(r,e),S.copy(x);let t=o[e];y.copy(t),y.sub(x.multiplyScalar(x.dot(t))).normalize(),b.crossVectors(S,t);let n=b.dot(s[e])<0?-1:1;a.setXYZW(e,y.x,y.y,y.z,n)}for(let e=0,t=n.count;e<t;++e)c[e]&&C(e);this._transformed=!0}computeVertexNormals(){let e=this.index,t=this.getAttribute(`position`);if(t!==void 0){let n=this.getAttribute(`normal`);if(n===void 0||n.count!==t.count)n=new Ci(new Float32Array(t.count*3),3),this.setAttribute(`normal`,n);else for(let e=0,t=n.count;e<t;e++)n.setXYZ(e,0,0,0);let r=new J,i=new J,a=new J,o=new J,s=new J,c=new J,l=new J,u=new J;if(e)for(let d=0,f=e.count;d<f;d+=3){let f=e.getX(d+0),p=e.getX(d+1),m=e.getX(d+2);r.fromBufferAttribute(t,f),i.fromBufferAttribute(t,p),a.fromBufferAttribute(t,m),l.subVectors(a,i),u.subVectors(r,i),l.cross(u),o.fromBufferAttribute(n,f),s.fromBufferAttribute(n,p),c.fromBufferAttribute(n,m),o.add(l),s.add(l),c.add(l),n.setXYZ(f,o.x,o.y,o.z),n.setXYZ(p,s.x,s.y,s.z),n.setXYZ(m,c.x,c.y,c.z)}else for(let e=0,o=t.count;e<o;e+=3)r.fromBufferAttribute(t,e+0),i.fromBufferAttribute(t,e+1),a.fromBufferAttribute(t,e+2),l.subVectors(a,i),u.subVectors(r,i),l.cross(u),n.setXYZ(e+0,l.x,l.y,l.z),n.setXYZ(e+1,l.x,l.y,l.z),n.setXYZ(e+2,l.x,l.y,l.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){let e=this.attributes.normal;for(let t=0,n=e.count;t<n;t++)Li.fromBufferAttribute(e,t),Li.normalize(),e.setXYZ(t,Li.x,Li.y,Li.z)}toNonIndexed(){function t(e,t){let n=e.array,r=e.itemSize,i=e.normalized,a=new n.constructor(t.length*r),o=0,s=0;for(let i=0,c=t.length;i<c;i++){o=e.isInterleavedBufferAttribute?t[i]*e.data.stride+e.offset:t[i]*r;for(let e=0;e<r;e++)a[s++]=n[o++]}return new Ci(a,r,i)}if(this.index===null)return W(`BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed.`),this;let n=new e,r=this.index.array,i=this.attributes;for(let e in i){let a=i[e],o=t(a,r);n.setAttribute(e,o)}let a=this.morphAttributes;for(let e in a){let i=[],o=a[e];for(let e=0,n=o.length;e<n;e++){let n=o[e],a=t(n,r);i.push(a)}n.morphAttributes[e]=i}n.morphTargetsRelative=this.morphTargetsRelative;let o=this.groups;for(let e=0,t=o.length;e<t;e++){let t=o[e];n.addGroup(t.start,t.count,t.materialIndex)}return n}toJSON(){let e={metadata:{version:4.7,type:`BufferGeometry`,generator:`BufferGeometry.toJSON`}};if(e.uuid=this.uuid,e.type=this.parameters!==void 0&&this._transformed===!0?`BufferGeometry`:this.type,e.name=this.name,Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0&&this._transformed!==!0){let t=this.parameters;for(let n in t)t[n]!==void 0&&(e[n]=t[n]);return e}e.data={attributes:{}};let t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});let n=this.attributes;for(let t in n){let r=n[t];e.data.attributes[t]=r.toJSON(e.data)}let r={},i=!1;for(let t in this.morphAttributes){let n=this.morphAttributes[t],a=[];for(let t=0,r=n.length;t<r;t++){let r=n[t];a.push(r.toJSON(e.data))}a.length>0&&(r[t]=a,i=!0)}i&&(e.data.morphAttributes=r,e.data.morphTargetsRelative=this.morphTargetsRelative);let a=this.groups;a.length>0&&(e.data.groups=JSON.parse(JSON.stringify(a)));let o=this.boundingSphere;return o!==null&&(e.data.boundingSphere=o.toJSON()),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let t={};this.name=e.name;let n=e.index;n!==null&&this.setIndex(n.clone());let r=e.attributes;for(let e in r){let n=r[e];this.setAttribute(e,n.clone(t))}let i=e.morphAttributes;for(let e in i){let n=[],r=i[e];for(let e=0,i=r.length;e<i;e++)n.push(r[e].clone(t));this.morphAttributes[e]=n}this.morphTargetsRelative=e.morphTargetsRelative;let a=e.groups;for(let e=0,t=a.length;e<t;e++){let t=a[e];this.addGroup(t.start,t.count,t.materialIndex)}let o=e.boundingBox;o!==null&&(this.boundingBox=o.clone());let s=e.boundingSphere;return s!==null&&(this.boundingSphere=s.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this._transformed=e._transformed,this}dispose(){this.dispatchEvent({type:`dispose`})}},zi=class{constructor(e,t){this.isInterleavedBuffer=!0,this.array=e,this.stride=t,this.count=e===void 0?0:e.length/t,this.usage=Qt,this.updateRanges=[],this.version=0,this.uuid=_n()}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.array=new e.array.constructor(e.array),this.count=e.count,this.stride=e.stride,this.usage=e.usage,this}copyAt(e,t,n){e*=this.stride,n*=t.stride;for(let r=0,i=this.stride;r<i;r++)this.array[e+r]=t.array[n+r];return this}set(e,t=0){return this.array.set(e,t),this}clone(e){e.arrayBuffers===void 0&&(e.arrayBuffers={});let t=Bi(this.array);e.arrayBuffers[t]===void 0&&(e.arrayBuffers[t]=this.array.slice(0).buffer);let n=new this.array.constructor(e.arrayBuffers[t]),r=new this.constructor(n,this.stride);return r.setUsage(this.usage),r}onUpload(e){return this.onUploadCallback=e,this}toJSON(e){e.arrayBuffers===void 0&&(e.arrayBuffers={});let t=Bi(this.array);e.arrayBuffers[t]===void 0&&(e.arrayBuffers[t]=Array.from(new Uint32Array(this.array.slice(0).buffer)));let n={uuid:this.uuid,buffer:t,type:this.array.constructor.name,stride:this.stride};return n.usage=this.usage,n}};function Bi(e){return e.buffer._uuid===void 0&&(e.buffer._uuid=_n()),e.byteOffset===0&&e.byteLength===e.buffer.byteLength?e.buffer._uuid:e.buffer._uuid+`:`+e.byteOffset+`:`+e.byteLength}var Vi=new J,Hi=class e{constructor(e,t,n,r=!1){this.isInterleavedBufferAttribute=!0,this.name=``,this.data=e,this.itemSize=t,this.offset=n,this.normalized=r,this._normalizationScale=e===void 0?void 0:In(e.array)}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(e){this.data.needsUpdate=e}applyMatrix4(e){for(let t=0,n=this.data.count;t<n;t++)Vi.fromBufferAttribute(this,t),Vi.applyMatrix4(e),this.setXYZ(t,Vi.x,Vi.y,Vi.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)Vi.fromBufferAttribute(this,t),Vi.applyNormalMatrix(e),this.setXYZ(t,Vi.x,Vi.y,Vi.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)Vi.fromBufferAttribute(this,t),Vi.transformDirection(e),this.setXYZ(t,Vi.x,Vi.y,Vi.z);return this}getComponent(e,t){let n=this.array[e*this.data.stride+this.offset+t];return this.normalized&&(n=this._denormalize(n)),n}setComponent(e,t,n){return this.normalized&&(n=this._normalize(n)),this.data.array[e*this.data.stride+this.offset+t]=n,this}setX(e,t){return this.normalized&&(t=this._normalize(t)),this.data.array[e*this.data.stride+this.offset]=t,this}setY(e,t){return this.normalized&&(t=this._normalize(t)),this.data.array[e*this.data.stride+this.offset+1]=t,this}setZ(e,t){return this.normalized&&(t=this._normalize(t)),this.data.array[e*this.data.stride+this.offset+2]=t,this}setW(e,t){return this.normalized&&(t=this._normalize(t)),this.data.array[e*this.data.stride+this.offset+3]=t,this}getX(e){let t=this.data.array[e*this.data.stride+this.offset];return this.normalized&&(t=this._denormalize(t)),t}getY(e){let t=this.data.array[e*this.data.stride+this.offset+1];return this.normalized&&(t=this._denormalize(t)),t}getZ(e){let t=this.data.array[e*this.data.stride+this.offset+2];return this.normalized&&(t=this._denormalize(t)),t}getW(e){let t=this.data.array[e*this.data.stride+this.offset+3];return this.normalized&&(t=this._denormalize(t)),t}setXY(e,t,n){return e=e*this.data.stride+this.offset,this.normalized&&(t=this._normalize(t),n=this._normalize(n)),this.data.array[e+0]=t,this.data.array[e+1]=n,this}setXYZ(e,t,n,r){return e=e*this.data.stride+this.offset,this.normalized&&(t=this._normalize(t),n=this._normalize(n),r=this._normalize(r)),this.data.array[e+0]=t,this.data.array[e+1]=n,this.data.array[e+2]=r,this}setXYZW(e,t,n,r,i){return e=e*this.data.stride+this.offset,this.normalized&&(t=this._normalize(t),n=this._normalize(n),r=this._normalize(r),i=this._normalize(i)),this.data.array[e+0]=t,this.data.array[e+1]=n,this.data.array[e+2]=r,this.data.array[e+3]=i,this}clone(t){if(t===void 0){sn(`InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.`);let e=[];for(let t=0;t<this.count;t++){let n=t*this.data.stride+this.offset;for(let t=0;t<this.itemSize;t++)e.push(this.data.array[n+t])}return new Ci(new this.array.constructor(e),this.itemSize,this.normalized)}return t.interleavedBuffers===void 0&&(t.interleavedBuffers={}),t.interleavedBuffers[this.data.uuid]===void 0&&(t.interleavedBuffers[this.data.uuid]=this.data.clone(t)),new e(t.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}toJSON(e){if(e===void 0){sn(`InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.`);let e=[];for(let t=0;t<this.count;t++){let n=t*this.data.stride+this.offset;for(let t=0;t<this.itemSize;t++)e.push(this.data.array[n+t])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:e,normalized:this.normalized}}return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.toJSON(e)),{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}_denormalize(e){let t=this._normalizationScale;return t===void 0?Ln(e,this.data.array):Math.max(e/t,-1)}_normalize(e){let t=this._normalizationScale;return t===void 0?Rn(e,this.data.array):Math.round(e*t)}},Ui=new J,Wi=new J,Gi=new Y,Ki=class{constructor(e=new J(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,n,r){return this.normal.set(e,t,n),this.constant=r,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,n){let r=Ui.subVectors(n,t).cross(Wi.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(r,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){let e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t,n=!0){let r=e.delta(Ui),i=this.normal.dot(r);if(i===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;let a=-(e.start.dot(this.normal)+this.constant)/i;return n===!0&&(a<0||a>1)?null:t.copy(e.start).addScaledVector(r,a)}intersectsLine(e){let t=this.distanceToPoint(e.start),n=this.distanceToPoint(e.end);return t<0&&n>0||n<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){let n=t||Gi.getNormalMatrix(e),r=this.coplanarPoint(Ui).applyMatrix4(e),i=this.normal.applyMatrix3(n).normalize();return this.constant=-r.dot(i),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}toJSON(){return{normal:this.normal.toArray(),constant:this.constant}}fromJSON(e){return this.normal.fromArray(e.normal),this.constant=e.constant,this}},qi=0,Ji=class extends fn{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:qi++}),this.uuid=_n(),this.name=``,this.type=`Material`,this.blending=1,this.side=0,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=204,this.blendDst=205,this.blendEquation=100,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new Z(0,0,0),this.blendAlpha=0,this.depthFunc=3,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=519,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Zt,this.stencilZFail=Zt,this.stencilZPass=Zt,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(let t in e){let n=e[t];if(n===void 0){W(`Material: parameter '${t}' has value of undefined.`);continue}let r=this[t];r===void 0?W(`Material: '${t}' is not a property of THREE.${this.type}.`):r&&r.isColor?r.set(n):r&&r.isVector2&&n&&n.isVector2||r&&r.isEuler&&n&&n.isEuler||r&&r.isVector3&&n&&n.isVector3?r.copy(n):this[t]=n}}toJSON(e){let t=e===void 0||typeof e==`string`;t&&(e={textures:{},images:{}});let n={metadata:{version:4.7,type:`Material`,generator:`Material.toJSON`}};n.uuid=this.uuid,n.type=this.type,n.blending=this.blending,n.side=this.side,n.shadowSide=this.shadowSide,n.vertexColors=this.vertexColors,n.opacity=this.opacity,n.transparent=this.transparent,n.blendSrc=this.blendSrc,n.blendDst=this.blendDst,n.blendEquation=this.blendEquation,n.blendSrcAlpha=this.blendSrcAlpha,n.blendDstAlpha=this.blendDstAlpha,n.blendEquationAlpha=this.blendEquationAlpha,n.blendColor=this.blendColor.getHex(),n.blendAlpha=this.blendAlpha,n.depthFunc=this.depthFunc,n.depthTest=this.depthTest,n.depthWrite=this.depthWrite,n.colorWrite=this.colorWrite,n.clipIntersection=this.clipIntersection,n.clipShadows=this.clipShadows,n.stencilWriteMask=this.stencilWriteMask,n.stencilFunc=this.stencilFunc,n.stencilRef=this.stencilRef,n.stencilFuncMask=this.stencilFuncMask,n.stencilFail=this.stencilFail,n.stencilZFail=this.stencilZFail,n.stencilZPass=this.stencilZPass,n.stencilWrite=this.stencilWrite,n.polygonOffset=this.polygonOffset,n.polygonOffsetFactor=this.polygonOffsetFactor,n.polygonOffsetUnits=this.polygonOffsetUnits,n.dithering=this.dithering,n.alphaTest=this.alphaTest,n.alphaHash=this.alphaHash,n.alphaToCoverage=this.alphaToCoverage,n.premultipliedAlpha=this.premultipliedAlpha,n.forceSinglePass=this.forceSinglePass,n.allowOverride=this.allowOverride,n.visible=this.visible,n.toneMapped=this.toneMapped,n.name=this.name,this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.diffuseRoughness!==void 0&&(n.diffuseRoughness=this.diffuseRoughness),this.diffuseRoughnessMap&&this.diffuseRoughnessMap.isTexture&&(n.diffuseRoughnessMap=this.diffuseRoughnessMap.toJSON(e).uuid),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(n.sheenColorMap=this.sheenColorMap.toJSON(e).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(n.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(e).uuid),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.retroreflectivity!==void 0&&(n.retroreflectivity=this.retroreflectivity),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessMinimum!==void 0&&(n.iridescenceThicknessMinimum=this.iridescenceThicknessMinimum),this.iridescenceThicknessMaximum!==void 0&&(n.iridescenceThicknessMaximum=this.iridescenceThicknessMaximum),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(e).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(e).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(e).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(e).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(e).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),Array.isArray(this.clippingPlanes)&&this.clippingPlanes.length>0&&(n.clippingPlanes=this.clippingPlanes.map(e=>e.toJSON())),this.rotation!==void 0&&(n.rotation=this.rotation),this.depthPacking!==void 0&&(n.depthPacking=this.depthPacking),this.linewidth!==void 0&&(n.linewidth=this.linewidth),this.linecap!==void 0&&(n.linecap=this.linecap),this.linejoin!==void 0&&(n.linejoin=this.linejoin),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.wireframe!==void 0&&(n.wireframe=this.wireframe),this.wireframeLinewidth!==void 0&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!==void 0&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!==void 0&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading!==void 0&&(n.flatShading=this.flatShading),this.fog!==void 0&&(n.fog=this.fog),Object.keys(this.userData).length>0&&(n.userData=this.userData);function r(e){let t=[];for(let n in e){let r=e[n];delete r.metadata,t.push(r)}return t}if(t){let t=r(e.textures),i=r(e.images);t.length>0&&(n.textures=t),i.length>0&&(n.images=i)}return n}fromJSON(e,t){if(e.uuid!==void 0&&(this.uuid=e.uuid),e.name!==void 0&&(this.name=e.name),e.color!==void 0&&this.color!==void 0&&this.color.setHex(e.color),e.roughness!==void 0&&(this.roughness=e.roughness),e.metalness!==void 0&&(this.metalness=e.metalness),e.sheen!==void 0&&(this.sheen=e.sheen),e.sheenColor!==void 0&&(this.sheenColor=new Z().setHex(e.sheenColor)),e.sheenRoughness!==void 0&&(this.sheenRoughness=e.sheenRoughness),e.emissive!==void 0&&this.emissive!==void 0&&this.emissive.setHex(e.emissive),e.specular!==void 0&&this.specular!==void 0&&this.specular.setHex(e.specular),e.specularIntensity!==void 0&&(this.specularIntensity=e.specularIntensity),e.specularColor!==void 0&&this.specularColor!==void 0&&this.specularColor.setHex(e.specularColor),e.shininess!==void 0&&(this.shininess=e.shininess),e.clearcoat!==void 0&&(this.clearcoat=e.clearcoat),e.clearcoatRoughness!==void 0&&(this.clearcoatRoughness=e.clearcoatRoughness),e.diffuseRoughness!==void 0&&(this.diffuseRoughness=e.diffuseRoughness),e.dispersion!==void 0&&(this.dispersion=e.dispersion),e.retroreflectivity!==void 0&&(this.retroreflectivity=e.retroreflectivity),e.iridescence!==void 0&&(this.iridescence=e.iridescence),e.iridescenceIOR!==void 0&&(this.iridescenceIOR=e.iridescenceIOR),e.iridescenceThicknessMinimum!==void 0&&(this.iridescenceThicknessMinimum=e.iridescenceThicknessMinimum),e.iridescenceThicknessMaximum!==void 0&&(this.iridescenceThicknessMaximum=e.iridescenceThicknessMaximum),e.iridescenceThicknessRange!==void 0&&(this.iridescenceThicknessMinimum=e.iridescenceThicknessRange[0],this.iridescenceThicknessMaximum=e.iridescenceThicknessRange[1]),e.transmission!==void 0&&(this.transmission=e.transmission),e.thickness!==void 0&&(this.thickness=e.thickness),e.attenuationDistance!==void 0&&(this.attenuationDistance=e.attenuationDistance),e.attenuationColor!==void 0&&this.attenuationColor!==void 0&&this.attenuationColor.setHex(e.attenuationColor),e.anisotropy!==void 0&&(this.anisotropy=e.anisotropy),e.anisotropyRotation!==void 0&&(this.anisotropyRotation=e.anisotropyRotation),e.fog!==void 0&&(this.fog=e.fog),e.flatShading!==void 0&&(this.flatShading=e.flatShading),e.blending!==void 0&&(this.blending=e.blending),e.combine!==void 0&&(this.combine=e.combine),e.side!==void 0&&(this.side=e.side),e.shadowSide!==void 0&&(this.shadowSide=e.shadowSide),e.opacity!==void 0&&(this.opacity=e.opacity),e.transparent!==void 0&&(this.transparent=e.transparent),e.alphaTest!==void 0&&(this.alphaTest=e.alphaTest),e.alphaHash!==void 0&&(this.alphaHash=e.alphaHash),e.depthFunc!==void 0&&(this.depthFunc=e.depthFunc),e.depthTest!==void 0&&(this.depthTest=e.depthTest),e.depthWrite!==void 0&&(this.depthWrite=e.depthWrite),e.colorWrite!==void 0&&(this.colorWrite=e.colorWrite),e.clippingPlanes!==void 0&&(this.clippingPlanes=e.clippingPlanes.map(e=>new Ki().fromJSON(e))),e.clipIntersection!==void 0&&(this.clipIntersection=e.clipIntersection),e.clipShadows!==void 0&&(this.clipShadows=e.clipShadows),e.depthPacking!==void 0&&(this.depthPacking=e.depthPacking),e.blendSrc!==void 0&&(this.blendSrc=e.blendSrc),e.blendDst!==void 0&&(this.blendDst=e.blendDst),e.blendEquation!==void 0&&(this.blendEquation=e.blendEquation),e.blendSrcAlpha!==void 0&&(this.blendSrcAlpha=e.blendSrcAlpha),e.blendDstAlpha!==void 0&&(this.blendDstAlpha=e.blendDstAlpha),e.blendEquationAlpha!==void 0&&(this.blendEquationAlpha=e.blendEquationAlpha),e.blendColor!==void 0&&this.blendColor!==void 0&&this.blendColor.setHex(e.blendColor),e.blendAlpha!==void 0&&(this.blendAlpha=e.blendAlpha),e.stencilWriteMask!==void 0&&(this.stencilWriteMask=e.stencilWriteMask),e.stencilFunc!==void 0&&(this.stencilFunc=e.stencilFunc),e.stencilRef!==void 0&&(this.stencilRef=e.stencilRef),e.stencilFuncMask!==void 0&&(this.stencilFuncMask=e.stencilFuncMask),e.stencilFail!==void 0&&(this.stencilFail=e.stencilFail),e.stencilZFail!==void 0&&(this.stencilZFail=e.stencilZFail),e.stencilZPass!==void 0&&(this.stencilZPass=e.stencilZPass),e.stencilWrite!==void 0&&(this.stencilWrite=e.stencilWrite),e.wireframe!==void 0&&(this.wireframe=e.wireframe),e.wireframeLinewidth!==void 0&&(this.wireframeLinewidth=e.wireframeLinewidth),e.wireframeLinecap!==void 0&&(this.wireframeLinecap=e.wireframeLinecap),e.wireframeLinejoin!==void 0&&(this.wireframeLinejoin=e.wireframeLinejoin),e.rotation!==void 0&&(this.rotation=e.rotation),e.linewidth!==void 0&&(this.linewidth=e.linewidth),e.linecap!==void 0&&(this.linecap=e.linecap),e.linejoin!==void 0&&(this.linejoin=e.linejoin),e.dashSize!==void 0&&(this.dashSize=e.dashSize),e.gapSize!==void 0&&(this.gapSize=e.gapSize),e.scale!==void 0&&(this.scale=e.scale),e.polygonOffset!==void 0&&(this.polygonOffset=e.polygonOffset),e.polygonOffsetFactor!==void 0&&(this.polygonOffsetFactor=e.polygonOffsetFactor),e.polygonOffsetUnits!==void 0&&(this.polygonOffsetUnits=e.polygonOffsetUnits),e.dithering!==void 0&&(this.dithering=e.dithering),e.alphaToCoverage!==void 0&&(this.alphaToCoverage=e.alphaToCoverage),e.premultipliedAlpha!==void 0&&(this.premultipliedAlpha=e.premultipliedAlpha),e.forceSinglePass!==void 0&&(this.forceSinglePass=e.forceSinglePass),e.allowOverride!==void 0&&(this.allowOverride=e.allowOverride),e.visible!==void 0&&(this.visible=e.visible),e.toneMapped!==void 0&&(this.toneMapped=e.toneMapped),e.userData!==void 0&&(this.userData=e.userData),e.vertexColors!==void 0&&(this.vertexColors=typeof e.vertexColors==`number`?e.vertexColors>0:e.vertexColors),e.size!==void 0&&(this.size=e.size),e.sizeAttenuation!==void 0&&(this.sizeAttenuation=e.sizeAttenuation),e.map!==void 0&&(this.map=t[e.map]||null),e.matcap!==void 0&&(this.matcap=t[e.matcap]||null),e.alphaMap!==void 0&&(this.alphaMap=t[e.alphaMap]||null),e.bumpMap!==void 0&&(this.bumpMap=t[e.bumpMap]||null),e.bumpScale!==void 0&&(this.bumpScale=e.bumpScale),e.normalMap!==void 0&&(this.normalMap=t[e.normalMap]||null),e.normalMapType!==void 0&&(this.normalMapType=e.normalMapType),e.normalScale!==void 0){let t=e.normalScale;Array.isArray(t)===!1&&(t=[t,t]),this.normalScale=new q().fromArray(t)}return e.displacementMap!==void 0&&(this.displacementMap=t[e.displacementMap]||null),e.displacementScale!==void 0&&(this.displacementScale=e.displacementScale),e.displacementBias!==void 0&&(this.displacementBias=e.displacementBias),e.roughnessMap!==void 0&&(this.roughnessMap=t[e.roughnessMap]||null),e.metalnessMap!==void 0&&(this.metalnessMap=t[e.metalnessMap]||null),e.emissiveMap!==void 0&&(this.emissiveMap=t[e.emissiveMap]||null),e.emissiveIntensity!==void 0&&(this.emissiveIntensity=e.emissiveIntensity),e.specularMap!==void 0&&(this.specularMap=t[e.specularMap]||null),e.specularIntensityMap!==void 0&&(this.specularIntensityMap=t[e.specularIntensityMap]||null),e.specularColorMap!==void 0&&(this.specularColorMap=t[e.specularColorMap]||null),e.envMap!==void 0&&(this.envMap=t[e.envMap]||null),e.envMapRotation!==void 0&&this.envMapRotation.fromArray(e.envMapRotation),e.envMapIntensity!==void 0&&(this.envMapIntensity=e.envMapIntensity),e.reflectivity!==void 0&&(this.reflectivity=e.reflectivity),e.refractionRatio!==void 0&&(this.refractionRatio=e.refractionRatio),e.lightMap!==void 0&&(this.lightMap=t[e.lightMap]||null),e.lightMapIntensity!==void 0&&(this.lightMapIntensity=e.lightMapIntensity),e.aoMap!==void 0&&(this.aoMap=t[e.aoMap]||null),e.aoMapIntensity!==void 0&&(this.aoMapIntensity=e.aoMapIntensity),e.gradientMap!==void 0&&(this.gradientMap=t[e.gradientMap]||null),e.clearcoatMap!==void 0&&(this.clearcoatMap=t[e.clearcoatMap]||null),e.clearcoatRoughnessMap!==void 0&&(this.clearcoatRoughnessMap=t[e.clearcoatRoughnessMap]||null),e.clearcoatNormalMap!==void 0&&(this.clearcoatNormalMap=t[e.clearcoatNormalMap]||null),e.clearcoatNormalScale!==void 0&&(this.clearcoatNormalScale=new q().fromArray(e.clearcoatNormalScale)),e.diffuseRoughnessMap!==void 0&&(this.diffuseRoughnessMap=t[e.diffuseRoughnessMap]||null),e.iridescenceMap!==void 0&&(this.iridescenceMap=t[e.iridescenceMap]||null),e.iridescenceThicknessMap!==void 0&&(this.iridescenceThicknessMap=t[e.iridescenceThicknessMap]||null),e.transmissionMap!==void 0&&(this.transmissionMap=t[e.transmissionMap]||null),e.thicknessMap!==void 0&&(this.thicknessMap=t[e.thicknessMap]||null),e.anisotropyMap!==void 0&&(this.anisotropyMap=t[e.anisotropyMap]||null),e.sheenColorMap!==void 0&&(this.sheenColorMap=t[e.sheenColorMap]||null),e.sheenRoughnessMap!==void 0&&(this.sheenRoughnessMap=t[e.sheenRoughnessMap]||null),this}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;let t=e.clippingPlanes,n=null;if(t!==null){let e=t.length;n=Array(e);for(let r=0;r!==e;++r)n[r]=t[r].clone()}return this.clippingPlanes=n,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.allowOverride=e.allowOverride,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:`dispose`})}set needsUpdate(e){e===!0&&this.version++}},Yi=new J,Xi=new J,Zi=new J,Qi=new J,$i=class{constructor(e=new J,t=new J(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,Yi)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);let n=t.dot(this.direction);return n<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){let t=Yi.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(Yi.copy(this.origin).addScaledVector(this.direction,t),Yi.distanceToSquared(e))}distanceSqToSegment(e,t,n,r){Xi.copy(e).add(t).multiplyScalar(.5),Zi.copy(t).sub(e).normalize(),Qi.copy(this.origin).sub(Xi);let i=e.distanceTo(t)*.5,a=-this.direction.dot(Zi),o=Qi.dot(this.direction),s=-Qi.dot(Zi),c=Qi.lengthSq(),l=Math.abs(1-a*a),u,d,f,p;if(l>0){if(u=a*s-o,d=a*o-s,p=i*l,u>=0){if(d>=-p){if(d<=p){let e=1/l;u*=e,d*=e,f=u*(u+a*d+2*o)+d*(a*u+d+2*s)+c}else d=i,u=Math.max(0,-(a*d+o)),f=-u*u+d*(d+2*s)+c}else d=-i,u=Math.max(0,-(a*d+o)),f=-u*u+d*(d+2*s)+c}else d<=-p?(u=Math.max(0,-(-a*i+o)),d=u>0?-i:Math.min(Math.max(-i,-s),i),f=-u*u+d*(d+2*s)+c):d<=p?(u=0,d=Math.min(Math.max(-i,-s),i),f=d*(d+2*s)+c):(u=Math.max(0,-(a*i+o)),d=u>0?i:Math.min(Math.max(-i,-s),i),f=-u*u+d*(d+2*s)+c)}else d=a>0?-i:i,u=Math.max(0,-(a*d+o)),f=-u*u+d*(d+2*s)+c;return n&&n.copy(this.origin).addScaledVector(this.direction,u),r&&r.copy(Xi).addScaledVector(Zi,d),f}intersectSphere(e,t){if(e.radius<0)return null;Yi.subVectors(e.center,this.origin);let n=Yi.dot(this.direction),r=Yi.dot(Yi)-n*n,i=e.radius*e.radius;if(r>i)return null;let a=Math.sqrt(i-r),o=n-a,s=n+a;return s<0?null:o<0?this.at(s,t):this.at(o,t)}intersectsSphere(e){return e.radius<0?!1:this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){let t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;let n=-(this.origin.dot(e.normal)+e.constant)/t;return n>=0?n:null}intersectPlane(e,t){let n=this.distanceToPlane(e);return n===null?null:this.at(n,t)}intersectsPlane(e){let t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let n,r,i,a,o,s,c=1/this.direction.x,l=1/this.direction.y,u=1/this.direction.z,d=this.origin;return c>=0?(n=(e.min.x-d.x)*c,r=(e.max.x-d.x)*c):(n=(e.max.x-d.x)*c,r=(e.min.x-d.x)*c),l>=0?(i=(e.min.y-d.y)*l,a=(e.max.y-d.y)*l):(i=(e.max.y-d.y)*l,a=(e.min.y-d.y)*l),n>a||i>r||((i>n||isNaN(n))&&(n=i),(a<r||isNaN(r))&&(r=a),u>=0?(o=(e.min.z-d.z)*u,s=(e.max.z-d.z)*u):(o=(e.max.z-d.z)*u,s=(e.min.z-d.z)*u),n>s||o>r)||((o>n||n!==n)&&(n=o),(s<r||r!==r)&&(r=s),r<0)?null:this.at(n>=0?n:r,t)}intersectsBox(e){return this.intersectBox(e,Yi)!==null}intersectTriangle(e,t,n,r,i){let a=this.origin,o=this.direction,s=o.x,c=o.y,l=o.z,u=e.x-a.x,d=e.y-a.y,f=e.z-a.z,p=t.x-a.x,m=t.y-a.y,h=t.z-a.z,g=n.x-a.x,_=n.y-a.y,v=n.z-a.z,y=Math.abs(s),b=Math.abs(c),x=Math.abs(l),S,C,w,T,E,D,O,k,A,j,M,N;if(y>=b&&y>=x?(w=s,D=u,A=p,N=g,s>=0?(S=c,C=l,T=d,E=f,O=m,k=h,j=_,M=v):(S=l,C=c,T=f,E=d,O=h,k=m,j=v,M=_)):b>=x?(w=c,D=d,A=m,N=_,c>=0?(S=l,C=s,T=f,E=u,O=h,k=p,j=v,M=g):(S=s,C=l,T=u,E=f,O=p,k=h,j=g,M=v)):(w=l,D=f,A=h,N=v,l>=0?(S=s,C=c,T=u,E=d,O=p,k=m,j=g,M=_):(S=c,C=s,T=d,E=u,O=m,k=p,j=_,M=g)),w===0)return null;let ee=S/w,P=C/w,F=1/w,te=T-ee*D,ne=E-P*D,re=O-ee*A,ie=k-P*A,ae=j-ee*N,oe=M-P*N,I=ae*ie-oe*re,se=te*oe-ne*ae,ce=re*ne-ie*te;if(r){if(I<0||se<0||ce<0)return null}else if((I<0||se<0||ce<0)&&(I>0||se>0||ce>0))return null;let L=I+se+ce;if(L===0)return null;let R=F*(I*D+se*A+ce*N);return(L>0?R<0:R>0)?null:this.at(R/L,i)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},ea=class extends Ji{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type=`MeshBasicMaterial`,this.color=new Z(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new vr,this.combine=0,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap=`round`,this.wireframeLinejoin=`round`,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}},ta=new cr,na=new $i,ra=new Ai,ia=new J,aa=new J,oa=new J,sa=new J,ca=new J,la=new J,ua=new J,da=new J,fa=class extends Fr{constructor(e=new Ri,t=new ea){super(),this.isMesh=!0,this.type=`Mesh`,this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.morphTargetInfluences=e.morphTargetInfluences===void 0?void 0:e.morphTargetInfluences.slice(),this.morphTargetDictionary=e.morphTargetDictionary===void 0?void 0:Object.assign({},e.morphTargetDictionary),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){let e=this.geometry.morphAttributes,t=Object.keys(e);if(t.length>0){let n=e[t[0]];if(n!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let e=0,t=n.length;e<t;e++){let t=n[e].name||String(e);this.morphTargetInfluences.push(0),this.morphTargetDictionary[t]=e}}}}getVertexPosition(e,t){let n=this.geometry,r=n.attributes.position,i=n.morphAttributes.position,a=n.morphTargetsRelative;t.fromBufferAttribute(r,e);let o=this.morphTargetInfluences;if(i&&o){la.set(0,0,0);for(let n=0,r=i.length;n<r;n++){let r=o[n],s=i[n];r!==0&&(ca.fromBufferAttribute(s,e),a?la.addScaledVector(ca,r):la.addScaledVector(ca.sub(t),r))}t.add(la)}return t}intersectsFrustum(e){return e.intersectsObject(this)}raycast(e,t){let n=this.geometry,r=this.material,i=this.matrixWorld;r!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),ra.copy(n.boundingSphere),ra.applyMatrix4(i),na.copy(e.ray).recast(e.near),ra.containsPoint(na.origin)===!1&&(na.intersectSphere(ra,ia)===null||na.origin.distanceToSquared(ia)>(e.far-e.near)**2)||(ta.copy(i).invert(),na.copy(e.ray).applyMatrix4(ta),(n.boundingBox===null||na.intersectsBox(n.boundingBox)!==!1)&&this._computeIntersections(e,t,na)))}_computeIntersections(e,t,n){let r,i=this.geometry,a=this.material,o=i.index,s=i.attributes.position,c=i.attributes.uv,l=i.attributes.uv1,u=i.attributes.normal,d=i.groups,f=i.drawRange;if(o!==null){if(Array.isArray(a))for(let i=0,s=d.length;i<s;i++){let s=d[i],p=a[s.materialIndex],m=Math.max(s.start,f.start),h=Math.min(o.count,Math.min(s.start+s.count,f.start+f.count));for(let i=m,a=h;i<a;i+=3){let a=o.getX(i),d=o.getX(i+1),f=o.getX(i+2);r=ma(this,p,e,n,c,l,u,a,d,f),r&&(r.faceIndex=Math.floor(i/3),r.face.materialIndex=s.materialIndex,t.push(r))}}else{let i=Math.max(0,f.start),s=Math.min(o.count,f.start+f.count);for(let d=i,f=s;d<f;d+=3){let i=o.getX(d),s=o.getX(d+1),f=o.getX(d+2);r=ma(this,a,e,n,c,l,u,i,s,f),r&&(r.faceIndex=Math.floor(d/3),t.push(r))}}}else if(s!==void 0){if(Array.isArray(a))for(let i=0,o=d.length;i<o;i++){let o=d[i],p=a[o.materialIndex],m=Math.max(o.start,f.start),h=Math.min(s.count,Math.min(o.start+o.count,f.start+f.count));for(let i=m,a=h;i<a;i+=3){let a=i,s=i+1,d=i+2;r=ma(this,p,e,n,c,l,u,a,s,d),r&&(r.faceIndex=Math.floor(i/3),r.face.materialIndex=o.materialIndex,t.push(r))}}else{let i=Math.max(0,f.start),o=Math.min(s.count,f.start+f.count);for(let s=i,d=o;s<d;s+=3){let i=s,o=s+1,d=s+2;r=ma(this,a,e,n,c,l,u,i,o,d),r&&(r.faceIndex=Math.floor(s/3),t.push(r))}}}}};function pa(e,t,n,r,i,a,o,s){let c;if(c=t.side===1?r.intersectTriangle(o,a,i,!0,s):r.intersectTriangle(i,a,o,t.side===0,s),c===null)return null;da.copy(s),da.applyMatrix4(e.matrixWorld);let l=n.ray.origin.distanceTo(da);return l<n.near||l>n.far?null:{distance:l,point:da.clone(),object:e}}function ma(e,t,n,r,i,a,o,s,c,l){e.getVertexPosition(s,aa),e.getVertexPosition(c,oa),e.getVertexPosition(l,sa);let u=pa(e,t,n,r,aa,oa,sa,ua);if(u){let e=new J;ii.getBarycoord(ua,aa,oa,sa,e),i&&(u.uv=ii.getInterpolatedAttribute(i,s,c,l,e,new q)),a&&(u.uv1=ii.getInterpolatedAttribute(a,s,c,l,e,new q)),o&&(u.normal=ii.getInterpolatedAttribute(o,s,c,l,e,new J),u.normal.dot(r.direction)>0&&u.normal.multiplyScalar(-1));let t={a:s,b:c,c:l,normal:new J,materialIndex:0};ii.getNormal(aa,oa,sa,t.normal),u.face=t,u.barycoord=e}return u}var ha=class extends nr{constructor(e=null,t=1,n=1,r,i,a,o,s,c=ke,l=ke,u,d){super(null,a,o,s,c,l,r,i,u,d),this.isDataTexture=!0,this.image={data:e,width:t,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}},ga=class extends Ci{constructor(e,t,n,r=1){super(e,t,n),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=r}copy(e){return super.copy(e),this.meshPerAttribute=e.meshPerAttribute,this}toJSON(){let e=super.toJSON();return e.meshPerAttribute=this.meshPerAttribute,e.isInstancedBufferAttribute=!0,e}},_a=new Ai,va=new q(.5,.5),ya=new J,ba=class{constructor(e=new Ki,t=new Ki,n=new Ki,r=new Ki,i=new Ki,a=new Ki){this.planes=[e,t,n,r,i,a]}set(e,t,n,r,i,a){let o=this.planes;return o[0].copy(e),o[1].copy(t),o[2].copy(n),o[3].copy(r),o[4].copy(i),o[5].copy(a),this}copy(e){let t=this.planes;for(let n=0;n<6;n++)t[n].copy(e.planes[n]);return this}setFromProjectionMatrix(e,t=en,n=!1){let r=this.planes,i=e.elements,a=i[0],o=i[1],s=i[2],c=i[3],l=i[4],u=i[5],d=i[6],f=i[7],p=i[8],m=i[9],h=i[10],g=i[11],_=i[12],v=i[13],y=i[14],b=i[15];if(r[0].setComponents(c-a,f-l,g-p,b-_).normalize(),r[1].setComponents(c+a,f+l,g+p,b+_).normalize(),r[2].setComponents(c+o,f+u,g+m,b+v).normalize(),r[3].setComponents(c-o,f-u,g-m,b-v).normalize(),n)r[4].setComponents(s,d,h,y).normalize(),r[5].setComponents(c-s,f-d,g-h,b-y).normalize();else if(r[4].setComponents(c-s,f-d,g-h,b-y).normalize(),t===2e3)r[5].setComponents(c+s,f+d,g+h,b+y).normalize();else if(t===2001)r[5].setComponents(s,d,h,y).normalize();else throw Error(`THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: `+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),_a.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{let t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),_a.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(_a)}intersectsSprite(e){return _a.center.set(0,0,0),_a.radius=.7071067811865476+va.distanceTo(e.center),_a.applyMatrix4(e.matrixWorld),this.intersectsSphere(_a)}intersectsSphere(e){let t=this.planes,n=e.center,r=-e.radius;for(let e=0;e<6;e++)if(t[e].distanceToPoint(n)<r)return!1;return!0}intersectsBox(e){let t=this.planes;for(let n=0;n<6;n++){let r=t[n];if(ya.x=r.normal.x>0?e.max.x:e.min.x,ya.y=r.normal.y>0?e.max.y:e.min.y,ya.z=r.normal.z>0?e.max.z:e.min.z,r.distanceToPoint(ya)<0)return!1}return!0}containsPoint(e){let t=this.planes;for(let n=0;n<6;n++)if(t[n].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}},xa=new cr,Sa=class e{constructor(){this.coordinateSystem=en,this._frustums=[],this._count=0}setFromArrayCamera(e){let t=e.cameras,n=this._frustums;for(let e=0;e<t.length;e++){let r=t[e];xa.multiplyMatrices(r.projectionMatrix,r.matrixWorldInverse),n[e]===void 0&&(n[e]=new ba),n[e].setFromProjectionMatrix(xa,r.coordinateSystem,r.reversedDepth)}return this._count=t.length,this}getFrustum(e){return this._frustums[e]}intersectsObject(e){let t=this._frustums;for(let n=0;n<this._count;n++)if(t[n].intersectsObject(e))return!0;return!1}intersectsSprite(e){let t=this._frustums;for(let n=0;n<this._count;n++)if(t[n].intersectsSprite(e))return!0;return!1}intersectsSphere(e){let t=this._frustums;for(let n=0;n<this._count;n++)if(t[n].intersectsSphere(e))return!0;return!1}intersectsBox(e){let t=this._frustums;for(let n=0;n<this._count;n++)if(t[n].intersectsBox(e))return!0;return!1}containsPoint(e){let t=this._frustums;for(let n=0;n<this._count;n++)if(t[n].containsPoint(e))return!0;return!1}copy(e){this.coordinateSystem=e.coordinateSystem;let t=this._frustums,n=e._frustums;for(let r=0;r<e._count;r++)t[r]===void 0&&(t[r]=new ba),t[r].copy(n[r]);return this._count=e._count,this}clone(){return new e().copy(this)}},Ca=class extends Ji{constructor(e){super(),this.isPointsMaterial=!0,this.type=`PointsMaterial`,this.color=new Z(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.size=e.size,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}},wa=new cr,Ta=new $i,Ea=new Ai,Da=new J,Oa=class extends Fr{constructor(e=new Ri,t=new Ca){super(),this.isPoints=!0,this.type=`Points`,this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.morphTargetInfluences=e.morphTargetInfluences===void 0?void 0:e.morphTargetInfluences.slice(),this.morphTargetDictionary=e.morphTargetDictionary===void 0?void 0:Object.assign({},e.morphTargetDictionary),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}intersectsFrustum(e){return e.intersectsObject(this)}raycast(e,t){let n=this.geometry,r=this.matrixWorld,i=e.params.Points.threshold,a=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),Ea.copy(n.boundingSphere),Ea.applyMatrix4(r),Ea.radius+=i,e.ray.intersectsSphere(Ea)===!1)return;wa.copy(r).invert(),Ta.copy(e.ray).applyMatrix4(wa);let o=i/((this.scale.x+this.scale.y+this.scale.z)/3),s=o*o,c=n.index,l=n.attributes.position;if(c!==null){let n=Math.max(0,a.start),i=Math.min(c.count,a.start+a.count);for(let a=n,o=i;a<o;a++){let n=c.getX(a);Da.fromBufferAttribute(l,n),ka(Da,n,s,r,e,t,this)}}else{let n=Math.max(0,a.start),i=Math.min(l.count,a.start+a.count);for(let a=n,o=i;a<o;a++)Da.fromBufferAttribute(l,a),ka(Da,a,s,r,e,t,this)}}updateMorphTargets(){let e=this.geometry.morphAttributes,t=Object.keys(e);if(t.length>0){let n=e[t[0]];if(n!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let e=0,t=n.length;e<t;e++){let t=n[e].name||String(e);this.morphTargetInfluences.push(0),this.morphTargetDictionary[t]=e}}}}};function ka(e,t,n,r,i,a,o){let s=Ta.distanceSqToPoint(e);if(s<n){let n=new J;Ta.closestPointToPoint(e,n),n.applyMatrix4(r);let c=i.ray.origin.distanceTo(n);if(c<i.near||c>i.far)return;a.push({distance:c,distanceToRay:Math.sqrt(s),point:n,index:t,face:null,faceIndex:null,barycoord:null,object:o})}}var Aa=class extends nr{constructor(e=[],t=301,n,r,i,a,o,s,c,l){super(e,t,n,r,i,a,o,s,c,l),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}},ja=class extends nr{constructor(e,t,n,r,i,a,o,s,c){super(e,t,n,r,i,a,o,s,c),this.isCanvasTexture=!0,this.needsUpdate=!0}},Ma=class extends nr{constructor(e,t,n=ze,r,i,a,o=ke,s=ke,c,l=Xe,u=1){if(l!==1026&&l!==1027)throw Error(`THREE.DepthTexture: format must be either THREE.DepthFormat or THREE.DepthStencilFormat`);super({width:e,height:t,depth:u},r,i,a,o,s,l,n,c),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.source=new Qn(Object.assign({},e.image)),this.compareFunction=e.compareFunction,this}toJSON(e){let t=super.toJSON(e);return t.compareFunction=this.compareFunction,t}},Na=class extends Ma{constructor(e,t=ze,n=301,r,i,a=ke,o=ke,s,c=Xe){let l={width:e,height:e,depth:1},u=[l,l,l,l,l,l];super(e,e,t,n,r,i,a,o,s,c),this.image=u,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(e){this.image=e}},Pa=class extends nr{constructor(e=null){super(),this.sourceTexture=e,this.isExternalTexture=!0}copy(e){return super.copy(e),this.sourceTexture=e.sourceTexture,this}},Fa=class e extends Ri{constructor(e=1,t=1,n=1,r=1,i=1,a=1){super(),this.type=`BoxGeometry`,this.parameters={width:e,height:t,depth:n,widthSegments:r,heightSegments:i,depthSegments:a};let o=this;r=Math.floor(r),i=Math.floor(i),a=Math.floor(a);let s=[],c=[],l=[],u=[],d=0,f=0;p(`z`,`y`,`x`,-1,-1,n,t,e,a,i,0),p(`z`,`y`,`x`,1,-1,n,t,-e,a,i,1),p(`x`,`z`,`y`,1,1,e,n,t,r,a,2),p(`x`,`z`,`y`,1,-1,e,n,-t,r,a,3),p(`x`,`y`,`z`,1,-1,e,t,n,r,i,4),p(`x`,`y`,`z`,-1,-1,e,t,-n,r,i,5),this.setIndex(s),this.setAttribute(`position`,new Ei(c,3)),this.setAttribute(`normal`,new Ei(l,3)),this.setAttribute(`uv`,new Ei(u,2));function p(e,t,n,r,i,a,p,m,h,g,_){let v=a/h,y=p/g,b=a/2,x=p/2,S=m/2,C=h+1,w=g+1,T=0,E=0,D=new J;for(let a=0;a<w;a++){let o=a*y-x;for(let s=0;s<C;s++)D[e]=(s*v-b)*r,D[t]=o*i,D[n]=S,c.push(D.x,D.y,D.z),D[e]=0,D[t]=0,D[n]=m>0?1:-1,l.push(D.x,D.y,D.z),u.push(s/h),u.push(1-a/g),T+=1}for(let e=0;e<g;e++)for(let t=0;t<h;t++){let n=d+t+C*e,r=d+t+C*(e+1),i=d+(t+1)+C*(e+1),a=d+(t+1)+C*e;s.push(n,r,a),s.push(r,i,a),E+=6}o.addGroup(f,E,_),f+=E,d+=T}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.width,t.height,t.depth,t.widthSegments,t.heightSegments,t.depthSegments)}},Ia=class e extends Ri{constructor(e=1,t=1,n=1,r=1){super(),this.type=`PlaneGeometry`,this.parameters={width:e,height:t,widthSegments:n,heightSegments:r};let i=e/2,a=t/2,o=Math.floor(n),s=Math.floor(r),c=o+1,l=s+1,u=e/o,d=t/s,f=[],p=[],m=[],h=[];for(let e=0;e<l;e++){let t=e*d-a;for(let n=0;n<c;n++){let r=n*u-i;p.push(r,-t,0),m.push(0,0,1),h.push(n/o),h.push(1-e/s)}}for(let e=0;e<s;e++)for(let t=0;t<o;t++){let n=t+c*e,r=t+c*(e+1),i=t+1+c*(e+1),a=t+1+c*e;f.push(n,r,a),f.push(r,i,a)}this.setIndex(f),this.setAttribute(`position`,new Ei(p,3)),this.setAttribute(`normal`,new Ei(m,3)),this.setAttribute(`uv`,new Ei(h,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.width,t.height,t.widthSegments,t.heightSegments)}},La=class e extends Ri{constructor(e=1,t=32,n=16,r=0,i=Math.PI*2,a=0,o=Math.PI){super(),this.type=`SphereGeometry`,this.parameters={radius:e,widthSegments:t,heightSegments:n,phiStart:r,phiLength:i,thetaStart:a,thetaLength:o},t=Math.max(3,Math.floor(t)),n=Math.max(2,Math.floor(n));let s=Math.min(a+o,Math.PI),c=0,l=[],u=new J,d=new J,f=[],p=[],m=[],h=[];for(let f=0;f<=n;f++){let g=[],_=f/n,v=a+_*o,y=e*Math.cos(v),b=Math.sqrt(e*e-y*y),x=0;f===0&&a===0?x=.5/t:f===n&&s===Math.PI&&(x=-.5/t);for(let e=0;e<=t;e++){let n=e/t,a=r+n*i;u.x=-b*Math.cos(a),u.y=y,u.z=b*Math.sin(a),p.push(u.x,u.y,u.z),d.copy(u).normalize(),m.push(d.x,d.y,d.z),h.push(n+x,1-_),g.push(c++)}l.push(g)}for(let e=0;e<n;e++)for(let r=0;r<t;r++){let t=l[e][r+1],i=l[e][r],o=l[e+1][r],c=l[e+1][r+1];(e!==0||a>0)&&f.push(t,i,c),(e!==n-1||s<Math.PI)&&f.push(i,o,c)}this.setIndex(f),this.setAttribute(`position`,new Ei(p,3)),this.setAttribute(`normal`,new Ei(m,3)),this.setAttribute(`uv`,new Ei(h,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.radius,t.widthSegments,t.heightSegments,t.phiStart,t.phiLength,t.thetaStart,t.thetaLength)}},Ra=class extends Ri{constructor(e=null){if(super(),this.type=`WireframeGeometry`,this.parameters={geometry:e},e!==null){let t=[],n=new Set,r=new J,i=new J;if(e.index!==null){let a=e.attributes.position,o=e.index,s=e.groups;s.length===0&&(s=[{start:0,count:o.count,materialIndex:0}]);for(let e=0,c=s.length;e<c;++e){let c=s[e],l=c.start,u=c.count;for(let e=l,s=l+u;e<s;e+=3)for(let s=0;s<3;s++){let c=o.getX(e+s),l=o.getX(e+(s+1)%3);r.fromBufferAttribute(a,c),i.fromBufferAttribute(a,l),za(r,i,n)===!0&&(t.push(r.x,r.y,r.z),t.push(i.x,i.y,i.z))}}}else{let a=e.attributes.position;for(let e=0,o=a.count/3;e<o;e++)for(let o=0;o<3;o++){let s=3*e+o,c=3*e+(o+1)%3;r.fromBufferAttribute(a,s),i.fromBufferAttribute(a,c),za(r,i,n)===!0&&(t.push(r.x,r.y,r.z),t.push(i.x,i.y,i.z))}}this.setAttribute(`position`,new Ei(t,3))}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}};function za(e,t,n){let r=`${e.x},${e.y},${e.z}-${t.x},${t.y},${t.z}`,i=`${t.x},${t.y},${t.z}-${e.x},${e.y},${e.z}`;return n.has(r)===!0||n.has(i)===!0?!1:(n.add(r),n.add(i),!0)}function Ba(e){let t={};for(let n in e){t[n]={};for(let r in e[n]){let i=e[n][r];if(Ha(i))i.isRenderTargetTexture?(W(`UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms().`),t[n][r]=null):t[n][r]=i.clone();else if(Array.isArray(i)){if(Ha(i[0])){let e=[];for(let t=0,n=i.length;t<n;t++)e[t]=i[t].clone();t[n][r]=e}else t[n][r]=i.slice()}else t[n][r]=i}}return t}function Va(e){let t={};for(let n=0;n<e.length;n++){let r=Ba(e[n]);for(let e in r)t[e]=r[e]}return t}function Ha(e){return e&&(e.isColor||e.isMatrix3||e.isMatrix4||e.isVector2||e.isVector3||e.isVector4||e.isTexture||e.isQuaternion)}function Ua(e){let t=[];for(let n=0;n<e.length;n++)t.push(e[n].clone());return t}function Wa(e){let t=e.getRenderTarget();return t===null?e.outputColorSpace:t.isXRRenderTarget===!0?t.texture.colorSpace:X.workingColorSpace}var Ga={clone:Ba,merge:Va},Ka=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,qa=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,Ja=class extends Ji{constructor(e){super(),this.isShaderMaterial=!0,this.type=`ShaderMaterial`,this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=Ka,this.fragmentShader=qa,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=Ba(e.uniforms),this.uniformsGroups=Ua(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this.defaultAttributeValues=Object.assign({},e.defaultAttributeValues),this.index0AttributeName=e.index0AttributeName,this.uniformsNeedUpdate=e.uniformsNeedUpdate,this}toJSON(e){let t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(let n in this.uniforms){let r=this.uniforms[n].value;r&&r.isTexture?t.uniforms[n]={type:`t`,value:r.toJSON(e).uuid}:r&&r.isColor?t.uniforms[n]={type:`c`,value:r.getHex()}:r&&r.isVector2?t.uniforms[n]={type:`v2`,value:r.toArray()}:r&&r.isVector3?t.uniforms[n]={type:`v3`,value:r.toArray()}:r&&r.isVector4?t.uniforms[n]={type:`v4`,value:r.toArray()}:r&&r.isMatrix3?t.uniforms[n]={type:`m3`,value:r.toArray()}:r&&r.isMatrix4?t.uniforms[n]={type:`m4`,value:r.toArray()}:t.uniforms[n]={value:r}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;let n={};for(let e in this.extensions)this.extensions[e]===!0&&(n[e]=!0);return Object.keys(n).length>0&&(t.extensions=n),t}fromJSON(e,t){if(super.fromJSON(e,t),e.uniforms!==void 0)for(let n in e.uniforms){let r=e.uniforms[n];switch(this.uniforms[n]={},r.type){case`t`:this.uniforms[n].value=t[r.value]||null;break;case`c`:this.uniforms[n].value=new Z().setHex(r.value);break;case`v2`:this.uniforms[n].value=new q().fromArray(r.value);break;case`v3`:this.uniforms[n].value=new J().fromArray(r.value);break;case`v4`:this.uniforms[n].value=new rr().fromArray(r.value);break;case`m3`:this.uniforms[n].value=new Y().fromArray(r.value);break;case`m4`:this.uniforms[n].value=new cr().fromArray(r.value);break;default:this.uniforms[n].value=r.value}}if(e.defines!==void 0&&(this.defines=e.defines),e.vertexShader!==void 0&&(this.vertexShader=e.vertexShader),e.fragmentShader!==void 0&&(this.fragmentShader=e.fragmentShader),e.glslVersion!==void 0&&(this.glslVersion=e.glslVersion),e.extensions!==void 0)for(let t in e.extensions)this.extensions[t]=e.extensions[t];return e.lights!==void 0&&(this.lights=e.lights),e.clipping!==void 0&&(this.clipping=e.clipping),this}},Ya=class extends Ja{constructor(e){super(e),this.isRawShaderMaterial=!0,this.type=`RawShaderMaterial`}},Xa=class extends Ji{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type=`MeshDepthMaterial`,this.depthPacking=Kt,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}},Za=class extends Ji{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type=`MeshDistanceMaterial`,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}};function Qa(e,t){return!e||e.constructor===t?e:typeof t.BYTES_PER_ELEMENT==`number`?new t(e):Array.prototype.slice.call(e)}function $a(e){return e!==void 0&&e.inTangents!==void 0&&e.outTangents!==void 0}var eo=class{constructor(e,t,n,r){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=r===void 0?new t.constructor(n):r,this.sampleValues=t,this.valueSize=n,this.settings=null,this.DefaultSettings_={}}evaluate(e){let t=this.parameterPositions,n=this._cachedIndex,r=t[n],i=t[n-1];validate_interval:{seek:{let a;linear_scan:{forward_scan:if(!(e<r)){for(let a=n+2;;){if(r===void 0){if(e<i)break forward_scan;return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}if(n===a)break;if(i=r,r=t[++n],e<r)break seek}a=t.length;break linear_scan}if(!(e>=i)){let o=t[1];e<o&&(n=2,i=o);for(let a=n-2;;){if(i===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===a)break;if(r=i,i=t[--n-1],e>=i)break seek}a=n,n=0;break linear_scan}break validate_interval}for(;n<a;){let r=n+a>>>1;e<t[r]?a=r:n=r+1}if(r=t[n],i=t[n-1],i===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(r===void 0)return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}this._cachedIndex=n,this.intervalChanged_(n,i,r)}return this.interpolate_(n,i,e,r)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){let t=this.resultBuffer,n=this.sampleValues,r=this.valueSize,i=e*r;for(let e=0;e!==r;++e)t[e]=n[i+e];return t}interpolate_(){throw Error(`THREE.Interpolant: Call to abstract method.`)}intervalChanged_(){}},to=class extends eo{constructor(e,t,n,r){super(e,t,n,r),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:Ut,endingEnd:Ut}}intervalChanged_(e,t,n){let r=this.parameterPositions,i=e-2,a=e+1,o=r[i],s=r[a];if(o===void 0)switch(this.getSettings_().endingStart){case Wt:i=e,o=2*t-n;break;case Gt:i=r.length-2,o=t+r[i]-r[i+1];break;default:i=e,o=n}if(s===void 0)switch(this.getSettings_().endingEnd){case Wt:a=e,s=2*n-t;break;case Gt:a=1,s=n+r[1]-r[0];break;default:a=e-1,s=t}let c=(n-t)*.5,l=this.valueSize;this._weightPrev=c/(t-o),this._weightNext=c/(s-n),this._offsetPrev=i*l,this._offsetNext=a*l}interpolate_(e,t,n,r){let i=this.resultBuffer,a=this.sampleValues,o=this.valueSize,s=e*o,c=s-o,l=this._offsetPrev,u=this._offsetNext,d=this._weightPrev,f=this._weightNext,p=(n-t)/(r-t),m=p*p,h=m*p,g=-d*h+2*d*m-d*p,_=(1+d)*h+(-1.5-2*d)*m+(-.5+d)*p+1,v=(-1-f)*h+(1.5+f)*m+.5*p,y=f*h-f*m;for(let e=0;e!==o;++e)i[e]=g*a[l+e]+_*a[c+e]+v*a[s+e]+y*a[u+e];return i}},no=class extends eo{constructor(e,t,n,r){super(e,t,n,r)}interpolate_(e,t,n,r){let i=this.resultBuffer,a=this.sampleValues,o=this.valueSize,s=e*o,c=s-o,l=(n-t)/(r-t),u=1-l;for(let e=0;e!==o;++e)i[e]=a[c+e]*u+a[s+e]*l;return i}},ro=class extends eo{constructor(e,t,n,r){super(e,t,n,r)}interpolate_(e){return this.copySampleValue_(e-1)}},io=class extends eo{interpolate_(e,t,n,r){let i=this.resultBuffer,a=this.sampleValues,o=this.valueSize,s=e*o,c=s-o,l=this.inTangents,u=this.outTangents;if(!l||!u){let e=(n-t)/(r-t),l=1-e;for(let t=0;t!==o;++t)i[t]=a[c+t]*l+a[s+t]*e;return i}let d=o*2,f=e-1;for(let p=0;p!==o;++p){let o=a[c+p],m=a[s+p],h=f*d+p*2,g=u[h],_=u[h+1],v=e*d+p*2,y=l[v],b=l[v+1],x=so(n,t,g,y,r);i[p]=ao(x,o,_,b,m)}return i}};function ao(e,t,n,r,i){let a=1-e;return a*a*a*t+3*a*a*e*n+3*a*e*e*r+e*e*e*i}function oo(e,t,n,r,i){let a=1-e;return 3*a*a*(n-t)+6*a*e*(r-n)+3*e*e*(i-r)}function so(e,t,n,r,i){let a=(e-t)/(i-t);for(let o=0;o<8;o++){let o=ao(a,t,n,r,i)-e;if(Math.abs(o)<1e-10)break;let s=oo(a,t,n,r,i);if(Math.abs(s)<1e-10)break;a=Math.max(0,Math.min(1,a-o/s))}return a}var co=class{constructor(e,t,n,r){if(e===void 0)throw Error(`THREE.KeyframeTrack: track name is undefined`);if(t===void 0||t.length===0)throw Error(`THREE.KeyframeTrack: no keyframes in track named `+e);this.name=e,this.times=Qa(t,this.TimeBufferType),this.values=Qa(n,this.ValueBufferType),this.setInterpolation(r||this.DefaultInterpolation)}static toJSON(e){let t=e.constructor,n;if(t.toJSON!==this.toJSON)n=t.toJSON(e);else{n={name:e.name,times:Qa(e.times,Array),values:Qa(e.values,Array)};let t=e.getInterpolation();t!==e.DefaultInterpolation&&(n.interpolation=t),$a(e.settings)&&(n.settings={inTangents:Qa(e.settings.inTangents,Array),outTangents:Qa(e.settings.outTangents,Array)})}return n.type=e.ValueTypeName,n}InterpolantFactoryMethodDiscrete(e){return new ro(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new no(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new to(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodBezier(e){let t=new io(this.times,this.values,this.getValueSize(),e);return this.settings&&(t.inTangents=this.settings.inTangents,t.outTangents=this.settings.outTangents),t}setInterpolation(e){let t;switch(e){case zt:t=this.InterpolantFactoryMethodDiscrete;break;case Bt:t=this.InterpolantFactoryMethodLinear;break;case Vt:t=this.InterpolantFactoryMethodSmooth;break;case Ht:t=this.InterpolantFactoryMethodBezier}if(t===void 0){let t=`unsupported interpolation for `+this.ValueTypeName+` keyframe track named `+this.name;if(this.createInterpolant===void 0){if(e!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw Error(t)}return W(`KeyframeTrack:`,t),this}return this.createInterpolant=t,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return zt;case this.InterpolantFactoryMethodLinear:return Bt;case this.InterpolantFactoryMethodSmooth:return Vt;case this.InterpolantFactoryMethodBezier:return Ht}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){let t=this.times;for(let n=0,r=t.length;n!==r;++n)t[n]+=e;$a(this.settings)&&(lo(this.settings.inTangents,e),lo(this.settings.outTangents,e))}return this}scale(e){if(e!==1){let t=this.times;for(let n=0,r=t.length;n!==r;++n)t[n]*=e;$a(this.settings)&&(uo(this.settings.inTangents,e),uo(this.settings.outTangents,e))}return this}trim(e,t){let n=this.times,r=n.length,i=0,a=r-1;for(;i!==r&&n[i]<e;)++i;for(;a!==-1&&n[a]>t;)--a;if(++a,i!==0||a!==r){i>=a&&(a=Math.max(a,1),i=a-1);let e=this.getValueSize();this.times=n.slice(i,a),this.values=this.values.slice(i*e,a*e)}return this}validate(){let e=!0,t=this.getValueSize();t-Math.floor(t)!==0&&(G(`KeyframeTrack: Invalid value size in track.`,this),e=!1);let n=this.times,r=this.values,i=n.length;i===0&&(G(`KeyframeTrack: Track is empty.`,this),e=!1);let a=null;for(let t=0;t!==i;t++){let r=n[t];if(typeof r==`number`&&isNaN(r)){G(`KeyframeTrack: Time is not a valid number.`,this,t,r),e=!1;break}if(a!==null&&a>r){G(`KeyframeTrack: Out of order keys.`,this,t,r,a),e=!1;break}a=r}if(r!==void 0&&nn(r))for(let t=0,n=r.length;t!==n;++t){let n=r[t];if(isNaN(n)){G(`KeyframeTrack: Value is not a valid number.`,this,t,n),e=!1;break}}return e}optimize(){let e=this.times.slice(),t=this.values.slice(),n=this.getValueSize(),r=this.getInterpolation()===Vt,i=e.length-1,a=1;for(let o=1;o<i;++o){let i=!1,s=e[o];if(s!==e[o+1]&&(o!==1||s!==e[0])){if(r)i=!0;else{let e=o*n,r=e-n,a=e+n;for(let o=0;o!==n;++o){let n=t[e+o];if(n!==t[r+o]||n!==t[a+o]){i=!0;break}}}}if(i){if(o!==a){e[a]=e[o];let r=o*n,i=a*n;for(let e=0;e!==n;++e)t[i+e]=t[r+e]}++a}}if(i>0){e[a]=e[i];for(let e=i*n,r=a*n,o=0;o!==n;++o)t[r+o]=t[e+o];++a}return a===e.length?(this.times=e,this.values=t):(this.times=e.slice(0,a),this.values=t.slice(0,a*n)),this}clone(){let e=this.times.slice(),t=this.values.slice(),n=this.constructor,r=new n(this.name,e,t);return r.createInterpolant=this.createInterpolant,$a(this.settings)&&(r.settings={inTangents:this.settings.inTangents.slice(),outTangents:this.settings.outTangents.slice()}),r}};function lo(e,t){for(let n=0,r=e.length;n!==r;n+=2)e[n]+=t}function uo(e,t){for(let n=0,r=e.length;n!==r;n+=2)e[n]*=t}co.prototype.ValueTypeName=``,co.prototype.TimeBufferType=Float32Array,co.prototype.ValueBufferType=Float32Array,co.prototype.DefaultInterpolation=Bt;var fo=class extends co{constructor(e,t,n){super(e,t,n)}};fo.prototype.ValueTypeName=`bool`,fo.prototype.ValueBufferType=Array,fo.prototype.DefaultInterpolation=zt,fo.prototype.InterpolantFactoryMethodLinear=void 0,fo.prototype.InterpolantFactoryMethodSmooth=void 0;var po=class extends co{constructor(e,t,n,r){super(e,t,n,r)}};po.prototype.ValueTypeName=`color`;var mo=class extends co{constructor(e,t,n,r){super(e,t,n,r)}};mo.prototype.ValueTypeName=`number`;var ho=class extends eo{constructor(e,t,n,r){super(e,t,n,r)}interpolate_(e,t,n,r){let i=this.resultBuffer,a=this.sampleValues,o=this.valueSize,s=(n-t)/(r-t),c=e*o;for(let e=c+o;c!==e;c+=4)Bn.slerpFlat(i,0,a,c-o,a,c,s);return i}},go=class extends co{constructor(e,t,n,r){super(e,t,n,r)}InterpolantFactoryMethodLinear(e){return new ho(this.times,this.values,this.getValueSize(),e)}};go.prototype.ValueTypeName=`quaternion`,go.prototype.InterpolantFactoryMethodSmooth=void 0;var _o=class extends co{constructor(e,t,n){super(e,t,n)}};_o.prototype.ValueTypeName=`string`,_o.prototype.ValueBufferType=Array,_o.prototype.DefaultInterpolation=zt,_o.prototype.InterpolantFactoryMethodLinear=void 0,_o.prototype.InterpolantFactoryMethodSmooth=void 0;var vo=class extends co{constructor(e,t,n,r){super(e,t,n,r)}};vo.prototype.ValueTypeName=`vector`;var yo={enabled:!1,files:{},add:function(e,t){this.enabled!==!1&&(bo(e)||(this.files[e]=t))},get:function(e){if(this.enabled!==!1&&!bo(e))return this.files[e]},remove:function(e){delete this.files[e]},clear:function(){this.files={}}};function bo(e){try{let t=e.slice(e.indexOf(`:`)+1);return new URL(t).protocol===`blob:`}catch{return!1}}var xo=new class{constructor(e,t,n){let r=this,i=!1,a=0,o=0,s,c=[];this.onStart=void 0,this.onLoad=e,this.onProgress=t,this.onError=n,this._abortController=null,this.itemStart=function(e){o++,i===!1&&r.onStart!==void 0&&r.onStart(e,a,o),i=!0},this.itemEnd=function(e){a++,r.onProgress!==void 0&&r.onProgress(e,a,o),a===o&&(i=!1,r.onLoad!==void 0&&r.onLoad())},this.itemError=function(e){r.onError!==void 0&&r.onError(e)},this.resolveURL=function(e){return e=e.normalize(`NFC`),s?s(e):e},this.setURLModifier=function(e){return s=e,this},this.addHandler=function(e,t){return c.push(e,t),this},this.removeHandler=function(e){let t=c.indexOf(e);return t!==-1&&c.splice(t,2),this},this.getHandler=function(e){for(let t=0,n=c.length;t<n;t+=2){let n=c[t],r=c[t+1];if(n.global&&(n.lastIndex=0),n.test(e))return r}return null},this.abort=function(){return this.abortController.abort(),this._abortController=null,this}}get abortController(){return this._abortController||=new AbortController,this._abortController}},So=class{constructor(e){this.manager=e===void 0?xo:e,this.crossOrigin=`anonymous`,this.withCredentials=!1,this.path=``,this.resourcePath=``,this.requestHeader={},this.priority=`auto`,this.cache=`default`,typeof __THREE_DEVTOOLS__<`u`&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent(`observe`,{detail:this}))}load(){}loadAsync(e,t){let n=this;return new Promise(function(r,i){n.load(e,r,t,i)})}parse(){}setCrossOrigin(e){return this.crossOrigin=e,this}setWithCredentials(e){return this.withCredentials=e,this}setPath(e){return this.path=e,this}setResourcePath(e){return this.resourcePath=e,this}setRequestHeader(e){return this.requestHeader=e,this}setPriority(e){return this.priority=e,this}setCache(e){return this.cache=e,this}abort(){return this}};So.DEFAULT_MATERIAL_NAME=`__DEFAULT`;var Co=new WeakMap,wo=class extends So{constructor(e){super(e)}load(e,t,n,r){this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);let i=this,a=yo.get(`image:${e}`);if(a!==void 0){if(a.complete===!0)i.manager.itemStart(e),setTimeout(function(){t&&t(a),i.manager.itemEnd(e)},0);else{let e=Co.get(a);e===void 0&&(e=[],Co.set(a,e)),e.push({onLoad:t,onError:r})}return a}let o=rn(`img`);function s(){l(),t&&t(this);let n=Co.get(this)||[];for(let e=0;e<n.length;e++){let t=n[e];t.onLoad&&t.onLoad(this)}Co.delete(this),i.manager.itemEnd(e)}function c(t){l(),r&&r(t),yo.remove(`image:${e}`);let n=Co.get(this)||[];for(let e=0;e<n.length;e++){let r=n[e];r.onError&&r.onError(t)}Co.delete(this),i.manager.itemError(e),i.manager.itemEnd(e)}function l(){o.removeEventListener(`load`,s,!1),o.removeEventListener(`error`,c,!1)}return o.addEventListener(`load`,s,!1),o.addEventListener(`error`,c,!1),e.slice(0,5)!==`data:`&&this.crossOrigin!==void 0&&(o.crossOrigin=this.crossOrigin),yo.add(`image:${e}`,o),i.manager.itemStart(e),o.fetchPriority=this.priority,o.src=e,o}},To=class extends So{constructor(e){super(e)}load(e,t,n,r){let i=new nr,a=new wo(this.manager);return a.setPriority(this.priority),a.setCache(this.cache),a.setCrossOrigin(this.crossOrigin),a.setPath(this.path),a.load(e,function(e){i.image=e,i.needsUpdate=!0,t!==void 0&&t(i)},n,r),i}},Eo=new J,Do=new Bn,Oo=new J,ko=class extends Fr{constructor(){super(),this.isCamera=!0,this.type=`Camera`,this.matrixWorldInverse=new cr,this.projectionMatrix=new cr,this.projectionMatrixInverse=new cr,this.coordinateSystem=en,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorld.decompose(Eo,Do,Oo),Oo.x===1&&Oo.y===1&&Oo.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(Eo,Do,Oo.set(1,1,1)).invert()}updateWorldMatrix(e,t,n=!1){super.updateWorldMatrix(e,t,n),this.matrixWorld.decompose(Eo,Do,Oo),Oo.x===1&&Oo.y===1&&Oo.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(Eo,Do,Oo.set(1,1,1)).invert()}clone(){return new this.constructor().copy(this)}},Ao=new J,jo=new q,Mo=new q,No=class extends ko{constructor(e=50,t=1,n=.1,r=2e3){super(),this.isPerspectiveCamera=!0,this.type=`PerspectiveCamera`,this.fov=e,this.zoom=1,this.near=n,this.far=r,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){let t=.5*this.getFilmHeight()/e;this.fov=gn*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){let e=Math.tan(hn*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return gn*2*Math.atan(Math.tan(hn*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,n){Ao.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(Ao.x,Ao.y).multiplyScalar(-e/Ao.z),Ao.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(Ao.x,Ao.y).multiplyScalar(-e/Ao.z)}getViewSize(e,t){return this.getViewBounds(e,jo,Mo),t.subVectors(Mo,jo)}setViewOffset(e,t,n,r,i,a){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=r,this.view.width=i,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=this.near,t=e*Math.tan(hn*.5*this.fov)/this.zoom,n=2*t,r=this.aspect*n,i=-.5*r,a=this.view;if(this.view!==null&&this.view.enabled){let e=a.fullWidth,o=a.fullHeight;i+=a.offsetX*r/e,t-=a.offsetY*n/o,r*=a.width/e,n*=a.height/o}let o=this.filmOffset;o!==0&&(i+=e*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(i,i+r,t,t-n,e,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}},Po=class extends ko{constructor(e=-1,t=1,n=1,r=-1,i=.1,a=2e3){super(),this.isOrthographicCamera=!0,this.type=`OrthographicCamera`,this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=n,this.bottom=r,this.near=i,this.far=a,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,n,r,i,a){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=r,this.view.width=i,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,r=(this.top+this.bottom)/2,i=n-e,a=n+e,o=r+t,s=r-t;if(this.view!==null&&this.view.enabled){let e=(this.right-this.left)/this.view.fullWidth/this.zoom,t=(this.top-this.bottom)/this.view.fullHeight/this.zoom;i+=e*this.view.offsetX,a=i+e*this.view.width,o-=t*this.view.offsetY,s=o-t*this.view.height}this.projectionMatrix.makeOrthographic(i,a,o,s,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}},Fo=class extends Ri{constructor(){super(),this.isInstancedBufferGeometry=!0,this.type=`InstancedBufferGeometry`,this.instanceCount=1/0}copy(e){return super.copy(e),this.instanceCount=e.instanceCount,this}toJSON(){let e=super.toJSON();return e.instanceCount=this.instanceCount,e.isInstancedBufferGeometry=!0,e}},Io=-90,Lo=1,Ro=class extends Fr{constructor(e,t,n){super(),this.type=`CubeCamera`,this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;let r=new No(Io,Lo,e,t);r.layers=this.layers,this.add(r);let i=new No(Io,Lo,e,t);i.layers=this.layers,this.add(i);let a=new No(Io,Lo,e,t);a.layers=this.layers,this.add(a);let o=new No(Io,Lo,e,t);o.layers=this.layers,this.add(o);let s=new No(Io,Lo,e,t);s.layers=this.layers,this.add(s);let c=new No(Io,Lo,e,t);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){let e=this.coordinateSystem,t=this.children.concat(),[n,r,i,a,o,s]=t;for(let e of t)this.remove(e);if(e===2e3)n.up.set(0,1,0),n.lookAt(1,0,0),r.up.set(0,1,0),r.lookAt(-1,0,0),i.up.set(0,0,-1),i.lookAt(0,1,0),a.up.set(0,0,1),a.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),s.up.set(0,1,0),s.lookAt(0,0,-1);else if(e===2001)n.up.set(0,-1,0),n.lookAt(-1,0,0),r.up.set(0,-1,0),r.lookAt(1,0,0),i.up.set(0,0,1),i.lookAt(0,1,0),a.up.set(0,0,-1),a.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),s.up.set(0,-1,0),s.lookAt(0,0,-1);else throw Error(`THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: `+e);for(let e of t)this.add(e),e.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();let{renderTarget:n,activeMipmapLevel:r}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());let[i,a,o,s,c,l]=this.children,u=e.getRenderTarget(),d=e.getActiveCubeFace(),f=e.getActiveMipmapLevel(),p=e.xr.enabled;e.xr.enabled=!1;let m=n.texture.mipmapsAutoUpdate;n.texture.mipmapsAutoUpdate=!1;let h=!1;h=e.isWebGLRenderer===!0?e.state.buffers.depth.getReversed():e.reversedDepthBuffer,e.setRenderTarget(n,0,r),h&&e.autoClear===!1&&e.clearDepth(),e.render(t,i),e.setRenderTarget(n,1,r),h&&e.autoClear===!1&&e.clearDepth(),e.render(t,a),e.setRenderTarget(n,2,r),h&&e.autoClear===!1&&e.clearDepth(),e.render(t,o),e.setRenderTarget(n,3,r),h&&e.autoClear===!1&&e.clearDepth(),e.render(t,s),e.setRenderTarget(n,4,r),h&&e.autoClear===!1&&e.clearDepth(),e.render(t,c),n.texture.mipmapsAutoUpdate=m,e.setRenderTarget(n,5,r),h&&e.autoClear===!1&&e.clearDepth(),e.render(t,l),e.setRenderTarget(u,d,f),e.xr.enabled=p,n.texture.needsPMREMUpdate=!0}},zo=class extends No{constructor(e=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=e,this.perCameraFrustumCulled=!1}},Bo=`\\[\\]\\.:\\/`,Vo=RegExp(`[\\[\\]\\.:\\/]`,`g`),Ho=`[^\\[\\]\\.:\\/]`,Uo=`[^`+Bo.replace(`\\.`,``)+`]`,Wo=`((?:WC+[\\/:])*)`.replace(`WC`,Ho),Go=`(WCOD+)?`.replace(`WCOD`,Uo),Ko=`(?:\\.(WC+)(?:\\[(.+)\\])?)?`.replace(`WC`,Ho),qo=`\\.(WC+)(?:\\[(.+)\\])?`.replace(`WC`,Ho),Jo=RegExp(`^`+Wo+Go+Ko+qo+`$`),Yo=[`material`,`materials`,`bones`,`map`],Xo=class{constructor(e,t,n){let r=n||Zo.parseTrackName(t);this._targetGroup=e,this._bindings=e.subscribe_(t,r)}getValue(e,t){this.bind();let n=this._targetGroup.nCachedObjects_,r=this._bindings[n];r!==void 0&&r.getValue(e,t)}setValue(e,t){let n=this._bindings;for(let r=this._targetGroup.nCachedObjects_,i=n.length;r!==i;++r)n[r].setValue(e,t)}bind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].bind()}unbind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].unbind()}},Zo=class e{constructor(t,n,r){this.path=n,this.parsedPath=r||e.parseTrackName(n),this.node=e.findNode(t,this.parsedPath.nodeName),this.rootNode=t,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(t,n,r){return t&&t.isAnimationObjectGroup?new e.Composite(t,n,r):new e(t,n,r)}static sanitizeNodeName(e){return e.replace(/\s/g,`_`).replace(Vo,``)}static parseTrackName(e){let t=Jo.exec(e);if(t===null)throw Error(`THREE.PropertyBinding: Cannot parse trackName: `+e);let n={nodeName:t[2],objectName:t[3],objectIndex:t[4],propertyName:t[5],propertyIndex:t[6]},r=n.nodeName&&n.nodeName.lastIndexOf(`.`);if(r!==void 0&&r!==-1){let e=n.nodeName.substring(r+1);Yo.indexOf(e)!==-1&&(n.nodeName=n.nodeName.substring(0,r),n.objectName=e)}if(n.propertyName===null||n.propertyName.length===0)throw Error(`THREE.PropertyBinding: can not parse propertyName from trackName: `+e);return n}static findNode(e,t){if(t===void 0||t===``||t===`.`||t===-1||t===e.name||t===e.uuid)return e;if(e.skeleton){let n=e.skeleton.getBoneByName(t);if(n!==void 0)return n}if(e.children){let n=function(e){for(let r=0;r<e.length;r++){let i=e[r];if(i.name===t||i.uuid===t)return i;let a=n(i.children);if(a)return a}return null},r=n(e.children);if(r)return r}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(e,t){e[t]=this.targetObject[this.propertyName]}_getValue_array(e,t){let n=this.resolvedProperty;for(let r=0,i=n.length;r!==i;++r)e[t++]=n[r]}_getValue_arrayElement(e,t){e[t]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(e,t){this.resolvedProperty.toArray(e,t)}_setValue_direct(e,t){this.targetObject[this.propertyName]=e[t]}_setValue_direct_setNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(e,t){let n=this.resolvedProperty;for(let r=0,i=n.length;r!==i;++r)n[r]=e[t++]}_setValue_array_setNeedsUpdate(e,t){let n=this.resolvedProperty;for(let r=0,i=n.length;r!==i;++r)n[r]=e[t++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(e,t){let n=this.resolvedProperty;for(let r=0,i=n.length;r!==i;++r)n[r]=e[t++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(e,t){this.resolvedProperty[this.propertyIndex]=e[t]}_setValue_arrayElement_setNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(e,t){this.resolvedProperty.fromArray(e,t)}_setValue_fromArray_setNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(e,t){this.bind(),this.getValue(e,t)}_setValue_unbound(e,t){this.bind(),this.setValue(e,t)}bind(){let t=this.node,n=this.parsedPath,r=n.objectName,i=n.propertyName,a=n.propertyIndex;if(t||(t=e.findNode(this.rootNode,n.nodeName),this.node=t),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!t){W(`PropertyBinding: No target node found for track: `+this.path+`.`);return}if(r){let e=n.objectIndex;switch(r){case`materials`:if(!t.material){G(`PropertyBinding: Can not bind to material as node does not have a material.`,this);return}if(!t.material.materials){G(`PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.`,this);return}t=t.material.materials;break;case`bones`:if(!t.skeleton){G(`PropertyBinding: Can not bind to bones as node does not have a skeleton.`,this);return}t=t.skeleton.bones;for(let n=0;n<t.length;n++)if(t[n].name===e){e=n;break}break;case`map`:if(`map`in t){t=t.map;break}if(!t.material){G(`PropertyBinding: Can not bind to material as node does not have a material.`,this);return}if(!t.material.map){G(`PropertyBinding: Can not bind to material.map as node.material does not have a map.`,this);return}t=t.material.map;break;default:if(t[r]===void 0){G(`PropertyBinding: Can not bind to objectName of node undefined.`,this);return}t=t[r]}if(e!==void 0){if(t[e]===void 0){G(`PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.`,this,t);return}t=t[e]}}let o=t[i];if(o===void 0){let e=n.nodeName;G(`PropertyBinding: Trying to update property for track: `+e+`.`+i+` but it wasn't found.`,t);return}let s=this.Versioning.None;this.targetObject=t,t.isMaterial===!0?s=this.Versioning.NeedsUpdate:t.isObject3D===!0&&(s=this.Versioning.MatrixWorldNeedsUpdate);let c=this.BindingType.Direct;if(a!==void 0){if(i===`morphTargetInfluences`){if(!t.geometry){G(`PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.`,this);return}if(!t.geometry.morphAttributes){G(`PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.`,this);return}t.morphTargetDictionary[a]!==void 0&&(a=t.morphTargetDictionary[a])}c=this.BindingType.ArrayElement,this.resolvedProperty=o,this.propertyIndex=a}else o.fromArray!==void 0&&o.toArray!==void 0?(c=this.BindingType.HasFromToArray,this.resolvedProperty=o):Array.isArray(o)?(c=this.BindingType.EntireArray,this.resolvedProperty=o):this.propertyName=i;this.getValue=this.GetterByBindingType[c],this.setValue=this.SetterByBindingTypeAndVersioning[c][s]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};Zo.Composite=Xo,Zo.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3},Zo.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2},Zo.prototype.GetterByBindingType=[Zo.prototype._getValue_direct,Zo.prototype._getValue_array,Zo.prototype._getValue_arrayElement,Zo.prototype._getValue_toArray],Zo.prototype.SetterByBindingTypeAndVersioning=[[Zo.prototype._setValue_direct,Zo.prototype._setValue_direct_setNeedsUpdate,Zo.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[Zo.prototype._setValue_array,Zo.prototype._setValue_array_setNeedsUpdate,Zo.prototype._setValue_array_setMatrixWorldNeedsUpdate],[Zo.prototype._setValue_arrayElement,Zo.prototype._setValue_arrayElement_setNeedsUpdate,Zo.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[Zo.prototype._setValue_fromArray,Zo.prototype._setValue_fromArray_setNeedsUpdate,Zo.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var Qo=class extends zi{constructor(e,t,n=1){super(e,t),this.isInstancedInterleavedBuffer=!0,this.meshPerAttribute=n}copy(e){return super.copy(e),this.meshPerAttribute=e.meshPerAttribute,this}clone(e){let t=super.clone(e);return t.meshPerAttribute=this.meshPerAttribute,t}toJSON(e){let t=super.toJSON(e);return t.isInstancedInterleavedBuffer=!0,t.meshPerAttribute=this.meshPerAttribute,t}},$o=new cr,es=class{constructor(e,t,n=0,r=1/0){this.ray=new $i(e,t),this.near=n,this.far=r,this.camera=null,this.layers=new yr,this.params={Mesh:{},Line:{threshold:1},LOD:{},Points:{threshold:1},Sprite:{}}}set(e,t){this.ray.set(e,t)}setFromCamera(e,t){t.isPerspectiveCamera?(this.ray.origin.setFromMatrixPosition(t.matrixWorld),this.ray.direction.set(e.x,e.y,.5).unproject(t).sub(this.ray.origin).normalize(),this.camera=t):t.isOrthographicCamera?(this.ray.origin.set(e.x,e.y,t.projectionMatrix.elements[14]).unproject(t),this.ray.direction.set(0,0,-1).transformDirection(t.matrixWorld),this.camera=t):G(`Raycaster: Unsupported camera type: `+t.type)}setFromXRController(e){return $o.identity().extractRotation(e.matrixWorld),this.ray.origin.setFromMatrixPosition(e.matrixWorld),this.ray.direction.set(0,0,-1).applyMatrix4($o),this}intersectObject(e,t=!0,n=[]){return ns(e,this,n,t),n.sort(ts),n}intersectObjects(e,t=!0,n=[]){for(let r=0,i=e.length;r<i;r++)ns(e[r],this,n,t);return n.sort(ts),n}};function ts(e,t){return e.distance-t.distance}function ns(e,t,n,r){let i=!0;if(e.layers.test(t.layers)&&e.raycast(t,n)===!1&&(i=!1),i===!0&&r===!0){let r=e.children;for(let e=0,i=r.length;e<i;e++)ns(r[e],t,n,!0)}}var rs=class{constructor(e=1,t=0,n=0){this.radius=e,this.phi=t,this.theta=n}set(e,t,n){return this.radius=e,this.phi=t,this.theta=n,this}copy(e){return this.radius=e.radius,this.phi=e.phi,this.theta=e.theta,this}makeSafe(){let e=1e-6;return this.phi=K(this.phi,e,Math.PI-e),this}setFromVector3(e){return this.setFromCartesianCoords(e.x,e.y,e.z)}setFromCartesianCoords(e,t,n){return this.radius=Math.sqrt(e*e+t*t+n*n),this.radius===0?(this.theta=0,this.phi=0):(this.theta=Math.atan2(e,n),this.phi=Math.acos(K(t/this.radius,-1,1))),this}clone(){return new this.constructor().copy(this)}};(class{static{this.prototype.isMatrix2=!0}constructor(e,t,n,r){this.elements=[1,0,0,1],e!==void 0&&this.set(e,t,n,r)}identity(){return this.set(1,0,0,1),this}fromArray(e,t=0){for(let n=0;n<4;n++)this.elements[n]=e[n+t];return this}set(e,t,n,r){let i=this.elements;return i[0]=e,i[2]=t,i[1]=n,i[3]=r,this}});var is=new J,as=new J,os=new J,ss=new J,cs=new J,ls=new J,us=new J,ds=class{constructor(e=new J,t=new J){this.start=e,this.end=t}set(e,t){return this.start.copy(e),this.end.copy(t),this}copy(e){return this.start.copy(e.start),this.end.copy(e.end),this}getCenter(e){return e.addVectors(this.start,this.end).multiplyScalar(.5)}delta(e){return e.subVectors(this.end,this.start)}distanceSq(){return this.start.distanceToSquared(this.end)}distance(){return this.start.distanceTo(this.end)}at(e,t){return this.delta(t).multiplyScalar(e).add(this.start)}closestPointToPointParameter(e,t){is.subVectors(e,this.start),as.subVectors(this.end,this.start);let n=as.dot(as);if(n===0)return 0;let r=as.dot(is)/n;return t&&(r=K(r,0,1)),r}closestPointToPoint(e,t,n){let r=this.closestPointToPointParameter(e,t);return this.delta(n).multiplyScalar(r).add(this.start)}distanceSqToLine3(e,t=ls,n=us){let r=1e-8*1e-8,i,a,o=this.start,s=e.start,c=this.end,l=e.end;os.subVectors(c,o),ss.subVectors(l,s),cs.subVectors(o,s);let u=os.dot(os),d=ss.dot(ss),f=ss.dot(cs);if(u<=r&&d<=r)return t.copy(o),n.copy(s),t.distanceToSquared(n);if(u<=r)i=0,a=f/d,a=K(a,0,1);else{let e=os.dot(cs);if(d<=r)a=0,i=K(-e/u,0,1);else{let t=os.dot(ss),n=u*d-t*t;i=n===0?0:K((t*f-e*d)/n,0,1),a=(t*i+f)/d,a<0?(a=0,i=K(-e/u,0,1)):a>1&&(a=1,i=K((t-e)/u,0,1))}}return t.copy(o).addScaledVector(os,i),n.copy(s).addScaledVector(ss,a),t.distanceToSquared(n)}applyMatrix4(e){return this.start.applyMatrix4(e),this.end.applyMatrix4(e),this}equals(e){return e.start.equals(this.start)&&e.end.equals(this.end)}clone(){return new this.constructor().copy(this)}},fs=class extends fn{constructor(e,t=null){super(),this.object=e,this.domElement=t,this.enabled=!0,this.state=-1,this.keys={},this.mouseButtons={LEFT:null,MIDDLE:null,RIGHT:null},this.touches={ONE:null,TWO:null}}connect(e){this.domElement!==null&&this.disconnect(),this.domElement=e}disconnect(){}dispose(){}update(){}};function ps(e,t,n,r){let i=ms(r);switch(n){case qe:return e*t;case Qe:return e*t/i.components*i.byteLength;case $e:return e*t/i.components*i.byteLength;case et:return e*t*2/i.components*i.byteLength;case tt:return e*t*2/i.components*i.byteLength;case Je:return e*t*3/i.components*i.byteLength;case Ye:return e*t*4/i.components*i.byteLength;case nt:return e*t*4/i.components*i.byteLength;case rt:case it:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*8;case at:case ot:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*16;case ct:case ut:return Math.max(e,16)*Math.max(t,8)/4;case st:case lt:return Math.max(e,8)*Math.max(t,8)/2;case dt:case ft:case mt:case ht:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*8;case pt:case gt:case _t:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*16;case vt:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*16;case yt:return Math.floor((e+4)/5)*Math.floor((t+3)/4)*16;case bt:return Math.floor((e+4)/5)*Math.floor((t+4)/5)*16;case xt:return Math.floor((e+5)/6)*Math.floor((t+4)/5)*16;case St:return Math.floor((e+5)/6)*Math.floor((t+5)/6)*16;case Ct:return Math.floor((e+7)/8)*Math.floor((t+4)/5)*16;case wt:return Math.floor((e+7)/8)*Math.floor((t+5)/6)*16;case Tt:return Math.floor((e+7)/8)*Math.floor((t+7)/8)*16;case Et:return Math.floor((e+9)/10)*Math.floor((t+4)/5)*16;case Dt:return Math.floor((e+9)/10)*Math.floor((t+5)/6)*16;case Ot:return Math.floor((e+9)/10)*Math.floor((t+7)/8)*16;case kt:return Math.floor((e+9)/10)*Math.floor((t+9)/10)*16;case At:return Math.floor((e+11)/12)*Math.floor((t+9)/10)*16;case jt:return Math.floor((e+11)/12)*Math.floor((t+11)/12)*16;case Mt:case Nt:case Pt:return Math.ceil(e/4)*Math.ceil(t/4)*16;case Ft:case It:return Math.ceil(e/4)*Math.ceil(t/4)*8;case Lt:case Rt:return Math.ceil(e/4)*Math.ceil(t/4)*16}throw Error(`Unable to determine texture byte length for ${n} format.`)}function ms(e){switch(e){case Pe:case Fe:return{byteLength:1,components:1};case Le:case Ie:case Ve:return{byteLength:2,components:1};case He:case Ue:return{byteLength:2,components:4};case ze:case Re:case Be:return{byteLength:4,components:1};case Ge:case Ke:return{byteLength:4,components:3}}throw Error(`THREE.TextureUtils: Unknown texture type ${e}.`)}typeof __THREE_DEVTOOLS__<`u`&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent(`register`,{detail:{revision:`187`}})),typeof window<`u`&&(window.__THREE__?W(`WARNING: Multiple instances of Three.js being imported.`):window.__THREE__=`187`);function hs(){let e=null,t=!1,n=null,r=null;function i(t,a){r=e.requestAnimationFrame(i),n(t,a)}return{start:function(){t!==!0&&n!==null&&e!==null&&(r=e.requestAnimationFrame(i),t=!0)},stop:function(){e!==null&&e.cancelAnimationFrame(r),t=!1},setAnimationLoop:function(e){n=e},setContext:function(t){e=t}}}function gs(e){let t=new WeakMap;function n(t,n){let r=t.array,i=t.usage,a=r.byteLength,o=e.createBuffer();e.bindBuffer(n,o),e.bufferData(n,r,i),t.onUploadCallback();let s;if(r instanceof Float32Array)s=e.FLOAT;else if(typeof Float16Array<`u`&&r instanceof Float16Array)s=e.HALF_FLOAT;else if(r instanceof Uint16Array)s=t.isFloat16BufferAttribute?e.HALF_FLOAT:e.UNSIGNED_SHORT;else if(r instanceof Int16Array)s=e.SHORT;else if(r instanceof Uint32Array)s=e.UNSIGNED_INT;else if(r instanceof Int32Array)s=e.INT;else if(r instanceof Int8Array)s=e.BYTE;else if(r instanceof Uint8Array)s=e.UNSIGNED_BYTE;else if(r instanceof Uint8ClampedArray)s=e.UNSIGNED_BYTE;else throw Error(`THREE.WebGLAttributes: Unsupported buffer data format: `+r);return{buffer:o,type:s,bytesPerElement:r.BYTES_PER_ELEMENT,version:t.version,size:a}}function r(t,n,r){let i=n.array,a=n.updateRanges;if(e.bindBuffer(r,t),a.length===0)e.bufferSubData(r,0,i);else{a.sort((e,t)=>e.start-t.start);let t=0;for(let e=1;e<a.length;e++){let n=a[t],r=a[e];r.start<=n.start+n.count+1?n.count=Math.max(n.count,r.start+r.count-n.start):(++t,a[t]=r)}a.length=t+1;for(let t=0,n=a.length;t<n;t++){let n=a[t];e.bufferSubData(r,n.start*i.BYTES_PER_ELEMENT,i,n.start,n.count)}n.clearUpdateRanges()}n.onUploadCallback()}function i(e){return e.isInterleavedBufferAttribute&&(e=e.data),t.get(e)}function a(n){n.isInterleavedBufferAttribute&&(n=n.data);let r=t.get(n);r&&(e.deleteBuffer(r.buffer),t.delete(n))}function o(e,i){if(e.isInterleavedBufferAttribute&&(e=e.data),e.isGLBufferAttribute){let n=t.get(e);(!n||n.version<e.version)&&t.set(e,{buffer:e.buffer,type:e.type,bytesPerElement:e.elementSize,version:e.version});return}let a=t.get(e);if(a===void 0)t.set(e,n(e,i));else if(a.version<e.version){if(a.size!==e.array.byteLength)throw Error(`THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.`);r(a.buffer,e,i),a.version=e.version}}return{get:i,remove:a,update:o}}var Q={alphahash_fragment:`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,alphahash_pars_fragment:`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,alphamap_fragment:`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,alphamap_pars_fragment:`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,alphatest_fragment:`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,alphatest_pars_fragment:`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,aomap_fragment:`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,aomap_pars_fragment:`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,batching_pars_vertex:`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec4 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 );
	}
#endif`,batching_vertex:`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,begin_vertex:`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,beginnormal_vertex:`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,bsdfs:`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,iridescence_fragment:`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,bumpmap_pars_fragment:`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,clipping_planes_fragment:`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,clipping_planes_pars_fragment:`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,clipping_planes_pars_vertex:`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,clipping_planes_vertex:`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,color_fragment:`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#endif`,color_pars_fragment:`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#endif`,color_pars_vertex:`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec4 vColor;
#endif`,color_vertex:`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec4( 1.0 );
#endif
#ifdef USE_COLOR_ALPHA
	vColor *= color;
#elif defined( USE_COLOR )
	vColor.rgb *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.rgb *= instanceColor.rgb;
#endif
#ifdef USE_BATCHING_COLOR
	vColor *= getBatchingColor( getIndirectIndex( gl_DrawID ) );
#endif`,common:`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
#define inverseTransformDirection transformDirectionByInverseViewMatrix
vec3 transformNormalByInverseViewMatrix( in vec3 normal, in mat4 viewMatrix ) {
	return normalize( ( vec4( normal, 0.0 ) * viewMatrix ).xyz );
}
vec3 transformDirectionByInverseViewMatrix( in vec3 dir, in mat4 viewMatrix ) {
	return normalize( ( vec4( dir, 0.0 ) * viewMatrix ).xyz );
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,defaultnormal_vertex:`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
#endif`,displacementmap_pars_vertex:`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,displacementmap_vertex:`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,emissivemap_fragment:`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,emissivemap_pars_fragment:`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,colorspace_fragment:`gl_FragColor = linearToOutputTexel( gl_FragColor );`,colorspace_pars_fragment:`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,envmap_fragment:`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * reflectVec );
		#ifdef ENVMAP_BLENDING_MULTIPLY
			outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_MIX )
			outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_ADD )
			outgoingLight += envColor.xyz * specularStrength * reflectivity;
		#endif
	#endif
#endif`,envmap_common_pars_fragment:`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform mat3 envMapRotation;
	uniform samplerCube envMap;
	#ifdef ENVMAP_TYPE_PMREM
		float roughnessToMip( const in float roughness ) {
			float r = clamp( roughness, 0.0, 1.0 );
			return ENVMAP_MAX_LOD * r * ( 2.0 - r );
		}
	#endif
#endif`,envmap_pars_fragment:`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,envmap_pars_vertex:`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,envmap_physical_pars_fragment:`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_PMREM
			vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
			vec4 envMapColor = textureLod( envMap, envMapRotation * worldNormal, ENVMAP_MAX_LOD );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_PMREM
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, pow4( roughness ) ) );
			reflectVec = transformDirectionByInverseViewMatrix( reflectVec, viewMatrix );
			vec4 envMapColor = textureLod( envMap, envMapRotation * reflectVec, roughnessToMip( roughness ) );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_RETROREFLECTION
		vec3 getIBLRetroRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
			#ifdef ENVMAP_TYPE_PMREM
				vec3 retroVec = normalize( mix( viewDir, normal, pow4( roughness ) ) );
				retroVec = transformDirectionByInverseViewMatrix( retroVec, viewMatrix );
				vec4 envMapColor = textureLod( envMap, envMapRotation * retroVec, roughnessToMip( roughness ) );
				return envMapColor.rgb * envMapIntensity;
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_PMREM
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
		#ifdef USE_RETROREFLECTION
			vec3 getIBLAnisotropyRetroRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
				#ifdef ENVMAP_TYPE_PMREM
					vec3 bentNormal = cross( bitangent, viewDir );
					bentNormal = normalize( cross( bentNormal, bitangent ) );
					bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
					return getIBLRetroRadiance( viewDir, bentNormal, roughness );
				#else
					return vec3( 0.0 );
				#endif
			}
		#endif
	#endif
#endif`,envmap_vertex:`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,fog_vertex:`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,fog_pars_vertex:`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,fog_fragment:`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,fog_pars_fragment:`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,gradientmap_pars_fragment:`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,lightmap_pars_fragment:`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,lights_lambert_fragment:`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,lights_lambert_pars_fragment:`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,lights_pars_begin:`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_SUN_LIGHTS > 0
	struct SunLight {
		vec3 direction;
		vec3 color;
	};
	uniform SunLight sunLights[ NUM_SUN_LIGHTS ];
	void getSunLightInfo( const in SunLight sunLight, out IncidentLight light ) {
		light.color = sunLight.color;
		light.direction = sunLight.direction;
		light.visible = true;
	}
#endif
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif
#include <lightprobes_pars_fragment>`,lights_toon_fragment:`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,lights_toon_pars_fragment:`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,lights_phong_fragment:`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,lights_phong_pars_fragment:`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,lights_physical_fragment:`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.diffuseContribution = diffuseColor.rgb * ( 1.0 - metalnessFactor );
material.metalness = metalnessFactor;
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.045 );
material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef USE_DIFFUSE_ROUGHNESS
	float diffuseRoughnessFactor = diffuseRoughness;
	#ifdef USE_DIFFUSE_ROUGHNESSMAP
		diffuseRoughnessFactor *= texture2D( diffuseRoughnessMap, vDiffuseRoughnessMapUv ).r;
	#endif
	material.diffuseRoughness = saturate( diffuseRoughnessFactor );
#endif
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor;
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = vec3( 0.04 );
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.045 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_RETROREFLECTION
	material.retroreflectivity = retroreflectivity;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.0001, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,lights_physical_pars_fragment:`uniform sampler2D dfgLUT;
struct PhysicalMaterial {
	vec3 diffuseColor;
	vec3 diffuseContribution;
	vec3 specularColor;
	vec3 specularColorBlended;
	float roughness;
	float metalness;
	float specularF90;
	float dispersion;
	vec2 dfg;
	vec3 multiScatteringCompensation;
	#ifdef USE_DIFFUSE_ROUGHNESS
		float diffuseRoughness;
	#endif
	#ifdef USE_RETROREFLECTION
		float retroreflectivity;
	#endif
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0Dielectric;
		vec3 iridescenceF0Metallic;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
#ifdef USE_DIFFUSE_ROUGHNESS
	const float EON_EPSILON = 1e-7;
	float FON_DirectionalAlbedo( const in float mu, const in float roughness, const in float A ) {
		float muComp = 1.0 - mu;
		float gOverPi = muComp * ( 0.0571085289 + muComp * ( 0.491881867 + muComp * ( - 0.332181442 + muComp * 0.0714429953 ) ) );
		return A * ( 1.0 + roughness * gOverPi );
	}
	vec3 BRDF_EON( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 diffuseColor, const in float roughness ) {
		vec3 rho = saturate( diffuseColor );
		if ( roughness <= EON_EPSILON ) return BRDF_Lambert( rho );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float s = dot( lightDir, viewDir ) - dotNL * dotNV;
		float sOverT = ( s > 0.0 ) ? s / max( max( dotNL, dotNV ), EON_EPSILON ) : s;
		float A = 1.0 / ( 1.0 + ( 0.5 - 2.0 / ( 3.0 * PI ) ) * roughness );
		vec3 singleScatter = rho * RECIPROCAL_PI * A * ( 1.0 + roughness * sOverT );
		float averageAlbedo = A * ( 1.0 + ( 2.0 / 3.0 - 28.0 / ( 15.0 * PI ) ) * roughness );
		float albedoV = FON_DirectionalAlbedo( dotNV, roughness, A );
		float albedoL = FON_DirectionalAlbedo( dotNL, roughness, A );
		vec3 rhoMultiScatter = rho * rho * averageAlbedo / max( vec3( EON_EPSILON ), vec3( 1.0 ) - rho * ( 1.0 - averageAlbedo ) );
		vec3 multiScatter = rhoMultiScatter * RECIPROCAL_PI
			* max( EON_EPSILON, 1.0 - albedoV )
			* max( EON_EPSILON, 1.0 - albedoL )
			/ max( EON_EPSILON, 1.0 - averageAlbedo );
		return singleScatter + multiScatter;
	}
	vec3 EON_DirectionalAlbedo( const in vec3 diffuseColor, const in float roughness, const in float dotNV ) {
		vec3 rho = saturate( diffuseColor );
		if ( roughness <= EON_EPSILON ) return rho;
		float A = 1.0 / ( 1.0 + ( 0.5 - 2.0 / ( 3.0 * PI ) ) * roughness );
		float directionalAlbedo = FON_DirectionalAlbedo( dotNV, roughness, A );
		float averageAlbedo = A * ( 1.0 + ( 2.0 / 3.0 - 28.0 / ( 15.0 * PI ) ) * roughness );
		vec3 rhoMultiScatter = rho * rho * averageAlbedo / max( vec3( EON_EPSILON ), vec3( 1.0 ) - rho * ( 1.0 - averageAlbedo ) );
		return rho * directionalAlbedo + rhoMultiScatter * ( 1.0 - directionalAlbedo );
	}
#endif
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		return 0.5 / max( gv + gl, EPSILON );
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = max( material.clearcoatRoughness, 0.045 );
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColorBlended;
	float f90 = material.specularF90;
	float roughness = max( material.roughness, 0.045 );
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float alphaT = max( material.alphaT, alpha );
		float V = V_GGX_SmithCorrelated_Anisotropic( alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transpose( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float rInv = 1.0 / ( roughness + 0.1 );
	float a = -1.9362 + 1.0678 * roughness + 0.4573 * r2 - 0.8469 * rInv;
	float b = -0.6014 + 0.5538 * roughness - 0.4670 * r2 - 0.1255 * rInv;
	float DG = exp( a * dotNV + b );
	return saturate( DG );
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 fab = texture2D( dfgLUT, vec2( roughness, dotNV ) ).rg;
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec2 fab, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec2 fab, const in vec3 specularColor, const in float specularF90, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColorBlended * t2.x + ( material.specularF90 - material.specularColorBlended ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseContribution * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
		#ifdef USE_CLEARCOAT
			vec3 Ncc = geometryClearcoatNormal;
			vec2 uvClearcoat = LTC_Uv( Ncc, viewDir, material.clearcoatRoughness );
			vec4 t1Clearcoat = texture2D( ltc_1, uvClearcoat );
			vec4 t2Clearcoat = texture2D( ltc_2, uvClearcoat );
			mat3 mInvClearcoat = mat3(
				vec3( t1Clearcoat.x, 0, t1Clearcoat.y ),
				vec3(             0, 1,             0 ),
				vec3( t1Clearcoat.z, 0, t1Clearcoat.w )
			);
			vec3 fresnelClearcoat = material.clearcoatF0 * t2Clearcoat.x + ( material.clearcoatF90 - material.clearcoatF0 ) * t2Clearcoat.y;
			clearcoatSpecularDirect += lightColor * fresnelClearcoat * LTC_Evaluate( Ncc, viewDir, position, mInvClearcoat, rectCoords );
		#endif
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
 
 		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
 
 		float sheenAlbedoV = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
 		float sheenAlbedoL = IBLSheenBRDF( geometryNormal, directLight.direction, material.sheenRoughness );
 
 		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * max( sheenAlbedoV, sheenAlbedoL );
 
 		irradiance *= sheenEnergyComp;
 
 	#endif
	vec3 specularBRDF = BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	#ifdef USE_RETROREFLECTION
		vec3 retroViewDir = reflect( - geometryViewDir, geometryNormal );
		vec3 retroSpecularBRDF = BRDF_GGX( directLight.direction, retroViewDir, geometryNormal, material );
		specularBRDF = mix( specularBRDF, retroSpecularBRDF, saturate( material.retroreflectivity ) );
	#endif
	reflectedLight.directSpecular += irradiance * specularBRDF * material.multiScatteringCompensation;
	vec3 halfDir = normalize( directLight.direction + geometryViewDir );
	float dotVH = saturate( dot( geometryViewDir, halfDir ) );
	vec3 F = F_Schlick( material.specularColor, material.specularF90, dotVH );
	#ifdef USE_RETROREFLECTION
		vec3 retroHalfDir = normalize( directLight.direction + retroViewDir );
		float dotRetroVH = saturate( dot( retroViewDir, retroHalfDir ) );
		vec3 retroF = F_Schlick( material.specularColor, material.specularF90, dotRetroVH );
		F = mix( F, retroF, saturate( material.retroreflectivity ) );
	#endif
	#ifdef USE_DIFFUSE_ROUGHNESS
		vec3 diffuseBRDF = BRDF_EON( directLight.direction, geometryViewDir, geometryNormal, material.diffuseColor, material.diffuseRoughness ) * ( 1.0 - material.metalness );
	#else
		vec3 diffuseBRDF = BRDF_Lambert( material.diffuseContribution );
	#endif
	reflectedLight.directDiffuse += irradiance * diffuseBRDF * ( 1.0 - F );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( material.dfg, material.specularColor, material.specularF90, material.iridescence, material.iridescenceF0Dielectric, singleScattering, multiScattering );
	#else
		computeMultiscattering( material.dfg, material.specularColor, material.specularF90, singleScattering, multiScattering );
	#endif
	#ifdef USE_DIFFUSE_ROUGHNESS
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		vec3 diffuseAlbedo = EON_DirectionalAlbedo( material.diffuseColor, material.diffuseRoughness, dotNV ) * ( 1.0 - material.metalness );
		vec3 diffuse = irradiance * RECIPROCAL_PI * diffuseAlbedo * ( 1.0 - singleScattering - multiScattering );
	#else
		vec3 diffuse = irradiance * BRDF_Lambert( material.diffuseContribution ) * ( 1.0 - singleScattering - multiScattering );
	#endif
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		sheenSpecularIndirect += irradiance * material.sheenColor * sheenAlbedo * RECIPROCAL_PI;
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		diffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectDiffuse += diffuse;
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness ) * RECIPROCAL_PI;
 	#endif
	vec3 singleScatteringDielectric = vec3( 0.0 );
	vec3 multiScatteringDielectric = vec3( 0.0 );
	vec3 singleScatteringMetallic = vec3( 0.0 );
	vec3 multiScatteringMetallic = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( material.dfg, material.specularColor, material.specularF90, material.iridescence, material.iridescenceF0Dielectric, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscatteringIridescence( material.dfg, material.diffuseColor, material.specularF90, material.iridescence, material.iridescenceF0Metallic, singleScatteringMetallic, multiScatteringMetallic );
	#else
		computeMultiscattering( material.dfg, material.specularColor, material.specularF90, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscattering( material.dfg, material.diffuseColor, material.specularF90, singleScatteringMetallic, multiScatteringMetallic );
	#endif
	vec3 singleScattering = mix( singleScatteringDielectric, singleScatteringMetallic, material.metalness );
	vec3 multiScattering = mix( multiScatteringDielectric, multiScatteringMetallic, material.metalness );
	vec3 totalScatteringDielectric = singleScatteringDielectric + multiScatteringDielectric;
	#ifdef USE_DIFFUSE_ROUGHNESS
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		vec3 diffuse = EON_DirectionalAlbedo( material.diffuseColor, material.diffuseRoughness, dotNV ) * ( 1.0 - material.metalness ) * ( 1.0 - totalScatteringDielectric );
	#else
		vec3 diffuse = material.diffuseContribution * ( 1.0 - totalScatteringDielectric );
	#endif
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	vec3 indirectSpecular = radiance * singleScattering;
	indirectSpecular += multiScattering * cosineWeightedIrradiance;
	vec3 indirectDiffuse = diffuse * cosineWeightedIrradiance;
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		indirectSpecular *= sheenEnergyComp;
		indirectDiffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectSpecular += indirectSpecular;
	reflectedLight.indirectDiffuse += indirectDiffuse;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,lights_fragment_begin:`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		vec3 iridescenceFresnelDielectric = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		vec3 iridescenceFresnelMetallic = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.diffuseColor );
		material.iridescenceFresnel = mix( iridescenceFresnelDielectric, iridescenceFresnelMetallic, material.metalness );
		material.iridescenceF0Dielectric = Schlick_to_F0( iridescenceFresnelDielectric, 1.0, dotNVi );
		material.iridescenceF0Metallic = Schlick_to_F0( iridescenceFresnelMetallic, 1.0, dotNVi );
	}
#endif
#ifdef STANDARD
	float dotNVms = saturate( dot( geometryNormal, geometryViewDir ) );
	material.dfg = texture2D( dfgLUT, vec2( material.roughness, dotNVms ) ).rg;
	#if ( NUM_SUN_LIGHTS > 0 || NUM_DIR_LIGHTS > 0 || NUM_POINT_LIGHTS > 0 || NUM_SPOT_LIGHTS > 0 )
		float EssMs = material.dfg.x + material.dfg.y;
		material.multiScatteringCompensation = 1.0 + material.specularColorBlended * ( 1.0 / EssMs - 1.0 );
	#endif
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS ) && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SUN_LIGHTS > 0 ) && defined( RE_Direct )
	SunLight sunLight;
	#if defined( USE_SHADOWMAP ) && NUM_SUN_LIGHT_SHADOWS > 0
	SunLightShadow sunLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SUN_LIGHTS; i ++ ) {
		sunLight = sunLights[ i ];
		getSunLightInfo( sunLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SUN_LIGHT_SHADOWS )
		sunLightShadow = sunLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getSunShadow( sunShadowMap[ i ], sunLightShadow, UNROLLED_LOOP_INDEX ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_LIGHT_PROBE_GRIDS > 0
		vec3 probeWorldPos = ( ( vec4( geometryPosition, 1.0 ) - viewMatrix[ 3 ] ) * viewMatrix ).xyz;
		vec3 probeWorldNormal = transformNormalByInverseViewMatrix( geometryNormal, viewMatrix );
		int probeGrid = - 1;
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_LIGHT_PROBE_GRIDS; i ++ ) {
			if ( isInsideLightProbeGrid( probeWorldPos, probeWorldNormal, probesMin[ i ], probesMax[ i ], probesResolution[ i ] ) ) probeGrid = UNROLLED_LOOP_INDEX;
		}
		#pragma unroll_loop_end
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_LIGHT_PROBE_GRIDS; i ++ ) {
			if ( probeGrid == UNROLLED_LOOP_INDEX ) irradiance += getLightProbeGridIrradiance( probesSH[ i ], probesMin[ i ], probesMax[ i ], probesResolution[ i ], probeWorldPos, probeWorldNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,lights_fragment_maps:`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( ENVMAP_TYPE_PMREM )
		#if defined( STANDARD ) || defined( LAMBERT ) || defined( PHONG )
			iblIrradiance += getIBLIrradiance( geometryNormal );
		#endif
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		vec3 iblRadiance = getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		vec3 iblRadiance = getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_RETROREFLECTION
		#ifdef USE_ANISOTROPY
			vec3 retroIBLRadiance = getIBLAnisotropyRetroRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
		#else
			vec3 retroIBLRadiance = getIBLRetroRadiance( geometryViewDir, geometryNormal, material.roughness );
		#endif
		iblRadiance = mix( iblRadiance, retroIBLRadiance, saturate( material.retroreflectivity ) );
	#endif
	radiance += iblRadiance;
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,lights_fragment_end:`#if defined( RE_IndirectDiffuse )
	#if defined( LAMBERT ) || defined( PHONG )
		irradiance += iblIrradiance;
	#endif
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,lightprobes_pars_fragment:`#if NUM_LIGHT_PROBE_GRIDS > 0
uniform highp sampler3D probesSH[ NUM_LIGHT_PROBE_GRIDS ];
uniform vec3 probesMin[ NUM_LIGHT_PROBE_GRIDS ];
uniform vec3 probesMax[ NUM_LIGHT_PROBE_GRIDS ];
uniform vec3 probesResolution[ NUM_LIGHT_PROBE_GRIDS ];
bool isInsideLightProbeGrid( vec3 worldPos, vec3 worldNormal, vec3 probesMin, vec3 probesMax, vec3 probesResolution ) {
	vec3 spacing = ( probesMax - probesMin ) / probesResolution;
	vec3 samplePos = worldPos + worldNormal * spacing * 0.5;
	vec3 margin = spacing * 0.01;
	return all( greaterThanEqual( samplePos, probesMin - margin ) ) && all( lessThanEqual( samplePos, probesMax + margin ) );
}
vec3 getLightProbeGridIrradiance( highp sampler3D probesSH, vec3 probesMin, vec3 probesMax, vec3 probesResolution, vec3 worldPos, vec3 worldNormal ) {
	vec3 res = probesResolution;
	vec3 gridRange = probesMax - probesMin;
	vec3 probeSpacing = gridRange / res;
	vec3 samplePos = worldPos + worldNormal * probeSpacing * 0.5;
	vec3 uvw = clamp( ( samplePos - probesMin ) / gridRange, 0.5 / res, 1.0 - 0.5 / res );
	float nz          = res.z;
	float paddedSlices = nz + 2.0;
	float atlasDepth  = 7.0 * paddedSlices;
	float uvZBase     = uvw.z * nz + 1.0;
	vec4 s0 = texture( probesSH, vec3( uvw.xy, ( uvZBase                       ) / atlasDepth ) );
	vec4 s1 = texture( probesSH, vec3( uvw.xy, ( uvZBase +       paddedSlices   ) / atlasDepth ) );
	vec4 s2 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 2.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s3 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 3.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s4 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 4.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s5 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 5.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s6 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 6.0 * paddedSlices   ) / atlasDepth ) );
	vec3 c0 = s0.xyz;
	vec3 c1 = vec3( s0.w, s1.xy );
	vec3 c2 = vec3( s1.zw, s2.x );
	vec3 c3 = s2.yzw;
	vec3 c4 = s3.xyz;
	vec3 c5 = vec3( s3.w, s4.xy );
	vec3 c6 = vec3( s4.zw, s5.x );
	vec3 c7 = s5.yzw;
	vec3 c8 = s6.xyz;
	float x = worldNormal.x, y = worldNormal.y, z = worldNormal.z;
	vec3 result = c0 * 0.886227;
	result += c1 * 2.0 * 0.511664 * y;
	result += c2 * 2.0 * 0.511664 * z;
	result += c3 * 2.0 * 0.511664 * x;
	result += c4 * 2.0 * 0.429043 * x * y;
	result += c5 * 2.0 * 0.429043 * y * z;
	result += c6 * ( 0.743125 * z * z - 0.247708 );
	result += c7 * 2.0 * 0.429043 * x * z;
	result += c8 * 0.429043 * ( x * x - y * y );
	return max( result, vec3( 0.0 ) );
}
#endif`,logdepthbuf_fragment:`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,logdepthbuf_pars_fragment:`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,logdepthbuf_pars_vertex:`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,logdepthbuf_vertex:`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,map_fragment:`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,map_pars_fragment:`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,map_particle_fragment:`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,map_particle_pars_fragment:`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,metalnessmap_fragment:`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,metalnessmap_pars_fragment:`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,morphinstance_vertex:`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,morphcolor_vertex:`#if defined( USE_MORPHCOLORS )
	#if defined( USE_COLOR_ALPHA )
		vColor *= morphTargetBaseInfluence;
	#elif defined( USE_COLOR )
		vColor.rgb *= morphTargetBaseInfluence;
	#endif
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor.rgb += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,morphnormal_vertex:`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,morphtarget_pars_vertex:`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,morphtarget_vertex:`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,normal_fragment_begin:`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#ifdef DOUBLE_SIDED
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#ifdef DOUBLE_SIDED
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,normal_fragment_maps:`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#if defined( USE_PACKED_NORMALMAP )
		mapN = vec3( mapN.xy, sqrt( saturate( 1.0 - dot( mapN.xy, mapN.xy ) ) ) );
	#endif
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,normal_pars_fragment:`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,normal_pars_vertex:`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,normal_vertex:`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
		#ifdef FLIP_SIDED
			vBitangent = - vBitangent;
		#endif
	#endif
#endif`,normalmap_pars_fragment:`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,clearcoat_normal_fragment_begin:`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,clearcoat_normal_fragment_maps:`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,clearcoat_pars_fragment:`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,iridescence_pars_fragment:`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,opaque_fragment:`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,packing:`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	#ifdef USE_REVERSED_DEPTH_BUFFER
	
		return depth * ( far - near ) - far;
	#else
		return depth * ( near - far ) - near;
	#endif
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	
	#ifdef USE_REVERSED_DEPTH_BUFFER
		return ( near * far ) / ( ( near - far ) * depth - near );
	#else
		return ( near * far ) / ( ( far - near ) * depth - far );
	#endif
}`,premultiplied_alpha_fragment:`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,project_vertex:`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,dithering_fragment:`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,dithering_pars_fragment:`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,roughnessmap_fragment:`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,roughnessmap_pars_fragment:`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,shadowmap_pars_fragment:`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
		#define SUN_LIGHT_CASCADES 2
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow sunShadowMap[ NUM_SUN_LIGHT_SHADOWS ];
		#else
			uniform sampler2D sunShadowMap[ NUM_SUN_LIGHT_SHADOWS ];
		#endif
		uniform mat4 sunShadowMatrix[ NUM_SUN_LIGHT_SHADOWS * SUN_LIGHT_CASCADES ];
		uniform vec4 sunShadowCascade[ NUM_SUN_LIGHT_SHADOWS * SUN_LIGHT_CASCADES ];
		varying vec4 vSunShadowWorldPosition;
		varying vec3 vSunShadowWorldNormal;
		struct SunLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SunLightShadow sunLightShadows[ NUM_SUN_LIGHT_SHADOWS ];
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#else
			uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#endif
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#else
			uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#endif
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform samplerCubeShadow pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#elif defined( SHADOWMAP_TYPE_BASIC )
			uniform samplerCube pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#endif
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float interleavedGradientNoise( vec2 position ) {
			return fract( 52.9829189 * fract( dot( position, vec2( 0.06711056, 0.00583715 ) ) ) );
		}
		vec2 vogelDiskSample( int sampleIndex, int samplesCount, float phi ) {
			const float goldenAngle = 2.399963229728653;
			float r = sqrt( ( float( sampleIndex ) + 0.5 ) / float( samplesCount ) );
			float theta = float( sampleIndex ) * goldenAngle + phi;
			return vec2( cos( theta ), sin( theta ) ) * r;
		}
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float getShadow( sampler2DShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
				vec2 radius = shadowRadius * texelSize;
				float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
				shadow = (
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 0, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 1, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 2, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 3, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 4, 5, phi ) * radius, shadowCoord.z ) )
				) * 0.2;
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#elif defined( SHADOWMAP_TYPE_VSM )
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 distribution = texture2D( shadowMap, shadowCoord.xy ).rg;
				float mean = distribution.x;
				float variance = distribution.y * distribution.y;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					float hard_shadow = step( mean, shadowCoord.z );
				#else
					float hard_shadow = step( shadowCoord.z, mean );
				#endif
				
				if ( hard_shadow == 1.0 ) {
					shadow = 1.0;
				} else {
					variance = max( variance, 0.0000001 );
					float d = shadowCoord.z - mean;
					float p_max = variance / ( variance + d * d );
					p_max = clamp( ( p_max - 0.3 ) / 0.65, 0.0, 1.0 );
					shadow = max( hard_shadow, p_max );
				}
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#else
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				float depth = texture2D( shadowMap, shadowCoord.xy ).r;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					shadow = step( depth, shadowCoord.z );
				#else
					shadow = step( shadowCoord.z, depth );
				#endif
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#endif
	#if NUM_SUN_LIGHT_SHADOWS > 0
		float getSunShadow(
			#if defined( SHADOWMAP_TYPE_PCF )
				sampler2DShadow shadowMap,
			#else
				sampler2D shadowMap,
			#endif
			SunLightShadow sunLightShadow,
			int shadowIndex
		) {
			vec4 shadowWorldPosition = vec4( vSunShadowWorldPosition.xyz + vSunShadowWorldNormal * sunLightShadow.shadowNormalBias, 1.0 );
			float viewDepth = vSunShadowWorldPosition.w;
			int cascadeOffset = shadowIndex * SUN_LIGHT_CASCADES;
			float shadow = 1.0;
			for ( int i = SUN_LIGHT_CASCADES - 1; i >= 0; i -- ) {
				vec4 cascade = sunShadowCascade[ cascadeOffset + i ];
				if ( viewDepth >= cascade.x && viewDepth < cascade.y ) {
					float cascadeShadow = getShadow(
						shadowMap,
						sunLightShadow.shadowMapSize,
						sunLightShadow.shadowIntensity,
						sunLightShadow.shadowBias,
						sunLightShadow.shadowRadius,
						sunShadowMatrix[ cascadeOffset + i ] * shadowWorldPosition
					);
					shadow = mix( cascadeShadow, shadow, smoothstep( cascade.z, cascade.y, viewDepth ) );
				}
			}
			return shadow;
		}
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	#if defined( SHADOWMAP_TYPE_PCF )
	float getPointShadow( samplerCubeShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 bd3D = normalize( lightToPosition );
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			float lightDistance = length( lightToPosition );
			float depthRange = shadowCameraFar - shadowCameraNear;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				float depthA = - shadowCameraNear / depthRange - shadowBias;
				float depthB = shadowCameraNear * shadowCameraFar / ( depthRange * lightDistance );
			#else
				float depthA = shadowCameraFar / depthRange + shadowBias;
				float depthB = - shadowCameraNear * shadowCameraFar / ( depthRange * lightDistance );
			#endif
			float texelSize = shadowRadius / shadowMapSize.x;
			vec3 absDir = abs( bd3D );
			vec3 tangent = absDir.x > absDir.z ? vec3( 0.0, 1.0, 0.0 ) : vec3( 1.0, 0.0, 0.0 );
			tangent = normalize( cross( bd3D, tangent ) );
			vec3 bitangent = cross( bd3D, tangent );
			float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
			shadow = 0.0;
			for ( int i = 0; i < 5; i ++ ) {
				vec2 offset = vogelDiskSample( i, 5, phi );
				vec3 direction = bd3D + ( tangent * offset.x + bitangent * offset.y ) * texelSize;
				vec3 absDirection = abs( direction );
				float dp = depthA + depthB / max( max( absDirection.x, absDirection.y ), absDirection.z );
				shadow += texture( shadowMap, vec4( direction, dp ) );
			}
			shadow *= 0.2;
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#elif defined( SHADOWMAP_TYPE_BASIC )
	float getPointShadow( samplerCube shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			float depth = textureCube( shadowMap, bd3D ).r;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				depth = 1.0 - depth;
			#endif
			shadow = step( dp, depth );
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#endif
	#endif
#endif`,shadowmap_pars_vertex:`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
		varying vec4 vSunShadowWorldPosition;
		varying vec3 vSunShadowWorldNormal;
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,shadowmap_vertex:`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_SUN_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	#ifdef HAS_NORMAL
		vec3 shadowWorldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
	#else
		vec3 shadowWorldNormal = vec3( 0.0 );
	#endif
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_SUN_LIGHT_SHADOWS > 0
		vSunShadowWorldPosition = vec4( worldPosition.xyz, - mvPosition.z );
		vSunShadowWorldNormal = shadowWorldNormal;
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,shadowmask_pars_fragment:`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
	SunLightShadow sunLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SUN_LIGHT_SHADOWS; i ++ ) {
		sunLight = sunLightShadows[ i ];
		shadow *= receiveShadow ? getSunShadow( sunShadowMap[ i ], sunLight, UNROLLED_LOOP_INDEX ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0 && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,skinbase_vertex:`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,skinning_pars_vertex:`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,skinning_vertex:`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,skinnormal_vertex:`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,specularmap_fragment:`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,specularmap_pars_fragment:`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,tonemapping_fragment:`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,tonemapping_pars_fragment:`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,transmission_fragment:`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseContribution, material.specularColorBlended, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,transmission_pars_fragment:`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,uv_pars_fragment:`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_DIFFUSE_ROUGHNESSMAP
	varying vec2 vDiffuseRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,uv_pars_vertex:`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_DIFFUSE_ROUGHNESSMAP
	uniform mat3 diffuseRoughnessMapTransform;
	varying vec2 vDiffuseRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,uv_vertex:`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DIFFUSE_ROUGHNESSMAP
	vDiffuseRoughnessMapUv = ( diffuseRoughnessMapTransform * vec3( DIFFUSE_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,worldpos_vertex:`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,background_vert:`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,background_frag:`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,backgroundCube_vert:`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,backgroundCube_frag:`uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <envmap_common_pars_fragment>
void main() {
	#ifdef ENVMAP_TYPE_PMREM
		vec4 texColor = textureLod( envMap, backgroundRotation * vWorldDirection, roughnessToMip( backgroundBlurriness ) );
	#else
		vec4 texColor = textureCube( envMap, backgroundRotation * vWorldDirection );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,cube_vert:`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,cube_frag:`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,depth_vert:`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,depth_frag:`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	#ifdef USE_REVERSED_DEPTH_BUFFER
		float fragCoordZ = vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ];
	#else
		float fragCoordZ = 0.5 * vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ] + 0.5;
	#endif
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,distance_vert:`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,distance_frag:`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = vec4( dist, 0.0, 0.0, 1.0 );
}`,equirect_vert:`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,equirect_frag:`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,linedashed_vert:`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,linedashed_frag:`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,meshbasic_vert:`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,meshbasic_frag:`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshlambert_vert:`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,meshlambert_frag:`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshmatcap_vert:`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,meshmatcap_frag:`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshnormal_vert:`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,meshnormal_frag:`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( normalize( normal ) * 0.5 + 0.5, diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,meshphong_vert:`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,meshphong_frag:`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshphysical_vert:`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,meshphysical_frag:`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DIFFUSE_ROUGHNESS
	uniform float diffuseRoughness;
	#ifdef USE_DIFFUSE_ROUGHNESSMAP
		uniform sampler2D diffuseRoughnessMap;
	#endif
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_RETROREFLECTION
	uniform float retroreflectivity;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
 
		outgoingLight = outgoingLight + sheenSpecularDirect + sheenSpecularIndirect;
 
 	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshtoon_vert:`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,meshtoon_frag:`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,points_vert:`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,points_frag:`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,shadow_vert:`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,shadow_frag:`uniform vec3 color;
uniform float opacity;
#include <common>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,sprite_vert:`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,sprite_frag:`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`},$={common:{diffuse:{value:new Z(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Y},alphaMap:{value:null},alphaMapTransform:{value:new Y},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Y}},envmap:{envMap:{value:null},envMapRotation:{value:new Y},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Y}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Y}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Y},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Y},normalScale:{value:new q(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Y},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Y}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Y}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Y}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new Z(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},sunLights:{value:[],properties:{direction:{},color:{}}},sunLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},sunShadowMatrix:{value:[]},sunShadowCascade:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null},probesSH:{value:[]},probesMin:{value:[]},probesMax:{value:[]},probesResolution:{value:[]}},points:{diffuse:{value:new Z(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Y},alphaTest:{value:0},uvTransform:{value:new Y}},sprite:{diffuse:{value:new Z(16777215)},opacity:{value:1},center:{value:new q(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Y},alphaMap:{value:null},alphaMapTransform:{value:new Y},alphaTest:{value:0}}},_s={basic:{uniforms:Va([$.common,$.specularmap,$.envmap,$.aomap,$.lightmap,$.fog]),vertexShader:Q.meshbasic_vert,fragmentShader:Q.meshbasic_frag},lambert:{uniforms:Va([$.common,$.specularmap,$.envmap,$.aomap,$.lightmap,$.emissivemap,$.bumpmap,$.normalmap,$.displacementmap,$.fog,$.lights,{emissive:{value:new Z(0)},envMapIntensity:{value:1}}]),vertexShader:Q.meshlambert_vert,fragmentShader:Q.meshlambert_frag},phong:{uniforms:Va([$.common,$.specularmap,$.envmap,$.aomap,$.lightmap,$.emissivemap,$.bumpmap,$.normalmap,$.displacementmap,$.fog,$.lights,{emissive:{value:new Z(0)},specular:{value:new Z(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:Q.meshphong_vert,fragmentShader:Q.meshphong_frag},standard:{uniforms:Va([$.common,$.envmap,$.aomap,$.lightmap,$.emissivemap,$.bumpmap,$.normalmap,$.displacementmap,$.roughnessmap,$.metalnessmap,$.fog,$.lights,{emissive:{value:new Z(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:Q.meshphysical_vert,fragmentShader:Q.meshphysical_frag},toon:{uniforms:Va([$.common,$.aomap,$.lightmap,$.emissivemap,$.bumpmap,$.normalmap,$.displacementmap,$.gradientmap,$.fog,$.lights,{emissive:{value:new Z(0)}}]),vertexShader:Q.meshtoon_vert,fragmentShader:Q.meshtoon_frag},matcap:{uniforms:Va([$.common,$.bumpmap,$.normalmap,$.displacementmap,$.fog,{matcap:{value:null}}]),vertexShader:Q.meshmatcap_vert,fragmentShader:Q.meshmatcap_frag},points:{uniforms:Va([$.points,$.fog]),vertexShader:Q.points_vert,fragmentShader:Q.points_frag},dashed:{uniforms:Va([$.common,$.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:Q.linedashed_vert,fragmentShader:Q.linedashed_frag},depth:{uniforms:Va([$.common,$.displacementmap]),vertexShader:Q.depth_vert,fragmentShader:Q.depth_frag},normal:{uniforms:Va([$.common,$.bumpmap,$.normalmap,$.displacementmap,{opacity:{value:1}}]),vertexShader:Q.meshnormal_vert,fragmentShader:Q.meshnormal_frag},sprite:{uniforms:Va([$.sprite,$.fog]),vertexShader:Q.sprite_vert,fragmentShader:Q.sprite_frag},background:{uniforms:{uvTransform:{value:new Y},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:Q.background_vert,fragmentShader:Q.background_frag},backgroundCube:{uniforms:{envMap:{value:null},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new Y}},vertexShader:Q.backgroundCube_vert,fragmentShader:Q.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:Q.cube_vert,fragmentShader:Q.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:Q.equirect_vert,fragmentShader:Q.equirect_frag},distance:{uniforms:Va([$.common,$.displacementmap,{referencePosition:{value:new J},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:Q.distance_vert,fragmentShader:Q.distance_frag},shadow:{uniforms:Va([$.lights,$.fog,{color:{value:new Z(0)},opacity:{value:1}}]),vertexShader:Q.shadow_vert,fragmentShader:Q.shadow_frag}};_s.physical={uniforms:Va([_s.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Y},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Y},clearcoatNormalScale:{value:new q(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Y},diffuseRoughness:{value:0},diffuseRoughnessMap:{value:null},diffuseRoughnessMapTransform:{value:new Y},dispersion:{value:0},retroreflectivity:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Y},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Y},sheen:{value:0},sheenColor:{value:new Z(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Y},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Y},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Y},transmissionSamplerSize:{value:new q},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Y},attenuationDistance:{value:0},attenuationColor:{value:new Z(0)},specularColor:{value:new Z(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Y},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Y},anisotropyVector:{value:new q},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Y}}]),vertexShader:Q.meshphysical_vert,fragmentShader:Q.meshphysical_frag};var vs={r:0,b:0,g:0},ys=new cr,bs=new Y;bs.set(-1,0,0,0,1,0,0,0,1);function xs(e,t,n,r,i,a){let o=new Z(0),s=i===!0?0:1,c,l,u=null,d=0,f=null;function p(e){let n=e.isScene===!0?e.background:null;if(n&&n.isTexture){let r=e.backgroundBlurriness>0;n=t.get(n,r)}return n}function m(t){let r=!1,i=p(t);i===null?g(o,s):i&&i.isColor&&(g(i,1),r=!0);let c=e.xr.getEnvironmentBlendMode();c===`additive`?n.buffers.color.setClear(0,0,0,1,a):c===`alpha-blend`&&n.buffers.color.setClear(0,0,0,0,a),(e.autoClear||r)&&(n.buffers.depth.setTest(!0),n.buffers.depth.setMask(!0),n.buffers.color.setMask(!0),e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil))}function h(t,n){let i=p(n);i&&i.isCubeTexture?(l===void 0&&(l=new fa(new Fa(1,1,1),new Ja({name:`BackgroundCubeMaterial`,uniforms:Ba(_s.backgroundCube.uniforms),vertexShader:_s.backgroundCube.vertexShader,fragmentShader:_s.backgroundCube.fragmentShader,side:1,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),l.geometry.deleteAttribute(`normal`),l.geometry.deleteAttribute(`uv`),l.onBeforeRender=function(e,t,n){this.matrixWorld.copyPosition(n.matrixWorld)},Object.defineProperty(l.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),r.update(l)),l.material.uniforms.envMap.value=i,l.material.uniforms.backgroundBlurriness.value=n.backgroundBlurriness,l.material.uniforms.backgroundIntensity.value=n.backgroundIntensity,l.material.uniforms.backgroundRotation.value.setFromMatrix4(ys.makeRotationFromEuler(n.backgroundRotation)).transpose(),i.isRenderTargetTexture===!1&&l.material.uniforms.backgroundRotation.value.premultiply(bs),l.material.toneMapped=X.getTransfer(i.colorSpace)!==Xt,(u!==i||d!==i.version||f!==e.toneMapping)&&(l.material.needsUpdate=!0,u=i,d=i.version,f=e.toneMapping),l.layers.enableAll(),t.unshift(l,l.geometry,l.material,0,0,null)):i&&i.isTexture&&(c===void 0&&(c=new fa(new Ia(2,2),new Ja({name:`BackgroundMaterial`,uniforms:Ba(_s.background.uniforms),vertexShader:_s.background.vertexShader,fragmentShader:_s.background.fragmentShader,side:0,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute(`normal`),Object.defineProperty(c.material,"map",{get:function(){return this.uniforms.t2D.value}}),r.update(c)),c.material.uniforms.t2D.value=i,c.material.uniforms.backgroundIntensity.value=n.backgroundIntensity,c.material.toneMapped=X.getTransfer(i.colorSpace)!==Xt,i.matrixAutoUpdate===!0&&i.updateMatrix(),c.material.uniforms.uvTransform.value.copy(i.matrix),(u!==i||d!==i.version||f!==e.toneMapping)&&(c.material.needsUpdate=!0,u=i,d=i.version,f=e.toneMapping),c.layers.enableAll(),t.unshift(c,c.geometry,c.material,0,0,null))}function g(t,r){t.getRGB(vs,Wa(e)),n.buffers.color.setClear(vs.r,vs.g,vs.b,r,a)}function _(){l!==void 0&&(l.geometry.dispose(),l.material.dispose(),l=void 0),c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0)}return{getClearColor:function(){return o},setClearColor:function(e,t=1){o.set(e),s=t,g(o,s)},getClearAlpha:function(){return s},setClearAlpha:function(e){s=e,g(o,s)},render:m,addToRenderList:h,dispose:_}}function Ss(e,t){let n=e.getParameter(e.MAX_VERTEX_ATTRIBS),r={},i=f(null),a=i,o=!1;function s(n,r,i,s,c){let u=!1,f=d(n,s,i,r);a!==f&&(a=f,l(a.object)),u=p(n,s,i,c),u&&m(n,s,i,c),c!==null&&t.update(c,e.ELEMENT_ARRAY_BUFFER),(u||o)&&(o=!1,b(n,r,i,s),c!==null&&e.bindBuffer(e.ELEMENT_ARRAY_BUFFER,t.get(c).buffer))}function c(){return e.createVertexArray()}function l(t){return e.bindVertexArray(t)}function u(t){return e.deleteVertexArray(t)}function d(e,t,n,i){let a=i.wireframe===!0,o=r[t.id];o===void 0&&(o={},r[t.id]=o);let s=e.isInstancedMesh===!0?e.id:0,l=o[s];l===void 0&&(l={},o[s]=l);let u=l[n.id];u===void 0&&(u={},l[n.id]=u);let d=u[a];return d===void 0&&(d=f(c()),u[a]=d),d}function f(e){let t=[],r=[],i=[];for(let e=0;e<n;e++)t[e]=0,r[e]=0,i[e]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:t,enabledAttributes:r,attributeDivisors:i,object:e,attributes:{},index:null}}function p(e,t,n,r){let i=a.attributes,o=t.attributes,s=0,c=n.getAttributes();for(let t in c)if(c[t].location>=0){let n=i[t],r=o[t];if(r===void 0&&(t===`instanceMatrix`&&e.instanceMatrix&&(r=e.instanceMatrix),t===`instanceColor`&&e.instanceColor&&(r=e.instanceColor)),n===void 0||n.attribute!==r||r&&n.data!==r.data)return!0;s++}return a.attributesNum!==s||a.index!==r}function m(e,t,n,r){let i={},o=t.attributes,s=0,c=n.getAttributes();for(let t in c)if(c[t].location>=0){let n=o[t];n===void 0&&(t===`instanceMatrix`&&e.instanceMatrix&&(n=e.instanceMatrix),t===`instanceColor`&&e.instanceColor&&(n=e.instanceColor));let r={};r.attribute=n,n&&n.data&&(r.data=n.data),i[t]=r,s++}a.attributes=i,a.attributesNum=s,a.index=r}function h(){let e=a.newAttributes;for(let t=0,n=e.length;t<n;t++)e[t]=0}function g(e){_(e,0)}function _(t,n){let r=a.newAttributes,i=a.enabledAttributes,o=a.attributeDivisors;r[t]=1,i[t]===0&&(e.enableVertexAttribArray(t),i[t]=1),o[t]!==n&&(e.vertexAttribDivisor(t,n),o[t]=n)}function v(){let t=a.newAttributes,n=a.enabledAttributes;for(let r=0,i=n.length;r<i;r++)n[r]!==t[r]&&(e.disableVertexAttribArray(r),n[r]=0)}function y(t,n,r,i,a,o,s){s===!0?e.vertexAttribIPointer(t,n,r,a,o):e.vertexAttribPointer(t,n,r,i,a,o)}function b(n,r,i,a){h();let o=a.attributes,s=i.getAttributes(),c=r.defaultAttributeValues;for(let r in s){let i=s[r];if(i.location>=0){let s=o[r];if(s===void 0&&(r===`instanceMatrix`&&n.instanceMatrix&&(s=n.instanceMatrix),r===`instanceColor`&&n.instanceColor&&(s=n.instanceColor)),s!==void 0){let r=s.normalized,o=s.itemSize,c=t.get(s);if(c===void 0)continue;let l=c.buffer,u=c.type,d=c.bytesPerElement,f=u===e.INT||u===e.UNSIGNED_INT||s.gpuType===1013;if(s.isInterleavedBufferAttribute){let t=s.data,c=t.isInterleavedBuffer===!0?t.stride:t.itemSize,p=s.offset;if(t.isInstancedInterleavedBuffer||t.isInstancedBufferAttribute){for(let e=0;e<i.locationSize;e++)_(i.location+e,t.meshPerAttribute);n.isInstancedMesh!==!0&&a._maxInstanceCount===void 0&&(a._maxInstanceCount=t.meshPerAttribute*t.count)}else for(let e=0;e<i.locationSize;e++)g(i.location+e);e.bindBuffer(e.ARRAY_BUFFER,l);for(let e=0;e<i.locationSize;e++)y(i.location+e,o/i.locationSize,u,r,c*d,(p+o/i.locationSize*e)*d,f)}else{if(s.isInstancedBufferAttribute){for(let e=0;e<i.locationSize;e++)_(i.location+e,s.meshPerAttribute);n.isInstancedMesh!==!0&&a._maxInstanceCount===void 0&&(a._maxInstanceCount=s.meshPerAttribute*s.count)}else for(let e=0;e<i.locationSize;e++)g(i.location+e);e.bindBuffer(e.ARRAY_BUFFER,l);for(let e=0;e<i.locationSize;e++)y(i.location+e,o/i.locationSize,u,r,o*d,o/i.locationSize*e*d,f)}}else if(c!==void 0){let t=c[r];if(t!==void 0)switch(t.length){case 2:e.vertexAttrib2fv(i.location,t);break;case 3:e.vertexAttrib3fv(i.location,t);break;case 4:e.vertexAttrib4fv(i.location,t);break;default:e.vertexAttrib1fv(i.location,t)}}}}v()}function x(){T();for(let e in r){let t=r[e];for(let e in t){let n=t[e];for(let e in n){let t=n[e];for(let e in t)u(t[e].object),delete t[e];delete n[e]}}delete r[e]}}function S(e){if(r[e.id]===void 0)return;let t=r[e.id];for(let e in t){let n=t[e];for(let e in n){let t=n[e];for(let e in t)u(t[e].object),delete t[e];delete n[e]}}delete r[e.id]}function C(e){for(let t in r){let n=r[t];for(let t in n){let r=n[t];if(r[e.id]===void 0)continue;let i=r[e.id];for(let e in i)u(i[e].object),delete i[e];delete r[e.id]}}}function w(e){for(let t in r){let n=r[t],i=e.isInstancedMesh===!0?e.id:0,a=n[i];if(a!==void 0){for(let e in a){let t=a[e];for(let e in t)u(t[e].object),delete t[e];delete a[e]}delete n[i],Object.keys(n).length===0&&delete r[t]}}}function T(){E(),o=!0,a!==i&&(a=i,l(a.object))}function E(){i.geometry=null,i.program=null,i.wireframe=!1}return{setup:s,reset:T,resetDefaultState:E,dispose:x,releaseStatesOfGeometry:S,releaseStatesOfObject:w,releaseStatesOfProgram:C,initAttributes:h,enableAttribute:g,disableUnusedAttributes:v}}function Cs(e,t,n){let r;function i(e){r=e}function a(t,i){e.drawArrays(r,t,i),n.update(i,r,1)}function o(t,i,a){a!==0&&(e.drawArraysInstanced(r,t,i,a),n.update(i,r,a))}function s(e,i,a){if(a===0)return;t.get(`WEBGL_multi_draw`).multiDrawArraysWEBGL(r,e,0,i,0,a);let o=0;for(let e=0;e<a;e++)o+=i[e];n.update(o,r,1)}this.setMode=i,this.render=a,this.renderInstances=o,this.renderMultiDraw=s}function ws(e,t,n,r){let i;function a(){if(i!==void 0)return i;if(t.has(`EXT_texture_filter_anisotropic`)===!0){let n=t.get(`EXT_texture_filter_anisotropic`);i=e.getParameter(n.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else i=0;return i}function o(t){return t===1023||r.convert(t)===e.getParameter(e.IMPLEMENTATION_COLOR_READ_FORMAT)}function s(n){let i=n===1016&&(t.has(`EXT_color_buffer_half_float`)||t.has(`EXT_color_buffer_float`));return!(n!==1009&&n!==1015&&!i&&r.convert(n)!==e.getParameter(e.IMPLEMENTATION_COLOR_READ_TYPE))}function c(t){if(t===`highp`){if(e.getShaderPrecisionFormat(e.VERTEX_SHADER,e.HIGH_FLOAT).precision>0&&e.getShaderPrecisionFormat(e.FRAGMENT_SHADER,e.HIGH_FLOAT).precision>0)return`highp`;t=`mediump`}return t===`mediump`&&e.getShaderPrecisionFormat(e.VERTEX_SHADER,e.MEDIUM_FLOAT).precision>0&&e.getShaderPrecisionFormat(e.FRAGMENT_SHADER,e.MEDIUM_FLOAT).precision>0?`mediump`:`lowp`}let l=n.precision===void 0?`highp`:n.precision,u=c(l);u!==l&&(W(`WebGLRenderer:`,l,`not supported, using`,u,`instead.`),l=u);let d=n.reversedDepthBuffer===!0&&t.has(`EXT_clip_control`),f=n.logarithmicDepthBuffer===!0&&d===!1;n.reversedDepthBuffer===!0&&d===!1&&W(`WebGLRenderer: Unable to use reversed depth buffer due to missing EXT_clip_control extension. Fallback to default depth buffer.`),n.logarithmicDepthBuffer===!0&&d===!0&&W(`WebGLRenderer: Logarithmic depth buffer is ignored when reversed depth buffer is enabled.`);let p=e.getParameter(e.MAX_TEXTURE_IMAGE_UNITS),m=e.getParameter(e.MAX_VERTEX_TEXTURE_IMAGE_UNITS),h=e.getParameter(e.MAX_TEXTURE_SIZE),g=e.getParameter(e.MAX_CUBE_MAP_TEXTURE_SIZE),_=e.getParameter(e.MAX_VERTEX_ATTRIBS),v=e.getParameter(e.MAX_VERTEX_UNIFORM_VECTORS),y=e.getParameter(e.MAX_VARYING_VECTORS),b=e.getParameter(e.MAX_FRAGMENT_UNIFORM_VECTORS),x=e.getParameter(e.MAX_SAMPLES),S=e.getParameter(e.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:a,getMaxPrecision:c,textureFormatReadable:o,textureTypeReadable:s,precision:l,logarithmicDepthBuffer:f,reversedDepthBuffer:d,maxTextures:p,maxVertexTextures:m,maxTextureSize:h,maxCubemapSize:g,maxAttributes:_,maxVertexUniforms:v,maxVaryings:y,maxFragmentUniforms:b,maxSamples:x,samples:S}}function Ts(e){let t=this,n=null,r=0,i=!1,a=!1,o=new Ki,s=new Y,c={value:null,needsUpdate:!1};this.uniform=c,this.numPlanes=0,this.numIntersection=0,this.init=function(e,t){let n=e.length!==0||t||r!==0||i;return i=t,r=e.length,n},this.beginShadows=function(){a=!0,u(null)},this.endShadows=function(){a=!1},this.setGlobalState=function(e,t){n=u(e,t,0)},this.setState=function(t,o,s){let d=t.clippingPlanes,f=t.clipIntersection,p=t.clipShadows,m=e.get(t);if(!i||d===null||d.length===0||a&&!p)a?u(null):l();else{let e=a?0:r,t=e*4,i=m.clippingState||null;c.value=i,i=u(d,o,t,s);for(let e=0;e!==t;++e)i[e]=n[e];m.clippingState=i,this.numIntersection=f?this.numPlanes:0,this.numPlanes+=e}};function l(){c.value!==n&&(c.value=n,c.needsUpdate=r>0),t.numPlanes=r,t.numIntersection=0}function u(e,n,r,i){let a=e===null?0:e.length,l=null;if(a!==0){if(l=c.value,i!==!0||l===null){let t=r+a*4,i=n.matrixWorldInverse;s.getNormalMatrix(i),(l===null||l.length<t)&&(l=new Float32Array(t));for(let t=0,n=r;t!==a;++t,n+=4)o.copy(e[t]).applyMatrix4(i,s),o.normal.toArray(l,n),l[n+3]=o.constant}c.value=l,c.needsUpdate=!0}return t.numPlanes=a,t.numIntersection=0,l}}var Es=class extends ar{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;let n={width:e,height:e,depth:1},r=[n,n,n,n,n,n];this.texture=new Aa(r),this._setTextureOptions(t),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;let n={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},r=new Fa(5,5,5),i=new Ja({name:`CubemapFromEquirect`,uniforms:Ba(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:1,blending:0});i.uniforms.tEquirect.value=t;let a=new fa(r,i),o=t.minFilter;return t.minFilter===1008&&(t.minFilter=U),new Ro(1,10,this).update(e,a),t.minFilter=o,a.geometry.dispose(),a.material.dispose(),this}clear(e,t=!0,n=!0,r=!0){let i=e.getRenderTarget();for(let i=0;i<6;i++)e.setRenderTarget(this,i),e.clear(t,n,r);e.setRenderTarget(i)}},Ds=256,Os=3,ks=20,As=256,js=16,Ms=3,Ns=new J,Ps=new Z,Fs=class e{constructor(e){this._renderer=e,this._cubeSize=0,this._sourceTarget=null,this._cubeCamera=new Ro(1,10,null),this._boxMesh=new fa(new Fa(5,5,5),null),this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null,this._integrationMaterial=null}fromScene(e,t=0,n=.1,r=100,i={}){let{size:a=256,position:o=Ns}=i,s=this._renderer;this._setSize(a);let c=this._allocateTarget(),l=this._getSourceTarget(!0);t>0&&(l.texture.mipmapsAutoUpdate=!1);let u=s.autoClear,d=s.autoClearColor,f=s.autoClearDepth,p=s.autoClearStencil,m=e.background;s.autoClear=!0,s.autoClearColor=!0,s.autoClearDepth=!0,s.autoClearStencil=!0,m===null&&(e.background=s.getClearColor(Ps));let h=new Ro(n,r,l);return h.position.copy(o),h.update(s,e),s.autoClear=u,s.autoClearColor=d,s.autoClearDepth=f,s.autoClearStencil=p,e.background=m,t>0&&(l.texture.mipmapsAutoUpdate=!0,this._blur(c,t)),this._applyPMREM(c),c}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=Hs(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=Vs(),this._compileMaterial(this._equirectMaterial))}dispose(){this._sourceTarget!==null&&this._sourceTarget.dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._integrationMaterial!==null&&this._integrationMaterial.dispose(),this._boxMesh.geometry.dispose()}static lodToRoughness(e,t){return t>0?1-Math.sqrt(1-e/t):0}_setSize(e){this._cubeSize=Math.max(Ds,Pn(e))}_fromTexture(e,t){e.mapping===301||e.mapping===302?this._setSize(e.image.length===0?Ds:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4);let n=t||this._allocateTarget();return this._textureToCubemap(e),this._applyPMREM(n),n}_allocateTarget(){let e=this._cubeSize,t=Is(e,!1,!1),n=Math.log2(e)-Os;for(let r=0;r<=n;r++)t.texture.mipmaps.push({width:e>>r,height:e>>r});return t.texture.name=`PMREM`,t.texture.isPMREMTexture=!0,t}_getSourceTarget(e=!1){let t=this._cubeSize,n=this._sourceTarget;return(n===null||n.width!==t||e&&n.depthBuffer===!1)&&(n!==null&&n.dispose(),this._sourceTarget=Is(t,!0,e)),this._sourceTarget}_compileMaterial(e){this._boxMesh.material=e,this._renderer.compile(this._boxMesh,this._cubeCamera.children[0])}_renderCube(e,t,n){let r=this._boxMesh,i=this._cubeCamera;r.material=n,i.renderTarget=e,i.activeMipmapLevel=t;let a=e.width>>t;e.viewport.set(0,0,a,a),i.update(this._renderer,r),e.viewport.set(0,0,e.width,e.height)}_textureToCubemap(e){let t;e.mapping===301||e.mapping===302?(this._cubemapMaterial===null&&(this._cubemapMaterial=Hs()),t=this._cubemapMaterial,t.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):(this._equirectMaterial===null&&(this._equirectMaterial=Vs()),t=this._equirectMaterial),t.uniforms.envMap.value=e,this._renderCube(this._getSourceTarget(),0,t)}_applyPMREM(t){this._ggxMaterial===null&&(this._ggxMaterial=Rs(),this._integrationMaterial=zs());let n=this._cubeSize,r=t.texture.mipmaps.length-1,i=this._ggxMaterial.uniforms;i.envMap.value=this._sourceTarget.texture;let a=this._integrationMaterial.uniforms;a.envMap.value=this._sourceTarget.texture,a.sourceLod.value=Math.log2(n/js);for(let o=0;o<=r;o++){let s=e.lodToRoughness(o,r);if(o>r-Ms)a.roughness.value=s,this._renderCube(t,o,this._integrationMaterial);else{let e=s>0?Math.log2(n)+.5*Math.log2(6/(As*s**4))+.5:0;i.roughness.value=s,i.lodBias.value=e,this._renderCube(t,o,this._ggxMaterial)}}}_blur(e,t){this._blurMaterial===null&&(this._blurMaterial=Bs());let n=this._blurMaterial,r=n.uniforms,i=this._sourceTarget;r.sigma.value=Math.min(t,Math.PI)/Math.SQRT2,r.envMap.value=i.texture,this._renderCube(e,0,n),r.envMap.value=e.texture,this._renderCube(i,0,n)}};function Is(e,t,n){return new Es(e,{minFilter:Ne,generateMipmaps:t,type:Ve,colorSpace:Jt,depthBuffer:n})}function Ls(e,t,n){return new Ja({name:e,uniforms:t,vertexShader:Q.cube_vert,fragmentShader:n,side:1,blending:0,depthTest:!1,depthWrite:!1})}function Rs(){return Ls(`PMREMGGXConvolution`,{envMap:{value:null},roughness:{value:0},lodBias:{value:0}},`

		#define GGX_SAMPLES ${As}u

		varying vec3 vWorldDirection;

		uniform samplerCube envMap;
		uniform float roughness;
		uniform float lodBias;

		#include <common>

		// Van der Corput radical inverse
		float radicalInverse_VdC( uint bits ) {

			bits = ( bits << 16u ) | ( bits >> 16u );
			bits = ( ( bits & 0x55555555u ) << 1u ) | ( ( bits & 0xAAAAAAAAu ) >> 1u );
			bits = ( ( bits & 0x33333333u ) << 2u ) | ( ( bits & 0xCCCCCCCCu ) >> 2u );
			bits = ( ( bits & 0x0F0F0F0Fu ) << 4u ) | ( ( bits & 0xF0F0F0F0u ) >> 4u );
			bits = ( ( bits & 0x00FF00FFu ) << 8u ) | ( ( bits & 0xFF00FF00u ) >> 8u );
			return float( bits ) * 2.3283064365386963e-10; // / 0x100000000

		}

		// Hammersley sequence
		vec2 hammersley( uint i, uint N ) {

			return vec2( float( i ) / float( N ), radicalInverse_VdC( i ) );

		}

		void main() {

			vec3 N = normalize( vWorldDirection );

			// For very low roughness, just sample the environment directly
			if ( roughness < 0.001 ) {

				gl_FragColor = vec4( textureLod( envMap, N, 0.0 ).rgb, 1.0 );
				return;

			}

			float alpha = roughness * roughness;
			float alpha2 = alpha * alpha;

			// Tangent space basis for VNDF sampling
			vec3 up = abs( N.z ) < 0.999 ? vec3( 0.0, 0.0, 1.0 ) : vec3( 1.0, 0.0, 0.0 );
			vec3 tangent = normalize( cross( up, N ) );
			vec3 bitangent = cross( N, tangent );

			vec3 prefilteredColor = vec3( 0.0 );
			float totalWeight = 0.0;

			for ( uint i = 0u; i < GGX_SAMPLES; i ++ ) {

				vec2 Xi = hammersley( i, GGX_SAMPLES );

				// With V = N, sample the reflected direction directly.
				float invQ = 1.0 / ( 1.0 - Xi.x + alpha2 * Xi.x );
				float NdotL = ( 1.0 - Xi.x - alpha2 * Xi.x ) * invQ;

				if ( NdotL > 0.0 ) {

					float phi = 2.0 * PI * Xi.y;
					float sinTheta = 2.0 * alpha * sqrt( Xi.x * ( 1.0 - Xi.x ) ) * invQ;
					vec3 L = N * NdotL + ( tangent * cos( phi ) + bitangent * sin( phi ) ) * sinTheta;

					// Match the source mip to the sample's solid angle. The terms
					// independent of the sample are precomputed in lodBias.
					float d = alpha2 * invQ;
					float lod = max( log2( d ) + lodBias, 0.0 );

					// Weight by NdotL for the split-sum approximation
					prefilteredColor += textureLod( envMap, L, lod ).rgb * NdotL;
					totalWeight += NdotL;

				}

			}

			gl_FragColor = vec4( prefilteredColor / totalWeight, 1.0 );

		}
	`)}function zs(){return Ls(`PMREMGGXIntegration`,{envMap:{value:null},roughness:{value:0},sourceLod:{value:0},sourceSize:{value:js}},`

		varying vec3 vWorldDirection;

		uniform samplerCube envMap;
		uniform float roughness;
		uniform float sourceLod;
		uniform int sourceSize;

		void main() {

			vec3 N = normalize( vWorldDirection );

			float alpha = roughness * roughness;
			float alpha2 = alpha * alpha;

			float texelSize = 2.0 / float( sourceSize );

			vec3 prefilteredColor = vec3( 0.0 );
			float totalWeight = 0.0;

			// Pair opposite texels: only the one in N's hemisphere contributes.
			for ( int face = 0; face < 3; face ++ ) {

				for ( int y = 0; y < sourceSize; y ++ ) {

					for ( int x = 0; x < sourceSize; x ++ ) {

						vec2 uv = ( vec2( x, y ) + 0.5 ) * texelSize - 1.0;
						vec3 texelDirection = face == 0 ? vec3( 1.0, uv ) : ( face == 1 ? vec3( uv.x, 1.0, uv.y ) : vec3( uv, 1.0 ) );

						float invDistance = inversesqrt( 1.0 + dot( uv, uv ) );
						float NdotL = dot( N, texelDirection );
						texelDirection *= NdotL < 0.0 ? - 1.0 : 1.0;
						NdotL = abs( NdotL ) * invDistance;

						// With V = N, NdotH squared is ( 1 + NdotL ) / 2. Common factors
						// in the GGX distribution and texel solid angle cancel when normalized.
						float d = 1.0 + alpha2 + ( alpha2 - 1.0 ) * NdotL;
						float weight = NdotL * invDistance * invDistance * invDistance / ( d * d );

						prefilteredColor += textureLod( envMap, texelDirection, sourceLod ).rgb * weight;
						totalWeight += weight;

					}

				}

			}

			gl_FragColor = vec4( prefilteredColor / totalWeight, 1.0 );

		}
	`)}function Bs(){return Ls(`PMREMSphericalGaussianBlur`,{envMap:{value:null},sigma:{value:0}},`

		#define SAMPLES ${ks}
		#define GOLDEN_ANGLE 2.39996322973

		varying vec3 vWorldDirection;

		uniform samplerCube envMap;
		uniform float sigma;

		#include <common>

		void main() {

			vec3 outputDirection = normalize( vWorldDirection );

			vec3 up = abs( outputDirection.z ) < 0.999 ? vec3( 0.0, 0.0, 1.0 ) : vec3( 1.0, 0.0, 0.0 );
			vec3 tangent = normalize( cross( up, outputDirection ) );
			vec3 bitangent = cross( outputDirection, tangent );

			// Truncate the kernel at three standard deviations or at the antipode.
			float thetaMax = min( 3.0 * sigma, PI );
			float truncation = 1.0 - exp( - 0.5 * thetaMax * thetaMax / ( sigma * sigma ) );

			vec3 accumColor = vec3( 0.0 );
			float accumWeight = 0.0;

			for ( int i = 0; i < SAMPLES; i ++ ) {

				// Stratified inverse-CDF sampling of the Gaussian, placed on a golden-angle spiral.
				float stratum = ( float( i ) + 0.5 ) / float( SAMPLES );
				float theta = sigma * sqrt( - 2.0 * log( 1.0 - stratum * truncation ) );
				float phi = float( i ) * GOLDEN_ANGLE;

				vec3 offset = cos( phi ) * tangent + sin( phi ) * bitangent;
				vec3 sampleDirection = cos( theta ) * outputDirection + sin( theta ) * offset;

				// Correct the planar sample density to solid angle.
				float weight = sin( theta ) / theta;

				accumColor += weight * textureLod( envMap, sampleDirection, 0.0 ).rgb;
				accumWeight += weight;

			}

			gl_FragColor = vec4( accumColor / accumWeight, 1.0 );

		}
	`)}function Vs(){return Ls(`PMREMEquirectangularToCubemap`,{envMap:{value:null}},`

		varying vec3 vWorldDirection;

		uniform sampler2D envMap;

		#include <common>

		void main() {

			// Average four subpixel samples to preserve small, bright features.
			vec3 direction = normalize( vWorldDirection );
			vec3 dx = dFdx( direction ) * 0.25;
			vec3 dy = dFdy( direction ) * 0.25;

			vec3 color = textureLod( envMap, equirectUv( normalize( direction - dx - dy ) ), 0.0 ).rgb;
			color += textureLod( envMap, equirectUv( normalize( direction + dx - dy ) ), 0.0 ).rgb;
			color += textureLod( envMap, equirectUv( normalize( direction - dx + dy ) ), 0.0 ).rgb;
			color += textureLod( envMap, equirectUv( normalize( direction + dx + dy ) ), 0.0 ).rgb;
			gl_FragColor = vec4( color * 0.25, 1.0 );

		}
	`)}function Hs(){return Ls(`PMREMCubemapToCubemap`,{envMap:{value:null},flipEnvMap:{value:-1}},`

		varying vec3 vWorldDirection;

		uniform samplerCube envMap;
		uniform float flipEnvMap;

		void main() {

			gl_FragColor = vec4( textureCube( envMap, vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) ).rgb, 1.0 );

		}
	`)}function Us(e){let t=new WeakMap,n=new WeakMap,r=null;function i(e,t=!1){return e==null?null:t?o(e):a(e)}function a(n){if(n&&n.isTexture){let r=n.mapping;if(r===303||r===304){if(t.has(n)){let e=t.get(n).texture;return s(e,n.mapping)}{let r=n.image;if(r&&r.height>0){let i=new Es(r.height);return i.fromEquirectangularTexture(e,n),t.set(n,i),n.addEventListener(`dispose`,l),s(i.texture,n.mapping)}return null}}}return n}function o(t){if(t&&t.isTexture&&t.isPMREMTexture!==!0){let i=t.mapping,a=i===303||i===304,o=i===301||i===302;if(a||o){let i=n.get(t),s=i===void 0?0:i.texture.pmremVersion;if(t.isRenderTargetTexture&&t.pmremVersion!==s)return r===null&&(r=new Fs(e)),i=a?r.fromEquirectangular(t,i):r.fromCubemap(t,i),i.texture.pmremVersion=t.pmremVersion,n.set(t,i),i.texture;if(i!==void 0)return i.texture;{let s=t.image;return a&&s&&s.height>0||o&&s&&c(s)?(r===null&&(r=new Fs(e)),i=a?r.fromEquirectangular(t):r.fromCubemap(t),i.texture.pmremVersion=t.pmremVersion,n.set(t,i),t.addEventListener(`dispose`,u),i.texture):null}}}return t}function s(e,t){return t===303?e.mapping=301:t===304&&(e.mapping=302),e}function c(e){let t=0;for(let n=0;n<6;n++)e[n]!==void 0&&t++;return t===6}function l(e){let n=e.target;n.removeEventListener(`dispose`,l);let r=t.get(n);r!==void 0&&(t.delete(n),r.dispose())}function u(e){let t=e.target;t.removeEventListener(`dispose`,u);let r=n.get(t);r!==void 0&&(n.delete(t),r.dispose())}function d(){t=new WeakMap,n=new WeakMap,r!==null&&(r.dispose(),r=null)}return{get:i,dispose:d}}function Ws(e){let t={};function n(n){if(t[n]!==void 0)return t[n];let r=e.getExtension(n);return t[n]=r,r}return{has:function(e){return n(e)!==null},init:function(){n(`EXT_color_buffer_float`),n(`WEBGL_clip_cull_distance`),n(`OES_texture_float_linear`),n(`EXT_color_buffer_half_float`),n(`WEBGL_multisampled_render_to_texture`),n(`WEBGL_render_shared_exponent`)},get:function(e){let t=n(e);return t===null&&ln(`WebGLRenderer: `+e+` extension not supported.`),t}}}function Gs(e,t,n,r){let i={},a=new WeakMap,o=new FinalizationRegistry(e=>delete i[e]);function s(e){c(e.target)}function c(e){e.index!==null&&t.remove(e.index);for(let n in e.attributes)t.remove(e.attributes[n]);e.removeEventListener(`dispose`,s),delete i[e.id],o.unregister(e);let c=a.get(e);c&&(t.remove(c),a.delete(e)),r.releaseStatesOfGeometry(e),e.isInstancedBufferGeometry===!0&&delete e._maxInstanceCount,n.memory.geometries--}function l(e,t){return i[t.id]===void 0&&(t.addEventListener(`dispose`,s),i[t.id]=new WeakRef(t),o.register(t,t.id,t),n.memory.geometries++),t}function u(n){let r=n.attributes;for(let n in r)t.update(r[n],e.ARRAY_BUFFER)}function d(e){let n=e.index,r=e.attributes.position,i=0;if(r===void 0)return;let o=n===null?r.array.length/3-1:n.array.length,s=new(r.count>=65535?Ti:wi)(Math.ceil(o/3)*6,1),c=s.array;if(n!==null){let e=n.array;i=n.version;for(let t=0,n=0;t<o;t+=3){let r=e[t+0],i=e[t+1],a=e[t+2];c[n++]=r,c[n++]=i,c[n++]=i,c[n++]=a,c[n++]=a,c[n++]=r}}else{i=r.version;for(let e=0,t=0;e<o;e+=3){let n=e+0,r=e+1,i=e+2;c[t++]=n,c[t++]=r,c[t++]=r,c[t++]=i,c[t++]=i,c[t++]=n}}s.version=i;let l=a.get(e);l&&t.remove(l),a.set(e,s)}function f(e){let t=a.get(e);if(t){let n=e.index;n!==null&&t.version<n.version&&d(e)}else d(e);return a.get(e)}function p(){for(let e in i){let t=i[e].deref();t!==void 0&&c(t)}}return{get:l,update:u,getWireframeAttribute:f,dispose:p}}function Ks(e,t,n){let r;function i(e){r=e}let a,o;function s(e){a=e.type,o=e.bytesPerElement}function c(t,i){e.drawElements(r,i,a,t*o),n.update(i,r,1)}function l(t,i,s){s!==0&&(e.drawElementsInstanced(r,i,a,t*o,s),n.update(i,r,s))}function u(e,i,o){if(o===0)return;t.get(`WEBGL_multi_draw`).multiDrawElementsWEBGL(r,i,0,a,e,0,o);let s=0;for(let e=0;e<o;e++)s+=i[e];n.update(s,r,1)}this.setMode=i,this.setIndex=s,this.render=c,this.renderInstances=l,this.renderMultiDraw=u}function qs(e){let t={geometries:0,textures:0},n={frame:0,calls:0,triangles:0,points:0,lines:0};function r(t,r,i){switch(n.calls++,r){case e.TRIANGLES:n.triangles+=t/3*i;break;case e.LINES:n.lines+=t/2*i;break;case e.LINE_STRIP:n.lines+=i*(t-1);break;case e.LINE_LOOP:n.lines+=i*t;break;case e.POINTS:n.points+=i*t;break;default:G(`WebGLInfo: Unknown draw mode:`,r)}}function i(){n.calls=0,n.triangles=0,n.points=0,n.lines=0}return{memory:t,render:n,programs:null,autoReset:!0,reset:i,update:r}}function Js(e,t,n){let r=new WeakMap,i=new rr;function a(a,o,s){let c=a.morphTargetInfluences,l=o.morphAttributes.position||o.morphAttributes.normal||o.morphAttributes.color,u=l===void 0?0:l.length,d=r.get(o);if(d===void 0||d.count!==u){d!==void 0&&d.texture.dispose();let e=o.morphAttributes.position!==void 0,n=o.morphAttributes.normal!==void 0,a=o.morphAttributes.color!==void 0,s=o.morphAttributes.position||[],c=o.morphAttributes.normal||[],l=o.morphAttributes.color||[],f=0;e===!0&&(f=1),n===!0&&(f=2),a===!0&&(f=3);let p=o.attributes.position.count*f,m=1;p>t.maxTextureSize&&(m=Math.ceil(p/t.maxTextureSize),p=t.maxTextureSize);let h=new Float32Array(p*m*4*u),g=new or(h,p,m,u);g.type=Be,g.needsUpdate=!0;let _=f*4;for(let t=0;t<u;t++){let r=s[t],o=c[t],u=l[t],d=p*m*4*t;for(let t=0;t<r.count;t++){let s=t*_;e===!0&&(i.fromBufferAttribute(r,t),h[d+s+0]=i.x,h[d+s+1]=i.y,h[d+s+2]=i.z,h[d+s+3]=0),n===!0&&(i.fromBufferAttribute(o,t),h[d+s+4]=i.x,h[d+s+5]=i.y,h[d+s+6]=i.z,h[d+s+7]=0),a===!0&&(i.fromBufferAttribute(u,t),h[d+s+8]=i.x,h[d+s+9]=i.y,h[d+s+10]=i.z,h[d+s+11]=u.itemSize===4?i.w:1)}}d={count:u,texture:g,size:new q(p,m)},r.set(o,d);function v(){g.dispose(),r.delete(o),o.removeEventListener(`dispose`,v)}o.addEventListener(`dispose`,v)}if(a.isInstancedMesh===!0&&a.morphTexture!==null)s.getUniforms().setValue(e,`morphTexture`,a.morphTexture,n);else{let t=0;for(let e=0;e<c.length;e++)t+=c[e];let n=o.morphTargetsRelative?1:1-t;s.getUniforms().setValue(e,`morphTargetBaseInfluence`,n),s.getUniforms().setValue(e,`morphTargetInfluences`,c)}s.getUniforms().setValue(e,`morphTargetsTexture`,d.texture,n),s.getUniforms().setValue(e,`morphTargetsTextureSize`,d.size)}return{update:a}}function Ys(e,t,n,r,i){let a=new WeakMap;function o(r){let o=i.render.frame,s=r.geometry,l=t.get(r,s);if(a.get(l)!==o&&(t.update(l),a.set(l,o)),r.isInstancedMesh&&(r.hasEventListener(`dispose`,c)===!1&&r.addEventListener(`dispose`,c),a.get(r)!==o&&(n.update(r.instanceMatrix,e.ARRAY_BUFFER),r.instanceColor!==null&&n.update(r.instanceColor,e.ARRAY_BUFFER),a.set(r,o))),r.isSkinnedMesh){let e=r.skeleton;a.get(e)!==o&&(e.update(),a.set(e,o))}return l}function s(){a=new WeakMap}function c(e){let t=e.target;t.removeEventListener(`dispose`,c),r.releaseStatesOfObject(t),n.remove(t.instanceMatrix),t.instanceColor!==null&&n.remove(t.instanceColor)}return{update:o,dispose:s}}var Xs={1:`LINEAR_TONE_MAPPING`,2:`REINHARD_TONE_MAPPING`,3:`CINEON_TONE_MAPPING`,4:`ACES_FILMIC_TONE_MAPPING`,6:`AGX_TONE_MAPPING`,7:`NEUTRAL_TONE_MAPPING`,5:`CUSTOM_TONE_MAPPING`};function Zs(e,t,n,r,i,a){let o=new ar(t,n,{type:e,depthBuffer:i,stencilBuffer:a,samples:r?4:0,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,resolveDepthBuffer:!1,resolveStencilBuffer:!1}),s=null,c=null,l=null,u=new Ri;u.setAttribute(`position`,new Ei([-1,3,0,-1,-1,0,3,-1,0],3)),u.setAttribute(`uv`,new Ei([0,2,0,0,2,0],2));let d=new Ya({uniforms:{tDiffuse:{value:null}},vertexShader:`
			precision highp float;

			uniform mat4 modelViewMatrix;
			uniform mat4 projectionMatrix;

			attribute vec3 position;
			attribute vec2 uv;

			varying vec2 vUv;

			void main() {
				vUv = uv;
				gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
			}`,fragmentShader:`
			precision highp float;

			uniform sampler2D tDiffuse;

			varying vec2 vUv;

			#include <tonemapping_pars_fragment>
			#include <colorspace_pars_fragment>

			void main() {
				gl_FragColor = texture2D( tDiffuse, vUv );

				#ifdef LINEAR_TONE_MAPPING
					gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );
				#elif defined( REINHARD_TONE_MAPPING )
					gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );
				#elif defined( CINEON_TONE_MAPPING )
					gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );
				#elif defined( ACES_FILMIC_TONE_MAPPING )
					gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );
				#elif defined( AGX_TONE_MAPPING )
					gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );
				#elif defined( NEUTRAL_TONE_MAPPING )
					gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );
				#elif defined( CUSTOM_TONE_MAPPING )
					gl_FragColor.rgb = CustomToneMapping( gl_FragColor.rgb );
				#endif

				#ifdef SRGB_TRANSFER
					gl_FragColor = sRGBTransferOETF( gl_FragColor );
				#endif
			}`,depthTest:!1,depthWrite:!1}),f=new fa(u,d),p=new Po(-1,1,1,-1,0,1),m=null,h=null,g=!1,_,v=null,y=[],b=!1;this.setSize=function(e,t){o.setSize(e,t),s!==null&&s.setSize(e,t),c!==null&&c.setSize(e,t);for(let n=0;n<y.length;n++){let r=y[n];r.setSize&&r.setSize(e,t)}},this.setEffects=function(e){y=e,b=y.length>0&&y[0].isRenderPass===!0;let t=o.width,n=o.height;y.length>0&&s===null&&(s=new ar(t,n,{type:Ve,depthBuffer:!1,stencilBuffer:!1}),c=new ar(t,n,{type:Ve,depthBuffer:!1,stencilBuffer:!1}));let r=i===!0&&y.some(e=>e.needsDepthTexture===!0);r!==(o.depthTexture!==null)&&(r===!0&&l===null&&(l=new Ma(t,n),a===!0&&(l.format=Ze,l.type=We)),o.dispose(),o.depthTexture=r?l:null,o.resolveDepthBuffer=r,o.storeMultisampledDepthBuffer=r);for(let e=0;e<y.length;e++){let i=y[e];i.setSize&&i.setSize(t,n),r&&i.needsDepthTexture===!0&&i.setDepthTexture&&i.setDepthTexture(l)}},this.begin=function(e,t){if(g||e.toneMapping===0&&y.length===0)return!1;if(v=t,t!==null){let e=t.width,n=t.height;(o.width!==e||o.height!==n)&&this.setSize(e,n)}return b===!1&&e.setRenderTarget(o),_=e.toneMapping,e.toneMapping=0,!0},this.hasRenderPass=function(){return b},this.end=function(e,t){e.toneMapping=_,g=!0;let n=o,r=s;for(let i=0;i<y.length;i++){let a=y[i];a.enabled!==!1&&(a.render(e,r,n,t),a.needsSwap!==!1&&(n=r,r=r===s?c:s))}if(m!==e.outputColorSpace||h!==e.toneMapping){m=e.outputColorSpace,h=e.toneMapping,d.defines={},X.getTransfer(m)===`srgb`&&(d.defines.SRGB_TRANSFER=``);let t=Xs[h];t&&(d.defines[t]=``),d.needsUpdate=!0}d.uniforms.tDiffuse.value=n.texture,e.setRenderTarget(v),e.render(f,p),v=null,g=!1},this.isCompositing=function(){return g},this.dispose=function(){o.dispose(),s!==null&&s.dispose(),c!==null&&c.dispose(),u.dispose(),d.dispose()}}var Qs=new nr,$s=new Ma(1,1),ec=new Na(1),tc=new or,nc=new sr,rc=new Aa,ic=[],ac=[],oc=new Float32Array(16),sc=new Float32Array(9),cc=new Float32Array(4);function lc(e,t,n){let r=e[0];if(r<=0||r>0)return e;let i=t*n,a=ic[i];if(a===void 0&&(a=new Float32Array(i),ic[i]=a),t!==0){r.toArray(a,0);for(let r=1,i=0;r!==t;++r)i+=n,e[r].toArray(a,i)}return a}function uc(e,t){if(e.length!==t.length)return!1;for(let n=0,r=e.length;n<r;n++)if(e[n]!==t[n])return!1;return!0}function dc(e,t){for(let n=0,r=t.length;n<r;n++)e[n]=t[n]}function fc(e,t){let n=ac[t];n===void 0&&(n=new Int32Array(t),ac[t]=n);for(let r=0;r!==t;++r)n[r]=e.allocateTextureUnit();return n}function pc(e,t){let n=this.cache;n[0]!==t&&(e.uniform1f(this.addr,t),n[0]=t)}function mc(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y)&&(e.uniform2f(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y);else{if(uc(n,t))return;e.uniform2fv(this.addr,t),dc(n,t)}}function hc(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)&&(e.uniform3f(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z);else if(t.r!==void 0)(n[0]!==t.r||n[1]!==t.g||n[2]!==t.b)&&(e.uniform3f(this.addr,t.r,t.g,t.b),n[0]=t.r,n[1]=t.g,n[2]=t.b);else{if(uc(n,t))return;e.uniform3fv(this.addr,t),dc(n,t)}}function gc(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)&&(e.uniform4f(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w);else{if(uc(n,t))return;e.uniform4fv(this.addr,t),dc(n,t)}}function _c(e,t){let n=this.cache,r=t.elements;if(r===void 0){if(uc(n,t))return;e.uniformMatrix2fv(this.addr,!1,t),dc(n,t)}else{if(uc(n,r))return;cc.set(r),e.uniformMatrix2fv(this.addr,!1,cc),dc(n,r)}}function vc(e,t){let n=this.cache,r=t.elements;if(r===void 0){if(uc(n,t))return;e.uniformMatrix3fv(this.addr,!1,t),dc(n,t)}else{if(uc(n,r))return;sc.set(r),e.uniformMatrix3fv(this.addr,!1,sc),dc(n,r)}}function yc(e,t){let n=this.cache,r=t.elements;if(r===void 0){if(uc(n,t))return;e.uniformMatrix4fv(this.addr,!1,t),dc(n,t)}else{if(uc(n,r))return;oc.set(r),e.uniformMatrix4fv(this.addr,!1,oc),dc(n,r)}}function bc(e,t){let n=this.cache;n[0]!==t&&(e.uniform1i(this.addr,t),n[0]=t)}function xc(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y)&&(e.uniform2i(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y);else{if(uc(n,t))return;e.uniform2iv(this.addr,t),dc(n,t)}}function Sc(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)&&(e.uniform3i(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z);else{if(uc(n,t))return;e.uniform3iv(this.addr,t),dc(n,t)}}function Cc(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)&&(e.uniform4i(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w);else{if(uc(n,t))return;e.uniform4iv(this.addr,t),dc(n,t)}}function wc(e,t){let n=this.cache;n[0]!==t&&(e.uniform1ui(this.addr,t),n[0]=t)}function Tc(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y)&&(e.uniform2ui(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y);else{if(uc(n,t))return;e.uniform2uiv(this.addr,t),dc(n,t)}}function Ec(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)&&(e.uniform3ui(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z);else{if(uc(n,t))return;e.uniform3uiv(this.addr,t),dc(n,t)}}function Dc(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)&&(e.uniform4ui(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w);else{if(uc(n,t))return;e.uniform4uiv(this.addr,t),dc(n,t)}}function Oc(e){return e.version===0&&(e.compareFunction=519,e.needsUpdate=!0),e}function kc(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i);let a;a=this.type===e.SAMPLER_2D_SHADOW?Oc($s):Qs,n.setTexture2D(t||a,i)}function Ac(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i),n.setTexture3D(t||nc,i)}function jc(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i);let a;a=this.type===e.SAMPLER_CUBE_SHADOW?Oc(ec):rc,n.setTextureCube(t||a,i)}function Mc(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i),n.setTexture2DArray(t||tc,i)}function Nc(e){switch(e){case 5126:return pc;case 35664:return mc;case 35665:return hc;case 35666:return gc;case 35674:return _c;case 35675:return vc;case 35676:return yc;case 5124:case 35670:return bc;case 35667:case 35671:return xc;case 35668:case 35672:return Sc;case 35669:case 35673:return Cc;case 5125:return wc;case 36294:return Tc;case 36295:return Ec;case 36296:return Dc;case 35678:case 36198:case 36298:case 36306:case 35682:return kc;case 35679:case 36299:case 36307:return Ac;case 35680:case 36300:case 36308:case 36293:return jc;case 36289:case 36303:case 36311:case 36292:return Mc}}function Pc(e,t){e.uniform1fv(this.addr,t)}function Fc(e,t){let n=lc(t,this.size,2);e.uniform2fv(this.addr,n)}function Ic(e,t){let n=lc(t,this.size,3);e.uniform3fv(this.addr,n)}function Lc(e,t){let n=lc(t,this.size,4);e.uniform4fv(this.addr,n)}function Rc(e,t){let n=lc(t,this.size,4);e.uniformMatrix2fv(this.addr,!1,n)}function zc(e,t){let n=lc(t,this.size,9);e.uniformMatrix3fv(this.addr,!1,n)}function Bc(e,t){let n=lc(t,this.size,16);e.uniformMatrix4fv(this.addr,!1,n)}function Vc(e,t){e.uniform1iv(this.addr,t)}function Hc(e,t){e.uniform2iv(this.addr,t)}function Uc(e,t){e.uniform3iv(this.addr,t)}function Wc(e,t){e.uniform4iv(this.addr,t)}function Gc(e,t){e.uniform1uiv(this.addr,t)}function Kc(e,t){e.uniform2uiv(this.addr,t)}function qc(e,t){e.uniform3uiv(this.addr,t)}function Jc(e,t){e.uniform4uiv(this.addr,t)}function Yc(e,t,n){let r=this.cache,i=t.length,a=fc(n,i);uc(r,a)||(e.uniform1iv(this.addr,a),dc(r,a));let o;o=this.type===e.SAMPLER_2D_SHADOW?Oc($s):Qs;for(let e=0;e!==i;++e)n.setTexture2D(t[e]||o,a[e])}function Xc(e,t,n){let r=this.cache,i=t.length,a=fc(n,i);uc(r,a)||(e.uniform1iv(this.addr,a),dc(r,a));for(let e=0;e!==i;++e)n.setTexture3D(t[e]||nc,a[e])}function Zc(e,t,n){let r=this.cache,i=t.length,a=fc(n,i);uc(r,a)||(e.uniform1iv(this.addr,a),dc(r,a));let o;o=this.type===e.SAMPLER_CUBE_SHADOW?Oc(ec):rc;for(let e=0;e!==i;++e)n.setTextureCube(t[e]||o,a[e])}function Qc(e,t,n){let r=this.cache,i=t.length,a=fc(n,i);uc(r,a)||(e.uniform1iv(this.addr,a),dc(r,a));for(let e=0;e!==i;++e)n.setTexture2DArray(t[e]||tc,a[e])}function $c(e){switch(e){case 5126:return Pc;case 35664:return Fc;case 35665:return Ic;case 35666:return Lc;case 35674:return Rc;case 35675:return zc;case 35676:return Bc;case 5124:case 35670:return Vc;case 35667:case 35671:return Hc;case 35668:case 35672:return Uc;case 35669:case 35673:return Wc;case 5125:return Gc;case 36294:return Kc;case 36295:return qc;case 36296:return Jc;case 35678:case 36198:case 36298:case 36306:case 35682:return Yc;case 35679:case 36299:case 36307:return Xc;case 35680:case 36300:case 36308:case 36293:return Zc;case 36289:case 36303:case 36311:case 36292:return Qc}}var el=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.setValue=Nc(t.type)}},tl=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=$c(t.type)}},nl=class{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,n){let r=this.seq;for(let i=0,a=r.length;i!==a;++i){let a=r[i];a.setValue(e,t[a.id],n)}}},rl=/(\w+)(\])?(\[|\.)?/g;function il(e,t){e.seq.push(t),e.map[t.id]=t}function al(e,t,n){let r=e.name,i=r.length;for(rl.lastIndex=0;;){let a=rl.exec(r),o=rl.lastIndex,s=a[1],c=a[2]===`]`,l=a[3];if(c&&(s|=0),l===void 0||l===`[`&&o+2===i){il(n,l===void 0?new el(s,e,t):new tl(s,e,t));break}{let e=n.map[s];e===void 0&&(e=new nl(s),il(n,e)),n=e}}}var ol=class{constructor(e,t){this.seq=[],this.map={};let n=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let r=0;r<n;++r){let n=e.getActiveUniform(t,r);al(n,e.getUniformLocation(t,n.name),this)}let r=[],i=[];for(let t of this.seq)t.type===e.SAMPLER_2D_SHADOW||t.type===e.SAMPLER_CUBE_SHADOW||t.type===e.SAMPLER_2D_ARRAY_SHADOW?r.push(t):i.push(t);r.length>0&&(this.seq=r.concat(i))}setValue(e,t,n,r){let i=this.map[t];i!==void 0&&i.setValue(e,n,r)}setOptional(e,t,n){let r=t[n];r!==void 0&&this.setValue(e,n,r)}static upload(e,t,n,r){for(let i=0,a=t.length;i!==a;++i){let a=t[i],o=n[a.id];o.needsUpdate!==!1&&a.setValue(e,o.value,r)}}static seqWithValue(e,t){let n=[];for(let r=0,i=e.length;r!==i;++r){let i=e[r];i.id in t&&n.push(i)}return n}};function sl(e,t,n){let r=e.createShader(t);return e.shaderSource(r,n),e.compileShader(r),r}var cl=37297,ll=0;function ul(e,t){let n=e.split(`
`),r=[],i=Math.max(t-6,0),a=Math.min(t+6,n.length);for(let e=i;e<a;e++){let i=e+1;r.push(`${i===t?`>`:` `} ${i}: ${n[e]}`)}return r.join(`
`)}var dl=new Y;function fl(e){X._getMatrix(dl,X.workingColorSpace,e);let t=`mat3( ${dl.elements.map(e=>e.toFixed(4))} )`;switch(X.getTransfer(e)){case Yt:return[t,`LinearTransferOETF`];case Xt:return[t,`sRGBTransferOETF`];default:return W(`WebGLProgram: Unsupported color space: `,e),[t,`LinearTransferOETF`]}}function pl(e,t,n){let r=e.getShaderParameter(t,e.COMPILE_STATUS),i=(e.getShaderInfoLog(t)||``).trim();if(r&&i===``)return``;let a=/ERROR: 0:(\d+)/.exec(i);if(a){let r=parseInt(a[1]);return n.toUpperCase()+`

`+i+`

`+ul(e.getShaderSource(t),r)}return i}function ml(e,t){let n=fl(t);return[`vec4 ${e}( vec4 value ) {`,`	return ${n[1]}( vec4( ${n[0]} * value.rgb, value.a ) );`,`}`].join(`
`)}var hl={1:`Linear`,2:`Reinhard`,3:`Cineon`,4:`ACESFilmic`,6:`AgX`,7:`Neutral`,5:`Custom`};function gl(e,t){let n=hl[t];return n===void 0?(W(`WebGLProgram: Unsupported toneMapping:`,t),`vec3 `+e+`( vec3 color ) { return LinearToneMapping( color ); }`):`vec3 `+e+`( vec3 color ) { return `+n+`ToneMapping( color ); }`}var _l=new J;function vl(){return X.getLuminanceCoefficients(_l),[`float luminance( const in vec3 rgb ) {`,`	const vec3 weights = vec3( ${_l.x.toFixed(4)}, ${_l.y.toFixed(4)}, ${_l.z.toFixed(4)} );`,`	return dot( weights, rgb );`,`}`].join(`
`)}function yl(e){return[e.extensionClipCullDistance?`#extension GL_ANGLE_clip_cull_distance : require`:``,e.extensionMultiDraw?`#extension GL_ANGLE_multi_draw : require`:``].filter(Sl).join(`
`)}function bl(e){let t=[];for(let n in e){let r=e[n];r!==!1&&t.push(`#define `+n+` `+r)}return t.join(`
`)}function xl(e,t){let n={},r=e.getProgramParameter(t,e.ACTIVE_ATTRIBUTES);for(let i=0;i<r;i++){let r=e.getActiveAttrib(t,i),a=r.name,o=1;r.type===e.FLOAT_MAT2&&(o=2),r.type===e.FLOAT_MAT3&&(o=3),r.type===e.FLOAT_MAT4&&(o=4),n[a]={type:r.type,location:e.getAttribLocation(t,a),locationSize:o}}return n}function Sl(e){return e!==``}function Cl(e,t){let n=t.numSpotLightShadows+t.numSpotLightMaps-t.numSpotLightShadowsWithMaps;return e.replace(/NUM_SUN_LIGHTS/g,t.numSunLights).replace(/NUM_DIR_LIGHTS/g,t.numDirLights).replace(/NUM_SPOT_LIGHTS/g,t.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,t.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,n).replace(/NUM_RECT_AREA_LIGHTS/g,t.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,t.numPointLights).replace(/NUM_HEMI_LIGHTS/g,t.numHemiLights).replace(/NUM_SUN_LIGHT_SHADOWS/g,t.numSunLightShadows).replace(/NUM_DIR_LIGHT_SHADOWS/g,t.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,t.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,t.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,t.numPointLightShadows).replace(/NUM_LIGHT_PROBE_GRIDS/g,t.numLightProbeGrids)}function wl(e,t){return e.replace(/NUM_CLIPPING_PLANES/g,t.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,t.numClippingPlanes-t.numClipIntersection)}var Tl=/^[ \t]*#include +<([\w\d./]+)>/gm;function El(e){return e.replace(Tl,Dl)}function Dl(e,t){let n=Q[t];if(n===void 0)throw Error(`THREE.WebGLProgram: Can not resolve #include <`+t+`>`);return El(n)}var Ol=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function kl(e){return e.replace(Ol,Al)}function Al(e,t,n,r){let i=``;for(let e=parseInt(t);e<parseInt(n);e++)i+=r.replace(/\[\s*i\s*\]/g,`[ `+e+` ]`).replace(/UNROLLED_LOOP_INDEX/g,e);return i}function jl(e){let t=`precision ${e.precision} float;
	precision ${e.precision} int;
	precision ${e.precision} sampler2D;
	precision ${e.precision} samplerCube;
	precision ${e.precision} sampler3D;
	precision ${e.precision} sampler2DArray;
	precision ${e.precision} sampler2DShadow;
	precision ${e.precision} samplerCubeShadow;
	precision ${e.precision} sampler2DArrayShadow;
	precision ${e.precision} isampler2D;
	precision ${e.precision} isampler3D;
	precision ${e.precision} isamplerCube;
	precision ${e.precision} isampler2DArray;
	precision ${e.precision} usampler2D;
	precision ${e.precision} usampler3D;
	precision ${e.precision} usamplerCube;
	precision ${e.precision} usampler2DArray;
	`;return e.precision===`highp`?t+=`
#define HIGH_PRECISION`:e.precision===`mediump`?t+=`
#define MEDIUM_PRECISION`:e.precision===`lowp`&&(t+=`
#define LOW_PRECISION`),t}var Ml={1:`SHADOWMAP_TYPE_PCF`,3:`SHADOWMAP_TYPE_VSM`};function Nl(e){return Ml[e.shadowMapType]||`SHADOWMAP_TYPE_BASIC`}var Pl={302:`ENVMAP_MODE_REFRACTION`};function Fl(e){return e.envMap===!1?`ENVMAP_MODE_REFLECTION`:Pl[e.envMapMode]||`ENVMAP_MODE_REFLECTION`}var Il={0:`ENVMAP_BLENDING_MULTIPLY`,1:`ENVMAP_BLENDING_MIX`,2:`ENVMAP_BLENDING_ADD`};function Ll(e){return e.envMap===!1?`ENVMAP_BLENDING_NONE`:Il[e.combine]||`ENVMAP_BLENDING_NONE`}function Rl(e,t,n,r){let i=e.getContext(),a=n.defines,o=n.vertexShader,s=n.fragmentShader,c=Nl(n),l=n.envMapPMREM===!0?`ENVMAP_TYPE_PMREM`:`ENVMAP_TYPE_CUBE`,u=Fl(n),d=Ll(n),f=yl(n),p=bl(a),m=i.createProgram(),h,g,_=n.glslVersion?`#version `+n.glslVersion+`
`:``;n.isRawShaderMaterial?(h=[`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,p].filter(Sl).join(`
`),h.length>0&&(h+=`
`),g=[`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,p].filter(Sl).join(`
`),g.length>0&&(g+=`
`)):(h=[jl(n),`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,p,n.extensionClipCullDistance?`#define USE_CLIP_DISTANCE`:``,n.batching?`#define USE_BATCHING`:``,n.batchingColor?`#define USE_BATCHING_COLOR`:``,n.instancing?`#define USE_INSTANCING`:``,n.instancingColor?`#define USE_INSTANCING_COLOR`:``,n.instancingMorph?`#define USE_INSTANCING_MORPH`:``,n.useFog&&n.fog?`#define USE_FOG`:``,n.useFog&&n.fogExp2?`#define FOG_EXP2`:``,n.map?`#define USE_MAP`:``,n.envMap?`#define USE_ENVMAP`:``,n.envMap?`#define `+u:``,n.lightMap?`#define USE_LIGHTMAP`:``,n.aoMap?`#define USE_AOMAP`:``,n.bumpMap?`#define USE_BUMPMAP`:``,n.normalMap?`#define USE_NORMALMAP`:``,n.normalMapObjectSpace?`#define USE_NORMALMAP_OBJECTSPACE`:``,n.normalMapTangentSpace?`#define USE_NORMALMAP_TANGENTSPACE`:``,n.displacementMap?`#define USE_DISPLACEMENTMAP`:``,n.emissiveMap?`#define USE_EMISSIVEMAP`:``,n.anisotropy?`#define USE_ANISOTROPY`:``,n.anisotropyMap?`#define USE_ANISOTROPYMAP`:``,n.clearcoatMap?`#define USE_CLEARCOATMAP`:``,n.clearcoatRoughnessMap?`#define USE_CLEARCOAT_ROUGHNESSMAP`:``,n.clearcoatNormalMap?`#define USE_CLEARCOAT_NORMALMAP`:``,n.diffuseRoughnessMap?`#define USE_DIFFUSE_ROUGHNESSMAP`:``,n.iridescenceMap?`#define USE_IRIDESCENCEMAP`:``,n.iridescenceThicknessMap?`#define USE_IRIDESCENCE_THICKNESSMAP`:``,n.specularMap?`#define USE_SPECULARMAP`:``,n.specularColorMap?`#define USE_SPECULAR_COLORMAP`:``,n.specularIntensityMap?`#define USE_SPECULAR_INTENSITYMAP`:``,n.roughnessMap?`#define USE_ROUGHNESSMAP`:``,n.metalnessMap?`#define USE_METALNESSMAP`:``,n.alphaMap?`#define USE_ALPHAMAP`:``,n.alphaHash?`#define USE_ALPHAHASH`:``,n.transmission?`#define USE_TRANSMISSION`:``,n.transmissionMap?`#define USE_TRANSMISSIONMAP`:``,n.thicknessMap?`#define USE_THICKNESSMAP`:``,n.sheenColorMap?`#define USE_SHEEN_COLORMAP`:``,n.sheenRoughnessMap?`#define USE_SHEEN_ROUGHNESSMAP`:``,n.mapUv?`#define MAP_UV `+n.mapUv:``,n.alphaMapUv?`#define ALPHAMAP_UV `+n.alphaMapUv:``,n.lightMapUv?`#define LIGHTMAP_UV `+n.lightMapUv:``,n.aoMapUv?`#define AOMAP_UV `+n.aoMapUv:``,n.emissiveMapUv?`#define EMISSIVEMAP_UV `+n.emissiveMapUv:``,n.bumpMapUv?`#define BUMPMAP_UV `+n.bumpMapUv:``,n.normalMapUv?`#define NORMALMAP_UV `+n.normalMapUv:``,n.displacementMapUv?`#define DISPLACEMENTMAP_UV `+n.displacementMapUv:``,n.metalnessMapUv?`#define METALNESSMAP_UV `+n.metalnessMapUv:``,n.roughnessMapUv?`#define ROUGHNESSMAP_UV `+n.roughnessMapUv:``,n.anisotropyMapUv?`#define ANISOTROPYMAP_UV `+n.anisotropyMapUv:``,n.clearcoatMapUv?`#define CLEARCOATMAP_UV `+n.clearcoatMapUv:``,n.clearcoatNormalMapUv?`#define CLEARCOAT_NORMALMAP_UV `+n.clearcoatNormalMapUv:``,n.clearcoatRoughnessMapUv?`#define CLEARCOAT_ROUGHNESSMAP_UV `+n.clearcoatRoughnessMapUv:``,n.diffuseRoughnessMapUv?`#define DIFFUSE_ROUGHNESSMAP_UV `+n.diffuseRoughnessMapUv:``,n.iridescenceMapUv?`#define IRIDESCENCEMAP_UV `+n.iridescenceMapUv:``,n.iridescenceThicknessMapUv?`#define IRIDESCENCE_THICKNESSMAP_UV `+n.iridescenceThicknessMapUv:``,n.sheenColorMapUv?`#define SHEEN_COLORMAP_UV `+n.sheenColorMapUv:``,n.sheenRoughnessMapUv?`#define SHEEN_ROUGHNESSMAP_UV `+n.sheenRoughnessMapUv:``,n.specularMapUv?`#define SPECULARMAP_UV `+n.specularMapUv:``,n.specularColorMapUv?`#define SPECULAR_COLORMAP_UV `+n.specularColorMapUv:``,n.specularIntensityMapUv?`#define SPECULAR_INTENSITYMAP_UV `+n.specularIntensityMapUv:``,n.transmissionMapUv?`#define TRANSMISSIONMAP_UV `+n.transmissionMapUv:``,n.thicknessMapUv?`#define THICKNESSMAP_UV `+n.thicknessMapUv:``,n.vertexTangents&&n.flatShading===!1?`#define USE_TANGENT`:``,n.vertexNormals?`#define HAS_NORMAL`:``,n.vertexColors?`#define USE_COLOR`:``,n.vertexAlphas?`#define USE_COLOR_ALPHA`:``,n.vertexUv1s?`#define USE_UV1`:``,n.vertexUv2s?`#define USE_UV2`:``,n.vertexUv3s?`#define USE_UV3`:``,n.pointsUvs?`#define USE_POINTS_UV`:``,n.flatShading?`#define FLAT_SHADED`:``,n.skinning?`#define USE_SKINNING`:``,n.morphTargets?`#define USE_MORPHTARGETS`:``,n.morphNormals&&n.flatShading===!1?`#define USE_MORPHNORMALS`:``,n.morphColors?`#define USE_MORPHCOLORS`:``,n.morphTargetsCount>0?`#define MORPHTARGETS_TEXTURE_STRIDE `+n.morphTextureStride:``,n.morphTargetsCount>0?`#define MORPHTARGETS_COUNT `+n.morphTargetsCount:``,n.doubleSided?`#define DOUBLE_SIDED`:``,n.flipSided?`#define FLIP_SIDED`:``,n.shadowMapEnabled?`#define USE_SHADOWMAP`:``,n.shadowMapEnabled?`#define `+c:``,n.sizeAttenuation?`#define USE_SIZEATTENUATION`:``,n.numLightProbes>0?`#define USE_LIGHT_PROBES`:``,n.logarithmicDepthBuffer?`#define USE_LOGARITHMIC_DEPTH_BUFFER`:``,n.reversedDepthBuffer?`#define USE_REVERSED_DEPTH_BUFFER`:``,`uniform mat4 modelMatrix;`,`uniform mat4 modelViewMatrix;`,`uniform mat4 projectionMatrix;`,`uniform mat4 viewMatrix;`,`uniform mat3 normalMatrix;`,`uniform vec3 cameraPosition;`,`uniform bool isOrthographic;`,`#ifdef USE_INSTANCING`,`	attribute mat4 instanceMatrix;`,`#endif`,`#ifdef USE_INSTANCING_COLOR`,`	attribute vec3 instanceColor;`,`#endif`,`#ifdef USE_INSTANCING_MORPH`,`	uniform sampler2D morphTexture;`,`#endif`,`attribute vec3 position;`,`attribute vec3 normal;`,`attribute vec2 uv;`,`#ifdef USE_UV1`,`	attribute vec2 uv1;`,`#endif`,`#ifdef USE_UV2`,`	attribute vec2 uv2;`,`#endif`,`#ifdef USE_UV3`,`	attribute vec2 uv3;`,`#endif`,`#ifdef USE_TANGENT`,`	attribute vec4 tangent;`,`#endif`,`#if defined( USE_COLOR_ALPHA )`,`	attribute vec4 color;`,`#elif defined( USE_COLOR )`,`	attribute vec3 color;`,`#endif`,`#ifdef USE_SKINNING`,`	attribute vec4 skinIndex;`,`	attribute vec4 skinWeight;`,`#endif`,`
`].filter(Sl).join(`
`),g=[jl(n),`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,p,n.useFog&&n.fog?`#define USE_FOG`:``,n.useFog&&n.fogExp2?`#define FOG_EXP2`:``,n.alphaToCoverage?`#define ALPHA_TO_COVERAGE`:``,n.map?`#define USE_MAP`:``,n.matcap?`#define USE_MATCAP`:``,n.envMap?`#define USE_ENVMAP`:``,n.envMap?`#define `+l:``,n.envMap?`#define `+u:``,n.envMap?`#define `+d:``,n.envMapPMREM?`#define ENVMAP_MAX_LOD `+n.envMapMaxLod+`.0`:``,n.envMapPMREM?`#define ENVMAP_SIZE `+n.envMapSize+`.0`:``,n.lightMap?`#define USE_LIGHTMAP`:``,n.aoMap?`#define USE_AOMAP`:``,n.bumpMap?`#define USE_BUMPMAP`:``,n.normalMap?`#define USE_NORMALMAP`:``,n.normalMapObjectSpace?`#define USE_NORMALMAP_OBJECTSPACE`:``,n.normalMapTangentSpace?`#define USE_NORMALMAP_TANGENTSPACE`:``,n.packedNormalMap?`#define USE_PACKED_NORMALMAP`:``,n.emissiveMap?`#define USE_EMISSIVEMAP`:``,n.anisotropy?`#define USE_ANISOTROPY`:``,n.anisotropyMap?`#define USE_ANISOTROPYMAP`:``,n.clearcoat?`#define USE_CLEARCOAT`:``,n.clearcoatMap?`#define USE_CLEARCOATMAP`:``,n.clearcoatRoughnessMap?`#define USE_CLEARCOAT_ROUGHNESSMAP`:``,n.clearcoatNormalMap?`#define USE_CLEARCOAT_NORMALMAP`:``,n.diffuseRoughness?`#define USE_DIFFUSE_ROUGHNESS`:``,n.diffuseRoughnessMap?`#define USE_DIFFUSE_ROUGHNESSMAP`:``,n.dispersion?`#define USE_DISPERSION`:``,n.retroreflection?`#define USE_RETROREFLECTION`:``,n.iridescence?`#define USE_IRIDESCENCE`:``,n.iridescenceMap?`#define USE_IRIDESCENCEMAP`:``,n.iridescenceThicknessMap?`#define USE_IRIDESCENCE_THICKNESSMAP`:``,n.specularMap?`#define USE_SPECULARMAP`:``,n.specularColorMap?`#define USE_SPECULAR_COLORMAP`:``,n.specularIntensityMap?`#define USE_SPECULAR_INTENSITYMAP`:``,n.roughnessMap?`#define USE_ROUGHNESSMAP`:``,n.metalnessMap?`#define USE_METALNESSMAP`:``,n.alphaMap?`#define USE_ALPHAMAP`:``,n.alphaTest?`#define USE_ALPHATEST`:``,n.alphaHash?`#define USE_ALPHAHASH`:``,n.sheen?`#define USE_SHEEN`:``,n.sheenColorMap?`#define USE_SHEEN_COLORMAP`:``,n.sheenRoughnessMap?`#define USE_SHEEN_ROUGHNESSMAP`:``,n.transmission?`#define USE_TRANSMISSION`:``,n.transmissionMap?`#define USE_TRANSMISSIONMAP`:``,n.thicknessMap?`#define USE_THICKNESSMAP`:``,n.vertexTangents&&n.flatShading===!1?`#define USE_TANGENT`:``,n.vertexColors||n.instancingColor?`#define USE_COLOR`:``,n.vertexAlphas||n.batchingColor?`#define USE_COLOR_ALPHA`:``,n.vertexUv1s?`#define USE_UV1`:``,n.vertexUv2s?`#define USE_UV2`:``,n.vertexUv3s?`#define USE_UV3`:``,n.pointsUvs?`#define USE_POINTS_UV`:``,n.gradientMap?`#define USE_GRADIENTMAP`:``,n.flatShading?`#define FLAT_SHADED`:``,n.doubleSided?`#define DOUBLE_SIDED`:``,n.flipSided?`#define FLIP_SIDED`:``,n.shadowMapEnabled?`#define USE_SHADOWMAP`:``,n.shadowMapEnabled?`#define `+c:``,n.premultipliedAlpha?`#define PREMULTIPLIED_ALPHA`:``,n.numLightProbes>0?`#define USE_LIGHT_PROBES`:``,n.decodeVideoTexture?`#define DECODE_VIDEO_TEXTURE`:``,n.decodeVideoTextureEmissive?`#define DECODE_VIDEO_TEXTURE_EMISSIVE`:``,n.logarithmicDepthBuffer?`#define USE_LOGARITHMIC_DEPTH_BUFFER`:``,n.reversedDepthBuffer?`#define USE_REVERSED_DEPTH_BUFFER`:``,`uniform mat4 viewMatrix;`,`uniform vec3 cameraPosition;`,`uniform bool isOrthographic;`,n.toneMapping===0?``:`#define TONE_MAPPING`,n.toneMapping===0?``:Q.tonemapping_pars_fragment,n.toneMapping===0?``:gl(`toneMapping`,n.toneMapping),n.dithering?`#define DITHERING`:``,n.opaque?`#define OPAQUE`:``,Q.colorspace_pars_fragment,ml(`linearToOutputTexel`,n.outputColorSpace),vl(),n.useDepthPacking?`#define DEPTH_PACKING `+n.depthPacking:``,`
`].filter(Sl).join(`
`)),o=El(o),o=Cl(o,n),o=wl(o,n),s=El(s),s=Cl(s,n),s=wl(s,n),o=kl(o),s=kl(s),n.isRawShaderMaterial!==!0&&(_=`#version 300 es
`,h=[f,`#define attribute in`,`#define varying out`,`#define texture2D texture`].join(`
`)+`
`+h,g=[`#define varying in`,n.glslVersion===`300 es`?``:`layout(location = 0) out highp vec4 pc_fragColor;`,n.glslVersion===`300 es`?``:`#define gl_FragColor pc_fragColor`,`#define gl_FragDepthEXT gl_FragDepth`,`#define texture2D texture`,`#define textureCube texture`,`#define texture2DProj textureProj`,`#define texture2DLodEXT textureLod`,`#define texture2DProjLodEXT textureProjLod`,`#define textureCubeLodEXT textureLod`,`#define texture2DGradEXT textureGrad`,`#define texture2DProjGradEXT textureProjGrad`,`#define textureCubeGradEXT textureGrad`].join(`
`)+`
`+g);let v=_+h+o,y=_+g+s,b=sl(i,i.VERTEX_SHADER,v),x=sl(i,i.FRAGMENT_SHADER,y);i.attachShader(m,b),i.attachShader(m,x),n.index0AttributeName===void 0?n.hasPositionAttribute===!0&&i.bindAttribLocation(m,0,`position`):i.bindAttribLocation(m,0,n.index0AttributeName),i.linkProgram(m);function S(t){if(e.debug.checkShaderErrors){let n=i.getProgramInfoLog(m)||``,r=i.getShaderInfoLog(b)||``,a=i.getShaderInfoLog(x)||``,o=n.trim(),s=r.trim(),c=a.trim(),l=!0,u=!0;if(i.getProgramParameter(m,i.LINK_STATUS)===!1){if(l=!1,typeof e.debug.onShaderError==`function`)e.debug.onShaderError(i,m,b,x);else{let e=pl(i,b,`vertex`),n=pl(i,x,`fragment`);G(`WebGLProgram: Shader Error `+i.getError()+` - VALIDATE_STATUS `+i.getProgramParameter(m,i.VALIDATE_STATUS)+`

Material Name: `+t.name+`
Material Type: `+t.type+`

Program Info Log: `+o+`
`+e+`
`+n)}}else o===``?(s===``||c===``)&&(u=!1):W(`WebGLProgram: Program Info Log:`,o);u&&(t.diagnostics={runnable:l,programLog:o,vertexShader:{log:s,prefix:h},fragmentShader:{log:c,prefix:g}})}i.deleteShader(b),i.deleteShader(x),C=new ol(i,m),w=xl(i,m)}let C;this.getUniforms=function(){return C===void 0&&S(this),C};let w;this.getAttributes=function(){return w===void 0&&S(this),w};let T=n.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return T===!1&&(T=i.getProgramParameter(m,cl)),T},this.destroy=function(){r.releaseStatesOfProgram(this),i.deleteProgram(m),this.program=void 0},this.type=n.shaderType,this.name=n.shaderName,this.id=ll++,this.cacheKey=t,this.usedTimes=1,this.program=m,this.vertexShader=b,this.fragmentShader=x,this}var zl=0,Bl=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e,t,n){let r=this._getShaderCacheForMaterial(e);return r.has(t)===!1&&(r.add(t),t.usedTimes++),r.has(n)===!1&&(r.add(n),n.usedTimes++),this}remove(e){let t=this.materialCache.get(e);for(let e of t)e.usedTimes--,e.usedTimes===0&&this.shaderCache.delete(e.code);return this.materialCache.delete(e),this}getVertexShaderStage(e){return this._getShaderStage(e.vertexShader)}getFragmentShaderStage(e){return this._getShaderStage(e.fragmentShader)}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){let t=this.materialCache,n=t.get(e);return n===void 0&&(n=new Set,t.set(e,n)),n}_getShaderStage(e){let t=this.shaderCache,n=t.get(e);return n===void 0&&(n=new Vl(e),t.set(e,n)),n}},Vl=class{constructor(e){this.id=zl++,this.code=e,this.usedTimes=0}};function Hl(e){return e===1030||e===37490||e===36285}function Ul(e,t,n,r,i,a){let o=new yr,s=new Bl,c=new Set,l=[],u=new Map,d=r.logarithmicDepthBuffer,f={MeshDepthMaterial:`depth`,MeshDistanceMaterial:`distance`,MeshNormalMaterial:`normal`,MeshBasicMaterial:`basic`,MeshLambertMaterial:`lambert`,MeshPhongMaterial:`phong`,MeshToonMaterial:`toon`,MeshStandardMaterial:`physical`,MeshPhysicalMaterial:`physical`,MeshMatcapMaterial:`matcap`,LineBasicMaterial:`basic`,LineDashedMaterial:`dashed`,PointsMaterial:`points`,ShadowMaterial:`shadow`,SpriteMaterial:`sprite`};function p(e){return c.add(e),e===0?`uv`:`uv${e}`}function m(i,o,l,u,m,h){let g=u.fog,_=m.geometry,v=i.isMeshStandardMaterial||i.isMeshLambertMaterial||i.isMeshPhongMaterial?u.environment:null,y=i.isMeshStandardMaterial||i.isMeshLambertMaterial&&!i.envMap||i.isMeshPhongMaterial&&!i.envMap,b=t.get(i.envMap||v,y),x=f[i.type],S=r.precision;i.precision!==null&&(S=r.getMaxPrecision(i.precision),S!==i.precision&&W(`WebGLProgram.getParameters:`,i.precision,`not supported, using`,S,`instead.`));let C=_.morphAttributes.position||_.morphAttributes.normal||_.morphAttributes.color,w=C===void 0?0:C.length,T=0;_.morphAttributes.position!==void 0&&(T=1),_.morphAttributes.normal!==void 0&&(T=2),_.morphAttributes.color!==void 0&&(T=3);let E,D,O,k;if(x){let e=_s[x];E=e.vertexShader,D=e.fragmentShader}else{E=i.vertexShader,D=i.fragmentShader;let e=s.getVertexShaderStage(i),t=s.getFragmentShaderStage(i);s.update(i,e,t),O=e.id,k=t.id}let A=e.getRenderTarget(),j=e.state.buffers.depth.getReversed(),M=m.isInstancedMesh===!0,N=m.isBatchedMesh===!0,ee=!!i.map,P=!!i.matcap,F=!!b,te=F&&b.isPMREMTexture===!0,ne=!!i.aoMap,re=!!i.lightMap,ie=!!i.bumpMap&&i.wireframe===!1,ae=!!i.normalMap,oe=!!i.displacementMap,I=!!i.emissiveMap,se=!!i.metalnessMap,ce=!!i.roughnessMap,L=i.anisotropy>0,R=i.clearcoat>0,le=i.diffuseRoughness>0,ue=i.dispersion>0,de=i.retroreflectivity>0,fe=i.iridescence>0,pe=i.sheen>0,me=i.transmission>0,he=L&&!!i.anisotropyMap,ge=R&&!!i.clearcoatMap,_e=R&&!!i.clearcoatNormalMap,ve=R&&!!i.clearcoatRoughnessMap,ye=le&&!!i.diffuseRoughnessMap,z=fe&&!!i.iridescenceMap,be=fe&&!!i.iridescenceThicknessMap,xe=pe&&!!i.sheenColorMap,Se=pe&&!!i.sheenRoughnessMap,B=!!i.specularMap,Ce=!!i.specularColorMap,V=!!i.specularIntensityMap,H=me&&!!i.transmissionMap,we=me&&!!i.thicknessMap,Te=!!i.gradientMap,Ee=!!i.alphaMap,De=i.alphaTest>0,Oe=!!i.alphaHash,ke=!!i.extensions,Ae=0;i.toneMapped&&(A===null||A.isXRRenderTarget===!0)&&(Ae=e.toneMapping);let je=te?b.isCompressedCubeTexture?b.image[0].mipmaps:b.mipmaps:null,U={shaderID:x,shaderType:i.type,shaderName:i.name,vertexShader:E,fragmentShader:D,defines:i.defines,customVertexShaderID:O,customFragmentShaderID:k,isRawShaderMaterial:i.isRawShaderMaterial===!0,glslVersion:i.glslVersion,precision:S,batching:N,batchingColor:N&&m._colorsTexture!==null,instancing:M,instancingColor:M&&m.instanceColor!==null,instancingMorph:M&&m.morphTexture!==null,outputColorSpace:A===null?e.outputColorSpace:A.isXRRenderTarget===!0?A.texture.colorSpace:X.workingColorSpace,alphaToCoverage:!!i.alphaToCoverage,map:ee,matcap:P,envMap:F,envMapMode:F&&b.mapping,envMapPMREM:te,envMapMaxLod:te?je.length-1:null,envMapSize:te?je[0].width:null,aoMap:ne,lightMap:re,bumpMap:ie,normalMap:ae,displacementMap:oe,emissiveMap:I,normalMapObjectSpace:ae&&i.normalMapType===1,normalMapTangentSpace:ae&&i.normalMapType===0,packedNormalMap:ae&&i.normalMapType===0&&Hl(i.normalMap.format),metalnessMap:se,roughnessMap:ce,anisotropy:L,anisotropyMap:he,clearcoat:R,clearcoatMap:ge,clearcoatNormalMap:_e,clearcoatRoughnessMap:ve,diffuseRoughness:le,diffuseRoughnessMap:ye,dispersion:ue,retroreflection:de,iridescence:fe,iridescenceMap:z,iridescenceThicknessMap:be,sheen:pe,sheenColorMap:xe,sheenRoughnessMap:Se,specularMap:B,specularColorMap:Ce,specularIntensityMap:V,transmission:me,transmissionMap:H,thicknessMap:we,gradientMap:Te,opaque:i.transparent===!1&&i.blending===1&&i.alphaToCoverage===!1,alphaMap:Ee,alphaTest:De,alphaHash:Oe,combine:i.combine,mapUv:ee&&p(i.map.channel),aoMapUv:ne&&p(i.aoMap.channel),lightMapUv:re&&p(i.lightMap.channel),bumpMapUv:ie&&p(i.bumpMap.channel),normalMapUv:ae&&p(i.normalMap.channel),displacementMapUv:oe&&p(i.displacementMap.channel),emissiveMapUv:I&&p(i.emissiveMap.channel),metalnessMapUv:se&&p(i.metalnessMap.channel),roughnessMapUv:ce&&p(i.roughnessMap.channel),anisotropyMapUv:he&&p(i.anisotropyMap.channel),clearcoatMapUv:ge&&p(i.clearcoatMap.channel),clearcoatNormalMapUv:_e&&p(i.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:ve&&p(i.clearcoatRoughnessMap.channel),diffuseRoughnessMapUv:ye&&p(i.diffuseRoughnessMap.channel),iridescenceMapUv:z&&p(i.iridescenceMap.channel),iridescenceThicknessMapUv:be&&p(i.iridescenceThicknessMap.channel),sheenColorMapUv:xe&&p(i.sheenColorMap.channel),sheenRoughnessMapUv:Se&&p(i.sheenRoughnessMap.channel),specularMapUv:B&&p(i.specularMap.channel),specularColorMapUv:Ce&&p(i.specularColorMap.channel),specularIntensityMapUv:V&&p(i.specularIntensityMap.channel),transmissionMapUv:H&&p(i.transmissionMap.channel),thicknessMapUv:we&&p(i.thicknessMap.channel),alphaMapUv:Ee&&p(i.alphaMap.channel),vertexTangents:!!_.attributes.tangent&&(ae||L),vertexNormals:!!_.attributes.normal,vertexColors:i.vertexColors,vertexAlphas:i.vertexColors===!0&&!!_.attributes.color&&_.attributes.color.itemSize===4,pointsUvs:m.isPoints===!0&&!!_.attributes.uv&&(ee||Ee),fog:!!g,useFog:i.fog===!0,fogExp2:!!g&&g.isFogExp2,flatShading:i.wireframe===!1&&(i.flatShading===!0||_.attributes.normal===void 0&&ae===!1&&(i.isMeshLambertMaterial||i.isMeshPhongMaterial||i.isMeshStandardMaterial||i.isMeshPhysicalMaterial)),sizeAttenuation:i.sizeAttenuation===!0,logarithmicDepthBuffer:d,reversedDepthBuffer:j,skinning:m.isSkinnedMesh===!0,hasPositionAttribute:_.attributes.position!==void 0,morphTargets:_.morphAttributes.position!==void 0,morphNormals:_.morphAttributes.normal!==void 0,morphColors:_.morphAttributes.color!==void 0,morphTargetsCount:w,morphTextureStride:T,numSunLights:o.sun.length,numDirLights:o.directional.length,numPointLights:o.point.length,numSpotLights:o.spot.length,numSpotLightMaps:o.spotLightMap.length,numRectAreaLights:o.rectArea.length,numHemiLights:o.hemi.length,numSunLightShadows:o.sunShadowMap.length,numDirLightShadows:o.directionalShadowMap.length,numPointLightShadows:o.pointShadowMap.length,numSpotLightShadows:o.spotShadowMap.length,numSpotLightShadowsWithMaps:o.numSpotLightShadowsWithMaps,numLightProbes:o.numLightProbes,numLightProbeGrids:h.filter(e=>e.texture!==null).length,numClippingPlanes:a.numPlanes,numClipIntersection:a.numIntersection,dithering:i.dithering,shadowMapEnabled:e.shadowMap.enabled&&l.length>0,shadowMapType:e.shadowMap.type,toneMapping:Ae,decodeVideoTexture:ee&&i.map.isVideoTexture===!0&&X.getTransfer(i.map.colorSpace)===`srgb`,decodeVideoTextureEmissive:I&&i.emissiveMap.isVideoTexture===!0&&X.getTransfer(i.emissiveMap.colorSpace)===`srgb`,premultipliedAlpha:i.premultipliedAlpha,doubleSided:i.side===2,flipSided:i.side===1,useDepthPacking:i.depthPacking>=0,depthPacking:i.depthPacking||0,index0AttributeName:i.index0AttributeName,extensionClipCullDistance:ke&&i.extensions.clipCullDistance===!0&&n.has(`WEBGL_clip_cull_distance`),extensionMultiDraw:(ke&&i.extensions.multiDraw===!0||N)&&n.has(`WEBGL_multi_draw`),rendererExtensionParallelShaderCompile:n.has(`KHR_parallel_shader_compile`),customProgramCacheKey:i.customProgramCacheKey()};return U.vertexUv1s=c.has(1),U.vertexUv2s=c.has(2),U.vertexUv3s=c.has(3),c.clear(),U}function h(t){let n=[];if(t.shaderID?n.push(t.shaderID):(n.push(t.customVertexShaderID),n.push(t.customFragmentShaderID)),t.defines!==void 0)for(let e in t.defines)n.push(e),n.push(t.defines[e]);return t.isRawShaderMaterial===!1&&(g(n,t),_(n,t),n.push(e.outputColorSpace)),n.push(t.customProgramCacheKey),n.join()}function g(e,t){e.push(t.precision),e.push(t.outputColorSpace),e.push(t.envMapMode),e.push(t.envMapPMREM),e.push(t.envMapMaxLod),e.push(t.envMapSize),e.push(t.mapUv),e.push(t.alphaMapUv),e.push(t.lightMapUv),e.push(t.aoMapUv),e.push(t.bumpMapUv),e.push(t.normalMapUv),e.push(t.displacementMapUv),e.push(t.emissiveMapUv),e.push(t.metalnessMapUv),e.push(t.roughnessMapUv),e.push(t.anisotropyMapUv),e.push(t.clearcoatMapUv),e.push(t.clearcoatNormalMapUv),e.push(t.clearcoatRoughnessMapUv),e.push(t.diffuseRoughnessMapUv),e.push(t.iridescenceMapUv),e.push(t.iridescenceThicknessMapUv),e.push(t.sheenColorMapUv),e.push(t.sheenRoughnessMapUv),e.push(t.specularMapUv),e.push(t.specularColorMapUv),e.push(t.specularIntensityMapUv),e.push(t.transmissionMapUv),e.push(t.thicknessMapUv),e.push(t.combine),e.push(t.fogExp2),e.push(t.sizeAttenuation),e.push(t.morphTargetsCount),e.push(t.numSunLights),e.push(t.numDirLights),e.push(t.numPointLights),e.push(t.numSpotLights),e.push(t.numSpotLightMaps),e.push(t.numHemiLights),e.push(t.numRectAreaLights),e.push(t.numSunLightShadows),e.push(t.numDirLightShadows),e.push(t.numPointLightShadows),e.push(t.numSpotLightShadows),e.push(t.numSpotLightShadowsWithMaps),e.push(t.numLightProbes),e.push(t.numLightProbeGrids),e.push(t.shadowMapType),e.push(t.toneMapping),e.push(t.numClippingPlanes),e.push(t.numClipIntersection),e.push(t.depthPacking)}function _(e,t){o.disableAll(),t.instancing&&o.enable(0),t.instancingColor&&o.enable(1),t.instancingMorph&&o.enable(2),t.matcap&&o.enable(3),t.envMap&&o.enable(4),t.normalMapObjectSpace&&o.enable(5),t.normalMapTangentSpace&&o.enable(6),t.clearcoat&&o.enable(7),t.iridescence&&o.enable(8),t.alphaTest&&o.enable(9),t.vertexColors&&o.enable(10),t.vertexAlphas&&o.enable(11),t.vertexUv1s&&o.enable(12),t.vertexUv2s&&o.enable(13),t.vertexUv3s&&o.enable(14),t.vertexTangents&&o.enable(15),t.anisotropy&&o.enable(16),t.alphaHash&&o.enable(17),t.batching&&o.enable(18),t.dispersion&&o.enable(19),t.retroreflection&&o.enable(24),t.diffuseRoughness&&o.enable(25),t.batchingColor&&o.enable(20),t.gradientMap&&o.enable(21),t.packedNormalMap&&o.enable(22),t.vertexNormals&&o.enable(23),e.push(o.mask),o.disableAll(),t.fog&&o.enable(0),t.useFog&&o.enable(1),t.flatShading&&o.enable(2),t.logarithmicDepthBuffer&&o.enable(3),t.reversedDepthBuffer&&o.enable(4),t.skinning&&o.enable(5),t.morphTargets&&o.enable(6),t.morphNormals&&o.enable(7),t.morphColors&&o.enable(8),t.premultipliedAlpha&&o.enable(9),t.shadowMapEnabled&&o.enable(10),t.doubleSided&&o.enable(11),t.flipSided&&o.enable(12),t.useDepthPacking&&o.enable(13),t.dithering&&o.enable(14),t.transmission&&o.enable(15),t.sheen&&o.enable(16),t.opaque&&o.enable(17),t.pointsUvs&&o.enable(18),t.decodeVideoTexture&&o.enable(19),t.decodeVideoTextureEmissive&&o.enable(20),t.alphaToCoverage&&o.enable(21),t.numLightProbeGrids>0&&o.enable(22),t.hasPositionAttribute&&o.enable(23),e.push(o.mask)}function v(e){let t=f[e.type],n;if(t){let e=_s[t];n=Ga.clone(e.uniforms)}else n=e.uniforms;return n}function y(t,n){let r=u.get(n);return r===void 0?(r=new Rl(e,n,t,i),l.push(r),u.set(n,r)):++r.usedTimes,r}function b(e){if(--e.usedTimes===0){let t=l.indexOf(e);l[t]=l[l.length-1],l.pop(),u.delete(e.cacheKey),e.destroy()}}function x(e){s.remove(e)}function S(){s.dispose()}return{getParameters:m,getProgramCacheKey:h,getUniforms:v,acquireProgram:y,releaseProgram:b,releaseShaderCache:x,programs:l,dispose:S}}function Wl(){let e=new WeakMap;function t(t){return e.has(t)}function n(t){let n=e.get(t);return n===void 0&&(n={},e.set(t,n)),n}function r(t){e.delete(t)}function i(t,n,r){e.get(t)[n]=r}function a(){e=new WeakMap}return{has:t,get:n,remove:r,update:i,dispose:a}}function Gl(e,t){return e.groupOrder===t.groupOrder?e.renderOrder===t.renderOrder?e.material.id===t.material.id?e.materialVariant===t.materialVariant?e.z===t.z?e.id-t.id:e.z-t.z:e.materialVariant-t.materialVariant:e.material.id-t.material.id:e.renderOrder-t.renderOrder:e.groupOrder-t.groupOrder}function Kl(e,t){return e.groupOrder===t.groupOrder?e.renderOrder===t.renderOrder?e.z===t.z?e.id-t.id:t.z-e.z:e.renderOrder-t.renderOrder:e.groupOrder-t.groupOrder}function ql(){let e=[],t=0,n=[],r=[],i=[];function a(){t=0,n.length=0,r.length=0,i.length=0}function o(e){let t=0;return e.isInstancedMesh&&(t+=2),e.isSkinnedMesh&&(t+=1),t}function s(n,r,i,a,s,c){let l=e[t];return l===void 0?(l={id:n.id,object:n,geometry:r,material:i,materialVariant:o(n),groupOrder:a,renderOrder:n.renderOrder,z:s,group:c},e[t]=l):(l.id=n.id,l.object=n,l.geometry=r,l.material=i,l.materialVariant=o(n),l.groupOrder=a,l.renderOrder=n.renderOrder,l.z=s,l.group=c),t++,l}function c(e,t,a,o,c,l,u){u.reversedDepth===!0&&(c=-c);let d=s(e,t,a,o,c,l);a.transmission>0?r.push(d):a.transparent===!0?i.push(d):n.push(d)}function l(e,t,a,o,c,l){let u=s(e,t,a,o,c,l);a.transmission>0?r.unshift(u):a.transparent===!0?i.unshift(u):n.unshift(u)}function u(e,t){n.length>1&&n.sort(e||Gl),r.length>1&&r.sort(t||Kl),i.length>1&&i.sort(t||Kl)}function d(){for(let n=t,r=e.length;n<r;n++){let t=e[n];if(t.id===null)break;t.id=null,t.object=null,t.geometry=null,t.material=null,t.group=null}}return{opaque:n,transmissive:r,transparent:i,init:a,push:c,unshift:l,finish:d,sort:u}}function Jl(){let e=new WeakMap;function t(t,n){let r=e.get(t),i;return r===void 0?(i=new ql,e.set(t,[i])):n>=r.length?(i=new ql,r.push(i)):i=r[n],i}function n(){e=new WeakMap}return{get:t,dispose:n}}function Yl(){let e={};return{get:function(t){if(e[t.id]!==void 0)return e[t.id];let n;switch(t.type){case`SunLight`:case`DirectionalLight`:n={direction:new J,color:new Z};break;case`SpotLight`:n={position:new J,direction:new J,color:new Z,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case`PointLight`:n={position:new J,color:new Z,distance:0,decay:0};break;case`HemisphereLight`:n={direction:new J,skyColor:new Z,groundColor:new Z};break;case`RectAreaLight`:n={color:new Z,position:new J,halfWidth:new J,halfHeight:new J}}return e[t.id]=n,n}}}function Xl(){let e={};return{get:function(t){if(e[t.id]!==void 0)return e[t.id];let n;switch(t.type){case`SunLight`:case`DirectionalLight`:n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new q};break;case`SpotLight`:n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new q};break;case`PointLight`:n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new q,shadowCameraNear:1,shadowCameraFar:1e3}}return e[t.id]=n,n}}}var Zl=0;function Ql(e,t){return(t.castShadow?2:0)-(e.castShadow?2:0)+ +!!t.map-!!e.map}function $l(e){let t=new Yl,n=Xl(),r={version:0,hash:{sunLength:-1,directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numSunShadows:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],sun:[],sunShadow:[],sunShadowMap:[],sunShadowMatrix:[],sunShadowCascade:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let e=0;e<9;e++)r.probe.push(new J);let i=new J,a=new cr,o=new cr;function s(i){let a=0,o=0,s=0;for(let e=0;e<9;e++)r.probe[e].set(0,0,0);let c=0,l=0,u=0,d=0,f=0,p=0,m=0,h=0,g=0,_=0,v=0,y=0,b=0,x=0;i.sort(Ql);for(let e=0,S=i.length;e<S;e++){let S=i[e],C=S.color,w=S.intensity,T=S.distance,E=null;if(S.shadow&&S.shadow.map&&(E=S.shadow.map.texture.format===1030?S.shadow.map.texture:S.shadow.map.depthTexture||S.shadow.map.texture),S.isAmbientLight)a+=C.r*w,o+=C.g*w,s+=C.b*w;else if(S.isLightProbe){for(let e=0;e<9;e++)r.probe[e].addScaledVector(S.sh.coefficients[e],w);x++}else if(S.isSunLight){let e=t.get(S);if(e.color.copy(S.color).multiplyScalar(S.intensity),S.castShadow){let e=S.shadow,t=n.get(S);t.shadowIntensity=e.intensity,t.shadowBias=e.bias,t.shadowNormalBias=e.normalBias,t.shadowRadius=e.radius,t.shadowMapSize.copy(e.mapSize).multiply(e.getFrameExtents()),r.sunShadow[l]=t,r.sunShadowMap[l]=E;let i=e.getViewportCount();for(let t=0;t<i;t++)r.sunShadowMatrix[u+t]=e.getMatrix(t),r.sunShadowCascade[u+t]=e._cascadeData[t];u+=i,l++}r.sun[c]=e,c++}else if(S.isDirectionalLight){let e=t.get(S);if(e.color.copy(S.color).multiplyScalar(S.intensity),S.castShadow){let e=S.shadow,t=n.get(S);t.shadowIntensity=e.intensity,t.shadowBias=e.bias,t.shadowNormalBias=e.normalBias,t.shadowRadius=e.radius,t.shadowMapSize=e.mapSize,r.directionalShadow[d]=t,r.directionalShadowMap[d]=E,r.directionalShadowMatrix[d]=S.shadow.matrix,g++}r.directional[d]=e,d++}else if(S.isSpotLight){let e=t.get(S);e.position.setFromMatrixPosition(S.matrixWorld),e.color.copy(C).multiplyScalar(w),e.distance=T,e.coneCos=Math.cos(S.angle),e.penumbraCos=Math.cos(S.angle*(1-S.penumbra)),e.decay=S.decay,r.spot[p]=e;let i=S.shadow;if(S.map&&(r.spotLightMap[y]=S.map,y++,i.updateMatrices(S),S.castShadow&&b++),r.spotLightMatrix[p]=i.matrix,S.castShadow){let e=n.get(S);e.shadowIntensity=i.intensity,e.shadowBias=i.bias,e.shadowNormalBias=i.normalBias,e.shadowRadius=i.radius,e.shadowMapSize=i.mapSize,r.spotShadow[p]=e,r.spotShadowMap[p]=E,v++}p++}else if(S.isRectAreaLight){let e=t.get(S);e.color.copy(C).multiplyScalar(w),e.halfWidth.set(S.width*.5,0,0),e.halfHeight.set(0,S.height*.5,0),r.rectArea[m]=e,m++}else if(S.isPointLight){let e=t.get(S);if(e.color.copy(S.color).multiplyScalar(S.intensity),e.distance=S.distance,e.decay=S.decay,S.castShadow){let e=S.shadow,t=n.get(S);t.shadowIntensity=e.intensity,t.shadowBias=e.bias,t.shadowNormalBias=e.normalBias,t.shadowRadius=e.radius,t.shadowMapSize=e.mapSize,t.shadowCameraNear=e.camera.near,t.shadowCameraFar=e.camera.far,r.pointShadow[f]=t,r.pointShadowMap[f]=E,r.pointShadowMatrix[f]=S.shadow.matrix,_++}r.point[f]=e,f++}else if(S.isHemisphereLight){let e=t.get(S);e.skyColor.copy(S.color).multiplyScalar(w),e.groundColor.copy(S.groundColor).multiplyScalar(w),r.hemi[h]=e,h++}}m>0&&(e.has(`OES_texture_float_linear`)===!0?(r.rectAreaLTC1=$.LTC_FLOAT_1,r.rectAreaLTC2=$.LTC_FLOAT_2):(r.rectAreaLTC1=$.LTC_HALF_1,r.rectAreaLTC2=$.LTC_HALF_2)),r.ambient[0]=a,r.ambient[1]=o,r.ambient[2]=s;let S=r.hash;(S.sunLength!==c||S.directionalLength!==d||S.pointLength!==f||S.spotLength!==p||S.rectAreaLength!==m||S.hemiLength!==h||S.numSunShadows!==l||S.numDirectionalShadows!==g||S.numPointShadows!==_||S.numSpotShadows!==v||S.numSpotMaps!==y||S.numLightProbes!==x)&&(r.sun.length=c,r.directional.length=d,r.spot.length=p,r.rectArea.length=m,r.point.length=f,r.hemi.length=h,r.sunShadow.length=l,r.sunShadowMap.length=l,r.sunShadowMatrix.length=u,r.sunShadowCascade.length=u,r.directionalShadow.length=g,r.directionalShadowMap.length=g,r.directionalShadowMatrix.length=g,r.pointShadow.length=_,r.pointShadowMap.length=_,r.pointShadowMatrix.length=_,r.spotShadow.length=v,r.spotShadowMap.length=v,r.spotLightMatrix.length=v+y-b,r.spotLightMap.length=y,r.numSpotLightShadowsWithMaps=b,r.numLightProbes=x,S.sunLength=c,S.directionalLength=d,S.pointLength=f,S.spotLength=p,S.rectAreaLength=m,S.hemiLength=h,S.numSunShadows=l,S.numDirectionalShadows=g,S.numPointShadows=_,S.numSpotShadows=v,S.numSpotMaps=y,S.numLightProbes=x,r.version=Zl++)}function c(e,t){let n=0,s=0,c=0,l=0,u=0,d=0,f=t.matrixWorldInverse;for(let t=0,p=e.length;t<p;t++){let p=e[t];if(p.isSunLight){let e=r.sun[n];e.direction.setFromMatrixPosition(p.matrixWorld),e.direction.transformDirection(f),n++}else if(p.isDirectionalLight){let e=r.directional[s];e.direction.setFromMatrixPosition(p.matrixWorld),i.setFromMatrixPosition(p.target.matrixWorld),e.direction.sub(i),e.direction.transformDirection(f),s++}else if(p.isSpotLight){let e=r.spot[l];e.position.setFromMatrixPosition(p.matrixWorld),e.position.applyMatrix4(f),e.direction.setFromMatrixPosition(p.matrixWorld),i.setFromMatrixPosition(p.target.matrixWorld),e.direction.sub(i),e.direction.transformDirection(f),l++}else if(p.isRectAreaLight){let e=r.rectArea[u];e.position.setFromMatrixPosition(p.matrixWorld),e.position.applyMatrix4(f),o.identity(),a.copy(p.matrixWorld),a.premultiply(f),o.extractRotation(a),e.halfWidth.set(p.width*.5,0,0),e.halfHeight.set(0,p.height*.5,0),e.halfWidth.applyMatrix4(o),e.halfHeight.applyMatrix4(o),u++}else if(p.isPointLight){let e=r.point[c];e.position.setFromMatrixPosition(p.matrixWorld),e.position.applyMatrix4(f),c++}else if(p.isHemisphereLight){let e=r.hemi[d];e.direction.setFromMatrixPosition(p.matrixWorld),e.direction.transformDirection(f),d++}}}return{setup:s,setupView:c,state:r}}function eu(e){let t=new $l(e),n=[],r=[],i=[];function a(e){u.camera=e,n.length=0,r.length=0,i.length=0}function o(e){e.isLightProbeGrid?i.push(e):n.push(e)}function s(e){r.push(e)}function c(){t.setup(n),i.sort((e,t)=>e.priority-t.priority||e.id-t.id)}function l(e){t.setupView(n,e)}let u={lightsArray:n,shadowsArray:r,lightProbeGridArray:i,camera:null,lights:t,transmissionRenderTarget:{},textureUnits:0};return{init:a,state:u,setupLights:c,setupLightsView:l,pushLight:o,pushShadow:s}}function tu(e){let t=new WeakMap;function n(n,r=0){let i=t.get(n),a;return i===void 0?(a=new eu(e),t.set(n,[a])):r>=i.length?(a=new eu(e),i.push(a)):a=i[r],a}function r(){t=new WeakMap}return{get:n,dispose:r}}var nu=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,ru=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ).rg;
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ).r;
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( max( 0.0, squared_mean - mean * mean ) );
	gl_FragColor = vec4( mean, std_dev, 0.0, 1.0 );
}`,iu=[new J(1,0,0),new J(-1,0,0),new J(0,1,0),new J(0,-1,0),new J(0,0,1),new J(0,0,-1)],au=[new J(0,-1,0),new J(0,-1,0),new J(0,0,1),new J(0,0,-1),new J(0,-1,0),new J(0,-1,0)],ou=new cr,su=new J,cu=new J;function lu(e,t,n){let r=new ba,i=new q,a=new q,o=new rr,s=new Xa,c=new Za,l={},u=n.maxTextureSize,d={0:1,1:0,2:2},f=new Ja({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new q},radius:{value:4}},vertexShader:nu,fragmentShader:ru}),p=f.clone();p.defines.HORIZONTAL_PASS=1;let m=new Ri;m.setAttribute(`position`,new Ci(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let h=new fa(m,f),g=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=1;let _=this.type;this.render=function(t,n,s){if(g.enabled===!1||g.autoUpdate===!1&&g.needsUpdate===!1||t.length===0)return;this.type===2&&(W(`WebGLShadowMap: PCFSoftShadowMap has been removed. Using PCFShadowMap instead.`),this.type=1);let c=e.getRenderTarget(),l=e.getActiveCubeFace(),d=e.getActiveMipmapLevel(),f=e.state;f.setBlending(0),f.buffers.depth.getReversed()===!0?f.buffers.color.setClear(0,0,0,0):f.buffers.color.setClear(1,1,1,1),f.buffers.depth.setTest(!0),f.setScissorTest(!1);let p=_!==this.type;p&&n.traverse(function(e){e.material&&(Array.isArray(e.material)?e.material.forEach(e=>e.needsUpdate=!0):e.material.needsUpdate=!0)});for(let c=0,l=t.length;c<l;c++){let l=t[c],d=l.shadow;if(d===void 0){W(`WebGLShadowMap:`,l,`has no shadow.`);continue}if(d.autoUpdate===!1&&d.needsUpdate===!1)continue;i.copy(d.mapSize);let m=d.getFrameExtents();i.multiply(m),a.copy(d.mapSize),(i.x>u||i.y>u)&&(i.x>u&&(a.x=Math.floor(u/m.x),i.x=a.x*m.x,d.mapSize.x=a.x),i.y>u&&(a.y=Math.floor(u/m.y),i.y=a.y*m.y,d.mapSize.y=a.y));let h=e.state.buffers.depth.getReversed();if(d.camera._reversedDepth=h,d.map===null||p===!0){if(d.map!==null&&(d.map.depthTexture!==null&&(d.map.depthTexture.dispose(),d.map.depthTexture=null),d.map.dispose()),this.type===3){if(l.isPointLight){W(`WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.`);continue}d.map=new ar(i.x,i.y,{format:et,type:Ve,minFilter:U,magFilter:U,generateMipmaps:!1}),d.map.texture.name=l.name+`.shadowMap`,d.map.depthTexture=new Ma(i.x,i.y,Be),d.map.depthTexture.name=l.name+`.shadowMapDepth`,d.map.depthTexture.format=Xe,d.map.depthTexture.compareFunction=null,d.map.depthTexture.minFilter=ke,d.map.depthTexture.magFilter=ke}else l.isPointLight?(d.map=new Es(i.x),d.map.depthTexture=new Na(i.x,ze)):(d.map=new ar(i.x,i.y),d.map.depthTexture=new Ma(i.x,i.y,ze)),d.map.depthTexture.name=l.name+`.shadowMap`,d.map.depthTexture.format=Xe,this.type===1?(d.map.depthTexture.compareFunction=h?518:515,d.map.depthTexture.minFilter=U,d.map.depthTexture.magFilter=U):(d.map.depthTexture.compareFunction=null,d.map.depthTexture.minFilter=ke,d.map.depthTexture.magFilter=ke);d.camera.updateProjectionMatrix()}d.map.isWebGLCubeRenderTarget!==!0&&(d.map.width!==i.x||d.map.height!==i.y)&&d.map.setSize(i.x,i.y);let g=d.map.isWebGLCubeRenderTarget?6:d.getViewportCount();l.isPointLight!==!0&&d.updateMatrices(l,s);let _=d.camera.layers.mask&4294967294?d.camera.layers:s.layers;for(let t=0;t<g;t++){let i=d.getCamera(t);if(l.isPointLight){let e=d.camera,n=d.matrix,r=l.distance||e.far;r!==e.far&&(e.far=r,e.updateProjectionMatrix()),su.setFromMatrixPosition(l.matrixWorld),e.position.copy(su),cu.copy(e.position),cu.add(iu[t]),e.up.copy(au[t]),e.lookAt(cu),e.updateMatrixWorld(),n.makeTranslation(-su.x,-su.y,-su.z),ou.multiplyMatrices(e.projectionMatrix,e.matrixWorldInverse),d._frustum.setFromProjectionMatrix(ou,e.coordinateSystem,e.reversedDepth)}if(d.map.isWebGLCubeRenderTarget)e.setRenderTarget(d.map,t),e.clear();else{t===0&&(e.setRenderTarget(d.map),e.clear());let n=d.getViewport(t);o.set(a.x*n.x,a.y*n.y,a.x*n.z,a.y*n.w),f.viewport(o)}r=d.getFrustum(t),b(n,s,i,l,_,this.type)}d.isPointLightShadow!==!0&&this.type===3&&v(d,s),d.needsUpdate=!1}_=this.type,g.needsUpdate=!1,e.setRenderTarget(c,l,d)};function v(n,r){let a=t.update(h);f.defines.VSM_SAMPLES!==n.blurSamples&&(f.defines.VSM_SAMPLES=n.blurSamples,p.defines.VSM_SAMPLES=n.blurSamples,f.needsUpdate=!0,p.needsUpdate=!0),n.mapPass===null?n.mapPass=new ar(i.x,i.y,{format:et,type:Ve}):(n.mapPass.width!==n.map.width||n.mapPass.height!==n.map.height)&&n.mapPass.setSize(n.map.width,n.map.height),f.uniforms.shadow_pass.value=n.map.depthTexture,f.uniforms.resolution.value.set(n.map.width,n.map.height),f.uniforms.radius.value=n.radius,e.setRenderTarget(n.mapPass),e.clear(),e.renderBufferDirect(r,null,a,f,h,null),p.uniforms.shadow_pass.value=n.mapPass.texture,p.uniforms.resolution.value.set(n.map.width,n.map.height),p.uniforms.radius.value=n.radius,e.setRenderTarget(n.map),e.clear(),e.renderBufferDirect(r,null,a,p,h,null)}function y(t,n,r,i){let a=null,o=r.isPointLight===!0?t.customDistanceMaterial:t.customDepthMaterial;if(o!==void 0)a=o;else if(a=r.isPointLight===!0?c:s,e.localClippingEnabled&&n.clipShadows===!0&&Array.isArray(n.clippingPlanes)&&n.clippingPlanes.length!==0||n.displacementMap&&n.displacementScale!==0||n.alphaMap&&n.alphaTest>0||n.map&&n.alphaTest>0||n.alphaToCoverage===!0){let e=a.uuid,t=n.uuid,r=l[e];r===void 0&&(r={},l[e]=r);let i=r[t];i===void 0&&(i=a.clone(),r[t]=i,n.addEventListener(`dispose`,x)),a=i}if(a.visible=n.visible,a.wireframe=n.wireframe,i===3?a.side=n.shadowSide===null?n.side:n.shadowSide:a.side=n.shadowSide===null?d[n.side]:n.shadowSide,a.alphaMap=n.alphaMap,a.alphaTest=n.alphaToCoverage===!0?.5:n.alphaTest,a.map=n.map,a.clipShadows=n.clipShadows,a.clippingPlanes=n.clippingPlanes,a.clipIntersection=n.clipIntersection,a.displacementMap=n.displacementMap,a.displacementScale=n.displacementScale,a.displacementBias=n.displacementBias,a.wireframeLinewidth=n.wireframeLinewidth,a.linewidth=n.linewidth,r.isPointLight===!0&&a.isMeshDistanceMaterial===!0){let t=e.properties.get(a);t.light=r}return a}function b(n,i,a,o,s,c){if(n.visible===!1)return;if(n.layers.test(s)&&(n.isMesh||n.isLine||n.isPoints)&&(n.castShadow||n.receiveShadow&&c===3)&&(!n.frustumCulled||n.intersectsFrustum(r))){n.modelViewMatrix.multiplyMatrices(a.matrixWorldInverse,n.matrixWorld);let r=t.update(n),s=n.material;if(Array.isArray(s)){let t=r.groups;for(let l=0,u=t.length;l<u;l++){let u=t[l],d=s[u.materialIndex];if(d&&d.visible){let t=y(n,d,o,c);n.onBeforeShadow(e,n,i,a,r,t,u),e.renderBufferDirect(a,null,r,t,n,u),n.onAfterShadow(e,n,i,a,r,t,u)}}}else if(s.visible){let t=y(n,s,o,c);n.onBeforeShadow(e,n,i,a,r,t,null),e.renderBufferDirect(a,null,r,t,n,null),n.onAfterShadow(e,n,i,a,r,t,null)}}let l=n.children;for(let e=0,t=l.length;e<t;e++)b(l[e],i,a,o,s,c)}function x(e){e.target.removeEventListener(`dispose`,x);for(let t in l){let n=l[t],r=e.target.uuid;r in n&&(n[r].dispose(),delete n[r])}}}function uu(e,t){function n(){let t=!1,n=new rr,r=null,i=new rr(0,0,0,0);return{setMask:function(n){r!==n&&!t&&(e.colorMask(n,n,n,n),r=n)},setLocked:function(e){t=e},setClear:function(t,r,a,o,s){s===!0&&(t*=o,r*=o,a*=o),n.set(t,r,a,o),i.equals(n)===!1&&(e.clearColor(t,r,a,o),i.copy(n))},reset:function(){t=!1,r=null,i.set(-1,0,0,0)}}}function r(){let n=!1,r=!1,i=null,a=null,o=null;return{setReversed:function(e){if(r!==e){let n=t.get(`EXT_clip_control`);e?n.clipControlEXT(n.LOWER_LEFT_EXT,n.ZERO_TO_ONE_EXT):n.clipControlEXT(n.LOWER_LEFT_EXT,n.NEGATIVE_ONE_TO_ONE_EXT),r=e;let i=o;o=null,this.setClear(i)}},getReversed:function(){return r},setTest:function(t){t?se(e.DEPTH_TEST):ce(e.DEPTH_TEST)},setMask:function(t){i!==t&&!n&&(e.depthMask(t),i=t)},setFunc:function(t){if(r&&(t=dn[t]),a!==t){switch(t){case 0:e.depthFunc(e.NEVER);break;case 1:e.depthFunc(e.ALWAYS);break;case 2:e.depthFunc(e.LESS);break;case 3:e.depthFunc(e.LEQUAL);break;case 4:e.depthFunc(e.EQUAL);break;case 5:e.depthFunc(e.GEQUAL);break;case 6:e.depthFunc(e.GREATER);break;case 7:e.depthFunc(e.NOTEQUAL);break;default:e.depthFunc(e.LEQUAL)}a=t}},setLocked:function(e){n=e},setClear:function(t){o!==t&&(o=t,r&&(t=1-t),e.clearDepth(t))},reset:function(){n=!1,i=null,a=null,o=null,r=!1}}}function i(){let t=!1,n=null,r=null,i=null,a=null,o=null,s=null,c=null,l=null;return{setTest:function(n){t||(n?se(e.STENCIL_TEST):ce(e.STENCIL_TEST))},setMask:function(r){n!==r&&!t&&(e.stencilMask(r),n=r)},setFunc:function(t,n,o){(r!==t||i!==n||a!==o)&&(e.stencilFunc(t,n,o),r=t,i=n,a=o)},setOp:function(t,n,r){(o!==t||s!==n||c!==r)&&(e.stencilOp(t,n,r),o=t,s=n,c=r)},setLocked:function(e){t=e},setClear:function(t){l!==t&&(e.clearStencil(t),l=t)},reset:function(){t=!1,n=null,r=null,i=null,a=null,o=null,s=null,c=null,l=null}}}let a=new n,o=new r,s=new i,c={},l=new WeakMap,u={},d={},f={},p=new WeakMap,m=[],h=null,g=!1,_=null,v=null,y=null,b=null,x=null,S=null,C=null,w=new Z(0,0,0),T=0,E=!1,D=null,O=null,k=null,A=null,j=null,M=e.getParameter(e.MAX_COMBINED_TEXTURE_IMAGE_UNITS),N=!1,ee=0,P=e.getParameter(e.VERSION);P.indexOf(`WebGL`)===-1?P.indexOf(`OpenGL ES`)!==-1&&(ee=parseFloat(/^OpenGL ES (\d)/.exec(P)[1]),N=ee>=2):(ee=parseFloat(/^WebGL (\d)/.exec(P)[1]),N=ee>=1);let F=null,te={},ne=e.getParameter(e.SCISSOR_BOX),re=e.getParameter(e.VIEWPORT),ie=new rr().fromArray(ne),ae=new rr().fromArray(re);function oe(t,n,r,i){let a=new Uint8Array(4),o=e.createTexture();e.bindTexture(t,o),e.texParameteri(t,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(t,e.TEXTURE_MAG_FILTER,e.NEAREST);for(let o=0;o<r;o++)t===e.TEXTURE_3D||t===e.TEXTURE_2D_ARRAY?e.texImage3D(n,0,e.RGBA,1,1,i,0,e.RGBA,e.UNSIGNED_BYTE,a):e.texImage2D(n+o,0,e.RGBA,1,1,0,e.RGBA,e.UNSIGNED_BYTE,a);return o}let I={};I[e.TEXTURE_2D]=oe(e.TEXTURE_2D,e.TEXTURE_2D,1),I[e.TEXTURE_CUBE_MAP]=oe(e.TEXTURE_CUBE_MAP,e.TEXTURE_CUBE_MAP_POSITIVE_X,6),I[e.TEXTURE_2D_ARRAY]=oe(e.TEXTURE_2D_ARRAY,e.TEXTURE_2D_ARRAY,1,1),I[e.TEXTURE_3D]=oe(e.TEXTURE_3D,e.TEXTURE_3D,1,1),a.setClear(0,0,0,1),o.setClear(1),s.setClear(0),se(e.DEPTH_TEST),o.setFunc(3),me(!1),he(1),se(e.CULL_FACE),fe(0);function se(t){u[t]!==!0&&(e.enable(t),u[t]=!0)}function ce(t){u[t]!==!1&&(e.disable(t),u[t]=!1)}function L(t,n){return f[t]!==n&&(e.bindFramebuffer(t,n),f[t]=n,t===e.DRAW_FRAMEBUFFER&&(f[e.FRAMEBUFFER]=n),t===e.FRAMEBUFFER&&(f[e.DRAW_FRAMEBUFFER]=n),!0)}function R(t,n){let r=m,i=!1;if(t){r=p.get(n),r===void 0&&(r=[],p.set(n,r));let a=t.textures;if(r.length!==a.length||r[0]!==e.COLOR_ATTACHMENT0){for(let t=0,n=a.length;t<n;t++)r[t]=e.COLOR_ATTACHMENT0+t;r.length=a.length,i=!0}}else r[0]!==e.BACK&&(r[0]=e.BACK,i=!0);i&&e.drawBuffers(r)}function le(t){return h!==t&&(e.useProgram(t),h=t,!0)}let ue={100:e.FUNC_ADD,101:e.FUNC_SUBTRACT,102:e.FUNC_REVERSE_SUBTRACT};ue[103]=e.MIN,ue[104]=e.MAX;let de={200:e.ZERO,201:e.ONE,202:e.SRC_COLOR,204:e.SRC_ALPHA,210:e.SRC_ALPHA_SATURATE,208:e.DST_COLOR,206:e.DST_ALPHA,203:e.ONE_MINUS_SRC_COLOR,205:e.ONE_MINUS_SRC_ALPHA,209:e.ONE_MINUS_DST_COLOR,207:e.ONE_MINUS_DST_ALPHA,211:e.CONSTANT_COLOR,212:e.ONE_MINUS_CONSTANT_COLOR,213:e.CONSTANT_ALPHA,214:e.ONE_MINUS_CONSTANT_ALPHA};function fe(t,n,r,i,a,o,s,c,l,u){if(t===0)g===!0&&(ce(e.BLEND),g=!1);else if(g===!1&&(se(e.BLEND),g=!0),t!==5){if(t!==_||u!==E){if((v!==100||x!==100)&&(e.blendEquation(e.FUNC_ADD),v=100,x=100),u)switch(t){case 1:e.blendFuncSeparate(e.ONE,e.ONE_MINUS_SRC_ALPHA,e.ONE,e.ONE_MINUS_SRC_ALPHA);break;case 2:e.blendFunc(e.ONE,e.ONE);break;case 3:e.blendFuncSeparate(e.ZERO,e.ONE_MINUS_SRC_COLOR,e.ZERO,e.ONE);break;case 4:e.blendFuncSeparate(e.DST_COLOR,e.ONE_MINUS_SRC_ALPHA,e.ZERO,e.ONE);break;default:G(`WebGLState: Invalid blending: `,t)}else switch(t){case 1:e.blendFuncSeparate(e.SRC_ALPHA,e.ONE_MINUS_SRC_ALPHA,e.ONE,e.ONE_MINUS_SRC_ALPHA);break;case 2:e.blendFuncSeparate(e.SRC_ALPHA,e.ONE,e.ONE,e.ONE);break;case 3:G(`WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true`);break;case 4:G(`WebGLState: MultiplyBlending requires material.premultipliedAlpha = true`);break;default:G(`WebGLState: Invalid blending: `,t)}y=null,b=null,S=null,C=null,w.set(0,0,0),T=0,_=t,E=u}}else a||=n,o||=r,s||=i,(n!==v||a!==x)&&(e.blendEquationSeparate(ue[n],ue[a]),v=n,x=a),(r!==y||i!==b||o!==S||s!==C)&&(e.blendFuncSeparate(de[r],de[i],de[o],de[s]),y=r,b=i,S=o,C=s),(c.equals(w)===!1||l!==T)&&(e.blendColor(c.r,c.g,c.b,l),w.copy(c),T=l),_=t,E=!1}function pe(t,n){t.side===2?ce(e.CULL_FACE):se(e.CULL_FACE);let r=t.side===1;n&&(r=!r),me(r),t.blending===1&&t.transparent===!1?fe(0):fe(t.blending,t.blendEquation,t.blendSrc,t.blendDst,t.blendEquationAlpha,t.blendSrcAlpha,t.blendDstAlpha,t.blendColor,t.blendAlpha,t.premultipliedAlpha),o.setFunc(t.depthFunc),o.setTest(t.depthTest),o.setMask(t.depthWrite),a.setMask(t.colorWrite);let i=t.stencilWrite;s.setTest(i),i&&(s.setMask(t.stencilWriteMask),s.setFunc(t.stencilFunc,t.stencilRef,t.stencilFuncMask),s.setOp(t.stencilFail,t.stencilZFail,t.stencilZPass)),_e(t.polygonOffset,t.polygonOffsetFactor,t.polygonOffsetUnits),t.alphaToCoverage===!0?se(e.SAMPLE_ALPHA_TO_COVERAGE):ce(e.SAMPLE_ALPHA_TO_COVERAGE)}function me(t){D!==t&&(t?e.frontFace(e.CW):e.frontFace(e.CCW),D=t)}function he(t){t===0?ce(e.CULL_FACE):(se(e.CULL_FACE),t!==O&&(t===1?e.cullFace(e.BACK):t===2?e.cullFace(e.FRONT):e.cullFace(e.FRONT_AND_BACK))),O=t}function ge(t){t!==k&&(N&&e.lineWidth(t),k=t)}function _e(t,n,r){t?(se(e.POLYGON_OFFSET_FILL),(A!==n||j!==r)&&(A=n,j=r,o.getReversed()&&(n=-n,r=-r),e.polygonOffset(n,r))):ce(e.POLYGON_OFFSET_FILL)}function ve(t){t?se(e.SCISSOR_TEST):ce(e.SCISSOR_TEST)}function ye(t){t===void 0&&(t=e.TEXTURE0+M-1),F!==t&&(e.activeTexture(t),F=t)}function z(t,n,r){r===void 0&&(r=F===null?e.TEXTURE0+M-1:F);let i=te[r];i===void 0&&(i={type:void 0,texture:void 0},te[r]=i),(i.type!==t||i.texture!==n)&&(F!==r&&(e.activeTexture(r),F=r),e.bindTexture(t,n||I[t]),i.type=t,i.texture=n)}function be(){let t=te[F];t!==void 0&&t.type!==void 0&&(e.bindTexture(t.type,null),t.type=void 0,t.texture=void 0)}function xe(){try{e.compressedTexImage2D(...arguments)}catch(e){G(`WebGLState:`,e)}}function Se(){try{e.compressedTexImage3D(...arguments)}catch(e){G(`WebGLState:`,e)}}function B(){try{e.texSubImage2D(...arguments)}catch(e){G(`WebGLState:`,e)}}function Ce(){try{e.texSubImage3D(...arguments)}catch(e){G(`WebGLState:`,e)}}function V(){try{e.compressedTexSubImage2D(...arguments)}catch(e){G(`WebGLState:`,e)}}function H(){try{e.compressedTexSubImage3D(...arguments)}catch(e){G(`WebGLState:`,e)}}function we(){try{e.texStorage2D(...arguments)}catch(e){G(`WebGLState:`,e)}}function Te(){try{e.texStorage3D(...arguments)}catch(e){G(`WebGLState:`,e)}}function Ee(){try{e.texImage2D(...arguments)}catch(e){G(`WebGLState:`,e)}}function De(){try{e.texImage3D(...arguments)}catch(e){G(`WebGLState:`,e)}}function Oe(t){return d[t]===void 0?e.getParameter(t):d[t]}function ke(t,n){d[t]!==n&&(e.pixelStorei(t,n),d[t]=n)}function Ae(t){ie.equals(t)===!1&&(e.scissor(t.x,t.y,t.z,t.w),ie.copy(t))}function je(t){ae.equals(t)===!1&&(e.viewport(t.x,t.y,t.z,t.w),ae.copy(t))}function U(t,n){let r=l.get(n);r===void 0&&(r=new WeakMap,l.set(n,r));let i=r.get(t);i===void 0&&(i=e.getUniformBlockIndex(n,t.name),e.uniformBlockBinding(n,i,i),r.set(t,i))}function Me(t,n,r){let i=l.get(n).get(t);c[i]!==r&&(e.bindBufferBase(e.UNIFORM_BUFFER,i,r),c[i]=r)}function Ne(){e.disable(e.BLEND),e.disable(e.CULL_FACE),e.disable(e.DEPTH_TEST),e.disable(e.POLYGON_OFFSET_FILL),e.disable(e.SCISSOR_TEST),e.disable(e.STENCIL_TEST),e.disable(e.SAMPLE_ALPHA_TO_COVERAGE),e.blendEquation(e.FUNC_ADD),e.blendFunc(e.ONE,e.ZERO),e.blendFuncSeparate(e.ONE,e.ZERO,e.ONE,e.ZERO),e.blendColor(0,0,0,0),e.colorMask(!0,!0,!0,!0),e.clearColor(0,0,0,0),e.depthMask(!0),e.depthFunc(e.LESS),o.setReversed(!1),e.clearDepth(1),e.stencilMask(4294967295),e.stencilFunc(e.ALWAYS,0,4294967295),e.stencilOp(e.KEEP,e.KEEP,e.KEEP),e.clearStencil(0),e.cullFace(e.BACK),e.frontFace(e.CCW),e.polygonOffset(0,0),e.activeTexture(e.TEXTURE0),e.bindFramebuffer(e.FRAMEBUFFER,null),e.bindFramebuffer(e.DRAW_FRAMEBUFFER,null),e.bindFramebuffer(e.READ_FRAMEBUFFER,null),e.useProgram(null),e.lineWidth(1),e.scissor(0,0,e.canvas.width,e.canvas.height),e.viewport(0,0,e.canvas.width,e.canvas.height),e.pixelStorei(e.PACK_ALIGNMENT,4),e.pixelStorei(e.UNPACK_ALIGNMENT,4),e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,!1),e.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),e.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL,e.BROWSER_DEFAULT_WEBGL),e.pixelStorei(e.PACK_ROW_LENGTH,0),e.pixelStorei(e.PACK_SKIP_PIXELS,0),e.pixelStorei(e.PACK_SKIP_ROWS,0),e.pixelStorei(e.UNPACK_ROW_LENGTH,0),e.pixelStorei(e.UNPACK_IMAGE_HEIGHT,0),e.pixelStorei(e.UNPACK_SKIP_PIXELS,0),e.pixelStorei(e.UNPACK_SKIP_ROWS,0),e.pixelStorei(e.UNPACK_SKIP_IMAGES,0),u={},d={},F=null,te={},f={},c={},p=new WeakMap,m=[],h=null,g=!1,_=null,v=null,y=null,b=null,x=null,S=null,C=null,w=new Z(0,0,0),T=0,E=!1,D=null,O=null,k=null,A=null,j=null,ie.set(0,0,e.canvas.width,e.canvas.height),ae.set(0,0,e.canvas.width,e.canvas.height),a.reset(),o.reset(),s.reset()}return{buffers:{color:a,depth:o,stencil:s},enable:se,disable:ce,bindFramebuffer:L,drawBuffers:R,useProgram:le,setBlending:fe,setMaterial:pe,setFlipSided:me,setCullFace:he,setLineWidth:ge,setPolygonOffset:_e,setScissorTest:ve,activeTexture:ye,bindTexture:z,unbindTexture:be,compressedTexImage2D:xe,compressedTexImage3D:Se,texImage2D:Ee,texImage3D:De,pixelStorei:ke,getParameter:Oe,updateUBOMapping:U,uniformBlockBinding:Me,texStorage2D:we,texStorage3D:Te,texSubImage2D:B,texSubImage3D:Ce,compressedTexSubImage2D:V,compressedTexSubImage3D:H,scissor:Ae,viewport:je,reset:Ne}}function du(e,t,n,r,i,a,o){let s=t.has(`WEBGL_multisampled_render_to_texture`)?t.get(`WEBGL_multisampled_render_to_texture`):null,c=typeof navigator>`u`?!1:/OculusBrowser/g.test(navigator.userAgent),l=new q,u=new WeakMap,d=new Set,f,p=new WeakMap,m=new Set,h=new FinalizationRegistry(e=>m.delete(e)),g=!1;try{g=typeof OffscreenCanvas<`u`&&new OffscreenCanvas(1,1).getContext(`2d`)!==null}catch{}function _(e,t){return g?new OffscreenCanvas(e,t):rn(`canvas`)}function v(e,t,n){let r=1,i=we(e);if((i.width>n||i.height>n)&&(r=n/Math.max(i.width,i.height)),r<1){if(typeof HTMLImageElement<`u`&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<`u`&&e instanceof HTMLCanvasElement||typeof ImageBitmap<`u`&&e instanceof ImageBitmap||typeof VideoFrame<`u`&&e instanceof VideoFrame){let n=Math.floor(r*i.width),a=Math.floor(r*i.height);f===void 0&&(f=_(n,a));let o=t?_(n,a):f;return o.width=n,o.height=a,o.getContext(`2d`).drawImage(e,0,0,n,a),W(`WebGLRenderer: Texture has been resized from (`+i.width+`x`+i.height+`) to (`+n+`x`+a+`).`),o}return`data`in e&&W(`WebGLRenderer: Image in DataTexture is too big (`+i.width+`x`+i.height+`).`),e}return e}function y(e){return e.generateMipmaps}function b(t){e.generateMipmap(t)}function x(t){return t.isWebGLCubeRenderTarget?e.TEXTURE_CUBE_MAP:t.isWebGL3DRenderTarget?e.TEXTURE_3D:t.isWebGLArrayRenderTarget||t.isCompressedArrayTexture?e.TEXTURE_2D_ARRAY:e.TEXTURE_2D}function S(n,r,i,a,o,s=!1){if(n!==null){if(e[n]!==void 0)return e[n];W(`WebGLRenderer: Attempt to use non-existing WebGL internal format '`+n+`'`)}let c;a&&(c=t.get(`EXT_texture_norm16`),c||W(`WebGLRenderer: Unable to use normalized textures without EXT_texture_norm16 extension`));let l=r;if(r===e.RED&&(i===e.FLOAT&&(l=e.R32F),i===e.HALF_FLOAT&&(l=e.R16F),i===e.UNSIGNED_BYTE&&(l=e.R8),i===e.UNSIGNED_SHORT&&c&&(l=c.R16_EXT),i===e.SHORT&&c&&(l=c.R16_SNORM_EXT)),r===e.RED_INTEGER&&(i===e.UNSIGNED_BYTE&&(l=e.R8UI),i===e.UNSIGNED_SHORT&&(l=e.R16UI),i===e.UNSIGNED_INT&&(l=e.R32UI),i===e.BYTE&&(l=e.R8I),i===e.SHORT&&(l=e.R16I),i===e.INT&&(l=e.R32I)),r===e.RG&&(i===e.FLOAT&&(l=e.RG32F),i===e.HALF_FLOAT&&(l=e.RG16F),i===e.UNSIGNED_BYTE&&(l=e.RG8),i===e.UNSIGNED_SHORT&&c&&(l=c.RG16_EXT),i===e.SHORT&&c&&(l=c.RG16_SNORM_EXT)),r===e.RG_INTEGER&&(i===e.UNSIGNED_BYTE&&(l=e.RG8UI),i===e.UNSIGNED_SHORT&&(l=e.RG16UI),i===e.UNSIGNED_INT&&(l=e.RG32UI),i===e.BYTE&&(l=e.RG8I),i===e.SHORT&&(l=e.RG16I),i===e.INT&&(l=e.RG32I)),r===e.RGB_INTEGER&&(i===e.UNSIGNED_BYTE&&(l=e.RGB8UI),i===e.UNSIGNED_SHORT&&(l=e.RGB16UI),i===e.UNSIGNED_INT&&(l=e.RGB32UI),i===e.BYTE&&(l=e.RGB8I),i===e.SHORT&&(l=e.RGB16I),i===e.INT&&(l=e.RGB32I)),r===e.RGBA_INTEGER&&(i===e.UNSIGNED_BYTE&&(l=e.RGBA8UI),i===e.UNSIGNED_SHORT&&(l=e.RGBA16UI),i===e.UNSIGNED_INT&&(l=e.RGBA32UI),i===e.BYTE&&(l=e.RGBA8I),i===e.SHORT&&(l=e.RGBA16I),i===e.INT&&(l=e.RGBA32I)),r===e.RGB&&(i===e.UNSIGNED_SHORT&&c&&(l=c.RGB16_EXT),i===e.SHORT&&c&&(l=c.RGB16_SNORM_EXT),i===e.UNSIGNED_INT_5_9_9_9_REV&&(l=e.RGB9_E5),i===e.UNSIGNED_INT_10F_11F_11F_REV&&(l=e.R11F_G11F_B10F)),r===e.RGBA){let t=s?Yt:X.getTransfer(o);i===e.FLOAT&&(l=e.RGBA32F),i===e.HALF_FLOAT&&(l=e.RGBA16F),i===e.UNSIGNED_BYTE&&(l=t===`srgb`?e.SRGB8_ALPHA8:e.RGBA8),i===e.UNSIGNED_SHORT&&c&&(l=c.RGBA16_EXT),i===e.SHORT&&c&&(l=c.RGBA16_SNORM_EXT),i===e.UNSIGNED_SHORT_4_4_4_4&&(l=e.RGBA4),i===e.UNSIGNED_SHORT_5_5_5_1&&(l=e.RGB5_A1)}return(l===e.R16F||l===e.R32F||l===e.RG16F||l===e.RG32F||l===e.RGBA16F||l===e.RGBA32F)&&t.get(`EXT_color_buffer_float`),l}function C(t,n){let r;return t?n===null||n===1014||n===1020?r=e.DEPTH24_STENCIL8:n===1015?r=e.DEPTH32F_STENCIL8:n===1012&&(r=e.DEPTH24_STENCIL8,W(`DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.`)):n===null||n===1014||n===1020?r=e.DEPTH_COMPONENT24:n===1015?r=e.DEPTH_COMPONENT32F:n===1012&&(r=e.DEPTH_COMPONENT16),r}function w(e,t){return y(e)===!0||e.isFramebufferTexture&&e.minFilter!==1003&&e.minFilter!==1006?Math.log2(Math.max(t.width,t.height))+1:e.mipmaps.length>0?e.mipmaps.length:e.isCompressedTexture&&Array.isArray(e.image)?t.mipmaps.length:1}function T(e){let t=new WeakRef(e);r.get(e).__ref=t,m.add(t),h.register(e,t,t)}function E(e){let t=r.get(e).__ref;t!==void 0&&(m.delete(t),h.unregister(t))}function D(e){k(e.target)}function O(e){A(e.target)}function k(e){e.removeEventListener(`dispose`,D),E(e),M(e),e.isVideoTexture&&u.delete(e),e.isHTMLTexture&&d.delete(e)}function A(e){e.removeEventListener(`dispose`,O),E(e),ee(e)}function j(){for(let e of m){let t=e.deref();t!==void 0&&(t.isRenderTarget===!0?A(t):k(t))}m.clear(),d.clear()}function M(e){let t=r.get(e);if(t.__webglInit===void 0)return;let n=e.source,i=p.get(n);if(i){let r=i[t.__cacheKey];r.usedTimes--,r.usedTimes===0&&N(e),Object.keys(i).length===0&&p.delete(n)}r.remove(e)}function N(t){let n=r.get(t);e.deleteTexture(n.__webglTexture);let i=t.source,a=p.get(i);delete a[n.__cacheKey],o.memory.textures--}function ee(t){let n=r.get(t);n.__depthDisposeCallback&&n.__depthDisposeCallback();let i=t.depthTexture;if(i&&i.renderTarget===t&&k(i),t.isWebGLCubeRenderTarget)for(let t=0;t<6;t++){if(Array.isArray(n.__webglFramebuffer[t]))for(let r=0;r<n.__webglFramebuffer[t].length;r++)e.deleteFramebuffer(n.__webglFramebuffer[t][r]);else e.deleteFramebuffer(n.__webglFramebuffer[t]);n.__webglDepthbuffer&&e.deleteRenderbuffer(n.__webglDepthbuffer[t])}else{if(Array.isArray(n.__webglFramebuffer))for(let t=0;t<n.__webglFramebuffer.length;t++)e.deleteFramebuffer(n.__webglFramebuffer[t]);else e.deleteFramebuffer(n.__webglFramebuffer);if(n.__webglDepthbuffer&&e.deleteRenderbuffer(n.__webglDepthbuffer),n.__webglMultisampledFramebuffer&&e.deleteFramebuffer(n.__webglMultisampledFramebuffer),n.__webglColorRenderbuffer)for(let t=0;t<n.__webglColorRenderbuffer.length;t++)n.__webglColorRenderbuffer[t]&&e.deleteRenderbuffer(n.__webglColorRenderbuffer[t]);n.__webglDepthRenderbuffer&&e.deleteRenderbuffer(n.__webglDepthRenderbuffer)}let a=t.textures;for(let t=0,n=a.length;t<n;t++){let n=r.get(a[t]);n.__webglTexture&&(e.deleteTexture(n.__webglTexture),o.memory.textures--),r.remove(a[t])}r.remove(t)}let P=0;function F(){P=0}function te(){return P}function ne(e){P=e}function re(){let e=P;return e>=i.maxTextures&&W(`WebGLTextures: Trying to use `+(e+1)+` texture units while this GPU supports only `+i.maxTextures),P+=1,e}function ie(e){let t=[];return t.push(e.wrapS),t.push(e.wrapT),t.push(e.wrapR||0),t.push(e.magFilter),t.push(e.minFilter),t.push(e.anisotropy),t.push(e.internalFormat),t.push(e.format),t.push(e.type),t.push(e.generateMipmaps),t.push(e.mipmapsAutoUpdate),t.push(e.premultiplyAlpha),t.push(e.flipY),t.push(e.unpackAlignment),t.push(e.colorSpace),t.join()}function ae(t,i){let a=r.get(t);if(t.isVideoTexture&&V(t),t.isRenderTargetTexture===!1&&t.isExternalTexture!==!0&&t.version>0&&a.__version!==t.version){let e=t.image;if(e===null)W(`WebGLRenderer: Texture marked for update but no image data found.`);else if(e.complete===!1)W(`WebGLRenderer: Texture marked for update but image is incomplete`);else{pe(a,t,i);return}}else t.isExternalTexture&&(a.__webglTexture=t.sourceTexture?t.sourceTexture:null);n.bindTexture(e.TEXTURE_2D,a.__webglTexture,e.TEXTURE0+i)}function oe(t,i){let a=r.get(t);t.isRenderTargetTexture===!1&&t.version>0&&a.__version!==t.version?pe(a,t,i):(t.isExternalTexture&&(a.__webglTexture=t.sourceTexture?t.sourceTexture:null),n.bindTexture(e.TEXTURE_2D_ARRAY,a.__webglTexture,e.TEXTURE0+i))}function I(t,i){let a=r.get(t);t.isRenderTargetTexture===!1&&t.version>0&&a.__version!==t.version?pe(a,t,i):n.bindTexture(e.TEXTURE_3D,a.__webglTexture,e.TEXTURE0+i)}function se(t,i){let a=r.get(t);t.version>0&&a.__version!==t.version?me(a,t,i):n.bindTexture(e.TEXTURE_CUBE_MAP,a.__webglTexture,e.TEXTURE0+i)}let ce={[Ee]:e.REPEAT,[De]:e.CLAMP_TO_EDGE,[Oe]:e.MIRRORED_REPEAT},L={[ke]:e.NEAREST,[Ae]:e.NEAREST_MIPMAP_NEAREST,[je]:e.NEAREST_MIPMAP_LINEAR,[U]:e.LINEAR,[Me]:e.LINEAR_MIPMAP_NEAREST,[Ne]:e.LINEAR_MIPMAP_LINEAR},R={512:e.NEVER,519:e.ALWAYS,513:e.LESS,515:e.LEQUAL,514:e.EQUAL,518:e.GEQUAL,516:e.GREATER,517:e.NOTEQUAL};function le(n,a){if(a.type===1015&&t.has(`OES_texture_float_linear`)===!1&&(a.magFilter===1006||a.magFilter===1007||a.magFilter===1005||a.magFilter===1008||a.minFilter===1006||a.minFilter===1007||a.minFilter===1005||a.minFilter===1008)&&W(`WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device.`),e.texParameteri(n,e.TEXTURE_WRAP_S,ce[a.wrapS]),e.texParameteri(n,e.TEXTURE_WRAP_T,ce[a.wrapT]),(n===e.TEXTURE_3D||n===e.TEXTURE_2D_ARRAY)&&e.texParameteri(n,e.TEXTURE_WRAP_R,ce[a.wrapR]),e.texParameteri(n,e.TEXTURE_MAG_FILTER,L[a.magFilter]),e.texParameteri(n,e.TEXTURE_MIN_FILTER,L[a.minFilter]),a.compareFunction&&(e.texParameteri(n,e.TEXTURE_COMPARE_MODE,e.COMPARE_REF_TO_TEXTURE),e.texParameteri(n,e.TEXTURE_COMPARE_FUNC,R[a.compareFunction])),t.has(`EXT_texture_filter_anisotropic`)===!0){if(a.magFilter===1003||a.minFilter!==1005&&a.minFilter!==1008||a.type===1015&&t.has(`OES_texture_float_linear`)===!1)return;if(a.anisotropy>1||r.get(a).__currentAnisotropy){let o=t.get(`EXT_texture_filter_anisotropic`);e.texParameterf(n,o.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(a.anisotropy,i.getMaxAnisotropy())),r.get(a).__currentAnisotropy=a.anisotropy}}}function ue(t,n){let r=!1;t.__webglInit===void 0&&(t.__webglInit=!0,n.addEventListener(`dispose`,D),T(n));let i=n.source,a=p.get(i);a===void 0&&(a={},p.set(i,a));let s=ie(n);if(s!==t.__cacheKey){a[s]===void 0&&(a[s]={texture:e.createTexture(),usedTimes:0},o.memory.textures++,r=!0),a[s].usedTimes++;let i=a[t.__cacheKey];i!==void 0&&(a[t.__cacheKey].usedTimes--,i.usedTimes===0&&N(n)),t.__cacheKey=s,t.__webglTexture=a[s].texture}return r}function de(e,t,n){return Math.floor(Math.floor(e/n)/t)}function fe(t,r,i,a){let o=t.updateRanges;if(o.length===0)n.texSubImage2D(e.TEXTURE_2D,0,0,0,r.width,r.height,i,a,r.data);else{o.sort((e,t)=>e.start-t.start);let s=0;for(let e=1;e<o.length;e++){let t=o[s],n=o[e],i=t.start+t.count,a=de(n.start,r.width,4),c=de(t.start,r.width,4);n.start<=i+1&&a===c&&de(n.start+n.count-1,r.width,4)===a?t.count=Math.max(t.count,n.start+n.count-t.start):(++s,o[s]=n)}o.length=s+1;let c=n.getParameter(e.UNPACK_ROW_LENGTH),l=n.getParameter(e.UNPACK_SKIP_PIXELS),u=n.getParameter(e.UNPACK_SKIP_ROWS);n.pixelStorei(e.UNPACK_ROW_LENGTH,r.width);for(let t=0,s=o.length;t<s;t++){let s=o[t],c=Math.floor(s.start/4),l=Math.ceil(s.count/4),u=c%r.width,d=Math.floor(c/r.width),f=l;n.pixelStorei(e.UNPACK_SKIP_PIXELS,u),n.pixelStorei(e.UNPACK_SKIP_ROWS,d),n.texSubImage2D(e.TEXTURE_2D,0,u,d,f,1,i,a,r.data)}t.clearUpdateRanges(),n.pixelStorei(e.UNPACK_ROW_LENGTH,c),n.pixelStorei(e.UNPACK_SKIP_PIXELS,l),n.pixelStorei(e.UNPACK_SKIP_ROWS,u)}}function pe(t,o,s){let c=e.TEXTURE_2D;(o.isDataArrayTexture||o.isCompressedArrayTexture)&&(c=e.TEXTURE_2D_ARRAY),o.isData3DTexture&&(c=e.TEXTURE_3D);let l=ue(t,o),u=o.source;n.bindTexture(c,t.__webglTexture,e.TEXTURE0+s);let f=r.get(u);if(u.version!==f.__version||l===!0){if(n.activeTexture(e.TEXTURE0+s),!(typeof ImageBitmap<`u`&&o.image instanceof ImageBitmap)){let t=X.getPrimaries(X.workingColorSpace),r=o.colorSpace===``?null:X.getPrimaries(o.colorSpace),i=o.colorSpace===``||t===r?e.NONE:e.BROWSER_DEFAULT_WEBGL;n.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,o.flipY),n.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,o.premultiplyAlpha),n.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL,i)}n.pixelStorei(e.UNPACK_ALIGNMENT,o.unpackAlignment);let t=v(o.image,!1,i.maxTextureSize);t=H(o,t);let r=a.convert(o.format,o.colorSpace),p=a.convert(o.type),m=S(o.internalFormat,r,p,o.normalized,o.colorSpace,o.isVideoTexture);le(c,o);let h,g=o.mipmaps,_=o.isVideoTexture!==!0,x=f.__version===void 0||l===!0,T=u.dataReady,E=w(o,t);if(o.isDepthTexture)m=C(o.format===Ze,o.type),x&&(_?n.texStorage2D(e.TEXTURE_2D,1,m,t.width,t.height):n.texImage2D(e.TEXTURE_2D,0,m,t.width,t.height,0,r,p,null));else if(o.isDataTexture){if(g.length>0){_&&x&&n.texStorage2D(e.TEXTURE_2D,E,m,g[0].width,g[0].height);for(let t=0,i=g.length;t<i;t++)h=g[t],_?T&&n.texSubImage2D(e.TEXTURE_2D,t,0,0,h.width,h.height,r,p,h.data):n.texImage2D(e.TEXTURE_2D,t,m,h.width,h.height,0,r,p,h.data);o.generateMipmaps=!1}else _?(x&&n.texStorage2D(e.TEXTURE_2D,E,m,t.width,t.height),T&&fe(o,t,r,p)):n.texImage2D(e.TEXTURE_2D,0,m,t.width,t.height,0,r,p,t.data)}else if(o.isCompressedTexture){if(o.isCompressedArrayTexture){_&&x&&n.texStorage3D(e.TEXTURE_2D_ARRAY,E,m,g[0].width,g[0].height,t.depth);for(let i=0,a=g.length;i<a;i++)if(h=g[i],o.format!==1023){if(r!==null){if(_){if(T){if(o.layerUpdates.size>0){let t=ps(h.width,h.height,o.format,o.type);for(let a of o.layerUpdates){let o=h.data.subarray(a*t/h.data.BYTES_PER_ELEMENT,(a+1)*t/h.data.BYTES_PER_ELEMENT);n.compressedTexSubImage3D(e.TEXTURE_2D_ARRAY,i,0,0,a,h.width,h.height,1,r,o)}}else n.compressedTexSubImage3D(e.TEXTURE_2D_ARRAY,i,0,0,0,h.width,h.height,t.depth,r,h.data)}}else n.compressedTexImage3D(e.TEXTURE_2D_ARRAY,i,m,h.width,h.height,t.depth,0,h.data,0,0)}else W(`WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()`)}else _?T&&n.texSubImage3D(e.TEXTURE_2D_ARRAY,i,0,0,0,h.width,h.height,t.depth,r,p,h.data):n.texImage3D(e.TEXTURE_2D_ARRAY,i,m,h.width,h.height,t.depth,0,r,p,h.data);o.layerUpdates.size>0&&o.clearLayerUpdates()}else{_&&x&&n.texStorage2D(e.TEXTURE_2D,E,m,g[0].width,g[0].height);for(let t=0,i=g.length;t<i;t++)h=g[t],o.format===1023?_?T&&n.texSubImage2D(e.TEXTURE_2D,t,0,0,h.width,h.height,r,p,h.data):n.texImage2D(e.TEXTURE_2D,t,m,h.width,h.height,0,r,p,h.data):r===null?W(`WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()`):_?T&&n.compressedTexSubImage2D(e.TEXTURE_2D,t,0,0,h.width,h.height,r,h.data):n.compressedTexImage2D(e.TEXTURE_2D,t,m,h.width,h.height,0,h.data)}}else if(o.isDataArrayTexture){if(_){if(x&&n.texStorage3D(e.TEXTURE_2D_ARRAY,E,m,t.width,t.height,t.depth),T){if(o.layerUpdates.size>0){let i=ps(t.width,t.height,o.format,o.type);for(let a of o.layerUpdates){let o=t.data.subarray(a*i/t.data.BYTES_PER_ELEMENT,(a+1)*i/t.data.BYTES_PER_ELEMENT);n.texSubImage3D(e.TEXTURE_2D_ARRAY,0,0,0,a,t.width,t.height,1,r,p,o)}o.clearLayerUpdates()}else n.texSubImage3D(e.TEXTURE_2D_ARRAY,0,0,0,0,t.width,t.height,t.depth,r,p,t.data)}}else n.texImage3D(e.TEXTURE_2D_ARRAY,0,m,t.width,t.height,t.depth,0,r,p,t.data)}else if(o.isData3DTexture)_?(x&&n.texStorage3D(e.TEXTURE_3D,E,m,t.width,t.height,t.depth),T&&n.texSubImage3D(e.TEXTURE_3D,0,0,0,0,t.width,t.height,t.depth,r,p,t.data)):n.texImage3D(e.TEXTURE_3D,0,m,t.width,t.height,t.depth,0,r,p,t.data);else if(o.isFramebufferTexture){if(x){if(_)n.texStorage2D(e.TEXTURE_2D,E,m,t.width,t.height);else{let i=t.width,a=t.height;for(let t=0;t<E;t++)n.texImage2D(e.TEXTURE_2D,t,m,i,a,0,r,p,null),i>>=1,a>>=1}}}else if(o.isHTMLTexture){if(`texElementImage2D`in e){let n=e.canvas;if(n.hasAttribute(`layoutsubtree`)||n.setAttribute(`layoutsubtree`,`true`),t.parentNode!==n){n.appendChild(t),d.add(o),n.onpaint=e=>{let t=e.changedElements;for(let e of d)t.includes(e.image)&&(e.needsUpdate=!0)},n.requestPaint();return}if(e.texElementImage2D.length===3)e.texElementImage2D(e.TEXTURE_2D,e.RGBA8,t);else{let n=e.RGBA,r=e.RGBA,i=e.UNSIGNED_BYTE;e.texElementImage2D(e.TEXTURE_2D,0,n,r,i,t)}e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE)}}else if(g.length>0){if(_&&x){let t=we(g[0]);n.texStorage2D(e.TEXTURE_2D,E,m,t.width,t.height)}for(let t=0,i=g.length;t<i;t++)h=g[t],_?T&&n.texSubImage2D(e.TEXTURE_2D,t,0,0,r,p,h):n.texImage2D(e.TEXTURE_2D,t,m,r,p,h);o.generateMipmaps=!1}else if(_){if(x){let r=we(t);n.texStorage2D(e.TEXTURE_2D,E,m,r.width,r.height)}T&&n.texSubImage2D(e.TEXTURE_2D,0,0,0,r,p,t)}else n.texImage2D(e.TEXTURE_2D,0,m,r,p,t);y(o)&&o.mipmapsAutoUpdate===!0&&b(c),f.__version=u.version,o.onUpdate&&o.onUpdate(o)}t.__version=o.version}function me(t,o,s){if(o.image.length!==6)return;let c=ue(t,o),l=o.source;n.bindTexture(e.TEXTURE_CUBE_MAP,t.__webglTexture,e.TEXTURE0+s);let u=r.get(l);if(l.version!==u.__version||c===!0){n.activeTexture(e.TEXTURE0+s);let t=X.getPrimaries(X.workingColorSpace),r=o.colorSpace===``?null:X.getPrimaries(o.colorSpace),d=o.colorSpace===``||t===r?e.NONE:e.BROWSER_DEFAULT_WEBGL;n.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,o.flipY),n.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,o.premultiplyAlpha),n.pixelStorei(e.UNPACK_ALIGNMENT,o.unpackAlignment),n.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL,d);let f=o.isCompressedTexture||o.image[0].isCompressedTexture,p=o.image[0]&&o.image[0].isDataTexture,m=[];for(let e=0;e<6;e++)!f&&!p?m[e]=v(o.image[e],!0,i.maxCubemapSize):m[e]=p?o.image[e].image:o.image[e],m[e]=H(o,m[e]);let h=m[0],g=a.convert(o.format,o.colorSpace),_=a.convert(o.type),x=S(o.internalFormat,g,_,o.normalized,o.colorSpace),T=o.isVideoTexture!==!0,E=u.__version===void 0||c===!0,D=l.dataReady,O=w(o,h);le(e.TEXTURE_CUBE_MAP,o);let k;if(o.isDepthTexture){if(x=C(o.format===Ze,o.type),E){if(T)n.texStorage2D(e.TEXTURE_CUBE_MAP,1,x,h.width,h.height);else for(let t=0;t<6;t++)n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,0,x,h.width,h.height,0,g,_,null)}}else if(f){T&&E&&n.texStorage2D(e.TEXTURE_CUBE_MAP,O,x,h.width,h.height);for(let t=0;t<6;t++){k=m[t].mipmaps;for(let r=0;r<k.length;r++){let i=k[r];o.format===1023?T?D&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r,0,0,i.width,i.height,g,_,i.data):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r,x,i.width,i.height,0,g,_,i.data):g===null?W(`WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()`):T?D&&n.compressedTexSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r,0,0,i.width,i.height,g,i.data):n.compressedTexImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r,x,i.width,i.height,0,i.data)}}}else{if(k=o.mipmaps,T&&E){k.length>0&&O++;let t=we(m[0]);n.texStorage2D(e.TEXTURE_CUBE_MAP,O,x,t.width,t.height)}for(let t=0;t<6;t++)if(p){T?D&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,0,0,0,m[t].width,m[t].height,g,_,m[t].data):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,0,x,m[t].width,m[t].height,0,g,_,m[t].data);for(let r=0;r<k.length;r++){let i=k[r].image[t].image;T?D&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r+1,0,0,i.width,i.height,g,_,i.data):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r+1,x,i.width,i.height,0,g,_,i.data)}}else{T?D&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,0,0,0,g,_,m[t]):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,0,x,g,_,m[t]);for(let r=0;r<k.length;r++){let i=k[r];T?D&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r+1,0,0,g,_,i.image[t]):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r+1,x,g,_,i.image[t])}}}y(o)&&o.mipmapsAutoUpdate===!0&&b(e.TEXTURE_CUBE_MAP),u.__version=l.version,o.onUpdate&&o.onUpdate(o)}t.__version=o.version}function he(t,i,o,c,l,u){let d=a.convert(o.format,o.colorSpace),f=a.convert(o.type),p=S(o.internalFormat,d,f,o.normalized,o.colorSpace),m=r.get(i),h=r.get(o);if(h.__renderTarget=i,!m.__hasExternalTextures){let t=Math.max(1,i.width>>u),r=Math.max(1,i.height>>u);l===e.TEXTURE_3D||l===e.TEXTURE_2D_ARRAY?n.texImage3D(l,u,p,t,r,i.depth,0,d,f,null):n.texImage2D(l,u,p,t,r,0,d,f,null)}n.bindFramebuffer(e.FRAMEBUFFER,t),Ce(i)?s.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,c,l,h.__webglTexture,0,B(i)):(l===e.TEXTURE_2D||l>=e.TEXTURE_CUBE_MAP_POSITIVE_X&&l<=e.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&e.framebufferTexture2D(e.FRAMEBUFFER,c,l,h.__webglTexture,u),n.bindFramebuffer(e.FRAMEBUFFER,null)}function ge(t,n,r){if(e.bindRenderbuffer(e.RENDERBUFFER,t),n.depthBuffer){let i=n.depthTexture,a=i&&i.isDepthTexture?i.type:null,o=C(n.stencilBuffer,a),c=n.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT;Ce(n)?s.renderbufferStorageMultisampleEXT(e.RENDERBUFFER,B(n),o,n.width,n.height):r?e.renderbufferStorageMultisample(e.RENDERBUFFER,B(n),o,n.width,n.height):e.renderbufferStorage(e.RENDERBUFFER,o,n.width,n.height),e.framebufferRenderbuffer(e.FRAMEBUFFER,c,e.RENDERBUFFER,t)}else{let t=n.textures;for(let i=0;i<t.length;i++){let o=t[i],c=a.convert(o.format,o.colorSpace),l=a.convert(o.type),u=S(o.internalFormat,c,l,o.normalized,o.colorSpace);Ce(n)?s.renderbufferStorageMultisampleEXT(e.RENDERBUFFER,B(n),u,n.width,n.height):r?e.renderbufferStorageMultisample(e.RENDERBUFFER,B(n),u,n.width,n.height):e.renderbufferStorage(e.RENDERBUFFER,u,n.width,n.height)}}e.bindRenderbuffer(e.RENDERBUFFER,null)}function _e(t,i,a){let o=i.isWebGLCubeRenderTarget===!0;if(n.bindFramebuffer(e.FRAMEBUFFER,t),!(i.depthTexture&&i.depthTexture.isDepthTexture))throw Error(`THREE.WebGLTextures: renderTarget.depthTexture must be an instance of THREE.DepthTexture.`);let c=r.get(i.depthTexture);c.__renderTarget=i;let l=o?i.depthTexture.image[0]:i.depthTexture.image;c.__webglTexture&&l.width===i.width&&l.height===i.height||(l.width=i.width,l.height=i.height,i.depthTexture.needsUpdate=!0),o?se(i.depthTexture,0):ae(i.depthTexture,0);let u=c.__webglTexture,d=B(i),f=o?e.TEXTURE_CUBE_MAP_POSITIVE_X+a:e.TEXTURE_2D,p=i.depthTexture.format===1027?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT;if(i.depthTexture.format===1026)Ce(i)?s.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,p,f,u,0,d):e.framebufferTexture2D(e.FRAMEBUFFER,p,f,u,0);else if(i.depthTexture.format===1027)Ce(i)?s.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,p,f,u,0,d):e.framebufferTexture2D(e.FRAMEBUFFER,p,f,u,0);else throw Error(`THREE.WebGLTextures: Unknown depthTexture format.`)}function ve(t){let i=r.get(t),a=t.isWebGLCubeRenderTarget===!0;if(i.__boundDepthTexture!==t.depthTexture){let e=t.depthTexture;if(i.__depthDisposeCallback&&i.__depthDisposeCallback(),e){let t=()=>{delete i.__boundDepthTexture,delete i.__depthDisposeCallback,e.removeEventListener(`dispose`,t)};e.addEventListener(`dispose`,t),i.__depthDisposeCallback=t}i.__boundDepthTexture=e}if(t.depthTexture&&!i.__autoAllocateDepthBuffer){if(a)for(let e=0;e<6;e++)_e(i.__webglFramebuffer[e],t,e);else t.texture.mipmaps.length>0?_e(i.__webglFramebuffer[0],t,0):_e(i.__webglFramebuffer,t,0)}else if(a){i.__webglDepthbuffer=[];for(let r=0;r<6;r++)if(n.bindFramebuffer(e.FRAMEBUFFER,i.__webglFramebuffer[r]),i.__webglDepthbuffer[r]===void 0)i.__webglDepthbuffer[r]=e.createRenderbuffer(),ge(i.__webglDepthbuffer[r],t,!1);else{let n=t.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,a=i.__webglDepthbuffer[r];e.bindRenderbuffer(e.RENDERBUFFER,a),e.framebufferRenderbuffer(e.FRAMEBUFFER,n,e.RENDERBUFFER,a)}}else if(t.texture.mipmaps.length>0?n.bindFramebuffer(e.FRAMEBUFFER,i.__webglFramebuffer[0]):n.bindFramebuffer(e.FRAMEBUFFER,i.__webglFramebuffer),i.__webglDepthbuffer===void 0)i.__webglDepthbuffer=e.createRenderbuffer(),ge(i.__webglDepthbuffer,t,!1);else{let n=t.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,r=i.__webglDepthbuffer;e.bindRenderbuffer(e.RENDERBUFFER,r),e.framebufferRenderbuffer(e.FRAMEBUFFER,n,e.RENDERBUFFER,r)}n.bindFramebuffer(e.FRAMEBUFFER,null)}function ye(t,n,i){let a=r.get(t);n!==void 0&&he(a.__webglFramebuffer,t,t.texture,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,0),i!==void 0&&ve(t)}function z(t){let i=t.texture,s=r.get(t),c=r.get(i);t.addEventListener(`dispose`,O),T(t);let l=t.textures,u=t.isWebGLCubeRenderTarget===!0,d=l.length>1;if(d||(c.__webglTexture===void 0&&(c.__webglTexture=e.createTexture()),c.__version=i.version,o.memory.textures++),u){s.__webglFramebuffer=[];for(let t=0;t<6;t++)if(i.mipmaps.length>0){s.__webglFramebuffer[t]=[];for(let n=0;n<i.mipmaps.length;n++)s.__webglFramebuffer[t][n]=e.createFramebuffer()}else s.__webglFramebuffer[t]=e.createFramebuffer()}else{if(i.mipmaps.length>0){s.__webglFramebuffer=[];for(let t=0;t<i.mipmaps.length;t++)s.__webglFramebuffer[t]=e.createFramebuffer()}else s.__webglFramebuffer=e.createFramebuffer();if(d)for(let t=0,n=l.length;t<n;t++){let n=r.get(l[t]);n.__webglTexture===void 0&&(n.__webglTexture=e.createTexture(),o.memory.textures++)}if(t.samples>0&&Ce(t)===!1){s.__webglMultisampledFramebuffer=e.createFramebuffer(),s.__webglColorRenderbuffer=[],n.bindFramebuffer(e.FRAMEBUFFER,s.__webglMultisampledFramebuffer);for(let n=0;n<l.length;n++){let r=l[n];s.__webglColorRenderbuffer[n]=e.createRenderbuffer(),e.bindRenderbuffer(e.RENDERBUFFER,s.__webglColorRenderbuffer[n]);let i=a.convert(r.format,r.colorSpace),o=a.convert(r.type),c=S(r.internalFormat,i,o,r.normalized,r.colorSpace,t.isXRRenderTarget===!0),u=B(t);e.renderbufferStorageMultisample(e.RENDERBUFFER,u,c,t.width,t.height),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+n,e.RENDERBUFFER,s.__webglColorRenderbuffer[n])}e.bindRenderbuffer(e.RENDERBUFFER,null),t.depthBuffer&&(s.__webglDepthRenderbuffer=e.createRenderbuffer(),ge(s.__webglDepthRenderbuffer,t,!0)),n.bindFramebuffer(e.FRAMEBUFFER,null)}}if(u){n.bindTexture(e.TEXTURE_CUBE_MAP,c.__webglTexture),le(e.TEXTURE_CUBE_MAP,i);for(let n=0;n<6;n++)if(i.mipmaps.length>0)for(let r=0;r<i.mipmaps.length;r++)he(s.__webglFramebuffer[n][r],t,i,e.COLOR_ATTACHMENT0,e.TEXTURE_CUBE_MAP_POSITIVE_X+n,r);else he(s.__webglFramebuffer[n],t,i,e.COLOR_ATTACHMENT0,e.TEXTURE_CUBE_MAP_POSITIVE_X+n,0);y(i)?b(e.TEXTURE_CUBE_MAP):i.mipmaps.length>0&&e.texParameteri(e.TEXTURE_CUBE_MAP,e.TEXTURE_MAX_LEVEL,i.mipmaps.length-1),n.unbindTexture()}else if(d){for(let i=0,a=l.length;i<a;i++){let a=l[i],o=r.get(a),c=e.TEXTURE_2D;(t.isWebGL3DRenderTarget||t.isWebGLArrayRenderTarget)&&(c=t.isWebGL3DRenderTarget?e.TEXTURE_3D:e.TEXTURE_2D_ARRAY),n.bindTexture(c,o.__webglTexture),le(c,a),he(s.__webglFramebuffer,t,a,e.COLOR_ATTACHMENT0+i,c,0),y(a)&&b(c)}n.unbindTexture()}else{let r=e.TEXTURE_2D;if((t.isWebGL3DRenderTarget||t.isWebGLArrayRenderTarget)&&(r=t.isWebGL3DRenderTarget?e.TEXTURE_3D:e.TEXTURE_2D_ARRAY),n.bindTexture(r,c.__webglTexture),le(r,i),i.mipmaps.length>0)for(let n=0;n<i.mipmaps.length;n++)he(s.__webglFramebuffer[n],t,i,e.COLOR_ATTACHMENT0,r,n);else he(s.__webglFramebuffer,t,i,e.COLOR_ATTACHMENT0,r,0);y(i)?b(r):i.mipmaps.length>0&&e.texParameteri(r,e.TEXTURE_MAX_LEVEL,i.mipmaps.length-1),n.unbindTexture()}t.depthBuffer&&ve(t)}function be(e){let t=e.textures;for(let i=0,a=t.length;i<a;i++){let a=t[i];if(y(a)&&a.mipmapsAutoUpdate===!0){let t=x(e),i=r.get(a).__webglTexture;n.bindTexture(t,i),b(t),n.unbindTexture()}}}let xe=[];function Se(t){if(t.samples>0){if(Ce(t)===!1){let i=t.textures,a=t.width,o=t.height,s=e.COLOR_BUFFER_BIT,l=t.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,u=r.get(t),d=i.length>1;if(d)for(let t=0;t<i.length;t++)n.bindFramebuffer(e.FRAMEBUFFER,u.__webglMultisampledFramebuffer),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+t,e.RENDERBUFFER,null),n.bindFramebuffer(e.FRAMEBUFFER,u.__webglFramebuffer),e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0+t,e.TEXTURE_2D,null,0);n.bindFramebuffer(e.READ_FRAMEBUFFER,u.__webglMultisampledFramebuffer),t.texture.mipmaps.length>0?n.bindFramebuffer(e.DRAW_FRAMEBUFFER,u.__webglFramebuffer[0]):n.bindFramebuffer(e.DRAW_FRAMEBUFFER,u.__webglFramebuffer);for(let n=0;n<i.length;n++){if(t.resolveDepthBuffer&&(t.depthBuffer&&(s|=e.DEPTH_BUFFER_BIT),t.stencilBuffer&&t.resolveStencilBuffer&&(s|=e.STENCIL_BUFFER_BIT)),d){e.framebufferRenderbuffer(e.READ_FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.RENDERBUFFER,u.__webglColorRenderbuffer[n]);let t=r.get(i[n]).__webglTexture;e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,t,0)}e.blitFramebuffer(0,0,a,o,0,0,a,o,s,e.NEAREST),c===!0&&(xe.length=0,xe.push(e.COLOR_ATTACHMENT0+n),t.depthBuffer&&t.storeMultisampledDepthBuffer===!1&&xe.push(l),e.invalidateFramebuffer(e.READ_FRAMEBUFFER,xe))}if(n.bindFramebuffer(e.READ_FRAMEBUFFER,null),n.bindFramebuffer(e.DRAW_FRAMEBUFFER,null),d)for(let t=0;t<i.length;t++){n.bindFramebuffer(e.FRAMEBUFFER,u.__webglMultisampledFramebuffer),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+t,e.RENDERBUFFER,u.__webglColorRenderbuffer[t]);let a=r.get(i[t]).__webglTexture;n.bindFramebuffer(e.FRAMEBUFFER,u.__webglFramebuffer),e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0+t,e.TEXTURE_2D,a,0)}n.bindFramebuffer(e.DRAW_FRAMEBUFFER,u.__webglMultisampledFramebuffer)}else if(t.depthBuffer&&t.storeMultisampledDepthBuffer===!1&&c){let n=t.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT;e.invalidateFramebuffer(e.DRAW_FRAMEBUFFER,[n])}}}function B(e){return Math.min(i.maxSamples,e.samples)}function Ce(e){let n=r.get(e);return e.samples>0&&t.has(`WEBGL_multisampled_render_to_texture`)===!0&&n.__useRenderToTexture!==!1}function V(e){let t=o.render.frame;u.get(e)!==t&&(u.set(e,t),e.update())}function H(e,t){let n=e.colorSpace,r=e.format,i=e.type;return e.isCompressedTexture===!0||e.isVideoTexture===!0||n!==`srgb-linear`&&n!==``&&(X.getTransfer(n)===`srgb`?(r!==1023||i!==1009)&&W(`WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType.`):G(`WebGLTextures: Unsupported texture color space:`,n)),t}function we(e){return typeof HTMLImageElement<`u`&&e instanceof HTMLImageElement?(l.width=e.naturalWidth||e.width,l.height=e.naturalHeight||e.height):typeof VideoFrame<`u`&&e instanceof VideoFrame?(l.width=e.displayWidth,l.height=e.displayHeight):(l.width=e.width,l.height=e.height),l}this.allocateTextureUnit=re,this.resetTextureUnits=F,this.getTextureUnits=te,this.setTextureUnits=ne,this.setTexture2D=ae,this.setTexture2DArray=oe,this.setTexture3D=I,this.setTextureCube=se,this.rebindTextures=ye,this.setupRenderTarget=z,this.updateRenderTargetMipmap=be,this.updateMultisampleRenderTarget=Se,this.setupDepthRenderbuffer=ve,this.setupFrameBufferTexture=he,this.useMultisampledRTT=Ce,this.dispose=j}function fu(e,t){function n(n,r=``){let i,a=X.getTransfer(r);if(n===1009)return e.UNSIGNED_BYTE;if(n===1017)return e.UNSIGNED_SHORT_4_4_4_4;if(n===1018)return e.UNSIGNED_SHORT_5_5_5_1;if(n===35902)return e.UNSIGNED_INT_5_9_9_9_REV;if(n===35899)return e.UNSIGNED_INT_10F_11F_11F_REV;if(n===1010)return e.BYTE;if(n===1011)return e.SHORT;if(n===1012)return e.UNSIGNED_SHORT;if(n===1013)return e.INT;if(n===1014)return e.UNSIGNED_INT;if(n===1015)return e.FLOAT;if(n===1016)return e.HALF_FLOAT;if(n===1021)return e.ALPHA;if(n===1022)return e.RGB;if(n===1023)return e.RGBA;if(n===1026)return e.DEPTH_COMPONENT;if(n===1027)return e.DEPTH_STENCIL;if(n===1028)return e.RED;if(n===1029)return e.RED_INTEGER;if(n===1030)return e.RG;if(n===1031)return e.RG_INTEGER;if(n===1033)return e.RGBA_INTEGER;if(n===33776||n===33777||n===33778||n===33779){if(a===`srgb`){if(i=t.get(`WEBGL_compressed_texture_s3tc_srgb`),i!==null){if(n===33776)return i.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===33777)return i.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===33778)return i.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===33779)return i.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null}else if(i=t.get(`WEBGL_compressed_texture_s3tc`),i!==null){if(n===33776)return i.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===33777)return i.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===33778)return i.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===33779)return i.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null}if(n===35840||n===35841||n===35842||n===35843){if(i=t.get(`WEBGL_compressed_texture_pvrtc`),i!==null){if(n===35840)return i.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===35841)return i.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===35842)return i.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===35843)return i.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null}if(n===36196||n===37492||n===37496||n===37488||n===37489||n===37490||n===37491){if(i=t.get(`WEBGL_compressed_texture_etc`),i!==null){if(n===36196||n===37492)return a===`srgb`?i.COMPRESSED_SRGB8_ETC2:i.COMPRESSED_RGB8_ETC2;if(n===37496)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:i.COMPRESSED_RGBA8_ETC2_EAC;if(n===37488)return i.COMPRESSED_R11_EAC;if(n===37489)return i.COMPRESSED_SIGNED_R11_EAC;if(n===37490)return i.COMPRESSED_RG11_EAC;if(n===37491)return i.COMPRESSED_SIGNED_RG11_EAC}else return null}if(n===37808||n===37809||n===37810||n===37811||n===37812||n===37813||n===37814||n===37815||n===37816||n===37817||n===37818||n===37819||n===37820||n===37821){if(i=t.get(`WEBGL_compressed_texture_astc`),i!==null){if(n===37808)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:i.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===37809)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:i.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===37810)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:i.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===37811)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:i.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===37812)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:i.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===37813)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:i.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===37814)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:i.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===37815)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:i.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===37816)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:i.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===37817)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:i.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===37818)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:i.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===37819)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:i.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===37820)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:i.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===37821)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:i.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null}if(n===36492||n===36494||n===36495){if(i=t.get(`EXT_texture_compression_bptc`),i!==null){if(n===36492)return a===`srgb`?i.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:i.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===36494)return i.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===36495)return i.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null}if(n===36283||n===36284||n===36285||n===36286){if(i=t.get(`EXT_texture_compression_rgtc`),i!==null){if(n===36283)return i.COMPRESSED_RED_RGTC1_EXT;if(n===36284)return i.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===36285)return i.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===36286)return i.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null}return n===1020?e.UNSIGNED_INT_24_8:e[n]===void 0?null:e[n]}return{convert:n}}var pu=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,mu=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`,hu=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t){if(this.texture===null){let n=new Pa(e.texture);(e.depthNear!==t.depthNear||e.depthFar!==t.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=n}}getMesh(e){if(this.texture!==null&&this.mesh===null){let t=e.cameras[0].viewport,n=new Ja({vertexShader:pu,fragmentShader:mu,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new fa(new Ia(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},gu=class extends fn{constructor(e,t){super();let n=this,r=null,i=1,a=null,o=`local-floor`,s=1,c=null,l=null,u=null,d=null,f=null,p=null,m=typeof XRWebGLBinding<`u`,h=new hu,g={},_=t.getContextAttributes(),v=null,y=null,b=[],x=[],S=new q,C=null,w=null,T=new No;T.viewport=new rr;let E=new No;E.viewport=new rr;let D=[T,E],O=new zo,k=null,A=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(e){let t=b[e];return t===void 0&&(t=new Rr,b[e]=t),t.getTargetRaySpace()},this.getControllerGrip=function(e){let t=b[e];return t===void 0&&(t=new Rr,b[e]=t),t.getGripSpace()},this.getHand=function(e){let t=b[e];return t===void 0&&(t=new Rr,b[e]=t),t.getHandSpace()};function j(e){let t=x.indexOf(e.inputSource);if(t===-1)return;let n=b[t];n!==void 0&&(n.update(e.inputSource,e.frame,c||a),n.dispatchEvent({type:e.type,data:e.inputSource}))}function M(){r.removeEventListener(`select`,j),r.removeEventListener(`selectstart`,j),r.removeEventListener(`selectend`,j),r.removeEventListener(`squeeze`,j),r.removeEventListener(`squeezestart`,j),r.removeEventListener(`squeezeend`,j),r.removeEventListener(`end`,M),r.removeEventListener(`inputsourceschange`,N);for(let e=0;e<b.length;e++){let t=x[e];t!==null&&(x[e]=null,b[e].disconnect(t))}k=null,A=null,h.reset();for(let e in g)delete g[e];if(e.setRenderTarget(v),f=null,d=null,u=null,r=null,y=null,ne.stop(),n.isPresenting=!1,e.setPixelRatio(C),e.setSize(S.width,S.height,!1),w!==null){let e=w.camera;e.fov=w.fov,e.zoom=w.zoom,e.updateProjectionMatrix(),w=null}n.dispatchEvent({type:`sessionend`})}this.setFramebufferScaleFactor=function(e){i=e,n.isPresenting===!0&&W(`WebXRManager: Cannot change framebuffer scale while presenting.`)},this.setReferenceSpaceType=function(e){o=e,n.isPresenting===!0&&W(`WebXRManager: Cannot change reference space type while presenting.`)},this.getReferenceSpace=function(){return c||a},this.setReferenceSpace=function(e){c=e},this.getBaseLayer=function(){return d===null?f:d},this.getBinding=function(){return u===null&&m&&(u=new XRWebGLBinding(r,t)),u},this.getFrame=function(){return p},this.getSession=function(){return r},this.setSession=async function(l){if(r=l,r!==null){if(v=e.getRenderTarget(),r.addEventListener(`select`,j),r.addEventListener(`selectstart`,j),r.addEventListener(`selectend`,j),r.addEventListener(`squeeze`,j),r.addEventListener(`squeezestart`,j),r.addEventListener(`squeezeend`,j),r.addEventListener(`end`,M),r.addEventListener(`inputsourceschange`,N),_.xrCompatible!==!0&&await t.makeXRCompatible(),C=e.getPixelRatio(),e.getSize(S),m&&`createProjectionLayer`in XRWebGLBinding.prototype){let n=null,a=null,o=null;_.depth&&(o=_.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,n=_.stencil?Ze:Xe,a=_.stencil?We:ze);let s={colorFormat:t.RGBA8,depthFormat:o,scaleFactor:i};u=this.getBinding(),d=u.createProjectionLayer(s),r.updateRenderState({layers:[d]}),e.setPixelRatio(1),e.setSize(d.textureWidth,d.textureHeight,!1),y=new ar(d.textureWidth,d.textureHeight,{format:Ye,type:Pe,depthTexture:new Ma(d.textureWidth,d.textureHeight,a,void 0,void 0,void 0,void 0,void 0,void 0,n),stencilBuffer:_.stencil,colorSpace:e.outputColorSpace,samples:_.antialias?4:0,resolveDepthBuffer:d.ignoreDepthValues===!1,resolveStencilBuffer:d.ignoreDepthValues===!1,storeMultisampledDepthBuffer:d.ignoreDepthValues===!1,storeMultisampledStencilBuffer:d.ignoreDepthValues===!1})}else{let n={antialias:_.antialias,alpha:!0,depth:_.depth,stencil:_.stencil,framebufferScaleFactor:i};f=new XRWebGLLayer(r,t,n),r.updateRenderState({baseLayer:f}),e.setPixelRatio(1),e.setSize(f.framebufferWidth,f.framebufferHeight,!1),y=new ar(f.framebufferWidth,f.framebufferHeight,{format:Ye,type:Pe,colorSpace:e.outputColorSpace,stencilBuffer:_.stencil,resolveDepthBuffer:f.ignoreDepthValues===!1,resolveStencilBuffer:f.ignoreDepthValues===!1,storeMultisampledDepthBuffer:f.ignoreDepthValues===!1,storeMultisampledStencilBuffer:f.ignoreDepthValues===!1})}y.isXRRenderTarget=!0,this.setFoveation(s),c=null,a=await r.requestReferenceSpace(o),ne.setContext(r),ne.start(),n.isPresenting=!0,n.dispatchEvent({type:`sessionstart`})}},this.getEnvironmentBlendMode=function(){if(r!==null)return r.environmentBlendMode},this.getDepthTexture=function(){return h.getDepthTexture()};function N(e){for(let t=0;t<e.removed.length;t++){let n=e.removed[t],r=x.indexOf(n);r>=0&&(x[r]=null,b[r].disconnect(n))}for(let t=0;t<e.added.length;t++){let n=e.added[t],r=x.indexOf(n);if(r===-1){for(let e=0;e<b.length;e++)if(e>=x.length){x.push(n),r=e;break}else if(x[e]===null){x[e]=n,r=e;break}if(r===-1)break}let i=b[r];i&&i.connect(n)}}function ee(e,t){t===null?e.matrixWorld.copy(e.matrix):e.matrixWorld.multiplyMatrices(t.matrixWorld,e.matrix),e.matrixWorldInverse.copy(e.matrixWorld).invert()}this.updateCamera=function(e){if(r===null)return;let t=e.near,n=e.far;h.texture!==null&&(h.depthNear>0&&(t=h.depthNear),h.depthFar>0&&(n=h.depthFar)),O.near=E.near=T.near=t,O.far=E.far=T.far=n,(k!==O.near||A!==O.far)&&(r.updateRenderState({depthNear:O.near,depthFar:O.far}),k=O.near,A=O.far),O.layers.mask=e.layers.mask|6,T.layers.mask=O.layers.mask&-5,E.layers.mask=O.layers.mask&-3;let i=e.parent,a=O.cameras;ee(O,i);for(let e=0;e<a.length;e++)ee(a[e],i);O.projectionMatrix.copy(T.projectionMatrix),O.projectionMatrixInverse.copy(T.projectionMatrixInverse),w===null&&e.isPerspectiveCamera&&(w={camera:e,fov:e.fov,zoom:e.zoom}),P(e,O,i)};function P(e,t,n){n===null?e.matrix.copy(t.matrixWorld):(e.matrix.copy(n.matrixWorld),e.matrix.invert(),e.matrix.multiply(t.matrixWorld)),e.matrix.decompose(e.position,e.quaternion,e.scale),e.updateMatrixWorld(!0),e.projectionMatrix.copy(t.projectionMatrix),e.projectionMatrixInverse.copy(t.projectionMatrixInverse),e.isPerspectiveCamera&&(e.fov=gn*2*Math.atan(1/e.projectionMatrix.elements[5]),e.zoom=1)}this.getCamera=function(){return O},this.getFoveation=function(){if(d!==null||f!==null)return s},this.setFoveation=function(e){s=e,d!==null&&(d.fixedFoveation=e),f!==null&&f.fixedFoveation!==void 0&&(f.fixedFoveation=e)},this.hasDepthSensing=function(){return h.texture!==null},this.getDepthSensingMesh=function(){return h.getMesh(O)},this.getCameraTexture=function(e){return g[e]};let F=null;function te(t,i){if(l=i.getViewerPose(c||a),p=i,l!==null){let t=l.views;f!==null&&(e.setRenderTargetFramebuffer(y,f.framebuffer),e.setRenderTarget(y));let i=!1;t.length!==O.cameras.length&&(O.cameras.length=0,i=!0);for(let n=0;n<t.length;n++){let r=t[n],a=null;if(f!==null)a=f.getViewport(r);else{let t=u.getViewSubImage(d,r);a=t.viewport,n===0&&(e.setRenderTargetTextures(y,t.colorTexture,t.depthStencilTexture),e.setRenderTarget(y))}let o=D[n];o===void 0&&(o=new No,o.layers.enable(n),o.viewport=new rr,D[n]=o),o.matrix.fromArray(r.transform.matrix),o.matrix.decompose(o.position,o.quaternion,o.scale),o.projectionMatrix.fromArray(r.projectionMatrix),o.projectionMatrixInverse.copy(o.projectionMatrix).invert(),o.viewport.set(a.x,a.y,a.width,a.height),n===0&&(O.matrix.copy(o.matrix),O.matrix.decompose(O.position,O.quaternion,O.scale)),i===!0&&O.cameras.push(o)}let a=r.enabledFeatures;if(a&&a.includes(`depth-sensing`)&&r.depthUsage==`gpu-optimized`&&m){u=n.getBinding();let e=u.getDepthInformation(t[0]);e&&e.isValid&&e.texture&&h.init(e,r.renderState)}if(a&&a.includes(`camera-access`)&&m){e.state.unbindTexture(),u=n.getBinding();for(let e=0;e<t.length;e++){let n=t[e].camera;if(n){let e=g[n];e||(e=new Pa,g[n]=e);let t=u.getCameraImage(n);e.sourceTexture=t}}}}for(let e=0;e<b.length;e++){let t=x[e],n=b[e];t!==null&&n!==void 0&&n.update(t,i,c||a)}F&&F(t,i),i.detectedPlanes&&n.dispatchEvent({type:`planesdetected`,data:i}),p=null}let ne=new hs;ne.setAnimationLoop(te),this.setAnimationLoop=function(e){F=e},this.dispose=function(){}}},_u=new cr,vu=new Y;vu.set(-1,0,0,0,1,0,0,0,1);function yu(e,t){function n(e,t){e.matrixAutoUpdate===!0&&e.updateMatrix(),t.value.copy(e.matrix)}function r(t,n){n.color.getRGB(t.fogColor.value,Wa(e)),n.isFog?(t.fogNear.value=n.near,t.fogFar.value=n.far):n.isFogExp2&&(t.fogDensity.value=n.density)}function i(e,t,n,r,i){t.isNodeMaterial?t.uniformsNeedUpdate=!1:t.isMeshBasicMaterial?a(e,t):t.isMeshLambertMaterial?(a(e,t),t.envMap&&(e.envMapIntensity.value=t.envMapIntensity)):t.isMeshToonMaterial?(a(e,t),d(e,t)):t.isMeshPhongMaterial?(a(e,t),u(e,t),t.envMap&&(e.envMapIntensity.value=t.envMapIntensity)):t.isMeshStandardMaterial?(a(e,t),f(e,t),t.isMeshPhysicalMaterial&&p(e,t,i)):t.isMeshMatcapMaterial?(a(e,t),m(e,t)):t.isMeshDepthMaterial?a(e,t):t.isMeshDistanceMaterial?(a(e,t),h(e,t)):t.isMeshNormalMaterial?a(e,t):t.isLineBasicMaterial?(o(e,t),t.isLineDashedMaterial&&s(e,t)):t.isPointsMaterial?c(e,t,n,r):t.isSpriteMaterial?l(e,t):t.isShadowMaterial?(e.color.value.copy(t.color),e.opacity.value=t.opacity):t.isShaderMaterial&&(t.uniformsNeedUpdate=!1)}function a(e,r){e.opacity.value=r.opacity,r.color&&e.diffuse.value.copy(r.color),r.emissive&&e.emissive.value.copy(r.emissive).multiplyScalar(r.emissiveIntensity),r.map&&(e.map.value=r.map,n(r.map,e.mapTransform)),r.alphaMap&&(e.alphaMap.value=r.alphaMap,n(r.alphaMap,e.alphaMapTransform)),r.bumpMap&&(e.bumpMap.value=r.bumpMap,n(r.bumpMap,e.bumpMapTransform),e.bumpScale.value=r.bumpScale,r.side===1&&(e.bumpScale.value*=-1)),r.normalMap&&(e.normalMap.value=r.normalMap,n(r.normalMap,e.normalMapTransform),e.normalScale.value.copy(r.normalScale),r.side===1&&e.normalScale.value.negate()),r.displacementMap&&(e.displacementMap.value=r.displacementMap,n(r.displacementMap,e.displacementMapTransform),e.displacementScale.value=r.displacementScale,e.displacementBias.value=r.displacementBias),r.emissiveMap&&(e.emissiveMap.value=r.emissiveMap,n(r.emissiveMap,e.emissiveMapTransform)),r.specularMap&&(e.specularMap.value=r.specularMap,n(r.specularMap,e.specularMapTransform)),r.alphaTest>0&&(e.alphaTest.value=r.alphaTest);let i=t.get(r),a=i.envMap,o=i.envMapRotation;a&&(e.envMap.value=a,e.envMapRotation.value.setFromMatrix4(_u.makeRotationFromEuler(o)).transpose(),a.isCubeTexture&&a.isRenderTargetTexture===!1&&e.envMapRotation.value.premultiply(vu),e.reflectivity.value=r.reflectivity,e.ior.value=r.ior,e.refractionRatio.value=r.refractionRatio),r.lightMap&&(e.lightMap.value=r.lightMap,e.lightMapIntensity.value=r.lightMapIntensity,n(r.lightMap,e.lightMapTransform)),r.aoMap&&(e.aoMap.value=r.aoMap,e.aoMapIntensity.value=r.aoMapIntensity,n(r.aoMap,e.aoMapTransform))}function o(e,t){e.diffuse.value.copy(t.color),e.opacity.value=t.opacity,t.map&&(e.map.value=t.map,n(t.map,e.mapTransform))}function s(e,t){e.dashSize.value=t.dashSize,e.totalSize.value=t.dashSize+t.gapSize,e.scale.value=t.scale}function c(e,t,r,i){e.diffuse.value.copy(t.color),e.opacity.value=t.opacity,e.size.value=t.size*r,e.scale.value=i*.5,t.map&&(e.map.value=t.map,n(t.map,e.uvTransform)),t.alphaMap&&(e.alphaMap.value=t.alphaMap,n(t.alphaMap,e.alphaMapTransform)),t.alphaTest>0&&(e.alphaTest.value=t.alphaTest)}function l(e,t){e.diffuse.value.copy(t.color),e.opacity.value=t.opacity,e.rotation.value=t.rotation,t.map&&(e.map.value=t.map,n(t.map,e.mapTransform)),t.alphaMap&&(e.alphaMap.value=t.alphaMap,n(t.alphaMap,e.alphaMapTransform)),t.alphaTest>0&&(e.alphaTest.value=t.alphaTest)}function u(e,t){e.specular.value.copy(t.specular),e.shininess.value=Math.max(t.shininess,1e-4)}function d(e,t){t.gradientMap&&(e.gradientMap.value=t.gradientMap)}function f(e,t){e.metalness.value=t.metalness,t.metalnessMap&&(e.metalnessMap.value=t.metalnessMap,n(t.metalnessMap,e.metalnessMapTransform)),e.roughness.value=t.roughness,t.roughnessMap&&(e.roughnessMap.value=t.roughnessMap,n(t.roughnessMap,e.roughnessMapTransform)),t.envMap&&(e.envMapIntensity.value=t.envMapIntensity)}function p(e,t,r){e.ior.value=t.ior,t.diffuseRoughness>0&&(e.diffuseRoughness.value=t.diffuseRoughness,t.diffuseRoughnessMap&&(e.diffuseRoughnessMap.value=t.diffuseRoughnessMap,n(t.diffuseRoughnessMap,e.diffuseRoughnessMapTransform))),t.sheen>0&&(e.sheenColor.value.copy(t.sheenColor).multiplyScalar(t.sheen),e.sheenRoughness.value=t.sheenRoughness,t.sheenColorMap&&(e.sheenColorMap.value=t.sheenColorMap,n(t.sheenColorMap,e.sheenColorMapTransform)),t.sheenRoughnessMap&&(e.sheenRoughnessMap.value=t.sheenRoughnessMap,n(t.sheenRoughnessMap,e.sheenRoughnessMapTransform))),t.clearcoat>0&&(e.clearcoat.value=t.clearcoat,e.clearcoatRoughness.value=t.clearcoatRoughness,t.clearcoatMap&&(e.clearcoatMap.value=t.clearcoatMap,n(t.clearcoatMap,e.clearcoatMapTransform)),t.clearcoatRoughnessMap&&(e.clearcoatRoughnessMap.value=t.clearcoatRoughnessMap,n(t.clearcoatRoughnessMap,e.clearcoatRoughnessMapTransform)),t.clearcoatNormalMap&&(e.clearcoatNormalMap.value=t.clearcoatNormalMap,n(t.clearcoatNormalMap,e.clearcoatNormalMapTransform),e.clearcoatNormalScale.value.copy(t.clearcoatNormalScale),t.side===1&&e.clearcoatNormalScale.value.negate())),t.dispersion>0&&(e.dispersion.value=t.dispersion),t.retroreflectivity>0&&(e.retroreflectivity.value=t.retroreflectivity),t.iridescence>0&&(e.iridescence.value=t.iridescence,e.iridescenceIOR.value=t.iridescenceIOR,e.iridescenceThicknessMinimum.value=t.iridescenceThicknessMinimum,e.iridescenceThicknessMaximum.value=t.iridescenceThicknessMaximum,t.iridescenceMap&&(e.iridescenceMap.value=t.iridescenceMap,n(t.iridescenceMap,e.iridescenceMapTransform)),t.iridescenceThicknessMap&&(e.iridescenceThicknessMap.value=t.iridescenceThicknessMap,n(t.iridescenceThicknessMap,e.iridescenceThicknessMapTransform))),t.transmission>0&&(e.transmission.value=t.transmission,e.transmissionSamplerMap.value=r.texture,e.transmissionSamplerSize.value.set(r.width,r.height),t.transmissionMap&&(e.transmissionMap.value=t.transmissionMap,n(t.transmissionMap,e.transmissionMapTransform)),e.thickness.value=t.thickness,t.thicknessMap&&(e.thicknessMap.value=t.thicknessMap,n(t.thicknessMap,e.thicknessMapTransform)),e.attenuationDistance.value=t.attenuationDistance,e.attenuationColor.value.copy(t.attenuationColor)),t.anisotropy>0&&(e.anisotropyVector.value.set(t.anisotropy*Math.cos(t.anisotropyRotation),t.anisotropy*Math.sin(t.anisotropyRotation)),t.anisotropyMap&&(e.anisotropyMap.value=t.anisotropyMap,n(t.anisotropyMap,e.anisotropyMapTransform))),e.specularIntensity.value=t.specularIntensity,e.specularColor.value.copy(t.specularColor),t.specularColorMap&&(e.specularColorMap.value=t.specularColorMap,n(t.specularColorMap,e.specularColorMapTransform)),t.specularIntensityMap&&(e.specularIntensityMap.value=t.specularIntensityMap,n(t.specularIntensityMap,e.specularIntensityMapTransform))}function m(e,t){t.matcap&&(e.matcap.value=t.matcap)}function h(e,n){let r=t.get(n).light;e.referencePosition.value.setFromMatrixPosition(r.matrixWorld),e.nearDistance.value=r.shadow.camera.near,e.farDistance.value=r.shadow.camera.far}return{refreshFogUniforms:r,refreshMaterialUniforms:i}}function bu(e,t,n,r){let i={},a={};function o(e,t){let n=t.program;r.uniformBlockBinding(e,n,i[e.id])}function s(e,n){let o=i[e.id];o===void 0&&(m(e),o=c(e),i[e.id]=o,e.addEventListener(`dispose`,g));let s=n.program;r.updateUBOMapping(e,s);let u=t.render.frame;a[e.id]!==u&&(l(e),a[e.id]=u)}function c(t){let n=e.createBuffer(),r=t.__size,i=t.usage;return e.bindBuffer(e.UNIFORM_BUFFER,n),e.bufferData(e.UNIFORM_BUFFER,r,i),e.bindBuffer(e.UNIFORM_BUFFER,null),n}function l(t){let n=i[t.id],r=t.uniforms,a=t.__cache;e.bindBuffer(e.UNIFORM_BUFFER,n);for(let e=0,t=r.length;e<t;e++){let t=r[e];if(Array.isArray(t))for(let n=0,r=t.length;n<r;n++)u(t[n],e,n,a);else u(t,e,0,a)}e.bindBuffer(e.UNIFORM_BUFFER,null)}function u(t,n,r,i){if(f(t,n,r,i)===!0){let n=t.__offset,r=t.value;if(Array.isArray(r)){let e=0;for(let n=0;n<r.length;n++){let i=r[n],a=h(i,!0);d(i,t.__data,e),e+=a.storage/Float32Array.BYTES_PER_ELEMENT}}else d(r,t.__data,0);e.bufferSubData(e.UNIFORM_BUFFER,n,t.__data)}}function d(e,t,n){typeof e==`number`||typeof e==`boolean`?t[n]=e:e.isMatrix3?(t[n]=e.elements[0],t[n+1]=e.elements[1],t[n+2]=e.elements[2],t[n+3]=0,t[n+4]=e.elements[3],t[n+5]=e.elements[4],t[n+6]=e.elements[5],t[n+7]=0,t[n+8]=e.elements[6],t[n+9]=e.elements[7],t[n+10]=e.elements[8],t[n+11]=0):ArrayBuffer.isView(e)?t.set(e.subarray(0,t.length-n),n):e.toArray(t,n)}function f(e,t,n,r){let i=e.value,a=t+`_`+n;if(Array.isArray(i)){r[a]===void 0&&(r[a]=[]);let e=r[a],t=!1;for(let n=0;n<i.length;n++)p(i[n],e,n)===!0&&(t=!0);return t}return p(i,r,a)}function p(e,t,n){if(t[n]===void 0)return t[n]=typeof e==`number`||typeof e==`boolean`?e:ArrayBuffer.isView(e)?e.slice():e.clone(),!0;{let r=t[n];if(typeof e==`number`||typeof e==`boolean`){if(r!==e)return t[n]=e,!0}else if(ArrayBuffer.isView(e))return!0;else if(r.equals(e)===!1)return r.copy(e),!0}return!1}function m(e){let t=e.uniforms,n=0;for(let e=0,r=t.length;e<r;e++){let r=Array.isArray(t[e])?t[e]:[t[e]];for(let i=0,a=r.length;i<a;i++){let a=r[i],o=Array.isArray(a.value)?a.value:[a.value],s=Array.isArray(t[e])||Array.isArray(a.value),c=n;for(let e=0,t=o.length;e<t;e++){let t=o[e],r=h(t,s),i=n%16,a=i%r.boundary,l=i+a;n+=a,l!==0&&16-l<r.storage&&(n+=16-l),e===0&&(c=n),n+=r.storage}a.__data=new(a.type===`int`?Int32Array:a.type===`uint`?Uint32Array:Float32Array)((n-c)/Float32Array.BYTES_PER_ELEMENT),a.__offset=c}}let r=n%16;return r>0&&(n+=16-r),e.__size=n,e.__cache={},this}function h(e,t){let n={boundary:0,storage:0};return typeof e==`number`||typeof e==`boolean`?(n.boundary=4,n.storage=4):e.isVector2?(n.boundary=8,n.storage=8):e.isVector3||e.isColor?(n.boundary=16,n.storage=12):e.isVector4?(n.boundary=16,n.storage=16):e.isMatrix3?(n.boundary=16,n.storage=48):e.isMatrix4?(n.boundary=16,n.storage=64):e.isTexture?W(`WebGLRenderer: Texture samplers can not be part of an uniforms group.`):ArrayBuffer.isView(e)?(n.boundary=16,n.storage=e.byteLength):W(`WebGLRenderer: Unsupported uniform value type.`,e),t===!0&&(n.boundary=16,n.storage=Math.ceil(n.storage/16)*16),n}function g(t){let n=t.target;n.removeEventListener(`dispose`,g),e.deleteBuffer(i[n.id]),delete i[n.id],delete a[n.id]}function _(){for(let t in i)e.deleteBuffer(i[t]);i={},a={}}return{bind:o,update:s,dispose:_}}var xu=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]),Su=null;function Cu(){return Su===null&&(Su=new ha(xu,16,16,et,Ve),Su.name=`DFG_LUT`,Su.minFilter=U,Su.magFilter=U,Su.wrapS=De,Su.wrapT=De,Su.generateMipmaps=!1,Su.needsUpdate=!0),Su}var wu=class{constructor(e={}){let{canvas:t=an(),context:n=null,depth:r=!0,stencil:i=!1,alpha:a=!1,antialias:o=!1,premultipliedAlpha:s=!0,preserveDrawingBuffer:c=!1,powerPreference:l=`default`,failIfMajorPerformanceCaveat:u=!1,reversedDepthBuffer:d=!1,outputBufferType:f=Pe}=e;this.isWebGLRenderer=!0;let p;if(n!==null){if(typeof WebGLRenderingContext<`u`&&n instanceof WebGLRenderingContext)throw Error(`THREE.WebGLRenderer: WebGL 1 is not supported since r163.`);p=n.getContextAttributes().alpha}else p=a;let m=f,h=new Set([nt,tt,$e]),g=new Set([Pe,ze,Le,We,He,Ue]),_=new Uint32Array(4),v=new Int32Array(4),y={textures:[],min:[],max:[],resolution:[]},b=null,x=null,S=[],C=[],w=null;this.domElement=t,this.debug={checkShaderErrors:!0,diagnostics:{keywords:!1},onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=0,this.toneMappingExposure=1,this.transmissionResolutionScale=1;let T=this,E=!1,D=null,O=null,k=null,A=null;this._outputColorSpace=qt;let j=0,M=0,N=null,ee=-1,P=null,F=new rr,te=new rr,ne=null,re=new Z(0),ie=0,ae=t.width,oe=t.height,I=1,se=null,ce=null,L=new rr(0,0,ae,oe),R=new rr(0,0,ae,oe),le=!1,ue=new ba,de=new Sa,fe=!1,pe=!1,me=new cr,he=new J,ge=new rr,_e={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},ve=!1;function ye(){return N===null?I:1}let z=n;function be(e,n){return t.getContext(e,n)}let xe,Se,B,Ce,V,H,we,Te,Ee,De,Oe,ke,Ae,je,U,Me,Fe,Ie,Re,Be,Ge,Ke,qe;try{let e={alpha:!0,depth:r,stencil:i,antialias:o,premultipliedAlpha:s,preserveDrawingBuffer:c,powerPreference:l,failIfMajorPerformanceCaveat:u};if(`setAttribute`in t&&t.setAttribute(`data-engine`,`three.js r187`),t.addEventListener(`webglcontextlost`,Xe,!1),t.addEventListener(`webglcontextrestored`,Ze,!1),t.addEventListener(`webglcontextcreationerror`,Qe,!1),z===null){let t=`webgl2`;if(z=be(t,e),z===null)throw be(t)?Error(`THREE.WebGLRenderer: Error creating WebGL context with your selected attributes.`):Error(`THREE.WebGLRenderer: Error creating WebGL context.`)}Je()}catch(e){throw t.removeEventListener(`webglcontextlost`,Xe,!1),t.removeEventListener(`webglcontextrestored`,Ze,!1),t.removeEventListener(`webglcontextcreationerror`,Qe,!1),G(`WebGLRenderer: `+e.message),e}function Je(){xe=new Ws(z),xe.init(),Ge=new fu(z,xe),Se=new ws(z,xe,e,Ge),B=new uu(z,xe),Se.reversedDepthBuffer&&d&&B.buffers.depth.setReversed(!0),O=z.createFramebuffer(),k=z.createFramebuffer(),A=z.createFramebuffer(),Ce=new qs(z),V=new Wl,H=new du(z,xe,B,V,Se,Ge,Ce),we=new Us(T),Te=new gs(z),Ke=new Ss(z,Te),Ee=new Gs(z,Te,Ce,Ke),De=new Ys(z,Ee,Te,Ke,Ce),Ie=new Js(z,Se,H),U=new Ts(V),Oe=new Ul(T,we,xe,Se,Ke,U),ke=new yu(T,V),Ae=new Jl,je=new tu(xe),Fe=new xs(T,we,B,De,p,s),Me=new lu(T,De,Se),qe=new bu(z,Ce,Se,B),Re=new Cs(z,xe,Ce),Be=new Ks(z,xe,Ce),Ce.programs=Oe.programs,T.capabilities=Se,T.extensions=xe,T.properties=V,T.renderLists=Ae,T.shadowMap=Me,T.state=B,T.info=Ce}m!==1009&&(w=new Zs(m,t.width,t.height,o,r,i));let Ye=new gu(T,z);this.xr=Ye,this.getContext=function(){return z},this.getContextAttributes=function(){return z.getContextAttributes()},this.forceContextLoss=function(){let e=xe.get(`WEBGL_lose_context`);e&&e.loseContext()},this.forceContextRestore=function(){let e=xe.get(`WEBGL_lose_context`);e&&e.restoreContext()},this.getPixelRatio=function(){return I},this.setPixelRatio=function(e){e!==void 0&&(I=e,this.setSize(ae,oe,!1))},this.getSize=function(e){return e.set(ae,oe)},this.setSize=function(e,n,r=!0){Ye.isPresenting?W(`WebGLRenderer: Can't change size while VR device is presenting.`):(ae=e,oe=n,t.width=Math.floor(e*I),t.height=Math.floor(n*I),r===!0&&(t.style.width=e+`px`,t.style.height=n+`px`),w!==null&&w.setSize(t.width,t.height),this.setViewport(0,0,e,n))},this.getDrawingBufferSize=function(e){return e.set(ae*I,oe*I).floor()},this.setDrawingBufferSize=function(e,n,r){ae=e,oe=n,I=r,t.width=Math.floor(e*r),t.height=Math.floor(n*r),this.setViewport(0,0,e,n)},this.setEffects=function(e){if(m===1009)G(`WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.`);else{if(e){for(let t=0;t<e.length;t++)if(e[t].isOutputPass===!0){W(`WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.`);break}}w.setEffects(e||[])}},this.getCurrentViewport=function(e){return e.copy(F)},this.getViewport=function(e){return e.copy(L)},this.setViewport=function(e,t,n,r){e.isVector4?L.set(e.x,e.y,e.z,e.w):L.set(e,t,n,r),B.viewport(F.copy(L).multiplyScalar(ye()).round())},this.getScissor=function(e){return e.copy(R)},this.setScissor=function(e,t,n,r){e.isVector4?R.set(e.x,e.y,e.z,e.w):R.set(e,t,n,r),B.scissor(te.copy(R).multiplyScalar(ye()).round())},this.getScissorTest=function(){return le},this.setScissorTest=function(e){B.setScissorTest(le=e)},this.setOpaqueSort=function(e){se=e},this.setTransparentSort=function(e){ce=e},this.getClearColor=function(e){return e.copy(Fe.getClearColor())},this.setClearColor=function(){Fe.setClearColor(...arguments)},this.getClearAlpha=function(){return Fe.getClearAlpha()},this.setClearAlpha=function(){Fe.setClearAlpha(...arguments)},this.clear=function(e=!0,t=!0,n=!0){let r=0;if(e){let e=!1;if(N!==null){let t=N.texture.format;e=h.has(t)}if(e){let e=N.texture.type,t=g.has(e),n=Fe.getClearColor(),r=Fe.getClearAlpha(),i=n.r,a=n.g,o=n.b;t?(_[0]=i,_[1]=a,_[2]=o,_[3]=r,z.clearBufferuiv(z.COLOR,0,_)):(v[0]=i,v[1]=a,v[2]=o,v[3]=r,z.clearBufferiv(z.COLOR,0,v))}else r|=z.COLOR_BUFFER_BIT}t&&(r|=z.DEPTH_BUFFER_BIT,this.state.buffers.depth.setMask(!0)),n&&(r|=z.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),r!==0&&z.clear(r)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.setNodesHandler=function(e){e.setRenderer(this),D=e},this.dispose=function(){t.removeEventListener(`webglcontextlost`,Xe,!1),t.removeEventListener(`webglcontextrestored`,Ze,!1),t.removeEventListener(`webglcontextcreationerror`,Qe,!1),Fe.dispose(),Ae.dispose(),je.dispose(),H.dispose(),V.dispose(),we.dispose(),De.dispose(),Ee.dispose(),Ke.dispose(),qe.dispose(),Oe.dispose(),Ye.dispose(),Ye.removeEventListener(`sessionstart`,ct),Ye.removeEventListener(`sessionend`,lt),ut.stop()};function Xe(e){e.preventDefault(),sn(`WebGLRenderer: Context Lost.`),E=!0}function Ze(){sn(`WebGLRenderer: Context Restored.`),E=!1;let e=Ce.autoReset,t=Me.enabled,n=Me.autoUpdate,r=Me.needsUpdate,i=Me.type;Je(),Ce.autoReset=e,Me.enabled=t,Me.autoUpdate=n,Me.needsUpdate=r,Me.type=i}function Qe(e){G(`WebGLRenderer: A WebGL context could not be created. Reason: `,e.statusMessage)}function et(e){let t=e.target;t.removeEventListener(`dispose`,et),rt(t)}function rt(e){it(e),V.remove(e)}function it(e){let t=V.get(e).programs;t!==void 0&&(t.forEach(function(e){Oe.releaseProgram(e)}),e.isShaderMaterial&&Oe.releaseShaderCache(e))}this.renderBufferDirect=function(e,t,n,r,i,a){t===null&&(t=_e);let o=i.isMesh&&i.matrixWorld.determinantAffine()<0,s=xt(e,t,n,r,i);B.setMaterial(r,o);let c=n.index,l=1;if(r.wireframe===!0){if(c=Ee.getWireframeAttribute(n),c===void 0)return;l=2}let u=n.drawRange,d=n.attributes.position,f=u.start*l,p=(u.start+u.count)*l;a!==null&&(f=Math.max(f,a.start*l),p=Math.min(p,(a.start+a.count)*l)),c===null?d!=null&&(f=Math.max(f,0),p=Math.min(p,d.count)):(f=Math.max(f,0),p=Math.min(p,c.count));let m=p-f;if(m<0||m===1/0)return;Ke.setup(i,r,s,n,c);let h,g=Re;if(c!==null&&(h=Te.get(c),g=Be,g.setIndex(h)),i.isMesh)r.wireframe===!0?(B.setLineWidth(r.wireframeLinewidth*ye()),g.setMode(z.LINES)):g.setMode(z.TRIANGLES);else if(i.isLine){let e=r.linewidth;e===void 0&&(e=1),B.setLineWidth(e*ye()),i.isLineSegments?g.setMode(z.LINES):i.isLineLoop?g.setMode(z.LINE_LOOP):g.setMode(z.LINE_STRIP)}else i.isPoints?g.setMode(z.POINTS):i.isSprite&&g.setMode(z.TRIANGLES);if(i.isBatchedMesh){if(xe.get(`WEBGL_multi_draw`))g.renderMultiDraw(i._multiDrawStarts,i._multiDrawCounts,i._multiDrawCount);else{let e=i._multiDrawStarts,t=i._multiDrawCounts,n=i._multiDrawCount,a=c?Te.get(c).bytesPerElement:1,o=V.get(r).currentProgram.getUniforms();for(let r=0;r<n;r++)o.setValue(z,`_gl_DrawID`,r),g.render(e[r]/a,t[r])}}else if(i.isInstancedMesh)g.renderInstances(f,m,i.count);else if(n.isInstancedBufferGeometry){let e=n._maxInstanceCount===void 0?1/0:n._maxInstanceCount,t=Math.min(n.instanceCount,e);g.renderInstances(f,m,t)}else g.render(f,m)};function at(e,t,n,r){D!==null&&e.isNodeMaterial&&D.setObject(r,e),fe===!0&&U.setState(e,n,!1),e.transparent===!0&&e.side===2&&e.forceSinglePass===!1?(e.side=1,e.needsUpdate=!0,_t(e,t,r),e.side=0,e.needsUpdate=!0,_t(e,t,r),e.side=2):_t(e,t,r)}this.compile=function(e,t,n=null){n===null&&(n=e),D!==null&&D.renderStart(e,t,n),x=je.get(n),x.init(t),C.push(x),n.traverseVisible(function(e){e.isLight&&e.layers.test(t.layers)&&(x.pushLight(e),e.castShadow&&x.pushShadow(e))}),e!==n&&e.traverseVisible(function(e){e.isLight&&e.layers.test(t.layers)&&(x.pushLight(e),e.castShadow&&x.pushShadow(e))}),x.setupLights(),D!==null&&D.updateLights(x.state.lightsArray),pe=this.localClippingEnabled,fe=U.init(this.clippingPlanes,pe),fe===!0&&U.setGlobalState(this.clippingPlanes,t),D!==null&&Me.render(x.state.shadowsArray,n,t);let r=new Set;return e.traverse(function(e){if(!(e.isMesh||e.isPoints||e.isLine||e.isSprite))return;let i=e.material;if(i){if(Array.isArray(i))for(let a=0;a<i.length;a++){let o=i[a];at(o,n,t,e),r.add(o)}else at(i,n,t,e),r.add(i)}}),x=C.pop(),D!==null&&D.renderEnd(),r},this.compileAsync=function(e,t,n=null){let r=this.compile(e,t,n);return new Promise(t=>{function n(){r.forEach(function(e){let t=V.get(e).currentProgram;(t===void 0||t.isReady())&&r.delete(e)}),r.size===0?t(e):setTimeout(n,10)}xe.get(`KHR_parallel_shader_compile`)===null?setTimeout(n,10):n()})};let ot=null;function st(e){ot&&ot(e)}function ct(){ut.stop()}function lt(){ut.start()}let ut=new hs;ut.setAnimationLoop(st),typeof self<`u`&&ut.setContext(self),this.setAnimationLoop=function(e){ot=e,Ye.setAnimationLoop(e),e===null?ut.stop():ut.start()},Ye.addEventListener(`sessionstart`,ct),Ye.addEventListener(`sessionend`,lt),this.render=function(e,t){if(t!==void 0&&t.isCamera!==!0){G(`WebGLRenderer.render: camera is not an instance of THREE.Camera.`);return}if(E===!0)return;D!==null&&D.renderStart(e,t);let n=Ye.enabled===!0&&Ye.isPresenting===!0,r=w!==null&&(N===null||n)&&w.begin(T,N);if(e.matrixWorldAutoUpdate===!0&&e.updateMatrixWorld(),t.parent===null&&t.matrixWorldAutoUpdate===!0&&t.updateMatrixWorld(),Ye.enabled===!0&&Ye.isPresenting===!0&&(w===null||w.isCompositing()===!1)&&(Ye.cameraAutoUpdate===!0&&Ye.updateCamera(t),t=Ye.getCamera()),e.isScene===!0&&e.onBeforeRender(T,e,t,N),x=je.get(e,C.length),x.init(t),x.state.textureUnits=H.getTextureUnits(),C.push(x),me.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),t.isArrayCamera?de.setFromArrayCamera(t):ue.setFromProjectionMatrix(me,en,t.reversedDepth),pe=this.localClippingEnabled,fe=U.init(this.clippingPlanes,pe),b=Ae.get(e,S.length),b.init(),S.push(b),this.info.render.frame++,Ye.enabled===!0&&Ye.isPresenting===!0){let e=T.xr.getDepthSensingMesh();e!==null&&dt(e,t,-1/0,T.sortObjects)}dt(e,t,0,T.sortObjects),b.finish(),D!==null&&D.updateLights(x.state.lightsArray),T.sortObjects===!0&&b.sort(se,ce),ve=Ye.enabled===!1||Ye.isPresenting===!1||Ye.hasDepthSensing()===!1,ve&&Fe.addToRenderList(b,e),this.info.autoReset===!0&&this.info.reset(),fe===!0&&U.beginShadows();let i=x.state.shadowsArray;if(Me.render(i,e,t),fe===!0&&U.endShadows(),(r&&w.hasRenderPass())===!1){let n=b.opaque,r=b.transmissive;if(x.setupLights(),t.isArrayCamera){let i=t.cameras;if(r.length>0)for(let t=0,a=i.length;t<a;t++){let a=i[t];pt(n,r,e,a)}ve&&Fe.render(e);for(let t=0,n=i.length;t<n;t++){let n=i[t];ft(b,e,n,n.viewport)}}else r.length>0&&pt(n,r,e,t),ve&&Fe.render(e),ft(b,e,t)}N!==null&&M===0&&(H.updateMultisampleRenderTarget(N),H.updateRenderTargetMipmap(N)),r&&w.end(T),e.isScene===!0&&e.onAfterRender(T,e,t),Ke.resetDefaultState(),ee=-1,P=null,C.pop(),C.length>0?(x=C[C.length-1],H.setTextureUnits(x.state.textureUnits),fe===!0&&U.setGlobalState(T.clippingPlanes,x.state.camera)):x=null,S.pop(),b=S.length>0?S[S.length-1]:null,D!==null&&D.renderEnd()};function dt(e,t,n,r){if(e.visible===!1)return;if(e.layers.test(t.layers)){if(e.isGroup)n=e.renderOrder;else if(e.isLOD)e.autoUpdate===!0&&e.update(t);else if(e.isLight)x.pushLight(e),e.castShadow&&x.pushShadow(e);else if(e.isSprite){let i=t.isArrayCamera?de:ue;if(!e.frustumCulled||e.intersectsFrustum(i)){r&&ge.setFromMatrixPosition(e.matrixWorld).applyMatrix4(me);let i=De.update(e),a=e.material;a.visible&&b.push(e,i,a,n,ge.z,null,t)}}else if(e.isMesh||e.isLine||e.isPoints){let i=t.isArrayCamera?de:ue;if(!e.frustumCulled||e.intersectsFrustum(i)){let i=De.update(e),a=e.material;if(r&&(e.boundingSphere===void 0?(i.boundingSphere===null&&i.computeBoundingSphere(),ge.copy(i.boundingSphere.center)):(e.boundingSphere===null&&e.computeBoundingSphere(),ge.copy(e.boundingSphere.center)),ge.applyMatrix4(e.matrixWorld).applyMatrix4(me)),Array.isArray(a)){let r=i.groups;for(let o=0,s=r.length;o<s;o++){let s=r[o],c=a[s.materialIndex];c&&c.visible&&b.push(e,i,c,n,ge.z,s,t)}}else a.visible&&b.push(e,i,a,n,ge.z,null,t)}}}let i=e.children;for(let e=0,a=i.length;e<a;e++)dt(i[e],t,n,r)}function ft(e,t,n,r){let{opaque:i,transmissive:a,transparent:o}=e;x.setupLightsView(n),fe===!0&&U.setGlobalState(T.clippingPlanes,n),r&&B.viewport(F.copy(r)),i.length>0&&mt(i,t,n),a.length>0&&mt(a,t,n),o.length>0&&mt(o,t,n),B.buffers.depth.setTest(!0),B.buffers.depth.setMask(!0),B.buffers.color.setMask(!0),B.setPolygonOffset(!1)}function pt(e,t,n,r){if((n.isScene===!0?n.overrideMaterial:null)!==null)return;if(x.state.transmissionRenderTarget[r.id]===void 0){let e=xe.has(`EXT_color_buffer_half_float`)||xe.has(`EXT_color_buffer_float`);x.state.transmissionRenderTarget[r.id]=new ar(1,1,{generateMipmaps:!0,type:e?Ve:Pe,minFilter:Ne,samples:Math.max(4,Se.samples),stencilBuffer:i,resolveDepthBuffer:!1,resolveStencilBuffer:!1,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,colorSpace:X.workingColorSpace})}let a=x.state.transmissionRenderTarget[r.id],o=r.viewport||F;a.setSize(o.z*T.transmissionResolutionScale,o.w*T.transmissionResolutionScale);let s=T.getRenderTarget(),c=T.getActiveCubeFace(),l=T.getActiveMipmapLevel();T.setRenderTarget(a),T.getClearColor(re),ie=T.getClearAlpha(),ie<1&&T.setClearColor(16777215,.5),T.clear(),ve&&Fe.render(n);let u=T.toneMapping;T.toneMapping=0;let d=r.viewport;if(r.viewport!==void 0&&(r.viewport=void 0),x.setupLightsView(r),fe===!0&&U.setGlobalState(T.clippingPlanes,r),mt(e,n,r),H.updateMultisampleRenderTarget(a),H.updateRenderTargetMipmap(a),xe.has(`WEBGL_multisampled_render_to_texture`)===!1){let e=!1;for(let i=0,a=t.length;i<a;i++){let{object:a,geometry:o,material:s,group:c}=t[i];if(s.side===2&&a.layers.test(r.layers)){let t=s.side;s.side=1,s.needsUpdate=!0,ht(a,n,r,o,s,c),s.side=t,s.needsUpdate=!0,e=!0}}e===!0&&(H.updateMultisampleRenderTarget(a),H.updateRenderTargetMipmap(a))}T.setRenderTarget(s,c,l),T.setClearColor(re,ie),d!==void 0&&(r.viewport=d),T.toneMapping=u}function mt(e,t,n){let r=t.isScene===!0?t.overrideMaterial:null;for(let i=0,a=e.length;i<a;i++){let a=e[i],{object:o,geometry:s,group:c}=a,l=a.material;l.allowOverride===!0&&r!==null&&(l=r),o.layers.test(n.layers)&&ht(o,t,n,s,l,c)}}function ht(e,t,n,r,i,a){D!==null&&i.isNodeMaterial&&D.setObject(e,i),e.onBeforeRender(T,t,n,r,i,a),e.modelViewMatrix.multiplyMatrices(n.matrixWorldInverse,e.matrixWorld),e.normalMatrix.getNormalMatrix(e.modelViewMatrix),i.onBeforeRender(T,t,n,r,e,a),i.transparent===!0&&i.side===2&&i.forceSinglePass===!1?(i.side=1,i.needsUpdate=!0,T.renderBufferDirect(n,t,r,i,e,a),i.side=0,i.needsUpdate=!0,T.renderBufferDirect(n,t,r,i,e,a),i.side=2):T.renderBufferDirect(n,t,r,i,e,a),e.onAfterRender(T,t,n,r,i,a)}function gt(e){let t=0;for(let n of e)n.texture!==null&&t++;return t}function _t(e,t,n){t.isScene!==!0&&(t=_e);let r=V.get(e),i=x.state.lights,a=x.state.shadowsArray,o=i.state.version,s=Oe.getParameters(e,i.state,a,t,n,x.state.lightProbeGridArray),c=Oe.getProgramCacheKey(s),l=r.programs;r.environment=e.isMeshStandardMaterial||e.isMeshLambertMaterial||e.isMeshPhongMaterial?t.environment:null,r.fog=t.fog;let u=e.isMeshStandardMaterial||e.isMeshLambertMaterial&&!e.envMap||e.isMeshPhongMaterial&&!e.envMap;r.envMap=we.get(e.envMap||r.environment,u),r.envMapRotation=r.environment!==null&&e.envMap===null?t.environmentRotation:e.envMapRotation,l===void 0&&(e.addEventListener(`dispose`,et),l=new Map,r.programs=l,r.programVariants=new Map);let d=l.get(c);if(d!==void 0){if(r.currentProgram===d&&r.lightsStateVersion===o)return bt(e,s),d}else s.uniforms=Oe.getUniforms(e),D!==null&&e.isNodeMaterial&&D.build(e,n,s),e.onBeforeCompile(s,T),d=Oe.acquireProgram(s,c),l.set(c,d),r.uniforms=s.uniforms;let f=r.uniforms;return(!e.isShaderMaterial&&!e.isRawShaderMaterial||e.clipping===!0)&&(f.clippingPlanes=U.uniform),bt(e,s),r.needsLights=Ct(e),r.lightsStateVersion=o,r.needsLights&&(f.ambientLightColor.value=i.state.ambient,f.lightProbe.value=i.state.probe,f.sunLights.value=i.state.sun,f.sunLightShadows.value=i.state.sunShadow,f.directionalLights.value=i.state.directional,f.directionalLightShadows.value=i.state.directionalShadow,f.spotLights.value=i.state.spot,f.spotLightShadows.value=i.state.spotShadow,f.rectAreaLights.value=i.state.rectArea,f.ltc_1.value=i.state.rectAreaLTC1,f.ltc_2.value=i.state.rectAreaLTC2,f.pointLights.value=i.state.point,f.pointLightShadows.value=i.state.pointShadow,f.hemisphereLights.value=i.state.hemi,f.sunShadowMatrix.value=i.state.sunShadowMatrix,f.sunShadowCascade.value=i.state.sunShadowCascade,f.directionalShadowMatrix.value=i.state.directionalShadowMatrix,f.spotLightMatrix.value=i.state.spotLightMatrix,f.spotLightMap.value=i.state.spotLightMap,f.pointShadowMatrix.value=i.state.pointShadowMatrix),r.numLightProbeGrids=gt(x.state.lightProbeGridArray),r.currentProgram=d,r.uniformsList=null,d}function vt(e,t,n,r,i){let a=V.get(e),o=a.currentProgram.id+`,`+r+`,`+i,s=a.programVariants.get(o);return s===void 0?(s=_t(e,t,n),a.programVariants.set(o,s)):(a.currentProgram=s,a.uniformsList=null,a.outputColorSpace=r,a.toneMapping=i),s}function yt(e){if(e.uniformsList===null){let t=e.currentProgram.getUniforms();e.uniformsList=ol.seqWithValue(t.seq,e.uniforms)}return e.uniformsList}function bt(e,t){let n=V.get(e);n.outputColorSpace=t.outputColorSpace,n.batching=t.batching,n.batchingColor=t.batchingColor,n.instancing=t.instancing,n.instancingColor=t.instancingColor,n.instancingMorph=t.instancingMorph,n.skinning=t.skinning,n.morphTargets=t.morphTargets,n.morphNormals=t.morphNormals,n.morphColors=t.morphColors,n.morphTargetsCount=t.morphTargetsCount,n.numClippingPlanes=t.numClippingPlanes,n.numIntersection=t.numClipIntersection,n.vertexAlphas=t.vertexAlphas,n.vertexTangents=t.vertexTangents,n.toneMapping=t.toneMapping}function xt(e,t,n,r,i){t.isScene!==!0&&(t=_e),H.resetTextureUnits();let a=t.fog,o=r.isMeshStandardMaterial||r.isMeshLambertMaterial||r.isMeshPhongMaterial?t.environment:null,s=N===null?T.outputColorSpace:N.isXRRenderTarget===!0?N.texture.colorSpace:X.workingColorSpace,c=r.isMeshStandardMaterial||r.isMeshLambertMaterial&&!r.envMap||r.isMeshPhongMaterial&&!r.envMap,l=we.get(r.envMap||o,c),u=r.vertexColors===!0&&!!n.attributes.color&&n.attributes.color.itemSize===4,d=!!n.attributes.tangent&&(!!r.normalMap||r.anisotropy>0),f=!!n.morphAttributes.position,p=!!n.morphAttributes.normal,m=!!n.morphAttributes.color,h=0;r.toneMapped&&(N===null||N.isXRRenderTarget===!0)&&(h=T.toneMapping);let g=n.morphAttributes.position||n.morphAttributes.normal||n.morphAttributes.color,_=g===void 0?0:g.length,v=V.get(r),b=x.state.lights;if(fe===!0&&(pe===!0||e!==P)){let t=e===P&&r.id===ee;U.setState(r,e,t)}let S=!1,C=!1;r.version===v.__version?v.needsLights&&v.lightsStateVersion!==b.state.version||i.isBatchedMesh&&v.batching===!1||!i.isBatchedMesh&&v.batching===!0||i.isBatchedMesh&&v.batchingColor===!0&&i._colorsTexture===null||i.isBatchedMesh&&v.batchingColor===!1&&i._colorsTexture!==null||i.isInstancedMesh&&v.instancing===!1||!i.isInstancedMesh&&v.instancing===!0||i.isSkinnedMesh&&v.skinning===!1||!i.isSkinnedMesh&&v.skinning===!0||i.isInstancedMesh&&v.instancingColor===!0&&i.instanceColor===null||i.isInstancedMesh&&v.instancingColor===!1&&i.instanceColor!==null||i.isInstancedMesh&&v.instancingMorph===!0&&i.morphTexture===null||i.isInstancedMesh&&v.instancingMorph===!1&&i.morphTexture!==null?S=!0:v.envMap===l?r.fog===!0&&v.fog!==a||v.numClippingPlanes!==void 0&&(v.numClippingPlanes!==U.numPlanes||v.numIntersection!==U.numIntersection)?S=!0:v.vertexAlphas===u&&v.vertexTangents===d&&v.morphTargets===f&&v.morphNormals===p&&v.morphColors===m&&v.morphTargetsCount===_&&v.numLightProbeGrids===gt(x.state.lightProbeGridArray)?(v.outputColorSpace!==s||v.toneMapping!==h)&&(C=!0):S=!0:S=!0:(S=!0,v.__version=r.version);let w=v.currentProgram;(S===!0||C===!0)&&(w=C===!0?vt(r,t,i,s,h):_t(r,t,i),D&&r.isNodeMaterial&&D.onUpdateProgram(r,w,v));let E=!1,O=!1,k=!1,A=w.getUniforms(),j=v.uniforms;if(B.useProgram(w.program)&&(E=!0,O=!0,k=!0),r.id!==ee&&(ee=r.id,O=!0),E||P!==e){B.buffers.depth.getReversed()&&e.reversedDepth!==!0&&(e._reversedDepth=!0,e.updateProjectionMatrix()),A.setValue(z,`projectionMatrix`,e.projectionMatrix),A.setValue(z,`viewMatrix`,e.matrixWorldInverse);let t=A.map.cameraPosition;t!==void 0&&t.setValue(z,he.setFromMatrixPosition(e.matrixWorld)),Se.logarithmicDepthBuffer&&A.setValue(z,`logDepthBufFC`,2/(Math.log(e.far+1)/Math.LN2)),(r.isMeshPhongMaterial||r.isMeshToonMaterial||r.isMeshLambertMaterial||r.isMeshBasicMaterial||r.isMeshStandardMaterial||r.isShaderMaterial)&&A.setValue(z,`isOrthographic`,e.isOrthographicCamera===!0),P!==e&&(P=e,O=!0,k=!0)}if(v.needsLights&&(b.state.sunShadowMap.length>0&&A.setValue(z,`sunShadowMap`,b.state.sunShadowMap,H),b.state.directionalShadowMap.length>0&&A.setValue(z,`directionalShadowMap`,b.state.directionalShadowMap,H),b.state.spotShadowMap.length>0&&A.setValue(z,`spotShadowMap`,b.state.spotShadowMap,H),b.state.pointShadowMap.length>0&&A.setValue(z,`pointShadowMap`,b.state.pointShadowMap,H)),i.isSkinnedMesh){A.setOptional(z,i,`bindMatrix`),A.setOptional(z,i,`bindMatrixInverse`);let e=i.skeleton;e&&(e.boneTexture===null&&e.computeBoneTexture(),A.setValue(z,`boneTexture`,e.boneTexture,H))}i.isBatchedMesh&&(A.setOptional(z,i,`batchingTexture`),A.setValue(z,`batchingTexture`,i._matricesTexture,H),A.setOptional(z,i,`batchingIdTexture`),A.setValue(z,`batchingIdTexture`,i._indirectTexture,H),A.setOptional(z,i,`batchingColorTexture`),i._colorsTexture!==null&&A.setValue(z,`batchingColorTexture`,i._colorsTexture,H));let M=n.morphAttributes;if((M.position!==void 0||M.normal!==void 0||M.color!==void 0)&&Ie.update(i,n,w),(O||v.receiveShadow!==i.receiveShadow)&&(v.receiveShadow=i.receiveShadow,A.setValue(z,`receiveShadow`,i.receiveShadow)),(r.isMeshStandardMaterial||r.isMeshLambertMaterial||r.isMeshPhongMaterial)&&r.envMap===null&&t.environment!==null&&(j.envMapIntensity.value=t.environmentIntensity),j.dfgLUT!==void 0&&(j.dfgLUT.value=Cu()),O){if(A.setValue(z,`toneMappingExposure`,T.toneMappingExposure),v.needsLights&&St(j,k),a&&r.fog===!0&&ke.refreshFogUniforms(j,a),ke.refreshMaterialUniforms(j,r,I,oe,x.state.transmissionRenderTarget[e.id]),v.needsLights&&v.numLightProbeGrids>0){let e=y,t=0;for(let n of x.state.lightProbeGridArray)n.texture!==null&&(e.textures[t]=n.texture,e.min[t]=n.boundingBox.min,e.max[t]=n.boundingBox.max,e.resolution[t]=n.resolution,t++);for(let n in e)e[n].length=t;j.probesSH.value=e.textures,j.probesMin.value=e.min,j.probesMax.value=e.max,j.probesResolution.value=e.resolution}ol.upload(z,yt(v),j,H)}if(r.isShaderMaterial&&r.uniformsNeedUpdate===!0&&(ol.upload(z,yt(v),j,H),r.uniformsNeedUpdate=!1),r.isSpriteMaterial&&A.setValue(z,`center`,i.center),A.setValue(z,`modelViewMatrix`,i.modelViewMatrix),A.setValue(z,`normalMatrix`,i.normalMatrix),A.setValue(z,`modelMatrix`,i.matrixWorld),r.uniformsGroups!==void 0){let e=r.uniformsGroups;for(let t=0,n=e.length;t<n;t++){let n=e[t];qe.update(n,w),qe.bind(n,w)}}return w}function St(e,t){e.ambientLightColor.needsUpdate=t,e.lightProbe.needsUpdate=t,e.sunLights.needsUpdate=t,e.sunLightShadows.needsUpdate=t,e.directionalLights.needsUpdate=t,e.directionalLightShadows.needsUpdate=t,e.pointLights.needsUpdate=t,e.pointLightShadows.needsUpdate=t,e.spotLights.needsUpdate=t,e.spotLightShadows.needsUpdate=t,e.rectAreaLights.needsUpdate=t,e.hemisphereLights.needsUpdate=t}function Ct(e){return e.isMeshLambertMaterial||e.isMeshToonMaterial||e.isMeshPhongMaterial||e.isMeshStandardMaterial||e.isShadowMaterial||e.isShaderMaterial&&e.lights===!0}this.getActiveCubeFace=function(){return j},this.getActiveMipmapLevel=function(){return M},this.getRenderTarget=function(){return N},this.setRenderTargetTextures=function(e,t,n){let r=V.get(e);r.__autoAllocateDepthBuffer=e.resolveDepthBuffer===!1,r.__autoAllocateDepthBuffer===!1&&(r.__useRenderToTexture=!1),V.get(e.texture).__webglTexture=t,V.get(e.depthTexture).__webglTexture=r.__autoAllocateDepthBuffer?void 0:n,r.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(e,t){let n=V.get(e);n.__webglFramebuffer=t,n.__useDefaultFramebuffer=t===void 0},this.setRenderTarget=function(e,t=0,n=0){N=e,j=t,M=n;let r=null,i=!1,a=!1;if(e){let o=V.get(e);if(o.__useDefaultFramebuffer!==void 0){B.bindFramebuffer(z.FRAMEBUFFER,o.__webglFramebuffer),F.copy(e.viewport),te.copy(e.scissor),ne=e.scissorTest,B.viewport(F),B.scissor(te),B.setScissorTest(ne),ee=-1;return}if(o.__webglFramebuffer===void 0)H.setupRenderTarget(e);else if(o.__hasExternalTextures)H.rebindTextures(e,V.get(e.texture).__webglTexture,V.get(e.depthTexture).__webglTexture);else if(e.depthBuffer){let t=e.depthTexture;if(o.__boundDepthTexture!==t){if(t!==null&&V.has(t)&&(e.width!==t.image.width||e.height!==t.image.height))throw Error(`THREE.WebGLRenderer: Attached DepthTexture is initialized to the incorrect size.`);H.setupDepthRenderbuffer(e)}}let s=e.texture;(s.isData3DTexture||s.isDataArrayTexture||s.isCompressedArrayTexture)&&(a=!0);let c=V.get(e).__webglFramebuffer;e.isWebGLCubeRenderTarget?(r=Array.isArray(c[t])?c[t][n]:c[t],i=!0):r=e.samples>0&&H.useMultisampledRTT(e)===!1?V.get(e).__webglMultisampledFramebuffer:Array.isArray(c)?c[n]:c,F.copy(e.viewport),te.copy(e.scissor),ne=e.scissorTest}else F.copy(L).multiplyScalar(I).floor(),te.copy(R).multiplyScalar(I).floor(),ne=le;if(n!==0&&(r=O),B.bindFramebuffer(z.FRAMEBUFFER,r)&&B.drawBuffers(e,r),B.viewport(F),B.scissor(te),B.setScissorTest(ne),i){let r=V.get(e.texture);z.framebufferTexture2D(z.FRAMEBUFFER,z.COLOR_ATTACHMENT0,z.TEXTURE_CUBE_MAP_POSITIVE_X+t,r.__webglTexture,n)}else if(a){let r=t;for(let t=0;t<e.textures.length;t++){let i=V.get(e.textures[t]);z.framebufferTextureLayer(z.FRAMEBUFFER,z.COLOR_ATTACHMENT0+t,i.__webglTexture,n,r)}}else if(e!==null&&n!==0){let t=V.get(e.texture);z.framebufferTexture2D(z.FRAMEBUFFER,z.COLOR_ATTACHMENT0,z.TEXTURE_2D,t.__webglTexture,n)}ee=-1};function wt(e){let t=V.get(e);return(t.__readFormat!==e.format||t.__readType!==e.type)&&(t.__readFormat=e.format,t.__readType=e.type,t.__formatReadable=Se.textureFormatReadable(e.format),t.__typeReadable=Se.textureTypeReadable(e.type)),t}this.readRenderTargetPixels=function(e,t,n,r,i,a,o,s=0){if(!(e&&e.isWebGLRenderTarget)){G(`WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.`);return}let c=V.get(e).__webglFramebuffer;if(e.isWebGLCubeRenderTarget&&o!==void 0&&(c=c[o],Array.isArray(c)&&(c=c[0])),c){B.bindFramebuffer(z.FRAMEBUFFER,c);try{let o=e.textures[s],c=o.format,l=o.type;e.textures.length>1&&z.readBuffer(z.COLOR_ATTACHMENT0+s);let u=wt(o);if(u.__formatReadable===!1){G(`WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.`);return}if(u.__typeReadable===!1){G(`WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.`);return}t>=0&&t<=e.width-r&&n>=0&&n<=e.height-i&&z.readPixels(t,n,r,i,Ge.convert(c),Ge.convert(l),a)}finally{let e=N===null?null:V.get(N).__webglFramebuffer;B.bindFramebuffer(z.FRAMEBUFFER,e)}}},this.readRenderTargetPixelsAsync=async function(e,t,n,r,i,a,o,s=0){if(!(e&&e.isWebGLRenderTarget))throw Error(`THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.`);let c=V.get(e).__webglFramebuffer;if(e.isWebGLCubeRenderTarget&&o!==void 0&&(c=c[o],Array.isArray(c)&&(c=c[0])),c){if(t>=0&&t<=e.width-r&&n>=0&&n<=e.height-i){B.bindFramebuffer(z.FRAMEBUFFER,c);let o=e.textures[s],l=o.format,u=o.type;e.textures.length>1&&z.readBuffer(z.COLOR_ATTACHMENT0+s);let d=wt(o);if(d.__formatReadable===!1)throw Error(`THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.`);if(d.__typeReadable===!1)throw Error(`THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.`);let f=z.createBuffer();z.bindBuffer(z.PIXEL_PACK_BUFFER,f),z.bufferData(z.PIXEL_PACK_BUFFER,a.byteLength,z.STREAM_READ),z.readPixels(t,n,r,i,Ge.convert(l),Ge.convert(u),0),z.bindBuffer(z.PIXEL_PACK_BUFFER,null);let p=N===null?null:V.get(N).__webglFramebuffer;B.bindFramebuffer(z.FRAMEBUFFER,p);let m=z.fenceSync(z.SYNC_GPU_COMMANDS_COMPLETE,0);return z.flush(),await un(z,m,4),z.bindBuffer(z.PIXEL_PACK_BUFFER,f),z.getBufferSubData(z.PIXEL_PACK_BUFFER,0,a),z.bindBuffer(z.PIXEL_PACK_BUFFER,null),z.deleteBuffer(f),z.deleteSync(m),a}throw Error(`THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.`)}},this.copyFramebufferToTexture=function(e,t=null,n=0){let r=2**-n,i=Math.floor(e.image.width*r),a=Math.floor(e.image.height*r),o=t===null?0:t.x,s=t===null?0:t.y;H.setTexture2D(e,0),z.copyTexSubImage2D(z.TEXTURE_2D,n,0,0,o,s,i,a),B.unbindTexture()},this.copyTextureToTexture=function(e,t,n=null,r=null,i=0,a=0){let o,s,c,l,u,d,f,p,m,h=e.isCompressedTexture?e.mipmaps[a]:e.image;if(n!==null)o=n.max.x-n.min.x,s=n.max.y-n.min.y,c=n.isBox3?n.max.z-n.min.z:1,l=n.min.x,u=n.min.y,d=n.isBox3?n.min.z:0;else{let t=2**-i;o=Math.floor(h.width*t),s=Math.floor(h.height*t),c=e.isDataArrayTexture?h.depth:e.isData3DTexture?Math.floor(h.depth*t):1,l=0,u=0,d=0}r===null?(f=0,p=0,m=0):(f=r.x,p=r.y,m=r.z);let g=Ge.convert(t.format),_=Ge.convert(t.type),v;t.isData3DTexture?(H.setTexture3D(t,0),v=z.TEXTURE_3D):t.isDataArrayTexture||t.isCompressedArrayTexture?(H.setTexture2DArray(t,0),v=z.TEXTURE_2D_ARRAY):(H.setTexture2D(t,0),v=z.TEXTURE_2D),B.activeTexture(z.TEXTURE0),B.pixelStorei(z.UNPACK_FLIP_Y_WEBGL,t.flipY),B.pixelStorei(z.UNPACK_PREMULTIPLY_ALPHA_WEBGL,t.premultiplyAlpha),B.pixelStorei(z.UNPACK_ALIGNMENT,t.unpackAlignment);let y=B.getParameter(z.UNPACK_ROW_LENGTH),b=B.getParameter(z.UNPACK_IMAGE_HEIGHT),x=B.getParameter(z.UNPACK_SKIP_PIXELS),S=B.getParameter(z.UNPACK_SKIP_ROWS),C=B.getParameter(z.UNPACK_SKIP_IMAGES);B.pixelStorei(z.UNPACK_ROW_LENGTH,h.width),B.pixelStorei(z.UNPACK_IMAGE_HEIGHT,h.height),B.pixelStorei(z.UNPACK_SKIP_PIXELS,l),B.pixelStorei(z.UNPACK_SKIP_ROWS,u),B.pixelStorei(z.UNPACK_SKIP_IMAGES,d);let w=e.isDataArrayTexture||e.isData3DTexture,T=t.isDataArrayTexture||t.isData3DTexture;if(e.isDepthTexture){let n=V.get(e),r=V.get(t),h=V.get(n.__renderTarget),g=V.get(r.__renderTarget);B.bindFramebuffer(z.READ_FRAMEBUFFER,h.__webglFramebuffer),B.bindFramebuffer(z.DRAW_FRAMEBUFFER,g.__webglFramebuffer);for(let n=0;n<c;n++)w&&(z.framebufferTextureLayer(z.READ_FRAMEBUFFER,z.COLOR_ATTACHMENT0,V.get(e).__webglTexture,i,d+n),z.framebufferTextureLayer(z.DRAW_FRAMEBUFFER,z.COLOR_ATTACHMENT0,V.get(t).__webglTexture,a,m+n)),z.blitFramebuffer(l,u,l+o,u+s,f,p,f+o,p+s,z.DEPTH_BUFFER_BIT,z.NEAREST);B.bindFramebuffer(z.READ_FRAMEBUFFER,null),B.bindFramebuffer(z.DRAW_FRAMEBUFFER,null)}else if(i!==0||e.isRenderTargetTexture||V.has(e)){let n=V.get(e),r=V.get(t);B.bindFramebuffer(z.READ_FRAMEBUFFER,k),B.bindFramebuffer(z.DRAW_FRAMEBUFFER,A);for(let e=0;e<c;e++)w?z.framebufferTextureLayer(z.READ_FRAMEBUFFER,z.COLOR_ATTACHMENT0,n.__webglTexture,i,d+e):z.framebufferTexture2D(z.READ_FRAMEBUFFER,z.COLOR_ATTACHMENT0,z.TEXTURE_2D,n.__webglTexture,i),T?z.framebufferTextureLayer(z.DRAW_FRAMEBUFFER,z.COLOR_ATTACHMENT0,r.__webglTexture,a,m+e):z.framebufferTexture2D(z.DRAW_FRAMEBUFFER,z.COLOR_ATTACHMENT0,z.TEXTURE_2D,r.__webglTexture,a),i===0?T?z.copyTexSubImage3D(v,a,f,p,m+e,l,u,o,s):z.copyTexSubImage2D(v,a,f,p,l,u,o,s):z.blitFramebuffer(l,u,l+o,u+s,f,p,f+o,p+s,z.COLOR_BUFFER_BIT,z.NEAREST);B.bindFramebuffer(z.READ_FRAMEBUFFER,null),B.bindFramebuffer(z.DRAW_FRAMEBUFFER,null)}else T?e.isDataTexture||e.isData3DTexture?z.texSubImage3D(v,a,f,p,m,o,s,c,g,_,h.data):t.isCompressedArrayTexture?z.compressedTexSubImage3D(v,a,f,p,m,o,s,c,g,h.data):z.texSubImage3D(v,a,f,p,m,o,s,c,g,_,h):e.isDataTexture?z.texSubImage2D(z.TEXTURE_2D,a,f,p,o,s,g,_,h.data):e.isCompressedTexture?z.compressedTexSubImage2D(z.TEXTURE_2D,a,f,p,h.width,h.height,g,h.data):z.texSubImage2D(z.TEXTURE_2D,a,f,p,o,s,g,_,h);B.pixelStorei(z.UNPACK_ROW_LENGTH,y),B.pixelStorei(z.UNPACK_IMAGE_HEIGHT,b),B.pixelStorei(z.UNPACK_SKIP_PIXELS,x),B.pixelStorei(z.UNPACK_SKIP_ROWS,S),B.pixelStorei(z.UNPACK_SKIP_IMAGES,C),a===0&&t.generateMipmaps===!0&&t.mipmapsAutoUpdate===!0&&z.generateMipmap(v),B.unbindTexture()},this.initRenderTarget=function(e){V.get(e).__webglFramebuffer===void 0&&H.setupRenderTarget(e)},this.initTexture=function(e){e.isCubeTexture?H.setTextureCube(e,0):e.isData3DTexture?H.setTexture3D(e,0):e.isDataArrayTexture||e.isCompressedArrayTexture?H.setTexture2DArray(e,0):H.setTexture2D(e,0),B.unbindTexture()},this.resetState=function(){j=0,M=0,N=null,B.reset(),Ke.reset()},typeof __THREE_DEVTOOLS__<`u`&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent(`observe`,{detail:this}))}get coordinateSystem(){return en}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;let t=this.getContext();t.drawingBufferColorSpace=X._getDrawingBufferColorSpace(e),t.unpackColorSpace=X._getUnpackColorSpace()}},Tu=e=>288/2**e,Eu=e=>`https://gibs-${`abc`[e%3]}.earthdata.nasa.gov`,Du={"2km":5,"1km":6,"500m":7,"250m":8,"125m":9,"62.5m":10,"31.25m":11,"15.625m":12},Ou=2500,ku=4e3,Au=1024;function ju(e,t,n,r=`default`){let i=n===`image/png`?`png`:`jpeg`;return{id:`wmts:${e}:${r}`,url:(n,a,o)=>`${Eu(a+o)}/wmts/epsg4326/best/${e}/default/${r}/${t}/${n}/${a}/${o}.${i}`,maxLevel:Du[t]??5,transparent:n===`image/png`,progressive:!0}}function Mu(e,t){return{...e,id:`${e.id}+${t?.id??`none`}`,maxLevel:t?Math.min(e.maxLevel,t.maxLevel):e.maxLevel,transparent:!0,gaps:{under:t?(e,n,r)=>t.url(e,n,r):null}}}function Nu(e,t){return t.length?{...e,id:`${e.id}+${t.map(e=>e.id).join(`+`)}`,fills:t.map(e=>(t,n,r)=>e.url(t,n,r))}:e}function Pu(e,t,n=0){return{...e,id:`${e.id}@${t}${n?`+${n}`:``}`,native:t,dilate:n,maxLevel:t}}function Fu(e,t,n){return{id:e,url:(e,r,i)=>e<=t.maxLevel?t.url(e,r,i):n.url(e,r,i),maxLevel:Math.max(t.maxLevel,n.maxLevel),transparent:t.transparent||n.transparent,progressive:!0}}function Iu(e,t,n,r){let i=(t,i,a,o)=>{let s=r&&(t.e-t.w)/i<.003,c=new URLSearchParams({SERVICE:`WMS`,REQUEST:`GetMap`,VERSION:`1.3.0`,LAYERS:s?r:e,STYLES:``,CRS:`EPSG:4326`,BBOX:[t.s,t.w,t.n,t.e].map(e=>e.toFixed(6)).join(`,`),WIDTH:String(i),HEIGHT:String(a),FORMAT:`image/png`,TRANSPARENT:`TRUE`});return n&&c.set(`TIME`,n),`${Eu(o)}/wms/epsg4326/best/wms.cgi?${c}`};return{id:`wms:${e}:${n??``}`,url:(e,t,n)=>{let r=Tu(e),a=-180+n*r,o=90-t*r;return i({s:o-r,w:a,n:o,e:a+r},512,512,t+n)},area:i,maxLevel:t,transparent:!0,progressive:!1}}var Lu=new Map,Ru=new Map,zu=700,Bu=120,Vu=[];function Hu(e,t,n=!1){let r=Lu.get(e);if(r)return Lu.delete(e),Lu.set(e,r),r;let i=t().then(t=>(Lu.get(e)===i&&(t?Ru.set(e,t):Lu.delete(e)),t));if(Lu.set(e,i),n&&(Vu.push(e),Vu.length>Bu)){let e=Vu.shift();Lu.delete(e),Ru.delete(e)}if(Lu.size>zu){let e=Lu.keys().next().value;Lu.delete(e),Ru.delete(e)}return i}function Uu(e){return new Promise(t=>{let n=new Image,r=window.setTimeout(()=>{n.onerror=null,n.src=``,t(null)},2e4);n.crossOrigin=`anonymous`,n.decoding=`async`,n.onload=()=>{window.clearTimeout(r),t(n)},n.onerror=()=>{window.clearTimeout(r),t(null)},n.src=e})}var Wu=e=>Hu(e,()=>Uu(e));async function Gu(e,t){let[n,r]=await Promise.all([Wu(e),t?Wu(t):Promise.resolve(null)]);if(!n&&!r)return null;let i=document.createElement(`canvas`);i.width=i.height=512;let a=i.getContext(`2d`,{willReadFrequently:!0});if(n){a.drawImage(n,0,0,512,512);let e=a.getImageData(0,0,512,512),t=e.data,r=new Uint8Array(262144);for(let e=0,n=0;e<t.length;e+=4,n++)r[n]=+(t[e]<13&&t[e+1]<13&&t[e+2]<13);let i=new Uint8Array(262144);for(let e=0;e<512;e++)for(let t=0;t<512;t++){let n=0;for(let i=-2;i<=2&&!n;i++){let a=t+i;a>=0&&a<512&&(n=r[e*512+a])}i[e*512+t]=n}for(let e=0;e<512;e++)for(let n=0;n<512;n++){let r=0;for(let t=-2;t<=2&&!r;t++){let a=e+t;a>=0&&a<512&&(r=i[a*512+n])}let a=(e*512+n)*4;r&&t[a]<40&&t[a+1]<40&&t[a+2]<48&&(t[a+3]=0)}a.putImageData(e,0,0)}return r&&(a.globalCompositeOperation=`destination-over`,a.drawImage(r,0,0,512,512)),i}async function Ku(e,t){let[n,...r]=await Promise.all([Wu(e),...t.map(Wu)]);if(!n&&!r.some(Boolean))return null;let i=document.createElement(`canvas`);i.width=i.height=512;let a=i.getContext(`2d`);n&&a.drawImage(n,0,0,512,512),a.globalCompositeOperation=`destination-over`;for(let e of r)e&&a.drawImage(e,0,0,512,512);return i}function qu(e,t,n,r){let i=e.url(t,n,r);return e.fills?`days:${i}|${e.fills.map(e=>e(t,n,r)).join(`|`)}`:e.gaps?`gaps:${i}|${e.gaps.under?.(t,n,r)??``}`:i}function Ju(e,t,n,r){let i=e.url(t,n,r);if(e.compose)return Hu(i,()=>e.compose(t,n,r),!0);if(e.fills)return Hu(qu(e,t,n,r),()=>Ku(i,e.fills.map(e=>e(t,n,r))),!0);if(!e.gaps)return Wu(i);let a=e.gaps.under?.(t,n,r)??null;return Hu(qu(e,t,n,r),()=>Gu(i,a),!0)}function Yu(e,t,n,r){let i=document.createElement(`canvas`);i.width=t,i.height=n,i.getContext(`2d`).drawImage(e,0,0,t,n,0,0,t,n);let a=e.getContext(`2d`),o=[];for(let e=-r;e<=r;e++)for(let t=-r;t<=r;t++)(t||e)&&o.push([t,e]);o.sort((e,t)=>Math.hypot(...e)-Math.hypot(...t)),a.globalCompositeOperation=`destination-over`;for(let[e,t]of o)a.drawImage(i,e,t);a.globalCompositeOperation=`source-over`}function Xu(e,t,n,r){let i=[],a=e,o=t,s=n;for(let e=0;e<r;e++){let e=document.createElement(`canvas`);e.width=Math.max(1,Math.round(o/2)),e.height=Math.max(1,Math.round(s/2));let t=e.getContext(`2d`);t.imageSmoothingEnabled=!0,t.imageSmoothingQuality=`high`,t.drawImage(a,0,0,o,s,0,0,e.width,e.height),t.drawImage(e,0,0),i.push(e),a=e,o=e.width,s=e.height}let c=e.getContext(`2d`);c.globalCompositeOperation=`destination-over`,c.imageSmoothingEnabled=!0,c.imageSmoothingQuality=`high`;for(let e of i)c.drawImage(e,0,0,e.width,e.height,0,0,t,n);c.globalCompositeOperation=`source-over`}function Zu(e,t,n){let r=document.createElement(`canvas`);r.width=e,r.height=t;let i=r.getContext(`2d`),a=new ja(r);return a.colorSpace=qt,a.anisotropy=n,a.wrapS=Ee,{canvas:r,ctx:i,texture:a}}var Qu=class{global;patch;mask;bounds=new rr(0,0,0,0);fill={value:1};noData={value:0};source=null;back=null;globalOnScreen=!1;patchKey=``;patchShown=``;nextBounds=null;patchCommitted=!0;patchPending=0;patchTimer=0;globalTimer=0;resized={patch:!1,mask:!1};globalGen=0;patchGen=0;dirtyGlobal=!1;dirtyPatch=!1;flushTimer=0;lastBox=null;lastPixels=0;globalLevel;onChange;onLoading;maxPatchTiles;constructor(e,t,n,r,i=42){this.globalLevel=e,this.onChange=n,this.onLoading=r,this.maxPatchTiles=i;let a=Tu(e);this.global=Zu(Math.round(360/a*512),Math.round(180/a*512),t),this.patch=Zu(512,512,t),this.patch.texture.wrapS=De,this.mask=Zu(1,1,1);let o=this.mask.texture;o.colorSpace=``,o.wrapS=De,o.minFilter=o.magFilter=ke,o.generateMipmaps=!1}get hasSource(){return this.source!==null}setSource(e){if(e?.id===this.source?.id)return;if(this.source=e,this.fill.value=e&&!e.progressive?0:1,this.globalGen++,this.patchGen++,this.patchKey=``,this.nextBounds=null,window.clearTimeout(this.globalTimer),window.clearTimeout(this.patchTimer),this.globalJobs.clear(),this.dropPatchJobs(),!e){this.globalOnScreen=!1,this.patchShown=``,this.bounds.set(0,0,0,0),this.global.ctx.clearRect(0,0,this.global.canvas.width,this.global.canvas.height),this.global.texture.needsUpdate=!0,this.onChange();return}let t=this.globalGen;if(!this.globalOnScreen){this.globalOnScreen=!0,this.global.ctx.clearRect(0,0,this.global.canvas.width,this.global.canvas.height),this.global.texture.needsUpdate=!0,this.patchShown=``,this.bounds.set(0,0,0,0),this.onChange();let n=this.global;e.native===void 0?e.progressive&&this.globalLevel>1?this.loadGlobalLevel(this.globalLevel-1,t,n.canvas,n.ctx).then(()=>{t===this.globalGen&&this.loadGlobalLevel(this.globalLevel,t,n.canvas,n.ctx)}):this.loadGlobalLevel(this.globalLevel,t,n.canvas,n.ctx):this.loadNative(t,n.canvas,n.ctx);return}this.back||(this.back=document.createElement(`canvas`),this.back.width=this.global.canvas.width,this.back.height=this.global.canvas.height);let n=this.back,r=n.getContext(`2d`);r.clearRect(0,0,n.width,n.height);let i=()=>{if(t!==this.globalGen)return;window.clearTimeout(this.globalTimer);let{ctx:r,canvas:i}=this.global;r.clearRect(0,0,i.width,i.height),r.drawImage(n,0,0),this.global.texture.needsUpdate=!0,this.patchShown!==e.id&&(e.progressive||!this.patchKey)&&(this.bounds.set(0,0,0,0),this.patchShown=``),this.onChange()};this.globalTimer=window.setTimeout(i,ku),(e.native===void 0?this.loadGlobalLevel(this.globalLevel,t,n,r,!0):this.loadNative(t,n,r,!0)).then(i)}async loadNative(e,t,n,r=!1){let i=this.source,a=i.native,o=Tu(a),s=Math.ceil(360/o),c=Math.ceil(180/o),l=document.createElement(`canvas`);l.width=s*512,l.height=c*512;let u=l.getContext(`2d`),d=[];for(let t=0;t<c;t++)for(let n=0;n<s;n++){let r=Ju(i,a,t,n).then(r=>{r&&e===this.globalGen&&u.drawImage(r,n*512,t*512,512,512)});this.track(r,this.globalJobs),d.push(r)}if(await Promise.all(d),e!==this.globalGen)return;let f=Math.round(360/o*512),p=Math.round(180/o*512);i.dilate&&Yu(l,f,p,i.dilate),Xu(l,f,p,2+a),n.clearRect(0,0,t.width,t.height),n.imageSmoothingEnabled=!0,n.imageSmoothingQuality=`high`,n.drawImage(l,0,0,f,p,0,0,t.width,t.height),r||(this.dirtyGlobal=!0,this.scheduleFlush())}loadGlobalLevel(e,t,n,r,i=!1){let a=this.source,o=[],s=Tu(e),c=Math.ceil(360/s),l=Math.ceil(180/s),u=()=>{i||(this.dirtyGlobal=!0,this.scheduleFlush())};if(a.area)return Promise.all(this.loadArea(a,{s:-90,w:-180,n:90,e:180},n.width,n.height,(e,n,i,a,o)=>{t===this.globalGen&&(r.clearRect(n,i,a,o),r.drawImage(e,n,i,a,o),u())}));for(let i=0;i<l;i++)for(let l=0;l<c;l++){let c=Ju(a,e,i,l).then(e=>{if(!e||t!==this.globalGen)return;let o=l*s/360*n.width,c=i*s/180*n.height,d=s/360*n.width,f=s/180*n.height;a.transparent&&r.clearRect(o,c,d,f),r.drawImage(e,o,c,d,f),u()});this.track(c,this.globalJobs),o.push(c)}return Promise.all(o)}patchFor(e,t,n){if(!t||t.e<=t.w||e.native!==void 0)return null;let r=(t.e-t.w)/Math.max(256,n),i=Math.min(e.maxLevel,Math.ceil(Math.log2(288/(512*r)))),a=this.range(t,i);for(;i>this.globalLevel&&a.count>this.maxPatchTiles;)i--,a=this.range(t,i);return i>this.globalLevel?{z:i,range:a}:null}sample(e,t){let n=(e,t,n)=>{let r=e.getContext(`2d`);if(!r||t<0||n<0||t>=e.width||n>=e.height)return null;let i=r.getImageData(Math.floor(t),Math.floor(n),1,1).data;return[i[0],i[1],i[2],i[3]]},r=this.bounds;if(r.z>r.x&&e>=r.x&&e<=r.z&&t>=r.y&&t<=r.w){let i=(e-r.x)/(r.z-r.x)*this.patch.canvas.width,a=(1-(t-r.y)/(r.w-r.y))*this.patch.canvas.height,o=n(this.patch.canvas,i,a);if(o&&o[3]>0)return o}return n(this.global.canvas,e*this.global.canvas.width,(1-t)*this.global.canvas.height)}updateView(e,t){this.lastBox=e,this.lastPixels=t;let n=this.source,r=n?this.patchFor(n,e,t):null;if(!n||!r){this.clearPatch();return}let{z:i,range:a}=r,o=`${n.id}|${i}|${a.c0},${a.c1},${a.r0},${a.r1}`;if(o===this.patchKey)return;this.patchKey=o;let s=++this.patchGen;this.dropPatchJobs();let c=Tu(i),l=a.c1-a.c0+1,u=a.r1-a.r0+1,d=l*512,f=u*512,{canvas:p,ctx:m}=this.patch,h=this.mask;p.width!==d||p.height!==f?(p.width=d,p.height=f,this.resized.patch=!0):m.clearRect(0,0,d,f),h.canvas.width!==l||h.canvas.height!==u?(h.canvas.width=l,h.canvas.height=u,this.resized.mask=!0):h.ctx.clearRect(0,0,l,u),h.ctx.fillStyle=`#fff`;let g=-180+a.c0*c,_=-180+(a.c1+1)*c,v=90-a.r0*c,y=90-(a.r1+1)*c;this.nextBounds=[(g+180)/360,(y+90)/180,(_+180)/360,(v+90)/180],this.patchCommitted=!1,window.clearTimeout(this.patchTimer),this.patchTimer=window.setTimeout(()=>this.commitPatch(s,n.id),Ou);let b=()=>{s===this.patchGen&&(this.patchPending--,this.patchPending<=0&&this.commitPatch(s,n.id))};if(n.area){let e=2*c,t=[];for(let r=Math.floor(a.r0/2);r<=Math.floor(a.r1/2);r++)for(let i=Math.floor(a.c0/2);i<=Math.floor(a.c1/2);i++){let o=-180+i*e,c=90-r*e,d=Math.min(180,o+e),f=Math.max(-90,c-e),p=Math.round(1024*(d-o)/e),g=Math.round(1024*(c-f)/e);if(p<=0||g<=0)continue;let _=(2*i-a.c0)*512,v=(2*r-a.r0)*512;t.push(()=>this.trackPatch(Wu(n.area({s:f,w:o,n:c,e:d},p,g,r+i)).then(e=>{if(!e||s!==this.patchGen)return;m.drawImage(e,_,v,p,g);let t=Math.max(0,2*i-a.c0),n=Math.max(0,2*r-a.r0);h.ctx.fillRect(t,n,Math.min(l,2*i+2-a.c0)-t,Math.min(u,2*r+2-a.r0)-n),this.dirtyPatch=!0,this.patchCommitted&&this.scheduleFlush()}).finally(b)))}this.patchPending=t.length,t.forEach(e=>e()),t.length||this.commitPatch(s,n.id);return}let x=0;for(let e=a.r0;e<=a.r1;e++)for(let t=a.c0;t<=a.c1;t++)for(let r=0;r<=4&&i-r>this.globalLevel;r++){let o=Ru.get(qu(n,i-r,e>>r,t>>r));if(!o)continue;let s=512>>r;m.drawImage(o,(t&(1<<r)-1)*s,(e&(1<<r)-1)*s,s,s,(t-a.c0)*512,(e-a.r0)*512,512,512),h.ctx.fillRect(t-a.c0,e-a.r0,1,1),r===0&&x++;break}if(this.dirtyPatch=!0,x===a.count){this.commitPatch(s,n.id);return}let S=(a.c0+a.c1)/2,C=(a.r0+a.r1)/2,w=[];for(let e=a.r0;e<=a.r1;e++)for(let t=a.c0;t<=a.c1;t++)w.push([e,t]);w.sort((e,t)=>Math.hypot(e[0]-C,e[1]-S)-Math.hypot(t[0]-C,t[1]-S)),this.patchPending=w.length;for(let[e,t]of w)this.trackPatch(Ju(n,i,e,t).then(r=>{r&&s===this.patchGen&&(n.transparent&&m.clearRect((t-a.c0)*512,(e-a.r0)*512,512,512),m.drawImage(r,(t-a.c0)*512,(e-a.r0)*512,512,512),h.ctx.fillRect(t-a.c0,e-a.r0,1,1),this.dirtyPatch=!0,this.patchCommitted&&this.scheduleFlush())}).finally(b))}commitPatch(e,t){e!==this.patchGen||this.patchCommitted||(this.patchCommitted=!0,window.clearTimeout(this.patchTimer),this.patchShown=t,this.dirtyPatch=!0,this.scheduleFlush())}preload(e,t=6e3){let n=[],r=e.native??this.globalLevel,i=Tu(r);if(e.area){let t=360/this.global.canvas.width,r=180/this.global.canvas.height,i=0;for(let a=0;a<this.global.canvas.height;a+=Au)for(let o=0;o<this.global.canvas.width;o+=Au){let s=Math.min(Au,this.global.canvas.width-o),c=Math.min(Au,this.global.canvas.height-a);n.push(Wu(e.area({s:90-(a+c)*r,w:-180+o*t,n:90-a*r,e:-180+(o+s)*t},s,c,i++)))}let a=this.patchFor(e,this.lastBox,this.lastPixels);if(a){let t=2*Tu(a.z);for(let r=Math.floor(a.range.r0/2);r<=Math.floor(a.range.r1/2);r++)for(let i=Math.floor(a.range.c0/2);i<=Math.floor(a.range.c1/2);i++){let a=-180+i*t,o=90-r*t,s=Math.min(180,a+t),c=Math.max(-90,o-t),l=Math.round(1024*(s-a)/t),u=Math.round(1024*(o-c)/t);l>0&&u>0&&n.push(Wu(e.area({s:c,w:a,n:o,e:s},l,u,r+i)))}}}else{for(let t=0;t<Math.ceil(180/i);t++)for(let a=0;a<Math.ceil(360/i);a++)n.push(Ju(e,r,t,a));let t=this.patchFor(e,this.lastBox,this.lastPixels);if(t)for(let r=t.range.r0;r<=t.range.r1;r++)for(let i=t.range.c0;i<=t.range.c1;i++)n.push(Ju(e,t.z,r,i))}return Promise.race([Promise.all(n).then(()=>void 0),new Promise(e=>window.setTimeout(e,t))])}loadArea(e,t,n,r,i){let a=[],o=(t.e-t.w)/n,s=(t.n-t.s)/r,c=0;for(let l=0;l<r;l+=Au)for(let u=0;u<n;u+=Au){let d=Math.min(Au,n-u),f=Math.min(Au,r-l),p={s:t.n-(l+f)*s,w:t.w+u*o,n:t.n-l*s,e:t.w+(u+d)*o},m=Wu(e.area(p,d,f,c++)).then(e=>{e&&i(e,u,l,d,f)});this.track(m,this.globalJobs),a.push(m)}return a}syncSizes(){this.resized.patch&&this.patch.texture.dispose(),this.resized.mask&&this.mask.texture.dispose(),this.resized.patch=this.resized.mask=!1}clearPatch(){this.patchKey&&(this.patchKey=``,this.nextBounds=null,this.patchGen++,this.patchCommitted=!0,window.clearTimeout(this.patchTimer),this.dropPatchJobs(),this.patchShown=``,this.bounds.set(0,0,0,0),this.onChange())}range(e,t){let n=Tu(t),r=Math.ceil(360/n)-1,i=Math.ceil(180/n)-1,a=Math.max(0,Math.floor((e.w+180)/n)),o=Math.min(r,Math.floor((e.e+180)/n)),s=Math.max(0,Math.floor((90-e.n)/n)),c=Math.min(i,Math.floor((90-e.s)/n));return{c0:a,c1:o,r0:s,r1:c,count:(o-a+1)*(c-s+1)}}patchJobs=new Set;globalJobs=new Set;reported=0;report(){let e=this.patchJobs.size+(this.patchKey?0:this.globalJobs.size);e!==this.reported&&(this.onLoading(e-this.reported),this.reported=e)}track(e,t){let n={};t.add(n),this.report(),e.finally(()=>{t.delete(n)&&this.report()})}trackPatch(e){this.track(e,this.patchJobs)}dropPatchJobs(){this.patchJobs.clear(),this.report()}scheduleFlush(){this.flushTimer||=window.setTimeout(()=>{this.flushTimer=0,this.dirtyGlobal&&(this.global.texture.needsUpdate=!0),this.dirtyPatch&&this.patchCommitted&&(this.nextBounds&&=(this.bounds.set(...this.nextBounds),null),this.syncSizes(),this.patch.texture.needsUpdate=this.mask.texture.needsUpdate=!0,this.dirtyPatch=!1),this.dirtyGlobal=!1,this.onChange()},120)}dispose(){this.globalGen++,this.patchGen++,this.patchKey=``,this.globalJobs.clear(),this.dropPatchJobs(),window.clearTimeout(this.flushTimer),window.clearTimeout(this.patchTimer),window.clearTimeout(this.globalTimer),this.global.texture.dispose(),this.patch.texture.dispose(),this.mask.texture.dispose()}},$u=e=>`
  uniform sampler2D ${e}Global;
  uniform sampler2D ${e}Patch;
  uniform sampler2D ${e}Mask;
  uniform vec4 ${e}Bounds;
  uniform float ${e}Fill;
  uniform float ${e}NoData;
  vec4 ${e}Sample(vec2 uv) {
    if (${e}Bounds.z > ${e}Bounds.x) {
      vec2 d = (uv - ${e}Bounds.xy) / (${e}Bounds.zw - ${e}Bounds.xy);
      bool inside = d.x >= 0.0 && d.y >= 0.0 && d.x <= 1.0 && d.y <= 1.0;
      if (inside && texture2D(${e}Mask, d).r > 0.5) {
        vec4 close = texture2D(${e}Patch, d);
        // Opaque layers mark missing data in black (Landsat far out at sea): use the global map there.
        if (max(close.r, max(close.g, close.b)) >= ${e}NoData) return close;
      }
      if (${e}Fill < 0.5) return vec4(0.0);
    }
    return texture2D(${e}Global, uv);
  }
`;function ed(e,t){return{[`${e}Global`]:{value:t.global.texture},[`${e}Patch`]:{value:t.patch.texture},[`${e}Mask`]:{value:t.mask.texture},[`${e}Bounds`]:{value:t.bounds},[`${e}Fill`]:t.fill,[`${e}NoData`]:t.noData}}var td=`https://gibs.earthdata.nasa.gov/colormaps/v1.3/`,nd={t2m:`MERRA2_2m_Air_Temperature_Monthly`,precip:`MERRA2_Precipitation_Bias_Corrected_Monthly`,soil:`MERRA2_Soil_Water_Root_Zone_Monthly`,humidity:`AIRS_Surface_Relative_Humidity_Monthly_Day`,lst:`MODIS_Land_Surface_Temp`,ndvi:`MODIS_L3_NDVI`,no2:`OMI_Nitrogen_Dioxide_Tropo_Column`,ozone:`OMI_Ozone_TOMS_Total_Column`,sst:`GHRSST_Sea_Surface_Temperature`,snow:`MODIS_NDSI_Snow_Cover`,seaice:`AMSR_Sea_Ice_Concentration`,imerg:`GPM_Precipitation_Rate`,vapor:`MERRA2_Total_Precipitable_Water_Vapor_Monthly`,aerosol:`MERRA2_Total_Aerosol_Optical_Thickness_550nm_Scattering_Monthly`,dust:`MERRA2_Dust_Surface_Mass_Concentration_PM25_Monthly`,co:`AIRS_Carbon_Monoxide_Volume_Mixing_Ratio`,wind10:`MERRA2_Surface_Wind_Speed_Monthly`,landcover:`MODIS_IGBP_Land_Cover_Type`,population:`GPW_Population_Density_2020`},rd={t2m:{unit:{uk:`°C`,en:`°C`},add:-273.15,digits:1},lst:{unit:{uk:`°C`,en:`°C`},add:-273.15,digits:1},sst:{unit:{uk:`°C`,en:`°C`},digits:1},precip:{unit:{uk:`мм за добу`,en:`mm a day`},k:86400,digits:1},soil:{unit:{uk:`% води в ґрунті`,en:`% water in the soil`},k:100,digits:0},humidity:{unit:{uk:`%`,en:`%`},digits:0},ndvi:{unit:{uk:`(0 — голо, 1 — густа зелень)`,en:`(0 bare, 1 dense green)`},digits:2},no2:{unit:{uk:`×10¹⁵ молекул/см²`,en:`×10¹⁵ molecules/cm²`},k:1e-15,digits:1},ozone:{unit:{uk:`од. Добсона`,en:`Dobson units`},digits:0},snow:{unit:{uk:`(сніговий індекс)`,en:`(snow index)`},digits:0},seaice:{unit:{uk:`% моря під льодом`,en:`% of sea under ice`},digits:0},imerg:{unit:{uk:`мм/год`,en:`mm/h`},digits:1},vapor:{unit:{uk:`мм води`,en:`mm of water`},digits:0},aerosol:{unit:{uk:`(оптична товщина)`,en:`(optical depth)`},digits:2},dust:{unit:{uk:`мкг/м³`,en:`µg/m³`},k:1e9,digits:1},co:{unit:{uk:`ppbv`,en:`ppbv`},digits:0},wind10:{unit:{uk:`м/с`,en:`m/s`},digits:1},population:{unit:{uk:`осіб/км²`,en:`people/km²`},digits:0}},id={"Evergreen Needleleaf Forests":`Вічнозелені хвойні ліси`,"Evergreen Broadleaf Forests":`Вічнозелені широколисті ліси`,"Deciduous Needleleaf Forests":`Листопадні хвойні ліси`,"Deciduous Broadleaf Forests":`Листопадні широколисті ліси`,"Mixed Forests":`Мішані ліси`,"Closed Shrublands":`Густі чагарники`,"Open Shrublands":`Рідкі чагарники`,"Woody Savannas":`Лісисті савани`,Savannas:`Савани`,Grasslands:`Луки й степи`,"Permanent Wetlands":`Болота`,Croplands:`Поля`,"Urban and Built-up Lands":`Міста й забудова`,"Cropland/Natural Vegetation Mosaics":`Поля впереміш із природою`,"Permanent Snow and Ice":`Вічні сніги й лід`,Barren:`Пустища й пустелі`,"Water Bodies":`Водойми`},ad=new Map;function od(e){if(!e)return null;let t=e.replace(/[[\]()]/g,``).split(`,`).map(e=>e.trim()),n=e=>e===`-INF`?-1/0:e===`INF`||e===`+INF`?1/0:Number(e),r=n(t[0]),i=t.length>1?n(t[1]):r;return Number.isNaN(r)||Number.isNaN(i)?null:[r,i]}function sd(e){let t=nd[e];if(!t)return Promise.resolve(null);let n=ad.get(t);return n||(n=fetch(`${td}${t}.xml`).then(e=>e.ok?e.text():null).then(t=>{if(!t)return null;let n=new DOMParser().parseFromString(t,`application/xml`),r=new Map;for(let e of n.querySelectorAll(`LegendEntry`))r.set(e.getAttribute(`rgb`)??``,e.getAttribute(`tooltip`)??``);let i=[];for(let e of n.querySelectorAll(`ColorMap`)){if(e.getAttribute(`title`)===`No Data`)continue;let t=e.getAttribute(`units`)??``;for(let n of e.querySelectorAll(`ColorMapEntry`)){if(n.getAttribute(`transparent`)===`true`||n.getAttribute(`nodata`)===`true`)continue;let e=n.getAttribute(`rgb`)??``,[a,o,s]=e.split(`,`).map(Number),c=od(n.getAttribute(`value`)??n.getAttribute(`sourceValue`)),l=r.get(e)??null;i.push({r:a,g:o,b:s,lo:c?c[0]:NaN,hi:c?c[1]:NaN,label:n.getAttribute(`label`)??l,units:t})}}return i.length?{entries:i,numeric:i.filter(e=>Number.isFinite(e.lo)||Number.isFinite(e.hi)).length>i.length/2&&e!==`landcover`}:null}).catch(()=>null),ad.set(t,n)),n}function cd(e,t,n,r){let i=-1,a=1/0;return e.entries.forEach((e,o)=>{let s=(e.r-t)**2+(e.g-n)**2+(e.b-r)**2;s<a&&(a=s,i=o)}),i<0||a>3468?null:{entry:e.entries[i],at:e.entries.length>1?i/(e.entries.length-1):0}}function ld(e,t){let n=Number.isFinite(t.lo)&&Number.isFinite(t.hi)?(t.lo+t.hi)/2:Number.isFinite(t.lo)?t.lo:Number.isFinite(t.hi)?t.hi:NaN;if(!Number.isFinite(n))return null;let r=rd[e];return n*(r?.k??1)+(r?.add??0)}function ud(e,t,n){let r=rd[e];if(e===`landcover`&&t.label)return n===`uk`?id[t.label]??t.label:t.label;let i=ld(e,t);if(i===null)return t.label??``;let a=new Intl.NumberFormat(n===`uk`?`uk-UA`:`en-GB`,{maximumFractionDigits:r?.digits??1,minimumFractionDigits:0});return`${Number.isFinite(t.lo)?Number.isFinite(t.hi)?`≈ `:`≥ `:`≤ `}${a.format(i)} ${r?.unit[n]??t.units}`.trim()}function dd(e,t){return(t===`uk`?[`дуже низько`,`низько`,`помірно`,`високо`,`дуже високо`]:[`very low`,`low`,`moderate`,`high`,`very high`])[Math.min(4,Math.floor(e*5))]}var fd=[{id:`pop`,group:`people`,better:`none`,digits:0},{id:`area`,group:`people`,better:`none`,digits:0},{id:`density`,group:`people`,better:`none`,digits:0},{id:`industry`,group:`industry`,better:`less`,digits:0},{id:`works`,group:`industry`,better:`less`,digits:0},{id:`green`,group:`nature`,better:`more`,digits:0},{id:`ndvi`,group:`nature`,better:`more`,digits:2},{id:`heat`,group:`nature`,better:`less`,digits:1},{id:`fires`,group:`now`,better:`less`,digits:0},{id:`aqi`,group:`now`,better:`less`,digits:0},{id:`rad`,group:`now`,better:`less`,digits:2},{id:`temp`,group:`climate`,better:`none`,digits:1},{id:`rain`,group:`climate`,better:`none`,digits:0},{id:`elev`,group:`climate`,better:`none`,digits:0}],pd={"2km":5,"1km":6,"500m":7,"250m":8};function md(e){return new Promise(t=>{let n=new Image;n.crossOrigin=`anonymous`,n.onload=()=>t(n),n.onerror=()=>t(null),n.src=e})}async function hd(e,t,n,r,i){let o=M[e].imagery,s=await sd(e);if(!o||!s)return[];let c=Math.min(pd[o.matrixSet]??5,6),l=Tu(c),u=l/512,d=i/111.2,f=i/(111.2*Math.max(.1,Math.cos(n*Math.PI/180))),p=Math.floor((90-(n+d))/l),m=Math.floor((90-(n-d))/l),h=Math.floor((r-f+180)/l),g=Math.floor((r+f+180)/l),_=ju(o.layer,o.matrixSet,o.format,o.static?`default`:t),v=[],y=s.entries.map(e=>e.hi-e.lo).filter(e=>Number.isFinite(e)&&e>0).sort((e,t)=>e-t),b=y[Math.floor(y.length/2)]??0,x=document.createElement(`canvas`);x.width=x.height=512;let S=x.getContext(`2d`,{willReadFrequently:!0});for(let t=p;t<=m;t++)for(let o=h;o<=g;o++){let p=await md(_.url(c,t,o));if(!p)continue;S.clearRect(0,0,512,512),S.drawImage(p,0,0,512,512);let m=S.getImageData(0,0,512,512).data,h=90-t*l,g=-180+o*l,y=Math.max(0,Math.floor((h-(n+d))/u)),x=Math.min(511,Math.ceil((h-(n-d))/u)),C=Math.max(0,Math.floor((r-f-g)/u)),w=Math.min(511,Math.ceil((r+f-g)/u));for(let t=y;t<=x;t++){let o=h-(t+.5)*u;for(let c=C;c<=w;c++){let l=g+(c+.5)*u;if(a(n,r,o,l)>i)continue;let d=(t*512+c)*4;if(m[d+3]<128)continue;let f=cd(s,m[d],m[d+1],m[d+2]),p=f?gd(e,s,b,f.entry):null;p!==null&&Number.isFinite(p)&&v.push(p)}}}return v}function gd(e,t,n,r){let i;if(Number.isFinite(r.lo)&&Number.isFinite(r.hi)){let e=t.entries.indexOf(r),a=n>0&&r.hi-r.lo>5*n;i=a&&e===t.entries.length-1?r.lo:a&&e===0?r.hi:(r.lo+r.hi)/2}else i=Number.isFinite(r.lo)?r.lo:r.hi;if(!Number.isFinite(i))return null;let a=rd[e];return i*(a?.k??1)+(a?.add??0)}var _d=e=>e.length?e.reduce((e,t)=>e+t,0)/e.length:NaN;function vd(e){let t=Number(e.slice(0,4));return`${Number(e.slice(5,7))>=7?t:t-1}-07-01`}var yd=[`https://overpass-api.de/api/interpreter`,`https://overpass.private.coffee/api/interpreter`,`https://overpass.kumi.systems/api/interpreter`],bd=new Map;async function xd(e){for(let t of yd){let n=new AbortController,r=window.setTimeout(()=>n.abort(),25e3);try{let r=await fetch(t,{method:`POST`,body:new URLSearchParams({data:e}),signal:n.signal});if(r.ok)return await r.json()}catch{}finally{window.clearTimeout(r)}}return null}function Sd(e,t,n){let r=`${e.toFixed(3)},${t.toFixed(3)},${n}`,i=bd.get(r);if(!i){let a=`around:${Math.round(n*1e3)},${e.toFixed(4)},${t.toFixed(4)}`;i=xd(`[out:json][timeout:40];(way["landuse"="industrial"](${a});relation["landuse"="industrial"](${a}););out count;nwr["man_made"="works"](${a});out count;`).then(e=>{let t=e?.elements??[];return t.length<2?null:{industry:Number(t[0].tags?.total??NaN),works:Number(t[1].tags?.total??NaN)}}).catch(()=>null),bd.set(r,i),i.then(e=>!e&&bd.delete(r))}return i}var Cd=new Map;function wd(e,t){let n=`${e.toFixed(2)},${t.toFixed(2)}`,r=Cd.get(n);return r||(r=fetch(`https://power.larc.nasa.gov/api/temporal/climatology/point?parameters=T2M,PRECTOTCORR&community=RE&longitude=${t.toFixed(3)}&latitude=${e.toFixed(3)}&format=JSON`).then(e=>e.ok?e.json():null).then(e=>{let t=e?.properties?.parameter,n=t?.T2M?.ANN,r=t?.PRECTOTCORR?.ANN;return Number.isFinite(n)&&Number.isFinite(r)?{temp:n,rain:r*365.25}:null}).catch(()=>null),Cd.set(n,r)),r}async function Td(e,t){try{let n=(await(await fetch(`https://api.open-meteo.com/v1/elevation?latitude=${e.toFixed(4)}&longitude=${t.toFixed(4)}`)).json()).elevation?.[0];return Number.isFinite(n)?n:null}catch{return null}}async function Ed(e,t,n){switch(e){case`pop`:return t.city&&t.city.pop>0?{value:t.city.pop}:null;case`area`:return t.city&&t.city.areaKm2>0?{value:t.city.areaKm2}:null;case`density`:{if(t.city&&t.city.pop>0&&t.city.areaKm2>0)return{value:t.city.pop/t.city.areaKm2,note:{uk:`на 1 км² забудови`,en:`per km² built up`}};let e=_d(await hd(`population`,`default`,t.lat,t.lon,Math.min(t.radiusKm,25)));return Number.isFinite(e)?{value:e,note:{uk:`середнє в колі, 2020 (понад 1000 не розрізняється)`,en:`mean over the circle, 2020 (no detail above 1000)`}}:null}case`green`:case`ndvi`:{let n=M.ndvi.imagery,r=vd(n.last),i=await hd(`ndvi`,r,t.lat,t.lon,t.radiusKm);if(!i.length)return null;let a={uk:`липень ${r.slice(0,4)}`,en:`July ${r.slice(0,4)}`};return e===`green`?{value:100*i.filter(e=>e>=.5).length/i.length,note:a}:{value:_d(i),note:a}}case`heat`:{let e=M.lst.imagery,n=vd(e.last),r=_d(await hd(`lst`,n,t.lat,t.lon,t.radiusKm));return Number.isFinite(r)?{value:r,note:{uk:`удень, липень ${n.slice(0,4)}`,en:`daytime, July ${n.slice(0,4)}`}}:null}case`industry`:case`works`:{let n=await Sd(t.lat,t.lon,t.radiusKm),r=n?.[e];return n?r!==void 0&&Number.isFinite(r)?{value:r}:null:{value:NaN,note:{uk:`OpenStreetMap зараз перевантажений — спробуйте пізніше`,en:`OpenStreetMap is busy right now — try again later`}}}case`fires`:{if(!n?.fires)return null;let e=await b(n,t.lat,t.lon,30).catch(()=>null);return e?{value:e.count,note:{uk:`за 48 год у 30 км`,en:`48 h within 30 km`}}:null}case`aqi`:{let e=await g(t.lat,t.lon,n,25).catch(()=>null);return e?{value:e.station.aqi,km:e.km,note:{uk:`станція за ${Math.round(e.km)} км`,en:`station ${Math.round(e.km)} km away`}}:null}case`rad`:{let e=await C().catch(()=>[]),n=null;for(let r of e){let e=a(t.lat,t.lon,r.lat,r.lon);e<=30&&(!n||e<n.km)&&(n={usv:r.usv,km:e})}return n?{value:n.usv,km:n.km,note:{uk:`станція за ${Math.round(n.km)} км`,en:`station ${Math.round(n.km)} km away`}}:null}case`temp`:case`rain`:{let n=await wd(t.lat,t.lon);return n?{value:n[e],note:{uk:`середнє 2001–2020`,en:`mean 2001–2020`}}:null}case`elev`:{let e=await Td(t.lat,t.lon);return e===null?null:{value:e}}}}var Dd=class{canvas;ctx;width=0;height=0;dpr=1;constructor(e){this.canvas=document.createElement(`canvas`),this.canvas.className=e,this.canvas.setAttribute(`aria-hidden`,`true`),this.ctx=this.canvas.getContext(`2d`)}resize(e,t,n){this.width=e,this.height=t,this.dpr=n,this.canvas.width=Math.max(1,Math.round(e*n)),this.canvas.height=Math.max(1,Math.round(t*n)),this.canvas.style.width=`${e}px`,this.canvas.style.height=`${t}px`}begin(){this.ctx.setTransform(1,0,0,1,0,0),this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height),this.ctx.setTransform(this.dpr,0,0,this.dpr,0,0)}clear(){this.ctx.setTransform(1,0,0,1,0,0),this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height)}onScreen(e,t,n){return e>-n&&t>-n&&e<this.width+n&&t<this.height+n}};function Od(e){for(let[t,n]of[[6,5e6],[12,2e6],[24,1e6],[48,5e5],[96,25e4],[200,1e5]])if(e<t)return n;return 0}var kd=class extends Dd{cities=null;placed=[];widths=new Map;lang=`uk`;hovered=-1;get active(){return this.cities!==null}set(e){this.cities=e?[...e].sort((e,t)=>t.pop-e.pop):null,this.canvas.hidden=!e,this.placed=[],e||this.clear()}textWidth(e,t){let n=`${t}|${e}`,r=this.widths.get(n);return r===void 0&&(this.ctx.font=t,r=this.ctx.measureText(e).width,this.widths.set(n,r)),r}draw(e){this.begin(),this.placed=[];let t=this.cities;if(!t||!this.width)return;let n=Od(e.pixelsPerDegree()),r=e=>`${e?650:550} ${e?12:11}px Inter Variable, Inter, Arial, sans-serif`,i=`400 10px Inter Variable, Inter, Arial, sans-serif`,a=new Map,o=(e,t)=>t*4096+e,s=e=>{for(let t=Math.floor(e.y0/64);t<=Math.floor(e.y1/64);t++)for(let n=Math.floor(e.x0/64);n<=Math.floor(e.x1/64);n++)for(let r of a.get(o(n,t))??[])if(!(e.x1<r.x0||e.x0>r.x1||e.y1<r.y0||e.y0>r.y1))return!1;return!0},c=e=>{this.placed.push(e);for(let t=Math.floor(e.y0/64);t<=Math.floor(e.y1/64);t++)for(let n=Math.floor(e.x0/64);n<=Math.floor(e.x1/64);n++){let r=o(n,t),i=a.get(r);i?i.push(e):a.set(r,[e])}},l=[];for(let a of t){if(a.pop<n)break;let t=e.project(a.lat,a.lon);if(!t||!this.onScreen(t[0],t[1],40))continue;let[o,u]=t,d=a.pop>=1e6,f=a[this.lang],p=Ad(a.pop,this.lang),m=this.textWidth(f,r(d))+(p?5+this.textWidth(p,i):0),h={x0:o-5,y0:u-8,x1:o+8+m,y1:u+8};if(s(h))c({id:a.id,x:o,y:u,...h}),l.push({p:this.placed[this.placed.length-1],name:f,pop:p,big:d,dotOnly:!1});else{let e={x0:o-4,y0:u-4,x1:o+4,y1:u+4};if(!s(e))continue;c({id:a.id,x:o,y:u,...e}),l.push({p:this.placed[this.placed.length-1],name:f,pop:p,big:d,dotOnly:!0})}}let u=this.ctx;u.textBaseline=`middle`,u.lineJoin=`round`;for(let e of l){let{x:t,y:n}=e.p,a=e.p.id===this.hovered;if(u.beginPath(),u.arc(t,n,e.big?3.6:2.8,0,Math.PI*2),u.fillStyle=a?`#ffffff`:`#ffd9a8`,u.fill(),u.lineWidth=1.5,u.strokeStyle=`rgba(4,6,11,0.9)`,u.stroke(),e.dotOnly||(u.font=r(e.big),u.lineWidth=3,u.strokeStyle=`rgba(4,6,11,0.85)`,u.strokeText(e.name,t+7,n),u.fillStyle=a?`#ffffff`:`#f4f1ea`,u.fillText(e.name,t+7,n),!e.pop))continue;let o=t+7+this.textWidth(e.name,r(e.big))+5;u.font=i,u.strokeText(e.pop,o,n+.5),u.fillStyle=`rgba(214,220,232,0.72)`,u.fillText(e.pop,o,n+.5)}}hit(e,t){for(let n=this.placed.length-1;n>=0;n--){let r=this.placed[n];if(e>=r.x0&&e<=r.x1&&t>=r.y0&&t<=r.y1)return r.id}return-1}};function Ad(e,t){return e>=1e6?`${new Intl.NumberFormat(t===`uk`?`uk-UA`:`en-GB`,{maximumFractionDigits:1}).format(e/1e6)} ${t===`uk`?`млн`:`m`}`:e>=1e3?`${Math.round(e/1e3)} ${t===`uk`?`тис.`:`k`}`:``}var jd={layer:`Міста`,layerNote:`Великі міста світу (від 100 тис. людей) і міста України. Що ближче наблизите, то більше міст. Клацніть місто — відкриється картка, і його можна порівняти з іншим.`,card:{kind:`Місто`,capital:`Столиця`,pop:`Населення агломерації`,area:`Площа забудови`,density:`На 1 км² забудови`,now:`Тут зараз`,air:(e,t)=>`Повітря: AQI ${e} (станція за ${t} км)`,rad:(e,t)=>`Радіація: ${e} мкЗв/год (станція за ${t} км)`,fires:e=>e?`Пожеж за 48 год у 30 км: ${e}`:`Пожеж за 48 год у 30 км немає`,compareA:`Порівняти: місце A`,compareB:`Порівняти: місце B`,compareHint:`Оберіть два міста — і внизу з’явиться порівняння за всім: людьми, заводами, зеленню, пожежами, повітрям і кліматом.`,weather:`Погода тут`,myCity:`Зробити моїм містом`,close:`Закрити`,source:`Natural Earth: оцінка населення всієї міської агломерації`},compare:{tab:`Усе про місця`,title:`Порівняння за всім`,intro:`Кожне число — з відкритого джерела, порахованого в колі навколо міста (радіус у дужках).`,onlyPoints:`Порівняння за всім працює для міст і точок на мапі. Введіть місто в поле A чи B вгорі панелі або клацніть місто в шарі «Міста».`,pickB:`Додайте друге місто (B), щоб порівняти.`,loading:`рахую…`,none:`немає даних`,more:`більше`,better:`краще`,worse:`гірше`,groups:{people:`Люди`,industry:`Промисловість`,nature:`Природа`,now:`Зараз`,climate:`Клімат`},rows:{pop:{label:`Населення`,unit:`осіб`,help:`Уся міська агломерація, оцінка Natural Earth.`},area:{label:`Площа забудови`,unit:`км²`,help:`Суцільна міська забудова, Natural Earth.`},density:{label:`Густота населення`,unit:`осіб/км²`,help:`Для міста — населення на 1 км² забудови (Natural Earth); для точки — середнє в колі за NASA SEDAC GPWv4 (2020).`},industry:{label:`Промзони`,unit:`ділянок`,help:`Ділянки промислової забудови (landuse=industrial), позначені волонтерами OpenStreetMap. Залежить і від того, наскільки детально місто нанесено на мапу.`},works:{label:`Заводи й фабрики`,unit:`об’єктів`,help:`Підприємства, позначені в OpenStreetMap як завод (man_made=works).`},green:{label:`Зелень`,unit:`% площі`,help:`Частка кола, де рослинність густа (NDVI ≥ 0,5) у липні, NASA MODIS.`},ndvi:{label:`Індекс рослинності`,unit:`NDVI`,help:`Середній NDVI у липні: 0 — бетон і вода, 0,8 — густий ліс. NASA MODIS.`},heat:{label:`Нагрів поверхні влітку`,unit:`°C`,help:`Температура самої поверхні (дахів, асфальту, полів) удень у липні, NASA MODIS. Чим більше бетону й менше зелені, тим вища.`},fires:{label:`Пожежі поруч`,unit:`осередків`,help:`Пожежі за останні 48 годин у радіусі 30 км, NASA FIRMS.`},aqi:{label:`Якість повітря`,unit:`AQI`,help:`Індекс найближчої станції в межах 25 км: до 50 — чисте, понад 150 — брудне.`},rad:{label:`Радіаційний фон`,unit:`мкЗв/год`,help:`Найближча станція в межах 30 км.`},temp:{label:`Середня температура року`,unit:`°C`,help:`NASA POWER, кліматична норма.`},rain:{label:`Опади за рік`,unit:`мм`,help:`NASA POWER, кліматична норма.`},elev:{label:`Висота над морем`,unit:`м`,help:`Open-Meteo, модель рельєфу Copernicus.`}},sources:`Джерела: Natural Earth, NASA SEDAC, MODIS і POWER, OpenStreetMap (Overpass), NASA FIRMS, станції повітря й радіації, Open-Meteo.`,radius:e=>`радіус ${e} км`}},Md={layer:`Cities`,layerNote:`Big cities of the world (100 000 people and more) and the cities of Ukraine. The closer you zoom, the more cities. Click a city to open its card and compare it with another.`,card:{kind:`City`,capital:`Capital`,pop:`Urban area population`,area:`Built-up area`,density:`Per km² built up`,now:`Here now`,air:(e,t)=>`Air: AQI ${e} (station ${t} km away)`,rad:(e,t)=>`Radiation: ${e} µSv/h (station ${t} km away)`,fires:e=>e?`Fires in 48 h within 30 km: ${e}`:`No fires in 48 h within 30 km`,compareA:`Compare: place A`,compareB:`Compare: place B`,compareHint:`Pick two cities and a comparison by everything appears below: people, factories, green, fires, air and climate.`,weather:`Weather here`,myCity:`Make it my city`,close:`Close`,source:`Natural Earth: estimate for the city's whole urban area`},compare:{tab:`All about the places`,title:`Compared by everything`,intro:`Every number comes from an open source, counted in a circle around the city (radius in brackets).`,onlyPoints:`The comparison by everything works for cities and points on the map. Type a city into box A or B at the top of the panel, or click one on the Cities layer.`,pickB:`Add a second city (B) to compare.`,loading:`working…`,none:`no data`,more:`more`,better:`better`,worse:`worse`,groups:{people:`People`,industry:`Industry`,nature:`Nature`,now:`Now`,climate:`Climate`},rows:{pop:{label:`Population`,unit:`people`,help:`The whole urban area, Natural Earth's estimate.`},area:{label:`Built-up area`,unit:`km²`,help:`Continuous urban land, Natural Earth.`},density:{label:`Population density`,unit:`people/km²`,help:`For a city, people per km² built up (Natural Earth); for a point, the mean over the circle from NASA SEDAC GPWv4 (2020).`},industry:{label:`Industrial areas`,unit:`areas`,help:`Industrial land (landuse=industrial) mapped by OpenStreetMap volunteers. It also depends on how fully the city is mapped.`},works:{label:`Factories and plants`,unit:`sites`,help:`Works mapped in OpenStreetMap (man_made=works).`},green:{label:`Green`,unit:`% of area`,help:`Share of the circle with dense plants (NDVI ≥ 0.5) in July, NASA MODIS.`},ndvi:{label:`Vegetation index`,unit:`NDVI`,help:`Mean NDVI in July: 0 is concrete and water, 0.8 dense forest. NASA MODIS.`},heat:{label:`Summer surface heat`,unit:`°C`,help:`Temperature of the surface itself (roofs, asphalt, fields) by day in July, NASA MODIS. More concrete and less green make it higher.`},fires:{label:`Fires nearby`,unit:`hotspots`,help:`Fires of the last 48 hours within 30 km, NASA FIRMS.`},aqi:{label:`Air quality`,unit:`AQI`,help:`Index of the nearest station within 25 km: up to 50 clean, over 150 unhealthy.`},rad:{label:`Background radiation`,unit:`µSv/h`,help:`The nearest station within 30 km.`},temp:{label:`Mean yearly temperature`,unit:`°C`,help:`NASA POWER climate normal.`},rain:{label:`Rain and snow a year`,unit:`mm`,help:`NASA POWER climate normal.`},elev:{label:`Height above sea level`,unit:`m`,help:`Open-Meteo, Copernicus elevation model.`}},sources:`Sources: Natural Earth, NASA SEDAC, MODIS and POWER, OpenStreetMap (Overpass), NASA FIRMS, air and radiation stations, Open-Meteo.`,radius:e=>`radius ${e} km`}};function Nd(){return f().lang===`uk`?jd:Md}var Pd=(e,t)=>Ad(e,t)||String(e);function Fd({place:e,manifest:t,onCompare:n,onWeather:r,onClose:i}){let{lang:a}=f(),o=Nd().card,[,s]=A(),[c,l]=(0,R.useState)({key:``}),u=`${e.lat},${e.lon}`;(0,R.useEffect)(()=>{let n=!1,r={lat:e.lat,lon:e.lon,radiusKm:15};for(let e of[`aqi`,`rad`,`fires`])Ed(e,r,t).catch(()=>null).then(t=>!n&&l(n=>({...n.key===u?n:{key:u},[e]:t})));return()=>{n=!0}},[u,!!t]);let d=c.key===u?c:{key:u},p=new Intl.NumberFormat(a===`uk`?`uk-UA`:`en-GB`),m=e.code?I(e.code,a):``,h=e=>Math.round(e?.km??0);return(0,B.jsxs)(`section`,{className:`city-card`,"aria-label":e.name[a],children:[(0,B.jsxs)(`header`,{className:`city-card__head`,children:[(0,B.jsxs)(`div`,{children:[(0,B.jsxs)(`p`,{className:`city-card__kind`,children:[e.capital?o.capital:o.kind,m&&` · ${m}`]}),(0,B.jsx)(`h2`,{className:`city-card__title`,children:e.name[a]})]}),(0,B.jsx)(`button`,{type:`button`,className:`icon-btn icon-btn--bare`,"aria-label":o.close,onClick:i,children:(0,B.jsx)(S,{name:`close`,size:18})})]}),e.pop?(0,B.jsxs)(`dl`,{className:`city-card__facts`,children:[(0,B.jsxs)(`div`,{children:[(0,B.jsx)(`dt`,{children:o.pop}),(0,B.jsx)(`dd`,{children:Pd(e.pop,a)})]}),e.areaKm2?(0,B.jsxs)(`div`,{children:[(0,B.jsx)(`dt`,{children:o.area}),(0,B.jsxs)(`dd`,{children:[p.format(e.areaKm2),` `,a===`uk`?`км²`:`km²`]})]}):null,e.areaKm2?(0,B.jsxs)(`div`,{children:[(0,B.jsx)(`dt`,{children:o.density}),(0,B.jsx)(`dd`,{children:p.format(Math.round(e.pop/e.areaKm2))})]}):null]}):null,(0,B.jsxs)(`div`,{className:`city-card__now`,children:[(0,B.jsx)(`p`,{className:`city-card__sub`,children:o.now}),(0,B.jsxs)(`ul`,{children:[d.aqi&&(0,B.jsx)(`li`,{children:o.air(Math.round(d.aqi.value),h(d.aqi))}),d.rad&&(0,B.jsx)(`li`,{children:o.rad(y(d.rad.value,a),h(d.rad))}),d.fires&&(0,B.jsx)(`li`,{children:o.fires(d.fires.value)})]})]}),(0,B.jsxs)(`div`,{className:`city-card__actions`,children:[(0,B.jsxs)(`button`,{type:`button`,className:`chip-btn`,onClick:()=>n(`A`),children:[(0,B.jsx)(`span`,{className:`place-cmp__slot place-cmp__slot--a`,children:`A`}),o.compareA]}),(0,B.jsxs)(`button`,{type:`button`,className:`chip-btn`,onClick:()=>n(`B`),children:[(0,B.jsx)(`span`,{className:`place-cmp__slot place-cmp__slot--b`,children:`B`}),o.compareB]}),(0,B.jsxs)(`button`,{type:`button`,className:`chip-btn`,onClick:r,children:[(0,B.jsx)(S,{name:`weather`,size:16}),o.weather]}),(0,B.jsxs)(`button`,{type:`button`,className:`chip-btn`,onClick:()=>s({name:e.name[a],lat:e.lat,lon:e.lon,cc:e.code,country:m||void 0,population:e.pop}),children:[(0,B.jsx)(S,{name:`pin`,size:16}),o.myCity]})]}),(0,B.jsx)(`p`,{className:`note`,children:o.compareHint}),e.pop?(0,B.jsx)(`p`,{className:`legend__src`,children:o.source}):null]})}var Id=.5,Ld=9e3,Rd=111320;function zd(e){let t=e>>>0;return()=>{t=t+1831565813>>>0;let e=t;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}}var Bd=class{life;tracks=[];sources;maxPower;constructor(e,t,n={}){this.sources=e,this.life=n.life??18;let r=e.reduce((e,t)=>e+Math.max(0,t.t1-t.t0),0),i=Math.max(n.every??.5,r/Ld),a=n.diffusion??1500,o=Math.sqrt(2*a*Id*3600),s=zd(e.length*7919+17);this.maxPower=Math.max(1,...e.map(e=>e.power));let c=Math.ceil(this.life/Id);for(let n of e)for(let e=n.t0;e<=n.t1;e+=i){let r=c+1,i=new Float32Array(r),a=new Float32Array(r),l=n.lat+(s()-.5)*.01,u=n.lon+(s()-.5)*.014;i[0]=l,a[0]=u;let d=!0;for(let n=1;n<=c;n++){let c=t(l,u,e+(n-.5)*Id);if(!c){d=n>4;for(let e=n;e<r;e++)i[e]=NaN,a[e]=NaN;break}let f=Math.max(.15,Math.cos(l*Math.PI/180)),p=Math.sqrt(-2*Math.log(s()+1e-9))*Math.cos(2*Math.PI*s()),m=Math.sqrt(-2*Math.log(s()+1e-9))*Math.cos(2*Math.PI*s());l+=(c[1]*Id*3600+p*o)/Rd,u+=(c[0]*Id*3600+m*o)/(Rd*f),i[n]=l,a[n]=u}d&&this.tracks.push({te:e,power:n.power,seed:Math.floor(s()*1e9),lat:i,lon:a})}}strength(e){return Math.min(1,Math.log1p(e)/Math.log1p(this.maxPower))}};function Vd(e){for(let[t,n,r,i]of[[0,9,0,50],[9.1,35.4,51,100],[35.5,55.4,101,150],[55.5,125.4,151,200],[125.5,225.4,201,300],[225.5,325.4,301,500]])if(e<=n)return Math.round(r+(i-r)*(Math.max(e,t)-t)/(n-t));return 500}var Hd=[50,100,150,200,300],Ud=[`#34d17a`,`#f5d547`,`#ff9d3a`,`#ff5a5f`,`#b04bd6`,`#8a1a3a`],Wd=e=>{let t=Hd.findIndex(t=>e<=t);return Ud[t===-1?Ud.length-1:t]},Gd=class extends Dd{model=null;wind=null;box=null;towns=[];time=0;townStart=0;constructor(e){super(e),this.canvas.hidden=!0}setTime(e){this.time=e}get active(){return this.model!==null}get sim(){return this.model}set(e,t=null,n=null){this.model=e,this.wind=t,this.box=n,this.canvas.hidden=!e,e||this.clear()}setTowns(e){this.towns=e}townAqi(e=this.time){let t=e-this.townStart;return this.towns.map(e=>{let n=Math.floor(t),r=e.pm25[Math.max(0,Math.min(e.pm25.length-1,n))],i=e.pm25[Math.max(0,Math.min(e.pm25.length-1,n+1))],a=Number.isFinite(r)&&Number.isFinite(i)?r+(i-r)*(t-n):r;return Number.isFinite(a)?Vd(a):NaN})}draw(e,t){let n=this.ctx;if(this.begin(),!this.model||!this.width)return;let r=this.time;this.wind&&this.box&&this.drawWind(e,r,t);let i=this.townAqi(r);n.font=`600 11px system-ui, sans-serif`,n.textAlign=`center`,n.textBaseline=`middle`,this.towns.forEach((t,r)=>{let a=e.project(t.lat,t.lon);if(!a)return;let o=i[r];n.beginPath(),n.arc(a[0],a[1],13,0,Math.PI*2),n.fillStyle=Number.isFinite(o)?Wd(o):`rgba(120,130,145,0.9)`,n.fill(),n.lineWidth=2,n.strokeStyle=`rgba(4,6,11,0.85)`,n.stroke(),n.fillStyle=Number.isFinite(o)&&o>150?`#fff`:`#0b0e14`,n.fillText(Number.isFinite(o)?String(o):`–`,a[0],a[1]+.5),n.fillStyle=`#e9edf5`,n.strokeStyle=`rgba(4,6,11,0.9)`,n.lineWidth=3,n.strokeText(t.name,a[0],a[1]+13+9),n.fillText(t.name,a[0],a[1]+13+9)})}drawWind(e,t,n){let r=this.ctx,i=this.box;r.lineCap=`round`;for(let a=0;a<=6;a++)for(let o=0;o<=6;o++){let s=i.s+(i.n-i.s)*(a+.5)/7,c=i.w+(i.e-i.w)*(o+.5)/7,l=this.wind(s,c,t),u=e.project(s,c);if(!l||!u)continue;let d=Math.hypot(l[0],l[1]);if(d<.3)continue;let f=l[0]/d,p=-l[1]/d,m=12+Math.min(30,d*2.4),h=u[0]-f*m/2,g=u[1]-p*m/2,_=h+f*m,v=g+p*m;r.strokeStyle=`rgba(190,225,255,0.55)`,r.lineWidth=1.6,r.beginPath(),r.moveTo(h,g),r.lineTo(_,v),r.lineTo(_-f*6-p*4,v-p*6+f*4),r.moveTo(_,v),r.lineTo(_-f*6+p*4,v-p*6-f*4),r.stroke();let y=(n/1e3*(.4+d*.08)+o*.37+a*.61)%1;r.fillStyle=`rgba(225,242,255,0.9)`,r.beginPath(),r.arc(h+f*m*y,g+p*m*y,1.6,0,Math.PI*2),r.fill()}}},Kd=[[19.41,-155.28],[19.48,-155.6],[37.75,15],[38.79,15.21],[13.6,40.67],[-1.52,29.25],[-1.41,29.2],[11.98,-86.16],[-39.42,-71.93],[-16.25,168.12],[-21.24,55.71],[19.02,-98.62],[14.47,-90.88],[56.06,160.64],[56.65,161.36],[-7.54,110.44],[-8.11,112.92],[13.26,123.69],[63.88,-22.4],[-77.53,167.15]],qd=(e,t,n)=>Kd.some(([r,i])=>Math.abs(r-e)<.2&&a(e,t,r,i)<n),Jd=1,Yd=1;function Xd(e,t,n=12,r=20){let i=new Map;for(let t=0;t<e.count;t++){if(qd(e.lat[t],e.lon[t],15))continue;let n=Math.floor(e.lat[t]/Jd),r=Math.floor(e.lon[t]/Jd),a=`${n},${r}`,o=i.get(a);o||i.set(a,o={r:n,c:r,power:0,points:[]}),o.power+=Math.max(1,e.frp[t]),o.points.push(t)}let a=[...i.values()].sort((e,t)=>t.power-e.power),o=new Set,s=[];for(let c of a){if(s.length>=n)break;if(o.has(`${c.r},${c.c}`))continue;let a=[];for(let e=-1;e<=Yd;e++)for(let t=-1;t<=Yd;t++){let n=`${c.r+e},${c.c+t}`;o.has(n)||a.push(...i.get(n)?.points??[])}for(let e=-3;e<=3;e++)for(let t=-3;t<=3;t++)o.add(`${c.r+e},${c.c+t}`);if(a.length<r)continue;let l=0,u=0,d=0,f=0,p=0,m={s:90,w:180,n:-90,e:-180};for(let n of a){let r=Math.max(1,e.frp[n]);l+=r,u+=e.lat[n]*r,d+=e.lon[n]*r;let i=e.ageMin[n]/60+t;i<=24?f++:i<=48&&p++,m.s=Math.min(m.s,e.lat[n]),m.n=Math.max(m.n,e.lat[n]),m.w=Math.min(m.w,e.lon[n]),m.e=Math.max(m.e,e.lon[n])}s.push({id:`${c.r},${c.c}`,lat:u/l,lon:d/l,box:m,lastDay:f,dayBefore:p,power:l,points:a})}return s.sort((e,t)=>t.power-e.power)}function Zd(e){return e.dayBefore<20?null:Math.round((e.lastDay-e.dayBefore)/Math.max(1,e.dayBefore)*100)}function Qd(e,t,n,r=70){let i=new Map;for(let n of t.points){let t=`${Math.round(e.lat[n]*10)},${Math.round(e.lon[n]*10)}`,r=i.get(t),a=Math.max(1,e.frp[n]);r?(r.lat+=e.lat[n],r.lon+=e.lon[n],r.n++,r.power+=a):i.set(t,{lat:e.lat[n],lon:e.lon[n],n:1,power:a})}return[...i.values()].sort((e,t)=>t.power-e.power).slice(0,r).map(e=>({lat:e.lat/e.n,lon:e.lon/e.n,t0:0,t1:n,power:e.power}))}function $d(e,t,n){let r=e*1.8+32,i=Math.max(0,Math.min(100,t)),a=i<10?.03229+.281073*i-578e-6*i*r:i<50?2.22749+.160107*i-.01478*r:21.0606+.005565*i*i-35e-5*i*r-.483199*i,o=Math.max(0,a)/30,s=1-2*o+1.5*o*o-.5*o*o*o,c=n/1.609344;return Math.max(0,Math.min(100,s*Math.sqrt(1+c*c)/.3002))}var ef=e=>e<25?0:e<40?1:e<55?2:3;async function tf(e,t){let n=await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${e.toFixed(3)}&longitude=${t.toFixed(3)}&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation&forecast_days=3&timezone=auto`);if(!n.ok)throw Error(`forecast ${n.status}`);let r=(await n.json()).hourly;if(!r)return[];let i=new Map;return r.time.forEach((e,t)=>{let n=e.slice(0,10),a=$d(r.temperature_2m[t],r.relative_humidity_2m[t],r.wind_speed_10m[t]),o=i.get(n)??{date:n,maxIndex:0,rainMm:0,maxWindKmh:0,minRh:100};o.maxIndex=Math.max(o.maxIndex,a),o.rainMm+=r.precipitation[t]??0,o.maxWindKmh=Math.max(o.maxWindKmh,r.wind_speed_10m[t]),o.minRh=Math.min(o.minRh,r.relative_humidity_2m[t]),i.set(n,o)}),[...i.values()]}function nf(e,t,n,r,i){return e.filter(e=>Math.abs(e.lat-t)<r/100).map(e=>({...e,km:a(t,n,e.lat,e.lon)})).filter(e=>e.km<=r).sort((e,t)=>t.pop-e.pop).slice(0,i)}async function rf(e,t=Date.now()){if(!e.length)return[];let n=await fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?`+new URLSearchParams({latitude:e.map(e=>e.lat.toFixed(3)).join(`,`),longitude:e.map(e=>e.lon.toFixed(3)).join(`,`),hourly:`pm2_5`,forecast_days:`3`,timezone:`GMT`}));if(!n.ok)throw Error(`air ${n.status}`);let r=await n.json(),i=Array.isArray(r)?r:[r];return e.map((e,n)=>{let r=i[n]?.hourly;if(!r)return null;let a=NaN,o=-1,s=``;return r.time.forEach((e,n)=>{let i=Date.parse(`${e}:00Z`),c=r.pm2_5[n];if(c==null||i+36e5<=t)return;let l=Vd(c);Number.isFinite(a)||(a=l),l>o&&(o=l,s=new Date(i).toISOString())}),Number.isFinite(a)?{name:e.name,km:e.km,nowAqi:a,worstAqi:o,worstTime:s}:null}).filter(e=>!!e).sort((e,t)=>t.worstAqi-e.worstAqi)}var af=(e,t,n)=>`https://worldview.earthdata.nasa.gov/?v=${n}&l=${e}&t=${t}`,of=`MODIS_Terra_CorrectedReflectance_TrueColor,VIIRS_SNPP_Thermal_Anomalies_375m_All`,sf=`MODIS_Terra_CorrectedReflectance_TrueColor`,cf={label:`NASA FIRMS, VIIRS 375 m`,url:`https://firms.modaps.eosdis.nasa.gov/`},lf=[{id:`chornobyl-fires`,lat:51.35,lon:30.1,kind:`fire`,layer:`fires`,ukraine:!0,title:{uk:`Пожежі в Чорнобильській зоні`,en:`Fires in the Chornobyl zone`},when:{from:`2020-04-04`,to:`2020-04-28`},place:{uk:`Зона відчуження й ліси Полісся, Київська й Житомирська області`,en:`The Exclusion Zone and the Polissia forests, Kyiv and Zhytomyr regions`},text:{uk:`4 квітня 2020 року в зоні відчуження загорілася суха трава. Вогонь понад два тижні йшов лісами Полісся й підходив на кілька кілометрів до ЧАЕС; гасили його сотні рятувальників з авіацією.`,en:`On 4 April 2020 dry grass caught fire in the Exclusion Zone. For more than two weeks the fire moved through the Polissia forests and came within a few kilometres of the Chornobyl plant; hundreds of firefighters fought it with aircraft.`},causes:[{uk:`Підпал сухої трави людьми: поліція встановила підозрюваного, який підпалив траву «для розваги».`,en:`People setting dry grass alight: police identified a suspect who set grass on fire "for fun".`},{uk:`Суха, майже безсніжна зима й весна та сильний вітер: вогонь швидко біг сухою травою й сосняками.`,en:`A dry, almost snowless winter and spring and a strong wind: the fire ran fast through dry grass and pine woods.`},{uk:`У зоні мало доріг і людей, тож пожежі помічають і досягають пізно.`,en:`The zone has few roads and people, so fires are spotted and reached late.`}],effects:[{uk:`Дим кілька днів накривав Київ: 16–17 квітня місто мало одне з найбрудніших повітря серед великих міст світу.`,en:`Smoke covered Kyiv for several days: on 16-17 April the city had some of the dirtiest air of the world’s big cities.`},{uk:`Дим із забруднених ділянок може піднімати радіоактивні частинки (передусім цезій-137) і переносити їх далеко; у Києві, за офіційними вимірюваннями, фон лишався в нормі.`,en:`Smoke from contaminated areas can lift radioactive particles (mostly caesium-137) and carry them far; in Kyiv official measurements kept the background within the norm.`},{uk:`Згоріли тисячі гектарів лісу й покинуті села зони; за 26 днів супутник VIIRS зафіксував 4 079 пікселів вогню.`,en:`Thousands of hectares of forest and abandoned villages of the zone burned; over 26 days VIIRS recorded 4,079 fire pixels.`}],action:{uk:`Не палити суху траву, прокладати протипожежні смуги, патрулювати зону навесні й гасити осередки, поки вони малі.`,en:`Do not burn dry grass, plough firebreaks, patrol the zone in spring and put out fires while they are small.`},storyId:`chornobyl-2020`,show:{layer:`fires`,date:`2020-04-08`,distance:1.08},photo:L.chornobyl,sources:[{label:`NASA Earth Observatory: Fires Burn in Northern Ukraine`,url:`https://science.nasa.gov/earth/earth-observatory/fires-burn-in-northern-ukraine-146561/`},cf],worldview:af(of,`2020-04-08`,`28.5,50.3,31.7,52.3`)},{id:`field-burning`,lat:48.6,lon:32.3,kind:`fire`,layer:`fires`,ukraine:!0,title:{uk:`Весняне паління полів: 552 пожежі за день`,en:`Spring field burning: 552 fires in a day`},when:{from:`2018-04-09`},place:{uk:`Уся Україна, найбільше — центр, південь і схід`,en:`All of Ukraine, most of all the centre, south and east`},text:{uk:`9 квітня 2018 року супутниковий прилад VIIRS (Suomi NPP) нарахував у межах України 552 окремі осередки вогню — значно більше, ніж у сусідніх країнах. Здебільшого це були поля, які палили перед сівбою. Кнопка нижче покаже ці точки на глобусі саме за той день, а «історія пожеж» — як їх ставало більше день за днем у квітні 2018 року.`,en:`On 9 April 2018 the VIIRS instrument (Suomi NPP) counted 552 separate fire hotspots inside Ukraine — far more than in neighbouring countries. Most were fields burned before sowing. The button below shows these very points on the globe for that day, and the fire story how they multiplied day by day in April 2018.`},causes:[{uk:`Найдешевший спосіб очистити поле: стерню, солому й торішню траву спалюють, щоб швидко підготувати землю до сівби.`,en:`The cheapest way to clear a field: stubble, straw and last year’s grass are burned to get the land ready for sowing quickly.`},{uk:`Це масова практика: понад 57 % усіх пожеж, які VIIRS бачив в Україні у 2016–2017 роках, пов’язані з розчищенням полів перед сівбою й спаленням решток після жнив.`,en:`It is widespread: over 57% of all fires VIIRS saw in Ukraine in 2016-2017 were linked to clearing fields before sowing and burning crop remains after harvest.`},{uk:`Суха весна й вітер: з поля вогонь легко перекидається на узбіччя, лісосмуги, ліси й торфовища.`,en:`A dry spring and wind: from a field the fire easily jumps to roadsides, shelter belts, forests and peat bogs.`}],effects:[{uk:`Дим із дрібним пилом PM2.5 і чадним газом погіршує повітря в містах за сотні кілометрів.`,en:`Smoke with fine PM2.5 particles and carbon monoxide worsens the air in cities hundreds of kilometres away.`},{uk:`Згорає органічна речовина ґрунту, гинуть корисні комахи, черв’яки й гнізда птахів — поле стає біднішим.`,en:`The soil’s organic matter burns, useful insects, worms and bird nests die — the field becomes poorer.`},{uk:`Вогонь з полів перекидається на ліси, села й дачі; щовесни рятувальники гасять тисячі таких пожеж.`,en:`Fire spreads from fields to forests, villages and summer houses; every spring firefighters put out thousands of such fires.`}],action:{uk:`Заорювати чи подрібнювати рештки, сіяти без оранки по стерні. Незаконне випалювання сухої рослинності карається штрафом (ст. 77-1 КУпАП); про пожежу дзвоніть 101.`,en:`Plough in or shred the remains, or sow straight into the stubble. Illegal burning of dry vegetation is fined (Code of Administrative Offences, art. 77-1); report a fire on 101.`},storyId:`fields-2018`,show:{layer:`fires`,date:`2018-04-09`,distance:1.55},photo:L.noBurn,sources:[{label:`NASA: Fires in Ukraine Most Likely Agricultural in Nature`,url:`https://www.nasa.gov/image-article/fires-ukraine-most-likely-agricultural-nature/`},{label:`Hall et al. 2021, Environmental Research Letters 16 064019`,url:`https://doi.org/10.1088/1748-9326/abfee1`},{label:`КУпАП, ст. 77-1`,url:`https://zakon.rada.gov.ua/laws/show/80731-10`},cf],worldview:af(of,`2018-04-09`,`22,44,41,53`)},{id:`luhansk-2020`,lat:48.95,lon:39,kind:`fire`,layer:`fires`,ukraine:!0,title:{uk:`Лісові пожежі на Луганщині`,en:`Forest fires in the Luhansk region`},when:{from:`2020-09-30`,to:`2020-10-08`},place:{uk:`Станично-Луганський, Новоайдарський і Сєвєродонецький райони вздовж Сіверського Дінця`,en:`Stanytsia Luhanska, Novoaidar and Sievierodonetsk districts along the Siverskyi Donets`},text:{uk:`30 вересня 2020 року за посухи й сильного вітру на Луганщині одночасно спалахнули ліси й поля вздовж Сіверського Дінця. Останні осередки загасили лише 8 жовтня.`,en:`On 30 September 2020, in drought and strong wind, forests and fields along the Siverskyi Donets in the Luhansk region caught fire at once. The last fires were put out only on 8 October.`},causes:[{uk:`Тривала посуха: ліси й трава на кінець літа повністю висохли.`,en:`A long drought: the forests and grass had dried out completely by the end of summer.`},{uk:`Сильний вітер одночасно розносив вогонь з багатьох осередків.`,en:`A strong wind spread the fire from many places at once.`},{uk:`Біля лінії розмежування багато мін і нерозірваних снарядів: пожежникам туди важко дістатися. Як саме виник вогонь, встановлювало слідство.`,en:`Near the contact line there are many mines and unexploded shells, so firefighters could hardly get there. How the fire started was a matter for the investigation.`}],effects:[{uk:`Загинули щонайменше 11 людей, ще 17 потрапили до лікарень з опіками й отруєнням чадним газом (дані на 1 жовтня 2020).`,en:`At least 11 people died and 17 more were taken to hospital with burns and carbon monoxide poisoning (as of 1 October 2020).`},{uk:`До зони пожеж потрапили 32 населені пункти; згоріли житлові будинки й господарські споруди.`,en:`32 settlements were in the fire zone; houses and farm buildings burned.`},{uk:`Лише одна з пожеж, біля Боброве, Воронове й Боровського, пройшла близько 6 тис. га лісу.`,en:`Just one of the fires, near Bobrove, Voronove and Borovske, swept about 6,000 ha of forest.`}],action:{uk:`Протипожежні розриви в лісах, розмінування, раннє виявлення пожеж із супутників і дронів.`,en:`Firebreaks in the forests, demining, and early fire detection from satellites and drones.`},storyId:`luhansk-2020`,show:{layer:`fires`,date:`2020-10-01`,distance:1.08},sources:[{label:`Кабмін: пожежі в Луганській області ліквідовані`,url:`https://www.kmu.gov.ua/news/pozhezhi-v-prirodnih-ekosistemah-na-teritoriyi-luganskoyi-oblasti-yaki-vinikli-30-veresnya-ta-1-zhovtnya-likvidovani`},{label:`АрміяInform: усі пожежі на Луганщині ліквідовані`,url:`https://armyinform.com.ua/2020/10/08/usi-pozhezhi-v-ekosystemah-luganskoyi-oblasti-likvidovani/`},cf],worldview:af(of,`2020-10-01`,`37.5,48.2,40.6,50`)},{id:`front-fires-2022`,lat:47.6,lon:36.2,kind:`war`,layer:`fires`,ukraine:!0,title:{uk:`Пожежі вздовж фронту`,en:`Fires along the front`},when:{from:`2022-02-24`,to:`2022-11-30`},place:{uk:`Південь і схід України: Херсонщина, Запоріжжя, Донбас, Харківщина`,en:`The south and east of Ukraine: Kherson, Zaporizhzhia, Donbas, Kharkiv regions`},text:{uk:`Від початку повномасштабного вторгнення супутники щодня бачать смугу вогню, що тягнеться вздовж лінії фронту: горять поля, ліси й села. За 280 днів 2022 року VIIRS зафіксував на півдні й сході 25 114 осередків вогню.`,en:`Since the full-scale invasion began, satellites see a band of fire every day along the front line: fields, forests and villages burn. In 280 days of 2022 VIIRS recorded 25,114 fire detections in the south and east.`},causes:[{uk:`Обстріли, ракети й дрони підпалюють суху траву, стерню й ліси.`,en:`Shelling, missiles and drones set dry grass, stubble and forests alight.`},{uk:`Біля фронту пожежі ніхто не гасить: там стріляють, а землю заміновано.`,en:`Near the front nobody can fight the fires: there is shooting and the ground is mined.`},{uk:`Покинуті поля заростають бур’яном, який улітку стає паливом.`,en:`Abandoned fields fill with weeds that become fuel in summer.`}],effects:[{uk:`Майже третина лісів України зазнала пошкоджень; на підконтрольній території війна спричинила лісові пожежі на ≈ 40 000 га.`,en:`Nearly a third of Ukraine’s forests have been damaged; on Ukrainian-controlled land the war caused forest fires over about 40,000 ha.`},{uk:`Ландшафтні пожежі дали 49,4 млн т CO₂-еквіваленту — 21 % усіх викидів війни за перші три роки.`,en:`Landscape fires released 49.4 million t of CO₂-equivalent — 21% of the war’s emissions in its first three years.`},{uk:`Згарища й міни роками не дають обробляти поля й відновлювати ліси.`,en:`Burned and mined land keeps fields from being farmed and forests from regrowing for years.`}],action:{uk:`Розмінування, відновлення лісів, облік шкоди довкіллю для майбутніх репарацій.`,en:`Demining, replanting forests, and recording the environmental damage for future reparations.`},storyId:`front-2022`,show:{layer:`fires`,date:`2022-08-20`,distance:1.25},sources:[cf,{label:`Держлісагентство: наслідки агресії для лісів`,url:`https://forest.gov.ua/en/news/at-the-uns-main-global-forest-forum-in-new-york-the-consequences-of-russian-aggression-for-ukraines-forest-ecosystems-were-discussed`},{label:`Initiative on GHG Accounting of War`,url:`https://planetarysecurityinitiative.org/news/climate-damage-caused-russias-war-ukraine-1`}]},{id:`kakhovka`,lat:47.2,lon:34.2,kind:`war`,layer:`soil`,ukraine:!0,title:{uk:`Руйнування Каховської ГЕС`,en:`The destruction of the Kakhovka dam`},when:{from:`2023-06-06`},place:{uk:`Нова Каховка, Херсонська область; водосховище між Запоріжжям і Херсоном`,en:`Nova Kakhovka, Kherson region; the reservoir between Zaporizhzhia and Kherson`},text:{uk:`Рано-вранці 6 червня 2023 року греблю Каховської ГЕС зруйновано. Вода затопила береги нижче за течією, а водосховище, що тримало 18 км³ води, за кілька тижнів перетворилося на поле мулу; канали, що брали з нього воду, зокрема Північнокримський, пересохли.`,en:`Early on 6 June 2023 the Kakhovka dam was destroyed. Water flooded the banks downstream, and the reservoir, which held 18 km³ of water, turned into a field of mud within weeks; the canals that drew water from it, including the North Crimean Canal, ran dry.`},causes:[{uk:`Греблю, яку з 2022 року контролювали російські війська, зруйновано; Україна розслідує це як воєнний злочин.`,en:`The dam, held by Russian forces since 2022, was destroyed; Ukraine is investigating it as a war crime.`},{uk:`Водосховище існувало лише завдяки греблі: без неї Дніпро повернувся у старе русло.`,en:`The reservoir existed only because of the dam: without it the Dnipro returned to its old bed.`}],effects:[{uk:`6–9 червня затопило близько 620 км²; загинула 31 людина, понад 40 тисяч людей евакуювали.`,en:`About 620 km² flooded on 6-9 June; 31 people died and more than 40,000 were evacuated.`},{uk:`До 18 червня витекло близько 75 % води; зрошувальні канали півдня, що поливали до 500 000 га полів, лишилися без води.`,en:`By 18 June about 75% of the water had drained; the southern irrigation canals, which watered up to 500,000 ha of fields, lost their water.`},{uk:`Під воду пішли 88 небезпечних об’єктів і понад 90 % Нижньодніпровської дельти; мул і забруднення дійшли до Чорного моря.`,en:`88 hazardous sites and over 90% of the Lower Dnipro Delta went under water; silt and pollution reached the Black Sea.`}],action:{uk:`Розмінувати береги, відновити водопостачання міст і зрошення; на колишньому дні вже швидко росте молодий ліс.`,en:`Clear the mines from the banks and restore water for towns and irrigation; a young forest is already growing fast on the former bed.`},show:{layer:`truecolor`,date:`2023-06-18`,distance:1.07},photo:L.kherson,sources:[{label:`NASA Earth Observatory: Canals in Ukraine are Drying Up`,url:`https://earthobservatory.nasa.gov/images/151622/canals-in-ukraine-are-drying-up`},{label:`CEOBS: Analysing the environmental consequences of the Kakhovka dam collapse`,url:`https://ceobs.org/analysing-the-environmental-consequences-of-the-kakhovka-dam-collapse/`}],worldview:af(sf,`2023-06-18`,`32,45.8,36,48.2`),caseId:`kakhovka`},{id:`kyiv-blackout`,lat:50.45,lon:30.52,kind:`light`,layer:`nightlights`,ukraine:!0,title:{uk:`Блекаут після ударів по енергосистемі`,en:`Blackout after strikes on the power grid`},when:{from:`2022-11-23`,to:`2022-11-25`},place:{uk:`Уся Україна; на знімку — ніч на 25 листопада 2022`,en:`All of Ukraine; the image is the night of 25 November 2022`},text:{uk:`Після масованих ракетних ударів по енергосистемі 23 листопада 2022 року більша частина України залишилася без світла. На нічному знімку VIIRS 25 листопада країна майже темна, а сусідні Молдова, Білорусь і Росія світяться. Кнопка нижче відкриє порівняння: ліворуч Україна 3 жовтня 2021 року, праворуч — 25 листопада 2022-го.`,en:`After massive missile strikes on the power grid on 23 November 2022 most of Ukraine lost power. On the VIIRS night image of 25 November the country is almost dark while neighbouring Moldova, Belarus and Russia glow. The button below opens the comparison: Ukraine on 3 October 2021 on the left, 25 November 2022 on the right.`},causes:[{uk:`Російські ракетні й дронові удари по цивільній енергетиці: електростанціях і підстанціях.`,en:`Russian missile and drone strikes on civilian energy: power plants and substations.`},{uk:`Підстанції з’єднують енергосистему в одне ціле; коли їх уражено, захисна автоматика вимикає цілі регіони, щоб зберегти мережу.`,en:`Substations tie the grid together; when they are hit, protection systems switch off whole regions to save the network.`}],effects:[{uk:`Мільйони людей залишилися без світла, а в багатьох містах — без води й опалення, бо насоси й котельні працюють від електрики.`,en:`Millions of people were left without power, and in many cities without water and heating, because pumps and boiler houses run on electricity.`},{uk:`На тижні запроваджували графіки відключень; люди грілися й заряджали телефони в «пунктах незламності».`,en:`Scheduled outages lasted for weeks; people kept warm and charged phones at "invincibility points".`}],action:{uk:`Ремонт мереж, захист підстанцій, генератори й «пункти незламності», розподілена енергетика: сонячні панелі й невеликі станції.`,en:`Repair the grid, protect substations, generators and heated "invincibility points", and spread out power: solar panels and small plants.`},blackout:!0,photo:L.kyivDark,sources:[{label:`NASA Black Marble`,url:`https://blackmarble.gsfc.nasa.gov/`}],worldview:af(`VIIRS_SNPP_DayNightBand`,`2022-11-25`,`22,44,41,53`)},{id:`la-2025`,lat:34.12,lon:-118.35,kind:`fire`,layer:`fires`,title:{uk:`Пожежі в Лос-Анджелесі`,en:`The Los Angeles fires`},when:{from:`2025-01-07`,to:`2025-01-31`},place:{uk:`Пасифік-Палісейдс і Альтадіна (поруч Пасадени), округ Лос-Анджелес, Каліфорнія, США`,en:`Pacific Palisades and Altadena (next to Pasadena), Los Angeles County, California, USA`},text:{uk:`7 січня 2025 року під час ураганного вітру Санта-Ана в Лос-Анджелесі спалахнули дві найбільші пожежі — Палісейдс на заході міста й Ітон в Альтадіні. Вітер гнав вогонь з пагорбів просто в житлові квартали. Повністю пожежі локалізували лише 31 січня. Подивіться точки вогню з супутника день за днем.`,en:`On 7 January 2025, during hurricane-force Santa Ana winds, the two largest fires broke out in Los Angeles — Palisades in the west of the city and Eaton in Altadena. The wind drove the fire from the hills straight into neighbourhoods. The fires were fully contained only on 31 January. Watch the satellite fire points day by day.`},causes:[{uk:`Вітер Санта-Ана: сухий і дуже сильний вітер з пустель, що дме з гір до океану; пориви сягали понад 100 км/год, тож літаки не могли гасити вогонь.`,en:`The Santa Ana wind: a dry, very strong wind from the deserts blowing from the mountains to the ocean; gusts topped 100 km/h, so aircraft could not fight the fire.`},{uk:`Багато палива: дві дуже дощові зими (2022–2024) виростили густі трави й чагарники, а потім спекотне літо й майже повна відсутність дощу з травня 2024 року їх висушили.`,en:`Plenty of fuel: two very wet winters (2022-2024) grew dense grass and brush, then a hot summer and almost no rain from May 2024 dried it out.`},{uk:`Іскра: пожежу Палісейдс, за версією федеральних прокурорів, спричинило тління від підпалу 1 січня (пожежа Lachman), справа обвинуваченого в суді; причину пожежі Ітон розслідують, компанія Southern California Edison визнала можливий зв’язок зі своїм обладнанням ЛЕП.`,en:`The spark: federal prosecutors say the Palisades fire grew from smouldering remains of an arson on 1 January (the Lachman fire), and the case against the accused is in court; the Eaton fire’s cause is under investigation, and Southern California Edison acknowledged a possible link to its power-line equipment.`}],effects:[{uk:`Згоріло близько 15 000 га: Палісейдс — 23 448 акрів (≈ 9 500 га), Ітон — 14 021 акр (≈ 5 700 га).`,en:`About 15,000 ha burned: Palisades 23,448 acres (≈ 9,500 ha), Eaton 14,021 acres (≈ 5,700 ha).`},{uk:`Знищено понад 16 000 будинків і споруд (≈ 6 800 у Палісейдс і ≈ 9 400 в Ітон) — одна з найруйнівніших пожеж в історії США.`,en:`Over 16,000 homes and buildings were destroyed (≈ 6,800 in Palisades and ≈ 9,400 in Eaton) — one of the most destructive fires in US history.`},{uk:`Загинула 31 людина (12 — у Палісейдс, 19 — в Ітон); евакуювали понад 200 тисяч людей, дим тижнями погіршував повітря в усьому регіоні.`,en:`31 people died (12 in Palisades, 19 in Eaton); more than 200,000 people were evacuated, and smoke fouled the air across the region for weeks.`}],action:{uk:`Прибирати суху рослинність біля будинків, будувати з негорючих матеріалів, вимикати ЛЕП під час сильного вітру, вчасно попереджати й евакуювати людей.`,en:`Clear dry vegetation around homes, build with non-flammable materials, switch off power lines in strong wind, and warn and evacuate people in time.`},storyId:`la-2025`,show:{layer:`fires`,date:`2025-01-08`,distance:1.03},sources:[{label:`NASA Earth Observatory: Fires Tear Through Los Angeles`,url:`https://earthobservatory.nasa.gov/images/153793/fires-tear-through-los-angeles`},{label:`NASA Earth Observatory: Fuel for California Fires`,url:`https://earthobservatory.nasa.gov/images/153896/fuel-for-california-fires`},{label:`LA County: Eaton & Palisades Fires anniversary fact sheet`,url:`https://file.lacounty.gov/SDSInter/lac/1199046_Eaton_Palisades_Fires_Anniversary_Fact_Sheet.pdf`},{label:`U.S. Attorney’s Office: United States v. Jonathan Rinderknecht`,url:`https://www.justice.gov/usao-cdca/united-states-v-jonathan-rinderknecht`},cf],worldview:af(of,`2025-01-08`,`-119.2,33.7,-117.6,34.6`)},{id:`maui-2023`,lat:20.88,lon:-156.68,kind:`fire`,layer:`fires`,title:{uk:`Пожежа в Лахайні, Мауї`,en:`The Lahaina fire, Maui`},when:{from:`2023-08-08`},place:{uk:`Місто Лахайна, острів Мауї, Гаваї, США`,en:`The town of Lahaina, Maui, Hawaii, USA`},text:{uk:`8 серпня 2023 року вогонь за кілька годин знищив історичне місто Лахайна. Супутник Landsat 8 о 22:25 того дня побачив, що горить майже все місто. Це найсмертоносніша лісова пожежа в США більш ніж за сто років.`,en:`On 8 August 2023 fire destroyed the historic town of Lahaina within hours. Landsat 8 at 10:25 p.m. that day saw almost the whole town burning. It is the deadliest US wildfire in more than a century.`},causes:[{uk:`Дуже сильний вітер: між антициклоном на півночі й ураганом «Дора» далеко на півдні виник потік, що роздмухував вогонь.`,en:`A very strong wind: between a high-pressure system to the north and Hurricane Dora far to the south, a flow arose that fanned the fire.`},{uk:`Суха трава: покинуті плантації заросли завезеними травами, які посуха перетворила на паливо.`,en:`Dry grass: abandoned plantations were overgrown with introduced grasses that the drought turned into fuel.`},{uk:`Іскра: за розслідуванням пожежників і ATF, вогонь почався від обірваних вітром ліній електропередач, а вдень спалахнув знову з недогашених решток.`,en:`The spark: according to the fire department and ATF investigation, the fire started from power lines broken by the wind and flared up again in the afternoon from smouldering remains.`}],effects:[{uk:`Загинули 102 людини; згоріло близько 2 200 будівель, здебільшого житлових.`,en:`102 people died; about 2,200 buildings burned, most of them homes.`},{uk:`Тисячі людей втратили домівки; відбудова Лахайни триває роками.`,en:`Thousands of people lost their homes; rebuilding Lahaina is taking years.`}],action:{uk:`Скошувати й прибирати суху траву біля міст, вимикати ЛЕП під час штормового вітру, сирени й чіткі маршрути евакуації.`,en:`Mow and clear dry grass around towns, switch off power lines in gale-force wind, sirens and clear evacuation routes.`},show:{layer:`truecolor`,date:`2023-08-09`,distance:1.04},sources:[{label:`NASA Earth Observatory: Devastation in Maui`,url:`https://science.nasa.gov/earth/earth-observatory/devastation-in-maui-151688/`}],worldview:af(of,`2023-08-08`,`-157,20.5,-155.9,21.2`)},{id:`canada-2023`,lat:52.5,lon:-75,kind:`fire`,layer:`co`,title:{uk:`Рекордні пожежі в Канаді`,en:`Canada’s record fires`},when:{from:`2023-05`,to:`2023-10`},place:{uk:`Квебек, Альберта, Британська Колумбія й інші провінції Канади`,en:`Quebec, Alberta, British Columbia and other provinces of Canada`},text:{uk:`За сезон 2023 року в Канаді згоріло близько 18,4 млн гектарів, більш ніж у 7 разів більше, ніж у середньому за рік. На початку червня дим дійшов до Нью-Йорка, і небо там стало помаранчевим.`,en:`In the 2023 season about 18.4 million hectares burned in Canada, more than 7 times the yearly average. In early June the smoke reached New York and turned its sky orange.`},causes:[{uk:`Рання спека й посуха висушили ліси ще навесні.`,en:`Early heat and drought dried the forests already in spring.`},{uk:`Блискавки за кілька днів запалили сотні пожеж у віддалених районах Квебеку; частину пожеж запалили люди.`,en:`Lightning lit hundreds of fires in remote parts of Quebec within days; people lit others.`},{uk:`Пожеж було стільки, що гасили лише ті, що загрожували людям, — решта горіли місяцями.`,en:`There were so many fires that only those threatening people were fought — the rest burned for months.`}],effects:[{uk:`Близько 18,4 млн га згарищ — найбільший сезон пожеж в історії Канади; евакуювали понад 200 тисяч людей.`,en:`About 18.4 million ha burned — the largest fire season in Canada’s history; more than 200,000 people were evacuated.`},{uk:`Дим погіршив повітря в США й дійшов до Європи; пожежі викинули рекордну кількість вуглецю.`,en:`The smoke fouled the air in the USA and reached Europe; the fires released a record amount of carbon.`}],action:{uk:`Прогноз пожежної небезпеки, контрольовані випалювання, евакуації; у димні дні — сидіти вдома й носити респіратор.`,en:`Fire-danger forecasts, prescribed burns, evacuations; on smoky days stay indoors and wear a respirator.`},storyId:`quebec-2023`,show:{layer:`fires`,date:`2023-06-06`,distance:1.3},photo:L.smokeNy,sources:[{label:`NASA Earth Observatory: Tracking Canada’s Extreme 2023 Fire Season`,url:`https://science.nasa.gov/earth/earth-observatory/tracking-canadas-extreme-2023-fire-season-151985/`},cf],worldview:af(of,`2023-06-06`,`-82,45,-66,56`)},{id:`evia-2021`,lat:38.85,lon:23.35,kind:`fire`,layer:`fires`,title:{uk:`Пожежі на Евбеї й біля Афін`,en:`Fires on Evia and near Athens`},when:{from:`2021-08-03`,to:`2021-08-20`},place:{uk:`Північ острова Евбея й передмістя Афін (Аттика), Греція`,en:`Northern Evia and the suburbs of Athens (Attica), Greece`},text:{uk:`На початку серпня 2021 року, під час найсильнішої за десятиліття спеки, пожежі знищили соснові ліси півночі Евбеї й підступили до передмість Афін. Людей з узбережжя Евбеї вивозили поромами.`,en:`In early August 2021, during the worst heatwave in decades, fires destroyed the pine forests of northern Evia and reached the suburbs of Athens. People were taken off Evia’s coast by ferry.`},causes:[{uk:`Тижнева спека понад 40 °C і посуха висушили ліси.`,en:`A week of heat over 40 °C and drought dried the forests.`},{uk:`Сильний вітер і смолисті соснові ліси, що горять дуже швидко.`,en:`Strong wind and resinous pine forests that burn very fast.`},{uk:`Одночасно горіли сотні пожеж по всій Греції, тож рятувальників і літаків не вистачало.`,en:`Hundreds of fires burned at once across Greece, so there were not enough firefighters and aircraft.`}],effects:[{uk:`На Евбеї згоріли десятки тисяч гектарів лісів, оливкових гаїв і пасік — основа життя півночі острова.`,en:`Tens of thousands of hectares of forests, olive groves and apiaries burned on Evia — the livelihood of the island’s north.`},{uk:`Тисячі людей евакуювали, зокрема морем; згоріли будинки в багатьох селах.`,en:`Thousands of people were evacuated, some by sea; houses burned in many villages.`}],action:{uk:`Протипожежні смуги, догляд за лісом, більше літаків і раннє попередження під час спеки.`,en:`Firebreaks, forest management, more aircraft and early warnings during heatwaves.`},storyId:`evia-2021`,show:{layer:`fires`,date:`2021-08-06`,distance:1.06},sources:[cf],worldview:af(of,`2021-08-06`,`22.5,37.6,24.6,39.3`)},{id:`amazon-2019`,lat:-9,lon:-56,kind:`forest`,layer:`fires`,title:{uk:`Пожежі в Амазонії`,en:`Amazon fires`},when:{from:`2019-08`},place:{uk:`Бразильська Амазонія: штати Пара, Мату-Гросу, Амазонас, Рондонія`,en:`The Brazilian Amazon: Pará, Mato Grosso, Amazonas and Rondônia states`},text:{uk:`У серпні 2019 року супутники бачили в бразильській Амазонії більше пожеж, ніж на цей час року в будь-який рік з 2010-го. За часом і місцем вони більше схожі на розчищення землі, ніж на природні пожежі від посухи.`,en:`By August 2019 satellites had seen more fires in the Brazilian Amazon than by that point of any year since 2010. Their timing and location look more like land clearing than drought-driven wildfires.`},causes:[{uk:`Вирубування й випалювання лісу під пасовища й поля: спершу дерева рубають, а коли вони висохнуть — підпалюють.`,en:`Cutting and burning forest for pasture and fields: trees are felled first and set alight once dry.`},{uk:`Вологий тропічний ліс сам горить рідко — вогонь там здебільшого запалюють люди.`,en:`Wet rainforest rarely burns on its own — most fires there are lit by people.`}],effects:[{uk:`Ліс, що поглинав вуглець, перетворюється на джерело CO₂; гинуть рослини й тварини, яких немає більше ніде.`,en:`A forest that absorbed carbon becomes a source of CO₂; plants and animals found nowhere else die.`},{uk:`Дим накривав міста за тисячі кілометрів — 19 серпня 2019 року вдень потемніло в Сан-Паулу.`,en:`Smoke covered cities thousands of kilometres away — on 19 August 2019 the daytime sky darkened in São Paulo.`}],action:{uk:`Супутниковий контроль вирубок, захист заповідників і земель корінних народів, відповідальність за незаконну вирубку.`,en:`Satellite monitoring of clearing, protecting reserves and Indigenous lands, and enforcing the law on illegal clearing.`},show:{layer:`fires`,date:`2019-08-15`,distance:1.6},photo:L.forest,sources:[{label:`NASA Earth Observatory: Uptick in Amazon Fire Activity in 2019`,url:`https://earthobservatory.nasa.gov/images/145498/uptick-in-amazon-fire-activity-in-2019`}],worldview:af(of,`2019-08-15`,`-66,-15,-46,-3`)},{id:`valencia-2024`,lat:39.4,lon:-.55,kind:`flood`,layer:`imerg`,title:{uk:`Повінь у Валенсії`,en:`The Valencia flood`},when:{from:`2024-10-29`},place:{uk:`Провінція Валенсія (Чіва, Пайпорта, Утіель), Іспанія`,en:`Valencia province (Chiva, Paiporta, Utiel), Spain`},text:{uk:`29 жовтня 2024 року на провінцію Валенсія за кілька годин вилилося більше дощу, ніж зазвичай випадає за рік. У Чіві за 8 годин випало майже 500 мм. Раптові потоки по сухих руслах затопили передмістя Валенсії.`,en:`On 29 October 2024 more rain fell on Valencia province within hours than usually falls in a year. Chiva had nearly 500 mm in 8 hours. Flash floods down dry riverbeds swamped the suburbs of Valencia.`},causes:[{uk:`«DANA» — відірваний циклон: холодне повітря на висоті застрягло над теплим вологим Середземним морем і годинами лило дощ на одне місце.`,en:`A "DANA" cut-off low: cold air aloft got stuck over the warm, moist Mediterranean and poured rain on one place for hours.`},{uk:`Дуже тепле після літа море дало більше вологи для злив.`,en:`A sea still very warm after summer gave more moisture for the downpours.`},{uk:`Забудова в руслах сухих балок (рамбл) і запізнілі попередження для людей.`,en:`Building in dry ravine beds (ramblas) and late warnings to the public.`}],effects:[{uk:`Загинули понад 220 людей — одна з найсмертоносніших повеней в Європі за десятиліття.`,en:`More than 220 people died — one of Europe’s deadliest floods in decades.`},{uk:`Потік зносив десятки тисяч автомобілів, затопив будинки, дороги й залізницю.`,en:`The water swept away tens of thousands of cars and flooded homes, roads and railways.`}],action:{uk:`Не будувати в руслах і заплавах, вчасно розсилати попередження на телефони, розширювати водовідвідні канали.`,en:`Do not build in riverbeds and floodplains, send warnings to phones in time, widen drainage channels.`},show:{layer:`imerg`,date:`2024-10-29`,distance:1.25},sources:[{label:`NASA Earth Observatory: Valencia Floods`,url:`https://science.nasa.gov/earth/earth-observatory/valencia-floods-153533`},{label:`NASA Earth Observatory: A Week of Rain Across Spain`,url:`https://science.nasa.gov/earth/earth-observatory/a-week-of-rain-across-spain-153546`}],worldview:af(`IMERG_Precipitation_Rate`,`2024-10-29`,`-3,38,2,41`)},{id:`derna-2023`,lat:32.76,lon:22.64,kind:`flood`,layer:`imerg`,title:{uk:`Повінь у Дерні після прориву дамб`,en:`The Derna flood after the dams burst`},when:{from:`2023-09-10`,to:`2023-09-11`},place:{uk:`Місто Дерна у долині ваді Дерна, Лівія`,en:`The city of Derna in the Wadi Derna valley, Libya`},text:{uk:`10 вересня 2023 року середземноморський шторм «Даніель» обрушив на схід Лівії зливи. Уночі на 11 вересня дві дамби вище Дерни прорвало, і вода з грязюкою по вузькій долині змила цілі квартали міста в море.`,en:`On 10 September 2023 the Mediterranean storm Daniel poured heavy rain on eastern Libya. In the night of 11 September two dams above Derna burst, and water and mud rushed down the narrow valley and washed whole districts of the city into the sea.`},causes:[{uk:`Шторм «Даніель» — «медікейн», середземноморський циклон, що перед тим затопив Грецію, Туреччину й Болгарію.`,en:`Storm Daniel — a "medicane", a Mediterranean cyclone that had already flooded Greece, Turkey and Bulgaria.`},{uk:`Прорив двох старих дамб, які понад 20 років не обслуговували.`,en:`The failure of two old dams that had not been maintained for more than 20 years.`},{uk:`Місто стоїть у гирлі вузької долини, сухої більшу частину року, тож вода пішла одним потоком.`,en:`The city sits at the mouth of a narrow valley that is dry most of the year, so the water came as one torrent.`}],effects:[{uk:`Загинули тисячі людей: оцінки різняться — від понад 4 тисяч підтверджених загиблих до понад 10 тисяч разом зі зниклими.`,en:`Thousands of people died: estimates differ — from over 4,000 confirmed deaths to over 10,000 including the missing.`},{uk:`Знищено цілі квартали в центрі міста; десятки тисяч людей залишилися без домівок.`,en:`Whole districts in the city centre were destroyed; tens of thousands of people lost their homes.`}],action:{uk:`Обслуговувати й перевіряти дамби, раннє попередження й евакуація, не забудовувати русла ваді.`,en:`Maintain and inspect dams, early warnings and evacuation, no building in wadi beds.`},show:{layer:`imerg`,date:`2023-09-10`,distance:1.3},sources:[{label:`NASA Earth Observatory: Torrential Rain Wreaks Havoc in Libya`,url:`https://earthobservatory.nasa.gov/images/151826/torrential-rain-wreaks-havoc-in-libya`},{label:`NASA Earth Observatory: Storm Aftermath in Derna, Libya`,url:`https://earthobservatory.nasa.gov/images/151851/storm-aftermath-in-derna-libya`}],worldview:af(sf,`2023-09-12`,`20,31,25,33.5`)},{id:`pakistan-2022`,lat:26.5,lon:68.3,kind:`flood`,layer:`imerg`,title:{uk:`Повені в Пакистані`,en:`Pakistan floods`},when:{from:`2022-06`,to:`2022-08`},place:{uk:`Провінції Сінд і Белуджистан, долина Інду, Пакистан`,en:`Sindh and Balochistan provinces, the Indus valley, Pakistan`},text:{uk:`Мусонні зливи з червня по серпень 2022 року затопили величезні площі провінцій Сінд і Белуджистан; наприкінці серпня розлилося «озеро» на десятки кілометрів завширшки.`,en:`Monsoon downpours from June to August 2022 flooded huge areas of Sindh and Balochistan; by late August a "lake" tens of kilometres wide had spread out.`},causes:[{uk:`Надзвичайно сильний мусон: дощів випало в рази більше за норму.`,en:`An extremely strong monsoon: several times the normal rain fell.`},{uk:`Дослідники World Weather Attribution дійшли висновку, що зміна клімату, ймовірно, посилила найсильніші зливи.`,en:`World Weather Attribution researchers concluded that climate change likely made the heaviest rain worse.`},{uk:`Рівнинна долина Інду дуже повільно відводить воду.`,en:`The flat Indus valley drains water very slowly.`}],effects:[{uk:`Загинули понад 1 700 людей; постраждали понад 30 мільйонів.`,en:`More than 1,700 people died; over 30 million were affected.`},{uk:`Знищено врожаї й худобу, зруйновано дороги й мости; вода місяцями стояла на полях.`,en:`Crops and livestock were lost, roads and bridges destroyed; water stood on the fields for months.`}],action:{uk:`Раннє попередження, дамби й водовідведення, не забудовувати заплави.`,en:`Early warnings, levees and drainage, no building on floodplains.`},show:{layer:`imerg`,date:`2022-08-25`,distance:1.4},photo:L.pakistan,sources:[{label:`NASA Earth Observatory: Devastating Floods in Pakistan`,url:`https://earthobservatory.nasa.gov/images/150279/devastating-floods-in-pakistan`}]},{id:`europe-drought-2022`,lat:45.05,lon:10.2,kind:`drought`,layer:`soil`,title:{uk:`Посуха в Європі`,en:`Europe’s drought`},when:{from:`2022-06`,to:`2022-08`},place:{uk:`Більша частина Європи; найсильніше — Італія (річка По), Франція, Іспанія`,en:`Most of Europe; worst in Italy (the Po), France and Spain`},text:{uk:`Улітку 2022 року ґрунти пересохли на більшій частині Європи; найдовша річка Італії По місцями обміліла до піщаних кос. Об’єднаний дослідницький центр ЄС назвав цю посуху, ймовірно, найгіршою щонайменше за 500 років.`,en:`In summer 2022 soils dried out across most of Europe; Italy’s longest river, the Po, shrank to sandbars in places. The EU Joint Research Centre called it likely the worst drought in at least 500 years.`},causes:[{uk:`Мало снігу й дощів узимку й навесні.`,en:`Little snow and rain in winter and spring.`},{uk:`Кілька хвиль спеки влітку, що висушили ґрунт і річки.`,en:`Several summer heatwaves that dried out the soil and rivers.`},{uk:`Посухи в Європі частішають з потеплінням клімату.`,en:`Droughts in Europe grow more frequent as the climate warms.`}],effects:[{uk:`Впали врожаї кукурудзи, соняшнику й сої; на річках зупинялося судноплавство.`,en:`Maize, sunflower and soybean harvests fell; shipping stopped on rivers.`},{uk:`Мілкі й теплі річки не могли охолоджувати електростанції; бракувало води для ГЕС.`,en:`Shallow, warm rivers could not cool power plants; hydropower ran short of water.`}],action:{uk:`Збирати й зберігати воду, ощадне зрошення, посухостійкі культури.`,en:`Capture and store water, efficient irrigation, drought-tolerant crops.`},show:{layer:`soil`,date:`2022-08-01`,distance:1.9},sources:[{label:`Copernicus European Drought Observatory (EU JRC)`,url:`https://drought.emergency.copernicus.eu/`}]},{id:`aral`,lat:45.2,lon:59.6,kind:`drought`,layer:`truecolor`,title:{uk:`Аральське море`,en:`The Aral Sea`},when:{from:`1960`,to:`2014`},place:{uk:`Кордон Казахстану й Узбекистану, Центральна Азія`,en:`The border of Kazakhstan and Uzbekistan, Central Asia`},text:{uk:`Колись четверте за площею озеро світу. У 1960-х воду його річок почали розбирати на зрошування, і море розпалося на кілька частин; у 2014 році східна частина Південного Аралу зникла повністю.`,en:`Once the fourth largest lake in the world. In the 1960s its rivers were diverted for irrigation and the sea broke into parts; in 2014 the eastern lobe of the South Aral Sea disappeared completely.`},causes:[{uk:`Радянська програма зрошення бавовни й рису в пустелі забрала воду річок Амудар’я і Сирдар’я.`,en:`The Soviet programme to irrigate cotton and rice in the desert took the water of the Amu Darya and Syr Darya.`},{uk:`Аралу не стало чим живитися: річки майже перестали доносити до нього воду, а випаровування лишилося.`,en:`The sea lost its supply: the rivers almost stopped reaching it while evaporation went on.`}],effects:[{uk:`На місці моря — пустеля Аралкум; вітер розносить з неї сіль і рештки добрив.`,en:`Where the sea was there is now the Aralkum desert; wind carries salt and fertiliser residues from it.`},{uk:`Зникло рибальство, місцевий клімат став сухішим і різкішим, люди хворіють частіше.`,en:`Fishing disappeared, the local climate became drier and harsher, and people fall ill more often.`}],action:{uk:`Кокаральська дамба (2005) відділила Північний Арал, і його рівень помітно піднявся; ощадне зрошення повертає річкам воду.`,en:`The Kok-Aral dam (2005) separated the North Aral, and its level rose noticeably; efficient irrigation gives water back to the rivers.`},photo:L.aral,sources:[{label:`NASA Earth Observatory: World of Change, Aral Sea`,url:`https://science.nasa.gov/earth/earth-observatory/world-of-change/aral-sea`}],caseId:`aral`},{id:`lake-chad`,lat:13.2,lon:14.3,kind:`drought`,layer:`soil`,title:{uk:`Озеро Чад`,en:`Lake Chad`},when:{from:`1963`,to:`1987`},place:{uk:`На межі Чаду, Нігеру, Нігерії й Камеруну`,en:`Where Chad, Niger, Nigeria and Cameroon meet`},text:{uk:`У 1960-х озеро Чад займало щонайменше 22 000 км². До 1980-х, після років посухи, його площа скоротилася приблизно до 300 км².`,en:`In the 1960s Lake Chad covered at least 22,000 km². By the 1980s, after years of drought, its area fell to about 300 km².`},causes:[{uk:`Посухи в Сахелі 1970–80-х років.`,en:`The Sahel droughts of the 1970s and 1980s.`},{uk:`Забір води з річок, що живлять озеро, на зрошування.`,en:`Water taken from the rivers that feed the lake for irrigation.`},{uk:`Озеро дуже мілке, тож кожен посушливий рік сильно зменшує його площу.`,en:`The lake is very shallow, so every dry year shrinks it a lot.`}],effects:[{uk:`Мільйони людей, що жили з риби, худоби й полів біля озера, втратили заробіток.`,en:`Millions of people who lived from fish, cattle and fields around the lake lost their livelihood.`},{uk:`Боротьба за воду й землю загострила конфлікти в регіоні.`,en:`The struggle for water and land sharpened conflicts in the region.`}],action:{uk:`Спільне керування водою чотирьох країн басейну й ощадне зрошення.`,en:`Joint water management by the four basin countries and efficient irrigation.`},photo:L.chad,sources:[{label:`NASA Earth Observatory: The Rise and Fall of Africa’s Great Lake`,url:`https://science.nasa.gov/earth/earth-observatory/lake-chad/`}]},{id:`sahel`,lat:14.5,lon:0,kind:`drought`,layer:`ndvi`,title:{uk:`Сахель: посухи і повернення дощів`,en:`The Sahel: droughts and the return of rain`},when:{from:`1970`,to:`1990`},place:{uk:`Смуга на південь від Сахари: від Сенегалу до Судану`,en:`The belt south of the Sahara: from Senegal to Sudan`},text:{uk:`З 1970 по 1990 рік у Сахелі тривали надзвичайно посушливі роки. З 1990-х дощі частково повернулися і рослинності стало більше, але рік від року опади дуже різні.`,en:`From 1970 to 1990 the Sahel had exceptionally dry years. From the 1990s the rains partly came back and vegetation returned, but rainfall varies a lot from year to year.`},causes:[{uk:`Дощі тут приносить західноафриканський мусон, який сильно змінюється з року в рік.`,en:`Rain here comes with the West African monsoon, which varies a lot from year to year.`},{uk:`Надмірний випас і вирубки оголюють ґрунт і погіршують наслідки посух.`,en:`Overgrazing and clearing lay the soil bare and make droughts worse.`}],effects:[{uk:`Голод 1970-х і 1980-х, загибель худоби, переселення мільйонів людей.`,en:`The famines of the 1970s and 1980s, dead livestock and millions of people on the move.`},{uk:`Оголений ґрунт вивітрюється, і місцями наступає пустеля.`,en:`Bare soil blows away, and in places the desert advances.`}],action:{uk:`Фермери в Нігері відновлюють дерева на полях з пнів і коренів; проєкт «Велика зелена стіна» висаджує ліси поперек Африки.`,en:`Farmers in Niger regrow trees on their fields from stumps and roots; the Great Green Wall plants forest across Africa.`},photo:L.sahel,sources:[{label:`NASA Earth Observatory: Defining Desertification`,url:`https://science.nasa.gov/earth/earth-observatory/defining-desertification/`}],caseId:`sahel`},{id:`hunga-tonga-2022`,lat:-20.55,lon:-175.39,kind:`volcano`,layer:`truecolor`,title:{uk:`Виверження вулкана Хунга-Тонга`,en:`The Hunga Tonga eruption`},when:{from:`2022-01-15`},place:{uk:`Підводний вулкан Хунга-Тонга–Хунга-Хаапай, Тонга, Тихий океан`,en:`The undersea volcano Hunga Tonga-Hunga Ha’apai, Tonga, Pacific Ocean`},text:{uk:`15 січня 2022 року підводний вулкан біля Тонги вибухнув — це один із найпотужніших вибухів, які будь-коли записали сучасні прилади. Хмара піднялася на висоту до 57 км — до мезосфери; ударна хвиля кілька разів обійшла Землю.`,en:`On 15 January 2022 an undersea volcano near Tonga exploded — one of the most powerful blasts modern instruments have ever recorded. The plume rose up to 57 km — into the mesosphere; the shock wave circled the Earth several times.`},causes:[{uk:`Магма зустрілася з морською водою: вода миттєво перетворилася на пару, і це підсилило вибух.`,en:`Magma met seawater: the water flashed to steam, which made the blast far stronger.`},{uk:`Природне виверження вулкана на межі тектонічних плит.`,en:`A natural eruption of a volcano on a tectonic plate boundary.`}],effects:[{uk:`Вулкан закинув у стратосферу близько 146 млн тонн водяної пари — приблизно 10 % усієї води, що там є; вона триматиметься роками.`,en:`The volcano put about 146 million tonnes of water vapour into the stratosphere — roughly 10% of all the water there; it will stay for years.`},{uk:`Цунамі накрило Тонгу й дійшло до узбереж усього Тихого океану; попіл засипав острови, обірвався підводний інтернет-кабель.`,en:`A tsunami hit Tonga and reached coasts around the Pacific; ash covered the islands and the undersea internet cable was cut.`},{uk:`На відміну від Пінатубо, ця пара може трохи нагрівати, а не охолоджувати поверхню Землі.`,en:`Unlike Pinatubo, this vapour may slightly warm the Earth’s surface rather than cool it.`}],action:{uk:`Мережі датчиків цунамі, попередження для прибережних країн, супутникове стеження за вулканами.`,en:`Tsunami sensor networks, warnings for coastal countries, satellite watch of volcanoes.`},show:{layer:`truecolor`,date:`2022-01-15`,distance:1.6},sources:[{label:`NASA JPL: Tonga Eruption Blasted Unprecedented Amount of Water Into Stratosphere`,url:`https://www.jpl.nasa.gov/news/tonga-eruption-blasted-unprecedented-amount-of-water-into-stratosphere`}],worldview:af(sf,`2022-01-15`,`-182,-26,-169,-15`)},{id:`pinatubo`,lat:15.14,lon:120.35,kind:`volcano`,layer:`gistemp`,title:{uk:`Вулкан Пінатубо`,en:`Mount Pinatubo`},when:{from:`1991-06-15`},place:{uk:`Острів Лусон, Філіппіни`,en:`Luzon island, the Philippines`},text:{uk:`15 червня 1991 року Пінатубо викинув у стратосферу близько 15 млн тонн сірчистого газу. Пелена крапельок сірчаної кислоти розійшлася довкола планети й охолодила її приблизно на 0,6 °C протягом наступних 15 місяців.`,en:`On 15 June 1991 Pinatubo put about 15 million tonnes of sulphur dioxide into the stratosphere. A haze of sulphuric acid droplets spread around the planet and cooled it by about 0.6 °C over the next 15 months.`},causes:[{uk:`Природне виверження вулкана, що спав близько 500 років.`,en:`A natural eruption of a volcano that had slept for about 500 years.`},{uk:`Крапельки в стратосфері відбивають частину сонячного світла назад у космос — тому планета охолола.`,en:`Droplets in the stratosphere reflect part of the sunlight back to space — that is why the planet cooled.`}],effects:[{uk:`Глобальна температура впала приблизно на 0,6 °C на 15 місяців — це видно на графіку GISTEMP у 1992 році.`,en:`Global temperature fell by about 0.6 °C for 15 months — visible on the GISTEMP chart in 1992.`},{uk:`Попіл і грязьові потоки (лахари) зруйнували села й поля довкола вулкана.`,en:`Ash and mudflows (lahars) destroyed villages and fields around the volcano.`}],action:{uk:`Стеження за вулканами: прогноз виверження й евакуація врятували тисячі життів.`,en:`Watching volcanoes: the eruption forecast and evacuation saved thousands of lives.`},photo:L.pinatubo,sources:[{label:`NASA Earth Observatory: Global Effects of Mount Pinatubo`,url:`https://science.nasa.gov/earth/earth-observatory/global-effects-of-mount-pinatubo-1510/`}]},{id:`lockdown-no2`,lat:45.46,lon:9.19,kind:`air`,layer:`no2`,title:{uk:`Карантин: менше NO₂ над Італією`,en:`Lockdown: less NO₂ over Italy`},when:{from:`2020-03`},place:{uk:`Північна Італія: Мілан і долина По`,en:`Northern Italy: Milan and the Po valley`},text:{uk:`У березні 2020 року, під час карантину через COVID-19, супутник Sentinel-5P показав помітне падіння діоксиду азоту над Північною Італією.`,en:`In March 2020, during the COVID-19 lockdown, the Sentinel-5P satellite showed a clear drop in nitrogen dioxide over northern Italy.`},causes:[{uk:`Карантин майже зупинив транспорт і частину заводів.`,en:`The lockdown almost stopped traffic and some industry.`},{uk:`NO₂ живе в повітрі лише кілька годин, тож його кількість швидко відповідає на зменшення руху й виробництва.`,en:`NO₂ lasts only hours in the air, so it quickly follows less traffic and industry.`}],effects:[{uk:`Концентрації NO₂ над містами Італії впали приблизно на 40–50 % проти того самого часу 2019 року.`,en:`NO₂ over Italian cities fell by roughly 40-50% compared with the same time in 2019.`},{uk:`Ефект був тимчасовим: щойно рух відновився, NO₂ повернувся.`,en:`The effect was temporary: once traffic returned, so did the NO₂.`}],action:{uk:`Показує, що чистіше міське повітря досяжне: громадський і електротранспорт, чистіша енергетика.`,en:`It shows cleaner city air is within reach: public and electric transport, cleaner energy.`},show:{layer:`no2`,date:`2020-03-20`,distance:1.4},photo:L.lockdown,sources:[{label:`ESA: Coronavirus lockdown leading to drop in pollution across Europe`,url:`https://www.esa.int/Applications/Observing_the_Earth/Copernicus/Sentinel-5P/Coronavirus_lockdown_leading_to_drop_in_pollution_across_Europe`}]},{id:`florida-2023`,lat:24.8,lon:-80.9,kind:`heat`,layer:`sst`,title:{uk:`Морська спека біля Флориди`,en:`Marine heatwave off Florida`},when:{from:`2023-07`,to:`2023-08`},place:{uk:`Флорида-Кіс, Мексиканська затока, США`,en:`The Florida Keys, Gulf of Mexico, USA`},text:{uk:`Улітку 2023 року вода біля Флорида-Кіс тижнями була рекордно теплою, і NOAA оголошувала найвищі рівні тривоги щодо знебарвлення коралів.`,en:`In summer 2023 the water off the Florida Keys was record warm for weeks, and NOAA issued its highest coral bleaching alert levels.`},causes:[{uk:`Морська спека на тлі потепління океану.`,en:`A marine heatwave on top of a warming ocean.`},{uk:`Слабкий вітер і мілководдя: вода нагрівалася й не перемішувалася.`,en:`Light wind and shallow water: the water heated up and did not mix.`}],effects:[{uk:`Від перегріву корали виганяють водорості, що живуть у них і годують їх, і біліють; довгий перегрів їх убиває.`,en:`Overheated corals expel the algae that live in them and feed them, and turn white; long heat kills them.`},{uk:`Масове знебарвлення рифів, від яких залежать риба, туризм і захист узбережжя від хвиль.`,en:`Mass bleaching of reefs that fish, tourism and coastal protection from waves depend on.`}],action:{uk:`Вчені рятували корали, переносячи їх у розплідники на суші; у довшій перспективі — скорочення викидів.`,en:`Scientists rescued corals by moving them to nurseries on land; in the long run, cutting emissions.`},show:{layer:`sst`,date:`2023-07-25`,distance:1.4},photo:L.coral,sources:[{label:`NOAA Coral Reef Watch`,url:`https://coralreefwatch.noaa.gov/`}]},{id:`arctic-ice`,lat:82,lon:10,kind:`ice`,layer:`seaice`,title:{uk:`Морський лід Арктики`,en:`Arctic sea ice`},when:{from:`2026-09-12`},place:{uk:`Північний Льодовитий океан`,en:`The Arctic Ocean`},text:{uk:`12 вересня 2026 року площа морського льоду в Арктиці була близько 4,6 млн км², на рівні десятого найменшого значення за всі роки супутникових спостережень. Товстого багаторічного льоду стає дедалі менше.`,en:`On 12 September 2026 Arctic sea ice covered about 4.6 million km², tied for the tenth lowest in the satellite record. Thick multiyear ice keeps declining.`},causes:[{uk:`Потепління клімату від парникових газів; Арктика гріється в кілька разів швидше за планету в цілому.`,en:`Climate warming from greenhouse gases; the Arctic is warming several times faster than the planet as a whole.`},{uk:`Темна вода поглинає більше сонця, ніж білий лід, тож що менше льоду, то швидше нагрівається океан.`,en:`Dark water absorbs more sunlight than white ice, so less ice makes the ocean warm faster.`}],effects:[{uk:`Тварини, що живуть на льоду (білі ведмеді, тюлені), втрачають місце для полювання й розмноження.`,en:`Animals that live on the ice (polar bears, seals) lose their hunting and breeding grounds.`},{uk:`Тепліша Арктика змінює погоду й у помірних широтах та прискорює танення Гренландії.`,en:`A warmer Arctic changes weather at middle latitudes too and speeds up Greenland’s melting.`}],action:{uk:`Скорочувати викиди парникових газів.`,en:`Cut greenhouse gas emissions.`},photo:L.meltPond,sources:[{label:`NASA Earth Observatory: Arctic Sea Ice Shrinks to Its 2026 Minimum`,url:`https://science.nasa.gov/earth/earth-observatory/arctic-sea-ice-shrinks-to-its-2026-minimum/`}],caseId:`arctic`},{id:`columbia-glacier`,lat:61.15,lon:-147.08,kind:`ice`,layer:`snow`,title:{uk:`Льодовик Колумбія, Аляска`,en:`Columbia Glacier, Alaska`},when:{from:`1980`,to:`2011`},place:{uk:`Затока Принца Вільяма, Аляска, США`,en:`Prince William Sound, Alaska, USA`},text:{uk:`Близько 1980 року льодовик втратив опору на мореному валу й почав швидко відступати; до 2011 року він розпався на два окремі льодовики.`,en:`Around 1980 the glacier lost its footing on a moraine and began a fast retreat; by 2011 it had split into two separate glaciers.`},causes:[{uk:`Льодовик закінчується в морі: щойно край зійшов із мілини, вода почала відколювати айсберги набагато швидше.`,en:`The glacier ends in the sea: once its front left the shoal, the water calved icebergs off much faster.`},{uk:`Потепління клімату підштовхнуло цей відступ.`,en:`A warming climate pushed the retreat along.`}],effects:[{uk:`Льодовик відступив приблизно на 20 км і втратив близько половини товщини.`,en:`The glacier retreated about 20 km and lost about half its thickness.`},{uk:`Талий лід додає воду до океану й піднімає його рівень.`,en:`The melted ice adds water to the ocean and raises its level.`}],action:{uk:`Стежити за льодовиками з космосу й скорочувати викиди парникових газів.`,en:`Watch glaciers from space and cut greenhouse gas emissions.`},photo:L.columbia,sources:[{label:`NASA Earth Observatory: World of Change, Columbia Glacier`,url:`https://science.nasa.gov/earth/earth-observatory/world-of-change/columbia-glacier/`}]},{id:`ozone-hole`,lat:-75.6,lon:-26.2,kind:`ozone`,layer:`ozone`,title:{uk:`Озонова діра над Антарктидою`,en:`The Antarctic ozone hole`},when:{from:`1985`},place:{uk:`Стратосфера над Антарктидою; відкрита зі станції Галлі`,en:`The stratosphere over Antarctica; discovered from Halley station`},text:{uk:`Щовесни (у вересні–жовтні) озоновий шар над Антарктидою різко тоншає. Цю діру 1985 року описали британські вчені за вимірюваннями зі станції Галлі.`,en:`Every spring (September and October) the ozone layer over Antarctica thins sharply. British scientists described the hole in 1985 from measurements at Halley station.`},causes:[{uk:`Фреони й інші речовини з хлором і бромом, які колись широко використовували в холодильниках і аерозолях.`,en:`CFCs and other chlorine and bromine compounds once widely used in fridges and sprays.`},{uk:`У холодній полярній стратосфері на крижаних хмарах хлор і бром дуже швидко руйнують озон, щойно навесні з’являється Сонце.`,en:`In the cold polar stratosphere, on icy clouds, chlorine and bromine destroy ozone very fast as soon as the Sun returns in spring.`}],effects:[{uk:`Більше ультрафіолету доходить до поверхні: це шкодить шкірі, очам, рослинам і планктону.`,en:`More ultraviolet reaches the surface: it harms skin, eyes, plants and plankton.`},{uk:`Діра щороку займає до 20–28 млн км² — більше за Антарктиду.`,en:`Each year the hole covers up to 20-28 million km² — more than Antarctica.`}],action:{uk:`Монреальський протокол 1987 року заборонив ці речовини; діра повільно затягується, повне відновлення над Антарктидою очікують близько 2066 року.`,en:`The 1987 Montreal Protocol banned these substances; the hole is slowly closing, with full recovery over Antarctica expected around 2066.`},show:{layer:`ozone`,date:`2025-10-01`,distance:2.6},photo:L.halley,sources:[{label:`NASA Ozone Watch`,url:`https://ozonewatch.gsfc.nasa.gov/`}],caseId:`ozone`}],uf=Object.fromEntries(lf.map(e=>[e.id,e])),df=[...lf].sort((e,t)=>e.when.from<t.when.from?1:e.when.from>t.when.from?-1:0),ff={fire:{color:`#ff7a1a`,icon:`fire`},forest:{color:`#3fae5a`,icon:`leaf`},water:{color:`#3d8bfd`,icon:`drop`},flood:{color:`#3d8bfd`,icon:`drop`},drought:{color:`#d9a13b`,icon:`sun`},ice:{color:`#7cc4f2`,icon:`snow`},volcano:{color:`#e5483b`,icon:`mountain`},air:{color:`#a78bfa`,icon:`air`},war:{color:`#ffd23f`,icon:`ukraine`},heat:{color:`#ff5a5f`,icon:`temp`},light:{color:`#ffc94d`,icon:`bulb`},ozone:{color:`#5ec7c1`,icon:`sun`}};function pf(e,t){switch(t){case`all`:return!0;case`ukraine`:return!!e.ukraine;case`fire`:return e.kind===`fire`||e.kind===`forest`||e.layer===`fires`;case`water`:return e.kind===`flood`||e.kind===`water`||e.kind===`drought`;case`air`:return e.kind===`air`||e.kind===`ozone`||e.kind===`volcano`||e.kind===`light`;case`ice`:return e.kind===`ice`||e.kind===`heat`}}var mf={uk:{of:[`січня`,`лютого`,`березня`,`квітня`,`травня`,`червня`,`липня`,`серпня`,`вересня`,`жовтня`,`листопада`,`грудня`],name:[`січень`,`лютий`,`березень`,`квітень`,`травень`,`червень`,`липень`,`серпень`,`вересень`,`жовтень`,`листопад`,`грудень`]},en:{of:[`January`,`February`,`March`,`April`,`May`,`June`,`July`,`August`,`September`,`October`,`November`,`December`],name:[`January`,`February`,`March`,`April`,`May`,`June`,`July`,`August`,`September`,`October`,`November`,`December`]}};function hf(e,t){let n=mf[t],r=e=>({y:e.slice(0,4),mo:e.length>=7?Number(e.slice(5,7))-1:-1,d:e.length>=10?Number(e.slice(8,10)):0}),i=r(e.from),a=e.to?r(e.to):null;if(i.mo<0)return a?`${i.y}–${a.y}`:i.y;if(!i.d)return a?i.y===a.y?`${n.name[i.mo]}–${n.name[a.mo]} ${i.y}`:`${n.name[i.mo]} ${i.y} – ${n.name[a.mo]} ${a.y}`:`${n.name[i.mo]} ${i.y}`;let o=(e,t=!0)=>`${e.d} ${n.of[e.mo]}${t?` ${e.y}`:``}`;return a?i.y===a.y&&i.mo===a.mo?`${i.d}–${a.d} ${n.of[i.mo]} ${i.y}`:i.y===a.y?`${o(i,!1)} – ${o(a)}`:`${o(i)} – ${o(a)}`:o(i)}var gf=Math.PI/180,_f=(e,t)=>(Date.parse(t)-Date.parse(e))/36e5,vf=e=>e.length===13?`${e}:00:00Z`:e;async function yf(e,t,n,r=7){let i=[],a=[];for(let t=0;t<r;t++)for(let n=0;n<r;n++)i.push(e.s+(e.n-e.s)*t/(r-1)),a.push(e.w+(e.e-e.w)*n/(r-1));let o=Date.parse(vf(t)),s=e=>new Date(e).toISOString().slice(0,10),c=`https://archive-api.open-meteo.com/v1/archive?`+new URLSearchParams({latitude:i.map(e=>e.toFixed(3)).join(`,`),longitude:a.map(e=>e.toFixed(3)).join(`,`),hourly:`wind_speed_100m,wind_direction_100m`,wind_speed_unit:`ms`,start_date:s(o),end_date:s(o+(n+24)*36e5),timezone:`GMT`}),l=await fetch(c);if(!l.ok)throw Error(`wind ${l.status}`);let u=await l.json(),d=Array.isArray(u)?u:[u],f=d[0]?.hourly?.time??[],p=(Date.parse(`${f[0]}:00Z`)-o)/36e5,m=f.length,h=new Float32Array(r*r*m).fill(NaN),g=new Float32Array(r*r*m).fill(NaN);return d.forEach((e,t)=>{let n=e.hourly?.wind_speed_100m??[],i=e.hourly?.wind_direction_100m??[];for(let e=0;e<m;e++){let a=n[e],o=i[e];a!==null&&o!==null&&a!==void 0&&o!==void 0&&(h[e*r*r+t]=-a*Math.sin(o*gf),g[e*r*r+t]=-a*Math.cos(o*gf))}}),bf(e,r,m,p,h,g)}function bf(e,t,n,r,i,a){return(o,s,c)=>{let l=Math.max(0,Math.min(t-1.001,(s-e.w)/(e.e-e.w)*(t-1))),u=Math.max(0,Math.min(t-1.001,(o-e.s)/(e.n-e.s)*(t-1))),d=Math.max(0,Math.min(n-1.001,c-r)),f=Math.floor(l),p=Math.floor(u),m=Math.floor(d),h=l-f,g=u-p,_=d-m,v=0,y=0,b=0;for(let e=0;e<=1;e++)for(let n=0;n<=1;n++)for(let r=0;r<=1;r++){let o=(e?_:1-_)*(n?g:1-g)*(r?h:1-h),s=(m+e)*t*t+(p+n)*t+(f+r);Number.isFinite(i[s])&&o!==0&&(v+=i[s]*o,y+=a[s]*o,b+=o)}return b>.2?[v/b,y/b]:null}}async function xf(e,n){let r=e.weather?.frames??[],i=t(e)??0,a=Date.now(),o=[];for(let e=Math.max(0,i-1);e<r.length&&(o.push(e),!(Date.parse(r[e].time)>a+(n+3)*36e5));e++);let s=(await Promise.all(o.map(t=>j(e,t).catch(()=>null)))).filter(e=>!!e);if(!s.length)throw Error(`no forecast`);let c=s.map(e=>(e.time.getTime()-a)/36e5);return(e,t,n)=>{let r=c.findIndex(e=>e>n);r<=0&&(r=r===0?1:c.length-1);let i=s[Math.max(0,r-1)],a=s[Math.min(s.length-1,r)],o=c[Math.min(s.length-1,r)]-c[Math.max(0,r-1)]||1,l=Math.max(0,Math.min(1,(n-c[Math.max(0,r-1)])/o)),u=i.wind(e,t),d=a.wind(e,t);return!u||!d?u??d:[u[0]+(d[0]-u[0])*l,u[1]+(d[1]-u[1])*l]}}async function Sf(e,t,n){if(!e.length)return[];let r=Date.parse(vf(t)),i=e=>new Date(e).toISOString().slice(0,10),a=`https://air-quality-api.open-meteo.com/v1/air-quality?`+new URLSearchParams({latitude:e.map(e=>e.lat.toFixed(3)).join(`,`),longitude:e.map(e=>e.lon.toFixed(3)).join(`,`),hourly:`pm2_5`,start_date:i(r),end_date:i(r+n*36e5),timezone:`GMT`}),o=await fetch(a);if(!o.ok)throw Error(`air ${o.status}`);let s=await o.json();return(Array.isArray(s)?s:[s]).map(e=>{let t=new Float32Array(n+1).fill(NaN),i=e.hourly?.time??[],a=e.hourly?.pm2_5??[];return i.forEach((e,i)=>{let o=Math.round((Date.parse(`${e}:00Z`)-r)/36e5),s=a[i];o>=0&&o<=n&&s!=null&&(t[o]=s)}),t})}function Cf(e,t){return e.map((e,n)=>({...e,pm25:t[n]??new Float32Array}))}var wf=96;function Tf(e,t,n,r=.05,i=90){let a=new Map;for(let i=0;i<e.lat.length;i++){let o=e.hours[i];if(o<t-wf||o>n)continue;let s=`${Math.round(e.lat[i]/r)},${Math.round(e.lon[i]/r)}`,c=a.get(s);c||a.set(s,c={lat:0,lon:0,n:0,passes:new Map}),c.lat+=e.lat[i],c.lon+=e.lon[i],c.n++;let l=Math.round(o);c.passes.set(l,(c.passes.get(l)??0)+Math.max(1,e.frp[i]))}let o=[];for(let e of a.values()){let n=e.lat/e.n,r=e.lon/e.n,i=[...e.passes.entries()].sort((e,t)=>e[0]-t[0]),a=i[0][0],s=a,c=i[0][1],l=()=>o.push({lat:n,lon:r,t0:a-6-t,t1:s+10-t,power:c});for(let[e,t]of i.slice(1))e-s<=wf?(s=e,c=Math.max(c,t)):(l(),a=s=e,c=t);l()}return o.filter(e=>e.t1>0&&e.t0<n-t).sort((e,t)=>t.power-e.power).slice(0,i)}function Ef(e,t){let n=null,r=Date.parse(vf(t));for(let t of e)t.pm25.forEach((e,i)=>{Number.isFinite(e)&&(!n||e>n.pm25)&&(n={name:t.name,pm25:e,time:new Date(r+i*36e5).toISOString()})});return n}function Df(e,t,n,r=12){let i=new Map;for(let a of e.tracks)for(let o=0;o<a.lat.length;o++){let s=a.lat[o],c=a.te+o*Id;if(!Number.isFinite(s)||c>n||o*.5>e.life)break;let l=Math.cos(s*Math.PI/180);for(let e of t)Math.hypot(e.lat-s,(e.lon-a.lon[o])*l)*111.2<r&&(i.get(e.id)?.hours??1/0)>c&&i.set(e.id,{town:e,hours:c})}return[...i.values()].sort((e,t)=>e.hours-t.hours)}function Of(e,t,n){let r=n/111.2,i=n/(111.2*Math.max(.2,Math.cos(e*gf)));return{s:e-r,n:e+r,w:t-i,e:t+i}}function kf(e,t,n,r={}){let{autoplay:i=!1,loop:a=!1}=r,[o,s]=(0,R.useState)(0),[c,l]=(0,R.useState)(i),[u,d]=(0,R.useState)(1),f=(0,R.useRef)(0),p=(0,R.useRef)(n);(0,R.useEffect)(()=>{p.current=n},[n]),(0,R.useEffect)(()=>{p.current(0)},[]),(0,R.useEffect)(()=>{if(!c)return;let n=0,r=performance.now(),i=-1,o=c=>{let d=Math.min(.1,(c-r)/1e3);r=c;let m=f.current+d*t*u,h=m>=e;h&&(m=a?0:e),f.current=m,p.current(m);let g=Math.round(m*4);(g!==i||h)&&(i=g,s(m)),h&&!a?l(!1):n=requestAnimationFrame(o)};return n=requestAnimationFrame(o),()=>cancelAnimationFrame(n)},[c,u,t,e,a]);let m=(0,R.useCallback)(e=>{f.current=e,s(e),p.current(e)},[]);return{hours:o,playing:c,speed:u,seek:m,toggle:(0,R.useCallback)(()=>{!c&&f.current>=e&&m(0),l(!c)},[c,e,m]),nextSpeed:(0,R.useCallback)(()=>d(e=>e===1?2:e===2?4:1),[])}}var Af={open:`Дим і вітер`,openNote:`Наблизити й показати, куди вітер ніс дим і як погіршувалося повітря в містах`,loading:`Завантажую вітер тих днів і якість повітря в містах…`,error:`Не вдалося завантажити вітер або якість повітря. Спробуйте ще раз пізніше.`,close:`Закрити`,play:`Відтворити`,pause:`Пауза`,speed:`Швидкість`,utc:`UTC`,legend:{smoke:`Дим: де він був би за справжнім вітром тих годин (модель)`,fire:`Вогонь: місця, де супутник бачив пожежу`,wind:`Вітер на висоті 100 м: куди дме й наскільки сильно`,air:`Кружечки: якість повітря в містах (AQI з моделі CAMS)`},sections:{what:`Що сталося`,why:`Чому`,effects:`Які наслідки`,todo:`Що з цим робити`},worst:(e,t,n)=>`Найбрудніше повітря в сцені: ${e}, AQI ${t} (${n}).`,method:`Як це зроблено: кожен осередок вогню з NASA FIRMS щопів години випускає клуб диму, і його несе справжній вітер тих годин (реаналіз ERA5 через Open-Meteo) з невеликим розсіюванням. Якщо хмари на день-два ховають вогонь від супутника, а потім його знову видно на тому ж місці, вважаємо, що він горів і між цими днями. Це наочна модель, а не знімок диму. Числа в кружечках — модель якості повітря CAMS (Copernicus), не виміри станцій.`,sources:`Дані: NASA FIRMS, ERA5 і CAMS (Copernicus) через Open-Meteo, Natural Earth.`,todo:{wild:[`Зачиніть вікна й двері, вимкніть припливну вентиляцію; якщо є очищувач повітря з HEPA-фільтром — увімкніть його.`,`Надворі вдягайте респіратор FFP2 або N95: звичайна медична маска від диму майже не захищає.`,`Не бігайте й не працюйте фізично надворі, поки повітря брудне: під навантаженням ви вдихаєте більше диму.`,`Дітям, літнім людям, вагітним і людям з астмою чи хворобами серця особливо варто лишатися вдома.`,`Стежте за індексом якості повітря (AQI) та офіційними попередженнями.`],field:[`Не паліть суху траву, листя й стерню: в Україні це заборонено й карається штрафом, а вогонь легко перекидається на ліси й будинки.`,`Побачили підпал — телефонуйте 101.`,`Коли дим накриває село чи місто, зачиніть вікна й не провітрюйте, доки він не розвіється.`,`Надворі — респіратор FFP2 або N95; дітям і людям з астмою краще лишатися вдома.`],war:[`Не наближайтеся до місця влучання: можливі повторні удари й вибухи резервуарів.`,`Дим від пального, техніки й будівель токсичніший за дим від трави: зачиніть вікна, вимкніть вентиляцію й лишайтеся в приміщенні.`,`Надворі — респіратор FFP2 або N95; після диму вмийте обличчя й руки, провітрюйте лише коли дим розвіється.`,`Не збирайте городину й не пийте воду з відкритих джерел під шлейфом, доки не буде офіційної перевірки.`,`Пожежу повідомляйте за номером 101; стежте за повідомленнями місцевої влади й ДСНС.`]},live:{button:`Куди піде дим`,title:`Куди піде дим від цієї пожежі`,note:`За прогнозом вітру NOAA GFS на найближчу добу. Це модель: справжній дим залежить ще й від того, скільки горітиме вогонь.`,towns:`Під шлейфом можуть опинитися`,noTowns:`Великих міст на шляху диму найближчої доби немає.`,hours:e=>`через ${e} год`,stop:`Сховати дим`},hotspots:{kicker:`Де горить найбільше зараз`,listNote:`Скупчення вогню за 48 годин, найсильніші першими. Клацніть — побачите, куди піде дим, яка погода для вогню на 3 дні й чи погіршиться повітря в містах.`,count:e=>`${e} за добу`,smokeNote:`Дим: куди його понесе прогноз вітру, якщо вогонь горітиме, як зараз (сценарій)`,method:`Як це пораховано: скупчення вогню — з виявлень NASA FIRMS за 48 годин; погода для вогню — індекс Фосберга (FFWI) з прогнозу температури, вологості й вітру Open-Meteo; повітря — прогноз моделі CAMS; дим — модель на прогнозі вітру NOAA GFS.`,sources:`Дані: NASA FIRMS, Open-Meteo (прогноз погоди й CAMS), NOAA GFS, Natural Earth.`,now:`Що бачать супутники`,seen:(e,t,n)=>`За останню добу — ${e} осередків вогню, за попередню — ${t}${n===null?``:` (${n>0?`+`:``}${n}%)`}.`,power:e=>`Сумарна потужність вогню — ${e} МВт.`,weather:`Погода для вогню на 3 дні`,level:[`низька`,`помірна`,`висока`,`дуже висока`],levelText:[`вогонь шириться повільно`,`вогонь може ширитися`,`сухо й вітряно — пожежі можуть швидко ширитися`,`критично сухо й вітряно — пожежі можуть ставати некерованими`],rain:e=>`Очікується ~${e} мм опадів: дощ може пригасити пожежі.`,noData:`Прогнозу погоди немає.`,air:`Повітря в містах навколо (модель CAMS)`,town:(e,t,n,r,i)=>`${e} (${t} км): зараз AQI ${n}${r>n+10?`, погіршиться до AQI ${r} — ${i}`:`, суттєвого погіршення модель не чекає`}`,noTowns:`Великих міст поблизу немає.`,what:`Що це може бути`},strikes:{layer:`Удари з пожежами й дим (NASA FIRMS)`,note:`Задокументовані удари, після яких супутники бачили вогонь. Клацніть — побачите, куди вітер ніс дим і що було з повітрям у містах.`,open:`Показати дим і вітер`},fireHint:`Наблизьте мапу — точки стануть вогниками. Клацніть пожежу, щоб дізнатися подробиці й куди піде дим.`,fireCard:{kind:`Пожежа, яку побачив супутник`,seen:`Побачено`,power:`Потужність вогню`,powerWords:[`невеликий вогонь`,`помірна пожежа`,`сильна пожежа`,`дуже сильна пожежа`],night:`вночі`,day:`вдень`,confidence:`Надійність`,high:`висока`,nominal:`звичайна`,near:(e,t)=>`За ${t} км від: ${e}`,war:{combat:`Громада в зоні можливих або активних бойових дій (офіційний перелік): найімовірніше, вогонь від обстрілу чи бою.`,partly:`Громада частково окупована, поруч фронт (офіційний перелік): найімовірніше, вогонь від обстрілу чи бою.`,occupied:`Окупована територія (офіційний перелік): причину пожежі там перевірити неможливо — це може бути і удар, і звичайна пожежа.`},what:`Що це може бути`,whatText:`Супутник бачить лише жар, а не його причину: це може бути лісова чи степова пожежа, спалювання стерні, пожежа будинку чи підприємства, газовий факел.`,close:`Закрити`}},jf={open:`Smoke and wind`,openNote:`Zoom in and show where the wind took the smoke and how the air got worse in the towns`,loading:`Loading the wind of those days and the air in the towns…`,error:`Could not load the wind or the air quality. Please try again later.`,close:`Close`,play:`Play`,pause:`Pause`,speed:`Speed`,utc:`UTC`,legend:{smoke:`Smoke: where it would be with the real wind of those hours (a model)`,fire:`Fire: places where a satellite saw burning`,wind:`Wind 100 m up: where it blows and how hard`,air:`Circles: air quality in the towns (AQI from the CAMS model)`},sections:{what:`What happened`,why:`Why`,effects:`What it led to`,todo:`What to do about it`},worst:(e,t,n)=>`Worst air in the scene: ${e}, AQI ${t} (${n}).`,method:`How it is made: every fire seen by NASA FIRMS lets out a puff of smoke each half hour, carried by the real wind of those hours (the ERA5 reanalysis through Open-Meteo) with a little spreading. When clouds hide a fire from the satellite for a day or two and it is seen again in the same place, it is taken to have burned in between. It is an illustration, not a picture of the smoke. The numbers in the circles are the CAMS air quality model (Copernicus), not station readings.`,sources:`Data: NASA FIRMS, ERA5 and CAMS (Copernicus) through Open-Meteo, Natural Earth.`,todo:{wild:[`Close windows and doors and turn off fresh-air ventilation; run an air purifier with a HEPA filter if you have one.`,`Outdoors wear an FFP2 or N95 respirator: an ordinary medical mask barely stops smoke.`,`Don't run or do hard work outdoors while the air is bad: with effort you breathe in more smoke.`,`Children, older people, pregnant women and people with asthma or heart disease should stay indoors.`,`Follow the air quality index (AQI) and official warnings.`],field:[`Don't burn dry grass, leaves or stubble: in Ukraine it is banned and fined, and the fire easily jumps to forests and houses.`,`If you see a fire being set, call 101.`,`When smoke covers a village or town, close the windows and don't air the rooms until it clears.`,`Outdoors an FFP2 or N95 respirator; children and people with asthma had better stay indoors.`],war:[`Don't go near the place that was hit: there may be repeat strikes and tanks exploding.`,`Smoke from fuel, vehicles and buildings is more toxic than grass smoke: close the windows, turn off ventilation and stay indoors.`,`Outdoors an FFP2 or N95 respirator; after the smoke wash your face and hands, and air the rooms only once it has cleared.`,`Don't pick vegetables or drink from open water under the plume until it has been officially tested.`,`Report fires on 101; follow the local authorities and the State Emergency Service.`]},live:{button:`Where will the smoke go`,title:`Where the smoke of this fire will go`,note:`With the NOAA GFS wind forecast for the coming day. A model: the real smoke also depends on how long the fire burns.`,towns:`The plume may reach`,noTowns:`No big towns lie in the path of the smoke over the coming day.`,hours:e=>`in ${e} h`,stop:`Hide the smoke`},hotspots:{kicker:`Where most fire burns now`,listNote:`Clusters of fire over 48 hours, the strongest first. Click one for where its smoke goes, the fire weather of 3 days and whether the air in the towns will get worse.`,count:e=>`${e} a day`,smokeNote:`Smoke: where the forecast wind takes it if the fires keep burning as now (a scenario)`,method:`How it is worked out: fire clusters from NASA FIRMS detections of 48 hours; fire weather as the Fosberg index (FFWI) from the Open-Meteo forecast of temperature, humidity and wind; air from the CAMS model forecast; smoke from a model on the NOAA GFS wind forecast.`,sources:`Data: NASA FIRMS, Open-Meteo (weather forecast and CAMS), NOAA GFS, Natural Earth.`,now:`What the satellites see`,seen:(e,t,n)=>`Last day: ${e} fire detections; the day before: ${t}${n===null?``:` (${n>0?`+`:``}${n}%)`}.`,power:e=>`Total fire power: ${e} MW.`,weather:`Fire weather, 3 days`,level:[`low`,`moderate`,`high`,`very high`],levelText:[`fire spreads slowly`,`fire may spread`,`dry and windy: fires may spread fast`,`critically dry and windy: fires may get out of control`],rain:e=>`About ${e} mm of rain expected: it may damp the fires.`,noData:`No weather forecast.`,air:`Air in the towns around (CAMS model)`,town:(e,t,n,r,i)=>`${e} (${t} km): AQI ${n} now${r>n+10?`, worsening to AQI ${r} on ${i}`:`, the model expects no big change`}`,noTowns:`No big towns nearby.`,what:`What it may be`},strikes:{layer:`Strikes with fires, and their smoke (NASA FIRMS)`,note:`Documented strikes after which satellites saw fire. Click one to see where the wind took the smoke and what the air was like in the towns.`,open:`Show the smoke and wind`},fireHint:`Zoom in and the dots turn into flames. Click a fire for its details and where its smoke will go.`,fireCard:{kind:`A fire seen from space`,seen:`Seen`,power:`Fire power`,powerWords:[`a small fire`,`a moderate fire`,`a strong fire`,`a very strong fire`],night:`at night`,day:`by day`,confidence:`Confidence`,high:`high`,nominal:`normal`,near:(e,t)=>`${t} km from ${e}`,war:{combat:`The hromada is in an area of possible or active fighting (official list): most likely a fire from shelling or fighting.`,partly:`The hromada is partly occupied, the front is close (official list): most likely a fire from shelling or fighting.`,occupied:`Occupied territory (official list): the cause cannot be checked there — it may be a strike or an ordinary fire.`},what:`What it may be`,whatText:`A satellite sees only the heat, not its cause: a forest or grass fire, stubble burning, a house or a plant on fire, a gas flare.`,close:`Close`}};function Mf(){return f().lang===`uk`?Af:jf}var Nf=typeof matchMedia==`function`&&matchMedia(`(prefers-reduced-motion: reduce)`).matches;function Pf(e,t=400,n=30){return{x:e,v:0,t:e,k:t,c:Nf?2*Math.sqrt(t):n}}function Ff(e,t,n){e.k=t,e.c=Nf?2*Math.sqrt(t):n}function If(e,t){let n=-e.k*(e.x-e.t)-e.c*e.v;e.v+=n*t,e.x+=e.v*t}function Lf(e,t=.001){return Math.abs(e.x-e.t)<t&&Math.abs(e.v)<t*10}var Rf=(e,t,n)=>Math.max(t,Math.min(n,e));function zf(e,t){return typeof document>`u`?t:getComputedStyle(document.documentElement).getPropertyValue(e).trim()||t}function Bf(e,t){let[n,r]=zf(e,t).split(/\s+/).map(Number);return[n,r]}function Vf(e,t){let n=parseFloat(zf(e,String(t)));return Number.isFinite(n)?n:t}var Hf=new Set,Uf=0,Wf=!1;function Gf(e){let t=Math.min((e-Uf)/1e3,1/30);Uf=e;for(let e=0;e<4;e++)for(let e of Hf)e.frame(t/4);for(let e of Hf)e.render();[...Hf].every(e=>e.idle?.()??!1)?Wf=!1:requestAnimationFrame(Gf)}function Kf(){Wf||(Wf=!0,Uf=performance.now(),requestAnimationFrame(Gf))}function qf(e){return Hf.add(e),Kf(),()=>{Hf.delete(e)}}function Jf(e,t,n){let r=(0,R.useRef)({frame:e,render:t,idle:n});return r.current={frame:e,render:t,idle:n},(0,R.useEffect)(()=>qf({frame:e=>r.current.frame(e),render:()=>r.current.render(),idle:()=>r.current.idle?.()??!1}),[]),Kf}var Yf=12,Xf=14,Zf=18,Qf=40,$f=80,ep=16,tp=.5;function np({min:e,max:t,step:n=1,value:r,onChange:i,label:a,format:o=String,formatTick:s,majors:c=[],minorStep:l=0,className:u=``}){let d=`goo${(0,R.useId)().replace(/:/g,``)}`,f=(0,R.useRef)(null),p=(0,R.useRef)(null),m=(0,R.useRef)(null),h=(0,R.useRef)(null),g=(0,R.useRef)(null),_=(0,R.useRef)(null),v=(0,R.useRef)(null),y=(0,R.useRef)(null),b=(0,R.useRef)(null);if(!b.current){let e={follow:Bf(`--slider-follow`,`900 50`),bubble:Bf(`--slider-bubble`,`420 22`),release:Bf(`--slider-release`,`300 14`),glide:Bf(`--slider-glide`,`420 34`)};b.current={W:0,X:Pf(0,...e.follow),DX:Pf(0,260,18),DY:Pf(ep,...e.bubble),DS:Pf(tp,...e.bubble),PS:Pf(1,520,16),dragging:!1,hover:!1,lifted:!1,lastSent:r,shown:r,T:e}}let x=b.current,S=()=>Math.max(x.W-24,1),C=n=>Yf+(n-e)/Math.max(t-e,1e-9)*S(),w=n=>e+Rf((n-Yf)/S(),0,1)*(t-e),T=r=>Rf(Math.round((r-e)/n)*n+e,e,t),E=(0,R.useRef)({onChange:i,format:o,value:r});E.current={onChange:i,format:o,value:r};let D=()=>{let e=x.dragging||x.lifted;x.DY.t=e?-22:ep,x.DS.t=e?1:tp,x.PS.t=x.dragging?1.16:x.hover?1.08:1,O()},O=Jf(e=>{x.DX.t=x.X.x,If(x.X,e),If(x.DX,e),If(x.DY,e),If(x.DS,e),If(x.PS,e)},()=>{if(!x.W)return;let e=x.X.x,t=T(w(e)),n=1+Math.min(Math.abs(x.X.v)/2400,.4);m.current&&(m.current.style.transform=`translate(${e-Xf+Qf}px,82px) scale(${n*x.PS.x},${x.PS.x/n})`);let r=Rf((x.DX.x-e)*.9,-28,28),i=`translate(${x.DX.x-Zf}px,${x.DY.x-Zf}px) rotate(${r}deg) scale(${x.DS.x})`;if(h.current&&(h.current.style.transform=`translate(${Qf}px,${$f}px) ${i}`),g.current&&(g.current.style.transform=i,g.current.style.opacity=String(Rf((x.DS.x-.7)/.25,0,1)),_.current&&(x.shown!==t||!_.current.textContent))){let e=E.current.format(t);_.current.textContent=e,g.current.classList.toggle(`jelly__label--long`,e.length>4)}if(x.shown=t,p.current&&(p.current.style.width=`${Rf(e,0,x.W)}px`),v.current&&(v.current.style.left=`${e-Yf}px`),y.current)for(let e of y.current.children)e.classList.toggle(`on`,Number(e.dataset.v)<=t)},()=>!x.dragging&&Lf(x.X,.05)&&Lf(x.DX,.05)&&Lf(x.DY,.05)&&Lf(x.DS)&&Lf(x.PS));(0,R.useEffect)(()=>{!x.dragging&&x.W&&r!==T(w(x.X.t))&&(Ff(x.X,...x.T.glide),x.X.t=C(r),O())},[r,e,t]),(0,R.useEffect)(()=>{let e=f.current;if(!e)return;let t=new ResizeObserver(()=>{let t=e.clientWidth;t&&t!==x.W&&(x.W=t,x.X.x=x.X.t=x.DX.x=x.DX.t=C(E.current.value),x.X.v=x.DX.v=0,O())});return t.observe(e),()=>t.disconnect()},[e,t]),(0,R.useEffect)(()=>{document.getElementById(`${d}-blur`)?.setAttribute(`stdDeviation`,String(Vf(`--slider-blur`,8)))},[d]);let k=(e,t,n,r=18)=>e<t?t-(1-1/((t-e)*.55/r+1))*r:e>n?n+(1-1/((e-n)*.55/r+1))*r:e,A=e=>e.clientX-f.current.getBoundingClientRect().left,j=e=>{let t=T(w(e));t!==x.lastSent&&(x.lastSent=t,E.current.onChange(t))},M=c.filter(n=>n>=e&&n<=t),N=(0,R.useRef)(null),[ee,P]=(0,R.useState)(0),F=M.length>0;(0,R.useEffect)(()=>{let e=N.current;if(!e)return;let t=new ResizeObserver(([e])=>P(e.contentRect.width));return t.observe(e),()=>t.disconnect()},[F]);let te=M.map(e=>(s??o)(e)),ne=te.reduce((e,t)=>Math.max(e,t.length),1),re=ee>0?Math.max(1,Math.ceil(M.length*(ne*7+14)/ee)):1,ie=[];if(l>0)for(let n=Math.ceil(e/l)*l;n<=t;n+=l)ie.push(n);let ae=n=>(n-e)/Math.max(t-e,1e-9);return(0,B.jsxs)(`div`,{className:`jelly ${u}`,children:[(0,B.jsx)(`svg`,{width:`0`,height:`0`,style:{position:`absolute`},"aria-hidden":`true`,children:(0,B.jsxs)(`filter`,{id:d,x:`-50%`,y:`-50%`,width:`200%`,height:`200%`,children:[(0,B.jsx)(`feGaussianBlur`,{id:`${d}-blur`,in:`SourceGraphic`,stdDeviation:`8`,result:`b`}),(0,B.jsx)(`feColorMatrix`,{in:`b`,mode:`matrix`,values:`1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -10`,result:`g`}),(0,B.jsx)(`feComposite`,{in:`SourceGraphic`,in2:`g`,operator:`atop`})]})}),(0,B.jsxs)(`div`,{ref:f,className:`jelly__rail`,onPointerDown:e=>{x.dragging=!0,e.currentTarget.setPointerCapture(e.pointerId),Ff(x.X,...x.T.follow),x.X.t=k(A(e),Yf,x.W-Yf),j(Rf(x.X.t,Yf,x.W-Yf)),D(),v.current?.focus({preventScroll:!0})},onPointerMove:e=>{x.dragging&&(x.X.t=k(A(e),Yf,x.W-Yf),j(Rf(x.X.t,Yf,x.W-Yf)),O())},onPointerUp:()=>{x.dragging&&(x.dragging=!1,Ff(x.X,...x.T.release),x.X.t=C(T(w(Rf(x.X.t,Yf,x.W-Yf)))),D())},onPointerCancel:()=>{x.dragging=!1,D()},onPointerEnter:e=>{e.pointerType===`mouse`&&(x.hover=!0,D())},onPointerLeave:()=>{x.hover=!1,D()},children:[(0,B.jsx)(`div`,{className:`jelly__track`,children:(0,B.jsx)(`div`,{ref:p,className:`jelly__fill`})}),(0,B.jsxs)(`div`,{className:`jelly__goo`,style:{filter:`url(#${d})`},children:[(0,B.jsx)(`div`,{ref:h,className:`jelly__blob jelly__drop`}),(0,B.jsx)(`div`,{ref:m,className:`jelly__blob jelly__thumb`})]}),(0,B.jsx)(`div`,{ref:g,className:`jelly__label`,"aria-hidden":`true`,children:(0,B.jsx)(`span`,{ref:_})}),(0,B.jsx)(`div`,{ref:v,className:`jelly__hit`,role:`slider`,tabIndex:0,"aria-label":a,"aria-valuemin":e,"aria-valuemax":t,"aria-valuenow":r,"aria-valuetext":o(r),onKeyDown:a=>{let o=Math.max(n,Math.round((t-e)/10/n)*n),s={ArrowRight:n,ArrowUp:n,ArrowLeft:-n,ArrowDown:-n,PageUp:o,PageDown:-o}[a.key],c={Home:e,End:t}[a.key];if(s===void 0&&c===void 0)return;a.preventDefault();let l=c===void 0?T(r+s):c;Ff(x.X,...x.T.glide),x.X.t=C(l),x.lastSent=l,i(l),x.lifted=!0,D()},onFocus:e=>{e.currentTarget.matches(`:focus-visible`)&&(x.lifted=!0,D())},onBlur:()=>{x.lifted=!1,D()}})]}),(M.length>0||ie.length>0)&&(0,B.jsxs)(`div`,{className:`jelly__ticks`,"aria-hidden":`true`,children:[(0,B.jsxs)(`div`,{ref:y,className:`jelly__marks`,children:[ie.map(e=>(0,B.jsx)(`i`,{"data-v":e,style:{"--p":ae(e)}},`m${e}`)),M.map(e=>(0,B.jsx)(`i`,{"data-v":e,className:`major`,style:{"--p":ae(e)}},`M${e}`))]}),(0,B.jsx)(`div`,{ref:N,className:`jelly__nums`,children:M.map((e,t)=>t%re===0?(0,B.jsx)(`span`,{style:{"--p":ae(e)},children:te[t]},e):null)})]})]})}function rp({clock:e,length:t,format:n,formatTick:r,majors:i,sub:a,disabled:o,labels:s,className:c=`smoke-player`}){return(0,B.jsxs)(`div`,{className:`${c}__row`,children:[(0,B.jsx)(`button`,{type:`button`,className:`play-btn`,"aria-label":e.playing?s.pause:s.play,disabled:o,onClick:e.toggle,children:(0,B.jsx)(S,{name:e.playing?`pause`:`play`})}),(0,B.jsxs)(`button`,{type:`button`,className:`speed-btn`,"aria-label":`${s.speed}: ${e.speed}×`,onClick:e.nextSpeed,children:[e.speed,`×`]}),(0,B.jsx)(np,{className:`${c}__slider`,min:0,max:t,step:1,value:Math.round(e.hours),onChange:e.seek,label:n(e.hours),format:n,formatTick:r,majors:i}),(0,B.jsxs)(`div`,{className:`${c}__date`,children:[(0,B.jsx)(`strong`,{children:n(e.hours)}),a&&(0,B.jsx)(`span`,{children:a})]})]})}var ip=4;function ap(e){let{lang:t}=f(),n=t===`uk`?`uk-UA`:`en-GB`,r=(t,r)=>new Intl.DateTimeFormat(n,{...r,timeZone:`UTC`}).format(new Date(e+t*36e5));return{time:e=>r(e,{day:`numeric`,month:`short`,hour:`2-digit`,minute:`2-digit`}),day:e=>r(e,{day:`numeric`,month:`short`}),long:e=>new Intl.DateTimeFormat(n,{weekday:`short`,day:`numeric`,month:`long`,hour:`2-digit`,minute:`2-digit`,timeZone:`UTC`}).format(new Date(e))}}function op(e){let t=Mf(),n=kf(e.hours,ip,e.onTime,{autoplay:e.autoplay,loop:e.loop}),r=ap(e.t0),i=Array.from({length:Math.floor(e.hours/24)+1},(e,t)=>t*24);return(0,B.jsxs)(`section`,{className:`smoke-player`,"aria-label":`${e.kicker}: ${e.title}`,children:[(0,B.jsxs)(`header`,{className:`smoke-player__head`,children:[(0,B.jsxs)(`div`,{children:[(0,B.jsx)(`p`,{className:`smoke-player__kicker`,children:e.kicker}),(0,B.jsx)(`h2`,{className:`smoke-player__title`,children:e.title})]}),(0,B.jsx)(`button`,{type:`button`,className:`icon-btn icon-btn--bare`,"aria-label":t.close,onClick:e.onClose,children:(0,B.jsx)(S,{name:`close`,size:18})})]}),e.status===`loading`&&(0,B.jsx)(`p`,{className:`note`,role:`status`,children:t.loading}),e.status===`error`&&(0,B.jsx)(`p`,{className:`note`,role:`alert`,children:t.error}),(0,B.jsx)(rp,{clock:n,length:e.hours,format:r.time,formatTick:r.day,majors:i,sub:t.utc,disabled:e.status!==`ready`,labels:t}),(0,B.jsxs)(`ul`,{className:`smoke-legend`,children:[(0,B.jsxs)(`li`,{children:[(0,B.jsx)(`span`,{className:`smoke-key smoke-key--smoke`,"aria-hidden":`true`}),e.smokeNote]}),(0,B.jsxs)(`li`,{children:[(0,B.jsx)(`span`,{className:`smoke-key smoke-key--fire`,"aria-hidden":`true`}),t.legend.fire]}),(0,B.jsxs)(`li`,{children:[(0,B.jsx)(`span`,{className:`smoke-key smoke-key--wind`,"aria-hidden":`true`}),t.legend.wind]}),(0,B.jsxs)(`li`,{children:[(0,B.jsx)(`span`,{className:`smoke-key smoke-key--air`,"aria-hidden":`true`}),t.legend.air]})]}),(0,B.jsx)(`div`,{className:`smoke-story`,children:e.children}),e.notes.map(e=>(0,B.jsx)(`p`,{className:`legend__src`,children:e},e))]})}function sp({title:e,open:t,items:n}){return n.length?(0,B.jsxs)(`details`,{open:t,children:[(0,B.jsx)(`summary`,{children:e}),(0,B.jsx)(`ul`,{children:n.map((e,t)=>(0,B.jsx)(`li`,{children:e},t))})]}):null}var cp=({kind:e})=>{let t=Mf();return(0,B.jsx)(sp,{title:t.sections.todo,items:t.todo[e]})};function lp({scene:e,story:t,status:n,towns:r,onTime:i,onClose:a}){let{lang:o}=f(),s=Mf(),c=Date.parse(vf(e.start)),l=ap(c),u=lf.find(e=>e.storyId===t.id),d=u?u.causes.map(e=>e[o]):e.why?[e.why[o]]:[],p=u?u.effects.map(e=>e[o]):e.effects?[e.effects[o]]:[],m=n===`ready`?Ef(r,e.start):null;return(0,B.jsxs)(op,{kicker:s.open,title:t.title[o],status:n,hours:e.hours,t0:c,onTime:i,onClose:a,autoplay:n===`ready`,smokeNote:s.legend.smoke,notes:[s.method,s.sources],children:[(0,B.jsx)(sp,{title:s.sections.what,open:!0,items:[t.text[o],e.smoke[o]]}),(0,B.jsx)(sp,{title:s.sections.why,items:d}),(0,B.jsx)(sp,{title:s.sections.effects,items:[...p,...m?[s.worst(m.name,Vd(m.pm25),`${l.long(m.time)} UTC`)]:[]]}),(0,B.jsx)(cp,{kind:e.kind})]})}function up({hotspot:e,title:t,start:n,hours:r,status:i,weather:a,air:o,onTime:s,onClose:c}){let{lang:l}=f(),u=Mf(),d=u.hotspots,p=n,m=ap(p),h=new Intl.NumberFormat(l===`uk`?`uk-UA`:`en-GB`,{maximumFractionDigits:0}),g=Zd(e),_=e=>new Intl.DateTimeFormat(l===`uk`?`uk-UA`:`en-GB`,{weekday:`short`,day:`numeric`,month:`short`}).format(new Date(`${e}T12:00:00Z`)),v=(a??[]).reduce((e,t)=>e+t.rainMm,0);return(0,B.jsxs)(op,{kicker:d.kicker,title:t,status:i,hours:r,t0:p,onTime:s,onClose:c,autoplay:i===`ready`,loop:!0,smokeNote:d.smokeNote,notes:[d.method,d.sources],children:[(0,B.jsx)(sp,{title:d.now,open:!0,items:[d.seen(h.format(e.lastDay),h.format(e.dayBefore),g),d.power(h.format(e.power))]}),(0,B.jsx)(sp,{title:d.weather,open:!0,items:a?[...a.map(e=>(0,B.jsxs)(B.Fragment,{children:[(0,B.jsxs)(`b`,{children:[_(e.date),`:`]}),` `,d.level[ef(e.maxIndex)],` (FFWI `,h.format(e.maxIndex),`) — `,d.levelText[ef(e.maxIndex)]]})),...v>=5?[d.rain(h.format(v))]:[]]:[i===`loading`?u.loading:d.noData]}),(0,B.jsx)(sp,{title:d.air,open:!0,items:o&&o.length?o.slice(0,5).map(e=>d.town(e.name,h.format(e.km),e.nowAqi,e.worstAqi,`${m.long(e.worstTime)} UTC`)):[i===`loading`?u.loading:d.noTowns]}),(0,B.jsx)(sp,{title:d.what,items:[u.fireCard.whatText]}),(0,B.jsx)(cp,{kind:`wild`})]})}var dp=[{storyId:`chornobyl-2020`,kind:`wild`,start:`2020-04-15T12`,hours:72,box:{s:49.6,n:51.9,w:28.5,e:32.4},camera:{lat:50.75,lon:30.3,distance:1.075},towns:[`Kyiv`,`Chornobyl`,`Zhytomyr`,`Chernihiv`,`Korosten`,`Bila Tserkva`,`Brovary`,`Nizhyn`],smoke:{uk:`У середині квітня дим від пожеж у зоні відчуження дійшов до Києва: 16–17 квітня місто мало одне з найбрудніших повітрь серед великих міст світу.`,en:`In mid-April the smoke of the Exclusion Zone fires reached Kyiv: on 16–17 April the city had some of the dirtiest air among the big cities of the world.`}},{storyId:`la-2025`,kind:`wild`,start:`2025-01-07T18`,hours:72,box:{s:33.3,n:34.7,w:-119.3,e:-117.2},camera:{lat:34.05,lon:-118.35,distance:1.045},smoke:{uk:`Сильний вітер Санта-Ана дув із суходолу до океану й відносив дим над океан; де вітер слабшав, дим і попіл від згорілих будинків осідали на райони міста.`,en:`The strong Santa Ana wind blew from the land to the ocean and carried the smoke out to sea; where it eased, smoke and ash from the burned houses settled over the city.`}},{storyId:`evia-2021`,kind:`wild`,start:`2021-08-05T00`,hours:96,box:{s:37.5,n:39.4,w:22.6,e:24.9},camera:{lat:38.4,lon:23.6,distance:1.06},smoke:{uk:`Дим від пожеж на Евбеї та в Аттиці кілька днів висів над Афінами; небо над містом ставало помаранчевим, на вулиці падав попіл.`,en:`Smoke from the fires on Evia and in Attica hung over Athens for days; the sky over the city turned orange and ash fell in the streets.`}},{storyId:`turkey-2021`,kind:`wild`,start:`2021-07-28T06`,hours:72,box:{s:36.2,n:37.9,w:30.2,e:33.2},camera:{lat:36.85,lon:31.6,distance:1.06},smoke:{uk:`Дим розносило над узбережжям і морем; його було видно із супутників на сотні кілометрів.`,en:`The smoke spread over the coast and the sea; satellites saw it for hundreds of kilometres.`},why:{uk:`Наприкінці липня 2021 року на півдні Туреччини стояла сильна спека із сухим вітром. Біля Манавгата й в інших районах Анталії спалахнули соснові ліси, і вітер швидко поніс вогонь.`,en:`At the end of July 2021 the south of Turkey had a strong heatwave with a dry wind. Pine forests caught fire near Manavgat and elsewhere in Antalya province, and the wind spread the fire fast.`},effects:{uk:`Вогонь дійшов до сіл і курортів, людей евакуйовували, зокрема морем. Згоріли великі площі соснових лісів, які відростатимуть десятиліттями.`,en:`The fire reached villages and resorts; people were evacuated, some by sea. Large areas of pine forest burned that will take decades to grow back.`}},{storyId:`quebec-2023`,kind:`wild`,start:`2023-06-05T00`,hours:96,box:{s:39.5,n:52.5,w:-80.5,e:-66},camera:{lat:45.6,lon:-73.5,distance:1.32},towns:[`New York City`,`Montreal`,`Quebec City`,`Ottawa`,`Toronto`,`Boston`,`Philadelphia`],smoke:{uk:`6–8 червня 2023 року вітер приніс дим із пожеж Квебеку на північний схід США: у Нью-Йорку небо стало помаранчевим, а якість повітря 7 червня була однією з найгірших у світі.`,en:`On 6–8 June 2023 the wind brought smoke from the Quebec fires to the north-east of the United States: the sky over New York turned orange, and on 7 June its air was among the worst in the world.`}},{storyId:`luhansk-2020`,kind:`wild`,start:`2020-09-30T00`,hours:72,box:{s:47.8,n:50.3,w:37.4,e:40.8},camera:{lat:49,lon:39.1,distance:1.07},smoke:{uk:`Той самий сильний вітер, що роздмухував вогонь, ніс дим над Луганщиною й Донеччиною.`,en:`The same strong wind that fanned the fire carried its smoke over the Luhansk and Donetsk regions.`}},{storyId:`fields-2018`,kind:`field`,start:`2018-04-08T00`,hours:72,box:{s:45.5,n:52.5,w:23.5,e:40.5},camera:{lat:49.2,lon:31.5,distance:1.35},towns:[`Kyiv`,`Kharkiv`,`Dnipro`,`Odesa`,`Vinnytsia`,`Poltava`,`Cherkasy`,`Kropyvnytskyi`,`Chernihiv`,`Sumy`],smoke:{uk:`Навесні сотні полів палять майже одночасно: дим від них накриває цілі області, а в безвітря стоїть над селами й містами.`,en:`In spring hundreds of fields are burned at almost the same time: their smoke covers whole regions and, without wind, hangs over villages and towns.`}},{storyId:`front-2022`,kind:`war`,start:`2022-08-24T00`,hours:72,box:{s:45.9,n:48.7,w:31.8,e:38.6},camera:{lat:47.3,lon:35,distance:1.13},towns:[`Zaporizhzhia`,`Kherson`,`Mykolaiv`,`Kryvyi Rih`,`Melitopol`,`Nikopol`,`Berdiansk`,`Dnipro`],smoke:{uk:`Наприкінці серпня 2022 року супутники бачили сотні осередків вогню вздовж фронту на півдні. Подивіться, куди вітер ніс дим від них і як змінювалося повітря в містах поруч.`,en:`At the end of August 2022 satellites saw hundreds of fires along the front in the south. See where the wind took their smoke and how the air changed in the towns nearby.`},why:{uk:`Обстріли й бої підпалюють поля, ліси, лісосмуги й будинки. Біля лінії фронту гасити неможливо, тож вогонь горить, доки не дійде до дороги, річки чи зораного поля.`,en:`Shelling and fighting set fields, forests, tree belts and houses on fire. Near the front line nobody can put them out, so a fire burns until it reaches a road, a river or a ploughed field.`},effects:{uk:`Дим від таких пожеж — не лише згорілі рослини: у ньому продукти горіння техніки, будівель, пального й вибухівки. Він погіршує повітря в містах біля фронту; згарища лишаються без рослин, і ґрунт висихає та розвівається вітром.`,en:`The smoke of such fires is not only burned plants: it carries what burns in vehicles, buildings, fuel and explosives. It fouls the air in towns near the front; burned land stays bare, and the soil dries out and blows away.`}},{storyId:`vasylkiv-2022`,kind:`war`,start:`2022-02-26T22`,hours:60,box:{s:49.7,n:50.85,w:29.4,e:31.5},camera:{lat:50.25,lon:30.4,distance:1.04},towns:[`Kyiv`,`Bila Tserkva`,`Brovary`,`Zhytomyr`],smoke:{uk:`Супутник побачив вогонь на нафтобазі вночі 27 лютого, о 01:24 за Києвом, і ще двічі в наступні дві доби. Подивіться, куди вітер ніс чорний дим.`,en:`A satellite saw the fire at the depot in the night of 27 February, at 01:24 Kyiv time, and twice more over the next two days. See where the wind took the black smoke.`},why:{uk:`Російська ракета влучила в резервуари з пальним. Нафтопродукти горять дуже гаряче й з великою кількістю сажі, а гасити заважали бої за аеродром поруч.`,en:`A Russian missile hit tanks of fuel. Oil products burn very hot and with a lot of soot, and fighting for the airfield next door kept firefighters away.`},effects:{uk:`Чорний дим від нафтопродуктів несе сажу, оксиди сірки й азоту та інші токсичні речовини; вони осідають на ґрунт і воду навколо. Пожежі нафтобаз стали одними з перших великих екологічних шкод війни.`,en:`Black smoke from oil products carries soot, sulphur and nitrogen oxides and other toxic substances; they settle on the soil and water around. Burning oil depots were among the first large environmental harms of the war.`}},{storyId:`azot-2022`,kind:`war`,start:`2022-06-10T12`,hours:72,box:{s:48.4,n:49.5,w:37.7,e:39.5},camera:{lat:48.95,lon:38.5,distance:1.045},towns:[`Lysychansk`,`Kramatorsk`,`Luhansk`,`Horlivka`],smoke:{uk:`Супутники бачили вогонь на заводі й навколо нього кілька діб поспіль. Подивіться, куди вітер ніс дим від оливи, що горіла.`,en:`Satellites saw fire at the plant and around it for several days running. See where the wind took the smoke of the burning oil.`},why:{uk:`Бої за Сєвєродонецьк ішли просто на території промзони. Снаряди пробили обладнання з оливою, і вона спалахнула.`,en:`The battle for Sievierodonetsk was fought right inside the industrial zone. Shells pierced equipment full of oil, and it caught fire.`},effects:{uk:`«Азот» виробляв азотні добрива. Пожежа на хімічному заводі дає токсичний дим, а пошкоджене обладнання загрожує витоками шкідливих речовин у повітря, ґрунт і воду.`,en:`Azot made nitrogen fertilisers. A fire at a chemical plant gives toxic smoke, and damaged equipment threatens leaks of harmful substances into the air, soil and water.`}},{storyId:`odesa-ports-2023`,kind:`war`,start:`2023-07-18T18`,hours:48,box:{s:45.9,n:46.9,w:30.1,e:31.4},camera:{lat:46.4,lon:30.7,distance:1.035},towns:[`Odesa`,`Chornomorsk`],smoke:{uk:`Супутник зафіксував пожежі в порту вночі 19 липня, близько 02:20 за Києвом. Подивіться, куди вітер ніс дим.`,en:`A satellite caught the fires in the port in the night of 19 July, at about 02:20 Kyiv time. See where the wind took the smoke.`},why:{uk:`Росія вийшла із зернової угоди й почала бити по портовій інфраструктурі та зернових терміналах Одещини.`,en:`Russia left the grain deal and began striking the port infrastructure and grain terminals of the Odesa region.`},effects:{uk:`Горіли зерно, склади й техніка портів: дим ішов над узбережжям і містом. Знищене зерно мало йти на експорт, зокрема до країн, яким загрожує голод.`,en:`Grain, warehouses and port machinery burned; the smoke drifted over the coast and the city. The destroyed grain was meant for export, including to countries at risk of hunger.`}},{storyId:`kyiv-2025`,kind:`war`,start:`2025-06-16T21`,hours:36,box:{s:50.1,n:50.8,w:29.9,e:31.2},camera:{lat:50.45,lon:30.52,distance:1.03},towns:[`Kyiv`,`Brovary`,`Bila Tserkva`],smoke:{uk:`Супутник побачив пожежі в місті близько 03:54 за Києвом, у розпал атаки. Подивіться, куди вітер ніс дим над районами.`,en:`A satellite saw fires in the city at about 03:54 Kyiv time, at the height of the attack. See where the wind took the smoke over the districts.`},why:{uk:`Масовані комбіновані атаки дронами й ракетами: влучання й уламки збитих цілей підпалюють багатоквартирні будинки, склади й автівки.`,en:`Mass combined attacks with drones and missiles: hits and the debris of downed targets set blocks of flats, warehouses and cars on fire.`},effects:{uk:`Дим від згорілих квартир токсичний: у ньому чадний газ, сажа й продукти горіння пластику, меблів і проводки. Вітер розносить його по районах.`,en:`Smoke from burned flats is toxic: carbon monoxide, soot and what burning plastic, furniture and wiring give off. The wind spreads it across the districts.`}}],fp=[`front-2022`,`vasylkiv-2022`,`azot-2022`,`odesa-ports-2023`,`kyiv-2025`],pp=e=>dp.find(t=>t.storyId===e)??null;function mp(e,t){if(!e.length)return t;let n=90,r=-90,i=180,a=-180;for(let t of e)n=Math.min(n,t.lat),r=Math.max(r,t.lat),i=Math.min(i,t.lon),a=Math.max(a,t.lon);let o=Math.max(.25,(r-n)*.4);return{s:n-o,n:r+o,w:i-o*1.4,e:a+o*1.4}}var hp=()=>Math.floor(Date.now()/36e5)*36e5;function gp(e,t,n=`globe__smoke`){let i=(0,R.useMemo)(()=>new Gd(n),[n]),[a,o]=(0,R.useState)(null),s=(0,R.useRef)(0),c=(0,R.useCallback)(()=>{s.current++,i.set(null),e.current?.show(null),o(null)},[i,e]),l=(0,R.useCallback)((t,n,r,a,o,c)=>t===s.current&&(i.set(n,r,a),i.setTowns(o),i.setTime(0),e.current?.show(i,c),!0),[i,e]);return{layer:i,state:a,close:c,openStory:(0,R.useCallback)((n,i,a)=>{let c=pp(n.id);if(!c)return;let u=++s.current,d=_f(`${n.start}T00:00:00Z`,vf(c.start));o({kind:`story`,scene:c,story:n,offset:d,status:`loading`,towns:[]}),t(),e.current?.look({...c.camera,box:c.box}),e.current?.storyTime?.(d);let f=i.filter(e=>e.lat>=c.box.s&&e.lat<=c.box.n&&e.lon>=c.box.w&&e.lon<=c.box.e),p=c.towns?c.towns.map(e=>f.find(t=>t.en===e)).filter(e=>!!e):[],m=(p.length?p:f.slice(0,8)).map(e=>({lat:e.lat,lon:e.lon,name:e[a]})),h=c.box.e-c.box.w>6;Promise.all([r(n),yf(c.box,c.start,c.hours),Sf(m,c.start,c.hours).catch(()=>[])]).then(([e,t,n])=>{let r=Tf(e,d,d+c.hours,h?.25:.05),i=new Bd(r,t,{life:h?30:18,diffusion:h?6e3:1500}),a=Cf(m,n);l(u,i,t,mp(r,c.box),a,c.camera)&&o(e=>e?.kind===`story`&&e.scene===c?{...e,status:`ready`,towns:a}:e)}).catch(()=>u===s.current&&o(e=>e&&{...e,status:`error`}))},[t,e,l]),openForecast:(0,R.useCallback)((n,r,i,a,c,u)=>{let d=++s.current,f=hp();o({kind:`forecast`,hotspot:n,title:r,start:f,hours:24,status:`loading`,towns:[],weather:null,air:null}),t();let p=n.box,m=Math.max(p.n-p.s,(p.e-p.w)*Math.cos(n.lat*Math.PI/180))+2;e.current?.look({lat:n.lat,lon:n.lon,distance:Math.min(1.6,1.04+m*.022),box:{s:p.s-1,n:p.n+1,w:p.w-1,e:p.e+1}});let h=nf(c,n.lat,n.lon,400,7).map(e=>({lat:e.lat,lon:e.lon,name:e[u],km:e.km})),g=Qd(i,n,24);tf(n.lat,n.lon).then(e=>d===s.current&&o(t=>t?.kind===`forecast`?{...t,weather:e}:t)).catch(()=>void 0),rf(h).then(e=>d===s.current&&o(t=>t?.kind===`forecast`?{...t,air:e}:t)).catch(()=>void 0),Promise.all([xf(a,30),Sf(h,new Date(f).toISOString().slice(0,13),24).catch(()=>[])]).then(([e,t])=>{let r=new Bd(g,e,{life:20,diffusion:2500}),i=Cf(h,t);l(d,r,e,mp(g,n.box),i,n)&&o(e=>e?.kind===`forecast`?{...e,status:`ready`,towns:i}:e)}).catch(()=>d===s.current&&o(e=>e&&{...e,status:`error`}))},[t,e,l])}}var _p=6,vp=class{canvas;ctx;wind=null;lat=new Float32Array;lon=new Float32Array;age=new Float32Array;life=new Float32Array;px=new Float32Array;py=new Float32Array;visible=new Uint8Array;count=0;dpr=1;width=0;height=0;speed=.2;fade=.94;density=.75;wrap=!0;colors;constructor(e=`flow`){this.canvas=document.createElement(`canvas`),this.canvas.className=e,this.canvas.setAttribute(`aria-hidden`,`true`),this.ctx=this.canvas.getContext(`2d`),this.colors=Array.from({length:_p},(e,t)=>`rgba(255,255,255,${(.5+.5*t/5).toFixed(2)})`)}setWind(e){this.wind=e,this.clear(),this.count=0}get active(){return this.wind!==null}resize(e,t,n){this.width=e,this.height=t,this.dpr=n,this.canvas.width=Math.max(1,Math.round(e*n)),this.canvas.height=Math.max(1,Math.round(t*n)),this.canvas.style.width=`${e}px`,this.canvas.style.height=`${t}px`,this.count=0}clear(){this.ctx.setTransform(1,0,0,1,0,0),this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height),this.visible.fill(0)}ensure(e){if(this.lat.length>=e)return;let t=t=>{let n=new Float32Array(e);return n.set(t),n};this.lat=t(this.lat),this.lon=t(this.lon),this.age=t(this.age),this.life=t(this.life),this.px=t(this.px),this.py=t(this.py);let n=new Uint8Array(e);n.set(this.visible),this.visible=n}spawn(e,t){let n=t.randomPlace();n?(this.lat[e]=n[0],this.lon[e]=n[1],this.age[e]=0,this.life[e]=40+Math.random()*70,this.visible[e]=0):(this.life[e]=0,this.age[e]=1)}frame(e,t=1){let n=this.wind;if(!n||!this.width)return;let r=Math.round(this.width*this.height/1e4*this.density*Math.max(.15,t)),i=Math.min(9e3,Math.max(300,r));if(i!==this.count){this.ensure(i);for(let t=this.count;t<i;t++)this.spawn(t,e),this.age[t]=Math.random()*this.life[t];this.count=i}let a=this.ctx;a.setTransform(1,0,0,1,0,0),a.globalCompositeOperation=`destination-in`,a.fillStyle=`rgba(0,0,0,${this.fade})`,a.fillRect(0,0,this.canvas.width,this.canvas.height),a.globalCompositeOperation=`source-over`,a.setTransform(this.dpr,0,0,this.dpr,0,0),a.lineWidth=1.6,a.lineCap=`round`;let o=Math.max(1e-6,e.pixelsPerDegree()),s=this.speed/o,c=Array.from({length:_p},()=>new Path2D);for(let t=0;t<i;t++){if(this.age[t]>=this.life[t]){this.spawn(t,e);continue}this.age[t]++;let r=this.lat[t],i=this.lon[t],a=n(r,i);if(!a){this.age[t]=this.life[t];continue}let[o,l]=a,u=Math.max(.05,Math.cos(r*Math.PI/180)),d=r+l*s,f=i+o*s/u;if(d>89.5||d<-89.5){this.age[t]=this.life[t];continue}this.wrap&&(f>180?f-=360:f<-180&&(f+=360)),this.lat[t]=d,this.lon[t]=f;let p=e.project(d,f);if(!p)this.age[t]=this.life[t];else{if(this.visible[t]){let e=p[0]-this.px[t],n=p[1]-this.py[t];if(e*e+n*n<900){let e=Math.min(5,Math.floor(Math.hypot(o,l)/3));c[e].moveTo(this.px[t],this.py[t]),c[e].lineTo(p[0],p[1])}}this.px[t]=p[0],this.py[t]=p[1],this.visible[t]=1}}for(let e=0;e<_p;e++)a.strokeStyle=this.colors[e],a.stroke(c[e])}},yp=4,bp=128;function xp(){let e=document.createElement(`canvas`);e.width=e.height=256;let t=e.getContext(`2d`),n=t.createImageData(256,256),r=(e,t,n)=>{let r=e*374761393+t*668265263+n*1442695041|0;return r=Math.imul(r^r>>>13,1274126177),((r^r>>>16)>>>0)/4294967296},i=e=>e*e*(3-2*e),a=(e,t,n)=>{let a=Math.floor(e),o=Math.floor(t),s=i(e-a),c=i(t-o),l=r(a,o,n)+(r(a+1,o,n)-r(a,o,n))*s;return l+(r(a,o+1,n)+(r(a+1,o+1,n)-r(a,o+1,n))*s-l)*c};for(let e=0;e<yp;e++){let t=e%2*bp,r=Math.floor(e/2)*bp;for(let i=0;i<bp;i++)for(let o=0;o<bp;o++){let s=(o+.5)/bp-.5,c=(i+.5)/bp-.5,l=0,u=.55,d=3;for(let t=0;t<4;t++)l+=u*a(s*d+10,c*d+10,e*17+t),u*=.5,d*=2.1;let f=Math.hypot(s,c)*2,p=Math.max(0,1-f*f)**1.4,m=Math.max(0,Math.min(1,p*(.35+1.25*l)-.08)),h=Math.max(0,Math.min(1,.55+l*.5-(s+c)*.6)),g=((r+i)*256+t+o)*4;n.data[g]=Math.round(h*255),n.data[g+1]=Math.round(h*255),n.data[g+2]=Math.round(h*255),n.data[g+3]=Math.round(m*255)}}t.putImageData(n,0,0);let o=new ja(e);return o.colorSpace=``,o.generateMipmaps=!0,o.minFilter=Ne,o}var Sp=`
attribute vec2 corner;
attribute vec3 iCenter;
attribute float iSize;
attribute float iAlpha;
attribute float iTone;
attribute float iSpin;
attribute float iVariant;
varying vec2 vUv;
varying float vAlpha;
varying float vTone;
varying vec2 vCell;
void main() {
  float c = cos(iSpin);
  float s = sin(iSpin);
  vec2 off = vec2(c * corner.x - s * corner.y, s * corner.x + c * corner.y) * iSize;
  vUv = corner * 0.5 + 0.5;
  vCell = vec2(mod(iVariant, 2.0), floor(iVariant / 2.0)) * 0.5;
  vTone = iTone;
  vAlpha = iAlpha;
#ifdef BILLBOARD
  // Hidden behind the planet: past the horizon seen from the camera.
  vec3 n = normalize(iCenter);
  float horizon = 1.0 / length(cameraPosition);
  vAlpha *= smoothstep(horizon, horizon + 0.02, dot(n, normalize(cameraPosition)));
  vec4 mv = modelViewMatrix * vec4(iCenter, 1.0);
  mv.xy += off;
  gl_Position = projectionMatrix * mv;
#else
  gl_Position = projectionMatrix * modelViewMatrix * vec4(iCenter + vec3(off, 0.0), 1.0);
#endif
}
`,Cp=`
uniform sampler2D uMap;
varying vec2 vUv;
varying float vAlpha;
varying float vTone;
varying vec2 vCell;
void main() {
  vec4 t = texture2D(uMap, vCell + vUv * 0.5);
  // Sooty grey over the fire, pale grey-white downwind; the shade gives the lumps their body.
  vec3 dark = vec3(0.30, 0.28, 0.26);
#ifdef BILLBOARD
  // Over the dark globe: pale smoke, as satellites see it.
  vec3 light = vec3(0.86, 0.85, 0.83);
  float boost = 1.0;
#else
  // Over the grey flat map: darker and denser, or it melts into the map.
  vec3 light = vec3(0.58, 0.56, 0.54);
  float boost = 1.45;
#endif
  vec3 col = mix(dark, light, vTone) * (0.72 + 0.42 * t.r);
  float a = min(1.0, t.a * vAlpha * boost);
  if (a < 0.004) discard;
  gl_FragColor = vec4(col, a);
}
`,wp=`
varying vec2 vUv;
varying float vAlpha;
void main() {
  float d = length(vUv - 0.5) * 2.0;
  float core = smoothstep(0.35, 0.0, d);
  float glow = smoothstep(1.0, 0.0, d);
  vec3 col = mix(vec3(1.0, 0.33, 0.08), vec3(1.0, 0.95, 0.72), core);
  gl_FragColor = vec4(col * glow * vAlpha, glow * vAlpha);
}
`;function Tp(e,t){let n=new Fo;n.setAttribute(`corner`,new Ci(new Float32Array([-1,-1,1,-1,1,1,-1,1]),2)),n.setAttribute(`position`,new Ci(new Float32Array(12),3)),n.setIndex([0,1,2,0,2,3]);let r=t=>new ga(new Float32Array(e*t),t).setUsage($t),i={center:r(3),size:r(1),alpha:r(1),tone:r(1),spin:r(1),variant:r(1)};n.setAttribute(`iCenter`,i.center),n.setAttribute(`iSize`,i.size),n.setAttribute(`iAlpha`,i.alpha),n.setAttribute(`iTone`,i.tone),n.setAttribute(`iSpin`,i.spin),n.setAttribute(`iVariant`,i.variant),n.instanceCount=0;let a=new fa(n,t);return a.frustumCulled=!1,{mesh:a,geo:n,buf:i}}function Ep(e,t){for(let n of Object.values(e))n.clearUpdateRanges(),n.addUpdateRange(0,t*n.itemSize),n.needsUpdate=!0}var Dp=class{object=new Ir;puffs;flames;texture;max;placement;order=new Uint32Array;keys=new Float32Array;tmp=new J;constructor(e,t=6e3){this.placement=e,this.max=t,this.texture=xp();let n={vertexShader:Sp,transparent:!0,depthWrite:!1,depthTest:!1,side:2,defines:e.billboard?{BILLBOARD:``}:{}};this.puffs=Tp(t,new Ja({...n,fragmentShader:Cp,uniforms:{uMap:{value:this.texture}}})),this.flames=Tp(400,new Ja({...n,fragmentShader:wp,blending:2})),this.puffs.mesh.renderOrder=5,this.flames.mesh.renderOrder=6,this.object.add(this.puffs.mesh,this.flames.mesh),this.object.visible=!1}update(e,t,n,r){if(this.object.visible=!!e,!e)return;let{place:i,kmToWorld:a}=this.placement,o=e.life,s=e.tracks;this.order.length<s.length&&(this.order=new Uint32Array(s.length),this.keys=new Float32Array(s.length));let c=0;for(let e=0;e<s.length;e++){let n=t-s[e].te;n<0||n>o||(this.order[c]=e,this.keys[e]=-n,c++)}let l=Array.from(this.order.subarray(0,c)).sort((e,t)=>this.keys[e]-this.keys[t]),u=this.puffs.buf,d=0;for(let n of l){if(d>=this.max)break;let c=s[n],l=t-c.te,f=l/Id,p=Math.floor(f),m=c.lat[p],h=c.lat[Math.min(c.lat.length-1,p+1)];if(!Number.isFinite(m)||!Number.isFinite(h))continue;let g=m+(h-m)*(f-p),_=c.lon[p]+(c.lon[Math.min(c.lon.length-1,p+1)]-c.lon[p])*(f-p),v=e.strength(c.power),y=(1.2+3.6*Math.sqrt(l))*(.6+.6*v),b=Math.min(1,l/.3)*Math.exp(-l/(o*.5))*(.45+.55*v)*.75;b<.01||(i(g,_,this.tmp),u.center.setXYZ(d,this.tmp.x,this.tmp.y,this.tmp.z),u.size.setX(d,Math.max(y*a(g),(3+4*v)*r)),u.alpha.setX(d,b),u.tone.setX(d,Math.min(1,l/o*1.6)),u.spin.setX(d,c.seed%628/100+l*.15),u.variant.setX(d,c.seed%yp),d++)}this.puffs.geo.instanceCount=d,Ep(u,d);let f=this.flames.buf,p=0;for(let o of e.sources){if(t<o.t0||t>o.t1+.5||p>=400)continue;let s=e.strength(o.power),c=.8+.2*Math.sin(n/90+o.lat*50)*Math.sin(n/53+o.lon*40);i(o.lat,o.lon,this.tmp),f.center.setXYZ(p,this.tmp.x,this.tmp.y,this.tmp.z),f.size.setX(p,Math.max((1.2+2.8*s)*a(o.lat),(3+5*s)*r)*c),f.alpha.setX(p,.9),f.tone.setX(p,0),f.spin.setX(p,0),f.variant.setX(p,0),p++}this.flames.geo.instanceCount=p,Ep(f,p)}dispose(){for(let e of[this.puffs,this.flames])e.geo.dispose(),e.mesh.material.dispose();this.texture.dispose()}},Op=12,kp=class extends Dd{data=null;order=[];drawn=[];hovered=-1;shape;avoid=null;constructor(e,t=`circle`){super(e),this.shape=t}set(e){if(this.data=e,this.drawn=[],this.hovered=-1,e){let t=e.old;this.order=Array.from({length:e.value.length},(e,t)=>t).sort((n,r)=>(t?t[n]-t[r]:0)||e.value[r]-e.value[n])}else this.order=[],this.clear()}get active(){return this.data!==null}draw(e){let t=this.ctx;this.begin();let n=this.data;if(this.drawn=[],!n||!this.width)return;let r=this.shape===`tag`?34.8:24,i=this.shape===`tag`?20.4:24,a=Math.ceil(r)+2,o=Math.ceil(this.width/a)+2,s=new Map,c=(e,t)=>{let n=Math.floor(e/a),c=Math.floor(t/a);for(let a=-1;a<=1;a++)for(let l=-1;l<=1;l++)if(s.get((c+a)*o+(n+l))?.some(n=>((n.x-e)/r)**2+((n.y-t)/i)**2<1))return!0;return!1},l=this.avoid?.active?this.avoid.drawn:[],u=r/2+Op+2,d=i/2+Op+2,f=(e,t)=>l.some(n=>((n.x-e)/u)**2+((n.y-t)/d)**2<1),p=[[0,0],[0,-d],[0,d],[u,0],[-u,0]];for(let t of this.order){let r=e.project(n.lat[t],n.lon[t]);if(!r)continue;let[i,l]=r;if(i<-12||l<-12||i>this.width+Op||l>this.height+Op)continue;let u=p.map(([e,t])=>[i+e,l+t]).find(([e,t])=>!c(e,t)&&!f(e,t));if(!u)continue;let[d,m]=u,h=Math.floor(m/a)*o+Math.floor(d/a),g=s.get(h);g?g.push({x:d,y:m}):s.set(h,[{x:d,y:m}]),this.drawn.push({i:t,x:d,y:m,ax:i,ay:l})}t.font=`700 10.5px Inter Variable, Inter, Arial, sans-serif`,t.textAlign=`center`,t.textBaseline=`middle`;for(let e of this.drawn){let r=n.color[e.i],i=e.i===this.hovered?15:Op;t.globalAlpha=n.old?.[e.i]&&e.i!==this.hovered?.5:1,(e.x!==e.ax||e.y!==e.ay)&&(t.beginPath(),t.moveTo(e.ax,e.ay),t.lineTo(e.x,e.y),t.strokeStyle=`rgba(4,6,11,0.85)`,t.lineWidth=3,t.stroke(),t.strokeStyle=`#${r.toString(16).padStart(6,`0`)}`,t.lineWidth=1.5,t.stroke(),t.beginPath(),t.arc(e.ax,e.ay,2.5,0,Math.PI*2),t.fillStyle=`#${r.toString(16).padStart(6,`0`)}`,t.fill());let a=n.label?n.label[e.i]:String(Math.round(n.value[e.i]));if(t.beginPath(),this.shape===`tag`){let n=Math.max(2*i,t.measureText(a).width+10)/2,r=i*.8;t.roundRect(e.x-n-1.5,e.y-r-1.5,2*n+3,2*r+3,r+1.5),t.fillStyle=`rgba(4,6,11,0.75)`,t.fill(),t.beginPath(),t.roundRect(e.x-n,e.y-r,2*n,2*r,r)}else t.arc(e.x,e.y,i+1.5,0,Math.PI*2),t.fillStyle=`rgba(4,6,11,0.75)`,t.fill(),t.beginPath(),t.arc(e.x,e.y,i,0,Math.PI*2);t.fillStyle=`#${r.toString(16).padStart(6,`0`)}`,t.fill(),t.fillStyle=.299*(r>>16&255)+.587*(r>>8&255)+.114*(r&255)>150?`#0b0d12`:`#ffffff`,t.fillText(a,e.x,e.y+.5)}t.globalAlpha=1}hit(e,t){let n=-1,r=225;for(let i of this.drawn){let a=(i.x-e)**2+(i.y-t)**2;a<r&&(r=a,n=i.i)}return n}position(e){let t=this.drawn.find(t=>t.i===e);return t?[t.x,t.y]:null}};function Ap(e,t,n=!0){let r=new Intl.NumberFormat(e===`uk`?`uk-UA`:`en-US`,{minimumFractionDigits:t,maximumFractionDigits:t,signDisplay:n?`exceptZero`:`auto`});return e=>r.format(e)}function jp(e){let t=Math.abs(e);return t===0||!Number.isFinite(t)?1:t>=100?0:t>=10?1:t>=1?2:Math.min(4,2-Math.floor(Math.log10(t)))}function Mp(e,t,n){let r=Ap(n,1,!1),i=r(Math.abs(e)),a=r(Math.abs(t));return n===`uk`?`${i}° ${e>=0?`пн. ш.`:`пд. ш.`}, ${a}° ${t>=0?`сх. д.`:`зх. д.`}`:`${i}° ${e>=0?`N`:`S`}, ${a}° ${t>=0?`E`:`W`}`}function Np(e,t){return Number.isFinite(e)?e<.001?t===`uk`?`p\xA0<\xA00,001`:`p\xA0<\xA00.001`:`p = ${Ap(t,3,!1)(e)}`:t===`uk`?`p\xA0=\xA0н/д`:`p\xA0=\xA0n/a`}function Pp(e,t){return e.kind===`country`?I(e.code,t,e.name):e.name?e.name[t]:e.kind===`point`?Mp(e.lat,e.lon,t):t===`uk`?`Регіон`:`Region`}var Fp={rail:{label:`Інструменти`,layers:`Шари`,fires:`Пожежі`,ukraine:`Україна`,cases:`Події`,analysis:`Аналіз`,weather:`Погода`,glossary:`Глосарій`,share:`Поділитися`},close:`Закрити`,flyout:{wider:`Розширити панель`,narrower:`Звузити панель`,resize:`Ширина панелі: тягніть край або натискайте ← →`},layers:{title:`Шари`,off:`Вимкнути`,alsoOn:`Разом із ним увімкнено`,makeMain:`Зробити головним: його шкала й роки`,stackNote:`Шари накладаються: верхній трохи прозорий, пожежі завжди зверху. Одночасно — до 3 шарів.`,borders:`Кордони й назви країн`,capitals:`Столиці`,seas:`Океани й моря`,rivers:`Річки`,geoSource:`Столиці, моря, річки й міста: Natural Earth (суспільне надбання). Крим — у складі України.`,none:`Лише Земля`,noneNote:`Без шару даних`,numbers:`є числа`,mapOnly:`лише карта`,about:`Що це?`,source:`Джерело`,mode:`Режим`,modes:{year:`Рік`,compare:`Порівняння`,trend:`Тренд`},legendYear:e=>`Аномалія ${e} року відносно 1951-1980, °C`,legendCompare:(e,t)=>`Різниця: ${t} мінус ${e}, °C`,legendTrend:(e,t)=>`Тренд ${e}-${t}, °C за 10 років`,legendWeak:`Заштриховано: тренд незначущий (p ≥ 0,05)`,legendOfficial:`Шкала NASA GIBS`,legendFires:`Точка: пожежа чи теплова аномалія за обрану добу (архів, піксель VIIRS 375 м). Пожежі за 48 годин — окремий шар «наживо» в панелі «Пожежі».`,war:`Війна в Україні: окупація й бойові дії`,warOccupied:`Тимчасово окуповані громади`,warPartly:`Частково окуповані громади`,warCombat:`Громади з активними бойовими діями`,warSource:e=>`Офіційний перелік Мінрозвитку (наказ № 376), редакція від ${e}. З точністю до громади.`,warCounts:(e,t)=>`За переліком окуповано ${e} з ${t} населених пунктів, що в ньому є.`,warLoading:`Завантажую офіційний перелік`,warError:`Не вдалося завантажити шар.`,pending:`Числа для цієї змінної з’являться після підключення NASA Earthdata. Зараз на глобусі справжній знімок NASA.`,imageryDate:`Знімок за`,fillDays:e=>`Пропуски між проходами супутника й під хмарами заповнено знімками до ${e} днів до й після цієї дати.`},cases:{title:`Події`,intro:`Що сталося на Землі і як це видно з космосу: камера летить на місце, вмикає потрібний шар і рахує тренди з даних NASA.`,open:`Відкрити подію`,sources:`Джерела`},analysis:{title:`Аналіз`,empty:`Введіть країну чи місто нижче або клацніть місце на глобусі.`,variable:`Що порівнюємо`,means:e=>`Одне число — ${e}.`,placeFor:e=>`Країна або місто для ${e}`,placePlaceholder:`Країна або місто, наприклад Львів`,placeGo:`Знайти`,placeMissing:`Не знайдено ні країни, ні міста з такою назвою.`,cellNote:`Для міста чи точки аномалію температури беремо з найближчої клітинки NASA розміром приблизно 200×200 км: це температура всього району, а не лише міста. Для самого міста точніша «Температура повітря» (клітинка близько 50 км).`,same:`майже так само`,seasonOnly:e=>`Обрано сезон «${e}»: кожне число нижче — лише за ці три місяці, а не за весь рік. Змінити сезон можна внизу панелі.`,by:(e,t)=>`на ${e} ${t}`,aheadToggle:e=>`Показати, куди веде зміна, якщо все триватиме так само (+${e} ${Ip(e)})`,seasonNotePlain:`Кожна лінія — один рік, від січня до грудня. Пунктир — звичайний рік (середнє за весь період).`,monthsLong:[`січень`,`лютий`,`березень`,`квітень`,`травень`,`червень`,`липень`,`серпень`,`вересень`,`жовтень`,`листопад`,`грудень`],summary:{title:`Коротко: що показують виміри`,none:(e,t)=>`За ${e}–${t} немає вимірів.`,firstLast:(e,t,n,r,i)=>`У ${e} — ${t}, у ${n} — ${r}: ${i}.`,extremes:(e,t,n,r,i)=>`Найбільше — у ${e} (${t}), найменше — у ${n} (${r}). Звичайний рік (середнє) — ${i}.`,steady:(e,t,n)=>`Це стійка зміна: значення ${e?`ростуть`:`зменшуються`} в середньому на ${t} кожні 10 років.${n===null?``:` Якщо порівняти кожен рік з кожним, пізніший був ${e?`більшим`:`меншим`} у ${e?n:100-n}% пар (без зміни було б близько 50%).`}`,unsteady:(e,t)=>`Стійкої зміни не видно: роки сильно скачуть угору-вниз, тож різниця між ${e} і ${t} може бути випадковою.`,few:e=>`Років замало (${e}), щоб говорити про зміну: потрібно щонайменше 10. Щоб порівняти кілька окремих років, оберіть «Окремі роки».`},yearsPick:{label:`Які роки`,modes:{period:`Період`,years:`Окремі роки`},from:`Від`,to:`До`,last:e=>`Останні ${e}`,all:`Усі роки`,periodNote:`Глобус і графік показують ці роки; змінити їх можна й на шкалі часу внизу.`,remove:e=>`Прибрати ${e}`,add:`+ рік`,yearsNote:e=>`Оберіть один рік або кілька (до ${e}): сайт порівняє їх між собою і зі звичайним роком. Два й більше років глобус покаже шторкою — так само, як кнопка «Порівняти роки» внизу.`,title:`Обрані роки`,year:`Рік`,norm:`норма 1951–1980`,normShort:`Норма`,usual:(e,t)=>`середнє за ${e}–${t}`,usualShort:`Звичайний рік`,noYear:(e,t)=>`${e?`${e}: `:``}за ${t} вимірів немає.`,rankHigh:(e,t)=>e===1?`найбільше з ${t} років`:`${e}-е місце з ${t} за величиною`,rankLow:(e,t)=>e===1?`найменше з ${t} років`:`${e}-е місце з ${t} з кінця`,yearLine:(e,t,n,r,i,a)=>`${e?`${e}, `:``}${t}: ${n} — ${r}, ніж зазвичай (${i})${a?`; ${a}`:``}.`,between:(e,t,n,r)=>`${e?`${e}: у`:`У`} ${n} ${r}, ніж у ${t}.`,twoPlaces:(e,t,n,r,i)=>`У ${e}: ${t} — на ${r} ${i}, ніж ${n}.`,month:(e,t,n,r,i)=>`У ${e} найбільше від звичайного відрізнявся ${t}: ${n} — ${i}, ніж у звичайний ${t} (${r}).`,onGlobe:`Показати цей рік на глобусі`,shutter:(e,t)=>`На глобусі шторка: ліворуч ${e}, праворуч ${t}. Клацніть інший рік у таблиці, щоб поставити його праворуч, або посуньте повзунки внизу — обрані роки зміняться разом із ними.`,monthsTitle:e=>`Місяць за місяцем: ${e}`},regionA:`Регіон A`,regionB:`Регіон B`,pickA:`Обрати A на глобусі`,pickB:`Порівняти з регіоном B`,picking:`Клацніть місце на глобусі`,pickingCountry:`Клацніть країну на глобусі`,notCountry:`Тут немає країни: це море чи океан. Клацніть сушу або перемкніть на «Точку».`,country:`Країна`,pickMode:`Клік на глобусі обирає`,pickModes:{point:`Точку`,country:`Країну`},tabs:{result:`Результат`,methods:`Як це рахується`},why:`Як це пораховано?`,trendLine:`лінія тренду (загальний напрямок)`,levels:(e,t,n,r,i,a)=>`Середнє за ${e}-${t}: ${n} — ${r}, ${i} — ${a}.`,levelsDiff:(e,t)=>`Різниця — ${t} (вище: ${e}).`,resize:`Змінити ширину панелі`,dayLoading:`Завантажую добові дані NASA POWER: це кілька секунд.`,chart:{zoomIn:`Збільшити`,zoomOut:`Зменшити`,reset:`Усе`,expand:`На весь екран`,collapse:`Згорнути`,navigator:`Вікно графіка: тягніть рамку, щоб рухатися, її краї — щоб розтягнути чи стиснути`,zoomed:(e,t)=>`${e} – ${t}`},viewNotes:{month:`Кожна точка — один місяць. Тренд перевіряє сезонний тест Манна-Кендалла: січень порівнюється лише з січнями, липень — з липнями, тож зима й літо не вдають тренд.`,day:`Кожна точка — одна доба. Для тесту дні зведено до місячних середніх (сусідні дні надто схожі, тест на сирих днях дав би хибну певність).`},testsSeasonal:(e,t,n,r)=>`Перевірки: сезонний Манн-Кендалл ${e}, t-тест на відхиленнях від норми місяця ${t}; ${n} місяців за ${r} ${Ip(r)}.`,tools:{title:`Відкрити регіон в інших інструментах`,intro:`Ті самі координати в сервісах NASA та CUAHSI (Консорціум університетів для розвитку гідрологічної науки).`,worldview:`NASA Worldview: супутникові знімки цієї області`,giovanni:`NASA Giovanni: графіки сотень змінних для цієї області`,earthdata:`NASA Earthdata Search: гідрологічні дані (GLDAS) для цієї області`,hydroshare:e=>`CUAHSI HydroShare: гідрологічні дані й моделі про ${e}`,hydroclient:`CUAHSI HydroClient: виміри річок і опадів зі станцій (оберіть область на карті)`,powerCsv:`NASA POWER: місячні значення в CSV для центру регіону`},cancel:`Скасувати`,remove:`Прибрати`,radius:`Розмір регіону`,point:`Точка`,km:e=>`${e} км`,season:`Сезон`,seasons:{year:`Рік`,djf:`Зима`,mam:`Весна`,jja:`Літо`,son:`Осінь`},loading:`Завантажую дані NASA`,error:`Не вдалося отримати дані. Перевірте інтернет і спробуйте ще раз.`,retry:`Повторити`,noNumbers:`Для цієї змінної ще немає чисел. Оберіть іншу змінну для графіка.`,verdict:{significant:`Стійка зміна`,weak:`Стійкої зміни не видно`,insufficient:`Замало років`},verdictPlain:{significant:`Значення з року в рік рухаються в один бік так часто, що випадковістю це не пояснити.`,weak:`Роки сильно скачуть угору-вниз, тож різниця між ними може бути випадковою. Це не означає, що змін немає: їх просто ще не видно напевно.`,insufficient:`Щоб говорити про зміну, потрібно щонайменше 10 років вимірів.`},rateLabel:`Швидкість зміни`,rate:(e,t,n,r)=>`${e} ${t} (≈ ${n} ${r} щороку)`,ci:(e,t)=>`Найімовірніше, швидкість між ${e} і ${t} (95% довірчий інтервал).`,tests:(e,t,n)=>`Перевірки: Манн-Кендалл ${e}, t-тест ${t}; ${n} років даних.`,pExplained:`p показує, наскільки ймовірно отримати таку зміну випадково. Що менше p, то надійніше; межа — 0,05.`,expert:`Подробиці для тих, хто знає статистику`,needMore:e=>`Якщо все триватиме так само, певності вистачить приблизно через ${e} ${Ip(e)}.`,needMin:e=>`Бракує ще ${e} ${Ip(e)} даних: для висновку треба щонайменше 10.`,detectable:e=>`Таку зміну можна надійно помітити, коли є приблизно ${e} ${Ip(e)} даних.`,marksTitle:`Що позначено на графіку`,faster:(e,t,n)=>`${e} змінюється в ${n} раза швидше, ніж ${t}.`,opposite:(e,t)=>`Тренди мають протилежні знаки: ${e} і ${t} рухаються в різні боки.`,csv:`Завантажити CSV`,png:`Завантажити PNG`,trendHint:`Пунктир — лінія тренду. Колесо миші чи кнопки — масштаб, тягніть — рух, подвійний клік — усе. Клацніть значення, щоб побачити його на глобусі.`,noData:`немає даних`,method:`Як пораховано`,view:`Графік`,views:{year:`Роки`,month:`Місяці`,day:`Дні`,cycle:`Сезонний цикл`},expected:`очікувано`,range:`95% діапазон`,onMap:`цей рік зараз на глобусі`,monthsShort:[`січ`,`лют`,`бер`,`кві`,`тра`,`чер`,`лип`,`сер`,`вер`,`жов`,`лис`,`гру`],seasonMean:(e,t)=>`середнє ${e}-${t}`,seasonExpected:e=>`очікувано ${e}`,seasonHint:`Кожна лінія — один рік. Наведіть на місяць, щоб порівняти роки.`,seasonOf:`Регіон`,forecastNote:e=>`Праворуч від періоду — не прогноз і не виміри. Це лише продовження лінії тренду на ${e} ${Ip(e)}: куди вона веде, якщо все триватиме так само. Смуга показує, де з імовірністю 95% опиниться окремий рік.`,seasonNote:e=>`Кожна лінія — один рік, від січня до грудня. Пунктир «середнє» — звичайний рік за весь період. «Очікувано ${e}» продовжує лінію тренду кожного місяця ще на рік (смуга — 95% діапазон); це не прогноз погоди.`},glossary:{title:`Глосарій`},share:{title:`Поділитися`,intro:`Посилання відкриє той самий вигляд: місце, шар, роки, регіони й справу.`,copy:`Копіювати посилання`,copied:`Посилання скопійовано`,copyFailed:`Не вдалося скопіювати. Виділіть посилання й скопіюйте вручну.`,link:`Посилання`},timeline:{label:`Шкала часу`,play:`Відтворити`,pause:`Пауза`,speed:`Швидкість`,year:`Рік на карті`,month:`Місяць`,period:`Період`,from:`Від`,to:`До`,compare:`Порівняти роки`,left:`Ліворуч`,right:`Праворуч`,handle:`Межа порівняння: тягніть або натискайте стрілки`,months:[`Січень`,`Лютий`,`Березень`,`Квітень`,`Травень`,`Червень`,`Липень`,`Серпень`,`Вересень`,`Жовтень`,`Листопад`,`Грудень`]},onNow:{title:`Що зараз увімкнено`,count:e=>`Увімкнено: ${e}`,allOff:`Вимкнути все`,offOne:e=>`Вимкнути: ${e}`,hint:`Кожне з цього вмикається у своїй панелі зліва; тут його можна вимкнути одним кліком. «Вимкнути все» лишає кордони й міста.`,compare:(e,t)=>`Порівняння років: ${e} | ${t}`,liveFires:`Пожежі за 48 годин`,aqi:`Якість повітря`,radiation:`Радіаційний фон`,front:`Лінія фронту (DeepState)`,war:`Окуповані громади`,blackout:`Блекаут 2021 | 2022`,wind:`Вітер зараз`,field:e=>`Погода зараз: ${e.toLowerCase()}`,borders:`Кордони й назви`,cities:`Міста`},exitLayer:`Звичайна Земля`,activeLayer:`Шар`,readout:{noData:`немає даних`,loading:`завантажую NASA POWER…`,error:`NASA POWER не відповів`,temp:`температура`,humidity:`вологість`,precip:`опади`,wind:`вітер`,clamped:e=>`(NASA POWER: найближчий рік ${e})`,month:(e,t)=>`${e} ${t}`},weather:{intro:`Прогноз на тиждень, офіційна ймовірність торнадо для США і як часто тут бувають дощ, спека, мороз і сильний вітер за даними NASA.`,place:`Місце`,search:`Столиця…`,searchLabel:`Знайти столицю`,useA:`Регіон A`,useB:`Регіон B`,clickHint:`Або клацніть будь-яке місце на глобусі, поки ця панель відкрита.`,forecast:`Прогноз на 7 днів`,forecastSource:`Open-Meteo (моделі погодних служб, зокрема NOAA GFS, DWD ICON, ECMWF). Це прогноз, не дані NASA.`,rainChance:`дощ`,thunder:`гроза`,gusts:`пориви`,noForecast:`Прогноз зараз недоступний.`,tornado:`Торнадо`,tornadoSource:`NOAA Storm Prediction Center (SPC), офіційні прогнози небезпечних гроз`,tornadoOutside:`Офіційну ймовірність торнадо публікує лише NOAA для США. Для інших країн такої ймовірності немає, тому ми її не вигадуємо; дивіться ймовірність грози в прогнозі вище.`,tornadoDay:e=>e===1?`Сьогодні`:e===2?`Завтра`:`Післязавтра`,tornadoChance:e=>`${e}% — імовірність торнадо в радіусі 40 км`,tornadoLow:`менше 2% — торнадо не очікують`,tornadoSig:`можливі сильні торнадо (EF2+)`,severeChance:e=>`${e}% — будь-яка небезпечна гроза (град, шквал чи торнадо) в радіусі 40 км`,severeLow:`менше 5% — небезпечних гроз не очікують`,tornadoUntil:e=>`до ${e}`,climate:`Як часто тут буває`,climateMonth:`Місяць`,climateIntro:(e,t)=>`Частка днів місяця з явищем за даними NASA POWER (MERRA-2): ${e} і ${t}. Тренд — тест Манна-Кендалла на кількості таких днів щороку.`,events:{rain:`Дощ чи сніг ≥ 1 мм`,heavy:`Сильні опади ≥ 10 мм`,hot:`Спека: максимум ≥ 30 °C`,frost:`Мороз: мінімум < 0 °C`,wind:`Сильний вітер ≥ 10 м/с`},days:e=>`≈ ${e} дн.`,trendUp:e=>`частішає: +${e} дня за 10 років`,trendDown:e=>`рідшає: −${e} дня за 10 років`,trendWeak:`надійного тренду немає`,trendNone:`не буває`,formula:`Імовірність = днів з явищем ÷ усіх днів цього місяця за роки періоду.`,loading:`Завантажую дані`,error:`Не вдалося завантажити. Перевірте інтернет.`},imagery:`Завантажую знімки NASA`,hints:{source:`Джерело`,worldview:`Знімок того дня в NASA Worldview`,openCase:`Відкрити подію на глобусі`,gapFill:e=>`Смуги без даних між обертами супутника заповнено знімком ${e} того ж дня.`}};function Ip(e){let t=e%10,n=e%100;return t===1&&n!==11?`рік`:t>=2&&t<=4&&(n<12||n>14)?`роки`:`років`}var Lp={uk:Fp,en:{rail:{label:`Tools`,layers:`Layers`,fires:`Fires`,ukraine:`Ukraine`,cases:`Events`,analysis:`Analysis`,weather:`Weather`,glossary:`Glossary`,share:`Share`},close:`Close`,flyout:{wider:`Widen the panel`,narrower:`Narrow the panel`,resize:`Panel width: drag the edge or press ← →`},layers:{title:`Layers`,off:`Turn off`,alsoOn:`Also on with it`,makeMain:`Make it the main one: its scale and years`,stackNote:`Layers lie on top of each other: the top one is a little see-through, fires are always on top. Up to 3 layers at once.`,borders:`Borders and country names`,capitals:`Capitals`,seas:`Oceans and seas`,rivers:`Rivers`,geoSource:`Capitals, seas, rivers and cities: Natural Earth (public domain). Crimea is shown as part of Ukraine.`,none:`Earth only`,noneNote:`No data layer`,numbers:`has numbers`,mapOnly:`map only`,about:`What is this?`,source:`Source`,mode:`Mode`,modes:{year:`Year`,compare:`Compare`,trend:`Trend`},legendYear:e=>`Anomaly in ${e} against 1951-1980, °C`,legendCompare:(e,t)=>`Difference: ${t} minus ${e}, °C`,legendTrend:(e,t)=>`Trend ${e}-${t}, °C per decade`,legendWeak:`Hatched: trend not significant (p ≥ 0.05)`,legendOfficial:`NASA GIBS scale`,legendFires:`Dot: a fire or thermal anomaly on the chosen day (archive, VIIRS 375 m pixel). The fires of the last 48 hours are a separate live layer in the Fires panel.`,war:`War in Ukraine: occupation and hostilities`,warOccupied:`Temporarily occupied hromadas`,warPartly:`Partly occupied hromadas`,warCombat:`Hromadas with active hostilities`,warSource:e=>`Official list of the Ministry for Development of Ukraine (Order No. 376), edition of ${e}. Accurate to the hromada (community).`,warCounts:(e,t)=>`The list counts ${e} of its ${t} settlements as occupied.`,warLoading:`Loading the official list`,warError:`Could not load the layer.`,pending:`Numbers for this variable arrive once NASA Earthdata is connected. The globe shows a real NASA image now.`,imageryDate:`Image for`,fillDays:e=>`Gaps between satellite passes and under clouds are filled from images up to ${e} days before and after this date.`},cases:{title:`Events`,intro:`What happened on Earth and how it looks from space: the camera flies there, turns on the right layer and computes the trends from NASA data.`,open:`Open the event`,sources:`Sources`},analysis:{title:`Analysis`,empty:`Type a country or a city below, or click a place on the globe.`,variable:`What to compare`,means:e=>`One number is ${e}.`,placeFor:e=>`Country or city for ${e}`,placePlaceholder:`Country or city, for example Lviv`,placeGo:`Find`,placeMissing:`No country or city by that name.`,cellNote:`For a city or a point the temperature anomaly comes from the nearest NASA cell, about 200×200 km: it is the temperature of the whole area, not just the city. For the city itself, "Air temperature" is finer (a cell of about 50 km).`,same:`about the same`,seasonOnly:e=>`Season "${e}" is picked: every number below covers only those three months, not the whole year. The season can be changed at the bottom of the panel.`,by:(e,t)=>`${e} ${t}`,aheadToggle:e=>`Show where the change leads if it goes on the same way (+${e} year${e===1?``:`s`})`,seasonNotePlain:`Each line is one year, January to December. The dashed line is a usual year (the mean over the whole period).`,monthsLong:[`January`,`February`,`March`,`April`,`May`,`June`,`July`,`August`,`September`,`October`,`November`,`December`],summary:{title:`In short: what the measurements show`,none:(e,t)=>`No measurements for ${e}-${t}.`,firstLast:(e,t,n,r,i)=>`${e}: ${t}; ${n}: ${r}, that is ${i}.`,extremes:(e,t,n,r,i)=>`Highest in ${e} (${t}), lowest in ${n} (${r}). A usual year (the mean) is ${i}.`,steady:(e,t,n)=>`This is a steady change: the values ${e?`rise`:`fall`} by ${t} every 10 years on average.${n===null?``:` Comparing every year with every other, the later one was ${e?`higher`:`lower`} in ${e?n:100-n}% of pairs (with no change it would be about 50%).`}`,unsteady:(e,t)=>`No steady change shows: the years jump up and down a lot, so the difference between ${e} and ${t} may be chance.`,few:e=>`Too few years (${e}) to talk about a change: it takes at least 10. To compare single years, pick "Single years".`},yearsPick:{label:`Which years`,modes:{period:`Period`,years:`Single years`},from:`From`,to:`To`,last:e=>`Last ${e}`,all:`All years`,periodNote:`The globe and the chart show these years; you can also change them on the timeline below.`,remove:e=>`Remove ${e}`,add:`+ year`,yearsNote:e=>`Pick one year or several (up to ${e}): the site compares them with each other and with a usual year. Two or more years show on the globe with the shutter, the same as the "Compare years" button below.`,title:`Picked years`,year:`Year`,norm:`the 1951-1980 normal`,normShort:`Normal`,usual:(e,t)=>`mean of ${e}-${t}`,usualShort:`Usual year`,noYear:(e,t)=>`${e?`${e}: `:``}no measurements for ${t}.`,rankHigh:(e,t)=>e===1?`the highest of ${t} years`:`number ${e} from the top of ${t}`,rankLow:(e,t)=>e===1?`the lowest of ${t} years`:`number ${e} from the bottom of ${t}`,yearLine:(e,t,n,r,i,a)=>`${e?`${e}, `:``}${t}: ${n}, ${r} than usual (${i})${a?`; ${a}`:``}.`,between:(e,t,n,r)=>`${e?`${e}: `:``}${n} was ${r} than ${t}.`,twoPlaces:(e,t,n,r,i)=>`In ${e}, ${t} had ${r} ${i} than ${n}.`,month:(e,t,n,r,i)=>`In ${e}, ${t} was furthest from usual: ${n}, ${i} than a usual ${t} (${r}).`,onGlobe:`Show this year on the globe`,shutter:(e,t)=>`The globe shows a shutter: ${e} on the left, ${t} on the right. Click another year in the table to put it on the right, or move the sliders below: the picked years change with them.`,monthsTitle:e=>`Month by month: ${e}`},regionA:`Region A`,regionB:`Region B`,pickA:`Pick A on the globe`,pickB:`Compare with region B`,picking:`Click a place on the globe`,pickingCountry:`Click a country on the globe`,notCountry:`There is no country here: it is sea or ocean. Click land or switch to "Point".`,country:`Country`,pickMode:`A click on the globe picks`,pickModes:{point:`A point`,country:`A country`},tabs:{result:`Result`,methods:`How it is computed`},why:`How is this computed?`,trendLine:`trend line (the overall direction)`,levels:(e,t,n,r,i,a)=>`Average over ${e}-${t}: ${n} ${r}, ${i} ${a}.`,levelsDiff:(e,t)=>`The difference is ${t} (higher: ${e}).`,resize:`Resize the panel`,dayLoading:`Loading daily NASA POWER data: a few seconds.`,chart:{zoomIn:`Zoom in`,zoomOut:`Zoom out`,reset:`All`,expand:`Full screen`,collapse:`Close`,navigator:`Chart window: drag the frame to move, its edges to stretch or shrink it`,zoomed:(e,t)=>`${e} – ${t}`},viewNotes:{month:`Each dot is one month. The trend is checked with the seasonal Mann-Kendall test: January is compared only with Januaries, July with Julys, so winter and summer do not pose as a trend.`,day:`Each dot is one day. For the test the days are turned into monthly means (neighbouring days are too alike: a test on raw days would claim false certainty).`},testsSeasonal:(e,t,n,r)=>`Checks: seasonal Mann-Kendall ${e}, t-test on departures from each month's normal ${t}; ${n} months over ${r} years.`,tools:{title:`Open the region in other tools`,intro:`The same coordinates in NASA services and CUAHSI (the Consortium of Universities for the Advancement of Hydrologic Science).`,worldview:`NASA Worldview: satellite images of this area`,giovanni:`NASA Giovanni: plots of hundreds of variables for this area`,earthdata:`NASA Earthdata Search: hydrology data (GLDAS) for this area`,hydroshare:e=>`CUAHSI HydroShare: hydrology data and models about ${e}`,hydroclient:`CUAHSI HydroClient: river and rainfall measurements from stations (pick the area on its map)`,powerCsv:`NASA POWER: monthly values as CSV for the region centre`},cancel:`Cancel`,remove:`Remove`,radius:`Region size`,point:`Point`,km:e=>`${e} km`,season:`Season`,seasons:{year:`Year`,djf:`Winter`,mam:`Spring`,jja:`Summer`,son:`Autumn`},loading:`Loading NASA data`,error:`Could not get the data. Check the connection and try again.`,retry:`Retry`,noNumbers:`This variable has no numbers yet. Pick another variable for the chart.`,verdict:{significant:`A steady change`,weak:`No steady change shows`,insufficient:`Too few years`},verdictPlain:{significant:`Year after year the values move one way so often that chance cannot explain it.`,weak:`The years jump up and down a lot, so the difference between them may be chance. It does not mean nothing changes: it just cannot be seen for sure yet.`,insufficient:`Talking about a change takes at least 10 years of measurements.`},rateLabel:`Rate of change`,rate:(e,t,n,r)=>`${e} ${t} (≈ ${n} ${r} a year)`,ci:(e,t)=>`Most likely the rate is between ${e} and ${t} (95% confidence interval).`,tests:(e,t,n)=>`Checks: Mann-Kendall ${e}, t-test ${t}; ${n} years of data.`,pExplained:`p is how likely such a change is by chance. The smaller p, the more reliable; the line is 0.05.`,expert:`Details for those who know statistics`,needMore:e=>`If things go on the same way, it will be certain in about ${e} years.`,needMin:e=>`${e} more years of data are needed: a conclusion takes at least 10.`,detectable:e=>`A change this size can be told apart reliably with about ${e} years of data.`,marksTitle:`What the marks on the chart are`,faster:(e,t,n)=>`${e} is changing ${n} times as fast as ${t}.`,opposite:(e,t)=>`The trends have opposite signs: ${e} and ${t} move in different directions.`,csv:`Download CSV`,png:`Download PNG`,trendHint:`Dashed: the trend line. Mouse wheel or the buttons zoom, drag to move, double click shows it all. Click a value to see it on the globe.`,noData:`no data`,method:`How it is computed`,view:`Chart`,views:{year:`Years`,month:`Months`,day:`Days`,cycle:`Seasonal cycle`},expected:`expected`,range:`95% range`,onMap:`this year is on the globe now`,monthsShort:[`Jan`,`Feb`,`Mar`,`Apr`,`May`,`Jun`,`Jul`,`Aug`,`Sep`,`Oct`,`Nov`,`Dec`],seasonMean:(e,t)=>`mean ${e}-${t}`,seasonExpected:e=>`expected ${e}`,seasonHint:`Each line is one year. Hover over a month to compare the years.`,seasonOf:`Region`,forecastNote:e=>`Right of the period is neither a forecast nor measurements. It only extends the trend line by ${e} years: where it leads if things go on the same way. The band shows where a single year lands with 95% probability.`,seasonNote:e=>`Each line is one year, January to December. The dashed "mean" is a typical year over the whole period. "Expected ${e}" extends each month's trend line by a year (band: 95% range); it is not a weather forecast.`},glossary:{title:`Glossary`},share:{title:`Share`,intro:`The link opens the same view: place, layer, years, regions and case.`,copy:`Copy link`,copied:`Link copied`,copyFailed:`Could not copy. Select the link and copy it by hand.`,link:`Link`},timeline:{label:`Timeline`,play:`Play`,pause:`Pause`,speed:`Speed`,year:`Map year`,month:`Month`,period:`Period`,from:`From`,to:`To`,compare:`Compare years`,left:`Left`,right:`Right`,handle:`Comparison divider: drag it or use the arrow keys`,months:[`January`,`February`,`March`,`April`,`May`,`June`,`July`,`August`,`September`,`October`,`November`,`December`]},onNow:{title:`What is on now`,count:e=>`On: ${e}`,allOff:`Turn all off`,offOne:e=>`Turn off: ${e}`,hint:`Each of these is turned on in its own panel on the left; here one click turns it off. "Turn all off" keeps the borders and cities.`,compare:(e,t)=>`Comparing years: ${e} | ${t}`,liveFires:`Fires of the last 48 hours`,aqi:`Air quality`,radiation:`Background radiation`,front:`Front line (DeepState)`,war:`Occupied hromadas`,blackout:`Blackout 2021 | 2022`,wind:`Wind now`,field:e=>`Weather now: ${e.toLowerCase()}`,borders:`Borders and names`,cities:`Cities`},exitLayer:`Plain Earth`,activeLayer:`Layer`,readout:{noData:`no data`,loading:`loading NASA POWER…`,error:`NASA POWER did not answer`,temp:`temperature`,humidity:`humidity`,precip:`precipitation`,wind:`wind`,clamped:e=>`(NASA POWER: nearest year ${e})`,month:(e,t)=>`${e} ${t}`},weather:{intro:`A week of forecast, the official tornado probability for the USA, and how often rain, heat, frost and strong wind happen here according to NASA data.`,place:`Place`,search:`Capital…`,searchLabel:`Find a capital`,useA:`Region A`,useB:`Region B`,clickHint:`Or click any place on the globe while this panel is open.`,forecast:`7-day forecast`,forecastSource:`Open-Meteo (weather service models incl. NOAA GFS, DWD ICON, ECMWF). This is a forecast, not NASA data.`,rainChance:`rain`,thunder:`thunderstorm`,gusts:`gusts`,noForecast:`The forecast is not available right now.`,tornado:`Tornado`,tornadoSource:`NOAA Storm Prediction Center (SPC), official severe weather outlooks`,tornadoOutside:`Only NOAA publishes an official tornado probability, and only for the USA. Other countries have none, so we do not make one up; see the thunderstorm chance in the forecast above.`,tornadoDay:e=>e===1?`Today`:e===2?`Tomorrow`:`Day 3`,tornadoChance:e=>`${e}% chance of a tornado within 40 km`,tornadoLow:`below 2%: no tornado expected`,tornadoSig:`strong tornadoes (EF2+) possible`,severeChance:e=>`${e}% chance of any severe storm (hail, damaging wind or tornado) within 40 km`,severeLow:`below 5%: no severe storms expected`,tornadoUntil:e=>`until ${e}`,climate:`How often it happens here`,climateMonth:`Month`,climateIntro:(e,t)=>`Share of the days of the month with the event, from NASA POWER (MERRA-2): ${e} and ${t}. Trend: the Mann-Kendall test on the number of such days each year.`,events:{rain:`Rain or snow ≥ 1 mm`,heavy:`Heavy rain ≥ 10 mm`,hot:`Heat: high ≥ 30 °C`,frost:`Frost: low < 0 °C`,wind:`Strong wind ≥ 10 m/s`},days:e=>`≈ ${e} days`,trendUp:e=>`more often: +${e} days per decade`,trendDown:e=>`less often: −${e} days per decade`,trendWeak:`no reliable trend`,trendNone:`never happens`,formula:`Probability = days with the event ÷ all days of this month over the years of the period.`,loading:`Loading data`,error:`Could not load. Check the connection.`},imagery:`Loading NASA imagery`,hints:{source:`Source`,worldview:`The image of that day in NASA Worldview`,openCase:`Open the event on the globe`,gapFill:e=>`Strips with no data between the satellite's orbits are filled from the ${e} image of the same day.`}}};function Rp(){return Lp[f().lang]}var zp={label:`Наказ Мінрозвитку № 376, zakon.rada.gov.ua`,url:`https://zakon.rada.gov.ua/laws/show/z0380-25`},Bp={label:`© OpenStreetMap contributors`,url:`https://www.openstreetmap.org/copyright`},Vp={label:`NASA GISS, GISTEMP v4`,url:`https://data.giss.nasa.gov/gistemp/`},Hp={label:`NASA POWER, MERRA-2`,url:`https://power.larc.nasa.gov/`},Up=[{id:`usa-canada`,title:{uk:`Сусіди: США і Канада`,en:`Neighbours: the USA and Canada`},story:{uk:`Дві великі країни на одному материку. Порівняйте, наскільки нагріта поверхня землі в кожній з них, чи змінюється вона і де швидше. Числа для обох країн пораховано однаково з температури поверхні NASA POWER (MERRA-2); карта показує денну температуру поверхні з MODIS у липні.`,en:`Two big countries on one continent. Compare how warm the ground is in each, whether it is changing and where faster. Both countries are computed the same way from the NASA POWER (MERRA-2) skin temperature; the map shows the daytime MODIS surface temperature in July.`},variable:`lst`,year:2025,from:2001,to:2025,borders:!0,regionA:{kind:`country`,code:`US`,lat:39.54,lon:-97.48,box:{s:18.97,w:-178.19,n:71.41,e:179.78}},regionB:{kind:`country`,code:`CA`,lat:60.32,lon:-101.91,box:{s:41.67,w:-141,n:83.12,e:-52.65}},camera:{lat:50,lon:-100,distance:2.7},sources:[Hp,{label:`MODIS Terra MOD11C3 (LP DAAC)`,url:`https://lpdaac.usgs.gov/products/mod11c3v061/`}]},{id:`kyiv-odesa`,title:{uk:`Два міста: Київ і Одеса`,en:`Two cities: Kyiv and Odesa`},story:{uk:`Одеса стоїть на березі Чорного моря, Київ — далеко від нього. Подивіться на сезонний цикл: у якому місті тепліше взимку, у якому влітку, і де температура змінюється за рік сильніше. Потім перемкніть графік на «Роки», щоб побачити, де швидше теплішає.`,en:`Odesa stands on the Black Sea coast, Kyiv far from it. Look at the seasonal cycle: which city is warmer in winter, which in summer, and where the temperature swings more over a year. Then switch the chart to "Years" to see where it warms faster.`},variable:`t2m`,year:2025,from:1981,to:2025,borders:!0,chartView:`cycle`,regionA:{kind:`point`,lat:50.45,lon:30.52,radiusKm:0,name:{uk:`Київ`,en:`Kyiv`}},regionB:{kind:`point`,lat:46.48,lon:30.73,radiusKm:0,name:{uk:`Одеса`,en:`Odesa`}},camera:{lat:48.4,lon:31,distance:1.6},sources:[Hp]},{id:`arctic`,title:{uk:`Арктика гріється найшвидше`,en:`The Arctic warms fastest`},story:{uk:`Коли тануть сніг і лід, темна вода й земля поглинають більше сонячного тепла, і це прискорює потепління. Порівняйте тренд Арктики з трендом усієї Землі.`,en:`As snow and ice melt, dark water and land absorb more sunlight, which speeds up warming. Compare the Arctic trend with the trend of the whole planet.`},variable:`gistemp`,gistempMode:`trend`,year:2025,from:1960,to:2025,regionA:{kind:`box`,s:66.5,w:-180,n:90,e:180,name:{uk:`Арктика (на північ від 66,5°)`,en:`Arctic (north of 66.5°)`}},regionB:{kind:`box`,s:-90,w:-180,n:90,e:180,name:{uk:`Уся Земля`,en:`Whole Earth`}},camera:{lat:78,lon:20,distance:2.6},sources:[Vp,{label:`NASA: Arctic Amplification, Process Drivers (Taylor et al. 2022)`,url:`https://ntrs.nasa.gov/citations/20220012781`},{label:`NASA Earth Observatory: World of Change, Arctic Sea Ice`,url:`https://science.nasa.gov/earth/earth-observatory/world-of-change/arctic-sea-ice/`}]},{id:`warminghole`,title:{uk:`«Дірка потепління» біля Гренландії`,en:`The warming hole off Greenland`},story:{uk:`На південь від Гренландії океан майже не потеплішав за століття, хоча на тих самих широтах у Європі стало помітно тепліше. Дослідники пов’язують це з послабленням атлантичної течії AMOC, яка несе тепло на північ.`,en:`South of Greenland the ocean has barely warmed in a century, while Europe at the same latitudes has clearly warmed. Researchers link this to a weakening of the Atlantic overturning circulation (AMOC), which carries heat north.`},variable:`gistemp`,gistempMode:`trend`,year:2025,from:1900,to:2025,regionA:{kind:`box`,s:50,w:-45,n:60,e:-25,name:{uk:`Атлантика на південь від Гренландії`,en:`Atlantic south of Greenland`}},regionB:{kind:`box`,s:45,w:0,n:55,e:15,name:{uk:`Західна Європа`,en:`Western Europe`}},camera:{lat:54,lon:-20,distance:2.3},sources:[Vp,{label:`Rahmstorf et al. 2015, Nature Climate Change`,url:`https://doi.org/10.1038/nclimate2554`}]},{id:`aral`,title:{uk:`Висихання Аральського моря`,en:`The shrinking Aral Sea`},story:{uk:`Колись одне з найбільших озер світу. Починаючи з 1960-х, воду річок Амудар’я і Сирдар’я забирали на зрошування полів. Тягніть шторку на глобусі: ліворуч знімок MODIS за 20 серпня 2000 року, праворуч за 20 серпня 2025-го. Східна частина моря зникла зовсім.`,en:`Once one of the largest lakes on Earth. From the 1960s the water of the Amu Darya and Syr Darya rivers was diverted to irrigate fields. Drag the divider on the globe: on the left a MODIS image of 20 August 2000, on the right 20 August 2025. The eastern part of the sea is gone.`},variable:`truecolor`,year:2025,compare:2e3,from:1981,to:2025,analysisVariable:`t2m`,season:`jja`,regionA:{kind:`point`,lat:45.2,lon:59.6,radiusKm:0,name:{uk:`Аральське море`,en:`Aral Sea`}},camera:{lat:45.2,lon:59.6,distance:1.22},borders:!0,sources:[{label:`NASA Earth Observatory: World of Change, Shrinking Aral Sea`,url:`https://science.nasa.gov/earth/earth-observatory/world-of-change/aral-sea`},Hp]},{id:`kakhovka`,title:{uk:`Каховське водосховище: до і після`,en:`The Kakhovka Reservoir: before and after`},story:{uk:`Греблю Каховської ГЕС, яку з 2022 року контролювали російські окупанти, зруйновано 6 червня 2023 року. Водосховище площею понад 2 тис. км² спорожніло за кілька днів. Тягніть шторку: ліворуч знімок MODIS за 20 серпня 2022 року, праворуч за 20 серпня 2023-го.`,en:`The Kakhovka dam, held by Russian occupying forces since 2022, was destroyed on 6 June 2023. The reservoir, over 2,000 km², drained within days. Drag the divider: on the left a MODIS image of 20 August 2022, on the right 20 August 2023.`},variable:`truecolor`,year:2023,compare:2022,from:2012,to:2025,camera:{lat:47.2,lon:34.2,distance:1.07},borders:!0,sources:[{label:`NASA Earth Observatory: Canals in Ukraine are Drying Up`,url:`https://earthobservatory.nasa.gov/images/151622/canals-in-ukraine-are-drying-up`},{label:`NASA Worldview, MODIS Terra, 20.08.2022`,url:`https://worldview.earthdata.nasa.gov/?l=MODIS_Terra_CorrectedReflectance_TrueColor&t=2022-08-20`},{label:`NASA Worldview, MODIS Terra, 20.08.2023`,url:`https://worldview.earthdata.nasa.gov/?l=MODIS_Terra_CorrectedReflectance_TrueColor&t=2023-08-20`}]},{id:`ozone`,title:{uk:`Чи загоюється озонова діра`,en:`Is the ozone hole healing`},story:{uk:`Фреони з холодильників і балончиків руйнували озон над Антарктидою щовесни. За Монреальським протоколом 1987 року країни поступово відмовилися від цих речовин. Подивіться, чи площа діри зменшується з 2000 року і чи значущий цей тренд.`,en:`CFCs from fridges and spray cans destroyed ozone over Antarctica every spring. The 1987 Montreal Protocol banned them. See whether the hole has shrunk since 2000 and whether that trend is significant.`},variable:`ozone`,year:2025,from:2e3,to:2025,regionA:{kind:`point`,lat:-90,lon:0,radiusKm:0,name:{uk:`Антарктида`,en:`Antarctica`}},camera:{lat:-78,lon:0,distance:2.7},sources:[{label:`NASA Ozone Watch`,url:`https://ozonewatch.gsfc.nasa.gov/`},{label:`NASA Earth Observatory: World of Change, Antarctic Ozone Hole`,url:`https://science.nasa.gov/earth/earth-observatory/world-of-change/ozone-hole/`}]},{id:`sahel`,title:{uk:`Опади в Сахелі`,en:`Rain in the Sahel`},story:{uk:`У 1970-80-х Сахель на південь від Сахари пережив тяжкі посухи. Порівняйте літні опади (червень-серпень) на заході й на сході регіону: та сама кліматична система, але тренди можуть різнитися.`,en:`In the 1970s and 1980s the Sahel, south of the Sahara, went through severe droughts. Compare summer rain (June to August) in the west and the east of the region: one climate system, but the trends can differ.`},variable:`precip`,year:2024,from:1981,to:2025,season:`jja`,regionA:{kind:`box`,s:12,w:-5,n:18,e:5,name:{uk:`Західний Сахель (Малі, Буркіна-Фасо, Нігер)`,en:`Western Sahel (Mali, Burkina Faso, Niger)`}},regionB:{kind:`box`,s:12,w:15,n:18,e:25,name:{uk:`Східний Сахель (Чад, Судан)`,en:`Eastern Sahel (Chad, Sudan)`}},camera:{lat:15,lon:8,distance:1.9},borders:!0,sources:[Hp,{label:`NASA Earth Observatory: Defining Desertification`,url:`https://science.nasa.gov/earth/earth-observatory/defining-desertification/`}]},{id:`ukraine`,title:{uk:`Україна: як змінився клімат`,en:`Ukraine: how the climate changed`},story:{uk:`Температура повітря в Києві та Одесі з 1981 року за місячними даними NASA MERRA-2. Усі цифри нижче пораховано щойно, коли ви відкрили цю справу.`,en:`Air temperature in Kyiv and Odesa since 1981 from NASA MERRA-2 monthly data. Every number below was computed just now, when you opened this case.`},variable:`t2m`,year:2024,from:1981,to:2025,season:`year`,regionA:{kind:`point`,lat:50.45,lon:30.52,radiusKm:0,name:{uk:`Київ`,en:`Kyiv`}},regionB:{kind:`point`,lat:46.48,lon:30.73,radiusKm:0,name:{uk:`Одеса`,en:`Odesa`}},camera:{lat:48.5,lon:31,distance:1.7},borders:!0,sources:[Hp]},{id:`ukraine-war`,title:{uk:`Україна: війна з космосу`,en:`Ukraine: the war seen from space`},story:{uk:`Росія окупувала Крим і частину Донбасу у 2014 році, а 24 лютого 2022 року почала повномасштабне вторгнення. Червоним позначено тимчасово окуповані громади, оранжевим громади з активними бойовими діями за офіційним переліком Мінрозвитку. Жовті точки показують пожежі й теплові аномалії, які прилад VIIRS зафіксував за добу. Гортайте роки внизу.`,en:`Russia occupied Crimea and part of Donbas in 2014 and launched its full-scale invasion on 24 February 2022. Red marks temporarily occupied hromadas, orange hromadas with active hostilities, from the official list of the Ministry for Development of Ukraine. The dots are fires and thermal anomalies VIIRS detected in one day. Scroll the years below.`},variable:`fires`,year:2025,from:2012,to:2025,camera:{lat:48.2,lon:36.4,distance:1.42},borders:!0,war:!0,sources:[zp,{label:`NASA FIRMS, VIIRS`,url:`https://firms.modaps.eosdis.nasa.gov/`},Bp]}],Wp=e=>`#${e.toString(16).padStart(6,`0`)}`,Gp={no2:25,so2:40,co:4e3,o3:100,dust:25};function Kp({station:t,x:r,y:a,pinned:c,frame:l,fires:p,onClose:m}){let{lang:g}=f(),_=v().airCard,y=v().ukraine.station,[b,x]=(0,R.useState)(null),[C,w]=(0,R.useState)(`loading`),[T,E]=(0,R.useState)(null),D=`${t.lat},${t.lon}`;(0,R.useEffect)(()=>{x(null),w(`loading`),E(null);let e=!1,n=window.setTimeout(()=>{t.source===`sensor`&&u(t.lat,t.lon,g).then(t=>!e&&x(t)),t.source===`waqi`&&t.uid!==void 0&&k(t.uid).then(t=>!e&&E(t)),d(t.lat,t.lon).then(t=>!e&&w(t))},c?0:280);return()=>{e=!0,window.clearTimeout(n)}},[D,t.lat,t.lon,t.source,g,c]);let O=s(t.aqi),A=new Intl.NumberFormat(g===`uk`?`uk-UA`:`en-GB`,{maximumFractionDigits:0}),j=new Intl.NumberFormat(g===`uk`?`uk-UA`:`en-GB`,{maximumFractionDigits:1}),M=[];if(p){let n=e(p).within(t.lat,t.lon,100);n.length&&M.push({icon:`fire`,text:_.fires(n.length,A.format(n[0].km))})}if(l){let e=h(l,t.lat,t.lon);e.wind<2?M.push({icon:`wind`,text:_.calm(j.format(e.wind))}):e.wind>=9&&M.push({icon:`wind`,text:_.windy(A.format(e.wind))}),e.precip>=.3&&M.push({icon:`drop`,text:_.rain(j.format(e.precip))})}let N=t.humidity??T?.iaqi.h??null;t.source!==`waqi`&&N!==null&&N>=90&&M.push({icon:`drop`,text:_.humid(A.format(N))}),C&&C!==`loading`&&(C.dust!==null&&C.dust>=Gp.dust&&M.push({icon:`air`,text:_.dust(A.format(C.dust))}),C.no2!==null&&C.no2>=Gp.no2&&M.push({icon:`air`,text:_.no2(A.format(C.no2))}),C.so2!==null&&C.so2>=Gp.so2&&M.push({icon:`air`,text:_.so2(A.format(C.so2))}),C.co!==null&&C.co>=Gp.co&&M.push({icon:`air`,text:_.co(A.format(C.co))}),C.o3!==null&&C.o3>=Gp.o3&&M.push({icon:`sun`,text:_.o3(A.format(C.o3))}));let ee=t.source===`saveecobot`?`${t.city}, ${t.name}`:t.source===`waqi`?T?.city||t.name||_.waqi:b??(t.country?I(t.country,g):_.sensor),P=[[`pm25`,`PM2.5`],[`pm10`,`PM10`],[`no2`,`NO₂`],[`o3`,`O₃`],[`so2`,`SO₂`],[`co`,`CO`]],F=t.pm25===null?null:n(t.pm25,null),te=t.pm10===null?null:n(null,t.pm10),ne=T?.dominant&&T.dominant in _.causes?T.dominant:F!==null||te!==null?(te??-1)>(F??-1)?`pm10`:`pm25`:null,re=O===0?_.causes.clean:ne?_.causes[ne]:null,ie=_.avoid[O],ae=_.do[O],oe=c?360:330,se=Math.min(window.innerWidth-oe-12,Math.max(12,r+18)),ce=Math.min(window.innerHeight-(c?520:360),Math.max(70,a-40));return(0,B.jsxs)(`section`,{className:`air-card${c?` air-card--pinned`:``}`,style:{left:se,top:Math.max(12,ce),width:oe,maxHeight:window.innerHeight-Math.max(12,ce)-12},"aria-label":ee,children:[(0,B.jsxs)(`header`,{className:`air-card__head`,children:[(0,B.jsxs)(`div`,{children:[(0,B.jsx)(`p`,{className:`air-card__kind`,children:t.source===`saveecobot`?`SaveEcoBot`:t.source===`waqi`?_.waqi:_.citizen}),(0,B.jsx)(`h2`,{className:`air-card__title`,children:ee}),t.source===`sensor`&&b&&t.country&&(0,B.jsx)(`p`,{className:`air-card__sub`,children:I(t.country,g)})]}),c&&(0,B.jsx)(`button`,{type:`button`,className:`icon-btn icon-btn--bare`,"aria-label":_.close,onClick:m,children:(0,B.jsx)(S,{name:`close`,size:18})})]}),(0,B.jsxs)(`div`,{className:`air-card__aqi`,style:{"--aqi":Wp(o[O])},children:[(0,B.jsx)(`strong`,{children:t.aqi}),(0,B.jsxs)(`span`,{children:[(0,B.jsx)(`b`,{children:_.headline[O]}),_.meaning[O]]})]}),(0,B.jsxs)(`div`,{className:`air-card__advice`,children:[ie.length>0&&(0,B.jsxs)(B.Fragment,{children:[(0,B.jsx)(`p`,{className:`air-card__why-title`,children:_.avoidTitle}),(0,B.jsx)(`ul`,{className:`air-card__list air-card__list--avoid`,children:(c?ie:ie.slice(0,2)).map(e=>(0,B.jsx)(`li`,{children:e},e))})]}),(c||ie.length===0)&&(0,B.jsxs)(B.Fragment,{children:[(0,B.jsx)(`p`,{className:`air-card__why-title`,children:_.doTitle}),(0,B.jsx)(`ul`,{className:`air-card__list air-card__list--do`,children:ae.map(e=>(0,B.jsx)(`li`,{children:e},e))})]})]}),re&&(0,B.jsxs)(`div`,{className:`air-card__cause`,children:[(0,B.jsx)(`p`,{className:`air-card__why-title`,children:_.causesTitle}),(0,B.jsx)(`p`,{children:re})]}),c&&(0,B.jsxs)(`dl`,{className:`air-card__rows`,children:[t.pm25!==null&&(0,B.jsxs)(`div`,{children:[(0,B.jsx)(`dt`,{children:`PM2.5`}),(0,B.jsxs)(`dd`,{children:[j.format(t.pm25),` µg/m³`]})]}),t.pm10!==null&&(0,B.jsxs)(`div`,{children:[(0,B.jsx)(`dt`,{children:`PM10`}),(0,B.jsxs)(`dd`,{children:[j.format(t.pm10),` µg/m³`]})]}),T?.dominant&&(0,B.jsxs)(`div`,{children:[(0,B.jsx)(`dt`,{children:_.dominant}),(0,B.jsx)(`dd`,{children:P.find(([e])=>e===T.dominant)?.[1]??T.dominant})]}),T&&P.some(([e])=>T.iaqi[e]!==void 0)&&(0,B.jsxs)(`div`,{className:`air-card__subs`,children:[(0,B.jsx)(`dt`,{children:_.subIndex}),(0,B.jsx)(`dd`,{children:P.filter(([e])=>T.iaqi[e]!==void 0).map(([e,t])=>(0,B.jsxs)(`span`,{style:{"--aqi":Wp(o[s(T.iaqi[e])])},children:[t,` `,(0,B.jsx)(`b`,{children:A.format(T.iaqi[e])})]},e))})]}),T?.iaqi.t!==void 0&&(0,B.jsxs)(`div`,{children:[(0,B.jsx)(`dt`,{children:y.temp}),(0,B.jsxs)(`dd`,{children:[j.format(T.iaqi.t),` °C`]})]}),(0,B.jsxs)(`div`,{children:[(0,B.jsx)(`dt`,{children:_.measured}),(0,B.jsx)(`dd`,{children:t.source===`sensor`?_.hourMean(i(t.time,g)):T?.time?i(T.time,g):t.source===`waqi`?t.time:i(t.time,g)})]})]}),(c||M.length>0)&&(0,B.jsxs)(`div`,{className:`air-card__why`,children:[(0,B.jsx)(`p`,{className:`air-card__why-title`,children:_.whyTitle}),C===`loading`&&M.length===0?(0,B.jsx)(`p`,{className:`note`,children:_.loading}):M.length?(0,B.jsx)(`ul`,{children:(c?M:M.slice(0,2)).map(e=>(0,B.jsxs)(`li`,{children:[(0,B.jsx)(S,{name:e.icon,size:16}),(0,B.jsx)(`span`,{children:e.text})]},e.text))}):(0,B.jsx)(`p`,{className:`note`,children:O===0?_.clean:_.nothing}),c&&(0,B.jsxs)(`p`,{className:`air-card__fine`,children:[_.disclaimer,` `,_.healthNote]}),c&&T&&T.attributions.length>0&&(0,B.jsxs)(`p`,{className:`air-card__fine`,children:[_.network,`:`,` `,T.attributions.slice(0,3).map((e,t)=>(0,B.jsxs)(`span`,{children:[t>0&&`, `,(0,B.jsx)(`a`,{href:e.url,target:`_blank`,rel:`noreferrer`,children:e.name})]},e.url))]})]}),!c&&(0,B.jsx)(`p`,{className:`air-card__hint`,children:_.clickToPin})]})}var qp=e=>`#${e.toString(16).padStart(6,`0`)}`;function Jp({station:e,x:t,y:n,pinned:r,onClose:a}){let{lang:o}=f(),s=v().radCard,[c,l]=(0,R.useState)(null),d=`${e.lat},${e.lon}`;(0,R.useEffect)(()=>{l(null);let t=!1,n=window.setTimeout(()=>void u(e.lat,e.lon,o).then(e=>!t&&l(e)),r?0:280);return()=>{t=!0,window.clearTimeout(n)}},[d,e.lat,e.lon,o,r]);let m=p(e.usv),h=_[e.src??`saveecobot`],g=new Intl.NumberFormat(o===`uk`?`uk-UA`:`en-GB`,{maximumFractionDigits:1,minimumFractionDigits:1}),b=new Intl.NumberFormat(o===`uk`?`uk-UA`:`en-GB`,{maximumFractionDigits:0}),C=r?340:320,w=Math.min(window.innerWidth-C-12,Math.max(12,t+18)),T=Math.max(12,Math.min(window.innerHeight-(r?460:300),Math.max(70,n-40)));return(0,B.jsxs)(`section`,{className:`air-card${r?` air-card--pinned`:``}`,style:{left:w,top:T,width:C,maxHeight:window.innerHeight-T-12},"aria-label":c??s.station,children:[(0,B.jsxs)(`header`,{className:`air-card__head`,children:[(0,B.jsxs)(`div`,{children:[(0,B.jsx)(`p`,{className:`air-card__kind`,children:s.kind(h.name,h.volunteer)}),(0,B.jsx)(`h2`,{className:`air-card__title`,children:c??s.station})]}),r&&(0,B.jsx)(`button`,{type:`button`,className:`icon-btn icon-btn--bare`,"aria-label":s.close,onClick:a,children:(0,B.jsx)(S,{name:`close`,size:18})})]}),(0,B.jsxs)(`div`,{className:`air-card__aqi`,style:{"--aqi":qp(x[m])},children:[(0,B.jsx)(`strong`,{children:y(e.usv,o)}),(0,B.jsxs)(`span`,{children:[(0,B.jsx)(`b`,{children:s.headline[m]}),s.unit(b.format(e.usv*1e3))]})]}),(0,B.jsx)(`p`,{className:`air-card__meaning`,children:s.meaning[m]}),h.volunteer&&(0,B.jsx)(`p`,{className:`air-card__fine`,children:s.volunteer}),(0,B.jsxs)(`div`,{className:`air-card__advice`,children:[(0,B.jsx)(`p`,{className:`air-card__why-title`,children:s.doTitle}),(0,B.jsx)(`ul`,{className:`air-card__list air-card__list--do`,children:(r?s.do[m]:s.do[m].slice(0,2)).map(e=>(0,B.jsx)(`li`,{children:e},e))})]}),r&&(0,B.jsxs)(B.Fragment,{children:[(0,B.jsxs)(`dl`,{className:`air-card__rows`,children:[(0,B.jsxs)(`div`,{children:[(0,B.jsx)(`dt`,{children:s.year}),(0,B.jsx)(`dd`,{children:s.yearValue(g.format(D(e.usv)))})]}),(0,B.jsxs)(`div`,{children:[(0,B.jsx)(`dt`,{children:s.measured}),(0,B.jsx)(`dd`,{children:i(e.time,o)})]})]}),(0,B.jsx)(`p`,{className:`air-card__fine`,children:s.compare}),(0,B.jsxs)(`p`,{className:`air-card__fine`,children:[s.disclaimer,` `,(0,B.jsxs)(`a`,{href:h.url,target:`_blank`,rel:`noreferrer`,children:[h.name,` ↗`]})]})]}),!r&&(0,B.jsx)(`p`,{className:`air-card__hint`,children:s.clickToPin})]})}function Yp(e,t){let n=new Float32Array(e.length),r=0,i=0;for(let a=0;a<e.length;a+=2)r=a===0?e[0]:r+e[a],i=a===0?e[1]:i+e[a+1],n[a]=r/t,n[a+1]=i/t;return n}var Xp=null;function Zp(){return Xp||(Xp=fetch(`/Earth-System-Detective-/data/ukraine/front-history.json`).then(e=>{if(!e.ok)throw Error(`front history ${e.status}`);return e.json()}).then(e=>{let t=e.rings.map(t=>Yp(t,e.q)),[n,r,i,a]=e.box;return{source:e.source,url:e.url,built:e.built,box:{w:n,s:r,e:i,n:a},ukraineKm2:e.ukraineKm2,ukraine:e.ukraine.filter(e=>e.length).map(t=>Yp(t,e.q)),frames:e.frames.map(e=>({date:e.d,rings:e.r.map(e=>t[e]),area:e.a,captured:e.g,liberated:e.l,pre:!!e.pre}))}}),Xp.catch(()=>Xp=null)),Xp}var Qp=[{date:`2022-04-03`,short:{uk:`Північ`,en:`North`},label:{uk:`російські війська вийшли з Київщини, Чернігівщини й Сумщини`,en:`Russian forces left the Kyiv, Chernihiv and Sumy regions`}},{date:`2022-09-11`,short:{uk:`Харківщина`,en:`Kharkiv`},label:{uk:`Харківський контрнаступ: звільнено Балаклію, Ізюм, Куп’янськ`,en:`the Kharkiv counteroffensive: Balakliia, Izium, Kupiansk liberated`}},{date:`2022-11-11`,short:{uk:`Херсон`,en:`Kherson`},label:{uk:`звільнено Херсон і правобережжя Херсонщини`,en:`Kherson and the right bank of the Kherson region liberated`}},{date:`2023-05-20`,short:{uk:`Бахмут`,en:`Bakhmut`},label:{uk:`Бахмут окуповано`,en:`Bakhmut occupied`}},{date:`2024-02-17`,short:{uk:`Авдіївка`,en:`Avdiivka`},label:{uk:`українські війська вийшли з Авдіївки`,en:`Ukrainian forces withdrew from Avdiivka`}}],$p={occupied:`#d9483b`,captured:`#ffb020`,liberated:`#4aa3ff`},em=e=>Math.log(Math.tan(Math.PI/4+e*Math.PI/360)),tm=class{canvas;frames=new Map;diffs=new Map;tmp;width;height;px;py;line;history;box;projection;constructor(e,t,n,r){this.history=e,this.box=t,this.projection=r;let{w:i,s:a,e:o,n:s}=t;if(this.width=n,r===`mercator`){let e=em(s),t=e-em(a);this.height=Math.round(n*t/((o-i)*Math.PI/180)),this.py=n=>(e-em(n))/t*this.height}else this.height=Math.round(n*(s-a)/((o-i)*Math.cos((a+s)/2*Math.PI/180))),this.py=e=>(s-e)/(s-a)*this.height;this.px=e=>(e-i)/(o-i)*n,this.line=Math.max(1,n/900),this.canvas=this.make(),this.tmp=this.make(.5)}make(e=1){let t=document.createElement(`canvas`);return t.width=Math.round(this.width*e),t.height=Math.round(this.height*e),t}path(e,t,n=1){e.beginPath();for(let r of t){for(let t=0;t<r.length;t+=2){let i=this.px(r[t])*n,a=this.py(r[t+1])*n;t===0?e.moveTo(i,a):e.lineTo(i,a)}e.closePath()}}take(e,t,n){if(e.size<t)return this.make(n);let r=e.keys().next().value,i=e.get(r);return e.delete(r),i}difference(e,t,n,r,i){let a=this.tmp.getContext(`2d`);a.globalCompositeOperation=`source-over`,a.clearRect(0,0,this.tmp.width,this.tmp.height),this.path(a,t,i),a.fillStyle=r,a.fill(`evenodd`),a.globalCompositeOperation=`destination-out`,this.path(a,n,i),a.fillStyle=`#000`,a.fill(`evenodd`),a.lineWidth=this.line*1.6*i,a.strokeStyle=`#000`,a.stroke(),a.globalCompositeOperation=`source-over`,e.drawImage(this.tmp,0,0)}diff(e){let t=this.diffs.get(e);if(t)return t;let n=this.history.frames,r=this.take(this.diffs,6,.5),i=r.getContext(`2d`);return i.clearRect(0,0,r.width,r.height),n[e].liberated>0&&this.difference(i,n[e-1].rings,n[e].rings,$p.liberated,.5),n[e].captured>0&&this.difference(i,n[e].rings,n[e-1].rings,$p.captured,.5),this.diffs.set(e,r),r}frame(e){let t=this.frames.get(e);if(t)return t;let n=this.history.frames,r=this.take(this.frames,4,1),i=r.getContext(`2d`);i.clearRect(0,0,this.width,this.height),i.save(),this.path(i,this.history.ukraine),i.clip(`evenodd`);let a=n[e];this.path(i,a.rings),i.globalAlpha=.4,i.fillStyle=$p.occupied,i.fill(`evenodd`);for(let t=3;t>=0;t--){let r=e-t;r<1||n[r].pre||n[r-1].pre||!n[r].liberated&&!n[r].captured||(i.globalAlpha=.9*(1-t/4),i.drawImage(this.diff(r),0,0,this.width,this.height))}return i.globalAlpha=.95,this.path(i,a.rings),i.lineWidth=this.line*1.4,i.lineJoin=`round`,i.strokeStyle=$p.occupied,i.stroke(),i.restore(),this.frames.set(e,r),r}warm(e){e>=0&&e<this.history.frames.length&&this.frame(e)}paint(e){let t=this.history.frames.length-1,n=Math.min(t,Math.max(0,e)),r=Math.floor(n),i=n-r,a=this.canvas.getContext(`2d`);return a.clearRect(0,0,this.width,this.height),i<.002||r>=t?(a.drawImage(this.frame(Math.round(n)),0,0),this.canvas):(a.globalCompositeOperation=`lighter`,a.globalAlpha=1-i,a.drawImage(this.frame(r),0,0),a.globalAlpha=i,a.drawImage(this.frame(r+1),0,0),a.globalAlpha=1,a.globalCompositeOperation=`source-over`,this.canvas)}};function nm(e,t){let n=0;return e.frames.forEach((e,r)=>{e.date<=t&&(n=r)}),n}var rm=3;function im({history:e,onPos:t,onClose:n,className:r=``}){let{lang:i}=f(),a=v().occupation,o=v(),s=e.frames,c=s.length-1,[l,u]=(0,R.useState)(0),[d,p]=(0,R.useState)(!0),[m,h]=(0,R.useState)(1),g=(0,R.useRef)(0),_=(0,R.useRef)(t);(0,R.useEffect)(()=>{_.current=t},[t]);let y=(e,t=d)=>{g.current=Math.min(c,Math.max(0,e)),u(g.current),_.current(g.current,t)};(0,R.useEffect)(()=>{if(_.current(g.current,d),!d)return;let e=0,t=performance.now(),n=r=>{let i=Math.min(.1,(r-t)/1e3);t=r,g.current=Math.min(c,g.current+i*rm*m),u(g.current),_.current(g.current,!0),g.current>=c?p(!1):e=requestAnimationFrame(n)};return e=requestAnimationFrame(n),()=>cancelAnimationFrame(e)},[d,m,c]);let b=Math.round(l),x=s[b],C=new Intl.NumberFormat(i===`uk`?`uk-UA`:`en-GB`,{maximumFractionDigits:0}),w=new Intl.NumberFormat(i===`uk`?`uk-UA`:`en-GB`,{maximumFractionDigits:1,minimumFractionDigits:1}),T=100*x.area/e.ukraineKm2,E=e=>s[e]?.pre?a.before:hf({from:s[e]?.date??s[c].date},i),D=[];s.forEach((e,t)=>{t>0&&e.date.slice(0,4)!==s[t-1].date.slice(0,4)&&D.push(t)});let O=x.captured>=5&&!x.pre&&b>0&&!s[b-1].pre?x.captured:0,k=x.liberated>=5&&!x.pre&&b>0&&!s[b-1].pre?x.liberated:0,A=e=>{e&&g.current>=c&&y(0,!0),p(e)};return(0,B.jsxs)(`section`,{className:`occ-player ${r}`,"aria-label":a.title,children:[(0,B.jsxs)(`header`,{className:`occ-player__head`,children:[(0,B.jsxs)(`div`,{children:[(0,B.jsx)(`h2`,{className:`occ-player__title`,children:a.title}),(0,B.jsxs)(`p`,{className:`occ-player__src`,children:[(0,B.jsx)(`a`,{href:e.url,target:`_blank`,rel:`noreferrer`,children:a.source}),` `,`· `,a.note]})]}),(0,B.jsx)(`button`,{type:`button`,className:`icon-btn icon-btn--bare`,"aria-label":o.close,onClick:n,children:(0,B.jsx)(S,{name:`close`,size:18})})]}),(0,B.jsxs)(`div`,{className:`occ-player__now`,"aria-live":`polite`,children:[(0,B.jsx)(`time`,{className:`occ-player__date`,dateTime:x.date,children:E(b)}),(0,B.jsxs)(`p`,{className:`occ-player__area`,children:[(0,B.jsx)(`span`,{className:`occ-key occ-key--occupied`,"aria-hidden":`true`}),a.occupied(C.format(Math.round(x.area/100)*100),w.format(T))]}),(0,B.jsx)(`p`,{className:`occ-player__week`,children:x.pre?a.preNote:b===1?a.gap:O||k?(0,B.jsxs)(B.Fragment,{children:[(0,B.jsxs)(`span`,{className:`occ-player__label`,children:[a.week,`:`]}),O>0&&(0,B.jsx)(`span`,{className:`occ-chip occ-chip--captured`,children:a.captured(C.format(O))}),k>0&&(0,B.jsx)(`span`,{className:`occ-chip occ-chip--liberated`,children:a.liberated(C.format(k))})]}):(0,B.jsx)(`span`,{className:`occ-player__label`,children:a.noChange})})]}),(0,B.jsx)(am,{history:e,pos:l,onSeek:e=>y(e),label:a.chart,lang:i}),(0,B.jsxs)(`div`,{className:`occ-player__row`,children:[(0,B.jsx)(`button`,{type:`button`,className:`play-btn`,"aria-label":d?o.pause:o.play,onClick:()=>A(!d),children:(0,B.jsx)(S,{name:d?`pause`:`play`})}),(0,B.jsxs)(`button`,{type:`button`,className:`speed-btn`,"aria-label":`${a.speed}: ${m}×`,onClick:()=>h(m===1?2:m===2?4:1),children:[m,`×`]}),(0,B.jsx)(np,{className:`occ-player__slider`,min:0,max:c,step:1,value:Math.round(l),onChange:e=>{p(!1),y(e,!1)},label:a.title,format:e=>E(Math.round(e)),formatTick:e=>s[Math.round(e)]?.date.slice(0,4)??``,majors:D}),(0,B.jsx)(`button`,{type:`button`,className:`chip-btn`,onClick:()=>{p(!1),y(c,!1)},children:a.today})]}),(0,B.jsxs)(`div`,{className:`occ-player__legend`,"aria-hidden":`true`,children:[(0,B.jsxs)(`span`,{children:[(0,B.jsx)(`i`,{className:`occ-key occ-key--occupied`}),a.keys.occupied]}),(0,B.jsxs)(`span`,{children:[(0,B.jsx)(`i`,{className:`occ-key occ-key--captured`}),a.keys.captured(4)]}),(0,B.jsxs)(`span`,{children:[(0,B.jsx)(`i`,{className:`occ-key occ-key--liberated`}),a.keys.liberated(4)]})]})]})}function am({history:e,pos:t,onSeek:n,label:r,lang:i}){let a=e.frames,o=1e3,s=a.map(e=>e.area),c=a.filter(e=>!e.pre).map(e=>e.area),l=Math.max(...c),u=Math.min(...c),d=Math.max(0,u-(l-u)*.25),f=e=>e/Math.max(1,a.length-1)*o,p=e=>Math.min(64,14+(1-(e-d)/Math.max(1,l-d))*48),m=s.map((e,t)=>`${t?`L`:`M`}${f(t).toFixed(1)},${p(e).toFixed(1)}`).join(``),h=`${m}L${o},64L0,64Z`,g=(0,R.useRef)(null),_=e=>{let t=g.current.getBoundingClientRect();n((e.clientX-t.left)/t.width*(a.length-1))};return(0,B.jsxs)(`div`,{className:`occ-chart`,children:[(0,B.jsxs)(`svg`,{ref:g,className:`occ-chart__svg`,viewBox:`0 0 ${o} 64`,preserveAspectRatio:`none`,role:`img`,"aria-label":r,onPointerDown:e=>{e.currentTarget.setPointerCapture(e.pointerId),_(e)},onPointerMove:e=>e.buttons&&_(e),children:[(0,B.jsx)(`path`,{d:h,fill:$p.occupied,opacity:.22}),(0,B.jsx)(`path`,{d:m,fill:`none`,stroke:$p.occupied,strokeWidth:2,vectorEffect:`non-scaling-stroke`}),Qp.map(t=>{let n=nm(e,t.date);return a[n].date>t.date&&n===0?null:(0,B.jsxs)(`g`,{className:`occ-chart__event`,children:[(0,B.jsx)(`line`,{x1:f(n),x2:f(n),y1:10,y2:64}),(0,B.jsx)(`title`,{children:`${hf({from:t.date},i)}: ${t.label[i]}`})]},t.date)}),(0,B.jsx)(`line`,{className:`occ-chart__now`,x1:f(t),x2:f(t),y1:0,y2:64,vectorEffect:`non-scaling-stroke`})]}),Qp.map((t,n)=>{let r=nm(e,t.date);return(0,B.jsx)(`span`,{className:`occ-chart__label occ-chart__label--${n%2}`,style:{left:`${f(r)/o*100}%`},title:`${hf({from:t.date},i)}: ${t.label[i]}`,children:t.short[i]},t.date)})]})}var om=[{id:`stats`,name:{uk:`Тренди й статистика`,en:`Trends and statistics`}},{id:`data`,name:{uk:`Клімат і дані з космосу`,en:`Climate and data from space`}},{id:`air`,name:{uk:`Повітря`,en:`Air`}},{id:`fire`,name:{uk:`Пожежі, радіація, війна`,en:`Fires, radiation, war`}}],sm=[{id:`trend`,group:`stats`,term:{uk:`Тренд`,en:`Trend`},text:{uk:`Стійка зміна в одному напрямку протягом багатьох років: величина в середньому зростає або спадає, хоча окремі роки стрибають угору й униз.`,en:`A steady change in one direction over many years: the value rises or falls on average even though single years jump up and down.`},formula:[`x(t) ≈ a + β · t`],symbols:{uk:`x — величина (наприклад, температура), t — рік, β — швидкість зміни за рік, a — рівень на початку.`,en:`x is the value (for example temperature), t the year, β the change per year, a the starting level.`},values:{uk:`β > 0 — величина зростає, β < 0 — спадає. На сайті швидкість показано «за 10 років» (10 · β).`,en:`β > 0: the value rises; β < 0: it falls. The site shows the speed "per decade" (10 · β).`},example:{uk:`+0,3 °C за 10 років означає, що за 50 років стало тепліше приблизно на 1,5 °C.`,en:`+0.3 °C per decade means about 1.5 °C warmer over 50 years.`},where:{uk:`Аналіз: речення над графіком і пунктирна лінія тренду.`,en:`Analysis: the sentence above the chart and the dashed trend line.`}},{id:`mannkendall`,group:`stats`,term:{uk:`Тест Манна-Кендалла`,en:`Mann-Kendall test`},text:{uk:`Перевіряє, чи значення частіше зростають, ніж спадають: порівнює кожен рік з кожним наступним. Не потребує, щоб дані лягали на пряму чи мали «правильний» розподіл, тому його люблять кліматологи.`,en:`Checks whether values go up more often than down by comparing every year with every later year. It does not need the data to follow a straight line or a "normal" distribution, which is why climate scientists like it.`},formula:[`S = Σ_{i<j} sgn(x_j − x_i)`,`Var(S) = [n(n−1)(2n+5) − Σ t(t−1)(2t+5)] / 18`,{uk:`Z = (S − 1) / √Var(S), якщо S > 0;   Z = (S + 1) / √Var(S), якщо S < 0`,en:`Z = (S − 1) / √Var(S) if S > 0;   Z = (S + 1) / √Var(S) if S < 0`},`p = 2 · [1 − Φ(|Z|)]`],symbols:{uk:`sgn — знак різниці: +1 (зросло), −1 (впало), 0 (так само); n — кількість років; t — розміри груп однакових значень; Φ — функція нормального розподілу.`,en:`sgn is the sign of the difference: +1 (up), −1 (down), 0 (same); n is the number of years; t the sizes of groups of equal values; Φ the normal distribution function.`},values:{uk:`S > 0 — частіше зростає, S < 0 — частіше спадає. |Z| > 1,96 відповідає p < 0,05 — тренд значущий.`,en:`S > 0: rises more often; S < 0: falls more often. |Z| > 1.96 corresponds to p < 0.05 — a significant trend.`},example:{uk:`10 років дають 45 пар. Якщо в 35 парах пізніший рік тепліший, а в 10 холодніший, то S = 35 − 10 = 25; Var(S) = 10·9·25/18 = 125; Z = 24/√125 ≈ 2,15; p ≈ 0,03 — значущо.`,en:`10 years give 45 pairs. If the later year is warmer in 35 pairs and colder in 10, then S = 35 − 10 = 25; Var(S) = 10·9·25/18 = 125; Z = 24/√125 ≈ 2.15; p ≈ 0.03 — significant.`},where:{uk:`Аналіз: «світлофор» надійності та вкладка «Як це рахується» з вашими числами.`,en:`Analysis: the reliability "traffic light" and the "How it is computed" tab with your numbers.`}},{id:`seasonal`,group:`stats`,term:{uk:`Сезонний тест і сезонний цикл`,en:`Seasonal test and seasonal cycle`},text:{uk:`Літо тепліше за зиму щороку — це сезонний цикл, а не тренд. Щоб він не заважав, сезонний тест Манна-Кендалла порівнює січень лише з іншими січнями, лютий — з лютими і так далі, а потім додає результати.`,en:`Summer is warmer than winter every year — that is the seasonal cycle, not a trend. To keep it out of the way, the seasonal Mann-Kendall test compares January only with other Januaries, February with Februaries and so on, then adds the results.`},formula:[`S = Σ_{m=1..12} S_m`,`Var(S) = Σ_{m=1..12} Var(S_m)`,{uk:`норма_m = середнє місяця m за всі роки;  аномалія = x − норма_m`,en:`normal_m = mean of month m over all years;  anomaly = x − normal_m`}],values:{uk:`Читається так само, як звичайний тест: Z і p.`,en:`Read it like the ordinary test: Z and p.`},where:{uk:`Аналіз: вигляд «Місяці» й «Дні» (сезонний тест), вигляд «Сезонний цикл».`,en:`Analysis: the "Months" and "Days" views (seasonal test), the "Seasonal cycle" view.`}},{id:`sen`,group:`stats`,term:{uk:`Нахил Тейла-Сена`,en:`Theil-Sen slope`},text:{uk:`Швидкість тренду: медіана нахилів між усіма парами років. Один дуже спекотний чи холодний рік майже не впливає на результат, на відміну від звичайної прямої.`,en:`How fast the trend goes: the median of the slopes between every pair of years. A single very hot or cold year barely changes it, unlike an ordinary straight line.`},formula:[{uk:`β = медіана (x_j − x_i) / (t_j − t_i),  i < j`,en:`β = median (x_j − x_i) / (t_j − t_i),  i < j`},{uk:`за 10 років = 10 · β`,en:`per decade = 10 · β`}],values:{uk:`Одиниці — одиниці величини за рік (°C/рік, мм/рік). Зміна за весь період ≈ β × кількість років.`,en:`Units are the value’s units per year (°C/yr, mm/yr). The change over the whole period ≈ β × number of years.`},example:{uk:`Три роки: 10, 12, 11. Нахили пар: (12−10)/1 = 2; (11−10)/2 = 0,5; (11−12)/1 = −1. Медіана — 0,5 за рік, тобто 5 за 10 років.`,en:`Three years: 10, 12, 11. Pair slopes: (12−10)/1 = 2; (11−10)/2 = 0.5; (11−12)/1 = −1. The median is 0.5 a year, so 5 per decade.`},where:{uk:`Аналіз: «+X за 10 років» і лінія тренду на графіку.`,en:`Analysis: "+X per decade" and the trend line on the chart.`}},{id:`ci`,group:`stats`,term:{uk:`Довірчий інтервал 95%`,en:`95% confidence interval`},text:{uk:`Межі, між якими зі звичною для науки впевненістю лежить справжня швидкість тренду. Для нахилу Сена межі беруть із впорядкованого списку всіх нахилів пар.`,en:`The range in which, with the usual scientific confidence, the true speed of the trend lies. For the Sen slope the limits are taken from the sorted list of all pair slopes.`},formula:[`C = 1,96 · √Var(S)`,{uk:`нижня межа — нахил № (N − C) / 2, верхня — № (N + C) / 2 + 1`,en:`lower limit: slope no. (N − C) / 2, upper: no. (N + C) / 2 + 1`}],symbols:{uk:`N — кількість нахилів (пар років), Var(S) — з тесту Манна-Кендалла.`,en:`N is the number of slopes (pairs of years), Var(S) comes from the Mann-Kendall test.`},values:{uk:`Якщо інтервал не містить нуля (обидві межі одного знака), тренд значущий. Що вужчий інтервал, то точніше відома швидкість.`,en:`If the interval excludes zero (both limits have the same sign), the trend is significant. The narrower it is, the better the speed is known.`},example:{uk:`+0,2 … +0,4 °C за 10 років: майже напевно теплішає, найімовірніше на 0,3.`,en:`+0.2 … +0.4 °C per decade: almost certainly warming, most likely by 0.3.`},where:{uk:`Аналіз: інтервал біля швидкості тренду; «Як це рахується».`,en:`Analysis: the interval next to the trend speed; "How it is computed".`}},{id:`pvalue`,group:`stats`,term:{uk:`p-value і значущість`,en:`p-value and significance`},text:{uk:`p — імовірність побачити такий самий або сильніший тренд, якби насправді жодного тренду не було. Тренд називають значущим, якщо його дуже важко пояснити випадковими коливаннями.`,en:`p is the chance of seeing a trend this strong or stronger if there were really no trend at all. A trend is called significant when random ups and downs can hardly explain it.`},formula:[`p = P(|Z| ≥ |z|  |  β = 0)`],values:{uk:`p < 0,01 — дуже переконливо (зелений); p < 0,05 — значущо, стандартний поріг; 0,05–0,1 — слабкий натяк (жовтий); p > 0,1 — може бути випадковістю (сірий).`,en:`p < 0.01: very convincing (green); p < 0.05: significant, the standard threshold; 0.05-0.1: a weak hint (yellow); p > 0.1: could be chance (grey).`},example:{uk:`p = 0,01 означає 1 шанс зі 100 побачити такий тренд у даних без тренду.`,en:`p = 0.01 means 1 chance in 100 of seeing such a trend in data with no trend.`},where:{uk:`Аналіз: «світлофор» надійності біля кожного регіону.`,en:`Analysis: the reliability "traffic light" next to each region.`}},{id:`ttest`,group:`stats`,term:{uk:`Пряма найменших квадратів і t-тест`,en:`Least-squares line and t-test`},text:{uk:`Класична пряма тренду: така, для якої сума квадратів відхилень точок найменша. t-тест перевіряє, чи її нахил відрізняється від нуля. Показуємо поруч із Манном-Кендаллом для порівняння.`,en:`The classic trend line: the one with the smallest sum of squared deviations. The t-test checks whether its slope differs from zero. Shown next to Mann-Kendall for comparison.`},formula:[`b = Σ (t_i − t̄)(x_i − x̄) / Σ (t_i − t̄)²`,`t = b / SE(b),  SE(b) = √[ Σ e_i² / (n − 2) / Σ (t_i − t̄)² ]`,`R² = 1 − Σ e_i² / Σ (x_i − x̄)²`],symbols:{uk:`e_i — відхилення року від прямої, x̄ і t̄ — середні.`,en:`e_i is a year’s deviation from the line, x̄ and t̄ are means.`},values:{uk:`R² від 0 до 1: частка розкиду, яку пояснює пряма. R² = 0,6 — тренд помітний; R² = 0,05 — роки стрибають сильніше, ніж росте тренд.`,en:`R² from 0 to 1: the share of the spread the line explains. R² = 0.6: a clear trend; R² = 0.05: the years jump more than the trend grows.`},where:{uk:`Аналіз → «Як це рахується».`,en:`Analysis → "How it is computed".`}},{id:`autocorr`,group:`stats`,term:{uk:`Автокореляція φ`,en:`Autocorrelation φ`},text:{uk:`Наскільки кожен рік схожий на попередній. Якщо після теплого року зазвичай іде теплий, дані «пам’ятають» минуле, і незалежної інформації в них менше, ніж здається.`,en:`How much each year resembles the one before. If a warm year is usually followed by a warm one, the data "remember" the past and hold less independent information than it seems.`},formula:[`φ = Σ e_t · e_{t−1} / Σ e_t²`],values:{uk:`φ ≈ 0 — роки незалежні; φ = 0,3–0,5 — помітна «пам’ять»; φ близько 1 — роки майже повторюють один одного.`,en:`φ ≈ 0: independent years; φ = 0.3-0.5: noticeable "memory"; φ close to 1: years nearly repeat each other.`},where:{uk:`Аналіз → «Скільки ще років треба».`,en:`Analysis → "Years still needed".`}},{id:`yearsneeded`,group:`stats`,term:{uk:`Скільки ще років треба`,en:`Years still needed`},text:{uk:`Оцінка Вейтерхеда та ін. (1998): скільки років даних потрібно, щоб тренд такої сили на такому шумі став помітним. Що слабший тренд і що більше скачуть роки, то довше чекати.`,en:`The Weatherhead et al. (1998) estimate of how many years of data a trend this strong needs to stand out from this much noise. The weaker the trend and the jumpier the years, the longer the wait.`},formula:[`n* = [ 3,3 · σ / |ω| · √((1 + φ) / (1 − φ)) ]^(2/3)`],symbols:{uk:`σ — розкид років навколо тренду, ω — нахил за рік, φ — автокореляція.`,en:`σ is the spread of years around the trend, ω the slope per year, φ the autocorrelation.`},example:{uk:`σ = 0,5 °C, ω = 0,03 °C/рік, φ = 0,2: n* = (55 · 1,22)^(2/3) ≈ 17 років.`,en:`σ = 0.5 °C, ω = 0.03 °C/yr, φ = 0.2: n* = (55 · 1.22)^(2/3) ≈ 17 years.`},where:{uk:`Аналіз → «Як це рахується».`,en:`Analysis → "How it is computed".`}},{id:`band`,group:`stats`,term:{uk:`Смуга прогнозу`,en:`Prediction band`},text:{uk:`Сіра смуга навколо лінії тренду: де за цим трендом мав би опинитися окремий рік. Рік поза смугою — справді незвичайний.`,en:`The grey band around the trend line: where a single year should fall under this trend. A year outside it is truly unusual.`},formula:[`x̂(t) = a + β·t ± t_{0,975} · s · √(1 + 1/n + (t − t̄)² / S_tt)`],values:{uk:`У смузі лежать ≈ 95 % окремих років. Смуга ширшає до країв періоду: там тренд відомий гірше.`,en:`About 95% of single years fall inside. The band widens towards the ends of the period, where the trend is known less well.`},where:{uk:`Аналіз: графік за роками.`,en:`Analysis: the yearly chart.`}},{id:`regionmean`,group:`stats`,term:{uk:`Середнє по регіону`,en:`Regional mean`},text:{uk:`Щоб отримати одне число для країни чи області, усереднюємо клітинки сітки. Клітинки біля полюсів менші за площею, тому їх рахують з меншою вагою.`,en:`To get one number for a country or region, the grid cells are averaged. Cells near the poles are smaller in area, so they get less weight.`},formula:[`x̄ = Σ w_i · x_i / Σ w_i,   w_i = cos φ_i`],symbols:{uk:`φ_i — широта клітинки.`,en:`φ_i is the cell’s latitude.`},example:{uk:`Клітинка на 60° широти важить удвічі менше, ніж на екваторі: cos 60° = 0,5.`,en:`A cell at 60° latitude weighs half as much as one at the equator: cos 60° = 0.5.`},where:{uk:`Аналіз: країна, область чи коло навколо точки.`,en:`Analysis: a country, a region or a circle around a point.`}},{id:`frequency`,group:`stats`,term:{uk:`«Як часто тут буває»`,en:`"How often it happens here"`},text:{uk:`Частка днів із дощем, спекою, морозом чи сильним вітром у двох двадцятиріччях. Порівняння показує, чи такі дні почастішали.`,en:`The share of days with rain, heat, frost or strong wind in two twenty-year periods. The comparison shows whether such days have become more common.`},formula:[{uk:`P = k / N`,en:`P = k / N`}],symbols:{uk:`k — кількість днів з явищем, N — усі дні періоду.`,en:`k is the number of days with the event, N all days of the period.`},example:{uk:`73 спекотні дні з 7 305 (20 років) — це 1 %, тобто ≈ 3,7 дня на рік.`,en:`73 hot days out of 7,305 (20 years) is 1%, about 3.7 days a year.`},where:{uk:`Погода → «Як часто тут буває» (1981–2000 проти 2006–2025).`,en:`Weather → "How often it happens here" (1981-2000 vs 2006-2025).`}},{id:`opposite`,group:`stats`,term:{uk:`Протилежні тренди`,en:`Opposite trends`},text:{uk:`Одна величина може зростати в одному регіоні й спадати в іншому через той самий процес. Тому варто порівнювати кілька регіонів, а не лише середнє по Землі.`,en:`One variable can rise in one region and fall in another because of the same process. That is why several regions are worth comparing, not just the global average.`},example:{uk:`Опади в західному й східному Сахелі змінюються по-різному, хоча це одна кліматична система.`,en:`Rain in the western and eastern Sahel changes differently, though it is one climate system.`},where:{uk:`Аналіз: регіон B для порівняння.`,en:`Analysis: region B for comparison.`}},{id:`anomaly`,group:`data`,term:{uk:`Аномалія і базовий період`,en:`Anomaly and base period`},text:{uk:`Аномалія — різниця між значенням і «нормою», тобто середнім за базовий період. У GISTEMP базовий період — 1951–1980 роки, до сильного потепління й з добрим покриттям станцій.`,en:`An anomaly is the difference between a value and the "normal", the average over a base period. GISTEMP uses 1951-1980, before strong warming and with good station coverage.`},formula:[{uk:`аномалія = x − середнє(1951–1980)`,en:`anomaly = x − mean(1951-1980)`}],values:{uk:`0 — як у середньому за 1951–1980; +1 °C — на градус тепліше; −0,5 °C — холодніше. Інший базовий період зсуває всі аномалії на одне число, але тренд не змінює.`,en:`0: as on average in 1951-1980; +1 °C: a degree warmer; −0.5 °C: colder. Another base period shifts all anomalies by one number but leaves the trend unchanged.`},example:{uk:`2024 рік: ≈ +1,3 °C над нормою 1951–1980 для всієї Землі — найтепліший рік вимірювань.`,en:`2024: about +1.3 °C above the 1951-1980 normal for the whole Earth — the warmest year on record.`},where:{uk:`Шар «Аномалія температури» (GISTEMP), графіки аналізу.`,en:`The "Temperature anomaly" layer (GISTEMP), analysis charts.`}},{id:`gistemp`,group:`data`,term:{uk:`GISTEMP`,en:`GISTEMP`},text:{uk:`Температурний архів NASA GISS з 1880 року: тисячі метеостанцій на суші плюс температура поверхні моря, зведені в сітку клітинок 2° × 2°.`,en:`NASA GISS’s temperature record since 1880: thousands of land weather stations plus sea surface temperature, combined into a grid of 2° × 2° cells.`},values:{uk:`Режими шару: «Рік» — аномалія за рік; «Різниця» — два роки порівняно; «Тренд» — °C за 10 років у кожній клітинці (незначущі заштриховано).`,en:`Layer modes: "Year" — the anomaly of a year; "Difference" — two years compared; "Trend" — °C per decade in each cell (non-significant ones hatched).`},where:{uk:`Шари → Температура → «Аномалія температури».`,en:`Layers → Temperature → "Temperature anomaly".`}},{id:`reanalysis`,group:`data`,term:{uk:`Реаналіз (MERRA-2)`,en:`Reanalysis (MERRA-2)`},text:{uk:`Модель погоди NASA, яка «перепрогравала» минуле з 1980 року, щоразу підлаштовуючись під мільйони реальних вимірювань. Дає однорідні дані для всієї Землі навіть там, де немає станцій.`,en:`NASA's weather model replaying the past since 1980 while matching millions of real measurements. Gives consistent data for the whole Earth, even where there are no stations.`},values:{uk:`Клітинка ≈ 0,5° × 0,625° (≈ 50 км). Для міста це середнє по клітинці, а не вимір на вулиці.`,en:`A cell is about 0.5° × 0.625° (≈ 50 km). For a city it is the cell average, not a street measurement.`},where:{uk:`Температура повітря, опади, волога ґрунту, вологість; «Моє місто» (NASA POWER).`,en:`Air temperature, precipitation, soil moisture, humidity; "My city" (NASA POWER).`}},{id:`satellite`,group:`data`,term:{uk:`Супутникові прилади`,en:`Satellite instruments`},text:{uk:`MODIS (Terra, Aqua) знімає сушу, хмари й температуру поверхні; VIIRS (Suomi NPP, NOAA-20, NOAA-21) — пожежі й нічні вогні; OMI (Aura) міряє озон і NO₂; AIRS (Aqua) — температуру, вологість і чадний газ в атмосфері; GPM — опади.`,en:`MODIS (Terra, Aqua) images land, clouds and surface temperature; VIIRS (Suomi NPP, NOAA-20, NOAA-21) fires and night lights; OMI (Aura) measures ozone and NO₂; AIRS (Aqua) temperature, humidity and carbon monoxide in the atmosphere; GPM precipitation.`},values:{uk:`Роздільна здатність — розмір пікселя: VIIRS-пожежі 375 м, MODIS 250 м–1 км, OMI ≈ 13 × 24 км, AIRS ≈ 1°.`,en:`Resolution is the pixel size: VIIRS fires 375 m, MODIS 250 m-1 km, OMI ≈ 13 × 24 km, AIRS ≈ 1°.`},where:{uk:`Шари: джерело кожного шару вказано під ним.`,en:`Layers: each layer’s source is shown under it.`}},{id:`ndvi`,group:`data`,term:{uk:`NDVI (індекс рослинності)`,en:`NDVI (vegetation index)`},text:{uk:`Наскільки зелена й густа рослинність. Живе листя сильно відбиває ближнє інфрачервоне світло й поглинає червоне — супутник порівнює ці два кольори.`,en:`How green and dense the vegetation is. Living leaves strongly reflect near-infrared light and absorb red — the satellite compares these two colours.`},formula:[`NDVI = (NIR − Red) / (NIR + Red)`],symbols:{uk:`NIR — відбиття в ближньому інфрачервоному, Red — у червоному.`,en:`NIR is the near-infrared reflectance, Red the red reflectance.`},values:{uk:`від −1 до 0 — вода, сніг, хмари; 0–0,2 — голий ґрунт, пісок, місто; 0,2–0,5 — трава, поля; 0,6–0,9 — густий ліс.`,en:`−1 to 0: water, snow, clouds; 0-0.2: bare soil, sand, city; 0.2-0.5: grass, fields; 0.6-0.9: dense forest.`},example:{uk:`NIR = 0,5, Red = 0,08 → NDVI = 0,42 / 0,58 ≈ 0,72 — густа рослинність.`,en:`NIR = 0.5, Red = 0.08 → NDVI = 0.42 / 0.58 ≈ 0.72 — dense vegetation.`},where:{uk:`Шари → Земля → «Рослинність».`,en:`Layers → Land → "Vegetation".`}},{id:`lst`,group:`data`,term:{uk:`Температура поверхні (LST) і моря (SST)`,en:`Land (LST) and sea (SST) surface temperature`},text:{uk:`Наскільки нагріта сама поверхня — ґрунт, дах, асфальт чи вода, — а не повітря над нею. Супутник бачить її в тепловому інфрачервоному світлі. Улітку вдень суша буває набагато гарячішою за повітря.`,en:`How hot the surface itself is — soil, roofs, asphalt or water — not the air above it. The satellite sees it in thermal infrared light. On a summer day land can be much hotter than the air.`},values:{uk:`Порожні місця на шарі — здебільшого хмари: крізь них температуру поверхні не видно.`,en:`Blank patches on the layer are mostly clouds: the surface temperature cannot be seen through them.`},where:{uk:`Шари → Температура: «Температура поверхні суші», «Температура моря».`,en:`Layers → Temperature: "Land surface temperature", "Sea temperature".`}},{id:`precip`,group:`data`,term:{uk:`Опади, мм`,en:`Precipitation, mm`},text:{uk:`Скільки води впало б на рівну поверхню, якби вона не стікала й не випаровувалась. Сніг перераховують у воду.`,en:`How much water would collect on a flat surface if it did not run off or evaporate. Snow is converted to water.`},formula:[{uk:`1 мм опадів = 1 літр води на 1 м²`,en:`1 mm of precipitation = 1 litre of water per m²`}],values:{uk:`мм/год — інтенсивність: 0,5–2 — слабкий дощ, 2–8 — помірний, понад 8 — сильний. За добу 50 мм і більше — дуже сильний дощ.`,en:`mm/h is intensity: 0.5-2 light rain, 2-8 moderate, over 8 heavy. 50 mm or more in a day is very heavy rain.`},example:{uk:`500 мм за 8 годин у Чіві (Іспанія, 2024) — це пів тонни води на кожен квадратний метр.`,en:`500 mm in 8 hours in Chiva (Spain, 2024) is half a tonne of water on every square metre.`},where:{uk:`Шари «Опади», погода, радар.`,en:`The "Precipitation" layers, the weather, the radar.`}},{id:`soilmoisture`,group:`data`,term:{uk:`Волога ґрунту`,en:`Soil moisture`},text:{uk:`Яка частка пор у шарі ґрунту, де ростуть корені, заповнена водою. Показує посуху краще, ніж самі опади: враховує й випаровування.`,en:`What share of the pores in the root-zone soil is filled with water. It shows drought better than rain alone, because it includes evaporation.`},values:{uk:`0 % — зовсім сухо, 100 % — ґрунт повністю насичений водою. Різке падіння влітку — ознака посухи.`,en:`0%: completely dry; 100%: soil fully saturated. A sharp summer drop signals drought.`},where:{uk:`Шари → Вода → «Волога ґрунту».`,en:`Layers → Water → "Soil moisture".`}},{id:`seaice`,group:`data`,term:{uk:`Концентрація морського льоду`,en:`Sea ice concentration`},text:{uk:`Яку частку моря в клітинці вкриває лід.`,en:`What share of the sea in a cell is covered by ice.`},values:{uk:`Від 0 до 100 %. Клітинку з понад 15 % льоду вважають вкритою льодом — так рахують площу льоду Арктики.`,en:`0 to 100%. A cell with over 15% ice counts as ice-covered — that is how the Arctic ice area is computed.`},where:{uk:`Шари → Вода → «Морський лід».`,en:`Layers → Water → "Sea ice".`}},{id:`dobson`,group:`data`,term:{uk:`Озон і одиниця Добсона`,en:`Ozone and the Dobson unit`},text:{uk:`Озоновий шар у стратосфері поглинає шкідливий ультрафіолет. Його кількість міряють в одиницях Добсона (DU): якби весь озон над точкою стиснути до звичайного тиску, вийшов би дуже тонкий шар.`,en:`The ozone layer in the stratosphere absorbs harmful ultraviolet. It is measured in Dobson units (DU): if all the ozone above a point were squeezed to ordinary pressure, it would make a very thin layer.`},formula:[{uk:`1 DU = шар чистого озону завтовшки 0,01 мм`,en:`1 DU = a layer of pure ozone 0.01 mm thick`}],values:{uk:`≈ 300 DU — норма (3 мм); менше 220 DU — «озонова діра».`,en:`≈ 300 DU is normal (3 mm); below 220 DU is the "ozone hole".`},where:{uk:`Шар «Озон», подія «Озонова діра над Антарктидою».`,en:`The "Ozone" layer, the "Antarctic ozone hole" event.`}},{id:`nightlights`,group:`data`,term:{uk:`Нічні вогні`,en:`Night lights`},text:{uk:`Яскравість світла вночі, яку бачить VIIRS: міста, дороги, заводи, газові факели. Зникнення світла часто означає знеструмлення або спустіння.`,en:`The brightness of light at night seen by VIIRS: cities, roads, factories, gas flares. Light disappearing often means power cuts or abandonment.`},values:{uk:`Одиниця — нВт/(см²·ср) (нановат на квадратний сантиметр на стерадіан). Місяць і хмари теж підсвічують знімок, тому порівнюють ясні ночі.`,en:`The unit is nW/(cm²·sr) (nanowatts per square centimetre per steradian). Moonlight and clouds also light the image, so clear nights are compared.`},where:{uk:`Шар «Нічні вогні», порівняння «Блекаут» на панелі «Україна».`,en:`The "Night lights" layer, the "Blackout" comparison in the Ukraine panel.`}},{id:`aqi`,group:`air`,term:{uk:`AQI — індекс якості повітря`,en:`AQI — Air Quality Index`},text:{uk:`Одне число від 0 до 500, яке перекладає концентрацію забруднення на зрозумілу шкалу. Кожна речовина має свої межі; AQI станції — найгірший з індексів PM2.5 і PM10. На сайті — шкала US EPA (2024).`,en:`One number from 0 to 500 that turns a pollution concentration into an easy scale. Each pollutant has its own breakpoints; a station’s AQI is the worst of its PM2.5 and PM10 indices. The site uses the US EPA scale (2024).`},formula:[`I = (I_hi − I_lo) / (C_hi − C_lo) · (C − C_lo) + I_lo`,`AQI = max(I_PM2.5, I_PM10)`],symbols:{uk:`C — концентрація, C_lo і C_hi — межі діапазону, куди вона потрапила, I_lo і I_hi — значення індексу на цих межах.`,en:`C is the concentration, C_lo and C_hi the limits of the range it falls in, I_lo and I_hi the index values at those limits.`},values:{uk:`0–50 чисте; 51–100 прийнятне; 101–150 брудне для чутливих людей; 151–200 брудне для всіх; 201–300 дуже брудне; 301–500 небезпечне. Межі PM2.5 (мкг/м³): 9 / 35,4 / 55,4 / 125,4 / 225,4.`,en:`0-50 clean; 51-100 acceptable; 101-150 unhealthy for sensitive people; 151-200 unhealthy for everyone; 201-300 very unhealthy; 301-500 hazardous. PM2.5 breakpoints (µg/m³): 9 / 35.4 / 55.4 / 125.4 / 225.4.`},example:{uk:`PM2.5 = 20 мкг/м³ лежить між 9,1 і 35,4 → AQI = (100 − 51) / (35,4 − 9,1) · (20 − 9,1) + 51 ≈ 71 — «прийнятне».`,en:`PM2.5 = 20 µg/m³ lies between 9.1 and 35.4 → AQI = (100 − 51) / (35.4 − 9.1) · (20 − 9.1) + 51 ≈ 71 — "acceptable".`},where:{uk:`Кружечки якості повітря на глобусі й мапі України, «Моє місто».`,en:`The air-quality circles on the globe and the Ukraine map, "My city".`}},{id:`pm25`,group:`air`,term:{uk:`PM2.5 і PM10 (пил)`,en:`PM2.5 and PM10 (particles)`},text:{uk:`Частинки, менші за 2,5 і 10 мікрометрів. PM2.5 приблизно в 30 разів тонші за волосину й проникають глибоко в легені та кров. Головні джерела PM2.5 — дим (паління трави, листя, сміття, пічне опалення, пожежі) і вихлопи; PM10 — ще й пил з доріг, будов і полів.`,en:`Particles smaller than 2.5 and 10 micrometres. PM2.5 is about 30 times thinner than a hair and gets deep into the lungs and blood. The main PM2.5 sources are smoke (burning grass, leaves, rubbish, stoves, wildfires) and exhaust; PM10 adds dust from roads, building sites and fields.`},values:{uk:`Рекомендації ВООЗ (2021): PM2.5 — не більше 15 мкг/м³ за добу й 5 за рік; PM10 — 45 за добу й 15 за рік.`,en:`WHO guidelines (2021): PM2.5 no more than 15 µg/m³ per day and 5 per year; PM10 45 per day and 15 per year.`},where:{uk:`Картка станції, прогноз якості повітря на мапі погоди.`,en:`The station card, the air-quality forecast on the weather map.`}},{id:`gases`,group:`air`,term:{uk:`NO₂, O₃, SO₂, CO — гази-забруднювачі`,en:`NO₂, O₃, SO₂, CO — polluting gases`},text:{uk:`NO₂ (діоксид азоту) — від двигунів, ТЕС і котелень; O₃ (приземний озон) — утворюється на сонці з вихлопних газів, найбільше в спекотний день; SO₂ (діоксид сірки) — від спалювання вугілля й мазуту, металургії; CO (чадний газ) — від неповного згоряння: пожежі, печі, вихлопи.`,en:`NO₂ (nitrogen dioxide) comes from engines, power plants and boilers; O₃ (ground-level ozone) forms in sunlight from exhaust gases, most on hot days; SO₂ (sulphur dioxide) from burning coal and fuel oil and from steelworks; CO (carbon monoxide) from incomplete burning: wildfires, stoves, exhaust.`},values:{uk:`Рекомендації ВООЗ (2021), мкг/м³: NO₂ — 25 за добу; O₃ — 100 за 8 годин; SO₂ — 40 за добу; CO — 4 000 за добу.`,en:`WHO guidelines (2021), µg/m³: NO₂ 25 per day; O₃ 100 per 8 hours; SO₂ 40 per day; CO 4,000 per day.`},where:{uk:`Картка станції: «Що є поруч за даними» (модель CAMS), шар NO₂ на глобусі.`,en:`The station card: "What the data show nearby" (CAMS model), the NO₂ layer on the globe.`}},{id:`ugm3`,group:`air`,term:{uk:`мкг/м³`,en:`µg/m³`},text:{uk:`Мікрограм на кубічний метр: скільки мільйонних часток грама речовини є в кубометрі повітря.`,en:`Micrograms per cubic metre: how many millionths of a gram of a substance are in a cubic metre of air.`},formula:[{uk:`1 мкг = 0,000001 г`,en:`1 µg = 0.000001 g`}],example:{uk:`За добу людина вдихає ≈ 15 м³ повітря; при PM2.5 = 50 мкг/м³ це ≈ 750 мкг дрібного пилу.`,en:`A person breathes about 15 m³ of air a day; at PM2.5 = 50 µg/m³ that is about 750 µg of fine dust.`}},{id:`cams`,group:`air`,term:{uk:`Модель CAMS і вимірювання`,en:`The CAMS model and measurements`},text:{uk:`Copernicus CAMS — модель, яка розраховує, як рухаються дим, пил і гази, і прогнозує їх на кілька днів. Це розрахунок, а не прилад на вулиці: модель бачить великі хмари диму й пилу, але може пропустити місцеве джерело, наприклад котельню. Кружечки станцій — справжні вимірювання.`,en:`Copernicus CAMS is a model that computes how smoke, dust and gases move and forecasts them a few days ahead. It is a calculation, not an instrument in the street: it sees large clouds of smoke and dust but can miss a local source such as a boiler house. Station circles are real measurements.`},values:{uk:`Сітка ≈ 0,5° (близько 40–50 км) над Україною й сусідами, крок 3 години.`,en:`A grid of about 0.5° (40-50 km) over Ukraine and its neighbours, every 3 hours.`},where:{uk:`Мапа погоди → «Повітря · прогноз моделі», картка станції.`,en:`Weather map → "Air · model forecast", the station card.`}},{id:`aod`,group:`air`,term:{uk:`Аерозолі (оптична товща)`,en:`Aerosols (optical depth)`},text:{uk:`Наскільки частинки в повітрі — дим, пил, морська сіль — затуляють сонце по всій висоті атмосфери.`,en:`How much the particles in the air — smoke, dust, sea salt — dim the Sun through the whole height of the atmosphere.`},formula:[`I = I₀ · e^(−τ)`],symbols:{uk:`τ — оптична товща, I₀ — світло над атмосферою, I — біля землі.`,en:`τ is the optical depth, I₀ the light above the atmosphere, I near the ground.`},values:{uk:`τ ≈ 0,1 — прозоре повітря; 0,5 — помітний серпанок; понад 1 — густий дим чи пилова буря (до землі доходить менше 37 % прямого світла).`,en:`τ ≈ 0.1: clear air; 0.5: visible haze; over 1: thick smoke or a dust storm (less than 37% of direct light reaches the ground).`},where:{uk:`Шари → Повітря → «Аерозолі», «Пил».`,en:`Layers → Air → "Aerosols", "Dust".`}},{id:`firepixel`,group:`fire`,term:{uk:`Точка пожежі (теплова аномалія)`,en:`Fire point (thermal anomaly)`},text:{uk:`Піксель, у якому супутник побачив вогонь або дуже гарячу поверхню. Одна велика пожежа — це багато точок поруч. Крім пожеж, так видно газові факели й гарячі цехи заводів, тому їх у підрахунках відкидаємо.`,en:`A pixel where the satellite saw fire or a very hot surface. One big fire is many points side by side. Besides fires, gas flares and hot factory buildings show up this way, so they are left out of the counts.`},values:{uk:`VIIRS — піксель 375 м, MODIS — 1 км. Хмари й густий дим ховають вогонь. Дані з’являються приблизно через 3 години після прольоту супутника.`,en:`VIIRS has a 375 m pixel, MODIS 1 km. Clouds and thick smoke hide fire. Data appear about 3 hours after the satellite passes.`},example:{uk:`9 квітня 2018 року NASA нарахувала в Україні 552 окремі осередки вогню, а пікселів вогню за той день — понад 2 000.`,en:`On 9 April 2018 NASA counted 552 separate hotspots in Ukraine, and over 2,000 fire pixels that day.`},where:{uk:`Пожежі за 48 годин, історії пожеж, шар «Пожежі».`,en:`Fires of the last 48 hours, fire stories, the "Fires" layer.`}},{id:`frp`,group:`fire`,term:{uk:`Потужність вогню (FRP)`,en:`Fire radiative power (FRP)`},text:{uk:`Скільки тепла вогонь випромінює щосекунди, у мегаватах. Що більша потужність, то більше палива згоряє і то більше диму.`,en:`How much heat the fire radiates each second, in megawatts. The higher it is, the more fuel burns and the more smoke there is.`},formula:[{uk:`енергія вогню (МДж) = Σ FRP (МВт) × час (с)`,en:`fire energy (MJ) = Σ FRP (MW) × time (s)`}],values:{uk:`Орієнтовно: до 10 МВт — горить стерня чи невелике вогнище; 10–100 МВт — сильна пожежа; понад 100 МВт — дуже велика лісова пожежа.`,en:`Roughly: up to 10 MW — stubble or a small fire; 10-100 MW — a strong fire; over 100 MW — a very large wildfire.`},where:{uk:`Розмір точок на глобусі в історіях пожеж.`,en:`The size of the points on the globe in fire stories.`}},{id:`area`,group:`fire`,term:{uk:`Гектар, км², акр`,en:`Hectare, km², acre`},text:{uk:`Одиниці площі, у яких рахують згарища, затоплені землі й окуповані території.`,en:`The area units used for burned land, flooded land and occupied territory.`},formula:[{uk:`1 га = 100 м × 100 м = 10 000 м²`,en:`1 ha = 100 m × 100 m = 10,000 m²`},{uk:`1 км² = 100 га`,en:`1 km² = 100 ha`},{uk:`1 акр ≈ 0,405 га`,en:`1 acre ≈ 0.405 ha`}],example:{uk:`Пожежа Палісейдс — 23 448 акрів ≈ 9 500 га ≈ 95 км². Футбольне поле — близько 0,7 га.`,en:`The Palisades fire: 23,448 acres ≈ 9,500 ha ≈ 95 km². A football pitch is about 0.7 ha.`}},{id:`radiation`,group:`fire`,term:{uk:`Радіаційний фон, мкЗв/год`,en:`Background radiation, µSv/h`},text:{uk:`Потужність дози — скільки опромінення людина отримує за годину. Природний фон є всюди: від ґрунту, каміння й космосу. На сайті його показують станції, кожна з яких постійно міряє фон саме у своєму місці (Україна — SaveEcoBot; Німеччина й Фінляндія — державні мережі BfS і STUK; решта світу — волонтерські лічильники Safecast і Sensor.Community).`,en:`The dose rate — how much radiation a person receives per hour. Natural background is everywhere: from soil, rock and space. On the site it comes from stations, each of which keeps measuring the background at its own place (Ukraine: SaveEcoBot; Germany and Finland: the national networks BfS and STUK; elsewhere: volunteer counters of Safecast and Sensor.Community).`},formula:[{uk:`доза (мкЗв) = потужність (мкЗв/год) × час (год)`,en:`dose (µSv) = dose rate (µSv/h) × time (h)`}],values:{uk:`до 0,15 — низький фон; 0,15–0,3 — звичайний; 0,3–1 — підвищений (граніт, гори); понад 1 — забруднені ділянки, як у Чорнобильській зоні. 1 мкЗв/год = 1 000 нЗв/год.`,en:`up to 0.15: low background; 0.15-0.3: ordinary; 0.3-1: raised (granite, mountains); over 1: contaminated spots, as in the Chornobyl zone. 1 µSv/h = 1,000 nSv/h.`},example:{uk:`У літаку на висоті польоту — приблизно 3–5 мкЗв/год, тобто політ на 3 години дає ≈ 10–15 мкЗв.`,en:`In a plane at cruising altitude it is about 3-5 µSv/h, so a 3-hour flight gives about 10-15 µSv.`},where:{uk:`Україна → «Радіаційний фон (станції SaveEcoBot)».`,en:`Ukraine → "Background radiation (SaveEcoBot stations)".`}},{id:`occupied`,group:`fire`,term:{uk:`Окупована територія (DeepState)`,en:`Occupied territory (DeepState)`},text:{uk:`Межі окупованої Росією території України за щоденними мапами проєкту DeepState, разом із Кримом і окупованими з 2014 року частинами Донеччини й Луганщини. Площу сайт рахує сам із цих меж.`,en:`The limits of the part of Ukraine occupied by Russia from the daily maps of the DeepState project, including Crimea and the parts of Donetsk and Luhansk regions occupied since 2014. The site computes the area from these limits itself.`},formula:[{uk:`частка = площа окупованого / 603 628 км² (площа України)`,en:`share = occupied area / 603,628 km² (area of Ukraine)`}],values:{uk:`Захоплене за тиждень — те, що стало окупованим порівняно з попереднім тижнем; звільнене — те, що перестало бути окупованим. Межі приблизні (≈ сотні метрів).`,en:`Captured in a week: what became occupied compared with the week before; liberated: what stopped being occupied. The limits are approximate (≈ hundreds of metres).`},where:{uk:`Україна → «Окуповані території: хронологія з 2022 року».`,en:`Ukraine → "Occupied territory: timeline since 2022".`}},{id:`co2eq`,group:`fire`,term:{uk:`CO₂-еквівалент`,en:`CO₂-equivalent`},text:{uk:`Спосіб додати різні парникові гази: кожен перераховують у таку кількість CO₂, яка нагріла б планету так само за 100 років.`,en:`A way to add up different greenhouse gases: each is converted to the amount of CO₂ that would warm the planet as much over 100 years.`},formula:[{uk:`CO₂-екв = маса газу × GWP₁₀₀`,en:`CO₂-eq = mass of gas × GWP₁₀₀`}],values:{uk:`GWP₁₀₀: CO₂ = 1, метан ≈ 28, закис азоту ≈ 265 (МГЕЗК, AR5).`,en:`GWP₁₀₀: CO₂ = 1, methane ≈ 28, nitrous oxide ≈ 265 (IPCC AR5).`},where:{uk:`Розділ «Наслідки війни для довкілля», події про пожежі.`,en:`The "War and the environment" section, the fire events.`}}],cm={year:4,compare:4,trend:.8};function lm(e,t,n,r,i){let[a,o]=(0,R.useState)(`idle`),[s,c]=(0,R.useState)(null),[l,u]=(0,R.useState)(null),[d,f]=(0,R.useState)(!1),[p,m]=(0,R.useState)(0),h=(0,R.useRef)(null),g=(0,R.useRef)(0);(0,R.useEffect)(()=>{if(!e||s)return;let t=!1;return o(`loading`),ae().then(e=>{t||(c(e),o(`ready`))}).catch(()=>!t&&o(`error`)),()=>{t=!0}},[e,s,p]),(0,R.useEffect)(()=>()=>h.current?.terminate(),[]),(0,R.useEffect)(()=>{if(!e||!s)return;if(t===`year`){u(F(s,n)),f(!1);return}if(t===`compare`){u(ee(s,r,i)),f(!1);return}let a=++g.current;f(!0);let o=window.setTimeout(()=>{h.current||=new Worker(new URL(`/Earth-System-Detective-/assets/trend.worker-CKcduiAx.js`,``+import.meta.url),{type:`module`});let e=h.current;e.onmessage=e=>{let t=e.data;if(t.id!==g.current)return;let n=new Uint8Array(t.pValue.length);for(let e=0;e<n.length;e++)n[e]=+(t.pValue[e]<.05);u({values:t.slope,pValues:t.pValue,significant:n}),f(!1)};let{meta:t}=s;e.postMessage({id:a,data:s.data,cells:t.nlat*t.nlon,startYear:t.startYear,from:r,to:i,scale:t.scale,missing:t.missing})},250);return()=>window.clearTimeout(o)},[e,s,t,n,r,i]);let _=(0,R.useMemo)(()=>{if(!e||!s||!l)return null;let{meta:a}=s;return{rgba:P(a,l,cm[t]),width:a.nlon,height:a.nlat,key:`${t}:${n}:${r}:${i}`}},[e,s,l]),v=(0,R.useMemo)(()=>{if(!s||!l)return null;let{meta:e}=s,a=e.globalMean,o=t=>a[t-e.startYear];if(t===`year`){let e=o(n);return e==null?null:{value:e}}if(t===`compare`){let e=o(r),t=o(i);return e==null||t==null?null:{value:t-e}}let c=[],u=[];for(let e=r;e<=i;e++){let t=o(e);t!=null&&(c.push(e),u.push(t))}if(c.length<10)return{value:te(e,l.values)};let{slope:d,p:f}=ne(c,u);return{value:d,p:f}},[s,l]),y=(0,R.useCallback)(()=>m(e=>e+1),[]);return{status:a,computing:d,data:s,field:e?l:null,overlay:_,global:v,retry:y}}var um=300,dm=360,fm=600,pm=`esd-flyout-width`;function mm(){return Math.max(um,Math.min(900,Math.round(window.innerWidth*.62)-80))}function hm(){try{let e=Number(localStorage.getItem(pm));return Number.isFinite(e)&&e>=um?e:dm}catch{return dm}}function gm({title:e,onClose:t,children:n}){let r=Rp(),i=(0,R.useRef)(null),[a,o]=(0,R.useState)(hm),[s,c]=(0,R.useState)(!1),l=e=>Math.round(Math.min(mm(),Math.max(um,e))),u=l(a);(0,R.useLayoutEffect)(()=>{(i.current?.closest(`.studio`)??i.current)?.style.setProperty(`--flyout-w`,`${u}px`)},[u]),(0,R.useEffect)(()=>{if(!s)try{localStorage.setItem(pm,String(a))}catch{}},[a,s]);let[,d]=(0,R.useState)(0);(0,R.useEffect)(()=>{let e=()=>d(e=>e+1);return window.addEventListener(`resize`,e),()=>window.removeEventListener(`resize`,e)},[]);let f=e=>{if(e.button!==0)return;e.preventDefault();let t=e.currentTarget,n=e.clientX,r=i.current?.getBoundingClientRect().width??u;t.setPointerCapture(e.pointerId),c(!0);let a=e=>o(l(r+e.clientX-n)),s=()=>{c(!1),t.removeEventListener(`pointermove`,a),t.removeEventListener(`pointerup`,s),t.removeEventListener(`pointercancel`,s)};t.addEventListener(`pointermove`,a),t.addEventListener(`pointerup`,s),t.addEventListener(`pointercancel`,s)},p=e=>{let t=e.shiftKey?80:32,n=e.key===`ArrowRight`?u+t:e.key===`ArrowLeft`?u-t:e.key===`Home`?um:e.key===`End`?mm():null;n!==null&&(e.preventDefault(),o(l(n)))},m=u>=480;return(0,B.jsxs)(`section`,{ref:i,className:`flyout${s?` flyout--dragging`:``}`,id:`studio-panel`,"aria-label":e,children:[(0,B.jsxs)(`header`,{className:`flyout__head`,children:[(0,B.jsx)(`h2`,{className:`flyout__title`,children:e}),(0,B.jsxs)(`div`,{className:`flyout__tools`,children:[(0,B.jsx)(`button`,{type:`button`,className:`icon-btn icon-btn--bare flyout__wide`,"aria-label":m?r.flyout.narrower:r.flyout.wider,title:m?r.flyout.narrower:r.flyout.wider,onClick:()=>o(l(m?dm:fm)),children:(0,B.jsx)(S,{name:m?`narrow`:`widen`,size:18})}),(0,B.jsx)(`button`,{type:`button`,className:`icon-btn icon-btn--bare`,"aria-label":r.close,onClick:t,children:(0,B.jsx)(S,{name:`close`,size:18})})]})]}),(0,B.jsx)(`div`,{className:`flyout__body`,children:n}),(0,B.jsx)(`div`,{className:`flyout__resize`,role:`separator`,"aria-orientation":`vertical`,"aria-label":r.flyout.resize,title:r.flyout.resize,"aria-valuemin":um,"aria-valuemax":mm(),"aria-valuenow":u,tabIndex:0,onPointerDown:f,onKeyDown:p,onDoubleClick:()=>o(dm)})]})}function _m(e){let{lang:t}=f(),n=Rp(),r=Nd(),i=e.variable?M[e.variable]:null;return(0,B.jsxs)(B.Fragment,{children:[(0,B.jsxs)(`label`,{className:`switch`,children:[(0,B.jsx)(`input`,{type:`checkbox`,checked:e.borders,onChange:t=>e.onBorders(t.target.checked)}),(0,B.jsx)(`span`,{className:`switch__track`,"aria-hidden":`true`}),(0,B.jsx)(`span`,{className:`switch__text`,children:n.layers.borders})]}),e.borders&&(0,B.jsxs)(`div`,{className:`sublayers`,children:[[`capitals`,`seas`,`rivers`].map(t=>(0,B.jsxs)(`label`,{className:`check`,children:[(0,B.jsx)(`input`,{type:`checkbox`,checked:e.labels[t],onChange:n=>e.onLabels({[t]:n.target.checked})}),(0,B.jsx)(`span`,{className:`check__swatch check__swatch--${t}`,"aria-hidden":`true`}),(0,B.jsx)(`span`,{children:n.layers[t]})]},t)),(0,B.jsxs)(`label`,{className:`check`,title:r.layerNote,children:[(0,B.jsx)(`input`,{type:`checkbox`,checked:e.cities,onChange:t=>e.onCities(t.target.checked)}),(0,B.jsx)(`span`,{className:`check__swatch check__swatch--cities`,"aria-hidden":`true`}),(0,B.jsx)(`span`,{children:r.layer})]}),e.cities&&(0,B.jsx)(`p`,{className:`note`,children:r.layerNote}),(0,B.jsx)(`p`,{className:`legend__src`,children:(0,B.jsx)(`a`,{href:`https://www.naturalearthdata.com/`,target:`_blank`,rel:`noreferrer`,children:n.layers.geoSource})})]}),i&&(0,B.jsxs)(`section`,{className:`layer-now`,children:[(0,B.jsxs)(`div`,{className:`layer-now__head`,children:[(0,B.jsx)(`span`,{className:`layer-now__thumb`,children:(0,B.jsx)(ym,{id:i.id})}),(0,B.jsxs)(`div`,{children:[(0,B.jsx)(`p`,{className:`layer-now__kicker`,children:n.activeLayer}),(0,B.jsx)(`h3`,{className:`layer-now__name`,children:i.name[t]})]}),(0,B.jsxs)(`button`,{type:`button`,className:`chip-btn`,onClick:()=>e.onLayerOff(i.id),children:[(0,B.jsx)(S,{name:`close`,size:14}),n.layers.off]})]}),e.extra.length>0&&(0,B.jsxs)(`div`,{className:`layer-now__also`,children:[(0,B.jsx)(`p`,{className:`layer-now__kicker`,children:n.layers.alsoOn}),(0,B.jsx)(`ul`,{className:`layer-now__list`,children:[...e.extra].reverse().map(r=>(0,B.jsxs)(`li`,{children:[(0,B.jsx)(`button`,{type:`button`,className:`text-btn`,title:n.layers.makeMain,onClick:()=>e.onVariable(r),children:M[r].name[t]}),(0,B.jsx)(`button`,{type:`button`,className:`icon-btn icon-btn--bare icon-btn--small`,"aria-label":`${n.layers.off}: ${M[r].name[t]}`,onClick:()=>e.onLayerOff(r),children:(0,B.jsx)(S,{name:`close`,size:14})})]},r))}),(0,B.jsx)(`p`,{className:`note`,children:n.layers.stackNote}),(0,B.jsx)(`button`,{type:`button`,className:`chip-btn`,onClick:()=>e.onVariable(null),children:n.exitLayer})]}),(0,B.jsxs)(`p`,{className:`note`,children:[i.definition[t],` `,(0,B.jsx)(`a`,{href:i.sourceUrl,target:`_blank`,rel:`noreferrer`,children:i.source[t]})]})]}),e.variable===`gistemp`&&(0,B.jsxs)(`fieldset`,{className:`seg`,children:[(0,B.jsx)(`legend`,{className:`visually-hidden`,children:n.layers.mode}),[`year`,`compare`,`trend`].map(t=>(0,B.jsxs)(`label`,{className:`seg__item`,children:[(0,B.jsx)(`input`,{type:`radio`,name:`gistemp-mode`,checked:e.mode===t,onChange:()=>e.onMode(t)}),(0,B.jsx)(`span`,{children:n.layers.modes[t]})]},t))]}),i&&(0,B.jsx)(xm,{...e}),i?.pendingNumbers&&(0,B.jsx)(`p`,{className:`note`,children:n.layers.pending}),oe.map(r=>(0,B.jsxs)(`section`,{className:`shelf`,"aria-label":r.name[t],children:[(0,B.jsx)(`h3`,{className:`shelf__title`,children:r.name[t]}),(0,B.jsx)(`div`,{className:`shelf__row`,children:ie.filter(e=>e.group===r.id).map(r=>(0,B.jsxs)(`button`,{type:`button`,className:`layer-card`,"aria-pressed":e.variable===r.id||e.extra.includes(r.id),title:r.definition[t],onClick:()=>e.variable===r.id||e.extra.includes(r.id)?e.onLayerOff(r.id):e.onVariable(r.id),children:[(0,B.jsxs)(`span`,{className:`layer-card__img`,children:[(0,B.jsx)(ym,{id:r.id}),r.series&&(0,B.jsx)(`span`,{className:`layer-card__badge`,children:n.layers.numbers})]}),(0,B.jsx)(`span`,{className:`layer-card__name`,children:r.name[t]})]},r.id))})]},r.id))]})}var vm=`https://gibs.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi?SERVICE=WMS&REQUEST=GetMap&VERSION=1.3.0&STYLES=&CRS=EPSG:4326&BBOX=-60,-180,85,180&WIDTH=256&HEIGHT=104`;function ym({id:e}){let t=M[e],n=`${vm}&LAYERS=BlueMarble_ShadedRelief_Bathymetry&FORMAT=image/jpeg`;if(!t.imagery)return(0,B.jsx)(`span`,{className:`layer-thumb layer-thumb--ramp`,style:{background:`linear-gradient(120deg, ${N.join(`, `)})`}});let r=t.imagery,i=Number(r.last.slice(0,4))-+!r.static,a=r.time===`daily`?re(r,i):re(r,i,r.month),o=`${vm}&LAYERS=${r.layer}&FORMAT=image/png&TRANSPARENT=TRUE${r.static?``:`&TIME=${a}`}`;return(0,B.jsxs)(`span`,{className:`layer-thumb`,children:[t.id!==`truecolor`&&(0,B.jsx)(`img`,{src:n,alt:``,loading:`lazy`}),(0,B.jsx)(`img`,{src:o,alt:``,loading:`lazy`})]})}function bm({data:e,status:t}){let{lang:n}=f(),r=Rp();return t===`loading`?(0,B.jsx)(`p`,{className:`note`,role:`status`,children:r.layers.warLoading}):t===`error`||!e?t===`error`?(0,B.jsx)(`p`,{className:`note`,role:`alert`,children:r.layers.warError}):null:(0,B.jsxs)(`figure`,{className:`legend legend--war`,children:[(0,B.jsxs)(`ul`,{className:`war-keys`,children:[(0,B.jsxs)(`li`,{children:[(0,B.jsx)(`span`,{className:`war-key war-key--occupied`,"aria-hidden":`true`}),r.layers.warOccupied]}),(0,B.jsxs)(`li`,{children:[(0,B.jsx)(`span`,{className:`war-key war-key--partly`,"aria-hidden":`true`}),r.layers.warPartly]}),(0,B.jsxs)(`li`,{children:[(0,B.jsx)(`span`,{className:`war-key war-key--combat`,"aria-hidden":`true`}),r.layers.warCombat]})]}),(0,B.jsxs)(`p`,{className:`legend__src`,children:[(0,B.jsx)(`a`,{href:e.url,target:`_blank`,rel:`noreferrer`,children:r.layers.warSource(e.edition)}),` `,r.layers.warCounts(e.counts.settlementsOccupied,e.counts.settlementsListed),` `,(0,B.jsx)(`a`,{href:`https://www.openstreetmap.org/copyright`,target:`_blank`,rel:`noreferrer`,children:e.boundaries.replace(`ODbL`,n===`uk`?`ліцензія ODbL`:`ODbL`)})]})]})}function xm(e){let{lang:t}=f(),n=Rp(),r=e.variable?M[e.variable]:null,[i,a]=(0,R.useState)(null);if(!r)return null;if(r.id===`gistemp`){let r=cm[e.mode],i=Ap(t,+(e.mode===`trend`)),a=[-r,-r/2,0,r/2,r],o=e.mode===`year`?n.layers.legendYear(e.year):e.mode===`compare`?n.layers.legendCompare(e.from,e.to):n.layers.legendTrend(e.from,e.to);return(0,B.jsxs)(`figure`,{className:`legend`,children:[(0,B.jsx)(`figcaption`,{className:`legend__title`,children:o}),(0,B.jsx)(`div`,{className:`legend__bar`,style:{background:`linear-gradient(to right, ${N.join(`, `)})`},"aria-hidden":`true`}),(0,B.jsx)(`div`,{className:`legend__ticks`,"aria-hidden":`true`,children:a.map((e,t)=>(0,B.jsxs)(`span`,{children:[t===0?`≤`:t===a.length-1?`≥`:``,i(e)]},e))}),e.mode===`trend`&&(0,B.jsxs)(`p`,{className:`legend__weak`,children:[(0,B.jsx)(`span`,{className:`legend__hatch`,"aria-hidden":`true`}),n.layers.legendWeak]})]})}if(!r.imagery)return null;let o=`https://gibs.earthdata.nasa.gov/legends/${r.imagery.layer}_H.svg`,s=(e.day&&r.imagery.time===`daily`&&e.day.startsWith(String(e.year))?e.day:null)??(r.imagery.time===`daily`?re(r.imagery,e.year):re(r.imagery,e.year,e.month));return(0,B.jsxs)(`figure`,{className:`legend`,children:[(0,B.jsxs)(`figcaption`,{className:`legend__title`,children:[r.name[t],`: `,n.layers.imageryDate,` `,s]}),r.imagery.gapFill&&(()=>{let e=r.imagery.gapFill.find(e=>s>=e.first);return e?(0,B.jsx)(`p`,{className:`legend__src`,children:n.hints.gapFill(e.name[t])}):null})(),r.imagery.fillDays&&(0,B.jsx)(`p`,{className:`legend__src`,children:n.layers.fillDays(r.imagery.fillDays)}),r.imagery.points?(0,B.jsxs)(`p`,{className:`legend__points`,children:[(0,B.jsx)(`span`,{className:`legend__dot`,"aria-hidden":`true`}),n.layers.legendFires]}):r.id!==`truecolor`&&(0,B.jsx)(km,{id:r.id,fallback:i===o?null:(0,B.jsx)(`img`,{className:`legend__img`,src:o,alt:`${n.layers.legendOfficial}: ${r.name[t]}`,loading:`lazy`,onError:()=>a(o)})}),(0,B.jsx)(`p`,{className:`legend__src`,children:(0,B.jsx)(`a`,{href:r.sourceUrl,target:`_blank`,rel:`noreferrer`,children:r.source[t]})})]})}var Sm={"usa-canada":{photo:L.niagara,kind:`heat`},"kyiv-odesa":{photo:L.odesa,kind:`heat`},arctic:{photo:L.meltPond,kind:`ice`},warminghole:{kind:`water`},aral:{photo:L.aral,kind:`drought`},kakhovka:{photo:L.kherson,kind:`war`},ozone:{photo:L.halley,kind:`ozone`},sahel:{photo:L.sahel,kind:`drought`},ukraine:{photo:L.fields,kind:`heat`},"ukraine-war":{photo:L.kyivDark,kind:`war`}};function Cm(e){let t=v().event,[n,r]=(0,R.useState)(`news`);return(0,B.jsxs)(B.Fragment,{children:[(0,B.jsx)(`div`,{className:`seg`,role:`tablist`,"aria-label":t.tabs.news,children:[`news`,`cases`].map(e=>(0,B.jsx)(`button`,{type:`button`,role:`tab`,className:`seg__btn`,"aria-selected":n===e,"aria-pressed":n===e,onClick:()=>r(e),children:t.tabs[e]},e))}),n===`news`?(0,B.jsx)(wm,{activeId:e.newsId,onOpen:e.onNews}):(0,B.jsx)(Tm,{activeId:e.activeId,onOpen:e.onOpen})]})}function wm({activeId:e,onOpen:t}){let{lang:n}=f(),r=v().event,[i,a]=(0,R.useState)(`all`),o=df.filter(e=>pf(e,i));return(0,B.jsxs)(B.Fragment,{children:[(0,B.jsx)(`p`,{className:`note`,children:r.newsIntro}),(0,B.jsx)(`div`,{className:`chips`,role:`group`,"aria-label":r.tabs.news,children:Object.keys(r.topics).map(e=>(0,B.jsx)(`button`,{type:`button`,className:`chip-btn`,"aria-pressed":i===e,onClick:()=>a(e),children:r.topics[e]},e))}),(0,B.jsx)(`p`,{className:`news-count`,children:r.count(o.length)}),(0,B.jsx)(`ol`,{className:`news`,children:o.map(r=>{let i=ff[r.kind];return(0,B.jsx)(`li`,{children:(0,B.jsxs)(`button`,{type:`button`,className:`news-card`,"aria-current":e===r.id?`true`:void 0,onClick:()=>t(r),children:[(0,B.jsxs)(`span`,{className:`news-card__img`,style:{"--hint":i.color},children:[r.photo?(0,B.jsx)(`img`,{src:ce(r.photo,240),alt:``,loading:`lazy`}):(0,B.jsx)(S,{name:i.icon,size:26}),(0,B.jsx)(`span`,{className:`case-card__kind`,children:(0,B.jsx)(S,{name:i.icon,size:12})})]}),(0,B.jsxs)(`span`,{className:`news-card__words`,children:[(0,B.jsx)(`time`,{className:`news-card__date`,dateTime:r.when.from,children:hf(r.when,n)}),(0,B.jsx)(`span`,{className:`news-card__title`,children:r.title[n]}),(0,B.jsx)(`span`,{className:`news-card__place`,children:r.place[n]})]})]})},r.id)})})]})}function Tm({activeId:e,onOpen:t}){let{lang:n}=f(),r=Rp();return(0,B.jsxs)(B.Fragment,{children:[(0,B.jsx)(`p`,{className:`note`,children:r.cases.intro}),(0,B.jsx)(`ol`,{className:`cases`,children:Up.map(r=>{let i=Sm[r.id]??{kind:`heat`},a=ff[i.kind];return(0,B.jsx)(`li`,{children:(0,B.jsxs)(`button`,{type:`button`,className:`case-card`,"aria-current":e===r.id?`true`:void 0,onClick:()=>t(r),children:[(0,B.jsxs)(`span`,{className:`case-card__img`,style:{"--hint":a.color},children:[i.photo?(0,B.jsx)(`img`,{src:ce(i.photo,320),alt:``,loading:`lazy`}):(0,B.jsx)(S,{name:a.icon,size:34}),(0,B.jsx)(`span`,{className:`case-card__kind`,children:(0,B.jsx)(S,{name:a.icon,size:14})})]}),(0,B.jsxs)(`span`,{className:`case-card__words`,children:[(0,B.jsx)(`span`,{className:`case-card__title`,children:r.title[n]}),(0,B.jsx)(`span`,{className:`case-card__text`,children:r.story[n]})]})]})},r.id)})})]})}function Em({text:e}){let t=[],n=/_\{([^}]*)\}|_([A-Za-z0-9.]+)|\^\(([^)]*)\)/g,r=0,i;for(;i=n.exec(e);)i.index>r&&t.push(e.slice(r,i.index)),t.push(i[3]===void 0?(0,B.jsx)(`sub`,{children:i[1]??i[2]},i.index):(0,B.jsx)(`sup`,{children:i[3]},i.index)),r=n.lastIndex;return r<e.length&&t.push(e.slice(r)),(0,B.jsx)(`span`,{className:`gloss-formula__line`,children:t})}function Dm(){let{lang:e}=f(),t=v().glossary,[n,r]=(0,R.useState)(``),[i,a]=(0,R.useState)(`all`),o=n.trim().toLowerCase(),s=t=>(i===`all`||t.group===i)&&(!o||[t.term[e],t.text[e],t.values?.[e]??``,t.example?.[e]??``].some(e=>e.toLowerCase().includes(o))),c=om.map(e=>({...e,terms:sm.filter(t=>t.group===e.id&&s(t))})).filter(e=>e.terms.length);return(0,B.jsxs)(`div`,{className:`gloss`,children:[(0,B.jsx)(`p`,{className:`note`,children:t.intro}),(0,B.jsxs)(`label`,{className:`field gloss__search`,children:[(0,B.jsx)(`span`,{className:`visually-hidden`,children:t.search}),(0,B.jsx)(S,{name:`search`,size:16}),(0,B.jsx)(`input`,{className:`field__input`,type:`search`,value:n,placeholder:t.search,onChange:e=>r(e.target.value)})]}),(0,B.jsxs)(`div`,{className:`chips`,role:`group`,"aria-label":t.groups,children:[(0,B.jsx)(`button`,{type:`button`,className:`chip-btn`,"aria-pressed":i===`all`,onClick:()=>a(`all`),children:t.all}),om.map(t=>(0,B.jsx)(`button`,{type:`button`,className:`chip-btn`,"aria-pressed":i===t.id,onClick:()=>a(t.id),children:t.name[e]},t.id))]}),!c.length&&(0,B.jsx)(`p`,{className:`note`,children:t.nothing}),c.map(n=>(0,B.jsxs)(`section`,{className:`gloss__group`,"aria-label":n.name[e],children:[(0,B.jsx)(`h3`,{className:`gloss__group-title`,children:n.name[e]}),n.terms.map(n=>(0,B.jsxs)(`article`,{className:`gloss-term`,id:`term-${n.id}`,children:[(0,B.jsx)(`h4`,{className:`gloss-term__name`,children:n.term[e]}),(0,B.jsx)(`p`,{className:`gloss-term__text`,children:n.text[e]}),n.formula&&(0,B.jsxs)(`div`,{className:`gloss-formula`,role:`math`,"aria-label":t.formula,children:[(0,B.jsx)(`span`,{className:`gloss-term__label`,children:t.formula}),n.formula.map((t,n)=>(0,B.jsx)(Em,{text:typeof t==`string`?e===`en`?t.replace(/(\d),(\d)/g,`$1.$2`):t:t[e]},n)),n.symbols&&(0,B.jsx)(`p`,{className:`gloss-formula__symbols`,children:n.symbols[e]})]}),(0,B.jsxs)(`dl`,{className:`gloss-term__rows`,children:[n.values&&(0,B.jsxs)(`div`,{children:[(0,B.jsx)(`dt`,{children:t.values}),(0,B.jsx)(`dd`,{children:n.values[e]})]}),n.example&&(0,B.jsxs)(`div`,{children:[(0,B.jsx)(`dt`,{children:t.example}),(0,B.jsx)(`dd`,{children:n.example[e]})]}),n.where&&(0,B.jsxs)(`div`,{children:[(0,B.jsx)(`dt`,{children:t.where}),(0,B.jsx)(`dd`,{children:n.where[e]})]})]})]},n.id))]},n.id))]})}function Om({url:e}){let t=Rp(),[n,r]=(0,R.useState)(`idle`);return(0,B.jsxs)(B.Fragment,{children:[(0,B.jsx)(`p`,{className:`note`,children:t.share.intro}),(0,B.jsxs)(`label`,{className:`field`,children:[(0,B.jsx)(`span`,{className:`field__label`,children:t.share.link}),(0,B.jsx)(`input`,{className:`field__input`,readOnly:!0,value:e,onFocus:e=>e.currentTarget.select()})]}),(0,B.jsxs)(`button`,{type:`button`,className:`btn`,onClick:async()=>{try{await navigator.clipboard.writeText(e),r(`copied`)}catch{r(`failed`)}},children:[(0,B.jsx)(S,{name:`copy`,size:18}),t.share.copy]}),n!==`idle`&&(0,B.jsx)(`p`,{className:`note`,role:`status`,children:n===`copied`?t.share.copied:t.share.copyFailed})]})}function km({id:e,fallback:t}){let{lang:n}=f(),r=v().layerScale,[i,a]=(0,R.useState)(`loading`);if((0,R.useEffect)(()=>{let t=!1;return a(`loading`),sd(e).then(e=>!t&&a(e)),()=>{t=!0}},[e]),i===`loading`)return null;if(!i)return(0,B.jsx)(B.Fragment,{children:t});if(!i.numeric){let t=new Set,a=i.entries.filter(e=>e.label&&!t.has(e.label)&&t.add(e.label));return(0,B.jsxs)(`div`,{className:`cm-legend`,children:[(0,B.jsx)(`ul`,{className:`cm-legend__classes`,children:a.map(t=>(0,B.jsxs)(`li`,{children:[(0,B.jsx)(`i`,{style:{background:`rgb(${t.r},${t.g},${t.b})`}}),ud(e,t,n)]},t.label))}),(0,B.jsx)(`p`,{className:`note`,children:r.hover})]})}let o=i.entries.length,s=Array.from({length:24},(e,t)=>i.entries[Math.round(t/23*(o-1))]),c=[0,.5,1].map(e=>i.entries[Math.round(e*(o-1))]);return(0,B.jsxs)(`div`,{className:`cm-legend`,children:[(0,B.jsx)(`span`,{className:`cm-legend__bar`,style:{background:`linear-gradient(90deg, ${s.map(e=>`rgb(${e.r},${e.g},${e.b})`).join(`, `)})`},"aria-hidden":`true`}),(0,B.jsx)(`span`,{className:`cm-legend__ticks`,children:c.map((t,r)=>(0,B.jsx)(`span`,{children:ud(e,t,n).replace(/^≈ /,``)},r))}),(0,B.jsxs)(`p`,{className:`note`,children:[r.lowHigh,` `,r.hover]})]})}var Am=e=>`#${e.toString(16).padStart(6,`0`)}`;function jm({checked:e,onChange:t,label:n,note:r,disabled:i}){return(0,B.jsxs)(`label`,{className:`switch`,children:[(0,B.jsx)(`input`,{type:`checkbox`,checked:e,disabled:i,onChange:e=>t(e.target.checked)}),(0,B.jsx)(`span`,{className:`switch__track`,"aria-hidden":`true`}),(0,B.jsxs)(`span`,{className:`switch__text`,children:[n,r&&(0,B.jsx)(`span`,{className:`switch__note`,children:r})]})]})}function Mm(e,t,n=!1){return new Intl.DateTimeFormat(t===`uk`?`uk-UA`:`en-GB`,{day:`numeric`,month:`short`,year:`numeric`,...n?{hour:`2-digit`,minute:`2-digit`}:{}}).format(new Date(e))}function Nm({values:e,active:t,label:n}){let r=Math.max(1,...e);return(0,B.jsx)(`svg`,{className:`bars`,viewBox:`0 0 ${e.length*10} 40`,preserveAspectRatio:`none`,role:`img`,"aria-label":n,children:e.map((e,n)=>{let i=Math.max(1,e/r*38);return(0,B.jsx)(`rect`,{x:n*10+1.5,y:40-i,width:7,height:i,rx:2,className:t!==void 0&&n<=t?`bars__on`:void 0},n)})})}function Pm(e){let{lang:t}=f(),n=v(),r=new Intl.NumberFormat(t===`uk`?`uk-UA`:`en-GB`),a=e.manifest?.fires,o=a?.ukraine??[],s=n.fires.two,c=Mf().hotspots,l=M.fires.imagery,u=t=>{let n=new Date(Date.parse(`${e.archiveDay}T00:00:00Z`)+t*864e5).toISOString().slice(0,10);n>=l.first&&n<=l.last&&e.onArchiveDay(n)},d=e.archiveDay?(l.satellites??[]).filter(t=>e.archiveDay>=t.first):[];return(0,B.jsxs)(B.Fragment,{children:[(0,B.jsxs)(`section`,{className:`panel-sec fire-two`,children:[(0,B.jsx)(`h3`,{className:`panel-sec__title`,children:s.title}),(0,B.jsxs)(`dl`,{className:`fire-two__list`,children:[(0,B.jsxs)(`div`,{className:`fire-two__item`,children:[(0,B.jsxs)(`dt`,{children:[(0,B.jsx)(`span`,{className:`fire-key fire-key--archive`,"aria-hidden":`true`}),s.archive]}),(0,B.jsx)(`dd`,{children:s.archiveText})]}),(0,B.jsxs)(`div`,{className:`fire-two__item`,children:[(0,B.jsxs)(`dt`,{children:[(0,B.jsx)(`span`,{className:`fire-key fire-key--live`,"aria-hidden":`true`}),s.live]}),(0,B.jsx)(`dd`,{children:s.liveText})]})]}),e.archiveDay?(0,B.jsxs)(`div`,{className:`fire-day`,role:`group`,"aria-label":s.day,children:[(0,B.jsx)(`button`,{type:`button`,className:`icon-btn`,"aria-label":s.prev,disabled:e.archiveDay<=l.first,onClick:()=>u(-1),children:`‹`}),(0,B.jsxs)(`span`,{className:`fire-day__date`,children:[(0,B.jsx)(`span`,{children:s.day}),(0,B.jsx)(`strong`,{children:Mm(e.archiveDay,t)})]}),(0,B.jsx)(`button`,{type:`button`,className:`icon-btn`,"aria-label":s.next,disabled:e.archiveDay>=l.last,onClick:()=>u(1),children:`›`})]}):(0,B.jsxs)(`button`,{type:`button`,className:`chip-btn`,onClick:()=>e.onArchiveDay(l.last),children:[(0,B.jsx)(S,{name:`fire`,size:16}),s.show]}),e.archiveDay&&(0,B.jsxs)(`p`,{className:`note`,children:[s.sats(d.map(e=>e.name).join(`, `)),` `,e.archiveDay>=`2025-01-01`&&s.snpp]}),e.comparing&&(0,B.jsx)(`p`,{className:`note note--warn`,children:s.compare})]}),(0,B.jsxs)(`section`,{className:`panel-sec`,children:[(0,B.jsx)(`h3`,{className:`panel-sec__title`,children:n.fires.now}),(0,B.jsx)(jm,{checked:e.liveFires,onChange:e.onLiveFires,label:n.fires.live,note:e.comparing&&e.liveFires?n.fires.liveHidden:a?n.updated(i(e.manifest.built,t)):void 0}),!a&&e.manifestError&&(0,B.jsx)(`p`,{className:`note`,children:n.noLive}),e.liveFires&&a&&(0,B.jsxs)(`div`,{className:`live-legend`,children:[(0,B.jsx)(`span`,{className:`live-legend__ramp live-legend__ramp--fires`,"aria-hidden":`true`}),(0,B.jsx)(`span`,{className:`live-legend__ticks`,children:n.fires.legend.map(e=>(0,B.jsx)(`span`,{children:e},e))}),(0,B.jsxs)(`p`,{className:`note`,children:[e.liveCount!==null&&(0,B.jsxs)(`strong`,{children:[n.fires.count(r.format(e.liveCount)),`. `]}),n.fires.liveNote]})]}),o.length>0&&(0,B.jsxs)(`div`,{className:`mini-card`,children:[(0,B.jsxs)(`div`,{className:`mini-card__head`,children:[(0,B.jsx)(`span`,{children:n.fires.ukraine7}),(0,B.jsx)(`strong`,{children:r.format(o.reduce((e,t)=>e+t.count,0))})]}),(0,B.jsx)(Nm,{values:o.map(e=>e.count),label:o.map(e=>`${e.date}: ${e.count}`).join(`, `)}),(0,B.jsxs)(`button`,{type:`button`,className:`chip-btn`,onClick:e.onUkraine,children:[(0,B.jsx)(S,{name:`ukraine`,size:16}),n.showUkraine]})]})]}),e.hotspots&&e.hotspots.length>0&&(0,B.jsxs)(`section`,{className:`panel-sec`,children:[(0,B.jsx)(`h3`,{className:`panel-sec__title`,children:c.kicker}),(0,B.jsx)(`p`,{className:`note`,children:c.listNote}),(0,B.jsx)(`div`,{className:`hotspot-list`,children:e.hotspots.map(({h:n,name:i})=>{let a=Zd(n);return(0,B.jsxs)(`button`,{type:`button`,className:`hotspot`,onClick:()=>e.onHotspot(n,i),children:[(0,B.jsx)(`span`,{className:`hotspot__name`,children:i}),(0,B.jsxs)(`span`,{className:`hotspot__meta`,children:[c.count(r.format(n.lastDay)),a!==null&&(0,B.jsxs)(`b`,{className:a>0?`hotspot__up`:`hotspot__down`,children:[` `,a>0?`▲`:`▼`,` `,Math.abs(a),`%`]}),` · `,r.format(n.power),` `,t===`uk`?`МВт`:`MW`]})]},n.id)})})]}),(0,B.jsxs)(`section`,{className:`panel-sec`,children:[(0,B.jsx)(`h3`,{className:`panel-sec__title`,children:n.fires.stories}),(0,B.jsx)(`p`,{className:`note`,children:n.fires.storiesNote}),!e.stories&&(0,B.jsx)(`p`,{className:`note`,children:n.loading}),(0,B.jsx)(`div`,{className:`story-list`,children:[...e.stories??[]].sort((e,t)=>t.start.localeCompare(e.start)).map(i=>(0,B.jsxs)(`button`,{type:`button`,className:`story-card`,"aria-pressed":e.storyId===i.id,onClick:()=>e.onStory(i),children:[(0,B.jsx)(`span`,{className:`story-card__title`,children:i.title[t]}),(0,B.jsx)(Nm,{values:i.perDay,label:i.title[t]}),(0,B.jsxs)(`span`,{className:`story-card__meta`,children:[n.fires.days(i.days),` · `,n.fires.points(r.format(i.count))]})]},i.id))}),(0,B.jsxs)(`a`,{className:`text-link`,href:`https://firms.modaps.eosdis.nasa.gov/map/`,target:`_blank`,rel:`noreferrer`,children:[n.fires.firmsMap,` ↗`]})]})]})}function Fm({story:e,onTime:t,onClose:n,onSmoke:r}){let i=Mf(),{lang:a}=f(),o=v(),s=(e.days-1)*24+23,c=kf(s,24*Math.max(1,e.days/24),t,{autoplay:!0}),l=Math.min(e.days-1,Math.floor(c.hours/24)),u=Date.parse(`${e.start}T00:00:00Z`),d=a===`uk`?`uk-UA`:`en-GB`,p=e=>new Intl.DateTimeFormat(d,{day:`numeric`,month:`short`,year:`numeric`}).format(new Date(u+e*36e5)),m=e=>new Intl.DateTimeFormat(d,{day:`numeric`,month:`short`}).format(new Date(u+e*36e5)),h=new Set,g=[];for(let t=0;t<e.days;t++){let e=new Date(u+t*864e5),n=e.getUTCFullYear()*12+e.getUTCMonth();e.getUTCDate()===1&&!h.has(n)&&(h.add(n),g.push(t*24))}return g.length<2&&g.splice(0,g.length,0,(e.days-1)*24),(0,B.jsxs)(`section`,{className:`story-player`,"aria-label":e.title[a],children:[(0,B.jsxs)(`header`,{className:`story-player__head`,children:[(0,B.jsxs)(`div`,{children:[(0,B.jsx)(`h2`,{className:`story-player__title`,children:e.title[a]}),(0,B.jsx)(`p`,{className:`story-player__text`,children:e.text[a]})]}),(0,B.jsx)(`button`,{type:`button`,className:`icon-btn icon-btn--bare`,"aria-label":o.close,onClick:n,children:(0,B.jsx)(S,{name:`close`,size:18})})]}),r&&(0,B.jsxs)(`button`,{type:`button`,className:`smoke-open`,onClick:r,children:[(0,B.jsxs)(`strong`,{children:[(0,B.jsx)(S,{name:`wind`,size:16}),i.open]}),(0,B.jsx)(`span`,{children:i.openNote})]}),(0,B.jsx)(`div`,{className:`story-player__bars`,children:(0,B.jsx)(Nm,{values:e.perDay,active:l,label:o.fires.perDay(e.perDay[l]??0)})}),(0,B.jsx)(rp,{className:`story-player`,clock:c,length:s,format:p,formatTick:m,majors:g,sub:o.fires.day(l+1,e.days),labels:{play:o.play,pause:o.pause,speed:o.fires.speed}}),(0,B.jsxs)(`div`,{className:`story-player__legend`,"aria-hidden":`true`,children:[o.fires.legendStory.map((e,t)=>(0,B.jsx)(`span`,{className:`story-key story-key--${t}`,children:e},e)),(0,B.jsx)(`span`,{className:`story-player__src`,children:`NASA FIRMS · VIIRS 375 m`})]})]})}function Im(e){let{lang:t}=f(),n=v(),r=n.ukraine,i=(e.stations??[]).filter(e=>Date.now()-Date.parse(e.time)<108e5),a=i.length?[...i].map(e=>e.aqi).sort((e,t)=>e-t)[Math.floor(i.length/2)]:null,c=e.manifest?.fires?.ukraine.reduce((e,t)=>e+t.count,0)??null,l=e.versions?.[e.versions.length-1],u=e.versions?.[e.versionIndex];return(0,B.jsxs)(B.Fragment,{children:[(0,B.jsx)(`p`,{className:`note`,children:r.intro}),(0,B.jsxs)(`div`,{className:`tiles tiles--live`,children:[(0,B.jsxs)(`section`,{className:`tile`,children:[(0,B.jsx)(`h4`,{className:`tile__label`,children:r.aqiTile}),(0,B.jsx)(`p`,{className:`tile__value`,children:a===null?`—`:(0,B.jsxs)(B.Fragment,{children:[(0,B.jsx)(`span`,{className:`aqi-dot`,style:{background:Am(o[s(a)])}}),a]})}),(0,B.jsx)(`p`,{className:`tile__note`,children:i.length?r.aqiStations(i.length):e.stationsError?n.error:n.loading})]}),(0,B.jsxs)(`section`,{className:`tile`,children:[(0,B.jsx)(`h4`,{className:`tile__label`,children:r.firesTile}),(0,B.jsx)(`p`,{className:`tile__value`,children:c??`—`}),(0,B.jsx)(`p`,{className:`tile__note`,children:`NASA FIRMS`})]}),(0,B.jsxs)(`section`,{className:`tile`,children:[(0,B.jsx)(`h4`,{className:`tile__label`,children:r.frontTile}),(0,B.jsx)(`p`,{className:`tile__value tile__value--small`,children:l?Mm(l.date,t):`—`}),(0,B.jsx)(`p`,{className:`tile__note`,children:`DeepState`})]})]}),(0,B.jsxs)(`div`,{className:`panel-row`,children:[(0,B.jsxs)(`button`,{type:`button`,className:`chip-btn`,onClick:e.onUkraine,children:[(0,B.jsx)(S,{name:`ukraine`,size:16}),n.showUkraine]}),(0,B.jsxs)(E,{className:`chip-btn`,to:`/war`,children:[(0,B.jsx)(S,{name:`front`,size:16}),n.war.panel]})]}),(0,B.jsxs)(`section`,{className:`panel-sec`,children:[(0,B.jsx)(jm,{checked:e.aqi,onChange:e.onAqi,label:r.aqi}),e.aqi&&(0,B.jsxs)(`div`,{className:`sub`,children:[(0,B.jsx)(`ul`,{className:`aqi-keys`,children:r.aqiBands.map((e,t)=>(0,B.jsxs)(`li`,{children:[(0,B.jsx)(`span`,{className:`aqi-dot`,style:{background:Am(o[t])}}),e]},e))}),(0,B.jsx)(`p`,{className:`note`,children:r.aqiNote}),(0,B.jsx)(`a`,{className:`text-link`,href:`https://www.saveecobot.com/maps`,target:`_blank`,rel:`noreferrer`,children:`SaveEcoBot ↗`})]})]}),(0,B.jsxs)(`section`,{className:`panel-sec`,children:[(0,B.jsx)(jm,{checked:e.radiation,onChange:e.onRadiation,label:r.radiation}),e.radiation&&(0,B.jsxs)(`div`,{className:`sub`,children:[(0,B.jsx)(Lm,{}),(0,B.jsx)(`p`,{className:`note`,children:r.radiationNote}),(0,B.jsx)(`a`,{className:`text-link`,href:`https://www.saveecobot.com/radiation-maps`,target:`_blank`,rel:`noreferrer`,children:`SaveEcoBot ↗`})]})]}),(0,B.jsxs)(`section`,{className:`panel-sec`,children:[(0,B.jsx)(jm,{checked:e.front,onChange:e.onFront,label:r.front,note:l?`${r.frontLatest}: ${Mm(l.date,t,!0)}`:void 0}),(0,B.jsxs)(`button`,{type:`button`,className:`occ-open`,onClick:e.onOccupation,children:[(0,B.jsxs)(`strong`,{children:[(0,B.jsx)(S,{name:`play`,size:16}),n.occupation.open]}),(0,B.jsx)(`span`,{children:n.occupation.openNote})]}),e.front&&(0,B.jsxs)(`div`,{className:`sub`,children:[(0,B.jsx)(`ul`,{className:`front-keys`,children:[`occupied`,`liberated`,`unknown`].map(e=>(0,B.jsxs)(`li`,{children:[(0,B.jsx)(`span`,{className:`front-key front-key--${e}`}),r.frontKeys[e]]},e))}),u&&(0,B.jsx)(`p`,{className:`note front-note`,children:u.text[t]||u.text.uk}),e.frontStatus===`loading`&&(0,B.jsx)(`p`,{className:`note`,children:n.loading}),e.frontStatus===`error`&&(0,B.jsx)(`p`,{className:`note`,children:n.error}),(0,B.jsx)(`p`,{className:`note`,children:r.frontNote}),(0,B.jsx)(`a`,{className:`text-link`,href:`https://deepstatemap.live`,target:`_blank`,rel:`noreferrer`,children:`DeepState ↗`})]})]}),(0,B.jsxs)(`section`,{className:`panel-sec`,children:[(0,B.jsx)(jm,{checked:e.war,onChange:e.onWar,label:r.war}),e.war&&(0,B.jsx)(bm,{data:e.warData,status:e.warStatus})]}),(0,B.jsx)(`section`,{className:`panel-sec`,children:(0,B.jsx)(jm,{checked:e.liveFires,onChange:e.onLiveFires,label:r.fires})}),(0,B.jsxs)(`section`,{className:`panel-sec panel-sec--feature`,children:[(0,B.jsxs)(`h3`,{className:`panel-sec__title`,children:[(0,B.jsx)(S,{name:`bulb`,size:18}),r.blackout]}),(0,B.jsxs)(`div`,{className:`blackout-preview`,"aria-hidden":`true`,children:[(0,B.jsx)(`img`,{src:`https://gibs.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi?SERVICE=WMS&REQUEST=GetMap&VERSION=1.3.0&LAYERS=VIIRS_SNPP_DayNightBand&STYLES=&CRS=EPSG:4326&BBOX=44,22,53,41&WIDTH=380&HEIGHT=180&FORMAT=image/png&TIME=2021-10-03`,alt:``,loading:`lazy`}),(0,B.jsx)(`img`,{src:`https://gibs.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi?SERVICE=WMS&REQUEST=GetMap&VERSION=1.3.0&LAYERS=VIIRS_SNPP_DayNightBand&STYLES=&CRS=EPSG:4326&BBOX=44,22,53,41&WIDTH=380&HEIGHT=180&FORMAT=image/png&TIME=2022-11-25`,alt:``,loading:`lazy`})]}),(0,B.jsx)(`p`,{className:`note`,children:r.blackoutNote}),(0,B.jsx)(`button`,{type:`button`,className:e.blackout?`btn btn--quiet`:`btn`,onClick:()=>e.onBlackout(!e.blackout),children:e.blackout?r.blackoutOff:r.blackoutOn})]})]})}function Lm(){let e=v().ukraine;return(0,B.jsxs)(`div`,{className:`rad-legend`,children:[(0,B.jsx)(`p`,{className:`rad-legend__unit`,children:e.radiationUnit}),(0,B.jsx)(`ul`,{className:`rad-legend__bands`,children:e.radiationBands.map((e,t)=>(0,B.jsxs)(`li`,{children:[(0,B.jsx)(`i`,{style:{background:Am(x[t])}}),e]},e))})]})}function Rm({wind:e,field:t,manifest:n,frameTime:r,onWind:i,onField:a}){let{lang:o}=f(),s=v().weatherGlobe,c=v(),l=n?.weather,u=t===`none`?null:t;return(0,B.jsxs)(`section`,{className:`panel-sec`,children:[(0,B.jsx)(`h3`,{className:`panel-sec__title`,children:s.title}),(0,B.jsx)(jm,{checked:e,onChange:i,label:s.wind,note:l?s.run(Mm(l.run.replace(/T(\d\d)Z$/,`T$1:00:00Z`),o,!0)):void 0,disabled:!l}),(0,B.jsx)(`div`,{className:`seg seg--wrap`,role:`group`,"aria-label":s.field,children:[`none`,`wind`,`temp`,`precip`,`cloud`].map(e=>(0,B.jsx)(`button`,{type:`button`,className:`seg__btn`,"aria-pressed":t===e,disabled:!l&&e!==`none`,onClick:()=>a(e),children:s.fields[e]},e))}),u&&(0,B.jsx)(zm,{kind:u}),r&&(e||u)&&(0,B.jsx)(`p`,{className:`note`,children:s.at(Mm(r,o,!0))}),!l&&(0,B.jsx)(`p`,{className:`note`,children:c.noLive}),(0,B.jsxs)(E,{className:`btn btn--quiet`,to:`/map?mode=weather`,children:[(0,B.jsx)(S,{name:`map`,size:18}),s.open2d]})]})}function zm({kind:e}){let t=c[e],n=t.stops,r=n[0][0],i=n[n.length-1][0],a=n.map(([e,t])=>`rgba(${t[0]},${t[1]},${t[2]},${Math.max(.35,t[3]/255)}) ${((e-r)/(i-r)*100).toFixed(1)}%`).join(`, `),o=[n[0],n[Math.floor(n.length/3)],n[Math.floor(2*n.length/3)],n[n.length-1]];return(0,B.jsxs)(`div`,{className:`live-legend`,children:[(0,B.jsx)(`span`,{className:`live-legend__ramp`,style:{background:`linear-gradient(90deg, ${a})`},"aria-hidden":`true`}),(0,B.jsxs)(`span`,{className:`live-legend__ticks`,children:[o.map(([e])=>(0,B.jsx)(`span`,{children:e},e)),(0,B.jsx)(`span`,{className:`live-legend__unit`,children:t.unit})]})]})}var Bm=(e,t)=>`https://gibs.earthdata.nasa.gov/wmts/epsg4326/best/${e}/default/default/500m/2/0/2.${t}`;function Vm({relief:e,light:t,lightOverridden:n=!1,borders:r,onRelief:i,onLight:a,onBorders:o}){let s=v().style,[c,l]=(0,R.useState)(!1),u=(0,R.useRef)(null);return(0,R.useEffect)(()=>{if(!c)return;let e=e=>{u.current?.contains(e.target)||l(!1)},t=e=>e.key===`Escape`&&l(!1);return window.addEventListener(`pointerdown`,e),window.addEventListener(`keydown`,t),()=>{window.removeEventListener(`pointerdown`,e),window.removeEventListener(`keydown`,t)}},[c]),(0,B.jsxs)(`div`,{ref:u,className:`map-style`,children:[c&&(0,B.jsxs)(`section`,{className:`map-style__pop`,"aria-label":s.title,children:[(0,B.jsx)(`h2`,{className:`map-style__title`,children:s.title}),(0,B.jsx)(`div`,{className:`map-style__cards`,children:[{on:!e,label:s.satellite,img:Bm(`BlueMarble_NextGeneration`,`jpeg`),set:()=>i(!1)},{on:e,label:s.relief,img:Bm(`BlueMarble_ShadedRelief_Bathymetry`,`jpeg`),set:()=>i(!0)}].map(e=>(0,B.jsxs)(`button`,{type:`button`,className:`style-card`,"aria-pressed":e.on,onClick:e.set,children:[(0,B.jsx)(`img`,{src:e.img,alt:``,loading:`lazy`}),(0,B.jsx)(`span`,{children:e.label})]},e.label))}),e&&(0,B.jsx)(`p`,{className:`note`,children:s.reliefNote}),(0,B.jsx)(`p`,{className:`field__label`,children:s.lighting}),(0,B.jsx)(`div`,{className:`seg`,role:`group`,"aria-label":s.lighting,children:[`flat`,`sun`,`night`].map(e=>(0,B.jsx)(`button`,{type:`button`,className:`seg__btn`,"aria-pressed":t===e,onClick:()=>a(e),children:s.lights[e]},e))}),(0,B.jsx)(`p`,{className:`note`,children:n?s.lightsOverridden:s.lightsNote[t]}),(0,B.jsx)(jm,{checked:r,onChange:o,label:s.borders})]}),(0,B.jsxs)(`button`,{type:`button`,className:`map-style__btn`,"aria-expanded":c,"aria-label":s.open,onClick:()=>l(!c),children:[(0,B.jsx)(`img`,{src:e?Bm(`BlueMarble_ShadedRelief_Bathymetry`,`jpeg`):t===`flat`?Bm(`BlueMarble_NextGeneration`,`jpeg`):Bm(`VIIRS_Black_Marble`,`png`),alt:``}),(0,B.jsx)(`span`,{children:s.open})]})]})}function Hm({onZoom:e,onHome:t}){let n=v().controls;return(0,B.jsxs)(`div`,{className:`map-controls`,role:`group`,children:[(0,B.jsx)(`button`,{type:`button`,className:`map-controls__btn`,"aria-label":n.home,title:n.home,onClick:t,children:(0,B.jsx)(S,{name:`globe`,size:20})}),(0,B.jsxs)(`div`,{className:`map-controls__zoom`,children:[(0,B.jsx)(`button`,{type:`button`,className:`map-controls__btn`,"aria-label":n.zoomIn,title:n.zoomIn,onClick:()=>e(.55),children:(0,B.jsx)(S,{name:`plus`,size:20})}),(0,B.jsx)(`button`,{type:`button`,className:`map-controls__btn`,"aria-label":n.zoomOut,title:n.zoomOut,onClick:()=>e(1.8),children:(0,B.jsx)(S,{name:`minus`,size:20})})]})]})}var Um=Symbol(`Comlink.proxy`),Wm=Symbol(`Comlink.endpoint`),Gm=Symbol(`Comlink.releaseProxy`),Km=Symbol(`Comlink.finalizer`),qm=Symbol(`Comlink.thrown`),Jm=e=>typeof e==`object`&&!!e||typeof e==`function`,Ym=new Map([[`proxy`,{canHandle:e=>Jm(e)&&e[Um],serialize(e){let{port1:t,port2:n}=new MessageChannel;return Zm(e,t),[n,[n]]},deserialize(e){return e.start(),eh(e)}}],[`throw`,{canHandle:e=>Jm(e)&&qm in e,serialize({value:e}){let t;return t=e instanceof Error?{isError:!0,value:{message:e.message,name:e.name,stack:e.stack}}:{isError:!1,value:e},[t,[]]},deserialize(e){throw e.isError?Object.assign(Error(e.value.message),e.value):e.value}}]]);function Xm(e,t){for(let n of e)if(t===n||n===`*`||n instanceof RegExp&&n.test(t))return!0;return!1}function Zm(e,t=globalThis,n=[`*`]){t.addEventListener(`message`,function r(i){if(!i||!i.data)return;if(!Xm(n,i.origin)){console.warn(`Invalid origin '${i.origin}' for comlink proxy`);return}let{id:a,type:o,path:s}=Object.assign({path:[]},i.data),c=(i.data.argumentList||[]).map(mh),l;try{let t=s.slice(0,-1).reduce((e,t)=>e[t],e),n=s.reduce((e,t)=>e[t],e);switch(o){case`GET`:l=n;break;case`SET`:t[s.slice(-1)[0]]=mh(i.data.value),l=!0;break;case`APPLY`:l=n.apply(t,c);break;case`CONSTRUCT`:l=fh(new n(...c));break;case`ENDPOINT`:{let{port1:t,port2:n}=new MessageChannel;Zm(e,n),l=dh(t,[t])}break;case`RELEASE`:l=void 0;break;default:return}}catch(e){l={value:e,[qm]:0}}Promise.resolve(l).catch(e=>({value:e,[qm]:0})).then(n=>{let[i,s]=ph(n);t.postMessage(Object.assign(Object.assign({},i),{id:a}),s),o===`RELEASE`&&(t.removeEventListener(`message`,r),$m(t),Km in e&&typeof e[Km]==`function`&&e[Km]())}).catch(e=>{let[n,r]=ph({value:TypeError(`Unserializable return value`),[qm]:0});t.postMessage(Object.assign(Object.assign({},n),{id:a}),r)})}),t.start&&t.start()}function Qm(e){return e.constructor.name===`MessagePort`}function $m(e){Qm(e)&&e.close()}function eh(e,t){let n=new Map;return e.addEventListener(`message`,function(e){let{data:t}=e;if(!t||!t.id)return;let r=n.get(t.id);if(r)try{r(t)}finally{n.delete(t.id)}}),sh(e,n,[],t)}function th(e){if(e)throw Error(`Proxy has been released and is not useable`)}function nh(e){return hh(e,new Map,{type:`RELEASE`}).then(()=>{$m(e)})}var rh=new WeakMap,ih=`FinalizationRegistry`in globalThis&&new FinalizationRegistry(e=>{let t=(rh.get(e)||0)-1;rh.set(e,t),t===0&&nh(e)});function ah(e,t){let n=(rh.get(t)||0)+1;rh.set(t,n),ih&&ih.register(e,t,e)}function oh(e){ih&&ih.unregister(e)}function sh(e,t,n=[],r=function(){}){let i=!1,a=new Proxy(r,{get(r,o){if(th(i),o===Gm)return()=>{oh(a),nh(e),t.clear(),i=!0};if(o===`then`){if(n.length===0)return{then:()=>a};let r=hh(e,t,{type:`GET`,path:n.map(e=>e.toString())}).then(mh);return r.then.bind(r)}return sh(e,t,[...n,o])},set(r,a,o){th(i);let[s,c]=ph(o);return hh(e,t,{type:`SET`,path:[...n,a].map(e=>e.toString()),value:s},c).then(mh)},apply(r,a,o){th(i);let s=n[n.length-1];if(s===Wm)return hh(e,t,{type:`ENDPOINT`}).then(mh);if(s===`bind`)return sh(e,t,n.slice(0,-1));let[c,l]=lh(o);return hh(e,t,{type:`APPLY`,path:n.map(e=>e.toString()),argumentList:c},l).then(mh)},construct(r,a){th(i);let[o,s]=lh(a);return hh(e,t,{type:`CONSTRUCT`,path:n.map(e=>e.toString()),argumentList:o},s).then(mh)}});return ah(a,e),a}function ch(e){return Array.prototype.concat.apply([],e)}function lh(e){let t=e.map(ph);return[t.map(e=>e[0]),ch(t.map(e=>e[1]))]}var uh=new WeakMap;function dh(e,t){return uh.set(e,t),e}function fh(e){return Object.assign(e,{[Um]:!0})}function ph(e){for(let[t,n]of Ym)if(n.canHandle(e)){let[r,i]=n.serialize(e);return[{type:`HANDLER`,name:t,value:r},i]}return[{type:`RAW`,value:e},uh.get(e)||[]]}function mh(e){switch(e.type){case`HANDLER`:return Ym.get(e.name).deserialize(e.value);case`RAW`:return e.value}}function hh(e,t,n,r){return new Promise(i=>{let a=gh();t.set(a,i),e.start&&e.start(),e.postMessage(Object.assign({id:a},n),r)})}function gh(){return[,,,,].fill(0).map(()=>Math.floor(Math.random()*(2**53-1)).toString(16)).join(`-`)}var _h;function vh(){return _h===void 0&&(_h=typeof Worker<`u`&&typeof OffscreenCanvas<`u`?eh(new Worker(new URL(`/Earth-System-Detective-/assets/field.worker-CvNxqiv8.js`,``+import.meta.url),{type:`module`})):null),_h}async function yh(e,t,n){let r=vh();if(r)try{return await r.paint({bytes:e.bytes.slice(),time:e.time.toISOString(),grid:e.grid,vars:e.vars},t,n)}catch{_h=null}return l(e,t,n)}var bh={w:21.5,s:44,e:41,n:53},xh=null;function Sh(){return xh||(xh=fetch(`/Earth-System-Detective-/data/ukraine/war.json`).then(e=>{if(!e.ok)throw Error(`war.json ${e.status}`);return e.json()}),xh.catch(()=>{xh=null})),xh}function Ch(e,t){return getComputedStyle(document.documentElement).getPropertyValue(e).trim()||t}function wh(e,t=bh,n=4096){let{w:r,s:i,e:a,n:o}=t,s=Math.cos((i+o)/2*Math.PI/180),c=n,l=Math.round(c*(o-i)/((a-r)*s));l>4096&&(c=Math.round(c*4096/l),l=4096);let u=document.createElement(`canvas`);u.width=c,u.height=l;let d=u.getContext(`2d`),f=Ch(`--color-occupied`,`#e0533f`),p=Ch(`--color-combat`,`#f39a3e`),m=(e,t)=>{e.beginPath();for(let n of t){for(let t=0;t<n.length;t+=2){let s=(n[t]-r)/(a-r)*c,u=(o-n[t+1])/(o-i)*l;t===0?e.moveTo(s,u):e.lineTo(s,u)}e.closePath()}},h=document.createElement(`canvas`);h.width=h.height=16;let g=h.getContext(`2d`);g.strokeStyle=f,g.lineWidth=3,g.beginPath(),g.moveTo(-4,20),g.lineTo(20,-4),g.moveTo(-4,4),g.lineTo(4,-4),g.moveTo(12,20),g.lineTo(20,12),g.stroke();let _=d.createPattern(h,`repeat`),v=document.createElement(`canvas`);v.width=c,v.height=l;let y=v.getContext(`2d`),b=(e,t,n)=>{y.clearRect(0,0,c,l),y.fillStyle=t;for(let t of e)m(y,t),y.fill(`evenodd`);d.globalAlpha=n,d.drawImage(v,0,0)};b(e.combat,p,.42),b(e.partly,_,.75),b(e.occupied,f,.55),d.globalAlpha=.9,d.lineJoin=`round`,d.lineWidth=1.2,d.strokeStyle=f;for(let t of[...e.occupied,...e.partly])m(d,t),d.stroke();d.strokeStyle=p;for(let t of e.combat)m(d,t),d.stroke();return d.globalAlpha=1,u}function Th(e,t,n){let r=!1;for(let i of e)for(let e=0,a=i.length-2;e<i.length;a=e,e+=2){let o=i[e],s=i[e+1],c=i[a],l=i[a+1];s>t!=l>t&&n<(c-o)*(t-s)/(l-s+1e-12)+o&&(r=!r)}return r}function Eh(e,t,n){for(let r of[`occupied`,`partly`,`combat`])if(e[r].some(e=>Th(e,t,n)))return r;return null}export{ff as $,$i as $t,Mp as A,ko as At,lp as B,ds as Bt,Zp as C,me as Cn,ju as Ct,Rp as D,ai as Dt,Up as E,le as En,wu as Et,vp as F,ha as Ft,Bf as G,fa as Gt,Rf as H,we as Ht,gp as I,Ei as It,Jf as J,Ki as Jt,If as K,Fr as Kt,fp as L,Fo as Lt,Pp as M,De as Mt,kp as N,Z as Nt,jp as O,Ci as Ot,Dp as P,fs as Pt,Df as Q,Ye as Qt,pp as R,Qo as Rt,tm as S,he as Sn,Iu as St,Kp as T,ge as Tn,$ as Tt,Lf as U,zn as Ut,np as V,U as Vt,Pf as W,cr as Wt,Of as X,Ca as Xt,Mf as Y,Oa as Yt,xf as Z,Bn as Zt,Dm as _,Se as _n,Mu as _t,yh as a,Ai as an,Bd as at,lm as b,_e as bn,$u as bt,Hm as c,Te as cn,kd as ct,Fm as d,Ga as dn,ud as dt,es as en,uf as et,jm as f,q as fn,dd as ft,gm as g,H as gn,Nu as gt,Cm as h,Ra as hn,Qu as ht,Eh as i,Ja as in,nf as it,Ap as j,ja as jt,Np as k,Ri as kt,Vm as l,nr as ln,fd as lt,Rm as m,rr as mn,cd as mt,wh as n,qt as nn,hf as nt,zm as o,La as on,Fd as ot,Im as p,J as pn,sd as pt,Ff as q,No as qt,Sh as r,Wr as rn,Xd as rt,Pm as s,rs as sn,Nd as st,bh as t,Ee as tn,lf as tt,Lm as u,To as un,Ed as ut,_m as v,be as vn,Pu as vt,Jp as w,de as wn,_s as wt,im as x,ve as xn,ed as xt,Om as y,xe as yn,Fu as yt,up as z,Hi as zt};