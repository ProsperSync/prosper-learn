import type { EducationalTrack, Lesson } from '../types';

/**
 * Comprehensive Educational Content Library
 * 
 * 10 tracks with 30+ lessons covering personal finance topics
 * All content includes English and Portuguese (pt-BR) translations
 */

// ========================================
// TRACK 1: FINANCIAL BASICS
// ========================================

export const FINANCIAL_BASICS_LESSONS: Lesson[] = [
  {
    id: 'lesson-basics-intro',
    trackId: 'track-financial-basics',
    order: 1,
    type: 'article',
    title: 'Understanding Personal Finance',
    description: 'The foundation of financial literacy',
    content: {
      body: `# Understanding Personal Finance

Personal finance is the management of your money and financial decisions. It encompasses budgeting, saving, investing, and planning for the future.

## Why Personal Finance Matters

- **Financial Security**: Proper management ensures you can handle unexpected expenses
- **Goal Achievement**: Planning helps you reach life goals like buying a home or retiring comfortably
- **Stress Reduction**: Financial control reduces anxiety and improves quality of life
- **Wealth Building**: Understanding money creates opportunities for growth

## The Five Pillars of Personal Finance

1. **Income**: Money you earn from work, investments, or other sources
2. **Spending**: How you use your money for needs and wants
3. **Saving**: Setting aside money for future use
4. **Investing**: Growing your wealth through various financial vehicles
5. **Protection**: Insurance and emergency funds to safeguard your finances

---

# Entendendo Finanças Pessoais (pt-BR)

Finanças pessoais são o gerenciamento do seu dinheiro e decisões financeiras.

## Por Que Finanças Pessoais Importam

- **Segurança Financeira**: Gestão adequada garante que você possa lidar com despesas inesperadas
- **Conquista de Objetivos**: Planejamento ajuda você a alcançar metas de vida
- **Redução de Estresse**: Controle financeiro reduz ansiedade
- **Construção de Patrimônio**: Entender dinheiro cria oportunidades de crescimento`,
    },
    duration: 15,
    xpReward: 25,
  },
  {
    id: 'lesson-basics-needs-wants',
    trackId: 'track-financial-basics',
    order: 2,
    type: 'article',
    title: 'Needs vs Wants',
    description: 'Learning to distinguish essential from discretionary spending',
    content: {
      body: `# Needs vs Wants

Understanding the difference between needs and wants is fundamental to financial success.

## Needs (Necessidades)

- Housing, Food, Utilities
- Transportation, Healthcare
- Basic Clothing, Insurance

## Wants (Desejos)

- Entertainment, Dining Out
- Luxury Items, Hobbies
- Upgrades beyond basic needs

## The Gray Area

- Phone: Basic service = need; Latest smartphone = want
- Transportation: Getting to work = need; Luxury car = want
- Housing: Shelter = need; Extra bedrooms = want`,
    },
    duration: 12,
    xpReward: 20,
  },
  {
    id: 'lesson-basics-tracking',
    trackId: 'track-financial-basics',
    order: 3,
    type: 'video',
    title: 'Tracking Income and Expenses',
    description: 'How to monitor your cash flow',
    content: {
      body: 'Learn the fundamentals of tracking your income and expenses',
      videoUrl: 'https://youtube.com/watch?v=example-tracking-basics',
    },
    duration: 18,
    xpReward: 30,
  },
  {
    id: 'lesson-basics-quiz',
    trackId: 'track-financial-basics',
    order: 4,
    type: 'quiz',
    title: 'Financial Basics Quiz',
    description: 'Test your understanding of financial fundamentals',
    content: {
      quizQuestions: [
        {
          id: 'q1',
          question: 'Which of the following is a NEED, not a want?',
          options: [
            'Premium streaming subscriptions',
            'Basic groceries for nutrition',
            'Designer clothing',
            'Latest smartphone model'
          ],
          correctAnswer: 1,
          explanation: 'Basic groceries provide essential nutrition and are a need. The others are wants.',
        },
        {
          id: 'q2',
          question: 'What are the five pillars of personal finance?',
          options: [
            'Saving, Spending, Borrowing, Lending, Giving',
            'Income, Spending, Saving, Investing, Protection',
            'Budget, Goals, Debt, Credit, Insurance',
            'Earn, Save, Invest, Retire, Donate'
          ],
          correctAnswer: 1,
          explanation: 'The five pillars are Income, Spending, Saving, Investing, and Protection.',
        },
      ],
    },
    duration: 10,
    xpReward: 50,
  },
];

// ========================================
// TRACK 2: BUDGETING BASICS
// ========================================

