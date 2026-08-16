import type { ReactNode } from 'react';
import { X, ExternalLink, Users, Linkedin, Sparkles } from 'lucide-react';

export function DocLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="text-sky-700 inline-flex items-center gap-0.5 hover:underline"
    >
      {children}
      <ExternalLink className="w-3 h-3" />
    </a>
  );
}

export function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="rounded-xl bg-gray-50 border border-gray-100 px-3 py-2 text-[11px] font-mono text-gray-800 overflow-x-auto whitespace-pre-wrap break-all">
      {children}
    </pre>
  );
}

function Section({ n, title, children }: { n: number; title: string; children: ReactNode }) {
  return (
    <section className="space-y-2">
      <h3 className="text-sm font-semibold text-gray-900">
        {n}. {title}
      </h3>
      <div className="text-xs text-gray-600 leading-relaxed space-y-2">{children}</div>
    </section>
  );
}

function HelpShell({
  open,
  onClose,
  title,
  subtitle,
  wide,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  wide?: boolean;
  children: ReactNode;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div
        className={`bg-white rounded-2xl shadow-xl w-full ${wide ? 'max-w-2xl' : 'max-w-lg'} max-h-[85dvh] flex flex-col`}
      >
        <div className="flex items-start justify-between gap-3 p-6 pb-3 shrink-0 border-b border-gray-100">
          <div>
            <h2 className="font-semibold text-gray-900">{title}</h2>
            {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
          </div>
          <button type="button" onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 pt-4 overflow-y-auto space-y-5 text-sm text-gray-700">{children}</div>
        <div className="p-4 border-t border-gray-100 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-xl bg-gray-900 text-white font-semibold"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}

export function CommunityGuideContent() {
  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-500 leading-relaxed">
        Paste a Community developer key so posts publish under that Community profile. Community
        issues the key — not Social Deck.
      </p>
      <ol className="list-decimal pl-4 space-y-2 text-xs text-gray-600 leading-relaxed">
        <li>
          Sign in to <DocLink href="https://community.timetofuture.com">Community</DocLink> with the
          account that should own published posts.
        </li>
        <li>
          Open{' '}
          <DocLink href="https://community.timetofuture.com/developer">
            Community → Developer
          </DocLink>
          .
        </li>
        <li>
          Create a developer key (<code className="text-purple-700">cm_...</code>).
        </li>
        <li>
          In Social Deck → Connections, click Connect on Community and paste the key.
        </li>
        <li>In Compose, select the Community connection when publishing.</li>
      </ol>
    </div>
  );
}

export function AiGuideContent() {
  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-500 leading-relaxed">
        Your OpenAI key is used only to draft posts — billing stays on your OpenAI account.
      </p>
      <ol className="list-decimal pl-4 space-y-2 text-xs text-gray-600 leading-relaxed">
        <li>
          Create an API key at{' '}
          <DocLink href="https://platform.openai.com/api-keys">platform.openai.com</DocLink>.
        </li>
        <li>
          In Connections, click Connect on AI Assistant and paste the key (
          <code className="text-purple-700">sk-...</code>).
        </li>
        <li>
          Fill the <strong className="font-semibold text-gray-800">AI briefing</strong> on{' '}
          <strong className="font-semibold text-gray-800">Auto Run</strong> — who you are, topics,
          instructions, and image style (used for Compose and Auto Run).
        </li>
        <li>
          In Compose, enter a prompt, optionally enable <strong>Also generate an image</strong>,
          select platforms, generate a draft, then publish.
        </li>
        <li>
          Optional: use Auto Run to generate and publish on a schedule once AI + platforms are
          connected. Turn on image generation in the briefing if you want images on auto posts.
        </li>
      </ol>
    </div>
  );
}

