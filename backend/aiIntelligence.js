const stringSimilarity = require("string-similarity");

// AI Knowledge Base: Unified Indian and Global Power-Grid
const COMPANY_KNOWLEDGE_BASE = [
  "Google", "Amazon", "Microsoft", "Meta", "Apple", "Netflix", "Adobe", "Tesla", "Uber", "Ola", "Zomato", "Swiggy", "Flipkart", "TCS", "Infosys", "Wipro", "HCL Technologies", "Tech Mahindra", "Accenture", "Cognizant", "Capgemini", "LTI Mindtree", "IBM India", "Oracle India", "Intel", "Nvidia", "Adobe India", "Salesforce", "Atlassian", "Slack", "Discord", "Pinterest", "Twitter", "Snap", "LinkedIn", "GitHub", "GitLab", "Docker", "Kubernetes", "Snowflake", "Databricks", "Tableau", "Power BI", "Salesforce", "HubSpot", "Zendesk", "Zoom", "Twilio", "Stripe", "PayPal", "Square", "Adyen", "Razorpay", "PhonePe", "Paytm", "BharatPe", "Cred", "Meesho", "Byjus", "Unacademy", "Zomato", "Swiggy", "Zepto", "Blinkit", "Dunzo", "Ola Electric", "Ather Energy", "Tata Motors", "Mahindra & Mahindra", "Reliance Industries", "Jio", "Airtel", "Adani Group", "Aditya Birla Group", "HDFC Bank", "ICICI Bank", "SBI", "Axis Bank", "Kotak Mahindra Bank", "Bajaj Finance", "L&T", "ITC", "HUL", "Asian Paints", "Pidilite", "Titan", "Tanishq", "Nykaa", "Mamaearth", "Sugar Cosmetics", "Lenskart", "FirstCry", "Boat", "Noise", "Urban Company", "MakeMyTrip", "Goibibo", "Cleartrip", "Ixigo", "Airbnb", "Booking.com", "Expedia", "Tripadvisor", "Yelp", "Zomato", "Dineout", "EazyDiner", "InMobi", "Dailyhunt", "ShareChat", "Moj", "Josh", "TakaTak", "Roposo", "Glance", "VerSe Innovation", "Pine Labs", "BillDesk", "Mswipe", "BharatPe", "PostPe", "Jupiter", "Fi Money", "Niyo", "Rupifi", "Khatabook", "OkCredit", "Vyapar", "Zoho", "Freshworks", "Chargebee", "HighRadius", "Zenoti", "Icertis", "Druva", "Postman", "BrowserStack", "LambdaTest", "Hasura", "Apollo.io", "LeadSquared", "Darwinbox", "Keka", "GreytHR", "BetterPlace", "Apna", "Naukri", "Indeed", "Monster India", "Shine", "LinkedIn", "Internshala", "Unstop", "GeeksforGeeks", "Coding Ninjas", "Scalar", "UpGrad", "Simplilearn", "Great Learning", "Coursera", "Udemy", "edX", "Udacity", "Pluralsight", "LinkedIn Learning", "Khan Academy", "BYJU'S", "Vedantu", "Toppr", "Cuemath", "WhiteHat Jr", "Physics Wallah", "Unacademy", "Prepladder", "WifiStudy", "ExamPuri", "Testbook", "Gradeup", "Adda247", "Sarkari Result", "Career Launcher", "T.I.M.E.", "Aakash Institute", "Allen Career Institute", "FIITJEE", "Resonance", "Vibrant Academy", "Bansal Classes", "MRI Software", "Epic Systems", "Cerner", "AthenaHealth", "Modernizing Medicine", "Allscripts", "NextGen", "CureMD", "Practice Fusion", "Kareo", "AdvancedMD"
];

