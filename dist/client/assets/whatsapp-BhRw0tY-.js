import{c as n}from"./createLucideIcon-DksFJfTH.js";import{f as r}from"./calculos-DD26JWw4.js";const s=[["path",{d:"M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719",key:"1sd12s"}]],l=n("message-circle",s);function u(e){const a=[e.marca,e.modelo].filter(Boolean).join(" ")||"tu equipo",o=e.reparacion||e.tipo_trabajo||"-";return`Hola ${e.cliente}.

Te enviamos el presupuesto para tu equipo:

Equipo: ${a}
Trabajo: ${o}
Total: ${r(e.total)}

Muchas gracias.
MyPhone`}function m(e,a){const o=(e||"").replace(/\D/g,""),t=`${o?`https://wa.me/${o}`:"https://wa.me/"}?text=${encodeURIComponent(a)}`;window.open(t,"_blank","noopener,noreferrer")}export{l as M,m as a,u as b};
