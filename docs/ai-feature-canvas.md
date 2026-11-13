# AI Feature Canvas - Team 03 (Eco Home)

Status: design only. No AI model is implemented at this stage.

## Proposed AI feature
Energy-saving product finder

## Canvas
| Field | Team response |
|---|---|
| User and decision | A UK household shopper deciding which energy-saving products suit their home and budget. |
| Problem with the current process | Households face confusing product specifications and many energy-saving claims, so they struggle to identify which products suit their household, budget and circumstances. |
| Proposed AI output | A ranked shortlist of up to three products from our catalogue, each with a short reason for the match. |
| Inputs and data source | Shopper choices: main area (lighting, heating, appliances or water-saving), budget range, and optionally home type. Product data comes from our Supabase catalogue (name, category, description, price, stock). No names, accounts, orders or payment data. |
| Non-AI baseline | A category and maximum-price filter on the Products page. |
| Success measures | Four fixed fictional household profiles: normal, specific, vague and no-match. A suitable product should rank in the top three for the normal and specific cases. Vague and no-match cases should receive honest guidance. Results are compared with the baseline filter. |
| Integration point | A "Help me choose" step on the Products page. Normal browsing remains available. |
| Risks and controls | Misleading advice: show limitations and make no savings claims without a credible source. Bias toward expensive items: test across budget levels. Hidden ranking logic: show why each product was suggested. Privacy: use no personal data and send nothing sensitive to a public AI service. |

## Why AI may be appropriate
Shoppers describe needs in different ways and the catalogue contains many similar products, so ranking by fit may help beyond a simple filter.

## What the team must build first
A working catalogue with relevant products and the category and price filter. The AI feature is only considered after this baseline works.

## First evaluation idea
Run the four fictional household profiles against the baseline and record the expected product, the actual top three, and a pass or fail for each.
