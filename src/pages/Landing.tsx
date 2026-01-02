import { Link } from 'react-router-dom';
import {
  Monitor,
  Mic,
  Camera,
  Settings,
  ArrowRight,
  Play,
  Mail,
  Github,
  Linkedin,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/i18n';
import { Header } from '@/components/shared/Header';

const features = [
  { icon: Monitor, key: 'screen' as const },
  { icon: Mic, key: 'audio' as const },
  { icon: Camera, key: 'webcam' as const },
  { icon: Settings, key: 'controls' as const },
];

export default function Landing() {
  const { t } = useI18n();

  return (
    <div className='min-h-screen'>
      <Header />

      {/* Hero Section */}
      <section className='pt-32 pb-20 px-4 relative overflow-hidden'>
        {/* Background effects */}
        <div className='absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl' />
        <div className='absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl' />

        <div className='container mx-auto text-center relative z-10'>
          <div className='inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-8 animate-fade-in'>
            <Play className='w-4 h-4 text-primary' />
            <span className='text-sm text-muted-foreground'>
              {t.landing.badge}
            </span>
          </div>

          <h1 className='text-5xl md:text-7xl font-bold mb-6 animate-fade-in-up'>
            {t.landing.headline}
            <br />
            <span className='gradient-text'>{t.landing.headlineHighlight}</span>
          </h1>

          <p
            className='text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-in-up'
            style={{ animationDelay: '0.1s' }}
          >
            {t.landing.description}
          </p>

          <div
            className='flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up'
            style={{ animationDelay: '0.2s' }}
          >
            <Button
              asChild
              size='lg'
              className='bg-gradient-to-r from-primary to-accent hover:opacity-90 glow-primary text-lg px-8'
            >
              <Link to='/recorder' className='gap-2'>
                {t.landing.cta}
                <ArrowRight className='w-5 h-5' />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className='py-20 px-4'>
        <div className='container mx-auto'>
          <div className='text-center mb-16'>
            <h2 className='text-3xl md:text-4xl font-bold mb-4'>
              {t.landing.features.title}
            </h2>
            <p className='text-muted-foreground text-lg'>
              {t.landing.features.subtitle}
            </p>
          </div>

          <div className='grid md:grid-cols-2 lg:grid-cols-4 gap-6'>
            {features.map(({ icon: Icon, key }, index) => (
              <div
                key={key}
                className='glass-card gradient-border p-6 rounded-2xl hover:scale-105 transition-transform duration-300 animate-fade-in-up'
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className='w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-4'>
                  <Icon className='w-6 h-6 text-primary-foreground' />
                </div>
                <h3 className='text-xl font-semibold mb-2'>
                  {t.landing.features[key].title}
                </h3>
                <p className='text-muted-foreground'>
                  {t.landing.features[key].description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className='py-20 px-4'>
        <div className='container mx-auto'>
          <div className='glass-card gradient-border rounded-3xl p-12 text-center relative overflow-hidden'>
            <div className='absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10' />
            <div className='relative z-10'>
              <h2 className='text-3xl md:text-4xl font-bold mb-6'>
                {t.landing.ctaSection.title}
              </h2>
              <Button
                asChild
                size='lg'
                className='bg-gradient-to-r from-primary to-accent hover:opacity-90 text-lg px-8'
              >
                <Link to='/recorder' className='gap-2'>
                  {t.landing.cta}
                  <ArrowRight className='w-5 h-5' />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className='py-12 px-4 border-t border-border/50'>
        <div className='container mx-auto'>
          <div className='flex flex-col md:flex-row items-center justify-between gap-6'>
            <div className='text-center md:text-start'>
              <h3 className='text-xl font-bold gradient-text mb-2'>GoRec</h3>
              <p className='text-sm text-muted-foreground'>
                {t.landing.footer.madeBy} abdelkaderbz
              </p>
            </div>

            <div className='flex items-center gap-4'>
              <a
                href='mailto:abdelkader.bouzomita@gmail.com'
                className='flex items-center gap-2 px-4 py-2 rounded-lg glass-card hover:bg-primary/10 transition-colors'
                title='Email'
              >
                <Mail className='w-5 h-5 text-primary' />
                <span className='text-sm hidden sm:inline'>
                  abdelkader.bouzomita@gmail.com
                </span>
              </a>
              <a
                href='https://github.com/Abdelkaderbzz'
                target='_blank'
                rel='noopener noreferrer'
                className='p-3 rounded-lg glass-card hover:bg-primary/10 transition-colors'
                title='GitHub'
              >
                <Github className='w-5 h-5' />
              </a>
              <a
                href='https://www.linkedin.com/in/abdelkader-bouzomita/'
                target='_blank'
                rel='noopener noreferrer'
                className='p-3 rounded-lg glass-card hover:bg-primary/10 transition-colors'
                title='LinkedIn'
              >
                <Linkedin className='w-5 h-5' />
              </a>
            </div>
          </div>

          <div className='mt-8 pt-6 border-t border-border/30 text-center'>
            <p className='text-sm text-muted-foreground'>
              © {new Date().getFullYear()} GoRec. {t.landing.footer.rights}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
