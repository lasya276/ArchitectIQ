/**
 * ArchitectIQ Requirement Discovery Wizard — Step Configuration
 *
 * This file is the single source of truth for all wizard steps and questions.
 * Add, remove, or reorder fields here without touching the wizard engine.
 */

export type FieldType =
  | 'short-text'
  | 'long-text'
  | 'single-choice'
  | 'multi-choice'
  | 'tag-input'
  | 'dynamic-list';

export type MoscowPriority = 'must_have' | 'should_have' | 'could_have' | 'wont_have';

export interface ChoiceOption {
  value: string;
  label: string;
  icon?: string;
}

export interface FieldConfig {
  id: string;           // Maps to WizardAnswers key
  type: FieldType;
  label: string;
  placeholder?: string;
  helperText?: string;
  options?: ChoiceOption[];
  required?: boolean;
  allowOther?: boolean; // Add custom "Other" option
}

export interface StepConfig {
  id: string;
  stepNumber: number;
  title: string;
  subtitle: string;
  icon: string;         // Lucide icon name (string) — resolved in WizardStep
  fields: FieldConfig[];
}

export const WIZARD_STEPS: StepConfig[] = [
  // ─── Step 1: Project Information ──────────────────────────────────────────
  {
    id: 'project_info',
    stepNumber: 1,
    title: 'Project Information',
    subtitle: 'Start with the basics — name, description, and project category.',
    icon: 'Layers',
    fields: [
      {
        id: 'project_name',
        type: 'short-text',
        label: 'Project Name',
        placeholder: 'e.g., E-Commerce Microservices Platform',
        helperText: 'Choose a clear, descriptive name for your project.',
        required: true,
      },
      {
        id: 'project_description',
        type: 'long-text',
        label: 'Short Description',
        placeholder: 'Describe what this project does and its primary purpose...',
        helperText: 'A 1–3 sentence overview of the project scope.',
        required: false,
      },
      {
        id: 'project_category',
        type: 'single-choice',
        label: 'Project Category',
        helperText: 'Select the category that best describes this software project.',
        required: true,
        options: [
          { value: 'web_application', label: 'Web Application' },
          { value: 'mobile_application', label: 'Mobile Application' },
          { value: 'desktop_application', label: 'Desktop Application' },
          { value: 'ai_application', label: 'AI Application' },
          { value: 'api', label: 'API / Backend Service' },
          { value: 'saas', label: 'SaaS Platform' },
          { value: 'enterprise_software', label: 'Enterprise Software' },
          { value: 'other', label: 'Other' },
        ],
      },
    ],
  },

  // ─── Step 2: Industry ─────────────────────────────────────────────────────
  {
    id: 'industry',
    stepNumber: 2,
    title: 'Industry Domain',
    subtitle: 'Which industry will this software primarily serve?',
    icon: 'Building2',
    fields: [
      {
        id: 'industry',
        type: 'single-choice',
        label: 'Select Industry',
        helperText: 'Selecting the right domain helps generate relevant architectural patterns.',
        required: true,
        options: [
          { value: 'healthcare', label: 'Healthcare' },
          { value: 'finance', label: 'Finance & Banking' },
          { value: 'insurance', label: 'Insurance' },
          { value: 'education', label: 'Education & E-Learning' },
          { value: 'retail', label: 'Retail & E-Commerce' },
          { value: 'hr', label: 'Human Resources' },
          { value: 'manufacturing', label: 'Manufacturing' },
          { value: 'government', label: 'Government & Public Sector' },
          { value: 'logistics', label: 'Logistics & Supply Chain' },
          { value: 'transportation', label: 'Transportation & Mobility' },
          { value: 'travel_hospitality', label: 'Travel & Hospitality' },
          { value: 'entertainment', label: 'Entertainment & Media' },
          { value: 'real_estate', label: 'Real Estate' },
          { value: 'telecom', label: 'Telecommunications' },
          { value: 'software_saas', label: 'Software & SaaS' },
          { value: 'information_technology', label: 'Information Technology' },
          { value: 'cybersecurity', label: 'Cybersecurity' },
          { value: 'energy_utilities', label: 'Energy & Utilities' },
          { value: 'automotive', label: 'Automotive' },
          { value: 'agriculture', label: 'Agriculture & AgTech' },
          { value: 'food_restaurant', label: 'Food & Restaurant' },
          { value: 'legal', label: 'Legal & LegalTech' },
          { value: 'construction', label: 'Construction' },
          { value: 'sports_fitness', label: 'Sports & Fitness' },
          { value: 'pharmaceutical', label: 'Pharmaceutical & Life Sciences' },
          { value: 'nonprofit', label: 'Nonprofit & Social Impact' },
          { value: 'marketing_advertising', label: 'Marketing & Advertising' },
          { value: 'professional_services', label: 'Professional Services' },
          { value: 'research_science', label: 'Research & Science' },
          { value: 'gaming', label: 'Gaming' },
          { value: 'other', label: 'Other' },
        ],
      },
    ],
  },

  // ─── Step 3: Target Users ─────────────────────────────────────────────────
  {
    id: 'target_users',
    stepNumber: 3,
    title: 'Target Users',
    subtitle: 'Who will use this system? Select all roles that apply.',
    icon: 'Users',
    fields: [
      {
        id: 'target_users',
        type: 'multi-choice',
        label: 'User Roles',
        helperText: 'Select all user types that will interact with the system.',
        required: true,
        options: [
          { value: 'administrator', label: 'Administrator' },
          { value: 'customer', label: 'Customer / End User' },
          { value: 'employee', label: 'Employee' },
          { value: 'manager', label: 'Manager' },
          { value: 'executive', label: 'Executive / Leadership' },
          { value: 'student', label: 'Student' },
          { value: 'teacher', label: 'Teacher / Instructor' },
          { value: 'doctor', label: 'Doctor / Clinician' },
          { value: 'patient', label: 'Patient' },
          { value: 'vendor', label: 'Vendor / Supplier' },
          { value: 'partner', label: 'Business Partner' },
          { value: 'guest', label: 'Guest / Public User' },
          { value: 'analyst', label: 'Analyst' },
          { value: 'developer', label: 'Developer' },
          { value: 'support_agent', label: 'Support Agent' },
          { value: 'operator', label: 'Operator' },
          { value: 'accountant', label: 'Accountant / Finance User' },
          { value: 'sales', label: 'Sales / Business User' },
          { value: 'marketing', label: 'Marketing User' },
          { value: 'hr', label: 'HR / Recruiter' },
          { value: 'auditor', label: 'Auditor / Compliance User' },
          { value: 'researcher', label: 'Researcher' },
          { value: 'moderator', label: 'Moderator' },
          { value: 'content_creator', label: 'Content Creator' },
          { value: 'other', label: 'Other' },
        ],
      },
    ],
  },

  // ─── Step 4: Business Objectives ─────────────────────────────────────────
  {
    id: 'business_objectives',
    stepNumber: 4,
    title: 'Business Objectives',
    subtitle: 'What business goals should this project achieve?',
    icon: 'Target',
    fields: [
      {
        id: 'business_objectives',
        type: 'multi-choice',
        label: 'Select Objectives',
        helperText: 'Select all business outcomes this project must deliver.',
        required: true,
        options: [
          { value: 'productivity', label: 'Increase Productivity' },
          { value: 'manual_work', label: 'Reduce Manual Work' },
          { value: 'customer_experience', label: 'Improve Customer Experience' },
          { value: 'digital_transformation', label: 'Digital Transformation' },
          { value: 'process_automation', label: 'Process Automation' },
          { value: 'analytics', label: 'Analytics & Insights' },
          { value: 'reporting', label: 'Reporting & Dashboards' },
          { value: 'cost_reduction', label: 'Cost Reduction' },
          { value: 'revenue_growth', label: 'Revenue Growth' },
          { value: 'market_expansion', label: 'Market Expansion' },
          { value: 'customer_retention', label: 'Customer Retention' },
          { value: 'operational_efficiency', label: 'Operational Efficiency' },
          { value: 'decision_support', label: 'Better Decision Making' },
          { value: 'innovation', label: 'Product / Service Innovation' },
          { value: 'risk_reduction', label: 'Risk Reduction' },
          { value: 'security_improvement', label: 'Improve Security' },
          { value: 'compliance', label: 'Regulatory Compliance' },
          { value: 'collaboration', label: 'Improve Team Collaboration' },
          { value: 'scalability', label: 'Enable Business Scalability' },
          { value: 'business_continuity', label: 'Business Continuity' },
          { value: 'personalization', label: 'Personalized User Experience' },
          { value: 'data_centralization', label: 'Centralize Data' },
          { value: 'self_service', label: 'Enable Self-Service' },
          { value: 'other', label: 'Other' },
        ],
      },
    ],
  },

  // ─── Step 5: Platform Requirements ───────────────────────────────────────
  {
    id: 'platforms',
    stepNumber: 5,
    title: 'Platform Requirements',
    subtitle: 'Which platforms must this software support?',
    icon: 'Monitor',
    fields: [
      {
        id: 'platforms',
        type: 'multi-choice',
        label: 'Deployment Platforms',
        helperText: 'Select all platforms where the software will be accessible.',
        required: true,
        options: [
          { value: 'web', label: 'Web Application' },
          { value: 'ios', label: 'iOS' },
          { value: 'android', label: 'Android' },
          { value: 'windows', label: 'Windows Desktop' },
          { value: 'macos', label: 'macOS Desktop' },
          { value: 'linux', label: 'Linux Desktop' },
          { value: 'rest_graphql_api', label: 'REST / GraphQL API' },
          { value: 'cross_platform', label: 'Cross-Platform Application' },
          { value: 'cloud_saas', label: 'Cloud SaaS' },
          { value: 'cli', label: 'CLI / Command Line' },
          { value: 'browser_extension', label: 'Browser Extension' },
          { value: 'smart_tv', label: 'Smart TV / TV Platform' },
          { value: 'wearable', label: 'Wearable Device' },
          { value: 'iot_embedded', label: 'IoT / Embedded Device' },
        ],
      },
    ],
  },

  // ─── Step 6: Project Scale ────────────────────────────────────────────────
  {
    id: 'project_scale',
    stepNumber: 6,
    title: 'Project Scale & Context',
    subtitle: 'Tell us about the expected size, timeline, and priorities.',
    icon: 'BarChart3',
    fields: [
      {
        id: 'expected_users',
        type: 'single-choice',
        label: 'Expected Number of Users',
        helperText: 'Estimated concurrent or total users at launch.',
        required: false,
        options: [
          { value: '1_50', label: '1 – 50 users' },
          { value: '50_500', label: '50 – 500 users' },
          { value: '500_5000', label: '500 – 5,000 users' },
          { value: '5000_50000', label: '5,000 – 50,000 users' },
          { value: '50000_plus', label: '50,000+ users' },
        ],
      },
      {
        id: 'timeline',
        type: 'single-choice',
        label: 'Delivery Timeline',
        helperText: 'Target timeline from kickoff to initial production release.',
        required: false,
        options: [
          { value: 'less_1m', label: 'Less than 1 month' },
          { value: '1_3m', label: '1 – 3 months' },
          { value: '3_6m', label: '3 – 6 months' },
          { value: '6_12m', label: '6 – 12 months' },
          { value: '12m_plus', label: 'More than 12 months' },
        ],
      },
      {
        id: 'budget',
        type: 'single-choice',
        label: 'Budget Range',
        helperText: 'Approximate project budget.',
        required: false,
        options: [
          { value: 'under_10k', label: 'Under $10,000' },
          { value: '10k_50k', label: '$10,000 – $50,000' },
          { value: '50k_200k', label: '$50,000 – $200,000' },
          { value: '200k_1m', label: '$200,000 – $1,000,000' },
          { value: '1m_plus', label: '$1,000,000+' },
          { value: 'not_disclosed', label: 'Prefer not to disclose' },
        ],
      },
      {
        id: 'team_size',
        type: 'single-choice',
        label: 'Development Team Size',
        helperText: 'Number of engineers building this project.',
        required: false,
        options: [
          { value: '1', label: 'Solo (1 person)' },
          { value: '2_5', label: 'Small (2 – 5 people)' },
          { value: '6_15', label: 'Medium (6 – 15 people)' },
          { value: '16_50', label: 'Large (16 – 50 people)' },
          { value: '50_plus', label: 'Enterprise (50+ people)' },
        ],
      },
      {
        id: 'priority',
        type: 'single-choice',
        label: 'Top Priority',
        helperText: 'What matters most for this project?',
        required: false,
        options: [
          { value: 'speed', label: 'Speed to Market' },
          { value: 'quality', label: 'Code Quality & Reliability' },
          { value: 'scalability', label: 'Scalability' },
          { value: 'cost', label: 'Cost Efficiency' },
          { value: 'security', label: 'Security & Compliance' },
          { value: 'ux', label: 'User Experience' },
        ],
      },
      {
        id: 'business_size',
        type: 'single-choice',
        label: 'Organisation Size',
        helperText: 'Size of the organisation commissioning this project.',
        required: false,
        options: [
          { value: 'startup', label: 'Startup' },
          { value: 'small', label: 'Small Business (< 50 employees)' },
          { value: 'medium', label: 'Medium Business (50 – 500 employees)' },
          { value: 'enterprise', label: 'Enterprise (500+ employees)' },
        ],
      },
    ],
  },

  // ─── Step 7: Functional Requirements ─────────────────────────────────────
  {
    id: 'functional_requirements',
    stepNumber: 7,
    title: 'Functional Requirements',
    subtitle: 'List the features and capabilities the system must provide. Prioritise with MoSCoW.',
    icon: 'ListChecks',
    fields: [
      {
        id: 'functional_requirements',
        type: 'dynamic-list',
        label: 'Requirements',
        helperText: 'Add each feature/function. Set priority using MoSCoW: Must Have → Should Have → Could Have → Won\'t Have.',
        required: false,
      },
    ],
  },

  // ─── Step 8: Non-Functional Requirements ─────────────────────────────────
  {
    id: 'non_functional_requirements',
    stepNumber: 8,
    title: 'Non-Functional Requirements',
    subtitle: 'What quality attributes must the system exhibit?',
    icon: 'ShieldCheck',
    fields: [
      {
        id: 'non_functional_requirements',
        type: 'multi-choice',
        label: 'Quality Attributes',
        helperText: 'Select all non-functional requirements that are critical for this system.',
        required: false,
        options: [
          { value: 'performance', label: 'High Performance' },
          { value: 'low_latency', label: 'Low Latency' },
          { value: 'security', label: 'Security & Data Protection' },
          { value: 'privacy', label: 'Data Privacy' },
          { value: 'scalability', label: 'Horizontal Scalability' },
          { value: 'availability', label: 'High Availability' },
          { value: 'reliability', label: 'Reliability & Fault Tolerance' },
          { value: 'disaster_recovery', label: 'Disaster Recovery' },
          { value: 'backup_recovery', label: 'Backup & Data Recovery' },
          { value: 'accessibility', label: 'Accessibility' },
          { value: 'maintainability', label: 'Maintainability' },
          { value: 'compliance', label: 'Regulatory Compliance' },
          { value: 'auditability', label: 'Auditability' },
          { value: 'observability', label: 'Logging & Observability' },
          { value: 'testability', label: 'Testability' },
          { value: 'interoperability', label: 'Interoperability' },
          { value: 'portability', label: 'Portability / Cloud Agnostic' },
          { value: 'internationalization', label: 'Internationalisation' },
          { value: 'cost_efficiency', label: 'Cost Efficiency' },
        ],
      },
    ],
  },

  // ─── Step 9: External Integrations ───────────────────────────────────────
  {
    id: 'integrations',
    stepNumber: 9,
    title: 'External Integrations',
    subtitle: 'Does the system need to connect to external services or platforms?',
    icon: 'Plug',
    fields: [
      {
        id: 'integrations',
        type: 'multi-choice',
        label: 'Select Integrations',
        helperText: 'Select all third-party services or protocols this system will integrate with.',
        required: false,
        options: [
          { value: 'google', label: 'Google Services' },
          { value: 'microsoft', label: 'Microsoft Services' },
          { value: 'payment_gateway', label: 'Payment Gateway' },
          { value: 'sms_gateway', label: 'SMS Gateway' },
          { value: 'email_service', label: 'Email Service' },
          { value: 'push_notifications', label: 'Push Notifications' },
          { value: 'whatsapp', label: 'WhatsApp / Business Messaging' },
          { value: 'video_conferencing', label: 'Video Conferencing' },
          { value: 'erp', label: 'ERP System' },
          { value: 'crm', label: 'CRM System' },
          { value: 'hr_system', label: 'HR System' },
          { value: 'accounting', label: 'Accounting / Finance System' },
          { value: 'ecommerce', label: 'E-Commerce Platform' },
          { value: 'marketplace', label: 'Marketplace Platform' },
          { value: 'maps', label: 'Maps & Geolocation' },
          { value: 'iot', label: 'IoT / Sensors' },
          { value: 'social_login', label: 'Social Login' },
          { value: 'auth_provider', label: 'Authentication Provider' },
          { value: 'ai_ml', label: 'AI / ML APIs' },
          { value: 'analytics', label: 'Analytics Platform' },
          { value: 'bi', label: 'Business Intelligence / BI' },
          { value: 'data_warehouse', label: 'Data Warehouse' },
          { value: 'cloud_storage', label: 'Cloud Storage' },
          { value: 'github_gitlab', label: 'GitHub / GitLab' },
          { value: 'cicd', label: 'CI/CD Platform' },
          { value: 'monitoring_apm', label: 'Monitoring / APM' },
          { value: 'other_api', label: 'Other Third-Party APIs' },
          { value: 'none', label: 'No Integrations Required' },
        ],
      },
    ],
  },

  // ─── Step 10: Additional Information ─────────────────────────────────────
  {
    id: 'additional_info',
    stepNumber: 10,
    title: 'Additional Information',
    subtitle: 'Any other context, constraints, or special requirements? (Optional)',
    icon: 'NotebookPen',
    fields: [
      {
        id: 'business_goals',
        type: 'long-text',
        label: 'Business Goals (Optional)',
        placeholder: 'Describe measurable business outcomes, KPIs, or OKRs...',
        helperText: 'What does business success look like after launch?',
        required: false,
      },
      {
        id: 'constraints',
        type: 'long-text',
        label: 'Constraints (Optional)',
        placeholder: 'Technology restrictions, compliance rules, legacy system limitations...',
        helperText: 'Any hard boundaries the architecture must work within.',
        required: false,
      },
      {
        id: 'special_requirements',
        type: 'long-text',
        label: 'Special Requirements (Optional)',
        placeholder: 'Unique requirements not covered above...',
        helperText: 'Anything unusual, domain-specific, or critical to mention.',
        required: false,
      },
      {
        id: 'notes',
        type: 'long-text',
        label: 'Additional Notes (Optional)',
        placeholder: 'Free-form notes for the architecture team...',
        required: false,
      },
    ],
  },
];

export const TOTAL_STEPS = WIZARD_STEPS.length + 1; // +1 for Review step
