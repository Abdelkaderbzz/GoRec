import { Link } from 'react-router-dom';
import { Globe, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useI18n } from '@/i18n';
import { useAuth } from '@/contexts/AuthContext';

export function Header() {
  const { language, setLanguage, t } = useI18n();
  const { user, signOut } = useAuth();

  const userEmail = user?.email || '';
  const displayName =
    user?.user_metadata?.display_name || user?.user_metadata?.full_name || '';
  const avatarUrl =
    user?.user_metadata?.avatar_url || user?.user_metadata?.picture;

  const getInitials = () => {
    if (displayName) {
      return displayName
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return userEmail.slice(0, 2).toUpperCase();
  };

  return (
    <header className='fixed top-0 left-0 right-0 z-50 glass-card border-b border-border/50'>
      <div className='container mx-auto px-4 h-16 flex items-center justify-between'>
        <Link to='/' className='flex items-center gap-2'>
          <img
            src='/favicon.png'
            alt='ScreenRec'
            className='w-8 h-8 rounded-lg'
          />
          <span className='font-bold text-lg gradient-text'>ScreenRec</span>
        </Link>

        <nav className='flex items-center gap-4'>
          <Link
            to='/'
            className='text-sm text-muted-foreground hover:text-foreground transition-colors'
          >
            {t.nav.home}
          </Link>
          <Link
            to='/recorder'
            className='text-sm text-muted-foreground hover:text-foreground transition-colors'
          >
            {t.nav.recorder}
          </Link>

          <Button
            variant='ghost'
            size='sm'
            onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
            className='gap-2'
          >
            <Globe className='w-4 h-4' />
            {language === 'en' ? 'العربية' : 'English'}
          </Button>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='ghost' size='sm' className='gap-2 px-2'>
                  <Avatar className='w-7 h-7'>
                    <AvatarImage
                      src={avatarUrl}
                      alt={displayName || userEmail}
                    />
                    <AvatarFallback className='text-xs bg-gradient-to-br from-primary to-accent text-primary-foreground'>
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <span className='hidden sm:inline text-sm max-w-[100px] truncate'>
                    {displayName || userEmail.split('@')[0]}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end' className='w-48'>
                <DropdownMenuItem asChild>
                  <Link to='/profile' className='gap-2 cursor-pointer'>
                    <User className='w-4 h-4' />
                    {t.profile.title}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => signOut()}
                  className='gap-2 cursor-pointer text-destructive focus:text-destructive'
                >
                  <LogOut className='w-4 h-4' />
                  {t.auth.signOut}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              asChild
              size='sm'
              className='bg-gradient-to-r from-primary to-accent hover:opacity-90'
            >
              <Link to='/auth'>{t.nav.getStarted}</Link>
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}
