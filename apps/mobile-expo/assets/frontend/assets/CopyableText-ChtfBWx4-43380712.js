import{b as c,r as p,j as e}from"./index-f3d2c4df.js";import{C as m}from"./check-1aa327f7.js";import{C as g}from"./copy-7b197e42.js";let a=c.button`
  display: flex;
  align-items: center;
  justify-content: end;
  gap: 0.5rem;

  && {
    color: var(--privy-color-foreground);
    font-weight: 500;
  }

  svg {
    width: 0.875rem;
    height: 0.875rem;
  }
`,h=c.span`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.875rem;
  color: var(--privy-color-foreground-2);
`,x=c(m)`
  color: var(--privy-color-icon-success);
  flex-shrink: 0;
`,u=c(g)`
  color: var(--privy-color-icon-muted);
  flex-shrink: 0;
`;function y({children:r,iconOnly:l,value:o,hideCopyIcon:i,iconSize:t=14,...n}){let[s,d]=p.useState(!1);return e.jsxs(a,{...n,onClick:()=>{navigator.clipboard.writeText(o||(typeof r=="string"?r:"")).catch(console.error),d(!0),setTimeout(()=>d(!1),1500)},children:[r," ",s?e.jsxs(h,{children:[e.jsx(x,{size:t})," ",!l&&"Copied"]}):!i&&e.jsx(u,{size:t})]})}const C=({value:r,includeChildren:l,children:o,...i})=>{let[t,n]=p.useState(!1),s=()=>{navigator.clipboard.writeText(r).catch(console.error),n(!0),setTimeout(()=>n(!1),1500)};return e.jsxs(e.Fragment,{children:[l?e.jsx(a,{...i,onClick:s,children:o}):e.jsx(e.Fragment,{children:o}),e.jsx(a,{...i,onClick:s,children:t?e.jsx(h,{children:e.jsx(x,{})}):e.jsx(u,{})})]})};export{y as m,C as p};
