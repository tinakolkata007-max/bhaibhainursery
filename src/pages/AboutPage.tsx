import { Leaf, Heart, Sprout, Users } from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';

export default function AboutPage() {
  const { settings } = useSettings();

  const values = [
    { icon: Leaf, title: 'Quality First', desc: 'Every plant is health-checked and carefully packaged before it reaches you.' },
    { icon: Heart, title: 'Passion for Plants', desc: 'We are plant lovers first. We only sell plants we would grow in our own homes.' },
    { icon: Sprout, title: 'Sustainable Practices', desc: 'We use eco-friendly pots and organic growing methods across our nursery.' },
    { icon: Users, title: 'Community Driven', desc: 'We help our customers succeed with plant care tips and ongoing support.' },
  ];

  return (
    <div>
      {/* Hero */}
      <section className="relative h-[50vh] min-h-[400px] overflow-hidden">
        <img
          src="https://images.pexels.com/photos/4505166/pexels-photo-4505166.jpeg?auto=compress&cs=tinysrgb&h=1200&w=1920"
          alt="Nursery"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary-950/80 to-primary-900/30" />
        <div className="absolute bottom-0 left-0 right-0 p-8 max-w-7xl mx-auto">
          <span className="text-xs uppercase tracking-widest text-secondary-400 font-semibold">Our Story</span>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-white mt-2">About {settings?.store_name}</h1>
        </div>
      </section>

      {/* Story */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="font-serif text-3xl font-bold text-gray-900 mb-6">Our Journey</h2>
        <div className="prose prose-lg max-w-none text-gray-600 leading-relaxed space-y-4">
          <p>{settings?.about_text}</p>
          <p>
            What started as a small backyard garden has grown into a trusted nursery serving plant enthusiasts
            across the region. We believe that everyone deserves to experience the joy of nurturing a living
            plant, whether it is a hardy snake plant for your desk or a fragrant jasmine for your balcony.
          </p>
          <p>
            Our plants are grown with care, using sustainable practices and organic methods. We hand-pick each
            plant before it ships to ensure you receive only the healthiest, most vibrant specimens. And because
            we want ordering to be simple and personal, we use WhatsApp for all our orders, no complicated
            checkout or payment gateways needed.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="bg-primary-50/50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="text-xs uppercase tracking-widest text-primary-600 font-semibold">What We Stand For</span>
            <h2 className="font-serif text-3xl font-bold text-gray-900 mt-1">Our Values</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v) => (
              <div key={v.title} className="bg-white rounded-2xl p-6 text-center shadow-sm hover:shadow-md transition-shadow">
                <div className="w-14 h-14 rounded-full bg-primary-100 flex items-center justify-center mx-auto mb-4">
                  <v.icon className="w-6 h-6 text-primary-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{v.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { num: '24', label: 'Curated Plants' },
            { num: '5', label: 'Categories' },
            { num: '100%', label: 'Quality Checked' },
            { num: '∞', label: 'Plant Care Support' },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="font-serif text-4xl font-bold text-primary-600">{stat.num}</p>
              <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