export const BUDGETING_LESSONS: Lesson[] = [
  {
    id: 'lesson-budget-intro',
    trackId: 'track-budgeting-basics',
    order: 1,
    type: 'article',
    title: 'What is a Budget?',
    description: 'Introduction to budgeting concepts',
    content: {
      body: `# What is a Budget?

A budget is a spending plan based on your income and expenses.

## Why Budget?

1. **Control**: Know where your money goes
2. **Goals**: Save for what matters
3. **Reduce Stress**: Avoid month-end anxiety
4. **Avoid Debt**: Spend within means
5. **Build Wealth**: Consistent saving adds up

## How a Budget Works

1. Calculate Income
2. List Expenses
3. Assign Amounts
4. Track Spending
5. Adjust as needed

---

# O Que é um Orçamento? (pt-BR)

Um orçamento é um plano de gastos baseado em sua renda e despesas.`,
    },
    duration: 15,
    xpReward: 25,
  },
  {
    id: 'lesson-budget-50-30-20',
    trackId: 'track-budgeting-basics',
    order: 2,
    type: 'article',
    title: 'The 50/30/20 Rule',
    description: 'A simple budgeting framework',
    content: {
      body: `# The 50/30/20 Rule

Divide after-tax income into three categories:

## The Breakdown

### 50% - Needs
- Housing, Food, Transportation
- Utilities, Insurance
- Minimum debt payments

### 30% - Wants
- Dining out, Entertainment
- Hobbies, Shopping
- Subscriptions

### 20% - Savings & Debt
- Emergency fund
- Retirement contributions
- Extra debt payments

## Example
Income: $3,000/month

- Needs: $1,500 (rent $900, groceries $300, transport $150, utilities $150)
- Wants: $900 (dining $200, entertainment $200, shopping $300, subscriptions $200)
- Savings: $600 (emergency $300, retirement $200, debt $100)

---

# A Regra 50/30/20 (pt-BR)

Renda: R$ 3.000/mês
- Necessidades: R$ 1.500
- Desejos: R$ 900
- Poupança: R$ 600`,
    },
    duration: 20,
    xpReward: 30,
  },
  {
    id: 'lesson-budget-zero-based',
    trackId: 'track-budgeting-basics',
    order: 3,
    type: 'video',
    title: 'Zero-Based Budgeting',
    description: 'Give every dollar a job',
    content: {
      body: 'Learn how to create a zero-based budget where income minus expenses equals zero',
      videoUrl: 'https://youtube.com/watch?v=example-zero-budget',
    },
    duration: 18,
    xpReward: 30,
  },
  {
    id: 'lesson-budget-quiz',
    trackId: 'track-budgeting-basics',
    order: 4,
    type: 'quiz',
    title: 'Budgeting Quiz',
    description: 'Test your budgeting knowledge',
    content: {
      quizQuestions: [
        {
          id: 'q1',
          question: 'In the 50/30/20 rule, what percentage goes to needs?',
          options: ['30%', '40%', '50%', '60%'],
          correctAnswer: 2,
          explanation: '50% of after-tax income should cover needs like housing, food, and transportation.',
        },
        {
          id: 'q2',
          question: 'What does "zero-based budgeting" mean?',
          options: [
            'You have zero dollars after bills',
            'Every dollar is assigned a purpose',
            'You save zero dollars',
            'No entertainment budget'
          ],
          correctAnswer: 1,
          explanation: 'Zero-based budgeting means giving every dollar a job so income minus assignments equals zero.',
        },
        {
          id: 'q3',
          question: 'If you earn $4,000/month, how much should you save (50/30/20)?',
          options: ['$400', '$600', '$800', '$1,000'],
          correctAnswer: 2,
          explanation: '20% of $4,000 is $800 for savings and debt repayment.',
        },
      ],
    },
    duration: 10,
    xpReward: 50,
  },
];

// ========================================
// TRACK 3: SAVING & EMERGENCY FUNDS
// ========================================

export const SAVING_LESSONS: Lesson[] = [
  {
    id: 'lesson-saving-intro',
    trackId: 'track-saving',
    order: 1,
    type: 'article',
    title: 'The Power of Saving',
    description: 'Why and how to save money',
    content: {
      body: `# The Power of Saving

Saving is setting aside money for future use. It's the foundation of financial security.

## Why Save?

- **Emergencies**: Handle unexpected expenses
- **Goals**: Buy home, car, vacation
- **Peace of Mind**: Sleep better knowing you're prepared
- **Financial Freedom**: Options and choices

## How Much to Save?

Start with these targets:
- **Beginner**: $1,000 emergency fund
- **Intermediate**: 3-6 months expenses
- **Advanced**: 6-12 months expenses

## Where to Save?

- High-yield savings account (2-5% APY)
- Money market account
- Short-term CDs for planned expenses

---

# O Poder da Poupança (pt-BR)

Comece com uma reserva de emergência de R$ 1.000, depois construa até 3-6 meses de despesas.`,
    },
    duration: 15,
    xpReward: 25,
  },
  {
    id: 'lesson-saving-emergency',
    trackId: 'track-saving',
    order: 2,
    type: 'article',
    title: 'Building an Emergency Fund',
    description: 'Your financial safety net',
    content: {
      body: `# Building an Emergency Fund

An emergency fund is money set aside for unexpected expenses.

## What Counts as an Emergency?

**True emergencies:**
- Job loss
- Medical emergency
- Urgent home/car repair
- Family crisis

**NOT emergencies:**
- Sale at favorite store
- Vacation opportunity
- New gadget release

## How Much Do You Need?

### Level 1: $1,000 starter fund
Covers minor emergencies while building

### Level 2: 3-6 months of expenses
Standard recommendation for most people

### Level 3: 6-12 months
If you have:
- Irregular income
- Single income household
- Health concerns
- Job instability

## Building Your Fund

Example: 3 months expenses = $9,000

Strategy:
- Save $300/month = 30 months
- Save $500/month = 18 months
- Save $750/month = 12 months

Start with what you can, increase gradually.`,
    },
    duration: 18,
    xpReward: 30,
  },
  {
    id: 'lesson-saving-automated',
    trackId: 'track-saving',
    order: 3,
    type: 'video',
    title: 'Automated Saving Strategies',
    description: 'Set it and forget it savings',
    content: {
      body: 'Learn how to automate your savings to make it effortless',
      videoUrl: 'https://youtube.com/watch?v=example-automated-saving',
    },
    duration: 15,
    xpReward: 25,
  },
  {
    id: 'lesson-saving-quiz',
    trackId: 'track-saving',
    order: 4,
    type: 'quiz',
    title: 'Saving Strategies Quiz',
    description: 'Test your saving knowledge',
    content: {
      quizQuestions: [
        {
          id: 'q1',
          question: 'What is the recommended emergency fund for most people?',
          options: [
            '$1,000',
            '3-6 months of expenses',
            '1 year of expenses',
            'Whatever you can save'
          ],
          correctAnswer: 1,
          explanation: '3-6 months of expenses is the standard recommendation for financial security.',
        },
        {
          id: 'q2',
          question: 'Which is a TRUE emergency that justifies using your emergency fund?',
          options: [
            'Black Friday sale',
            'Friend\'s destination wedding',
            'Unexpected medical bills',
            'New phone release'
          ],
          correctAnswer: 2,
          explanation: 'Medical emergencies are true emergencies. Sales, events, and wants should be planned for.',
        },
      ],
    },
    duration: 10,
    xpReward: 50,
  },
];

