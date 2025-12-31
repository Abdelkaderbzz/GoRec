import { useState } from "react";
import { Copy, Check, Share2, Facebook, MessageCircle, Twitter, Linkedin, Mail, ExternalLink } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from "@/i18n";

// Simple Telegram icon as SVG
const TelegramIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
  </svg>
);

// WhatsApp icon
const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shareUrl: string;
}

export function ShareDialog({ open, onOpenChange, shareUrl }: ShareDialogProps) {
  const { t } = useI18n();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast({
        title: t.common.success,
        description: t.recorder.share.copied,
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: t.common.error,
        description: t.recorder.share.copyFailed,
        variant: "destructive",
      });
    }
  };

  const shareToSocial = (platform: string) => {
    const encodedUrl = encodeURIComponent(shareUrl);
    const text = encodeURIComponent(t.recorder.share.shareText);
    
    const urls: Record<string, string> = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${text}`,
      whatsapp: `https://wa.me/?text=${text}%20${encodedUrl}`,
      telegram: `https://t.me/share/url?url=${encodedUrl}&text=${text}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      email: `mailto:?subject=${text}&body=${t.recorder.share.emailBody}%20${encodedUrl}`,
    };

    if (urls[platform]) {
      window.open(urls[platform], '_blank', 'noopener,noreferrer');
    }
  };

  const openUrl = () => {
    window.open(shareUrl, '_blank', 'noopener,noreferrer');
  };

  const socialButtons = [
    { id: 'whatsapp', Icon: WhatsAppIcon, label: 'WhatsApp', color: 'bg-[#25D366] hover:bg-[#20BD5A]' },
    { id: 'facebook', Icon: Facebook, label: 'Facebook', color: 'bg-[#1877F2] hover:bg-[#166FE5]' },
    { id: 'twitter', Icon: Twitter, label: 'X', color: 'bg-black hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200' },
    { id: 'telegram', Icon: TelegramIcon, label: 'Telegram', color: 'bg-[#0088CC] hover:bg-[#0077B5]' },
    { id: 'linkedin', Icon: Linkedin, label: 'LinkedIn', color: 'bg-[#0A66C2] hover:bg-[#095196]' },
    { id: 'email', Icon: Mail, label: 'Email', color: 'bg-gray-600 hover:bg-gray-700' },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Share2 className="w-5 h-5 text-white" />
            </div>
            {t.recorder.share.title}
          </DialogTitle>
          <DialogDescription className="text-base">
            {t.recorder.share.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-2">
          {/* Copy URL Section */}
          <div className="space-y-2">
            <label className="text-sm font-medium">{t.recorder.share.linkLabel}</label>
            <div className="flex gap-2">
              <Input
                value={shareUrl}
                readOnly
                className="flex-1 text-sm bg-muted/50"
              />
              <Button onClick={copyToClipboard} variant="secondary" className="gap-2 min-w-[100px]">
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-green-500" />
                    {t.recorder.share.copiedBtn}
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    {t.recorder.share.copyBtn}
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Open in new tab */}
          <Button onClick={openUrl} variant="outline" className="w-full gap-2">
            <ExternalLink className="w-4 h-4" />
            {t.recorder.share.openInNewTab}
          </Button>

          {/* Social Share Buttons */}
          <div className="space-y-3">
            <p className="text-sm font-medium">{t.recorder.share.shareVia}</p>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {socialButtons.map((btn) => (
                <Button
                  key={btn.id}
                  onClick={() => shareToSocial(btn.id)}
                  className={`${btn.color} text-white flex flex-col items-center gap-1.5 h-auto py-3 px-2 transition-transform hover:scale-105`}
                  variant="ghost"
                >
                  <btn.Icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{btn.label}</span>
                </Button>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
