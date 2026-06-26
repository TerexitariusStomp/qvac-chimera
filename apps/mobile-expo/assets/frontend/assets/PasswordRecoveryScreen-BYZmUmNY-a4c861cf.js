import{r as a,k as E,a as R,g as T,j as e,ci as I,cL as U,b as p,bn as W,bg as N}from"./index-f3d2c4df.js";import{o as O}from"./ShieldCheckIcon-df91ed27.js";import{m as V}from"./ModalHeader-YbJk-YIQ-4a257643.js";import{l as F}from"./Layouts-BlFm53ED-18e6eb5f.js";import{g as H,h as L,u as M,b as B,k as D}from"./shared-Mx6bnMlK-4adcd6c2.js";import{w as s}from"./Screen-CdOj1bUg-2fc007ee.js";import"./index-Dq_xe9dz-f4094704.js";const re={component:()=>{let[o,y]=a.useState(!0),{authenticated:m,user:w}=E(),{walletProxy:i,closePrivyModal:v,createAnalyticsEvent:x,client:j}=R(),{navigate:k,data:A,onUserCloseViaDialogOrKeybindRef:$}=T(),[l,C]=a.useState(void 0),[f,c]=a.useState(""),[d,g]=a.useState(!1),{entropyId:h,entropyIdVerifier:S,onCompleteNavigateTo:b,onSuccess:u,onFailure:P}=A.recoverWallet,n=(r="User exited before their wallet could be recovered")=>{v({shouldCallAuthOnSuccess:!1}),P(typeof r=="string"?new N(r):r)};return $.current=n,a.useEffect(()=>{if(!m)return n("User must be authenticated and have a Privy wallet before it can be recovered")},[m]),e.jsxs(s,{children:[e.jsx(s.Header,{icon:O,title:"Enter your password",subtitle:"Please provision your account on this new device. To continue, enter your recovery password.",showClose:!0,onClose:n}),e.jsx(s.Body,{children:e.jsx(K,{children:e.jsxs("div",{children:[e.jsxs(H,{children:[e.jsx(L,{type:o?"password":"text",onChange:r=>(t=>{t&&C(t)})(r.target.value),disabled:d,style:{paddingRight:"2.3rem"}}),e.jsx(M,{style:{right:"0.75rem"},children:o?e.jsx(B,{onClick:()=>y(!1)}):e.jsx(D,{onClick:()=>y(!0)})})]}),!!f&&e.jsx(Y,{children:f})]})})}),e.jsxs(s.Footer,{children:[e.jsx(s.HelpText,{children:e.jsxs(F,{children:[e.jsx("h4",{children:"Why is this necessary?"}),e.jsx("p",{children:"You previously set a password for this wallet. This helps ensure only you can access it"})]})}),e.jsx(s.Actions,{children:e.jsx(q,{loading:d||!i,disabled:!l,onClick:async()=>{g(!0);let r=await j.getAccessToken(),t=I(w,h);if(!r||!t||l===null)return n("User must be authenticated and have a Privy wallet before it can be recovered");try{x({eventName:"embedded_wallet_recovery_started",payload:{walletAddress:t.address}}),await(i==null?void 0:i.recover({accessToken:r,entropyId:h,entropyIdVerifier:S,recoveryPassword:l})),c(""),b?k(b):v({shouldCallAuthOnSuccess:!1}),u==null||u(t),x({eventName:"embedded_wallet_recovery_completed",payload:{walletAddress:t.address}})}catch(_){U(_)?c("Invalid recovery password, please try again."):c("An error has occurred, please try again.")}finally{g(!1)}},$hideAnimations:!h&&d,children:"Recover your account"})}),e.jsx(s.Watermark,{})]})]})}};let K=p.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`,Y=p.div`
  line-height: 20px;
  height: 20px;
  font-size: 13px;
  color: var(--privy-color-error);
  text-align: left;
  margin-top: 0.5rem;
`,q=p(V)`
  ${({$hideAnimations:o})=>o&&W`
      && {
        // Remove animations because the recoverWallet task on the iframe partially
        // blocks the renderer, so the animation stutters and doesn't look good
        transition: none;
      }
    `}
`;export{re as PasswordRecoveryScreen,re as default};