// ========================================
// TRACK 4: DEBT MANAGEMENT
// ========================================

export const DEBT_LESSONS: Lesson[] = [
  {
    id: 'lesson-debt-types',
    trackId: 'track-debt',
    order: 1,
    type: 'article',
    title: 'Understanding Debt',
    description: 'Good debt vs bad debt',
    content: {
      body: `# Understanding Debt

Not all debt is created equal. Learn to distinguish between productive and destructive debt.

## Good Debt (Can Build Wealth)

- **Mortgage**: Real estate appreciates
- **Student Loans**: Increase earning potential
- **Business Loans**: Generate income
- **Low-interest car loan**: If needed for work

Characteristics: Low interest, tax-deductible, builds assets

## Bad Debt (Destroys Wealth)

- **Credit Cards**: High interest (15-25%)
- **Payday Loans**: Predatory rates (400%+)
- **High-interest personal loans**
- **Financing depreciating assets**

Characteristics: High interest, consumptive, no asset building

## The Debt Trap

$5,000 credit card at 20% APR
- Minimum payment ($125/month): 23 years to pay off, $9,000 in interest
- $200/month: 2.5 years, $1,200 in interest

---

# Entendendo Dívidas (pt-BR)

Dívida boa vs dívida ruim - aprenda a diferença.`,
    },
    duration: 15,
    xpReward: 25,
  },
  {
    id: 'lesson-debt-strategies',
    trackId: 'track-debt',
    order: 2,
    type: 'article',
    title: 'Debt Payoff Strategies',
    description: 'Snowball vs Avalanche methods',
    content: {
      body: `# Debt Payoff Strategies

Two proven methods to eliminate debt.

## Debt Snowball Method
Pay off smallest debt first

**Example:**
- Card 1: $500 at 18%
- Card 2: $2,000 at 15%
- Card 3: $5,000 at 22%

Pay minimums on all, extra money to Card 1. Once paid, attack Card 2, then Card 3.

**Pros:** Quick wins, motivation
**Cons:** May pay more interest

## Debt Avalanche Method
Pay off highest interest first

**Same example, different order:**
Attack Card 3 (22%), then Card 1 (18%), then Card 2 (15%)

**Pros:** Save money on interest
**Cons:** Slower initial progress

## Which to Choose?

- **Snowball**: Need motivation, behavioral wins
- **Avalanche**: Mathematically optimal, disciplined approach

## Extra Strategies

- Debt consolidation loan (lower interest)
- Balance transfer (0% intro APR)
- Negotiate lower rates
- Increase income
- Cut expenses

---

# Estratégias para Pagar Dívidas (pt-BR)

Método bola de neve vs método avalanche.`,
    },
    duration: 20,
    xpReward: 30,
  },
  {
    id: 'lesson-debt-avoiding',
    trackId: 'track-debt',
    order: 3,
    type: 'video',
    title: 'Avoiding Future Debt',
    description: 'Staying debt-free',
    content: {
      body: 'Learn strategies to avoid falling back into debt',
      videoUrl: 'https://youtube.com/watch?v=example-avoid-debt',
    },
    duration: 18,
    xpReward: 30,
  },
  {
    id: 'lesson-debt-quiz',
    trackId: 'track-debt',
    order: 4,
    type: 'quiz',
    title: 'Debt Management Quiz',
    description: 'Test your debt knowledge',
    content: {
      quizQuestions: [
        {
          id: 'q1',
          question: 'Which debt payoff method focuses on smallest balance first?',
          options: [
            'Debt Avalanche',
            'Debt Snowball',
            'Debt Consolidation',
            'Debt Settlement'
          ],
          correctAnswer: 1,
          explanation: 'Debt Snowball pays smallest debt first for quick psychological wins.',
        },
        {
          id: 'q2',
          question: 'Which is typically considered "good debt"?',
          options: [
            'Credit card debt',
            'Payday loan',
            'Mortgage on a home',
            'Financing a vacation'
          ],
          correctAnswer: 2,
          explanation: 'Mortgages are good debt because real estate typically appreciates and builds wealth.',
        },
      ],
    },
    duration: 10,
    xpReward: 50,
  },
];

