/* Little Star English – hand-made vector characters.
   One rig draws Bunny, Cat and Bear. Moods and clothes are shown by CSS classes:
   mood-idle | mood-happy | mood-think | mood-sleep | mood-eat | mood-dance | mood-wave
   wear-shirt wear-shoes wear-hat wear-socks wear-sunglasses wear-crown | show-mud show-bubbles show-pillow show-blanket */
window.ART = (() => {
  "use strict";
  const K = {
    bunny: { fur: "#fffaf4", shade: "#efe1d4", inner: "#ffb8cc", light: "#ffffff", nose: "#ff8fab" },
    cat:   { fur: "#ffc27a", shade: "#f2a24a", inner: "#ffb8a0", light: "#fff1de", nose: "#ff8fab", stripe: "#e0842b" },
    bear:  { fur: "#c98b5a", shade: "#a86f45", inner: "#eab58c", light: "#f3d4b5", nose: "#3a2a1f" },
  };
  const S = 'stroke="#3a2a1f" stroke-width="5" stroke-linejoin="round"';

  function ears(k, c) {
    if (k === "bunny") return `
      <g class="ears">
        <g class="ear-l"><ellipse cx="86" cy="40" rx="21" ry="54" transform="rotate(-12 86 90)" fill="${c.fur}" ${S}/><ellipse cx="86" cy="44" rx="9" ry="38" transform="rotate(-12 86 90)" fill="${c.inner}"/></g>
        <g class="ear-r"><ellipse cx="154" cy="40" rx="21" ry="54" transform="rotate(12 154 90)" fill="${c.fur}" ${S}/><ellipse cx="154" cy="44" rx="9" ry="38" transform="rotate(12 154 90)" fill="${c.inner}"/></g>
      </g>`;
    if (k === "cat") return `
      <g class="ears">
        <g class="ear-l"><path d="M56 86 L64 22 L114 56 Z" fill="${c.fur}" ${S}/><path d="M68 72 L72 40 L98 58 Z" fill="${c.inner}"/></g>
        <g class="ear-r"><path d="M184 86 L176 22 L126 56 Z" fill="${c.fur}" ${S}/><path d="M172 72 L168 40 L142 58 Z" fill="${c.inner}"/></g>
      </g>`;
    return `
      <g class="ears">
        <g class="ear-l"><circle cx="62" cy="56" r="27" fill="${c.fur}" ${S}/><circle cx="62" cy="58" r="13" fill="${c.inner}"/></g>
        <g class="ear-r"><circle cx="178" cy="56" r="27" fill="${c.fur}" ${S}/><circle cx="178" cy="58" r="13" fill="${c.inner}"/></g>
      </g>`;
  }
  function tail(k, c) {
    if (k === "cat") return `<path class="tail" d="M176 250 C220 250 226 200 206 184" fill="none" stroke="#3a2a1f" stroke-width="20" stroke-linecap="round"/><path class="tail" d="M176 250 C220 250 226 200 206 184" fill="none" stroke="${c.fur}" stroke-width="11" stroke-linecap="round"/>`;
    return `<circle class="tail" cx="182" cy="250" r="${k === "bunny" ? 17 : 12}" fill="${c.light}" ${S}/>`;
  }

  function friend(kind = "bunny", { mascot = false, cls = "" } = {}) {
    const c = K[kind] || K.bunny;
    const muzzle = kind === "bunny"
      ? `<ellipse cx="120" cy="142" rx="24" ry="16" fill="${c.light}" opacity=".9"/>`
      : `<ellipse cx="120" cy="142" rx="33" ry="23" fill="${c.light}" ${S}/>`;
    const nose = kind === "bear"
      ? `<ellipse cx="120" cy="131" rx="11" ry="7.5" fill="${c.nose}"/><ellipse cx="116" cy="129" rx="3.5" ry="2" fill="#fff" opacity=".7"/>`
      : `<path d="M112 128 Q120 124 128 128 Q124 136 120 137 Q116 136 112 128 Z" fill="${c.nose}" stroke="#3a2a1f" stroke-width="3"/>`;
    const stripes = kind === "cat"
      ? `<path d="M108 46 Q112 62 110 72 M120 44 V70 M132 46 Q128 62 130 72" stroke="${c.stripe}" stroke-width="6" stroke-linecap="round" fill="none"/>
         <path d="M52 112 H70 M52 124 H68 M188 112 H170 M188 124 H172" stroke="${c.stripe}" stroke-width="5" stroke-linecap="round"/>`
      : "";
    const whiskers = kind === "cat"
      ? `<g stroke="#3a2a1f" stroke-width="2.6" stroke-linecap="round"><path d="M92 140 L60 134 M92 148 L62 152"/><path d="M148 140 L180 134 M148 148 L178 152"/></g>`
      : "";
    return `
<svg class="friend k-${kind} mood-idle ${cls}" viewBox="0 0 240 300" aria-hidden="true">
 <defs>
  <radialGradient id="shine-${kind}" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset=".6" stop-color="#fff" stop-opacity="0"/></radialGradient>
 </defs>
 <ellipse class="shadow" cx="120" cy="292" rx="74" ry="9" fill="#3a2a1f" opacity=".14"/>
 <g class="f-all">
  <g class="x-pillow"><rect x="34" y="40" width="172" height="96" rx="44" fill="#ffffff" ${S}/><path d="M60 66 Q120 50 180 66" stroke="#cfe6ff" stroke-width="8" fill="none" stroke-linecap="round"/></g>
  <g class="f-ears">${ears(kind, c)}</g>
  ${tail(kind, c)}
  <g class="arm-l"><ellipse cx="60" cy="222" rx="17" ry="30" transform="rotate(28 60 222)" fill="${c.fur}" ${S}/></g>
  <g class="arm-r"><ellipse cx="180" cy="222" rx="17" ry="30" transform="rotate(-28 180 222)" fill="${c.fur}" ${S}/></g>
  <ellipse cx="120" cy="222" rx="64" ry="58" fill="${c.fur}" ${S}/>
  <ellipse cx="120" cy="234" rx="40" ry="35" fill="${c.light}"/>
  ${mascot ? `<path class="x-badge" d="M120 212 l7 14 15 2 -11 10 3 15 -14 -7 -14 7 3 -15 -11 -10 15 -2 z" fill="#ffc53d" stroke="#3a2a1f" stroke-width="3.5" stroke-linejoin="round"/>` : ""}
  <ellipse cx="86" cy="281" rx="25" ry="14" fill="${c.fur}" ${S}/>
  <ellipse cx="154" cy="281" rx="25" ry="14" fill="${c.fur}" ${S}/>
  <g class="o-socks"><rect x="70" y="262" width="32" height="20" rx="8" fill="#5cb8f5" ${S}/><rect x="138" y="262" width="32" height="20" rx="8" fill="#ffc53d" ${S}/><path d="M72 272 H100 M140 272 H168" stroke="#fff" stroke-width="4"/></g>
  <g class="o-shoes"><path d="M58 284 Q58 266 84 266 Q112 266 114 284 Q114 294 86 294 Q58 294 58 284 Z" fill="#8f7cf2" ${S}/><path d="M126 284 Q126 266 154 266 Q182 266 182 284 Q182 294 154 294 Q126 294 126 284 Z" fill="#8f7cf2" ${S}/><path d="M64 286 H108 M132 286 H176" stroke="#fff" stroke-width="4" stroke-linecap="round"/></g>
  <g class="o-shirt">
   <path d="M64 184 Q120 166 176 184 L200 212 L180 228 L172 214 L172 262 Q120 280 68 262 L68 214 L60 228 L40 212 Z" fill="#7ed957" ${S}/>
   <path d="M100 176 Q120 196 140 176" fill="none" stroke="#3a2a1f" stroke-width="4"/>
   <path d="M74 232 Q120 244 166 232" stroke="#b9f09f" stroke-width="7" fill="none" stroke-linecap="round"/>
  </g>
  <g class="x-blanket">
   <path d="M24 214 Q120 192 216 214 L216 300 L24 300 Z" fill="#8ec5ff" ${S}/>
   <path d="M24 226 Q120 204 216 226" stroke="#fff" stroke-width="8" fill="none"/>
   <g fill="#fff" opacity=".8"><circle cx="64" cy="256" r="6"/><circle cx="110" cy="270" r="6"/><circle cx="160" cy="254" r="6"/><circle cx="194" cy="280" r="6"/><circle cx="46" cy="286" r="6"/></g>
  </g>
  <g class="f-head">
   <circle cx="120" cy="112" r="72" fill="${c.fur}" ${S}/>
   <circle cx="120" cy="112" r="68" fill="url(#shine-${kind})"/>
   ${stripes}
   ${muzzle}
   <circle cx="72" cy="136" r="12" fill="#ff9fb8" opacity=".75"/><circle cx="168" cy="136" r="12" fill="#ff9fb8" opacity=".75"/>
   <g class="e-open"><g class="pupils"><circle cx="92" cy="110" r="11" fill="#3a2a1f"/><circle cx="148" cy="110" r="11" fill="#3a2a1f"/><circle cx="96" cy="105" r="4" fill="#fff"/><circle cx="152" cy="105" r="4" fill="#fff"/></g></g>
   <g class="e-happy" fill="none" stroke="#3a2a1f" stroke-width="6" stroke-linecap="round"><path d="M79 114 Q92 98 105 114"/><path d="M135 114 Q148 98 161 114"/></g>
   <g class="e-closed" fill="none" stroke="#3a2a1f" stroke-width="5.5" stroke-linecap="round"><path d="M80 110 Q92 121 104 110"/><path d="M136 110 Q148 121 160 110"/></g>
   <g class="o-glasses"><rect x="70" y="96" width="44" height="30" rx="13" fill="#2d2a4a" stroke="#3a2a1f" stroke-width="4"/><rect x="126" y="96" width="44" height="30" rx="13" fill="#2d2a4a" stroke="#3a2a1f" stroke-width="4"/><path d="M114 106 H126" stroke="#3a2a1f" stroke-width="4"/><path d="M78 104 L90 100 M134 104 L146 100" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".7"/></g>
   ${nose}
   <path class="m-smile" d="M106 144 Q113 152 120 144 Q127 152 134 144" fill="none" stroke="#3a2a1f" stroke-width="4.5" stroke-linecap="round"/>
   <g class="m-open"><path d="M104 144 Q120 172 136 144 Z" fill="#b3364f" stroke="#3a2a1f" stroke-width="4.5" stroke-linejoin="round"/><path d="M111 156 Q120 150 129 156 Q126 164 120 165 Q114 164 111 156 Z" fill="#ff8fab"/></g>
   <ellipse class="m-o" cx="120" cy="150" rx="6.5" ry="7.5" fill="#b3364f" stroke="#3a2a1f" stroke-width="3.5"/>
   <path class="m-flat" d="M110 150 Q120 145 132 151" fill="none" stroke="#3a2a1f" stroke-width="4.5" stroke-linecap="round"/>
   ${whiskers}
  </g>
  <g class="x-mud" fill="#9b6a3c" opacity=".85"><ellipse cx="74" cy="84" rx="13" ry="9"/><ellipse cx="160" cy="170" rx="10" ry="7"/><ellipse cx="96" cy="210" rx="15" ry="10"/><ellipse cx="150" cy="248" rx="12" ry="8"/><circle cx="170" cy="76" r="6"/><circle cx="68" cy="244" r="7"/></g>
  <g class="x-bubbles" fill="#fff" stroke="#9fd4ff" stroke-width="3"><circle cx="70" cy="60" r="16"/><circle cx="96" cy="46" r="12"/><circle cx="162" cy="52" r="15"/><circle cx="182" cy="76" r="10"/><circle cx="84" cy="200" r="17"/><circle cx="108" cy="190" r="11"/><circle cx="150" cy="206" r="16"/><circle cx="172" cy="232" r="11"/><circle cx="70" cy="250" r="12"/><circle cx="128" cy="258" r="14"/></g>
  <g class="o-hat"><path d="M78 64 Q80 14 120 14 Q160 14 162 64 Z" fill="#f5b86e" ${S}/><rect x="80" y="46" width="80" height="14" fill="#ff5c7a" stroke="#3a2a1f" stroke-width="4"/><ellipse cx="120" cy="64" rx="84" ry="17" fill="#f5b86e" ${S}/><circle cx="150" cy="50" r="8" fill="#ff5c7a" stroke="#3a2a1f" stroke-width="3.5"/></g>
  <g class="o-crown"><path d="M82 52 L88 16 L106 36 L120 10 L134 36 L152 16 L158 52 Z" fill="#ffc53d" ${S}/><circle cx="120" cy="36" r="6" fill="#ff5c8a"/><circle cx="98" cy="44" r="4.5" fill="#3aa0e8"/><circle cx="142" cy="44" r="4.5" fill="#5dbb63"/></g>
 </g>
 <g class="x-q"><circle cx="206" cy="40" r="24" fill="#fff" stroke="#3a2a1f" stroke-width="4"/><text x="206" y="52" text-anchor="middle" font-size="34" font-weight="800" fill="#3aa0e8" font-family="Baloo 2, sans-serif">?</text></g>
 <g class="x-zzz" fill="#3aa0e8" font-weight="800" font-family="Baloo 2, sans-serif" stroke="#fff" stroke-width="3" paint-order="stroke"><text class="z1" x="186" y="60" font-size="30">z</text><text class="z2" x="204" y="36" font-size="38">z</text><text class="z3" x="222" y="14" font-size="44">Z</text></g>
 <g class="x-hearts" fill="#ff5c8a" stroke="#3a2a1f" stroke-width="3"><path class="h1" d="M30 70 c-8-10 -24 0 -12 14 l12 12 12-12 c12-14 -4-24 -12-14z"/><path class="h2" d="M212 90 c-6-8 -18 0 -9 10 l9 9 9-9 c9-10 -3-18 -9-10z"/></g>
</svg>`;
  }

  /* Pillow sticker art (no emoji exists for it) */
  const PILLOW = `<svg viewBox="0 0 120 90" aria-hidden="true"><defs><linearGradient id="pl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#d7ecff"/></linearGradient></defs><path d="M14 20 Q60 4 106 20 Q118 45 106 70 Q60 86 14 70 Q2 45 14 20 Z" fill="url(#pl)" stroke="#3a2a1f" stroke-width="4" stroke-linejoin="round"/><path d="M30 46 Q60 36 90 46" stroke="#9fd0ff" stroke-width="5" fill="none" stroke-linecap="round"/><circle cx="36" cy="30" r="4" fill="#ffb8cc"/><circle cx="84" cy="62" r="4" fill="#ffb8cc"/></svg>`;

  return { friend, PILLOW, KINDS: Object.keys(K) };
})();
