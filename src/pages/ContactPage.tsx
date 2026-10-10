import { Mail, Phone, MapPin, MessageCircle, Clock } from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';
import { getWhatsAppUrl } from '@/lib/utils';

export default function ContactPage() {
  const { settings } = useSettings();

  const contactInfo = [
    { icon: Phone, label: 'Phone', value: settings?.contact_phone || '' },
    { icon: Mail, label: 'Email', value: settings?.contact_email || '' },
    { icon: MapPin, label: 'Address', value: settings?.address || '' },
    { icon: Clock, label: 'Hours', value: 'Mon - Sat, 9:00 AM - 7:00 PM' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <span className="text-xs uppercase tracking-widest text-primary-600 font-semibold">Get in Touch</span>
        <h1 className="font-serif text-4xl font-bold text-gray-900 mt-2">Contact Us</h1>
        <p className="text-gray-500 mt-3 max-w-xl mx-auto">
          Have a question about our plants or your order? We are here to help. Reach out and we will get back to you soon.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Contact info */}
        <div className="space-y-4">
          {contactInfo.map((info) => (
            <div key={info.label} className="flex items-start gap-4 bg-white rounded-2xl p-5 border border-gray-100">
              <div className="w-11 h-11 rounded-full bg-primary-100 flex items-center justify-center shrink-0">
                <info.icon className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">{info.label}</h3>
                <p className="text-sm text-gray-500 mt-0.5">{info.value}</p>
              </div>
            </div>
          ))}

          <a
            href={getWhatsAppUrl(settings?.whatsapp_number || '919999999999', 'Hello! I have a question about your plants.')}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3.5 bg-[#25D366] text-white rounded-xl font-medium hover:bg-[#1da851] transition-colors"
          >
            <MessageCircle className="w-5 h-5" /> Chat on WhatsApp
          </a>
        </div>

        {/* Map / Image */}
        <div className="rounded-2xl overflow-hidden h-full min-h-[300px] relative">
          <img
            src="https://images.pexels.com/photos/7424239/pexels-photo-7424239.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
            alt="Nursery"
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
            <h3 className="text-white font-serif text-xl font-semibold">Visit Our Nursery</h3>
            <p className="text-white/80 text-sm mt-1">{settings?.address}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