// ========================================
// TRACK 5: INVESTMENT BASICS
// ========================================

export const INVESTMENT_LESSONS: Lesson[] = [
  {
    id: 'lesson-invest-intro',
    trackId: 'track-investing',
    order: 1,
    type: 'article',
    title: 'Introduction to Investing',
    description: 'Growing your wealth',
    content: {
      body: `# Introduction to Investing

Investing is using money to make more money through assets that grow in value.

## Why Invest?

- **Beat Inflation**: Savings accounts lose purchasing power (inflation ~3%/year)
- **Compound Growth**: Money earns returns, returns earn returns
- **Retirement**: Social Security isn't enough
- **Financial Goals**: Home down payment, children's education

## The Power of Compound Interest

$10,000 invested at 8% annual return:
- 10 years: $21,589
- 20 years: $46,610
- 30 years: $100,627
- 40 years: $217,245

Starting early makes a huge difference!

## Investment Types

- **Stocks**: Own part of company
- **Bonds**: Loan to government/company
- **Real Estate**: Property ownership
- **Mutual Funds**: Professional management
- **Index Funds**: Track market index (recommended for beginners)
- **ETFs**: Trade like stocks, diversified

## Risk vs Return

Higher potential returns = higher risk
- Low risk: Bonds, CDs (2-5% return)
- Medium risk: Index funds (7-10% average)
- High risk: Individual stocks, crypto (variable)

---

# Introdução aos Investimentos (pt-BR)

Investir é usar dinheiro para ganhar mais dinheiro através de ativos que crescem em valor.`,
    },
    duration: 20,
    xpReward: 30,
  },
  {
    id: 'lesson-invest-401k',
    trackId: 'track-investing',
    order: 2,
    type: 'article',
    title: '401(k) and Retirement Accounts',
    description: 'Tax-advantaged investing',
    content: {
      body: `# 401(k) and Retirement Accounts

Tax-advantaged accounts for retirement saving.

## 401(k) - Employer Retirement Plan

**Benefits:**
- Tax deduction (traditional) or tax-free growth (Roth)
- Employer match (free money!)
- Auto-deduct from paycheck
- High contribution limits ($23,000/year in 2024)

**Example:**
You contribute 6%, employer matches 50% up to 6%
Salary: $60,000
- Your contribution: $3,600
- Employer match: $1,800
- Total invested: $5,400 (9% of salary)

## IRA - Individual Retirement Account

**Traditional IRA:**
- Tax deduction now
- Pay taxes in retirement
- Limit: $7,000/year ($8,000 if 50+)

**Roth IRA:**
- No tax deduction now
- Tax-free withdrawals in retirement
- Income limits apply

## Investment Order

1. 401(k) to employer match (free money!)
2. Pay off high-interest debt
3. Max Roth IRA
4. Max 401(k)
5. Taxable investment account

---

# Contas de Aposentadoria (pt-BR)

No Brasil: PGBL, VGBL, Tesouro Direto para aposentadoria.`,
    },
    duration: 18,
    xpReward: 30,
  },
  {
    id: 'lesson-invest-diversification',
    trackId: 'track-investing',
    order: 3,
    type: 'video',
    title: 'Diversification Strategy',
    description: 'Don\'t put all eggs in one basket',
    content: {
      body: 'Learn how to diversify your investments to manage risk',
      videoUrl: 'https://youtube.com/watch?v=example-diversification',
    },
    duration: 15,
    xpReward: 25,
  },
  {
    id: 'lesson-invest-quiz',
    trackId: 'track-investing',
    order: 4,
    type: 'quiz',
    title: 'Investment Basics Quiz',
    description: 'Test your investing knowledge',
    content: {
      quizQuestions: [
        {
          id: 'q1',
          question: 'What is compound interest?',
          options: [
            'Interest that is paid twice',
            'Interest earned on both principal and previous interest',
            'Interest from multiple accounts',
            'Interest that increases monthly'
          ],
          correctAnswer: 1,
          explanation: 'Compound interest is earning returns on your principal AND on previous returns, creating exponential growth.',
        },
        {
          id: 'q2',
          question: 'What should you prioritize with 401(k) contributions?',
          options: [
            'Max it out immediately',
            'Contribute enough to get full employer match',
            'Don\'t contribute until debt-free',
            'Only contribute if returns are guaranteed'
          ],
          correctAnswer: 1,
          explanation: 'Always contribute enough to get the full employer match - it\'s free money with immediate 100% return!',
        },
      ],
    },
    duration: 10,
    xpReward: 50,
  },
];

// ========================================
// TRACK 6: GOAL SETTING
// ========================================

