(self.webpackChunk=self.webpackChunk||[]).push([[283],{53407:(e,t,a)=>{"use strict";a.d(t,{Z:()=>m});var l=a(67294),n=a(98595),r=a(10267),s=a(51252);const m=function(e){var t=e.headerBg,a=e.title;return l.createElement(l.Fragment,null,l.createElement("div",{className:"header pb-8 pt-5 pt-lg-8 d-flex align-items-center "+(null!=t?t:"bg-gradient-gray-dark")},l.createElement(n.Z,{className:"d-flex align-items-center flex-grow-1",fluid:!0},l.createElement(r.Z,{className:"flex-grow-1"},l.createElement(s.Z,{lg:"7",md:"10"},l.createElement("h1",{className:"display-2 text-white"},null!=a?a:" "))))))}},24726:(e,t,a)=>{"use strict";a.d(t,{Z:()=>E});var l=a(67294),n=a(53407),r=a(98595),s=a(10267),m=a(51252),c=a(77243),i=a(53999),u=a(98008),o=a(64593),d=a(9680),f=a(88129),g=a.n(f);const E=function(e){var t=e.userIsLoggedIn,a=e.pageSlug,f=e.title,E=e.children,p=e.customNavButtons,N=e.userCanUpdate,Z=e.userCanDelete,h=N||Z;return l.createElement(l.Fragment,null,l.createElement(o.q,null,l.createElement("title",null,f)),l.createElement(n.Z,{title:f}),l.createElement(r.Z,{className:"mt--7",fluid:!0},l.createElement(s.Z,{className:"mb-2"},l.createElement(m.Z,{lg:12,className:"text-right"},l.createElement(c.Z,{className:"nav-fill flex-column-reverse flex-sm-row-reverse",pills:!0},t&&h&&l.createElement(l.Fragment,null,Z&&l.createElement(i.Z,{className:"ml-2 flex-grow-0"},l.createElement(u.Z,{className:"mb-sm-3 mb-md-0 text-danger",onClick:function(e){if(e.preventDefault(),confirm("Do you really want to delete this page?"))return d.Inertia.delete(g()("page.destroy",a))},href:"#"},l.createElement("i",{className:"fas fa-trash mr-2"}),"Delete")),N&&l.createElement(i.Z,{className:"ml-2 flex-grow-0"},l.createElement(u.Z,{className:"mb-sm-3 mb-md-0",onClick:function(e){return e.preventDefault(),d.Inertia.get(g()("page.edit",a))},href:"#"},l.createElement("i",{className:"fas fa-pencil-alt mr-2"}),"Edit"))),p))),E))}},66283:(e,t,a)=>{"use strict";a.r(t),a.d(t,{default:()=>g});var l=a(67294),n=a(53999),r=a(98008),s=a(56941),m=a(91121),c=a(88129),i=a.n(c),u=a(51636),o=a(4817),d=a.n(o),f=a(24726);const g=function(e){var t=e.auth.check,a=e.slug,c=e.title,o=e.revision,g=e.current_content,E=e.can,p=E.update,N=E.delete;return l.createElement(f.Z,{userIsLoggedIn:t,pageSlug:a,title:"Diff of "+c,userCanUpdate:p,userCanDelete:N,customNavButtons:[l.createElement(n.Z,{className:"ml-2 flex-grow-0",key:"wiki.revisions.index"},l.createElement(r.Z,{className:"mb-sm-3 mb-md-0",tag:u.ZQ,href:i()("wiki.revisions.index",a)},l.createElement("i",{className:"fas fa-history mr-2"}),"History"))]},l.createElement(s.Z,{className:"shadow"},l.createElement(m.Z,null,l.createElement(d(),{oldValue:o.old_value,newValue:g,splitView:!0}))))}}}]);
//# sourceMappingURL=283.js.map?id=f8c6c2a918893ced106b