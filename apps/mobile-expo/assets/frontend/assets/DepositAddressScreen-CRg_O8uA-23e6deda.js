import{b1 as ue,b2 as pe,a as E,r as m,b as c,g as me,j as t,aK as Y,b3 as he,A as fe}from"./index-f3d2c4df.js";import{n as C}from"./ScreenLayout-Ce16-u0i-9f2d120d.js";import{n as K}from"./styles-DVyDvTdj-72b8e5cc.js";import{m as ge}from"./ModalHeader-YbJk-YIQ-4a257643.js";import{C as ye}from"./QrCode-BxAVhbx2-2948825a.js";import{u as be,e as ve,g as xe,h as Ce,d as we,j as Ee,k as _e,l as ke,m as Te,F as je,b as Se,o as Ne,f as Ue,s as Ae}from"./floating-ui.react-0dc6478f.js";import{m as De}from"./CopyableText-ChtfBWx4-43380712.js";import"./browser-e933942f.js";import{T as R}from"./triangle-alert-8cefeb26.js";import{c as $}from"./createLucideIcon-03b95cd0.js";import{r as Q,C as Ie}from"./chevron-down-a11390c3.js";import{C as F}from"./check-1aa327f7.js";import{H as Oe}from"./hourglass-d53a23eb.js";import{I as Re}from"./info-e363a9f8.js";import"./Screen-CdOj1bUg-2fc007ee.js";import"./index-Dq_xe9dz-f4094704.js";import"./copy-7b197e42.js";const G={path:"/api/v1/onramp/deposit_addresses/quote",method:"POST"},P={path:"/api/v1/onramp/deposit_addresses/orders/:order_id",method:"GET"},$e={path:"/api/v1/onramp/deposit_addresses/:deposit_address_id/next_order",method:"GET"},J={path:"/api/v1/onramp/deposit_addresses/deposit_config",method:"GET"};function M(e){return e.startsWith("eip155:")?"ethereum":e.startsWith("solana:")?"solana":e.startsWith("bip122:")?"bitcoin-segwit":e.startsWith("tron:")?"tron":void 0}async function Z(e){var s;let{user:r}=await e.privy.user.get();if(!r)return{ok:!1,error:"NOT_AUTHENTICATED"};let o=function(d,a){let u=M(d);if(!u)return;let i=a.linked_accounts.find(l=>l.type==="wallet"&&l.chain_type===u&&"address"in l&&l.address);return i&&"address"in i?i.address:void 0}(e.caip2,r);if(o)return{ok:!0,address:o};let n=M(e.caip2);if(!n)return{ok:!1,error:"UNSUPPORTED_CHAIN"};try{let d=await e.privy.fetchPrivyRoute(ue,{body:{chain_type:n}});return await((s=e.onWalletCreated)==null?void 0:s.call(e)),{ok:!0,address:d.address}}catch{return{ok:!1,error:"REFUND_WALLET_CREATION_FAILED"}}}async function Fe(e){let{user:r}=await e.privy.user.get();if(!r)throw Error("NOT_AUTHENTICATED");let o=e.refundAddress;if(!o){let n=await Z({privy:e.privy,caip2:e.sourceChain,onWalletCreated:e.onWalletCreated});if(!n.ok)throw Error(n.error);o=n.address}return await e.privy.fetchPrivyRoute(G,{body:{source_chain:e.sourceChain,source_currency:e.sourceCurrency,destination_chain:e.destinationChain,destination_currency:e.destinationCurrency,destination_address:e.destinationAddress,refund_address:o,...e.slippageBps!=null?{slippage_bps:e.slippageBps}:{}}})}function ee(e,r){return Math.ceil(r/e)}function re(e){return e.status==="success"?e.result?{status:"success",order:e.result}:{status:"timeout"}:e.status==="aborted"?{status:"aborted",error:e.error}:{status:"timeout",error:e.error}}async function Pe(e){return await e.privy.fetchPrivyRoute(P,{params:{order_id:e.orderId}})}async function Le(e){let r=e.pollIntervalMs??2e3,o=e.timeoutMs??18e5,n=e.signal??new AbortController().signal;return re(await Q({operation:async()=>{let s=await e.privy.fetchPrivyRoute($e,{params:{deposit_address_id:e.depositAddressId},query:{after:e.quoteCreatedAt}});if(s.order)return await e.privy.fetchPrivyRoute(P,{params:{order_id:s.order.id}})},until:s=>s!==void 0,delay:r,interval:r,attempts:ee(r,o),signal:n}))}async function Me(e){let r=e.pollIntervalMs??2e3,o=e.timeoutMs??18e5,n=e.signal??new AbortController().signal;return re(await Q({operation:()=>e.privy.fetchPrivyRoute(P,{params:{order_id:e.orderId}}),until:s=>s.status!=="executing",delay:r,interval:r,attempts:ee(r,o),signal:n}))}async function ze(e){let r=await e.fetchPrivyRoute(J,{});return{currencies:r.currencies,chains:r.chains}}var L=Object.freeze({__proto__:null,generateDepositAddress:Fe,getConfig:ze,getDeposit:Pe,resolveRefundAddress:Z,waitForCompletion:Me,waitForDeposit:Le});const _=pe(()=>null),T=e=>{_.getState()!==null&&_.setState(e)};async function We(e){let r=await e.fetchPrivyRoute(J,{});T({config:{status:"ready",data:{currencies:r.currencies,chains:r.chains}}})}function g(){let e=_(),{closePrivyModal:r,privy:o}=E(),n=(e==null?void 0:e.params)??null,s=(e==null?void 0:e.config)??{status:"loading"},d=m.useCallback(i=>{T({modalState:i})},[]),a=m.useCallback(async()=>{if(n){T({config:{status:"loading"}});try{await We(o)}catch(i){throw T({config:{status:"error",error:i instanceof Error?i:Error("Failed to load deposit config")}}),i}}},[n,o]),u=m.useCallback(()=>{if(!e)return;let{modalState:i}=e;i.step==="complete"?e.onComplete():i.step==="failed"?e.onError(Error("DEPOSIT_FAILED")):i.step==="error"?e.onError(Error(i.code)):i.step==="refunded"?e.onError(Error("DEPOSIT_REFUNDED")):e.onError(Error("USER_EXITED")),r({shouldCallAuthOnSuccess:!1})},[e,r]);return{modalState:(e==null?void 0:e.modalState)??{step:"intro"},setModalState:d,config:s,retryConfig:a,params:n,close:u}}function w(e){let{modalState:r,config:o,params:n,...s}=g();if(function(d,a){if(d.step!==a)throw Error("UNEXPECTED_STATE")}(r,e),!n||o.status!=="ready")throw Error("UNEXPECTED_STATE");return{state:r,configData:o.data,params:n,...s}}/**
 * @license lucide-react v0.554.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ve=[["path",{d:"m18 15-6-6-6 6",key:"153udz"}]],Be=$("chevron-up",Ve);/**
 * @license lucide-react v0.554.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const qe=[["rect",{width:"5",height:"5",x:"3",y:"3",rx:"1",key:"1tu5fj"}],["rect",{width:"5",height:"5",x:"16",y:"3",rx:"1",key:"1v8r4q"}],["rect",{width:"5",height:"5",x:"3",y:"16",rx:"1",key:"1x03jg"}],["path",{d:"M21 16h-3a2 2 0 0 0-2 2v3",key:"177gqh"}],["path",{d:"M21 21v.01",key:"ents32"}],["path",{d:"M12 7v3a2 2 0 0 1-2 2H7",key:"8crl2c"}],["path",{d:"M3 12h.01",key:"nlz23k"}],["path",{d:"M12 3h.01",key:"n36tog"}],["path",{d:"M12 16v.01",key:"133mhm"}],["path",{d:"M16 12h1",key:"1slzba"}],["path",{d:"M21 12v.01",key:"1lwtk9"}],["path",{d:"M12 21v-1",key:"1880an"}]],te=$("qr-code",qe);/**
 * @license lucide-react v0.554.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const He=[["path",{d:"M9 14 4 9l5-5",key:"102s5s"}],["path",{d:"M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5a5.5 5.5 0 0 1-5.5 5.5H11",key:"f3b9sd"}]],Xe=$("undo-2",He);class Ye extends m.Component{static getDerivedStateFromError(){return{hasError:!0}}componentDidCatch(r,o){this.props.onError(r)}componentDidUpdate(r){r.resetKey!==this.props.resetKey&&this.state.hasError&&this.setState({hasError:!1})}render(){return this.state.hasError?null:this.props.children}constructor(...r){super(...r),this.state={hasError:!1}}}function Ke(e,r,o){let n=Number(e);return!Number.isFinite(n)||n===0?`1 ${r} ≈ ${e} ${o}`:n>=.01?`1 ${r} ≈ ${z(n)} ${o}`:`${z(1/n)} ${r} ≈ 1 ${o}`}function z(e){return e>=1e3?new Intl.NumberFormat("en-US",{maximumFractionDigits:0}).format(Math.round(e)):e>=100?new Intl.NumberFormat("en-US",{maximumFractionDigits:1}).format(e):e>=1?new Intl.NumberFormat("en-US",{maximumFractionDigits:2}).format(e):new Intl.NumberFormat("en-US",{maximumFractionDigits:4}).format(e)}function W(e,r){let o=Number(e);if(!Number.isFinite(o)||o===0)return e;let n=r!=null?o/10**r:o;return n>=1e3?new Intl.NumberFormat("en-US",{maximumFractionDigits:2}).format(n):n>=1?new Intl.NumberFormat("en-US",{maximumFractionDigits:4}).format(n):n>=1e-4?new Intl.NumberFormat("en-US",{maximumFractionDigits:6}).format(n):new Intl.NumberFormat("en-US",{maximumSignificantDigits:4}).format(n)}function O({address:e,caip2:r,config:o}){for(let n of o.currencies){let s=n.chains.find(d=>d.caip2===r&&d.address.toLowerCase()===e.toLowerCase());if(s)return{symbol:n.symbol.toUpperCase(),decimals:s.decimals}}return{symbol:e,decimals:void 0}}function V(e,r){var o;return((o=r[e])==null?void 0:o.displayName)??e}function B(e,r){if(!e.chains[r.destinationChain])return`Unsupported destination chain: "${r.destinationChain}". Check that the chain is in CAIP-2 format (e.g. "eip155:8453") and is supported for deposit addresses.`;let o=r.destinationCurrency.toLowerCase();return e.currencies.some(n=>n.chains.some(s=>s.caip2===r.destinationChain&&s.address.toLowerCase()===o))?null:`Unsupported destination currency "${r.destinationCurrency}" on chain "${r.destinationChain}". Check that this token address is supported on the specified chain.`}let Qe=new Set(["ROUTE_UNAVAILABLE","UNEXPECTED_STATE","TIMEOUT_WAITING_FOR_NEXT_ORDER","TIMEOUT_ORDER_COMPLETION","DEPOSIT_FAILED","DEPOSIT_REFUNDED","USER_EXITED","AMOUNT_TOO_LOW","INSUFFICIENT_LIQUIDITY","UNSUPPORTED_CHAIN","UNSUPPORTED_CURRENCY","UNSUPPORTED_ROUTE","NO_SWAP_ROUTES_FOUND","NO_INTERNAL_SWAP_ROUTES_FOUND","NO_QUOTES","SANCTIONED_WALLET_ADDRESS","REFUND_WALLET_CREATION_FAILED","DEPOSIT_ADDRESSES_NOT_ENABLED","NOT_AUTHENTICATED"]);function Ge(e){return Qe.has(e)}function q(e){return Ge(e)?e:"UNKNOWN_ERROR"}function oe(){let{params:e,setModalState:r}=g(),{privy:o}=E(),n=function(){let{privy:a,refreshSessionAndUser:u}=E();return m.useCallback((i,l)=>l?Promise.resolve({ok:!0,address:l}):L.resolveRefundAddress({privy:a,caip2:i,onWalletCreated:u}),[a,u])}(),[s,d]=m.useState(!1);return{fetchQuote:m.useCallback(async(a,u,i)=>{if(e){d(!0);try{let l=await n(a.caip2,e.refundAddress);if(!l.ok)return void r({step:"error",code:q(l.error)});let p=await o.fetchPrivyRoute(G,{body:{source_chain:a.caip2,source_currency:a.currencyAddress,destination_chain:e.destinationChain,destination_currency:e.destinationCurrency,destination_address:e.destinationAddress,refund_address:l.address,...e.slippageBps!=null?{slippage_bps:e.slippageBps}:{}}});r({step:"address",selectedCurrency:u,selectedChain:a,availableChains:i,quote:p})}catch(l){let p=l instanceof Error?l:Error(String(l)),h="status"in p&&typeof p.status=="number"?p.status:void 0;r({step:"error",code:p instanceof he&&p.code==="feature_not_enabled"?"DEPOSIT_ADDRESSES_NOT_ENABLED":h&&h>=500?"UNKNOWN_ERROR":q(p.message),message:p.message})}finally{d(!1)}}},[e,o,n,r]),isFetching:s}}function ne(e,r){switch(e.status){case"completed":return r({step:"complete",order:e});case"refunded":return r({step:"refunded",order:e});case"failed":return r({step:"failed",order:e});case"executing":return r({step:"processing",order:e});default:return}}const j=c(C)`
  #privy-content-footer-container {
    margin-top: 0;
  }
`,Je=c.p`
  font-size: 0.875rem;
  font-weight: 400;
  line-height: 1.375rem;
  color: var(--privy-color-foreground-3);
  margin: 0.25rem 0 0;
`,ie=c.img`
  width: 2rem;
  height: 2rem;
  border-radius: var(--privy-border-radius-full);
  object-fit: cover;
  flex-shrink: 0;
`,se=c.img`
  width: 2rem;
  height: 2rem;
  border-radius: 4px;
  object-fit: cover;
  flex-shrink: 0;
`,ae=c.span`
  font-weight: 500;
`,Ze=c.span`
  font-size: 0.875rem;
  color: var(--privy-color-foreground-3);
  margin-left: auto;
`;c.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  min-height: 2.25rem;
  border-radius: 6.25rem;
  border: none;
  background-color: var(--privy-color-background-2);

  input {
    flex: 1;
    border: none;
    outline: none;
    box-shadow: none;
    font-size: 0.875rem;
    line-height: 1.25rem;
    background: transparent;
    color: var(--privy-color-foreground);

    &:focus {
      outline: none;
      box-shadow: none;
    }

    &::placeholder {
      color: var(--privy-color-foreground-3);
    }
  }
`;const le=c.button`
  && {
    position: relative;
    width: 100%;
    display: flex;
    gap: 0.75rem;
    align-items: center;
    padding: 0.625rem 0.75rem;
    min-height: 3.5rem;
    border: 1px solid
      ${e=>e.$selected?"var(--privy-color-icon-interactive)":"var(--privy-color-foreground-4)"};
    border-radius: var(--privy-border-radius-md);
    background-color: ${e=>e.$selected?"var(--privy-color-info-bg)":"transparent"};
    color: var(--privy-color-foreground);
    font-size: 0.875rem;
    line-height: 1.5rem;
    cursor: pointer;
    outline: none;
    box-shadow: none;
    transition:
      background-color 200ms ease,
      border-color 200ms ease;

    &:hover {
      background-color: var(--privy-color-background-2);
    }

    &:disabled {
      opacity: ${e=>e.$selected?1:.5};
      cursor: not-allowed;
    }

    &:focus,
    &:focus-visible {
      outline: none;
      box-shadow: none;
    }
  }
`,H=c.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 3rem 0;
`,er=c.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0.5rem 0;
`,S=c.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`,N=c.div`
  width: 1.5rem;
  height: 1.5rem;
  border-radius: var(--privy-border-radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background-color: ${e=>e.$status==="done"?"var(--privy-color-success-light, #DCFCE7)":"var(--privy-color-background-2)"};
`,X=c.div`
  width: 2px;
  height: 1rem;
  background-color: var(--privy-color-background-2);
  margin-left: 0.6875rem;
`,U=c.span`
  font-size: 0.875rem;
  color: var(--privy-color-foreground);
`;c.div`
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-radius: var(--privy-border-radius-md);
  background-color: var(--privy-color-background-2);
  font-size: 0.8125rem;
  line-height: 1.25rem;
  color: var(--privy-color-foreground-3);
`;const A=c.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8125rem;
  line-height: 1.25rem;
`,D=c.span`
  color: var(--privy-color-foreground);
  font-weight: 400;
`,I=c.span`
  color: var(--privy-color-foreground);
  font-weight: 500;
  text-align: right;
  max-width: 60%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`,de=c(Y)`
  && {
    margin-left: auto;
    height: 1.5rem;
    width: 1.5rem;
    border-width: 2px;
    flex-shrink: 0;
  }
`,rr=({sourceAmount:e,sourceSymbol:r,sourceChainName:o,sourceDecimals:n,destinationAmount:s,destSymbol:d,destChainName:a,destDecimals:u,onClose:i})=>t.jsx(j,{icon:F,iconVariant:"success",title:"Transfer complete",subtitle:s?`Received ${W(e,n)} ${r} on ${o} and converted it to ${W(s,u)} ${d} on ${a}. Funds are available to use.`:`Your ${r} has been received and is now available in your wallet.`,showClose:!0,onClose:i,primaryCta:{label:"Done",onClick:i},watermark:!1});function tr(){let{state:e,configData:r,close:o}=w("complete"),{order:n}=e,{sourceSymbol:s,sourceChainName:d,sourceDecimals:a,destSymbol:u,destChainName:i,destDecimals:l}=m.useMemo(()=>{let p=O({address:n.source_currency,caip2:n.source_chain,config:r}),h=O({address:n.destination_currency,caip2:n.destination_chain,config:r});return{sourceSymbol:p.symbol,sourceChainName:V(n.source_chain,r.chains),sourceDecimals:p.decimals,destSymbol:h.symbol,destChainName:V(n.destination_chain,r.chains),destDecimals:h.decimals}},[n,r]);return t.jsx(rr,{sourceAmount:n.source_amount,sourceSymbol:s,sourceChainName:d,sourceDecimals:a,destinationAmount:n.destination_amount,destSymbol:u,destChainName:i,destDecimals:l,onClose:o})}function or(){let{modalState:e,setModalState:r,config:o,retryConfig:n,close:s}=g();if(e.step!=="error")throw Error("UNEXPECTED_STATE");let{code:d}=e,{title:a,subtitle:u,detail:i,iconVariant:l}=(y=>{switch(y){case"AMOUNT_TOO_LOW":return{title:"Amount too low",subtitle:"The deposit amount is below the minimum for this route.",detail:"Try a larger amount or a different token.",iconVariant:"warning"};case"INSUFFICIENT_LIQUIDITY":return{title:"Insufficient liquidity",subtitle:"There isn't enough liquidity for this route right now.",detail:"Try a smaller amount or a different network.",iconVariant:"warning"};case"UNSUPPORTED_CHAIN":return{title:"Unsupported chain",subtitle:"Deposits from this chain type aren't supported yet. Try a different network.",iconVariant:"warning"};case"UNSUPPORTED_CURRENCY":case"UNSUPPORTED_ROUTE":case"ROUTE_UNAVAILABLE":case"NO_SWAP_ROUTES_FOUND":case"NO_INTERNAL_SWAP_ROUTES_FOUND":case"NO_QUOTES":return{title:"Route not available",subtitle:"This deposit route isn't supported right now. Try a different token or network.",iconVariant:"warning"};case"SANCTIONED_WALLET_ADDRESS":return{title:"Address restricted",subtitle:"This address cannot be used for deposits due to compliance restrictions.",iconVariant:"warning"};case"REFUND_WALLET_CREATION_FAILED":return{title:"Unable to set up refund address",subtitle:"We couldn't create a wallet to receive refunds on this chain. Please try again or select a different network.",iconVariant:"warning"};case"DEPOSIT_ADDRESSES_NOT_ENABLED":return{title:"Not enabled",subtitle:"Deposit addresses are not enabled for this app.",iconVariant:"warning"};case"NOT_AUTHENTICATED":return{title:"Not signed in",subtitle:"Please sign in to continue with your deposit.",iconVariant:"warning"};case"TIMEOUT_WAITING_FOR_NEXT_ORDER":case"TIMEOUT_ORDER_COMPLETION":return{title:"Taking longer than expected",subtitle:"Your funds are safe. The deposit is still being processed — check back later.",iconVariant:"subtle"};default:return{title:"Something went wrong",subtitle:"We couldn't complete your request. Please try again.",iconVariant:"subtle"}}})(d),[p,h]=m.useState(!1);return t.jsx(j,{icon:R,iconVariant:l,title:a,subtitle:i?`${u} ${i}`:u,showClose:!0,onClose:s,primaryCta:{label:"Try again",onClick:async()=>{if(o.status!=="ready"){h(!0);try{await n(),r({step:"token"})}catch{h(!1)}}else r({step:"token"})},loading:p},watermark:!0})}function nr(){let{state:e,close:r}=w("failed"),{order:o}=e;return t.jsx(C,{icon:R,iconVariant:"error",title:"Transfer failed",subtitle:"Something went wrong processing your transfer.",showClose:!0,onClose:r,primaryCta:{label:"Done",onClick:r},secondaryCta:{label:"Learn about manual recovery",onClick:()=>window.open("https://docs.privy.io","_blank","noopener,noreferrer")},watermark:!0,children:t.jsxs(ir,{href:o.tracking_url,target:"_blank",rel:"noopener noreferrer",children:["Reference: ",o.provider_request_id]})})}let ir=c.a`
  text-align: center;
  font-size: 0.75rem;
  opacity: 0.7;
  text-decoration: underline;
  cursor: pointer;
  color: var(--privy-color-foreground-3);
`;function sr(){let{close:e,setModalState:r,config:o,params:n}=g(),[s,d]=m.useState(!1);return m.useEffect(()=>{if(s&&n){if(o.status==="ready"){let a=B(o.data,n);r(a?{step:"error",code:"ROUTE_UNAVAILABLE",message:a}:{step:"token"})}o.status==="error"&&r({step:"error",code:"ROUTE_UNAVAILABLE"})}},[s,o,n,r]),t.jsx(j,{icon:te,iconVariant:"subtle",title:"Add funds",subtitle:"Top up your account by sending crypto from any wallet. Conversion and routing handled by Relay.",showClose:!0,onClose:e,primaryCta:{label:"Continue",onClick:()=>{if(o.status==="ready"&&n){let a=B(o.data,n);r(a?{step:"error",code:"ROUTE_UNAVAILABLE",message:a}:{step:"token"})}else o.status==="error"?r({step:"error",code:"ROUTE_UNAVAILABLE"}):d(!0)},loading:s&&o.status==="loading",loadingText:null},watermark:!0})}function ar(){let{state:e,setModalState:r,close:o}=w("network"),[n,s]=m.useState(-1),{availableChains:d}=e,{confirm:a,isFetching:u}=function(){let i=_(),{params:l}=g(),{fetchQuote:p,isFetching:h}=oe();return{confirm:m.useCallback(async y=>{if(!y||!l)return;let f=i==null?void 0:i.modalState;f&&f.step==="network"&&await p(y,f.selectedCurrency,f.availableChains)},[l,i,p]),isFetching:h}}();return t.jsx(C,{title:"Select network",eyebrow:t.jsxs("span",{style:{display:"flex",alignItems:"center",gap:"0.375rem"},children:[t.jsx("img",{src:e.selectedCurrency.logoURI,alt:"",style:{width:"1rem",height:"1rem",borderRadius:"50%"}}),"Send ",e.selectedCurrency.symbol]}),showBack:!0,onBack:()=>r({step:"token"}),showClose:!0,onClose:o,watermark:!0,children:t.jsx(K,{style:{marginTop:"1rem",height:"22rem"},$colorScheme:"light",children:d.map((i,l)=>t.jsxs(le,{$selected:n===l,disabled:u,onClick:()=>{s(l),a(i)},children:[t.jsx(se,{src:i.iconUrl,alt:i.displayName}),t.jsx(ae,{children:i.displayName}),u&&l===n&&t.jsx(de,{})]},i.caip2))})})}const lr=({trackingUrl:e,onClose:r})=>t.jsx(C,{icon:Oe,iconVariant:"subtle",title:"Transfer in progress",subtitle:"Your deposit was received and the transfer is now processing.",showClose:!0,onClose:r,secondaryCta:{label:"View on block explorer ↗",onClick:()=>window.open(e,"_blank","noopener,noreferrer")},watermark:!1,children:t.jsxs(er,{children:[t.jsxs(S,{children:[t.jsx(N,{$status:"done",children:t.jsx(F,{size:14,color:"var(--privy-color-icon-success)",strokeWidth:2})}),t.jsx(U,{children:"Deposit received"})]}),t.jsx(X,{}),t.jsxs(S,{children:[t.jsx(N,{$status:"active",children:t.jsx(dr,{})}),t.jsx(U,{children:"Bridging"})]}),t.jsx(X,{}),t.jsxs(S,{children:[t.jsx(N,{$status:"pending"}),t.jsx(U,{children:"Funds arrived"})]})]})});let dr=c.span`
  width: 0.75rem;
  height: 0.75rem;
  border: 2px solid var(--privy-color-foreground-3);
  border-bottom-color: transparent;
  border-radius: 50%;
  display: inline-block;
  animation: spin 1s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;function cr(){let{state:e,close:r}=w("processing");return function({orderId:o,enabled:n}){let{privy:s}=E(),{setModalState:d}=g();m.useEffect(()=>{let a=new AbortController;return L.waitForCompletion({privy:s,orderId:o,signal:a.signal}).then(u=>{a.signal.aborted||(u.status==="success"?ne(u.order,d):u.status==="timeout"&&d({step:"error",code:"TIMEOUT_ORDER_COMPLETION"}))}),()=>{a.abort()}},[n,o,s,d])}({orderId:e.order.id,enabled:!0}),t.jsx(lr,{trackingUrl:e.order.tracking_url,onClose:r})}function ur(){let{state:e,close:r}=w("refunded"),{order:o}=e;return t.jsx(j,{icon:Xe,iconVariant:"subtle",title:"Transfer refunded",subtitle:"Your transfer was received, but the swap couldn't be completed. A refund has been started automatically.",showClose:!0,onClose:r,primaryCta:{label:"Done",onClick:r},secondaryCta:{label:"View transaction details",onClick:()=>window.open(o.tracking_url,"_blank","noopener,noreferrer")},watermark:!0})}function pr(){let{close:e,setModalState:r,config:o}=g(),{confirm:n,currencies:s,isFetching:d}=function(){let{config:i,setModalState:l}=g(),{fetchQuote:p,isFetching:h}=oe(),y=i.status==="ready"?i.data.currencies:[];return{confirm:m.useCallback(async f=>{if(i.status!=="ready"||!f)return;let b=function(v,ce){return v.chains.map(x=>{let k=ce.chains[x.caip2];return k?{caip2:x.caip2,displayName:k.displayName,iconUrl:k.iconUrl,vmType:k.vmType,currencyAddress:x.address,currencyDecimals:x.decimals}:null}).filter(x=>x!==null)}(f,i.data);if(b.length!==1)l({step:"network",selectedCurrency:f,availableChains:b});else{let v=b[0];await p(v,f,b)}},[i,p,l]),currencies:y,isFetching:h}}(),[a,u]=m.useState(-1);return t.jsx(C,{title:"Select token",showBack:!0,onBack:()=>r({step:"intro"}),showClose:!0,onClose:e,watermark:!0,children:o.status==="error"?t.jsx(H,{children:t.jsx(Je,{children:"Failed to load tokens"})}):o.status==="loading"?t.jsx(H,{children:t.jsx(Y,{})}):t.jsx(K,{style:{marginTop:"1rem",height:"22rem"},$colorScheme:"light",children:s.map((i,l)=>t.jsxs(le,{$selected:a===l,disabled:d,onClick:()=>{u(l),n(i)},children:[t.jsx(ie,{src:i.logoURI,alt:i.symbol}),t.jsx(ae,{children:i.name}),d&&l===a?t.jsx(de,{}):t.jsx(Ze,{children:i.symbol})]},i.symbol))})})}function mr({address:e,onClick:r}){let[o,n]=m.useState(!1);return t.jsx(t.Fragment,{children:o?t.jsx(hr,{onClick:()=>n(!1),style:{marginTop:"1.5rem"},children:t.jsx(ye,{url:e,size:312,hideLogo:!0})}):t.jsxs(fr,{title:"Click to copy address",onClick:r,style:{marginTop:"1.5rem"},children:[t.jsxs(gr,{children:[t.jsx(yr,{children:"Deposit address"}),t.jsx(br,{children:e})]}),t.jsx(vr,{children:t.jsx(xr,{type:"button",onClick:s=>{s.stopPropagation(),n(!0)},children:t.jsx(te,{size:16,color:"var(--privy-color-icon-muted)"})})})]})})}let hr=c.div`
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  overflow: hidden;
`,fr=c.div`
  display: flex;
  border-radius: var(--privy-border-radius-md);
  background: var(--privy-color-background-clicked, #f1f2f9);
  padding: 1rem;
  cursor: pointer;
  gap: 0.5rem;
`,gr=c.div`
  flex: 1;
  min-width: 0;
  text-align: left;
`,yr=c.div`
  font-size: 0.75rem;
  color: var(--privy-color-icon-muted);
  line-height: 1rem;
  margin-bottom: 0.25rem;
`,br=c.div`
  word-break: break-all;
  font-size: 0.875rem;
  font-family: ui-monospace, monospace;
  font-weight: 500;
  line-height: 1.375rem;
  color: var(--privy-color-foreground);
`,vr=c.div`
  width: 1.5rem;
  flex-shrink: 0;
  display: flex;
  justify-content: center;
  padding-top: 0.25rem;
`,xr=c.button`
  && {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 1.5rem;
    height: 1.5rem;
    border: none;
    background: transparent;
    cursor: pointer;
    outline: none;
    box-shadow: none;
    border-radius: var(--privy-border-radius-xs);

    &:hover {
      background: var(--privy-color-background);
    }

    &:focus,
    &:focus-visible {
      outline: none;
      box-shadow: none;
    }
  }
`;function Cr({quote:e,selectedCurrency:r,selectedChain:o,destinationSymbol:n}){let[s,d]=m.useState(!1),a=r.symbol.toUpperCase(),u=o.displayName,i=m.useRef(null);return t.jsxs(wr,{children:[t.jsxs(Er,{onClick:m.useCallback(()=>{let l=document.getElementById("privy-modal-content");l&&(i.current&&clearTimeout(i.current),l.style.transition="none",i.current=setTimeout(()=>{l.style.transition="",i.current=null},160)),d(p=>!p)},[]),children:[t.jsxs(_r,{children:[r.logoURI&&t.jsx(ie,{src:r.logoURI,alt:a,style:{width:"2rem",height:"2rem"}}),o.iconUrl&&t.jsx(kr,{src:o.iconUrl,alt:u})]}),t.jsxs(Tr,{children:[t.jsx(jr,{children:"You send"}),t.jsxs(Sr,{children:[a," on ",u]})]}),t.jsx(Nr,{children:t.jsx(s?Be:Ie,{size:16})})]}),t.jsx(Ir,{$expanded:s,children:t.jsx(Or,{children:t.jsxs(Ur,{children:[e.indicative_rate&&t.jsxs(A,{children:[t.jsx(D,{children:"Conversion rate"}),t.jsxs(I,{style:{display:"flex",alignItems:"center",gap:"0.25rem"},children:[Ke(e.indicative_rate,a,n.toUpperCase()),t.jsx(Rr,{content:"Estimated rate based on current market conditions. Final execution price may vary depending on transfer size and routing."})]})]}),t.jsxs(A,{children:[t.jsx(D,{children:"Max slippage"}),t.jsxs(I,{children:[(e.slippage_bps/100).toFixed(1),"%"]})]}),t.jsxs(A,{children:[t.jsx(D,{children:"Refund address"}),t.jsx(I,{children:t.jsx(De,{value:e.refund_address,iconOnly:!0,iconSize:11,children:fe(e.refund_address,4,4)})})]})]})})}),t.jsxs(Ar,{children:[t.jsx(R,{size:16,color:"var(--privy-color-icon-muted)",style:{flexShrink:0}}),t.jsxs(Dr,{children:["Only send ",t.jsx("strong",{children:a})," on ",t.jsx("strong",{children:u}),". Other assets may be lost."]})]})]})}let wr=c.div`
  border-radius: var(--privy-border-radius-md);
  border: 1px solid var(--privy-color-foreground-4);
  overflow: hidden;
`,Er=c.button`
  && {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    background: transparent;
    border: none;
    cursor: pointer;
    color: var(--privy-color-foreground);
    outline: none;
    box-shadow: none;

    &:focus,
    &:focus-visible {
      outline: none;
      box-shadow: none;
    }
  }
`,_r=c.span`
  position: relative;
  width: 2rem;
  height: 2rem;
  flex-shrink: 0;
`,kr=c(se)`
  && {
    position: absolute;
    top: -0.125rem;
    right: -0.25rem;
    width: 0.75rem;
    height: 0.75rem;
    box-sizing: content-box;
    border: 1.5px solid #fff;
    background-color: #fff;
  }
`,Tr=c.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`,jr=c.span`
  font-size: 0.75rem;
  color: var(--privy-color-foreground-3);
  line-height: 1rem;
`,Sr=c.span`
  font-size: 0.875rem;
  font-weight: 500;
  line-height: 1.25rem;
`,Nr=c.span`
  margin-left: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  border-radius: var(--privy-border-radius-full);
  background-color: var(--privy-color-background-clicked, #f1f2f9);
  color: var(--privy-color-foreground-3);
`,Ur=c.div`
  display: flex;
  flex-direction: column;
  padding: 0 1rem 0.75rem;

  & > * {
    padding: 0.5rem 0;
    border-bottom: 1px solid var(--privy-color-foreground-4);
  }

  & > *:last-child {
    border-bottom: none;
  }
`,Ar=c.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0 0.75rem 0.75rem;
  padding: 0.625rem 0.75rem;
  border-radius: var(--privy-border-radius-sm);
  background: #f8f9fc;
`,Dr=c.span`
  font-size: 0.8125rem;
  line-height: 1.25rem;
  color: var(--privy-color-icon-muted);
  text-align: left;
`,Ir=c.div`
  display: grid;
  grid-template-rows: ${({$expanded:e})=>e?"1fr":"0fr"};
  transition: grid-template-rows 150ms ease-out;
`,Or=c.div`
  overflow: hidden;
`;function Rr({content:e}){let[r,o]=m.useState(!1),{refs:n,floatingStyles:s,context:d}=be({open:r,onOpenChange:o,placement:"top",whileElementsMounted:Se,middleware:[Ne(6),Ue(),Ae({padding:8})]}),a=ve(d,{move:!1,handleClose:xe()}),u=Ce(d),{getReferenceProps:i,getFloatingProps:l}=we([a,u,Ee(d),_e(d),ke(d,{role:"tooltip"})]),{isMounted:p,styles:h}=Te(d,{duration:150});return t.jsxs(t.Fragment,{children:[t.jsx("button",{ref:n.setReference,type:"button","aria-label":"More information about conversion rate",style:{display:"inline-flex",alignItems:"center",justifyContent:"center",padding:0,border:"none",background:"none",color:"var(--privy-color-icon-muted)",cursor:"pointer"},...i(),children:t.jsx(Re,{size:14})}),p&&t.jsx(je,{root:document.getElementById("privy-modal-content")??void 0,children:t.jsx($r,{ref:n.setFloating,style:{...s,...h},...l(),children:e})})]})}let $r=c.div`
  max-width: 13rem;
  padding: 0.5rem 0.625rem;
  border-radius: var(--privy-border-radius-sm, 0.375rem);
  background: var(--privy-color-foreground);
  color: var(--privy-color-background);
  font-size: 0.6875rem;
  line-height: 1rem;
  font-weight: 400;
  text-align: left;
  z-index: 10;
`;const Fr=({quote:e,selectedCurrency:r,selectedChain:o,destinationSymbol:n,onBack:s,onClose:d})=>{var h;let[a,u]=m.useState(!1),i=((h=r==null?void 0:r.symbol)==null?void 0:h.toUpperCase())??"funds",l=(o==null?void 0:o.displayName)??"",p=async()=>{a||(await navigator.clipboard.writeText(e.deposit_address),u(!0),setTimeout(()=>u(!1),2e3))};return t.jsxs(C,{title:`Send ${i}${l?` on ${l}`:""}`,subtitle:"Send funds to the address below. Conversion and routing handled by Relay.",showBack:!0,onBack:s,showClose:!0,onClose:d,watermark:!1,children:[t.jsx(Cr,{quote:e,selectedCurrency:r,selectedChain:o,destinationSymbol:n}),t.jsx(mr,{address:e.deposit_address,onClick:p}),t.jsx(ge,{style:{marginTop:"1rem",marginBottom:"0.5rem",...a?{backgroundColor:"var(--privy-color-icon-success)",borderColor:"var(--privy-color-icon-success)"}:{}},onClick:p,children:a?t.jsxs(t.Fragment,{children:["Copied ",t.jsx(F,{size:16,style:{marginLeft:"0.25rem"}})]}):"Copy address"}),t.jsx(Pr,{children:"Routing and bridging are handled by Relay. Privy does not control execution timing, liquidity, or transaction outcomes."})]})};let Pr=c.p`
  && {
    margin: 0.5rem 0 0;
    font-size: 0.6875rem;
    line-height: 1.125rem;
    color: var(--privy-color-icon-muted);
    text-align: center;
  }
`;function Lr(){let{state:e,configData:r,setModalState:o,close:n,params:s}=w("address"),{quote:d,selectedCurrency:a,selectedChain:u,availableChains:i}=e;return function({depositAddressId:l,enabled:p,quoteCreatedAt:h}){let{privy:y}=E(),{setModalState:f}=g();m.useEffect(()=>{if(!l)return;let b=new AbortController;return L.waitForDeposit({privy:y,depositAddressId:l,quoteCreatedAt:h,signal:b.signal}).then(v=>{b.signal.aborted||(v.status==="success"?ne(v.order,f):v.status==="timeout"&&f({step:"error",code:"TIMEOUT_WAITING_FOR_NEXT_ORDER"}))}),()=>{b.abort()}},[p,l,y,h,f])}({depositAddressId:d.id,enabled:!0,quoteCreatedAt:d.created_at}),t.jsx(Fr,{quote:d,selectedCurrency:a,selectedChain:u,destinationSymbol:m.useMemo(()=>O({address:s.destinationCurrency,caip2:s.destinationChain,config:r}).symbol,[s,r]),onBack:()=>o({step:"network",selectedCurrency:a,availableChains:i}),onClose:n})}function Mr(){let{modalState:e,setModalState:r}=g();return t.jsx(Ye,{onError:o=>r({step:"error",code:"UNEXPECTED_STATE",message:o.message}),resetKey:e.step,children:t.jsx(zr,{})})}function zr(){let{modalState:e}=g();switch(e.step){case"intro":return t.jsx(sr,{});case"token":return t.jsx(pr,{});case"network":return t.jsx(ar,{});case"address":return t.jsx(Lr,{});case"processing":return t.jsx(cr,{});case"complete":return t.jsx(tr,{});case"refunded":return t.jsx(ur,{});case"failed":return t.jsx(nr,{});case"error":return t.jsx(or,{});default:return null}}var it={component:()=>{let{onUserCloseViaDialogOrKeybindRef:e}=me(),r=_(),{close:o,config:n}=g();return m.useEffect(()=>{e.current=o},[e,o]),m.useEffect(()=>{if(n.status==="ready"){for(let s of n.data.currencies)new Image().src=s.logoURI;for(let s of Object.values(n.data.chains))new Image().src=s.iconUrl}},[n]),r?t.jsx(Mr,{}):null}};export{it as default};