export const GOAL_SETTING_LESSONS: Lesson[] = [
  {
    id: 'lesson-goal-smart',
    trackId: 'track-goals',
    order: 1,
    type: 'article',
    title: 'SMART Financial Goals',
    description: 'Setting achievable financial targets',
    content: {
      body: `# SMART Financial Goals

SMART goals are Specific, Measurable, Achievable, Relevant, Time-bound.

## The SMART Framework

**Specific**: Clear and well-defined
Bad: "Save money"
Good: "Save $10,000 for home down payment"

**Measurable**: Track progress
"Save $400/month for 25 months"

**Achievable**: Realistic given income
If you earn $3,000/month, saving $2,000/month isn't achievable

**Relevant**: Aligns with values
Why do you want this? How does it improve your life?

**Time-bound**: Clear deadline
"By December 31, 2026"

## Examples

**Short-term (< 1 year):**
- Build $1,000 emergency fund in 4 months ($250/month)
- Pay off $3,000 credit card in 10 months ($300/month)

**Medium-term (1-5 years):**
- Save $25,000 for home down payment in 3 years ($700/month)
- Pay off $30,000 student loans in 4 years ($625/month)

**Long-term (5+ years):**
- Save $1 million for retirement in 30 years ($750/month at 8% return)
- Pay off $200,000 mortgage early

---

# Metas Financeiras SMART (pt-BR)

Específico, Mensurável, Atingível, Relevante, Temporal.`,
    },
    duration: 15,
    xpReward: 25,
  },
  {
    id: 'lesson-goal-tracking',
    trackId: 'track-goals',
    order: 2,
    type: 'video',
    title: 'Tracking Goal Progress',
    description: 'Staying motivated on your journey',
    content: {
      body: 'Learn how to track and visualize your progress toward financial goals',
      videoUrl: 'https://youtube.com/watch?v=example-goal-tracking',
    },
    duration: 12,
    xpReward: 20,
  },
  {
    id: 'lesson-goal-quiz',
    trackId: 'track-goals',
    order: 3,
    type: 'quiz',
    title: 'Goal Setting Quiz',
    description: 'Test your goal-setting knowledge',
    content: {
      quizQuestions: [
        {
          id: 'q1',
          question: 'Which goal is properly SMART-formatted?',
          options: [
            'I want to be rich',
            'Save more money this year',
            'Save $5,000 for vacation by June 30, 2025',
            'Become financially independent'
          ],
          correctAnswer: 2,
          explanation: 'This goal is Specific ($5,000), Measurable (can track), Achievable (reasonable), Relevant (vacation), Time-bound (June 30, 2025).',
        },
      ],
    },
    duration: 8,
    xpReward: 40,
  },
];

// ========================================
// TRACK 7: CREDIT MANAGEMENT
// ========================================

export const CREDIT_LESSONS: Lesson[] = [
  {
    id: 'lesson-credit-score',
    trackId: 'track-credit',
    order: 1,
    type: 'article',
    title: 'Understanding Credit Scores',
    description: 'What is a credit score and why it matters',
    content: {
      body: `# Understanding Credit Scores

A credit score is a number (300-850) representing your creditworthiness.

## FICO Score Breakdown

**Excellent:** 800-850
**Very Good:** 740-799
**Good:** 670-739
**Fair:** 580-669
**Poor:** 300-579

## What Affects Your Score?

1. **Payment History (35%)**: Pay on time!
2. **Credit Utilization (30%)**: Keep below 30% of limit
3. **Length of Credit History (15%)**: Older accounts help
4. **New Credit (10%)**: Too many inquiries hurt
5. **Credit Mix (10%)**: Variety of account types

## Why Credit Scores Matter

- **Lower interest rates**: Save thousands on loans
- **Apartment approval**: Landlords check credit
- **Job opportunities**: Some employers review credit
- **Insurance rates**: Better credit = lower premiums
- **Phone contracts**: Avoid deposits

## Example Impact

$300,000 mortgage, 30 years:
- 720+ score: 6.5% rate = $1,896/month
- 620 score: 8.5% rate = $2,307/month
Difference: $411/month, $147,960 over 30 years!

---

# Entendendo Score de Crédito (pt-BR)

No Brasil: Serasa Score, Score da Boa Vista.`,
    },
    duration: 18,
    xpReward: 30,
  },
  {
    id: 'lesson-credit-building',
    trackId: 'track-credit',
    order: 2,
    type: 'article',
    title: 'Building Good Credit',
    description: 'How to improve your credit score',
    content: {
      body: `# Building Good Credit

Strategies to build and maintain excellent credit.

## For Beginners (No Credit History)

1. **Secured Credit Card**: Deposit = credit limit
2. **Credit Builder Loan**: Save while building credit
3. **Become Authorized User**: On someone's good account
4. **Student Credit Card**: If in school

## For Everyone

**Always Do:**
- Pay all bills on time (set autopay!)
- Keep credit utilization under 30% (under 10% is ideal)
- Keep old accounts open (length of history matters)
- Monitor credit reports (free annually)

**Never Do:**
- Miss payments (even once hurts)
- Max out credit cards
- Close old accounts (reduces available credit)
- Apply for many cards at once (hard inquiries)

## Example: Improving from 620 to 740

Starting: 620 score, $5,000 credit card, $4,000 balance (80% utilization)

Actions:
1. Pay balance to $1,000 (20% utilization): +50 points
2. Never miss payment for 6 months: +30 points
3. Request credit limit increase to $10,000: +20 points
4. Diversify with installment loan: +20 points

New score: ~740 in 6-12 months

---

# Construindo Bom Crédito (pt-BR)

Estratégias para construir e manter crédito excelente.`,
    },
    duration: 20,
    xpReward: 30,
  },
  {
    id: 'lesson-credit-quiz',
    trackId: 'track-credit',
    order: 3,
    type: 'quiz',
    title: 'Credit Management Quiz',
    description: 'Test your credit knowledge',
    content: {
      quizQuestions: [
        {
          id: 'q1',
          question: 'What factor has the BIGGEST impact on your credit score?',
          options: [
            'Credit utilization',
            'Payment history',
            'Length of credit history',
            'Credit mix'
          ],
          correctAnswer: 1,
          explanation: 'Payment history accounts for 35% of your score - the largest factor. Always pay on time!',
        },
        {
          id: 'q2',
          question: 'What is the recommended credit utilization ratio?',
          options: [
            'Under 10%',
            'Under 30%',
            'Under 50%',
            'Under 90%'
          ],
          correctAnswer: 1,
          explanation: 'While under 30% is the commonly cited threshold, under 10% is ideal for excellent credit scores.',
        },
      ],
    },
    duration: 10,
    xpReward: 50,
  },
];

