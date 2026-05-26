export const schemesDB = [
  // --- CORE REGISTRATIONS ---
  {
    scheme_id: "udyam_01",
    name: "Udyam Registration",
    description: "Official MSME recognition. Required to unlock 90% of government subsidies and priority lending.",
    required_docs: ["Aadhaar", "PAN"],
    eligibility_rules: { allowed_states: ["ALL"], max_revenue_inr: 2500000000, business_stages: ["Idea Stage", "Existing Business"] }
  },
  {
    scheme_id: "gst_01",
    name: "GST Registration",
    description: "Mandatory tax registration for inter-state sales or businesses crossing the turnover threshold.",
    required_docs: ["Aadhaar", "PAN", "Proof of Business Address", "Bank Statement"],
    eligibility_rules: { allowed_states: ["ALL"], business_stages: ["Existing Business"] }
  },
  {
    scheme_id: "fssai_01",
    name: "FSSAI Basic Registration",
    description: "Mandatory food safety license for any business involving food preparation, packaging, or sales.",
    required_docs: ["Photo", "Govt ID", "Proof of Address"],
    eligibility_rules: { allowed_states: ["ALL"], max_revenue_inr: 1200000, business_stages: ["Idea Stage", "Existing Business"], specific_industries: ["Food & Beverage", "Agriculture"] }
  },
  {
    scheme_id: "startup_india_01",
    name: "Startup India (DPIIT Recognition)",
    description: "Unlocks 3-year tax holidays and easy public procurement for innovative, tech-driven businesses.",
    required_docs: ["Certificate of Incorporation", "Pitch Deck/Brief"],
    eligibility_rules: { allowed_states: ["ALL"], max_revenue_inr: 1000000000, business_stages: ["Existing Business"], specific_industries: ["Technology", "SaaS", "DeepTech", "E-commerce"] }
  },
  {
    scheme_id: "trade_license_01",
    name: "Municipal Trade License",
    description: "Local permission required to operate a physical shop or commercial establishment.",
    required_docs: ["ID Proof", "Property Tax Receipt", "Lease Agreement"],
    eligibility_rules: { allowed_states: ["ALL"], business_stages: ["Existing Business"], specific_industries: ["Retail", "Food & Beverage", "Manufacturing"] }
  },
  {
    scheme_id: "shg_nrlm_01",
    name: "SHG Membership (NRLM)",
    description: "National Rural Livelihoods Mission. Join a Self Help Group for pooled micro-credit and community investment.",
    required_docs: ["Aadhaar", "Local Resident Proof"],
    eligibility_rules: { allowed_states: ["ALL"], max_revenue_inr: 500000, business_stages: ["Idea Stage", "Existing Business"] }
  },

  // --- LOANS & MICROFINANCE ---
  {
    scheme_id: "mudra_shishu",
    name: "PMMY (Mudra Loan) - Shishu",
    description: "Micro-loans up to ₹50,000 for startups and micro businesses with zero collateral.",
    required_docs: ["Aadhaar", "Business Proof", "Bank Statement"],
    eligibility_rules: { allowed_states: ["ALL"], max_revenue_inr: 1000000, business_stages: ["Idea Stage", "Existing Business"] }
  },
  {
    scheme_id: "mudra_kishore",
    name: "PMMY (Mudra Loan) - Kishore",
    description: "Loans from ₹50,001 to ₹5 Lakhs for expanding existing micro enterprises.",
    required_docs: ["Aadhaar", "Udyam", "Bank Statement", "Project Report"],
    eligibility_rules: { allowed_states: ["ALL"], max_revenue_inr: 5000000, business_stages: ["Existing Business"] }
  },
  {
    scheme_id: "pmegp_01",
    name: "Prime Minister's Employment Generation Programme (PMEGP)",
    description: "Credit-linked subsidy scheme (up to 35% margin money) for setting up new micro-enterprises.",
    required_docs: ["Aadhaar", "Project Report", "Education Certificate", "Caste Certificate (if applicable)"],
    eligibility_rules: { allowed_states: ["ALL"], business_stages: ["Idea Stage"] }
  },
  {
    scheme_id: "standup_india",
    name: "Stand-Up India Scheme",
    description: "Bank loans between ₹10 Lakhs and ₹1 Crore for SC/ST or Women entrepreneurs setting up a greenfield enterprise.",
    required_docs: ["Aadhaar", "Caste Certificate", "Project Report", "Company Incorporation"],
    eligibility_rules: { allowed_states: ["ALL"], business_stages: ["Idea Stage"] } // Usually implies female or marginalized demographics, filtering broadly here.
  },
  {
    scheme_id: "cgtmse_01",
    name: "CGTMSE Collateral Free Loan",
    description: "Credit guarantees to banks so MSMEs can get loans up to ₹5 Crore without third-party guarantees.",
    required_docs: ["Udyam", "IT Returns", "Project Profile", "Bank Application"],
    eligibility_rules: { allowed_states: ["ALL"], business_stages: ["Existing Business"] }
  },

  // --- SECTOR SPECIFIC & STATE SPECIFIC ---
  {
    scheme_id: "pmfme_01",
    name: "PM Formalisation of Micro food processing Enterprises (PMFME)",
    description: "Provides 35% subsidy up to ₹10 Lakhs for micro food processing units to upgrade facilities.",
    required_docs: ["Aadhaar", "FSSAI", "Bank Statement", "Machinery Quotations"],
    eligibility_rules: { allowed_states: ["ALL"], business_stages: ["Existing Business"], specific_industries: ["Food & Beverage", "Agriculture"] }
  },
  {
    scheme_id: "karnataka_nekar",
    name: "Nekar Samman Yojana",
    description: "Financial assistance of ₹2,000 for handloom and powerloom weavers in Karnataka.",
    required_docs: ["Aadhaar", "Weaver ID", "Bank Details"],
    eligibility_rules: { allowed_states: ["Karnataka"], max_revenue_inr: 1000000, specific_industries: ["Textiles", "Artisan/Handicraft"] }
  },
  {
    scheme_id: "annapurna_yojana",
    name: "Annapurna Scheme",
    description: "Loans up to ₹50,000 for women entrepreneurs in food catering to buy utensils and equipment.",
    required_docs: ["Aadhaar", "Guarantor Details", "Business Plan"],
    eligibility_rules: { allowed_states: ["ALL"], max_revenue_inr: 2000000, specific_industries: ["Food & Beverage"] }
  },
  {
    scheme_id: "coir_udyami",
    name: "Coir Udyami Yojana",
    description: "Credit-linked subsidy (40%) for setting up coir manufacturing units.",
    required_docs: ["Aadhaar", "Title Deed", "Coir Board Registration"],
    eligibility_rules: { allowed_states: ["Kerala", "Karnataka", "Tamil Nadu", "Andhra Pradesh"], specific_industries: ["Agriculture", "Manufacturing"] }
  },
  {
    scheme_id: "msme_samadhaan",
    name: "MSME Samadhaan (Delayed Payments)",
    description: "Empowers micro and small entrepreneurs to file cases regarding delayed payments from buyers.",
    required_docs: ["Udyam", "Invoices", "Purchase Orders"],
    eligibility_rules: { allowed_states: ["ALL"], business_stages: ["Existing Business"] }
  },
  {
    scheme_id: "zed_certification",
    name: "ZED Certification Scheme",
    description: "Subsidy on the cost of certification to encourage MSMEs to manufacture zero-defect products.",
    required_docs: ["Udyam", "Quality Manuals"],
    eligibility_rules: { allowed_states: ["ALL"], business_stages: ["Existing Business"], specific_industries: ["Manufacturing"] }
  },
  {
    scheme_id: "aspire_01",
    name: "ASPIRE Scheme",
    description: "Promotes innovation and rural entrepreneurship through Livelihood Business Incubators.",
    required_docs: ["Aadhaar", "Incubation Application"],
    eligibility_rules: { allowed_states: ["ALL"], business_stages: ["Idea Stage"], specific_industries: ["Agriculture", "Artisan/Handicraft"] }
  },
  {
    scheme_id: "mahila_samriddhi",
    name: "Mahila Samriddhi Yojana",
    description: "Micro-finance up to ₹1,40,000 for women entrepreneurs from backward classes.",
    required_docs: ["Aadhaar", "Income Certificate", "Caste Certificate"],
    eligibility_rules: { allowed_states: ["ALL"], max_revenue_inr: 300000, business_stages: ["Idea Stage", "Existing Business"] }
  },
  {
    scheme_id: "acabc_01",
    name: "Agri-Clinics and Agri-Business Centres (ACABC)",
    description: "Subsidized loans for agricultural graduates setting up agri-clinics or business centers.",
    required_docs: ["Degree Certificate", "Project Report", "Aadhaar"],
    eligibility_rules: { allowed_states: ["ALL"], specific_industries: ["Agriculture"] }
  }
];