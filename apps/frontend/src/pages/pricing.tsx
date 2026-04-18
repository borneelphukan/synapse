import { useState } from 'react';
import { 
  Icon, 
} from '@synapse/ui';
import { api } from '@/shared/api';
import { useRouter } from 'next/router';

const plans = [
  {
    title: 'Free',
    price: '€0',
    frequency: '/month',
    features: [
      '3 transcript analysis / day',
      'Max 3,000 words per transcript',
      'Basic participant identification',
      'Standard decision extraction',
    ],
    buttonText: 'Current Plan',
    active: false,
  },
  {
    title: 'Basic',
    price: '€10',
    frequency: '/month',
    features: [
      '10 transcript analysis / day',
      'Max 15,000 words per transcript',
      'Advanced relationship mapping',
      'Priority processing',
    ],
    buttonText: 'Upgrade to Basic',
    active: true, // Highlights the popular plan
  },
  {
    title: 'Pro',
    price: '€50',
    frequency: '/month',
    features: [
      'Unlimited analysis / day',
      'Max 100,000 words per transcript',
      'Export to high-res PNG & PDF',
      'Premium 24/7 support',
    ],
    buttonText: 'Upgrade to Pro',
    active: false,
  },
];

export const PricingPage = () => {
  const router = useRouter();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [activePlan, setActivePlan] = useState<string>('Basic');

  const handleUpgradeClick = async (plan: typeof plans[0]) => {
    if (plan.title === 'Free') {
      router.push('/');
      return;
    }

    setLoadingPlan(plan.title);
    try {
      const planKey = plan.title.toUpperCase() as 'BASIC' | 'PRO';
      const result = await api.createCheckoutSession(planKey);
      
      if (result.url) {
        window.location.href = result.url;
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Checkout failed');
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-200">
      
      <div className="flex-1 w-full px-6 py-6 relative">
        {/* Back Button */}
        <button 
          onClick={() => router.push('/')}
          className="group relative flex items-center gap-2 text-slate-500 hover:text-gray-400 transition-colors"
        >
            <Icon type="arrow_back"/>
        </button>

        {/* Decorative background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute top-1/4 -right-40 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 -left-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-500 mt-8">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-sky-400 to-indigo-400 bg-clip-text text-transparent mb-4 tracking-tight">
            Simple and transparent pricing
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Choose the plan that fits your transcript volume. Upgrade anytime as your project grows.
          </p>
        </div>

        <div className="relative z-10 grid md:grid-cols-3 gap-8 items-stretch max-w-5xl mx-auto">
          {plans.map((plan, i) => {
            const isActive = activePlan === plan.title;
            return (
              <div 
                key={plan.title} 
                onClick={() => setActivePlan(plan.title)}
                className={`relative rounded-3xl p-8 flex flex-col transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 zoom-in-95 cursor-pointer border ${isActive ? 'bg-slate-900 border-sky-500 shadow-2xl shadow-sky-900/20 scale-105 z-10' : 'bg-slate-100 border-slate-800 backdrop-blur-sm opacity-60 hover:opacity-100'}`}
                style={{ animationDelay: `${i * 150}ms` }}
              >
                {isActive && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-sky-500 text-white text-xs font-bold uppercase tracking-widest rounded-full shadow-lg shadow-sky-500/20">
                    {plan.title === 'Basic' ? 'Most Popular' : 'Selected'}
                  </div>
                )}
                
                <h3 className={`text-xl font-semibold mb-2 text-slate-500`}>{plan.title}</h3>
                <div className="mb-6 flex items-baseline gap-1">
                  <span className={`text-4xl font-bold tracking-tight`}>{plan.price}</span>
                  <span className="text-sm">{plan.frequency}</span>
                </div>
                
                <ul className="space-y-4 mb-8 flex-1">
                  {plan.features.map(feature => (
                    <li key={feature} className="flex items-start gap-3">
                      <Icon type="check_circle" className="!text-[20px] text-sky-400 shrink-0" />
                      <span className={`text-slate-400 text-sm`}>{feature}</span>
                    </li>
                  ))}
                </ul>
                
                {/* Pricing card pay button */}
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUpgradeClick(plan);
                  }}
                  disabled={loadingPlan === plan.title}
                  className={`w-full py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-75 ${isActive ? 'bg-gradient-to-r from-sky-400 to-indigo-500 text-white hover:from-sky-500 hover:to-indigo-600 shadow-lg shadow-sky-500/20' : 'bg-slate-500 text-slate-300 hover:bg-slate-700 hover:text-white'}`}
                >
                  {loadingPlan === plan.title ? (
                    <>
                      <Icon type="sync" className="animate-spin !text-[18px]" /> Processing...
                    </>
                  ) : (
                    plan.buttonText
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PricingPage;