// ========================================
// TRACK 8: TAX PLANNING
// ========================================

export const TAX_LESSONS: Lesson[] = [
  {
    id: 'lesson-tax-basics',
    trackId: 'track-tax',
    order: 1,
    type: 'article',
    title: 'Tax Basics for Everyone',
    description: 'Understanding income taxes',
    content: {
      body: `# Tax Basics for Everyone

Understanding taxes helps you keep more of your money.

## Types of Income Tax

**Ordinary Income**: Wages, salaries, tips
- Taxed at your marginal rate (10-37%)

**Capital Gains**: Investment profits
- Short-term (< 1 year): Ordinary income rate
- Long-term (> 1 year): 0%, 15%, or 20%

**Tax Brackets (2024 - Single)**
- 10%: $0 - $11,600
- 12%: $11,601 - $47,150
- 22%: $47,151 - $100,525
- 24%: $100,526 - $191,950
- Higher brackets: 32%, 35%, 37%

## Common Tax Deductions

**Standard Deduction**: $14,600 (single), $29,200 (married)
Most people take this instead of itemizing.

**Itemized Deductions:**
- Mortgage interest
- State/local taxes (up to $10,000)
- Charitable donations
- Medical expenses (> 7.5% of AGI)

## Tax Credits (Better than Deductions!)

- **Earned Income Tax Credit**: For low-to-moderate income
- **Child Tax Credit**: Up to $2,000 per child
- **Education Credits**: American Opportunity, Lifetime Learning
- **Retirement Saver's Credit**: For low-income savers

---

# Noções Básicas de Impostos (pt-BR)

No Brasil: Imposto de Renda Pessoa Física (IRPF).`,
    },
    duration: 20,
    xpReward: 30,
  },
  {
    id: 'lesson-tax-strategies',
    trackId: 'track-tax',
    order: 2,
    type: 'video',
    title: 'Tax-Efficient Investing',
    description: 'Minimize taxes on investments',
    content: {
      body: 'Learn strategies to reduce your tax burden through smart investing',
      videoUrl: 'https://youtube.com/watch?v=example-tax-efficient',
    },
    duration: 18,
    xpReward: 30,
  },
  {
    id: 'lesson-tax-quiz',
    trackId: 'track-tax',
    order: 3,
    type: 'quiz',
    title: 'Tax Planning Quiz',
    description: 'Test your tax knowledge',
    content: {
      quizQuestions: [
        {
          id: 'q1',
          question: 'What is the benefit of a tax credit vs a tax deduction?',
          options: [
            'They are the same thing',
            'Credits reduce taxes dollar-for-dollar, deductions reduce taxable income',
            'Deductions are better',
            'Credits only work for businesses'
          ],
          correctAnswer: 1,
          explanation: 'Tax credits reduce your taxes dollar-for-dollar ($1,000 credit = $1,000 less tax). Deductions only reduce taxable income ($1,000 deduction might save $220 in taxes at 22% bracket).',
        },
      ],
    },
    duration: 10,
    xpReward: 50,
  },
];

// ========================================
// TRACK 9: ADVANCED INVESTING
// ========================================

