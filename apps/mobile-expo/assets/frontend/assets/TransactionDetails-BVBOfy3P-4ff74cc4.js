import{b as r,j as e,l as P,bI as p,r as d}from"./index-f3d2c4df.js";import{p as S,S as u,h as g}from"./WalletLink-BfK-fCTT-c94c9e32.js";import{c as v}from"./ethers-BwspWcmN-76dc30f3.js";import{d as f}from"./Layouts-BlFm53ED-18e6eb5f.js";import{t as I}from"./ChevronDownIcon-05a1a682.js";const h=({label:t,children:n,valueStyles:i})=>e.jsxs(C,{children:[e.jsx("div",{children:t}),e.jsx(B,{style:{...i},children:n})]});let C=r.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;

  > :first-child {
    color: var(--privy-color-foreground-3);
    text-align: left;
  }

  > :last-child {
    color: var(--privy-color-foreground-2);
    text-align: right;
  }
`,B=r.div`
  font-size: 14px;
  line-height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--privy-border-radius-full);
  background-color: var(--privy-color-background-2);
  padding: 4px 8px;
`;const A=({gas:t,tokenPrice:n,tokenSymbol:i})=>e.jsxs(f,{style:{paddingBottom:"12px"},children:[e.jsxs(j,{children:[e.jsx(y,{children:"Est. Fees"}),e.jsx("div",{children:e.jsx(g,{weiQuantities:[BigInt(t)],tokenPrice:n,tokenSymbol:i})})]}),n&&e.jsx(m,{children:`${v(BigInt(t),i)}`})]}),T=({value:t,gas:n,tokenPrice:i,tokenSymbol:l})=>{let o=BigInt(t??0)+BigInt(n);return e.jsxs(f,{children:[e.jsxs(j,{children:[e.jsx(y,{children:"Total (including fees)"}),e.jsx("div",{children:e.jsx(g,{weiQuantities:[BigInt(t||0),BigInt(n)],tokenPrice:i,tokenSymbol:l})})]}),i&&e.jsx(m,{children:v(o,l)})]})};let j=r.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding-top: 4px;
`,m=r.div`
  display: flex;
  flex-direction: row;
  height: 12px;

  font-size: 12px;
  line-height: 12px;
  color: var(--privy-color-foreground-3);
  font-weight: 400;
`,y=r.div`
  font-size: 14px;
  line-height: 22.4px;
  font-weight: 400;
`;const s=d.createContext(void 0),a=d.createContext(void 0),$=({defaultValue:t,children:n})=>{let[i,l]=d.useState(t||null);return e.jsx(s.Provider,{value:{activePanel:i,togglePanel:o=>{l(i===o?null:o)}},children:e.jsx(V,{children:n})})},z=({value:t,children:n})=>{let{activePanel:i,togglePanel:l}=d.useContext(s),o=i===t;return e.jsx(a.Provider,{value:{onToggle:()=>l(t),value:t},children:e.jsx(L,{isActive:o?"true":"false","data-open":String(o),children:n})})},F=({children:t})=>{let{activePanel:n}=d.useContext(s),{onToggle:i,value:l}=d.useContext(a),o=n===l;return e.jsxs(e.Fragment,{children:[e.jsxs(D,{onClick:i,"data-open":String(o),children:[e.jsx(H,{children:t}),e.jsx(q,{isactive:o?"true":"false",children:e.jsx(I,{height:"16px",width:"16px",strokeWidth:"2"})})]}),e.jsx(W,{})]})},E=({children:t})=>{let{activePanel:n}=d.useContext(s),{value:i}=d.useContext(a);return e.jsx(R,{"data-open":String(n===i),children:e.jsx(b,{children:t})})},Q=({children:t})=>{let{activePanel:n}=d.useContext(s),{value:i}=d.useContext(a);return e.jsx(b,{children:typeof t=="function"?t({isActive:n===i}):t})};let V=r.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 8px;
`,D=r.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  cursor: pointer;
  padding-bottom: 8px;
`,W=r.div`
  width: 100%;

  && {
    border-top: 1px solid;
    border-color: var(--privy-color-foreground-4);
  }
  padding-bottom: 12px;
`,H=r.div`
  font-size: 14px;
  font-weight: 500;
  line-height: 19.6px;
  width: 100%;
  padding-right: 8px;
`,L=r.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  overflow: hidden;
  padding: 12px;

  && {
    border: 1px solid;
    border-color: var(--privy-color-foreground-4);
    border-radius: var(--privy-border-radius-md);
  }
`,R=r.div`
  position: relative;
  overflow: hidden;
  transition: max-height 25ms ease-out;

  &[data-open='true'] {
    max-height: 700px;
  }

  &[data-open='false'] {
    max-height: 0;
  }
`,b=r.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1 1 auto;
  min-height: 1px;
`,q=r.div`
  transform: ${t=>t.isactive==="true"?"rotate(180deg)":"rotate(0deg)"};
`;const X=({from:t,to:n,txn:i,transactionInfo:l,tokenPrice:o,gas:c,tokenSymbol:x})=>{let w=BigInt((i==null?void 0:i.value)||0);return e.jsx($,{...P().render.standalone?{defaultValue:"details"}:{},children:e.jsxs(z,{value:"details",children:[e.jsx(F,{children:e.jsxs(G,{children:[e.jsx("div",{children:(l==null?void 0:l.title)||"Details"}),e.jsx(J,{children:e.jsx(S,{weiQuantities:[w],tokenPrice:o,tokenSymbol:x})})]})}),e.jsxs(E,{children:[e.jsx(h,{label:"From",children:e.jsx(u,{walletAddress:t,chainId:i.chainId||p,chainType:"ethereum"})}),e.jsx(h,{label:"To",children:e.jsx(u,{walletAddress:n,chainId:i.chainId||p,chainType:"ethereum"})}),l&&l.action&&e.jsx(h,{label:"Action",children:l.action}),c&&e.jsx(A,{value:i.value,gas:c,tokenPrice:o,tokenSymbol:x})]}),e.jsx(Q,{children:({isActive:k})=>e.jsx(T,{value:i.value,displayFee:k,gas:c||"0x0",tokenPrice:o,tokenSymbol:x})})]})})};let G=r.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`,J=r.div`
  flex-shrink: 0;
  padding-left: 8px;
`;export{X as $};
