// LinkedIn exports contain no years-of-experience, so YOE is estimated from the title unless the CSV has a YOE column.
const AI = /\b(ai|ml|machine learning|deep learning|data scien\w*|nlp|llm|genai|gen ai|generative|computer vision|mlops|artificial intelligence|research scientist|applied scientist)\b/i;
const PRODUCT = /\b(google|microsoft|amazon|aws|meta|apple|netflix|adobe|salesforce|oracle|sap|uber|flipkart|swiggy|zomato|phonepe|razorpay|paytm|atlassian|nvidia|openai|anthropic|intuit|linkedin|walmart|cisco|vmware|servicenow|workday|freshworks|zoho|cred|meesho|myntra|databricks|snowflake|stripe|shopify|samsung|intel|qualcomm|ola|playpower|guidewire|postman|browserstack|chargebee|dream11|groww|zerodha|sprinklr|thoughtspot)\b/i;
const DOMAINS = [['AI / ML', AI], ['Data & Analytics', /\b(data|analytics|bi|etl)\b/i], ['Cloud & DevOps', /cloud|devops|\bsre\b|infrastructure|platform/i],
  ['Security', /security|cyber/i], ['Product & Design', /\b(product|design|ux)\b/i],
  ['Leadership', /\b(ceo|cto|coo|cxo|founder|co-founder|chief|vp|vice president|president|director|head)\b/i],
  ['Talent / HR', /recruit|talent|\bhr\b|human resources/i], ['Software Engineering', /engineer|developer|architect|programmer|\bsde\b|software|consultant/i]];
const domainOf = t => (DOMAINS.find(([, r]) => r.test(t)) || ['Other'])[0];
const bandOf = y => y >= 10 ? '10+' : y >= 8 ? '8-10' : y >= 6 ? '6-8' : y >= 5 ? '5-6' : '<5';
function estimate(t) {
  if (/\b(chief|ceo|cto|cxo|founder|president|vp|vice president|head|director)\b/i.test(t)) return 12;
  if (/principal|staff|architect|senior manager|distinguished|fellow/i.test(t)) return 9;
  if (/senior|\bsr\b|lead|manager/i.test(t)) return 6.5;
  if (/intern|trainee|junior|graduate|fresher|student/i.test(t)) return 1;
  return /engineer|scientist|developer|analyst|consultant/i.test(t) ? 3 : 2;
}
exports.classify = x => {
  const pos = (x.position || '').trim(), g = parseFloat(x.yoe), y = isNaN(g) ? estimate(pos) : g, d = new Date(x.connected);
  const on = isNaN(d) ? null : `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  return { name: (x.name || '').trim(), url: /^https?:\/\//i.test(x.url || '') ? x.url.trim() : '', email: (x.email || '').trim(),
    company: (x.company || '').trim(), position: pos, on, yoe: y, src: isNaN(g) ? 'estimated' : 'provided', band: bandOf(y),
    domain: domainOf(pos), ai: AI.test(pos), prod: PRODUCT.test(x.company || '') };
};