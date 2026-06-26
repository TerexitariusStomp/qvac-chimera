import{b as d,l as m,j as l,bE as u,I as f,bF as p}from"./index-f3d2c4df.js";import{b as C}from"./browser-e933942f.js";const $=e=>l.jsx("svg",{viewBox:"0 0 50 50",fill:"none",xmlns:"http://www.w3.org/2000/svg",...e,children:l.jsx("rect",{width:"50",height:"50",fill:"black",rx:10,ry:10})});let x=(e,r,t,o,s)=>{for(let i=r;i<r+o;i++)for(let g=t;g<t+s;g++){let n=e==null?void 0:e[g];n&&n[i]&&(n[i]=0)}return e},b=(e,r)=>{let t=C.create(e,{errorCorrectionLevel:r}).modules,o=u(Array.from(t.data),t.size);return o=x(o,0,0,7,7),o=x(o,o.length-7,0,7,7),x(o,0,o.length-7,7,7)},z=({x:e,y:r,cellSize:t,bgColor:o,fgColor:s})=>l.jsx(l.Fragment,{children:[0,1,2].map(i=>l.jsx("circle",{r:t*(7-2*i)/2,cx:e+7*t/2,cy:r+7*t/2,fill:i%2!=0?o:s},`finder-${e}-${r}-${i}`))}),j=({cellSize:e,matrixSize:r,bgColor:t,fgColor:o})=>l.jsx(l.Fragment,{children:[[0,0],[(r-7)*e,0],[0,(r-7)*e]].map(([s,i])=>l.jsx(z,{x:s,y:i,cellSize:e,bgColor:t,fgColor:o},`finder-${s}-${i}`))}),S=({matrix:e,cellSize:r,color:t})=>l.jsx(l.Fragment,{children:e.map((o,s)=>o.map((i,g)=>i?l.jsx("rect",{height:r-.4,width:r-.4,x:s*r+.1*r,y:g*r+.1*r,rx:.5*r,ry:.5*r,fill:t},`cell-${s}-${g}`):l.jsx(f.Fragment,{},`circle-${s}-${g}`)))}),w=({cellSize:e,matrixSize:r,element:t,sizePercentage:o,bgColor:s})=>{if(!t)return l.jsx(l.Fragment,{});let i=r*(o||.14),g=Math.floor(r/2-i/2),n=Math.floor(r/2+i/2);(n-g)%2!=r%2&&(n+=1);let a=(n-g)*e,c=a-.2*a,h=g*e;return l.jsxs(l.Fragment,{children:[l.jsx("rect",{x:g*e,y:g*e,width:a,height:a,fill:s}),l.jsx(t,{x:h+.1*a,y:h+.1*a,height:c,width:c})]})},v=e=>{var i;let r=e.outputSize,t=b(e.url,e.errorCorrectionLevel),o=r/t.length,s=p(2*o,{min:.025*r,max:.036*r});return l.jsxs("svg",{height:e.outputSize,width:e.outputSize,viewBox:`0 0 ${e.outputSize} ${e.outputSize}`,style:{height:"100%",width:"100%",padding:`${s}px`},children:[l.jsx(S,{matrix:t,cellSize:o,color:e.fgColor}),l.jsx(j,{cellSize:o,matrixSize:t.length,fgColor:e.fgColor,bgColor:e.bgColor}),l.jsx(w,{cellSize:o,element:(i=e.logo)==null?void 0:i.element,bgColor:e.bgColor,matrixSize:t.length})]})},y=d.div.attrs({className:"ph-no-capture"})`
  display: flex;
  justify-content: center;
  align-items: center;
  height: ${e=>`${e.$size}px`};
  width: ${e=>`${e.$size}px`};
  margin: auto;
  background-color: ${e=>e.$bgColor};

  && {
    border-width: 2px;
    border-color: ${e=>e.$borderColor};
    border-radius: var(--privy-border-radius-md);
  }
`;const k=e=>{let{appearance:r}=m(),t=e.bgColor||"#FFFFFF",o=e.fgColor||"#000000",s=e.size||160,i=r.palette.colorScheme==="dark"?t:o;return l.jsx(y,{$size:s,$bgColor:t,$fgColor:o,$borderColor:i,children:l.jsx(v,{url:e.url,logo:e.hideLogo?void 0:{element:e.squareLogoElement??$},outputSize:s,bgColor:t,fgColor:o,errorCorrectionLevel:e.errorCorrectionLevel||"Q"})})};export{k as C};