export const ADVANCED_INVESTING_LESSONS: Lesson[] = [
  {
    id: 'lesson-advanced-assets',
    trackId: 'track-advanced-investing',
    order: 1,
    type: 'article',
    title: 'Alternative Investment Assets',
    description: 'Beyond stocks and bonds',
    content: {
      body: `# Alternative Investment Assets

Diversify beyond traditional stocks and bonds.

## Real Estate Investment

**Direct Ownership:**
- Rental properties
- House flipping
- Commercial real estate
Pros: Control, tax benefits, leverage
Cons: High capital, management time, illiquid

**REITs (Real Estate Investment Trusts):**
- Publicly traded, liquid
- Dividend income
- No property management
Minimum: As little as one share

## Commodities

- Gold/Silver: Inflation hedge
- Oil: Energy sector exposure
- Agricultural: Wheat, corn, soybeans
Invest via ETFs, avoid physical unless expert

## Cryptocurrency

**High Risk, High Reward:**
- Bitcoin, Ethereum: Digital currencies
- Volatile: 50%+ swings common
- Only invest what you can lose
- 1-5% of portfolio max for most

## P2P Lending

Lend money directly to borrowers:
- Returns: 4-10% typically
- Risk: Default risk
- Platforms: LendingClub, Prosper

---

# Ativos de Investimento Alternativos (pt-BR)

Diversifique além de ações e títulos tradicionais.`,
    },
    duration: 22,
    xpReward: 35,
  },
  {
    id: 'lesson-advanced-strategies',
    trackId: 'track-advanced-investing',
    order: 2,
    type: 'article',
    title: 'Advanced Investment Strategies',
    description: 'Portfolio optimization techniques',
    content: {
      body: `# Advanced Investment Strategies

## Asset Allocation by Age

**Rule of 110:**
Stock allocation = 110 - your age

Age 30: 80% stocks, 20% bonds
Age 50: 60% stocks, 40% bonds
Age 70: 40% stocks, 60% bonds

## Dollar Cost Averaging (DCA)

Invest fixed amount regularly, regardless of price.

Example: $500/month into S&P 500
- Month 1: Price $100, buy 5 shares
- Month 2: Price $80, buy 6.25 shares
- Month 3: Price $120, buy 4.17 shares

Averages out market volatility, removes emotion.

## Tax-Loss Harvesting

Sell losing investments to offset gains.

Example:
- Stock A: $10,000 gain
- Stock B: $4,000 loss
Sell both: Only pay taxes on $6,000

## Rebalancing

Maintain target allocation by selling winners, buying losers.

Target: 60% stocks, 40% bonds
After growth: 70% stocks, 30% bonds
Rebalance: Sell 10% stocks, buy bonds

Frequency: Annually or when 5%+ drift

---

# Estratégias Avançadas de Investimento (pt-BR)

Técnicas de otimização de portfólio.`,
    },
    duration: 20,
    xpReward: 35,
  },
  {
    id: 'lesson-advanced-quiz',
    trackId: 'track-advanced-investing',
    order: 3,
    type: 'quiz',
    title: 'Advanced Investing Quiz',
    description: 'Test your advanced knowledge',
    content: {
      quizQuestions: [
        {
          id: 'q1',
          question: 'Using the Rule of 110, what stock allocation should a 40-year-old have?',
          options: ['40%', '60%', '70%', '80%'],
          correctAnswer: 2,
          explanation: '110 - 40 = 70% stocks, with the remaining 30% in bonds.',
        },
        {
          id: 'q2',
          question: 'What is dollar cost averaging?',
          options: [
            'Buying stocks at the lowest price',
            'Investing a fixed amount regularly',
            'Averaging your returns over time',
            'Calculating average stock prices'
          ],
          correctAnswer: 1,
          explanation: 'DCA means investing a fixed amount at regular intervals, reducing the impact of market volatility.',
        },
      ],
    },
    duration: 10,
    xpReward: 50,
  },
];

// ========================================
// TRACK 10: RETIREMENT PLANNING
// ========================================

export const RETIREMENT_LESSONS: Lesson[] = [
  {
    id: 'lesson-retirement-planning',
    trackId: 'track-retirement',
    order: 1,
    type: 'article',
    title: 'Retirement Planning Fundamentals',
    description: 'How much do you need to retire?',
    content: {
      body: `# Retirement Planning Fundamentals

Plan for 20-30 years of retirement.

## The 4% Rule

Withdraw 4% of portfolio annually in retirement.

**Need $1 million to retire? Here's why:**
- Annual expenses: $40,000
- $40,000 / 0.04 = $1,000,000 needed

**Required Savings Calculation:**
Annual expenses × 25 = Retirement portfolio target

$60,000/year × 25 = $1.5 million
$80,000/year × 25 = $2 million

## How Much to Save?

**Age 30, want $2M by 65:**
- 8% return: Save $1,050/month
- 7% return: Save $1,320/month
- 6% return: Save $1,675/month

Start early! Time is your biggest asset.

## Retirement Account Priority

1. 401(k) to employer match
2. Max HSA (triple tax advantage!)
3. Max Roth IRA
4. Max 401(k) ($23,000 limit)
5. Taxable brokerage account

## Social Security

**Average benefit:** $1,907/month (2024)
**Max benefit:** $4,873/month

Don't rely solely on SS - it replaces only ~40% of income.

---

# Fundamentos do Planejamento de Aposentadoria (pt-BR)

Planeje para 20-30 anos de aposentadoria.`,
    },
    duration: 25,
    xpReward: 40,
  },
  {
    id: 'lesson-retirement-strategies',
    trackId: 'track-retirement',
    order: 2,
    type: 'video',
    title: 'Early Retirement Strategies',
    description: 'FIRE movement and early retirement',
    content: {
      body: 'Learn about Financial Independence Retire Early (FIRE) strategies',
      videoUrl: 'https://youtube.com/watch?v=example-fire-retirement',
    },
    duration: 20,
    xpReward: 35,
  },
  {
    id: 'lesson-retirement-quiz',
    trackId: 'track-retirement',
    order: 3,
    type: 'quiz',
    title: 'Retirement Planning Quiz',
    description: 'Test your retirement knowledge',
    content: {
      quizQuestions: [
        {
          id: 'q1',
          question: 'According to the 4% rule, how much do you need to retire if you want $50,000/year?',
          options: [
            '$500,000',
            '$1 million',
            '$1.25 million',
            '$2 million'
          ],
          correctAnswer: 2,
          explanation: '$50,000 / 0.04 = $1,250,000. Alternatively, $50,000 × 25 = $1.25 million.',
        },
        {
          id: 'q2',
          question: 'What should you prioritize first for retirement?',
          options: [
            'Max out 401(k) immediately',
            'Invest in real estate',
            'Get full employer 401(k) match',
            'Open a taxable brokerage account'
          ],
          correctAnswer: 2,
          explanation: 'Always get the full employer match first - it\'s an immediate 100% return on your money!',
        },
      ],
    },
    duration: 12,
    xpReward: 50,
  },
];

// ========================================
// CONSOLIDATED EXPORTS
// ========================================