const ROLE_KNOWLEDGE_BASE = [
  "Software Engineer", "Full Stack Developer", "Frontend Developer", "Backend Developer", "DevOps Engineer", "Cloud Engineer", "Cloud Solutions Architect", "SRE", "Platform Engineer", "Data Scientist", "Data Analyst", "Data Engineer", "Machine Learning Engineer", "AI Architect", "AI Engineer", "Deep Learning Engineer", "NLP Engineer", "Computer Vision Engineer", "QA Automation Engineer", "SDET", "Systems Engineer", "Security Engineer", "Cybersecurity Analyst", "Blockchain Developer", "Smart Contract Developer", "Game Developer", "Unity Developer", "Unreal Engine Developer", "Mobile Developer", "Android Developer", "iOS Developer", "React Native Developer", "Flutter Developer", "UX Designer", "UI Designer", "Product Designer", "Product Manager", "Project Manager", "Program Manager", "Scrum Master", "Agile Coach", "Business Analyst", "Marketing Manager", "Sales Executive", "Customer Success Manager", "HR Generalist", "Recruiter", "Accountant", "Financial Analyst", "Graphic Designer", "Content Writer", "Copywriter", "SEO Specialist", "Social Media Manager", "Growth Hacker"
];

/**
 * Probabilistic Prediction Engine (AI-like)
 */
