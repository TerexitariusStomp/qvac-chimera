import{b as P,k as W,a as A,g as M,r as u,j as e,bZ as w,ci as j,ax as R}from"./index-f3d2c4df.js";import{t as F}from"./ExclamationTriangleIcon-d91da7a8.js";import{i as V}from"./LockClosedIcon-70343578.js";import{T as b,k as S,u as k}from"./ModalHeader-YbJk-YIQ-4a257643.js";import{r as H}from"./Subtitle-CV-2yKE4-4b2a0551.js";import{e as T}from"./Title-BnzYV3Is-7733e48e.js";const D=P.div`
  && {
    border-width: 4px;
  }

  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem;
  aspect-ratio: 1;
  border-style: solid;
  border-color: ${i=>i.$color??"var(--privy-color-accent)"};
  border-radius: 50%;
`,z={component:()=>{var p;let{user:i}=W(),{client:$,walletProxy:m,refreshSessionAndUser:C,closePrivyModal:l}=A(),s=M(),{entropyId:h,entropyIdVerifier:E}=((p=s.data)==null?void 0:p.recoverWallet)??{},[n,f]=u.useState(!1),[c,U]=u.useState(null),[d,g]=u.useState(null);function y(){var r,t,o,a;if(!n){if(d)return(t=(r=s.data)==null?void 0:r.setWalletPassword)==null||t.onFailure(d),void l();if(!c)return(a=(o=s.data)==null?void 0:o.setWalletPassword)==null||a.onFailure(Error("User exited set recovery flow")),void l()}}s.onUserCloseViaDialogOrKeybindRef.current=y;let I=!(!n&&!c);return e.jsxs(e.Fragment,d?{children:[e.jsx(b,{onClose:y},"header"),e.jsx(D,{$color:"var(--privy-color-error)",style:{alignSelf:"center"},children:e.jsx(F,{height:38,width:38,stroke:"var(--privy-color-error)"})}),e.jsx(T,{style:{marginTop:"0.5rem"},children:"Something went wrong"}),e.jsx(w,{style:{minHeight:"2rem"}}),e.jsx(S,{onClick:()=>g(null),children:"Try again"}),e.jsx(k,{})]}:{children:[e.jsx(b,{onClose:y},"header"),e.jsx(V,{style:{width:"3rem",height:"3rem",alignSelf:"center"}}),e.jsx(T,{style:{marginTop:"0.5rem"},children:"Automatically secure your account"}),e.jsx(H,{style:{marginTop:"1rem"},children:"When you log into a new device, you’ll only need to authenticate to access your account. Never get logged out if you forget your password."}),e.jsx(w,{style:{minHeight:"2rem"}}),e.jsx(S,{loading:n,disabled:I,onClick:()=>async function(){f(!0);try{let r=await $.getAccessToken(),t=j(i,h);if(!r||!m||!t)return;if(!(await m.setRecovery({accessToken:r,entropyId:h,entropyIdVerifier:E,existingRecoveryMethod:t.recoveryMethod,recoveryMethod:"privy"})).entropyId)throw Error("Unable to set recovery on wallet");let o=await C();if(!o)throw Error("Unable to set recovery on wallet");let a=j(o,t.address);if(!a)throw Error("Unabled to set recovery on wallet");U(!!o),setTimeout(()=>{var x,v;(v=(x=s.data)==null?void 0:x.setWalletPassword)==null||v.onSuccess(a),l()},R)}catch(r){g(r)}finally{f(!1)}}(),children:c?"Success":"Confirm"}),e.jsx(k,{})]})}};export{z as SetAutomaticRecoveryScreen,z as default};
