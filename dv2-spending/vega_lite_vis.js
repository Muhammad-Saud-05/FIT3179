var vg_1 = "chart1_total_spending_line.vg.json";
var vg_2 = "chart2_spending_shares_radial.vg.json";
var vg_3 = "chart3_category_rank_bump.vg.json";
var vg_4 = "chart4_category_stream.vg.json";


var embed_options = { actions: false };

vegaEmbed("#chart1", vg_1, embed_options).then(function(result) {
  // Access the Vega view instance (https://vega.github.io/vega/docs/api/view/) as result.view
}).catch(console.error);

vegaEmbed("#chart2", vg_2, embed_options).then(function(result) {
}).catch(console.error);

vegaEmbed("#chart3", vg_3, embed_options).then(function(result) {
}).catch(console.error);

vegaEmbed("#chart4", vg_4, embed_options).then(function(result) {
}).catch(console.error);