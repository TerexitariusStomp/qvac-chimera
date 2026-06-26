import{b as u,j as a,k as A,a as N,g as k,r,cd as O,aQ as E,cU as b,cV as w,ax as z,aX as I,c$ as $,d0 as q}from"./index-f3d2c4df.js";import{h as P}from"./CopyToClipboard-DSTf_eKU-83a11909.js";import{a as F}from"./Layouts-BlFm53ED-18e6eb5f.js";import{a as V,i as H}from"./JsonTree-aPaJmPx7-8a2052a5.js";import{n as J}from"./ScreenLayout-Ce16-u0i-9f2d120d.js";import{c as Q}from"./createLucideIcon-03b95cd0.js";import"./ModalHeader-YbJk-YIQ-4a257643.js";import"./Screen-CdOj1bUg-2fc007ee.js";import"./index-Dq_xe9dz-f4094704.js";/**
 * @license lucide-react v0.554.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const K=[["path",{d:"M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7",key:"1m0v6g"}],["path",{d:"M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z",key:"ohrbg2"}]],W=Q("square-pen",K),X=u.img`
  && {
    height: ${e=>e.size==="sm"?"65px":"140px"};
    width: ${e=>e.size==="sm"?"65px":"140px"};
    border-radius: 16px;
    margin-bottom: 12px;
  }
`;let B=e=>{if(!I(e))return e;try{let s=$(e);return s.includes("�")?e:s}catch{return e}},G=e=>{try{let s=q.decode(e),n=new TextDecoder().decode(s);return n.includes("�")?e:n}catch{return e}},Y=e=>{let{types:s,primaryType:n,...l}=e.typedData;return a.jsxs(a.Fragment,{children:[a.jsx(te,{data:l}),a.jsx(P,{text:(o=e.typedData,JSON.stringify(o,null,2)),itemName:"full payload to clipboard"})," "]});var o};const Z=({method:e,messageData:s,copy:n,iconUrl:l,isLoading:o,success:g,walletProxyIsLoading:m,errorMessage:x,isCancellable:d,onSign:c,onCancel:y,onClose:p})=>a.jsx(J,{title:n.title,subtitle:n.description,showClose:!0,onClose:p,icon:W,iconVariant:"subtle",helpText:x?a.jsx(ee,{children:x}):void 0,primaryCta:{label:n.buttonText,onClick:c,disabled:o||g||m,loading:o},secondaryCta:d?{label:"Not now",onClick:y,disabled:o||g||m}:void 0,watermark:!0,children:a.jsxs(F,{children:[l?a.jsx(X,{style:{alignSelf:"center"},size:"sm",src:l,alt:"app image"}):null,a.jsxs(M,{children:[e==="personal_sign"&&a.jsx(T,{children:B(s)}),e==="eth_signTypedData_v4"&&a.jsx(Y,{typedData:s}),e==="solana_signMessage"&&a.jsx(T,{children:G(s)})]})]})}),pe={component:()=>{let{authenticated:e}=A(),{initializeWalletProxy:s,closePrivyModal:n}=N(),{navigate:l,data:o,onUserCloseViaDialogOrKeybindRef:g}=k(),[m,x]=r.useState(!0),[d,c]=r.useState(""),[y,p]=r.useState(),[S,C]=r.useState(null),[_,f]=r.useState(!1);r.useEffect(()=>{e||l("LandingScreen")},[e]),r.useEffect(()=>{s(O).then(i=>{x(!1),i||(c("An error has occurred, please try again."),p(new E(new b(d,w.E32603_DEFAULT_INTERNAL_ERROR.eipCode))))})},[]);let{method:R,data:j,confirmAndSign:v,onSuccess:D,onFailure:U,uiOptions:t}=o.signMessage,L={title:(t==null?void 0:t.title)||"Sign message",description:(t==null?void 0:t.description)||"Signing this message will not cost you any fees.",buttonText:(t==null?void 0:t.buttonText)||"Sign and continue"},h=i=>{i?D(i):U(y||new E(new b("The user rejected the request.",w.E4001_USER_REJECTED_REQUEST.eipCode))),n({shouldCallAuthOnSuccess:!1}),setTimeout(()=>{C(null),c(""),p(void 0)},200)};return g.current=()=>{h(S)},a.jsx(Z,{method:R,messageData:j,copy:L,iconUrl:t!=null&&t.iconUrl&&typeof t.iconUrl=="string"?t.iconUrl:void 0,isLoading:_,success:S!==null,walletProxyIsLoading:m,errorMessage:d,isCancellable:t==null?void 0:t.isCancellable,onSign:async()=>{f(!0),c("");try{let i=await v();C(i),f(!1),setTimeout(()=>{h(i)},z)}catch(i){console.error(i),c("An error has occurred, please try again."),p(new E(new b(d,w.E32603_DEFAULT_INTERNAL_ERROR.eipCode))),f(!1)}},onCancel:()=>h(null),onClose:()=>h(S)})}};let M=u.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
`,ee=u.p`
  && {
    margin: 0;
    width: 100%;
    text-align: center;
    color: var(--privy-color-error-dark);
    font-size: 14px;
    line-height: 22px;
  }
`,te=u(V)`
  margin-top: 0;
`,T=u(H)`
  margin-top: 0;
`;export{pe as SignRequestScreen,Z as SignRequestView,pe as default};