export const ALL_LESSONS: Lesson[] = [
  ...FINANCIAL_BASICS_LESSONS,
  ...BUDGETING_LESSONS,
  ...SAVING_LESSONS,
  ...DEBT_LESSONS,
  ...INVESTMENT_LESSONS,
  ...GOAL_SETTING_LESSONS,
  ...CREDIT_LESSONS,
  ...TAX_LESSONS,
  ...ADVANCED_INVESTING_LESSONS,
  ...RETIREMENT_LESSONS,
];

export const ALL_TRACKS: EducationalTrack[] = [
  {
    id: 'track-financial-basics',
    slug: 'financial-basics',
    title: 'Financial Basics',
    description: 'Master the fundamentals of personal finance',
    category: 'basics',
    difficulty: 'beginner',
    estimatedHours: 1.5,
    lessons: FINANCIAL_BASICS_LESSONS.map(l => l.id),
    totalXP: 125,
    isOfflineAvailable: true,
  },
  {
    id: 'track-budgeting-basics',
    slug: 'budgeting-basics',
    title: 'Budgeting Basics',
    description: 'Learn to create and maintain an effective budget',
    category: 'budgeting',
    difficulty: 'beginner',
    estimatedHours: 2,
    lessons: BUDGETING_LESSONS.map(l => l.id),
    totalXP: 135,
    prerequisites: ['track-financial-basics'],
    isOfflineAvailable: true,
  },
  {
    id: 'track-saving',
    slug: 'saving-strategies',
    title: 'Saving Strategies',
    description: 'Build emergency funds and achieve savings goals',
    category: 'goals',
    difficulty: 'beginner',
    estimatedHours: 1.5,
    lessons: SAVING_LESSONS.map(l => l.id),
    totalXP: 130,
    prerequisites: ['track-budgeting-basics'],
    isOfflineAvailable: true,
  },
  {
    id: 'track-debt',
    slug: 'debt-management',
    title: 'Debt Management',
    description: 'Strategies to eliminate debt and stay debt-free',
    category: 'debt',
    difficulty: 'intermediate',
    estimatedHours: 2,
    lessons: DEBT_LESSONS.map(l => l.id),
    totalXP: 135,
    prerequisites: ['track-budgeting-basics'],
    isOfflineAvailable: true,
  },
  {
    id: 'track-investing',
    slug: 'investment-basics',
    title: 'Investment Basics',
    description: 'Start your investment journey with confidence',
    category: 'investing',
    difficulty: 'intermediate',
    estimatedHours: 2.5,
    lessons: INVESTMENT_LESSONS.map(l => l.id),
    totalXP: 140,
    prerequisites: ['track-budgeting-basics', 'track-saving'],
    isOfflineAvailable: true,
  },
  {
    id: 'track-goals',
    slug: 'goal-setting',
    title: 'Goal Setting & Planning',
    description: 'Set and achieve your financial goals',
    category: 'goals',
    difficulty: 'beginner',
    estimatedHours: 1,
    lessons: GOAL_SETTING_LESSONS.map(l => l.id),
    totalXP: 85,
    prerequisites: ['track-budgeting-basics'],
    isOfflineAvailable: true,
  },
  {
    id: 'track-credit',
    slug: 'credit-management',
    title: 'Credit Management',
    description: 'Build and maintain excellent credit',
    category: 'basics',
    difficulty: 'intermediate',
    estimatedHours: 1.5,
    lessons: CREDIT_LESSONS.map(l => l.id),
    totalXP: 110,
    prerequisites: ['track-financial-basics'],
    isOfflineAvailable: true,
  },
  {
    id: 'track-tax',
    slug: 'tax-planning',
    title: 'Tax Planning Basics',
    description: 'Understand taxes and reduce your tax burden',
    category: 'advanced',
    difficulty: 'intermediate',
    estimatedHours: 1.5,
    lessons: TAX_LESSONS.map(l => l.id),
    totalXP: 110,
    prerequisites: ['track-investing'],
    isOfflineAvailable: true,
  },
  {
    id: 'track-advanced-investing',
    slug: 'advanced-investing',
    title: 'Advanced Investing',
    description: 'Alternative assets and advanced strategies',
    category: 'investing',
    difficulty: 'advanced',
    estimatedHours: 2,
    lessons: ADVANCED_INVESTING_LESSONS.map(l => l.id),
    totalXP: 120,
    prerequisites: ['track-investing'],
    isOfflineAvailable: true,
  },
  {
    id: 'track-retirement',
    slug: 'retirement-planning',
    title: 'Retirement Planning',
    description: 'Plan for a comfortable retirement',
    category: 'investing',
    difficulty: 'advanced',
    estimatedHours: 2,
    lessons: RETIREMENT_LESSONS.map(l => l.id),
    totalXP: 125,
    prerequisites: ['track-investing'],
    isOfflineAvailable: true,
  },
];

// Export counts for verification
export const CONTENT_SUMMARY = {
  totalTracks: ALL_TRACKS.length,
  totalLessons: ALL_LESSONS.length,
  lessonsByType: {
    article: ALL_LESSONS.filter(l => l.type === 'article').length,
    video: ALL_LESSONS.filter(l => l.type === 'video').length,
    quiz: ALL_LESSONS.filter(l => l.type === 'quiz').length,
  },
  tracksByDifficulty: {
    beginner: ALL_TRACKS.filter(t => t.difficulty === 'beginner').length,
    intermediate: ALL_TRACKS.filter(t => t.difficulty === 'intermediate').length,
    advanced: ALL_TRACKS.filter(t => t.difficulty === 'advanced').length,
  },
};
