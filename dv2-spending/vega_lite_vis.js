// Same idea as the course guide (Section 1.3, Step 2): one variable per chart file,
// then vegaEmbed puts each chart into the element with the matching id.
var vg_1 = "chart1_total_spending_line.vg.json";
var vg_2 = "chart2_spending_shares_radial.vg.json";
var vg_3 = "chart3_category_rank_bump.vg.json";
var vg_4 = "chart4_category_stream.vg.json";
var vg_5 = "chart5_category_change_heatmap.vg.json";
var vg_6 = "chart6_growth_choropleth.vg.json";
var vg_7 = "chart7_spending_symbol_map.vg.json";
var vg_8 = "chart8_dollars_added_dorling.vg.json";
var vg_9 = "chart9_state_profiles_radar.vg.json";
var vg_10 = "chart10_share_change_butterfly.vg.json";
var vg_11 = "chart11_december_effect_lollipop.vg.json";
var vg_12 = "chart12_wants_share_waffle.vg.json";

var specs = [vg_1, vg_2, vg_3, vg_4, vg_5, vg_6, vg_7, vg_8, vg_9, vg_10, vg_11, vg_12];

// Not in the guide text: actions:false hides the small "..." menu on each chart.
var embed_options = { actions: false };

// ---- Special feature 1: one place to set the typefaces for all 12 charts --------------
// The chart files still say "Arial". Before drawing, this script reads each file, swaps in
// the page's two typefaces (headings: Fraunces, everything else: Source Sans 3) and then
// draws it. The JSON files in the repository are unchanged and stay readable.
var FONT_TEXT = '"Source Sans 3", "Helvetica Neue", Arial, sans-serif';
var FONT_TITLE = '"Fraunces", Georgia, "Times New Roman", serif';

// ---- Special feature 3: keep text lines short, as the Week 4 readability rules ask --------
// The lecture rule is about 60 characters (7 to 10 words) a line. Chart titles and subtitles
// are re-broken here so no line is longer than that, whatever the chart file says. Each
// subtitle sentence stays its own paragraph. Change these two numbers to loosen the rule.
var TITLE_MAX = 56;     // 18 px headline lines
var SUBTITLE_MAX = 64;  // 12 px subtitle lines

function wrapText(text, max) {
  var words = String(text).split(/\s+/).filter(Boolean);
  var lines = [], current = "";
  words.forEach(function (word) {
    var next = current ? current + " " + word : word;
    if (current && next.length > max) { lines.push(current); current = word; }
    else { current = next; }
  });
  if (current) { lines.push(current); }
  // Avoid a short last line (a "widow"): share the last two lines evenly instead.
  var n = lines.length;
  if (n > 1 && lines[n - 1].length < max * 0.4) {
    var both = (lines[n - 2] + " " + lines[n - 1]).split(" ");
    var half = Math.ceil((both.join(" ").length) / 2), first = "";
    while (both.length && (first + " " + both[0]).trim().length <= half + 6) {
      first = (first + " " + both.shift()).trim();
    }
    if (both.length) { lines.splice(n - 2, 2, first, both.join(" ")); }
  }
  return lines;
}

function wrapTitles(spec) {
  var t = spec.title;
  if (!t) { return spec; }
  if (typeof t === "string") { t = { text: t }; }
  var headline = Array.isArray(t.text) ? t.text.join(" ") : t.text;
  t.text = wrapText(headline, TITLE_MAX);
  if (t.subtitle) {
    var parts = Array.isArray(t.subtitle) ? t.subtitle : [t.subtitle];
    t.subtitle = [].concat.apply([], parts.map(function (part) { return wrapText(part, SUBTITLE_MAX); }));
  }
  spec.title = t;
  return spec;
}

function applyPageFonts(spec) {
  spec.config = spec.config || {};
  spec.config.font = FONT_TEXT;
  spec.config.title = Object.assign({}, spec.config.title, {
    font: FONT_TITLE,
    fontWeight: 600,
    subtitleFont: FONT_TEXT
  });
  return spec;
}

// ---- Special feature 2: wait for the fonts before drawing -----------------------------
// Charts measure their text when they are drawn. If the fonts arrive late, labels can be
// measured with the wrong font. We wait (at most 4 seconds) for the fonts to load first.
function fontsReady() {
  if (!document.fonts || !document.fonts.load) { return Promise.resolve(); }
  var loading = Promise.all([
    document.fonts.load('400 12px "Source Sans 3"'),
    document.fonts.load('600 12px "Source Sans 3"'),
    document.fonts.load('700 12px "Source Sans 3"'),
    document.fonts.load('600 18px "Fraunces"')
  ]);
  var timeout = new Promise(function (resolve) { setTimeout(resolve, 4000); });
  return Promise.race([loading, timeout]).catch(function () {});
}

function drawChart(i) {
  var target = "#chart" + (i + 1);
  return fetch(specs[i])
    .then(function (response) {
      if (!response.ok) { throw new Error(specs[i] + " returned " + response.status); }
      return response.json();
    })
    .then(function (spec) { return vegaEmbed(target, wrapTitles(applyPageFonts(spec)), embed_options); })
    .then(function (result) {
      // Access the Vega view instance (https://vega.github.io/vega/docs/api/view/) as result.view
    })
    .catch(function (error) {
      console.error(specs[i], error);
      var holder = document.querySelector(target);
      if (holder) {
        holder.innerHTML = '<p class="chart-error">This chart could not be loaded (' + specs[i] + '). See the browser console.</p>';
      }
    });
}

fontsReady().then(function () {
  for (var i = 0; i < specs.length; i++) { drawChart(i); }
});