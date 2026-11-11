
/* Só existe o tema escuro: o site e o app sempre abrem em preto (o modo claro foi removido). */
function applySiteTheme(){var dark=true;if(document.documentElement)document.documentElement.style.colorScheme='dark';if(document.querySelector){var meta=document.querySelector('meta[name="theme-color"]');if(meta)meta.content='#000000';}document.body.classList.add('dark');var button=document.getElementById('theme-toggle');if(button)button.remove();return dark}
function restoreSiteTheme(){try{localStorage.removeItem('lojasg.estoque99.theme')}catch(e){}applySiteTheme()}
restoreSiteTheme();
document.addEventListener('DOMContentLoaded',restoreSiteTheme);