export function LinkedInGuideContent() {
  return (
    <div className="space-y-5">
      <div className="flex items-start gap-2 text-sky-800 bg-sky-50 rounded-xl px-3 py-2 text-xs">
        <Linkedin className="w-4 h-4 shrink-0 mt-0.5" />
        <span>
          End users only need to click <strong>Connect</strong> on LinkedIn. The steps below are for
          configuring the LinkedIn Developer App and backend environment (operators).
        </span>
      </div>

      <Section n={1} title="Create LinkedIn Developer App">
        <p>
          Go to <DocLink href="https://www.linkedin.com/developers/">linkedin.com/developers</DocLink>
        </p>
        <ol className="list-decimal pl-4 space-y-1">
          <li>Sign in with LinkedIn.</li>
          <li>
            Go to <strong>My Apps</strong>.
          </li>
          <li>
            Click <strong>Create App</strong>.
          </li>
          <li>
            Enter App Name: <code className="text-sky-800">Time To Future</code>, LinkedIn Page, and
            App Logo.
          </li>
          <li>Create the application.</li>
          <li>
            Copy the <strong>Client ID</strong> and <strong>Client Secret</strong>.
          </li>
        </ol>
      </Section>

      <Section n={2} title="Enable Required Products">
        <p>
          Open <strong>My Apps → Time To Future → Products</strong> and enable:
        </p>
        <div className="grid sm:grid-cols-2 gap-2">
          <div className="rounded-xl border border-gray-100 p-3 space-y-1">
            <p className="font-semibold text-gray-800 text-xs">
              Sign In with LinkedIn using OpenID Connect
            </p>
            <CodeBlock>{`openid
profile
email`}</CodeBlock>
          </div>
          <div className="rounded-xl border border-gray-100 p-3 space-y-1">
            <p className="font-semibold text-gray-800 text-xs">Share on LinkedIn</p>
            <CodeBlock>w_member_social</CodeBlock>
          </div>
        </div>
        <p>Both products are required to authenticate users and publish posts.</p>
      </Section>

      <Section n={3} title="Configure Redirect URLs">
        <p>
          Go to <strong>Time To Future → Auth</strong>. Under Authorized redirect URLs, add:
        </p>
        <p className="font-medium text-gray-800">Production</p>
        <CodeBlock>
          https://api.timetofuture.com/api/social-deck/connections/linkedin/callback
        </CodeBlock>
        <p className="font-medium text-gray-800">Local development</p>
        <CodeBlock>
          http://localhost:5001/api/social-deck/connections/linkedin/callback
        </CodeBlock>
        <p className="text-amber-800 bg-amber-50 rounded-lg px-2 py-1.5">
          The <code>redirect_uri</code> in the OAuth request must exactly match one of these URLs.
        </p>
      </Section>

      <Section n={4} title="Configure Environment Variables">
        <p className="font-medium text-gray-800">Local</p>
        <CodeBlock>{`LINKEDIN_CLIENT_ID=your_client_id
LINKEDIN_CLIENT_SECRET=your_client_secret
LINKEDIN_REDIRECT_URI=http://localhost:5001/api/social-deck/connections/linkedin/callback`}</CodeBlock>
        <p className="font-medium text-gray-800">Production</p>
        <CodeBlock>{`LINKEDIN_CLIENT_ID=your_client_id
LINKEDIN_CLIENT_SECRET=your_client_secret
LINKEDIN_REDIRECT_URI=https://api.timetofuture.com/api/social-deck/connections/linkedin/callback`}</CodeBlock>
        <p className="text-amber-800 bg-amber-50 rounded-lg px-2 py-1.5">
          Never expose <code>LINKEDIN_CLIENT_SECRET</code> in frontend code.
        </p>
      </Section>

      <Section n={5} title="Configure OAuth Scopes">
        <p>For LinkedIn login + profile + publishing:</p>
        <CodeBlock>openid profile email w_member_social</CodeBlock>
        <p>
          Spell the publishing scope exactly <code className="text-sky-800">w_member_social</code>{' '}
          (not <code className="text-red-600">w_nnember_social</code>).
        </p>
      </Section>

      <Section n={6} title="OAuth Flow">
        <CodeBlock>{`Your App
    ↓
LinkedIn Authorization
    ↓
User Login
    ↓
User Grants Permission
    ↓
LinkedIn redirects to callback
    ↓
Your Backend receives authorization code
    ↓
Exchange authorization code for access token
    ↓
Store access token securely
    ↓
Use LinkedIn API`}</CodeBlock>
      </Section>

      <Section n={7} title="Authorization URL">
        <CodeBlock>https://www.linkedin.com/oauth/v2/authorization</CodeBlock>
        <p>Required parameters:</p>
        <CodeBlock>{`response_type=code
client_id=YOUR_CLIENT_ID
redirect_uri=YOUR_REDIRECT_URI
scope=openid profile email w_member_social`}</CodeBlock>
        <p>Use proper URL encoding when generating the authorization URL.</p>
      </Section>

      <Section n={8} title="Callback">
        <p>After successful authorization, LinkedIn redirects to:</p>
        <CodeBlock>
          https://api.timetofuture.com/api/social-deck/connections/linkedin/callback?code=XXXXX
        </CodeBlock>
        <p>The backend should:</p>
        <ol className="list-decimal pl-4 space-y-1">
          <li>
            Read the <code>code</code> from the query parameters.
          </li>
          <li>Exchange the code with LinkedIn&apos;s token endpoint.</li>
          <li>Receive the access token.</li>
          <li>Store the token securely.</li>
          <li>Associate the LinkedIn account with the application user.</li>
        </ol>
      </Section>

      <Section n={9} title="Products and Scopes">
        <div className="overflow-x-auto rounded-xl border border-gray-100">
          <table className="w-full text-left text-[11px]">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-3 py-2 font-semibold">LinkedIn Product</th>
                <th className="px-3 py-2 font-semibold">Scope</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-gray-100">
                <td className="px-3 py-2">Sign In with LinkedIn using OpenID Connect</td>
                <td className="px-3 py-2 font-mono">openid</td>
              </tr>
              <tr className="border-t border-gray-100">
                <td className="px-3 py-2">Sign In with LinkedIn using OpenID Connect</td>
                <td className="px-3 py-2 font-mono">profile</td>
              </tr>
              <tr className="border-t border-gray-100">
                <td className="px-3 py-2">Sign In with LinkedIn using OpenID Connect</td>
                <td className="px-3 py-2 font-mono">email</td>
              </tr>
              <tr className="border-t border-gray-100">
                <td className="px-3 py-2">Share on LinkedIn</td>
                <td className="px-3 py-2 font-mono">w_member_social</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Section>

      <Section n={10} title="Final Checklist">
        <ul className="space-y-1 font-mono text-[11px] bg-gray-50 border border-gray-100 rounded-xl px-3 py-2">
          {[
            'LinkedIn Developer App created',
            'Client ID obtained',
            'Client Secret obtained',
            'Sign In with LinkedIn using OpenID Connect enabled',
            'Share on LinkedIn enabled',
            'openid / profile / email scopes enabled',
            'w_member_social scope enabled',
            'Local redirect URL added',
            'Production redirect URL added',
            'Backend environment variables configured',
            'OAuth authorization flow tested',
            'Authorization code exchanged for access token',
            'Access token stored securely',
            'LinkedIn API publishing tested',
          ].map((item) => (
            <li key={item}>☑ {item}</li>
          ))}
        </ul>
      </Section>

      <Section n={11} title="Connect as an end user">
        <ol className="list-decimal pl-4 space-y-1">
          <li>Open Social Deck → Connections.</li>
          <li>
            Click <strong>Connect</strong> on LinkedIn.
          </li>
          <li>Approve permissions on LinkedIn&apos;s consent screen.</li>
          <li>You&apos;ll return to Connections with LinkedIn linked to your profile.</li>
        </ol>
      </Section>

      <Section n={12} title="Official Documentation">
        <ul className="space-y-1.5">
          <li>
            <DocLink href="https://www.linkedin.com/developers/">LinkedIn Developer Portal</DocLink>
          </li>
          <li>
            <DocLink href="https://learn.microsoft.com/en-us/linkedin/shared/authentication/authorization-code-flow">
              OAuth Authorization Code Flow
            </DocLink>
          </li>
          <li>
            <DocLink href="https://learn.microsoft.com/en-us/linkedin/shared/authentication/oidc">
              Sign In with OpenID Connect
            </DocLink>
          </li>
          <li>
            <DocLink href="https://learn.microsoft.com/en-us/linkedin/consumer/integrations/self-serve/share-on-linkedin">
              Share on LinkedIn
            </DocLink>
          </li>
        </ul>
      </Section>
    </div>
  );
}

export function CommunityHelpModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <HelpShell
      open={open}
      onClose={onClose}
      title="Connect Community"
      subtitle="Paste a Community developer key so posts publish under that profile."
    >
      <div className="flex gap-3">
        <span className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
          <Users className="w-4 h-4" />
        </span>
        <CommunityGuideContent />
      </div>
    </HelpShell>
  );
}

export function AiHelpModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <HelpShell
      open={open}
      onClose={onClose}
      title="Connect AI"
      subtitle="Your OpenAI key is used only to draft posts — billing stays on your OpenAI account."
    >
      <div className="flex gap-3">
        <span className="w-8 h-8 rounded-lg bg-violet-100 text-violet-600 flex items-center justify-center shrink-0">
          <Sparkles className="w-4 h-4" />
        </span>
        <AiGuideContent />
      </div>
    </HelpShell>
  );
}

export function LinkedInHelpModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <HelpShell
      open={open}
      onClose={onClose}
      wide
      title="LinkedIn OAuth 2.0 Setup"
      subtitle="Time To Future — developer app configuration for Social Deck"
    >
      <LinkedInGuideContent />
    </HelpShell>
  );
}
