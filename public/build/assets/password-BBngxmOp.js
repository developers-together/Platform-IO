import{r as w,m as j,j as s,L as v}from"./app-BqBBs0yN.js";import{L as n,I as d,a as p}from"./label-3rIpjawN.js";import{A as _}from"./app-layout-e6EAfTMw.js";import{S as y,H as N}from"./layout-totyklyu.js";import{B as C}from"./app-logo-icon-CDZ-dE2e.js";import{z as S}from"./transition-CTbjo8sv.js";/* empty css            */import"./index-utEXoJmb.js";import"./index-ecUf-pmQ.js";const b=[{title:"Password settings",href:"/settings/password"}];function B(){const i=w.useRef(null),c=w.useRef(null),{data:e,setData:a,errors:o,put:f,reset:t,processing:x,recentlySuccessful:h}=j({current_password:"",password:"",password_confirmation:""}),g=r=>{r.preventDefault(),f(route("password.update"),{preserveScroll:!0,onSuccess:()=>t(),onError:l=>{var u,m;l.password&&(t("password","password_confirmation"),(u=i.current)==null||u.focus()),l.current_password&&(t("current_password"),(m=c.current)==null||m.focus())}})};return s.jsxs(_,{breadcrumbs:b,children:[s.jsx(v,{title:"Profile settings"}),s.jsx(y,{children:s.jsxs("div",{className:"space-y-6",children:[s.jsx(N,{title:"Update password",description:"Ensure your account is using a long, random password to stay secure"}),s.jsxs("form",{onSubmit:g,className:"space-y-6",children:[s.jsxs("div",{className:"grid gap-2",children:[s.jsx(n,{htmlFor:"current_password",children:"Current password"}),s.jsx(d,{id:"current_password",ref:c,value:e.current_password,onChange:r=>a("current_password",r.target.value),type:"password",className:"mt-1 block w-full",autoComplete:"current-password",placeholder:"Current password"}),s.jsx(p,{message:o.current_password})]}),s.jsxs("div",{className:"grid gap-2",children:[s.jsx(n,{htmlFor:"password",children:"New password"}),s.jsx(d,{id:"password",ref:i,value:e.password,onChange:r=>a("password",r.target.value),type:"password",className:"mt-1 block w-full",autoComplete:"new-password",placeholder:"New password"}),s.jsx(p,{message:o.password})]}),s.jsxs("div",{className:"grid gap-2",children:[s.jsx(n,{htmlFor:"password_confirmation",children:"Confirm password"}),s.jsx(d,{id:"password_confirmation",value:e.password_confirmation,onChange:r=>a("password_confirmation",r.target.value),type:"password",className:"mt-1 block w-full",autoComplete:"new-password",placeholder:"Confirm password"}),s.jsx(p,{message:o.password_confirmation})]}),s.jsxs("div",{className:"flex items-center gap-4",children:[s.jsx(C,{disabled:x,children:"Save password"}),s.jsx(S,{show:h,enter:"transition ease-in-out",enterFrom:"opacity-0",leave:"transition ease-in-out",leaveTo:"opacity-0",children:s.jsx("p",{className:"text-sm text-neutral-600",children:"Saved"})})]})]})]})})]})}export{B as default};
