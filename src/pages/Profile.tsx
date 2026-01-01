/**
 * Profile Page
 *
 * Simple user profile page with:
 * - User info display
 * - Display name editing
 * - Sign out functionality
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Calendar,
  Loader2,
  LogOut,
  Save,
  Camera,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/i18n';
import { Header } from '@/components/shared/Header';

export default function Profile() {
  const { t } = useI18n();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, isLoading: authLoading, signOut, updateProfile } = useAuth();

  const [displayName, setDisplayName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  // Initialize display name from user metadata
  useEffect(() => {
    if (user) {
      setDisplayName(
        user.user_metadata?.display_name ||
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          ''
      );
    }
  }, [user]);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    const { error } = await updateProfile({ displayName });
    setIsSaving(false);

    if (error) {
      toast({
        title: t.common.error,
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: t.common.success,
        description: t.profile.updateSuccess,
      });
    }
  };

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: t.common.success,
      description: t.profile.signOutSuccess,
    });
    navigate('/');
  };

  if (authLoading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <Loader2 className='w-8 h-8 animate-spin text-primary' />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const userEmail = user.email || '';
  const avatarUrl =
    user.user_metadata?.avatar_url || user.user_metadata?.picture;
  const createdAt = new Date(user.created_at).toLocaleDateString();
  const isEmailConfirmed = user.email_confirmed_at !== null;
  const provider = user.app_metadata?.provider || 'email';

  const getInitials = () => {
    if (displayName) {
      return displayName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return userEmail.slice(0, 2).toUpperCase();
  };

  return (
    <div className='min-h-screen pb-10'>
      <Header />
      <div className='container mx-auto pt-24 px-4'>
        <div className='max-w-2xl mx-auto space-y-6'>
          {/* Profile Header */}
          <Card className='glass-card gradient-border'>
            <CardHeader className='text-center pb-2'>
              <div className='flex justify-center mb-4'>
                <Avatar className='w-24 h-24'>
                  <AvatarImage src={avatarUrl} alt={displayName || userEmail} />
                  <AvatarFallback className='text-2xl bg-gradient-to-br from-primary to-accent text-primary-foreground'>
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
              </div>
              <CardTitle className='text-2xl'>
                {displayName || t.profile.noName}
              </CardTitle>
              <CardDescription className='flex items-center justify-center gap-2'>
                <Mail className='w-4 h-4' />
                {userEmail}
                {isEmailConfirmed && (
                  <span className='text-xs bg-green-500/20 text-green-500 px-2 py-0.5 rounded-full'>
                    {t.profile.verified}
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className='pt-4'>
              <div className='flex items-center justify-center gap-4 text-sm text-muted-foreground'>
                <div className='flex items-center gap-1'>
                  <Calendar className='w-4 h-4' />
                  {t.profile.memberSince} {createdAt}
                </div>
                <span>•</span>
                <div className='capitalize'>
                  {provider === 'google' ? 'Google' : t.profile.emailProvider}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Edit Profile */}
          <Card className='glass-card gradient-border'>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <User className='w-5 h-5' />
                {t.profile.editProfile}
              </CardTitle>
              <CardDescription>{t.profile.editDescription}</CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='space-y-2'>
                <Label htmlFor='displayName'>{t.profile.displayName}</Label>
                <Input
                  id='displayName'
                  placeholder={t.profile.displayNamePlaceholder}
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  disabled={isSaving}
                />
              </div>

              <div className='space-y-2'>
                <Label>{t.auth.email}</Label>
                <Input value={userEmail} disabled className='opacity-60' />
                <p className='text-xs text-muted-foreground'>
                  {t.profile.emailCannotChange}
                </p>
              </div>

              <Button
                onClick={handleSaveProfile}
                disabled={isSaving}
                className='w-full gap-2'
              >
                {isSaving ? (
                  <Loader2 className='w-4 h-4 animate-spin' />
                ) : (
                  <Save className='w-4 h-4' />
                )}
                {t.profile.saveChanges}
              </Button>
            </CardContent>
          </Card>

          {/* Sign Out */}
          <Card className='glass-card border-destructive/30'>
            <CardContent className='pt-6'>
              <Button
                variant='destructive'
                onClick={handleSignOut}
                className='w-full gap-2'
              >
                <LogOut className='w-4 h-4' />
                {t.auth.signOut}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