const predictJobDetails = (rawText, url = "") => {
  console.log(`[AI Model] Received Raw Text (Length: ${rawText.length}) from URL: ${url}`);
  
  const metaHub = {
    title: "",
    company: "",
    location: "",
    confidence: 0
  };

  const lowUrl = (url || "").toLowerCase();
  
  // 1. Metadata Verification (Highest Trust)
  const ogTitleMatch = rawText.match(/(?:PAGE_)?TITLE:\s*(.*?)(?:\n|$)/i);
  const ogTitle = ogTitleMatch ? ogTitleMatch[1] : "";

  if (ogTitle) {
    console.log(`[AI Model] Metadata Found: ${ogTitle}`);
    
    // Pattern 1: Google hiring Software Engineer in Bengaluru | LinkedIn
    const fullHiringMatch = ogTitle.match(/^(.*?)\s+hiring\s+(.*?)\s+in\s+(.*?)(?:\s+\||$)/i);
    // Pattern 2: Infosys hiring IT Consulting
    const simpleHiringMatch = ogTitle.match(/^(.*?)\s+hiring\s+(.*?)(?:\s+\||$)/i);
    // Pattern 3: Software Engineer at Google | LinkedIn
    const atMatch = ogTitle.match(/^(.*?)\s+at\s+(.*?)(?:\s+\||$)/i);
    
    if (fullHiringMatch) {
      metaHub.company = fullHiringMatch[1].trim();
      metaHub.title = fullHiringMatch[2].trim();
      metaHub.location = fullHiringMatch[3].trim();
      metaHub.confidence = 95;
    } else if (simpleHiringMatch) {
      metaHub.company = simpleHiringMatch[1].trim();
      metaHub.title = simpleHiringMatch[2].trim();
      metaHub.confidence = 90;
    } else if (atMatch) {
      metaHub.title = atMatch[1].trim();
      metaHub.company = atMatch[2].trim();
      metaHub.confidence = 90;
    } else {
      const parts = ogTitle.split(/\s+at\s+|\s+\|\s+|\s+-\s+/i);
      if (parts.length >= 2) {
        metaHub.title = parts[0].trim();
        metaHub.company = parts[1].trim();
        metaHub.confidence = 70;
      } else {
        // Fallback: If no clear separator, check if 'hiring' was matched at all
        metaHub.title = ogTitle.trim();
        metaHub.confidence = 50;
      }
    }
  }

  // 2. URL Domain Prediction (Safety Check)
  if (!metaHub.company || metaHub.confidence < 80) {
    if (lowUrl.includes("amazon.jobs")) metaHub.company = "Amazon";
    else if (lowUrl.includes("careers.google.com")) metaHub.company = "Google";
    else if (lowUrl.includes("metacareers.com")) metaHub.company = "Meta";
    else if (lowUrl.includes("microsoft.com/en-us/us-jobs")) metaHub.company = "Microsoft";
    if (metaHub.company) metaHub.confidence = Math.max(metaHub.confidence, 60);
  }

  // 3. Knowledge-Driven Body Prediction (Direct Hit + Fuzzy Matching)
  // CRITICAL: Prioritize the first 1000 characters for primary identity
  const identityText = rawText.slice(0, 1000);
  const identityLow = identityText.toLowerCase();
  
  if (!metaHub.company || metaHub.confidence < 90) {
    // Step 3a: Multi-Hit Brand Analysis (Find all mentioned companies)
    const mentions = [];
    for (const c of COMPANY_KNOWLEDGE_BASE) {
      const regex = new RegExp(`\\b${c}\\b`, 'gi');
      const matches = identityText.match(regex);
      if (matches) {
        mentions.push({ 
          name: c, 
          count: matches.length, 
          isAtStart: identityText.toLowerCase().indexOf(c.toLowerCase()) < 200 
        });
      }
    }

    if (mentions.length > 0) {
      // Prioritize: 1. Presence in OG Title, 2. Presence at start of text, 3. Frequency
      // Sort: isAtStart (desc), count (desc)
      mentions.sort((a, b) => (b.isAtStart - a.isAtStart) || (b.count - a.count));
      
      const winner = mentions[0];
      metaHub.company = winner.name;
      metaHub.confidence = winner.isAtStart ? 100 : 80;
      console.log(`[AI Model] Brand Analysis Winner: ${winner.name} (Matches: ${winner.count}, Priority: ${winner.isAtStart})`);
    }

    // Step 3b: Fuzzy Match Fallback (Only if no direct hits found)
    if (!metaHub.company) {
      const matches = stringSimilarity.findBestMatch(identityLow, COMPANY_KNOWLEDGE_BASE.map(c => c.toLowerCase()));
      const bestMatch = matches.bestMatch;
      console.log(`[AI Model] Body Company Fuzzy Match: ${bestMatch.target} (Score: ${bestMatch.rating})`);

      if (bestMatch.rating > 0.45) {
         const properCase = COMPANY_KNOWLEDGE_BASE.find(c => c.toLowerCase() === bestMatch.target);
         metaHub.company = properCase;
         metaHub.confidence = Math.round(bestMatch.rating * 100);
      }
    }
  }

  if (!metaHub.title || metaHub.title.length < 5 || metaHub.title.includes("Unknown Title")) {
     // Step 3c: Direct Role Hit
     for (const r of ROLE_KNOWLEDGE_BASE) {
       const regex = new RegExp(`\\b${r.replace(/\s+/g, '\\s+')}\\b`, 'i');
       if (regex.test(identityText)) {
         metaHub.title = r;
         console.log(`[AI Model] Direct Hit Role: ${r}`);
         break;
       }
     }

     if (!metaHub.title) {
       const roleMatches = stringSimilarity.findBestMatch(identityLow, ROLE_KNOWLEDGE_BASE.map(r => r.toLowerCase()));
       const bestRole = roleMatches.bestMatch;
       console.log(`[AI Model] Body Role Fuzzy Match: ${bestRole.target} (Score: ${bestRole.rating})`);
       if (bestRole.rating > 0.35) {
          const properRole = ROLE_KNOWLEDGE_BASE.find(r => r.toLowerCase() === bestRole.target);
          metaHub.title = properRole;
       }
     }
  }

  // Final Professional Filtering
  if (metaHub.title) {
    metaHub.title = metaHub.title
      .replace(/\(.*\)/g, "")
      .replace(/ hiring /i, "")
      .replace(/ \| LinkedIn/i, "")
      .trim();
  }

  console.log(`[AI Model] Final Prediction -> Company: ${metaHub.company}, Title: ${metaHub.title}, Confidence: ${metaHub.confidence}%`);
  return metaHub;
};

module.exports = { predictJobDetails, COMPANY_KNOWLEDGE_BASE, ROLE_KNOWLEDGE_BASE };
