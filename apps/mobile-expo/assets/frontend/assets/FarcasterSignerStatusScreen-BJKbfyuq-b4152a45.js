import{j as a,aw as y,bl as F,aK as T,b as n,g as I,l as O,a as _,r as d,ax as k}from"./index-f3d2c4df.js";import{h as q}from"./CopyToClipboard-DSTf_eKU-83a11909.js";import{n as B}from"./OpenLink-DZHy38vr-714bc544.js";import{C as E}from"./QrCode-BxAVhbx2-2948825a.js";import{n as A}from"./ScreenLayout-Ce16-u0i-9f2d120d.js";import{l as h}from"./farcaster-DPlSjvF5-492d6ab5.js";import"./browser-e933942f.js";import"./ModalHeader-YbJk-YIQ-4a257643.js";import"./Screen-CdOj1bUg-2fc007ee.js";import"./index-Dq_xe9dz-f4094704.js";let S="#8a63d2";const M=({appName:p,loading:m,success:i,errorMessage:e,connectUri:r,onBack:s,onClose:c,onOpenFarcaster:o})=>a.jsx(A,y||m?F?{title:e?e.message:"Add a signer to Farcaster",subtitle:e?e.detail:`This will allow ${p} to add casts, likes, follows, and more on your behalf.`,icon:h,iconVariant:"loading",iconLoadingStatus:{success:i,fail:!!e},primaryCta:r&&o?{label:"Open Farcaster app",onClick:o}:void 0,onBack:s,onClose:c,watermark:!0}:{title:e?e.message:"Requesting signer from Farcaster",subtitle:e?e.detail:"This should only take a moment",icon:h,iconVariant:"loading",iconLoadingStatus:{success:i,fail:!!e},onBack:s,onClose:c,watermark:!0,children:r&&y&&a.jsx(P,{children:a.jsx(B,{text:"Take me to Farcaster",url:r,color:S})})}:{title:"Add a signer to Farcaster",subtitle:`This will allow ${p} to add casts, likes, follows, and more on your behalf.`,onBack:s,onClose:c,watermark:!0,children:a.jsxs(R,{children:[a.jsx(L,{children:r?a.jsx(E,{url:r,size:275,squareLogoElement:h}):a.jsx(z,{children:a.jsx(T,{})})}),a.jsxs(N,{children:[a.jsx(V,{children:"Or copy this link and paste it into a phone browser to open the Farcaster app."}),r&&a.jsx(q,{text:r,itemName:"link",color:S})]})]})});let P=n.div`
  margin-top: 24px;
`,R=n.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
`,L=n.div`
  padding: 24px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 275px;
`,N=n.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
`,V=n.div`
  font-size: 0.875rem;
  text-align: center;
  color: var(--privy-color-foreground-2);
`,z=n.div`
  position: relative;
  width: 82px;
  height: 82px;
`;const Z={component:()=>{let{lastScreen:p,navigateBack:m,data:i}=I(),e=O(),{requestFarcasterSignerStatus:r,closePrivyModal:s}=_(),[c,o]=d.useState(void 0),[j,f]=d.useState(!1),[w,v]=d.useState(!1),g=d.useRef([]),t=i==null?void 0:i.farcasterSigner;d.useEffect(()=>{let b=Date.now(),l=setInterval(async()=>{if(!(t!=null&&t.public_key))return clearInterval(l),void o({retryable:!0,message:"Connect failed",detail:"Something went wrong. Please try again."});t.status==="approved"&&(clearInterval(l),f(!1),v(!0),g.current.push(setTimeout(()=>s({shouldCallAuthOnSuccess:!1,isSuccess:!0}),k)));let u=await r(t==null?void 0:t.public_key),C=Date.now()-b;u.status==="approved"?(clearInterval(l),f(!1),v(!0),g.current.push(setTimeout(()=>s({shouldCallAuthOnSuccess:!1,isSuccess:!0}),k))):C>3e5?(clearInterval(l),o({retryable:!0,message:"Connect failed",detail:"The request timed out. Try again."})):u.status==="revoked"&&(clearInterval(l),o({retryable:!0,message:"Request rejected",detail:"The request was rejected. Please try again."}))},2e3);return()=>{clearInterval(l),g.current.forEach(u=>clearTimeout(u))}},[]);let x=(t==null?void 0:t.status)==="pending_approval"?t.signer_approval_url:void 0;return a.jsx(M,{appName:e.name,loading:j,success:w,errorMessage:c,connectUri:x,onBack:p?m:void 0,onClose:s,onOpenFarcaster:()=>{x&&(window.location.href=x)}})}};export{Z as FarcasterSignerStatusScreen,M as FarcasterSignerStatusView,Z as default};
