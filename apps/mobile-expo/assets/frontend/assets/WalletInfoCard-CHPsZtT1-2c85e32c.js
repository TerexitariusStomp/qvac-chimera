import{b as r,r as d,j as e}from"./index-f3d2c4df.js";import{$ as p}from"./ModalHeader-YbJk-YIQ-4a257643.js";import{e as x}from"./ErrorMessage-D8VaAP5m-356f30dd.js";import{r as f}from"./LabelXs-oqZNqbm_-236e85b9.js";import{d as h}from"./Address-Wk5-LLxD-20456470.js";import{d as g}from"./shared-FM0rljBt-5888a332.js";import{C as j}from"./check-1aa327f7.js";import{C as u}from"./copy-7b197e42.js";let v=r(g)`
  && {
    padding: 0.75rem;
    height: 56px;
  }
`,y=r.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`,C=r.div`
  display: flex;
  flex-direction: column;
  gap: 0;
`,b=r.div`
  font-size: 12px;
  line-height: 1rem;
  color: var(--privy-color-foreground-3);
`,w=r(f)`
  text-align: left;
  margin-bottom: 0.5rem;
`,z=r(x)`
  margin-top: 0.25rem;
`,E=r(p)`
  && {
    gap: 0.375rem;
    font-size: 14px;
  }
`;const P=({errMsg:t,balance:s,address:n,className:l,title:a,showCopyButton:m=!1})=>{let[o,c]=d.useState(!1);return d.useEffect(()=>{if(o){let i=setTimeout(()=>c(!1),3e3);return()=>clearTimeout(i)}},[o]),e.jsxs("div",{children:[a&&e.jsx(w,{children:a}),e.jsx(v,{className:l,$state:t?"error":void 0,children:e.jsxs(y,{children:[e.jsxs(C,{children:[e.jsx(h,{address:n,showCopyIcon:!1}),s!==void 0&&e.jsx(b,{children:s})]}),m&&e.jsx(E,{onClick:function(i){i.stopPropagation(),navigator.clipboard.writeText(n).then(()=>c(!0)).catch(console.error)},size:"sm",children:e.jsxs(e.Fragment,o?{children:["Copied",e.jsx(j,{size:14})]}:{children:["Copy",e.jsx(u,{size:14})]})})]})}),t&&e.jsx(z,{children:t})]})};export{P as j};
