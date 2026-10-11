import { Shield, FileText, Truck, RefreshCw } from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';

type PolicyType = 'privacy' | 'terms' | 'shipping' | 'returns';

const policyConfig: Record<PolicyType, { title: string; icon: any; field: keyof NonNullable<ReturnType<typeof useSettings>['settings']>; default: string }> = {
  privacy: { title: 'Privacy Policy', icon: Shield, field: 'privacy_policy', default: 'We respect your privacy and are committed to protecting your personal data. We only collect information you provide when placing an order (name, phone, address, PIN code). We do not share your data with third parties. We do not store payment card details or UPI information on our website.' },
  terms: { title: 'Terms & Conditions', icon: FileText, field: 'terms_conditions', default: 'By using this website, you agree to these terms. All orders are enquiries and do not constitute a binding contract until confirmed by the store. Prices are subject to change. We reserve the right to refuse or cancel orders. WhatsApp orders require the customer to send the message manually.' },
  shipping: { title: 'Shipping & Delivery Policy', icon: Truck, field: 'shipping_policy', default: 'We deliver plants carefully packaged to ensure they arrive in good condition. Delivery charges are calculated at checkout. Estimated delivery time is 3-7 business days depending on your location. Some PIN codes may not be serviceable. Please check at checkout or contact us via WhatsApp.' },
  returns: { title: 'Return & Refund Policy', icon: RefreshCw, field: 'return_policy', default: 'Plants are living products and returns are handled case-by-case. If your plant arrives damaged, please contact us within 48 hours with photos via WhatsApp. We will arrange a replacement or refund. Refunds are processed through the original payment method or as store credit.' },
};

export default function PolicyPage({ type }: { type: PolicyType }) {
  const { settings } = useSettings();
  const config = policyConfig[type];
  const Icon = config.icon;
  const content = (settings?.[config.field] as string) || config.default;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
          <Icon className="w-6 h-6 text-primary-600" />
        </div>
        <h1 className="font-serif text-3xl font-bold text-gray-900">{config.title}</h1>
      </div>
      <div className="prose prose-lg max-w-none text-gray-600 leading-relaxed whitespace-pre-line">
        {content}
      </div>
      <p className="text-xs text-gray-400 mt-8 pt-6 border-t border-gray-100">Last updated: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
    </div>
  );
}
